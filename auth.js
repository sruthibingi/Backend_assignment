const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Token expired. Please login again.', 401);
      }
      return sendError(res, 'Invalid token.', 401);
    }

    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      return sendError(res, 'User not found or account deactivated.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return sendError(res, 'Authentication failed.', 500);
  }
};

/**
 * Role-based access control
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Not authenticated.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
        403
      );
    }
    next();
  };
};

module.exports = { authenticate, authorize };
