// Configurable GST Engine for Real Estate & Commercial Properties
const store = require("../../lib/store");

function calculatePropertyGst({ city, isMetro = false, propertyType = "residential", carpetAreaSqft, carpetAreaSqm, propertyValue, basePrice = null }) {
  let sqft = carpetAreaSqft ? parseFloat(carpetAreaSqft) : (carpetAreaSqm ? parseFloat(carpetAreaSqm) * 10.7639 : 0);
  const val = parseFloat(propertyValue) || parseFloat(basePrice) || 0;
  
  // Auto-detect metro from city if not explicitly provided
  let metro = Boolean(isMetro);
  if (isMetro === null || isMetro === undefined) {
    if (city && (city.toLowerCase().includes("patna") || city.toLowerCase().includes("kolkata"))) {
      metro = true;
    }
  }

  return store.calculateGst({
    propertyValue: val,
    carpetAreaSqft: Math.round(sqft),
    isMetro: metro,
    isCommercial: propertyType === "commercial"
  });
}

function getActiveRules() {
  return store.getGstRules();
}

function getMetroCities() {
  return [
    { cityName: "Patna", stateName: "Bihar" },
    { cityName: "Kolkata", stateName: "West Bengal" }
  ];
}

module.exports = {
  calculatePropertyGst,
  getActiveRules,
  getMetroCities
};
