import { createUserDataset, listUserDatasets } from "@/core/datasets/service";
import { requireAuthenticatedUser } from "@/lib/auth-server";

export default async function handler(req, res) {
  const user = await requireAuthenticatedUser(req, res);
  if (!user) return;

  if (req.method === "GET") {
    return res.status(200).json({ ok: true, datasets: listUserDatasets(user.id) });
  }

  if (req.method === "POST") {
    const created = createUserDataset(user.id, req.body || {});
    return res.status(200).json({ ok: true, dataset: created });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ ok: false, error: "Method Not Allowed" });
}
