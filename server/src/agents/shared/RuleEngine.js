import { logger } from '../../config/logger.js';

export class RuleEngine {
  /**
   * Evaluates a set of condition functions against a context.
   * @param {Array<Function>} conditions - Array of condition functions returning boolean.
   * @param {Object} context - The context to evaluate against.
   * @returns {boolean} True if all conditions pass, false otherwise.
   */
  static evaluateConditions(conditions, context) {
    try {
      if (!Array.isArray(conditions) || conditions.length === 0) return true;
      return conditions.every(condition => condition(context));
    } catch (error) {
      logger.error(`RuleEngine: Error evaluating conditions: ${error.message}`);
      return false;
    }
  }

  /**
   * Calculates a linear score between 0 and 100 based on min/max bounds.
   * @param {number} value - The input value.
   * @param {number} minVal - The lower bound.
   * @param {number} maxVal - The upper bound.
   * @param {boolean} invert - If true, higher value yields lower score.
   * @returns {number} Score bounded between 0 and 100.
   */
  static calculateScore(value, minVal, maxVal, invert = false) {
    if (value === undefined || value === null || isNaN(value)) return 0;
    if (minVal === maxVal) return 50;

    let score = ((value - minVal) / (maxVal - minVal)) * 100;
    if (invert) {
      score = 100 - score;
    }
    
    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Classifies a numerical score into risk tiers.
   * @param {number} score - Score from 0 to 100.
   * @param {Object} thresholds - Map of threshold levels { low, medium, high }.
   * @returns {string} Risk category ('Low', 'Medium', 'High', 'Critical').
   */
  static classifyRisk(score, thresholds = { low: 35, medium: 65, high: 85 }) {
    if (score === undefined || score === null || isNaN(score)) return 'Low';
    if (score >= thresholds.high) return 'Critical';
    if (score >= thresholds.medium) return 'High';
    if (score >= thresholds.low) return 'Medium';
    return 'Low';
  }

  /**
   * Selects matching recommendations based on conditional rules.
   * @param {Array<Object>} rules - Array of { condition: Function, text: String }
   * @param {Object} context - Execution context.
   * @returns {Array<string>} Matching recommendations.
   */
  static selectRecommendations(rules, context) {
    const selected = [];
    if (!Array.isArray(rules)) return selected;

    for (const rule of rules) {
      try {
        if (rule.condition(context)) {
          selected.push(rule.text);
        }
      } catch (error) {
        logger.error(`RuleEngine: Error evaluating recommendation rule: ${error.message}`);
      }
    }
    return selected;
  }
}
