import { listAllUsers } from "@/core/auth/store";
import { getAllModelConfigs } from "@/core/models/config-store";
import { requireAuthenticatedUser } from "@/lib/auth-server";

function normalizeGeo(item) {
  const country = String(item.profile?.lastLoginGeoMeta?.country || "").trim().toUpperCase();
  const region = String(item.profile?.lastLoginGeoMeta?.region || "").trim();
  const city = String(item.profile?.lastLoginGeoMeta?.city || "").trim();
  if (country || region || city) {
    return [country || "country?", region || "region?", city || "city?"].join(" / ");
  }
  const ip = String(item.profile?.lastLoginIp || "");
  if (!ip || ip === "unknown") return "unknown";
  if (ip.startsWith("127.") || ip === "::1") return "local";
  return "internet";
}

export default async function handler(req, res) {
  const user = await requireAuthenticatedUser(req, res, { adminOnly: true });
  if (!user) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const users = await listAllUsers();
  const modelConfigs = await getAllModelConfigs();

  const geoCounts = users.reduce((acc, item) => {
    const key = normalizeGeo(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const geoPoints = users
    .map((item) => {
      const lat = Number(item.profile?.lastLoginGeo?.lat ?? item.profile?.lastLoginGeoMeta?.lat);
      const lng = Number(item.profile?.lastLoginGeo?.lng ?? item.profile?.lastLoginGeoMeta?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return {
        userId: item.id,
        username: item.username,
        role: item.role,
        lat,
        lng,
        accuracy: item.profile?.lastLoginGeo?.accuracy ?? null,
        source: item.profile?.lastLoginGeo?.source || item.profile?.lastLoginGeoMeta?.source || "unknown",
        country: item.profile?.lastLoginGeoMeta?.country || null,
        region: item.profile?.lastLoginGeoMeta?.region || null,
        city: item.profile?.lastLoginGeoMeta?.city || null,
        networkProvider: item.profile?.lastLoginGeoMeta?.networkProvider || null,
        ipClass: item.profile?.lastLoginGeoMeta?.ipClass || null,
        capturedAt: item.profile?.lastLoginGeo?.capturedAt || item.profile?.lastLoginAt || null,
      };
    })
    .filter(Boolean);

  return res.status(200).json({
    ok: true,
    analytics: {
      usersTotal: users.length,
      adminsTotal: users.filter((u) => u.role === "admin").length,
      modelsConfigured: modelConfigs.length,
      geolocations: geoCounts,
      geoPoints,
    },
  });
}
