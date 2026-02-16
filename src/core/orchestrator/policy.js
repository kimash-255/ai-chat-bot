const BLOCKED_PATTERNS = [/ignore\s+all\s+previous\s+instructions/i];

export function enforcePolicy(input) {
  const blocked = BLOCKED_PATTERNS.some((pattern) => pattern.test(input.message));

  if (blocked) {
    return {
      allowed: false,
      reason: "Input violates policy.",
    };
  }

  return { allowed: true };
}
