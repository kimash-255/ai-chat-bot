import { getPgPool } from "@/db/deep/postgres";
import fs from "fs";
import path from "path";

const usersFallback = new Map();
const sessionsFallback = new Map();
const modelConfigsFallback = new Map();
let fallbackLoaded = false;

const fallbackFilePath = path.join(process.cwd(), "logs", "auth-store.json");

function ensureFallbackLoaded() {
  if (fallbackLoaded) return;
  fallbackLoaded = true;
  try {
    if (!fs.existsSync(fallbackFilePath)) return;
    const raw = fs.readFileSync(fallbackFilePath, "utf8");
    const parsed = JSON.parse(raw);

    for (const user of Array.isArray(parsed?.users) ? parsed.users : []) {
      if (user?.username) usersFallback.set(user.username, user);
    }
    for (const session of Array.isArray(parsed?.sessions) ? parsed.sessions : []) {
      if (session?.id) sessionsFallback.set(session.id, session);
    }
    for (const cfg of Array.isArray(parsed?.modelConfigs) ? parsed.modelConfigs : []) {
      if (cfg?.id) modelConfigsFallback.set(cfg.id, cfg);
    }
  } catch {
    // Ignore fallback parse errors and continue with empty maps.
  }
}

function persistFallbackToDisk() {
  try {
    const dir = path.dirname(fallbackFilePath);
    fs.mkdirSync(dir, { recursive: true });
    const payload = {
      users: [...usersFallback.values()],
      sessions: [...sessionsFallback.values()],
      modelConfigs: [...modelConfigsFallback.values()],
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(fallbackFilePath, JSON.stringify(payload, null, 2), "utf8");
  } catch {
    // Ignore fallback write errors.
  }
}

async function ensureTables(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      profile JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      csrf_token TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS model_provider_configs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      endpoint_url TEXT NOT NULL,
      api_key_ref TEXT NOT NULL,
      default_model TEXT NOT NULL DEFAULT '',
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query("ALTER TABLE model_provider_configs ADD COLUMN IF NOT EXISTS default_model TEXT NOT NULL DEFAULT ''");
}

export async function getUserByUsername(username) {
  const pool = await getPgPool();
  if (pool) {
    await ensureTables(pool);
    const result = await pool.query("SELECT * FROM app_users WHERE username = $1 LIMIT 1", [username]);
    return result.rows[0] || null;
  }
  ensureFallbackLoaded();
  return usersFallback.get(username) || null;
}

export async function getUserById(id) {
  const pool = await getPgPool();
  if (pool) {
    await ensureTables(pool);
    const result = await pool.query("SELECT * FROM app_users WHERE id = $1 LIMIT 1", [id]);
    return result.rows[0] || null;
  }
  ensureFallbackLoaded();
  for (const user of usersFallback.values()) {
    if (user.id === id) return user;
  }
  return null;
}

export async function saveUser(user) {
  const pool = await getPgPool();
  if (pool) {
    await ensureTables(pool);
    await pool.query(
      `
      INSERT INTO app_users (id, username, password_hash, role, profile)
      VALUES ($1, $2, $3, $4, $5::jsonb)
      ON CONFLICT (id)
      DO UPDATE SET username = EXCLUDED.username, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, profile = EXCLUDED.profile
      `,
      [user.id, user.username, user.password_hash, user.role, JSON.stringify(user.profile || {})]
    );
    return;
  }
  ensureFallbackLoaded();
  usersFallback.set(user.username, user);
  persistFallbackToDisk();
}

export async function listAllUsers() {
  const pool = await getPgPool();
  if (pool) {
    await ensureTables(pool);
    const result = await pool.query("SELECT id, username, role, profile, created_at FROM app_users ORDER BY created_at ASC");
    return result.rows;
  }
  ensureFallbackLoaded();
  return [...usersFallback.values()].map((u) => ({
    id: u.id,
    username: u.username,
    role: u.role,
    profile: u.profile || {},
    created_at: u.created_at || new Date().toISOString(),
  }));
}

export async function saveSession(session) {
  const pool = await getPgPool();
  if (pool) {
    await ensureTables(pool);
    await pool.query(
      `
      INSERT INTO app_sessions (id, user_id, expires_at, csrf_token)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, expires_at = EXCLUDED.expires_at, csrf_token = EXCLUDED.csrf_token
      `,
      [session.id, session.user_id, session.expires_at, session.csrf_token]
    );
    return;
  }
  ensureFallbackLoaded();
  sessionsFallback.set(session.id, session);
  persistFallbackToDisk();
}

export async function getSessionById(id) {
  const pool = await getPgPool();
  if (pool) {
    await ensureTables(pool);
    const result = await pool.query("SELECT * FROM app_sessions WHERE id = $1 LIMIT 1", [id]);
    return result.rows[0] || null;
  }
  ensureFallbackLoaded();
  return sessionsFallback.get(id) || null;
}

export async function deleteSession(id) {
  const pool = await getPgPool();
  if (pool) {
    await ensureTables(pool);
    await pool.query("DELETE FROM app_sessions WHERE id = $1", [id]);
    return;
  }
  ensureFallbackLoaded();
  sessionsFallback.delete(id);
  persistFallbackToDisk();
}

export async function listModelConfigs() {
  const pool = await getPgPool();
  if (pool) {
    await ensureTables(pool);
    const result = await pool.query("SELECT * FROM model_provider_configs ORDER BY created_at ASC");
    return result.rows;
  }
  ensureFallbackLoaded();
  return [...modelConfigsFallback.values()];
}

export async function saveModelConfig(config) {
  const pool = await getPgPool();
  if (pool) {
    await ensureTables(pool);
    await pool.query(
      `
      INSERT INTO model_provider_configs (id, name, provider, endpoint_url, api_key_ref, active, default_model)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id)
      DO UPDATE SET name = EXCLUDED.name, provider = EXCLUDED.provider, endpoint_url = EXCLUDED.endpoint_url, api_key_ref = EXCLUDED.api_key_ref, active = EXCLUDED.active, default_model = EXCLUDED.default_model
      `,
      [config.id, config.name, config.provider, config.endpoint_url, config.api_key_ref, config.active, config.default_model || ""]
    );
    return;
  }
  ensureFallbackLoaded();
  modelConfigsFallback.set(config.id, {
    ...config,
    created_at: config.created_at || new Date().toISOString(),
  });
  persistFallbackToDisk();
}
