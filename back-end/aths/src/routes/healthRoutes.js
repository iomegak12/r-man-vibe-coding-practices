import express from 'express';
import mongoose from 'mongoose';
import { info } from '../utils/logger.js';

/**
 * Health Check Routes
 * Provides service health status and diagnostics
 */

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     description: Simple health check endpoint to verify service is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Authentication Service is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-24T10:30:00.000Z
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                   example: 3600.25
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication Service is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check
 *     description: Comprehensive health check with service details, dependency status, and system metrics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service and all dependencies are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Authentication Service Health Check
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                 service:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Authentication Service (ATHS)
 *                     version:
 *                       type: string
 *                       example: 1.0.0
 *                     environment:
 *                       type: string
 *                       example: production
 *                     port:
 *                       type: number
 *                       example: 5001
 *                 dependencies:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: connected
 *                         message:
 *                           type: string
 *                           example: MongoDB connection is healthy
 *                         details:
 *                           type: object
 *                           properties:
 *                             collections:
 *                               type: number
 *                               example: 3
 *                             dataSize:
 *                               type: string
 *                               example: 2 MB
 *                     email:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: configured
 *                         service:
 *                           type: string
 *                           example: gmail
 *                 system:
 *                   type: object
 *                   properties:
 *                     memory:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: string
 *                           example: 128 MB
 *                         used:
 *                           type: string
 *                           example: 64 MB
 *                     cpu:
 *                       type: object
 *                     platform:
 *                       type: string
 *                       example: win32
 *                     nodeVersion:
 *                       type: string
 *                       example: v22.0.0
 *       503:
 *         description: Service or dependencies are unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Authentication Service Health Check
 *                 dependencies:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: disconnected
 *                         message:
 *                           type: string
 *                           example: MongoDB is not connected
 */
router.get('/detailed', async (req, res) => {
  const healthcheck = {
    success: true,
    message: 'Authentication Service Health Check',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: {
      name: 'Authentication Service (ATHS)',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5001,
    },
    dependencies: {
      database: {
        status: 'unknown',
        message: '',
      },
      email: {
        status: 'configured',
        service: process.env.EMAIL_SERVICE || 'gmail',
      },
    },
    system: {
      memory: {
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      },
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    },
  };

  // Check MongoDB connection
  try {
    if (mongoose.connection.readyState === 1) {
      healthcheck.dependencies.database.status = 'connected';
      healthcheck.dependencies.database.message = 'MongoDB connection is healthy';
      
      // Get database stats
      const dbStats = await mongoose.connection.db.stats();
      healthcheck.dependencies.database.details = {
        collections: dbStats.collections,
        dataSize: Math.round(dbStats.dataSize / 1024 / 1024) + ' MB',
      };
    } else {
      healthcheck.dependencies.database.status = 'disconnected';
      healthcheck.dependencies.database.message = 'MongoDB is not connected';
      healthcheck.success = false;
    }
  } catch (error) {
    healthcheck.dependencies.database.status = 'error';
    healthcheck.dependencies.database.message = error.message;
    healthcheck.success = false;
  }

  const statusCode = healthcheck.success ? 200 : 503;
  
  info('Health check requested', {
    status: healthcheck.success ? 'healthy' : 'unhealthy',
    ip: req.ip,
  });

  res.status(statusCode).json(healthcheck);
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Kubernetes readiness probe endpoint. Returns 200 if service is ready to accept traffic (database connected), 503 otherwise
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready to accept traffic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Service is ready
 *       503:
 *         description: Service is not ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Service not ready - database not connected
 *                 error:
 *                   type: string
 *                   example: Connection timeout
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if database is ready
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Service not ready - database not connected',
      });
    }

    // Service is ready
    res.status(200).json({
      success: true,
      message: 'Service is ready',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service not ready',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Kubernetes liveness probe endpoint. Always returns 200 if the service is running. Used to detect deadlocks and restart containers.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Service is alive
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Service is alive',
  });
});

export default router;
