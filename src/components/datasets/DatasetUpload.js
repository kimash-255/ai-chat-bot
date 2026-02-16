export default function DatasetUpload({ onUpload }) {
  return (
    <div className="glm-card p-3">
      <h3 className="text-sm font-semibold">Upload Dataset</h3>
      <button className="glm-btn glm-btn--primary mt-3" onClick={() => onUpload?.()} type="button">Upload</button>
    </div>
  );
}
