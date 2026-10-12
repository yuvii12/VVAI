/* =========================================================
   PROJECTS & SITES PAGE
   Filterable directory of all project sites and branch offices.
========================================================= */

VV.pages.projects = (function () {
  const { esc } = VV.utils;

  const STATUS_FILTERS = [
    { value: "ALL", label: "All", tone: "primary", countKey: "total" },
    { value: "Running", label: "● Running", tone: "green", countKey: "running" },
    { value: "Completed", label: "✓ Completed", tone: "blue", countKey: "completed" },
    { value: "Not Active Yet", label: "⏳ Not Active Yet", tone: "amber", countKey: "notActive" },
  ];

  function statusBadge(status) {
    if (status === "Running") {
      return '<span class="status-badge status-green">● Running</span>';
    }
    if (status === "Completed") {
      return '<span class="status-badge status-blue">✓ Completed</span>';
    }
    return '<span class="status-badge status-amber">⏳ Not Active Yet</span>';
  }

  function projectName(p) {
    return p.projectName || p.name || `Vastu Vihar ${p.city}`;
  }

  /* The label/value lines shown for landmarks and distances. */
  function landmarkLines(p) {
    return [
      ["Nearby", p.nearbyLocation],
      ["Main Road", p.mainRoadDistance],
      ["Railway Station", p.railwayStationDistance],
      ["Famous Place", p.nearbyFamousPlace],
    ].filter(([, value]) => value);
  }

  function render(root, ctx) {
    const state = {
      projects: [],
      states: [],
      cities: [],
      selectedState: "",
      selectedCity: "",
      selectedStatus: "ALL",
      selectedPhase: "ALL",
      searchQuery: "",
      loading: true,
      modalProject: null,
    };

    /* ---------- Derived data ---------- */

    function phases() {
      const set = new Set();
      state.projects.forEach((p) => {
        if (p.phase) {
          set.add(p.phase);
        }
      });
      return Array.from(set).sort();
    }

    function counts() {
      const by = (status) => state.projects.filter((p) => p.status === status).length;
      return {
        total: state.projects.length,
        running: by("Running"),
        completed: by("Completed"),
        notActive: by("Not Active Yet"),
      };
    }

    function filteredProjects() {
      const q = state.searchQuery.trim().toLowerCase();
      return state.projects.filter((p) => {
        if (state.selectedState && p.state !== state.selectedState) return false;
        if (state.selectedCity && p.city !== state.selectedCity) return false;
        if (state.selectedStatus !== "ALL" && p.status !== state.selectedStatus) return false;
        if (state.selectedPhase !== "ALL" && p.phase !== state.selectedPhase) return false;
        if (!q) return true;

        const fields = [
          p.projectName || p.name,
          p.city,
          p.state,
          p.siteAddress,
          p.officeAddress,
          p.nearbyLocation || p.nearbyFamousPlace,
        ];
        return fields.some((field) => (field || "").toLowerCase().includes(q));
      });
    }

    function hasActiveFilters() {
      return Boolean(
        state.selectedState ||
          state.selectedCity ||
          state.selectedPhase !== "ALL" ||
          state.selectedStatus !== "ALL" ||
          state.searchQuery
      );
    }

    /* ---------- Templates ---------- */

    function selectHtml(name, selected, firstLabel, firstValue, options) {
      const optionsHtml = options
        .map((o) => `<option value="${esc(o)}" ${selected === o ? "selected" : ""}>${esc(o)}</option>`)
        .join("");
      return `
        <select class="filter-select" data-input="${name}">
          <option value="${firstValue}" ${selected === firstValue ? "selected" : ""}>${firstLabel}</option>
          ${optionsHtml}
        </select>`;
    }

    function statusPillsHtml() {
      const c = counts();
      return STATUS_FILTERS.map(
        (f) => `
          <button class="status-filter status-filter-${f.tone} ${state.selectedStatus === f.value ? "active" : ""}"
                  data-action="set-status" data-value="${esc(f.value)}">
            ${f.label}${f.value === "ALL" ? ":" : ":"} <strong>${c[f.countKey]}</strong>
          </button>`
      ).join("");
    }

    function projectCardHtml(p, index) {
      const lines = landmarkLines(p);
      return `
        <article class="project-card">
          <div class="project-card-head">
            <div>
              <h3 class="project-name">${esc(projectName(p))}</h3>
              <div class="project-tags">
                <span class="tag tag-primary">📍 ${esc(p.city)}, ${esc(p.state)}</span>
                ${p.phase ? `<span class="tag tag-muted">${esc(p.phase)}</span>` : ""}
              </div>
            </div>
            <div>${statusBadge(p.status)}</div>
          </div>

          <div class="project-card-body">
            <div>
              <div class="mini-label">Site Address</div>
              <div class="project-text">${esc(p.siteAddress || "Site address listed on request")}</div>
            </div>

            ${
              p.officeAddress
                ? `<div class="office-box">
                     <div class="mini-label mini-label-primary">🏢 Official Branch Office</div>
                     <div class="office-text">${esc(p.officeAddress)}</div>
                   </div>`
                : ""
            }

            ${
              lines.length
                ? `<div class="landmark-list">
                     ${lines.map(([label, value]) => `<div><strong>${label}:</strong> ${esc(value)}</div>`).join("")}
                   </div>`
                : ""
            }

            <div class="project-card-actions">
              <button class="btn btn-secondary btn-sm" data-action="view-details" data-index="${index}">
                View Details
              </button>
              <button class="btn btn-primary btn-sm" data-action="ask-ai" data-index="${index}">
                <span>🤖</span> Ask AI Assistant
              </button>
            </div>
          </div>
        </article>`;
    }

    function modalHtml() {
      const p = state.modalProject;
      if (!p) {
        return "";
      }
      const lines = landmarkLines(p);
      const body = `
        <div class="detail-stack">
          <div><strong>Official Status:</strong> ${statusBadge(p.status)}</div>

          <div class="detail-box">
            <div class="detail-box-title">📍 Site Location Address</div>
            <div class="muted">${esc(p.siteAddress || "Site location available upon contact with branch office.")}</div>
          </div>

          ${
            p.officeAddress
              ? `<div class="detail-box">
                   <div class="detail-box-title text-primary">🏢 Official Branch Office</div>
                   <div class="muted">${esc(p.officeAddress)}</div>
                 </div>`
              : ""
          }

          ${
            lines.length
              ? `<div class="detail-box">
                   <div class="detail-box-title">🗺️ Access &amp; Landmarks</div>
                   ${lines.map(([label, value]) => `<div>• <strong>${label}:</strong> ${esc(value)}</div>`).join("")}
                 </div>`
              : ""
          }

          <div class="source-note">
            Source: Official Vastu Vihar Location Document (August 2026 Update). Self-contained data.
          </div>
        </div>`;

      return VV.components.modal({
        title: `${esc(p.projectName || p.name)}
                <div class="modal-subtitle">${esc(p.city)}, ${esc(p.state)} — ${esc(p.phase || "Official Project")}</div>`,
        body,
        footer: `
          <button class="btn btn-primary btn-sm" data-action="ask-ai-modal">Ask AI About This Project</button>
          <button class="btn btn-secondary btn-sm" data-action="close-modal">Close</button>`,
      });
    }

    function resultsHtml(filtered) {
      if (state.loading) {
        return `<div class="loading-block"><div class="loading-icon">⏳</div>
                <p>Loading authoritative project directories...</p></div>`;
      }
      if (filtered.length === 0) {
        return `
          <div class="empty-block">
            <div class="empty-icon">🔍</div>
            <h3>No matching projects found</h3>
            <p>No project matches your active state, city, phase, or keyword filters.</p>
            <button class="btn btn-primary btn-sm" data-action="clear-filters">Clear All Filters</button>
          </div>`;
      }
      return `<div class="project-grid">${filtered.map((p) => projectCardHtml(p, state.projects.indexOf(p))).join("")}</div>`;
    }

    function template() {
      const filtered = filteredProjects();
      return `
        <div class="page-container page-wide">
          <div class="hero-banner hero-banner-compact">
            <div>
              <div class="hero-title-row">
                <span class="hero-emoji-sm">🏢</span>
                <h2 class="hero-title-sm">Official Vastu Vihar Projects Directory</h2>
                <span class="hero-tag hero-tag-sm">125 Project Sites Verified</span>
              </div>
              <p class="hero-text hero-text-sm">
                Authoritative directory extracted from official Location documentation across 5 states
                (Bihar, Jharkhand, West Bengal, Uttar Pradesh, Odisha) and 41 branch offices.
                Real-time filterable by status, state, city, and project phase.
              </p>
            </div>
            <div class="status-filter-row">${statusPillsHtml()}</div>
          </div>

          <div class="filter-bar">
            <div class="filter-search">
              <input type="text" class="form-input" data-input="search"
                     placeholder="🔍 Search name, city, site address, landmark..."
                     value="${esc(state.searchQuery)}">
            </div>
            ${selectHtml("state", state.selectedState, `All States (${state.states.length})`, "", state.states.map((s) => s.name))}
            
${selectHtml(
  "city",
  state.selectedCity,
  `All Cities (${state.cities.length})`,
  "",
  state.cities.map((c) =>
    typeof c === "string" ? c : c.name
  )
)}

            ${selectHtml("phase", state.selectedPhase, `All Phases (${phases().length})`, "ALL", phases())}
            <select class="filter-select" data-input="status">
              <option value="ALL" ${state.selectedStatus === "ALL" ? "selected" : ""}>All Statuses</option>
              <option value="Running" ${state.selectedStatus === "Running" ? "selected" : ""}>Running</option>
              <option value="Completed" ${state.selectedStatus === "Completed" ? "selected" : ""}>Completed</option>
              <option value="Not Active Yet" ${state.selectedStatus === "Not Active Yet" ? "selected" : ""}>Not Active Yet</option>
            </select>
            ${hasActiveFilters() ? '<button class="btn btn-secondary btn-sm" data-action="clear-filters">Reset Filters</button>' : ""}
            <div class="muted-small">Showing <strong>${filtered.length}</strong> of ${state.projects.length} projects</div>
          </div>

          ${resultsHtml(filtered)}
          ${modalHtml()}
        </div>`;
    }

    /* ---------- Data loading ---------- */

    function loadCities() {
      VV.api
        .getCities(state.selectedState || undefined)
        .then((res) => {
          state.cities = res.cities || [];
          view.update();
        })
        .catch(() => {});
    }

    function clearFilters() {
      state.selectedState = "";
      state.selectedCity = "";
      state.selectedStatus = "ALL";
      state.selectedPhase = "ALL";
      state.searchQuery = "";
      loadCities();
      view.update();
    }

    /* ---------- Events ---------- */

    const view = VV.utils.createView(root, {
      render: template,
      actions: {
        "set-status"(target) {
          state.selectedStatus = target.dataset.value;
          view.update();
        },
        "clear-filters": clearFilters,
        "view-details"(target) {
          state.modalProject = state.projects[Number(target.dataset.index)];
          view.update();
        },
        "close-modal"() {
          state.modalProject = null;
          view.update();
        },
        "ask-ai"(target) {
          const p = state.projects[Number(target.dataset.index)];
          ctx.navigateToAi(
            `Tell me full official details for ${projectName(p)} including office address in ${p.city} and site location.`
          );
        },
        "ask-ai-modal"() {
          const p = state.modalProject;
          const name = p.projectName || p.name;
          state.modalProject = null;
          ctx.navigateToAi(`What is the office address and site location of ${name} in ${p.city}?`);
        },
      },
      inputs: {
        search(value) {
          state.searchQuery = value;
          view.update();
        },
        state(value) {
          state.selectedState = value;
          state.selectedCity = "";
          loadCities();
          view.update();
        },
        city(value) {
          state.selectedCity = value;
          view.update();
        },
        phase(value) {
          state.selectedPhase = value;
          view.update();
        },
        status(value) {
          state.selectedStatus = value;
          view.update();
        },
      },
    });

    view.update();

    Promise.all([VV.api.getProjects(), VV.api.getStates(), VV.api.getCities()])
      .then(([projectRes, stateRes, cityRes]) => {
        state.projects = projectRes.projects || [];
        state.states = stateRes.states || [];
        state.cities = cityRes.cities || [];
      })
      .catch((error) => console.error("Error loading project data:", error))
      .finally(() => {
        state.loading = false;
        view.update();
      });
  }

  return { render };
})();
