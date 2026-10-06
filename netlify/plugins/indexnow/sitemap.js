// Pure helpers for the IndexNow plugin, kept apart so they can be unit tested.

/** IndexNow accepts at most 10 000 URLs per request. */
export const MAX_URLS = 10_000;

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decode(text) {
  return text.replace(/&(amp|lt|gt|quot|apos);/g, (_, name) => ENTITIES[name]);
}

/**
 * Reads a sitemap's <url> entries.
 * @param {string} xml
 * @returns {Map<string, string>} loc → lastmod ('' when it has none)
 */
export function parseSitemap(xml) {
  const map = new Map();
  for (const [, entry] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = entry.match(/<loc>\s*([^<]*?)\s*<\/loc>/)?.[1];
    if (!loc) continue;
    const lastmod = entry.match(/<lastmod>\s*([^<]*?)\s*<\/lastmod>/)?.[1] ?? '';
    map.set(decode(loc), lastmod);
  }
  return map;
}

/**
 * URLs worth telling search engines about: new ones and those whose lastmod
 * changed. Without a previous sitemap every URL counts. Capped at MAX_URLS.
 * @param {Map<string, string> | null} previous
 * @param {Map<string, string>} current
 * @returns {string[]}
 */
export function changedUrls(previous, current) {
  const urls = [...current]
    .filter(([loc, lastmod]) => !previous || previous.get(loc) !== lastmod)
    .map(([loc]) => loc);
  return urls.slice(0, MAX_URLS);
}
