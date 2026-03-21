import type { SiteContentBlock } from '../types/siteContent';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/** Legacy CSV → blocks (quoted commas OK). Prefer the API in new code. */
export function parseSiteContent(csvText: string): SiteContentBlock[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const blocks: SiteContentBlock[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length >= 4) {
      blocks.push({
        section: row[0] ?? '',
        key: row[1] ?? '',
        title: row[2] ?? '',
        content: row[3] ?? '',
      });
    }
  }

  return blocks;
}
