"""
Base Test Client
Provides HTTP client functionality for all tests
"""
import httpx
import asyncio
from typing import Dict, Optional, Any
from datetime import datetime


class BaseTestClient:
    """Base HTTP client for integration tests"""
    
    def __init__(self, base_url: str, timeout: int = 30):
        self.base_url = base_url
        self.timeout = timeout
        self.client = httpx.AsyncClient(timeout=timeout)
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
    
    async def get(
        self,
        endpoint: str,
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> httpx.Response:
        """GET request"""
        url = f"{self.base_url}{endpoint}"
        return await self.client.get(url, headers=headers, params=params)
    
    async def post(
        self,
        endpoint: str,
        json: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> httpx.Response:
        """POST request"""
        url = f"{self.base_url}{endpoint}"
        return await self.client.post(url, json=json, headers=headers)
    
    async def put(
        self,
        endpoint: str,
        json: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> httpx.Response:
        """PUT request"""
        url = f"{self.base_url}{endpoint}"
        return await self.client.put(url, json=json, headers=headers)
    
    async def patch(
        self,
        endpoint: str,
        json: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> httpx.Response:
        """PATCH request"""
        url = f"{self.base_url}{endpoint}"
        return await self.client.patch(url, json=json, headers=headers)
    
    async def delete(
        self,
        endpoint: str,
        headers: Optional[Dict[str, str]] = None
    ) -> httpx.Response:
        """DELETE request"""
        url = f"{self.base_url}{endpoint}"
        return await self.client.delete(url, headers=headers)
    
    def get_auth_headers(self, token: str) -> Dict[str, str]:
        """Get authorization headers with JWT token"""
        return {"Authorization": f"Bearer {token}"}
    
    def get_service_headers(self, api_key: str) -> Dict[str, str]:
        """Get service API key headers"""
        return {"x-api-key": api_key}
