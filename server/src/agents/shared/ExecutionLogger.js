import { logger } from '../../config/logger.js';

export class ExecutionLogger {
  static logAgentStart(executionId, agentName) {
    logger.info(`[Pipeline ${executionId}] Agent "${agentName}" started execution.`);
  }

  static logAgentSuccess(executionId, agentName, durationMs) {
    logger.info(`[Pipeline ${executionId}] Agent "${agentName}" executed successfully in ${durationMs}ms.`);
  }

  static logAgentWarning(executionId, agentName, warning) {
    logger.warn(`[Pipeline ${executionId}] Agent "${agentName}" generated a warning: ${warning}`);
  }

  static logAgentFailure(executionId, agentName, errorMsg, isRetry = false) {
    if (isRetry) {
      logger.warn(`[Pipeline ${executionId}] Agent "${agentName}" failed. Retrying... Error: ${errorMsg}`);
    } else {
      logger.error(`[Pipeline ${executionId}] Agent "${agentName}" failed permanently. Error: ${errorMsg}`);
    }
  }
}
