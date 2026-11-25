const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return errorResponse(res, 401, 'Authentication token required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ebooking_super_secure_jwt_secret_key_2026_x!');
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return errorResponse(res, 401, 'User account is invalid or deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token expired, please log in again');
    }
    return errorResponse(res, 401, 'Invalid authentication token');
  }
};

/**
 * Optional authentication: attaches req.user if a valid token is provided,
 * but allows the request to continue if no token is present.
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ebooking_super_secure_jwt_secret_key_2026_x!');
    const user = await User.findById(decoded.userId);
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (_) {
    // Continue without req.user
  }
  next();
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required');
    }

    if (req.user.role !== role) {
      return errorResponse(res, 403, `Access denied: Requires ${role} role`);
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
};
