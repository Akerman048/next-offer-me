export function cleanAIJson(raw: string) {
  return raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

export function safeParseAIJson<T>(raw: string, fallback: T): T {
  try {
    const cleaned = cleanAIJson(raw);
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}