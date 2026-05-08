const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { validate, schemas } = require('../middleware/validator');

// Multer config — only images, max 5MB
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
  },
});

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, roleGuard('admin'), upload.array('images', 5), validate(schemas.product), createProduct);
router.put('/:id', protect, roleGuard('admin'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, roleGuard('admin'), deleteProduct);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
