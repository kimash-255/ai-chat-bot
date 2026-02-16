import { getLongMemory } from "./index";

export async function retrieveLongMemory({ sessionId, query }) {
  return getLongMemory({ sessionId, query });
}
