/* =========================================================
   DOCUMENTS & HOME LOAN PAGE
   Registry of official source documents (with summaries)
   and the Home Loan document checklists.
========================================================= */

VV.pages.documents = (function () {
  const { esc } = VV.utils;

  /* Human-written summaries for each known source file. */
  const DOCUMENT_SUMMARIES = {
    "BUILDING SPECIFICATION.pdf": {
      title: "Building Specification — Deluxe vs Luxury (PDF)",
      category: "Engineering & Technical Standards",
      summary:
        "Official technical comparison between Deluxe and Luxury building specifications across 20 distinct " +
        "architectural items. Contains structural standards (R.C.C. frame, 5\" brick work), floor finishes, " +
        "kitchen slabs, sanitary CP fittings (Hindware vs Standard), door shutter laminates, UPVC windows, " +
        "and 9 township amenities.",
      keyPoints: [
        "Deluxe: 24\"×24\" Vitrified tiles; Luxury: 24\"×48\" Vitrified tiles",
        "Plinth (0'8\"×0'10\"), Slab (100mm / 4\"), Beam (0'8\"×0'12\"), Column (0'8\"×0'10\"), Pile Cap (3'0\"×3'0\")",
        "Rebar schedule: Column & Beam 12mm (4 PC), Footing 10mm, Chhat/Roof Slab 8mm",
        "Approved Brands: Cement (Dalmiya / JK SUPER), Rods (Rungta & Hindustan), Bricks (Red Bricks)",
        "Township amenities: Temple, Swimming Pool, Garden, Open Gym, Boundary Wall, 20ft Road, 24x7 Security, Water, Dedicated Transformer",
      ],
    },
    "Location.pdf": {
      title: "Office & Site Address Directory (PDF / August 2026 Update)",
      category: "Geography & Office Directory",
      summary:
        "Authoritative record of 204 location lines normalized into 125 project sites and 41 branch offices " +
        "across 5 Eastern Indian states (Bihar, Jharkhand, West Bengal, Uttar Pradesh, Odisha). Features " +
        "accurate project site addresses, branch office contact points, project phases, and operational statuses.",
      keyPoints: [
        "125 Project sites categorized as Running, Completed, or Not Active Yet",
        "41 Branch offices with verified street addresses across 5 states",
        "Distances to major railway stations, national/state highways, and landmarks",
        "Coverage: Bihar (Patna, Gaya, Muzaffarpur, Bhagalpur, Ara, etc.), Jharkhand (Ranchi, Jamshedpur, Dhanbad), West Bengal (Kolkata, Siliguri, Asansol), UP (Gorakhpur, Varanasi), Odisha (Bhubaneswar, Rourkela)",
      ],
    },
    "Bungalow details.pdf": {
      title: "Bungalow Details & Blueprint Specifications (PDF)",
      category: "Architectural Plans",
      summary:
        "Complete architectural layout blueprints and dimension specifications for all 7 official Vastu Vihar " +
        "bungalow models: Yamuna (5 BHK), Business (4 BHK), Ananta (4 BHK), Jayanti (3 BHK), CEO (3 BHK), " +
        "Godawari (2 BHK), and Kaveri (2 BHK).",
      keyPoints: [
        "Exact room-by-room dimensions for Ground Floor and First Floor",
        "Plot sizes and boundaries (e.g. Yamuna 40'×40' = 1600 sqft, Kaveri 25'×30' = 750 sqft)",
        "Setbacks matrix (Front, Back, Left, Right distances)",
        "Built-up and carpet area measurements without any pricing",
        "Private parking dimensions and rooftop specifications",
      ],
    },
    "Flat Information.pdf": {
      title: "Flat & Apartment Configuration Directory (PDF)",
      category: "Apartment Architecture",
      summary:
        "Official floor plans and space specifications for multi-story residential flat models: Nano 1 BHK " +
        "(325 sqft carpet), Ganga 2 BHK (450 sqft carpet), and Adity 3 BHK (750 sqft carpet).",
      keyPoints: [
        "Nano 1 BHK: 500 sqft super built-up, 350 sqft built-up, 325 sqft carpet",
        "Ganga 2 BHK: 700 sqft super built-up, 510 sqft built-up, 450 sqft carpet",
        "Adity 3 BHK: 1100 sqft super built-up, 860 sqft built-up, 750 sqft carpet",
        "Dedicated parking sizes: Bike (5'0\" × 8'0\", 40 sqft) and Car (8'6\" × 14'6\", 126 sqft)",
        "Zero pricing displayed; focuses entirely on dimensions and layout",
      ],
    },
    "ZONE LIST.pdf": {
      title: "Zone & Regional Branch Directory (PDF)",
      category: "Corporate Regional Structure",
      summary:
        "Regional zone breakdown dividing Eastern India into administrative operating clusters for customer " +
        "service, technical civil engineering supervision, and branch office operations.",
      keyPoints: [
        "Zone classifications for Bihar, Jharkhand, West Bengal, UP, and Odisha",
        "Branch office alignments and zonal reporting hierarchies",
        "Customer service and site visit coordination protocols",
      ],
    },
  };

  /* Home loan checklists: [icon, heading, [[bold, text], ...]] */
  const LOAN_CHECKLISTS = [
    [
      "💼",
      "Salaried Applicants Checklist",
      [
        ["PAN Card:", "Self-attested copy (mandatory)"],
        ["Aadhaar Card:", "Proof of identity and current address"],
        ["Salary Slips:", "Last 3 to 6 months certified payslips"],
        ["Form 16:", "Last 2 financial years with Part A & Part B"],
        ["Bank Account Statement:", "Last 6 months salary credit account statement"],
        ["Photographs:", "3 recent passport-size color photographs"],
        ["Employment Proof:", "Official employee ID card and appointment letter"],
      ],
    ],
    [
      "🏢",
      "Self-Employed / Business Applicants",
      [
        ["PAN Card:", "Individual and Entity PAN cards"],
        ["Aadhaar Card:", "Identity and residence proof"],
        ["ITR (Income Tax Returns):", "Last 2 to 3 Assessment Years with full computation"],
        ["Audited Financials:", "Balance Sheet & Profit & Loss statement certified by CA"],
        ["Bank Statements:", "Last 12 months primary operative current account statement"],
        ["Business Existence Proof:", "GST registration, Trade License, or Shop Act license"],
        ["Photographs:", "3 recent passport-size color photographs"],
      ],
    ],
    [
      "🏡",
      "Vastu Vihar Property Documents",
      [
        ["Allotment Letter:", "Official Vastu Vihar allotment letter for unit"],
        ["Agreement to Sale (ATS):", "Registered or executed builder-buyer agreement"],
        ["Payment Receipts:", "Margin money and booking installment receipts paid to company"],
        ["Approved Blueprint:", "Architectural plan layout with sanction approval"],
        ["NOC from Builder:", "Official No Objection Certificate for bank mortgage"],
        ["RERA Registration:", "Project RERA registration certificate"],
      ],
    ],
  ];

  function render(root, ctx) {
    const state = {
      documents: [],
      loading: true,
      selectedDoc: null,
      activeTab: "sources",
    };

    /* ---------- Source documents tab ---------- */

    function sourcesHtml() {
      let rows;
      if (state.loading) {
        rows = `<tr><td colspan="5" class="table-empty">Loading verified document registry...</td></tr>`;
      } else {
        rows = state.documents
          .map(
            (doc, index) => `
              <tr>
                <td>
                  <div class="cell-strong">${esc(doc.title)}</div>
                  <div class="muted-small">Uploaded / Verified on ${esc(doc.uploadedAt || "2026-09-11")}</div>
                </td>
                <td class="cell-mono cell-primary">${esc(doc.fileName)}</td>
                <td><span class="tag tag-primary">${esc(doc.category || "General")}</span></td>
                <td><span class="tag tag-green">PDF Document</span></td>
                <td class="align-right">
                  <button class="btn btn-secondary btn-sm" data-action="view-summary" data-index="${index}">
                    📄 View Summary
                  </button>
                </td>
              </tr>`
          )
          .join("");
      }

      return `
        <div class="table-card">
          <table class="spec-table spec-table-large">
            <thead>
              <tr>
                <th>Document Title</th>
                <th>Source File Name</th>
                <th>Category</th>
                <th>Format</th>
                <th class="align-right">Action</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }

    /* ---------- Home loan tab ---------- */

    function loanHtml() {
      const cards = LOAN_CHECKLISTS.map(
        ([icon, heading, items]) => `
          <section class="panel">
            <div class="panel-title-row">
              <span class="icon-lg">${icon}</span>
              <h3 class="panel-title-sm">${esc(heading)}</h3>
            </div>
            <ul class="bullet-list bullet-list-spaced">
              ${items.map(([label, text]) => `<li><strong>${esc(label)}</strong> ${esc(text)}</li>`).join("")}
            </ul>
          </section>`
      ).join("");

      return `
        <div class="stack">
          <div class="note-box">
            <strong>📌 Statutory Bank Requirement:</strong> For all nationalized and private bank home loans
            (SBI, HDFC, ICICI, PNB, etc.) on Vastu Vihar residential units, the following documentation is
            required for loan eligibility assessment and sanction.
          </div>
          <div class="card-grid card-grid-wide">${cards}</div>
          <div class="align-right">
            <button class="btn btn-primary btn-md" data-action="ask-loan">
              🤖 Ask AI Assistant about Home Loan Documents
            </button>
          </div>
        </div>`;
    }

    /* ---------- Summary modal ---------- */

    function modalHtml() {
      const doc = state.selectedDoc;
      if (!doc) {
        return "";
      }

      const summary = DOCUMENT_SUMMARIES[doc.fileName] || {
        title: doc.title,
        category: doc.category,
        summary: "Official technical record part of the self-contained Vastu Vihar information repository.",
        keyPoints: [
          `File name: ${doc.fileName}`,
          `File format: ${(doc.fileType || "").toUpperCase()}`,
          `Category: ${doc.category}`,
          "Fully chunked and integrated into local deterministic AI knowledge base.",
        ],
      };

      const body = `
        <div class="detail-stack">
          <div>
            <span class="tag tag-primary tag-block">${esc(summary.category)}</span>
            <p>${esc(summary.summary)}</p>
          </div>
          <div class="detail-box">
            <div class="detail-box-title">Key Facts &amp; Architectural Extraction:</div>
            <ul class="bullet-list">
              ${summary.keyPoints.map((point) => `<li>${esc(point)}</li>`).join("")}
            </ul>
          </div>
          <div class="source-note">
            Status: Source document verified and synchronized with Local AI Engine. Zero pricing displayed.
          </div>
        </div>`;

      return VV.components.modal({
        title: esc(doc.title || doc.fileName),
        body,
        footer: `
          <button class="btn btn-primary btn-sm" data-action="ask-doc">Ask AI About This Document</button>
          <button class="btn btn-secondary btn-sm" data-action="close-modal">Close</button>`,
      });
    }

    /* ---------- Page ---------- */

    function template() {
      return `
        <div class="page-container page-wide">
          <div class="hero-banner hero-banner-compact">
            <div>
              <div class="hero-title-row">
                <span class="hero-emoji-sm">📑</span>
                <h2 class="hero-title-sm">Official Documents &amp; Home Loan Checklists</h2>
                <span class="hero-tag hero-tag-sm">Authoritative Reference Files</span>
              </div>
              <p class="hero-text hero-text-sm">
                Repository of official technical source files (Building Specifications, Location Directory,
                Bungalow Blueprints, Flat Details) and statutory Home Loan documentation requirements for
                bank disbursement.
              </p>
            </div>
            <div class="tab-buttons">
              <button class="btn btn-tab-sm ${state.activeTab === "sources" ? "btn-primary" : "btn-secondary"}"
                      data-action="tab" data-tab="sources">
                📁 Source Documents (${state.documents.length})
              </button>
              <button class="btn btn-tab-sm ${state.activeTab === "loan" ? "btn-primary" : "btn-secondary"}"
                      data-action="tab" data-tab="loan">
                🏦 Home Loan Requirements
              </button>
            </div>
          </div>
          ${state.activeTab === "sources" ? sourcesHtml() : loanHtml()}
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
        "view-summary"(target) {
          state.selectedDoc = state.documents[Number(target.dataset.index)];
          view.update();
        },
        "close-modal"() {
          state.selectedDoc = null;
          view.update();
        },
        "ask-loan"() {
          ctx.navigateToAi("What documents are required to apply for a Home Loan for a Vastu Vihar property?");
        },
        "ask-doc"() {
          const title = state.selectedDoc.title;
          state.selectedDoc = null;
          ctx.navigateToAi(`Summarize key specifications and official details from ${title}.`);
        },
      },
    });

    view.update();

    VV.api
      .getDocuments()
      .then((res) => {
        state.documents = res.documents || [];
      })
      .catch((error) => console.error("Error loading documents:", error))
      .finally(() => {
        state.loading = false;
        view.update();
      });
  }

  return { render };
})();
