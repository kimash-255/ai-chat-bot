import TagBadge from "../tags/TagBadge";

const TAGS = [
  "chat",
  "refine_prompt",
  "summarize",
  "code",
  "embed",
  "classify",
  "translate",
  "multimodal",
  "knowledge_retrieval",
  "system_instruction",
  "tool_call",
];

export default function TagSelector({ selected = [], onChange }) {
  function toggle(tag) {
    const exists = selected.includes(tag);
    const next = exists ? selected.filter((t) => t !== tag) : [...selected, tag];
    onChange?.(next.length ? next : ["chat"]);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {TAGS.map((tag) => (
        <button key={tag} type="button" onClick={() => toggle(tag)} className="rounded-full">
          <TagBadge tag={tag} />
        </button>
      ))}
    </div>
  );
}
