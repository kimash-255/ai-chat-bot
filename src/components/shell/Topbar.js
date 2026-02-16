export default function Topbar({ title, subtitle, right }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[rgba(var(--glm-border),0.9)] bg-[rgba(var(--glm-surface),0.92)] px-4 backdrop-blur-md">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="truncate text-xs text-[rgb(var(--glm-text-2))]">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </header>
  );
}
