const express = require('express');
const router = express.Router();
const {
  getShippingOptions, getAllShippingOptions, createShippingOption, updateShippingOption, deleteShippingOption,
} = require('../controllers/shippingController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { validate, schemas } = require('../middleware/validator');

router.get('/', getShippingOptions);
router.get('/all', protect, roleGuard('admin'), getAllShippingOptions);
router.post('/', protect, roleGuard('admin'), validate(schemas.shipping), createShippingOption);
router.put('/:id', protect, roleGuard('admin'), updateShippingOption);
router.delete('/:id', protect, roleGuard('admin'), deleteShippingOption);

module.exports = router;
