const PERSONAS = {
  default: "Use a neutral and pragmatic tone.",
  coding: "Explain code changes clearly and include tradeoffs when relevant.",
};

export function getPersonaPrompt(persona = "default") {
  return PERSONAS[persona] || PERSONAS.default;
}
