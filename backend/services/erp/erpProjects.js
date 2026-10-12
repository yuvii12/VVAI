const erpClient = require("./erpClient");
const store = require("../../lib/store");

async function getLiveProjects(city = null) {
  const data = await erpClient.fetch("/projects");
  let projects = data.projects || store.getProjects();
  if (city) {
    projects = projects.filter((p) => p.city.toLowerCase() === city.toLowerCase());
  }
  return projects;
}

async function getProjectDetails(city, phase = null) {
  const projects = await getLiveProjects(city);
  if (!projects || projects.length === 0) return null;

  const project = projects[0];
  const phases = store.getProjectPhases(project.id);

  if (phase) {
    const cleanPhase = phase.toUpperCase().replace(/^PH-?/, "PH-");
    const phaseMatch = phases.find((ph) => ph.phaseName.toUpperCase().includes(cleanPhase));
    return { project, phase: phaseMatch || phases[0], phases };
  }

  return { project, phases };
}

module.exports = {
  getLiveProjects,
  getProjectDetails,
};
