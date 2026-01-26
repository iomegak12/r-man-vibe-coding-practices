"""
Auth Service HTTP Client
Communication with Authentication Service
"""
import httpx
from typing import Optional, Dict, Any
from app.config.settings import settings
from app.utils.logger import error, info, debug


class AuthServiceClient:
    """HTTP client for Auth Service communication"""
    
    def __init__(self):
        self.base_url = settings.AUTH_SERVICE_URL
        self.service_api_key = settings.SERVICE_API_KEY
        self.timeout = settings.SERVICE_TIMEOUT
        
    async def validate_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Validate JWT token with Auth Service
        
        Args:
            token: JWT access token to validate
            
        Returns:
            User data if token is valid, None otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/internal/validate-token",
                    json={"token": token},
                    headers={"x-api-key": self.service_api_key}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        debug(f"Token validated successfully via Auth Service")
                        return data.get("data", {}).get("user")
                    
                error(f"Token validation failed: {response.text}")
                return None
                
        except httpx.TimeoutException:
            error("Auth Service timeout during token validation")
            return None
        except Exception as e:
            error(f"Auth Service communication error: {str(e)}")
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user details by user ID from Auth Service
        
        Args:
            user_id: User ID to fetch
            
        Returns:
            User data if found, None otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/internal/user/{user_id}",
                    headers={"x-api-key": self.service_api_key}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        debug(f"User {user_id} fetched from Auth Service")
                        return data.get("data", {}).get("user")
                
                if response.status_code == 404:
                    debug(f"User {user_id} not found in Auth Service")
                    return None
                    
                error(f"Failed to fetch user {user_id}: {response.text}")
                return None
                
        except httpx.TimeoutException:
            error("Auth Service timeout during user fetch")
            return None
        except Exception as e:
            error(f"Auth Service communication error: {str(e)}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Get user details by email from Auth Service
        
        Args:
            email: User email to fetch
            
        Returns:
            User data if found, None otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/internal/user/email/{email}",
                    headers={"x-api-key": self.service_api_key}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        debug(f"User {email} fetched from Auth Service")
                        return data.get("data", {}).get("user")
                
                if response.status_code == 404:
                    debug(f"User {email} not found in Auth Service")
                    return None
                    
                error(f"Failed to fetch user {email}: {response.text}")
                return None
                
        except httpx.TimeoutException:
            error("Auth Service timeout during user fetch")
            return None
        except Exception as e:
            error(f"Auth Service communication error: {str(e)}")
            return None


# Global Auth Service client instance
auth_service_client = AuthServiceClient()
