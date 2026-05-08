const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getCategories, getAllCategories, createCategory, updateCategory, deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { validate, schemas } = require('../middleware/validator');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, `cat-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

router.get('/', getCategories);
router.get('/all', protect, roleGuard('admin'), getAllCategories);
router.post('/', protect, roleGuard('admin'), upload.single('image'), validate(schemas.category), createCategory);
router.put('/:id', protect, roleGuard('admin'), upload.single('image'), updateCategory);
router.delete('/:id', protect, roleGuard('admin'), deleteCategory);

module.exports = router;
