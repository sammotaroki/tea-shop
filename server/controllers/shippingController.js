const ShippingOption = require('../models/ShippingOption');
const { AppError } = require('../middleware/errorHandler');

exports.getShippingOptions = async (req, res, next) => {
  try {
    const options = await ShippingOption.find({ isActive: true }).sort('price');
    res.status(200).json({ success: true, count: options.length, data: { options } });
  } catch (error) { next(error); }
};

exports.getAllShippingOptions = async (req, res, next) => {
  try {
    const options = await ShippingOption.find().sort('-createdAt');
    res.status(200).json({ success: true, count: options.length, data: { options } });
  } catch (error) { next(error); }
};

exports.createShippingOption = async (req, res, next) => {
  try {
    const option = await ShippingOption.create(req.body);
    res.status(201).json({ success: true, data: { option } });
  } catch (error) { next(error); }
};

exports.updateShippingOption = async (req, res, next) => {
  try {
    const option = await ShippingOption.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!option) return next(new AppError('Shipping option not found', 404));
    res.status(200).json({ success: true, data: { option } });
  } catch (error) { next(error); }
};

exports.deleteShippingOption = async (req, res, next) => {
  try {
    const option = await ShippingOption.findByIdAndDelete(req.params.id);
    if (!option) return next(new AppError('Shipping option not found', 404));
    res.status(200).json({ success: true, message: 'Shipping option deleted' });
  } catch (error) { next(error); }
};
