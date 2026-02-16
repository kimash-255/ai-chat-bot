import { getActiveModelConfigs } from "@/core/models/config-store";
import { requireAuthenticatedUser } from "@/lib/auth-server";

export default async function handler(req, res) {
  const user = await requireAuthenticatedUser(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const configs = await getActiveModelConfigs();
  return res.status(200).json({
    ok: true,
    configs: configs.map((cfg) => ({
      id: cfg.id,
      name: cfg.name,
      model: cfg.default_model ? `${cfg.provider}:${cfg.default_model}` : `${cfg.provider}:configured`,
      provider: cfg.provider,
    })),
  });
}
