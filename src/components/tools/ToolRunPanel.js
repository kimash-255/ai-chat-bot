export default function ToolRunPanel({ onRun }) {
  return (
    <button className="glm-btn glm-btn--primary" type="button" onClick={() => onRun?.()}>
      Run Tool
    </button>
  );
}
