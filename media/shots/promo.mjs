// ===== Promos de escritorio y móvil, e icono =====
//
// Compone la portada (cover-*.png, cover-mobile-*.png) dentro de un navegador o de un teléfono
// sobre el fondo grafito del sitio, a 1920×1080, y renderiza el favicon a 1024×1024 para el
// icono de la ficha. Las páginas de media/promo/ se abren con file:// (no están en dist/), con
// las fuentes del propio node_modules. Lee el número de herramientas de labels.json, así que
// va después de shots.mjs y labels.mjs.

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { OUT, REPO_ROOT, checkSize, chromium } from './lib.mjs';

const PROMO_DIR = join(REPO_ROOT, 'media', 'promo');
const LANGS = ['es', 'en'];

async function ready(page) {
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('img')).every((i) => i.complete && i.naturalWidth > 0),
  );
}

async function renderPromo(page, html, img, lang, n, outName) {
  const url = new URL(pathToFileURL(join(PROMO_DIR, html)));
  url.searchParams.set('lang', lang);
  url.searchParams.set('n', String(n));
  url.searchParams.set('img', pathToFileURL(join(OUT, img)).href);
  await page.goto(url.href);
  await ready(page);
  const buf = await page.screenshot();
  const outPath = join(OUT, outName);
  checkSize(buf, outPath, 1920, 1080);
  await writeFile(outPath, buf);
  console.log(`OK    ${outName}`);
}

// El favicon a sangre: sin esquinas redondeadas (la web y las stores ponen las suyas) y con
// fondo sólido, como pide docs/MEDIA_PROYECTOS.md de alvarotc-web.
async function renderIcon(page) {
  const raw = await readFile(join(REPO_ROOT, 'public', 'favicon.svg'), 'utf8');
  // El fondo del lienzo es el mismo relleno que el <rect> del favicon.
  const bg = raw.match(/<rect[^>]*fill="([^"]+)"/)?.[1] ?? '#161719';
  const svg = raw.replace(/\s*rx="[^"]*"/, '').replace('<svg ', '<svg width="1024" height="1024" ');
  await page.setViewportSize({ width: 1024, height: 1024 });
  await page.setContent(
    `<!doctype html><html><body style="margin:0;background:${bg}">${svg}</body></html>`,
  );
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: 1024, height: 1024 } });
  const outPath = join(OUT, 'icon.png');
  checkSize(buf, outPath, 1024, 1024);
  await writeFile(outPath, buf);
  console.log('OK    icon.png');
}

async function main() {
  const labels = JSON.parse(await readFile(join(OUT, 'labels.json'), 'utf8'));
  const n = labels.count;
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
    });
    for (const lang of LANGS) {
      await renderPromo(
        page,
        'promo-desktop.html',
        `cover-${lang}.png`,
        lang,
        n,
        `promo-${lang}.png`,
      );
      await renderPromo(
        page,
        'promo-mobile.html',
        `cover-mobile-${lang}.png`,
        lang,
        n,
        `promo-mobile-${lang}.png`,
      );
    }
    await renderIcon(page);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
