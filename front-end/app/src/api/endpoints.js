// API Endpoints Configuration

export const API_ENDPOINTS = {
  // Base URLs
  ATHS: process.env.REACT_APP_ATHS_URL || 'http://localhost:5001',
  CRMS: process.env.REACT_APP_CRMS_URL || 'http://localhost:5002',
  ORMS: process.env.REACT_APP_ORMS_URL || 'http://localhost:5003',
  CMPS: process.env.REACT_APP_CMPS_URL || 'http://localhost:5004',

  // ATHS - Authentication Service
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
    RESEND_VERIFICATION: '/api/auth/resend-verification',
  },

  USER: {
    PROFILE: '/api/user/profile',
    CHANGE_PASSWORD: '/api/user/change-password',
    DELETE_ACCOUNT: '/api/user/account',
  },

  ADMIN: {
    USERS: '/api/admin/users',
    STATS: '/api/admin/stats',
  },

  HEALTH: {
    BASIC: '/health',
    DETAILED: '/health/detailed',
  },

  // CRMS - Customer Service
  CUSTOMER: {
    ME: '/api/customers/me',
    ME_STATISTICS: '/api/customers/me/statistics',
    LIST: '/api/customers',
    SEARCH: '/api/customers/search',
    ANALYTICS: '/api/customers/analytics',
    BY_ID: (id) => `/api/customers/${id}`,
    UPDATE_STATUS: (id) => `/api/customers/${id}/status`,
    UPDATE_TYPE: (id) => `/api/customers/${id}/type`,
    ADD_NOTE: (id) => `/api/customers/${id}/notes`,
  },

  // ORMS - Order Service
  ORDER: {
    CREATE: '/api/orders',
    MY_ORDERS: '/api/orders/me',
    BY_ID: (id) => `/api/orders/${id}`,
    CANCEL: (id) => `/api/orders/${id}/cancel`,
    RETURN: (id) => `/api/orders/${id}/return`,
    HISTORY: (id) => `/api/orders/${id}/history`,
    ADMIN_LIST: '/api/admin/orders',
    ADMIN_UPDATE_STATUS: (id) => `/api/admin/orders/${id}/status`,
    ADMIN_ANALYTICS: '/api/admin/orders/analytics',
  },

  // CMPS - Complaint Service
  COMPLAINT: {
    CREATE: '/api/complaints',
    MY_COMPLAINTS: '/api/complaints/me',
    LIST: '/api/complaints',
    SEARCH: '/api/complaints/search',
    BY_ID: (id) => `/api/complaints/${id}`,
    COMMENTS: (id) => `/api/complaints/${id}/comments`,
    ADD_COMMENT: (id) => `/api/complaints/${id}/comments`,
    ASSIGN: (id) => `/api/complaints/${id}/assign`,
    UPDATE_STATUS: (id) => `/api/complaints/${id}/status`,
    UPDATE_PRIORITY: (id) => `/api/complaints/${id}/priority`,
    RESOLVE: (id) => `/api/complaints/${id}/resolve`,
    CLOSE: (id) => `/api/complaints/${id}/close`,
    REOPEN: (id) => `/api/complaints/${id}/reopen`,
  },
};
