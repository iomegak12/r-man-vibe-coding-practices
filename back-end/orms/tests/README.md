# ORMS Tests

Python-based test scripts for Order Management Service.

## Prerequisites

```bash
pip install requests
```

## Test Scripts

### 1. test_phase3_orders.py
Complete end-to-end testing of Phase 3 functionality:
- User registration and login
- Order creation
- List orders with pagination
- Get order details
- Verify CRMS statistics update

**Run:**
```bash
cd back-end/orms
python tests/test_phase3_orders.py
```

### 2. test_edge_cases.py
Edge case and error handling tests:
- Authentication validation
- Empty items validation
- Invalid address validation
- Status filtering
- Search functionality
- Non-existent order handling
- Pagination testing

**Run:**
```bash
python tests/test_edge_cases.py
```

## Services Required

Make sure all services are running before running tests:
- **ATHS** (Authentication Service) - Port 5001
- **CRMS** (Customer Service) - Port 5002
- **ORMS** (Order Service) - Port 5003

## Test Data

Tests use the following test user:
- Email: `testcustomer@example.com`
- Password: `Test@123`
- Role: `customer`

The test scripts will automatically register this user if it doesn't exist.
