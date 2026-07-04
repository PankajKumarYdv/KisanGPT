export class EventEmitter {
  constructor() {
    this.listeners = new Map(); // Event Name -> Set of handler functions
  }

  /**
   * Subscribe to an event.
   * @param {string} event - Event name.
   * @param {Function} handler - Callback function.
   * @returns {Function} Unsubscribe function.
   */
  subscribe(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);

    // Return an unsubscribe helper
    return () => this.unsubscribe(event, handler);
  }

  /**
   * Unsubscribe from an event.
   */
  unsubscribe(event, handler) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(handler);
    }
  }

  /**
   * Emit an event to all subscribers.
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      for (const handler of this.listeners.get(event)) {
        try {
          handler(data);
        } catch (error) {
          console.error(`EventEmitter: Handler for event "${event}" threw an error:`, error);
        }
      }
    }
  }
}
