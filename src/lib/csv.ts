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
