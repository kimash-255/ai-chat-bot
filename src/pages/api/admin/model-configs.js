import { getAllModelConfigs, upsertModelConfig } from "@/core/models/config-store";
import { requireAuthenticatedUser } from "@/lib/auth-server";

export default async function handler(req, res) {
  const user = await requireAuthenticatedUser(req, res, { adminOnly: true });
  if (!user) return;

  if (req.method === "GET") {
    const configs = await getAllModelConfigs();
    return res.status(200).json({ ok: true, configs });
  }

  if (req.method === "POST") {
    try {
      const config = await upsertModelConfig(req.body || {});
      return res.status(200).json({ ok: true, config });
    } catch (error) {
      return res.status(400).json({ ok: false, error: error?.message || "Failed to save config." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ ok: false, error: "Method Not Allowed" });
}
