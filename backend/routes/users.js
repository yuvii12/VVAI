// Users, Roles & Access Control Routes
const express = require("express");
const router = express.Router();
const store = require("../lib/store");
const { requireAuth, requireRole } = require("../middleware/auth");

// GET /api/users (Admin only)
router.get(["/", "/users"], requireAuth, requireRole("ADMIN"), (req, res) => {
  res.json({ users: store.getUsers() });
});

// POST /api/users (Admin only - Create User)
router.post(["/", "/users"], requireAuth, requireRole("ADMIN"), (req, res) => {
  try {
    const user = store.createUser(req.body, req.user);
    res.status(201).json({ message: "User created successfully.", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/users/:id (Admin only - Edit User)
router.put(["/:id", "/users/:id"], requireAuth, requireRole("ADMIN"), (req, res) => {
  try {
    const user = store.updateUser(req.params.id, req.body, req.user);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ message: "User updated successfully.", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/users/:id (Admin only - Delete User)
router.delete(["/:id", "/users/:id"], requireAuth, requireRole("ADMIN"), (req, res) => {
  try {
    const deleted = store.deleteUser(req.params.id, req.user);
    if (!deleted) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ message: "User deleted successfully." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/employees
router.get("/employees", requireAuth, (req, res) => {
  res.json({ employees: store.getEmployees() });
});

// GET /api/roles
router.get("/roles", requireAuth, (req, res) => {
  res.json({
    roles: [
      { id: "role_admin", name: "ADMIN", description: "Full system administration, knowledge configuration, and user management" },
      { id: "role_sales", name: "SALES_EMPLOYEE", description: "Customer inquiries, project locations, and specifications lookup" },
      { id: "role_manager", name: "MANAGER", description: "Branch operations and project directory supervision" }
    ]
  });
});

module.exports = router;
