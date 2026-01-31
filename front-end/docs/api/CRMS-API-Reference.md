# CRMS API Reference
## Customer Relationship Management Service

**Base URL:** `http://localhost:5002` (Development)  
**Version:** 1.0  
**Last Updated:** January 28, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Customer Profile Endpoints](#customer-profile-endpoints)
3. [Admin - Customer Management Endpoints](#admin---customer-management-endpoints)
4. [Data Models](#data-models)
5. [Validation Rules](#validation-rules)

---

## Overview

CRMS (Customer Relationship Management Service) manages customer profiles, statistics, and administrative operations. It automatically syncs with ATHS when new users register.

### Key Features
- Automatic customer profile creation from ATHS
- Customer statistics tracking (orders, complaints)
- Customer search and filtering
- Customer status management
- Customer analytics and reporting

---

## Customer Profile Endpoints

### 1. Get My Profile

Retrieves the authenticated customer's profile.

**Endpoint:** `GET /api/customers/me`  
**Authentication:** Required (Bearer token - Customer or Admin)

#### Headers

```http
Authorization: Bearer <access_token>
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Customer profile retrieved successfully",
  "data": {
    "customerId": "6979a1b1a6db796b4a1447e9",
    "userId": "6979a1b1a6db796b4a1447e8",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "contactNumber": "+919876543210",
    "customerStatus": "Active",
    "customerType": "Regular",
    "totalOrders": 15,
    "totalOrderValue": 24567.50,
    "totalComplaints": 2,
    "openComplaints": 0,
    "lastOrderDate": "2026-01-25T14:30:00.000Z",
    "customerSince": "2026-01-01T10:00:00.000Z",
    "lastComplaintDate": "2026-01-20T09:15:00.000Z",
    "notes": [],
    "tags": ["premium", "frequent-buyer"],
    "preferences": {
      "newsletter": true,
      "smsNotifications": false
    },
    "metadata": {
      "createdBy": "auth-service",
      "createdAt": "2026-01-01T10:00:00.000Z",
      "lastModifiedBy": "system",
      "lastModifiedAt": "2026-01-25T14:30:00.000Z"
    }
  }
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Authentication required",
  "data": null
}
```

**404 Not Found - Profile Not Created Yet**
```json
{
  "success": false,
  "message": "Customer profile not found",
  "data": null
}
```

#### Usage Example

**When to use:** Display customer dashboard, show profile information  
**Note:** Profile is automatically created when user registers in ATHS

---

### 2. Get My Statistics

Retrieves detailed statistics for the authenticated customer.

**Endpoint:** `GET /api/customers/me/statistics`  
**Authentication:** Required (Bearer token - Customer or Admin)

#### Headers

```http
Authorization: Bearer <access_token>
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Customer statistics retrieved successfully",
  "data": {
    "customerId": "6979a1b1a6db796b4a1447e9",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "orderStatistics": {
      "totalOrders": 15,
      "totalOrderValue": 24567.50,
      "averageOrderValue": 1637.83,
      "lastOrderDate": "2026-01-25T14:30:00.000Z",
      "ordersByStatus": {
        "Placed": 2,
        "Processing": 1,
        "Shipped": 3,
        "Delivered": 8,
        "Cancelled": 1
      }
    },
    "complaintStatistics": {
      "totalComplaints": 2,
      "openComplaints": 0,
      "resolvedComplaints": 2,
      "lastComplaintDate": "2026-01-20T09:15:00.000Z",
      "complaintsByCategory": {
        "Product Quality": 1,
        "Delivery Issue": 1
      }
    },
    "customerProfile": {
      "customerStatus": "Active",
      "customerType": "Regular",
      "customerSince": "2026-01-01T10:00:00.000Z",
      "daysSinceRegistration": 27
    }
  }
}
```

#### Usage Example

**When to use:** Customer dashboard analytics, profile summary  
**Note:** Statistics are updated in real-time from ORMS and CMPS

---

## Admin - Customer Management Endpoints

### 3. List All Customers

Retrieves a paginated list of all customers (Admin only).

**Endpoint:** `GET /api/customers`  
**Authentication:** Required (Admin Bearer token)

#### Headers

```http
Authorization: Bearer <admin_access_token>
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | ❌ No | 1 | Page number (min: 1) |
| `limit` | integer | ❌ No | 10 | Items per page (min: 1, max: 100) |
| `status` | string | ❌ No | - | Filter by status (Active, Inactive, Suspended) |
| `customerType` | string | ❌ No | - | Filter by type (Regular, Premium, VIP) |
| `fromDate` | string | ❌ No | - | Filter registrations from date (YYYY-MM-DD) |
| `toDate` | string | ❌ No | - | Filter registrations to date (YYYY-MM-DD) |

#### Example Request

```http
GET /api/customers?page=1&limit=20&status=Active&customerType=Premium
```

#### Success Response (200 OK)

```json
{
  "items": [
    {
      "customerId": "6979a1b1a6db796b4a1447e9",
      "userId": "6979a1b1a6db796b4a1447e8",
      "email": "john.doe@example.com",
      "fullName": "John Doe",
      "contactNumber": "+919876543210",
      "customerStatus": "Active",
      "customerType": "Premium",
      "totalOrders": 15,
      "totalOrderValue": 24567.50,
      "totalComplaints": 2,
      "openComplaints": 0,
      "lastOrderDate": "2026-01-25T14:30:00.000Z",
      "customerSince": "2026-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 25,
    "totalCount": 487,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

#### Error Responses

**403 Forbidden - Not Admin**
```json
{
  "success": false,
  "message": "Access denied. Administrator role required.",
  "data": null
}
```

#### Usage Example

**When to use:** Admin customer management dashboard  
**Pagination:** Always use pagination for large datasets

---

### 4. Search Customers

Searches customers by name, email, or contact number (Admin only).

**Endpoint:** `GET /api/customers/search`  
**Authentication:** Required (Admin Bearer token)

#### Headers

```http
Authorization: Bearer <admin_access_token>
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | ✅ Yes | Search query (min 2 chars) |
| `page` | integer | ❌ No | Page number (default: 1) |
| `limit` | integer | ❌ No | Items per page (default: 10, max: 100) |

#### Example Request

```http
GET /api/customers/search?q=john&limit=20
```

#### Success Response (200 OK)

```json
{
  "items": [
    {
      "customerId": "6979a1b1a6db796b4a1447e9",
      "userId": "6979a1b1a6db796b4a1447e8",
      "email": "john.doe@example.com",
      "fullName": "John Doe",
      "contactNumber": "+919876543210",
      "customerStatus": "Active",
      "customerType": "Regular",
      "totalOrders": 15,
      "totalOrderValue": 24567.50,
      "totalComplaints": 2,
      "openComplaints": 0,
      "lastOrderDate": "2026-01-25T14:30:00.000Z",
      "customerSince": "2026-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 1,
    "totalCount": 3,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

#### Usage Example

**When to use:** Admin search bar, customer lookup  
**Note:** Uses text index for efficient full-text search

---

### 5. Get Customer Analytics

Retrieves overall customer analytics (Admin only).

**Endpoint:** `GET /api/customers/analytics`  
**Authentication:** Required (Admin Bearer token)

#### Headers

```http
Authorization: Bearer <admin_access_token>
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Customer analytics retrieved successfully",
  "data": {
    "summary": {
      "totalCustomers": 487,
      "activeCustomers": 450,
      "inactiveCustomers": 32,
      "suspendedCustomers": 5,
      "newCustomersToday": 8,
      "newCustomersThisWeek": 47,
      "newCustomersThisMonth": 156
    },
    "customerTypes": {
      "Regular": 420,
      "Premium": 57,
      "VIP": 10
    },
    "orderMetrics": {
      "totalOrders": 3456,
      "totalRevenue": 2567890.50,
      "averageOrdersPerCustomer": 7.09,
      "averageRevenuePerCustomer": 5271.23
    },
    "complaintMetrics": {
      "totalComplaints": 234,
      "openComplaints": 45,
      "complaintRate": 6.77,
      "averageComplaintsPerCustomer": 0.48
    },
    "topCustomers": [
      {
        "customerId": "6979a1b1a6db796b4a1447e9",
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "totalOrders": 45,
        "totalOrderValue": 89456.50
      }
    ]
  }
}
```

#### Usage Example

**When to use:** Admin analytics dashboard, business intelligence  
**Note:** Aggregated data from all customers

---

### 6. Get Customer Details

Retrieves detailed information for a specific customer (Admin only).

**Endpoint:** `GET /api/customers/{customer_id}`  
**Authentication:** Required (Admin Bearer token)

#### Headers

```http
Authorization: Bearer <admin_access_token>
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customer_id` | string | ✅ Yes | Customer's MongoDB ObjectId or customerId |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Customer details retrieved successfully",
  "data": {
    "customerId": "6979a1b1a6db796b4a1447e9",
    "userId": "6979a1b1a6db796b4a1447e8",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "contactNumber": "+919876543210",
    "customerStatus": "Active",
    "customerType": "Premium",
    "totalOrders": 15,
    "totalOrderValue": 24567.50,
    "totalComplaints": 2,
    "openComplaints": 0,
    "lastOrderDate": "2026-01-25T14:30:00.000Z",
    "customerSince": "2026-01-01T10:00:00.000Z",
    "lastComplaintDate": "2026-01-20T09:15:00.000Z",
    "notes": [
      {
        "noteId": "note-001",
        "content": "Preferred customer, always pays on time",
        "addedBy": "admin@example.com",
        "addedAt": "2026-01-15T10:00:00.000Z"
      }
    ],
    "tags": ["premium", "frequent-buyer"],
    "preferences": {
      "newsletter": true,
      "smsNotifications": false
    },
    "metadata": {
      "createdBy": "auth-service",
      "createdAt": "2026-01-01T10:00:00.000Z",
      "lastModifiedBy": "admin@example.com",
      "lastModifiedAt": "2026-01-25T14:30:00.000Z"
    }
  }
}
```

#### Error Responses

**400 Bad Request - Invalid ID**
```json
{
  "success": false,
  "message": "Invalid customer ID format",
  "data": null
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Customer not found",
  "data": null
}
```

---

### 7. Update Customer Information

Updates customer information (Admin only).

**Endpoint:** `PUT /api/customers/{customer_id}`  
**Authentication:** Required (Admin Bearer token)

#### Headers

```http
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customer_id` | string | ✅ Yes | Customer's MongoDB ObjectId or customerId |

#### Request Body

```json
{
  "fullName": "John Michael Doe",
  "contactNumber": "+919876543210",
  "customerType": "Premium",
  "tags": ["premium", "loyal-customer"],
  "preferences": {
    "newsletter": true,
    "smsNotifications": true
  }
}
```

#### Request Fields

| Field | Type | Required | Allowed Values | Description |
|-------|------|----------|----------------|-------------|
| `fullName` | string | ❌ No | Min 2, Max 100 chars | Updated name |
| `contactNumber` | string | ❌ No | Min 10, Max 15 chars | Updated phone |
| `customerType` | string | ❌ No | Regular, Premium, VIP | Customer tier |
| `tags` | array | ❌ No | Array of strings | Custom tags |
| `preferences` | object | ❌ No | Key-value pairs | Customer preferences |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "customerId": "6979a1b1a6db796b4a1447e9",
    "fullName": "John Michael Doe",
    "contactNumber": "+919876543210",
    "customerType": "Premium",
    "tags": ["premium", "loyal-customer"],
    "metadata": {
      "lastModifiedBy": "admin@example.com",
      "lastModifiedAt": "2026-01-28T15:45:00.000Z"
    }
  }
}
```

---

### 8. Update Customer Status

Updates customer account status (Admin only).

**Endpoint:** `PATCH /api/customers/{customer_id}/status`  
**Authentication:** Required (Admin Bearer token)

#### Headers

```http
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "status": "Suspended",
  "reason": "Multiple payment failures"
}
```

#### Request Fields

| Field | Type | Required | Allowed Values | Description |
|-------|------|----------|----------------|-------------|
| `status` | string | ✅ Yes | Active, Inactive, Suspended | New status |
| `reason` | string | ❌ No | Max 500 chars | Reason for status change |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Customer status updated successfully",
  "data": {
    "customerId": "6979a1b1a6db796b4a1447e9",
    "customerStatus": "Suspended",
    "updatedAt": "2026-01-28T16:00:00.000Z"
  }
}
```

#### Important Notes
- Suspended customers cannot place orders or create complaints
- Status change also updates user status in ATHS

---

### 9. Update Customer Type

Updates customer tier (Admin only).

**Endpoint:** `PATCH /api/customers/{customer_id}/type`  
**Authentication:** Required (Admin Bearer token)

#### Request Body

```json
{
  "customerType": "VIP",
  "notes": "Upgraded to VIP due to high order value"
}
```

#### Request Fields

| Field | Type | Required | Allowed Values | Description |
|-------|------|----------|----------------|-------------|
| `customerType` | string | ✅ Yes | Regular, Premium, VIP | New customer tier |
| `notes` | string | ❌ No | Max 500 chars | Reason for change |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Customer type updated successfully",
  "data": {
    "customerId": "6979a1b1a6db796b4a1447e9",
    "customerType": "VIP",
    "updatedAt": "2026-01-28T16:15:00.000Z"
  }
}
```

---

### 10. Add Customer Note

Adds an administrative note to customer profile (Admin only).

**Endpoint:** `POST /api/customers/{customer_id}/notes`  
**Authentication:** Required (Admin Bearer token)

#### Request Body

```json
{
  "content": "Customer requested expedited shipping for all future orders"
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `content` | string | ✅ Yes | Min 10, Max 1000 chars | Note content |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "noteId": "note-012",
    "content": "Customer requested expedited shipping for all future orders",
    "addedBy": "admin@example.com",
    "addedAt": "2026-01-28T16:30:00.000Z"
  }
}
```

---

### 11. Delete Customer

Permanently deletes a customer (Admin only).

**Endpoint:** `DELETE /api/customers/{customer_id}`  
**Authentication:** Required (Admin Bearer token)

#### Headers

```http
Authorization: Bearer <admin_access_token>
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Customer deleted successfully",
  "data": null
}
```

#### Error Responses

**400 Bad Request - Has Active Orders/Complaints**
```json
{
  "success": false,
  "message": "Cannot delete customer with active orders or complaints",
  "data": {
    "activeOrders": 2,
    "openComplaints": 1
  }
}
```

#### Important Notes
- Cannot delete customers with active orders or open complaints
- This action is **irreversible**
- Also deletes associated user account in ATHS

---

## Data Models

### Customer Object

```typescript
{
  customerId: string;              // Unique customer identifier
  userId: string;                  // Associated user ID from ATHS
  email: string;                   // Customer email
  fullName: string;                // Customer full name
  contactNumber?: string;          // Phone number (optional)
  customerStatus: "Active" | "Inactive" | "Suspended";
  customerType: "Regular" | "Premium" | "VIP";
  totalOrders: number;             // Total order count
  totalOrderValue: number;         // Total spending amount
  totalComplaints: number;         // Total complaints filed
  openComplaints: number;          // Currently open complaints
  lastOrderDate?: string;          // ISO 8601 timestamp
  customerSince: string;           // Registration date
  lastComplaintDate?: string;      // Last complaint date
  notes: Note[];                   // Admin notes
  tags: string[];                  // Custom tags
  preferences: object;             // Customer preferences
  metadata: {
    createdBy: string;
    createdAt: string;
    lastModifiedBy: string;
    lastModifiedAt: string;
  };
}
```

### Note Object

```typescript
{
  noteId: string;
  content: string;
  addedBy: string;                 // Admin email who added the note
  addedAt: string;                 // ISO 8601 timestamp
}
```

### Statistics Object

```typescript
{
  customerId: string;
  email: string;
  fullName: string;
  orderStatistics: {
    totalOrders: number;
    totalOrderValue: number;
    averageOrderValue: number;
    lastOrderDate?: string;
    ordersByStatus: {
      [status: string]: number;
    };
  };
  complaintStatistics: {
    totalComplaints: number;
    openComplaints: number;
    resolvedComplaints: number;
    lastComplaintDate?: string;
    complaintsByCategory: {
      [category: string]: number;
    };
  };
  customerProfile: {
    customerStatus: string;
    customerType: string;
    customerSince: string;
    daysSinceRegistration: number;
  };
}
```

---

## Validation Rules

### Customer Status
- **Allowed Values:** `"Active"`, `"Inactive"`, `"Suspended"`
- **Default:** `"Active"`
- **Effect:**
  - `Active`: Can perform all operations
  - `Inactive`: Profile exists but cannot access system
  - `Suspended`: Account temporarily disabled

### Customer Type
- **Allowed Values:** `"Regular"`, `"Premium"`, `"VIP"`
- **Default:** `"Regular"`
- **Usage:** Can be used for tiered pricing, special offers

### Contact Number
- **Min Length:** 10 characters
- **Max Length:** 15 characters
- **Pattern:** Numbers, +, -, spaces, parentheses
- **Example:** `+919876543210`

### Full Name
- **Min Length:** 2 characters
- **Max Length:** 100 characters

### Note Content
- **Min Length:** 10 characters
- **Max Length:** 1000 characters

### Tags
- **Type:** Array of strings
- **Item Max Length:** 50 characters
- **Example:** `["premium", "loyal-customer", "vip-support"]`

---

## Pagination Pattern

All list endpoints support pagination with consistent structure:

**Request:**
```http
GET /api/customers?page=1&limit=20
```

**Response:**
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 25,
    "totalCount": 487,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## Common Workflows

### Admin Workflow: Managing Customers

```
1. Search for customer
   GET /api/customers/search?q=john

2. View customer details
   GET /api/customers/{customerId}

3. Update customer type
   PATCH /api/customers/{customerId}/type
   { "customerType": "Premium" }

4. Add administrative note
   POST /api/customers/{customerId}/notes
   { "content": "VIP customer, priority support" }
```

### Customer Workflow: View Profile & Stats

```
1. Get my profile
   GET /api/customers/me

2. Get my statistics
   GET /api/customers/me/statistics
```

---

**For complete integration examples and authentication flows, see the [Frontend Developer Guide](../Frontend-Developer-Guide.md)**
