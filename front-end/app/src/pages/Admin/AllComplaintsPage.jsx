// All Complaints Page - Admin view of all complaints
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../../components/common/Layout/MainLayout';
import { ListSkeleton } from '../../components/common/Skeleton/ListSkeleton';
import { EmptyState } from '../../components/common/EmptyState/EmptyState';
import { ExportButton } from '../../components/common/ExportButton/ExportButton';
import { useToast } from '../../contexts/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { complaintAPI } from '../../api/complaint.api';
import { COMPLAINT_STATUS, COMPLAINT_CATEGORY, COMPLAINT_PRIORITY } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

export const AllComplaintsPage = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [searchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState(''); // 'assigned', 'unassigned', ''
  const [orderIdFilter, setOrderIdFilter] = useState(searchParams.get('orderId') || '');
  const [customerIdFilter, setCustomerIdFilter] = useState(searchParams.get('customerId') || '');

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter, categoryFilter, priorityFilter, assignedFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (searchQuery) params.search = searchQuery;
      if (assignedFilter === 'assigned') params.assigned = true;
      if (assignedFilter === 'unassigned') params.assigned = false;
      if (orderIdFilter) params.orderId = orderIdFilter;
      if (customerIdFilter) params.customerId = customerIdFilter;

      const response = await complaintAPI.getAllComplaints(params);
      const data = response.data?.data || response.data;

      setComplaints(data.complaints || data.items || data);
      setPagination({
        ...pagination,
        total: data.total || data.complaints?.length || 0,
        totalPages: data.totalPages || Math.ceil((data.total || 0) / pagination.limit),
      });
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      showError(error.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchComplaints();
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
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

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col">
            <h2 className="page-title">All Complaints</h2>
            <div className="text-muted mt-1">
              Manage and resolve customer complaints
            </div>
          </div>
          <div className="col-auto ms-auto">
            <div className="btn-list">
              <ExportButton 
                data={complaints} 
                filename="complaints" 
                disabled={loading || complaints.length === 0}
              />
              <button
                className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <i className="ti ti-list"></i>
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

      {/* Filter Alerts */}
      {orderIdFilter && (
        <div className="alert alert-info alert-dismissible mb-3">
          <div className="d-flex">
            <div>
              <i className="ti ti-info-circle me-2"></i>
              Showing complaints for order: <strong>#{orderIdFilter}</strong>
            </div>
            <button
              type="button"
              className="btn-close ms-auto"
              onClick={() => {
                setOrderIdFilter('');
                navigate('/admin/complaints');
              }}
            ></button>
          </div>
        </div>
      )}
      {customerIdFilter && (
        <div className="alert alert-info alert-dismissible mb-3">
          <div className="d-flex">
            <div>
              <i className="ti ti-info-circle me-2"></i>
              Showing complaints for customer: <strong>{customerIdFilter}</strong>
            </div>
            <button
              type="button"
              className="btn-close ms-auto"
              onClick={() => {
                setCustomerIdFilter('');
                navigate('/admin/complaints');
              }}
            ></button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row g-2">
              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by ID or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                >
                  <option value="">All Status</option>
                  {Object.values(COMPLAINT_STATUS).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                >
                  <option value="">All Categories</option>
                  {Object.values(COMPLAINT_CATEGORY).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                >
                  <option value="">All Priorities</option>
                  {Object.values(COMPLAINT_PRIORITY).map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={assignedFilter}
                  onChange={(e) => {
                    setAssignedFilter(e.target.value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                >
                  <option value="">All Assignments</option>
                  <option value="assigned">Assigned</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100">
                  <i className="ti ti-search me-2"></i>
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Complaints List */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <ListSkeleton rows={10} type={viewMode} />
          ) : complaints.length === 0 ? (
            <EmptyState
              icon="ti ti-message-report"
              title="No complaints found"
              description={statusFilter || priorityFilter || categoryFilter || searchQuery
                ? "Try adjusting your filters to see more results."
                : "No complaint records are available yet."}
            />
          ) : viewMode === 'table' ? (
            <>
              <div className="table-responsive">
                <table className="table table-vcenter table-hover card-table">
                  <thead>
                    <tr>
                      <th>Complaint ID</th>
                      <th>Subject</th>
                      <th>Customer</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Created</th>
                      <th className="w-1"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((complaint) => (
                      <tr
                        key={complaint.complaintId}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/admin/complaints/${complaint.complaintId}`)}
                      >
                        <td>
                          <span className="text-muted">#{complaint.complaintId}</span>
                        </td>
                        <td>
                          <div>
                            <strong>{complaint.subject}</strong>
                            {complaint.orderId && (
                              <div className="text-muted small">
                                Order: #{complaint.orderId}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            {complaint.customerName || complaint.customerId}
                            {complaint.customerEmail && (
                              <div className="text-muted small">{complaint.customerEmail}</div>
                            )}
                          </div>
                        </td>
                        <td>{complaint.category}</td>
                        <td>
                          <span className={getPriorityBadgeClass(complaint.priority)}>
                            {complaint.priority}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(complaint.status)}>
                            {complaint.status}
                          </span>
                        </td>
                        <td>
                          {complaint.assignedTo ? (
                            <span>{complaint.assignedTo}</span>
                          ) : (
                            <span className="text-muted">Unassigned</span>
                          )}
                        </td>
                        <td>{formatDate(complaint.createdAt)}</td>
                        <td>
                          <i className="ti ti-chevron-right"></i>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="card-footer d-flex align-items-center">
                  <p className="m-0 text-muted">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} entries
                  </p>
                  <ul className="pagination m-0 ms-auto">
                    <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        <i className="ti ti-chevron-left"></i>
                        prev
                      </button>
                    </li>
                    {[...Array(pagination.totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.page - 1 && page <= pagination.page + 1)
                      ) {
                        return (
                          <li
                            key={page}
                            className={`page-item ${pagination.page === page ? 'active' : ''}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        );
                      } else if (page === pagination.page - 2 || page === pagination.page + 2) {
                        return (
                          <li key={page} className="page-item disabled">
                            <span className="page-link">…</span>
                          </li>
                        );
                      }
                      return null;
                    })}
                    <li
                      className={`page-item ${
                        pagination.page === pagination.totalPages ? 'disabled' : ''
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        next
                        <i className="ti ti-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="row row-cards">
                {complaints.map((complaint) => (
                  <div key={complaint.complaintId} className="col-lg-4">
                    <div
                      className="card card-link"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/admin/complaints/${complaint.complaintId}`)}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <div className="text-muted small mb-1">#{complaint.complaintId}</div>
                            <h3 className="card-title mb-1">{complaint.subject}</h3>
                          </div>
                          <span className={getStatusBadgeClass(complaint.status)}>
                            {complaint.status}
                          </span>
                        </div>
                        <div className="mb-2">
                          <div className="text-muted small">Customer</div>
                          <div>{complaint.customerName || complaint.customerId}</div>
                          {complaint.customerEmail && (
                            <div className="text-muted small">{complaint.customerEmail}</div>
                          )}
                        </div>
                        {complaint.orderId && (
                          <div className="mb-2">
                            <div className="text-muted small">Order</div>
                            <div>#{complaint.orderId}</div>
                          </div>
                        )}
                        <div className="row mb-2">
                          <div className="col-6">
                            <div className="text-muted small">Category</div>
                            <div>{complaint.category}</div>
                          </div>
                          <div className="col-6">
                            <div className="text-muted small">Priority</div>
                            <div>
                              <span className={getPriorityBadgeClass(complaint.priority)}>
                                {complaint.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mb-2">
                          <div className="text-muted small">Assigned To</div>
                          <div>
                            {complaint.assignedTo ? (
                              <span>{complaint.assignedTo}</span>
                            ) : (
                              <span className="text-muted">Unassigned</span>
                            )}
                          </div>
                        </div>
                        <div className="text-muted small">
                          {formatDate(complaint.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination for Card View */}
              {pagination.totalPages > 1 && (
                <div className="card-footer d-flex align-items-center">
                  <p className="m-0 text-muted">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} entries
                  </p>
                  <ul className="pagination m-0 ms-auto">
                    <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        <i className="ti ti-chevron-left"></i>
                        prev
                      </button>
                    </li>
                    {[...Array(pagination.totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.page - 1 && page <= pagination.page + 1)
                      ) {
                        return (
                          <li
                            key={page}
                            className={`page-item ${pagination.page === page ? 'active' : ''}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        );
                      } else if (page === pagination.page - 2 || page === pagination.page + 2) {
                        return (
                          <li key={page} className="page-item disabled">
                            <span className="page-link">…</span>
                          </li>
                        );
                      }
                      return null;
                    })}
                    <li
                      className={`page-item ${
                        pagination.page === pagination.totalPages ? 'disabled' : ''
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        next
                        <i className="ti ti-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
