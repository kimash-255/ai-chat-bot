import TagBadge from "../tags/TagBadge";

function formatMessageTime(createdAt) {
  if (typeof createdAt !== "string" || createdAt.length < 16) return "";
  return createdAt.slice(11, 16);
}

export default function MessageCard({ message, active, onSelect }) {
  const isAssistant = message.role === "assistant";
  const isUser = message.role === "user";
  const roleLabel = isUser ? "You" : isAssistant ? "Assistant" : message.role;
  const modelLabel = isAssistant ? message.model || "assistant" : "";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <div className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[rgba(var(--glm-border),0.9)] bg-[rgb(var(--glm-surface-2))] text-[10px] font-semibold text-[rgb(var(--glm-text-2))] md:inline-flex">
          AI
        </div>
      ) : null}
      <article
        className={`max-w-[88%] rounded-2xl border px-3 py-2.5 transition cursor-pointer ${
          active
            ? "border-[rgba(var(--glm-purple),0.82)] shadow-[0_10px_30px_rgba(0,0,0,0.10)]"
            : "border-[rgba(var(--glm-border),0.8)]"
        } ${
          isUser
            ? "bg-[linear-gradient(130deg,rgba(var(--glm-purple),0.24),rgba(var(--glm-magenta),0.14))]"
            : isAssistant
              ? "bg-[rgba(var(--glm-surface),0.98)]"
              : "bg-[rgba(var(--glm-text),0.02)]"
        }`}
        onClick={() => onSelect?.(message.id)}
      >
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className={`font-semibold ${isUser ? "text-[rgb(var(--glm-purple))]" : "text-[rgb(var(--glm-text-2))]"}`}>
            {roleLabel}
          </span>
          <span className="font-mono text-[rgb(var(--glm-text-2))]">{formatMessageTime(message.createdAt)}</span>
        </div>

        <p className="whitespace-pre-wrap text-[14px] leading-6">{message.content}</p>

        {message.tags?.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5 opacity-90">
            {message.tags.map((tag) => (
              <TagBadge key={`${message.id}-${tag}`} tag={tag} />
            ))}
          </div>
        ) : null}

        {modelLabel ? (
          <div className="mt-2 text-[11px] text-[rgb(var(--glm-text-2))]">
            via {modelLabel}
          </div>
        ) : null}
      </article>
      {isUser ? (
        <div className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[rgba(var(--glm-border),0.9)] bg-[rgb(var(--glm-surface-2))] text-[10px] font-semibold text-[rgb(var(--glm-text-2))] md:inline-flex">
          You
        </div>
      ) : null}
    </div>
  );
}
