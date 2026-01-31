import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, USER_ROLES } from '../constants';
import authService from '../services/authService';

// Initial state
const initialState = {
  isLoading: true,
  isAuthenticated: false,
  hasSeenWelcome: false,
  user: null,
  accessToken: null,
  refreshToken: null,
};

// Action types
const AUTH_ACTIONS = {
  RESTORE_TOKEN: 'RESTORE_TOKEN',
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT',
  UPDATE_TOKENS: 'UPDATE_TOKENS',
  UPDATE_USER: 'UPDATE_USER',
  SET_WELCOME_SEEN: 'SET_WELCOME_SEEN',
};

// Reducer
function authReducer(prevState, action) {
  switch (action.type) {
    case AUTH_ACTIONS.RESTORE_TOKEN:
      return {
        ...prevState,
        isLoading: false,
        isAuthenticated: !!action.payload.accessToken,
        hasSeenWelcome: action.payload.hasSeenWelcome,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    case AUTH_ACTIONS.SIGN_IN:
      return {
        ...prevState,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    case AUTH_ACTIONS.SIGN_OUT:
      return {
        ...prevState,
        isLoading: false,
        isAuthenticated: false,
        hasSeenWelcome: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      };
    case AUTH_ACTIONS.UPDATE_TOKENS:
      return {
        ...prevState,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...prevState,
        user: action.payload.user,
      };
    case AUTH_ACTIONS.SET_WELCOME_SEEN:
      return {
        ...prevState,
        hasSeenWelcome: true,
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

// Create context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore authentication state on app launch
  useEffect(() => {
    const restoreAuthState = async () => {
      try {
        const [accessToken, refreshToken, userData, welcomeCompleted] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
          AsyncStorage.getItem(STORAGE_KEYS.WELCOME_COMPLETED),
        ]);

        const user = userData ? JSON.parse(userData) : null;
        const hasSeenWelcome = welcomeCompleted === 'true';

        dispatch({
          type: AUTH_ACTIONS.RESTORE_TOKEN,
          payload: {
            accessToken,
            refreshToken,
            user,
            hasSeenWelcome,
          },
        });
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        dispatch({
          type: AUTH_ACTIONS.RESTORE_TOKEN,
          payload: {
            accessToken: null,
            refreshToken: null,
            user: null,
            hasSeenWelcome: false,
          },
        });
      }
    };

    restoreAuthState();
  }, []);

  // Sign in function
  const signIn = async (userData, tokens) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData)),
      ]);

      dispatch({
        type: AUTH_ACTIONS.SIGN_IN,
        payload: {
          user: userData,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      console.error('Failed to save auth data:', error);
      throw error;
    }
  };

  // Login function with API call
  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);

      if (result.success) {
        const { user, accessToken, refreshToken } = result.data;
        await signIn(user, { accessToken, refreshToken });
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Call logout API
      await authService.logout();

      // Clear local storage
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      ]);

      dispatch({ type: AUTH_ACTIONS.SIGN_OUT });
    } catch (error) {
      console.error('Failed to logout:', error);
      // Still sign out locally even if API call fails
      dispatch({ type: AUTH_ACTIONS.SIGN_OUT });
    }
  };

  // Update tokens (for refresh token flow)
  const updateTokens = async (tokens) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
      ]);

      dispatch({
        type: AUTH_ACTIONS.UPDATE_TOKENS,
        payload: tokens,
      });
    } catch (error) {
      console.error('Failed to update tokens:', error);
      throw error;
    }
  };

  // Update user data
  const updateUser = async (userData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: { user: userData },
      });
    } catch (error) {
      console.error('Failed to update user data:', error);
      throw error;
    }
  };

  // Set welcome as seen
  const setWelcomeSeen = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WELCOME_COMPLETED, 'true');
      dispatch({ type: AUTH_ACTIONS.SET_WELCOME_SEEN });
    } catch (error) {
      console.error('Failed to save welcome completion:', error);
      // Still update state even if storage fails
      dispatch({ type: AUTH_ACTIONS.SET_WELCOME_SEEN });
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      const result = await authService.forgotPassword(email);
      return result;
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    try {
      const result = await authService.resetPassword(token, newPassword);
      return result;
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  // Helper functions
  const isAdmin = () => {
    return state.user?.role === USER_ROLES.ADMIN;
  };

  const isCustomer = () => {
    return state.user?.role === USER_ROLES.CUSTOMER;
  };

  const value = {
    ...state,
    signIn,
    login,
    signOut,
    updateTokens,
    updateUser,
    setWelcomeSeen,
    forgotPassword,
    resetPassword,
    isAdmin,
    isCustomer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;