import { listModelConfigs, saveModelConfig } from "@/core/auth/store";
import { createId } from "@/lib/utils";

const fallbackConfigs = [
  {
    id: "cfg_huggingface",
    name: "Hugging Face Inference",
    provider: "huggingface",
    endpoint_url: "https://api-inference.huggingface.co/models",
    api_key_ref: "HF_TOKEN",
    default_model: "",
    active: true,
  }
];

const ALLOWED_PROVIDERS = new Set(["huggingface", "groq", "google"]);

export async function getActiveModelConfigs() {
  const configs = await listModelConfigs();
  if (!configs.length) return fallbackConfigs;
  return configs.filter((item) => item.active);
}

export async function getAllModelConfigs() {
  const configs = await listModelConfigs();
  if (!configs.length) return fallbackConfigs;
  return configs;
}

export async function upsertModelConfig(input) {
  const provider = String(input.provider || "").trim().toLowerCase();
  if (!ALLOWED_PROVIDERS.has(provider)) {
    throw new Error("Provider must be one of: huggingface, groq, google.");
  }

  const config = {
    id: input.id || createId("model_cfg"),
    name: String(input.name || "").trim(),
    provider,
    endpoint_url: String(input.endpoint_url || "").trim(),
    api_key_ref: String(input.api_key_ref || "").trim(),
    default_model: String(input.default_model || "").trim(),
    active: Boolean(input.active),
  };
  await saveModelConfig(config);
  return config;
}
