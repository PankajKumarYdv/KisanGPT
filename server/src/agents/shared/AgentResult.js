export class AgentResult {
  constructor({ agent, status, confidence, executionTime, data = {}, warnings = [], errors = [] }) {
    this.agent = agent;
    this.status = status;
    this.confidence = confidence;
    this.executionTime = executionTime;
    this.data = data;
    this.warnings = warnings;
    this.errors = errors;
  }

  static success(agent, data, confidence, executionTime, warnings = []) {
    return new AgentResult({
      agent,
      status: 'success',
      confidence,
      executionTime,
      data,
      warnings,
      errors: []
    });
  }

  static failure(agent, errorMsg, executionTime, warnings = []) {
    return new AgentResult({
      agent,
      status: 'failure',
      confidence: 0,
      executionTime,
      data: {},
      warnings,
      errors: [errorMsg]
    });
  }
}
