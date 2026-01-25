import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from '../validators/userValidators.js';

/**
 * User Routes
 * Protected endpoints for user profile management
 */

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve authenticated user's profile information
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/profile', getProfile);

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update current user profile
 *     description: Update authenticated user's profile information (fullName, contactNumber, address)
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John M. Doe
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: User full name (optional)
 *               contactNumber:
 *                 type: string
 *                 example: +919876543211
 *                 description: User contact number (optional)
 *               address:
 *                 $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/profile', validateRequest(updateProfileSchema), updateProfile);

/**
 * @swagger
 * /api/user/change-password:
 *   put:
 *     summary: Change user password
 *     description: Change authenticated user's password (requires current password for security)
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewSecurePass456!
 *                 description: New password (min 8 characters, must contain uppercase, lowercase, and number)
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password changed successfully. Please login again with your new password.
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Incorrect current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: Current password is incorrect
 *               errors:
 *                 - field: currentPassword
 *                   message: The current password you entered is incorrect
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/change-password', validateRequest(changePasswordSchema), changePassword);

/**
 * @swagger
 * /api/user/account:
 *   delete:
 *     summary: Delete user account
 *     description: Delete (deactivate) authenticated user's account. This is a soft delete that sets isActive to false.
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *                 description: Current password for confirmation
 *     responses:
 *       200:
 *         description: Account deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Your account has been deactivated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/account', validateRequest(deleteAccountSchema), deleteAccount);

export default router;
