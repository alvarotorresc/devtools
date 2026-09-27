import { describe, expect, it } from 'vitest';
import {
  describeCron,
  errorMessage,
  nextRuns,
  parseCron,
  resolveWallTime,
  type Cron,
} from './logic';

function cron(expr: string): Cron {
  const r = parseCron(expr);
  if (!r.ok || r.reboot) throw new Error(`not a schedule: ${expr}`);
  return r.cron;
}

function describe2(expr: string): [string, string] {
  const r = parseCron(expr);
  if (!r.ok) throw new Error(expr);
  return [describeCron(r, 'es'), describeCron(r, 'en')];
}

function error(expr: string, locale: 'es' | 'en' = 'es'): string {
  const r = parseCron(expr);
  if (r.ok) throw new Error(`should fail: ${expr}`);
  return errorMessage(r.error, locale);
}

const iso = (runs: { ms: number }[]) => runs.map((r) => new Date(r.ms).toISOString());

describe('parseCron', () => {
  it('parses lists, ranges, steps and names', () => {
    const c = cron('5/15 9-17/4 1,15 jan-MAR MON-FRI');
    expect(c.minute.values).toEqual([5, 20, 35, 50]);
    expect(c.hour.values).toEqual([9, 13, 17]);
    expect(c.dom.values).toEqual([1, 15]);
    expect(c.month.values).toEqual([1, 2, 3]);
    expect(c.dow.values).toEqual([1, 2, 3, 4, 5]);
  });

  it('treats 0 and 7 as Sunday', () => {
    expect(cron('0 0 * * 7').dow.values).toEqual([0]);
    expect(cron('0 0 * * 0-7').dow.values).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(cron('0 0 * * 5-7').dow.values).toEqual([0, 5, 6]);
  });

  it('marks fields as restricted unless their text starts with *', () => {
    const c = cron('0 0 */2 * 1');
    expect(c.dom.restricted).toBe(false);
    expect(c.dow.restricted).toBe(true);
  });

  it('expands macros and recognises @reboot', () => {
    expect(cron('@weekly')).toEqual(cron('0 0 * * 0'));
    expect(cron('@ANNUALLY')).toEqual(cron('0 0 1 1 *'));
    expect(cron('@midnight')).toEqual(cron('0 0 * * *'));
    expect(parseCron('@reboot')).toEqual({ ok: true, reboot: true });
  });

  it('does not mistake month and day names for Quartz letters', () => {
    expect(cron('0 0 * JUL WED').month.values).toEqual([7]);
  });
});

describe('errors say what is wrong and how to fix it', () => {
  it('out of range', () => {
    expect(error('60 * * * *')).toBe('El minuto 60 no existe: van de 0 a 59');
    expect(error('0 24 * * *')).toBe('La hora 24 no existe: van de 0 a 23');
    expect(error('0 0 32 * *', 'en')).toBe('Day 32 does not exist: they go from 1 to 31');
    expect(error('0 0 * 13 *')).toBe('El mes 13 no existe: van de 1 a 12');
    expect(error('0 0 * * 8')).toBe('El día de la semana 8 no existe: van de 0 a 7');
  });

  it('ranges backwards', () => {
    expect(error('0 0 * * 5-1')).toBe('El rango 5-1 va hacia atrás: escribe 1-5');
    expect(error('0 0 * * FRI-MON', 'en')).toBe('The range FRI-MON goes backwards: write MON-FRI');
  });

  it('a step of 0', () => {
    expect(error('*/0 * * * *')).toBe(
      'Un paso de 0 no avanza en el campo minuto: usa un número mayor que 0, como */5',
    );
  });

  it('Quartz and Spring expressions', () => {
    const fields =
      'Parece una expresión con segundos o años (Quartz, Spring). Aquí se usa el cron clásico de 5 campos';
    expect(error('0 0 12 * * ?')).toBe(fields);
    expect(error('0 0 12 * * ? 2026')).toBe(fields);
    const letters = 'L, W, # y ? son de Quartz y no los entiende el cron de Unix';
    expect(error('0 0 L * *')).toBe(letters);
    expect(error('0 0 15W * *')).toBe(letters);
    expect(error('0 0 * * MON#2')).toBe(letters);
    expect(error('0 0 ? * MON')).toBe(letters);
  });

  it('wrong number of fields, bad tokens and unknown macros', () => {
    expect(error('* * *')).toBe(
      'Tiene 3 campos y hacen falta 5: minuto, hora, día del mes, mes y día de la semana',
    );
    expect(error('0 0 * * lunes')).toBe(
      'No se entiende «lunes» en el campo día de la semana. Usa *, 5, 1-5, */15 o listas como 1,15',
    );
    expect(error('@often')).toBe(
      '@often no existe. Valen @yearly, @monthly, @weekly, @daily, @hourly y @reboot',
    );
    expect(parseCron('   ')).toEqual({ ok: false, error: { kind: 'empty' } });
  });
});

describe('describeCron', () => {
  it('matches the spec examples exactly, in both languages', () => {
    expect(describe2('* * * * *')).toEqual(['Cada minuto.', 'Every minute.']);
    expect(describe2('*/15 * * * *')).toEqual(['Cada 15 minutos.', 'Every 15 minutes.']);
    expect(describe2('30 9 * * 1-5')).toEqual([
      'A las 09:30, de lunes a viernes.',
      'At 09:30, Monday through Friday.',
    ]);
    expect(describe2('0 0 1 * *')).toEqual([
      'A las 00:00, el día 1 del mes.',
      'At 00:00, on day 1 of the month.',
    ]);
    expect(describe2('0 9 1 * 1')).toEqual([
      'A las 09:00, el día 1 del mes o los lunes.',
      'At 09:00, on day 1 of the month or on Mondays.',
    ]);
  });

  it('lists up to 6 times, and combines minute and hour phrases otherwise', () => {
    expect(describe2('0 9,12,18 * * *')).toEqual([
      'A las 09:00, 12:00 y 18:00.',
      'At 09:00, 12:00, and 18:00.',
    ]);
    expect(describe2('0 */2 * * *')[0]).toBe('En el minuto 0, cada 2 horas.');
    expect(describe2('*/10 9-17 * * 1-5')[0]).toBe(
      'Cada 10 minutos, entre las 09:00 y las 17:59, de lunes a viernes.',
    );
    expect(describe2('@hourly')).toEqual(['En el minuto 0.', 'At minute 0.']);
  });

  it('describes months, weekend runs and the "and" day rule', () => {
    expect(describe2('0 0 * 1,7 *')[0]).toBe('A las 00:00, en enero y julio.');
    expect(describe2('0 0 * 6-8 *')[1]).toBe('At 00:00, June through August.');
    expect(describe2('0 0 * * 5-7')[0]).toBe('A las 00:00, de viernes a domingo.');
    expect(describe2('0 0 * * 0,6')[1]).toBe('At 00:00, on Saturdays and Sundays.');
    expect(describe2('0 0 */2 * 1')[0]).toBe(
      'A las 00:00, cada 2 días del mes, pero solo los lunes.',
    );
    expect(describe2('@reboot')).toEqual(['Al arrancar el sistema.', 'At system startup.']);
  });
});

describe('resolveWallTime and DST (Europe/Madrid)', () => {
  it('maps a normal time to its instant', () => {
    expect(resolveWallTime(2026, 9, 28, 9, 30, 'Europe/Madrid')).toEqual({
      ms: Date.UTC(2026, 8, 28, 7, 30),
      adjusted: false,
    });
  });

  it('runs a time in the March gap at the first minute after the jump', () => {
    // 02:30 does not exist on 2026-03-29: clocks go from 02:00 to 03:00 (01:00Z).
    expect(resolveWallTime(2026, 3, 29, 2, 30, 'Europe/Madrid')).toEqual({
      ms: Date.UTC(2026, 2, 29, 1, 0),
      adjusted: true,
    });
  });

  it('runs a time in the repeated October hour once, at its first occurrence', () => {
    // 02:30 happens twice on 2026-10-25: 00:30Z (CEST) and 01:30Z (CET).
    expect(resolveWallTime(2026, 10, 25, 2, 30, 'Europe/Madrid')).toEqual({
      ms: Date.UTC(2026, 9, 25, 0, 30),
      adjusted: false,
    });
  });
});

describe('resolveWallTime and DST west of UTC (America/New_York)', () => {
  it('maps an existing time near the spring gap to its instant', () => {
    // 01:30 EST exists (the jump is at 02:00 EST / 07:00Z, not before it).
    expect(resolveWallTime(2026, 3, 8, 1, 30, 'America/New_York')).toEqual({
      ms: Date.UTC(2026, 2, 8, 6, 30),
      adjusted: false,
    });
  });

  it('runs a time in the spring gap at the first minute after the jump, not before it', () => {
    // 02:30 does not exist on 2026-03-08: clocks go from 02:00 EST to 03:00 EDT (07:00Z).
    // A one-sided search that only looks backward from zonedToUtc's guess converges on
    // 06:30Z (01:30 EST, before the jump); the correct answer is 07:00Z (03:00 EDT, after it).
    expect(resolveWallTime(2026, 3, 8, 2, 30, 'America/New_York')).toEqual({
      ms: Date.UTC(2026, 2, 8, 7, 0),
      adjusted: true,
    });
  });

  it('runs a time in the repeated November hour once, at its first occurrence', () => {
    // 01:30 happens twice on 2026-11-01: 05:30Z (EDT) and 06:30Z (EST).
    expect(resolveWallTime(2026, 11, 1, 1, 30, 'America/New_York')).toEqual({
      ms: Date.UTC(2026, 10, 1, 5, 30),
      adjusted: false,
    });
  });
});

describe('resolveWallTime and DST far east of UTC (Australia/Sydney)', () => {
  it('runs a time in the spring gap at the first minute after the jump', () => {
    // Sydney's clocks go forward on the first Sunday of October: 02:00 AEST to 03:00 AEDT.
    // 02:30 does not exist on 2026-10-04; the first valid minute after is 03:00 AEDT (16:00Z
    // the previous day in UTC).
    expect(resolveWallTime(2026, 10, 4, 2, 30, 'Australia/Sydney')).toEqual({
      ms: Date.UTC(2026, 9, 3, 16, 0),
      adjusted: true,
    });
  });
});

describe('nextRuns', () => {
  it('starts at the next minute in the chosen zone (e2e vector)', () => {
    const runs = nextRuns(
      cron('30 9 * * 1-5'),
      Date.parse('2026-09-28T06:00:00Z'),
      'Europe/Madrid',
      5,
    );
    expect(iso(runs)).toEqual([
      '2026-09-28T07:30:00.000Z',
      '2026-09-29T07:30:00.000Z',
      '2026-09-30T07:30:00.000Z',
      '2026-10-01T07:30:00.000Z',
      '2026-10-02T07:30:00.000Z',
    ]);
  });

  it('never repeats the current minute', () => {
    const runs = nextRuns(cron('* * * * *'), Date.parse('2026-09-28T06:00:30Z'), 'UTC', 2);
    expect(iso(runs)).toEqual(['2026-09-28T06:01:00.000Z', '2026-09-28T06:02:00.000Z']);
  });

  it('shows the March gap once, marked as adjusted', () => {
    const runs = nextRuns(
      cron('0,30 2 * * *'),
      Date.parse('2026-03-28T12:00:00Z'),
      'Europe/Madrid',
      3,
    );
    expect(runs).toEqual([
      { ms: Date.UTC(2026, 2, 29, 1, 0), adjusted: true },
      { ms: Date.UTC(2026, 2, 30, 0, 0), adjusted: false },
      { ms: Date.UTC(2026, 2, 30, 0, 30), adjusted: false },
    ]);
  });

  it('runs once in the repeated October hour', () => {
    const runs = nextRuns(
      cron('30 2 * * *'),
      Date.parse('2026-10-24T12:00:00Z'),
      'Europe/Madrid',
      2,
    );
    expect(iso(runs)).toEqual(['2026-10-25T00:30:00.000Z', '2026-10-26T01:30:00.000Z']);
  });

  it('keeps both the real run and the moved run across a west-of-UTC spring gap', () => {
    // In America/New_York, 2026-03-08 is spring-forward day: 01:30 EST is real, and 02:30 does
    // not exist (it moves to 03:00 EDT). A one-sided gap search resolves both to the same
    // instant (06:30Z), and the `seen` dedup then silently drops the moved run.
    const runs = nextRuns(
      cron('30 1,2 * * *'),
      Date.parse('2026-03-08T04:00:00Z'),
      'America/New_York',
      3,
    );
    expect(runs).toEqual([
      { ms: Date.UTC(2026, 2, 8, 6, 30), adjusted: false },
      { ms: Date.UTC(2026, 2, 8, 7, 0), adjusted: true },
      { ms: Date.UTC(2026, 2, 9, 5, 30), adjusted: false },
    ]);
  });

  it('applies the day-of-month OR day-of-week rule', () => {
    const runs = nextRuns(cron('0 9 1 * 1'), Date.parse('2026-09-28T10:00:00Z'), 'UTC', 2);
    // 2026-10-01 is a Thursday (day 1), 2026-10-05 a Monday.
    expect(iso(runs)).toEqual(['2026-10-01T09:00:00.000Z', '2026-10-05T09:00:00.000Z']);
  });

  it('applies AND when one day field starts with *', () => {
    const runs = nextRuns(cron('0 0 */2 * 1'), Date.parse('2026-09-28T10:00:00Z'), 'UTC', 2);
    // Odd days that are Mondays: 2026-10-05 and 2026-10-19.
    expect(iso(runs)).toEqual(['2026-10-05T00:00:00.000Z', '2026-10-19T00:00:00.000Z']);
  });

  it('finds 29 February in 2028 and nothing for 30 February', () => {
    const now = Date.parse('2026-09-28T06:00:00Z');
    expect(iso(nextRuns(cron('0 0 29 2 *'), now, 'UTC', 1))).toEqual(['2028-02-29T00:00:00.000Z']);
    expect(nextRuns(cron('0 0 30 2 *'), now, 'UTC', 5)).toEqual([]);
  });
});
