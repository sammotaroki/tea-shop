const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { sendTokenResponse } = require('../middleware/auth');
const { sendVerificationEmail, sendAdminInvite } = require('../utils/email');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered. Please log in.', 400));
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await User.create({
      name, email, password, phone,
      emailVerified: false,
      emailVerificationCode: code,
      emailVerificationExpires: new Date(Date.now() + 15 * 60 * 1000),
    });

    await sendVerificationEmail({ name, email }, code);

    res.status(201).json({
      success: true,
      message: 'Account created. Check your email for a verification code.',
      data: { email },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 403));
    }

    if (user.emailVerified === false) {
      return next(new AppError('Please verify your email before logging in.', 403));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email with code
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return next(new AppError('Email and code are required', 400));

    const user = await User.findOne({
      email,
      emailVerificationCode: code,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) return next(new AppError('Invalid or expired verification code', 400));

    user.emailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification code
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new AppError('Email is required', 400));

    const user = await User.findOne({ email, emailVerified: false });
    if (!user) return next(new AppError('No unverified account found for this email', 404));

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationCode = code;
    user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(user, code);

    res.status(200).json({ success: true, message: 'Verification code resent' });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh JWT — re-issues a token for a valid or recently expired cookie
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;
    if (!token || token === 'loggedout') {
      return next(new AppError('No session to refresh', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

    // Only allow tokens expired within the last 24 hours
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && now - decoded.exp > 86400) {
      return next(new AppError('Session too old. Please log in again.', 401));
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return next(new AppError('User not found or inactive', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return next(new AppError('Current and new password are required', 400));
    }
    if (newPassword.length < 8) {
      return next(new AppError('New password must be at least 8 characters', 400));
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 401));
    }
    user.password = newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    List all admin users
// @route   GET /api/auth/admins
// @access  Admin
exports.getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('name email phone createdAt').sort('-createdAt');
    res.status(200).json({ success: true, data: { admins } });
  } catch (error) {
    next(error);
  }
};

// @desc    Invite a new admin
// @route   POST /api/auth/invite-admin
// @access  Admin
exports.inviteAdmin = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return next(new AppError('Name and email are required', 400));

    const existing = await User.findOne({ email });
    if (existing) return next(new AppError('An account with this email already exists', 400));

    const tempPassword = `Chai@${crypto.randomBytes(5).toString('hex')}`;

    await User.create({
      name,
      email,
      password: tempPassword,
      role: 'admin',
      emailVerified: true,
    });

    await sendAdminInvite({ name, email }, tempPassword, req.user.name);

    res.status(201).json({ success: true, message: `Invite sent to ${email}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};
