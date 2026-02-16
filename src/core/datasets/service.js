import crypto from "crypto";
import { createId, nowIso } from "@/lib/utils";

const datasetStore = new Map();
const dumpStore = [];

function encryptionKey() {
  return crypto.createHash("sha256").update(process.env.DATASET_DUMP_KEY || "dev-dump-key").digest();
}

function encryptDump(payload) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const text = JSON.stringify(payload);
  const data = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: data.toString("base64"),
  };
}

export function listUserDatasets(userId) {
  return datasetStore.get(userId) || [];
}

export function createUserDataset(userId, input) {
  const datasets = datasetStore.get(userId) || [];
  const item = {
    id: createId("ds"),
    name: String(input?.name || "Untitled Dataset"),
    records: Array.isArray(input?.records) ? input.records : [],
    createdAt: nowIso(),
  };
  datasetStore.set(userId, [item, ...datasets]);
  return item;
}

export function createEncryptedDumpVersion({ userId, actorRole }) {
  const payload =
    actorRole === "admin"
      ? Object.fromEntries(datasetStore.entries())
      : { [userId]: datasetStore.get(userId) || [] };
  const encrypted = encryptDump(payload);
  const record = {
    id: createId("dump"),
    actor: userId,
    role: actorRole,
    createdAt: nowIso(),
    encrypted,
  };
  dumpStore.unshift(record);
  return record;
}

export function listDumpsForUser({ userId, role }) {
  if (role === "admin") return dumpStore;
  return dumpStore.filter((dump) => dump.actor === userId);
}
