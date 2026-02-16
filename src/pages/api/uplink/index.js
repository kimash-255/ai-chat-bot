import { registerUplink } from "@/lib/uplink";
import { requireAuthenticatedUser } from "@/lib/auth-server";

export default async function handler(req, res) {
  const user = await requireAuthenticatedUser(req, res);
  if (!user) return;
  const userId = user.id;

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { fileName, mimeType, sizeBytes, tags, dataUrl } = req.body || {};
    const uplink = await registerUplink({
      userId,
      fileName,
      mimeType,
      sizeBytes,
      tags,
      dataUrl,
    });

    return res.status(200).json({
      ok: true,
      userId,
      uplink: {
        uplinkId: uplink.uplinkId,
        fileName: uplink.fileName,
        mimeType: uplink.mimeType,
        sizeBytes: uplink.sizeBytes,
        createdAt: uplink.createdAt,
      },
    });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error?.message || "Failed to register uplink." });
  }
}
