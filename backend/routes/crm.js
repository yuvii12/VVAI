// CRM Routes (Customers, Leads, Pipelines, Follow-ups, Interactions)
const express = require("express");
const router = express.Router();
const store = require("../lib/store");
const { syncCRM } = require("../services/crm/crmSync");
const crmFollowups = require("../services/crm/crmFollowups");
const crmInteractions = require("../services/crm/crmInteractions");
const { requireAuth, requireRole } = require("../middleware/auth");

// GET /api/crm/customers
router.get("/customers", requireAuth, (req, res) => {
  const { q } = req.query;
  const customers = store.getCustomers(req.user, q);
  res.json({ count: customers.length, customers });
});

// POST /api/crm/customers
router.post("/customers", requireAuth, (req, res) => {
  try {
    const customer = store.createCustomer(req.body, req.user);
    res.status(201).json({ message: "Customer created.", customer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/crm/leads
router.get("/leads", requireAuth, (req, res) => {
  const { stage } = req.query;
  const leads = store.getLeads(req.user, stage);
  res.json({ count: leads.length, leads });
});

// GET /api/crm/followups/today
router.get("/followups/today", requireAuth, (req, res) => {
  const followups = crmFollowups.getTodayFollowups(req.user);
  res.json({ count: followups.length, followups });
});

// GET /api/crm/followups/pending
router.get("/followups/pending", requireAuth, (req, res) => {
  const pending = crmFollowups.getPendingLeads(req.user);
  res.json({ count: pending.length, pending });
});

// GET /api/crm/site-visits/tomorrow
router.get("/site-visits/tomorrow", requireAuth, (req, res) => {
  const visits = crmFollowups.getSiteVisitsTomorrow(req.user);
  res.json({ count: visits.length, visits });
});

// GET /api/crm/interactions
router.get("/interactions", requireAuth, (req, res) => {
  const { leadId } = req.query;
  const list = crmInteractions.getInteractions(req.user, leadId);
  res.json({ count: list.length, interactions: list });
});

// POST /api/crm/interactions
router.post("/interactions", requireAuth, (req, res) => {
  const newInt = crmInteractions.logInteraction(req.body, req.user);
  res.status(201).json({ message: "Interaction recorded.", interaction: newInt });
});

// PATCH /api/crm/leads/:id/stage
router.patch("/leads/:id/stage", requireAuth, (req, res) => {
  const { stage } = req.body || {};
  if (!stage) return res.status(400).json({ error: "Stage is required." });

  const updated = store.updateLeadStage(req.params.id, stage, req.user);
  if (!updated) return res.status(404).json({ error: "Lead not found." });

  res.json({ message: "Lead stage updated.", lead: updated });
});

// POST /api/crm/sync
router.post("/sync", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const result = await syncCRM(req.user?.name || "ADMIN");
  res.json(result);
});

module.exports = router;
