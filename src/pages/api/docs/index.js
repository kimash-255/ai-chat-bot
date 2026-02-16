import fs from "fs";
import path from "path";
import { requireAuthenticatedUser } from "@/lib/auth-server";
import { startAccessLog } from "@/lib/access-log";

const ALLOWED_EXT = new Set([".md", ".pdf"]);

function walkFiles(dir, base, out) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(abs, base, out);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) continue;
    out.push(path.relative(base, abs).replace(/\\/g, "/"));
  }
}

function isAllowedForRole(relPath, role) {
  const clean = String(relPath || "").replace(/\\/g, "/");
  if (role === "admin") return true;
  if (clean.startsWith("admin/")) return false;
  if (clean.startsWith("backend/")) return false;
  if (clean.startsWith("devops/")) return false;
  return true;
}

export default async function handler(req, res) {
  startAccessLog(req, res, { route: "/api/docs/index", action: "docs_index" });
  const user = await requireAuthenticatedUser(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const root = path.join(process.cwd(), "docs");
    const all = [];
    walkFiles(root, root, all);
    const docs = all.filter((file) => isAllowedForRole(file, user.role)).map((file) => ({
      id: file,
      name: path.basename(file),
      path: file,
      ext: path.extname(file).toLowerCase(),
    }));
    return res.status(200).json({ ok: true, role: user.role, docs });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || "Failed to list docs." });
  }
}

