export default function ToolTraceViewer({ traces = [] }) {
  return (
    <div className="space-y-2">
      {traces.length === 0 ? <p className="text-xs text-[rgb(var(--glm-text-2))]">No tool calls.</p> : null}
      {traces.map((trace, i) => (
        <div key={trace.id || i} className="rounded-lg border border-[rgba(var(--glm-border),0.85)] p-2 text-xs">
          <p className="font-medium">{trace.name}</p>
          <p className="text-[rgb(var(--glm-text-2))]">{trace.status}</p>
        </div>
      ))}
    </div>
  );
}
