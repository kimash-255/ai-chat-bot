import { runChatOrchestrator } from "../../core/orchestrator";
import { requireAuthenticatedUser } from "@/lib/auth-server";
import { startAccessLog } from "@/lib/access-log";
import { logActivity } from "@/lib/logger";

export default async function handler(req, res) {
  startAccessLog(req, res, { route: "/api/chat", action: "chat_turn" });
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const user = await requireAuthenticatedUser(req, res);
    if (!user) return;
    const userId = user.id;
    const payload = req.body || {};
    const scopedSessionId = `${userId}:${payload.sessionId || "default"}`;

    const result = await runChatOrchestrator({ ...payload, sessionId: scopedSessionId });

    if (!result.ok) {
      return res.status(400).json(result);
    }
    logActivity("chat_turn_success", {
      userId,
      sessionId: scopedSessionId,
      modelResolved: result?.meta?.modelResolved,
      tags: result?.meta?.tags || [],
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.message || "Internal Server Error",
    });
  }
}
