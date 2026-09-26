import { describe, expect, it } from 'vitest';
import {
  CLASSIC_SENTENCE,
  MAX_COUNT,
  WORDS,
  clampCount,
  generateLorem,
  generateParagraph,
  generateSentence,
  mulberry32,
  toHtml,
} from './logic';

describe('legacy behaviour', () => {
  it('generates a sentence ending with a period', () => {
    const sentence = generateSentence();
    expect(sentence).toMatch(/\.$/);
    expect(sentence[0]).toMatch(/[A-Z]/);
  });

  it('generates specified type and count', () => {
    const words = generateLorem('words', 5);
    expect(words.split(' ')).toHaveLength(5);
  });

  it('generates multiple paragraphs', () => {
    const paragraphs = generateLorem('paragraphs', 3);
    expect(paragraphs.split('\n\n')).toHaveLength(3);
  });
});

describe('seeded generation', () => {
  it('gives the same text for the same seed', () => {
    const a = generateLorem('paragraphs', 2, { rand: mulberry32(42) });
    const b = generateLorem('paragraphs', 2, { rand: mulberry32(42) });
    const c = generateLorem('paragraphs', 2, { rand: mulberry32(43) });
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it('produces numbers in [0, 1)', () => {
    const r = mulberry32(1);
    for (let i = 0; i < 1000; i++) {
      const x = r();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  it('only uses words from the list', () => {
    const text = generateLorem('words', 200, { rand: mulberry32(7) });
    for (const w of text.toLowerCase().split(' ')) expect(WORDS).toContain(w);
  });

  it('builds sentences and paragraphs of the requested size', () => {
    const r = mulberry32(3);
    expect(generateSentence(6, r).replace(/[,.]/g, '').split(' ')).toHaveLength(6);
    expect(generateParagraph(4, r).match(/\./g)).toHaveLength(4);
  });
});

describe('start with "Lorem ipsum…"', () => {
  const rand = () => mulberry32(9);

  it('starts paragraphs and sentences with the classic sentence', () => {
    expect(
      generateLorem('paragraphs', 2, { startClassic: true, rand: rand() }).startsWith(
        CLASSIC_SENTENCE,
      ),
    ).toBe(true);
    const sentences = generateLorem('sentences', 3, { startClassic: true, rand: rand() });
    expect(sentences.startsWith(`${CLASSIC_SENTENCE} `)).toBe(true);
  });

  it('starts words with "Lorem ipsum dolor sit amet"', () => {
    expect(generateLorem('words', 5, { startClassic: true, rand: rand() })).toBe(
      'Lorem ipsum dolor sit amet',
    );
    expect(
      generateLorem('words', 10, { startClassic: true, rand: rand() }).split(' '),
    ).toHaveLength(10);
  });
});

describe('limits and HTML', () => {
  it('clamps the count', () => {
    expect(clampCount('paragraphs', 0)).toBe(1);
    expect(clampCount('paragraphs', 1e6)).toBe(MAX_COUNT.paragraphs);
    expect(clampCount('words', Number.NaN)).toBe(1);
    expect(generateLorem('paragraphs', 1e6).split('\n\n')).toHaveLength(MAX_COUNT.paragraphs);
  });

  it('wraps each paragraph in <p>', () => {
    expect(toHtml('Uno.\n\nDos.')).toBe('<p>Uno.</p>\n<p>Dos.</p>');
    expect(toHtml('Solo una frase.')).toBe('<p>Solo una frase.</p>');
  });
});
