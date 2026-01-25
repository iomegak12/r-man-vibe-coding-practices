import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Swagger/OpenAPI Configuration
 * API Documentation Setup for Authentication Service
 */

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'R-MAN Authentication Service API',
    version: '1.0.0',
    description: `
# Authentication Service (ATHS)

The Authentication Service is the centralized authentication and user management microservice for the R-MAN E-Commerce Customer Management System.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Profile Management**: Manage user profiles and account settings
- **Password Management**: Change password, forgot password, reset password
- **Email Verification**: Verify user email addresses
- **Admin Panel**: User management, statistics, and role management
- **Audit Logging**: Track all critical user actions
- **Health Monitoring**: Service health and performance metrics

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Password reset: 3 requests per hour

## Error Responses

All error responses follow a standard format:

\`\`\`json
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
\`\`\`
    `,
    contact: {
      name: 'Ramkumar JD',
      email: 'jd.ramkumar@gmail.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:5001',
      description: 'Development server',
    },
    {
      url: 'http://localhost:5001',
      description: 'Local server',
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication endpoints (registration, login, logout, password management)',
    },
    {
      name: 'User Profile',
      description: 'User profile management endpoints (view, update, delete)',
    },
    {
      name: 'Admin',
      description: 'Administrative endpoints for user management (requires Administrator role)',
    },
    {
      name: 'Internal',
      description: 'Internal service-to-service endpoints (requires service API key)',
    },
    {
      name: 'Health',
      description: 'Service health check and monitoring endpoints',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from login or registration',
      },
      serviceApiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Service-API-Key',
        description: 'Service-to-service authentication key',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '65a1b2c3d4e5f6g7h8i9j0k1',
            description: 'User ID',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
            description: 'User email address',
          },
          fullName: {
            type: 'string',
            example: 'John Doe',
            description: 'User full name',
          },
          contactNumber: {
            type: 'string',
            example: '+919876543210',
            description: 'User contact number',
          },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string', example: '123 Main Street' },
              city: { type: 'string', example: 'Bangalore' },
              state: { type: 'string', example: 'Karnataka' },
              zipCode: { type: 'string', example: '560001' },
              country: { type: 'string', example: 'India' },
            },
          },
          role: {
            type: 'string',
            enum: ['Customer', 'Administrator'],
            example: 'Customer',
            description: 'User role',
          },
          isActive: {
            type: 'boolean',
            example: true,
            description: 'Account activation status',
          },
          emailVerified: {
            type: 'boolean',
            example: false,
            description: 'Email verification status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-25T10:30:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-25T10:30:00.000Z',
          },
        },
      },
      Address: {
        type: 'object',
        properties: {
          street: { type: 'string', example: '123 Main Street' },
          city: { type: 'string', example: 'Bangalore' },
          state: { type: 'string', example: 'Karnataka' },
          zipCode: { type: 'string', example: '560001' },
          country: { type: 'string', example: 'India' },
        },
      },
      Tokens: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'JWT access token (30 minutes expiry)',
          },
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'JWT refresh token (7 days expiry)',
          },
          expiresIn: {
            type: 'number',
            example: 1800,
            description: 'Access token expiry in seconds',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error description',
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  example: 'email',
                },
                message: {
                  type: 'string',
                  example: 'Email is required',
                },
              },
            },
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Operation successful',
          },
          data: {
            type: 'object',
            description: 'Response data (varies by endpoint)',
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Unauthorized - Invalid or expired token',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              message: 'Invalid or expired token',
              errors: [
                {
                  field: 'token',
                  message: 'Your session has expired. Please login again.',
                },
              ],
            },
          },
        },
      },
      Forbidden: {
        description: 'Forbidden - Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              message: 'Access denied',
              errors: [
                {
                  field: 'authorization',
                  message: 'You do not have permission to access this resource',
                },
              ],
            },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              message: 'Resource not found',
              errors: [
                {
                  field: 'resource',
                  message: 'The requested resource was not found',
                },
              ],
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation error - Invalid request data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              message: 'Validation failed',
              errors: [
                {
                  field: 'email',
                  message: 'Email is required',
                },
                {
                  field: 'password',
                  message: 'Password must be at least 8 characters',
                },
              ],
            },
          },
        },
      },
      ServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              message: 'Internal server error',
              errors: [
                {
                  field: 'server',
                  message: 'An unexpected error occurred. Please try again later.',
                },
              ],
            },
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: [
    './src/routes/*.js',
    './src/models/*.js',
    './src/controllers/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
