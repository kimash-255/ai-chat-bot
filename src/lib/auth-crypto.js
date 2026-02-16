import crypto from "crypto";
import { createId } from "./utils";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function authSecret() {
  return process.env.AUTH_SECRET || "dev-auth-secret-change-me";
}

function pepper() {
  return process.env.AUTH_PEPPER || "dev-auth-pepper-change-me";
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto
    .scryptSync(`${password}${pepper()}`, salt, 64, { N: 16384, r: 8, p: 1 })
    .toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.startsWith("scrypt$")) return false;
  const [, salt, hash] = storedHash.split("$");
  const derived = crypto
    .scryptSync(`${password}${pepper()}`, salt, 64, { N: 16384, r: 8, p: 1 })
    .toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
}

function signPayload(payload) {
  return crypto.createHmac("sha256", authSecret()).update(payload).digest("base64url");
}

export function issueSessionToken(userId) {
  const sessionId = createId("sess");
  const nonce = crypto.randomBytes(12).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const payload = Buffer.from(JSON.stringify({ sessionId, userId, nonce, expiresAt })).toString("base64url");
  const signature = signPayload(payload);
  return {
    token: `${payload}.${signature}`,
    sessionId,
    userId,
    expiresAt,
    csrfToken: crypto.randomBytes(16).toString("base64url"),
  };
}

export function verifySessionToken(token) {
  try {
    if (!token || typeof token !== "string" || !token.includes(".")) return null;
    const [payload, signature] = token.split(".");
    const expected = signPayload(payload);
    const lhs = Buffer.from(String(signature || ""), "utf8");
    const rhs = Buffer.from(String(expected || ""), "utf8");
    if (lhs.length !== rhs.length) return null;
    if (!crypto.timingSafeEqual(lhs, rhs)) return null;

    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (Date.parse(decoded.expiresAt) < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}
