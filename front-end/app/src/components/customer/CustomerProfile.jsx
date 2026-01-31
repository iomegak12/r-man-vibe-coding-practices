// Customer Profile Component
import React from 'react';
import { format } from 'date-fns';

export const CustomerProfile = ({ customer, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading profile...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="text-muted">No profile data available</p>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length >= 2 
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        {/* Header with Avatar */}
        <div className="d-flex align-items-center mb-4">
          <span className="avatar avatar-xl me-3" style={{ fontSize: '2rem' }}>
            {getInitials(customer.fullName)}
          </span>
          <div className="flex-grow-1">
            <h2 className="mb-2">{customer.fullName || 'N/A'}</h2>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge bg-primary">{customer.customerType || 'Regular'}</span>
              <span className={`badge bg-${customer.status === 'Active' ? 'success' : 'secondary'}`}>
                {customer.status || 'Active'}
              </span>
            </div>
          </div>
        </div>

        <hr />

        {/* Contact Information */}
        <h3 className="mb-3">Contact Information</h3>
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="d-flex align-items-center">
              <i className="ti ti-mail text-muted me-3" style={{ fontSize: '1.5rem' }}></i>
              <div>
                <small className="text-muted">Email</small>
                <div>{customer.email || 'N/A'}</div>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="d-flex align-items-center">
              <i className="ti ti-phone text-muted me-3" style={{ fontSize: '1.5rem' }}></i>
              <div>
                <small className="text-muted">Phone</small>
                <div>{customer.contactNumber || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        {customer.address && (
          <>
            <h3 className="mb-3">Address</h3>
            <div className="d-flex mb-4">
              <i className="ti ti-map-pin text-muted me-3" style={{ fontSize: '1.5rem' }}></i>
              <div>
                <div>{customer.address.addressLine1}</div>
                {customer.address.addressLine2 && <div>{customer.address.addressLine2}</div>}
                <div>
                  {customer.address.city}, {customer.address.state} {customer.address.postalCode}
                </div>
                <div>{customer.address.country}</div>
              </div>
            </div>
          </>
        )}

        {/* Account Information */}
        <h3 className="mb-3">Account Information</h3>
        <div className="row">
          <div className="col-md-6 mb-3">
            <div className="d-flex align-items-center">
              <i className="ti ti-calendar text-muted me-3" style={{ fontSize: '1.5rem' }}></i>
              <div>
                <small className="text-muted">Member Since</small>
                <div>{formatDate(customer.createdAt)}</div>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="d-flex align-items-center">
              <i className="ti ti-id text-muted me-3" style={{ fontSize: '1.5rem' }}></i>
              <div>
                <small className="text-muted">Customer ID</small>
                <div>{customer.customerId || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
