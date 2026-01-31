// Validation utility functions
import { VALIDATION } from '../constants';

export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  if (!VALIDATION.EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`;
  }
  if (!VALIDATION.PASSWORD_REGEX.test(password)) {
    return 'Password must contain uppercase, lowercase, and number';
  }
  return null;
};

export const validatePhoneNumber = (phone) => {
  if (!phone) {
    return null; // Phone is optional in most cases
  }
  if (!VALIDATION.PHONE_REGEX.test(phone)) {
    return 'Please enter a valid phone number';
  }
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (value, minLength, fieldName) => {
  if (!value) {
    return null; // Let required validation handle empty values
  }
  if (value.toString().length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  return null;
};

export const validateMaxLength = (value, maxLength, fieldName) => {
  if (!value) {
    return null; // Let required validation handle empty values
  }
  if (value.toString().length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return null;
};