"""
Order Management Service (ORMS)
FastAPI application entry point
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from contextlib import asynccontextmanager
from app.config.database import Database
from app.config.settings import settings
from app.utils.logger import info
from app.middleware.auth import AuthenticationMiddleware
from app.middleware.error_handlers import (
    http_exception_handler,
    validation_exception_handler,
    general_exception_handler
)
from app.routes import orders
from app.routes import admin_orders
from app.routes import admin_returns


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager
    Handles startup and shutdown events
    """
    # Startup
    info("Starting Order Management Service (ORMS)...")
    await Database.connect_db()
    info("✅ Service startup complete")
    
    yield
    
    # Shutdown
    info("Shutting down Order Management Service...")
    await Database.disconnect_db()
    info("✅ Service shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="Order Management Service API",
    description="""
# Order Management Service (ORMS)

The Order Management Service is the centralized order processing and lifecycle management microservice for the R-MAN E-Commerce Customer Management System.

## Features

- **Order Creation**: Place orders with multiple items and delivery details
- **Order Tracking**: Track order status from placement to delivery
- **Order Management**: Cancel, update, and manage orders
- **Return Management**: Request and approve product returns
- **Order History**: Complete audit trail of all order changes
- **Admin Tools**: Comprehensive order management for administrators
- **Service Integration**: Internal APIs for Customer and Complaint services

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Roles
- **Customer**: Access to own orders and order operations
- **Admin/Administrator**: Full access to all order management features

## Order Lifecycle

1. **Placed**: Order created and confirmed
2. **Processing**: Order being prepared for shipment
3. **Shipped**: Order dispatched
4. **Delivered**: Order delivered to customer
5. **Cancelled**: Order cancelled (allowed in Placed/Processing only)
6. **Return Requested**: Customer requested return
7. **Returned**: Return completed

## Service Integration

Internal endpoints require service API key authentication:

```
x-api-key: <service-api-key>
```
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
            "url": "http://localhost:5003",
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
            "name": "Orders",
            "description": "Customer order endpoints (create, view, cancel, return)"
        },
        {
            "name": "Admin - Order Management",
            "description": "Administrative order management endpoints (requires Admin role)"
        },
        {
            "name": "Internal - Service Integration",
            "description": "Service-to-service integration endpoints (requires service API key)"
        }
    ]
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.CORS_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add authentication middleware
app.add_middleware(AuthenticationMiddleware)

# Register exception handlers
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Register routers
app.include_router(orders.router)
app.include_router(admin_orders.router)
app.include_router(admin_returns.router)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Basic health check endpoint"""
    return {
        "success": True,
        "message": "Order Management Service is running",
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
        "message": "Order Management Service (ORMS) API",
        "version": settings.SERVICE_VERSION,
        "documentation": "/docs",
        "health": "/health"
    }
