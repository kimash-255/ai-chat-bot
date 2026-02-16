import { DEFAULT_MODEL, normalizeModelChoice } from "../types/model";

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return ["chat"];
  const clean = tags.map((tag) => String(tag || "").trim()).filter(Boolean);
  return clean.length ? clean : ["chat"];
}

export function validateAndNormalizeInput(payload = {}) {
  const sessionId = String(payload.sessionId || `session_${Date.now()}`).trim();
  const message = String(payload.message || "").trim();
  const tags = normalizeTags(payload.tags);
  const model = normalizeModelChoice(payload.model || DEFAULT_MODEL);
  const history = Array.isArray(payload.history) ? payload.history : [];

  if (!message) {
    throw new Error("`message` is required.");
  }

  return {
    sessionId,
    message,
    tags,
    model,
    history,
    options: {
      temperature: Number.isFinite(payload.temperature) ? payload.temperature : 0.2,
      maxTokens: Number.isFinite(payload.maxTokens) ? payload.maxTokens : 500,
    },
  };
}
