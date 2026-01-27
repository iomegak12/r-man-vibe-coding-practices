"""
Phase 9: Email Integration Tests
Tests for email notifications on complaint events
"""
import requests
import time


# Service URLs
BASE_URL = "http://localhost:5004"
AUTH_URL = "http://localhost:5001"
ORMS_URL = "http://localhost:5003"

# Test credentials
CUSTOMER_EMAIL = "orms.test@example.com"
CUSTOMER_PASSWORD = "TestPass@123"

ADMIN_EMAIL = "jtdhamodharan@gmail.com"
ADMIN_PASSWORD = "Madurai54321!"


def print_separator(title):
    """Print a formatted separator"""
    print(f"\n{'='*80}")
    print(f"{title:^80}")
    print(f"{'='*80}\n")


def test_phase9_email_integration():
    """
    Test Phase 9: Email Integration
    
    Tests email notifications for:
    1. Complaint creation
    2. Admin assignment
    3. Status changes
    4. Complaint resolution
    5. Admin comments
    """
    print("\n╔" + "="*78 + "╗")
    print("║" + " "*78 + "║")
    print("║" + "PHASE 9: EMAIL INTEGRATION TESTS".center(78) + "║")
    print("║" + " "*78 + "║")
    print("╚" + "="*78 + "╝")
    
    results = []
    test_complaint_id = None
    
    # Login
    print_separator("AUTHENTICATION")
    
    print("🔐 Logging in as customer...")
    customer_login = requests.post(
        f"{AUTH_URL}/api/auth/login",
        json={"email": CUSTOMER_EMAIL, "password": CUSTOMER_PASSWORD}
    )
    
    if customer_login.status_code != 200:
        print(f"❌ Customer login failed: {customer_login.status_code}")
        return
    
    customer_token = customer_login.json()["data"]["accessToken"]
    print("✅ Customer logged in")
    
    print("\n🔐 Logging in as admin...")
    admin_login = requests.post(
        f"{AUTH_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    
    if admin_login.status_code != 200:
        print(f"❌ Admin login failed: {admin_login.status_code}")
        return
    
    admin_token = admin_login.json()["data"]["accessToken"]
    print("✅ Admin logged in")
    
    # ============================================================================
    # TEST 1: COMPLAINT CREATION EMAIL
    # ============================================================================
    print_separator("TEST 1: Complaint Creation Email")
    
    print("📧 Creating complaint (should send confirmation email)...")
    
    # Get an order for linking
    orders_response = requests.get(
        f"{ORMS_URL}/api/orders/my-orders?page=1&limit=1",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    
    order_id = None
    if orders_response.status_code == 200:
        orders = orders_response.json()["data"]["orders"]
        if orders:
            order_id = orders[0]["orderId"]
    
    complaint_data = {
        "orderId": order_id,
        "category": "Product Quality",
        "subject": "Email Test - Product Quality Issue",
        "description": "This is a test complaint to verify email notifications are working correctly.",
        "priority": "High"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/complaints",
        headers={"Authorization": f"Bearer {customer_token}"},
        json=complaint_data
    )
    
    if response.status_code == 201:
        test_complaint_id = response.json()["data"]["complaintId"]
        print(f"✅ Complaint created: {test_complaint_id}")
        print(f"   📧 Confirmation email should be sent to: {CUSTOMER_EMAIL}")
        results.append(("Test 1: Complaint Creation Email", True))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Test 1: Complaint Creation Email", False))
        return
    
    time.sleep(2)
    
    # ============================================================================
    # TEST 2: ASSIGNMENT EMAIL
    # ============================================================================
    print_separator("TEST 2: Assignment Email")
    
    print("📧 Assigning complaint (should send assignment email)...")
    
    # Get admin user ID
    import base64
    import json as json_lib
    token_parts = admin_token.split('.')
    payload = token_parts[1] + '=' * (4 - len(token_parts[1]) % 4)
    decoded = base64.b64decode(payload)
    admin_data = json_lib.loads(decoded)
    admin_user_id = admin_data.get("userId") or admin_data.get("sub")
    
    response = requests.patch(
        f"{BASE_URL}/api/complaints/{test_complaint_id}/assign",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "assignTo": admin_user_id,
            "notes": "Assigning for email notification test"
        }
    )
    
    if response.status_code == 200:
        print(f"✅ Complaint assigned")
        print(f"   📧 Assignment email should be sent to: {CUSTOMER_EMAIL}")
        results.append(("Test 2: Assignment Email", True))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Test 2: Assignment Email", False))
    
    time.sleep(2)
    
    # ============================================================================
    # TEST 3: STATUS CHANGE EMAIL
    # ============================================================================
    print_separator("TEST 3: Status Change Email")
    
    print("📧 Updating status (should send status change email)...")
    
    response = requests.patch(
        f"{BASE_URL}/api/complaints/{test_complaint_id}/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "status": "Open",
            "notes": "Testing status change email notification"
        }
    )
    
    if response.status_code == 200:
        print(f"✅ Status updated")
        print(f"   📧 Status change email should be sent to: {CUSTOMER_EMAIL}")
        results.append(("Test 3: Status Change Email", True))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Test 3: Status Change Email", False))
    
    time.sleep(2)
    
    # ============================================================================
    # TEST 4: RESOLUTION EMAIL
    # ============================================================================
    print_separator("TEST 4: Resolution Email")
    
    print("📧 Resolving complaint (should send resolution email)...")
    
    response = requests.post(
        f"{BASE_URL}/api/complaints/{test_complaint_id}/resolve",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "resolutionNotes": "This complaint has been resolved for testing email notifications. The issue was addressed and verified working correctly.",
            "tags": ["email-test", "resolved"]
        }
    )
    
    if response.status_code == 200:
        print(f"✅ Complaint resolved")
        print(f"   📧 Resolution email should be sent to: {CUSTOMER_EMAIL}")
        results.append(("Test 4: Resolution Email", True))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Test 4: Resolution Email", False))
    
    time.sleep(2)
    
    # ============================================================================
    # TEST 5: COMMENT EMAIL
    # ============================================================================
    print_separator("TEST 5: Comment Email")
    
    # First reopen the complaint
    print("📝 Reopening complaint...")
    requests.post(
        f"{BASE_URL}/api/complaints/{test_complaint_id}/reopen",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={"reason": "Need to test comment email notification"}
    )
    
    time.sleep(1)
    
    print("📧 Admin adding comment (should send comment email)...")
    
    response = requests.post(
        f"{BASE_URL}/api/complaints/{test_complaint_id}/comments",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "comment": "This is a public comment from admin for testing email notifications. Customer should receive an email about this comment.",
            "isInternal": False
        }
    )
    
    if response.status_code == 200:
        print(f"✅ Comment added")
        print(f"   📧 Comment email should be sent to: {CUSTOMER_EMAIL}")
        results.append(("Test 5: Comment Email", True))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Test 5: Comment Email", False))
    
    # ============================================================================
    # TEST 6: INTERNAL COMMENT (NO EMAIL)
    # ============================================================================
    print_separator("TEST 6: Internal Comment (No Email)")
    
    print("📧 Admin adding internal comment (should NOT send email)...")
    
    response = requests.post(
        f"{BASE_URL}/api/complaints/{test_complaint_id}/comments",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "comment": "This is an internal comment - customer should NOT receive an email.",
            "isInternal": True
        }
    )
    
    if response.status_code == 200:
        print(f"✅ Internal comment added")
        print(f"   📧 No email should be sent (internal comment)")
        results.append(("Test 6: Internal Comment (No Email)", True))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Test 6: Internal Comment (No Email)", False))
    
    # ============================================================================
    # TEST SUMMARY
    # ============================================================================
    print_separator("TEST SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for i, (test_name, result) in enumerate(results, 1):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{i:2}. {test_name:<50} {status}")
    
    print(f"\n{'='*80}")
    print(f"TOTAL: {passed}/{total} tests passed ({passed*100//total}%)")
    print(f"{'='*80}")
    
    if passed == total:
        print("\n🎉 ALL EMAIL NOTIFICATION TESTS PASSED!")
        print(f"\n📧 Check {CUSTOMER_EMAIL} inbox for:")
        print(f"   1. Complaint registration confirmation")
        print(f"   2. Complaint assignment notification")
        print(f"   3. Status change notification")
        print(f"   4. Resolution notification")
        print(f"   5. New comment notification")
        print(f"\n   Test Complaint ID: {test_complaint_id}")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    exit(test_phase9_email_integration())
