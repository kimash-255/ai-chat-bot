import { summarizeForLongMemory } from "./summarization";
import { getPgPool } from "@/db/deep/postgres";

const longFallbackStore = new Map();

export async function getLongMemory({ sessionId, query }) {
  if (!sessionId) return [];
  const thread = await getLongThreadMessages({ memoryKey: sessionId, limit: 80 });
  if (!query) return thread;
  const needle = String(query).toLowerCase();
  return thread.filter((entry) => JSON.stringify(entry).toLowerCase().includes(needle)).slice(-20);
}

export async function writeLongMemorySummary(messages) {
  return summarizeForLongMemory(messages);
}

export async function appendLongMemory({ memoryKey, message }) {
  const pool = await getPgPool();
  if (pool) {
    try {
      await pool.query(
        "INSERT INTO chat_messages(memory_key, payload, created_at) VALUES($1, $2::jsonb, NOW())",
        [memoryKey, JSON.stringify(message)]
      );
      return;
    } catch {
      // fall through to local fallback
    }
  }

  const current = longFallbackStore.get(memoryKey) || [];
  longFallbackStore.set(memoryKey, [...current, message]);
}

export async function getLongThreadMessages({ memoryKey, limit = 200 }) {
  const pool = await getPgPool();
  if (pool) {
    try {
      const result = await pool.query(
        "SELECT payload FROM chat_messages WHERE memory_key = $1 ORDER BY created_at ASC LIMIT $2",
        [memoryKey, limit]
      );
      return result.rows.map((row) => row.payload);
    } catch {
      // fall through
    }
  }

  const current = longFallbackStore.get(memoryKey) || [];
  return current.slice(-limit);
}

export async function listLongThreads({ userId }) {
  const pool = await getPgPool();
  if (pool) {
    try {
      const result = await pool.query(
        "SELECT memory_key FROM chat_messages WHERE memory_key LIKE $1 GROUP BY memory_key ORDER BY MAX(created_at) DESC",
        [`${userId}:%`]
      );
      return result.rows.map((row) => row.memory_key);
    } catch {
      // fall through
    }
  }

  return [...longFallbackStore.keys()].filter((key) => key.startsWith(`${userId}:`));
}
