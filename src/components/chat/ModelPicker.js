export default function ModelPicker({ value = "auto", options = [], onChange }) {
  const base = Array.isArray(options) ? options.filter(Boolean) : [];
  const withAuto = base.includes("auto") ? base : ["auto", ...base];
  const unique = [...new Set(withAuto)];
  const models = unique.includes(value) ? unique : [value, ...unique];

  return (
    <label className="inline-flex items-center gap-2 text-xs text-[rgb(var(--glm-text-2))]">
      Model
      <select
        className="glm-input py-1.5 text-xs"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {models.map((model) => (
          <option key={model} value={model}>{model}</option>
        ))}
      </select>
    </label>
  );
}
