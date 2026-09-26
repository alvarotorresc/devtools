export type IdKind = 'v4' | 'v7' | 'ulid' | 'nanoid';
export type RandomBytes = (n: number) => Uint8Array;
export type Detection =
  | { kind: 'uuid'; version: number; date: Date | null }
  | { kind: 'nil' }
  | { kind: 'max' }
  | { kind: 'ulid'; date: Date }
  | { kind: 'invalid' };

export const MAX_COUNT = 500;

export const NANOID_ALPHABETS = {
  urlsafe: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-',
  alnum: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  hex: '0123456789abcdef',
  numbers: '0123456789',
} as const;

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export const randomBytes: RandomBytes = (n) => crypto.getRandomValues(new Uint8Array(n));

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
const withDashes = (h: string) =>
  `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;

export function uuidV4(rand: RandomBytes = randomBytes): string {
  const b = rand(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  return withDashes(toHex(b));
}

export function uuidV7(now: number = Date.now(), rand: RandomBytes = randomBytes): string {
  const b = new Uint8Array(16);
  let t = now;
  for (let i = 5; i >= 0; i--) {
    b[i] = t % 256;
    t = Math.floor(t / 256);
  }
  const r = rand(10);
  b[6] = 0x70 | (r[0] & 0x0f);
  b[7] = r[1];
  b[8] = 0x80 | (r[2] & 0x3f);
  b.set(r.subarray(3, 10), 9);
  return withDashes(toHex(b));
}

export function ulid(now: number = Date.now(), rand: RandomBytes = randomBytes): string {
  let t = now;
  let time = '';
  for (let i = 0; i < 10; i++) {
    time = CROCKFORD[t % 32] + time;
    t = Math.floor(t / 32);
  }
  let bits = 0;
  let value = 0;
  let random = '';
  for (const byte of rand(10)) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      random += CROCKFORD[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
    value &= (1 << bits) - 1;
  }
  return time + random;
}

export function nanoid(
  size = 21,
  alphabet: string = NANOID_ALPHABETS.urlsafe,
  rand: RandomBytes = randomBytes,
): string {
  if (!Number.isInteger(size) || size < 1) throw new RangeError('Size must be a positive integer');
  if (alphabet.length < 2 || alphabet.length > 256)
    throw new RangeError('Alphabet must have 2-256 symbols');
  const mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1;
  const step = Math.ceil((1.6 * mask * size) / alphabet.length);
  let id = '';
  for (;;) {
    const bytes = rand(step);
    for (let i = 0; i < step; i++) {
      const idx = bytes[i] & mask;
      if (idx < alphabet.length) {
        id += alphabet[idx];
        if (id.length === size) return id;
      }
    }
  }
}

export function formatId(
  id: string,
  kind: IdKind,
  opts: { uppercase: boolean; dashes: boolean },
): string {
  if (kind !== 'v4' && kind !== 'v7') return id;
  const s = opts.dashes ? id : id.replace(/-/g, '');
  return opts.uppercase ? s.toUpperCase() : s.toLowerCase();
}

export function generate(
  kind: IdKind,
  count: number,
  opts: { size: number; alphabet: string },
): string[] {
  const n = Math.min(MAX_COUNT, Math.max(1, Math.floor(count) || 1));
  const size = Math.min(64, Math.max(2, Math.floor(opts.size) || 21));
  const make = {
    v4: () => uuidV4(),
    v7: () => uuidV7(),
    ulid: () => ulid(),
    nanoid: () => nanoid(size, opts.alphabet),
  }[kind];
  return Array.from({ length: n }, make);
}

function ulidTime(s: string): number {
  let t = 0;
  for (const ch of s.slice(0, 10).toUpperCase()) t = t * 32 + CROCKFORD.indexOf(ch);
  return t;
}

const DASHED = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function detectId(raw: string): Detection {
  const s = raw.trim();
  const compact = s.replace(/-/g, '');
  if (/^[0-9a-f]{32}$/i.test(compact) && (s.length === 32 || DASHED.test(s))) {
    if (/^0+$/.test(compact)) return { kind: 'nil' };
    if (/^f+$/i.test(compact)) return { kind: 'max' };
    const version = parseInt(compact[12], 16);
    if (version < 1 || version > 8 || !/^[89ab]$/i.test(compact[16])) return { kind: 'invalid' };
    const date = version === 7 ? new Date(parseInt(compact.slice(0, 12), 16)) : null;
    return { kind: 'uuid', version, date };
  }
  if (/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i.test(s))
    return { kind: 'ulid', date: new Date(ulidTime(s)) };
  return { kind: 'invalid' };
}

export function validateUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export function formatUUID(uuid: string, withDashesFlag: boolean): string {
  const clean = uuid.replace(/-/g, '');
  if (!/^[0-9a-f]{32}$/i.test(clean)) return uuid;
  return withDashesFlag ? withDashes(clean) : clean;
}
