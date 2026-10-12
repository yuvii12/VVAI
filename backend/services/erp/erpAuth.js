// ERP Authentication & Token Manager
// Supports OAuth2 (Client Credentials) or Direct API Key authentication.
// Credentials are read strictly from backend environment variables and NEVER exposed to frontend.

class ErpAuth {
  constructor() {
    this.token = null;
    this.tokenExpiresAt = 0;
  }

  isConfigured() {
    return Boolean(
      (process.env.ERP_CLIENT_ID && process.env.ERP_CLIENT_SECRET && process.env.ERP_TOKEN_URL) ||
      process.env.ERP_API_KEY
    );
  }

  async getAuthHeader() {
    // 1. Direct API Key authentication
    if (process.env.ERP_API_KEY) {
      return { Authorization: `Bearer ${process.env.ERP_API_KEY}` };
    }

    // 2. OAuth2 Client Credentials Flow
    if (process.env.ERP_CLIENT_ID && process.env.ERP_CLIENT_SECRET && process.env.ERP_TOKEN_URL) {
      if (this.token && Date.now() < this.tokenExpiresAt) {
        return { Authorization: `Bearer ${this.token}` };
      }

      try {
        const response = await fetch(process.env.ERP_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: process.env.ERP_CLIENT_ID,
            client_secret: process.env.ERP_CLIENT_SECRET,
            grant_type: "client_credentials",
          }),
        });

        if (!response.ok) {
          throw new Error(`ERP token endpoint returned HTTP ${response.status}`);
        }

        const data = await response.json();
        this.token = data.access_token || data.token;
        const expiresIn = data.expires_in || 3600;
        this.tokenExpiresAt = Date.now() + (expiresIn - 60) * 1000;

        return { Authorization: `Bearer ${this.token}` };
      } catch (err) {
        console.error("[ERP Auth] Token acquisition failed:", err.message);
        throw new Error(`ERP authentication failed: ${err.message}`);
      }
    }

    throw new Error("ERP authentication is not configured. Please supply ERP_API_KEY or ERP_CLIENT_ID & ERP_CLIENT_SECRET in backend environment.");
  }
}

module.exports = new ErpAuth();
