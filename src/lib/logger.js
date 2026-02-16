const PROCESS_START_TS = new Date().toISOString();
const PROCESS_START_EPOCH_NS = BigInt(Date.now()) * 1000000n;
const PROCESS_START_HR_NS =
  typeof process !== "undefined" && process.hrtime?.bigint ? process.hrtime.bigint() : 0n;
const ERROR_TAG_INDEX_FILE = "error-tags.json";
let EARLIEST_LOG_TS_CACHE = null;
let EARLIEST_LOG_NS_CACHE = null;

function parseTs(value) {
  const time = Date.parse(String(value || ""));
  return Number.isFinite(time) ? time : null;
}

function parseNs(value) {
  try {
    const clean = String(value || "").trim();
    if (!clean) return null;
    return BigInt(clean);
  } catch {
    return null;
  }
}

function nowEpochNs() {
  if (typeof process !== "undefined" && process.hrtime?.bigint) {
    return PROCESS_START_EPOCH_NS + (process.hrtime.bigint() - PROCESS_START_HR_NS);
  }
  return BigInt(Date.now()) * 1000000n;
}

function readEarliestKnownLogTs() {
  if (typeof window !== "undefined") return null;
  if (EARLIEST_LOG_TS_CACHE && EARLIEST_LOG_NS_CACHE) return EARLIEST_LOG_TS_CACHE;

  try {
    const fs = require("fs");
    const path = require("path");
    const root = process.cwd();
    const logsRoot = path.join(root, "logs");
    if (!fs.existsSync(logsRoot)) return null;

    const stack = [logsRoot];
    let minTs = null;
    let minNs = null;

    while (stack.length) {
      const current = stack.pop();
      const items = fs.readdirSync(current, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(current, item.name);
        if (item.isDirectory()) {
          stack.push(fullPath);
          continue;
        }
        if (!item.isFile() || !fullPath.endsWith(".log")) continue;

        const lines = fs.readFileSync(fullPath, "utf8").split(/\r?\n/).filter(Boolean);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            const nsNum = parseNs(parsed?.tsEpochNs);
            if (nsNum !== null && (minNs === null || nsNum < minNs)) minNs = nsNum;
            const tsNum = parseTs(parsed?.ts);
            if (tsNum === null) continue;
            if (minTs === null || tsNum < minTs) minTs = tsNum;
          } catch {
            // Skip malformed lines.
          }
        }
      }
    }

    EARLIEST_LOG_TS_CACHE = minTs === null ? null : new Date(minTs).toISOString();
    EARLIEST_LOG_NS_CACHE = minNs === null ? null : String(minNs);
    return EARLIEST_LOG_TS_CACHE;
  } catch {
    return null;
  }
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function stableHash(input) {
  try {
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(String(input || "")).digest("hex").slice(0, 12);
  } catch {
    return slug(input).slice(0, 12) || "unknown";
  }
}

function buildErrorTags(level, message, meta) {
  const tags = new Set();
  tags.add(`lvl_${slug(level) || "unknown"}`);
  tags.add(`evt_${slug(message) || "unknown_event"}`);

  if (meta?.route) tags.add(`route_${slug(meta.route)}`);
  if (meta?.code) tags.add(`code_${slug(meta.code)}`);

  const errorText = meta?.error || meta?.reason || "";
  if (errorText) tags.add(`err_${slug(errorText) || "generic"}`);

  const userTags = Array.isArray(meta?.tags) ? meta.tags : [];
  for (const item of userTags) {
    const s = slug(item);
    if (s) tags.add(`usr_${s}`);
  }

  const canonical = [
    `level:${level}`,
    `message:${message}`,
    `route:${meta?.route || ""}`,
    `code:${meta?.code || ""}`,
    `error:${errorText}`,
  ].join("|");
  const fingerprint = `fp_${stableHash(canonical)}`;
  tags.add(fingerprint);

  return { tags: [...tags], fingerprint };
}

function buildEntry(level, message, meta) {
  const tsNs = nowEpochNs();
  const earliestKnownLogTs = readEarliestKnownLogTs() || PROCESS_START_TS;
  const earliestKnownLogNs = EARLIEST_LOG_NS_CACHE || String(PROCESS_START_EPOCH_NS);
  const normalizedMeta = meta || null;
  const { tags, fingerprint } = buildErrorTags(level, message, normalizedMeta || {});
  return {
    ts: new Date().toISOString(),
    tsEpochNs: String(tsNs),
    processStartTs: PROCESS_START_TS,
    processStartEpochNs: String(PROCESS_START_EPOCH_NS),
    earliestKnownLogTs,
    earliestKnownLogEpochNs: earliestKnownLogNs,
    level,
    errorTags: tags,
    errorFingerprint: fingerprint,
    message,
    meta: normalizedMeta,
  };
}

function format(level, message, meta) {
  return JSON.stringify(buildEntry(level, message, meta));
}

function updateErrorTagIndex(root, entry) {
  try {
    const fs = require("fs");
    const path = require("path");
    const indexPath = path.join(root, "logs", ERROR_TAG_INDEX_FILE);
    let current = { updatedAt: "", tags: {} };

    if (fs.existsSync(indexPath)) {
      try {
        current = JSON.parse(fs.readFileSync(indexPath, "utf8"));
      } catch {
        current = { updatedAt: "", tags: {} };
      }
    }

    const tags = Array.isArray(entry?.errorTags) ? entry.errorTags : [];
    for (const tag of tags) {
      if (!current.tags[tag]) {
        current.tags[tag] = { count: 0, firstSeen: entry.ts, lastSeen: entry.ts, levels: {} };
      }
      current.tags[tag].count += 1;
      if (!current.tags[tag].firstSeen || Date.parse(entry.ts) < Date.parse(current.tags[tag].firstSeen)) {
        current.tags[tag].firstSeen = entry.ts;
      }
      current.tags[tag].lastSeen = entry.ts;
      const levelKey = entry.level || "unknown";
      current.tags[tag].levels[levelKey] = (current.tags[tag].levels[levelKey] || 0) + 1;
    }

    current.updatedAt = entry.ts;
    fs.writeFileSync(indexPath, JSON.stringify(current, null, 2), "utf8");
  } catch {
    // Ignore index update failures.
  }
}

function writeToFile(line, stream = "app") {
  if (typeof window !== "undefined") return;
  try {
    const fs = require("fs");
    const path = require("path");
    const root = process.cwd();
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(now.getUTCDate()).padStart(2, "0");
    const hh = String(now.getUTCHours()).padStart(2, "0");
    const logDir = path.join(root, "logs", stream, `${yyyy}-${mm}-${dd}`);
    fs.mkdirSync(logDir, { recursive: true });
    const filePath = path.join(logDir, `${hh}.log`);
    fs.appendFileSync(filePath, `${line}\n`, { encoding: "utf8" });
    try {
      const parsed = JSON.parse(line);
      updateErrorTagIndex(root, parsed);
    } catch {
      // Ignore parse/index failures.
    }
  } catch {
    // Intentionally silent: logging must not break runtime.
  }
}

export function logInfo(message, meta) {
  writeToFile(format("info", message, meta), "app");
}

export function logWarn(message, meta) {
  writeToFile(format("warn", message, meta), "app");
}

export function logError(message, meta) {
  writeToFile(format("error", message, meta), "app");
}

export function logAccess(message, meta) {
  writeToFile(format("info", message, meta), "access");
}

export function logActivity(message, meta) {
  writeToFile(format("info", message, meta), "activity");
}
