import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/shell/AppShell";

export default function DocsPage() {
  const [role, setRole] = useState("user");
  const [docs, setDocs] = useState([]);
  const [activePath, setActivePath] = useState("");
  const [activeDoc, setActiveDoc] = useState(null);

  const grouped = useMemo(() => {
    const map = new Map();
    docs.forEach((doc) => {
      const section = String(doc.path || "").split("/")[0] || "general";
      if (!map.has(section)) map.set(section, []);
      map.get(section).push(doc);
    });
    return [...map.entries()];
  }, [docs]);

  useEffect(() => {
    fetch("/api/docs/index")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.ok) return;
        setRole(data.role || "user");
        const list = Array.isArray(data.docs) ? data.docs : [];
        setDocs(list);
        if (list.length) setActivePath(list[0].path);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!activePath) {
      setActiveDoc(null);
      return;
    }
    const params = new URLSearchParams({ path: activePath });
    fetch(`/api/docs/content?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data?.ok) return;
        setActiveDoc(data);
      })
      .catch(() => {});
  }, [activePath]);

  return (
    <AppShell title="Docs" subtitle={role === "admin" ? "Admin documentation" : "User documentation"}>
      <div className="grid h-full min-h-0 gap-3 md:grid-cols-[280px_1fr]">
        <aside className="glm-card min-h-0 overflow-auto glm-scroll p-3">
          {grouped.map(([section, items]) => (
            <div key={section} className="mb-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--glm-text-2))]">{section}</p>
              <div className="space-y-1">
                {items.map((doc) => (
                  <button
                    key={doc.path}
                    type="button"
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${
                      activePath === doc.path ? "bg-[rgba(var(--glm-purple),0.15)]" : "hover:bg-black/5"
                    }`}
                    onClick={() => setActivePath(doc.path)}
                  >
                    {doc.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <section className="glm-card min-h-0 overflow-auto glm-scroll p-4">
          {!activeDoc ? <p className="text-sm text-[rgb(var(--glm-text-2))]">Select a document.</p> : null}
          {activeDoc?.type === "markdown" ? (
            <pre className="whitespace-pre-wrap text-sm leading-6">{activeDoc.content}</pre>
          ) : null}
          {activeDoc?.type === "pdf" ? (
            <iframe title={activeDoc.path} src={activeDoc.content} className="h-[72vh] w-full rounded-lg border border-[rgba(var(--glm-border),0.8)]" />
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}

