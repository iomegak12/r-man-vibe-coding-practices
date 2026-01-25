import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import PasswordReset from '../models/PasswordReset.js';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from './emailService.js';
import { revokeAllUserTokens } from './tokenService.js';

/**
 * Password Service
 * Handles password reset functionality
 */

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

/**
 * Generate password reset token
 * @returns {String} Reset token
 */
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Calculate token expiration time
 * @returns {Date} Expiration date
 */
const calculateExpiration = () => {
  const expiresAt = new Date();
  const expirationTime = process.env.PASSWORD_RESET_TOKEN_EXPIRATION || '1h';
  
  // Parse expiration time (e.g., "1h", "30m")
  const timeValue = parseInt(expirationTime);
  const timeUnit = expirationTime.slice(-1);
  
  if (timeUnit === 'h') {
    expiresAt.setHours(expiresAt.getHours() + timeValue);
  } else if (timeUnit === 'm') {
    expiresAt.setMinutes(expiresAt.getMinutes() + timeValue);
  } else {
    expiresAt.setHours(expiresAt.getHours() + 1); // Default 1 hour
  }
  
  return expiresAt;
};

/**
 * Request password reset
 * @param {String} email - User email
 */
export const requestPasswordReset = async (email) => {
  // Find user by email
  const user = await User.findByEmail(email);

  if (!user) {
    // Don't reveal if email exists for security
    return {
      message: 'If an account exists with this email, you will receive a password reset link.',
    };
  }

  // Check if user is active
  if (!user.isActive) {
    const error = new Error('Account is deactivated');
    error.statusCode = 403;
    error.errors = [
      {
        field: 'account',
        message: 'Your account has been deactivated. Please contact support.',
      },
    ];
    throw error;
  }

  // Generate reset token
  const resetToken = generateResetToken();
  const expiresAt = calculateExpiration();

  // Invalidate any existing unused tokens
  await PasswordReset.invalidateUserTokens(user._id);

  // Create new reset token
  await PasswordReset.create({
    userId: user._id,
    email: user.email,
    resetToken,
    expiresAt,
  });

  // Send reset email
  try {
    await sendPasswordResetEmail(user.email, user.fullName, resetToken);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    // Don't throw error - token is still valid
  }

  return {
    message: 'If an account exists with this email, you will receive a password reset link.',
  };
};

/**
 * Reset password with token
 * @param {String} resetToken - Reset token
 * @param {String} newPassword - New password
 */
export const resetPassword = async (resetToken, newPassword) => {
  // Find valid reset token
  const passwordReset = await PasswordReset.findValidToken(resetToken);

  if (!passwordReset) {
    const error = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    error.errors = [
      {
        field: 'token',
        message: 'The password reset link is invalid or has expired. Please request a new one.',
      },
    ];
    throw error;
  }

  // Find user
  const user = await User.findById(passwordReset.userId).select('+password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.errors = [
      {
        field: 'user',
        message: 'User associated with this token does not exist.',
      },
    ];
    throw error;
  }

  // Check if user is active
  if (!user.isActive) {
    const error = new Error('Account is deactivated');
    error.statusCode = 403;
    error.errors = [
      {
        field: 'account',
        message: 'Your account has been deactivated. Please contact support.',
      },
    ];
    throw error;
  }

  // Check if new password is same as current
  const isSamePassword = await bcrypt.compare(newPassword, user.password);

  if (isSamePassword) {
    const error = new Error('New password must be different');
    error.statusCode = 400;
    error.errors = [
      {
        field: 'newPassword',
        message: 'New password must be different from your current password.',
      },
    ];
    throw error;
  }

  // Hash and update password
  user.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
  await user.save();

  // Mark token as used
  await passwordReset.markAsUsed();

  // Revoke all existing tokens
  await revokeAllUserTokens(user._id);

  // Send confirmation email
  try {
    await sendPasswordChangedEmail(user.email, user.fullName);
  } catch (error) {
    console.error('Failed to send password changed email:', error);
    // Don't throw error - password was still changed
  }

  // Audit log
  createAuditLog({
    userId: user._id,
    action: 'PASSWORD_RESET',
    details: 'Password reset via email token',
    metadata: { email: user.email },
  });

  return {
    message: 'Password has been reset successfully. Please login with your new password.',
  };
};

/**
 * Verify reset token validity
 * @param {String} resetToken - Reset token
 * @returns {Boolean} Token validity
 */
export const verifyResetToken = async (resetToken) => {
  const passwordReset = await PasswordReset.findValidToken(resetToken);
  return !!passwordReset;
};

export default {
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
};
