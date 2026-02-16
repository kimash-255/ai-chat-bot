import { normalizeModelChoice } from "../types/model";
import { getActiveModelConfigs } from "./config-store";
import { callGoogleModel } from "./google";
import { callGroqModel } from "./groq";
import { callHuggingFaceModel } from "./huggingface";

const MODEL_HANDLERS = {
  huggingface: callHuggingFaceModel,
  groq: callGroqModel,
  google: callGoogleModel,
};

function getProviderFromModel(model) {
  return model.includes(":") ? model.split(":")[0] : "huggingface";
}

export async function callModel({ model, messages, temperature, maxTokens, context = {} }) {
  const resolvedModel = normalizeModelChoice(model);
  const configs = await getActiveModelConfigs();
  const providerConfigs = Object.fromEntries(configs.map((cfg) => [cfg.provider, cfg]));

  const provider = resolvedModel === "auto" ? "huggingface" : getProviderFromModel(resolvedModel);
  const handler = MODEL_HANDLERS[provider] || callHuggingFaceModel;
  const providerConfig = providerConfigs[provider] || providerConfigs.huggingface || configs[0] || null;

  return handler({
    model: resolvedModel,
    messages,
    temperature,
    maxTokens,
    context,
    providerConfig,
  });
}

export function listModels() {
  return Object.keys(MODEL_HANDLERS);
}
