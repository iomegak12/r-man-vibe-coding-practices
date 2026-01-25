import AuditLog from '../models/AuditLog.js';
import { logSecurity } from '../utils/logger.js';

/**
 * Audit Service
 * Handles audit logging for security and compliance
 */

/**
 * Create audit log entry
 * @param {Object} data - Audit log data
 */
export const createAuditLog = async (data) => {
  try {
    const {
      userId,
      action,
      details,
      ipAddress,
      userAgent,
      metadata = {},
      status = 'SUCCESS',
    } = data;

    const auditLog = await AuditLog.create({
      userId,
      action,
      details,
      ipAddress,
      userAgent,
      metadata,
      status,
    });

    logSecurity(`Audit log created: ${action} by user ${userId}`, {
      auditLogId: auditLog._id,
      action,
      status,
    });

    return auditLog;
  } catch (error) {
    // Don't throw error to prevent audit failures from breaking main flow
    logSecurity(`Failed to create audit log: ${error.message}`, {
      error: error.message,
      data,
    });
    return null;
  }
};

/**
 * Get audit logs for a user
 * @param {String} userId - User ID
 * @param {Object} options - Query options
 */
export const getUserAuditLogs = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 20,
    action,
    startDate,
    endDate,
  } = options;

  const query = { userId };

  if (action) {
    query.action = action;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    AuditLog.countDocuments(query),
  ]);

  return {
    logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get recent login attempts (for security monitoring)
 * @param {String} userId - User ID
 * @param {Number} limit - Number of records
 */
export const getRecentLoginAttempts = async (userId, limit = 10) => {
  return await AuditLog.find({
    userId,
    action: { $in: ['LOGIN', 'FAILED_LOGIN'] },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

/**
 * Get system-wide audit statistics
 */
export const getAuditStats = async () => {
  const [
    totalLogs,
    todayLogs,
    failedLogins,
    successfulLogins,
  ] = await Promise.all([
    AuditLog.countDocuments(),
    AuditLog.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }),
    AuditLog.countDocuments({ action: 'FAILED_LOGIN' }),
    AuditLog.countDocuments({ action: 'LOGIN', status: 'SUCCESS' }),
  ]);

  return {
    totalLogs,
    todayLogs,
    failedLogins,
    successfulLogins,
  };
};

export default {
  createAuditLog,
  getUserAuditLogs,
  getRecentLoginAttempts,
  getAuditStats,
};
