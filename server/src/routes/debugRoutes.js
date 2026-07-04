import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { MetricsCollector } from '../agents/shared/MetricsCollector.js';
import { HealthMonitor } from '../agents/shared/HealthMonitor.js';
import pipelineMonitor from '../agents/shared/PipelineMonitor.js';
import { ExecutionTracer } from '../agents/shared/ExecutionTracer.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

/**
 * @swagger
 * /debug/metrics:
 *   get:
 *     summary: Retrieve debug metrics breakdown for charts
 *     tags: [Debug]
 */
router.get(
  '/metrics',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const metrics = MetricsCollector.getMetrics();
    new ApiResponse(200, 'Debug metrics retrieved successfully', metrics).send(res);
  })
);

/**
 * @swagger
 * /debug/agents:
 *   get:
 *     summary: Retrieve health status cards for all agents
 *     tags: [Debug]
 */
router.get(
  '/agents',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const statuses = HealthMonitor.getAgentsStatus();
    new ApiResponse(200, 'Debug agents status retrieved successfully', statuses).send(res);
  })
);

/**
 * @swagger
 * /debug/pipeline:
 *   get:
 *     summary: Retrieve timeline arrays, developer mode status, and graph nodes
 *     tags: [Debug]
 */
router.get(
  '/pipeline',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.query.devMode !== undefined) {
      pipelineMonitor.setDeveloperMode(req.query.devMode === 'true');
    }
    const data = pipelineMonitor.getDebugPipelineData();
    new ApiResponse(200, 'Debug pipeline configurations retrieved successfully', data).send(res);
  })
);

/**
 * @swagger
 * /debug/executions:
 *   get:
 *     summary: Retrieve chronological traces of all runs
 *     tags: [Debug]
 */
router.get(
  '/executions',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const traces = ExecutionTracer.getAllTraces();
    new ApiResponse(200, 'Debug executions traces retrieved successfully', traces).send(res);
  })
);

export default router;
