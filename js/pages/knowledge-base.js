/* =========================================================
   AI KNOWLEDGE TRAINING PAGE (admin only)
   Add, edit and delete the Q&A entries that feed the
   local AI assistant.
========================================================= */

VV.pages.knowledgeBase = (function () {
  const { esc } = VV.utils;

  const FORM_CATEGORIES = [
    "Project",
    "Property",
    "Location",
    "FAQ",
    "GST",
    "RERA",
    "Building Specification",
    "Home Loan",
    "Other",
  ];
  const FILTER_CATEGORIES = ["ALL", ...FORM_CATEGORIES];
  const DEFAULT_SOURCE = "Official Vastu Vihar Data";

  function emptyForm(category = "FAQ") {
    return { category, title: "", question: "", answer: "", source: DEFAULT_SOURCE, keywords: "" };
  }

  function render(root) {
    const state = {
      articles: [],
      search: "",
      activeCategory: "ALL",
      loading: true,
      modalOpen: false,
      editingArticle: null,
      status: null,
      form: emptyForm(),
    };
    let statusTimer = null;

    /* ---------- Helpers ---------- */

    function showStatus(type, message) {
      state.status = { type, message };
      clearTimeout(statusTimer);
      statusTimer = setTimeout(() => {
        state.status = null;
        view.update();
      }, 5000);
      view.update();
    }

    function loadKnowledge() {
      state.loading = true;
      VV.api
        .getKnowledge()
        .then((res) => {
          state.articles = res.knowledge || [];
        })
        .catch((error) => showStatus("error", `Failed to load knowledge entries: ${error.message}`))
        .finally(() => {
          state.loading = false;
          view.update();
        });
    }

    function filteredArticles() {
      const term = state.search.toLowerCase();
      return state.articles.filter((art) => {
        const matchCategory =
          state.activeCategory === "ALL" ||
          (art.category || "").toLowerCase() === state.activeCategory.toLowerCase();

        const matchSearch =
          !term ||
          (art.question || "").toLowerCase().includes(term) ||
          (art.answer || "").toLowerCase().includes(term) ||
          (art.title || "").toLowerCase().includes(term) ||
          (art.source || "").toLowerCase().includes(term) ||
          (Array.isArray(art.keywords) && art.keywords.some((k) => k.toLowerCase().includes(term)));

        return matchCategory && matchSearch;
      });
    }

    /* ---------- Templates ---------- */

    function articleHtml(art) {
      const keywords =
        Array.isArray(art.keywords) && art.keywords.length > 0
          ? `<div class="keyword-row">
               <span class="keyword-label">Keywords:</span>
               ${art.keywords.map((kw) => `<span class="keyword-tag">#${esc(kw)}</span>`).join("")}
             </div>`
          : "";

      return `
        <article class="knowledge-card">
          <div class="knowledge-card-head">
            <div>
              <div class="knowledge-meta">
                <span class="tag tag-primary">${esc(art.category || "General")}</span>
                ${art.source ? `<span class="muted-small">Source: ${esc(art.source)}</span>` : ""}
              </div>
              <h3 class="knowledge-title">${esc(art.title || art.question)}</h3>
            </div>
            <div class="row-actions">
              <button class="btn btn-secondary btn-xs" data-action="edit-article" data-id="${esc(art.id)}">✏️ Edit</button>
              <button class="btn btn-secondary btn-xs text-danger" data-action="delete-article" data-id="${esc(art.id)}">🗑️ Delete</button>
            </div>
          </div>
          <div class="question-box">❓ Question: ${esc(art.question)}</div>
          <div class="answer-text">💡 ${esc(art.answer)}</div>
          ${keywords}
        </article>`;
    }

    function listHtml() {
      if (state.loading) {
        return `<div class="loading-block"><div class="loading-icon">⏳</div>
                <p>Loading AI knowledge training store...</p></div>`;
      }
      const filtered = filteredArticles();
      if (filtered.length === 0) {
        return `
          <div class="empty-block">
            <div class="empty-icon">📖</div>
            <h3>No knowledge entries found</h3>
            <p>No articles match category "${esc(state.activeCategory)}" or query "${esc(state.search)}".</p>
            <button class="btn btn-secondary btn-sm" data-action="reset-filters">Reset Filters</button>
          </div>`;
      }
      return `<div class="stack">${filtered.map(articleHtml).join("")}</div>`;
    }

    function modalHtml() {
      if (!state.modalOpen) {
        return "";
      }
      const f = state.form;
      const isEdit = Boolean(state.editingArticle);
      const categoryOptions = FORM_CATEGORIES.map(
        (cat) => `<option value="${cat}" ${f.category === cat ? "selected" : ""}>${cat}</option>`
      ).join("");

      const body = `
        <form class="modal-form" id="knowledge-form">
          <div>
            <label class="form-label">Knowledge Category *</label>
            <select class="form-input" data-input="category">${categoryOptions}</select>
          </div>
          <div>
            <label class="form-label">Article Title / Heading *</label>
            <input class="form-input" type="text" required data-input="title" value="${esc(f.title)}"
                   placeholder="e.g. MVR Definition &amp; Calculation Rules">
          </div>
          <div>
            <label class="form-label">Official Question / Query Variations *</label>
            <textarea class="form-input" required rows="2" data-input="question"
                      placeholder="e.g. MVR क्या होता है? / What is MVR and how is it used in registry?">${esc(f.question)}</textarea>
          </div>
          <div>
            <label class="form-label">Official Ground Truth Answer *</label>
            <textarea class="form-input" required rows="5" data-input="answer"
                      placeholder="Enter the official, authoritative response that the AI assistant will deliver...">${esc(f.answer)}</textarea>
          </div>
          <div>
            <label class="form-label">Official Document Source</label>
            <input class="form-input" type="text" data-input="source" value="${esc(f.source)}"
                   placeholder="e.g. Official Vastu Vihar Data / TEST PAPER / Location PDF">
          </div>
          <div>
            <label class="form-label">Search Keywords (Comma-separated)</label>
            <input class="form-input" type="text" data-input="keywords" value="${esc(f.keywords)}"
                   placeholder="e.g. mvr, minimum value register, circle rate, stamp duty">
          </div>
          <div class="modal-form-actions">
            <button type="button" class="btn btn-secondary btn-sm" data-action="close-modal">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">
              ${isEdit ? "Update Knowledge" : "Add to Knowledge Base"}
            </button>
          </div>
        </form>`;

      return VV.components.modal({
        title: isEdit ? `Edit Knowledge: ${esc(f.title || "Entry")}` : "Add New AI Knowledge Entry",
        body,
      });
    }

    function template() {
      const filtered = filteredArticles();

      const categoryButtons = FILTER_CATEGORIES.map(
        (cat) => `
          <button class="category-chip ${state.activeCategory === cat ? "category-chip-active" : ""}"
                  data-action="set-category" data-category="${esc(cat)}">
            ${esc(cat)} ${cat === "ALL" ? `(${state.articles.length})` : ""}
          </button>`
      ).join("");

      const statusBanner = state.status
        ? `<div class="status-banner status-banner-${state.status.type}">${esc(state.status.message)}</div>`
        : "";

      return `
        <div class="page-container page-wide">
          <div class="hero-banner hero-banner-compact">
            <div>
              <div class="hero-title-row">
                <span class="hero-emoji-sm">🧠</span>
                <h2 class="hero-title-sm">AI Knowledge Training &amp; Retrieval Store</h2>
                <span class="hero-tag hero-tag-sm">Authoritative Ground Truth</span>
              </div>
              <p class="hero-text hero-text-sm">
                Manage the official knowledge base that feeds the Local AI Assistant. Add and update verified Q&amp;A
                across projects, properties, locations, statutory GST/RERA rules, building specifications, and
                home loan checklists.
              </p>
            </div>
            <button class="btn btn-primary btn-md" data-action="open-add">+ Add Knowledge Entry</button>
          </div>

          ${statusBanner}

          <div class="chip-wrap chip-wrap-spaced">${categoryButtons}</div>

          <div class="toolbar-row">
            <input type="text" class="form-input toolbar-search toolbar-search-wide" data-input="search"
                   placeholder="🔍 Search questions, answers, keywords, or sources..." value="${esc(state.search)}">
            <div class="muted-small">
              Showing <strong>${filtered.length}</strong> of ${state.articles.length} knowledge entries
            </div>
          </div>

          ${listHtml()}
          ${modalHtml()}
        </div>`;
    }

    /* ---------- Actions ---------- */

    async function saveArticle() {
      const f = state.form;
      if (!f.question.trim() || !f.answer.trim()) {
        showStatus("error", "Question and Answer fields are required.");
        return;
      }

      const payload = {
        category: f.category,
        title: f.title.trim() || f.question.trim().slice(0, 60),
        question: f.question.trim(),
        answer: f.answer.trim(),
        source: f.source.trim() || DEFAULT_SOURCE,
        keywords: f.keywords
          ? f.keywords.split(",").map((k) => k.trim()).filter(Boolean)
          : [],
      };

      try {
        if (state.editingArticle) {
          await VV.api.updateKnowledge(state.editingArticle.id, payload);
          showStatus("success", `Knowledge entry "${payload.title}" updated successfully.`);
        } else {
          await VV.api.addKnowledge(payload);
          showStatus("success", `New knowledge entry "${payload.title}" added to AI training base.`);
        }
        state.modalOpen = false;
        loadKnowledge();
      } catch (error) {
        showStatus("error", `Save failed: ${error.message}`);
      }
    }

    async function deleteArticle(article) {
      const confirmed = window.confirm(
        `Are you sure you want to delete this AI knowledge entry:\n"${article.title || article.question}"?`
      );
      if (!confirmed) {
        return;
      }
      try {
        await VV.api.deleteKnowledge(article.id);
        loadKnowledge();
        showStatus("success", "Knowledge entry deleted successfully.");
      } catch (error) {
        showStatus("error", `Delete failed: ${error.message}`);
      }
    }

    const findArticle = (id) => state.articles.find((a) => String(a.id) === String(id));

    /* ---------- Events ---------- */

    const view = VV.utils.createView(root, {
      render: template,
      actions: {
        "open-add"() {
          state.editingArticle = null;
          state.form = emptyForm(state.activeCategory !== "ALL" ? state.activeCategory : "FAQ");
          state.modalOpen = true;
          view.update();
        },
        "edit-article"(target) {
          const art = findArticle(target.dataset.id);
          state.editingArticle = art;
          state.form = {
            category: art.category || "FAQ",
            title: art.title || "",
            question: art.question || "",
            answer: art.answer || "",
            source: art.source || DEFAULT_SOURCE,
            keywords: Array.isArray(art.keywords) ? art.keywords.join(", ") : art.keywords || "",
          };
          state.modalOpen = true;
          view.update();
        },
        "delete-article"(target) {
          deleteArticle(findArticle(target.dataset.id));
        },
        "close-modal"() {
          state.modalOpen = false;
          view.update();
        },
        "set-category"(target) {
          state.activeCategory = target.dataset.category;
          view.update();
        },
        "reset-filters"() {
          state.activeCategory = "ALL";
          state.search = "";
          view.update();
        },
      },
      inputs: {
        search(value) {
          state.search = value;
          view.update();
        },
        /* Form fields only update state - no re-render while typing. */
        category(value) {
          state.form.category = value;
        },
        title(value) {
          state.form.title = value;
        },
        question(value) {
          state.form.question = value;
        },
        answer(value) {
          state.form.answer = value;
        },
        source(value) {
          state.form.source = value;
        },
        keywords(value) {
          state.form.keywords = value;
        },
      },
    });

    root.onsubmit = function (event) {
      event.preventDefault();
      saveArticle();
    };

    view.update();
    loadKnowledge();
  }

  return { render };
})();
