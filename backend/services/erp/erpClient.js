// ERP API Client
// Connects strictly to the company's real external ERP system.
// All mock/dummy fallback simulations have been removed in accordance with production data standards.
// If the ERP is unconfigured or unreachable, it returns a standard graceful error.

const erpHealth = require("./erpHealth");
const erpAuth = require("./erpAuth");

class ErpClient {
  constructor() {
    this.apiUrl = process.env.ERP_API_URL || null;
  }

  isConfigured() {
    return Boolean(this.apiUrl && erpAuth.isConfigured());
  }

  async fetch(endpoint, options = {}) {
    // If not configured, immediately report clean unavailable state without fabricating dummy records
    if (!this.isConfigured()) {
      erpHealth.setSimulatedState(false);
      return {
        isLive: false,
        status: "UNAVAILABLE",
        error: "ERP service is currently unavailable. Please try again later.",
        message: "ERP connection credentials not configured in environment.",
        data: [],
      };
    }

    // If health monitor is explicitly set to offline
    if (!erpHealth.isOnline) {
      return {
        isLive: false,
        status: "UNAVAILABLE",
        error: "ERP service is currently unavailable. Please try again later.",
        lastAttemptAt: erpHealth.lastPingAt,
        data: [],
      };
    }

    const startTime = Date.now();
    try {
      const authHeader = await erpAuth.getAuthHeader();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
          ...(options.headers || {}),
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`ERP API returned HTTP status ${response.status}`);
      }

      const raw = await response.json();
      const latency = Date.now() - startTime;
      erpHealth.recordSuccess(latency);

      return {
        isLive: true,
        status: "SUCCESS",
        source: "Company Real ERP Live Feed",
        lastSyncedAt: new Date().toISOString(),
        latencyMs: latency,
        data: raw,
      };
    } catch (err) {
      erpHealth.recordFailure(err);
      console.warn(`[ERP Client] Call to ${endpoint} failed: ${err.message}. Reporting service unavailable.`);

      return {
        isLive: false,
        status: "UNAVAILABLE",
        error: "ERP service is currently unavailable. Please try again later.",
        lastAttemptAt: new Date().toISOString(),
        data: [],
      };
    }
  }
}

module.exports = new ErpClient();
