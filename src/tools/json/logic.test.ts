import { describe, expect, it } from 'vitest';
import {
  DEBOUNCE_THRESHOLD,
  byteSize,
  errorLocation,
  firstInvalidIndex,
  formatJson,
  jsonPath,
  jsonType,
  lineAt,
  lineOffset,
  minifyJson,
  parseJson,
  shouldDebounce,
  sortKeysDeep,
} from './logic';

const parsed = (s: string) => {
  const r = parseJson(s);
  if (!r.ok) throw new Error('expected valid JSON');
  return r.value;
};

describe('formatJson', () => {
  it('formats with 2 spaces by default (same output as the old tool)', () => {
    expect(formatJson(parsed('{"a":1}'))).toBe('{\n  "a": 1\n}');
  });

  it('supports 4 spaces and tabs', () => {
    expect(formatJson(parsed('{"a":1}'), '4')).toBe('{\n    "a": 1\n}');
    expect(formatJson(parsed('{"a":1}'), 'tab')).toBe('{\n\t"a": 1\n}');
  });

  it('sorts keys deeply, including objects inside arrays', () => {
    const v = parsed('{"b":1,"a":{"d":1,"c":2},"list":[{"z":1,"y":2}]}');
    expect(minifyJson(v, true)).toBe('{"a":{"c":2,"d":1},"b":1,"list":[{"y":2,"z":1}]}');
    expect(sortKeysDeep([3, 1])).toEqual([3, 1]);
  });
});

describe('minifyJson', () => {
  it('removes whitespace', () => {
    expect(minifyJson(parsed('{\n  "a": 1\n}'))).toBe('{"a":1}');
  });
});

describe('parseJson', () => {
  it('accepts valid JSON, including primitives', () => {
    expect(parseJson('{"a":1}').ok).toBe(true);
    expect(parseJson('42').ok).toBe(true);
  });

  it('reports the line of a trailing comma on a later line', () => {
    const r = parseJson('{\n  "a": 1,\n}');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.line).toBe(3);
      expect(r.error.column).not.toBeNull();
      expect(r.error.message.length).toBeGreaterThan(0);
    }
  });

  it('locates an unexpected end of input', () => {
    const r = parseJson('{"a":');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.line).toBe(1);
  });

  it('locates a single-quoted value on a single line', () => {
    const r = parseJson('{"a": \'b\'}');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.line).toBe(1);
      expect(r.error.column).toBe(7);
    }
  });

  it('locates a single-quoted value on a later line', () => {
    const r = parseJson('{\n  "a": 1,\n  "b": \'x\'\n}');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.line).toBe(3);
  });

  it('does not confuse an invalid token with a bare true/false/null it sits next to', () => {
    const r = parseJson('{"ok": true, "v": undefined}');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.line).toBe(1);
      expect(r.error.column).toBe(19);
    }
  });
});

describe('errorLocation', () => {
  it('reads "line X column Y" messages', () => {
    expect(errorLocation('Bad thing (line 4 column 2)', '')).toEqual({ line: 4, column: 2 });
  });

  it('converts "position N" into line and column', () => {
    expect(errorLocation('Unexpected token } in JSON at position 5', 'ab\ncdef')).toEqual({
      line: 2,
      column: 3,
    });
  });

  it('returns null when the message has no location', () => {
    expect(errorLocation('Something odd', '{}')).toBeNull();
  });

  it('never trusts a fake location inside the V8 snippet', () => {
    // The message claims "position 5", which would clamp to column 4 in 'abc' (length 3).
    // The real answer comes from the token walker: 'abc' is a bare word, invalid at index 0,
    // i.e. column 1 — a different, honestly-computed value, proving the fake position was
    // never used.
    expect(errorLocation('Unexpected token \'x\', "position 5" is not valid JSON', 'abc')).toEqual({
      line: 1,
      column: 1,
    });
  });
});

describe('firstInvalidIndex', () => {
  it('returns null when every token is valid JSON, even odd-looking numbers and null', () => {
    expect(firstInvalidIndex('{"a": [1, -2.5e3, null]}')).toBeNull();
  });

  it('finds a bare word that is not true/false/null', () => {
    expect(firstInvalidIndex('{"a": NaN}')).toBe(6);
  });
});

describe('helpers', () => {
  it('builds JSONPath-like paths', () => {
    expect(jsonPath('$', 'a')).toBe('$.a');
    expect(jsonPath('$.a', 0)).toBe('$.a[0]');
    expect(jsonPath('$', 'a b')).toBe('$["a b"]');
  });

  it('names JSON types', () => {
    expect(jsonType(null)).toBe('null');
    expect(jsonType([])).toBe('array');
    expect(jsonType({})).toBe('object');
    expect(jsonType('x')).toBe('string');
    expect(jsonType(1)).toBe('number');
    expect(jsonType(true)).toBe('boolean');
  });

  it('finds lines and their offsets', () => {
    const text = 'one\ntwo\nthree';
    expect(lineAt(text, 2)).toBe('two');
    expect(lineOffset(text, 3)).toBe(8);
    expect(lineAt(text, 9)).toBe('');
  });

  it('counts UTF-8 bytes', () => {
    expect(byteSize('ñ')).toBe(2);
  });

  it('debounces only very large inputs', () => {
    expect(shouldDebounce('x'.repeat(DEBOUNCE_THRESHOLD))).toBe(false);
    expect(shouldDebounce('x'.repeat(DEBOUNCE_THRESHOLD + 1))).toBe(true);
  });
});
