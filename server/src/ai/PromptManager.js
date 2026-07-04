import FinancialPrompt from './PromptTemplates/Financial.prompt.js';
import WeatherPrompt from './PromptTemplates/Weather.prompt.js';
import CropPrompt from './PromptTemplates/Crop.prompt.js';
import MarketPrompt from './PromptTemplates/Market.prompt.js';
import GovernmentPrompt from './PromptTemplates/Government.prompt.js';
import WellnessPrompt from './PromptTemplates/Wellness.prompt.js';
import RiskPrompt from './PromptTemplates/Risk.prompt.js';
import PlanningPrompt from './PromptTemplates/Planning.prompt.js';

export class PromptManager {
  /**
   * Generates prompt contents and system instructions for a given agent.
   */
  static getPrompt(agentName, context, extraData = null) {
    switch (agentName) {
      case 'FinancialAgent':
        return FinancialPrompt(context);
      case 'WeatherAgent':
        return WeatherPrompt(context, extraData);
      case 'CropAgent':
        return CropPrompt(context, extraData);
      case 'MarketAgent':
        return MarketPrompt(context, extraData);
      case 'GovernmentSchemeAgent':
        return GovernmentPrompt(context, extraData);
      case 'WellnessAgent':
        return WellnessPrompt(context);
      case 'RiskAssessmentAgent':
        return RiskPrompt(context, extraData.weights, extraData.thresholds);
      case 'ActionPlanningAgent':
        return PlanningPrompt(context);
      default:
        throw new Error(`[PromptManager] Unknown agent: ${agentName}`);
    }
  }
}
