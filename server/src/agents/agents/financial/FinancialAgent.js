import { BaseAgent } from '../../base/BaseAgent.js';
import { RuleEngine } from '../../shared/RuleEngine.js';
import financialConfig from '../../config/financial.config.js';
import { GeminiClient } from '../../../ai/GeminiClient.js';
import { PromptManager } from '../../../ai/PromptManager.js';
import FinancialSchema from '../../../ai/ResponseSchemas/Financial.schema.js';
import { logger } from '../../../config/logger.js';

export class FinancialAgent extends BaseAgent {
  constructor() {
    super('FinancialAgent', 'Analyzes the farmer\'s financial stability and debt risk profile.');
  }

  validateInput(context) {
    super.validateInput(context);
    const farmer = context.farmer;
    if (farmer.annualIncome === undefined || farmer.loanAmount === undefined) {
      throw new Error('[FinancialAgent] Annual income and loan amount are required fields.');
    }
  }

  getConfidence(context) {
    const { annualIncome, landSize } = context.farmer;
    if (annualIncome === 0 || landSize === 0) return 0.60;
    return 0.95;
  }

  async _run(context) {
    try {
      const { systemInstruction, prompt } = PromptManager.getPrompt(this.name, context);

      const validateFn = (data) => {
        if (typeof data.financialRiskScore !== 'number' || data.financialRiskScore < 0 || data.financialRiskScore > 100) {
          throw new Error('financialRiskScore must be a number between 0 and 100.');
        }
        if (!data.financialRiskLevel) {
          throw new Error('Missing financialRiskLevel.');
        }
      };

      const result = await GeminiClient.generateWithCorrection(
        prompt,
        systemInstruction,
        FinancialSchema,
        validateFn
      );

      logger.info(`[FinancialAgent] Gemini call succeeded. Model: ${result.model}, Prompt Length: ${result.promptLength}`);
      return result.data;
    } catch (err) {
      logger.warn(`[FinancialAgent] Gemini call failed, falling back to deterministic engine. Error: ${err.message}`);
      return this._runDeterministic(context);
    }
  }

  async _runDeterministic(context) {
    const farmer = context.farmer;
    const loan = farmer.loanAmount || 0;
    const income = farmer.annualIncome || 0;
    const landSize = farmer.landSize || 0;

    // 1. Debt Ratio calculation
    const debtRatio = parseFloat((loan / (income || 1)).toFixed(2));

    // 2. Score Calculation
    let financialRiskScore = RuleEngine.calculateScore(debtRatio, 0, financialConfig.debtRatioThresholds.high);

    // Apply adjustments based on landSize
    let incomeStability = 'Stable';
    if (landSize < 3) {
      incomeStability = 'Low Stability (Marginal landholding)';
      financialRiskScore = Math.min(100, financialRiskScore + financialConfig.incomeStabilityWeights.lowSizePenalty);
    } else if (landSize >= 10) {
      incomeStability = 'Highly Stable (Large landholding)';
      financialRiskScore = Math.max(0, financialRiskScore - 10);
    }

    // Apply high loan ratio penalty
    if (loan > income * 2) {
      financialRiskScore = Math.min(100, financialRiskScore + financialConfig.incomeStabilityWeights.highLoanPenalty);
    }

    // 3. Risk Level classification using RuleEngine
    const financialRiskLevel = RuleEngine.classifyRisk(financialRiskScore, financialConfig.riskScoreThresholds);

    // 4. Rule-based recommendations
    const recommendationRules = [
      {
        condition: (ctx) => debtRatio > financialConfig.debtRatioThresholds.medium,
        text: 'Reduce reliance on short-term high-interest informal loans. Refinance via Kisan Credit Card (KCC).'
      },
      {
        condition: (ctx) => landSize > 0 && landSize <= 5 && loan > income,
        text: 'Explore credit subsidy and loan waiver schemes for small and marginal landholders.'
      },
      {
        condition: (ctx) => debtRatio <= financialConfig.debtRatioThresholds.low,
        text: 'Strong financial baseline. Safe to consider capital investments in high-yield crops or drip irrigation.'
      },
      {
        condition: (ctx) => income === 0 && loan > 0,
        text: 'Critically high debt without regular registered income. Setup local non-farm allied activities (livestock, poultry).'
      }
    ];

    const recommendedActions = RuleEngine.selectRecommendations(recommendationRules, context);

    // 5. Reasoning text
    let reasoning = `Debt-to-income ratio is ${debtRatio}. Income stability is classified as ${incomeStability}. `;
    if (financialRiskLevel === 'Critical' || financialRiskLevel === 'High') {
      reasoning += `High debt exposure relative to earnings puts the farm profile at significant financial vulnerability.`;
    } else if (financialRiskLevel === 'Medium') {
      reasoning += `Moderate leverage. Manageable, but buffer capacity is limited.`;
    } else {
      reasoning += `Farm has healthy leverage and strong capacity to service existing liabilities.`;
    }

    return {
      debtRatio,
      incomeStability,
      financialRiskScore,
      financialRiskLevel,
      reasoning,
      recommendedActions
    };
  }
}
