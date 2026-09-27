import { describe, expect, it } from 'vitest';
import { diffJson, preview, reportText } from './logic';

describe('diffJson', () => {
  it('matches the e2e example: key order does not matter', () => {
    const r = diffJson({ a: 1, b: 2 }, { b: 3, a: 1, c: 4 });
    expect(r.counts).toEqual({ added: 1, removed: 0, changed: 1 });
    expect(r.changes).toEqual([
      { kind: 'changed', path: '$.b', before: '2', after: '3' },
      { kind: 'added', path: '$.c', after: '4' },
    ]);
  });

  it('reports nothing for equivalent documents, including 1 and 1.0', () => {
    const a = JSON.parse('{"x": 1, "y": {"z": [1, 2]}}');
    const b = JSON.parse('{"y": {"z": [1.0, 2]}, "x": 1.0}');
    expect(diffJson(a, b)).toEqual({
      changes: [],
      counts: { added: 0, removed: 0, changed: 0 },
      hidden: 0,
    });
  });

  it('compares arrays by index', () => {
    expect(diffJson([1, 2, 3], [1, 3]).changes).toEqual([
      { kind: 'changed', path: '$[1]', before: '2', after: '3' },
      { kind: 'removed', path: '$[2]', before: '3' },
    ]);
    expect(diffJson({ l: [] }, { l: ['a'] }).changes).toEqual([
      { kind: 'added', path: '$.l[0]', after: '"a"' },
    ]);
  });

  it('treats different types as a change, null against {} included', () => {
    expect(diffJson({ v: null }, { v: {} }).changes).toEqual([
      { kind: 'changed', path: '$.v', before: 'null', after: '{}' },
    ]);
    expect(diffJson([1], { 0: 1 }).changes).toEqual([
      { kind: 'changed', path: '$', before: '[1]', after: '{"0":1}' },
    ]);
  });

  it('lists nested changes in document order with readable paths', () => {
    const a = { usuarios: [{ email: 'a@x.es', 'fecha alta': 1 }], fin: true };
    const b = { usuarios: [{ email: 'b@x.es' }], fin: true, nuevo: null };
    expect(diffJson(a, b).changes.map((c) => `${c.kind} ${c.path}`)).toEqual([
      'changed $.usuarios[0].email',
      'removed $.usuarios[0]["fecha alta"]',
      'added $.nuevo',
    ]);
  });

  it('survives 10 000 levels of nesting without overflowing the stack', () => {
    const deep = (leaf: number) => JSON.parse('['.repeat(10_000) + leaf + ']'.repeat(10_000));
    const r = diffJson(deep(1), deep(2));
    expect(r.counts.changed).toBe(1);
    expect(r.changes[0].path).toBe('$' + '[0]'.repeat(10_000));
  });

  it('lists at most `limit` changes and counts the rest', () => {
    const a = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`k${i}`, i]));
    const r = diffJson(a, {}, 10);
    expect(r.changes).toHaveLength(10);
    expect(r.counts.removed).toBe(30);
    expect(r.hidden).toBe(20);
  });
});

describe('preview', () => {
  it('writes compact JSON', () => {
    expect(preview({ a: [1, 'x', null], b: { c: true } })).toBe(
      '{"a":[1,"x",null],"b":{"c":true}}',
    );
  });

  it('cuts long values at 120 characters, even when they are huge or deep', () => {
    const long = preview('x'.repeat(500));
    expect(long).toHaveLength(120);
    expect(long.endsWith('…')).toBe(true);
    const deep = JSON.parse('['.repeat(10_000) + ']'.repeat(10_000));
    expect(preview(deep)).toBe('['.repeat(119) + '…');
  });
});

describe('reportText', () => {
  it('prints one line per change with its symbol', () => {
    const r = diffJson({ a: 1, b: 2, x: 0 }, { b: 3, a: 1, c: 4 });
    expect(reportText(r.changes)).toBe('~ $.b: 2 → 3\n− $.x: 0\n+ $.c: 4');
  });
});
