"""
Internal Service Routes
Routes for service-to-service communication
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Optional
from datetime import datetime
from app.config.database import get_database
from app.dependencies.service_auth import verify_service_api_key
from app.utils.logger import info, error
from app.utils.response import success_response


router = APIRouter(prefix="/api/internal", tags=["Internal"])


@router.get("/customers/{customer_id}/complaints", response_model=Dict)
async def get_customer_complaints(
    customer_id: str,
    limit: int = Query(10, ge=1, le=100, description="Number of complaints to return"),
    status: Optional[str] = Query(None, description="Filter by complaint status"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    _: bool = Depends(verify_service_api_key)
):
    """
    Get customer complaint information for CRMS integration
    
    **Authentication**: Requires valid service API key (x-api-key header)
    
    **Purpose**: Allows CRMS to display customer complaint history and statistics
    
    Returns:
    - Complaint summary (total complaints, open complaints)
    - Complaint statistics by status
    - List of recent complaints
    """
    try:
        # Build filter query
        filter_query = {"customerId": customer_id}
        
        if status:
            filter_query["status"] = status
        
        # Get total complaint count for this customer
        total_complaints = await db.complaints.count_documents({"customerId": customer_id})
        
        if total_complaints == 0:
            return success_response(
                message="No complaints found for customer",
                data={
                    "customerId": customer_id,
                    "summary": {
                        "totalComplaints": 0,
                        "openComplaints": 0,
                        "resolvedComplaints": 0,
                        "lastComplaintDate": None
                    },
                    "statusBreakdown": {},
                    "recentComplaints": []
                }
            )
        
        # Calculate status breakdown
        status_pipeline = [
            {"$match": {"customerId": customer_id}},
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        
        status_breakdown = {}
        async for doc in db.complaints.aggregate(status_pipeline):
            status_breakdown[doc["_id"]] = doc["count"]
        
        # Count open complaints
        open_complaints = await db.complaints.count_documents({
            "customerId": customer_id,
            "status": {"$in": ["Open", "In Progress", "Reopened"]}
        })
        
        # Count resolved complaints
        resolved_complaints = await db.complaints.count_documents({
            "customerId": customer_id,
            "status": {"$in": ["Resolved", "Closed"]}
        })
        
        # Get last complaint date
        last_complaint = await db.complaints.find_one(
            {"customerId": customer_id},
            sort=[("createdAt", -1)]
        )
        
        # Get recent complaints
        recent_complaints_cursor = db.complaints.find(
            filter_query,
            {
                "_id": 0,
                "complaintId": 1,
                "orderId": 1,
                "category": 1,
                "subject": 1,
                "status": 1,
                "priority": 1,
                "createdAt": 1,
                "resolvedAt": 1
            }
        ).sort("createdAt", -1).limit(limit)
        
        recent_complaints = []
        async for complaint in recent_complaints_cursor:
            # Convert datetime objects to ISO format strings
            complaint["createdAt"] = complaint["createdAt"].isoformat() if complaint.get("createdAt") else None
            complaint["resolvedAt"] = complaint["resolvedAt"].isoformat() if complaint.get("resolvedAt") else None
            recent_complaints.append(complaint)
        
        info(f"Retrieved {len(recent_complaints)} complaints for customer {customer_id}")
        
        return success_response(
            message="Customer complaints retrieved successfully",
            data={
                "customerId": customer_id,
                "summary": {
                    "totalComplaints": total_complaints,
                    "openComplaints": open_complaints,
                    "resolvedComplaints": resolved_complaints,
                    "lastComplaintDate": last_complaint["createdAt"].isoformat() if last_complaint else None
                },
                "statusBreakdown": status_breakdown,
                "recentComplaints": recent_complaints,
                "pagination": {
                    "limit": limit,
                    "totalItems": total_complaints
                }
            }
        )
        
    except Exception as e:
        error(f"Error retrieving customer complaints: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve customer complaints"
        )


@router.get("/health", response_model=Dict)
async def health_check():
    """
    Health check endpoint for service monitoring
    """
    return success_response(
        message="Complaint Service is healthy",
        data={
            "service": "complaint-management-service",
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat()
        }
    )
