"""
Complaint ID generator
Generates unique complaint IDs in format: CMP-YYYY-NNNNNN
"""
from datetime import datetime
from app.config.settings import settings
from app.config.database import get_database
from typing import Optional


async def generate_complaint_id() -> str:
    """
    Generate unique complaint ID
    
    Format: CMP-YYYY-NNNNNN (e.g., CMP-2026-000001)
    
    Returns:
        Unique complaint ID string
    """
    # Get current year
    current_year = datetime.utcnow().year
    
    # Get database
    db = await get_database()
    
    # Find the highest complaint number for current year
    prefix = f"{settings.COMPLAINT_ID_PREFIX}-{current_year}-"
    
    # Query for complaints from current year
    last_complaint = await db.complaints.find_one(
        {"complaintId": {"$regex": f"^{prefix}"}},
        sort=[("complaintId", -1)]
    )
    
    if last_complaint:
        # Extract number from last complaint ID
        last_id = last_complaint["complaintId"]
        last_number = int(last_id.split("-")[-1])
        next_number = last_number + 1
    else:
        # First complaint of the year
        next_number = 1
    
    # Format with leading zeros (6 digits)
    complaint_id = f"{prefix}{next_number:06d}"
    
    return complaint_id


def format_complaint_id(year: int, number: int) -> str:
    """
    Format complaint ID from year and number
    
    Args:
        year: Year
        number: Complaint number
        
    Returns:
        Formatted complaint ID
    """
    return f"{settings.COMPLAINT_ID_PREFIX}-{year}-{number:06d}"
