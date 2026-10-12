// CRM Field Mapping & Normalization Adapter
// Normalizes third-party CRM payloads (HubSpot, Salesforce, Zoho, Custom webhook)

class CrmMapper {
  mapLead(raw) {
    if (!raw) return null;
    const stageMap = {
      "new": "New",
      "contacted": "Contacted",
      "inquiry": "New",
      "site_visit": "Site Visit",
      "negotiation": "Negotiation",
      "hot": "Hot",
      "booked": "Booked",
      "won": "Booked",
      "lost": "Lost",
    };

    const stageRaw = (raw.lead_status || raw.stage || "New").toLowerCase();

    return {
      id: raw.id || `lead_${(raw.external_lead_id || raw.lead_id || "ext").toLowerCase()}`,
      externalLeadId: raw.external_lead_id || raw.lead_id || raw.id,
      name: raw.lead_name || raw.customer_name || raw.name || "Prospective Buyer",
      phone: raw.phone_number || raw.mobile || raw.phone || "",
      email: raw.email_address || raw.email || "",
      preferredCity: raw.preferred_city || raw.city || "Patna",
      preferredProject: raw.preferred_project || raw.project || "Vastu Vihar",
      propertyType: raw.property_type || raw.propertyType || "2 BHK Flat",
      bhk: parseInt(raw.bhk || raw.bhk_val || 2, 10),
      budget: parseFloat(raw.budget || raw.budget_inr || 2500000),
      stage: stageMap[stageRaw] || "New",
      assignedTo: raw.assigned_sales_rep || raw.assignedTo || "Sweta Kumari",
      assignedToId: raw.assigned_to_id || raw.assignedToId || "usr_sales_patna",
      source: raw.lead_source || raw.source || "Website Form",
      followupDate: raw.followup_date || raw.followupDate || new Date().toISOString().slice(0, 10),
      notes: raw.notes || raw.remarks || "Expressed interest in upcoming phase.",
      createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  mapCustomer(raw) {
    if (!raw) return null;
    return {
      id: raw.id || `cust_${(raw.external_customer_id || raw.customer_id || "ext").toLowerCase()}`,
      externalCustomerId: raw.external_customer_id || raw.customer_id || raw.id,
      name: raw.customer_name || raw.name || "Customer",
      phone: raw.mobile || raw.phone || "",
      email: raw.email || "",
      city: raw.city || "Patna",
      kycStatus: raw.kyc_status || "Verified",
      assignedEmployeeId: raw.assigned_employee || raw.assignedEmployeeId || "EMP-000001",
      createdAt: raw.created_at || new Date().toISOString(),
    };
  }
}

module.exports = new CrmMapper();
