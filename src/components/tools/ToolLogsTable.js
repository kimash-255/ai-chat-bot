import DataTable from "../ui/DataTable";

export default function ToolLogsTable({ logs = [] }) {
  return (
    <DataTable
      columns={[
        { key: "timestamp", label: "Timestamp" },
        { key: "status", label: "Status" },
        { key: "summary", label: "Summary" },
      ]}
      rows={logs}
    />
  );
}
