import { getUserById, getUserByUsername, listAllUsers, saveUser } from "@/core/auth/store";
import { requireAuthenticatedUser } from "@/lib/auth-server";
import { createId } from "@/lib/utils";

function asList(value) {
  return Array.isArray(value) ? value : [];
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function withUnique(values) {
  return [...new Set(values.map((item) => normalize(item)).filter(Boolean))];
}

async function resolveTargetUser(via, value) {
  if (via === "username") {
    return getUserByUsername(normalize(value));
  }
  if (via === "id") {
    const direct = await getUserById(String(value || "").trim());
    if (direct) return direct;
    return getUserByUsername(normalize(value));
  }
  if (via === "nos") {
    const users = await listAllUsers();
    const found = users.find((item) => normalize(item.profile?.nos) === normalize(value));
    if (!found) return null;
    return getUserById(found.id);
  }
  if (via === "qr") {
    const raw = String(value || "").trim();
    if (!raw.startsWith("friend://")) return null;
    const payload = raw.slice("friend://".length);
    if (payload.startsWith("nos/")) {
      return resolveTargetUser("nos", payload.slice(4));
    }
    if (payload.startsWith("username/")) {
      return resolveTargetUser("username", payload.slice(9));
    }
  }
  return null;
}

export default async function handler(req, res) {
  const user = await requireAuthenticatedUser(req, res);
  if (!user) return;
  const self = await getUserById(user.id);
  if (!self) return res.status(404).json({ ok: false, error: "User not found." });

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      inbox: asList(self.profile?.friendRequestsInbox),
      sent: asList(self.profile?.friendRequestsSent),
      nos: self.profile?.nos || "",
      qrValue: `friend://nos/${self.profile?.nos || ""}`,
    });
  }

  if (req.method === "POST") {
    const via = normalize(req.body?.via);
    const value = String(req.body?.value || "");
    const target = await resolveTargetUser(via, value);
    if (!target) return res.status(404).json({ ok: false, error: "Target user not found." });
    if (target.id === self.id) return res.status(400).json({ ok: false, error: "Cannot send request to yourself." });

    const request = {
      id: createId("fr"),
      fromUserId: self.id,
      fromUsername: self.username,
      toUserId: target.id,
      toUsername: target.username,
      via,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    await saveUser({
      ...self,
      profile: {
        ...(self.profile || {}),
        friendRequestsSent: [...asList(self.profile?.friendRequestsSent), request],
      },
    });
    await saveUser({
      ...target,
      profile: {
        ...(target.profile || {}),
        friendRequestsInbox: [...asList(target.profile?.friendRequestsInbox), request],
      },
    });
    return res.status(200).json({ ok: true, request });
  }

  if (req.method === "PATCH") {
    const requestId = String(req.body?.requestId || "");
    const action = normalize(req.body?.action);
    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ ok: false, error: "Action must be accept or reject." });
    }

    const inbox = asList(self.profile?.friendRequestsInbox);
    const targetRequest = inbox.find((item) => item.id === requestId && item.status === "pending");
    if (!targetRequest) return res.status(404).json({ ok: false, error: "Request not found." });

    const sender = await getUserById(targetRequest.fromUserId);
    if (!sender) return res.status(404).json({ ok: false, error: "Sender not found." });

    const nextInbox = inbox.map((item) => (item.id === requestId ? { ...item, status: action } : item));
    const nextSenderSent = asList(sender.profile?.friendRequestsSent).map((item) =>
      item.id === requestId ? { ...item, status: action } : item
    );

    const selfFriends = withUnique(asList(self.profile?.friends));
    const senderFriends = withUnique(asList(sender.profile?.friends));
    if (action === "accept") {
      selfFriends.push(normalize(sender.username));
      senderFriends.push(normalize(self.username));
    }

    await saveUser({
      ...self,
      profile: {
        ...(self.profile || {}),
        friendRequestsInbox: nextInbox,
        friends: withUnique(selfFriends),
      },
    });

    await saveUser({
      ...sender,
      profile: {
        ...(sender.profile || {}),
        friendRequestsSent: nextSenderSent,
        friends: withUnique(senderFriends),
      },
    });

    return res.status(200).json({ ok: true, action, requestId });
  }

  res.setHeader("Allow", ["GET", "POST", "PATCH"]);
  return res.status(405).json({ ok: false, error: "Method Not Allowed" });
}
