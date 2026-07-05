const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT containing the user's ID.
 * @param {String} userId - MongoDB ObjectId of the user
 * @returns {String} signed JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
