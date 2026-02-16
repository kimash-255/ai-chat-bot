import ToolLogsTable from "./ToolLogsTable";
import ToolRunPanel from "./ToolRunPanel";
import ToolSchemaViewer from "./ToolSchemaViewer";

export default function ToolDetail({ tool, logs = [], onRun }) {
  return (
    <div className="space-y-3">
      <section className="glm-card p-3">
        <h2 className="text-base font-semibold">{tool.name}</h2>
        <p className="mt-1 text-sm text-[rgb(var(--glm-text-2))]">{tool.description}</p>
      </section>
      <section className="glm-card p-3">
        <h3 className="mb-2 text-sm font-semibold">Schema</h3>
        <ToolSchemaViewer schema={tool.schema} />
      </section>
      <section className="glm-card p-3 space-y-3">
        <ToolRunPanel onRun={onRun} />
        <ToolLogsTable logs={logs} />
      </section>
    </div>
  );
}
