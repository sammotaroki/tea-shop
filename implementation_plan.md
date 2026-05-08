# Tea Company E-Commerce Platform

A full-stack, production-ready e-commerce platform for a large tea company, featuring a customer-facing storefront, an admin dashboard for product management, dual payment integration (Stripe cards + M-Pesa), shipping options, and hardened backend security.

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React 18 + Vite | Fast builds, modern DX, component-based UI |
| **Styling** | Tailwind CSS v3 | Utility-first, rapid development, custom theme via `tailwind.config.js` |
| **Backend** | Node.js + Express | Robust, battle-tested, excellent ecosystem |
| **Database** | MongoDB + Mongoose | Flexible schema for product catalogs, orders |
| **Auth** | JWT (httpOnly cookies) + bcrypt | Secure, stateless authentication |
| **Card Payments** | Stripe Checkout Sessions | PCI-compliant, hosted checkout |
| **Mobile Money** | Safaricom Daraja API (M-Pesa) | STK Push for seamless mobile payments |
| **File Uploads** | Multer + local storage | Product image management |

---

## User Review Required

> [!IMPORTANT]
> **Payment API Keys Required**: You'll need to provide your own Stripe test keys and Safaricom Daraja API credentials. The app will ship with placeholder `.env.example` files showing the required variables.

> [!IMPORTANT]
> **M-Pesa Region**: M-Pesa integration uses the Safaricom Daraja API (Kenya). If you're targeting a different M-Pesa market (Tanzania, Uganda, etc.), the API endpoints and integration flow may differ slightly.

> [!WARNING]
> **MongoDB Required**: You'll need a MongoDB instance (local or MongoDB Atlas cloud). The app will default to `mongodb://localhost:27017/tea-ecommerce` but can be configured via environment variables.

## Open Questions

1. **Company Name & Branding**: What is the tea company's name? I'll use a placeholder like **"Chai Heritage"** unless you specify otherwise. What color scheme do you prefer? I suggest an earthy, premium palette (deep greens, warm golds, rich browns) to align with tea branding.

2. **Shipping Regions**: Should shipping be domestic only (Kenya), regional (East Africa), or international? This affects shipping cost calculations.

3. **Product Categories**: What tea categories should be pre-loaded? (e.g., Black Tea, Green Tea, Herbal Tea, Chai Blends, Gift Sets, Accessories)

4. **Currency**: Should prices be in KES (Kenyan Shillings), USD, or multi-currency?

---

## Proposed Changes

### Project Structure

```
tea-ecommerce/
├── client/                    # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/            # Images, fonts
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Layout/        # Navbar, Footer, Sidebar
│   │   │   ├── Products/      # ProductCard, ProductGrid
│   │   │   ├── Cart/          # CartItem, CartSummary
│   │   │   ├── Checkout/      # CheckoutForm, PaymentOptions
│   │   │   └── Admin/         # AdminSidebar, DataTable
│   │   ├── pages/             # Route-level pages
│   │   │   ├── customer/      # Home, Shop, Product, Cart, Checkout
│   │   │   └── admin/         # Dashboard, Products, Orders, Settings
│   │   ├── context/           # React Context (Auth, Cart)
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # API client, helpers
│   │   ├── styles/            # Global CSS + Tailwind directives
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js     # Tailwind v3 theme config
│   ├── postcss.config.js      # PostCSS config for Tailwind
│   ├── vite.config.js
│   └── package.json
│
├── server/                    # Express backend
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── security.js        # Security middleware config
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── roleGuard.js       # RBAC middleware
│   │   ├── rateLimiter.js     # Rate limiting configs
│   │   ├── validator.js       # Input validation (Joi)
│   │   └── errorHandler.js    # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Category.js
│   │   └── ShippingOption.js
│   ├── routes/
│   │   ├── auth.js            # Register, login, logout
│   │   ├── products.js        # CRUD products
│   │   ├── categories.js      # CRUD categories
│   │   ├── orders.js          # Order management
│   │   ├── payments.js        # Stripe + M-Pesa
│   │   ├── shipping.js        # Shipping options
│   │   └── admin.js           # Admin-only routes
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   └── shippingController.js
│   ├── utils/
│   │   ├── mpesa.js           # M-Pesa Daraja API helper
│   │   ├── stripe.js          # Stripe helper
│   │   └── email.js           # Order confirmation emails
│   ├── server.js              # Entry point
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

### Component 1: Backend — Security Layer

The backbone of the entire platform. Every route is protected by multiple layers of security middleware.

#### [NEW] server/config/security.js
- **Helmet**: Sets secure HTTP headers (CSP, X-Frame-Options, HSTS, etc.)
- **CORS**: Whitelist only the frontend origin
- **Rate Limiting**: Global limit (100 req/15min), strict auth limit (5 req/15min for login/register)
- **express-mongo-sanitize**: Prevents NoSQL injection
- **hpp**: HTTP parameter pollution protection
- **XSS-clean**: Sanitizes user input to prevent XSS

#### [NEW] server/middleware/auth.js
- JWT token verification from httpOnly cookies
- Token refresh logic
- Extracts user from database for downstream middleware

#### [NEW] server/middleware/roleGuard.js
- Role-Based Access Control (admin, customer)
- Blocks unauthorized access to admin routes

#### [NEW] server/middleware/rateLimiter.js
- Configurable rate limiters for different route groups
- Aggressive limiting on auth endpoints
- Moderate limiting on API endpoints

#### [NEW] server/middleware/validator.js
- Joi schema validation for all request bodies
- Schemas for: registration, login, product creation, order placement, etc.
- Returns structured validation errors

#### [NEW] server/middleware/errorHandler.js
- Global error handler — no stack traces in production
- Structured JSON error responses
- Mongoose validation error formatting

---

### Component 2: Backend — Data Models

#### [NEW] server/models/User.js
- Fields: name, email, password (bcrypt hashed), role (customer/admin), phone, address, createdAt
- Pre-save hook for password hashing
- Instance method: `comparePassword()`

#### [NEW] server/models/Product.js
- Fields: name, description, price, category (ref), images[], stock, weight, origin, brewingInstructions, rating, reviews[], featured, isActive
- Virtual for average rating
- Text index for search

#### [NEW] server/models/Order.js
- Fields: user (ref), items[], shippingAddress, shippingOption (ref), paymentMethod, paymentStatus, paymentId, orderStatus (pending/processing/shipped/delivered/cancelled), totalAmount, mpesaReceiptNumber, trackingNumber, timestamps

#### [NEW] server/models/Category.js
- Fields: name, description, image, slug, isActive

#### [NEW] server/models/ShippingOption.js
- Fields: name, description, price, estimatedDays, regions[], isActive

---

### Component 3: Backend — API Routes & Controllers

#### [NEW] server/routes/auth.js & server/controllers/authController.js
- `POST /api/auth/register` — Register with email validation, password strength check
- `POST /api/auth/login` — Login, returns JWT in httpOnly cookie
- `POST /api/auth/logout` — Clears auth cookie
- `GET /api/auth/me` — Get current user profile
- `PUT /api/auth/profile` — Update profile

#### [NEW] server/routes/products.js & server/controllers/productController.js
- `GET /api/products` — List with pagination, filtering, sorting, search
- `GET /api/products/:id` — Single product detail
- `POST /api/products` — Create (admin only, with image upload via Multer)
- `PUT /api/products/:id` — Update (admin only)
- `DELETE /api/products/:id` — Soft delete (admin only)

#### [NEW] server/routes/payments.js & server/controllers/paymentController.js
- `POST /api/payments/stripe/create-session` — Create Stripe Checkout session
- `POST /api/payments/stripe/webhook` — Handle Stripe webhook events
- `POST /api/payments/mpesa/stkpush` — Initiate M-Pesa STK Push
- `POST /api/payments/mpesa/callback` — M-Pesa payment callback
- `GET /api/payments/mpesa/status/:checkoutId` — Query M-Pesa transaction status

#### [NEW] server/routes/orders.js & server/controllers/orderController.js
- `POST /api/orders` — Place order
- `GET /api/orders` — User's orders / all orders (admin)
- `GET /api/orders/:id` — Order detail
- `PUT /api/orders/:id/status` — Update status (admin only)

#### [NEW] server/routes/shipping.js & server/controllers/shippingController.js
- `GET /api/shipping` — List shipping options
- `POST /api/shipping` — Create (admin)
- `PUT /api/shipping/:id` — Update (admin)
- `DELETE /api/shipping/:id` — Delete (admin)

---

### Component 4: Frontend — Customer Storefront

A premium, visually stunning tea e-commerce experience.

#### [NEW] client/tailwind.config.js
- Custom theme extending Tailwind defaults
- Colors: forest green `#1B4332`, gold `#C9A84C`, cream `#F5F0E8`, espresso `#3E2723`
- Fonts: Inter (sans) + Playfair Display (serif)
- Custom spacing, shadows, border-radius, animations (fade-in, slide-up, scale)
- Dark mode support via `class` strategy

#### [NEW] client/src/styles/index.css
- Tailwind directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`)
- `@layer base` for global typography, scrollbar, selection colors
- `@layer components` for reusable component classes (btn-primary, card, etc.)
- Custom keyframe animations

#### [NEW] Customer Pages
| Page | Features |
|------|----------|
| **Home** | Hero banner with parallax, featured products carousel, category showcase, testimonials, newsletter signup |
| **Shop** | Product grid with filters (category, price range, origin), search, sort, pagination |
| **Product Detail** | Image gallery, brewing instructions, add to cart, reviews, related products |
| **Cart** | Editable quantities, shipping estimate, order summary, proceed to checkout |
| **Checkout** | Shipping address form, shipping option selector, payment method toggle (Card/M-Pesa), order review |
| **Order Confirmation** | Order summary, tracking info, estimated delivery |
| **User Profile** | Order history, saved addresses, account settings |
| **Login / Register** | Secure forms with validation, password strength indicator |

---

### Component 5: Frontend — Admin Dashboard

A clean, data-rich admin panel for business management.

#### [NEW] Admin Pages
| Page | Features |
|------|----------|
| **Dashboard** | Revenue chart, recent orders, stock alerts, key metrics (total sales, orders today, low stock count) |
| **Products** | DataTable with CRUD, bulk actions, image upload, category assignment |
| **Orders** | Order list with status filters, status update, order detail view, export |
| **Categories** | Manage product categories |
| **Shipping** | Manage shipping options and pricing |
| **Settings** | Store settings, admin profile |

---

### Component 6: Payment Integration

#### [NEW] server/utils/stripe.js
- Initialize Stripe with secret key
- Create checkout sessions with line items from order
- Webhook signature verification
- Handle `checkout.session.completed` event

#### [NEW] server/utils/mpesa.js
- OAuth token generation from Daraja API
- STK Push initiation (Lipa Na M-Pesa Online)
- Callback URL handling and validation
- Transaction status query

---

## Security Checklist

| Measure | Implementation |
|---------|---------------|
| **Helmet** | Secure HTTP headers on every response |
| **Rate Limiting** | 100 req/15min global, 5 req/15min on auth |
| **Input Validation** | Joi schemas on all endpoints |
| **NoSQL Injection** | express-mongo-sanitize on all inputs |
| **XSS Prevention** | xss-clean middleware + CSP headers |
| **Password Security** | bcrypt with 12 salt rounds |
| **JWT Security** | httpOnly, Secure, SameSite cookies |
| **CORS** | Strict origin whitelist |
| **HPP** | HTTP parameter pollution protection |
| **Error Handling** | No stack traces in production |
| **File Upload** | Multer with file type/size validation |
| **RBAC** | Role-based route protection |
| **Dependency Audit** | npm audit in CI pipeline |

---

## Verification Plan

### Automated Tests
1. **Backend API**: Test all endpoints using `curl` or Postman-style requests
2. **Security**: Verify headers with `curl -I`, test rate limiting, test auth guards
3. **Build**: Run `npm run build` on client to verify production bundle
4. **Dev Server**: Run both client and server concurrently, verify proxy setup

### Manual Verification
1. **Browser Testing**: Navigate through full customer flow (browse → cart → checkout)
2. **Admin Panel**: Test product CRUD, order management
3. **Payment Flow**: Test Stripe checkout redirect (test mode), M-Pesa STK push simulation
4. **Security**: Attempt unauthorized access to admin routes, verify rate limiting triggers
5. **Responsive**: Test on mobile viewport sizes

---

## Implementation Order

1. ✅ Backend foundation (Express, MongoDB, security middleware)
2. ✅ Data models (User, Product, Order, Category, ShippingOption)
3. ✅ Auth system (register, login, JWT, RBAC)
4. ✅ Product & Category APIs
5. ✅ Order & Shipping APIs
6. ✅ Payment integration (Stripe + M-Pesa)
7. ✅ Frontend design system (CSS variables, global styles)
8. ✅ Customer storefront pages
9. ✅ Cart & Checkout flow
10. ✅ Admin dashboard
11. ✅ Polish, testing, documentation
