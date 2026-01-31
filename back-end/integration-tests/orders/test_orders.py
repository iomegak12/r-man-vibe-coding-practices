"""
Order Management Service (ORMS) Integration Tests
Tests for order creation, management, cancellation, and returns
"""
import pytest
from utils.helpers import assert_success_response, assert_error_response, assert_response_structure


@pytest.mark.asyncio
class TestOrderManagementHappyPath:
    """Happy path tests for order operations"""
    
    async def test_health_check(self, orms_client):
        """Test ORMS health endpoint"""
        response = await orms_client.get("/health")
        assert response.status_code == 200
    
    async def test_create_order(self, orms_client, test_customer_token, test_data_generator):
        """Test create new order"""
        headers = orms_client.get_auth_headers(test_customer_token)
        order_data = {
            "items": test_data_generator.generate_order_items(2),
            "deliveryAddress": test_data_generator.generate_shipping_address(),
            "paymentMethod": "Credit Card"
        }
        
        response = await orms_client.post("/api/orders", json=order_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert_success_response(data)
        # ORMS returns 'status' field not 'orderStatus'
        assert_response_structure(data["data"], ["orderId", "status", "totalAmount"])
        assert data["data"]["status"] == "Placed"
        
        return data["data"]["orderId"]
    
    async def test_list_customer_orders(self, orms_client, test_customer_token):
        """Test list customer's orders"""
        headers = orms_client.get_auth_headers(test_customer_token)
        # Customer orders are at /me endpoint
        response = await orms_client.get("/api/orders/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert isinstance(data["items"], list)
    
    async def test_get_order_details(self, orms_client, test_customer_token, test_data_generator):
        """Test get specific order details"""
        # First create an order
        headers = orms_client.get_auth_headers(test_customer_token)
        order_data = {
            "items": test_data_generator.generate_order_items(1),
            "deliveryAddress": test_data_generator.generate_shipping_address(),
            "paymentMethod": "Debit Card"
        }
        create_response = await orms_client.post("/api/orders", json=order_data, headers=headers)
        
        if create_response.status_code == 201:
            order_id = create_response.json()["data"]["orderId"]
            
            # Get order details
            details_response = await orms_client.get(f"/api/orders/{order_id}", headers=headers)
            
            assert details_response.status_code == 200
            data = details_response.json()
            assert_success_response(data)
            assert data["data"]["orderId"] == order_id


@pytest.mark.asyncio
class TestOrderCancellation:
    """Test order cancellation workflow"""
    
    async def test_cancel_order(self, orms_client, test_customer_token, test_data_generator):
        """Test cancel order (when status allows)"""
        # Create order first
        headers = orms_client.get_auth_headers(test_customer_token)
        order_data = {
            "items": test_data_generator.generate_order_items(1),
            "deliveryAddress": test_data_generator.generate_shipping_address(),
            "paymentMethod": "Cash on Delivery"
        }
        create_response = await orms_client.post("/api/orders", json=order_data, headers=headers)
        
        if create_response.status_code == 201:
            order_id = create_response.json()["data"]["orderId"]
            
            # Cancel the order - use POST method
            cancel_response = await orms_client.post(
                f"/api/orders/{order_id}/cancel",
                json={"reason": "Changed my mind"},
                headers=headers
            )
            
            assert cancel_response.status_code == 200
            data = cancel_response.json()
            assert_success_response(data)
            # Field name is 'status' not 'orderStatus'
            assert data["data"]["status"] == "Cancelled"


@pytest.mark.asyncio
class TestOrderAdminOperations:
    """Test admin order management"""
    
    async def test_admin_list_all_orders(self, orms_client, admin_token):
        """Test admin can list all orders"""
        headers = orms_client.get_auth_headers(admin_token)
        response = await orms_client.get("/api/admin/orders", headers=headers, params={"page": 1, "limit": 10})
        
        assert response.status_code == 200
        data = response.json()
        # ORMS returns items array for list endpoints, not data
        assert "items" in data
        assert "pagination" in data
        assert isinstance(data["items"], list)
    
    async def test_admin_update_order_status(self, orms_client, admin_token, test_customer_token, test_data_generator):
        """Test admin can update order status"""
        # Create order as customer first
        customer_headers = orms_client.get_auth_headers(test_customer_token)
        order_data = {
            "items": test_data_generator.generate_order_items(1),
            "deliveryAddress": test_data_generator.generate_shipping_address(),
            "paymentMethod": "UPI"
        }
        create_response = await orms_client.post("/api/orders", json=order_data, headers=customer_headers)
        
        if create_response.status_code == 201:
            order_id = create_response.json()["data"]["orderId"]
            
            # Update status as admin
            admin_headers = orms_client.get_auth_headers(admin_token)
            update_response = await orms_client.patch(
                f"/api/admin/orders/{order_id}/status",
                json={"status": "Processing"},
                headers=admin_headers
            )
            
            assert update_response.status_code == 200


@pytest.mark.asyncio
class TestOrderNegativeCases:
    """Negative test cases for orders"""
    
    async def test_create_order_without_auth(self, orms_client, test_data_generator):
        """Test creating order without authentication"""
        order_data = {
            "items": test_data_generator.generate_order_items(1),
            "deliveryAddress": test_data_generator.generate_shipping_address(),
            "paymentMethod": "Credit Card"
        }
        response = await orms_client.post("/api/orders", json=order_data)
        
        assert response.status_code == 401
    
    async def test_create_order_invalid_items(self, orms_client, test_customer_token):
        """Test create order with invalid items"""
        headers = orms_client.get_auth_headers(test_customer_token)
        order_data = {
            "items": [],  # Empty items
            "deliveryAddress": {"city": "Mumbai"},
            "paymentMethod": "Credit Card"
        }
        
        response = await orms_client.post("/api/orders", json=order_data, headers=headers)
        
        # FastAPI returns 422 for validation errors
        assert response.status_code == 422
    
    async def test_customer_cannot_access_admin_orders(self, orms_client, test_customer_token):
        """Test customer cannot access admin order list"""
        headers = orms_client.get_auth_headers(test_customer_token)
        response = await orms_client.get("/api/admin/orders", headers=headers)
        
        assert response.status_code == 403
    
    async def test_get_nonexistent_order(self, orms_client, test_customer_token):
        """Test get order that doesn't exist"""
        headers = orms_client.get_auth_headers(test_customer_token)
        response = await orms_client.get("/api/orders/ORD999999999", headers=headers)
        
        assert response.status_code == 404
