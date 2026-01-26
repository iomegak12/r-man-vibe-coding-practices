import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateTokens } from './tokenService.js';
import { sendWelcomeEmail } from './emailService.js';
import { createCustomerInCRMS } from './customerService.js';
import * as logger from '../utils/logger.js';

/**
 * Authentication Service
 * Handles user registration and authentication logic
 */

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} Created user and tokens
 */
export const registerUser = async (userData) => {
  const { email, password, fullName, contactNumber, address, role } = userData;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    const error = new Error('User with this email already exists');
    error.statusCode = 409;
    error.errors = [
      {
        field: 'email',
        message: 'Email address is already registered',
      },
    ];
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // Create user
  const user = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    fullName,
    contactNumber,
    address,
    role: role || 'Customer',
    isActive: true,
    emailVerified: false,
  });

  // Generate tokens
  const tokens = await generateTokens(user);

  // Create customer in CRMS if role is Customer (non-blocking)
  if (user.role === 'Customer') {
    // Fire and forget - don't await to avoid blocking registration
    createCustomerInCRMS(user)
      .then((result) => {
        if (result.success) {
          logger.info('Customer created in CRMS', {
            userId: user._id,
            customerId: result.data.data?.customerId,
            email: user.email,
            timestamp: new Date().toISOString(),
          });
        } else {
          logger.warn('Failed to create customer in CRMS', {
            userId: user._id,
            email: user.email,
            error: result.error,
            timestamp: new Date().toISOString(),
          });
          // Customer can be created later via manual sync or retry
        }
      })
      .catch((error) => {
        logger.error('CRMS integration error', {
          userId: user._id,
          email: user.email,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      });
  }

  // Remove password from response
  const userResponse = user.toJSON();

  return {
    user: userResponse,
    tokens,
  };
};

/**
 * Authenticate user login
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Object} User and tokens
 */
export const loginUser = async (email, password) => {
  // Find user with password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.errors = [
      {
        field: 'credentials',
        message: 'The email or password you entered is incorrect',
      },
    ];
    throw error;
  }

  // Check if user is active
  if (!user.isActive) {
    const error = new Error('Account is deactivated');
    error.statusCode = 403;
    error.errors = [
      {
        field: 'account',
        message: 'Your account has been deactivated. Please contact support.',
      },
    ];
    throw error;
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.errors = [
      {
        field: 'credentials',
        message: 'The email or password you entered is incorrect',
      },
    ];
    throw error;
  }

  // Generate tokens
  const tokens = await generateTokens(user);

  // Remove password from response
  const userResponse = user.toJSON();

  return {
    user: userResponse,
    tokens,
  };
};

/**
 * Verify user credentials (for internal use)
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Object} User object
 */
export const verifyCredentials = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  return user;
};

export default {
  registerUser,
  loginUser,
  verifyCredentials,
};
