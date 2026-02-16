import { getUplink } from "@/lib/uplink";
import { requireAuthenticatedUser } from "@/lib/auth-server";

export default async function handler(req, res) {
  const user = await requireAuthenticatedUser(req, res);
  if (!user) return;
  const userId = user.id;
  const uplinkId = String(req.query.uplinkId || "");

  if (!uplinkId) {
    return res.status(400).json({ ok: false, error: "uplinkId is required." });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const uplink = await getUplink(userId, uplinkId);
    if (!uplink) {
      return res.status(404).json({ ok: false, error: "Uplink not found." });
    }

    return res.status(200).json({
      ok: true,
      userId,
      uplink: {
        uplinkId: uplink.uplinkId,
        fileName: uplink.fileName,
        mimeType: uplink.mimeType,
        sizeBytes: uplink.sizeBytes,
        createdAt: uplink.createdAt,
        dataUrl: uplink.decrypted?.dataUrl || "",
        tags: uplink.decrypted?.tags || [],
      },
    });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error?.message || "Failed to read uplink." });
  }
}
