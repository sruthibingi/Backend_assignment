const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
  return { accessToken, refreshToken };
};

/**
 * POST /api/v1/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.unscoped().findOne({ where: { email } });
    if (existing) return sendError(res, 'Email already registered', 409);

    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    await User.update({ refreshToken }, { where: { id: user.id } });

    logger.info(`New user registered: ${email}`);
    return sendSuccess(
      res,
      { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken },
      'Registration successful',
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user || !user.isActive) return sendError(res, 'Invalid credentials', 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, 'Invalid credentials', 401);

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    await User.update({ refreshToken, lastLogin: new Date() }, { where: { id: user.id } });

    logger.info(`User logged in: ${email}`);
    return sendSuccess(
      res,
      { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken },
      'Login successful'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/refresh
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, 'Refresh token required', 400);

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch {
      return sendError(res, 'Invalid or expired refresh token', 401);
    }

    const user = await User.unscoped().findOne({ where: { id: decoded.id, refreshToken } });
    if (!user) return sendError(res, 'Invalid refresh token', 401);

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role);
    await User.update({ refreshToken: newRefreshToken }, { where: { id: user.id } });

    return sendSuccess(res, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/logout
 */
exports.logout = async (req, res, next) => {
  try {
    await User.update({ refreshToken: null }, { where: { id: req.user.id } });
    return sendSuccess(res, {}, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, { user: req.user }, 'Profile fetched');
  } catch (err) {
    next(err);
  }
};
