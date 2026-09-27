/** Returns a uniform unsigned 32-bit integer, in [0, 2^32). */
export type Rng = () => number;

const TWO_32 = 2 ** 32;
const BUFFER = 256;

/** Browser or Node randomness through crypto.getRandomValues, 256 values per call. */
export function cryptoRng(): Rng {
  const buf = new Uint32Array(BUFFER);
  let i = BUFFER;
  return () => {
    if (i === BUFFER) {
      crypto.getRandomValues(buf);
      i = 0;
    }
    return buf[i++];
  };
}

function fnv1a(text: string): number {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(text)) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/** Deterministic: FNV-1a (32 bits) over the UTF-8 of the seed, then mulberry32. */
export function seededRng(seed: string): Rng {
  let a = fnv1a(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (t ^ (t >>> 14)) >>> 0;
  };
}

/** The seed is trimmed; an empty or missing seed means real randomness. */
export function rngFromSeed(seed: string | undefined): Rng {
  const s = seed?.trim() ?? '';
  return s ? seededRng(s) : cryptoRng();
}

/** A fresh random seed, for tools that keep one per session and re-roll it on "Generate". */
export function randomSeed(): string {
  return cryptoRng()().toString(36);
}

/** Uniform integer in [min, max], both included, without modulo bias (rejection sampling). */
export function randInt(rng: Rng, min: number, max: number): number {
  if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
    throw new RangeError(`Invalid range [${min}, ${max}]`);
  }
  const range = max - min + 1;
  if (range > TWO_32) throw new RangeError('The range cannot exceed 2^32 values');
  const limit = TWO_32 - (TWO_32 % range);
  let x = rng();
  while (x >= limit) x = rng();
  return min + (x % range);
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  if (items.length === 0) throw new RangeError('Cannot pick from an empty list');
  return items[randInt(rng, 0, items.length - 1)];
}

/** Fisher–Yates over a copy: the input is never mutated. */
export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** `n` random digits 0–9; leading zeros are allowed. */
export function digits(rng: Rng, n: number): string {
  let out = '';
  for (let i = 0; i < n; i++) out += String(randInt(rng, 0, 9));
  return out;
}

/** Adapter to the `RandomBytes` signature of `uuid/logic.ts`: 4 bytes per rng() call. */
export function randomBytesFrom(rng: Rng): (n: number) => Uint8Array {
  return (n) => {
    const out = new Uint8Array(n);
    for (let i = 0; i < n; i += 4) {
      const x = rng();
      for (let k = 0; k < 4 && i + k < n; k++) out[i + k] = (x >>> (8 * k)) & 0xff;
    }
    return out;
  };
}
