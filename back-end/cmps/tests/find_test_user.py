"""
Find test user with customer profile and orders
"""
import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient


async def main():
    client = AsyncIOMotorClient("mongodb://admin:password123@localhost:27017/?authSource=admin")
    
    customer_db = client["r-man-customers-db"]
    order_db = client["r-man-orders-db"]
    auth_db = client["rman-auth-db"]
    
    print("=" * 80)
    print("TEST DATA FOR PHASE 3")
    print("=" * 80)
    
    # Find user with orders
    order = await order_db.orders.find_one()
    if not order:
        print("\n❌ No orders found")
        client.close()
        return
    
    customer_id = order.get('customerId')
    user_id = order.get('userId')
    
    print(f"\n✅ Found order: {order.get('orderId')}")
    print(f"   Customer ID: {customer_id}")
    print(f"   User ID: {user_id}")
    
    # Get customer details
    customer = await customer_db.customers.find_one({"userId": user_id})
    if customer:
        print(f"\n✅ Customer Profile:")
        print(f"   Customer ID (MongoDB _id): {customer.get('_id')}")
        print(f"   User ID: {customer.get('userId')}")
        print(f"   Email: {customer.get('email')}")
        print(f"   Full Name: {customer.get('fullName')}")
        print(f"   Contact: {customer.get('contactNumber')}")
        print(f"   Status: {customer.get('customerStatus')}")
    
    # Get user auth details
    from bson import ObjectId
    user = await auth_db.users.find_one({"_id": ObjectId(user_id)})
    if user:
        print(f"\n✅ User Account:")
        print(f"   Email: {user.get('email')}")
        print(f"   Full Name: {user.get('fullName')}")
        print(f"   Role: {user.get('role')}")
        print(f"   Active: {user.get('isActive')}")
    
    # Get all orders for this customer
    orders = await order_db.orders.find({"customerId": customer_id}).to_list(length=100)
    print(f"\n✅ Customer Orders: {len(orders)} total")
    for idx, ord in enumerate(orders[:5], 1):
        print(f"   {idx}. {ord.get('orderId')} - {ord.get('status')} - ${ord.get('totalAmount'):.2f}")
    
    print("\n" + "=" * 80)
    print("RECOMMENDED TEST CREDENTIALS")
    print("=" * 80)
    print(f"\nEmail: {user.get('email')}")
    print(f"Password: Check ORMS test files (likely 'password123' or similar)")
    print(f"\nFor testing:")
    print(f"   - Customer ID: {customer_id}")
    print(f"   - User ID: {user_id}")
    print(f"   - Test Order ID: {order.get('orderId')}")
    print(f"   - Customer has {len(orders)} orders available for testing")
    
    # Also show a few other test users
    print("\n" + "=" * 80)
    print("OTHER AVAILABLE TEST USERS")
    print("=" * 80)
    
    all_users = await auth_db.users.find({"role": "Customer"}).limit(5).to_list(length=5)
    for idx, u in enumerate(all_users, 1):
        uid = str(u.get('_id'))
        cust = await customer_db.customers.find_one({"userId": uid})
        order_count = await order_db.orders.count_documents({"userId": uid})
        
        print(f"\n{idx}. {u.get('email')}")
        print(f"   User ID: {uid}")
        print(f"   Has Customer Profile: {'✅' if cust else '❌'}")
        print(f"   Orders: {order_count}")
        if cust:
            print(f"   Customer ID: {cust.get('_id')}")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
