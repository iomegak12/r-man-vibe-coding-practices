"""
Customer Profile Router
Endpoints for customers to view their own profile and statistics
"""
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Annotated
from datetime import datetime

from app.config.database import get_database
from app.middleware.auth import get_current_user, JWTUser
from app.middleware.role import require_customer, require_customer_or_admin
from app.services.auth_client import auth_service_client
from app.schemas.customer import (
    CustomerDetailResponse,
    CustomerStatisticsResponse,
    CustomerStatus,
    CustomerType
)
from app.schemas.response import APIResponse
from app.utils.logger import info, error, debug
from app.models.customer import Customer


router = APIRouter()


async def get_or_create_customer(
    user: JWTUser,
    db: AsyncIOMotorDatabase
) -> dict:
    """
    Get customer from database or create if not exists
    
    Args:
        user: Current authenticated user
        db: Database connection
        
    Returns:
        Customer document
        
    Raises:
        HTTPException: If customer creation fails
    """
    # Try to find existing customer
    customer = await db.customers.find_one({"userId": user.user_id})
    
    if customer:
        debug(f"Found existing customer: {user.email}")
        return customer
    
    # Customer doesn't exist, fetch from Auth Service and create
    info(f"Customer not found in DB, creating new record for: {user.email}")
    
    try:
        # Fetch user details from Auth Service
        user_data = await auth_service_client.get_user_by_id(user.user_id)
        
        if not user_data:
            error(f"Failed to fetch user data from Auth Service for userId: {user.user_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve user information"
            )
        
        # Create new customer record with denormalized data
        now = datetime.utcnow()
        new_customer = {
            "userId": user.user_id,
            "email": user_data.get("email"),
            "fullName": user_data.get("fullName", ""),
            "contactNumber": user_data.get("contactNumber", ""),
            "customerStatus": CustomerStatus.ACTIVE.value,
            "customerType": CustomerType.REGULAR.value,
            "totalOrders": 0,
            "totalOrderValue": 0.0,
            "totalComplaints": 0,
            "openComplaints": 0,
            "lastOrderDate": None,
            "lastComplaintDate": None,
            "customerSince": now,
            "notes": [],
            "tags": [],
            "preferences": {},
            "metadata": {
                "createdBy": "system",
                "createdAt": now,
                "lastModifiedBy": "system",
                "lastModifiedAt": now
            }
        }
        
        # Insert into database
        result = await db.customers.insert_one(new_customer)
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create customer record"
            )
        
        new_customer["_id"] = result.inserted_id
        info(f"✅ Created new customer record for: {user.email}")
        
        return new_customer
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error creating customer record: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create customer record"
        )


@router.get(
    "/me",
    response_model=APIResponse[CustomerDetailResponse],
    summary="Get Own Profile",
    description="""
Get the authenticated customer's profile information.

**Authentication Required**: Customer or Admin role

**Auto-Creation**: If customer record doesn't exist, it will be automatically created 
from Auth Service user data.

**Response Includes**:
- Customer ID and user ID
- Contact information (email, phone, name)
- Account status and type/tier
- Order and complaint statistics
- Customer notes (for admins)
- Tags and preferences
- Metadata (login history, activity tracking)
    """,
    responses={
        200: {
            "description": "Customer profile retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Customer profile retrieved successfully",
                        "data": {
                            "customerId": "507f1f77bcf86cd799439011",
                            "userId": "507f191e810c19729de860ea",
                            "email": "customer@example.com",
                            "fullName": "John Doe",
                            "contactNumber": "+1234567890",
                            "customerStatus": "Active",
                            "customerType": "Premium",
                            "totalOrders": 25,
                            "totalOrderValue": 2500.50,
                            "totalComplaints": 2,
                            "openComplaints": 0,
                            "lastOrderDate": "2026-01-20T14:30:00Z",
                            "customerSince": "2025-06-15T10:00:00Z",
                            "notes": [],
                            "tags": ["vip"],
                            "preferences": {"newsletter": True},
                            "metadata": {"loginCount": 42}
                        }
                    }
                }
            }
        },
        401: {"description": "Authentication required - Missing or invalid JWT token"},
        403: {"description": "Forbidden - Insufficient permissions"},
        500: {"description": "Internal server error - Failed to retrieve profile"}
    }
)
async def get_my_profile(
    current_user: Annotated[JWTUser, Depends(require_customer_or_admin)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """
    Get customer's own profile with automatic creation if not exists
    """
    try:
        # Get or create customer record
        customer = await get_or_create_customer(current_user, db)
        
        # Convert MongoDB document to response format
        customer_response = CustomerDetailResponse(
            customerId=str(customer["_id"]),
            userId=customer["userId"],
            email=customer["email"],
            fullName=customer.get("fullName", ""),
            contactNumber=customer.get("contactNumber", ""),
            customerStatus=customer["customerStatus"],
            customerType=customer["customerType"],
            totalOrders=customer["totalOrders"],
            totalOrderValue=customer["totalOrderValue"],
            totalComplaints=customer["totalComplaints"],
            openComplaints=customer["openComplaints"],
            lastOrderDate=customer.get("lastOrderDate"),
            lastComplaintDate=customer.get("lastComplaintDate"),
            customerSince=customer["customerSince"],
            notes=customer.get("notes", []),
            tags=customer.get("tags", []),
            preferences=customer.get("preferences", {}),
            metadata=customer.get("metadata", {})
        )
        
        return APIResponse(
            success=True,
            message="Customer profile retrieved successfully",
            data=customer_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error fetching customer profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve customer profile"
        )


@router.get(
    "/me/statistics",
    response_model=APIResponse[CustomerStatisticsResponse],
    summary="Get Own Statistics",
    description="""
Get aggregated statistics for the authenticated customer.

**Authentication Required**: Customer or Admin role

**Statistics Include**:
- Total orders placed
- Total order value (revenue)
- Total complaints filed
- Open complaints count
- Last order date
- Last complaint date

**Use Cases**:
- Dashboard metrics display
- Customer loyalty program calculations
- Activity tracking
    """,
    responses={
        200: {
            "description": "Customer statistics retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Customer statistics retrieved successfully",
                        "data": {
                            "totalOrders": 25,
                            "totalOrderValue": 2500.50,
                            "totalComplaints": 2,
                            "openComplaints": 0,
                            "lastOrderDate": "2026-01-20T14:30:00Z",
                            "lastComplaintDate": "2025-12-10T09:15:00Z"
                        }
                    }
                }
            }
        },
        401: {"description": "Authentication required"},
        403: {"description": "Forbidden - Insufficient permissions"},
        500: {"description": "Internal server error"}
    }
)
async def get_my_statistics(
    current_user: Annotated[JWTUser, Depends(require_customer_or_admin)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """
    Get customer's own statistics
    
    Returns:
        Customer statistics including orders and complaints
    """
    try:
        # Get or create customer record
        customer = await get_or_create_customer(current_user, db)
        
        # Build statistics response
        statistics = CustomerStatisticsResponse(
            customerId=str(customer["_id"]),
            userId=customer["userId"],
            email=customer["email"],
            fullName=customer.get("fullName", ""),
            customerStatus=customer["customerStatus"],
            customerType=customer["customerType"],
            totalOrders=customer["totalOrders"],
            totalOrderValue=customer["totalOrderValue"],
            totalComplaints=customer["totalComplaints"],
            openComplaints=customer["openComplaints"],
            lastOrderDate=customer.get("lastOrderDate"),
            lastComplaintDate=customer.get("lastComplaintDate"),
            customerSince=customer["customerSince"]
        )
        
        return APIResponse(
            success=True,
            message="Customer statistics retrieved successfully",
            data=statistics
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error fetching customer statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve customer statistics"
        )
