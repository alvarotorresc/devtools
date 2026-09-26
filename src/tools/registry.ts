import { categories } from './categories';
import { meta as json } from './json/meta';
import { meta as uuid } from './uuid/meta';
import { meta as base64 } from './base64/meta';
import { meta as url } from './url/meta';
import { meta as htmlEntities } from './html-entities/meta';
import { meta as jwt } from './jwt/meta';
import { meta as hash } from './hash/meta';
import { meta as diff } from './diff/meta';
import { meta as regex } from './regex/meta';
import { meta as text } from './text/meta';
import { meta as lorem } from './lorem/meta';
import { meta as timestamp } from './timestamp/meta';
import { meta as color } from './color/meta';
import { meta as numberBase } from './number-base/meta';

// Lote 1: each tool task uncomments its import and its entry in `tools`.
// Keep the blank lines between them: they let the parallel branches merge without conflicts.

import { meta as dni } from './dni/meta';

// import { meta as cif } from './cif/meta';

import { meta as iban } from './iban/meta';

import { meta as plate } from './plate/meta';

// import { meta as nss } from './nss/meta';

// import { meta as card } from './card/meta';

// import { meta as phone } from './phone/meta';

// import { meta as bic } from './bic/meta';

// import { meta as eanIsbn } from './ean-isbn/meta';

// import { meta as postalCode } from './postal-code/meta';

// import { meta as mock } from './mock/meta';

import type { Category, CategoryId, Locale, ToolMeta } from './types';

export const tools: ToolMeta[] = [
  json,
  uuid,
  base64,
  url,
  htmlEntities,
  jwt,
  hash,
  diff,
  regex,
  text,
  lorem,
  timestamp,
  color,
  numberBase,

  dni,

  // cif,

  iban,

  plate,

  // nss,

  // card,

  // phone,

  // bic,

  // eanIsbn,

  // postalCode,

  // mock,
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
