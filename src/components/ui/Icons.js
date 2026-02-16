export function IconButton({ title, onClick, children, className = "", ...props }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(var(--glm-border),0.8)] bg-[rgb(var(--glm-surface))] hover:bg-black/5 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

export function BellIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M15 18H5l2-2v-5a5 5 0 1 1 10 0v5l2 2h-4" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function MessageIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-7a8 8 0 1 1 18-4Z" />
    </svg>
  );
}

export function ChevronDoubleRightIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m7 6 6 6-6 6" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function ChevronDoubleLeftIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m17 6-6 6 6 6" />
      <path d="m11 6-6 6 6 6" />
    </svg>
  );
}

export function ChevronDoubleUpIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m6 17 6-6 6 6" />
      <path d="m6 11 6-6 6 6" />
    </svg>
  );
}

export function ChevronDoubleDownIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m6 7 6 6 6-6" />
      <path d="m6 13 6 6 6-6" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ChevronUpIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

export function CloseIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m18 6-12 12" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function FullscreenIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M8 3H3v5" />
      <path d="M16 3h5v5" />
      <path d="M21 16v5h-5" />
      <path d="M3 16v5h5" />
    </svg>
  );
}

export function ExitFullscreenIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M8 8H3V3" />
      <path d="M16 8h5V3" />
      <path d="M16 16h5v5" />
      <path d="M8 16H3v5" />
      <path d="M9 9 3 3" />
      <path d="M15 9 21 3" />
      <path d="m9 15-6 6" />
      <path d="m15 15 6 6" />
    </svg>
  );
}
