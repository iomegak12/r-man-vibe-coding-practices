"""
Global Error Handler Middleware
Provides consistent error responses across the application
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import ValidationError
from app.utils.logger import error, warning
from typing import Union, List


def create_error_response(
    message: str,
    errors: List[dict] = None,
    status_code: int = 500
) -> JSONResponse:
    """
    Create standardized error response
    
    Args:
        message: Error message
        errors: List of error details
        status_code: HTTP status code
        
    Returns:
        JSONResponse with error details
    """
    response_data = {
        "success": False,
        "message": message,
    }
    
    if errors:
        response_data["errors"] = errors
    
    return JSONResponse(
        status_code=status_code,
        content=response_data
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Handle HTTP exceptions
    
    Args:
        request: FastAPI request
        exc: HTTP exception
        
    Returns:
        Standardized error response
    """
    error(f"HTTP {exc.status_code}: {exc.detail}")
    
    return create_error_response(
        message=exc.detail,
        status_code=exc.status_code
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle request validation errors
    
    Args:
        request: FastAPI request
        exc: Validation error exception
        
    Returns:
        Standardized error response with field details
    """
    errors = []
    for error_detail in exc.errors():
        field_path = " -> ".join(str(loc) for loc in error_detail["loc"])
        errors.append({
            "field": field_path,
            "message": error_detail["msg"]
        })
    
    warning(f"Validation error: {errors}")
    
    return create_error_response(
        message="Validation failed",
        errors=errors,
        status_code=status.HTTP_400_BAD_REQUEST
    )


async def general_exception_handler(request: Request, exc: Exception):
    """
    Handle general exceptions
    
    Args:
        request: FastAPI request
        exc: General exception
        
    Returns:
        Standardized error response
    """
    error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    return create_error_response(
        message="Internal server error",
        errors=[{
            "field": "server",
            "message": "An unexpected error occurred. Please try again later."
        }],
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
