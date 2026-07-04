import { BaseAgent } from '../../base/BaseAgent.js';
import { RuleEngine } from '../../shared/RuleEngine.js';
import riskConfig from '../../config/risk.config.js';
import { GeminiClient } from '../../../ai/GeminiClient.js';
import { PromptManager } from '../../../ai/PromptManager.js';
import RiskSchema from '../../../ai/ResponseSchemas/Risk.schema.js';
import { logger } from '../../../config/logger.js';

export class RiskAssessmentAgent extends BaseAgent {
  constructor() {
    super('RiskAssessmentAgent', 'Aggregates individual domain risk scores and calculates overall agricultural risk profile.');
  }

  validateInput(context) {
    super.validateInput(context);
    const requiredDependencies = ['FinancialAgent', 'WeatherAgent', 'CropAgent', 'MarketAgent'];
    for (const dep of requiredDependencies) {
      if (!context.hasAgentResult(dep)) {
        throw new Error(`[RiskAssessmentAgent] Dependency error: "${dep}" results must be present in context.`);
      }
    }
  }

  getConfidence(context) {
    const dependencies = ['FinancialAgent', 'WeatherAgent', 'CropAgent', 'MarketAgent'];
    const successCount = dependencies.filter(dep => {
      const res = context.getAgentResult(dep);
      return res && res.status === 'success';
    }).length;
    return parseFloat((successCount / dependencies.length).toFixed(2));
  }

  async _run(context) {
    try {
      const { systemInstruction, prompt } = PromptManager.getPrompt(this.name, context, {
        weights: riskConfig.weights,
        thresholds: riskConfig.thresholds
      });

      const validateFn = (data) => {
        if (typeof data.overallScore !== 'number' || data.overallScore < 0 || data.overallScore > 100) {
          throw new Error('overallScore must be a number between 0 and 100.');
        }
        if (!data.overallRisk) {
          throw new Error('Missing overallRisk.');
        }
      };

      const result = await GeminiClient.generateWithCorrection(
        prompt,
        systemInstruction,
        RiskSchema,
        validateFn
      );

      logger.info(`[RiskAssessmentAgent] Gemini call succeeded. Model: ${result.model}, Prompt Length: ${result.promptLength}`);
      return result.data;
    } catch (err) {
      logger.warn(`[RiskAssessmentAgent] Gemini call failed, falling back to deterministic engine. Error: ${err.message}`);
      return this._runDeterministic(context);
    }
  }

  async _runDeterministic(context) {
    const finRes = context.getAgentResult('FinancialAgent')?.data || {};
    const weatherRes = context.getAgentResult('WeatherAgent')?.data || {};
    const cropRes = context.getAgentResult('CropAgent')?.data || {};
    const marketRes = context.getAgentResult('MarketAgent')?.data || {};

    // 1. Fetch individual scores
    const financialScore = finRes.financialRiskScore !== undefined ? finRes.financialRiskScore : 50;
    const weatherScore = weatherRes.weatherScore !== undefined ? weatherRes.weatherScore : 50;
    const cropScore = cropRes.cropScore !== undefined ? (100 - cropRes.cropScore) : 50;
    const marketScore = marketRes.priceScore !== undefined ? (100 - marketRes.priceScore) : 50;

    // Wellness fallback
    let wellnessScore = 50;
    if (context.hasAgentResult('WellnessAgent')) {
      const wellnessRes = context.getAgentResult('WellnessAgent')?.data || {};
      const score = wellnessRes.wellnessScore !== undefined ? wellnessRes.wellnessScore : 50;
      wellnessScore = 100 - score;
    }

    // 2. Weighted Formula calculation
    const weightedScore = 
      (financialScore * riskConfig.weights.financial) +
      (weatherScore * riskConfig.weights.weather) +
      (cropScore * riskConfig.weights.crop) +
      (marketScore * riskConfig.weights.market) +
      (wellnessScore * riskConfig.weights.wellness);

    const overallScore = Math.round(weightedScore);

    // 3. Classify overall risk level using RuleEngine
    const overallRisk = RuleEngine.classifyRisk(overallScore, riskConfig.thresholds);

    const riskBreakdown = {
      financial: financialScore,
      weather: weatherScore,
      crop: cropScore,
      market: marketScore,
      wellness: wellnessScore
    };

    // 4. Reasoning
    let reasoning = `Overall risk is ${overallRisk} with a composite score of ${overallScore}/100. `;
    if (financialScore > 70) {
      reasoning += `High debt and low financial cushion is the primary risk driver. `;
    }
    if (weatherScore > 70) {
      reasoning += `Unfavorable climate patterns pose immediate crop failure hazards. `;
    }
    if (marketScore > 70) {
      reasoning += `Downward market price trends are threatening harvest profit margins. `;
    }

    return {
      overallScore,
      overallRisk,
      riskBreakdown,
      reasoning
    };
  }
}
