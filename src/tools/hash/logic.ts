import { toHex, utf8 } from '../../lib/bytes';

export type Algorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
export type Hashes = Record<Algorithm, string>;

export const ALGORITHMS: Algorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
export const MAX_FILE_BYTES = 200 * 1024 * 1024;
export const DEBOUNCE_THRESHOLD = 20_000;

// MD5 (RFC 1321). Per-round shift amounts and the sine-derived constants.
const SHIFTS = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
const K = Array.from(
  { length: 64 },
  (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0,
);

export function md5(input: Uint8Array | string): string {
  const bytes = typeof input === 'string' ? utf8(input) : input;
  const len = bytes.length;
  const total = Math.ceil((len + 9) / 64) * 64;
  const buf = new Uint8Array(total);
  buf.set(bytes);
  buf[len] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(total - 8, (len * 8) >>> 0, true);
  view.setUint32(total - 4, Math.floor(len / 0x20000000), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;
  const M = new Uint32Array(16);

  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) M[i] = view.getUint32(off + i * 4, true);
    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;
    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      const s = SHIFTS[(i >> 4) * 4 + (i % 4)];
      const sum = (A + F + K[i] + M[g]) | 0;
      A = D;
      D = C;
      C = B;
      B = (B + ((sum << s) | (sum >>> (32 - s)))) | 0;
    }
    a0 = (a0 + A) | 0;
    b0 = (b0 + B) | 0;
    c0 = (c0 + C) | 0;
    d0 = (d0 + D) | 0;
  }

  const out = new DataView(new ArrayBuffer(16));
  [a0, b0, c0, d0].forEach((v, i) => out.setUint32(i * 4, v, true));
  return toHex(new Uint8Array(out.buffer));
}

export async function computeHash(
  algorithm: Algorithm,
  data: Uint8Array | string,
): Promise<string> {
  const bytes = typeof data === 'string' ? utf8(data) : data;
  if (algorithm === 'MD5') return md5(bytes);
  return toHex(
    new Uint8Array(await crypto.subtle.digest(algorithm, bytes as Uint8Array<ArrayBuffer>)),
  );
}

export async function hashAll(data: Uint8Array | string): Promise<Hashes> {
  const bytes = typeof data === 'string' ? utf8(data) : data;
  const values = await Promise.all(ALGORITHMS.map((a) => computeHash(a, bytes)));
  return Object.fromEntries(ALGORITHMS.map((a, i) => [a, values[i]])) as Hashes;
}

/** Lowercase hex without spaces, colons or a "0x" prefix. */
export function normalizeHex(s: string): string {
  return s
    .trim()
    .replace(/^0x/i, '')
    .replace(/[\s:-]/g, '')
    .toLowerCase();
}

/** The algorithm whose hash equals `expected`, or null. */
export function findMatch(expected: string, hashes: Hashes): Algorithm | null {
  const want = normalizeHex(expected);
  if (!want) return null;
  return ALGORITHMS.find((a) => hashes[a] === want) ?? null;
}

export function shouldDebounce(size: number): boolean {
  return size > DEBOUNCE_THRESHOLD;
}
