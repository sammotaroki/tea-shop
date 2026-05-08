const express = require('express');
const router = express.Router();
const {
  createStripeSession, stripeWebhook, mpesaStkPush, mpesaCallback, mpesaStatus,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validator');
const { paymentLimiter, webhookLimiter } = require('../middleware/rateLimiter');

// Stripe webhook must receive raw body — handled in server.js before JSON parser
router.post('/stripe/webhook', webhookLimiter, express.raw({ type: 'application/json' }), stripeWebhook);

router.post('/stripe/create-session', protect, paymentLimiter, createStripeSession);
router.post('/mpesa/stkpush', protect, paymentLimiter, validate(schemas.mpesa), mpesaStkPush);
router.post('/mpesa/callback', mpesaCallback); // Public — called by Safaricom
router.get('/mpesa/status/:checkoutId', protect, mpesaStatus);

module.exports = router;
