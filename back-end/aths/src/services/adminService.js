import User from '../models/User.js';
import { revokeAllUserTokens } from './tokenService.js';

/**
 * Admin Service
 * Handles administrative user management operations
 */

/**
 * Get all users with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Object} Users list with pagination
 */
export const getAllUsers = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    role,
    isActive,
    search,
  } = options;

  const query = {};

  // Filter by role
  if (role) {
    query.role = role;
  }

  // Filter by active status
  if (isActive !== undefined) {
    query.isActive = isActive === 'true' || isActive === true;
  }

  // Search by name or email
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get user statistics
 * @returns {Object} User statistics
 */
export const getUserStats = async () => {
  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    verifiedUsers,
    customerCount,
    adminCount,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
    User.countDocuments({ emailVerified: true }),
    User.countDocuments({ role: 'Customer' }),
    User.countDocuments({ role: 'Administrator' }),
  ]);

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    verifiedUsers,
    unverifiedUsers: totalUsers - verifiedUsers,
    customerCount,
    adminCount,
  };
};

/**
 * Activate user account
 * @param {String} userId - User ID
 */
export const activateUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.isActive) {
    const error = new Error('User is already active');
    error.statusCode = 400;
    throw error;
  }

  user.isActive = true;
  await user.save();

  return {
    message: 'User activated successfully',
    user,
  };
};

/**
 * Deactivate user account
 * @param {String} userId - User ID
 */
export const deactivateUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('User is already inactive');
    error.statusCode = 400;
    throw error;
  }

  user.isActive = false;
  await user.save();

  // Revoke all tokens
  await revokeAllUserTokens(userId);

  return {
    message: 'User deactivated successfully',
    user,
  };
};

/**
 * Update user role
 * @param {String} userId - User ID
 * @param {String} newRole - New role
 */
export const updateUserRole = async (userId, newRole) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!['Customer', 'Administrator'].includes(newRole)) {
    const error = new Error('Invalid role');
    error.statusCode = 400;
    throw error;
  }

  user.role = newRole;
  await user.save();

  // Revoke all tokens to force re-login with new role
  await revokeAllUserTokens(userId);

  return {
    message: 'User role updated successfully',
    user,
  };
};

/**
 * Permanently delete user (admin only)
 * @param {String} userId - User ID
 */
export const permanentlyDeleteUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Prevent deleting the last admin
  if (user.role === 'Administrator') {
    const adminCount = await User.countDocuments({ role: 'Administrator' });
    if (adminCount <= 1) {
      const error = new Error('Cannot delete the last administrator');
      error.statusCode = 400;
      throw error;
    }
  }

  await User.findByIdAndDelete(userId);
  await revokeAllUserTokens(userId);

  return {
    message: 'User permanently deleted',
  };
};

export default {
  getAllUsers,
  getUserStats,
  activateUser,
  deactivateUser,
  updateUserRole,
  permanentlyDeleteUser,
};
