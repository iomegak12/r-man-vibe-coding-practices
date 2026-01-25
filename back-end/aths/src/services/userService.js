import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { revokeAllUserTokens } from '../services/tokenService.js';
import { sendPasswordChangedEmail } from './emailService.js';

/**
 * User Service
 * Handles user profile and account management
 */

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

/**
 * Get user profile by ID
 * @param {String} userId - User ID
 * @returns {Object} User profile
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.errors = [
      {
        field: 'user',
        message: 'The requested user does not exist',
      },
    ];
    throw error;
  }

  return user;
};

/**
 * Update user profile
 * @param {String} userId - User ID
 * @param {Object} updateData - Profile update data
 * @returns {Object} Updated user
 */
export const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.errors = [
      {
        field: 'user',
        message: 'User does not exist',
      },
    ];
    throw error;
  }

  // Update allowed fields
  const allowedUpdates = ['fullName', 'contactNumber', 'address'];
  
  Object.keys(updateData).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      user[key] = updateData[key];
    }
  });

  await user.save();

  return user;
};

/**
 * Change user password
 * @param {String} userId - User ID
 * @param {String} currentPassword - Current password
 * @param {String} newPassword - New password
 */
export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.errors = [
      {
        field: 'user',
        message: 'User does not exist',
      },
    ];
    throw error;
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 401;
    error.errors = [
      {
        field: 'currentPassword',
        message: 'The current password you entered is incorrect',
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
        message: 'New password must be different from your current password',
      },
    ];
    throw error;
  }

  // Hash and save new password
  user.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
  await user.save();

  // Revoke all existing tokens (force re-login)
  await revokeAllUserTokens(userId);

  // Send confirmation email (don't wait for it)
  sendPasswordChangedEmail(user.email, user.fullName).catch((error) => {
    console.error('Failed to send password changed email:', error);
  });
};

/**
 * Delete user account (soft delete)
 * @param {String} userId - User ID
 * @param {String} password - User password for confirmation
 */
export const deleteUserAccount = async (userId, password) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.errors = [
      {
        field: 'user',
        message: 'User does not exist',
      },
    ];
    throw error;
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error('Password is incorrect');
    error.statusCode = 401;
    error.errors = [
      {
        field: 'password',
        message: 'The password you entered is incorrect',
      },
    ];
    throw error;
  }

  // Soft delete - deactivate account
  user.isActive = false;
  await user.save();

  // Revoke all tokens
  await revokeAllUserTokens(userId);
};

/**
 * Permanently delete user account (hard delete)
 * @param {String} userId - User ID
 */
export const permanentlyDeleteUser = async (userId) => {
  await User.findByIdAndDelete(userId);
  await revokeAllUserTokens(userId);
};

export default {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount,
  permanentlyDeleteUser,
};
