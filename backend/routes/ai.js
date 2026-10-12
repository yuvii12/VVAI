// AI Assistant Routes
const express = require("express");
const router = express.Router();
const aiService = require("../services/ai/aiService");
const store = require("../lib/store");

// POST /api/ai/ask (also mounted as /api/ask)
router.post("/ask", async (req, res) => {
  try {
    const { question, language = "en", conversationId = null } = req.body || {};

    if (typeof question !== "string") {
      return res.status(400).json({ error: "Invalid request: 'question' must be a string." });
    }

    const response = await aiService.processQuery({
      question,
      user: req.user,
      language,
      conversationId,
    });

    res.json(response);
  } catch (err) {
    console.error("AI Assistant Error:", err);
    res.status(500).json({ error: "Internal error processing question." });
  }
});

// GET /api/ai/conversations
router.get("/conversations", (req, res) => {
  const userId = req.user?.id || null;
  res.json({ conversations: store.getAiConversations(userId) });
});

// POST /api/ai/conversations
router.post("/conversations", (req, res) => {
  const { title, language } = req.body || {};
  const userId = req.user?.id || null;
  const conv = store.createAiConversation(userId, title, language);
  res.json({ conversation: conv });
});

// GET /api/ai/conversations/:id/messages
router.get("/conversations/:id/messages", (req, res) => {
  res.json({ messages: store.getAiMessages(req.params.id) });
});

module.exports = router;
