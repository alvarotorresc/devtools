import { LOCALES, type ToolMeta } from '../tools/types';

export interface SearchDoc {
  id: string;
  primary: string[];
  secondary: string[];
}

export function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function buildDoc(meta: ToolMeta): SearchDoc {
  return {
    id: meta.id,
    primary: LOCALES.flatMap((l) => [meta.name[l], ...meta.keywords[l]]).map(normalize),
    secondary: LOCALES.map((l) => normalize(meta.description[l])),
  };
}

const WORD_BOUNDARY = /[\s\-_/.()]/;

function subsequenceScore(q: string, text: string): number {
  let from = 0;
  let first = -1;
  let score = 0;
  let streak = 0;
  for (const ch of q) {
    const found = text.indexOf(ch, from);
    if (found === -1) return 0;
    if (first === -1) first = found;
    streak = found === from ? streak + 1 : 0;
    score += 1 + streak;
    from = found + 1;
  }
  // Letters spread across the whole string are noise, not a match.
  if (from - first > q.length * 2) return 0;
  return Math.min(score * 4, 60);
}

export function scoreField(q: string, text: string): number {
  if (!q || !text) return 0;
  const idx = text.indexOf(q);
  if (idx !== -1) {
    const wordStart = idx === 0 || WORD_BOUNDARY.test(text[idx - 1]);
    return 100 + (idx === 0 ? 50 : 0) + (wordStart ? 25 : 0) - Math.min(idx, 20);
  }
  if (q.length >= 3) {
    for (let i = 0; i < q.length - 1; i++) {
      const swapped = q.slice(0, i) + q[i + 1] + q[i] + q.slice(i + 2);
      if (text.includes(swapped)) return 70;
    }
  }
  return q.length >= 2 ? subsequenceScore(q, text) : 0;
}

function tokenScore(token: string, doc: SearchDoc): number {
  let best = 0;
  for (const f of doc.primary) best = Math.max(best, scoreField(token, f) * 2);
  for (const f of doc.secondary) if (f.includes(token)) best = Math.max(best, 50);
  return best;
}

export function search(docs: SearchDoc[], query: string, limit = 20): string[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const scored: { id: string; score: number; order: number }[] = [];
  docs.forEach((doc, order) => {
    let total = 0;
    for (const token of tokens) {
      const s = tokenScore(token, doc);
      if (s === 0) return;
      total += s;
    }
    scored.push({ id: doc.id, score: total, order });
  });
  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  return scored.slice(0, limit).map((s) => s.id);
}
