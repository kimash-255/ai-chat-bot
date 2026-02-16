export const INTEREST_OPTIONS = Object.freeze([
  "technology",
  "business",
  "finance",
  "education",
  "health",
  "sports",
  "music",
  "travel",
  "gaming",
  "art",
]);

export function normalizeInterests(input) {
  const source = Array.isArray(input)
    ? input
    : String(input || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  const allowed = new Set(INTEREST_OPTIONS);
  const clean = source
    .map((item) => String(item || "").trim().toLowerCase())
    .filter((item) => allowed.has(item));

  return [...new Set(clean)];
}
