import { en } from './en';
import { es } from './es';
import { LOCALES, type Category, type Locale, type ToolMeta } from '../tools/types';

export type UiKey = keyof typeof es;

const dicts: Record<Locale, Record<UiKey, string>> = { es, en };

export function t(locale: Locale, key: UiKey, vars?: Record<string, string | number>): string {
  const s = dicts[locale][key];
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m));
}

export function isLocale(x: string): x is Locale {
  return (LOCALES as readonly string[]).includes(x);
}

export function otherLocale(l: Locale): Locale {
  return l === 'es' ? 'en' : 'es';
}

export function homeHref(l: Locale): string {
  return `/${l}`;
}

export function toolHref(l: Locale, meta: Pick<ToolMeta, 'slug'>): string {
  return `/${l}/${meta.slug[l]}`;
}

export function categoryHref(l: Locale, category: Pick<Category, 'slug'>): string {
  return `/${l}/${category.slug[l]}`;
}
