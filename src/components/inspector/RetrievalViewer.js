export default function RetrievalViewer({ sources = [] }) {
  return (
    <div className="space-y-2">
      {sources.length === 0 ? <p className="text-xs text-[rgb(var(--glm-text-2))]">No retrieval sources.</p> : null}
      {sources.map((src, i) => (
        <div key={src.id || i} className="rounded-lg border border-[rgba(var(--glm-border),0.85)] p-2 text-xs">
          <p className="font-medium">{src.title}</p>
          <p className="text-[rgb(var(--glm-text-2))]">Score: {src.score ?? "n/a"}</p>
        </div>
      ))}
    </div>
  );
}
