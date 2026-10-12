/* =========================================================
   BUILDING SPECIFICATIONS PAGE
   Deluxe vs Luxury matrix, structural data, materials / rebar
   schedule and the 9 township amenities.
========================================================= */

VV.pages.amenities = (function () {
  const { esc } = VV.utils;

  const SECTIONS = [
    { key: "deluxe-luxury", label: (count) => `Deluxe vs Luxury (${count})` },
    { key: "structural", label: () => "Structural Training Data" },
    { key: "materials", label: () => "Materials & Rebar" },
    { key: "amenities", label: () => "9 Project Amenities" },
  ];

  const AMENITY_ICONS = {
    1: "🛕",
    2: "🏊",
    3: "🌳",
    4: "🏋️",
    5: "🧱",
    6: "🛣️",
    7: "👮",
    8: "🚰",
    9: "⚡",
  };

  const AI_QUESTIONS = {
    "deluxe-luxury":
      "Explain the key differences between Deluxe and Luxury building specifications in Vastu Vihar for Flooring, CP fittings, and Door frames.",
    structural:
      "What are the official structural training dimensions for Plinth, Slab, Column, Beam and Pile Cap in Vastu Vihar?",
    amenities: "List all 9 official township amenities provided by Vastu Vihar projects.",
  };

  const AI_BUTTON_LABELS = {
    "deluxe-luxury": "🤖 Ask AI Assistant to compare Deluxe vs Luxury",
    structural: "🤖 Ask AI Assistant about structural standards",
    amenities: "🤖 Ask AI Assistant about project amenities",
  };

  function render(root, ctx) {
    const state = {
      data: {
        specifications: [],
        structuralData: [],
        ironRodDetails: [],
        materials: [],
        projectAmenities: [],
      },
      activeSection: "deluxe-luxury",
      search: "",
      filterCategory: "ALL",
      loading: true,
    };

    /* ---------- Section templates ---------- */

    function askAiButton(section) {
      return `
        <div class="align-right">
          <button class="btn btn-secondary btn-sm" data-action="ask-ai" data-section="${section}">
            ${AI_BUTTON_LABELS[section]}
          </button>
        </div>`;
    }

    function deluxeLuxuryHtml() {
      const specs = state.data.specifications || [];
      const categories = ["ALL", ...new Set(specs.map((s) => s.category).filter(Boolean))];
      const q = state.search.toLowerCase();

      const filtered = specs.filter((s) => {
        const matchCategory = state.filterCategory === "ALL" || s.category === state.filterCategory;
        const matchSearch =
          !q ||
          (s.particular || "").toLowerCase().includes(q) ||
          (s.deluxe || "").toLowerCase().includes(q) ||
          (s.luxury || "").toLowerCase().includes(q);
        return matchCategory && matchSearch;
      });

      const categoryButtons = categories
        .map(
          (cat) => `
            <button class="category-chip ${state.filterCategory === cat ? "category-chip-active" : ""}"
                    data-action="set-category" data-category="${esc(cat)}">
              ${esc(cat)}
            </button>`
        )
        .join("");

      const rows =
        filtered.length === 0
          ? `<tr><td colspan="3" class="table-empty">No matching building specifications found.</td></tr>`
          : filtered
              .map(
                (s, index) => `
                  <tr class="${index % 2 === 0 ? "" : "row-alt"}">
                    <td>
                      <div class="cell-strong">${esc(s.particular)}</div>
                      ${s.category ? `<span class="muted-small">${esc(s.category)}</span>` : ""}
                    </td>
                    <td>${esc(s.deluxe)}</td>
                    <td><span class="luxury-text">${esc(s.luxury)}</span></td>
                  </tr>`
              )
              .join("");

      return `
        <div class="stack">
          <div class="filter-bar filter-bar-compact">
            <input type="text" class="form-input filter-grow" data-input="search"
                   placeholder="🔍 Search specifications (e.g., Flooring, CP Fitting, AC Point, Door)..."
                   value="${esc(state.search)}">
            <div class="chip-wrap">${categoryButtons}</div>
          </div>

          <div class="table-card">
            <table class="spec-table spec-table-large">
              <thead>
                <tr>
                  <th class="col-25">Particular / Item</th>
                  <th class="col-37 text-primary">🔵 Deluxe Specification</th>
                  <th class="col-38 text-green">🟢 Luxury Specification</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          ${askAiButton("deluxe-luxury")}
        </div>`;
    }

    function structuralHtml() {
      const cards = (state.data.structuralData || [])
        .map(
          (st) => `
            <div class="tile">
              <div class="tile-kicker">#${esc(st.sl)} • ${esc(st.type)}</div>
              <div class="tile-title">${esc(st.item)}</div>
              <div class="value-chip">${esc(st.value)}</div>
            </div>`
        )
        .join("");

      return `
        <div class="stack">
          <section class="panel">
            <div class="panel-intro">
              <h3 class="panel-title">Official Civil &amp; Structural Training Dimensions</h3>
              <p class="panel-subtitle">Authoritative engineering dimensions from technical construction training data.</p>
            </div>
            <div class="tile-grid">${cards}</div>
          </section>
          ${askAiButton("structural")}
        </div>`;
    }

    function materialsHtml() {
      const materials = (state.data.materials || [])
        .map(
          (m) => `
            <div class="tile tile-row">
              <span class="cell-strong">${esc(m.material)}</span>
              <span class="detail-pill">${esc(m.detail)}</span>
            </div>`
        )
        .join("");

      const rods = (state.data.ironRodDetails || [])
        .map(
          (r) => `
            <tr>
              <td class="cell-strong">${esc(r.work)}</td>
              <td class="cell-primary">${esc(r.rodSize)}</td>
              <td class="muted">${esc(r.quantity)}</td>
            </tr>`
        )
        .join("");

      return `
        <div class="card-grid card-grid-wide">
          <section class="panel">
            <h3 class="panel-title">🧱 Approved Construction Materials</h3>
            <div class="stack stack-tight">${materials}</div>
          </section>
          <section class="panel">
            <h3 class="panel-title">🔩 Iron Rod / Rebar Schedule</h3>
            <table class="spec-table">
              <thead>
                <tr><th>Structural Work</th><th>Rod Size</th><th>Quantity</th></tr>
              </thead>
              <tbody>${rods}</tbody>
            </table>
            <div class="source-note">
              Standard brands: Rungta and Hindustan. Footing uses 10mm, Chhat / Roof Slab uses 8mm rods.
            </div>
          </section>
        </div>`;
    }

    function amenitiesHtml() {
      const cards = (state.data.projectAmenities || [])
        .map(
          (am) => `
            <div class="tile tile-amenity">
              <span class="amenity-icon">${AMENITY_ICONS[am.sl] || "✨"}</span>
              <div>
                <div class="tile-kicker">Feature #${esc(am.sl)}</div>
                <div class="tile-title-sm">${esc(am.amenityEnglish)}</div>
                <div class="muted">${esc(am.amenityHindi)}</div>
              </div>
            </div>`
        )
        .join("");

      return `
        <div class="stack">
          <section class="panel">
            <div class="panel-intro">
              <h3 class="panel-title">Official Township Amenities (9 Standard Features)</h3>
              <p class="panel-subtitle">Standard infrastructure and lifestyle amenities provided across Vastu Vihar projects.</p>
            </div>
            <div class="tile-grid">${cards}</div>
          </section>
          ${askAiButton("amenities")}
        </div>`;
    }

    /* ---------- Page ---------- */

    function template() {
      const specsCount = (state.data.specifications || []).length;
      const tabs = SECTIONS.map(
        (s) => `
          <button class="btn btn-tab-sm ${state.activeSection === s.key ? "btn-primary" : "btn-secondary"}"
                  data-action="set-section" data-section="${s.key}">
            ${esc(s.label(specsCount))}
          </button>`
      ).join("");

      let content = "";
      if (state.loading) {
        content = `<div class="loading-block"><div class="loading-icon">⏳</div>
                   <p>Loading authoritative specifications and structural dimensions...</p></div>`;
      } else if (state.activeSection === "deluxe-luxury") {
        content = deluxeLuxuryHtml();
      } else if (state.activeSection === "structural") {
        content = structuralHtml();
      } else if (state.activeSection === "materials") {
        content = materialsHtml();
      } else {
        content = amenitiesHtml();
      }

      return `
        <div class="page-container page-wide">
          <div class="hero-banner hero-banner-compact">
            <div>
              <div class="hero-title-row">
                <span class="hero-emoji-sm">🏗️</span>
                <h2 class="hero-title-sm">Official Building Specifications &amp; Engineering Standards</h2>
                <span class="hero-tag hero-tag-sm">Authoritative Construction Truth</span>
              </div>
              <p class="hero-text hero-text-sm">
                Extracted from official Vastu Vihar Building Specification documentation and technical structural
                training data. Includes 20-point Deluxe vs Luxury matrix, structural dimensions, approved materials,
                rebar schedules, and 9 township amenities.
              </p>
            </div>
            <div class="tab-buttons tab-buttons-wrap">${tabs}</div>
          </div>
          ${content}
        </div>`;
    }

    /* ---------- Events ---------- */

    const view = VV.utils.createView(root, {
      render: template,
      actions: {
        "set-section"(target) {
          state.activeSection = target.dataset.section;
          view.update();
        },
        "set-category"(target) {
          state.filterCategory = target.dataset.category;
          view.update();
        },
        "ask-ai"(target) {
          ctx.navigateToAi(AI_QUESTIONS[target.dataset.section]);
        },
      },
      inputs: {
        search(value) {
          state.search = value;
          view.update();
        },
      },
    });

    view.update();

    VV.api
      .getBuildingSpecifications()
      .then((res) => {
        if (res.buildingSpecifications) {
          state.data = res.buildingSpecifications;
        }
      })
      .catch((error) => console.error("Error loading building specifications:", error))
      .finally(() => {
        state.loading = false;
        view.update();
      });
  }

  return { render };
})();
