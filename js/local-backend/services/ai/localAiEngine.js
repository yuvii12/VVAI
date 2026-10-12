/* Original backend file: backend/services/ai/localAiEngine.js  (unchanged, registered for the browser) */
VVServer.define("services/ai/localAiEngine.js", function (require, module, exports, __dirname) {

// Authoritative Local AI Search & Knowledge Engine for Vastu Vihar
// Self-contained, deterministic retrieval from official data files:
// - bungalows.json
// - flats.json
// - buildingSpecifications.json
// - locations.json
// - knowledge.json
// NO external AI APIs, NO hallucinations, NO pricing exposure, NO ERP/CRM dependencies.

const fs = require("fs");
const path = require("path");

class LocalAiEngine {
  constructor() {
    this.dataPath = path.resolve(__dirname, "../../data");
    this.loadData();
  }

  loadData() {
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

  // Reload dynamically when admin adds knowledge
  reloadKnowledge() {
    try {
      this.knowledge = JSON.parse(fs.readFileSync(path.join(this.dataPath, "knowledge.json"), "utf8"));
    } catch (e) {
      // ignore
    }
  }

  processQuery(rawQuery, language = "en") {
    this.reloadKnowledge();
    if (!rawQuery || typeof rawQuery !== "string" || !rawQuery.trim()) {
      return {
        answer: "Please ask a question about Vastu Vihar projects, bungalows, flats, specifications, locations, GST, RERA, or home loan documents.",
        type: "general",
        sources: []
      };
    }

    const q = rawQuery.trim();
    const qLower = q.toLowerCase();

    // 1. Guardrail: PROPERTY PRICING (Requirement 6)
    const isAskingPrice = (
      /\b(price|pricing|cost|costing|rate|rates|how\s*much|budget|amount|selling\s*price|daam|kimat|keemat|kitne\s*ka\s*hai|kitna\s*paisa)\b/i.test(qLower) &&
      !qLower.includes("gst") &&
      !qLower.includes("calculation") &&
      !qLower.includes("formula")
    );
    if (isAskingPrice) {
      return {
        answer: "Property pricing information is not exposed in this application. For official property pricing and booking terms, please contact the respective Vastu Vihar branch office directly.",
        type: "pricing_policy",
        sources: [{ title: "Official Vastu Vihar Policy", category: "Policy" }]
      };
    }

    // 2. Guardrail: AVAILABILITY / VACANT UNITS (Requirement 8)
    const isAskingAvailability = /\b(vacant|availability|available\s*units|khali|inventory|available\s*flats|available\s*bungalows)\b/i.test(qLower);
    if (isAskingAvailability) {
      return {
        answer: "Live unit availability and vacant unit lists are not displayed in this version of the application. Please contact your nearest Vastu Vihar project site or branch office for current unit allocations.",
        type: "availability_policy",
        sources: [{ title: "Official Vastu Vihar Policy", category: "Policy" }]
      };
    }

    // 3. DETERMINISTIC EXACT PROPERTY MATCHING (Requirement 4 & 5)
    const propertyMatch = this.matchProperty(qLower);
    if (propertyMatch) {
      return this.handlePropertyQuery(propertyMatch, qLower);
    }

    // Check if user is asking about an unknown property (e.g., "Lotus bungalow", "Rose flat")
    const genericPropertyMatch = qLower.match(/\b([a-z0-9_-]+)\s*(?:bungalow|banglow|bangalo|flat|apartment|villa|model)\b/i);
    if (genericPropertyMatch) {
      const candidate = genericPropertyMatch[1].toLowerCase();
      const knownNames = ["yamuna", "business", "ananta", "jayanti", "ceo", "godawari", "godavari", "kaveri", "caveri", "nano", "ganga", "adity", "aditi"];
      if (!knownNames.includes(candidate)) {
        return {
          answer: `The provided Vastu Vihar data does not contain information for "${candidate}".\n\nOfficial Vastu Vihar models include:\n- Bungalows: Yamuna (5 BHK), Business (2 BHK), Ananta (3 BHK), Jayanti (3 BHK), CEO (5 BHK), Godawari (3 BHK), Kaveri (4 BHK)\n- Flats: Nano (1 BHK), Ganga (2 BHK), Adity (3 BHK)`,
          type: "property_not_found",
          sources: []
        };
      }
    }

    // 4. BUILDING SPECIFICATIONS & AMENITIES (Requirement 14)
    if (
      qLower.includes("building spec") ||
      qLower.includes("building specification") ||
      qLower.includes("deluxe") ||
      qLower.includes("luxury") ||
      qLower.includes("construction material") ||
      qLower.includes("iron rod") ||
      qLower.includes("cement") ||
      qLower.includes("red bricks") ||
      qLower.includes("bricks") ||
      qLower.includes("sariya") ||
      qLower.includes("plinth") ||
      qLower.includes("foundation") ||
      qLower.includes("pile cap") ||
      qLower.includes("amenities") ||
      qLower.includes("amenity") ||
      qLower.includes("swimming pool") && !propertyMatch ||
      qLower.includes("temple") ||
      qLower.includes("mandir")
    ) {
      return this.handleBuildingSpecsQuery(qLower);
    }

    // 5. STATUTORY & FINANCIAL: GST, RERA, REGISTRY, MVR, HOME LOAN
    const statutoryMatch = this.matchStatutoryKnowledge(qLower);
    if (statutoryMatch) {
      return statutoryMatch;
    }

    // 6. LOCATION / PROJECT SEARCH (Requirement 10, 11, 12)
    const locationResult = this.handleLocationQuery(qLower, q);
    if (locationResult) {
      return locationResult;
    }

    // 7. GENERAL KNOWLEDGE BASE SEARCH (from knowledge.json including admin added knowledge)
    const kbResult = this.searchKnowledgeBase(qLower);
    if (kbResult) {
      return kbResult;
    }

    // 8. STRICT FALLBACK (Requirement 3 & 21)
    return {
      answer: "The provided Vastu Vihar data does not contain that information. You can ask about our official bungalows (Yamuna, Business, Ananta, Jayanti, CEO, Godawari, Kaveri), flats (Nano, Ganga, Adity), project locations across Bihar/Jharkhand/WB/UP/Odisha, building specifications, statutory GST rules, RERA, Registry, MVR, or home loan documents.",
      type: "not_found",
      sources: []
    };
  }

  // ----------------------------------------------------------------------
  // Property Matching & Response Formatting
  // ----------------------------------------------------------------------
  matchProperty(qLower) {
    // Exact bungalow matching
    if (/\byamuna\b/.test(qLower)) return { type: "bungalow", item: this.bungalows.find(b => b.id === "bungalow_yamuna") };
    if (/\bbusiness\b/.test(qLower)) return { type: "bungalow", item: this.bungalows.find(b => b.id === "bungalow_business") };
    if (/\bananta\b/.test(qLower)) return { type: "bungalow", item: this.bungalows.find(b => b.id === "bungalow_ananta") };
    if (/\bjayanti\b/.test(qLower)) return { type: "bungalow", item: this.bungalows.find(b => b.id === "bungalow_jayanti") };
    if (/\bceo\b/.test(qLower)) return { type: "bungalow", item: this.bungalows.find(b => b.id === "bungalow_ceo") };
    if (/\b(godawari|godavari)\b/.test(qLower)) return { type: "bungalow", item: this.bungalows.find(b => b.id === "bungalow_godawari") };
    if (/\b(kaveri|caveri)\b/.test(qLower)) return { type: "bungalow", item: this.bungalows.find(b => b.id === "bungalow_kaveri") };

    // Exact flat matching
    if (/\bnano\b/.test(qLower) || /\b1\s*bhk\s*flat\b/.test(qLower)) return { type: "flat", item: this.flats.find(f => f.id === "flat_nano") };
    if (/\bganga\b/.test(qLower) || /\b2\s*bhk\s*flat\b/.test(qLower)) return { type: "flat", item: this.flats.find(f => f.id === "flat_ganga") };
    if (/\b(adity|aditi)\b/.test(qLower) || /\b3\s*bhk\s*flat\b/.test(qLower)) return { type: "flat", item: this.flats.find(f => f.id === "flat_adity") };

    return null;
  }

  handlePropertyQuery(match, qLower) {
    const { type, item } = match;

    // Specific attribute queries
    const isAskingCarpet = /\b(carpet\s*area|carpet|carpet\s*size)\b/.test(qLower);
    const isAskingBuiltUp = /\b(built\s*up|builtup|built-up)\b/.test(qLower);
    const isAskingPlot = /\b(plot\s*area|plot\s*size|plot|land\s*area)\b/.test(qLower);
    const isAskingSuperBuiltUp = /\b(super\s*built\s*up|super\s*builtup)\b/.test(qLower);
    const isAskingDimensions = /\b(dimension|dimensions|room\s*size|rooms|size)\b/.test(qLower);

    if (type === "bungalow") {
      if (isAskingCarpet) {
        return {
          answer: `**${item.fullName}**\n- **Carpet Area:** ${item.carpetArea} (${item.carpetAreaSqft} sq.ft.)\n- **Built-up Area:** ${item.builtUpArea}\n- **Plot Area:** ${item.plotArea}\n- **Configuration:** ${item.configuration}`,
          type: "property_detail",
          property: item,
          sources: [{ title: `Bungalow Details (${item.modelName})`, category: "Bungalows" }]
        };
      }
      if (isAskingBuiltUp) {
        return {
          answer: `**${item.fullName}**\n- **Built-up Area:** ${item.builtUpArea} (${item.builtUpAreaSqft} sq.ft.)\n- **Carpet Area:** ${item.carpetArea}\n- **Plot Area:** ${item.plotArea}\n- **Configuration:** ${item.configuration}`,
          type: "property_detail",
          property: item,
          sources: [{ title: `Bungalow Details (${item.modelName})`, category: "Bungalows" }]
        };
      }
      if (isAskingPlot) {
        return {
          answer: `**${item.fullName}**\n- **Plot Area / Land Area:** ${item.plotArea}\n- **Plot Dimensions:** ${item.plotSize}\n- **Built-up Area:** ${item.builtUpArea}\n- **Carpet Area:** ${item.carpetArea}`,
          type: "property_detail",
          property: item,
          sources: [{ title: `Bungalow Details (${item.modelName})`, category: "Bungalows" }]
        };
      }

      // Comprehensive structured bungalow profile (Requirement 19)
      let resp = `### ${item.fullName}\n\n`;
      resp += `**Configuration:** ${item.configuration}\n`;
      resp += `**BHK:** ${item.bhk} BHK | **Floors:** ${item.floors}\n`;
      if (item.meaning) resp += `**Theme:** ${item.meaning}\n`;
      resp += `\n**Area & Dimensions:**\n`;
      resp += `- **Plot Size:** ${item.plotSize}\n`;
      resp += `- **Plot Area:** ${item.plotArea}\n`;
      resp += `- **Built-up Area:** ${item.builtUpArea}\n`;
      resp += `- **Carpet Area:** ${item.carpetArea}\n`;

      if (item.setbacks) {
        resp += `\n**Setbacks:** Front: ${item.setbacks.front || "N/A"} | Rear: ${item.setbacks.rear || "N/A"} | Left: ${item.setbacks.sideLeft || "N/A"} | Right: ${item.setbacks.sideRight || "N/A"}\n`;
      }

      resp += `\n**Room-wise Specifications:**\n`;
      item.roomSpecifications.forEach(r => {
        resp += `- **${r.floor} — ${r.space}:** ${r.dimensions}${r.remarks ? ` (${r.remarks})` : ""}\n`;
      });

      if (item.amenities && item.amenities.length > 0) {
        resp += `\n**Amenities & Special Features:**\n`;
        item.amenities.forEach(a => {
          resp += `- ${a}\n`;
        });
      }

      return {
        answer: resp,
        type: "property_profile",
        property: item,
        sources: [{ title: `Official Bungalow Summary: ${item.modelName}`, category: "Bungalows" }]
      };
    }

    if (type === "flat") {
      if (isAskingCarpet) {
        return {
          answer: `**${item.fullName}**\n- **Carpet Area:** ${item.carpetArea} (${item.carpetAreaSqft} sq.ft.)\n- **Built-up Area:** ${item.builtUpArea}\n- **Super Built-up Area:** ${item.superBuiltUpArea}\n- **Configuration:** ${item.configuration}`,
          type: "property_detail",
          property: item,
          sources: [{ title: `Flat Information (${item.modelName})`, category: "Flats" }]
        };
      }
      if (isAskingBuiltUp) {
        return {
          answer: `**${item.fullName}**\n- **Built-up Area:** ${item.builtUpArea} (${item.builtUpAreaSqft} sq.ft.)\n- **Super Built-up Area:** ${item.superBuiltUpArea}\n- **Carpet Area:** ${item.carpetArea}\n- **Configuration:** ${item.configuration}`,
          type: "property_detail",
          property: item,
          sources: [{ title: `Flat Information (${item.modelName})`, category: "Flats" }]
        };
      }
      if (isAskingSuperBuiltUp) {
        return {
          answer: `**${item.fullName}**\n- **Super Built-up Area:** ${item.superBuiltUpArea} (${item.superBuiltUpAreaSqft} sq.ft.)\n- **Built-up Area:** ${item.builtUpArea}\n- **Carpet Area:** ${item.carpetArea}`,
          type: "property_detail",
          property: item,
          sources: [{ title: `Flat Information (${item.modelName})`, category: "Flats" }]
        };
      }

      // Comprehensive flat profile
      let resp = `### ${item.fullName}\n\n`;
      resp += `**Configuration:** ${item.configuration} (${item.bhk} BHK)\n`;
      resp += `\n**Area Breakdown:**\n`;
      resp += `- **Super Built-up Area:** ${item.superBuiltUpArea}\n`;
      resp += `- **Built-up Area:** ${item.builtUpArea}\n`;
      resp += `- **Carpet Area:** ${item.carpetArea}\n`;

      resp += `\n**Room Dimensions:**\n`;
      item.roomSpecifications.forEach(r => {
        resp += `- **${r.space}:** ${r.dimensions}${r.remarks ? ` (${r.remarks})` : ""}\n`;
      });

      if (item.parking && item.parking.length > 0) {
        resp += `\n**Parking Area Allotment:**\n`;
        item.parking.forEach(p => {
          resp += `- **${p.vehicleType} Parking:** ${p.dimensions} (${p.areaSqft} sq.ft.)\n`;
        });
      }

      return {
        answer: resp,
        type: "property_profile",
        property: item,
        sources: [{ title: `Official Flat Summary: ${item.modelName}`, category: "Flats" }]
      };
    }
  }

  // ----------------------------------------------------------------------
  // Building Specifications & Materials
  // ----------------------------------------------------------------------
  handleBuildingSpecsQuery(qLower) {
    if (qLower.includes("cement") || qLower.includes("dalmiya") || qLower.includes("jk super")) {
      const c = this.buildingSpecs.materials.find(m => m.material.toLowerCase() === "cement");
      return {
        answer: `**Cement Used:** ${c ? c.detail : "Dalmiya / JK SUPER"}\nRed Bricks and Rungta/Hindustan Iron Rods are standard construction materials.`,
        type: "building_spec",
        sources: [{ title: "Building Specification - Materials", category: "Specifications" }]
      };
    }
    if (qLower.includes("brick") || qLower.includes("red brick") || qLower.includes("eet")) {
      const b = this.buildingSpecs.materials.find(m => m.material.toLowerCase() === "bricks");
      return {
        answer: `**Bricks Used:** ${b ? b.detail : "Red Bricks (लाल ईंट)"}\nWall standard: 5" Brick Work.`,
        type: "building_spec",
        sources: [{ title: "Building Specification - Materials", category: "Specifications" }]
      };
    }
    if (qLower.includes("iron rod") || qLower.includes("sariya") || qLower.includes("rod size") || qLower.includes("chhad")) {
      let resp = `**Iron Rod (सरिया) Details:**\n`;
      resp += `- **Brand:** Rungta and Hindustan\n`;
      this.buildingSpecs.ironRodDetails.forEach(r => {
        resp += `- **${r.work}:** ${r.rodSize} (${r.quantity})\n`;
      });
      return {
        answer: resp,
        type: "building_spec",
        sources: [{ title: "Building Specification - Iron Rod Details", category: "Specifications" }]
      };
    }
    if (qLower.includes("amenities") || qLower.includes("amenity") || qLower.includes("mandir") || qLower.includes("temple")) {
      let resp = `**Official Project Amenities (9 Facilities):**\n\n`;
      this.buildingSpecs.projectAmenities.forEach(a => {
        resp += `${a.sl}. **${a.amenityEnglish}** (${a.amenityHindi})\n`;
      });
      return {
        answer: resp,
        type: "amenities",
        sources: [{ title: "Official Project Amenities", category: "Specifications" }]
      };
    }
    if (qLower.includes("plinth") || qLower.includes("slab") || qLower.includes("beam") || qLower.includes("column") || qLower.includes("pile cap") || qLower.includes("foundation")) {
      let resp = `**Structural Engineering Dimensions (Official Training Data):**\n\n`;
      this.buildingSpecs.structuralData.forEach(s => {
        resp += `- **${s.item} (${s.type}):** ${s.value}\n`;
      });
      return {
        answer: resp,
        type: "structural_data",
        sources: [{ title: "Building Specification - Structural Data", category: "Specifications" }]
      };
    }

    // General Deluxe vs Luxury comparison
    let resp = `### Vastu Vihar Building Specifications: Deluxe vs Luxury\n\n`;
    resp += `| Particular | Deluxe | Luxury |\n`;
    resp += `| :--- | :--- | :--- |\n`;
    this.buildingSpecs.specifications.slice(0, 15).forEach(s => {
      resp += `| **${s.particular}** | ${s.deluxe} | ${s.luxury} |\n`;
    });
    resp += `\n*Complete specs include Modular electricals, UPVC 2-track windows (Luxury), SS railings, and Heavy Duty rooftop tiles.*`;

    return {
      answer: resp,
      type: "building_spec_comparison",
      sources: [{ title: "Building Specification (Deluxe vs Luxury)", category: "Specifications" }]
    };
  }

  // ----------------------------------------------------------------------
  // Statutory / Q&A / GST / RERA / Loan
  // ----------------------------------------------------------------------
  matchStatutoryKnowledge(qLower) {
    // GST queries
    if (qLower.includes("gst")) {
      if (qLower.includes("metro") && !qLower.includes("non-metro") && !qLower.includes("non metro")) {
        const item = this.knowledge.find(k => k.id === "qa_gst_metro");
        if (item) return { answer: item.answer, type: "statutory_qa", sources: [{ title: item.title, category: "GST" }] };
      }
      if (qLower.includes("non-metro") || qLower.includes("non metro")) {
        const item = this.knowledge.find(k => k.id === "qa_gst_nonmetro");
        if (item) return { answer: item.answer, type: "statutory_qa", sources: [{ title: item.title, category: "GST" }] };
      }
      // General GST
      const metro = this.knowledge.find(k => k.id === "qa_gst_metro");
      const nonmetro = this.knowledge.find(k => k.id === "qa_gst_nonmetro");
      return {
        answer: `### Official GST Rules (Affordable Housing):\n\n**1. Metro Cities (Kolkata, Patna):**\nCarpet Area up to 60 Sq. Meter (~646 Sq. Ft.) AND Property Value up to ₹45 Lakhs -> **1% GST** (without ITC). Above threshold -> **5% GST**.\n\n**2. Non-Metro Cities (All other cities):**\nCarpet Area up to 90 Sq. Meter (~969 Sq. Ft.) AND Property Value up to ₹45 Lakhs -> **1% GST** (without ITC). Above threshold -> **5% GST**.\n\n*Carpet area refers to usable interior floor area.*`,
        type: "statutory_qa",
        sources: [{ title: "GST Affordable Housing Rules", category: "GST" }]
      };
    }

    // RERA queries
    if (/\brera\b/.test(qLower)) {
      if (qLower.includes("purpose") || qLower.includes("kyu") || qLower.includes("why")) {
        const k = this.knowledge.find(item => item.id === "qa_rera_purpose");
        if (k) return { answer: k.answer, type: "statutory_qa", sources: [{ title: k.title, category: "RERA" }] };
      }
      if (qLower.includes("builder") || qLower.includes("responsibility") || qLower.includes("jimmedari")) {
        const k = this.knowledge.find(item => item.id === "qa_builder_responsibility");
        if (k) return { answer: k.answer, type: "statutory_qa", sources: [{ title: k.title, category: "RERA" }] };
      }
      const k = this.knowledge.find(item => item.id === "qa_rera_definition");
      if (k) return { answer: k.answer, type: "statutory_qa", sources: [{ title: k.title, category: "RERA" }] };
    }

    // Registry & MVR queries
    if (/\bmvr\b/.test(qLower)) {
      const k = this.knowledge.find(item => item.id === "qa_mvr_definition");
      if (k) return { answer: k.answer, type: "statutory_qa", sources: [{ title: k.title, category: "Registry" }] };
    }
    if (/\bregistry\b/.test(qLower) || /\brajistry\b/.test(qLower)) {
      if (qLower.includes("calculate") || qLower.includes("calculation") || qLower.includes("adhar") || qLower.includes("kaise")) {
        const k = this.knowledge.find(item => item.id === "qa_registry_calculation");
        if (k) return { answer: k.answer, type: "statutory_qa", sources: [{ title: k.title, category: "Registry" }] };
      }
      if (qLower.includes("charge") || qLower.includes("stamp duty")) {
        const k = this.knowledge.find(item => item.id === "qa_stamp_duty_charges");
        if (k) return { answer: k.answer, type: "statutory_qa", sources: [{ title: k.title, category: "Registry" }] };
      }
      const k = this.knowledge.find(item => item.id === "qa_registry_definition");
      if (k) return { answer: k.answer, type: "statutory_qa", sources: [{ title: k.title, category: "Registry" }] };
    }

    // Home Loan documents
    if (qLower.includes("home loan") || qLower.includes("loan document") || qLower.includes("loan paper") || qLower.includes("loan ke liye document")) {
      const k = this.knowledge.find(item => item.id === "qa_home_loan_documents");
      if (k) return { answer: k.answer, type: "statutory_qa", sources: [{ title: k.title, category: "Home Loan" }] };
    }

    // Area definitions
    if (qLower.includes("built-up area kya") || qLower.includes("built up area kya") || qLower.includes("what is built-up")) {
      const k = this.knowledge.find(item => item.id === "qa_builtup_area_definition");
      if (k) return { answer: k.answer, type: "statutory_qa", sources: [{ title: k.title, category: "Property" }] };
    }
    if (qLower.includes("carpet area kya") || qLower.includes("what is carpet area")) {
      const k = this.knowledge.find(item => item.id === "qa_carpet_area_definition");
      if (k) return { answer: k.answer, type: "statutory_qa", sources: [{ title: k.title, category: "Property" }] };
    }
    if (qLower.includes("land area kya") || qLower.includes("plot area kya")) {
      const k = this.knowledge.find(item => item.id === "qa_land_area_definition");
      if (k) return { answer: k.answer, type: "statutory_qa", sources: [{ title: k.title, category: "Property" }] };
    }
    if (qLower.includes("super built") || qLower.includes("super built-up")) {
      const k = this.knowledge.find(item => item.id === "qa_super_builtup_definition");
      if (k) return { answer: k.answer, type: "statutory_qa", sources: [{ title: k.title, category: "Property" }] };
    }
    if (qLower.includes("payment calculation") || qLower.includes("payment formula") || qLower.includes("payment amount")) {
      const k = this.knowledge.find(item => item.id === "qa_payment_calculation");
      if (k) return { answer: k.answer, type: "statutory_qa", sources: [{ title: k.title, category: "FAQ" }] };
    }

    return null;
  }

  // ----------------------------------------------------------------------
  // Location & Project Search (Requirement 10, 11, 12)
  // ----------------------------------------------------------------------
  handleLocationQuery(qLower, qOriginal) {
    // Detect city
    const allCities = [
      "Ara", "Aurangabad", "Begusarai", "Bettiah", "Bhagalpur", "Bihar Sharif", "Buxar",
      "Darbhanga", "Dehri-On-Sone", "Gaya", "Hajipur", "Jehanabad", "Katihar", "Madhubani",
      "Motihari", "Munger", "Muzaffarpur", "Patna", "Purnea", "Saharsa", "Samastipur", "Sasaram",
      "Sitamarhi", "Siwan", "Chhapra", "Bokaro", "Deoghar", "Dhanbad", "Giridih", "Hazaribagh",
      "Jamshedpur", "Ranchi", "Alipurduar", "Asansol", "Durgapur", "Kolkata", "Siliguri",
      "Gorakhpur", "Mirzapur", "Varanasi", "Bhubaneswar", "Rourkela"
    ];

    let matchedCity = null;
    for (const c of allCities) {
      const cLow = c.toLowerCase();
      // Handle aliases
      if (cLow === "bihar sharif" && (qLower.includes("bihar sharif") || qLower.includes("bihar sarif") || qLower.includes("biharsarif"))) {
        matchedCity = c;
        break;
      }
      if (cLow === "purnea" && (qLower.includes("purnea") || qLower.includes("purnia"))) {
        matchedCity = c;
        break;
      }
      if (cLow === "jehanabad" && (qLower.includes("jehanabad") || qLower.includes("jahanabad"))) {
        matchedCity = c;
        break;
      }
      if (cLow === "bhubaneswar" && (qLower.includes("bhubaneswar") || qLower.includes("bhubaneshwar") || qLower.includes("bhubneshwar"))) {
        matchedCity = c;
        break;
      }
      if (cLow === "dehri-on-sone" && (qLower.includes("dehri") || qLower.includes("dehri on sone") || qLower.includes("dehri-on-sone"))) {
        matchedCity = c;
        break;
      }

      const pattern = new RegExp(`\\b${cLow}\\b`, "i");
      if (pattern.test(qLower)) {
        matchedCity = c;
        break;
      }
    }

    if (!matchedCity) return null;

    // Check status filter: running vs completed
    const isAskingRunning = /\b(running|ongoing|active|chal\s*raha|kaun\s*kaun\s*se\s*project\s*running)\b/i.test(qLower);
    const isAskingCompleted = /\b(completed|complete|finish|ready)\b/i.test(qLower);

    // Check phase filter (e.g. "Phase 7", "Phase 07", "PH-07")
    const phaseMatch = qLower.match(/\b(?:phase|ph|project)\s*-?\s*0?(\d+)/i);
    let targetPhaseNum = phaseMatch ? phaseMatch[1] : null;

    // Filter projects for the city
    let cityProjects = this.projects.filter(p => p.city.toLowerCase() === matchedCity.toLowerCase());

    if (targetPhaseNum) {
      const paddedNum = targetPhaseNum.padStart(2, "0");
      const matchedPhaseProjects = cityProjects.filter(p => {
        const pLower = p.phase.toLowerCase();
        return pLower.includes(targetPhaseNum) || pLower.includes(paddedNum);
      });

      if (matchedPhaseProjects.length > 0) {
        let resp = `### Vastu Vihar ${matchedCity} Phase ${targetPhaseNum} Details:\n\n`;
        matchedPhaseProjects.forEach(p => {
          resp += `**Project:** ${p.projectName}\n`;
          resp += `- **Status:** ${p.status.toUpperCase()}\n`;
          resp += `- **Site Address:** ${p.siteAddress}\n`;
          if (p.nearbyLocation) resp += `- **Nearby / Landmark:** ${p.nearbyLocation}\n`;
          if (p.mainRoadDistance) resp += `- **Main Road:** ${p.mainRoadDistance}\n`;
          if (p.railwayStationDistance) resp += `- **Railway Station:** ${p.railwayStationDistance}\n`;
          resp += `- **Branch Office:** ${p.officeAddress}\n\n`;
        });
        return {
          answer: resp.trim(),
          type: "location_project_phase",
          sources: [{ title: `Location Details (${matchedCity} Phase ${targetPhaseNum})`, category: "Locations" }]
        };
      }
    }

    if (isAskingRunning && !isAskingCompleted) {
      const runningProjects = cityProjects.filter(p => p.status.toLowerCase() === "running");
      let resp = `### Running Projects in ${matchedCity} (${runningProjects.length} Found):\n\n`;
      if (runningProjects.length === 0) {
        resp += `There are no currently running project phases listed for ${matchedCity} in the official directory.`;
      } else {
        runningProjects.forEach((p, idx) => {
          resp += `${idx + 1}. **${p.projectName}** [${p.phase}]\n`;
          resp += `   - **Site Address:** ${p.siteAddress}\n`;
          if (p.nearbyLocation) resp += `   - **Landmark:** ${p.nearbyLocation}\n`;
        });
      }
      const office = this.offices.find(o => o.city.toLowerCase() === matchedCity.toLowerCase());
      if (office) resp += `\n**Branch Office:** ${office.officeAddress}`;

      return {
        answer: resp,
        type: "city_projects_running",
        sources: [{ title: `Official Locations: ${matchedCity}`, category: "Locations" }]
      };
    }

    if (isAskingCompleted && !isAskingRunning) {
      const completedProjects = cityProjects.filter(p => p.status.toLowerCase() === "completed");
      let resp = `### Completed Projects in ${matchedCity} (${completedProjects.length} Found):\n\n`;
      if (completedProjects.length === 0) {
        resp += `There are no completed project phases listed for ${matchedCity} in the official directory.`;
      } else {
        completedProjects.forEach((p, idx) => {
          resp += `${idx + 1}. **${p.projectName}** [${p.phase}]\n`;
          resp += `   - **Site Address:** ${p.siteAddress}\n`;
          if (p.nearbyLocation) resp += `   - **Landmark:** ${p.nearbyLocation}\n`;
        });
      }
      return {
        answer: resp,
        type: "city_projects_completed",
        sources: [{ title: `Official Locations: ${matchedCity}`, category: "Locations" }]
      };
    }

    // General City Projects List
    let resp = `### Vastu Vihar Projects in ${matchedCity} (${cityProjects.length} Sites):\n\n`;
    cityProjects.forEach((p, idx) => {
      resp += `${idx + 1}. **${p.projectName}** (${p.status.toUpperCase()})\n`;
      resp += `   - **Site:** ${p.siteAddress}\n`;
      if (p.nearbyLocation) resp += `   - **Nearby:** ${p.nearbyLocation}\n`;
    });
    const office = this.offices.find(o => o.city.toLowerCase() === matchedCity.toLowerCase());
    if (office) resp += `\n**Branch Office:** ${office.officeAddress}`;

    return {
      answer: resp,
      type: "city_projects_all",
      sources: [{ title: `Official Directory: ${matchedCity}`, category: "Locations" }]
    };
  }

  // ----------------------------------------------------------------------
  // General Knowledge Base Search
  // ----------------------------------------------------------------------
  searchKnowledgeBase(qLower) {
    if (!this.knowledge || this.knowledge.length === 0) return null;

    let bestMatch = null;
    let maxScore = 0;

    for (const item of this.knowledge) {
      let score = 0;
      const qText = (item.question || "").toLowerCase();
      const aText = (item.answer || "").toLowerCase();
      const titleText = (item.title || "").toLowerCase();
      const kw = (item.keywords || []).map(k => k.toLowerCase());

      if (qLower === qText) score += 50;
      if (qText.includes(qLower) || qLower.includes(qText)) score += 30;
      if (titleText && qLower.includes(titleText)) score += 25;

      for (const k of kw) {
        if (qLower.includes(k)) score += 20;
        if (k.includes(qLower)) score += 10;
      }

      // Check token intersection
      const qTokens = qLower.split(/\s+/).filter(t => t.length > 2);
      let matchTokens = 0;
      for (const t of qTokens) {
        if (qText.includes(t) || aText.includes(t) || titleText.includes(t)) {
          matchTokens++;
        }
      }
      score += matchTokens * 3;

      if (score > maxScore) {
        maxScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch && maxScore >= 20) {
      return {
        answer: bestMatch.answer,
        type: "knowledge_base",
        sources: [{ title: bestMatch.title || bestMatch.question, category: bestMatch.category || "General", source: bestMatch.source || "Official Vastu Vihar Data" }]
      };
    }

    return null;
  }
}

module.exports = new LocalAiEngine();

});
