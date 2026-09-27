import { pick, shuffle, type Rng } from '../../lib/random';

export const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  // The 32 printable ASCII symbols.
  symbols: '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
} as const;

export type SetName = keyof typeof SETS;

/** Characters that are easy to confuse when reading a password aloud or on paper. */
export const AMBIGUOUS = '0Oo1lI|';

export const MIN_LENGTH = 4;
export const MAX_LENGTH = 128;
export const MAX_COUNT = 50;

export interface PasswordOptions {
  length: number;
  count: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export const DEFAULT_OPTIONS: PasswordOptions = {
  length: 20,
  count: 1,
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
};

export type PasswordError = { kind: 'no-sets' } | { kind: 'too-short'; sets: number };

export type Strength = 'weak' | 'fair' | 'strong';

const NAMES: SetName[] = ['lower', 'upper', 'digits', 'symbols'];

/** The active character sets, without the ambiguous characters when they are excluded. */
export function activeSets(opts: PasswordOptions): string[] {
  return NAMES.filter((n) => opts[n]).map((n) =>
    opts.excludeAmbiguous ? [...SETS[n]].filter((c) => !AMBIGUOUS.includes(c)).join('') : SETS[n],
  );
}

export function validate(opts: PasswordOptions): PasswordError | null {
  const sets = activeSets(opts);
  if (sets.length === 0) return { kind: 'no-sets' };
  if (opts.length < sets.length) return { kind: 'too-short', sets: sets.length };
  return null;
}

/**
 * One character from each active set, the rest from their union, then shuffled.
 * The page always passes cryptoRng(): a seeded, reproducible password would not be secret.
 */
export function generatePassword(rng: Rng, opts: PasswordOptions): string {
  const sets = activeSets(opts);
  if (validate(opts)) throw new RangeError('invalid password options');
  const all = [...sets.join('')];
  const chars = sets.map((set) => pick(rng, [...set]));
  while (chars.length < opts.length) chars.push(pick(rng, all));
  return shuffle(rng, chars).join('');
}

/** E = L × log2(|charset|). The "one of each kind" rule lowers it only very slightly. */
export function entropyBits(opts: PasswordOptions): number {
  const size = activeSets(opts).join('').length;
  return size === 0 ? 0 : opts.length * Math.log2(size);
}

export function strength(bits: number): Strength {
  if (bits < 50) return 'weak';
  if (bits < 80) return 'fair';
  return 'strong';
}

/** Options read back from storage: anything malformed falls back to the defaults. */
export function sanitizeOptions(raw: unknown): PasswordOptions {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const int = (v: unknown, min: number, max: number, fallback: number) =>
    typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max ? v : fallback;
  const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
  return {
    length: int(o.length, MIN_LENGTH, MAX_LENGTH, DEFAULT_OPTIONS.length),
    count: int(o.count, 1, MAX_COUNT, DEFAULT_OPTIONS.count),
    lower: bool(o.lower, DEFAULT_OPTIONS.lower),
    upper: bool(o.upper, DEFAULT_OPTIONS.upper),
    digits: bool(o.digits, DEFAULT_OPTIONS.digits),
    symbols: bool(o.symbols, DEFAULT_OPTIONS.symbols),
    excludeAmbiguous: bool(o.excludeAmbiguous, DEFAULT_OPTIONS.excludeAmbiguous),
  };
}
