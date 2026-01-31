import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants';

/**
 * Custom API client using fetch for React Native compatibility
 * Handles authentication, token refresh, and common HTTP operations
 */

class ApiClient {
  constructor() {
    this.baseURL = '';
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
  }

  /**
   * Get authorization headers
   */
  async getAuthHeaders() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch (error) {
      console.error('Failed to get access token:', error);
      return {};
    }
  }

  /**
   * Make HTTP request with fetch
   */
  async request(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    const authHeaders = await this.getAuthHeaders();
    const headers = {
      ...this.defaultHeaders,
      ...authHeaders,
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(fullUrl, config);
      
      // Handle 401 - try to refresh token
      if (response.status === 401 && !config._retry) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry with new token
          config._retry = true;
          const newAuthHeaders = await this.getAuthHeaders();
          config.headers = {
            ...config.headers,
            ...newAuthHeaders,
          };
          return fetch(fullUrl, config);
        }
      }

      return response;
    } catch (error) {
      console.error('Network request failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_CONFIG.ATHS_BASE_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const { accessToken, refreshToken: newRefreshToken } = data.data;
        
        // Update stored tokens
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        if (newRefreshToken) {
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
        }
        
        return true;
      }
      
      // Refresh failed - clear tokens
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Clear tokens on error
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      
      return false;
    }
  }

  /**
   * GET request
   */
  async get(url, config = {}) {
    return this.request(url, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(url, data = null, config = {}) {
    const body = data ? JSON.stringify(data) : null;
    return this.request(url, { ...config, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put(url, data = null, config = {}) {
    const body = data ? JSON.stringify(data) : null;
    return this.request(url, { ...config, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch(url, data = null, config = {}) {
    const body = data ? JSON.stringify(data) : null;
    return this.request(url, { ...config, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete(url, config = {}) {
    return this.request(url, { ...config, method: 'DELETE' });
  }
}

// Create and export instance
const apiClient = new ApiClient();
export default apiClient;