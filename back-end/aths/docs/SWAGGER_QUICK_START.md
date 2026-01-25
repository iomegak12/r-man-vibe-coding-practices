# Swagger UI Quick Start Guide

## Getting Started with API Documentation

This guide will help you quickly get started with testing the Authentication Service APIs using the Swagger UI interface.

---

## 🚀 Step 1: Access Swagger UI

1. Make sure the service is running:
   ```bash
   cd back-end/aths
   node server.js
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:5001/api-docs
   ```

You should see the Swagger UI interface with all available endpoints organized by category.

---

## 📋 Step 2: Explore the API

### Understanding the Interface

- **Tags (Categories)**: Endpoints are grouped by function:
  - 🔐 **Authentication**: Public registration and login
  - 👤 **User Profile**: User account management
  - 🛡️ **Admin**: Administrator functions
  - 🔧 **Internal**: Service-to-service communication
  - 💚 **Health**: Service health monitoring

- **Endpoint Cards**: Each endpoint shows:
  - HTTP method (GET, POST, PUT, DELETE)
  - Endpoint path
  - Brief description
  - Lock icon (🔒) if authentication required

### Viewing Endpoint Details

Click on any endpoint to expand it and see:
- Full description
- Parameters and request body schema
- Response codes and examples
- Authentication requirements

---

## 🧪 Step 3: Test Your First API Call

### Register a New User

1. **Find the endpoint**:
   - Scroll to "Authentication" section
   - Click on `POST /api/auth/register`

2. **Try it out**:
   - Click the "Try it out" button
   - The request body becomes editable

3. **Fill in the request**:
   ```json
   {
     "email": "testuser@example.com",
     "password": "SecurePass123!",
     "fullName": "Test User",
     "contactNumber": "1234567890",
     "address": {
       "street": "123 Test St",
       "city": "Test City",
       "state": "TS",
       "zipCode": "12345",
       "country": "Test Country"
     }
   }
   ```

4. **Execute**:
   - Click the blue "Execute" button
   - Scroll down to see the response

5. **Check the response**:
   - You should see a 201 response with user details
   - Note: Check your email for verification (or check console logs for the verification token)

---

## 🔑 Step 4: Authenticate

### Login to Get Access Token

1. **Find login endpoint**:
   - `POST /api/auth/login` in Authentication section

2. **Try it out and execute**:
   ```json
   {
     "email": "testuser@example.com",
     "password": "SecurePass123!"
   }
   ```

3. **Copy the access token**:
   - In the response, find `accessToken`
   - Copy the entire token value (long string starting with "eyJ...")

### Set Up Authentication

1. **Click the "Authorize" button**:
   - Located at the top right of the page
   - It looks like a lock icon

2. **Enter your token**:
   - In the "bearerAuth" field, paste your access token
   - Format: Just paste the token (don't add "Bearer")
   - Click "Authorize"
   - Click "Close"

3. **You're authenticated!**:
   - All protected endpoints will now work
   - You'll see 🔓 icon on the Authorize button

---

## 👤 Step 5: Test Protected Endpoints

### Get Your Profile

1. **Navigate to User Profile section**:
   - Click `GET /api/user/profile`

2. **Try it out**:
   - Click "Try it out"
   - No parameters needed
   - Click "Execute"

3. **View your data**:
   - You should see your complete profile
   - 200 response code indicates success

### Update Your Profile

1. **Find the update endpoint**:
   - `PUT /api/user/profile`

2. **Modify your data**:
   ```json
   {
     "fullName": "Updated Test User",
     "contactNumber": "9876543210"
   }
   ```

3. **Execute and verify**:
   - Check the updated values in the response

---

## 🛡️ Step 6: Test Admin Endpoints (If Admin)

If you need to test admin endpoints, you'll need an admin account:

### Create Admin User (First time only)

Option 1: Update your user in MongoDB directly
```javascript
// In MongoDB
db.users.updateOne(
  { email: "testuser@example.com" },
  { $set: { role: "Administrator" } }
)
```

Option 2: Use the admin endpoints with an existing admin account

### Test Admin Features

1. **Get user statistics**:
   - `GET /api/admin/stats`
   - Shows total users, active users, etc.

2. **List all users**:
   - `GET /api/admin/users`
   - Try pagination: `?page=1&limit=10`

3. **Manage users**:
   - Activate/deactivate accounts
   - Change user roles
   - Delete users

---

## 🔧 Step 7: Understanding Responses

### Success Response (200, 201)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Your data here
  }
}
```

### Error Response (400, 401, 403, 404)
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error message"
    }
  ]
}
```

### Common HTTP Status Codes

| Code | Meaning | When it appears |
|------|---------|----------------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (registration) |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | User/resource doesn't exist |
| 409 | Conflict | Email already exists |
| 500 | Server Error | Something went wrong |

---

## 🎯 Common Testing Scenarios

### Scenario 1: Complete User Journey

1. ✅ Register new user → Get 201
2. ✅ Verify email (use token from console logs)
3. ✅ Login → Get access token
4. ✅ Authorize in Swagger UI
5. ✅ Get profile → See your data
6. ✅ Update profile → See changes
7. ✅ Change password → Confirm success
8. ✅ Logout → Token revoked

### Scenario 2: Password Reset Flow

1. ✅ Forgot password → Request reset
2. ✅ Check console for reset token
3. ✅ Reset password with token
4. ✅ Login with new password

### Scenario 3: Admin Operations

1. ✅ Login as admin
2. ✅ Get user statistics
3. ✅ List all users with filters
4. ✅ Deactivate a user account
5. ✅ Activate the account back
6. ✅ Change user role
7. ✅ Permanently delete a user

### Scenario 4: Token Management

1. ✅ Login → Get tokens
2. ✅ Use access token (30 min validity)
3. ✅ Refresh token → Get new access token
4. ✅ Logout → Both tokens revoked

---

## 💡 Pro Tips

### 1. Schema Exploration
- Click on "Schema" tab in request/response sections
- See all available fields and their types
- Understand required vs optional fields

### 2. Example Values
- Click "Example Value" to auto-fill request bodies
- Modify the values as needed
- Great starting point for testing

### 3. Copy as cURL
- After executing, find the cURL command
- Use it in your terminal or scripts
- Share with team members

### 4. Server Responses
- Always check the "Response body" section
- Look at "Response headers" for additional info
- Note the execution time

### 5. Multiple Environments
- Change the server URL if testing different environments
- Useful for development vs staging vs production

---

## ❌ Troubleshooting

### "401 Unauthorized" Error

**Problem**: Getting unauthorized even after login

**Solutions**:
1. Check if you clicked "Authorize" button
2. Ensure token was pasted correctly (no extra spaces)
3. Token might be expired (30 min validity) - login again
4. Make sure endpoint requires correct auth type

### "403 Forbidden" Error

**Problem**: You're authenticated but access denied

**Solutions**:
1. Check if you have required role (Customer vs Administrator)
2. Some endpoints are admin-only
3. Verify your account is active (`isActive: true`)

### "400 Validation Error"

**Problem**: Request validation failed

**Solutions**:
1. Check all required fields are provided
2. Verify email format is correct
3. Password must meet complexity requirements
4. Check field types match schema (string vs number)

### "404 Not Found"

**Problem**: Resource doesn't exist

**Solutions**:
1. Verify the ID in path parameters
2. Check if user/resource was deleted
3. Confirm MongoDB ObjectId format (24 hex characters)

### Swagger UI Not Loading

**Problem**: Page shows error or doesn't load

**Solutions**:
1. Verify service is running (`http://localhost:5001/health`)
2. Check console for JavaScript errors
3. Clear browser cache
4. Try different browser
5. Check if port 5001 is accessible

---

## 📚 Next Steps

### Learn More
- Read [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete reference
- Check [SWAGGER_IMPLEMENTATION_SUMMARY.md](SWAGGER_IMPLEMENTATION_SUMMARY.md) for technical details
- Review [Authentication-Service-Implementation-Guide.md](../../docs/Authentication-Service-Implementation-Guide.md)

### Integration
- Export OpenAPI spec: `http://localhost:5001/api-docs.json`
- Import to Postman for automated testing
- Use with API client tools (Insomnia, Paw, etc.)
- Generate client SDKs with OpenAPI Generator

### Advanced Features
- Set up API key for internal endpoints
- Test rate limiting (enable in .env)
- Monitor audit logs
- Check health endpoints for monitoring

---

## ✅ Checklist for First-Time Users

- [ ] Service is running on port 5001
- [ ] Swagger UI loads at /api-docs
- [ ] Can see all 25 endpoints
- [ ] Successfully registered a new user
- [ ] Received and copied access token
- [ ] Clicked "Authorize" and pasted token
- [ ] Successfully called a protected endpoint
- [ ] Understand success/error response formats
- [ ] Know how to refresh expired tokens
- [ ] Comfortable navigating the Swagger UI

---

## 🎉 You're Ready!

You now know how to:
- ✅ Access the Swagger UI
- ✅ Test public endpoints (register, login)
- ✅ Authenticate with JWT tokens
- ✅ Test protected endpoints
- ✅ Handle errors and responses
- ✅ Explore all available APIs

Happy testing! 🚀

---

**Need Help?**
- Check the [complete API documentation](API_DOCUMENTATION.md)
- Review endpoint details in Swagger UI
- Test with the "Try it out" feature
- Examine response examples for guidance
