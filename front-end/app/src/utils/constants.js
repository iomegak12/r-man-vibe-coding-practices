// Application constants

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

// Complaint Categories
export const COMPLAINT_CATEGORY = {
  PRODUCT_QUALITY: 'Product Quality',
  DELIVERY_ISSUE: 'Delivery Issue',
  CUSTOMER_SERVICE: 'Customer Service',
  PAYMENT_ISSUE: 'Payment Issue',
  RETURN_REFUND: 'Return/Refund',
  WEBSITE_APP_ISSUE: 'Website/App Issue',
  OTHER: 'Other',
};

// Complaint Priorities
export const COMPLAINT_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

// Customer Statuses
export const CUSTOMER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
};

// Customer Types
export const CUSTOMER_TYPE = {
  REGULAR: 'Regular',
  PREMIUM: 'Premium',
  VIP: 'VIP',
};

// User Roles
export const USER_ROLE = {
  CUSTOMER: 'Customer',
  ADMINISTRATOR: 'Administrator',
};

// Order Cancellation Reason Categories
export const CANCELLATION_REASON_CATEGORY = {
  CUSTOMER_REQUEST: 'Customer Request',
  OUT_OF_STOCK: 'Out of Stock',
  PAYMENT_FAILED: 'Payment Failed',
  DUPLICATE_ORDER: 'Duplicate Order',
  OTHER: 'Other',
};

// Return Reason Categories
export const RETURN_REASON_CATEGORY = {
  PRODUCT_QUALITY: 'Product Quality',
  WRONG_PRODUCT: 'Wrong Product',
  PRODUCT_DAMAGED: 'Product Damaged',
  NOT_SATISFIED: 'Not Satisfied',
  OTHER: 'Other',
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Status color mapping
export const STATUS_COLORS = {
  // Order statuses
  [ORDER_STATUS.PLACED]: 'info',
  [ORDER_STATUS.PROCESSING]: 'warning',
  [ORDER_STATUS.SHIPPED]: 'primary',
  [ORDER_STATUS.DELIVERED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'error',
  [ORDER_STATUS.RETURN_REQUESTED]: 'warning',
  [ORDER_STATUS.RETURNED]: 'default',

  // Complaint statuses
  [COMPLAINT_STATUS.OPEN]: 'error',
  [COMPLAINT_STATUS.IN_PROGRESS]: 'warning',
  [COMPLAINT_STATUS.RESOLVED]: 'success',
  [COMPLAINT_STATUS.CLOSED]: 'default',
  [COMPLAINT_STATUS.REOPENED]: 'error',

  // Complaint priorities
  [COMPLAINT_PRIORITY.LOW]: 'default',
  [COMPLAINT_PRIORITY.MEDIUM]: 'info',
  [COMPLAINT_PRIORITY.HIGH]: 'warning',
  [COMPLAINT_PRIORITY.CRITICAL]: 'error',

  // Customer statuses
  [CUSTOMER_STATUS.ACTIVE]: 'success',
  [CUSTOMER_STATUS.INACTIVE]: 'default',
  [CUSTOMER_STATUS.SUSPENDED]: 'error',

  // Customer types
  [CUSTOMER_TYPE.REGULAR]: 'default',
  [CUSTOMER_TYPE.PREMIUM]: 'primary',
  [CUSTOMER_TYPE.VIP]: 'secondary',
};

// Date format patterns
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_FULL: 'MMMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
};

// Toast notification duration
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
};

// Service health check interval
export const HEALTH_CHECK_INTERVAL = 60000; // 60 seconds

// Token refresh threshold
export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

// Validation limits
export const VALIDATION_LIMITS = {
  EMAIL_MAX: 255,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  NAME_MIN: 2,
  NAME_MAX: 100,
  PHONE_MIN: 10,
  PHONE_MAX: 15,
  ADDRESS_MIN: 5,
  ADDRESS_MAX: 200,
  POSTAL_CODE_MIN: 5,
  POSTAL_CODE_MAX: 10,
  DESCRIPTION_MIN: 20,
  DESCRIPTION_MAX: 2000,
  SUBJECT_MIN: 5,
  SUBJECT_MAX: 200,
  NOTES_MAX: 1000,
  COMMENT_MIN: 10,
  COMMENT_MAX: 2000,
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  ORDERS_CREATE: '/orders/create',
  ORDERS: '/orders',
  ORDER_DETAILS: '/orders/:orderId',
  COMPLAINTS_CREATE: '/complaints/create',
  COMPLAINTS: '/complaints',
  COMPLAINT_DETAILS: '/complaints/:complaintId',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_CUSTOMER_DETAILS: '/admin/customers/:customerId',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_COMPLAINTS: '/admin/complaints',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
};
