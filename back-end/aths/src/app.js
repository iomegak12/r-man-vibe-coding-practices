import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import 'express-async-errors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import internalRoutes from './routes/internalRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import swaggerSpec from './config/swagger.js';
import { requestLogger } from './middleware/loggingMiddleware.js';
import { apiLimiter } from './middleware/rateLimitMiddleware.js';
import requestId from './middleware/requestIdMiddleware.js';
import { responseTimeMiddleware } from './utils/performanceMonitor.js';
import { logError } from './utils/errorHandler.js';

/**
 * Express Application Setup
 * Configures Express app with middleware and basic routes
 */

const app = express();

// Security Middleware
app.use(helmet());

// Request ID & Performance Tracking
app.use(requestId);
app.use(responseTimeMiddleware);

// Request Logging
app.use(requestLogger);

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN === '*' ? '*' : process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
  credentials: process.env.CORS_ORIGIN === '*' ? false : process.env.CORS_CREDENTIALS === 'true',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Note: Rate limiting will be added when RATE_LIMIT_ENABLED=true in .env

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting (applies to all routes)
app.use(apiLimiter);

// Health Check Routes (no authentication required)
app.use('/health', healthRoutes);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'R-MAN Authentication Service API',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health Check Endpoint (legacy - kept for backwards compatibility)
app.get('/health-legacy', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication Service is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      authentication: '/api/auth',
      userProfile: '/api/user',
      admin: '/api/admin',
      internal: '/api/internal',
      health: '/health',
    },
    environment: process.env.NODE_ENV || 'development',
    service: 'ATHS',
    version: '1.0.0',
  });
});

// API Root Endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to R-MAN Authentication Service API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/internal', internalRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  // Log error
  logError(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [
      {
        field: 'server',
        message: 'An unexpected error occurred',
      },
    ],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
