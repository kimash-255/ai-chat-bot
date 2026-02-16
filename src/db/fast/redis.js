import { getRedisUrl } from "@/lib/env";
import { logWarn } from "@/lib/logger";

let redisClientPromise = null;

async function buildRedisClient() {
  const redisUrl = getRedisUrl();
  if (!redisUrl) return null;

  try {
    const redis = await import("redis");
    const client = redis.createClient({ url: redisUrl });
    client.on("error", (error) => logWarn("redis_client_error", { error: error?.message }));
    await client.connect();
    return client;
  } catch (error) {
    logWarn("redis_client_unavailable", { error: error?.message });
    return null;
  }
}

export async function getRedisClient() {
  if (!redisClientPromise) {
    redisClientPromise = buildRedisClient();
  }
  return redisClientPromise;
}
