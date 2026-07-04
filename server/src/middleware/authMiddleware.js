import { verifyAccessToken } from '../utils/jwt.js';
import * as userRepository from '../repositories/userRepository.js';
import { ApiError } from '../utils/apiError.js';

export const authenticateUser = async (req, res, next) => {
  try {
    let token = null;

    // 1. Try to extract from Authorization Header
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Try to extract from cookies (using fallback parser if cookie-parser is not registered)
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) acc[key] = value;
        return acc;
      }, {});
      token = cookies.accessToken;
    }

    if (!token) {
      throw new ApiError(401, 'Authentication token is required');
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await userRepository.findById(decoded.id);

      if (!user) {
        throw new ApiError(401, 'User associated with this token not found');
      }

      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Access token has expired');
      }
      throw new ApiError(401, 'Invalid authentication token');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return error.send(res);
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      errors: [error.message],
    });
  }
};

export const authenticateToken = authenticateUser;
