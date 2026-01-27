"""
Service clients for external service communication
HTTP clients for Auth, Customer, and Order services
"""
import httpx
from typing import Optional, Dict, Any
from app.config.settings import settings
from app.utils.logger import error, info, warning


class AuthServiceClient:
    """Client for Auth Service communication"""
    
    def __init__(self):
        self.base_url = settings.AUTH_SERVICE_URL
        self.timeout = 10.0
    
    async def validate_token(self, token: str) -> Optional[Dict]:
        """
        Validate JWT token with Auth Service
        
        Args:
            token: JWT token to validate
            
        Returns:
            User information if valid, None otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/auth/validate",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("data")
                
                return None
                
        except Exception as e:
            error(f"Auth Service validation error: {str(e)}")
            return None
    
    async def get_user_by_id(self, user_id: str, token: str) -> Optional[Dict]:
        """
        Get user information by ID
        
        Args:
            user_id: User ID
            token: JWT token for authentication
            
        Returns:
            User information if found
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/users/{user_id}",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("data")
                
                return None
                
        except Exception as e:
            error(f"Auth Service get user error: {str(e)}")
            return None


class CustomerServiceClient:
    """Client for Customer Service communication"""
    
    def __init__(self):
        self.base_url = settings.CUSTOMER_SERVICE_URL
        self.api_key = settings.SERVICE_API_KEY
        self.timeout = 10.0
    
    async def get_customer_by_user_id(self, user_id: str, token: str = None) -> Optional[Dict]:
        """
        Get customer information by user ID
        
        Args:
            user_id: User ID
            token: Optional JWT token to use /me endpoint
            
        Returns:
            Customer information if found
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # If token is provided, use the /me endpoint (customer-facing)
                if token:
                    response = await client.get(
                        f"{self.base_url}/api/customers/me",
                        headers={"Authorization": f"Bearer {token}"}
                    )
                else:
                    # Try internal endpoint (service-to-service)
                    response = await client.get(
                        f"{self.base_url}/api/internal/customers/user/{user_id}",
                        headers={"x-service-api-key": self.api_key}
                    )
                
                if response.status_code == 200:
                    data = response.json()
                    # Handle both direct data and wrapped data responses
                    return data.get("data") if "data" in data else data
                
                warning(f"Customer not found for user {user_id}: {response.status_code}")
                return None
                
        except Exception as e:
            error(f"Customer Service get customer error: {str(e)}")
            return None
    
    async def update_complaint_statistics(
        self,
        customer_id: str,
        increment: bool = True
    ) -> bool:
        """
        Update customer complaint statistics
        
        Args:
            customer_id: Customer ID
            increment: True to increment, False to decrement
            
        Returns:
            True if successful
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.patch(
                    f"{self.base_url}/api/internal/customers/{customer_id}/statistics",
                    headers={"x-service-api-key": self.api_key},
                    json={"complaintCount": 1 if increment else -1}
                )
                
                if response.status_code == 200:
                    info(f"Updated complaint count for customer {customer_id}")
                    return True
                
                warning(f"Failed to update complaint statistics: {response.status_code}")
                return False
                
        except Exception as e:
            error(f"Customer Service update statistics error: {str(e)}")
            return False


class OrderServiceClient:
    """Client for Order Service communication"""
    
    def __init__(self):
        self.base_url = settings.ORDER_SERVICE_URL
        self.api_key = settings.SERVICE_API_KEY
        self.timeout = 10.0
    
    async def get_order_by_id(self, order_id: str) -> Optional[Dict]:
        """
        Get order information by order ID
        
        Args:
            order_id: Order ID
            
        Returns:
            Order information if found
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/internal/orders/{order_id}",
                    headers={"x-service-api-key": self.api_key}
                )
                
                if response.status_code == 200:
                    return response.json()
                
                warning(f"Order not found: {order_id}")
                return None
                
        except Exception as e:
            error(f"Order Service get order error: {str(e)}")
            return None
    
    async def verify_order_customer(self, order_id: str, customer_id: str) -> bool:
        """
        Verify that an order belongs to a specific customer
        
        Args:
            order_id: Order ID
            customer_id: Customer ID
            
        Returns:
            True if order belongs to customer
        """
        try:
            order = await self.get_order_by_id(order_id)
            
            if not order:
                return False
            
            return order.get("customerId") == customer_id
            
        except Exception as e:
            error(f"Order verification error: {str(e)}")
            return False


# Global service client instances
def get_auth_service_client() -> AuthServiceClient:
    """Get Auth Service client instance"""
    return AuthServiceClient()


def get_customer_service_client() -> CustomerServiceClient:
    """Get Customer Service client instance"""
    return CustomerServiceClient()


def get_order_service_client() -> OrderServiceClient:
    """Get Order Service client instance"""
    return OrderServiceClient()
