/* =========================================================
   SHARED UI COMPONENTS
   HTML-string builders used by more than one page:
   modal dialog, and the structured cards shown in AI answers.
========================================================= */

VV.components = {};

/* ---------- Modal dialog ----------
   Render it inside a page template. The page must handle the
   "close-modal" action to hide it again.
*/
VV.components.modal = function modal({ title, body, footer = "", wide = false }) {
  return `
    <div class="modal-overlay" data-action="close-modal" data-self-only>
      <div class="modal-card ${wide ? "modal-wide" : ""}">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="icon-button" data-action="close-modal" title="Close">
            ${VV.icon("close", 20)}
          </button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ""}
      </div>
    </div>
  `;
};

/* ---------- AI answer cards ---------- */

VV.components.aiCards = {
  PRICE_CARD(data) {
    const { esc, inr } = VV.utils;
    return `
      <div class="ai-card ai-card-raised">
        <div class="ai-card-head">
          <span class="ai-card-title">
            ${esc(data.city)} — ${esc(data.propertyType)} (${esc(data.unitType || "Standard")})
          </span>
          <span class="badge badge-info">Verified Price List</span>
        </div>
        <div class="ai-card-grid">
          <div><span class="muted">Base Price: </span><strong>₹${inr(data.basePrice)}</strong></div>
          <div><span class="muted">Development: </span><strong>₹${inr(data.developmentCharge)}</strong></div>
          <div><span class="muted">Parking Charge: </span><strong>₹${inr(data.parkingCharge)}</strong></div>
          <div><span class="muted">GST Rate: </span><strong>${(data.gstRate || 0.01) * 100}%</strong></div>
        </div>
        <div class="ai-card-total">
          <span>Estimated Total Price:</span>
          <span class="ai-card-total-value">₹${inr(data.totalPrice)}</span>
        </div>
      </div>
    `;
  },

  OFFICE_CARD(data) {
    const { esc } = VV.utils;
    return `
      <div class="ai-card">
        <div class="ai-card-heading">
          ${VV.icon("building", 16, "text-primary")}
          <span>Branch Office Address (${esc(data.city)})</span>
        </div>
        <p class="ai-card-text">${esc(data.officeAddress)}</p>
        <div class="ai-card-contact">
          <span>📞 Phone: ${esc(data.phone || "N/A")}</span>
          <span>✉ Email: ${esc(data.email || "care@vastuvihar.org")}</span>
        </div>
      </div>
    `;
  },

  PROJECT_ADDRESS_CARD(data) {
    const { esc } = VV.utils;
    const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(data.siteAddress || "")}`;
    return `
      <div class="ai-card">
        <div class="ai-card-heading">
          ${VV.icon("map-pin", 16, "text-accent")}
          <span>Project Site Location (${esc(data.city)} — ${esc(data.phase)})</span>
        </div>
        <p class="ai-card-text">${esc(data.siteAddress)}</p>
        <div class="ai-card-contact">
          <span class="badge badge-success">Site Status: ${esc(data.status)}</span>
          <a class="link" href="${mapUrl}" target="_blank" rel="noreferrer">View on Map ↗</a>
        </div>
      </div>
    `;
  },

  GST_CARD(data) {
    const { esc, inr } = VV.utils;
    return `
      <div class="ai-card">
        <div class="ai-card-head">
          <span class="ai-card-title">
            Configured GST Calculation (${esc((data.category || "").toUpperCase())})
          </span>
          <span class="badge badge-info">${esc(data.gstRatePct)}% GST</span>
        </div>
        <div class="ai-card-grid">
          <div><span class="muted">Property Value: </span><strong>₹${inr(data.propertyValue)}</strong></div>
          <div>
            <span class="muted">GST Tax Amount: </span>
            <strong class="text-danger">+ ₹${inr(data.gstAmount)}</strong>
          </div>
        </div>
        <div class="ai-card-total">
          <span>Total Payable with Tax:</span>
          <span class="ai-card-total-value">₹${inr(data.totalAmount)}</span>
        </div>
      </div>
    `;
  },

  EMI_CARD(data) {
    const { esc, inr } = VV.utils;
    return `
      <div class="ai-card">
        <div class="ai-card-head">
          <span class="ai-card-title">Indicative Home Loan Schedule</span>
          <span class="badge badge-success">${esc(data.interestRate)}% Interest</span>
        </div>
        <div class="ai-card-grid">
          <div><span class="muted">Principal: </span><strong>₹${inr(data.principal)}</strong></div>
          <div><span class="muted">Tenure: </span><strong>${esc(data.tenureYears)} Years</strong></div>
          <div><span class="muted">Total Interest: </span><strong>₹${inr(data.totalInterest)}</strong></div>
          <div>
            <span class="muted">Monthly EMI: </span>
            <strong class="text-primary">₹${inr(data.monthlyEmi)}</strong>
          </div>
        </div>
      </div>
    `;
  },
};

/* Pick the right card for a structured AI response. */
VV.components.renderAiCard = function renderAiCard(structuredData) {
  if (!structuredData || !structuredData.type || !structuredData.data) {
    return "";
  }
  const builder = VV.components.aiCards[structuredData.type];
  return builder ? builder(structuredData.data) : "";
};

/* ---------- Data table with built-in search + pagination ----------
   The page keeps `query` and `page` in its own state and re-renders.
   Wire these elements in the page:
     data-input="table-search"   (text box)
     data-action="table-prev" / "table-next"
   columns: [{ header, width?, render?(row), accessor? }]
*/
VV.components.DATA_TABLE_PAGE_SIZE = 10;

VV.components.filterRows = function filterRows(rows, query) {
  const term = (query || "").trim().toLowerCase();
  if (!term) {
    return rows;
  }
  return rows.filter((row) =>
    Object.values(row).some(
      (value) => value !== null && value !== undefined && String(value).toLowerCase().includes(term)
    )
  );
};

VV.components.dataTable = function dataTable({ columns, rows, query = "", page = 1, placeholder = "Search records...", actionsHtml = "" }) {
  const { esc } = VV.utils;
  const pageSize = VV.components.DATA_TABLE_PAGE_SIZE;
  const filtered = VV.components.filterRows(rows, query);
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const head = columns
    .map((col) => `<th ${col.width ? `style="width:${col.width}"` : ""}>${esc(col.header)}</th>`)
    .join("");

  const body =
    visible.length === 0
      ? `<tr><td colspan="${columns.length}" class="table-empty">No records match your criteria.</td></tr>`
      : visible
          .map((row) => {
            const cells = columns
              .map((col) => {
                const content = col.render
                  ? col.render(row)
                  : row[col.accessor] !== undefined && row[col.accessor] !== null
                  ? esc(row[col.accessor])
                  : "—";
                return `<td>${content}</td>`;
              })
              .join("");
            return `<tr>${cells}</tr>`;
          })
          .join("");

  const pagination =
    totalPages > 1
      ? `
        <div class="table-pagination">
          <span class="muted-small">Page ${currentPage} of ${totalPages}</span>
          <div class="table-pagination-buttons">
            <button class="btn btn-secondary btn-sm" data-action="table-prev" ${currentPage === 1 ? "disabled" : ""}>Previous</button>
            <button class="btn btn-secondary btn-sm" data-action="table-next" ${currentPage === totalPages ? "disabled" : ""}>Next</button>
          </div>
        </div>`
      : "";

  return {
    totalPages,
    html: `
      <div class="card-table-wrapper">
        <div class="table-header-toolbar">
          <div class="table-toolbar-left">
            <div class="table-search-wrap">
              <span class="table-search-icon">${VV.icon("search", 15)}</span>
              <input type="text" class="table-search-input" data-input="table-search"
                     placeholder="${esc(placeholder)}" value="${esc(query)}">
            </div>
            <span class="muted-small">Showing ${filtered.length} records</span>
          </div>
          ${actionsHtml ? `<div>${actionsHtml}</div>` : ""}
        </div>
        <div class="table-scroll">
          <table class="custom-table">
            <thead><tr>${head}</tr></thead>
            <tbody>${body}</tbody>
          </table>
        </div>
        ${pagination}
      </div>`,
  };
};
