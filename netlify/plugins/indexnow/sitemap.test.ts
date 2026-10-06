import { describe, expect, it } from 'vitest';
import { changedUrls, MAX_URLS, parseSitemap } from './sitemap.js';

const xml = (entries: [string, string?][]) =>
  `<?xml version="1.0" encoding="UTF-8"?><urlset>${entries
    .map(
      ([loc, lastmod]) =>
        `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`,
    )
    .join('')}</urlset>`;

describe('parseSitemap', () => {
  it('maps each loc to its lastmod', () => {
    const map = parseSitemap(
      xml([['https://x.com/a', '2026-10-01'], ['https://x.com/b?x=1&amp;y=2']]),
    );
    expect([...map]).toEqual([
      ['https://x.com/a', '2026-10-01'],
      ['https://x.com/b?x=1&y=2', ''],
    ]);
  });

  it('returns an empty map for something that is not a sitemap', () => {
    expect(parseSitemap('<html>404</html>').size).toBe(0);
  });
});

describe('changedUrls', () => {
  const current = new Map([
    ['https://x.com/same', '2026-10-01'],
    ['https://x.com/changed', '2026-10-06'],
    ['https://x.com/new', '2026-10-06'],
  ]);

  it('keeps new URLs and URLs whose lastmod changed', () => {
    const previous = new Map([
      ['https://x.com/same', '2026-10-01'],
      ['https://x.com/changed', '2026-10-01'],
      ['https://x.com/gone', '2026-10-01'],
    ]);
    expect(changedUrls(previous, current)).toEqual(['https://x.com/changed', 'https://x.com/new']);
  });

  it('sends everything when there is no previous sitemap', () => {
    expect(changedUrls(null, current)).toEqual([...current.keys()]);
  });

  it('sends nothing when nothing changed', () => {
    expect(changedUrls(new Map(current), current)).toEqual([]);
  });

  it(`never sends more than ${MAX_URLS} URLs`, () => {
    const many = new Map(
      Array.from({ length: MAX_URLS + 5 }, (_, i) => [`https://x.com/${i}`, '']),
    );
    expect(changedUrls(null, many)).toHaveLength(MAX_URLS);
  });
});
