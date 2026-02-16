export default function TypingIndicator({ visible }) {
  if (!visible) return null;

  return (
    <div className="px-3 pb-2 text-xs text-[rgb(var(--glm-text-2))]">
      Assistant typing...
    </div>
  );
}
