/* =========================================================
   PROPERTIES & MODELS PAGE
   Bungalow models and flat configurations with room sizes.
========================================================= */

VV.pages.properties = (function () {
  const { esc } = VV.utils;

  function render(root, ctx) {
    const state = {
      bungalows: [],
      flats: [],
      activeTab: "bungalows",
      selectedItem: null,
      loading: true,
    };

    /* ---------- Cards ---------- */

    function areaBox(items) {
      return `
        <div class="area-grid">
          ${items
            .map(
              ([label, value, note, highlight]) => `
                <div>
                  <div class="area-label">${esc(label)}</div>
                  <div class="area-value ${highlight ? "text-primary" : ""}">${esc(value)}</div>
                  <div class="area-note">${esc(note)}</div>
                </div>`
            )
            .join("")}
        </div>`;
    }

    function bungalowCard(b, index) {
      const setbacks = b.setbacks
        ? `<div class="setback-row">
             <span><strong>Front:</strong> ${esc(b.setbacks.front)}</span>
             <span><strong>Back:</strong> ${esc(b.setbacks.back)}</span>
             <span><strong>Left:</strong> ${esc(b.setbacks.left)}</span>
             <span><strong>Right:</strong> ${esc(b.setbacks.right)}</span>
           </div>`
        : "";

      const highlights =
        b.highlights && b.highlights.length > 0
          ? `<div>
               <span class="mini-label">Key Architectural Features</span>
               <ul class="bullet-list">
                 ${b.highlights.slice(0, 3).map((h) => `<li>${esc(h)}</li>`).join("")}
               </ul>
             </div>`
          : "";

      const roomCount = (b.roomSpecifications && b.roomSpecifications.length) || 0;

      return `
        <article class="model-card">
          <div class="model-card-head">
            <div>
              <h3 class="model-name">${esc(b.modelName)}</h3>
              <div class="model-config">${esc(b.configuration)}</div>
            </div>
            <span class="model-pill model-pill-blue">${esc(b.bhk)} BHK</span>
          </div>
          ${areaBox([
            ["Plot Area", b.plotArea, b.plotSize],
            ["Built-up", b.builtUpArea, b.floors],
            ["Carpet Area", b.carpetArea, "Usable area", true],
          ])}
          ${setbacks}
          ${highlights}
          <div class="model-card-actions">
            <button class="btn btn-secondary btn-sm" data-action="open-bungalow" data-index="${index}">
              Full Specifications (${roomCount} Rooms)
            </button>
            <button class="btn btn-primary btn-sm" data-action="ask-bungalow" data-index="${index}">
              <span>🤖</span> Ask AI
            </button>
          </div>
        </article>`;
    }

    function flatCard(f, index) {
      const parking =
        f.parking && f.parking.length > 0
          ? `<div class="parking-box">
               <span class="mini-label block">🚗 Dedicated Parking Dimensions</span>
               <div class="parking-row">
                 ${f.parking
                   .map((p) => `<span><strong>${esc(p.vehicleType)}:</strong> ${esc(p.dimensions)} (${esc(p.areaSqft)} sqft)</span>`)
                   .join("")}
               </div>
             </div>`
          : "";

      const rooms = (f.roomSpecifications || [])
        .slice(0, 3)
        .map((r) => `<li><strong>${esc(r.space)}:</strong> ${esc(r.dimensions)}</li>`)
        .join("");
      const roomCount = (f.roomSpecifications && f.roomSpecifications.length) || 0;

      return `
        <article class="model-card">
          <div class="model-card-head">
            <div>
              <h3 class="model-name">${esc(f.fullName || f.modelName)}</h3>
              <div class="model-config">${esc(f.configuration)}</div>
            </div>
            <span class="model-pill model-pill-green">${esc(f.bhk)} BHK Flat</span>
          </div>
          ${areaBox([
            ["Super Built-Up", f.superBuiltUpArea, "Total chargeable"],
            ["Built-up Area", f.builtUpArea, "Plinth boundary"],
            ["Carpet Area", f.carpetArea, "Internal usable", true],
          ])}
          ${parking}
          <div>
            <span class="mini-label">Room Layout Preview</span>
            <ul class="bullet-list">${rooms}</ul>
          </div>
          <div class="model-card-actions">
            <button class="btn btn-secondary btn-sm" data-action="open-flat" data-index="${index}">
              Full Room Specs (${roomCount})
            </button>
            <button class="btn btn-primary btn-sm" data-action="ask-flat" data-index="${index}">
              <span>🤖</span> Ask AI
            </button>
          </div>
        </article>`;
    }

    /* ---------- Full specification modal ---------- */

    function modalHtml() {
      const item = state.selectedItem;
      if (!item) {
        return "";
      }
      const isBungalow = item.type === "bungalow";
      const rooms = item.roomSpecifications || [];

      const setbacks = item.setbacks
        ? `<div class="detail-box">
             <div class="detail-box-title">📐 Setbacks &amp; Plot Boundaries (Plot Size: ${esc(item.plotSize)})</div>
             <div class="grid-4">
               <div><strong>Front:</strong> ${esc(item.setbacks.front)}</div>
               <div><strong>Back:</strong> ${esc(item.setbacks.back)}</div>
               <div><strong>Left:</strong> ${esc(item.setbacks.left)}</div>
               <div><strong>Right:</strong> ${esc(item.setbacks.right)}</div>
             </div>
           </div>`
        : "";

      const parking =
        item.parking && item.parking.length > 0
          ? `<div class="detail-box">
               <div class="detail-box-title">🚗 Dedicated Parking Allocations</div>
               <div class="parking-row">
                 ${item.parking
                   .map((p) => `<div><strong>${esc(p.vehicleType)} Parking:</strong> ${esc(p.dimensions)} (${esc(p.areaSqft)} sqft)</div>`)
                   .join("")}
               </div>
             </div>`
          : "";

      const rows = rooms
        .map(
          (r) => `
            <tr>
              ${isBungalow ? `<td class="muted">${esc(r.floor || "Standard")}</td>` : ""}
              <td class="cell-strong">${esc(r.space)}</td>
              <td class="cell-mono">${esc(r.dimensions)}</td>
              <td class="muted">${esc(r.remarks || "—")}</td>
            </tr>`
        )
        .join("");

      const amenities = item.amenities
        ? `<div>
             <div class="section-label">Included Model Amenities</div>
             <div class="tag-wrap">
               ${item.amenities.map((a) => `<span class="check-tag">✓ ${esc(a)}</span>`).join("")}
             </div>
           </div>`
        : "";

      const body = `
        <div class="detail-stack">
          ${setbacks}
          ${parking}
          <div>
            <div class="section-label">Official Room Dimensions &amp; Spaces (${rooms.length} Total)</div>
            <div class="table-scroll">
              <table class="spec-table">
                <thead>
                  <tr>
                    ${isBungalow ? "<th>Floor</th>" : ""}
                    <th>Space / Room</th>
                    <th>Exact Dimensions</th>
                    <th>Remarks / Specification</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>
          ${amenities}
          <div class="source-note">
            Source: Official Vastu Vihar Architectural Specifications (PDF Source of Truth).
            Zero pricing displayed as per company policy.
          </div>
        </div>`;

      return VV.components.modal({
        wide: true,
        title: `${esc(item.fullName || item.modelName)} — Official Specifications
                <div class="modal-subtitle">
                  Configuration: ${esc(item.configuration)} | Carpet Area: ${esc(item.carpetArea)} |
                  Built-Up: ${esc(item.builtUpArea)}
                </div>`,
        body,
        footer: `
          <button class="btn btn-primary btn-sm" data-action="ask-ai-modal">Ask AI About This Model</button>
          <button class="btn btn-secondary btn-sm" data-action="close-modal">Close</button>`,
      });
    }

    /* ---------- Page ---------- */

    function template() {
      let content;
      if (state.loading) {
        content = `<div class="loading-block"><div class="loading-icon">⏳</div>
                   <p>Loading authoritative architectural models...</p></div>`;
      } else if (state.activeTab === "bungalows") {
        content = `<div class="model-grid">${state.bungalows.map(bungalowCard).join("")}</div>`;
      } else {
        content = `<div class="model-grid">${state.flats.map(flatCard).join("")}</div>`;
      }

      return `
        <div class="page-container page-wide">
          <div class="hero-banner hero-banner-compact">
            <div>
              <div class="hero-title-row">
                <span class="hero-emoji-sm">🏡</span>
                <h2 class="hero-title-sm">Official Architectural Plans &amp; Unit Specifications</h2>
                <span class="hero-tag hero-tag-sm">Authoritative Dimensions &amp; Blueprints</span>
              </div>
              <p class="hero-text hero-text-sm">
                Official architectural models extracted directly from Vastu Vihar Bungalow Details and Flat
                Information specifications. Features exact room dimensions, carpet area, built-up area,
                plot setbacks, and verified structural layouts.
              </p>
            </div>
            <div class="tab-buttons">
              <button class="btn btn-tab ${state.activeTab === "bungalows" ? "btn-primary" : "btn-secondary"}"
                      data-action="tab" data-tab="bungalows">
                🏡 Bungalow Models (${state.bungalows.length})
              </button>
              <button class="btn btn-tab ${state.activeTab === "flats" ? "btn-primary" : "btn-secondary"}"
                      data-action="tab" data-tab="flats">
                🏢 Flat Configurations (${state.flats.length})
              </button>
            </div>
          </div>
          ${content}
          ${modalHtml()}
        </div>`;
    }

    /* ---------- Events ---------- */

    const view = VV.utils.createView(root, {
      render: template,
      actions: {
        tab(target) {
          state.activeTab = target.dataset.tab;
          view.update();
        },
        "open-bungalow"(target) {
          state.selectedItem = { ...state.bungalows[Number(target.dataset.index)], type: "bungalow" };
          view.update();
        },
        "open-flat"(target) {
          state.selectedItem = { ...state.flats[Number(target.dataset.index)], type: "flat" };
          view.update();
        },
        "close-modal"() {
          state.selectedItem = null;
          view.update();
        },
        "ask-bungalow"(target) {
          const b = state.bungalows[Number(target.dataset.index)];
          ctx.navigateToAi(
            `What are the exact room dimensions, built-up area and carpet area of the ${b.modelName} bungalow?`
          );
        },
        "ask-flat"(target) {
          const f = state.flats[Number(target.dataset.index)];
          ctx.navigateToAi(
            `What are the room specifications, parking sizes and carpet area of the ${f.fullName || f.modelName} flat?`
          );
        },
        "ask-ai-modal"() {
          const item = state.selectedItem;
          const name = item.fullName || item.modelName;
          state.selectedItem = null;
          ctx.navigateToAi(`Provide full room dimensions, built-up area and carpet area breakdown for ${name}.`);
        },
      },
    });

    view.update();

    Promise.all([VV.api.getBungalows(), VV.api.getFlats()])
      .then(([bungalowRes, flatRes]) => {
        state.bungalows = bungalowRes.bungalows || [];
        state.flats = flatRes.flats || [];
      })
      .catch((error) => console.error("Error loading properties:", error))
      .finally(() => {
        state.loading = false;
        view.update();
      });
  }

  return { render };
})();
