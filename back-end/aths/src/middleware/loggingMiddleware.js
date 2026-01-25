import * as logger from '../utils/logger.js';

/**
 * Request Logging Middleware
 * Logs all incoming HTTP requests
 */

export const requestLogger = (req, res, next) => {
  // Log request
  logger.logRequest(req);

  // Log response
  const originalSend = res.send;
  res.send = function (data) {
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      responseTime: Date.now() - req.startTime,
    });
    originalSend.call(this, data);
  };

  req.startTime = Date.now();
  next();
};

export default requestLogger;
