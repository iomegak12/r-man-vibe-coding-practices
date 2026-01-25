import Joi from 'joi';

/**
 * Authentication Validators
 * Joi validation schemas for authentication endpoints
 */

/**
 * Registration validation schema
 */
export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .max(255)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.empty': 'Password is required',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
    }),
  fullName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Full name must be at least 2 characters',
      'string.max': 'Full name cannot exceed 100 characters',
      'string.empty': 'Full name is required',
      'any.required': 'Full name is required',
    }),
  contactNumber: Joi.string()
    .min(10)
    .max(15)
    .pattern(/^[0-9+\-\s()]+$/)
    .optional()
    .messages({
      'string.min': 'Contact number must be at least 10 characters',
      'string.max': 'Contact number cannot exceed 15 characters',
      'string.pattern.base': 'Please provide a valid contact number',
    }),
  address: Joi.object({
    street: Joi.string().max(255).optional(),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional(),
    zipCode: Joi.string().max(20).optional(),
    country: Joi.string().max(100).optional(),
  }).optional(),
  role: Joi.string()
    .valid('Customer', 'Administrator')
    .default('Customer')
    .messages({
      'any.only': 'Role must be either Customer or Administrator',
    }),
});

/**
 * Login validation schema
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
    }),
});

/**
 * Refresh token validation schema
 */
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'string.empty': 'Refresh token is required',
      'any.required': 'Refresh token is required',
    }),
});

/**
 * Logout validation schema
 */
export const logoutSchema = Joi.object({
  refreshToken: Joi.string()
    .optional()
    .messages({
      'string.empty': 'Refresh token cannot be empty',
    }),
});

/**
 * Forgot password validation schema
 */
export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),
});

/**
 * Reset password validation schema
 */
export const resetPasswordSchema = Joi.object({
  resetToken: Joi.string()
    .required()
    .messages({
      'string.empty': 'Reset token is required',
      'any.required': 'Reset token is required',
    }),
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.empty': 'Password is required',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
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
 * Email verification validation schema
 */
export const verifyEmailSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Verification token is required',
      'any.required': 'Verification token is required',
    }),
});

export default {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
};
