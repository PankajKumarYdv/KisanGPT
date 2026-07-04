import { BaseAgent } from '../../base/BaseAgent.js';
import { RuleEngine } from '../../shared/RuleEngine.js';
import planningConfig from '../../config/planning.config.js';
import { GeminiClient } from '../../../ai/GeminiClient.js';
import { PromptManager } from '../../../ai/PromptManager.js';
import PlanningSchema from '../../../ai/ResponseSchemas/Planning.schema.js';
import { logger } from '../../../config/logger.js';

export class ActionPlanningAgent extends BaseAgent {
  constructor() {
    super('ActionPlanningAgent', 'Synthesizes all insights into a chronological, prioritized action plan for the farmer.');
  }

  validateInput(context) {
    super.validateInput(context);
    const requiredDependencies = [
      'FinancialAgent', 'WeatherAgent', 'CropAgent', 
      'MarketAgent', 'GovernmentSchemeAgent', 
      'RiskAssessmentAgent', 'WellnessAgent'
    ];
    for (const dep of requiredDependencies) {
      if (!context.hasAgentResult(dep)) {
        throw new Error(`[ActionPlanningAgent] Dependency error: "${dep}" results must be present in context.`);
      }
    }
  }

  getConfidence(context) {
    return 0.95;
  }

  async _run(context) {
    try {
      const { systemInstruction, prompt } = PromptManager.getPrompt(this.name, context);

      const validateFn = (data) => {
        if (!Array.isArray(data.immediateActions)) {
          throw new Error('immediateActions must be an array.');
        }
        if (!data.priorityLevel) {
          throw new Error('Missing priorityLevel.');
        }
      };

      const result = await GeminiClient.generateWithCorrection(
        prompt,
        systemInstruction,
        PlanningSchema,
        validateFn
      );

      logger.info(`[ActionPlanningAgent] Gemini call succeeded. Model: ${result.model}, Prompt Length: ${result.promptLength}`);
      return result.data;
    } catch (err) {
      logger.warn(`[ActionPlanningAgent] Gemini call failed, falling back to deterministic engine. Error: ${err.message}`);
      return this._runDeterministic(context);
    }
  }

  async _runDeterministic(context) {
    const finRes = context.getAgentResult('FinancialAgent')?.data || {};
    const weatherRes = context.getAgentResult('WeatherAgent')?.data || {};
    const cropRes = context.getAgentResult('CropAgent')?.data || {};
    const marketRes = context.getAgentResult('MarketAgent')?.data || {};
    const govRes = context.getAgentResult('GovernmentSchemeAgent')?.data || {};
    const riskRes = context.getAgentResult('RiskAssessmentAgent')?.data || {};
    const wellnessRes = context.getAgentResult('WellnessAgent')?.data || {};

    const overallRisk = riskRes.overallRisk || 'Low';

    // 1. Compile Advice Categories
    const financialAdvice = finRes.recommendedActions || [];
    const cropAdvice = cropRes.preventiveMeasures || [];
    const marketAdvice = [marketRes.trend === 'Downward' 
      ? 'Downward market trend: Consider immediate sales at best local Mandi to avoid price drop.' 
      : 'Prices rising/stable: Consider warehousing and holding for higher profit.'];
    const governmentSchemeAdvice = govRes.eligibleSchemes?.map(s => `Apply for ${s.name} (Benefit: ${s.benefit})`) || [];

    // 2. Generate Chronological Plan Tiers
    const immediateActions = [];
    const sevenDayPlan = [];
    const thirtyDayPlan = [];
    const longTermPlan = [];

    // Immediate / 7-Day logic based on weather warning and crop risk
    if (weatherRes.weatherRisk === 'Critical' || weatherRes.weatherRisk === 'High') {
      immediateActions.push(`Prepare farm infrastructure for climate anomalies: ${weatherRes.weatherSummary}`);
    }
    if (cropRes.diseaseRisk.includes('High')) {
      immediateActions.push(`Begin crop sanitation: ${cropRes.diseaseRisk}`);
    }
    if (immediateActions.length === 0) {
      immediateActions.push('Confirm sowing/harvesting preparations and track commodity price changes.');
    }

    // 7-day plan
    sevenDayPlan.push(...cropAdvice.slice(0, 2));
    if (wellnessRes.stressIndicator === 'Severe') {
      sevenDayPlan.push(`Self Care: Review support suggestions: ${wellnessRes.supportMessage}`);
    }

    // 30-day plan
    thirtyDayPlan.push(...marketAdvice);
    if (governmentSchemeAdvice.length > 0) {
      thirtyDayPlan.push(governmentSchemeAdvice[0]);
    }

    // Long-term plan
    longTermPlan.push(...financialAdvice);
    if (governmentSchemeAdvice.length > 1) {
      longTermPlan.push(governmentSchemeAdvice[1]);
    }

    // Determine Priority level
    let priorityLevel = planningConfig.priorityLevels.low;
    if (overallRisk === 'Critical') {
      priorityLevel = planningConfig.priorityLevels.critical;
    } else if (overallRisk === 'High') {
      priorityLevel = planningConfig.priorityLevels.high;
    } else if (overallRisk === 'Medium') {
      priorityLevel = planningConfig.priorityLevels.medium;
    }

    // Estimate total cash benefits
    const estimatedBenefits = govRes.benefits || 'Varies by eligible scheme matching';

    return {
      immediateActions,
      sevenDayPlan,
      thirtyDayPlan,
      longTermPlan,
      financialAdvice,
      cropAdvice,
      marketAdvice,
      governmentSchemeAdvice,
      priorityLevel,
      estimatedBenefits
    };
  }
}
