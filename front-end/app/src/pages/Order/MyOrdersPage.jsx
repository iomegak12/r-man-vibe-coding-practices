// My Orders Page - Customer Order History
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/common/Layout/MainLayout';
import { useToast } from '../../contexts/ToastContext';
import { orderAPI } from '../../api/order.api';
import { ORDER_STATUS, ROUTES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/helpers';

export const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { showError } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalPages: 1,
    totalItems: 0,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        page_size: pagination.pageSize,
      };

      if (statusFilter) {
        params.order_status = statusFilter;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await orderAPI.getMyOrders(params);
      console.log('Orders response:', response.data);

      const responseData = response.data?.data || response.data;
      const items = responseData?.items || [];
      const paginationData = responseData?.pagination || {};

      setOrders(items);
      setPagination({
        page: paginationData.page || 1,
        pageSize: paginationData.pageSize || 20,
        totalPages: paginationData.totalPages || 1,
        totalItems: paginationData.totalItems || 0,
      });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      showError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchOrders();
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const getStatusBadgeClass = (status) => {
    const colorMap = {
      [ORDER_STATUS.PLACED]: 'badge bg-cyan text-white',
      [ORDER_STATUS.PROCESSING]: 'badge bg-yellow text-dark',
      [ORDER_STATUS.SHIPPED]: 'badge bg-blue text-white',
      [ORDER_STATUS.DELIVERED]: 'badge bg-green text-white',
      [ORDER_STATUS.CANCELLED]: 'badge bg-red text-white',
      [ORDER_STATUS.RETURN_REQUESTED]: 'badge bg-orange text-white',
      [ORDER_STATUS.RETURNED]: 'badge bg-gray text-white',
    };
    return colorMap[status] || 'badge bg-secondary text-white';
  };

  const handleViewDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col">
            <h2 className="page-title">My Orders</h2>
            <div className="text-muted mt-1">
              View and manage your order history
            </div>
          </div>
          <div className="col-auto ms-auto d-print-none">
            <button
              className="btn btn-primary"
              onClick={() => navigate(ROUTES.ORDERS_CREATE)}
            >
              <i className="ti ti-plus me-2"></i>
              New Order
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3">
            {/* Search */}
            <div className="col-md-6">
              <form onSubmit={handleSearch}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by order ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn btn-primary" type="submit">
                    <i className="ti ti-search"></i>
                  </button>
                </div>
              </form>
            </div>

            {/* Status Filter */}
            <div className="col-md-6">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
              >
                <option value="">All Statuses</option>
                {Object.values(ORDER_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Orders ({pagination.totalItems})
          </h3>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center p-5">
              <div className="empty">
                <div className="empty-icon">
                  <i className="ti ti-shopping-cart" style={{ fontSize: '3rem' }}></i>
                </div>
                <p className="empty-title">No orders found</p>
                <p className="empty-subtitle text-muted">
                  {searchQuery || statusFilter
                    ? 'Try adjusting your filters'
                    : 'Start by placing your first order'}
                </p>
                {!searchQuery && !statusFilter && (
                  <div className="empty-action">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(ROUTES.ORDERS_CREATE)}
                    >
                      <i className="ti ti-plus me-2"></i>
                      Create Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-vcenter card-table table-striped">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th className="w-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.orderId}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleViewDetails(order.orderId)}
                    >
                      <td>
                        <strong>{order.orderId}</strong>
                      </td>
                      <td>
                        {formatDate(order.orderDate)}
                      </td>
                      <td>
                        {order.items?.length || 0} item(s)
                      </td>
                      <td>
                        <strong>{formatCurrency(order.totalAmount)}</strong>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(order.orderStatus)}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-ghost-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(order.orderId);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && orders.length > 0 && pagination.totalPages > 1 && (
          <div className="card-footer d-flex align-items-center">
            <p className="m-0 text-muted">
              Showing <span>{(pagination.page - 1) * pagination.pageSize + 1}</span> to{' '}
              <span>
                {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)}
              </span>{' '}
              of <span>{pagination.totalItems}</span> entries
            </p>
            <ul className="pagination m-0 ms-auto">
              <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <i className="ti ti-chevron-left"></i> Prev
                </button>
              </li>
              {[...Array(pagination.totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                // Show first, last, current, and adjacent pages
                if (
                  pageNumber === 1 ||
                  pageNumber === pagination.totalPages ||
                  Math.abs(pageNumber - pagination.page) <= 1
                ) {
                  return (
                    <li
                      key={pageNumber}
                      className={`page-item ${pageNumber === pagination.page ? 'active' : ''}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    </li>
                  );
                } else if (
                  pageNumber === pagination.page - 2 ||
                  pageNumber === pagination.page + 2
                ) {
                  return (
                    <li key={pageNumber} className="page-item disabled">
                      <span className="page-link">...</span>
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
                  Next <i className="ti ti-chevron-right"></i>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
