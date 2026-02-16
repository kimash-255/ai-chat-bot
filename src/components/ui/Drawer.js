export default function Drawer({ open, side = "right", onClose, children }) {
  if (!open) return null;

  const sideClass = side === "left" ? "left-0" : "right-0";

  return (
    <div className="fixed inset-0 z-40 bg-black/35 overflow-hidden" onClick={onClose}>
      <aside
        className={`absolute top-0 ${sideClass} h-full min-h-0 w-full max-w-md bg-[rgb(var(--glm-surface))] p-4 shadow-2xl overflow-auto glm-scroll`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </aside>
    </div>
  );
}
