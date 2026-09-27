import { wallClock, zonedToUtc } from '../timestamp/logic';
import type { Locale } from '../types';

export type FieldName = 'minute' | 'hour' | 'dom' | 'month' | 'dow';

export interface CronField {
  /** Sorted, without duplicates. Day of week uses 0–6 (7 is folded into 0, Sunday). */
  values: number[];
  /** Vixie cron: the field is "restricted" when its text does not start with `*`. */
  restricted: boolean;
}

export type Cron = Record<FieldName, CronField>;

export type CronError =
  | { kind: 'empty' }
  | { kind: 'fields'; count: number }
  | { kind: 'quartz-fields'; count: number }
  | { kind: 'quartz' }
  | { kind: 'syntax'; field: FieldName; text: string }
  | { kind: 'macro'; text: string }
  | { kind: 'range'; field: FieldName; value: number; min: number; max: number }
  | { kind: 'reversed'; field: FieldName; text: string; fixed: string }
  | { kind: 'step'; field: FieldName };

export type ParseResult =
  | { ok: true; reboot: false; cron: Cron }
  | { ok: true; reboot: true }
  | { ok: false; error: CronError };

export interface Run {
  ms: number;
  /** The wall-clock time did not exist (spring-forward gap) and it ran at the first minute after. */
  adjusted: boolean;
}

const FIELDS: FieldName[] = ['minute', 'hour', 'dom', 'month', 'dow'];
const LIMITS: Record<FieldName, [number, number]> = {
  minute: [0, 59],
  hour: [0, 23],
  dom: [1, 31],
  month: [1, 12],
  dow: [0, 7],
};
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const MACROS: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
};

class FieldError extends Error {
  constructor(readonly detail: CronError) {
    super(detail.kind);
  }
}

function toNumber(field: FieldName, token: string): number {
  const up = token.toUpperCase();
  if (field === 'month' && MONTHS.includes(up)) return MONTHS.indexOf(up) + 1;
  if (field === 'dow' && DAYS.includes(up)) return DAYS.indexOf(up);
  if (!/^\d+$/.test(token)) {
    // L, W, # and ? only exist in Quartz (and Spring) cron.
    if (/[?#]/.test(token) || /^(\d*L|L\d*|\d+W|LW)$/i.test(token)) {
      throw new FieldError({ kind: 'quartz' });
    }
    throw new FieldError({ kind: 'syntax', field, text: token });
  }
  const n = Number(token);
  const [min, max] = LIMITS[field];
  if (n < min || n > max) throw new FieldError({ kind: 'range', field, value: n, min, max });
  return n;
}

function parseField(field: FieldName, text: string): CronField {
  const [min, max] = LIMITS[field];
  const set = new Set<number>();
  for (const part of text.split(',')) {
    const [base, stepText, extra] = part.split('/');
    if (base === '' || extra !== undefined || stepText === '') {
      throw new FieldError({ kind: 'syntax', field, text: part });
    }
    let step = 1;
    if (stepText !== undefined) {
      if (!/^\d+$/.test(stepText)) throw new FieldError({ kind: 'syntax', field, text: part });
      step = Number(stepText);
      if (step === 0) throw new FieldError({ kind: 'step', field });
    }
    let from: number;
    let to: number;
    if (base === '*') {
      [from, to] = [min, max];
    } else if (base.includes('-')) {
      const [a, b, more] = base.split('-');
      if (more !== undefined || !a || !b)
        throw new FieldError({ kind: 'syntax', field, text: part });
      from = toNumber(field, a);
      to = toNumber(field, b);
      if (from > to) {
        throw new FieldError({ kind: 'reversed', field, text: base, fixed: `${b}-${a}` });
      }
    } else {
      from = toNumber(field, base);
      // "a/n" means "a-max/n"; a plain "a" is just that value.
      to = stepText === undefined ? from : max;
    }
    for (let v = from; v <= to; v += step) set.add(field === 'dow' && v === 7 ? 0 : v);
  }
  return { values: [...set].sort((a, b) => a - b), restricted: !text.startsWith('*') };
}

export function parseCron(input: string): ParseResult {
  let text = input.trim();
  if (!text) return { ok: false, error: { kind: 'empty' } };
  if (text.startsWith('@')) {
    const macro = text.toLowerCase();
    if (macro === '@reboot') return { ok: true, reboot: true };
    if (!(macro in MACROS)) return { ok: false, error: { kind: 'macro', text } };
    text = MACROS[macro];
  }
  const parts = text.split(/\s+/);
  if (parts.length === 6 || parts.length === 7) {
    return { ok: false, error: { kind: 'quartz-fields', count: parts.length } };
  }
  if (parts.length !== 5) return { ok: false, error: { kind: 'fields', count: parts.length } };
  try {
    const cron = Object.fromEntries(FIELDS.map((f, i) => [f, parseField(f, parts[i])])) as Cron;
    return { ok: true, reboot: false, cron };
  } catch (e) {
    if (e instanceof FieldError) return { ok: false, error: e.detail };
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Messages and description

const FIELD_NAMES: Record<Locale, Record<FieldName, string>> = {
  es: {
    minute: 'El minuto',
    hour: 'La hora',
    dom: 'El día',
    month: 'El mes',
    dow: 'El día de la semana',
  },
  en: {
    minute: 'Minute',
    hour: 'Hour',
    dom: 'Day',
    month: 'Month',
    dow: 'Day of week',
  },
};

const FIELD_LABELS: Record<Locale, Record<FieldName, string>> = {
  es: {
    minute: 'minuto',
    hour: 'hora',
    dom: 'día del mes',
    month: 'mes',
    dow: 'día de la semana',
  },
  en: {
    minute: 'minute',
    hour: 'hour',
    dom: 'day of month',
    month: 'month',
    dow: 'day of week',
  },
};

export function errorMessage(error: CronError, locale: Locale): string {
  const es = locale === 'es';
  switch (error.kind) {
    case 'empty':
      return es
        ? 'Escribe una expresión cron, por ejemplo */5 * * * *'
        : 'Type a cron expression, for example */5 * * * *';
    case 'fields':
      return es
        ? `Tiene ${error.count} campos y hacen falta 5: minuto, hora, día del mes, mes y día de la semana`
        : `It has ${error.count} fields and needs 5: minute, hour, day of month, month and day of week`;
    case 'quartz-fields':
      return es
        ? 'Parece una expresión con segundos o años (Quartz, Spring). Aquí se usa el cron clásico de 5 campos'
        : 'This looks like an expression with seconds or years (Quartz, Spring). This tool uses classic 5-field cron';
    case 'quartz':
      return es
        ? 'L, W, # y ? son de Quartz y no los entiende el cron de Unix'
        : 'L, W, # and ? belong to Quartz and Unix cron does not understand them';
    case 'macro':
      return es
        ? `${error.text} no existe. Valen @yearly, @monthly, @weekly, @daily, @hourly y @reboot`
        : `${error.text} does not exist. Use @yearly, @monthly, @weekly, @daily, @hourly or @reboot`;
    case 'syntax':
      return es
        ? `No se entiende «${error.text}» en el campo ${FIELD_LABELS.es[error.field]}. Usa *, 5, 1-5, */15 o listas como 1,15`
        : `“${error.text}” is not valid in the ${FIELD_LABELS.en[error.field]} field. Use *, 5, 1-5, */15 or lists such as 1,15`;
    case 'range':
      return es
        ? `${FIELD_NAMES.es[error.field]} ${error.value} no existe: van de ${error.min} a ${error.max}`
        : `${FIELD_NAMES.en[error.field]} ${error.value} does not exist: they go from ${error.min} to ${error.max}`;
    case 'reversed':
      return es
        ? `El rango ${error.text} va hacia atrás: escribe ${error.fixed}`
        : `The range ${error.text} goes backwards: write ${error.fixed}`;
    case 'step':
      return es
        ? `Un paso de 0 no avanza en el campo ${FIELD_LABELS.es[error.field]}: usa un número mayor que 0, como */5`
        : `A step of 0 never moves in the ${FIELD_LABELS.en[error.field]} field: use a number above 0, such as */5`;
  }
}

type Shape =
  | { kind: 'all' }
  | { kind: 'single'; value: number }
  | { kind: 'step'; step: number }
  | { kind: 'range'; from: number; to: number }
  | { kind: 'list'; values: number[] };

/** "Every", "every n" (a progression from the minimum to the end), a run of consecutive values or a list. */
function shape(values: number[], min: number, max: number): Shape {
  if (values.length === max - min + 1) return { kind: 'all' };
  if (values.length === 1) return { kind: 'single', value: values[0] };
  const step = values[1] - values[0];
  const progression = values.every((v, i) => v === values[0] + i * step);
  if (progression && values[0] === min && values[values.length - 1] + step > max && step > 1) {
    return { kind: 'step', step };
  }
  if (progression && step === 1 && values.length >= 3) {
    return { kind: 'range', from: values[0], to: values[values.length - 1] };
  }
  return { kind: 'list', values };
}

const pad = (n: number) => String(n).padStart(2, '0');

const MONTH_NAMES: Record<Locale, string[]> = {
  es: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
};
// Monday first, as people read a week.
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_ONE: Record<Locale, string[]> = {
  es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};
const DAY_MANY: Record<Locale, string[]> = {
  es: ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados'],
  en: ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'],
};

function list(items: (string | number)[], locale: Locale): string {
  return new Intl.ListFormat(locale, { type: 'conjunction' }).format(items.map(String));
}

function timePhrase(minute: CronField, hour: CronField, locale: Locale): string {
  const es = locale === 'es';
  const m = shape(minute.values, 0, 59);
  const h = shape(hour.values, 0, 23);
  if (m.kind === 'single' && h.kind !== 'all' && hour.values.length <= 6) {
    const times = hour.values.map((x) => `${pad(x)}:${pad(m.value)}`);
    return `${es ? 'a las' : 'at'} ${list(times, locale)}`;
  }
  let mp: string;
  if (m.kind === 'all') mp = es ? 'cada minuto' : 'every minute';
  else if (m.kind === 'step') mp = es ? `cada ${m.step} minutos` : `every ${m.step} minutes`;
  else if (m.kind === 'single') mp = es ? `en el minuto ${m.value}` : `at minute ${m.value}`;
  else if (m.kind === 'range')
    mp = es
      ? `cada minuto del ${m.from} al ${m.to}`
      : `every minute from ${m.from} through ${m.to}`;
  else
    mp = es ? `en los minutos ${list(m.values, locale)}` : `at minutes ${list(m.values, locale)}`;

  let hp = '';
  if (h.kind === 'step') hp = es ? `cada ${h.step} horas` : `every ${h.step} hours`;
  else if (h.kind === 'single')
    hp = es
      ? `entre las ${pad(h.value)}:00 y las ${pad(h.value)}:59`
      : `between ${pad(h.value)}:00 and ${pad(h.value)}:59`;
  else if (h.kind === 'range')
    hp = es
      ? `entre las ${pad(h.from)}:00 y las ${pad(h.to)}:59`
      : `between ${pad(h.from)}:00 and ${pad(h.to)}:59`;
  else if (h.kind === 'list')
    hp = es ? `en las horas ${list(h.values, locale)}` : `during hours ${list(h.values, locale)}`;
  return hp ? `${mp}, ${hp}` : mp;
}

function domPhrase(dom: CronField, locale: Locale): string {
  const es = locale === 'es';
  const d = shape(dom.values, 1, 31);
  if (d.kind === 'all') return '';
  if (d.kind === 'single')
    return es ? `el día ${d.value} del mes` : `on day ${d.value} of the month`;
  if (d.kind === 'step')
    return es ? `cada ${d.step} días del mes` : `every ${d.step} days of the month`;
  if (d.kind === 'range')
    return es
      ? `del día ${d.from} al ${d.to} del mes`
      : `on days ${d.from} through ${d.to} of the month`;
  return es
    ? `los días ${list(d.values, locale)} del mes`
    : `on days ${list(d.values, locale)} of the month`;
}

function dowPhrase(dow: CronField, locale: Locale): string {
  const es = locale === 'es';
  if (dow.values.length === 7) return '';
  const ordered = DAY_ORDER.filter((d) => dow.values.includes(d));
  const idx = ordered.map((d) => DAY_ORDER.indexOf(d));
  const consecutive = idx.every((v, i) => v === idx[0] + i);
  if (ordered.length >= 3 && consecutive) {
    const [a, b] = [DAY_ONE[locale][ordered[0]], DAY_ONE[locale][ordered[ordered.length - 1]]];
    return es ? `de ${a} a ${b}` : `${a} through ${b}`;
  }
  const names = list(
    ordered.map((d) => DAY_MANY[locale][d]),
    locale,
  );
  return es ? `los ${names}` : `on ${names}`;
}

function monthPhrase(month: CronField, locale: Locale): string {
  const es = locale === 'es';
  const m = shape(month.values, 1, 12);
  if (m.kind === 'all') return '';
  const name = (n: number) => MONTH_NAMES[locale][n - 1];
  if (m.kind === 'range')
    return es ? `de ${name(m.from)} a ${name(m.to)}` : `${name(m.from)} through ${name(m.to)}`;
  return `${es ? 'en' : 'in'} ${list(month.values.map(name), locale)}`;
}

/** "A las 09:30, de lunes a viernes." / "At 09:30, Monday through Friday." */
export function describeCron(parsed: ParseResult & { ok: true }, locale: Locale): string {
  if (parsed.reboot) return locale === 'es' ? 'Al arrancar el sistema.' : 'At system startup.';
  const { cron } = parsed;
  const dom = domPhrase(cron.dom, locale);
  const dow = dowPhrase(cron.dow, locale);
  let day = dom || dow;
  if (dom && dow) {
    // Vixie cron: two restricted day fields mean "either"; otherwise both must match.
    day =
      cron.dom.restricted && cron.dow.restricted
        ? `${dom} ${locale === 'es' ? 'o' : 'or'} ${dow}`
        : `${dom}, ${locale === 'es' ? 'pero solo' : 'but only'} ${dow}`;
  }
  const text = [timePhrase(cron.minute, cron.hour, locale), day, monthPhrase(cron.month, locale)]
    .filter(Boolean)
    .join(', ');
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

// ---------------------------------------------------------------------------
// Next runs

const MINUTE = 60_000;
const HORIZON_DAYS = 5 * 366;

function wallKey(y: number, mo: number, d: number, h: number, mi: number): string {
  return `${y}-${pad(mo)}-${pad(d)} ${pad(h)}:${pad(mi)}:00`;
}

/**
 * The instant for a wall-clock time in `timeZone`, with Vixie cron's rules for DST:
 * a time in the spring-forward gap runs at the first minute that exists after the jump,
 * and a time in the repeated autumn hour runs once, at its first occurrence.
 */
export function resolveWallTime(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  timeZone: string,
): Run | null {
  const inst = zonedToUtc(y, mo, d, h, mi, 0, 0, timeZone);
  if (inst === null) return null;
  const key = wallKey(y, mo, d, h, mi);
  if (wallClock(inst, timeZone) === key) {
    // zonedToUtc gives the second occurrence of a repeated time: look for an earlier one.
    for (const back of [60, 30]) {
      const earlier = inst - back * MINUTE;
      if (wallClock(earlier, timeZone) === key) return { ms: earlier, adjusted: false };
    }
    return { ms: inst, adjusted: false };
  }
  // The time does not exist: find the first minute whose wall clock is past it (the jump).
  let lo = inst - 4 * 60 * MINUTE;
  let hi = inst;
  while (hi - lo > MINUTE) {
    const mid = lo + Math.floor((hi - lo) / MINUTE / 2) * MINUTE;
    if (wallClock(mid, timeZone) > key) hi = mid;
    else lo = mid;
  }
  return { ms: hi, adjusted: true };
}

function dayMatches(cron: Cron, mo: number, d: number, weekday: number): boolean {
  if (!cron.month.values.includes(mo)) return false;
  const domOk = cron.dom.values.includes(d);
  const dowOk = cron.dow.values.includes(weekday);
  return cron.dom.restricted && cron.dow.restricted ? domOk || dowOk : domOk && dowOk;
}

/** The next `count` runs strictly after the minute of `nowMs`, looking up to 5 years ahead. */
export function nextRuns(cron: Cron, nowMs: number, timeZone: string, count: number): Run[] {
  const start = Math.floor(nowMs / MINUTE) * MINUTE + MINUTE;
  const [date, time] = wallClock(nowMs, timeZone).split(' ');
  const [y0, mo0, d0] = date.split('-').map(Number);
  const [h0, mi0] = time.split(':').map(Number);
  const runs: Run[] = [];
  const seen = new Set<number>();
  for (let k = 0; k <= HORIZON_DAYS && runs.length < count; k++) {
    // Civil dates and weekdays come from Date.UTC, so they never depend on the zone.
    const day = new Date(Date.UTC(y0, mo0 - 1, d0 + k));
    const y = day.getUTCFullYear();
    const mo = day.getUTCMonth() + 1;
    const d = day.getUTCDate();
    if (!dayMatches(cron, mo, d, day.getUTCDay())) continue;
    for (const h of cron.hour.values) {
      // Today, skip hours well before now (an hour of margin covers DST shifts).
      if (k === 0 && h < h0 - 1) continue;
      for (const mi of cron.minute.values) {
        if (k === 0 && h * 60 + mi < h0 * 60 + mi0 - 60) continue;
        const run = resolveWallTime(y, mo, d, h, mi, timeZone);
        if (!run || run.ms < start || seen.has(run.ms)) continue;
        seen.add(run.ms);
        runs.push(run);
      }
    }
  }
  return runs.sort((a, b) => a.ms - b.ms).slice(0, count);
}
