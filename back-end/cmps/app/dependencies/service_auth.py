"""
Service API Key Authentication
Validates service-to-service communication using API keys
"""
from fastapi import Header, HTTPException, status
from app.config.settings import settings
from app.utils.logger import error, info


async def verify_service_api_key(
    x_service_api_key: str = Header(..., description="Service API Key for internal endpoints")
) -> bool:
    """
    Dependency to verify service API key for internal endpoints
    
    Args:
        x_service_api_key: Service API key from X-Service-API-Key header
        
    Returns:
        True if valid
        
    Raises:
        HTTPException: If API key is invalid
    """
    if x_service_api_key != settings.SERVICE_API_KEY:
        error(f"Invalid service API key provided: {x_service_api_key[:10]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid service API key"
        )
    
    info("Service API key validated successfully")
    return True
