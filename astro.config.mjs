import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import { toolsInCategory, tools, visibleCategories } from './src/tools/registry.ts';

const SITE = 'https://devtools.alvarotc.com';

function git(...args) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

// lastmod is the date of the last commit that touched each tool, not the build
// date. A shallow clone would give every page the same date, so it is left out.
function lastmodByPath() {
  if (git('rev-parse', '--is-shallow-repository') !== 'false') return new Map();
  const map = new Map();
  let newest = '';
  const byTool = new Map();
  for (const tool of tools) {
    const date = git('log', '-1', '--format=%cI', '--', `src/tools/${tool.id}`);
    if (!date) continue;
    byTool.set(tool.id, date);
    if (date > newest) newest = date;
    for (const [locale, slug] of Object.entries(tool.slug)) map.set(`/${locale}/${slug}`, date);
  }
  if (newest) for (const path of ['/es', '/en']) map.set(path, newest);
  // A category page changes when any of its tools does (or its own copy in
  // categories.ts), so it takes the newest of those dates.
  const copy = git('log', '-1', '--format=%cI', '--', 'src/tools/categories.ts');
  for (const category of visibleCategories()) {
    const dates = toolsInCategory(category.id)
      .map((t) => byTool.get(t.id) ?? '')
      .concat(copy);
    const date = dates.reduce((a, b) => (b > a ? b : a), '');
    if (!date) continue;
    for (const [locale, slug] of Object.entries(category.slug)) map.set(`/${locale}/${slug}`, date);
  }
  return map;
}

const lastmod = lastmodByPath();

// The root sends each visitor straight to their language with a 302, decided
// at the CDN: the nf_lang cookie (set when someone picks or visits a language)
// wins, then the first language of Accept-Language (Netlify ignores q-values),
// and everyone else, Googlebot included, goes to /en. dist/index.html exists,
// so the rules must be forced (!) and the conditional one must come first.
const ROOT_REDIRECTS = ['/ /es 302! Language=es', '/ /en 302!'];

// Netlify serves every page at /page and at /page.html. The second one is a
// duplicate, so it gets a 301 to the clean URL. /index.html keeps its 301 to
// the root (and then the 302): a 301 that depended on the language would be
// cached by the browser and stick to whoever got it first.
const htmlRedirects = {
  name: 'html-redirects',
  hooks: {
    'astro:build:done': ({ dir, pages }) => {
      const htmlLines = pages
        .map(({ pathname }) => `/${pathname}`.replace(/\/$/, ''))
        .filter((path) => path !== '/404')
        .map((path) => `${path || '/index'}.html ${path || '/'} 301!`);
      const lines = [...ROOT_REDIRECTS, ...htmlLines];
      writeFileSync(new URL('_redirects', dir), lines.join('\n') + '\n');
    },
  },
};

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    svelte(),
    sitemap({
      // The root only forwards to /es or /en, so it is not a page to index.
      filter: (page) => {
        const path = new URL(page).pathname;
        return path !== '/' && path !== '/404';
      },
      serialize(item) {
        const date = lastmod.get(new URL(item.url).pathname);
        return date ? { ...item, lastmod: date } : item;
      },
    }),
    htmlRedirects,
  ],
});
