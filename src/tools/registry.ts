import { categories } from './categories';
import { meta as json } from './json/meta';
import type { Category, CategoryId, Locale, ToolMeta } from './types';

export const tools: ToolMeta[] = [json];

export function toolById(id: string): ToolMeta | undefined {
  return tools.find((t) => t.id === id);
}

export function toolBySlug(locale: Locale, slug: string): ToolMeta | undefined {
  return tools.find((t) => t.slug[locale] === slug);
}

export function toolsInCategory(id: CategoryId): ToolMeta[] {
  return tools.filter((t) => t.category === id);
}

export function visibleCategories(): Category[] {
  return categories.filter((c) => toolsInCategory(c.id).length > 0);
}
