/* =========================================================
   USER MANAGEMENT PAGE (admin only)
   List, create, edit and delete system users.
========================================================= */

VV.pages.userManagement = (function () {
  const { esc } = VV.utils;

  const ROLES = ["SALES_EMPLOYEE", "MANAGER", "ADMIN"];

  function emptyForm() {
    return {
      id: "",
      name: "",
      email: "",
      password: "",
      role: "SALES_EMPLOYEE",
      phone: "",
      isActive: true,
    };
  }

  function roleBadge(role) {
    const tone = role === "ADMIN" ? "admin" : role === "MANAGER" ? "manager" : "sales";
    return `<span class="role-badge role-badge-${tone}">${esc(role)}</span>`;
  }

  function render(root, ctx) {
    const state = {
      users: [],
      search: "",
      loading: true,
      modal: null, // null | "create" | "edit"
      form: emptyForm(),
      status: null, // { type, message }
      tableQuery: "",
      tablePage: 1,
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

    function loadUsers() {
      state.loading = true;
      VV.api
        .getUsers()
        .then((res) => {
          state.users = res.users || [];
        })
        .catch((error) => showStatus("error", `Failed to load users: ${error.message}`))
        .finally(() => {
          state.loading = false;
          view.update();
        });
    }

    function filteredUsers() {
      const term = state.search.toLowerCase();
      return state.users.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(term) ||
          (u.email || "").toLowerCase().includes(term) ||
          (u.role || "").toLowerCase().includes(term) ||
          (u.phone || "").toLowerCase().includes(term)
      );
    }

    /* ---------- Table columns ---------- */

    const columns = [
      {
        header: "User Details",
        render: (r) => `
          <div>
            <div class="cell-strong">${esc(r.name)}</div>
            <div class="muted-small">${esc(r.email)}</div>
          </div>`,
      },
      { header: "System Role", render: (r) => roleBadge(r.role) },
      { header: "Phone", render: (r) => esc(r.phone || "—") },
      {
        header: "Account Status",
        render: (r) =>
          r.isActive !== false
            ? '<span class="state-badge state-active">● Active</span>'
            : '<span class="state-badge state-inactive">○ Inactive</span>',
      },
      {
        header: "Created Date",
        render: (r) => esc(r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : "System"),
      },
      {
        header: "Actions",
        render: (r) => `
          <div class="row-actions">
            <button class="btn btn-secondary btn-xs" data-action="edit-user" data-id="${esc(r.id)}">✏️ Edit</button>
            <button class="btn btn-secondary btn-xs text-danger" data-action="delete-user" data-id="${esc(r.id)}">🗑️ Delete</button>
          </div>`,
      },
    ];

    /* ---------- Modal form ---------- */

    function field(label, inner) {
      return `<div><label class="form-label">${label}</label>${inner}</div>`;
    }

    function roleOptions(selected) {
      return ROLES.map((r) => `<option value="${r}" ${selected === r ? "selected" : ""}>${r}</option>`).join("");
    }

    function modalHtml() {
      if (!state.modal) {
        return "";
      }
      const f = state.form;
      const isEdit = state.modal === "edit";

      const body = `
        <form class="modal-form" id="user-form">
          ${field(
            "Full Name *",
            `<input class="form-input" type="text" required data-input="name" value="${esc(f.name)}"
                    ${isEdit ? "" : 'placeholder="e.g. Ramesh Kumar"'}>`
          )}
          ${field(
            "Email Address *",
            `<input class="form-input" type="email" required data-input="email" value="${esc(f.email)}"
                    ${isEdit ? "" : 'placeholder="name@vastuvihar.org"'}>`
          )}
          ${
            isEdit
              ? field(
                  "Reset Password (Leave blank to keep unchanged)",
                  `<input class="form-input" type="password" data-input="password" value="${esc(f.password)}"
                          placeholder="Enter new password to change...">`
                )
              : field(
                  "Initial Password *",
                  `<input class="form-input" type="password" required data-input="password" value="${esc(f.password)}"
                          placeholder="Enter secure initial password">`
                )
          }
          <div class="form-two-col">
            ${field("Role *", `<select class="form-input" data-input="role">${roleOptions(f.role)}</select>`)}
            ${field(
              "Account Status",
              `<select class="form-input" data-input="status">
                 <option value="active" ${f.isActive ? "selected" : ""}>Active</option>
                 <option value="inactive" ${!f.isActive ? "selected" : ""}>Inactive</option>
               </select>`
            )}
          </div>
          ${field(
            "Contact Phone",
            `<input class="form-input" type="text" data-input="phone" value="${esc(f.phone)}"
                    ${isEdit ? "" : 'placeholder="+91 98765 43210"'}>`
          )}
          <div class="modal-form-actions">
            <button type="button" class="btn btn-secondary btn-sm" data-action="close-modal">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">${isEdit ? "Save Changes" : "Create User"}</button>
          </div>
        </form>`;

      return VV.components.modal({
        title: isEdit ? `Edit User: ${esc(f.name)}` : "Create New System User",
        body,
      });
    }

    /* ---------- Page ---------- */

    function template() {
      const filtered = filteredUsers();
      const table = VV.components.dataTable({
        columns,
        rows: filtered,
        query: state.tableQuery,
        page: state.tablePage,
      });

      const statusBanner = state.status
        ? `<div class="status-banner status-banner-${state.status.type}">${esc(state.status.message)}</div>`
        : "";

      return `
        <div class="page-container page-wide">
          <div class="hero-banner hero-banner-compact">
            <div>
              <div class="hero-title-row">
                <span class="hero-emoji-sm">👥</span>
                <h2 class="hero-title-sm">User Management &amp; Access Control</h2>
                <span class="hero-tag hero-tag-sm">Role-Based Access</span>
              </div>
              <p class="hero-text hero-text-sm">
                Administer system user accounts, assign roles (ADMIN, SALES_EMPLOYEE, MANAGER), manage active
                credentials, and ensure secured authentication with bcrypt encryption.
              </p>
            </div>
            <button class="btn btn-primary btn-md" data-action="open-create">+ Create New User</button>
          </div>

          ${statusBanner}

          <div class="toolbar-row">
            <input type="text" class="form-input toolbar-search" data-input="search"
                   placeholder="🔍 Search users by name, email, role, or phone..." value="${esc(state.search)}">
            <div class="muted-small">
              Showing <strong>${filtered.length}</strong> of ${state.users.length} registered accounts
            </div>
          </div>

          <div class="table-card">${table.html}</div>
          ${modalHtml()}
        </div>`;
    }

    /* ---------- Actions ---------- */

    async function submitForm() {
      const f = state.form;
      try {
        if (state.modal === "create") {
          await VV.api.createUser({
            name: f.name,
            email: f.email,
            password: f.password,
            role: f.role,
            phone: f.phone,
            isActive: f.isActive,
          });
          state.modal = null;
          loadUsers();
          showStatus("success", `User ${f.name} created successfully.`);
        } else {
          const payload = { name: f.name, email: f.email, role: f.role, phone: f.phone, isActive: f.isActive };
          if (f.password && f.password.trim()) {
            payload.password = f.password.trim();
          }
          await VV.api.updateUser(f.id, payload);
          state.modal = null;
          loadUsers();
          showStatus("success", `User ${f.name} updated successfully.`);
        }
      } catch (error) {
        const verb = state.modal === "create" ? "creation" : "update";
        showStatus("error", `User ${verb} failed: ${error.message}`);
      }
    }

    async function deleteUser(user) {
      if (ctx.user && ctx.user.id === user.id) {
        alert("You cannot delete your own active administrator account.");
        return;
      }
      const confirmed = window.confirm(
        `Are you sure you want to delete user account "${user.name}" (${user.email})? This action cannot be undone.`
      );
      if (!confirmed) {
        return;
      }
      try {
        await VV.api.deleteUser(user.id);
        loadUsers();
        showStatus("success", `User "${user.name}" removed successfully.`);
      } catch (error) {
        showStatus("error", `Failed to delete user: ${error.message}`);
      }
    }

    const findUser = (id) => state.users.find((u) => String(u.id) === String(id));

    /* ---------- Events ---------- */

    const view = VV.utils.createView(root, {
      render: template,
      actions: {
        "open-create"() {
          state.form = emptyForm();
          state.modal = "create";
          view.update();
        },
        "edit-user"(target) {
          const u = findUser(target.dataset.id);
          state.form = {
            id: u.id,
            name: u.name,
            email: u.email,
            password: "",
            role: u.role || "SALES_EMPLOYEE",
            phone: u.phone || "",
            isActive: u.isActive !== false,
          };
          state.modal = "edit";
          view.update();
        },
        "delete-user"(target) {
          deleteUser(findUser(target.dataset.id));
        },
        "close-modal"() {
          state.modal = null;
          view.update();
        },
        "table-prev"() {
          state.tablePage = Math.max(state.tablePage - 1, 1);
          view.update();
        },
        "table-next"() {
          state.tablePage += 1;
          view.update();
        },
      },
      inputs: {
        search(value) {
          state.search = value;
          view.update();
        },
        "table-search"(value) {
          state.tableQuery = value;
          state.tablePage = 1;
          view.update();
        },
        /* Form fields only update state - no re-render, so typing is never interrupted. */
        name(value) {
          state.form.name = value;
        },
        email(value) {
          state.form.email = value;
        },
        password(value) {
          state.form.password = value;
        },
        role(value) {
          state.form.role = value;
        },
        phone(value) {
          state.form.phone = value;
        },
        status(value) {
          state.form.isActive = value === "active";
        },
      },
    });

    root.onsubmit = function (event) {
      event.preventDefault();
      submitForm();
    };

    view.update();
    loadUsers();
  }

  return { render };
})();
