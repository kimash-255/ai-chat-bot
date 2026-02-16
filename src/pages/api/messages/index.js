import {
  getThreadMessages,
  listThreadsForUser,
  sendMessageToThread,
} from "@/core/messaging/service";
import { requireAuthenticatedUser } from "@/lib/auth-server";
import { startAccessLog } from "@/lib/access-log";
import { logActivity } from "@/lib/logger";

export default async function handler(req, res) {
  startAccessLog(req, res, { route: "/api/messages", action: "messages_index" });
  const user = await requireAuthenticatedUser(req, res);
  if (!user) return;
  const userId = user.id;

  if (req.method === "GET") {
    try {
      const threads = await listThreadsForUser(userId);
      logActivity("messages_threads_listed", { userId, count: threads.length });
      return res.status(200).json({ ok: true, userId, threads });
    } catch (error) {
      return res.status(500).json({ ok: false, error: error?.message || "Failed to list threads." });
    }
  }

  if (req.method === "POST") {
    try {
      const { threadId, text, senderId, tags, model, attachmentSelections } = req.body || {};
      const saved = await sendMessageToThread({
        userId,
        threadId,
        senderId,
        text,
        tags,
        model,
        attachmentSelections,
      });

      const messages = await getThreadMessages({ userId, threadId: saved.threadId, limit: 200 });
      logActivity("message_sent", { userId, threadId: saved.threadId, length: String(text || "").length });
      return res.status(200).json({ ok: true, userId, threadId: saved.threadId, messages });
    } catch (error) {
      return res.status(400).json({ ok: false, error: error?.message || "Failed to send message." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ ok: false, error: "Method Not Allowed" });
}
