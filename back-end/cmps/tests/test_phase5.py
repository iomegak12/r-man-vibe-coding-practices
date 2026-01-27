"""
Phase 5: Comments System Tests
Tests for adding and retrieving comments on complaints
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


def print_separator(title=""):
    """Print a section separator"""
    print("\n" + "=" * 80)
    if title:
        print(title.center(80))
        print("=" * 80)
    print()


def test_customer_add_comment_to_own_complaint():
    """Test: Customer adds comment to their own complaint"""
    print_separator("TEST 1: CUSTOMER ADD COMMENT TO OWN COMPLAINT")
    
    # Login as customer
    token = login(CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
    if not token:
        print("❌ Failed to login as customer")
        return False
    
    print(f"✅ Logged in as customer: {CUSTOMER_EMAIL}")
    
    # First get a complaint from the customer
    response = requests.get(
        f"{BASE_URL}/api/complaints/me?limit=1",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 200:
        print("❌ Failed to get customer complaints")
        return False
    
    data = response.json()
    complaints = data.get("data", {}).get("complaints", [])
    
    if not complaints:
        print("⚠️ No complaints found for customer")
        return False
    
    complaint_id = complaints[0].get("complaintId")
    print(f"\n📋 Adding comment to complaint: {complaint_id}")
    
    # Add comment
    response = requests.post(
        f"{BASE_URL}/api/complaints/{complaint_id}/comments",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "comment": "I would like to know the current status of my complaint. Has there been any progress?",
            "isInternal": False
        }
    )
    
    print(f"📋 Status Code: {response.status_code}")
    
    if response.status_code == 201:
        data = response.json()
        comment = data.get("data", {})
        
        print(f"✅ SUCCESS: Comment added")
        print(f"\n📝 Comment Details:")
        print(f"   Comment ID: {comment.get('commentId')}")
        print(f"   Complaint ID: {comment.get('complaintId')}")
        print(f"   User: {comment.get('userName')} ({comment.get('userRole')})")
        print(f"   Comment: {comment.get('comment')[:60]}...")
        print(f"   Internal: {comment.get('isInternal')}")
        print(f"   Created: {comment.get('createdAt')}")
        
        return True
    else:
        print(f"❌ FAILED: {response.status_code}")
        print(response.text)
        return False


def test_customer_cannot_comment_on_others_complaint():
    """Test: Customer cannot comment on another customer's complaint"""
    print_separator("TEST 2: CUSTOMER BLOCKED FROM COMMENTING ON OTHERS' COMPLAINTS")
    
    # Login as admin to get a complaint from different customer
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
    
    # Now login as test customer and try to comment
    customer_token = login(CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
    if not customer_token:
        print("❌ Failed to login as customer")
        return False
    
    print(f"\n🔍 Test customer ({test_customer_email}) attempting to comment")
    print(f"   on complaint {other_complaint_id}")
    
    response = requests.post(
        f"{BASE_URL}/api/complaints/{other_complaint_id}/comments",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={
            "comment": "This should fail - commenting on another customer's complaint"
        }
    )
    
    print(f"📋 Status Code: {response.status_code}")
    
    if response.status_code == 403:
        print(f"✅ CORRECTLY BLOCKED!")
        print(f"   Message: You can only comment on your own complaints")
        return True
    elif response.status_code == 201:
        print(f"❌ SECURITY ISSUE: Customer can comment on other customers' complaints!")
        return False
    else:
        print(f"⚠️ Unexpected status code: {response.status_code}")
        print(response.text)
        return False


def test_customer_cannot_create_internal_comment():
    """Test: Customer cannot create internal comments"""
    print_separator("TEST 3: CUSTOMER BLOCKED FROM CREATING INTERNAL COMMENTS")
    
    # Login as customer
    token = login(CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
    if not token:
        print("❌ Failed to login as customer")
        return False
    
    print(f"✅ Logged in as customer: {CUSTOMER_EMAIL}")
    
    # Get a complaint from the customer
    response = requests.get(
        f"{BASE_URL}/api/complaints/me?limit=1",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 200 or not response.json().get("data", {}).get("complaints"):
        print("❌ Failed to get customer complaints")
        return False
    
    complaint_id = response.json()["data"]["complaints"][0].get("complaintId")
    
    print(f"\n🔍 Customer attempting to create internal comment")
    print(f"   on complaint {complaint_id}")
    
    # Try to add internal comment
    response = requests.post(
        f"{BASE_URL}/api/complaints/{complaint_id}/comments",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "comment": "This is supposed to be an internal comment",
            "isInternal": True
        }
    )
    
    print(f"📋 Status Code: {response.status_code}")
    
    if response.status_code == 403:
        print(f"✅ CORRECTLY BLOCKED!")
        print(f"   Message: Only administrators can create internal comments")
        return True
    elif response.status_code == 201:
        # Check if it was saved as non-internal
        data = response.json()
        comment = data.get("data", {})
        if not comment.get("isInternal"):
            print(f"✅ GOOD: Comment saved as non-internal despite request")
            return True
        else:
            print(f"❌ SECURITY ISSUE: Customer created internal comment!")
            return False
    else:
        print(f"⚠️ Unexpected status code: {response.status_code}")
        print(response.text)
        return False


def test_admin_add_comment_to_any_complaint():
    """Test: Admin can add comment to any complaint"""
    print_separator("TEST 4: ADMIN ADD COMMENT TO ANY COMPLAINT")
    
    # Login as admin
    token = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not token:
        print("❌ Failed to login as admin")
        return False
    
    print(f"✅ Logged in as admin: {ADMIN_EMAIL}")
    
    # Get any complaint
    response = requests.get(
        f"{BASE_URL}/api/complaints?limit=1",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 200:
        print("❌ Failed to get complaints")
        return False
    
    data = response.json()
    complaints = data.get("data", {}).get("complaints", [])
    
    if not complaints:
        print("⚠️ No complaints found")
        return False
    
    complaint_id = complaints[0].get("complaintId")
    customer_email = complaints[0].get("customerEmail")
    
    print(f"\n📋 Adding comment to complaint: {complaint_id}")
    print(f"   (belongs to: {customer_email})")
    
    # Add comment
    response = requests.post(
        f"{BASE_URL}/api/complaints/{complaint_id}/comments",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "comment": "We have received your complaint and are currently investigating the issue. We will update you shortly with our findings.",
            "isInternal": False
        }
    )
    
    print(f"📋 Status Code: {response.status_code}")
    
    if response.status_code == 201:
        data = response.json()
        comment = data.get("data", {})
        
        print(f"✅ SUCCESS: Admin added comment to any complaint")
        print(f"\n📝 Comment Details:")
        print(f"   Comment ID: {comment.get('commentId')}")
        print(f"   User: {comment.get('userName')} ({comment.get('userRole')})")
        print(f"   Comment: {comment.get('comment')[:60]}...")
        print(f"   Internal: {comment.get('isInternal')}")
        
        return True
    else:
        print(f"❌ FAILED: {response.status_code}")
        print(response.text)
        return False


def test_admin_add_internal_comment():
    """Test: Admin can add internal comments"""
    print_separator("TEST 5: ADMIN ADD INTERNAL COMMENT")
    
    # Login as admin
    token = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not token:
        print("❌ Failed to login as admin")
        return False
    
    print(f"✅ Logged in as admin: {ADMIN_EMAIL}")
    
    # Get any complaint
    response = requests.get(
        f"{BASE_URL}/api/complaints?limit=1",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 200 or not response.json().get("data", {}).get("complaints"):
        print("❌ Failed to get complaints")
        return False
    
    complaint_id = response.json()["data"]["complaints"][0].get("complaintId")
    
    print(f"\n📋 Adding internal comment to complaint: {complaint_id}")
    
    # Add internal comment
    response = requests.post(
        f"{BASE_URL}/api/complaints/{complaint_id}/comments",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "comment": "INTERNAL NOTE: This customer has a history of similar issues. Escalate to senior support team. Previous ticket reference: SUPP-2025-12345.",
            "isInternal": True
        }
    )
    
    print(f"📋 Status Code: {response.status_code}")
    
    if response.status_code == 201:
        data = response.json()
        comment = data.get("data", {})
        
        if comment.get("isInternal") == True:
            print(f"✅ SUCCESS: Admin created internal comment")
            print(f"\n📝 Comment Details:")
            print(f"   Comment ID: {comment.get('commentId')}")
            print(f"   User: {comment.get('userName')} ({comment.get('userRole')})")
            print(f"   Comment: {comment.get('comment')[:60]}...")
            print(f"   Internal: {comment.get('isInternal')}")
            return True
        else:
            print(f"❌ FAILED: Comment was not saved as internal")
            return False
    else:
        print(f"❌ FAILED: {response.status_code}")
        print(response.text)
        return False


def test_customer_get_comments_without_internal():
    """Test: Customer gets comments without seeing internal ones"""
    print_separator("TEST 6: CUSTOMER GET COMMENTS (NO INTERNAL)")
    
    # Login as customer
    token = login(CUSTOMER_EMAIL, CUSTOMER_PASSWORD)
    if not token:
        print("❌ Failed to login as customer")
        return False
    
    print(f"✅ Logged in as customer: {CUSTOMER_EMAIL}")
    
    # Get a complaint from the customer
    response = requests.get(
        f"{BASE_URL}/api/complaints/me?limit=1",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 200 or not response.json().get("data", {}).get("complaints"):
        print("❌ Failed to get customer complaints")
        return False
    
    complaint_id = response.json()["data"]["complaints"][0].get("complaintId")
    
    print(f"\n📋 Getting comments for complaint: {complaint_id}")
    
    # Get comments
    response = requests.get(
        f"{BASE_URL}/api/complaints/{complaint_id}/comments",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"📋 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        comments = data.get("data", {}).get("comments", [])
        pagination = data.get("data", {}).get("pagination", {})
        
        print(f"✅ SUCCESS: Retrieved {len(comments)} comments")
        print(f"\n📊 Pagination:")
        print(f"   Total Items: {pagination.get('totalItems')}")
        
        # Check that no internal comments are visible
        internal_comments = [c for c in comments if c.get("isInternal")]
        
        if internal_comments:
            print(f"❌ SECURITY ISSUE: Customer can see {len(internal_comments)} internal comments!")
            return False
        else:
            print(f"✅ SECURITY OK: No internal comments visible to customer")
        
        if comments:
            print(f"\n📝 Sample comment:")
            print(f"   User: {comments[0].get('userName')} ({comments[0].get('userRole')})")
            print(f"   Comment: {comments[0].get('comment')[:60]}...")
            print(f"   Internal: {comments[0].get('isInternal')}")
        
        return True
    else:
        print(f"❌ FAILED: {response.status_code}")
        print(response.text)
        return False


def test_admin_get_all_comments_including_internal():
    """Test: Admin gets all comments including internal"""
    print_separator("TEST 7: ADMIN GET ALL COMMENTS (INCLUDING INTERNAL)")
    
    # Login as admin
    token = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not token:
        print("❌ Failed to login as admin")
        return False
    
    print(f"✅ Logged in as admin: {ADMIN_EMAIL}")
    
    # Get any complaint that likely has comments
    response = requests.get(
        f"{BASE_URL}/api/complaints?limit=1",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 200 or not response.json().get("data", {}).get("complaints"):
        print("❌ Failed to get complaints")
        return False
    
    complaint_id = response.json()["data"]["complaints"][0].get("complaintId")
    
    print(f"\n📋 Getting all comments for complaint: {complaint_id}")
    
    # Get comments
    response = requests.get(
        f"{BASE_URL}/api/complaints/{complaint_id}/comments",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"📋 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        comments = data.get("data", {}).get("comments", [])
        pagination = data.get("data", {}).get("pagination", {})
        
        print(f"✅ SUCCESS: Retrieved {len(comments)} comments")
        print(f"\n📊 Pagination:")
        print(f"   Total Items: {pagination.get('totalItems')}")
        
        # Count internal and external comments
        internal_count = sum(1 for c in comments if c.get("isInternal"))
        external_count = len(comments) - internal_count
        
        print(f"\n📊 Comment Types:")
        print(f"   Public comments: {external_count}")
        print(f"   Internal comments: {internal_count}")
        
        if internal_count > 0:
            print(f"✅ Admin can see internal comments")
        else:
            print(f"⚠️ No internal comments in this complaint")
        
        if comments:
            print(f"\n📝 Sample comments:")
            for i, comment in enumerate(comments[:2], 1):
                internal_marker = "🔒 INTERNAL" if comment.get("isInternal") else "👤 PUBLIC"
                print(f"\n   {i}. {internal_marker}")
                print(f"      User: {comment.get('userName')} ({comment.get('userRole')})")
                print(f"      Comment: {comment.get('comment')[:50]}...")
        
        return True
    else:
        print(f"❌ FAILED: {response.status_code}")
        print(response.text)
        return False


def test_comment_pagination():
    """Test: Comments pagination works correctly"""
    print_separator("TEST 8: COMMENTS PAGINATION")
    
    # Login as admin
    token = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not token:
        print("❌ Failed to login as admin")
        return False
    
    print(f"✅ Logged in as admin: {ADMIN_EMAIL}")
    
    # Get any complaint
    response = requests.get(
        f"{BASE_URL}/api/complaints?limit=1",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 200 or not response.json().get("data", {}).get("complaints"):
        print("❌ Failed to get complaints")
        return False
    
    complaint_id = response.json()["data"]["complaints"][0].get("complaintId")
    
    print(f"\n📋 Testing pagination on complaint: {complaint_id}")
    
    # Get comments with limit=2
    response = requests.get(
        f"{BASE_URL}/api/complaints/{complaint_id}/comments?page=1&limit=2",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"📋 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        comments = data.get("data", {}).get("comments", [])
        pagination = data.get("data", {}).get("pagination", {})
        
        print(f"✅ Retrieved {len(comments)} comments (max 2)")
        print(f"\n📊 Pagination:")
        print(f"   Current Page: {pagination.get('currentPage')}")
        print(f"   Total Pages: {pagination.get('totalPages')}")
        print(f"   Total Items: {pagination.get('totalItems')}")
        print(f"   Items Per Page: {pagination.get('itemsPerPage')}")
        
        if len(comments) <= 2:
            print(f"✅ Pagination limiting works correctly")
            return True
        else:
            print(f"❌ Pagination not working - got {len(comments)} comments instead of max 2")
            return False
    else:
        print(f"❌ FAILED: {response.status_code}")
        print(response.text)
        return False


def main():
    """Run all Phase 5 tests"""
    print("\n")
    print("╔" + "=" * 78 + "╗")
    print("║" + " PHASE 5: COMMENTS SYSTEM TESTS ".center(78) + "║")
    print("╚" + "=" * 78 + "╝")
    
    tests = [
        ("Customer Add Comment to Own Complaint", test_customer_add_comment_to_own_complaint),
        ("Customer Blocked from Others' Complaints", test_customer_cannot_comment_on_others_complaint),
        ("Customer Blocked from Internal Comments", test_customer_cannot_create_internal_comment),
        ("Admin Add Comment to Any Complaint", test_admin_add_comment_to_any_complaint),
        ("Admin Add Internal Comment", test_admin_add_internal_comment),
        ("Customer Get Comments (No Internal)", test_customer_get_comments_without_internal),
        ("Admin Get All Comments (Including Internal)", test_admin_get_all_comments_including_internal),
        ("Comments Pagination", test_comment_pagination),
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
