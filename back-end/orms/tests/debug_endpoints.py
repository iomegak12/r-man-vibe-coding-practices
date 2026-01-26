"""
Debug script to test individual endpoints
"""
import requests
import json

ATHS_URL = "http://localhost:5001"
ORMS_URL = "http://localhost:5003"
CRMS_URL = "http://localhost:5002"

# Login
print("=== Logging in ===")
login_response = requests.post(
    f"{ATHS_URL}/api/auth/login",
    json={"email": "orms.test@example.com", "password": "TestPass@123"}
)
print(f"Login status: {login_response.status_code}")
if login_response.status_code == 200:
    token = login_response.json()["data"]["accessToken"]
    print(f"Token obtained: {token[:50]}...")
else:
    print("Login failed!")
    exit(1)

# Test GET /api/orders/me
print("\n=== Testing GET /api/orders/me ===")
try:
    response = requests.get(
        f"{ORMS_URL}/api/orders/me?page=1&page_size=10",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
    print(f"Response text: {response.text if 'response' in locals() else 'N/A'}")

# Test CRMS GET /api/customers/me
print("\n=== Testing CRMS GET /api/customers/me ===")
try:
    response = requests.get(
        f"{CRMS_URL}/api/customers/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
