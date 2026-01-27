"""
Complaint Management Service (CMPS)
FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from contextlib import asynccontextmanager
from app.config.database import Database
from app.config.settings import settings
from app.utils.logger import info
from app.middleware.error_handlers import (
    http_exception_handler,
    validation_exception_handler,
    general_exception_handler
)
from app.routes import complaints, admin_complaints, internal


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager
    Handles startup and shutdown events
    """
    # Startup
    info("Starting Complaint Management Service (CMPS)...")
    await Database.connect_db()
    
    # Verify email configuration
    if settings.EMAIL_USER and settings.EMAIL_PASSWORD:
        try:
            from app.config.email import verify_email_config
            if verify_email_config():
                info("✅ Email service configured and ready")
            else:
                info("⚠️  Email service not available - notifications disabled")
        except Exception as e:
            info(f"⚠️  Email service verification failed: {str(e)}")
    else:
        info("ℹ️  Email credentials not configured - notifications disabled")
    
    info("✅ Service startup complete")
    
    yield
    
    # Shutdown
    info("Shutting down Complaint Management Service...")
    await Database.disconnect_db()
    info("✅ Service shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="Complaint Management Service API",
    description="""
# Complaint Management Service (CMPS)

The Complaint Management Service handles customer complaint registration, tracking, resolution, and admin complaint management within the E-Commerce Customer Management System.

## Features

- **Complaint Registration**: Register order-linked or general complaints
- **Complaint Tracking**: Track complaint status and lifecycle
- **Admin Management**: Assignment, resolution, and closure workflows
- **Comments System**: Communication between customers and support
- **Analytics**: Complaint statistics and reporting
- **Email Notifications**: Automated email notifications for complaint events

## Authentication

Most endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

Internal service endpoints require API key authentication via the `X-Service-API-Key` header.

## Response Format

All responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "errors": [{"field": "fieldName", "message": "Error message"}]
}
```

## Complaint Lifecycle

1. **Open**: Complaint created
2. **In Progress**: Being worked on by admin
3. **Resolved**: Resolution provided
4. **Closed**: Complaint closed
5. Can be **Reopened** if needed

## Priority Levels

- **Low**: Low priority issues
- **Medium**: Standard priority (default)
- **High**: High priority issues
- **Critical**: Urgent issues requiring immediate attention

## Categories

- **Product Quality**: Issues with product quality
- **Delivery Issue**: Delivery-related problems
- **Customer Service**: Customer service complaints
- **Payment Issue**: Payment-related issues
- **Other**: Other complaints
    """,
    version=settings.SERVICE_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Register routers
# Note: Order matters! Register admin router first for /api/complaints and /api/complaints/search
# Then customer router for /api/complaints/me and /api/complaints/{complaintId}
app.include_router(admin_complaints.router)
app.include_router(complaints.router)
app.include_router(internal.router)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Basic health check endpoint"""
    return {
        "success": True,
        "message": "Complaint Management Service is running",
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
        "message": "Complaint Management Service (CMPS) API",
        "version": settings.SERVICE_VERSION,
        "documentation": "/docs",
        "health": "/health"
    }
