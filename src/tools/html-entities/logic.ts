export type EntityMode = 'minimal' | 'nonascii';
export type Direction = 'encode' | 'decode';
export type DirectionMode = 'auto' | Direction;

// U+00A0..U+00BF and U+00C0..U+00FF, in code point order (the full Latin-1 supplement).
const LATIN1_SYMBOLS =
  'nbsp iexcl cent pound curren yen brvbar sect uml copy ordf laquo not shy reg macr ' +
  'deg plusmn sup2 sup3 acute micro para middot cedil sup1 ordm raquo frac14 frac12 frac34 iquest';
const LATIN1_LETTERS =
  'Agrave Aacute Acirc Atilde Auml Aring AElig Ccedil Egrave Eacute Ecirc Euml Igrave Iacute Icirc Iuml ' +
  'ETH Ntilde Ograve Oacute Ocirc Otilde Ouml times Oslash Ugrave Uacute Ucirc Uuml Yacute THORN szlig ' +
  'agrave aacute acirc atilde auml aring aelig ccedil egrave eacute ecirc euml igrave iacute icirc iuml ' +
  'eth ntilde ograve oacute ocirc otilde ouml divide oslash ugrave uacute ucirc uuml yacute thorn yuml';

const OTHERS: Record<string, number> = {
  amp: 0x26,
  lt: 0x3c,
  gt: 0x3e,
  quot: 0x22,
  apos: 0x27,
  OElig: 0x152,
  oelig: 0x153,
  Scaron: 0x160,
  scaron: 0x161,
  Yuml: 0x178,
  fnof: 0x192,
  circ: 0x2c6,
  tilde: 0x2dc,
  ensp: 0x2002,
  emsp: 0x2003,
  thinsp: 0x2009,
  zwnj: 0x200c,
  zwj: 0x200d,
  ndash: 0x2013,
  mdash: 0x2014,
  lsquo: 0x2018,
  rsquo: 0x2019,
  sbquo: 0x201a,
  ldquo: 0x201c,
  rdquo: 0x201d,
  bdquo: 0x201e,
  dagger: 0x2020,
  Dagger: 0x2021,
  bull: 0x2022,
  hellip: 0x2026,
  permil: 0x2030,
  prime: 0x2032,
  lsaquo: 0x2039,
  rsaquo: 0x203a,
  euro: 0x20ac,
  trade: 0x2122,
  larr: 0x2190,
  uarr: 0x2191,
  rarr: 0x2192,
  darr: 0x2193,
  harr: 0x2194,
  infin: 0x221e,
  ne: 0x2260,
  le: 0x2264,
  ge: 0x2265,
  hearts: 0x2665,
};

function buildTable(): Record<string, string> {
  const table: Record<string, string> = {};
  LATIN1_SYMBOLS.split(' ').forEach((name, i) => (table[name] = String.fromCodePoint(0xa0 + i)));
  LATIN1_LETTERS.split(' ').forEach((name, i) => (table[name] = String.fromCodePoint(0xc0 + i)));
  for (const [name, cp] of Object.entries(OTHERS)) table[name] = String.fromCodePoint(cp);
  return table;
}

/** Entity name → character. */
export const NAMED_ENTITIES: Readonly<Record<string, string>> = buildTable();

const MINIMAL: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

// Character → name, for "everything non-ASCII". The five minimal characters keep their own form.
const BY_CHAR: Record<string, string> = Object.fromEntries(
  Object.entries(NAMED_ENTITIES)
    .filter(([, ch]) => !(ch in MINIMAL))
    .map(([name, ch]) => [ch, name]),
);

export function encodeHtmlEntities(text: string, mode: EntityMode = 'minimal'): string {
  if (mode === 'minimal') return text.replace(/[&<>"']/g, (c) => MINIMAL[c]);
  let out = '';
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (ch in MINIMAL) out += MINIMAL[ch];
    else if (cp < 0x7f) out += ch;
    else out += BY_CHAR[ch] ? `&${BY_CHAR[ch]};` : `&#${cp};`;
  }
  return out;
}

const ENTITY = /&(#[0-9]+|#[xX][0-9a-fA-F]+|[A-Za-z][A-Za-z0-9]*);/g;

function decodeOne(body: string): string | null {
  if (body[0] !== '#') return Object.hasOwn(NAMED_ENTITIES, body) ? NAMED_ENTITIES[body] : null;
  const hex = body[1] === 'x' || body[1] === 'X';
  const cp = parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10);
  // Same rule as browsers: NUL, surrogates and out-of-range values become U+FFFD.
  if (!Number.isFinite(cp) || cp === 0 || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff))
    return '�';
  return String.fromCodePoint(cp);
}

/** Pure decoder (no DOM). Single pass: "&amp;lt;" becomes "&lt;", not "<". Unknown names stay as they are. */
export function decodeHtmlEntities(text: string): string {
  return text.replace(ENTITY, (m, body: string) => decodeOne(body) ?? m);
}

/** "decode" when the text has at least one entity we can decode and no raw "<" or ">". */
export function detectDirection(text: string): Direction {
  if (/[<>]/.test(text)) return 'encode';
  for (const m of text.matchAll(ENTITY)) {
    if (decodeOne(m[1]) !== null) return 'decode';
  }
  return 'encode';
}

export function convert(
  text: string,
  mode: DirectionMode,
  entityMode: EntityMode,
): { direction: Direction; output: string } {
  const direction = mode === 'auto' ? detectDirection(text) : mode;
  return {
    direction,
    output:
      direction === 'encode' ? encodeHtmlEntities(text, entityMode) : decodeHtmlEntities(text),
  };
}
