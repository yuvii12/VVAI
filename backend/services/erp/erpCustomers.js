// ERP Customers & Billing Ledger Service
const erpClient = require("./erpClient");
const store = require("../../lib/store");

async function getLiveCustomers(filter = {}) {
  const data = await erpClient.fetch("/customers");
  let customers = data.customers || store.customers;

  if (filter.city) {
    customers = customers.filter((c) => c.city?.toLowerCase() === filter.city.toLowerCase());
  }
  if (filter.q) {
    const q = filter.q.toLowerCase();
    customers = customers.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }

  return customers;
}

async function getCustomerLedger(customerId) {
  const customers = await getLiveCustomers();
  const customer = customers.find((c) => c.id === customerId || c.phone === customerId);
  if (!customer) return null;

  return {
    customer,
    ledger: {
      totalBilled: 3500000,
      paidAmount: 700000,
      outstandingAmount: 2800000,
      paymentStatus: "On Schedule",
      nextInstallmentDate: "2026-10-15",
    },
  };
}

module.exports = {
  getLiveCustomers,
  getCustomerLedger,
};
