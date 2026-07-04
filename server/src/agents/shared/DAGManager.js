export class DAGManager {
  constructor() {
    this.nodes = new Map(); // Agent Name -> Set of dependency Agent Names
  }

  /**
   * Add a node to the dependency graph.
   * @param {string} name - Agent name.
   * @param {Array<string>} dependencies - Names of agents this agent depends on.
   */
  addNode(name, dependencies = []) {
    this.nodes.set(name, new Set(dependencies));
  }

  /**
   * Resolves the Directed Acyclic Graph (DAG) into sequential execution stages.
   * Each stage contains a list of agent names that can be executed in parallel.
   * Throws an error if a circular dependency is detected.
   * @returns {Array<Array<string>>} List of parallel execution groups.
   */
  resolveStages() {
    const remaining = new Map();
    for (const [name, deps] of this.nodes.entries()) {
      remaining.set(name, new Set(deps));
    }

    const stages = [];
    const resolved = new Set();

    while (remaining.size > 0) {
      const currentStage = [];

      for (const [name, deps] of remaining.entries()) {
        const dependenciesSatisfied = Array.from(deps).every(dep => resolved.has(dep));
        if (dependenciesSatisfied) {
          currentStage.push(name);
        }
      }

      if (currentStage.length === 0) {
        throw new Error('DAG Resolution Error: Cyclic dependency detected or unresolved dependency!');
      }

      stages.push(currentStage);
      for (const name of currentStage) {
        resolved.add(name);
        remaining.delete(name);
      }
    }

    return stages;
  }
}
