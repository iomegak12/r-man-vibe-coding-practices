# ATHS-CRMS Integration Guide

## Customer Auto-Registration on User Registration

**Document Version**: 1.0  
**Date**: January 26, 2026  
**Author**: Ramkumar JD  
**Target Team**: Authentication Service (ATHS) Development Team

---

## 📋 Overview

This document describes the integration requirements for the Authentication Service (ATHS) to automatically create customer records in the Customer Management Service (CRMS) when new users register with the "Customer" role.

### Purpose

When a user successfully registers in ATHS with a Customer role, ATHS should immediately call the CRMS internal API to create a corresponding customer profile. This ensures data consistency and eliminates manual customer creation.

### Benefits

- ✅ **Automatic Synchronization**: Customer records created instantly upon registration
- ✅ **Data Consistency**: Single source of truth for customer data
- ✅ **Reduced Latency**: No delays in customer profile availability
- ✅ **Idempotent**: Safe to call multiple times (won't create duplicates)

---

## 🔗 Integration Endpoint

### Endpoint Details

```
POST http://localhost:5002/api/customers/internal/create
```

**Environment URLs**:
- **Development**: `http://localhost:5002/api/customers/internal/create`
- **Production**: `http://<crms-production-host>:5002/api/customers/internal/create`

### Authentication

**Method**: Service API Key Authentication

**Header Required**:
```
x-api-key: b3a285fafe93756687343b95de0d4c82
```

⚠️ **Security Note**: Store the API key in environment variables, never hardcode in source code.

---

## 📤 Request Format

### Headers

```http
Content-Type: application/json
x-api-key: b3a285fafe93756687343b95de0d4c82
```

### Request Body

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "customer@example.com",
  "fullName": "John Doe",
  "contactNumber": "+1234567890"
}
```

### Field Descriptions

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `userId` | String | ✅ Yes | MongoDB ObjectId from ATHS user record | Min length: 1 |
| `email` | String | ✅ Yes | User's email address | Valid email format |
| `fullName` | String | ✅ Yes | User's full name | 2-100 characters |
| `contactNumber` | String | ✅ Yes | User's phone number | 10-20 characters |

### Data Mapping from ATHS

Map the ATHS user fields to CRMS request fields as follows:

| ATHS Field | CRMS Field |
|------------|------------|
| `_id` (or `id`) | `userId` |
| `email` | `email` |
| `fullName` | `fullName` |
| `contactNumber` | `contactNumber` |

---

## 📥 Response Format

### Success Response (200 OK)

#### New Customer Created

```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "customerId": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "email": "customer@example.com",
    "fullName": "John Doe",
    "contactNumber": "+1234567890",
    "customerStatus": "Active",
    "customerType": "Regular",
    "totalOrders": 0,
    "totalOrderValue": 0.0,
    "totalComplaints": 0,
    "openComplaints": 0,
    "lastOrderDate": null,
    "lastComplaintDate": null,
    "customerSince": "2026-01-26T10:30:00Z",
    "notes": [],
    "tags": [],
    "preferences": {},
    "metadata": {}
  }
}
```

#### Customer Already Exists (Idempotent)

```json
{
  "success": true,
  "message": "Customer already exists",
  "data": {
    "customerId": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "email": "customer@example.com",
    ...
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid Data

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body -> email",
      "message": "value is not a valid email address"
    }
  ]
}
```

#### 401 Unauthorized - Invalid API Key

```json
{
  "success": false,
  "message": "Invalid or missing service API key",
  "errors": [
    {
      "field": "authentication",
      "message": "Service API key authentication required"
    }
  ]
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Failed to create customer record",
  "errors": [
    {
      "field": "server",
      "message": "An unexpected error occurred. Please try again later."
    }
  ]
}
```

---

## 🔧 Implementation Steps

### Step 1: Add HTTP Client Configuration

Configure an HTTP client in ATHS to communicate with CRMS.

**Node.js Example** (using axios):
```javascript
const axios = require('axios');

const crmsClient = axios.create({
  baseURL: process.env.CRMS_BASE_URL || 'http://localhost:5002',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.CRMS_SERVICE_API_KEY
  }
});
```

**Environment Variables**:
```bash
CRMS_BASE_URL=http://localhost:5002
CRMS_SERVICE_API_KEY=b3a285fafe93756687343b95de0d4c82
```

### Step 2: Create Customer Service Module

Create a dedicated module for CRMS integration.

**File**: `src/services/customerService.js` (or equivalent)

```javascript
/**
 * Create customer record in CRMS
 * @param {Object} userData - User data from registration
 * @returns {Promise<Object>} - Customer creation response
 */
async function createCustomerInCRMS(userData) {
  try {
    const response = await crmsClient.post('/api/customers/internal/create', {
      userId: userData._id.toString(), // Convert ObjectId to string
      email: userData.email,
      fullName: userData.fullName,
      contactNumber: userData.contactNumber
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Failed to create customer in CRMS:', error.message);
    
    // Log error but don't fail registration
    // Customer can be created later via manual sync or retry
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { createCustomerInCRMS };
```

### Step 3: Integrate with Registration Flow

Modify the user registration endpoint to call CRMS after successful user creation.

**Location**: `src/controllers/authController.js` (or equivalent)

```javascript
const { createCustomerInCRMS } = require('../services/customerService');

async function registerUser(req, res) {
  try {
    // ... existing registration logic ...
    
    // Create user in ATHS database
    const newUser = await User.create({
      email: req.body.email,
      fullName: req.body.fullName,
      contactNumber: req.body.contactNumber,
      password: hashedPassword,
      role: req.body.role || 'Customer',
      // ... other fields ...
    });
    
    // ✅ NEW: Create customer in CRMS if role is Customer
    if (newUser.role === 'Customer') {
      const customerResult = await createCustomerInCRMS(newUser);
      
      if (customerResult.success) {
        console.log(`✅ Customer created in CRMS: ${newUser.email}`);
      } else {
        console.warn(`⚠️ Failed to create customer in CRMS: ${newUser.email}`);
        // Registration continues - customer can be synced later
      }
    }
    
    // ... send verification email ...
    // ... return success response ...
    
  } catch (error) {
    // ... error handling ...
  }
}
```

### Step 4: Error Handling Strategy

**Important**: CRMS customer creation should NOT block user registration.

```javascript
// ✅ CORRECT: Non-blocking approach
if (newUser.role === 'Customer') {
  createCustomerInCRMS(newUser)
    .then(result => {
      if (result.success) {
        logger.info('Customer created in CRMS', { userId: newUser._id });
      }
    })
    .catch(error => {
      logger.error('CRMS integration error', { userId: newUser._id, error });
      // Optionally: Add to retry queue
    });
}

// ❌ WRONG: Blocking approach (don't do this)
const customerResult = await createCustomerInCRMS(newUser);
if (!customerResult.success) {
  throw new Error('Customer creation failed');
}
```

### Step 5: Add Logging

Log all CRMS integration attempts for troubleshooting.

```javascript
// Log successful creation
logger.info('CRMS customer created', {
  userId: newUser._id,
  customerId: customerResult.data.data.customerId,
  timestamp: new Date()
});

// Log failures
logger.error('CRMS customer creation failed', {
  userId: newUser._id,
  error: error.message,
  timestamp: new Date()
});
```

---

## 🧪 Testing

### Manual Testing

#### 1. Test Successful Registration

**Request to ATHS**:
```bash
POST http://localhost:5001/api/auth/register
Content-Type: application/json

{
  "email": "testuser@example.com",
  "fullName": "Test User",
  "contactNumber": "+1234567890",
  "password": "SecurePass123!",
  "role": "Customer"
}
```

**Verify**:
1. User created in ATHS database
2. Customer created in CRMS database
3. Check CRMS: `GET http://localhost:5002/api/customers/internal/user/{userId}` with service API key

#### 2. Test Idempotency

Register the same user twice (or retry customer creation) - should return existing customer, not create duplicate.

#### 3. Test Error Handling

- Test with invalid API key (should log error but not fail registration)
- Test with CRMS service down (should log error but not fail registration)
- Test with missing required fields

### Automated Testing

```javascript
describe('CRMS Integration', () => {
  it('should create customer in CRMS on user registration', async () => {
    // Mock CRMS API call
    nock('http://localhost:5002')
      .post('/api/customers/internal/create')
      .reply(200, {
        success: true,
        message: 'Customer created successfully',
        data: { customerId: '507f1f77bcf86cd799439011' }
      });
    
    // Register user
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        fullName: 'Test User',
        contactNumber: '+1234567890',
        password: 'SecurePass123!',
        role: 'Customer'
      });
    
    expect(response.status).toBe(201);
    // Verify CRMS was called
  });
  
  it('should not fail registration if CRMS is down', async () => {
    // Mock CRMS failure
    nock('http://localhost:5002')
      .post('/api/customers/internal/create')
      .replyWithError('Service unavailable');
    
    // Registration should still succeed
    const response = await request(app)
      .post('/api/auth/register')
      .send({ /* registration data */ });
    
    expect(response.status).toBe(201);
  });
});
```

---

## 🔒 Security Considerations

### 1. API Key Protection

- ✅ Store API key in environment variables
- ✅ Never commit API key to version control
- ✅ Rotate API key periodically
- ✅ Use different keys for dev/staging/production

### 2. HTTPS in Production

- ✅ Use HTTPS for all CRMS API calls in production
- ✅ Validate SSL certificates
- ✅ Use secure key storage (AWS Secrets Manager, Azure Key Vault, etc.)

### 3. Timeout Configuration

Set appropriate timeouts to prevent hanging requests:

```javascript
const crmsClient = axios.create({
  baseURL: process.env.CRMS_BASE_URL,
  timeout: 5000, // 5 seconds
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.CRMS_SERVICE_API_KEY
  }
});
```

---

## 📊 Monitoring & Observability

### Metrics to Track

1. **CRMS Integration Success Rate**: Percentage of successful customer creations
2. **CRMS API Response Time**: Average time to create customer
3. **CRMS API Failures**: Count of failed integration attempts
4. **User Registrations**: Total registrations vs. customer records created

### Logging Best Practices

```javascript
// Structured logging
logger.info('CRMS customer creation initiated', {
  service: 'ATHS',
  operation: 'createCustomer',
  userId: user._id,
  email: user.email,
  timestamp: new Date().toISOString()
});

logger.info('CRMS customer creation completed', {
  service: 'ATHS',
  operation: 'createCustomer',
  userId: user._id,
  customerId: result.data.customerId,
  duration: endTime - startTime,
  timestamp: new Date().toISOString()
});
```

---

## 🔄 Retry Strategy (Optional)

For production resilience, consider implementing a retry mechanism:

```javascript
const retry = require('async-retry');

async function createCustomerWithRetry(userData) {
  return await retry(
    async (bail) => {
      try {
        const response = await crmsClient.post('/api/customers/internal/create', {
          userId: userData._id.toString(),
          email: userData.email,
          fullName: userData.fullName,
          contactNumber: userData.contactNumber
        });
        return response.data;
      } catch (error) {
        // Don't retry on 4xx errors (client errors)
        if (error.response && error.response.status < 500) {
          bail(error);
          return;
        }
        throw error; // Retry on 5xx or network errors
      }
    },
    {
      retries: 3,
      minTimeout: 1000,
      maxTimeout: 5000
    }
  );
}
```

---

## 📞 Support & Contact

### CRMS API Information

- **Service Name**: Customer Management Service (CRMS)
- **Port**: 5002
- **Swagger Documentation**: http://localhost:5002/docs
- **Health Check**: http://localhost:5002/health

### Questions or Issues?

Contact: **Ramkumar JD**  
Email: jd.ramkumar@gmail.com

---

## 📝 Checklist for ATHS Team

- [ ] Add CRMS base URL to environment variables
- [ ] Add CRMS service API key to environment variables
- [ ] Create `customerService.js` module
- [ ] Import and call `createCustomerInCRMS` in registration endpoint
- [ ] Implement non-blocking error handling
- [ ] Add logging for all CRMS integration calls
- [ ] Write unit tests for CRMS integration
- [ ] Write integration tests for registration flow
- [ ] Test with CRMS service running
- [ ] Test with CRMS service down (graceful degradation)
- [ ] Test idempotency (duplicate registrations)
- [ ] Update ATHS documentation
- [ ] Deploy to staging environment
- [ ] Perform end-to-end testing
- [ ] Deploy to production

---

## 🎯 Success Criteria

Integration is successful when:

1. ✅ New user registration creates customer record in CRMS
2. ✅ Registration does not fail if CRMS is unavailable
3. ✅ Duplicate customer records are not created (idempotent)
4. ✅ All CRMS calls are logged for monitoring
5. ✅ API key is securely stored in environment variables
6. ✅ Integration tests pass with 100% coverage
7. ✅ Response time is under 500ms for CRMS calls

---

**Document End**
