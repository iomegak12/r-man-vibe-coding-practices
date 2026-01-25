/**
 * Logger Utility
 * Centralized logging for the application
 */

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = levels[LOG_LEVEL] || levels.info;

/**
 * Format log message with timestamp
 */
const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaString}`.trim();
};

/**
 * Log error messages
 */
export const error = (message, meta = {}) => {
  if (currentLevel >= levels.error) {
    console.error(formatMessage('error', message, meta));
  }
};

/**
 * Log warning messages
 */
export const warn = (message, meta = {}) => {
  if (currentLevel >= levels.warn) {
    console.warn(formatMessage('warn', message, meta));
  }
};

/**
 * Log info messages
 */
export const info = (message, meta = {}) => {
  if (currentLevel >= levels.info) {
    console.log(formatMessage('info', message, meta));
  }
};

/**
 * Log debug messages
 */
export const debug = (message, meta = {}) => {
  if (currentLevel >= levels.debug && NODE_ENV === 'development') {
    console.log(formatMessage('debug', message, meta));
  }
};

/**
 * Log HTTP requests
 */
export const logRequest = (req) => {
  info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
};

/**
 * Log authentication events
 */
export const logAuth = (event, userId, meta = {}) => {
  info(`Auth Event: ${event}`, {
    userId,
    ...meta,
  });
};

/**
 * Log security events
 */
export const logSecurity = (event, meta = {}) => {
  warn(`Security Event: ${event}`, meta);
};

export default {
  error,
  warn,
  info,
  debug,
  logRequest,
  logAuth,
  logSecurity,
};
