const express = require('express');
const {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getDashboard,
} = require('../controllers/expenseController');
const {
  createExpenseValidator,
  updateExpenseValidator,
  mongoIdValidator,
  listExpensesValidator,
} = require('../validators/expenseValidator');
const validateRequest = require('../middleware/validateRequest');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// All expense routes require authentication
router.use(protect);

// @route   GET /api/expenses/dashboard
// NOTE: must be declared before "/:id" to avoid being shadowed by the param route
router.get('/dashboard', getDashboard);

// @route   POST /api/expenses
router.post('/', createExpenseValidator, validateRequest, createExpense);

// @route   GET /api/expenses
router.get('/', listExpensesValidator, validateRequest, getAllExpenses);

// @route   GET /api/expenses/:id
router.get('/:id', mongoIdValidator, validateRequest, getExpenseById);

// @route   PUT /api/expenses/:id
router.put('/:id', updateExpenseValidator, validateRequest, updateExpense);

// @route   DELETE /api/expenses/:id
router.delete('/:id', mongoIdValidator, validateRequest, deleteExpense);

module.exports = router;
