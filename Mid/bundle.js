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
  id: "dev.fearless.mid",
  name: "Mid",
  version: "0.2.0",
  type: "js",
  description: "Direct high-speed streaming for movies and TV series powered by Rtally. Multi-server HLS streams with adaptive playback.",
  publisher: "fearless",
  logo: "https://delulu-addons.pages.dev/default_addon_logo.png",
  bundle: {
    url: "https://raw.githubusercontent.com/KamruzzamanMahin/Js-Addons/main/Mid/bundle.js",
    sha256: ""
  },
  capabilities: [
    "direct_stream"
  ]
};

// src/config.ts
var RTALLY_ORIGIN = "https://www.rtally.site";
var SANITY_PROJECT_ID = "o38ds5mw";
var SANITY_DATASET = "rtally";
var SANITY_CDN_BASE = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}`;
var ID_API_BASE = "https://id-api.not-phoenix.workers.dev";
var CINEMETA_BASE = "https://v3-cinemeta.strem.io";
var DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
function defaultHeaders(referer) {
  const headers = {
    "User-Agent": DEFAULT_UA,
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9"
  };
  if (referer) headers["Referer"] = referer;
  return headers;
}

// src/http.ts
async function fetchText(url, headers) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch(url, { headers: headers ?? {} });
      if (res.status >= 500 && attempt === 0) {
        continue;
      }
      if (!res.ok) {
        return null;
      }
      const text = await res.text();
      if (text && text.trim()) return text;
      return null;
    } catch (err) {
      if (attempt > 0) {
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
    return null;
  }
}

// src/tmdb.ts
function parseYear(releaseInfo) {
  if (!releaseInfo) return null;
  const match = releaseInfo.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : null;
}
async function resolveTitleInfo(tmdbId, mediaType) {
  const apiType = mediaType === "movie" ? "movie" : "tv";
  const cinemetaType = mediaType === "movie" ? "movie" : "series";
  const headers = defaultHeaders();
  const hop1 = await fetchJson(
    `${ID_API_BASE}/tmdb/${apiType}/${tmdbId}`,
    headers
  );
  if (!hop1?.found || typeof hop1.imdb_id !== "string" || !hop1.imdb_id.trim()) {
    console.warn(`[Mid] no IMDb id for ${apiType}/${tmdbId}`);
    return null;
  }
  const imdbId = hop1.imdb_id.trim();
  const hop2 = await fetchJson(
    `${CINEMETA_BASE}/meta/${cinemetaType}/${imdbId}.json`,
    headers
  );
  const title = hop2?.meta?.name?.trim();
  if (!title) {
    console.warn(`[Mid] no Cinemeta title for ${imdbId}`);
    return null;
  }
  return {
    title,
    year: parseYear(hop2?.meta?.releaseInfo),
    imdbId
  };
}

// src/site.ts
async function searchRtally(query) {
  const url = `${RTALLY_ORIGIN}/api/search?q=${encodeURIComponent(query)}`;
  const res = await fetchJson(url, defaultHeaders(RTALLY_ORIGIN));
  return res?.results ?? [];
}
function cleanTitle(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}
function findBestCandidate(candidates, title, year, isSeries, seasonNum) {
  if (!candidates.length) return null;
  const targetTitle = cleanTitle(title);
  let filtered = candidates.filter((c) => {
    if (isSeries) {
      return c.type?.toLowerCase().includes("series") || c.type?.toLowerCase().includes("drama");
    } else {
      return c.type?.toLowerCase().includes("movie");
    }
  });
  if (!filtered.length) {
    filtered = candidates;
  }
  if (isSeries && seasonNum != null && seasonNum > 0) {
    const sStr = `${seasonNum}`;
    const seasonMatches = filtered.filter((c) => {
      const lowerSlug = c.slug.toLowerCase();
      const lowerTitle = c.title.toLowerCase();
      if (lowerSlug.includes(`season-${sStr}`) || lowerSlug.includes(`-s${sStr}`) || lowerSlug.includes(`s0${sStr}`) || lowerTitle.includes(`season ${sStr}`)) {
        return true;
      }
      const rangeMatch = lowerSlug.match(/season-(\d+)-(\d+)/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        if (seasonNum >= start && seasonNum <= end) return true;
      }
      return false;
    });
    if (seasonMatches.length > 0) {
      filtered = seasonMatches;
    }
  }
  for (const c of filtered) {
    const cTitle = cleanTitle(c.title);
    if (cTitle.includes(targetTitle) || targetTitle.includes(cTitle)) {
      return c;
    }
  }
  return filtered[0] ?? null;
}
async function fetchSanityDoc(slug) {
  const groq = `*[_type == "movie" && slug.current == "${slug}"][0]`;
  const url = `${SANITY_CDN_BASE}?query=${encodeURIComponent(groq)}`;
  const res = await fetchJson(url, defaultHeaders());
  return res?.result ?? null;
}

// src/resolvers/vidhide.ts
function unpackDeanEdwards(html) {
  const match = html.match(
    /eval\(function\(p,a,c,k,e,d\)\{.*?return p\}\('(.*?)',(\d+),(\d+),'(.*?)'\.split\('\|'\)/s
  );
  if (!match) return "";
  const [, p, aStr, cStr, kStr] = match;
  const a = parseInt(aStr, 10);
  const c = parseInt(cStr, 10);
  const k = kStr.split("|");
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const itob = (n, b) => {
    if (n === 0) return "0";
    let res = "";
    while (n > 0) {
      res = chars[n % b] + res;
      n = Math.floor(n / b);
    }
    return res;
  };
  const lookup = {};
  for (let i = 0; i < c; i++) {
    const key = itob(i, a);
    lookup[key] = i < k.length && k[i] ? k[i] : key;
  }
  return p.replace(/\b\w+\b/g, (w) => lookup[w] || w);
}
async function resolveVidHide(id, titlePrefix = "Server 2 (VidHide)") {
  if (!id || !id.trim()) return null;
  const embedUrl = `https://vidhideplus.com/v/${id.trim()}`;
  const headers = {
    "User-Agent": DEFAULT_UA,
    Referer: "https://www.rtally.site/"
  };
  const html = await fetchText(embedUrl, headers);
  if (!html) return null;
  let m3u8Match = html.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/);
  if (!m3u8Match) {
    const unpacked = unpackDeanEdwards(html);
    if (unpacked) {
      m3u8Match = unpacked.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/);
    }
  }
  if (!m3u8Match) return null;
  const streamUrl = m3u8Match[0];
  return {
    type: "direct",
    title: `${titlePrefix} - HLS 1080p`,
    media_format: "hls",
    resolution: "1080p",
    stream_url: streamUrl,
    audio_languages: [],
    needs_proxy: true,
    headers: {
      Referer: "https://vidhideplus.com/",
      "User-Agent": DEFAULT_UA
    }
  };
}

// src/resolvers/streamwish.ts
function unpackDeanEdwards2(html) {
  const match = html.match(
    /eval\(function\(p,a,c,k,e,d\)\{.*?return p\}\('(.*?)',(\d+),(\d+),'(.*?)'\.split\('\|'\)/s
  );
  if (!match) return "";
  const [, p, aStr, cStr, kStr] = match;
  const a = parseInt(aStr, 10);
  const c = parseInt(cStr, 10);
  const k = kStr.split("|");
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const itob = (n, b) => {
    if (n === 0) return "0";
    let res = "";
    while (n > 0) {
      res = chars[n % b] + res;
      n = Math.floor(n / b);
    }
    return res;
  };
  const lookup = {};
  for (let i = 0; i < c; i++) {
    const key = itob(i, a);
    lookup[key] = i < k.length && k[i] ? k[i] : key;
  }
  return p.replace(/\b\w+\b/g, (w) => lookup[w] || w);
}
async function resolveStreamWish(id, titlePrefix = "Server 3 (StreamWish)") {
  if (!id || !id.trim()) return null;
  const domains = ["https://playerwish.com/e/", "https://streamwish.to/e/"];
  const headers = {
    "User-Agent": DEFAULT_UA,
    Referer: "https://www.rtally.site/"
  };
  for (const domain of domains) {
    const embedUrl = `${domain}${id.trim()}`;
    const html = await fetchText(embedUrl, headers);
    if (!html) continue;
    let m3u8Match = html.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/);
    if (!m3u8Match) {
      const unpacked = unpackDeanEdwards2(html);
      if (unpacked) {
        m3u8Match = unpacked.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/);
      }
    }
    if (m3u8Match) {
      return {
        type: "direct",
        title: `${titlePrefix} - HLS 720p`,
        media_format: "hls",
        resolution: "720p",
        stream_url: m3u8Match[0],
        audio_languages: [],
        needs_proxy: true,
        headers: {
          Referer: domain,
          "User-Agent": DEFAULT_UA
        }
      };
    }
  }
  return null;
}

// src/resolvers/vcloud.ts
async function resolveVCloud(rawUrl, qualityLabel) {
  if (!rawUrl || !rawUrl.trim()) return null;
  try {
    const landingUrl = rawUrl.trim().replace(
      /https?:\/\/(?:[\w-]+\.)?vcloud\.[^/]+/i,
      "https://vcloud.my"
    );
    const headers = {
      "User-Agent": DEFAULT_UA,
      Referer: "https://www.rtally.site/"
    };
    const landingHtml = await fetchText(landingUrl, headers);
    if (!landingHtml) return null;
    const atobMatch = landingHtml.match(/atob\(atob\(['"]([A-Za-z0-9+/=]+)['"]\)\)/);
    if (!atobMatch) return null;
    const b64Str = atobMatch[1];
    let step2Url = "";
    try {
      step2Url = atob(atob(b64Str));
    } catch {
      return null;
    }
    if (!step2Url.startsWith("http")) return null;
    const step2Html = await fetchText(step2Url, {
      "User-Agent": DEFAULT_UA,
      Referer: landingUrl
    });
    if (!step2Html) return null;
    const r2Match = step2Html.match(
      /href=["'](https:\/\/[^"']*r2\.cloudflarestorage\.com\/[^"']+)["']/i
    );
    if (r2Match) {
      const streamUrl = r2Match[1].replace(/&amp;/g, "&");
      return {
        type: "direct",
        title: `Fast Cloud (Direct) - ${qualityLabel}`,
        media_format: "mkv",
        resolution: qualityLabel,
        stream_url: streamUrl,
        audio_languages: [],
        needs_proxy: false
      };
    }
    const mkvMatch = step2Html.match(
      /href=["'](https:\/\/[^"']+\.(?:mkv|mp4)\?[^"']+)["']/i
    );
    if (mkvMatch) {
      const streamUrl = mkvMatch[1].replace(/&amp;/g, "&");
      return {
        type: "direct",
        title: `Fast Cloud (Direct) - ${qualityLabel}`,
        media_format: "mkv",
        resolution: qualityLabel,
        stream_url: streamUrl,
        audio_languages: [],
        needs_proxy: false
      };
    }
    return null;
  } catch (err) {
    return null;
  }
}

// src/resolver.ts
async function resolveStreams(req) {
  const isSeries = req.media_type === "tv";
  const titleInfo = await resolveTitleInfo(req.tmdb_id, req.media_type);
  if (!titleInfo) {
    console.warn(`[Mid] Title lookup failed for TMDB ${req.tmdb_id}`);
    return [];
  }
  const candidates = await searchRtally(titleInfo.title);
  if (!candidates.length) {
    console.warn(`[Mid] No search results on Rtally for "${titleInfo.title}"`);
    return [];
  }
  const candidate = findBestCandidate(
    candidates,
    titleInfo.title,
    titleInfo.year,
    isSeries,
    req.s
  );
  if (!candidate) {
    console.warn(`[Mid] Could not match candidate for "${titleInfo.title}"`);
    return [];
  }
  const doc = await fetchSanityDoc(candidate.slug);
  if (!doc) {
    console.warn(`[Mid] Failed to fetch Sanity doc for slug: ${candidate.slug}`);
    return [];
  }
  const streamPromises = [];
  if (!isSeries) {
    if (doc.large) {
      streamPromises.push(resolveVCloud(doc.large, "1080p"));
    }
    if (doc.medium) {
      streamPromises.push(resolveVCloud(doc.medium, "720p"));
    }
    if (doc.small) {
      streamPromises.push(resolveVCloud(doc.small, "480p"));
    }
    if (doc.vidhideUrl) {
      streamPromises.push(resolveVidHide(doc.vidhideUrl, "Server 2 (VidHide)"));
    }
    if (doc.streamwishUrl) {
      streamPromises.push(resolveStreamWish(doc.streamwishUrl, "Server 3 (StreamWish)"));
    }
  } else {
    const epNum = req.e ?? 1;
    const epIndex = epNum - 1;
    const prefix = `S${req.s ?? 1}E${epNum}`;
    if (doc.multiLinksSl) {
      const ids = doc.multiLinksSl.split(",").map((s) => s.trim()).filter(Boolean);
      if (epIndex >= 0 && epIndex < ids.length) {
        streamPromises.push(resolveVidHide(ids[epIndex], `Server 2 (VidHide) ${prefix}`));
      }
    }
    if (doc.streamwishMultiUrl) {
      const ids = doc.streamwishMultiUrl.split(",").map((s) => s.trim()).filter(Boolean);
      if (epIndex >= 0 && epIndex < ids.length) {
        streamPromises.push(resolveStreamWish(ids[epIndex], `Server 3 (StreamWish) ${prefix}`));
      }
    }
  }
  const results = await Promise.allSettled(streamPromises);
  const items = [];
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      items.push(r.value);
    }
  }
  return items;
}

// src/index.ts
var index_default = defineJsAddon({
  manifest: manifest_default,
  async getStreams(req) {
    const tmdbId = req.tmdb_id ?? req.tmdbId;
    const mediaType = req.media_type ?? req.mediaType;
    if (!tmdbId || !mediaType) {
      return [];
    }
    return await resolveStreams(req);
  }
});
