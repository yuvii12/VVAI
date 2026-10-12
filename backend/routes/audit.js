// Audit Logs Route (Admin Only)
const express = require("express");
const router = express.Router();
const store = require("../lib/store");
const { requireAuth, requireRole } = require("../middleware/auth");

// GET /api/audit
router.get("/", requireAuth, requireRole("ADMIN"), (req, res) => {
  const { limit = 100 } = req.query;
  res.json({ auditLogs: store.getAuditLogs(parseInt(limit, 10)) });
});

module.exports = router;
