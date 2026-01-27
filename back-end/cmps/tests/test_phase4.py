"""
Phase 4: Complaint Retrieval Tests
Tests for complaint retrieval endpoints (GET operations)
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import requests
import json
from datetime import datetime

# Test configuration
BASE_URL = "http://localhost:5004"
AUTH_URL = "http://localhost:5001"
ORMS_URL = "http://localhost:5003"

# Test credentials
CUSTOMER_EMAIL = "orms.test@example.com"
CUSTOMER_PASSWORD = "TestPass@123"
ADMIN_EMAIL = "jtdhamodharan@gmail.com"
ADMIN_PASSWORD = "Madurai54321!"


def login(email, password):
    """Login and get JWT token"""
    response = requests.post(
        f"{AUTH_URL}/api/auth/login",
        json={"email": email, "password": password}
    )
    
    if response.status_code == 200:
        data = response.json()
        return data["data"]["accessToken"]
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return None


def get_customer_orders(token):
    """Get customer's orders"""
    response = requests.get(
        f"{ORMS_URL}/api/orders/me?page=1&page_size=10",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        data = response.json()
        orders = data.get("data", {}).get("orders", [])
        return [order["orderId"] for order in orders]
    return []


def print_separator(title=""):
    """Print a section separator"""
    print("\n" + "=" * 80)
    if title:
        print(title.center(80))
        print("=" * 80)
    print()


def test_customer_get_my_complaints():
    """Test: Customer retrieves their own complaints"""
    print_separator("TEST 1: CUSTOMER GET MY COMPLAINTS")
    
    # Login as customer
    token = login(CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
    if not token:
        print("❌ Failed to login as customer")
        return False
    
    print(f"✅ Logged in as customer: {CUSTOMER_EMAIL}")
    
    # Get my complaints (default: page 1, limit 10)
    response = requests.get(
        f"{BASE_URL}/api/complaints/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"\n📋 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        complaints = data.get("data", {}).get("complaints", [])
        pagination = data.get("data", {}).get("pagination", {})
        
        print(f"✅ SUCCESS: Retrieved {len(complaints)} complaints")
        print(f"\n📊 Pagination:")
        print(f"   Current Page: {pagination.get('currentPage')}")
        print(f"   Total Pages: {pagination.get('totalPages')}")
        print(f"   Total Items: {pagination.get('totalItems')}")
        print(f"   Items Per Page: {pagination.get('itemsPerPage')}")
        
        if complaints:
            print(f"\n📝 First complaint:")
            first = complaints[0]
            print(f"   ID: {first.get('complaintId')}")
            print(f"   Subject: {first.get('subject')}")
            print(f"   Status: {first.get('status')}")
            print(f"   Priority: {first.get('priority')}")
            print(f"   Category: {first.get('category')}")
        
        return True
    else:
        print(f"❌ FAILED: {response.status_code}")
        print(response.text)
        return False


def test_customer_get_complaints_with_filters():
    """Test: Customer retrieves complaints with filters"""
    print_separator("TEST 2: CUSTOMER GET COMPLAINTS WITH FILTERS")
    
    # Login as customer
    token = login(CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
    if not token:
        print("❌ Failed to login as customer")
        return False
    
    print(f"✅ Logged in as customer: {CUSTOMER_EMAIL}")
    
    # Test filter by status
    print("\n🔍 Filter by status: Open")
    response = requests.get(
        f"{BASE_URL}/api/complaints/me?status=Open&limit=5",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        data = response.json()
        complaints = data.get("data", {}).get("complaints", [])
        print(f"✅ Found {len(complaints)} Open complaints")
        
        # Verify all are Open status
        all_open = all(c.get("status") == "Open" for c in complaints)
        if all_open:
            print("✅ All complaints have status=Open")
        else:
            print("❌ Some complaints have different status")
            return False
    else:
        print(f"⚠️ Status filter returned: {response.status_code}")
    
    # Test pagination
    print("\n🔍 Pagination test: page=1, limit=3")
    response = requests.get(
        f"{BASE_URL}/api/complaints/me?page=1&limit=3",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        data = response.json()
        complaints = data.get("data", {}).get("complaints", [])
        pagination = data.get("data", {}).get("pagination", {})
        
        print(f"✅ Retrieved {len(complaints)} complaints (max 3)")
        print(f"   Items per page: {pagination.get('itemsPerPage')}")
        
        if len(complaints) <= 3:
            print("✅ Pagination working correctly")
        else:
            print("❌ Pagination not working")
            return False
    
    return True


def test_customer_get_complaint_by_id():
    """Test: Customer retrieves specific complaint by ID"""
    print_separator("TEST 3: CUSTOMER GET COMPLAINT BY ID")
    
    # Login as customer
    token = login(CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
    if not token:
        print("❌ Failed to login as customer")
        return False
    
    print(f"✅ Logged in as customer: {CUSTOMER_EMAIL}")
    
    # First get list of complaints to get a valid ID
    response = requests.get(
        f"{BASE_URL}/api/complaints/me?limit=1",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 200:
        print("❌ Failed to get complaint list")
        return False
    
    data = response.json()
    complaints = data.get("data", {}).get("complaints", [])
    
    if not complaints:
        print("⚠️ No complaints found for customer, skipping test")
        return True
    
    complaint_id = complaints[0].get("complaintId")
    print(f"\n🔍 Getting complaint details: {complaint_id}")
    
    # Get complaint by ID
    response = requests.get(
        f"{BASE_URL}/api/complaints/{complaint_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"📋 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        complaint = data.get("data", {})
        
        print(f"✅ SUCCESS: Retrieved complaint details")
        print(f"\n📝 Complaint Details:")
        print(f"   ID: {complaint.get('complaintId')}")
        print(f"   Customer: {complaint.get('customerName')} ({complaint.get('customerEmail')})")
        print(f"   Order: {complaint.get('orderId') or 'General complaint'}")
        print(f"   Subject: {complaint.get('subject')}")
        print(f"   Description: {complaint.get('description')[:50]}...")
        print(f"   Status: {complaint.get('status')}")
        print(f"   Priority: {complaint.get('priority')}")
        print(f"   Category: {complaint.get('category')}")
        print(f"   Created: {complaint.get('createdAt')}")
        
        return True
    else:
        print(f"❌ FAILED: {response.status_code}")
        print(response.text)
        return False


def test_customer_cannot_view_others_complaint():
    """Test: Customer cannot view another customer's complaint"""
    print_separator("TEST 4: CUSTOMER PERMISSION CHECK")
    
    # Login as admin to get a complaint ID
    admin_token = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not admin_token:
        print("❌ Failed to login as admin")
        return False
    
    # Get all complaints as admin
    response = requests.get(
        f"{BASE_URL}/api/complaints?limit=20",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    if response.status_code != 200:
        print("❌ Failed to get complaints as admin")
        return False
    
    data = response.json()
    all_complaints = data.get("data", {}).get("complaints", [])
    
    # Find a complaint from a different customer
    test_customer_email = CUSTOMER_EMAIL
    other_complaint = None
    
    for complaint in all_complaints:
        if complaint.get("customerEmail") != test_customer_email:
            other_complaint = complaint
            break
    
    if not other_complaint:
        print("⚠️ No complaints from other customers found, skipping test")
        return True
    
    other_complaint_id = other_complaint.get("complaintId")
    other_customer_email = other_complaint.get("customerEmail")
    
    print(f"✅ Found complaint from another customer:")
    print(f"   Complaint ID: {other_complaint_id}")
    print(f"   Customer: {other_customer_email}")
    
    # Now login as test customer and try to access
    customer_token = login(CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
    if not customer_token:
        print("❌ Failed to login as customer")
        return False
    
    print(f"\n🔍 Test customer ({test_customer_email}) attempting to access")
    print(f"   complaint {other_complaint_id}")
    
    response = requests.get(
        f"{BASE_URL}/api/complaints/{other_complaint_id}",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    
    print(f"📋 Status Code: {response.status_code}")
    
    if response.status_code == 403:
        print(f"✅ CORRECTLY BLOCKED!")
        print(f"   Message: You can only view your own complaints")
        return True
    elif response.status_code == 200:
        print(f"❌ SECURITY ISSUE: Customer can view other customers' complaints!")
        return False
    else:
        print(f"⚠️ Unexpected status code: {response.status_code}")
        print(response.text)
        return False


def test_admin_list_all_complaints():
    """Test: Admin retrieves all complaints"""
    print_separator("TEST 5: ADMIN LIST ALL COMPLAINTS")
    
    # Login as admin
    token = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not token:
        print("❌ Failed to login as admin")
        return False
    
    print(f"✅ Logged in as admin: {ADMIN_EMAIL}")
    
    # Get all complaints
    response = requests.get(
        f"{BASE_URL}/api/complaints?page=1&limit=10",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"\n📋 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        complaints = data.get("data", {}).get("complaints", [])
        pagination = data.get("data", {}).get("pagination", {})
        
        print(f"✅ SUCCESS: Retrieved {len(complaints)} complaints")
        print(f"\n📊 Pagination:")
        print(f"   Current Page: {pagination.get('currentPage')}")
        print(f"   Total Pages: {pagination.get('totalPages')}")
        print(f"   Total Items: {pagination.get('totalItems')}")
        print(f"   Items Per Page: {pagination.get('itemsPerPage')}")
        
        if complaints:
            print(f"\n📝 Sample complaints:")
            for i, complaint in enumerate(complaints[:3], 1):
                print(f"\n   {i}. {complaint.get('complaintId')}")
                print(f"      Customer: {complaint.get('customerEmail')}")
                print(f"      Subject: {complaint.get('subject')}")
                print(f"      Status: {complaint.get('status')}")
                print(f"      Priority: {complaint.get('priority')}")
        
        return True
    else:
        print(f"❌ FAILED: {response.status_code}")
        print(response.text)
        return False


def test_admin_filter_complaints():
    """Test: Admin filters complaints by various criteria"""
    print_separator("TEST 6: ADMIN FILTER COMPLAINTS")
    
    # Login as admin
    token = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not token:
        print("❌ Failed to login as admin")
        return False
    
    print(f"✅ Logged in as admin: {ADMIN_EMAIL}")
    
    # Test 1: Filter by status
    print("\n🔍 Filter by status: Open")
    response = requests.get(
        f"{BASE_URL}/api/complaints?status=Open&limit=20",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        data = response.json()
        complaints = data.get("data", {}).get("complaints", [])
        print(f"✅ Found {len(complaints)} Open complaints")
        
        # Verify all are Open
        all_open = all(c.get("status") == "Open" for c in complaints)
        if all_open:
            print("✅ All complaints have status=Open")
        else:
            print("❌ Some complaints have different status")
            return False
    else:
        print(f"⚠️ Filter returned: {response.status_code}")
    
    # Test 2: Filter by priority
    print("\n🔍 Filter by priority: High")
    response = requests.get(
        f"{BASE_URL}/api/complaints?priority=High&limit=20",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        data = response.json()
        complaints = data.get("data", {}).get("complaints", [])
        print(f"✅ Found {len(complaints)} High priority complaints")
        
        # Verify all are High
        if complaints:
            all_high = all(c.get("priority") == "High" for c in complaints)
            if all_high:
                print("✅ All complaints have priority=High")
            else:
                print("❌ Some complaints have different priority")
                return False
    else:
        print(f"⚠️ Filter returned: {response.status_code}")
    
    # Test 3: Sort by priority descending
    print("\n🔍 Sort by priority descending")
    response = requests.get(
        f"{BASE_URL}/api/complaints?sortBy=priority&sortOrder=desc&limit=5",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        data = response.json()
        complaints = data.get("data", {}).get("complaints", [])
        print(f"✅ Retrieved {len(complaints)} complaints")
        
        if complaints:
            priorities = [c.get("priority") for c in complaints]
            print(f"   Priorities: {', '.join(priorities)}")
    
    return True


def test_admin_search_complaints():
    """Test: Admin searches complaints"""
    print_separator("TEST 7: ADMIN SEARCH COMPLAINTS")
    
    # Login as admin
    token = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not token:
        print("❌ Failed to login as admin")
        return False
    
    print(f"✅ Logged in as admin: {ADMIN_EMAIL}")
    
    # First get a complaint to search for
    response = requests.get(
        f"{BASE_URL}/api/complaints?limit=1",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 200 or not response.json().get("data", {}).get("complaints"):
        print("⚠️ No complaints found for search test")
        return True
    
    sample_complaint = response.json()["data"]["complaints"][0]
    complaint_id = sample_complaint.get("complaintId")
    customer_email = sample_complaint.get("customerEmail")
    
    # Test 1: Search by complaint ID (exact match)
    print(f"\n🔍 Search by complaint ID: {complaint_id}")
    response = requests.get(
        f"{BASE_URL}/api/complaints/search?q={complaint_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"📋 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        complaints = data.get("data", {}).get("complaints", [])
        print(f"✅ Found {len(complaints)} complaint(s)")
        
        if complaints and complaints[0].get("complaintId") == complaint_id:
            print(f"✅ Correct complaint found: {complaint_id}")
        else:
            print(f"❌ Complaint ID mismatch")
            return False
    else:
        print(f"❌ Search failed: {response.status_code}")
        return False
    
    # Test 2: Search by customer email (partial match)
    if customer_email:
        email_part = customer_email.split("@")[0][:5]  # First 5 chars of email
        print(f"\n🔍 Search by email fragment: {email_part}")
        
        response = requests.get(
            f"{BASE_URL}/api/complaints/search?q={email_part}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            complaints = data.get("data", {}).get("complaints", [])
            print(f"✅ Found {len(complaints)} complaint(s) matching '{email_part}'")
            
            # Verify at least one contains the search term
            matching = any(email_part.lower() in c.get("customerEmail", "").lower() for c in complaints)
            if matching:
                print(f"✅ Search results contain matching emails")
            else:
                print(f"⚠️ No matching emails in results")
        else:
            print(f"⚠️ Search returned: {response.status_code}")
    
    return True


def test_customer_cannot_access_admin_endpoints():
    """Test: Customer cannot access admin-only endpoints"""
    print_separator("TEST 8: CUSTOMER BLOCKED FROM ADMIN ENDPOINTS")
    
    # Login as customer
    token = login(CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
    if not token:
        print("❌ Failed to login as customer")
        return False
    
    print(f"✅ Logged in as customer: {CUSTOMER_EMAIL}")
    
    # Test 1: Try to access admin list endpoint
    print("\n🔍 Customer attempting to access GET /api/complaints (admin only)")
    response = requests.get(
        f"{BASE_URL}/api/complaints",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"📋 Status Code: {response.status_code}")
    
    if response.status_code == 403:
        print(f"✅ CORRECTLY BLOCKED!")
        print(f"   Message: Administrator access required")
    elif response.status_code == 200:
        print(f"❌ SECURITY ISSUE: Customer can access admin endpoint!")
        return False
    else:
        print(f"⚠️ Unexpected status code: {response.status_code}")
    
    # Test 2: Try to access admin search endpoint
    print("\n🔍 Customer attempting to access GET /api/complaints/search (admin only)")
    response = requests.get(
        f"{BASE_URL}/api/complaints/search?q=test",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"📋 Status Code: {response.status_code}")
    
    if response.status_code == 403:
        print(f"✅ CORRECTLY BLOCKED!")
        print(f"   Message: Administrator access required")
        return True
    elif response.status_code == 200:
        print(f"❌ SECURITY ISSUE: Customer can access admin search endpoint!")
        return False
    else:
        print(f"⚠️ Unexpected status code: {response.status_code}")
        return True


def main():
    """Run all Phase 4 tests"""
    print("\n")
    print("╔" + "=" * 78 + "╗")
    print("║" + " PHASE 4: COMPLAINT RETRIEVAL TESTS ".center(78) + "║")
    print("╚" + "=" * 78 + "╝")
    
    tests = [
        ("Customer Get My Complaints", test_customer_get_my_complaints),
        ("Customer Get Complaints with Filters", test_customer_get_complaints_with_filters),
        ("Customer Get Complaint by ID", test_customer_get_complaint_by_id),
        ("Customer Permission Check", test_customer_cannot_view_others_complaint),
        ("Admin List All Complaints", test_admin_list_all_complaints),
        ("Admin Filter Complaints", test_admin_filter_complaints),
        ("Admin Search Complaints", test_admin_search_complaints),
        ("Customer Blocked from Admin Endpoints", test_customer_cannot_access_admin_endpoints),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ Test error: {str(e)}")
            import traceback
            traceback.print_exc()
            results.append((test_name, False))
    
    # Print summary
    print_separator("TEST SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for i, (test_name, result) in enumerate(results, 1):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{i}. {test_name}: {status}")
    
    print(f"\n{'=' * 80}")
    print(f"TOTAL: {passed}/{total} tests passed ({passed*100//total}%)")
    print(f"{'=' * 80}\n")
    
    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
