import { shuffle, type Rng } from '../../lib/random';

export const MIN_ITEMS = 2;

/** One item per line. Repeated items are kept; empty lines only when asked to. */
export function parseItems(text: string, ignoreEmpty: boolean): string[] {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  return ignoreEmpty ? lines.filter((l) => l.trim() !== '') : lines;
}

/** Uniform Fisher–Yates shuffle; with `keep`, only the first `keep` items are returned. */
export function shuffleList(rng: Rng, items: readonly string[], keep?: number): string[] {
  const out = shuffle(rng, items);
  return keep === undefined ? out : out.slice(0, Math.max(1, Math.min(keep, out.length)));
}
