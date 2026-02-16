import { getPersonaPrompt } from "../prompts/personas";
import { getSystemPrompt } from "../prompts/system";
import { getToolPrompt } from "../prompts/tools";

export function buildPrompt({ input, memory }) {
  const persona = input.tags.includes("code") ? "coding" : "default";
  const longContext = (memory.longTerm || [])
    .slice(-5)
    .map((entry) => {
      const turn = entry?.encrypted?.plaintext;
      if (Array.isArray(turn)) {
        return turn.map((t) => `[${t.role}] ${t.content}`).join("\n");
      }
      return JSON.stringify(entry);
    })
    .filter(Boolean)
    .join("\n");

  const messages = [
    { role: "system", content: getSystemPrompt() },
    { role: "system", content: getPersonaPrompt(persona) },
    { role: "system", content: getToolPrompt() },
    ...(longContext ? [{ role: "system", content: `Long memory:\n${longContext}` }] : []),
    ...memory.shortTerm,
    ...input.history,
    { role: "user", content: input.message },
  ];

  return messages;
}
