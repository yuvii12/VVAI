// Analytics & Reports Routes
const express = require("express");
const router = express.Router();
const store = require("../lib/store");
const { requireAuth } = require("../middleware/auth");

// GET /api/reports/dashboard, /api/dashboard/stats, etc.
router.get(["/dashboard", "/stats", "/dashboard/stats", "/"], (req, res) => {
  const stats = store.getDashboardStats();
  res.json({ stats, ...stats });
});

// GET /api/reports/inventory-summary
router.get("/inventory-summary", requireAuth, (req, res) => {
  const inventory = store.getInventory();
  const byCity = {};
  const byType = {};

  inventory.forEach((u) => {
    byCity[u.city] = (byCity[u.city] || 0) + 1;
    byType[u.propertyType] = (byType[u.propertyType] || 0) + 1;
  });

  res.json({
    totalUnits: inventory.length,
    byCity,
    byType,
    availableCount: inventory.filter((u) => u.status === "Available").length,
    soldCount: inventory.filter((u) => u.status === "Sold").length,
  });
});

// GET /api/reports/ai-monitoring (Admin intelligence)
router.get("/ai-monitoring", requireAuth, (req, res) => {
  const auditLogs = store.auditLogs || [];
  const aiQueries = auditLogs.filter((l) => l.action === "QUERY_AI");

  const byCity = {};
  const byIntent = {};
  const byUser = {};

  aiQueries.forEach((q) => {
    const city = q.metadata?.city || "Unspecified";
    const intent = q.metadata?.intent || "general_faq";
    const actor = q.userId || "Anonymous";

    byCity[city] = (byCity[city] || 0) + 1;
    byIntent[intent] = (byIntent[intent] || 0) + 1;
    byUser[actor] = (byUser[actor] || 0) + 1;
  });

  res.json({
    totalQueries: aiQueries.length,
    byCity,
    byIntent,
    byUser,
    mostSearchedPropertyType: "Bungalow (Yamuna / Ananta)",
    mostSearchedCity: Object.keys(byCity).sort((a, b) => byCity[b] - byCity[a])[0] || "Patna",
    failedQueriesCount: 0,
    erpLookupFailures: 0,
    crmLookupFailures: 0,
    recentQueries: aiQueries.slice(0, 15).map((q) => ({
      question: q.metadata?.question,
      intent: q.metadata?.intent,
      city: q.metadata?.city,
      timestamp: q.timestamp,
      user: q.userId,
    })),
  });
});

// GET /api/reports/export
router.get("/export", requireAuth, (req, res) => {
  const { type = "inventory" } = req.query;
  const items = type === "inventory" ? store.getInventory() : store.getBookings();

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="${type}_report.json"`);
  res.json(items);
});

module.exports = router;
