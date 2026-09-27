import { toCsv, type CsvCell } from '../../lib/csv';
import { PROVINCES } from '../../lib/provinces';
import { digits, pick, randInt, randomBytesFrom, seededRng, type Rng } from '../../lib/random';
import { generateTestCard } from '../card/logic';
import { generateCif } from '../cif/logic';
import { generateDni, generateNie } from '../dni/logic';
import { generateSpanishIban } from '../iban/logic';
import { generatePhone } from '../phone/logic';
import { generatePlate } from '../plate/logic';
import { generatePostalCode } from '../postal-code/logic';
import type { Locale } from '../types';
import { uuidV4 } from '../uuid/logic';
import {
  COMPANY_WORDS,
  EMAIL_DOMAINS,
  FEMALE_NAMES,
  INTL_CITIES,
  INTL_FEMALE_NAMES,
  INTL_MALE_NAMES,
  INTL_STREETS,
  INTL_SURNAMES,
  MALE_NAMES,
  STREETS,
  STREET_TYPES,
  SURNAMES,
} from './data';

export const BUILTIN_KINDS = [
  'firstName',
  'lastNames',
  'email',
  'phone',
  'birthDate',
  'dni',
  'nie',
  'street',
  'postalCode',
  'province',
  'city',
  'company',
  'cif',
  'iban',
  'card',
  'plate',
  'uuid',
] as const;
export const CUSTOM_KINDS = ['number', 'boolean', 'date', 'list'] as const;

export type BuiltinKind = (typeof BUILTIN_KINDS)[number];
export type CustomKind = (typeof CUSTOM_KINDS)[number];
export type FieldKind = BuiltinKind | CustomKind;
export type MockFormat = 'json' | 'csv' | 'sql';

/** Every field carries every parameter, so the saved JSON has one stable shape. */
export interface MockField {
  /** Stable id: the kind for the default fields, `number-2`… for the added ones. */
  uid: string;
  kind: FieldKind;
  enabled: boolean;
  name: string;
  min: number;
  max: number;
  decimals: number;
  /** Chance of `true`, 0–100. */
  probability: number;
  from: string;
  to: string;
  values: string;
}

export interface MockConfig {
  fields: MockField[];
  rows: number;
  seed: string;
  format: MockFormat;
  table: string;
  international: boolean;
}

export type MockError =
  | { reason: 'noFields' }
  | { reason: 'emptyName' }
  | { reason: 'duplicate'; name: string }
  | { reason: 'minMax'; name: string }
  | { reason: 'dateRange'; name: string }
  | { reason: 'emptyList'; name: string }
  | { reason: 'table' };

export type MockOutput =
  | { ok: true; output: string; preview: string; rows: number; columns: string[] }
  | { ok: false; error: MockError };

export const MAX_ROWS = 1000;
export const DEFAULT_ROWS = 100;
export const PREVIEW_ROWS = 20;
/** DNI, NIE, CIF, IBAN, plate and province only make sense with Spanish data. */
export const SPAIN_ONLY: readonly FieldKind[] = ['dni', 'nie', 'cif', 'iban', 'plate', 'province'];
const DEFAULT_ON: readonly FieldKind[] = [
  'firstName',
  'lastNames',
  'email',
  'phone',
  'dni',
  'city',
];
const TABLE_NAME = /^[A-Za-z_][A-Za-z0-9_]{0,62}$/;
const DAY = 86_400_000;

export const COLUMN_NAMES: Record<Locale, Record<FieldKind, string>> = {
  es: {
    firstName: 'nombre',
    lastNames: 'apellidos',
    email: 'email',
    phone: 'telefono',
    birthDate: 'fecha_nacimiento',
    dni: 'dni',
    nie: 'nie',
    street: 'direccion',
    postalCode: 'codigo_postal',
    province: 'provincia',
    city: 'ciudad',
    company: 'empresa',
    cif: 'cif',
    iban: 'iban',
    card: 'tarjeta',
    plate: 'matricula',
    uuid: 'id',
    number: 'numero',
    boolean: 'activo',
    date: 'fecha',
    list: 'valor',
  },
  en: {
    firstName: 'first_name',
    lastNames: 'last_names',
    email: 'email',
    phone: 'phone',
    birthDate: 'birth_date',
    dni: 'dni',
    nie: 'nie',
    street: 'street',
    postalCode: 'postal_code',
    province: 'province',
    city: 'city',
    company: 'company',
    cif: 'cif',
    iban: 'iban',
    card: 'card',
    plate: 'plate',
    uuid: 'id',
    number: 'number',
    boolean: 'active',
    date: 'date',
    list: 'value',
  },
};

export function defaultField(kind: FieldKind, locale: Locale, uid: string = kind): MockField {
  return {
    uid,
    kind,
    enabled: DEFAULT_ON.includes(kind),
    name: COLUMN_NAMES[locale][kind],
    min: 0,
    max: 100,
    decimals: 0,
    probability: 50,
    from: '2024-01-01',
    to: '2026-12-31',
    values: '',
  };
}

export function defaultConfig(locale: Locale): MockConfig {
  return {
    fields: [...BUILTIN_KINDS, ...CUSTOM_KINDS].map((k) => defaultField(k, locale)),
    rows: DEFAULT_ROWS,
    seed: '',
    format: 'json',
    table: locale === 'es' ? 'usuarios' : 'users',
    international: false,
  };
}

/** Adds another Number, Date or custom list field, enabled, with a unique uid and name. */
export function addField(config: MockConfig, kind: CustomKind, locale: Locale): MockConfig {
  const same = config.fields.filter((f) => f.kind === kind).length;
  let n = same + 1;
  const taken = (uid: string, name: string) =>
    config.fields.some((f) => f.uid === uid || f.name === name);
  const base = COLUMN_NAMES[locale][kind];
  while (taken(`${kind}-${n}`, `${base}_${n}`)) n++;
  const field = {
    ...defaultField(kind, locale, `${kind}-${n}`),
    enabled: true,
    name: `${base}_${n}`,
  };
  return { ...config, fields: [...config.fields, field] };
}

/** Moves a field one place up (-1) or down (+1); out-of-range moves change nothing. */
export function moveField(fields: MockField[], index: number, dir: -1 | 1): MockField[] {
  const j = index + dir;
  if (index < 0 || index >= fields.length || j < 0 || j >= fields.length) return fields;
  const out = fields.slice();
  [out[index], out[j]] = [out[j], out[index]];
  return out;
}

export function isAvailable(field: MockField, international: boolean): boolean {
  return !(international && SPAIN_ONLY.includes(field.kind));
}

/** Lower-case ASCII for emails: no accents (NFD without \p{M}), only a–z and 0–9. */
export function asciiSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function isoDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function parseDay(s: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const ms = Date.parse(`${s}T00:00:00Z`);
  return Number.isNaN(ms) || isoDay(ms) !== s ? null : ms;
}

/** A birth date that gives an age of 18 to 80 on `now` (UTC days). */
export function birthDate(rng: Rng, now: Date): string {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  const latest = Date.UTC(y - 18, m, d);
  const earliest = Date.UTC(y - 81, m, d) + DAY;
  return isoDay(earliest + randInt(rng, 0, Math.round((latest - earliest) / DAY)) * DAY);
}

export type PersonRecord = Record<BuiltinKind, string>;

/**
 * The full record of row `index`, always built in the same order from its own stream,
 * so that choosing, renaming or reordering columns never changes the values of the others.
 */
export function personRecord(
  seed: string,
  index: number,
  now: Date,
  international: boolean,
): PersonRecord {
  const rng = seededRng(`${seed}#${index}`);
  const female = randInt(rng, 0, 1) === 0;
  const esFirst = pick(rng, female ? FEMALE_NAMES : MALE_NAMES);
  const enFirst = pick(rng, female ? INTL_FEMALE_NAMES : INTL_MALE_NAMES);
  const last1 = pick(rng, SURNAMES);
  const last2 = pick(rng, SURNAMES);
  const enLast = pick(rng, INTL_SURNAMES);
  const emailVariant = randInt(rng, 0, 2);
  const emailDigits = String(randInt(rng, 10, 99));
  const domain = pick(rng, EMAIL_DOMAINS);
  const esPhone = generatePhone(rng, 'mobile');
  const enPhone = `+1 202 555 01${String(randInt(rng, 0, 99)).padStart(2, '0')}`;
  const birth = birthDate(rng, now);
  const dni = generateDni(rng);
  const nie = generateNie(rng);
  const esStreet = `${pick(rng, STREET_TYPES)} ${pick(rng, STREETS)}, ${randInt(rng, 1, 150)}`;
  const enStreet = `${randInt(rng, 1, 9999)} ${pick(rng, INTL_STREETS)}`;
  const province = pick(rng, PROVINCES);
  const esPostal = generatePostalCode(rng, province.code);
  const enPostal = digits(rng, 5);
  const enCity = pick(rng, INTL_CITIES);
  const rootIsSurname = randInt(rng, 0, 1) === 0;
  const esRoot = rootIsSurname ? pick(rng, SURNAMES) : pick(rng, COMPANY_WORDS);
  const enRoot = rootIsSurname ? pick(rng, INTL_SURNAMES) : pick(rng, COMPANY_WORDS);
  const sa = randInt(rng, 0, 1) === 0;
  const enSuffix = pick(rng, ['Ltd', 'Inc', 'LLC']);
  const cif = generateCif(rng, sa ? 'A' : 'B');
  const iban = generateSpanishIban(rng);
  const card = generateTestCard(rng, pick(rng, ['visa', 'mastercard', 'amex'] as const));
  const plate = generatePlate(rng);
  const uuid = uuidV4(randomBytesFrom(rng));

  const first = international ? enFirst : esFirst;
  const last = international ? enLast : last1;
  const f = asciiSlug(first);
  const l = asciiSlug(last);
  const local =
    emailVariant === 0
      ? `${f}.${l}`
      : emailVariant === 1
        ? `${f[0]}${l}`
        : `${f}${l}${emailDigits}`;

  return {
    firstName: first,
    lastNames: international ? enLast : `${last1} ${last2}`,
    email: `${local}@${domain}`,
    phone: international ? enPhone : esPhone,
    birthDate: birth,
    dni,
    nie,
    street: international ? enStreet : esStreet,
    postalCode: international ? enPostal : esPostal,
    province: province.name,
    city: international ? enCity : province.capital,
    company: international ? `${enRoot} ${enSuffix}` : `${esRoot} ${sa ? 'S.A.' : 'S.L.'}`,
    cif,
    iban,
    card,
    plate,
    uuid,
  };
}

/** Appends 2, 3… before the @ of repeated emails, in row order. */
export function dedupeEmails(emails: string[]): string[] {
  const seen = new Set<string>();
  return emails.map((e) => {
    let candidate = e;
    const at = e.indexOf('@');
    for (let n = 2; seen.has(candidate); n++) candidate = `${e.slice(0, at)}${n}${e.slice(at)}`;
    seen.add(candidate);
    return candidate;
  });
}

function customValue(field: MockField, rng: Rng): CsvCell {
  switch (field.kind) {
    case 'number': {
      const f = 10 ** Math.min(4, Math.max(0, Math.floor(field.decimals)));
      const lo = Math.ceil(field.min * f);
      const hi = Math.floor(field.max * f);
      if (hi - lo + 1 <= 2 ** 32 && hi >= lo) return randInt(rng, lo, hi) / f;
      return Math.round((field.min + (rng() / 2 ** 32) * (field.max - field.min)) * f) / f;
    }
    case 'boolean':
      return rng() < (Math.min(100, Math.max(0, field.probability)) / 100) * 2 ** 32;
    case 'date': {
      const from = parseDay(field.from) ?? 0;
      const to = parseDay(field.to) ?? 0;
      return isoDay(from + randInt(rng, 0, Math.round((to - from) / DAY)) * DAY);
    }
    default:
      return pick(rng, listValues(field.values));
  }
}

/** One per line or separated by commas. */
export function listValues(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

export function activeFields(config: MockConfig): MockField[] {
  return config.fields.filter((f) => f.enabled && isAvailable(f, config.international));
}

export function validateConfig(config: MockConfig): MockError | null {
  const fields = activeFields(config);
  if (fields.length === 0) return { reason: 'noFields' };
  const names = new Set<string>();
  for (const f of fields) {
    const name = f.name.trim();
    if (!name) return { reason: 'emptyName' };
    if (names.has(name)) return { reason: 'duplicate', name };
    names.add(name);
    if (f.kind === 'number' && !(f.min <= f.max)) return { reason: 'minMax', name };
    if (f.kind === 'date') {
      const from = parseDay(f.from);
      const to = parseDay(f.to);
      if (from === null || to === null || from > to) return { reason: 'dateRange', name };
    }
    if (f.kind === 'list' && listValues(f.values).length === 0)
      return { reason: 'emptyList', name };
  }
  if (config.format === 'sql' && !TABLE_NAME.test(config.table)) return { reason: 'table' };
  return null;
}

/** Rows of cells, in the order of the active fields. */
export function generateRows(config: MockConfig, now: Date, sessionSeed: string): CsvCell[][] {
  const seed = config.seed.trim() || sessionSeed;
  const fields = activeFields(config);
  const count = Math.min(MAX_ROWS, Math.max(1, Math.floor(config.rows) || 1));
  const records = Array.from({ length: count }, (_, i) =>
    personRecord(seed, i, now, config.international),
  );
  const emails = dedupeEmails(records.map((r) => r.email));
  return records.map((r, i) =>
    fields.map((f) => {
      if (f.kind === 'email') return emails[i];
      if ((BUILTIN_KINDS as readonly string[]).includes(f.kind)) return r[f.kind as BuiltinKind];
      return customValue(f, seededRng(`${seed}#${i}#${f.uid}`));
    }),
  );
}

const sqlIdent = (s: string) => `"${s.replace(/"/g, '""')}"`;

function sqlValue(v: CsvCell): string {
  if (v === null) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  return `'${v.replace(/'/g, "''")}'`;
}

export function formatRows(
  format: MockFormat,
  columns: string[],
  rows: CsvCell[][],
  table: string,
): string {
  if (format === 'csv') return toCsv([columns, ...rows]);
  if (format === 'sql') {
    const cols = columns.map(sqlIdent).join(', ');
    return rows
      .map(
        (r) => `INSERT INTO ${sqlIdent(table)} (${cols}) VALUES (${r.map(sqlValue).join(', ')});`,
      )
      .join('\n');
  }
  const objects = rows.map((r) => Object.fromEntries(columns.map((c, i) => [c, r[i]])));
  return JSON.stringify(objects, null, 2);
}

export function renderMock(config: MockConfig, now: Date, sessionSeed: string): MockOutput {
  const error = validateConfig(config);
  if (error) return { ok: false, error };
  const columns = activeFields(config).map((f) => f.name.trim());
  const rows = generateRows(config, now, sessionSeed);
  return {
    ok: true,
    output: formatRows(config.format, columns, rows, config.table),
    preview: formatRows(config.format, columns, rows.slice(0, PREVIEW_ROWS), config.table),
    rows: rows.length,
    columns,
  };
}

const isKind = (k: unknown): k is FieldKind =>
  typeof k === 'string' && ([...BUILTIN_KINDS, ...CUSTOM_KINDS] as string[]).includes(k);

/** Reads the saved configuration; anything missing or malformed falls back to the default. */
export function parseConfig(json: string, locale: Locale): MockConfig {
  const base = defaultConfig(locale);
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return base;
  }
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  const fields = Array.isArray(r.fields)
    ? r.fields.flatMap((x): MockField[] => {
        if (!x || typeof x !== 'object') return [];
        const o = x as Record<string, unknown>;
        if (!isKind(o.kind) || typeof o.uid !== 'string') return [];
        const d = defaultField(o.kind, locale, o.uid);
        const num = (v: unknown, fb: number) =>
          typeof v === 'number' && Number.isFinite(v) ? v : fb;
        const str = (v: unknown, fb: string) => (typeof v === 'string' ? v : fb);
        return [
          {
            ...d,
            enabled: typeof o.enabled === 'boolean' ? o.enabled : d.enabled,
            name: str(o.name, d.name),
            min: num(o.min, d.min),
            max: num(o.max, d.max),
            decimals: num(o.decimals, d.decimals),
            probability: num(o.probability, d.probability),
            from: str(o.from, d.from),
            to: str(o.to, d.to),
            values: str(o.values, d.values),
          },
        ];
      })
    : [];
  return {
    fields: fields.length ? fields : base.fields,
    rows: typeof r.rows === 'number' && Number.isFinite(r.rows) ? r.rows : base.rows,
    seed: typeof r.seed === 'string' ? r.seed : base.seed,
    format:
      r.format === 'csv' || r.format === 'sql' || r.format === 'json' ? r.format : base.format,
    table: typeof r.table === 'string' ? r.table : base.table,
    international: typeof r.international === 'boolean' ? r.international : base.international,
  };
}
