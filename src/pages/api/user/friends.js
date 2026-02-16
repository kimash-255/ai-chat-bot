import { getUserById, getUserByUsername, saveUser } from "@/core/auth/store";
import { requireAuthenticatedUser } from "@/lib/auth-server";

function normalizeFriends(profile) {
  const list = Array.isArray(profile?.friends) ? profile.friends : [];
  return [...new Set(list.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean))];
}

export default async function handler(req, res) {
  const user = await requireAuthenticatedUser(req, res);
  if (!user) return;

  const record = await getUserById(user.id);
  if (!record) return res.status(404).json({ ok: false, error: "User not found." });

  if (req.method === "GET") {
    return res.status(200).json({ ok: true, friends: normalizeFriends(record.profile) });
  }

  if (req.method === "POST") {
    const friendUsername = String(req.body?.friendUsername || "").trim().toLowerCase();
    if (!friendUsername) return res.status(400).json({ ok: false, error: "Friend username is required." });
    if (friendUsername === user.username) return res.status(400).json({ ok: false, error: "You cannot add yourself." });
    const friend = await getUserByUsername(friendUsername);
    if (!friend) return res.status(404).json({ ok: false, error: "Friend account not found." });

    const nextFriends = [...new Set([...normalizeFriends(record.profile), friendUsername])];
    await saveUser({
      ...record,
      profile: {
        ...(record.profile || {}),
        friends: nextFriends,
      },
    });
    return res.status(200).json({ ok: true, friends: nextFriends });
  }

  if (req.method === "DELETE") {
    const friendUsername = String(req.body?.friendUsername || "").trim().toLowerCase();
    const nextFriends = normalizeFriends(record.profile).filter((item) => item !== friendUsername);
    await saveUser({
      ...record,
      profile: {
        ...(record.profile || {}),
        friends: nextFriends,
      },
    });
    return res.status(200).json({ ok: true, friends: nextFriends });
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).json({ ok: false, error: "Method Not Allowed" });
}
