"""
Order Model
Database model for orders collection
"""
from datetime import datetime
from typing import Optional


class Order:
    """
    Order database model
    
    Represents a customer order with delivery details and status tracking
    """
    
    @staticmethod
    def create_order_document(
        order_id: str,
        user_id: str,
        customer_id: str,
        customer_name: str,
        customer_email: str,
        customer_phone: Optional[str],
        delivery_address: dict,
        subtotal: float,
        discount: float,
        tax: float,
        total_amount: float,
        status: str = "Placed",
        notes: Optional[str] = None
    ) -> dict:
        """
        Create order document for MongoDB insertion
        
        Args:
            order_id: Unique order identifier
            user_id: User ID from Auth Service
            customer_id: Customer ID from Customer Service
            customer_name: Customer name
            customer_email: Customer email
            customer_phone: Customer phone number
            delivery_address: Delivery address dictionary
            subtotal: Subtotal before discount and tax
            discount: Total discount amount
            tax: Total tax amount
            total_amount: Total order amount (subtotal - discount + tax)
            status: Order status (default: Placed)
            notes: Optional order notes
            
        Returns:
            Order document dictionary
        """
        now = datetime.utcnow()
        
        return {
            "orderId": order_id,
            "userId": user_id,
            "customerId": customer_id,
            "customerName": customer_name,
            "customerEmail": customer_email,
            "customerPhone": customer_phone,
            "deliveryAddress": delivery_address,
            "subtotal": subtotal,
            "discount": discount,
            "tax": tax,
            "totalAmount": total_amount,
            "status": status,
            "orderDate": now,
            "estimatedDeliveryDate": None,
            "actualDeliveryDate": None,
            "cancellationInfo": None,
            "returnInfo": None,
            "notes": notes,
            "createdAt": now,
            "updatedAt": now
        }
