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
  const models = configs
    .filter((cfg) => Boolean(cfg.provider))
    .map((cfg) => ({
      id: cfg.id,
      name: cfg.name,
      provider: cfg.provider,
      model: cfg.default_model ? `${cfg.provider}:${cfg.default_model}` : `${cfg.provider}:configured`,
      endpoint: cfg.endpoint_url,
    }));

  return res.status(200).json({ ok: true, models, routes: [], params: {} });
}
