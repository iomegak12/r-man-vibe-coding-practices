/**
 * Role-Based Access Control Middleware
 * Restricts access based on user roles
 */

/**
 * Check if user has required role
 * @param {Array|String} allowedRoles - Allowed role(s)
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errors: [
          {
            field: 'authorization',
            message: 'Please authenticate to access this resource',
          },
        ],
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden',
        errors: [
          {
            field: 'role',
            message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
          },
        ],
      });
    }

    next();
  };
};

/**
 * Check if user is Administrator
 */
export const isAdmin = authorizeRoles('Administrator');

/**
 * Check if user is Customer
 */
export const isCustomer = authorizeRoles('Customer');

/**
 * Check if user is Customer or Administrator
 */
export const isCustomerOrAdmin = authorizeRoles('Customer', 'Administrator');

export default {
  authorizeRoles,
  isAdmin,
  isCustomer,
  isCustomerOrAdmin,
};
