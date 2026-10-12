// Properties & Bungalow Models Routes
const express = require("express");
const router = express.Router();
const store = require("../lib/store");

// GET /api/properties
router.get("/", (req, res) => {
  const { propertyType, bhk, q } = req.query;
  const list = store.getProperties({ propertyType, bhk, q });
  res.json({ count: list.length, properties: list });
});

// GET /api/properties/bungalows
router.get("/bungalows", (req, res) => {
  res.json({ bungalows: store.getBungalows() });
});

// GET /api/properties/flats
router.get("/flats", (req, res) => {
  res.json({ flats: store.getFlats() });
});

// GET /api/properties/specifications
router.get("/specifications", (req, res) => {
  res.json({ specifications: store.getSpecifications() });
});

// GET /api/properties/building-specifications
router.get("/building-specifications", (req, res) => {
  res.json({ buildingSpecifications: store.getBuildingSpecifications() });
});

// GET /api/properties/:id
router.get("/:id", (req, res) => {
  const property = store.getPropertyById(req.params.id);
  if (!property) {
    return res.status(404).json({ error: "Property model not found." });
  }
  res.json({ property });
});

module.exports = router;
