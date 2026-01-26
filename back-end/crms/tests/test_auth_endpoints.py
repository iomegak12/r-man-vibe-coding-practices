"""
Test Script for CRMS Authentication Endpoints
==============================================

This script tests all authentication and authorization endpoints in the Customer Management Service.

Prerequisites:
1. CRMS server running on http://localhost:5002
2. ATHS (Auth Service) running on http://localhost:5001
3. Valid JWT tokens (automatically fetched using credentials)

Usage:
    python tests/test_auth_endpoints.py
"""

import requests
import json
from typing import Dict, Any, Optional
from datetime import datetime


# Configuration
BASE_URL = "http://localhost:5002"
AUTH_SERVICE_URL = "http://localhost:5001"

# Credentials for automatic token retrieval
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


class Colors:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
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


def print_response(response: requests.Response):
    """Print response details"""
    print(f"   Status Code: {response.status_code}")
    try:
        data = response.json()
        print(f"   Response: {json.dumps(data, indent=2)}")
    except:
        print(f"   Response: {response.text[:200]}")


def test_endpoint(
    endpoint: str,
    token: str = None,
    expected_status: int = 200,
    test_name: str = "",
    expected_in_response: str = None
) -> bool:
    """
    Test an endpoint with given token
    
    Args:
        endpoint: API endpoint path
        token: JWT token (optional)
        expected_status: Expected HTTP status code
        test_name: Name of the test
        expected_in_response: String that should be in response
        
    Returns:
        bool: True if test passed, False otherwise
    """
    print_test(test_name or endpoint)
    
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=5)
        print_response(response)
        
        # Check status code
        if response.status_code != expected_status:
            print_error(f"Expected status {expected_status}, got {response.status_code}")
            return False
        
        # Check for expected content
        if expected_in_response:
            response_text = response.text.lower()
            if expected_in_response.lower() not in response_text:
                print_error(f"Expected '{expected_in_response}' in response")
                return False
        
        print_success("Test passed")
        return True
        
    except requests.exceptions.ConnectionError:
        print_error(f"Could not connect to {BASE_URL}. Is the server running?")
        return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False


def login_and_get_token(credentials: Dict[str, str], role_type: str) -> Optional[str]:
    """
    Login to ATHS and get JWT token
    
    Args:
        credentials: Dictionary with email and password
        role_type: "admin" or "customer" for logging purposes
        
    Returns:
        JWT token string or None if login failed
    """
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
                print_error(f"{role_type.capitalize()} login failed: No access token in response")
                return None
        else:
            print_error(f"{role_type.capitalize()} login failed: Status {response.status_code}")
            try:
                error_data = response.json()
                print(f"     Error: {error_data.get('message', 'Unknown error')}")
            except:
                print(f"     Response: {response.text[:200]}")
            return None
            
    except requests.exceptions.ConnectionError:
        print_error(f"Could not connect to Auth Service at {AUTH_SERVICE_URL}")
        print_warning("Make sure ATHS is running on port 5001")
        return None
    except Exception as e:
        print_error(f"{role_type.capitalize()} login error: {str(e)}")
        return None


def check_token_validity(token: str, token_type: str) -> bool:
    """Check if a token is valid"""
    if not token:
        print_warning(f"{token_type} token not available.")
        return False
    return True


def main():
    """Run all tests"""
    global ADMIN_TOKEN, CUSTOMER_TOKEN
    
    print_header(f"CRMS Authentication Tests - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Step 1: Login and get tokens
    print(f"\n{Colors.BOLD}{Colors.CYAN}Step 1: Fetching JWT Tokens from Auth Service{Colors.END}")
    print(f"  Auth Service URL: {AUTH_SERVICE_URL}")
    
    ADMIN_TOKEN = login_and_get_token(ADMIN_CREDENTIALS, "admin")
    CUSTOMER_TOKEN = login_and_get_token(CUSTOMER_CREDENTIALS, "customer")
    
    # Check if tokens are valid
    admin_token_valid = check_token_validity(ADMIN_TOKEN, "admin")
    customer_token_valid = check_token_validity(CUSTOMER_TOKEN, "customer")
    
    print(f"\n{Colors.BOLD}Configuration:{Colors.END}")
    print(f"  CRMS URL: {BASE_URL}")
    print(f"  Auth Service URL: {AUTH_SERVICE_URL}")
    print(f"  Admin Token: {'✅ Available' if admin_token_valid else '❌ Not Available'}")
    print(f"  Customer Token: {'✅ Available' if customer_token_valid else '❌ Not Available'}")
    
    if not admin_token_valid and not customer_token_valid:
        print_error("\nCannot proceed without any valid tokens. Please check:")
        print("  1. ATHS is running on http://localhost:5001")
        print("  2. Credentials are correct")
        print("  3. Users exist in ATHS database")
        return
    
    # Track test results
    total_tests = 0
    passed_tests = 0
    
    # Test 1: Health Check (No Auth Required)
    print_header("1. Health Check Endpoint (No Authentication)")
    total_tests += 1
    if test_endpoint("/health", expected_status=200, test_name="Health check without authentication"):
        passed_tests += 1
    
    # Test 2: Auth Endpoint - No Token
    print_header("2. Authentication Test - Missing Token")
    total_tests += 1
    if test_endpoint(
        "/api/test/auth",
        expected_status=401,
        test_name="Auth endpoint without token (should fail)"
    ):
        passed_tests += 1
    
    # Test 3: Auth Endpoint - Invalid Token
    print_header("3. Authentication Test - Invalid Token")
    total_tests += 1
    if test_endpoint(
        "/api/test/auth",
        token="invalid.jwt.token",
        expected_status=401,
        test_name="Auth endpoint with invalid token (should fail)"
    ):
        passed_tests += 1
    
    if admin_token_valid:
        # Test 4: Auth Endpoint - Valid Admin Token
        print_header("4. Authentication Test - Valid Admin Token")
        total_tests += 1
        if test_endpoint(
            "/api/test/auth",
            token=ADMIN_TOKEN,
            expected_status=200,
            test_name="Auth endpoint with valid admin token",
            expected_in_response="Authentication successful"
        ):
            passed_tests += 1
        
        # Test 5: Admin Endpoint - Admin Token
        print_header("5. Admin Authorization Test - Admin Token")
        total_tests += 1
        if test_endpoint(
            "/api/test/admin",
            token=ADMIN_TOKEN,
            expected_status=200,
            test_name="Admin endpoint with admin token (should pass)",
            expected_in_response="admin"
        ):
            passed_tests += 1
        
        # Test 6: Customer-DB Endpoint - Admin Token
        print_header("6. Customer Database Test - Admin Token")
        total_tests += 1
        if test_endpoint(
            "/api/test/customer-db",
            token=ADMIN_TOKEN,
            expected_status=200,
            test_name="Customer DB endpoint with admin token"
        ):
            passed_tests += 1
    
    if customer_token_valid:
        # Test 7: Auth Endpoint - Valid Customer Token
        print_header("7. Authentication Test - Valid Customer Token")
        total_tests += 1
        if test_endpoint(
            "/api/test/auth",
            token=CUSTOMER_TOKEN,
            expected_status=200,
            test_name="Auth endpoint with valid customer token",
            expected_in_response="Authentication successful"
        ):
            passed_tests += 1
        
        # Test 8: Customer Endpoint - Customer Token
        print_header("8. Customer Authorization Test - Customer Token")
        total_tests += 1
        if test_endpoint(
            "/api/test/customer",
            token=CUSTOMER_TOKEN,
            expected_status=200,
            test_name="Customer endpoint with customer token (should pass)",
            expected_in_response="customer"
        ):
            passed_tests += 1
        
        # Test 9: Admin Endpoint - Customer Token
        print_header("9. Admin Authorization Test - Customer Token (Should Fail)")
        total_tests += 1
        if test_endpoint(
            "/api/test/admin",
            token=CUSTOMER_TOKEN,
            expected_status=403,
            test_name="Admin endpoint with customer token (should fail - forbidden)"
        ):
            passed_tests += 1
        
        # Test 10: Customer-DB Endpoint - Customer Token
        print_header("10. Customer Database Test - Customer Token")
        total_tests += 1
        if test_endpoint(
            "/api/test/customer-db",
            token=CUSTOMER_TOKEN,
            expected_status=200,
            test_name="Customer DB endpoint with customer token"
        ):
            passed_tests += 1
    
    if admin_token_valid and customer_token_valid:
        # Test 11: Customer Endpoint - Admin Token
        print_header("11. Customer Authorization Test - Admin Token")
        total_tests += 1
        if test_endpoint(
            "/api/test/customer",
            token=ADMIN_TOKEN,
            expected_status=403,
            test_name="Customer endpoint with admin token (should fail - forbidden)"
        ):
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
    
    # Show token info
    if not admin_token_valid or not customer_token_valid:
        print(f"\n{Colors.YELLOW}{Colors.BOLD}Note:{Colors.END}")
        if not admin_token_valid:
            print("  ⚠️  Admin token not available - some tests skipped")
        if not customer_token_valid:
            print("  ⚠️  Customer token not available - some tests skipped")
        print(f"\n{Colors.YELLOW}Please ensure:{Colors.END}")
        print("  1. ATHS is running on http://localhost:5001")
        print("  2. Credentials are correct in this script")
        print("  3. Users exist in ATHS database with correct roles\n")


if __name__ == "__main__":
    main()
