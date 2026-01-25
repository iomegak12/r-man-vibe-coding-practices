import Joi from 'joi';

/**
 * User Validators
 * Joi validation schemas for user profile endpoints
 */

/**
 * Update profile validation schema
 */
export const updateProfileSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Full name must be at least 2 characters',
      'string.max': 'Full name cannot exceed 100 characters',
    }),
  contactNumber: Joi.string()
    .min(10)
    .max(15)
    .pattern(/^[0-9+\-\s()]+$/)
    .optional()
    .allow(null, '')
    .messages({
      'string.min': 'Contact number must be at least 10 characters',
      'string.max': 'Contact number cannot exceed 15 characters',
      'string.pattern.base': 'Please provide a valid contact number',
    }),
  address: Joi.object({
    street: Joi.string().max(255).optional().allow(null, ''),
    city: Joi.string().max(100).optional().allow(null, ''),
    state: Joi.string().max(100).optional().allow(null, ''),
    zipCode: Joi.string().max(20).optional().allow(null, ''),
    country: Joi.string().max(100).optional().allow(null, ''),
  }).optional(),
});

/**
 * Change password validation schema
 */
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Current password is required',
      'any.required': 'Current password is required',
    }),
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.empty': 'New password is required',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'New password is required',
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Password confirmation is required',
      'any.required': 'Password confirmation is required',
    }),
});

/**
 * Delete account validation schema
 */
export const deleteAccountSchema = Joi.object({
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required to delete your account',
      'any.required': 'Password is required to delete your account',
    }),
  confirmation: Joi.string()
    .valid('DELETE')
    .required()
    .messages({
      'any.only': 'Please type DELETE to confirm account deletion',
      'string.empty': 'Confirmation is required',
      'any.required': 'Confirmation is required',
    }),
});

export default {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
};
