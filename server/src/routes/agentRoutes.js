import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { OrchestratorAgent } from '../agents/orchestrator/OrchestratorAgent.js';
import registry from '../agents/shared/AgentRegistry.js';
import executionHistory from '../agents/shared/ExecutionHistory.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const orchestrator = new OrchestratorAgent();

// In-memory stats counter
let executionCount = 0;
let failedCount = 0;

/**
 * @swagger
 * tags:
 *   name: Agents
 *   description: KisanGPT Multi-Agent Framework status and execution APIs
 */

/**
 * @swagger
 * /agents/status:
 *   get:
 *     summary: Retrieve agents status and registry statistics
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved agent framework status
 */
router.get(
  '/status',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const registryStats = registry.getStats();

    const data = {
      version: '1.0.0',
      status: 'healthy',
      registry: registryStats,
      executionStatistics: {
        totalRuns: executionCount,
        failedRuns: failedCount,
        healthyAgents: registryStats.healthyAgents
      }
    };

    new ApiResponse(200, 'Agent registry status retrieved successfully', data).send(res);
  })
);

/**
 * @swagger
 * /agents/run:
 *   post:
 *     summary: Run the complete multi-agent pipeline with a farmer profile
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               state:
 *                 type: string
 *                 example: Punjab
 *               district:
 *                 type: string
 *                 example: Amritsar
 *               landSize:
 *                 type: number
 *                 example: 5
 *               cropType:
 *                 type: string
 *                 example: Wheat
 *               annualIncome:
 *                 type: number
 *                 example: 300000
 *               loanAmount:
 *                 type: number
 *                 example: 150000
 *     responses:
 *       200:
 *         description: Multi-agent execution report and timeline
 */
router.post(
  '/run',
  authenticateToken,
  asyncHandler(async (req, res) => {
    executionCount++;
    
    const farmerInput = {
      state: req.body.state || 'Punjab',
      district: req.body.district || 'Amritsar',
      village: req.body.village || 'Jassa',
      landSize: req.body.landSize !== undefined ? req.body.landSize : 5,
      landUnit: req.body.landUnit || 'acres',
      cropType: req.body.cropType || 'Wheat',
      irrigationType: req.body.irrigationType || 'tube-well',
      soilType: req.body.soilType || 'Alluvial',
      annualIncome: req.body.annualIncome !== undefined ? req.body.annualIncome : 300000,
      loanAmount: req.body.loanAmount !== undefined ? req.body.loanAmount : 150000,
      farmingExperience: req.body.farmingExperience !== undefined ? req.body.farmingExperience : 12,
      livestock: req.body.livestock || ['cow', 'buffalo']
    };

    try {
      const report = await orchestrator.runPipeline(farmerInput);
      
      if (report.executionSummary.status === 'degraded') {
        failedCount++;
      }
      
      new ApiResponse(200, 'Multi-agent pipeline executed successfully', report).send(res);
    } catch (error) {
      failedCount++;
      throw error;
    }
  })
);

/**
 * @swagger
 * /agents/execution/{id}:
 *   get:
 *     summary: Retrieve execution report by pipeline execution ID
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Execution report details
 *       404:
 *         description: Execution history not found
 */
router.get(
  '/execution/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const report = executionHistory.get(req.params.id);
    if (!report) {
      throw new ApiError(404, `Execution history for ID "${req.params.id}" not found.`);
    }

    new ApiResponse(200, 'Execution history report retrieved successfully', report).send(res);
  })
);

export default router;
