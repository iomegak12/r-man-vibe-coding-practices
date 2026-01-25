import { verifyAccessToken } from '../services/tokenService.js';
import User from '../models/User.js';

/**
 * Internal Controller
 * Handles internal service-to-service communication endpoints
 */

/**
 * Validate JWT token
 * POST /api/internal/validate-token
 */
export const validateToken = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        data: {
          valid: false,
        },
      });
    }

    // Check if user exists and is active
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        data: {
          valid: false,
        },
      });
    }

    // Return validation result
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        valid: true,
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Token validation failed',
      errors: [
        {
          field: 'server',
          message: 'An error occurred during token validation',
        },
      ],
    });
  }
};

/**
 * Get user by ID
 * GET /api/internal/user/:userId
 */
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: [
          {
            field: 'userId',
            message: 'No user found with the provided ID',
          },
        ],
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          contactNumber: user.contactNumber,
          address: user.address,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      errors: [
        {
          field: 'server',
          message: 'An error occurred while retrieving user',
        },
      ],
    });
  }
};

/**
 * Get user by email
 * GET /api/internal/user/email/:email
 */
export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: [
          {
            field: 'email',
            message: 'No user found with the provided email',
          },
        ],
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          contactNumber: user.contactNumber,
          address: user.address,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      errors: [
        {
          field: 'server',
          message: 'An error occurred while retrieving user',
        },
      ],
    });
  }
};

export default {
  validateToken,
  getUserById,
  getUserByEmail,
};
