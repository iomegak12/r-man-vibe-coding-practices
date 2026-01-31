// Error handling utilities

export const handleAPIError = (error, showToast) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        showToast('error', data.message || 'Bad request. Please check your input.');
        break;
        
      case 401:
        // Token expired - handled by interceptor
        showToast('error', 'Session expired. Please login again.');
        break;
        
      case 403:
        showToast('error', 'You do not have permission to perform this action.');
        break;
        
      case 404:
        showToast('error', data.message || 'The requested resource was not found.');
        break;
        
      case 409:
        showToast('error', data.message || 'A conflict occurred. Please try again.');
        break;
        
      case 422:
        // Validation errors
        if (data.data?.errors && Array.isArray(data.data.errors)) {
          // Return field-level errors for form handling
          return data.data.errors;
        }
        showToast('error', data.message || 'Validation failed. Please check your input.');
        break;
        
      case 500:
        showToast('error', 'Server error. Please try again later.');
        break;
        
      default:
        showToast('error', data.message || 'An unexpected error occurred.');
    }
    
    return data.data?.errors || null;
  } else if (error.request) {
    // Request made but no response
    showToast('error', 'Network error. Please check your internet connection.');
    return null;
  } else {
    // Something else happened
    showToast('error', error.message || 'An error occurred while processing your request.');
    return null;
  }
};

// Extract field errors from API response
export const extractFieldErrors = (errors) => {
  if (!errors || !Array.isArray(errors)) return {};
  
  const fieldErrors = {};
  
  errors.forEach((error) => {
    if (error.field) {
      // Handle nested field names like "body -> email"
      const fieldName = error.field.split(' -> ').pop() || error.field;
      fieldErrors[fieldName] = error.message || 'Invalid value';
    }
  });
  
  return fieldErrors;
};

// Format error message for display
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return 'An error occurred';
};

// Check if error is network error
export const isNetworkError = (error) => {
  return error.request && !error.response;
};

// Check if error is authentication error
export const isAuthError = (error) => {
  return error.response && (error.response.status === 401 || error.response.status === 403);
};

// Check if error is validation error
export const isValidationError = (error) => {
  return error.response && (error.response.status === 400 || error.response.status === 422);
};

// Log error for debugging
export const logError = (error, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack,
    });
  }
};
