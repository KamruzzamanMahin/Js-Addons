// DAD Sandboxed JavaScript Addon Bundle - Compiled by @delulu-addon/dad-sdk
var module = (typeof module !== 'undefined') ? module : { exports: {} };
var exports = (typeof exports !== 'undefined') ? exports : module.exports;

"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// node_modules/@delulu-addon/dad-sdk/dist/version.js
var VERSION_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
function isValidVersion(version) {
  return VERSION_RE.test(version);
}

// node_modules/@delulu-addon/dad-sdk/dist/validation.js
function isHttpsUrl(value) {
  if (typeof value !== "string")
    return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
function isBareHttpsUrl(value) {
  if (!isHttpsUrl(value))
    return false;
  const u = new URL(value);
  return u.pathname === "/" && u.search === "" && u.hash === "";
}
function isValidSha256(value) {
  if (typeof value !== "string")
    return false;
  return /^[a-f0-9]{64}$/.test(value);
}
function validateApiKeyShape(value, label = "apiKey") {
  const errors = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`'${label}' must be an object with 'required' (boolean) and 'pageUrl' (https string)`);
    return errors;
  }
  const ak = value;
  if (typeof ak.required !== "boolean") {
    errors.push(`'${label}.required' must be a boolean`);
  }
  const pageUrl = ak.pageUrl !== void 0 ? ak.pageUrl : ak.page_url;
  if (!isHttpsUrl(pageUrl)) {
    errors.push(`'${label}.pageUrl' must be an HTTPS URL`);
  }
  return errors;
}

// node_modules/@delulu-addon/dad-sdk/dist/manifest.js
var DAD_CAPABILITIES = ["meta", "direct_stream", "torrent", "subtitle"];
var DAD_DEFAULT_LOGO_URL = typeof process !== "undefined" && process.env && process.env.DAD_DEFAULT_LOGO_URL || "https://delulu-addons.pages.dev/default_addon_logo.png";
function withDefaultLogo(manifest, defaultLogoUrl = DAD_DEFAULT_LOGO_URL) {
  if (manifest.logo === void 0 || manifest.logo === null || manifest.logo.trim() === "") {
    return { ...manifest, logo: defaultLogoUrl };
  }
  return manifest;
}
var RESERVED_ID_PREFIX = "org.delulu.";
var RESERVED_PUBLISHER = "delulu";
function usesReservedId(id) {
  const lower = id.toLowerCase();
  return lower === RESERVED_ID_PREFIX.slice(0, -1) || lower.startsWith(RESERVED_ID_PREFIX);
}
function validateManifest(raw) {
  const errors = [];
  if (!raw || typeof raw !== "object") {
    return { valid: false, errors: ["Manifest must be an object"] };
  }
  const m = raw;
  const ID_PATTERN = /^[a-z0-9]+(\.[a-z0-9-]+)+$/;
  if (!m.id || typeof m.id !== "string") {
    errors.push("Missing or invalid 'id' string");
  } else if (!ID_PATTERN.test(m.id)) {
    errors.push(`'id' must be reverse-DNS (e.g. 'org.yourname.addon-name') - got '${m.id}'. Same format 'dad init' enforces at scaffold time.`);
  }
  if (typeof m.id === "string" && usesReservedId(m.id)) {
    errors.push(`'id' may not use the reserved '${RESERVED_ID_PREFIX}' namespace - that id space belongs to Delulu's own addons. Use your own reverse-DNS id (e.g. 'com.yourname.addon-name').`);
  }
  if (typeof m.publisher === "string" && m.publisher.trim().toLowerCase() === RESERVED_PUBLISHER) {
    errors.push(`'publisher' may not be '${RESERVED_PUBLISHER}' - that name is reserved for Delulu's own addons. Use your own name or org.`);
  }
  if (!m.name || typeof m.name !== "string")
    errors.push("Missing or invalid 'name' string");
  if (!m.version || typeof m.version !== "string" || !isValidVersion(m.version)) {
    errors.push("Invalid or missing 'version' - must be semantic 'major.minor.patch' (e.g. '2.1.0')");
  }
  const logoUnset = m.logo === void 0 || m.logo === null || typeof m.logo === "string" && m.logo.trim() === "";
  if (!logoUnset && !isHttpsUrl(m.logo)) {
    errors.push("'logo' must be a non-empty HTTPS URL when set - omit it (or use null/'') to fall back to the DAD default logo");
  }
  const validCaps = DAD_CAPABILITIES;
  if (!Array.isArray(m.capabilities) || m.capabilities.length === 0) {
    errors.push("Missing or empty 'capabilities' array");
  } else {
    const seenCaps = /* @__PURE__ */ new Set();
    for (const cap of m.capabilities) {
      if (!validCaps.includes(cap)) {
        errors.push(`Invalid capability '${cap}'. Must be one of: ${validCaps.join(", ")}`);
      } else if (seenCaps.has(cap)) {
        errors.push(`Duplicate capability '${cap}' - declare each capability once`);
      } else {
        seenCaps.add(cap);
      }
    }
  }
  if (m.type === "http") {
    const baseUrl = m.baseUrl !== void 0 ? m.baseUrl : m.base_url;
    if (!baseUrl || typeof baseUrl !== "string") {
      errors.push("HTTP addon requires 'baseUrl' string URL");
    } else if (!isBareHttpsUrl(baseUrl)) {
      errors.push("HTTP addon 'baseUrl' must be a bare HTTPS origin URL - no path, no query string, no fragment (e.g. 'https://addon.example.com'). The addon's routes live directly under it: {baseUrl}/streams/... and its manifest at {baseUrl}/manifest.json.");
    }
    const apiKey = m.apiKey !== void 0 ? m.apiKey : m.api_key;
    if (apiKey !== void 0) {
      errors.push(...validateApiKeyShape(apiKey, "apiKey"));
    }
    if (m.signature !== void 0 || m.publicKeyId !== void 0) {
      errors.push("HTTP addons are NOT signed - remove 'signature' and 'publicKeyId'. They were v1 fields and carry no meaning in v2.");
    }
  } else if (m.type === "js") {
    if (m.baseUrl !== void 0 || m.base_url !== void 0) {
      errors.push("JS addons do not use 'baseUrl' - remove 'baseUrl' and configure 'bundle.url' instead.");
    }
    if (!m.bundle || typeof m.bundle !== "object" || Array.isArray(m.bundle)) {
      errors.push("JS addon requires 'bundle' object with 'url' (https string) and 'sha256' (64 lowercase hex characters)");
    } else {
      if (!m.bundle.url || typeof m.bundle.url !== "string" || !isHttpsUrl(m.bundle.url)) {
        errors.push("JS addon 'bundle.url' must be a valid HTTPS URL pointing to the bundle.js file");
      }
      if (!m.bundle.sha256 || typeof m.bundle.sha256 !== "string" || !isValidSha256(m.bundle.sha256)) {
        errors.push("JS addon 'bundle.sha256' must be exactly 64 lowercase hexadecimal characters");
      }
    }
    const apiKey = m.apiKey !== void 0 ? m.apiKey : m.api_key;
    if (apiKey !== void 0) {
      errors.push(...validateApiKeyShape(apiKey, "apiKey"));
    }
    if (m.signature !== void 0 || m.publicKeyId !== void 0 || m.platform_assets !== void 0 || m.target !== void 0) {
      errors.push("JavaScript addons are sandboxed and NOT signed - remove signing fields ('signature', 'publicKeyId', 'platform_assets').");
    }
  } else {
    errors.push("Invalid 'type'. Must be 'http' or 'js'.");
  }
  return { valid: errors.length === 0, errors };
}

// node_modules/@delulu-addon/dad-sdk/dist/define.js
var CAPABILITY_HANDLERS = {
  meta: "getMeta",
  direct_stream: "getStreams",
  torrent: "getStreams",
  subtitle: "getSubtitles"
};
function assertAddonDefinition(def) {
  let manifestToCheck = def.manifest;
  if (manifestToCheck.type === "js" && manifestToCheck.bundle) {
    const b = manifestToCheck.bundle;
    const sha = !b.sha256 || b.sha256.trim() === "" ? "0".repeat(64) : b.sha256;
    const url = !b.url || b.url.trim() === "" ? "https://localhost/bundle.js" : b.url;
    manifestToCheck = { ...manifestToCheck, bundle: { ...b, url, sha256: sha } };
  }
  const manifestCheck = validateManifest(manifestToCheck);
  if (!manifestCheck.valid) {
    throw new TypeError(`DAD addon '${def.manifest.id}' has an invalid manifest: ${manifestCheck.errors.join("; ")}`);
  }
  const caps = def.manifest.capabilities ?? [];
  const capabilitiesByHandler = /* @__PURE__ */ new Map();
  for (const cap of caps) {
    const handler = CAPABILITY_HANDLERS[cap];
    capabilitiesByHandler.set(handler, cap);
    if (!def[handler]) {
      throw new TypeError(`DAD addon '${def.manifest.id}' declares capability '${cap}' but does not implement handler '${handler}'.`);
    }
  }
  const allHandlers = Object.values(CAPABILITY_HANDLERS);
  const implementedHandlers = Object.keys(def).filter((k) => allHandlers.includes(k) && Boolean(def[k]));
  for (const h of implementedHandlers) {
    if (!capabilitiesByHandler.has(h)) {
      const candidates = Object.keys(CAPABILITY_HANDLERS).filter((c) => CAPABILITY_HANDLERS[c] === h);
      throw new TypeError(`DAD addon '${def.manifest.id}' implements handler '${h}' but does not declare the matching capability. Declare one of: ${candidates.map((c) => `'${c}'`).join(", ")}.`);
    }
  }
}
function defineJsAddon(def) {
  const normalized = { ...def, manifest: withDefaultLogo(def.manifest) };
  assertAddonDefinition(normalized);
  const gMod = typeof globalThis !== "undefined" ? globalThis.module : void 0;
  if (gMod && gMod.exports) {
    if (normalized.getStreams)
      gMod.exports.getStreams = normalized.getStreams;
    if (normalized.getMeta)
      gMod.exports.getMeta = normalized.getMeta;
    if (normalized.getSubtitles)
      gMod.exports.getSubtitles = normalized.getSubtitles;
    gMod.exports.manifest = normalized.manifest;
  }
  return normalized;
}

// manifest.json
var manifest_default = {
  id: "dev.fearless.embegatorjs",
  name: "EmbegatorJS",
  version: "1.0.0",
  type: "js",
  description: "Direct stream resolver for movies and TV with adaptive MP4/HLS quality and embedded captions.",
  publisher: "fearless",
  logo: "https://raw.githubusercontent.com/KamruzzamanMahin/Js-Addons/main/EmbegatorJS/embegatorjs.png",
  bundle: {
    url: "https://raw.githubusercontent.com/KamruzzamanMahin/Js-Addons/main/EmbegatorJS/bundle.js",
    sha256: "91ba9373633d63a4c812b63822d781a7e51ed50abb85938b367e1b5ce8844633"
  },
  capabilities: [
    "direct_stream"
  ]
};

// src/config.ts
var VIDLINK_ORIGIN = "https://vidlink.pro";
var VIDLINK_REFERER = "https://vidlink.pro/";
var DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
var SECRET_KEY_HEX = "c75136c5668bbfe65a7ecad431a745db68b5f381555b38d8f6c699449cf11fcd";
var TOKEN_TTL_SECS = 120;
var RESOLUTION_MAP = {
  "360": "640x360",
  "480": "854x480",
  "720": "1280x720",
  "1080": "1920x1080",
  "1440": "2560x1440",
  "2160": "3840x2160",
  "4k": "3840x2160"
};
var LANG_MAP = [
  ["english", "en"],
  ["bengali", "bn"],
  ["bangla", "bn"],
  ["\u09AC\u09BE\u0982\u09B2\u09BE", "bn"],
  ["spanish", "es"],
  ["espa\xF1ol", "es"],
  ["hindi", "hi"],
  ["\u0939\u093F\u0928\u094D\u0926\u0940", "hi"],
  ["arabic", "ar"],
  ["\u0627\u064E\u0644\u0652\u0639\u064E\u0631\u064E\u0628\u0650\u064A\u064E\u0651\u0629\u064F", "ar"],
  ["french", "fr"],
  ["fran\xE7ais", "fr"],
  ["german", "de"],
  ["deutsch", "de"],
  ["portuguese", "pt"],
  ["portugu\xEAs", "pt"],
  ["russian", "ru"],
  ["\u0440\u0443\u0441\u0441\u043A\u0438\u0439", "ru"],
  ["japanese", "ja"],
  ["chinese", "zh"],
  ["\u4E2D\u6587", "zh"],
  ["korean", "ko"],
  ["italian", "it"],
  ["italiano", "it"],
  ["thai", "th"],
  ["\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22", "th"],
  ["turkish", "tr"],
  ["t\xFCrk\xE7e", "tr"],
  ["vietnamese", "vi"],
  ["ti\u1EBFng vi\u1EC7t", "vi"],
  ["indonesian", "id"],
  ["malay", "ms"],
  ["filipino", "tl"],
  ["urdu", "ur"],
  ["\u0627\u064F\u0631\u062F\u064F\u0648", "ur"],
  ["persian", "fa"],
  ["\u0641\u0627\u0631\u0633\u06CC", "fa"],
  ["punjabi", "pa"],
  ["\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40", "pa"]
];
var PLAYBACK_HEADERS = {
  Referer: VIDLINK_REFERER,
  Origin: VIDLINK_ORIGIN,
  "User-Agent": DEFAULT_UA,
  "Sec-Fetch-Dest": "video",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "cross-site"
};

// node_modules/@noble/ciphers/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
var atitle = (title) => title ? `"${title}" ` : "";
function abool(value, title = "") {
  if (typeof value !== "boolean")
    throw new TypeError(atitle(title) + "expected boolean, got type=" + typeof value);
  return value;
}
function anumber(n, title = "") {
  if (typeof n !== "number")
    throw new TypeError(atitle(title) + "expected number, got " + typeof n);
  if (!Number.isSafeInteger(n) || n < 0)
    throw new RangeError(atitle(title) + "expected integer >= 0, got " + n);
  return n;
}
function abytes(value, length, title = "") {
  if (isBytes(value) && (length === void 0 || value.length === length))
    return value;
  if (length !== void 0)
    anumber(length, "length");
  const bytes = isBytes(value);
  const ofLen = length !== void 0 ? ` of length ${length}` : "";
  const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
  const message = atitle(title) + "expected Uint8Array" + ofLen + ", got " + got;
  if (!bytes)
    throw new TypeError(message);
  throw new RangeError(message);
}
var aobject = (value, label) => {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError(label === "object" ? "expected valid options object" : `"${label}" expected object, got type=${typeof value}`);
};
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("hash was destroyed");
  if (checkFinished && instance.finished)
    throw new Error("digest() was already called");
}
function aoutput(out, instance) {
  abytes(out, void 0, "output");
  const min = instance.outputLen;
  if (!(out.length >= min)) {
    throw new RangeError('"output" expected length >= ' + min);
  }
}
function u32(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
var isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
function byteSwap(word) {
  return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
}
function byteSwap32(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = byteSwap(arr[i]);
  }
  return arr;
}
var swap32IfBE = isLE ? (u) => u : byteSwap32;
function overlapBytes(a, b) {
  if (!a.byteLength || !b.byteLength)
    return false;
  return a.buffer === b.buffer && // best we can do, may fail with an obscure Proxy
  a.byteOffset < b.byteOffset + b.byteLength && // a starts before b end
  b.byteOffset < a.byteOffset + a.byteLength;
}
function complexOverlapBytes(input, output) {
  if (overlapBytes(input, output) && input.byteOffset < output.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function checkOpts(defaults, opts) {
  aobject(defaults, "defaults");
  aobject(opts, "opts");
  const merged = Object.assign(defaults, opts);
  return merged;
}
function equalBytes(a, b) {
  a = abytes(a);
  b = abytes(b);
  if (a.length !== b.length)
    return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++)
    diff |= a[i] ^ b[i];
  return diff === 0;
}
function wrapMacConstructor(keyLen, macCons, fromMsg) {
  const mac = macCons;
  const getArgs = fromMsg || (() => []);
  const macC = (msg, key) => mac(key, ...getArgs(msg)).update(msg).digest();
  const tmp = mac(new Uint8Array(keyLen), ...getArgs(new Uint8Array(0)));
  macC.outputLen = tmp.outputLen;
  macC.blockLen = tmp.blockLen;
  macC.create = (key, ...args) => mac(key, ...args);
  return macC;
}
var wrapCipher = /* @__NO_SIDE_EFFECTS__ */ (params, constructor) => {
  function wrappedCipher(key, ...args) {
    abytes(key, void 0, "key");
    if (params.nonceLength !== void 0) {
      const nonce = args[0];
      abytes(nonce, params.varSizeNonce ? void 0 : params.nonceLength, "nonce");
    }
    const tagl = params.tagLength;
    const aadStart = params.nonceLength !== void 0 ? 1 : 0;
    if (!params.withAAD) {
      for (let i = aadStart; i < args.length; i++)
        if (isBytes(args[i]))
          throw new Error("AAD not supported");
    }
    if (params.withAAD && args[aadStart] !== void 0)
      abytes(args[aadStart], void 0, "AAD");
    const cipher = constructor(key, ...args);
    const checkOutput = (fnLength, output) => {
      if (output !== void 0) {
        if (fnLength !== 2)
          throw new Error("cipher output not supported");
        abytes(output, void 0, "output");
      }
    };
    let called = false;
    const wrCipher = {
      encrypt(data, output) {
        if (called)
          throw new Error("cannot encrypt() twice with same key + nonce");
        called = true;
        abytes(data, void 0, "data");
        checkOutput(cipher.encrypt.length, output);
        return cipher.encrypt(data, output);
      },
      decrypt(data, output) {
        abytes(data, void 0, "data");
        if (tagl && data.length < tagl)
          throw new Error('"ciphertext" expected length >= tagLength=' + tagl);
        checkOutput(cipher.decrypt.length, output);
        return cipher.decrypt(data, output);
      }
    };
    return wrCipher;
  }
  Object.assign(wrappedCipher, params);
  return wrappedCipher;
};
function getOutput(expectedLength, out, onlyAligned = true) {
  if (out === void 0)
    return new Uint8Array(expectedLength);
  abytes(out, expectedLength, "output");
  if (onlyAligned && !isAligned32(out))
    throw new Error("invalid output, must be aligned");
  return out;
}
function isAligned32(bytes) {
  return bytes.byteOffset % 4 === 0;
}
function copyBytes(bytes) {
  return Uint8Array.from(abytes(bytes));
}

// node_modules/@noble/ciphers/_arx.js
var encodeStr = (str) => Uint8Array.from(str.split(""), (c) => c.charCodeAt(0));
var sigma16_32 = /* @__PURE__ */ (() => swap32IfBE(u32(encodeStr("expand 16-byte k"))))();
var sigma32_32 = /* @__PURE__ */ (() => swap32IfBE(u32(encodeStr("expand 32-byte k"))))();
function rotl(a, b) {
  return a << b | a >>> 32 - b;
}
var BLOCK_LEN = 64;
var BLOCK_LEN32 = 16;
var MAX_COUNTER = /* @__PURE__ */ (() => 2 ** 32 - 1)();
var U32_EMPTY = /* @__PURE__ */ Uint32Array.of();
function runCipher(core, sigma, key, nonce, data, output, counter, rounds) {
  const len = data.length;
  const block = new Uint8Array(BLOCK_LEN);
  const b32 = u32(block);
  const isAligned = isLE && isAligned32(data) && isAligned32(output);
  const d32 = isAligned ? u32(data) : U32_EMPTY;
  const o32 = isAligned ? u32(output) : U32_EMPTY;
  if (!isLE) {
    for (let pos = 0; pos < len; counter++) {
      core(sigma, key, nonce, b32, counter, rounds);
      swap32IfBE(b32);
      if (counter >= MAX_COUNTER)
        throw new Error("arx: counter overflow");
      const take = Math.min(BLOCK_LEN, len - pos);
      for (let j = 0, posj; j < take; j++) {
        posj = pos + j;
        output[posj] = data[posj] ^ block[j];
      }
      pos += take;
    }
    return;
  }
  for (let pos = 0; pos < len; counter++) {
    core(sigma, key, nonce, b32, counter, rounds);
    if (counter >= MAX_COUNTER)
      throw new Error("arx: counter overflow");
    const take = Math.min(BLOCK_LEN, len - pos);
    if (isAligned && take === BLOCK_LEN) {
      const pos32 = pos / 4;
      if (pos % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let j = 0, posj; j < BLOCK_LEN32; j++) {
        posj = pos32 + j;
        o32[posj] = d32[posj] ^ b32[j];
      }
      pos += BLOCK_LEN;
      continue;
    }
    for (let j = 0, posj; j < take; j++) {
      posj = pos + j;
      output[posj] = data[posj] ^ block[j];
    }
    pos += take;
  }
}
function createCipher(core, opts) {
  const { allowShortKeys, extendNonceFn, counterLength, counterRight, rounds } = checkOpts({ allowShortKeys: false, counterLength: 8, counterRight: false, rounds: 20 }, opts);
  if (typeof core !== "function")
    throw new Error("core must be a function");
  anumber(counterLength);
  anumber(rounds);
  abool(counterRight);
  abool(allowShortKeys);
  return (key, nonce, data, output, counter = 0) => {
    abytes(key, void 0, "key");
    abytes(nonce, void 0, "nonce");
    abytes(data, void 0, "data");
    const len = data.length;
    const hasOutput = output !== void 0;
    output = getOutput(len, output, false);
    if (hasOutput)
      complexOverlapBytes(data, output);
    anumber(counter);
    if (counter < 0 || counter >= MAX_COUNTER)
      throw new Error("arx: counter overflow");
    const toClean = [];
    let l = key.length;
    let k;
    let sigma;
    if (l === 32) {
      toClean.push(k = copyBytes(key));
      sigma = sigma32_32;
    } else if (l === 16 && allowShortKeys) {
      k = new Uint8Array(32);
      k.set(key);
      k.set(key, 16);
      sigma = sigma16_32;
      toClean.push(k);
    } else {
      abytes(key, 32, "arx key");
      throw new Error("invalid key size");
    }
    if (!isLE || !isAligned32(nonce))
      toClean.push(nonce = copyBytes(nonce));
    let k32 = u32(k);
    if (extendNonceFn) {
      if (nonce.length !== 24)
        throw new Error("arx: extended nonce must be 24 bytes");
      const n16 = nonce.subarray(0, 16);
      if (isLE)
        extendNonceFn(sigma, k32, u32(n16), k32);
      else {
        const sigmaRaw = swap32IfBE(Uint32Array.from(sigma));
        extendNonceFn(sigmaRaw, k32, u32(n16), k32);
        clean(sigmaRaw);
        swap32IfBE(k32);
      }
      nonce = nonce.subarray(16);
    } else if (!isLE)
      swap32IfBE(k32);
    const nonceNcLen = 16 - counterLength;
    if (nonceNcLen !== nonce.length)
      throw new Error(`arx: nonce must be ${nonceNcLen} or 16 bytes`);
    if (nonceNcLen !== 12) {
      const nc = new Uint8Array(12);
      nc.set(nonce, counterRight ? 0 : 12 - nonce.length);
      nonce = nc;
      toClean.push(nonce);
    }
    const n32 = swap32IfBE(u32(nonce));
    try {
      runCipher(core, sigma, k32, n32, data, output, counter, rounds);
      return output;
    } finally {
      clean(...toClean);
    }
  };
}

// node_modules/@noble/ciphers/_poly1305.js
function u8to16(a, i) {
  return a[i++] & 255 | (a[i++] & 255) << 8;
}
var Poly1305 = class {
  // Can be speed-up using BigUint64Array, at the cost of complexity
  constructor(key) {
    __publicField(this, "blockLen", 16);
    __publicField(this, "outputLen", 16);
    __publicField(this, "buffer", new Uint8Array(16));
    __publicField(this, "r", new Uint16Array(10));
    // Allocating 1 array with .subarray() here is slower than 3
    __publicField(this, "h", new Uint16Array(10));
    __publicField(this, "pad", new Uint16Array(8));
    __publicField(this, "pos", 0);
    __publicField(this, "finished", false);
    __publicField(this, "destroyed", false);
    key = copyBytes(abytes(key, 32, "key"));
    const t0 = u8to16(key, 0);
    const t1 = u8to16(key, 2);
    const t2 = u8to16(key, 4);
    const t3 = u8to16(key, 6);
    const t4 = u8to16(key, 8);
    const t5 = u8to16(key, 10);
    const t6 = u8to16(key, 12);
    const t7 = u8to16(key, 14);
    this.r[0] = t0 & 8191;
    this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
    this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
    this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
    this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
    this.r[5] = t4 >>> 1 & 8190;
    this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
    this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
    this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
    this.r[9] = t7 >>> 5 & 127;
    for (let i = 0; i < 8; i++)
      this.pad[i] = u8to16(key, 16 + 2 * i);
  }
  process(data, offset, isLast = false) {
    const hibit = isLast ? 0 : 1 << 11;
    const { h, r } = this;
    const r0 = r[0];
    const r1 = r[1];
    const r2 = r[2];
    const r3 = r[3];
    const r4 = r[4];
    const r5 = r[5];
    const r6 = r[6];
    const r7 = r[7];
    const r8 = r[8];
    const r9 = r[9];
    const t0 = u8to16(data, offset + 0);
    const t1 = u8to16(data, offset + 2);
    const t2 = u8to16(data, offset + 4);
    const t3 = u8to16(data, offset + 6);
    const t4 = u8to16(data, offset + 8);
    const t5 = u8to16(data, offset + 10);
    const t6 = u8to16(data, offset + 12);
    const t7 = u8to16(data, offset + 14);
    let h0 = h[0] + (t0 & 8191);
    let h1 = h[1] + ((t0 >>> 13 | t1 << 3) & 8191);
    let h2 = h[2] + ((t1 >>> 10 | t2 << 6) & 8191);
    let h3 = h[3] + ((t2 >>> 7 | t3 << 9) & 8191);
    let h4 = h[4] + ((t3 >>> 4 | t4 << 12) & 8191);
    let h5 = h[5] + (t4 >>> 1 & 8191);
    let h6 = h[6] + ((t4 >>> 14 | t5 << 2) & 8191);
    let h7 = h[7] + ((t5 >>> 11 | t6 << 5) & 8191);
    let h8 = h[8] + ((t6 >>> 8 | t7 << 8) & 8191);
    let h9 = h[9] + (t7 >>> 5 | hibit);
    let c = 0;
    let d0 = c + h0 * r0 + h1 * (5 * r9) + h2 * (5 * r8) + h3 * (5 * r7) + h4 * (5 * r6);
    c = d0 >>> 13;
    d0 &= 8191;
    d0 += h5 * (5 * r5) + h6 * (5 * r4) + h7 * (5 * r3) + h8 * (5 * r2) + h9 * (5 * r1);
    c += d0 >>> 13;
    d0 &= 8191;
    let d1 = c + h0 * r1 + h1 * r0 + h2 * (5 * r9) + h3 * (5 * r8) + h4 * (5 * r7);
    c = d1 >>> 13;
    d1 &= 8191;
    d1 += h5 * (5 * r6) + h6 * (5 * r5) + h7 * (5 * r4) + h8 * (5 * r3) + h9 * (5 * r2);
    c += d1 >>> 13;
    d1 &= 8191;
    let d2 = c + h0 * r2 + h1 * r1 + h2 * r0 + h3 * (5 * r9) + h4 * (5 * r8);
    c = d2 >>> 13;
    d2 &= 8191;
    d2 += h5 * (5 * r7) + h6 * (5 * r6) + h7 * (5 * r5) + h8 * (5 * r4) + h9 * (5 * r3);
    c += d2 >>> 13;
    d2 &= 8191;
    let d3 = c + h0 * r3 + h1 * r2 + h2 * r1 + h3 * r0 + h4 * (5 * r9);
    c = d3 >>> 13;
    d3 &= 8191;
    d3 += h5 * (5 * r8) + h6 * (5 * r7) + h7 * (5 * r6) + h8 * (5 * r5) + h9 * (5 * r4);
    c += d3 >>> 13;
    d3 &= 8191;
    let d4 = c + h0 * r4 + h1 * r3 + h2 * r2 + h3 * r1 + h4 * r0;
    c = d4 >>> 13;
    d4 &= 8191;
    d4 += h5 * (5 * r9) + h6 * (5 * r8) + h7 * (5 * r7) + h8 * (5 * r6) + h9 * (5 * r5);
    c += d4 >>> 13;
    d4 &= 8191;
    let d5 = c + h0 * r5 + h1 * r4 + h2 * r3 + h3 * r2 + h4 * r1;
    c = d5 >>> 13;
    d5 &= 8191;
    d5 += h5 * r0 + h6 * (5 * r9) + h7 * (5 * r8) + h8 * (5 * r7) + h9 * (5 * r6);
    c += d5 >>> 13;
    d5 &= 8191;
    let d6 = c + h0 * r6 + h1 * r5 + h2 * r4 + h3 * r3 + h4 * r2;
    c = d6 >>> 13;
    d6 &= 8191;
    d6 += h5 * r1 + h6 * r0 + h7 * (5 * r9) + h8 * (5 * r8) + h9 * (5 * r7);
    c += d6 >>> 13;
    d6 &= 8191;
    let d7 = c + h0 * r7 + h1 * r6 + h2 * r5 + h3 * r4 + h4 * r3;
    c = d7 >>> 13;
    d7 &= 8191;
    d7 += h5 * r2 + h6 * r1 + h7 * r0 + h8 * (5 * r9) + h9 * (5 * r8);
    c += d7 >>> 13;
    d7 &= 8191;
    let d8 = c + h0 * r8 + h1 * r7 + h2 * r6 + h3 * r5 + h4 * r4;
    c = d8 >>> 13;
    d8 &= 8191;
    d8 += h5 * r3 + h6 * r2 + h7 * r1 + h8 * r0 + h9 * (5 * r9);
    c += d8 >>> 13;
    d8 &= 8191;
    let d9 = c + h0 * r9 + h1 * r8 + h2 * r7 + h3 * r6 + h4 * r5;
    c = d9 >>> 13;
    d9 &= 8191;
    d9 += h5 * r4 + h6 * r3 + h7 * r2 + h8 * r1 + h9 * r0;
    c += d9 >>> 13;
    d9 &= 8191;
    c = (c << 2) + c | 0;
    c = c + d0 | 0;
    d0 = c & 8191;
    c = c >>> 13;
    d1 += c;
    h[0] = d0;
    h[1] = d1;
    h[2] = d2;
    h[3] = d3;
    h[4] = d4;
    h[5] = d5;
    h[6] = d6;
    h[7] = d7;
    h[8] = d8;
    h[9] = d9;
  }
  finalize() {
    const { h, pad } = this;
    const g = new Uint16Array(10);
    let c = h[1] >>> 13;
    h[1] &= 8191;
    for (let i = 2; i < 10; i++) {
      h[i] += c;
      c = h[i] >>> 13;
      h[i] &= 8191;
    }
    h[0] += c * 5;
    c = h[0] >>> 13;
    h[0] &= 8191;
    h[1] += c;
    c = h[1] >>> 13;
    h[1] &= 8191;
    h[2] += c;
    g[0] = h[0] + 5;
    c = g[0] >>> 13;
    g[0] &= 8191;
    for (let i = 1; i < 10; i++) {
      g[i] = h[i] + c;
      c = g[i] >>> 13;
      g[i] &= 8191;
    }
    g[9] -= 1 << 13;
    let mask = (c ^ 1) - 1;
    for (let i = 0; i < 10; i++)
      g[i] &= mask;
    mask = ~mask;
    for (let i = 0; i < 10; i++)
      h[i] = h[i] & mask | g[i];
    h[0] = (h[0] | h[1] << 13) & 65535;
    h[1] = (h[1] >>> 3 | h[2] << 10) & 65535;
    h[2] = (h[2] >>> 6 | h[3] << 7) & 65535;
    h[3] = (h[3] >>> 9 | h[4] << 4) & 65535;
    h[4] = (h[4] >>> 12 | h[5] << 1 | h[6] << 14) & 65535;
    h[5] = (h[6] >>> 2 | h[7] << 11) & 65535;
    h[6] = (h[7] >>> 5 | h[8] << 8) & 65535;
    h[7] = (h[8] >>> 8 | h[9] << 5) & 65535;
    let f = h[0] + pad[0];
    h[0] = f & 65535;
    for (let i = 1; i < 8; i++) {
      f = (h[i] + pad[i] | 0) + (f >>> 16) | 0;
      h[i] = f & 65535;
    }
    clean(g);
  }
  update(data) {
    aexists(this);
    abytes(data);
    data = copyBytes(data);
    const { buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(data, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(buffer, 0, false);
        this.pos = 0;
      }
    }
    return this;
  }
  destroy() {
    this.destroyed = true;
    clean(this.h, this.r, this.buffer, this.pad);
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, h } = this;
    let { pos } = this;
    if (pos) {
      buffer[pos++] = 1;
      for (; pos < 16; pos++)
        buffer[pos] = 0;
      this.process(buffer, 0, true);
    }
    this.finalize();
    let opos = 0;
    for (let i = 0; i < 8; i++) {
      out[opos++] = h[i] >>> 0;
      out[opos++] = h[i] >>> 8;
    }
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
};
var poly1305 = /* @__PURE__ */ wrapMacConstructor(32, (key) => new Poly1305(key));

// node_modules/@noble/ciphers/salsa.js
function salsaCore(s, k, n, out, cnt, rounds = 20, cntHi = 0) {
  let y00 = s[0], y01 = k[0], y02 = k[1], y03 = k[2], y04 = k[3], y05 = s[1], y06 = n[0], y07 = n[1], y08 = cnt, y09 = cntHi, y10 = s[2], y11 = k[4], y12 = k[5], y13 = k[6], y14 = k[7], y15 = s[3];
  let x00 = y00, x01 = y01, x02 = y02, x03 = y03, x04 = y04, x05 = y05, x06 = y06, x07 = y07, x08 = y08, x09 = y09, x10 = y10, x11 = y11, x12 = y12, x13 = y13, x14 = y14, x15 = y15;
  for (let r = 0; r < rounds; r += 2) {
    x04 ^= rotl(x00 + x12 | 0, 7);
    x08 ^= rotl(x04 + x00 | 0, 9);
    x12 ^= rotl(x08 + x04 | 0, 13);
    x00 ^= rotl(x12 + x08 | 0, 18);
    x09 ^= rotl(x05 + x01 | 0, 7);
    x13 ^= rotl(x09 + x05 | 0, 9);
    x01 ^= rotl(x13 + x09 | 0, 13);
    x05 ^= rotl(x01 + x13 | 0, 18);
    x14 ^= rotl(x10 + x06 | 0, 7);
    x02 ^= rotl(x14 + x10 | 0, 9);
    x06 ^= rotl(x02 + x14 | 0, 13);
    x10 ^= rotl(x06 + x02 | 0, 18);
    x03 ^= rotl(x15 + x11 | 0, 7);
    x07 ^= rotl(x03 + x15 | 0, 9);
    x11 ^= rotl(x07 + x03 | 0, 13);
    x15 ^= rotl(x11 + x07 | 0, 18);
    x01 ^= rotl(x00 + x03 | 0, 7);
    x02 ^= rotl(x01 + x00 | 0, 9);
    x03 ^= rotl(x02 + x01 | 0, 13);
    x00 ^= rotl(x03 + x02 | 0, 18);
    x06 ^= rotl(x05 + x04 | 0, 7);
    x07 ^= rotl(x06 + x05 | 0, 9);
    x04 ^= rotl(x07 + x06 | 0, 13);
    x05 ^= rotl(x04 + x07 | 0, 18);
    x11 ^= rotl(x10 + x09 | 0, 7);
    x08 ^= rotl(x11 + x10 | 0, 9);
    x09 ^= rotl(x08 + x11 | 0, 13);
    x10 ^= rotl(x09 + x08 | 0, 18);
    x12 ^= rotl(x15 + x14 | 0, 7);
    x13 ^= rotl(x12 + x15 | 0, 9);
    x14 ^= rotl(x13 + x12 | 0, 13);
    x15 ^= rotl(x14 + x13 | 0, 18);
  }
  let oi = 0;
  out[oi++] = y00 + x00 | 0;
  out[oi++] = y01 + x01 | 0;
  out[oi++] = y02 + x02 | 0;
  out[oi++] = y03 + x03 | 0;
  out[oi++] = y04 + x04 | 0;
  out[oi++] = y05 + x05 | 0;
  out[oi++] = y06 + x06 | 0;
  out[oi++] = y07 + x07 | 0;
  out[oi++] = y08 + x08 | 0;
  out[oi++] = y09 + x09 | 0;
  out[oi++] = y10 + x10 | 0;
  out[oi++] = y11 + x11 | 0;
  out[oi++] = y12 + x12 | 0;
  out[oi++] = y13 + x13 | 0;
  out[oi++] = y14 + x14 | 0;
  out[oi++] = y15 + x15 | 0;
}
function hsalsa(s, k, i, out) {
  const s2 = isLE ? s : swap32IfBE(s.slice(0, 4));
  const k2 = isLE ? k : swap32IfBE(k.slice(0, 8));
  const i2 = isLE ? i : swap32IfBE(i.slice(0, 4));
  const t = new Uint32Array(16);
  salsaCore(s2, k2, i2.subarray(0, 2), t, i2[2], 20, i2[3]);
  let oi = 0;
  out[oi++] = t[0] - s2[0] | 0;
  out[oi++] = t[5] - s2[1] | 0;
  out[oi++] = t[10] - s2[2] | 0;
  out[oi++] = t[15] - s2[3] | 0;
  out[oi++] = t[6] - i2[0] | 0;
  out[oi++] = t[7] - i2[1] | 0;
  out[oi++] = t[8] - i2[2] | 0;
  out[oi++] = t[9] - i2[3] | 0;
  swap32IfBE(out);
  if (!isLE)
    clean(s2, k2, i2);
  clean(t);
}
var xsalsa20 = /* @__PURE__ */ createCipher(salsaCore, {
  counterRight: true,
  extendNonceFn: hsalsa
});
var xsalsa20poly1305 = /* @__PURE__ */ wrapCipher({ blockSize: 64, nonceLength: 24, tagLength: 16 }, (key, nonce) => {
  return {
    encrypt(plaintext, output) {
      output = getOutput(plaintext.length + 32, output, false);
      const authKey = output.subarray(0, 32);
      const ciphPlaintext = output.subarray(32);
      output.set(plaintext, 32);
      clean(authKey);
      xsalsa20(key, nonce, output, output);
      const tag = poly1305(ciphPlaintext, authKey);
      output.set(tag, 16);
      clean(output.subarray(0, 16), tag);
      return output.subarray(16);
    },
    decrypt(ciphertext, output) {
      abytes(ciphertext, void 0, "data");
      output = getOutput(ciphertext.length + 32, output, false);
      const tmp = output.subarray(0, 32);
      const passedTag = output.subarray(32, 48);
      const ciphPlaintext = output.subarray(48);
      output.set(ciphertext, 32);
      clean(tmp);
      const authKey = xsalsa20(key, nonce, tmp, tmp);
      const tag = poly1305(ciphPlaintext, authKey);
      if (!equalBytes(passedTag, tag)) {
        clean(output);
        throw new Error("invalid tag");
      }
      xsalsa20(key, nonce, output.subarray(16), output.subarray(16));
      clean(tmp, passedTag, tag);
      return ciphPlaintext;
    }
  };
});
function secretbox(key, nonce) {
  const xs = xsalsa20poly1305(key, nonce);
  return { seal: xs.encrypt, open: xs.decrypt };
}

// src/crypto.ts
var B64URL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
function hexToBytes(hex) {
  if (hex.length !== 64) {
    throw new Error(`Secret key must be 64 hex characters, got ${hex.length}`);
  }
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    const byte = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    if (isNaN(byte)) {
      throw new Error(`Invalid hex byte at index ${i * 2}`);
    }
    bytes[i] = byte;
  }
  return bytes;
}
function uint8ArrayToBase64Url(bytes) {
  let str = "";
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;
    const triplet = b0 << 16 | b1 << 8 | b2;
    str += B64URL_CHARS[triplet >> 18 & 63];
    str += B64URL_CHARS[triplet >> 12 & 63];
    if (i + 1 < len) {
      str += B64URL_CHARS[triplet >> 6 & 63];
    }
    if (i + 2 < len) {
      str += B64URL_CHARS[triplet & 63];
    }
  }
  return str;
}
function encryptToken(mediaId, timestamp) {
  const key = hexToBytes(SECRET_KEY_HEX);
  const nonce = new Uint8Array(24);
  const encoder = new TextEncoder();
  const mediaBytes = encoder.encode(mediaId);
  const timeBytes = new Uint8Array(8);
  const view = new DataView(timeBytes.buffer);
  view.setBigUint64(0, BigInt(timestamp), false);
  const message = new Uint8Array(mediaBytes.length + 8);
  message.set(mediaBytes, 0);
  message.set(timeBytes, mediaBytes.length);
  const box = secretbox(key, nonce);
  const sealed = box.seal(message);
  const payload = new Uint8Array(nonce.length + sealed.length);
  payload.set(nonce, 0);
  payload.set(sealed, nonce.length);
  return uint8ArrayToBase64Url(payload);
}
function getVidlinkToken(mediaId) {
  const now = Math.floor(Date.now() / 1e3);
  return encryptToken(mediaId, now + TOKEN_TTL_SECS);
}

// src/resolver.ts
function qualityWeight(label) {
  const digits = label.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}
function normalizeLanguageCode(raw) {
  if (!raw || !raw.trim()) {
    return ["Unknown", "und"];
  }
  let clean2 = raw.trim();
  if (clean2.includes(" - ")) {
    clean2 = clean2.split(" - ")[0].trim();
  }
  const lower = clean2.toLowerCase();
  for (const [key, code] of LANG_MAP) {
    if (lower.includes(key)) {
      return [clean2, code];
    }
  }
  if (/^[a-zA-Z]{2}/.test(clean2)) {
    return [clean2, clean2.substring(0, 2).toLowerCase()];
  }
  return [clean2, "und"];
}
function subtitleFormat(capType, url) {
  const hint = (capType || "").toLowerCase();
  const probe = hint || url.toLowerCase();
  if (probe.includes("vtt")) return "vtt";
  if (probe.includes("srt")) return "srt";
  if (probe.includes("ssa")) return "ssa";
  if (probe.includes("ass")) return "ass";
  if (probe.includes("ttml")) return "ttml";
  if (probe.includes("dfxp")) return "dfxp";
  return "srt";
}
async function resolveStreams(req) {
  const { tmdb_id, media_type, s, e } = req;
  const isMovie = media_type === "movie";
  const season = s ?? 1;
  const episode = e ?? 1;
  let token;
  try {
    token = getVidlinkToken(String(tmdb_id));
  } catch (err) {
    console.error("[EmbeGatorJS] Token generation failed:", err);
    return [];
  }
  const apiUrl = isMovie ? `${VIDLINK_ORIGIN}/api/b/movie/${token}` : `${VIDLINK_ORIGIN}/api/b/tv/${token}/${season}/${episode}`;
  const referer = isMovie ? `${VIDLINK_ORIGIN}/movie/${tmdb_id}` : `${VIDLINK_ORIGIN}/tv/${tmdb_id}/${season}/${episode}`;
  let data;
  try {
    const resp = await fetch(apiUrl, {
      headers: {
        "User-Agent": DEFAULT_UA,
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: referer,
        Origin: VIDLINK_ORIGIN,
        "X-Playback-Environment": "hls"
      }
    });
    if (!resp.ok) {
      return [];
    }
    const text = (await resp.text()).trim();
    if (!text || text === "null") {
      return [];
    }
    data = JSON.parse(text);
  } catch (err) {
    console.error("[EmbeGatorJS] Upstream request failed:", err);
    return [];
  }
  const streamData = data?.stream;
  const qualities = streamData?.qualities;
  if (!qualities || typeof qualities !== "object") {
    return [];
  }
  const rawCaptions = Array.isArray(streamData.captions) ? streamData.captions : [];
  const subtitles = [];
  const seenSubs = /* @__PURE__ */ new Set();
  for (const cap of rawCaptions) {
    const cUrl = cap?.url?.trim();
    if (!cUrl || seenSubs.has(cUrl)) {
      continue;
    }
    seenSubs.add(cUrl);
    const [language, langCode] = normalizeLanguageCode(cap.language);
    const format = subtitleFormat(cap.type, cUrl);
    const subId = cap.id?.trim() || `${langCode}-${subtitles.length + 1}`;
    subtitles.push({
      id: subId,
      url: cUrl,
      lang_code: langCode,
      language,
      title: language,
      format
    });
  }
  const qualityKeys = Object.keys(qualities).sort((a, b) => qualityWeight(b) - qualityWeight(a));
  const streams = [];
  for (const qKey of qualityKeys) {
    const qInfo = qualities[qKey];
    if (!qInfo || typeof qInfo !== "object") continue;
    const rawUrl = qInfo.url?.trim();
    if (!rawUrl) continue;
    const codecRaw = (qInfo.codecName || "").toUpperCase();
    let codec;
    if (codecRaw === "H265" || codecRaw === "HEVC") {
      codec = "HEVC";
    } else if (codecRaw === "H264" || codecRaw === "AVC") {
      codec = "H.264";
    } else if (!codecRaw) {
      codec = "HEVC";
    } else {
      codec = codecRaw;
    }
    let sizeGb = null;
    if (qInfo.size !== void 0 && qInfo.size !== null) {
      const bytes = typeof qInfo.size === "string" ? parseInt(qInfo.size, 10) : Number(qInfo.size);
      if (!isNaN(bytes) && bytes > 0) {
        sizeGb = Math.round(bytes / 1073741824 * 100) / 100;
      }
    }
    const qClean = qKey.endsWith("p") ? qKey : `${qKey}p`;
    const resKey = qKey.toLowerCase().replace("p", "");
    const resolution = RESOLUTION_MAP[resKey] || null;
    const qType = (qInfo.type || "mp4").toLowerCase();
    const mediaFormat = qType.includes("mp4") || rawUrl.includes(".mp4") ? "mp4" : "hls";
    const title = isMovie ? `VidLink Movie [${qClean} ${codec}]` : `VidLink S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")} [${qClean} ${codec}]`;
    streams.push({
      type: "direct",
      title,
      stream_url: rawUrl,
      needs_proxy: true,
      headers: { ...PLAYBACK_HEADERS },
      media_format: mediaFormat,
      resolution,
      codec,
      size_gb: sizeGb,
      audio_languages: ["Original Audio"],
      subtitles: subtitles.length > 0 ? subtitles : null
    });
  }
  return streams;
}

// src/index.ts
var index_default = defineJsAddon({
  manifest: manifest_default,
  /**
   * Called when Delulu Core requests direct streams for a movie or TV episode.
   */
  async getStreams(req) {
    const tmdbId = req.tmdb_id ?? req.tmdbId;
    const mediaType = req.media_type ?? req.mediaType;
    if (!tmdbId || !mediaType) {
      return [];
    }
    return await resolveStreams(req);
  }
});
/*! Bundled license information:

@noble/ciphers/utils.js:
  (*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) *)
*/
