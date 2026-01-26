"""
Authentication Dependencies for Order Management Service
Provides role-based access control for route handlers
"""
from fastapi import Request, HTTPException, status, Depends
from typing import Dict, Optional
from app.utils.logger import error


async def get_current_user(request: Request) -> Dict:
    """
    Dependency to get the current authenticated user
    Raises 401 if no user is authenticated
    """
    user = getattr(request.state, "user", None)
    
    if user is None:
        error("Unauthorized access attempt: No authentication token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid token."
        )
    
    return user


async def get_optional_user(request: Request) -> Optional[Dict]:
    """
    Dependency to get the current user if authenticated, None otherwise
    Does not raise exception if user is not authenticated
    """
    return getattr(request.state, "user", None)


async def require_customer(current_user: Dict = Depends(get_current_user)) -> Dict:
    """
    Dependency to ensure the current user has customer role
    Raises 403 if user is not a customer
    """
    role = current_user.get("role")
    
    if role != "customer":
        error(f"Forbidden access attempt: User {current_user.get('userId')} with role {role} tried to access customer endpoint")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. This endpoint requires customer role."
        )
    
    return current_user


async def require_admin(current_user: Dict = Depends(get_current_user)) -> Dict:
    """
    Dependency to ensure the current user has admin role
    Raises 403 if user is not an admin
    """
    role = current_user.get("role")
    
    if role not in ["admin", "administrator"]:
        error(f"Forbidden access attempt: User {current_user.get('userId')} with role {role} tried to access admin endpoint")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. This endpoint requires admin role."
        )
    
    return current_user


async def require_customer_or_admin(current_user: Dict = Depends(get_current_user)) -> Dict:
    """
    Dependency to ensure the current user has either customer or admin role
    Raises 403 if user has neither role
    """
    role = current_user.get("role")
    
    if role not in ["customer", "admin", "administrator"]:
        error(f"Forbidden access attempt: User {current_user.get('userId')} with role {role} tried to access restricted endpoint")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. This endpoint requires customer or admin role."
        )
    
    return current_user
