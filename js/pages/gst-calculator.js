/* =========================================================
   GST CALCULATOR PAGE
   Statutory GST: 1% Affordable Housing vs 5% Standard.
   All calculation happens here in the browser (SQ FT primary).
========================================================= */

VV.pages.gstCalculator = (function () {
  const { esc, inr } = VV.utils;

  const SQFT_PER_SQM = 10.7639;
  const MAX_AFFORDABLE_VALUE = 4500000;

  const AREA_PRESETS = [
    { label: "325 sq.ft. (Nano)", sqft: 325 },
    { label: "450 sq.ft. (Ganga)", sqft: 450 },
    { label: "646 sq.ft. (Metro Cap)", sqft: 646 },
    { label: "670 sq.ft. (Adity)", sqft: 670 },
    { label: "940 sq.ft. (Jayanti)", sqft: 940 },
    { label: "969 sq.ft. (Non-Metro Cap)", sqft: 969 },
    { label: "1335 sq.ft. (Ananta)", sqft: 1335 },
    { label: "1680 sq.ft. (Yamuna)", sqft: 1680 },
  ];

  const VALUE_PRESETS = [
    { label: "₹25 Lakh", value: 2500000 },
    { label: "₹35 Lakh", value: 3500000 },
    { label: "₹40 Lakh", value: 4000000 },
    { label: "₹45 Lakh (Cap)", value: 4500000 },
    { label: "₹60 Lakh", value: 6000000 },
    { label: "₹85 Lakh", value: 8500000 },
  ];

  /* ---------- Calculation (pure function) ---------- */

  function calculate({ isMetro, carpetAreaSqft, propertyValue, propertyType }) {
    const areaSqft = Number(carpetAreaSqft) || 0;
    const areaSqm = Math.round((areaSqft / SQFT_PER_SQM) * 10) / 10;
    const value = Number(propertyValue) || 0;

    const maxAffordableSqft = isMetro ? 646 : 969;
    const maxAffordableSqm = isMetro ? 60 : 90;
    const zone = isMetro ? "Metro (Patna/Kolkata)" : "Non-Metro";
    const zoneShort = isMetro ? "Metro" : "Non-Metro";

    let gstRate = 5.0;
    let isAffordable = false;
    let explanation = "";

    if (propertyType === "commercial") {
      explanation =
        "Commercial properties within registered projects attract standard 5% GST without Input Tax Credit (ITC).";
    } else {
      const areaPass = areaSqft <= maxAffordableSqft;
      const valuePass = value <= MAX_AFFORDABLE_VALUE;

      if (areaPass && valuePass) {
        gstRate = 1.0;
        isAffordable = true;
        explanation =
          `Property qualifies for the Affordable Housing Scheme (1% GST without ITC). Both statutory conditions are satisfied:\n` +
          `1. Carpet Area (${areaSqft} sq.ft.) ≤ ${maxAffordableSqft} sq.ft. (≈ ${maxAffordableSqm} m²) for ${zone}.\n` +
          `2. Total Property Value (₹${inr(value)}) ≤ ₹45,00,000.`;
      } else if (!areaPass && !valuePass) {
        explanation =
          `Attracts standard 5% GST without ITC because BOTH carpet area exceeds the ${maxAffordableSqft} sq.ft. ` +
          `threshold for ${zoneShort} AND total property value exceeds ₹45,00,000.`;
      } else if (!areaPass) {
        explanation =
          `Attracts standard 5% GST without ITC because carpet area (${areaSqft} sq.ft.) exceeds the statutory ` +
          `limit of ${maxAffordableSqft} sq.ft. (≈ ${maxAffordableSqm} m²) for ${zoneShort} classification.`;
      } else {
        explanation =
          `Attracts standard 5% GST without ITC because total property value (₹${inr(value)}) exceeds ` +
          `the ₹45,00,000 limit for the Affordable Housing Scheme.`;
      }
    }

    const gstAmount = Math.round((value * gstRate) / 100);

    return {
      areaSqft,
      areaSqm,
      value,
      maxAffordableSqft,
      gstRate,
      isAffordable,
      explanation,
      gstAmount,
      totalAmount: value + gstAmount,
    };
  }

  /* ---------- Page ---------- */

  function render(root) {
    const state = {
      isMetro: true,
      carpetAreaSqft: 646,
      propertyValue: 4000000,
      propertyType: "residential",
    };

    /* Result card is redrawn on every keystroke; the form stays untouched. */
    function resultHtml() {
      const r = calculate(state);
      const zoneName = state.isMetro ? "Metro" : "Non-Metro";
      return `
        <div class="gst-result ${r.isAffordable ? "gst-result-affordable" : ""}">
          <div class="gst-result-head">
            <span class="field-label">Calculation Summary</span>
            <span class="gst-rate-pill ${r.isAffordable ? "gst-rate-affordable" : ""}">
              ${r.gstRate}% GST Applicable
            </span>
          </div>

          <div class="gst-amount-block">
            <div class="muted-small">Estimated GST Amount</div>
            <div class="gst-amount ${r.isAffordable ? "text-green-dark" : ""}">₹${inr(r.gstAmount)}</div>
            <div class="gst-total-line">
              Total Payable (Value + GST): <strong>₹${inr(r.totalAmount)}</strong>
            </div>
          </div>

          <div>
            <div class="checklist-title">Statutory Criteria Checklist (${zoneName}):</div>
            <div class="checklist">
              <div class="checklist-row">
                <span>${r.areaSqft <= r.maxAffordableSqft ? "✅" : "❌"}</span>
                <span>Carpet Area: <strong>${r.areaSqft} SQ FT</strong>
                  (Max limit: <strong>${r.maxAffordableSqft} SQ FT</strong>)</span>
              </div>
              <div class="checklist-row">
                <span>${r.value <= MAX_AFFORDABLE_VALUE ? "✅" : "❌"}</span>
                <span>Property Value: <strong>₹${inr(r.value)}</strong>
                  (Max limit: <strong>₹45,00,000</strong>)</span>
              </div>
            </div>
          </div>

          <div class="explanation-box"><strong>Official Rule Breakdown:</strong>\n${esc(r.explanation)}</div>

          <div class="muted-small">
            * Note: GST rates and applicability are governed by Ministry of Finance guidelines.
            Verify actual transactional tax with the authorized finance desk.
          </div>
        </div>`;
    }

    function presetPills(presets, action, currentValue, valueKey) {
      return presets
        .map(
          (p) => `
            <button type="button" class="pill ${currentValue === p[valueKey] ? "pill-active" : ""}"
                    data-action="${action}" data-value="${p[valueKey]}">
              ${esc(p.label)}
            </button>`
        )
        .join("");
    }

    function template() {
      const r = calculate(state);
      return `
        <div class="page-container">
          ${VV.utils.pageHeader(
            "Statutory Real Estate GST Calculator",
            "Calculate statutory GST strictly according to official Vastu Vihar tax rules (1% Affordable vs 5% Standard). Uses Square Feet (SQ FT) as primary area measurement."
          )}

          <div class="two-column">
            <div class="panel form-panel">
              <div>
                <label class="field-label block">1. Location Classification (Metro / Non-Metro)</label>
                <div class="toggle-grid">
                  <button type="button" class="toggle-card ${state.isMetro ? "toggle-active" : ""}"
                          data-action="set-metro" data-value="true">
                    <div class="toggle-card-title">🏙️ METRO</div>
                    <div class="toggle-card-sub">Patna &amp; Kolkata</div>
                    <div class="toggle-card-limit">Limit: 646 SQ FT (60 m²)</div>
                  </button>
                  <button type="button" class="toggle-card ${!state.isMetro ? "toggle-active" : ""}"
                          data-action="set-metro" data-value="false">
                    <div class="toggle-card-title">🏡 NON-METRO</div>
                    <div class="toggle-card-sub">Gaya, Ranchi, etc.</div>
                    <div class="toggle-card-limit">Limit: 969 SQ FT (90 m²)</div>
                  </button>
                </div>
              </div>

              <div>
                <div class="field-row">
                  <label class="field-label">2. Carpet Area (Primary Unit: SQ FT)</label>
                  <span class="muted-small" id="area-sqm">≈ ${r.areaSqm} m²</span>
                </div>
                <div class="input-with-unit">
                  <input class="form-input form-input-large" type="number" min="50" max="5000" step="1"
                         data-input="area" value="${state.carpetAreaSqft}">
                  <span class="unit-label">SQ FT</span>
                </div>
                <div class="pill-row" id="area-pills">
                  ${presetPills(AREA_PRESETS, "set-area", state.carpetAreaSqft, "sqft")}
                </div>
              </div>

              <div>
                <div class="field-row">
                  <label class="field-label">3. Property Valuation / Amount (₹)</label>
                  <span class="lakh-label" id="value-lakh">₹${(r.value / 100000).toFixed(2)} Lakhs</span>
                </div>
                <input class="form-input form-input-large" type="number" min="100000" max="50000000" step="50000"
                       data-input="value" value="${state.propertyValue}">
                <div class="pill-row" id="value-pills">
                  ${presetPills(VALUE_PRESETS, "set-value", state.propertyValue, "value")}
                </div>
              </div>

              <div>
                <label class="field-label block">4. Property Usage</label>
                <div class="radio-row">
                  <label class="radio-label">
                    <input type="radio" name="propType" data-input="type" value="residential"
                           ${state.propertyType === "residential" ? "checked" : ""}>
                    Residential (Flats &amp; Bungalows)
                  </label>
                  <label class="radio-label">
                    <input type="radio" name="propType" data-input="type" value="commercial"
                           ${state.propertyType === "commercial" ? "checked" : ""}>
                    Commercial (Shops / Hall)
                  </label>
                </div>
              </div>
            </div>

            <div id="gst-result-slot">${resultHtml()}</div>
          </div>
        </div>`;
    }

    /* While typing, only the derived parts are redrawn so the input keeps its caret. */
    function refreshDerived() {
      const r = calculate(state);
      root.querySelector("#gst-result-slot").innerHTML = resultHtml();
      root.querySelector("#area-sqm").textContent = `≈ ${r.areaSqm} m²`;
      root.querySelector("#value-lakh").textContent = `₹${(r.value / 100000).toFixed(2)} Lakhs`;
      root.querySelector("#area-pills").innerHTML = presetPills(AREA_PRESETS, "set-area", state.carpetAreaSqft, "sqft");
      root.querySelector("#value-pills").innerHTML = presetPills(VALUE_PRESETS, "set-value", state.propertyValue, "value");
    }

    const view = VV.utils.createView(root, {
      render: template,
      actions: {
        "set-metro"(target) {
          state.isMetro = target.dataset.value === "true";
          view.update();
        },
        "set-area"(target) {
          state.carpetAreaSqft = Number(target.dataset.value);
          view.update();
        },
        "set-value"(target) {
          state.propertyValue = Number(target.dataset.value);
          view.update();
        },
      },
      inputs: {
        area(value) {
          state.carpetAreaSqft = Math.max(0, Number(value));
          refreshDerived();
        },
        value(value) {
          state.propertyValue = Math.max(0, Number(value));
          refreshDerived();
        },
        type(value) {
          state.propertyType = value;
          refreshDerived();
        },
      },
    });

    view.update();
  }

  return { render };
})();
