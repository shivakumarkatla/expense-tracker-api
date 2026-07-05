# Expense Tracker REST API

A production-ready Expense Tracker REST API built with **Node.js**, **Express.js**, **MongoDB/Mongoose**, **JWT authentication**, **bcrypt**, and **express-validator**, following the MVC architecture.

## Features

- **Authentication**: Register, Login, JWT-protected routes
- **Expense Management**: Full CRUD, pagination, search by title, filter by category/date range/amount range, sort by date or amount
- **Dashboard**: Total expenses, current month expenses, category-wise totals, recent transactions
- **Security**: Bcrypt password hashing, JWT middleware, per-user data isolation, Helmet security headers
- **Validation**: express-validator on every write route, consistent error format
- **Error Handling**: Centralized error middleware, normalizes Mongoose errors (validation, duplicate key, cast errors)

## Tech Stack

| Layer          | Technology              |
|----------------|--------------------------|
| Runtime        | Node.js (>=18)           |
| Framework      | Express.js               |
| Database       | MongoDB + Mongoose       |
| Auth           | JWT (jsonwebtoken)       |
| Hashing        | bcrypt                   |
| Validation     | express-validator        |
| Config         | dotenv                   |

## Project Structure

```
project/
├── controllers/        # Business logic (auth, expense)
├── models/              # Mongoose schemas (User, Expense)
├── routes/              # Express route definitions
├── middleware/          # Auth guard, validation runner, error handler
├── validators/          # express-validator rule sets
├── config/              # DB connection, shared constants
├── utils/                # asyncHandler, ApiError, JWT helper
├── app.js               # Express app configuration
├── server.js            # Entry point (loads env, connects DB, starts server)
├── package.json
└── .env.example
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable              | Description                                  | Example                                      |
|-----------------------|-----------------------------------------------|-----------------------------------------------|
| `PORT`                | Port the server listens on                   | `5000`                                        |
| `NODE_ENV`            | Environment mode                             | `development` / `production`                  |
| `MONGO_URI`           | MongoDB connection string                    | `mongodb://127.0.0.1:27017/expense_tracker`    |
| `JWT_SECRET`          | Secret used to sign JWTs                     | a long random string                          |
| `JWT_EXPIRES_IN`      | Token expiry                                 | `7d`                                           |
| `BCRYPT_SALT_ROUNDS`  | Bcrypt salt rounds                           | `10`                                           |

### 3. Run the server

```bash
# Development (auto-restart with nodemon)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000` (or your configured `PORT`).

### 4. Health check

```
GET /health
```

## API Endpoints

### Auth Routes (`/api/auth`)

| Method | Endpoint         | Access  | Description              |
|--------|------------------|---------|---------------------------|
| POST   | `/register`      | Public  | Register a new user       |
| POST   | `/login`         | Public  | Login and receive a JWT   |
| GET    | `/me`            | Private | Get current user profile  |

**Register request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Login request body:**
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Auth response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" },
    "token": "eyJhbGciOi..."
  }
}
```

All private routes require the header:
```
Authorization: Bearer <token>
```

### Expense Routes (`/api/expenses`) — all require authentication

| Method | Endpoint        | Description                                   |
|--------|-----------------|-------------------------------------------------|
| POST   | `/`             | Create a new expense                           |
| GET    | `/`             | List expenses (pagination, search, filters, sort) |
| GET    | `/dashboard`    | Dashboard summary                              |
| GET    | `/:id`          | Get a single expense                           |
| PUT    | `/:id`          | Update an expense                              |
| DELETE | `/:id`          | Delete an expense                              |

**Create expense request body:**
```json
{
  "title": "Grocery shopping",
  "amount": 45.50,
  "category": "Food",
  "description": "Weekly groceries",
  "date": "2026-07-01"
}
```

**Valid categories:** `Food`, `Travel`, `Shopping`, `Bills`, `Health`, `Education`, `Entertainment`, `Other`

**List expenses query parameters:**

| Param       | Type    | Description                                  |
|-------------|---------|-----------------------------------------------|
| `page`      | int     | Page number (default 1)                      |
| `limit`     | int     | Items per page, max 100 (default 10)         |
| `search`    | string  | Case-insensitive search on title              |
| `category`  | string  | Filter by exact category                      |
| `startDate` | ISO8601 | Filter expenses on/after this date            |
| `endDate`   | ISO8601 | Filter expenses on/before this date           |
| `minAmount` | float   | Minimum amount                                 |
| `maxAmount` | float   | Maximum amount                                 |
| `sortBy`    | string  | `date` or `amount`                            |
| `order`     | string  | `asc` or `desc` (default `desc`)              |

Example:
```
GET /api/expenses?search=grocery&category=Food&sortBy=amount&order=desc&page=1&limit=10
```

**Dashboard response:**
```json
{
  "success": true,
  "data": {
    "totalExpenses": 1520.75,
    "totalCount": 42,
    "monthlyExpenses": 310.00,
    "monthlyCount": 8,
    "categoryWiseTotals": [
      { "category": "Food", "total": 620.5, "count": 15 },
      { "category": "Travel", "total": 400, "count": 6 }
    ],
    "recentTransactions": [ /* last 5 expenses */ ]
  }
}
```

## Response Format

All responses follow a consistent envelope:

**Success:**
```json
{ "success": true, "message": "...", "data": { } }
```

**Error:**
```json
{ "success": false, "message": "...", "errors": [ /* optional field-level errors */ ] }
```

## HTTP Status Codes Used

| Code | Meaning                                  |
|------|--------------------------------------------|
| 200  | OK                                        |
| 201  | Created                                    |
| 400  | Bad Request (cast errors, malformed input) |
| 401  | Unauthorized (missing/invalid token, bad credentials) |
| 404  | Not Found                                  |
| 409  | Conflict (duplicate email)                 |
| 422  | Unprocessable Entity (validation failed)   |
| 500  | Internal Server Error                      |

## Security Notes

- Passwords are hashed with bcrypt before storage and never returned in API responses.
- JWTs are signed with a server-side secret (`JWT_SECRET`) and verified on every protected route via the `protect` middleware.
- Every expense query/mutation is scoped to `req.user._id`, so users can never read or modify another user's data.
- Helmet sets secure HTTP headers; CORS is enabled for cross-origin API access.

## Notes on Running Tests / Local Development

This project assumes a running MongoDB instance (local or Atlas) reachable via `MONGO_URI`. No seed data is included; register a user via `/api/auth/register` to begin.
