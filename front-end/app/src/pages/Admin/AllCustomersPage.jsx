// All Customers Page - Admin view to manage all customer records
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/common/Layout/MainLayout';
import { ListSkeleton } from '../../components/common/Skeleton/ListSkeleton';
import { EmptyState } from '../../components/common/EmptyState/EmptyState';
import { ExportButton } from '../../components/common/ExportButton/ExportButton';
import { useToast } from '../../contexts/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { adminAPI } from '../../api/admin.api';

export const AllCustomersPage = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 20,
  });
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
  });
  const debouncedSearch = useDebounce(filters.search, 300);

  const fetchCustomers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.pageSize,
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
        ...(debouncedSearch && { search: debouncedSearch }),
      };

      const response = await adminAPI.getAllCustomers(params);
      console.log('Customers API Response:', response.data);
      
      // Handle both response.data.data and response.data structures
      const data = response.data?.data || response.data;
      
      // Extract items array
      const customerItems = data?.items || [];
      console.log('Customer items:', customerItems);
      setCustomers(customerItems);
      
      // Update pagination if available
      if (data?.pagination) {
        setPagination({
          currentPage: data.pagination.currentPage || page,
          totalPages: data.pagination.totalPages || 1,
          totalItems: data.pagination.totalItems || customerItems.length,
          pageSize: data.pagination.pageSize || pagination.pageSize,
        });
      } else {
        // If no pagination info, update based on items length
        setPagination(prev => ({
          ...prev,
          currentPage: page,
          totalItems: customerItems.length,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      showError('Failed to load customers');
      setCustomers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.type, debouncedSearch, pagination.pageSize, showError]);

  useEffect(() => {
    fetchCustomers(1);
  }, [fetchCustomers]);

  // Debug: Log customers state changes
  useEffect(() => {
    console.log('Customers state updated:', customers, 'Length:', customers.length);
  }, [customers]);

  const handlePageChange = (page) => {
    fetchCustomers(page);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length >= 2 
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col">
            <h2 className="page-title">All Customers</h2>
            <div className="text-muted mt-1">
              Manage and view all customer records
            </div>
          </div>
          <div className="col-auto ms-auto d-print-none">
            <div className="btn-list">
              <div className="text-muted me-3" style={{ lineHeight: '38px' }}>
                Total: {pagination.totalItems} customers
              </div>
              <ExportButton 
                data={customers} 
                filename="customers" 
                disabled={loading || customers.length === 0}
              />
              <div className="btn-group">
                <button
                  className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('table')}
                  title="Table View"
                >
                  <i className="ti ti-table"></i>
                </button>
                <button
                  className={`btn ${viewMode === 'card' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('card')}
                  title="Card View"
                >
                  <i className="ti ti-layout-grid"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Regular">Regular</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({ status: '', type: '', search: '' })}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <ListSkeleton rows={10} type={viewMode} />
          ) : customers.length === 0 ? (
            <EmptyState
              icon="ti ti-users-off"
              title="No customers found"
              description={filters.search || filters.status || filters.type 
                ? "Try adjusting your filters to see more results."
                : "No customer records are available yet."}
            />
          ) : viewMode === 'table' ? (
            // Table View
            <>
              <div className="table-responsive">
                <table className="table table-vcenter card-table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Orders</th>
                      <th>Complaints</th>
                      <th>Joined</th>
                      <th className="w-1">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr 
                        key={customer.customerId}
                        onClick={() => handleViewCustomer(customer)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="avatar avatar-sm me-2">
                              {getInitials(customer.fullName)}
                            </span>
                            <div>
                              <div className="font-weight-medium">{customer.fullName}</div>
                              <div className="text-muted small">{customer.customerId}</div>
                            </div>
                          </div>
                        </td>
                        <td>{customer.email}</td>
                        <td>{customer.contactNumber || 'N/A'}</td>
                        <td>
                          <span className={`badge text-white bg-${
                            customer.customerType === 'VIP' ? 'purple' :
                            customer.customerType === 'Premium' ? 'blue' : 'cyan'
                          }`}>
                            {customer.customerType || 'Regular'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge text-white bg-${
                            customer.customerStatus === 'Active' ? 'success' :
                            customer.customerStatus === 'Suspended' ? 'danger' : 'secondary'
                          }`}>
                            {customer.customerStatus || 'Active'}
                          </span>
                        </td>
                        <td>
                          <div>{customer.totalOrders || 0}</div>
                          <div className="text-muted small">
                            ${(customer.totalOrderValue || 0).toFixed(2)}
                          </div>
                        </td>
                        <td>
                          <div>{customer.totalComplaints || 0}</div>
                          {customer.openComplaints > 0 && (
                            <div className="text-danger small">
                              {customer.openComplaints} open
                            </div>
                          )}
                        </td>
                        <td>
                          {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-icon btn-ghost-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/orders?customerId=${customer.customerId}`);
                            }}
                            title="View customer orders"
                          >
                            <i className="ti ti-shopping-cart"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            // Card View
            <div className="row row-cards">
              {customers.map((customer) => (
                <div key={customer.customerId} className="col-md-6 col-lg-4">
                  <div className="card card-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div 
                          className="d-flex align-items-center flex-grow-1"
                          onClick={() => handleViewCustomer(customer)}
                          style={{ cursor: 'pointer' }}
                        >
                        <span className="avatar avatar-md me-3">
                          {getInitials(customer.fullName)}
                        </span>
                        <div className="flex-fill">
                          <div className="font-weight-medium">{customer.fullName}</div>
                          <div className="text-muted small">{customer.customerId}</div>
                        </div>
                        </div>
                        <button
                          className="btn btn-sm btn-icon btn-ghost-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/orders?customerId=${customer.customerId}`);
                          }}
                          title="View customer orders"
                        >
                          <i className="ti ti-shopping-cart"></i>
                        </button>
                      </div>
                      
                      <div className="mb-2"
                        onClick={() => handleViewCustomer(customer)}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="ti ti-mail me-2 text-muted"></i>
                        <span className="text-muted small">{customer.email}</span>
                      </div>
                      
                      {customer.contactNumber && (
                        <div className="mb-3">
                          <i className="ti ti-phone me-2 text-muted"></i>
                          <span className="text-muted small">{customer.contactNumber}</span>
                        </div>
                      )}
                      
                      <div className="mb-3">
                        <span className={`badge bg-${
                          customer.customerStatus === 'Active' ? 'success' :
                          customer.customerStatus === 'Suspended' ? 'danger' : 'secondary'
                        } me-2`}>
                          {customer.customerStatus || 'Active'}
                        </span>
                        <span className={`badge text-white bg-${
                          customer.customerType === 'VIP' ? 'purple' :
                          customer.customerType === 'Premium' ? 'blue' : 'cyan'
                        }`}>
                          {customer.customerType || 'Regular'}
                        </span>
                      </div>
                      
                      <div className="row">
                        <div className="col-6">
                          <div className="text-muted small">Orders</div>
                          <div className="font-weight-medium">{customer.totalOrders || 0}</div>
                          <div className="text-muted small">${(customer.totalOrderValue || 0).toFixed(2)}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted small">Complaints</div>
                          <div className="font-weight-medium">{customer.totalComplaints || 0}</div>
                          {customer.openComplaints > 0 && (
                            <div className="text-danger small">{customer.openComplaints} open</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && !loading && customers.length > 0 && (
                <div className="card-footer d-flex align-items-center">
                  <p className="m-0 text-muted">
                    Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
                    {pagination.totalItems} entries
                  </p>
                  <ul className="pagination m-0 ms-auto">
                    <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                      >
                        <i className="ti ti-chevron-left"></i>
                        Prev
                      </button>
                    </li>
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const page = i + 1;
                      // Show first, last, current, and adjacent pages
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                      ) {
                        return (
                          <li
                            key={page}
                            className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        );
                      } else if (page === pagination.currentPage - 2 || page === pagination.currentPage + 2) {
                        return <li key={page} className="page-item disabled"><span className="page-link">...</span></li>;
                      }
                      return null;
                    })}
                    <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                      >
                        Next
                        <i className="ti ti-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
        </div>
      </div>

      {/* Customer Detail Modal */}
      {showModal && selectedCustomer && (
        <div className="modal modal-blur fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Customer Details</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-auto">
                    <span className="avatar avatar-xl">
                      {getInitials(selectedCustomer.fullName)}
                    </span>
                  </div>
                  <div className="col">
                    <h3 className="m-0 mb-1">{selectedCustomer.fullName}</h3>
                    <div className="text-muted mb-2">{selectedCustomer.customerId}</div>
                    <div>
                      <span className={`badge text-white bg-${
                        selectedCustomer.customerStatus === 'Active' ? 'success' :
                        selectedCustomer.customerStatus === 'Suspended' ? 'danger' : 'secondary'
                      } me-2`}>
                        {selectedCustomer.customerStatus || 'Active'}
                      </span>
                      <span className={`badge text-white bg-${
                        selectedCustomer.customerType === 'VIP' ? 'purple' :
                        selectedCustomer.customerType === 'Premium' ? 'blue' : 'cyan'
                      }`}>
                        {selectedCustomer.customerType || 'Regular'}
                      </span>
                    </div>
                  </div>
                </div>

                <h4 className="mb-3">Statistics</h4>
                <div className="row mb-4">
                  <div className="col-6">
                    <div className="card card-sm">
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-auto">
                            <span className="bg-success text-white avatar">
                              <i className="ti ti-shopping-cart"></i>
                            </span>
                          </div>
                          <div className="col">
                            <div className="font-weight-medium">{selectedCustomer.totalOrders || 0} Orders</div>
                            <div className="text-muted small">
                              ${(selectedCustomer.totalOrderValue || 0).toFixed(2)} total value
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card card-sm">
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-auto">
                            <span className="bg-warning text-white avatar">
                              <i className="ti ti-alert-circle"></i>
                            </span>
                          </div>
                          <div className="col">
                            <div className="font-weight-medium">{selectedCustomer.totalComplaints || 0} Complaints</div>
                            <div className="text-muted small">
                              {selectedCustomer.openComplaints || 0} currently open
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h4 className="mb-3">Contact Information</h4>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <div className="text-muted">{selectedCustomer.email}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone Number</label>
                    <div className="text-muted">{selectedCustomer.contactNumber || 'N/A'}</div>
                  </div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label className="form-label">Date of Birth</label>
                    <div className="text-muted">
                      {selectedCustomer.dateOfBirth 
                        ? new Date(selectedCustomer.dateOfBirth).toLocaleDateString() 
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Gender</label>
                    <div className="text-muted">{selectedCustomer.gender || 'N/A'}</div>
                  </div>
                </div>

                <h4 className="mb-3">Address Information</h4>
                <div className="row mb-3">
                  <div className="col-12">
                    <label className="form-label">Street Address</label>
                    <div className="text-muted">{selectedCustomer.streetAddress || 'N/A'}</div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label">City</label>
                    <div className="text-muted">{selectedCustomer.city || 'N/A'}</div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">State/Province</label>
                    <div className="text-muted">{selectedCustomer.stateProvince || 'N/A'}</div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Postal Code</label>
                    <div className="text-muted">{selectedCustomer.postalCode || 'N/A'}</div>
                  </div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label className="form-label">Country</label>
                    <div className="text-muted">{selectedCustomer.country || 'N/A'}</div>
                  </div>
                </div>

                <h4 className="mb-3">Account Information</h4>
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Joined Date</label>
                    <div className="text-muted">
                      {selectedCustomer.createdAt 
                        ? new Date(selectedCustomer.createdAt).toLocaleDateString() 
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Updated</label>
                    <div className="text-muted">
                      {selectedCustomer.updatedAt 
                        ? new Date(selectedCustomer.updatedAt).toLocaleDateString() 
                        : 'N/A'}
                    </div>
                  </div>
                </div>
                {selectedCustomer.preferredContactMethod && (
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <label className="form-label">Preferred Contact Method</label>
                      <div className="text-muted">{selectedCustomer.preferredContactMethod}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && <div className="modal-backdrop fade show"></div>}
    </MainLayout>
  );
};
