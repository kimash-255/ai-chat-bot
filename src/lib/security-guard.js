const attempts = new Map();

const WINDOW_MS = 1000 * 60 * 10;
const LOCK_THRESHOLD = 6;
const LOCK_MS = 1000 * 60 * 5;

function now() {
  return Date.now();
}

function keyFor(identity, ip) {
  return `${identity}::${ip || "unknown"}`;
}

export function checkLoginAllowance(identity, ip) {
  const key = keyFor(identity, ip);
  const entry = attempts.get(key);
  if (!entry) return { allowed: true };

  if (entry.lockUntil && entry.lockUntil > now()) {
    return { allowed: false, retryAt: entry.lockUntil };
  }
  return { allowed: true };
}

export function recordLoginFailure(identity, ip) {
  const key = keyFor(identity, ip);
  const ts = now();
  const entry = attempts.get(key) || { failures: [], lockUntil: 0 };
  entry.failures = entry.failures.filter((t) => ts - t < WINDOW_MS);
  entry.failures.push(ts);
  if (entry.failures.length >= LOCK_THRESHOLD) {
    entry.lockUntil = ts + LOCK_MS;
    entry.failures = [];
  }
  attempts.set(key, entry);
}

export function clearLoginFailures(identity, ip) {
  const key = keyFor(identity, ip);
  attempts.delete(key);
}
