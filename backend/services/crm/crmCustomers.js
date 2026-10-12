// CRM Customers Service with RBAC enforcement
const store = require("../../lib/store");

function getCustomers(user, query = null) {
  return store.getCustomers(user, query);
}

function getCustomerById(id, user) {
  return store.getCustomerById(id, user);
}

function createCustomer(data, user) {
  return store.createCustomer(data, user);
}

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
};
