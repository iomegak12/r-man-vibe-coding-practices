"""
Check actual customer and order document structure
"""
import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient


async def main():
    client = AsyncIOMotorClient("mongodb://admin:password123@localhost:27017/?authSource=admin")
    
    customer_db = client["r-man-customers-db"]
    order_db = client["r-man-orders-db"]
    auth_db = client["rman-auth-db"]
    
    print("=" * 60)
    print("Sample Document Structures")
    print("=" * 60)
    
    # Get sample customer
    print("\n📊 Sample Customer Document:")
    customer = await customer_db.customers.find_one()
    if customer:
        # Remove _id for cleaner display
        customer['_id'] = str(customer['_id'])
        print(json.dumps(customer, indent=2, default=str))
    
    # Get sample order
    print("\n📦 Sample Order Document:")
    order = await order_db.orders.find_one()
    if order:
        order['_id'] = str(order['_id'])
        print(json.dumps(order, indent=2, default=str))
    
    # Get sample user
    print("\n👤 Sample User Document:")
    user = await auth_db.users.find_one({"role": "Customer"})
    if user:
        user['_id'] = str(user['_id'])
        # Remove password for security
        if 'password' in user:
            user['password'] = "***HIDDEN***"
        print(json.dumps(user, indent=2, default=str))
    
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
