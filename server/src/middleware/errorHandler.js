import { ApiError } from '../utils/apiError.js';
import { logger } from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Map standard error messages to HTTP statuses
  const errorMessageMap = {
    'email address already in use': 400,
    'invalid email or password': 401,
    'incorrect old password': 400,
    'invalid or expired refresh token': 401,
    'refresh token is required': 400,
    'unauthorized': 401,
  };

  const messageLower = message.toLowerCase();
  
  if (statusCode === 500) {
    if (errorMessageMap[messageLower] !== undefined) {
      statusCode = errorMessageMap[messageLower];
    } else if (messageLower.includes('not found')) {
      statusCode = 404;
    } else if (messageLower.includes('access denied') || messageLower.includes('forbidden')) {
      statusCode = 403;
    }
  }

  // Log error using Winston
  logger.error(message, {
    requestId: req.requestId,
    userId: req.user ? req.user.id : undefined,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    statusCode
  });

  // Mongoose Cast Error
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource format';
    errors = [{ field: err.path, message: `Invalid format for path: ${err.path}` }];
  }

  // Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    message = 'Duplicate key error';
    errors = [{ field, message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already in use` }];
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  const isProd = process.env.NODE_ENV === 'production';

  const responsePayload = {
    success: false,
    statusCode,
    message,
    errors,
  };

  if (!isProd && err.stack) {
    responsePayload.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
};
