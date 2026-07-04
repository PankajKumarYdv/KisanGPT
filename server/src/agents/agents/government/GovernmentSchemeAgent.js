import { BaseAgent } from '../../base/BaseAgent.js';
import { RuleEngine } from '../../shared/RuleEngine.js';
import govConfig from '../../config/government.config.js';
import { GeminiClient } from '../../../ai/GeminiClient.js';
import { PromptManager } from '../../../ai/PromptManager.js';
import GovernmentSchema from '../../../ai/ResponseSchemas/Government.schema.js';
import { logger } from '../../../config/logger.js';

export class GovernmentSchemeAgent extends BaseAgent {
  constructor() {
    super('GovernmentSchemeAgent', 'Finds eligible central and state government agricultural schemes.');
  }

  validateInput(context) {
    super.validateInput(context);
    const farmer = context.farmer;
    if (farmer.landSize === undefined || !farmer.state) {
      throw new Error('[GovernmentSchemeAgent] Farmer state and landSize are required fields.');
    }
  }

  getConfidence(context) {
    return context.farmer.annualIncome !== undefined ? 0.95 : 0.70;
  }

  async _run(context) {
    try {
      const { systemInstruction, prompt } = PromptManager.getPrompt(this.name, context, govConfig.schemesList);

      const validateFn = (data) => {
        if (!Array.isArray(data.eligibleSchemes)) {
          throw new Error('eligibleSchemes must be an array.');
        }
        if (data.benefits === undefined) {
          throw new Error('benefits must be defined.');
        }
      };

      const result = await GeminiClient.generateWithCorrection(
        prompt,
        systemInstruction,
        GovernmentSchema,
        validateFn
      );

      logger.info(`[GovernmentSchemeAgent] Gemini call succeeded. Model: ${result.model}, Prompt Length: ${result.promptLength}`);
      return result.data;
    } catch (err) {
      logger.warn(`[GovernmentSchemeAgent] Gemini call failed, falling back to deterministic engine. Error: ${err.message}`);
      return this._runDeterministic(context);
    }
  }

  async _runDeterministic(context) {
    const farmer = context.farmer;
    const landSize = farmer.landSize || 0;
    const income = farmer.annualIncome || 0;
    const cropType = (farmer.cropType || '').toLowerCase();
    const state = (farmer.state || '').toLowerCase();
    const irrigationType = (farmer.irrigationType || '').toLowerCase();

    const eligibleSchemes = [];
    let totalBenefitsEstimate = 0;

    // Evaluate each scheme in the configuration using rules
    for (const scheme of govConfig.schemesList) {
      const rules = [];

      // Land size limit rule
      if (scheme.eligibilityRules.maxLandSize !== Infinity) {
        rules.push(() => landSize <= scheme.eligibilityRules.maxLandSize);
      }

      // Income limit rule
      if (scheme.eligibilityRules.maxIncome !== Infinity) {
        rules.push(() => income <= scheme.eligibilityRules.maxIncome);
      }

      // Crops match rule
      if (scheme.eligibilityRules.crops) {
        rules.push(() => scheme.eligibilityRules.crops.includes(cropType));
      }

      // States match rule
      if (scheme.eligibilityRules.states) {
        rules.push(() => scheme.eligibilityRules.states.includes(state));
      }

      // Irrigation types match rule
      if (scheme.eligibilityRules.irrigationTypes) {
        rules.push(() => scheme.eligibilityRules.irrigationTypes.some(t => irrigationType.includes(t)));
      }

      // Evaluate the conditions via RuleEngine
      if (RuleEngine.evaluateConditions(rules, context)) {
        eligibleSchemes.push({
          name: scheme.name,
          benefit: scheme.benefit,
          priority: scheme.priority,
          applicationSteps: scheme.applicationSteps,
          requiredDocuments: scheme.requiredDocuments
        });

        // Add numerical cash DBT estimate to total if applicable
        if (scheme.name.includes('PM-KISAN')) {
          totalBenefitsEstimate += 6000;
        } else if (scheme.name.includes('Pension')) {
          totalBenefitsEstimate += 12000;
        } else if (scheme.name.includes('Free Power')) {
          totalBenefitsEstimate += 24000;
        }
      }
    }

    return {
      eligibleSchemes,
      benefits: totalBenefitsEstimate > 0 
        ? `₹${totalBenefitsEstimate.toLocaleString('en-IN')} / year (Estimated Direct Cash equivalents)` 
        : 'In-kind Subsidy (Crop Insurance / Irrigation Equipment)'
    };
  }
}
