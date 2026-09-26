export type Unit = 's' | 'ms';
export type UnitMode = 'auto' | Unit;

/** Largest date JavaScript can represent: ±8.64e15 ms from the epoch. */
export const MAX_MS = 8.64e15;

/**
 * Seconds or milliseconds? Anything at or above 1e11 is read as milliseconds:
 * 1e11 seconds would be the year 5138, while 1e11 ms is March 1973.
 */
export function detectUnit(value: number): Unit {
  return Math.abs(value) >= 1e11 ? 'ms' : 's';
}

export function parseTimestamp(
  input: string,
  mode: UnitMode = 'auto',
): { ms: number; unit: Unit } | null {
  const s = input.trim().replace(/[_\s]/g, '');
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  const unit = mode === 'auto' ? detectUnit(n) : mode;
  const ms = Math.round(unit === 's' ? n * 1000 : n);
  return Math.abs(ms) > MAX_MS ? null : { ms, unit };
}

/** Like Date.UTC, but years 0-99 stay as they are (Date.UTC maps them to 1900-1999). */
function utc(y: number, mo: number, d: number, h: number, mi: number, s: number, ms = 0): number {
  const date = new Date(Date.UTC(2000, 0, 1, h, mi, s, ms));
  date.setUTCFullYear(y, mo - 1, d);
  return date.getTime();
}

const partsFormatter = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = partsFormatter.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    partsFormatter.set(timeZone, f);
  }
  return f;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    formatterFor(timeZone);
    return true;
  } catch {
    return false;
  }
}

/** Offset of `timeZone` from UTC at instant `ms`, in minutes (Madrid in summer → 120). */
export function tzOffsetMinutes(ms: number, timeZone: string): number | null {
  if (!Number.isFinite(new Date(ms).getTime())) return null;
  const parts = Object.fromEntries(
    formatterFor(timeZone)
      .formatToParts(new Date(ms))
      .map((p) => [p.type, p.value]),
  );
  const asUtc = utc(
    Number(parts.year),
    Number(parts.month),
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  // Near the edge of the Date range the zone's wall clock may not be representable in UTC, and
  // BC years come back without their era; real offsets always stay within a day.
  const minutes = Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60_000);
  return Number.isFinite(minutes) && Math.abs(minutes) < 24 * 60 ? minutes : null;
}

export function formatOffset(minutes: number | null): string | null {
  if (minutes === null || !Number.isFinite(minutes)) return null;
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

/** Converts a wall-clock time in `timeZone` to a UTC instant (ms). */
export function zonedToUtc(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  s: number,
  msPart: number,
  timeZone: string,
): number | null {
  const guess = utc(y, mo, d, h, mi, s, msPart);
  const off1 = tzOffsetMinutes(guess, timeZone);
  if (off1 === null) return null;
  const first = guess - off1 * 60_000;
  const off2 = tzOffsetMinutes(first, timeZone);
  return off2 === null ? null : guess - off2 * 60_000;
}

const WALL_CLOCK = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/;

/**
 * Parses a date. "2024-01-15 12:00" (no offset) is read in `timeZone`;
 * anything else must end in "Z" or "±hh:mm" and is taken as is.
 */
export function parseDate(input: string, timeZone: string): number | null {
  const s = input.trim();
  if (!s) return null;
  const m = WALL_CLOCK.exec(s);
  if (m) {
    const [y, mo, d, h = 0, mi = 0, sec = 0] = m
      .slice(1, 7)
      .map((v) => (v === undefined ? 0 : Number(v)));
    const msPart = m[7] ? Number(m[7].padEnd(3, '0')) : 0;
    if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || sec > 59) return null;
    // Round trip: 2024-02-30 would roll over to 1 March, so the day must survive unchanged.
    const day = new Date(utc(y, mo, d, 0, 0, 0));
    if (day.getUTCFullYear() !== y || day.getUTCMonth() + 1 !== mo || day.getUTCDate() !== d)
      return null;
    return zonedToUtc(y, mo, d, h, mi, sec, msPart, timeZone);
  }
  // Other formats only when they carry their own offset; otherwise Date.parse would silently
  // read them in the browser's zone instead of the chosen one.
  if (!/(?:Z|[+-]\d{2}:\d{2})$/i.test(s)) return null;
  const ms = Date.parse(s);
  return Number.isNaN(ms) ? null : ms;
}

/** "2026-09-26 14:05:09" in the given zone (for the date field and the "Local" row). */
export function wallClock(ms: number, timeZone: string): string {
  const p = Object.fromEntries(
    formatterFor(timeZone)
      .formatToParts(new Date(ms))
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
}

export function listTimeZones(current: string): string[] {
  let zones: string[] = [];
  try {
    zones = Intl.supportedValuesOf('timeZone');
  } catch {
    zones = [];
  }
  // The list can miss "UTC" and the browser's own zone when it is an alias (e.g. "Europe/Kiev").
  const set = new Set(zones);
  set.add('UTC');
  if (current) set.add(current);
  return [...set].sort();
}
