"""
Customer Management Service (CRMS) Integration Tests
Tests for customer profiles, admin management, and service integrations
"""
import pytest
from utils.helpers import assert_success_response, assert_error_response, assert_response_structure


@pytest.mark.asyncio
class TestCustomerProfileHappyPath:
    """Happy path tests for customer profile operations"""
    
    async def test_health_check(self, crms_client):
        """Test CRMS health endpoint"""
        response = await crms_client.get("/health")
        assert response.status_code == 200
    
    async def test_get_customer_profile(self, crms_client, test_customer_token):
        """Test get own customer profile"""
        headers = crms_client.get_auth_headers(test_customer_token)
        response = await crms_client.get("/api/customers/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert_success_response(data)
        assert_response_structure(data["data"], ["customerId", "userId", "email", "customerStatus"])
    
    async def test_get_customer_statistics(self, crms_client, test_customer_token):
        """Test get customer statistics"""
        headers = crms_client.get_auth_headers(test_customer_token)
        response = await crms_client.get("/api/customers/me/statistics", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert_success_response(data)
        assert_response_structure(data["data"], ["totalOrders", "totalComplaints"])


@pytest.mark.asyncio
class TestCustomerAdminOperations:
    """Test admin customer management operations"""
    
    async def test_admin_list_customers(self, crms_client, admin_token):
        """Test admin can list all customers"""
        headers = crms_client.get_auth_headers(admin_token)
        response = await crms_client.get("/api/customers", headers=headers, params={"page": 1, "limit": 10})
        
        assert response.status_code == 200
        data = response.json()
        # CRMS returns items array for list endpoints, not data
        assert "items" in data
        assert "pagination" in data
        assert isinstance(data["items"], list)
    
    async def test_admin_search_customers(self, crms_client, admin_token):
        """Test admin can search customers"""
        headers = crms_client.get_auth_headers(admin_token)
        # CRMS search uses 'q' parameter, not 'query'
        response = await crms_client.get("/api/customers/search", headers=headers, params={"q": "test", "limit": 5})
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "pagination" in data
    
    async def test_admin_get_analytics(self, crms_client, admin_token):
        """Test admin can get customer analytics"""
        headers = crms_client.get_auth_headers(admin_token)
        response = await crms_client.get("/api/customers/analytics", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert_success_response(data)
        assert_response_structure(data["data"], ["totalCustomers", "customersByStatus", "customersByType"])
    
    async def test_admin_add_customer_notes(self, crms_client, admin_token, test_customer_user):
        """Test admin can add notes to customer"""
        # First get the customer ID
        headers = crms_client.get_auth_headers(admin_token)
        search_response = await crms_client.get(
            "/api/customers/search",
            headers=headers,
            params={"query": test_customer_user["email"], "limit": 1}
        )
        
        if search_response.status_code == 200:
            search_data = search_response.json()
            if search_data["data"]["results"]:
                customer_id = search_data["data"]["results"][0]["customerId"]
                
                # Add note
                note_response = await crms_client.post(
                    f"/api/customers/{customer_id}/notes",
                    json={"notes": "Test note from integration test"},
                    headers=headers
                )
                
                assert note_response.status_code == 200


@pytest.mark.asyncio
class TestCustomerNegativeCases:
    """Negative test cases for customer operations"""
    
    async def test_profile_without_auth(self, crms_client):
        """Test accessing profile without authentication"""
        response = await crms_client.get("/api/customers/me")
        assert response.status_code == 401
    
    async def test_customer_cannot_list_all(self, crms_client, test_customer_token):
        """Test customer cannot access admin list endpoint"""
        headers = crms_client.get_auth_headers(test_customer_token)
        response = await crms_client.get("/api/customers", headers=headers)
        
        assert response.status_code == 403
    
    async def test_invalid_customer_id(self, crms_client, admin_token):
        """Test get customer with invalid ID"""
        headers = crms_client.get_auth_headers(admin_token)
        response = await crms_client.get("/api/customers/invalid-id", headers=headers)
        
        assert response.status_code == 400
