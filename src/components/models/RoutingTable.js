import DataTable from "../ui/DataTable";

export default function RoutingTable({ rows = [] }) {
  return <DataTable columns={[{ key: "tag", label: "Tag" }, { key: "model", label: "Model" }]} rows={rows} />;
}
