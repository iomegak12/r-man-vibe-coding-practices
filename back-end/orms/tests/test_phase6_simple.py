"""
Phase 6 Simple Test - Test admin return endpoints with one clean return
"""

import sys
import os
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import httpx

BASE_URL = "http://localhost:5003"
ADMIN_EMAIL = "jtdhamodharan@gmail.com"
ADMIN_PASSWORD = "Madurai54321!"


async def test_admin_returns():
    """Simple test of admin return endpoints"""
    
    print("\n=== Testing Admin Return Management ===\n")
    
    async with httpx.AsyncClient() as client:
        # Login as admin
        print("1. Logging in as admin...")
        response = await client.post(
            f"http://localhost:5001/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        
        if response.status_code != 200:
            print(f"❌ Admin login failed: {response.status_code}")
            return
        
        token = response.json().get("data", {}).get("accessToken")
        if not token:
            print(f"❌ No token received")
            return
        
        print(f"✅ Admin logged in successfully\n")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test 1: List all returns
        print("2. Testing GET /api/admin/returns...")
        try:
            response = await client.get(
                f"{BASE_URL}/api/admin/returns",
                headers=headers
            )
            
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Returns listed successfully")
                print(f"   Total returns: {data.get('pagination', {}).get('totalReturns', 0)}")
            else:
                print(f"❌ Failed: {response.text}")
        except Exception as e:
            print(f"❌ Error: {str(e)}")
        
        # Test 2: Get return statistics
        print("\n3. Testing GET /api/admin/returns/stats/summary...")
        try:
            response = await client.get(
                f"{BASE_URL}/api/admin/returns/stats/summary",
                headers=headers
            )
            
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Statistics retrieved successfully")
                summary = data.get('summary', {})
                print(f"   Total: {summary.get('totalReturns', 0)}")
                print(f"   Pending: {summary.get('pendingReturns', 0)}")
                print(f"   Approved: {summary.get('approvedReturns', 0)}")
                print(f"   Rejected: {summary.get('rejectedReturns', 0)}")
            else:
                print(f"❌ Failed: {response.text}")
        except Exception as e:
            print(f"❌ Error: {str(e)}")
        
        print("\n=== Test Complete ===\n")


if __name__ == "__main__":
    asyncio.run(test_admin_returns())
