/* Original backend file: backend/services/ai/aiService.js  (unchanged, registered for the browser) */
VVServer.define("services/ai/aiService.js", function (require, module, exports, __dirname) {

// Master AI Service for Vastu Vihar
// Grounded strictly in official Vastu Vihar data files via localAiEngine.
// NO external OpenAI dependency, NO ERP dependency, NO CRM dependency.

const localAiEngine = require("./localAiEngine");
const store = require("../../lib/store");

class AiService {
  async processQuery(arg1, user = null, language = "en", conversationId = null) {
    let question = arg1;
    let actualUser = user;
    let actualLang = language;
    let actualConvId = conversationId;

    if (typeof arg1 === "object" && arg1 !== null && arg1.question !== undefined) {
      question = arg1.question;
      actualUser = arg1.user !== undefined ? arg1.user : null;
      actualLang = arg1.language || "en";
      actualConvId = arg1.conversationId || null;
    }

    if (!question || typeof question !== "string" || !question.trim()) {
      return {
        answer: "Please enter a question or property inquiry.",
        type: "empty_query",
        sources: []
      };
    }

    const result = localAiEngine.processQuery(question, actualLang);

    // Save message to conversation if conversationId exists
    if (actualConvId) {
      try {
        store.addAiMessage(actualConvId, "user", question);
        store.addAiMessage(actualConvId, "assistant", result.answer);
      } catch (err) {
        // non-blocking
      }
    }

    return {
      status: "success",
      question,
      answer: result.answer,
      type: result.type,
      property: result.property || null,
      sources: result.sources || [{ title: "Official Vastu Vihar Data", category: "Authoritative" }],
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new AiService();

});
