export default function RefinePromptDiff({ original = "", refined = "" }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-[rgba(var(--glm-border),0.85)] p-3 text-sm whitespace-pre-wrap">{original}</div>
      <div className="rounded-xl border border-[rgba(var(--glm-border),0.85)] p-3 text-sm whitespace-pre-wrap">{refined}</div>
    </div>
  );
}
