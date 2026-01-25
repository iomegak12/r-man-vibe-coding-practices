import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmailVerificationEmail } from './emailService.js';

/**
 * Email Verification Service
 * Handles email verification functionality
 */

/**
 * Generate email verification token
 * @returns {String} Verification token
 */
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Send email verification
 * @param {String} userId - User ID
 */
export const sendVerificationEmail = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.emailVerified) {
    const error = new Error('Email already verified');
    error.statusCode = 400;
    throw error;
  }

  // Generate verification token
  const verificationToken = generateVerificationToken();

  // Store token in user document (using a temporary field)
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await user.save();

  // Send verification email
  try {
    await sendEmailVerificationEmail(user.email, user.fullName, verificationToken);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }

  return {
    message: 'Verification email sent successfully',
  };
};

/**
 * Verify email with token
 * @param {String} token - Verification token
 */
export const verifyEmail = async (token) => {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) {
    const error = new Error('Invalid or expired verification token');
    error.statusCode = 400;
    throw error;
  }

  // Mark email as verified
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  // Audit log
  createAuditLog({
    userId: user._id,
    action: 'EMAIL_VERIFIED',
    details: 'User verified their email address',
    metadata: { email: user.email },
  });

  return {
    message: 'Email verified successfully',
  };
};

export default {
  sendVerificationEmail,
  verifyEmail,
};
