import type { IconName } from './icon-names';

export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export type CategoryId = 'gen' | 'enc' | 'data' | 'ids' | 'conv' | 'rand' | 'ref';
export type Localized<T> = Record<Locale, T>;

export interface ToolMeta {
  id: string;
  category: CategoryId;
  icon: IconName;
  slug: Localized<string>;
  name: Localized<string>;
  title: Localized<string>;
  description: Localized<string>;
  keywords: Localized<string[]>;
  tabs?: Localized<string[]>;
  faq?: Localized<{ q: string; a: string }[]>;
  rememberInput?: boolean;
}

export interface Category {
  id: CategoryId;
  icon: IconName;
  name: Localized<string>;
  description: Localized<string>;
}

export interface PaletteEntry {
  id: string;
  href: string;
  name: string;
  category: string;
  icon: IconName;
}
