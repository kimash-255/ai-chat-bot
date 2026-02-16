import { getLongMemory } from "../memory/long";
import { getShortMemory } from "../memory/short";
import { createMemoryEnvelope } from "../types/memory";

export async function hydrateMemory({ sessionId, message }) {
  const [shortTerm, longTerm] = await Promise.all([
    getShortMemory(sessionId),
    getLongMemory({ sessionId, query: message }),
  ]);

  return createMemoryEnvelope({ shortTerm, longTerm });
}
