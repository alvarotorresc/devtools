#!/usr/bin/env node
// Guards against a real production bug: Astro/Vite only ships the CSS of a
// Svelte component if that component actually renders during SSR. A
// sub-component that only mounts after client-side state changes (it is
// never rendered server-side) still ships its JS — including literal
// `svelte-xxxxxxx` scope-hash classes baked into its markup for hydration —
// but its scoped CSS rules are tree-shaken out of the build. The result:
// the component renders unstyled in production while looking fine in `dev`
// and even in a naive local preview that happens to hit the client branch.
//
// Method: collect every `svelte-<hash>` class referenced in the built JS,
// then confirm each one has matching CSS somewhere in the build (either a
// `dist/**/*.css` file, or an inline `<style>` block Astro emitted into a
// `dist/**/*.html` page). Any hash used but never styled fails the build.
//
// A component with no `<style>` block at all never produces this kind of
// class reference in the compiled output in the first place (there is
// nothing for the compiler to scope), so it can never appear as a "used but
// unstyled" hash — no separate exclusion list is needed here. What *does*
// show up as noise is unrelated Svelte runtime identifiers that merely start
// with "svelte-" (e.g. the `svelte-trusted-html` Trusted Types policy name).
// Real scope-hash classes are always terminated by a quote, backtick or
// non-identifier boundary right after the hash; the runtime identifiers are
// followed by more of the identifier (a `-`). The regex below excludes those
// by requiring the match not be followed by another hash-like character.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const HASH_RE = /svelte-[a-z0-9]+(?![a-z0-9-])/g;
const STYLE_BLOCK_RE = /<style[^>]*>([\s\S]*?)<\/style>/gi;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function collectHashes(text) {
  const found = new Set();
  for (const [hash] of text.matchAll(HASH_RE)) found.add(hash);
  return found;
}

if (!existsSync(DIST) || !statSync(DIST).isDirectory()) {
  console.error(`check-css: no existe "${DIST}/". Ejecuta "pnpm build" antes de este script.`);
  process.exit(1);
}

const files = walk(DIST);
const astroJsFiles = files.filter(
  (f) => f.endsWith('.js') && join(f, '..').endsWith(join(DIST, '_astro')),
);
const cssFiles = files.filter((f) => f.endsWith('.css'));
const htmlFiles = files.filter((f) => f.endsWith('.html'));

const referenced = new Set();
for (const f of astroJsFiles) {
  for (const h of collectHashes(readFileSync(f, 'utf8'))) referenced.add(h);
}

const styled = new Set();
for (const f of cssFiles) {
  for (const h of collectHashes(readFileSync(f, 'utf8'))) styled.add(h);
}
for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8');
  for (const [, block] of html.matchAll(STYLE_BLOCK_RE)) {
    for (const h of collectHashes(block)) styled.add(h);
  }
}

const missing = [...referenced].filter((h) => !styled.has(h)).sort();

if (missing.length > 0) {
  console.error(
    `check-css: ${missing.length} clase(s) con hash de Svelte se usan en el bundle pero no tienen CSS en "${DIST}":\n`,
  );
  for (const h of missing) console.error(`  - ${h}`);
  console.error(
    '\nEsto pasa cuando un subcomponente Svelte con <style> solo se renderiza tras la ' +
      'hidratación (nunca en el SSR): su CSS se descarta del build de producción aunque su ' +
      'JS siga referenciando la clase con hash. Mueve sus reglas al componente padre (bajo ' +
      '.wrapper :global(.x)) o a global.css, y comprueba el elemento en una vista previa del build.',
  );
  process.exit(1);
}

console.log(
  `check-css: ok — ${referenced.size} clase(s) con hash de Svelte referenciadas en el bundle, todas con CSS en "${DIST}".`,
);
