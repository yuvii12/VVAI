// CRM Leads Service with strict Server-Side RBAC enforcement
const store = require("../../lib/store");

function getLeadsForUser(user, stage = null) {
  return store.getLeads(user, stage);
}

function getAssignedLeads(user) {
  if (!user) return [];
  if (user.role === "ADMIN" || user.role === "MANAGER") {
    return store.getLeads(user);
  }
  // Sales employee only sees leads specifically assigned to their name or id
  const allLeads = store.getLeads(user);
  return allLeads.filter(
    (l) =>
      (l.assignedTo && l.assignedTo.toLowerCase().includes(user.name.toLowerCase())) ||
      l.assignedToId === user.id ||
      l.assignedTo === user.employeeCode
  );
}

function findLeadsByCityAndBhk(city, bhk = null, user = null) {
  let leads = store.getLeads(user);
  if (city) {
    leads = leads.filter((l) => l.preferredCity?.toLowerCase() === city.toLowerCase());
  }
  if (bhk) {
    leads = leads.filter((l) => l.bhk === parseInt(bhk, 10));
  }
  return leads;
}

function findLeadsByPropertyType(propertyType, user = null) {
  let leads = store.getLeads(user);
  if (propertyType) {
    const pt = propertyType.toLowerCase();
    leads = leads.filter((l) => l.propertyType?.toLowerCase().includes(pt));
  }
  return leads;
}

function updateLeadStage(leadId, stage, user) {
  return store.updateLeadStage(leadId, stage, user);
}

module.exports = {
  getLeadsForUser,
  getAssignedLeads,
  findLeadsByCityAndBhk,
  findLeadsByPropertyType,
  updateLeadStage,
};
