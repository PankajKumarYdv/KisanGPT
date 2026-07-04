import registry from '../src/agents/shared/AgentRegistry.js';
import { OrchestratorAgent } from '../src/agents/orchestrator/OrchestratorAgent.js';
import { AgentContext } from '../src/agents/shared/AgentContext.js';
import { AgentExecutor } from '../src/agents/shared/AgentExecutor.js';
import { BaseAgent } from '../src/agents/base/BaseAgent.js';

// Setup environment variables fallback
process.env.LOG_LEVEL = 'info';

async function runTests() {
  console.log('--- STARTING AGENT FRAMEWORK TESTS ---');
  
  // 1. Instantiate Orchestrator to trigger auto-registration
  const orchestrator = new OrchestratorAgent();
  console.log('Orchestrator instantiated.');

  // 2. Test Registry
  const stats = registry.getStats();
  console.log(`Registered agents count: ${stats.totalRegistered}`);
  if (stats.totalRegistered !== 8) {
    console.error('FAIL: Expected 8 registered agents, got', stats.totalRegistered);
    process.exit(1);
  }
  console.log('PASS: Registry contains 8 agents.');

  // 3. Test Single Agent Execution (FinancialAgent)
  console.log('\n--- Test Single Agent (FinancialAgent) ---');
  const financialAgent = registry.get('FinancialAgent');
  const mockFarmer = {
    state: 'Punjab',
    district: 'Amritsar',
    landSize: 4.5,
    cropType: 'Wheat',
    soilType: 'Alluvial',
    annualIncome: 300000,
    loanAmount: 450000, // Loan-to-income = 1.5 (Medium risk)
    farmingExperience: 10
  };
  let context = new AgentContext({ farmer: mockFarmer });
  const finResult = await financialAgent.execute(context);
  console.log('Result Status:', finResult.status);
  console.log('Result Data:', JSON.stringify(finResult.data, null, 2));
  if (finResult.status !== 'success' || finResult.data.financialRiskLevel !== 'Medium') {
    console.error('FAIL: FinancialAgent execution failed or returned wrong tier');
    process.exit(1);
  }
  console.log('PASS: Single Agent test passed.');

  // 4. Test Failure Recovery & Parallel Execution
  console.log('\n--- Test Failure Recovery & Parallel Execution ---');
  // Register a temporary failing agent
  class FailingAgent extends BaseAgent {
    constructor() {
      super('FailingAgent', 'Simulated failure agent');
    }
    async _run() {
      throw new Error('Simulated database error');
    }
  }
  const failingAgent = new FailingAgent();
  
  const weatherAgent = registry.get('WeatherAgent');
  const marketAgent = registry.get('MarketAgent');

  console.log('Running 3 agents (2 success, 1 failing) in parallel...');
  const parallelResults = await AgentExecutor.runParallel(
    [weatherAgent, marketAgent, failingAgent],
    context
  );

  console.log('Parallel Results:');
  parallelResults.forEach(output => {
    const r = output.result;
    console.log(`- Agent: ${r.agent}, Status: ${r.status}, Errors: ${JSON.stringify(r.errors)}`);
  });

  const failedResult = parallelResults.find(output => output.result.agent === 'FailingAgent');
  if (!failedResult || failedResult.result.status !== 'degraded' || failedResult.result.errors.length === 0) {
    console.error('FAIL: FailingAgent did not record failure properly');
    process.exit(1);
  }
  console.log('PASS: Failure recovery works. Fails are isolated and logged.');

  // 5. Test Full Pipeline via Orchestrator
  console.log('\n--- Test Full Orchestrator Pipeline ---');
  const pipelineReport = await orchestrator.runPipeline(mockFarmer);
  console.log('Pipeline execution status:', pipelineReport.executionSummary.status);
  console.log('Execution timeline total count:', pipelineReport.executionSummary.timeline.length);
  console.log('Overall risk calculated:', pipelineReport.overallRisk.overallRisk);
  console.log('Wellness score:', pipelineReport.wellness.wellnessScore);

  if (pipelineReport.executionSummary.status !== 'completed') {
    console.error('FAIL: Pipeline did not complete successfully');
    process.exit(1);
  }
  console.log('PASS: Full pipeline executed successfully.');
  
  console.log('\n--- ALL TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error('Unexpected error running tests:', err);
  process.exit(1);
});
