import { useMemo, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "../ui/Icons";

export default function InspectorPanel({ message, responses = [], recommendedModel = "auto" }) {
  const [openModels, setOpenModels] = useState([]);

  const recommended = useMemo(
    () => responses.find((item) => item.model === recommendedModel) || responses[0],
    [recommendedModel, responses]
  );

  function toggleModel(model) {
    setOpenModels((prev) => (prev.includes(model) ? prev.filter((x) => x !== model) : [...prev, model]));
  }

  return (
    <aside className="h-full overflow-auto glm-scroll rounded-2xl border border-[rgba(var(--glm-border),0.9)] bg-[rgb(var(--glm-surface))] p-3 space-y-3">
      <section>
        <h3 className="mb-2 text-sm font-semibold">Best Response</h3>
        {recommended ? (
          <article className="rounded-xl border border-[rgba(var(--glm-teal),0.8)] bg-[rgba(var(--glm-teal),0.08)] p-3 shadow-[0_10px_26px_rgba(0,0,0,0.08)]">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold">{recommended.model}</p>
              <span className="rounded-full bg-[rgba(var(--glm-teal),0.16)] px-2 py-0.5 text-[10px] font-semibold">
                Recommended
              </span>
            </div>
            <p className="text-sm leading-7">{recommended.content}</p>
          </article>
        ) : (
          <p className="text-sm text-[rgb(var(--glm-text-2))]">No model responses yet.</p>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Alternative Drafts</h3>
        <div className="space-y-2">
          {responses.map((item) => {
            const open = openModels.includes(item.model);
            return (
              <article key={item.model} className="rounded-lg border border-[rgba(var(--glm-border),0.75)] p-2">
                <button
                  className="flex w-full items-center justify-between text-left"
                  onClick={() => toggleModel(item.model)}
                  type="button"
                >
                  <p className="text-xs font-semibold">{item.model}</p>
                  <span className="text-[rgb(var(--glm-text-2))]">
                    {open ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                  </span>
                </button>
                {open ? <p className="mt-2 text-sm leading-6">{item.content}</p> : null}
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Latest Assistant Turn</h3>
        {message ? (
          <div className="rounded-lg border border-[rgba(var(--glm-border),0.75)] p-2">
            <p className="text-xs text-[rgb(var(--glm-text-2))]">{message.model || "auto"}</p>
            <p className="mt-1 text-sm">{message.content}</p>
          </div>
        ) : (
          <p className="text-sm text-[rgb(var(--glm-text-2))]">No assistant message selected.</p>
        )}
      </section>
    </aside>
  );
}
