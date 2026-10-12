const engine = require("../services/ai/localAiEngine");

const testQueries = [
  "What is Ananta bungalow?",
  "What is the carpet area of Ananta?",
  "What is the built-up area of Jayanti?",
  "Tell me about Kaveri bungalow.",
  "What is the plot area of Yamuna?",
  "Tell me about Ganga flat.",
  "What is the carpet area of Nano?",
  "What is the built-up area of Adity?",
  "Which projects are running in Gaya?",
  "Which projects are completed in Gaya?",
  "Where is Gaya Phase 07?",
  "Show me all projects in Hajipur.",
  "What documents are required for home loan?",
  "What is RERA?",
  "What is MVR?",
  "What is Registry?",
  "What is the GST rule for Metro?",
  "What is the GST rule for Non-Metro?",
  "What are the building specifications?",
  "What amenities are available?",
  "Tell me about Lotus bungalow",
  "What is the price of Ananta bungalow?",
  "How many vacant units are available in Patna?",
  "Where is Patna Phase 08?"
];

console.log("=== RUNNING 24 MANDATORY VERIFICATION TESTS ===");
let passed = 0;
testQueries.forEach((q, i) => {
  const res = engine.processQuery(q);
  console.log(`\n[Test ${i + 1}] Q: "${q}"`);
  console.log(`-> Type: ${res.type}`);
  console.log(`-> Answer: ${res.answer.slice(0, 140)}...`);

  // Basic assertion checks
  if (i === 0 && res.answer.includes("Ananta") && !res.answer.includes("Jayanti")) passed++;
  else if (i === 1 && res.answer.includes("1335 sq.ft")) passed++;
  else if (i === 2 && res.answer.includes("1300 sqft")) passed++;
  else if (i === 3 && res.answer.includes("Kaveri") && !res.answer.includes("CEO")) passed++;
  else if (i === 4 && res.answer.includes("1600 sqft")) passed++;
  else if (i === 5 && res.answer.includes("Ganga") && res.answer.includes("450 sqft")) passed++;
  else if (i === 6 && res.answer.includes("325 sqft")) passed++;
  else if (i === 7 && res.answer.includes("750 sqft")) passed++;
  else if (i === 8 && res.answer.includes("Running Projects in Gaya")) passed++;
  else if (i === 9 && res.answer.includes("Completed Projects in Gaya")) passed++;
  else if (i === 10 && res.answer.includes("Gaya Phase 7 Details") || res.answer.includes("Gaya Phase 07")) passed++;
  else if (i === 11 && res.answer.includes("Hajipur")) passed++;
  else if (i === 12 && res.answer.includes("ITR") && res.answer.includes("Form 16")) passed++;
  else if (i === 13 && res.answer.includes("Real Estate (Regulation and Development) Act")) passed++;
  else if (i === 14 && res.answer.includes("Minimum Value Register")) passed++;
  else if (i === 15 && res.answer.includes("Registry")) passed++;
  else if (i === 16 && res.answer.includes("646 Sq. Ft.") && res.answer.includes("1% GST")) passed++;
  else if (i === 17 && res.answer.includes("969 Sq. Ft.") && res.answer.includes("1% GST")) passed++;
  else if (i === 18 && res.answer.includes("Deluxe") && res.answer.includes("Luxury")) passed++;
  else if (i === 19 && res.answer.includes("Temple") && res.answer.includes("Swimming Pool")) passed++;
  else if (i === 20 && res.answer.includes("does not contain information for \"lotus\"")) passed++;
  else if (i === 21 && res.answer.includes("Property pricing information is not exposed")) passed++;
  else if (i === 22 && res.answer.includes("Live unit availability and vacant unit lists are not displayed")) passed++;
  else if (i === 23 && res.answer.includes("Patna Phase 8 Details") || res.answer.includes("Bela, Patna - Bihta Road")) passed++;
  else {
    console.log("Check details for test", i + 1);
  }
});

console.log(`\n=== RESULT: ${passed} / ${testQueries.length} TESTS VERIFIED ===`);
