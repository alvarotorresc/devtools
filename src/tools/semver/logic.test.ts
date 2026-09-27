import { describe, expect, it } from 'vitest';
import { checkRange, checkVersions, describeRange, highest } from './logic';

const plain = { includePrerelease: false };
const pre = { includePrerelease: true };

describe('checkRange', () => {
  it('normalises ranges like npm does', () => {
    expect(checkRange('^1.2.3', plain)).toEqual({
      ok: true,
      normalized: '>=1.2.3 <2.0.0-0',
      min: '1.2.3',
    });
    expect(checkRange('~1.2', plain)).toMatchObject({ normalized: '>=1.2.0 <1.3.0-0' });
    expect(checkRange('^0.0.1', plain)).toMatchObject({ normalized: '>=0.0.1 <0.0.2-0' });
    expect(checkRange('1.2.3 - 2.3.4', plain)).toMatchObject({ normalized: '>=1.2.3 <=2.3.4' });
    expect(checkRange('1.x || 2.x', plain)).toMatchObject({
      normalized: '>=1.0.0 <2.0.0-0 || >=2.0.0 <3.0.0-0',
      min: '1.0.0',
    });
    expect(checkRange('*', plain)).toMatchObject({ normalized: '*', min: '0.0.0' });
  });

  it('rejects invalid ranges', () => {
    expect(checkRange('foo', plain)).toEqual({ ok: false });
    expect(checkRange('^^1', plain)).toEqual({ ok: false });
  });
});

describe('checkVersions', () => {
  it('checks each line against the range', () => {
    const r = checkVersions('^1.2.3', '1.2.3\n1.9.0\n\n2.0.0\n', plain);
    expect(r).toEqual([
      { input: '1.2.3', ok: true, version: '1.2.3', satisfies: true },
      { input: '1.9.0', ok: true, version: '1.9.0', satisfies: true },
      { input: '2.0.0', ok: true, version: '2.0.0', satisfies: false },
    ]);
    expect(highest(r, '^1.2.3', plain)).toBe('1.9.0');
  });

  it('flags lines that are not semver versions', () => {
    expect(checkVersions('^1.0.0', '1.2\nhola\nv1.4.0', plain)).toEqual([
      { input: '1.2', ok: false },
      { input: 'hola', ok: false },
      { input: 'v1.4.0', ok: true, version: '1.4.0', satisfies: true },
    ]);
  });

  it('follows npm rules for prereleases, unless they are included', () => {
    expect(checkVersions('^1.2.3', '1.3.0-beta.1', plain)[0]).toMatchObject({ satisfies: false });
    expect(checkVersions('^1.2.3', '1.3.0-beta.1', pre)[0]).toMatchObject({ satisfies: true });
    // A prerelease in the range lets through prereleases of that same version only.
    expect(checkVersions('^1.2.3-beta.2', '1.2.3-beta.5\n1.2.4-beta', plain)).toMatchObject([
      { satisfies: true },
      { satisfies: false },
    ]);
  });

  it('has no highest match when nothing satisfies', () => {
    expect(highest(checkVersions('^3.0.0', '1.0.0\n2.0.0', plain), '^3.0.0', plain)).toBeNull();
  });
});

describe('describeRange', () => {
  it('reads caret, tilde and hyphen ranges in both languages', () => {
    expect(describeRange('>=1.2.3 <2.0.0-0', 'es')).toBe(
      'desde 1.2.3, incluida, hasta antes de 2.0.0',
    );
    expect(describeRange('>=1.2.3 <2.0.0-0', 'en')).toBe(
      'from 1.2.3, inclusive, up to but not including 2.0.0',
    );
    expect(describeRange('>=1.2.3 <=2.3.4', 'es')).toBe(
      'desde 1.2.3, incluida, hasta 2.3.4, incluida',
    );
  });

  it('reads unions, exact versions and "any"', () => {
    expect(describeRange('>=1.0.0 <2.0.0-0 || >=3.0.0', 'es')).toBe(
      'desde 1.0.0, incluida, hasta antes de 2.0.0 o desde 3.0.0, incluida',
    );
    expect(describeRange('1.2.3', 'es')).toBe('exactamente 1.2.3');
    expect(describeRange('*', 'en')).toBe('any version');
    expect(describeRange('>1.2.3', 'en')).toBe('after 1.2.3');
  });

  it('keeps the prerelease note on a lower bound, unlike the hidden upper-bound -0', () => {
    // With includePrerelease, semver also appends -0 to the lower bound: it is now a real
    // part of the boundary (it lets prereleases of 1.0.0 itself satisfy the range), not the
    // "exclude prereleases of this version" marker that the upper bound's -0 means.
    expect(checkRange('1.x', pre)).toMatchObject({ normalized: '>=1.0.0-0 <2.0.0-0' });
    expect(describeRange('>=1.0.0-0 <2.0.0-0', 'es')).toBe(
      'desde 1.0.0-0, incluida, hasta antes de 2.0.0',
    );
  });
});
