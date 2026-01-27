"""
Complaint schemas and models
Pydantic models for complaint-related data validation
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class ComplaintCategory(str, Enum):
    """Complaint category enumeration"""
    PRODUCT_QUALITY = "Product Quality"
    DELIVERY_ISSUE = "Delivery Issue"
    CUSTOMER_SERVICE = "Customer Service"
    PAYMENT_ISSUE = "Payment Issue"
    OTHER = "Other"


class ComplaintStatus(str, Enum):
    """Complaint status enumeration"""
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    CLOSED = "Closed"


class ComplaintPriority(str, Enum):
    """Complaint priority enumeration"""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class ComplaintMetadata(BaseModel):
    """Complaint metadata"""
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None
    platform: Optional[str] = None
    source: str = "Web"


class CreateComplaintRequest(BaseModel):
    """Request schema for creating a complaint"""
    orderId: Optional[str] = Field(None, description="Order ID if complaint is order-linked")
    category: ComplaintCategory = Field(..., description="Complaint category")
    subject: str = Field(..., min_length=5, max_length=200, description="Complaint subject/title")
    description: str = Field(..., min_length=20, max_length=2000, description="Detailed complaint description")
    priority: ComplaintPriority = Field(ComplaintPriority.MEDIUM, description="Complaint priority")
    tags: Optional[List[str]] = Field(default_factory=list, description="Complaint tags")
    metadata: Optional[ComplaintMetadata] = Field(default_factory=ComplaintMetadata, description="Request metadata")


class ComplaintResponse(BaseModel):
    """Response schema for complaint data"""
    complaintId: str
    userId: str
    customerId: str
    customerEmail: str
    customerName: str
    orderId: Optional[str] = None
    orderIdString: Optional[str] = None
    category: str
    subject: str
    description: str
    status: str
    priority: str
    assignedTo: Optional[str] = None
    assignedToName: Optional[str] = None
    assignedAt: Optional[datetime] = None
    resolutionNotes: Optional[str] = None
    resolvedBy: Optional[str] = None
    resolvedByName: Optional[str] = None
    resolvedAt: Optional[datetime] = None
    closedBy: Optional[str] = None
    closedByName: Optional[str] = None
    closedAt: Optional[datetime] = None
    reopenedCount: int = 0
    reopenedBy: Optional[str] = None
    reopenedAt: Optional[datetime] = None
    customerSatisfaction: Optional[int] = None
    tags: List[str] = Field(default_factory=list)
    createdAt: datetime
    updatedAt: datetime
    updatedBy: Optional[str] = None


class ComplaintListItem(BaseModel):
    """Simplified complaint item for list views"""
    complaintId: str
    orderId: Optional[str] = None
    category: str
    subject: str
    status: str
    priority: str
    assignedToName: Optional[str] = None
    customerName: str
    createdAt: datetime
    updatedAt: datetime


class UpdateComplaintStatusRequest(BaseModel):
    """Request schema for updating complaint status"""
    status: ComplaintStatus = Field(..., description="New complaint status")
    notes: Optional[str] = Field(None, max_length=500, description="Status change notes")


class UpdateComplaintPriorityRequest(BaseModel):
    """Request schema for updating complaint priority"""
    priority: ComplaintPriority = Field(..., description="New complaint priority")
    notes: Optional[str] = Field(None, max_length=500, description="Priority change notes")


class AssignComplaintRequest(BaseModel):
    """Request schema for assigning complaint"""
    assignTo: str = Field(..., description="Admin user ID to assign complaint to")
    notes: Optional[str] = Field(None, max_length=500, description="Assignment notes")


class ResolveComplaintRequest(BaseModel):
    """Request schema for resolving complaint"""
    resolutionNotes: str = Field(..., min_length=20, max_length=2000, description="Resolution details")
    tags: Optional[List[str]] = Field(default_factory=list, description="Resolution tags")


class ReopenComplaintRequest(BaseModel):
    """Request schema for reopening complaint"""
    reason: str = Field(..., min_length=10, max_length=500, description="Reason for reopening")


class RateComplaintRequest(BaseModel):
    """Request schema for rating complaint resolution"""
    customerSatisfaction: int = Field(..., ge=1, le=5, description="Satisfaction rating (1-5)")
    feedback: Optional[str] = Field(None, max_length=1000, description="Optional feedback")


class AddCommentRequest(BaseModel):
    """Request schema for adding comment"""
    comment: str = Field(..., min_length=1, max_length=2000, description="Comment text")
    isInternal: bool = Field(False, description="Admin-only internal comment")


class CommentResponse(BaseModel):
    """Response schema for comment data"""
    commentId: str
    complaintId: str
    complaintIdString: str
    userId: str
    userName: str
    userRole: str
    comment: str
    isInternal: bool
    createdAt: datetime
    editedAt: Optional[datetime] = None


class ComplaintHistoryResponse(BaseModel):
    """Response schema for complaint history"""
    action: str
    previousStatus: Optional[str] = None
    newStatus: Optional[str] = None
    previousAssignee: Optional[str] = None
    newAssignee: Optional[str] = None
    changedBy: str
    changedByRole: str
    changedByName: str
    notes: Optional[str] = None
    timestamp: datetime


class PaginationMetadata(BaseModel):
    """Pagination metadata"""
    currentPage: int
    totalPages: int
    totalItems: int
    itemsPerPage: int
