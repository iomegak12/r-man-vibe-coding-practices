import {
  getAllUsers,
  getUserStats,
  activateUser,
  deactivateUser,
  updateUserRole,
  permanentlyDeleteUser,
} from '../services/adminService.js';
import { createAuditLog } from '../services/auditService.js';

/**
 * Admin Controller
 * Handles administrative operations
 */

/**
 * Get all users
 * GET /api/admin/users
 */
export const getUsers = async (req, res) => {
  try {
    const result = await getAllUsers(req.query);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve users',
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
 * Get user statistics
 * GET /api/admin/stats
 */
export const getStats = async (req, res) => {
  try {
    const stats = await getUserStats();

    res.status(200).json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
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
 * Activate user
 * PUT /api/admin/users/:userId/activate
 */
export const activateUserHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await activateUser(userId);

    // Audit log
    createAuditLog({
      userId: req.userId,
      action: 'ACCOUNT_ACTIVATED',
      details: `Admin activated user account: ${userId}`,
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { targetUserId: userId, adminId: req.userId },
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to activate user',
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
 * Deactivate user
 * PUT /api/admin/users/:userId/deactivate
 */
export const deactivateUserHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await deactivateUser(userId);

    // Audit log
    createAuditLog({
      userId: req.userId,
      action: 'ACCOUNT_DEACTIVATED',
      details: `Admin deactivated user account: ${userId}`,
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { targetUserId: userId, adminId: req.userId },
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to deactivate user',
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
 * Update user role
 * PUT /api/admin/users/:userId/role
 */
export const updateRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Prevent admin from changing their own role
    if (userId === req.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role',
        errors: [
          {
            field: 'userId',
            message: 'You cannot modify your own role',
          },
        ],
      });
    }

    const result = await updateUserRole(userId, role);

    // Audit log
    createAuditLog({
      userId: req.userId,
      action: 'ROLE_CHANGED',
      details: `Admin changed user role to ${role}: ${userId}`,
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { targetUserId: userId, newRole: role, adminId: req.userId },
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update user role',
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
 * Permanently delete user
 * DELETE /api/admin/users/:userId
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
        errors: [
          {
            field: 'userId',
            message: 'Use the account deletion feature to delete your own account',
          },
        ],
      });
    }

    const result = await permanentlyDeleteUser(userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete user',
      errors: [
        {
          field: 'server',
          message: 'An unexpected error occurred',
        },
      ],
    });
  }
};

export default {
  getUsers,
  getStats,
  activateUserHandler,
  deactivateUserHandler,
  updateRole,
  deleteUser,
};
