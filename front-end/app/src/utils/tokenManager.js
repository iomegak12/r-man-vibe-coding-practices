// Token management utilities

const ACCESS_TOKEN_KEY = 'tradeease_access_token';
const REFRESH_TOKEN_KEY = 'tradeease_refresh_token';
const USER_KEY = 'tradeease_user';

export const tokenManager = {
  // Get access token
  getAccessToken: () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  // Set access token
  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  },

  // Get refresh token
  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Set refresh token
  setRefreshToken: (token) => {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  // Set both tokens
  setTokens: (accessToken, refreshToken) => {
    tokenManager.setAccessToken(accessToken);
    tokenManager.setRefreshToken(refreshToken);
  },

  // Get user
  getUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Set user
  setUser: (user) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  // Clear all authentication data
  clearAuth: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!tokenManager.getAccessToken();
  },

  // Check if user is admin
  isAdmin: () => {
    const user = tokenManager.getUser();
    return user && user.role === 'Administrator';
  },

  // Check if user is customer
  isCustomer: () => {
    const user = tokenManager.getUser();
    return user && user.role === 'Customer';
  },
};
