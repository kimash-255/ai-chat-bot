export default function DatasetSearchPanel({ value = "", onChange }) {
  return (
    <div className="glm-card p-3">
      <h3 className="mb-2 text-sm font-semibold">Search</h3>
      <input className="glm-input w-full" value={value} onChange={(e) => onChange?.(e.target.value)} placeholder="Find dataset" />
    </div>
  );
}
