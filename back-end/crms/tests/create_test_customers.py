"""
Helper Script to Create Customers for Testing
==============================================

This script creates customer records using the internal endpoint.
Use this to manually create customers for testing before ATHS integration is complete.

Usage:
    python tests/create_test_customers.py
"""

import requests
import json
from datetime import datetime


# Configuration
BASE_URL = "http://localhost:5002"
AUTH_SERVICE_URL = "http://localhost:5001"
SERVICE_API_KEY = "b3a285fafe93756687343b95de0d4c82"  # Same as ATHS

# Credentials
ADMIN_CREDENTIALS = {
    "email": "jtdhamodharan@gmail.com",
    "password": "Madurai54321!"
}

CUSTOMER_CREDENTIALS = {
    "email": "iomega.azure@gmail.com",
    "password": "Madurai54321!"
}


class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    END = '\033[0m'


def print_header(text: str):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'=' * 80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text.center(80)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'=' * 80}{Colors.END}\n")


def print_success(message: str):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")


def print_error(message: str):
    print(f"{Colors.RED}❌ {message}{Colors.END}")


def print_info(message: str):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")


def get_user_info_from_aths(email: str, password: str):
    """Login to ATHS and get user information"""
    try:
        print_info(f"Logging in to ATHS as {email}...")
        response = requests.post(
            f"{AUTH_SERVICE_URL}/api/auth/login",
            json={"email": email, "password": password},
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                user_data = data.get("data", {}).get("user", {})
                print_success(f"Login successful for {email}")
                print_info(f"User data fields: {list(user_data.keys())}")
                return user_data
            else:
                print_error(f"Login failed: {data.get('message')}")
                return None
        else:
            print_error(f"Login failed with status {response.status_code}")
            return None
    except Exception as e:
        print_error(f"Error logging in: {str(e)}")
        return None


def create_customer(user_data: dict):
    """Create customer using internal endpoint"""
    try:
        # ATHS might return _id or id instead of userId
        user_id = user_data.get("userId") or user_data.get("_id") or user_data.get("id")
        
        if not user_id:
            print_error(f"Could not find user ID in data: {user_data}")
            return False
        
        customer_data = {
            "userId": str(user_id),  # Ensure it's a string
            "email": user_data.get("email"),
            "fullName": user_data.get("fullName", ""),
            "contactNumber": user_data.get("contactNumber", "")
        }
        
        print_info(f"Creating customer for {customer_data['email']}...")
        print_info(f"Customer data: {json.dumps(customer_data, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/api/customers/internal/create",
            json=customer_data,
            headers={
                "Content-Type": "application/json",
                "x-api-key": SERVICE_API_KEY
            },
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                customer_id = data.get("data", {}).get("customerId")
                print_success(f"Customer created: {customer_data['email']} (ID: {customer_id})")
                return True
            else:
                print_error(f"Customer creation failed: {data.get('message')}")
                return False
        else:
            print_error(f"Customer creation failed with status {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print_error(f"Error creating customer: {str(e)}")
        return False


def main():
    print_header(f"Create Test Customers - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    print_info("This script will create customer records for testing")
    print_info(f"CRMS URL: {BASE_URL}")
    print_info(f"Auth Service URL: {AUTH_SERVICE_URL}")
    print()
    
    success_count = 0
    total_count = 2
    
    # Create admin customer
    print_header("Creating Admin Customer")
    admin_user = get_user_info_from_aths(
        ADMIN_CREDENTIALS["email"],
        ADMIN_CREDENTIALS["password"]
    )
    
    if admin_user:
        if create_customer(admin_user):
            success_count += 1
    
    print()
    
    # Create customer user
    print_header("Creating Customer User")
    customer_user = get_user_info_from_aths(
        CUSTOMER_CREDENTIALS["email"],
        CUSTOMER_CREDENTIALS["password"]
    )
    
    if customer_user:
        if create_customer(customer_user):
            success_count += 1
    
    # Summary
    print_header("Summary")
    print(f"{Colors.BOLD}Total Users: {total_count}{Colors.END}")
    print(f"{Colors.GREEN}Created: {success_count}{Colors.END}")
    print(f"{Colors.RED}Failed: {total_count - success_count}{Colors.END}")
    
    if success_count == total_count:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 All customers created successfully!{Colors.END}")
        print(f"\n{Colors.CYAN}You can now run the endpoint tests:{Colors.END}")
        print(f"{Colors.BOLD}python tests/test_customer_endpoints.py{Colors.END}\n")
    else:
        print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠️  Some customers failed to create{Colors.END}")
        print(f"\n{Colors.YELLOW}Please check:{Colors.END}")
        print("  1. ATHS is running on http://localhost:5001")
        print("  2. CRMS is running on http://localhost:5002")
        print("  3. Users exist in ATHS with correct credentials\n")


if __name__ == "__main__":
    main()
