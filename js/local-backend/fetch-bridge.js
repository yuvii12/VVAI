/* =========================================================
   LOCAL BACKEND - FETCH BRIDGE
   Replaces window.fetch for every "/api/..." request. Instead
   of going over the network, the request is handed to the
   Express app in js/local-backend/server.js and the result is
   returned as a normal fetch Response.

   Everything else (fonts, images ...) uses the real fetch.
========================================================= */

(function () {
  "use strict";

  if (!VV.config.USE_LOCAL_BACKEND) {
    return; // using a real backend instead
  }

  /* Data that changes while using the app is saved here so a page reload keeps it. */
  const PERSISTED_COLLECTIONS = ["users", "documents", "conversations", "messages", "auditLogs"];
  const STORAGE_KEY = "vv_store_v1";

  let app = null;
  let store = null;

  /* The backend (and its password hashing) starts on the first API call. */
  function boot() {
    if (app) {
      return;
    }
    app = VVServer.require("server.js");
    store = VVServer.require("lib/store.js");
    restoreSavedData();
  }

  function restoreSavedData() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) {
        return;
      }
      PERSISTED_COLLECTIONS.forEach((name) => {
        if (Array.isArray(saved[name])) {
          store[name] = saved[name];
        }
      });
    } catch (error) {
      /* ignore corrupted data */
    }
  }

  function saveData() {
    try {
      const snapshot = {};
      PERSISTED_COLLECTIONS.forEach((name) => {
        snapshot[name] = store[name];
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (error) {
      /* storage full - ignore */
    }
  }

  /* Build Express-like req/res objects and run the app. Resolves with { status, headers, body }. */
  function dispatch(method, url, headers, bodyText) {
    boot();

    return new Promise((resolve) => {
      const parsed = new URL(url, "http://local");

      const query = {};
      parsed.searchParams.forEach((value, key) => {
        query[key] = key in query ? [].concat(query[key], value) : value;
      });

      let body = {};
      if (bodyText) {
        try {
          body = JSON.parse(bodyText);
        } catch (error) {
          body = {};
        }
      }

      const lowerHeaders = {};
      Object.keys(headers || {}).forEach((key) => {
        lowerHeaders[key.toLowerCase()] = headers[key];
      });

      const req = {
        method,
        url: parsed.pathname + parsed.search,
        originalUrl: parsed.pathname + parsed.search,
        baseUrl: "",
        path: parsed.pathname,
        query,
        body,
        headers: lowerHeaders,
        params: {},
        ip: "127.0.0.1",
        connection: { remoteAddress: "127.0.0.1" },
        get: (name) => lowerHeaders[name.toLowerCase()],
      };

      let status = 200;
      const responseHeaders = { "content-type": "application/json" };
      const finish = (payload) => resolve({ status, headers: responseHeaders, body: payload });

      const res = {
        headersSent: false,
        status(code) {
          status = code;
          return res;
        },
        set(name, value) {
          responseHeaders[String(name).toLowerCase()] = value;
          return res;
        },
        header(name, value) {
          return res.set(name, value);
        },
        setHeader(name, value) {
          return res.set(name, value);
        },
        getHeader(name) {
          return responseHeaders[String(name).toLowerCase()];
        },
        json(object) {
          res.headersSent = true;
          finish(JSON.stringify(object));
          return res;
        },
        send(payload) {
          res.headersSent = true;
          finish(typeof payload === "string" ? payload : JSON.stringify(payload));
          return res;
        },
        sendStatus(code) {
          status = code;
          return res.send("");
        },
        end(payload) {
          res.headersSent = true;
          finish(payload || "");
          return res;
        },
      };

      app.handle(req, res, (error) => {
        status = error ? error.status || 500 : 404;
        finish(
          JSON.stringify({
            error: error ? error.message : `API route '${method} ${parsed.pathname}' not found.`,
          })
        );
      });
    });
  }

  const realFetch = window.fetch ? window.fetch.bind(window) : null;

  window.fetch = async function localFetch(input, init = {}) {
    const url = typeof input === "string" ? input : (input && input.url) || "";

    if (!/^\/?api\//.test(url)) {
      return realFetch(input, init);
    }

    const method = (init.method || "GET").toUpperCase();
    const path = url.startsWith("/") ? url : `/${url}`;
    const body = typeof init.body === "string" ? init.body : "";

    const result = await dispatch(method, path, init.headers, body);

    if (method !== "GET") {
      saveData();
    }
    return new Response(result.body, { status: result.status, headers: result.headers });
  };
})();
