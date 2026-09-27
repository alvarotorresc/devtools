import { describe, expect, it } from 'vitest';
// Read from the installed package itself, not from our package.json range.
import pkg from 'ua-parser-js/package.json';
import { formatBrands, parseUserAgent } from './logic';

const FIREFOX_WIN =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0';
const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const PIXEL =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36';
const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

describe('ua-parser-js licence guard', () => {
  it('is the MIT-licensed 1.x line, never the AGPL 2.x', () => {
    expect(pkg.version).toMatch(/^1\./);
    expect(pkg.license).toBe('MIT');
  });
});

describe('parseUserAgent', () => {
  it('reads Firefox on Windows', () => {
    expect(parseUserAgent(FIREFOX_WIN)).toEqual({
      browser: 'Firefox 128.0',
      engine: 'Gecko 128.0',
      os: 'Windows 10',
      vendor: null,
      model: null,
      deviceType: 'desktop',
      deviceKnown: false,
      cpu: 'amd64',
      bot: false,
      recognised: true,
    });
  });

  it('reads phones with vendor, model and type', () => {
    expect(parseUserAgent(IPHONE)).toMatchObject({
      browser: 'Mobile Safari 17.5',
      engine: 'WebKit 605.1.15',
      os: 'iOS 17.5',
      vendor: 'Apple',
      model: 'iPhone',
      deviceType: 'mobile',
      deviceKnown: true,
    });
    expect(parseUserAgent(PIXEL)).toMatchObject({
      browser: 'Chrome 128.0.0.0',
      engine: 'Blink 128.0.0.0',
      os: 'Android 14',
      vendor: 'Google',
      model: 'Pixel 8',
    });
  });

  it('flags bots', () => {
    expect(parseUserAgent(GOOGLEBOT)).toMatchObject({ bot: true, recognised: false });
  });

  it('says when nothing was recognised', () => {
    expect(parseUserAgent('hola que tal')).toMatchObject({
      browser: null,
      engine: null,
      os: null,
      recognised: false,
    });
  });

  it('returns null for empty input', () => {
    expect(parseUserAgent('   ')).toBeNull();
  });

  it('copes with a 2 KB User-Agent', () => {
    expect(parseUserAgent(FIREFOX_WIN + ' x'.repeat(1000))).toMatchObject({
      browser: 'Firefox 128.0',
    });
  });
});

describe('formatBrands', () => {
  it('drops the GREASE "Not A Brand" entries', () => {
    expect(
      formatBrands([
        { brand: 'Chromium', version: '128' },
        { brand: 'Not;A=Brand', version: '24' },
        { brand: 'Google Chrome', version: '128' },
      ]),
    ).toBe('Chromium 128, Google Chrome 128');
  });
});
