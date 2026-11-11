// DAD Sandboxed JavaScript Addon Bundle - Compiled by @delulu-addon/dad-sdk
var module = (typeof module !== 'undefined') ? module : { exports: {} };
var exports = (typeof exports !== 'undefined') ? exports : module.exports;

"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
    errors.push("'logo' must be a non-empty HTTPS URL when set - omit it (or use null/'') and the client will render its own default");
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
  const normalized = def;
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

// node_modules/@delulu-addon/dad-sdk/dist/sandbox.js
var CryptoJS = typeof globalThis !== "undefined" ? globalThis.CryptoJS : void 0;
var cheerio = typeof globalThis !== "undefined" ? globalThis.cheerio : void 0;

// manifest.json
var manifest_default = {
  id: "dev.fearless.scrapyjs",
  name: "ScrapyJS",
  version: "0.1.1",
  type: "js",
  description: "High-quality movie & TV streams in up to 4K HDR/Dolby Vision. Direct file URLs, resolved keylessly.",
  publisher: "fearless",
  logo: "https://delulu-addons.pages.dev/default_addon_logo.png",
  bundle: {
    url: "https://raw.githubusercontent.com/KamruzzamanMahin/Js-Addons/main/ScrapyJS/bundle.js",
    sha256: "4d71c20b03fe9f235b8e014715c44d2577dc5e79ff94fcafbfafeda8cad6cc98"
  },
  capabilities: [
    "direct_stream"
  ]
};

// src/config.ts
var SITE_ORIGIN = "https://4khdhub.one";
var SITE_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
var ID_API_BASE = "https://id-api.not-phoenix.workers.dev";
var CINEMETA_BASE = "https://v3-cinemeta.strem.io";
var MAX_CANDIDATE_PAGES = 3;
var MAX_RESOLVED_STREAMS = 3;
var DRIVE_CONCURRENCY = 3;
function siteHeaders(referer) {
  const headers = {
    "User-Agent": SITE_UA,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9"
  };
  if (referer) headers["Referer"] = referer;
  return headers;
}

// src/http.ts
async function fetchText(url, headers) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch(url, { headers });
      if (res.status >= 500 && attempt === 0) {
        continue;
      }
      if (!res.ok) {
        console.warn(`[ScrapyJS] upstream ${url} -> HTTP ${res.status}`);
        return null;
      }
      const text = await res.text();
      if (text && text.trim()) return text;
      console.warn(`[ScrapyJS] upstream ${url} returned an empty body`);
      return null;
    } catch (err) {
      if (attempt > 0) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[ScrapyJS] upstream request failed: ${url} :: ${msg}`);
        return null;
      }
    }
  }
  return null;
}
async function fetchJson(url, headers) {
  const text = await fetchText(url, headers);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (err) {
    console.warn(`[ScrapyJS] invalid JSON from ${url} :: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

// src/dom.ts
function isNativeDom() {
  const g = globalThis;
  return !!g && typeof g.cheerio === "object" && typeof g.cheerio.load === "function";
}
function loadNativeDoc(html) {
  if (!isNativeDom()) return null;
  try {
    const load = globalThis.cheerio.load(String(html || ""));
    return {
      $(locator) {
        return load(locator);
      }
    };
  } catch {
    return null;
  }
}
function cleanText(raw) {
  return String(raw ?? "").replace(/\s+/g, " ").trim();
}
function firstText(selection) {
  try {
    const first = selection.first();
    return cleanText(first?.text?.() ?? "");
  } catch {
    return "";
  }
}
function firstHtml(selection) {
  try {
    return String(selection.first()?.html?.() ?? "");
  } catch {
    return "";
  }
}
function eachOf(selection, visit) {
  selection.each(function() {
    visit(this);
  });
}
function eachText(selection) {
  const out = [];
  eachOf(selection, (item) => {
    out.push(cleanText(item?.text?.() ?? ""));
  });
  return out;
}
function eachLink(selection) {
  const out = [];
  eachOf(selection, (item) => {
    out.push({
      href: String(item?.attr?.("href") ?? ""),
      text: String(item?.text?.() ?? "")
    });
  });
  return out;
}

// src/site.ts
function searchVariants(title) {
  const clean = title.replace(/[^\p{L}\p{N}\s'-]/gu, " ").replace(/\s+/g, " ").trim();
  const variants = [clean];
  const noArticle = clean.replace(/^the\s+(.+)/i, "$1");
  if (noArticle && noArticle.toLowerCase() !== clean.toLowerCase()) variants.push(noArticle);
  return variants.filter(Boolean);
}
function parseSlug(slug) {
  const match = slug.match(/^(.+)-(movie|series)-(\d+)$/i);
  if (!match) return null;
  return { titleSlug: match[1], kind: match[2], siteId: parseInt(match[3], 10) };
}
function tmdbPosterPathOf(raw) {
  if (!raw) return null;
  const match = raw.match(/image\.tmdb\.org\/t\/p\/[^/'"]+\/([A-Za-z0-9._-]+?\.(?:jpg|png|webp))/i);
  return match ? match[1] : null;
}
function slugFromHref(href) {
  const path = href.replace(/^https?:\/\/[^/]+/i, "").replace(/^\/+|\/+$/g, "");
  return path || null;
}
async function searchCards(query) {
  const url = `${SITE_ORIGIN}/?s=${encodeURIComponent(query)}`;
  const html = await fetchText(url, siteHeaders(SITE_ORIGIN + "/"));
  if (!html) return [];
  const native = nativeSearchCards(html);
  if (native.length > 0) return native;
  return regexSearchCards(html);
}
function nativeSearchCards(html) {
  const doc = loadNativeDoc(html);
  if (!doc) return [];
  const cards = [];
  const seen = /* @__PURE__ */ new Set();
  eachOf(doc.$("a.movie-card"), (card) => {
    const slug = slugFromHref(String(card?.attr?.("href") ?? ""));
    if (!slug || seen.has(slug)) return;
    const parsed = parseSlug(slug);
    if (!parsed) return;
    const title = firstText(card.find(".movie-card-title"));
    if (!title) return;
    const yearMatch = firstText(card.find(".movie-card-meta")).match(/(\d{4})/);
    const poster = tmdbPosterPathOf(String(card.find("img").first().attr?.("src") ?? ""));
    seen.add(slug);
    cards.push({
      slug,
      pageUrl: `${SITE_ORIGIN}/${slug}/`,
      title,
      year: yearMatch ? parseInt(yearMatch[1], 10) : null,
      kind: parsed.kind,
      posterPath: poster
    });
  });
  return cards;
}
function regexSearchCards(html) {
  const cards = [];
  const seen = /* @__PURE__ */ new Set();
  const anchorRe = /<a\s+href="\/([a-z0-9-]+-(?:movie|series)-\d+)\/"\s+class="movie-card"[^>]*>([\s\S]*?)<\/a>/gi;
  let anchorMatch;
  while ((anchorMatch = anchorRe.exec(html)) !== null) {
    const [, slug, body] = anchorMatch;
    if (seen.has(slug)) continue;
    seen.add(slug);
    const parsed = parseSlug(slug);
    if (!parsed) continue;
    const img = body.match(/<img\s+src="([^"]+)"[^>]*>/i);
    const titleMatch = body.match(/movie-card-title">([^<]+)</i);
    const metaMatch = body.match(/movie-card-meta">([\s\S]*?)<\/p>/i);
    const title = titleMatch?.[1]?.trim();
    if (!title) continue;
    const yearMatch = metaMatch?.[1]?.match(/(\d{4})/);
    cards.push({
      slug,
      pageUrl: `${SITE_ORIGIN}/${slug}/`,
      title: decodeHtml(title),
      year: yearMatch ? parseInt(yearMatch[1], 10) : null,
      kind: parsed.kind,
      posterPath: tmdbPosterPathOf(img?.[1])
    });
  }
  return cards;
}
async function fetchDetailPage(pageUrl) {
  return await fetchText(pageUrl, siteHeaders(SITE_ORIGIN + "/"));
}
function extractTmdbId(html) {
  const patterns = [
    /defaultVideoId\s*=\s*['"](\d+)['"]/,
    /videasy\.net\/movie\/(\d+)/,
    /videasy\.net\/tv\/(\d+)/,
    /autoembed\.cc\/embed\/(?:movie|tv)\/(\d+)/
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match) return parseInt(match[1], 10);
  }
  return null;
}
function detailPosterPath(html) {
  const match = html.match(/image\.tmdb\.org\/t\/p\/[^/'"]+\/([A-Za-z0-9._-]+?\.(?:jpg|png|webp))/i);
  return match?.[1] ?? null;
}
function decodeHtml(input) {
  return input.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'").replace(/&#x2F;/gi, "/");
}

// src/tmdb.ts
function parseYear(releaseInfo) {
  if (!releaseInfo) return null;
  const match = releaseInfo.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : null;
}
function posterPathOf(posterUrl) {
  if (!posterUrl) return null;
  const match = posterUrl.match(/image\.tmdb\.org\/t\/p\/[^/]+\/([A-Za-z0-9._-]+?\.(?:jpg|png|webp))/i);
  return match ? match[1] : null;
}
async function resolveTitleInfo(tmdbId, mediaType) {
  const apiType = mediaType === "movie" ? "movie" : "tv";
  const cinemetaType = mediaType === "movie" ? "movie" : "series";
  const headers = siteHeaders();
  const hop1 = await fetchJson(
    `${ID_API_BASE}/tmdb/${apiType}/${tmdbId}`,
    headers
  );
  if (!hop1?.found || typeof hop1.imdb_id !== "string" || !hop1.imdb_id.trim()) {
    console.warn(`[ScrapyJS] no IMDb id for ${apiType}/${tmdbId}`);
    return null;
  }
  const hop2 = await fetchJson(
    `${CINEMETA_BASE}/meta/${cinemetaType}/${hop1.imdb_id.trim()}.json`,
    headers
  );
  const metaName = hop2?.meta?.name?.trim();
  if (!metaName) {
    console.warn(`[ScrapyJS] no Cinemeta meta for ${hop1.imdb_id}`);
    return null;
  }
  const lookup = {
    title: metaName,
    year: parseYear(hop2?.meta?.releaseInfo),
    posterPath: posterPathOf(hop2?.meta?.poster)
  };
  return lookup;
}

// src/primitives.ts
var B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function b64Decode(input) {
  let clean = input.replace(/-/g, "+").replace(/_/g, "/").trim();
  while (clean.length % 4 !== 0) clean += "=";
  const g = globalThis;
  if (typeof g.atob === "function") {
    try {
      return g.atob(clean);
    } catch {
    }
  }
  let out = "";
  for (let i = 0; i < clean.length; i += 4) {
    const e0 = B64_CHARS.indexOf(clean[i]);
    const e1 = B64_CHARS.indexOf(clean[i + 1]);
    const e2 = B64_CHARS.indexOf(clean[i + 2]);
    const e3 = B64_CHARS.indexOf(clean[i + 3]);
    if (e0 < 0 || e1 < 0) break;
    out += String.fromCharCode(e0 << 2 | e1 >> 4);
    if (clean[i + 2] !== "=" && e2 >= 0) {
      out += String.fromCharCode((e1 & 15) << 4 | e2 >> 2);
    }
    if (clean[i + 3] !== "=" && e2 >= 0 && e3 >= 0) {
      out += String.fromCharCode((e2 & 3) << 6 | e3);
    }
  }
  return out;
}
function rot13(input) {
  return input.replace(/[a-zA-Z]/g, (c) => {
    const code = c.charCodeAt(0);
    const base = c <= "Z" ? 90 : 122;
    return String.fromCharCode(base >= code + 13 ? code + 13 : code - 13);
  });
}
function unwrapRelayToken(token) {
  let value = b64Decode(token);
  if (!value) return null;
  value = b64Decode(value);
  value = rot13(value);
  value = b64Decode(value);
  try {
    const parsed = JSON.parse(value.trim());
    if (typeof parsed.l === "string" && typeof parsed.o === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

// src/hosts.ts
function parseSizeGb(raw) {
  if (!raw) return null;
  const match = raw.match(/([\d.]+)\s*(GB|MB|MiB|GiB)/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  if (isNaN(value) || value <= 0) return null;
  const unit = match[2].toUpperCase();
  if (unit === "GB" || unit === "GIB") return Math.round(value * 100) / 100;
  return Math.round(value / 1024 * 100) / 100;
}
function extractRelayToken(pageHtml) {
  const match = pageHtml.match(/\bs\(\s*['"]o['"]\s*,\s*'([A-Za-z0-9+/=_-]+)'/);
  return match ? match[1] : null;
}
function extractDriveSize(pageHtml) {
  const match = pageHtml.match(/File Size<i[^>]*>([^<]+)<\/i>/i);
  return match ? parseSizeGb(match[1]) : null;
}
function extractFileName(pageHtml) {
  const title = pageHtml.match(/<title>([\s\S]*?)<\/title>/i);
  if (title?.[1]) return title[1].trim();
  const card = pageHtml.match(/card-header[\s\S]*?>\s*([\s\S]*?)\s*<\/div>/i);
  return card?.[1]?.trim() ?? null;
}
async function resolveDriveLink(linkUrl) {
  try {
    const relay = await fetchText(linkUrl, siteHeaders(SITE_ORIGIN + "/"));
    if (!relay) return null;
    const token = extractRelayToken(relay);
    if (!token) {
      console.warn("[ScrapyJS] relay page carried no token:", linkUrl.slice(0, 80));
      return null;
    }
    const unwrapped = unwrapRelayToken(token);
    if (!unwrapped) {
      console.warn("[ScrapyJS] relay token unwrap failed");
      return null;
    }
    const driveUrl = b64Decode(unwrapped.o);
    if (!/^https:\/\//i.test(driveUrl)) {
      console.warn("[ScrapyJS] unwrapped drive URL is not https:", driveUrl.slice(0, 60));
      return null;
    }
    const drive = await fetchText(driveUrl, siteHeaders(unwrapped.l || SITE_ORIGIN));
    if (!drive) return null;
    const metaUrl = drive.match(/<a\s+id="download"\s+href="([^"]+)"/i)?.[1];
    if (!metaUrl) {
      console.warn("[ScrapyJS] drive page exposed no resolver link");
      return null;
    }
    const metaHref = metaUrl.replace(/&amp;/g, "&");
    const meta = await fetchText(metaHref, siteHeaders(driveUrl));
    if (!meta) return null;
    const fsl = meta.match(/<a[^>]+id="fsl"[^>]+href="([^"]+)"/i) ?? meta.match(/<a[^>]+href="([^"]+)"[^>]+id="fsl"/i);
    if (fsl?.[1]) {
      return {
        url: decodeEntities(fsl[1]),
        fileName: extractFileName(drive),
        sizeGb: extractDriveSize(drive)
      };
    }
    const u = meta.match(/hbplay\.pages\.dev\/\?u=([A-Za-z0-9+/=_-]+)/)?.[1];
    if (u) {
      const url = b64Decode(u);
      if (/^https:\/\//i.test(url)) {
        return { url, fileName: extractFileName(drive), sizeGb: extractDriveSize(drive) };
      }
    }
    const gpdl = meta.match(/href="(https:\/\/gpdl\.[^"]+)"/i)?.[1];
    if (gpdl) {
      return {
        url: decodeEntities(gpdl),
        fileName: extractFileName(drive),
        sizeGb: extractDriveSize(drive)
      };
    }
    console.warn("[ScrapyJS] resolver page yielded no file URL");
    return null;
  } catch (err) {
    console.warn(`[ScrapyJS] drive resolution failed: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}
function decodeEntities(input) {
  return input.replace(/&amp;/g, "&").replace(/&#0?38;/g, "&");
}

// src/parse.ts
var VIDEO_EXT_RE = /\.(mkv|mp4|m4v|avi|mov|ts|webm)$/i;
function stripTags(input) {
  return decodeEntities2(input.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}
function decodeEntities2(input) {
  return input.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/&#x2F;/gi, "/");
}
function parseEpisodeNumbers(fileName) {
  const match = fileName.match(/S(\d{1,2})E(\d{1,2})(?:(?:E|-E?|\.?)(\d{1,2}))?/i);
  if (!match) return { season: null, episode: null, episodeEnd: null };
  const season = parseInt(match[1], 10);
  const episode = parseInt(match[2], 10);
  const tail = match[3] ? parseInt(match[3], 10) : null;
  return { season, episode, episodeEnd: tail && tail > episode ? tail : null };
}
function parseSeasonMarker(label) {
  const match = label.match(/\bS0*(\d{1,2})\b/i);
  return match ? parseInt(match[1], 10) : null;
}
var SIZE_RE = /^[\d.]+\s*(?:GB|MB|GIB|MIB)$/i;
var SOURCE_RE = /^(blu-?ray.*|web-?dl.*|web-?rip.*|hd-?rip.*|bd-?rip.*|hdtv.*|dvd-?rip.*|vcd.*)$/i;
var EPISODES_COUNT_RE = /^episodes?\s+\d+/i;
function classifyBadges(badges) {
  const languages = [];
  const extras = [];
  let sizeGb = null;
  let source = null;
  for (const badge of badges) {
    if (SIZE_RE.test(badge)) {
      sizeGb = parseSizeGb(badge);
      continue;
    }
    if (EPISODES_COUNT_RE.test(badge)) continue;
    if (!source && SOURCE_RE.test(badge)) {
      source = badge;
      continue;
    }
    if (badge.includes(",")) {
      for (const part of badge.split(",").map((p) => p.trim())) {
        if (part && !languages.includes(part)) languages.push(part);
      }
      continue;
    }
    extras.push(badge);
  }
  return { sizeGb, languages, source, extras };
}
function classifyDriveLinks(anchors) {
  let hubCloudUrl = null;
  let hubDriveUrl = null;
  for (const { href, text } of anchors) {
    const url = decodeEntities2(href).trim();
    if (!/[?&]id=[^"&]+/.test(url)) continue;
    const label = stripTags(text);
    if (/hubcloud/i.test(label)) {
      if (!hubCloudUrl) hubCloudUrl = url;
    } else if (/hubdrive/i.test(label)) {
      if (!hubDriveUrl) hubDriveUrl = url;
    }
  }
  return { hubCloudUrl, hubDriveUrl };
}
function extractDriveLinks(blockHtml) {
  const anchors = [];
  const anchorRe = /<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = anchorRe.exec(blockHtml)) !== null) {
    anchors.push({ href: decodeEntities2(m[1]), text: m[2] });
  }
  return classifyDriveLinks(anchors);
}
function extractBadgeTexts(blockHtml) {
  const badges = [];
  const badgeRe = /<span\s+class="badge(?:-size)?"[^>]*>([^<]*)<\/span>/gi;
  let m;
  while ((m = badgeRe.exec(blockHtml)) !== null) {
    const text = stripTags(m[1]);
    if (text) badges.push(text);
  }
  return badges;
}
function assembleEntry(label, fileName, badges, links, seasonHint) {
  const classified = classifyBadges(badges);
  const numbers = parseEpisodeNumbers(fileName);
  return {
    label: decodeEntities2(label).replace(/\s+/g, " ").trim(),
    fileName: fileName.trim(),
    sizeGb: classified.sizeGb,
    languages: classified.languages,
    source: classified.source,
    hubCloudUrl: links.hubCloudUrl,
    hubDriveUrl: links.hubDriveUrl,
    season: numbers.season ?? seasonHint,
    episode: numbers.episode,
    episodeEnd: numbers.episodeEnd,
    isZip: /\.zip$/i.test(fileName)
  };
}
function parseDownloadBlocks(html) {
  const native = nativeDownloadBlocks(html);
  if (native.length > 0) return native;
  return regexDownloadBlocks(html);
}
function nativeDownloadBlocks(html) {
  const doc = loadNativeDoc(html);
  if (!doc) return [];
  const entries = [];
  eachOf(doc.$("div.download-item"), (block) => {
    const links = classifyDriveLinks(eachLink(block.find("a")));
    if (!links.hubCloudUrl && !links.hubDriveUrl) return;
    const fileName = cleanText(firstText(block.find(".file-title")));
    if (!fileName) return;
    const headerHtml = firstHtml(block.find("div.font-semibold"));
    const label = stripTags(
      headerHtml.split(/<br[\s/]*>?/i)[0].split(/<(?:div|svg)[\s>]/i)[0]
    );
    const seasonHint = parseSeasonMarker(label);
    const badges = eachText(block.find(".badge")).concat(eachText(block.find(".badge-size")));
    entries.push(assembleEntry(label, fileName, badges, links, seasonHint));
  });
  return entries;
}
function regexDownloadBlocks(html) {
  const entries = [];
  const blockRe = /<div class="download-item(?:\s[^"]*)?">([\s\S]*?)(?=<div class="download-item(?:\s[^"]*)?">|$)/gi;
  let m;
  while ((m = blockRe.exec(html)) !== null) {
    const block = m[1];
    if (/[?&]id=/.test(block) === false) continue;
    const label = block.match(/flex-1 text-left font-semibold">([\s\S]*?)<br/i)?.[1] ?? block.match(/flex-1 text-left font-semibold">\s*([\s\S]*?)\s*(?:<div|<svg|<br)/i)?.[1] ?? "";
    const seasonHint = parseSeasonMarker(stripTags(label));
    const fileName = block.match(/<div class="file-title">\s*([\s\S]*?)\s*<\/div>/i)?.[1] ?? "";
    if (!fileName) continue;
    const links = extractDriveLinks(block);
    entries.push(
      assembleEntry(
        stripTags(label),
        decodeEntities2(fileName),
        extractBadgeTexts(block),
        links,
        seasonHint
      )
    );
  }
  return entries;
}
function parseEpisodeBlocks(episodesHtml) {
  const native = nativeEpisodeBlocks(episodesHtml);
  if (native.length > 0) return native;
  return regexEpisodeBlocks(episodesHtml);
}
function nativeEpisodeBlocks(episodesHtml) {
  const doc = loadNativeDoc(episodesHtml);
  if (!doc) return [];
  const entries = [];
  eachOf(doc.$("div.season-item.episode-item"), (group) => {
    const groupLabel = firstText(group.find("h3.episode-title"));
    const headerLangs = classifyBadges(eachText(group.find(".episode-meta .badge"))).languages;
    const groupSeason = parseSeasonMarker(groupLabel);
    eachOf(group.find("div.episode-download-item"), (item) => {
      const fileName = cleanText(firstText(item.find(".episode-file-title")));
      if (!fileName) return;
      const badges = [
        ...eachText(item.find(".badge")),
        ...eachText(item.find(".badge-size"))
      ];
      const entry = assembleEntry(groupLabel, fileName, badges, classifyDriveLinks(eachLink(item.find("a"))), groupSeason);
      if (entry.languages.length === 0 && headerLangs.length > 0) entry.languages = headerLangs;
      if (!entry.source && groupLabel) {
        const src = groupLabel.match(/(BluRay REMUX|BluRay|WEB-DL|WEBRip|HDRip|HDTV)/i);
        entry.source = src ? src[1] : null;
      }
      entries.push(entry);
    });
  });
  return entries;
}
function regexEpisodeBlocks(episodesHtml) {
  const entries = [];
  const groupRe = /<div class="season-item episode-item[^"]*">([\s\S]*?)(?=<div class="season-item episode-item[^"]*">|$)/gi;
  let groupMatch;
  while ((groupMatch = groupRe.exec(episodesHtml)) !== null) {
    const group = groupMatch[1];
    const groupLabel = stripTags(group.match(/<h3 class="episode-title">([\s\S]*?)<\/h3>/i)?.[1] ?? "");
    const headerLangs = classifyBadges(extractBadgeTexts(group)).languages;
    const groupSeason = parseSeasonMarker(groupLabel);
    const itemRe = /<div class="episode-download-item">([\s\S]*?)(?=<div class="episode-download-item">|$)/gi;
    let itemMatch;
    while ((itemMatch = itemRe.exec(group)) !== null) {
      const item = itemMatch[1];
      const fileName = item.match(/<div class="episode-file-title">\s*([\s\S]*?)\s*<\/div>/i)?.[1] ?? "";
      if (!fileName) continue;
      const entry = assembleEntry(
        groupLabel,
        decodeEntities2(fileName),
        extractBadgeTexts(item),
        extractDriveLinks(item),
        groupSeason
      );
      if (entry.languages.length === 0 && headerLangs.length > 0) entry.languages = headerLangs;
      if (!entry.source && groupLabel) {
        const src = groupLabel.match(/(BluRay REMUX|BluRay|WEB-DL|WEBRip|HDRip|HDTV)/i);
        entry.source = src ? src[1] : null;
      }
      entries.push(entry);
    }
  }
  return entries;
}
function parseSeasonPacks(packHtml) {
  return parseDownloadBlocks(packHtml).filter((e) => e.isZip === true || VIDEO_EXT_RE.test(e.fileName));
}
function isStreamableFile(entry) {
  return !entry.isZip && VIDEO_EXT_RE.test(entry.fileName);
}
function detectResolution(entry) {
  const haystack = `${entry.fileName} ${entry.label}`;
  const match = haystack.match(/\b(2160|1440|1080|720|480|360)0?p\b/i);
  if (match) return `${match[1]}p`;
  if (/\b4k\b|\buhd\b/i.test(haystack)) return "2160p";
  return null;
}
function detectCodec(entry) {
  const haystack = `${entry.fileName} ${entry.label}`;
  if (/\bx265|h\.?265|hevc/i.test(haystack)) return "HEVC";
  if (/\bx264|h\.?264|avc\b/i.test(haystack)) return "AVC";
  if (/\bav1\b/i.test(haystack)) return "AV1";
  return null;
}
function detectHdr(entry) {
  const haystack = `${entry.fileName} ${entry.label}`;
  if (/\bdv\b|dolby.?vision|dovi/i.test(haystack)) return "Dolby Vision";
  if (/hdr10\+?/i.test(haystack)) return /hdr10\+/i.test(haystack) ? "HDR10+" : null;
  if (/\bhdr\b/i.test(haystack)) return "HDR";
  return "SDR";
}
function qualityWeight(resolution) {
  const digits = resolution?.replace(/\D/g, "") ?? "";
  return digits ? parseInt(digits, 10) : 0;
}

// src/match.ts
function titleKey(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "").replace(/^(the|a|an)(?=[a-z0-9])/, "");
}
function jaro(a, b) {
  if (a === b) return 1;
  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0 || lenB === 0) return 0;
  const window = Math.max(0, Math.floor(Math.max(lenA, lenB) / 2) - 1);
  const aMatched = new Array(lenA).fill(false);
  const bMatched = new Array(lenB).fill(false);
  let matches = 0;
  for (let i = 0; i < lenA; i += 1) {
    const searchStart = Math.max(0, i - window);
    const searchEnd = Math.min(lenB - 1, i + window);
    for (let j = searchStart; j <= searchEnd; j += 1) {
      if (!bMatched[j] && a[i] === b[j]) {
        aMatched[i] = true;
        bMatched[j] = true;
        matches += 1;
        break;
      }
    }
  }
  if (matches === 0) return 0;
  let transpositions = 0;
  let bIndex = 0;
  for (let i = 0; i < lenA; i += 1) {
    if (!aMatched[i]) continue;
    while (!bMatched[bIndex]) bIndex += 1;
    if (a[i] !== b[bIndex]) transpositions += 1;
    bIndex += 1;
  }
  transpositions = Math.floor(transpositions / 2);
  const m = matches;
  return (m / lenA + m / lenB + (m - transpositions) / m) / 3;
}
function jaroWinkler(a, b) {
  const base = jaro(a, b);
  if (base === 0) return 0;
  let prefix = 0;
  const maxPrefix = Math.min(4, a.length, b.length);
  while (prefix < maxPrefix && a[prefix] === b[prefix]) prefix += 1;
  return base + prefix * 0.1 * (1 - base);
}
function titleSimilarity(a, b) {
  const ka = titleKey(a);
  const kb = titleKey(b);
  if (!ka || !kb) return 0;
  if (ka === kb) return 1;
  return jaroWinkler(ka, kb);
}

// src/resolver.ts
function scoreCard(card, info) {
  let score = 0;
  const similarity = titleSimilarity(card.title, info.title);
  if (similarity >= 0.999) score += 60;
  else if (similarity >= 0.8) score += 40;
  if (similarity >= 0.55) score += similarity * 30;
  if (info.posterPath && card.posterPath === info.posterPath) score += 100;
  if (info.year && card.year) {
    if (card.year === info.year) score += 12;
    else if (Math.abs(card.year - info.year) === 1) score += 6;
  }
  return score;
}
async function candidateCards(info, kind) {
  const variants = searchVariants(info.title);
  const settled = await Promise.allSettled(
    variants.map((variant) => searchCards(variant))
  );
  const seen = /* @__PURE__ */ new Set();
  const candidates = [];
  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    for (const card of result.value) {
      if (card.kind !== kind) continue;
      if (seen.has(card.slug)) continue;
      seen.add(card.slug);
      candidates.push({ card, score: scoreCard(card, info) });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, MAX_CANDIDATE_PAGES).map((c) => c.card);
}
async function findMatchingDetailPage(candidates, info, tmdbId) {
  const settled = await Promise.allSettled(
    candidates.map(async (card) => ({ card, html: await fetchDetailPage(card.pageUrl) }))
  );
  const fetched = [];
  for (const result of settled) {
    if (result.status === "fulfilled") fetched.push(result.value);
  }
  for (const { card, html } of fetched) {
    if (!html) continue;
    const pageTmdbId = extractTmdbId(html);
    if (pageTmdbId === tmdbId) return { html, card };
    const pagePoster = detailPosterPath(html);
    if (info.posterPath && pagePoster && pagePoster === info.posterPath) return { html, card };
    if (titleSimilarity(card.title, info.title) >= 0.92) {
      if (info.year === null || card.year === null || Math.abs(card.year - info.year) <= 1) {
        return { html, card };
      }
    }
  }
  return null;
}
function mediaFormatOf(fileName) {
  if (/\.mkv$/i.test(fileName)) return "mkv";
  if (/\.mp4|m4v$/i.test(fileName)) return "mp4";
  if (/\.webm$/i.test(fileName)) return "webm";
  return "other";
}
function detectAudioFormat(text) {
  if (/truehd.*atmos|atmos.*truehd|\bmatmos\b/i.test(text)) return "Dolby TrueHD Atmos";
  if (/atmos/i.test(text)) return "Dolby Atmos";
  if (/dts-?hd(?!.*ma)|dts-?x/i.test(text)) return "DTS-HD";
  if (/dts-?hd.?ma/i.test(text)) return "DTS-HD MA";
  if (/truehd/i.test(text)) return "Dolby TrueHD";
  if (/ddp?5\.1|e-?ac-?3|dd\+/i.test(text)) return "DD+ 5.1";
  if (/ac-?3|dd5\.1/i.test(text)) return "DD 5.1";
  if (/aac5?\.?1?\b/i.test(text)) return "AAC";
  return null;
}
function toStreamItem(entry, host) {
  const name = entry.fileName || host.fileName || entry.label;
  const resolution = detectResolution(entry);
  return {
    type: "direct",
    title: name,
    media_format: mediaFormatOf(host.fileName ?? name),
    resolution,
    codec: detectCodec(entry),
    hdr_format: detectHdr(entry),
    audio_format: detectAudioFormat(name),
    audio_languages: entry.languages,
    size_gb: host.sizeGb ?? entry.sizeGb,
    // The final R2 URL is S3-signed with a host-only signature and 8h validity:
    // no Referer headers, no proxy — plays directly.
    needs_proxy: false,
    stream_url: host.url
  };
}
async function resolveEntry(entry) {
  for (const link of [entry.hubCloudUrl, entry.hubDriveUrl]) {
    if (!link) continue;
    const host = await resolveDriveLink(link);
    if (host?.url) return toStreamItem(entry, host);
  }
  return null;
}
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = [];
  for (let i = 0; i < limit; i += 1) {
    workers.push(
      (async () => {
        while (next < items.length) {
          const index = next;
          next += 1;
          results[index] = await fn(items[index]);
        }
      })()
    );
  }
  await Promise.allSettled(workers);
  return results;
}
function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    const wQ = qualityWeight(detectResolution(b)) - qualityWeight(detectResolution(a));
    if (wQ !== 0) return wQ;
    return (b.sizeGb ?? 0) - (a.sizeGb ?? 0);
  });
}
async function finalizeWithPage(html, mediaType, season, episode) {
  let entries;
  if (mediaType === "movie") {
    entries = parseDownloadBlocks(html);
  } else {
    const epStart = html.indexOf('id="episodes"');
    if (epStart >= 0) {
      entries = parseEpisodeBlocks(html.slice(epStart));
    } else {
      entries = [];
    }
    entries = entries.filter((entry) => {
      if (entry.episode === null && entry.episodeEnd === null && entry.season === null) return false;
      if (season !== null && entry.season !== null && entry.season !== season) return false;
      if (episode === null) return entry.episode !== null || entry.episodeEnd !== null;
      if (entry.episode === null) return false;
      if (entry.episode === episode) return true;
      if (entry.episodeEnd !== null && episode >= entry.episode && episode <= entry.episodeEnd) return true;
      return false;
    });
    if (entries.length === 0) {
      const packStart = html.indexOf('id="complete-pack"');
      const packEnd = epStart >= 0 ? epStart : void 0;
      if (packStart >= 0) {
        const packs = parseSeasonPacks(html.slice(packStart, packEnd)).filter(
          (e) => !e.isZip && isStreamableFile(e) && (season === null || e.season === season)
        );
        entries = packs.filter((e) => e.episode !== null ? e.episode === episode : false);
      }
    }
  }
  const streamable = sortEntries(entries.filter(isStreamableFile));
  if (streamable.length === 0) return [];
  const chosen = streamable.slice(0, MAX_RESOLVED_STREAMS);
  const resolved = await mapLimit(chosen, DRIVE_CONCURRENCY, resolveEntry);
  return resolved.filter((item) => item !== null).sort((a, b) => qualityWeight(b.resolution ?? null) - qualityWeight(a.resolution ?? null));
}
async function resolveStreams(req) {
  const tmdbId = req.tmdb_id;
  const mediaType = req.media_type === "tv" ? "tv" : "movie";
  const info = await resolveTitleInfo(tmdbId, mediaType);
  if (!info) {
    console.warn(`[ScrapyJS] title lookup failed for tmdb ${tmdbId} (${mediaType})`);
    return [];
  }
  const candidates = await candidateCards(info, mediaType === "tv" ? "series" : "movie");
  if (candidates.length === 0) return [];
  const match = await findMatchingDetailPage(candidates, info, tmdbId);
  if (!match) {
    console.warn(`[ScrapyJS] no detail page verified for tmdb ${tmdbId} (${mediaType})`);
    return [];
  }
  return await finalizeWithPage(
    match.html,
    mediaType,
    mediaType === "tv" ? req.s ?? null : null,
    mediaType === "tv" ? req.e ?? null : null
  );
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
