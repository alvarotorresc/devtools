import { describe, expect, it } from 'vitest';
import {
  countDays,
  dayNumber,
  easterSunday,
  nationalHolidays,
  parseIsoDate,
  toIso,
  weekday,
  fromDayNumber,
} from './logic';

const count = (start: string, end: string, includeEnd = true) => {
  const r = countDays(start, end, includeEnd);
  if (!r.ok) throw new Error(r.reason);
  return r;
};

describe('calendar arithmetic', () => {
  it('knows the day of the week before and after 1970', () => {
    expect(weekday(dayNumber({ y: 1970, m: 1, d: 1 }))).toBe(4); // Thursday
    expect(weekday(dayNumber({ y: 1900, m: 1, d: 1 }))).toBe(1); // Monday
    expect(weekday(dayNumber({ y: 2026, m: 9, d: 27 }))).toBe(0); // Sunday
    expect(weekday(dayNumber({ y: 2100, m: 12, d: 31 }))).toBe(5); // Friday
  });

  it('parses only real dates', () => {
    expect(parseIsoDate('2026-01-31')).toEqual({ y: 2026, m: 1, d: 31 });
    expect(parseIsoDate('2024-02-29')).toEqual({ y: 2024, m: 2, d: 29 });
    expect(parseIsoDate('2026-02-29')).toBeNull();
    expect(parseIsoDate('31/01/2026')).toBeNull();
    expect(toIso(fromDayNumber(dayNumber({ y: 1905, m: 3, d: 7 })))).toBe('1905-03-07');
  });
});

describe('Easter and Good Friday', () => {
  it('matches known Easter Sundays', () => {
    const iso = (y: number) => toIso(easterSunday(y));
    expect(iso(2024)).toBe('2024-03-31');
    expect(iso(2025)).toBe('2025-04-20');
    expect(iso(2026)).toBe('2026-04-05');
    expect(iso(2027)).toBe('2027-03-28');
    expect(iso(2038)).toBe('2038-04-25');
    expect(iso(2285)).toBe('2285-03-22');
  });

  it('puts Good Friday two days before Easter', () => {
    const gf = nationalHolidays(2026).find((h) => h.key === 'goodFriday')!;
    expect(toIso(fromDayNumber(gf.day))).toBe('2026-04-03');
    expect(weekday(gf.day)).toBe(5);
  });

  it('has the 10 national holidays in date order', () => {
    const list = nationalHolidays(2026).map((h) => toIso(fromDayNumber(h.day)));
    expect(list).toEqual([
      '2026-01-01',
      '2026-01-06',
      '2026-04-03',
      '2026-05-01',
      '2026-08-15',
      '2026-10-12',
      '2026-11-01',
      '2026-12-06',
      '2026-12-08',
      '2026-12-25',
    ]);
  });
});

describe('countDays', () => {
  it('counts January 2026: 31 days, 20 business days', () => {
    const r = count('2026-01-01', '2026-01-31');
    expect(r).toMatchObject({ natural: 31, weeks: 4, extraDays: 3, weekdays: 22, business: 20 });
    expect(r.weekend).toBe(9);
    expect(r.holidays.map((h) => h.key)).toEqual(['newYear', 'epiphany']);
  });

  it('counts April 2026 (Good Friday) and the whole of 2026', () => {
    expect(count('2026-04-01', '2026-04-30').business).toBe(21);
    const year = count('2026-01-01', '2026-12-31');
    expect(year.natural).toBe(365);
    expect(year.business).toBe(254);
  });

  it('marks holidays that fall on a weekend and does not subtract them twice', () => {
    const r = count('2026-11-01', '2026-11-01');
    expect(r.holidays).toEqual([
      { day: dayNumber({ y: 2026, m: 11, d: 1 }), key: 'allSaints', weekday: 0, onWeekend: true },
    ]);
    expect(r).toMatchObject({ natural: 1, weekdays: 0, business: 0, weekend: 1 });
  });

  it('includes or excludes the last day, with the same set for every count', () => {
    expect(count('2026-01-05', '2026-01-05')).toMatchObject({ natural: 1, business: 1 });
    expect(count('2026-01-05', '2026-01-05', false)).toMatchObject({
      natural: 0,
      business: 0,
      weekend: 0,
    });
    // 2026-01-31 is a Saturday: leaving it out removes a natural day but no business day.
    expect(count('2026-01-01', '2026-01-31', false)).toMatchObject({ natural: 30, business: 20 });
    expect(count('2026-01-01', '2026-01-30', false)).toMatchObject({ natural: 29, business: 19 });
  });

  it('never gains or loses a day across a DST change', () => {
    expect(count('2026-03-28', '2026-03-30').natural).toBe(3);
    expect(count('2026-10-24', '2026-10-26').natural).toBe(3);
  });

  it('swaps reversed dates and says so', () => {
    expect(count('2026-01-31', '2026-01-01')).toMatchObject({ swapped: true, business: 20 });
  });

  it('refuses dates outside 1900–2100, spans over 100 years and invalid dates', () => {
    expect(countDays('1899-12-31', '1900-01-10', true)).toEqual({ ok: false, reason: 'years' });
    expect(countDays('2026-01-01', '2101-01-01', true)).toEqual({ ok: false, reason: 'years' });
    expect(countDays('1900-01-01', '2001-01-01', true)).toEqual({ ok: false, reason: 'tooLong' });
    expect(countDays('', '2026-01-01', true)).toEqual({ ok: false, reason: 'invalid' });
  });
});
