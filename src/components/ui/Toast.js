export default function Toast({ message, tone = "info" }) {
  if (!message) return null;

  const toneClass =
    tone === "success"
      ? "bg-[rgba(var(--glm-success),0.2)]"
      : tone === "error"
        ? "bg-[rgba(var(--glm-danger),0.2)]"
        : "bg-[rgba(var(--glm-info),0.2)]";

  return <div className={`rounded-lg px-3 py-2 text-sm ${toneClass}`}>{message}</div>;
}
