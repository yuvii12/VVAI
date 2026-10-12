// Unified ERP Integration Service
// Orchestrates live inventory, project, customer, and booking retrieval from the real company ERP.
// Strictly adheres to production rules:
// 1. Never falls back to fake/dummy data.
// 2. Returns clear, standard "ERP service is currently unavailable. Please try again later." when offline.
// 3. Masks credentials and isolates network transport.

const erpClient = require("./erpClient");
const erpHealth = require("./erpHealth");
const erpMapper = require("./erpMapper");

class ErpService {
  async getStatus() {
    const health = erpHealth.getStatus();
    return {
      status: health.status,
      isConfigured: erpClient.isConfigured(),
      isOnline: health.isOnline,
      endpoint: process.env.ERP_API_URL || "Not configured",
      latencyMs: health.latencyMs,
      lastPingAt: health.lastPingAt,
      lastSuccessfulSyncAt: health.lastSuccessfulSyncAt,
      consecutiveFailures: health.consecutiveFailures,
    };
  }

  async getInventory(filter = {}) {
    const params = new URLSearchParams(filter).toString();
    const result = await erpClient.fetch(`/inventory${params ? `?${params}` : ""}`);

    if (!result.isLive) {
      return {
        isLive: false,
        error: "ERP service is currently unavailable. Please try again later.",
        units: [],
        count: 0,
      };
    }

    const units = Array.isArray(result.data) ? result.data.map((u) => erpMapper.mapUnit(u)) : [];
    return {
      isLive: true,
      source: "Real Company ERP",
      lastSyncedAt: result.lastSyncedAt,
      count: units.length,
      units,
    };
  }

  async getProjects(filter = {}) {
    const params = new URLSearchParams(filter).toString();
    const result = await erpClient.fetch(`/projects${params ? `?${params}` : ""}`);

    if (!result.isLive) {
      return {
        isLive: false,
        error: "ERP service is currently unavailable. Please try again later.",
        projects: [],
        count: 0,
      };
    }

    const projects = Array.isArray(result.data) ? result.data.map((p) => erpMapper.mapProject(p)) : [];
    return {
      isLive: true,
      source: "Real Company ERP",
      lastSyncedAt: result.lastSyncedAt,
      count: projects.length,
      projects,
    };
  }

  async getCustomers(filter = {}) {
    const params = new URLSearchParams(filter).toString();
    const result = await erpClient.fetch(`/customers${params ? `?${params}` : ""}`);

    if (!result.isLive) {
      return {
        isLive: false,
        error: "ERP service is currently unavailable. Please try again later.",
        customers: [],
        count: 0,
      };
    }

    const customers = Array.isArray(result.data) ? result.data.map((c) => erpMapper.mapCustomer(c)) : [];
    return {
      isLive: true,
      source: "Real Company ERP",
      lastSyncedAt: result.lastSyncedAt,
      count: customers.length,
      customers,
    };
  }

  async getLeads(filter = {}) {
    const params = new URLSearchParams(filter).toString();
    const result = await erpClient.fetch(`/leads${params ? `?${params}` : ""}`);

    if (!result.isLive) {
      return {
        isLive: false,
        error: "ERP service is currently unavailable. Please try again later.",
        leads: [],
        count: 0,
      };
    }

    const leads = Array.isArray(result.data) ? result.data.map((l) => erpMapper.mapLead(l)) : [];
    return {
      isLive: true,
      source: "Real Company ERP",
      lastSyncedAt: result.lastSyncedAt,
      count: leads.length,
      leads,
    };
  }
}

module.exports = new ErpService();
