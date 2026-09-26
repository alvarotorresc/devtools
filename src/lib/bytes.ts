const CHUNK = 0x8000;

export function utf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

/** With `fatal`, throws a TypeError when the bytes are not valid UTF-8. */
export function fromUtf8(bytes: Uint8Array, fatal = false): string {
  return new TextDecoder('utf-8', { fatal }).decode(bytes);
}

export function toHex(bytes: Uint8Array): string {
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

export function bytesToBase64(bytes: Uint8Array, urlSafe = false): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  const b64 = btoa(bin);
  return urlSafe ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b64;
}

/**
 * Accepts standard and URL-safe Base64, with or without padding, spaces or line breaks.
 * Returns standard padded Base64, or null when it cannot be valid Base64.
 */
export function normalizeBase64(input: string): string | null {
  const s = input.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(s)) return null;
  const body = s.replace(/=+$/, '');
  if (body.length % 4 === 1) return null;
  if (s.length !== body.length && s.length % 4 !== 0) return null;
  return body + '='.repeat((4 - (body.length % 4)) % 4);
}

export function base64ToBytes(input: string): Uint8Array | null {
  const s = normalizeBase64(input);
  if (s === null) return null;
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
