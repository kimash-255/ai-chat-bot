export default function ToolCard({ tool, onOpen }) {
  return (
    <article className="glm-card p-3">
      <h3 className="text-sm font-semibold">{tool.name}</h3>
      <p className="mt-1 text-xs text-[rgb(var(--glm-text-2))]">{tool.description}</p>
      <button className="glm-btn mt-3" type="button" onClick={() => onOpen?.(tool.id)}>Open</button>
    </article>
  );
}
