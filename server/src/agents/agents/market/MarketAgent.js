import { BaseAgent } from '../../base/BaseAgent.js';
import { RuleEngine } from '../../shared/RuleEngine.js';
import marketConfig from '../../config/market.config.js';
import { GeminiClient } from '../../../ai/GeminiClient.js';
import { PromptManager } from '../../../ai/PromptManager.js';
import MarketSchema from '../../../ai/ResponseSchemas/Market.schema.js';
import { logger } from '../../../config/logger.js';
import { MarketService } from '../../../integrations/market/MarketService.js';

export class MarketAgent extends BaseAgent {
  constructor() {
    super('MarketAgent', 'Analyzes agricultural commodity markets and provides Mandi prices and advisory.');
  }

  validateInput(context) {
    super.validateInput(context);
    if (!context.farmer.cropType) {
      throw new Error('[MarketAgent] Crop type is required for market pricing analysis.');
    }
  }

  getConfidence(context) {
    return 0.90;
  }

  async _run(context) {
    const farmer = context.farmer;
    const crop = farmer.cropType || 'Wheat';
    const state = farmer.state || 'Punjab';
    const district = farmer.district || 'Amritsar';
    let liveMarket = null;

    try {
      // 1. Fetch live mapped market prices
      liveMarket = await MarketService.getMarketPrice(crop, state, district);

      // 2. Call Gemini
      const { systemInstruction, prompt } = PromptManager.getPrompt(this.name, context, liveMarket);

      const validateFn = (data) => {
        if (typeof data.marketScore !== 'number' || data.marketScore < 0 || data.marketScore > 100) {
          throw new Error('marketScore must be a number between 0 and 100.');
        }
        if (!data.trend || !['Rising', 'Falling', 'Stable'].includes(data.trend)) {
          throw new Error('trend must be one of Rising, Falling, Stable.');
        }
      };

      const result = await GeminiClient.generateWithCorrection(
        prompt,
        systemInstruction,
        MarketSchema,
        validateFn
      );

      const resData = result.data;
      logger.info(`[MarketAgent] Live market analysis via Gemini succeeded. Model: ${result.model}`);

      // 3. Map new properties back to legacy properties to support downstream agents
      const sellNow = resData.recommendation.toLowerCase().includes('sell');
      const hold = resData.recommendation.toLowerCase().includes('hold') || !sellNow;

      const mappedTrend = resData.trend === 'Rising' ? 'Upward' : (resData.trend === 'Falling' ? 'Downward' : 'Stable');

      // Calculate profit margin details for expectedProfit string
      const profitPerQuintal = Math.round(resData.expectedPrice - liveMarket.productionCost);
      const margin = liveMarket.productionCost > 0 ? parseFloat(((profitPerQuintal / liveMarket.productionCost) * 100).toFixed(1)) : 0;
      const expectedProfit = profitPerQuintal > 0
        ? `₹${profitPerQuintal} / quintal (${margin}% profit margin)`
        : `No profit margin`;

      // Return unified response
      return {
        // New structure fields
        marketScore: resData.marketScore,
        trend: resData.trend, // 'Rising', 'Falling', 'Stable'
        recommendation: resData.recommendation,
        bestMarket: resData.bestMarket,
        expectedPrice: resData.expectedPrice,
        confidence: resData.confidence,

        // Legacy compatibility fields
        currentPrice: liveMarket.modalPrice,
        priceScore: resData.marketScore,
        sellNow,
        hold,
        expectedProfit
      };
    } catch (err) {
      logger.warn(`[MarketAgent] Live market API or Gemini call failed. Reverting to rule-based fallback. Error: ${err.message}`);
      return this._runDeterministic(context, liveMarket);
    }
  }

  async _runDeterministic(context, liveMarketData = null) {
    const cropType = (context.farmer.cropType || 'wheat').toLowerCase();
    const configData = marketConfig.mandiDatabase[cropType] || marketConfig.mandiDatabase.default;

    const currentPrice = liveMarketData ? liveMarketData.modalPrice : configData.currentPrice;
    const expectedPrice = liveMarketData ? Math.round(liveMarketData.modalPrice * 1.05) : configData.expectedPrice;
    const trend = liveMarketData ? (liveMarketData.modalPrice > liveMarketData.productionCost ? 'Upward' : 'Downward') : configData.trend;
    const bestMarket = liveMarketData ? liveMarketData.mandi : configData.bestMarket;
    const productionCost = liveMarketData ? liveMarketData.productionCost : configData.productionCost;

    // 1. Calculate profit margins
    const profitPerQuintal = currentPrice - productionCost;
    const profitMarginPercent = parseFloat(((profitPerQuintal / productionCost) * 100).toFixed(1));

    // 2. Classify profit margin into score (0 to 100) using RuleEngine
    const priceScore = RuleEngine.calculateScore(
      profitMarginPercent, 
      marketConfig.priceThresholds.lowProfit, 
      marketConfig.priceThresholds.highProfit
    );

    // 3. Advise Sell vs Hold based on trend
    let sellNow = false;
    let hold = false;

    if (trend === 'Upward') {
      hold = true;
    } else if (trend === 'Downward') {
      sellNow = true;
    } else {
      sellNow = true;
    }

    const expectedProfit = profitPerQuintal > 0 
      ? `₹${profitPerQuintal} / quintal (${profitMarginPercent}% profit margin)` 
      : `No profit margin (selling at production cost)`;

    const newTrend = trend === 'Upward' ? 'Rising' : (trend === 'Downward' ? 'Falling' : 'Stable');
    const recommendation = hold ? 'Hold stock' : 'Sell Now';

    return {
      // New structure fields
      marketScore: priceScore,
      trend: newTrend,
      recommendation,
      bestMarket,
      expectedPrice,
      confidence: 85,

      // Legacy compatibility fields
      currentPrice,
      expectedPrice,
      trend, // legacy trend 'Upward' | 'Downward' | 'Stable'
      sellNow,
      hold,
      bestMarket,
      expectedProfit,
      priceScore
    };
  }
}
