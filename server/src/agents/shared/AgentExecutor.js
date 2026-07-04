import { AgentResult } from './AgentResult.js';
import { logger } from '../../config/logger.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export class AgentExecutor {
  /**
   * Run a single agent with a timeout (5s) and retry policy (max 2 retries, exponential backoff).
   * Returns both the AgentResult and its execution metrics including warnings/errors.
   */
  static async runAgent(agent, context, timeoutMs = 5000, maxRetries = 2) {
    let attempt = 0;
    let delay = 100; // start with 100ms
    let retriesUsed = 0;
    let failureCount = 0;
    let lastError = null;
    const startTime = Date.now();
    const queueTime = 0; // default queue delay

    while (attempt <= maxRetries) {
      const executionStart = Date.now();
      try {
        const executePromise = agent.execute(context);
        
        // Race the execution with a timeout promise
        const result = await Promise.race([
          executePromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout: Execution exceeded ${timeoutMs}ms`)), timeoutMs)
          )
        ]);

        const duration = Date.now() - executionStart;

        if (result && result.status === 'success') {
          return {
            result,
            metrics: {
              executionTime: duration,
              queueTime,
              retryCount: retriesUsed,
              failureCount,
              status: 'success',
              confidence: result.confidence,
              warnings: result.warnings || [],
              errors: result.errors || []
            }
          };
        }

        lastError = (result && result.errors && result.errors.length > 0) 
          ? result.errors.join(', ') 
          : 'Agent returned failure status';
        failureCount++;
      } catch (error) {
        lastError = error.message || String(error);
        failureCount++;
      }

      // Retry scheduling with exponential backoff
      attempt++;
      if (attempt <= maxRetries) {
        retriesUsed++;
        logger.warn(`Agent "${agent.name}" failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms... Error: ${lastError}`);
        await sleep(delay);
        delay *= 2;
      }
    }

    // Retries exhausted or timeout exceeded - return degraded result and metrics
    const totalDuration = Date.now() - startTime;
    logger.error(`Agent "${agent.name}" failed after all attempts. Returning degraded response. Last error: ${lastError}`);
    
    const degradedResult = new AgentResult({
      agent: agent.name,
      status: 'degraded',
      confidence: 30, // 0-100 format
      executionTime: totalDuration,
      data: {},
      warnings: [`Agent execution failed. Fallback to degraded profile. Error: ${lastError}`],
      errors: [lastError]
    });

    return {
      result: degradedResult,
      metrics: {
        executionTime: totalDuration,
        queueTime,
        retryCount: retriesUsed,
        failureCount,
        status: 'degraded',
        confidence: 30,
        warnings: degradedResult.warnings,
        errors: degradedResult.errors
      }
    };
  }

  /**
   * Run multiple agents in parallel.
   */
  static async runParallel(agents, context, timeoutMs = 5000, maxRetries = 2) {
    const promises = agents.map(agent => this.runAgent(agent, context, timeoutMs, maxRetries));
    const results = await Promise.allSettled(promises);

    return results.map((settled, index) => {
      if (settled.status === 'fulfilled') {
        return settled.value;
      } else {
        const errMsg = settled.reason?.message || 'Parallel execution failed';
        const degradedResult = new AgentResult({
          agent: agents[index].name,
          status: 'degraded',
          confidence: 10,
          executionTime: 0,
          data: {},
          warnings: [errMsg],
          errors: [errMsg]
        });

        return {
          result: degradedResult,
          metrics: {
            executionTime: 0,
            queueTime: 0,
            retryCount: 0,
            failureCount: 1,
            status: 'degraded',
            confidence: 10,
            warnings: degradedResult.warnings,
            errors: degradedResult.errors
          }
        };
      }
    });
  }

  /**
   * Run multiple agents sequentially.
   */
  static async runSequential(agents, context, timeoutMs = 5000, maxRetries = 2) {
    const results = [];
    for (const agent of agents) {
      const execResult = await this.runAgent(agent, context, timeoutMs, maxRetries);
      results.push(execResult);
    }
    return results;
  }
}
