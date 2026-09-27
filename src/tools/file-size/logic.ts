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
const MAX_SAFE_BYTES = 2 ** 53;

export type SizeResult =
  | {
      ok: true;
      bytes: number;
      unit: string;
      /** "KB" was typed: it is read as kB (SI), but Windows means KiB. */
      windowsKb: boolean;
      /** Above 2^53 bytes the byte count is no longer exact. */
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

export function inUnits(bytes: number, units: string[]): { unit: string; value: number }[] {
  return units.map((unit) => ({ unit, value: clean(bytes / UNIT_BYTES[unit]) }));
}

/** The largest unit that gives at least 1, rounded to one decimal: 1.5 GB → 1.4 GiB. */
export function humanSize(bytes: number, system: 'si' | 'iec'): { value: number; unit: string } {
  const units = system === 'si' ? SI_UNITS : IEC_UNITS;
  let unit = units[0];
  for (const u of units) if (bytes >= UNIT_BYTES[u]) unit = u;
  const value = bytes / UNIT_BYTES[unit];
  return { value: unit === 'B' ? clean(value) : Math.round(value * 10) / 10, unit };
}
