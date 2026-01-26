"""
Test Routes
For testing authentication and authorization
"""
from fastapi import APIRouter, Depends
from app.middleware.auth import JWTUser, get_current_user
from app.middleware.role import require_admin, require_customer, require_customer_or_admin
from app.dependencies.auth import get_customer_from_db
from app.schemas.response import APIResponse


router = APIRouter()


@router.get("/test/auth", response_model=APIResponse)
async def test_authentication(
    current_user: JWTUser = Depends(get_current_user)
):
    """
    Test endpoint to verify JWT authentication
    
    Requires: Valid JWT token
    """
    return {
        "success": True,
        "message": "Authentication successful",
        "data": {
            "userId": current_user.user_id,
            "email": current_user.email,
            "role": current_user.role
        }
    }


@router.get("/test/admin", response_model=APIResponse)
async def test_admin_only(
    admin: JWTUser = Depends(require_admin)
):
    """
    Test endpoint to verify admin-only access
    
    Requires: Valid JWT token with Administrator role
    """
    return {
        "success": True,
        "message": "Admin access granted",
        "data": {
            "userId": admin.user_id,
            "email": admin.email,
            "role": admin.role
        }
    }


@router.get("/test/customer", response_model=APIResponse)
async def test_customer_only(
    customer: JWTUser = Depends(require_customer)
):
    """
    Test endpoint to verify customer-only access
    
    Requires: Valid JWT token with Customer role
    """
    return {
        "success": True,
        "message": "Customer access granted",
        "data": {
            "userId": customer.user_id,
            "email": customer.email,
            "role": customer.role
        }
    }


@router.get("/test/customer-db", response_model=APIResponse)
async def test_customer_database(
    current_user: JWTUser = Depends(get_current_user),
    customer_record: dict = Depends(get_customer_from_db)
):
    """
    Test endpoint to verify customer database lookup
    
    Requires: Valid JWT token
    """
    if customer_record:
        return {
            "success": True,
            "message": "Customer record found",
            "data": {
                "user": {
                    "userId": current_user.user_id,
                    "email": current_user.email,
                    "role": current_user.role
                },
                "customer": customer_record
            }
        }
    else:
        return {
            "success": True,
            "message": "Customer record not found (user exists but no customer record)",
            "data": {
                "user": {
                    "userId": current_user.user_id,
                    "email": current_user.email,
                    "role": current_user.role
                },
                "customer": None
            }
        }
