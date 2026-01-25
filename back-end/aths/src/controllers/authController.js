import { registerUser, loginUser } from '../services/authService.js';
import { refreshAccessToken, revokeRefreshToken } from '../services/tokenService.js';
import { requestPasswordReset, resetPassword } from '../services/passwordService.js';
import { sendVerificationEmail, verifyEmail } from '../services/emailVerificationService.js';
import { createAuditLog } from '../services/auditService.js';
import { auditFailedLogin } from '../middleware/auditMiddleware.js';

/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);

    // Audit log
    createAuditLog({
      userId: result.user._id,
      action: 'REGISTER',
      details: `New user registered: ${result.user.email}`,
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { email: result.user.email },
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresIn: result.tokens.expiresIn,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Registration failed',
      errors: error.errors || [
        {
          field: 'server',
          message: 'An unexpected error occurred during registration',
        },
      ],
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    // Audit log
    createAuditLog({
      userId: result.user._id,
      action: 'LOGIN',
      details: `User logged in: ${result.user.email}`,
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { email: result.user.email },
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresIn: result.tokens.expiresIn,
      },
    });
  } catch (error) {
    // Log failed login attempt
    if (error.statusCode === 401) {
      auditFailedLogin(req.body.email, req);
    }

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Login failed',
      errors: error.errors || [
        {
          field: 'server',
          message: 'An unexpected error occurred during login',
        },
      ],
    });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Token refresh failed',
      errors: [
        {
          field: 'refreshToken',
          message: 'Invalid or expired refresh token. Please login again.',
        },
      ],
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      errors: [
        {
          field: 'server',
          message: 'An error occurred during logout',
        },
      ],
    });
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await requestPasswordReset(email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to process password reset request',
      errors: error.errors || [
        {
          field: 'server',
          message: 'An unexpected error occurred',
        },
      ],
    });
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPasswordHandler = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const result = await resetPassword(resetToken, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to reset password',
      errors: error.errors || [
        {
          field: 'server',
          message: 'An unexpected error occurred',
        },
      ],
    });
  }
};

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
export const resendVerification = async (req, res) => {
  try {
    const userId = req.userId; // From authenticate middleware
    const result = await sendVerificationEmail(userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to send verification email',
      errors: [
        {
          field: 'server',
          message: 'An unexpected error occurred',
        },
      ],
    });
  }
};

/**
 * Verify email with token
 * POST /api/auth/verify-email
 */
export const verifyEmailHandler = async (req, res) => {
  try {
    const { token } = req.body;
    const result = await verifyEmail(token);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Email verification failed',
      errors: [
        {
          field: 'token',
          message: 'The verification link is invalid or has expired',
        },
      ],
    });
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPasswordHandler,
  resendVerification,
  verifyEmailHandler,
};
