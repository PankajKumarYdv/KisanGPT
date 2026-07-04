import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack, requestId, userId, method, url, statusCode, responseTime }) => {
    let metaStr = '';
    if (requestId) metaStr += ` [reqId=${requestId}]`;
    if (userId) metaStr += ` [userId=${userId}]`;
    if (method && url) metaStr += ` ${method} ${url}`;
    if (statusCode) metaStr += ` ${statusCode}`;
    if (responseTime) metaStr += ` ${responseTime}ms`;
    
    return `[${timestamp}] ${level}:${metaStr} ${message}${stack ? `\n${stack}` : ''}`;
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'kisangpt-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}
