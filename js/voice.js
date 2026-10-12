/* =========================================================
   VOICE SERVICE
   Reads answers aloud. Uses the browser SpeechSynthesis API,
   or ElevenLabs when configured in js/config.js.
   Playback states: "idle" | "speaking" | "paused"
========================================================= */

VV.voice = {
  status: "idle",
  lastText: "",
  lastLang: "en",
  onStateChange: null,
  audioElement: null,

  isSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  },

  setState(newStatus) {
    this.status = newStatus;
    if (this.onStateChange) {
      this.onStateChange(newStatus);
    }
  },

  speak(text, lang = "en", onStateChange = null, forceBrowser = false) {
    if (!text) {
      return;
    }
    this.lastText = text;
    this.lastLang = lang;
    if (onStateChange) {
      this.onStateChange = onStateChange;
    }
    this.stop();

    /* Remove markdown symbols so the voice sounds natural. */
    const cleanText = text
      .replace(/[*_#`~]/g, "")
      .replace(/•/g, " ")
      .replace(/\n+/g, ". ")
      .slice(0, 1500);

    const config = VV.config;
    const useElevenLabs =
      !forceBrowser && config.TTS_PROVIDER === "elevenlabs" && config.TTS_API_KEY && config.TTS_VOICE_ID;

    if (useElevenLabs) {
      this.speakElevenLabs(cleanText);
      return;
    }
    this.speakBrowser(cleanText, lang);
  },

  speakBrowser(text, lang) {
    if (!this.isSupported()) {
      console.warn("[Voice] Browser SpeechSynthesis is not supported here.");
      this.setState("idle");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    if (lang === "hi") {
      utterance.lang = "hi-IN";
      const hindiVoice = voices.find((v) => v.lang === "hi-IN" || v.lang.startsWith("hi"));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
    } else {
      utterance.lang = "en-IN";
      const englishVoice = voices.find(
        (v) => v.lang === "en-IN" || v.name.includes("India") || v.lang.startsWith("en")
      );
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => this.setState("speaking");
    utterance.onpause = () => this.setState("paused");
    utterance.onresume = () => this.setState("speaking");
    utterance.onend = () => this.setState("idle");
    utterance.onerror = (error) => {
      console.warn("[Voice] Speech synthesis error:", error);
      this.setState("idle");
    };

    window.speechSynthesis.speak(utterance);
    this.setState("speaking");
  },

  async speakElevenLabs(text) {
    const config = VV.config;
    try {
      this.setState("speaking");
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${config.TTS_VOICE_ID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": config.TTS_API_KEY,
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`ElevenLabs API returned status ${response.status}`);
      }

      const blob = await response.blob();
      if (this.audioElement) {
        this.audioElement.pause();
      }
      this.audioElement = new Audio(URL.createObjectURL(blob));
      this.audioElement.onplay = () => this.setState("speaking");
      this.audioElement.onpause = () => this.setState("paused");
      this.audioElement.onended = () => this.setState("idle");
      this.audioElement.onerror = () => this.speakBrowser(text, this.lastLang);
      await this.audioElement.play();
    } catch (error) {
      console.warn("[Voice] ElevenLabs failed, using browser voice:", error.message);
      this.speak(this.lastText, this.lastLang, null, true);
    }
  },

  pause() {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
      this.setState("paused");
      return;
    }
    if (this.isSupported() && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      this.setState("paused");
    }
  },

  resume() {
    if (this.audioElement && this.audioElement.paused) {
      this.audioElement.play();
      this.setState("speaking");
      return;
    }
    if (this.isSupported() && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.setState("speaking");
    }
  },

  stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
    this.setState("idle");
  },

  replay() {
    if (this.lastText) {
      this.speak(this.lastText, this.lastLang);
    }
  },
};
