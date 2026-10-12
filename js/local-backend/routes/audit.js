/* Original backend file: backend/routes/audit.js  (unchanged, registered for the browser) */
VVServer.define("routes/audit.js", function (require, module, exports, __dirname) {

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

});
