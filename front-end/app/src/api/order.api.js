// ORMS - Order Service API
import { ormsAPI } from './axios-instance';
import { API_ENDPOINTS } from './endpoints';

export const orderAPI = {
  // Create new order
  createOrder: (orderData) => {
    return ormsAPI.post(API_ENDPOINTS.ORDER.CREATE, orderData);
  },

  // Get my orders
  getMyOrders: (params) => {
    return ormsAPI.get(API_ENDPOINTS.ORDER.MY_ORDERS, { params });
  },

  // Get order by ID
  getOrderById: (orderId) => {
    return ormsAPI.get(API_ENDPOINTS.ORDER.BY_ID(orderId));
  },

  // Cancel order
  cancelOrder: (orderId, reason, reasonCategory) => {
    return ormsAPI.post(API_ENDPOINTS.ORDER.CANCEL(orderId), {
      reason,
      reasonCategory,
    });
  },

  // Request order return
  requestReturn: (orderId, returnData) => {
    return ormsAPI.post(API_ENDPOINTS.ORDER.RETURN(orderId), returnData);
  },

  // Get order history
  getOrderHistory: (orderId) => {
    return ormsAPI.get(API_ENDPOINTS.ORDER.HISTORY(orderId));
  },

  // Admin: Get all orders
  getAllOrders: (params) => {
    return ormsAPI.get(API_ENDPOINTS.ORDER.ADMIN_LIST, { params });
  },

  // Admin: Update order status
  updateOrderStatus: (orderId, newStatus, changeReason, trackingNumber) => {
    return ormsAPI.patch(API_ENDPOINTS.ORDER.ADMIN_UPDATE_STATUS(orderId), {
      newStatus,
      changeReason,
      trackingNumber,
    });
  },

  // Admin: Get order analytics
  getOrderAnalytics: () => {
    return ormsAPI.get(API_ENDPOINTS.ORDER.ADMIN_ANALYTICS);
  },

  // Health check
  healthCheck: () => {
    return ormsAPI.get(API_ENDPOINTS.HEALTH.BASIC);
  },
};
