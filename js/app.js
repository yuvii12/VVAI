/* =========================================================
   VASTU VIHAR - APPLICATION CORE
   Handles: theme, language, login session, page layout
   (sidebar + header), navigation between pages and the
   backend health indicator.

   Pages live in js/pages/ and register themselves on VV.pages.
========================================================= */

(function () {
  "use strict";

  /* =========================
     NAVIGATION DEFINITION
  ========================= */

  const NAV_ITEMS = [
    { section: "CORE INFORMATION", key: "dashboard", label: "Dashboard", icon: "dashboard" },
    { section: "CORE INFORMATION", key: "ai", label: "AI Assistant", icon: "ai" },
    { section: "CORE INFORMATION", key: "projects", label: "Projects & Sites", icon: "projects" },
    { section: "CORE INFORMATION", key: "properties", label: "Properties & Models", icon: "properties" },
    { section: "CORE INFORMATION", key: "amenities", label: "Building Specifications", icon: "sparkles" },
    { section: "STATUTORY & TOOLS", key: "gst", label: "GST Calculator", icon: "calculator" },
    {section: "STATUTORY & TOOLS",key: "price-calculator",label: "Price Calculator", icon: "calculator"},
    { section: "STATUTORY & TOOLS", key: "documents", label: "Documents & Home Loan", icon: "documents" },
    { section: "ADMINISTRATION", key: "admin-users", label: "User Management", icon: "users", adminOnly: true },
    { section: "ADMINISTRATION", key: "knowledge", label: "AI Knowledge Training", icon: "gear", adminOnly: true },
  ];

  const PAGE_TITLES = {
    dashboard: "Vastu Vihar Information Dashboard",
    ai: "Official AI Information Assistant",
    projects: "Project Sites Directory (40+ Cities)",
    properties: "Authoritative Bungalow & Flat Models",
    amenities: "Building Specifications & Project Amenities",
    gst: "Statutory GST Real Estate Calculator",
    "price-calculator": "Property Price Calculator",
    documents: "Official Documents & Home Loan Papers",
    "admin-users": "User Management & Access Control",
    knowledge: "AI Knowledge Training & Administration",
  };

  /* Which page module renders which navigation key. */
  const PAGE_MODULES = {
    dashboard: "dashboard",
    ai: "aiAssistant",
    projects: "projects",
    properties: "properties",
    amenities: "amenities",
    gst: "gstCalculator",
    "price-calculator": "priceCalculator",
    documents: "documents",
    "admin-users": "userManagement",
    knowledge: "knowledgeBase",
  };

  /* =========================
     APPLICATION STATE
  ========================= */

  const state = VV.state;
  state.user = null;
  state.theme = localStorage.getItem(VV.config.STORAGE_THEME) || "dark";
  state.language = localStorage.getItem(VV.config.STORAGE_LANGUAGE) || "en";
  state.activeNav = "dashboard";
  state.aiInitialQuestion = "";
  state.backendOnline = false;

  const appRoot = document.getElementById("app");
  const { esc } = VV.utils;

  /* =========================
     THEME & LANGUAGE
  ========================= */

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    localStorage.setItem(VV.config.STORAGE_THEME, state.theme);
  }

  function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme();
    renderShell(false);
  }

  function setLanguage(code) {
    state.language = code;
    localStorage.setItem(VV.config.STORAGE_LANGUAGE, code);
  }

  /* =========================
     AUTHENTICATION
  ========================= */

  function isAdmin() {
    return Boolean(state.user && state.user.role === "ADMIN");
  }

  async function login(email, password) {
    const response = await VV.api.login(email, password);
    if (response && response.token) {
      VV.api.setAuthToken(response.token);
      state.user = response.user;
      state.activeNav = "dashboard";
      renderShell(true);
    }
    return response;
  }

  function logout() {
    VV.api.setAuthToken(null);
    VV.voice.stop();
    state.user = null;
    renderLogin();
  }

  async function restoreSession() {
    if (!VV.api.getAuthToken()) {
      return;
    }
    try {
      const response = await VV.api.getMe();
      if (response && response.user) {
        state.user = response.user;
      }
    } catch (error) {
      VV.api.setAuthToken(null);
      state.user = null;
    }
  }

  /* =========================
     NAVIGATION
  ========================= */

  function navigate(key) {
    if (key !== "ai") {
      state.aiInitialQuestion = "";
    }
    state.activeNav = key;
    renderShell(true);
  }

  function navigateToAi(question) {
    state.aiInitialQuestion = question;
    state.activeNav = "ai";
    renderShell(true);
  }

  /* =========================
     LAYOUT: SIDEBAR
  ========================= */

  function sidebarHtml() {
    const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin());
    const sections = [...new Set(visibleItems.map((item) => item.section))];
    const online = state.backendOnline;

    const sectionsHtml = sections
      .map((section) => {
        const itemsHtml = visibleItems
          .filter((item) => item.section === section)
          .map(
            (item) => `
              <button class="nav-item ${state.activeNav === item.key ? "active" : ""}"
                      data-nav="${item.key}">
                ${VV.icon(item.icon, 16)}
                <span>${esc(item.label)}</span>
              </button>`
          )
          .join("");
        return `
          <div class="nav-section">
            <div class="nav-section-title">${esc(section)}</div>
            <div class="nav-list">${itemsHtml}</div>
          </div>`;
      })
      .join("");

    return `
      <aside class="app-sidebar">
        <div class="sidebar-header">
          <div class="brand-row">
            <img class="brand-logo" src="assets/images/vastu_logo.png" alt="Vastu Vihar">
            <div>
              <div class="brand-title">Vastu Vihar</div>
              <div class="brand-subtitle">Information &amp; AI System</div>
            </div>
          </div>
          <div class="sidebar-status-row">
            <div class="status-pill ${online ? "status-online" : "status-offline"}" id="status-pill">
              <span class="status-dot"></span>
              <span id="status-text">${online ? "System Ready" : "Connecting..."}</span>
            </div>
            <span class="role-chip ${isAdmin() ? "role-admin" : "role-staff"}">
              ${esc((state.user && state.user.role) || "USER")}
            </span>
          </div>
        </div>
        <div class="sidebar-content">${sectionsHtml}</div>
      </aside>`;
  }

  /* =========================
     LAYOUT: HEADER
  ========================= */

  function headerHtml() {
    const user = state.user;
    const title = PAGE_TITLES[state.activeNav] || "Dashboard";

    const languageOptions = VV.LANGUAGES.map(
      (lang) => `
        <option value="${lang.code}" ${state.language === lang.code ? "selected" : ""}>
          ${esc(lang.label)} (${esc(lang.native)})
        </option>`
    ).join("");

    return `
      <header class="app-header">
        <div class="header-left">
          <h2 class="header-page-title">${esc(title)}</h2>
        </div>
        <div class="header-right">
          <select class="header-select" id="language-select">${languageOptions}</select>
          <button class="header-button" id="theme-toggle" title="Toggle Light / Dark Mode">
            ${state.theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <div class="header-user">
            <div class="header-user-info">
              <div class="header-user-name">${esc(user.name)}</div>
              <div class="header-user-meta">
                <span class="role-chip role-chip-small ${isAdmin() ? "role-admin" : "role-staff"}">
                  ${esc(user.role)}
                </span>
                <span class="muted-small">${esc(user.city || "Patna")}</span>
              </div>
            </div>
            <button class="header-button header-logout" id="logout-button" title="Sign Out of Vastu Vihar">
              Logout
            </button>
          </div>
        </div>
      </header>`;
  }

  /* =========================
     RENDERING
  ========================= */

  /* The login page attaches handlers to #app; remove them before drawing something else. */
  function resetRootHandlers() {
    appRoot.onclick = null;
    appRoot.oninput = null;
    appRoot.onchange = null;
    appRoot.onkeydown = null;
    appRoot.onsubmit = null;
  }

  function renderLoading() {
    resetRootHandlers();
    appRoot.innerHTML = `
      <div class="splash">
        <div class="splash-inner">
          <img class="splash-logo" src="assets/images/vastu_logo.png" alt="Vastu Vihar">
          <div class="splash-title">Initializing Vastu Vihar Information System...</div>
          <div class="splash-text">Verifying secure session &amp; local knowledge source</div>
        </div>
      </div>`;
  }

  function renderLogin() {
    resetRootHandlers();
    appRoot.innerHTML = "";
    VV.pages.login.render(appRoot, { login });
  }

  /*
    Draws sidebar + header + empty page area, then asks the active
    page module to render itself into the page area.
    remountPage=false only refreshes the chrome (used by the theme toggle).
  */
  function renderShell(remountPage) {
    const pageScroll = document.querySelector(".app-main");
    const savedScroll = pageScroll ? pageScroll.scrollTop : 0;

    resetRootHandlers();
    appRoot.innerHTML = `
      <div class="app-shell">
        ${sidebarHtml()}
        <div class="app-main">
          ${headerHtml()}
          <main class="app-content" id="page-root"></main>
        </div>
      </div>`;

    bindShellEvents();

    if (remountPage) {
      mountActivePage();
    } else {
      mountActivePage();
      const main = document.querySelector(".app-main");
      if (main) {
        main.scrollTop = savedScroll;
      }
    }
  }

  function mountActivePage() {
    const root = document.getElementById("page-root");
    const moduleName = PAGE_MODULES[state.activeNav] || "dashboard";
    const page = VV.pages[moduleName];

    if (!page) {
      root.innerHTML = VV.utils.emptyState("This page is not available.");
      return;
    }

    page.render(root, {
      user: state.user,
      isAdmin: isAdmin(),
      language: state.language,
      initialQuestion: state.aiInitialQuestion,
      navigate,
      navigateToAi,
    });
  }

  function bindShellEvents() {
    document.querySelectorAll("[data-nav]").forEach((button) => {
      button.addEventListener("click", () => navigate(button.dataset.nav));
    });

    document.getElementById("language-select").addEventListener("change", (event) => {
      setLanguage(event.target.value);
      /* Pages read the language when they need it; the AI page keeps its chat. */
    });

    document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
    document.getElementById("logout-button").addEventListener("click", logout);
  }

  /* =========================
     BACKEND HEALTH INDICATOR
  ========================= */

  function updateStatusIndicator() {
    const pill = document.getElementById("status-pill");
    const text = document.getElementById("status-text");
    if (!pill || !text) {
      return;
    }
    pill.className = `status-pill ${state.backendOnline ? "status-online" : "status-offline"}`;
    text.textContent = state.backendOnline ? "System Ready" : "Connecting...";
  }

  async function checkBackend() {
    try {
      const response = await VV.api.checkHealth();
      state.backendOnline = Boolean(response && response.status === "ok");
    } catch (error) {
      state.backendOnline = false;
    }
    updateStatusIndicator();
  }

  /* =========================
     START-UP
  ========================= */

  async function start() {
    applyTheme();
    renderLoading();
    await restoreSession();

    if (state.user) {
      renderShell(true);
    } else {
      renderLogin();
    }

    checkBackend();
    setInterval(checkBackend, VV.config.HEALTH_CHECK_INTERVAL);
  }

  VV.app = { navigate, navigateToAi, login, logout };

  document.addEventListener("DOMContentLoaded", start);
})();
