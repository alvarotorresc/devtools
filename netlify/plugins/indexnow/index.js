// Tells IndexNow (Bing, Yandex, Seznam…) which URLs changed in a production
// deploy. The live sitemap is read before the build, while it still describes
// the previous deploy; onSuccess runs once the new deploy is live ("runs when
// the deploy succeeds", Netlify docs) and submits the new or changed URLs.
// IndexNow problems are logged and never fail the build.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { INDEXNOW_KEY, KEY_LOCATION, SITE_HOST } from './key.js';
import { changedUrls, parseSitemap } from './sitemap.js';

const LIVE_SITEMAP = `https://${SITE_HOST}/sitemap-0.xml`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

let previous = null;

const isProduction = () => process.env.CONTEXT === 'production';

export async function onPreBuild() {
  if (!isProduction()) return;
  try {
    const res = await fetch(LIVE_SITEMAP, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    previous = parseSitemap(await res.text());
    console.log(`IndexNow: sitemap publicado con ${previous.size} URL(s).`);
  } catch (e) {
    previous = null;
    console.log(`IndexNow: no se pudo leer ${LIVE_SITEMAP} (${e.message}); se enviarán todas.`);
  }
}

export async function onSuccess({ constants }) {
  if (!isProduction()) return;
  try {
    const dir = constants.PUBLISH_DIR;
    const current = new Map();
    for (const name of readdirSync(dir).filter((f) => /^sitemap-(?!index)[^/]*\.xml$/.test(f)))
      for (const entry of parseSitemap(readFileSync(join(dir, name), 'utf8')))
        current.set(...entry);

    const urlList = changedUrls(previous, current);
    if (urlList.length === 0) {
      console.log('IndexNow: ninguna URL nueva o cambiada.');
      return;
    }
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: SITE_HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    console.log(`IndexNow: ${urlList.length} URL(s) enviadas, respuesta HTTP ${res.status}.`);
  } catch (e) {
    console.log(`IndexNow: no se pudo avisar (${e.message}).`);
  }
}
