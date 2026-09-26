import { categories } from './categories';
import { meta as json } from './json/meta';
import { meta as uuid } from './uuid/meta';
import type { Category, CategoryId, Locale, ToolMeta } from './types';

// Plan B: each tool task uncomments its import and its entry in `tools`.
// Keep the blank lines between them: they let the parallel branches merge without conflicts.

// import { meta as base64 } from './base64/meta';

// import { meta as url } from './url/meta';

// import { meta as htmlEntities } from './html-entities/meta';

// import { meta as jwt } from './jwt/meta';

// import { meta as hash } from './hash/meta';

// import { meta as diff } from './diff/meta';

// import { meta as regex } from './regex/meta';

// import { meta as text } from './text/meta';

// import { meta as lorem } from './lorem/meta';

// import { meta as timestamp } from './timestamp/meta';

// import { meta as color } from './color/meta';

// import { meta as numberBase } from './number-base/meta';

export const tools: ToolMeta[] = [
  json,
  uuid,

  // base64,

  // url,

  // htmlEntities,

  // jwt,

  // hash,

  // diff,

  // regex,

  // text,

  // lorem,

  // timestamp,

  // color,

  // numberBase,
];

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
