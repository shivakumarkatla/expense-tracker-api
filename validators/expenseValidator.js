const { body, param, query } = require('express-validator');
const { EXPENSE_CATEGORIES, SORT_FIELDS, SORT_ORDERS } = require('../config/constants');

/**
 * Validation rules for creating a new expense.
 */
const createExpenseValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(EXPENSE_CATEGORIES)
    .withMessage(`Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO8601 date (YYYY-MM-DD)'),
];

/**
 * Validation rules for updating an existing expense.
 * All fields optional since it's a partial update, but must still be valid if provided.
 */
const updateExpenseValidator = [
  param('id').isMongoId().withMessage('Invalid expense ID'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),

  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),

  body('category')
    .optional()
    .trim()
    .isIn(EXPENSE_CATEGORIES)
    .withMessage(`Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO8601 date (YYYY-MM-DD)'),
];

/**
 * Validates a MongoDB ObjectId passed as a route param.
 */
const mongoIdValidator = [param('id').isMongoId().withMessage('Invalid expense ID')];

/**
 * Validation rules for listing/filtering/sorting expenses via query params.
 */
const listExpensesValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('search').optional().trim().isLength({ max: 100 }),

  query('category')
    .optional()
    .trim()
    .isIn(EXPENSE_CATEGORIES)
    .withMessage(`Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`),

  query('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),

  query('endDate').optional().isISO8601().withMessage('endDate must be a valid date'),

  query('minAmount').optional().isFloat({ min: 0 }).withMessage('minAmount must be a positive number'),

  query('maxAmount').optional().isFloat({ min: 0 }).withMessage('maxAmount must be a positive number'),

  query('sortBy')
    .optional()
    .isIn(SORT_FIELDS)
    .withMessage(`sortBy must be one of: ${SORT_FIELDS.join(', ')}`),

  query('order')
    .optional()
    .isIn(SORT_ORDERS)
    .withMessage(`order must be one of: ${SORT_ORDERS.join(', ')}`),
];

module.exports = {
  createExpenseValidator,
  updateExpenseValidator,
  mongoIdValidator,
  listExpensesValidator,
};
