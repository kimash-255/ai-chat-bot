import { appendRedisShortMemory, getRedisShortMemory, setRedisShortMemory } from "./redis";

const fallbackMessages = new Map();

export function buildMemoryKey({ userId = "local-user", scopeId }) {
  return `${userId}:${scopeId}`;
}

export async function getShortMemory(memoryKey) {
  if (!memoryKey) return [];
  const redisResult = await getRedisShortMemory(memoryKey);
  if (redisResult.length) return redisResult;
  return fallbackMessages.get(memoryKey) || [];
}

export async function appendShortMemory(memoryKey, messages = [], limit = 50) {
  if (!memoryKey || !Array.isArray(messages) || messages.length === 0) return;

  await appendRedisShortMemory(memoryKey, messages, limit);
  const current = fallbackMessages.get(memoryKey) || [];
  const next = [...current, ...messages].slice(-limit);
  fallbackMessages.set(memoryKey, next);
}

export async function setShortMemory(memoryKey, messages = []) {
  if (!memoryKey) return;
  await setRedisShortMemory(memoryKey, messages);
  fallbackMessages.set(memoryKey, messages);
}
