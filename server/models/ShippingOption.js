const mongoose = require('mongoose');

const shippingOptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shipping option name is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 300,
    },
    price: {
      type: Number,
      required: [true, 'Shipping price is required'],
      min: 0,
    },
    estimatedDays: {
      type: String,
      required: [true, 'Estimated delivery days are required'],
    },
    regions: {
      type: [String],
      default: ['All'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShippingOption', shippingOptionSchema);
