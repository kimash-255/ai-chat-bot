import { getUserById, saveUser } from "@/core/auth/store";
import { requireAuthenticatedUser } from "@/lib/auth-server";
import { startAccessLog } from "@/lib/access-log";

export default async function handler(req, res) {
  startAccessLog(req, res, { route: "/api/user/welcome", action: "user_welcome" });
  const user = await requireAuthenticatedUser(req, res);
  if (!user) return;

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      role: user.role,
      completed: Boolean(user?.profile?.welcomeCompletedAt),
      completedAt: user?.profile?.welcomeCompletedAt || null,
      docsVisitedAt: user?.profile?.docsVisitedAt || null,
    });
  }

  if (req.method === "POST") {
    const current = await getUserById(user.id);
    if (!current) return res.status(404).json({ ok: false, error: "User not found." });

    const next = {
      ...current,
      profile: {
        ...(current.profile || {}),
        welcomeCompletedAt: new Date().toISOString(),
      },
    };
    await saveUser(next);
    return res.status(200).json({ ok: true, completedAt: next.profile.welcomeCompletedAt });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ ok: false, error: "Method Not Allowed" });
}

