export function createId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function getRequestUserId(req, fallback = "local-user") {
  const headerUser = req?.headers?.["x-user-id"];
  if (typeof headerUser === "string" && headerUser.trim()) return headerUser.trim();

  const bodyUser = req?.body?.userId;
  if (typeof bodyUser === "string" && bodyUser.trim()) return bodyUser.trim();

  const queryUser = req?.query?.userId;
  if (typeof queryUser === "string" && queryUser.trim()) return queryUser.trim();

  return fallback;
}
