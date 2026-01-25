import { v4 as uuidv4 } from 'uuid';
import RefreshToken from '../models/RefreshToken.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../config/jwt.js';

/**
 * Token Service
 * Handles token generation, validation, and management
 */

/**
 * Create token payload from user object
 * @param {Object} user - User object
 * @returns {Object} Token payload
 */
const createTokenPayload = (user) => {
  return {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };
};

/**
 * Generate access and refresh tokens for a user
 * @param {Object} user - User object
 * @returns {Object} Access token and refresh token
 */
export const generateTokens = async (user) => {
  const payload = createTokenPayload(user);

  // Generate access token
  const accessToken = generateAccessToken(payload);

  // Generate refresh token
  const refreshTokenValue = generateRefreshToken({ ...payload, tokenId: uuidv4() });

  // Calculate expiration date (7 days from now)
  const expiresAt = new Date();
  const expirationDays = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION) || 7;
  expiresAt.setDate(expiresAt.getDate() + expirationDays);

  // Save refresh token to database
  const refreshToken = await RefreshToken.create({
    userId: user._id,
    token: refreshTokenValue,
    expiresAt,
  });

  return {
    accessToken,
    refreshToken: refreshToken.token,
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '30m',
  };
};

/**
 * Verify and refresh access token
 * @param {String} refreshTokenValue - Refresh token
 * @returns {Object} New access token
 */
export const refreshAccessToken = async (refreshTokenValue) => {
  // Verify token format
  let decoded;
  try {
    decoded = verifyToken(refreshTokenValue);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }

  // Find token in database
  const refreshToken = await RefreshToken.findValidToken(refreshTokenValue);

  if (!refreshToken) {
    throw new Error('Refresh token not found or has been revoked');
  }

  // Generate new access token
  const payload = {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  };

  const accessToken = generateAccessToken(payload);

  return {
    accessToken,
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '30m',
  };
};

/**
 * Revoke a refresh token
 * @param {String} refreshTokenValue - Refresh token to revoke
 */
export const revokeRefreshToken = async (refreshTokenValue) => {
  const refreshToken = await RefreshToken.findOne({ token: refreshTokenValue });

  if (refreshToken) {
    await refreshToken.revoke();
  }
};

/**
 * Revoke all refresh tokens for a user
 * @param {String} userId - User ID
 */
export const revokeAllUserTokens = async (userId) => {
  await RefreshToken.revokeUserTokens(userId);
};

/**
 * Verify access token
 * @param {String} token - Access token
 * @returns {Object} Decoded token payload
 */
export const verifyAccessToken = (token) => {
  return verifyToken(token);
};

export default {
  generateTokens,
  refreshAccessToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  verifyAccessToken,
};
