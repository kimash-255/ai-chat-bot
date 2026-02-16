import { getLongThreadMessages } from "@/core/memory/long";
import { getShortMemory } from "@/core/memory/short";
import { requireAuthenticatedUser } from "@/lib/auth-server";
import { startAccessLog } from "@/lib/access-log";

function normalizeMessage(entry, idx, prefix = "m") {
  return {
    id: `${prefix}-${idx + 1}`,
    role: String(entry?.role || "assistant"),
    content: String(entry?.content || ""),
    createdAt: entry?.createdAt || new Date().toISOString(),
    tags: Array.isArray(entry?.tags) ? entry.tags : [],
    model: entry?.model || "auto",
    usage: entry?.usage || { totalTokens: 0 },
  };
}

function flattenLongEntries(entries = []) {
  const output = [];
  entries.forEach((record) => {
    const turn = record?.encrypted?.plaintext;
    if (!Array.isArray(turn)) return;
    turn.forEach((msg) => output.push(msg));
  });
  return output;
}

export default async function handler(req, res) {
  startAccessLog(req, res, { route: "/api/chat/sessions/[sessionId]", action: "chat_session_read" });
  const user = await requireAuthenticatedUser(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const sessionId = String(req.query.sessionId || "").trim();
  if (!sessionId) {
    return res.status(400).json({ ok: false, error: "sessionId is required." });
  }

  try {
    const memoryKey = `${user.id}:${sessionId}`;
    const short = await getShortMemory(memoryKey);
    if (Array.isArray(short) && short.length) {
      return res.status(200).json({
        ok: true,
        sessionId,
        messages: short.map((item, idx) => normalizeMessage(item, idx, "s")),
      });
    }

    const long = await getLongThreadMessages({ memoryKey, limit: 300 });
    const flattened = flattenLongEntries(long);
    return res.status(200).json({
      ok: true,
      sessionId,
      messages: flattened.map((item, idx) => normalizeMessage(item, idx, "l")),
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || "Failed to load session messages." });
  }
}

