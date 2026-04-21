const { Op } = require('sequelize');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * GET /api/v1/tasks
 * Users: own tasks only | Admins: all tasks
 */
exports.getTasks = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10, status, priority,
      sortBy = 'createdAt', order = 'DESC', search,
    } = req.query;

    const where = {};
    if (req.user.role !== 'admin') where.userId = req.user.id;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) where.title = { [Op.like]: `%${search}%` };

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Task.findAndCountAll({
      where,
      include: req.user.role === 'admin'
        ? [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
        : [],
      limit: parseInt(limit),
      offset,
      order: [[sortBy, order.toUpperCase()]],
    });

    return sendPaginated(res, rows, count, page, limit, 'Tasks fetched');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/tasks/:id
 */
exports.getTask = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'admin') where.userId = req.user.id;

    const task = await Task.findOne({ where, include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }] });
    if (!task) return sendError(res, 'Task not found', 404);

    return sendSuccess(res, { task }, 'Task fetched');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/tasks
 */
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;
    const task = await Task.create({
      title, description, status, priority, dueDate, tags,
      userId: req.user.id,
    });

    logger.info(`Task created: ${task.id} by user ${req.user.id}`);
    return sendSuccess(res, { task }, 'Task created', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/tasks/:id
 */
exports.updateTask = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'admin') where.userId = req.user.id;

    const task = await Task.findOne({ where });
    if (!task) return sendError(res, 'Task not found', 404);

    const { title, description, status, priority, dueDate, tags } = req.body;
    await task.update({ title, description, status, priority, dueDate, tags });

    return sendSuccess(res, { task }, 'Task updated');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/tasks/:id
 */
exports.deleteTask = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'admin') where.userId = req.user.id;

    const task = await Task.findOne({ where });
    if (!task) return sendError(res, 'Task not found', 404);

    await task.destroy();
    logger.info(`Task deleted: ${req.params.id}`);
    return sendSuccess(res, {}, 'Task deleted');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/tasks/stats (admin only)
 */
exports.getTaskStats = async (req, res, next) => {
  try {
    const { sequelize } = require('../config/database');
    const stats = await Task.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
    });
    const byPriority = await Task.findAll({
      attributes: ['priority', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['priority'],
    });
    return sendSuccess(res, { byStatus: stats, byPriority }, 'Stats fetched');
  } catch (err) {
    next(err);
  }
};
