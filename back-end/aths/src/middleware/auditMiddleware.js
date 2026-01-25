import { createAuditLog } from '../services/auditService.js';

/**
 * Audit Middleware
 * Automatically logs important user actions
 */

/**
 * Extract IP address from request
 */
const getIpAddress = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

/**
 * Audit log middleware
 * @param {String} action - Action to log
 * @param {Function} getDetails - Optional function to extract details from req
 */
export const auditLog = (action, getDetails = null) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.json;

    // Override res.json to capture response
    res.json = function (data) {
      // Only log if request was successful (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.userId) {
        const details = getDetails ? getDetails(req) : null;
        
        createAuditLog({
          userId: req.userId,
          action,
          details,
          ipAddress: getIpAddress(req),
          userAgent: req.headers['user-agent'] || 'unknown',
          metadata: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
          },
          status: 'SUCCESS',
        });
      }

      // Call original send function
      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Audit failed login attempts
 */
export const auditFailedLogin = async (email, req) => {
  try {
    // Try to find user by email to get userId
    const User = (await import('../models/User.js')).default;
    const user = await User.findOne({ email }).select('_id');

    if (user) {
      await createAuditLog({
        userId: user._id,
        action: 'FAILED_LOGIN',
        details: `Failed login attempt for ${email}`,
        ipAddress: getIpAddress(req),
        userAgent: req.headers['user-agent'] || 'unknown',
        metadata: {
          email,
          method: req.method,
          path: req.path,
        },
        status: 'FAILURE',
      });
    }
  } catch (error) {
    // Silently fail - don't break login flow
  }
};

export default {
  auditLog,
  auditFailedLogin,
};
