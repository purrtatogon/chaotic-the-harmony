/**
 * If `text` looks like JSON (starts with `{` or `[`), return an error string when
 * `JSON.parse` fails; otherwise return null. Empty / prose-only text returns null.
 */
export function getJsonContentValidationError(text) {
  const raw = String(text ?? '');
  const t = raw.trim();
  if (t.length === 0) return null;
  if (t[0] !== '{' && t[0] !== '[') return null;
  try {
    JSON.parse(t);
    return null;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Parse error';
    return `Invalid JSON — ${msg}. Fix the structure or remove extra characters and try again.`;
  }
}

export function contentLooksLikeJson(text) {
  const t = String(text ?? '').trim();
  return t.length > 0 && (t[0] === '{' || t[0] === '[');
}
