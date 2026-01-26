"""
Admin Order Management Routes
Handles administrative order operations (list all, update status, analytics)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Dict, Optional, List
from datetime import datetime, timedelta
from bson import ObjectId

from app.config.database import get_database
from app.dependencies.auth import require_admin
from app.schemas.order import (
    UpdateOrderStatusRequest,
    OrderDetailResponse,
    OrderListItemResponse
)
from app.schemas.response import APIResponse, PaginatedResponse
from app.models.order import Order
from app.models.order_history import OrderHistory
from app.utils.logger import info, error
from app.utils.pagination import calculate_pagination, create_paginated_response
from app.utils.validators import sanitize_search_query

router = APIRouter(prefix="/api/admin/orders", tags=["Admin - Orders"])


@router.get(
    "",
    response_model=PaginatedResponse[OrderListItemResponse],
    summary="List all orders (Admin)",
    description="Get a paginated list of all orders with filtering and search capabilities."
)
async def get_all_orders(
    current_user: Dict = Depends(require_admin),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    order_status: Optional[str] = Query(None, description="Filter by order status"),
    customer_id: Optional[str] = Query(None, description="Filter by customer ID"),
    search: Optional[str] = Query(None, description="Search in order ID, customer name, email"),
    from_date: Optional[str] = Query(None, description="Filter orders from this date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="Filter orders to this date (YYYY-MM-DD)"),
    db = Depends(get_database)
):
    """
    Get a paginated list of all orders (Admin only).
    
    - Supports pagination
    - Filter by order status
    - Filter by customer ID
    - Filter by date range
    - Search by order ID, customer name, or email
    - Sorted by order date (newest first)
    
    Returns paginated order list with summary information.
    """
    try:
        user_id = current_user.get("userId")
        
        info(f"Admin {user_id} fetching all orders, page: {page}, status: {order_status}")
        
        # Build query
        query = {}
        
        # Add status filter
        if order_status:
            query["status"] = order_status
        
        # Add customer filter
        if customer_id:
            query["customerId"] = customer_id
        
        # Add date range filter
        if from_date or to_date:
            date_query = {}
            if from_date:
                try:
                    from_datetime = datetime.fromisoformat(from_date)
                    date_query["$gte"] = from_datetime
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid from_date format. Use YYYY-MM-DD"
                    )
            if to_date:
                try:
                    to_datetime = datetime.fromisoformat(to_date)
                    # Add 1 day to include the entire to_date
                    to_datetime = to_datetime + timedelta(days=1)
                    date_query["$lt"] = to_datetime
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid to_date format. Use YYYY-MM-DD"
                    )
            query["orderDate"] = date_query
        
        # Add search filter
        if search:
            sanitized_search = sanitize_search_query(search)
            query["$or"] = [
                {"orderId": {"$regex": sanitized_search, "$options": "i"}},
                {"customerName": {"$regex": sanitized_search, "$options": "i"}},
                {"customerEmail": {"$regex": sanitized_search, "$options": "i"}}
            ]
        
        # Get total count
        total = await db.orders.count_documents(query)
        
        # Calculate pagination
        skip, pagination_meta = calculate_pagination(page, page_size, total)
        
        # Fetch orders
        cursor = db.orders.find(query).sort("orderDate", -1).skip(skip).limit(page_size)
        orders = await cursor.to_list(length=page_size)
        
        # Build response items
        items = [
            OrderListItemResponse(
                orderId=order["orderId"],
                customerId=order["customerId"],
                customerName=order["customerName"],
                customerEmail=order["customerEmail"],
                deliveryAddress=order["deliveryAddress"],
                totalAmount=order["totalAmount"],
                status=order["status"],
                orderDate=order["orderDate"],
                estimatedDeliveryDate=order.get("estimatedDeliveryDate"),
                actualDeliveryDate=order.get("actualDeliveryDate"),
                itemCount=await db.order_items.count_documents({"orderIdString": order["orderId"]})
            )
            for order in orders
        ]
        
        info(f"Found {total} orders (admin query)")
        
        return create_paginated_response(
            items=items,
            pagination=pagination_meta
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error fetching all orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch orders. Please try again."
        )


@router.patch(
    "/{order_id}/status",
    response_model=APIResponse[OrderDetailResponse],
    summary="Update order status (Admin)",
    description="Update the status of an order. Creates a history entry for the status change."
)
async def update_order_status(
    order_id: str,
    status_update: UpdateOrderStatusRequest,
    current_user: Dict = Depends(require_admin),
    db = Depends(get_database)
):
    """
    Update order status (Admin only).
    
    - Updates order status
    - Creates order history entry
    - Validates status transitions
    - Updates delivery dates for certain statuses
    
    Returns updated order details.
    """
    try:
        user_id = current_user.get("userId")
        admin_name = current_user.get("fullName", "Admin User")
        
        info(f"Admin {user_id} updating order {order_id} status to {status_update.status}")
        
        # Find order
        order = await db.orders.find_one({"orderId": order_id})
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        previous_status = order["status"]
        new_status = status_update.status.value
        
        # Prevent updating already cancelled or returned orders
        if previous_status in ["Cancelled", "Returned"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot update status of {previous_status.lower()} orders"
            )
        
        # Build update document
        update_doc = {
            "status": new_status,
            "updatedAt": datetime.utcnow()
        }
        
        # Set delivery dates based on status
        if new_status == "Shipped" and not order.get("estimatedDeliveryDate"):
            # Set estimated delivery to 5 days from now
            update_doc["estimatedDeliveryDate"] = datetime.utcnow() + timedelta(days=5)
        elif new_status == "Delivered":
            update_doc["actualDeliveryDate"] = datetime.utcnow()
        
        # Update order
        result = await db.orders.update_one(
            {"orderId": order_id},
            {"$set": update_doc}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update order status"
            )
        
        # Create order history entry
        history_doc = OrderHistory.create_history_entry(
            order_id=order["_id"],
            order_id_string=order_id,
            previous_status=previous_status,
            new_status=new_status,
            changed_by=user_id,
            changed_by_role="Administrator",
            changed_by_name=admin_name,
            notes=status_update.notes or f"Status updated to {new_status} by admin"
        )
        await db.order_history.insert_one(history_doc)
        
        info(f"Order status updated: {order_id} from {previous_status} to {new_status}")
        
        # Fetch updated order with items
        updated_order = await db.orders.find_one({"orderId": order_id})
        items_cursor = db.order_items.find({"orderIdString": order_id})
        items = await items_cursor.to_list(length=None)
        
        # Build response
        response_data = OrderDetailResponse(
            orderId=updated_order["orderId"],
            userId=updated_order["userId"],
            customerId=updated_order["customerId"],
            customerName=updated_order["customerName"],
            customerEmail=updated_order["customerEmail"],
            customerPhone=updated_order.get("customerPhone"),
            deliveryAddress=updated_order["deliveryAddress"],
            items=[
                {
                    "itemId": str(item["_id"]),
                    "productId": item["productId"],
                    "productName": item["productName"],
                    "productDescription": item.get("productDescription"),
                    "sku": item.get("sku"),
                    "quantity": item["quantity"],
                    "unitPrice": item["unitPrice"],
                    "discount": item["discount"],
                    "tax": item["tax"],
                    "totalPrice": item["totalPrice"],
                    "finalPrice": item["finalPrice"]
                }
                for item in items
            ],
            subtotal=updated_order["subtotal"],
            discount=updated_order["discount"],
            tax=updated_order["tax"],
            totalAmount=updated_order["totalAmount"],
            status=updated_order["status"],
            orderDate=updated_order["orderDate"],
            itemCount=len(items),
            estimatedDeliveryDate=updated_order.get("estimatedDeliveryDate"),
            actualDeliveryDate=updated_order.get("actualDeliveryDate"),
            cancellationInfo=updated_order.get("cancellationInfo"),
            returnInfo=updated_order.get("returnInfo"),
            notes=updated_order.get("notes"),
            createdAt=updated_order["createdAt"],
            updatedAt=updated_order["updatedAt"]
        )
        
        return APIResponse(
            success=True,
            message=f"Order status updated to {new_status}",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error updating order status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update order status. Please try again."
        )


@router.get(
    "/analytics",
    response_model=APIResponse[Dict],
    summary="Get order analytics (Admin)",
    description="Get comprehensive order analytics and statistics."
)
async def get_order_analytics(
    current_user: Dict = Depends(require_admin),
    from_date: Optional[str] = Query(None, description="Analytics from this date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="Analytics to this date (YYYY-MM-DD)"),
    db = Depends(get_database)
):
    """
    Get order analytics and statistics (Admin only).
    
    - Total orders count
    - Revenue metrics
    - Order status breakdown
    - Average order value
    - Orders by date range
    
    Returns comprehensive analytics data.
    """
    try:
        user_id = current_user.get("userId")
        
        info(f"Admin {user_id} fetching order analytics")
        
        # Build date filter
        date_filter = {}
        if from_date or to_date:
            date_query = {}
            if from_date:
                try:
                    from_datetime = datetime.fromisoformat(from_date)
                    date_query["$gte"] = from_datetime
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid from_date format. Use YYYY-MM-DD"
                    )
            if to_date:
                try:
                    to_datetime = datetime.fromisoformat(to_date)
                    to_datetime = to_datetime + timedelta(days=1)
                    date_query["$lt"] = to_datetime
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid to_date format. Use YYYY-MM-DD"
                    )
            date_filter["orderDate"] = date_query
        
        # Get all orders for analytics (excluding cancelled for revenue)
        all_orders_cursor = db.orders.find(date_filter)
        all_orders = await all_orders_cursor.to_list(length=None)
        
        # Calculate metrics
        total_orders = len(all_orders)
        
        # Revenue metrics (exclude cancelled orders)
        active_orders = [o for o in all_orders if o["status"] != "Cancelled"]
        total_revenue = sum(o["totalAmount"] for o in active_orders)
        average_order_value = total_revenue / len(active_orders) if active_orders else 0
        
        # Status breakdown
        status_breakdown = {}
        for order in all_orders:
            order_status = order["status"]
            status_breakdown[order_status] = status_breakdown.get(order_status, 0) + 1
        
        # Top customers (by order count)
        customer_orders = {}
        for order in all_orders:
            customer_id = order["customerId"]
            if customer_id not in customer_orders:
                customer_orders[customer_id] = {
                    "customerId": customer_id,
                    "customerName": order["customerName"],
                    "orderCount": 0,
                    "totalSpent": 0
                }
            customer_orders[customer_id]["orderCount"] += 1
            if order["status"] != "Cancelled":
                customer_orders[customer_id]["totalSpent"] += order["totalAmount"]
        
        top_customers = sorted(
            customer_orders.values(),
            key=lambda x: x["orderCount"],
            reverse=True
        )[:10]
        
        # Daily order trend (last 30 days if no date filter)
        if not from_date and not to_date:
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            recent_orders = [o for o in all_orders if o["orderDate"] >= thirty_days_ago]
        else:
            recent_orders = all_orders
        
        daily_orders = {}
        for order in recent_orders:
            date_key = order["orderDate"].strftime("%Y-%m-%d")
            if date_key not in daily_orders:
                daily_orders[date_key] = {"date": date_key, "count": 0, "revenue": 0}
            daily_orders[date_key]["count"] += 1
            if order["status"] != "Cancelled":
                daily_orders[date_key]["revenue"] += order["totalAmount"]
        
        daily_trend = sorted(daily_orders.values(), key=lambda x: x["date"])
        
        analytics_data = {
            "summary": {
                "totalOrders": total_orders,
                "totalRevenue": round(total_revenue, 2),
                "averageOrderValue": round(average_order_value, 2),
                "activeOrders": len(active_orders)
            },
            "statusBreakdown": status_breakdown,
            "topCustomers": top_customers,
            "dailyTrend": daily_trend,
            "dateRange": {
                "from": from_date or (thirty_days_ago.strftime("%Y-%m-%d") if not from_date and not to_date else None),
                "to": to_date or datetime.utcnow().strftime("%Y-%m-%d")
            }
        }
        
        info(f"Analytics generated: {total_orders} orders, ${total_revenue:.2f} revenue")
        
        return APIResponse(
            success=True,
            message="Analytics retrieved successfully",
            data=analytics_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error fetching analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch analytics. Please try again."
        )
