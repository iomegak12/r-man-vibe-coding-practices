"""
Order Item Model
Database model for order_items collection
"""
from datetime import datetime
from bson import ObjectId


class OrderItem:
    """
    Order Item database model
    
    Represents individual items within an order
    """
    
    @staticmethod
    def create_order_item_document(
        order_id: ObjectId,
        order_id_string: str,
        product_id: str,
        product_name: str,
        product_description: str,
        sku: str,
        quantity: int,
        unit_price: float,
        discount: float = 0.0,
        tax: float = 0.0
    ) -> dict:
        """
        Create order item document for MongoDB insertion
        
        Args:
            order_id: Reference to orders._id
            order_id_string: Order ID string (e.g., ORD-2026-000001)
            product_id: Product identifier
            product_name: Product name
            product_description: Product description
            sku: Stock Keeping Unit
            quantity: Quantity ordered
            unit_price: Price per unit
            discount: Discount amount
            tax: Tax amount
            
        Returns:
            Order item document dictionary
        """
        total_price = quantity * unit_price
        final_price = total_price - discount + tax
        
        return {
            "orderId": order_id,
            "orderIdString": order_id_string,
            "productId": product_id,
            "productName": product_name,
            "productDescription": product_description,
            "sku": sku,
            "quantity": quantity,
            "unitPrice": unit_price,
            "totalPrice": total_price,
            "discount": discount,
            "tax": tax,
            "finalPrice": final_price,
            "returnRequested": False,
            "returnQuantity": 0,
            "returnReason": None,
            "createdAt": datetime.utcnow()
        }
