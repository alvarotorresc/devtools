// Renders the Open Graph images: the generic one (public/og.png) and one per
// category (public/og/<category-id>.png), which tool and category pages use.
import { chromium } from '@playwright/test';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// Node strips the types: categories.ts only has type imports.
import { categories } from '../src/tools/categories.ts';

const html = fileURLToPath(new URL('./og.html', import.meta.url));
const publicDir = new URL('../public/', import.meta.url);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`file://${html}`);
await page.evaluate(() => document.fonts.ready);

const out = fileURLToPath(new URL('og.png', publicDir));
await page.screenshot({ path: out });
console.log(`OG image written to ${out}`);

// One image serves both languages, so it carries both names. Tools are counted
// from their meta files, which Node cannot import (extensionless imports).
const toolsDir = new URL('../src/tools/', import.meta.url);
const count = {};
for (const dir of readdirSync(toolsDir, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const meta = readFileSync(new URL(`${dir.name}/meta.ts`, toolsDir), 'utf8');
  const id = meta.match(/category: '([a-z]+)'/)?.[1];
  if (id) count[id] = (count[id] ?? 0) + 1;
}

mkdirSync(new URL('og/', publicDir), { recursive: true });
for (const c of categories.filter((c) => count[c.id])) {
  await page.evaluate(
    ({ es, en, sub, url }) => {
      const kicker = document.getElementById('kicker');
      kicker.hidden = false;
      const title = document.getElementById('title');
      title.style.marginTop = '18px';
      title.textContent = es;
      if (en !== es) {
        const small = document.createElement('small');
        small.textContent = en;
        title.append(small);
      }
      document.getElementById('sub').textContent = sub;
      document.getElementById('url').textContent = url;
    },
    {
      es: c.name.es,
      en: c.name.en,
      sub: `${count[c.id]} herramientas en tu navegador · ${count[c.id]} tools in your browser`,
      url: 'devtools.alvarotc.com',
    },
  );
  await page.evaluate(() => document.fonts.ready);
  const file = fileURLToPath(new URL(`og/${c.id}.png`, publicDir));
  await page.screenshot({ path: file });
  console.log(`OG image written to ${file}`);
}

await browser.close();
