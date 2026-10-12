// ERP Integration Routes
const express = require("express");
const router = express.Router();
const erpClient = require("../services/erp/erpClient");
const erpHealth = require("../services/erp/erpHealth");
const erpService = require("../services/erp/erpService");
const { triggerSync, getSyncHistory } = require("../services/erp/erpSync");
const { requireAuth, requireRole } = require("../middleware/auth");

// GET /api/erp/status
router.get("/status", requireAuth, async (req, res) => {
  const status = await erpService.getStatus();
  res.json({
    connected: status.isOnline,
    isExternal: status.isConfigured,
    health: status,
    apiUrl: status.endpoint,
    syncIntervalSeconds: parseInt(process.env.ERP_SYNC_INTERVAL || "300", 10),
    lastSync: getSyncHistory()[0] || null,
  });
});

// GET /api/erp/inventory
router.get("/inventory", requireAuth, async (req, res) => {
  const result = await erpService.getInventory(req.query);
  res.json(result);
});

// GET /api/erp/projects
router.get("/projects", requireAuth, async (req, res) => {
  const result = await erpService.getProjects(req.query);
  res.json(result);
});

// GET /api/erp/customers
router.get("/customers", requireAuth, async (req, res) => {
  const result = await erpService.getCustomers(req.query);
  res.json(result);
});

// POST /api/erp/sync (Admin only)
router.post("/sync", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const result = await triggerSync(req.user?.name || "Admin");
  res.json(result);
});

// GET /api/erp/logs (Admin only)
router.get("/logs", requireAuth, requireRole("ADMIN"), (req, res) => {
  res.json({ logs: getSyncHistory() });
});

// GET /api/erp/mapping
router.get("/mapping", requireAuth, (req, res) => {
  res.json({
    adapters: [
      { source: "external_project_id", internal: "Project.id", desc: "Project unique ERP identifier" },
      { source: "external_unit_id", internal: "PropertyUnit.id", desc: "Unit primary key" },
      { source: "item_code", internal: "PropertyUnit.unitNumber", desc: "Flat/Bungalow unit number" },
      { source: "status_flag [A/B/S/H]", internal: "PropertyUnit.status [Available/Booked/Sold/Held]", desc: "Live ERP booking status" },
      { source: "cost_center", internal: "PriceList.city", desc: "City pricing allocation" },
      { source: "base_rate", internal: "PriceList.basePrice", desc: "Base property price" },
    ],
  });
});

// POST /api/erp/toggle-health (Admin only, useful for testing offline ERP fallback)
router.post("/toggle-health", requireAuth, requireRole("ADMIN"), (req, res) => {
  const { online } = req.body || {};
  erpHealth.setSimulatedState(online !== false);
  res.json({ message: "ERP state updated", health: erpHealth.getStatus() });
});

module.exports = router;
