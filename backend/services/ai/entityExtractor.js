// Entity Extractor for Real Estate Queries
const store = require("../../lib/store");

function extractEntities(query) {
  if (!query || typeof query !== "string") return {};

  // Normalize punctuation to spaces for accurate token/word boundary matching
  const cleanStr = query.replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
  const lower = ` ${cleanStr.toLowerCase()} `;

  // 1. City Matching against store cities
  let matchedCity = null;
  let matchedState = null;
  const cities = store.getCities();

  for (const c of cities) {
    const nameLower = c.name.toLowerCase();
    if (lower.includes(` ${nameLower} `) || lower.includes(` ${c.normalizedName} `)) {
      matchedCity = c.name;
      matchedState = c.state;
      break;
    }
  }

  // Common aliases/variants
  if (!matchedCity) {
    if (lower.includes(" patna ")) { matchedCity = "Patna"; matchedState = "Bihar"; }
    else if (lower.includes(" ranchi ")) { matchedCity = "Ranchi"; matchedState = "Jharkhand"; }
    else if (lower.includes(" bhagalpur ")) { matchedCity = "Bhagalpur"; matchedState = "Bihar"; }
    else if (lower.includes(" gaya ")) { matchedCity = "Gaya"; matchedState = "Bihar"; }
    else if (lower.includes(" muzaffarpur ")) { matchedCity = "Muzaffarpur"; matchedState = "Bihar"; }
    else if (lower.includes(" darbhanga ")) { matchedCity = "Darbhanga"; matchedState = "Bihar"; }
    else if (lower.includes(" bokaro ")) { matchedCity = "Bokaro"; matchedState = "Jharkhand"; }
    else if (lower.includes(" jamshedpur ")) { matchedCity = "Jamshedpur"; matchedState = "Jharkhand"; }
    else if (lower.includes(" gorakhpur ")) { matchedCity = "Gorakhpur"; matchedState = "Uttar Pradesh"; }
    else if (lower.includes(" varanasi ")) { matchedCity = "Varanasi"; matchedState = "Uttar Pradesh"; }
    else if (lower.includes(" bhubaneswar ") || lower.includes(" bhubaneshwar ")) { matchedCity = "Bhubaneswar"; matchedState = "Odisha"; }
    else if (lower.includes(" purnia ") || lower.includes(" purnea ")) { matchedCity = "Purnia"; matchedState = "Bihar"; }
  }

  // Detection of unlisted / outside cities (for anti-hallucination explicit unavailable answers)
  const unlistedCities = [
    "Mumbai", "Delhi", "New Delhi", "Bengaluru", "Bangalore", "Kolkata", "Chennai",
    "Hyderabad", "Pune", "Ahmedabad", "Surat", "Jaipur", "Lucknow", "Kanpur",
    "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Vadodara", "Ghaziabad",
    "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Srinagar",
    "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Prayagraj",
    "Howrah", "Gwalior", "Jabalpur", "Coimbatore", "Vijayawada", "Jodhpur",
    "Madurai", "Raipur", "Kota", "Chandigarh", "Guwahati", "Solapur"
  ];

  if (!matchedCity) {
    for (const uc of unlistedCities) {
      if (lower.includes(` ${uc.toLowerCase()} `)) {
        matchedCity = uc;
        break;
      }
    }
  }

  // Preposition heuristic fallback for queries like "in <City>"
  if (!matchedCity) {
    const prepMatch = query.match(/\b(?:in|at|for|near|around|me|mein|shehar|city)\s+([A-Za-z]{3,})\b/i);
    if (prepMatch) {
      const candidate = prepMatch[1].trim();
      const stopWords = [
        "the", "our", "this", "that", "all", "deluxe", "luxury", "bungalow",
        "flats", "flat", "project", "phase", "site", "vastu", "vihar", "price",
        "rate", "cost", "available", "units", "approx", "total", "bihar", "jharkhand"
      ];
      if (!stopWords.includes(candidate.toLowerCase())) {
        matchedCity = candidate.charAt(0).toUpperCase() + candidate.slice(1).toLowerCase();
      }
    }
  }

  // 2. Phase Detection (PH-01, PH-03, Phase 2, etc.)
  let matchedPhase = null;
  const phaseMatch = lower.match(/ph[-\s]?(?:ase)?[-\s]?0*(\d{1,2})/);
  if (phaseMatch) {
    const num = phaseMatch[1].padStart(2, "0");
    matchedPhase = `PH-${num}`;
  }

  // 3. BHK Detection (1 BHK, 2 BHK, 3 BHK, 4 BHK, 5 BHK)
  let matchedBhk = null;
  const bhkMatch = lower.match(/(\d)\s*-?\s*bhk/);
  if (bhkMatch) {
    matchedBhk = parseInt(bhkMatch[1], 10);
  }

  // 4. Bungalow Specific Model Detection
  let matchedModel = null;
  let matchedPropertyType = null;

  if (lower.includes("yamuna")) {
    matchedModel = "Yamuna Standard Plan";
    matchedPropertyType = "Bungalow";
    matchedBhk = 5;
  } else if (lower.includes("ananta")) {
    matchedModel = "Ananta Bungalow";
    matchedPropertyType = "Bungalow";
    matchedBhk = 3;
  } else if (lower.includes("jayanti")) {
    matchedModel = "Jayanti Standard Bungalow";
    matchedPropertyType = "Bungalow";
    matchedBhk = 3;
  } else if (lower.includes("ceo") || lower.includes("deepak kumar")) {
    matchedModel = "CEO Bungalow";
    matchedPropertyType = "Bungalow";
    matchedBhk = 5;
  } else if (lower.includes("business bungalow")) {
    matchedModel = "Business Bungalow";
    matchedPropertyType = "Bungalow";
    matchedBhk = 2;
  } else if (lower.includes("bungalow") || lower.includes("bangla") || lower.includes("villa")) {
    matchedPropertyType = "Bungalow";
  } else if (lower.includes("duplex")) {
    matchedPropertyType = "Duplex";
  } else if (lower.includes("flat") || lower.includes("apartment")) {
    matchedPropertyType = matchedBhk ? `${matchedBhk} BHK` : "Flat";
  } else if (matchedBhk) {
    matchedPropertyType = `${matchedBhk} BHK`;
  }

  // 5. Commercial vs Residential
  const isCommercial = lower.includes("commercial") || lower.includes("dukan") || lower.includes("shop");

  // 6. Budget / Value Extraction
  let matchedBudget = null;
  const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lakhs|lacs|l)/);
  if (lakhMatch) {
    matchedBudget = parseFloat(lakhMatch[1]) * 100000;
  } else {
    const crMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)/);
    if (crMatch) {
      matchedBudget = parseFloat(crMatch[1]) * 10000000;
    }
  }

  return {
    city: matchedCity,
    state: matchedState,
    phase: matchedPhase,
    bhk: matchedBhk,
    propertyType: matchedPropertyType,
    modelName: matchedModel,
    isCommercial,
    budget: matchedBudget,
  };
}

module.exports = {
  extractEntities,
};
