// API Configuration
export const API_CONFIG = {
  // Development Base URLs - Updated for mobile access
  ATHS_BASE_URL: 'http://192.168.0.4:5001', // Authentication Service
  CRMS_BASE_URL: 'http://192.168.0.4:5002', // Customer Relationship Management Service
  ORMS_BASE_URL: 'http://192.168.0.4:5003', // Order Management Service
  CMPS_BASE_URL: 'http://192.168.0.4:5004', // Complaint Management Service
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'TradeEase Mobile',
  VERSION: '1.0.0',
  ENVIRONMENT: 'development',
  DEEP_LINK_SCHEME: 'tradease',
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@tradease_access_token',
  REFRESH_TOKEN: '@tradease_refresh_token',
  USER_DATA: '@tradease_user_data',
  THEME_PREFERENCE: '@tradease_theme',
  LANGUAGE_PREFERENCE: '@tradease_language',
  BIOMETRIC_ENABLED: '@tradease_biometric',
  WELCOME_COMPLETED: '@tradease_welcome_completed',
};

// Navigation Routes
export const ROUTES = {
  // Welcome Stack
  WELCOME: {
    INTRO: 'WelcomeIntro',
    FEATURES: 'WelcomeFeatures', 
    DASHBOARD: 'WelcomeDashboard',
  },
  
  // Auth Stack
  AUTH: {
    LOGIN: 'Login',
    REGISTER: 'Register',
    FORGOT_PASSWORD: 'ForgotPassword',
    RESET_PASSWORD: 'ResetPassword',
  },
  
  // Main App Stack
  MAIN: {
    DRAWER: 'DrawerNavigator',
    DASHBOARD: 'Dashboard',
    CUSTOMERS: 'Customers',
    ORDERS: 'Orders',
    COMPLAINTS: 'Complaints',
    PROFILE: 'Profile',
  },
  
  // Customer Stack
  CUSTOMER: {
    LIST: 'CustomerList',
    DETAILS: 'CustomerDetails',
    EDIT: 'CustomerEdit',
    CREATE: 'CustomerCreate',
  },
  
  // Order Stack
  ORDER: {
    LIST: 'OrderList',
    DETAILS: 'OrderDetails',
    EDIT: 'OrderEdit',
    TRACKING: 'OrderTracking',
  },
  
  // Complaint Stack
  COMPLAINT: {
    LIST: 'ComplaintList',
    DETAILS: 'ComplaintDetails',
    ASSIGN: 'ComplaintAssign',
    RESOLVE: 'ComplaintResolve',
  },
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'Administrator',
  CUSTOMER: 'Customer',
};

// Order Statuses
export const ORDER_STATUS = {
  PLACED: 'Placed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURN_REQUESTED: 'Return Requested',
  RETURNED: 'Returned',
};

// Complaint Statuses
export const COMPLAINT_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
};

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

// Customer Types
export const CUSTOMER_TYPES = {
  REGULAR: 'Regular',
  PREMIUM: 'Premium',
  VIP: 'VIP',
};

// Customer Status
export const CUSTOMER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]{10,15}$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number.',
  REQUIRED_FIELD: 'This field is required.',
};