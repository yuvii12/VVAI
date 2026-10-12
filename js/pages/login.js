/* =========================================================
   LOGIN PAGE
========================================================= */

VV.pages.login = (function () {
  const { esc } = VV.utils;

  const DEMO_ACCOUNTS = [
    {
      email: "admin@vastuvihar.org",
      password: "Admin@123#Vastu",
      title: "🛡️ Administrator",
      subtitle: "Admin & Knowledge CRUD",
      className: "demo-admin",
    },
    {
      email: "sales@vastuvihar.org",
      password: "Sales@123#Vastu",
      title: "💼 Sales Staff",
      subtitle: "AI & Projects Access",
      className: "demo-sales",
    },
  ];

  function render(root, ctx) {
    const state = {
      email: DEMO_ACCOUNTS[0].email,
      password: DEMO_ACCOUNTS[0].password,
      loading: false,
      error: "",
    };

    function template() {
      const demoButtons = DEMO_ACCOUNTS.map(
        (account, index) => `
          <button type="button" class="demo-button" data-action="quick-fill" data-index="${index}">
            <div class="${account.className}">${account.title}</div>
            <div class="demo-subtitle">${esc(account.subtitle)}</div>
          </button>`
      ).join("");

      return `
        <div class="login-page">
          <div class="login-card">
            <div class="login-brand">
              <div class="login-logo-box">
                <img src="assets/images/vastu_logo.png" alt="Vastu Vihar Official Logo">
              </div>
              <h1 class="login-title">Vastu Vihar</h1>
              <div class="login-subtitle">Official Information &amp; AI Assistant System</div>
              <p class="login-tagline">Authoritative, Self-Contained Knowledge Base</p>
            </div>

            ${
              state.error
                ? `<div class="alert alert-danger"><span>⚠️</span><span>${esc(state.error)}</span></div>`
                : ""
            }

            <form class="login-form" id="login-form">
              <div>
                <label class="form-label" for="login-email">Work Email Address</label>
                <input class="form-input" id="login-email" type="email" required
                       data-input="email" value="${esc(state.email)}"
                       placeholder="e.g. admin@vastuvihar.org">
              </div>
              <div>
                <label class="form-label" for="login-password">Password</label>
                <input class="form-input" id="login-password" type="password" required
                       data-input="password" value="${esc(state.password)}"
                       placeholder="Enter your security password">
              </div>
              <button type="submit" class="btn btn-primary btn-block btn-lg" ${state.loading ? "disabled" : ""}>
                ${state.loading ? "Authenticating session..." : "Sign In to Workspace"}
              </button>
            </form>

            <div class="login-demo">
              <span class="login-demo-title">Quick Demo Accounts</span>
              <div class="demo-grid">${demoButtons}</div>
            </div>

            <div class="login-footer">
              🔒 Protected internal platform with bcrypt encryption and role-based access.
            </div>
          </div>
        </div>`;
    }

    const view = VV.utils.createView(root, {
      render: template,
      actions: {
        "quick-fill"(target) {
          const account = DEMO_ACCOUNTS[Number(target.dataset.index)];
          state.email = account.email;
          state.password = account.password;
          state.error = "";
          view.update();
        },
      },
      inputs: {
        email(value) {
          state.email = value;
        },
        password(value) {
          state.password = value;
        },
      },
    });

    /* Form submit is not a click, so it is attached separately. */
    root.onsubmit = async function (event) {
      event.preventDefault();
      state.error = "";
      state.loading = true;
      view.update();
      try {
        await ctx.login(state.email, state.password);
      } catch (error) {
        state.error = error.message || "Invalid email or password. Please verify credentials.";
        state.loading = false;
        view.update();
      }
    };

    view.update();
  }

  return { render };
})();
