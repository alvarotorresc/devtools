export type Direction = 'auto' | 'toJson' | 'toQuery';

export interface ParseOptions {
  /** a[b]=1 → { a: { b: "1" } } and a[]=1 → { a: ["1"] }. */
  brackets: boolean;
  /** Numbers without leading zeros and true/false become JSON numbers and booleans. */
  detectTypes: boolean;
}

export interface QueryResult {
  /** Built with Object.create(null): "__proto__" is just another key. */
  value: Record<string, unknown>;
  /** Every pair, already decoded, in order. */
  pairs: [string, string][];
  /** Percent sequences that could not be decoded and were left as they are. */
  undecodable: string[];
}

export type ToQueryResult = { ok: true; query: string } | { ok: false; error: 'not-object' };

type Obj = Record<string, unknown>;

const NUMBER = /^-?(0|[1-9]\d*)(\.\d+)?$/;
const SENSITIVE = /token|secret|password|passwd|pwd|api[_-]?key|auth|signature|sig|session/i;

export function detectDirection(input: string): 'toJson' | 'toQuery' {
  return input.trimStart().startsWith('{') ? 'toQuery' : 'toJson';
}

/** The query part of a full URL, of "…?query" or of a bare query, without the #fragment. */
export function extractQuery(input: string): string {
  let s = input.trim();
  const hash = s.indexOf('#');
  if (hash !== -1) s = s.slice(0, hash);
  const q = s.indexOf('?');
  if (q !== -1) return s.slice(q + 1);
  // A URL without "?" has no query at all.
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(s) ? '' : s;
}

function decodePart(raw: string, undecodable: string[]): string {
  const s = raw.replace(/\+/g, ' ');
  try {
    return decodeURIComponent(s);
  } catch {
    // Decode each run of %XX on its own and leave the broken ones as they are.
    return s.replace(/(?:%[0-9A-Fa-f]{2})+/g, (run) => {
      try {
        return decodeURIComponent(run);
      } catch {
        undecodable.push(run);
        return run;
      }
    });
  }
}

function typed(v: string, detect: boolean): unknown {
  if (!detect) return v;
  if (NUMBER.test(v)) return Number(v);
  if (v === 'true') return true;
  if (v === 'false') return false;
  return v;
}

const isObj = (v: unknown): v is Obj => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Adds a value at a key: a repeated key turns into an array, in order. */
function addValue(target: Obj, key: string, value: unknown): void {
  if (!Object.hasOwn(target, key)) target[key] = value;
  else if (Array.isArray(target[key])) (target[key] as unknown[]).push(value);
  else target[key] = [target[key], value];
}

const BRACKETS = /^([^[\]]+)((?:\[[^[\]]*\])+)$/;

/** Places `a[b][]=v`; returns false when it clashes with what is already there. */
function setPath(root: Obj, key: string, value: unknown): boolean {
  const m = BRACKETS.exec(key);
  if (!m) return false;
  const path = [m[1], ...[...m[2].matchAll(/\[([^[\]]*)\]/g)].map((x) => x[1])];
  let node: Obj = root;
  for (let i = 0; i < path.length - 1; i++) {
    const seg = path[i];
    const next = path[i + 1];
    if (seg === '') return false;
    if (next === '') {
      // "a[]" must be the last segment.
      if (i + 1 !== path.length - 1) return false;
      const current = node[seg];
      if (current === undefined) node[seg] = [value];
      else if (Array.isArray(current)) current.push(value);
      else return false;
      return true;
    }
    if (!Object.hasOwn(node, seg)) node[seg] = Object.create(null) as Obj;
    const child = node[seg];
    if (!isObj(child)) return false;
    node = child;
  }
  const last = path[path.length - 1];
  if (Object.hasOwn(node, last) && isObj(node[last])) return false;
  addValue(node, last, value);
  return true;
}

export function queryToJson(input: string, opts: ParseOptions): QueryResult {
  const value = Object.create(null) as Obj;
  const pairs: [string, string][] = [];
  const undecodable: string[] = [];
  for (const part of extractQuery(input).split('&')) {
    if (!part) continue;
    const eq = part.indexOf('=');
    const key = decodePart(eq === -1 ? part : part.slice(0, eq), undecodable);
    const val = decodePart(eq === -1 ? '' : part.slice(eq + 1), undecodable);
    pairs.push([key, val]);
    const v = typed(val, opts.detectTypes);
    if (opts.brackets && key.includes('[') && setPath(value, key, v)) continue;
    // No brackets, brackets off, or a clash: the key is taken literally.
    if (Object.hasOwn(value, key) && isObj(value[key])) {
      value[key] = [value[key], v];
    } else {
      addValue(value, key, v);
    }
  }
  return { value, pairs, undecodable };
}

export interface BuildOptions {
  brackets: boolean;
  plusForSpace: boolean;
}

function encodeKey(k: string): string {
  return encodeURIComponent(k);
}

export function jsonToQuery(value: unknown, opts: BuildOptions): ToQueryResult {
  if (!isObj(value)) return { ok: false, error: 'not-object' };
  const out: string[] = [];
  const enc = (s: string) => {
    const e = encodeURIComponent(s);
    return opts.plusForSpace ? e.replace(/%20/g, '+') : e;
  };
  const emit = (key: string, v: unknown) => {
    if (v === null || v === undefined) out.push(`${key}=`);
    else if (Array.isArray(v)) {
      for (const item of v) {
        const k = opts.brackets ? `${key}[]` : key;
        // Objects and arrays inside arrays have no standard form: they travel as JSON.
        emit(k, typeof item === 'object' && item !== null ? JSON.stringify(item) : item);
      }
    } else if (isObj(v)) {
      for (const [k, sub] of Object.entries(v)) emit(`${key}[${encodeKey(k)}]`, sub);
    } else {
      out.push(`${key}=${enc(String(v))}`);
    }
  };
  for (const [k, v] of Object.entries(value)) emit(encodeKey(k), v);
  return { ok: true, query: out.join('&') };
}

function jsonKeys(v: unknown, keys: string[], depth = 0): void {
  if (depth > 50 || v === null || typeof v !== 'object') return;
  if (Array.isArray(v)) {
    for (const item of v) jsonKeys(item, keys, depth + 1);
    return;
  }
  for (const [k, sub] of Object.entries(v)) {
    keys.push(k);
    jsonKeys(sub, keys, depth + 1);
  }
}

/** True when some key looks like a credential: then the input is not saved. */
export function hasSensitiveKey(input: string): boolean {
  let keys: string[];
  if (detectDirection(input) === 'toQuery') {
    keys = [];
    try {
      jsonKeys(JSON.parse(input), keys);
    } catch {
      // Half-typed JSON: look at anything that could be a key.
      keys = [...input.matchAll(/"([^"]*)"\s*:/g)].map((m) => m[1]);
    }
  } else {
    keys = queryToJson(input, { brackets: false, detectTypes: false }).pairs.map(([k]) => k);
  }
  return keys.some((k) => SENSITIVE.test(k));
}
