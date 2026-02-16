import { appendLongMemory, getLongThreadMessages, listLongThreads } from "@/core/memory/long";
import { appendShortMemory, buildMemoryKey, getShortMemory, setShortMemory } from "@/core/memory/short";
import { getUserById, getUserByUsername } from "@/core/auth/store";
import { fromEncryptedEnvelope, getUplink, toEncryptedEnvelope } from "@/lib/uplink";
import { createId, nowIso, toArray } from "@/lib/utils";

function toThreadId(memoryKey) {
  const parts = memoryKey.split(":");
  return parts[1] || memoryKey;
}

function decryptMessage(userId, record) {
  try {
    const payload = fromEncryptedEnvelope(userId, record.encrypted);
    return payload;
  } catch {
    return null;
  }
}

async function getFriendUsernames(userId) {
  const user = await getUserById(userId);
  const friends = Array.isArray(user?.profile?.friends) ? user.profile.friends : [];
  return [...new Set(friends.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean))];
}

async function ensureFriendThread(userId, threadId) {
  const friendUsername = String(threadId || "").trim().toLowerCase();
  if (!friendUsername) throw new Error("Friend thread id is required.");
  const friends = await getFriendUsernames(userId);
  if (!friends.includes(friendUsername)) {
    throw new Error("You can only message users in your friends list.");
  }
  const friend = await getUserByUsername(friendUsername);
  if (!friend) throw new Error("Friend account not found.");
  return friendUsername;
}

export async function listThreadsForUser(userId) {
  const keys = await listLongThreads({ userId });
  const friends = await getFriendUsernames(userId);
  return keys
    .map((memoryKey) => ({
    id: toThreadId(memoryKey),
    memoryKey,
    }))
    .filter((thread) => friends.includes(String(thread.id || "").toLowerCase()));
}

export async function getThreadMessages({ userId, threadId, limit = 200 }) {
  await ensureFriendThread(userId, threadId);
  const memoryKey = buildMemoryKey({ userId, scopeId: threadId });
  const short = await getShortMemory(memoryKey);
  if (short.length) return short;

  const long = await getLongThreadMessages({ memoryKey, limit });
  const decrypted = long.map((entry) => decryptMessage(userId, entry)).filter(Boolean);
  const deduped = [];
  const byId = new Map();
  for (const msg of decrypted) {
    byId.set(msg.id, msg);
  }
  for (const msg of [...byId.values()].sort((a, b) => Date.parse(a.createdAt || 0) - Date.parse(b.createdAt || 0))) {
    deduped.push(msg);
  }
  if (deduped.length) {
    await appendShortMemory(memoryKey, deduped, 80);
  }
  return deduped;
}

export async function sendMessageToThread({
  userId,
  threadId,
  senderId,
  text,
  tags = [],
  model = "direct-message",
  attachmentSelections = [],
}) {
  const safeText = String(text || "").trim();
  if (!safeText) {
    throw new Error("Message text is required.");
  }

  const resolvedThreadId = await ensureFriendThread(userId, threadId);
  const memoryKey = buildMemoryKey({ userId, scopeId: resolvedThreadId });
  const safeSelections = toArray(attachmentSelections);

  const attachments = [];
  for (const item of safeSelections) {
    const uplink = await getUplink(userId, item.uplinkId);
    if (!uplink) continue;
    attachments.push({
      uplinkId: uplink.uplinkId,
      fileName: uplink.fileName,
      mimeType: uplink.mimeType,
      sizeBytes: uplink.sizeBytes,
      viewOnce: Boolean(item.viewOnce),
      remainingViews: item.viewOnce ? 1 : null,
    });
  }

  const message = {
    id: createId("msg"),
    threadId: resolvedThreadId,
    senderId: userId,
    text: safeText,
    tags: toArray(tags),
    model,
    attachments,
    createdAt: nowIso(),
  };

  const encrypted = toEncryptedEnvelope(userId, message);
  const longRecord = {
    id: message.id,
    threadId: resolvedThreadId,
    encrypted,
    createdAt: message.createdAt,
  };

  await appendShortMemory(memoryKey, [message], 80);
  await appendLongMemory({ memoryKey, message: longRecord });

  return {
    threadId: resolvedThreadId,
    message,
  };
}

export async function readAttachmentForUser({ userId, threadId, messageId, uplinkId }) {
  const memoryKey = buildMemoryKey({ userId, scopeId: threadId });
  const messages = await getThreadMessages({ userId, threadId, limit: 250 });
  const target = messages.find((msg) => msg.id === messageId);
  if (!target) {
    throw new Error("Message not found.");
  }

  const attachment = toArray(target.attachments).find((item) => item.uplinkId === uplinkId);
  if (!attachment) {
    throw new Error("Attachment not found on message.");
  }

  if (attachment.viewOnce && attachment.remainingViews === 0) {
    throw new Error("Attachment view limit reached.");
  }

  const uplink = await getUplink(userId, uplinkId);
  if (!uplink) {
    throw new Error("Uplink payload not found.");
  }

  if (attachment.viewOnce) {
    attachment.remainingViews = Math.max(0, (attachment.remainingViews || 1) - 1);
    await setShortMemory(memoryKey, messages);
    await appendLongMemory({
      memoryKey,
      message: {
        id: target.id,
        threadId,
        encrypted: toEncryptedEnvelope(userId, target),
        createdAt: nowIso(),
      },
    });
  }

  return {
    uplinkId,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    dataUrl: uplink.decrypted.dataUrl,
    remainingViews: attachment.remainingViews,
  };
}
