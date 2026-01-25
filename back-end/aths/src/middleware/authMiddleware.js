import { verifyAccessToken } from '../services/tokenService.js';
import User from '../models/User.js';

/**
 * Authentication Middleware
 * Validates JWT tokens and attaches user to request
 */

/**
 * Authenticate JWT Token
 * Validates access token from Authorization header
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errors: [
          {
            field: 'authorization',
            message: 'No token provided. Please include a Bearer token in the Authorization header.',
          },
        ],
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        errors: [
          {
            field: 'token',
            message: 'The provided token is invalid or has expired. Please login again.',
          },
        ],
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        errors: [
          {
            field: 'user',
            message: 'The user associated with this token no longer exists.',
          },
        ],
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated',
        errors: [
          {
            field: 'account',
            message: 'Your account has been deactivated. Please contact support.',
          },
        ],
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id.toString();
    req.userRole = user.role;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      errors: [
        {
          field: 'server',
          message: 'An error occurred during authentication',
        },
      ],
    });
  }
};

/**
 * Optional Authentication
 * Attaches user if token is valid, but doesn't require authentication
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id.toString();
        req.userRole = user.role;
      }
    } catch (error) {
      // Invalid token, but it's optional so continue
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
};

export default {
  authenticate,
  optionalAuth,
};
