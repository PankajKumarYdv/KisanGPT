import registry from './AgentRegistry.js';
import executionHistory from './ExecutionHistory.js';

export class HealthMonitor {
  /**
   * Summarizes the current health of each agent (Healthy, Degraded, Offline), average runtimes, and error counters.
   */
  static getAgentsStatus() {
    const registryStats = registry.getStats();
    const allHistory = executionHistory.getAll();

    return registryStats.agents.map(agentMeta => {
      const agentHistory = allHistory.map(h => {
        const metrics = h.executionSummary.metrics || [];
        return metrics.find(m => m.agent === agentMeta.name);
      }).filter(Boolean);

      const totalRuns = agentHistory.length;
      const errorCount = agentHistory.reduce((sum, m) => sum + (m.failureCount || 0), 0);
      
      const runtimes = agentHistory.map(m => m.executionTime);
      const avgRuntime = totalRuns > 0 ? runtimes.reduce((sum, r) => sum + r, 0) / totalRuns : 0;
      
      const lastExecution = agentHistory.length > 0 ? agentHistory[agentHistory.length - 1].executionTime : null;

      // Classify status
      let healthStatus = 'Healthy';
      if (!agentMeta.enabled) {
        healthStatus = 'Offline';
      } else if (agentMeta.healthStatus === 'degraded' || (totalRuns > 0 && errorCount / totalRuns > 0.3)) {
        healthStatus = 'Degraded';
      }

      return {
        name: agentMeta.name,
        healthStatus,
        averageRuntimeMs: parseFloat(avgRuntime.toFixed(2)),
        lastExecutionMs: lastExecution,
        version: agentMeta.version || '1.0.0',
        errorCount,
        totalRuns
      };
    });
  }
}
