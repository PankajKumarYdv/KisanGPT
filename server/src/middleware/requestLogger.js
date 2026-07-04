import { logger } from '../config/logger.js';

export const requestLogger = (req, res, next) => {
  const startTime = process.hrtime();
  const ip = req.ip || req.connection.remoteAddress;

  // Since authentication happens later, req.user will be populated by the time the request finishes.
  // We can log the user ID on response finish.
  
  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const responseTime = Math.round((diff[0] * 1e9 + diff[1]) / 1e6); // ms

    const userId = req.user ? req.user.id : undefined;

    logger.info(`Request completed`, {
      requestId: req.requestId,
      userId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      ip
    });
  });

  next();
};
