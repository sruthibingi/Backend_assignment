const { body, query, param } = require('express-validator');

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be 1–200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),

  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done']).withMessage('Status must be todo, in_progress, or done'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),

  body('dueDate')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Due date must be in YYYY-MM-DD format'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
];

const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Title must be 1–200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),

  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status value'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority value'),

  body('dueDate')
    .optional({ nullable: true })
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Due date must be in YYYY-MM-DD format'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
];

const taskQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),
  query('status').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status filter'),
  query('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority filter'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title']).withMessage('Invalid sortBy field'),
  query('order').optional().isIn(['ASC', 'DESC']).withMessage('Order must be ASC or DESC'),
];

module.exports = { createTaskValidator, updateTaskValidator, taskQueryValidator };
