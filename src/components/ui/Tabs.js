export default function Tabs({ tabs = [], value, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-auto">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              active
                ? "border-[rgb(var(--glm-purple))] bg-[rgba(var(--glm-purple),0.14)]"
                : "border-[rgba(var(--glm-border),0.85)] hover:bg-black/5"
            }`}
            onClick={() => onChange?.(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
