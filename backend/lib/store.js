// Central Data Repository & Store for Vastu Vihar Information & AI Assistant System
// Authoritative Local Knowledge, Projects, Properties, Specifications, and Statutory Data.
// Grounded strictly in official files (Bungalow details, Flat information, Building specs, Locations, Q&A).
// NO external ERP/CRM, NO OpenAI dependency, NO property pricing.

const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;
const HASHED_ADMIN_PW = bcrypt.hashSync("Admin@123#Vastu", SALT_ROUNDS);
const HASHED_SALES_PW = bcrypt.hashSync("Sales@123#Vastu", SALT_ROUNDS);
const HASHED_MANAGER_PW = bcrypt.hashSync("Manager@123#Vastu", SALT_ROUNDS);

class DataStore {
  constructor() {
    this.dataPath = path.resolve(__dirname, "../data");
    this.initialized = false;
    this.init();
  }

  init() {
    if (this.initialized) return;

    // 1. States & Metro Cities
    this.states = [
      { id: "state_br", name: "Bihar", code: "BR" },
      { id: "state_jh", name: "Jharkhand", code: "JH" },
      { id: "state_wb", name: "West Bengal", code: "WB" },
      { id: "state_od", name: "Odisha", code: "OD" },
      { id: "state_up", name: "Uttar Pradesh", code: "UP" }
    ];

    this.metroCities = [
      { id: "metro_patna", cityName: "Patna", stateName: "Bihar", isActive: true },
      { id: "metro_kolkata", cityName: "Kolkata", stateName: "West Bengal", isActive: true }
    ];

    // 2. Load Authoritative Data Files
    this.loadAuthoritativeData();

    // 3. Official GST Rules
    this.gstRules = [
      {
        id: "rule_metro_affordable",
        category: "residential",
        metroApplicable: true,
        maxCarpetAreaSqft: 646,
        maxCarpetAreaSqm: 60,
        maxValueInr: 4500000,
        gstRatePct: 1.0,
        description: "Affordable Housing (Metro - Patna, Kolkata): Carpet Area up to 646 sq.ft. (60 m²) AND Value up to ₹45 Lakhs -> 1% GST."
      },
      {
        id: "rule_nonmetro_affordable",
        category: "residential",
        metroApplicable: false,
        maxCarpetAreaSqft: 969,
        maxCarpetAreaSqm: 90,
        maxValueInr: 4500000,
        gstRatePct: 1.0,
        description: "Affordable Housing (Non-Metro): Carpet Area up to 969 sq.ft. (90 m²) AND Value up to ₹45 Lakhs -> 1% GST."
      },
      {
        id: "rule_standard_residential",
        category: "residential",
        metroApplicable: null,
        maxCarpetAreaSqft: null,
        maxCarpetAreaSqm: null,
        maxValueInr: null,
        gstRatePct: 5.0,
        description: "Standard Residential (Non-Affordable / Luxury): 5% GST without ITC."
      }
    ];

    // 4. System Users & Access Control
    this.users = [
      {
        id: "usr_admin",
        employeeCode: "ADM-000001",
        name: "Deepak Kumar",
        email: "admin@vastuvihar.org",
        passwordHash: HASHED_ADMIN_PW,
        role: "ADMIN",
        phone: "8102921800",
        department: "Executive Management",
        branch: "Corporate Head Office (Patna)",
        city: "Patna",
        isActive: true,
        status: "ACTIVE",
        createdAt: "2026-01-01T00:00:00.000Z"
      },
      {
        id: "usr_sales_patna",
        employeeCode: "EMP-000001",
        name: "Sweta Kumari",
        email: "sales@vastuvihar.org",
        passwordHash: HASHED_SALES_PW,
        role: "SALES_EMPLOYEE",
        phone: "8102921821",
        department: "Customer Information",
        branch: "Fraser Road Branch, Patna",
        city: "Patna",
        isActive: true,
        status: "ACTIVE",
        createdAt: "2026-01-10T00:00:00.000Z"
      },
      {
        id: "usr_mgr_ranchi",
        employeeCode: "EMP-000002",
        name: "Rajiv Ranjan",
        email: "manager@vastuvihar.org",
        passwordHash: HASHED_MANAGER_PW,
        role: "MANAGER",
        phone: "8102921810",
        department: "Branch Operations",
        branch: "Kantatoli Branch, Ranchi",
        city: "Ranchi",
        isActive: true,
        status: "ACTIVE",
        createdAt: "2026-01-15T00:00:00.000Z"
      }
    ];

    // 5. Official Documents Registry
    this.documents = [
      { id: "doc_1", title: "Building Specification - Deluxe vs Luxury", fileName: "BUILDING SPECIFICATION.pdf", fileType: "pdf", fileSize: 89907, uploadedAt: "2026-09-11", category: "Specifications" },
      { id: "doc_2", title: "Office & Site Address Directory (40+ Cities)", fileName: "Location.pdf", fileType: "pdf", fileSize: 93700, uploadedAt: "2026-09-11", category: "Locations" },
      { id: "doc_3", title: "Authoritative Bungalow Details (7 Models)", fileName: "Bungalow details.pdf", fileType: "pdf", fileSize: 70931, uploadedAt: "2026-09-11", category: "Bungalows" },
      { id: "doc_4", title: "Authoritative Flat Details (Nano, Ganga, Adity)", fileName: "Flat Information.pdf", fileType: "pdf", fileSize: 68890, uploadedAt: "2026-09-08", category: "Flats" },
      { id: "doc_5", title: "Zone & Regional Branch Directory", fileName: "ZONE LIST.pdf", fileType: "pdf", fileSize: 48752, uploadedAt: "2026-09-11", category: "Zones" }
    ];

    // 6. In-Memory Conversation & Message Log
    this.conversations = [];
    this.messages = [];
    this.auditLogs = [];

    this.initialized = true;
  }

  loadAuthoritativeData() {
    try {
      this.bungalows = JSON.parse(fs.readFileSync(path.join(this.dataPath, "bungalows.json"), "utf8"));
    } catch (e) {
      this.bungalows = [];
    }

    try {
      this.flats = JSON.parse(fs.readFileSync(path.join(this.dataPath, "flats.json"), "utf8"));
    } catch (e) {
      this.flats = [];
    }

    try {
      this.buildingSpecs = JSON.parse(fs.readFileSync(path.join(this.dataPath, "buildingSpecifications.json"), "utf8"));
    } catch (e) {
      this.buildingSpecs = { specifications: [], structuralData: [], ironRodDetails: [], materials: [], projectAmenities: [] };
    }

    try {
      const locData = JSON.parse(fs.readFileSync(path.join(this.dataPath, "locations.json"), "utf8"));
      this.projects = locData.projects || [];
      this.offices = locData.offices || [];
    } catch (e) {
      this.projects = [];
      this.offices = [];
    }

    try {
      this.knowledge = JSON.parse(fs.readFileSync(path.join(this.dataPath, "knowledge.json"), "utf8"));
    } catch (e) {
      this.knowledge = [];
    }
  }

  getDashboardStats() {
    const running = this.projects.filter((p) => p.status === "Running").length;
    const completed = this.projects.filter((p) => p.status === "Completed").length;
    return {
      totalProjects: this.projects.length,
      activeProjects: running,
      completedProjects: completed,
      totalOffices: this.offices.length,
      totalStates: this.states.length,
      bungalowModels: this.bungalows.length,
      flatModels: this.flats.length,
      knowledgeCount: this.knowledge.length,
      usersCount: this.users.length,
      timestamp: new Date().toISOString()
    };
  }

  calculateGST(args) {
    return this.calculateGst(args);
  }

  // ----------------------------------------------------
  // Projects & Locations (Requirements 10, 11, 12)
  // ----------------------------------------------------

  getStates() {
    return this.states;
  }

  getCities(state = null) {
    let cities = [...new Set(this.projects.map((p) => p.city))].sort();
    if (state && state !== "ALL") {
      cities = [...new Set(this.projects.filter((p) => p.state?.toLowerCase() === state.toLowerCase()).map((p) => p.city))].sort();
    }
    return cities;
  }

  getOffices(q = null) {
    let list = [...this.offices];
    if (q) {
      const term = q.toLowerCase();
      list = list.filter((o) => o.city.toLowerCase().includes(term) || o.officeAddress.toLowerCase().includes(term));
    }
    return list;
  }

  getOfficeAddress(city) {
    if (!city) return null;
    return this.offices.find((o) => o.city.toLowerCase() === city.toLowerCase().trim()) || null;
  }

  getProjects({ state, city, status, phase, q } = {}) {
    let list = [...this.projects];

    if (state && state !== "ALL") {
      list = list.filter((p) => p.state?.toLowerCase() === state.toLowerCase().trim());
    }

    if (city && city !== "ALL") {
      list = list.filter((p) => p.city?.toLowerCase() === city.toLowerCase().trim());
    }

    if (status && status !== "ALL") {
      const s = status.toLowerCase().trim();
      list = list.filter((p) => p.status?.toLowerCase() === s);
    }

    if (phase) {
      const ph = phase.toLowerCase().trim();
      list = list.filter((p) => p.phase?.toLowerCase().includes(ph));
    }

    if (q) {
      const term = q.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.projectName?.toLowerCase().includes(term) ||
          p.city?.toLowerCase().includes(term) ||
          p.state?.toLowerCase().includes(term) ||
          p.siteAddress?.toLowerCase().includes(term) ||
          (p.nearbyLocation && p.nearbyLocation.toLowerCase().includes(term))
      );
    }

    return list;
  }

  getProjectById(id) {
    return this.projects.find((p) => p.id === id) || null;
  }

  getProjectAddress(city, phase) {
    if (!city) return null;
    const cityProjects = this.projects.filter((p) => p.city.toLowerCase() === city.toLowerCase().trim());
    if (phase) {
      const ph = phase.toLowerCase().replace(/[^a-z0-9]/g, "");
      const found = cityProjects.find((p) => p.phase.toLowerCase().replace(/[^a-z0-9]/g, "").includes(ph));
      if (found) return found;
    }
    return cityProjects[0] || null;
  }

  // ----------------------------------------------------
  // Properties & Models (Requirements 4, 5, 13)
  // ----------------------------------------------------

  getBungalows() {
    return this.bungalows;
  }

  getFlats() {
    return this.flats;
  }

  getProperties({ propertyType, bhk, q } = {}) {
    let all = [
      ...this.bungalows.map((b) => ({ ...b, type: "Bungalow" })),
      ...this.flats.map((f) => ({ ...f, type: "Flat" }))
    ];

    if (propertyType && propertyType !== "ALL") {
      all = all.filter((p) => p.type.toLowerCase() === propertyType.toLowerCase());
    }

    if (bhk) {
      all = all.filter((p) => p.bhk === Number(bhk));
    }

    if (q) {
      const term = q.toLowerCase();
      all = all.filter(
        (p) =>
          p.modelName.toLowerCase().includes(term) ||
          p.fullName.toLowerCase().includes(term) ||
          (p.configuration && p.configuration.toLowerCase().includes(term))
      );
    }

    return all;
  }

  getPropertyById(id) {
    return (
      this.bungalows.find((b) => b.id === id) ||
      this.flats.find((f) => f.id === id) ||
      null
    );
  }

  // ----------------------------------------------------
  // Building Specifications (Requirement 14)
  // ----------------------------------------------------

  getBuildingSpecifications() {
    return this.buildingSpecs;
  }

  getSpecifications() {
    return (this.buildingSpecs.specifications || []).map((s, idx) => ({
      id: `spec_${idx + 1}`,
      item: s.particular,
      deluxe: s.deluxe,
      luxury: s.luxury,
      category: s.category || "General"
    }));
  }

  // ----------------------------------------------------
  // Statutory GST Calculator (Requirement 9)
  // ----------------------------------------------------

  getGstRules() {
    return this.gstRules;
  }

  calculateGst({ propertyValue, carpetAreaSqft, isMetro = false, isCommercial = false }) {
    const val = Number(propertyValue) || 0;
    const areaSqft = Number(carpetAreaSqft) || 0;
    const areaSqm = Math.round((areaSqft / 10.7639) * 10) / 10;

    let gstRate = 5.0;
    let scheme = "Standard Housing";
    let explanation = "";

    if (isCommercial) {
      gstRate = 5.0;
      scheme = "Commercial Property";
      explanation = "Commercial properties attract 5% GST without Input Tax Credit (ITC).";
    } else {
      // Metro: <= 646 sq.ft. (60 m²) AND <= 45 Lakhs -> 1% GST
      // Non-Metro: <= 969 sq.ft. (90 m²) AND <= 45 Lakhs -> 1% GST
      const maxArea = isMetro ? 646 : 969;
      const maxValue = 4500000;

      const isAreaAffordable = areaSqft <= maxArea;
      const isValueAffordable = val <= maxValue;

      if (isAreaAffordable && isValueAffordable) {
        gstRate = 1.0;
        scheme = "Affordable Housing Scheme";
        explanation = `Qualifies for Affordable Housing (1% GST without ITC). Both conditions met: Carpet area ${areaSqft} sq.ft. ≤ ${maxArea} sq.ft. (${isMetro ? "Metro" : "Non-Metro"}) and Property Value ₹${val.toLocaleString("en-IN")} ≤ ₹45,00,000.`;
      } else {
        gstRate = 5.0;
        scheme = "Standard Residential Housing";
        if (!isAreaAffordable && !isValueAffordable) {
          explanation = `Standard 5% GST applies: Carpet area (${areaSqft} sq.ft.) exceeds the ${maxArea} sq.ft. limit for ${isMetro ? "Metro" : "Non-Metro"} AND property value exceeds ₹45 Lakhs.`;
        } else if (!isAreaAffordable) {
          explanation = `Standard 5% GST applies: Carpet area (${areaSqft} sq.ft.) exceeds the maximum affordable limit of ${maxArea} sq.ft. (${isMetro ? "Metro threshold: 646 sq.ft." : "Non-Metro threshold: 969 sq.ft."}).`;
        } else {
          explanation = `Standard 5% GST applies: Property value (₹${val.toLocaleString("en-IN")}) exceeds the ₹45,00,000 statutory limit for affordable housing.`;
        }
      }
    }

    const gstAmount = Math.round((val * gstRate) / 100);
    const totalAmount = val + gstAmount;

    return {
      propertyValue: val,
      carpetAreaSqft: areaSqft,
      carpetAreaSqm: areaSqm,
      isMetro: Boolean(isMetro),
      isCommercial: Boolean(isCommercial),
      gstRatePct: gstRate,
      gstAmount,
      totalAmount,
      scheme,
      explanation
    };
  }

  // ----------------------------------------------------
  // Admin AI Knowledge Base (Requirement 15)
  // ----------------------------------------------------

  getKnowledge(q = null, category = null) {
    let list = [...this.knowledge];
    if (category && category !== "ALL") {
      list = list.filter((k) => k.category?.toLowerCase() === category.toLowerCase().trim());
    }
    if (q) {
      const term = q.toLowerCase().trim();
      list = list.filter(
        (k) =>
          k.question?.toLowerCase().includes(term) ||
          k.answer?.toLowerCase().includes(term) ||
          k.title?.toLowerCase().includes(term) ||
          (k.keywords || []).some((kw) => kw.toLowerCase().includes(term))
      );
    }
    return list;
  }

  getKnowledgeById(id) {
    return this.knowledge.find((k) => k.id === id) || null;
  }

  addKnowledgeEntry(entry, user = null) {
    if (!entry.question || !entry.answer) {
      throw new Error("Both question and answer are required.");
    }

    const newEntry = {
      id: `kb_${uuidv4().slice(0, 8)}`,
      category: entry.category || "General",
      title: entry.title || entry.question.slice(0, 50),
      question: entry.question.trim(),
      answer: entry.answer.trim(),
      source: entry.source || "Official Vastu Vihar Data",
      keywords: Array.isArray(entry.keywords)
        ? entry.keywords
        : typeof entry.keywords === "string"
        ? entry.keywords.split(",").map((k) => k.trim()).filter(Boolean)
        : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.knowledge.unshift(newEntry);
    this.persistKnowledge();

    this.logAudit({
      userId: user?.id,
      action: "ADD_KNOWLEDGE_ENTRY",
      entity: "KnowledgeEntry",
      entityId: newEntry.id,
      metadata: { title: newEntry.title, category: newEntry.category }
    });

    return newEntry;
  }

  updateKnowledgeEntry(id, updates, user = null) {
    const item = this.knowledge.find((k) => k.id === id);
    if (!item) return null;

    if (updates.question !== undefined) item.question = updates.question.trim();
    if (updates.answer !== undefined) item.answer = updates.answer.trim();
    if (updates.title !== undefined) item.title = updates.title.trim();
    if (updates.category !== undefined) item.category = updates.category;
    if (updates.source !== undefined) item.source = updates.source;
    if (updates.keywords !== undefined) {
      item.keywords = Array.isArray(updates.keywords)
        ? updates.keywords
        : typeof updates.keywords === "string"
        ? updates.keywords.split(",").map((k) => k.trim()).filter(Boolean)
        : item.keywords;
    }
    item.updatedAt = new Date().toISOString();

    this.persistKnowledge();

    this.logAudit({
      userId: user?.id,
      action: "UPDATE_KNOWLEDGE_ENTRY",
      entity: "KnowledgeEntry",
      entityId: id,
      metadata: { updates }
    });

    return item;
  }

  deleteKnowledgeEntry(id, user = null) {
    const idx = this.knowledge.findIndex((k) => k.id === id);
    if (idx === -1) return false;

    this.knowledge.splice(idx, 1);
    this.persistKnowledge();

    this.logAudit({
      userId: user?.id,
      action: "DELETE_KNOWLEDGE_ENTRY",
      entity: "KnowledgeEntry",
      entityId: id
    });

    return true;
  }

  persistKnowledge() {
    try {
      fs.writeFileSync(path.join(this.dataPath, "knowledge.json"), JSON.stringify(this.knowledge, null, 2), "utf8");
    } catch (e) {
      console.error("Failed to persist knowledge.json:", e);
    }
  }

  // ----------------------------------------------------
  // User Management & RBAC (Requirement 16)
  // ----------------------------------------------------

  getUsers() {
    return this.users.map(({ passwordHash, ...safeUser }) => safeUser);
  }

  getUserById(id) {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  getUserByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase().trim()) || null;
  }

  createUser(data, creator = null) {
    if (!data.name || !data.name.trim()) {
      throw new Error("Full Name is required.");
    }
    if (!data.email || !data.email.trim()) {
      throw new Error("Email Address is required.");
    }
    if (!data.password || data.password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const existing = this.getUserByEmail(data.email);
    if (existing) {
      throw new Error(`A user with email '${data.email}' already exists.`);
    }

    const passwordHash = bcrypt.hashSync(data.password, SALT_ROUNDS);
    const employeeCode = data.role === "ADMIN" ? `ADM-${String(this.users.length + 1).padStart(6, "0")}` : `EMP-${String(this.users.length + 1).padStart(6, "0")}`;

    const newUser = {
      id: `usr_${uuidv4().slice(0, 8)}`,
      employeeCode,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      passwordHash,
      role: data.role || "SALES_EMPLOYEE",
      phone: data.phone || "",
      department: data.department || (data.role === "ADMIN" ? "Executive Management" : "Customer Services"),
      branch: data.branch || "Corporate Head Office (Patna)",
      city: data.city || "Patna",
      isActive: data.isActive !== false && data.status !== "INACTIVE",
      status: data.isActive !== false && data.status !== "INACTIVE" ? "ACTIVE" : "INACTIVE",
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);

    this.logAudit({
      userId: creator?.id,
      action: "CREATE_USER",
      entity: "User",
      entityId: newUser.id,
      metadata: { email: newUser.email, role: newUser.role }
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  }

  updateUser(id, data, modifier = null) {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;

    if (data.name && data.name.trim()) user.name = data.name.trim();
    if (data.email && data.email.trim()) {
      const emailLower = data.email.toLowerCase().trim();
      const duplicate = this.users.find((u) => u.id !== id && u.email.toLowerCase() === emailLower);
      if (duplicate) {
        throw new Error(`Another user with email '${data.email}' already exists.`);
      }
      user.email = emailLower;
    }
    if (data.role) user.role = data.role;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.department) user.department = data.department;
    if (data.branch) user.branch = data.branch;
    if (data.city) user.city = data.city;
    if (data.password && data.password.trim().length >= 6) {
      user.passwordHash = bcrypt.hashSync(data.password.trim(), SALT_ROUNDS);
    }
    if (data.isActive !== undefined) {
      user.isActive = Boolean(data.isActive);
      user.status = user.isActive ? "ACTIVE" : "INACTIVE";
    }

    user.updatedAt = new Date().toISOString();

    this.logAudit({
      userId: modifier?.id,
      action: "UPDATE_USER",
      entity: "User",
      entityId: id,
      metadata: { email: user.email, role: user.role }
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  deleteUser(id, modifier = null) {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;

    // Prevent deleting primary admin
    if (this.users[idx].email === "admin@vastuvihar.org") {
      throw new Error("The default system administrator account cannot be deleted.");
    }

    const removed = this.users.splice(idx, 1)[0];

    this.logAudit({
      userId: modifier?.id,
      action: "DELETE_USER",
      entity: "User",
      entityId: id,
      metadata: { email: removed.email }
    });

    return true;
  }

  getEmployees() {
    return this.users.map(({ passwordHash, ...u }) => ({
      id: u.id,
      employeeCode: u.employeeCode,
      name: u.name,
      role: u.role,
      department: u.department,
      branch: u.branch,
      phone: u.phone,
      status: u.status
    }));
  }

  // ----------------------------------------------------
  // Documents
  // ----------------------------------------------------

  getDocuments(q = null) {
    let list = [...this.documents];
    if (q) {
      const term = q.toLowerCase();
      list = list.filter((d) => d.title.toLowerCase().includes(term) || d.fileName.toLowerCase().includes(term));
    }
    return list;
  }

  addDocument(doc, user = null) {
    const newDoc = {
      id: `doc_${uuidv4().slice(0, 8)}`,
      uploadedAt: new Date().toISOString().split("T")[0],
      uploadedBy: user?.name || "Admin",
      ...doc
    };
    this.documents.unshift(newDoc);
    return newDoc;
  }

  // ----------------------------------------------------
  // Conversations & Audit
  // ----------------------------------------------------

  getAiConversations(userId = null) {
    return this.conversations;
  }

  createAiConversation(userId = null, title = "New Inquiry", language = "en") {
    const conv = {
      id: `conv_${uuidv4().slice(0, 8)}`,
      userId,
      title,
      language,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.conversations.unshift(conv);
    return conv;
  }

  getAiMessages(conversationId) {
    return this.messages.filter((m) => m.conversationId === conversationId);
  }

  addAiMessage(conversationId, sender, content) {
    const msg = {
      id: `msg_${uuidv4().slice(0, 8)}`,
      conversationId,
      sender,
      content,
      createdAt: new Date().toISOString()
    };
    this.messages.push(msg);
    return msg;
  }

  logAudit(entry) {
    this.auditLogs.unshift({
      id: `audit_${uuidv4().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      ...entry
    });
  }

  getAuditLogs() {
    return this.auditLogs.slice(0, 100);
  }
}

module.exports = new DataStore();
