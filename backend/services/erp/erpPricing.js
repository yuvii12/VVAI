const erpClient = require("./erpClient");
const store = require("../../lib/store");

async function getLivePrice(city, propertyType = null, bhk = null) {
  // Strict check: must use the specific city requested!
  const priceRecord = store.getPrice(city, propertyType, bhk);
  if (!priceRecord) return null;
  return priceRecord;
}

async function getLivePriceList(city) {
  return store.getPriceLists({ city });
}

module.exports = {
  getLivePrice,
  getLivePriceList,
};
