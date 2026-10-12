// ERP Phases Service
const erpClient = require("./erpClient");
const store = require("../../lib/store");

async function getLivePhases(city = null, projectId = null) {
  const data = await erpClient.fetch(`/phases${city ? `?city=${encodeURIComponent(city)}` : ""}`);
  let phases = data.phases || store.projectPhases;

  if (city) {
    phases = phases.filter((p) => p.city.toLowerCase() === city.toLowerCase());
  }
  if (projectId) {
    phases = phases.filter((p) => p.projectId === projectId);
  }

  return phases;
}

async function getPhaseByCode(city, phaseName) {
  const phases = await getLivePhases(city);
  if (!phaseName) return phases[0] || null;

  const clean = phaseName.toUpperCase().replace(/^PH-?/, "PH-");
  return phases.find((p) => p.phaseName.toUpperCase().includes(clean)) || null;
}

module.exports = {
  getLivePhases,
  getPhaseByCode,
};
