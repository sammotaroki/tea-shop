const express = require('express');
const router = express.Router();
const {
  placeOrder, getOrders, getOrder, updateOrderStatus, getStats,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { validate, schemas } = require('../middleware/validator');

router.get('/stats', protect, roleGuard('admin'), getStats);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.post('/', protect, validate(schemas.order), placeOrder);
router.put('/:id/status', protect, roleGuard('admin'), updateOrderStatus);

module.exports = router;
