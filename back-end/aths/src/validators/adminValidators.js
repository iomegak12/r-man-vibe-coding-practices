import Joi from 'joi';

/**
 * Admin Validators
 * Joi validation schemas for admin endpoints
 */

/**
 * User query validation schema
 */
export const userQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  role: Joi.string().valid('Customer', 'Administrator').optional(),
  isActive: Joi.string().valid('true', 'false').optional(),
  search: Joi.string().max(255).optional(),
});

/**
 * Update role validation schema
 */
export const updateRoleSchema = Joi.object({
  role: Joi.string()
    .valid('Customer', 'Administrator')
    .required()
    .messages({
      'any.only': 'Role must be either Customer or Administrator',
      'any.required': 'Role is required',
    }),
});

/**
 * User ID parameter validation
 */
export const adminUserIdParamSchema = Joi.object({
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

export default {
  userQuerySchema,
  updateRoleSchema,
  adminUserIdParamSchema,
};
