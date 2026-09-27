import { parseDecimal } from '../../lib/numbers';
import type { Locale } from '../types';

/** Bytes per unit. Case matters: B is a byte and b is a bit. */
export const UNIT_BYTES: Record<string, number> = {
  B: 1,
  kB: 1e3,
  KB: 1e3,
  MB: 1e6,
  GB: 1e9,
  TB: 1e12,
  PB: 1e15,
  KiB: 2 ** 10,
  MiB: 2 ** 20,
  GiB: 2 ** 30,
  TiB: 2 ** 40,
  PiB: 2 ** 50,
  b: 1 / 8,
  kb: 1e3 / 8,
  Kb: 1e3 / 8,
  Mb: 1e6 / 8,
  Gb: 1e9 / 8,
};

export const SI_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'];
export const IEC_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
/** Above this many bytes, integers can no longer be represented exactly as doubles. */
const MAX_SAFE_BYTES = Number.MAX_SAFE_INTEGER;

export type SizeResult =
  | {
      ok: true;
      bytes: number;
      unit: string;
      /** "KB" was typed: it is read as kB (SI), but Windows means KiB. */
      windowsKb: boolean;
      /** Above Number.MAX_SAFE_INTEGER (2^53 - 1) bytes the byte count is no longer exact. */
      approximate: boolean;
    }
  | { ok: false; reason: 'empty' | 'number' | 'negative' }
  | { ok: false; reason: 'unit'; unit: string };

/** "1.5 GB", "1,5 GiB", "750 MB", "1024" (bytes) or "100 Mb" (bits). */
export function parseSize(input: string, locale: Locale): SizeResult {
  const s = input.trim();
  if (!s) return { ok: false, reason: 'empty' };
  const m = /^(.*?)\s*([A-Za-z]*)$/.exec(s)!;
  const unit = m[2] || 'B';
  const factor = UNIT_BYTES[unit];
  if (factor === undefined) return { ok: false, reason: 'unit', unit };
  const n = parseDecimal(m[1], locale);
  if (n === null) return { ok: false, reason: 'number' };
  if (n < 0) return { ok: false, reason: 'negative' };
  const bytes = n * factor;
  return {
    ok: true,
    bytes,
    unit,
    windowsKb: unit === 'KB',
    approximate: bytes > MAX_SAFE_BYTES,
  };
}

/** Removes floating-point noise without losing exact byte counts. */
function clean(x: number): number {
  return Number(x.toPrecision(12));
}

/** The B row is always the untouched byte count: rounding to 12 significant digits would
 * corrupt any exact value with 13+ digits (e.g. 1 TiB → …780 instead of …776). */
export function inUnits(bytes: number, units: string[]): { unit: string; value: number }[] {
  return units.map((unit) => ({
    unit,
    value: unit === 'B' ? bytes : clean(bytes / UNIT_BYTES[unit]),
  }));
}

/** Fractions of a byte only matter for tiny sizes. Past this, the division that produced
 * `bytes` can leave floating-point noise (1.1 PB → …000.125): round it away instead of
 * showing it as if it were part of the exact count. */
const MAX_FRACTIONAL_BYTES = 2 ** 32;

function exactDigits(bytes: number, locale: Locale, useGrouping: boolean): string {
  const hasFraction = bytes < MAX_FRACTIONAL_BYTES && !Number.isInteger(bytes);
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: hasFraction ? 3 : 0,
    useGrouping,
  }).format(bytes);
}

/** The exact byte count as grouped digits, never scientific notation, however large. Sub-byte
 * values keep up to 3 decimals; larger byte counts show none. */
export function formatExactBytes(bytes: number, locale: Locale): string {
  return exactDigits(bytes, locale, true);
}

/** Same value with no thousands grouping, for copying the literal digits. */
export function formatExactBytesPlain(bytes: number, locale: Locale): string {
  return exactDigits(bytes, locale, false);
}

/** The largest unit that gives at least 1, rounded to one decimal: 1.5 GB → 1.4 GiB. Rounding
 * can push the value up to the next unit's base (1024 KiB), so it is then promoted (1 MiB). */
export function humanSize(bytes: number, system: 'si' | 'iec'): { value: number; unit: string } {
  const units = system === 'si' ? SI_UNITS : IEC_UNITS;
  const base = system === 'si' ? 1000 : 1024;
  let index = 0;
  for (let i = 0; i < units.length; i++) if (bytes >= UNIT_BYTES[units[i]]) index = i;
  let unit = units[index];
  const round = (u: string) =>
    u === 'B' ? clean(bytes / UNIT_BYTES[u]) : Math.round((bytes / UNIT_BYTES[u]) * 10) / 10;
  let value = round(unit);
  if (value >= base && index < units.length - 1) {
    index += 1;
    unit = units[index];
    value = round(unit);
  }
  return { value, unit };
}
