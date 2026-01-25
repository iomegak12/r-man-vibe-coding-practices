# Authentication Service (ATHS) - API Documentation

## Overview

The Authentication Service provides comprehensive user authentication and authorization functionality for the R-MAN E-Commerce Customer Management System. This document provides information about accessing and using the API documentation.

## Swagger/OpenAPI Documentation

### Accessing the Documentation

When the service is running, you can access the interactive API documentation at:

- **Swagger UI**: http://localhost:5001/api-docs
- **OpenAPI JSON Spec**: http://localhost:5001/api-docs.json
- **API Root Endpoint**: http://localhost:5001/api

### Features

The Swagger UI provides:

- ✅ **Interactive Testing**: Test all endpoints directly from the browser
- ✅ **Request Examples**: Pre-filled example requests for every endpoint
- ✅ **Response Schemas**: Detailed response structures with examples
- ✅ **Authentication Testing**: Built-in authentication handlers for JWT and API keys
- ✅ **Model Schemas**: Reusable data models for Users, Tokens, Errors, etc.
- ✅ **Error Documentation**: Comprehensive error response examples

## API Endpoints Overview

### 📋 Authentication Endpoints (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user account |
| POST | `/api/auth/login` | Login with email and password |
| POST | `/api/auth/refresh-token` | Get new access token using refresh token |
| POST | `/api/auth/logout` | Logout and revoke tokens |
| POST | `/api/auth/forgot-password` | Request password reset email |
| POST | `/api/auth/reset-password` | Reset password using token |
| POST | `/api/auth/verify-email` | Verify email address |
| POST | `/api/auth/resend-verification` | Resend verification email |

### 👤 User Profile Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update user profile |
| PUT | `/api/user/change-password` | Change password |
| DELETE | `/api/user/account` | Delete user account |

### 🛡️ Admin Endpoints (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users with pagination |
| GET | `/api/admin/stats` | Get user statistics |
| PUT | `/api/admin/users/:userId/activate` | Activate user account |
| PUT | `/api/admin/users/:userId/deactivate` | Deactivate user account |
| PUT | `/api/admin/users/:userId/role` | Update user role |
| DELETE | `/api/admin/users/:userId` | Permanently delete user |

### 🔧 Internal Service Endpoints (Service-to-Service)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/internal/validate-token` | Validate JWT token |
| GET | `/api/internal/user/:userId` | Get user by ID |
| GET | `/api/internal/user/email/:email` | Get user by email |

### 💚 Health Check Endpoints (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Basic health check |
| GET | `/health/detailed` | Detailed health with dependencies |
| GET | `/health/ready` | Kubernetes readiness probe |
| GET | `/health/live` | Kubernetes liveness probe |

## Authentication

The API uses two authentication methods:

### 1. Bearer Token (JWT)

For user-facing endpoints:

```http
Authorization: Bearer <access_token>
```

**How to use in Swagger UI:**
1. Click the "Authorize" button at the top
2. Enter your access token in the "bearerAuth" field
3. Click "Authorize"
4. All requests will now include the token

### 2. Service API Key

For internal service-to-service communication:

```http
x-api-key: <service_api_key>
```

**How to use in Swagger UI:**
1. Click the "Authorize" button at the top
2. Enter the service API key in the "serviceApiKey" field
3. Click "Authorize"
4. All internal endpoints will now include the key

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error message"
    }
  ]
}
```

## Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request / Validation error |
| 401 | Unauthorized / Invalid token |
| 403 | Forbidden / Access denied |
| 404 | Resource not found |
| 409 | Conflict (e.g., email already exists) |
| 429 | Too many requests (rate limited) |
| 500 | Internal server error |
| 503 | Service unavailable |

## Testing Workflow

### 1. Register a New User

```bash
POST /api/auth/register
{
  "email": "test@example.com",
  "password": "SecurePass123!",
  "fullName": "Test User",
  "contactNumber": "1234567890"
}
```

### 2. Verify Email (Check console for token)

```bash
POST /api/auth/verify-email
{
  "token": "<verification_token>"
}
```

### 3. Login

```bash
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

### 4. Use Access Token

Copy the `accessToken` from login response and use it in the Authorization header for protected endpoints.

## Data Models

### User Schema

```json
{
  "id": "string",
  "email": "string",
  "fullName": "string",
  "contactNumber": "string",
  "role": "Customer | Administrator",
  "isActive": "boolean",
  "isEmailVerified": "boolean",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### Tokens Schema

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": "number (seconds)"
}
```

## Rate Limiting

Rate limiting can be enabled via environment variable:

```env
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # Max 100 requests per window
```

When enabled:
- **Login**: 5 requests per 15 minutes per IP
- **Register**: 3 requests per 15 minutes per IP
- **Password Reset**: 3 requests per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP

## Security Features

- ✅ **JWT Authentication**: Secure token-based authentication
- ✅ **Password Hashing**: bcrypt with 12 salt rounds
- ✅ **Email Verification**: Email confirmation required
- ✅ **Rate Limiting**: Configurable request throttling
- ✅ **CORS**: Cross-Origin Resource Sharing enabled
- ✅ **Helmet**: Security headers middleware
- ✅ **Input Validation**: Joi schema validation
- ✅ **Audit Logging**: All actions tracked with user context
- ✅ **Token Refresh**: Automatic token renewal
- ✅ **Account Deactivation**: Soft delete functionality

## Environment Configuration

Required environment variables:

```env
# Server
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://admin:password123@localhost:27017/rman-auth-db

# JWT
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRE=30m
REFRESH_TOKEN_EXPIRE=7d

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=<your_email>
EMAIL_PASSWORD=<app_password>

# Frontend
FRONTEND_URL=http://localhost:3000

# Service Communication
SERVICE_API_KEY=<your_service_api_key>

# Security
RATE_LIMIT_ENABLED=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=*
```

## Support

For issues or questions:

1. Check the Swagger UI documentation at `/api-docs`
2. Review the API examples in the Swagger interface
3. Test endpoints using the "Try it out" feature
4. Check the health endpoints for service status

## Version

**Current Version**: 1.0.0  
**OpenAPI Version**: 3.0.0  
**Last Updated**: January 2024

## License

See LICENSE file for details.
