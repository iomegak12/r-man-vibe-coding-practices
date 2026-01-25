# Technical Architecture Document (TAD)
## E-Commerce Customer Management System

**Document Version:** 1.0  
**Date:** January 24, 2026  
**Project Name:** E-Commerce Customer Management, Orders & Complaints System  
**Client:** R-MAN Corporation, Bangalore  
**Prepared By:** Ramkumar

---

## 1. Executive Summary

This document outlines the technical architecture for the E-Commerce Customer Management System. The system follows a microservices architecture pattern with a Node.js-based authentication service and Python FastAPI-based business services, utilizing MongoDB for data persistence and React/React Native for client applications.

---

## 2. Architecture Overview

### 2.1 Architecture Style
**Microservices Architecture** - The system is decomposed into independently deployable services, each responsible for specific business capabilities.

### 2.2 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WebApp["React Web Application<br/>(Customer & Admin Portal)<br/>Port: 80"]
        MobileApp["React Native Mobile App<br/>(Customer & Admin Portal)"]
    end

    subgraph "Microservices Layer"
        AuthService["Auth Service<br/>(Node.js + Express)<br/>Port: 3001<br/><br/>• JWT Authentication<br/>• User Profiles<br/>• Settings<br/>• Token Management"]
        CustomerService["Customer Service<br/>(Python + FastAPI)<br/>Port: 8001<br/><br/>• Customer CRUD<br/>• Admin Management<br/>• Customer Search"]
        OrderService["Order Service<br/>(Python + FastAPI)<br/>Port: 8002<br/><br/>• Order Management<br/>• Order Tracking<br/>• Cancellation<br/>• Returns"]
        ComplaintService["Complaint Service<br/>(Python + FastAPI)<br/>Port: 8003<br/><br/>• Complaint Registration<br/>• Resolution<br/>• Tracking"]
    end

    subgraph "Database Layer - MongoDB Cluster (Development: Same Host)"
        AuthDB[("Auth DB<br/>(MongoDB)<br/><br/>Collections:<br/>• users<br/>• refresh_tokens<br/>• password_resets")]
        CustomerDB[("Customer DB<br/>(MongoDB)<br/><br/>Collections:<br/>• customers")]
        OrderDB[("Order DB<br/>(MongoDB)<br/><br/>Collections:<br/>• orders<br/>• order_items<br/>• order_history<br/>• return_requests")]
        ComplaintDB[("Complaint DB<br/>(MongoDB)<br/><br/>Collections:<br/>• complaints<br/>• complaint_comments<br/>• complaint_history<br/>• complaint_assignments")]
    end

    subgraph "External Services"
        EmailService["Google Email Services<br/>(Gmail API/SMTP)<br/><br/>• Registration emails<br/>• Order notifications<br/>• Complaint updates"]
    end

    %% Client to Services connections
    WebApp -->|"HTTPS/REST<br/>JWT Token"| AuthService
    WebApp -->|"HTTPS/REST<br/>JWT Token"| CustomerService
    WebApp -->|"HTTPS/REST<br/>JWT Token"| OrderService
    WebApp -->|"HTTPS/REST<br/>JWT Token"| ComplaintService
    
    MobileApp -->|"HTTPS/REST<br/>JWT Token"| AuthService
    MobileApp -->|"HTTPS/REST<br/>JWT Token"| CustomerService
    MobileApp -->|"HTTPS/REST<br/>JWT Token"| OrderService
    MobileApp -->|"HTTPS/REST<br/>JWT Token"| ComplaintService

    %% Service to Service connections (Synchronous REST)
    CustomerService -.->|"GET /api/auth/user/:userId<br/>Fetch User Info"| AuthService
    OrderService -.->|"GET /api/auth/user/:userId<br/>Fetch Customer Info"| AuthService
    ComplaintService -.->|"GET /api/auth/user/:userId<br/>Fetch Customer Info"| AuthService
    ComplaintService -.->|"GET /api/orders/:orderId<br/>Fetch Order Details"| OrderService

    %% Service to Database connections
    AuthService -->|"Read/Write"| AuthDB
    CustomerService -->|"Read/Write"| CustomerDB
    OrderService -->|"Read/Write"| OrderDB
    ComplaintService -->|"Read/Write"| ComplaintDB

    %% Email Service connections
    AuthService -->|"Send Emails<br/>• Registration<br/>• Password Reset"| EmailService
    OrderService -->|"Send Emails<br/>• Order Confirmation<br/>• Status Updates"| EmailService
    ComplaintService -->|"Send Emails<br/>• Complaint Registration<br/>• Resolution Updates"| EmailService

    %% Styling
    classDef clientStyle fill:#e1f5ff,stroke:#01579b,stroke-width:2px,color:#000
    classDef serviceStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
    classDef dbStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000
    classDef externalStyle fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#000
    
    class WebApp,MobileApp clientStyle
    class AuthService,CustomerService,OrderService,ComplaintService serviceStyle
    class AuthDB,CustomerDB,OrderDB,ComplaintDB dbStyle
    class EmailService externalStyle
```

### 2.3 Microservices Interaction Flow Diagram

```mermaid
sequenceDiagram
    participant Client as Client App<br/>(Web/Mobile)
    participant Auth as Auth Service<br/>(Node.js)
    participant Customer as Customer Service<br/>(FastAPI)
    participant Order as Order Service<br/>(FastAPI)
    participant Complaint as Complaint Service<br/>(FastAPI)
    participant AuthDB as Auth DB
    participant OrderDB as Order DB
    participant Email as Email Service

    %% Authentication Flow
    rect rgb(230, 245, 255)
        Note over Client,AuthDB: Authentication Flow
        Client->>+Auth: POST /api/auth/login<br/>{email, password}
        Auth->>+AuthDB: Query user credentials
        AuthDB-->>-Auth: User data
        Auth->>Auth: Validate password<br/>Generate JWT tokens
        Auth-->>-Client: {accessToken, refreshToken}
    end

    %% Order Placement Flow
    rect rgb(255, 243, 224)
        Note over Client,Email: Order Placement Flow
        Client->>+Order: POST /api/orders<br/>Authorization: Bearer {token}<br/>{orderData}
        Order->>Order: Validate JWT token
        Order->>+Auth: GET /api/auth/user/{userId}<br/>Fetch customer info
        Auth->>+AuthDB: Query user
        AuthDB-->>-Auth: User details
        Auth-->>-Order: Customer information
        Order->>+OrderDB: Create order
        OrderDB-->>-Order: Order created
        Order->>+Email: Send order confirmation
        Email-->>-Order: Email sent
        Order-->>-Client: {orderId, orderDetails}
    end

    %% Complaint Registration with Order Link
    rect rgb(232, 245, 233)
        Note over Client,Email: Complaint Registration Flow
        Client->>+Complaint: POST /api/complaints<br/>Authorization: Bearer {token}<br/>{complaintData, orderId}
        Complaint->>Complaint: Validate JWT token
        Complaint->>+Auth: GET /api/auth/user/{userId}<br/>Fetch customer info
        Auth-->>-Complaint: Customer information
        Complaint->>+Order: GET /api/orders/{orderId}<br/>Fetch order details
        Order-->>-Complaint: Order information
        Complaint->>+ComplaintDB: Create complaint
        ComplaintDB-->>-Complaint: Complaint created
        Complaint->>+Email: Send complaint confirmation
        Email-->>-Complaint: Email sent
        Complaint-->>-Client: {complaintId, complaintDetails}
    end

    %% Admin Operations Flow
    rect rgb(243, 229, 245)
        Note over Client,OrderDB: Admin Order Management
        Client->>+Order: PATCH /api/orders/{orderId}/status<br/>Authorization: Bearer {adminToken}<br/>{newStatus}
        Order->>Order: Validate JWT token<br/>Check admin role
        Order->>+OrderDB: Update order status<br/>Create history record
        OrderDB-->>-Order: Status updated
        Order->>+Email: Send status update to customer
        Email-->>-Order: Email sent
        Order-->>-Client: {updatedOrder}
    end
```

---

## 3. Microservices Architecture

### 3.1 Service Inventory

| Service Name | Technology | Port | Responsibility | Database |
|--------------|------------|------|----------------|----------|
| Auth Service | Node.js + Express | 3001 | Authentication, JWT token management, user profiles, user settings | auth_db |
| Customer Service | Python + FastAPI | 8001 | Customer management, CRUD operations, admin customer management | customer_db |
| Order Service | Python + FastAPI | 8002 | Order placement, tracking, cancellation, returns, order management | order_db |
| Complaint Service | Python + FastAPI | 8003 | Complaint registration, tracking, resolution, admin complaint management | complaint_db |

### 3.2 Service Descriptions

#### 3.2.1 Auth Service (Node.js)
**Purpose:** Centralized authentication and user management

**Responsibilities:**
- User registration and validation
- User authentication (login/logout)
- JWT token generation and validation
- Password management (reset, change)
- User profile management
- User settings and preferences
- Session management
- Role-based access control (Customer/Administrator)

**Key Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Token refresh
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation
- `GET /api/auth/validate-token` - Token validation (internal)
- `GET /api/auth/user/:userId` - Get user details (internal)

**Database Collections:**
- `users` - User credentials and profile information
- `refresh_tokens` - JWT refresh tokens
- `password_resets` - Password reset tokens

#### 3.2.2 Customer Service (Python FastAPI)
**Purpose:** Customer data and relationship management

**Responsibilities:**
- Customer CRUD operations
- Customer search and filtering
- Customer activation/deactivation
- Customer profile updates
- Admin customer management

**Key Endpoints:**
- `GET /api/customers` - List all customers (Admin)
- `GET /api/customers/search` - Search customers (Admin)
- `GET /api/customers/{customerId}` - Get customer details
- `PUT /api/customers/{customerId}` - Update customer
- `DELETE /api/customers/{customerId}` - Delete customer (Admin)
- `PATCH /api/customers/{customerId}/activate` - Activate customer (Admin)
- `PATCH /api/customers/{customerId}/deactivate` - Deactivate customer (Admin)
- `GET /api/customers/{customerId}/orders` - Get customer order history
- `GET /api/customers/{customerId}/complaints` - Get customer complaints

**Database Collections:**
- `customers` - Customer business data (references user from Auth Service)

**External Dependencies:**
- Auth Service - Validate tokens and fetch user information

#### 3.2.3 Order Service (Python FastAPI)
**Purpose:** Order lifecycle management

**Responsibilities:**
- Order creation and placement
- Order status management
- Order tracking and history
- Order cancellation
- Return request management
- Admin order management
- Order search and filtering

**Key Endpoints:**
- `POST /api/orders` - Create new order
- `GET /api/orders` - List all orders (Admin) or user's orders
- `GET /api/orders/{orderId}` - Get order details
- `PUT /api/orders/{orderId}` - Update order (Admin)
- `DELETE /api/orders/{orderId}` - Delete order (Admin)
- `PATCH /api/orders/{orderId}/status` - Update order status (Admin)
- `POST /api/orders/{orderId}/cancel` - Cancel order
- `POST /api/orders/{orderId}/return` - Request return
- `PATCH /api/orders/{orderId}/return/approve` - Approve return (Admin)
- `PATCH /api/orders/{orderId}/return/reject` - Reject return (Admin)
- `GET /api/orders/search` - Search orders
- `GET /api/orders/filter` - Filter orders by status/date

**Database Collections:**
- `orders` - Order information
- `order_items` - Order line items (products, quantities, prices)
- `order_history` - Order status change audit trail
- `return_requests` - Return request details

**External Dependencies:**
- Auth Service - Validate tokens and fetch customer information
- Email Service - Order confirmations and notifications

#### 3.2.4 Complaint Service (Python FastAPI)
**Purpose:** Customer complaint and issue resolution management

**Responsibilities:**
- Complaint registration
- Complaint tracking and status management
- Complaint resolution
- Admin complaint management
- Complaint assignment
- Comment and communication on complaints

**Key Endpoints:**
- `POST /api/complaints` - Register new complaint
- `GET /api/complaints` - List all complaints (Admin) or user's complaints
- `GET /api/complaints/{complaintId}` - Get complaint details
- `PUT /api/complaints/{complaintId}` - Update complaint (Admin)
- `DELETE /api/complaints/{complaintId}` - Delete complaint (Admin)
- `PATCH /api/complaints/{complaintId}/status` - Update complaint status (Admin)
- `POST /api/complaints/{complaintId}/comments` - Add comment to complaint
- `GET /api/complaints/{complaintId}/comments` - Get complaint comments
- `PATCH /api/complaints/{complaintId}/assign` - Assign complaint to admin
- `PATCH /api/complaints/{complaintId}/resolve` - Resolve complaint (Admin)
- `POST /api/complaints/{complaintId}/reopen` - Reopen complaint
- `GET /api/complaints/search` - Search complaints
- `GET /api/complaints/filter` - Filter complaints by status/category

**Database Collections:**
- `complaints` - Complaint information
- `complaint_comments` - Comments and communication thread
- `complaint_history` - Complaint status change audit trail
- `complaint_assignments` - Admin assignments

**External Dependencies:**
- Auth Service - Validate tokens and fetch customer information
- Order Service - Fetch order details when complaint is linked to an order
- Email Service - Complaint notifications and resolution updates

---

## 4. Technology Stack

### 4.1 Backend Services

#### Auth Service
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Validation:** Joi / express-validator
- **HTTP Client:** axios (for internal service calls)
- **Environment Management:** dotenv

#### Business Services (Customer, Order, Complaint)
- **Runtime:** Python 3.11+
- **Framework:** FastAPI
- **ODM:** Motor (async MongoDB driver) / Beanie (optional ODM)
- **Validation:** Pydantic
- **HTTP Client:** httpx (for calling Auth Service)
- **CORS:** fastapi-cors-middleware
- **Environment Management:** python-dotenv

### 4.2 Database
- **Database:** MongoDB 6.0+
- **Strategy:** Database per service
- **Connection:** Single MongoDB cluster/host (shared during development)
- **Indexing:** Appropriate indexes on frequently queried fields

### 4.3 Client Applications

#### Web Application
- **Framework:** React 18+
- **State Management:** Redux Toolkit / Context API
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **UI Components:** Material-UI / Ant Design / Tailwind CSS
- **Form Handling:** Formik / React Hook Form
- **Validation:** Yup / Zod

#### Mobile Application
- **Framework:** React Native
- **Navigation:** React Navigation
- **State Management:** Redux Toolkit / Context API
- **HTTP Client:** Axios
- **UI Components:** React Native Paper / Native Base
- **Form Handling:** Formik / React Hook Form

### 4.4 External Services
- **Email Service:** Google Email Services (Gmail API / SMTP)
- **Email Library (Node.js):** Nodemailer
- **Email Library (Python):** aiosmtplib / FastAPI-Mail

### 4.5 DevOps & Deployment
- **Containerization:** Docker
- **Container Orchestration:** Docker Compose (development) / Kubernetes (production)
- **Version Control:** Git
- **CI/CD:** (To be determined based on hosting platform)

---

## 5. Database Design Strategy

### 5.1 Database Per Service Pattern

Each microservice maintains its own database to ensure loose coupling and independent scalability.

#### 5.1.1 Auth Database (auth_db)

**Collections:**

**users**
```json
{
  "_id": "ObjectId",
  "email": "string (unique, indexed)",
  "password": "string (hashed)",
  "fullName": "string",
  "contactNumber": "string",
  "address": "string",
  "role": "string (Customer/Administrator)",
  "isActive": "boolean",
  "emailVerified": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

**refresh_tokens**
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "token": "string",
  "expiresAt": "datetime",
  "createdAt": "datetime"
}
```

**password_resets**
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "resetToken": "string",
  "expiresAt": "datetime",
  "used": "boolean",
  "createdAt": "datetime"
}
```

#### 5.1.2 Customer Database (customer_db)

**Collections:**

**customers**
```json
{
  "_id": "ObjectId",
  "userId": "string (reference to Auth Service user._id)",
  "email": "string (denormalized for quick access)",
  "fullName": "string (denormalized)",
  "totalOrders": "number",
  "totalComplaints": "number",
  "lastOrderDate": "datetime",
  "accountStatus": "string",
  "customerSince": "datetime",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

#### 5.1.3 Order Database (order_db)

**Collections:**

**orders**
```json
{
  "_id": "ObjectId",
  "orderId": "string (unique, indexed)",
  "userId": "string (reference to Auth Service user._id)",
  "customerId": "string (reference to Customer Service)",
  "customerEmail": "string (denormalized)",
  "deliveryAddress": "object {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
  }",
  "orderDate": "datetime",
  "status": "string (Placed/Processing/Shipped/Delivered/Cancelled/Return Requested/Returned)",
  "totalAmount": "number",
  "cancellationReason": "string (nullable)",
  "returnReason": "string (nullable)",
  "returnApproved": "boolean (nullable)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

**order_items**
```json
{
  "_id": "ObjectId",
  "orderId": "ObjectId (ref: orders)",
  "productId": "string",
  "productName": "string",
  "quantity": "number",
  "unitPrice": "number",
  "totalPrice": "number",
  "returnRequested": "boolean",
  "createdAt": "datetime"
}
```

**order_history**
```json
{
  "_id": "ObjectId",
  "orderId": "ObjectId (ref: orders)",
  "previousStatus": "string",
  "newStatus": "string",
  "changedBy": "string (userId)",
  "changedByRole": "string",
  "notes": "string",
  "timestamp": "datetime"
}
```

**return_requests**
```json
{
  "_id": "ObjectId",
  "orderId": "ObjectId (ref: orders)",
  "requestedBy": "string (userId)",
  "reason": "string",
  "status": "string (Pending/Approved/Rejected)",
  "approvedBy": "string (userId, nullable)",
  "approvalDate": "datetime (nullable)",
  "notes": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

#### 5.1.4 Complaint Database (complaint_db)

**Collections:**

**complaints**
```json
{
  "_id": "ObjectId",
  "complaintId": "string (unique, indexed)",
  "userId": "string (reference to Auth Service user._id)",
  "customerId": "string (reference to Customer Service)",
  "customerEmail": "string (denormalized)",
  "orderId": "string (nullable, reference to Order Service)",
  "category": "string (Product Quality/Delivery Issue/Customer Service/Payment Issue/Other)",
  "subject": "string",
  "description": "string",
  "status": "string (Open/In Progress/Resolved/Closed)",
  "assignedTo": "string (userId of admin, nullable)",
  "resolutionNotes": "string (nullable)",
  "resolvedBy": "string (userId, nullable)",
  "resolvedAt": "datetime (nullable)",
  "closedAt": "datetime (nullable)",
  "reopenedCount": "number",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

**complaint_comments**
```json
{
  "_id": "ObjectId",
  "complaintId": "ObjectId (ref: complaints)",
  "userId": "string (reference to Auth Service user._id)",
  "userRole": "string (Customer/Administrator)",
  "comment": "string",
  "isInternal": "boolean (admin-only comments)",
  "createdAt": "datetime"
}
```

**complaint_history**
```json
{
  "_id": "ObjectId",
  "complaintId": "ObjectId (ref: complaints)",
  "previousStatus": "string",
  "newStatus": "string",
  "changedBy": "string (userId)",
  "changedByRole": "string",
  "notes": "string",
  "timestamp": "datetime"
}
```

**complaint_assignments**
```json
{
  "_id": "ObjectId",
  "complaintId": "ObjectId (ref: complaints)",
  "assignedTo": "string (userId)",
  "assignedBy": "string (userId)",
  "assignedAt": "datetime",
  "unassignedAt": "datetime (nullable)"
}
```

### 5.2 Data Consistency Strategy

#### 5.2.1 Source of Truth
- **Auth Service** is the authoritative source for user data
- Other services store **denormalized** copies of essential user data (email, name) for performance
- Services call Auth Service when fresh user data is required

#### 5.2.2 Data Synchronization
- **Synchronous calls** to Auth Service for user validation and profile information
- Customer Service may periodically sync user data or call Auth Service on-demand

---

## 6. API Communication Patterns

### 6.1 Client-to-Service Communication

**Pattern:** Direct REST API calls over HTTPS

**Authentication Flow:**
1. Client calls `POST /api/auth/login` on Auth Service
2. Auth Service returns JWT access token and refresh token
3. Client stores tokens securely (httpOnly cookies / secure storage)
4. Client includes JWT token in `Authorization: Bearer <token>` header for all subsequent requests
5. Each service validates the JWT token (either by verifying signature or calling Auth Service)

**Request/Response Format:**
- Content-Type: `application/json`
- Standard HTTP status codes
- Consistent error response format

**Standard Response Format:**
```json
{
  "success": true/false,
  "data": { ... },
  "message": "string",
  "errors": [ ... ]
}
```

### 6.2 Service-to-Service Communication

**Pattern:** Synchronous HTTP/REST calls

**Use Cases:**
- Customer Service → Auth Service: Get user profile information
- Order Service → Auth Service: Validate user and get customer details
- Complaint Service → Auth Service: Validate user and get customer details
- Complaint Service → Order Service: Get order details when complaint is linked to order

**Authentication for Internal Calls:**
- Option 1: Service-to-service API keys
- Option 2: JWT token forwarding (pass user's token to downstream services)
- Option 3: Internal service tokens

**Retry & Resilience:**
- Implement retry logic with exponential backoff
- Circuit breaker pattern for failing services
- Fallback mechanisms where applicable

---

## 7. Authentication & Authorization

### 7.1 JWT Token Strategy

**Access Token:**
- **Expiration:** 15-30 minutes
- **Payload:** 
  ```json
  {
    "userId": "string",
    "email": "string",
    "role": "Customer/Administrator",
    "iat": "issued at timestamp",
    "exp": "expiration timestamp"
  }
  ```

**Refresh Token:**
- **Expiration:** 7-30 days
- **Storage:** Stored in database (refresh_tokens collection)
- **Usage:** Obtain new access token without re-login

### 7.2 Token Validation

**Option 1: Self-contained validation**
- Each service has the JWT secret
- Services validate token signature independently
- Fast but requires secret distribution

**Option 2: Auth Service validation**
- Services call Auth Service `GET /api/auth/validate-token`
- Centralized validation
- Single point of token revocation

**Recommendation:** Option 1 for performance, with token blacklisting for revocation

### 7.3 Role-Based Access Control (RBAC)

**Roles:**
- **Customer:** Can access own data, place orders, submit complaints
- **Administrator:** Full access to all operations and all customer data

**Implementation:**
- JWT token contains user role
- Each endpoint checks role before processing request
- Middleware/decorators for role-based authorization

**Authorization Checks:**
```javascript
// Pseudocode
if (endpoint.requiresAuth) {
  validateToken(request.token);
  if (endpoint.requiredRole === 'Administrator' && user.role !== 'Administrator') {
    return 403 Forbidden;
  }
  if (endpoint.resourceOwnerOnly && resource.userId !== user.userId) {
    return 403 Forbidden;
  }
}
```

---

## 8. Email Notification Service

### 8.1 Email Service Integration

**Provider:** Google Email Services (Gmail API / SMTP)

**Configuration:**
- **SMTP Settings:**
  - Host: smtp.gmail.com
  - Port: 587 (TLS) or 465 (SSL)
  - Authentication: OAuth2 or App Password
  
**Email Templates:**
- Registration confirmation
- Order confirmation
- Order status updates
- Complaint registration confirmation
- Complaint status updates
- Complaint resolution notification
- Password reset

### 8.2 Email Sending Pattern

**Approach:** Each service sends its own emails

**Implementation:**
- Auth Service: Registration, password reset emails
- Order Service: Order confirmation, status update emails
- Complaint Service: Complaint registration, resolution emails

**Email Queue (Future Enhancement):**
- Consider message queue (RabbitMQ/Redis) for asynchronous email sending
- Retry failed emails
- Email delivery tracking

---

## 9. Client Application Architecture

### 9.1 React Web Application

**Structure:**
```
src/
├── components/
│   ├── common/          # Reusable components
│   ├── customer/        # Customer-specific components
│   ├── admin/           # Admin-specific components
│   └── layout/          # Layout components
├── pages/
│   ├── auth/            # Login, register, password reset
│   ├── customer/        # Customer dashboard, orders, complaints
│   └── admin/           # Admin dashboard, management pages
├── services/
│   ├── authService.js   # Auth API calls
│   ├── customerService.js
│   ├── orderService.js
│   └── complaintService.js
├── store/               # Redux store (if using Redux)
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── routes/              # Route configuration
└── App.js
```

**Key Features:**
- **Protected Routes:** Redirect unauthenticated users to login
- **Role-Based Rendering:** Show different UI based on user role
- **Token Management:** Auto-refresh tokens before expiration
- **Error Handling:** Global error handling and user-friendly messages
- **Loading States:** Show loading indicators during API calls

### 9.2 React Native Mobile Application

**Structure:**
```
src/
├── components/
├── screens/
│   ├── auth/
│   ├── customer/
│   └── admin/
├── navigation/          # Navigation configuration
├── services/            # API services
├── store/               # State management
├── hooks/
├── utils/
└── App.js
```

**Key Features:**
- **Secure Storage:** Store tokens in secure device storage
- **Push Notifications:** (Future) for order/complaint updates
- **Offline Support:** (Future) basic offline capabilities
- **Platform-Specific UI:** iOS and Android optimizations

---

## 10. Deployment Architecture

### 10.1 Containerization

**Docker Containers:**
- `auth-service:latest` - Auth Service (Node.js)
- `customer-service:latest` - Customer Service (Python FastAPI)
- `order-service:latest` - Order Service (Python FastAPI)
- `complaint-service:latest` - Complaint Service (Python FastAPI)
- `mongodb:6.0` - MongoDB Database
- `web-app:latest` - React Web Application (served by Nginx)

### 10.2 Docker Compose (Development)

**docker-compose.yml**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: ecommerce-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

  auth-service:
    build: ./services/auth-service
    container_name: auth-service
    ports:
      - "3001:3001"
    depends_on:
      - mongodb
    environment:
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/auth_db?authSource=admin
      - JWT_SECRET=your_jwt_secret
      - JWT_EXPIRATION=30m
      - REFRESH_TOKEN_EXPIRATION=7d

  customer-service:
    build: ./services/customer-service
    container_name: customer-service
    ports:
      - "8001:8001"
    depends_on:
      - mongodb
      - auth-service
    environment:
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/customer_db?authSource=admin
      - AUTH_SERVICE_URL=http://auth-service:3001

  order-service:
    build: ./services/order-service
    container_name: order-service
    ports:
      - "8002:8002"
    depends_on:
      - mongodb
      - auth-service
    environment:
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/order_db?authSource=admin
      - AUTH_SERVICE_URL=http://auth-service:3001

  complaint-service:
    build: ./services/complaint-service
    container_name: complaint-service
    ports:
      - "8003:8003"
    depends_on:
      - mongodb
      - auth-service
      - order-service
    environment:
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/complaint_db?authSource=admin
      - AUTH_SERVICE_URL=http://auth-service:3001
      - ORDER_SERVICE_URL=http://order-service:8002

  web-app:
    build: ./clients/web-app
    container_name: web-app
    ports:
      - "80:80"
    depends_on:
      - auth-service
      - customer-service
      - order-service
      - complaint-service

volumes:
  mongodb_data:
```

### 10.3 Network Architecture

**Development:**
- All services on same Docker network
- MongoDB accessible to all services
- Services communicate via service names (Docker DNS)

**Production:**
- Separate networks for different layers (application, database)
- Network policies to restrict communication
- Load balancers in front of services

---

## 11. Security Considerations

### 11.1 Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt (salt rounds: 10-12)
- ✅ Role-based access control
- ✅ Token expiration and refresh mechanism

### 11.2 Data Security
- ✅ HTTPS/TLS for all client-server communication
- ✅ Environment variables for sensitive configuration
- ✅ No hardcoded secrets in code
- ✅ MongoDB authentication enabled

### 11.3 Input Validation
- ✅ Request validation on all endpoints
- ✅ Sanitize user inputs to prevent injection attacks
- ✅ Email format validation
- ✅ Password strength requirements

### 11.4 API Security
- ✅ CORS configuration to allow only trusted origins
- ✅ Rate limiting to prevent abuse (future enhancement)
- ✅ Request size limits
- ✅ Protection against common vulnerabilities (SQL injection, XSS, CSRF)

### 11.5 Database Security
- ✅ Database authentication
- ✅ Principle of least privilege for database users
- ✅ Regular backups
- ✅ Indexes on sensitive fields for performance

---

## 12. Non-Functional Requirements

### 12.1 Performance
- API response time: < 500ms for most endpoints
- Database queries optimized with appropriate indexes
- Connection pooling for database connections
- Caching strategy (future enhancement)

### 12.2 Scalability
- Horizontal scaling: Each service can be scaled independently
- Database sharding (future enhancement for large datasets)
- Load balancing across service instances

### 12.3 Availability
- Target uptime: 99.5% (development/staging), 99.9% (production goal)
- Health check endpoints for all services
- Graceful degradation when dependent services are unavailable

### 12.4 Maintainability
- Clean code practices
- Comprehensive API documentation (Swagger/OpenAPI)
- Logging and monitoring
- Version control with Git

### 12.5 Monitoring & Logging

**Logging Strategy:**
- Structured logging (JSON format)
- Log levels: DEBUG, INFO, WARN, ERROR
- Correlation IDs for request tracing across services
- Centralized logging (ELK stack / CloudWatch - future)

**Monitoring:**
- Service health checks
- API metrics (response times, error rates)
- Database connection pool monitoring
- Resource utilization (CPU, memory)

---

## 13. API Documentation Standards

### 13.1 OpenAPI/Swagger Documentation

All services will provide interactive API documentation:
- Auth Service: `http://localhost:3001/api-docs`
- Customer Service: `http://localhost:8001/docs`
- Order Service: `http://localhost:8002/docs`
- Complaint Service: `http://localhost:8003/docs`

### 13.2 API Versioning

**Strategy:** URL path versioning
- `/api/v1/auth/login`
- `/api/v1/customers`
- `/api/v1/orders`
- `/api/v1/complaints`

---

## 14. Development Workflow

### 14.1 Version Control
- **Repository Structure:**
  ```
  ecommerce-system/
  ├── services/
  │   ├── auth-service/
  │   ├── customer-service/
  │   ├── order-service/
  │   └── complaint-service/
  ├── clients/
  │   ├── web-app/
  │   └── mobile-app/
  ├── docs/
  ├── docker-compose.yml
  └── README.md
  ```

### 14.2 Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature development
- `bugfix/*` - Bug fixes
- `hotfix/*` - Production hotfixes

### 14.3 Local Development
1. Clone repository
2. Install dependencies for each service
3. Configure environment variables
4. Run `docker-compose up` to start all services
5. Access services on designated ports

---

## 15. Future Enhancements

### 15.1 Phase 2 Features
- API Gateway (Kong, AWS API Gateway) for centralized routing
- Message queue (RabbitMQ/Kafka) for asynchronous processing
- Event-driven architecture for service communication
- Caching layer (Redis) for frequently accessed data

### 15.2 Phase 3 Features
- Advanced analytics and reporting dashboards
- Real-time notifications (WebSockets/Server-Sent Events)
- Product catalog management
- Inventory management
- Payment gateway integration
- Shipping provider integration

### 15.3 DevOps Enhancements
- CI/CD pipelines (GitHub Actions, Jenkins, GitLab CI)
- Automated testing (unit, integration, e2e)
- Infrastructure as Code (Terraform, CloudFormation)
- Kubernetes deployment for production
- Service mesh (Istio) for advanced traffic management

---

## 16. Success Metrics

### 16.1 Technical Metrics
- API response time < 500ms
- System uptime > 99.5%
- Zero critical security vulnerabilities
- Code coverage > 80% (unit tests)

### 16.2 Business Metrics
- Successful user registrations
- Order completion rate
- Complaint resolution time
- Customer satisfaction with complaint resolution
- System adoption rate

---

## 17. Assumptions & Constraints

### 17.1 Assumptions
- All services will be containerized
- MongoDB host is shared during development phase
- Clients (web/mobile) directly call microservices (no API Gateway initially)
- Product data exists (product management is out of scope)
- Administrator accounts are pre-created

### 17.2 Constraints
- Development phase uses single MongoDB cluster
- No payment gateway integration in initial version
- No file/attachment upload for complaints
- Email sending may have Gmail API quota limits

---

## 18. Appendix

### 18.1 Technology Choices Rationale

**Why Node.js for Auth Service?**
- Excellent JWT library ecosystem
- Fast and efficient for I/O operations
- Large developer community
- Easy integration with various authentication strategies

**Why Python FastAPI for Business Services?**
- High performance (ASGI-based)
- Automatic API documentation (Swagger)
- Strong typing with Pydantic
- Async support for database operations
- Clean and maintainable code

**Why MongoDB?**
- Flexible schema for evolving requirements
- JSON-like document storage (aligns with REST APIs)
- Excellent horizontal scalability
- Rich query capabilities
- Good fit for microservices (database per service)

**Why React/React Native?**
- Code reuse between web and mobile
- Large ecosystem and community
- Component-based architecture
- Strong state management options
- Excellent developer tools

---

## 19. Glossary

| Term | Definition |
|------|------------|
| JWT | JSON Web Token - A compact, URL-safe means of representing claims to be transferred between two parties |
| ODM | Object Document Mapper - Similar to ORM but for document databases like MongoDB |
| RBAC | Role-Based Access Control - Access control paradigm based on user roles |
| CORS | Cross-Origin Resource Sharing - Mechanism to allow restricted resources to be requested from another domain |
| REST | Representational State Transfer - Architectural style for distributed hypermedia systems |
| FastAPI | Modern, fast web framework for building APIs with Python based on standard Python type hints |
| Microservices | Architectural style that structures an application as a collection of loosely coupled services |

---

## 20. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 24, 2026 | Ramkumar | Initial version |

---

**End of Document**

**Next Steps:**
1. Review and approve technical architecture
2. Create detailed service-specific documentation
3. Define detailed API contracts
4. Design database schemas with indexes
5. Set up development environment
6. Begin service implementation

---

**Prepared By:** Ramkumar  
**Client:** R-MAN Corporation, Bangalore  
**Project:** E-Commerce Customer Management System
