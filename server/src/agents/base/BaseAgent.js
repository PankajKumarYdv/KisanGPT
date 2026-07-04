import { logger as winstonLogger } from '../../config/logger.js';
import { AgentResult } from '../shared/AgentResult.js';

export class BaseAgent {
  constructor(name, description, version = '1.0.0') {
    if (this.constructor === BaseAgent) {
      throw new TypeError('Cannot construct BaseAgent instances directly');
    }
    this.name = name;
    this.description = description;
    this.version = version;
    this.status = 'idle'; // idle, running, success, failure
  }

  /**
   * Validates the input context. Can be overridden by subclasses.
   * Throws an error if input context is invalid.
   */
  validateInput(context) {
    if (!context || !context.farmer) {
      throw new Error(`[${this.name}] Invalid input context: Farmer profile is required`);
    }
  }

  /**
   * Validates the agent output result format.
   * Throws an error if output structure is invalid.
   */
  validateOutput(result) {
    const requiredKeys = ['agent', 'status', 'confidence', 'executionTime', 'data', 'warnings', 'errors'];
    for (const key of requiredKeys) {
      if (!(key in result)) {
        throw new Error(`[${this.name}] Invalid output format: Missing key "${key}"`);
      }
    }
  }

  /**
   * Helper to build a standardized AgentResult.
   */
  buildResult(status, data, confidence, executionTime, warnings = [], errors = []) {
    return new AgentResult({
      agent: this.name,
      status,
      confidence,
      executionTime,
      data,
      warnings,
      errors
    });
  }

  /**
   * Helper method to determine agent's confidence score.
   * Subclasses can override this to implement custom confidence logic.
   */
  getConfidence(context) {
    return 1.0; // Default confidence
  }

  /**
   * The actual task execution logic to be implemented by subclasses.
   * Must return the clean "data" object of the result.
   */
  async _run(context) {
    throw new Error('Method _run(context) must be implemented by subclass');
  }

  /**
   * Template method to execute the agent.
   */
  async execute(context) {
    const startTime = Date.now();
    this.status = 'running';
    winstonLogger.info(`[Agent] ${this.name} execution started`);

    try {
      this.validateInput(context);
      
      const data = await this._run(context);
      const confidence = this.getConfidence(context);
      const executionTime = Date.now() - startTime;
      
      this.status = 'success';
      const result = this.buildResult('success', data, confidence, executionTime);
      
      this.validateOutput(result);
      winstonLogger.info(`[Agent] ${this.name} execution completed successfully in ${executionTime}ms`);
      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.status = 'failure';
      winstonLogger.error(`[Agent] ${this.name} execution failed in ${executionTime}ms: ${error.message}`);
      
      const result = this.buildResult('failure', {}, 0, executionTime, [], [error.message || String(error)]);
      return result;
    }
  }
}
