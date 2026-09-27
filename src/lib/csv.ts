export type CsvSep = ',' | ';' | '\t';
export type CsvCell = string | number | boolean | null;

function field(value: CsvCell, sep: CsvSep): string {
  if (value === null) return '';
  const s = String(value);
  const quote =
    s.includes(sep) || s.includes('"') || s.includes('\r') || s.includes('\n') || /^\s|\s$/.test(s);
  return quote ? `"${s.replace(/"/g, '""')}"` : s;
}

/** RFC 4180: CRLF line breaks, quotes only where needed, `"` doubled and `null` as an empty field. */
export function toCsv(rows: CsvCell[][], sep: CsvSep = ','): string {
  return rows.map((row) => row.map((v) => field(v, sep)).join(sep)).join('\r\n');
}

/** A row whose column count differs from the header's. `row` is 1-based (the header is row 1). */
export interface CsvWarning {
  row: number;
  columns: number;
  expected: number;
}

export type CsvResult =
  | { ok: true; rows: string[][]; sep: ',' | ';' | '\t'; warnings: CsvWarning[] }
  | { ok: false; line: number; reason: 'unclosed-quote' };

const SEPARATORS = [',', ';', '\t'] as const;

/** Counts `,`, `;` and tabs outside quotes in the first row. The most frequent wins; ties go to `,`. */
export function detectSeparator(text: string): ',' | ';' | '\t' {
  const counts = { ',': 0, ';': 0, '\t': 0 };
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') quoted = !quoted;
    else if (!quoted && (c === '\n' || c === '\r')) break;
    else if (!quoted && (c === ',' || c === ';' || c === '\t')) counts[c]++;
  }
  let best: ',' | ';' | '\t' = ',';
  for (const s of SEPARATORS) if (counts[s] > counts[best]) best = s;
  return best;
}

/**
 * RFC 4180 reader written by hand: quoted fields may hold the separator, line breaks and `""`.
 * Accepts `\r\n`, `\n` and `\r`, drops a leading BOM and ignores the final line break.
 */
export function parseCsv(input: string, sep?: ',' | ';' | '\t'): CsvResult {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const separator = sep ?? detectSeparator(text);
  const rows: string[][] = [];
  if (text === '') return { ok: true, rows, sep: separator, warnings: [] };

  let row: string[] = [];
  let field = '';
  let i = 0;
  let line = 1;
  let quoteLine = 0;
  let inQuotes = false;
  let atFieldStart = true;

  const endField = () => {
    row.push(field);
    field = '';
    atFieldStart = true;
  };
  const endRow = () => {
    endField();
    rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      if (c === '\r' || c === '\n') {
        line++;
        if (c === '\r' && text[i + 1] === '\n') {
          field += '\r\n';
          i += 2;
          continue;
        }
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"' && atFieldStart) {
      inQuotes = true;
      quoteLine = line;
      atFieldStart = false;
      i++;
      continue;
    }
    if (c === separator) {
      endField();
      i++;
      continue;
    }
    if (c === '\r' || c === '\n') {
      endRow();
      line++;
      i += c === '\r' && text[i + 1] === '\n' ? 2 : 1;
      continue;
    }
    field += c;
    atFieldStart = false;
    i++;
  }
  if (inQuotes) return { ok: false, line: quoteLine, reason: 'unclosed-quote' };
  // A final line break does not open an empty last row.
  const last = text[text.length - 1];
  if (last !== '\n' && last !== '\r') endRow();

  const warnings: CsvWarning[] = [];
  const expected = rows[0]?.length ?? 0;
  rows.forEach((r, k) => {
    if (k > 0 && r.length !== expected) warnings.push({ row: k + 1, columns: r.length, expected });
  });
  return { ok: true, rows, sep: separator, warnings };
}
