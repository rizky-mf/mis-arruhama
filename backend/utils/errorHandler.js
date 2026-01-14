/**
 * Centralized Error Handler
 * Custom error class dan middleware untuk handle semua error secara konsisten
 */

/**
 * Custom Application Error Class
 * Untuk error yang bersifat operational (expected errors)
 */
class AppError extends Error {
  constructor(message, statusCode = 400, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error - untuk error validasi input
 */
class ValidationError extends AppError {
  constructor(message, errors = null) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * Not Found Error - untuk resource yang tidak ditemukan
 */
class NotFoundError extends AppError {
  constructor(message = 'Data tidak ditemukan') {
    super(message, 404);
  }
}

/**
 * Unauthorized Error - untuk error authentication
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Forbidden Error - untuk error authorization
 */
class ForbiddenError extends AppError {
  constructor(message = 'Akses ditolak') {
    super(message, 403);
  }
}

/**
 * Bad Request Error - untuk request yang invalid
 */
class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

/**
 * Conflict Error - untuk konflik data (duplicate, dll)
 */
class ConflictError extends AppError {
  constructor(message = 'Data conflict') {
    super(message, 409);
  }
}

/**
 * Handle Sequelize Validation Errors
 */
const handleSequelizeValidationError = (error) => {
  const errors = error.errors.map(err => ({
    field: err.path,
    message: err.message
  }));

  return new ValidationError('Validation error', errors);
};

/**
 * Handle Sequelize Unique Constraint Errors
 */
const handleSequelizeUniqueError = (error) => {
  const field = error.errors[0]?.path || 'field';
  const message = `${field} sudah digunakan`;

  return new ConflictError(message);
};

/**
 * Handle Sequelize Foreign Key Constraint Errors
 */
const handleSequelizeForeignKeyError = (error) => {
  return new BadRequestError('Data relasi tidak valid');
};

/**
 * Handle JWT Errors
 */
const handleJWTError = () => {
  return new UnauthorizedError('Token tidak valid');
};

const handleJWTExpiredError = () => {
  return new UnauthorizedError('Token telah expired');
};

/**
 * Send Error Response in Development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
    ...(err.errors && { errors: err.errors })
  });
};

/**
 * Send Error Response in Production
 */
const sendErrorProd = (err, res) => {
  // Operational error: kirim message ke client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors })
    });
  }
  // Programming error: jangan bocorkan detail ke client
  else {
    console.error('ERROR 💥:', err);

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

/**
 * Global Error Handling Middleware
 * Digunakan di server.js sebagai error handler terakhir
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.isOperational = err.isOperational || false;

  // Log error untuk debugging
  console.error('Error:', err.message);

  // Handle specific errors
  if (err.name === 'SequelizeValidationError') {
    error = handleSequelizeValidationError(err);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    error = handleSequelizeUniqueError(err);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = handleSequelizeForeignKeyError(err);
  }

  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Send response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Catch Async Errors - Wrapper function untuk async routes
 * Menghindari try-catch berulang di setiap controller
 *
 * Usage:
 * router.get('/endpoint', catchAsync(async (req, res, next) => {
 *   // Your async code here
 *   // Jika ada error, otomatis di-catch dan diteruskan ke error handler
 * }));
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
  errorHandler,
  catchAsync
};
