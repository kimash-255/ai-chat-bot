import crypto from "crypto";

function readHeader(req, name) {
  const value = req?.headers?.[name];
  if (Array.isArray(value)) return value[0] || "";
  return String(value || "");
}

function firstIp(value) {
  return String(value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)[0] || "";
}

function hash12(input) {
  return crypto.createHash("sha256").update(String(input || "")).digest("hex").slice(0, 12);
}

function parseFiniteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function detectNetworkProvider(req) {
  const headers = req?.headers || {};
  if (headers["cf-ray"] || headers["cf-connecting-ip"]) return "cloudflare";
  if (headers["x-vercel-id"] || headers["x-vercel-ip-country"]) return "vercel";
  if (headers["x-amz-cf-id"] || headers["cloudfront-viewer-country"]) return "cloudfront";
  if (headers["x-amzn-trace-id"]) return "aws";
  if (headers["fly-request-id"]) return "flyio";
  if (headers["x-appengine-country"]) return "gcp";
  return "unknown";
}

function classifyIp(ip) {
  const value = String(ip || "").toLowerCase();
  if (!value || value === "unknown") return "unknown";
  if (value === "::1" || value.startsWith("127.")) return "loopback";
  if (value.startsWith("10.") || value.startsWith("192.168.") || value.startsWith("172.16.") || value.startsWith("172.17.") || value.startsWith("172.18.") || value.startsWith("172.19.") || value.startsWith("172.2") || value.startsWith("172.30.") || value.startsWith("172.31.")) return "private";
  if (value.startsWith("fc") || value.startsWith("fd")) return "private";
  return "public";
}

function buildGeoFromHeaders(req, ip) {
  const country =
    readHeader(req, "x-vercel-ip-country") ||
    readHeader(req, "cf-ipcountry") ||
    readHeader(req, "cloudfront-viewer-country") ||
    readHeader(req, "x-appengine-country") ||
    "";

  const region =
    readHeader(req, "x-vercel-ip-country-region") ||
    readHeader(req, "x-appengine-region") ||
    "";

  const city =
    readHeader(req, "x-vercel-ip-city") ||
    readHeader(req, "x-appengine-city") ||
    "";

  const latitude =
    parseFiniteNumber(readHeader(req, "x-vercel-ip-latitude")) ??
    parseFiniteNumber(readHeader(req, "x-geo-lat")) ??
    parseFiniteNumber(readHeader(req, "x-client-lat"));

  const longitude =
    parseFiniteNumber(readHeader(req, "x-vercel-ip-longitude")) ??
    parseFiniteNumber(readHeader(req, "x-geo-lng")) ??
    parseFiniteNumber(readHeader(req, "x-client-lng"));

  const asn =
    readHeader(req, "cf-ipasn") ||
    readHeader(req, "x-asn") ||
    "";

  return {
    ip,
    ipClass: classifyIp(ip),
    networkProvider: detectNetworkProvider(req),
    country: country || null,
    region: region || null,
    city: city || null,
    asn: asn || null,
    lat: latitude,
    lng: longitude,
    source: "ip_network_headers",
    capturedAt: new Date().toISOString(),
  };
}

export function buildRequestContext(req) {
  const forwardedFor = readHeader(req, "x-forwarded-for");
  const realIp = readHeader(req, "x-real-ip");
  const cfIp = readHeader(req, "cf-connecting-ip");
  const socketIp = String(req?.socket?.remoteAddress || "");
  const ip = firstIp(forwardedFor) || realIp || cfIp || socketIp || "unknown";

  const userAgent = readHeader(req, "user-agent");
  const acceptLanguage = readHeader(req, "accept-language");
  const host = readHeader(req, "host");
  const requestId =
    readHeader(req, "x-request-id") ||
    readHeader(req, "x-correlation-id") ||
    readHeader(req, "traceparent") ||
    readHeader(req, "cf-ray") ||
    `req_${Date.now()}_${hash12(Math.random().toString(36))}`;

  const networkFingerprint = `net_${hash12(`${ip}|${userAgent}|${acceptLanguage}`)}`;
  const geo = buildGeoFromHeaders(req, ip);

  return {
    requestId,
    networkFingerprint,
    ip,
    geo,
    forwardedFor: forwardedFor || undefined,
    realIp: realIp || undefined,
    cfConnectingIp: cfIp || undefined,
    host: host || undefined,
    userAgent: userAgent || undefined,
    acceptLanguage: acceptLanguage || undefined,
    serverPid: process.pid,
    serverHostname: process.env.HOSTNAME || undefined,
  };
}
