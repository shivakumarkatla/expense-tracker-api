/**
 * Centralized constants used across the application.
 * Keeping these in one place avoids duplicate hardcoded values.
 */

const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Health',
  'Education',
  'Entertainment',
  'Other',
];

const SORT_FIELDS = ['date', 'amount'];
const SORT_ORDERS = ['asc', 'desc'];

module.exports = {
  EXPENSE_CATEGORIES,
  SORT_FIELDS,
  SORT_ORDERS,
};
