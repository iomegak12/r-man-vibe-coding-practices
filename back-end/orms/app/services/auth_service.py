"""
Authentication Service Client
Handles communication with the Authentication Service (ATHS)
"""
import httpx
from typing import Optional, Dict
from app.config.settings import settings
from app.utils.logger import info, error


class AuthServiceClient:
    """
    Client for interacting with Authentication Service
    """
    
    def __init__(self):
        self.base_url = settings.AUTH_SERVICE_URL
        self.service_api_key = settings.SERVICE_API_KEY
        self.timeout = 10.0  # 10 seconds timeout
    
    async def verify_token(self, token: str) -> Optional[Dict]:
        """
        Verify a JWT token with the Authentication Service
        
        Args:
            token: JWT token to verify
            
        Returns:
            User information if token is valid, None otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/auth/verify-token",
                    headers={
                        "X-Service-API-Key": self.service_api_key
                    },
                    json={"token": token}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        info(f"Token verified successfully for user: {data.get('data', {}).get('userId')}")
                        return data.get("data")
                    else:
                        error(f"Token verification failed: {data.get('message')}")
                        return None
                else:
                    error(f"Auth service returned status {response.status_code}")
                    return None
                    
        except httpx.TimeoutException:
            error(f"Timeout while verifying token with auth service")
            return None
        except httpx.RequestError as e:
            error(f"Error connecting to auth service: {str(e)}")
            return None
        except Exception as e:
            error(f"Unexpected error verifying token: {str(e)}")
            return None
    
    async def get_user_by_id(self, user_id: str, requesting_user_token: str) -> Optional[Dict]:
        """
        Get user information by user ID from Authentication Service
        
        Args:
            user_id: User ID to retrieve
            requesting_user_token: JWT token of the requesting user (for authorization)
            
        Returns:
            User information if found, None otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/users/{user_id}",
                    headers={
                        "Authorization": f"Bearer {requesting_user_token}",
                        "X-Service-API-Key": self.service_api_key
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        info(f"Retrieved user information for: {user_id}")
                        return data.get("data")
                    else:
                        error(f"Failed to get user: {data.get('message')}")
                        return None
                elif response.status_code == 404:
                    error(f"User not found: {user_id}")
                    return None
                else:
                    error(f"Auth service returned status {response.status_code}")
                    return None
                    
        except httpx.TimeoutException:
            error(f"Timeout while getting user from auth service")
            return None
        except httpx.RequestError as e:
            error(f"Error connecting to auth service: {str(e)}")
            return None
        except Exception as e:
            error(f"Unexpected error getting user: {str(e)}")
            return None
    
    async def validate_service_api_key(self, api_key: str) -> bool:
        """
        Validate a service API key with the Authentication Service
        
        Args:
            api_key: Service API key to validate
            
        Returns:
            True if valid, False otherwise
        """
        # For now, we validate locally against our configured key
        # This could be extended to call ATHS for centralized validation
        is_valid = api_key == self.service_api_key
        
        if is_valid:
            info("Service API key validated successfully")
        else:
            error("Invalid service API key provided")
        
        return is_valid


# Singleton instance
_auth_service_client = None


def get_auth_service_client() -> AuthServiceClient:
    """
    Get the singleton AuthServiceClient instance
    """
    global _auth_service_client
    if _auth_service_client is None:
        _auth_service_client = AuthServiceClient()
    return _auth_service_client
