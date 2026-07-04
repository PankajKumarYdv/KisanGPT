import { Router } from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { MarketService } from '../integrations/market/MarketService.js';
import { MarketCache } from '../integrations/market/MarketCache.js';
import { MarketAgent } from '../agents/agents/market/MarketAgent.js';
import { AgentContext } from '../agents/shared/AgentContext.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

/**
 * @swagger
 * /market/current:
 *   get:
 *     summary: Retrieve current mapped mandi prices for a commodity/location
 *     tags: [Market]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: commodity
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: district
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current prices retrieved successfully
 */
router.get(
  '/current',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { commodity, state, district } = req.query;

    if (!commodity || !state || !district) {
      return res.status(400).json({
        success: false,
        message: 'commodity, state, and district are required query parameters.',
      });
    }

    const data = await MarketService.getMarketPrice(commodity, state, district);
    new ApiResponse(200, 'Current market prices retrieved successfully', data).send(res);
  })
);

/**
 * @swagger
 * /market/history:
 *   get:
 *     summary: Retrieve historical prices for a crop and district
 *     tags: [Market]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: commodity
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: district
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Historical prices retrieved successfully
 */
router.get(
  '/history',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { commodity, district, limit = 10 } = req.query;

    if (!commodity || !district) {
      return res.status(400).json({
        success: false,
        message: 'commodity and district are required query parameters.',
      });
    }

    const data = await MarketService.getHistoricalPrices(commodity, district, parseInt(limit));
    new ApiResponse(200, 'Historical market prices retrieved successfully', data).send(res);
  })
);

/**
 * @swagger
 * /market/test:
 *   post:
 *     summary: Force executes market fetching and returns advisory recommendation
 *     tags: [Market]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/test',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { farmer = {}, mockData } = req.body;
    const crop = farmer.cropType || 'Wheat';
    const state = farmer.state || 'Punjab';
    const district = farmer.district || 'Amritsar';
    const farmerId = farmer.id || farmer._id || new mongoose.Types.ObjectId().toString();

    if (mockData) {
      const modalPrice = typeof mockData.modalPrice === 'number' ? mockData.modalPrice : 2200;
      const minimumPrice = typeof mockData.minimumPrice === 'number' ? mockData.minimumPrice : Math.round(modalPrice * 0.95);
      const maximumPrice = typeof mockData.maximumPrice === 'number' ? mockData.maximumPrice : Math.round(modalPrice * 1.05);
      const arrivalQuantity = typeof mockData.arrivalQuantity === 'number' ? mockData.arrivalQuantity : 150;
      const productionCost = typeof mockData.productionCost === 'number' ? mockData.productionCost : 1500;

      const dummyMapped = {
        crop: crop.toLowerCase(),
        mandi: mockData.mandi || 'Test Khanna Mandi',
        district: district.toLowerCase(),
        state,
        arrivalQuantity,
        minimumPrice,
        maximumPrice,
        modalPrice,
        productionCost,
        lastUpdated: new Date().toISOString()
      };

      // Seed cache
      const cacheKey = `current:${crop.toLowerCase()}:${state.replace(/\s+/g, '_')}:${district.toLowerCase().replace(/\s+/g, '_')}`;
      await MarketCache.set(cacheKey, dummyMapped, 1); // cache for 1 hour
    }

    // Run agent execution
    const agent = new MarketAgent();
    const context = new AgentContext({
      farmer: {
        _id: farmerId,
        state,
        district,
        cropType: crop
      }
    });

    const agentResult = await agent.execute(context);
    new ApiResponse(200, 'Market agent test executed successfully', agentResult).send(res);
  })
);

export default router;
