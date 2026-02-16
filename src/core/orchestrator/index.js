import { callModel } from "../models";
import { validateAndNormalizeInput } from "./input";
import { hydrateMemory } from "./memory";
import { validateOutput } from "./output";
import { persistTurn } from "./persist";
import { enforcePolicy } from "./policy";
import { buildPrompt } from "./prompt";
import { resolveModel } from "./routing";

export async function runChatOrchestrator(payload) {
  const input = validateAndNormalizeInput(payload);

  const policy = enforcePolicy(input);
  if (!policy.allowed) {
    return {
      ok: false,
      sessionId: input.sessionId,
      error: policy.reason,
    };
  }

  const memory = await hydrateMemory({
    sessionId: input.sessionId,
    message: input.message,
  });

  const messages = buildPrompt({ input, memory });
  const selectedModel = resolveModel({ model: input.model, tags: input.tags });

  const rawResult = await callModel({
    model: selectedModel,
    messages,
    temperature: input.options.temperature,
    maxTokens: input.options.maxTokens,
    context: { tags: input.tags, sessionId: input.sessionId },
  });

  const result = validateOutput(rawResult);

  await persistTurn({
    sessionId: input.sessionId,
    userMessage: input.message,
    assistantMessage: result.content,
  });

  return {
    ok: true,
    sessionId: input.sessionId,
    reply: {
      role: "assistant",
      content: result.content,
      model: result.model,
      provider: result.provider,
      usage: result.usage,
      createdAt: new Date().toISOString(),
    },
    meta: {
      tags: input.tags,
      modelRequested: input.model,
      modelResolved: result.model,
    },
  };
}
