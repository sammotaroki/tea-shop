const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateProfile, refreshToken, changePassword, verifyEmail, resendVerification, getAdmins, inviteAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { validate, schemas } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validate(schemas.register), register);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/login', authLimiter, validate(schemas.login), login);
router.post('/logout', protect, logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
router.put('/profile', protect, validate(schemas.updateProfile), updateProfile);
router.put('/password', protect, changePassword);
router.get('/admins', protect, roleGuard('admin'), getAdmins);
router.post('/invite-admin', protect, roleGuard('admin'), inviteAdmin);

module.exports = router;
