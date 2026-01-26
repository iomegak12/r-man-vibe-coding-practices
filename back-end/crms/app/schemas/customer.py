"""
Customer Pydantic Schemas
Define request/response validation schemas
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr, field_validator
from enum import Enum


# Enums
class CustomerStatus(str, Enum):
    """
    Customer Account Status
    
    - **Active**: Customer can place orders and file complaints
    - **Inactive**: Account deactivated or soft-deleted
    - **Suspended**: Temporarily restricted access
    """
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    SUSPENDED = "Suspended"


class CustomerType(str, Enum):
    """
    Customer Tier/Type
    
    - **Regular**: Standard customer tier
    - **Premium**: Premium tier with priority support
    - **VIP**: VIP tier with exclusive benefits
    """
    REGULAR = "Regular"
    PREMIUM = "Premium"
    VIP = "VIP"


# Base Schemas
class CustomerPreferencesSchema(BaseModel):
    """Customer preferences schema"""
    newsletter: bool = True
    notifications: bool = True
    language: str = Field(default="en", min_length=2, max_length=5)


class CustomerMetadataSchema(BaseModel):
    """Customer metadata schema"""
    lastLoginDate: Optional[datetime] = None
    loginCount: int = Field(default=0, ge=0)
    lastActivityDate: Optional[datetime] = None


# Request Schemas
class CreateCustomerRequest(BaseModel):
    """
    Create Customer Request (Internal API)
    
    Used by ATHS during user registration to create customer profile
    """
    userId: str = Field(
        ..., 
        min_length=1, 
        description="Auth Service user ID (MongoDB ObjectId)",
        json_schema_extra={"example": "507f1f77bcf86cd799439011"}
    )
    email: EmailStr = Field(
        ..., 
        description="User email address",
        json_schema_extra={"example": "customer@example.com"}
    )
    fullName: str = Field(
        ..., 
        min_length=2, 
        max_length=100, 
        description="Customer full name",
        json_schema_extra={"example": "John Doe"}
    )
    contactNumber: str = Field(
        ..., 
        min_length=10, 
        max_length=20, 
        description="Contact phone number",
        json_schema_extra={"example": "+1234567890"}
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "userId": "507f1f77bcf86cd799439011",
                "email": "customer@example.com",
                "fullName": "John Doe",
                "contactNumber": "+1234567890"
            }
        }
    }


class UpdateCustomerRequest(BaseModel):
    """
    Update Customer Request (Admin)
    
    Allows admins to update customer profile information
    """
    fullName: Optional[str] = Field(
        None, 
        min_length=1, 
        max_length=100,
        description="Updated full name",
        json_schema_extra={"example": "Jane Smith"}
    )
    contactNumber: Optional[str] = Field(
        None, 
        min_length=10, 
        max_length=15,
        description="Updated contact number",
        json_schema_extra={"example": "+9876543210"}
    )
    customerType: Optional[CustomerType] = Field(
        None,
        description="Updated customer tier"
    )
    notes: Optional[str] = Field(
        None, 
        max_length=1000,
        description="Admin notes (deprecated - use POST /notes endpoint)",
        json_schema_extra={"example": "Preferred customer"}
    )
    tags: Optional[List[str]] = Field(
        None,
        description="Customer tags for categorization",
        json_schema_extra={"example": ["vip", "high-value"]}
    )
    preferences: Optional[dict] = Field(
        None,
        description="Customer preferences",
        json_schema_extra={"example": {"newsletter": True, "notifications": False}}
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "fullName": "Jane Smith",
                "contactNumber": "+9876543210",
                "customerType": "Premium",
                "tags": ["vip", "high-value"],
                "preferences": {"newsletter": True, "notifications": False}
            }
        }
    }


class UpdateCustomerStatusRequest(BaseModel):
    """
    Update Customer Status Request
    
    Change customer account status with optional reason
    """
    status: CustomerStatus = Field(
        ..., 
        description="New customer status"
    )
    reason: Optional[str] = Field(
        None, 
        max_length=500, 
        description="Reason for status change",
        json_schema_extra={"example": "Account suspended due to policy violation"}
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "Suspended",
                "reason": "Account suspended due to policy violation"
            }
        }
    }


class UpdateCustomerTypeRequest(BaseModel):
    """
    Update Customer Type Request
    
    Upgrade or downgrade customer tier
    """
    type: CustomerType = Field(
        ..., 
        description="New customer type/tier"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "type": "Premium"
            }
        }
    }


class UpdateCustomerStatisticsRequest(BaseModel):
    """
    Update Customer Statistics Request (Internal API)
    
    Used by Order/Complaint services to update customer metrics
    """
    totalOrders: Optional[int] = Field(None, ge=0, description="Total order count")
    totalOrderValue: Optional[float] = Field(None, ge=0.0, description="Total order value in currency")
    totalComplaints: Optional[int] = Field(None, ge=0, description="Total complaint count")
    openComplaints: Optional[int] = Field(None, ge=0, description="Open complaint count")
    lastOrderDate: Optional[datetime] = Field(None, description="Last order date")
    lastComplaintDate: Optional[datetime] = Field(None, description="Last complaint date")

    model_config = {
        "json_schema_extra": {
            "example": {
                "totalOrders": 15,
                "totalOrderValue": 1250.50,
                "lastOrderDate": "2026-01-26T10:30:00Z"
            }
        }
    }


class AddCustomerNotesRequest(BaseModel):
    """
    Add Customer Notes Request
    
    Allows admins to add timestamped notes to customer profile
    """
    notes: str = Field(
        ..., 
        min_length=1, 
        max_length=1000, 
        description="Admin note text",
        json_schema_extra={"example": "Customer requested refund for order #12345"}
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "notes": "Customer requested refund for order #12345"
            }
        }
    }


# Response Schemas
class CustomerResponse(BaseModel):
    """
    Basic Customer Response
    
    Standard customer profile information for list views
    """
    customerId: str = Field(description="Customer ID (MongoDB ObjectId)")
    userId: str = Field(description="Auth Service user ID")
    email: str = Field(description="Customer email address")
    fullName: str = Field(description="Customer full name")
    contactNumber: str = Field(description="Customer contact number")
    customerStatus: str = Field(description="Account status (Active/Inactive/Suspended)")
    customerType: str = Field(description="Customer tier (Regular/Premium/VIP)")
    totalOrders: int = Field(description="Total orders placed", ge=0)
    totalOrderValue: float = Field(description="Total order value", ge=0.0)
    totalComplaints: int = Field(description="Total complaints filed", ge=0)
    openComplaints: int = Field(description="Open complaints count", ge=0)
    lastOrderDate: Optional[datetime] = Field(None, description="Last order date")
    customerSince: datetime = Field(description="Customer registration date")

    model_config = {
        "json_schema_extra": {
            "example": {
                "customerId": "507f1f77bcf86cd799439011",
                "userId": "507f191e810c19729de860ea",
                "email": "customer@example.com",
                "fullName": "John Doe",
                "contactNumber": "+1234567890",
                "customerStatus": "Active",
                "customerType": "Premium",
                "totalOrders": 25,
                "totalOrderValue": 2500.50,
                "totalComplaints": 2,
                "openComplaints": 0,
                "lastOrderDate": "2026-01-20T14:30:00Z",
                "customerSince": "2025-06-15T10:00:00Z"
            }
        }
    }


class CustomerDetailResponse(CustomerResponse):
    """
    Detailed Customer Response
    
    Complete customer profile with notes, tags, preferences, and metadata
    """
    lastComplaintDate: Optional[datetime] = Field(None, description="Last complaint date")
    notes: List[dict] = Field(
        default_factory=list, 
        description="Admin notes with timestamps and author info"
    )
    tags: List[str] = Field(
        default_factory=list,
        description="Customer tags for categorization"
    )
    preferences: dict = Field(
        default_factory=dict,
        description="Customer preferences (newsletter, notifications, etc.)"
    )
    metadata: dict = Field(
        default_factory=dict,
        description="Customer metadata (login info, activity tracking)"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "customerId": "507f1f77bcf86cd799439011",
                "userId": "507f191e810c19729de860ea",
                "email": "customer@example.com",
                "fullName": "John Doe",
                "contactNumber": "+1234567890",
                "customerStatus": "Active",
                "customerType": "Premium",
                "totalOrders": 25,
                "totalOrderValue": 2500.50,
                "totalComplaints": 2,
                "openComplaints": 0,
                "lastOrderDate": "2026-01-20T14:30:00Z",
                "lastComplaintDate": "2025-12-10T09:15:00Z",
                "customerSince": "2025-06-15T10:00:00Z",
                "notes": [
                    {
                        "note": "Customer requested priority shipping",
                        "addedBy": "507f191e810c19729de860eb",
                        "addedAt": "2026-01-15T16:20:00Z"
                    }
                ],
                "tags": ["vip", "high-value", "repeat-customer"],
                "preferences": {
                    "newsletter": True,
                    "notifications": True,
                    "language": "en"
                },
                "metadata": {
                    "lastLoginDate": "2026-01-25T08:30:00Z",
                    "loginCount": 42,
                    "lastActivityDate": "2026-01-25T08:45:00Z"
                }
            }
        }
    }


class CustomerStatisticsResponse(BaseModel):
    """
    Customer Statistics Response
    
    Aggregated metrics for a customer
    """
    totalOrders: int = Field(description="Total orders placed", ge=0)
    totalOrderValue: float = Field(description="Total order value", ge=0.0)
    totalComplaints: int = Field(description="Total complaints filed", ge=0)
    openComplaints: int = Field(description="Open complaints count", ge=0)
    lastOrderDate: Optional[datetime] = Field(None, description="Last order date")
    lastComplaintDate: Optional[datetime] = Field(None, description="Last complaint date")

    model_config = {
        "json_schema_extra": {
            "example": {
                "totalOrders": 25,
                "totalOrderValue": 2500.50,
                "totalComplaints": 2,
                "openComplaints": 0,
                "lastOrderDate": "2026-01-20T14:30:00Z",
                "lastComplaintDate": "2025-12-10T09:15:00Z"
            }
        }
    }
    customerSince: datetime


class CustomerListItemResponse(BaseModel):
    """
    Customer List Item Response
    
    Optimized customer data for paginated list views
    """
    customerId: str = Field(description="Customer ID")
    userId: str = Field(description="User ID from ATHS")
    email: str = Field(description="Customer email")
    fullName: str = Field(description="Customer full name")
    contactNumber: str = Field(description="Contact number")
    customerStatus: str = Field(description="Account status")
    customerType: str = Field(description="Customer tier")
    totalOrders: int = Field(description="Total orders", ge=0)
    totalOrderValue: float = Field(description="Total order value", ge=0.0)
    totalComplaints: int = Field(description="Total complaints", ge=0)
    openComplaints: int = Field(description="Open complaints", ge=0)
    lastOrderDate: Optional[datetime] = Field(None, description="Last order date")
    customerSince: datetime = Field(description="Registration date")

    model_config = {
        "json_schema_extra": {
            "example": {
                "customerId": "507f1f77bcf86cd799439011",
                "userId": "507f191e810c19729de860ea",
                "email": "customer@example.com",
                "fullName": "John Doe",
                "contactNumber": "+1234567890",
                "customerStatus": "Active",
                "customerType": "Premium",
                "totalOrders": 25,
                "totalOrderValue": 2500.50,
                "totalComplaints": 2,
                "openComplaints": 0,
                "lastOrderDate": "2026-01-20T14:30:00Z",
                "customerSince": "2025-06-15T10:00:00Z"
            }
        }
    }
