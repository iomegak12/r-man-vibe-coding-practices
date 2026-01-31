// Complaint Details Page - View complaint and add comments
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../components/common/Layout/MainLayout';
import { useToast } from '../../contexts/ToastContext';
import { complaintAPI } from '../../api/complaint.api';
import { COMPLAINT_STATUS, COMPLAINT_PRIORITY } from '../../utils/constants';
import { formatDate, formatDateTime } from '../../utils/helpers';

export const ComplaintDetailsPage = () => {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Comment form
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaintDetails();
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    setLoading(true);
    try {
      const response = await complaintAPI.getComplaintById(complaintId);
      const data = response.data?.data || response.data;
      setComplaint(data);
    } catch (error) {
      console.error('Failed to fetch complaint details:', error);
      showError(error.response?.data?.message || 'Failed to load complaint details');
      if (error.response?.status === 404) {
        navigate('/complaints');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const response = await complaintAPI.getComments(complaintId);
      const data = response.data?.data || response.data;
      // Ensure comments is always an array
      if (Array.isArray(data)) {
        setComments(data);
      } else if (data?.comments && Array.isArray(data.comments)) {
        setComments(data.comments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      showError('Please enter a comment');
      return;
    }

    if (newComment.trim().length < 5) {
      showError('Comment must be at least 5 characters');
      return;
    }

    setSubmitting(true);
    try {
      await complaintAPI.addComment(complaintId, newComment.trim());
      showSuccess('Comment added successfully');
      setNewComment('');
      fetchComments();
      fetchComplaintDetails(); // Refresh to get updated status if needed
    } catch (error) {
      console.error('Failed to add comment:', error);
      showError(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
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

  if (loading) {
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

  if (!complaint) {
    return (
      <MainLayout>
        <div className="empty">
          <p className="empty-title">Complaint not found</p>
          <div className="empty-action">
            <button className="btn btn-primary" onClick={() => navigate('/complaints')}>
              Back to Complaints
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col">
            <div className="mb-1">
              <button
                className="btn btn-ghost-secondary btn-sm"
                onClick={() => navigate('/complaints')}
              >
                <i className="ti ti-arrow-left me-1"></i>
                Back to Complaints
              </button>
            </div>
            <h2 className="page-title">Complaint Details</h2>
            <div className="text-muted mt-1">
              Complaint ID: <strong>#{complaint.complaintId}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Information */}
      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">Complaint Information</h3>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label text-muted">Subject</label>
                <div><strong>{complaint.subject}</strong></div>
              </div>
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
            </div>
            <div className="col-md-6">
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
                <div>{formatDate(complaint.createdAt)}</div>
              </div>
              {complaint.orderId && (
                <div className="mb-3">
                  <label className="form-label text-muted">Related Order</label>
                  <div>
                    <button
                      className="btn btn-sm btn-link p-0"
                      onClick={() => navigate(`/orders/${complaint.orderId}`)}
                    >
                      #{complaint.orderId}
                      <i className="ti ti-external-link ms-1"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-muted">Description</label>
            <div className="border rounded p-3" style={{ whiteSpace: 'pre-wrap' }}>
              {complaint.description}
            </div>
          </div>

          {complaint.assignedTo && (
            <div className="alert alert-info">
              <strong>Assigned to:</strong> {complaint.assignedTo}
              {complaint.assignedAt && ` on ${formatDate(complaint.assignedAt)}`}
            </div>
          )}

          {complaint.resolution && complaint.status === COMPLAINT_STATUS.RESOLVED && (
            <div className="alert alert-success">
              <strong>Resolution:</strong>
              <div className="mt-2" style={{ whiteSpace: 'pre-wrap' }}>
                {complaint.resolution}
              </div>
              {complaint.resolvedAt && (
                <div className="text-muted small mt-2">
                  Resolved on {formatDate(complaint.resolvedAt)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">Comments & Communication</h3>
        </div>
        <div className="card-body">
          {commentsLoading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-muted">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="mb-4">
              {comments.map((comment, index) => (
                <div key={index} className="card mb-2">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <strong>{comment.commentedBy || 'User'}</strong>
                        {comment.isAdmin && (
                          <span className="badge bg-primary ms-2">Admin</span>
                        )}
                      </div>
                      <span className="text-muted small">
                        {formatDateTime(comment.commentedAt)}
                      </span>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{comment.comment}</div>
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="mt-2">
                        <strong className="small">Attachments:</strong>
                        <ul className="list-unstyled mb-0">
                          {comment.attachments.map((attachment, idx) => (
                            <li key={idx}>
                              <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                <i className="ti ti-paperclip me-1"></i>
                                {attachment.fileName}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Form */}
          {complaint.status !== COMPLAINT_STATUS.CLOSED && (
            <form onSubmit={handleAddComment}>
              <div className="mb-3">
                <label className="form-label">Add a comment</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Enter your comment here..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submitting}
                ></textarea>
                <small className="form-hint">
                  {newComment.length}/1000 characters
                </small>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Posting...
                  </>
                ) : (
                  <>
                    <i className="ti ti-message-plus me-2"></i>
                    Post Comment
                  </>
                )}
              </button>
            </form>
          )}

          {complaint.status === COMPLAINT_STATUS.CLOSED && (
            <div className="alert alert-warning">
              This complaint is closed. You cannot add new comments.
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
