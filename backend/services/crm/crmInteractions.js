// CRM Interactions Service
const store = require("../../lib/store");

function getInteractions(user, leadId = null) {
  let interactions = store.interactions || [];
  if (leadId) {
    interactions = interactions.filter((i) => i.leadId === leadId);
  }
  return interactions;
}

function logInteraction(data, user) {
  const newInt = {
    id: `int_${Date.now()}`,
    leadId: data.leadId,
    customerId: data.customerId,
    type: data.type || "Call",
    summary: data.summary,
    nextAction: data.nextAction,
    performedBy: user?.name || "Sweta Kumari",
    timestamp: new Date().toISOString(),
  };

  if (!store.interactions) store.interactions = [];
  store.interactions.unshift(newInt);
  return newInt;
}

module.exports = {
  getInteractions,
  logInteraction,
};
