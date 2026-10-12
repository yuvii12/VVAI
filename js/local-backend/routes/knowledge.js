/* Original backend file: backend/routes/knowledge.js  (unchanged, registered for the browser) */
VVServer.define("routes/knowledge.js", function (require, module, exports, __dirname) {

// Official Vastu Vihar Knowledge Routes & Admin Training Endpoints
const express = require("express");
const router = express.Router();
const store = require("../lib/store");
const { requireAuth, requireRole } = require("../middleware/auth");

// GET /api/knowledge (list / search knowledge entries)
router.get(["/", "/knowledge"], (req, res) => {
  const { q, category } = req.query;
  const list = store.getKnowledge(q, category);
  res.json({ count: list.length, knowledge: list });
});

// GET /api/knowledge/categories
router.get(["/categories/list", "/knowledge/categories/list"], (req, res) => {
  res.json({
    categories: [
      "Project",
      "Property",
      "Location",
      "FAQ",
      "GST",
      "RERA",
      "Registry",
      "Building Specification",
      "Home Loan",
      "Other"
    ]
  });
});

// GET /api/knowledge/:id
router.get(["/:id", "/knowledge/:id"], (req, res) => {
  const item = store.getKnowledgeById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: "Knowledge entry not found." });
  }
  res.json({ entry: item });
});

// POST /api/knowledge (Admin only - Add Knowledge)
router.post(["/", "/knowledge"], requireAuth, requireRole("ADMIN"), (req, res) => {
  try {
    const entry = store.addKnowledgeEntry(req.body, req.user);
    res.status(201).json({ message: "Knowledge entry added successfully.", entry });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/knowledge/:id (Admin only - Edit Knowledge)
router.put(["/:id", "/knowledge/:id"], requireAuth, requireRole("ADMIN"), (req, res) => {
  try {
    const updated = store.updateKnowledgeEntry(req.params.id, req.body, req.user);
    if (!updated) {
      return res.status(404).json({ error: "Knowledge entry not found." });
    }
    res.json({ message: "Knowledge entry updated successfully.", entry: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/knowledge/:id (Admin only - Delete Knowledge)
router.delete(["/:id", "/knowledge/:id"], requireAuth, requireRole("ADMIN"), (req, res) => {
  try {
    const deleted = store.deleteKnowledgeEntry(req.params.id, req.user);
    if (!deleted) {
      return res.status(404).json({ error: "Knowledge entry not found." });
    }
    res.json({ message: "Knowledge entry deleted successfully." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

});
