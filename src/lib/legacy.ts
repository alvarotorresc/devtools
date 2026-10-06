import { homeHref, toolHref } from '../i18n';
import { toolById } from '../tools/registry';
import type { Locale } from '../tools/types';

export function resolveLegacyHash(hash: string, locale: Locale): string {
  const id = hash.replace(/^#/, '').trim();
  const tool = id ? toolById(id) : undefined;
  return tool ? toolHref(locale, tool) : homeHref(locale);
}
