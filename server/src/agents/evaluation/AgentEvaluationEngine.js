import { BenchmarkDatasets } from './BenchmarkDatasets.js';
import { OrchestratorAgent } from '../orchestrator/OrchestratorAgent.js';
import { OutputValidator } from '../shared/OutputValidator.js';
import { ConfidenceCalculator } from '../shared/ConfidenceCalculator.js';
import registry from '../shared/AgentRegistry.js';

export class AgentEvaluationEngine {
  constructor() {
    this.orchestrator = new OrchestratorAgent();
  }

  /**
   * Run benchmark scenarios and compare actual results vs expected outputs.
   */
  async runScenario(scenarioKey) {
    const scenario = BenchmarkDatasets[scenarioKey];
    if (!scenario) {
      throw new Error(`Scenario ${scenarioKey} not found.`);
    }

    const start = Date.now();
    const resultReport = await this.orchestrator.runPipeline(scenario.farmer);
    const duration = Date.now() - start;

    const evaluationResults = {
      scenarioKey,
      scenarioName: scenario.name,
      timestamp: new Date().toISOString(),
      durationMs: duration,
      assertions: [],
      scorecards: []
    };

    let passedAssertions = 0;
    let totalAssertions = 0;

    const addAssertion = (name, expected, actual, passed) => {
      totalAssertions++;
      if (passed) passedAssertions++;
      evaluationResults.assertions.push({ name, expected, actual, passed });
    };

    // Evaluate expectations
    const riskData = resultReport.overallRisk || {};
    const financialData = resultReport.financial || {};
    const weatherData = resultReport.weather || {};
    const cropData = resultReport.crop || {};
    const marketData = resultReport.market || {};

    if (scenario.expected.overallRisk) {
      addAssertion(
        'Overall Risk Classification Match',
        scenario.expected.overallRisk,
        riskData.overallRisk,
        riskData.overallRisk === scenario.expected.overallRisk
      );
    }

    if (scenario.expected.financialRiskLevel) {
      addAssertion(
        'Financial Risk Level Match',
        scenario.expected.financialRiskLevel,
        financialData.financialRiskLevel,
        financialData.financialRiskLevel === scenario.expected.financialRiskLevel
      );
    }

    if (scenario.expected.weatherRisk) {
      addAssertion(
        'Weather Risk Level Match',
        scenario.expected.weatherRisk,
        weatherData.weatherRisk,
        weatherData.weatherRisk === scenario.expected.weatherRisk
      );
    }

    if (scenario.expected.droughtRiskMin) {
      addAssertion(
        'Weather Drought Risk Threshold',
        `>= ${scenario.expected.droughtRiskMin}`,
        weatherData.droughtRisk,
        weatherData.droughtRisk >= scenario.expected.droughtRiskMin
      );
    }

    if (scenario.expected.cropDiseaseRisk) {
      addAssertion(
        'Crop Disease Risk Code Match',
        scenario.expected.cropDiseaseRisk,
        cropData.diseaseRisk,
        cropData.diseaseRisk === scenario.expected.cropDiseaseRisk
      );
    }

    if (scenario.expected.expectedYield) {
      addAssertion(
        'Crop Expected Yield Match',
        scenario.expected.expectedYield,
        cropData.expectedYield,
        cropData.expectedYield === scenario.expected.expectedYield
      );
    }

    if (scenario.expected.marketTrend) {
      addAssertion(
        'Market Trend Direction Match',
        scenario.expected.marketTrend,
        marketData.trend,
        marketData.trend === scenario.expected.marketTrend
      );
    }

    if (scenario.expected.priceScoreMin) {
      addAssertion(
        'Market Profit Price Score Min',
        `>= ${scenario.expected.priceScoreMin}`,
        marketData.priceScore,
        marketData.priceScore >= scenario.expected.priceScoreMin
      );
    }

    // Generate scorecards for every agent
    const details = resultReport.executionSummary.metrics || [];
    for (const metric of details) {
      const agentMetric = resultReport.executionSummary.metrics.find(m => m.agent === metric.agent) || {};
      
      // Calculate Input Completeness
      const requiredInputs = this._getRequiredInputsForAgent(metric.agent);
      let inputCompleteness = 1.0;
      if (requiredInputs.length > 0) {
        const presentCount = requiredInputs.filter(key => scenario.farmer[key] !== undefined).length;
        inputCompleteness = parseFloat((presentCount / requiredInputs.length).toFixed(2));
      }

      // Rule coverage directly matches input completeness for deterministic mock engines
      const ruleCoverage = inputCompleteness;

      // Mock output structure for validator
      const mockResultObject = {
        agent: metric.agent,
        status: metric.status,
        confidence: metric.confidence,
        executionTime: metric.executionTime,
        data: this._getAgentDataFromReport(resultReport, metric.agent),
        warnings: metric.warnings || [],
        errors: metric.errors || []
      };

      // Output Validation
      let outputValidationScore = 100;
      try {
        OutputValidator.validate(mockResultObject);
      } catch (err) {
        outputValidationScore = 0;
      }

      // Calculate confidence using ConfidenceCalculator
      const calculatedConfidence = ConfidenceCalculator.calculate({
        ruleCoverage,
        inputCompleteness,
        executionSuccess: metric.status === 'success',
        fallbackUsed: (metric.warnings || []).length > 0,
        warningCount: (metric.warnings || []).length
      });

      const successRate = metric.status === 'success' ? 1.0 : 0.0;
      const reliabilityScore = metric.status === 'success' ? 100 : 30;
      const consistencyScore = metric.executionTime < 200 ? 100 : 60;

      evaluationResults.scorecards.push({
        agent: metric.agent,
        executionTime: metric.executionTime,
        confidenceScore: calculatedConfidence,
        inputValidationScore: inputCompleteness * 100,
        outputValidationScore,
        reliabilityScore,
        consistencyScore,
        failureCount: metric.failureCount || 0,
        retryCount: metric.retryCount || 0,
        successRate,
        warnings: metric.warnings || [],
        errors: metric.errors || []
      });
    }

    evaluationResults.successRate = totalAssertions > 0 ? parseFloat((passedAssertions / totalAssertions).toFixed(2)) : 1.0;
    evaluationResults.overallScore = Math.round(evaluationResults.successRate * 100);

    return evaluationResults;
  }

  _getRequiredInputsForAgent(agentName) {
    switch (agentName) {
      case 'FinancialAgent':
        return ['annualIncome', 'loanAmount'];
      case 'WeatherAgent':
        return ['state'];
      case 'CropAgent':
        return ['cropType', 'soilType'];
      case 'MarketAgent':
        return ['cropType'];
      case 'GovernmentSchemeAgent':
        return ['landSize', 'state'];
      default:
        return [];
    }
  }

  _getAgentDataFromReport(report, agentName) {
    switch (agentName) {
      case 'FinancialAgent':
        return report.financial;
      case 'WeatherAgent':
        return report.weather;
      case 'CropAgent':
        return report.crop;
      case 'MarketAgent':
        return report.market;
      case 'GovernmentSchemeAgent':
        return report.governmentSchemes;
      case 'WellnessAgent':
        return report.wellness;
      case 'RiskAssessmentAgent':
        return report.overallRisk;
      default:
        return {};
    }
  }

  /**
   * Run load testing simulation
   */
  async runLoadTest(requestsCount = 10) {
    const scenarioKeys = Object.keys(BenchmarkDatasets);
    const results = [];
    const memoryBefore = process.memoryUsage().heapUsed;
    const startTime = Date.now();

    // Batch executions to simulate simultaneous requests
    const batchSize = 10;
    for (let i = 0; i < requestsCount; i += batchSize) {
      const currentBatchCount = Math.min(batchSize, requestsCount - i);
      const promises = [];
      for (let j = 0; j < currentBatchCount; j++) {
        const randKey = scenarioKeys[Math.floor(Math.random() * scenarioKeys.length)];
        const scenario = BenchmarkDatasets[randKey];
        promises.push(this.orchestrator.runPipeline(scenario.farmer));
      }
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    const duration = Date.now() - startTime;
    const memoryAfter = process.memoryUsage().heapUsed;
    const memoryDelta = memoryAfter - memoryBefore;

    // Calculate latency metrics
    const durations = results.map(r => r.executionSummary.totalDurationMs);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / requestsCount;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);

    // Success metrics
    const successRate = results.filter(r => r.executionSummary.status === 'completed').length / requestsCount;

    return {
      requestsSimulated: requestsCount,
      totalDurationMs: duration,
      averageLatencyMs: parseFloat(avgDuration.toFixed(2)),
      maxLatencyMs: maxDuration,
      minLatencyMs: minDuration,
      memoryUsageDeltaBytes: memoryDelta,
      successRate: parseFloat(successRate.toFixed(2))
    };
  }
}
