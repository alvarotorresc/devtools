import { bytesToBase64, utf8 } from '../../lib/bytes';
import type { Locale } from '../types';

export type TokenizeResult =
  { ok: true; tokens: string[] } | { ok: false; error: 'unclosed-quote' | 'windows' };

export interface FormField {
  name: string;
  value: string;
  /** `name=@file` or `name=<file`: fetch cannot read files from disk. */
  file: boolean;
}

export interface CurlRequest {
  url: string;
  method: string;
  headers: [string, string][];
  body: string | null;
  form: FormField[] | null;
  referrer: string | null;
  timeoutSeconds: number | null;
}

export type CurlWarning =
  | { kind: 'unknown-option'; option: string }
  | { kind: 'data-file'; file: string }
  | { kind: 'form-file'; name: string; file: string }
  | { kind: 'user-agent' }
  | { kind: 'cookie' }
  | { kind: 'insecure' }
  | { kind: 'duplicate-header'; name: string }
  | { kind: 'bad-header'; text: string }
  | { kind: 'extra-argument'; text: string }
  | { kind: 'no-scheme' };

export type CurlError =
  | 'empty'
  | 'unclosed-quote'
  | 'windows'
  | 'not-curl'
  | 'no-url'
  | { kind: 'missing-value'; option: string }
  | { kind: 'bad-timeout'; value: string };

export type ParseResult =
  { ok: true; request: CurlRequest; warnings: CurlWarning[] } | { ok: false; error: CurlError };

const ANSI_ESCAPES: Record<string, string> = {
  n: '\n',
  t: '\t',
  r: '\r',
  '\\': '\\',
  "'": "'",
  '"': '"',
};

/**
 * Splits a bash command line the way the shell would: quotes, `$'…'`, backslashes and
 * `\` + line break continuations. Windows `cmd` quoting (`^"`) is rejected on purpose.
 */
export function tokenize(input: string): TokenizeResult {
  if (/\^"|\^\r?\n/.test(input)) return { ok: false, error: 'windows' };
  const tokens: string[] = [];
  let current = '';
  let inToken = false;
  let i = 0;
  const n = input.length;
  while (i < n) {
    const c = input[i];
    if (c === '\\' && (input[i + 1] === '\n' || (input[i + 1] === '\r' && input[i + 2] === '\n'))) {
      i += input[i + 1] === '\r' ? 3 : 2;
      continue;
    }
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      if (inToken) tokens.push(current);
      current = '';
      inToken = false;
      i++;
      continue;
    }
    inToken = true;
    if (c === "'") {
      const end = input.indexOf("'", i + 1);
      if (end === -1) return { ok: false, error: 'unclosed-quote' };
      current += input.slice(i + 1, end);
      i = end + 1;
    } else if (c === '$' && input[i + 1] === "'") {
      i += 2;
      let closed = false;
      while (i < n) {
        const d = input[i];
        if (d === "'") {
          closed = true;
          i++;
          break;
        }
        if (d === '\\' && i + 1 < n) {
          const e = input[i + 1];
          if (e in ANSI_ESCAPES) {
            current += ANSI_ESCAPES[e];
            i += 2;
          } else if (e === 'x' && /^[0-9a-fA-F]{1,2}/.test(input.slice(i + 2))) {
            const hex = /^[0-9a-fA-F]{1,2}/.exec(input.slice(i + 2))![0];
            current += String.fromCharCode(parseInt(hex, 16));
            i += 2 + hex.length;
          } else if (e === 'u' && /^[0-9a-fA-F]{4}/.test(input.slice(i + 2))) {
            current += String.fromCharCode(parseInt(input.slice(i + 2, i + 6), 16));
            i += 6;
          } else {
            current += d + e;
            i += 2;
          }
          continue;
        }
        current += d;
        i++;
      }
      if (!closed) return { ok: false, error: 'unclosed-quote' };
    } else if (c === '"') {
      i++;
      let closed = false;
      while (i < n) {
        const d = input[i];
        if (d === '"') {
          closed = true;
          i++;
          break;
        }
        if (d === '\\' && i + 1 < n) {
          const e = input[i + 1];
          if (e === '\n') {
            i += 2;
            continue;
          }
          if (e === '"' || e === '\\' || e === '$' || e === '`') {
            current += e;
            i += 2;
            continue;
          }
        }
        current += d;
        i++;
      }
      if (!closed) return { ok: false, error: 'unclosed-quote' };
    } else if (c === '\\' && i + 1 < n) {
      current += input[i + 1];
      i += 2;
    } else {
      current += c;
      i++;
    }
  }
  if (inToken) tokens.push(current);
  return { ok: true, tokens };
}

type Option =
  | 'request'
  | 'header'
  | 'data'
  | 'data-raw'
  | 'data-urlencode'
  | 'json'
  | 'form'
  | 'user'
  | 'user-agent'
  | 'referer'
  | 'cookie'
  | 'url'
  | 'max-time'
  | 'get'
  | 'head'
  | 'insecure'
  | 'silent-value'
  | 'silent-flag'
  | 'ignored-value';

const LONG: Record<string, Option> = {
  '--request': 'request',
  '--header': 'header',
  '--data': 'data',
  '--data-ascii': 'data',
  '--data-binary': 'data',
  '--data-raw': 'data-raw',
  '--data-urlencode': 'data-urlencode',
  '--json': 'json',
  '--form': 'form',
  '--user': 'user',
  '--user-agent': 'user-agent',
  '--referer': 'referer',
  '--cookie': 'cookie',
  '--url': 'url',
  '--max-time': 'max-time',
  '--get': 'get',
  '--head': 'head',
  '--insecure': 'insecure',
  '--output': 'silent-value',
  '--location': 'silent-flag',
  '--compressed': 'silent-flag',
  '--silent': 'silent-flag',
  '--show-error': 'silent-flag',
  '--verbose': 'silent-flag',
  '--include': 'silent-flag',
  // Not for fetch, but they take a value: skip it too so it is not read as the URL.
  '--connect-timeout': 'ignored-value',
  '--retry': 'ignored-value',
  '--write-out': 'ignored-value',
  '--proxy': 'ignored-value',
  '--cacert': 'ignored-value',
  '--cert': 'ignored-value',
  '--key': 'ignored-value',
  '--cookie-jar': 'ignored-value',
  '--upload-file': 'ignored-value',
};

const SHORT: Record<string, Option> = {
  X: 'request',
  H: 'header',
  d: 'data',
  F: 'form',
  u: 'user',
  A: 'user-agent',
  e: 'referer',
  b: 'cookie',
  m: 'max-time',
  G: 'get',
  I: 'head',
  k: 'insecure',
  o: 'silent-value',
  L: 'silent-flag',
  s: 'silent-flag',
  S: 'silent-flag',
  v: 'silent-flag',
  i: 'silent-flag',
  w: 'ignored-value',
  x: 'ignored-value',
  c: 'ignored-value',
  T: 'ignored-value',
};

const TAKES_VALUE = new Set<Option>([
  'request',
  'header',
  'data',
  'data-raw',
  'data-urlencode',
  'json',
  'form',
  'user',
  'user-agent',
  'referer',
  'cookie',
  'url',
  'max-time',
  'silent-value',
  'ignored-value',
]);

function encodeUrlencoded(value: string): string {
  const eq = value.indexOf('=');
  if (eq > 0) return `${value.slice(0, eq)}=${encodeURIComponent(value.slice(eq + 1))}`;
  return encodeURIComponent(eq === 0 ? value.slice(1) : value);
}

export function parseCurl(input: string): ParseResult {
  if (!input.trim()) return { ok: false, error: 'empty' };
  const tok = tokenize(input);
  if (!tok.ok) return { ok: false, error: tok.error };
  const [first, ...args] = tok.tokens;
  if (!/^(?:.*\/)?curl(?:\.exe)?$/.test(first ?? '')) return { ok: false, error: 'not-curl' };

  const warnings: CurlWarning[] = [];
  const headers = new Map<string, [string, string]>();
  const data: string[] = [];
  // Written from inside apply(): `as` stops TypeScript from narrowing them to their initial value.
  let form = null as FormField[] | null;
  let url = null as string | null;
  let method = null as string | null;
  let head = false as boolean;
  let get = false as boolean;
  let json = false as boolean;
  let referrer = null as string | null;
  let timeoutSeconds = null as number | null;

  const setHeader = (name: string, value: string, warnIfRepeated = true) => {
    const key = name.toLowerCase();
    if (headers.has(key) && warnIfRepeated) warnings.push({ kind: 'duplicate-header', name });
    headers.set(key, [name, value]);
  };

  const apply = (opt: Option, value: string, flag: string): CurlError | null => {
    switch (opt) {
      case 'request':
        method = value.toUpperCase();
        break;
      case 'header': {
        const colon = value.indexOf(':');
        if (colon > 0) setHeader(value.slice(0, colon).trim(), value.slice(colon + 1).trim());
        else if (value.endsWith(';')) setHeader(value.slice(0, -1).trim(), '');
        else warnings.push({ kind: 'bad-header', text: value });
        break;
      }
      case 'data':
        if (value.startsWith('@')) warnings.push({ kind: 'data-file', file: value.slice(1) });
        data.push(value);
        break;
      case 'data-raw':
        data.push(value);
        break;
      case 'data-urlencode':
        data.push(encodeUrlencoded(value));
        break;
      case 'json':
        json = true;
        data.push(value);
        break;
      case 'form': {
        const eq = value.indexOf('=');
        const name = eq === -1 ? value : value.slice(0, eq);
        const raw = eq === -1 ? '' : value.slice(eq + 1);
        const file = raw.startsWith('@') || raw.startsWith('<');
        if (file) warnings.push({ kind: 'form-file', name, file: raw.slice(1) });
        (form ??= []).push({ name, value: file ? raw.slice(1) : raw, file });
        break;
      }
      case 'user':
        setHeader('Authorization', `Basic ${bytesToBase64(utf8(value))}`);
        break;
      case 'user-agent':
        setHeader('User-Agent', value);
        warnings.push({ kind: 'user-agent' });
        break;
      case 'referer':
        referrer = value;
        break;
      case 'cookie':
        setHeader('Cookie', value);
        warnings.push({ kind: 'cookie' });
        break;
      case 'url':
        if (url === null) url = value;
        else warnings.push({ kind: 'extra-argument', text: value });
        break;
      case 'max-time': {
        const seconds = Number(value);
        if (!Number.isFinite(seconds) || seconds <= 0) return { kind: 'bad-timeout', value };
        timeoutSeconds = seconds;
        break;
      }
      case 'get':
        get = true;
        break;
      case 'head':
        head = true;
        break;
      case 'insecure':
        warnings.push({ kind: 'insecure' });
        break;
      case 'ignored-value':
        warnings.push({ kind: 'unknown-option', option: flag });
        break;
      case 'silent-value':
      case 'silent-flag':
        break;
    }
    return null;
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--') && arg.length > 2) {
      const opt = LONG[arg];
      if (!opt) {
        warnings.push({ kind: 'unknown-option', option: arg });
        continue;
      }
      let value = '';
      if (TAKES_VALUE.has(opt)) {
        if (i + 1 >= args.length)
          return { ok: false, error: { kind: 'missing-value', option: arg } };
        value = args[++i];
      }
      const err = apply(opt, value, arg);
      if (err) return { ok: false, error: err };
    } else if (arg.startsWith('-') && arg.length > 1) {
      // Short options: grouped flags (-sSL) and attached values (-XPOST, -H'…').
      for (let k = 1; k < arg.length; k++) {
        const letter = arg[k];
        const opt = SHORT[letter];
        if (!opt) {
          warnings.push({ kind: 'unknown-option', option: `-${letter}` });
          continue;
        }
        let value = '';
        if (TAKES_VALUE.has(opt)) {
          value = arg.slice(k + 1);
          if (!value) {
            if (i + 1 >= args.length) {
              return { ok: false, error: { kind: 'missing-value', option: `-${letter}` } };
            }
            value = args[++i];
          }
          k = arg.length;
        }
        const err = apply(opt, value, `-${letter}`);
        if (err) return { ok: false, error: err };
      }
    } else if (url === null) {
      url = arg;
    } else {
      warnings.push({ kind: 'extra-argument', text: arg });
    }
  }

  if (!url) return { ok: false, error: 'no-url' };
  let finalUrl = url;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(finalUrl)) {
    finalUrl = `http://${finalUrl}`;
    warnings.push({ kind: 'no-scheme' });
  }

  let body: string | null = data.length ? data.join('&') : null;
  if (get && body !== null) {
    finalUrl += (finalUrl.includes('?') ? '&' : '?') + body;
    body = null;
  }
  if (json) {
    if (!headers.has('content-type')) setHeader('Content-Type', 'application/json', false);
    if (!headers.has('accept')) setHeader('Accept', 'application/json', false);
  } else if (body !== null && !headers.has('content-type')) {
    // What curl itself sends with -d.
    setHeader('Content-Type', 'application/x-www-form-urlencoded', false);
  }
  // The browser writes multipart's Content-Type itself, with the boundary.
  if (form) headers.delete('content-type');

  const finalMethod = method ?? (head ? 'HEAD' : !get && (body !== null || form) ? 'POST' : 'GET');

  return {
    ok: true,
    warnings,
    request: {
      url: finalUrl,
      method: finalMethod,
      headers: [...headers.values()],
      body,
      form,
      referrer,
      timeoutSeconds,
    },
  };
}

/** A JavaScript single-quoted string literal. */
export function jsString(s: string): string {
  const escaped = s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return `'${escaped}'`;
}

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function jsKey(s: string): string {
  return IDENTIFIER.test(s) ? s : jsString(s);
}

const FILE_COMMENT: Record<Locale, string> = {
  es: 'fetch no puede leer archivos del disco: usa un File de un <input type="file">',
  en: 'fetch cannot read files from disk: use a File from an <input type="file">',
};

/** `const response = await fetch(url, { … })`, leaving out every default. */
export function toFetch(req: CurlRequest, locale: Locale): string {
  const lines: string[] = [];
  if (req.form) {
    lines.push('const form = new FormData();');
    for (const f of req.form) {
      if (f.file) {
        lines.push(`// ${f.value}: ${FILE_COMMENT[locale]}`);
        lines.push(`form.append(${jsString(f.name)}, file);`);
      } else {
        lines.push(`form.append(${jsString(f.name)}, ${jsString(f.value)});`);
      }
    }
    lines.push('');
  }

  const opts: string[] = [];
  if (req.method !== 'GET') opts.push(`  method: ${jsString(req.method)},`);
  if (req.headers.length) {
    opts.push('  headers: {');
    for (const [name, value] of req.headers) opts.push(`    ${jsKey(name)}: ${jsString(value)},`);
    opts.push('  },');
  }
  if (req.form) {
    opts.push('  body: form,');
  } else if (req.body !== null) {
    const type = req.headers.find(([n]) => n.toLowerCase() === 'content-type')?.[1] ?? '';
    let parsed: unknown;
    let isJson = false;
    if (/json/i.test(type)) {
      try {
        parsed = JSON.parse(req.body);
        isJson = true;
      } catch {
        isJson = false;
      }
    }
    if (isJson) {
      const pretty = JSON.stringify(parsed, null, 2).replace(/\n/g, '\n  ');
      opts.push(`  body: JSON.stringify(${pretty}),`);
    } else {
      opts.push(`  body: ${jsString(req.body)},`);
    }
  }
  if (req.referrer !== null) opts.push(`  referrer: ${jsString(req.referrer)},`);
  if (req.timeoutSeconds !== null) {
    opts.push(`  signal: AbortSignal.timeout(${Math.round(req.timeoutSeconds * 1000)}),`);
  }

  const call = opts.length
    ? `const response = await fetch(${jsString(req.url)}, {\n${opts.join('\n')}\n});`
    : `const response = await fetch(${jsString(req.url)});`;
  lines.push(call);
  return lines.join('\n');
}
