// GST Calculation & Rules Configuration Routes
const express = require("express");
const router = express.Router();
const gstEngine = require("../services/gst/gstEngine");
const { requireAuth, requireRole } = require("../middleware/auth");

// POST /api/gst/calculate
router.post("/calculate", (req, res) => {
  try {
    const result = gstEngine.calculatePropertyGst(req.body || {});
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/gst/rules
router.get("/rules", (req, res) => {
  res.json({ rules: gstEngine.getActiveRules() });
});

// PUT /api/gst/rules/:id (Admin only)
router.put("/rules/:id", requireAuth, requireRole("ADMIN"), (req, res) => {
  const updated = gstEngine.updateRule(req.params.id, req.body, req.user);
  if (!updated) return res.status(404).json({ error: "GST Rule not found." });
  res.json({ message: "GST Rule updated successfully.", rule: updated });
});

// POST /api/gst/rules (Admin only)
router.post("/rules", requireAuth, requireRole("ADMIN"), (req, res) => {
  const created = gstEngine.addRule(req.body, req.user);
  res.status(201).json({ message: "GST Rule created.", rule: created });
});

// GET /api/gst/metro-cities
router.get("/metro-cities", (req, res) => {
  res.json({ metroCities: gstEngine.getMetroCities() });
});

// POST /api/gst/metro-cities (Admin only)
router.post("/metro-cities", requireAuth, requireRole("ADMIN"), (req, res) => {
  const { cityName, stateName } = req.body || {};
  if (!cityName) return res.status(400).json({ error: "City name is required." });
  const item = gstEngine.addMetroCity(cityName, stateName || "India", req.user);
  res.status(201).json({ message: "Metro city added.", metroCity: item });
});

// DELETE /api/gst/metro-cities/:id (Admin only)
router.delete("/metro-cities/:id", requireAuth, requireRole("ADMIN"), (req, res) => {
  const success = gstEngine.removeMetroCity(req.params.id, req.user);
  if (!success) return res.status(404).json({ error: "Metro city not found." });
  res.json({ message: "Metro city removed." });
});

module.exports = router;
