"""
Query database to find real customer and order data for testing
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient


async def main():
    # Connect to MongoDB
    client = AsyncIOMotorClient("mongodb://admin:password123@localhost:27017/?authSource=admin")
    
    # Correct database names
    customer_db = client["r-man-customers-db"]
    order_db = client["r-man-orders-db"]
    auth_db = client["rman-auth-db"]
    
    print("=" * 60)
    print("Database Query: Finding Real Test Data")
    print("=" * 60)
    
    # Find customers
    print("\n📊 Querying Customers...")
    customers = await customer_db.customers.find().limit(5).to_list(length=5)
    
    if customers:
        print(f"✅ Found {len(customers)} customers")
        for idx, customer in enumerate(customers, 1):
            print(f"\n{idx}. Customer ID: {customer.get('customerId')}")
            print(f"   User ID: {customer.get('userId')}")
            print(f"   Email: {customer.get('email')}")
            print(f"   Name: {customer.get('name')}")
    else:
        print("❌ No customers found")
    
    # Find orders
    print("\n📦 Querying Orders...")
    orders = await order_db.orders.find().limit(5).to_list(length=5)
    
    if orders:
        print(f"✅ Found {len(orders)} orders")
        for idx, order in enumerate(orders, 1):
            print(f"\n{idx}. Order ID: {order.get('orderId')}")
            print(f"   Customer ID: {order.get('customerId')}")
            print(f"   Status: {order.get('status')}")
            print(f"   Total: ${order.get('totalAmount', 0):.2f}")
    else:
        print("❌ No orders found")
    
    # Find user accounts
    print("\n👤 Querying User Accounts...")
    users = await auth_db.users.find().to_list(length=20)
    
    if users:
        print(f"✅ Found {len(users)} users")
        for idx, user in enumerate(users, 1):
            user_id = str(user.get('_id'))
            print(f"\n{idx}. User ID: {user_id}")
            print(f"   Email: {user.get('email')}")
            print(f"   Role: {user.get('role')}")
            
            # Check if this user has customer data
            customer = await customer_db.customers.find_one({"userId": user_id})
            if customer:
                print(f"   ✅ Has customer profile: {customer.get('customerId')}")
                
                # Check if customer has orders
                customer_id = customer.get('customerId')
                order_count = await order_db.orders.count_documents({"customerId": customer_id})
                if order_count > 0:
                    print(f"   ✅ Has {order_count} orders")
    else:
        print("❌ No users found")
    
    # Summary for testing
    print("\n" + "=" * 60)
    print("Test Data Summary")
    print("=" * 60)
    
    # Find a user with both customer profile and orders
    test_user = None
    test_customer = None
    test_orders = []
    
    for user in users:
        user_id = str(user.get('_id'))
        customer = await customer_db.customers.find_one({"userId": user_id})
        
        if customer:
            customer_id = customer.get('customerId')
            orders = await order_db.orders.find({"customerId": customer_id}).to_list(length=5)
            
            if orders:
                test_user = user
                test_customer = customer
                test_orders = orders
                break
    
    if test_customer:
        print(f"\n✅ Test Customer Found:")
        print(f"   Customer ID: {test_customer.get('customerId')}")
        print(f"   User ID: {test_customer.get('userId')}")
        print(f"   Email: {test_customer.get('email')}")
        print(f"   Name: {test_customer.get('name')}")
    else:
        print("\n⚠️  No customers with profiles found")
    
    if test_orders:
        print(f"\n✅ Test Orders Found ({len(test_orders)} total):")
        for order in test_orders[:3]:
            print(f"   - Order ID: {order.get('orderId')}, Status: {order.get('status')}")
    else:
        print("\n⚠️  No orders found")
    
    if test_user:
        print(f"\n✅ Recommended Test User:")
        print(f"   Email: {test_user.get('email')}")
        print(f"   Password: Check CRMS/ORMS test files for credentials")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
