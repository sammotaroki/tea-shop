const Order = require('../models/Order');
const Product = require('../models/Product');
const ShippingOption = require('../models/ShippingOption');
const { AppError } = require('../middleware/errorHandler');

const startOf = (unit) => {
  const d = new Date();
  if (unit === 'today') return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (unit === 'week')  { const s = new Date(d.getFullYear(), d.getMonth(), d.getDate()); s.setDate(s.getDate() - 6); return s; }
  if (unit === 'month') return new Date(d.getFullYear(), d.getMonth(), 1);
  if (unit === '30d')   { const s = new Date(d.getFullYear(), d.getMonth(), d.getDate()); s.setDate(s.getDate() - 29); return s; }
};

// @desc    Place order
// @route   POST /api/orders
// @access  Private
exports.placeOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, shippingOption, paymentMethod } = req.body;

    // Verify shipping option
    const shipping = await ShippingOption.findById(shippingOption);
    if (!shipping || !shipping.isActive) {
      return next(new AppError('Selected shipping option is not available', 400));
    }

    // Fetch products and validate stock
    const orderItems = [];
    let itemsTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return next(new AppError(`Product ${item.product} not found`, 404));
      }
      if (product.stock < item.quantity) {
        return next(new AppError(`Insufficient stock for "${product.name}"`, 400));
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        quantity: item.quantity,
      });
      itemsTotal += product.price * item.quantity;
    }

    const totalAmount = itemsTotal + shipping.price;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      shippingOption,
      shippingPrice: shipping.price,
      itemsTotal,
      totalAmount,
      paymentMethod,
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });

    // Deduct stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    await order.populate([
      { path: 'user', select: 'name email' },
      { path: 'shippingOption', select: 'name estimatedDays' },
    ]);

    res.status(201).json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's orders / all orders (admin)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const query = {};
    if (req.user.role !== 'admin') {
      query.user = req.user._id; // Customers can only see their own orders
    }
    if (status) query.orderStatus = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .populate('shippingOption', 'name estimatedDays')
        .sort('-createdAt')
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('shippingOption')
      .populate('items.product', 'name images');

    if (!order) return next(new AppError('Order not found', 404));

    // Customers can only access their own orders
    if (
      req.user.role !== 'admin' &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return next(new AppError('Not authorized to view this order', 403));
    }

    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, trackingNumber, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));

    order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (orderStatus === 'delivered') order.deliveredAt = Date.now();

    order.statusHistory.push({ status: orderStatus, note: note || '' });
    await order.save();

    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin dashboard stats
// @route   GET /api/orders/stats
// @access  Admin
exports.getStats = async (req, res, next) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      revenueAgg,
      recentOrders,
      ordersByStatus,
      revenueByDay,
      topProducts,
      lowStockProducts,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        {
          $group: {
            _id: null,
            total:       { $sum: '$totalAmount' },
            today:       { $sum: { $cond: [{ $gte: ['$paidAt', startOf('today')] }, '$totalAmount', 0] } },
            week:        { $sum: { $cond: [{ $gte: ['$paidAt', startOf('week')]  }, '$totalAmount', 0] } },
            month:       { $sum: { $cond: [{ $gte: ['$paidAt', startOf('month')] }, '$totalAmount', 0] } },
            paidCount:   { $sum: 1 },
            todayOrders: { $sum: { $cond: [{ $gte: ['$paidAt', startOf('today')] }, 1, 0] } },
          },
        },
      ]),
      Order.find().sort('-createdAt').limit(8).populate('user', 'name email'),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', paidAt: { $gte: startOf('30d') } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.product', name: { $first: '$items.name' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, units: { $sum: '$items.quantity' } } },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
      Product.find({ isActive: true, stock: { $lte: 5 } }).select('name stock').sort('stock').limit(8),
    ]);

    const rev = revenueAgg[0] || {};
    const paidCount = rev.paidCount || 0;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue:   rev.total  || 0,
        todayRevenue:   rev.today  || 0,
        weekRevenue:    rev.week   || 0,
        monthRevenue:   rev.month  || 0,
        totalOrders,
        pendingOrders,
        todayOrders:    rev.todayOrders || 0,
        avgOrderValue:  paidCount ? Math.round(rev.total / paidCount) : 0,
        recentOrders,
        ordersByStatus,
        revenueByDay,
        topProducts,
        lowStockProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};
