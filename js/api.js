/* =========================================================
   API CLIENT
   Every request to the backend goes through apiRequest().
   Endpoints are grouped the same way as the backend routes.
========================================================= */

VV.api = {};

/* ---------- Auth token ---------- */

VV.api.getAuthToken = function getAuthToken() {
  return localStorage.getItem(VV.config.STORAGE_TOKEN) || null;
};

VV.api.setAuthToken = function setAuthToken(token) {
  if (token) {
    localStorage.setItem(VV.config.STORAGE_TOKEN, token);
  } else {
    localStorage.removeItem(VV.config.STORAGE_TOKEN);
  }
};

/* ---------- Core request ---------- */

VV.api.request = async function request(endpoint, options = {}) {
  const token = VV.api.getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const baseUrl = VV.config.USE_LOCAL_BACKEND ? "" : VV.config.API_BASE_URL;

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, { ...options, headers });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || `Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Backend server is currently unreachable. Please verify server is running on port 3001."
      );
    }
    throw error;
  }
};

/* Build "?a=1&b=2" from an object, skipping empty values. */
VV.api.queryString = function queryString(params = {}) {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      query.set(key, params[key]);
    }
  });
  const text = query.toString();
  return text ? `?${text}` : "";
};

/* Helper: build fetch options for a JSON request body. */
VV.api.jsonBody = (method, data) => ({ method, body: JSON.stringify(data) });

/* ---------- 1. Auth ---------- */

VV.api.login = (email, password) =>
  VV.api.request("/api/auth/login", VV.api.jsonBody("POST", { email, password }));

VV.api.getMe = () => VV.api.request("/api/auth/me");

/* ---------- 2. AI assistant ---------- */

VV.api.askAssistant = (question, language = "en", conversationId = null) =>
  VV.api.request("/api/ai/ask", VV.api.jsonBody("POST", { question, language, conversationId }));

/* ---------- 3. Projects & geography ---------- */

VV.api.getProjects = (params = {}) =>
  VV.api.request(`/api/projects${VV.api.queryString(params)}`);

VV.api.getProjectDetail = (id) => VV.api.request(`/api/projects/${id}`);
VV.api.getStates = () => VV.api.request("/api/states");

VV.api.getCities = (state) =>
  VV.api.request(`/api/cities${VV.api.queryString({ state })}`);

VV.api.getOffices = () => VV.api.request("/api/offices");

/* ---------- 4. Properties & specifications ---------- */

VV.api.getProperties = (params = {}) =>
  VV.api.request(`/api/properties${VV.api.queryString(params)}`);

VV.api.getBungalows = () => VV.api.request("/api/properties/bungalows");
VV.api.getFlats = () => VV.api.request("/api/properties/flats");
VV.api.getSpecifications = () => VV.api.request("/api/properties/specifications");
VV.api.getBuildingSpecifications = () => VV.api.request("/api/properties/building-specifications");
VV.api.getPropertyDetail = (id) => VV.api.request(`/api/properties/${id}`);

/* ---------- 5. GST ---------- */

VV.api.calculateGst = ({ propertyValue, carpetAreaSqft, isMetro = false, isCommercial = false }) =>
  VV.api.request(
    "/api/gst/calculate",
    VV.api.jsonBody("POST", { propertyValue, carpetAreaSqft, isMetro, isCommercial })
  );

VV.api.getGstRules = () => VV.api.request("/api/gst/rules");
VV.api.getMetroCities = () => VV.api.request("/api/gst/metro-cities");

/* ---------- 6. Documents ---------- */

VV.api.getDocuments = (q) => VV.api.request(`/api/documents${VV.api.queryString({ q })}`);
VV.api.uploadDocument = (data) => VV.api.request("/api/documents/upload", VV.api.jsonBody("POST", data));

/* ---------- 7. AI knowledge training (admin) ---------- */

VV.api.getKnowledge = (q, category) =>
  VV.api.request(`/api/knowledge${VV.api.queryString({ q, category })}`);

VV.api.addKnowledge = (data) => VV.api.request("/api/knowledge", VV.api.jsonBody("POST", data));
VV.api.updateKnowledge = (id, data) => VV.api.request(`/api/knowledge/${id}`, VV.api.jsonBody("PUT", data));
VV.api.deleteKnowledge = (id) => VV.api.request(`/api/knowledge/${id}`, { method: "DELETE" });

/* ---------- 8. Users & access control ---------- */

VV.api.getUsers = () => VV.api.request("/api/users");
VV.api.createUser = (data) => VV.api.request("/api/users", VV.api.jsonBody("POST", data));
VV.api.updateUser = (id, data) => VV.api.request(`/api/users/${id}`, VV.api.jsonBody("PUT", data));
VV.api.deleteUser = (id) => VV.api.request(`/api/users/${id}`, { method: "DELETE" });
VV.api.getEmployees = () => VV.api.request("/api/employees");
VV.api.getRoles = () => VV.api.request("/api/roles");
VV.api.getAuditLogs = (limit = 100) => VV.api.request(`/api/audit?limit=${limit}`);

/* ---------- 9. Dashboard & health ---------- */

VV.api.getDashboardStats = () => VV.api.request("/api/reports/dashboard");
VV.api.checkHealth = () => VV.api.request("/api/health");
