import { logoutSession } from "@/lib/auth-server";
import { startAccessLog } from "@/lib/access-log";
import { logActivity } from "@/lib/logger";
import { buildRequestContext } from "@/lib/request-context";

export default async function handler(req, res) {
  startAccessLog(req, res, { route: "/api/auth/logout", action: "auth_logout" });
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  await logoutSession(req, res);
  const ctx = buildRequestContext(req);
  logActivity("user_logout", { requestId: ctx.requestId, ip: ctx.ip, networkFingerprint: ctx.networkFingerprint });
  return res.status(200).json({ ok: true });
}
