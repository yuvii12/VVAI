/* =========================================================
   LOCAL BACKEND - MODULE LOADER
   The original backend is written for Node.js (CommonJS:
   require / module.exports). Browsers do not have require(),
   so this tiny loader provides it.

   Every backend file is registered with:
       VVServer.define("routes/auth.js", function (require, module, exports, __dirname) { ... });
   and loaded on demand with VVServer.require("server.js").
========================================================= */

(function () {
  "use strict";

  const definitions = {};
  const cache = {};

  /* Minimal "process" object for code that reads process.env. */
  window.process = window.process || {
    env: {},
    cwd: () => "/",
    nextTick: (fn) => setTimeout(fn, 0),
  };

  /* Turn "routes/../lib/./store.js" into "lib/store.js". */
  function normalize(path) {
    const parts = [];
    path.split("/").forEach((part) => {
      if (part === "" || part === ".") {
        return;
      }
      if (part === "..") {
        parts.pop();
      } else {
        parts.push(part);
      }
    });
    return parts.join("/");
  }

  function dirname(id) {
    return id.split("/").slice(0, -1).join("/");
  }

  /* Find the registered module for a require() request. */
  function resolve(request, fromId) {
    if (!request.startsWith(".")) {
      return request; // packages such as "express" are registered by name
    }
    const base = normalize(`${dirname(fromId)}/${request}`);
    const candidates = [base, `${base}.js`, `${base}.json`, `${base}/index.js`];
    return candidates.find((candidate) => definitions[candidate]) || base;
  }

  function load(id) {
    if (cache[id]) {
      return cache[id].exports;
    }
    const factory = definitions[id];
    if (!factory) {
      throw new Error(`[local-backend] Module not found: ${id}`);
    }

    const module = { exports: {} };
    cache[id] = module;

    const localRequire = (request) => load(resolve(request, id));
    localRequire.main = undefined;

    factory(localRequire, module, module.exports, `/app/${dirname(id)}`);
    return module.exports;
  }

  window.VVServer = {
    define(id, factory) {
      definitions[id] = factory;
    },
    /* Register a plain data object (used for the JSON files). */
    defineData(id, data) {
      definitions[id] = function (require, module) {
        module.exports = data;
      };
    },
    require: load,
  };
})();
