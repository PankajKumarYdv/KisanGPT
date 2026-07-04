import { BaseAgent } from '../../base/BaseAgent.js';
import { RuleEngine } from '../../shared/RuleEngine.js';
import cropConfig from '../../config/crop.config.js';
import { GeminiClient } from '../../../ai/GeminiClient.js';
import { PromptManager } from '../../../ai/PromptManager.js';
import CropSchema from '../../../ai/ResponseSchemas/Crop.schema.js';
import { logger } from '../../../config/logger.js';

export class CropAgent extends BaseAgent {
  constructor() {
    super('CropAgent', 'Provides crop health analysis, pest/disease risk, and agronomic advisories.');
  }

  validateInput(context) {
    super.validateInput(context);
    const farmer = context.farmer;
    if (!farmer.cropType || !farmer.soilType) {
      throw new Error('[CropAgent] Farmer cropType and soilType are required fields.');
    }
    if (!context.hasAgentResult('WeatherAgent')) {
      throw new Error('[CropAgent] Dependency error: WeatherAgent results must be present in context.');
    }
  }

  getConfidence(context) {
    const weatherResult = context.getAgentResult('WeatherAgent');
    return weatherResult && weatherResult.status === 'success' ? 0.90 : 0.60;
  }

  async _run(context) {
    try {
      const soilType = (context.farmer.soilType || 'alluvial').toLowerCase();
      const suitableCrops = cropConfig.suitabilityMatrix[soilType] || [];
      const { systemInstruction, prompt } = PromptManager.getPrompt(this.name, context, suitableCrops);

      const validateFn = (data) => {
        if (typeof data.cropScore !== 'number' || data.cropScore < 0 || data.cropScore > 100) {
          throw new Error('cropScore must be a number between 0 and 100.');
        }
      };

      const result = await GeminiClient.generateWithCorrection(
        prompt,
        systemInstruction,
        CropSchema,
        validateFn
      );

      logger.info(`[CropAgent] Gemini call succeeded. Model: ${result.model}, Prompt Length: ${result.promptLength}`);
      return result.data;
    } catch (err) {
      logger.warn(`[CropAgent] Gemini call failed, falling back to deterministic engine. Error: ${err.message}`);
      return this._runDeterministic(context);
    }
  }

  async _runDeterministic(context) {
    const cropType = (context.farmer.cropType || 'wheat').toLowerCase();
    const soilType = (context.farmer.soilType || 'alluvial').toLowerCase();
    const weatherResult = context.getAgentResult('WeatherAgent');
    const weatherData = weatherResult?.data || {};

    const { rainfall, droughtRisk, floodRisk } = weatherData;

    // 1. Crop Suitability assessment based on soil matrix
    const suitableCrops = cropConfig.suitabilityMatrix[soilType] || [];
    const isSuitable = suitableCrops.includes(cropType);
    const cropSuitability = isSuitable 
      ? `Highly suitable for ${soilType} soil` 
      : `Sub-optimal (suitable crops for ${soilType} are: ${suitableCrops.join(', ')})`;

    // 2. Expected Yield multiplier based on climate risks and suitability
    let expectedYield = 'Standard Average';
    let cropScore = 75; // baseline crop score

    if (!isSuitable) {
      cropScore -= 20;
    }

    if (droughtRisk > 70 || floodRisk > 70) {
      expectedYield = 'Low (risk of crop failure)';
      cropScore -= 30;
    } else if (droughtRisk > 40 || floodRisk > 40) {
      expectedYield = 'Moderate (yield reduction expected)';
      cropScore -= 15;
    } else if (isSuitable) {
      expectedYield = 'High Yield Sowing Season';
      cropScore += 15;
    }
    cropScore = Math.max(0, Math.min(100, cropScore));

    // 3. Disease Risk evaluation based on weather
    let diseaseRisk = 'Low';
    let preventiveMeasures = [];

    if (rainfall > 1500) {
      diseaseRisk = 'High (Risk of root rot and downy mildew)';
      preventiveMeasures.push('Clear all blockages in drainage trenches immediately.');
      preventiveMeasures.push('Apply copper-based fungicides if humidity persists above 85%.');
    } else if (rainfall < 300) {
      diseaseRisk = 'Medium (Risk of sucking pests: aphids, whiteflies)';
      preventiveMeasures.push('Use yellow sticky traps to capture sucking insects.');
      preventiveMeasures.push('Set up light neem-oil sprays at dusk.');
    } else {
      preventiveMeasures.push('Follow default weeding and light fertilization schedule.');
    }

    // 4. Alternative crops recommendation
    const alternativeCrops = suitableCrops.filter(c => c !== cropType);

    return {
      cropSuitability,
      expectedYield,
      diseaseRisk,
      alternativeCrops,
      preventiveMeasures,
      cropScore
    };
  }
}
