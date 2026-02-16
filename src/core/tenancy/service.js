import crypto from "crypto";
import { getPgPool } from "@/db/deep/postgres";

const tenantFallback = new Map();

function sanitizeSchemaName(value) {
  return value.replace(/[^a-z0-9_]/gi, "_").toLowerCase();
}

export function deriveTenantSchema(userId) {
  const digest = crypto.createHash("sha256").update(String(userId)).digest("hex").slice(0, 16);
  return sanitizeSchemaName(`tenant_${digest}`);
}

export async function ensureTenantForUser(userId) {
  const schema = deriveTenantSchema(userId);
  const pool = await getPgPool();

  if (pool) {
    await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${schema}.profile (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  } else {
    tenantFallback.set(schema, { id: userId, createdAt: new Date().toISOString() });
  }

  return { schema };
}
