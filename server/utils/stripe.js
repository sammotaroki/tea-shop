const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session
const createCheckoutSession = async ({ order, clientUrl }) => {
  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: process.env.STRIPE_CURRENCY || 'kes',
      product_data: {
        name: item.name,
        images: item.image ? [`${clientUrl}${item.image}`] : [],
      },
      unit_amount: Math.round(item.price * 100), // Stripe uses cents
    },
    quantity: item.quantity,
  }));

  // Add shipping as a line item
  lineItems.push({
    price_data: {
      currency: process.env.STRIPE_CURRENCY || 'kes',
      product_data: { name: 'Shipping' },
      unit_amount: Math.round(order.shippingPrice * 100),
    },
    quantity: 1,
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${clientUrl}/order/${order._id}?payment=success`,
    cancel_url: `${clientUrl}/checkout?payment=cancelled`,
    metadata: {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
    },
    customer_email: order.user?.email,
  });

  return session;
};

// Verify webhook signature and parse event
const constructWebhookEvent = (payload, signature, secret) => {
  return stripe.webhooks.constructEvent(payload, signature, secret);
};

module.exports = { createCheckoutSession, constructWebhookEvent, stripe };
