"""
Enhanced Phase 3 tests with real customer and order data
"""
import httpx
import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient


# Service URLs
CMPS_BASE_URL = "http://localhost:5004"
AUTH_BASE_URL = "http://localhost:5001"
ORMS_BASE_URL = "http://localhost:5003"

# Admin credentials
ADMIN_EMAIL = "jtdhamodharan@gmail.com"
ADMIN_PASSWORD = "Madurai54321!"

# Customer credentials
CUSTOMER_EMAIL = "orms.test@example.com"
CUSTOMER_PASSWORD = "TestPass@123"


async def get_real_order_id():
    """Get a real order ID from database"""
    client = AsyncIOMotorClient("mongodb://admin:password123@localhost:27017/?authSource=admin")
    order_db = client["r-man-orders-db"]
    
    order = await order_db.orders.find_one()
    client.close()
    
    if order:
        return order.get('orderId'), order.get('customerId'), order.get('userId')
    return None, None, None


async def login(email, password):
    """Login and get token"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{AUTH_BASE_URL}/api/auth/login",
            json={"email": email, "password": password}
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("data", {}).get("accessToken")
            print(f"✅ Login successful: {email}")
            return token
        else:
            print(f"❌ Login failed: {response.status_code}")
            return None


async def test_general_complaint(token):
    """Test creating a general complaint"""
    print("\n" + "=" * 80)
    print("TEST 1: Create General Complaint (No Order)")
    print("=" * 80)
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{CMPS_BASE_URL}/api/complaints",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "category": "Customer Service",
                "subject": "General inquiry about service",
                "description": "I have a general question about your customer service policies and procedures. This is not related to any specific order.",
                "priority": "Low",
                "tags": ["general", "inquiry"]
            }
        )
        
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 201:
            complaint = data.get("data", {})
            print(f"\n✅ SUCCESS: General complaint created")
            print(f"   Complaint ID: {complaint.get('complaintId')}")
            print(f"   Status: {complaint.get('status')}")
            print(f"   Order ID: {complaint.get('orderId', 'None')}")
            return True
        else:
            print(f"\n❌ FAILED: Could not create general complaint")
            return False


async def test_order_complaint(token, order_id):
    """Test creating an order-linked complaint"""
    print("\n" + "=" * 80)
    print(f"TEST 2: Create Order-Linked Complaint (Order: {order_id})")
    print("=" * 80)
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{CMPS_BASE_URL}/api/complaints",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "orderId": order_id,
                "category": "Delivery Issue",
                "subject": "Order delivery delayed significantly",
                "description": "My order was supposed to be delivered 3 days ago but it hasn't arrived yet. I need this urgently. Please investigate and provide an update on the delivery status.",
                "priority": "High",
                "tags": ["delivery", "urgent", "delayed"],
                "metadata": {
                    "source": "Web",
                    "platform": "Desktop",
                    "ipAddress": "192.168.1.100",
                    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                }
            }
        )
        
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 201:
            complaint = data.get("data", {})
            print(f"\n✅ SUCCESS: Order-linked complaint created")
            print(f"   Complaint ID: {complaint.get('complaintId')}")
            print(f"   Order ID: {complaint.get('orderId')}")
            print(f"   Status: {complaint.get('status')}")
            print(f"   Priority: {complaint.get('priority')}")
            return True
        else:
            print(f"\n❌ FAILED: Could not create order-linked complaint")
            return False


async def test_wrong_customer_order(token, wrong_order_id="ORD-2026-000001"):
    """Test creating complaint with another customer's order"""
    print("\n" + "=" * 80)
    print(f"TEST 3: Attempt Complaint with Another Customer's Order")
    print("=" * 80)
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{CMPS_BASE_URL}/api/complaints",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "orderId": wrong_order_id,
                "category": "Product Quality",
                "subject": "Test with wrong order",
                "description": "This should fail because the order belongs to a different customer",
                "priority": "Medium"
            }
        )
        
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Admin can create complaints for any order, customer should get 403
        if response.status_code in [201, 403]:
            print(f"\n✅ SUCCESS: Handled correctly (Admin: 201, Customer: 403)")
            return True
        else:
            print(f"\n⚠️  Unexpected status: {response.status_code}")
            return False


async def test_validation_errors(token):
    """Test validation errors"""
    print("\n" + "=" * 80)
    print("TEST 4: Validation Errors")
    print("=" * 80)
    
    tests_passed = 0
    
    # Test 1: Missing subject
    print("\n4a. Missing subject field...")
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{CMPS_BASE_URL}/api/complaints",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "category": "Other",
                "description": "This complaint is missing the subject field"
            }
        )
        
        if response.status_code == 422:
            print(f"   ✅ Correctly rejected (422)")
            tests_passed += 1
        else:
            print(f"   ❌ Unexpected status: {response.status_code}")
    
    # Test 2: Short description
    print("\n4b. Description too short...")
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{CMPS_BASE_URL}/api/complaints",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "category": "Other",
                "subject": "Short desc test",
                "description": "Too short"  # Minimum 20 chars
            }
        )
        
        if response.status_code == 422:
            print(f"   ✅ Correctly rejected (422)")
            tests_passed += 1
        else:
            print(f"   ❌ Unexpected status: {response.status_code}")
    
    # Test 3: Invalid order ID
    print("\n4c. Non-existent order ID...")
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{CMPS_BASE_URL}/api/complaints",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "orderId": "ORD-9999-999999",
                "category": "Other",
                "subject": "Invalid order test",
                "description": "This order does not exist in the system"
            }
        )
        
        if response.status_code == 404:
            print(f"   ✅ Correctly rejected (404)")
            tests_passed += 1
        else:
            print(f"   ❌ Unexpected status: {response.status_code}")
    
    print(f"\n✅ Validation tests: {tests_passed}/3 passed")
    return tests_passed == 3


async def test_order_complaint_with_customer(customer_token, order_id):
    """Test creating an order-linked complaint with actual customer who owns the order"""
    print("\n" + "=" * 80)
    print(f"TEST 5: Create Order-Linked Complaint with Real Customer")
    print(f"Order ID: {order_id}")
    print("=" * 80)
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{CMPS_BASE_URL}/api/complaints",
            headers={"Authorization": f"Bearer {customer_token}"},
            json={
                "orderId": order_id,
                "category": "Delivery Issue",
                "subject": "Package not delivered on time",
                "description": "I ordered this product with express delivery but it has been delayed by 3 days. I need this urgently for an important project. Please expedite the delivery.",
                "priority": "High",
                "tags": ["delivery", "urgent", "delayed"],
                "metadata": {
                    "source": "Web",
                    "platform": "Desktop"
                }
            }
        )
        
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 201:
            complaint = data.get("data", {})
            print(f"\n✅ SUCCESS: Customer created order-linked complaint")
            print(f"   Complaint ID: {complaint.get('complaintId')}")
            print(f"   Order ID: {complaint.get('orderId')}")
            print(f"   Customer Email: {complaint.get('customerEmail')}")
            print(f"   Status: {complaint.get('status')}")
            print(f"   Priority: {complaint.get('priority')}")
            return complaint.get('complaintId')
        else:
            print(f"\n❌ FAILED: Could not create order-linked complaint")
            return None


async def get_customer_orders(token):
    """Get customer orders using ORMS API"""
    print("\nFetching customer orders...")
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{ORMS_BASE_URL}/api/orders/me",
            params={"page": 1, "page_size": 10},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            orders = data.get("items", [])
            print(f"✅ Found {len(orders)} orders")
            return orders
        else:
            print(f"⚠️  Could not get orders: {response.status_code}")
            return []


async def main():
    """Run all enhanced tests"""
    print("=" * 80)
    print("PHASE 3 COMPREHENSIVE TESTS - Real Customer & Orders")
    print("=" * 80)
    
    results = []
    
    # Test 1: Admin User Tests
    print("\n" + "=" * 80)
    print("PART 1: TESTING WITH ADMIN USER")
    print("=" * 80)
    
    admin_token = await login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not admin_token:
        print("❌ Cannot proceed without admin token")
        return
    
    # Admin creates general complaint
    results.append(await test_general_complaint(admin_token))
    
    # Admin validation tests
    results.append(await test_validation_errors(admin_token))
    
    # Test 2: Customer User Tests
    print("\n" + "=" * 80)
    print("PART 2: TESTING WITH CUSTOMER USER (Has Orders)")
    print("=" * 80)
    
    customer_token = await login(CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
    if not customer_token:
        print("❌ Cannot get customer token")
        return
    
    # Get customer's orders
    orders = await get_customer_orders(customer_token)
    
    if orders and len(orders) > 0:
        order_id = orders[0].get('orderId')
        print(f"\n✅ Using customer's order: {order_id}")
        
        # Customer creates general complaint
        results.append(await test_general_complaint(customer_token))
        
        # Customer creates order-linked complaint
        complaint_id = await test_order_complaint_with_customer(customer_token, order_id)
        results.append(complaint_id is not None)
        
        # Try with another order if available
        if len(orders) > 1:
            order_id_2 = orders[1].get('orderId')
            results.append(await test_order_complaint(customer_token, order_id_2))
    else:
        print("⚠️  Customer has no orders available for testing")
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total tests run: {len(results)}")
    print(f"Tests passed: {sum(results)}")
    print(f"Tests failed: {len(results) - sum(results)}")
    print(f"Success rate: {sum(results)/len(results)*100:.1f}%")
    
    if all(results):
        print("\n🎉 ALL TESTS PASSED!")
    else:
        print(f"\n⚠️  {len(results) - sum(results)} test(s) failed")


if __name__ == "__main__":
    asyncio.run(main())
