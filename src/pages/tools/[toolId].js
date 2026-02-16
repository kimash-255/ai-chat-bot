import { useRouter } from "next/router";
import AppShell from "@/components/shell/AppShell";
import ToolDetail from "@/components/tools/ToolDetail";

export default function ToolDetailPage() {
  const router = useRouter();
  const toolId = String(router.query.toolId || "unknown");

  const tool = {
    id: toolId,
    name: `Tool ${toolId}`,
    description: "Tool detail comes from page-owned data.",
    schema: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
    },
  };

  const logs = [{ id: 1, timestamp: "2026-01-01T10:00:00.000Z", status: "ok", summary: "No runs yet" }];

  return (
    <AppShell title="Tool Detail" subtitle={toolId}>
      <ToolDetail tool={tool} logs={logs} onRun={() => {}} />
    </AppShell>
  );
}
