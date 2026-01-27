"""Quick validation test for Phase 7"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import httpx
import asyncio

BASE_URL = "http://localhost:5003"
SERVICE_API_KEY = "b3a285fafe93756687343b95de0d4c82"
ADMIN_EMAIL = "jtdhamodharan@gmail.com"
ADMIN_PASSWORD = "Madurai54321!"

async def test():
    async with httpx.AsyncClient() as client:
        # Login as admin
        login_response = await client.post(
            f"{BASE_URL}/api/orders/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        
        if login_response.status_code != 200:
            print("❌ Failed to login")
            return
        
        token = login_response.json()["data"]["token"]
        
        # Get returns to find a customer ID
        returns_response = await client.get(
            f"{BASE_URL}/api/admin/returns",
            headers={"Authorization": f"Bearer {token}"},
            params={"page": 1, "page_size": 5}
        )
        
        if returns_response.status_code == 200:
            returns_data = returns_response.json()
            returns = returns_data.get("data", {}).get("returns", [])
            if returns:
                customer_id = returns[0].get("customerId")
                customer_name = returns[0].get("customerName")
                print(f"\n✅ Found customer: {customer_name} (ID: {customer_id})")
                
                # Now test internal endpoint with this customer
                print(f"\n🔍 Testing internal endpoint for customer {customer_id}...")
                internal_response = await client.get(
                    f"{BASE_URL}/api/internal/customers/{customer_id}/orders",
                    headers={"x-service-api-key": SERVICE_API_KEY},
                    params={"limit": 3}
                )
                
                if internal_response.status_code == 200:
                    data = internal_response.json()
                    print(f"\n✅ Internal endpoint works!")
                    print(f"   Total Orders: {data['summary']['totalOrders']}")
                    print(f"   Total Value: ${data['summary']['totalOrderValue']:.2f}")
                    print(f"   Average Value: ${data['summary']['averageOrderValue']:.2f}")
                    print(f"\n   Status Breakdown:")
                    for status, count in data['statusBreakdown'].items():
                        print(f"      {status}: {count}")
                    print(f"\n   Recent Orders: {len(data['recentOrders'])}")
                    for order in data['recentOrders']:
                        print(f"      - {order['orderId']}: ${order['totalAmount']:.2f} ({order['orderStatus']})")
                else:
                    print(f"❌ Internal endpoint failed: {internal_response.status_code}")
                    print(internal_response.text)
            else:
                print("❌ No returns found")
        else:
            print(f"❌ Failed to get returns: {returns_response.status_code}")

if __name__ == "__main__":
    asyncio.run(test())
