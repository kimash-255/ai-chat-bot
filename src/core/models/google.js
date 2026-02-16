function readApiKey(providerConfig) {
  const envRef = String(providerConfig?.api_key_ref || "").trim();
  if (envRef && process.env[envRef]) return process.env[envRef];
  if (process.env.GOOGLE_AI_STUDIO_API_KEY) return process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  return "";
}

function modelFromInput(model, providerConfig) {
  const raw = String(model || "");
  if (raw && raw.startsWith("google:")) return raw.slice("google:".length);
  if (providerConfig?.default_model) return String(providerConfig.default_model);
  if (process.env.GOOGLE_AI_DEFAULT_MODEL) return String(process.env.GOOGLE_AI_DEFAULT_MODEL);
  return "";
}

function normalizePrompt(messages = []) {
  const text = messages
    .map((item) => String(item?.content || "").trim())
    .filter(Boolean)
    .join("\n");
  return text || "Hello";
}

function endpointForGenerate(base, modelId, apiKey) {
  const root = String(base || "https://generativelanguage.googleapis.com/v1beta/models").replace(/\/$/, "");
  return `${root}/${modelId}:generateContent?key=${encodeURIComponent(apiKey)}`;
}

function endpointForEmbed(base, modelId, apiKey) {
  const root = String(base || "https://generativelanguage.googleapis.com/v1beta/models").replace(/\/$/, "");
  return `${root}/${modelId}:embedContent?key=${encodeURIComponent(apiKey)}`;
}

export async function callGoogleModel({
  model = "google:configured",
  messages,
  context = {},
  providerConfig,
}) {
  const apiKey = readApiKey(providerConfig);
  if (!apiKey) throw new Error("Google AI Studio key missing. Set GOOGLE_AI_STUDIO_API_KEY/GEMINI_API_KEY or env ref.");
  const modelId = modelFromInput(model, providerConfig);
  if (!modelId) throw new Error("Google model not configured. Set default_model or pass google:<model>.");

  const tags = Array.isArray(context?.tags) ? context.tags : [];
  const prompt = normalizePrompt(messages);
  const isEmbedding = tags.includes("embed") || tags.includes("knowledge_retrieval");

  if (isEmbedding) {
    const response = await fetch(endpointForEmbed(providerConfig?.endpoint_url, modelId, apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: {
          parts: [{ text: prompt }],
        },
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || `Google embed request failed (${response.status}).`);
    }
    return {
      content: JSON.stringify({ type: "embedding", output: data }),
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      provider: "google",
      model: `google:${modelId}`,
    };
  }

  const response = await fetch(endpointForGenerate(providerConfig?.endpoint_url, modelId, apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `Google generate request failed (${response.status}).`);
  }

  const content =
    String(data?.candidates?.[0]?.content?.parts?.[0]?.text || "").trim() || "No response.";

  return {
    content,
    usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    provider: "google",
    model: `google:${modelId}`,
  };
}
