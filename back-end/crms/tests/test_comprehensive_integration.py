"""
Comprehensive Integration Tests for CRMS
Tests all phases including service integrations, authentication, and error handling
"""
import asyncio
import httpx
import os
from datetime import datetime

# Service URLs
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:5001")
CRMS_URL = os.getenv("CRMS_URL", "http://localhost:5002")
ORMS_URL = os.getenv("ORMS_URL", "http://localhost:5003")
CMPS_URL = os.getenv("CMPS_URL", "http://localhost:5004")

# Test credentials
ADMIN_CREDENTIALS = {
    "email": "admin@rman.com",
    "password": "Admin@123"
}

CUSTOMER_CREDENTIALS = {
    "email": "customer@test.com",
    "password": "Customer@123"
}

# Global tokens
admin_token = None
customer_token = None
test_customer_id = None


def print_test(message: str):
    """Print test message"""
    print(f"\n{'='*80}")
    print(f"TEST: {message}")
    print(f"{'='*80}")


def print_result(success: bool, message: str):
    """Print test result"""
    symbol = "✅" if success else "❌"
    print(f"{symbol} {message}")


async def test_health_checks():
    """Test health endpoints for all services"""
    print_test("Health Checks")
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        services = [
            ("Auth Service", f"{AUTH_SERVICE_URL}/health"),
            ("CRMS", f"{CRMS_URL}/health"),
            ("ORMS", f"{ORMS_URL}/health"),
            ("CMPS", f"{CMPS_URL}/health"),
        ]
        
        for service_name, url in services:
            try:
                response = await client.get(url)
                print_result(
                    response.status_code == 200,
                    f"{service_name} health check: {response.status_code}"
                )
            except Exception as e:
                print_result(False, f"{service_name} health check failed: {str(e)}")


async def test_authentication():
    """Test authentication flow"""
    global admin_token, customer_token
    
    print_test("Authentication Tests")
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Test admin login
        try:
            response = await client.post(
                f"{AUTH_SERVICE_URL}/api/auth/login",
                json=ADMIN_CREDENTIALS
            )
            if response.status_code == 200:
                data = response.json()
                admin_token = data["data"]["token"]
                print_result(True, f"Admin login successful")
            else:
                print_result(False, f"Admin login failed: {response.status_code}")
        except Exception as e:
            print_result(False, f"Admin login error: {str(e)}")
        
        # Test customer login
        try:
            response = await client.post(
                f"{AUTH_SERVICE_URL}/api/auth/login",
                json=CUSTOMER_CREDENTIALS
            )
            if response.status_code == 200:
                data = response.json()
                customer_token = data["data"]["token"]
                print_result(True, f"Customer login successful")
            else:
                print_result(False, f"Customer login failed: {response.status_code}")
        except Exception as e:
            print_result(False, f"Customer login error: {str(e)}")


async def test_customer_profile():
    """Test customer profile endpoints"""
    print_test("Customer Profile Tests")
    
    if not customer_token:
        print_result(False, "Customer token not available")
        return
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        headers = {"Authorization": f"Bearer {customer_token}"}
        
        # Get customer profile
        try:
            response = await client.get(
                f"{CRMS_URL}/api/customers/me",
                headers=headers
            )
            print_result(
                response.status_code == 200,
                f"Get customer profile: {response.status_code}"
            )
            if response.status_code == 200:
                data = response.json()
                print(f"  Customer: {data['data']['fullName']} ({data['data']['email']})")
        except Exception as e:
            print_result(False, f"Get profile error: {str(e)}")
        
        # Get customer statistics
        try:
            response = await client.get(
                f"{CRMS_URL}/api/customers/me/statistics",
                headers=headers
            )
            print_result(
                response.status_code == 200,
                f"Get customer statistics: {response.status_code}"
            )
            if response.status_code == 200:
                data = response.json()
                stats = data['data']
                print(f"  Orders: {stats['totalOrders']}, Complaints: {stats['totalComplaints']}")
        except Exception as e:
            print_result(False, f"Get statistics error: {str(e)}")


async def test_admin_endpoints():
    """Test admin customer management"""
    global test_customer_id
    
    print_test("Admin Customer Management Tests")
    
    if not admin_token:
        print_result(False, "Admin token not available")
        return
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # List all customers
        try:
            response = await client.get(
                f"{CRMS_URL}/api/customers",
                headers=headers,
                params={"page": 1, "limit": 10}
            )
            print_result(
                response.status_code == 200,
                f"List customers: {response.status_code}"
            )
            if response.status_code == 200:
                data = response.json()
                total = data['totalItems']
                customers = data['data']
                print(f"  Total customers: {total}")
                if customers:
                    test_customer_id = customers[0]['customerId']
                    print(f"  First customer: {customers[0]['email']}")
        except Exception as e:
            print_result(False, f"List customers error: {str(e)}")
        
        # Search customers
        try:
            response = await client.get(
                f"{CRMS_URL}/api/customers/search",
                headers=headers,
                params={"query": "customer", "limit": 5}
            )
            print_result(
                response.status_code == 200,
                f"Search customers: {response.status_code}"
            )
            if response.status_code == 200:
                data = response.json()
                print(f"  Found {data['data']['totalResults']} results")
        except Exception as e:
            print_result(False, f"Search customers error: {str(e)}")
        
        # Get analytics
        try:
            response = await client.get(
                f"{CRMS_URL}/api/customers/analytics",
                headers=headers
            )
            print_result(
                response.status_code == 200,
                f"Get analytics: {response.status_code}"
            )
            if response.status_code == 200:
                data = response.json()
                analytics = data['data']
                print(f"  Total customers: {analytics['totalCustomers']}")
                print(f"  By status: {analytics['customersByStatus']}")
        except Exception as e:
            print_result(False, f"Get analytics error: {str(e)}")


async def test_service_integrations():
    """Test CRMS integration with ORMS and CMPS"""
    print_test("Service Integration Tests (CRMS → ORMS/CMPS)")
    
    if not admin_token or not test_customer_id:
        print_result(False, "Prerequisites not available")
        return
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get customer orders (CRMS → ORMS)
        try:
            response = await client.get(
                f"{CRMS_URL}/api/customers/{test_customer_id}/orders",
                headers=headers,
                params={"limit": 5}
            )
            print_result(
                response.status_code == 200,
                f"Get customer orders (CRMS→ORMS): {response.status_code}"
            )
            if response.status_code == 200:
                data = response.json()
                if 'summary' in data['data']:
                    summary = data['data']['summary']
                    print(f"  Orders: {summary.get('totalOrders', 0)}")
                else:
                    print(f"  Note: {data['data'].get('note', 'Service unavailable')}")
        except Exception as e:
            print_result(False, f"Get orders error: {str(e)}")
        
        # Get customer complaints (CRMS → CMPS)
        try:
            response = await client.get(
                f"{CRMS_URL}/api/customers/{test_customer_id}/complaints",
                headers=headers,
                params={"limit": 5}
            )
            print_result(
                response.status_code == 200,
                f"Get customer complaints (CRMS→CMPS): {response.status_code}"
            )
            if response.status_code == 200:
                data = response.json()
                if 'summary' in data['data']:
                    summary = data['data']['summary']
                    print(f"  Complaints: {summary.get('totalComplaints', 0)}")
                else:
                    print(f"  Note: {data['data'].get('note', 'Service unavailable')}")
        except Exception as e:
            print_result(False, f"Get complaints error: {str(e)}")


async def test_customer_notes():
    """Test customer notes functionality"""
    print_test("Customer Notes Tests")
    
    if not admin_token or not test_customer_id:
        print_result(False, "Prerequisites not available")
        return
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Add note to customer
        try:
            note_text = f"Test note added at {datetime.utcnow().isoformat()}"
            response = await client.post(
                f"{CRMS_URL}/api/customers/{test_customer_id}/notes",
                headers=headers,
                json={"notes": note_text}
            )
            print_result(
                response.status_code == 200,
                f"Add customer note: {response.status_code}"
            )
            if response.status_code == 200:
                data = response.json()
                notes_count = len(data['data']['notes'])
                print(f"  Total notes: {notes_count}")
        except Exception as e:
            print_result(False, f"Add note error: {str(e)}")


async def test_authorization():
    """Test role-based access control"""
    print_test("Authorization Tests")
    
    if not customer_token:
        print_result(False, "Customer token not available")
        return
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Customer trying to access admin endpoint (should fail)
        headers = {"Authorization": f"Bearer {customer_token}"}
        
        try:
            response = await client.get(
                f"{CRMS_URL}/api/customers",
                headers=headers
            )
            print_result(
                response.status_code == 403,
                f"Customer accessing admin endpoint: {response.status_code} (expected 403)"
            )
        except Exception as e:
            print_result(False, f"Authorization test error: {str(e)}")
        
        # Unauthenticated request (should fail)
        try:
            response = await client.get(f"{CRMS_URL}/api/customers/me")
            print_result(
                response.status_code == 401,
                f"Unauthenticated request: {response.status_code} (expected 401)"
            )
        except Exception as e:
            print_result(False, f"Unauthenticated test error: {str(e)}")


async def test_error_handling():
    """Test error handling"""
    print_test("Error Handling Tests")
    
    if not admin_token:
        print_result(False, "Admin token not available")
        return
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Invalid customer ID
        try:
            response = await client.get(
                f"{CRMS_URL}/api/customers/invalid-id",
                headers=headers
            )
            print_result(
                response.status_code == 400,
                f"Invalid customer ID: {response.status_code} (expected 400)"
            )
        except Exception as e:
            print_result(False, f"Invalid ID test error: {str(e)}")
        
        # Non-existent customer
        try:
            response = await client.get(
                f"{CRMS_URL}/api/customers/507f1f77bcf86cd799439011",
                headers=headers
            )
            print_result(
                response.status_code == 404,
                f"Non-existent customer: {response.status_code} (expected 404)"
            )
        except Exception as e:
            print_result(False, f"Non-existent customer test error: {str(e)}")


async def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("CRMS COMPREHENSIVE INTEGRATION TESTS")
    print("="*80)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run test suites
    await test_health_checks()
    await test_authentication()
    await test_customer_profile()
    await test_admin_endpoints()
    await test_service_integrations()
    await test_customer_notes()
    await test_authorization()
    await test_error_handling()
    
    print("\n" + "="*80)
    print(f"Tests completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)


if __name__ == "__main__":
    asyncio.run(main())
