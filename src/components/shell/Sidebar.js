import { useMemo, useState } from "react";
import { ChevronDoubleLeftIcon, IconButton } from "../ui/Icons";

export default function Sidebar({
  sessions = [],
  activeSessionId,
  onNewChat,
  onSelectSession,
  onNavigate,
  onToggleSidebar,
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => (s.title || "").toLowerCase().includes(q));
  }, [query, sessions]);

  return (
    <aside className="h-full min-h-0 border-r border-[rgba(var(--glm-border),0.9)] bg-[rgb(var(--glm-surface))] p-3 grid grid-rows-[auto_auto_auto_1fr] gap-y-0 overflow-hidden">
      <div className="flex items-center gap-2">
        <button className="glm-btn glm-btn--primary w-full" onClick={onNewChat} type="button">
          New Session
        </button>
        {onToggleSidebar ? (
          <IconButton title="Close Sidebar" onClick={onToggleSidebar}>
            <ChevronDoubleLeftIcon />
          </IconButton>
        ) : null}
      </div>

      <input
        className="glm-input mt-3 w-full"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search sessions..."
      />

      <nav className="mt-4 space-y-1 rounded-xl border border-[rgba(var(--glm-border),0.75)] bg-[rgba(var(--glm-surface-2),0.55)] p-2">
        {[
          ["/dashboard", "Dashboard"],
          ["/welcome", "Welcome"],
          ["/docs", "Docs"],
          ["/chat", "Chat"],
          ["/datasets", "Datasets"],
          ["/tools", "Tools"],
          ["/models", "Models"],
          ["/tags", "Tags"],
          ["/prompts", "Prompts"],
          ["/settings", "Settings"],
        ].map(([path, label]) => (
          <button key={path} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-black/5" onClick={() => onNavigate?.(path)} type="button">
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-4 min-h-0 overflow-hidden">
      <p className="px-1 text-xs font-semibold text-[rgb(var(--glm-text-2))]">Sessions</p>
      <div className="mt-2 h-full min-h-0 space-y-1 overflow-auto glm-scroll pr-1">
        {filtered.map((session) => {
          const active = session.id === activeSessionId;
          return (
            <button
              key={session.id}
              className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                active
                  ? "border-[rgba(var(--glm-purple),0.7)] bg-[rgba(var(--glm-purple),0.12)]"
                  : "border-transparent hover:bg-black/5"
              }`}
              onClick={() => onSelectSession?.(session.id)}
              type="button"
            >
              <div className="truncate text-sm font-medium">{session.title}</div>
              <div className="truncate text-xs text-[rgb(var(--glm-text-2))]">{session.preview}</div>
            </button>
          );
        })}
      </div>
      </div>
    </aside>
  );
}
