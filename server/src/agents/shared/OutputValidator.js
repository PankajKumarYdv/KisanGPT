export class OutputValidator {
  /**
   * Validates standard agent execution results.
   * Throws Error if validation fails.
   */
  static validate(result) {
    if (!result || typeof result !== 'object') {
      throw new Error('Output validation error: Result is not an object.');
    }

    const requiredKeys = ['agent', 'status', 'confidence', 'executionTime', 'data', 'warnings', 'errors'];
    for (const key of requiredKeys) {
      if (!(key in result)) {
        throw new Error(`Output validation error: Missing required key "${key}"`);
      }
    }

    // Validate Status range
    const validStatuses = ['success', 'failure', 'degraded'];
    if (!validStatuses.includes(result.status)) {
      throw new Error(`Output validation error: Invalid status "${result.status}".`);
    }

    // Validate Confidence range (normalized or 0-100)
    if (result.confidence < 0 || result.confidence > 100) {
      throw new Error(`Output validation error: Confidence score ${result.confidence} must be between 0 and 100.`);
    }

    // Validate executionTime is a number
    if (typeof result.executionTime !== 'number' || result.executionTime < 0) {
      throw new Error('Output validation error: executionTime must be a non-negative number.');
    }

    // Validate schema specific data properties on success
    if (result.status === 'success' && result.data) {
      const data = result.data;
      
      if (result.agent === 'FinancialAgent') {
        if (typeof data.financialRiskScore !== 'number' || data.financialRiskScore < 0 || data.financialRiskScore > 100) {
          throw new Error('FinancialAgent: financialRiskScore must be a number between 0 and 100.');
        }
        if (!data.financialRiskLevel) {
          throw new Error('FinancialAgent: Missing financialRiskLevel.');
        }
      }

      if (result.agent === 'WeatherAgent') {
        if (typeof data.weatherScore !== 'number' || data.weatherScore < 0 || data.weatherScore > 100) {
          throw new Error('WeatherAgent: weatherScore must be a number between 0 and 100.');
        }
        if (!data.weatherRisk) {
          throw new Error('WeatherAgent: Missing weatherRisk.');
        }
      }

      if (result.agent === 'CropAgent') {
        if (typeof data.cropScore !== 'number' || data.cropScore < 0 || data.cropScore > 100) {
          throw new Error('CropAgent: cropScore must be a number between 0 and 100.');
        }
      }

      if (result.agent === 'MarketAgent') {
        if (typeof data.priceScore !== 'number' || data.priceScore < 0 || data.priceScore > 100) {
          throw new Error('MarketAgent: priceScore must be a number between 0 and 100.');
        }
      }

      if (result.agent === 'RiskAssessmentAgent') {
        if (typeof data.overallScore !== 'number' || data.overallScore < 0 || data.overallScore > 100) {
          throw new Error('RiskAssessmentAgent: overallScore must be a number between 0 and 100.');
        }
        if (!data.overallRisk) {
          throw new Error('RiskAssessmentAgent: Missing overallRisk.');
        }
      }

      if (result.agent === 'WellnessAgent') {
        if (typeof data.wellnessScore !== 'number' || data.wellnessScore < 0 || data.wellnessScore > 100) {
          throw new Error('WellnessAgent: wellnessScore must be a number between 0 and 100.');
        }
      }
    }

    return true;
  }
}
