"""
Authentication Dependencies
Reusable dependencies for route authentication
"""
from typing import Optional, Annotated
from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.middleware.auth import JWTUser, get_current_user
from app.config.database import get_database
from app.services.auth_client import auth_service_client
from app.utils.logger import debug


async def get_current_user_id(
    current_user: JWTUser = Depends(get_current_user)
) -> str:
    """
    Get current user's ID from JWT token
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User ID string
    """
    return current_user.user_id


async def get_current_user_email(
    current_user: JWTUser = Depends(get_current_user)
) -> str:
    """
    Get current user's email from JWT token
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User email string
    """
    return current_user.email


async def get_current_user_role(
    current_user: JWTUser = Depends(get_current_user)
) -> str:
    """
    Get current user's role from JWT token
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User role string
    """
    return current_user.role


async def get_customer_from_db(
    user_id: str = Depends(get_current_user_id),
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)] = None
) -> Optional[dict]:
    """
    Get customer record from database for current user
    
    Args:
        user_id: Current user's ID
        db: Database instance
        
    Returns:
        Customer document if found, None otherwise
    """
    customer = await db.customers.find_one({"userId": user_id})
    
    if customer:
        # Convert ObjectId to string
        customer["_id"] = str(customer["_id"])
        debug(f"Customer record found for user {user_id}")
    
    return customer
