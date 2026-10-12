/* Original backend file: backend/server.js  (unchanged, registered for the browser) */
VVServer.define("server.js", function (require, module, exports, __dirname) {

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { authenticateToken } = require("./middleware/auth");

// Authoritative Routes
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");
const projectsRoutes = require("./routes/projects");
const propertiesRoutes = require("./routes/properties");
const siteVisitsRoutes = require("./routes/siteVisits");
const bookingsRoutes = require("./routes/bookings");
const gstRoutes = require("./routes/gst");
const documentsRoutes = require("./routes/documents");
const knowledgeRoutes = require("./routes/knowledge");
const usersRoutes = require("./routes/users");
const reportsRoutes = require("./routes/reports");
const auditRoutes = require("./routes/audit");

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Security Headers & CORS
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));

// 2. Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 3. Rate Limiting for auth & general endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: "Too many requests from this IP. Please try again later." },
});
app.use("/api/", apiLimiter);

// 4. Global Auth Token Context
app.use(authenticateToken);

// 5. Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Vastu Vihar Enterprise Information & AI Assistant",
    version: "2.0.0",
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// 6. API Route Modules
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", aiRoutes); // backwards compatibility for POST /api/ask and /api/history

app.use("/api/projects", projectsRoutes);
app.use("/api/states", (req, res) => res.json({ states: require("./lib/store").getStates() }));
app.use("/api/cities", (req, res) => res.json({ cities: require("./lib/store").getCities(req.query.state) }));
app.use("/api/offices", (req, res) => res.json({ offices: require("./lib/store").getOffices(req.query.q) }));

app.use("/api/properties", propertiesRoutes);
app.use("/api/bungalows", (req, res) => res.json({ bungalows: require("./lib/store").getBungalows() }));
app.use("/api/flats", (req, res) => res.json({ flats: require("./lib/store").getFlats() }));
app.use("/api/specifications", (req, res) => res.json({ specifications: require("./lib/store").getSpecifications() }));
app.use("/api/building-specifications", (req, res) => res.json({ buildingSpecifications: require("./lib/store").getBuildingSpecifications() }));

app.use("/api/site-visits", siteVisitsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/gst", gstRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/employees", (req, res) => res.json({ employees: require("./lib/store").getEmployees() }));
app.use("/api/roles", (req, res) => res.json({
  roles: [
    { id: "role_admin", name: "ADMIN", description: "Full system administration, knowledge configuration, and user management" },
    { id: "role_sales", name: "SALES_EMPLOYEE", description: "Customer inquiries, project locations, and specifications lookup" },
    { id: "role_manager", name: "MANAGER", description: "Branch operations and project directory supervision" }
  ]
}));
app.use("/api/reports", reportsRoutes);
app.use("/api/dashboard", reportsRoutes);
app.use("/api/audit", auditRoutes);

// 7. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: `API route '${req.method} ${req.originalUrl}' not found.`,
  });
});

// 8. Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "An internal error occurred on the Vastu Vihar backend.",
  });
});

// Start Server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Vastu Vihar Information & AI Assistant Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;

});
