export type UrlMode = 'component' | 'uri';
export type Direction = 'encode' | 'decode';
export type DirectionMode = 'auto' | Direction;
export type ConvertResult =
  | { ok: true; direction: Direction; output: string }
  | { ok: false; direction: 'decode'; error: 'malformed' };

export function encodeUrl(text: string, mode: UrlMode = 'component'): string {
  return mode === 'component' ? encodeURIComponent(text) : encodeURI(text);
}

/** Throws URIError on malformed sequences such as "%E0%A4%A". */
export function decodeUrl(text: string, mode: UrlMode = 'component', plusAsSpace = false): string {
  const s = plusAsSpace ? text.replace(/\+/g, ' ') : text;
  return mode === 'component' ? decodeURIComponent(s) : decodeURI(s);
}

const ESCAPE = /%[0-9A-Fa-f]{2}/;

/** "decode" when the text contains at least one %XX escape; otherwise "encode". */
export function detectDirection(input: string): Direction {
  return ESCAPE.test(input) ? 'decode' : 'encode';
}

export function convert(
  input: string,
  mode: DirectionMode,
  urlMode: UrlMode,
  plusAsSpace = false,
): ConvertResult {
  const direction = mode === 'auto' ? detectDirection(input) : mode;
  if (direction === 'encode') return { ok: true, direction, output: encodeUrl(input, urlMode) };
  try {
    return { ok: true, direction, output: decodeUrl(input, urlMode, plusAsSpace) };
  } catch {
    return { ok: false, direction, error: 'malformed' };
  }
}

export interface ParsedUrl {
  href: string;
  protocol: string;
  username: string;
  password: string;
  hostname: string;
  port: string;
  defaultPort: string;
  pathname: string;
  search: string;
  hash: string;
  params: [string, string][];
  assumedScheme: boolean;
}

const DEFAULT_PORTS: Record<string, string> = {
  'http:': '80',
  'https:': '443',
  'ws:': '80',
  'wss:': '443',
  'ftp:': '21',
};

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

// "localhost:3000" is a host and port, not a scheme.
const SCHEME = /^[a-z][a-z0-9+.-]*:(?!\d)/i;

/** Parses a URL. Without a scheme ("example.com/a?b=1") it assumes https://. */
export function parseUrl(input: string): ParsedUrl | null {
  const raw = input.trim();
  if (!raw) return null;
  const assumedScheme = !SCHEME.test(raw);
  let url: URL;
  try {
    url = new URL(assumedScheme ? `https://${raw}` : raw);
  } catch {
    return null;
  }
  return {
    href: url.href,
    protocol: url.protocol,
    username: safeDecode(url.username),
    password: url.password ? '•'.repeat(url.password.length) : '',
    hostname: url.hostname,
    port: url.port,
    defaultPort: DEFAULT_PORTS[url.protocol] ?? '',
    pathname: safeDecode(url.pathname),
    search: url.search,
    hash: safeDecode(url.hash),
    params: [...url.searchParams.entries()],
    assumedScheme,
  };
}
