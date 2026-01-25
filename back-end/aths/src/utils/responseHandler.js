/**
 * Response Handler Utility
 * Standardized response formatting
 */

/**
 * Success response
 */
export const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error response
 */
export const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Validation error response
 */
export const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 400, 'Validation failed', errors);
};

/**
 * Unauthorized response
 */
export const unauthorizedResponse = (res, message = 'Authentication required') => {
  return errorResponse(res, 401, message, [
    {
      field: 'authorization',
      message: 'You must be logged in to access this resource',
    },
  ]);
};

/**
 * Forbidden response
 */
export const forbiddenResponse = (res, message = 'Access forbidden') => {
  return errorResponse(res, 403, message, [
    {
      field: 'authorization',
      message: 'You do not have permission to access this resource',
    },
  ]);
};

/**
 * Not found response
 */
export const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, 404, message, [
    {
      field: 'resource',
      message: 'The requested resource could not be found',
    },
  ]);
};

/**
 * Server error response
 */
export const serverErrorResponse = (res, message = 'Internal server error') => {
  return errorResponse(res, 500, message, [
    {
      field: 'server',
      message: 'An unexpected error occurred. Please try again later',
    },
  ]);
};

export default {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
};
