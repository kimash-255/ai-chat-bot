export default function Card({ title, subtitle, actions, className = "", children }) {
  return (
    <section className={`glm-card p-4 ${className}`.trim()}>
      {(title || subtitle || actions) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title ? <h3 className="text-sm font-semibold">{title}</h3> : null}
            {subtitle ? <p className="text-xs text-[rgb(var(--glm-text-2))] mt-1">{subtitle}</p> : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}
