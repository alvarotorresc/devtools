import { describe, it, expect } from 'vitest';
import { validateUUID, formatUUID } from '../tools/uuid';
import { formatJSON, minifyJSON, validateJSON } from '../tools/json-tool';
import { encodeBase64, decodeBase64 } from '../tools/base64';
import { decodeJWT, getExpirationInfo } from '../tools/jwt';
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from '../tools/color';
import { toTitleCase, toCamelCase, toSnakeCase, toKebabCase, countText } from '../tools/text';
import { convertBase } from '../tools/number-base';
import { computeDiff } from '../tools/diff';
import { encodeHtmlEntities } from '../tools/html-entities';
import { generateSentence, generateLorem } from '../tools/lorem';

describe('UUID', () => {
  it('validates correct UUIDs', () => {
    expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(validateUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });

  it('rejects invalid UUIDs', () => {
    expect(validateUUID('not-a-uuid')).toBe(false);
    expect(validateUUID('')).toBe(false);
    expect(validateUUID('550e8400e29b41d4a716446655440000')).toBe(false);
  });

  it('formats UUID without dashes', () => {
    expect(formatUUID('550e8400-e29b-41d4-a716-446655440000', false)).toBe(
      '550e8400e29b41d4a716446655440000',
    );
  });

  it('formats UUID with dashes', () => {
    expect(formatUUID('550e8400e29b41d4a716446655440000', true)).toBe(
      '550e8400-e29b-41d4-a716-446655440000',
    );
  });
});

describe('JSON', () => {
  it('formats JSON with indentation', () => {
    expect(formatJSON('{"a":1}')).toBe('{\n  "a": 1\n}');
  });

  it('minifies JSON', () => {
    expect(minifyJSON('{\n  "a": 1\n}')).toBe('{"a":1}');
  });

  it('validates correct JSON', () => {
    expect(validateJSON('{"a":1}').valid).toBe(true);
  });

  it('rejects invalid JSON', () => {
    const result = validateJSON('{invalid}');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('Base64', () => {
  it('encodes text to Base64', () => {
    expect(encodeBase64('Hello, World!')).toBe('SGVsbG8sIFdvcmxkIQ==');
  });

  it('decodes Base64 to text', () => {
    expect(decodeBase64('SGVsbG8sIFdvcmxkIQ==')).toBe('Hello, World!');
  });

  it('handles UTF-8 characters', () => {
    const text = 'Hola mundo!';
    expect(decodeBase64(encodeBase64(text))).toBe(text);
  });

  it('handles empty string', () => {
    expect(encodeBase64('')).toBe('');
    expect(decodeBase64('')).toBe('');
  });
});

describe('JWT', () => {
  const validJWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  it('decodes a valid JWT', () => {
    const result = decodeJWT(validJWT);
    expect(result).not.toBeNull();
    expect(result!.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(result!.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
  });

  it('returns null for invalid JWT', () => {
    expect(decodeJWT('not.a.jwt.token')).toBeNull();
    expect(decodeJWT('invalid')).toBeNull();
  });

  it('shows expiration info', () => {
    expect(getExpirationInfo({ exp: Math.floor(Date.now() / 1000) - 3600 })).toContain('Expired');
    expect(getExpirationInfo({ exp: Math.floor(Date.now() / 1000) + 3600 })).toContain('Expires');
    expect(getExpirationInfo({})).toBe('No expiration');
  });
});

describe('Color', () => {
  it('converts HEX to RGB', () => {
    expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]);
    expect(hexToRgb('#00ff00')).toEqual([0, 255, 0]);
    expect(hexToRgb('#0000ff')).toEqual([0, 0, 255]);
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]);
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
  });

  it('returns null for invalid HEX', () => {
    expect(hexToRgb('invalid')).toBeNull();
    expect(hexToRgb('#gg0000')).toBeNull();
  });

  it('converts RGB to HEX', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
    expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
  });

  it('converts RGB to HSL', () => {
    expect(rgbToHsl(255, 0, 0)).toEqual([0, 100, 50]);
    expect(rgbToHsl(0, 0, 0)).toEqual([0, 0, 0]);
    expect(rgbToHsl(255, 255, 255)).toEqual([0, 0, 100]);
  });

  it('converts HSL to RGB', () => {
    expect(hslToRgb(0, 100, 50)).toEqual([255, 0, 0]);
    expect(hslToRgb(0, 0, 0)).toEqual([0, 0, 0]);
    expect(hslToRgb(0, 0, 100)).toEqual([255, 255, 255]);
  });
});

describe('Text utilities', () => {
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

  it('counts text stats', () => {
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
});

describe('Number Base', () => {
  it('converts decimal to other bases', () => {
    const result = convertBase('255', 10);
    expect(result).not.toBeNull();
    expect(result!.Binary).toBe('11111111');
    expect(result!.Octal).toBe('377');
    expect(result!.Decimal).toBe('255');
    expect(result!.Hex).toBe('FF');
  });

  it('converts binary to other bases', () => {
    const result = convertBase('1010', 2);
    expect(result).not.toBeNull();
    expect(result!.Decimal).toBe('10');
  });

  it('converts hex to other bases', () => {
    const result = convertBase('FF', 16);
    expect(result).not.toBeNull();
    expect(result!.Decimal).toBe('255');
  });

  it('returns null for invalid input', () => {
    expect(convertBase('xyz', 10)).toBeNull();
  });
});

describe('Diff', () => {
  it('detects no differences', () => {
    const result = computeDiff(['a', 'b', 'c'], ['a', 'b', 'c']);
    expect(result.every((d) => d.type === 'equal')).toBe(true);
  });

  it('detects additions', () => {
    const result = computeDiff(['a', 'c'], ['a', 'b', 'c']);
    expect(result).toContainEqual({ type: 'add', text: 'b' });
  });

  it('detects removals', () => {
    const result = computeDiff(['a', 'b', 'c'], ['a', 'c']);
    expect(result).toContainEqual({ type: 'remove', text: 'b' });
  });

  it('handles empty arrays', () => {
    expect(computeDiff([], [])).toEqual([]);
    expect(computeDiff(['a'], [])).toEqual([{ type: 'remove', text: 'a' }]);
    expect(computeDiff([], ['a'])).toEqual([{ type: 'add', text: 'a' }]);
  });
});

describe('HTML Entities', () => {
  it('encodes HTML entities', () => {
    expect(encodeHtmlEntities('<div>')).toBe('&lt;div&gt;');
    expect(encodeHtmlEntities('a & b')).toBe('a &amp; b');
    expect(encodeHtmlEntities('"hello"')).toBe('&quot;hello&quot;');
  });

  it('handles text without special characters', () => {
    expect(encodeHtmlEntities('hello world')).toBe('hello world');
  });
});

describe('Lorem Ipsum', () => {
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
