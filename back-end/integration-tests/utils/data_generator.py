"""
Test Data Generator
Generates unique test data for each test run
"""
import random
import string
from datetime import datetime
from typing import Dict, List


class TestDataGenerator:
    """Generate test data for integration tests"""
    
    @staticmethod
    def generate_unique_email(prefix: str = "test") -> str:
        """Generate unique email address"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        random_str = ''.join(random.choices(string.ascii_lowercase, k=6))
        return f"{prefix}_{timestamp}_{random_str}@test.com"
    
    @staticmethod
    def generate_password() -> str:
        """Generate valid password"""
        return "Test@12345"
    
    @staticmethod
    def generate_full_name() -> str:
        """Generate full name"""
        first_names = ["John", "Jane", "Michael", "Sarah", "David", "Emily"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones"]
        return f"{random.choice(first_names)} {random.choice(last_names)}"
    
    @staticmethod
    def generate_phone() -> str:
        """Generate phone number"""
        return f"+91{''.join(random.choices(string.digits, k=10))}"
    
    @staticmethod
    def generate_user_data(role: str = "Customer") -> Dict:
        """Generate complete user registration data"""
        return {
            "email": TestDataGenerator.generate_unique_email(),
            "password": TestDataGenerator.generate_password(),
            "fullName": TestDataGenerator.generate_full_name(),
            "contactNumber": TestDataGenerator.generate_phone(),
            "role": role
        }
    
    @staticmethod
    def generate_order_items(count: int = 2) -> List[Dict]:
        """Generate order items with all required fields for ORMS"""
        items = []
        for i in range(count):
            items.append({
                "productId": f"PROD{random.randint(1000, 9999)}",
                "productName": f"Test Product {i+1}",
                "productDescription": f"Description for test product {i+1}",
                "sku": f"SKU{random.randint(10000, 99999)}",
                "quantity": random.randint(1, 5),
                "unitPrice": round(random.uniform(10.0, 500.0), 2),
                "discount": 0.0,
                "tax": 0.0
            })
        return items
    
    @staticmethod
    def generate_shipping_address() -> Dict:
        """Generate delivery address with all required fields for ORMS"""
        return {
            "recipientName": TestDataGenerator.generate_full_name(),
            "street": f"{random.randint(1, 999)} Test Street",
            "city": random.choice(["Mumbai", "Delhi", "Bangalore", "Chennai"]),
            "state": random.choice(["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu"]),
            "zipCode": f"{random.randint(100000, 999999)}",
            "country": "India",
            "phone": TestDataGenerator.generate_phone()
        }
    
    @staticmethod
    def generate_complaint_data(order_id: str) -> Dict:
        """Generate complaint data"""
        categories = ["Product Quality", "Delivery Issue", "Customer Service", "Payment Issue", "Other"]
        return {
            "orderId": order_id,
            "category": random.choice(categories),
            "subject": "Test Complaint Subject",
            "description": "This is a test complaint description for automated testing purposes."
        }
