// ERP Health & Connectivity Monitor
// Tracks connection latency, uptime, and online/offline status for live inventory retrieval.

class ErpHealth {
  constructor() {
    this.isOnline = true;
    this.lastPingAt = new Date().toISOString();
    this.lastSuccessfulSyncAt = new Date().toISOString();
    this.consecutiveFailures = 0;
    this.latencyMs = 45;
  }

  // Check live status
  getStatus() {
    const isConfigured = Boolean(process.env.ERP_API_URL && process.env.ERP_API_KEY);
    return {
      status: this.isOnline ? "CONNECTED" : "OFFLINE",
      mode: isConfigured ? "External ERP API" : "Simulated ERP Engine",
      endpoint: process.env.ERP_API_URL || "http://erp.vastuvihar.internal/api/v2",
      isOnline: this.isOnline,
      latencyMs: this.isOnline ? this.latencyMs : null,
      lastPingAt: this.lastPingAt,
      lastSuccessfulSyncAt: this.lastSuccessfulSyncAt,
      consecutiveFailures: this.consecutiveFailures,
    };
  }

  recordSuccess(latency = 45) {
    this.isOnline = true;
    this.latencyMs = latency;
    this.consecutiveFailures = 0;
    this.lastPingAt = new Date().toISOString();
    this.lastSuccessfulSyncAt = new Date().toISOString();
  }

  recordFailure(err) {
    this.consecutiveFailures += 1;
    this.lastPingAt = new Date().toISOString();
    if (this.consecutiveFailures >= 2) {
      this.isOnline = false;
    }
  }

  // Force simulated offline state (for testing ERP fallback messaging)
  setSimulatedState(online) {
    this.isOnline = Boolean(online);
    if (this.isOnline) {
      this.consecutiveFailures = 0;
    }
  }
}

module.exports = new ErpHealth();
