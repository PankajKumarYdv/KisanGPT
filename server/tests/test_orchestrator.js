import registry from '../src/agents/shared/AgentRegistry.js';
import { OrchestratorAgent } from '../src/agents/orchestrator/OrchestratorAgent.js';
import { MockFarmers } from '../src/agents/shared/MockFarmers.js';
import { AgentExecutor } from '../src/agents/shared/AgentExecutor.js';
import { BaseAgent } from '../src/agents/base/BaseAgent.js';
import { AgentContext } from '../src/agents/shared/AgentContext.js';

// Setup environment variables fallback
process.env.LOG_LEVEL = 'info';

async function runTestOrchestrator() {
  console.log('=== STARTING ORCHESTRATION PIPELINE TESTS ===\n');

  const orchestrator = new OrchestratorAgent();

  // 1. Test Observer Pattern Event Emitter
  console.log('--- TEST 1: Observer Pattern events ---');
  let eventsReceived = [];
  orchestrator.events.subscribe('pipeline_started', (e) => eventsReceived.push(`pipeline_started: ${e.executionId}`));
  orchestrator.events.subscribe('agent_started', (e) => eventsReceived.push(`agent_started: ${e.agent}`));
  orchestrator.events.subscribe('agent_finished', (e) => eventsReceived.push(`agent_finished: ${e.agent}`));
  orchestrator.events.subscribe('pipeline_completed', (e) => eventsReceived.push('pipeline_completed'));

  const report = await orchestrator.runPipeline(MockFarmers.smallFarmer);
  console.log('Events received:', eventsReceived);
  if (!eventsReceived.includes('pipeline_completed') || eventsReceived.length < 5) {
    console.error('FAIL: Lifecycle events not emitted correctly.');
    process.exit(1);
  }
  console.log('PASS: Lifecycle events successfully dispatched and observed.');

  // 2. Test Timeout Handling (5s limit)
  console.log('\n--- TEST 2: Timeout Handling ---');
  class HangingAgent extends BaseAgent {
    constructor() {
      super('HangingAgent', 'Simulated hanging agent');
    }
    async _run() {
      // Hang for 10 seconds
      await new Promise(resolve => setTimeout(resolve, 10000));
      return { data: 'should not be reached' };
    }
  }

  const hangingAgent = new HangingAgent();
  const context = new AgentContext({ farmer: MockFarmers.smallFarmer });

  console.log('Executing hanging agent with 1 second timeout limit...');
  const start = Date.now();
  const hangOutput = await AgentExecutor.runAgent(hangingAgent, context, 1000, 0);
  const duration = Date.now() - start;
  console.log(`Hanging agent execution took ${duration}ms. Status: ${hangOutput.result.status}`);
  console.log(`Warnings: ${JSON.stringify(hangOutput.result.warnings)}`);

  if (hangOutput.result.status !== 'degraded' || duration > 2000) {
    console.error('FAIL: Timeout was not enforced or failed to isolate execution.');
    process.exit(1);
  }
  console.log('PASS: Timeout handling successfully aborted hanging task and returned degraded response.');

  // 3. Test Retry Strategy with Exponential Backoff
  console.log('\n--- TEST 3: Retry Strategy with Exponential Backoff ---');
  let runCount = 0;
  class RetryTestAgent extends BaseAgent {
    constructor() {
      super('RetryTestAgent', 'Simulated retrying agent');
    }
    async _run() {
      runCount++;
      throw new Error(`Attempt ${runCount} failure`);
    }
  }

  const retryAgent = new RetryTestAgent();
  console.log('Executing failing agent with max 2 retries...');
  const retryOutput = await AgentExecutor.runAgent(retryAgent, context, 5000, 2);
  console.log(`Total run attempts (base + 2 retries): ${runCount}`);
  console.log(`Result status: ${retryOutput.result.status}`);
  console.log(`Retry metrics: Retries Used=${retryOutput.metrics.retryCount}, Failures=${retryOutput.metrics.failureCount}`);

  if (runCount !== 3 || retryOutput.result.status !== 'degraded') {
    console.error('FAIL: Retry logic did not execute correct number of times.');
    process.exit(1);
  }
  console.log('PASS: Retry strategy successfully executed base run and 2 retries with degraded completion.');

  // 4. Test Staged Execution Timeline
  console.log('\n--- TEST 4: Execution Timeline ---');
  console.log('Timeline offset details:');
  console.log(JSON.stringify(report.executionSummary.timeline, null, 2));
  if (report.executionSummary.timeline.length !== 8) {
    console.error('FAIL: Timeline does not contain 8 agent executions.');
    process.exit(1);
  }
  console.log('PASS: Execution timeline correctly formatted and recorded.');

  console.log('\n=== ALL ORCHESTRATOR TESTS PASSED! ===');
}

runTestOrchestrator().catch(err => {
  console.error('Unexpected error during orchestration tests:', err);
  process.exit(1);
});
