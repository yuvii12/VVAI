/* =========================================================
   LOCAL BACKEND - REPLACEMENTS FOR NODE PACKAGES
   Small browser versions of the packages the backend imports:
   cors, helmet, express-rate-limit, dotenv, fs, path, uuid,
   bcryptjs and jsonwebtoken.
========================================================= */

/* ---------- Packages that are not needed inside a browser ---------- */

["cors", "helmet", "express-rate-limit"].forEach((name) => {
  VVServer.define(name, function (require, module) {
    module.exports = function () {
      return (req, res, next) => next();
    };
  });
});

VVServer.define("dotenv", function (require, module) {
  module.exports = { config() {} };
});

/* ---------- path ---------- */

VVServer.define("path", function (require, module) {
  module.exports = {
    join: (...parts) => parts.filter(Boolean).join("/"),
    resolve: (...parts) => parts.filter(Boolean).join("/"),
    basename: (p) => String(p).split("/").pop(),
    dirname: (p) => String(p).split("/").slice(0, -1).join("/"),
  };
});

/* ---------- fs ----------
   Reads come from the bundled data files (js/local-backend/data/).
   Writes (e.g. saving the AI knowledge base) go to localStorage.
*/
VVServer.define("fs", function (require, module) {
  const storage = () => {
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  };
  const fileName = (p) => String(p).split("/").pop();
  const dataId = (p) => `data/${fileName(p)}`;

  module.exports = {
    readFileSync(p) {
      const saved = storage() && storage().getItem(`vv_fs:${fileName(p)}`);
      if (saved) {
        return saved;
      }
      return JSON.stringify(VVServer.require(dataId(p)));
    },
    existsSync(p) {
      try {
        VVServer.require(dataId(p));
        return true;
      } catch (error) {
        return false;
      }
    },
    writeFileSync(p, content) {
      const store = storage();
      if (store) {
        try {
          store.setItem(`vv_fs:${fileName(p)}`, content);
        } catch (error) {
          /* storage full - ignore */
        }
      }
    },
  };
});

/* ---------- uuid ---------- */

VVServer.define("uuid", function (require, module) {
  function v4() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  module.exports = { v4 };
});

/* ---------- bcryptjs (real library in js/vendor/bcrypt.js) ---------- */

VVServer.define("bcryptjs", function (require, module) {
  module.exports = window.dcodeIO.bcrypt;
});

/* ---------- jsonwebtoken ----------
   Browser-only token helper with the same sign() / verify() API.
   NOTE: runs on the client, so it is a demo-level session token,
   not real security. Use the Node backend for production.
*/
VVServer.define("jsonwebtoken", function (require, module) {
  const encode = (object) =>
    btoa(unescape(encodeURIComponent(JSON.stringify(object))))
      .replace(/=+$/, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const decode = (text) =>
    JSON.parse(decodeURIComponent(escape(atob(text.replace(/-/g, "+").replace(/_/g, "/")))));

  function signature(text, secret) {
    let hash = 5381;
    const input = text + secret;
    for (let i = 0; i < input.length; i += 1) {
      hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
    }
    return (hash >>> 0).toString(36);
  }

  /* "8h" / "7d" / "30m" -> seconds */
  function toSeconds(value) {
    if (typeof value === "number") {
      return value;
    }
    const match = /^(\d+)\s*([smhd])$/.exec(value || "");
    if (!match) {
      return 0;
    }
    return Number(match[1]) * { s: 1, m: 60, h: 3600, d: 86400 }[match[2]];
  }

  function verifySync(token, secret) {
    const parts = String(token).split(".");
    if (parts.length !== 3 || parts[2] !== signature(`${parts[0]}.${parts[1]}`, secret)) {
      throw new Error("invalid token");
    }
    const payload = decode(parts[1]);
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      throw new Error("jwt expired");
    }
    return payload;
  }

  module.exports = {
    sign(payload, secret, options = {}) {
      const issuedAt = Math.floor(Date.now() / 1000);
      const body = Object.assign({}, payload, { iat: issuedAt });
      if (options.expiresIn) {
        body.exp = issuedAt + toSeconds(options.expiresIn);
      }
      const header = encode({ alg: "HS256", typ: "JWT" });
      const content = encode(body);
      return `${header}.${content}.${signature(`${header}.${content}`, secret)}`;
    },
    verify(token, secret, callback) {
      if (typeof callback === "function") {
        try {
          callback(null, verifySync(token, secret));
        } catch (error) {
          callback(error);
        }
        return undefined;
      }
      return verifySync(token, secret);
    },
  };
});
