/* =========================================================
   DASHBOARD PAGE
   Summary cards, preset AI questions and quick highlights.
========================================================= */

VV.pages.dashboard = (function () {
  const { esc } = VV.utils;

  const EXAMPLE_QUESTIONS = [
    {
      category: "📍 Locations & Offices",
      text: "Where is the branch office in Ranchi located and what is its address?",
    },
    {
      category: "📍 Site Locations",
      text: "What is the site address and status of Vastu Vihar Ara (Phase-01)?",
    },
    {
      category: "🏡 Bungalow Blueprints",
      text: "What are the exact room dimensions and plot area of the Yamuna 5 BHK bungalow?",
    },
    {
      category: "🏢 Flat Layouts",
      text: "What are the carpet area, built-up area and room sizes of Ganga 2 BHK flat?",
    },
    {
      category: "🏗️ Building Standards",
      text: "What is the difference between Deluxe and Luxury specifications for flooring, CP fittings, and kitchen?",
    },
    {
      category: "🔩 Structural Engineering",
      text: "What are the official structural dimensions for Plinth, Slab, Column, Beam and Pile Cap?",
    },
    {
      category: "🏛️ Statutory GST",
      text: "What is the GST rate on an affordable residential property of 600 sq.ft. in Patna (Metro)?",
    },
    {
      category: "📜 Legal & Registry",
      text: "What is MVR and how is it used during property registration in Bihar?",
    },
    {
      category: "🏦 Home Loan Documents",
      text: "What documents are required from a salaried applicant to apply for a Home Loan?",
    },
    {
      category: "✨ Project Amenities",
      text: "List all 9 official township amenities provided across Vastu Vihar projects.",
    },
  ];

  const BLUEPRINT_ROWS = [
    ["Yamuna (5 BHK, G+1)", "1600 sqft Plot (40'×40') | 2200 sqft Built-up"],
    ["Business (4 BHK, G+1)", "1200 sqft Plot (30'×40') | 1950 sqft Built-up"],
    ["Ananta (4 BHK, G+1)", "1200 sqft Plot (30'×40') | 1850 sqft Built-up"],
    ["Jayanti (3 BHK, G+1)", "900 sqft Plot (30'×30') | 1250 sqft Built-up"],
  ];

  const STANDARD_ROWS = [
    ["Plinth & Column Sizes:", "0’8” × 0’10”", "mono"],
    ["Roof Slab Thickness:", "100 MM (4”)", "mono"],
    ["Approved Cement Brands:", "Dalmiya / JK SUPER", "primary"],
    ["Approved Rebar / Iron Rods:", "Rungta & Hindustan (12mm / 10mm / 8mm)", "primary"],
  ];

  function render(root, ctx) {
    const state = { stats: null, loading: true };

    function statCard(label, valueHtml, noteHtml, colorClass, target) {
      return `
        <div class="stat-card stat-card-clickable" data-action="goto" data-target="${target}">
          <div class="stat-card-label">${label}</div>
          <div class="stat-card-value ${colorClass}">${valueHtml}</div>
          <div class="stat-card-note">${noteHtml}</div>
        </div>`;
    }

    function template() {
      const s = state.stats || {};
      const val = (v, fallback) => (state.loading ? "..." : v || fallback);

      const questionButtons = EXAMPLE_QUESTIONS.map(
        (q, index) => `
          <button class="question-tile" data-action="ask" data-index="${index}">
            <span class="question-tile-category">${esc(q.category)}</span>
            <span class="question-tile-text">${esc(q.text)}</span>
          </button>`
      ).join("");

      const blueprintRows = BLUEPRINT_ROWS.map(
        ([name, detail]) => `
          <li class="info-row">
            <span><strong>${esc(name)}</strong></span>
            <span class="muted">${esc(detail)}</span>
          </li>`
      ).join("");

      const standardRows = STANDARD_ROWS.map(
        ([label, value, style]) => `
          <div class="info-row">
            <span>${esc(label)}</span>
            <span class="info-value info-value-${style}">${esc(value)}</span>
          </div>`
      ).join("");

      return `
        <div class="page-container dashboard-page">
          <div class="hero-banner">
            <div>
              <div class="hero-title-row">
                <span class="hero-emoji">🏢</span>
                <h1 class="hero-title">Vastu Vihar Information &amp; AI Assistant System</h1>
                <span class="hero-tag">100% SELF-CONTAINED</span>
              </div>
              <p class="hero-text">
                Official knowledge and intelligence portal powered by verified Vastu Vihar documentation.
                Provides instant access to 125 project sites, 41 branch offices, 7 bungalow models,
                3 flat configurations, structural engineering standards, and statutory GST calculations.
              </p>
            </div>
            <button class="btn btn-primary btn-lg" data-action="launch-ai">
              <span>🤖</span> Launch AI Assistant
            </button>
          </div>

          <div class="card-grid card-grid-stats">
            ${statCard(
              "Total Project Sites",
              val(s.totalProjects, 125),
              `<span class="text-green">● ${s.activeProjects || 81}</span> Running &nbsp;|&nbsp;
               <span class="text-blue">✓ ${s.completedProjects || 43}</span> Completed`,
              "text-primary",
              "projects"
            )}
            ${statCard(
              "States &amp; Branch Offices",
              `${val(s.totalStates, 5)} <span class="stat-card-unit">States</span>`,
              `<strong>${s.totalOffices || 41} Branch Offices</strong> across Bihar, JH, WB, UP, OD`,
              "text-green",
              "projects"
            )}
            ${statCard(
              "Bungalow Models",
              `${val(s.bungalowModels, 7)} <span class="stat-card-unit">Plans</span>`,
              "Yamuna, Business, Ananta, Jayanti, CEO, Godawari, Kaveri",
              "text-amber",
              "properties"
            )}
            ${statCard(
              "Flat Configurations",
              `${val(s.flatModels, 3)} <span class="stat-card-unit">Layouts</span>`,
              "Nano (1 BHK), Ganga (2 BHK), Adity (3 BHK)",
              "text-purple",
              "properties"
            )}
          </div>

          <section class="panel">
            <div class="panel-head">
              <div>
                <h3 class="panel-title">💬 Authoritative AI Knowledge Queries</h3>
                <p class="panel-subtitle">
                  Click any verified question to immediately retrieve authoritative answers from the Local AI Engine.
                </p>
              </div>
              <span class="muted-small">${EXAMPLE_QUESTIONS.length} Preset Queries</span>
            </div>
            <div class="question-grid">${questionButtons}</div>
          </section>

          <div class="card-grid card-grid-wide">
            <section class="panel">
              <div class="panel-head">
                <h4 class="panel-title-sm">🏡 Architectural Blueprints</h4>
                <button class="btn btn-secondary btn-sm" data-action="goto" data-target="properties">View All</button>
              </div>
              <ul class="info-list">${blueprintRows}</ul>
            </section>

            <section class="panel">
              <div class="panel-head">
                <h4 class="panel-title-sm">🏗️ Engineering &amp; Structural Standards</h4>
                <button class="btn btn-secondary btn-sm" data-action="goto" data-target="amenities">View Specs</button>
              </div>
              <div class="info-list">${standardRows}</div>
            </section>
          </div>
        </div>`;
    }

    const view = VV.utils.createView(root, {
      render: template,
      actions: {
        goto(target) {
          ctx.navigate(target.dataset.target);
        },
        "launch-ai"() {
          ctx.navigateToAi("What information and official services can you provide?");
        },
        ask(target) {
          ctx.navigateToAi(EXAMPLE_QUESTIONS[Number(target.dataset.index)].text);
        },
      },
    });

    view.update();

    VV.api
      .getDashboardStats()
      .then((data) => {
        state.stats = data;
      })
      .catch((error) => console.error("Error loading dashboard stats:", error))
      .finally(() => {
        state.loading = false;
        view.update();
      });
  }

  return { render };
})();
