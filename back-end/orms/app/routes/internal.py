"""
Internal Service Endpoints
Service-to-service API endpoints for CRMS and other internal services
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from bson import ObjectId

from app.config.database import get_database
from app.dependencies.service_auth import verify_service_api_key


router = APIRouter(
    prefix="/api/internal",
    tags=["Internal - Service Integration"]
)


@router.get("/customers/{customer_id}/orders", response_model=Dict)
async def get_customer_orders(
    customer_id: str,
    limit: int = Query(10, ge=1, le=100, description="Number of recent orders to return"),
    status: Optional[str] = Query(None, description="Filter by order status"),
    db=Depends(get_database),
    _: bool = Depends(verify_service_api_key)
):
    """
    Get customer order information for CRMS integration
    
    **Authentication**: Requires valid service API key (x-api-key header)
    
    **Purpose**: Allows CRMS to display customer order history and statistics
    
    Returns:
    - Order summary (total orders, total value, average order value)
    - Order statistics by status
    - List of recent orders
    """
    try:
        # Build filter query
        filter_query = {"customerId": customer_id}
        
        if status:
            filter_query["orderStatus"] = status
        
        # Get total order count for this customer
        total_orders = await db.orders.count_documents({"customerId": customer_id})
        
        if total_orders == 0:
            return {
                "customerId": customer_id,
                "summary": {
                    "totalOrders": 0,
                    "totalOrderValue": 0.0,
                    "averageOrderValue": 0.0,
                    "lastOrderDate": None
                },
                "statusBreakdown": {},
                "recentOrders": []
            }
        
        # Calculate total order value (exclude cancelled and returned orders)
        active_pipeline = [
            {
                "$match": {
                    "customerId": customer_id,
                    "orderStatus": {"$nin": ["Cancelled", "Returned"]}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "totalValue": {"$sum": "$totalAmount"},
                    "orderCount": {"$sum": 1}
                }
            }
        ]
        
        active_result = await db.orders.aggregate(active_pipeline).to_list(length=1)
        
        if active_result:
            total_value = active_result[0]["totalValue"]
            active_count = active_result[0]["orderCount"]
            avg_value = total_value / active_count if active_count > 0 else 0.0
        else:
            total_value = 0.0
            avg_value = 0.0
        
        # Get status breakdown
        status_pipeline = [
            {"$match": {"customerId": customer_id}},
            {"$group": {"_id": "$orderStatus", "count": {"$sum": 1}}}
        ]
        
        status_results = await db.orders.aggregate(status_pipeline).to_list(length=None)
        status_breakdown = {item["_id"]: item["count"] for item in status_results}
        
        # Get last order date
        last_order = await db.orders.find_one(
            {"customerId": customer_id},
            sort=[("orderDate", -1)]
        )
        last_order_date = last_order.get("orderDate") if last_order else None
        
        # Get recent orders
        recent_orders_cursor = db.orders.find(filter_query).sort("orderDate", -1).limit(limit)
        recent_orders_docs = await recent_orders_cursor.to_list(length=limit)
        
        recent_orders = []
        for order in recent_orders_docs:
            # Get item count for this order
            item_count = await db.order_items.count_documents({"orderId": order["_id"]})
            
            recent_orders.append({
                "orderId": order.get("orderId", ""),
                "orderDate": order.get("orderDate"),
                "orderStatus": order.get("orderStatus", "Unknown"),
                "totalAmount": order.get("totalAmount", 0.0),
                "itemCount": item_count,
                "deliveryAddress": {
                    "city": order.get("deliveryAddress", {}).get("city", ""),
                    "state": order.get("deliveryAddress", {}).get("state", ""),
                    "country": order.get("deliveryAddress", {}).get("country", "")
                } if order.get("deliveryAddress") else None
            })
        
        return {
            "customerId": customer_id,
            "summary": {
                "totalOrders": total_orders,
                "totalOrderValue": round(total_value, 2),
                "averageOrderValue": round(avg_value, 2),
                "lastOrderDate": last_order_date
            },
            "statusBreakdown": status_breakdown,
            "recentOrders": recent_orders
        }
        
    except Exception as e:
        print(f"ERROR in get_customer_orders: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving customer orders: {str(e)}")


@router.get("/orders/{order_id}", response_model=Dict)
async def get_order_by_id(
    order_id: str,
    db=Depends(get_database),
    _: bool = Depends(verify_service_api_key)
):
    """
    Get order details by order ID for internal services
    
    **Authentication**: Requires valid service API key (x-api-key header)
    
    **Purpose**: Allows other services to query order information
    """
    try:
        # Find order
        order = await db.orders.find_one({"orderId": order_id})
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Get order items
        items_cursor = db.order_items.find({"orderId": order["_id"]})
        items = await items_cursor.to_list(length=None)
        
        order_items = []
        for item in items:
            order_items.append({
                "productId": item.get("productId", ""),
                "productName": item.get("productName", ""),
                "sku": item.get("sku", ""),
                "quantity": item.get("quantity", 0),
                "unitPrice": item.get("unitPrice", 0.0),
                "totalPrice": item.get("totalPrice", 0.0)
            })
        
        return {
            "orderId": order.get("orderId", ""),
            "customerId": order.get("customerId", ""),
            "customerName": order.get("customerName", ""),
            "customerEmail": order.get("customerEmail", ""),
            "orderDate": order.get("orderDate"),
            "orderStatus": order.get("orderStatus", "Unknown"),
            "totalAmount": order.get("totalAmount", 0.0),
            "items": order_items,
            "deliveryAddress": order.get("deliveryAddress"),
            "estimatedDeliveryDate": order.get("estimatedDeliveryDate"),
            "actualDeliveryDate": order.get("actualDeliveryDate"),
            "createdAt": order.get("createdAt"),
            "updatedAt": order.get("updatedAt")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in get_order_by_id: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving order: {str(e)}")


@router.get("/health", response_model=Dict)
async def internal_health_check(
    db=Depends(get_database),
    _: bool = Depends(verify_service_api_key)
):
    """
    Health check endpoint for internal services
    
    **Authentication**: Requires valid service API key (x-api-key header)
    
    Returns database connectivity status and basic statistics
    """
    try:
        # Check database connectivity
        await db.orders.count_documents({}, limit=1)
        
        # Get basic statistics
        total_orders = await db.orders.count_documents({})
        total_customers = await db.orders.distinct("customerId")
        
        return {
            "status": "healthy",
            "database": "connected",
            "statistics": {
                "totalOrders": total_orders,
                "totalCustomers": len(total_customers)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Service unhealthy: {str(e)}"
        )
