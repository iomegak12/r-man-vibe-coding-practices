# Complaint Management Service (CMPS) - Implementation Guide
## E-Commerce Customer Management System

**Document Version:** 1.0  
**Date:** January 25, 2026  
**Service Name:** Complaint Management Service (CMPS)  
**Technology:** Python + FastAPI  
**Port:** 8003  
**Client:** R-MAN Corporation, Bangalore  
**Prepared By:** Ramkumar

---

## 1. Service Overview

The Complaint Management Service (CMPS) handles customer complaint registration, tracking, resolution, and admin complaint management within the E-Commerce Customer Management System. Built with Python FastAPI, it provides comprehensive complaint lifecycle management.

**Key Responsibilities:**
- Complaint registration (order-linked or general)
- Complaint status tracking
- Complaint resolution and closure
- Admin complaint assignment
- Comment/communication on complaints
- Complaint analytics and reporting
- Email notifications for complaint events

---

## 2. Database Schema

### 2.1 Database Name
`complaint_db`

### 2.2 Collections

#### 2.2.1 complaints Collection

**Purpose:** Store complaint information and status

```javascript
{
  _id: ObjectId,
  complaintId: String,               // Unique complaint ID (e.g., "CMP-2026-001234")
  userId: String,                    // Reference to Auth Service user._id
  customerId: String,                // Reference to Customer Service customer._id
  customerEmail: String,             // Denormalized for quick access
  customerName: String,              // Denormalized for quick access
  orderId: String,                   // Reference to Order (nullable for general complaints)
  orderIdString: String,             // Order ID string if linked (nullable)
  category: String,                  // Complaint category
  subject: String,                   // Complaint subject/title
  description: String,               // Detailed complaint description
  status: String,                    // Complaint status
  priority: String,                  // Low, Medium, High, Critical
  assignedTo: String,                // Admin userId (nullable)
  assignedToName: String,            // Admin name (denormalized, nullable)
  assignedAt: Date,                  // Assignment timestamp (nullable)
  resolutionNotes: String,           // Resolution details (nullable)
  resolvedBy: String,                // Admin userId who resolved (nullable)
  resolvedByName: String,            // Admin name (denormalized, nullable)
  resolvedAt: Date,                  // Resolution timestamp (nullable)
  closedBy: String,                  // Admin userId who closed (nullable)
  closedByName: String,              // Admin name (denormalized, nullable)
  closedAt: Date,                    // Closure timestamp (nullable)
  reopenedCount: Number,             // Number of times reopened
  reopenedBy: String,                // Last reopened by userId (nullable)
  reopenedAt: Date,                  // Last reopened timestamp (nullable)
  customerSatisfaction: Number,      // Rating 1-5 (nullable)
  tags: [String],                    // Complaint tags
  metadata: {
    ipAddress: String,
    userAgent: String,
    platform: String,
    source: String                   // Web, Mobile, Email, etc.
  },
  createdAt: Date,
  updatedAt: Date,
  updatedBy: String                  // Last updated by userId
}
```

**Category Values:**
- `Product Quality`: Issues with product quality
- `Delivery Issue`: Delivery-related problems
- `Customer Service`: Customer service complaints
- `Payment Issue`: Payment-related issues
- `Other`: Other complaints

**Status Values:**
- `Open`: Newly created complaint
- `In Progress`: Being worked on
- `Resolved`: Resolution provided
- `Closed`: Complaint closed

**Priority Values:**
- `Low`: Low priority
- `Medium`: Medium priority
- `High`: High priority
- `Critical`: Critical issue

**Indexes:**
```javascript
// Unique index on complaintId
db.complaints.createIndex({ "complaintId": 1 }, { unique: true })

// Index on userId for customer's complaints
db.complaints.createIndex({ "userId": 1 })

// Index on customerId
db.complaints.createIndex({ "customerId": 1 })

// Index on orderId for order-linked complaints
db.complaints.createIndex({ "orderId": 1 })

// Index on status for filtering
db.complaints.createIndex({ "status": 1 })

// Index on category for filtering
db.complaints.createIndex({ "category": 1 })

// Index on priority for filtering
db.complaints.createIndex({ "priority": 1 })

// Index on assignedTo for admin's assigned complaints
db.complaints.createIndex({ "assignedTo": 1 })

// Index on createdAt for chronological queries
db.complaints.createIndex({ "createdAt": -1 })

// Compound index for open complaints by priority
db.complaints.createIndex({ "status": 1, "priority": -1 })

// Compound index for assigned complaints
db.complaints.createIndex({ "assignedTo": 1, "status": 1 })

// Text index for searching
db.complaints.createIndex({ 
  "complaintId": "text",
  "subject": "text",
  "description": "text",
  "customerEmail": "text",
  "customerName": "text"
})
```

**Validation Rules:**
- `complaintId`: Required, unique, format "CMP-YYYY-NNNNNN"
- `userId`: Required, must reference valid user
- `category`: Required, valid category value
- `subject`: Required, 5-200 characters
- `description`: Required, 20-2000 characters
- `status`: Required, valid status value, default "Open"
- `priority`: Required, valid priority value, default "Medium"

---

#### 2.2.2 complaint_comments Collection

**Purpose:** Store comments and communication on complaints

```javascript
{
  _id: ObjectId,
  complaintId: ObjectId,             // Reference to complaints._id
  complaintIdString: String,         // Denormalized complaint ID string
  userId: String,                    // Reference to Auth Service user._id
  userName: String,                  // User name (denormalized)
  userRole: String,                  // Customer or Administrator
  comment: String,                   // Comment text
  isInternal: Boolean,               // Admin-only comment (not visible to customer)
  attachments: [                     // Future enhancement
    {
      fileName: String,
      fileUrl: String,
      fileType: String,
      fileSize: Number
    }
  ],
  editedAt: Date,                    // Edit timestamp (nullable)
  deletedAt: Date,                   // Soft delete timestamp (nullable)
  createdAt: Date
}
```

**Indexes:**
```javascript
// Index on complaintId for fetching comments
db.complaint_comments.createIndex({ "complaintId": 1 })

// Index on userId for user's comments
db.complaint_comments.createIndex({ "userId": 1 })

// Index on createdAt for chronological order
db.complaint_comments.createIndex({ "createdAt": 1 })

// Compound index for complaint comments chronologically
db.complaint_comments.createIndex({ "complaintId": 1, "createdAt": 1 })

// Index on isInternal for filtering internal comments
db.complaint_comments.createIndex({ "isInternal": 1 })
```

**Validation Rules:**
- `complaintId`: Required, must reference valid complaint
- `userId`: Required, must reference valid user
- `comment`: Required, 1-2000 characters
- `isInternal`: Required, boolean, default false

---

#### 2.2.3 complaint_history Collection

**Purpose:** Audit trail for complaint status changes and actions

```javascript
{
  _id: ObjectId,
  complaintId: ObjectId,             // Reference to complaints._id
  complaintIdString: String,         // Denormalized complaint ID string
  action: String,                    // Action type
  previousStatus: String,            // Previous status (if status change)
  newStatus: String,                 // New status (if status change)
  previousAssignee: String,          // Previous assignee (if reassignment)
  newAssignee: String,               // New assignee (if reassignment)
  changedBy: String,                 // UserId who made the change
  changedByRole: String,             // Role of user
  changedByName: String,             // Name of user (denormalized)
  notes: String,                     // Change notes
  timestamp: Date,                   // When the change occurred
  metadata: {
    ipAddress: String,
    userAgent: String
  }
}
```

**Action Types:**
- `created`: Complaint created
- `status_changed`: Status updated
- `assigned`: Assigned to admin
- `reassigned`: Reassigned to another admin
- `unassigned`: Removed assignment
- `resolved`: Marked as resolved
- `reopened`: Reopened after resolution
- `closed`: Closed
- `commented`: Comment added
- `priority_changed`: Priority updated

**Indexes:**
```javascript
// Index on complaintId for history lookup
db.complaint_history.createIndex({ "complaintId": 1 })

// Index on timestamp for chronological queries
db.complaint_history.createIndex({ "timestamp": -1 })

// Compound index for complaint history chronologically
db.complaint_history.createIndex({ "complaintId": 1, "timestamp": -1 })

// Index on action for action-based queries
db.complaint_history.createIndex({ "action": 1 })
```

---

#### 2.2.4 complaint_assignments Collection

**Purpose:** Track complaint assignments to administrators

```javascript
{
  _id: ObjectId,
  complaintId: ObjectId,             // Reference to complaints._id
  complaintIdString: String,         // Denormalized complaint ID string
  assignedTo: String,                // Admin userId
  assignedToName: String,            // Admin name (denormalized)
  assignedBy: String,                // Admin userId who assigned
  assignedByName: String,            // Admin name (denormalized)
  assignedAt: Date,                  // Assignment timestamp
  unassignedAt: Date,                // Unassignment timestamp (nullable)
  unassignedBy: String,              // Admin userId who unassigned (nullable)
  notes: String,                     // Assignment notes
  isActive: Boolean                  // Current assignment status
}
```

**Indexes:**
```javascript
// Index on complaintId
db.complaint_assignments.createIndex({ "complaintId": 1 })

// Index on assignedTo for admin's assignments
db.complaint_assignments.createIndex({ "assignedTo": 1 })

// Index on isActive for active assignments
db.complaint_assignments.createIndex({ "isActive": 1 })

// Compound index for active assignments by admin
db.complaint_assignments.createIndex({ "assignedTo": 1, "isActive": 1 })
```

---

## 3. API Endpoints

### 3.1 Customer Endpoints

#### 3.1.1 Create Complaint
- **Endpoint:** `POST /api/complaints`
- **Description:** Register a new complaint (order-linked or general)
- **Authentication:** JWT Access Token
- **Authorization:** Customer, Administrator

#### 3.1.2 Get My Complaints
- **Endpoint:** `GET /api/complaints/me`
- **Description:** Get authenticated customer's complaints
- **Authentication:** JWT Access Token
- **Authorization:** Customer, Administrator

#### 3.1.3 Get Complaint by ID
- **Endpoint:** `GET /api/complaints/{complaintId}`
- **Description:** Get detailed complaint information
- **Authentication:** JWT Access Token
- **Authorization:** Customer (own complaints), Administrator

#### 3.1.4 Add Comment to Complaint
- **Endpoint:** `POST /api/complaints/{complaintId}/comments`
- **Description:** Add comment to own complaint
- **Authentication:** JWT Access Token
- **Authorization:** Customer (own complaints), Administrator

#### 3.1.5 Get Complaint Comments
- **Endpoint:** `GET /api/complaints/{complaintId}/comments`
- **Description:** Get all comments on complaint
- **Authentication:** JWT Access Token
- **Authorization:** Customer (own complaints), Administrator

#### 3.1.6 Reopen Complaint
- **Endpoint:** `POST /api/complaints/{complaintId}/reopen`
- **Description:** Reopen resolved complaint
- **Authentication:** JWT Access Token
- **Authorization:** Customer (own complaints), Administrator

#### 3.1.7 Rate Resolution
- **Endpoint:** `POST /api/complaints/{complaintId}/rate`
- **Description:** Rate complaint resolution satisfaction
- **Authentication:** JWT Access Token
- **Authorization:** Customer (own complaints)

### 3.2 Admin Endpoints

#### 3.2.1 List All Complaints
- **Endpoint:** `GET /api/complaints`
- **Description:** Get paginated list of all complaints with filtering
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.2 Search Complaints
- **Endpoint:** `GET /api/complaints/search`
- **Description:** Search complaints by ID, subject, customer
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.3 Update Complaint
- **Endpoint:** `PUT /api/complaints/{complaintId}`
- **Description:** Update complaint details
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.4 Update Complaint Status
- **Endpoint:** `PATCH /api/complaints/{complaintId}/status`
- **Description:** Update complaint status
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.5 Update Complaint Priority
- **Endpoint:** `PATCH /api/complaints/{complaintId}/priority`
- **Description:** Update complaint priority
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.6 Assign Complaint
- **Endpoint:** `PATCH /api/complaints/{complaintId}/assign`
- **Description:** Assign complaint to admin
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.7 Resolve Complaint
- **Endpoint:** `POST /api/complaints/{complaintId}/resolve`
- **Description:** Mark complaint as resolved with resolution notes
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.8 Close Complaint
- **Endpoint:** `POST /api/complaints/{complaintId}/close`
- **Description:** Close complaint
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.9 Delete Complaint
- **Endpoint:** `DELETE /api/complaints/{complaintId}`
- **Description:** Permanently delete complaint
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.10 Get My Assigned Complaints
- **Endpoint:** `GET /api/complaints/assigned-to-me`
- **Description:** Get complaints assigned to authenticated admin
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

#### 3.2.11 Get Complaint Analytics
- **Endpoint:** `GET /api/complaints/analytics`
- **Description:** Get complaint statistics and analytics
- **Authentication:** JWT Access Token
- **Authorization:** Administrator

### 3.3 Internal Service Endpoints

#### 3.3.1 Get Complaints by Customer
- **Endpoint:** `GET /api/complaints/internal/customer/{customerId}`
- **Description:** Get complaints for specific customer
- **Authentication:** Service API Key
- **Authorization:** Internal services only

#### 3.3.2 Get Complaint Count by Customer
- **Endpoint:** `GET /api/complaints/internal/customer/{customerId}/count`
- **Description:** Get complaint counts for customer
- **Authentication:** Service API Key
- **Authorization:** Internal services only

---

## 4. Request and Response Structures

### 4.1 Create Complaint

**Request:**
```http
POST /api/complaints
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "orderId": "ORD-2026-001234",
  "category": "Product Quality",
  "subject": "Damaged product received",
  "description": "The wireless headphones arrived with visible scratches on both units. The packaging was also torn, suggesting damage during transit. I expected better quality control for a premium product.",
  "priority": "High"
}
```

**Validation Rules:**
- `orderId`: Optional, must be valid order if provided
- `category`: Required, valid category value
- `subject`: Required, 5-200 characters
- `description`: Required, 20-2000 characters
- `priority`: Optional, defaults to "Medium"

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Complaint registered successfully",
  "data": {
    "complaintId": "CMP-2026-001234",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "customerEmail": "john.doe@example.com",
    "customerName": "John Doe",
    "orderId": "ORD-2026-001234",
    "category": "Product Quality",
    "subject": "Damaged product received",
    "description": "The wireless headphones arrived with visible scratches...",
    "status": "Open",
    "priority": "High",
    "createdAt": "2026-01-25T16:00:00.000Z"
  }
}
```

**Note:** Upon complaint creation:
1. Confirmation email sent to customer
2. Notification email sent to admin team
3. Customer Service notified to update complaint count

---

### 4.2 Get My Complaints

**Request:**
```http
GET /api/complaints/me?page=1&limit=10&status=Open&category=Product Quality
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `status`: Filter by status
- `category`: Filter by category
- `sortBy`: Sort field (createdAt, priority)
- `sortOrder`: Sort direction (asc/desc)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Complaints retrieved successfully",
  "data": {
    "complaints": [
      {
        "complaintId": "CMP-2026-001234",
        "orderId": "ORD-2026-001234",
        "category": "Product Quality",
        "subject": "Damaged product received",
        "status": "Open",
        "priority": "High",
        "assignedToName": "Admin User",
        "createdAt": "2026-01-25T16:00:00.000Z",
        "updatedAt": "2026-01-25T16:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 12,
      "itemsPerPage": 10
    }
  }
}
```

---

### 4.3 Get Complaint by ID

**Request:**
```http
GET /api/complaints/CMP-2026-001234
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Complaint retrieved successfully",
  "data": {
    "complaintId": "CMP-2026-001234",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "customerEmail": "john.doe@example.com",
    "customerName": "John Doe",
    "orderId": "ORD-2026-001234",
    "category": "Product Quality",
    "subject": "Damaged product received",
    "description": "The wireless headphones arrived with visible scratches on both units...",
    "status": "Resolved",
    "priority": "High",
    "assignedTo": "65a1b2c3d4e5f6g7h8i9j0k9",
    "assignedToName": "Admin User",
    "assignedAt": "2026-01-25T16:30:00.000Z",
    "resolutionNotes": "Return approved and refund processed. Replacement order created.",
    "resolvedBy": "65a1b2c3d4e5f6g7h8i9j0k9",
    "resolvedByName": "Admin User",
    "resolvedAt": "2026-01-26T10:00:00.000Z",
    "customerSatisfaction": 5,
    "reopenedCount": 0,
    "tags": ["product-damage", "high-priority"],
    "createdAt": "2026-01-25T16:00:00.000Z",
    "updatedAt": "2026-01-26T10:00:00.000Z"
  }
}
```

---

### 4.4 Add Comment to Complaint

**Request:**
```http
POST /api/complaints/CMP-2026-001234/comments
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "comment": "Thank you for the quick response. When can I expect the replacement?",
  "isInternal": false
}
```

**Validation Rules:**
- `comment`: Required, 1-2000 characters
- `isInternal`: Optional, boolean (only admins can set to true)

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "commentId": "65a1b2c3d4e5f6g7h8i9j0k7",
    "complaintId": "CMP-2026-001234",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "userName": "John Doe",
    "userRole": "Customer",
    "comment": "Thank you for the quick response. When can I expect the replacement?",
    "isInternal": false,
    "createdAt": "2026-01-26T11:00:00.000Z"
  }
}
```

---

### 4.5 Assign Complaint (Admin)

**Request:**
```http
PATCH /api/complaints/CMP-2026-001234/assign
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "assignTo": "65a1b2c3d4e5f6g7h8i9j0k9",
  "notes": "Assigning to product quality specialist"
}
```

**Validation Rules:**
- `assignTo`: Required, must be valid admin user ID
- `notes`: Optional, max 500 characters

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Complaint assigned successfully",
  "data": {
    "complaintId": "CMP-2026-001234",
    "assignedTo": "65a1b2c3d4e5f6g7h8i9j0k9",
    "assignedToName": "Admin User",
    "assignedBy": "65a1b2c3d4e5f6g7h8i9j0k8",
    "assignedAt": "2026-01-25T16:30:00.000Z"
  }
}
```

---

### 4.6 Resolve Complaint (Admin)

**Request:**
```http
POST /api/complaints/CMP-2026-001234/resolve
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "resolutionNotes": "Return approved and full refund processed. Replacement order ORD-2026-001500 created and will be shipped within 2 business days.",
  "tags": ["refund-processed", "replacement-sent"]
}
```

**Validation Rules:**
- `resolutionNotes`: Required, 20-2000 characters
- `tags`: Optional, array of strings

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Complaint resolved successfully",
  "data": {
    "complaintId": "CMP-2026-001234",
    "status": "Resolved",
    "resolutionNotes": "Return approved and full refund processed...",
    "resolvedBy": "65a1b2c3d4e5f6g7h8i9j0k9",
    "resolvedByName": "Admin User",
    "resolvedAt": "2026-01-26T10:00:00.000Z"
  }
}
```

---

### 4.7 Reopen Complaint

**Request:**
```http
POST /api/complaints/CMP-2026-001234/reopen
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "reason": "The replacement order has not arrived yet, and it's been 5 days."
}
```

**Validation Rules:**
- `reason`: Required, 10-500 characters
- Complaint must be in "Resolved" status

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Complaint reopened successfully",
  "data": {
    "complaintId": "CMP-2026-001234",
    "status": "Open",
    "reopenedCount": 1,
    "reopenedBy": "65a1b2c3d4e5f6g7h8i9j0k1",
    "reopenedAt": "2026-01-28T14:00:00.000Z"
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
| 201 | Created | Complaint/comment created |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Invalid token |
| 403 | Forbidden | Accessing other's complaints |
| 404 | Not Found | Complaint not found |
| 500 | Internal Server Error | Server errors |
| 502 | Bad Gateway | External service unavailable |

---

## 6. Technology Stack Details

### 6.1 Core Dependencies

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
motor==3.3.2
pydantic==2.5.3
python-jose[cryptography]==3.3.0
httpx==0.26.0
python-dotenv==1.0.0
aiosmtplib==3.0.1
jinja2==3.1.2
```

### 6.2 Environment Variables

```env
ENVIRONMENT=development
SERVICE_NAME=complaint-service
PORT=8003
MONGODB_URI=mongodb://admin:password@localhost:27017/complaint_db?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
AUTH_SERVICE_URL=http://localhost:3001
CUSTOMER_SERVICE_URL=http://localhost:8001
ORDER_SERVICE_URL=http://localhost:8002
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
COMPLAINT_ID_PREFIX=CMP
CORS_ORIGINS=["http://localhost:3000"]
LOG_LEVEL=INFO
```

---

## 7. Service Dependencies

### 7.1 External Services

| Service | Purpose |
|---------|---------|
| Auth Service | User validation |
| Customer Service | Update complaint statistics |
| Order Service | Fetch order details for linked complaints |
| Email Service | Complaint notifications |

---

## 8. Recommended Phased Implementation

### Phase 1: Setup & Models (Days 1-2)
- Project setup, database models, indexes

### Phase 2: Authentication (Days 3-4)
- JWT middleware, service clients

### Phase 3: Complaint Creation (Days 5-7)
- Create complaint endpoint, validation, order linking

### Phase 4: Complaint Retrieval (Days 8-9)
- List complaints, get by ID, filtering

### Phase 5: Comments System (Days 10-11)
- Add comments, get comments, internal comments

### Phase 6: Admin Assignment (Days 12-13)
- Assign complaints, reassign, unassign

### Phase 7: Resolution Workflow (Days 14-16)
- Resolve, reopen, close complaints

### Phase 8: Admin Features (Days 17-19)
- Status updates, priority updates, analytics

### Phase 9: Email Integration (Days 20-21)
- Email templates, notifications

### Phase 10: Production Readiness (Days 22-24)
- Logging, optimization, documentation

---

## 9. Testing Checklist

- [ ] Complaint creation (order-linked and general)
- [ ] Complaint retrieval and filtering
- [ ] Comment addition
- [ ] Complaint assignment
- [ ] Resolution workflow
- [ ] Reopen functionality
- [ ] Email notifications
- [ ] Service integrations

---

**End of Document**

**Prepared By:** Ramkumar  
**Client:** R-MAN Corporation, Bangalore  
**Service:** Complaint Management Service (CMPS)
