import executionHistory from './ExecutionHistory.js';

export class ExecutionTracer {
  /**
   * Generates a complete chronological trace of execution.
   */
  static getTrace(executionId) {
    const report = executionHistory.get(executionId);
    if (!report) return null;

    const summary = report.executionSummary;
    const traceSteps = [];

    // Map traces chronologically from the summary timeline
    summary.timeline.forEach(event => {
      const agentMetric = (summary.metrics || []).find(m => m.agent === event.agent) || {};
      traceSteps.push({
        agent: event.agent,
        event: event.event,
        timestamp: event.timestamp,
        status: event.status || agentMetric.status || 'running',
        durationMs: event.executionTime !== undefined ? event.executionTime : agentMetric.executionTime || null,
        confidence: agentMetric.confidence !== undefined ? agentMetric.confidence : null,
        warnings: agentMetric.warnings || [],
        errors: agentMetric.errors || []
      });
    });

    return {
      pipelineId: executionId,
      status: summary.status,
      totalDurationMs: summary.totalDurationMs,
      timestamp: summary.timestamp,
      steps: traceSteps
    };
  }

  /**
   * Retrieves all trace history.
   */
  static getAllTraces() {
    const allHistory = executionHistory.getAll();
    return allHistory.map(report => this.getTrace(report.executionSummary.pipelineId)).filter(Boolean);
  }
}
