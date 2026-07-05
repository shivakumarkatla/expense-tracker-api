const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Create a new expense for the authenticated user
 * @route   POST /api/expenses
 * @access  Private
 */
const createExpense = asyncHandler(async (req, res) => {
  const { title, amount, category, description, date } = req.body;

  const expense = await Expense.create({
    user: req.user._id,
    title,
    amount,
    category,
    description,
    date,
  });

  res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    data: { expense },
  });
});

/**
 * Builds a Mongoose filter object from validated query params,
 * always scoped to the authenticated user. Shared by getAllExpenses.
 */
const buildExpenseFilter = (userId, query) => {
  const filter = { user: userId };

  if (query.search) {
    filter.title = { $regex: query.search, $options: 'i' };
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }

  if (query.minAmount || query.maxAmount) {
    filter.amount = {};
    if (query.minAmount) filter.amount.$gte = parseFloat(query.minAmount);
    if (query.maxAmount) filter.amount.$lte = parseFloat(query.maxAmount);
  }

  return filter;
};

/**
 * @desc    Get all expenses for the authenticated user with
 *          pagination, search, filters, and sorting
 * @route   GET /api/expenses
 * @access  Private
 */
const getAllExpenses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const sortBy = req.query.sortBy || 'date';
  const order = req.query.order === 'asc' ? 1 : -1;

  const filter = buildExpenseFilter(req.user._id, req.query);

  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit),
    Expense.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

/**
 * @desc    Get a single expense by ID (must belong to the authenticated user)
 * @route   GET /api/expenses/:id
 * @access  Private
 */
const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  res.status(200).json({
    success: true,
    data: { expense },
  });
});

/**
 * @desc    Update an expense (must belong to the authenticated user)
 * @route   PUT /api/expenses/:id
 * @access  Private
 */
const updateExpense = asyncHandler(async (req, res) => {
  const { title, amount, category, description, date } = req.body;

  const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  if (title !== undefined) expense.title = title;
  if (amount !== undefined) expense.amount = amount;
  if (category !== undefined) expense.category = category;
  if (description !== undefined) expense.description = description;
  if (date !== undefined) expense.date = date;

  await expense.save();

  res.status(200).json({
    success: true,
    message: 'Expense updated successfully',
    data: { expense },
  });
});

/**
 * @desc    Delete an expense (must belong to the authenticated user)
 * @route   DELETE /api/expenses/:id
 * @access  Private
 */
const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  res.status(200).json({
    success: true,
    message: 'Expense deleted successfully',
    data: null,
  });
});

/**
 * @desc    Get dashboard summary: total expenses, current month total,
 *          category-wise totals, and recent transactions
 * @route   GET /api/expenses/dashboard
 * @access  Private
 */
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [totalResult, monthlyResult, categoryTotals, recentTransactions] = await Promise.all([
    // Total of all expenses for the user
    Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),

    // Total for the current calendar month
    Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfMonth, $lt: startOfNextMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),

    // Category-wise totals, sorted by highest spend first
    Expense.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $project: { _id: 0, category: '$_id', total: 1, count: 1 } },
    ]),

    // 5 most recent transactions
    Expense.find({ user: userId }).sort({ date: -1 }).limit(5),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalExpenses: totalResult[0]?.total || 0,
      totalCount: totalResult[0]?.count || 0,
      monthlyExpenses: monthlyResult[0]?.total || 0,
      monthlyCount: monthlyResult[0]?.count || 0,
      categoryWiseTotals: categoryTotals,
      recentTransactions,
    },
  });
});

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getDashboard,
};
