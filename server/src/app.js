import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';

// Doc imports
import swaggerSpec from './docs/swagger.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import farmerRoutes from './routes/farmerRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import evaluationRoutes from './routes/evaluationRoutes.js';
import debugRoutes from './routes/debugRoutes.js';

// Middleware imports
import { requestIdMiddleware } from './middleware/requestIdMiddleware.js';
import { requestLogger } from './middleware/requestLogger.js';
import { xssSanitizer } from './middleware/xssSanitizer.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiError } from './utils/apiError.js';

// Load environment variables
dotenv.config();

const app = express();

// Trust first proxy
app.set('trust proxy', 1);

// Unique Request ID must run first
app.use(requestIdMiddleware);

// Request Logger using Winston
app.use(requestLogger);

// Global Security & Performance Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Ensure Swagger UI loads correctly in developer environment
}));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use(hpp());
app.use(xssSanitizer);

// Morgan dev logs fall back for clean terminal logs
app.use(morgan('dev'));

// Swagger UI mount
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Swagger JSON redirect helper
app.get('/api/docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Retrieve server and database health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy and connected to DB
 */
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Server health details retrieved successfully',
    data: {
      status: 'up',
      mongodb: mongoStatus,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    meta: {},
  });
});

// Bind route modules
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/debug', debugRoutes);

// 404 Route handler
app.use((req, res, next) => {
  next(new ApiError(404, 'Endpoint not found'));
});

// Global error handler
app.use(errorHandler);

export default app;
