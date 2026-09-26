import { describe, expect, it } from 'vitest';
import {
  CASES,
  DEFAULT_LINE_OPTIONS,
  convertAll,
  countText,
  processLines,
  splitWords,
  toCamelCase,
  toConstantCase,
  toDotCase,
  toKebabCase,
  toPascalCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
} from './logic';

describe('case conversion (legacy behaviour)', () => {
  it('converts to title case', () => {
    expect(toTitleCase('hello world')).toBe('Hello World');
  });

  it('converts to camelCase', () => {
    expect(toCamelCase('hello world')).toBe('helloWorld');
    expect(toCamelCase('hello-world')).toBe('helloWorld');
    expect(toCamelCase('hello_world')).toBe('helloWorld');
  });

  it('converts to snake_case', () => {
    expect(toSnakeCase('helloWorld')).toBe('hello_world');
    expect(toSnakeCase('hello world')).toBe('hello_world');
    expect(toSnakeCase('hello-world')).toBe('hello_world');
  });

  it('converts to kebab-case', () => {
    expect(toKebabCase('helloWorld')).toBe('hello-world');
    expect(toKebabCase('hello world')).toBe('hello-world');
    expect(toKebabCase('hello_world')).toBe('hello-world');
  });
});

describe('case conversion (new)', () => {
  it('splits words on separators and camelCase boundaries, acronyms included', () => {
    expect(splitWords('XMLHttpRequest')).toEqual(['XML', 'Http', 'Request']);
    expect(splitWords('user_id-v2 total')).toEqual(['user', 'id', 'v2', 'total']);
    expect(splitWords('getHTTP2Response')).toEqual(['get', 'HTTP2', 'Response']);
  });

  it('converts to every identifier style', () => {
    const s = 'Número de pedido';
    expect(toCamelCase(s)).toBe('númeroDePedido');
    expect(toPascalCase(s)).toBe('NúmeroDePedido');
    expect(toSnakeCase(s)).toBe('número_de_pedido');
    expect(toConstantCase(s)).toBe('NÚMERO_DE_PEDIDO');
    expect(toKebabCase(s)).toBe('número-de-pedido');
    expect(toDotCase(s)).toBe('número.de.pedido');
    expect(toSnakeCase('XMLHttpRequest')).toBe('xml_http_request');
  });

  it('converts each line on its own', () => {
    expect(toSnakeCase('fooBar\nbazQux')).toBe('foo_bar\nbaz_qux');
  });

  it('writes sentence case', () => {
    expect(toSentenceCase('HOLA MUNDO. ¿QUÉ TAL? bien')).toBe('Hola mundo. ¿Qué tal? Bien');
  });

  it('offers the ten conversions at once', () => {
    expect(CASES).toHaveLength(10);
    const all = convertAll('hola mundo');
    expect(all).toEqual({
      upper: 'HOLA MUNDO',
      lower: 'hola mundo',
      title: 'Hola Mundo',
      sentence: 'Hola mundo',
      camel: 'holaMundo',
      pascal: 'HolaMundo',
      snake: 'hola_mundo',
      constant: 'HOLA_MUNDO',
      kebab: 'hola-mundo',
      dot: 'hola.mundo',
    });
  });
});

describe('countText', () => {
  it('counts text stats (legacy behaviour)', () => {
    const result = countText('Hello world\nSecond line');
    expect(result.chars).toBe(23);
    expect(result.words).toBe(4);
    expect(result.lines).toBe(2);
  });

  it('handles empty text', () => {
    const result = countText('');
    expect(result.chars).toBe(0);
    expect(result.words).toBe(0);
    expect(result.lines).toBe(1);
  });

  it('counts characters, not UTF-16 units, and UTF-8 bytes', () => {
    expect(countText('ñ😀')).toEqual({ chars: 2, words: 1, lines: 1, bytes: 6 });
  });
});

describe('processLines', () => {
  const run = (text: string, o: Partial<typeof DEFAULT_LINE_OPTIONS>) =>
    processLines(text, { ...DEFAULT_LINE_OPTIONS, ...o }, 'es');

  it('sorts A-Z, Z-A and naturally', () => {
    expect(run('b\na\nC', { sort: 'az' })).toBe('a\nb\nC');
    expect(run('b\na\nC', { sort: 'za' })).toBe('C\nb\na');
    expect(run('file10\nfile2\nfile1', { sort: 'az' })).toBe('file1\nfile10\nfile2');
    expect(run('file10\nfile2\nfile1', { sort: 'natural' })).toBe('file1\nfile2\nfile10');
    expect(run('ñu\nnube\nzorro', { sort: 'az' })).toBe('nube\nñu\nzorro');
  });

  it('reverses line order', () => {
    expect(run('1\n2\n3', { reverse: true })).toBe('3\n2\n1');
  });

  it('removes duplicates and empty lines and trims', () => {
    expect(run('a\n\nb\na\n  ', { removeEmpty: true, dedupe: true })).toBe('a\nb');
    expect(run('  a \n b', { trim: true })).toBe('a\nb');
    expect(run(' a\na', { trim: true, dedupe: true })).toBe('a');
  });

  it('numbers lines with aligned numbers', () => {
    expect(run('a\nb', { number: true })).toBe('1. a\n2. b');
    expect(
      run(Array.from({ length: 10 }, () => 'x').join('\n'), { number: true }).split('\n')[0],
    ).toBe(' 1. x');
  });

  it('leaves the text alone with default options', () => {
    expect(run(' b\na ', {})).toBe(' b\na ');
  });
});
