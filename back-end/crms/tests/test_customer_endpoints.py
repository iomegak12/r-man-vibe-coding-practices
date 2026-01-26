"""
Test Script for CRMS Customer Profile and Admin Endpoints
==========================================================

This script tests all Phase 3 (Customer Profile) and Phase 4 (Admin Management) endpoints.

Prerequisites:
1. CRMS server running on http://localhost:5002
2. ATHS (Auth Service) running on http://localhost:5001
3. Valid credentials configured

Usage:
    python tests/test_customer_endpoints.py
"""

import requests
import json
from typing import Dict, Any, Optional
from datetime import datetime


# Configuration
BASE_URL = "http://localhost:5002"
AUTH_SERVICE_URL = "http://localhost:5001"

# Credentials
ADMIN_CREDENTIALS = {
    "email": "jtdhamodharan@gmail.com",
    "password": "Madurai54321!"
}

CUSTOMER_CREDENTIALS = {
    "email": "iomega.azure@gmail.com",
    "password": "Madurai54321!"
}

# Tokens (will be fetched automatically)
ADMIN_TOKEN = None
CUSTOMER_TOKEN = None
TEST_CUSTOMER_ID = None  # Will be set after getting customer profile


class Colors:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    BOLD = '\033[1m'
    END = '\033[0m'


def print_header(text: str):
    """Print a formatted header"""
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'=' * 80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text.center(80)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'=' * 80}{Colors.END}\n")


def print_test(test_name: str):
    """Print test name"""
    print(f"{Colors.BOLD}{Colors.BLUE}🧪 TEST: {test_name}{Colors.END}")


def print_success(message: str):
    """Print success message"""
    print(f"{Colors.GREEN}✅ PASS: {message}{Colors.END}")


def print_error(message: str):
    """Print error message"""
    print(f"{Colors.RED}❌ FAIL: {message}{Colors.END}")


def print_warning(message: str):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠️  WARNING: {message}{Colors.END}")


def print_info(message: str):
    """Print info message"""
    print(f"{Colors.MAGENTA}ℹ️  INFO: {message}{Colors.END}")


def print_response(response: requests.Response):
    """Print response details"""
    print(f"   Status Code: {response.status_code}")
    try:
        data = response.json()
        print(f"   Response: {json.dumps(data, indent=2)[:500]}")
    except:
        print(f"   Response: {response.text[:200]}")


def login_and_get_token(credentials: Dict[str, str], role_type: str) -> Optional[str]:
    """Login to ATHS and get JWT token"""
    print(f"  🔑 Logging in as {role_type} ({credentials['email']})...")
    
    try:
        response = requests.post(
            f"{AUTH_SERVICE_URL}/api/auth/login",
            json=credentials,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("data", {}).get("accessToken"):
                token = data["data"]["accessToken"]
                print(f"  ✅ {role_type.capitalize()} login successful")
                return token
            else:
                print_error(f"{role_type.capitalize()} login failed: No access token")
                return None
        else:
            print_error(f"{role_type.capitalize()} login failed: Status {response.status_code}")
            return None
            
    except Exception as e:
        print_error(f"{role_type.capitalize()} login error: {str(e)}")
        return None


def test_get(endpoint: str, token: str, expected_status: int = 200, test_name: str = "") -> tuple:
    """Test GET endpoint"""
    print_test(test_name or endpoint)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=5)
        print_response(response)
        
        if response.status_code != expected_status:
            print_error(f"Expected status {expected_status}, got {response.status_code}")
            return False, None
        
        print_success("Test passed")
        return True, response.json() if response.status_code == 200 else None
        
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False, None


def test_post(endpoint: str, token: str, data: dict, expected_status: int = 200, test_name: str = "") -> tuple:
    """Test POST endpoint"""
    print_test(test_name or endpoint)
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(f"{BASE_URL}{endpoint}", headers=headers, json=data, timeout=5)
        print_response(response)
        
        if response.status_code != expected_status:
            print_error(f"Expected status {expected_status}, got {response.status_code}")
            return False, None
        
        print_success("Test passed")
        return True, response.json() if response.status_code == 200 else None
        
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False, None


def test_put(endpoint: str, token: str, data: dict, expected_status: int = 200, test_name: str = "") -> tuple:
    """Test PUT endpoint"""
    print_test(test_name or endpoint)
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.put(f"{BASE_URL}{endpoint}", headers=headers, json=data, timeout=5)
        print_response(response)
        
        if response.status_code != expected_status:
            print_error(f"Expected status {expected_status}, got {response.status_code}")
            return False, None
        
        print_success("Test passed")
        return True, response.json() if response.status_code == 200 else None
        
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False, None


def test_patch(endpoint: str, token: str, data: dict, expected_status: int = 200, test_name: str = "") -> tuple:
    """Test PATCH endpoint"""
    print_test(test_name or endpoint)
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.patch(f"{BASE_URL}{endpoint}", headers=headers, json=data, timeout=5)
        print_response(response)
        
        if response.status_code != expected_status:
            print_error(f"Expected status {expected_status}, got {response.status_code}")
            return False, None
        
        print_success("Test passed")
        return True, response.json() if response.status_code == 200 else None
        
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False, None


def test_delete(endpoint: str, token: str, expected_status: int = 200, test_name: str = "") -> tuple:
    """Test DELETE endpoint"""
    print_test(test_name or endpoint)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.delete(f"{BASE_URL}{endpoint}", headers=headers, timeout=5)
        print_response(response)
        
        if response.status_code != expected_status:
            print_error(f"Expected status {expected_status}, got {response.status_code}")
            return False, None
        
        print_success("Test passed")
        return True, response.json() if response.status_code == 200 else None
        
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False, None


def main():
    """Run all tests"""
    global ADMIN_TOKEN, CUSTOMER_TOKEN, TEST_CUSTOMER_ID
    
    print_header(f"CRMS Customer Endpoints Tests - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Step 1: Login and get tokens
    print(f"\n{Colors.BOLD}{Colors.CYAN}Step 1: Fetching JWT Tokens{Colors.END}")
    print(f"  Auth Service URL: {AUTH_SERVICE_URL}")
    
    ADMIN_TOKEN = login_and_get_token(ADMIN_CREDENTIALS, "admin")
    CUSTOMER_TOKEN = login_and_get_token(CUSTOMER_CREDENTIALS, "customer")
    
    if not ADMIN_TOKEN or not CUSTOMER_TOKEN:
        print_error("\nFailed to obtain tokens. Cannot proceed with tests.")
        return
    
    print(f"\n{Colors.BOLD}Tokens obtained successfully!{Colors.END}")
    
    # Track test results
    total_tests = 0
    passed_tests = 0
    
    # ==================== PHASE 3: CUSTOMER PROFILE ENDPOINTS ====================
    
    print_header("PHASE 3: Customer Profile Endpoints")
    
    # Test 1: Get Own Profile (Customer)
    print_header("Test 1: GET /api/customers/me (Customer Token)")
    total_tests += 1
    success, response_data = test_get(
        "/api/customers/me",
        CUSTOMER_TOKEN,
        200,
        "Customer gets own profile"
    )
    if success:
        passed_tests += 1
        if response_data and response_data.get("data"):
            TEST_CUSTOMER_ID = response_data["data"].get("customerId")
            print_info(f"Customer ID captured: {TEST_CUSTOMER_ID}")
    
    # Test 2: Get Own Statistics (Customer)
    print_header("Test 2: GET /api/customers/me/statistics (Customer Token)")
    total_tests += 1
    success, _ = test_get(
        "/api/customers/me/statistics",
        CUSTOMER_TOKEN,
        200,
        "Customer gets own statistics"
    )
    if success:
        passed_tests += 1
    
    # Test 3: Get Own Profile (Admin)
    print_header("Test 3: GET /api/customers/me (Admin Token)")
    total_tests += 1
    success, _ = test_get(
        "/api/customers/me",
        ADMIN_TOKEN,
        200,
        "Admin gets own profile"
    )
    if success:
        passed_tests += 1
    
    # ==================== PHASE 4: ADMIN CUSTOMER MANAGEMENT ====================
    
    print_header("PHASE 4: Admin Customer Management Endpoints")
    
    # Test 4: List All Customers
    print_header("Test 4: GET /api/customers (Admin Token)")
    total_tests += 1
    success, _ = test_get(
        "/api/customers?page=1&limit=10",
        ADMIN_TOKEN,
        200,
        "Admin lists all customers"
    )
    if success:
        passed_tests += 1
    
    # Test 5: List with Filtering
    print_header("Test 5: GET /api/customers?status=Active (Admin Token)")
    total_tests += 1
    success, _ = test_get(
        "/api/customers?status=Active&page=1&limit=5",
        ADMIN_TOKEN,
        200,
        "Admin lists customers filtered by status"
    )
    if success:
        passed_tests += 1
    
    # Test 6: Search Customers
    print_header("Test 6: GET /api/customers/search (Admin Token)")
    total_tests += 1
    success, _ = test_get(
        "/api/customers/search?q=gmail",
        ADMIN_TOKEN,
        200,
        "Admin searches customers"
    )
    if success:
        passed_tests += 1
    
    # Test 7: Get Analytics
    print_header("Test 7: GET /api/customers/analytics (Admin Token)")
    total_tests += 1
    success, _ = test_get(
        "/api/customers/analytics",
        ADMIN_TOKEN,
        200,
        "Admin gets customer analytics"
    )
    if success:
        passed_tests += 1
    
    if TEST_CUSTOMER_ID:
        # Test 8: Get Customer Details
        print_header(f"Test 8: GET /api/customers/{TEST_CUSTOMER_ID} (Admin Token)")
        total_tests += 1
        success, _ = test_get(
            f"/api/customers/{TEST_CUSTOMER_ID}",
            ADMIN_TOKEN,
            200,
            "Admin gets specific customer details"
        )
        if success:
            passed_tests += 1
        
        # Test 9: Update Customer
        print_header(f"Test 9: PUT /api/customers/{TEST_CUSTOMER_ID} (Admin Token)")
        total_tests += 1
        update_data = {
            "fullName": "Updated Test Customer",
            "tags": ["test", "updated"]
        }
        success, _ = test_put(
            f"/api/customers/{TEST_CUSTOMER_ID}",
            ADMIN_TOKEN,
            update_data,
            200,
            "Admin updates customer profile"
        )
        if success:
            passed_tests += 1
        
        # Test 10: Update Customer Status
        print_header(f"Test 10: PATCH /api/customers/{TEST_CUSTOMER_ID}/status (Admin Token)")
        total_tests += 1
        status_data = {"status": "Active"}
        success, _ = test_patch(
            f"/api/customers/{TEST_CUSTOMER_ID}/status",
            ADMIN_TOKEN,
            status_data,
            200,
            "Admin updates customer status"
        )
        if success:
            passed_tests += 1
        
        # Test 11: Update Customer Type
        print_header(f"Test 11: PATCH /api/customers/{TEST_CUSTOMER_ID}/type (Admin Token)")
        total_tests += 1
        type_data = {"type": "Premium"}
        success, _ = test_patch(
            f"/api/customers/{TEST_CUSTOMER_ID}/type",
            ADMIN_TOKEN,
            type_data,
            200,
            "Admin updates customer type to Premium"
        )
        if success:
            passed_tests += 1
        
        # Test 12: Add Customer Notes
        print_header(f"Test 12: POST /api/customers/{TEST_CUSTOMER_ID}/notes (Admin Token)")
        total_tests += 1
        notes_data = {"notes": "Test note added by automated test script"}
        success, _ = test_post(
            f"/api/customers/{TEST_CUSTOMER_ID}/notes",
            ADMIN_TOKEN,
            notes_data,
            200,
            "Admin adds note to customer"
        )
        if success:
            passed_tests += 1
        
        # Test 13: Get Customer Orders (Placeholder)
        print_header(f"Test 13: GET /api/customers/{TEST_CUSTOMER_ID}/orders (Admin Token)")
        total_tests += 1
        success, _ = test_get(
            f"/api/customers/{TEST_CUSTOMER_ID}/orders",
            ADMIN_TOKEN,
            200,
            "Admin gets customer orders (placeholder)"
        )
        if success:
            passed_tests += 1
        
        # Test 14: Get Customer Complaints (Placeholder)
        print_header(f"Test 14: GET /api/customers/{TEST_CUSTOMER_ID}/complaints (Admin Token)")
        total_tests += 1
        success, _ = test_get(
            f"/api/customers/{TEST_CUSTOMER_ID}/complaints",
            ADMIN_TOKEN,
            200,
            "Admin gets customer complaints (placeholder)"
        )
        if success:
            passed_tests += 1
        
        # Test 15: Delete Customer (Soft Delete)
        print_header(f"Test 15: DELETE /api/customers/{TEST_CUSTOMER_ID} (Admin Token)")
        total_tests += 1
        success, _ = test_delete(
            f"/api/customers/{TEST_CUSTOMER_ID}",
            ADMIN_TOKEN,
            200,
            "Admin deletes customer (soft delete)"
        )
        if success:
            passed_tests += 1
    else:
        print_warning("Customer ID not available - skipping customer-specific tests")
    
    # ==================== AUTHORIZATION TESTS ====================
    
    print_header("Authorization Tests")
    
    # Test 16: Customer tries to access admin endpoint
    print_header("Test 16: GET /api/customers (Customer Token - Should Fail)")
    total_tests += 1
    success, _ = test_get(
        "/api/customers",
        CUSTOMER_TOKEN,
        403,
        "Customer tries to list all customers (should be forbidden)"
    )
    if success:
        passed_tests += 1
    
    # Test 17: Customer tries to search
    print_header("Test 17: GET /api/customers/search (Customer Token - Should Fail)")
    total_tests += 1
    success, _ = test_get(
        "/api/customers/search?q=test",
        CUSTOMER_TOKEN,
        403,
        "Customer tries to search customers (should be forbidden)"
    )
    if success:
        passed_tests += 1
    
    # Print Summary
    print_header("Test Summary")
    print(f"{Colors.BOLD}Total Tests: {total_tests}{Colors.END}")
    print(f"{Colors.GREEN}Passed: {passed_tests}{Colors.END}")
    print(f"{Colors.RED}Failed: {total_tests - passed_tests}{Colors.END}")
    
    if total_tests > 0:
        success_rate = (passed_tests / total_tests) * 100
        print(f"\n{Colors.BOLD}Success Rate: {success_rate:.1f}%{Colors.END}")
        
        if success_rate == 100:
            print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 All tests passed!{Colors.END}")
        elif success_rate >= 80:
            print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠️  Most tests passed, but some failed.{Colors.END}")
        else:
            print(f"\n{Colors.RED}{Colors.BOLD}❌ Many tests failed. Please check the errors above.{Colors.END}")
    
    print("\n" + "=" * 80 + "\n")


if __name__ == "__main__":
    main()
