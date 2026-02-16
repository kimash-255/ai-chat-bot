import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const publicRoutes = ["/login", "/register", "/forgot-password"];
  const scopedSections = ["dashboard", "welcome", "docs", "chat", "datasets", "tools", "models", "tags", "prompts", "settings"];

  function cleanPath(path) {
    return String(path || "").split("?")[0].split("#")[0] || "/";
  }

  function parseScopedPath(path) {
    const clean = cleanPath(path);
    const parts = clean.split("/").filter(Boolean);
    if (!parts.length) return { clean, isAdmin: false, userId: "", section: "" };
    if (parts[0] === "admin") return { clean, isAdmin: true, userId: "", section: parts[1] || "" };
    return { clean, isAdmin: false, userId: parts[0], section: parts[1] || "" };
  }

  function isScopedSection(section) {
    return scopedSections.includes(section);
  }

  function mapUnscopedToScoped(path, userId) {
    const clean = cleanPath(path);
    if (clean === "/" || clean === "") return `/${userId}/dashboard`;
    for (const section of scopedSections) {
      if (clean === `/${section}`) return `/${userId}/${section}`;
      if (clean.startsWith(`/${section}/`)) return `/${userId}${clean}`;
    }
    return `/${userId}/dashboard`;
  }

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        const data = await response.json();
        const isAuthed = Boolean(data?.ok);
        if (!mounted) return;

        setAuthed(isAuthed);
        setAuthChecked(true);

        const currentPath = cleanPath(router.asPath || router.pathname || "/");
        const scoped = parseScopedPath(currentPath);

        if (!isAuthed && !publicRoutes.includes(router.pathname)) {
          router.replace("/login");
        }
        if (isAuthed && publicRoutes.includes(router.pathname)) {
          const welcomePath = data?.user?.role === "admin" ? "/admin/welcome" : `/${data?.user?.id}/welcome`;
          router.replace(welcomePath);
          return;
        }

        if (!isAuthed) return;

        if (data?.user?.role === "admin") {
          const adminWelcomeDone = Boolean(data?.user?.profile?.welcomeCompletedAt);
          if (!adminWelcomeDone && !["welcome", "docs"].includes(scoped.section)) {
            router.replace("/admin/welcome");
            return;
          }
          if (scoped.clean === "/admin") {
            router.replace(adminWelcomeDone ? "/admin/dashboard" : "/admin/welcome");
            return;
          }
          if (!scoped.isAdmin) {
            router.replace(adminWelcomeDone ? "/admin/dashboard" : "/admin/welcome");
            return;
          }
          if (scoped.section && !isScopedSection(scoped.section)) {
            router.replace("/admin/dashboard");
          }
          return;
        }

        if (scoped.isAdmin) {
          const welcomeDone = Boolean(data?.user?.profile?.welcomeCompletedAt);
          router.replace(`/${data?.user?.id}/${welcomeDone ? "dashboard" : "welcome"}`);
          return;
        }

        if (scoped.userId && isScopedSection(scoped.section)) {
          if (scoped.userId !== String(data?.user?.id || "")) {
            const suffix = scoped.section ? `/${scoped.section}` : "";
            const rest = scoped.clean.split(`/${scoped.userId}${suffix}`)[1] || "";
            router.replace(`/${data?.user?.id}${suffix}${rest}`);
          }
          return;
        }

        const welcomeDone = Boolean(data?.user?.profile?.welcomeCompletedAt);
        if (!welcomeDone && !["welcome", "docs"].includes(scoped.section)) {
          router.replace(`/${data?.user?.id}/welcome`);
          return;
        }
        router.replace(mapUnscopedToScoped(currentPath, data?.user?.id));
      } catch {
        if (!mounted) return;
        setAuthChecked(true);
        if (!publicRoutes.includes(router.pathname)) router.replace("/login");
      }
    }

    checkAuth();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (!authChecked && !publicRoutes.includes(router.pathname)) {
    return <div className="min-h-screen glm-app" />;
  }

  return (
    <div suppressHydrationWarning>
      <Component {...pageProps} authed={authed} />
      <footer className="py-2 text-center text-xs text-[rgb(var(--glm-text-2))]">
        made by triotek systems ltd.
      </footer>
    </div>
  );
}
