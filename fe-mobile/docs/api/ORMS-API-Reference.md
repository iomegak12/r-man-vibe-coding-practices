# ORMS API Reference
## Order Management Service

**Base URL:** `http://localhost:5003` (Development)  
**Version:** 1.0  
**Last Updated:** January 28, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Order Management Endpoints](#order-management-endpoints)
3. [Admin - Order Management Endpoints](#admin---order-management-endpoints)
4. [Admin - Return Management Endpoints](#admin---return-management-endpoints)
5. [Data Models](#data-models)
6. [Validation Rules](#validation-rules)
7. [Business Rules](#business-rules)

---

## Overview

ORMS (Order Management Service) handles the complete order lifecycle including creation, tracking, cancellation, and returns.

### Key Features
- Order creation with delivery address and line items
- Order tracking and status management
- Order cancellation with business rules
- Return request management
- Order history tracking
- Administrative order management
- Order analytics and reporting

### Order Status Flow

```
Placed → Processing → Shipped → Delivered
   ↓                                ↓
Cancelled                    Return Requested → Returned
```

**Order Statuses:**
- **Placed:** Order has been created
- **Processing:** Order is being prepared for shipment
- **Shipped:** Order has been shipped to customer
- **Delivered:** Order has been delivered successfully
- **Cancelled:** Order was cancelled (before shipping)
- **Return Requested:** Customer has requested a return
- **Returned:** Order has been returned and refund processed

---

## Order Management Endpoints

### 1. Create Order

Creates a new order for the authenticated customer.

**Endpoint:** `POST /api/orders`  
**Authentication:** Required (Bearer token - Customer)

#### Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "deliveryAddress": {
    "fullName": "John Doe",
    "phoneNumber": "+919876543210",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India",
    "landmark": "Near Central Park"
  },
  "items": [
    {
      "productId": "PROD-12345",
      "productName": "Wireless Headphones",
      "productDescription": "Bluetooth 5.0 wireless headphones with noise cancellation",
      "sku": "WH-1000XM4-BLK",
      "quantity": 2,
      "unitPrice": 15000.00,
      "discount": 1000.00,
      "tax": 2700.00
    },
    {
      "productId": "PROD-67890",
      "productName": "Laptop Stand",
      "productDescription": "Adjustable aluminum laptop stand",
      "sku": "LS-ALU-001",
      "quantity": 1,
      "unitPrice": 2500.00,
      "discount": 0,
      "tax": 450.00
    }
  ],
  "notes": "Please handle with care"
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| **deliveryAddress** | object | ✅ Yes | - | Delivery address |
| &nbsp;&nbsp;fullName | string | ✅ Yes | 2-100 chars | Recipient name |
| &nbsp;&nbsp;phoneNumber | string | ✅ Yes | 10-15 chars | Contact number |
| &nbsp;&nbsp;addressLine1 | string | ✅ Yes | 5-200 chars | Street address |
| &nbsp;&nbsp;addressLine2 | string | ❌ No | Max 200 chars | Additional address |
| &nbsp;&nbsp;city | string | ✅ Yes | 2-100 chars | City name |
| &nbsp;&nbsp;state | string | ✅ Yes | 2-100 chars | State/Province |
| &nbsp;&nbsp;postalCode | string | ✅ Yes | 5-10 chars | ZIP/Postal code |
| &nbsp;&nbsp;country | string | ✅ Yes | 2-100 chars | Country name |
| &nbsp;&nbsp;landmark | string | ❌ No | Max 200 chars | Nearby landmark |
| **items** | array | ✅ Yes | Min 1 item | Order items |
| &nbsp;&nbsp;productId | string | ✅ Yes | Not empty | Product identifier |
| &nbsp;&nbsp;productName | string | ✅ Yes | 2-200 chars | Product name |
| &nbsp;&nbsp;productDescription | string | ❌ No | Max 500 chars | Description |
| &nbsp;&nbsp;sku | string | ✅ Yes | Not empty | SKU code |
| &nbsp;&nbsp;quantity | integer | ✅ Yes | Min 1 | Quantity ordered |
| &nbsp;&nbsp;unitPrice | number | ✅ Yes | > 0 | Price per unit |
| &nbsp;&nbsp;discount | number | ❌ No | >= 0 | Discount amount |
| &nbsp;&nbsp;tax | number | ❌ No | >= 0 | Tax amount |
| **notes** | string | ❌ No | Max 1000 chars | Order notes |

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "ORD-2026-0000001",
    "customerId": "6979a1b1a6db796b4a1447e9",
    "customerName": "John Doe",
    "customerEmail": "john.doe@example.com",
    "deliveryAddress": {
      "fullName": "John Doe",
      "phoneNumber": "+919876543210",
      "addressLine1": "123 Main Street",
      "addressLine2": "Apartment 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postalCode": "400001",
      "country": "India",
      "landmark": "Near Central Park"
    },
    "items": [
      {
        "orderItemId": "6979b2c3d4e5f67890abcdef",
        "productId": "PROD-12345",
        "productName": "Wireless Headphones",
        "productDescription": "Bluetooth 5.0 wireless headphones with noise cancellation",
        "sku": "WH-1000XM4-BLK",
        "quantity": 2,
        "unitPrice": 15000.00,
        "discount": 1000.00,
        "tax": 2700.00,
        "totalPrice": 31700.00
      },
      {
        "orderItemId": "6979b2c3d4e5f67890abcd00",
        "productId": "PROD-67890",
        "productName": "Laptop Stand",
        "productDescription": "Adjustable aluminum laptop stand",
        "sku": "LS-ALU-001",
        "quantity": 1,
        "unitPrice": 2500.00,
        "discount": 0,
        "tax": 450.00,
        "totalPrice": 2950.00
      }
    ],
    "subtotal": 32500.00,
    "discount": 1000.00,
    "tax": 3150.00,
    "totalAmount": 34650.00,
    "status": "Placed",
    "orderDate": "2026-01-28T10:30:00.000Z",
    "itemCount": 2,
    "estimatedDeliveryDate": "2026-02-04T10:30:00.000Z",
    "notes": "Please handle with care",
    "createdAt": "2026-01-28T10:30:00.000Z",
    "updatedAt": "2026-01-28T10:30:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request - Empty Order**
```json
{
  "success": false,
  "message": "Order must contain at least one item",
  "data": null
}
```

**404 Not Found - Customer Profile Missing**
```json
{
  "success": false,
  "message": "Customer profile not found. Please contact support.",
  "data": null
}
```

#### Usage Example

**When to use:** Shopping cart checkout, place order flow  
**Note:** Automatically generates unique order ID (ORD-YYYY-NNNNNNN)

---

### 2. Get My Orders

Retrieves a paginated list of orders for the authenticated customer.

**Endpoint:** `GET /api/orders/me`  
**Authentication:** Required (Bearer token - Customer)

#### Headers

```http
Authorization: Bearer <access_token>
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | ❌ No | 1 | Page number (min: 1) |
| `page_size` | integer | ❌ No | 20 | Items per page (min: 1, max: 100) |
| `order_status` | string | ❌ No | - | Filter by status |
| `search` | string | ❌ No | - | Search in order ID, name, email |

#### Example Request

```http
GET /api/orders/me?page=1&page_size=10&order_status=Delivered
```

#### Success Response (200 OK)

```json
{
  "items": [
    {
      "orderId": "ORD-2026-0000001",
      "customerId": "6979a1b1a6db796b4a1447e9",
      "customerName": "John Doe",
      "customerEmail": "john.doe@example.com",
      "deliveryAddress": {
        "fullName": "John Doe",
        "phoneNumber": "+919876543210",
        "addressLine1": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400001",
        "country": "India"
      },
      "totalAmount": 34650.00,
      "status": "Delivered",
      "orderDate": "2026-01-28T10:30:00.000Z",
      "estimatedDeliveryDate": "2026-02-04T10:30:00.000Z",
      "actualDeliveryDate": "2026-02-03T14:20:00.000Z",
      "itemCount": 2
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalPages": 5,
    "totalCount": 47,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

#### Usage Example

**When to use:** Order history page, customer dashboard  
**Sorting:** Orders are sorted by order date (newest first)

---

### 3. Get Order Details

Retrieves detailed information about a specific order.

**Endpoint:** `GET /api/orders/{order_id}`  
**Authentication:** Required (Bearer token - Customer or Admin)

#### Headers

```http
Authorization: Bearer <access_token>
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `order_id` | string | ✅ Yes | Order ID (e.g., ORD-2026-0000001) |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Order details retrieved successfully",
  "data": {
    "orderId": "ORD-2026-0000001",
    "customerId": "6979a1b1a6db796b4a1447e9",
    "customerName": "John Doe",
    "customerEmail": "john.doe@example.com",
    "deliveryAddress": {
      "fullName": "John Doe",
      "phoneNumber": "+919876543210",
      "addressLine1": "123 Main Street",
      "addressLine2": "Apartment 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postalCode": "400001",
      "country": "India",
      "landmark": "Near Central Park"
    },
    "items": [
      {
        "orderItemId": "6979b2c3d4e5f67890abcdef",
        "productId": "PROD-12345",
        "productName": "Wireless Headphones",
        "productDescription": "Bluetooth 5.0 wireless headphones with noise cancellation",
        "sku": "WH-1000XM4-BLK",
        "quantity": 2,
        "unitPrice": 15000.00,
        "discount": 1000.00,
        "tax": 2700.00,
        "totalPrice": 31700.00
      }
    ],
    "subtotal": 32500.00,
    "discount": 1000.00,
    "tax": 3150.00,
    "totalAmount": 34650.00,
    "status": "Delivered",
    "orderDate": "2026-01-28T10:30:00.000Z",
    "estimatedDeliveryDate": "2026-02-04T10:30:00.000Z",
    "actualDeliveryDate": "2026-02-03T14:20:00.000Z",
    "itemCount": 2,
    "notes": "Please handle with care",
    "createdAt": "2026-01-28T10:30:00.000Z",
    "updatedAt": "2026-02-03T14:20:00.000Z"
  }
}
```

#### Error Responses

**403 Forbidden - Not Owner**
```json
{
  "success": false,
  "message": "You do not have permission to view this order",
  "data": null
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Order not found",
  "data": null
}
```

#### Usage Example

**When to use:** Order details page, order tracking  
**Permission:** Customers can only view their own orders, Admins can view any order

---

### 4. Cancel Order

Cancels an existing order.

**Endpoint:** `POST /api/orders/{order_id}/cancel`  
**Authentication:** Required (Bearer token - Customer or Admin)

#### Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `order_id` | string | ✅ Yes | Order ID to cancel |

#### Request Body

```json
{
  "reason": "Ordered by mistake",
  "reasonCategory": "Customer Request"
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `reason` | string | ✅ Yes | 10-500 chars | Cancellation reason |
| `reasonCategory` | string | ✅ Yes | See allowed values | Category |

**Allowed reasonCategory values:**
- `"Customer Request"`
- `"Out of Stock"`
- `"Payment Failed"`
- `"Duplicate Order"`
- `"Other"`

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "orderId": "ORD-2026-0000001",
    "status": "Cancelled",
    "cancellationInfo": {
      "reason": "Ordered by mistake",
      "reasonCategory": "Customer Request",
      "cancelledBy": "6979a1b1a6db796b4a1447e8",
      "cancelledByRole": "Customer",
      "cancelledAt": "2026-01-28T11:00:00.000Z"
    },
    "updatedAt": "2026-01-28T11:00:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request - Cannot Cancel**
```json
{
  "success": false,
  "message": "Orders with status 'Delivered' cannot be cancelled. Only 'Placed' or 'Processing' orders can be cancelled.",
  "data": null
}
```

**403 Forbidden - Not Owner**
```json
{
  "success": false,
  "message": "You do not have permission to cancel this order",
  "data": null
}
```

#### Business Rules

✅ **Can Cancel:**
- Orders with status `"Placed"`
- Orders with status `"Processing"`

❌ **Cannot Cancel:**
- Orders with status `"Shipped"`
- Orders with status `"Delivered"`
- Orders with status `"Cancelled"`
- Orders with status `"Return Requested"`
- Orders with status `"Returned"`

#### Usage Example

**When to use:** Cancel order flow, order management  
**Permission:** Customers can only cancel their own orders, Admins can cancel any order

---

### 5. Request Order Return

Requests a return for a delivered order.

**Endpoint:** `POST /api/orders/{order_id}/return`  
**Authentication:** Required (Bearer token - Customer)

#### Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `order_id` | string | ✅ Yes | Order ID to return |

#### Request Body

```json
{
  "reason": "Product not as described",
  "reasonCategory": "Product Quality",
  "description": "The headphones are not working properly. No sound from the left ear piece.",
  "items": [
    {
      "orderItemId": "6979b2c3d4e5f67890abcdef",
      "quantity": 1,
      "returnReason": "Defective - no sound from left side"
    }
  ]
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `reason` | string | ✅ Yes | 10-500 chars | Return reason summary |
| `reasonCategory` | string | ✅ Yes | See allowed values | Category |
| `description` | string | ✅ Yes | 20-2000 chars | Detailed description |
| **items** | array | ✅ Yes | Min 1 item | Items to return |
| &nbsp;&nbsp;orderItemId | string | ✅ Yes | Valid ObjectId | Item ID from order |
| &nbsp;&nbsp;quantity | integer | ✅ Yes | >= 1, <= ordered qty | Quantity to return |
| &nbsp;&nbsp;returnReason | string | ✅ Yes | 10-500 chars | Specific item reason |

**Allowed reasonCategory values:**
- `"Product Quality"`
- `"Wrong Product"`
- `"Product Damaged"`
- `"Not Satisfied"`
- `"Other"`

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Return request submitted successfully. Admin will review your request.",
  "data": {
    "orderId": "ORD-2026-0000001",
    "status": "Return Requested",
    "returnInfo": {
      "reason": "Product not as described",
      "reasonCategory": "Product Quality",
      "description": "The headphones are not working properly. No sound from the left ear piece.",
      "requestedBy": "6979a1b1a6db796b4a1447e8",
      "requestedAt": "2026-01-28T12:00:00.000Z",
      "status": "Pending",
      "items": [
        {
          "orderItemId": "6979b2c3d4e5f67890abcdef",
          "quantity": 1,
          "returnReason": "Defective - no sound from left side"
        }
      ]
    },
    "updatedAt": "2026-01-28T12:00:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request - Not Delivered**
```json
{
  "success": false,
  "message": "Only delivered orders can be returned. Current status: Shipped",
  "data": null
}
```

**400 Bad Request - Invalid Item**
```json
{
  "success": false,
  "message": "Invalid order item ID: 6979b2c3d4e5f67890abcxxx",
  "data": null
}
```

**400 Bad Request - Quantity Exceeded**
```json
{
  "success": false,
  "message": "Return quantity (3) exceeds ordered quantity (2) for item Wireless Headphones",
  "data": null
}
```

#### Business Rules

✅ **Can Request Return:**
- Only orders with status `"Delivered"`
- Must specify at least one item to return
- Return quantity must not exceed ordered quantity

❌ **Cannot Request Return:**
- Orders not yet delivered
- Orders already cancelled
- Orders already returned

#### Usage Example

**When to use:** Product return flow  
**Next Step:** Admin must approve the return request

---

### 6. Get Order History

Retrieves the complete status history for an order.

**Endpoint:** `GET /api/orders/{order_id}/history`  
**Authentication:** Required (Bearer token - Customer or Admin)

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Order history retrieved successfully",
  "data": [
    {
      "historyId": "697a1234567890abcdef0001",
      "orderId": "ORD-2026-0000001",
      "previousStatus": null,
      "newStatus": "Placed",
      "changedBy": "6979a1b1a6db796b4a1447e8",
      "changedByRole": "Customer",
      "changedByName": "John Doe",
      "changeReason": "Order created",
      "changedAt": "2026-01-28T10:30:00.000Z"
    },
    {
      "historyId": "697a1234567890abcdef0002",
      "orderId": "ORD-2026-0000001",
      "previousStatus": "Placed",
      "newStatus": "Processing",
      "changedBy": "admin@example.com",
      "changedByRole": "Administrator",
      "changedByName": "Admin User",
      "changeReason": "Order confirmed and being prepared",
      "changedAt": "2026-01-28T14:00:00.000Z"
    },
    {
      "historyId": "697a1234567890abcdef0003",
      "orderId": "ORD-2026-0000001",
      "previousStatus": "Processing",
      "newStatus": "Shipped",
      "changedBy": "admin@example.com",
      "changedByRole": "Administrator",
      "changedByName": "Admin User",
      "changeReason": "Order shipped - Tracking: TRK123456",
      "changedAt": "2026-01-30T09:00:00.000Z"
    },
    {
      "historyId": "697a1234567890abcdef0004",
      "orderId": "ORD-2026-0000001",
      "previousStatus": "Shipped",
      "newStatus": "Delivered",
      "changedBy": "admin@example.com",
      "changedByRole": "Administrator",
      "changedByName": "Admin User",
      "changeReason": "Order delivered successfully",
      "changedAt": "2026-02-03T14:20:00.000Z"
    }
  ]
}
```

#### Usage Example

**When to use:** Order tracking timeline, status audit trail

---

## Admin - Order Management Endpoints

### 7. List All Orders (Admin)

Retrieves a paginated list of all orders with filtering (Admin only).

**Endpoint:** `GET /api/admin/orders`  
**Authentication:** Required (Admin Bearer token)

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | ❌ No | 1 | Page number |
| `page_size` | integer | ❌ No | 20 | Items per page (max: 100) |
| `order_status` | string | ❌ No | - | Filter by status |
| `customer_id` | string | ❌ No | - | Filter by customer ID |
| `search` | string | ❌ No | - | Search in order ID, customer name, email |
| `from_date` | string | ❌ No | - | Filter from date (YYYY-MM-DD) |
| `to_date` | string | ❌ No | - | Filter to date (YYYY-MM-DD) |

#### Example Request

```http
GET /api/admin/orders?page=1&page_size=20&order_status=Processing&from_date=2026-01-01
```

#### Success Response (200 OK)

```json
{
  "items": [
    {
      "orderId": "ORD-2026-0000001",
      "customerId": "6979a1b1a6db796b4a1447e9",
      "customerName": "John Doe",
      "customerEmail": "john.doe@example.com",
      "deliveryAddress": {
        "fullName": "John Doe",
        "phoneNumber": "+919876543210",
        "addressLine1": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400001",
        "country": "India"
      },
      "totalAmount": 34650.00,
      "status": "Processing",
      "orderDate": "2026-01-28T10:30:00.000Z",
      "estimatedDeliveryDate": "2026-02-04T10:30:00.000Z",
      "itemCount": 2
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 125,
    "totalCount": 2487,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

### 8. Update Order Status (Admin)

Updates the status of an order (Admin only).

**Endpoint:** `PATCH /api/admin/orders/{order_id}/status`  
**Authentication:** Required (Admin Bearer token)

#### Request Body

```json
{
  "newStatus": "Shipped",
  "changeReason": "Order shipped via FedEx - Tracking: FDX123456789",
  "trackingNumber": "FDX123456789"
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `newStatus` | string | ✅ Yes | Valid status | New order status |
| `changeReason` | string | ✅ Yes | 10-500 chars | Reason for change |
| `trackingNumber` | string | ❌ No | Max 100 chars | Shipping tracking number |

**Valid status values:**
- `"Placed"`
- `"Processing"`
- `"Shipped"`
- `"Delivered"`
- `"Cancelled"`

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "orderId": "ORD-2026-0000001",
    "previousStatus": "Processing",
    "newStatus": "Shipped",
    "updatedAt": "2026-01-30T09:00:00.000Z"
  }
}
```

---

### 9. Get Order Analytics (Admin)

Retrieves overall order analytics and statistics (Admin only).

**Endpoint:** `GET /api/admin/orders/analytics`  
**Authentication:** Required (Admin Bearer token)

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Order analytics retrieved successfully",
  "data": {
    "summary": {
      "totalOrders": 2487,
      "totalRevenue": 5678945.50,
      "averageOrderValue": 2283.12,
      "ordersToday": 47,
      "ordersThisWeek": 234,
      "ordersThisMonth": 876
    },
    "ordersByStatus": {
      "Placed": 123,
      "Processing": 87,
      "Shipped": 145,
      "Delivered": 2045,
      "Cancelled": 67,
      "Return Requested": 15,
      "Returned": 5
    },
    "topCustomers": [
      {
        "customerId": "6979a1b1a6db796b4a1447e9",
        "customerName": "John Doe",
        "customerEmail": "john.doe@example.com",
        "totalOrders": 45,
        "totalRevenue": 89456.50
      }
    ]
  }
}
```

---

## Admin - Return Management Endpoints

### 10. List All Return Requests (Admin)

Retrieves all return requests with filtering (Admin only).

**Endpoint:** `GET /api/admin/returns`  
**Authentication:** Required (Admin Bearer token)

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | ❌ No | Page number (default: 1) |
| `page_size` | integer | ❌ No | Items per page (default: 10, max: 100) |
| `status` | string | ❌ No | Filter by return status (Pending, Approved, Rejected) |
| `customer_id` | string | ❌ No | Filter by customer ID |
| `order_id` | string | ❌ No | Filter by order ID |
| `from_date` | string | ❌ No | Filter from date (YYYY-MM-DD) |
| `to_date` | string | ❌ No | Filter to date (YYYY-MM-DD) |

#### Success Response (200 OK)

```json
{
  "items": [
    {
      "orderId": "ORD-2026-0000001",
      "customerId": "6979a1b1a6db796b4a1447e9",
      "customerName": "John Doe",
      "customerEmail": "john.doe@example.com",
      "totalAmount": 34650.00,
      "returnInfo": {
        "status": "Pending",
        "reason": "Product not as described",
        "reasonCategory": "Product Quality",
        "description": "The headphones are not working properly",
        "requestedAt": "2026-01-28T12:00:00.000Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalPages": 3,
    "totalCount": 25,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

### 11. Get Return Details (Admin)

Retrieves detailed information about a specific return request (Admin only).

**Endpoint:** `GET /api/admin/returns/{order_id}`  
**Authentication:** Required (Admin Bearer token)

#### Success Response (200 OK)

```json
{
  "orderId": "ORD-2026-0000001",
  "customerId": "6979a1b1a6db796b4a1447e9",
  "customerName": "John Doe",
  "customerEmail": "john.doe@example.com",
  "totalAmount": 34650.00,
  "returnInfo": {
    "status": "Pending",
    "reason": "Product not as described",
    "reasonCategory": "Product Quality",
    "description": "The headphones are not working properly. No sound from the left ear piece.",
    "requestedBy": "6979a1b1a6db796b4a1447e8",
    "requestedAt": "2026-01-28T12:00:00.000Z",
    "items": [
      {
        "orderItemId": "6979b2c3d4e5f67890abcdef",
        "quantity": 1,
        "returnReason": "Defective - no sound from left side",
        "productName": "Wireless Headphones",
        "productId": "PROD-12345",
        "unitPrice": 15000.00
      }
    ]
  }
}
```

---

### 12. Review Return Request (Admin)

Approves or rejects a return request (Admin only).

**Endpoint:** `POST /api/admin/returns/{order_id}/review`  
**Authentication:** Required (Admin Bearer token)

#### Request Body

```json
{
  "decision": "Approved",
  "adminNotes": "Return approved. Customer to ship product back. Refund will be processed upon receipt.",
  "refundAmount": 15000.00
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `decision` | string | ✅ Yes | "Approved" or "Rejected" | Admin decision |
| `adminNotes` | string | ✅ Yes | 10-1000 chars | Admin notes/instructions |
| `refundAmount` | number | ❌ No | > 0 | Refund amount (required if Approved) |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Return request approved successfully",
  "data": {
    "orderId": "ORD-2026-0000001",
    "returnStatus": "Approved",
    "refundAmount": 15000.00,
    "reviewedBy": "admin@example.com",
    "reviewedAt": "2026-01-28T15:00:00.000Z"
  }
}
```

**If Rejected:**
```json
{
  "success": true,
  "message": "Return request rejected",
  "data": {
    "orderId": "ORD-2026-0000001",
    "returnStatus": "Rejected",
    "reviewedBy": "admin@example.com",
    "reviewedAt": "2026-01-28T15:00:00.000Z"
  }
}
```

---

## Data Models

### Order Object

```typescript
{
  orderId: string;                     // Unique order ID (ORD-YYYY-NNNNNNN)
  customerId: string;                  // Customer ID
  customerName: string;                // Customer full name
  customerEmail: string;               // Customer email
  deliveryAddress: DeliveryAddress;    // Shipping address
  items: OrderItem[];                  // Order line items
  subtotal: number;                    // Sum of all items before tax/discount
  discount: number;                    // Total discount amount
  tax: number;                         // Total tax amount
  totalAmount: number;                 // Final total (subtotal - discount + tax)
  status: OrderStatus;                 // Current order status
  orderDate: string;                   // ISO 8601 timestamp
  estimatedDeliveryDate?: string;      // Estimated delivery date
  actualDeliveryDate?: string;         // Actual delivery date
  itemCount: number;                   // Number of items in order
  cancellationInfo?: CancellationInfo; // Cancellation details (if cancelled)
  returnInfo?: ReturnInfo;             // Return details (if returned)
  notes?: string;                      // Customer notes
  createdAt: string;                   // Record creation timestamp
  updatedAt: string;                   // Last update timestamp
}
```

### DeliveryAddress Object

```typescript
{
  fullName: string;           // Recipient name
  phoneNumber: string;        // Contact number
  addressLine1: string;       // Street address
  addressLine2?: string;      // Additional address
  city: string;               // City name
  state: string;              // State/Province
  postalCode: string;         // ZIP/Postal code
  country: string;            // Country name
  landmark?: string;          // Nearby landmark
}
```

### OrderItem Object

```typescript
{
  orderItemId: string;        // Unique item ID
  productId: string;          // Product identifier
  productName: string;        // Product name
  productDescription?: string; // Product description
  sku: string;                // SKU code
  quantity: number;           // Quantity ordered
  unitPrice: number;          // Price per unit
  discount: number;           // Discount amount
  tax: number;                // Tax amount
  totalPrice: number;         // Total for this item
}
```

### CancellationInfo Object

```typescript
{
  reason: string;             // Cancellation reason
  reasonCategory: string;     // Category
  cancelledBy: string;        // User ID who cancelled
  cancelledByRole: string;    // "Customer" or "Administrator"
  cancelledAt: string;        // ISO 8601 timestamp
}
```

### ReturnInfo Object

```typescript
{
  reason: string;             // Return reason summary
  reasonCategory: string;     // Category
  description: string;        // Detailed description
  requestedBy: string;        // User ID who requested
  requestedAt: string;        // ISO 8601 timestamp
  status: string;             // "Pending", "Approved", "Rejected"
  items: ReturnItem[];        // Items being returned
  reviewedBy?: string;        // Admin who reviewed
  reviewedAt?: string;        // Review timestamp
  adminNotes?: string;        // Admin notes
  refundAmount?: number;      // Refund amount (if approved)
}
```

---

## Validation Rules

### Order Creation
- **Minimum Items:** 1 item required
- **Delivery Address:** All required fields must be provided
- **Item Quantity:** Must be >= 1
- **Item Price:** Must be > 0
- **Discount/Tax:** Must be >= 0

### Order Cancellation
- **Allowed Statuses:** Only "Placed" or "Processing" orders can be cancelled
- **Reason Length:** 10-500 characters
- **Reason Category:** Must be one of the allowed values

### Return Request
- **Allowed Status:** Only "Delivered" orders can be returned
- **Return Reason:** 10-500 characters
- **Description:** 20-2000 characters
- **Return Items:** At least 1 item required
- **Return Quantity:** Must not exceed ordered quantity

---

## Business Rules

### Order Creation
1. Customer profile must exist in CRMS
2. Order ID is auto-generated in format `ORD-YYYY-NNNNNNN`
3. Estimated delivery date is set to 7 days from order date
4. Initial status is always "Placed"
5. Order history entry is created automatically

### Order Cancellation
1. Only "Placed" and "Processing" orders can be cancelled
2. Customers can only cancel their own orders
3. Admins can cancel any order
4. Cancellation updates customer statistics in CRMS (decrements order count and value)
5. Order history is updated with cancellation details

### Return Requests
1. Only "Delivered" orders can be returned
2. Customer must specify which items to return
3. Return quantity cannot exceed ordered quantity
4. Return request requires admin approval
5. Order status changes to "Return Requested" with status "Pending"
6. Admin can approve or reject with notes

### Status Transitions
```
Valid transitions:
Placed → Processing
Processing → Shipped
Shipped → Delivered
Placed → Cancelled
Processing → Cancelled
Delivered → Return Requested
Return Requested → Returned (after admin approval)
```

---

## Common Workflows

### Customer Workflow: Place and Track Order

```
1. Create order
   POST /api/orders
   { deliveryAddress, items, notes }

2. Get my orders
   GET /api/orders/me

3. View order details
   GET /api/orders/{orderId}

4. Track order history
   GET /api/orders/{orderId}/history
```

### Customer Workflow: Cancel Order

```
1. Get order details to verify status
   GET /api/orders/{orderId}

2. Cancel order (if status is Placed or Processing)
   POST /api/orders/{orderId}/cancel
   { reason, reasonCategory }
```

### Customer Workflow: Return Order

```
1. Verify order is delivered
   GET /api/orders/{orderId}

2. Submit return request
   POST /api/orders/{orderId}/return
   { reason, reasonCategory, description, items }

3. Wait for admin approval
```

### Admin Workflow: Manage Orders

```
1. List all orders with filters
   GET /api/admin/orders?status=Processing

2. Update order status
   PATCH /api/admin/orders/{orderId}/status
   { newStatus, changeReason, trackingNumber }

3. View analytics
   GET /api/admin/orders/analytics
```

### Admin Workflow: Handle Returns

```
1. List pending returns
   GET /api/admin/returns?status=Pending

2. View return details
   GET /api/admin/returns/{orderId}

3. Approve or reject return
   POST /api/admin/returns/{orderId}/review
   { decision, adminNotes, refundAmount }
```

---

**For complete integration examples and authentication flows, see the [Frontend Developer Guide](../Frontend-Developer-Guide.md)**
