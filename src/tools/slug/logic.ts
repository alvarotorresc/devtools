import type { Locale } from '../types';

export type Separator = '-' | '_' | '.';

export interface SlugOptions {
  separator: Separator;
  lowercase: boolean;
  /** & → " y " (es) or " and " (en). */
  ampersand: boolean;
  /** Cut at a word boundary; null for no limit. */
  maxLength: number | null;
  locale: Locale;
}

export interface SlugLine {
  input: string;
  slug: string;
}

// Letters that NFKD does not split into a base letter plus accents.
const PRE_MAP: Record<string, string> = {
  ß: 'ss',
  æ: 'ae',
  Æ: 'AE',
  œ: 'oe',
  Œ: 'OE',
  ø: 'o',
  Ø: 'O',
  ł: 'l',
  Ł: 'L',
  đ: 'd',
  Đ: 'D',
  ð: 'd',
  Ð: 'D',
  þ: 'th',
  Þ: 'Th',
};

const AND: Record<Locale, string> = { es: ' y ', en: ' and ' };

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cut(slug: string, max: number, sep: Separator): string {
  if (slug.length <= max) return slug;
  // The limit falls right before a separator: the whole word fits.
  if (slug[max] === sep) return slug.slice(0, max);
  const head = slug.slice(0, max);
  const last = head.lastIndexOf(sep);
  // A first word longer than the limit is the only case where a word gets split.
  return last > 0 ? head.slice(0, last) : head;
}

export function slugify(text: string, opts: SlugOptions): string {
  let s = [...text].map((c) => PRE_MAP[c] ?? c).join('');
  if (opts.ampersand) s = s.replace(/&/g, AND[opts.locale]);
  s = s.normalize('NFKD').replace(/\p{M}/gu, '');
  if (opts.lowercase) s = s.toLowerCase();
  const sep = opts.separator;
  s = s.replace(/[^A-Za-z0-9]+/g, sep);
  const edges = new RegExp(`^${escapeRegExp(sep)}+|${escapeRegExp(sep)}+$`, 'g');
  s = s.replace(edges, '');
  if (opts.maxLength !== null && opts.maxLength > 0) s = cut(s, opts.maxLength, sep);
  return s;
}

/** One slug per non-empty line. */
export function slugifyLines(text: string, opts: SlugOptions): SlugLine[] {
  return text
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .map((input) => ({ input, slug: slugify(input, opts) }));
}
