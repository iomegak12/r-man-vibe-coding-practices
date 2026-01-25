/**
 * Validation Middleware
 * Validates request body against Joi schemas
 */

/**
 * Validate request body
 * @param {Object} schema - Joi validation schema
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Replace req.body with validated value
    req.body = value;
    next();
  };
};

/**
 * Validate request params
 * @param {Object} schema - Joi validation schema
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Invalid parameters',
        errors,
      });
    }

    req.params = value;
    next();
  };
};

/**
 * Validate request query
 * @param {Object} schema - Joi validation schema
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors,
      });
    }

    req.query = value;
    next();
  };
};

export default {
  validateRequest,
  validateParams,
  validateQuery,
};
