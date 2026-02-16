export default function DatasetCard({ dataset, onOpen }) {
  return (
    <article className="glm-card p-3">
      <h3 className="text-sm font-semibold">{dataset.name}</h3>
      <p className="mt-1 text-xs text-[rgb(var(--glm-text-2))]">{dataset.description}</p>
      <button className="glm-btn mt-3" onClick={() => onOpen?.(dataset.id)} type="button">Open</button>
    </article>
  );
}
