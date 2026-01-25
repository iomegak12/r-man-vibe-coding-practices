import express from 'express';
import {
  validateToken,
  getUserById,
  getUserByEmail,
} from '../controllers/internalController.js';
import { authenticateService } from '../middleware/serviceAuthMiddleware.js';
import { validateRequest, validateParams } from '../middleware/validationMiddleware.js';
import {
  validateTokenSchema,
  userIdParamSchema,
  emailParamSchema,
} from '../validators/internalValidators.js';

/**
 * Internal Routes
 * Service-to-service communication endpoints
 * All routes require service API key authentication
 */

const router = express.Router();

// All routes require service authentication
router.use(authenticateService);

/**
 * @swagger
 * /api/internal/validate-token:
 *   post:
 *     summary: Validate JWT access token
 *     description: Validate a JWT access token and return user details if valid (Service-to-service use only)
 *     tags: [Internal]
 *     security:
 *       - serviceApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT access token to validate
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token is valid
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
 *                   example: Token is valid
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Token is required or invalid
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidToken:
 *                 value:
 *                   success: false
 *                   message: Invalid or expired token
 *                   errors:
 *                     - field: token
 *                       message: The provided token is invalid or has expired
 *       403:
 *         description: Service API key missing or invalid
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/validate-token', validateRequest(validateTokenSchema), validateToken);

/**
 * @swagger
 * /api/internal/user/{userId}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve complete user details by user ID (Service-to-service use only)
 *     tags: [Internal]
 *     security:
 *       - serviceApiKey: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (MongoDB ObjectId)
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: User found
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
 *                   example: User found
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       403:
 *         description: Service API key missing or invalid
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/user/:userId', validateParams(userIdParamSchema), getUserById);

/**
 * @swagger
 * /api/internal/user/email/{email}:
 *   get:
 *     summary: Get user by email
 *     description: Retrieve complete user details by email address (Service-to-service use only)
 *     tags: [Internal]
 *     security:
 *       - serviceApiKey: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: User email address
 *         example: customer@example.com
 *     responses:
 *       200:
 *         description: User found
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
 *                   example: User found
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       403:
 *         description: Service API key missing or invalid
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/user/email/:email', validateParams(emailParamSchema), getUserByEmail);

export default router;
