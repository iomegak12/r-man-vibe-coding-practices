// Order Details Page - View and manage specific order
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../components/common/Layout/MainLayout';
import { useToast } from '../../contexts/ToastContext';
import { orderAPI } from '../../api/order.api';
import { ORDER_STATUS, CANCELLATION_REASON_CATEGORY, RETURN_REASON_CATEGORY } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/helpers';

export const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [order, setOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonCategory, setCancelReasonCategory] = useState('Customer Request');
  const [cancelling, setCancelling] = useState(false);

  // Return modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnReasonCategory, setReturnReasonCategory] = useState('Product Quality');
  const [returnDescription, setReturnDescription] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    fetchOrderHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.getOrderById(orderId);
      console.log('Order details response:', response.data);
      const orderData = response.data?.data || response.data;
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      showError(error.response?.data?.message || 'Failed to load order details');
      if (error.response?.status === 404) {
        navigate('/orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await orderAPI.getOrderHistory(orderId);
      const history = response.data?.data || response.data || [];
      setOrderHistory(history);
    } catch (error) {
      console.error('Failed to fetch order history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      showError('Please provide a cancellation reason');
      return;
    }

    if (cancelReason.trim().length < 10) {
      showError('Cancellation reason must be at least 10 characters');
      return;
    }

    setCancelling(true);
    try {
      await orderAPI.cancelOrder(orderId, cancelReason, cancelReasonCategory);
      showSuccess('Order cancelled successfully');
      setShowCancelModal(false);
      fetchOrderDetails();
      fetchOrderHistory();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      showError(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!returnReason.trim() || !returnDescription.trim()) {
      showError('Please provide reason and description for return');
      return;
    }

    if (returnReason.trim().length < 10) {
      showError('Return reason must be at least 10 characters');
      return;
    }

    if (returnDescription.trim().length < 20) {
      showError('Return description must be at least 20 characters');
      return;
    }

    if (selectedItems.length === 0) {
      showError('Please select at least one item to return');
      return;
    }

    setRequesting(true);
    try {
      const returnData = {
        reason: returnReason,
        reasonCategory: returnReasonCategory,
        description: returnDescription,
        items: selectedItems,
      };

      await orderAPI.requestReturn(orderId, returnData);
      showSuccess('Return request submitted successfully');
      setShowReturnModal(false);
      fetchOrderDetails();
      fetchOrderHistory();
    } catch (error) {
      console.error('Failed to request return:', error);
      showError(error.response?.data?.message || 'Failed to submit return request');
    } finally {
      setRequesting(false);
    }
  };

  const toggleItemSelection = (item) => {
    const existingItem = selectedItems.find((i) => i.orderItemId === item._id);
    
    if (existingItem) {
      setSelectedItems(selectedItems.filter((i) => i.orderItemId !== item._id));
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          orderItemId: item._id,
          quantity: item.quantity,
          returnReason: returnReason || 'Item return requested',
        },
      ]);
    }
  };

  const updateItemQuantity = (itemId, newQuantity) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.orderItemId === itemId
          ? { ...item, quantity: Math.max(1, Math.min(newQuantity, item.maxQuantity)) }
          : item
      )
    );
  };

  const canCancelOrder = () => {
    return order && (order.orderStatus === ORDER_STATUS.PLACED || order.orderStatus === ORDER_STATUS.PROCESSING);
  };

  const canRequestReturn = () => {
    return order && order.orderStatus === ORDER_STATUS.DELIVERED;
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

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="text-center p-5">
          <p>Order not found</p>
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
                onClick={() => navigate('/orders')}
              >
                <i className="ti ti-arrow-left me-1"></i>
                Back to Orders
              </button>
            </div>
            <h2 className="page-title">Order Details</h2>
            <div className="text-muted mt-1">
              Order ID: <strong>{order.orderId}</strong>
            </div>
          </div>
          <div className="col-auto ms-auto d-print-none">
            <div className="btn-list">
              {canCancelOrder() && (
                <button
                  className="btn btn-outline-danger"
                  onClick={() => setShowCancelModal(true)}
                >
                  <i className="ti ti-x me-2"></i>
                  Cancel Order
                </button>
              )}
              {canRequestReturn() && (
                <button
                  className="btn btn-outline-warning"
                  onClick={() => setShowReturnModal(true)}
                >
                  <i className="ti ti-package-export me-2"></i>
                  Request Return
                </button>
              )}
            </div>
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
            <div className="text-center p-3">
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
                      {formatDate(event.timestamp)}
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

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="modal modal-blur fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cancel Order</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCancelModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Reason Category</label>
                  <select
                    className="form-select"
                    value={cancelReasonCategory}
                    onChange={(e) => setCancelReasonCategory(e.target.value)}
                  >
                    {Object.values(CANCELLATION_REASON_CATEGORY).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label required">Cancellation Reason</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Please provide a detailed reason for cancellation (min 10 characters)..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  ></textarea>
                  <small className="form-hint">
                    {cancelReason.length}/500 characters
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-link link-secondary"
                  onClick={() => setShowCancelModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Return Modal */}
      {showReturnModal && (
        <div className="modal modal-blur fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Request Return</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowReturnModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Reason Category</label>
                  <select
                    className="form-select"
                    value={returnReasonCategory}
                    onChange={(e) => setReturnReasonCategory(e.target.value)}
                  >
                    {Object.values(RETURN_REASON_CATEGORY).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label required">Return Reason</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Brief reason for return (min 10 characters)..."
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label required">Detailed Description</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Please provide a detailed description (min 20 characters)..."
                    value={returnDescription}
                    onChange={(e) => setReturnDescription(e.target.value)}
                  ></textarea>
                  <small className="form-hint">
                    {returnDescription.length}/2000 characters
                  </small>
                </div>
                <div className="mb-3">
                  <label className="form-label required">Select Items to Return</label>
                  <div className="list-group list-group-flush">
                    {order.items?.map((item) => {
                      const isSelected = selectedItems.some((i) => i.orderItemId === item._id);
                      const selectedItem = selectedItems.find((i) => i.orderItemId === item._id);
                      
                      return (
                        <div
                          key={item._id}
                          className={`list-group-item ${isSelected ? 'active' : ''}`}
                        >
                          <div className="row align-items-center">
                            <div className="col-auto">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={isSelected}
                                onChange={() => toggleItemSelection(item)}
                              />
                            </div>
                            <div className="col">
                              <strong>{item.productName}</strong>
                              <div className="text-muted small">
                                SKU: {item.sku} | Ordered: {item.quantity} | Price: {formatCurrency(item.unitPrice)}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="col-auto">
                                <label className="form-label mb-0 me-2">Qty:</label>
                                <input
                                  type="number"
                                  className="form-control form-control-sm d-inline-block"
                                  style={{ width: '80px' }}
                                  min="1"
                                  max={item.quantity}
                                  value={selectedItem?.quantity || item.quantity}
                                  onChange={(e) =>
                                    updateItemQuantity(item._id, parseInt(e.target.value))
                                  }
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {selectedItems.length === 0 && (
                    <small className="text-danger d-block mt-2">
                      Please select at least one item to return
                    </small>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-link link-secondary"
                  onClick={() => setShowReturnModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleRequestReturn}
                  disabled={requesting}
                >
                  {requesting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Return Request'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal backdrop */}
      {(showCancelModal || showReturnModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </MainLayout>
  );
};
