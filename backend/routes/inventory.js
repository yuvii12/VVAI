// Inventory Routes
const express = require("express");
const router = express.Router();
const store = require("../lib/store");
const { requireAuth } = require("../middleware/auth");

// GET /api/inventory (supports / and /inventory)
router.get(["/", "/inventory"], (req, res) => {
  const { city, project, phase, status, bhk } = req.query;
  const list = store.getInventory({ city, project, phase, status, bhk });
  res.json({ count: list.length, units: list });
});

// PATCH /api/inventory/:id/status (supports /:id/status and /inventory/:id/status)
router.patch(["/:id/status", "/inventory/:id/status"], requireAuth, (req, res) => {
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }
  const updated = store.updateUnitStatus(req.params.id, status, `USER_${req.user.name}`);
  if (!updated) {
    return res.status(404).json({ error: "Unit not found." });
  }
  res.json({ message: "Unit status updated.", unit: updated });
});

module.exports = router;
