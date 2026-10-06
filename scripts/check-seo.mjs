#!/usr/bin/env node
// Checks the built site the way a crawler sees it, so an SEO regression fails
// CI instead of showing up weeks later in Search Console.
//
// Every indexable page in `dist/` (everything but 404.html and the root, which
// only forwards to /es or /en and must carry noindex) must have exactly
// one <title>, one meta description, one absolute canonical pointing at its
// own clean URL and one <h1>; all four unique across the site, with the title
// and description inside the lengths search engines show. The sitemap and the
// pages must match one to one, every sitemap URL needs a <lastmod> (unless the
// clone is shallow and the dates would be wrong), `_redirects` has to send
// each `.html` to its clean URL, JSON-LD must parse and tool pages carry a
// BreadcrumbList.
//
// Internal linking: pages are told apart by their JSON-LD (WebApplication is a
// tool, CollectionPage a category). Each tool's breadcrumb links to its
// category page, both home pages link to every category of their language, no
// indexable page is an orphan and every og:image exists in dist/.
//
// Languages: every hreflang points at an indexable page (a 200 with no hop),
// x-default is /en, and `_redirects` sends "/" to /es or /en with forced rules,
// the Language=es one first.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { INDEXNOW_KEY } from '../netlify/plugins/indexnow/key.js';

const DIST = 'dist';
const SITE = 'https://devtools.alvarotc.com';
const TITLE = [30, 60];
const DESCRIPTION = [120, 155];

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decode(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === '#') {
      const n =
        code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
      return String.fromCodePoint(n);
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

// The h1 has to state the same search intent as the title: it cannot be a
// question and has to share at least one meaningful word with the title
// (before " · devtools"). Words are compared without accents or case and by
// their first five letters, so "Decodificador de JWT" matches "Decodificar JWT
// online…". Looser than "the h1 starts the title", but it never needs a list
// of exceptions and still catches a slogan or a question used as h1.
const STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'online',
  'para',
  'con',
  'del',
  'los',
  'las',
  'una',
]);

function stems(text) {
  return (
    text
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .match(/[a-z0-9]+/g) ?? []
  )
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
    .map((w) => w.slice(0, 5));
}

function h1MatchesTitle(h1, title) {
  if (/[?¿]/.test(h1)) return false;
  const words = new Set(stems(title.split(' · ')[0]));
  return stems(h1).some((w) => words.has(w));
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

// Quoted attribute values may contain a literal ">" (a description that
// mentions <p>), so the tag only ends at a ">" outside quotes.
function tagRe(name) {
  return new RegExp(`<${name}\\s(?:[^>"']|"[^"]*"|'[^']*')*>`, 'gi');
}

function attrs(tag) {
  const out = {};
  for (const [, name, value] of tag.matchAll(/([a-z:-]+)="([^"]*)"/gi))
    out[name.toLowerCase()] = decode(value);
  return out;
}

// dist/index.html → /, dist/es.html → /es, dist/es/x.html → /es/x
function pathOf(file) {
  const path =
    '/' +
    relative(DIST, file)
      .split(sep)
      .join('/')
      .replace(/\.html$/, '');
  return path === '/index' ? '/' : path;
}

function isShallow() {
  try {
    return (
      execFileSync('git', ['rev-parse', '--is-shallow-repository'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim() !== 'false'
    );
  } catch {
    return true;
  }
}

if (!existsSync(DIST) || !statSync(DIST).isDirectory()) {
  console.error(`check-seo: no existe "${DIST}/". Ejecuta "pnpm build" antes de este script.`);
  process.exit(1);
}

// Same-site href → clean path (/es/x), or null for external links and assets.
function internalPath(href) {
  let path = href.startsWith(SITE) ? href.slice(SITE.length) || '/' : href;
  if (!path.startsWith('/') || path.startsWith('//')) return null;
  path = path.replace(/[?#].*$/, '');
  return path.length > 1 ? path.replace(/\/$/, '') : path;
}

const errors = [];
const files = walk(DIST);
const info = new Map(); // path → { types, links, crumbLinks, breadcrumb }
const htmlPages = files.filter((f) => f.endsWith('.html') && pathOf(f) !== '/404');
const pages = htmlPages.filter((f) => pathOf(f) !== '/');
const pagePaths = new Set(pages.map(pathOf));
const hreflangs = new Map(); // path → [{ lang, href }]
const seen = { title: new Map(), description: new Map(), canonical: new Map(), h1: new Map() };

function unique(kind, value, path) {
  const other = seen[kind].get(value);
  if (other) errors.push(`${path}: ${kind} repetido con ${other} («${value}»)`);
  else seen[kind].set(value, path);
}

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const path = pathOf(file);
  const url = SITE + path;

  const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map(([, t]) =>
    decode(t).trim(),
  );
  if (titles.length !== 1) errors.push(`${path}: ${titles.length} <title> (debe haber uno)`);
  else {
    const [title] = titles;
    if (title.length < TITLE[0] || title.length > TITLE[1])
      errors.push(`${path}: el title mide ${title.length} (${TITLE[0]}–${TITLE[1]}): «${title}»`);
    unique('title', title, path);
  }

  const metas = [...html.matchAll(tagRe('meta'))].map(([tag]) => attrs(tag));
  const descriptions = metas.filter((m) => m.name === 'description').map((m) => m.content ?? '');
  if (descriptions.length !== 1)
    errors.push(`${path}: ${descriptions.length} meta description (debe haber una)`);
  else {
    const [description] = descriptions;
    if (description.length < DESCRIPTION[0] || description.length > DESCRIPTION[1])
      errors.push(
        `${path}: la description mide ${description.length} (${DESCRIPTION[0]}–${DESCRIPTION[1]}): «${description}»`,
      );
    unique('description', description, path);
  }

  const canonicals = [...html.matchAll(tagRe('link'))]
    .map(([tag]) => attrs(tag))
    .filter((l) => l.rel === 'canonical')
    .map((l) => l.href ?? '');
  if (canonicals.length !== 1)
    errors.push(`${path}: ${canonicals.length} canonical (debe haber uno)`);
  else {
    const [canonical] = canonicals;
    if (canonical !== url)
      errors.push(`${path}: el canonical es ${canonical} y debería ser ${url}`);
    unique('canonical', canonical, path);
  }

  const h1s = [...html.matchAll(/<h1[\s>][\s\S]*?<\/h1>/gi)].map(([h]) =>
    decode(h.replace(/<[^>]+>/g, ''))
      .replace(/\s+/g, ' ')
      .trim(),
  );
  if (h1s.length !== 1) errors.push(`${path}: ${h1s.length} <h1> (debe haber uno)`);
  else {
    unique('h1', h1s[0], path);
    if (titles.length === 1 && !h1MatchesTitle(h1s[0], titles[0]))
      errors.push(`${path}: el h1 «${h1s[0]}» no repite la intención del title «${titles[0]}»`);
  }

  const types = [];
  for (const [, json] of html.matchAll(
    /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const data = JSON.parse(json);
      for (const item of [data].flat()) types.push(item['@type']);
    } catch (e) {
      errors.push(`${path}: JSON-LD inválido (${e.message})`);
    }
  }
  if (path.split('/').length === 3 && !types.includes('BreadcrumbList'))
    errors.push(`${path}: página de herramienta sin BreadcrumbList en el JSON-LD`);

  const links = new Set(
    [...html.matchAll(tagRe('a'))]
      .map(([tag]) => internalPath(attrs(tag).href ?? ''))
      .filter((p) => p !== null && p !== path),
  );
  const crumbNav = html.match(/<nav\s[^>]*class="crumbs[^"]*"[^>]*>([\s\S]*?)<\/nav>/i)?.[1] ?? '';
  const crumbLinks = new Set(
    [...crumbNav.matchAll(tagRe('a'))].map(([tag]) => internalPath(attrs(tag).href ?? '')),
  );
  const breadcrumb = [];
  for (const [, json] of html.matchAll(
    /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const data = JSON.parse(json);
      if (data['@type'] === 'BreadcrumbList')
        for (const item of data.itemListElement ?? []) breadcrumb.push(item.item);
    } catch {
      // already reported above
    }
  }
  info.set(path, { types, links, crumbLinks, breadcrumb });

  hreflangs.set(
    path,
    [...html.matchAll(tagRe('link'))]
      .map(([tag]) => attrs(tag))
      .filter((l) => l.rel === 'alternate' && l.hreflang)
      .map((l) => ({ lang: l.hreflang, href: l.href ?? '' })),
  );

  const ogImages = metas.filter((m) => m.property === 'og:image').map((m) => m.content ?? '');
  if (ogImages.length !== 1) errors.push(`${path}: ${ogImages.length} og:image (debe haber una)`);
  for (const image of ogImages) {
    const imagePath = internalPath(image);
    if (!imagePath || !existsSync(join(DIST, imagePath)))
      errors.push(`${path}: la og:image ${image} no existe en dist/`);
  }
}

// Internal linking.
const isCategory = (path) => info.get(path)?.types.includes('CollectionPage') ?? false;
const categoryPaths = [...info.keys()].filter(isCategory);
if (categoryPaths.length === 0) errors.push('no hay ninguna página de categoría (CollectionPage)');

for (const [path, page] of info) {
  if (!page.types.includes('WebApplication')) continue;
  const category = page.breadcrumb.length === 3 ? internalPath(page.breadcrumb[1]) : null;
  if (!category || !isCategory(category))
    errors.push(`${path}: el BreadcrumbList debe ser Inicio → categoría → herramienta`);
  else if (!page.crumbLinks.has(category))
    errors.push(`${path}: la miga de pan no enlaza a su categoría ${category}`);
}

for (const path of categoryPaths) {
  const home = '/' + path.split('/')[1];
  if (!info.get(home)?.links.has(path))
    errors.push(`${path}: la portada ${home} no enlaza a esta categoría`);
}

// An orphan page gets no internal link from any other indexable page.
const linked = new Set([...info.values()].flatMap((page) => [...page.links]));
for (const path of info.keys())
  if (!linked.has(path)) errors.push(`${path}: página huérfana, ninguna otra página enlaza aquí`);

// hreflang: x-default is /en and every target answers 200 without a redirect,
// which here means it is an indexable page of dist/ (never "/", now a 302).
for (const [path, links] of hreflangs) {
  const xDefault = links.filter((l) => l.lang === 'x-default');
  if (xDefault.length !== 1 || xDefault[0].href !== `${SITE}/en`)
    errors.push(`${path}: el hreflang x-default debe ser ${SITE}/en`);
  for (const { lang, href } of links) {
    const target = href.startsWith(SITE) ? internalPath(href) : null;
    if (!target || !pagePaths.has(target))
      errors.push(`${path}: el hreflang ${lang} apunta a ${href}, que no es una página indexable`);
  }
}

// The root only forwards: on Netlify it is never served, elsewhere it is a
// script page that must stay out of the index.
const rootFile = join(DIST, 'index.html');
if (!existsSync(rootFile)) errors.push('no existe dist/index.html (raíz de respaldo)');
else {
  const rootMetas = [...readFileSync(rootFile, 'utf8').matchAll(tagRe('meta'))].map(([tag]) =>
    attrs(tag),
  );
  if (!rootMetas.some((m) => m.name === 'robots' && /noindex/.test(m.content ?? '')))
    errors.push('/: la raíz debe llevar <meta name="robots" content="noindex">');
}

// Sitemap ↔ pages, one to one.
const sitemaps = files.filter((f) => /sitemap-(?!index)[^/\\]*\.xml$/.test(f));
if (sitemaps.length === 0) errors.push('no hay ningún sitemap-*.xml en dist/');
const shallow = isShallow();
const inSitemap = new Set();
for (const file of sitemaps) {
  for (const [, entry] of readFileSync(file, 'utf8').matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = decode(entry.match(/<loc>([^<]*)<\/loc>/)?.[1] ?? '');
    if (!loc.startsWith(SITE + '/')) {
      errors.push(`sitemap: URL fuera del sitio: ${loc}`);
      continue;
    }
    const path = loc.slice(SITE.length) || '/';
    inSitemap.add(path);
    if (path === '/') {
      errors.push('sitemap: la raíz no debe estar, solo redirige a /es o /en');
      continue;
    }
    if (!pagePaths.has(path)) errors.push(`sitemap: ${loc} no corresponde a ningún HTML de dist/`);
    if (!shallow && !/<lastmod>[^<]+<\/lastmod>/.test(entry))
      errors.push(`sitemap: ${loc} sin <lastmod>`);
  }
}
for (const path of pagePaths)
  if (!inSitemap.has(path)) errors.push(`${path}: no está en el sitemap`);

// Every page has to answer its .html duplicate with a 301 to the clean URL.
const redirectsFile = join(DIST, '_redirects');
if (!existsSync(redirectsFile)) errors.push('no existe dist/_redirects');
else {
  const rules = new Set(
    readFileSync(redirectsFile, 'utf8')
      .split('\n')
      .map((line) => line.trim().split(/\s+/).join(' '))
      .filter(Boolean),
  );
  for (const path of htmlPages.map(pathOf)) {
    const from = (path === '/' ? '/index' : path) + '.html';
    if (!rules.has(`${from} ${path} 301!`)) errors.push(`_redirects: falta «${from} ${path} 301!»`);
  }
  // "/" by language: forced (dist/index.html exists) and Language=es first,
  // because Netlify applies the first rule that matches.
  const order = [...rules];
  const es = order.indexOf('/ /es 302! Language=es');
  const fallback = order.indexOf('/ /en 302!');
  if (es === -1 || fallback === -1)
    errors.push('_redirects: faltan «/ /es 302! Language=es» y «/ /en 302!» para la raíz');
  else if (es > fallback)
    errors.push('_redirects: «/ /es 302! Language=es» debe ir antes de «/ /en 302!»');
}

// IndexNow verifies ownership by fetching /<key>.txt, which has to hold the key.
const keyFile = join(DIST, `${INDEXNOW_KEY}.txt`);
if (!existsSync(keyFile)) errors.push(`no existe dist/${INDEXNOW_KEY}.txt (clave de IndexNow)`);
else if (readFileSync(keyFile, 'utf8').trim() !== INDEXNOW_KEY)
  errors.push(`dist/${INDEXNOW_KEY}.txt no contiene la clave de IndexNow`);

if (errors.length > 0) {
  console.error(`check-seo: ${errors.length} problema(s) en "${DIST}":\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `check-seo: ok — ${pages.length} página(s) (${categoryPaths.length} de categoría) con title, description, canonical y h1 únicos; ${inSitemap.size} URL en el sitemap; enlazado interno, og:image, hreflang, raíz y _redirects al día` +
    (shallow ? ' (clon superficial: no se comprueba <lastmod>).' : '.'),
);
