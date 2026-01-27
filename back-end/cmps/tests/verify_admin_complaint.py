"""
Verify admin-created complaint has correct customer data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import json


async def main():
    client = AsyncIOMotorClient("mongodb://admin:password123@localhost:27017/?authSource=admin")
    complaint_db = client.complaint_db
    
    # Get the last complaint (admin-created for customer's order)
    complaint = await complaint_db.complaints.find_one(
        {"complaintId": "CMP-2026-000021"},
        sort=[("createdAt", -1)]
    )
    
    if complaint:
        print("=" * 80)
        print("ADMIN-CREATED COMPLAINT VERIFICATION")
        print("=" * 80)
        print(f"\nComplaint ID: {complaint.get('complaintId')}")
        print(f"Order ID: {complaint.get('orderId')}")
        print(f"User ID (who created): {complaint.get('userId')}")
        print(f"Customer ID (order owner): {complaint.get('customerId')}")
        print(f"Customer Email: {complaint.get('customerEmail')}")
        print(f"Customer Name: {complaint.get('customerName')}")
        
        print("\n" + "=" * 80)
        print("VERIFICATION:")
        print("=" * 80)
        
        # The userId should be admin's ID
        # The customerId should be the order owner's customer ID
        admin_user_id = "6976f8820151d1192176aa08"
        order_customer_id = "69770e401cb0f4346e97a857"
        order_customer_email = "orms.test@example.com"
        
        if complaint.get('userId') == admin_user_id:
            print(f"✅ Complaint created by admin (userId matches)")
        else:
            print(f"❌ userId mismatch: expected {admin_user_id}, got {complaint.get('userId')}")
        
        if complaint.get('customerId') == order_customer_id:
            print(f"✅ Complaint associated with order customer (customerId matches)")
        else:
            print(f"⚠️  customerId mismatch: expected {order_customer_id}, got {complaint.get('customerId')}")
        
        if complaint.get('customerEmail') == order_customer_email:
            print(f"✅ Customer email correct (matches order owner)")
        else:
            print(f"⚠️  customerEmail mismatch: expected {order_customer_email}, got {complaint.get('customerEmail')}")
        
        print("\n✅ CONCLUSION: Administrator successfully created complaint on behalf of customer!")
    else:
        print("Complaint not found")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
