// CRM Client connector with resilient fallback to local data repository
const store = require("../../lib/store");

class CrmClient {
  constructor() {
    this.apiUrl = process.env.CRM_API_URL || null;
    this.apiKey = process.env.CRM_API_KEY || null;
  }

  isConfigured() {
    return Boolean(this.apiUrl && this.apiKey);
  }

  async fetch(endpoint, options = {}) {
    if (!this.isConfigured()) {
      return this.simulateCrmEndpoint(endpoint, options);
    }

    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          ...(options.headers || {}),
        },
      });
      if (!response.ok) throw new Error(`CRM returned ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn(`[CRM Client] External call failed (${err.message}). Using local store.`);
      return this.simulateCrmEndpoint(endpoint, options);
    }
  }

  simulateCrmEndpoint(endpoint) {
    if (endpoint.startsWith("/leads")) return { status: "success", leads: store.getLeads() };
    if (endpoint.startsWith("/customers")) return { status: "success", customers: store.getCustomers() };
    return { status: "success", data: [] };
  }
}

module.exports = new CrmClient();
