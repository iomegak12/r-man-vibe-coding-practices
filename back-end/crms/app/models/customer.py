"""
Customer Model
Defines the Customer data structure in MongoDB
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId


class CustomerPreferences(BaseModel):
    """Customer preferences model"""
    newsletter: bool = True
    notifications: bool = True
    language: str = "en"


class CustomerMetadata(BaseModel):
    """Customer metadata model"""
    lastLoginDate: Optional[datetime] = None
    loginCount: int = 0
    lastActivityDate: Optional[datetime] = None


class Customer(BaseModel):
    """Customer MongoDB document model"""
    id: Optional[str] = Field(None, alias="_id")
    userId: str = Field(..., description="Reference to Auth Service user._id")
    email: str = Field(..., description="Denormalized from Auth Service")
    fullName: str = Field(..., description="Denormalized from Auth Service")
    contactNumber: str = Field(..., description="Denormalized from Auth Service")
    
    # Customer Business Data
    customerStatus: str = Field(default="Active", description="Active, Inactive, Suspended")
    customerType: str = Field(default="Regular", description="Regular, Premium, VIP")
    
    # Statistics
    totalOrders: int = Field(default=0, ge=0, description="Total number of orders")
    totalOrderValue: float = Field(default=0.0, ge=0.0, description="Total monetary value")
    totalComplaints: int = Field(default=0, ge=0, description="Total complaints")
    openComplaints: int = Field(default=0, ge=0, description="Open complaints")
    
    # Dates
    lastOrderDate: Optional[datetime] = None
    lastComplaintDate: Optional[datetime] = None
    customerSince: datetime = Field(default_factory=datetime.utcnow)
    
    # Additional Information
    notes: Optional[str] = Field(None, max_length=1000)
    tags: List[str] = Field(default_factory=list)
    
    # Preferences and Metadata
    preferences: CustomerPreferences = Field(default_factory=CustomerPreferences)
    metadata: CustomerMetadata = Field(default_factory=CustomerMetadata)
    
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    createdBy: Optional[str] = None
    updatedBy: Optional[str] = None
    
    class Config:
        populate_by_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }
        json_schema_extra = {
            "example": {
                "userId": "65a1b2c3d4e5f6g7h8i9j0k0",
                "email": "john.doe@example.com",
                "fullName": "John Doe",
                "contactNumber": "+919876543210",
                "customerStatus": "Active",
                "customerType": "Premium",
                "totalOrders": 15,
                "totalOrderValue": 45500.00,
                "totalComplaints": 2,
                "openComplaints": 0,
                "customerSince": "2025-06-15T10:00:00.000Z"
            }
        }
