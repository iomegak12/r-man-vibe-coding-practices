# CMPS API Reference
## Complaint Management Service

**Base URL:** `http://localhost:5004` (Development)  
**Version:** 1.0  
**Last Updated:** January 28, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Complaint Management Endpoints](#complaint-management-endpoints)
3. [Comment Management Endpoints](#comment-management-endpoints)
4. [Admin - Complaint Management Endpoints](#admin---complaint-management-endpoints)
5. [Data Models](#data-models)
6. [Validation Rules](#validation-rules)
7. [Business Rules](#business-rules)

---

## Overview

CMPS (Complaint Management Service) handles customer complaints, their lifecycle management, and resolution tracking.

### Key Features
- Order-linked and general complaint creation
- Complaint tracking and status management
- Comment/communication system
- Assignment to support staff
- Priority management
- Resolution tracking
- Reopening closed complaints
- Complaint analytics

### Complaint Status Flow

```
Open → In Progress → Resolved → Closed
  ↓                    ↓
  ←──── Reopened ──────┘
```

**Complaint Statuses:**
- **Open:** Complaint has been registered
- **In Progress:** Complaint is being investigated
- **Resolved:** Solution has been provided
- **Closed:** Complaint is finalized (no further action)
- **Reopened:** Closed complaint has been reopened

---

## Complaint Management Endpoints

### 1. Create Complaint

Creates a new complaint (order-linked or general).

**Endpoint:** `POST /api/complaints`  
**Authentication:** Required (Bearer token - Customer)

#### Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body

**Order-Linked Complaint:**
```json
{
  "orderId": "ORD-2026-0000001",
  "category": "Product Quality",
  "subject": "Defective headphones received",
  "description": "The wireless headphones I ordered are not working properly. The left ear piece produces no sound and there is static in the right ear piece. This is very disappointing as I was looking forward to using these headphones.",
  "priority": "High",
  "tags": ["defective", "audio-issue"],
  "metadata": {
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "platform": "Web",
    "source": "Web"
  }
}
```

**General Complaint:**
```json
{
  "category": "Customer Service",
  "subject": "Unable to reach support team",
  "description": "I have been trying to contact customer support for the past two days but no one is responding to my calls or emails. This is extremely frustrating as I need urgent help with my account.",
  "priority": "Medium",
  "tags": ["support", "urgent"]
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `orderId` | string | ❌ No | Valid order ID | Link to specific order |
| `category` | string | ✅ Yes | See allowed values | Complaint category |
| `subject` | string | ✅ Yes | 5-200 chars | Complaint subject |
| `description` | string | ✅ Yes | 20-2000 chars | Detailed description |
| `priority` | string | ❌ No | Low/Medium/High/Critical | Priority level (default: Medium) |
| `tags` | array | ❌ No | Array of strings | Custom tags |
| `metadata` | object | ❌ No | - | Additional metadata |

**Allowed category values:**
- `"Product Quality"`
- `"Delivery Issue"`
- `"Customer Service"`
- `"Payment Issue"`
- `"Return/Refund"`
- `"Website/App Issue"`
- `"Other"`

**Allowed priority values:**
- `"Low"` - Non-urgent issue
- `"Medium"` - Standard priority (default)
- `"High"` - Urgent attention needed
- `"Critical"` - Immediate action required

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Complaint registered successfully",
  "data": {
    "complaintId": "CMP-2026-0000001",
    "customerId": "6979a1b1a6db796b4a1447e9",
    "customerEmail": "john.doe@example.com",
    "customerName": "John Doe",
    "orderId": "ORD-2026-0000001",
    "category": "Product Quality",
    "subject": "Defective headphones received",
    "description": "The wireless headphones I ordered are not working properly. The left ear piece produces no sound and there is static in the right ear piece. This is very disappointing as I was looking forward to using these headphones.",
    "status": "Open",
    "priority": "High",
    "assignedTo": null,
    "assignedToName": null,
    "tags": ["defective", "audio-issue"],
    "createdAt": "2026-01-28T13:00:00.000Z"
  }
}
```

#### Error Responses

**404 Not Found - Order Not Found**
```json
{
  "success": false,
  "message": "Order ORD-2026-9999999 not found",
  "data": null
}
```

**403 Forbidden - Not Order Owner**
```json
{
  "success": false,
  "message": "You can only create complaints for your own orders",
  "data": null
}
```

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "message": "Validation error",
  "data": {
    "description": "Description must be at least 20 characters"
  }
}
```

#### Usage Example

**When to use:** Customer has an issue with an order or general service complaint  
**Note:** Automatically generates unique complaint ID (CMP-YYYY-NNNNNNN)

---

### 2. Get My Complaints

Retrieves a paginated list of complaints for the authenticated customer.

**Endpoint:** `GET /api/complaints/me`  
**Authentication:** Required (Bearer token - Customer)

#### Headers

```http
Authorization: Bearer <access_token>
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | ❌ No | 1 | Page number (min: 1) |
| `limit` | integer | ❌ No | 10 | Items per page (min: 1, max: 50) |
| `status` | string | ❌ No | - | Filter by status |
| `category` | string | ❌ No | - | Filter by category |
| `sortBy` | string | ❌ No | createdAt | Sort field |
| `sortOrder` | string | ❌ No | desc | Sort order (asc/desc) |

#### Example Request

```http
GET /api/complaints/me?page=1&limit=10&status=Open&sortBy=priority
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Complaints retrieved successfully",
  "data": {
    "complaints": [
      {
        "complaintId": "CMP-2026-0000001",
        "orderId": "ORD-2026-0000001",
        "category": "Product Quality",
        "subject": "Defective headphones received",
        "status": "Open",
        "priority": "High",
        "assignedToName": null,
        "createdAt": "2026-01-28T13:00:00.000Z",
        "updatedAt": "2026-01-28T13:00:00.000Z"
      },
      {
        "complaintId": "CMP-2026-0000002",
        "orderId": null,
        "category": "Customer Service",
        "subject": "Unable to reach support team",
        "status": "In Progress",
        "priority": "Medium",
        "assignedToName": "Support Agent",
        "createdAt": "2026-01-27T10:00:00.000Z",
        "updatedAt": "2026-01-28T09:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

#### Usage Example

**When to use:** Display customer's complaint history  
**Sorting:** Supports sorting by createdAt, priority, status

---

### 3. Get Complaint Details

Retrieves detailed information about a specific complaint.

**Endpoint:** `GET /api/complaints/{complaint_id}`  
**Authentication:** Required (Bearer token - Customer or Admin)

#### Headers

```http
Authorization: Bearer <access_token>
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `complaint_id` | string | ✅ Yes | Complaint ID (e.g., CMP-2026-0000001) |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Complaint details retrieved successfully",
  "data": {
    "complaintId": "CMP-2026-0000001",
    "customerId": "6979a1b1a6db796b4a1447e9",
    "customerEmail": "john.doe@example.com",
    "customerName": "John Doe",
    "orderId": "ORD-2026-0000001",
    "category": "Product Quality",
    "subject": "Defective headphones received",
    "description": "The wireless headphones I ordered are not working properly. The left ear piece produces no sound and there is static in the right ear piece. This is very disappointing as I was looking forward to using these headphones.",
    "status": "In Progress",
    "priority": "High",
    "assignedTo": "admin-user-id",
    "assignedToName": "Support Agent",
    "assignedAt": "2026-01-28T14:00:00.000Z",
    "resolutionNotes": null,
    "resolvedBy": null,
    "resolvedAt": null,
    "closedBy": null,
    "closedAt": null,
    "reopenedCount": 0,
    "tags": ["defective", "audio-issue"],
    "createdAt": "2026-01-28T13:00:00.000Z",
    "updatedAt": "2026-01-28T14:00:00.000Z"
  }
}
```

#### Error Responses

**403 Forbidden - Not Owner**
```json
{
  "success": false,
  "message": "You can only view your own complaints",
  "data": null
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Complaint not found",
  "data": null
}
```

#### Usage Example

**When to use:** View detailed complaint information, track resolution status  
**Permission:** Customers can only view their own complaints, Admins can view all

---

## Comment Management Endpoints

### 4. Add Comment to Complaint

Adds a comment/update to a complaint.

**Endpoint:** `POST /api/complaints/{complaint_id}/comments`  
**Authentication:** Required (Bearer token - Customer or Admin)

#### Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `complaint_id` | string | ✅ Yes | Complaint ID |

#### Request Body

```json
{
  "comment": "I have tried resetting the headphones as suggested in the manual, but the issue persists. The left ear piece still produces no sound.",
  "attachments": [
    {
      "fileName": "headphone-issue.jpg",
      "fileUrl": "https://storage.example.com/uploads/headphone-issue.jpg",
      "fileType": "image/jpeg",
      "fileSize": 245678
    }
  ]
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `comment` | string | ✅ Yes | 10-2000 chars | Comment text |
| `attachments` | array | ❌ No | - | File attachments |
| &nbsp;&nbsp;fileName | string | ✅ Yes | Not empty | File name |
| &nbsp;&nbsp;fileUrl | string | ✅ Yes | Valid URL | File URL |
| &nbsp;&nbsp;fileType | string | ❌ No | MIME type | File type |
| &nbsp;&nbsp;fileSize | integer | ❌ No | > 0 | File size in bytes |

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "commentId": "697abc123def456789012345",
    "complaintId": "CMP-2026-0000001",
    "comment": "I have tried resetting the headphones as suggested in the manual, but the issue persists. The left ear piece still produces no sound.",
    "postedBy": "6979a1b1a6db796b4a1447e8",
    "postedByRole": "Customer",
    "postedByName": "John Doe",
    "attachments": [
      {
        "fileName": "headphone-issue.jpg",
        "fileUrl": "https://storage.example.com/uploads/headphone-issue.jpg",
        "fileType": "image/jpeg",
        "fileSize": 245678
      }
    ],
    "createdAt": "2026-01-28T15:30:00.000Z"
  }
}
```

#### Usage Example

**When to use:** Customer provides additional information, Admin responds to complaint  
**Note:** Both customers and admins can add comments

---

### 5. Get Complaint Comments

Retrieves all comments for a specific complaint.

**Endpoint:** `GET /api/complaints/{complaint_id}/comments`  
**Authentication:** Required (Bearer token - Customer or Admin)

#### Headers

```http
Authorization: Bearer <access_token>
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": {
    "complaintId": "CMP-2026-0000001",
    "comments": [
      {
        "commentId": "697abc123def456789012345",
        "comment": "Thank you for reporting this issue. We will investigate and get back to you within 24 hours.",
        "postedBy": "admin-user-id",
        "postedByRole": "Administrator",
        "postedByName": "Support Agent",
        "attachments": [],
        "createdAt": "2026-01-28T14:15:00.000Z"
      },
      {
        "commentId": "697abc123def456789012346",
        "comment": "I have tried resetting the headphones as suggested in the manual, but the issue persists.",
        "postedBy": "6979a1b1a6db796b4a1447e8",
        "postedByRole": "Customer",
        "postedByName": "John Doe",
        "attachments": [
          {
            "fileName": "headphone-issue.jpg",
            "fileUrl": "https://storage.example.com/uploads/headphone-issue.jpg",
            "fileType": "image/jpeg",
            "fileSize": 245678
          }
        ],
        "createdAt": "2026-01-28T15:30:00.000Z"
      }
    ],
    "totalComments": 2
  }
}
```

#### Usage Example

**When to use:** View conversation history for a complaint  
**Sorting:** Comments are sorted by creation date (oldest first)

---

## Admin - Complaint Management Endpoints

### 6. List All Complaints (Admin)

Retrieves a paginated list of all complaints with filtering (Admin only).

**Endpoint:** `GET /api/complaints`  
**Authentication:** Required (Admin Bearer token)

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | ❌ No | 1 | Page number |
| `limit` | integer | ❌ No | 10 | Items per page (max: 100) |
| `status` | string | ❌ No | - | Filter by status |
| `category` | string | ❌ No | - | Filter by category |
| `priority` | string | ❌ No | - | Filter by priority |
| `assignedTo` | string | ❌ No | - | Filter by assigned admin ID |
| `customerId` | string | ❌ No | - | Filter by customer ID |
| `sortBy` | string | ❌ No | createdAt | Sort field |
| `sortOrder` | string | ❌ No | desc | Sort order (asc/desc) |

#### Example Request

```http
GET /api/complaints?page=1&limit=20&status=Open&priority=High&sortBy=priority
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Complaints retrieved successfully",
  "data": {
    "complaints": [
      {
        "complaintId": "CMP-2026-0000001",
        "customerId": "6979a1b1a6db796b4a1447e9",
        "customerEmail": "john.doe@example.com",
        "customerName": "John Doe",
        "orderId": "ORD-2026-0000001",
        "category": "Product Quality",
        "subject": "Defective headphones received",
        "status": "Open",
        "priority": "High",
        "assignedTo": null,
        "assignedToName": null,
        "createdAt": "2026-01-28T13:00:00.000Z",
        "updatedAt": "2026-01-28T13:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 15,
      "totalItems": 147,
      "itemsPerPage": 10
    }
  }
}
```

---

### 7. Search Complaints (Admin)

Searches complaints by ID, subject, customer email, or order ID (Admin only).

**Endpoint:** `GET /api/complaints/search`  
**Authentication:** Required (Admin Bearer token)

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | ✅ Yes | Search query (min 1 char) |
| `page` | integer | ❌ No | Page number (default: 1) |
| `limit` | integer | ❌ No | Items per page (default: 10, max: 100) |

#### Example Request

```http
GET /api/complaints/search?q=john.doe@example.com&limit=20
```

**Search Fields:**
- Complaint ID (exact match)
- Subject (partial match, case-insensitive)
- Customer Email (partial match, case-insensitive)
- Order ID (exact match)

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "complaints": [
      {
        "complaintId": "CMP-2026-0000001",
        "customerId": "6979a1b1a6db796b4a1447e9",
        "customerEmail": "john.doe@example.com",
        "customerName": "John Doe",
        "orderId": "ORD-2026-0000001",
        "category": "Product Quality",
        "subject": "Defective headphones received",
        "status": "Open",
        "priority": "High",
        "createdAt": "2026-01-28T13:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 20
    }
  }
}
```

---

### 8. Assign Complaint (Admin)

Assigns a complaint to a support staff member (Admin only).

**Endpoint:** `PATCH /api/complaints/{complaint_id}/assign`  
**Authentication:** Required (Admin Bearer token)

#### Request Body

```json
{
  "assignTo": "support-agent-user-id",
  "notes": "Assigning to technical support team for hardware issue investigation"
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `assignTo` | string | ✅ Yes | Valid user ID | User ID to assign to |
| `notes` | string | ❌ No | Max 500 chars | Assignment notes |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Complaint assigned successfully",
  "data": {
    "complaintId": "CMP-2026-0000001",
    "assignedTo": "support-agent-user-id",
    "assignedToName": "Technical Support Agent",
    "assignedAt": "2026-01-28T14:00:00.000Z",
    "status": "In Progress"
  }
}
```

---

### 9. Resolve Complaint (Admin)

Marks a complaint as resolved with resolution notes (Admin only).

**Endpoint:** `POST /api/complaints/{complaint_id}/resolve`  
**Authentication:** Required (Admin Bearer token)

#### Request Body

```json
{
  "resolutionNotes": "We have arranged for a replacement product to be shipped to the customer. The defective headphones should be returned using the prepaid shipping label sent to the customer's email. A full refund has been processed and will reflect in 3-5 business days.",
  "tags": ["replacement-sent", "refund-processed"]
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `resolutionNotes` | string | ✅ Yes | 20-2000 chars | Resolution details |
| `tags` | array | ❌ No | Array of strings | Resolution tags |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Complaint resolved successfully",
  "data": {
    "complaintId": "CMP-2026-0000001",
    "status": "Resolved",
    "resolutionNotes": "We have arranged for a replacement product to be shipped to the customer...",
    "resolvedBy": "admin@example.com",
    "resolvedByName": "Technical Support Agent",
    "resolvedAt": "2026-01-28T16:00:00.000Z"
  }
}
```

---

### 10. Close Complaint (Admin)

Permanently closes a resolved complaint (Admin only).

**Endpoint:** `POST /api/complaints/{complaint_id}/close`  
**Authentication:** Required (Admin Bearer token)

#### Request Body

```json
{
  "notes": "Customer confirmed satisfaction with replacement product. Closing complaint."
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Complaint closed successfully",
  "data": {
    "complaintId": "CMP-2026-0000001",
    "status": "Closed",
    "closedBy": "admin@example.com",
    "closedByName": "Technical Support Agent",
    "closedAt": "2026-01-29T10:00:00.000Z"
  }
}
```

**Note:** Can only close complaints with status "Resolved"

---

### 11. Reopen Complaint (Admin)

Reopens a closed complaint (Admin only).

**Endpoint:** `POST /api/complaints/{complaint_id}/reopen`  
**Authentication:** Required (Admin Bearer token)

#### Request Body

```json
{
  "reason": "Customer reported replacement product also has the same issue. Escalating to quality control."
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `reason` | string | ✅ Yes | 10-500 chars | Reason for reopening |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Complaint reopened successfully",
  "data": {
    "complaintId": "CMP-2026-0000001",
    "status": "Reopened",
    "reopenedCount": 1,
    "reopenedBy": "admin@example.com",
    "reopenedAt": "2026-01-30T09:00:00.000Z"
  }
}
```

**Note:** Can only reopen complaints with status "Closed" or "Resolved"

---

### 12. Update Complaint Status (Admin)

Manually updates complaint status (Admin only).

**Endpoint:** `PATCH /api/complaints/{complaint_id}/status`  
**Authentication:** Required (Admin Bearer token)

#### Request Body

```json
{
  "status": "In Progress",
  "notes": "Investigation underway with product quality team"
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `status` | string | ✅ Yes | Valid status | New status |
| `notes` | string | ❌ No | Max 500 chars | Status change notes |

**Valid status values:**
- `"Open"`
- `"In Progress"`
- `"Resolved"`
- `"Closed"`
- `"Reopened"`

---

### 13. Update Complaint Priority (Admin)

Updates complaint priority level (Admin only).

**Endpoint:** `PATCH /api/complaints/{complaint_id}/priority`  
**Authentication:** Required (Admin Bearer token)

#### Request Body

```json
{
  "priority": "Critical",
  "notes": "Escalating to critical as customer is threatening legal action"
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `priority` | string | ✅ Yes | Low/Medium/High/Critical | New priority |
| `notes` | string | ❌ No | Max 500 chars | Priority change notes |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Complaint priority updated successfully",
  "data": {
    "complaintId": "CMP-2026-0000001",
    "priority": "Critical",
    "updatedAt": "2026-01-28T17:00:00.000Z"
  }
}
```

---

## Data Models

### Complaint Object

```typescript
{
  complaintId: string;                // Unique complaint ID (CMP-YYYY-NNNNNNN)
  customerId: string;                 // Customer ID
  customerEmail: string;              // Customer email
  customerName: string;               // Customer full name
  orderId?: string;                   // Linked order ID (optional)
  category: ComplaintCategory;        // Complaint category
  subject: string;                    // Complaint subject
  description: string;                // Detailed description
  status: ComplaintStatus;            // Current status
  priority: Priority;                 // Priority level
  assignedTo?: string;                // Assigned admin user ID
  assignedToName?: string;            // Assigned admin name
  assignedAt?: string;                // Assignment timestamp
  resolutionNotes?: string;           // Resolution details
  resolvedBy?: string;                // User ID who resolved
  resolvedByName?: string;            // Name of resolver
  resolvedAt?: string;                // Resolution timestamp
  closedBy?: string;                  // User ID who closed
  closedByName?: string;              // Name of closer
  closedAt?: string;                  // Closure timestamp
  reopenedCount: number;              // Number of times reopened
  reopenedBy?: string;                // User ID who reopened
  reopenedAt?: string;                // Reopen timestamp
  customerSatisfaction?: number;      // Rating (1-5)
  tags: string[];                     // Custom tags
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    platform?: string;
    source?: string;
  };
  createdAt: string;                  // Creation timestamp
  updatedAt: string;                  // Last update timestamp
  updatedBy: string;                  // User ID who updated
}
```

### Comment Object

```typescript
{
  commentId: string;                  // Unique comment ID
  complaintId: string;                // Associated complaint ID
  comment: string;                    // Comment text
  postedBy: string;                   // User ID who posted
  postedByRole: string;               // "Customer" or "Administrator"
  postedByName: string;               // Name of poster
  attachments: Attachment[];          // File attachments
  createdAt: string;                  // Creation timestamp
}
```

### Attachment Object

```typescript
{
  fileName: string;                   // File name
  fileUrl: string;                    // File URL
  fileType?: string;                  // MIME type
  fileSize?: number;                  // File size in bytes
}
```

---

## Validation Rules

### Complaint Creation
- **Subject Length:** 5-200 characters
- **Description Length:** 20-2000 characters
- **Category:** Must be one of the allowed values
- **Priority:** Low, Medium, High, or Critical (default: Medium)
- **Order Validation:** If orderId provided, order must exist and belong to customer

### Comment Creation
- **Comment Length:** 10-2000 characters
- **Attachments:** Optional, each must have fileName and fileUrl

### Admin Operations
- **Resolution Notes:** 20-2000 characters (required for resolve)
- **Reopen Reason:** 10-500 characters (required for reopen)
- **Assignment Notes:** Max 500 characters (optional)
- **Status Change Notes:** Max 500 characters (optional)

---

## Business Rules

### Complaint Creation
1. Complaint ID is auto-generated in format `CMP-YYYY-NNNNNNN`
2. Initial status is always "Open"
3. If orderId provided, order must exist and belong to customer
4. Default priority is "Medium" if not specified
5. Complaint history entry is created automatically

### Assignment
1. Only admin users can assign complaints
2. Assignment automatically changes status to "In Progress" if status is "Open"
3. Assignment history is tracked

### Resolution
1. Only admin users can resolve complaints
2. Resolution notes are required (minimum 20 characters)
3. Status changes to "Resolved"
4. Resolution timestamp and resolver are recorded

### Closure
1. Only admin users can close complaints
2. Complaints can only be closed if status is "Resolved"
3. Closure is considered final (but can be reopened)

### Reopening
1. Only admin users can reopen complaints
2. Can only reopen complaints with status "Closed" or "Resolved"
3. Reopen counter increments
4. Status changes to "Reopened"
5. Reopen reason is required

### Comments
1. Both customers and admins can add comments
2. Customers can only comment on their own complaints
3. Admins can comment on any complaint
4. Comments are immutable once posted

---

## Common Workflows

### Customer Workflow: File and Track Complaint

```
1. Create complaint
   POST /api/complaints
   { orderId, category, subject, description, priority }

2. View my complaints
   GET /api/complaints/me

3. View specific complaint details
   GET /api/complaints/{complaintId}

4. Add comment/update
   POST /api/complaints/{complaintId}/comments
   { comment, attachments }

5. View all comments
   GET /api/complaints/{complaintId}/comments
```

### Admin Workflow: Manage Complaints

```
1. List all open complaints
   GET /api/complaints?status=Open&sortBy=priority

2. Search for specific complaint
   GET /api/complaints/search?q=john.doe@example.com

3. View complaint details
   GET /api/complaints/{complaintId}

4. Assign to support agent
   PATCH /api/complaints/{complaintId}/assign
   { assignTo, notes }

5. Add investigation notes
   POST /api/complaints/{complaintId}/comments
   { comment }

6. Resolve complaint
   POST /api/complaints/{complaintId}/resolve
   { resolutionNotes, tags }

7. Close complaint
   POST /api/complaints/{complaintId}/close
   { notes }
```

### Admin Workflow: Handle Escalation

```
1. Update priority to Critical
   PATCH /api/complaints/{complaintId}/priority
   { priority: "Critical", notes }

2. Reassign to senior support
   PATCH /api/complaints/{complaintId}/assign
   { assignTo, notes }

3. Reopen if needed
   POST /api/complaints/{complaintId}/reopen
   { reason }
```

---

**For complete integration examples and authentication flows, see the [Frontend Developer Guide](../Frontend-Developer-Guide.md)**
