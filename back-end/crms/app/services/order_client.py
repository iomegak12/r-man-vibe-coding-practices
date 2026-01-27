"""
Order Service Client
HTTP client for communicating with the Order Management Service (ORMS)
"""
import httpx
from typing import Dict, Optional, List
from app.config.settings import settings
from app.utils.logger import info, error, warning


class OrderServiceClient:
    """Client for Order Management Service"""
    
    def __init__(self):
        self.base_url = settings.ORDER_SERVICE_URL
        self.timeout = settings.SERVICE_TIMEOUT
        self.api_key = settings.SERVICE_API_KEY
    
    async def get_customer_orders(
        self,
        customer_id: str,
        page: int = 1,
        limit: int = 10,
        status: Optional[str] = None
    ) -> Dict:
        """
        Get orders for a specific customer
        
        Args:
            customer_id: Customer ID
            page: Page number
            limit: Items per page
            status: Optional order status filter
        
        Returns:
            Dict containing orders and pagination info
        
        Raises:
            Exception if service call fails
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Build query parameters
                params = {
                    "customerId": customer_id,
                    "page": page,
                    "limit": limit
                }
                
                if status:
                    params["status"] = status
                
                # Make request to ORMS
                response = await client.get(
                    f"{self.base_url}/api/internal/customers/{customer_id}/orders",
                    params={"limit": limit, "status": status} if status else {"limit": limit},
                    headers={"x-api-key": self.api_key}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    info(f"Successfully fetched orders for customer {customer_id}")
                    return data.get("data", {})
                elif response.status_code == 404:
                    # No orders found - not an error
                    info(f"No orders found for customer {customer_id}")
                    return {
                        "orders": [],
                        "pagination": {
                            "currentPage": page,
                            "totalPages": 0,
                            "totalItems": 0,
                            "itemsPerPage": limit
                        }
                    }
                else:
                    error(f"Order Service returned status {response.status_code}: {response.text}")
                    raise Exception(f"Order Service error: {response.status_code}")
        
        except httpx.TimeoutException:
            error(f"Timeout calling Order Service for customer {customer_id}")
            raise Exception("Order Service timeout")
        except httpx.ConnectError:
            error(f"Cannot connect to Order Service at {self.base_url}")
            raise Exception("Order Service unavailable")
        except Exception as e:
            error(f"Error calling Order Service: {str(e)}")
            raise
    
    async def get_order_statistics(self, customer_id: str) -> Dict:
        """
        Get order statistics for a customer
        
        Args:
            customer_id: Customer ID
        
        Returns:
            Dict containing order statistics
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/orders/internal/customer-stats/{customer_id}",
                    headers={"X-Service-API-Key": self.api_key}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("data", {})
                elif response.status_code == 404:
                    return {
                        "totalOrders": 0,
                        "totalOrderValue": 0.0,
                        "lastOrderDate": None
                    }
                else:
                    error(f"Order Service stats returned status {response.status_code}")
                    return {
                        "totalOrders": 0,
                        "totalOrderValue": 0.0,
                        "lastOrderDate": None
                    }
        
        except Exception as e:
            error(f"Error fetching order statistics: {str(e)}")
            return {
                "totalOrders": 0,
                "totalOrderValue": 0.0,
                "lastOrderDate": None
            }
    
    async def check_service_health(self) -> bool:
        """
        Check if Order Service is available
        
        Returns:
            bool: True if service is healthy
        """
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception:
            return False


# Create singleton instance
order_service_client = OrderServiceClient()
