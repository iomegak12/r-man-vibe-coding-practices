"""
Complaint routes
Customer-facing complaint endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from typing import Dict, Optional, List
from datetime import datetime
from bson import ObjectId

from app.config.database import get_database
from app.dependencies.auth import get_current_customer
from app.schemas.complaint import (
    CreateComplaintRequest,
    ComplaintResponse
)
from app.schemas.comment import (
    CreateCommentRequest,
    CommentResponse
)
from app.services.external_services import (
    get_customer_service_client,
    get_order_service_client
)
from app.utils.complaint_id import generate_complaint_id
from app.utils.response import success_response
from app.utils.logger import info, error


router = APIRouter(
    prefix="/api/complaints",
    tags=["Complaints"]
)


@router.post("", response_model=Dict, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    request: CreateComplaintRequest,
    current_user: Dict = Depends(get_current_customer),
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """
    Create a new complaint (order-linked or general)
    
    **Authentication**: Required (Customer or Administrator)
    
    **Request Body**:
    - orderId: Optional order ID if complaint is order-linked
    - category: Complaint category (Product Quality, Delivery Issue, etc.)
    - subject: Complaint subject (5-200 characters)
    - description: Detailed description (20-2000 characters)
    - priority: Optional priority (Low/Medium/High/Critical), defaults to Medium
    - tags: Optional list of tags
    
    **Process**:
    1. Validate order ownership if orderId provided
    2. Fetch customer information
    3. Generate unique complaint ID
    4. Save complaint to database
    5. Create history entry
    6. Update customer statistics
    
    **Returns**: Created complaint information
    """
    try:
        user_id = current_user["userId"]
        
        # Extract token from authorization header
        token = None
        if authorization and authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "")
        
        # Get service clients
        customer_service = get_customer_service_client()
        order_service = get_order_service_client()
        
        # Step 1: Get customer information
        customer_data = await customer_service.get_customer_by_user_id(user_id, token)
        
        info(f"Customer data from CRMS: {customer_data}")
        
        if not customer_data:
            # For admin users or users without customer profiles, use basic user info
            customer_id = f"USR-{user_id}"  # Fallback customer ID
            customer_email = current_user.get("email", "unknown@example.com")
            customer_name = current_user.get("name", "Unknown User")
            info(f"No customer profile found for user {user_id}, using fallback data")
        else:
            customer_id = customer_data.get("customerId")
            customer_email = customer_data.get("email") or current_user.get("email")
            customer_name = customer_data.get("name") or current_user.get("name", "")
            info(f"Using customer data - ID: {customer_id}, Email: {customer_email}")
        
        # Step 2: Validate order if provided
        order_id_string = None
        if request.orderId:
            # Verify order exists
            order_data = await order_service.get_order_by_id(request.orderId)
            
            if not order_data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Order {request.orderId} not found"
                )
            
            # Verify order ownership
            # - Administrators can create complaints for any order
            # - Customers can only create complaints for their own orders
            order_customer_id = order_data.get("customerId")
            user_role = current_user.get("role", "").lower()
            
            info(f"Order validation - Order customer ID: {order_customer_id}, Current customer ID: {customer_id}, User role: {user_role}")
            
            # Check ownership only if user is not an administrator
            if user_role not in ["administrator", "admin"]:
                # Compare as strings to handle ObjectId vs string comparison
                if str(order_customer_id) != str(customer_id):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You can only create complaints for your own orders"
                    )
            else:
                info(f"Administrator {current_user.get('email')} creating complaint for order {request.orderId}")
                # For admin creating complaint for another customer's order, use that customer's info
                if str(order_customer_id) != str(customer_id):
                    # Get the actual order customer's information
                    order_customer_email = order_data.get("customerEmail")
                    order_customer_name = order_data.get("customerName")
                    # Override with order's customer data
                    customer_id = order_customer_id
                    customer_email = order_customer_email or customer_email
                    customer_name = order_customer_name or customer_name
                    info(f"Using order's customer data - ID: {customer_id}, Email: {customer_email}")
            
            order_id_string = request.orderId
            info(f"Complaint linked to order: {order_id_string}")
        
        # Step 3: Generate unique complaint ID
        complaint_id = await generate_complaint_id()
        
        # Step 4: Prepare complaint document
        now = datetime.utcnow()
        
        complaint_doc = {
            "complaintId": complaint_id,
            "userId": user_id,
            "customerId": customer_id,
            "customerEmail": customer_email,
            "customerName": customer_name,
            "orderId": request.orderId,  # Can be None
            "orderIdString": order_id_string,
            "category": request.category.value,
            "subject": request.subject,
            "description": request.description,
            "status": "Open",
            "priority": request.priority.value,
            "assignedTo": None,
            "assignedToName": None,
            "assignedAt": None,
            "resolutionNotes": None,
            "resolvedBy": None,
            "resolvedByName": None,
            "resolvedAt": None,
            "closedBy": None,
            "closedByName": None,
            "closedAt": None,
            "reopenedCount": 0,
            "reopenedBy": None,
            "reopenedAt": None,
            "customerSatisfaction": None,
            "tags": request.tags or [],
            "metadata": {
                "ipAddress": request.metadata.ipAddress if request.metadata else None,
                "userAgent": request.metadata.userAgent if request.metadata else None,
                "platform": request.metadata.platform if request.metadata else None,
                "source": request.metadata.source if request.metadata else "Web"
            },
            "createdAt": now,
            "updatedAt": now,
            "updatedBy": user_id
        }
        
        # Step 5: Save complaint to database
        result = await db.complaints.insert_one(complaint_doc)
        complaint_doc["_id"] = result.inserted_id
        
        info(f"Complaint created: {complaint_id} for customer {customer_id}")
        
        # Step 6: Create history entry
        history_entry = {
            "complaintId": result.inserted_id,
            "complaintIdString": complaint_id,
            "action": "created",
            "previousStatus": None,
            "newStatus": "Open",
            "previousAssignee": None,
            "newAssignee": None,
            "changedBy": user_id,
            "changedByRole": current_user.get("role", "Customer"),
            "changedByName": customer_name,
            "notes": f"Complaint created: {request.subject}",
            "timestamp": now,
            "metadata": {
                "ipAddress": request.metadata.ipAddress if request.metadata else None,
                "userAgent": request.metadata.userAgent if request.metadata else None
            }
        }
        
        await db.complaint_history.insert_one(history_entry)
        
        # Step 7: Update customer statistics
        try:
            # Only update if we have a real customer ID (not fallback)
            if customer_data and customer_id:
                await customer_service.update_complaint_statistics(
                    customer_id=customer_id,
                    increment=True
                )
                info(f"Updated complaint count for customer {customer_id}")
        except Exception as e:
            # Log error but don't fail the complaint creation
            error(f"Failed to update customer statistics: {str(e)}")
        
        # Step 8: Send confirmation email
        try:
            from app.services.email_service import send_complaint_created_email
            send_complaint_created_email(
                customer_email=customer_email,
                customer_name=customer_name,
                complaint_id=complaint_id,
                subject=request.subject,
                category=request.category.value
            )
        except Exception as e:
            # Log error but don't fail the complaint creation
            error(f"Failed to send complaint confirmation email: {str(e)}")
        
        # Step 9: Prepare response
        response_data = {
            "complaintId": complaint_id,
            "userId": user_id,
            "customerEmail": customer_email,
            "customerName": customer_name,
            "orderId": order_id_string,
            "category": request.category.value,
            "subject": request.subject,
            "description": request.description,
            "status": "Open",
            "priority": request.priority.value,
            "createdAt": now.isoformat()
        }
        
        return success_response(
            message="Complaint registered successfully",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error creating complaint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create complaint: {str(e)}"
        )


@router.get("/me", response_model=Dict)
async def get_my_complaints(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sortBy: str = Query("createdAt", description="Sort field"),
    sortOrder: str = Query("desc", description="Sort order (asc/desc)"),
    current_user: Dict = Depends(get_current_customer),
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """
    Get authenticated customer's complaints with pagination and filtering
    
    **Authentication**: Required (Customer or Administrator)
    
    **Query Parameters**:
    - page: Page number (default: 1)
    - limit: Items per page (default: 10, max: 50)
    - status: Filter by status (Open, In Progress, Resolved, Closed, Reopened)
    - category: Filter by category
    - sortBy: Sort field (createdAt, priority, status)
    - sortOrder: Sort direction (asc/desc)
    
    **Returns**: Paginated list of customer's complaints
    """
    try:
        user_id = current_user["userId"]
        
        # Extract token from authorization header
        token = None
        if authorization and authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "")
        
        # Get customer information
        customer_service = get_customer_service_client()
        customer_data = await customer_service.get_customer_by_user_id(user_id, token)
        
        if not customer_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer profile not found"
            )
        
        customer_id = customer_data.get("customerId")
        
        # Build query filter
        query_filter = {"customerId": customer_id}
        
        if status:
            query_filter["status"] = status
        
        if category:
            query_filter["category"] = category
        
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
                "orderId": complaint.get("orderId"),
                "category": complaint.get("category"),
                "subject": complaint.get("subject"),
                "status": complaint.get("status"),
                "priority": complaint.get("priority"),
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
        
        info(f"Retrieved {len(complaint_list)} complaints for customer {customer_id}")
        
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


@router.get("/{complaintId}", response_model=Dict)
async def get_complaint_by_id(
    complaintId: str,
    current_user: Dict = Depends(get_current_customer),
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """
    Get detailed complaint information
    
    **Authentication**: Required (Customer or Administrator)
    
    **Authorization**:
    - Customers can only view their own complaints
    - Administrators can view all complaints
    
    **Returns**: Detailed complaint information
    """
    try:
        user_id = current_user["userId"]
        user_role = current_user.get("role", "").lower()
        
        # Find complaint
        complaint = await db.complaints.find_one({"complaintId": complaintId})
        
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Complaint {complaintId} not found"
            )
        
        # Check authorization
        # Administrators can view all complaints
        # Customers can only view their own complaints
        if user_role not in ["administrator", "admin"]:
            # Extract token from authorization header
            token = None
            if authorization and authorization.startswith("Bearer "):
                token = authorization.replace("Bearer ", "")
            
            # Get customer information
            customer_service = get_customer_service_client()
            customer_data = await customer_service.get_customer_by_user_id(user_id, token)
            
            if not customer_data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Customer profile not found"
                )
            
            customer_id = customer_data.get("customerId")
            complaint_customer_id = complaint.get("customerId")
            
            # Check ownership
            if str(customer_id) != str(complaint_customer_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only view your own complaints"
                )
        
        # Format response
        response_data = {
            "complaintId": complaint.get("complaintId"),
            "userId": complaint.get("userId"),
            "customerEmail": complaint.get("customerEmail"),
            "customerName": complaint.get("customerName"),
            "customerId": complaint.get("customerId"),
            "orderId": complaint.get("orderId"),
            "category": complaint.get("category"),
            "subject": complaint.get("subject"),
            "description": complaint.get("description"),
            "status": complaint.get("status"),
            "priority": complaint.get("priority"),
            "assignedTo": complaint.get("assignedTo"),
            "assignedToName": complaint.get("assignedToName"),
            "assignedAt": complaint.get("assignedAt").isoformat() if complaint.get("assignedAt") else None,
            "resolutionNotes": complaint.get("resolutionNotes"),
            "resolvedBy": complaint.get("resolvedBy"),
            "resolvedByName": complaint.get("resolvedByName"),
            "resolvedAt": complaint.get("resolvedAt").isoformat() if complaint.get("resolvedAt") else None,
            "closedBy": complaint.get("closedBy"),
            "closedByName": complaint.get("closedByName"),
            "closedAt": complaint.get("closedAt").isoformat() if complaint.get("closedAt") else None,
            "customerSatisfaction": complaint.get("customerSatisfaction"),
            "reopenedCount": complaint.get("reopenedCount", 0),
            "tags": complaint.get("tags", []),
            "createdAt": complaint.get("createdAt").isoformat() if complaint.get("createdAt") else None,
            "updatedAt": complaint.get("updatedAt").isoformat() if complaint.get("updatedAt") else None
        }
        
        info(f"Retrieved complaint {complaintId} for user {user_id}")
        
        return success_response(
            message="Complaint retrieved successfully",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error retrieving complaint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve complaint: {str(e)}"
        )


@router.post("/{complaintId}/comments", response_model=Dict, status_code=status.HTTP_201_CREATED)
async def add_comment(
    complaintId: str,
    request: CreateCommentRequest,
    current_user: Dict = Depends(get_current_customer),
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """
    Add a comment to a complaint
    
    **Authentication**: Required (Customer or Administrator)
    
    **Authorization**:
    - Customers can comment only on their own complaints
    - Administrators can comment on any complaint
    - Only administrators can create internal comments (isInternal=true)
    
    **Request Body**:
    - comment: Comment text (1-2000 characters)
    - isInternal: Internal comment visible only to admins (admin-only, default: false)
    
    **Returns**: Created comment information
    """
    try:
        user_id = current_user["userId"]
        user_role = current_user.get("role", "").lower()
        user_email = current_user.get("email", "")
        user_name = current_user.get("name", "Unknown User")
        
        # Find complaint
        complaint = await db.complaints.find_one({"complaintId": complaintId})
        
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Complaint {complaintId} not found"
            )
        
        # Check authorization
        # Administrators can comment on any complaint
        # Customers can only comment on their own complaints
        if user_role not in ["administrator", "admin"]:
            # Extract token from authorization header
            token = None
            if authorization and authorization.startswith("Bearer "):
                token = authorization.replace("Bearer ", "")
            
            # Get customer information
            customer_service = get_customer_service_client()
            customer_data = await customer_service.get_customer_by_user_id(user_id, token)
            
            if not customer_data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Customer profile not found"
                )
            
            customer_id = customer_data.get("customerId")
            complaint_customer_id = complaint.get("customerId")
            
            # Check ownership
            if str(customer_id) != str(complaint_customer_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only comment on your own complaints"
                )
            
            # Customers cannot create internal comments
            if request.isInternal:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only administrators can create internal comments"
                )
        
        # Generate comment ID
        comment_id = str(ObjectId())
        
        # Prepare comment document
        now = datetime.utcnow()
        
        comment_doc = {
            "_id": ObjectId(comment_id),
            "commentId": comment_id,
            "complaintId": complaint["_id"],
            "complaintIdString": complaintId,
            "userId": user_id,
            "userName": user_name,
            "userEmail": user_email,
            "userRole": current_user.get("role", "Customer"),
            "comment": request.comment,
            "isInternal": request.isInternal if user_role in ["administrator", "admin"] else False,
            "createdAt": now,
            "updatedAt": now
        }
        
        # Save comment to database
        await db.complaint_comments.insert_one(comment_doc)
        
        info(f"Comment added to complaint {complaintId} by user {user_id}")
        
        # Update complaint's updatedAt timestamp
        await db.complaints.update_one(
            {"complaintId": complaintId},
            {
                "$set": {
                    "updatedAt": now,
                    "updatedBy": user_id
                }
            }
        )
        
        # Create history entry
        history_entry = {
            "complaintId": complaint["_id"],
            "complaintIdString": complaintId,
            "action": "comment_added",
            "previousStatus": None,
            "newStatus": None,
            "previousAssignee": None,
            "newAssignee": None,
            "changedBy": user_id,
            "changedByRole": current_user.get("role", "Customer"),
            "changedByName": user_name,
            "notes": f"Comment added: {request.comment[:50]}..." if len(request.comment) > 50 else f"Comment added: {request.comment}",
            "timestamp": now,
            "metadata": {
                "commentId": comment_id,
                "isInternal": comment_doc["isInternal"]
            }
        }
        
        await db.complaint_history.insert_one(history_entry)
        
        # Send email notification if admin commented on customer's complaint (non-internal only)
        if (user_role in ["administrator", "admin"] and 
            not comment_doc["isInternal"] and 
            complaint.get("customerEmail")):
            try:
                from app.services.email_service import send_complaint_comment_email
                send_complaint_comment_email(
                    customer_email=complaint.get("customerEmail"),
                    customer_name=complaint.get("customerName", "Customer"),
                    complaint_id=complaintId,
                    subject=complaint.get("subject", ""),
                    commenter_name=user_name,
                    comment=request.comment
                )
            except Exception as e:
                # Log error but don't fail the comment creation
                error(f"Failed to send comment notification email: {str(e)}")
        
        # Prepare response
        response_data = {
            "commentId": comment_id,
            "complaintId": complaintId,
            "userId": user_id,
            "userName": user_name,
            "userRole": current_user.get("role", "Customer"),
            "userEmail": user_email,
            "comment": request.comment,
            "isInternal": comment_doc["isInternal"],
            "createdAt": now.isoformat()
        }
        
        return success_response(
            message="Comment added successfully",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error adding comment: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add comment: {str(e)}"
        )


@router.get("/{complaintId}/comments", response_model=Dict)
async def get_comments(
    complaintId: str,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: Dict = Depends(get_current_customer),
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """
    Get all comments for a complaint
    
    **Authentication**: Required (Customer or Administrator)
    
    **Authorization**:
    - Customers can view comments on their own complaints (excluding internal comments)
    - Administrators can view all comments on any complaint (including internal comments)
    
    **Query Parameters**:
    - page: Page number (default: 1)
    - limit: Items per page (default: 20, max: 100)
    
    **Returns**: Paginated list of comments, sorted by createdAt ascending
    """
    try:
        user_id = current_user["userId"]
        user_role = current_user.get("role", "").lower()
        
        # Find complaint
        complaint = await db.complaints.find_one({"complaintId": complaintId})
        
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Complaint {complaintId} not found"
            )
        
        # Check authorization
        # Administrators can view comments on any complaint
        # Customers can only view comments on their own complaints
        if user_role not in ["administrator", "admin"]:
            # Extract token from authorization header
            token = None
            if authorization and authorization.startswith("Bearer "):
                token = authorization.replace("Bearer ", "")
            
            # Get customer information
            customer_service = get_customer_service_client()
            customer_data = await customer_service.get_customer_by_user_id(user_id, token)
            
            if not customer_data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Customer profile not found"
                )
            
            customer_id = customer_data.get("customerId")
            complaint_customer_id = complaint.get("customerId")
            
            # Check ownership
            if str(customer_id) != str(complaint_customer_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only view comments on your own complaints"
                )
        
        # Build query filter
        query_filter = {"complaintId": complaint["_id"]}
        
        # Customers cannot see internal comments
        if user_role not in ["administrator", "admin"]:
            query_filter["isInternal"] = False
        
        # Calculate pagination
        skip = (page - 1) * limit
        
        # Get total count
        total_items = await db.complaint_comments.count_documents(query_filter)
        total_pages = (total_items + limit - 1) // limit
        
        # Get comments, sorted by createdAt ascending
        cursor = db.complaint_comments.find(query_filter).sort("createdAt", 1).skip(skip).limit(limit)
        comments = await cursor.to_list(length=limit)
        
        # Format response
        comment_list = []
        for comment in comments:
            comment_list.append({
                "commentId": comment.get("commentId"),
                "complaintId": complaintId,
                "userId": comment.get("userId"),
                "userName": comment.get("userName"),
                "userEmail": comment.get("userEmail"),
                "userRole": comment.get("userRole"),
                "comment": comment.get("comment"),
                "isInternal": comment.get("isInternal", False),
                "createdAt": comment.get("createdAt").isoformat() if comment.get("createdAt") else None
            })
        
        response_data = {
            "comments": comment_list,
            "pagination": {
                "currentPage": page,
                "totalPages": total_pages,
                "totalItems": total_items,
                "itemsPerPage": limit
            }
        }
        
        info(f"Retrieved {len(comment_list)} comments for complaint {complaintId}")
        
        return success_response(
            message="Comments retrieved successfully",
            data=response_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        error(f"Error retrieving comments: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve comments: {str(e)}"
        )
