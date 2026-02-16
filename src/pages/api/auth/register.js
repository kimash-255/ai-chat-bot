import { ensureAdminSeed, registerWithPassword } from "@/lib/auth-server";
import { startAccessLog } from "@/lib/access-log";
import { normalizeInterests } from "@/lib/interests";
import { logActivity, logInfo, logWarn } from "@/lib/logger";

export default async function handler(req, res) {
  startAccessLog(req, res, { route: "/api/auth/register", action: "auth_register" });
  await ensureAdminSeed();

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { username, password, displayName, bio, interests, sacredNickname, friendUsername } = req.body || {};
    const normalizedFriend = String(friendUsername || "").trim().toLowerCase();
    const selectedInterests = normalizeInterests(interests);
    if (!selectedInterests.length) {
      return res.status(400).json({ ok: false, error: "Select at least one area of interest." });
    }
    const user = await registerWithPassword({
      username,
      password,
      profile: {
        displayName: String(displayName || username || "").trim(),
        bio: String(bio || "").trim(),
        interests: selectedInterests,
        sacredNickname: String(sacredNickname || "").trim(),
        friendUsername: normalizedFriend,
        friends: normalizedFriend ? [normalizedFriend] : [],
      },
    });
    logInfo("register_success", { userId: user.id, username: user.username });
    logActivity("user_registered", { userId: user.id, username: user.username, role: user.role });
    return res.status(200).json({
      ok: true,
      user: { id: user.id, username: user.username, role: user.role, profile: user.profile },
    });
  } catch (error) {
    logWarn("register_failed", { username: req.body?.username, error: error?.message || "Registration failed." });
    return res.status(400).json({ ok: false, error: error?.message || "Registration failed." });
  }
}
