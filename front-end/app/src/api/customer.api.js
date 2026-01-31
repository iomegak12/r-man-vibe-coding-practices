// CRMS - Customer Service API
import { crmsAPI } from './axios-instance';
import { API_ENDPOINTS } from './endpoints';

export const customerAPI = {
  // Get my profile
  getMyProfile: () => {
    return crmsAPI.get(API_ENDPOINTS.CUSTOMER.ME);
  },

  // Get my statistics
  getMyStatistics: () => {
    return crmsAPI.get(API_ENDPOINTS.CUSTOMER.ME_STATISTICS);
  },

  // Admin: Get all customers
  getAllCustomers: (params) => {
    return crmsAPI.get(API_ENDPOINTS.CUSTOMER.LIST, { params });
  },

  // Admin: Search customers
  searchCustomers: (query, params = {}) => {
    return crmsAPI.get(API_ENDPOINTS.CUSTOMER.SEARCH, {
      params: { q: query, ...params },
    });
  },

  // Admin: Get customer analytics
  getCustomerAnalytics: () => {
    return crmsAPI.get(API_ENDPOINTS.CUSTOMER.ANALYTICS);
  },

  // Admin: Get customer by ID
  getCustomerById: (customerId) => {
    return crmsAPI.get(API_ENDPOINTS.CUSTOMER.BY_ID(customerId));
  },

  // Admin: Update customer
  updateCustomer: (customerId, data) => {
    return crmsAPI.put(API_ENDPOINTS.CUSTOMER.BY_ID(customerId), data);
  },

  // Admin: Update customer status
  updateCustomerStatus: (customerId, status, reason) => {
    return crmsAPI.patch(API_ENDPOINTS.CUSTOMER.UPDATE_STATUS(customerId), {
      status,
      reason,
    });
  },

  // Admin: Update customer type
  updateCustomerType: (customerId, customerType, notes) => {
    return crmsAPI.patch(API_ENDPOINTS.CUSTOMER.UPDATE_TYPE(customerId), {
      customerType,
      notes,
    });
  },

  // Admin: Add customer note
  addCustomerNote: (customerId, content) => {
    return crmsAPI.post(API_ENDPOINTS.CUSTOMER.ADD_NOTE(customerId), {
      content,
    });
  },

  // Admin: Delete customer
  deleteCustomer: (customerId) => {
    return crmsAPI.delete(API_ENDPOINTS.CUSTOMER.BY_ID(customerId));
  },

  // Health check
  healthCheck: () => {
    return crmsAPI.get(API_ENDPOINTS.HEALTH.BASIC);
  },
};
