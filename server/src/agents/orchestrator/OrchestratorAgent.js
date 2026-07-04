import { AgentContext } from '../shared/AgentContext.js';
import { AgentExecutor } from '../shared/AgentExecutor.js';
import registry from '../shared/AgentRegistry.js';
import { DAGManager } from '../shared/DAGManager.js';
import { EventEmitter } from '../shared/EventEmitter.js';
import { AssessmentReportBuilder } from '../shared/AssessmentReportBuilder.js';
import { ExecutionLogger } from '../shared/ExecutionLogger.js';
import { PipelineLogger } from '../shared/PipelineLogger.js';
import { PerformanceMonitor } from '../shared/PerformanceMonitor.js';
import executionHistory from '../shared/ExecutionHistory.js';

// Import all agents to register them
import { FinancialAgent } from '../agents/financial/FinancialAgent.js';
import { WeatherAgent } from '../agents/weather/WeatherAgent.js';
import { CropAgent } from '../agents/crop/CropAgent.js';
import { MarketAgent } from '../agents/market/MarketAgent.js';
import { GovernmentSchemeAgent } from '../agents/government/GovernmentSchemeAgent.js';
import { RiskAssessmentAgent } from '../agents/risk/RiskAssessmentAgent.js';
import { WellnessAgent } from '../agents/wellness/WellnessAgent.js';
import { ActionPlanningAgent } from '../agents/planning/ActionPlanningAgent.js';

export class OrchestratorAgent {
  constructor() {
    this.name = 'OrchestratorAgent';
    this.description = 'Central brain managing multi-agent execution pipeline via dependency graphs and event subscriptions.';
    this.events = new EventEmitter();
    this._registerAgents();
    this._buildDependencyGraph();
  }

  /**
   * Auto-register all specialty agents in the registry.
   */
  _registerAgents() {
    const agentsToRegister = [
      new FinancialAgent(),
      new WeatherAgent(),
      new CropAgent(),
      new MarketAgent(),
      new GovernmentSchemeAgent(),
      new RiskAssessmentAgent(),
      new WellnessAgent(),
      new ActionPlanningAgent()
    ];

    for (const agent of agentsToRegister) {
      if (!registry.isRegistered(agent.name)) {
        registry.register(agent);
      }
    }
  }

  /**
   * Set up DAG node hierarchies.
   */
  _buildDependencyGraph() {
    this.dag = new DAGManager();
    this.dag.addNode('FinancialAgent', []);
    this.dag.addNode('WeatherAgent', []);
    this.dag.addNode('MarketAgent', []);
    this.dag.addNode('GovernmentSchemeAgent', []);
    this.dag.addNode('CropAgent', ['WeatherAgent']);
    this.dag.addNode('RiskAssessmentAgent', ['FinancialAgent', 'WeatherAgent', 'CropAgent', 'MarketAgent']);
    this.dag.addNode('WellnessAgent', ['RiskAssessmentAgent']);
    this.dag.addNode('ActionPlanningAgent', [
      'FinancialAgent', 'WeatherAgent', 'CropAgent', 'MarketAgent', 
      'GovernmentSchemeAgent', 'RiskAssessmentAgent', 'WellnessAgent'
    ]);
  }

  /**
   * Orchestrates the 6 stages of risk analysis pipeline.
   */
  async runPipeline(farmer, assessment = null) {
    const executionId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const perfMonitor = new PerformanceMonitor();

    // Stage 1: Validation
    PipelineLogger.logStageTransition(executionId, 'None', 'Validation');
    this.events.emit('pipeline_started', { executionId, farmerId: farmer?._id || farmer?.id });
    PipelineLogger.logPipelineStart(executionId, farmer?._id || farmer?.id);

    if (!farmer) {
      throw new Error('Validation Error: Farmer profile is required to execute the pipeline.');
    }

    // Stage 2: Context Creation
    PipelineLogger.logStageTransition(executionId, 'Validation', 'Context Creation');
    let context = new AgentContext({
      farmer,
      assessment,
      executionId
    });

    // Resolve dependencies dynamically using DAG
    const executionStages = this.dag.resolveStages();
    
    const allMetrics = [];
    const previousResults = new Map();

    // Stage 3 & 4: Execution stages
    for (const stageGroup of executionStages) {
      const isParallel = stageGroup.length > 1;
      const stageName = isParallel 
        ? `Stage 3 - Parallel Execution (${stageGroup.join(', ')})` 
        : `Stage 4 - Dependency Execution (${stageGroup[0]})`;
        
      PipelineLogger.logStageTransition(executionId, context.metadata.currentStage || 'Context Creation', stageName);
      context = context.copyWith({ metadata: { currentStage: stageName } });

      const agentInstances = stageGroup.map(name => registry.get(name));

      for (const name of stageGroup) {
        perfMonitor.recordAgentStart(name);
        this.events.emit('agent_started', { executionId, agent: name });
        ExecutionLogger.logAgentStart(executionId, name);
      }

      let executionOutputs;
      if (isParallel) {
        executionOutputs = await AgentExecutor.runParallel(agentInstances, context);
      } else {
        executionOutputs = await AgentExecutor.runSequential(agentInstances, context);
      }

      executionOutputs.forEach((outputObj, index) => {
        const agentName = stageGroup[index];
        const { result, metrics } = outputObj;

        perfMonitor.recordAgentEnd(agentName);
        allMetrics.push({ agent: agentName, ...metrics });
        previousResults.set(agentName, result);

        if (result.status === 'success') {
          this.events.emit('agent_finished', { executionId, agent: agentName, result });
          ExecutionLogger.logAgentSuccess(executionId, agentName, metrics.executionTime);
        } else {
          this.events.emit('agent_failed', { executionId, agent: agentName, errors: result.errors });
          ExecutionLogger.logAgentFailure(executionId, agentName, result.errors.join(', '));
        }

        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach(w => ExecutionLogger.logAgentWarning(executionId, agentName, w));
        }
      });

      context = context.copyWith({ agentResults: previousResults });
    }

    // Stage 5: Aggregation
    PipelineLogger.logStageTransition(executionId, 'Stage 4 - Dependency Execution', 'Aggregation');
    
    const financialRes = context.getAgentResult('FinancialAgent')?.data || {};
    const weatherRes = context.getAgentResult('WeatherAgent')?.data || {};
    const cropRes = context.getAgentResult('CropAgent')?.data || {};
    const marketRes = context.getAgentResult('MarketAgent')?.data || {};
    const govRes = context.getAgentResult('GovernmentSchemeAgent')?.data || {};
    const wellnessRes = context.getAgentResult('WellnessAgent')?.data || {};
    const riskRes = context.getAgentResult('RiskAssessmentAgent')?.data || {};
    const planningRes = context.getAgentResult('ActionPlanningAgent')?.data || {};

    const totalDuration = perfMonitor.getTotalDuration();
    const timeline = perfMonitor.getTimeline();

    // Pipeline telemetry computations
    const totalAgentsCount = allMetrics.length;
    const successfulAgentsCount = allMetrics.filter(m => m.status === 'success').length;
    const failedAgentsCount = allMetrics.filter(m => m.status === 'degraded' || m.status === 'failure').length;
    const successRate = totalAgentsCount > 0 ? parseFloat((successfulAgentsCount / totalAgentsCount).toFixed(2)) : 0;
    const avgConfidence = totalAgentsCount > 0 
      ? parseFloat((allMetrics.reduce((sum, m) => sum + (m.confidence || 0), 0) / totalAgentsCount).toFixed(2)) 
      : 0;

    const pipelineSummary = {
      pipelineId: executionId,
      status: failedAgentsCount === 0 ? 'completed' : 'degraded',
      successRate,
      averageConfidence: avgConfidence,
      totalDurationMs: totalDuration,
      timestamp: new Date().toISOString(),
      timeline,
      metrics: allMetrics
    };

    // Builder pattern aggregation
    const reportBuilder = new AssessmentReportBuilder();
    const finalReport = reportBuilder
      .setFarmer(farmer)
      .setAssessment(assessment)
      .setFinancial(financialRes)
      .setWeather(weatherRes)
      .setCrop(cropRes)
      .setMarket(marketRes)
      .setGovernmentSchemes(govRes)
      .setWellness(wellnessRes)
      .setOverallRisk(riskRes)
      .setActionPlan(planningRes)
      .setExecutionSummary(pipelineSummary)
      .build();

    // Stage 6: Final Report
    PipelineLogger.logStageTransition(executionId, 'Aggregation', 'Final Report');
    PipelineLogger.logPipelineEnd(executionId, totalDuration, successRate);
    this.events.emit('pipeline_completed', { executionId, finalReport });

    // Store execution in-memory
    executionHistory.save(executionId, finalReport);

    return finalReport;
  }
}
