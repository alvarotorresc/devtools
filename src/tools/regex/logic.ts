export const FLAGS = ['g', 'i', 'm', 's', 'u', 'y'] as const;
export type Flag = (typeof FLAGS)[number];

export type ErrorHint =
  | 'unterminatedGroup'
  | 'unmatchedParen'
  | 'nothingToRepeat'
  | 'unterminatedClass'
  | 'groupName'
  | 'duplicateName'
  | 'quantifierOrder'
  | 'trailingBackslash'
  | 'invalidGroup'
  | 'rangeOrder'
  | 'loneBracket'
  | 'flags';

export interface RegexError {
  message: string;
  hint: ErrorHint | null;
}

export interface Group {
  index: number;
  name: string | null;
  value: string | undefined;
}

export interface MatchInfo {
  index: number;
  end: number;
  text: string;
  groups: Group[];
}

export type FindResult =
  { ok: true; matches: MatchInfo[]; truncated: boolean } | { ok: false; error: RegexError };
export type ReplaceResult =
  { ok: true; output: string; count: number } | { ok: false; error: RegexError };

export const MAX_MATCHES = 1000;
export const DEBOUNCE_THRESHOLD = 20_000;

// V8 (Chrome, Node), SpiderMonkey (Firefox) and JavaScriptCore (Safari) word these differently.
const HINTS: [RegExp, ErrorHint][] = [
  [/invalid (regular expression )?flags|invalid flags/i, 'flags'],
  [/unterminated group|missing \)|unterminated parenthetical/i, 'unterminatedGroup'],
  [/unmatched ('\)'|\))|unmatched parentheses/i, 'unmatchedParen'],
  [/nothing to repeat/i, 'nothingToRepeat'],
  [/unterminated character class|missing terminating \]/i, 'unterminatedClass'],
  [/duplicate (capture group|group specifier) name/i, 'duplicateName'],
  [/invalid (capture group|group specifier) name/i, 'groupName'],
  [/numbers out of order/i, 'quantifierOrder'],
  [/\\ at end of pattern/i, 'trailingBackslash'],
  [/range out of order/i, 'rangeOrder'],
  [/lone quantifier brackets|raw bracket/i, 'loneBracket'],
  [/invalid (regexp )?group/i, 'invalidGroup'],
];

export function explainError(message: string): ErrorHint | null {
  for (const [re, hint] of HINTS) if (re.test(message)) return hint;
  return null;
}

export function buildRegex(
  pattern: string,
  flags: string,
): { ok: true; re: RegExp } | { ok: false; error: RegexError } {
  try {
    return { ok: true, re: new RegExp(pattern, flags) };
  } catch (e) {
    const message = (e as Error).message;
    return { ok: false, error: { message, hint: explainError(message) } };
  }
}

/** Accepts a pasted literal such as `/\d+/gi` and splits it into pattern and flags. */
export function parseLiteral(input: string): { pattern: string; flags: string } | null {
  const m = /^\/(.+)\/([a-z]*)$/s.exec(input);
  if (!m || !/^[dgimsuvy]*$/.test(m[2])) return null;
  return { pattern: m[1], flags: m[2] };
}

/**
 * Name of each capturing group, in capture order (null for unnamed ones).
 * Skips escapes, character classes and non-capturing groups such as (?:…), (?=…) or (?<=…).
 */
export function captureNames(pattern: string): (string | null)[] {
  const names: (string | null)[] = [];
  let inClass = false;
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === '\\') {
      i++;
      continue;
    }
    if (inClass) {
      if (c === ']') inClass = false;
      continue;
    }
    if (c === '[') {
      inClass = true;
      continue;
    }
    if (c !== '(') continue;
    if (pattern[i + 1] !== '?') {
      names.push(null);
      continue;
    }
    const named = /^\(\?<([^>=!][^>]*)>/.exec(pattern.slice(i));
    if (named) names.push(named[1]);
  }
  return names;
}

export function findMatches(
  pattern: string,
  flags: string,
  text: string,
  limit = MAX_MATCHES,
): FindResult {
  if (!pattern) return { ok: true, matches: [], truncated: false };
  const built = buildRegex(pattern, flags);
  if (!built.ok) return built;
  const re = built.re;
  const names = captureNames(pattern);
  const matches: MatchInfo[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const groups: Group[] = [];
    for (let i = 1; i < m.length; i++)
      groups.push({ index: i, name: names[i - 1] ?? null, value: m[i] });
    matches.push({ index: m.index, end: m.index + m[0].length, text: m[0], groups });
    if (!re.global) break;
    if (m[0].length === 0) re.lastIndex++; // an empty match would loop forever
    if (matches.length >= limit) return { ok: true, matches, truncated: re.exec(text) !== null };
  }
  return { ok: true, matches, truncated: false };
}

export interface Piece {
  text: string;
  match: number | null;
}

/** Splits the text into plain pieces and match pieces (by match number) for highlighting. */
export function highlight(text: string, matches: MatchInfo[]): Piece[] {
  const out: Piece[] = [];
  let pos = 0;
  matches.forEach((m, i) => {
    if (m.index > pos) out.push({ text: text.slice(pos, m.index), match: null });
    if (m.end > m.index) out.push({ text: text.slice(m.index, m.end), match: i });
    pos = Math.max(pos, m.end);
  });
  if (pos < text.length) out.push({ text: text.slice(pos), match: null });
  return out;
}

export function replaceText(
  pattern: string,
  flags: string,
  text: string,
  replacement: string,
): ReplaceResult {
  if (!pattern) return { ok: true, output: text, count: 0 };
  const built = buildRegex(pattern, flags);
  if (!built.ok) return built;
  const re = built.re;
  const output = text.replace(re, replacement);
  re.lastIndex = 0;
  const count = re.global ? (text.match(re)?.length ?? 0) : re.exec(text) ? 1 : 0;
  return { ok: true, output, count };
}

export function shouldDebounce(text: string): boolean {
  return text.length > DEBOUNCE_THRESHOLD;
}
