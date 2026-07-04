class AgentRegistry {
  constructor() {
    if (AgentRegistry.instance) {
      return AgentRegistry.instance;
    }
    this.agents = new Map();
    // Keep metadata on registered agents like enabled/disabled, version, health status
    this.metadata = new Map();
    AgentRegistry.instance = this;
  }

  /**
   * Register a new agent instance with optional metadata.
   */
  register(agent, meta = {}) {
    if (!agent || !agent.name) {
      throw new Error('Invalid agent: Agent must have a name');
    }
    if (this.agents.has(agent.name)) {
      throw new Error(`Agent with name "${agent.name}" is already registered.`);
    }

    this.agents.set(agent.name, agent);
    this.metadata.set(agent.name, {
      enabled: meta.enabled !== undefined ? meta.enabled : true,
      healthStatus: meta.healthStatus || 'healthy',
      version: agent.version || meta.version || '1.0.0',
      registeredAt: new Date().toISOString(),
      pluginConfig: meta.pluginConfig || {}
    });
  }

  /**
   * Retrieve an agent by name.
   * Throws if not registered or disabled.
   */
  get(name, includeDisabled = false) {
    const agent = this.agents.get(name);
    if (!agent) {
      throw new Error(`Agent with name "${name}" not found in registry.`);
    }

    const meta = this.metadata.get(name);
    if (!includeDisabled && meta && !meta.enabled) {
      throw new Error(`Agent "${name}" is currently disabled in the registry.`);
    }

    return agent;
  }

  /**
   * Disable an agent in the registry.
   */
  disable(name) {
    if (!this.agents.has(name)) {
      throw new Error(`Agent "${name}" not registered.`);
    }
    const meta = this.metadata.get(name);
    meta.enabled = false;
    this.metadata.set(name, meta);
  }

  /**
   * Enable an agent in the registry.
   */
  enable(name) {
    if (!this.agents.has(name)) {
      throw new Error(`Agent "${name}" not registered.`);
    }
    const meta = this.metadata.get(name);
    meta.enabled = true;
    this.metadata.set(name, meta);
  }

  /**
   * Set agent health status.
   */
  setHealthStatus(name, healthStatus) {
    if (!this.agents.has(name)) {
      throw new Error(`Agent "${name}" not registered.`);
    }
    const meta = this.metadata.get(name);
    meta.healthStatus = healthStatus; // 'healthy', 'degraded', 'unhealthy'
    this.metadata.set(name, meta);
  }

  /**
   * Check if agent is registered and enabled.
   */
  isRegistered(name, mustBeEnabled = false) {
    if (!this.agents.has(name)) return false;
    if (mustBeEnabled) {
      return this.metadata.get(name).enabled;
    }
    return true;
  }

  /**
   * Get all registered agents.
   */
  getAll(includeDisabled = false) {
    const all = [];
    for (const [name, agent] of this.agents.entries()) {
      const meta = this.metadata.get(name);
      if (includeDisabled || meta.enabled) {
        all.push(agent);
      }
    }
    return all;
  }

  /**
   * Get registration stats.
   */
  getStats() {
    const allAgents = Array.from(this.agents.keys());
    const healthyAgents = allAgents.filter(name => this.metadata.get(name).healthStatus === 'healthy' && this.metadata.get(name).enabled).length;

    return {
      totalRegistered: allAgents.length,
      healthyAgents,
      agents: allAgents.map(name => {
        const agent = this.agents.get(name);
        const meta = this.metadata.get(name);
        return {
          name,
          description: agent.description,
          version: meta.version,
          enabled: meta.enabled,
          healthStatus: meta.healthStatus,
          registeredAt: meta.registeredAt
        };
      })
    };
  }

  /**
   * Clear all registrations.
   */
  clear() {
    this.agents.clear();
    this.metadata.clear();
  }
}

const registryInstance = new AgentRegistry();
export default registryInstance;
