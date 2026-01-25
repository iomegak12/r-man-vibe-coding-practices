import mongoose from 'mongoose';

/**
 * RefreshToken Schema
 * Stores refresh tokens for token renewal without re-authentication
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound Indexes
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });

// TTL index - automatically delete expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Static Methods
 */

// Find valid token
refreshTokenSchema.statics.findValidToken = function (token) {
  return this.findOne({
    token,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });
};

// Revoke all tokens for a user
refreshTokenSchema.statics.revokeUserTokens = async function (userId) {
  return this.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true }
  );
};

// Find active tokens for user
refreshTokenSchema.statics.findActiveTokensByUser = function (userId) {
  return this.find({
    userId,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });
};

/**
 * Instance Methods
 */

// Check if token is valid
refreshTokenSchema.methods.isValid = function () {
  return !this.isRevoked && this.expiresAt > new Date();
};

// Revoke this token
refreshTokenSchema.methods.revoke = async function () {
  this.isRevoked = true;
  return this.save();
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
