import {
  deleteSession,
  getSessionById,
  getUserById,
  getUserByUsername,
  saveSession,
  saveUser,
} from "@/core/auth/store";
import { getPgPool } from "@/db/deep/postgres";
import { ensureTenantForUser } from "@/core/tenancy/service";
import { hashPassword, issueSessionToken, verifyPassword, verifySessionToken } from "./auth-crypto";
import { logInfo, logWarn } from "./logger";
import { createId } from "./utils";

const SESSION_COOKIE = "app_session";

function parseCookieHeader(cookieHeader = "") {
  const parts = cookieHeader.split(";").map((p) => p.trim()).filter(Boolean);
  const out = {};
  for (const part of parts) {
    const [key, ...rest] = part.split("=");
    try {
      out[key] = decodeURIComponent(rest.join("="));
    } catch {
      out[key] = rest.join("=");
    }
  }
  return out;
}

function isHttpsRequest(req) {
  const proto = String(req?.headers?.["x-forwarded-proto"] || "").toLowerCase();
  if (proto.includes("https")) return true;
  return Boolean(req?.socket?.encrypted);
}

function setSessionCookie(req, res, token) {
  const secure = process.env.NODE_ENV === "production" && isHttpsRequest(req);
  const cookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; ${
    secure ? "Secure; " : ""
  }Max-Age=${60 * 60 * 24 * 7}`;
  res.setHeader("Set-Cookie", cookie);
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict`);
}

export async function ensureAdminSeed() {
  const adminUsername = String(process.env.ADMIN_USERNAME || "").trim().toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || "");
  const adminDisplayName = String(process.env.ADMIN_DISPLAY_NAME || "System Admin");
  const adminBio = String(process.env.ADMIN_BIO || "Administrator profile");
  const adminPhilosophyAnswer = String(process.env.ADMIN_PHILOSOPHY_ANSWER || "").trim().toLowerCase();

  if (!adminUsername || !adminPassword || !adminPhilosophyAnswer) {
    return null;
  }

  const existing = await getUserByUsername(adminUsername);
  if (existing) {
    const nextProfile = {
      ...(existing.profile || {}),
      nos: existing.profile?.nos || createId("nos"),
      friends: Array.isArray(existing.profile?.friends) ? existing.profile.friends : [],
      friendRequestsInbox: Array.isArray(existing.profile?.friendRequestsInbox) ? existing.profile.friendRequestsInbox : [],
      friendRequestsSent: Array.isArray(existing.profile?.friendRequestsSent) ? existing.profile.friendRequestsSent : [],
      adminPhilosophyAnswer,
    };
    if (JSON.stringify(nextProfile) !== JSON.stringify(existing.profile || {})) {
      await saveUser({ ...existing, profile: nextProfile });
    }
    return { ...existing, profile: nextProfile };
  }

  const id = createId("usr");
  const user = {
    id,
    username: adminUsername,
    password_hash: hashPassword(adminPassword),
    role: "admin",
    profile: {
      displayName: adminDisplayName,
      bio: adminBio,
      nos: createId("nos"),
      friends: [],
      friendRequestsInbox: [],
      friendRequestsSent: [],
      createdBySeed: true,
      adminPhilosophyAnswer,
    },
  };
  await saveUser(user);
  await ensureTenantForUser(id);
  return user;
}

export async function registerWithPassword({ username, password, profile = {} }) {
  const cleanUser = String(username || "").trim().toLowerCase();
  const cleanPassword = String(password || "");
  if (cleanUser.length < 3) throw new Error("Username must be at least 3 characters.");
  if (cleanPassword.length < 8) throw new Error("Password must be at least 8 characters.");

  const existing = await getUserByUsername(cleanUser);
  if (existing) throw new Error("Username already exists.");

  const id = createId("usr");
  const user = {
    id,
    username: cleanUser,
    password_hash: hashPassword(cleanPassword),
    role: "user",
    profile,
  };
  if (!user.profile?.nos) user.profile.nos = createId("nos");
  if (!Array.isArray(user.profile?.friends)) user.profile.friends = [];
  if (!Array.isArray(user.profile?.friendRequestsInbox)) user.profile.friendRequestsInbox = [];
  if (!Array.isArray(user.profile?.friendRequestsSent)) user.profile.friendRequestsSent = [];
  await saveUser(user);
  await ensureTenantForUser(id);
  return user;
}

export async function loginWithPassword({
  username,
  password,
  req,
  res,
  adminPhilosophyAnswer = "",
  ipAddress = "unknown",
  clientGeo = null,
  requestContext = null,
}) {
  const cleanUser = String(username || "").trim().toLowerCase();
  const user = await getUserByUsername(cleanUser);
  if (!user) throw new Error("Invalid credentials.");
  if (!verifyPassword(password, user.password_hash)) throw new Error("Invalid credentials.");
  if (user.role === "admin") {
    const expected = String((user.profile || {}).adminPhilosophyAnswer || "").trim().toLowerCase();
    if (!expected) {
      throw new Error("Admin verification is not configured.");
    }
    if (String(adminPhilosophyAnswer || "").trim().toLowerCase() !== expected) {
      throw new Error("Admin verification failed.");
    }
  }
  await ensureTenantForUser(user.id);
  await saveUser({
    ...user,
    profile: {
      ...(user.profile || {}),
      lastLoginIp: ipAddress,
      lastLoginAt: new Date().toISOString(),
      lastNetworkFingerprint: requestContext?.networkFingerprint || "",
      lastRequestId: requestContext?.requestId || "",
      lastLoginGeo:
        clientGeo && Number.isFinite(Number(clientGeo.lat)) && Number.isFinite(Number(clientGeo.lng))
          ? {
              lat: Number(clientGeo.lat),
              lng: Number(clientGeo.lng),
              accuracy: Number.isFinite(Number(clientGeo.accuracy)) ? Number(clientGeo.accuracy) : null,
              source: "client_geolocation",
              capturedAt: new Date().toISOString(),
            }
          : requestContext?.geo && Number.isFinite(Number(requestContext.geo.lat)) && Number.isFinite(Number(requestContext.geo.lng))
            ? {
                lat: Number(requestContext.geo.lat),
                lng: Number(requestContext.geo.lng),
                accuracy: null,
                source: requestContext.geo.source || "ip_network_headers",
                capturedAt: new Date().toISOString(),
              }
            : (user.profile || {}).lastLoginGeo || null,
      lastLoginGeoMeta: requestContext?.geo || (user.profile || {}).lastLoginGeoMeta || null,
    },
  });

  const issued = issueSessionToken(user.id);
  await saveSession({
    id: issued.sessionId,
    user_id: user.id,
    expires_at: issued.expiresAt,
    csrf_token: issued.csrfToken,
  });
  setSessionCookie(req, res, issued.token);

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    profile: user.profile || {},
  };
}

export async function logoutSession(req, res) {
  const cookies = parseCookieHeader(req.headers.cookie || "");
  const token = cookies[SESSION_COOKIE];
  const parsed = verifySessionToken(token);
  if (parsed?.sessionId) {
    await deleteSession(parsed.sessionId);
  }
  clearSessionCookie(res);
}

export async function readAuthenticatedUser(req) {
  const cookies = parseCookieHeader(req.headers.cookie || "");
  const token = cookies[SESSION_COOKIE];
  const parsed = verifySessionToken(token);
  if (!parsed) {
    logWarn("auth_me_no_or_invalid_cookie", { hasCookie: Boolean(token) });
    return null;
  }

  const session = await getSessionById(parsed.sessionId);
  const hasPersistentDb = Boolean(await getPgPool());
  if (session && Date.parse(session.expires_at) < Date.now()) {
    logWarn("auth_me_session_expired", { sessionId: parsed.sessionId });
    return null;
  }
  if (!session && hasPersistentDb) {
    logWarn("auth_me_session_missing_with_db", { sessionId: parsed.sessionId });
    return null;
  }

  const tokenUserId = parsed.userId || parsed.user_id || "";
  const user = await getUserById(tokenUserId);
  if (!user) {
    logWarn("auth_me_user_missing", { userId: tokenUserId });
    return null;
  }
  await ensureTenantForUser(user.id);
  logInfo("auth_me_success", { userId: user.id, role: user.role });
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    profile: user.profile || {},
  };
}

export async function requireAuthenticatedUser(req, res, { adminOnly = false } = {}) {
  const user = await readAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ ok: false, error: "Authentication required." });
    return null;
  }
  if (adminOnly && user.role !== "admin") {
    res.status(403).json({ ok: false, error: "Admin privileges required." });
    return null;
  }
  return user;
}
