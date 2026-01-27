"""
Error handlers for the application
Handles HTTP exceptions, validation errors, and general exceptions
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.utils.logger import error as log_error


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Handle HTTP exceptions
    
    Args:
        request: FastAPI request
        exc: HTTP exception
        
    Returns:
        JSON response with error details
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "data": None
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle validation errors
    
    Args:
        request: FastAPI request
        exc: Validation exception
        
    Returns:
        JSON response with validation error details
    """
    errors = []
    
    for error in exc.errors():
        field_path = " -> ".join(str(loc) for loc in error["loc"])
        errors.append({
            "field": field_path,
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation error",
            "data": {
                "errors": errors
            }
        }
    )


async def general_exception_handler(request: Request, exc: Exception):
    """
    Handle general exceptions
    
    Args:
        request: FastAPI request
        exc: Exception
        
    Returns:
        JSON response with error message
    """
    log_error(f"Unhandled exception: {str(exc)}")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Internal server error",
            "data": None
        }
    )
