import DataTable from "../ui/DataTable";

export default function TagRulesEditor({ rules = [] }) {
  const columns = [
    { key: "tag", label: "Tag" },
    { key: "priority", label: "Priority" },
    { key: "model", label: "Model" },
  ];

  return <DataTable columns={columns} rows={rules} />;
}
