import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID Middleware
 * Adds unique request ID to each request for tracing
 */

export const requestId = (req, res, next) => {
  // Use existing request ID if provided (from load balancer/proxy)
  const existingId = req.headers['x-request-id'];
  
  // Generate new ID if not present
  req.id = existingId || uuidv4();
  
  // Set response header
  res.setHeader('X-Request-ID', req.id);
  
  next();
};

export default requestId;
