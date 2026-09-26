import { describe, expect, it } from 'vitest';
import {
  buildRegex,
  captureNames,
  explainError,
  findMatches,
  highlight,
  parseLiteral,
  replaceText,
  shouldDebounce,
} from './logic';

const ok = <T extends { ok: boolean }>(r: T) => {
  if (!r.ok) throw new Error('expected ok');
  return r as Extract<T, { ok: true }>;
};

describe('findMatches', () => {
  it('finds every match with the g flag and only the first without it', () => {
    expect(ok(findMatches('\\d+', 'g', 'a1 b22 c333')).matches.map((m) => m.text)).toEqual([
      '1',
      '22',
      '333',
    ]);
    expect(ok(findMatches('\\d+', '', 'a1 b22 c333')).matches.map((m) => m.text)).toEqual(['1']);
  });

  it('reports positions', () => {
    expect(ok(findMatches('b+', 'g', 'abba')).matches[0]).toMatchObject({
      index: 1,
      end: 3,
      text: 'bb',
    });
  });

  it('lists numbered and named groups', () => {
    const m = ok(
      findMatches('(?<year>\\d{4})-(\\d{2})(?:-(?<day>\\d{2}))?', 'g', '2026-09-26 y 2025-01'),
    ).matches;
    expect(m[0].groups).toEqual([
      { index: 1, name: 'year', value: '2026' },
      { index: 2, name: null, value: '09' },
      { index: 3, name: 'day', value: '26' },
    ]);
    expect(m[1].groups[2]).toEqual({ index: 3, name: 'day', value: undefined });
  });

  it('does not hang on empty matches', () => {
    const r = ok(findMatches('x*', 'g', 'abc'));
    expect(r.matches).toHaveLength(4);
    expect(ok(findMatches('^', 'gm', 'a\nb\nc')).matches).toHaveLength(3);
  });

  it('stops at the limit and says there were more', () => {
    const r = ok(findMatches('a', 'g', 'a'.repeat(50), 10));
    expect(r.matches).toHaveLength(10);
    expect(r.truncated).toBe(true);
    expect(ok(findMatches('a', 'g', 'a'.repeat(10), 10)).truncated).toBe(false);
  });

  it('returns nothing for an empty pattern', () => {
    expect(findMatches('', 'g', 'abc')).toEqual({ ok: true, matches: [], truncated: false });
  });

  it('honours the sticky flag', () => {
    expect(ok(findMatches('a', 'y', 'ba')).matches).toHaveLength(0);
    expect(ok(findMatches('a', 'gy', 'aab')).matches).toHaveLength(2);
  });
});

describe('errors', () => {
  it.each([
    ['(', 'unterminatedGroup'],
    ['a)', 'unmatchedParen'],
    ['*', 'nothingToRepeat'],
    ['[a', 'unterminatedClass'],
    ['(?<1a>x)', 'groupName'],
    ['(?<a>x)(?<a>y)', 'duplicateName'],
    ['a{3,1}', 'quantifierOrder'],
    ['\\', 'trailingBackslash'],
    ['(?x)', 'invalidGroup'],
    ['[z-a]', 'rangeOrder'],
  ])('explains %j', (pattern, hint) => {
    const r = buildRegex(pattern, '');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.hint).toBe(hint);
  });

  // Each pattern throws in V8 (Node, Chrome); the real engine message is what gets matched.
  it.each([
    ['a{', 'u', 'incompleteQuantifier'],
    ['\\d{2', 'u', 'incompleteQuantifier'],
    ['\\-', 'u', 'invalidEscape'],
    ['\\a', 'u', 'invalidEscape'],
    ['\\p{Foo}', 'u', 'invalidProperty'],
    ['\\k<m>', 'u', 'invalidNamedRef'],
    ['(?<n>a)\\k<m>', '', 'invalidNamedRef'],
    ['[a-\\d]', 'u', 'invalidClass'],
  ])('explains %j with flags %j', (pattern, flags, hint) => {
    const r = buildRegex(pattern, flags);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.hint).toBe(hint);
  });

  it('explains bad flags and lone brackets in unicode mode', () => {
    const flags = buildRegex('a', 'gg');
    expect(!flags.ok && flags.error.hint).toBe('flags');
    const bracket = buildRegex(']', 'u');
    expect(!bracket.ok && bracket.error.hint).toBe('loneBracket');
  });

  it('recognises Firefox and Safari wording too', () => {
    expect(explainError('unterminated parenthetical')).toBe('unterminatedGroup');
    expect(explainError('missing ) after group')).toBe('unterminatedGroup');
    expect(explainError('missing terminating ] for character class')).toBe('unterminatedClass');
    expect(explainError('invalid regexp group')).toBe('invalidGroup');
    expect(explainError('something else')).toBeNull();
  });
});

describe('captureNames', () => {
  it('ignores escapes, classes, lookarounds and non-capturing groups', () => {
    expect(captureNames('\\((a)[(](?:b)(?=c)(?<=d)(?<!e)(?<n>f)')).toEqual([null, 'n']);
  });
});

describe('highlight', () => {
  it('splits the text into plain and matched pieces', () => {
    const r = ok(findMatches('\\d+', 'g', 'a1b22'));
    expect(highlight('a1b22', r.matches)).toEqual([
      { text: 'a', match: null },
      { text: '1', match: 0 },
      { text: 'b', match: null },
      { text: '22', match: 1 },
    ]);
  });
});

describe('replaceText', () => {
  it('expands numbered and named references', () => {
    expect(replaceText('(\\w+)@(\\w+)', 'g', 'ana@x luis@y', '$2:$1')).toEqual({
      ok: true,
      output: 'x:ana y:luis',
      count: 2,
    });
    expect(replaceText('(?<d>\\d+)', 'g', 'a1b2', '[$<d>]')).toEqual({
      ok: true,
      output: 'a[1]b[2]',
      count: 2,
    });
  });

  it('replaces only the first match without g', () => {
    expect(replaceText('a', '', 'aaa', 'b')).toEqual({ ok: true, output: 'baa', count: 1 });
    expect(replaceText('z', '', 'aaa', 'b')).toEqual({ ok: true, output: 'aaa', count: 0 });
  });

  it('keeps context-dependent patterns right (anchors and lookbehind)', () => {
    expect(replaceText('(?<=\\$)\\d+', 'g', 'cost $10 and 20', 'N')).toEqual({
      ok: true,
      output: 'cost $N and 20',
      count: 1,
    });
  });

  it('returns the error for invalid patterns', () => {
    expect(replaceText('(', 'g', 'x', 'y').ok).toBe(false);
  });
});

describe('parseLiteral', () => {
  it('splits a pasted /pattern/flags literal', () => {
    expect(parseLiteral('/\\d+/gi')).toEqual({ pattern: '\\d+', flags: 'gi' });
    expect(parseLiteral('/a/b/')).toEqual({ pattern: 'a/b', flags: '' });
    expect(parseLiteral('\\d+')).toBeNull();
    expect(parseLiteral('/a/zz')).toBeNull();
  });
});

describe('shouldDebounce', () => {
  it('debounces only long texts', () => {
    expect(shouldDebounce('x'.repeat(100))).toBe(false);
    expect(shouldDebounce('x'.repeat(20_001))).toBe(true);
  });
});
