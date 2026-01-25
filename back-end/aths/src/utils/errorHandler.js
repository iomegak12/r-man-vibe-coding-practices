import * as logger from './logger.js';

/**
 * Error Handler Utility
 * Custom error handling and logging
 */

/**
 * Custom Application Error
 */
export class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message, errors) {
    super(message, 400, errors);
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, [
      {
        field: 'authentication',
        message,
      },
    ]);
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403, [
      {
        field: 'authorization',
        message,
      },
    ]);
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, [
      {
        field: resource.toLowerCase(),
        message: `${resource} could not be found`,
      },
    ]);
  }
}

/**
 * Conflict Error
 */
export class ConflictError extends AppError {
  constructor(message, field = 'resource') {
    super(message, 409, [
      {
        field,
        message,
      },
    ]);
  }
}

/**
 * Handle async errors
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Log error details
 */
export const logError = (error) => {
  if (error.isOperational) {
    logger.warn('Operational Error', {
      message: error.message,
      statusCode: error.statusCode,
    });
  } else {
    logger.error('System Error', {
      message: error.message,
      stack: error.stack,
    });
  }
};

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  asyncHandler,
  logError,
};
