// Projects & Locations Routes
const express = require("express");
const router = express.Router();
const store = require("../lib/store");

// GET /api/states
router.get("/states", (req, res) => {
  res.json({ states: store.getStates() });
});

// GET /api/cities
router.get("/cities", (req, res) => {
  const state = req.query.state || (typeof req.query === "object" ? req.query.state : null);
  res.json({ cities: store.getCities(state) });
});

// GET /api/offices
router.get("/offices", (req, res) => {
  res.json({ offices: store.getOffices(req.query.q) });
});

// GET /api/projects
router.get("/", (req, res) => {
  const { state, city, status, phase, q } = req.query;
  const list = store.getProjects({ state, city, status, phase, q });
  res.json({ count: list.length, projects: list });
});

// GET /api/projects/:id
router.get("/:id", (req, res) => {
  const project = store.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: `Project '${req.params.id}' not found.` });
  }
  const office = store.getOfficeAddress(project.city);
  res.json({ project, office });
});

module.exports = router;
