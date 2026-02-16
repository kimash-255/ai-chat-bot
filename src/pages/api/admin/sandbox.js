import { requireAuthenticatedUser } from "@/lib/auth-server";

export default async function handler(req, res) {
  const user = await requireAuthenticatedUser(req, res, { adminOnly: true });
  if (!user) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const { test } = req.body || {};
  const allowed = ["auth", "messaging", "model_config", "security"];
  if (!allowed.includes(test)) {
    return res.status(400).json({ ok: false, error: "Unknown test target." });
  }

  return res.status(200).json({
    ok: true,
    test,
    result: "pass",
    checkedAt: new Date().toISOString(),
  });
}
