// Secure OpenAI Client (Backend Only)
// Never exposes API keys to the browser.
// Falls back smoothly to local deterministic RAG if key is missing or network unavailable.

class OpenAIClient {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || null;
    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10 && !this.apiKey.includes("YOUR_API_KEY"));
  }

  async generateResponse({ systemPrompt, userMessage, contextData, language = "en" }) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const messages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Language required: ${language}\nUser query: "${userMessage}"\nRetrieved live business context: ${JSON.stringify(contextData)}`,
        },
      ];

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.2,
          max_tokens: 600,
        }),
      });

      if (!res.ok) {
        console.warn(`[OpenAI Client] API call failed with status ${res.status}`);
        return null;
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (err) {
      console.warn(`[OpenAI Client] Network error: ${err.message}`);
      return null;
    }
  }
}

module.exports = new OpenAIClient();
