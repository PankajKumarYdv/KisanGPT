import { logger } from '../../config/logger.js';

export class AgentLogger {
  constructor(executionId) {
    this.executionId = executionId;
    this.logs = [];
  }

  logStart(agentName) {
    const logEntry = {
      agentName,
      event: 'start',
      timestamp: new Date().toISOString()
    };
    this.logs.push(logEntry);
    logger.info(`[Execution ${this.executionId}] Agent "${agentName}" started.`);
  }

  logEnd(agentName, result) {
    const logEntry = {
      agentName,
      event: 'end',
      timestamp: new Date().toISOString(),
      status: result.status,
      confidence: result.confidence,
      executionTime: result.executionTime,
      warnings: result.warnings,
      errors: result.errors
    };
    this.logs.push(logEntry);
    logger.info(`[Execution ${this.executionId}] Agent "${agentName}" finished: status=${result.status}, duration=${result.executionTime}ms.`);
  }

  logError(agentName, errorMsg) {
    const logEntry = {
      agentName,
      event: 'error',
      timestamp: new Date().toISOString(),
      error: errorMsg
    };
    this.logs.push(logEntry);
    logger.error(`[Execution ${this.executionId}] Agent "${agentName}" encountered error: ${errorMsg}`);
  }

  getTimeline() {
    return this.logs.map(log => ({
      agent: log.agentName,
      event: log.event,
      timestamp: log.timestamp,
      status: log.status,
      executionTime: log.executionTime,
      errors: log.errors || []
    }));
  }

  getSummaryReport() {
    const endEvents = this.logs.filter(l => l.event === 'end');
    const totalAgents = endEvents.length;
    const successfulAgents = endEvents.filter(e => e.status === 'success').length;
    const failedAgents = endEvents.filter(e => e.status === 'failure').length;
    const totalExecutionTime = endEvents.reduce((sum, e) => sum + (e.executionTime || 0), 0);

    return {
      executionId: this.executionId,
      summary: {
        totalAgentsRun: totalAgents,
        successful: successfulAgents,
        failed: failedAgents,
        totalDurationMs: totalExecutionTime,
        status: failedAgents === 0 ? 'completed' : (successfulAgents > 0 ? 'partial_success' : 'failed')
      },
      timeline: this.getTimeline()
    };
  }
}
