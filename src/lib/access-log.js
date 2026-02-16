import { logAccess } from "@/lib/logger";
import { buildRequestContext } from "@/lib/request-context";

function safePath(req) {
  return String(req?.url || req?.originalUrl || "unknown");
}

export function startAccessLog(req, res, { route = "", action = "" } = {}) {
  const started = process.hrtime.bigint();
  const ctx = buildRequestContext(req);
  const method = String(req?.method || "UNKNOWN").toUpperCase();
  const path = safePath(req);

  logAccess("access_start", {
    route: route || path,
    action: action || `${method} ${path}`,
    method,
    path,
    requestId: ctx.requestId,
    networkFingerprint: ctx.networkFingerprint,
    ip: ctx.ip,
    host: ctx.host,
    userAgent: ctx.userAgent,
  });

  let logged = false;
  const done = () => {
    if (logged) return;
    logged = true;
    const ended = process.hrtime.bigint();
    const durationMs = Number(ended - started) / 1_000_000;
    logAccess("access_end", {
      route: route || path,
      action: action || `${method} ${path}`,
      method,
      path,
      statusCode: res?.statusCode ?? 0,
      durationMs: Number(durationMs.toFixed(3)),
      requestId: ctx.requestId,
      networkFingerprint: ctx.networkFingerprint,
      ip: ctx.ip,
    });
  };

  res.once("finish", done);
  res.once("close", done);
}
