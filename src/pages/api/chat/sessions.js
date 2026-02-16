import { getLongThreadMessages, listLongThreads } from "@/core/memory/long";
import { requireAuthenticatedUser } from "@/lib/auth-server";
import { startAccessLog } from "@/lib/access-log";

function toSessionId(memoryKey, userId) {
  return String(memoryKey || "").replace(`${userId}:`, "");
}

function toTitleFromSessionId(sessionId) {
  const clean = String(sessionId || "").trim();
  if (!clean) return "Untitled Chat";
  return clean.length > 32 ? `${clean.slice(0, 31)}...` : clean;
}

export default async function handler(req, res) {
  startAccessLog(req, res, { route: "/api/chat/sessions", action: "chat_sessions_list" });
  const user = await requireAuthenticatedUser(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const keys = await listLongThreads({ userId: user.id });
    const sessions = [];

    for (const memoryKey of keys) {
      if (!String(memoryKey || "").startsWith(`${user.id}:`)) continue;
      const entries = await getLongThreadMessages({ memoryKey, limit: 6 });
      const hasAiTurns = entries.some((record) => Array.isArray(record?.encrypted?.plaintext));
      if (!hasAiTurns) continue;

      const id = toSessionId(memoryKey, user.id);
      sessions.push({
        id,
        title: toTitleFromSessionId(id),
        preview: "",
      });
    }

    return res.status(200).json({ ok: true, sessions });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || "Failed to list chat sessions." });
  }
}
