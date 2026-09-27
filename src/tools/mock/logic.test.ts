import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import { validateCif } from '../cif/logic';
import { validateDni } from '../dni/logic';
import { validateIban } from '../iban/logic';
import { lookupPostalCode } from '../postal-code/logic';
import {
  FEMALE_NAMES,
  INTL_CITIES,
  INTL_FEMALE_NAMES,
  INTL_MALE_NAMES,
  INTL_STREETS,
  INTL_SURNAMES,
  MALE_NAMES,
  STREETS,
  SURNAMES,
} from './data';
import {
  COLUMN_NAMES,
  MAX_ROWS,
  addField,
  asciiSlug,
  birthDate,
  dedupeEmails,
  defaultConfig,
  formatRows,
  generateRows,
  listValues,
  moveField,
  parseConfig,
  personRecord,
  renderMock,
  validateConfig,
  type MockConfig,
} from './logic';

const NOW = new Date(Date.UTC(2026, 8, 27, 12));
const withSeed = (c: MockConfig, seed = 'demo'): MockConfig => ({ ...c, seed });
const enable = (c: MockConfig, kinds: string[]): MockConfig => ({
  ...c,
  fields: c.fields.map((f) => ({ ...f, enabled: kinds.includes(f.kind) })),
});

describe('word lists', () => {
  it('have the sizes the spec asks for', () => {
    expect(FEMALE_NAMES).toHaveLength(50);
    expect(MALE_NAMES).toHaveLength(50);
    expect(SURNAMES).toHaveLength(100);
    expect(STREETS).toHaveLength(40);
    expect(INTL_FEMALE_NAMES).toHaveLength(50);
    expect(INTL_MALE_NAMES).toHaveLength(50);
    expect(INTL_SURNAMES).toHaveLength(100);
    expect(INTL_STREETS).toHaveLength(30);
    expect(INTL_CITIES).toHaveLength(30);
  });
});

describe('defaults', () => {
  it('selects name, surnames, email, phone, DNI and city', () => {
    const r = renderMock(withSeed({ ...defaultConfig('es'), format: 'csv', rows: 5 }), NOW, '');
    expect(r.ok && r.output.split('\r\n')[0]).toBe('nombre,apellidos,email,telefono,dni,ciudad');
    expect(r.ok && r.output.split('\r\n')).toHaveLength(6);
  });

  it('uses English column names in English', () => {
    const r = renderMock(withSeed({ ...defaultConfig('en'), format: 'csv', rows: 1 }), NOW, '');
    expect(r.ok && r.columns).toEqual([
      'first_name',
      'last_names',
      'email',
      'phone',
      'dni',
      'city',
    ]);
    expect(Object.keys(COLUMN_NAMES.en)).toEqual(Object.keys(COLUMN_NAMES.es));
  });
});

describe('coherence inside a row', () => {
  it('keeps province, postal code and city from the same province', () => {
    for (let i = 0; i < 200; i++) {
      const r = personRecord('coherence', i, NOW, false);
      const pc = lookupPostalCode(r.postalCode);
      expect(pc.ok && pc.province.name).toBe(r.province);
      expect(pc.ok && pc.province.capital).toBe(r.city);
    }
  });

  it('makes valid documents and a CIF that matches S.L. or S.A.', () => {
    for (let i = 0; i < 200; i++) {
      const r = personRecord('docs', i, NOW, false);
      expect(validateDni(r.dni).ok).toBe(true);
      expect(validateDni(r.nie).ok).toBe(true);
      expect(validateIban(r.iban).ok).toBe(true);
      const cif = validateCif(r.cif);
      expect(cif.ok).toBe(true);
      expect(r.cif[0]).toBe(r.company.endsWith('S.A.') ? 'A' : 'B');
      expect(r.uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
      expect(r.plate).toMatch(/^\d{4} [BCDFGHJKLMNPRSTVWXYZ]{3}$/);
    }
  });

  it('derives an ASCII email from the name on a reserved domain', () => {
    for (let i = 0; i < 300; i++) {
      const r = personRecord('email', i, NOW, false);
      expect(r.email).toMatch(/^[a-z0-9.]+@example\.(com|org|net)$/);
      const last = asciiSlug(r.lastNames.split(' ')[0]);
      expect(r.email).toContain(last);
    }
    expect(asciiSlug('Ibáñez')).toBe('ibanez');
    expect(asciiSlug('Muñoz')).toBe('munoz');
    expect(asciiSlug("O'Brien")).toBe('obrien');
  });

  it('gives ages between 18 and 80', () => {
    const rng = seededRng('age');
    for (let i = 0; i < 2000; i++) {
      const [y, m, d] = birthDate(rng, NOW).split('-').map(Number);
      let age = 2026 - y;
      if (m > 9 || (m === 9 && d > 27)) age--;
      expect(age).toBeGreaterThanOrEqual(18);
      expect(age).toBeLessThanOrEqual(80);
    }
  });

  it('numbers repeated emails', () => {
    expect(dedupeEmails(['a@example.com', 'a@example.com', 'b@x', 'a@example.com'])).toEqual([
      'a@example.com',
      'a2@example.com',
      'b@x',
      'a3@example.com',
    ]);
  });
});

describe('reproducibility', () => {
  it('gives the same output for the same seed', () => {
    const c = withSeed(defaultConfig('es'));
    expect(renderMock(c, NOW, 'x')).toEqual(renderMock(c, NOW, 'y'));
  });

  it('uses the session seed when there is no seed', () => {
    const c = defaultConfig('es');
    expect(renderMock(c, NOW, 's1')).toEqual(renderMock(c, NOW, 's1'));
    expect(renderMock(c, NOW, 's1')).not.toEqual(renderMock(c, NOW, 's2'));
  });

  it('removing or reordering columns never changes the other values', () => {
    const all = withSeed(
      enable(defaultConfig('es'), ['firstName', 'email', 'dni', 'city', 'number']),
    );
    const fewer = withSeed(enable(defaultConfig('es'), ['dni', 'number']));
    const a = generateRows(all, NOW, '');
    const b = generateRows(fewer, NOW, '');
    expect(b.map((r) => r[0])).toEqual(a.map((r) => r[2]));
    expect(b.map((r) => r[1])).toEqual(a.map((r) => r[4]));
    const moved = { ...all, fields: all.fields.slice().reverse() };
    const c = generateRows(moved, NOW, '');
    expect(c.map((r) => r.slice().sort())).toEqual(a.map((r) => r.slice().sort()));
  });

  it('adding a second custom field or changing its range leaves the first one alone', () => {
    const one = withSeed(enable(defaultConfig('es'), ['number']));
    const two = addField(one, 'number', 'es');
    const changed = {
      ...two,
      fields: two.fields.map((f) => (f.uid === 'number-2' ? { ...f, min: 5, max: 9 } : f)),
    };
    const a = generateRows(one, NOW, '').map((r) => r[0]);
    expect(generateRows(two, NOW, '').map((r) => r[0])).toEqual(a);
    expect(generateRows(changed, NOW, '').map((r) => r[0])).toEqual(a);
  });
});

describe('custom fields', () => {
  it('draws numbers in range with the requested decimals', () => {
    const c = withSeed({
      ...enable(defaultConfig('es'), ['number']),
      fields: defaultConfig('es').fields.map((f) =>
        f.kind === 'number'
          ? { ...f, enabled: true, min: 1.5, max: 2.5, decimals: 2 }
          : { ...f, enabled: false },
      ),
      rows: 500,
    });
    for (const [v] of generateRows(c, NOW, '')) {
      expect(typeof v).toBe('number');
      expect(v as number).toBeGreaterThanOrEqual(1.5);
      expect(v as number).toBeLessThanOrEqual(2.5);
      expect(Math.round((v as number) * 100)).toBeCloseTo((v as number) * 100, 6);
    }
  });

  it('reaches both ends of a 2-decimal range one floating-point step wide', () => {
    // 0.28 * 100 and 0.29 * 100 both land off-integer in floating point; both endpoints must
    // still come out, not just one or neither.
    const c = withSeed({
      ...enable(defaultConfig('es'), ['number']),
      fields: defaultConfig('es').fields.map((f) =>
        f.kind === 'number'
          ? { ...f, enabled: true, min: 0.28, max: 0.29, decimals: 2 }
          : { ...f, enabled: false },
      ),
      rows: 200,
    });
    const values = new Set(generateRows(c, NOW, '').map(([v]) => v));
    expect(values).toEqual(new Set([0.28, 0.29]));
  });

  it('draws booleans with the given probability, dates in range and list values', () => {
    const base = defaultConfig('es');
    const c = withSeed({
      ...base,
      rows: 1000,
      fields: base.fields.map((f) => {
        if (f.kind === 'boolean') return { ...f, enabled: true, probability: 20 };
        if (f.kind === 'date') return { ...f, enabled: true, from: '2026-01-01', to: '2026-01-31' };
        if (f.kind === 'list') return { ...f, enabled: true, values: 'rojo, verde\nazul' };
        return { ...f, enabled: false };
      }),
    });
    const rows = generateRows(c, NOW, '');
    const trues = rows.filter((r) => r[0] === true).length;
    expect(trues).toBeGreaterThan(150);
    expect(trues).toBeLessThan(250);
    for (const [, date, value] of rows) {
      expect((date as string) >= '2026-01-01' && (date as string) <= '2026-01-31').toBe(true);
      expect(['rojo', 'verde', 'azul']).toContain(value);
    }
    expect(listValues(' a,\n\nb ,')).toEqual(['a', 'b']);
  });
});

describe('international mode', () => {
  it('drops Spain-only fields and uses generic data and the fictional 555-01XX range', () => {
    const c = withSeed({
      ...enable(defaultConfig('es'), ['firstName', 'phone', 'dni', 'city', 'company', 'street']),
      international: true,
      format: 'csv',
      rows: 50,
    });
    const r = renderMock(c, NOW, '');
    expect(r.ok && r.columns).toEqual(['nombre', 'telefono', 'direccion', 'ciudad', 'empresa']);
    const rec = personRecord('demo', 0, NOW, true);
    expect(rec.phone).toMatch(/^\+1 202 555 01\d\d$/);
    expect(rec.company).toMatch(/ (Ltd|Inc|LLC)$/);
    expect(rec.street).toMatch(/^\d{1,4} /);
    expect(rec.postalCode).toMatch(/^\d{5}$/);
    expect(INTL_CITIES).toContain(rec.city);
  });
});

describe('output formats', () => {
  it('types numbers and booleans in JSON and keeps codes as text', () => {
    const out = formatRows('json', ['n', 'b', 'cp'], [[3, true, '08001']], 't');
    expect(JSON.parse(out)).toEqual([{ n: 3, b: true, cp: '08001' }]);
  });

  it('writes one SQL statement per row with quoted identifiers and escaped quotes', () => {
    expect(
      formatRows('sql', ['nombre', 'edad', 'ok', 'x'], [["O'Brien", 34, false, null]], 'usuarios'),
    ).toBe(
      `INSERT INTO "usuarios" ("nombre", "edad", "ok", "x") VALUES ('O''Brien', 34, FALSE, NULL);`,
    );
    expect(formatRows('sql', ['a"b'], [['v']], 't')).toBe(`INSERT INTO "t" ("a""b") VALUES ('v');`);
  });

  it('previews 20 rows and keeps everything in the full output', () => {
    const r = renderMock(
      withSeed({ ...defaultConfig('es'), rows: MAX_ROWS, format: 'sql' }),
      NOW,
      '',
    );
    expect(r.ok && r.rows).toBe(1000);
    expect(r.ok && r.output.split('\n')).toHaveLength(1000);
    expect(r.ok && r.preview.split('\n')).toHaveLength(20);
  });

  it('handles 1 row and clamps the row count', () => {
    const one = renderMock(withSeed({ ...defaultConfig('es'), rows: 1 }), NOW, '');
    expect(one.ok && JSON.parse(one.output)).toHaveLength(1);
    const many = renderMock(
      withSeed({ ...defaultConfig('es'), rows: 5000, format: 'csv' }),
      NOW,
      '',
    );
    expect(many.ok && many.rows).toBe(MAX_ROWS);
  });
});

describe('errors', () => {
  it('needs at least one field', () => {
    expect(validateConfig(enable(defaultConfig('es'), []))).toEqual({ reason: 'noFields' });
    expect(
      validateConfig({ ...enable(defaultConfig('es'), ['dni']), international: true }),
    ).toEqual({
      reason: 'noFields',
    });
  });

  it('refuses duplicate and empty column names', () => {
    const c = defaultConfig('es');
    const dup = {
      ...c,
      fields: c.fields.map((f) => (f.kind === 'phone' ? { ...f, name: 'email' } : f)),
    };
    expect(validateConfig(dup)).toEqual({ reason: 'duplicate', name: 'email' });
    const empty = {
      ...c,
      fields: c.fields.map((f) => (f.kind === 'dni' ? { ...f, name: '  ' } : f)),
    };
    expect(validateConfig(empty)).toEqual({ reason: 'emptyName' });
  });

  it('checks number, date and list parameters', () => {
    const c = defaultConfig('es');
    const set = (kind: string, patch: object) => ({
      ...c,
      fields: c.fields.map((f) => (f.kind === kind ? { ...f, enabled: true, ...patch } : f)),
    });
    expect(validateConfig(set('number', { min: 5, max: 1 }))).toEqual({
      reason: 'minMax',
      name: 'numero',
    });
    expect(validateConfig(set('date', { from: '2026-02-01', to: '2026-01-01' }))).toEqual({
      reason: 'dateRange',
      name: 'fecha',
    });
    expect(validateConfig(set('date', { from: '2026-02-30' }))).toMatchObject({
      reason: 'dateRange',
    });
    expect(validateConfig(set('list', { values: ' , ' }))).toEqual({
      reason: 'emptyList',
      name: 'valor',
    });
  });

  it('rejects a number range with no representable value at its decimals', () => {
    const c = defaultConfig('es');
    const set = (patch: object) => ({
      ...c,
      fields: c.fields.map((f) => (f.kind === 'number' ? { ...f, enabled: true, ...patch } : f)),
    });
    // 0 decimals only allows integers, and none falls between 0.5 and 0.9.
    expect(validateConfig(set({ min: 0.5, max: 0.9, decimals: 0 }))).toEqual({
      reason: 'numberStep',
      name: 'numero',
      min: 0.5,
      max: 0.9,
      decimals: 0,
    });
    // Exactly one integer (1) falls between 0.5 and 1.4: that single grid point is enough.
    expect(validateConfig(set({ min: 0.5, max: 1.4, decimals: 0 }))).toBeNull();
    // 0.29 * 100 is 28.999999999999996 in floating point: without correcting for that noise,
    // a single valid grid point (0.29 itself) would look like an empty range.
    expect(validateConfig(set({ min: 0.29, max: 0.29, decimals: 2 }))).toBeNull();
    // Same noise, two valid points this time (0.28 and 0.29).
    expect(validateConfig(set({ min: 0.28, max: 0.29, decimals: 2 }))).toBeNull();
  });

  it('checks the SQL table name only in SQL', () => {
    const c = { ...defaultConfig('es'), table: '1usuarios' };
    expect(validateConfig(c)).toBeNull();
    expect(validateConfig({ ...c, format: 'sql' })).toEqual({ reason: 'table' });
    expect(validateConfig({ ...c, format: 'sql', table: 'tabla_ñ' })).toEqual({ reason: 'table' });
    expect(validateConfig({ ...c, format: 'sql', table: '_ok_1' })).toBeNull();
  });
});

describe('field list and saved configuration', () => {
  it('adds numbered custom fields and moves fields', () => {
    const c = addField(addField(defaultConfig('es'), 'list', 'es'), 'list', 'es');
    const added = c.fields.slice(-2);
    expect(added.map((f) => [f.uid, f.name, f.enabled])).toEqual([
      ['list-2', 'valor_2', true],
      ['list-3', 'valor_3', true],
    ]);
    const f = defaultConfig('es').fields;
    expect(
      moveField(f, 1, -1)
        .slice(0, 2)
        .map((x) => x.kind),
    ).toEqual(['lastNames', 'firstName']);
    expect(moveField(f, 0, -1)).toBe(f);
  });

  it('round-trips through JSON and survives garbage', () => {
    const c = addField({ ...defaultConfig('es'), seed: 'demo', format: 'sql' }, 'date', 'es');
    expect(parseConfig(JSON.stringify(c), 'es')).toEqual(c);
    expect(parseConfig('not json', 'es')).toEqual(defaultConfig('es'));
    expect(parseConfig('{"fields":[{"kind":"nope","uid":"x"}],"rows":"x"}', 'en')).toEqual(
      defaultConfig('en'),
    );
  });
});

describe('performance', () => {
  it('builds 1000 rows with every field in well under 500 ms', () => {
    const c = withSeed({
      ...defaultConfig('es'),
      rows: 1000,
      fields: defaultConfig('es').fields.map((f) => ({ ...f, enabled: true, values: 'a,b' })),
    });
    const t0 = performance.now();
    const r = renderMock(c, NOW, '');
    expect(r.ok).toBe(true);
    expect(performance.now() - t0).toBeLessThan(500);
  });
});
