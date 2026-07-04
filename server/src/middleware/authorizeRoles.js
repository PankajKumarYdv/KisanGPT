import { ApiError } from '../utils/apiError.js';

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      const userRole = req.user.role.toLowerCase();
      const mappedAllowedRoles = allowedRoles.map(role => {
        const r = role.toLowerCase();
        if (r === 'agriculture officer') return 'advisor';
        return r;
      });

      if (!mappedAllowedRoles.includes(userRole)) {
        throw new ApiError(403, 'Forbidden: Insufficient permissions to perform this action');
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        return error.send(res);
      }
      return res.status(500).json({
        success: false,
        message: 'Internal authorization error',
        errors: [error.message],
      });
    }
  };
};
