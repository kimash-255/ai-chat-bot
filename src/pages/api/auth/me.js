import { ensureAdminSeed, readAuthenticatedUser } from "@/lib/auth-server";
import { logActivity, logWarn } from "@/lib/logger";
import { buildRequestContext } from "@/lib/request-context";
import { startAccessLog } from "@/lib/access-log";

export default async function handler(req, res) {
  startAccessLog(req, res, { route: "/api/auth/me", action: "auth_me" });
  await ensureAdminSeed();

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const user = await readAuthenticatedUser(req);
  if (!user) {
    logWarn("auth_me_unauthorized", { route: "/api/auth/me", ...buildRequestContext(req), code: "AUTH_ME_401" });
    return res.status(401).json({ ok: false, error: "Not authenticated." });
  }
  logActivity("auth_me_success", { userId: user.id, username: user.username, role: user.role });

  return res.status(200).json({ ok: true, user });
}
