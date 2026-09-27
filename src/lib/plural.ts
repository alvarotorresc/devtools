// Shared by every tool that shows a count in a locale-correct singular or plural form.

import { fill } from '../i18n/fill';
import type { Locale } from '../tools/types';

/**
 * Picks `one` or `other` for `n` in `locale` via `Intl.PluralRules`, then fills `{n}` into it.
 * Spanish and English both use "one" only for exactly 1 (0 and everything else is "other"),
 * but the check is against `select(n) === 'one'`, not `!== 'other'`, because newer CLDR data
 * gives Spanish a `many` category for very large numbers (e.g. 1 000 000).
 */
export function plural(locale: Locale, n: number, one: string, other: string): string {
  const template = new Intl.PluralRules(locale).select(n) === 'one' ? one : other;
  return fill(template, { n });
}
