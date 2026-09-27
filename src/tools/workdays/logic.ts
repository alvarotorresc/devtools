const DAY_MS = 86_400_000;
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;
/** 100 years, leap days included. */
export const MAX_SPAN_DAYS = 36_525;

export interface YMD {
  y: number;
  m: number;
  d: number;
}

/** Days since 1970-01-01 in UTC, so DST changes never add or remove a day. */
export function dayNumber({ y, m, d }: YMD): number {
  return Date.UTC(y, m - 1, d) / DAY_MS;
}

export function fromDayNumber(n: number): YMD {
  const date = new Date(n * DAY_MS);
  return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() };
}

export function toIso({ y, m, d }: YMD): string {
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** "2026-01-31" → { y, m, d }; null if it is not a real date. */
export function parseIsoDate(s: string): YMD | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const ymd = { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
  const back = fromDayNumber(dayNumber(ymd));
  return back.y === ymd.y && back.m === ymd.m && back.d === ymd.d ? ymd : null;
}

/** 0 = Sunday … 6 = Saturday. 1970-01-01 was a Thursday; the double modulo handles days before 1970. */
export function weekday(day: number): number {
  return (((day + 4) % 7) + 7) % 7;
}

/** Easter Sunday, anonymous Gregorian algorithm (Meeus/Jones/Butcher). */
export function easterSunday(year: number): YMD {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = h + l - 7 * m + 114;
  return { y: year, m: Math.floor(n / 31), d: (n % 31) + 1 };
}

export type HolidayKey =
  | 'newYear'
  | 'epiphany'
  | 'goodFriday'
  | 'labour'
  | 'assumption'
  | 'nationalDay'
  | 'allSaints'
  | 'constitution'
  | 'immaculate'
  | 'christmas';

const FIXED: [number, number, HolidayKey][] = [
  [1, 1, 'newYear'],
  [1, 6, 'epiphany'],
  [5, 1, 'labour'],
  [8, 15, 'assumption'],
  [10, 12, 'nationalDay'],
  [11, 1, 'allSaints'],
  [12, 6, 'constitution'],
  [12, 8, 'immaculate'],
  [12, 25, 'christmas'],
];

export interface Holiday {
  day: number;
  key: HolidayKey;
}

/** National holidays common to all of Spain, sorted by date. Good Friday = Easter − 2 days. */
export function nationalHolidays(year: number): Holiday[] {
  const list = FIXED.map(([m, d, key]) => ({ day: dayNumber({ y: year, m, d }), key }));
  list.push({ day: dayNumber(easterSunday(year)) - 2, key: 'goodFriday' });
  return list.sort((a, b) => a.day - b.day);
}

export interface Counts {
  /** The dates were given in reverse order and have been swapped. */
  swapped: boolean;
  natural: number;
  weeks: number;
  extraDays: number;
  /** Monday to Friday. */
  weekdays: number;
  /** Monday to Friday, minus national holidays. */
  business: number;
  weekend: number;
  holidays: { day: number; key: HolidayKey; weekday: number; onWeekend: boolean }[];
}

export type CountResult =
  ({ ok: true } & Counts) | { ok: false; reason: 'invalid' | 'years' | 'tooLong' };

/**
 * Counts the days in [start, end] (or [start, end) without the last day). The same set of
 * days is used for every count.
 */
export function countDays(start: string, end: string, includeEnd: boolean): CountResult {
  let a = parseIsoDate(start);
  let b = parseIsoDate(end);
  if (!a || !b) return { ok: false, reason: 'invalid' };
  if ([a.y, b.y].some((y) => y < MIN_YEAR || y > MAX_YEAR)) return { ok: false, reason: 'years' };
  let first = dayNumber(a);
  let last = dayNumber(b);
  const swapped = last < first;
  if (swapped) {
    [first, last] = [last, first];
    [a, b] = [b, a];
  }
  if (last - first > MAX_SPAN_DAYS) return { ok: false, reason: 'tooLong' };
  const stop = includeEnd ? last : last - 1;

  const holidayKeys = new Map<number, HolidayKey>();
  for (let y = a.y; y <= b.y; y++) {
    for (const h of nationalHolidays(y)) holidayKeys.set(h.day, h.key);
  }

  let weekdays = 0;
  let business = 0;
  const holidays: Counts['holidays'] = [];
  for (let day = first; day <= stop; day++) {
    const wd = weekday(day);
    const onWeekend = wd === 0 || wd === 6;
    const key = holidayKeys.get(day);
    if (key) holidays.push({ day, key, weekday: wd, onWeekend });
    if (!onWeekend) {
      weekdays++;
      if (!key) business++;
    }
  }
  const natural = Math.max(0, stop - first + 1);
  return {
    ok: true,
    swapped,
    natural,
    weeks: Math.floor(natural / 7),
    extraDays: natural % 7,
    weekdays,
    business,
    weekend: natural - weekdays,
    holidays,
  };
}
