import { useEffect, useRef } from "react";
import MessageCard from "./MessageCard";

export default function MessageList({ messages = [], activeMessageId, onSelectMessage }) {
  const listRef = useRef(null);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages]);

  return (
    <div ref={listRef} className="h-full overflow-auto glm-scroll scroll-smooth px-2 py-4 md:px-8">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        {!messages.length ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="rounded-2xl border border-[rgba(var(--glm-border),0.85)] bg-[rgba(var(--glm-surface),0.8)] px-5 py-4 text-center">
              <p className="text-sm font-medium">Start a new conversation</p>
              <p className="mt-1 text-xs text-[rgb(var(--glm-text-2))]">Use Enter to send and Shift+Enter for new lines.</p>
            </div>
          </div>
        ) : null}
        {messages.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            active={message.id === activeMessageId}
            onSelect={onSelectMessage}
          />
        ))}
      </div>
    </div>
  );
}
