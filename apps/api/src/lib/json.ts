export function jsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  return [];
}
