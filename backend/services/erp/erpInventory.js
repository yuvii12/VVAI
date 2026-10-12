const erpClient = require("./erpClient");
const store = require("../../lib/store");

async function getLiveInventory(filter = {}) {
  const data = await erpClient.fetch("/inventory");
  let inventory = data.inventory || store.getInventory();

  if (filter.city) {
    inventory = inventory.filter((u) => u.city.toLowerCase() === filter.city.toLowerCase());
  }
  if (filter.project) {
    inventory = inventory.filter((u) => u.projectName.toLowerCase().includes(filter.project.toLowerCase()));
  }
  if (filter.bhk) {
    inventory = inventory.filter((u) => u.bhk === parseInt(filter.bhk, 10));
  }
  if (filter.status) {
    inventory = inventory.filter((u) => u.status.toLowerCase() === filter.status.toLowerCase());
  }

  return inventory;
}

async function getAvailableUnitsCount(city, propertyType = null) {
  const units = await getLiveInventory({ city, status: "Available" });
  if (!propertyType) return units.length;

  const typeLower = propertyType.toLowerCase();
  return units.filter((u) => u.propertyType.toLowerCase().includes(typeLower)).length;
}

module.exports = {
  getLiveInventory,
  getAvailableUnitsCount,
};
