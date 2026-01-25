import mongoose from 'mongoose';

/**
 * Audit Log Schema
 * Tracks important user actions for security and compliance
 */

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'LOGOUT',
        'REGISTER',
        'PASSWORD_CHANGE',
        'PASSWORD_RESET',
        'EMAIL_VERIFIED',
        'PROFILE_UPDATE',
        'ACCOUNT_DELETED',
        'ACCOUNT_ACTIVATED',
        'ACCOUNT_DEACTIVATED',
        'ROLE_CHANGED',
        'TOKEN_REFRESH',
        'FAILED_LOGIN',
      ],
      index: true,
    },
    details: {
      type: String,
      maxlength: 500,
    },
    ipAddress: {
      type: String,
      maxlength: 45, // IPv6 max length
    },
    userAgent: {
      type: String,
      maxlength: 500,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      default: 'SUCCESS',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

// TTL index to automatically delete old logs after 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
