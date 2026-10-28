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

// ../../dad_sdk/dist/version.js
var VERSION_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
function isValidVersion(version) {
  return VERSION_RE.test(version);
}

// ../../dad_sdk/dist/validation.js
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
  if (!isHttpsUrl(ak.pageUrl)) {
    errors.push(`'${label}.pageUrl' must be an HTTPS URL`);
  }
  return errors;
}

// ../../dad_sdk/dist/manifest.js
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
    if (!m.baseUrl || typeof m.baseUrl !== "string") {
      errors.push("HTTP addon requires 'baseUrl' string URL");
    } else if (!isBareHttpsUrl(m.baseUrl)) {
      errors.push("HTTP addon 'baseUrl' must be a bare HTTPS origin URL - no path, no query string, no fragment (e.g. 'https://addon.example.com'). The addon's routes live directly under it: {baseUrl}/streams/... and its manifest at {baseUrl}/manifest.json.");
    }
    if (m.apiKey !== void 0) {
      errors.push(...validateApiKeyShape(m.apiKey, "apiKey"));
    }
    if (m.signature !== void 0 || m.publicKeyId !== void 0) {
      errors.push("HTTP addons are NOT signed - remove 'signature' and 'publicKeyId'. They were v1 fields and carry no meaning in v2.");
    }
  } else if (m.type === "js") {
    if (m.baseUrl !== void 0) {
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
    if (m.apiKey !== void 0) {
      errors.push(...validateApiKeyShape(m.apiKey, "apiKey"));
    }
    if (m.signature !== void 0 || m.publicKeyId !== void 0 || m.platform_assets !== void 0 || m.target !== void 0) {
      errors.push("JavaScript addons are sandboxed and NOT signed - remove signing fields ('signature', 'publicKeyId', 'platform_assets').");
    }
  } else {
    errors.push("Invalid 'type'. Must be 'http' or 'js'.");
  }
  return { valid: errors.length === 0, errors };
}

// ../../dad_sdk/dist/define.js
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

// src/index.ts
var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
var ID_API_BASE = "https://id-api.not-phoenix.workers.dev";
var GRAPHQL_ENDPOINT = "https://graphql.imdb.com/";
var IMDB_ORIGIN = "https://www.imdb.com";
var CINEMETA_BASE = "https://v3-cinemeta.strem.io";
var QUERY_TITLE_VIDEOS = "query TitleVideosAndRating($const: ID!, $first: Int!, $filter: VideosQueryFilter, $sort: VideoSort) { title(id: $const) { titleText { text } ratingsSummary { aggregateRating } videoStrip(first: $first, filter: $filter, sort: $sort) { edges { node { id name { value } } } } } }";
var QUERY_VIDEO_PLAYBACK = "query VideoPlayback($id: ID!) { video(id: $id) { playbackURLs { url videoMimeType videoDefinition } } }";
async function resolveImdbId(tmdbId, mediaType) {
  const pathType = mediaType === "movie" ? "movie" : "tv";
  const url = `${ID_API_BASE}/tmdb/${pathType}/${tmdbId}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json"
      }
    });
    if (!res.ok && res.status !== 404) {
      console.warn(`[TrailerooJS] ID API returned HTTP ${res.status} for ${pathType}/${tmdbId}`);
      return null;
    }
    const body = await res.json();
    if (body?.found && typeof body?.imdb_id === "string") {
      return body.imdb_id;
    }
  } catch (err) {
    console.warn(`[TrailerooJS] ID API request failed for ${pathType}/${tmdbId}: ${err?.message || err}`);
  }
  return null;
}
async function resolveCinemetaRating(imdbId, mediaType) {
  const pathType = mediaType === "movie" ? "movie" : "series";
  const url = `${CINEMETA_BASE}/meta/${pathType}/${imdbId}.json`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT }
    });
    if (!res.ok) return null;
    const body = await res.json();
    const rawRating = body?.meta?.imdbRating;
    return parseRating(rawRating);
  } catch (err) {
    console.warn(`[TrailerooJS] Cinemeta request failed for ${imdbId}: ${err?.message || err}`);
    return null;
  }
}
function parseRating(value) {
  if (typeof value === "number" && !isNaN(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}
async function graphqlPost(payload) {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
        Referer: IMDB_ORIGIN,
        Origin: IMDB_ORIGIN
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      console.warn(`[TrailerooJS] IMDb GraphQL answered HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[TrailerooJS] IMDb GraphQL request failed: ${err?.message || err}`);
    return null;
  }
}
var GARBAGE_PATTERNS = [
  "top-rated",
  "top 10",
  "top 5",
  "top 8",
  "guide to",
  "alphabet of",
  "ask each other",
  "interview",
  "talks",
  "through the years",
  "career retrospective",
  "easter eggs",
  "nominees",
  "oscars",
  "oscar\xAE",
  "winning",
  "wins",
  "why the cast",
  "cast considers",
  "meet the cast",
  "behind the scenes",
  "behind the sets",
  "making of",
  "mashup",
  "dvd trailer",
  "vhs",
  "sneak peek",
  "exclusive scene",
  "featurette",
  "clip",
  "bloopers",
  "best moments",
  "useless machines",
  "who from",
  "recap"
];
function mentionedSeason(name) {
  const lower = name.toLowerCase();
  const tokens = lower.split(/\s+/);
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === "season") {
      const next = tokens[i + 1];
      if (next) {
        const num = parseInt(next, 10);
        if (!isNaN(num) && num > 0) return num;
      }
    } else if (token.startsWith("s")) {
      const rest = token.slice(1);
      if ((rest.length === 1 || rest.length === 2) && /^\d+$/.test(rest)) {
        const num = parseInt(rest, 10);
        if (!isNaN(num) && num > 0) return num;
      }
    }
  }
  return null;
}
function matchesSeasonPattern(name, season) {
  const lower = name.toLowerCase();
  const tokens = lower.split(/\s+/);
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === "season") {
      const next = tokens[i + 1];
      if (next && parseInt(next, 10) === season) {
        return true;
      }
      continue;
    }
    if (!token.startsWith("s")) continue;
    const rest = token.slice(1);
    const digitMatch = rest.match(/^\d+/);
    if (!digitMatch) continue;
    const tokenSeason = parseInt(digitMatch[0], 10);
    if (tokenSeason !== season) continue;
    const after = rest.slice(digitMatch[0].length);
    if (after === "" || after.startsWith("e") && /^\d+$/.test(after.slice(1))) {
      return true;
    }
  }
  return false;
}
function scoreVideoTitle(name, mediaTitle, season) {
  const lower = name.trim().toLowerCase();
  const lowerMedia = mediaTitle.trim().toLowerCase();
  if (GARBAGE_PATTERNS.some((pat) => lower.includes(pat))) {
    return -1e3;
  }
  if (season !== void 0 && season !== null && season > 0) {
    const isThisSeason = matchesSeasonPattern(lower, season);
    const namedSeason = mentionedSeason(lower);
    if (namedSeason !== null && namedSeason !== season) {
      return -1e3;
    }
    if (isThisSeason) {
      if (lower.includes("official trailer")) return 600;
      if (lower.includes("trailer")) return 500;
      if (lower.includes("teaser")) return 400;
      return 300;
    }
    return -500;
  }
  let score = 0;
  if (lower === "official trailer") {
    score += 150;
  } else if (lower.includes("official trailer 1") || lower.includes("official trailer #1")) {
    score += 140;
  } else if (lower.includes("official trailer 2") || lower.includes("official trailer #2")) {
    score += 120;
  } else if (lower.includes("official trailer")) {
    score += 110;
  } else if (lower.includes("theatrical trailer") || lower.includes("main trailer")) {
    score += 105;
  } else if (lower.includes("final trailer")) {
    score += 100;
  } else if (lower.includes("trailer #1") || lower.includes("trailer 1")) {
    score += 95;
  } else if (lower.includes("trailer #2") || lower.includes("trailer 2")) {
    score += 85;
  } else if (lower.includes("trailer #3") || lower.includes("trailer 3")) {
    score += 75;
  } else if (lower.includes("trailer #4") || lower.includes("trailer 4")) {
    score += 65;
  } else if (lower.includes("teaser trailer") || lower.includes("official teaser")) {
    score += 60;
  } else if (lower.includes("trailer")) {
    score += 50;
  } else if (lower.includes("teaser")) {
    score += 40;
  } else if (lowerMedia && (lower === lowerMedia || lower.startsWith(lowerMedia))) {
    score += 55;
  }
  if (lower.includes("anniversary")) {
    score -= 40;
  }
  return score;
}
function pickTrailerNode(edges, mediaTitle, season) {
  let bestNode = null;
  let bestScore = 0;
  for (const edge of edges) {
    const node = edge?.node;
    if (!node) continue;
    const name = node?.name?.value || "";
    const score = scoreVideoTitle(name, mediaTitle, season);
    if (score <= 0) continue;
    if (bestNode === null || score > bestScore) {
      bestScore = score;
      bestNode = node;
    }
  }
  return bestNode;
}
function pickAdaptiveUrl(playbackUrls) {
  const isHttps = (url) => typeof url === "string" && url.startsWith("https://");
  for (const item of playbackUrls) {
    const def = (item?.videoDefinition || "").toUpperCase();
    const mime = (item?.videoMimeType || "").toUpperCase();
    const url = item?.url;
    if ((def.includes("AUTO") || mime === "M3U8") && isHttps(url)) {
      return url;
    }
  }
  const preferredDefs = ["DEF_1080P", "DEF_720P", "DEF_480P", "DEF_SD"];
  for (const targetDef of preferredDefs) {
    for (const item of playbackUrls) {
      const def = (item?.videoDefinition || "").toUpperCase();
      const url = item?.url;
      if (def === targetDef && isHttps(url)) {
        return url;
      }
    }
  }
  for (const item of playbackUrls) {
    const url = item?.url;
    if (isHttps(url)) {
      return url;
    }
  }
  return null;
}
async function resolvePlayback(videoId) {
  const json = await graphqlPost({
    operationName: "VideoPlayback",
    query: QUERY_VIDEO_PLAYBACK,
    variables: { id: videoId }
  });
  const urls = json?.data?.video?.playbackURLs;
  if (!Array.isArray(urls)) return null;
  return pickAdaptiveUrl(urls);
}
async function resolveViaGraphql(imdbId, season) {
  const json = await graphqlPost({
    operationName: "TitleVideosAndRating",
    query: QUERY_TITLE_VIDEOS,
    variables: {
      const: imdbId,
      first: 20,
      filter: {
        maturityLevel: "INCLUDE_MATURE",
        nameConstraints: {},
        titleConstraints: {},
        types: ["TRAILER"]
      },
      sort: { by: "DATE", order: "DESC" }
    }
  });
  const title = json?.data?.title;
  if (!title) {
    return { trailerUrl: null, rating: null };
  }
  const rating = parseRating(title?.ratingsSummary?.aggregateRating);
  const mediaTitle = title?.titleText?.text || "";
  const edges = title?.videoStrip?.edges;
  let trailerUrl = null;
  if (Array.isArray(edges) && edges.length > 0) {
    const node = pickTrailerNode(edges, mediaTitle, season);
    if (node?.id) {
      trailerUrl = await resolvePlayback(node.id);
    }
  }
  return { trailerUrl, rating };
}
async function resolveImdbDetails(imdbId, mediaType, season) {
  const meta = await resolveViaGraphql(imdbId, season);
  if (meta.rating === null) {
    meta.rating = await resolveCinemetaRating(imdbId, mediaType);
  }
  return meta;
}
var index_default = defineJsAddon({
  manifest: {
    id: "dev.fearless.traileroojs",
    name: "TrailerooJS",
    version: "1.0.0",
    type: "js",
    description: "Adds the official IMDb rating and trailers for a TMDB title.",
    publisher: "fearless",
    logo: "https://raw.githubusercontent.com/KamruzzamanMahin/Signed_Local_Addons/main/traileroo/Traileroo.png",
    bundle: {
      url: "https://raw.githubusercontent.com/KamruzzamanMahin/Js-Addons/main/TrailerooJS/bundle.js",
      sha256: ""
    },
    capabilities: ["meta"]
  },
  /**
   * getMeta handler: fills IMDb ID, IMDb rating, and official trailer URL
   */
  getMeta: async (req) => {
    const tmdbId = req.tmdb_id ?? req.tmdbId;
    const mediaType = req.media_type ?? req.mediaType;
    const season = req.s ?? req.season;
    if (!tmdbId || !mediaType) {
      return null;
    }
    const imdbId = await resolveImdbId(tmdbId, mediaType);
    let details = { trailerUrl: null, rating: null };
    if (imdbId) {
      details = await resolveImdbDetails(imdbId, mediaType, season);
    }
    if (!imdbId && !details.trailerUrl && details.rating === null) {
      return null;
    }
    return {
      imdb_id: imdbId ?? null,
      imdb_rating: details.rating ?? null,
      trailers: details.trailerUrl ? [details.trailerUrl] : []
    };
  }
});
