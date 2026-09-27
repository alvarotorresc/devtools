import { parseAllDocuments, stringify } from 'yaml';
import { parseCsv, toCsv, type CsvWarning } from '../../lib/csv';
import { parseJson } from '../json/logic';

export type Format = 'json' | 'yaml' | 'csv';
export type InputFormat = 'auto' | Format;
export type Sep = ',' | ';' | '\t';

export interface CsvReadOptions {
  /** First row as keys → array of objects; otherwise an array of arrays. */
  header: boolean;
  /** Numbers without leading zeros, true/false and empty cells (null). */
  detectTypes: boolean;
}

export type ReadResult =
  | {
      ok: true;
      value: unknown;
      format: Format;
      /** Detected CSV separator. */
      sep?: Sep;
      /** YAML with several `---` documents: read as an array. */
      documents?: number;
      csvWarnings?: CsvWarning[];
    }
  | { ok: false; format: Format; line: number | null; column: number | null; message: string };

export type WriteResult =
  { ok: true; text: string; dottedKeys: boolean } | { ok: false; error: 'not-table' };

export const DEBOUNCE_THRESHOLD = 100_000;
const NUMBER = /^-?(0|[1-9]\d*)(\.\d+)?$/;

/** Spec order: JSON if it parses, CSV if at least two rows share a field count, else YAML. */
export function detectFormat(text: string): { format: Format; sep?: Sep } {
  const t = text.trim();
  if (t.startsWith('{') || t.startsWith('[')) {
    try {
      JSON.parse(t);
      return { format: 'json' };
    } catch {
      // Not JSON: YAML flow collections also start like this.
    }
  }
  const firstLine = t.split(/\r?\n/, 1)[0] ?? '';
  if (/[,;\t]/.test(firstLine)) {
    const csv = parseCsv(t);
    if (csv.ok && csv.rows.length >= 2 && csv.rows[0].length >= 2) {
      const width = csv.rows[0].length;
      if (csv.rows.slice(1).some((r) => r.length === width)) {
        return { format: 'csv', sep: csv.sep };
      }
    }
  }
  return { format: 'yaml' };
}

function cell(v: string, detect: boolean): unknown {
  if (!detect) return v;
  if (v === '') return null;
  if (NUMBER.test(v)) return Number(v);
  if (v === 'true') return true;
  if (v === 'false') return false;
  return v;
}

export function readInput(text: string, format: InputFormat, csv: CsvReadOptions): ReadResult {
  const detected = format === 'auto' ? detectFormat(text) : { format };
  if (detected.format === 'json') {
    const r = parseJson(text);
    return r.ok
      ? { ok: true, value: r.value, format: 'json' }
      : { ok: false, format: 'json', ...r.error };
  }
  if (detected.format === 'yaml') {
    const docs = parseAllDocuments(text, { merge: true });
    const list = Array.isArray(docs) ? docs : [];
    for (const doc of list) {
      const err = doc.errors[0];
      if (err) {
        const pos = err.linePos?.[0];
        return {
          ok: false,
          format: 'yaml',
          line: pos?.line ?? null,
          column: pos?.col ?? null,
          message: err.message.split('\n')[0].replace(/ at line \d+, column \d+:?$/, ''),
        };
      }
    }
    const values = list.map((d) => d.toJS({ maxAliasCount: 1000 }) as unknown);
    if (values.length > 1)
      return { ok: true, value: values, format: 'yaml', documents: values.length };
    return { ok: true, value: values[0] ?? null, format: 'yaml' };
  }
  const r = parseCsv(text, 'sep' in detected ? detected.sep : undefined);
  if (!r.ok) {
    return { ok: false, format: 'csv', line: r.line, column: null, message: r.reason };
  }
  let value: unknown;
  if (csv.header && r.rows.length) {
    const [head, ...body] = r.rows;
    value = body.map((row) => {
      // Object.create(null): a "__proto__" header must become a real key, not set the
      // prototype (M4). A plain `{}` would otherwise silently drop that column.
      const obj: Record<string, unknown> = Object.create(null);
      head.forEach((k, i) => (obj[k] = cell(row[i] ?? '', csv.detectTypes)));
      return obj;
    });
  } else {
    value = r.rows.map((row) => row.map((c) => cell(c, csv.detectTypes)));
  }
  return { ok: true, value, format: 'csv', sep: r.sep, csvWarnings: r.warnings };
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

type Cell = string | number | boolean | null;

function toCell(v: unknown): Cell {
  if (v === null || v === undefined) return null;
  if (typeof v === 'object') return JSON.stringify(v);
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
  return String(v);
}

/** Nested objects become dotted keys; arrays stay whole (they go into the cell as JSON). */
function flatten(
  obj: Record<string, unknown>,
  prefix = '',
  // Object.create(null): a "__proto__" key (e.g. from JSON input) must land as a real column,
  // not set the prototype (M4). `out[key] = v` below is a plain bracket assignment, which is
  // unsafe on a `{}` literal even though `JSON.parse` itself never triggers the setter.
  out: Record<string, unknown> = Object.create(null),
) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (isObj(v) && Object.keys(v).length) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

export function toCsvText(value: unknown, sep: Sep): WriteResult {
  const rows = isObj(value) ? [value] : value;
  if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: 'not-table' };
  if (rows.every(Array.isArray)) {
    return {
      ok: true,
      text: toCsv(
        rows.map((r) => r.map(toCell)),
        sep,
      ),
      dottedKeys: false,
    };
  }
  if (!rows.every(isObj)) return { ok: false, error: 'not-table' };
  const flat = rows.map((r) => flatten(r));
  const columns: string[] = [];
  const seen = new Set<string>();
  for (const r of flat) {
    for (const k of Object.keys(r)) {
      if (!seen.has(k)) {
        seen.add(k);
        columns.push(k);
      }
    }
  }
  const dottedKeys = rows.some((r) => Object.keys(r).some((k) => k.includes('.')));
  const table: Cell[][] = [columns, ...flat.map((r) => columns.map((c) => toCell(r[c])))];
  return { ok: true, text: toCsv(table, sep), dottedKeys };
}

export function writeOutput(value: unknown, format: Format, sep: Sep): WriteResult {
  if (format === 'json') {
    return { ok: true, text: JSON.stringify(value, null, 2) ?? 'null', dottedKeys: false };
  }
  if (format === 'yaml') {
    return { ok: true, text: stringify(value, { indent: 2, lineWidth: 0 }), dottedKeys: false };
  }
  return toCsvText(value, sep);
}

export function shouldDebounce(text: string): boolean {
  return text.length > DEBOUNCE_THRESHOLD;
}
