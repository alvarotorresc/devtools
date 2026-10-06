import type { IconName } from './icon-names';

export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export type CategoryId = 'gen' | 'enc' | 'data' | 'ids' | 'conv' | 'calc' | 'rand' | 'ref';
export type Localized<T> = Record<Locale, T>;

export interface ToolMeta {
  id: string;
  category: CategoryId;
  icon: IconName;
  slug: Localized<string>;
  name: Localized<string>;
  title: Localized<string>;
  heading: Localized<string>;
  description: Localized<string>;
  keywords: Localized<string[]>;
  tabs?: Localized<string[]>;
  faq?: Localized<{ q: string; a: string }[]>;
  rememberInput?: boolean;
}

export interface Category {
  id: CategoryId;
  icon: IconName;
  /** URL of the category page; must not clash with any tool slug. */
  slug: Localized<string>;
  /** Short name for the sidebar, catalog and breadcrumb. */
  name: Localized<string>;
  /** One line for the catalog card. */
  description: Localized<string>;
  /** <title> without the " · devtools" suffix, at most 49 characters. */
  title: Localized<string>;
  /** h1 of the category page. */
  heading: Localized<string>;
  /** Meta description, 120 to 155 characters. */
  seoDescription: Localized<string>;
  /** Two paragraphs of its own for the category page. */
  intro: Localized<[string, string]>;
}

export interface PaletteEntry {
  id: string;
  href: string;
  name: string;
  category: string;
  icon: IconName;
}
