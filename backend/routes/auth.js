// Authentication Routes
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const store = require("../lib/store");
const { JWT_SECRET, requireAuth } = require("../middleware/auth");

// POST /api/auth/login
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = store.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Verify password
    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, employeeCode: user.employeeCode },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    store.logAudit({
      userId: user.id,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    const { passwordHash, ...safeUser } = user;
    res.json({
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error during authentication." });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  if (req.user) {
    store.logAudit({
      userId: req.user.id,
      action: "LOGOUT",
      entity: "User",
      entityId: req.user.id,
    });
  }
  res.json({ message: "Successfully logged out." });
});

module.exports = router;
