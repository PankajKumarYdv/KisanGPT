import { BaseAgent } from '../../base/BaseAgent.js';
import { RuleEngine } from '../../shared/RuleEngine.js';
import wellnessConfig from '../../config/wellness.config.js';
import { GeminiClient } from '../../../ai/GeminiClient.js';
import { PromptManager } from '../../../ai/PromptManager.js';
import WellnessSchema from '../../../ai/ResponseSchemas/Wellness.schema.js';
import { logger } from '../../../config/logger.js';

export class WellnessAgent extends BaseAgent {
  constructor() {
    super('WellnessAgent', 'Evaluates farmer mental wellness, stress levels, and provides lifestyle/support recommendations.');
  }

  validateInput(context) {
    super.validateInput(context);
    if (!context.hasAgentResult('RiskAssessmentAgent')) {
      throw new Error('[WellnessAgent] Dependency error: RiskAssessmentAgent results must be present in context.');
    }
  }

  getConfidence(context) {
    const riskResult = context.getAgentResult('RiskAssessmentAgent');
    return riskResult && riskResult.status === 'success' ? 0.90 : 0.50;
  }

  async _run(context) {
    try {
      const { systemInstruction, prompt } = PromptManager.getPrompt(this.name, context);

      const validateFn = (data) => {
        if (typeof data.wellnessScore !== 'number' || data.wellnessScore < 0 || data.wellnessScore > 100) {
          throw new Error('wellnessScore must be a number between 0 and 100.');
        }
        if (!data.stressIndicator) {
          throw new Error('Missing stressIndicator.');
        }
      };

      const result = await GeminiClient.generateWithCorrection(
        prompt,
        systemInstruction,
        WellnessSchema,
        validateFn
      );

      logger.info(`[WellnessAgent] Gemini call succeeded. Model: ${result.model}, Prompt Length: ${result.promptLength}`);
      return result.data;
    } catch (err) {
      logger.warn(`[WellnessAgent] Gemini call failed, falling back to deterministic engine. Error: ${err.message}`);
      return this._runDeterministic(context);
    }
  }

  async _runDeterministic(context) {
    const finRes = context.getAgentResult('FinancialAgent')?.data || {};
    const riskRes = context.getAgentResult('RiskAssessmentAgent')?.data || {};

    const overallRiskScore = riskRes.overallScore !== undefined ? riskRes.overallScore : 50;
    const debtRatio = finRes.debtRatio || 0;
    const experience = context.farmer.farmingExperience || 0;

    // 1. Calculate stress baseline based on overall risk score
    let wellnessScore = 100 - overallRiskScore;

    // Apply adjustments based on debt ratio
    if (debtRatio > 2) {
      wellnessScore = Math.max(0, wellnessScore - 15);
    }

    // Apply experience resilience bonus
    if (experience >= wellnessConfig.resilienceBonus.experienceYears) {
      wellnessScore = Math.min(100, wellnessScore + wellnessConfig.resilienceBonus.scoreBoost);
    }

    // Determine Stress Indicator using RuleEngine style classification
    let stressIndicator = 'Low';
    if (wellnessScore < 40) {
      stressIndicator = 'Severe';
    } else if (wellnessScore < 60) {
      stressIndicator = 'High';
    } else if (wellnessScore < 80) {
      stressIndicator = 'Moderate';
    }

    // 2. Formulate encouraging support messages
    let supportMessage = 'You are doing a wonderful job managing your agricultural operations under current seasons. ';
    const positiveSuggestions = [];

    if (stressIndicator === 'Severe') {
      supportMessage += 'We understand times can be challenging. Please remember you are not alone. Seeking counsel is a sign of wisdom.';
      positiveSuggestions.push('Take a structured 1-day rest break away from field labor if possible.');
      positiveSuggestions.push('Connect with a local agricultural advisor to review potential debt restructuring.');
    } else if (stressIndicator === 'High' || stressIndicator === 'Moderate') {
      supportMessage += 'Balancing labor and weather changes requires great strength. Be proud of your hard work.';
      positiveSuggestions.push('Ensure you get at least 7 hours of sleep during peak harvesting cycles.');
      positiveSuggestions.push('Attend local community farmer gatherings to share support and tips.');
    } else {
      supportMessage += 'Excellent progress. Sowing and market conditions look solid. Keep sharing your knowledge with the village.';
      positiveSuggestions.push('Offer mentoring to younger or new farmers in your district.');
    }

    const localResources = {
      kisanCallCentre: wellnessConfig.helplineDirectory.kisanMitra,
      kiranSupport: wellnessConfig.helplineDirectory.mentalHealthHelpline,
      districtAdvisor: wellnessConfig.helplineDirectory.localAgriAdvisor
    };

    return {
      wellnessScore,
      stressIndicator,
      supportMessage,
      positiveSuggestions,
      localResources
    };
  }
}
