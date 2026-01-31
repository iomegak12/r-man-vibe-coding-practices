// Create Order Page - Place new order
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/common/Layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { orderAPI } from '../../api/order.api';
import { formatCurrency } from '../../utils/helpers';

export const CreateOrderPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [creating, setCreating] = useState(false);

  // Delivery Address
  const [deliveryAddress, setDeliveryAddress] = useState({
    recipientName: user?.fullName || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  // Order Items
  const [items, setItems] = useState([
    {
      productId: '',
      productName: '',
      productDescription: '',
      sku: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      tax: 0,
    },
  ]);

  // Track which items are expanded (accordion behavior)
  const [expandedItems, setExpandedItems] = useState([0]);

  // Order Notes
  const [notes, setNotes] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({});

  const handleAddressChange = (field, value) => {
    setDeliveryAddress((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[`address.${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`address.${field}`];
        return newErrors;
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate values
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? parseInt(value) || 0 : newItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : newItems[index].unitPrice;
      
      // Auto-calculate tax (assume 18% GST)
      const subtotal = quantity * unitPrice;
      newItems[index].tax = subtotal * 0.18;
    }

    setItems(newItems);

    // Clear error for this field
    if (errors[`item.${index}.${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`item.${index}.${field}`];
        return newErrors;
      });
    }
  };

  const generateSampleProduct = () => {
    const products = [
      { id: 'P10001', name: 'Wireless Bluetooth Headphones', sku: 'S10001', price: 2499, description: 'Premium wireless headphones with noise cancellation' },
      { id: 'P10002', name: 'Smart Watch Series 5', sku: 'S10002', price: 8999, description: 'Fitness tracker with heart rate monitor and GPS' },
      { id: 'P10003', name: 'USB-C Fast Charger', sku: 'S10003', price: 799, description: '65W fast charging adapter with cable' },
      { id: 'P10004', name: 'Mechanical Gaming Keyboard', sku: 'S10004', price: 4299, description: 'RGB backlit mechanical keyboard with blue switches' },
      { id: 'P10005', name: 'Wireless Mouse', sku: 'S10005', price: 1299, description: 'Ergonomic wireless mouse with 6 programmable buttons' },
      { id: 'P10006', name: 'Laptop Stand', sku: 'S10006', price: 1599, description: 'Adjustable aluminum laptop stand' },
      { id: 'P10007', name: 'External SSD 1TB', sku: 'S10007', price: 7999, description: 'Portable external SSD with USB 3.2 Gen 2' },
      { id: 'P10008', name: 'Webcam 1080p', sku: 'S10008', price: 3499, description: 'Full HD webcam with auto-focus and built-in mic' },
      { id: 'P10009', name: 'Phone Case Premium', sku: 'S10009', price: 599, description: 'Shockproof phone case with card holder' },
      { id: 'P10010', name: 'Screen Protector', sku: 'S10010', price: 299, description: 'Tempered glass screen protector' },
    ];
    
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
    const subtotal = randomProduct.price * quantity;
    
    return {
      productId: randomProduct.id,
      productName: randomProduct.name,
      productDescription: randomProduct.description,
      sku: randomProduct.sku,
      quantity: quantity,
      unitPrice: randomProduct.price,
      discount: 0,
      tax: subtotal * 0.18, // 18% GST
    };
  };

  const handleAddItem = () => {
    const newIndex = items.length;
    setItems([
      ...items,
      {
        productId: '',
        productName: '',
        productDescription: '',
        sku: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        tax: 0,
      },
    ]);
    // Collapse all existing items and expand only the new one
    setExpandedItems([newIndex]);
  };

  const handleLoadSample = (index) => {
    const sampleProduct = generateSampleProduct();
    const newItems = [...items];
    newItems[index] = sampleProduct;
    setItems(newItems);
  };

  const toggleItemExpanded = (index) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateItemSubtotal = (item) => {
    return item.quantity * item.unitPrice;
  };

  const calculateOrderSummary = () => {
    const subtotal = items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
    const discount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
    const tax = items.reduce((sum, item) => sum + (item.tax || 0), 0);
    const shippingCharges = subtotal > 0 ? (subtotal >= 1000 ? 0 : 50) : 0; // Free shipping above ₹1000
    const total = subtotal - discount + tax + shippingCharges;

    return {
      subtotal,
      discount,
      tax,
      shippingCharges,
      total,
    };
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate delivery address
    if (!deliveryAddress.recipientName.trim()) {
      newErrors['address.recipientName'] = 'Recipient name is required';
    } else if (deliveryAddress.recipientName.trim().length < 2) {
      newErrors['address.recipientName'] = 'Recipient name must be at least 2 characters';
    }

    if (!deliveryAddress.phone.trim()) {
      newErrors['address.phone'] = 'Phone number is required';
    } else if (deliveryAddress.phone.trim().length < 10) {
      newErrors['address.phone'] = 'Phone number must be at least 10 digits';
    }

    if (!deliveryAddress.street.trim()) {
      newErrors['address.street'] = 'Street address is required';
    } else if (deliveryAddress.street.trim().length < 5) {
      newErrors['address.street'] = 'Street address must be at least 5 characters';
    }

    if (!deliveryAddress.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    if (!deliveryAddress.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }

    if (!deliveryAddress.zipCode.trim()) {
      newErrors['address.zipCode'] = 'ZIP code is required';
    } else if (deliveryAddress.zipCode.trim().length < 5) {
      newErrors['address.zipCode'] = 'ZIP code must be at least 5 characters';
    }

    if (!deliveryAddress.country.trim()) {
      newErrors['address.country'] = 'Country is required';
    }

    // Validate items
    items.forEach((item, index) => {
      if (!item.productId.trim()) {
        newErrors[`item.${index}.productId`] = 'Product ID is required';
      }

      if (!item.productName.trim()) {
        newErrors[`item.${index}.productName`] = 'Product name is required';
      } else if (item.productName.trim().length < 2) {
        newErrors[`item.${index}.productName`] = 'Product name must be at least 2 characters';
      }

      if (!item.sku.trim()) {
        newErrors[`item.${index}.sku`] = 'SKU is required';
      }

      if (item.quantity < 1) {
        newErrors[`item.${index}.quantity`] = 'Quantity must be at least 1';
      }

      if (item.unitPrice <= 0) {
        newErrors[`item.${index}.unitPrice`] = 'Unit price must be greater than 0';
      }
    });

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
      const orderData = {
        deliveryAddress,
        items,
        notes: notes.trim() || undefined,
      };

      const response = await orderAPI.createOrder(orderData);
      console.log('Order created:', response.data);
      
      const createdOrder = response.data?.data || response.data;
      showSuccess('Order placed successfully!');
      
      // Navigate to order details
      navigate(`/orders/${createdOrder.orderId}`);
    } catch (error) {
      console.error('Failed to create order:', error);
      showError(error.response?.data?.message || 'Failed to place order');
    } finally {
      setCreating(false);
    }
  };

  const orderSummary = calculateOrderSummary();

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
            <h2 className="page-title">Create New Order</h2>
            <div className="text-muted mt-1">
              Fill in the details to place your order
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Main Form */}
          <div className="col-lg-8">
            {/* Delivery Address */}
            <div className="card mb-3">
              <div className="card-header">
                <h3 className="card-title">Delivery Address</h3>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label required">Recipient Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors['address.recipientName'] ? 'is-invalid' : ''}`}
                      value={deliveryAddress.recipientName}
                      onChange={(e) => handleAddressChange('recipientName', e.target.value)}
                      placeholder="Recipient's full name"
                    />
                    {errors['address.recipientName'] && (
                      <div className="invalid-feedback">{errors['address.recipientName']}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label required">Phone Number</label>
                    <input
                      type="tel"
                      className={`form-control ${errors['address.phone'] ? 'is-invalid' : ''}`}
                      value={deliveryAddress.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      placeholder="+91 9876543210"
                    />
                    {errors['address.phone'] && (
                      <div className="invalid-feedback">{errors['address.phone']}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label required">Street Address</label>
                  <input
                    type="text"
                    className={`form-control ${errors['address.street'] ? 'is-invalid' : ''}`}
                    value={deliveryAddress.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="Street address, building number, apartment, etc."
                  />
                  {errors['address.street'] && (
                    <div className="invalid-feedback">{errors['address.street']}</div>
                  )}
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label required">City</label>
                    <input
                      type="text"
                      className={`form-control ${errors['address.city'] ? 'is-invalid' : ''}`}
                      value={deliveryAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="City"
                    />
                    {errors['address.city'] && (
                      <div className="invalid-feedback">{errors['address.city']}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label required">State</label>
                    <input
                      type="text"
                      className={`form-control ${errors['address.state'] ? 'is-invalid' : ''}`}
                      value={deliveryAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      placeholder="State"
                    />
                    {errors['address.state'] && (
                      <div className="invalid-feedback">{errors['address.state']}</div>
                    )}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label required">ZIP Code</label>
                    <input
                      type="text"
                      className={`form-control ${errors['address.zipCode'] ? 'is-invalid' : ''}`}
                      value={deliveryAddress.zipCode}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      placeholder="123456"
                    />
                    {errors['address.zipCode'] && (
                      <div className="invalid-feedback">{errors['address.zipCode']}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label required">Country</label>
                    <input
                      type="text"
                      className={`form-control ${errors['address.country'] ? 'is-invalid' : ''}`}
                      value={deliveryAddress.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      placeholder="Country"
                    />
                    {errors['address.country'] && (
                      <div className="invalid-feedback">{errors['address.country']}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="card mb-3">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="card-title mb-0">Order Items</h3>
                  <div className="btn-list">
                    <button
                      type="button"
                      className="btn btn-sm btn-icon btn-ghost-primary"
                      onClick={() => {
                        const newIndex = items.length;
                        const sampleProduct = generateSampleProduct();
                        setItems([...items, sampleProduct]);
                        setExpandedItems([newIndex]);
                      }}
                      title="Add item with sample data"
                    >
                      <i className="ti ti-sparkles"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-icon btn-primary"
                      onClick={handleAddItem}
                      title="Add new item"
                    >
                      <i className="ti ti-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {items.map((item, index) => (
                  <div key={index} className="border rounded mb-3">
                    <div 
                      className="d-flex justify-content-between align-items-center p-3" 
                      style={{ cursor: 'pointer', backgroundColor: expandedItems.includes(index) ? '#f8f9fa' : 'white' }}
                      onClick={() => toggleItemExpanded(index)}
                    >
                      <div className="d-flex align-items-center">
                        <i className={`ti ti-chevron-${expandedItems.includes(index) ? 'down' : 'right'} me-2`}></i>
                        <h4 className="mb-0">
                          Item #{index + 1}
                          {item.productName && (
                            <span className="text-muted ms-2" style={{ fontSize: '0.875rem', fontWeight: 'normal' }}>
                              {item.productName}
                            </span>
                          )}
                        </h4>
                      </div>
                      <div className="btn-list" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="btn btn-sm btn-icon btn-ghost-primary"
                          onClick={() => handleLoadSample(index)}
                          title="Load sample product"
                        >
                          <i className="ti ti-sparkles"></i>
                        </button>
                        {items.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-icon btn-ghost-danger"
                            onClick={() => handleRemoveItem(index)}
                            title="Remove item"
                          >
                            <i className="ti ti-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>

                    {expandedItems.includes(index) && (
                      <div className="p-3 pt-0">

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label required">Product ID</label>
                        <input
                          type="text"
                          className={`form-control ${errors[`item.${index}.productId`] ? 'is-invalid' : ''}`}
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                          placeholder="PROD-001"
                        />
                        {errors[`item.${index}.productId`] && (
                          <div className="invalid-feedback">{errors[`item.${index}.productId`]}</div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label required">SKU</label>
                        <input
                          type="text"
                          className={`form-control ${errors[`item.${index}.sku`] ? 'is-invalid' : ''}`}
                          value={item.sku}
                          onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
                          placeholder="SKU-001"
                        />
                        {errors[`item.${index}.sku`] && (
                          <div className="invalid-feedback">{errors[`item.${index}.sku`]}</div>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label required">Product Name</label>
                      <input
                        type="text"
                        className={`form-control ${errors[`item.${index}.productName`] ? 'is-invalid' : ''}`}
                        value={item.productName}
                        onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                        placeholder="Product name"
                      />
                      {errors[`item.${index}.productName`] && (
                        <div className="invalid-feedback">{errors[`item.${index}.productName`]}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Product Description</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={item.productDescription}
                        onChange={(e) => handleItemChange(index, 'productDescription', e.target.value)}
                        placeholder="Product description (optional)"
                      ></textarea>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-4">
                        <label className="form-label required">Quantity</label>
                        <input
                          type="number"
                          className={`form-control ${errors[`item.${index}.quantity`] ? 'is-invalid' : ''}`}
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        />
                        {errors[`item.${index}.quantity`] && (
                          <div className="invalid-feedback">{errors[`item.${index}.quantity`]}</div>
                        )}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label required">Unit Price (₹)</label>
                        <input
                          type="number"
                          className={`form-control ${errors[`item.${index}.unitPrice`] ? 'is-invalid' : ''}`}
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        />
                        {errors[`item.${index}.unitPrice`] && (
                          <div className="invalid-feedback">{errors[`item.${index}.unitPrice`]}</div>
                        )}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Discount (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="0.01"
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <label className="form-label">Tax (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          step="0.01"
                          value={item.tax}
                          onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                          placeholder="Auto-calculated or manual"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Subtotal</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formatCurrency(calculateItemSubtotal(item))}
                          readOnly
                          disabled
                        />
                      </div>
                    </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            <div className="card mb-3">
              <div className="card-header">
                <h3 className="card-title">Order Notes</h3>
              </div>
              <div className="card-body">
                <textarea
                  className="form-control"
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or notes for this order (optional)"
                  maxLength={1000}
                ></textarea>
                <small className="form-hint">{notes.length}/1000 characters</small>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="col-lg-4">
            <div className="card sticky-top" style={{ top: '1rem' }}>
              <div className="card-header">
                <h3 className="card-title">Order Summary</h3>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <strong>{formatCurrency(orderSummary.subtotal)}</strong>
                </div>
                {orderSummary.discount > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-danger">
                    <span>Discount:</span>
                    <strong>-{formatCurrency(orderSummary.discount)}</strong>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax:</span>
                  <strong>{formatCurrency(orderSummary.tax)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <strong>
                    {orderSummary.shippingCharges === 0 ? (
                      <span className="text-success">FREE</span>
                    ) : (
                      formatCurrency(orderSummary.shippingCharges)
                    )}
                  </strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong className="h4 mb-0">Total:</strong>
                  <strong className="h3 mb-0">{formatCurrency(orderSummary.total)}</strong>
                </div>

                {orderSummary.subtotal > 0 && orderSummary.subtotal < 1000 && (
                  <div className="alert alert-info mb-3">
                    <small>
                      Add {formatCurrency(1000 - orderSummary.subtotal)} more for FREE shipping!
                    </small>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={creating || orderSummary.total === 0}
                >
                  {creating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <i className="ti ti-shopping-cart me-2"></i>
                      Place Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </MainLayout>
  );
};
