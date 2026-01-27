"""Debug JWT token"""
import httpx
import asyncio
import json
from jose import jwt


async def main():
    async with httpx.AsyncClient() as client:
        # Login
        resp = await client.post(
            'http://localhost:5001/api/auth/login',
            json={
                'email': 'jtdhamodharan@gmail.com',
                'password': 'Madurai54321!'
            }
        )
        
        data = resp.json()
        token = data['data']['accessToken']
        
        print(f"Token: {token}\n")
        
        # Try to decode with the JWT_SECRET
        try:
            decoded = jwt.decode(
                token,
                '615c9c3defb0092cc4189b3c30b0b34b',
                algorithms=['HS256']
            )
            print("✅ Token decoded successfully!")
            print(f"Decoded payload:\n{json.dumps(decoded, indent=2)}")
        except Exception as e:
            print(f"❌ Failed to decode: {e}")
        
        # Now test with CMPS endpoint
        print("\n" + "="*60)
        print("Testing CMPS complaint creation...")
        print("="*60)
        
        resp2 = await client.post(
            'http://localhost:5004/api/complaints',
            headers={'Authorization': f'Bearer {token}'},
            json={
                'category': 'Other',
                'subject': 'Debug test complaint',
                'description': 'This is a debug test to see if JWT validation works',
                'priority': 'Low'
            }
        )
        
        print(f"\nStatus: {resp2.status_code}")
        print(f"Response: {json.dumps(resp2.json(), indent=2)}")


if __name__ == "__main__":
    asyncio.run(main())
