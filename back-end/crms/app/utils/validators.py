"""
Custom Validators
Additional validation utilities
"""
from typing import Optional
import re
from bson import ObjectId
from bson.errors import InvalidId


def validate_object_id(id_str: str) -> bool:
    """
    Validate if string is a valid MongoDB ObjectId
    
    Args:
        id_str: String to validate
        
    Returns:
        True if valid ObjectId, False otherwise
    """
    try:
        ObjectId(id_str)
        return True
    except (InvalidId, TypeError):
        return False


def validate_phone_number(phone: str) -> bool:
    """
    Validate phone number format
    
    Args:
        phone: Phone number string
        
    Returns:
        True if valid format, False otherwise
    """
    # Allow digits, spaces, +, -, and parentheses
    pattern = r'^[\d\s\+\-\(\)]+$'
    if not re.match(pattern, phone):
        return False
    
    # Check minimum length (at least 10 digits)
    digits = re.sub(r'[^\d]', '', phone)
    return len(digits) >= 10


def sanitize_search_query(query: str) -> str:
    """
    Sanitize search query to prevent injection
    
    Args:
        query: Search query string
        
    Returns:
        Sanitized query string
    """
    # Remove special regex characters
    special_chars = r'[\$\.\*\+\?\|\(\)\[\]\{\}\\^]'
    return re.sub(special_chars, '', query.strip())
