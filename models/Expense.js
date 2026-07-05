const mongoose = require('mongoose');
const { EXPENSE_CATEGORIES } = require('../config/constants');

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // speeds up queries scoped to a user
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: EXPENSE_CATEGORIES,
        message: `Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to speed up common query patterns (per-user, sorted by date)
expenseSchema.index({ user: 1, date: -1 });
// Text index to support title search
expenseSchema.index({ title: 'text' });

module.exports = mongoose.model('Expense', expenseSchema);
