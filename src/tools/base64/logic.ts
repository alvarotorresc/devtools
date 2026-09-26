import { base64ToBytes, bytesToBase64, fromUtf8, utf8 } from '../../lib/bytes';

export type Direction = 'encode' | 'decode';
export type DirectionMode = 'auto' | Direction;
export type DecodeError = 'invalid' | 'binary';
export type ConvertResult =
  | { ok: true; direction: Direction; output: string }
  | { ok: false; direction: 'decode'; error: DecodeError };

export const MAX_FILE_BYTES = 20 * 1024 * 1024;

export function encodeBase64(text: string, urlSafe = false): string {
  return bytesToBase64(utf8(text), urlSafe);
}

/** Throws when the input is not Base64 or does not decode to UTF-8 text. */
export function decodeBase64(encoded: string): string {
  const bytes = base64ToBytes(encoded);
  if (!bytes) throw new Error('Invalid Base64');
  return fromUtf8(bytes, true);
}

/** Control characters other than tab, line feed and carriage return: a sign of binary data. */
function hasControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if ((c < 32 && c !== 9 && c !== 10 && c !== 13) || c === 127) return true;
  }
  return false;
}

/**
 * "decode" only when the input is Base64 AND decodes to readable UTF-8 text.
 * Plain words such as "hola" or "test" use Base64 letters but decode to garbage,
 * so they stay on "encode".
 */
export function detectDirection(input: string): Direction {
  const compact = input.replace(/\s+/g, '');
  if (compact.length < 4) return 'encode';
  const bytes = base64ToBytes(compact);
  if (!bytes || bytes.length === 0) return 'encode';
  try {
    const text = fromUtf8(bytes, true);
    return hasControlChars(text) ? 'encode' : 'decode';
  } catch {
    return 'encode';
  }
}

export function convert(input: string, mode: DirectionMode, urlSafe = false): ConvertResult {
  const direction = mode === 'auto' ? detectDirection(input) : mode;
  if (direction === 'encode') return { ok: true, direction, output: encodeBase64(input, urlSafe) };
  const bytes = base64ToBytes(input);
  if (!bytes) return { ok: false, direction, error: 'invalid' };
  try {
    return { ok: true, direction, output: fromUtf8(bytes, true) };
  } catch {
    return { ok: false, direction, error: 'binary' };
  }
}

export function toDataUri(bytes: Uint8Array, mime: string): string {
  return `data:${mime || 'application/octet-stream'};base64,${bytesToBase64(bytes)}`;
}

/** Accepts a data URI (`data:image/png;base64,...`) or bare Base64. */
export function parseBase64Payload(
  input: string,
): { bytes: Uint8Array; mime: string | null } | null {
  const m = /^\s*data:([^;,]*)(?:;[^,]*)?;base64,(.*)$/is.exec(input);
  const bytes = base64ToBytes(m ? m[2] : input);
  if (!bytes || bytes.length === 0) return null;
  return { bytes, mime: m?.[1] || sniffMime(bytes) };
}

const SIGNATURES: [number[], string][] = [
  [[0x89, 0x50, 0x4e, 0x47], 'image/png'],
  [[0xff, 0xd8, 0xff], 'image/jpeg'],
  [[0x47, 0x49, 0x46, 0x38], 'image/gif'],
  [[0x25, 0x50, 0x44, 0x46], 'application/pdf'],
  [[0x50, 0x4b, 0x03, 0x04], 'application/zip'],
  [[0x1f, 0x8b], 'application/gzip'],
];

export function sniffMime(bytes: Uint8Array): string | null {
  for (const [sig, mime] of SIGNATURES) {
    if (sig.every((b, i) => bytes[i] === b)) return mime;
  }
  const riff = String.fromCharCode(...bytes.subarray(0, 4));
  const webp = String.fromCharCode(...bytes.subarray(8, 12));
  if (riff === 'RIFF' && webp === 'WEBP') return 'image/webp';
  const head = String.fromCharCode(...bytes.subarray(0, 64)).trimStart();
  if (head.startsWith('<svg') || (head.startsWith('<?xml') && head.includes('<svg')))
    return 'image/svg+xml';
  return null;
}

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'application/gzip': 'gz',
  'application/json': 'json',
  'text/plain': 'txt',
};

export function extensionFor(mime: string | null): string {
  return (mime && EXTENSIONS[mime]) || 'bin';
}

export function formatBytes(n: number, locale: string): string {
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB'];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toLocaleString(locale, { maximumFractionDigits: 1 })} ${units[i]}`;
}
