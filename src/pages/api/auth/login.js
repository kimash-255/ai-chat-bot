import { ensureAdminSeed, loginWithPassword } from "@/lib/auth-server";
import {
  checkLoginAllowance,
  clearLoginFailures,
  recordLoginFailure,
} from "@/lib/security-guard";
import { logActivity, logInfo, logWarn } from "@/lib/logger";
import { buildRequestContext } from "@/lib/request-context";
import { startAccessLog } from "@/lib/access-log";

export default async function handler(req, res) {
  startAccessLog(req, res, { route: "/api/auth/login", action: "auth_login" });
  await ensureAdminSeed();

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { username, password, adminPhilosophyAnswer, clientGeo } = req.body || {};
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const requestContext = buildRequestContext(req);
    const guard = checkLoginAllowance(String(username || "").toLowerCase(), String(ip));
    if (!guard.allowed) {
      logWarn("login_rate_limited", { username, ip, ...requestContext, code: "AUTH_RATE_LIMIT" });
      return res.status(429).json({
        ok: false,
        error: "Too many attempts. Try again later.",
        retryAt: new Date(guard.retryAt).toISOString(),
      });
    }

    const user = await loginWithPassword({
      username,
      password,
      req,
      res,
      adminPhilosophyAnswer,
      ipAddress: String(ip),
      clientGeo,
      requestContext,
    });
    logInfo("login_success", { userId: user.id, role: user.role, ip, geo: requestContext.geo, ...requestContext });
    logActivity("user_login", { userId: user.id, username: user.username, role: user.role, requestId: requestContext.requestId, ip: requestContext.ip });
    clearLoginFailures(String(username || "").toLowerCase(), String(ip));
    return res.status(200).json({ ok: true, user });
  } catch (error) {
    const { username } = req.body || {};
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const requestContext = buildRequestContext(req);
    recordLoginFailure(String(username || "").toLowerCase(), String(ip));
    logWarn("login_failed", {
      username,
      ip,
      ...requestContext,
      code: "AUTH_LOGIN_FAILED",
      error: error?.message || "Login failed.",
    });
    return res.status(401).json({ ok: false, error: error?.message || "Login failed." });
  }
}
