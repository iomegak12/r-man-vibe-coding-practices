"""
Admin complaint routes
Administrator-only complaint management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from typing import Dict, Optional
from datetime import datetime
from bson import ObjectId
import re
from pydantic import BaseModel, Field

from app.config.database import get_database
from app.dependencies.auth import get_current_customer
from app.utils.response import success_response
from app.utils.logger import info, error


# Request models
class AssignComplaintRequest(BaseModel):
    assignTo: str = Field(..., description="User ID of admin to assign to")
    notes: Optional[str] = Field(None, max_length=500, description="Assignment notes")


class ResolveComplaintRequest(BaseModel):
    resolutionNotes: str = Field(..., min_length=20, max_length=2000, description="Resolution details")
    tags: Optional[list] = Field(None, description="Resolution tags")


class ReopenComplaintRequest(BaseModel):
    reason: str = Field(..., min_length=10, max_length=500, description="Reason for reopening")


class UpdateStatusRequest(BaseModel):
    status: str = Field(..., description="New status")
    notes: Optional[str] = Field(None, max_length=500, description="Status change notes")


class UpdatePriorityRequest(BaseModel):
    priority: str = Field(..., description="New priority")
    notes: Optional[str] = Field(None, max_length=500, description="Priority change notes")


router = APIRouter(
    prefix="/api/complaints",
    tags=["Admin Complaints"]
)


def verify_admin_role(current_user: Dict):
    """Verify user has administrator role"""
    user_role = current_user.get("role", "").lower()
    if user_role not in ["administrator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required"
        )


@router.get("", response_model=Dict)
async def list_all_complaints(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    assignedTo: Optional[str] = Query(None, description="Filter by assigned admin ID"),
    customerId: Optional[str] = Query(None, description="Filter by customer ID"),
    sortBy: str = Query("createdAt", description="Sort field"),
    sortOrder: str = Query("desc", description="Sort order (asc/desc)"),
    current_user: Dict = Depends(get_current_customer),
    db=Depends(get_database)
):
    """
    List all complaints with advanced filtering (Admin only)
    
    **Authentication**: Required (Administrator only)
    
    **Query Parameters**:
    - page: Page number (default: 1)
    - limit: Items per page (default: 10, max: 100)
    - status: Filter by status
    - category: Filter by category
    - priority: Filter by priority
    - assignedTo: Filter by assigned admin user ID
    - customerId: Filter by customer ID
    - sortBy: Sort field (createdAt, priority, status, updatedAt)
    - sortOrder: Sort direction (asc/desc)
    
    **Returns**: Paginated list of all complaints
    """
    try:
        # Verify admin access
        verify_admin_role(current_user)
        
        # Build query filter
        query_filter = {}
        
        if status:
            query_filter["status"] = status
        
        if category:
            query_filter["category"] = category
        
        if priority:
            query_filter["priority"] = priority
        
        if assignedTo:
            query_filter["assignedTo"] = assignedTo
        
        if customerId:
            query_filter["customerId"] = customerId
        
        # Calculate pagination
        skip = (page - 1) * limit
        
        # Determine sort direction
        sort_direction = -1 if sortOrder.lower() == "desc" else 1
        
        # Get total count
        total_items = await db.complaints.count_documents(query_filter)
        total_pages = (total_items + limit - 1) // limit
        
        # Get complaints
        cursor = db.complaints.find(query_filter).sort(sortBy, sort_direction).skip(skip).limit(limit)
        complaints = await cursor.to_list(length=limit)
        
        # Format response
        complaint_list = []
        for complaint in complaints:
            complaint_list.append({
                "complaintId": complaint.get("complaintId"),
                "customerId": complaint.get("customerId"),
                "customerEmail": complaint.get("customerEmail"),
                "customerName": complaint.get("customerName"),
                "orderId": complaint.get("orderId"),
                "category": complaint.get("category"),
                "subject": complaint.get("subject"),
                "status": complaint.get("status"),
                "priority": complaint.get("priority"),
                "assignedTo": complaint.get("assignedTo"),
                "assignedToName": complaint.get("assignedToName"),
                "createdAt": complaint.get("createdAt").isoformat() if complaint.get("createdAt") else None,
                "updatedAt": complaint.get("updatedAt").isoformat() if complaint.get("updatedAt") else None
            })
        
        response_data = {
            "complaints": complaint_list,
            "pagination": {
                "currentPage": page,
                "totalPages": total_pages,
                "totalItems": total_items,
                "itemsPerPage": limit
            }
        }
        
        info(f"Admin {current_user.get('email')} retrieved {len(complaint_list)} complaints")
        
        return success_response(
            message="Complaints retrieved successfully",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error retrieving complaints: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve complaints: {str(e)}"
        )


@router.get("/search", response_model=Dict)
async def search_complaints(
    q: str = Query(..., min_length=1, description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: Dict = Depends(get_current_customer),
    db=Depends(get_database)
):
    """
    Search complaints by ID, subject, customer email, or order ID (Admin only)
    
    **Authentication**: Required (Administrator only)
    
    **Query Parameters**:
    - q: Search query (required)
    - page: Page number (default: 1)
    - limit: Items per page (default: 10, max: 100)
    
    **Search Fields**:
    - Complaint ID (exact match)
    - Subject (partial match, case-insensitive)
    - Customer Email (partial match, case-insensitive)
    - Order ID (exact match)
    
    **Returns**: Paginated search results
    """
    try:
        # Verify admin access
        verify_admin_role(current_user)
        
        # Build search query using $or for multiple fields
        search_pattern = {"$regex": re.escape(q), "$options": "i"}
        
        query_filter = {
            "$or": [
                {"complaintId": q},  # Exact match for complaint ID
                {"subject": search_pattern},  # Partial match for subject
                {"customerEmail": search_pattern},  # Partial match for email
                {"orderId": q}  # Exact match for order ID
            ]
        }
        
        # Calculate pagination
        skip = (page - 1) * limit
        
        # Get total count
        total_items = await db.complaints.count_documents(query_filter)
        total_pages = (total_items + limit - 1) // limit
        
        # Get complaints, sorted by relevance (createdAt desc)
        cursor = db.complaints.find(query_filter).sort("createdAt", -1).skip(skip).limit(limit)
        complaints = await cursor.to_list(length=limit)
        
        # Format response
        complaint_list = []
        for complaint in complaints:
            complaint_list.append({
                "complaintId": complaint.get("complaintId"),
                "customerId": complaint.get("customerId"),
                "customerEmail": complaint.get("customerEmail"),
                "customerName": complaint.get("customerName"),
                "orderId": complaint.get("orderId"),
                "category": complaint.get("category"),
                "subject": complaint.get("subject"),
                "status": complaint.get("status"),
                "priority": complaint.get("priority"),
                "assignedTo": complaint.get("assignedTo"),
                "assignedToName": complaint.get("assignedToName"),
                "createdAt": complaint.get("createdAt").isoformat() if complaint.get("createdAt") else None,
                "updatedAt": complaint.get("updatedAt").isoformat() if complaint.get("updatedAt") else None
            })
        
        response_data = {
            "complaints": complaint_list,
            "pagination": {
                "currentPage": page,
                "totalPages": total_pages,
                "totalItems": total_items,
                "itemsPerPage": limit
            },
            "searchQuery": q
        }
        
        info(f"Admin {current_user.get('email')} searched complaints with query: {q}, found {total_items} results")
        
        return success_response(
            message=f"Found {total_items} complaints matching '{q}'",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error searching complaints: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search complaints: {str(e)}"
        )


@router.patch("/{complaintId}/assign", response_model=Dict)
async def assign_complaint(
    complaintId: str,
    request: AssignComplaintRequest,
    current_user: Dict = Depends(get_current_customer),
    db=Depends(get_database)
):
    """
    Assign complaint to an admin (Admin only)
    
    **Phase 6: Admin Assignment**
    """
    try:
        verify_admin_role(current_user)
        
        user_id = current_user["userId"]
        user_name = current_user.get("name", "Administrator")
        
        # Find complaint
        complaint = await db.complaints.find_one({"complaintId": complaintId})
        
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Complaint {complaintId} not found"
            )
        
        now = datetime.utcnow()
        previous_assignee = complaint.get("assignedTo")
        
        # Update complaint
        update_data = {
            "assignedTo": request.assignTo,
            "assignedAt": now,
            "updatedAt": now,
            "updatedBy": user_id
        }
        
        # Change status to In Progress if currently Open
        if complaint.get("status") == "Open":
            update_data["status"] = "In Progress"
        
        await db.complaints.update_one(
            {"complaintId": complaintId},
            {"$set": update_data}
        )
        
        # Create history entry
        history_entry = {
            "complaintId": complaint["_id"],
            "complaintIdString": complaintId,
            "action": "assigned",
            "previousStatus": complaint.get("status"),
            "newStatus": update_data.get("status", complaint.get("status")),
            "previousAssignee": previous_assignee,
            "newAssignee": request.assignTo,
            "changedBy": user_id,
            "changedByRole": current_user.get("role"),
            "changedByName": user_name,
            "notes": request.notes or f"Complaint assigned to {request.assignTo}",
            "timestamp": now
        }
        
        await db.complaint_history.insert_one(history_entry)
        
        info(f"Complaint {complaintId} assigned to {request.assignTo} by {user_id}")
        
        # Send email notification to customer
        if complaint.get("customerEmail"):
            try:
                from app.services.email_service import send_complaint_assigned_email
                send_complaint_assigned_email(
                    customer_email=complaint.get("customerEmail"),
                    customer_name=complaint.get("customerName", "Customer"),
                    complaint_id=complaintId,
                    subject=complaint.get("subject", ""),
                    assigned_to_name=user_name  # Admin who assigned it
                )
            except Exception as e:
                # Log error but don't fail the assignment
                error(f"Failed to send assignment notification email: {str(e)}")
        
        return success_response(
            message="Complaint assigned successfully",
            data={
                "complaintId": complaintId,
                "assignedTo": request.assignTo,
                "assignedAt": now.isoformat(),
                "status": update_data.get("status", complaint.get("status"))
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error assigning complaint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign complaint: {str(e)}"
        )


@router.post("/{complaintId}/resolve", response_model=Dict)
async def resolve_complaint(
    complaintId: str,
    request: ResolveComplaintRequest,
    current_user: Dict = Depends(get_current_customer),
    db=Depends(get_database)
):
    """
    Resolve a complaint (Admin only)
    
    **Phase 7: Resolution Workflow**
    """
    try:
        verify_admin_role(current_user)
        
        user_id = current_user["userId"]
        user_name = current_user.get("name", "Administrator")
        
        # Find complaint
        complaint = await db.complaints.find_one({"complaintId": complaintId})
        
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Complaint {complaintId} not found"
            )
        
        if complaint.get("status") == "Closed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot resolve a closed complaint"
            )
        
        now = datetime.utcnow()
        previous_status = complaint.get("status")
        
        # Update complaint
        update_data = {
            "status": "Resolved",
            "resolutionNotes": request.resolutionNotes,
            "resolvedBy": user_id,
            "resolvedByName": user_name,
            "resolvedAt": now,
            "updatedAt": now,
            "updatedBy": user_id
        }
        
        if request.tags:
            update_data["tags"] = list(set(complaint.get("tags", []) + request.tags))
        
        await db.complaints.update_one(
            {"complaintId": complaintId},
            {"$set": update_data}
        )
        
        # Create history entry
        history_entry = {
            "complaintId": complaint["_id"],
            "complaintIdString": complaintId,
            "action": "resolved",
            "previousStatus": previous_status,
            "newStatus": "Resolved",
            "previousAssignee": None,
            "newAssignee": None,
            "changedBy": user_id,
            "changedByRole": current_user.get("role"),
            "changedByName": user_name,
            "notes": f"Complaint resolved: {request.resolutionNotes[:100]}...",
            "timestamp": now
        }
        
        await db.complaint_history.insert_one(history_entry)
        
        info(f"Complaint {complaintId} resolved by {user_id}")
        
        # Send resolution email to customer
        if complaint.get("customerEmail"):
            try:
                from app.services.email_service import send_complaint_resolved_email
                send_complaint_resolved_email(
                    customer_email=complaint.get("customerEmail"),
                    customer_name=complaint.get("customerName", "Customer"),
                    complaint_id=complaintId,
                    subject=complaint.get("subject", ""),
                    resolution_notes=request.resolutionNotes,
                    resolved_by_name=user_name
                )
            except Exception as e:
                # Log error but don't fail the resolution
                error(f"Failed to send resolution notification email: {str(e)}")
        
        return success_response(
            message="Complaint resolved successfully",
            data={
                "complaintId": complaintId,
                "status": "Resolved",
                "resolutionNotes": request.resolutionNotes,
                "resolvedBy": user_id,
                "resolvedByName": user_name,
                "resolvedAt": now.isoformat()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error resolving complaint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resolve complaint: {str(e)}"
        )


@router.post("/{complaintId}/reopen", response_model=Dict)
async def reopen_complaint(
    complaintId: str,
    request: ReopenComplaintRequest,
    current_user: Dict = Depends(get_current_customer),
    db=Depends(get_database)
):
    """
    Reopen a resolved complaint
    
    **Phase 7: Resolution Workflow**
    Customers can reopen their own resolved complaints
    Admins can reopen any resolved complaint
    """
    try:
        user_id = current_user["userId"]
        user_role = current_user.get("role", "").lower()
        user_name = current_user.get("name", "User")
        
        # Find complaint
        complaint = await db.complaints.find_one({"complaintId": complaintId})
        
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Complaint {complaintId} not found"
            )
        
        # Only resolved complaints can be reopened
        if complaint.get("status") != "Resolved":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only resolved complaints can be reopened"
            )
        
        # Check authorization for customers
        if user_role not in ["administrator", "admin"]:
            complaint_user_id = complaint.get("userId")
            if str(user_id) != str(complaint_user_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only reopen your own complaints"
                )
        
        now = datetime.utcnow()
        reopened_count = complaint.get("reopenedCount", 0) + 1
        
        # Update complaint
        update_data = {
            "status": "Open",
            "reopenedCount": reopened_count,
            "reopenedBy": user_id,
            "reopenedAt": now,
            "updatedAt": now,
            "updatedBy": user_id
        }
        
        await db.complaints.update_one(
            {"complaintId": complaintId},
            {"$set": update_data}
        )
        
        # Create history entry
        history_entry = {
            "complaintId": complaint["_id"],
            "complaintIdString": complaintId,
            "action": "reopened",
            "previousStatus": "Resolved",
            "newStatus": "Open",
            "previousAssignee": None,
            "newAssignee": None,
            "changedBy": user_id,
            "changedByRole": current_user.get("role"),
            "changedByName": user_name,
            "notes": f"Complaint reopened: {request.reason}",
            "timestamp": now
        }
        
        await db.complaint_history.insert_one(history_entry)
        
        info(f"Complaint {complaintId} reopened by {user_id}")
        
        return success_response(
            message="Complaint reopened successfully",
            data={
                "complaintId": complaintId,
                "status": "Open",
                "reopenedCount": reopened_count,
                "reopenedBy": user_id,
                "reopenedAt": now.isoformat()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error reopening complaint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reopen complaint: {str(e)}"
        )


@router.post("/{complaintId}/close", response_model=Dict)
async def close_complaint(
    complaintId: str,
    notes: Optional[str] = Body(None, embed=True),
    current_user: Dict = Depends(get_current_customer),
    db=Depends(get_database)
):
    """
    Close a complaint (Admin only)
    
    **Phase 7: Resolution Workflow**
    Can only close resolved complaints
    """
    try:
        verify_admin_role(current_user)
        
        user_id = current_user["userId"]
        user_name = current_user.get("name", "Administrator")
        
        # Find complaint
        complaint = await db.complaints.find_one({"complaintId": complaintId})
        
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Complaint {complaintId} not found"
            )
        
        if complaint.get("status") != "Resolved":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only resolved complaints can be closed"
            )
        
        now = datetime.utcnow()
        
        # Update complaint
        update_data = {
            "status": "Closed",
            "closedBy": user_id,
            "closedByName": user_name,
            "closedAt": now,
            "updatedAt": now,
            "updatedBy": user_id
        }
        
        await db.complaints.update_one(
            {"complaintId": complaintId},
            {"$set": update_data}
        )
        
        # Create history entry
        history_entry = {
            "complaintId": complaint["_id"],
            "complaintIdString": complaintId,
            "action": "closed",
            "previousStatus": "Resolved",
            "newStatus": "Closed",
            "previousAssignee": None,
            "newAssignee": None,
            "changedBy": user_id,
            "changedByRole": current_user.get("role"),
            "changedByName": user_name,
            "notes": notes or "Complaint closed",
            "timestamp": now
        }
        
        await db.complaint_history.insert_one(history_entry)
        
        info(f"Complaint {complaintId} closed by {user_id}")
        
        return success_response(
            message="Complaint closed successfully",
            data={
                "complaintId": complaintId,
                "status": "Closed",
                "closedBy": user_id,
                "closedByName": user_name,
                "closedAt": now.isoformat()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error closing complaint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to close complaint: {str(e)}"
        )


@router.patch("/{complaintId}/status", response_model=Dict)
async def update_status(
    complaintId: str,
    request: UpdateStatusRequest,
    current_user: Dict = Depends(get_current_customer),
    db=Depends(get_database)
):
    """
    Update complaint status (Admin only)
    
    **Phase 8: Admin Features**
    """
    try:
        verify_admin_role(current_user)
        
        user_id = current_user["userId"]
        user_name = current_user.get("name", "Administrator")
        
        # Validate status
        valid_statuses = ["Open", "In Progress", "Resolved", "Closed", "Reopened"]
        if request.status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        # Find complaint
        complaint = await db.complaints.find_one({"complaintId": complaintId})
        
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Complaint {complaintId} not found"
            )
        
        previous_status = complaint.get("status")
        
        if previous_status == request.status:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Complaint is already in {request.status} status"
            )
        
        now = datetime.utcnow()
        
        # Update complaint
        await db.complaints.update_one(
            {"complaintId": complaintId},
            {
                "$set": {
                    "status": request.status,
                    "updatedAt": now,
                    "updatedBy": user_id
                }
            }
        )
        
        # Create history entry
        history_entry = {
            "complaintId": complaint["_id"],
            "complaintIdString": complaintId,
            "action": "status_updated",
            "previousStatus": previous_status,
            "newStatus": request.status,
            "previousAssignee": None,
            "newAssignee": None,
            "changedBy": user_id,
            "changedByRole": current_user.get("role"),
            "changedByName": user_name,
            "notes": request.notes or f"Status changed from {previous_status} to {request.status}",
            "timestamp": now
        }
        
        await db.complaint_history.insert_one(history_entry)
        
        info(f"Complaint {complaintId} status updated from {previous_status} to {request.status}")
        
        # Send status change email to customer
        if complaint.get("customerEmail"):
            try:
                from app.services.email_service import send_complaint_status_changed_email
                send_complaint_status_changed_email(
                    customer_email=complaint.get("customerEmail"),
                    customer_name=complaint.get("customerName", "Customer"),
                    complaint_id=complaintId,
                    old_status=previous_status,
                    new_status=request.status,
                    subject=complaint.get("subject", "")
                )
            except Exception as e:
                # Log error but don't fail the status update
                error(f"Failed to send status change notification email: {str(e)}")
        
        return success_response(
            message="Status updated successfully",
            data={
                "complaintId": complaintId,
                "previousStatus": previous_status,
                "newStatus": request.status,
                "updatedAt": now.isoformat()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error updating status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update status: {str(e)}"
        )


@router.patch("/{complaintId}/priority", response_model=Dict)
async def update_priority(
    complaintId: str,
    request: UpdatePriorityRequest,
    current_user: Dict = Depends(get_current_customer),
    db=Depends(get_database)
):
    """
    Update complaint priority (Admin only)
    
    **Phase 8: Admin Features**
    """
    try:
        verify_admin_role(current_user)
        
        user_id = current_user["userId"]
        user_name = current_user.get("name", "Administrator")
        
        # Validate priority
        valid_priorities = ["Low", "Medium", "High", "Critical"]
        if request.priority not in valid_priorities:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid priority. Must be one of: {', '.join(valid_priorities)}"
            )
        
        # Find complaint
        complaint = await db.complaints.find_one({"complaintId": complaintId})
        
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Complaint {complaintId} not found"
            )
        
        previous_priority = complaint.get("priority")
        
        if previous_priority == request.priority:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Complaint already has {request.priority} priority"
            )
        
        now = datetime.utcnow()
        
        # Update complaint
        await db.complaints.update_one(
            {"complaintId": complaintId},
            {
                "$set": {
                    "priority": request.priority,
                    "updatedAt": now,
                    "updatedBy": user_id
                }
            }
        )
        
        # Create history entry
        history_entry = {
            "complaintId": complaint["_id"],
            "complaintIdString": complaintId,
            "action": "priority_updated",
            "previousStatus": None,
            "newStatus": None,
            "previousAssignee": None,
            "newAssignee": None,
            "changedBy": user_id,
            "changedByRole": current_user.get("role"),
            "changedByName": user_name,
            "notes": request.notes or f"Priority changed from {previous_priority} to {request.priority}",
            "timestamp": now,
            "metadata": {
                "previousPriority": previous_priority,
                "newPriority": request.priority
            }
        }
        
        await db.complaint_history.insert_one(history_entry)
        
        info(f"Complaint {complaintId} priority updated from {previous_priority} to {request.priority}")
        
        return success_response(
            message="Priority updated successfully",
            data={
                "complaintId": complaintId,
                "previousPriority": previous_priority,
                "newPriority": request.priority,
                "updatedAt": now.isoformat()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error updating priority: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update priority: {str(e)}"
        )
