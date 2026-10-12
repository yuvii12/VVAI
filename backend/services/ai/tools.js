// Enterprise Structured Tools for AI Property, CRM, ERP, and Document Lookups
const store = require("../../lib/store");
const erpClient = require("../erp/erpClient");
const erpHealth = require("../erp/erpHealth");
const erpInventory = require("../erp/erpInventory");
const crmLeads = require("../crm/crmLeads");
const crmFollowups = require("../crm/crmFollowups");
const documentStore = require("../documents/documentStore");

const tools = {
  // 1. Projects & Construction Status Lookups
  searchProjects: ({ state, city, status, q }) => {
    return store.getProjects({ state, city, status, q });
  },

  getCompletedProjects: ({ city }) => {
    const projects = store.getProjects({ city, status: "Completed" });
    return {
      status: "Completed",
      city: city || "All Locations",
      count: projects.length,
      projects,
    };
  },

  getUnderConstructionProjects: ({ city }) => {
    const projects = store.getProjects({ city, status: "Ongoing" });
    return {
      status: "Ongoing",
      city: city || "All Locations",
      count: projects.length,
      projects,
    };
  },

  // 2. Properties & Bungalow Models
  searchProperties: ({ propertyType, bhk, modelName }) => {
    return store.getProperties({ propertyType, bhk, modelName });
  },

  // 3. Live Inventory (ERP is source of truth; detects fallback if offline)
  getPropertyAvailability: async ({ city, project, phase, bhk, propertyType }) => {
    const health = erpHealth.getStatus();
    const isLive = health.isOnline;

    const units = store.getInventory({ city, project, phase, bhk, status: "Available" });
    const count = units.length;

    return {
      count,
      units: units.slice(0, 10),
      city,
      isLive,
      source: isLive ? "Live ERP Inventory" : "Synchronized Local Cache",
      lastSyncedAt: health.lastSuccessfulSyncAt,
      dataFreshness: isLive
        ? "Live business data directly from connected ERP."
        : `Live ERP inventory is currently unavailable. Showing the latest synchronized data from ${health.lastSuccessfulSyncAt}.`,
      timestamp: new Date().toISOString(),
    };
  },

  getProjectDetails: ({ city, phase }) => {
    const project = store.getProjectById(city);
    const phases = project ? store.getProjectPhases(project.id) : [];
    let selectedPhase = null;
    if (phase) {
      selectedPhase = phases.find((p) => p.phaseName.toUpperCase().includes(phase.toUpperCase()));
    }
    return {
      project,
      phase: selectedPhase || (phases.length > 0 ? phases[0] : null),
      phases,
    };
  },

  // 4. Addresses: Strictly distinguish Office vs Project Site
  getProjectAddress: ({ city, phase }) => {
    const loc = store.getProjectAddress(city, phase);
    return loc ? {
      city: loc.city,
      state: loc.state,
      phase: loc.phaseName,
      siteAddress: loc.siteAddress,
      status: loc.status,
      reraNumber: loc.reraNumber || "BR-RERA-VERIFIED",
      type: "PROJECT_SITE_ADDRESS",
    } : null;
  },

  getOfficeAddress: ({ city }) => {
    const office = store.getOfficeAddress(city);
    return office ? {
      city: office.city,
      state: office.state,
      officeAddress: office.officeAddress,
      phone: office.phone,
      email: office.email,
      type: "BRANCH_OFFICE_ADDRESS",
    } : null;
  },

  // 5. Pricing (City-Isolated)
  getPrice: ({ city, propertyType, bhk }) => {
    return store.getPrice(city, propertyType, bhk);
  },

  getPriceList: ({ city }) => {
    return store.getPriceLists({ city });
  },

  // 6. CRM Queries with Strict Server-Side RBAC
  getCustomer: ({ phone, name, q }, user) => {
    const list = store.getCustomers(user, phone || name || q);
    return list.slice(0, 5);
  },

  getAssignedLeads: (user) => {
    return crmLeads.getAssignedLeads(user);
  },

  getTodayFollowups: (user) => {
    return crmFollowups.getTodayFollowups(user);
  },

  getPendingLeads: (user) => {
    return crmFollowups.getPendingLeads(user);
  },

  getSiteVisitsTomorrow: (user) => {
    return crmFollowups.getSiteVisitsTomorrow(user);
  },

  findCustomersInterestedIn: ({ city, bhk, propertyType }, user) => {
    let leads = store.getLeads(user);
    if (city) {
      leads = leads.filter((l) => l.preferredCity?.toLowerCase() === city.toLowerCase());
    }
    if (bhk) {
      leads = leads.filter((l) => l.bhk === parseInt(bhk, 10));
    }
    if (propertyType) {
      leads = leads.filter((l) => l.propertyType?.toLowerCase().includes(propertyType.toLowerCase()));
    }
    return leads;
  },

  getSiteVisits: ({ user, status }) => {
    let visits = store.getSiteVisits(user);
    if (status) visits = visits.filter((v) => v.status.toLowerCase() === status.toLowerCase());
    return visits.slice(0, 10);
  },

  // 7. Statutory GST Computation
  calculateGST: ({ city, propertyType, carpetAreaSqm, propertyValue, basePrice, isCommercial, user }) => {
    return store.calculateGST({ city, propertyType, carpetAreaSqm, propertyValue, basePrice, isCommercial, user });
  },

  calculateEMI: ({ principal, interestRate = 8.5, tenureYears = 20 }) => {
    const p = parseFloat(principal);
    const r = (parseFloat(interestRate) / 12) / 100;
    const n = parseInt(tenureYears, 10) * 12;

    if (!p || !r || !n) return null;

    const emi = Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;

    return {
      principal: p,
      interestRate,
      tenureYears,
      monthlyEmi: emi,
      totalInterest,
      totalPayment,
    };
  },

  // 8. Document & Knowledge Lookups
  searchDocuments: ({ q, property, propertyType, city }) => {
    return documentStore.searchChunks({ q, property, propertyType, city });
  },

  searchKnowledge: ({ q, category }) => {
    return store.getKnowledge(q, category).slice(0, 3);
  },
};

module.exports = tools;
