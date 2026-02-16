import { useRouter } from "next/router";
import DatasetDetailHeader from "@/components/datasets/DatasetDetailHeader";
import AppShell from "@/components/shell/AppShell";

export default function DatasetDetailPage() {
  const router = useRouter();
  const datasetId = String(router.query.datasetId || "unknown");

  const dataset = {
    id: datasetId,
    name: `Dataset ${datasetId}`,
    description: "Dataset detail view powered by page props.",
  };

  return (
    <AppShell title="Dataset Detail" subtitle={datasetId}>
      <DatasetDetailHeader dataset={dataset} />
    </AppShell>
  );
}
