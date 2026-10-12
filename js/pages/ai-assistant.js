/* =========================================================
   AI ASSISTANT PAGE
   Chat with the Vastu Vihar knowledge engine, with voice
   input (microphone) and voice output (read aloud).
========================================================= */

VV.pages.aiAssistant = (function () {
  const { esc } = VV.utils;

  const WELCOME_MESSAGE = {
    id: "welcome",
    sender: "assistant",
    content:
      "Hello! I am your official Vastu Vihar AI Assistant.\n\n" +
      "I answer questions strictly and deterministically from official Vastu Vihar documentation:\n" +
      "1. Official Project Sites & Branch Offices (125 project sites, 41 branch offices across 5 states)\n" +
      "2. Architectural Plans & Blueprints (7 Bungalow models & 3 Flat configurations with exact room dimensions)\n" +
      "3. Technical Civil Standards (Plinth, Slab, Column, Beam, Materials, Deluxe vs Luxury specifications)\n" +
      "4. Statutory GST & RERA Regulations (Affordable 1% vs Standard 5%, SQ FT rules, Registry, MVR)\n\n" +
      "Ask me about any project location, office address, bungalow room sizes, flat carpet areas, " +
      "building specifications, or GST calculations.",
    sources: [{ name: "Official Vastu Vihar Knowledge Repository", type: "system" }],
  };

  const SUGGESTED_QUESTIONS = [
    "Where is the branch office in Ranchi located?",
    "What is the site address of Vastu Vihar Ara (Phase-01)?",
    "What is the carpet area of 1 BHK Nano flat?",
    "What are the room dimensions of Yamuna 5 BHK bungalow?",
    "Calculate GST for ₹40 Lakh in Patna",
    "What is the difference between Deluxe and Luxury specifications?",
    "Show CEO bungalow carpet area and plot size",
    "What documents are required for a Home Loan?",
  ];

  function render(root, ctx) {
    const state = {
      input: ctx.initialQuestion || "",
      loading: false,
      voiceStatus: "idle", // idle | speaking | paused | listening
      isListening: false,
      messages: [WELCOME_MESSAGE],
    };
    let recognition = null;

    /* ---------- Templates ---------- */

    function voiceBarHtml() {
      if (state.voiceStatus === "idle") {
        return "";
      }
      const labels = {
        listening: '<span class="text-warning">🎙 Listening to voice input... speak now</span>',
        speaking: '<span class="text-primary">🔊 Speaking answer aloud...</span>',
        paused: '<span class="text-accent">⏸ Speech paused</span>',
      };
      const controls =
        state.voiceStatus === "listening"
          ? ""
          : `
            <div class="voice-controls">
              ${
                state.voiceStatus === "speaking"
                  ? '<button class="voice-button" data-action="pause-voice">⏸ Pause</button>'
                  : '<button class="voice-button" data-action="resume-voice">▶ Resume</button>'
              }
              <button class="voice-button" data-action="stop-voice">⏹ Stop</button>
              <button class="voice-button" data-action="replay-voice">🔄 Replay</button>
            </div>`;
      return `
        <div class="voice-bar ${state.voiceStatus === "listening" ? "voice-bar-listening" : ""}">
          <div class="voice-status">${labels[state.voiceStatus] || ""}</div>
          ${controls}
        </div>`;
    }

    function messageHtml(message, index) {
      const isUser = message.sender === "user";

      let footer = "";
      if (!isUser && !message.isError) {
        const sources =
          message.sources && message.sources.length > 0
            ? message.sources.map((s) => `<span class="badge badge-info badge-small">${esc(s.name)}</span>`).join("")
            : "<span>Official Knowledge Base</span>";
        footer = `
          <div class="bubble-footer">
            <div class="bubble-sources"><span>Source:</span>${sources}</div>
            <div class="bubble-actions">
              <button class="link-button" data-action="copy" data-index="${index}" title="Copy Answer">
                ${VV.icon("copy", 13)} Copy
              </button>
              <button class="link-button" data-action="speak" data-index="${index}"
                      title="Read Answer with Natural Voice">
                ${VV.icon("volume", 13)} Speak Aloud
              </button>
            </div>
          </div>`;
      }

      return `
        <div class="chat-bubble ${isUser ? "chat-bubble-user" : "chat-bubble-assistant"}">
          <div class="bubble-text">${esc(message.content)}</div>
          ${message.structuredData ? VV.components.renderAiCard(message.structuredData) : ""}
          ${footer}
        </div>`;
    }

    function template() {
      const messagesHtml = state.messages.map(messageHtml).join("");
      const loadingHtml = state.loading
        ? `<div class="chat-bubble chat-bubble-assistant">
             <span class="muted">Retrieving from official Vastu Vihar knowledge base...</span>
           </div>`
        : "";
      const chips = SUGGESTED_QUESTIONS.map(
        (q, index) => `<button class="chip" data-action="suggest" data-index="${index}">${esc(q)}</button>`
      ).join("");

      return `
        <div class="page-container chat-page">
          <div class="chat-window">
            ${voiceBarHtml()}
            <div class="chat-messages" id="chat-messages">
              ${messagesHtml}
              ${loadingHtml}
            </div>
            <div class="chip-row">${chips}</div>
            <div class="chat-input-toolbar">
              <button type="button" class="mic-button ${state.isListening ? "mic-active" : ""}"
                      data-action="toggle-mic"
                      title="${state.isListening ? "Stop Voice Input" : "Speak your question (Voice Input)"}">
                🎙
              </button>
              <textarea class="chat-textarea" rows="2" data-input="question" data-enter="send"
                placeholder="Ask about project site addresses, branch offices, room dimensions, building specs, GST rules...">${esc(state.input)}</textarea>
              <button class="btn btn-primary btn-ask" id="ask-button" data-action="send"
                      ${state.loading || !state.input.trim() ? "disabled" : ""}>
                Ask Assistant
              </button>
            </div>
          </div>
        </div>`;
    }

    /* ---------- Rendering helpers ---------- */

    /* Re-draw the page. Keeps the chat scroll position unless asked to jump to the newest message. */
    function refresh(scrollToBottom = false) {
      const box = root.querySelector("#chat-messages");
      const previousScroll = box ? box.scrollTop : 0;
      view.update();
      const newBox = root.querySelector("#chat-messages");
      if (newBox) {
        newBox.scrollTop = scrollToBottom ? newBox.scrollHeight : previousScroll;
      }
    }

    function setVoiceStatus(status) {
      state.voiceStatus = status;
      refresh(false);
    }

    /* ---------- Sending a question ---------- */

    async function send(overrideQuestion = null) {
      const question = (overrideQuestion || state.input).trim();
      if (!question || state.loading) {
        return;
      }

      VV.voice.stop();
      state.messages.push({
        id: `user_${Date.now()}`,
        sender: "user",
        content: question,
        timestamp: new Date().toLocaleTimeString(),
      });
      state.input = "";
      state.loading = true;
      refresh(true);

      try {
        const response = await VV.api.askAssistant(question, VV.state.language);
        state.messages.push({
          id: `ai_${Date.now()}`,
          sender: "assistant",
          content: response.answer,
          intent: response.intent,
          sources: response.sources || [],
          structuredData: response.structuredData,
          timestamp: new Date().toLocaleTimeString(),
        });
      } catch (error) {
        state.messages.push({
          id: `err_${Date.now()}`,
          sender: "assistant",
          content:
            "I don't have this information available from official Vastu Vihar documentation: " +
            (error.message || "Server communication error"),
          isError: true,
        });
      } finally {
        state.loading = false;
        refresh(true);
      }
    }

    /* ---------- Voice input (microphone) ---------- */

    function toggleSpeechRecognition() {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) {
        alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
        return;
      }

      if (state.isListening) {
        if (recognition) {
          recognition.stop();
        }
        state.isListening = false;
        setVoiceStatus("idle");
        return;
      }

      recognition = new Recognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = VV.state.language === "hi" ? "hi-IN" : "en-IN";

      recognition.onstart = () => {
        state.isListening = true;
        setVoiceStatus("listening");
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        state.input = transcript;
        state.isListening = false;
        state.voiceStatus = "idle";
        send(transcript);
      };
      recognition.onerror = (error) => {
        console.warn("[Voice Input] Error:", error.error);
        state.isListening = false;
        setVoiceStatus("idle");
      };
      recognition.onend = () => {
        if (state.isListening) {
          state.isListening = false;
          setVoiceStatus("idle");
        }
      };
      recognition.start();
    }

    /* ---------- Events ---------- */

    const view = VV.utils.createView(root, {
      render: template,
      actions: {
        send() {
          send();
        },
        suggest(target) {
          send(SUGGESTED_QUESTIONS[Number(target.dataset.index)]);
        },
        "toggle-mic"() {
          toggleSpeechRecognition();
        },
        copy(target) {
          const message = state.messages[Number(target.dataset.index)];
          navigator.clipboard.writeText(message.content);
          alert("Answer copied to clipboard!");
        },
        speak(target) {
          const message = state.messages[Number(target.dataset.index)];
          VV.voice.speak(message.content, VV.state.language, setVoiceStatus);
        },
        "pause-voice"() {
          VV.voice.pause();
          setVoiceStatus("paused");
        },
        "resume-voice"() {
          VV.voice.resume();
          setVoiceStatus("speaking");
        },
        "stop-voice"() {
          VV.voice.stop();
          setVoiceStatus("idle");
        },
        "replay-voice"() {
          VV.voice.replay();
          setVoiceStatus("speaking");
        },
      },
      inputs: {
        /* Typing only updates state and the button - no re-render, so the caret never jumps. */
        question(value) {
          state.input = value;
          const button = root.querySelector("#ask-button");
          if (button) {
            button.disabled = state.loading || !value.trim();
          }
        },
      },
      keys: {
        send() {
          send();
        },
      },
    });

    refresh(true);

    if (ctx.initialQuestion) {
      send(ctx.initialQuestion);
    }
  }

  return { render };
})();
