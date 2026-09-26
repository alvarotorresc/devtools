import { describe, expect, it } from 'vitest';
import {
  MAX_CELLS,
  collapse,
  computeDiff,
  countChanges,
  diffLines,
  diffWords,
  shouldDebounce,
  splitLines,
  toRows,
  unifiedText,
} from './logic';

describe('computeDiff (legacy behaviour)', () => {
  it('detects no differences', () => {
    const result = computeDiff(['a', 'b', 'c'], ['a', 'b', 'c']);
    expect(result.every((d) => d.type === 'equal')).toBe(true);
  });

  it('detects additions', () => {
    const result = computeDiff(['a', 'c'], ['a', 'b', 'c']);
    expect(result).toContainEqual({ type: 'add', text: 'b' });
  });

  it('detects removals', () => {
    const result = computeDiff(['a', 'b', 'c'], ['a', 'c']);
    expect(result).toContainEqual({ type: 'remove', text: 'b' });
  });

  it('handles empty arrays', () => {
    expect(computeDiff([], [])).toEqual([]);
    expect(computeDiff(['a'], [])).toEqual([{ type: 'remove', text: 'a' }]);
    expect(computeDiff([], ['a'])).toEqual([{ type: 'add', text: 'a' }]);
  });

  it('lists removals before additions for a changed line', () => {
    expect(computeDiff(['x'], ['y'])).toEqual([
      { type: 'remove', text: 'x' },
      { type: 'add', text: 'y' },
    ]);
  });
});

describe('diffLines', () => {
  it('numbers lines on both sides', () => {
    const { ops } = diffLines(['a', 'b', 'c'], ['a', 'B', 'c', 'd']);
    expect(ops).toEqual([
      { type: 'equal', oldText: 'a', newText: 'a', oldNo: 1, newNo: 1 },
      { type: 'remove', oldText: 'b', oldNo: 2 },
      { type: 'add', newText: 'B', newNo: 2 },
      { type: 'equal', oldText: 'c', newText: 'c', oldNo: 3, newNo: 3 },
      { type: 'add', newText: 'd', newNo: 4 },
    ]);
  });

  it('can ignore case and whitespace changes', () => {
    const a = ['Hola  mundo', 'fin'];
    const b = ['hola mundo ', 'fin'];
    expect(countChanges(diffLines(a, b).ops)).toEqual({ added: 1, removed: 1 });
    expect(countChanges(diffLines(a, b, { ignoreCase: true, ignoreWhitespace: true }).ops)).toEqual(
      {
        added: 0,
        removed: 0,
      },
    );
    // Equal lines keep each side's original text.
    const eq = diffLines(a, b, { ignoreCase: true, ignoreWhitespace: true }).ops[0];
    expect(eq).toMatchObject({ oldText: 'Hola  mundo', newText: 'hola mundo ' });
  });

  it('stays fast on big, mostly equal texts (common head and tail are skipped)', () => {
    const a = Array.from({ length: 50_000 }, (_, i) => `line ${i}`);
    const b = [...a];
    b[25_000] = 'changed';
    const t = performance.now();
    const { ops, tooLarge } = diffLines(a, b);
    expect(performance.now() - t).toBeLessThan(1000);
    expect(tooLarge).toBe(false);
    expect(countChanges(ops)).toEqual({ added: 1, removed: 1 });
  });

  it('gives up line matching (but still lists everything) when the changed block is huge', () => {
    const n = Math.ceil(Math.sqrt(MAX_CELLS)) + 10;
    const a = Array.from({ length: n }, (_, i) => `a${i}`);
    const b = Array.from({ length: n }, (_, i) => `b${i}`);
    const { ops, tooLarge } = diffLines(a, b);
    expect(tooLarge).toBe(true);
    expect(countChanges(ops)).toEqual({ added: n, removed: n });
  });
});

describe('diffWords', () => {
  it('marks only the words that changed', () => {
    const w = diffWords('const total = 10;', 'const suma = 10;');
    expect(w.old).toEqual([
      { text: 'const ', changed: false },
      { text: 'total', changed: true },
      { text: ' = 10;', changed: false },
    ]);
    expect(w.new).toEqual([
      { text: 'const ', changed: false },
      { text: 'suma', changed: true },
      { text: ' = 10;', changed: false },
    ]);
  });

  it('handles accents as part of words', () => {
    const w = diffWords('canción vieja', 'canción nueva');
    expect(w.new).toEqual([
      { text: 'canción ', changed: false },
      { text: 'nueva', changed: true },
    ]);
  });

  it('respects ignore case', () => {
    expect(diffWords('Hola', 'hola', { ignoreCase: true }).new).toEqual([
      { text: 'hola', changed: false },
    ]);
  });
});

describe('rows, collapse and output', () => {
  const { ops } = diffLines(
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'],
    ['a', 'b', 'c', 'd', 'E', 'f', 'g', 'h', 'i', 'j'],
  );

  it('pairs removed and added lines into "change" rows', () => {
    const rows = toRows(ops);
    const change = rows.find((r) => r.type === 'change')!;
    expect(change.left).toEqual({ no: 5, segments: [{ text: 'e', changed: true }] });
    expect(change.right).toEqual({ no: 5, segments: [{ text: 'E', changed: true }] });
    expect(rows.at(-1)).toEqual({
      type: 'add',
      left: null,
      right: { no: 10, segments: [{ text: 'j', changed: true }] },
    });
  });

  it('collapses long equal runs, keeping context', () => {
    const items = collapse(toRows(ops), 1);
    expect(items.map((i) => (i.kind === 'skip' ? `skip ${i.count}` : i.row.type))).toEqual([
      'skip 3',
      'equal',
      'change',
      'equal',
      'skip 2',
      'equal',
      'add',
    ]);
  });

  it('counts and prints the unified diff', () => {
    expect(countChanges(ops)).toEqual({ added: 2, removed: 1 });
    expect(unifiedText(diffLines(['a', 'b'], ['a', 'c']).ops)).toBe('  a\n- b\n+ c');
  });

  it('splits text into lines, treating empty text as no lines', () => {
    expect(splitLines('')).toEqual([]);
    expect(splitLines('a\r\nb\rc')).toEqual(['a', 'b', 'c']);
  });

  it('debounces only large inputs', () => {
    expect(shouldDebounce('a', 'b')).toBe(false);
    expect(shouldDebounce('x'.repeat(15_000), 'y'.repeat(6_000))).toBe(true);
  });
});
