// Validation utilities
// Updated: Added checkPasswordStrength to validators object

export const validators = {
  // Email validation
  email: (value) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return true;
  },

  // Password validation
  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(value)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(value)) {
      return 'Password must contain at least one number';
    }
    return true;
  },

  // Confirm password validation
  confirmPassword: (value, password) => {
    if (!value) return 'Please confirm your password';
    if (value !== password) {
      return 'Passwords do not match';
    }
    return true;
  },

  // Required field validation
  required: (fieldName = 'This field') => (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return true;
  },

  // Phone number validation
  phone: (value) => {
    if (!value) return true; // Optional field
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(value)) {
      return 'Please enter a valid phone number';
    }
    if (value.replace(/[^0-9]/g, '').length < 10) {
      return 'Phone number must be at least 10 digits';
    }
    return true;
  },

  // Min length validation
  minLength: (min, fieldName = 'This field') => (value) => {
    if (!value) return true;
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return true;
  },

  // Max length validation
  maxLength: (max, fieldName = 'This field') => (value) => {
    if (!value) return true;
    if (value.length > max) {
      return `${fieldName} must not exceed ${max} characters`;
    }
    return true;
  },

  // Positive number validation
  positiveNumber: (fieldName = 'This field') => (value) => {
    if (!value && value !== 0) return `${fieldName} is required`;
    if (isNaN(value) || Number(value) <= 0) {
      return `${fieldName} must be a positive number`;
    }
    return true;
  },

  // Non-negative number validation
  nonNegativeNumber: (fieldName = 'This field') => (value) => {
    if (!value && value !== 0) return `${fieldName} is required`;
    if (isNaN(value) || Number(value) < 0) {
      return `${fieldName} must be a non-negative number`;
    }
    return true;
  },

  // Postal code validation
  postalCode: (value) => {
    if (!value) return 'Postal code is required';
    const postalRegex = /^[0-9]{5,10}$/;
    if (!postalRegex.test(value)) {
      return 'Please enter a valid postal code';
    }
    return true;
  },

  // Full name validation
  fullName: (value) => {
    if (!value) return 'Full name is required';
    if (value.trim().length < 2) {
      return 'Full name must be at least 2 characters';
    }
    if (value.trim().length > 100) {
      return 'Full name must not exceed 100 characters';
    }
    return true;
  },

  // Order ID format validation
  orderId: (value) => {
    if (!value) return 'Order ID is required';
    const orderIdRegex = /^ORD-\d{4}-\d{7}$/;
    if (!orderIdRegex.test(value)) {
      return 'Invalid order ID format (Expected: ORD-YYYY-NNNNNNN)';
    }
    return true;
  },

  // Complaint ID format validation
  complaintId: (value) => {
    if (!value) return 'Complaint ID is required';
    const complaintIdRegex = /^CMP-\d{4}-\d{7}$/;
    if (!complaintIdRegex.test(value)) {
      return 'Invalid complaint ID format (Expected: CMP-YYYY-NNNNNNN)';
    }
    return true;
  },

  // Get password strength
  checkPasswordStrength: (password) => {
    if (!password) {
      return { score: 0, feedback: 'Enter a password', color: 'default' };
    }

    let score = 0;
    const feedback = [];

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('At least 8 characters');

    if (password.length >= 12) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Add numbers');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Add special characters');

    const strengthLabels = {
      0: 'Very Weak',
      1: 'Weak',
      2: 'Fair',
      3: 'Good',
      4: 'Strong',
      5: 'Very Strong',
    };

    return {
      score,
      feedback: feedback.length > 0 ? feedback.join(', ') : strengthLabels[score],
    };
  },
};
