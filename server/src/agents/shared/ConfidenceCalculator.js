export class ConfidenceCalculator {
  /**
   * Calculates a confidence score (0 to 100) based on execution metrics.
   * @param {Object} params
   * @param {number} params.ruleCoverage - % of rules evaluated (0 to 1)
   * @param {number} params.inputCompleteness - % of required inputs present (0 to 1)
   * @param {boolean} params.executionSuccess - true if agent ran successfully
   * @param {boolean} params.fallbackUsed - true if fallback/mock defaults were triggered
   * @param {number} params.warningCount - count of warnings generated
   * @returns {number} Score from 0 to 100.
   */
  static calculate({ ruleCoverage = 1.0, inputCompleteness = 1.0, executionSuccess = true, fallbackUsed = false, warningCount = 0 }) {
    if (!executionSuccess) return 0;

    let score = 100;

    // Penalize missing inputs (up to 30 points)
    score -= (1.0 - inputCompleteness) * 30;

    // Penalize skipped/low rule coverage (up to 20 points)
    score -= (1.0 - ruleCoverage) * 20;

    // Penalize default/degraded fallbacks (20 points)
    if (fallbackUsed) {
      score -= 20;
    }

    // Penalize warnings (5 points per warning, max 30)
    const warningPenalty = Math.min(30, warningCount * 5);
    score -= warningPenalty;

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
