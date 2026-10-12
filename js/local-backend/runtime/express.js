/* =========================================================
   LOCAL BACKEND - EXPRESS REPLACEMENT
   A small router that understands the parts of Express this
   backend uses: app.use / get / post / put / patch / delete,
   express.Router(), route params (":id") and middleware chains.
========================================================= */

VVServer.define("express", function (require, module) {
  /* Convert "/users/:id" into a regular expression + list of parameter names. */
  function compile(path, exact) {
    const keys = [];
    let source = path.replace(/\/+$/, "");
    source = source.replace(/:(\w+)/g, (_, key) => {
      keys.push(key);
      return "([^/]+)";
    });
    const regex = new RegExp("^" + source + (exact ? "/?$" : "(?=/|$)"), "i");
    return { regex, keys };
  }

  function createStack() {
    const stack = [];

    /* Run a request through every matching layer, in order. */
    function handle(req, res, done) {
      let index = 0;
      const originalUrl = req.url;
      const originalBase = req.baseUrl || "";

      const finish = (error) => {
        req.url = originalUrl;
        req.baseUrl = originalBase;
        if (done) {
          done(error);
        }
      };

      const next = (error) => {
        const layer = stack[index++];
        if (!layer) {
          return finish(error);
        }
        if (layer.method && layer.method !== req.method) {
          return next(error);
        }

        const urlPath = req.url.split("?")[0] || "/";
        const params = {};
        let consumed = 0;

        if (layer.path !== null) {
          const match = layer.matcher.regex.exec(urlPath);
          if (!match) {
            return next(error);
          }
          layer.matcher.keys.forEach((key, i) => {
            params[key] = decodeURIComponent(match[i + 1]);
          });
          if (!layer.exact) {
            consumed = match[0].length;
          }
        }

        const handler = layer.handler;
        const isErrorHandler = handler.length === 4;
        if (error && !isErrorHandler) {
          return next(error);
        }
        if (!error && isErrorHandler) {
          return next();
        }

        const savedUrl = req.url;
        const savedBase = req.baseUrl;
        const savedParams = req.params;

        /* When mounted with app.use("/api", router) strip the prefix for the router. */
        if (consumed) {
          const rest = req.url.slice(consumed);
          req.url = rest.startsWith("/") || rest.startsWith("?") ? rest : "/" + rest;
          req.baseUrl = savedBase + urlPath.slice(0, consumed);
        }
        req.params = Object.assign({}, savedParams || {}, params);

        const nextAfter = (nextError) => {
          req.url = savedUrl;
          req.baseUrl = savedBase;
          req.params = savedParams;
          next(nextError);
        };

        try {
          const result = isErrorHandler ? handler(error, req, res, nextAfter) : handler(req, res, nextAfter);
          if (result && typeof result.catch === "function") {
            result.catch(nextAfter);
          }
        } catch (thrown) {
          nextAfter(thrown);
        }
      };

      next();
    }

    function addLayer(method, path, handlers, exact) {
      if (Array.isArray(path)) {
        path.forEach((p) => addLayer(method, p, handlers, exact));
        return;
      }
      handlers.flat().forEach((handler) => {
        stack.push({
          method,
          path,
          exact,
          handler,
          matcher: path === null ? null : compile(path, exact),
        });
      });
    }

    const api = {
      handle,
      use(...args) {
        let path = null;
        if (typeof args[0] === "string") {
          path = args.shift();
        }
        if (path === "/") {
          path = null;
        }
        addLayer(null, path, args, false);
        return api;
      },
    };

    ["get", "post", "put", "patch", "delete"].forEach((verb) => {
      api[verb] = (path, ...handlers) => {
        addLayer(verb.toUpperCase(), path, handlers, true);
        return api;
      };
    });

    /* Settings / server calls that make no sense in a browser are ignored. */
    api.set = () => api;
    api.disable = () => api;
    api.listen = () => {};

    return api;
  }

  function Router() {
    const stack = createStack();
    const router = function (req, res, next) {
      stack.handle(req, res, next);
    };
    Object.assign(router, stack);
    return router;
  }

  function express() {
    return createStack();
  }
  express.Router = Router;
  express.json = () => (req, res, next) => next();
  express.urlencoded = () => (req, res, next) => next();

  module.exports = express;
});
