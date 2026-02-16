export default function Dialog({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="glm-glass w-full max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button className="glm-btn glm-btn--ghost" onClick={onClose} type="button">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
