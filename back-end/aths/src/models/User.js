import mongoose from 'mongoose';

/**
 * User Schema
 * Stores user credentials, profile information, and account settings
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [255, 'Email cannot exceed 255 characters'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    contactNumber: {
      type: String,
      trim: true,
      minlength: [10, 'Contact number must be at least 10 characters'],
      maxlength: [15, 'Contact number cannot exceed 15 characters'],
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
    },
    role: {
      type: String,
      enum: {
        values: ['Customer', 'Administrator'],
        message: 'Role must be either Customer or Administrator',
      },
      default: 'Customer',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound Indexes
userSchema.index({ isActive: 1, role: 1 });

/**
 * Instance Methods
 */

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

/**
 * Static Methods
 */

// Find user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Find active users
userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true });
};

// Find users by role
userSchema.statics.findByRole = function (role) {
  return this.find({ role });
};

const User = mongoose.model('User', userSchema);

export default User;
