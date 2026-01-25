# Authentication Service (ATHS)

## R-MAN E-Commerce Customer Management System

The Authentication Service (ATHS) is a centralized authentication and user management microservice built with Node.js and Express.js. It provides secure user authentication, JWT token management, and user profile management for the R-MAN E-Commerce platform.

## 🚀 Features

- **User Registration & Authentication**: Secure user registration with email validation
- **JWT Token Management**: Access token and refresh token implementation
- **Password Management**: Change password, forgot password, and reset password functionality
- **User Profile Management**: CRUD operations for user profiles
- **Role-Based Access Control**: Support for Customer and Administrator roles
- **Service-to-Service Authentication**: Internal API endpoints for microservice communication
- **Email Notifications**: Registration confirmation and password reset emails
- **Security**: bcrypt password hashing, helmet security headers, CORS, rate limiting

## 📋 Prerequisites

- Node.js 18.x or higher
- MongoDB 6.0 or higher
- Gmail account (for email notifications)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd back-end/aths
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=password123 \
     mongo:6.0
   ```

## 🚀 Running the Service

**Development mode (with auto-reload)**
```bash
npm run dev
```

**Production mode**
```bash
npm start
```

The service will be available at `http://localhost:5001`

## 📚 API Documentation

### Interactive Documentation (Swagger UI)

The service provides comprehensive interactive API documentation via Swagger/OpenAPI:

- **Swagger UI**: http://localhost:5001/api-docs
- **OpenAPI JSON Spec**: http://localhost:5001/api-docs.json

**Features**:
- ✅ Test all endpoints directly from the browser
- ✅ View detailed request/response schemas
- ✅ Try authentication with JWT tokens
- ✅ Explore all 25 API endpoints
- ✅ See example requests and responses

For detailed documentation, see [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

### Quick Reference

#### Authentication Endpoints (8)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout and revoke tokens
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email

#### User Profile Endpoints (4)
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/change-password` - Change password
- `DELETE /api/user/account` - Delete account

#### Admin Endpoints (6)
- `GET /api/admin/users` - Get all users (paginated)
- `GET /api/admin/stats` - Get user statistics
- `PUT /api/admin/users/:userId/activate` - Activate user
- `PUT /api/admin/users/:userId/deactivate` - Deactivate user
- `PUT /api/admin/users/:userId/role` - Update user role
- `DELETE /api/admin/users/:userId` - Delete user permanently

#### Internal Service Endpoints (3)
- `POST /api/internal/validate-token` - Validate JWT token
- `GET /api/internal/user/:userId` - Get user by ID
- `GET /api/internal/user/email/:email` - Get user by email

#### Health Check Endpoints (4)
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health with dependencies
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe

## 🗂️ Project Structure

```
aths/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── email.js             # Email configuration
│   │   └── jwt.js               # JWT configuration
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── RefreshToken.js      # Refresh token model
│   │   └── PasswordReset.js     # Password reset model
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User management
│   │   └── internalController.js # Internal endpoints
│   ├── routes/
│   │   ├── authRoutes.js        # Auth routes
│   │   ├── userRoutes.js        # User routes
│   │   └── internalRoutes.js    # Internal routes
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT validation
│   │   ├── roleMiddleware.js    # Role authorization
│   │   ├── validationMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── rateLimitMiddleware.js
│   ├── validators/
│   │   ├── authValidators.js
│   │   └── userValidators.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── tokenService.js
│   │   ├── emailService.js
│   │   └── passwordService.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── responseHandler.js
│   │   └── errorHandler.js
│   └── app.js                   # Express app setup
├── server.js                    # Entry point
├── .env                         # Environment variables
├── .env.example
├── .gitignore
├── package.json
├── LICENSE
├── README.md
├── CONTRIBUTING.md
└── CHANGELOG.md
```

## 🔒 Security

- Passwords are hashed using bcrypt (12 salt rounds)
- JWT tokens with configurable expiration
- Helmet middleware for security headers
- CORS configuration for allowed origins
- Rate limiting to prevent abuse
- Input validation using Joi
- MongoDB injection prevention

## 🧪 Testing

```bash
npm test
```

## 📝 Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `PORT` - Server port (default: 5001)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `EMAIL_USER` - Gmail account for sending emails
- `EMAIL_PASSWORD` - Gmail app password
- `SERVICE_API_KEY` - API key for internal service communication
- `RATE_LIMIT_ENABLED` - Enable/disable rate limiting (default: false)
- `CORS_ORIGIN` - Allowed origins (* for all, or comma-separated URLs)

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Ramkumar JD** - *Lead Developer*
- **Training Team** - *Contributors*

## 🏢 Client

**R-MAN Corporation, Bangalore**

## 📞 Support

For support and queries, please contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** January 25, 2026
