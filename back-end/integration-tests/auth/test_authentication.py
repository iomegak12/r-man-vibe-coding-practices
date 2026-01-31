"""
Authentication Service (ATHS) Integration Tests
Tests for user registration, login, profile management, and admin operations
"""
import pytest
from utils.helpers import assert_success_response, assert_error_response, assert_response_structure


@pytest.mark.asyncio
class TestAuthenticationHappyPath:
    """Happy path tests for authentication flow"""
    
    async def test_health_check(self, aths_client):
        """Test ATHS health endpoint"""
        response = await aths_client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    async def test_user_registration(self, aths_client, test_data_generator):
        """Test successful user registration"""
        user_data = test_data_generator.generate_user_data()
        response = await aths_client.post("/api/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert_success_response(data)
        # ATHS returns data.user object with _id, not userId
        assert "user" in data["data"]
        user = data["data"]["user"]
        assert_response_structure(user, ["_id", "email", "fullName", "role"])
        assert user["email"] == user_data["email"]
    
    async def test_user_login(self, aths_client, test_customer_user):
        """Test successful user login"""
        response = await aths_client.post("/api/auth/login", json={
            "email": test_customer_user["email"],
            "password": test_customer_user["password"]
        })
        
        assert response.status_code == 200
        data = response.json()
        assert_success_response(data)
        # ATHS returns accessToken directly in data, not nested in token object
        assert_response_structure(data["data"], ["accessToken", "user"])
        assert "accessToken" in data["data"]
    
    async def test_get_profile(self, aths_client, test_customer_token):
        """Test get user profile"""
        headers = aths_client.get_auth_headers(test_customer_token)
        response = await aths_client.get("/api/user/profile", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert_success_response(data)
        # Profile endpoint returns data.user object
        assert "user" in data["data"]
        user = data["data"]["user"]
        assert_response_structure(user, ["_id", "email", "fullName"])
    
    async def test_update_profile(self, aths_client, test_customer_token, test_data_generator):
        """Test update user profile"""
        headers = aths_client.get_auth_headers(test_customer_token)
        update_data = {
            "fullName": test_data_generator.generate_full_name(),
            "contactNumber": test_data_generator.generate_phone()
        }
        
        response = await aths_client.put("/api/user/profile", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert_success_response(data)
        # Check if response has the updated data
        assert "data" in data


@pytest.mark.asyncio
class TestAuthenticationNegativeCases:
    """Negative test cases for authentication"""
    
    async def test_registration_duplicate_email(self, aths_client, test_customer_user):
        """Test registration with duplicate email"""
        response = await aths_client.post("/api/auth/register", json={
            "email": test_customer_user["email"],
            "password": "NewPassword@123",
            "fullName": "Duplicate User",
            "contactNumber": "+919876543210",
            "role": "Customer"
        })
        
        # ATHS returns 409 Conflict for duplicate email
        assert response.status_code == 409
        data = response.json()
        assert_error_response(data)
    
    async def test_login_invalid_credentials(self, aths_client):
        """Test login with invalid credentials"""
        response = await aths_client.post("/api/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "WrongPassword@123"
        })
        
        assert response.status_code in [400, 401]
        data = response.json()
        assert_error_response(data)
    
    async def test_profile_without_token(self, aths_client):
        """Test accessing profile without authentication"""
        response = await aths_client.get("/api/user/profile")
        
        assert response.status_code == 401
    
    async def test_registration_invalid_email(self, aths_client):
        """Test registration with invalid email format"""
        response = await aths_client.post("/api/auth/register", json={
            "email": "invalid-email",
            "password": "Test@12345",
            "fullName": "Test User",
            "contactNumber": "+919876543210",
            "role": "Customer"
        })
        
        assert response.status_code == 400
    
    async def test_registration_weak_password(self, aths_client, test_data_generator):
        """Test registration with weak password"""
        user_data = test_data_generator.generate_user_data()
        user_data["password"] = "weak"
        
        response = await aths_client.post("/api/auth/register", json=user_data)
        
        assert response.status_code == 400


@pytest.mark.asyncio
class TestAuthenticationAdminOperations:
    """Test admin operations"""
    
    async def test_admin_list_users(self, aths_client, admin_token):
        """Test admin can list all users"""
        headers = aths_client.get_auth_headers(admin_token)
        response = await aths_client.get("/api/admin/users", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert_success_response(data)
        assert "users" in data["data"]
        assert isinstance(data["data"]["users"], list)
    
    async def test_admin_get_stats(self, aths_client, admin_token):
        """Test admin can get statistics"""
        headers = aths_client.get_auth_headers(admin_token)
        response = await aths_client.get("/api/admin/stats", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert_success_response(data)
        assert_response_structure(data["data"], ["totalUsers", "activeUsers"])
    
    async def test_customer_cannot_access_admin(self, aths_client, test_customer_token):
        """Test customer cannot access admin endpoints"""
        headers = aths_client.get_auth_headers(test_customer_token)
        response = await aths_client.get("/api/admin/users", headers=headers)
        
        assert response.status_code == 403
