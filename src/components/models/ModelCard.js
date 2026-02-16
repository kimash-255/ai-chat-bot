export default function ModelCard({ model }) {
  return (
    <article className="glm-card p-3">
      <h3 className="text-sm font-semibold">{model.name}</h3>
      <p className="text-xs text-[rgb(var(--glm-text-2))]">{model.provider}</p>
    </article>
  );
}
