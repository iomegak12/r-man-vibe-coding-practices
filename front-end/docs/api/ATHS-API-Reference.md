# ATHS API Reference
## Authentication Service

**Base URL:** `http://localhost:5001` (Development)  
**Version:** 1.0  
**Last Updated:** January 28, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Endpoints](#authentication-endpoints)
3. [User Profile Endpoints](#user-profile-endpoints)
4. [Admin Endpoints](#admin-endpoints)
5. [Health Check Endpoints](#health-check-endpoints)
6. [Data Models](#data-models)
7. [Validation Rules](#validation-rules)

---

## Overview

ATHS (Authentication Service) handles user registration, login, token management, and user profile operations. It's the central authentication hub for the e-commerce platform.

### Key Features
- JWT-based authentication
- Role-based access control (Customer, Administrator)
- Password reset via email
- Email verification
- Token refresh mechanism
- Admin user management

---

## Authentication Endpoints

### 1. Register New User

Creates a new user account and automatically creates a customer profile in CRMS.

**Endpoint:** `POST /api/auth/register`  
**Authentication:** None (Public)  
**Rate Limit:** 10 requests per 15 minutes per IP

#### Request Body

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "contactNumber": "+919876543210"
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `email` | string | ✅ Yes | Email format, max 255 chars, unique | User's email address |
| `password` | string | ✅ Yes | Min 8 chars, must contain uppercase, lowercase, and number | Account password |
| `fullName` | string | ✅ Yes | Min 2 chars, max 100 chars | User's full name |
| `contactNumber` | string | ❌ No | Min 10 chars, max 15 chars, numbers/+ only | Phone number |

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "6979a1b1a6db796b4a1447e8",
      "email": "john.doe@example.com",
      "fullName": "John Doe",
      "role": "Customer",
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2026-01-28T10:30:00.000Z",
      "updatedAt": "2026-01-28T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "30m"
  }
}
```

#### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "message": "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  "data": null
}
```

**409 Conflict - Email Already Exists**
```json
{
  "success": false,
  "message": "Email address is already registered",
  "data": null
}
```

#### Usage Example

**When to use:** First step in user onboarding flow  
**Next step:** Store tokens securely, redirect to dashboard or prompt email verification

---

### 2. User Login

Authenticates a user and returns access/refresh tokens.

**Endpoint:** `POST /api/auth/login`  
**Authentication:** None (Public)  
**Rate Limit:** 10 requests per 15 minutes per IP

#### Request Body

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `email` | string | ✅ Yes | Email format | User's email |
| `password` | string | ✅ Yes | - | Account password |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "6979a1b1a6db796b4a1447e8",
      "email": "john.doe@example.com",
      "fullName": "John Doe",
      "role": "Customer",
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2026-01-28T10:30:00.000Z",
      "updatedAt": "2026-01-28T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "30m"
  }
}
```

#### Error Responses

**401 Unauthorized - Invalid Credentials**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null
}
```

**403 Forbidden - Account Inactive**
```json
{
  "success": false,
  "message": "Your account has been deactivated. Please contact support.",
  "data": null
}
```

#### Usage Example

**When to use:** User login flow  
**Next step:** Store tokens, check `user.role` for routing (Customer → dashboard, Admin → admin panel)

---

### 3. Refresh Access Token

Obtains a new access token using a valid refresh token.

**Endpoint:** `POST /api/auth/refresh-token`  
**Authentication:** None (Requires valid refresh token)

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refreshToken` | string | ✅ Yes | Valid refresh token from login/register |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "30m"
  }
}
```

#### Error Responses

**401 Unauthorized - Invalid/Expired Refresh Token**
```json
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "data": null
}
```

#### Usage Example

**When to use:** When access token expires (401 response from other APIs)  
**Implementation:** Use interceptor to automatically refresh on 401 errors

```javascript
// Example interceptor pattern
if (response.status === 401 && !isRefreshEndpoint) {
  const newTokens = await refreshAccessToken();
  // Retry original request with new token
}
```

---

### 4. Logout

Invalidates the current refresh token.

**Endpoint:** `POST /api/auth/logout`  
**Authentication:** None (Requires valid refresh token)

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

#### Usage Example

**When to use:** User clicks logout  
**Next step:** Clear stored tokens, redirect to login page

---

### 5. Forgot Password

Initiates password reset process by sending reset email.

**Endpoint:** `POST /api/auth/forgot-password`  
**Authentication:** None (Public)  
**Rate Limit:** 3 requests per 15 minutes per IP

#### Request Body

```json
{
  "email": "john.doe@example.com"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Password reset email sent. Please check your inbox.",
  "data": null
}
```

#### Note
- Always returns success even if email doesn't exist (security best practice)
- Reset email contains a one-time token valid for 1 hour

---

### 6. Reset Password

Resets password using the token from reset email.

**Endpoint:** `POST /api/auth/reset-password`  
**Authentication:** None (Requires valid reset token)  
**Rate Limit:** 3 requests per 15 minutes per IP

#### Request Body

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `token` | string | ✅ Yes | - | Reset token from email |
| `newPassword` | string | ✅ Yes | Min 8 chars, uppercase, lowercase, number | New password |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password.",
  "data": null
}
```

#### Error Responses

**400 Bad Request - Invalid/Expired Token**
```json
{
  "success": false,
  "message": "Invalid or expired reset token",
  "data": null
}
```

---

### 7. Verify Email

Verifies user's email address using verification token.

**Endpoint:** `POST /api/auth/verify-email`  
**Authentication:** None (Requires valid verification token)

#### Request Body

```json
{
  "token": "verification-token-from-email"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": null
}
```

---

### 8. Resend Verification Email

Sends a new email verification link.

**Endpoint:** `POST /api/auth/resend-verification`  
**Authentication:** Required (Bearer token)

#### Headers

```http
Authorization: Bearer <access_token>
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Verification email sent. Please check your inbox.",
  "data": null
}
```

---

## User Profile Endpoints

### 9. Get User Profile

Retrieves the authenticated user's profile.

**Endpoint:** `GET /api/user/profile`  
**Authentication:** Required (Bearer token)

#### Headers

```http
Authorization: Bearer <access_token>
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "6979a1b1a6db796b4a1447e8",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "contactNumber": "+919876543210",
    "role": "Customer",
    "isActive": true,
    "emailVerified": true,
    "address": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "country": "India"
    },
    "createdAt": "2026-01-28T10:30:00.000Z",
    "updatedAt": "2026-01-28T12:45:00.000Z"
  }
}
```

#### Usage Example

**When to use:** Display user profile, populate settings page  
**Note:** Password is never returned in any response

---

### 10. Update User Profile

Updates the authenticated user's profile information.

**Endpoint:** `PUT /api/user/profile`  
**Authentication:** Required (Bearer token)

#### Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "fullName": "John Michael Doe",
  "contactNumber": "+919876543210",
  "address": {
    "street": "456 Park Avenue",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400002",
    "country": "India"
  }
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `fullName` | string | ❌ No | Min 2 chars, max 100 chars | Updated full name |
| `contactNumber` | string | ❌ No | Min 10, max 15 chars | Updated phone |
| `address` | object | ❌ No | See address fields | Updated address |

**Note:** Email cannot be updated. Role can only be changed by admin.

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "6979a1b1a6db796b4a1447e8",
    "email": "john.doe@example.com",
    "fullName": "John Michael Doe",
    "contactNumber": "+919876543210",
    "role": "Customer",
    "isActive": true,
    "address": {
      "street": "456 Park Avenue",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400002",
      "country": "India"
    },
    "updatedAt": "2026-01-28T14:20:00.000Z"
  }
}
```

---

### 11. Change Password

Changes the authenticated user's password.

**Endpoint:** `PUT /api/user/change-password`  
**Authentication:** Required (Bearer token)

#### Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `currentPassword` | string | ✅ Yes | - | Current password for verification |
| `newPassword` | string | ✅ Yes | Min 8 chars, uppercase, lowercase, number | New password |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

#### Error Responses

**401 Unauthorized - Wrong Current Password**
```json
{
  "success": false,
  "message": "Current password is incorrect",
  "data": null
}
```

---

### 12. Delete Account

Permanently deletes the authenticated user's account.

**Endpoint:** `DELETE /api/user/account`  
**Authentication:** Required (Bearer token)

#### Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "password": "SecurePass123!",
  "confirmation": "DELETE"
}
```

#### Request Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `password` | string | ✅ Yes | - | Password for verification |
| `confirmation` | string | ✅ Yes | Must be "DELETE" | Confirmation string |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Account deleted successfully",
  "data": null
}
```

#### Important Notes
- This action is **irreversible**
- May fail if user has active orders or complaints
- Associated customer profile in CRMS will also be deleted

---

## Admin Endpoints

### 13. List All Users

Retrieves a paginated list of all users (Admin only).

**Endpoint:** `GET /api/admin/users`  
**Authentication:** Required (Admin Bearer token)

#### Headers

```http
Authorization: Bearer <admin_access_token>
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | ❌ No | 1 | Page number |
| `limit` | integer | ❌ No | 10 | Items per page (max 100) |
| `role` | string | ❌ No | - | Filter by role (Customer, Administrator) |
| `isActive` | boolean | ❌ No | - | Filter by active status |
| `search` | string | ❌ No | - | Search by name or email |

#### Example Request

```http
GET /api/admin/users?page=1&limit=20&role=Customer&search=john
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "_id": "6979a1b1a6db796b4a1447e8",
        "email": "john.doe@example.com",
        "fullName": "John Doe",
        "role": "Customer",
        "isActive": true,
        "emailVerified": true,
        "createdAt": "2026-01-28T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 5,
      "totalUsers": 95,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### Usage Example

**When to use:** Admin user management dashboard  
**Note:** Passwords are never included in responses

---

### 14. Get User Statistics

Retrieves overall user statistics (Admin only).

**Endpoint:** `GET /api/admin/stats`  
**Authentication:** Required (Admin Bearer token)

#### Headers

```http
Authorization: Bearer <admin_access_token>
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalUsers": 1247,
    "activeUsers": 1189,
    "inactiveUsers": 58,
    "customerCount": 1200,
    "administratorCount": 47,
    "verifiedEmails": 980,
    "unverifiedEmails": 267,
    "usersRegisteredToday": 15,
    "usersRegisteredThisWeek": 87,
    "usersRegisteredThisMonth": 342
  }
}
```

#### Usage Example

**When to use:** Admin dashboard overview, analytics pages

---

## Health Check Endpoints

### 15. Basic Health Check

Quick health check endpoint.

**Endpoint:** `GET /health`  
**Authentication:** None (Public)

#### Success Response (200 OK)

```json
{
  "status": "healthy",
  "service": "ATHS - Authentication Service",
  "timestamp": "2026-01-28T10:30:00.000Z",
  "uptime": 3600
}
```

---

### 16. Detailed Health Check

Comprehensive health check including database status.

**Endpoint:** `GET /health/detailed`  
**Authentication:** None (Public)

#### Success Response (200 OK)

```json
{
  "status": "healthy",
  "service": "ATHS - Authentication Service",
  "timestamp": "2026-01-28T10:30:00.000Z",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "connected",
      "responseTime": 12
    },
    "memory": {
      "used": "245 MB",
      "total": "512 MB",
      "percentage": 47.85
    }
  }
}
```

---

## Data Models

### User Object

```typescript
{
  _id: string;                    // MongoDB ObjectId
  email: string;                  // Unique email address
  fullName: string;               // User's full name
  contactNumber?: string;         // Phone number (optional)
  role: "Customer" | "Administrator";
  isActive: boolean;              // Account active status
  emailVerified: boolean;         // Email verification status
  address?: {                     // Optional address
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  createdAt: string;              // ISO 8601 timestamp
  updatedAt: string;              // ISO 8601 timestamp
}
```

### Token Response

```typescript
{
  accessToken: string;            // JWT access token (30 min validity)
  refreshToken: string;           // JWT refresh token (7 days validity)
  expiresIn: string;             // Access token expiry (e.g., "30m")
}
```

### JWT Payload

```typescript
{
  userId: string;                 // User's MongoDB _id
  email: string;                  // User's email
  role: "Customer" | "Administrator";
  iat: number;                    // Issued at timestamp
  exp: number;                    // Expiration timestamp
}
```

---

## Validation Rules

### Email
- **Format:** Valid email format (RFC 5322)
- **Length:** Maximum 255 characters
- **Uniqueness:** Must be unique across all users
- **Example:** `john.doe@example.com`

### Password
- **Minimum Length:** 8 characters
- **Maximum Length:** 128 characters
- **Required:** At least one uppercase letter
- **Required:** At least one lowercase letter
- **Required:** At least one number
- **Pattern:** `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/`
- **Example:** `SecurePass123!`

### Full Name
- **Minimum Length:** 2 characters
- **Maximum Length:** 100 characters
- **Example:** `John Doe`

### Contact Number
- **Minimum Length:** 10 characters
- **Maximum Length:** 15 characters
- **Pattern:** `/^[0-9+\-\s()]+$/`
- **Format:** Can include +, -, spaces, and parentheses
- **Example:** `+919876543210` or `(555) 123-4567`

### Role
- **Allowed Values:** `"Customer"`, `"Administrator"`
- **Default:** `"Customer"`
- **Note:** Can only be changed by another admin

### Address Fields
- **street:** Maximum 255 characters
- **city:** Maximum 100 characters
- **state:** Maximum 100 characters
- **zipCode:** Maximum 20 characters
- **country:** Maximum 100 characters

---

## Common Response Patterns

### Success Response Structure

```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    // Response data here
  }
}
```

### Error Response Structure

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### Pagination Structure

```json
{
  "page": 1,
  "limit": 20,
  "totalPages": 5,
  "totalUsers": 95,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

---

## Rate Limiting

| Endpoint | Limit | Window | Identifier |
|----------|-------|--------|------------|
| `/api/auth/register` | 10 requests | 15 minutes | IP address |
| `/api/auth/login` | 10 requests | 15 minutes | IP address |
| `/api/auth/forgot-password` | 3 requests | 15 minutes | IP address |
| `/api/auth/reset-password` | 3 requests | 15 minutes | IP address |

**When rate limit exceeded:**
```json
Status: 429 Too Many Requests
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "data": {
    "retryAfter": 900
  }
}
```

---

## Security Notes

1. **Never log or expose passwords** in any form
2. **Store tokens securely** (httpOnly cookies or secure storage)
3. **Always use HTTPS** in production
4. **Implement CSRF protection** for token refresh
5. **Validate tokens** on every protected endpoint
6. **Invalidate all tokens** on password change
7. **Implement logout** by invalidating refresh tokens

---

**For complete workflow examples, see the [Frontend Developer Guide](../Frontend-Developer-Guide.md)**
