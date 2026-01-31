// ATHS - Authentication Service API
import { athsAPI } from './axios-instance';
import { API_ENDPOINTS } from './endpoints';

export const authAPI = {
  // Register new user
  register: (userData) => {
    return athsAPI.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  },

  // Login user
  login: (credentials) => {
    return athsAPI.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  // Logout user
  logout: (refreshToken) => {
    return athsAPI.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
  },

  // Refresh access token
  refreshToken: (refreshToken) => {
    return athsAPI.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
  },

  // Forgot password
  forgotPassword: (email) => {
    return athsAPI.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  // Reset password
  resetPassword: (token, newPassword) => {
    return athsAPI.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
  },

  // Verify email
  verifyEmail: (token) => {
    return athsAPI.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  },

  // Resend verification email
  resendVerification: () => {
    return athsAPI.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION);
  },

  // Get user profile
  getUserProfile: () => {
    return athsAPI.get(API_ENDPOINTS.USER.PROFILE);
  },

  // Update user profile
  updateUserProfile: (userData) => {
    return athsAPI.put(API_ENDPOINTS.USER.PROFILE, userData);
  },

  // Change password
  changePassword: (currentPassword, newPassword) => {
    return athsAPI.put(API_ENDPOINTS.USER.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  },

  // Delete account
  deleteAccount: (password, confirmation) => {
    return athsAPI.delete(API_ENDPOINTS.USER.DELETE_ACCOUNT, {
      data: { password, confirmation },
    });
  },

  // Admin: Get all users
  getAllUsers: (params) => {
    return athsAPI.get(API_ENDPOINTS.ADMIN.USERS, { params });
  },

  // Admin: Get user statistics
  getUserStatistics: () => {
    return athsAPI.get(API_ENDPOINTS.ADMIN.STATS);
  },

  // Health check
  healthCheck: () => {
    return athsAPI.get(API_ENDPOINTS.HEALTH.BASIC);
  },

  // Detailed health check
  detailedHealthCheck: () => {
    return athsAPI.get(API_ENDPOINTS.HEALTH.DETAILED);
  },
};
