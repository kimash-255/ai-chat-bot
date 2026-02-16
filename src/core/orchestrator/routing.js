function loadTagModelMap() {
  const raw = String(process.env.TAG_MODEL_MAP_JSON || "").trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function resolveModel({ model, tags = [] }) {
  const map = loadTagModelMap();
  if (model && model !== "auto") return model;

  for (const tag of tags) {
    if (map[tag]) return map[tag];
  }

  return "auto";
}
