/**
 * Selection helpers for a controlled textarea: returns new string + selection range after the edit.
 */

export function getLineRange(value, pos) {
  let lineStart = pos;
  while (lineStart > 0 && value[lineStart - 1] !== '\n') {
    lineStart -= 1;
  }
  let lineEnd = pos;
  while (lineEnd < value.length && value[lineEnd] !== '\n') {
    lineEnd += 1;
  }
  return { lineStart, lineEnd };
}

/**
 * @param {string} before
 * @param {string} [after] defaults to before (symmetric, e.g. **)
 */
export function wrapDelimiters(value, start, end, before, after = before) {
  const selected = value.slice(start, end);
  const middle = selected.length > 0 ? selected : 'text';
  const newValue = value.slice(0, start) + before + middle + after + value.slice(end);
  const a = start + before.length;
  const b = a + middle.length;
  return { newValue, selectionStart: a, selectionEnd: b };
}

export function insertAt(value, start, end, text) {
  const newValue = value.slice(0, start) + text + value.slice(end);
  const c = start + text.length;
  return { newValue, selectionStart: c, selectionEnd: c };
}

/**
 * Toggle a full-line prefix (heading, list, blockquote). Re-tap removes the same prefix.
 * @param {string} prefix e.g. '## ', '- ', '1. ', '> '
 */
export function toggleLinePrefix(value, pos, prefix) {
  const { lineStart, lineEnd } = getLineRange(value, pos);
  const line = value.slice(lineStart, lineEnd);
  if (line.startsWith(prefix)) {
    const newLine = line.slice(prefix.length);
    const newValue = value.slice(0, lineStart) + newLine + value.slice(lineEnd);
    const newPos = Math.max(lineStart, pos - prefix.length);
    return { newValue, selectionStart: newPos, selectionEnd: newPos };
  }
  const newLine = prefix + line;
  const newValue = value.slice(0, lineStart) + newLine + value.slice(lineEnd);
  const newPos = pos + prefix.length;
  return { newValue, selectionStart: newPos, selectionEnd: newPos };
}

const ORDERED_PAT = /^\d+\.\s/;

/**
 * Strips any `1. ` / `2. ` prefix or prepends `1. `.
 */
export function toggleOrderedListLine(value, pos) {
  const { lineStart, lineEnd } = getLineRange(value, pos);
  const line = value.slice(lineStart, lineEnd);
  const m = line.match(ORDERED_PAT);
  if (m) {
    const p = m[0];
    const newLine = line.slice(p.length);
    const newValue = value.slice(0, lineStart) + newLine + value.slice(lineEnd);
    const newPos = Math.max(lineStart, pos - p.length);
    return { newValue, selectionStart: newPos, selectionEnd: newPos };
  }
  return toggleLinePrefix(value, pos, '1. ');
}

export function insertLink(value, start, end) {
  const selected = value.slice(start, end);
  const label = selected.length > 0 ? selected : 'link text';
  const full = `[${label}](https://example.com)`;
  const newValue = value.slice(0, start) + full + value.slice(end);
  if (selected.length > 0) {
    const c = start + full.length;
    return { newValue, selectionStart: c, selectionEnd: c };
  }
  const a = start + 1;
  const b = a + label.length;
  return { newValue, selectionStart: a, selectionEnd: b };
}

/** Inserts a fenced code block; selects the inner placeholder word. */
export function insertCodeBlock(value, start, end) {
  const inner = 'code';
  const block = `\`\`\`\n${inner}\n\`\`\``;
  const newValue = value.slice(0, start) + block + value.slice(end);
  const a = start + 4; // after ```\n
  return { newValue, selectionStart: a, selectionEnd: a + inner.length };
}
