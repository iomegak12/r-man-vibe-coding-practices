"""
Complaint Service Client
HTTP client for communicating with the Complaint Management Service (CMPS)
"""
import httpx
from typing import Dict, Optional, List
from app.config.settings import settings
from app.utils.logger import info, error, warning


class ComplaintServiceClient:
    """Client for Complaint Management Service"""
    
    def __init__(self):
        self.base_url = settings.COMPLAINT_SERVICE_URL
        self.timeout = settings.SERVICE_TIMEOUT
        self.api_key = settings.SERVICE_API_KEY
    
    async def get_customer_complaints(
        self,
        customer_id: str,
        page: int = 1,
        limit: int = 10,
        status: Optional[str] = None
    ) -> Dict:
        """
        Get complaints for a specific customer
        
        Args:
            customer_id: Customer ID
            page: Page number
            limit: Items per page
            status: Optional complaint status filter
        
        Returns:
            Dict containing complaints and pagination info
        
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
                
                # Make request to CMPS
                response = await client.get(
                    f"{self.base_url}/api/internal/customers/{customer_id}/complaints",
                    params={"limit": limit, "status": status} if status else {"limit": limit},
                    headers={"x-api-key": self.api_key}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    info(f"Successfully fetched complaints for customer {customer_id}")
                    return data.get("data", {})
                elif response.status_code == 404:
                    # No complaints found - not an error
                    info(f"No complaints found for customer {customer_id}")
                    return {
                        "complaints": [],
                        "pagination": {
                            "currentPage": page,
                            "totalPages": 0,
                            "totalItems": 0,
                            "itemsPerPage": limit
                        }
                    }
                else:
                    error(f"Complaint Service returned status {response.status_code}: {response.text}")
                    raise Exception(f"Complaint Service error: {response.status_code}")
        
        except httpx.TimeoutException:
            error(f"Timeout calling Complaint Service for customer {customer_id}")
            raise Exception("Complaint Service timeout")
        except httpx.ConnectError:
            error(f"Cannot connect to Complaint Service at {self.base_url}")
            raise Exception("Complaint Service unavailable")
        except Exception as e:
            error(f"Error calling Complaint Service: {str(e)}")
            raise
    
    async def get_complaint_statistics(self, customer_id: str) -> Dict:
        """
        Get complaint statistics for a customer
        
        Args:
            customer_id: Customer ID
        
        Returns:
            Dict containing complaint statistics
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/complaints/internal/customer-stats/{customer_id}",
                    headers={"X-Service-API-Key": self.api_key}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("data", {})
                elif response.status_code == 404:
                    return {
                        "totalComplaints": 0,
                        "openComplaints": 0,
                        "lastComplaintDate": None
                    }
                else:
                    error(f"Complaint Service stats returned status {response.status_code}")
                    return {
                        "totalComplaints": 0,
                        "openComplaints": 0,
                        "lastComplaintDate": None
                    }
        
        except Exception as e:
            error(f"Error fetching complaint statistics: {str(e)}")
            return {
                "totalComplaints": 0,
                "openComplaints": 0,
                "lastComplaintDate": None
            }
    
    async def check_service_health(self) -> bool:
        """
        Check if Complaint Service is available
        
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
complaint_service_client = ComplaintServiceClient()
