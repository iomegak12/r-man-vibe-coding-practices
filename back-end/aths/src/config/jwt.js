import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * JWT Configuration
 * Handles JWT token generation and verification
 */

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ACCESS_TOKEN_EXPIRATION = process.env.JWT_ACCESS_TOKEN_EXPIRATION || '30m';
const JWT_REFRESH_TOKEN_EXPIRATION = process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d';

/**
 * Generate Access Token
 * @param {Object} payload - Token payload
 * @returns {String} JWT access token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRATION,
  });
};

/**
 * Generate Refresh Token
 * @param {Object} payload - Token payload
 * @returns {String} JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRATION,
  });
};

/**
 * Verify Token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decode Token (without verification)
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
};
