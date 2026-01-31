// Create Complaint Page - Submit new complaint
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../../components/common/Layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { complaintAPI } from '../../api/complaint.api';
import { orderAPI } from '../../api/order.api';
import { COMPLAINT_CATEGORY, COMPLAINT_PRIORITY } from '../../utils/constants';

export const CreateComplaintPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [searchParams] = useSearchParams();

  const [creating, setCreating] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orders, setOrders] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    category: COMPLAINT_CATEGORY.PRODUCT_QUALITY,
    priority: COMPLAINT_PRIORITY.MEDIUM,
    description: '',
    orderId: searchParams.get('orderId') || '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchMyOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await orderAPI.getMyOrders({ page: 1, limit: 100 });
      const data = response.data?.data || response.data;
      setOrders(data.orders || data.items || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    } else if (formData.subject.trim().length > 200) {
      newErrors.subject = 'Subject must be less than 200 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.trim().length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Please fix all validation errors');
      return;
    }

    setCreating(true);
    try {
      const complaintData = {
        subject: formData.subject.trim(),
        category: formData.category,
        priority: formData.priority,
        description: formData.description.trim(),
        orderId: formData.orderId || undefined,
      };

      const response = await complaintAPI.createComplaint(complaintData);
      const createdComplaint = response.data?.data || response.data;
      
      showSuccess('Complaint submitted successfully!');
      navigate(`/complaints/${createdComplaint.complaintId}`);
    } catch (error) {
      console.error('Failed to create complaint:', error);
      showError(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setCreating(false);
    }
  };

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
            <h2 className="page-title">Create New Complaint</h2>
            <div className="text-muted mt-1">
              Submit your complaint and we'll get back to you soon
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            {/* Complaint Details */}
            <div className="card mb-3">
              <div className="card-header">
                <h3 className="card-title">Complaint Details</h3>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label required">Subject</label>
                  <input
                    type="text"
                    className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                    placeholder="Brief description of your complaint"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    maxLength={200}
                  />
                  {errors.subject && (
                    <div className="invalid-feedback">{errors.subject}</div>
                  )}
                  <small className="form-hint">{formData.subject.length}/200 characters</small>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label required">Category</label>
                    <select
                      className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                    >
                      {Object.values(COMPLAINT_CATEGORY).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <div className="invalid-feedback">{errors.category}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label required">Priority</label>
                    <select
                      className={`form-select ${errors.priority ? 'is-invalid' : ''}`}
                      value={formData.priority}
                      onChange={(e) => handleChange('priority', e.target.value)}
                    >
                      {Object.values(COMPLAINT_PRIORITY).map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                    {errors.priority && (
                      <div className="invalid-feedback">{errors.priority}</div>
                    )}
                    <small className="form-hint">
                      Select priority based on urgency
                    </small>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Related Order (Optional)</label>
                  <select
                    className="form-select"
                    value={formData.orderId}
                    onChange={(e) => handleChange('orderId', e.target.value)}
                    disabled={loadingOrders}
                  >
                    <option value="">No related order</option>
                    {orders.map((order) => (
                      <option key={order.orderId} value={order.orderId}>
                        Order #{order.orderId} - {order.orderStatus} (
                        {new Date(order.orderDate).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                  <small className="form-hint">
                    Link this complaint to an order if applicable
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label required">Description</label>
                  <textarea
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    rows="8"
                    placeholder="Provide detailed information about your complaint..."
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    maxLength={2000}
                  ></textarea>
                  {errors.description && (
                    <div className="invalid-feedback">{errors.description}</div>
                  )}
                  <small className="form-hint">
                    {formData.description.length}/2000 characters. Please provide as much detail as
                    possible.
                  </small>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating}
              >
                {creating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="ti ti-message-report me-2"></i>
                    Submit Complaint
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-link"
                onClick={() => navigate('/complaints')}
                disabled={creating}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Help Sidebar */}
          <div className="col-lg-4">
            <div className="card sticky-top" style={{ top: '1rem' }}>
              <div className="card-header">
                <h3 className="card-title">Need Help?</h3>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <strong>Before submitting:</strong>
                  <ul className="mt-2">
                    <li>Check our FAQ section for quick answers</li>
                    <li>Provide as much detail as possible</li>
                    <li>Include order number if related to a purchase</li>
                    <li>Select appropriate priority level</li>
                  </ul>
                </div>

                <div className="alert alert-info">
                  <strong>Response Time:</strong>
                  <ul className="mb-0 mt-2">
                    <li><strong>Critical:</strong> Within 2 hours</li>
                    <li><strong>High:</strong> Within 6 hours</li>
                    <li><strong>Medium:</strong> Within 24 hours</li>
                    <li><strong>Low:</strong> Within 48 hours</li>
                  </ul>
                </div>

                <div className="border-top pt-3">
                  <strong>Complaint Categories:</strong>
                  <ul className="mt-2 small">
                    <li><strong>Product Quality:</strong> Defective or damaged items</li>
                    <li><strong>Delivery Issue:</strong> Late or missing deliveries</li>
                    <li><strong>Service Issue:</strong> Customer service concerns</li>
                    <li><strong>Billing Issue:</strong> Payment or invoice problems</li>
                    <li><strong>Return/Refund:</strong> Return or refund issues</li>
                    <li><strong>Other:</strong> Any other concerns</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </MainLayout>
  );
};
