import executionHistory from './ExecutionHistory.js';

export class MetricsCollector {
  /**
   * Summarizes all runtime metrics and agent latencies.
   */
  static getMetrics() {
    const allHistory = executionHistory.getAll();
    const totalRuns = allHistory.length;
    const completedRuns = allHistory.filter(h => h.executionSummary.status === 'completed').length;
    const degradedRuns = allHistory.filter(h => h.executionSummary.status === 'degraded').length;

    // Calculate latency metrics
    const durations = allHistory.map(h => h.executionSummary.totalDurationMs);
    const avgDuration = totalRuns > 0 ? durations.reduce((sum, d) => sum + d, 0) / totalRuns : 0;
    const maxDuration = totalRuns > 0 ? Math.max(...durations) : 0;

    // Calculate average agent metrics
    const agentTimes = {};
    const agentCounts = {};
    const agentFailures = {};

    allHistory.forEach(h => {
      const metricsList = h.executionSummary.metrics || [];
      metricsList.forEach(m => {
        if (!agentTimes[m.agent]) {
          agentTimes[m.agent] = 0;
          agentCounts[m.agent] = 0;
          agentFailures[m.agent] = 0;
        }
        agentTimes[m.agent] += m.executionTime;
        agentCounts[m.agent]++;
        if (m.status !== 'success') {
          agentFailures[m.agent]++;
        }
      });
    });

    const agentBreakdowns = {};
    Object.keys(agentTimes).forEach(agent => {
      agentBreakdowns[agent] = {
        averageExecutionTimeMs: parseFloat((agentTimes[agent] / agentCounts[agent]).toFixed(2)),
        totalRuns: agentCounts[agent],
        failures: agentFailures[agent],
        successRate: parseFloat(((agentCounts[agent] - agentFailures[agent]) / agentCounts[agent]).toFixed(2))
      };
    });

    return {
      pipelineStatistics: {
        totalRuns,
        completedRuns,
        degradedRuns,
        averageDurationMs: parseFloat(avgDuration.toFixed(2)),
        maxDurationMs: maxDuration
      },
      agentStatistics: agentBreakdowns
    };
  }
}
