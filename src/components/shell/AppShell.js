import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import CommandPalette from "./CommandPalette";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { ChevronDoubleRightIcon, ExitFullscreenIcon, FullscreenIcon, IconButton } from "../ui/Icons";

export default function AppShell({
  title,
  subtitle,
  sessions = [],
  activeSessionId,
  onNewChat,
  onSelectSession,
  children,
  topbarRight,
  showSidebar = true,
  onToggleSidebar,
}) {
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

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
    if (scopePrefix === "/admin") {
      if (normalized.startsWith("/admin")) return normalized;
      return `/admin${normalized}`;
    }
    if (normalized.startsWith(scopePrefix)) return normalized;
    return `${scopePrefix}${normalized}`;
  }

  async function toggleFullscreen() {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      return;
    }
    await document.exitFullscreen();
    setIsFullscreen(false);
  }

  const right = useMemo(
    () => (
      <>
        {topbarRight}
        <button
          className="glm-btn glm-btn--ghost"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
          }}
          type="button"
        >
          Logout
        </button>
        <button className="glm-btn glm-btn--ghost" onClick={() => setPaletteOpen(true)} type="button">
          Cmd+K
        </button>
        <IconButton title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} onClick={toggleFullscreen}>
          {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
        </IconButton>
      </>
    ),
    [isFullscreen, router, topbarRight]
  );

  return (
    <div className="h-full min-h-0 glm-app text-[rgb(var(--glm-text))] overflow-hidden">
      <div className="mx-auto max-w-[1700px] p-3 h-full min-h-0" style={{ height: "calc(100dvh - 18px - env(safe-area-inset-bottom, 0px))" }}>
        <div className="glm-card h-full overflow-hidden p-0">
          <div className={`grid h-full min-h-0 ${showSidebar ? "grid-cols-[290px_1fr]" : "grid-cols-1"}`}>
            {showSidebar ? (
              <Sidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onNewChat={onNewChat}
                onSelectSession={onSelectSession}
                onNavigate={(path) => router.push(toScopedPath(path))}
                onToggleSidebar={onToggleSidebar}
              />
            ) : null}

            <div className="min-w-0 min-h-0 relative overflow-hidden">
              <Topbar title={title} subtitle={subtitle} right={right} />
              {!showSidebar && onToggleSidebar ? (
                <div className="absolute left-3 top-3 z-20">
                  <IconButton title="Open Sidebar" onClick={onToggleSidebar}>
                    <ChevronDoubleRightIcon />
                  </IconButton>
                </div>
              ) : null}
              <main className="h-[calc(100%-64px)] min-h-0 overflow-auto glm-scroll p-3">{children}</main>
            </div>
          </div>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
