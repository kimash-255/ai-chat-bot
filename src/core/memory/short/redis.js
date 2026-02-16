import { getRedisClient } from "@/db/fast/redis";

const fallbackShortStore = new Map();

function fallbackGet(key) {
  return fallbackShortStore.get(key) || [];
}

function fallbackAppend(key, messages = [], limit = 50) {
  const current = fallbackGet(key);
  const next = [...current, ...messages].slice(-limit);
  fallbackShortStore.set(key, next);
}

export async function getRedisShortMemory(memoryKey) {
  const client = await getRedisClient();
  if (!client) return fallbackGet(memoryKey);

  const raw = await client.get(`short:${memoryKey}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function appendRedisShortMemory(memoryKey, messages = [], limit = 50) {
  const client = await getRedisClient();
  if (!client) {
    fallbackAppend(memoryKey, messages, limit);
    return;
  }

  const current = await getRedisShortMemory(memoryKey);
  const next = [...current, ...messages].slice(-limit);
  await client.set(`short:${memoryKey}`, JSON.stringify(next));
}

export async function setRedisShortMemory(memoryKey, messages = []) {
  const client = await getRedisClient();
  if (!client) {
    fallbackShortStore.set(memoryKey, messages);
    return;
  }

  await client.set(`short:${memoryKey}`, JSON.stringify(messages));
}
