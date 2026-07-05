const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Runs after express-validator checks have executed on a route.
 * If any validation errors exist, throws a 422 ApiError with details.
 * Must be placed after the validator array in the route definition.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return next(new ApiError(422, 'Validation failed', formattedErrors));
  }

  next();
};

module.exports = validateRequest;
