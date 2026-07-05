const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security headers
app.use(helmet());

// Enable CORS for all origins (adjust in production as needed)
app.use(cors());

// HTTP request logging (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// 404 handler for unmatched routes
app.use(notFound);

// Centralized error handler (must be registered last)
app.use(errorHandler);

module.exports = app;
