const logger = require('../utils/logger');
const { sendError } = require('../utils/response');

/**
 * Global error handler — must be the last middleware registered
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack, path: req.path });

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return sendError(res, 'Validation failed', 422, errors);
  }

  // Sequelize foreign key / not found
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return sendError(res, 'Referenced resource not found', 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') return sendError(res, 'Invalid token', 401);
  if (err.name === 'TokenExpiredError') return sendError(res, 'Token expired', 401);

  // Custom app errors with a statusCode
  if (err.statusCode) return sendError(res, err.message, err.statusCode);

  // Default — 500
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  return sendError(res, message, 500);
};

/**
 * 404 handler — fires when no route matched
 */
const notFound = (req, res) => {
  return sendError(res, `Route ${req.method} ${req.path} not found`, 404);
};

module.exports = { errorHandler, notFound };
