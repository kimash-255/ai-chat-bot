export function createMemoryEnvelope({ shortTerm = [], longTerm = [] } = {}) {
  return {
    shortTerm,
    longTerm,
    generatedAt: new Date().toISOString(),
  };
}
