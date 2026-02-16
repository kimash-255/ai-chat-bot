import { useMemo, useState } from "react";
import { useRouter } from "next/router";

const COMMANDS = [
  { label: "Go to Dashboard", path: "/dashboard" },
  { label: "Go to Welcome", path: "/welcome" },
  { label: "Go to Docs", path: "/docs" },
  { label: "Go to Chat", path: "/chat" },
  { label: "Go to Datasets", path: "/datasets" },
  { label: "Go to Tools", path: "/tools" },
  { label: "Go to Models", path: "/models" },
  { label: "Go to Tags", path: "/tags" },
  { label: "Go to Prompts", path: "/prompts" },
  { label: "Go to Settings", path: "/settings" },
];

export default function CommandPalette({ open, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function getScopePrefix() {
    const clean = String(router.asPath || "").split("?")[0].split("#")[0];
    if (clean === "/admin" || clean.startsWith("/admin/")) return "/admin";
    const match = clean.match(/^\/([^/]+)\/(dashboard|welcome|docs|chat|datasets|tools|models|tags|prompts|settings)(\/.*)?$/);
    if (match?.[1]) return `/${match[1]}`;
    return "";
  }

  function toScopedPath(path) {
    const normalized = String(path || "").startsWith("/") ? String(path) : `/${path}`;
    const scopePrefix = getScopePrefix();
    if (!scopePrefix) return normalized;
    if (scopePrefix === "/admin") return normalized.startsWith("/admin") ? normalized : `/admin${normalized}`;
    return normalized.startsWith(scopePrefix) ? normalized : `${scopePrefix}${normalized}`;
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter((cmd) => cmd.label.toLowerCase().includes(q));
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/40 p-4" onClick={onClose}>
      <div className="mx-auto mt-[12vh] w-full max-w-xl glm-card p-3" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          className="glm-input w-full"
          placeholder="Type a command"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="mt-3 space-y-1">
          {filtered.map((cmd) => (
            <button
              key={cmd.path}
              className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-black/5"
              onClick={() => {
                router.push(toScopedPath(cmd.path));
                onClose?.();
              }}
              type="button"
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
