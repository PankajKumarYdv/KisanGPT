export class AgentContext {
  constructor({ farmer, assessment = null, executionId = null, metadata = {}, sharedVars = {}, agentResults = new Map() }) {
    // Deep freeze farmer to ensure immutability
    this.farmer = farmer ? Object.freeze(JSON.parse(JSON.stringify(farmer))) : null;
    this.assessment = assessment ? Object.freeze(JSON.parse(JSON.stringify(assessment))) : null;
    this.executionId = executionId || `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.metadata = Object.freeze({ ...metadata });
    this.sharedVars = Object.freeze({ ...sharedVars });
    this.agentResults = Object.freeze(new Map(agentResults));
  }

  /**
   * Returns a new copy of the AgentContext with modified/added properties,
   * maintaining the immutability of the existing instance.
   */
  copyWith({ agentResults, sharedVars, assessment }) {
    return new AgentContext({
      farmer: this.farmer,
      assessment: assessment !== undefined ? assessment : this.assessment,
      executionId: this.executionId,
      metadata: this.metadata,
      sharedVars: sharedVars ? { ...this.sharedVars, ...sharedVars } : this.sharedVars,
      agentResults: agentResults ? new Map([...this.agentResults, ...agentResults]) : this.agentResults
    });
  }

  /**
   * Retrieves result for a given agent name.
   */
  getAgentResult(agentName) {
    return this.agentResults.get(agentName);
  }

  /**
   * Checks if a result exists for a given agent name.
   */
  hasAgentResult(agentName) {
    return this.agentResults.has(agentName);
  }
}
