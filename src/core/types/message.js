export const MESSAGE_ROLES = ["system", "user", "assistant", "tool"];

export function isValidRole(role) {
  return MESSAGE_ROLES.includes(role);
}

export function createMessage({ role, content, meta = {} }) {
  if (!isValidRole(role)) {
    throw new Error(`Invalid message role: ${role}`);
  }

  const normalizedContent = typeof content === "string" ? content.trim() : "";
  if (!normalizedContent) {
    throw new Error("Message content must be a non-empty string.");
  }

  return {
    id: meta.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    role,
    content: normalizedContent,
    createdAt: new Date().toISOString(),
    meta,
  };
}
