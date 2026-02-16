export const DEFAULT_MODEL = "auto";
export const SUPPORTED_PROVIDER_PREFIXES = ["huggingface:", "groq:", "google:"];

export function normalizeModelChoice(model) {
  if (!model) return DEFAULT_MODEL;
  if (model === "auto") return model;
  if (String(model).endsWith(":configured")) return model;
  if (SUPPORTED_PROVIDER_PREFIXES.some((prefix) => String(model).startsWith(prefix))) return model;
  return DEFAULT_MODEL;
}
