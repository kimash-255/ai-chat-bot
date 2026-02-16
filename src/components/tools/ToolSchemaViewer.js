export default function ToolSchemaViewer({ schema }) {
  return (
    <pre className="rounded-xl border border-[rgba(var(--glm-border),0.85)] bg-[rgba(var(--glm-text),0.03)] p-3 text-xs overflow-auto">
      {JSON.stringify(schema || {}, null, 2)}
    </pre>
  );
}
