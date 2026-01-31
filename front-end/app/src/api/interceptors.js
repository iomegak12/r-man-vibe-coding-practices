// Axios interceptors for request/response handling
import { apiInstances } from './axios-instance';
import { tokenManager } from '../utils/tokenManager';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Setup interceptors for all API instances
export const setupInterceptors = (refreshTokenCallback, logoutCallback) => {
  Object.values(apiInstances).forEach((api) => {
    // Request interceptor - attach access token
    api.interceptors.request.use(
      (config) => {
        const token = tokenManager.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token refresh
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is not 401 or request already retried, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }

        // If refresh is already in progress, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt to refresh token
          const newAccessToken = await refreshTokenCallback();

          if (newAccessToken) {
            processQueue(null, newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } else {
            // Refresh failed, logout
            processQueue(new Error('Token refresh failed'), null);
            logoutCallback();
            return Promise.reject(error);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          logoutCallback();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    );
  });
};

// Remove interceptors (useful for cleanup)
export const removeInterceptors = () => {
  Object.values(apiInstances).forEach((api) => {
    api.interceptors.request.handlers = [];
    api.interceptors.response.handlers = [];
  });
};
