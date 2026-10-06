import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import { tools } from './src/tools/registry.ts';

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
  for (const tool of tools) {
    const date = git('log', '-1', '--format=%cI', '--', `src/tools/${tool.id}`);
    if (!date) continue;
    if (date > newest) newest = date;
    for (const [locale, slug] of Object.entries(tool.slug)) map.set(`/${locale}/${slug}`, date);
  }
  if (newest) for (const path of ['/', '/es', '/en']) map.set(path, newest);
  return map;
}

const lastmod = lastmodByPath();

// Netlify serves every page at /page and at /page.html. The second one is a
// duplicate, so it gets a 301 to the clean URL.
const htmlRedirects = {
  name: 'html-redirects',
  hooks: {
    'astro:build:done': ({ dir, pages }) => {
      const lines = pages
        .map(({ pathname }) => `/${pathname}`.replace(/\/$/, ''))
        .filter((path) => path !== '/404')
        .map((path) => `${path || '/index'}.html ${path || '/'} 301!`);
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
      filter: (page) => !page.endsWith('/404'),
      serialize(item) {
        const date = lastmod.get(new URL(item.url).pathname);
        return date ? { ...item, lastmod: date } : item;
      },
    }),
    htmlRedirects,
  ],
});
