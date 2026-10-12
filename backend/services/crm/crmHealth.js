// CRM Health & Connectivity Monitor

class CrmHealth {
  constructor() {
    this.isOnline = true;
    this.lastPingAt = new Date().toISOString();
    this.lastSyncAt = new Date().toISOString();
  }

  getStatus() {
    const isConfigured = Boolean(process.env.CRM_API_URL && process.env.CRM_API_KEY);
    return {
      status: this.isOnline ? "CONNECTED" : "OFFLINE",
      mode: isConfigured ? "External CRM Webhook/REST API" : "Simulated CRM Engine",
      endpoint: process.env.CRM_API_URL || "http://crm.vastuvihar.internal/api/v1",
      isOnline: this.isOnline,
      lastPingAt: this.lastPingAt,
      lastSyncAt: this.lastSyncAt,
    };
  }

  recordSync() {
    this.lastSyncAt = new Date().toISOString();
    this.lastPingAt = new Date().toISOString();
    this.isOnline = true;
  }
}

module.exports = new CrmHealth();
