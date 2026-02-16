export default function AttachmentTray({ attachments = [], onRemove }) {
  if (!attachments.length) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {attachments.map((file) => (
        <div key={file.id || file.name} className="inline-flex items-center gap-2 rounded-lg border border-[rgba(var(--glm-border),0.9)] px-2 py-1 text-xs">
          <span>{file.name}</span>
          <button className="text-[rgb(var(--glm-text-2))] hover:text-[rgb(var(--glm-text))]" onClick={() => onRemove?.(file.id || file.name)} type="button">
            x
          </button>
        </div>
      ))}
    </div>
  );
}
