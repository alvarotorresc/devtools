export const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';
export const MIN_BASE = 2;
export const MAX_BASE = 36;

/** True for a whole number from 2 to 36, the radixes that BigInt#toString accepts. */
export function isValidBase(b: unknown): b is number {
  return typeof b === 'number' && Number.isInteger(b) && b >= MIN_BASE && b <= MAX_BASE;
}

const PREFIXES: Record<number, RegExp> = { 2: /^0b/i, 8: /^0o/i, 16: /^0x/i };

/**
 * Parses an integer of any size in `base` (2–36). Ignores spaces and "_" (digit grouping),
 * accepts a leading "-" and the prefixes 0b, 0o and 0x in their own base.
 * Returns null when a digit does not belong to the base.
 */
export function parseBigInt(value: string, base: number): bigint | null {
  if (!Number.isInteger(base) || base < MIN_BASE || base > MAX_BASE) return null;
  let s = value.trim().replace(/[\s_]/g, '').toLowerCase();
  let negative = false;
  if (s.startsWith('-')) {
    negative = true;
    s = s.slice(1);
  }
  if (PREFIXES[base]) s = s.replace(PREFIXES[base], '');
  if (!s) return null;
  const b = BigInt(base);
  let n = 0n;
  for (const ch of s) {
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= base) return null;
    n = n * b + BigInt(d);
  }
  return negative ? -n : n;
}

export function formatBigInt(n: bigint, base: number, uppercase = false): string {
  const s = n.toString(base);
  return uppercase ? s.toUpperCase() : s;
}

/** Groups digits from the right: 11111111 → "1111 1111". Keeps a leading "-". */
export function groupDigits(s: string, size: number, sep = ' '): string {
  if (size <= 0) return s;
  const negative = s.startsWith('-');
  const digits = negative ? s.slice(1) : s;
  const groups: string[] = [];
  for (let end = digits.length; end > 0; end -= size)
    groups.unshift(digits.slice(Math.max(0, end - size), end));
  return (negative ? '-' : '') + groups.join(sep);
}

/** Nibbles for binary and hex, thousands for decimal, triplets for octal. */
export function groupSizeFor(base: number): number {
  return base === 10 || base === 8 ? 3 : 4;
}

export function bitLength(n: bigint): number {
  const abs = n < 0n ? -n : n;
  return abs === 0n ? 1 : abs.toString(2).length;
}

/** Legacy API (kept with its tests): four common bases, hexadecimal in upper case. */
export function convertBase(
  value: string,
  fromBase: number,
): { Binary: string; Octal: string; Decimal: string; Hex: string } | null {
  const n = parseBigInt(value, fromBase);
  if (n === null) return null;
  return {
    Binary: formatBigInt(n, 2),
    Octal: formatBigInt(n, 8),
    Decimal: formatBigInt(n, 10),
    Hex: formatBigInt(n, 16, true),
  };
}
