import { logger } from '../../config/logger.js';

export class PipelineLogger {
  static logStageTransition(executionId, fromStage, toStage) {
    logger.info(`[Pipeline ${executionId}] Transitioning stage: "${fromStage}" -> "${toStage}"`);
  }

  static logPipelineStart(executionId, farmerId) {
    logger.info(`[Pipeline ${executionId}] Starting risk assessment pipeline for farmer ID: ${farmerId || 'Anonymous'}`);
  }

  static logPipelineEnd(executionId, durationMs, successRate) {
    logger.info(`[Pipeline ${executionId}] Pipeline completed in ${durationMs}ms. Success Rate: ${(successRate * 100).toFixed(1)}%`);
  }
}
