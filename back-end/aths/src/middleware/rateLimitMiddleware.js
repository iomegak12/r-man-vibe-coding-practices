import rateLimit from 'express-rate-limit';

/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting the number of requests
 */

const RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED === 'true';
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 minutes
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    errors: [
      {
        field: 'rateLimit',
        message: `You have exceeded the ${MAX_REQUESTS} requests in ${WINDOW_MS / 60000} minutes limit`,
      },
    ],
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !RATE_LIMIT_ENABLED,
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    errors: [
      {
        field: 'rateLimit',
        message: 'Too many login attempts. Please try again after 15 minutes',
      },
    ],
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !RATE_LIMIT_ENABLED,
});

/**
 * Password reset rate limiter
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: {
    success: false,
    message: 'Too many password reset requests',
    errors: [
      {
        field: 'rateLimit',
        message: 'Too many password reset attempts. Please try again after 1 hour',
      },
    ],
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !RATE_LIMIT_ENABLED,
});

export default {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
};
