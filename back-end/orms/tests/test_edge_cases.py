"""
Additional test scenarios for ORMS Phase 3
Tests edge cases and error handling
"""
import requests
import json

# Base URLs
ATHS_URL = "http://localhost:5001"
ORMS_URL = "http://localhost:5003"

# Test user credentials
TEST_USER = {
    "email": "orms.test@example.com",
    "password": "TestPass@123"
}


def print_test(test_name):
    """Print test name"""
    print(f"\n{'─'*60}")
    print(f"  Test: {test_name}")
    print(f"{'─'*60}")


def print_result(passed, message):
    """Print test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {message}")


def get_token():
    """Login and get token"""
    response = requests.post(
        f"{ATHS_URL}/api/auth/login",
        json=TEST_USER
    )
    if response.status_code == 200:
        return response.json()["data"]["accessToken"]
    return None


def test_create_order_without_auth():
    """Test creating order without authentication"""
    print_test("Create order without authentication")
    
    order_data = {
        "deliveryAddress": {
            "recipientName": "Test User",
            "street": "123 Test St",
            "city": "Test City",
            "state": "TS",
            "zipCode": "12345",
            "country": "USA",
            "phone": "+1234567890"
        },
        "items": [
            {
                "productId": "PROD-001",
                "productName": "Test Product",
                "sku": "TST-001",
                "quantity": 1,
                "unitPrice": 100.00
            }
        ]
    }
    
    response = requests.post(f"{ORMS_URL}/api/orders", json=order_data)
    
    passed = response.status_code == 401
    print_result(passed, f"Expected 401, got {response.status_code}")
    if passed:
        print(f"   Message: {response.json().get('message', 'N/A')}")


def test_create_order_empty_items():
    """Test creating order with no items"""
    print_test("Create order with empty items array")
    
    token = get_token()
    if not token:
        print_result(False, "Failed to get auth token")
        return
    
    order_data = {
        "deliveryAddress": {
            "recipientName": "Test User",
            "street": "123 Test St",
            "city": "Test City",
            "state": "TS",
            "zipCode": "12345",
            "country": "USA",
            "phone": "+1234567890"
        },
        "items": []
    }
    
    response = requests.post(
        f"{ORMS_URL}/api/orders",
        json=order_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    passed = response.status_code == 400
    print_result(passed, f"Expected 400, got {response.status_code}")
    if response.status_code >= 400:
        print(f"   Message: {response.json().get('message', 'N/A')}")


def test_create_order_invalid_address():
    """Test creating order with missing address fields"""
    print_test("Create order with invalid delivery address")
    
    token = get_token()
    if not token:
        print_result(False, "Failed to get auth token")
        return
    
    order_data = {
        "deliveryAddress": {
            "recipientName": "Test User",
            "street": "123 Test St"
            # Missing required fields
        },
        "items": [
            {
                "productId": "PROD-001",
                "productName": "Test Product",
                "sku": "TST-001",
                "quantity": 1,
                "unitPrice": 100.00
            }
        ]
    }
    
    response = requests.post(
        f"{ORMS_URL}/api/orders",
        json=order_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    passed = response.status_code == 422
    print_result(passed, f"Expected 422 (validation error), got {response.status_code}")
    if response.status_code >= 400:
        print(f"   Message: {response.json().get('message', 'N/A')}")


def test_get_orders_with_status_filter():
    """Test getting orders filtered by status"""
    print_test("Get orders filtered by status='Placed'")
    
    token = get_token()
    if not token:
        print_result(False, "Failed to get auth token")
        return
    
    response = requests.get(
        f"{ORMS_URL}/api/orders/me",
        params={"page": 1, "page_size": 10, "status": "Placed"},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    passed = response.status_code == 200
    print_result(passed, f"Expected 200, got {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        total = data["data"]["pagination"]["total"]
        print(f"   Found {total} order(s) with status 'Placed'")
        
        # Verify all orders have status "Placed"
        all_placed = all(item["status"] == "Placed" for item in data["data"]["items"])
        print_result(all_placed, f"All orders have status 'Placed': {all_placed}")


def test_get_orders_with_search():
    """Test getting orders with search query"""
    print_test("Get orders with search query")
    
    token = get_token()
    if not token:
        print_result(False, "Failed to get auth token")
        return
    
    response = requests.get(
        f"{ORMS_URL}/api/orders/me",
        params={"page": 1, "page_size": 10, "search": "ORD"},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    passed = response.status_code == 200
    print_result(passed, f"Expected 200, got {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        total = data["data"]["pagination"]["total"]
        print(f"   Found {total} order(s) matching 'ORD'")


def test_get_nonexistent_order():
    """Test getting details of non-existent order"""
    print_test("Get details of non-existent order")
    
    token = get_token()
    if not token:
        print_result(False, "Failed to get auth token")
        return
    
    response = requests.get(
        f"{ORMS_URL}/api/orders/ORD-9999-999999",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    passed = response.status_code == 404
    print_result(passed, f"Expected 404, got {response.status_code}")
    if response.status_code >= 400:
        print(f"   Message: {response.json().get('message', 'N/A')}")


def test_pagination():
    """Test pagination with different page sizes"""
    print_test("Test pagination with page_size=2")
    
    token = get_token()
    if not token:
        print_result(False, "Failed to get auth token")
        return
    
    # Get first page with page_size=2
    response1 = requests.get(
        f"{ORMS_URL}/api/orders/me",
        params={"page": 1, "page_size": 2},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Get second page with page_size=2
    response2 = requests.get(
        f"{ORMS_URL}/api/orders/me",
        params={"page": 2, "page_size": 2},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response1.status_code == 200:
        data1 = response1.json()
        total = data1["data"]["pagination"]["total"]
        page1_count = len(data1["data"]["items"])
        
        print_result(True, f"Page 1 retrieved with {page1_count} items")
        print(f"   Total orders: {total}")
        print(f"   Total pages: {data1['data']['pagination']['totalPages']}")
        
        if response2.status_code == 200 and total > 2:
            data2 = response2.json()
            page2_count = len(data2["data"]["items"])
            print_result(True, f"Page 2 retrieved with {page2_count} items")
        elif total <= 2:
            print_result(True, "Only one page of results exists")
    else:
        print_result(False, f"Failed to get orders: {response1.status_code}")


def main():
    """Run all edge case tests"""
    print("\n" + "="*60)
    print("  ORMS Phase 3 - Edge Cases & Error Handling Tests")
    print("="*60)
    
    test_create_order_without_auth()
    test_create_order_empty_items()
    test_create_order_invalid_address()
    test_get_orders_with_status_filter()
    test_get_orders_with_search()
    test_get_nonexistent_order()
    test_pagination()
    
    print("\n" + "="*60)
    print("  Edge Case Testing Complete")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
