const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const validateRequest = require('../middleware/validateRequest');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/auth/register
router.post('/register', registerValidator, validateRequest, registerUser);

// @route   POST /api/auth/login
router.post('/login', loginValidator, validateRequest, loginUser);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
