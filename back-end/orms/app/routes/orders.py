"""
Order Management Routes
Handles customer order operations (create, list, view)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Dict, Optional, List
from datetime import datetime
from bson import ObjectId

from app.config.database import get_database
from app.dependencies.auth import get_current_user, require_customer, require_customer_or_admin
from app.schemas.order import (
    CreateOrderRequest,
    CancelOrderRequest,
    RequestReturnRequest,
    OrderDetailResponse,
    OrderListItemResponse
)
from app.schemas.response import APIResponse, PaginatedResponse
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.order_history import OrderHistory
from app.utils.logger import info, error
from app.utils.pagination import calculate_pagination, create_paginated_response
from app.utils.validators import validate_object_id, sanitize_search_query
from app.utils.order_id_generator import generate_order_id
from app.services.customer_service import get_customer_service_client

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post(
    "",
    response_model=APIResponse[OrderDetailResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a new order",
    description="Create a new order with delivery address and items. Requires customer authentication."
)
async def create_order(
    order_request: CreateOrderRequest,
    current_user: Dict = Depends(require_customer),
    db = Depends(get_database)
):
    """
    Create a new order for the authenticated customer.
    
    - Validates customer exists in CRMS
    - Generates unique order ID
    - Creates order with all items
    - Records order history
    - Updates customer statistics in CRMS
    
    Returns the created order details.
    """
    try:
        user_id = current_user.get("userId")
        
        info(f"Creating order for user: {user_id}")
        
        # Get customer service client
        customer_service = get_customer_service_client()
        
        # Get customer information from CRMS
        customer = await customer_service.get_customer_by_user_id(user_id)
        if not customer:
            error(f"Customer not found for user: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer profile not found. Please contact support."
            )
        
        customer_id = customer.get("customerId")
        
        # Validate at least one item
        if not order_request.items or len(order_request.items) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order must contain at least one item"
            )
        
        # Calculate order totals
        subtotal = 0.0
        total_discount = 0.0
        total_tax = 0.0
        
        for item in order_request.items:
            item_total = item.unitPrice * item.quantity
            subtotal += item_total
            total_discount += item.discount if item.discount else 0.0
            total_tax += item.tax if item.tax else 0.0
        
        total_amount = subtotal - total_discount + total_tax
        
        # Generate unique order ID
        order_id = await generate_order_id(db)
        
        # Prepare order document
        order_doc = Order.create_order_document(
            order_id=order_id,
            user_id=user_id,
            customer_id=customer_id,
            customer_name=customer.get("fullName"),
            customer_email=customer.get("email"),
            customer_phone=customer.get("phone"),
            delivery_address=order_request.deliveryAddress.model_dump(),
            subtotal=subtotal,
            discount=total_discount,
            tax=total_tax,
            total_amount=total_amount,
            status="Placed",
            notes=order_request.notes
        )
        
        # Insert order
        result = await db.orders.insert_one(order_doc)
        order_object_id = result.inserted_id
        
        info(f"Order created: {order_id}")
        
        # Create order items
        order_items = []
        for item_data in order_request.items:
            item_doc = OrderItem.create_order_item_document(
                order_id=order_object_id,
                order_id_string=order_id,
                product_id=item_data.productId,
                product_name=item_data.productName,
                product_description=item_data.productDescription,
                sku=item_data.sku,
                quantity=item_data.quantity,
                unit_price=item_data.unitPrice,
                discount=item_data.discount if item_data.discount else 0.0,
                tax=item_data.tax if item_data.tax else 0.0
            )
            order_items.append(item_doc)
        
        # Insert all items
        if order_items:
            await db.order_items.insert_many(order_items)
            info(f"Created {len(order_items)} order items for order: {order_id}")
        
        # Create initial order history entry
        history_doc = OrderHistory.create_history_entry(
            order_id=order_object_id,
            order_id_string=order_id,
            previous_status=None,
            new_status="Placed",
            changed_by=user_id,
            changed_by_role="Customer",
            changed_by_name=customer.get("fullName"),
            notes="Order placed by customer"
        )
        await db.order_history.insert_one(history_doc)
        
        # Update customer statistics in CRMS
        stats_updated = await customer_service.update_order_statistics(
            customer=customer,
            order_value=total_amount,
            increment_order_count=True
        )
        
        if stats_updated:
            info(f"Updated customer statistics for: {customer_id}")
        else:
            error(f"Failed to update customer statistics for: {customer_id}")
        
        # Fetch created order with items
        created_order = await db.orders.find_one({"_id": order_object_id})
        items_cursor = db.order_items.find({"orderIdString": order_id})
        items = await items_cursor.to_list(length=None)
        
        # Build response
        response_data = OrderDetailResponse(
            orderId=created_order["orderId"],
            userId=created_order["userId"],
            customerId=created_order["customerId"],
            customerName=created_order["customerName"],
            customerEmail=created_order["customerEmail"],
            customerPhone=created_order.get("customerPhone"),
            deliveryAddress=created_order["deliveryAddress"],
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
            subtotal=created_order["subtotal"],
            discount=created_order["discount"],
            tax=created_order["tax"],
            totalAmount=created_order["totalAmount"],
            status=created_order["status"],
            orderDate=created_order["orderDate"],
            itemCount=len(items),
            estimatedDeliveryDate=created_order.get("estimatedDeliveryDate"),
            actualDeliveryDate=created_order.get("actualDeliveryDate"),
            cancellationInfo=created_order.get("cancellationInfo"),
            returnInfo=created_order.get("returnInfo"),
            notes=created_order.get("notes"),
            createdAt=created_order["createdAt"],
            updatedAt=created_order["updatedAt"]
        )
        
        return APIResponse(
            success=True,
            message="Order created successfully",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error creating order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order. Please try again."
        )


@router.get(
    "/me",
    response_model=PaginatedResponse[OrderListItemResponse],
    summary="Get my orders",
    description="Get paginated list of orders for the authenticated customer with optional filtering."
)
async def get_my_orders(
    current_user: Dict = Depends(require_customer),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    order_status: Optional[str] = Query(None, description="Filter by order status"),
    search: Optional[str] = Query(None, description="Search in order ID, customer name, email"),
    db = Depends(get_database)
):
    """
    Get a paginated list of orders for the authenticated customer.
    
    - Supports pagination
    - Filter by order status
    - Search by order ID, customer name, or email
    - Sorted by order date (newest first)
    
    Returns paginated order list with summary information.
    """
    try:
        user_id = current_user.get("userId")
        
        info(f"Fetching orders for user: {user_id}, page: {page}, status: {order_status}")
        
        # Build query
        query = {"userId": user_id}
        
        # Add status filter
        if order_status:
            query["status"] = order_status
        
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
        
        info(f"Found {total} orders for user: {user_id}")
        
        return create_paginated_response(
            items=items,
            pagination=pagination_meta
        )
        
    except Exception as e:
        error(f"Error fetching orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch orders. Please try again."
        )


@router.get(
    "/{order_id}",
    response_model=APIResponse[OrderDetailResponse],
    summary="Get order details",
    description="Get detailed information about a specific order. Customers can only view their own orders."
)
async def get_order_details(
    order_id: str,
    current_user: Dict = Depends(require_customer_or_admin),
    db = Depends(get_database)
):
    """
    Get detailed information about a specific order.
    
    - Customers can only view their own orders
    - Admins can view any order
    - Includes all order items
    - Includes delivery address
    - Includes cancellation/return information if applicable
    
    Returns complete order details.
    """
    try:
        user_id = current_user.get("userId")
        role = current_user.get("role")
        
        info(f"Fetching order details: {order_id} for user: {user_id} with role: {role}")
        
        # Find order
        order = await db.orders.find_one({"orderId": order_id})
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Check ownership (customers can only view their own orders)
        if role == "customer" and order["userId"] != user_id:
            error(f"User {user_id} attempted to access order {order_id} belonging to {order['userId']}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this order"
            )
        
        # Fetch order items
        items_cursor = db.order_items.find({"orderIdString": order_id})
        items = await items_cursor.to_list(length=None)
        
        # Build response
        response_data = OrderDetailResponse(
            orderId=order["orderId"],
            userId=order["userId"],
            customerId=order["customerId"],
            customerName=order["customerName"],
            customerEmail=order["customerEmail"],
            customerPhone=order.get("customerPhone"),
            deliveryAddress=order["deliveryAddress"],
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
            subtotal=order["subtotal"],
            discount=order["discount"],
            tax=order["tax"],
            totalAmount=order["totalAmount"],
            status=order["status"],
            orderDate=order["orderDate"],
            itemCount=len(items),
            estimatedDeliveryDate=order.get("estimatedDeliveryDate"),
            actualDeliveryDate=order.get("actualDeliveryDate"),
            cancellationInfo=order.get("cancellationInfo"),
            returnInfo=order.get("returnInfo"),
            notes=order.get("notes"),
            createdAt=order["createdAt"],
            updatedAt=order["updatedAt"]
        )
        
        info(f"Order details retrieved: {order_id}")
        
        return APIResponse(
            success=True,
            message="Order details retrieved successfully",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error fetching order details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch order details. Please try again."
        )


@router.post(
    "/{order_id}/cancel",
    response_model=APIResponse[OrderDetailResponse],
    summary="Cancel an order",
    description="Cancel an order. Only orders in 'Placed' or 'Processing' status can be cancelled."
)
async def cancel_order(
    order_id: str,
    cancel_request: CancelOrderRequest,
    current_user: Dict = Depends(require_customer_or_admin),
    db = Depends(get_database)
):
    """
    Cancel an order.
    
    - Customers can only cancel their own orders
    - Admins can cancel any order
    - Only orders in 'Placed' or 'Processing' status can be cancelled
    - Updates CRMS statistics (decrements order count and value)
    - Creates order history entry
    
    Returns updated order details.
    """
    try:
        user_id = current_user.get("userId")
        role = current_user.get("role")
        
        info(f"Cancelling order: {order_id} by user: {user_id} with role: {role}")
        
        # Find order
        order = await db.orders.find_one({"orderId": order_id})
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Check ownership (customers can only cancel their own orders)
        if role == "customer" and order["userId"] != user_id:
            error(f"User {user_id} attempted to cancel order {order_id} belonging to {order['userId']}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to cancel this order"
            )
        
        # Check if order can be cancelled
        if order["status"] not in ["Placed", "Processing"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Orders with status '{order['status']}' cannot be cancelled. Only 'Placed' or 'Processing' orders can be cancelled."
            )
        
        # Update order status
        previous_status = order["status"]
        cancellation_info = {
            "reason": cancel_request.reason,
            "reasonCategory": cancel_request.reasonCategory,
            "cancelledBy": user_id,
            "cancelledByRole": role.capitalize(),
            "cancelledAt": datetime.utcnow()
        }
        
        result = await db.orders.update_one(
            {"orderId": order_id},
            {
                "$set": {
                    "status": "Cancelled",
                    "cancellationInfo": cancellation_info,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to cancel order"
            )
        
        # Create order history entry
        history_doc = OrderHistory.create_history_entry(
            order_id=order["_id"],
            order_id_string=order_id,
            previous_status=previous_status,
            new_status="Cancelled",
            changed_by=user_id,
            changed_by_role=role.capitalize(),
            changed_by_name=current_user.get("fullName", "Unknown"),
            notes=f"Order cancelled. Reason: {cancel_request.reason}"
        )
        await db.order_history.insert_one(history_doc)
        
        # Update CRMS statistics (decrement order count and value)
        customer_service = get_customer_service_client()
        customer = await customer_service.get_customer_by_user_id(order["userId"])
        
        if customer:
            stats_updated = await customer_service.update_order_statistics(
                customer=customer,
                order_value=-order["totalAmount"],
                increment_order_count=False,
                decrement_order_count=True
            )
            
            if stats_updated:
                info(f"Updated customer statistics for cancellation: {order['customerId']}")
            else:
                error(f"Failed to update customer statistics for cancellation: {order['customerId']}")
        
        info(f"Order cancelled: {order_id}")
        
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
            message="Order cancelled successfully",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error cancelling order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel order. Please try again."
        )


@router.post(
    "/{order_id}/return",
    response_model=APIResponse[OrderDetailResponse],
    summary="Request order return",
    description="Request a return for a delivered order. Only orders in 'Delivered' status can be returned."
)
async def request_return(
    order_id: str,
    return_request: RequestReturnRequest,
    current_user: Dict = Depends(require_customer),
    db = Depends(get_database)
):
    """
    Request a return for a delivered order.
    
    - Only the order owner can request a return
    - Only orders in 'Delivered' status can be returned
    - Creates order history entry
    - Admin must approve the return request
    
    Returns updated order details.
    """
    try:
        user_id = current_user.get("userId")
        
        info(f"Requesting return for order: {order_id} by user: {user_id}")
        
        # Find order
        order = await db.orders.find_one({"orderId": order_id})
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Check ownership
        if order["userId"] != user_id:
            error(f"User {user_id} attempted to return order {order_id} belonging to {order['userId']}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to return this order"
            )
        
        # Check if order can be returned
        if order["status"] != "Delivered":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only delivered orders can be returned. Current status: {order['status']}"
            )
        
        # Validate return items
        items_cursor = db.order_items.find({"orderIdString": order_id})
        order_items = await items_cursor.to_list(length=None)
        order_items_map = {str(item["_id"]): item for item in order_items}
        
        for return_item in return_request.items:
            if return_item.orderItemId not in order_items_map:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid order item ID: {return_item.orderItemId}"
                )
            
            order_item = order_items_map[return_item.orderItemId]
            if return_item.quantity > order_item["quantity"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Return quantity ({return_item.quantity}) exceeds ordered quantity ({order_item['quantity']}) for item {order_item['productName']}"
                )
        
        # Update order status
        previous_status = order["status"]
        return_info = {
            "reason": return_request.reason,
            "reasonCategory": return_request.reasonCategory,
            "description": return_request.description,
            "requestedBy": user_id,
            "requestedAt": datetime.utcnow(),
            "status": "Pending",
            "items": [
                {
                    "orderItemId": item.orderItemId,
                    "quantity": item.quantity,
                    "returnReason": item.returnReason
                }
                for item in return_request.items
            ]
        }
        
        result = await db.orders.update_one(
            {"orderId": order_id},
            {
                "$set": {
                    "status": "Return Requested",
                    "returnInfo": return_info,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to request return"
            )
        
        # Update order items
        for return_item in return_request.items:
            await db.order_items.update_one(
                {"_id": ObjectId(return_item.orderItemId)},
                {
                    "$set": {
                        "returnRequested": True,
                        "returnQuantity": return_item.quantity,
                        "returnReason": return_item.returnReason
                    }
                }
            )
        
        # Create order history entry
        history_doc = OrderHistory.create_history_entry(
            order_id=order["_id"],
            order_id_string=order_id,
            previous_status=previous_status,
            new_status="Return Requested",
            changed_by=user_id,
            changed_by_role="Customer",
            changed_by_name=current_user.get("fullName", order["customerName"]),
            notes=f"Return requested. Reason: {return_request.reason}"
        )
        await db.order_history.insert_one(history_doc)
        
        info(f"Return requested for order: {order_id}")
        
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
            message="Return request submitted successfully. Please wait for admin approval.",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error requesting return: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to request return. Please try again."
        )


@router.get(
    "/{order_id}/history",
    response_model=APIResponse[List[dict]],
    summary="Get order history",
    description="Get the complete status change history for an order."
)
async def get_order_history(
    order_id: str,
    current_user: Dict = Depends(require_customer_or_admin),
    db = Depends(get_database)
):
    """
    Get order status change history.
    
    - Customers can only view history for their own orders
    - Admins can view history for any order
    - Returns all status changes in chronological order
    
    Returns list of history entries.
    """
    try:
        user_id = current_user.get("userId")
        role = current_user.get("role")
        
        info(f"Fetching order history: {order_id} for user: {user_id} with role: {role}")
        
        # Find order to check ownership
        order = await db.orders.find_one({"orderId": order_id})
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Check ownership (customers can only view their own order history)
        if role == "customer" and order["userId"] != user_id:
            error(f"User {user_id} attempted to access history for order {order_id} belonging to {order['userId']}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this order's history"
            )
        
        # Fetch order history
        cursor = db.order_history.find({"orderIdString": order_id}).sort("timestamp", 1)
        history = await cursor.to_list(length=None)
        
        # Format response
        history_data = [
            {
                "previousStatus": entry.get("previousStatus"),
                "newStatus": entry["newStatus"],
                "changedBy": entry["changedBy"],
                "changedByRole": entry["changedByRole"],
                "changedByName": entry["changedByName"],
                "timestamp": entry["timestamp"],
                "notes": entry.get("notes")
            }
            for entry in history
        ]
        
        info(f"Found {len(history_data)} history entries for order: {order_id}")
        
        return APIResponse(
            success=True,
            message=f"Retrieved {len(history_data)} history entry(ies)",
            data=history_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error fetching order history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch order history. Please try again."
        )
