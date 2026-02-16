import { getThreadMessages, readAttachmentForUser } from "@/core/messaging/service";
import { requireAuthenticatedUser } from "@/lib/auth-server";
import { startAccessLog } from "@/lib/access-log";
import { logActivity } from "@/lib/logger";

export default async function handler(req, res) {
  startAccessLog(req, res, { route: "/api/messages/[threadId]", action: "messages_thread" });
  const user = await requireAuthenticatedUser(req, res);
  if (!user) return;
  const userId = user.id;
  const threadId = String(req.query.threadId || "");

  if (!threadId) {
    return res.status(400).json({ ok: false, error: "threadId is required." });
  }

  if (req.method === "GET") {
    try {
      const { messageId, uplinkId } = req.query || {};
      if (messageId && uplinkId) {
        const attachment = await readAttachmentForUser({
          userId,
          threadId,
          messageId: String(messageId),
          uplinkId: String(uplinkId),
        });
        logActivity("message_attachment_opened", { userId, threadId, messageId: String(messageId), uplinkId: String(uplinkId) });
        return res.status(200).json({ ok: true, userId, threadId, attachment });
      }

      const messages = await getThreadMessages({ userId, threadId, limit: 250 });
      logActivity("messages_thread_read", { userId, threadId, count: messages.length });
      return res.status(200).json({ ok: true, userId, threadId, messages });
    } catch (error) {
      return res.status(400).json({ ok: false, error: error?.message || "Failed to read thread." });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).json({ ok: false, error: "Method Not Allowed" });
}
