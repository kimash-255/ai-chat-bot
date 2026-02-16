import crypto from "crypto";
import zlib from "zlib";
import { getUplinkMasterKey } from "./env";
import { createId, nowIso } from "./utils";

const uplinkRegistry = new Map();

function deriveKey(userId) {
  const material = `${getUplinkMasterKey()}::${userId}`;
  return crypto.createHash("sha256").update(material).digest();
}

function encryptJson(payload, userId) {
  const key = deriveKey(userId);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    alg: "aes-256-gcm",
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: encrypted.toString("base64"),
  };
}

function decryptJson(envelope, userId) {
  const key = deriveKey(userId);
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(envelope.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, "base64")),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString("utf8"));
}

export async function registerUplink({
  userId,
  fileName,
  mimeType,
  sizeBytes,
  tags = [],
  dataUrl = "",
}) {
  const uplinkId = createId("uplink");
  const compressed = zlib.gzipSync(Buffer.from(String(dataUrl || ""), "utf8")).toString("base64");
  const payload = {
    uplinkId,
    fileName,
    mimeType,
    sizeBytes,
    dataGzipBase64: compressed,
    encoding: "gzip+base64",
    tags,
    createdAt: nowIso(),
    randomSeal: crypto.randomBytes(8).toString("base64url"),
  };

  const encrypted = encryptJson(payload, userId);
  const record = {
    uplinkId,
    ownerId: userId,
    fileName,
    mimeType,
    sizeBytes,
    encrypted,
    createdAt: nowIso(),
  };

  uplinkRegistry.set(`${userId}:${uplinkId}`, record);
  return record;
}

export async function getUplink(userId, uplinkId) {
  const key = `${userId}:${uplinkId}`;
  const record = uplinkRegistry.get(key);
  if (!record) return null;

  const decoded = decryptJson(record.encrypted, userId);
  const inflatedData = decoded?.dataGzipBase64
    ? zlib.gunzipSync(Buffer.from(decoded.dataGzipBase64, "base64")).toString("utf8")
    : "";

  return {
    ...record,
    decrypted: {
      ...decoded,
      dataUrl: inflatedData,
    },
  };
}

export function toEncryptedEnvelope(userId, payload) {
  return encryptJson(payload, userId);
}

export function fromEncryptedEnvelope(userId, envelope) {
  return decryptJson(envelope, userId);
}
