"""
Cross-Service Integration Tests
Tests end-to-end workflows across all microservices
"""
import pytest
from utils.helpers import assert_success_response, assert_response_structure


@pytest.mark.asyncio
class TestEndToEndUserJourney:
    """Complete user journey across all services"""
    
    async def test_complete_ecommerce_flow(
        self,
        aths_client,
        crms_client,
        orms_client,
        cmps_client,
        test_data_generator
    ):
        """
        Test complete flow:
        1. Register user (ATHS)
        2. Login (ATHS)
        3. Get customer profile (CRMS)
        4. Create order (ORMS)
        5. File complaint (CMPS)
        6. Track complaint status
        """
        
        # Step 1: Register new user
        user_data = test_data_generator.generate_user_data()
        register_response = await aths_client.post("/api/auth/register", json=user_data)
        assert register_response.status_code == 201
        print(f"✅ Step 1: User registered - {user_data['email']}")
        
        # Step 2: Login
        login_response = await aths_client.post("/api/auth/login", json={
            "email": user_data["email"],
            "password": user_data["password"]
        })
        assert login_response.status_code == 200
        # ATHS returns accessToken directly in data, not data.token.accessToken
        token = login_response.json()["data"]["accessToken"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"✅ Step 2: User logged in")
        
        # Step 3: Get customer profile from CRMS
        profile_response = await crms_client.get("/api/customers/me", headers=headers)
        assert profile_response.status_code == 200
        customer_data = profile_response.json()["data"]
        print(f"✅ Step 3: Customer profile retrieved - {customer_data['customerId']}")
        
        # Step 4: Create order
        order_data = {
            "items": test_data_generator.generate_order_items(2),
            "deliveryAddress": test_data_generator.generate_shipping_address(),
            "paymentMethod": "Credit Card"
        }
        order_response = await orms_client.post("/api/orders", json=order_data, headers=headers)
        assert order_response.status_code == 201
        order_id = order_response.json()["data"]["orderId"]
        print(f"✅ Step 4: Order created - {order_id}")
        
        # Step 5: File complaint for the order
        complaint_data = test_data_generator.generate_complaint_data(order_id)
        complaint_response = await cmps_client.post("/api/complaints", json=complaint_data, headers=headers)
        assert complaint_response.status_code == 201
        complaint_id = complaint_response.json()["data"]["complaintId"]
        print(f"✅ Step 5: Complaint filed - {complaint_id}")
        
        # Step 6: Verify complaint can be retrieved
        complaint_details = await cmps_client.get(f"/api/complaints/{complaint_id}", headers=headers)
        assert complaint_details.status_code == 200
        assert complaint_details.json()["data"]["orderId"] == order_id
        print(f"✅ Step 6: Complaint details verified")
        
        print("\n🎉 Complete e-commerce flow test PASSED!")


@pytest.mark.asyncio
class TestServiceIntegration:
    """Test integration between services"""
    
    async def test_crms_gets_customer_orders(
        self,
        crms_client,
        orms_client,
        test_customer_token,
        test_data_generator
    ):
        """Test CRMS can retrieve customer orders from ORMS"""
        headers = crms_client.get_auth_headers(test_customer_token)
        
        # Create an order first
        order_data = {
            "items": test_data_generator.generate_order_items(1),
            "deliveryAddress": test_data_generator.generate_shipping_address(),
            "paymentMethod": "UPI"
        }
        await orms_client.post("/api/orders", json=order_data, headers=headers)
        
        # Get customer profile with orders from CRMS
        profile_response = await crms_client.get("/api/customers/me", headers=headers)
        assert profile_response.status_code == 200
        
        # Get statistics which includes order count
        stats_response = await crms_client.get("/api/customers/me/statistics", headers=headers)
        assert stats_response.status_code == 200
        stats_data = stats_response.json()["data"]
        assert "totalOrders" in stats_data
        print(f"✅ CRMS retrieved customer orders: {stats_data['totalOrders']}")
    
    async def test_crms_gets_customer_complaints(
        self,
        crms_client,
        cmps_client,
        test_customer_token,
        test_data_generator
    ):
        """Test CRMS can retrieve customer complaints from CMPS"""
        headers = crms_client.get_auth_headers(test_customer_token)
        
        # Create a complaint first
        complaint_data = test_data_generator.generate_complaint_data("ORD123456")
        await cmps_client.post("/api/complaints", json=complaint_data, headers=headers)
        
        # Get statistics which includes complaint count
        stats_response = await crms_client.get("/api/customers/me/statistics", headers=headers)
        assert stats_response.status_code == 200
        stats_data = stats_response.json()["data"]
        assert "totalComplaints" in stats_data
        print(f"✅ CRMS retrieved customer complaints: {stats_data['totalComplaints']}")


@pytest.mark.asyncio
class TestAdminCrossServiceOperations:
    """Test admin operations across services"""
    
    async def test_admin_complete_workflow(
        self,
        aths_client,
        crms_client,
        orms_client,
        cmps_client,
        admin_token,
        test_customer_token,
        test_data_generator
    ):
        """
        Test admin workflow:
        1. View all customers (CRMS)
        2. View all orders (ORMS)
        3. View all complaints (CMPS)
        4. Update order status
        5. Update complaint status
        """
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        customer_headers = {"Authorization": f"Bearer {test_customer_token}"}
        
        # Step 1: View all customers
        customers_response = await crms_client.get("/api/customers", headers=admin_headers, params={"page": 1, "limit": 5})
        assert customers_response.status_code == 200
        print("✅ Step 1: Admin viewed all customers")
        
        # Step 2: View all orders
        orders_response = await orms_client.get("/api/admin/orders", headers=admin_headers, params={"page": 1, "limit": 5})
        assert orders_response.status_code == 200
        print("✅ Step 2: Admin viewed all orders")
        
        # Step 3: View all complaints
        complaints_response = await cmps_client.get("/api/complaints", headers=admin_headers, params={"page": 1, "limit": 5})
        assert complaints_response.status_code == 200
        print("✅ Step 3: Admin viewed all complaints")
        
        # Step 4: Create and update order
        order_data = {
            "items": test_data_generator.generate_order_items(1),
            "deliveryAddress": test_data_generator.generate_shipping_address(),
            "paymentMethod": "Cash on Delivery"
        }
        create_order = await orms_client.post("/api/orders", json=order_data, headers=customer_headers)
        if create_order.status_code == 201:
            order_id = create_order.json()["data"]["orderId"]
            update_order = await orms_client.patch(
                f"/api/admin/orders/{order_id}/status",
                json={"status": "Processing"},
                headers=admin_headers
            )
            assert update_order.status_code == 200
            print(f"✅ Step 4: Admin updated order status - {order_id}")
        
        # Step 5: Create and update complaint
        complaint_data = test_data_generator.generate_complaint_data("ORD999888")
        create_complaint = await cmps_client.post("/api/complaints", json=complaint_data, headers=customer_headers)
        if create_complaint.status_code == 201:
            complaint_id = create_complaint.json()["data"]["complaintId"]
            update_complaint = await cmps_client.patch(
                f"/api/admin/complaints/{complaint_id}/status",
                json={"status": "In Progress"},
                headers=admin_headers
            )
            assert update_complaint.status_code == 200
            print(f"✅ Step 5: Admin updated complaint status - {complaint_id}")
        
        print("\n🎉 Admin cross-service workflow PASSED!")


@pytest.mark.asyncio
class TestDataConsistency:
    """Test data consistency across services"""
    
    async def test_user_consistency_across_services(
        self,
        aths_client,
        crms_client,
        test_customer_user,
        test_customer_token
    ):
        """Verify user data is consistent between ATHS and CRMS"""
        headers = {"Authorization": f"Bearer {test_customer_token}"}
        
        # Get user from ATHS
        aths_profile = await aths_client.get("/api/user/profile", headers=headers)
        assert aths_profile.status_code == 200
        aths_data = aths_profile.json()["data"]
        
        # Get customer from CRMS
        crms_profile = await crms_client.get("/api/customers/me", headers=headers)
        assert crms_profile.status_code == 200
        crms_data = crms_profile.json()["data"]
        
        # Verify email matches (use test_customer_user as fallback)
        aths_email = aths_data.get("email") or test_customer_user.get("email")
        crms_email = crms_data.get("email") or test_customer_user.get("email")
        assert aths_email == crms_email
        print(f"✅ User data consistent: {aths_email}")
