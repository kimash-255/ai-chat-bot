import { getPostgresUrl } from "@/lib/env";
import { logWarn } from "@/lib/logger";

let pgPoolPromise = null;

async function buildPgPool() {
  const connectionString = getPostgresUrl();
  if (!connectionString) return null;

  try {
    const pg = await import("pg");
    const pool = new pg.Pool({ connectionString });
    return pool;
  } catch (error) {
    logWarn("postgres_pool_unavailable", { error: error?.message });
    return null;
  }
}

export async function getPgPool() {
  if (!pgPoolPromise) {
    pgPoolPromise = buildPgPool();
  }
  return pgPoolPromise;
}
