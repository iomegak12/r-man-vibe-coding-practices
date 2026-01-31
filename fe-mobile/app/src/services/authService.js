import apiClient from './apiClient';
import { API_CONFIG } from '../constants';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

class AuthService {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Login response with user data and tokens
   */
  async login(email, password) {
    try {
      const response = await apiClient.post(`${API_CONFIG.ATHS_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data.data,
        };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        return {
          success: false,
          message: errorData.message || 'Login failed',
          data: null,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
        data: null,
      };
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email
   * @param {string} userData.password
   * @param {string} userData.fullName
   * @param {string} userData.contactNumber
   * @returns {Promise} Registration response
   */
  async register(userData) {
    try {
      const response = await apiClient.post(`${API_CONFIG.ATHS_BASE_URL}/api/auth/register`, userData);

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data.data,
        };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
        return {
          success: false,
          message: errorData.message || 'Registration failed',
          data: null,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
        data: null,
      };
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} Token refresh response
   */
  async refreshToken(refreshToken) {
    try {
      const response = await apiClient.post(`${API_CONFIG.ATHS_BASE_URL}/api/auth/refresh-token`, {
        refreshToken,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data.data,
        };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Token refresh failed' }));
        return {
          success: false,
          message: errorData.message || 'Token refresh failed',
          data: null,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
        data: null,
      };
    }
  }

  /**
   * Logout user
   * @returns {Promise} Logout response
   */
  async logout() {
    try {
      const response = await apiClient.post(`${API_CONFIG.ATHS_BASE_URL}/api/auth/logout`);
      
      // Even if the API call fails, consider logout successful locally
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      // Network error, but still successful logout locally
      return {
        success: true,
        message: 'Logged out locally',
      };
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} Forgot password response
   */
  async forgotPassword(email) {
    try {
      const response = await apiClient.post(`${API_CONFIG.ATHS_BASE_URL}/api/auth/forgot-password`, {
        email,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: data.message,
        };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to send reset email' }));
        return {
          success: false,
          message: errorData.message || 'Failed to send reset email',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token from email
   * @param {string} newPassword - New password
   * @returns {Promise} Reset password response
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post(`${API_CONFIG.ATHS_BASE_URL}/api/auth/reset-password`, {
        token,
        newPassword,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: data.message,
        };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Password reset failed' }));
        return {
          success: false,
          message: errorData.message || 'Password reset failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  }

  /**
   * Get current user profile
   * @returns {Promise} User profile response
   */
  async getProfile() {
    try {
      const response = await apiClient.get(`${API_CONFIG.ATHS_BASE_URL}/api/auth/profile`);

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data.data,
        };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to get profile' }));
        return {
          success: false,
          message: errorData.message || 'Failed to get profile',
          data: null,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
        data: null,
      };
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile update data
   * @returns {Promise} Profile update response
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put(`${API_CONFIG.ATHS_BASE_URL}/api/auth/profile`, profileData);

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data.data,
        };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Profile update failed' }));
        return {
          success: false,
          message: errorData.message || 'Profile update failed',
          data: null,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
        data: null,
      };
    }
  }
}

export default new AuthService();