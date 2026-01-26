"""
Order History Model
Database model for order_history collection
"""
from datetime import datetime
from bson import ObjectId
from typing import Optional


class OrderHistory:
    """
    Order History database model
    
    Tracks all status changes and modifications to orders
    """
    
    @staticmethod
    def create_history_entry(
        order_id: ObjectId,
        order_id_string: str,
        previous_status: Optional[str],
        new_status: str,
        changed_by: str,
        changed_by_role: str,
        changed_by_name: str,
        notes: Optional[str] = None,
        metadata: Optional[dict] = None
    ) -> dict:
        """
        Create order history entry
        
        Args:
            order_id: Reference to orders._id
            order_id_string: Order ID string
            previous_status: Previous order status (None for creation)
            new_status: New order status
            changed_by: User ID who made the change
            changed_by_role: Role of user (Customer/Administrator)
            changed_by_name: Name of user
            notes: Optional change notes
            metadata: Optional metadata (IP, user agent, etc.)
            
        Returns:
            Order history document dictionary
        """
        return {
            "orderId": order_id,
            "orderIdString": order_id_string,
            "previousStatus": previous_status,
            "newStatus": new_status,
            "changedBy": changed_by,
            "changedByRole": changed_by_role,
            "changedByName": changed_by_name,
            "notes": notes,
            "timestamp": datetime.utcnow(),
            "metadata": metadata or {}
        }
