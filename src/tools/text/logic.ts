export type CaseId =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'constant'
  | 'kebab'
  | 'dot';

export interface TextStats {
  chars: number;
  words: number;
  lines: number;
  bytes: number;
}

export type SortOrder = 'none' | 'az' | 'za' | 'natural';

export interface LineOptions {
  trim: boolean;
  removeEmpty: boolean;
  dedupe: boolean;
  sort: SortOrder;
  reverse: boolean;
  number: boolean;
}

export const DEFAULT_LINE_OPTIONS: LineOptions = {
  trim: false,
  removeEmpty: false,
  dedupe: false,
  sort: 'none',
  reverse: false,
  number: false,
};

const perLine = (fn: (line: string) => string) => (text: string) =>
  text.split('\n').map(fn).join('\n');

/**
 * Words of an identifier or phrase: splits on anything that is not a letter or digit
 * and on camelCase boundaries ("XMLHttpRequest" → XML, Http, Request).
 */
export function splitWords(line: string): string[] {
  return (line.match(/[\p{L}\p{N}]+/gu) ?? []).flatMap((chunk) =>
    chunk
      .replace(/(\p{Ll}|\p{N})(\p{Lu})/gu, '$1 $2')
      .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2')
      .split(' '),
  );
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

export function toTitleCase(text: string): string {
  return text.replace(
    /[\p{L}\p{N}_][^\s]*/gu,
    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
  );
}

/** Lower case, with a capital at the start of each sentence (also after "¿", "¡" or quotes). */
export function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(
      /(^|[.!?]\s+|\n)(\s*[¡¿"'«(]*)(\p{L})/gu,
      (_, pre: string, lead: string, ch: string) => pre + lead + ch.toUpperCase(),
    );
}

export const toCamelCase = perLine((line) =>
  splitWords(line)
    .map((w, i) => (i === 0 ? w.toLowerCase() : cap(w)))
    .join(''),
);
export const toPascalCase = perLine((line) => splitWords(line).map(cap).join(''));
export const toSnakeCase = perLine((line) =>
  splitWords(line)
    .map((w) => w.toLowerCase())
    .join('_'),
);
export const toConstantCase = perLine((line) =>
  splitWords(line)
    .map((w) => w.toUpperCase())
    .join('_'),
);
export const toKebabCase = perLine((line) =>
  splitWords(line)
    .map((w) => w.toLowerCase())
    .join('-'),
);
export const toDotCase = perLine((line) =>
  splitWords(line)
    .map((w) => w.toLowerCase())
    .join('.'),
);

export const CASES: { id: CaseId; label: string; fn: (text: string) => string }[] = [
  { id: 'upper', label: 'UPPER CASE', fn: (t) => t.toUpperCase() },
  { id: 'lower', label: 'lower case', fn: (t) => t.toLowerCase() },
  { id: 'title', label: 'Title Case', fn: toTitleCase },
  { id: 'sentence', label: 'Sentence case', fn: toSentenceCase },
  { id: 'camel', label: 'camelCase', fn: toCamelCase },
  { id: 'pascal', label: 'PascalCase', fn: toPascalCase },
  { id: 'snake', label: 'snake_case', fn: toSnakeCase },
  { id: 'constant', label: 'CONSTANT_CASE', fn: toConstantCase },
  { id: 'kebab', label: 'kebab-case', fn: toKebabCase },
  { id: 'dot', label: 'dot.case', fn: toDotCase },
];

export function convertAll(text: string): Record<CaseId, string> {
  return Object.fromEntries(CASES.map((c) => [c.id, c.fn(text)])) as Record<CaseId, string>;
}

export function countText(text: string): TextStats {
  return {
    chars: [...text].length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text.split('\n').length,
    bytes: new TextEncoder().encode(text).length,
  };
}

export function processLines(text: string, opts: LineOptions, locale = 'es'): string {
  let lines = text.split('\n');
  if (opts.trim) lines = lines.map((l) => l.trim());
  if (opts.removeEmpty) lines = lines.filter((l) => l.trim() !== '');
  if (opts.dedupe) lines = [...new Set(lines)];
  if (opts.sort !== 'none') {
    const collator = new Intl.Collator(locale, {
      numeric: opts.sort === 'natural',
      sensitivity: 'variant',
    });
    lines = [...lines].sort(collator.compare);
    if (opts.sort === 'za') lines.reverse();
  }
  if (opts.reverse) lines = [...lines].reverse();
  if (opts.number) {
    const width = String(lines.length).length;
    lines = lines.map((l, i) => `${String(i + 1).padStart(width, ' ')}. ${l}`);
  }
  return lines.join('\n');
}
