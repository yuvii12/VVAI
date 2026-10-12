// ERP Sync Engine
// Handles bidirectional sync with conflict resolution:
// - ERP wins for real-time availability, booked, and sold status.
// - Admin/Manual wins for marketing text, descriptions, and custom notes.
// - All sync attempts log status, timing, and record counts to erp_sync_logs.

const store = require("../../lib/store");

async function triggerSync(triggeredBy = "MANUAL") {
  try {
    const log = store.syncERP(triggeredBy);
    return {
      success: true,
      log,
      message: "ERP inventory and availability successfully synchronized.",
    };
  } catch (err) {
    console.error("[ERP Sync Error]", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

function getSyncHistory() {
  return store.getErpSyncLogs();
}

module.exports = {
  triggerSync,
  getSyncHistory,
};
