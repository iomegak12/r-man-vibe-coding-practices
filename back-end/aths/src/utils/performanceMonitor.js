import { info, warn } from './logger.js';

/**
 * Performance Monitoring Utilities
 * Tracks and logs slow operations
 */

/**
 * Monitor async function execution time
 * @param {Function} fn - Async function to monitor
 * @param {String} operationName - Name of the operation
 * @param {Number} thresholdMs - Warn if operation exceeds this (ms)
 */
export const monitorPerformance = async (fn, operationName, thresholdMs = 1000) => {
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    if (duration > thresholdMs) {
      warn(`Slow operation detected: ${operationName}`, {
        duration: `${duration}ms`,
        threshold: `${thresholdMs}ms`,
      });
    } else {
      info(`Operation completed: ${operationName}`, {
        duration: `${duration}ms`,
      });
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    warn(`Operation failed: ${operationName}`, {
      duration: `${duration}ms`,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Middleware to track request response time
 */
export const responseTimeMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.json to capture when response is sent
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - startTime;
    
    // Add response time header
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    // Log slow requests (> 2 seconds)
    if (duration > 2000) {
      warn(`Slow request detected: ${req.method} ${req.path}`, {
        duration: `${duration}ms`,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
      });
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Get performance metrics
 */
export const getPerformanceMetrics = () => {
  const memUsage = process.memoryUsage();
  
  return {
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
      rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
      external: Math.round(memUsage.external / 1024 / 1024) + ' MB',
    },
    cpu: process.cpuUsage(),
    platform: process.platform,
    nodeVersion: process.version,
  };
};

export default {
  monitorPerformance,
  responseTimeMiddleware,
  getPerformanceMetrics,
};
