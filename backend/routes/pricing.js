// Pricing Routes
const express = require("express");
const router = express.Router();
const store = require("../lib/store");
const { requireAuth, requireRole } = require("../middleware/auth");

// GET /api/pricing (supports / and /pricing)
router.get(["/", "/pricing"], (req, res) => {
  const { city, propertyType } = req.query;
  const list = store.getPriceLists({ city, propertyType });
  res.json({ count: list.length, priceLists: list });
});

// GET /api/pricing/city/:city (supports /city/:city and /pricing/city/:city)
router.get(["/city/:city", "/pricing/city/:city"], (req, res) => {
  const list = store.getPriceLists({ city: req.params.city });
  res.json({ city: req.params.city, count: list.length, priceLists: list });
});

// PUT /api/pricing/:id (Admin only)
router.put(["/:id", "/pricing/:id"], requireAuth, requireRole("ADMIN"), (req, res) => {
  const updated = store.updatePriceList(req.params.id, req.body, req.user);
  if (!updated) {
    return res.status(404).json({ error: "Price list entry not found." });
  }
  res.json({ message: "Price list updated successfully.", priceList: updated });
});

// GET /api/pricing/history
router.get(["/history", "/pricing/history"], requireAuth, (req, res) => {
  res.json({ history: store.priceHistory });
});

module.exports = router;
