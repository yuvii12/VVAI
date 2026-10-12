// Site Visits Routes
const express = require("express");
const router = express.Router();
const store = require("../lib/store");
const { requireAuth } = require("../middleware/auth");

const path = require("path");
const fs = require("fs");

// GET /api/site-visits/locations (Official Verified Project Sites with Map Links)
router.get("/locations", requireAuth, (req, res) => {
  const filePath = path.join(__dirname, "..", "data", "officialSiteAddresses.json");
  if (fs.existsSync(filePath)) {
    const sites = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const { city } = req.query;
    if (city) {
      const filtered = sites.filter((s) => s.city.toLowerCase() === city.toLowerCase());
      return res.json({ count: filtered.length, sites: filtered });
    }
    return res.json({ count: sites.length, sites });
  }
  res.json({ count: 0, sites: [] });
});

// GET /api/site-visits
router.get("/", requireAuth, (req, res) => {
  const visits = store.getSiteVisits(req.user);
  res.json({ count: visits.length, siteVisits: visits });
});

// POST /api/site-visits
router.post("/", requireAuth, (req, res) => {
  try {
    const visit = store.createSiteVisit(req.body, req.user);
    res.status(201).json({ message: "Site visit scheduled.", siteVisit: visit });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/site-visits/:id/status
router.patch("/:id/status", requireAuth, (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: "Status is required." });

  const updated = store.updateSiteVisitStatus(req.params.id, status, req.user);
  if (!updated) return res.status(404).json({ error: "Site visit record not found." });

  res.json({ message: "Site visit status updated.", siteVisit: updated });
});

module.exports = router;
