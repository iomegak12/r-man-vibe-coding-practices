"""
Return Request Model
Database model for return_requests collection
"""
from datetime import datetime
from bson import ObjectId
from typing import List, Optional


class ReturnRequest:
    """
    Return Request database model
    
    Manages product return requests and approvals
    """
    
    @staticmethod
    def create_return_request_document(
        return_id: str,
        order_id: ObjectId,
        order_id_string: str,
        user_id: str,
        requested_by: str,
        reason: str,
        reason_category: str,
        description: str,
        items: List[dict]
    ) -> dict:
        """
        Create return request document
        
        Args:
            return_id: Unique return request identifier
            order_id: Reference to orders._id
            order_id_string: Order ID string
            user_id: Customer user ID
            requested_by: Customer name
            reason: Return reason
            reason_category: Reason category
            description: Detailed description
            items: List of items to return
            
        Returns:
            Return request document dictionary
        """
        now = datetime.utcnow()
        
        return {
            "returnId": return_id,
            "orderId": order_id,
            "orderIdString": order_id_string,
            "userId": user_id,
            "requestedBy": requested_by,
            "reason": reason,
            "reasonCategory": reason_category,
            "description": description,
            "items": items,
            "status": "Pending",
            "requestedAt": now,
            "reviewedBy": None,
            "reviewedByName": None,
            "reviewedAt": None,
            "approvalNotes": None,
            "refundAmount": None,
            "refundStatus": None,
            "completedAt": None,
            "createdAt": now,
            "updatedAt": now
        }
