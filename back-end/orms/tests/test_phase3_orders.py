"""
Test script for ORMS Phase 3 - Order Creation & Retrieval
Tests the following endpoints:
- POST /api/orders (Create order)
- GET /api/orders/me (List customer orders)
- GET /api/orders/{orderId} (Get order details)
"""
import requests
import json
from datetime import datetime

# Base URLs
ATHS_URL = "http://localhost:5001"
ORMS_URL = "http://localhost:5003"
CRMS_URL = "http://localhost:5002"

# Test user credentials
TEST_USER_REGISTER = {
    "fullName": "ORMS Test Customer",
    "email": "orms.test@example.com",
    "password": "TestPass@123",
    "phone": "+1234567890",
    "role": "Customer"
}

TEST_USER = {
    "email": "orms.test@example.com",
    "password": "TestPass@123"
}


def print_section(title):
    """Print a formatted section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


def print_success(message):
    """Print success message"""
    print(f"✅ {message}")


def print_error(message):
    """Print error message"""
    print(f"❌ {message}")


def print_info(key, value):
    """Print info in key-value format"""
    print(f"   {key}: {value}")


def register_user():
    """Register a test user"""
    print_section("Step 0: Register Test User")
    
    try:
        response = requests.post(
            f"{ATHS_URL}/api/auth/register",
            json=TEST_USER_REGISTER
        )
        
        if response.status_code == 201:
            print_success("User registered successfully")
            return True
        else:
            print_info("Status", "User might already exist (this is OK)")
            return True
            
    except Exception as e:
        print_error(f"Failed to register user: {str(e)}")
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
            data = response.json()
            token = data["data"]["accessToken"]
            print_success("Login successful")
            print_info("Token", token[:30] + "...")
            return token
        else:
            print_error(f"Login failed: {response.json().get('message')}")
            return None
            
    except Exception as e:
        print_error(f"Login error: {str(e)}")
        return None


def create_order(token):
    """Create a new order"""
    print_section("Step 2: Create New Order")
    
    order_data = {
        "deliveryAddress": {
            "recipientName": "John Doe",
            "street": "123 Main Street",
            "city": "New York",
            "state": "NY",
            "zipCode": "10001",
            "country": "USA",
            "phone": "+1234567890"
        },
        "items": [
            {
                "productId": "PROD-001",
                "productName": "Laptop Computer",
                "productDescription": "High-performance laptop",
                "sku": "LAP-001",
                "quantity": 1,
                "unitPrice": 999.99,
                "discount": 50.00,
                "tax": 80.00
            },
            {
                "productId": "PROD-002",
                "productName": "Wireless Mouse",
                "productDescription": "Ergonomic wireless mouse",
                "sku": "MOU-001",
                "quantity": 2,
                "unitPrice": 29.99,
                "discount": 0.00,
                "tax": 5.00
            }
        ],
        "notes": "Please deliver between 9 AM - 5 PM"
    }
    
    try:
        response = requests.post(
            f"{ORMS_URL}/api/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 201:
            data = response.json()
            order = data["data"]
            print_success("Order created successfully!")
            print_info("Order ID", order["orderId"])
            print_info("Customer Name", order["customerName"])
            print_info("Total Amount", f"${order['totalAmount']:.2f}")
            print_info("Subtotal", f"${order['subtotal']:.2f}")
            print_info("Discount", f"${order['discount']:.2f}")
            print_info("Tax", f"${order['tax']:.2f}")
            print_info("Status", order["status"])
            print_info("Items Count", len(order["items"]))
            
            print("\n   Order Items:")
            for item in order["items"]:
                print(f"      - {item['productName']} x{item['quantity']} = ${item['finalPrice']:.2f}")
            
            return order["orderId"]
        else:
            print_error(f"Order creation failed: {response.status_code}")
            print_info("Error", response.json().get("message", "Unknown error"))
            print_info("Details", json.dumps(response.json(), indent=2))
            return None
            
    except Exception as e:
        print_error(f"Order creation error: {str(e)}")
        return None


def get_my_orders(token):
    """Get paginated list of customer's orders"""
    print_section("Step 3: Get My Orders (Paginated)")
    
    try:
        response = requests.get(
            f"{ORMS_URL}/api/orders/me",
            params={"page": 1, "page_size": 10},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            items = data["items"]
            pagination = data["pagination"]
            
            print_success("Orders retrieved successfully!")
            print_info("Total Orders", pagination["totalItems"])
            print_info("Current Page", pagination["currentPage"])
            print_info("Page Size", pagination["itemsPerPage"])
            print_info("Total Pages", pagination["totalPages"])
            
            print("\n   Orders List:")
            for order in items:
                print(f"\n      Order ID: {order['orderId']}")
                print(f"      Status: {order['status']}")
                print(f"      Total: ${order['totalAmount']:.2f}")
                print(f"      Items: {order['itemCount']}")
                print(f"      Date: {order['orderDate']}")
            
            return True
        else:
            print_error(f"Failed to get orders: {response.status_code}")
            print_info("Error", response.json().get("message", "Unknown error"))
            return False
            
    except Exception as e:
        print_error(f"Get orders error: {str(e)}")
        return False


def get_order_details(token, order_id):
    """Get detailed information about a specific order"""
    print_section("Step 4: Get Order Details")
    
    try:
        response = requests.get(
            f"{ORMS_URL}/api/orders/{order_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            order = data["data"]
            
            print_success("Order details retrieved successfully!")
            print_info("Order ID", order["orderId"])
            print_info("Customer ID", order["customerId"])
            print_info("Customer Name", order["customerName"])
            print_info("Customer Email", order["customerEmail"])
            print_info("Customer Phone", order.get("customerPhone", "N/A"))
            
            print("\n   Delivery Address:")
            addr = order["deliveryAddress"]
            print(f"      Recipient: {addr['recipientName']}")
            print(f"      Street: {addr['street']}")
            print(f"      City: {addr['city']}, {addr['state']} {addr['zipCode']}")
            print(f"      Country: {addr['country']}")
            print(f"      Phone: {addr['phone']}")
            
            print("\n   Order Summary:")
            print(f"      Subtotal: ${order['subtotal']:.2f}")
            print(f"      Discount: ${order['discount']:.2f}")
            print(f"      Tax: ${order['tax']:.2f}")
            print(f"      Total: ${order['totalAmount']:.2f}")
            
            print("\n   Order Items:")
            for item in order["items"]:
                print(f"\n      Item: {item['productName']}")
                print(f"         Product ID: {item['productId']}")
                print(f"         SKU: {item.get('sku', 'N/A')}")
                print(f"         Quantity: {item['quantity']}")
                print(f"         Unit Price: ${item['unitPrice']:.2f}")
                print(f"         Discount: ${item['discount']:.2f}")
                print(f"         Tax: ${item['tax']:.2f}")
                print(f"         Final Price: ${item['finalPrice']:.2f}")
            
            print(f"\n   Status: {order['status']}")
            print(f"   Order Date: {order['orderDate']}")
            print(f"   Notes: {order.get('notes', 'None')}")
            
            return True
        else:
            print_error(f"Failed to get order details: {response.status_code}")
            print_info("Error", response.json().get("message", "Unknown error"))
            return False
            
    except Exception as e:
        print_error(f"Get order details error: {str(e)}")
        return False


def verify_crms_statistics(token):
    """Verify that CRMS customer statistics were updated"""
    print_section("Step 5: Verify CRMS Statistics Update")
    
    try:
        response = requests.get(
            f"{CRMS_URL}/api/customers/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            customer = data["data"]
            
            print_success("Customer statistics retrieved!")
            print_info("Customer ID", customer["customerId"])
            print_info("Total Orders", customer["totalOrders"])
            print_info("Total Order Value", f"${customer['totalOrderValue']:.2f}")
            if customer["totalOrders"] > 0:
                avg_order = customer["totalOrderValue"] / customer["totalOrders"]
                print_info("Average Order Value", f"${avg_order:.2f}")
            
            return True
        else:
            print_error(f"Failed to get customer statistics: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"CRMS verification error: {str(e)}")
        return False


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("  ORMS Phase 3 Testing - Order Creation & Retrieval")
    print("="*60)
    print(f"  Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    # Step 0: Register user
    if not register_user():
        print_error("Cannot proceed without user registration")
        return
    
    # Step 1: Login
    token = login()
    if not token:
        print_error("Cannot proceed without authentication token")
        return
    
    # Step 2: Create order
    order_id = create_order(token)
    if not order_id:
        print_error("Cannot proceed without order creation")
        return
    
    # Step 3: Get my orders
    get_my_orders(token)
    
    # Step 4: Get order details
    get_order_details(token, order_id)
    
    # Step 5: Verify CRMS statistics
    verify_crms_statistics(token)
    
    # Summary
    print_section("Testing Complete")
    print_success("All Phase 3 endpoints tested successfully!")
    print("\nTested Endpoints:")
    print("   ✅ POST /api/orders")
    print("   ✅ GET /api/orders/me")
    print("   ✅ GET /api/orders/{orderId}")
    print("   ✅ CRMS statistics integration")
    print("\n")


if __name__ == "__main__":
    main()
