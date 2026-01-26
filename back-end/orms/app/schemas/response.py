"""
Standard Response Schemas
Common response structures for API endpoints
"""
from pydantic import BaseModel, Field
from typing import Generic, TypeVar, List, Optional

T = TypeVar('T')


class ErrorDetail(BaseModel):
    """Error detail schema"""
    field: str = Field(..., description="Field that caused the error")
    message: str = Field(..., description="Error message")


class APIResponse(BaseModel, Generic[T]):
    """Standard API response wrapper"""
    success: bool = Field(..., description="Request success status")
    message: str = Field(..., description="Response message")
    data: Optional[T] = Field(None, description="Response data")
    errors: Optional[List[ErrorDetail]] = Field(None, description="Error details")


class PaginationMeta(BaseModel):
    """Pagination metadata"""
    currentPage: int = Field(..., description="Current page number")
    totalPages: int = Field(..., description="Total number of pages")
    totalItems: int = Field(..., description="Total number of items")
    itemsPerPage: int = Field(..., description="Items per page")
    hasNextPage: bool = Field(..., description="Has next page")
    hasPreviousPage: bool = Field(..., description="Has previous page")


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response structure"""
    items: List[T] = Field(..., description="List of items")
    pagination: PaginationMeta = Field(..., description="Pagination metadata")
