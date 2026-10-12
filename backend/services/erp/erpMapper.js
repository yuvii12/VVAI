// Configurable ERP Field Mapping & Adapter Layer
// Translates arbitrary external ERP schemas into normalized internal models.

class ErpMapper {
  // Normalize external project payload
  mapProject(raw) {
    if (!raw) return null;
    const statusMap = {
      1: "Ongoing",
      2: "Completed",
      3: "Upcoming",
      "ACTIVE": "Ongoing",
      "COMPLETED": "Completed",
      "PLANNED": "Upcoming",
      "Ongoing": "Ongoing",
      "Completed": "Completed",
      "Upcoming": "Upcoming",
    };

    return {
      id: raw.id || `proj_${(raw.external_project_id || raw.project_code || "ext").toLowerCase()}`,
      externalProjectId: raw.external_project_id || raw.project_code || raw.id,
      name: raw.project_name || raw.name || "Vastu Vihar Project",
      city: raw.city_name || raw.city || "Patna",
      cityNormalized: (raw.city_name || raw.city || "Patna").toLowerCase().trim(),
      state: raw.state_name || raw.state || "Bihar",
      officeAddress: raw.office_address || raw.officeAddress || "",
      siteAddress: raw.site_address || raw.siteAddress || "",
      status: statusMap[raw.status_code || raw.status] || "Ongoing",
      totalUnits: parseInt(raw.total_units || raw.totalUnits || 0, 10),
      availableUnits: parseInt(raw.available_units || raw.availableUnits || 0, 10),
      bookedUnits: parseInt(raw.booked_units || raw.bookedUnits || 0, 10),
      soldUnits: parseInt(raw.sold_units || raw.soldUnits || 0, 10),
      phasesCount: parseInt(raw.phases_count || raw.phasesCount || 1, 10),
      reraNumber: raw.rera_number || raw.reraNumber || "Pending",
      reraStatus: raw.rera_status || raw.reraStatus || "Approved",
      lastSyncedAt: new Date().toISOString(),
    };
  }

  // Normalize external project phase payload
  mapPhase(raw) {
    if (!raw) return null;
    return {
      id: raw.id || `phase_${(raw.external_phase_id || raw.phase_code || "ext").toLowerCase()}`,
      externalPhaseId: raw.external_phase_id || raw.phase_code || raw.id,
      projectId: raw.project_id || raw.projectId,
      phaseName: raw.phase_name || raw.phaseName || raw.phase || "Phase 1",
      city: raw.city || "Patna",
      cityNormalized: (raw.city || "Patna").toLowerCase().trim(),
      siteAddress: raw.site_address || raw.siteAddress || "",
      status: raw.status || "Ongoing",
      totalUnits: parseInt(raw.total_units || raw.totalUnits || 0, 10),
      availableUnits: parseInt(raw.available_units || raw.availableUnits || 0, 10),
      bookedUnits: parseInt(raw.booked_units || raw.bookedUnits || 0, 10),
      reraNumber: raw.rera_number || raw.reraNumber || "BR-RERA-APP",
      lastSyncedAt: new Date().toISOString(),
    };
  }

  // Normalize external property unit payload (ERP is source of truth for status)
  mapUnit(raw) {
    if (!raw) return null;
    const statusMap = {
      "A": "Available",
      "0": "Available",
      "AVAILABLE": "Available",
      "Available": "Available",
      "B": "Booked",
      "1": "Booked",
      "BOOKED": "Booked",
      "Booked": "Booked",
      "S": "Sold",
      "2": "Sold",
      "SOLD": "Sold",
      "Sold": "Sold",
      "H": "Held",
      "HELD": "Held",
      "Held": "Held",
    };

    const status = statusMap[raw.status_flag || raw.status] || "Available";

    return {
      id: raw.id || `unit_${(raw.external_unit_id || raw.item_code || "ext").toLowerCase()}`,
      externalUnitId: raw.external_unit_id || raw.item_code || raw.id,
      unitNumber: raw.unit_number || raw.unitNumber || raw.item_code || "U-101",
      city: raw.city_name || raw.city || "Patna",
      projectName: raw.project_name || raw.projectName || "Vastu Vihar",
      phaseName: raw.phase_name || raw.phaseName || "PH-01",
      propertyType: raw.property_type || raw.propertyType || "Flat",
      bhk: parseInt(raw.bhk || raw.bhk_val || 2, 10),
      carpetArea: parseFloat(raw.carpet_area_sqft || raw.carpetArea || 0),
      builtUpArea: parseFloat(raw.built_up_sqft || raw.builtUpArea || 0),
      plotArea: parseFloat(raw.plot_area_sqft || raw.plotArea || 0),
      price: parseFloat(raw.price || raw.total_price || raw.base_price || 0),
      status,
      erpStatus: status,
      isAvailable: status === "Available",
      erpSyncedAt: new Date().toISOString(),
    };
  }

  // Normalize external price master
  mapPrice(raw) {
    if (!raw) return null;
    const base = parseFloat(raw.base_price || raw.basePrice || 0);
    const dev = parseFloat(raw.development_charge || raw.devCharge || raw.dev_charge || 0);
    const park = parseFloat(raw.parking_charge || raw.parkingCharge || 0);
    const gstRate = parseFloat(raw.gst_rate || raw.gstRate || 0.01);
    const total = Math.round((base + dev + park) * (1 + gstRate));

    return {
      id: raw.id || `price_${(raw.external_price_id || raw.cost_center || "ext").toLowerCase()}`,
      externalPriceId: raw.external_price_id || raw.cost_center || raw.id,
      city: raw.city || "Patna",
      propertyType: raw.property_type || raw.propertyType || "Flat",
      bhk: parseInt(raw.bhk || 2, 10),
      unitType: raw.unit_type || raw.unitType || "Standard Unit",
      basePrice: base,
      devCharge: dev,
      developmentCharge: dev,
      parkingCharge: park,
      gstRate,
      totalPrice: total,
      status: raw.status || "ACTIVE",
      effectiveFrom: raw.effective_from || new Date("2026-01-01").toISOString(),
      lastSyncedAt: new Date().toISOString(),
    };
  }

  // Normalize external customer record
  mapCustomer(raw) {
    if (!raw) return null;
    return {
      id: raw.id || `cust_${(raw.external_customer_id || raw.ledger_code || "ext").toLowerCase()}`,
      externalCustomerId: raw.external_customer_id || raw.ledger_code || raw.id,
      name: raw.customer_name || raw.name || "Customer",
      phone: raw.mobile_number || raw.phone || "",
      email: raw.email_address || raw.email || "",
      city: raw.city || "Patna",
      kycStatus: raw.kyc_status || "Verified",
      outstandingBalance: parseFloat(raw.outstanding_balance || 0),
      lastSyncedAt: new Date().toISOString(),
    };
  }
}

module.exports = new ErpMapper();
