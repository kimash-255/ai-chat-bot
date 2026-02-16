import { useState } from "react";
import { useRouter } from "next/router";
import DatasetExportPanel from "@/components/datasets/DatasetExportPanel";
import DatasetGrid from "@/components/datasets/DatasetGrid";
import DatasetSearchPanel from "@/components/datasets/DatasetSearchPanel";
import DatasetUpload from "@/components/datasets/DatasetUpload";
import AppShell from "@/components/shell/AppShell";

const DATASETS = [
  { id: "d-1", name: "Product Docs", description: "Docs for tool and model usage" },
  { id: "d-2", name: "Support Tickets", description: "Historic support conversations" },
];

export default function DatasetsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = DATASETS.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <AppShell title="Datasets" subtitle="Library and imports">
      <div className="grid h-full gap-3 grid-cols-[320px_1fr]">
        <div className="space-y-3">
          <DatasetSearchPanel value={query} onChange={setQuery} />
          <DatasetUpload onUpload={() => {}} />
          <DatasetExportPanel onExport={() => {}} />
        </div>
        <DatasetGrid datasets={filtered} onOpen={(id) => router.push(`/datasets/${id}`)} />
      </div>
    </AppShell>
  );
}
