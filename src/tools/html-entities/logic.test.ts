import { describe, expect, it } from 'vitest';
import {
  NAMED_ENTITIES,
  convert,
  decodeHtmlEntities,
  detectDirection,
  encodeHtmlEntities,
} from './logic';

describe('encodeHtmlEntities (legacy behaviour)', () => {
  it('encodes HTML entities', () => {
    expect(encodeHtmlEntities('<div>')).toBe('&lt;div&gt;');
    expect(encodeHtmlEntities('a & b')).toBe('a &amp; b');
    expect(encodeHtmlEntities('"hello"')).toBe('&quot;hello&quot;');
    expect(encodeHtmlEntities("it's")).toBe('it&#39;s');
  });

  it('handles text without special characters', () => {
    expect(encodeHtmlEntities('hello world')).toBe('hello world');
  });
});

describe('encodeHtmlEntities in "everything non-ASCII" mode', () => {
  it('uses names when they exist and numbers otherwise', () => {
    expect(encodeHtmlEntities('Café € 😀 <b>', 'nonascii')).toBe(
      'Caf&eacute; &euro; &#128512; &lt;b&gt;',
    );
    expect(encodeHtmlEntities('año — “hola”', 'nonascii')).toBe(
      'a&ntilde;o &mdash; &ldquo;hola&rdquo;',
    );
  });

  it('leaves non-ASCII alone in minimal mode', () => {
    expect(encodeHtmlEntities('Café', 'minimal')).toBe('Café');
  });
});

describe('decodeHtmlEntities (pure, no DOM)', () => {
  it('decodes the common named entities', () => {
    expect(decodeHtmlEntities('&lt;div class=&quot;x&quot;&gt;')).toBe('<div class="x">');
    expect(decodeHtmlEntities('&copy; &reg; &trade; &hellip; &nbsp;')).toBe('© ® ™ …  ');
    expect(decodeHtmlEntities('&mdash;&ndash;&lsquo;&rsquo;&ldquo;&rdquo;&euro;&apos;')).toBe(
      "—–‘’“”€'",
    );
    expect(decodeHtmlEntities('&Aacute;&eacute;&ntilde;&Ntilde;&uuml;&ccedil;&szlig;&yuml;')).toBe(
      'ÁéñÑüçßÿ',
    );
  });

  it('covers the whole Latin-1 supplement', () => {
    expect(NAMED_ENTITIES.nbsp).toBe(' ');
    expect(NAMED_ENTITIES.iquest).toBe('¿');
    expect(NAMED_ENTITIES.Agrave).toBe('À');
    expect(NAMED_ENTITIES.times).toBe('×');
    expect(NAMED_ENTITIES.divide).toBe('÷');
    expect(NAMED_ENTITIES.yuml).toBe('ÿ');
  });

  it('decodes decimal and hexadecimal references, including astral characters', () => {
    expect(decodeHtmlEntities('&#39;&#x27;&#X27;&#128512;&#x1F600;')).toBe("'''😀😀");
  });

  it('replaces invalid code points with U+FFFD like browsers do', () => {
    expect(decodeHtmlEntities('&#0;&#xD800;&#x110000;')).toBe('���');
  });

  it('decodes in a single pass', () => {
    expect(decodeHtmlEntities('&amp;lt;')).toBe('&lt;');
  });

  it('leaves unknown names and bare ampersands untouched', () => {
    expect(decodeHtmlEntities('&unknown; & &amp')).toBe('&unknown; & &amp');
  });

  it('round-trips with the encoder', () => {
    const s = `<a href="x">Canción ñ € 😀 & 'co'</a>`;
    expect(decodeHtmlEntities(encodeHtmlEntities(s, 'nonascii'))).toBe(s);
    expect(decodeHtmlEntities(encodeHtmlEntities(s))).toBe(s);
  });
});

describe('detectDirection', () => {
  it('decodes text with entities and no raw tags', () => {
    expect(detectDirection('&lt;p&gt;Hola&lt;/p&gt;')).toBe('decode');
    expect(detectDirection('caf&#233;')).toBe('decode');
  });

  it('encodes raw HTML, plain text and unknown entities', () => {
    expect(detectDirection('<p>a &amp; b</p>')).toBe('encode');
    expect(detectDirection('Tom & Jerry')).toBe('encode');
    expect(detectDirection('&madeup;')).toBe('encode');
  });

  it('drives convert in auto mode', () => {
    expect(convert('<b>', 'auto', 'minimal')).toEqual({ direction: 'encode', output: '&lt;b&gt;' });
    expect(convert('&lt;b&gt;', 'auto', 'minimal')).toEqual({ direction: 'decode', output: '<b>' });
    expect(convert('&lt;b&gt;', 'encode', 'minimal')).toEqual({
      direction: 'encode',
      output: '&amp;lt;b&amp;gt;',
    });
  });
});
