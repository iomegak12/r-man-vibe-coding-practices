import mongoose from 'mongoose';

/**
 * PasswordReset Schema
 * Stores password reset tokens for forgot password functionality
 */
const passwordResetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    resetToken: {
      type: String,
      required: [true, 'Reset token is required'],
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// TTL index - automatically delete expired reset tokens
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Static Methods
 */

// Find valid reset token
passwordResetSchema.statics.findValidToken = function (resetToken) {
  return this.findOne({
    resetToken,
    used: false,
    expiresAt: { $gt: new Date() },
  });
};

// Find reset tokens by email
passwordResetSchema.statics.findByEmail = function (email) {
  return this.find({
    email: email.toLowerCase(),
    used: false,
    expiresAt: { $gt: new Date() },
  });
};

// Invalidate all unused tokens for a user
passwordResetSchema.statics.invalidateUserTokens = async function (userId) {
  return this.updateMany(
    { userId, used: false },
    { used: true }
  );
};

/**
 * Instance Methods
 */

// Check if token is valid
passwordResetSchema.methods.isValid = function () {
  return !this.used && this.expiresAt > new Date();
};

// Mark token as used
passwordResetSchema.methods.markAsUsed = async function () {
  this.used = true;
  return this.save();
};

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

export default PasswordReset;
