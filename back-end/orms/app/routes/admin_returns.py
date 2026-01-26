"""
Admin Return Management Routes
Handles administrative operations for return requests
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Optional, List
from datetime import datetime
from bson import ObjectId

from app.config.database import get_database
from app.dependencies.auth import get_current_user, require_admin
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.order_history import OrderHistory
from app.schemas.order import (
    ReturnReviewRequest,
    ReturnListItemResponse,
    ReturnDetailResponse
)
from app.services.customer_service import get_customer_service_client

router = APIRouter(
    prefix="/api/admin/returns",
    tags=["Admin Returns"]
)


@router.get("", response_model=Dict)
async def get_all_returns(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by return status (Pending, Approved, Rejected)"),
    customer_id: Optional[str] = Query(None, description="Filter by customer ID"),
    order_id: Optional[str] = Query(None, description="Filter by order ID"),
    from_date: Optional[str] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    db=Depends(get_database),
    current_user: Dict = Depends(get_current_user),
    _: None = Depends(require_admin)
):
    """
    Get all return requests with filtering and pagination
    Admin only access
    """
    try:
        # Build filter query
        filter_query = {"returnInfo": {"$exists": True}}
        
        if status:
            filter_query["returnInfo.status"] = status
        
        if customer_id:
            filter_query["customerId"] = customer_id
        
        if order_id:
            filter_query["orderId"] = order_id
        
        # Date range filter on returnInfo.requestedAt
        if from_date or to_date:
            date_filter = {}
            if from_date:
                try:
                    from_dt = datetime.strptime(from_date, "%Y-%m-%d")
                    date_filter["$gte"] = from_dt
                except ValueError:
                    raise HTTPException(status_code=400, detail="Invalid from_date format. Use YYYY-MM-DD")
            
            if to_date:
                try:
                    to_dt = datetime.strptime(to_date, "%Y-%m-%d")
                    # Set to end of day
                    to_dt = to_dt.replace(hour=23, minute=59, second=59, microsecond=999999)
                    date_filter["$lte"] = to_dt
                except ValueError:
                    raise HTTPException(status_code=400, detail="Invalid to_date format. Use YYYY-MM-DD")
            
            if date_filter:
                filter_query["returnInfo.requestedAt"] = date_filter
        
        # Count total matching returns
        total_returns = await db.orders.count_documents(filter_query)
        
        # Calculate pagination
        skip = (page - 1) * page_size
        total_pages = (total_returns + page_size - 1) // page_size
        
        # Fetch returns with pagination
        orders_cursor = db.orders.find(filter_query).sort("returnInfo.requestedAt", -1).skip(skip).limit(page_size)
        orders = await orders_cursor.to_list(length=page_size)
        
        # Build response items
        return_items = []
        for order in orders:
            try:
                # Get item count for this order
                item_count = await db.order_items.count_documents({"orderId": order["_id"]})
                
                return_info = order.get("returnInfo") or {}
                
                return_item = ReturnListItemResponse(
                    orderId=order.get("orderId") or "",
                    customerId=order.get("customerId") or "",
                    customerName=order.get("customerName") or "Unknown",
                    customerEmail=order.get("customerEmail") or "",
                    orderDate=order.get("orderDate") or datetime.utcnow(),
                    orderStatus=order.get("orderStatus") or "Unknown",
                    totalAmount=order.get("totalAmount") or 0.0,
                    returnStatus=return_info.get("status") or "Pending",
                    returnRequestedAt=return_info.get("requestedAt") or datetime.utcnow(),
                    itemCount=item_count
                )
                return_items.append(return_item.model_dump())
            except Exception as item_error:
                print(f"ERROR processing order {order.get('_id')}: {str(item_error)}")
                continue  # Skip malformed orders
        
        return {
            "returns": return_items,
            "pagination": {
                "currentPage": page,
                "pageSize": page_size,
                "totalReturns": total_returns,
                "totalPages": total_pages
            }
        }
    except Exception as e:
        print(f"ERROR in get_all_returns: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error listing returns: {str(e)}")


@router.get("/{order_id}", response_model=ReturnDetailResponse)
async def get_return_details(
    order_id: str,
    db=Depends(get_database),
    current_user: Dict = Depends(get_current_user),
    _: None = Depends(require_admin)
):
    """
    Get detailed information about a specific return request
    Admin only access
    """
    try:
        # Find order
        order = await db.orders.find_one({"orderId": order_id})
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        if "returnInfo" not in order or order.get("returnInfo") is None:
            raise HTTPException(status_code=404, detail="No return request found for this order")
        
        # Get order items with return details
        items_cursor = db.order_items.find({"orderId": order["_id"]})
        items = await items_cursor.to_list(length=None)
        
        # Filter to only items being returned
        return_items = []
        for item in items:
            if item.get("returnRequested", False):
                return_items.append({
                    "productId": item.get("productId", ""),
                    "productName": item.get("productName", "Unknown"),
                    "quantity": item.get("quantity", 0),
                    "returnQuantity": item.get("returnQuantity", item.get("quantity", 0)),
                    "price": item.get("price", 0.0),
                    "returnReason": item.get("returnReason", "")
                })
        
        return_info = order.get("returnInfo") or {}
        
        # Build response
        response = ReturnDetailResponse(
            orderId=order.get("orderId", ""),
            customerId=order.get("customerId", ""),
            customerName=order.get("customerName", "Unknown"),
            customerEmail=order.get("customerEmail", ""),
            orderDate=order.get("orderDate", datetime.utcnow()),
            orderStatus=order.get("orderStatus", "Unknown"),
            totalAmount=order.get("totalAmount", 0.0),
            shippingAddress=order.get("shippingAddress") or {},
            returnInfo={
                "status": return_info.get("status", "Pending"),
                "requestedAt": return_info.get("requestedAt", datetime.utcnow()),
                "items": return_items,
                "reviewedAt": return_info.get("reviewedAt"),
                "reviewedBy": return_info.get("reviewedBy"),
                "reviewNotes": return_info.get("reviewNotes")
            }
        )
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in get_return_details: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error getting return details: {str(e)}")


@router.post("/{order_id}/review", response_model=Dict)
async def review_return_request(
    order_id: str,
    review_request: ReturnReviewRequest,
    db=Depends(get_database),
    current_user: Dict = Depends(get_current_user),
    _: None = Depends(require_admin)
):
    """
    Review a return request (approve or reject)
    Admin only access
    
    When approved:
    - Updates order status to "Returned"
    - Updates CRMS statistics (decrements order count and value)
    - Creates order history entry
    
    When rejected:
    - Keeps order in current status
    - Creates order history entry with rejection reason
    """
    try:
        # Find order
        order = await db.orders.find_one({"orderId": order_id})
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return_info = order.get("returnInfo")
        if not return_info or "returnInfo" not in order:
            raise HTTPException(status_code=404, detail="No return request found for this order")
        
        # Check if already reviewed
        if return_info.get("status") != "Pending":
            raise HTTPException(
                status_code=400,
                detail=f"Return request has already been {return_info.get('status', 'processed').lower()}"
            )
        
        # Update return info
        current_time = datetime.utcnow()
        new_return_status = "Approved" if review_request.approve else "Rejected"
        new_order_status = "Returned" if review_request.approve else order.get("orderStatus", "Unknown")
        
        update_data = {
            "returnInfo.status": new_return_status,
            "returnInfo.reviewedAt": current_time,
            "returnInfo.reviewedBy": current_user["userId"],
            "returnInfo.reviewedByName": current_user.get("fullName", "Admin"),
            "returnInfo.reviewNotes": review_request.notes or ""
        }
        
        # If approved, update order status
        if review_request.approve:
            update_data["orderStatus"] = "Returned"
            update_data["updatedAt"] = current_time
        
        # Update order
        result = await db.orders.update_one(
            {"_id": order["_id"]},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Failed to update return request")
        
        # Create order history entry
        previous_status = order.get("orderStatus", "Unknown")
        history_notes = f"Return request {new_return_status.lower()}"
        if review_request.notes:
            history_notes += f": {review_request.notes}"
        
        await OrderHistory.create_history_entry(
            db=db,
            order_id=order["_id"],
            order_id_string=order.get("orderId", ""),
            previous_status=previous_status,
            new_status=new_order_status,
            changed_by=current_user["userId"],
            changed_by_role=current_user["role"],
            changed_by_name=current_user.get("fullName", "Admin"),
            notes=history_notes
        )
        
        # If approved, update CRMS statistics (decrement like cancellation)
        if review_request.approve:
            try:
                # Get customer service client
                customer_service = get_customer_service_client()
                
                # Get customer profile
                customer = await customer_service.get_customer_by_user_id(order.get("customerId"))
                
                if customer:
                    # Update statistics with negative value to decrement
                    await customer_service.update_order_statistics(
                        customer=customer,
                        order_value=-order.get("totalAmount", 0.0),  # Negative to decrement
                        increment_order_count=False,
                        decrement_order_count=True  # Decrement the order count
                    )
            except Exception as e:
                # Log error but don't fail the return approval
                print(f"Warning: Failed to update CRMS statistics for return approval: {str(e)}")
        
        # Fetch updated order
        updated_order = await db.orders.find_one({"_id": order["_id"]})
        
        return {
            "message": f"Return request {new_return_status.lower()} successfully",
            "orderId": order.get("orderId", ""),
            "returnStatus": new_return_status,
            "orderStatus": new_order_status,
            "reviewedBy": current_user.get("fullName", "Admin"),
            "reviewedAt": current_time.isoformat(),
            "totalAmount": order.get("totalAmount", 0.0)
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in review_return_request: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error reviewing return: {str(e)}")


@router.get("/stats/summary", response_model=Dict)
async def get_return_statistics(
    from_date: Optional[str] = Query(None, description="From date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="To date (YYYY-MM-DD)"),
    db=Depends(get_database),
    current_user: Dict = Depends(get_current_user),
    _: None = Depends(require_admin)
):
    """
    Get return statistics and summary
    Admin only access
    """
    # Build base filter
    filter_query = {"returnInfo": {"$exists": True}}
    
    # Add date range filter if provided
    if from_date or to_date:
        date_filter = {}
        if from_date:
            try:
                from_dt = datetime.strptime(from_date, "%Y-%m-%d")
                date_filter["$gte"] = from_dt
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid from_date format. Use YYYY-MM-DD")
        
        if to_date:
            try:
                to_dt = datetime.strptime(to_date, "%Y-%m-%d")
                to_dt = to_dt.replace(hour=23, minute=59, second=59, microsecond=999999)
                date_filter["$lte"] = to_dt
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid to_date format. Use YYYY-MM-DD")
        
        if date_filter:
            filter_query["returnInfo.requestedAt"] = date_filter
    
    # Get all returns
    all_returns = await db.orders.count_documents(filter_query)
    
    # Get returns by status
    pending_returns = await db.orders.count_documents({
        **filter_query,
        "returnInfo.status": "Pending"
    })
    
    approved_returns = await db.orders.count_documents({
        **filter_query,
        "returnInfo.status": "Approved"
    })
    
    rejected_returns = await db.orders.count_documents({
        **filter_query,
        "returnInfo.status": "Rejected"
    })
    
    # Calculate total value of approved returns
    approved_pipeline = [
        {"$match": {**filter_query, "returnInfo.status": "Approved"}},
        {"$group": {"_id": None, "totalValue": {"$sum": "$totalAmount"}}}
    ]
    
    approved_value_result = await db.orders.aggregate(approved_pipeline).to_list(length=1)
    approved_value = approved_value_result[0]["totalValue"] if approved_value_result else 0.0
    
    return {
        "summary": {
            "totalReturns": all_returns,
            "pendingReturns": pending_returns,
            "approvedReturns": approved_returns,
            "rejectedReturns": rejected_returns,
            "approvedReturnValue": round(approved_value, 2)
        },
        "statusBreakdown": {
            "Pending": pending_returns,
            "Approved": approved_returns,
            "Rejected": rejected_returns
        }
    }
