# Chai Heritage — How to Run the Project

## Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Stripe account (for payment testing)
- M-Pesa Daraja API credentials (optional for local dev)

---

## 1. Environment Setup

Copy the example env file and fill in your values:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB — use your Atlas URI or local
MONGODB_URI=mongodb://localhost:27017/chai-heritage

# JWT — generate a strong secret
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d

# Frontend URL (for CORS and Stripe redirects)
CLIENT_URL=http://localhost:5173

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# M-Pesa (Daraja sandbox)
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=174379
MPESA_PASSKEY=...
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/payments/mpesa/callback
```

---

## 2. Install Dependencies

Run from the project root (two separate terminals or use `&&`):

```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install
```

---

## 3. Seed the Database (optional but recommended)

Populates the database with sample products, categories, and an admin user:

```bash
cd server
node seed.js
```

Default admin credentials created by the seed:
- **Email:** `admin@chaiheritage.co.ke`
- **Password:** `Admin@1234`

---

## 4. Start Development Servers

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
Runs on `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
Runs on `http://localhost:5173`

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so no CORS issues in development.

---

## 5. Access the App

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | Customer storefront |
| `http://localhost:5173/admin` | Admin dashboard (requires admin role) |
| `http://localhost:5000/api` | Backend API base |

---

## 6. Testing Payments

### Stripe (test mode)
Use Stripe's test card numbers:
- **Card:** `4242 4242 4242 4242`
- **Expiry:** any future date
- **CVC:** any 3 digits

For webhooks in local dev, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):
```bash
stripe listen --forward-to localhost:5000/api/payments/stripe/webhook
```
The CLI will print a webhook signing secret — put it in `STRIPE_WEBHOOK_SECRET`.

### M-Pesa (sandbox)
Use the Daraja sandbox and a test Safaricom number. The `MPESA_CALLBACK_URL` must be a publicly accessible URL; use [ngrok](https://ngrok.com) for local testing:
```bash
ngrok http 5000
```

---

## 7. Production Build

```bash
# Build frontend
cd client
npm run build
# Output is in client/dist/

# Start backend in production mode
cd server
NODE_ENV=production node server.js
```

In production, the Express server serves the built frontend from `client/dist` (configure your server to serve static files, or use a reverse proxy like nginx).

---

## 8. Project Structure Quick Reference

```
tea-ecommerce/
├── client/          React + Vite frontend
│   └── src/
│       ├── pages/   customer/ and admin/ pages
│       ├── context/ AuthContext, CartContext
│       ├── utils/   api.js (axios instance), helpers.js
│       └── components/
├── server/          Express backend
│   ├── models/      Mongoose models
│   ├── routes/      Express routers
│   ├── controllers/ Route handlers
│   ├── middleware/  auth, validation, error handling
│   ├── utils/       stripe.js, mpesa.js
│   └── seed.js      Database seeder
└── implementation_plan.md
```

---

## Common Issues

**MongoDB connection refused**
Make sure `mongod` is running locally, or update `MONGODB_URI` to your Atlas connection string.

**Port already in use**
Change `PORT` in `server/.env`, then update the Vite proxy in `client/vite.config.js` to match.

**Stripe webhook signature mismatch**
Make sure you're using the webhook secret from `stripe listen` (not the dashboard) when testing locally.

**Images not uploading**
The `server/uploads/` directory must exist. Create it if missing:
```bash
mkdir server/uploads
```
