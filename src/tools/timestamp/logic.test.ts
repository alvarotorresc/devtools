import { describe, expect, it } from 'vitest';
import {
  MAX_MS,
  detectUnit,
  formatOffset,
  isValidTimeZone,
  listTimeZones,
  parseDate,
  parseTimestamp,
  tzOffsetMinutes,
  wallClock,
  zonedToUtc,
} from './logic';

describe('detectUnit and parseTimestamp', () => {
  it('tells seconds from milliseconds', () => {
    expect(detectUnit(1_700_000_000)).toBe('s');
    expect(detectUnit(1_700_000_000_000)).toBe('ms');
    expect(detectUnit(0)).toBe('s');
    expect(detectUnit(-1_700_000_000_000)).toBe('ms');
  });

  it('parses seconds and milliseconds to the same instant', () => {
    expect(parseTimestamp('1700000000')).toEqual({ ms: 1_700_000_000_000, unit: 's' });
    expect(parseTimestamp(' 1700000000000 ')).toEqual({ ms: 1_700_000_000_000, unit: 'ms' });
    expect(parseTimestamp('1_700_000_000')).toEqual({ ms: 1_700_000_000_000, unit: 's' });
  });

  it('accepts decimals and negative values', () => {
    expect(parseTimestamp('1700000000.5')).toEqual({ ms: 1_700_000_000_500, unit: 's' });
    expect(parseTimestamp('-86400')).toEqual({ ms: -86_400_000, unit: 's' });
  });

  it('lets the user force the unit', () => {
    expect(parseTimestamp('1700000000', 'ms')).toEqual({ ms: 1_700_000_000, unit: 'ms' });
  });

  it('rejects text and out-of-range values', () => {
    expect(parseTimestamp('abc')).toBeNull();
    expect(parseTimestamp('')).toBeNull();
    expect(parseTimestamp('12e5')).toBeNull();
    expect(parseTimestamp(String(MAX_MS + 1), 'ms')).toBeNull();
  });
});

describe('time zones', () => {
  it('computes offsets, including daylight saving time', () => {
    expect(tzOffsetMinutes(Date.UTC(2024, 0, 15, 12), 'Europe/Madrid')).toBe(60);
    expect(tzOffsetMinutes(Date.UTC(2024, 6, 1, 12), 'Europe/Madrid')).toBe(120);
    expect(tzOffsetMinutes(Date.UTC(2024, 0, 15, 12), 'America/New_York')).toBe(-300);
    expect(tzOffsetMinutes(0, 'Asia/Kolkata')).toBe(330);
    expect(tzOffsetMinutes(0, 'UTC')).toBe(0);
  });

  it('formats offsets', () => {
    expect(formatOffset(120)).toBe('+02:00');
    expect(formatOffset(-300)).toBe('-05:00');
    expect(formatOffset(330)).toBe('+05:30');
    expect(formatOffset(0)).toBe('+00:00');
  });

  it('returns null instead of NaN at the edge of the Date range', () => {
    // At MAX_MS, Madrid's wall clock is already past the last representable instant.
    expect(tzOffsetMinutes(MAX_MS, 'Europe/Madrid')).toBeNull();
    expect(tzOffsetMinutes(-MAX_MS, 'Europe/Madrid')).toBeNull();
    expect(formatOffset(null)).toBeNull();
    expect(formatOffset(NaN)).toBeNull();
  });

  it('converts wall-clock times to UTC across the DST switch', () => {
    // Madrid, 31 March 2024: 02:00 CET jumps to 03:00 CEST.
    expect(zonedToUtc(2024, 3, 31, 1, 30, 0, 0, 'Europe/Madrid')).toBe(
      Date.UTC(2024, 2, 31, 0, 30),
    );
    expect(zonedToUtc(2024, 3, 31, 3, 30, 0, 0, 'Europe/Madrid')).toBe(
      Date.UTC(2024, 2, 31, 1, 30),
    );
    // 02:30 does not exist that night: it is moved forward to 03:30 CEST.
    expect(zonedToUtc(2024, 3, 31, 2, 30, 0, 0, 'Europe/Madrid')).toBe(
      Date.UTC(2024, 2, 31, 1, 30),
    );
    // 27 October 2024: 02:30 happens twice; the second one (CET) is used.
    expect(zonedToUtc(2024, 10, 27, 2, 30, 0, 0, 'Europe/Madrid')).toBe(
      Date.UTC(2024, 9, 27, 1, 30),
    );
  });

  it('validates zone names and always offers UTC and the current zone', () => {
    expect(isValidTimeZone('Europe/Madrid')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus')).toBe(false);
    const zones = listTimeZones('Europe/Kiev');
    expect(zones).toContain('UTC');
    expect(zones).toContain('Europe/Kiev');
    expect(zones).toContain('America/New_York');
  });
});

describe('parseDate', () => {
  it('reads dates without an offset in the chosen zone', () => {
    expect(parseDate('2024-07-01 12:00', 'Europe/Madrid')).toBe(Date.UTC(2024, 6, 1, 10));
    expect(parseDate('2024-07-01T12:00:30.5', 'UTC')).toBe(Date.UTC(2024, 6, 1, 12, 0, 30, 500));
    expect(parseDate('2024-01-15', 'America/New_York')).toBe(Date.UTC(2024, 0, 15, 5));
  });

  it('respects an explicit offset or Z', () => {
    expect(parseDate('2024-07-01T12:00:00Z', 'Europe/Madrid')).toBe(Date.UTC(2024, 6, 1, 12));
    expect(parseDate('2024-07-01T12:00:00+02:00', 'UTC')).toBe(Date.UTC(2024, 6, 1, 10));
  });

  it('rejects invalid dates', () => {
    expect(parseDate('', 'UTC')).toBeNull();
    expect(parseDate('mañana', 'UTC')).toBeNull();
    expect(parseDate('2024-13-01', 'UTC')).toBeNull();
  });

  it('rejects days that do not exist in that month', () => {
    expect(parseDate('2024-02-30', 'UTC')).toBeNull();
    expect(parseDate('2024-04-31', 'UTC')).toBeNull();
    expect(parseDate('2023-02-29', 'UTC')).toBeNull();
    expect(parseDate('2024-02-29', 'UTC')).toBe(Date.UTC(2024, 1, 29));
  });

  it('does not fall back to the browser zone for other formats', () => {
    expect(parseDate('2024/07/01 12:00', 'America/New_York')).toBeNull();
    expect(parseDate('1', 'UTC')).toBeNull();
  });

  it('handles years before 100', () => {
    expect(new Date(parseDate('0050-01-01', 'UTC')!).getUTCFullYear()).toBe(50);
  });
});

describe('wallClock', () => {
  it('prints the time in a zone', () => {
    expect(wallClock(Date.UTC(2024, 6, 1, 10, 5, 9), 'Europe/Madrid')).toBe('2024-07-01 12:05:09');
    expect(wallClock(0, 'UTC')).toBe('1970-01-01 00:00:00');
  });
});
