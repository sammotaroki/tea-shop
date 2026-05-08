const Order = require('../models/Order');
const { AppError } = require('../middleware/errorHandler');
const { createCheckoutSession, constructWebhookEvent } = require('../utils/stripe');
const { initiateStkPush, queryStkStatus } = require('../utils/mpesa');
const { sendOrderConfirmation } = require('../utils/email');

// @desc    Create Stripe Checkout Session
// @route   POST /api/payments/stripe/create-session
// @access  Private
exports.createStripeSession = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate('user', 'email name');
    if (!order) return next(new AppError('Order not found', 404));

    if (order.user._id.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }

    if (order.paymentStatus === 'paid') {
      return next(new AppError('Order already paid', 400));
    }

    const session = await createCheckoutSession({
      order,
      clientUrl: process.env.CLIENT_URL,
    });

    // Store session ID for webhook matching
    order.stripeSessionId = session.id;
    await order.save();

    res.status(200).json({ success: true, data: { sessionId: session.id, url: session.url } });
  } catch (error) {
    next(error);
  }
};

// @desc    Stripe Webhook (raw body required)
// @route   POST /api/payments/stripe/webhook
// @access  Public (Stripe server)
exports.stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = constructWebhookEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      const order = await Order.findOne({ stripeSessionId: session.id }).populate('user', 'name email');
      if (order) {
        order.paymentStatus = 'paid';
        order.stripePaymentIntentId = session.payment_intent;
        order.paidAt = Date.now();
        order.orderStatus = 'processing';
        order.statusHistory.push({ status: 'processing', note: 'Payment confirmed via Stripe' });
        await order.save();
        if (order.user?.email) sendOrderConfirmation(order.user, order).catch(() => {});
      }
    } catch (err) {
      console.error('Error updating order after Stripe payment:', err);
    }
  }

  res.json({ received: true });
};

// @desc    Initiate M-Pesa STK Push
// @route   POST /api/payments/mpesa/stkpush
// @access  Private
exports.mpesaStkPush = async (req, res, next) => {
  try {
    const { phone, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return next(new AppError('Order not found', 404));

    if (order.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }

    if (order.paymentStatus === 'paid') {
      return next(new AppError('Order already paid', 400));
    }

    const response = await initiateStkPush({
      phone,
      amount: order.totalAmount,
      orderId: order._id,
      description: `Chai Heritage Order ${order.orderNumber}`,
    });

    if (response.ResponseCode === '0') {
      order.mpesaCheckoutRequestId = response.CheckoutRequestID;
      await order.save();

      res.status(200).json({
        success: true,
        message: 'STK Push sent. Please complete payment on your phone.',
        data: { checkoutRequestId: response.CheckoutRequestID },
      });
    } else {
      next(new AppError('Failed to initiate M-Pesa payment. Please try again.', 500));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    M-Pesa Callback (called by Safaricom servers)
// @route   POST /api/payments/mpesa/callback
// @access  Public (Safaricom server)
exports.mpesaCallback = async (req, res, next) => {
  try {
    const { Body } = req.body;
    const stkCallback = Body?.stkCallback;

    if (!stkCallback) return res.status(200).json({ received: true });

    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;

    const order = await Order.findOne({ mpesaCheckoutRequestId: CheckoutRequestID }).populate('user', 'name email');
    if (!order) return res.status(200).json({ received: true });

    if (ResultCode === 0) {
      const items = CallbackMetadata?.Item || [];
      const receiptItem = items.find((i) => i.Name === 'MpesaReceiptNumber');
      const receipt = receiptItem?.Value || '';

      order.paymentStatus = 'paid';
      order.mpesaReceiptNumber = receipt;
      order.paidAt = Date.now();
      order.orderStatus = 'processing';
      order.statusHistory.push({ status: 'processing', note: `Payment confirmed via M-Pesa. Receipt: ${receipt}` });
      await order.save();
      if (order.user?.email) sendOrderConfirmation(order.user, order).catch(() => {});
    } else {
      order.paymentStatus = 'failed';
      order.statusHistory.push({
        status: order.orderStatus,
        note: `M-Pesa payment failed: ${ResultDesc || 'Payment declined'}`,
      });
      await order.save();
    }

    // Always return 200 to Safaricom
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(200).json({ received: true }); // Must always return 200
  }
};

// @desc    Query M-Pesa transaction status
// @route   GET /api/payments/mpesa/status/:checkoutId
// @access  Private
exports.mpesaStatus = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      mpesaCheckoutRequestId: req.params.checkoutId,
      user: req.user._id,
    });

    if (!order) return next(new AppError('Order not found', 404));

    // If already paid, return immediately
    if (order.paymentStatus === 'paid') {
      return res.status(200).json({ success: true, data: { paymentStatus: 'paid', order } });
    }

    // Query Safaricom
    const status = await queryStkStatus(req.params.checkoutId);

    res.status(200).json({
      success: true,
      data: { paymentStatus: order.paymentStatus, mpesaStatus: status },
    });
  } catch (error) {
    next(error);
  }
};
