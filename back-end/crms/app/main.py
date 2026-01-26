"""
Customer Management Service (CRMS)
FastAPI application entry point
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
from app.config.database import Database
from app.config.settings import settings
from app.utils.logger import info
from app.middleware.error_handler import (
    http_exception_handler,
    validation_exception_handler,
    general_exception_handler
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager
    Handles startup and shutdown events
    """
    # Startup
    info("Starting Customer Management Service (CRMS)...")
    await Database.connect_db()
    info("✅ Service startup complete")
    
    yield
    
    # Shutdown
    info("Shutting down Customer Management Service...")
    await Database.disconnect_db()
    info("✅ Service shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="Customer Management Service API",
    description="""
# Customer Management Service (CRMS)

The Customer Management Service is the centralized customer data and profile management microservice for the R-MAN E-Commerce Customer Management System.

## Features

- **Customer Profiles**: Comprehensive customer profile management with denormalized user data
- **Customer Statistics**: Track orders, complaints, and customer lifecycle metrics
- **Admin Management**: Full CRUD operations for customer records with role-based access
- **Search & Filter**: Text search and advanced filtering by status, type, and more
- **Analytics**: Aggregated customer insights and business intelligence
- **Service Integration**: Internal APIs for Order and Complaint service integration
- **Audit Trail**: Track all modifications with metadata and admin notes

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Roles
- **Customer**: Access to own profile and statistics
- **Admin/Administrator**: Full access to all customer management features

## Service Integration

Internal endpoints require service API key authentication:

```
x-api-key: <service-api-key>
```

## Customer Lifecycle

1. **Creation**: Auto-created via ATHS registration or internal API
2. **Active**: Default status, can place orders and file complaints
3. **Suspended**: Temporarily restricted access
4. **Inactive**: Soft-deleted or deactivated accounts

## Customer Types

- **Regular**: Standard customers
- **Premium**: Priority support and benefits
- **VIP**: Highest tier with exclusive features

## Error Responses

All error responses follow a standard format:

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

## Database

- **MongoDB**: Document-based storage with async Motor driver
- **Indexes**: Optimized for search, filtering, and performance
- **Denormalization**: Email, fullName, contactNumber from ATHS for efficiency
    """,
    version=settings.SERVICE_VERSION,
    contact={
        "name": "Ramkumar JD",
        "email": "jd.ramkumar@gmail.com"
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT"
    },
    lifespan=lifespan,
    servers=[
        {
            "url": "http://localhost:5002",
            "description": "Development server"
        }
    ],
    tags_metadata=[
        {
            "name": "Root",
            "description": "Service information and health endpoints"
        },
        {
            "name": "Health",
            "description": "Service health check and monitoring"
        },
        {
            "name": "Customer Profile",
            "description": "Customer-facing endpoints for profile and statistics (requires Customer or Admin role)"
        },
        {
            "name": "Admin - Customer Management",
            "description": "Administrative customer management endpoints (requires Admin/Administrator role)"
        },
        {
            "name": "Internal - Service Integration",
            "description": "Service-to-service integration endpoints (requires service API key)"
        },
        {
            "name": "Test",
            "description": "Test endpoints for authentication and authorization validation"
        }
    ]
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register error handlers
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Basic health check endpoint"""
    return {
        "success": True,
        "message": "Customer Management Service is running",
        "service": settings.SERVICE_NAME,
        "version": settings.SERVICE_VERSION,
        "environment": settings.ENVIRONMENT
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with service information"""
    return {
        "success": True,
        "message": "Customer Management Service (CRMS) API",
        "version": settings.SERVICE_VERSION,
        "documentation": "/docs",
        "health": "/health"
    }


# Include routers
from app.routers import test, customer, admin, internal

app.include_router(test.router, prefix="/api", tags=["Test"])
app.include_router(customer.router, prefix="/api/customers", tags=["Customer Profile"])
app.include_router(admin.router, prefix="/api/customers", tags=["Admin - Customer Management"])
app.include_router(internal.router, prefix="/api/customers/internal", tags=["Internal - Service Integration"])
