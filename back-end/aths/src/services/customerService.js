import axios from 'axios';
import * as logger from '../utils/logger.js';

/**
 * Customer Service
 * Handles integration with CRMS (Customer Management Service)
 */

// Configure HTTP client for CRMS
const crmsClient = axios.create({
  baseURL: process.env.CRMS_BASE_URL || 'http://localhost:5002',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.CRMS_SERVICE_API_KEY,
  },
});

/**
 * Create customer record in CRMS
 * @param {Object} userData - User data from registration
 * @returns {Promise<Object>} - Customer creation response
 */
export const createCustomerInCRMS = async (userData) => {
  try {
    const response = await crmsClient.post('/api/customers/internal/create', {
      userId: userData._id.toString(), // Convert ObjectId to string
      email: userData.email,
      fullName: userData.fullName,
      contactNumber: userData.contactNumber,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    // Log error details
    logger.error('Failed to create customer in CRMS', {
      userId: userData._id,
      email: userData.email,
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Return failure but don't throw - registration should continue
    return {
      success: false,
      error: error.message,
      details: error.response?.data,
    };
  }
};

/**
 * Create customer in CRMS with retry mechanism (optional)
 * @param {Object} userData - User data from registration
 * @param {Number} retries - Number of retry attempts (default: 3)
 * @returns {Promise<Object>} - Customer creation response
 */
export const createCustomerInCRMSWithRetry = async (userData, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await crmsClient.post('/api/customers/internal/create', {
        userId: userData._id.toString(),
        email: userData.email,
        fullName: userData.fullName,
        contactNumber: userData.contactNumber,
      });

      logger.info(`Customer created in CRMS (attempt ${attempt}/${retries})`, {
        userId: userData._id,
        customerId: response.data.data?.customerId,
        email: userData.email,
      });

      return {
        success: true,
        data: response.data,
        attempt,
      };
    } catch (error) {
      logger.warn(`CRMS customer creation attempt ${attempt}/${retries} failed`, {
        userId: userData._id,
        email: userData.email,
        error: error.message,
        status: error.response?.status,
      });

      // Don't retry on 4xx errors (client errors)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        logger.error('Client error - not retrying', error.response.data);
        return {
          success: false,
          error: error.message,
          details: error.response?.data,
          attempt,
        };
      }

      // Last attempt failed
      if (attempt === retries) {
        logger.error('All CRMS customer creation attempts failed', {
          userId: userData._id,
          email: userData.email,
          attempts: retries,
        });

        return {
          success: false,
          error: error.message,
          details: error.response?.data,
          attempt,
        };
      }

      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export default {
  createCustomerInCRMS,
  createCustomerInCRMSWithRetry,
};
