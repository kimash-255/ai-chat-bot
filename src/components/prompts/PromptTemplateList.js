export default function PromptTemplateList({ templates = [], onPick }) {
  return (
    <div className="space-y-2">
      {templates.map((template) => (
        <button key={template.id} className="w-full rounded-lg border border-[rgba(var(--glm-border),0.85)] p-3 text-left" onClick={() => onPick?.(template.id)} type="button">
          <p className="text-sm font-medium">{template.name}</p>
          <p className="text-xs text-[rgb(var(--glm-text-2))]">{template.description}</p>
        </button>
      ))}
    </div>
  );
}
