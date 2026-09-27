import { describe, expect, it } from 'vitest';
import { detectSeparator, parseCsv, toCsv } from './csv';

describe('parseCsv', () => {
  it('reads simple rows with any line ending and ignores the final break', () => {
    expect(parseCsv('a,b\r\n1,2\n3,4\r5,6\n')).toEqual({
      ok: true,
      rows: [
        ['a', 'b'],
        ['1', '2'],
        ['3', '4'],
        ['5', '6'],
      ],
      sep: ',',
      warnings: [],
    });
  });

  it('handles quoted fields with separators, line breaks and doubled quotes', () => {
    const r = parseCsv('nombre;nota\n"Pérez; Ana";"dijo ""hola""\nadiós"\n');
    expect(r).toMatchObject({
      ok: true,
      sep: ';',
      rows: [
        ['nombre', 'nota'],
        ['Pérez; Ana', 'dijo "hola"\nadiós'],
      ],
    });
  });

  it('drops the BOM and keeps empty fields', () => {
    expect(parseCsv('\uFEFFa,,c')).toMatchObject({ ok: true, rows: [['a', '', 'c']] });
  });

  it('detects the separator from the first row, outside quotes', () => {
    expect(detectSeparator('a;b;c\n1,2,3')).toBe(';');
    expect(detectSeparator('a\tb\n')).toBe('\t');
    expect(detectSeparator('"x;y;z",b\n')).toBe(',');
    expect(detectSeparator('a;b,c')).toBe(',');
    expect(detectSeparator('solo')).toBe(',');
  });

  it('uses the given separator instead of detecting one', () => {
    expect(parseCsv('a;b,c', ',')).toMatchObject({ rows: [['a;b', 'c']], sep: ',' });
  });

  it('reports an unclosed quote with the line where it starts', () => {
    expect(parseCsv('a,b\n1,"abierta\n2,3')).toEqual({
      ok: false,
      line: 2,
      reason: 'unclosed-quote',
    });
  });

  it('warns (without failing) about rows with a different column count', () => {
    const r = parseCsv('a,b,c,d\n1,2,3,4\n1,2,3,4\n1,2,3,4\n1,2,3');
    expect(r).toMatchObject({ ok: true, warnings: [{ row: 5, columns: 3, expected: 4 }] });
  });

  it('reads an empty text as no rows', () => {
    expect(parseCsv('')).toEqual({ ok: true, rows: [], sep: ',', warnings: [] });
  });

  it('round-trips what toCsv writes', () => {
    const rows = [
      ['id', 'texto'],
      ['1', 'con; punto y coma'],
      ['2', 'con "comillas"\ny salto'],
      ['3', ' espacios '],
    ];
    for (const sep of [',', ';', '\t'] as const) {
      expect(parseCsv(toCsv(rows, sep), sep)).toMatchObject({ ok: true, rows });
    }
  });
});
