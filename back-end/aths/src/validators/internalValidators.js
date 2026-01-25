import Joi from 'joi';

/**
 * Internal Validators
 * Joi validation schemas for internal service endpoints
 */

/**
 * Validate token schema
 */
export const validateTokenSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Token is required',
      'any.required': 'Token is required',
    }),
});

/**
 * User ID parameter validation schema
 */
export const userIdParamSchema = Joi.object({
  userId: Joi.string()
    .length(24)
    .hex()
    .required()
    .messages({
      'string.length': 'User ID must be a valid MongoDB ObjectId',
      'string.hex': 'User ID must be a valid MongoDB ObjectId',
      'string.empty': 'User ID is required',
      'any.required': 'User ID is required',
    }),
});

/**
 * Email parameter validation schema
 */
export const emailParamSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),
});

export default {
  validateTokenSchema,
  userIdParamSchema,
  emailParamSchema,
};
