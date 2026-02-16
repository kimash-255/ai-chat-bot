export default function DatasetExportPanel({ onExport }) {
  return (
    <div className="glm-card p-3">
      <h3 className="text-sm font-semibold">Export</h3>
      <button className="glm-btn mt-3" onClick={() => onExport?.()} type="button">Export CSV</button>
    </div>
  );
}
