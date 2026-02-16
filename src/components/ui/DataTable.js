export default function DataTable({ columns = [], rows = [] }) {
  return (
    <div className="overflow-auto glm-scroll rounded-xl border border-[rgba(var(--glm-border),0.85)]">
      <table className="min-w-full text-sm">
        <thead className="bg-[rgba(var(--glm-text),0.04)]">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-3 py-2 text-left font-semibold">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className="border-t border-[rgba(var(--glm-border),0.6)]">
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-2">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
