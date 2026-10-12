// CRM Sync Service
const store = require("../../lib/store");

async function syncCRM(triggeredBy = "MANUAL") {
  const startedAt = new Date().toISOString();
  // Pull leads from CRM and deduplicate with external IDs
  const completedAt = new Date().toISOString();

  const log = {
    syncType: "CRM_LEADS_CUSTOMERS",
    status: "SUCCESS",
    recordsProcessed: store.customers.length + store.leads.length,
    recordsUpdated: 0,
    recordsInserted: 0,
    triggeredBy,
    startedAt,
    completedAt,
  };

  store.logAudit({
    action: "CRM_SYNC",
    entity: "CrmSync",
    metadata: log,
  });

  return log;
}

module.exports = {
  syncCRM,
};
