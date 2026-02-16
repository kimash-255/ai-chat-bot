import { useRouter } from "next/router";
import AppShell from "@/components/shell/AppShell";
import ToolList from "@/components/tools/ToolList";

const TOOLS = [
  { id: "t-1", name: "Web Search", description: "Fetch external references" },
  { id: "t-2", name: "Calculator", description: "Deterministic math operations" },
];

export default function ToolsPage() {
  const router = useRouter();

  return (
    <AppShell title="Tools" subtitle="Registry">
      <ToolList tools={TOOLS} onOpen={(id) => router.push(`/tools/${id}`)} />
    </AppShell>
  );
}
