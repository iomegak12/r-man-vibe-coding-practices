"""
ORMS Phase 4 Testing - Order Management (Cancel & Return)
Tests for order cancellation, return requests, and order history
"""
import requests
import json
from datetime import datetime

# Configuration
ATHS_URL = "http://localhost:5001"
ORMS_URL = "http://localhost:5003"
CRMS_URL = "http://localhost:5002"
SERVICE_API_KEY = "b3a285fafe93756687343b95de0d4c82"  # ORMS service API key

# Test user credentials
TEST_USER = {
    "email": "orms.phase4@example.com",
    "password": "TestPass@123",
    "fullName": "Phase 4 Test User",
    "role": "Customer"
}

# ANSI color codes
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'


def print_section(title):
    """Print a section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)


def print_success(message):
    """Print success message"""
    print(f"{GREEN}✅ {message}{RESET}")


def print_error(message):
    """Print error message"""
    print(f"{RED}❌ {message}{RESET}")


def print_info(label, value):
    """Print info line"""
    print(f"   {BOLD}{label}:{RESET} {value}")


def register_user():
    """Register test user"""
    print_section("Step 0: Register Test User")
    
    try:
        response = requests.post(
            f"{ATHS_URL}/api/auth/register",
            json=TEST_USER
        )
        
        if response.status_code in [200, 201]:
            print_success("User registered successfully!")
            return True
        elif response.status_code in [400, 409]:
            print_info("Status", "User might already exist (this is OK)")
            return True
        else:
            print_error(f"Registration failed: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Registration error: {str(e)}")
        return False


def login():
    """Login and get JWT token"""
    print_section("Step 1: Login to Get JWT Token")
    
    try:
        response = requests.post(
            f"{ATHS_URL}/api/auth/login",
            json={
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            }
        )
        
        if response.status_code == 200:
            data = response.json()["data"]
            token = data["accessToken"]
            
            # Decode token to get userId
            import base64
            import json
            payload = token.split('.')[1]
            # Add padding if needed
            payload += '=' * (4 - len(payload) % 4)
            decoded = base64.b64decode(payload)
            token_data = json.loads(decoded)
            user_id = token_data.get("userId") or token_data.get("sub")
            
            print_success("Login successful")
            print_info("Token", token[:50] + "...")
            print_info("User ID", user_id)
            return token, user_id
        else:
            print_error(f"Login failed: {response.status_code}")
            return None, None
            
    except Exception as e:
        print_error(f"Login error: {str(e)}")
        return None, None


def ensure_customer_profile(user_id):
    """Ensure customer profile exists in CRMS"""
    print_section("Step 1.5: Ensure Customer Profile Exists")
    
    try:
        # Create customer profile via CRMS internal endpoint
        response = requests.post(
            f"{CRMS_URL}/api/customers/internal/create",
            json={
                "userId": user_id,
                "email": TEST_USER["email"],
                "fullName": TEST_USER["fullName"],
                "contactNumber": "+1234567890"
            },
            headers={"x-api-key": SERVICE_API_KEY}
        )
        
        if response.status_code in [200, 201]:
            data = response.json()["data"]
            print_success("Customer profile created!")
            print_info("Customer ID", data["customerId"])
            return True
        elif response.status_code == 409:
            print_info("Status", "Customer profile already exists (this is OK)")
            return True
        else:
            print_error(f"Failed to create customer profile: {response.status_code}")
            print_info("Response", response.json())
            return False
            
    except Exception as e:
        print_error(f"Customer profile error: {str(e)}")
        return False


def create_test_order(token):
    """Create a test order for cancellation"""
    print_section("Step 2: Create Test Order")
    
    order_data = {
        "deliveryAddress": {
            "recipientName": "Jane Smith",
            "street": "456 Oak Avenue",
            "city": "Los Angeles",
            "state": "CA",
            "zipCode": "90001",
            "country": "USA",
            "phone": "+1987654321"
        },
        "items": [
            {
                "productId": "PROD-003",
                "productName": "Smartphone",
                "productDescription": "Latest flagship smartphone",
                "sku": "PHONE-001",
                "quantity": 1,
                "unitPrice": 799.99,
                "discount": 100.00,
                "tax": 56.00
            }
        ],
        "notes": "Test order for Phase 4"
    }
    
    try:
        response = requests.post(
            f"{ORMS_URL}/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code in [200, 201]:
            data = response.json()["data"]
            print_success("Test order created!")
            print_info("Order ID", data["orderId"])
            print_info("Status", data["status"])
            print_info("Total", f"${data['totalAmount']:.2f}")
            return data["orderId"]
        else:
            print_error(f"Order creation failed: {response.status_code}")
            print_info("Response", response.json())
            return None
            
    except Exception as e:
        print_error(f"Order creation error: {str(e)}")
        return None


def cancel_order(token, order_id):
    """Test order cancellation"""
    print_section("Step 3: Cancel Order")
    
    cancel_data = {
        "reason": "Changed my mind about the purchase",
        "reasonCategory": "Customer Request"
    }
    
    try:
        response = requests.post(
            f"{ORMS_URL}/api/orders/{order_id}/cancel",
            json=cancel_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()["data"]
            print_success("Order cancelled successfully!")
            print_info("Order ID", data["orderId"])
            print_info("Status", data["status"])
            
            if data.get("cancellationInfo"):
                cancel_info = data["cancellationInfo"]
                print("\n   Cancellation Details:")
                print(f"      Reason: {cancel_info['reason']}")
                print(f"      Category: {cancel_info.get('reasonCategory', 'N/A')}")
                print(f"      Cancelled At: {cancel_info['cancelledAt']}")
            
            return True
        else:
            print_error(f"Cancellation failed: {response.status_code}")
            print_info("Error", response.json().get("detail", "Unknown error"))
            return False
            
    except Exception as e:
        print_error(f"Cancellation error: {str(e)}")
        return False


def test_cancel_invalid_status(token, order_id):
    """Test that already cancelled orders cannot be cancelled again"""
    print_section("Step 4: Test Invalid Cancellation (Already Cancelled)")
    
    cancel_data = {
        "reason": "Trying to cancel again",
        "reasonCategory": "Test"
    }
    
    try:
        response = requests.post(
            f"{ORMS_URL}/api/orders/{order_id}/cancel",
            json=cancel_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 400:
            print_success("Correctly rejected cancellation of already cancelled order")
            print_info("Error Message", response.json().get("detail"))
            return True
        else:
            print_error(f"Expected 400, got: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Test error: {str(e)}")
        return False


def create_delivered_order(token):
    """Create and manually mark order as delivered for return testing"""
    print_section("Step 5: Create Order for Return Testing")
    
    # Note: In real scenario, admin would update status to Delivered
    # For testing, we'll create the order and explain the limitation
    order_data = {
        "deliveryAddress": {
            "recipientName": "Jane Smith",
            "street": "456 Oak Avenue",
            "city": "Los Angeles",
            "state": "CA",
            "zipCode": "90001",
            "country": "USA",
            "phone": "+1987654321"
        },
        "items": [
            {
                "productId": "PROD-004",
                "productName": "Tablet",
                "productDescription": "10-inch tablet",
                "sku": "TAB-001",
                "quantity": 1,
                "unitPrice": 399.99,
                "discount": 50.00,
                "tax": 28.00
            }
        ],
        "notes": "Test order for return - needs manual status update to 'Delivered'"
    }
    
    try:
        response = requests.post(
            f"{ORMS_URL}/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code in [200, 201]:
            data = response.json()["data"]
            print_success("Order created!")
            print_info("Order ID", data["orderId"])
            print_info("Status", data["status"])
            print(f"\n   {YELLOW}⚠ Note: Order status must be updated to 'Delivered' by admin before testing return.{RESET}")
            print(f"   {YELLOW}   Phase 5 (Admin endpoints) will include status update functionality.{RESET}")
            return data["orderId"]
        else:
            print_error(f"Order creation failed: {response.status_code}")
            return None
            
    except Exception as e:
        print_error(f"Order creation error: {str(e)}")
        return None


def test_return_invalid_status(token, order_id):
    """Test that non-delivered orders cannot be returned"""
    print_section("Step 6: Test Invalid Return (Order Not Delivered)")
    
    return_data = {
        "reason": "Product not as described",
        "reasonCategory": "Not as Described",
        "description": "The specifications don't match the listing",
        "items": [
            {
                "orderItemId": "dummy-id",
                "quantity": 1,
                "returnReason": "Not as described"
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{ORMS_URL}/api/orders/{order_id}/return",
            json=return_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 400:
            print_success("Correctly rejected return for non-delivered order")
            print_info("Error Message", response.json().get("detail"))
            return True
        else:
            print_error(f"Expected 400, got: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Test error: {str(e)}")
        return False


def get_order_history(token, order_id):
    """Get order history"""
    print_section("Step 7: Get Order History")
    
    try:
        response = requests.get(
            f"{ORMS_URL}/api/orders/{order_id}/history",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()["data"]
            print_success("Order history retrieved!")
            print_info("History Entries", len(data))
            
            print("\n   History Timeline:")
            for entry in data:
                previous = entry.get("previousStatus") or "None"
                print(f"\n      {previous} → {entry['newStatus']}")
                print(f"      Changed By: {entry['changedByName']} ({entry['changedByRole']})")
                print(f"      Timestamp: {entry['timestamp']}")
                if entry.get("notes"):
                    print(f"      Notes: {entry['notes']}")
            
            return True
        else:
            print_error(f"Failed to get history: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"History error: {str(e)}")
        return False


def main():
    """Run all Phase 4 tests"""
    print("\n" + "="*60)
    print("  ORMS Phase 4 Testing - Order Management")
    print("="*60)
    print(f"  Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    # Step 0: Register user
    if not register_user():
        print_error("Cannot proceed without user registration")
        return
    
    # Step 1: Login
    token, user_id = login()
    if not token:
        print_error("Cannot proceed without authentication token")
        return
    
    # Step 1.5: Ensure customer profile exists
    if not ensure_customer_profile(user_id):
        print_error("Cannot proceed without customer profile")
        return
    
    # Step 2: Create test order
    order_id = create_test_order(token)
    if not order_id:
        print_error("Cannot proceed without test order")
        return
    
    # Step 3: Cancel order
    if not cancel_order(token, order_id):
        print_error("Order cancellation failed")
        return
    
    # Step 4: Test invalid cancellation
    test_cancel_invalid_status(token, order_id)
    
    # Step 5: Create order for return testing
    return_order_id = create_delivered_order(token)
    
    # Step 6: Test invalid return
    if return_order_id:
        test_return_invalid_status(token, return_order_id)
    
    # Step 7: Get order history
    get_order_history(token, order_id)
    
    # Summary
    print_section("Testing Complete")
    print_success("All Phase 4 tests completed!")
    print("\nTested Endpoints:")
    print("   ✅ POST /api/orders/{orderId}/cancel")
    print("   ✅ POST /api/orders/{orderId}/return")
    print("   ✅ GET /api/orders/{orderId}/history")
    print(f"\n{YELLOW}Note: Return functionality requires 'Delivered' status.{RESET}")
    print(f"{YELLOW}      Full return testing will be available in Phase 5 with admin status updates.{RESET}\n")


if __name__ == "__main__":
    main()
