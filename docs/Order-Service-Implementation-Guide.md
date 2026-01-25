# Order Management Service (ORMS) - Implementation Guide
## E-Commerce Customer Management System

**Document Version:** 1.0  
**Date:** January 25, 2026  
**Service Name:** Order Management Service (ORMS)  
**Technology:** Python + FastAPI  
**Port:** 8002  
**Client:** R-MAN Corporation, Bangalore  
**Prepared By:** Ramkumar

---

## 1. Service Overview

The Order Management Service (ORMS) is responsible for managing the complete order lifecycle in the E-Commerce Customer Management System. Built with Python FastAPI, it handles order creation, tracking, cancellation, returns, and administrative order management.

**Key Responsibilities:**
- Order creation and placement
- Order status management and tracking
- Order cancellation handling
- Return request management
- Order history and reporting
- Email notifications for order events
- Integration with Auth Service for customer validation

---

## 2. Database Schema

### 2.1 Database Name
`order_db`

### 2.2 Collections

#### 2.2.1 orders Collection

**Purpose:** Store order information and status

```javascript
{
  _id: ObjectId,
  orderId: String,                   // Unique order ID (e.g., "ORD-2026-001234")
  userId: String,                    // Reference to Auth Service user._id
  customerId: String,                // Reference to Customer Service customer._id
  customerEmail: String,             // Denormalized for quick access
  customerName: String,              // Denormalized for quick access
  deliveryAddress: {
    recipientName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  orderDate: Date,                   // Order placement date
  status: String,                    // Order status
  totalAmount: Number,               // Total order value
  itemCount: Number,                 // Total number of items
  cancellationReason: String,        // Reason for cancellation (nullable)
  cancelledBy: String,               // UserId who cancelled (nullable)
  cancelledAt: Date,                 // Cancellation timestamp (nullable)
  returnReason: String,              // Reason for return (nullable)
  returnRequestedBy: String,         // UserId who requested return (nullable)
  returnRequestedAt: Date,           // Return request timestamp (nullable)
  returnApproved: Boolean,           // Return approval status (nullable)
  returnApprovedBy: String,          // Admin userId who approved (nullable)
  returnApprovedAt: Date,            // Return approval timestamp (nullable)
  notes: String,                     // Admin notes
  metadata: {
    ipAddress: String,
    userAgent: String,
    platform: String
  },
  createdAt: Date,
  updatedAt: Date,
  updatedBy: String                  // Last updated by userId
}
```

**Status Values:**
- `Placed`: Order has been placed
- `Processing`: Order is being prepared
- `Shipped`: Order has been shipped
- `Delivered`: Order has been delivered
- `Cancelled`: Order has been cancelled
- `Return Requested`: Customer has requested a return
- `Returned`: Return has been completed

**Indexes:**
```javascript
// Unique index on orderId
db.orders.createIndex({ "orderId": 1 }, { unique: true })

// Index on userId for customer's order history
db.orders.createIndex({ "userId": 1 })

// Index on customerId
db.orders.createIndex({ "customerId": 1 })

// Index on status for filtering
db.orders.createIndex({ "status": 1 })

// Index on orderDate for chronological queries
db.orders.createIndex({ "orderDate": -1 })

// Compound index for customer orders by status
db.orders.createIndex({ "userId": 1, "status": 1 })

// Compound index for date range queries with status
db.orders.createIndex({ "orderDate": -1, "status": 1 })

// Text index for searching by orderId and customer info
db.orders.createIndex({ 
  "orderId": "text",
  "customerEmail": "text",
  "customerName": "text"
})
```

**Validation Rules:**
- `orderId`: Required, unique, format "ORD-YYYY-NNNNNN"
- `userId`: Required, must reference valid user in Auth Service
- `deliveryAddress`: Required object with all address fields
- `status`: Required, enum from status values above
- `totalAmount`: Required, number > 0
- `itemCount`: Required, number > 0

---

#### 2.2.2 order_items Collection

**Purpose:** Store individual items within each order

```javascript
{
  _id: ObjectId,
  orderId: ObjectId,                 // Reference to orders._id
  orderIdString: String,             // Denormalized order ID string
  productId: String,                 // Product identifier
  productName: String,               // Product name
  productDescription: String,        // Product description
  sku: String,                       // Stock Keeping Unit
  quantity: Number,                  // Quantity ordered
  unitPrice: Number,                 // Price per unit
  totalPrice: Number,                // quantity * unitPrice
  discount: Number,                  // Discount applied
  tax: Number,                       // Tax amount
  finalPrice: Number,                // totalPrice - discount + tax
  returnRequested: Boolean,          // Item included in return request
  returnQuantity: Number,            // Quantity to be returned
  returnReason: String,              // Specific return reason for item
  createdAt: Date
}
```

**Indexes:**
```javascript
// Index on orderId for fetching order items
db.order_items.createIndex({ "orderId": 1 })

// Index on productId for product-based queries
db.order_items.createIndex({ "productId": 1 })

// Index on returnRequested for return management
db.order_items.createIndex({ "returnRequested": 1 })
```

**Validation Rules:**
- `orderId`: Required, must reference valid order
- `productId`: Required
- `productName`: Required, 1-200 characters
- `quantity`: Required, number > 0
- `unitPrice`: Required, number > 0
- `totalPrice`: Required, calculated field

---

#### 2.2.3 order_history Collection

**Purpose:** Audit trail for order status changes

```javascript
{
  _id: ObjectId,
  orderId: ObjectId,                 // Reference to orders._id
  orderIdString: String,             // Denormalized order ID string
  previousStatus: String,            // Previous order status
  newStatus: String,                 // New order status
  changedBy: String,                 // UserId who made the change
  changedByRole: String,             // Role of user (Customer/Administrator)
  changedByName: String,             // Name of user (denormalized)
  notes: String,                     // Change notes/reason
  timestamp: Date,                   // When the change occurred
  metadata: {
    ipAddress: String,
    userAgent: String
  }
}
```

**Indexes:**
```javascript
// Index on orderId for order history lookup
db.order_history.createIndex({ "orderId": 1 })

// Index on timestamp for chronological queries
db.order_history.createIndex({ "timestamp": -1 })

// Compound index for order history chronologically
db.order_history.createIndex({ "orderId": 1, "timestamp": -1 })
```

---

#### 2.2.4 return_requests Collection

**Purpose:** Manage return requests and approvals

```javascript
{
  _id: ObjectId,
  orderId: ObjectId,                 // Reference to orders._id
  orderIdString: String,             // Denormalized order ID string
  userId: String,                    // Customer who requested return
  requestedBy: String,               // Customer name (denormalized)
  reason: String,                    // Return reason
  reasonCategory: String,            // Category (Damaged, Wrong Item, etc.)
  description: String,               // Detailed description
  items: [                           // Items to be returned
    {
      orderItemId: ObjectId,
      productId: String,
      productName: String,
      quantity: Number,
      returnReason: String
    }
  ],
  status: String,                    // Pending, Approved, Rejected, Completed
  requestedAt: Date,
  reviewedBy: String,                // Admin userId (nullable)
  reviewedByName: String,            // Admin name (nullable)
  reviewedAt: Date,                  // Review timestamp (nullable)
  approvalNotes: String,             // Admin notes on approval/rejection
  refundAmount: Number,              // Refund amount (nullable)
  refundStatus: String,              // Pending, Processed, Completed
  completedAt: Date,                 // Return completion date (nullable)
  createdAt: Date,
  updatedAt: Date
}
```

**Reason Categories:**
- `Damaged`: Product arrived damaged
- `Wrong Item`: Wrong product delivered
- `Defective`: Product is defective/not working
- `Not as Described`: Product doesn't match description
- `Quality Issues`: Poor quality
- `Changed Mind`: Customer changed their mind
- `Other`: Other reason

**Indexes:**
```javascript
// Index on orderId
db.return_requests.createIndex({ "orderId": 1 })

// Index on userId for customer's return requests
db.return_requests.createIndex({ "userId": 1 })

// Index on status for filtering
db.return_requests.createIndex({ "status": 1 })

// Index on requestedAt for chronological queries
db.return_requests.createIndex({ "requestedAt": -1 })
```

---

## 3. API Endpoints

### 3.1 Customer Endpoints

#### 3.1.1 Create Order
- **Endpoint:** `POST /api/orders`
- **Description:** Create a new order
- **Authentication:** JWT Access Token
- **Authorization:** Customer, Administrator

#### 3.1.2 Get My Orders
- **Endpoint:** `GET /api/orders/me`
- **Description:** Get authenticated customer's order history
- **Authentication:** JWT Access Token
- **Authorization:** Customer, Administrator

#### 3.1.3 Get Order by ID
- **Endpoint:** `GET /api/orders/{orderId}`
- **Description:** Get detailed order information
- **Authentication:** JWT Access Token
- **Authorization:** Customer (own orders), Administrator (all orders)

#### 3.1.4 Cancel Order
- **Endpoint:** `POST /api/orders/{orderId}/cancel`
- **Description:** Cancel an order (allowed in Placed/Processing status)
- **Authentication:** JWT Access Token
- **Authorization:** Customer (own orders), Administrator

#### 3.1.5 Request Return
- **Endpoint:** `POST /api/orders/{orderId}/return`
- **Description:** Request return for delivered order
- **Authentication:** JWT Access Token
- **Authorization:** Customer (own orders), Administrator

#### 3.1.6 Get Order History (Status Changes)
- **Endpoint:** `GET /api/orders/{orderId}/history`
- **Description:** Get order status change history
- **Authentication:** JWT Access Token
- **Authorization:** Customer (own orders), Administrator

### 3.2 Admin Endpoints

#### 3.2.1 List All Orders
- **Endpoint:** `GET /api/orders`
- **Description:** Get paginated list of all orders with filtering
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.2 Search Orders
- **Endpoint:** `GET /api/orders/search`
- **Description:** Search orders by order ID, customer name/email
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.3 Update Order
- **Endpoint:** `PUT /api/orders/{orderId}`
- **Description:** Update order details
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.4 Update Order Status
- **Endpoint:** `PATCH /api/orders/{orderId}/status`
- **Description:** Update order status (Processing, Shipped, Delivered, etc.)
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.5 Delete Order
- **Endpoint:** `DELETE /api/orders/{orderId}`
- **Description:** Permanently delete order
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.6 Get Return Requests
- **Endpoint:** `GET /api/orders/returns`
- **Description:** Get all return requests with filtering
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.7 Review Return Request
- **Endpoint:** `PATCH /api/orders/returns/{returnId}/review`
- **Description:** Approve or reject return request
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.8 Get Order Analytics
- **Endpoint:** `GET /api/orders/analytics`
- **Description:** Get order statistics and analytics
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

### 3.3 Internal Service Endpoints

#### 3.3.1 Get Orders by Customer
- **Endpoint:** `GET /api/orders/internal/customer/{customerId}`
- **Description:** Get orders for specific customer (for Customer Service)
- **Authentication:** Service API Key
- **Authorization:** Internal services only

#### 3.3.2 Get Order Count by Customer
- **Endpoint:** `GET /api/orders/internal/customer/{customerId}/count`
- **Description:** Get order count and total value for customer
- **Authentication:** Service API Key
- **Authorization:** Internal services only

---

## 4. Request and Response Structures

### 4.1 Create Order

**Request:**
```http
POST /api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "deliveryAddress": {
    "recipientName": "John Doe",
    "street": "123 Main Street, Apartment 4B",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipCode": "560001",
    "country": "India",
    "phone": "+919876543210"
  },
  "items": [
    {
      "productId": "PROD-001",
      "productName": "Wireless Headphones",
      "productDescription": "Premium noise-cancelling headphones",
      "sku": "WH-NC-001",
      "quantity": 2,
      "unitPrice": 2500.00,
      "discount": 250.00,
      "tax": 225.00
    },
    {
      "productId": "PROD-002",
      "productName": "USB-C Cable",
      "sku": "CABLE-USBC-01",
      "quantity": 1,
      "unitPrice": 500.00,
      "discount": 0.00,
      "tax": 45.00
    }
  ],
  "notes": "Please deliver between 10 AM - 2 PM"
}
```

**Validation Rules:**
- `deliveryAddress`: Required, all fields required
- `items`: Required, array with at least 1 item
- `items[].productId`: Required
- `items[].productName`: Required
- `items[].quantity`: Required, number > 0
- `items[].unitPrice`: Required, number > 0

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "orderId": "ORD-2026-001234",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "customerEmail": "john.doe@example.com",
    "customerName": "John Doe",
    "orderDate": "2026-01-25T14:30:00.000Z",
    "status": "Placed",
    "totalAmount": 5520.00,
    "itemCount": 3,
    "deliveryAddress": {
      "recipientName": "John Doe",
      "street": "123 Main Street, Apartment 4B",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipCode": "560001",
      "country": "India",
      "phone": "+919876543210"
    },
    "items": [
      {
        "itemId": "65a1b2c3d4e5f6g7h8i9j0k5",
        "productId": "PROD-001",
        "productName": "Wireless Headphones",
        "quantity": 2,
        "unitPrice": 2500.00,
        "totalPrice": 5000.00,
        "discount": 250.00,
        "tax": 225.00,
        "finalPrice": 4975.00
      },
      {
        "itemId": "65a1b2c3d4e5f6g7h8i9j0k6",
        "productId": "PROD-002",
        "productName": "USB-C Cable",
        "quantity": 1,
        "unitPrice": 500.00,
        "totalPrice": 500.00,
        "discount": 0.00,
        "tax": 45.00,
        "finalPrice": 545.00
      }
    ],
    "createdAt": "2026-01-25T14:30:00.000Z"
  }
}
```

**Note:** Upon successful order creation:
1. Email confirmation is sent to customer
2. Customer Service is notified to update customer statistics

---

### 4.2 Get My Orders

**Request:**
```http
GET /api/orders/me?page=1&limit=10&status=Delivered
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `status`: Filter by status (optional)
- `sortBy`: Sort field (orderDate, totalAmount)
- `sortOrder`: Sort direction (asc/desc)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "orderId": "ORD-2026-001234",
        "orderDate": "2026-01-25T14:30:00.000Z",
        "status": "Delivered",
        "totalAmount": 5520.00,
        "itemCount": 3,
        "deliveryAddress": {
          "city": "Bangalore",
          "state": "Karnataka"
        }
      },
      {
        "orderId": "ORD-2026-001100",
        "orderDate": "2026-01-15T10:00:00.000Z",
        "status": "Delivered",
        "totalAmount": 1200.00,
        "itemCount": 1,
        "deliveryAddress": {
          "city": "Bangalore",
          "state": "Karnataka"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

---

### 4.3 Get Order by ID

**Request:**
```http
GET /api/orders/ORD-2026-001234
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "orderId": "ORD-2026-001234",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "customerEmail": "john.doe@example.com",
    "customerName": "John Doe",
    "orderDate": "2026-01-25T14:30:00.000Z",
    "status": "Delivered",
    "totalAmount": 5520.00,
    "itemCount": 3,
    "deliveryAddress": {
      "recipientName": "John Doe",
      "street": "123 Main Street, Apartment 4B",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipCode": "560001",
      "country": "India",
      "phone": "+919876543210"
    },
    "items": [
      {
        "itemId": "65a1b2c3d4e5f6g7h8i9j0k5",
        "productId": "PROD-001",
        "productName": "Wireless Headphones",
        "productDescription": "Premium noise-cancelling headphones",
        "sku": "WH-NC-001",
        "quantity": 2,
        "unitPrice": 2500.00,
        "totalPrice": 5000.00,
        "discount": 250.00,
        "tax": 225.00,
        "finalPrice": 4975.00
      }
    ],
    "notes": "Please deliver between 10 AM - 2 PM",
    "createdAt": "2026-01-25T14:30:00.000Z",
    "updatedAt": "2026-01-27T10:00:00.000Z"
  }
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Access denied",
  "errors": [
    {
      "field": "authorization",
      "message": "You can only access your own orders"
    }
  ]
}
```

---

### 4.4 Cancel Order

**Request:**
```http
POST /api/orders/ORD-2026-001234/cancel
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "reason": "Changed my mind",
  "reasonCategory": "Customer Request"
}
```

**Validation Rules:**
- `reason`: Required, 10-500 characters
- Order must be in "Placed" or "Processing" status

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "orderId": "ORD-2026-001234",
    "status": "Cancelled",
    "cancellationReason": "Changed my mind",
    "cancelledBy": "65a1b2c3d4e5f6g7h8i9j0k1",
    "cancelledAt": "2026-01-25T15:00:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Cannot cancel order",
  "errors": [
    {
      "field": "status",
      "message": "Orders can only be cancelled in 'Placed' or 'Processing' status. Current status: Shipped"
    }
  ]
}
```

---

### 4.5 Request Return

**Request:**
```http
POST /api/orders/ORD-2026-001234/return
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "reason": "Product damaged during shipping",
  "reasonCategory": "Damaged",
  "description": "The packaging was torn and the headphones have scratches",
  "items": [
    {
      "orderItemId": "65a1b2c3d4e5f6g7h8i9j0k5",
      "quantity": 2,
      "returnReason": "Both units damaged"
    }
  ]
}
```

**Validation Rules:**
- Order must be in "Delivered" status
- `reason`: Required, 10-500 characters
- `reasonCategory`: Required, valid category
- `items`: Required, at least 1 item

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Return request submitted successfully",
  "data": {
    "returnId": "RET-2026-000123",
    "orderId": "ORD-2026-001234",
    "status": "Pending",
    "reason": "Product damaged during shipping",
    "reasonCategory": "Damaged",
    "items": [
      {
        "productName": "Wireless Headphones",
        "quantity": 2
      }
    ],
    "requestedAt": "2026-01-25T16:00:00.000Z"
  }
}
```

---

### 4.6 Update Order Status (Admin)

**Request:**
```http
PATCH /api/orders/ORD-2026-001234/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "Shipped",
  "notes": "Shipped via FedEx, tracking: 1234567890"
}
```

**Validation Rules:**
- `status`: Required, valid status value
- `notes`: Optional, max 500 characters

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "orderId": "ORD-2026-001234",
    "previousStatus": "Processing",
    "newStatus": "Shipped",
    "updatedBy": "65a1b2c3d4e5f6g7h8i9j0k9",
    "updatedAt": "2026-01-26T10:00:00.000Z"
  }
}
```

---

### 4.7 Review Return Request (Admin)

**Request:**
```http
PATCH /api/orders/returns/RET-2026-000123/review
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "decision": "approved",
  "approvalNotes": "Return approved. Refund to be processed.",
  "refundAmount": 4975.00
}
```

**Validation Rules:**
- `decision`: Required, enum ["approved", "rejected"]
- `approvalNotes`: Required, 10-500 characters
- `refundAmount`: Required if approved, number > 0

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Return request approved successfully",
  "data": {
    "returnId": "RET-2026-000123",
    "orderId": "ORD-2026-001234",
    "status": "Approved",
    "refundAmount": 4975.00,
    "reviewedBy": "65a1b2c3d4e5f6g7h8i9j0k9",
    "reviewedAt": "2026-01-26T11:00:00.000Z"
  }
}
```

---

## 5. Error Handling

### 5.1 Standard Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error message"
    }
  ]
}
```

### 5.2 HTTP Status Codes

| Status Code | Description | Use Case |
|-------------|-------------|----------|
| 200 | OK | Successful operations |
| 201 | Created | Order created successfully |
| 400 | Bad Request | Validation errors, business rule violations |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Accessing other customer's orders |
| 404 | Not Found | Order not found |
| 409 | Conflict | Duplicate order ID |
| 422 | Unprocessable Entity | Business logic validation failures |
| 500 | Internal Server Error | Server errors |
| 502 | Bad Gateway | Auth Service unavailable |

### 5.3 Common Error Messages

#### Business Logic Errors (400)
```json
{
  "success": false,
  "message": "Cannot cancel order",
  "errors": [
    {
      "field": "status",
      "message": "Orders can only be cancelled in 'Placed' or 'Processing' status"
    }
  ]
}

{
  "success": false,
  "message": "Cannot request return",
  "errors": [
    {
      "field": "status",
      "message": "Returns can only be requested for 'Delivered' orders"
    }
  ]
}
```

---

## 6. Technology Stack Details

### 6.1 Core Dependencies

```txt
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
motor==3.3.2
pydantic==2.5.3
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
httpx==0.26.0
python-dotenv==1.0.0
aiosmtplib==3.0.1
email-validator==2.1.0
jinja2==3.1.2
```

### 6.2 Environment Variables

```env
# Server Configuration
ENVIRONMENT=development
SERVICE_NAME=order-service
PORT=8002
API_VERSION=v1

# MongoDB Configuration
MONGODB_URI=mongodb://admin:password@localhost:27017/order_db?authSource=admin

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_ALGORITHM=HS256

# Service-to-Service Communication
AUTH_SERVICE_URL=http://localhost:3001
CUSTOMER_SERVICE_URL=http://localhost:8001
SERVICE_API_KEY=your_internal_service_api_key_change_this

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=orders@rman-ecommerce.com

# Order Configuration
ORDER_ID_PREFIX=ORD
RETURN_ID_PREFIX=RET
ORDER_CANCELLATION_ALLOWED_STATUSES=["Placed", "Processing"]
ORDER_RETURN_ALLOWED_STATUSES=["Delivered"]

# CORS Configuration
CORS_ORIGINS=["http://localhost:3000", "http://localhost:19006"]

# Logging
LOG_LEVEL=INFO
```

### 6.3 Project Structure

```
order-service/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config/
│   │   ├── settings.py
│   │   └── database.py
│   ├── models/
│   │   ├── order.py
│   │   ├── order_item.py
│   │   ├── order_history.py
│   │   └── return_request.py
│   ├── schemas/
│   │   ├── order.py
│   │   ├── order_item.py
│   │   └── return_request.py
│   ├── routers/
│   │   ├── order.py
│   │   ├── admin.py
│   │   └── internal.py
│   ├── services/
│   │   ├── order_service.py
│   │   ├── auth_client.py
│   │   ├── customer_client.py
│   │   └── email_service.py
│   ├── middleware/
│   │   ├── auth.py
│   │   └── error_handler.py
│   └── utils/
│       ├── logger.py
│       ├── validators.py
│       └── order_id_generator.py
├── templates/
│   ├── order_confirmation.html
│   ├── order_status_update.html
│   └── return_request.html
├── .env
├── requirements.txt
├── Dockerfile
└── README.md
```

---

## 7. Service Dependencies

### 7.1 External Services

| Service | Purpose | Endpoints Used |
|---------|---------|----------------|
| Auth Service | User validation | `POST /api/auth/validate-token`<br>`GET /api/auth/user/:userId` |
| Customer Service | Update statistics | `PATCH /api/customers/internal/:customerId/statistics` |
| Email Service | Order notifications | Gmail SMTP |

### 7.2 Service Communication Pattern

**Outbound Calls:**
- **To Auth Service**: Validate tokens, fetch customer info
- **To Customer Service**: Update order statistics
- **To Email Service**: Send order confirmations and status updates

**Inbound Calls:**
- **From Customer Service**: Fetch customer order history
- **From Complaint Service**: Get order details for complaint linking

---

## 8. Recommended Phased Implementation

### Phase 1: Setup & Database Models (Days 1-2)
- Set up FastAPI project
- Configure MongoDB with Motor
- Create all database models
- Create database indexes
- Test database connection

### Phase 2: Authentication & Integration (Days 3-4)
- Implement JWT middleware
- Create Auth Service client
- Create Customer Service client
- Test service communication

### Phase 3: Order Creation (Days 5-7)
- Implement POST /api/orders
- Generate unique order IDs
- Create order items
- Calculate totals
- Test order creation

### Phase 4: Order Retrieval & History (Days 8-9)
- Implement GET /api/orders/me
- Implement GET /api/orders/{orderId}
- Implement order filtering and pagination
- Test retrieval endpoints

### Phase 5: Order Cancellation (Days 10-11)
- Implement POST /api/orders/{orderId}/cancel
- Add cancellation business logic
- Create order history records
- Test cancellation flow

### Phase 6: Return Management (Days 12-14)
- Implement POST /api/orders/{orderId}/return
- Create return_requests collection logic
- Implement admin return review
- Test return workflow

### Phase 7: Admin Features (Days 15-17)
- Implement admin order listing
- Implement order search
- Implement status updates
- Implement order analytics
- Test admin features

### Phase 8: Email Integration (Days 18-19)
- Set up email service
- Create email templates
- Send order confirmations
- Send status update emails
- Test email flow

### Phase 9: Production Readiness (Days 20-22)
- Add comprehensive logging
- Performance optimization
- Security hardening
- API documentation
- End-to-end testing

---

## 9. Testing Checklist

- [ ] Order creation with items
- [ ] Order retrieval (own/all)
- [ ] Order cancellation (valid/invalid status)
- [ ] Return request submission
- [ ] Return approval/rejection
- [ ] Order status updates
- [ ] Order history tracking
- [ ] Email notifications
- [ ] Auth Service integration
- [ ] Customer Service integration

---

**End of Document**

**Prepared By:** Ramkumar  
**Client:** R-MAN Corporation, Bangalore  
**Service:** Order Management Service (ORMS)
