// CRM Follow-ups and Site Visit Reminders Service
const store = require("../../lib/store");

function getTodayFollowups(user) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const leads = store.getLeads(user);
  return leads.filter((l) => l.followupDate && l.followupDate.slice(0, 10) === todayStr);
}

function getPendingLeads(user) {
  const leads = store.getLeads(user);
  return leads.filter((l) => l.stage === "New" || l.stage === "Contacted" || l.stage === "Interested");
}

function getSiteVisitsTomorrow(user) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const visits = store.getSiteVisits(user);
  return visits.filter((v) => v.visitDate && v.visitDate.slice(0, 10) === tomorrowStr);
}

module.exports = {
  getTodayFollowups,
  getPendingLeads,
  getSiteVisitsTomorrow,
};
