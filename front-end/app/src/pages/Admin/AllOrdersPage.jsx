// All Orders Page - Admin view of all orders
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../../components/common/Layout/MainLayout';
import { ListSkeleton } from '../../components/common/Skeleton/ListSkeleton';
import { EmptyState } from '../../components/common/EmptyState/EmptyState';
import { ExportButton } from '../../components/common/ExportButton/ExportButton';
import { useToast } from '../../contexts/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { orderAPI } from '../../api/order.api';
import { ORDER_STATUS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/helpers';

export const AllOrdersPage = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [searchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerIdFilter, setCustomerIdFilter] = useState(searchParams.get('customerId') || '');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (customerIdFilter) params.customerId = customerIdFilter;

      const response = await orderAPI.getAllOrders(params);
      const data = response.data?.data || response.data;

      setOrders(data.orders || data.items || data);
      setPagination({
        ...pagination,
        total: data.total || data.orders?.length || 0,
        totalPages: data.totalPages || Math.ceil((data.total || 0) / pagination.limit),
      });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      showError(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchOrders();
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      [ORDER_STATUS.PLACED]: 'badge bg-cyan text-white',
      [ORDER_STATUS.PROCESSING]: 'badge bg-yellow text-white',
      [ORDER_STATUS.SHIPPED]: 'badge bg-blue text-white',
      [ORDER_STATUS.DELIVERED]: 'badge bg-green text-white',
      [ORDER_STATUS.CANCELLED]: 'badge bg-red text-white',
      [ORDER_STATUS.RETURN_REQUESTED]: 'badge bg-orange text-white',
    };
    return statusClasses[status] || 'badge bg-secondary text-white';
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col">
            <h2 className="page-title">All Orders</h2>
            <div className="text-muted mt-1">
              Manage and track all customer orders
            </div>
          </div>
          <div className="col-auto ms-auto d-print-none">
            <div className="btn-list">
              <ExportButton 
                data={orders} 
                filename="orders" 
                disabled={loading || orders.length === 0}
              />
              <div className="btn-group">
                <button
                  type="button"
                  className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('table')}
                  title="Table view"
                >
                  <i className="ti ti-list"></i>
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${viewMode === 'card' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('card')}
                  title="Card view"
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
          {customerIdFilter && (
            <div className="alert alert-info mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  <i className="ti ti-filter me-2"></i>
                  Showing orders for customer: <strong>{customerIdFilter}</strong>
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost-secondary"
                  onClick={() => {
                    setCustomerIdFilter('');
                    navigate('/admin/orders');
                    setPagination({ ...pagination, page: 1 });
                  }}
                >
                  <i className="ti ti-x me-1"></i>
                  Clear Filter
                </button>
              </div>
            </div>
          )}
          <form onSubmit={handleSearch}>
            <div className="row g-2">
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Order ID or Customer..."
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
                  {Object.values(ORDER_STATUS).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="col-md-1">
                <button
                  type="button"
                  className="btn btn-ghost-secondary w-100"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('');
                    setStartDate('');
                    setEndDate('');
                    setCustomerIdFilter('');
                    if (searchParams.get('customerId')) {
                      navigate('/admin/orders');
                    }
                    setPagination({ ...pagination, page: 1 });
                  }}
                  title="Clear filters"
                >
                  <i className="ti ti-x"></i>
                </button>
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

      {/* Orders List */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <ListSkeleton rows={10} type={viewMode} />
          ) : orders.length === 0 ? (
            <EmptyState
              icon="ti ti-shopping-cart"
              title="No orders found"
              description={statusFilter || searchQuery || customerIdFilter
                ? "Try adjusting your filters to see more results."
                : "No order records are available yet."}
            />
          ) : (
            <>
              {viewMode === 'table' ? (
                <div className="table-responsive">
                  <table className="table table-vcenter table-hover card-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th className="text-end">Total</th>
                        <th>Status</th>
                        <th>Tracking</th>
                        <th>Actions</th>
                        <th className="w-1"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.orderId}
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                        >
                          <td>
                            <span className="text-muted">#{order.orderId}</span>
                          </td>
                          <td>
                            <div>
                              <strong>{order.customerName || order.customerId}</strong>
                              {order.customerEmail && (
                                <div className="text-muted small">{order.customerEmail}</div>
                              )}
                            </div>
                          </td>
                          <td>{formatDate(order.orderDate)}</td>
                          <td>
                            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                          </td>
                          <td className="text-end">
                            <strong>{formatCurrency(order.totalAmount)}</strong>
                          </td>
                          <td>
                            <span className={getStatusBadgeClass(order.orderStatus)}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td>
                            {order.trackingNumber ? (
                              <span className="text-muted">{order.trackingNumber}</span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-ghost-secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/complaints?orderId=${order.orderId}`);
                              }}
                              title="View Complaints"
                            >
                              <i className="ti ti-message-report"></i>
                            </button>
                          </td>
                          <td>
                            <i className="ti ti-chevron-right"></i>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="row row-cards">
                  {orders.map((order) => (
                    <div key={order.orderId} className="col-md-6 col-lg-4">
                      <div 
                        className="card card-sm card-link"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <div className="text-muted small">Order ID</div>
                              <div className="h3 mb-0">#{order.orderId}</div>
                            </div>
                            <div className="d-flex gap-2 align-items-center">
                              <button
                                className="btn btn-sm btn-ghost-secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/complaints?orderId=${order.orderId}`);
                                }}
                                title="View Complaints"
                              >
                                <i className="ti ti-message-report"></i>
                              </button>
                              <span className={getStatusBadgeClass(order.orderStatus)}>
                                {order.orderStatus}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mb-2">
                            <div className="text-muted small">Customer</div>
                            <div><strong>{order.customerName || order.customerId}</strong></div>
                            {order.customerEmail && (
                              <div className="text-muted small">{order.customerEmail}</div>
                            )}
                          </div>

                          <div className="row mb-2">
                            <div className="col-6">
                              <div className="text-muted small">Date</div>
                              <div>{formatDate(order.orderDate)}</div>
                            </div>
                            <div className="col-6">
                              <div className="text-muted small">Items</div>
                              <div>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</div>
                            </div>
                          </div>

                          <div className="row mb-2">
                            <div className="col-6">
                              <div className="text-muted small">Total</div>
                              <div><strong>{formatCurrency(order.totalAmount)}</strong></div>
                            </div>
                            <div className="col-6">
                              <div className="text-muted small">Tracking</div>
                              <div>
                                {order.trackingNumber ? (
                                  <span className="text-muted">{order.trackingNumber}</span>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
          )}
        </div>
      </div>
    </MainLayout>
  );
};
