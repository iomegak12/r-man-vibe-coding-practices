import express from 'express';
import {
  getUsers,
  getStats,
  activateUserHandler,
  deactivateUserHandler,
  updateRole,
  deleteUser,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';
import { validateQuery, validateRequest, validateParams } from '../middleware/validationMiddleware.js';
import {
  userQuerySchema,
  updateRoleSchema,
  adminUserIdParamSchema,
} from '../validators/adminValidators.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     UserListItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65a1b2c3d4e5f6g7h8i9j0k1
 *         email:
 *           type: string
 *           example: john.doe@example.com
 *         fullName:
 *           type: string
 *           example: John Doe
 *         contactNumber:
 *           type: string
 *           example: +919876543210
 *         role:
 *           type: string
 *           enum: [Customer, Administrator]
 *           example: Customer
 *         isActive:
 *           type: boolean
 *           example: true
 *         emailVerified:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2026-01-25T10:30:00.000Z
 *     UserStatistics:
 *       type: object
 *       properties:
 *         totalUsers:
 *           type: number
 *           example: 150
 *         activeUsers:
 *           type: number
 *           example: 142
 *         inactiveUsers:
 *           type: number
 *           example: 8
 *         verifiedUsers:
 *           type: number
 *           example: 135
 *         unverifiedUsers:
 *           type: number
 *           example: 15
 *         customerCount:
 *           type: number
 *           example: 145
 *         adminCount:
 *           type: number
 *           example: 5
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: number
 *           example: 1
 *         limit:
 *           type: number
 *           example: 10
 *         total:
 *           type: number
 *           example: 150
 *         pages:
 *           type: number
 *           example: 15
 */

/**
 * Admin Routes
 * Administrative endpoints for user management
 * All routes require authentication and Administrator role
 */

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve list of all users with pagination and filtering options (Administrator only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [Customer, Administrator]
 *         description: Filter by user role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by account status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                   example: Users retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserListItem'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/users', validateQuery(userQuerySchema), getUsers);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieve user statistics dashboard (total, active, verified users, role counts)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                   example: Statistics retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/UserStatistics'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/stats', getStats);

/**
 * @swagger
 * /api/admin/users/{userId}/activate:
 *   put:
 *     summary: Activate user account
 *     description: Activate a deactivated user account (Administrator only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: User activated successfully
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
 *                   example: User activated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: User is already active
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/users/:userId/activate', validateParams(adminUserIdParamSchema), activateUserHandler);

/**
 * @swagger
 * /api/admin/users/{userId}/deactivate:
 *   put:
 *     summary: Deactivate user account
 *     description: Deactivate a user account and revoke all tokens (Administrator only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: User deactivated successfully
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
 *                   example: User deactivated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: User is already inactive
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/users/:userId/deactivate', validateParams(adminUserIdParamSchema), deactivateUserHandler);

/**
 * @swagger
 * /api/admin/users/{userId}/role:
 *   put:
 *     summary: Update user role
 *     description: Change user role between Customer and Administrator. Revokes all tokens to force re-login. (Administrator only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [Customer, Administrator]
 *                 example: Administrator
 *                 description: New role for the user
 *     responses:
 *       200:
 *         description: User role updated successfully
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
 *                   example: User role updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Cannot change own role or invalid role
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put(
  '/users/:userId/role',
  validateParams(adminUserIdParamSchema),
  validateRequest(updateRoleSchema),
  updateRole
);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   delete:
 *     summary: Permanently delete user
 *     description: Permanently delete a user account. Prevents deleting the last administrator. (Administrator only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: User permanently deleted
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
 *                   example: User permanently deleted
 *       400:
 *         description: Cannot delete own account or last administrator
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               ownAccount:
 *                 value:
 *                   success: false
 *                   message: Cannot delete your own account
 *                   errors:
 *                     - field: userId
 *                       message: Use the account deletion feature to delete your own account
 *               lastAdmin:
 *                 value:
 *                   success: false
 *                   message: Cannot delete the last administrator
 *                   errors:
 *                     - field: userId
 *                       message: At least one administrator must remain in the system
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/users/:userId', validateParams(adminUserIdParamSchema), deleteUser);

export default router;
