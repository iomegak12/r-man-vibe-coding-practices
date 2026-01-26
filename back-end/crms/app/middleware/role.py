"""
Role-Based Authorization
Enforce role requirements for endpoints
"""
from functools import wraps
from typing import Callable
from fastapi import HTTPException, status, Depends
from app.middleware.auth import JWTUser, get_current_user
from app.utils.logger import warning


def require_role(*allowed_roles: str):
    """
    Decorator to require specific roles
    
    Args:
        allowed_roles: Roles that are allowed to access the endpoint
        
    Returns:
        Dependency function that checks user role
    """
    async def role_checker(current_user: JWTUser = Depends(get_current_user)) -> JWTUser:
        if current_user.role not in allowed_roles:
            warning(f"Access denied for user {current_user.email} (role: {current_user.role})")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {', '.join(allowed_roles)}"
            )
        return current_user
    
    return role_checker


# Pre-defined role dependencies
async def require_admin(current_user: JWTUser = Depends(get_current_user)) -> JWTUser:
    """
    Require Administrator role
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        JWTUser if user is admin
        
    Raises:
        HTTPException: If user is not an administrator
    """
    if not current_user.is_admin():
        warning(f"Admin access denied for user {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges required"
        )
    return current_user


async def require_customer(current_user: JWTUser = Depends(get_current_user)) -> JWTUser:
    """
    Require Customer role
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        JWTUser if user is customer
        
    Raises:
        HTTPException: If user is not a customer
    """
    if not current_user.is_customer():
        warning(f"Customer access denied for user {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customer access only"
        )
    return current_user


async def require_customer_or_admin(current_user: JWTUser = Depends(get_current_user)) -> JWTUser:
    """
    Allow both Customer and Administrator roles
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        JWTUser if user is customer or admin
    """
    return current_user
