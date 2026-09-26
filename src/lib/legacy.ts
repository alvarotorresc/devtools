import { homeHref, isLocale, toolHref } from '../i18n';
import { toolById } from '../tools/registry';
import type { Locale } from '../tools/types';

export function pickLocale(stored: string | null, languages: readonly string[]): Locale {
  if (stored && isLocale(stored)) return stored;
  for (const lang of languages) {
    const base = lang.toLowerCase().split('-')[0];
    if (isLocale(base)) return base;
  }
  return 'es';
}

export function resolveLegacyHash(hash: string, locale: Locale): string {
  const id = hash.replace(/^#/, '').trim();
  const tool = id ? toolById(id) : undefined;
  return tool ? toolHref(locale, tool) : homeHref(locale);
}
