import { describe, expect, it } from 'vitest';
import { toCsv } from './csv';

describe('toCsv', () => {
  it('joins fields with the separator and lines with CRLF', () => {
    expect(
      toCsv([
        ['a', 'b'],
        [1, true],
      ]),
    ).toBe('a,b\r\n1,true');
  });

  it('quotes only the fields that need it and doubles quotes', () => {
    expect(toCsv([['x,y', 'say "hi"', 'plain']])).toBe('"x,y","say ""hi""",plain');
    expect(toCsv([['line\nbreak', 'cr\rhere']])).toBe('"line\nbreak","cr\rhere"');
    expect(toCsv([[' lead', 'trail ', 'in side']])).toBe('" lead","trail ",in side');
  });

  it('writes null as an empty field', () => {
    expect(toCsv([[null, 'a', null]])).toBe(',a,');
  });

  it('quotes by the chosen separator only', () => {
    expect(toCsv([['a;b', 'c,d']], ';')).toBe('"a;b";c,d');
    expect(toCsv([['a\tb', 'c;d']], '\t')).toBe('"a\tb"\tc;d');
  });

  it('returns an empty string for no rows', () => {
    expect(toCsv([])).toBe('');
  });
});
