import { createEncryptedDumpVersion, listDumpsForUser } from "@/core/datasets/service";
import { requireAuthenticatedUser } from "@/lib/auth-server";

export default async function handler(req, res) {
  const user = await requireAuthenticatedUser(req, res);
  if (!user) return;

  if (req.method === "GET") {
    const dumps = listDumpsForUser({ userId: user.id, role: user.role });
    return res.status(200).json({ ok: true, dumps });
  }

  if (req.method === "POST") {
    const dump = createEncryptedDumpVersion({ userId: user.id, actorRole: user.role });
    return res.status(200).json({ ok: true, dump });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ ok: false, error: "Method Not Allowed" });
}
