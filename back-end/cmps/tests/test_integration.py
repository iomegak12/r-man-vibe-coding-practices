"""
Comprehensive Integration Tests
Tests all CMPS phases end-to-end
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import requests
import json

# Test configuration
BASE_URL = "http://localhost:5004"
AUTH_URL = "http://localhost:5001"

# Test credentials
CUSTOMER_EMAIL = "orms.test@example.com"
CUSTOMER_PASSWORD = "TestPass@123"
ADMIN_EMAIL = "jtdhamodharan@gmail.com"
ADMIN_PASSWORD = "Madurai54321!"

# Global test state
test_complaint_id = None
test_comment_id = None


def login(email, password):
    """Login and get JWT token"""
    response = requests.post(
        f"{AUTH_URL}/api/auth/login",
        json={"email": email, "password": password}
    )
    
    if response.status_code == 200:
        data = response.json()
        return data["data"]["accessToken"]
    return None


def print_separator(title=""):
    """Print a section separator"""
    print("\n" + "=" * 80)
    if title:
        print(title.center(80))
        print("=" * 80)


def main():
    """Run comprehensive integration tests"""
    global test_complaint_id, test_comment_id
    
    print("\n")
    print("╔" + "=" * 78 + "╗")
    print("║" + " CMPS COMPREHENSIVE INTEGRATION TESTS ".center(78) + "║")
    print("╚" + "=" * 78 + "╝")
    
    results = []
    
    # ============================================================================
    # PHASE 3: COMPLAINT CREATION
    # ============================================================================
    print_separator("PHASE 3: COMPLAINT CREATION")
    
    customer_token = login(CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
    admin_token = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    
    if not customer_token or not admin_token:
        print("❌ Failed to login")
        return
    
    print(f"✅ Logged in as customer and admin")
    
    # Get customer's order
    import requests as r
    orders_response = r.get(
        f"http://localhost:5003/api/orders/me?page=1&page_size=1",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    
    order_id = None
    if orders_response.status_code == 200:
        orders = orders_response.json().get("items", [])
        if orders:
            order_id = orders[0]["orderId"]
    
    # Create complaint
    print("\n📝 Creating order-linked complaint...")
    response = requests.post(
        f"{BASE_URL}/api/complaints",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={
            "orderId": order_id if order_id else None,
            "category": "Product Quality",
            "subject": "Integration test complaint - Full workflow test",
            "description": "This is a comprehensive integration test for the complaint management system covering all phases from creation to closure.",
            "priority": "High",
            "tags": ["integration-test", "automated"]
        }
    )
    
    if response.status_code == 201:
        data = response.json()
        test_complaint_id = data["data"]["complaintId"]
        print(f"✅ Created complaint: {test_complaint_id}")
        results.append(("Phase 3: Create Complaint", True))
    else:
        print(f"❌ Failed to create complaint: {response.status_code}")
        results.append(("Phase 3: Create Complaint", False))
        return
    
    # ============================================================================
    # PHASE 4: COMPLAINT RETRIEVAL
    # ============================================================================
    print_separator("PHASE 4: COMPLAINT RETRIEVAL")
    
    # Customer retrieves own complaints
    print("\n📋 Customer retrieving own complaints...")
    response = requests.get(
        f"{BASE_URL}/api/complaints/me",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    
    if response.status_code == 200:
        count = len(response.json()["data"]["complaints"])
        print(f"✅ Retrieved {count} complaints")
        results.append(("Phase 4: Get My Complaints", True))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Phase 4: Get My Complaints", False))
    
    # Get specific complaint
    print(f"\n📋 Getting complaint details: {test_complaint_id}")
    response = requests.get(
        f"{BASE_URL}/api/complaints/{test_complaint_id}",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    
    if response.status_code == 200:
        print(f"✅ Retrieved complaint details")
        results.append(("Phase 4: Get Complaint by ID", True))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Phase 4: Get Complaint by ID", False))
    
    # Admin search
    print(f"\n🔍 Admin searching for complaint: {test_complaint_id}")
    response = requests.get(
        f"{BASE_URL}/api/complaints/search?q={test_complaint_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    if response.status_code == 200 and response.json()["data"]["pagination"]["totalItems"] > 0:
        print(f"✅ Admin found complaint")
        results.append(("Phase 4: Admin Search", True))
    else:
        print(f"❌ Search failed")
        results.append(("Phase 4: Admin Search", False))
    
    # ============================================================================
    # PHASE 5: COMMENTS SYSTEM
    # ============================================================================
    print_separator("PHASE 5: COMMENTS SYSTEM")
    
    # Customer adds comment
    print("\n💬 Customer adding comment...")
    response = requests.post(
        f"{BASE_URL}/api/complaints/{test_complaint_id}/comments",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={
            "comment": "This is a test comment from the customer. Please look into this matter urgently."
        }
    )
    
    if response.status_code == 201:
        print(f"✅ Customer added comment")
        results.append(("Phase 5: Customer Add Comment", True))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Phase 5: Customer Add Comment", False))
    
    # Admin adds internal comment
    print("\n💬 Admin adding internal comment...")
    response = requests.post(
        f"{BASE_URL}/api/complaints/{test_complaint_id}/comments",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "comment": "INTERNAL NOTE: Escalating to product quality team. Customer has premium support plan.",
            "isInternal": True
        }
    )
    
    if response.status_code == 201:
        print(f"✅ Admin added internal comment")
        results.append(("Phase 5: Admin Internal Comment", True))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Phase 5: Admin Internal Comment", False))
    
    # Get comments
    print(f"\n📋 Retrieving comments...")
    response = requests.get(
        f"{BASE_URL}/api/complaints/{test_complaint_id}/comments",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    
    if response.status_code == 200:
        comments = response.json()["data"]["comments"]
        has_internal = any(c["isInternal"] for c in comments)
        if not has_internal:
            print(f"✅ Customer cannot see internal comments ({len(comments)} comments)")
            results.append(("Phase 5: Comment Filtering", True))
        else:
            print(f"❌ Security issue: Customer sees internal comments")
            results.append(("Phase 5: Comment Filtering", False))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Phase 5: Comment Filtering", False))
    
    # ============================================================================
    # PHASE 6: ADMIN ASSIGNMENT
    # ============================================================================
    print_separator("PHASE 6: ADMIN ASSIGNMENT")
    
    # Get admin user ID from JWT token payload (decode without verification)
    import base64
    try:
        # JWT format: header.payload.signature
        token_parts = admin_token.split('.')
        # Add padding if needed for base64 decoding
        payload = token_parts[1]
        payload += '=' * (4 - len(payload) % 4)
        decoded = base64.b64decode(payload)
        import json as json_lib
        admin_data = json_lib.loads(decoded)
        admin_user_id = admin_data.get("userId") or admin_data.get("sub")
        print(f"👤 Admin user ID: {admin_user_id}")
    except Exception as e:
        print(f"❌ Failed to decode admin token: {e}")
        admin_user_id = "admin-user-id"  # Fallback
    
    print(f"\n👤 Assigning complaint to admin...")
    response = requests.patch(
        f"{BASE_URL}/api/complaints/{test_complaint_id}/assign",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "assignTo": admin_user_id,
            "notes": "Assigning to myself for handling"
        }
    )
    
    if response.status_code == 200:
        data = response.json()["data"]
        print(f"✅ Complaint assigned (Status: {data['status']})")
        results.append(("Phase 6: Assign Complaint", True))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Phase 6: Assign Complaint", False))
    
    # ============================================================================
    # PHASE 8: STATUS/PRIORITY UPDATES
    # ============================================================================
    print_separator("PHASE 8: STATUS/PRIORITY UPDATES")
    
    # Update priority
    print(f"\n⚠️  Updating priority to Critical...")
    response = requests.patch(
        f"{BASE_URL}/api/complaints/{test_complaint_id}/priority",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "priority": "Critical",
            "notes": "Escalating priority due to premium customer"
        }
    )
    
    if response.status_code == 200:
        print(f"✅ Priority updated to Critical")
        results.append(("Phase 8: Update Priority", True))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Phase 8: Update Priority", False))
    
    # Update status
    print(f"\n📊 Updating status to Open...")
    response = requests.patch(
        f"{BASE_URL}/api/complaints/{test_complaint_id}/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "status": "Open",
            "notes": "Setting back to Open for further investigation"
        }
    )
    
    if response.status_code == 200:
        print(f"✅ Status updated to Open")
        results.append(("Phase 8: Update Status", True))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Phase 8: Update Status", False))
    
    # ============================================================================
    # PHASE 7: RESOLUTION WORKFLOW
    # ============================================================================
    print_separator("PHASE 7: RESOLUTION WORKFLOW")
    
    # Resolve complaint
    print(f"\n✅ Resolving complaint...")
    response = requests.post(
        f"{BASE_URL}/api/complaints/{test_complaint_id}/resolve",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "resolutionNotes": "Issue has been thoroughly investigated. Root cause identified as a manufacturing defect in batch B-2026-Q1. Full refund processed and replacement order created with expedited shipping. Customer will receive replacement within 2 business days.",
            "tags": ["refund-processed", "replacement-sent", "quality-issue"]
        }
    )
    
    if response.status_code == 200:
        print(f"✅ Complaint resolved")
        results.append(("Phase 7: Resolve Complaint", True))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Phase 7: Resolve Complaint", False))
    
    # Reopen complaint
    print(f"\n🔄 Customer reopening complaint...")
    response = requests.post(
        f"{BASE_URL}/api/complaints/{test_complaint_id}/reopen",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={
            "reason": "The replacement product has not arrived yet after 5 days, despite promised 2-day delivery."
        }
    )
    
    if response.status_code == 200:
        data = response.json()["data"]
        print(f"✅ Complaint reopened (Count: {data['reopenedCount']})")
        results.append(("Phase 7: Reopen Complaint", True))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Phase 7: Reopen Complaint", False))
    
    # Resolve again
    print(f"\n✅ Resolving complaint again...")
    response = requests.post(
        f"{BASE_URL}/api/complaints/{test_complaint_id}/resolve",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "resolutionNotes": "Sincere apologies for the delay. Shipment was held at customs. We have expedited clearance and the package will be delivered tomorrow. As compensation, we have issued a 20% discount code for your next purchase.",
            "tags": ["shipping-delay", "compensation-provided"]
        }
    )
    
    if response.status_code == 200:
        print(f"✅ Complaint resolved again")
        results.append(("Phase 7: Resolve Again", True))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Phase 7: Resolve Again", False))
    
    # Close complaint
    print(f"\n🔒 Admin closing complaint...")
    response = requests.post(
        f"{BASE_URL}/api/complaints/{test_complaint_id}/close",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "notes": "Complaint successfully resolved. Customer confirmed receipt of replacement product. Case closed."
        }
    )
    
    if response.status_code == 200:
        print(f"✅ Complaint closed")
        results.append(("Phase 7: Close Complaint", True))
    else:
        print(f"❌ Failed: {response.status_code}")
        results.append(("Phase 7: Close Complaint", False))
    
    # ============================================================================
    # VERIFICATION: GET FINAL STATE
    # ============================================================================
    print_separator("FINAL VERIFICATION")
    
    print(f"\n📋 Getting final complaint state...")
    response = requests.get(
        f"{BASE_URL}/api/complaints/{test_complaint_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    if response.status_code == 200:
        complaint = response.json()["data"]
        print(f"\n📝 Final Complaint State:")
        print(f"   ID: {complaint['complaintId']}")
        print(f"   Status: {complaint['status']}")
        print(f"   Priority: {complaint['priority']}")
        print(f"   Assigned To: {complaint.get('assignedTo', 'N/A')}")
        print(f"   Reopened Count: {complaint.get('reopenedCount', 0)}")
        print(f"   Resolved By: {complaint.get('resolvedByName', 'N/A')}")
        print(f"   Closed By: {complaint.get('closedByName', 'N/A')}")
        
        if complaint['status'] == 'Closed' and complaint.get('reopenedCount') == 1:
            print(f"\n✅ Workflow completed successfully!")
            results.append(("Final State Verification", True))
        else:
            print(f"\n⚠️ Unexpected final state")
            results.append(("Final State Verification", False))
    else:
        print(f"❌ Failed to get final state")
        results.append(("Final State Verification", False))
    
    # ============================================================================
    # RESULTS SUMMARY
    # ============================================================================
    print_separator("TEST SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for i, (test_name, result) in enumerate(results, 1):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{i:2}. {test_name:<40} {status}")
    
    print(f"\n{'=' * 80}")
    print(f"TOTAL: {passed}/{total} tests passed ({passed*100//total}%)")
    print(f"{'=' * 80}")
    
    if passed == total:
        print(f"\n🎉 ALL PHASES VERIFIED SUCCESSFULLY!")
        print(f"   Test Complaint ID: {test_complaint_id}")
    else:
        print(f"\n⚠️ {total - passed} test(s) failed")
    
    print()
    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
