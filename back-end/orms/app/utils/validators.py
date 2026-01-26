"""
Validation Utilities
Common validation functions
"""
from bson import ObjectId
from typing import Optional


def validate_object_id(id_string: str) -> bool:
    """
    Validate if string is a valid MongoDB ObjectId
    
    Args:
        id_string: String to validate
        
    Returns:
        True if valid ObjectId, False otherwise
    """
    try:
        ObjectId(id_string)
        return True
    except Exception:
        return False


def sanitize_search_query(query: str) -> str:
    """
    Sanitize search query for text search
    
    Args:
        query: Raw search query
        
    Returns:
        Sanitized search query
    """
    # Remove special characters that might break text search
    special_chars = ['$', '{', '}', '[', ']', '\\', '"']
    sanitized = query
    
    for char in special_chars:
        sanitized = sanitized.replace(char, '')
    
    # Trim whitespace
    sanitized = sanitized.strip()
    
    return sanitized


def validate_order_id_format(order_id: str) -> bool:
    """
    Validate order ID format: ORD-YYYY-XXXXXX
    
    Args:
        order_id: Order ID to validate
        
    Returns:
        True if valid format, False otherwise
    """
    if not order_id:
        return False
    
    parts = order_id.split('-')
    if len(parts) != 3:
        return False
    
    prefix, year, number = parts
    
    # Check prefix
    if prefix != "ORD":
        return False
    
    # Check year (4 digits)
    if not year.isdigit() or len(year) != 4:
        return False
    
    # Check number (6 digits)
    if not number.isdigit() or len(number) != 6:
        return False
    
    return True
