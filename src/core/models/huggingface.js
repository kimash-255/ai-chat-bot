import { InferenceClient } from "@huggingface/inference";

function readApiKey(providerConfig) {
  const envRef = String(providerConfig?.api_key_ref || "").trim();
  if (envRef && process.env[envRef]) return process.env[envRef];
  if (process.env.HF_TOKEN) return process.env.HF_TOKEN;
  if (process.env.HUGGINGFACE_API_KEY) return process.env.HUGGINGFACE_API_KEY;
  return "";
}

function resolveTask(tags = []) {
  if (tags.includes("video")) return "video-generation";
  if (tags.includes("multimodal")) return "image-generation";
  if (tags.includes("knowledge_retrieval")) return "search-retrieval";
  if (tags.includes("classify") || tags.includes("translate") || tags.includes("embed")) return "traditional-ml";
  return "text-generation";
}

function modelFromInput(model) {
  if (!model || model === "auto" || String(model).endsWith(":configured")) return "";
  const clean = String(model);
  return clean.startsWith("huggingface:") ? clean.slice("huggingface:".length) : clean;
}

function buildClient(apiKey, providerConfig) {
  const endpoint = String(providerConfig?.endpoint_url || "").trim();
  const opts = {};
  if (endpoint && endpoint !== "https://api-inference.huggingface.co/models") {
    opts.endpointUrl = endpoint;
  }
  return new InferenceClient(apiKey, opts);
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

function summarizeBinaryResult(task, data) {
  const sizeBytes = Number(data?.size || data?.byteLength || 0);
  const mimeType = String(data?.type || "");
  return JSON.stringify({ type: task, mimeType: mimeType || null, sizeBytes });
}

function toJsonText(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export async function callHuggingFaceModel({
  messages,
  model = "auto",
  providerConfig,
  temperature = 0.2,
  maxTokens = 500,
  context = {},
}) {
  const tags = Array.isArray(context?.tags) ? context.tags : [];
  const task = context?.task || resolveTask(tags);
  const apiKey = readApiKey(providerConfig);
  if (!apiKey) {
    throw new Error("Hugging Face token missing. Set HF_TOKEN or HUGGINGFACE_API_KEY (or configured env ref).");
  }

  const modelId =
    modelFromInput(model) ||
    String(providerConfig?.default_model || "").trim() ||
    String(process.env.HUGGINGFACE_DEFAULT_MODEL || "").trim();
  if (!modelId) {
    throw new Error("Hugging Face model is not configured. Set a model id in admin config or HUGGINGFACE_DEFAULT_MODEL.");
  }

  const client = buildClient(apiKey, providerConfig);
  const normalizedMessages = normalizeMessages(messages);
  const lastUserMessage = [...normalizedMessages].reverse().find((m) => m.role === "user");
  const prompt = String(lastUserMessage?.content || "");

  if (task === "text-generation") {
    const chatCompletion = await client.chatCompletion({
      model: modelId,
      messages: normalizedMessages,
      temperature,
      max_tokens: maxTokens,
    });
    const content = String(chatCompletion?.choices?.[0]?.message?.content || "").trim() || "No response.";
    const usage = chatCompletion?.usage
      ? {
          inputTokens: Number(chatCompletion.usage.prompt_tokens || 0),
          outputTokens: Number(chatCompletion.usage.completion_tokens || 0),
          totalTokens: Number(chatCompletion.usage.total_tokens || 0),
        }
      : { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

    return {
      content,
      usage,
      provider: "huggingface",
      model: `huggingface:${modelId}`,
      task,
    };
  }

  if (task === "image-generation") {
    const image = await client.textToImage({ model: modelId, inputs: prompt });
    return {
      content: summarizeBinaryResult(task, image),
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      provider: "huggingface",
      model: `huggingface:${modelId}`,
      task,
    };
  }

  if (task === "video-generation") {
    const video = await client.textToVideo({ model: modelId, inputs: prompt });
    return {
      content: summarizeBinaryResult(task, video),
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      provider: "huggingface",
      model: `huggingface:${modelId}`,
      task,
    };
  }

  if (task === "search-retrieval") {
    const vectors = await client.featureExtraction({ model: modelId, inputs: prompt });
    return {
      content: toJsonText({ type: "feature-extraction", output: vectors }),
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      provider: "huggingface",
      model: `huggingface:${modelId}`,
      task,
    };
  }

  if (task === "traditional-ml") {
    if (tags.includes("translate")) {
      const translated = await client.translation({ model: modelId, inputs: prompt });
      return {
        content: toJsonText({ type: "translation", output: translated }),
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        provider: "huggingface",
        model: `huggingface:${modelId}`,
        task,
      };
    }

    if (tags.includes("classify")) {
      const classified = await client.textClassification({ model: modelId, inputs: prompt });
      return {
        content: toJsonText({ type: "text-classification", output: classified }),
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        provider: "huggingface",
        model: `huggingface:${modelId}`,
        task,
      };
    }

    const embeddings = await client.featureExtraction({ model: modelId, inputs: prompt });
    return {
      content: toJsonText({ type: "feature-extraction", output: embeddings }),
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      provider: "huggingface",
      model: `huggingface:${modelId}`,
      task,
    };
  }

  const fallback = await client.featureExtraction({ model: modelId, inputs: prompt });
  return {
    content: toJsonText({ type: "feature-extraction", output: fallback }),
    usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    provider: "huggingface",
    model: `huggingface:${modelId}`,
    task,
  };
}
