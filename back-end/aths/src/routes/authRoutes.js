import express from 'express';
import { register, login, refreshToken, logout, forgotPassword, resetPasswordHandler, resendVerification, verifyEmailHandler } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimitMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/authValidators.js';

/**
 * Authentication Routes
 * Public endpoints for user authentication
 */

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password. Sends verification email upon successful registration.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *                 description: User email address (must be unique)
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123!
 *                 description: Password (min 8 characters, must contain uppercase, lowercase, and number)
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: User full name
 *               contactNumber:
 *                 type: string
 *                 example: +919876543210
 *                 description: User contact number (optional)
 *               address:
 *                 $ref: '#/components/schemas/Address'
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       $ref: '#/components/schemas/Tokens'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: Email already registered
 *               errors:
 *                 - field: email
 *                   message: A user with this email already exists
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/register', authLimiter, validateRequest(registerSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password, returns JWT access and refresh tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 65a1b2c3d4e5f6g7h8i9j0k1
 *                         email:
 *                           type: string
 *                           example: john.doe@example.com
 *                         fullName:
 *                           type: string
 *                           example: John Doe
 *                         role:
 *                           type: string
 *                           example: Customer
 *                     tokens:
 *                       $ref: '#/components/schemas/Tokens'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: Invalid email or password
 *               errors:
 *                 - field: credentials
 *                   message: The email or password you entered is incorrect
 *       403:
 *         description: Account deactivated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: Account is deactivated
 *               errors:
 *                 - field: account
 *                   message: Your account has been deactivated. Please contact support.
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/login', authLimiter, validateRequest(loginSchema), login);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Generate new access token using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 description: Valid refresh token obtained from login/register
 *     responses:
 *       200:
 *         description: Token refreshed successfully
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
 *                   example: Token refreshed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     expiresIn:
 *                       type: number
 *                       example: 1800
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/refresh-token', validateRequest(refreshTokenSchema), refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout user and revoke refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 description: Refresh token to revoke
 *     responses:
 *       200:
 *         description: Logged out successfully
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
 *                   example: Logged out successfully
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/logout', validateRequest(logoutSchema), logout);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Send password reset link to user email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *                 description: User email address
 *     responses:
 *       200:
 *         description: Password reset email sent (returns success even if email doesn't exist for security)
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
 *                   example: If an account exists with this email, you will receive a password reset link.
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/forgot-password', passwordResetLimiter, validateRequest(forgotPasswordSchema), forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     description: Reset user password using reset token from email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123def456ghi789
 *                 description: Password reset token from email
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewSecurePass456!
 *                 description: New password (min 8 characters)
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *                   example: Password has been reset successfully. Please login with your new password.
 *       400:
 *         description: Invalid or expired reset token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: Invalid or expired reset token
 *               errors:
 *                 - field: token
 *                   message: The password reset link is invalid or has expired. Please request a new one.
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/reset-password', passwordResetLimiter, validateRequest(resetPasswordSchema), resetPasswordHandler);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email with token
 *     description: Verify user email address using verification token from email
 *     tags: [Authentication]
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
 *                 example: xyz789abc456def123
 *                 description: Email verification token from email
 *     responses:
 *       200:
 *         description: Email verified successfully
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
 *                   example: Email verified successfully
 *       400:
 *         description: Invalid or expired verification token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: Invalid or expired verification token
 *               errors:
 *                 - field: token
 *                   message: The verification link is invalid or has expired
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/verify-email', validateRequest(verifyEmailSchema), verifyEmailHandler);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend email verification
 *     description: Resend verification email to authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification email sent successfully
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
 *                   example: Verification email sent successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/resend-verification', authenticate, resendVerification);

export default router;
