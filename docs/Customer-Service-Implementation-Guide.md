# Customer Management Service (CRMS) - Implementation Guide
## E-Commerce Customer Management System

**Document Version:** 1.0  
**Date:** January 25, 2026  
**Service Name:** Customer Management Service (CRMS)  
**Technology:** Python + FastAPI  
**Port:** 8001  
**Client:** R-MAN Corporation, Bangalore  
**Prepared By:** Ramkumar

---

## 1. Service Overview

The Customer Management Service (CRMS) is responsible for managing customer business data and relationships within the E-Commerce Customer Management System. Built with Python FastAPI, it provides comprehensive customer management capabilities for both customers and administrators.

**Key Responsibilities:**
- Customer profile management (business perspective)
- Customer search and filtering
- Customer activation/deactivation (Admin)
- Customer statistics and history
- Integration with Auth Service for user data
- Customer-related reporting

**Note:** User authentication and basic profile data are managed by the Auth Service. This service focuses on customer business data and relationships.

---

## 2. Database Schema

### 2.1 Database Name
`customer_db`

### 2.2 Collections

#### 2.2.1 customers Collection

**Purpose:** Store customer business data, statistics, and relationship information

```javascript
{
  _id: ObjectId,
  userId: String,                    // Reference to Auth Service user._id
  email: String,                     // Denormalized from Auth Service
  fullName: String,                  // Denormalized from Auth Service
  contactNumber: String,             // Denormalized from Auth Service
  customerStatus: String,            // "Active", "Inactive", "Suspended"
  customerType: String,              // "Regular", "Premium", "VIP"
  totalOrders: Number,               // Total number of orders placed
  totalOrderValue: Number,           // Total monetary value of all orders
  totalComplaints: Number,           // Total number of complaints raised
  openComplaints: Number,            // Number of open/unresolved complaints
  lastOrderDate: Date,               // Date of most recent order
  lastComplaintDate: Date,           // Date of most recent complaint
  customerSince: Date,               // Registration date
  notes: String,                     // Admin notes about customer
  tags: [String],                    // Customer tags/categories
  preferences: {
    newsletter: Boolean,
    notifications: Boolean,
    language: String
  },
  metadata: {
    lastLoginDate: Date,
    loginCount: Number,
    lastActivityDate: Date
  },
  createdAt: Date,
  updatedAt: Date,
  createdBy: String,                 // Admin userId who created (if applicable)
  updatedBy: String                  // Admin userId who last updated
}
```

**Indexes:**
```javascript
// Unique index on userId
db.customers.createIndex({ "userId": 1 }, { unique: true })

// Index on email for quick lookup
db.customers.createIndex({ "email": 1 })

// Index on customerStatus for filtering
db.customers.createIndex({ "customerStatus": 1 })

// Index on customerType for filtering
db.customers.createIndex({ "customerType": 1 })

// Compound index for active customers
db.customers.createIndex({ "customerStatus": 1, "customerType": 1 })

// Text index for searching by name and email
db.customers.createIndex({ 
  "fullName": "text", 
  "email": "text",
  "contactNumber": "text"
})

// Index on lastOrderDate for sorting
db.customers.createIndex({ "lastOrderDate": -1 })

// Index on totalOrderValue for high-value customer queries
db.customers.createIndex({ "totalOrderValue": -1 })

// Index on createdAt for chronological queries
db.customers.createIndex({ "createdAt": -1 })
```

**Validation Rules:**
- `userId`: Required, unique, must reference valid user in Auth Service
- `email`: Required, valid email format, denormalized
- `fullName`: Required, 2-100 characters
- `customerStatus`: Required, enum ["Active", "Inactive", "Suspended"], default "Active"
- `customerType`: Required, enum ["Regular", "Premium", "VIP"], default "Regular"
- `totalOrders`: Required, number >= 0, default 0
- `totalOrderValue`: Required, number >= 0, default 0.0
- `totalComplaints`: Required, number >= 0, default 0
- `openComplaints`: Required, number >= 0, default 0

---

## 3. API Endpoints

### 3.1 Customer Endpoints (Customer Role)

#### 3.1.1 Get Own Customer Profile
- **Endpoint:** `GET /api/customers/me`
- **Description:** Get authenticated customer's own profile and statistics
- **Authentication:** JWT Access Token
- **Authorization:** Customer, Administrator

#### 3.1.2 Get Customer Statistics
- **Endpoint:** `GET /api/customers/me/statistics`
- **Description:** Get customer's order and complaint statistics
- **Authentication:** JWT Access Token
- **Authorization:** Customer, Administrator

### 3.2 Admin Endpoints (Administrator Role)

#### 3.2.1 List All Customers
- **Endpoint:** `GET /api/customers`
- **Description:** Get paginated list of all customers with filtering
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.2 Search Customers
- **Endpoint:** `GET /api/customers/search`
- **Description:** Search customers by name, email, or contact number
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.3 Get Customer by ID
- **Endpoint:** `GET /api/customers/{customerId}`
- **Description:** Get detailed customer information by ID
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.4 Update Customer
- **Endpoint:** `PUT /api/customers/{customerId}`
- **Description:** Update customer information and settings
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.5 Update Customer Status
- **Endpoint:** `PATCH /api/customers/{customerId}/status`
- **Description:** Activate, deactivate, or suspend customer account
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.6 Update Customer Type
- **Endpoint:** `PATCH /api/customers/{customerId}/type`
- **Description:** Change customer type (Regular/Premium/VIP)
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.7 Delete Customer
- **Endpoint:** `DELETE /api/customers/{customerId}`
- **Description:** Permanently delete customer record
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.8 Get Customer Order History
- **Endpoint:** `GET /api/customers/{customerId}/orders`
- **Description:** Get customer's complete order history
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.9 Get Customer Complaint History
- **Endpoint:** `GET /api/customers/{customerId}/complaints`
- **Description:** Get customer's complaint history
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.10 Add Customer Notes
- **Endpoint:** `POST /api/customers/{customerId}/notes`
- **Description:** Add administrative notes to customer profile
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.11 Get Customer Analytics
- **Endpoint:** `GET /api/customers/analytics`
- **Description:** Get overall customer analytics and metrics
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

### 3.3 Internal Service Endpoints

#### 3.3.1 Create Customer Record
- **Endpoint:** `POST /api/customers/internal/create`
- **Description:** Create customer record when user registers (called by Auth Service)
- **Authentication:** Service API Key
- **Authorization:** Internal services only

#### 3.3.2 Update Customer Statistics
- **Endpoint:** `PATCH /api/customers/internal/{customerId}/statistics`
- **Description:** Update customer statistics (orders, complaints counts)
- **Authentication:** Service API Key
- **Authorization:** Internal services only

#### 3.3.3 Get Customer by User ID
- **Endpoint:** `GET /api/customers/internal/user/{userId}`
- **Description:** Get customer by Auth Service user ID
- **Authentication:** Service API Key
- **Authorization:** Internal services only

---

## 4. Request and Response Structures

### 4.1 Get Own Customer Profile

**Request:**
```http
GET /api/customers/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer profile retrieved successfully",
  "data": {
    "customerId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k0",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "contactNumber": "+919876543210",
    "customerStatus": "Active",
    "customerType": "Premium",
    "totalOrders": 15,
    "totalOrderValue": 45500.00,
    "totalComplaints": 2,
    "openComplaints": 0,
    "lastOrderDate": "2026-01-20T14:30:00.000Z",
    "customerSince": "2025-06-15T10:00:00.000Z",
    "preferences": {
      "newsletter": true,
      "notifications": true,
      "language": "en"
    },
    "createdAt": "2025-06-15T10:00:00.000Z",
    "updatedAt": "2026-01-20T14:30:00.000Z"
  }
}
```

---

### 4.2 List All Customers (Admin)

**Request:**
```http
GET /api/customers?page=1&limit=20&status=Active&type=Premium&sortBy=totalOrderValue&sortOrder=desc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `status`: Filter by customerStatus (Active/Inactive/Suspended)
- `type`: Filter by customerType (Regular/Premium/VIP)
- `sortBy`: Sort field (totalOrders, totalOrderValue, lastOrderDate, createdAt)
- `sortOrder`: Sort direction (asc/desc)
- `searchTerm`: Search in name, email, contact (optional)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": {
    "customers": [
      {
        "customerId": "65a1b2c3d4e5f6g7h8i9j0k1",
        "userId": "65a1b2c3d4e5f6g7h8i9j0k0",
        "email": "john.doe@example.com",
        "fullName": "John Doe",
        "contactNumber": "+919876543210",
        "customerStatus": "Active",
        "customerType": "Premium",
        "totalOrders": 15,
        "totalOrderValue": 45500.00,
        "totalComplaints": 2,
        "openComplaints": 0,
        "lastOrderDate": "2026-01-20T14:30:00.000Z",
        "customerSince": "2025-06-15T10:00:00.000Z"
      },
      {
        "customerId": "65a1b2c3d4e5f6g7h8i9j0k2",
        "userId": "65a1b2c3d4e5f6g7h8i9j0k3",
        "email": "jane.smith@example.com",
        "fullName": "Jane Smith",
        "contactNumber": "+919876543211",
        "customerStatus": "Active",
        "customerType": "VIP",
        "totalOrders": 28,
        "totalOrderValue": 89200.00,
        "totalComplaints": 1,
        "openComplaints": 0,
        "lastOrderDate": "2026-01-24T09:15:00.000Z",
        "customerSince": "2025-03-10T12:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 95,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

---

### 4.3 Search Customers (Admin)

**Request:**
```http
GET /api/customers/search?q=john&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `q`: Search query (searches in name, email, contact number)
- `limit`: Maximum results (default: 20, max: 50)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "results": [
      {
        "customerId": "65a1b2c3d4e5f6g7h8i9j0k1",
        "email": "john.doe@example.com",
        "fullName": "John Doe",
        "contactNumber": "+919876543210",
        "customerStatus": "Active",
        "customerType": "Premium",
        "totalOrders": 15
      }
    ],
    "totalResults": 1,
    "searchTerm": "john"
  }
}
```

---

### 4.4 Get Customer by ID (Admin)

**Request:**
```http
GET /api/customers/65a1b2c3d4e5f6g7h8i9j0k1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer retrieved successfully",
  "data": {
    "customerId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k0",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "contactNumber": "+919876543210",
    "customerStatus": "Active",
    "customerType": "Premium",
    "totalOrders": 15,
    "totalOrderValue": 45500.00,
    "totalComplaints": 2,
    "openComplaints": 0,
    "lastOrderDate": "2026-01-20T14:30:00.000Z",
    "lastComplaintDate": "2025-12-05T11:20:00.000Z",
    "customerSince": "2025-06-15T10:00:00.000Z",
    "notes": "Premium customer, prefers express delivery",
    "tags": ["high-value", "responsive"],
    "preferences": {
      "newsletter": true,
      "notifications": true,
      "language": "en"
    },
    "metadata": {
      "lastLoginDate": "2026-01-25T08:00:00.000Z",
      "loginCount": 142,
      "lastActivityDate": "2026-01-25T09:30:00.000Z"
    },
    "createdAt": "2025-06-15T10:00:00.000Z",
    "updatedAt": "2026-01-20T14:30:00.000Z",
    "updatedBy": "65a1b2c3d4e5f6g7h8i9j0k9"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Customer not found",
  "errors": [
    {
      "field": "customerId",
      "message": "No customer exists with the provided ID"
    }
  ]
}
```

---

### 4.5 Update Customer (Admin)

**Request:**
```http
PUT /api/customers/65a1b2c3d4e5f6g7h8i9j0k1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "customerType": "VIP",
  "notes": "Upgraded to VIP due to high order value",
  "tags": ["high-value", "responsive", "loyal"],
  "preferences": {
    "newsletter": true,
    "notifications": true,
    "language": "en"
  }
}
```

**Validation Rules:**
- `customerType`: Optional, enum ["Regular", "Premium", "VIP"]
- `notes`: Optional, max 1000 characters
- `tags`: Optional, array of strings
- `preferences`: Optional object

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "customerId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "customerType": "VIP",
    "notes": "Upgraded to VIP due to high order value",
    "tags": ["high-value", "responsive", "loyal"],
    "updatedAt": "2026-01-25T10:45:00.000Z",
    "updatedBy": "65a1b2c3d4e5f6g7h8i9j0k9"
  }
}
```

---

### 4.6 Update Customer Status (Admin)

**Request:**
```http
PATCH /api/customers/65a1b2c3d4e5f6g7h8i9j0k1/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "Suspended",
  "reason": "Multiple payment disputes"
}
```

**Validation Rules:**
- `status`: Required, enum ["Active", "Inactive", "Suspended"]
- `reason`: Optional, max 500 characters (recommended for Suspended status)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer status updated successfully",
  "data": {
    "customerId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "customerStatus": "Suspended",
    "updatedAt": "2026-01-25T11:00:00.000Z",
    "updatedBy": "65a1b2c3d4e5f6g7h8i9j0k9"
  }
}
```

**Note:** When customer status is changed to "Inactive" or "Suspended", the system should also update the user's `isActive` status in the Auth Service.

---

### 4.7 Delete Customer (Admin)

**Request:**
```http
DELETE /api/customers/65a1b2c3d4e5f6g7h8i9j0k1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer deleted successfully",
  "data": {
    "customerId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "deletedAt": "2026-01-25T11:15:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Cannot delete customer with active orders or complaints",
  "errors": [
    {
      "field": "customer",
      "message": "Customer has 3 active orders and 1 open complaint. Please resolve these first."
    }
  ]
}
```

---

### 4.8 Get Customer Order History (Admin)

**Request:**
```http
GET /api/customers/65a1b2c3d4e5f6g7h8i9j0k1/orders?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer order history retrieved successfully",
  "data": {
    "customerId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "orders": [
      {
        "orderId": "ORD-2026-001234",
        "orderDate": "2026-01-20T14:30:00.000Z",
        "status": "Delivered",
        "totalAmount": 3500.00,
        "itemCount": 3
      },
      {
        "orderId": "ORD-2026-001100",
        "orderDate": "2026-01-10T09:15:00.000Z",
        "status": "Delivered",
        "totalAmount": 1200.00,
        "itemCount": 1
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15
    }
  }
}
```

**Note:** This endpoint calls Order Service internally to fetch order data.

---

### 4.9 Create Customer Record (Internal)

**Request:**
```http
POST /api/customers/internal/create
X-Service-API-Key: your_internal_service_api_key
Content-Type: application/json

{
  "userId": "65a1b2c3d4e5f6g7h8i9j0k0",
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "contactNumber": "+919876543210"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Customer record created successfully",
  "data": {
    "customerId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k0",
    "customerStatus": "Active",
    "customerType": "Regular",
    "createdAt": "2026-01-25T12:00:00.000Z"
  }
}
```

---

### 4.10 Update Customer Statistics (Internal)

**Request:**
```http
PATCH /api/customers/internal/65a1b2c3d4e5f6g7h8i9j0k1/statistics
X-Service-API-Key: your_internal_service_api_key
Content-Type: application/json

{
  "totalOrders": 16,
  "totalOrderValue": 49000.00,
  "lastOrderDate": "2026-01-25T13:00:00.000Z"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer statistics updated successfully",
  "data": {
    "customerId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "totalOrders": 16,
    "totalOrderValue": 49000.00,
    "lastOrderDate": "2026-01-25T13:00:00.000Z",
    "updatedAt": "2026-01-25T13:00:30.000Z"
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
| 200 | OK | Successful GET, PUT, PATCH operations |
| 201 | Created | Successful customer record creation |
| 400 | Bad Request | Validation errors, business rule violations |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions (non-admin accessing admin endpoints) |
| 404 | Not Found | Customer not found |
| 409 | Conflict | Customer record already exists |
| 500 | Internal Server Error | Server errors, database errors |
| 502 | Bad Gateway | Auth Service or Order Service unavailable |
| 503 | Service Unavailable | Database connection issues |

### 5.3 Common Error Messages

#### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "customerType",
      "message": "Customer type must be one of: Regular, Premium, VIP"
    },
    {
      "field": "status",
      "message": "Invalid status value"
    }
  ]
}
```

#### Authorization Errors (403)
```json
{
  "success": false,
  "message": "Access denied",
  "errors": [
    {
      "field": "authorization",
      "message": "This operation requires administrator privileges"
    }
  ]
}
```

#### Business Logic Errors (400)
```json
{
  "success": false,
  "message": "Cannot delete customer with active data",
  "errors": [
    {
      "field": "customer",
      "message": "Customer has 5 active orders. Please complete or cancel them first."
    }
  ]
}
```

#### Service Communication Errors (502)
```json
{
  "success": false,
  "message": "Unable to fetch user data",
  "errors": [
    {
      "field": "service",
      "message": "Auth Service is currently unavailable. Please try again later."
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
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
httpx==0.26.0
python-dotenv==1.0.0
```

### 6.2 Technology Descriptions

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Programming language |
| FastAPI | 0.109+ | Modern web framework for building APIs |
| Uvicorn | 0.27+ | ASGI server for running FastAPI |
| Motor | 3.3+ | Async MongoDB driver for Python |
| Pydantic | 2.5+ | Data validation using Python type annotations |
| python-jose | 3.3+ | JWT token validation |
| httpx | 0.26+ | Async HTTP client for service communication |
| python-dotenv | 1.0+ | Environment variable management |

### 6.3 Environment Variables

Create a `.env` file in the service root:

```env
# Server Configuration
ENVIRONMENT=development
SERVICE_NAME=customer-service
SERVICE_VERSION=1.0.0
PORT=8001
API_VERSION=v1

# MongoDB Configuration
MONGODB_URI=mongodb://admin:password@localhost:27017/customer_db?authSource=admin
MONGODB_TEST_URI=mongodb://admin:password@localhost:27017/customer_db_test?authSource=admin
MONGODB_MIN_POOL_SIZE=10
MONGODB_MAX_POOL_SIZE=50

# JWT Configuration (for token validation)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_ALGORITHM=HS256

# Service-to-Service Communication
AUTH_SERVICE_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:8002
COMPLAINT_SERVICE_URL=http://localhost:8003
SERVICE_API_KEY=your_internal_service_api_key_change_this
SERVICE_TIMEOUT=30

# CORS Configuration
CORS_ORIGINS=["http://localhost:3000", "http://localhost:19006"]
CORS_CREDENTIALS=true

# Pagination
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Cache (Future Enhancement)
REDIS_URL=redis://localhost:6379/0
CACHE_TTL=300
```

### 6.4 Project Structure

```
customer-service/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application entry point
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py            # Environment configuration
│   │   └── database.py            # MongoDB connection
│   ├── models/
│   │   ├── __init__.py
│   │   └── customer.py            # Customer model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── customer.py            # Pydantic schemas
│   │   └── response.py            # Response schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── customer.py            # Customer routes
│   │   ├── admin.py               # Admin routes
│   │   └── internal.py            # Internal service routes
│   ├── services/
│   │   ├── __init__.py
│   │   ├── customer_service.py    # Business logic
│   │   ├── auth_client.py         # Auth Service client
│   │   └── order_client.py        # Order Service client
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth.py                # JWT authentication
│   │   ├── role.py                # Role-based authorization
│   │   └── error_handler.py       # Error handling
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── logger.py              # Logging utility
│   │   ├── validators.py          # Custom validators
│   │   └── pagination.py          # Pagination helper
│   └── dependencies/
│       ├── __init__.py
│       ├── auth.py                # Auth dependencies
│       └── database.py            # Database dependencies
├── tests/
│   ├── __init__.py
│   ├── test_customer.py
│   └── test_admin.py
├── .env
├── .env.example
├── .gitignore
├── requirements.txt
├── Dockerfile
└── README.md
```

---

## 7. Service Dependencies

### 7.1 External Services

| Service | Purpose | Endpoints Used |
|---------|---------|----------------|
| MongoDB | Database | `mongodb://localhost:27017/customer_db` |
| Auth Service | User validation and profile data | `POST /api/auth/validate-token`<br>`GET /api/auth/user/:userId` |
| Order Service | Customer order history | `GET /api/orders?customerId={id}` |
| Complaint Service | Customer complaint history | `GET /api/complaints?customerId={id}` |

### 7.2 Consumed by Services

- **Order Service**: Fetch customer information when creating orders
- **Complaint Service**: Fetch customer information when creating complaints
- **Web Application**: Customer management and display
- **Mobile Application**: Customer profile display

### 7.3 Service Communication Pattern

**Outbound Calls:**
- **To Auth Service**: Validate JWT tokens, fetch user profile data
- **To Order Service**: Fetch customer order history (admin view)
- **To Complaint Service**: Fetch customer complaint history (admin view)

**Inbound Calls:**
- **From Auth Service**: Create customer record after user registration
- **From Order Service**: Update customer statistics (order count, total value)
- **From Complaint Service**: Update customer statistics (complaint count)

---

## 8. Recommended Phased Implementation

### Phase 1: Setup & Database Models (Days 1-2)

**Objectives:**
- Set up FastAPI project structure
- Configure MongoDB connection with Motor
- Create Customer model with Pydantic schemas
- Set up environment configuration

**Tasks:**
1. Initialize Python project with virtual environment
2. Install FastAPI and core dependencies
3. Create project folder structure
4. Set up MongoDB connection with Motor (async)
5. Create Customer model and Pydantic schemas
6. Configure environment variables (.env)
7. Set up basic FastAPI application
8. Create database indexes
9. Test database connection

**Deliverables:**
- ✅ Working MongoDB connection
- ✅ Customer model with validation
- ✅ Database indexes created
- ✅ FastAPI server running on port 8001

---

### Phase 2: Authentication & Authorization (Days 3-4)

**Objectives:**
- Implement JWT token validation middleware
- Implement role-based authorization
- Set up Auth Service client for user validation

**Tasks:**
1. Create JWT validation middleware
2. Implement role-based authorization dependency
3. Create Auth Service HTTP client with httpx
4. Implement token validation using Auth Service
5. Create authentication dependencies
6. Test authentication flow
7. Add error handling for auth failures

**Deliverables:**
- ✅ JWT middleware working
- ✅ Role-based authorization implemented
- ✅ Auth Service integration functional
- ✅ Protected routes configured

---

### Phase 3: Customer Profile APIs (Days 5-7)

**Objectives:**
- Implement customer profile retrieval
- Implement customer statistics endpoint
- Test customer-facing endpoints

**Tasks:**
1. Create GET /api/customers/me endpoint
2. Create GET /api/customers/me/statistics endpoint
3. Implement customer service business logic
4. Add response formatting utilities
5. Add pagination helpers
6. Test customer endpoints
7. Add comprehensive error handling

**Deliverables:**
- ✅ GET /api/customers/me
- ✅ GET /api/customers/me/statistics
- ✅ Error handling implemented
- ✅ Tests passing

---

### Phase 4: Admin Customer Management (Days 8-11)

**Objectives:**
- Implement admin customer listing and search
- Implement customer CRUD operations
- Implement customer status management

**Tasks:**
1. Create GET /api/customers endpoint with filtering
2. Create GET /api/customers/search endpoint
3. Create GET /api/customers/{customerId} endpoint
4. Create PUT /api/customers/{customerId} endpoint
5. Create PATCH /api/customers/{customerId}/status endpoint
6. Create PATCH /api/customers/{customerId}/type endpoint
7. Create DELETE /api/customers/{customerId} endpoint
8. Implement text search functionality
9. Add pagination to list endpoints
10. Implement sorting and filtering
11. Test all admin endpoints

**Deliverables:**
- ✅ All admin CRUD endpoints functional
- ✅ Search and filtering working
- ✅ Pagination implemented
- ✅ Authorization checks in place

---

### Phase 5: Integration with Order & Complaint Services (Days 12-13)

**Objectives:**
- Integrate with Order Service for order history
- Integrate with Complaint Service for complaint history
- Implement cross-service data fetching

**Tasks:**
1. Create Order Service HTTP client
2. Create Complaint Service HTTP client
3. Implement GET /api/customers/{customerId}/orders endpoint
4. Implement GET /api/customers/{customerId}/complaints endpoint
5. Add error handling for service communication failures
6. Implement retry logic with exponential backoff
7. Test cross-service integration
8. Handle service unavailability gracefully

**Deliverables:**
- ✅ Order history endpoint working
- ✅ Complaint history endpoint working
- ✅ Service communication resilient
- ✅ Error handling for external service failures

---

### Phase 6: Internal Service Endpoints (Days 14-15)

**Objectives:**
- Create internal endpoints for service communication
- Implement customer statistics updates
- Enable Auth Service to create customer records

**Tasks:**
1. Create service API key authentication
2. Implement POST /api/customers/internal/create endpoint
3. Implement PATCH /api/customers/internal/{customerId}/statistics endpoint
4. Implement GET /api/customers/internal/user/{userId} endpoint
5. Add internal service middleware
6. Test internal endpoints
7. Document internal API usage

**Deliverables:**
- ✅ POST /api/customers/internal/create
- ✅ PATCH /api/customers/internal/{customerId}/statistics
- ✅ GET /api/customers/internal/user/{userId}
- ✅ Service API key authentication
- ✅ Internal API documentation

---

### Phase 7: Analytics & Reporting (Days 16-17)

**Objectives:**
- Implement customer analytics endpoint
- Add customer notes functionality
- Implement advanced queries

**Tasks:**
1. Create GET /api/customers/analytics endpoint
2. Implement POST /api/customers/{customerId}/notes endpoint
3. Calculate customer metrics (total customers, by type, by status)
4. Add aggregation queries for analytics
5. Optimize database queries
6. Add caching for analytics (optional)
7. Test analytics endpoints

**Deliverables:**
- ✅ GET /api/customers/analytics
- ✅ POST /api/customers/{customerId}/notes
- ✅ Analytics data accurate
- ✅ Performance optimized

---

### Phase 8: Production Readiness (Days 18-20)

**Objectives:**
- Add comprehensive logging
- Implement monitoring
- Performance optimization
- Security hardening

**Tasks:**
1. Implement structured logging
2. Add request/response logging
3. Add performance monitoring
4. Optimize database queries with indexes
5. Add input sanitization
6. Security audit
7. Load testing
8. Create API documentation (Swagger/OpenAPI)
9. Write deployment guide
10. Final end-to-end testing

**Deliverables:**
- ✅ Comprehensive logging implemented
- ✅ Performance optimized
- ✅ Security hardened
- ✅ API documentation complete
- ✅ Deployment-ready service

---

## 9. Testing Checklist

### 9.1 Unit Tests
- [ ] Customer model validation
- [ ] Pydantic schema validation
- [ ] Business logic functions
- [ ] Utility functions
- [ ] Pagination logic

### 9.2 Integration Tests
- [ ] Customer profile retrieval
- [ ] Admin customer listing with filters
- [ ] Customer search functionality
- [ ] Customer update operations
- [ ] Customer status updates
- [ ] Customer deletion
- [ ] Auth Service integration
- [ ] Order Service integration
- [ ] Internal service endpoints

### 9.3 Performance Tests
- [ ] List customers with large dataset
- [ ] Search performance
- [ ] Database query optimization
- [ ] Concurrent request handling

---

## 10. Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB indexes created
- [ ] Service-to-service authentication configured
- [ ] CORS settings properly configured
- [ ] Logging configured
- [ ] Error handling tested
- [ ] API documentation completed
- [ ] Docker image built and tested
- [ ] Health check endpoint implemented
- [ ] Database connection pooling configured

---

## 11. API Documentation

FastAPI automatically generates interactive API documentation.

**Access documentation at:**
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`
- OpenAPI Schema: `http://localhost:8001/openapi.json`

---

**End of Document**

**Next Steps:**
- Review and approve implementation guide
- Begin Phase 1 implementation
- Set up development environment
- Create repository and initial commit

---

**Prepared By:** Ramkumar  
**Client:** R-MAN Corporation, Bangalore  
**Service:** Customer Management Service (CRMS)
