import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import AppShell from "@/components/shell/AppShell";

function scopedPath(router, path) {
  const normalized = String(path || "").startsWith("/") ? String(path) : `/${path}`;
  const clean = String(router.asPath || "").split("?")[0].split("#")[0];
  if (clean === "/admin" || clean.startsWith("/admin/")) {
    return normalized.startsWith("/admin") ? normalized : `/admin${normalized}`;
  }
  const match = clean.match(/^\/([^/]+)\/(dashboard|welcome|docs|chat|datasets|tools|models|tags|prompts|settings)(\/.*)?$/);
  if (match?.[1]) return normalized.startsWith(`/${match[1]}`) ? normalized : `/${match[1]}${normalized}`;
  return normalized;
}

export default function WelcomePage() {
  const router = useRouter();
  const [status, setStatus] = useState({ role: "user", completed: false, docsVisitedAt: null });
  const [loading, setLoading] = useState(false);

  const checklist = useMemo(() => {
    const base = [
      { id: "profile", label: "Profile and security are available" },
      { id: "docs", label: "Read docs and operational guidance", done: Boolean(status.docsVisitedAt) },
      { id: "chat", label: "Start your first chat session" },
    ];
    if (status.role === "admin") {
      return [
        ...base,
        { id: "admin_models", label: "Configure model providers in admin dashboard" },
        { id: "admin_sandbox", label: "Run a sandbox test from admin tools" },
      ];
    }
    return base;
  }, [status.docsVisitedAt, status.role]);

  useEffect(() => {
    fetch("/api/user/welcome")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.ok) return;
        setStatus({
          role: data.role || "user",
          completed: Boolean(data.completed),
          docsVisitedAt: data.docsVisitedAt || null,
        });
      })
      .catch(() => {});
  }, []);

  async function completeWelcome() {
    setLoading(true);
    try {
      const response = await fetch("/api/user/welcome", { method: "POST" });
      const data = await response.json();
      if (!data?.ok) return;
      setStatus((prev) => ({ ...prev, completed: true }));
      router.push(scopedPath(router, "/dashboard"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Welcome" subtitle={status.role === "admin" ? "Admin onboarding" : "User onboarding"}>
      <div className="mx-auto w-full max-w-3xl space-y-3">
        <section className="glm-card p-4">
          <h2 className="text-base font-semibold">Getting Started</h2>
          <p className="mt-1 text-sm text-[rgb(var(--glm-text-2))]">
            Complete this setup once to unlock your dashboard and full workspace.
          </p>
          <div className="mt-3 space-y-2">
            {checklist.map((item) => (
              <div key={item.id} className="rounded-lg border border-[rgba(var(--glm-border),0.8)] px-3 py-2 text-sm">
                <span className={item.done ? "text-[rgb(var(--glm-success))]" : ""}>{item.done ? "Done" : "Pending"}</span>{" "}
                {item.label}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="glm-btn" type="button" onClick={() => router.push(scopedPath(router, "/docs"))}>
              Open Docs
            </button>
            <button className="glm-btn glm-btn--primary" type="button" disabled={loading} onClick={completeWelcome}>
              {loading ? "Saving..." : "Finish Welcome"}
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

