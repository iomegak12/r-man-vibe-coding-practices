# Integration Tests for R-MAN E-Commerce Microservices

Comprehensive integration testing suite for all four microservices in the R-MAN E-Commerce platform.

## 📋 Overview

This test suite validates end-to-end functionality across:
- **ATHS** (Authentication Service) - Port 5001
- **CRMS** (Customer Relationship Management Service) - Port 5002
- **ORMS** (Order Management Service) - Port 5003
- **CMPS** (Complaint Management Service) - Port 5004

## 🏗️ Test Structure

```
integration-tests/
├── auth/                   # ATHS authentication tests
│   └── test_authentication.py
├── customers/              # CRMS customer management tests
│   └── test_customers.py
├── orders/                 # ORMS order management tests
│   └── test_orders.py
├── complaints/             # CMPS complaint management tests
│   └── test_complaints.py
├── utils/                  # Shared utilities
│   ├── client.py          # HTTP client wrapper
│   ├── data_generator.py  # Test data generation
│   └── helpers.py         # Helper functions
├── reports/                # HTML test reports (generated)
├── config.py              # Test configuration
├── conftest.py            # Pytest fixtures
├── pytest.ini             # Pytest configuration
├── requirements.txt       # Python dependencies
└── test_cross_service.py  # Cross-service integration tests
```

## 🚀 Setup

### Prerequisites

- Python 3.8+
- All four microservices running (ATHS, CRMS, ORMS, CMPS)
- Admin user created in ATHS with credentials:
  - Email: `admin@rman.com`
  - Password: `Admin@123`

### Installation

1. **Navigate to integration tests directory:**
   ```bash
   cd back-end/integration-tests
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## ▶️ Running Tests

### Run All Tests
```bash
pytest
```

### Run Specific Test Suite
```bash
# Authentication tests only
pytest auth/

# Customer tests only
pytest customers/

# Order tests only
pytest orders/

# Complaint tests only
pytest complaints/

# Cross-service tests only
pytest test_cross_service.py
```

### Run Tests by Marker
```bash
# Run only admin tests
pytest -m admin

# Run only async tests
pytest -m asyncio

# Run authentication tests
pytest -m auth
```

### Run with HTML Report
```bash
pytest --html=reports/test-report.html --self-contained-html
```

### Run with Coverage
```bash
pytest --cov=. --cov-report=html:reports/coverage
```

## 📊 Test Categories

### 1. Authentication Tests (`auth/`)
- ✅ User registration (happy path & validation)
- ✅ User login (success & invalid credentials)
- ✅ Profile management
- ✅ Admin operations
- ✅ Authorization checks

### 2. Customer Management Tests (`customers/`)
- ✅ Customer profile retrieval
- ✅ Customer statistics
- ✅ Admin customer listing
- ✅ Admin customer search
- ✅ Customer notes
- ✅ Authorization checks

### 3. Order Management Tests (`orders/`)
- ✅ Order creation
- ✅ Order listing
- ✅ Order details
- ✅ Order cancellation
- ✅ Admin order management
- ✅ Order status updates
- ✅ Validation & error handling

### 4. Complaint Management Tests (`complaints/`)
- ✅ Complaint filing
- ✅ Complaint listing
- ✅ Complaint details
- ✅ Comment addition
- ✅ Admin complaint management
- ✅ Status & priority updates
- ✅ Authorization checks

### 5. Cross-Service Integration Tests
- ✅ Complete user journey (register → order → complaint)
- ✅ Service-to-service communication
- ✅ Data consistency verification
- ✅ Admin cross-service workflows

## 🔧 Configuration

### Service URLs
Configured in [config.py](config.py):
- ATHS: `http://localhost:5001`
- CRMS: `http://localhost:5002`
- ORMS: `http://localhost:5003`
- CMPS: `http://localhost:5004`

### Test Data
- **Prefix**: `TEST_AUTO_` (for easy identification)
- **Generation**: Dynamic using `TestDataGenerator`
- **Cleanup**: Automatic for each test run

### Admin Credentials
Update in [config.py](config.py) if different:
```python
ADMIN_USER = {
    "email": "admin@rman.com",
    "password": "Admin@123",
    "role": "Admin"
}
```

## 📈 Test Reports

After running tests, reports are generated in the `reports/` directory:
- **HTML Report**: `reports/integration-test-report.html`
- **Coverage Report**: `reports/coverage/index.html` (if using --cov)

## 🧪 Writing New Tests

### 1. Use Fixtures
```python
async def test_example(aths_client, test_customer_token):
    headers = aths_client.get_auth_headers(test_customer_token)
    response = await aths_client.get("/api/endpoint", headers=headers)
    assert response.status_code == 200
```

### 2. Available Fixtures
- `aths_client` - ATHS HTTP client
- `crms_client` - CRMS HTTP client
- `orms_client` - ORMS HTTP client
- `cmps_client` - CMPS HTTP client
- `admin_token` - Admin JWT token
- `test_customer_user` - Test customer user data
- `test_customer_token` - Test customer JWT token
- `test_data_generator` - Data generation utility

### 3. Use Helper Functions
```python
from utils.helpers import assert_success_response, assert_response_structure

data = response.json()
assert_success_response(data)
assert_response_structure(data["data"], ["field1", "field2"])
```

### 4. Generate Test Data
```python
def test_example(test_data_generator):
    user_data = test_data_generator.generate_user_data()
    order_items = test_data_generator.generate_order_items(3)
    address = test_data_generator.generate_shipping_address()
```

## 🐛 Troubleshooting

### Services Not Running
Ensure all four services are running before tests:
```bash
# Check service health
curl http://localhost:5001/health  # ATHS
curl http://localhost:5002/health  # CRMS
curl http://localhost:5003/health  # ORMS
curl http://localhost:5004/health  # CMPS
```

### Admin User Not Found
Create admin user in ATHS:
```bash
# Register admin via API or database
POST http://localhost:5001/api/auth/register
{
  "email": "admin@rman.com",
  "password": "Admin@123",
  "fullName": "Admin User",
  "contactNumber": "+919876543210",
  "role": "Admin"
}
```

### Port Conflicts
Update service URLs in [config.py](config.py) if using different ports.

### Async Test Errors
Ensure `pytest-asyncio` is installed and tests are marked with `@pytest.mark.asyncio`.

## 📝 Best Practices

1. **Independent Tests**: Each test should be self-contained
2. **Clean Data**: Use unique test data for each run
3. **Clear Assertions**: Use descriptive assertion messages
4. **Proper Cleanup**: Tests should not leave orphaned data
5. **Meaningful Names**: Test names should describe what they test
6. **Group Related Tests**: Use test classes for organization

## 🔐 Security Notes

- Test credentials are hardcoded for convenience
- Do NOT use these tests against production systems
- Service API keys are for testing only
- Test data includes `TEST_AUTO_` prefix for identification

## 📞 Support

For issues or questions:
1. Check service logs for errors
2. Verify all services are healthy
3. Review test output for specific failures
4. Check [pytest.ini](pytest.ini) for configuration options

## 📄 License

MIT License - See main project LICENSE file

## 👥 Contributors

- Ramkumar JD
- Training Team

---

**Last Updated**: 2026-01-27  
**Version**: 1.0.0
