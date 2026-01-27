"""
Debug customer ID comparison issue
"""
import asyncio
import httpx
import json


async def main():
    # Login as customer
    async with httpx.AsyncClient() as client:
        # Login
        auth_resp = await client.post(
            "http://localhost:5001/api/auth/login",
            json={"email": "orms.test@example.com", "password": "TestPass@123"}
        )
        
        token = auth_resp.json()["data"]["accessToken"]
        print(f"✅ Logged in successfully\n")
        
        # Get customer profile from CRMS
        crms_resp = await client.get(
            "http://localhost:5002/api/customers/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        print("CRMS Customer Profile:")
        customer = crms_resp.json()["data"]
        print(json.dumps(customer, indent=2))
        customer_id = customer.get("customerId")
        print(f"\nCustomer ID from CRMS: {customer_id}")
        print(f"Customer ID type: {type(customer_id)}")
        
        # Get first order from ORMS
        orms_resp = await client.get(
            "http://localhost:5003/api/orders/me",
            params={"page": 1, "page_size": 1},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        print("\n" + "="*60)
        print("ORMS Order Details:")
        order_data = orms_resp.json()
        if order_data.get("items"):
            order = order_data["items"][0]
            print(json.dumps(order, indent=2))
            order_customer_id = order.get("customerId")
            print(f"\nOrder Customer ID: {order_customer_id}")
            print(f"Order Customer ID type: {type(order_customer_id)}")
            
            print("\n" + "="*60)
            print("COMPARISON:")
            print(f"customer_id == order_customer_id: {customer_id == order_customer_id}")
            print(f"str(customer_id) == str(order_customer_id): {str(customer_id) == str(order_customer_id)}")
        else:
            print("No orders found")


if __name__ == "__main__":
    asyncio.run(main())
