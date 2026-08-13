// ponytail: client-safe redirect sanitizer (no node imports — usable in browser components)
export function safeRedirect(raw: string | null, fallback = '/'): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/')) return fallback;
  if (raw.startsWith('//') || raw.startsWith('/\\')) return fallback;
  return raw;
}
