export default function SessionListItem({ session, active, onClick }) {
  return (
    <button
      className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
        active
          ? "border-[rgba(var(--glm-purple),0.7)] bg-[rgba(var(--glm-purple),0.12)] shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
          : "border-[rgba(var(--glm-border),0.6)] hover:bg-black/5"
      }`}
      onClick={() => onClick?.(session.id)}
      type="button"
    >
      <div className="truncate text-sm font-medium">{session.title}</div>
      <div className="truncate text-xs text-[rgb(var(--glm-text-2))]">{session.preview}</div>
    </button>
  );
}
