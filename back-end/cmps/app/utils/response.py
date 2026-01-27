"""
Response utility functions for consistent API responses
"""
from typing import Any, Optional, Dict, List
from pydantic import BaseModel


class APIResponse(BaseModel):
    """Standard API response format"""
    success: bool
    message: str
    data: Optional[Any] = None
    errors: Optional[List[Dict[str, str]]] = None


def success_response(
    message: str,
    data: Any = None,
    status_code: int = 200
) -> Dict[str, Any]:
    """
    Create a success response
    
    Args:
        message: Success message
        data: Response data
        status_code: HTTP status code
    
    Returns:
        Dictionary with success response
    """
    response = {
        "success": True,
        "message": message
    }
    
    if data is not None:
        response["data"] = data
    
    return response


def error_response(
    message: str,
    errors: Optional[List[Dict[str, str]]] = None,
    status_code: int = 400
) -> Dict[str, Any]:
    """
    Create an error response
    
    Args:
        message: Error message
        errors: List of field errors
        status_code: HTTP status code
    
    Returns:
        Dictionary with error response
    """
    response = {
        "success": False,
        "message": message,
        "data": None
    }
    
    if errors:
        response["errors"] = errors
    
    return response


def validation_error_response(field: str, message: str) -> Dict[str, Any]:
    """
    Create a validation error response
    
    Args:
        field: Field name with error
        message: Error message
    
    Returns:
        Dictionary with validation error response
    """
    return error_response(
        message="Validation error",
        errors=[{"field": field, "message": message}]
    )
