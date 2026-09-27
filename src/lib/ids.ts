// Helpers shared by the Identifiers tools (lote 1). Pure: no DOM, no storage.

/** Validators accept up to this many values, one per line. */
export const MAX_LINES = 1000;
/** Generators make 1–500 values, 10 by default. */
export const MAX_QUANTITY = 500;
export const DEFAULT_QUANTITY = 10;

/** The control letters of the DNI, NIE and the K, L and M NIF: `DNI_LETTERS[n mod 23]`. */
export const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

export function dniLetter(n: number): string {
  return DNI_LETTERS[n % 23];
}

/** Upper case, without spaces, dashes, dots or slashes: `12.345.678-z` → `12345678Z`. */
export function compactId(raw: string): string {
  return raw.toUpperCase().replace(/[\s.\-/]/g, '');
}

/** Non-empty trimmed lines, at most `max`; `truncated` says whether some were dropped. */
export function splitLines(text: string, max = MAX_LINES): { lines: string[]; truncated: boolean } {
  const all = text
    .split(/\r\n|\r|\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return { lines: all.slice(0, max), truncated: all.length > max };
}

/** 1–500; anything that is not a number becomes the default. */
export function clampQuantity(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_QUANTITY;
  return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(n)));
}

/** Calls `make` `clampQuantity(n)` times. */
export function repeat<T>(n: number, make: () => T): T[] {
  return Array.from({ length: clampQuantity(n) }, make);
}
