// Customer Detail Page - Admin view for individual customer
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/common/Layout/MainLayout';
import { useToast } from '../../contexts/ToastContext';
import { adminAPI } from '../../api/admin.api';
import { ROUTES } from '../../utils/constants';

export const CustomerDetailPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { showError } = useToast();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomerDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getCustomerById(customerId);
      setCustomer(response.data.data);
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
      showError('Failed to load customer details');
      navigate(ROUTES.ADMIN_CUSTOMERS);
    } finally {
      setLoading(false);
    }
  }, [customerId, showError, navigate]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length >= 2 
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!customer) {
    return (
      <MainLayout>
        <div className="empty">
          <div className="empty-icon">
            <i className="ti ti-user-off"></i>
          </div>
          <p className="empty-title">Customer not found</p>
          <div className="empty-action">
            <button
              className="btn btn-primary"
              onClick={() => navigate(ROUTES.ADMIN_CUSTOMERS)}
            >
              Back to Customers
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
            <div className="page-pretitle">
              <button
                className="btn btn-link p-0"
                onClick={() => navigate(ROUTES.ADMIN_CUSTOMERS)}
              >
                <i className="ti ti-arrow-left me-1"></i>
                Back to Customers
              </button>
            </div>
            <h2 className="page-title">Customer Details</h2>
          </div>
          <div className="col-auto ms-auto">
            <div className="btn-list">
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/admin/orders?customerId=${customerId}`)}
              >
                <i className="ti ti-shopping-cart me-2"></i>
                View Orders
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/admin/complaints?customerId=${customerId}`)}
              >
                <i className="ti ti-message-report me-2"></i>
                View Complaints
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Customer Profile Card */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <span className="avatar avatar-xl mb-3">
                {getInitials(customer.fullName)}
              </span>
              <h3 className="m-0 mb-1">{customer.fullName}</h3>
              <div className="text-muted mb-3">{customer.customerId}</div>
              <div className="mt-3">
                <span className={`badge bg-${
                  customer.customerStatus === 'Active' ? 'success' :
                  customer.customerStatus === 'Suspended' ? 'danger' : 'secondary'
                } me-2`}>
                  {customer.customerStatus || 'Active'}
                </span>
                <span className={`badge bg-${
                  customer.customerType === 'VIP' ? 'purple' :
                  customer.customerType === 'Premium' ? 'blue' : 'secondary'
                }`}>
                  {customer.customerType || 'Regular'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="card mt-3">
            <div className="card-header">
              <h3 className="card-title">Statistics</h3>
            </div>
            <div className="list-group list-group-flush">
              <div className="list-group-item">
                <div className="row align-items-center">
                  <div className="col-auto">
                    <span className="avatar avatar-sm bg-success">
                      <i className="ti ti-shopping-cart"></i>
                    </span>
                  </div>
                  <div className="col">
                    <div className="font-weight-medium">{customer.totalOrders || 0} Orders</div>
                    <div className="text-muted small">
                      ${(customer.totalOrderValue || 0).toFixed(2)} total value
                    </div>
                  </div>
                </div>
              </div>
              <div className="list-group-item">
                <div className="row align-items-center">
                  <div className="col-auto">
                    <span className="avatar avatar-sm bg-warning">
                      <i className="ti ti-alert-circle"></i>
                    </span>
                  </div>
                  <div className="col">
                    <div className="font-weight-medium">{customer.totalComplaints || 0} Complaints</div>
                    <div className="text-muted small">
                      {customer.openComplaints || 0} currently open
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Contact Information</h3>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <div className="text-muted">{customer.email}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone Number</label>
                  <div className="text-muted">{customer.contactNumber || 'N/A'}</div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Date of Birth</label>
                  <div className="text-muted">
                    {customer.dateOfBirth 
                      ? new Date(customer.dateOfBirth).toLocaleDateString() 
                      : 'N/A'}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Gender</label>
                  <div className="text-muted">{customer.gender || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h3 className="card-title">Address Information</h3>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-12">
                  <label className="form-label">Street Address</label>
                  <div className="text-muted">{customer.streetAddress || 'N/A'}</div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">City</label>
                  <div className="text-muted">{customer.city || 'N/A'}</div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">State/Province</label>
                  <div className="text-muted">{customer.stateProvince || 'N/A'}</div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Postal Code</label>
                  <div className="text-muted">{customer.postalCode || 'N/A'}</div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">Country</label>
                  <div className="text-muted">{customer.country || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h3 className="card-title">Account Information</h3>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Joined Date</label>
                  <div className="text-muted">
                    {customer.createdAt 
                      ? new Date(customer.createdAt).toLocaleDateString() 
                      : 'N/A'}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Last Updated</label>
                  <div className="text-muted">
                    {customer.updatedAt 
                      ? new Date(customer.updatedAt).toLocaleDateString() 
                      : 'N/A'}
                  </div>
                </div>
              </div>
              {customer.preferredContactMethod && (
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Preferred Contact Method</label>
                    <div className="text-muted">{customer.preferredContactMethod}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
