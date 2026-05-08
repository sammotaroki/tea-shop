require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const shippingRoutes = require('./routes/shipping');
const paymentRoutes = require('./routes/payments');
const newsletterRoutes = require('./routes/newsletter');

const app = express();

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

// Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));

// CORS — only allow frontend origin
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting on all API routes
app.use('/api', apiLimiter);

// Body parser — limit body size
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL injection
// express-mongo-sanitize is incompatible with Express 5 (tries to reassign req.query which is now
// a getter-only property). This custom middleware does the same job: recursively strips keys that
// start with '$' or contain '.' from req.body, req.params, and req.query.
app.use((req, res, next) => {
  const strip = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (typeof key === 'string' && (key.startsWith('$') || key.includes('.'))) {
        delete obj[key];
      } else {
        strip(obj[key]);
      }
    }
  };
  strip(req.body);
  strip(req.params);
  strip(req.query); // req.query is getter-only in Express 5, but the returned object is mutable
  next();
});

// XSS sanitization — xss-clean 0.1.4 is incompatible with Express 5 (same req.query reassignment
// issue). Inline equivalent using xss-filters (already installed as xss-clean's dependency).
// req.query is intentionally skipped: it's a getter-only property in Express 5, and React's
// automatic HTML escaping already prevents XSS from query params reaching the browser.
const xssFilters = require('xss-filters');
const xssClean = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  try { return JSON.parse(xssFilters.inHTMLData(JSON.stringify(obj))); } catch { return obj; }
};
app.use((req, res, next) => {
  if (req.body)   req.body   = xssClean(req.body);
  if (req.params) req.params = xssClean(req.params);
  next();
});

// Prevent HTTP parameter pollution
app.use(hpp());

// Disable x-powered-by header
app.disable('x-powered-by');

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ==========================================
// STATIC FILES
// ==========================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// API ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Chai Heritage API is running', timestamp: new Date().toISOString() });
});

// ==========================================
// ERROR HANDLING
// ==========================================

// Handle 404 for unmatched routes
app.all('/{*splat}', (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

// Global error handler
app.use(errorHandler);

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n🍵 Chai Heritage Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`   API: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION 💥:', err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION 💥:', err.name, err.message);
  process.exit(1);
});
