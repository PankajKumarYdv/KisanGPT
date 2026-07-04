import app from './app.js';
import { connectDB } from './config/db.js';
import { validateEnv } from './config/env.js';
import { logger } from './config/logger.js';

// Validate env variables on startup
validateEnv();

const PORT = process.env.PORT || 5000;

let server;

// Connect to MongoDB
connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to database on startup:', err);
    process.exit(1);
  });

// Handle unhandled rejections globally
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at Promise:', { promise, reason });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
