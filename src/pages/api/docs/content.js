import fs from "fs";
import path from "path";
import { getUserById, saveUser } from "@/core/auth/store";
import { requireAuthenticatedUser } from "@/lib/auth-server";
import { startAccessLog } from "@/lib/access-log";

function normalizeRel(input) {
  return String(input || "").replace(/\\/g, "/").replace(/^\/+/, "");
}

function isAllowedForRole(relPath, role) {
  if (role === "admin") return true;
  if (relPath.startsWith("admin/")) return false;
  if (relPath.startsWith("backend/")) return false;
  if (relPath.startsWith("devops/")) return false;
  return true;
}

export default async function handler(req, res) {
  startAccessLog(req, res, { route: "/api/docs/content", action: "docs_content" });
  const user = await requireAuthenticatedUser(req, res);
  if (!user) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const rel = normalizeRel(req.query.path);
  if (!rel) return res.status(400).json({ ok: false, error: "path is required." });
  if (!isAllowedForRole(rel, user.role)) return res.status(403).json({ ok: false, error: "Access denied." });

  const root = path.join(process.cwd(), "docs");
  const abs = path.join(root, rel);
  const rootResolved = path.resolve(root);
  const absResolved = path.resolve(abs);
  if (!absResolved.startsWith(rootResolved)) {
    return res.status(400).json({ ok: false, error: "Invalid path." });
  }

  if (!fs.existsSync(absResolved)) {
    return res.status(404).json({ ok: false, error: "Doc not found." });
  }

  const ext = path.extname(absResolved).toLowerCase();
  if (ext === ".md") {
    const content = fs.readFileSync(absResolved, "utf8");
    const current = await getUserById(user.id);
    if (current) {
      await saveUser({
        ...current,
        profile: { ...(current.profile || {}), docsVisitedAt: new Date().toISOString() },
      });
    }
    return res.status(200).json({ ok: true, type: "markdown", path: rel, content });
  }

  if (ext === ".pdf") {
    const base64 = fs.readFileSync(absResolved).toString("base64");
    return res.status(200).json({
      ok: true,
      type: "pdf",
      path: rel,
      content: `data:application/pdf;base64,${base64}`,
    });
  }

  return res.status(400).json({ ok: false, error: "Unsupported file type." });
}

