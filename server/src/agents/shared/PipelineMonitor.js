import executionHistory from './ExecutionHistory.js';
import registry from './AgentRegistry.js';

class PipelineMonitor {
  constructor() {
    this.developerMode = process.env.NODE_ENV !== 'production';
  }

  isDeveloperMode() {
    return this.developerMode;
  }

  setDeveloperMode(enabled) {
    this.developerMode = !!enabled;
  }

  /**
   * Retrieves pipeline statistics, timeline arrays, and graphs.
   */
  getDebugPipelineData() {
    const allHistory = executionHistory.getAll();
    const latestRun = allHistory[allHistory.length - 1] || null;

    // Build static execution graph nodes for the frontend
    const graphNodes = [
      { id: 'FinancialAgent', label: 'Financial Agent', dependencies: [] },
      { id: 'WeatherAgent', label: 'Weather Agent', dependencies: [] },
      { id: 'MarketAgent', label: 'Market Agent', dependencies: [] },
      { id: 'GovernmentSchemeAgent', label: 'Government Scheme Agent', dependencies: [] },
      { id: 'CropAgent', label: 'Crop Agent', dependencies: ['WeatherAgent'] },
      { id: 'RiskAssessmentAgent', label: 'Risk Assessment Agent', dependencies: ['FinancialAgent', 'WeatherAgent', 'CropAgent', 'MarketAgent'] },
      { id: 'WellnessAgent', label: 'Wellness Agent', dependencies: ['RiskAssessmentAgent'] },
      { id: 'ActionPlanningAgent', label: 'Action Planning Agent', dependencies: ['FinancialAgent', 'WeatherAgent', 'CropAgent', 'MarketAgent', 'GovernmentSchemeAgent', 'RiskAssessmentAgent', 'WellnessAgent'] }
    ];

    return {
      developerMode: this.developerMode,
      graph: graphNodes,
      latestTimeline: latestRun ? latestRun.executionSummary.timeline : [],
      latestConfidence: latestRun ? latestRun.executionSummary.averageConfidence : 0,
      latestStatus: latestRun ? latestRun.executionSummary.status : 'inactive',
      latestDurationMs: latestRun ? latestRun.executionSummary.totalDurationMs : 0
    };
  }
}

const pipelineMonitorInstance = new PipelineMonitor();
export default pipelineMonitorInstance;
