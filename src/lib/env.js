function readEnv(name, fallback = "") {
  const value = process.env[name];
  if (typeof value === "string" && value.length > 0) return value;
  return fallback;
}

export function getRedisUrl() {
  return readEnv("REDIS_URL");
}

export function getPostgresUrl() {
  return readEnv("DATABASE_URL");
}

export function getUplinkMasterKey() {
  return readEnv("UPLINK_MASTER_KEY", "dev-only-uplink-key-change-me");
}

export function getDefaultUserId() {
  return readEnv("DEFAULT_USER_ID", "local-user");
}
