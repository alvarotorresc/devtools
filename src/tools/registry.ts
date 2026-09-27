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
import { meta as dni } from './dni/meta';
import { meta as cif } from './cif/meta';
import { meta as iban } from './iban/meta';
import { meta as plate } from './plate/meta';
import { meta as nss } from './nss/meta';
import { meta as card } from './card/meta';
import { meta as phone } from './phone/meta';
import { meta as bic } from './bic/meta';
import { meta as eanIsbn } from './ean-isbn/meta';
import { meta as postalCode } from './postal-code/meta';
import { meta as mock } from './mock/meta';

// Lote 2: each tool task uncomments its import and its entry in `tools`.
// Keep the blank lines between them: they let the parallel branches merge without conflicts.

// import { meta as units } from './units/meta';

// import { meta as currency } from './currency/meta';

// import { meta as pxRem } from './px-rem/meta';

// import { meta as chmod } from './chmod/meta';

// import { meta as fileSize } from './file-size/meta';

// import { meta as wheel } from './wheel/meta';

// import { meta as shuffle } from './shuffle/meta';

// import { meta as teams } from './teams/meta';

// import { meta as dice } from './dice/meta';

// import { meta as iva } from './iva/meta';

// import { meta as irpf } from './irpf/meta';

// import { meta as percent } from './percent/meta';

// import { meta as ruleOfThree } from './rule-of-three/meta';

// import { meta as workdays } from './workdays/meta';

// Lote 3: each tool task uncomments its import and its entry in `tools`.
// Keep the blank lines between them: they let the parallel branches merge without conflicts.

import { meta as password } from './password/meta';

import { meta as qr } from './qr/meta';

// import { meta as slug } from './slug/meta';

// import { meta as dataConvert } from './data-convert/meta';

// import { meta as jsonDiff } from './json-diff/meta';

// import { meta as markdown } from './markdown/meta';

// import { meta as curl } from './curl/meta';

// import { meta as queryString } from './query-string/meta';

// import { meta as httpStatus } from './http-status/meta';

// import { meta as cron } from './cron/meta';

// import { meta as userAgent } from './user-agent/meta';

// import { meta as semver } from './semver/meta';

// import { meta as cidr } from './cidr/meta';

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
  cif,
  iban,
  plate,
  nss,
  card,
  phone,
  bic,
  eanIsbn,
  postalCode,
  mock,

  // units,

  // currency,

  // pxRem,

  // chmod,

  // fileSize,

  // wheel,

  // shuffle,

  // teams,

  // dice,

  // iva,

  // irpf,

  // percent,

  // ruleOfThree,

  // workdays,

  password,

  qr,

  // slug,

  // dataConvert,

  // jsonDiff,

  // markdown,

  // curl,

  // queryString,

  // httpStatus,

  // cron,

  // userAgent,

  // semver,

  // cidr,
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
