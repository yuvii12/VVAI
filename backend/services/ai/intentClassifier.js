// Intent Classifier supporting 35+ enterprise real estate, CRM & ERP intents

const INTENTS = [
  // 1. CRM Employee Self-Queries & Follow-ups
  {
    intent: "assigned_leads",
    regex: /\b(assigned\s*to\s*me|my\s*leads|my\s*pending\s*leads|mere\s*leads|show\s*my\s*pending\s*leads|leads\s*assigned)\b/i,
  },
  {
    intent: "today_followups",
    regex: /\b(follow.?up\s*today|today.*follow.?up|aaj\s*ka\s*follow.?up|who\s*has\s*a\s*follow.?up\s*today)\b/i,
  },
  {
    intent: "site_visit_tomorrow",
    regex: /\b(site\s*visit\s*tomorrow|tomorrow.*site\s*visit|kal\s*ka\s*visit|site\s*visit.*tomorrow)\b/i,
  },
  {
    intent: "interested_leads",
    regex: /\b(customers?\s*interested|leads?\s*interested|interested\s*in\s*bungalow|interested\s*in\s*patna|interested\s*in\s*3\s*bhk)\b/i,
  },

  // 2. Office Address vs Project Site Address
  {
    intent: "office_address",
    regex: /\boffice\b.*\b(kaha|address|pata|kidhar|where|location|number|contact)\b|\bbranch\s*office\b|\bhead\s*office\b/i,
  },
  {
    intent: "project_address",
    regex: /\b(project|site|phase|ph[-\s]?\d)\b.*\b(kaha|kidhar|address|pata|location|exact|where)\b|\b(kaha|kidhar|where)\b.*\b(project|site|phase)\b/i,
  },
  {
    intent: "site_address",
    regex: /\b(sare|saare|all|sabhi)\b.*\b(site|address|pata|phase)\b|\bsite\s*ka\s*address\b|\bsite\s*address\b|\bexact\s*location\b/i,
  },

  // 3. Pricing & Availability (Strict City Isolation)
  {
    intent: "property_price",
    regex: /\b(price|rate|cost|kitne\s*ka|kimat|keemat|daam|budget|quote|pricing)\b/i,
  },
  {
    intent: "property_availability",
    regex: /\b(available|availability|bache|bacha|khali|units\s*left|remaining|stock|kitne\s*ghar\s*hai|how\s*many\s*units|which\s*flats\s*are\s*available|available\s*bungalows)\b/i,
  },

  // 4. Project Construction Status
  {
    intent: "completed_projects",
    regex: /\b(which\s*projects\s*are\s*completed|completed\s*projects|kaun\s*se\s*project\s*complete\s*hai|completed\s*in)\b/i,
  },
  {
    intent: "under_construction_projects",
    regex: /\b(under\s*construction|ongoing\s*projects|ongoing\s*in|kaun\s*se\s*project\s*chal\s*rahe\s*hai)\b/i,
  },
  {
    intent: "project_search",
    regex: /\b(projects?|phases?|township)\b.*\b(in|at|me|mein|ke|show|tell|list|details?|batao|kaha)\b|\b(show|tell|list|give)\b.*\b(projects?|sites?)\b/i,
  },

  // 5. Document Area & Numerical Specifications
  {
    intent: "property_area",
    regex: /\b(carpet\s*area|built.?up|plot\s*area|dimension|size|plot\s*size|kitna\s*sqft|kitna\s*area)\b/i,
  },
  {
    intent: "bungalow_search",
    regex: /\b(bungalow|ananta|yamuna|jayanti|ceo|business\s*bungalow|villa)\b/i,
  },
  {
    intent: "flat_search",
    regex: /\b(flat|apartment|multi\s*storey|tower)\b/i,
  },
  {
    intent: "duplex_search",
    regex: /\b(duplex|triplex|row\s*house)\b/i,
  },

  // 6. Financial & Legal Calculations
  {
    intent: "gst",
    regex: /\b(gst|tax|taxation|cgst|sgst|affordable\s*threshold)\b/i,
  },
  {
    intent: "emi",
    regex: /\b(emi|loan|interest|down\s*payment|cibil|bank\s*loan|finance)\b/i,
  },
  {
    intent: "property_specification",
    regex: /\b(specification|structure|flooring|tile|tiles|brick|fitting|hindware|upvc|specs|deluxe|luxury)\b/i,
  },
  {
    intent: "project_status",
    regex: /\b(completed|ongoing|under\s*construction|upcoming|new\s*launch|sold\s*out|status)\b/i,
  },
  {
    intent: "project_phase",
    regex: /\b(phase|phases|ph-0[1-9]|kitne\s*phase)\b/i,
  },
  {
    intent: "amenities",
    regex: /\b(amenities|amenity|swimming\s*pool|pool|gym|park|gazebo|pergola|club\s*house|parking)\b/i,
  },
  {
    intent: "parking",
    regex: /\b(parking|car\s*parking|garage|two\s*wheeler)\b/i,
  },
  {
    intent: "booking",
    regex: /\b(booking|book\s*karna|reserve|token|advance|booking\s*amount)\b/i,
  },
  {
    intent: "site_visit",
    regex: /\b(site\s*visit|visit|dekhne\s*jana|schedule\s*visit|inspection)\b/i,
  },
  {
    intent: "rera",
    regex: /\b(rera|registration|legal|approval|bihar\s*rera)\b/i,
  },
  {
    intent: "possession",
    regex: /\b(possession|handover|kab\s*milega|ready\s*to\s*move|completion\s*date)\b/i,
  },
  {
    intent: "maintenance",
    regex: /\b(maintenance|amc|monthly\s*charge|society\s*charge)\b/i,
  },
  {
    intent: "customer_lookup",
    regex: /\b(customer|client|buyer|customer\s*details|customer\s*history)\b/i,
  },
  {
    intent: "lead_lookup",
    regex: /\b(lead|leads|assigned\s*to\s*me|interested\s*customer|follow.?up)\b/i,
  },
  {
    intent: "documents",
    regex: /\b(document|documents|paper|papers|kagaz|id\s*proof|pan\s*card)\b/i,
  },
  {
    intent: "company_info",
    regex: /\b(director|cmd|owner|founded|year|history|vastu\s*vihar|technoculture)\b/i,
  },
];

function classifyIntent(query) {
  if (!query || typeof query !== "string") return "general_faq";
  const clean = query.trim();

  for (const item of INTENTS) {
    if (item.regex.test(clean)) {
      return item.intent;
    }
  }

  return "general_faq";
}

module.exports = {
  classifyIntent,
  INTENTS,
};
