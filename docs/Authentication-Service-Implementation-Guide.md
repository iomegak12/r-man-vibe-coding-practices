# Authentication Service (ATHS) - Implementation Guide
## E-Commerce Customer Management System

**Document Version:** 1.0  
**Date:** January 25, 2026  
**Service Name:** Authentication Service (ATHS)  
**Technology:** Node.js + Express.js  
**Port:** 3001  
**Client:** R-MAN Corporation, Bangalore  
**Prepared By:** Ramkumar

---

## 1. Service Overview

The Authentication Service (ATHS) is the centralized authentication and user management microservice built with Node.js and Express.js. It handles user registration, authentication, JWT token management, user profiles, and password management for the E-Commerce Customer Management System.

**Key Responsibilities:**
- User registration and validation
- User authentication (login/logout)
- JWT access token and refresh token management
- Password management (change, reset, forgot password)
- User profile management
- Role-based access control (Customer/Administrator)
- Token validation for other services

---

## 2. Database Schema

### 2.1 Database Name
`auth_db`

### 2.2 Collections

#### 2.2.1 users Collection

**Purpose:** Store user credentials, profile information, and account settings

```javascript
{
  _id: ObjectId,
  email: String,              // Unique, indexed
  password: String,           // Hashed with bcrypt
  fullName: String,
  contactNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  role: String,               // "Customer" or "Administrator"
  isActive: Boolean,          // Account activation status
  emailVerified: Boolean,     // Email verification status
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
// Unique index on email
db.users.createIndex({ "email": 1 }, { unique: true })

// Index on role for admin queries
db.users.createIndex({ "role": 1 })

// Index on isActive for filtering active users
db.users.createIndex({ "isActive": 1 })

// Compound index for active users by role
db.users.createIndex({ "isActive": 1, "role": 1 })
```

**Validation Rules:**
- `email`: Required, unique, valid email format, max 255 characters
- `password`: Required, minimum 8 characters, hashed before storage
- `fullName`: Required, 2-100 characters
- `contactNumber`: Optional, 10-15 characters
- `role`: Required, enum ["Customer", "Administrator"], default "Customer"
- `isActive`: Required, boolean, default true
- `emailVerified`: Required, boolean, default false

---

#### 2.2.2 refresh_tokens Collection

**Purpose:** Store refresh tokens for token renewal without re-authentication

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to users._id
  token: String,              // Hashed refresh token
  expiresAt: Date,            // Token expiration timestamp
  isRevoked: Boolean,         // Token revocation status
  createdAt: Date
}
```

**Indexes:**
```javascript
// Index on userId for user lookup
db.refresh_tokens.createIndex({ "userId": 1 })

// Index on token for validation
db.refresh_tokens.createIndex({ "token": 1 })

// TTL index to auto-delete expired tokens
db.refresh_tokens.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })

// Compound index for active tokens
db.refresh_tokens.createIndex({ "userId": 1, "isRevoked": 1 })
```

**Validation Rules:**
- `userId`: Required, must reference valid user
- `token`: Required, unique, hashed
- `expiresAt`: Required, must be future date
- `isRevoked`: Required, boolean, default false

---

#### 2.2.3 password_resets Collection

**Purpose:** Store password reset tokens for forgot password functionality

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to users._id
  email: String,              // Denormalized for quick lookup
  resetToken: String,         // Hashed reset token
  expiresAt: Date,            // Token expiration (typically 1 hour)
  used: Boolean,              // Token usage status
  createdAt: Date
}
```

**Indexes:**
```javascript
// Index on userId
db.password_resets.createIndex({ "userId": 1 })

// Index on resetToken for validation
db.password_resets.createIndex({ "resetToken": 1 })

// Index on email for lookup
db.password_resets.createIndex({ "email": 1 })

// TTL index to auto-delete old reset tokens
db.password_resets.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
```

**Validation Rules:**
- `userId`: Required, must reference valid user
- `email`: Required, valid email format
- `resetToken`: Required, unique, hashed
- `expiresAt`: Required, typically current time + 1 hour
- `used`: Required, boolean, default false

---

## 3. API Endpoints

### 3.1 Public Endpoints (No Authentication Required)

#### 3.1.1 User Registration
- **Endpoint:** `POST /api/auth/register`
- **Description:** Register a new user account
- **Authentication:** None
- **Authorization:** None

#### 3.1.2 User Login
- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticate user and generate JWT tokens
- **Authentication:** None
- **Authorization:** None

#### 3.1.3 Refresh Access Token
- **Endpoint:** `POST /api/auth/refresh-token`
- **Description:** Generate new access token using refresh token
- **Authentication:** Refresh Token
- **Authorization:** None

#### 3.1.4 Forgot Password
- **Endpoint:** `POST /api/auth/forgot-password`
- **Description:** Request password reset link via email
- **Authentication:** None
- **Authorization:** None

#### 3.1.5 Reset Password
- **Endpoint:** `POST /api/auth/reset-password`
- **Description:** Reset password using reset token
- **Authentication:** Reset Token
- **Authorization:** None

### 3.2 Protected Endpoints (Authentication Required)

#### 3.2.1 User Logout
- **Endpoint:** `POST /api/auth/logout`
- **Description:** Logout user and revoke refresh token
- **Authentication:** JWT Access Token
- **Authorization:** Customer, Administrator

#### 3.2.2 Get User Profile
- **Endpoint:** `GET /api/auth/profile`
- **Description:** Get authenticated user's profile information
- **Authentication:** JWT Access Token
- **Authorization:** Customer, Administrator

#### 3.2.3 Update User Profile
- **Endpoint:** `PUT /api/auth/profile`
- **Description:** Update user profile information (name, contact, address)
- **Authentication:** JWT Access Token
- **Authorization:** Customer, Administrator

#### 3.2.4 Change Password
- **Endpoint:** `PUT /api/auth/change-password`
- **Description:** Change user password (requires current password)
- **Authentication:** JWT Access Token
- **Authorization:** Customer, Administrator

#### 3.2.5 Delete Account
- **Endpoint:** `DELETE /api/auth/account`
- **Description:** Delete user account (soft delete - set isActive to false)
- **Authentication:** JWT Access Token
- **Authorization:** Customer, Administrator

### 3.3 Internal Service Endpoints (For Microservice Communication)

#### 3.3.1 Validate Token
- **Endpoint:** `POST /api/auth/validate-token`
- **Description:** Validate JWT token and return user information
- **Authentication:** Service API Key or JWT Token
- **Authorization:** Internal services only

#### 3.3.2 Get User by ID
- **Endpoint:** `GET /api/auth/user/:userId`
- **Description:** Get user details by user ID (for other services)
- **Authentication:** Service API Key or JWT Token
- **Authorization:** Internal services only

#### 3.3.3 Get User by Email
- **Endpoint:** `GET /api/auth/user/email/:email`
- **Description:** Get user details by email (for other services)
- **Authentication:** Service API Key or JWT Token
- **Authorization:** Internal services only

---

## 4. Request and Response Structures

### 4.1 User Registration

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "contactNumber": "+919876543210",
  "address": {
    "street": "123 Main Street",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipCode": "560001",
    "country": "India"
  }
}
```

**Validation Rules:**
- `email`: Required, valid email format, unique, max 255 chars
- `password`: Required, min 8 chars, must contain uppercase, lowercase, number
- `fullName`: Required, 2-100 chars
- `contactNumber`: Optional, 10-15 chars
- `address`: Optional object

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "data": {
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "role": "Customer",
    "emailVerified": false,
    "createdAt": "2026-01-25T10:30:00.000Z"
  }
}
```

**Error Responses:**
```json
// 400 Bad Request - Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}

// 409 Conflict - Email Already Exists
{
  "success": false,
  "message": "Email already registered",
  "errors": [
    {
      "field": "email",
      "message": "A user with this email already exists"
    }
  ]
}
```

---

### 4.2 User Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "email": "john.doe@example.com",
      "fullName": "John Doe",
      "role": "Customer",
      "isActive": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 1800
    }
  }
}
```

**Error Responses:**
```json
// 401 Unauthorized - Invalid Credentials
{
  "success": false,
  "message": "Invalid email or password",
  "errors": [
    {
      "field": "credentials",
      "message": "The email or password you entered is incorrect"
    }
  ]
}

// 403 Forbidden - Account Deactivated
{
  "success": false,
  "message": "Account is deactivated",
  "errors": [
    {
      "field": "account",
      "message": "Your account has been deactivated. Please contact support."
    }
  ]
}
```

---

### 4.3 Refresh Access Token

**Request:**
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules:**
- `refreshToken`: Required, valid JWT format

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 1800
  }
}
```

**Error Responses:**
```json
// 401 Unauthorized - Invalid/Expired Refresh Token
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "errors": [
    {
      "field": "refreshToken",
      "message": "Please login again to continue"
    }
  ]
}
```

---

### 4.4 Get User Profile

**Request:**
```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "contactNumber": "+919876543210",
    "address": {
      "street": "123 Main Street",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipCode": "560001",
      "country": "India"
    },
    "role": "Customer",
    "isActive": true,
    "emailVerified": true,
    "createdAt": "2026-01-25T10:30:00.000Z",
    "updatedAt": "2026-01-25T10:30:00.000Z"
  }
}
```

---

### 4.5 Update User Profile

**Request:**
```http
PUT /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "fullName": "John M. Doe",
  "contactNumber": "+919876543211",
  "address": {
    "street": "456 New Street",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipCode": "560002",
    "country": "India"
  }
}
```

**Validation Rules:**
- `fullName`: Optional, 2-100 chars
- `contactNumber`: Optional, 10-15 chars
- `address`: Optional object
- Note: Email cannot be updated

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "john.doe@example.com",
    "fullName": "John M. Doe",
    "contactNumber": "+919876543211",
    "address": {
      "street": "456 New Street",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipCode": "560002",
      "country": "India"
    },
    "updatedAt": "2026-01-25T15:45:00.000Z"
  }
}
```

---

### 4.6 Change Password

**Request:**
```http
PUT /api/auth/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Validation Rules:**
- `currentPassword`: Required
- `newPassword`: Required, min 8 chars, must contain uppercase, lowercase, number
- `confirmPassword`: Required, must match newPassword

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "updatedAt": "2026-01-25T16:00:00.000Z"
  }
}
```

**Error Responses:**
```json
// 401 Unauthorized - Incorrect Current Password
{
  "success": false,
  "message": "Current password is incorrect",
  "errors": [
    {
      "field": "currentPassword",
      "message": "The current password you entered is incorrect"
    }
  ]
}

// 400 Bad Request - Password Mismatch
{
  "success": false,
  "message": "Passwords do not match",
  "errors": [
    {
      "field": "confirmPassword",
      "message": "New password and confirm password must match"
    }
  ]
}
```

---

### 4.7 Forgot Password

**Request:**
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email",
  "data": {
    "email": "john.doe@example.com",
    "resetTokenExpiry": "2026-01-25T12:30:00.000Z"
  }
}
```

**Note:** For security, return success even if email doesn't exist

---

### 4.8 Reset Password

**Request:**
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "resetToken": "abc123def456ghi789",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password.",
  "data": {
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1"
  }
}
```

**Error Responses:**
```json
// 400 Bad Request - Invalid/Expired Token
{
  "success": false,
  "message": "Invalid or expired reset token",
  "errors": [
    {
      "field": "resetToken",
      "message": "This reset link is invalid or has expired. Please request a new one."
    }
  ]
}
```

---

### 4.9 Logout

**Request:**
```http
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

### 4.10 Validate Token (Internal)

**Request:**
```http
POST /api/auth/validate-token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "john.doe@example.com",
    "role": "Customer",
    "isActive": true
  }
}
```

---

### 4.11 Get User by ID (Internal)

**Request:**
```http
GET /api/auth/user/65a1b2c3d4e5f6g7h8i9j0k1
Authorization: Bearer <service-token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "contactNumber": "+919876543210",
    "role": "Customer",
    "isActive": true
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
| 200 | OK | Successful GET, PUT, POST operations |
| 201 | Created | Successful user registration |
| 400 | Bad Request | Validation errors, malformed requests |
| 401 | Unauthorized | Invalid credentials, expired/invalid tokens |
| 403 | Forbidden | Account deactivated, insufficient permissions |
| 404 | Not Found | User not found |
| 409 | Conflict | Email already exists |
| 422 | Unprocessable Entity | Business logic validation failures |
| 500 | Internal Server Error | Server errors, database errors |
| 503 | Service Unavailable | Database connection issues, external service failures |

### 5.3 Common Error Messages

#### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    },
    {
      "field": "fullName",
      "message": "Full name must be between 2 and 100 characters"
    }
  ]
}
```

#### Authentication Errors (401)
```json
{
  "success": false,
  "message": "Authentication failed",
  "errors": [
    {
      "field": "token",
      "message": "No authentication token provided"
    }
  ]
}

{
  "success": false,
  "message": "Invalid or expired token",
  "errors": [
    {
      "field": "token",
      "message": "Your session has expired. Please login again."
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
      "message": "You do not have permission to access this resource"
    }
  ]
}
```

#### Resource Not Found (404)
```json
{
  "success": false,
  "message": "User not found",
  "errors": [
    {
      "field": "userId",
      "message": "No user exists with the provided ID"
    }
  ]
}
```

#### Server Errors (500)
```json
{
  "success": false,
  "message": "Internal server error",
  "errors": [
    {
      "field": "server",
      "message": "An unexpected error occurred. Please try again later."
    }
  ]
}
```

---

## 6. Technology Stack Details

### 6.1 Core Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "joi": "^17.11.0",
    "nodemailer": "^6.9.7",
    "uuid": "^9.0.1",
    "express-async-errors": "^3.1.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1"
  }
}
```

### 6.2 Technology Descriptions

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| Express.js | 4.18+ | Web framework for building REST APIs |
| Mongoose | 8.0+ | MongoDB ODM for schema modeling and queries |
| jsonwebtoken | 9.0+ | JWT token generation and verification |
| bcrypt | 5.1+ | Password hashing and comparison |
| dotenv | 16.3+ | Environment variable management |
| cors | 2.8+ | Cross-origin resource sharing middleware |
| helmet | 7.1+ | Security middleware for HTTP headers |
| express-rate-limit | 7.1+ | Rate limiting middleware to prevent abuse |
| joi | 17.11+ | Schema validation for request data |
| nodemailer | 6.9+ | Email sending functionality |
| uuid | 9.0+ | Generate unique identifiers |
| express-async-errors | 3.1+ | Handle async errors in Express routes |

### 6.3 Environment Variables

Create a `.env` file in the service root:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
API_VERSION=v1

# MongoDB Configuration
MONGODB_URI=mongodb://admin:password@localhost:27017/auth_db?authSource=admin
MONGODB_TEST_URI=mongodb://admin:password@localhost:27017/auth_db_test?authSource=admin

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_ACCESS_TOKEN_EXPIRATION=30m
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=12

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@rman-ecommerce.com
EMAIL_FROM_NAME=R-MAN E-Commerce

# Password Reset Configuration
PASSWORD_RESET_TOKEN_EXPIRATION=1h
PASSWORD_RESET_URL=http://localhost:3000/reset-password

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Service-to-Service Communication
SERVICE_API_KEY=your_internal_service_api_key_change_this

# Logging
LOG_LEVEL=info
```

### 6.4 Project Structure

```
auth-service/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── email.js             # Email service configuration
│   │   └── jwt.js               # JWT configuration
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── RefreshToken.js      # Refresh token model
│   │   └── PasswordReset.js     # Password reset model
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User management logic
│   │   └── internalController.js # Internal service endpoints
│   ├── routes/
│   │   ├── authRoutes.js        # Auth routes
│   │   ├── userRoutes.js        # User routes
│   │   └── internalRoutes.js    # Internal service routes
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT validation
│   │   ├── roleMiddleware.js    # Role-based authorization
│   │   ├── validationMiddleware.js # Request validation
│   │   ├── errorMiddleware.js   # Error handling
│   │   └── rateLimitMiddleware.js # Rate limiting
│   ├── validators/
│   │   ├── authValidators.js    # Auth request validators
│   │   └── userValidators.js    # User request validators
│   ├── services/
│   │   ├── authService.js       # Business logic for auth
│   │   ├── tokenService.js      # Token generation/validation
│   │   ├── emailService.js      # Email sending
│   │   └── passwordService.js   # Password hashing/validation
│   ├── utils/
│   │   ├── logger.js            # Logging utility
│   │   ├── responseHandler.js   # Standard response formatter
│   │   └── errorHandler.js      # Error handler utility
│   └── app.js                   # Express app setup
├── server.js                    # Entry point
├── .env                         # Environment variables
├── .env.example                 # Example environment file
├── .gitignore
├── package.json
├── package-lock.json
├── Dockerfile
└── README.md
```

---

## 7. Service Dependencies

### 7.1 External Services

| Service | Purpose | Endpoint/Configuration |
|---------|---------|----------------------|
| MongoDB | Database | `mongodb://localhost:27017/auth_db` |
| Gmail SMTP | Email notifications | `smtp.gmail.com:587` |

### 7.2 Consumed by Services

The Authentication Service is consumed by:
- **Customer Service**: User validation and profile information
- **Order Service**: User validation and customer details
- **Complaint Service**: User validation and customer details
- **Web Application**: User authentication and profile management
- **Mobile Application**: User authentication and profile management

### 7.3 Service Communication Pattern

**Outbound Calls:** None (Auth Service doesn't call other microservices)

**Inbound Calls:**
- Other services call Auth Service for user validation
- Services use `/api/auth/validate-token` to verify JWT tokens
- Services use `/api/auth/user/:userId` to fetch user details

---

## 8. Recommended Phased Implementation

### Phase 1: Setup & Database Models (Days 1-2)

**Objectives:**
- Set up Node.js project structure
- Configure MongoDB connection
- Create database models (User, RefreshToken, PasswordReset)
- Set up environment configuration

**Tasks:**
1. Initialize Node.js project with `npm init`
2. Install core dependencies
3. Create project folder structure
4. Set up database connection with Mongoose
5. Create User, RefreshToken, and PasswordReset models
6. Configure environment variables (.env)
7. Set up basic Express server
8. Test database connection

**Deliverables:**
- ✅ Working database connection
- ✅ Mongoose models with validation
- ✅ Database indexes created
- ✅ Basic Express server running on port 3001

---

### Phase 2: Core Authentication APIs (Days 3-5)

**Objectives:**
- Implement user registration
- Implement user login
- Implement JWT token generation
- Implement token refresh functionality

**Tasks:**
1. Create authentication validators (Joi schemas)
2. Implement password hashing service with bcrypt
3. Implement JWT token generation service
4. Create registration endpoint with validation
5. Create login endpoint with credentials verification
6. Create refresh token endpoint
7. Implement token validation middleware
8. Add error handling middleware
9. Test all authentication endpoints

**Deliverables:**
- ✅ POST /api/auth/register
- ✅ POST /api/auth/login
- ✅ POST /api/auth/refresh-token
- ✅ JWT middleware for protected routes
- ✅ Proper error responses

---

### Phase 3: Profile Management (Days 6-7)

**Objectives:**
- Implement user profile retrieval
- Implement profile update functionality
- Implement password change functionality
- Implement logout functionality

**Tasks:**
1. Create user profile validators
2. Implement GET /api/auth/profile endpoint
3. Implement PUT /api/auth/profile endpoint
4. Implement PUT /api/auth/change-password endpoint
5. Implement POST /api/auth/logout endpoint
6. Add authorization checks (user can only update own profile)
7. Test all profile management endpoints

**Deliverables:**
- ✅ GET /api/auth/profile
- ✅ PUT /api/auth/profile
- ✅ PUT /api/auth/change-password
- ✅ POST /api/auth/logout
- ✅ Role-based authorization middleware

---

### Phase 4: Password Reset Functionality (Days 8-9)

**Objectives:**
- Implement forgot password functionality
- Implement reset password functionality
- Integrate email service

**Tasks:**
1. Set up Nodemailer with Gmail configuration
2. Create email templates for password reset
3. Implement forgot password endpoint (generate reset token)
4. Implement reset password endpoint (validate token and update password)
5. Create email service for sending reset links
6. Add token expiration handling (1 hour)
7. Test password reset flow end-to-end

**Deliverables:**
- ✅ POST /api/auth/forgot-password
- ✅ POST /api/auth/reset-password
- ✅ Email service configured
- ✅ Password reset emails sent successfully

---

### Phase 5: Internal Service Endpoints (Days 10-11)

**Objectives:**
- Create endpoints for service-to-service communication
- Implement service authentication mechanism
- Enable other services to validate tokens and fetch user data

**Tasks:**
1. Implement service API key authentication
2. Create POST /api/auth/validate-token endpoint
3. Create GET /api/auth/user/:userId endpoint
4. Create GET /api/auth/user/email/:email endpoint
5. Add internal service middleware
6. Document internal API usage for other services
7. Test internal endpoints with sample requests

**Deliverables:**
- ✅ POST /api/auth/validate-token
- ✅ GET /api/auth/user/:userId
- ✅ GET /api/auth/user/email/:email
- ✅ Service authentication mechanism
- ✅ Internal API documentation

---

### Phase 6: Security & Production Readiness (Days 12-14)

**Objectives:**
- Add security middleware
- Implement rate limiting
- Add comprehensive logging
- Perform security audit

**Tasks:**
1. Add Helmet middleware for security headers
2. Configure CORS properly
3. Implement rate limiting for all endpoints
4. Add request logging with Winston or Morgan
5. Implement comprehensive error logging
6. Add input sanitization
7. Security testing (test for common vulnerabilities)
8. Performance testing
9. Create API documentation (Swagger/Postman)
10. Write deployment guide

**Deliverables:**
- ✅ Security middleware configured
- ✅ Rate limiting active
- ✅ Comprehensive logging
- ✅ API documentation
- ✅ Deployment-ready service

---

### Phase 7: Testing & Email Integration (Days 15-16)

**Objectives:**
- Implement comprehensive email notifications
- Add registration confirmation emails
- Test all email flows

**Tasks:**
1. Create email templates (registration, password reset)
2. Send registration confirmation email
3. Send password reset email
4. Add email sending to background queue (optional)
5. Test all email flows
6. Handle email failures gracefully
7. Unit testing for critical functions
8. Integration testing for API endpoints

**Deliverables:**
- ✅ All email notifications working
- ✅ Email templates created
- ✅ Error handling for email failures
- ✅ Tests passing

---

### Phase 8: Account Management Features (Days 17-18)

**Objectives:**
- Implement account deletion
- Add account activation/deactivation
- Finalize all remaining features

**Tasks:**
1. Implement DELETE /api/auth/account endpoint
2. Add soft delete functionality (set isActive = false)
3. Prevent deactivated users from logging in
4. Add data cleanup for deleted accounts
5. Final end-to-end testing
6. Performance optimization
7. Code review and refactoring

**Deliverables:**
- ✅ DELETE /api/auth/account
- ✅ Account deactivation logic
- ✅ Complete Auth Service ready for deployment

---

## 9. Testing Checklist

### 9.1 Unit Tests
- [ ] User model validation
- [ ] Password hashing and comparison
- [ ] JWT token generation and verification
- [ ] Email service functions
- [ ] Validation schemas

### 9.2 Integration Tests
- [ ] User registration flow
- [ ] User login flow
- [ ] Token refresh flow
- [ ] Profile update flow
- [ ] Password change flow
- [ ] Forgot/reset password flow
- [ ] Logout flow
- [ ] Internal service endpoints

### 9.3 Security Tests
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting effectiveness
- [ ] Password strength enforcement
- [ ] Token expiration handling
- [ ] Unauthorized access prevention

---

## 10. Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB indexes created
- [ ] Security middleware enabled
- [ ] Rate limiting configured
- [ ] CORS settings properly configured
- [ ] Email service tested
- [ ] Logging configured
- [ ] Error handling tested
- [ ] API documentation completed
- [ ] Docker image built and tested
- [ ] Health check endpoint implemented

---

## 11. API Documentation

Use **Swagger/OpenAPI** for interactive API documentation.

**Install Swagger:**
```bash
npm install swagger-ui-express swagger-jsdoc
```

Access documentation at: `http://localhost:3001/api-docs`

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
**Service:** Authentication Service (ATHS)
