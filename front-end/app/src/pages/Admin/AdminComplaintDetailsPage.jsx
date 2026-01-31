// Admin Complaint Details Page - Manage and resolve complaints
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/common/Layout/MainLayout';
import { useToast } from '../../contexts/ToastContext';
import { complaintAPI } from '../../api/complaint.api';
import { COMPLAINT_STATUS, COMPLAINT_PRIORITY } from '../../utils/constants';
import { formatDate, formatDateTime } from '../../utils/helpers';

export const AdminComplaintDetailsPage = () => {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);

  // Form states
  const [assignData, setAssignData] = useState({ assignTo: '', notes: '' });
  const [statusData, setStatusData] = useState({ status: '', notes: '' });
  const [closeData, setCloseData] = useState({ notes: '' });
  const [reopenData, setReopenData] = useState({ reason: '' });
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchComplaintDetails();
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    setLoading(true);
    try {
      const response = await complaintAPI.getComplaintById(complaintId);
      setComplaint(response.data?.data || response.data);
    } catch (error) {
      console.error('Failed to fetch complaint:', error);
      showError(error.response?.data?.message || 'Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await complaintAPI.getComments(complaintId);
      const data = response.data?.data || response.data;
      
      if (Array.isArray(data)) {
        setComments(data);
      } else if (Array.isArray(data.comments)) {
        setComments(data.comments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    }
  };

  const handleAssignComplaint = async (e) => {
    e.preventDefault();
    try {
      await complaintAPI.assignComplaint(complaintId, assignData);
      showSuccess('Complaint assigned successfully');
      setShowAssignModal(false);
      setAssignData({ assignTo: '', notes: '' });
      fetchComplaintDetails();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to assign complaint');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await complaintAPI.updateStatus(complaintId, statusData);
      showSuccess('Status updated successfully');
      setShowStatusModal(false);
      setStatusData({ status: '', notes: '' });
      fetchComplaintDetails();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCloseComplaint = async (e) => {
    e.preventDefault();
    try {
      await complaintAPI.closeComplaint(complaintId, closeData);
      showSuccess('Complaint closed successfully');
      setShowCloseModal(false);
      setCloseData({ notes: '' });
      fetchComplaintDetails();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to close complaint');
    }
  };

  const handleReopenComplaint = async (e) => {
    e.preventDefault();
    try {
      await complaintAPI.reopenComplaint(complaintId, {
        reason: reopenData.reason,
      });
      showSuccess('Complaint reopened successfully');
      setShowReopenModal(false);
      setReopenData({ reason: '' });
      fetchComplaintDetails();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to reopen complaint');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await complaintAPI.addComment(complaintId, { comment: newComment });
      showSuccess('Comment added successfully');
      setNewComment('');
      fetchComments();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add comment');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      [COMPLAINT_STATUS.OPEN]: 'badge bg-red text-white',
      [COMPLAINT_STATUS.IN_PROGRESS]: 'badge bg-yellow text-white',
      [COMPLAINT_STATUS.RESOLVED]: 'badge bg-green text-white',
      [COMPLAINT_STATUS.CLOSED]: 'badge bg-secondary text-white',
      [COMPLAINT_STATUS.REOPENED]: 'badge bg-orange text-white',
    };
    return statusClasses[status] || 'badge bg-secondary text-white';
  };

  const getPriorityBadgeClass = (priority) => {
    const priorityClasses = {
      [COMPLAINT_PRIORITY.LOW]: 'badge bg-secondary-lt text-white',
      [COMPLAINT_PRIORITY.MEDIUM]: 'badge bg-info-lt text-white',
      [COMPLAINT_PRIORITY.HIGH]: 'badge bg-warning-lt text-white',
      [COMPLAINT_PRIORITY.CRITICAL]: 'badge bg-danger-lt text-white',
    };
    return priorityClasses[priority] || 'badge bg-secondary-lt text-white';
  };

  if (loading || !complaint) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  const canAssign = complaint.status !== COMPLAINT_STATUS.CLOSED;
  const canUpdateStatus = complaint.status !== COMPLAINT_STATUS.CLOSED;
  const canClose = complaint.status !== COMPLAINT_STATUS.CLOSED;
  const canReopen = complaint.status === COMPLAINT_STATUS.CLOSED;

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col">
            <div className="mb-1">
              <button className="btn btn-ghost-secondary" onClick={() => navigate('/admin/complaints')}>
                <i className="ti ti-arrow-left me-2"></i>
                Back to Complaints
              </button>
            </div>
            <h2 className="page-title">Complaint #{complaint.complaintId}</h2>
          </div>
          <div className="col-auto ms-auto">
            <div className="btn-list">
              {canAssign && (
                <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>
                  <i className="ti ti-user-plus me-2"></i>
                  Assign
                </button>
              )}
              {canUpdateStatus && (
                <button className="btn btn-primary" onClick={() => setShowStatusModal(true)}>
                  <i className="ti ti-edit me-2"></i>
                  Update Status
                </button>
              )}
              {canClose && (
                <button className="btn btn-success" onClick={() => setShowCloseModal(true)}>
                  <i className="ti ti-check me-2"></i>
                  Close
                </button>
              )}
              {canReopen && (
                <button className="btn btn-warning" onClick={() => setShowReopenModal(true)}>
                  <i className="ti ti-refresh me-2"></i>
                  Reopen
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Complaint Details */}
        <div className="col-12">
          <div className="card mb-3">
            <div className="card-header">
              <h3 className="card-title">Complaint Information</h3>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted">Subject</label>
                    <div className="h4">{complaint.subject}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Customer</label>
                    <div>
                      <strong>{complaint.customerName || complaint.customerId}</strong>
                      {complaint.customerEmail && (
                        <div className="text-muted small">{complaint.customerEmail}</div>
                      )}
                    </div>
                  </div>
                  {complaint.orderId && (
                    <div className="mb-3">
                      <label className="form-label text-muted">Related Order</label>
                      <div>
                        <button
                          className="btn btn-link p-0"
                          onClick={() => navigate(`/admin/orders/${complaint.orderId}`)}
                        >
                          #{complaint.orderId}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted">Category</label>
                    <div>{complaint.category}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Priority</label>
                    <div>
                      <span className={getPriorityBadgeClass(complaint.priority)}>
                        {complaint.priority}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Status</label>
                    <div>
                      <span className={getStatusBadgeClass(complaint.status)}>
                        {complaint.status}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Created</label>
                    <div>{formatDateTime(complaint.createdAt)}</div>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted">Description</label>
                <div className="border rounded p-3 bg-light">
                  {complaint.description}
                </div>
              </div>
              {complaint.assignedTo && (
                <div className="mb-3">
                  <label className="form-label text-muted">Assigned To</label>
                  <div>
                    <strong>{complaint.assignedTo}</strong>
                    {complaint.assignedAt && (
                      <span className="text-muted ms-2">
                        on {formatDateTime(complaint.assignedAt)}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {complaint.resolution && (
                <div className="mb-3">
                  <label className="form-label text-muted">Resolution</label>
                  <div className="border rounded p-3 bg-success-lt">
                    {complaint.resolution}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Comments</h3>
            </div>
            <div className="card-body">
              {comments.length === 0 ? (
                <p className="text-muted">No comments yet.</p>
              ) : (
                <div className="mb-3">
                  {comments.map((comment, index) => (
                    <div key={index} className="mb-3 pb-3 border-bottom">
                      <div className="d-flex justify-content-between mb-2">
                        <div>
                          <strong>{comment.commentedBy}</strong>
                          {comment.isAdmin && (
                            <span className="badge bg-primary-lt ms-2">Admin</span>
                          )}
                        </div>
                        <span className="text-muted small">
                          {formatDateTime(comment.commentedAt)}
                        </span>
                      </div>
                      <div>{comment.comment}</div>
                    </div>
                  ))}
                </div>
              )}

              {complaint.status !== COMPLAINT_STATUS.CLOSED && (
                <form onSubmit={handleAddComment}>
                  <div className="mb-3">
                    <label className="form-label">Add Comment</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <i className="ti ti-send me-2"></i>
                    Add Comment
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal modal-blur fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleAssignComplaint}>
                <div className="modal-header">
                  <h5 className="modal-title">Assign Complaint</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAssignModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Assign To <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={assignData.assignTo}
                      onChange={(e) =>
                        setAssignData({ ...assignData, assignTo: e.target.value })
                      }
                      placeholder="Enter staff name or ID"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={assignData.notes}
                      onChange={(e) =>
                        setAssignData({ ...assignData, notes: e.target.value })
                      }
                      placeholder="Add assignment notes..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => setShowAssignModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Assign
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="modal modal-blur fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleUpdateStatus}>
                <div className="modal-header">
                  <h5 className="modal-title">Update Status</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowStatusModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">New Status <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={statusData.status}
                      onChange={(e) =>
                        setStatusData({ ...statusData, status: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Status</option>
                      <option value={COMPLAINT_STATUS.OPEN}>Open</option>
                      <option value={COMPLAINT_STATUS.IN_PROGRESS}>In Progress</option>
                      <option value={COMPLAINT_STATUS.RESOLVED}>Resolved</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Reason <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={statusData.notes}
                      onChange={(e) =>
                        setStatusData({ ...statusData, notes: e.target.value })
                      }
                      placeholder="Explain the reason for status change..."
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => setShowStatusModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {showCloseModal && (
        <div className="modal modal-blur fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleCloseComplaint}>
                <div className="modal-header">
                  <h5 className="modal-title">Close Complaint</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCloseModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Resolution <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={closeData.notes}
                      onChange={(e) =>
                        setCloseData({ ...closeData, notes: e.target.value })
                      }
                      placeholder="Describe how this complaint was resolved..."
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => setShowCloseModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Close Complaint
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Modal */}
      {showReopenModal && (
        <div className="modal modal-blur fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleReopenComplaint}>
                <div className="modal-header">
                  <h5 className="modal-title">Reopen Complaint</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowReopenModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Reason <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={reopenData.reason}
                      onChange={(e) =>
                        setReopenData({ ...reopenData, reason: e.target.value })
                      }
                      placeholder="Explain why this complaint needs to be reopened..."
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => setShowReopenModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning">
                    Reopen Complaint
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {(showAssignModal || showStatusModal || showCloseModal || showReopenModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </MainLayout>
  );
};
