export default function RetryControls({ onRetry }) {
  return (
    <button className="glm-btn glm-btn--ghost px-3 py-1.5" onClick={() => onRetry?.()} type="button">
      Retry Last Message
    </button>
  );
}
