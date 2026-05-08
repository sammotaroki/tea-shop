const { AppError } = require('./errorHandler');

// Role-Based Access Control middleware
// Usage: roleGuard('admin') or roleGuard('admin', 'manager')
const roleGuard = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You must be logged in to access this resource.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Role '${req.user.role}' is not authorized to perform this action.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = roleGuard;
