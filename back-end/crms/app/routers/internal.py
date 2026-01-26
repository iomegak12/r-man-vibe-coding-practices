"""
Internal Service Endpoints Router
Endpoints for service-to-service communication (ATHS, Order Service, Complaint Service)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Annotated
from datetime import datetime
from bson import ObjectId

from app.config.database import get_database
from app.middleware.service_auth import verify_service_api_key
from app.schemas.customer import (
    CreateCustomerRequest,
    UpdateCustomerStatisticsRequest,
    CustomerDetailResponse,
    CustomerStatus,
    CustomerType
)
from app.schemas.response import APIResponse
from app.utils.logger import info, error, debug, warning
from app.utils.validators import validate_object_id


router = APIRouter()


@router.post(
    "/create",
    response_model=APIResponse[CustomerDetailResponse],
    summary="Create Customer (Internal)",
    description="""
Create a new customer record - **Internal Service API**

**Authentication Required**: Service API Key (x-api-key header)

**Purpose**: Called by Auth Service (ATHS) when a new user registers with Customer role.

**Behavior**:
- Creates new customer profile with denormalized user data
- Sets default status to Active
- Sets default type to Regular
- Initializes all statistics to 0
- Returns existing customer if already exists (idempotent)

**Integration**: Add this endpoint to ATHS registration flow to auto-create customer records.
    """,
    responses={
        200: {
            "description": "Customer created successfully (or already exists)",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Customer created successfully",
                        "data": {
                            "customerId": "507f1f77bcf86cd799439011",
                            "userId": "507f191e810c19729de860ea",
                            "email": "newcustomer@example.com",
                            "fullName": "New Customer",
                            "contactNumber": "+1234567890",
                            "customerStatus": "Active",
                            "customerType": "Regular",
                            "totalOrders": 0,
                            "totalOrderValue": 0.0,
                            "totalComplaints": 0,
                            "openComplaints": 0,
                            "lastOrderDate": None,
                            "customerSince": "2026-01-26T10:30:00Z",
                            "notes": [],
                            "tags": [],
                            "preferences": {},
                            "metadata": {}
                        }
                    }
                }
            }
        },
        400: {"description": "Bad request - Invalid request data"},
        401: {"description": "Unauthorized - Invalid or missing service API key"},
        500: {"description": "Internal server error"}
    }
)
async def create_customer_internal(
    request: CreateCustomerRequest,
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)],
    _: Annotated[bool, Depends(verify_service_api_key)]
):
    """
    Create customer record from Auth Service registration (idempotent operation).
    
    Called automatically by ATHS when users register with Customer role.
    Returns existing customer if userId already has a record.
    """
    try:
        # Check if customer already exists
        existing_customer = await db.customers.find_one({"userId": request.userId})
        
        if existing_customer:
            warning(f"Customer already exists for userId: {request.userId}")
            # Return existing customer instead of error
            customer_response = CustomerDetailResponse(
                customerId=str(existing_customer["_id"]),
                userId=existing_customer["userId"],
                email=existing_customer["email"],
                fullName=existing_customer.get("fullName", ""),
                contactNumber=existing_customer.get("contactNumber", ""),
                customerStatus=existing_customer["customerStatus"],
                customerType=existing_customer["customerType"],
                totalOrders=existing_customer["totalOrders"],
                totalOrderValue=existing_customer["totalOrderValue"],
                totalComplaints=existing_customer["totalComplaints"],
                openComplaints=existing_customer["openComplaints"],
                lastOrderDate=existing_customer.get("lastOrderDate"),
                lastComplaintDate=existing_customer.get("lastComplaintDate"),
                customerSince=existing_customer["customerSince"],
                notes=existing_customer.get("notes", []),
                tags=existing_customer.get("tags", []),
                preferences=existing_customer.get("preferences", {}),
                metadata=existing_customer.get("metadata", {})
            )
            
            return APIResponse(
                success=True,
                message="Customer already exists",
                data=customer_response
            )
        
        # Create new customer record
        now = datetime.utcnow()
        new_customer = {
            "userId": request.userId,
            "email": request.email,
            "fullName": request.fullName or "",
            "contactNumber": request.contactNumber or "",
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
                "createdBy": "auth-service",
                "createdAt": now,
                "lastModifiedBy": "auth-service",
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
        
        customer_response = CustomerDetailResponse(
            customerId=str(new_customer["_id"]),
            userId=new_customer["userId"],
            email=new_customer["email"],
            fullName=new_customer.get("fullName", ""),
            contactNumber=new_customer.get("contactNumber", ""),
            customerStatus=new_customer["customerStatus"],
            customerType=new_customer["customerType"],
            totalOrders=new_customer["totalOrders"],
            totalOrderValue=new_customer["totalOrderValue"],
            totalComplaints=new_customer["totalComplaints"],
            openComplaints=new_customer["openComplaints"],
            lastOrderDate=new_customer.get("lastOrderDate"),
            lastComplaintDate=new_customer.get("lastComplaintDate"),
            customerSince=new_customer["customerSince"],
            notes=new_customer.get("notes", []),
            tags=new_customer.get("tags", []),
            preferences=new_customer.get("preferences", {}),
            metadata=new_customer.get("metadata", {})
        )
        
        info(f"✅ Customer created via internal endpoint: {request.email} (userId: {request.userId})")
        
        return APIResponse(
            success=True,
            message="Customer created successfully",
            data=customer_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error creating customer via internal endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create customer record"
        )


@router.patch(
    "/{customerId}/statistics",
    response_model=APIResponse[CustomerDetailResponse],
    summary="Update Customer Statistics (Internal)",
    description="Update customer order/complaint statistics from Order Service or Complaint Service"
)
async def update_customer_statistics_internal(
    customerId: str,
    request: UpdateCustomerStatisticsRequest,
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)],
    _: Annotated[bool, Depends(verify_service_api_key)]
):
    """
    Update customer statistics (called by Order Service or Complaint Service)
    
    This endpoint is called when:
    - Order Service creates/updates orders
    - Complaint Service creates/updates complaints
    """
    try:
        # Validate ObjectId
        if not validate_object_id(customerId):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid customer ID format"
            )
        
        # Check if customer exists
        existing_customer = await db.customers.find_one({"_id": ObjectId(customerId)})
        if not existing_customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        # Build update data
        update_data = {}
        
        if request.totalOrders is not None:
            update_data["totalOrders"] = request.totalOrders
        
        if request.totalOrderValue is not None:
            update_data["totalOrderValue"] = request.totalOrderValue
        
        if request.lastOrderDate is not None:
            update_data["lastOrderDate"] = request.lastOrderDate
        
        if request.totalComplaints is not None:
            update_data["totalComplaints"] = request.totalComplaints
        
        if request.openComplaints is not None:
            update_data["openComplaints"] = request.openComplaints
        
        if request.lastComplaintDate is not None:
            update_data["lastComplaintDate"] = request.lastComplaintDate
        
        # Update metadata
        update_data["metadata.lastModifiedBy"] = "system"
        update_data["metadata.lastModifiedAt"] = datetime.utcnow()
        
        # Update customer
        result = await db.customers.update_one(
            {"_id": ObjectId(customerId)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            debug(f"No changes made to customer statistics for {customerId}")
        
        # Fetch updated customer
        updated_customer = await db.customers.find_one({"_id": ObjectId(customerId)})
        
        customer_response = CustomerDetailResponse(
            customerId=str(updated_customer["_id"]),
            userId=updated_customer["userId"],
            email=updated_customer["email"],
            fullName=updated_customer.get("fullName", ""),
            contactNumber=updated_customer.get("contactNumber", ""),
            customerStatus=updated_customer["customerStatus"],
            customerType=updated_customer["customerType"],
            totalOrders=updated_customer["totalOrders"],
            totalOrderValue=updated_customer["totalOrderValue"],
            totalComplaints=updated_customer["totalComplaints"],
            openComplaints=updated_customer["openComplaints"],
            lastOrderDate=updated_customer.get("lastOrderDate"),
            lastComplaintDate=updated_customer.get("lastComplaintDate"),
            customerSince=updated_customer["customerSince"],
            notes=updated_customer.get("notes", []),
            tags=updated_customer.get("tags", []),
            preferences=updated_customer.get("preferences", {}),
            metadata=updated_customer.get("metadata", {})
        )
        
        info(f"✅ Customer statistics updated: {customerId}")
        
        return APIResponse(
            success=True,
            message="Customer statistics updated successfully",
            data=customer_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error updating customer statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update customer statistics"
        )


@router.get(
    "/user/{userId}",
    response_model=APIResponse[CustomerDetailResponse],
    summary="Get Customer by User ID (Internal)",
    description="Get customer record by userId for service-to-service lookups"
)
async def get_customer_by_user_id_internal(
    userId: str,
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)],
    _: Annotated[bool, Depends(verify_service_api_key)]
):
    """
    Get customer by userId (for service-to-service communication)
    
    Used by other services to lookup customer information by userId
    """
    try:
        # Find customer by userId
        customer = await db.customers.find_one({"userId": userId})
        
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
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
        
        debug(f"Customer retrieved by userId: {userId}")
        
        return APIResponse(
            success=True,
            message="Customer retrieved successfully",
            data=customer_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error fetching customer by userId: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve customer"
        )
