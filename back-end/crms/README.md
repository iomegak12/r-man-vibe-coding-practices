# Customer Management Service (CRMS)

## R-MAN E-Commerce Customer Management System

The Customer Management Service (CRMS) manages customer business data, statistics, and relationships for the R-MAN E-Commerce platform. Built with Python FastAPI and MongoDB.

## 🚀 Features

### Core Features
- **Customer Profile Management**: Comprehensive customer data with denormalized user information
- **Customer Statistics Tracking**: Real-time order and complaint metrics
- **Admin Management**: Full CRUD operations with role-based access control
- **Advanced Search**: Text search and filtering by status, type, and custom criteria
- **Service Integration**: Seamless integration with Order and Complaint services
- **Analytics & Reporting**: Business intelligence and customer insights

### Production-Ready Features ✨
- **Structured Logging**: JSON-formatted logs with request/response tracking
- **Performance Monitoring**: Request timing and database operation tracking
- **Security Hardening**: 
  - Rate limiting (100 req/min, 1000 req/hour per IP)
  - Security headers (CSP, HSTS, X-Frame-Options, etc.)
  - Input sanitization and validation
  - JWT authentication with role-based authorization
- **Database Optimization**: Comprehensive indexes for high-performance queries
- **Error Handling**: Graceful error handling with detailed error responses
- **Health Checks**: Service health monitoring endpoints
- **API Documentation**: Complete OpenAPI/Swagger documentation

## 📋 Prerequisites

- Python 3.11+
- MongoDB 6.0+
- Virtual environment activated

## 🛠️ Installation

1. **Navigate to service directory**
   ```bash
   cd back-end/crms
   ```

2. **Activate virtual environment** (from vibe-coding root)
   ```bash
   # From root directory
   env\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update values as needed

5. **Ensure MongoDB is running**
   ```bash
   # MongoDB should already be running in Docker
   # Database: r-man-customers-db
   ```

## 🚀 Running the Service

**Development mode**
```bash
uvicorn app.main:app --reload --port 5002
```

The service will be available at `http://localhost:5002`

## 📚 API Documentation

Once running, access:
- **Swagger UI**: http://localhost:5002/docs
- **ReDoc**: http://localhost:5002/redoc
- **Health Check**: http://localhost:5002/health

### API Endpoints Summary

**Customer Profile (requires Customer or Admin role)**
- `GET /api/customers/me` - Get own profile
- `GET /api/customers/me/statistics` - Get own statistics
and database setup
│   │   ├── database.py  # MongoDB connection and indexes
│   │   └── settings.py  # Application settings
│   ├── middleware/      # Middleware components
│   │   ├── auth.py              # JWT authentication
│   │   ├── role.py              # Role-based authorization
│   │   ├── service_auth.py      # Service API key auth
│   │   ├── request_logging.py   # Request/response logging ✨
│   │   ├── rate_limit.py        # Rate limiting ✨
│   │   ├── security.py          # Security headers & sanitization ✨
│   │   └── error_handler.py     # Global error handling
│   ├── routers/         # API route handlers
│   │   ├── customer.py  # Customer-facing endpoints
│   │   ├── admin.py     # Admin management endpoints
│   │   ├── internal.py  # Internal service endpoints
│   │   └── test.py      # Authentication test endpoints
│   ├── schemas/         # Pydantic validation schemas
│   ├── services/        # External service clients
│   │   ├── order_client.py      # ORMS HTTP client
│   │   └── complaint_client.py  # CMPS HTTP client
│   ├── utils/           # Utility functions
│   │   ├── logger.py            # Structured logging ✨
│   │   ├── validators.py        # Input validation
│   │   └── pagination.py        # Pagination helpers
│   └── main.py          # Application entry point
├── test_comprehensive_integration.py  # Integration tests ✨
├── DEPLOYMENT.md        # Production deployment guide ✨
├── requirements.txt     # Python dependencies
├── .env                 # Environment variabl Add admin notes
- `GET /api/customers/{customerId}/orders` - Get customer orders (ORMS integration)
- `GET /api/customers/{customerId}/complaints` - Get customer complaints (CMPS integration)

**Internal Service APIs (requires Service API Key)**
- `POST /api/customers/internal/create` - Create customer (from Auth Service)
- `PATCH /api/customers/internal/{customerId}/statistics` - Update statistics
- `GET /api/customers/internal/user/{userId}` - Get customer by userId

## 🗂️ Project Structure

```
crms/
├── app/
│   ├── config/          # Configuration files
│   ├── models/          # MongoDB models
│   ├── schemas/         # Pydantic schemas
│   ├── routers/         # API routes
│   ├── services/        # Business logic
- `ORDER_SERVICE_URL`: Order Service URL (default: http://localhost:5003)
- `COMPLAINT_SERVICE_URL`: Complaint Service URL (default: http://localhost:5004)
- `AUTH_SERVICE_URL`: Auth Service URL (default: http://localhost:5001)
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR)
- `ENVIRONMENT`: Environment (development, production)

## 🧪 Testing

### Run Comprehensive Integration Tests

```bash
# Ensure all services are running (Auth, CRMS, ORMS, CMPS)
python test_comprehensive_integration.py
```

Tests include:
- Health checks for all services
- Authentication flow
- Customer profile access
- Admin management operations
- Service integrations (CRMS → ORMS, CRMS → CMPS)
- Customer notes functionality
- Authorization and access control
- Error handling

### Manual API Testing

```bash
# Health check
curl http://localhost:5002/health

# Login and get token
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rman.com","password":"Admin@123"}'

# Use token to access protected endpoints
curl http://localhost:5002/api/customers \
  -H "Authorization: Bearer <your-token>"
```

## 🚀 Production Deployment

For production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Environment setup
- Database configuration and indexes
- Security hardening checklist
- Performance optimization
- Monitoring and logging setup
- Docker/systemd deployment
- Backup and disaster recovery
- Health checks and rollback procedures

### Quick Production Checklist

- ✅ Structured logging (JSON format)
- ✅ Request/response tracking
- ✅ Rate limiting (100/min, 1000/hour per IP)
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ Input sanitization
- ✅ Database indexes optimized
- ✅ Error handling and graceful degradation
- ✅ Service integration with retry logic
- ✅ Comprehensive API documentation
- ✅ Integration tests

## 📊 Performance

### Database Indexes

The following indexes are automatically created on startup:
- `userId` (unique) - Fast user lookup
- `email` - Email queries
- `customerStatus` - Status filtering
- `customerType` - Type filtering
- `customerStatus + customerType` - Compound filter
- Text index on `fullName`, `email`, `contactNumber` - Search
- `lastOrderDate` - Sorting
- `totalOrderValue` - High-value customer queries
- `createdAt` - Chronological queries

### Response Times (Target)

- Simple queries: < 50ms
- Complex aggregations: < 200ms
- External service calls: < 500ms
- Search queries: < 100ms
│   ├── middleware/      # Middleware
│   ├── utils/           # Utilities
│   └── dependencies/    # Dependencies
├── tests/               # Tests
├── .env                 # Environment variables
├── requirements.txt     # Python dependencies
└── README.md
```

## 🔧 Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `PORT`: Service port (default: 5002)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT secret for token validation
- `SERVICE_API_KEY`: Service-to-service API key

## 📖 Documentation

For complete implementation guide, see [Customer-Service-Implementation-Guide.md](../../docs/Customer-Service-Implementation-Guide.md)

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
