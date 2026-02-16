import { useState } from "react";

export default function TagEditor({ value = "", onSave }) {
  const [tag, setTag] = useState(value);

  return (
    <div className="space-y-2">
      <input className="glm-input w-full" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="new_tag" />
      <button className="glm-btn glm-btn--primary" onClick={() => onSave?.(tag.trim())} type="button">
        Save Tag
      </button>
    </div>
  );
}
