// CMPS - Complaint Service API
import { cmpsAPI } from './axios-instance';
import { API_ENDPOINTS } from './endpoints';

export const complaintAPI = {
  // Create new complaint
  createComplaint: (complaintData) => {
    return cmpsAPI.post(API_ENDPOINTS.COMPLAINT.CREATE, complaintData);
  },

  // Get my complaints
  getMyComplaints: (params) => {
    return cmpsAPI.get(API_ENDPOINTS.COMPLAINT.MY_COMPLAINTS, { params });
  },

  // Get all complaints (Admin)
  getAllComplaints: (params) => {
    return cmpsAPI.get(API_ENDPOINTS.COMPLAINT.LIST, { params });
  },

  // Search complaints (Admin)
  searchComplaints: (query, params = {}) => {
    return cmpsAPI.get(API_ENDPOINTS.COMPLAINT.SEARCH, {
      params: { q: query, ...params },
    });
  },

  // Get complaint by ID
  getComplaintById: (complaintId) => {
    return cmpsAPI.get(API_ENDPOINTS.COMPLAINT.BY_ID(complaintId));
  },

  // Get complaint comments
  getComments: (complaintId) => {
    return cmpsAPI.get(API_ENDPOINTS.COMPLAINT.COMMENTS(complaintId));
  },

  // Add comment to complaint
  addComment: (complaintId, comment, attachments = []) => {
    return cmpsAPI.post(API_ENDPOINTS.COMPLAINT.ADD_COMMENT(complaintId), {
      comment,
      attachments,
    });
  },

  // Admin: Assign complaint
  assignComplaint: (complaintId, data) => {
    return cmpsAPI.patch(API_ENDPOINTS.COMPLAINT.ASSIGN(complaintId), data);
  },

  // Admin: Update complaint status
  updateStatus: (complaintId, data) => {
    return cmpsAPI.patch(API_ENDPOINTS.COMPLAINT.UPDATE_STATUS(complaintId), data);
  },

  // Admin: Resolve complaint
  resolveComplaint: (complaintId, data) => {
    return cmpsAPI.post(API_ENDPOINTS.COMPLAINT.RESOLVE(complaintId), data);
  },

  // Admin: Close complaint
  closeComplaint: (complaintId, data) => {
    return cmpsAPI.post(API_ENDPOINTS.COMPLAINT.CLOSE(complaintId), data);
  },

  // Admin: Reopen complaint
  reopenComplaint: (complaintId, data) => {
    return cmpsAPI.post(API_ENDPOINTS.COMPLAINT.REOPEN(complaintId), data);
  },

  // Health check
  healthCheck: () => {
    return cmpsAPI.get(API_ENDPOINTS.HEALTH.BASIC);
  },
};
