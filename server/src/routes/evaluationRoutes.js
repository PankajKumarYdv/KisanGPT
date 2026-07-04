import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { AgentEvaluationEngine } from '../agents/evaluation/AgentEvaluationEngine.js';
import { BenchmarkDatasets } from '../agents/evaluation/BenchmarkDatasets.js';
import { MetricsCollector } from '../agents/shared/MetricsCollector.js';
import executionHistory from '../agents/shared/ExecutionHistory.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const evalEngine = new AgentEvaluationEngine();

let latestBenchmarkReport = null;

/**
 * @swagger
 * /evaluation/run-benchmark:
 *   post:
 *     summary: Run all benchmark scenarios and return evaluated metrics
 *     tags: [Evaluation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: load
 *         schema:
 *           type: integer
 *           description: Simulation requests count (load testing)
 */
router.post(
  '/run-benchmark',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const scenarioKeys = Object.keys(BenchmarkDatasets);
    const scenarioReports = [];

    let totalPassed = 0;
    let totalAssertions = 0;

    for (const key of scenarioKeys) {
      try {
        const scenarioReport = await evalEngine.runScenario(key);
        scenarioReports.push(scenarioReport);
        
        scenarioReport.assertions.forEach(a => {
          totalAssertions++;
          if (a.passed) totalPassed++;
        });
      } catch (err) {
        scenarioReports.push({
          scenarioKey: key,
          status: 'error',
          error: err.message
        });
      }
    }

    const successRate = totalAssertions > 0 ? parseFloat((totalPassed / totalAssertions).toFixed(2)) : 1.0;

    let loadTestingReport = null;
    if (req.query.load) {
      const count = parseInt(req.query.load, 10) || 10;
      loadTestingReport = await evalEngine.runLoadTest(count);
    }

    latestBenchmarkReport = {
      timestamp: new Date().toISOString(),
      overallScore: Math.round(successRate * 100),
      successRate,
      scenariosExecuted: scenarioKeys.length,
      scenarios: scenarioReports,
      loadTesting: loadTestingReport
    };

    new ApiResponse(200, 'Benchmarks executed successfully', latestBenchmarkReport).send(res);
  })
);

/**
 * @swagger
 * /evaluation/report:
 *   get:
 *     summary: Retrieve the latest evaluation report
 *     tags: [Evaluation]
 */
router.get(
  '/report',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (!latestBenchmarkReport) {
      // Execute automatically on first request to have a report
      const scenarioKeys = Object.keys(BenchmarkDatasets);
      const scenarioReports = [];
      let totalPassed = 0;
      let totalAssertions = 0;
      for (const key of scenarioKeys) {
        try {
          const scenarioReport = await evalEngine.runScenario(key);
          scenarioReports.push(scenarioReport);
          scenarioReport.assertions.forEach(a => {
            totalAssertions++;
            if (a.passed) totalPassed++;
          });
        } catch (err) {
          scenarioReports.push({ scenarioKey: key, status: 'error', error: err.message });
        }
      }
      const successRate = totalAssertions > 0 ? parseFloat((totalPassed / totalAssertions).toFixed(2)) : 1.0;
      latestBenchmarkReport = {
        timestamp: new Date().toISOString(),
        overallScore: Math.round(successRate * 100),
        successRate,
        scenariosExecuted: scenarioKeys.length,
        scenarios: scenarioReports,
        loadTesting: null
      };
    }
    new ApiResponse(200, 'Evaluation report retrieved successfully', latestBenchmarkReport).send(res);
  })
);

/**
 * @swagger
 * /evaluation/metrics:
 *   get:
 *     summary: Retrieve aggregated execution metrics
 *     tags: [Evaluation]
 */
router.get(
  '/metrics',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const stats = MetricsCollector.getMetrics();
    new ApiResponse(200, 'Evaluation metrics retrieved successfully', stats).send(res);
  })
);

/**
 * @swagger
 * /evaluation/history:
 *   get:
 *     summary: Retrieve history of all execution reports
 *     tags: [Evaluation]
 */
router.get(
  '/history',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const history = executionHistory.getAll();
    new ApiResponse(200, 'Execution history retrieved successfully', history).send(res);
  })
);

/**
 * @swagger
 * /evaluation/benchmark:
 *   get:
 *     summary: Retrieve benchmark dataset configurations
 *     tags: [Evaluation]
 */
router.get(
  '/benchmark',
  authenticateToken,
  asyncHandler(async (req, res) => {
    new ApiResponse(200, 'Benchmark scenarios configurations retrieved successfully', BenchmarkDatasets).send(res);
  })
);

export default router;
