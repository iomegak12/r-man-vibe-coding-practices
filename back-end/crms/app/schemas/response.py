"""
Standard Response Schemas
Define common API response structures
"""
from typing import Optional, Any, List, Generic, TypeVar
from pydantic import BaseModel, Field


DataT = TypeVar('DataT')


class ErrorDetail(BaseModel):
    """Error detail schema"""
    field: str = Field(..., description="Field that caused the error")
    message: str = Field(..., description="Error message")


class APIResponse(BaseModel, Generic[DataT]):
    """Standard API response wrapper"""
    success: bool = Field(..., description="Indicates if request was successful")
    message: str = Field(..., description="Response message")
    data: Optional[DataT] = Field(None, description="Response data")
    errors: Optional[List[ErrorDetail]] = Field(None, description="Error details if failed")


class PaginationMeta(BaseModel):
    """Pagination metadata"""
    currentPage: int = Field(..., description="Current page number")
    totalPages: int = Field(..., description="Total number of pages")
    totalItems: int = Field(..., description="Total number of items")
    itemsPerPage: int = Field(..., description="Items per page")
    hasNextPage: bool = Field(..., description="Has next page")
    hasPreviousPage: bool = Field(..., description="Has previous page")


class PaginatedResponse(BaseModel, Generic[DataT]):
    """Paginated response with data and metadata"""
    items: List[DataT] = Field(..., description="List of items")
    pagination: PaginationMeta = Field(..., description="Pagination metadata")
