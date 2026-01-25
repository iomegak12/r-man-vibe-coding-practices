/**
 * Service Authentication Middleware
 * Validates API key for internal service-to-service communication
 */

const SERVICE_API_KEY = process.env.SERVICE_API_KEY;

/**
 * Authenticate internal service requests
 * Validates X-Service-API-Key header
 */
export const authenticateService = (req, res, next) => {
  try {
    // Get API key from header
    const apiKey = req.headers['x-service-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Service authentication required',
        errors: [
          {
            field: 'x-service-api-key',
            message: 'Service API key is required in X-Service-API-Key header',
          },
        ],
      });
    }

    // Verify API key
    if (apiKey !== SERVICE_API_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Invalid service API key',
        errors: [
          {
            field: 'x-service-api-key',
            message: 'The provided service API key is invalid',
          },
        ],
      });
    }

    // Mark request as internal
    req.isInternalRequest = true;

    next();
  } catch (error) {
    console.error('Service authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Service authentication failed',
      errors: [
        {
          field: 'server',
          message: 'An error occurred during service authentication',
        },
      ],
    });
  }
};

export default {
  authenticateService,
};
