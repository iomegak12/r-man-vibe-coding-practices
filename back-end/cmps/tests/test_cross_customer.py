"""
Test customer CANNOT create complaint for another customer's order
"""
import asyncio
import httpx
import json
from motor.motor_asyncio import AsyncIOMotorClient


async def main():
    # First, find an order that belongs to a different customer
    client = AsyncIOMotorClient("mongodb://admin:password123@localhost:27017/?authSource=admin")
    order_db = client["r-man-orders-db"]
    auth_db = client["rman-auth-db"]
    
    print("=" * 80)
    print("CUSTOMER CROSS-ORDER PERMISSION TEST")
    print("=" * 80)
    
    # Get test customer info
    test_customer_user_id = "69770d08f5f172af78304f14"
    test_customer_email = "orms.test@example.com"
    
    # Find their orders
    test_customer_orders = await order_db.orders.find({"userId": test_customer_user_id}).to_list(length=10)
    if test_customer_orders:
        test_customer_id = test_customer_orders[0].get("customerId")
        print(f"\n✅ Test Customer: {test_customer_email}")
        print(f"   Customer ID: {test_customer_id}")
        print(f"   Has {len(test_customer_orders)} orders")
    
    # Find an order from a DIFFERENT customer
    other_order = await order_db.orders.find_one({"customerId": {"$ne": test_customer_id}})
    
    if not other_order:
        print("\n⚠️  No other customer orders found for testing")
        client.close()
        return
    
    other_order_id = other_order.get("orderId")
    other_customer_id = other_order.get("customerId")
    other_customer_email = other_order.get("customerEmail")
    
    print(f"\n✅ Found another customer's order:")
    print(f"   Order ID: {other_order_id}")
    print(f"   Customer ID: {other_customer_id}")
    print(f"   Customer Email: {other_customer_email}")
    
    client.close()
    
    # Now try to create complaint
    print("\n" + "=" * 80)
    print("ATTEMPTING TO CREATE COMPLAINT")
    print("=" * 80)
    print(f"\nTest customer ({test_customer_email}) will try to create")
    print(f"complaint for order {other_order_id}")
    print(f"which belongs to {other_customer_email}")
    print(f"\nExpected result: ❌ FORBIDDEN (403)")
    
    # Login as test customer
    async with httpx.AsyncClient() as http_client:
        auth_resp = await http_client.post(
            "http://localhost:5001/api/auth/login",
            json={"email": test_customer_email, "password": "TestPass@123"}
        )
        
        if auth_resp.status_code != 200:
            print("\n❌ Login failed")
            return
        
        token = auth_resp.json()["data"]["accessToken"]
        print("\n✅ Logged in as test customer")
        
        # Try to create complaint for other customer's order
        complaint_resp = await http_client.post(
            "http://localhost:5004/api/complaints",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "orderId": other_order_id,
                "category": "Other",
                "subject": "Trying to create complaint for another customer's order",
                "description": "This should be blocked because the order belongs to a different customer",
                "priority": "Low"
            }
        )
        
        print(f"\n📋 Result: {complaint_resp.status_code}")
        data = complaint_resp.json()
        
        if complaint_resp.status_code == 403:
            print(f"✅ CORRECTLY BLOCKED!")
            print(f"   Message: {data.get('message')}")
            print(f"\n✅ VERIFICATION PASSED:")
            print(f"   Customers cannot create complaints for other customers' orders")
        elif complaint_resp.status_code == 201:
            print(f"❌ SECURITY ISSUE: Complaint was created!")
            print(f"   This should have been blocked!")
            print(json.dumps(data, indent=2))
        else:
            print(f"⚠️  Unexpected response: {data.get('message')}")


if __name__ == "__main__":
    asyncio.run(main())
