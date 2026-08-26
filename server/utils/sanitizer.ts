/**
 * Payload Sanitization & Hygiene Utilities
 * Strictly strips undefined properties and guards against malformed inputs
 */

export function stripUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => stripUndefined(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = stripUndefined(value);
      }
    }
    return result as T;
  }

  return obj;
}

export function sanitizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }
  const set = new Set<string>();
  for (const tag of tags) {
    if (typeof tag === 'string') {
      const clean = tag.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (clean.length > 0 && clean.length <= 40) {
        set.add(clean);
      }
    }
  }
  return Array.from(set).slice(0, 15);
}

export function safeString(input: unknown, maxLength = 20000): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input.trim().slice(0, maxLength);
}
