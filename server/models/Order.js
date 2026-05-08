const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v) => v.length > 0, 'Order must have at least one item'],
    },
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    shippingOption: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShippingOption',
      required: true,
    },
    shippingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    itemsTotal: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'mpesa'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    stripeSessionId: String,
    stripePaymentIntentId: String,
    mpesaCheckoutRequestId: String,
    mpesaReceiptNumber: String,
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingNumber: String,
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    deliveredAt: Date,
    paidAt: Date,
  },
  { timestamps: true }
);

// Auto-generate order number before saving
orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const rand = Math.floor(Math.random() * 90000) + 10000;
    this.orderNumber = `CH-${year}${month}-${rand}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);
