"""
Test Helpers and Utilities
Common helper functions for tests
"""
import asyncio
from typing import Dict, Optional
from utils.client import BaseTestClient


async def check_service_health(client: BaseTestClient) -> bool:
    """Check if service is healthy"""
    try:
        response = await client.get("/health")
        return response.status_code == 200
    except Exception:
        return False


async def login_user(client: BaseTestClient, email: str, password: str) -> Optional[str]:
    """Login user and return JWT token"""
    try:
        response = await client.post(
            "/api/auth/login",
            json={"email": email, "password": password}
        )
        if response.status_code == 200:
            data = response.json()
            # ATHS returns data.accessToken directly, not data.token.accessToken
            return data.get("data", {}).get("accessToken")
        return None
    except Exception:
        return None


async def register_user(client: BaseTestClient, user_data: Dict) -> Optional[Dict]:
    """Register new user and return user object with email"""
    try:
        response = await client.post("/api/auth/register", json=user_data)
        if response.status_code == 201:
            data = response.json().get("data", {})
            # ATHS returns data.user object with _id field
            user = data.get("user", {})
            # Add email if not present (for backward compatibility)
            if "email" not in user and "email" in user_data:
                user["email"] = user_data["email"]
            return user
        return None
    except Exception:
        return None


def assert_response_structure(response_data: Dict, required_fields: list):
    """Assert response has required fields"""
    for field in required_fields:
        assert field in response_data, f"Missing required field: {field}"


def assert_success_response(response_data: Dict):
    """Assert response is successful"""
    assert "success" in response_data
    assert response_data["success"] is True
    assert "message" in response_data


def assert_error_response(response_data: Dict):
    """Assert response is an error"""
    assert "success" in response_data
    assert response_data["success"] is False
    assert "message" in response_data or "detail" in response_data
