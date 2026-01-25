import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount,
} from '../services/userService.js';
import { createAuditLog } from '../services/auditService.js';

/**
 * User Controller
 * Handles user profile and account management requests
 */

/**
 * Get current user profile
 * GET /api/user/profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await getUserProfile(req.userId);

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve profile',
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
 * Update current user profile
 * PUT /api/user/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const user = await updateUserProfile(req.userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update profile',
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
 * Change user password
 * PUT /api/user/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await changeUserPassword(req.userId, currentPassword, newPassword);

    // Audit log
    createAuditLog({
      userId: req.userId,
      action: 'PASSWORD_CHANGE',
      details: 'User changed their password',
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again with your new password.',
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to change password',
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
 * Delete user account
 * DELETE /api/user/account
 */
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    await deleteUserAccount(req.userId, password);

    // Audit log
    createAuditLog({
      userId: req.userId,
      action: 'ACCOUNT_DELETED',
      details: 'User deleted their account',
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      success: true,
      message: 'Your account has been deactivated successfully',
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete account',
      errors: error.errors || [
        {
          field: 'server',
          message: 'An unexpected error occurred',
        },
      ],
    });
  }
};

export default {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};
