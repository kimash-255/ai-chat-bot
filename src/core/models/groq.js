function readApiKey(providerConfig) {
  const envRef = String(providerConfig?.api_key_ref || "").trim();
  if (envRef && process.env[envRef]) return process.env[envRef];
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
  return "";
}

function modelFromInput(model, providerConfig) {
  const raw = String(model || "");
  if (raw && raw.startsWith("groq:")) return raw.slice("groq:".length);
  if (providerConfig?.default_model) return String(providerConfig.default_model);
  if (process.env.GROQ_DEFAULT_MODEL) return String(process.env.GROQ_DEFAULT_MODEL);
  return "";
}

function normalizeMessages(messages = []) {
  const out = messages
    .map((item) => {
      const role = ["system", "assistant", "user"].includes(item?.role) ? item.role : "user";
      const content = String(item?.content || "").trim();
      if (!content) return null;
      return { role, content };
    })
    .filter(Boolean);
  return out.length ? out : [{ role: "user", content: "Hello" }];
}

export async function callGroqModel({
  model = "groq:configured",
  messages,
  temperature = 0.2,
  maxTokens = 500,
  providerConfig,
}) {
  const apiKey = readApiKey(providerConfig);
  if (!apiKey) throw new Error("Groq API key missing. Set GROQ_API_KEY or configured env ref.");
  const modelId = modelFromInput(model, providerConfig);
  if (!modelId) throw new Error("Groq model not configured. Set default_model or pass groq:<model>.");
  const endpoint = String(providerConfig?.endpoint_url || "https://api.groq.com/openai/v1/chat/completions");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: normalizeMessages(messages),
      temperature,
      max_tokens: maxTokens,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || data?.error || `Groq request failed (${response.status}).`);
  }

  return {
    content: String(data?.choices?.[0]?.message?.content || "").trim() || "No response.",
    usage: {
      inputTokens: Number(data?.usage?.prompt_tokens || 0),
      outputTokens: Number(data?.usage?.completion_tokens || 0),
      totalTokens: Number(data?.usage?.total_tokens || 0),
    },
    provider: "groq",
    model: `groq:${modelId}`,
  };
}
