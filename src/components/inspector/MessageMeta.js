export default function MessageMeta({ message }) {
  if (!message) return <p className="text-sm text-[rgb(var(--glm-text-2))]">No message selected.</p>;

  return (
    <div className="space-y-1 text-xs">
      <div><span className="text-[rgb(var(--glm-text-2))]">Role:</span> {message.role}</div>
      <div><span className="text-[rgb(var(--glm-text-2))]">Model:</span> {message.model || "auto"}</div>
      <div><span className="text-[rgb(var(--glm-text-2))]">Provider:</span> {message.provider || "n/a"}</div>
      <div><span className="text-[rgb(var(--glm-text-2))]">Tokens:</span> {message.usage?.totalTokens ?? 0}</div>
    </div>
  );
}
