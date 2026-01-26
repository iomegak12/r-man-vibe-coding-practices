"""
Service API Key Authentication
For internal service-to-service communication
"""
from fastapi import HTTPException, status, Header
from app.config.settings import settings
from app.utils.logger import warning


async def verify_service_api_key(x_api_key: str = Header(..., alias="x-api-key")) -> str:
    """
    Verify service API key for internal endpoints
    
    Args:
        x_api_key: API key from x-api-key header
        
    Returns:
        API key if valid
        
    Raises:
        HTTPException: If API key is invalid or missing
    """
    if x_api_key != settings.SERVICE_API_KEY:
        warning(f"Invalid service API key attempt")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing service API key"
        )
    
    return x_api_key
