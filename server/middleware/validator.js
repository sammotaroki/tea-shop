const Joi = require('joi');

// Generic validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => d.message.replace(/"/g, "'"));
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    req[source] = value; // Replace with sanitized value
    next();
  };
};

// --- Auth Schemas ---
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain uppercase, lowercase, number, and special character',
    }),
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional().allow(''),
  address: Joi.object({
    street: Joi.string().max(100),
    city: Joi.string().max(50),
    state: Joi.string().max(50),
    country: Joi.string().max(50),
    postalCode: Joi.string().max(20),
  }),
});

// --- Product Schemas ---
const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).max(2000).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().hex().length(24).required(),
  stock: Joi.number().integer().min(0).required(),
  weight: Joi.string().max(20).optional(),
  origin: Joi.string().max(100).optional(),
  brewingInstructions: Joi.string().max(500).optional(),
  featured: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

// --- Order Schemas ---
const orderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().hex().length(24).required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
  shippingAddress: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    postalCode: Joi.string().required(),
  }).required(),
  shippingOption: Joi.string().hex().length(24).required(),
  paymentMethod: Joi.string().valid('stripe', 'mpesa').required(),
});

// --- MPesa Schema ---
const mpesaSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^(?:254|\+254|0)?(7[0-9]{8})$/)
    .required()
    .messages({ 'string.pattern.base': 'Please provide a valid Safaricom number' }),
  orderId: Joi.string().hex().length(24).required(),
});

// --- Shipping Schema ---
const shippingSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(300).optional(),
  price: Joi.number().min(0).required(),
  estimatedDays: Joi.string().max(30).required(),
  regions: Joi.array().items(Joi.string()).optional(),
  isActive: Joi.boolean().optional(),
});

// --- Category Schema ---
const categorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(300).optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  validate,
  schemas: {
    register: registerSchema,
    login: loginSchema,
    updateProfile: updateProfileSchema,
    product: productSchema,
    order: orderSchema,
    mpesa: mpesaSchema,
    shipping: shippingSchema,
    category: categorySchema,
  },
};
