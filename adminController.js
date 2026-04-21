const User = require('../models/User');
const Task = require('../models/Task');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

/**
 * GET /api/v1/admin/users
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await User.findAndCountAll({
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    return sendPaginated(res, rows, count, page, limit, 'Users fetched');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/admin/users/:id
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Task, as: 'tasks', limit: 5, order: [['createdAt', 'DESC']] }],
    });
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, { user }, 'User fetched');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/admin/users/:id/role
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return sendError(res, 'Invalid role', 400);

    const user = await User.findByPk(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);
    if (user.id === req.user.id) return sendError(res, 'Cannot change your own role', 400);

    await user.update({ role });
    return sendSuccess(res, { user }, 'User role updated');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/admin/users/:id/status
 */
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);
    if (user.id === req.user.id) return sendError(res, 'Cannot deactivate yourself', 400);

    await user.update({ isActive: !user.isActive });
    return sendSuccess(res, { user }, `User ${user.isActive ? 'activated' : 'deactivated'}`);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/admin/users/:id
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);
    if (user.id === req.user.id) return sendError(res, 'Cannot delete yourself', 400);

    await user.destroy();
    return sendSuccess(res, {}, 'User deleted');
  } catch (err) {
    next(err);
  }
};
