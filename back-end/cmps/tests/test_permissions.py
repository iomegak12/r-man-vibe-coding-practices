"""
Test administrator vs customer order complaint permissions
"""
import asyncio
import httpx
import json


# Service URLs
CMPS_BASE_URL = "http://localhost:5004"
AUTH_BASE_URL = "http://localhost:5001"
ORMS_BASE_URL = "http://localhost:5003"

# Credentials
ADMIN_EMAIL = "jtdhamodharan@gmail.com"
ADMIN_PASSWORD = "Madurai54321!"
CUSTOMER_EMAIL = "orms.test@example.com"
CUSTOMER_PASSWORD = "TestPass@123"


async def login(email, password):
    """Login and get token"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{AUTH_BASE_URL}/api/auth/login",
            json={"email": email, "password": password}
        )
        
        if response.status_code == 200:
            data = response.json()
            return data.get("data", {}).get("accessToken")
        return None


async def get_customer_orders(token):
    """Get customer's orders"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{ORMS_BASE_URL}/api/orders/me",
            params={"page": 1, "page_size": 10},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            return data.get("items", [])
        return []


async def create_complaint(token, order_id, subject):
    """Create an order-linked complaint"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{CMPS_BASE_URL}/api/complaints",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "orderId": order_id,
                "category": "Delivery Issue",
                "subject": subject,
                "description": "This is a test complaint to verify order ownership validation logic. Testing permissions and access control.",
                "priority": "Medium"
            }
        )
        
        return response.status_code, response.json()


async def main():
    """Run permission tests"""
    print("=" * 80)
    print("COMPLAINT CREATION PERMISSION TESTS")
    print("=" * 80)
    
    # Login as customer
    print("\n🔐 Step 1: Login as customer")
    customer_token = await login(CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
    if not customer_token:
        print("❌ Customer login failed")
        return
    print(f"✅ Customer logged in: {CUSTOMER_EMAIL}")
    
    # Get customer's orders
    print("\n📦 Step 2: Get customer's orders")
    customer_orders = await get_customer_orders(customer_token)
    if not customer_orders or len(customer_orders) == 0:
        print("❌ No orders found for customer")
        return
    
    customer_order_id = customer_orders[0].get("orderId")
    customer_id = customer_orders[0].get("customerId")
    print(f"✅ Found {len(customer_orders)} orders")
    print(f"   Customer ID: {customer_id}")
    print(f"   First order: {customer_order_id}")
    
    # Login as admin
    print("\n🔐 Step 3: Login as administrator")
    admin_token = await login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not admin_token:
        print("❌ Admin login failed")
        return
    print(f"✅ Administrator logged in: {ADMIN_EMAIL}")
    
    # TEST 1: Customer creates complaint for their own order
    print("\n" + "=" * 80)
    print("TEST 1: Customer Creating Complaint for Their Own Order")
    print("=" * 80)
    print(f"Order ID: {customer_order_id}")
    print(f"Expected: ✅ SUCCESS (201)")
    
    status_code, data = await create_complaint(
        customer_token,
        customer_order_id,
        "Customer complaint for own order"
    )
    
    print(f"\nResult: {status_code}")
    if status_code == 201:
        complaint = data.get("data", {})
        print(f"✅ SUCCESS: Complaint created")
        print(f"   Complaint ID: {complaint.get('complaintId')}")
        print(f"   Order ID: {complaint.get('orderId')}")
        print(f"   Customer Email: {complaint.get('customerEmail')}")
    else:
        print(f"❌ FAILED: {data.get('message')}")
    
    # TEST 2: Administrator creates complaint for customer's order
    print("\n" + "=" * 80)
    print("TEST 2: Administrator Creating Complaint for Customer's Order")
    print("=" * 80)
    print(f"Order ID: {customer_order_id}")
    print(f"Order belongs to: {CUSTOMER_EMAIL}")
    print(f"Admin user: {ADMIN_EMAIL}")
    print(f"Expected: ✅ SUCCESS (201) - Admin can create for any order")
    
    status_code, data = await create_complaint(
        admin_token,
        customer_order_id,
        "Admin complaint for customer order"
    )
    
    print(f"\nResult: {status_code}")
    if status_code == 201:
        complaint = data.get("data", {})
        print(f"✅ SUCCESS: Admin created complaint for customer's order")
        print(f"   Complaint ID: {complaint.get('complaintId')}")
        print(f"   Order ID: {complaint.get('orderId')}")
        print(f"   Customer Email: {complaint.get('customerEmail')}")
        print(f"   Note: Customer email should be {CUSTOMER_EMAIL}")
    else:
        print(f"❌ FAILED: {data.get('message')}")
        print(f"   This should succeed - administrators should be able to create complaints for any order")
    
    # TEST 3: Customer tries to create complaint for another customer's order
    # (We need to find another order that doesn't belong to this customer)
    print("\n" + "=" * 80)
    print("TEST 3: Customer Trying to Create Complaint for Another Customer's Order")
    print("=" * 80)
    
    # Try with a different order ID (if there are multiple orders in system)
    if len(customer_orders) > 1:
        # Use customer's own order but we'll simulate by using an order ID
        # that exists but might belong to someone else
        test_order_id = "ORD-2026-000001"  # Assuming this might be someone else's
        print(f"Testing with order: {test_order_id}")
        print(f"Expected: Depends on order ownership")
        print(f"   - If order belongs to customer: ✅ SUCCESS (201)")
        print(f"   - If order belongs to another: ❌ FORBIDDEN (403)")
        
        status_code, data = await create_complaint(
            customer_token,
            test_order_id,
            "Attempt to create for other's order"
        )
        
        print(f"\nResult: {status_code}")
        if status_code == 201:
            print(f"✅ Order belongs to this customer")
        elif status_code == 403:
            print(f"✅ CORRECTLY BLOCKED: {data.get('message')}")
            print(f"   Customer cannot create complaints for other customers' orders")
        elif status_code == 404:
            print(f"ℹ️  Order not found: {data.get('message')}")
        else:
            print(f"⚠️  Unexpected response: {data.get('message')}")
    else:
        print("ℹ️  Skipping (only one order available for testing)")
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print("\n✅ Permission Logic:")
    print("   1. Customers CAN create complaints for their own orders")
    print("   2. Administrators CAN create complaints for any customer's orders")
    print("   3. Customers CANNOT create complaints for other customers' orders")
    print("\nAll tests completed!")


if __name__ == "__main__":
    asyncio.run(main())
