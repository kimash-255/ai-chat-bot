export async function summarizeForLongMemory(messages = []) {
  if (!Array.isArray(messages) || messages.length === 0) return "";

  const text = messages
    .map((m) => `[${m.role}] ${m.content}`)
    .join("\n")
    .slice(0, 2000);

  return `Summary: ${text}`;
}
