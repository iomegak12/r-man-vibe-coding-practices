"""
Admin Customer Management Router
Endpoints for administrators to manage customer records
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Annotated, Optional, List
from datetime import datetime
from bson import ObjectId

from app.config.database import get_database
from app.middleware.auth import get_current_user, JWTUser
from app.middleware.role import require_admin
from app.schemas.customer import (
    CustomerListItemResponse,
    CustomerDetailResponse,
    UpdateCustomerRequest,
    UpdateCustomerStatusRequest,
    UpdateCustomerTypeRequest,
    AddCustomerNotesRequest,
    CustomerStatisticsResponse,
    CustomerStatus,
    CustomerType
)
from app.schemas.response import APIResponse, PaginatedResponse
from app.utils.logger import info, error, debug, warning
from app.utils.pagination import calculate_pagination, create_paginated_response
from app.utils.validators import validate_object_id, sanitize_search_query


router = APIRouter()


@router.get(
    "",
    response_model=PaginatedResponse[CustomerListItemResponse],
    summary="List All Customers",
    description="""
Get paginated list of all customers with filtering and sorting capabilities.

**Authentication Required**: Admin/Administrator role

**Features**:
- Pagination support
- Filter by status (Active/Inactive/Suspended)
- Filter by type (Regular/Premium/VIP)
- Sort by any field (default: createdAt)
- Sort order control (asc/desc)

**Use Cases**:
- Admin dashboard customer listings
- Customer management interface
- Report generation
- Bulk operations planning
    """,
    responses={
        200: {
            "description": "Customers retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "items": [
                            {
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
                                "customerSince": "2025-06-15T10:00:00Z"
                            }
                        ],
                        "pagination": {
                            "currentPage": 1,
                            "totalPages": 10,
                            "totalItems": 100,
                            "itemsPerPage": 10,
                            "hasNextPage": True,
                            "hasPreviousPage": False
                        }
                    }
                }
            }
        },
        400: {"description": "Bad request - Invalid filter parameters"},
        401: {"description": "Authentication required"},
        403: {"description": "Forbidden - Admin privileges required"},
        500: {"description": "Internal server error"}
    }
)
async def list_customers(
    current_user: Annotated[JWTUser, Depends(require_admin)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)],
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(10, ge=1, le=100, description="Items per page (max 100)"),
    status: Optional[str] = Query(None, description="Filter by status: Active, Inactive, or Suspended"),
    type: Optional[str] = Query(None, description="Filter by type: Regular, Premium, or VIP"),
    sortBy: str = Query("customerSince", description="Field to sort by"),
    sortOrder: str = Query("desc", description="Sort order: asc or desc")
):
    """
    List all customers with advanced filtering, sorting, and pagination.
    
    Returns paginated customer list with comprehensive profile information.
    """
    try:
        # Build filter query
        filter_query = {}
        
        if status:
            if status not in [s.value for s in CustomerStatus]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status. Must be one of: {', '.join([s.value for s in CustomerStatus])}"
                )
            filter_query["customerStatus"] = status
        
        if type:
            if type not in [t.value for t in CustomerType]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid type. Must be one of: {', '.join([t.value for t in CustomerType])}"
                )
            filter_query["customerType"] = type
        
        # Get total count
        total_count = await db.customers.count_documents(filter_query)
        
        # Calculate pagination
        skip, pagination_meta = calculate_pagination(page, limit, total_count)
        
        # Build sort query
        sort_direction = -1 if sortOrder.lower() == "desc" else 1
        sort_query = [(sortBy, sort_direction)]
        
        # Fetch customers
        cursor = db.customers.find(filter_query).sort(sort_query).skip(skip).limit(limit)
        customers = await cursor.to_list(length=limit)
        
        # Convert to response format
        customer_list = [
            CustomerListItemResponse(
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
                customerSince=customer["customerSince"]
            )
            for customer in customers
        ]
        
        return create_paginated_response(
            items=customer_list,
            pagination=pagination_meta
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error listing customers: {str(e)}")
        from fastapi import status as http_status
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve customers"
        )


@router.get(
    "/search",
    response_model=PaginatedResponse[CustomerListItemResponse],
    summary="Search Customers",
    description="Search customers by name, email, or contact number"
)
async def search_customers(
    current_user: Annotated[JWTUser, Depends(require_admin)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)],
    q: str = Query(..., min_length=2, description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page")
):
    """
    Search customers by name, email, or contact number
    
    Uses text index for efficient searching
    """
    try:
        # Sanitize search query
        search_query = sanitize_search_query(q)
        
        # Build text search query
        filter_query = {
            "$text": {"$search": search_query}
        }
        
        # Get total count
        total_count = await db.customers.count_documents(filter_query)
        
        # Calculate pagination
        skip, pagination_meta = calculate_pagination(page, limit, total_count)
        
        # Fetch customers with text score
        cursor = db.customers.find(
            filter_query,
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})]).skip(skip).limit(limit)
        
        customers = await cursor.to_list(length=limit)
        
        # Convert to response format
        customer_list = [
            CustomerListItemResponse(
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
                customerSince=customer["customerSince"]
            )
            for customer in customers
        ]
        
        return create_paginated_response(
            items=customer_list,
            pagination=pagination_meta
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error searching customers: {str(e)}")
        from fastapi import status as http_status
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search customers"
        )


@router.get(
    "/analytics",
    response_model=APIResponse[dict],
    summary="Get Customer Analytics",
    description="""
Get comprehensive customer analytics and business intelligence metrics.

**Authentication Required**: Admin/Administrator role

**Analytics Include**:
- Total customer count
- Breakdown by status (Active/Inactive/Suspended)
- Breakdown by type (Regular/Premium/VIP)
- Order statistics (customers with orders, total orders)
- Complaint statistics (customers with complaints, total complaints)
- New customer count (this month)
- Aggregated business metrics

**Use Cases**:
- Admin dashboard KPIs
- Business intelligence reporting
- Customer segmentation analysis
- Performance monitoring
    """,
    responses={
        200: {
            "description": "Analytics retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Customer analytics retrieved successfully",
                        "data": {
                            "totalCustomers": 1250,
                            "byStatus": {
                                "Active": 1100,
                                "Inactive": 120,
                                "Suspended": 30
                            },
                            "byType": {
                                "Regular": 900,
                                "Premium": 280,
                                "VIP": 70
                            },
                            "orderStats": {
                                "customersWithOrders": 850,
                                "totalOrders": 5420
                            },
                            "complaintStats": {
                                "customersWithComplaints": 245,
                                "totalComplaints": 320
                            },
                            "newCustomersThisMonth": 48
                        }
                    }
                }
            }
        },
        401: {"description": "Authentication required"},
        403: {"description": "Forbidden - Admin privileges required"},
        500: {"description": "Internal server error"}
    }
)
async def get_customer_analytics(
    current_user: Annotated[JWTUser, Depends(require_admin)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """
    Get comprehensive customer analytics for business intelligence and reporting.
    
    Aggregates various customer metrics including status distribution, type breakdown,
    order/complaint statistics, and growth metrics.
    """
    try:
        # Total customers
        total_customers = await db.customers.count_documents({})
        
        # Customers by status
        status_pipeline = [
            {"$group": {"_id": "$customerStatus", "count": {"$sum": 1}}}
        ]
        status_counts = await db.customers.aggregate(status_pipeline).to_list(None)
        customers_by_status = {item["_id"]: item["count"] for item in status_counts}
        
        # Customers by type
        type_pipeline = [
            {"$group": {"_id": "$customerType", "count": {"$sum": 1}}}
        ]
        type_counts = await db.customers.aggregate(type_pipeline).to_list(None)
        customers_by_type = {item["_id"]: item["count"] for item in type_counts}
        
        # Total order statistics
        order_stats_pipeline = [
            {
                "$group": {
                    "_id": None,
                    "totalOrders": {"$sum": "$totalOrders"},
                    "totalOrderValue": {"$sum": "$totalOrderValue"},
                    "avgOrderValue": {"$avg": "$totalOrderValue"}
                }
            }
        ]
        order_stats = await db.customers.aggregate(order_stats_pipeline).to_list(None)
        order_statistics = order_stats[0] if order_stats else {
            "totalOrders": 0,
            "totalOrderValue": 0.0,
            "avgOrderValue": 0.0
        }
        
        # Total complaint statistics
        complaint_stats_pipeline = [
            {
                "$group": {
                    "_id": None,
                    "totalComplaints": {"$sum": "$totalComplaints"},
                    "totalOpenComplaints": {"$sum": "$openComplaints"}
                }
            }
        ]
        complaint_stats = await db.customers.aggregate(complaint_stats_pipeline).to_list(None)
        complaint_statistics = complaint_stats[0] if complaint_stats else {
            "totalComplaints": 0,
            "totalOpenComplaints": 0
        }
        
        # New customers this month
        from datetime import datetime, timedelta
        start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_customers_this_month = await db.customers.count_documents({
            "customerSince": {"$gte": start_of_month}
        })
        
        analytics_data = {
            "totalCustomers": total_customers,
            "customersByStatus": customers_by_status,
            "customersByType": customers_by_type,
            "orderStatistics": {
                "totalOrders": order_statistics.get("totalOrders", 0),
                "totalOrderValue": order_statistics.get("totalOrderValue", 0.0),
                "averageOrderValue": order_statistics.get("avgOrderValue", 0.0)
            },
            "complaintStatistics": {
                "totalComplaints": complaint_statistics.get("totalComplaints", 0),
                "openComplaints": complaint_statistics.get("totalOpenComplaints", 0)
            },
            "newCustomersThisMonth": new_customers_this_month,
            "generatedAt": datetime.utcnow()
        }
        
        return APIResponse(
            success=True,
            message="Customer analytics retrieved successfully",
            data=analytics_data
        )
        
    except Exception as e:
        error(f"Error fetching customer analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve customer analytics"
        )


@router.get(
    "/{customerId}",
    response_model=APIResponse[CustomerDetailResponse],
    summary="Get Customer Details",
    description="Get detailed information about a specific customer"
)
async def get_customer(
    customerId: str,
    current_user: Annotated[JWTUser, Depends(require_admin)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """
    Get detailed customer information by customer ID
    """
    try:
        # Validate ObjectId
        if not validate_object_id(customerId):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid customer ID format"
            )
        
        # Find customer
        customer = await db.customers.find_one({"_id": ObjectId(customerId)})
        
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        # Convert to response format
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
            message="Customer details retrieved successfully",
            data=customer_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error fetching customer details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve customer details"
        )


@router.put(
    "/{customerId}",
    response_model=APIResponse[CustomerDetailResponse],
    summary="Update Customer",
    description="Update customer profile information"
)
async def update_customer(
    customerId: str,
    request: UpdateCustomerRequest,
    current_user: Annotated[JWTUser, Depends(require_admin)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """
    Update customer profile information
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
        if request.fullName is not None:
            update_data["fullName"] = request.fullName
        if request.contactNumber is not None:
            update_data["contactNumber"] = request.contactNumber
        if request.tags is not None:
            update_data["tags"] = request.tags
        if request.preferences is not None:
            update_data["preferences"] = request.preferences
        
        # Update metadata
        update_data["metadata.lastModifiedBy"] = current_user.user_id
        update_data["metadata.lastModifiedAt"] = datetime.utcnow()
        
        # Update customer
        result = await db.customers.update_one(
            {"_id": ObjectId(customerId)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            warning(f"No changes made to customer {customerId}")
        
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
        
        info(f"✅ Customer {customerId} updated by admin {current_user.email}")
        
        return APIResponse(
            success=True,
            message="Customer updated successfully",
            data=customer_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error updating customer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update customer"
        )


@router.patch(
    "/{customerId}/status",
    response_model=APIResponse[CustomerDetailResponse],
    summary="Update Customer Status",
    description="Update customer status (Active/Inactive/Suspended)"
)
async def update_customer_status(
    customerId: str,
    request: UpdateCustomerStatusRequest,
    current_user: Annotated[JWTUser, Depends(require_admin)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """
    Update customer status
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
        
        # Update status
        update_data = {
            "customerStatus": request.status.value,
            "metadata.lastModifiedBy": current_user.user_id,
            "metadata.lastModifiedAt": datetime.utcnow()
        }
        
        await db.customers.update_one(
            {"_id": ObjectId(customerId)},
            {"$set": update_data}
        )
        
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
        
        info(f"✅ Customer {customerId} status updated to {request.status.value} by admin {current_user.email}")
        
        return APIResponse(
            success=True,
            message=f"Customer status updated to {request.status.value}",
            data=customer_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error updating customer status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update customer status"
        )


@router.patch(
    "/{customerId}/type",
    response_model=APIResponse[CustomerDetailResponse],
    summary="Update Customer Type",
    description="Update customer type (Regular/Premium/VIP)"
)
async def update_customer_type(
    customerId: str,
    request: UpdateCustomerTypeRequest,
    current_user: Annotated[JWTUser, Depends(require_admin)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """
    Update customer type
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
        
        # Update type
        update_data = {
            "customerType": request.type.value,
            "metadata.lastModifiedBy": current_user.user_id,
            "metadata.lastModifiedAt": datetime.utcnow()
        }
        
        await db.customers.update_one(
            {"_id": ObjectId(customerId)},
            {"$set": update_data}
        )
        
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
        
        info(f"✅ Customer {customerId} type updated to {request.type.value} by admin {current_user.email}")
        
        return APIResponse(
            success=True,
            message=f"Customer type updated to {request.type.value}",
            data=customer_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error updating customer type: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update customer type"
        )


@router.post(
    "/{customerId}/notes",
    response_model=APIResponse[CustomerDetailResponse],
    summary="Add Customer Notes",
    description="Add administrative notes to customer record"
)
async def add_customer_notes(
    customerId: str,
    request: AddCustomerNotesRequest,
    current_user: Annotated[JWTUser, Depends(require_admin)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """
    Add notes to customer record
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
        
        # Create note entry
        note_entry = {
            "note": request.notes,
            "addedBy": current_user.user_id,
            "addedAt": datetime.utcnow()
        }
        
        # Add note to customer
        await db.customers.update_one(
            {"_id": ObjectId(customerId)},
            {
                "$push": {"notes": note_entry},
                "$set": {
                    "metadata.lastModifiedBy": current_user.user_id,
                    "metadata.lastModifiedAt": datetime.utcnow()
                }
            }
        )
        
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
        
        info(f"✅ Note added to customer {customerId} by admin {current_user.email}")
        
        return APIResponse(
            success=True,
            message="Note added successfully",
            data=customer_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error adding customer note: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add customer note"
        )


@router.delete(
    "/{customerId}",
    response_model=APIResponse[dict],
    summary="Delete Customer",
    description="Delete a customer record (soft delete by setting status to Inactive)"
)
async def delete_customer(
    customerId: str,
    current_user: Annotated[JWTUser, Depends(require_admin)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """
    Delete customer (soft delete - sets status to Inactive)
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
        
        # Soft delete - set status to Inactive
        await db.customers.update_one(
            {"_id": ObjectId(customerId)},
            {
                "$set": {
                    "customerStatus": CustomerStatus.INACTIVE.value,
                    "metadata.lastModifiedBy": current_user.user_id,
                    "metadata.lastModifiedAt": datetime.utcnow(),
                    "metadata.deletedBy": current_user.user_id,
                    "metadata.deletedAt": datetime.utcnow()
                }
            }
        )
        
        info(f"✅ Customer {customerId} deleted (soft) by admin {current_user.email}")
        
        return APIResponse(
            success=True,
            message="Customer deleted successfully",
            data={"customerId": customerId, "deletedAt": datetime.utcnow()}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error deleting customer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete customer"
        )


@router.get(
    "/{customerId}/orders",
    response_model=APIResponse[dict],
    summary="Get Customer Orders",
    description="Get list of orders for a specific customer (requires Order Service integration)"
)
async def get_customer_orders(
    customerId: str,
    current_user: Annotated[JWTUser, Depends(require_admin)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)],
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page")
):
    """
    Get customer orders (placeholder - requires Order Service integration)
    """
    try:
        # Validate ObjectId
        if not validate_object_id(customerId):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid customer ID format"
            )
        
        # Check if customer exists
        customer = await db.customers.find_one({"_id": ObjectId(customerId)})
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        # Placeholder response until Order Service is implemented
        info(f"Orders requested for customer {customerId} - Order Service integration pending")
        
        return APIResponse(
            success=True,
            message="Order Service integration pending",
            data={
                "customerId": customerId,
                "orders": [],
                "totalOrders": customer["totalOrders"],
                "note": "This endpoint will be implemented when Order Service is available"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error fetching customer orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve customer orders"
        )


@router.get(
    "/{customerId}/complaints",
    response_model=APIResponse[dict],
    summary="Get Customer Complaints",
    description="Get list of complaints for a specific customer (requires Complaint Service integration)"
)
async def get_customer_complaints(
    customerId: str,
    current_user: Annotated[JWTUser, Depends(require_admin)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)],
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page")
):
    """
    Get customer complaints (placeholder - requires Complaint Service integration)
    """
    try:
        # Validate ObjectId
        if not validate_object_id(customerId):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid customer ID format"
            )
        
        # Check if customer exists
        customer = await db.customers.find_one({"_id": ObjectId(customerId)})
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )
        
        # Placeholder response until Complaint Service is implemented
        info(f"Complaints requested for customer {customerId} - Complaint Service integration pending")
        
        return APIResponse(
            success=True,
            message="Complaint Service integration pending",
            data={
                "customerId": customerId,
                "complaints": [],
                "totalComplaints": customer["totalComplaints"],
                "openComplaints": customer["openComplaints"],
                "note": "This endpoint will be implemented when Complaint Service is available"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error fetching customer complaints: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve customer complaints"
        )
