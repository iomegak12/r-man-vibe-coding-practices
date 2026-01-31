# Frontend Developer Guide
## E-Commerce Customer Management System

**Version:** 1.0  
**Last Updated:** January 28, 2026

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Environment Setup](#3-environment-setup)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Complete User Journeys](#6-complete-user-journeys)
7. [Error Handling](#7-error-handling)
8. [Common Patterns](#8-common-patterns)
9. [API References](#9-api-references)

---

## 1. System Overview

This e-commerce platform consists of four microservices that work together to provide a complete customer management, order processing, and complaint resolution system.

### Key Features

- **Customer Management**: Registration, authentication, profile management
- **Order Management**: Order placement, tracking, cancellation, and returns
- **Complaint Management**: Issue reporting, tracking, and resolution
- **Admin Dashboard**: Comprehensive administrative controls

### Technology Stack

- **Backend**: Node.js (ATHS), Python/FastAPI (CRMS, ORMS, CMPS)
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **API Style**: RESTful APIs

---

## 2. Architecture

### Microservices

| Service | Port | Purpose | Technology |
|---------|------|---------|------------|
| **ATHS** - Authentication Service | 5001 | User authentication, authorization, user management | Node.js + Express |
| **CRMS** - Customer Management Service | 5002 | Customer profiles, statistics, admin operations | Python + FastAPI |
| **ORMS** - Order Management Service | 5003 | Order creation, tracking, cancellation, returns | Python + FastAPI |
| **CMPS** - Complaint Management Service | 5004 | Complaint registration, tracking, resolution | Python + FastAPI |

### Service Communication

```
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │
       ├──────────────────┬──────────────────┬──────────────────┐
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│   ATHS   │◄─────┤   CRMS   │◄─────┤   ORMS   │◄─────┤   CMPS   │
│  :5001   │      │  :5002   │      │  :5003   │      │  :5004   │
└──────────┘      └──────────┘      └──────────┘      └──────────┘
     │                  │                  │                  │
     └──────────────────┴──────────────────┴──────────────────┘
                            │
                            ▼
                     ┌──────────┐
                     │ MongoDB  │
                     └──────────┘
```

---

## 3. Environment Setup

### Base URLs

**Development:**
```
ATHS_BASE_URL=http://localhost:5001
CRMS_BASE_URL=http://localhost:5002
ORMS_BASE_URL=http://localhost:5003
CMPS_BASE_URL=http://localhost:5004
```

**Production:**
```
ATHS_BASE_URL=https://api.yourdomain.com/auth
CRMS_BASE_URL=https://api.yourdomain.com/customers
ORMS_BASE_URL=https://api.yourdomain.com/orders
CMPS_BASE_URL=https://api.yourdomain.com/complaints
```

### Required Headers

All authenticated requests must include:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 4. Authentication & Authorization

### Authentication Flow

#### 1. User Registration
```
POST /api/auth/register (ATHS)
↓
Receive: { accessToken, refreshToken, user }
↓
Store tokens in secure storage (localStorage/sessionStorage)
↓
Automatically synced to CRMS (customer profile created)
```

#### 2. User Login
```
POST /api/auth/login (ATHS)
↓
Receive: { accessToken, refreshToken, user }
↓
Store tokens securely
↓
Use accessToken for all authenticated requests
```

#### 3. Token Management

**Access Token:**
- Validity: 30 minutes
- Used for all API requests
- Include in `Authorization: Bearer <token>` header

**Refresh Token:**
- Validity: 7 days
- Used to obtain new access token when expired
- Store securely, never expose in URLs

**Token Refresh Flow:**
```javascript
// When API returns 401 Unauthorized
if (response.status === 401) {
  // Call refresh endpoint
  const newTokens = await POST /api/auth/refresh-token
  // Update stored tokens
  // Retry original request with new token
}
```

### Authorization Levels

| User Type | JWT Claim `role` | Access Level |
|-----------|------------------|--------------|
| **Customer** | `"Customer"` | Own data only |
| **Administrator** | `"Administrator"` | All data |

---

## 5. User Roles & Permissions

### Customer Permissions

| Feature | Allowed Actions |
|---------|----------------|
| **Profile** | View, Update, Delete own profile |
| **Orders** | Create, View own orders, Cancel (if Placed/Processing), Request returns |
| **Complaints** | Create, View own complaints, Add comments |
| **Admin Features** | ❌ No access |

### Administrator Permissions

| Feature | Allowed Actions |
|---------|----------------|
| **Profile** | View, Update own profile |
| **Customers** | View all, Search, Update, Deactivate, Delete, Add notes |
| **Orders** | View all, Search, Filter, Update status |
| **Complaints** | View all, Search, Filter, Update status, Assign, Resolve |

---

## 6. Complete User Journeys

### Journey 1: New Customer Registration & First Order

```
Step 1: Register Account
POST /api/auth/register (ATHS)
{
  "email": "customer@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "contactNumber": "+919876543210"
}
Response: { accessToken, refreshToken, user }

↓

Step 2: Get Customer Profile (Auto-created)
GET /api/customers/me (CRMS)
Headers: Authorization: Bearer <token>
Response: { customerId, email, fullName, customerStatus, ... }

↓

Step 3: Create Order
POST /api/orders (ORMS)
Headers: Authorization: Bearer <token>
{
  "items": [
    {
      "productId": "PROD001",
      "productName": "Product Name",
      "sku": "SKU001",
      "quantity": 2,
      "unitPrice": 499.99,
      "discount": 0,
      "tax": 50.00,
      "productDescription": "Product description"
    }
  ],
  "deliveryAddress": {
    "recipientName": "John Doe",
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "phone": "+919876543210"
  },
  "paymentMethod": "Credit Card",
  "notes": "Please deliver in the morning"
}
Response: { orderId, status: "Placed", totalAmount, ... }

↓

Step 4: Track Order
GET /api/orders/{orderId} (ORMS)
Headers: Authorization: Bearer <token>
Response: { orderId, status, estimatedDeliveryDate, ... }
```

### Journey 2: Filing a Complaint

```
Step 1: Get Order Details (to file complaint against order)
GET /api/orders/{orderId} (ORMS)
Headers: Authorization: Bearer <token>

↓

Step 2: Create Complaint
POST /api/complaints (CMPS)
Headers: Authorization: Bearer <token>
{
  "orderId": "ORD-2026-000001",
  "category": "Product Quality",
  "subject": "Defective product received",
  "description": "The product arrived with manufacturing defects on the left side panel. Request replacement.",
  "priority": "High"
}
Response: { complaintId, status: "Open", ... }

↓

Step 3: Track Complaint
GET /api/complaints/{complaintId} (CMPS)
Headers: Authorization: Bearer <token>
Response: { complaintId, status, assignedTo, resolutionNotes, ... }

↓

Step 4: Add Comment to Complaint
POST /api/complaints/{complaintId}/comments (CMPS)
Headers: Authorization: Bearer <token>
{
  "comment": "Any update on the replacement?"
}
Response: { success, message }
```

### Journey 3: Admin Managing Orders

```
Step 1: Admin Login
POST /api/auth/login (ATHS)
{
  "email": "admin@example.com",
  "password": "AdminPass123!"
}
Response: { accessToken, user: { role: "Administrator" } }

↓

Step 2: View All Orders (with filters)
GET /api/admin/orders?page=1&page_size=20&order_status=Processing (ORMS)
Headers: Authorization: Bearer <admin_token>
Response: {
  items: [...orders],
  pagination: { page, pageSize, totalPages, totalCount }
}

↓

Step 3: Update Order Status
PATCH /api/admin/orders/{orderId}/status (ORMS)
Headers: Authorization: Bearer <admin_token>
{
  "status": "Shipped",
  "notes": "Shipped via FedEx, tracking: 1234567890"
}
Response: { orderId, status: "Shipped", ... }

↓

Step 4: View Order History
GET /api/admin/orders/{orderId}/history (ORMS)
Headers: Authorization: Bearer <admin_token>
Response: [
  {
    previousStatus: "Processing",
    newStatus: "Shipped",
    changedBy: "admin@example.com",
    changedAt: "2026-01-28T10:30:00Z",
    notes: "Shipped via FedEx..."
  }
]
```

### Journey 4: Order Cancellation by Customer

```
Step 1: View My Orders
GET /api/orders/me (ORMS)
Headers: Authorization: Bearer <token>
Response: {
  items: [...orders with status],
  pagination: { ... }
}

↓

Step 2: Cancel Order (only if status is Placed or Processing)
POST /api/orders/{orderId}/cancel (ORMS)
Headers: Authorization: Bearer <token>
{
  "reason": "Changed my mind about the purchase"
}
Response: { orderId, status: "Cancelled", ... }

Note: Returns 400 if order cannot be cancelled
```

### Journey 5: Admin Resolving Complaint

```
Step 1: View All Complaints
GET /api/complaints?page=1&limit=20&status=Open (CMPS)
Headers: Authorization: Bearer <admin_token>
Response: {
  data: {
    complaints: [...],
    pagination: { ... }
  }
}

↓

Step 2: Update Complaint Status
PATCH /api/admin/complaints/{complaintId}/status (CMPS)
Headers: Authorization: Bearer <admin_token>
{
  "status": "In Progress"
}
Response: { complaintId, status: "In Progress", ... }

↓

Step 3: Assign Complaint
PATCH /api/admin/complaints/{complaintId}/assign (CMPS)
Headers: Authorization: Bearer <admin_token>
{
  "adminId": "6979a1b1a6db796b4a1447e8"
}
Response: { complaintId, assignedTo, assignedToName, ... }

↓

Step 4: Resolve Complaint
PATCH /api/admin/complaints/{complaintId}/resolve (CMPS)
Headers: Authorization: Bearer <admin_token>
{
  "resolutionNotes": "Replacement product has been shipped. New tracking: 9876543210"
}
Response: { complaintId, status: "Resolved", resolutionNotes, ... }
```

---

## 7. Error Handling

### Standard Error Response Format

All services return errors in consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "data": {
    "errors": [
      {
        "field": "email",
        "message": "Email address is already registered",
        "type": "unique_constraint"
      }
    ]
  }
}
```

### HTTP Status Codes

| Code | Meaning | When Used | Example |
|------|---------|-----------|---------|
| **200** | OK | Successful GET, PATCH, POST | Order retrieved successfully |
| **201** | Created | Resource created | Order created, User registered |
| **400** | Bad Request | Validation errors, invalid data | Missing required field, invalid format |
| **401** | Unauthorized | Missing/invalid token | No Authorization header, expired token |
| **403** | Forbidden | Insufficient permissions | Customer trying to access admin endpoint |
| **404** | Not Found | Resource doesn't exist | Order ID not found |
| **409** | Conflict | Duplicate resource | Email already registered |
| **422** | Unprocessable Entity | Validation failed | Invalid enum value, constraint violation |
| **500** | Internal Server Error | Server error | Database connection failed |

### Common Error Scenarios

#### 1. Invalid/Expired Token
```json
Status: 401
{
  "success": false,
  "message": "Token expired or invalid",
  "data": null
}

Action: Refresh token using /api/auth/refresh-token
```

#### 2. Validation Error
```json
Status: 422 (FastAPI) or 400 (Node.js)
{
  "success": false,
  "message": "Validation error",
  "data": {
    "errors": [
      {
        "field": "body -> category",
        "message": "Input should be 'Product Quality', 'Delivery Issue', 'Customer Service', 'Payment Issue' or 'Other'",
        "type": "enum"
      }
    ]
  }
}

Action: Fix field value and retry
```

#### 3. Permission Denied
```json
Status: 403
{
  "success": false,
  "message": "Access denied. Administrator role required.",
  "data": null
}

Action: Ensure user has appropriate role
```

#### 4. Resource Not Found
```json
Status: 404
{
  "success": false,
  "message": "Order not found",
  "data": null
}

Action: Verify resource ID is correct
```

#### 5. Business Rule Violation
```json
Status: 400
{
  "success": false,
  "message": "Cannot cancel order. Only orders in Placed or Processing status can be cancelled",
  "data": null
}

Action: Check resource state before operation
```

### Recommended Error Handling Pattern

```javascript
async function apiCall(endpoint, options) {
  try {
    const response = await fetch(endpoint, options);
    const data = await response.json();
    
    if (!response.ok) {
      // Handle specific status codes
      switch (response.status) {
        case 401:
          // Token expired - refresh and retry
          await refreshToken();
          return apiCall(endpoint, options);
          
        case 403:
          // Permission denied - redirect to access denied page
          showError("You don't have permission to perform this action");
          break;
          
        case 404:
          // Resource not found
          showError("The requested resource was not found");
          break;
          
        case 422:
        case 400:
          // Validation errors - show field-specific errors
          displayValidationErrors(data.data?.errors || []);
          break;
          
        case 409:
          // Conflict - e.g., duplicate email
          showError(data.message);
          break;
          
        default:
          // Generic error
          showError(data.message || "An error occurred");
      }
      throw new Error(data.message);
    }
    
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
```

---

## 8. Common Patterns

### 8.1 Pagination

All list endpoints support pagination:

**Request:**
```http
GET /api/orders/me?page=1&page_size=20
```

**Response:**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalPages": 5,
      "totalCount": 95,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

### 8.2 Filtering & Search

**Orders:**
```http
GET /api/admin/orders?order_status=Processing&from_date=2026-01-01&to_date=2026-01-31
```

**Customers:**
```http
GET /api/customers/search?q=john&limit=10
```

**Complaints:**
```http
GET /api/complaints?status=Open&category=Product Quality&page=1&limit=20
```

### 8.3 Sorting

Default: Most recent first (descending order by creation date)

Custom sorting (where supported):
```http
GET /api/admin/orders?sort_by=totalAmount&sort_order=desc
```

### 8.4 Response Structure

**Success Response (Single Resource):**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "orderId": "ORD-2026-000001",
    "status": "Placed",
    ...
  }
}
```

**Success Response (List):**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "items": [...],
    "pagination": {...}
  }
}
```

**Nested List Response (CMPS):**
```json
{
  "data": {
    "complaints": [...],
    "pagination": {...}
  }
}
```

### 8.5 Date/Time Handling

- All timestamps are in UTC
- Format: ISO 8601 (e.g., `"2026-01-28T10:30:00.000Z"`)
- Date-only filters: Use `YYYY-MM-DD` format

### 8.6 Required Fields Validation

Each endpoint has specific required fields. Refer to individual API references for details.

**Common Validations:**
- Email: Valid email format, unique
- Password: Minimum 8 characters, contains letters and numbers
- Phone: Valid format (e.g., `+919876543210`)
- Pincode: 6 digits
- Order Status: Must be valid enum value
- Complaint Category: Must be valid enum value

---

## 9. API References

Detailed documentation for each service:

- **[ATHS API Reference](./api/ATHS-API-Reference.md)** - Authentication & User Management
- **[CRMS API Reference](./api/CRMS-API-Reference.md)** - Customer Management
- **[ORMS API Reference](./api/ORMS-API-Reference.md)** - Order Management
- **[CMPS API Reference](./api/CMPS-API-Reference.md)** - Complaint Management

---

## Quick Reference Card

### Essential Endpoints

```
Authentication:
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login
POST   /api/auth/refresh-token     Refresh access token
POST   /api/auth/logout            Logout

Customer:
GET    /api/customers/me           Get my profile
PUT    /api/customers/me           Update my profile

Orders:
POST   /api/orders                 Create order
GET    /api/orders/me              Get my orders
GET    /api/orders/{orderId}       Get order details
POST   /api/orders/{id}/cancel     Cancel order

Complaints:
POST   /api/complaints             Create complaint
GET    /api/complaints/me          Get my complaints
GET    /api/complaints/{id}        Get complaint details

Admin:
GET    /api/admin/orders           List all orders
PATCH  /api/admin/orders/{id}/status   Update order status
GET    /api/complaints             List all complaints
PATCH  /api/admin/complaints/{id}/status   Update complaint status
```

---

**For detailed endpoint documentation, request/response schemas, and validation rules, refer to the individual API reference documents.**
