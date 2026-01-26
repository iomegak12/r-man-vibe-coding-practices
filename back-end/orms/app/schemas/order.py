"""
Order Pydantic Schemas
Request and response validation schemas for orders
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from enum import Enum


# Enums
class OrderStatus(str, Enum):
    """
    Order Status Enum
    
    - **Placed**: Order has been placed
    - **Processing**: Order is being prepared
    - **Shipped**: Order has been shipped
    - **Delivered**: Order has been delivered
    - **Cancelled**: Order has been cancelled
    - **Return Requested**: Customer has requested a return
    - **Returned**: Return has been completed
    """
    PLACED = "Placed"
    PROCESSING = "Processing"
    SHIPPED = "Shipped"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"
    RETURN_REQUESTED = "Return Requested"
    RETURNED = "Returned"


class ReturnReasonCategory(str, Enum):
    """Return reason categories"""
    DAMAGED = "Damaged"
    WRONG_ITEM = "Wrong Item"
    DEFECTIVE = "Defective"
    NOT_AS_DESCRIBED = "Not as Described"
    QUALITY_ISSUES = "Quality Issues"
    CHANGED_MIND = "Changed Mind"
    OTHER = "Other"


# Sub-schemas
class DeliveryAddressSchema(BaseModel):
    """Delivery address schema"""
    recipientName: str = Field(..., min_length=1, max_length=100)
    street: str = Field(..., min_length=1, max_length=200)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    zipCode: str = Field(..., min_length=3, max_length=20)
    country: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)


class OrderItemSchema(BaseModel):
    """Order item schema for order creation"""
    productId: str = Field(..., min_length=1, max_length=100)
    productName: str = Field(..., min_length=1, max_length=200)
    productDescription: Optional[str] = Field(None, max_length=500)
    sku: str = Field(..., min_length=1, max_length=50)
    quantity: int = Field(..., gt=0)
    unitPrice: float = Field(..., gt=0)
    discount: float = Field(default=0.0, ge=0)
    tax: float = Field(default=0.0, ge=0)


class ReturnItemSchema(BaseModel):
    """Return item schema"""
    orderItemId: str = Field(..., description="Order item ID")
    quantity: int = Field(..., gt=0, description="Quantity to return")
    returnReason: Optional[str] = Field(None, max_length=200, description="Item-specific return reason")


# Request Schemas
class CreateOrderRequest(BaseModel):
    """Create order request"""
    deliveryAddress: DeliveryAddressSchema
    items: List[OrderItemSchema] = Field(..., min_length=1)
    notes: Optional[str] = Field(None, max_length=500)

    model_config = {
        "json_schema_extra": {
            "example": {
                "deliveryAddress": {
                    "recipientName": "John Doe",
                    "street": "123 Main Street, Apt 4B",
                    "city": "Bangalore",
                    "state": "Karnataka",
                    "zipCode": "560001",
                    "country": "India",
                    "phone": "+919876543210"
                },
                "items": [
                    {
                        "productId": "PROD-001",
                        "productName": "Wireless Headphones",
                        "productDescription": "Premium noise-cancelling headphones",
                        "sku": "WH-NC-001",
                        "quantity": 2,
                        "unitPrice": 2500.00,
                        "discount": 250.00,
                        "tax": 225.00
                    }
                ],
                "notes": "Please deliver between 10 AM - 2 PM"
            }
        }
    }


class CancelOrderRequest(BaseModel):
    """Cancel order request"""
    reason: str = Field(..., min_length=10, max_length=500)
    reasonCategory: Optional[str] = Field(None, max_length=100)

    model_config = {
        "json_schema_extra": {
            "example": {
                "reason": "Changed my mind about the purchase",
                "reasonCategory": "Customer Request"
            }
        }
    }


class RequestReturnRequest(BaseModel):
    """Request return request"""
    reason: str = Field(..., min_length=10, max_length=500)
    reasonCategory: ReturnReasonCategory
    description: str = Field(..., min_length=10, max_length=1000)
    items: List[ReturnItemSchema] = Field(..., min_length=1)

    model_config = {
        "json_schema_extra": {
            "example": {
                "reason": "Product damaged during shipping",
                "reasonCategory": "Damaged",
                "description": "The packaging was torn and the headphones have scratches",
                "items": [
                    {
                        "orderItemId": "65a1b2c3d4e5f6g7h8i9j0k5",
                        "quantity": 2,
                        "returnReason": "Both units damaged"
                    }
                ]
            }
        }
    }


class UpdateOrderStatusRequest(BaseModel):
    """Update order status request (Admin)"""
    status: OrderStatus
    notes: Optional[str] = Field(None, max_length=500)

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "Shipped",
                "notes": "Shipped via FedEx, tracking: 1234567890"
            }
        }
    }


class UpdateOrderRequest(BaseModel):
    """Update order request (Admin)"""
    deliveryAddress: Optional[DeliveryAddressSchema] = None
    notes: Optional[str] = Field(None, max_length=500)

    model_config = {
        "json_schema_extra": {
            "example": {
                "notes": "Updated delivery instructions"
            }
        }
    }


class ReviewReturnRequest(BaseModel):
    """Review return request (Admin)"""
    decision: str = Field(..., pattern="^(approved|rejected)$")
    approvalNotes: str = Field(..., min_length=10, max_length=500)
    refundAmount: Optional[float] = Field(None, gt=0)

    model_config = {
        "json_schema_extra": {
            "example": {
                "decision": "approved",
                "approvalNotes": "Return approved. Refund to be processed.",
                "refundAmount": 4975.00
            }
        }
    }


# Response Schemas
class OrderItemResponse(BaseModel):
    """Order item response"""
    itemId: str
    productId: str
    productName: str
    productDescription: Optional[str] = None
    sku: str
    quantity: int
    unitPrice: float
    totalPrice: float
    discount: float
    tax: float
    finalPrice: float


class OrderListItemResponse(BaseModel):
    """Order list item response (for pagination)"""
    orderId: str
    customerId: str
    customerName: str
    customerEmail: str
    orderDate: datetime
    status: str
    totalAmount: float
    itemCount: int
    deliveryAddress: dict
    estimatedDeliveryDate: Optional[datetime] = None
    actualDeliveryDate: Optional[datetime] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "orderId": "ORD-2026-001234",
                "orderDate": "2026-01-25T14:30:00Z",
                "status": "Delivered",
                "totalAmount": 5520.00,
                "itemCount": 3,
                "deliveryAddress": {
                    "city": "Bangalore",
                    "state": "Karnataka"
                }
            }
        }
    }


class OrderDetailResponse(BaseModel):
    """Detailed order response"""
    orderId: str
    userId: str
    customerId: str
    customerName: str
    customerEmail: str
    customerPhone: Optional[str] = None
    deliveryAddress: dict
    items: List[OrderItemResponse]
    subtotal: float
    discount: float
    tax: float
    totalAmount: float
    status: str
    orderDate: datetime
    itemCount: int
    estimatedDeliveryDate: Optional[datetime] = None
    actualDeliveryDate: Optional[datetime] = None
    cancellationInfo: Optional[dict] = None
    returnInfo: Optional[dict] = None
    notes: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    model_config = {
        "json_schema_extra": {
            "example": {
                "orderId": "ORD-2026-001234",
                "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
                "customerEmail": "john.doe@example.com",
                "customerName": "John Doe",
                "orderDate": "2026-01-25T14:30:00Z",
                "status": "Delivered",
                "totalAmount": 5520.00,
                "itemCount": 3,
                "deliveryAddress": {
                    "recipientName": "John Doe",
                    "street": "123 Main Street",
                    "city": "Bangalore",
                    "state": "Karnataka",
                    "zipCode": "560001",
                    "country": "India",
                    "phone": "+919876543210"
                },
                "items": [],
                "notes": "Please deliver between 10 AM - 2 PM",
                "createdAt": "2026-01-25T14:30:00Z",
                "updatedAt": "2026-01-27T10:00:00Z"
            }
        }
    }


class OrderHistoryResponse(BaseModel):
    """Order history entry response"""
    previousStatus: Optional[str]
    newStatus: str
    changedBy: str
    changedByName: str
    changedByRole: str
    notes: Optional[str]
    timestamp: datetime


class ReturnRequestResponse(BaseModel):
    """Return request response"""
    returnId: str
    orderId: str
    status: str
    reason: str
    reasonCategory: str
    requestedBy: str
    requestedAt: datetime
    refundAmount: Optional[float] = None


class ReturnReviewRequest(BaseModel):
    """Request to review a return (approve or reject)"""
    approve: bool = Field(..., description="True to approve, False to reject")
    notes: Optional[str] = Field(None, max_length=500, description="Review notes or rejection reason")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "approve": True,
                "notes": "Return approved. Items verified as damaged."
            }
        }
    }


class ReturnListItemResponse(BaseModel):
    """Return list item for admin returns listing"""
    orderId: str
    customerId: str
    customerName: str
    customerEmail: str
    orderDate: datetime
    orderStatus: str
    totalAmount: float
    returnStatus: str
    returnRequestedAt: datetime
    itemCount: int


class ReturnDetailResponse(BaseModel):
    """Detailed return information for admin review"""
    orderId: str
    customerId: str
    customerName: str
    customerEmail: str
    orderDate: datetime
    orderStatus: str
    totalAmount: float
    shippingAddress: dict
    returnInfo: dict
