// Admin Order Details Page - Manage order with admin actions
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../components/common/Layout/MainLayout';
import { useToast } from '../../contexts/ToastContext';
import { orderAPI } from '../../api/order.api';
import { ORDER_STATUS } from '../../utils/constants';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/helpers';

export const AdminOrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [order, setOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Update status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    fetchOrderHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.getOrderById(orderId);
      const data = response.data?.data || response.data;
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      showError(error.response?.data?.message || 'Failed to load order details');
      if (error.response?.status === 404) {
        navigate('/admin/orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await orderAPI.getOrderHistory(orderId);
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        setOrderHistory(data);
      } else if (data?.history && Array.isArray(data.history)) {
        setOrderHistory(data.history);
      } else {
        setOrderHistory([]);
      }
    } catch (error) {
      console.error('Failed to fetch order history:', error);
      setOrderHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      showError('Please select a status');
      return;
    }

    if (newStatus === ORDER_STATUS.SHIPPED && !trackingNumber.trim()) {
      showError('Tracking number is required for shipped orders');
      return;
    }

    if (!changeReason.trim()) {
      showError('Please provide a reason for the status change');
      return;
    }

    setUpdating(true);
    try {
      await orderAPI.updateOrderStatus(
        orderId,
        newStatus,
        changeReason.trim(),
        trackingNumber.trim() || undefined
      );
      showSuccess('Order status updated successfully');
      setShowStatusModal(false);
      setNewStatus('');
      setChangeReason('');
      setTrackingNumber('');
      fetchOrderDetails();
      fetchOrderHistory();
    } catch (error) {
      console.error('Failed to update order status:', error);
      showError(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
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

  const getNextPossibleStatuses = (currentStatus) => {
    switch (currentStatus) {
      case ORDER_STATUS.PLACED:
        return [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED];
      case ORDER_STATUS.PROCESSING:
        return [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED];
      case ORDER_STATUS.SHIPPED:
        return [ORDER_STATUS.DELIVERED];
      case ORDER_STATUS.DELIVERED:
        return [];
      case ORDER_STATUS.RETURN_REQUESTED:
        return [ORDER_STATUS.PROCESSING, ORDER_STATUS.DELIVERED];
      default:
        return [];
    }
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

  if (!order) {
    return (
      <MainLayout>
        <div className="empty">
          <p className="empty-title">Order not found</p>
          <div className="empty-action">
            <button className="btn btn-primary" onClick={() => navigate('/admin/orders')}>
              Back to Orders
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const nextStatuses = getNextPossibleStatuses(order.orderStatus);

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col">
            <div className="mb-1">
              <button
                className="btn btn-ghost-secondary btn-sm"
                onClick={() => navigate('/admin/orders')}
              >
                <i className="ti ti-arrow-left me-1"></i>
                Back to Orders
              </button>
            </div>
            <h2 className="page-title">Order Details (Admin)</h2>
            <div className="text-muted mt-1">
              Order ID: <strong>#{order.orderId}</strong>
            </div>
          </div>
          <div className="col-auto ms-auto d-print-none">
            {nextStatuses.length > 0 && (
              <button
                className="btn btn-primary"
                onClick={() => setShowStatusModal(true)}
              >
                <i className="ti ti-edit me-2"></i>
                Update Status
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Order Information */}
      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">Order Information</h3>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label text-muted">Customer</label>
                <div>
                  <strong>{order.customerName || order.customerId}</strong>
                  {order.customerEmail && (
                    <div className="text-muted small">{order.customerEmail}</div>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted">Order Date</label>
                <div>{formatDate(order.orderDate)}</div>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted">Status</label>
                <div>
                  <span className={getStatusBadgeClass(order.orderStatus)}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              {order.trackingNumber && (
                <div className="mb-3">
                  <label className="form-label text-muted">Tracking Number</label>
                  <div><strong>{order.trackingNumber}</strong></div>
                </div>
              )}
              {order.estimatedDeliveryDate && (
                <div className="mb-3">
                  <label className="form-label text-muted">Estimated Delivery</label>
                  <div>{formatDate(order.estimatedDeliveryDate)}</div>
                </div>
              )}
              {order.cancellationReason && (
                <div className="mb-3">
                  <label className="form-label text-muted">Cancellation Reason</label>
                  <div>{order.cancellationReason}</div>
                </div>
              )}
            </div>
          </div>

          {order.notes && (
            <div className="alert alert-info">
              <strong>Order Notes:</strong> {order.notes}
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">Order Items</h3>
        </div>
        <div className="table-responsive">
          <table className="table table-vcenter card-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th className="text-end">Quantity</th>
                <th className="text-end">Unit Price</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div>
                      <strong>{item.productName}</strong>
                      {item.productDescription && (
                        <div className="text-muted small">
                          {item.productDescription}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="text-muted">{item.sku}</span>
                  </td>
                  <td className="text-end">{item.quantity}</td>
                  <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                  <td className="text-end">
                    <strong>{formatCurrency(item.subtotal)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="text-end"><strong>Subtotal:</strong></td>
                <td className="text-end">{formatCurrency(order.subtotal)}</td>
              </tr>
              {order.discount > 0 && (
                <tr>
                  <td colSpan="4" className="text-end">Discount:</td>
                  <td className="text-end text-danger">-{formatCurrency(order.discount)}</td>
                </tr>
              )}
              <tr>
                <td colSpan="4" className="text-end">Tax:</td>
                <td className="text-end">{formatCurrency(order.tax)}</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-end">Shipping:</td>
                <td className="text-end">{formatCurrency(order.shippingCharges)}</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-end"><strong>Total Amount:</strong></td>
                <td className="text-end"><strong className="h3">{formatCurrency(order.totalAmount)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">Delivery Address</h3>
        </div>
        <div className="card-body">
          <address>
            <strong>{order.deliveryAddress?.recipientName}</strong><br />
            {order.deliveryAddress?.street}<br />
            {order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.zipCode}<br />
            {order.deliveryAddress?.country}<br />
            <br />
            Phone: {order.deliveryAddress?.phone}
          </address>
        </div>
      </div>

      {/* Order History */}
      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">Order History</h3>
        </div>
        <div className="card-body">
          {historyLoading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : orderHistory.length === 0 ? (
            <p className="text-muted">No history available</p>
          ) : (
            <div className="timeline">
              {orderHistory.map((event, index) => (
                <div className="timeline-item" key={index}>
                  <div className="timeline-badge bg-primary"></div>
                  <div className="timeline-content">
                    <div className="mb-1">
                      <strong>{event.status}</strong>
                    </div>
                    {event.reason && (
                      <div className="text-muted small mb-1">
                        {event.reason}
                      </div>
                    )}
                    {event.trackingNumber && (
                      <div className="text-muted small mb-1">
                        Tracking: {event.trackingNumber}
                      </div>
                    )}
                    <div className="text-muted small">
                      {formatDateTime(event.timestamp)}
                    </div>
                    {event.updatedBy && (
                      <div className="text-muted small">
                        By: {event.updatedBy}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="modal modal-blur fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Order Status</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowStatusModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label required">New Status</label>
                  <select
                    className="form-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="">Select status...</option>
                    {nextStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {newStatus === ORDER_STATUS.SHIPPED && (
                  <div className="mb-3">
                    <label className="form-label required">Tracking Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter tracking number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label required">Reason/Notes</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Provide reason for status change..."
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                  ></textarea>
                  <small className="form-hint">
                    {changeReason.length}/500 characters
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-link link-secondary"
                  onClick={() => setShowStatusModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdateStatus}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="ti ti-check me-2"></i>
                      Update Status
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};
