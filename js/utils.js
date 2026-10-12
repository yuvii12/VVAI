/* =========================================================
   UTILITIES
   Small helpers shared by every page.
========================================================= */

VV.utils = {};

/* ---------- Text / HTML helpers ---------- */

/* Escape text so it is safe to place inside an HTML template. */
VV.utils.esc = function esc(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

/* Format a number the Indian way, e.g. 4000000 -> "40,00,000". */
VV.utils.inr = function inr(value) {
  return Number(value || 0).toLocaleString("en-IN");
};

/* Capitalise the first letter of a string. */
VV.utils.capitalize = function capitalize(text) {
  const value = String(text || "");
  return value.charAt(0).toUpperCase() + value.slice(1);
};

/* ---------- Timing helpers ---------- */

VV.utils.debounce = function debounce(fn, delay = 300) {
  let timer = null;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

/* ---------- Toast message ---------- */

VV.utils.toast = function toast(message, type = "info") {
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("toast-hide"), 2600);
  setTimeout(() => el.remove(), 3100);
};

/* ---------- View helper ----------
   A tiny replacement for what React does for us:
   - render()  returns an HTML string for the current state
   - actions   map data-action="name"  -> click handlers
   - inputs    map data-input="name"   -> input/change handlers
   - keys      map data-enter="name"   -> Enter key handlers
   update() re-renders the HTML and restores focus + caret position,
   so typing in a search box is never interrupted.
*/
VV.utils.createView = function createView(root, options) {
  const { render, actions = {}, inputs = {}, keys = {}, afterRender = null } = options;

  function captureFocus() {
    const active = document.activeElement;
    if (!active || !root.contains(active) || !active.dataset.input) {
      return null;
    }
    return {
      name: active.dataset.input,
      index: active.dataset.index || "",
      start: active.selectionStart,
      end: active.selectionEnd,
    };
  }

  function restoreFocus(saved) {
    if (!saved) {
      return;
    }
    const selector = `[data-input="${saved.name}"]` + (saved.index ? `[data-index="${saved.index}"]` : "");
    const el = root.querySelector(selector);
    if (!el) {
      return;
    }
    el.focus();
    if (saved.start !== null && saved.start !== undefined && el.setSelectionRange) {
      try {
        el.setSelectionRange(saved.start, saved.end);
      } catch (error) {
        /* some input types (number, email) do not support selection */
      }
    }
  }

  function update() {
    const saved = captureFocus();
    root.innerHTML = render();
    restoreFocus(saved);
    if (afterRender) {
      afterRender(root);
    }
  }

  root.onclick = function onClick(event) {
    const target = event.target.closest("[data-action]");
    if (!target || !root.contains(target)) {
      return;
    }
    /* data-self-only: ignore clicks that landed on a child element (used by modal overlays). */
    if (target.hasAttribute("data-self-only") && event.target !== target) {
      return;
    }
    const handler = actions[target.dataset.action];
    if (handler) {
      handler(target, event);
    }
  };

  const onValueChange = function onValueChange(event) {
    const target = event.target.closest("[data-input]");
    if (!target) {
      return;
    }
    const handler = inputs[target.dataset.input];
    if (!handler) {
      return;
    }
    const value = target.type === "checkbox" ? target.checked : target.value;
    handler(value, target, event);
  };
  root.oninput = onValueChange;
  root.onchange = onValueChange;

  root.onkeydown = function onKeyDown(event) {
    const target = event.target.closest("[data-enter]");
    if (target && event.key === "Enter" && !event.shiftKey) {
      const handler = keys[target.dataset.enter];
      if (handler) {
        event.preventDefault();
        handler(target, event);
      }
    }
  };

  return { update };
};

/* ---------- Reusable HTML fragments ---------- */

VV.utils.badge = function badge(text, type = "info", extraClass = "") {
  return `<span class="badge badge-${type} ${extraClass}">${VV.utils.esc(text)}</span>`;
};

VV.utils.pageHeader = function pageHeader(title, subtitle, rightHtml = "") {
  return `
    <div class="page-heading">
      <div>
        <h1 class="page-title">${title}</h1>
        ${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ""}
      </div>
      ${rightHtml}
    </div>
  `;
};

VV.utils.emptyState = function emptyState(message, icon = "🔍") {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <div>${message}</div>
    </div>
  `;
};

VV.utils.loadingState = function loadingState(message = "Loading...") {
  return `<div class="loading-state">${VV.utils.esc(message)}</div>`;
};
