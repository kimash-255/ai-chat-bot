export default function DatasetDetailHeader({ dataset }) {
  return (
    <header className="glm-card p-4">
      <h2 className="text-base font-semibold">{dataset.name}</h2>
      <p className="mt-1 text-sm text-[rgb(var(--glm-text-2))]">{dataset.description}</p>
    </header>
  );
}
