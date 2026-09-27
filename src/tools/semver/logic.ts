import satisfies from 'semver/functions/satisfies';
import valid from 'semver/functions/valid';
import maxSatisfying from 'semver/ranges/max-satisfying';
import minVersion from 'semver/ranges/min-version';
import validRange from 'semver/ranges/valid';
import type { Locale } from '../types';

export interface RangeOptions {
  includePrerelease: boolean;
}

export type RangeCheck = { ok: true; normalized: string; min: string | null } | { ok: false };

export type VersionCheck =
  { input: string; ok: true; version: string; satisfies: boolean } | { input: string; ok: false };

/** `validRange` with ` || ` spaced out for reading. Invalid ranges → `{ ok: false }`. */
export function checkRange(range: string, opts: RangeOptions): RangeCheck {
  const normalized = validRange(range.trim(), opts);
  if (normalized === null) return { ok: false };
  return {
    ok: true,
    normalized: normalized.split('||').join(' || '),
    min: minVersion(range.trim())?.version ?? null,
  };
}

/** One entry per non-empty line. */
export function checkVersions(range: string, text: string, opts: RangeOptions): VersionCheck[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((input) => {
      const version = valid(input);
      if (version === null) return { input, ok: false as const };
      return {
        input,
        ok: true as const,
        version,
        satisfies: satisfies(version, range.trim(), opts),
      };
    });
}

export function highest(checks: VersionCheck[], range: string, opts: RangeOptions): string | null {
  const versions = checks.flatMap((c) => (c.ok ? [c.version] : []));
  return maxSatisfying(versions, range.trim(), opts);
}

const WORDS = {
  es: {
    any: 'cualquier versión',
    exact: 'exactamente {v}',
    '>=': 'desde {v}, incluida',
    '>': 'después de {v}',
    '<': 'hasta antes de {v}',
    '<=': 'hasta {v}, incluida',
    or: ' o ',
  },
  en: {
    any: 'any version',
    exact: 'exactly {v}',
    '>=': 'from {v}, inclusive',
    '>': 'after {v}',
    '<': 'up to but not including {v}',
    '<=': 'up to {v}, inclusive',
    or: ' or ',
  },
} as const;

const COMPARATOR = /^(>=|<=|>|<|=)?v?(.+)$/;

/**
 * Reads a normalised range in words: "desde 1.2.3, incluida, hasta antes de 2.0.0".
 * The `-0` that semver adds to upper bounds (so they exclude prereleases of that version) is hidden.
 */
export function describeRange(normalized: string, locale: Locale): string {
  const w = WORDS[locale];
  return normalized
    .split('||')
    .map((set) => {
      const parts = set.trim().split(/\s+/).filter(Boolean);
      if (parts.length === 0 || parts.every((p) => p === '*')) return w.any;
      return parts
        .map((p) => {
          const [, op = '=', v] = COMPARATOR.exec(p)!;
          // Only the exclusive upper bound (`<`) gets its `-0` hidden: that is the one semver
          // appends on its own, to also exclude prereleases of that version. A `-0` on `>=`
          // (from `includePrerelease`) is a real part of the lower bound and must stay visible.
          const version = op === '<' ? v.replace(/-0$/, '') : v;
          const template = op === '=' ? w.exact : w[op as '>=' | '>' | '<' | '<='];
          return template.replace('{v}', version);
        })
        .join(', ');
    })
    .join(w.or);
}
