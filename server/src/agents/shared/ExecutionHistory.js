class ExecutionHistory {
  constructor() {
    if (ExecutionHistory.instance) {
      return ExecutionHistory.instance;
    }
    this.history = new Map(); // Execution ID -> Execution Report
    ExecutionHistory.instance = this;
  }

  /**
   * Save an execution report.
   */
  save(id, report) {
    this.history.set(id, report);
  }

  /**
   * Retrieve an execution report by ID.
   */
  get(id) {
    return this.history.get(id);
  }

  /**
   * Retrieve all execution reports.
   */
  getAll() {
    return Array.from(this.history.values());
  }

  /**
   * Clear history.
   */
  clear() {
    this.history.clear();
  }
}

const historyInstance = new ExecutionHistory();
export default historyInstance;
