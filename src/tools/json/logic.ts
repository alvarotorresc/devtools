export type Indent = '2' | '4' | 'tab';
export type JsonType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

export interface JsonError {
  message: string;
  line: number | null;
  column: number | null;
}

export type ParseResult = { ok: true; value: unknown } | { ok: false; error: JsonError };

export const DEBOUNCE_THRESHOLD = 100_000;

export function locate(input: string, position: number): { line: number; column: number } {
  const before = input.slice(0, Math.max(0, Math.min(position, input.length)));
  const lines = before.split('\n');
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

const NUMBER_TOKEN = /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/y;

export function firstInvalidIndex(input: string): number | null {
  let i = 0;
  while (i < input.length) {
    const c = input[i];
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      i++;
      continue;
    }
    if (c === '"') {
      let j = i + 1;
      let closed = false;
      while (j < input.length) {
        if (input[j] === '\\') {
          j += 2;
          continue;
        }
        if (input[j] === '"') {
          closed = true;
          j++;
          break;
        }
        j++;
      }
      if (!closed) return i;
      i = j;
      continue;
    }
    if (input.startsWith('true', i)) {
      i += 4;
      continue;
    }
    if (input.startsWith('false', i)) {
      i += 5;
      continue;
    }
    if (input.startsWith('null', i)) {
      i += 4;
      continue;
    }
    NUMBER_TOKEN.lastIndex = i;
    const m = NUMBER_TOKEN.exec(input);
    if (m && m[0].length > 0) {
      i += m[0].length;
      continue;
    }
    if (c === '{' || c === '}' || c === '[' || c === ']' || c === ':' || c === ',') {
      i++;
      continue;
    }
    return i;
  }
  return null;
}

export function errorLocation(
  message: string,
  input: string,
): { line: number; column: number } | null {
  const msg = message.replace(/,\s*".*"\s+is not valid JSON\s*$/s, '');
  const lc = /line (\d+) column (\d+)/i.exec(msg);
  if (lc) return { line: Number(lc[1]), column: Number(lc[2]) };
  const pos = /position (\d+)/i.exec(msg);
  if (pos) return locate(input, Number(pos[1]));
  if (/unexpected end/i.test(msg)) return locate(input, input.length);
  if (/Unexpected token/.test(msg)) {
    const idx = firstInvalidIndex(input);
    return idx === null ? null : locate(input, idx);
  }
  return null;
}

export function parseJson(input: string): ParseResult {
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (e) {
    const message = (e as Error).message;
    const loc = errorLocation(message, input);
    return { ok: false, error: { message, line: loc?.line ?? null, column: loc?.column ?? null } };
  }
}

export function sortKeysDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeysDeep);
  if (v !== null && typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(obj)
        .sort()
        .map((k) => [k, sortKeysDeep(obj[k])]),
    );
  }
  return v;
}

export function formatJson(value: unknown, indent: Indent = '2', sortKeys = false): string {
  const space = indent === 'tab' ? '\t' : Number(indent);
  return JSON.stringify(sortKeys ? sortKeysDeep(value) : value, null, space);
}

export function minifyJson(value: unknown, sortKeys = false): string {
  return JSON.stringify(sortKeys ? sortKeysDeep(value) : value);
}

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export function jsonPath(parent: string, key: string | number): string {
  if (typeof key === 'number') return `${parent}[${key}]`;
  return IDENTIFIER.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`;
}

export function jsonType(v: unknown): JsonType {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v as JsonType;
}

export function lineAt(input: string, line: number): string {
  return input.split('\n')[line - 1] ?? '';
}

export function lineOffset(input: string, line: number): number {
  return input
    .split('\n')
    .slice(0, Math.max(0, line - 1))
    .reduce((acc, l) => acc + l.length + 1, 0);
}

export function byteSize(s: string): number {
  return new TextEncoder().encode(s).length;
}

export function shouldDebounce(input: string): boolean {
  return input.length > DEBOUNCE_THRESHOLD;
}
