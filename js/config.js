/* =========================================================
   CONFIGURATION
   Edit this file to switch between the two ways of running
   the application.
========================================================= */

/*
  Global application namespace. Every other script attaches
  its functions to this object (VV.api, VV.utils, VV.pages ...).
*/
window.VV = {
  pages: {},
  state: {},
};

VV.config = {
  /*
    true  -> The original Node/Express backend runs INSIDE the browser
             (see js/local-backend/). No server needed. Open index.html
             or use VS Code "Live Server".

    false -> The frontend talks to a real backend over HTTP.
             Start it with:  cd backend && npm install && npm start
             and set API_BASE_URL below.
  */
  USE_LOCAL_BACKEND: true,

  /* Used only when USE_LOCAL_BACKEND is false. */
  API_BASE_URL: "http://localhost:3001",

  /* Local storage keys. */
  STORAGE_TOKEN: "vv_auth_token",
  STORAGE_THEME: "vv_theme",
  STORAGE_LANGUAGE: "vv_language",

  /* How often (ms) the sidebar "System Ready" indicator re-checks the API. */
  HEALTH_CHECK_INTERVAL: 10000,

  /* Optional natural voice provider (ElevenLabs). Leave empty to use the browser voice. */
  TTS_PROVIDER: "browser",
  TTS_API_KEY: "",
  TTS_VOICE_ID: "",
};

VV.LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "hinglish", label: "Hinglish", native: "Hinglish" },
];
