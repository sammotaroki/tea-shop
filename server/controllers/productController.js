const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');
const path = require('path');
const fs = require('fs');

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      keyword, category, minPrice, maxPrice, featured,
      sort = '-createdAt', page = 1, limit = 12,
    } = req.query;

    const query = { isActive: true };

    if (keyword) {
      query.$text = { $search: keyword };
    }
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate('category', 'name slug');

    if (!product) return next(new AppError('Product not found', 404));

    res.status(200).json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Admin
exports.createProduct = async (req, res, next) => {
  try {
    // Handle uploaded images
    const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];
    const product = await Product.create({ ...req.body, images });
    await product.populate('category', 'name slug');
    res.status(201).json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let updateData = { ...req.body };

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `/uploads/${f.filename}`);
      updateData.images = newImages;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    if (!product) return next(new AppError('Product not found', 404));

    res.status(200).json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return next(new AppError('Product not found', 404));
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found', 404));

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return next(new AppError('You have already reviewed this product', 400));
    }

    product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
    await product.save();

    res.status(201).json({ success: true, message: 'Review added successfully' });
  } catch (error) {
    next(error);
  }
};
