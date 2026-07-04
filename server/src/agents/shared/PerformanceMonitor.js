export class PerformanceMonitor {
  constructor() {
    this.startTime = Date.now();
    this.agentTimings = new Map(); // Agent Name -> { start, end, duration }
  }

  /**
   * Record agent start relative to pipeline start.
   */
  recordAgentStart(agentName) {
    this.agentTimings.set(agentName, {
      start: Date.now() - this.startTime,
      end: 0,
      duration: 0
    });
  }

  /**
   * Record agent end.
   */
  recordAgentEnd(agentName) {
    const timing = this.agentTimings.get(agentName);
    if (timing) {
      timing.end = Date.now() - this.startTime;
      timing.duration = timing.end - timing.start;
      this.agentTimings.set(agentName, timing);
    }
  }

  /**
   * Get chronological timeline for visualization.
   */
  getTimeline() {
    const timeline = [];
    for (const [agent, timing] of this.agentTimings.entries()) {
      timeline.push({
        agent,
        startMs: timing.start,
        endMs: timing.end,
        durationMs: timing.duration
      });
    }
    return timeline.sort((a, b) => a.startMs - b.startMs);
  }

  /**
   * Get total duration.
   */
  getTotalDuration() {
    return Date.now() - this.startTime;
  }
}
