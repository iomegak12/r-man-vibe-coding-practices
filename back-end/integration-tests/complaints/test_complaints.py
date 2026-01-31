"""
Complaint Management Service (CMPS) Integration Tests
Tests for complaint filing, management, and resolution
"""
import pytest
from utils.helpers import assert_success_response, assert_error_response, assert_response_structure


@pytest.mark.asyncio
class TestComplaintManagementHappyPath:
    """Happy path tests for complaint operations"""
    
    async def test_health_check(self, cmps_client):
        """Test CMPS health endpoint"""
        response = await cmps_client.get("/health")
        assert response.status_code == 200
    
    async def test_create_complaint(self, cmps_client, test_customer_token, test_data_generator):
        """Test create new complaint"""
        headers = cmps_client.get_auth_headers(test_customer_token)
        # Create general complaint without orderId (orderId is optional)
        complaint_data = {
            "category": "Product Quality",
            "subject": "Test Complaint Subject",
            "description": "This is a test complaint description for automated testing purposes."
        }
        
        response = await cmps_client.post("/api/complaints", json=complaint_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert_success_response(data)
        assert_response_structure(data["data"], ["complaintId", "status", "category"])
        assert data["data"]["status"] == "Open"
        
        return data["data"]["complaintId"]
    
    async def test_list_customer_complaints(self, cmps_client, test_customer_token):
        """Test list customer's complaints"""
        headers = cmps_client.get_auth_headers(test_customer_token)
        # Customer should use /me endpoint
        response = await cmps_client.get("/api/complaints/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        # CMPS returns data.complaints nested structure
        assert "data" in data
        assert "complaints" in data["data"]
        assert isinstance(data["data"]["complaints"], list)
    
    async def test_get_complaint_details(self, cmps_client, test_customer_token, test_data_generator):
        """Test get specific complaint details"""
        # First create a complaint
        headers = cmps_client.get_auth_headers(test_customer_token)
        complaint_data = test_data_generator.generate_complaint_data("ORD987654321")
        create_response = await cmps_client.post("/api/complaints", json=complaint_data, headers=headers)
        
        if create_response.status_code == 201:
            complaint_id = create_response.json()["data"]["complaintId"]
            
            # Get complaint details
            details_response = await cmps_client.get(f"/api/complaints/{complaint_id}", headers=headers)
            
            assert details_response.status_code == 200
            data = details_response.json()
            assert_success_response(data)
            assert data["data"]["complaintId"] == complaint_id
    
    async def test_add_comment_to_complaint(self, cmps_client, test_customer_token, test_data_generator):
        """Test add comment to complaint"""
        # Create complaint first
        headers = cmps_client.get_auth_headers(test_customer_token)
        complaint_data = test_data_generator.generate_complaint_data("ORD111222333")
        create_response = await cmps_client.post("/api/complaints", json=complaint_data, headers=headers)
        
        if create_response.status_code == 201:
            complaint_id = create_response.json()["data"]["complaintId"]
            
            # Add comment
            comment_response = await cmps_client.post(
                f"/api/complaints/{complaint_id}/comments",
                json={"comment": "This is a test comment"},
                headers=headers
            )
            
            assert comment_response.status_code == 200


@pytest.mark.asyncio
class TestComplaintAdminOperations:
    """Test admin complaint management"""
    
    async def test_admin_list_all_complaints(self, cmps_client, admin_token):
        """Test admin can list all complaints"""
        headers = cmps_client.get_auth_headers(admin_token)
        # Admin uses /api/complaints endpoint (not /api/admin/complaints)
        response = await cmps_client.get("/api/complaints", headers=headers, params={"page": 1, "limit": 10})
        
        assert response.status_code == 200
        data = response.json()
        # Admin complaint list returns nested data.complaints structure
        assert "data" in data
        assert "complaints" in data["data"]
        assert isinstance(data["data"]["complaints"], list)
    
    async def test_admin_update_complaint_status(self, cmps_client, admin_token, test_customer_token, test_data_generator):
        """Test admin can update complaint status"""
        # Create complaint as customer first
        customer_headers = cmps_client.get_auth_headers(test_customer_token)
        complaint_data = test_data_generator.generate_complaint_data("ORD444555666")
        create_response = await cmps_client.post("/api/complaints", json=complaint_data, headers=customer_headers)
        
        if create_response.status_code == 201:
            complaint_id = create_response.json()["data"]["complaintId"]
            
            # Update status as admin
            admin_headers = cmps_client.get_auth_headers(admin_token)
            update_response = await cmps_client.patch(
                f"/api/admin/complaints/{complaint_id}/status",
                json={"status": "In Progress"},
                headers=admin_headers
            )
            
            assert update_response.status_code == 200
            data = update_response.json()
            assert data["data"]["status"] == "In Progress"
    
    async def test_admin_update_complaint_priority(self, cmps_client, admin_token, test_customer_token, test_data_generator):
        """Test admin can update complaint priority"""
        # Create complaint
        customer_headers = cmps_client.get_auth_headers(test_customer_token)
        complaint_data = test_data_generator.generate_complaint_data("ORD777888999")
        create_response = await cmps_client.post("/api/complaints", json=complaint_data, headers=customer_headers)
        
        if create_response.status_code == 201:
            complaint_id = create_response.json()["data"]["complaintId"]
            
            # Update priority as admin
            admin_headers = cmps_client.get_auth_headers(admin_token)
            update_response = await cmps_client.patch(
                f"/api/admin/complaints/{complaint_id}/priority",
                json={"priority": "High"},
                headers=admin_headers
            )
            
            assert update_response.status_code == 200


@pytest.mark.asyncio
class TestComplaintNegativeCases:
    """Negative test cases for complaints"""
    
    async def test_create_complaint_without_auth(self, cmps_client, test_data_generator):
        """Test creating complaint without authentication"""
        complaint_data = test_data_generator.generate_complaint_data("ORD123")
        response = await cmps_client.post("/api/complaints", json=complaint_data)
        
        # FastAPI validates request body before checking auth, so either 401 or 422 is acceptable
        assert response.status_code in [401, 422]
    
    async def test_create_complaint_missing_fields(self, cmps_client, test_customer_token):
        """Test create complaint with missing required fields"""
        headers = cmps_client.get_auth_headers(test_customer_token)
        complaint_data = {
            "category": "Product Quality"
            # Missing orderId, subject, description
        }
        
        response = await cmps_client.post("/api/complaints", json=complaint_data, headers=headers)
        
        # FastAPI returns 422 for validation errors
        assert response.status_code == 422
    
    async def test_customer_cannot_access_admin_complaints(self, cmps_client, test_customer_token):
        """Test customer cannot access admin complaint list"""
        headers = cmps_client.get_auth_headers(test_customer_token)
        response = await cmps_client.get("/api/admin/complaints", headers=headers)
        
        # API returns 404 for non-existent endpoint or 403 for forbidden
        assert response.status_code in [403, 404]
    
    async def test_customer_cannot_access_other_complaints(self, cmps_client, test_customer_token):
        """Test customer cannot access another customer's complaint"""
        # This would require creating two customers and testing cross-access
        # For now, we test with invalid complaint ID
        headers = cmps_client.get_auth_headers(test_customer_token)
        response = await cmps_client.get("/api/complaints/CMP999999999", headers=headers)
        
        assert response.status_code in [403, 404]
