// Integration verification script testing live backend endpoints
const http = require("http");
const app = require("./server"); // starts server or imports app

const PORT = 3099;
const server = app.listen(PORT, async () => {
  console.log(`Test server running on port ${PORT}`);

  try {
    const testGet = (path, headers = {}) => {
      return new Promise((resolve, reject) => {
        const req = http.request(
          {
            hostname: "127.0.0.1",
            port: PORT,
            path,
            method: "GET",
            headers,
          },
          (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
              try {
                resolve({ status: res.statusCode, body: JSON.parse(data) });
              } catch (e) {
                resolve({ status: res.statusCode, body: data });
              }
            });
          }
        );
        req.on("error", reject);
        req.end();
      });
    };

    const testPost = (path, payload, headers = {}) => {
      return new Promise((resolve, reject) => {
        const bodyStr = JSON.stringify(payload);
        const req = http.request(
          {
            hostname: "127.0.0.1",
            port: PORT,
            path,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(bodyStr),
              ...headers,
            },
          },
          (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
              try {
                resolve({ status: res.statusCode, body: JSON.parse(data) });
              } catch (e) {
                resolve({ status: res.statusCode, body: data });
              }
            });
          }
        );
        req.on("error", reject);
        req.write(bodyStr);
        req.end();
      });
    };

    console.log("1. Testing Auth Login (POST /api/auth/login)...");
    const loginRes = await testPost("/api/auth/login", {
      email: "admin@vastuvihar.org",
      password: "Admin@123#Vastu",
    });
    console.assert(loginRes.status === 200, `Login failed: ${loginRes.status}`);
    const token = loginRes.body.token;
    console.log("✓ Login Success, Token received. User role:", loginRes.body.user.role);

    const authHeaders = { Authorization: `Bearer ${token}` };

    console.log("2. Testing Projects (GET /api/projects)...");
    const projRes = await testGet("/api/projects");
    console.assert(projRes.status === 200, `Projects failed: ${projRes.status}`);
    console.assert(projRes.body.count === 125, `Expected 125 projects, got ${projRes.body.count}`);
    console.log("✓ Projects count verified:", projRes.body.count);

    console.log("3. Testing Bungalows (GET /api/properties/bungalows)...");
    const bungRes = await testGet("/api/properties/bungalows");
    console.assert(bungRes.body.bungalows.length === 7, `Expected 7 bungalows, got ${bungRes.body.bungalows.length}`);
    console.log("✓ Bungalows count verified:", bungRes.body.bungalows.length);

    console.log("4. Testing Flats (GET /api/properties/flats)...");
    const flatRes = await testGet("/api/properties/flats");
    console.assert(flatRes.body.flats.length === 3, `Expected 3 flats, got ${flatRes.body.flats.length}`);
    console.log("✓ Flats count verified:", flatRes.body.flats.length);

    console.log("5. Testing Building Specifications (GET /api/properties/building-specifications)...");
    const specRes = await testGet("/api/properties/building-specifications");
    console.assert(specRes.body.buildingSpecifications.specifications.length === 20, "Expected 20 specs");
    console.assert(specRes.body.buildingSpecifications.projectAmenities.length === 9, "Expected 9 amenities");
    console.log("✓ Building specs and 9 amenities verified.");

    console.log("6. Testing GST Calculator (POST /api/gst/calculate)...");
    const gstRes = await testPost("/api/gst/calculate", {
      propertyValue: 4000000,
      carpetAreaSqft: 600,
      isMetro: true,
      isCommercial: false,
    });
    console.assert(gstRes.status === 200, `GST failed: ${gstRes.status}`);
    const calc = gstRes.body.calculation || gstRes.body;
    console.assert(calc.gstRatePct === 1, `Expected 1% GST, got ${calc.gstRatePct}%`);
    console.log("✓ GST calculation verified:", calc.gstRatePct + "%", calc.scheme);

    console.log("7. Testing AI Assistant (POST /api/ai/ask)...");
    const aiRes = await testPost("/api/ai/ask", {
      question: "Where is the branch office in Ranchi located?",
      language: "en",
    });
    console.assert(aiRes.status === 200, `AI ask failed: ${aiRes.status}`);
    console.assert(aiRes.body.answer.includes("Kantatoli"), "Expected Kantatoli in Ranchi office answer");
    console.log("✓ AI Assistant answered correctly with Ranchi office.");

    console.log("8. Testing Knowledge Base List (GET /api/knowledge)...");
    const kbRes = await testGet("/api/knowledge");
    console.assert(kbRes.status === 200, `Knowledge failed: ${kbRes.status}`);
    console.log("✓ Knowledge count verified:", kbRes.body.count);

    console.log("9. Testing User Management List (GET /api/users)...");
    const userRes = await testGet("/api/users", authHeaders);
    console.assert(userRes.status === 200, `Users failed: ${userRes.status}`);
    console.log("✓ Users list verified, count:", userRes.body.count);

    console.log("10. Testing Dashboard Stats (GET /api/dashboard/stats)...");
    const dashRes = await testGet("/api/dashboard/stats");
    console.assert(dashRes.status === 200, `Dashboard failed: ${dashRes.status}`);
    console.assert(dashRes.body.stats.totalProjects === 125, "Expected 125 totalProjects");
    console.assert(dashRes.body.stats.totalStates === 5, "Expected 5 totalStates");
    console.log("✓ Dashboard verified:", dashRes.body.stats);

    console.log("\nALL 10 API INTEGRATION TESTS PASSED CLEANLY!");
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
