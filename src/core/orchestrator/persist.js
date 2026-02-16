import { appendLongMemory, writeLongMemorySummary } from "../memory/long";
import { appendShortMemory } from "../memory/short";

export async function persistTurn({ sessionId, userMessage, assistantMessage }) {
  const turn = [
    { role: "user", content: userMessage },
    { role: "assistant", content: assistantMessage },
  ];

  await appendShortMemory(sessionId, turn);
  await appendLongMemory({
    memoryKey: sessionId,
    message: {
      id: `${sessionId}:${Date.now()}`,
      threadId: sessionId,
      encrypted: { plaintext: turn },
      createdAt: new Date().toISOString(),
    },
  });
  await writeLongMemorySummary(turn);
}
