// Admin API - For administrator operations
import { crmsAPI } from './axios-instance';
import { API_ENDPOINTS } from './endpoints';

export const adminAPI = {
  // Customer Management
  getAllCustomers: async (params = {}) => {
    return crmsAPI.get(API_ENDPOINTS.CUSTOMER.LIST, { params });
  },

  getCustomerById: async (customerId) => {
    return crmsAPI.get(API_ENDPOINTS.CUSTOMER.BY_ID(customerId));
  },

  updateCustomer: async (customerId, data) => {
    return crmsAPI.put(API_ENDPOINTS.CUSTOMER.BY_ID(customerId), data);
  },

  deleteCustomer: async (customerId) => {
    return crmsAPI.delete(API_ENDPOINTS.CUSTOMER.BY_ID(customerId));
  },

  // Statistics
  getAdminStatistics: async () => {
    return crmsAPI.get(API_ENDPOINTS.CUSTOMER.ANALYTICS);
  },

  // Order Management (for future)
  getAllOrders: async (params = {}) => {
    return crmsAPI.get('/admin/orders', { params });
  },

  // Complaint Management (for future)
  getAllComplaints: async (params = {}) => {
    return crmsAPI.get('/admin/complaints', { params });
  },
};
