"""
Customer Service Client
Handles communication with the Customer Relationship Management Service (CRMS)
"""
import httpx
from typing import Optional, Dict
from datetime import datetime
from app.config.settings import settings
from app.utils.logger import info, error


class CustomerServiceClient:
    """
    Client for interacting with Customer Relationship Management Service
    """
    
    def __init__(self):
        self.base_url = settings.CUSTOMER_SERVICE_URL
        self.service_api_key = settings.SERVICE_API_KEY
        self.timeout = 10.0  # 10 seconds timeout
    
    async def get_customer_by_user_id(self, user_id: str) -> Optional[Dict]:
        """
        Get customer information by user ID from CRMS
        
        Args:
            user_id: User ID to retrieve customer for
            
        Returns:
            Customer information if found, None otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/customers/internal/user/{user_id}",
                    headers={
                        "x-api-key": self.service_api_key
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        customer = data.get("data")
                        info(f"Retrieved customer information for user: {user_id}, customer ID: {customer.get('customerId')}")
                        return customer
                    else:
                        error(f"Failed to get customer: {data.get('message')}")
                        return None
                elif response.status_code == 404:
                    error(f"Customer not found for user: {user_id}")
                    return None
                else:
                    error(f"Customer service returned status {response.status_code}")
                    return None
                    
        except httpx.TimeoutException:
            error(f"Timeout while getting customer from CRMS")
            return None
        except httpx.RequestError as e:
            error(f"Error connecting to customer service: {str(e)}")
            return None
        except Exception as e:
            error(f"Unexpected error getting customer: {str(e)}")
            return None
    
    async def get_customer_by_id(self, customer_id: str) -> Optional[Dict]:
        """
        Get customer information by customer ID from CRMS
        
        Args:
            customer_id: Customer ID to retrieve
            
        Returns:
            Customer information if found, None otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/customers/internal/{customer_id}",
                    headers={
                        "x-api-key": self.service_api_key
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        customer = data.get("data")
                        info(f"Retrieved customer information for customer ID: {customer_id}")
                        return customer
                    else:
                        error(f"Failed to get customer: {data.get('message')}")
                        return None
                elif response.status_code == 404:
                    error(f"Customer not found: {customer_id}")
                    return None
                else:
                    error(f"Customer service returned status {response.status_code}")
                    return None
                    
        except httpx.TimeoutException:
            error(f"Timeout while getting customer from CRMS")
            return None
        except httpx.RequestError as e:
            error(f"Error connecting to customer service: {str(e)}")
            return None
        except Exception as e:
            error(f"Unexpected error getting customer: {str(e)}")
            return None
    
    async def update_order_statistics(
        self, 
        customer: Dict,
        order_value: float,
        increment_order_count: bool = True,
        decrement_order_count: bool = False
    ) -> bool:
        """
        Update customer order statistics in CRMS
        
        Args:
            customer: Customer object with customerId and current statistics
            order_value: Order value to add to total spending (can be negative for cancellations)
            increment_order_count: Whether to increment order count (default: True)
            decrement_order_count: Whether to decrement order count (for cancellations)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            customer_id = customer.get("customerId")
            
            # Calculate new values
            count_change = 0
            if increment_order_count:
                count_change = 1
            elif decrement_order_count:
                count_change = -1
                
            new_total_orders = max(0, customer["totalOrders"] + count_change)
            new_total_value = max(0.0, customer["totalOrderValue"] + order_value)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.patch(
                    f"{self.base_url}/api/customers/internal/{customer_id}/statistics",
                    headers={
                        "x-api-key": self.service_api_key
                    },
                    json={
                        "totalOrders": new_total_orders,
                        "totalOrderValue": new_total_value,
                        "lastOrderDate": datetime.utcnow().isoformat()
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        info(f"Updated order statistics for customer: {customer_id}, order value: {order_value}")
                        return True
                    else:
                        error(f"Failed to update order statistics: {data.get('message')}")
                        return False
                else:
                    error(f"Customer service returned status {response.status_code}")
                    return False
                    
        except httpx.TimeoutException:
            error(f"Timeout while updating order statistics in CRMS")
            return False
        except httpx.RequestError as e:
            error(f"Error connecting to customer service: {str(e)}")
            return False
        except Exception as e:
            error(f"Unexpected error updating order statistics: {str(e)}")
            return False
    
    async def decrement_order_statistics(
        self, 
        customer_id: str, 
        order_value: float
    ) -> bool:
        """
        Decrement customer order statistics in CRMS (for cancelled orders)
        
        Args:
            customer_id: Customer ID to update
            order_value: Order value to subtract from total spending
            
        Returns:
            True if successful, False otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/internal/customers/{customer_id}/order-statistics/decrement",
                    headers={
                        "x-api-key": self.service_api_key
                    },
                    json={
                        "orderValue": order_value
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        info(f"Decremented order statistics for customer: {customer_id}, order value: {order_value}")
                        return True
                    else:
                        error(f"Failed to decrement order statistics: {data.get('message')}")
                        return False
                else:
                    error(f"Customer service returned status {response.status_code}")
                    return False
                    
        except httpx.TimeoutException:
            error(f"Timeout while decrementing order statistics in CRMS")
            return False
        except httpx.RequestError as e:
            error(f"Error connecting to customer service: {str(e)}")
            return False
        except Exception as e:
            error(f"Unexpected error decrementing order statistics: {str(e)}")
            return False


# Singleton instance
_customer_service_client = None


def get_customer_service_client() -> CustomerServiceClient:
    """
    Get the singleton CustomerServiceClient instance
    """
    global _customer_service_client
    if _customer_service_client is None:
        _customer_service_client = CustomerServiceClient()
    return _customer_service_client
