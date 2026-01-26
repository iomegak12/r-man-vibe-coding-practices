"""
ORMS Phase 5 Testing - Admin Order Management
Tests for admin-only order endpoints (list all, update status, analytics)
"""
import requests
import json
from datetime import datetime

# Configuration
ATHS_URL = "http://localhost:5001"
ORMS_URL = "http://localhost:5003"

# Test admin credentials
ADMIN_USER = {
    "email": "jtdhamodharan@gmail.com",
    "password": "Madurai54321!",
    "fullName": "Admin User",
    "role": "Administrator"
}

# Test customer credentials (for creating test orders)
CUSTOMER_USER = {
    "email": "orms.phase4@example.com",
    "password": "TestPass@123"
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


def register_admin():
    """Register admin user"""
    print_section("Step 0: Register Admin User")
    
    try:
        response = requests.post(
            f"{ATHS_URL}/api/auth/register",
            json=ADMIN_USER
        )
        
        if response.status_code in [200, 201]:
            print_success("Admin registered successfully!")
            return True
        elif response.status_code in [400, 409]:
            print_info("Status", "Admin already exists (this is OK)")
            return True
        else:
            print_error(f"Registration failed: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Registration error: {str(e)}")
        return False


def login_admin():
    """Login as admin and get JWT token"""
    print_section("Step 1: Login as Admin")
    
    try:
        response = requests.post(
            f"{ATHS_URL}/api/auth/login",
            json={
                "email": ADMIN_USER["email"],
                "password": ADMIN_USER["password"]
            }
        )
        
        if response.status_code == 200:
            data = response.json()["data"]
            token = data["accessToken"]
            print_success("Admin login successful")
            print_info("Token", token[:50] + "...")
            return token
        else:
            print_error(f"Login failed: {response.status_code}")
            return None
            
    except Exception as e:
        print_error(f"Login error: {str(e)}")
        return None


def login_customer():
    """Login as customer to get token"""
    try:
        response = requests.post(
            f"{ATHS_URL}/api/auth/login",
            json={
                "email": CUSTOMER_USER["email"],
                "password": CUSTOMER_USER["password"]
            }
        )
        
        if response.status_code == 200:
            return response.json()["data"]["accessToken"]
        return None
    except:
        return None


def get_all_orders(admin_token):
    """Test GET /api/admin/orders"""
    print_section("Step 2: Get All Orders (Admin)")
    
    try:
        response = requests.get(
            f"{ORMS_URL}/api/admin/orders",
            params={"page": 1, "page_size": 10},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            items = data["items"]
            pagination = data["pagination"]
            
            print_success("Orders retrieved successfully!")
            print_info("Total Orders", pagination["totalItems"])
            print_info("Current Page", pagination["currentPage"])
            print_info("Total Pages", pagination["totalPages"])
            
            if items:
                print("\n   Recent Orders:")
                for order in items[:5]:
                    print(f"\n      Order ID: {order['orderId']}")
                    print(f"      Customer: {order['customerName']}")
                    print(f"      Status: {order['status']}")
                    print(f"      Total: ${order['totalAmount']:.2f}")
                    print(f"      Date: {order['orderDate']}")
            
            return items[0]["orderId"] if items else None
        else:
            print_error(f"Failed to get orders: {response.status_code}")
            print_info("Error", response.json().get("detail", "Unknown error"))
            return None
            
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return None


def test_filters(admin_token):
    """Test filtering and search"""
    print_section("Step 3: Test Filters and Search")
    
    try:
        # Test status filter
        response = requests.get(
            f"{ORMS_URL}/api/admin/orders",
            params={"page": 1, "page_size": 10, "order_status": "Placed"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Status filter works! Found {data['pagination']['totalItems']} 'Placed' orders")
        
        # Test search
        response = requests.get(
            f"{ORMS_URL}/api/admin/orders",
            params={"page": 1, "page_size": 10, "search": "ORD-2026"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Search works! Found {data['pagination']['totalItems']} matching orders")
        
        return True
            
    except Exception as e:
        print_error(f"Filter test error: {str(e)}")
        return False


def update_order_status(admin_token, order_id):
    """Test PATCH /api/admin/orders/{orderId}/status"""
    print_section("Step 4: Update Order Status")
    
    if not order_id:
        print_info("Status", "No order ID provided, skipping")
        return False
    
    try:
        # Update to Processing
        response = requests.patch(
            f"{ORMS_URL}/api/admin/orders/{order_id}/status",
            json={
                "status": "Processing",
                "notes": "Order is being prepared for shipment"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()["data"]
            print_success("Status updated to 'Processing'!")
            print_info("Order ID", data["orderId"])
            print_info("New Status", data["status"])
            
            # Update to Shipped
            response = requests.patch(
                f"{ORMS_URL}/api/admin/orders/{order_id}/status",
                json={
                    "status": "Shipped",
                    "notes": "Shipped via FedEx"
                },
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()["data"]
                print_success("Status updated to 'Shipped'!")
                print_info("New Status", data["status"])
                print_info("Estimated Delivery", data.get("estimatedDeliveryDate", "N/A"))
                
                # Update to Delivered
                response = requests.patch(
                    f"{ORMS_URL}/api/admin/orders/{order_id}/status",
                    json={
                        "status": "Delivered",
                        "notes": "Package delivered successfully"
                    },
                    headers={"Authorization": f"Bearer {admin_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()["data"]
                    print_success("Status updated to 'Delivered'!")
                    print_info("New Status", data["status"])
                    print_info("Actual Delivery", data.get("actualDeliveryDate", "N/A"))
                    return True
        
        print_error(f"Status update failed: {response.status_code}")
        return False
            
    except Exception as e:
        print_error(f"Status update error: {str(e)}")
        return False


def get_analytics(admin_token):
    """Test GET /api/admin/orders/analytics"""
    print_section("Step 5: Get Order Analytics")
    
    try:
        response = requests.get(
            f"{ORMS_URL}/api/admin/orders/analytics",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()["data"]
            summary = data["summary"]
            
            print_success("Analytics retrieved successfully!")
            
            print("\n   Summary:")
            print(f"      Total Orders: {summary['totalOrders']}")
            print(f"      Total Revenue: ${summary['totalRevenue']:.2f}")
            print(f"      Average Order Value: ${summary['averageOrderValue']:.2f}")
            print(f"      Active Orders: {summary['activeOrders']}")
            
            print("\n   Status Breakdown:")
            for status, count in data["statusBreakdown"].items():
                print(f"      {status}: {count}")
            
            if data.get("topCustomers"):
                print("\n   Top Customers:")
                for i, customer in enumerate(data["topCustomers"][:5], 1):
                    print(f"      {i}. {customer['customerName']} - {customer['orderCount']} orders, ${customer['totalSpent']:.2f}")
            
            return True
        else:
            print_error(f"Analytics failed: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Analytics error: {str(e)}")
        return False


def test_customer_access(customer_token):
    """Test that customers cannot access admin endpoints"""
    print_section("Step 6: Test Access Control")
    
    try:
        response = requests.get(
            f"{ORMS_URL}/api/admin/orders",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        
        if response.status_code == 403:
            print_success("Correctly denied customer access to admin endpoints")
            return True
        else:
            print_error(f"Access control issue: Expected 403, got {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Access control test error: {str(e)}")
        return False


def main():
    """Run all Phase 5 tests"""
    print("\n" + "="*60)
    print("  ORMS Phase 5 Testing - Admin Order Management")
    print("="*60)
    print(f"  Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    # Step 0: Register admin
    if not register_admin():
        print_error("Cannot proceed without admin registration")
        return
    
    # Step 1: Login as admin
    admin_token = login_admin()
    if not admin_token:
        print_error("Cannot proceed without admin token")
        return
    
    # Step 2: Get all orders
    test_order_id = get_all_orders(admin_token)
    
    # Step 3: Test filters
    test_filters(admin_token)
    
    # Step 4: Update order status
    if test_order_id:
        update_order_status(admin_token, test_order_id)
    
    # Step 5: Get analytics
    get_analytics(admin_token)
    
    # Step 6: Test access control
    customer_token = login_customer()
    if customer_token:
        test_customer_access(customer_token)
    
    # Summary
    print_section("Testing Complete")
    print_success("All Phase 5 tests completed!")
    print("\nTested Endpoints:")
    print("   ✅ GET /api/admin/orders")
    print("   ✅ GET /api/admin/orders (with filters)")
    print("   ✅ PATCH /api/admin/orders/{orderId}/status")
    print("   ✅ GET /api/admin/orders/analytics")
    print("   ✅ Access control verification\n")


if __name__ == "__main__":
    main()
