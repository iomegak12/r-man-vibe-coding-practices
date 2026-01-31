// Auth Context - Authentication state management
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth.api';
import { tokenManager } from '../utils/tokenManager';
import { setupInterceptors } from '../api/interceptors';
import { useToast } from './ToastContext';
import { ROUTES } from '../utils/constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = tokenManager.getUser();
      const accessToken = tokenManager.getAccessToken();

      if (storedUser && accessToken) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      tokenManager.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
      showSuccess('Logged out successfully');
      navigate(ROUTES.LOGIN);
    }
  }, [showSuccess, navigate]);

  // Setup axios interceptors
  useEffect(() => {
    const refreshToken = async () => {
      try {
        const refreshTokenValue = tokenManager.getRefreshToken();
        if (!refreshTokenValue) return null;

        const response = await authAPI.refreshToken(refreshTokenValue);
        const newAccessToken = response.data.data.accessToken;
        
        tokenManager.setAccessToken(newAccessToken);
        return newAccessToken;
      } catch (error) {
        return null;
      }
    };

    const handleLogout = () => {
      logout();
    };

    setupInterceptors(refreshToken, handleLogout);
  }, [logout]);

  // Register
  const register = useCallback(async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { accessToken, refreshToken, user: newUser } = response.data.data;

      tokenManager.setTokens(accessToken, refreshToken);
      tokenManager.setUser(newUser);
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      showSuccess('Registration successful! Welcome to TradeEase.');
      navigate(ROUTES.DASHBOARD);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      showError(message);
      return { success: false, error };
    }
  }, [showSuccess, showError, navigate]);

  // Login
  const login = useCallback(async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { accessToken, refreshToken, user: loggedInUser } = response.data.data;

      tokenManager.setTokens(accessToken, refreshToken);
      tokenManager.setUser(loggedInUser);
      
      setUser(loggedInUser);
      setIsAuthenticated(true);
      
      showSuccess(`Welcome back, ${loggedInUser.fullName}!`);
      navigate(ROUTES.DASHBOARD);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      showError(message);
      return { success: false, error };
    }
  }, [showSuccess, showError, navigate]);

  // Update user profile
  const updateProfile = useCallback(async (userData) => {
    try {
      const response = await authAPI.updateUserProfile(userData);
      const updatedUser = response.data.data.user;
      
      tokenManager.setUser(updatedUser);
      setUser(updatedUser);
      
      showSuccess('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      showError(message);
      return { success: false, error };
    }
  }, [showSuccess, showError]);

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      showSuccess('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      showError(message);
      return { success: false, error };
    }
  }, [showSuccess, showError]);

  // Check if user is admin
  const isAdmin = user && user.role === 'Administrator';
  const isCustomer = user && user.role === 'Customer';

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isCustomer,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
