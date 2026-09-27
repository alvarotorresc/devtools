import { describe, expect, it } from 'vitest';
import { CODES, codeFromHash, normalize, searchCodes } from './logic';

const codes = (list: readonly { code: number }[]) => list.map((c) => c.code);

describe('the table', () => {
  it('has every code the spec lists, once and in order', () => {
    const expected = [
      100, 101, 102, 103, 200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304,
      305, 306, 307, 308, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414,
      415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451, 500, 501, 502, 503, 504,
      505, 506, 507, 508, 510, 511,
    ];
    expect(codes(CODES)).toEqual(expected);
  });

  it('gives every code a phrase, a Spanish name, both descriptions and a reference', () => {
    for (const c of CODES) {
      expect(c.phrase, String(c.code)).toBeTruthy();
      expect(c.es, String(c.code)).toBeTruthy();
      expect(c.desc.es, String(c.code)).toBeTruthy();
      expect(c.desc.en, String(c.code)).toBeTruthy();
      expect(c.ref, String(c.code)).toMatch(/^RFC \d{4}$/);
    }
  });

  it('uses the current RFC 9110 names and the right references', () => {
    const by = (n: number) => CODES.find((c) => c.code === n)!;
    expect(by(413).phrase).toBe('Content Too Large');
    expect(by(422)).toMatchObject({ phrase: 'Unprocessable Content', ref: 'RFC 9110' });
    expect(by(418)).toMatchObject({ ref: 'RFC 2324', note: 'joke' });
    expect(by(306).note).toBe('unused');
    expect(by(451).ref).toBe('RFC 7725');
    expect(by(425).ref).toBe('RFC 8470');
    expect(by(103).ref).toBe('RFC 8297');
  });
});

describe('searchCodes', () => {
  it('finds by code prefix', () => {
    expect(codes(searchCodes('404'))).toEqual([404]);
    expect(codes(searchCodes('40'))).toEqual([400, 401, 402, 403, 404, 405, 406, 407, 408, 409]);
    expect(codes(searchCodes('5')).length).toBe(11);
  });

  it('finds by text in either language, ignoring accents and case', () => {
    expect(codes(searchCodes('teapot'))).toEqual([418]);
    expect(codes(searchCodes('TETERA'))).toEqual([418]);
    expect(codes(searchCodes('demasiadas peticiones'))).toEqual([429]);
    expect(codes(searchCodes('autenticacion de red'))).toEqual([511]);
    expect(codes(searchCodes('not found'))).toEqual([404]);
  });

  it('filters by group', () => {
    expect(codes(searchCodes('', '1'))).toEqual([100, 101, 102, 103]);
    expect(codes(searchCodes('redirect', '3'))).toEqual([302, 303, 307, 308]);
    expect(searchCodes('404', '5')).toEqual([]);
  });
});

describe('helpers', () => {
  it('normalizes accents and case', () => {
    expect(normalize('Petición Única')).toBe('peticion unica');
  });

  it('reads a known code from the URL hash', () => {
    expect(codeFromHash('#404')).toBe(404);
    expect(codeFromHash('#999')).toBeNull();
    expect(codeFromHash('#abc')).toBeNull();
  });
});
