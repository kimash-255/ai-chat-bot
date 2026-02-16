export function validateOutput(modelResult) {
  const content = String(modelResult?.content || "").trim();

  if (!content) {
    throw new Error("Model returned empty content.");
  }

  return {
    content,
    usage: modelResult.usage || { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    provider: modelResult.provider || "unknown",
    model: modelResult.model || "unknown",
  };
}
