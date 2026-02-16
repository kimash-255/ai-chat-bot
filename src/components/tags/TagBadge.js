const KNOWN = new Set([
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
]);

export default function TagBadge({ tag }) {
  const safeTag = KNOWN.has(tag) ? tag : "chat";
  return <span className={`glm-tag glm-tag--${safeTag}`}>{safeTag}</span>;
}
