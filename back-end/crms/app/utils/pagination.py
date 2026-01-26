"""
Pagination Utility
Helper functions for paginating database queries
"""
from typing import List, TypeVar, Generic
from app.schemas.response import PaginationMeta, PaginatedResponse
from app.config.settings import settings

T = TypeVar('T')


def calculate_pagination(
    page: int,
    limit: int,
    total_items: int
) -> tuple[int, PaginationMeta]:
    """
    Calculate pagination metadata and skip value
    
    Args:
        page: Current page number (1-indexed)
        limit: Items per page
        total_items: Total number of items
        
    Returns:
        Tuple of (skip, PaginationMeta)
    """
    # Validate and adjust page and limit
    page = max(1, page)
    limit = min(max(1, limit), settings.MAX_PAGE_SIZE)
    
    # Calculate pagination values
    skip = (page - 1) * limit
    total_pages = (total_items + limit - 1) // limit if total_items > 0 else 1
    
    # Create pagination metadata
    pagination = PaginationMeta(
        currentPage=page,
        totalPages=total_pages,
        totalItems=total_items,
        itemsPerPage=limit,
        hasNextPage=page < total_pages,
        hasPreviousPage=page > 1
    )
    
    return skip, pagination


def create_paginated_response(
    items: List[T],
    pagination: PaginationMeta
) -> PaginatedResponse[T]:
    """
    Create a paginated response
    
    Args:
        items: List of items for current page
        pagination: Pagination metadata
        
    Returns:
        PaginatedResponse object
    """
    return PaginatedResponse(
        items=items,
        pagination=pagination
    )
