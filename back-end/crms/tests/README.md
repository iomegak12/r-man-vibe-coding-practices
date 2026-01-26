# CRMS Test Scripts

This directory contains test scripts for the Customer Management Service.

## Prerequisites

1. **CRMS Server**: Must be running on `http://localhost:5002`
2. **ATHS (Auth Service)**: Must be running on `http://localhost:5001`
3. **Python Requests Library**: Install with `pip install requests`

## Getting JWT Tokens

Before running the tests, you need to obtain valid JWT tokens from ATHS:

### For Admin Token:
```bash
# Login with admin credentials
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "your_password"}'
```

### For Customer Token:
```bash
# Login with customer credentials
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@example.com", "password": "your_password"}'
```

Copy the `accessToken` from each response and update the tokens in the test script.

## Running Tests

### Authentication Endpoint Tests

```bash
# Activate virtual environment
env\Scripts\activate

# Run the authentication tests
python tests/test_auth_endpoints.py
```

### What Gets Tested

The test script verifies:

1. ✅ **Health Check** - Endpoint accessible without authentication
2. ✅ **Missing Token** - Returns 401 Unauthorized
3. ✅ **Invalid Token** - Returns 401 Unauthorized
4. ✅ **Valid Admin Token** - Authentication successful
5. ✅ **Valid Customer Token** - Authentication successful
6. ✅ **Admin Authorization** - Admin can access admin-only endpoints
7. ✅ **Customer Authorization** - Customer can access customer-only endpoints
8. ✅ **Role Enforcement** - Customer cannot access admin endpoints (403 Forbidden)
9. ✅ **Role Enforcement** - Admin cannot access customer endpoints (403 Forbidden)
10. ✅ **Database Integration** - Customer data fetched from MongoDB

## Test Output

The script provides colored output:
- 🟢 **Green** - Test passed
- 🔴 **Red** - Test failed
- 🟡 **Yellow** - Warning or partial success
- 🔵 **Blue** - Test information

## Troubleshooting

### Connection Errors
If you see "Could not connect" errors:
- Verify CRMS is running: `http://localhost:5002/health`
- Check if the port is correct
- Ensure no firewall is blocking the connection

### Authentication Errors
If all auth tests fail with 401:
- Check if tokens are expired (JWT tokens have expiration)
- Verify the JWT_SECRET in CRMS matches ATHS
- Ensure you copied the complete token

### Authorization Errors
If role-based tests fail:
- Verify the token has the correct role claim
- Check if the user's role in ATHS is set properly
- Ensure role names match exactly ("Customer" or "Administrator")

## Adding More Tests

To add more test cases:

1. Define a new test function in `test_auth_endpoints.py`
2. Use the `test_endpoint()` helper function
3. Update the `main()` function to call your new test
4. Document the test in this README

## Next Steps

After Phase 3 and Phase 4 implementation, we'll add more test scripts for:
- Customer profile endpoints
- Admin customer management endpoints
- Internal service endpoints
