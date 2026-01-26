"""
Order ID Generator
Generate unique order IDs in format: ORD-YYYY-XXXXXX
"""
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.config.settings import settings


async def generate_order_id(db: AsyncIOMotorDatabase) -> str:
    """
    Generate unique order ID
    
    Format: ORD-2026-000001
    
    Args:
        db: Database instance
        
    Returns:
        Unique order ID string
    """
    # Get current year
    current_year = datetime.utcnow().year
    
    # Find the highest order number for current year
    prefix = f"{settings.ORDER_ID_PREFIX}-{current_year}-"
    
    # Get last order ID for this year
    last_order = await db.orders.find_one(
        {"orderId": {"$regex": f"^{prefix}"}},
        sort=[("orderId", -1)]
    )
    
    if last_order:
        # Extract number from last order ID
        last_id = last_order["orderId"]
        last_number = int(last_id.split('-')[-1])
        next_number = last_number + 1
    else:
        # First order of the year
        next_number = 1
    
    # Format: ORD-YYYY-XXXXXX (6 digits)
    order_id = f"{prefix}{next_number:06d}"
    
    return order_id


async def generate_return_id(db: AsyncIOMotorDatabase) -> str:
    """
    Generate unique return request ID
    
    Format: RET-2026-000001
    
    Args:
        db: Database instance
        
    Returns:
        Unique return ID string
    """
    # Get current year
    current_year = datetime.utcnow().year
    
    # Find the highest return number for current year
    prefix = f"{settings.RETURN_ID_PREFIX}-{current_year}-"
    
    # Get last return ID for this year
    last_return = await db.return_requests.find_one(
        {"returnId": {"$regex": f"^{prefix}"}},
        sort=[("returnId", -1)]
    )
    
    if last_return:
        # Extract number from last return ID
        last_id = last_return["returnId"]
        last_number = int(last_id.split('-')[-1])
        next_number = last_number + 1
    else:
        # First return of the year
        next_number = 1
    
    # Format: RET-YYYY-XXXXXX (6 digits)
    return_id = f"{prefix}{next_number:06d}"
    
    return return_id
