import { describe, expect, it } from 'vitest';
import { parseCsv } from '../../lib/csv';
import { detectFormat, readInput, toCsvText, writeOutput } from './logic';

const csvOpts = { header: true, detectTypes: false };
// toCsv (lote 1) separates rows with CRLF; whether it ends with one does not matter here.
const lines = (r: ReturnType<typeof toCsvText>) =>
  r.ok ? r.text.replace(/\r\n$/, '').split('\r\n') : null;

describe('detectFormat', () => {
  it('follows the spec order: JSON, then CSV, then YAML', () => {
    expect(detectFormat('{"a": 1}')).toEqual({ format: 'json' });
    expect(detectFormat('[1, 2]')).toEqual({ format: 'json' });
    expect(detectFormat('nombre;edad\nAna;34')).toEqual({ format: 'csv', sep: ';' });
    expect(detectFormat('a\tb\n1\t2\n')).toEqual({ format: 'csv', sep: '\t' });
    expect(detectFormat('a: 1\nb: [1, 2]')).toEqual({ format: 'yaml' });
    // YAML flow mappings start like JSON but do not parse as JSON.
    expect(detectFormat('{a: 1}')).toEqual({ format: 'yaml' });
    // One comma but no second row with the same width: not CSV.
    expect(detectFormat('lista: a, b\notra: c')).toEqual({ format: 'yaml' });
  });
});

describe('readInput', () => {
  it('reads CSV with a header row into objects (e2e example)', () => {
    expect(readInput('nombre;edad\nAna;34', 'auto', csvOpts)).toEqual({
      ok: true,
      value: [{ nombre: 'Ana', edad: '34' }],
      format: 'csv',
      sep: ';',
      csvWarnings: [],
    });
  });

  it('reads CSV without header as arrays, detecting types when asked', () => {
    const r = readInput('id,activo,nota,cp\n1,true,,007', 'csv', {
      header: false,
      detectTypes: true,
    });
    expect(r).toMatchObject({
      ok: true,
      value: [
        ['id', 'activo', 'nota', 'cp'],
        [1, true, null, '007'],
      ],
    });
  });

  it('reports the CSV line of an unclosed quote', () => {
    expect(readInput('a,b\n1,"x\n2,3', 'csv', csvOpts)).toMatchObject({
      ok: false,
      format: 'csv',
      line: 2,
    });
  });

  it('reads YAML, resolving anchors, aliases and merge keys', () => {
    const r = readInput('base: &b\n  x: 1\nuno:\n  <<: *b\n  y: 2\ncopia: *b\n', 'auto', csvOpts);
    expect(r).toEqual({
      ok: true,
      format: 'yaml',
      value: { base: { x: 1 }, uno: { x: 1, y: 2 }, copia: { x: 1 } },
    });
  });

  it('reads several YAML documents as an array', () => {
    expect(readInput('a: 1\n---\nb: 2\n', 'yaml', csvOpts)).toEqual({
      ok: true,
      format: 'yaml',
      value: [{ a: 1 }, { b: 2 }],
      documents: 2,
    });
  });

  it('gives YAML errors with line and column', () => {
    expect(readInput('a: 1\nb: [1, 2\n', 'yaml', csvOpts)).toEqual({
      ok: false,
      format: 'yaml',
      line: 3,
      column: 1,
      message: 'Flow sequence in block collection must be sufficiently indented and end with a ]',
    });
  });

  it('gives JSON errors with line and column', () => {
    expect(readInput('{\n  "a": 1,\n}', 'json', csvOpts)).toMatchObject({
      ok: false,
      format: 'json',
      line: 3,
    });
  });

  it('keeps a __proto__ CSV header as a real column instead of setting the prototype (M4)', () => {
    const r = readInput('__proto__,b\n1,2', 'csv', csvOpts);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const [row] = r.value as Record<string, unknown>[];
    expect(Object.getPrototypeOf(row)).toBeNull();
    expect(Object.hasOwn(row, '__proto__')).toBe(true);
    expect(JSON.stringify(row)).toBe('{"__proto__":"1","b":"2"}');

    // The same null-prototype rows must also round-trip through YAML and back to CSV (M4): the
    // `yaml` library and toCsvText/flatten() only ever read own enumerable properties, so neither
    // silently drops the column.
    const yaml = writeOutput(r.value, 'yaml', ',');
    expect(yaml.ok && yaml.text).toContain('__proto__:');
    const csv = toCsvText(r.value, ',');
    expect(lines(csv)).toEqual(['__proto__,b', '1,2']);
  });
});

describe('writeOutput', () => {
  const data = [{ nombre: 'Ana', edad: 34 }];

  it('writes JSON with 2 spaces and YAML without line wrapping', () => {
    expect(writeOutput(data, 'json', ',')).toEqual({
      ok: true,
      text: '[\n  {\n    "nombre": "Ana",\n    "edad": 34\n  }\n]',
      dottedKeys: false,
    });
    expect(writeOutput(data, 'yaml', ',')).toMatchObject({ text: '- nombre: Ana\n  edad: 34\n' });
    const long = 'palabra '.repeat(30).trim();
    expect(writeOutput({ t: long }, 'yaml', ',')).toMatchObject({ text: `t: ${long}\n` });
  });

  it('writes CSV with the union of keys, flattened objects and JSON for arrays', () => {
    const r = toCsvText(
      [
        { id: 1, direccion: { ciudad: 'Madrid', cp: '28001' }, tags: ['a', 'b'] },
        { id: 2, extra: null, direccion: { ciudad: 'Vigo' } },
      ],
      ',',
    );
    expect(lines(r)).toEqual([
      'id,direccion.ciudad,direccion.cp,tags,extra',
      '1,Madrid,28001,"[""a"",""b""]",',
      '2,Vigo,,,',
    ]);
  });

  it('takes a single object as one row and arrays of arrays as they are', () => {
    expect(lines(toCsvText({ a: 1, b: 'x' }, ';'))).toEqual(['a;b', '1;x']);
    expect(
      lines(
        toCsvText(
          [
            ['a', 'b'],
            [1, null],
          ],
          '\t',
        ),
      ),
    ).toEqual(['a\tb', '1\t']);
  });

  it('refuses what is not a table', () => {
    expect(toCsvText([1, 2], ',')).toEqual({ ok: false, error: 'not-table' });
    expect(toCsvText('hola', ',')).toEqual({ ok: false, error: 'not-table' });
    expect(toCsvText([], ',')).toEqual({ ok: false, error: 'not-table' });
  });

  it('flags keys that already contain dots', () => {
    expect(toCsvText([{ 'a.b': 1 }], ',')).toMatchObject({ ok: true, dottedKeys: true });
  });

  it('keeps a __proto__ key as a CSV column instead of silently dropping it (M4)', () => {
    // JSON.parse never triggers the __proto__ setter (it assigns own properties directly), so
    // this is a normal object with a "__proto__" own key: the risk is entirely in flatten()'s
    // `out[key] = v` bracket assignment when it copies that key into the row being built for CSV.
    const value = JSON.parse('{"__proto__":"mal","b":2}') as Record<string, unknown>;
    const r = toCsvText([value], ',');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(lines(r)).toEqual(['__proto__,b', 'mal,2']);
  });

  it('round-trips CSV with quotes, line breaks and ; inside fields', () => {
    const rows = [{ texto: 'dijo "hola"; adiós\nfin', n: '1' }];
    const out = toCsvText(rows, ';');
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    const back = parseCsv(out.text, ';');
    expect(back.ok && back.rows).toEqual([
      ['texto', 'n'],
      ['dijo "hola"; adiós\nfin', '1'],
    ]);
    expect(readInput(out.text, 'csv', csvOpts)).toMatchObject({ ok: true, value: rows });
  });
});
