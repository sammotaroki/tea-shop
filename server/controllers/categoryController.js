const Category = require('../models/Category');
const { AppError } = require('../middleware/errorHandler');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');
    res.status(200).json({ success: true, count: categories.length, data: { categories } });
  } catch (error) { next(error); }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('-createdAt');
    res.status(200).json({ success: true, count: categories.length, data: { categories } });
  } catch (error) { next(error); }
};

exports.createCategory = async (req, res, next) => {
  try {
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;
    const category = await Category.create({ ...req.body, ...(image && { image }) });
    res.status(201).json({ success: true, data: { category } });
  } catch (error) { next(error); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    let updateData = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true,
    });
    if (!category) return next(new AppError('Category not found', 404));
    res.status(200).json({ success: true, data: { category } });
  } catch (error) { next(error); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next(new AppError('Category not found', 404));
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) { next(error); }
};
