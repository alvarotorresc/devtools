export type LoremUnit = 'paragraphs' | 'sentences' | 'words';
export type Random = () => number;

export interface LoremOptions {
  startClassic?: boolean;
  rand?: Random;
}

export const MAX_COUNT: Record<LoremUnit, number> = {
  paragraphs: 100,
  sentences: 500,
  words: 5000,
};
export const DEFAULT_COUNT: Record<LoremUnit, number> = { paragraphs: 3, sentences: 5, words: 50 };

export const CLASSIC_SENTENCE = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
const CLASSIC_WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
];

// prettier-ignore
export const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
  'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip',
  'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat',
  'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
  'est', 'laborum', 'perspiciatis', 'unde', 'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium',
  'doloremque', 'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'explicabo', 'nemo', 'ipsam',
  'voluptas', 'aspernatur', 'aut', 'odit', 'fugit',
];

/** Small seeded PRNG, so the same seed always gives the same text (switching text/HTML does not re-roll). */
export function mulberry32(seed: number): Random {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const int = (rand: Random, min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
const word = (rand: Random) => WORDS[Math.floor(rand() * WORDS.length)];
const capitalize = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

export function generateSentence(wordCount?: number, rand: Random = Math.random): string {
  const count = wordCount || int(rand, 5, 14);
  const words = Array.from({ length: count }, () => word(rand));
  // A comma in longer sentences reads more like real text.
  if (count > 8) words[int(rand, 2, count - 4)] += ',';
  words[0] = capitalize(words[0]);
  return words.join(' ') + '.';
}

export function generateParagraph(sentenceCount?: number, rand: Random = Math.random): string {
  const count = sentenceCount || int(rand, 3, 6);
  return Array.from({ length: count }, () => generateSentence(undefined, rand)).join(' ');
}

export function clampCount(unit: LoremUnit, count: number): number {
  return Math.min(MAX_COUNT[unit], Math.max(1, Math.floor(count) || 1));
}

export function generateLorem(type: LoremUnit, count: number, opts: LoremOptions = {}): string {
  const rand = opts.rand ?? Math.random;
  const n = clampCount(type, count);
  switch (type) {
    case 'words': {
      const words = Array.from({ length: n }, (_, i) =>
        opts.startClassic && i < CLASSIC_WORDS.length ? CLASSIC_WORDS[i] : word(rand),
      );
      if (opts.startClassic) words[0] = capitalize(words[0]);
      return words.join(' ');
    }
    case 'sentences': {
      const s = Array.from({ length: n }, () => generateSentence(undefined, rand));
      if (opts.startClassic) s[0] = CLASSIC_SENTENCE;
      return s.join(' ');
    }
    case 'paragraphs': {
      const p = Array.from({ length: n }, () => generateParagraph(undefined, rand));
      if (opts.startClassic) p[0] = `${CLASSIC_SENTENCE} ${p[0]}`;
      return p.join('\n\n');
    }
  }
}

/** Wraps each paragraph (separated by a blank line) in <p>. */
export function toHtml(text: string): string {
  return text
    .split('\n\n')
    .map((p) => `<p>${p}</p>`)
    .join('\n');
}
