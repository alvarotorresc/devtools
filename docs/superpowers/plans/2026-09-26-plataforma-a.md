# DevTools plataforma (Plan A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir la SPA vanilla por un sitio estático Astro 7 + Svelte 5, bilingüe (ES/EN), con 3 temas, sidebar agrupada y plegable, Home con buscador, kit de UI "Instrumento" y las dos primeras herramientas (JSON y UUID) migradas sobre el patrón nuevo.

**Architecture:** Astro genera una página estática por herramienta e idioma desde un registro tipado (`src/tools/registry.ts`). El layout (sidebar, cabecera móvil, pantalla de arranque) es HTML estático con scripts pequeños y persiste entre navegaciones con `<ClientRouter />` + `transition:persist`. Solo las herramientas, la paleta de comandos, el diálogo de atajos y el toaster son islas Svelte. El estado del usuario vive en `localStorage` a través de `lib/storage.ts`, que nunca lanza excepciones.

**Tech Stack:** Astro 7.3, @astrojs/svelte 9, Svelte 5.57 (runes), TypeScript 6, @astrojs/sitemap 3.7, @lucide/svelte 1.48, Fontsource (Unbounded, Instrument Sans, IBM Plex Mono), Vitest 5, Playwright 1.63, ESLint 9 + typescript-eslint + eslint-plugin-svelte + eslint-plugin-astro, Prettier 3.

**Spec:** `docs/superpowers/specs/2026-09-26-devtools-plataforma-design.md`. Referencia visual: canvas https://claude.ai/artifact/H5MdJhWRGZMzTP4SjoMy93, página *Instrumento*.

**Alcance de este plan:** plataforma completa + herramientas `json` y `uuid`. **Plan B** (se escribe cuando A esté terminado, sobre el kit real) migra las otras 12 herramientas desde `legacy/`. La rama `feat/plataforma-astro` **no se mergea a `main` hasta terminar el Plan B**, para no quitar herramientas de la web en producción.

## Global Constraints

- Node `>=22.12.0`. `package.json` lleva `"packageManager": "pnpm@10.30.2"`. CI con Node 22.
- TypeScript **`^6`**: nunca `pnpm add typescript` sin versión, porque instala la 7 y rompe los peer deps de `@astrojs/check` y `@astrojs/svelte`.
- Astro 7 usa un compilador en Rust: **toda etiqueta no vacía se cierra** y no se anida HTML inválido (nada de `<div>` dentro de `<p>` ni de `<a>` dentro de `<a>`).
- Astro 7 usa `compressHTML: 'jsx'`: el espacio entre elementos en línea puede desaparecer. Los separadores ("Inicio / Categoría", "ES / EN") se escriben con `{' / '}` o se separan con `gap` de CSS.
- **No** se activa la opción `i18n` de Astro (genera su propia redirección de `/`). El i18n es manual: rutas `[locale]/…`.
- `@astrojs/sitemap` **sin** opción `i18n` (con slugs traducidos no empareja las URLs). El hreflang va en `<head>`.
- Tema en `<html data-theme>`: el script en línea del `<head>` lo aplica en la carga y en `astro:before-swap` sobre `event.newDocument`. Si no, cada navegación lo reinicia (comprobado en la prueba).
- `astro preview` en v7 es un demonio con archivo de bloqueo: usar siempre `astro preview --ignore-lock`.
- `logic.ts` de cada herramienta es puro: sin `document`, `window` ni `localStorage`. Se testea en el entorno `node` de Vitest.
- Ningún componente usa colores hex: todo sale de las variables de `src/styles/tokens.css`.
- Claves de almacenamiento con prefijo `devtools:`. Todo acceso pasa por `src/lib/storage.ts`.
- Botones y objetivos táctiles ≥ 44 px. El foco siempre es visible. Con `prefers-reduced-motion: reduce` no hay desplazamientos.
- Textos de interfaz en sentence case, sin mayúsculas sostenidas en etiquetas. Los errores dicen qué pasa y cómo arreglarlo.
- Commits con el formato del repo (`feat:`, `chore:`, `test:`, `docs:`). El mensaje termina con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` y, en la línea siguiente, `Claude-Session: https://claude.ai/code/session_01RuBvKMoRNcq5quxr9i1JjP` (los ejemplos de commit de cada task muestran solo la primera por brevedad; añade las dos).
- **Atajos (pendiente de confirmar por el autor, ver Handoff):** `Ctrl/⌘+K` en todas partes. Fuera de campos de texto: `/` busca, `?` muestra la ayuda, `c` copia el resultado principal y `1…9` cambian de pestaña. Esto sustituye a `Ctrl+Shift+C` (abre el inspector del navegador) y a `Alt+1…9` (cambia de pestaña en Firefox en Linux), que proponía el spec.

## Review Focus

1. **Almacenamiento bloqueado o que lanza excepciones** (modo privado, cookies bloqueadas): la web se carga con el tema terminal, sin errores en consola, y favoritos y recientes simplemente no se guardan. → Test en Task 2 y e2e en Task 16.
2. **Cambio de tema, idioma o estado de la sidebar tras navegar sin recarga**: sin parpadeos ni vuelta al estado por defecto, y la herramienta actual marcada en la sidebar tras cada navegación. → e2e en Task 16 (tema, sidebar plegada y `aria-current` tras navegar).
3. **JSON enorme pegado** (varios MB): la pestaña no se congela al escribir. El formateo usa debounce y el árbol solo pinta los nodos abiertos. → Test de `shouldDebounce` en Task 13.
4. **Teclas de atajo mientras se escribe**: pulsar `/`, `c` o `1` dentro de un input o textarea escribe el carácter y no dispara el atajo. → Test de `matchShortcut` en Task 12.
5. **Enlaces antiguos `/#json`, `/#url`, `/#number-base`**: llevan a la herramienta equivalente del idioma elegido. Si esa herramienta aún no está migrada, llevan a la Home de ese idioma, nunca a un 404. → Test de `resolveLegacyHash` en Task 11.

---

## File Structure

```
astro.config.mjs            svelte.config.js         vitest.config.ts      playwright.config.ts
eslint.config.js            tsconfig.json            .prettierrc           .nvmrc
public/favicon.svg (se mantiene)   public/og.png   public/robots.txt
legacy/src/…                → código antiguo, fuera de build y lint; fuente para el Plan B
src/
  env.d.ts
  styles/tokens.css         → variables de los 3 temas
  styles/global.css         → reset, tipografía, utilidades, boot screen, sidebar, layout
  lib/storage.ts            → lectura y escritura segura (local/session)
  lib/prefs.ts              → favoritos, recientes, recordar input, eventos de cambio
  lib/search.ts             → búsqueda difusa
  lib/shortcuts.ts          → matchShortcut + registro de proveedores (copiar, pestañas)
  lib/toast.ts              → toast(msg) por evento global
  lib/clipboard.ts          → copyText
  lib/legacy.ts             → resolveLegacyHash
  i18n/es.ts  i18n/en.ts    → diccionarios de interfaz
  i18n/index.ts             → t(), otherLocale(), rutas
  tools/types.ts            → Locale, CategoryId, ToolMeta
  tools/icons.ts            → mapa nombre → componente Lucide
  tools/categories.ts       → las 7 categorías
  tools/registry.ts         → lista de metas + helpers
  tools/registry.test.ts    → validación del registro
  tools/json/{meta.ts,logic.ts,logic.test.ts,Json.svelte,JsonTree.svelte,content.es.md,content.en.md}
  tools/uuid/{meta.ts,logic.ts,logic.test.ts,Uuid.svelte,content.es.md,content.en.md}
  ui/{Icon,Button,Segmented,Field,TextArea,NumberInput,Select,Toggle,Display,Led,CopyButton,FileDrop}.svelte
  ui/persisted.svelte.ts    → estado de input recordado
  islands/{CommandPalette,ShortcutsDialog,Toaster}.svelte
  components/{SeoHead,Sidebar,MobileHeader,ToolShell,ToolIsland,Catalog,BootScreen}.astro
  layouts/AppLayout.astro
  pages/index.astro  pages/404.astro  pages/[locale]/index.astro  pages/[locale]/[slug].astro
e2e/smoke.spec.ts
```

---

### Task 1: Scaffold Astro 7 + Svelte, mover el código antiguo a `legacy/`

**Files:**
- Create: `astro.config.mjs`, `svelte.config.js`, `vitest.config.ts`, `src/env.d.ts`, `.nvmrc`, `src/pages/[locale]/index.astro` (provisional)
- Modify: `package.json`, `tsconfig.json`, `eslint.config.js`, `.prettierrc`, `.gitignore`
- Delete: `index.html`, `vite.config.ts`
- Move: `src/` → `legacy/src/`

**Interfaces:**
- Produces: scripts `pnpm dev|build|preview|check|lint|test|test:e2e`. Alias de ruta ninguno (imports relativos).

- [ ] **Step 1: Mover el código antiguo**

```bash
git mv src legacy/src
git rm index.html vite.config.ts
mkdir -p src/pages/\[locale\]
```

- [ ] **Step 2: Reescribir `package.json`**

```json
{
  "name": "devtools",
  "private": true,
  "version": "0.2.0",
  "type": "module",
  "description": "Developer tools: JSON, UUID, JWT, Base64, hashes, Spanish IDs and more. Everything runs in your browser.",
  "author": "Álvaro TC",
  "license": "MIT",
  "homepage": "https://devtools.alvarotc.com",
  "packageManager": "pnpm@10.30.2",
  "engines": {
    "node": ">=22.12.0"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview --ignore-lock",
    "check": "astro check",
    "lint": "eslint . && prettier --check src",
    "format": "prettier --write src",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 3: Instalar dependencias**

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm add astro@^7.3.5 @astrojs/svelte@^9.0.1 svelte@^5.57.1 @astrojs/sitemap@^3.7.4 @lucide/svelte@^1.48.0 @fontsource-variable/unbounded@^5.3.0 @fontsource-variable/instrument-sans@^5.3.0 @fontsource/ibm-plex-mono@^5.3.0
pnpm add -D typescript@^6 @astrojs/check@^0.9.10 vitest@^5.0.2 @playwright/test@^1.63.0 eslint@^9 @eslint/js@^9 typescript-eslint eslint-plugin-svelte eslint-plugin-astro globals prettier@^3 prettier-plugin-astro prettier-plugin-svelte
```

Expected: termina sin errores de peer deps (`typescript` 6.x instalado: `pnpm ls typescript`).

- [ ] **Step 4: Configuración**

`astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://devtools.alvarotc.com',
  trailingSlash: 'never',
  build: { format: 'directory' },
  integrations: [svelte(), sitemap({ filter: (page) => !page.endsWith('/404') })],
});
```

`svelte.config.js`:
```js
import { vitePreprocess } from '@astrojs/svelte';

export default { preprocess: vitePreprocess() };
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['src/**/*.test.ts'], environment: 'node', passWithNoTests: true },
});
```

`tsconfig.json`:
```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "src/**/*", "e2e/**/*", "*.config.*"],
  "exclude": ["dist", "legacy"]
}
```

`src/env.d.ts`:
```ts
/// <reference types="astro/client" />

interface Window {
  __devtoolsHooked?: boolean;
}
```

`eslint.config.js`:
```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', '.astro/**', 'legacy/**', 'playwright-report/**', 'test-results/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs.recommended,
  ...astro.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
);
```

`.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-astro", "prettier-plugin-svelte"]
}
```

`.nvmrc`:
```
22
```

`.gitignore` (añadir al final):
```
.astro
playwright-report
test-results
```

`src/pages/[locale]/index.astro` (provisional, se reemplaza en la Task 11):
```astro
---
export function getStaticPaths() {
  return [{ params: { locale: 'es' } }, { params: { locale: 'en' } }];
}
const { locale } = Astro.params;
---

<html lang={locale}><body><h1>devtools {locale}</h1></body></html>
```

- [ ] **Step 5: Verificar**

Run: `pnpm build && pnpm check && pnpm lint`
Expected: build con 2 páginas (`/es`, `/en`), `0 errors` en check, lint limpio y `pnpm test` sale en verde sin tests (`passWithNoTests`).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro 7 + Svelte 5 y mover la app antigua a legacy/

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: `lib/storage.ts` y `lib/prefs.ts`

**Files:**
- Create: `src/lib/storage.ts`, `src/lib/storage.test.ts`, `src/lib/prefs.ts`, `src/lib/prefs.test.ts`

**Interfaces:**
- Produces:
  - `readString(key: string, fallback: string, area?: 'local' | 'session'): string`
  - `writeString(key: string, value: string, area?: 'local' | 'session'): void`
  - `readJSON<T>(key: string, fallback: T, area?): T`
  - `writeJSON(key: string, value: unknown, area?): void`
  - `removeKey(key: string, area?): void`
  - `STORAGE_PREFIX = 'devtools:'`
  - `PREFS_EVENT = 'devtools:prefs'` (evento `CustomEvent<{ key: string }>` en `window`)
  - `getFavorites(): string[]`, `isFavorite(id): boolean`, `toggleFavorite(id): boolean`
  - `getRecent(): string[]`, `pushRecent(id): string[]`, `MAX_RECENT = 8`
  - `getRemember(toolId: string, fallback: boolean): boolean`, `setRemember(toolId, value: boolean): void`
  - `loadInput(toolId): string | null`, `saveInput(toolId, value: string): void`, `clearInput(toolId): void`

- [ ] **Step 1: Test de storage (falla)**

`src/lib/storage.test.ts`:
```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readJSON, readString, removeKey, writeJSON, writeString } from './storage';

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => void map.delete(k),
    setItem: (k, v) => void map.set(k, String(v)),
  };
}

function throwingStorage(): Storage {
  const boom = () => {
    throw new DOMException('blocked', 'SecurityError');
  };
  return { length: 0, clear: boom, getItem: boom, key: boom, removeItem: boom, setItem: boom };
}

afterEach(() => vi.unstubAllGlobals());

describe('storage', () => {
  it('reads and writes strings with the devtools: prefix', () => {
    const ls = memoryStorage();
    vi.stubGlobal('localStorage', ls);
    writeString('theme', 'dark');
    expect(ls.getItem('devtools:theme')).toBe('dark');
    expect(readString('theme', 'terminal')).toBe('dark');
  });

  it('round-trips JSON and returns the fallback on corrupt data', () => {
    const ls = memoryStorage();
    vi.stubGlobal('localStorage', ls);
    writeJSON('favorites', ['json']);
    expect(readJSON('favorites', [])).toEqual(['json']);
    ls.setItem('devtools:favorites', '{not json');
    expect(readJSON('favorites', ['x'])).toEqual(['x']);
  });

  it('uses sessionStorage when asked', () => {
    const ss = memoryStorage();
    vi.stubGlobal('sessionStorage', ss);
    writeString('booted', '1', 'session');
    expect(ss.getItem('devtools:booted')).toBe('1');
  });

  it('never throws when storage is missing', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(readString('theme', 'terminal')).toBe('terminal');
    expect(() => writeString('theme', 'dark')).not.toThrow();
    expect(() => removeKey('theme')).not.toThrow();
  });

  it('never throws when storage access throws (private mode)', () => {
    vi.stubGlobal('localStorage', throwingStorage());
    expect(readJSON('recent', [])).toEqual([]);
    expect(() => writeJSON('recent', ['json'])).not.toThrow();
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `pnpm test src/lib/storage.test.ts`
Expected: FAIL, "Failed to resolve import ./storage".

- [ ] **Step 3: Implementar `src/lib/storage.ts`**

```ts
export const STORAGE_PREFIX = 'devtools:';

type Area = 'local' | 'session';

function area(kind: Area): Storage | null {
  try {
    const s = kind === 'local' ? globalThis.localStorage : globalThis.sessionStorage;
    return s ?? null;
  } catch {
    return null;
  }
}

export function readString(key: string, fallback: string, kind: Area = 'local'): string {
  try {
    return area(kind)?.getItem(STORAGE_PREFIX + key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeString(key: string, value: string, kind: Area = 'local'): void {
  try {
    area(kind)?.setItem(STORAGE_PREFIX + key, value);
  } catch {
    // Storage blocked or full: the app keeps working without persistence.
  }
}

export function readJSON<T>(key: string, fallback: T, kind: Area = 'local'): T {
  const raw = readString(key, '', kind);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown, kind: Area = 'local'): void {
  writeString(key, JSON.stringify(value), kind);
}

export function removeKey(key: string, kind: Area = 'local'): void {
  try {
    area(kind)?.removeItem(STORAGE_PREFIX + key);
  } catch {
    // Ignored on purpose, same as writeString.
  }
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `pnpm test src/lib/storage.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Test de prefs (falla)**

`src/lib/prefs.test.ts`:
```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_RECENT,
  clearInput,
  getFavorites,
  getRecent,
  getRemember,
  isFavorite,
  loadInput,
  pushRecent,
  saveInput,
  setRemember,
  toggleFavorite,
} from './prefs';

beforeEach(() => {
  const map = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  });
  vi.stubGlobal('window', { dispatchEvent: vi.fn() });
  vi.stubGlobal('CustomEvent', class { constructor(public type: string, public init?: unknown) {} });
});

describe('favorites', () => {
  it('toggles and reports state', () => {
    expect(getFavorites()).toEqual([]);
    expect(toggleFavorite('json')).toBe(true);
    expect(isFavorite('json')).toBe(true);
    expect(toggleFavorite('json')).toBe(false);
    expect(getFavorites()).toEqual([]);
  });

  it('notifies other components', () => {
    toggleFavorite('uuid');
    expect(window.dispatchEvent).toHaveBeenCalled();
  });
});

describe('recent', () => {
  it('puts the latest first without duplicates and caps the list', () => {
    pushRecent('a');
    pushRecent('b');
    pushRecent('a');
    expect(getRecent()).toEqual(['a', 'b']);
    for (let i = 0; i < 20; i++) pushRecent(`t${i}`);
    expect(getRecent()).toHaveLength(MAX_RECENT);
    expect(getRecent()[0]).toBe('t19');
  });
});

describe('remembered input', () => {
  it('uses the tool default until the user chooses', () => {
    expect(getRemember('jwt', false)).toBe(false);
    setRemember('jwt', true);
    expect(getRemember('jwt', false)).toBe(true);
  });

  it('saves, loads and clears input', () => {
    expect(loadInput('json')).toBeNull();
    saveInput('json', '{"a":1}');
    expect(loadInput('json')).toBe('{"a":1}');
    clearInput('json');
    expect(loadInput('json')).toBeNull();
  });
});
```

- [ ] **Step 6: Verificar que falla**

Run: `pnpm test src/lib/prefs.test.ts`
Expected: FAIL, "Failed to resolve import ./prefs".

- [ ] **Step 7: Implementar `src/lib/prefs.ts`**

```ts
import { readJSON, readString, removeKey, writeJSON, writeString } from './storage';

export const PREFS_EVENT = 'devtools:prefs';
export const MAX_RECENT = 8;

function notify(key: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: { key } }));
}

export function getFavorites(): string[] {
  const v = readJSON<unknown>('favorites', []);
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

export function toggleFavorite(id: string): boolean {
  const favs = getFavorites();
  const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
  writeJSON('favorites', next);
  notify('favorites');
  return next.includes(id);
}

export function getRecent(): string[] {
  const v = readJSON<unknown>('recent', []);
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

export function pushRecent(id: string): string[] {
  const next = [id, ...getRecent().filter((r) => r !== id)].slice(0, MAX_RECENT);
  writeJSON('recent', next);
  notify('recent');
  return next;
}

export function getRemember(toolId: string, fallback: boolean): boolean {
  const v = readString(`remember.${toolId}`, '');
  return v === '' ? fallback : v === '1';
}

export function setRemember(toolId: string, value: boolean): void {
  writeString(`remember.${toolId}`, value ? '1' : '0');
  if (!value) clearInput(toolId);
}

export function loadInput(toolId: string): string | null {
  const v = readString(`input.${toolId}`, '\u0000');
  return v === '\u0000' ? null : v;
}

export function saveInput(toolId: string, value: string): void {
  writeString(`input.${toolId}`, value);
}

export function clearInput(toolId: string): void {
  removeKey(`input.${toolId}`);
}
```

- [ ] **Step 8: Verificar que pasa**

Run: `pnpm test`
Expected: PASS (storage y prefs).

- [ ] **Step 9: Commit**

```bash
git add src/lib
git commit -m "feat: almacenamiento seguro y preferencias (favoritos, recientes, input recordado)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Tipos, categorías, iconos e i18n

**Files:**
- Create: `src/tools/types.ts`, `src/tools/icon-names.ts`, `src/tools/icons.ts`, `src/tools/categories.ts`, `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/index.ts`, `src/i18n/i18n.test.ts`

**Interfaces:**
- Produces:
  - `type Locale = 'es' | 'en'`, `LOCALES: readonly Locale[]`, `type CategoryId = 'gen' | 'enc' | 'data' | 'ids' | 'conv' | 'rand' | 'ref'`
  - `interface ToolMeta` (ver código)
  - `ICON_NAMES` y `type IconName` (en `icon-names.ts`, sin dependencias) e `icons: Record<IconName, Component>` (en `icons.ts`)
  - `categories: Category[]` con `{ id, icon, name: Record<Locale,string>, description: Record<Locale,string> }`
  - `t(locale: Locale, key: UiKey, vars?: Record<string, string | number>): string`
  - `type UiKey = keyof typeof es`
  - `otherLocale(l: Locale): Locale`, `homeHref(l: Locale): string`, `toolHref(l: Locale, meta: ToolMeta): string`, `isLocale(x: string): x is Locale`

- [ ] **Step 1: `src/tools/types.ts`**

```ts
import type { IconName } from './icon-names';

export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export type CategoryId = 'gen' | 'enc' | 'data' | 'ids' | 'conv' | 'rand' | 'ref';
export type Localized<T> = Record<Locale, T>;

export interface ToolMeta {
  id: string;
  category: CategoryId;
  icon: IconName;
  slug: Localized<string>;
  name: Localized<string>;
  title: Localized<string>;
  description: Localized<string>;
  keywords: Localized<string[]>;
  tabs?: Localized<string[]>;
  faq?: Localized<{ q: string; a: string }[]>;
  rememberInput?: boolean;
}

export interface Category {
  id: CategoryId;
  icon: IconName;
  name: Localized<string>;
  description: Localized<string>;
}
```

- [ ] **Step 2: `src/tools/icon-names.ts` y `src/tools/icons.ts`**

Los nombres viven aparte para que los tests de Vitest (entorno `node`, sin compilador de Svelte) puedan validarlos sin importar `@lucide/svelte`.

`src/tools/icon-names.ts`:
```ts
export const ICON_NAMES = [
  'arrow-left-right',
  'book-open',
  'braces',
  'check',
  'chevron-down',
  'chevron-right',
  'code',
  'copy',
  'dices',
  'fingerprint',
  'house',
  'id-card',
  'keyboard',
  'menu',
  'moon',
  'panel-left-close',
  'panel-left-open',
  'refresh-cw',
  'search',
  'sparkles',
  'star',
  'sun',
  'terminal',
  'x',
] as const;

export type IconName = (typeof ICON_NAMES)[number];
```

`src/tools/icons.ts`:
```ts
import {
  ArrowLeftRight,
  BookOpen,
  Braces,
  Check,
  ChevronDown,
  ChevronRight,
  Code,
  Copy,
  Dices,
  Fingerprint,
  House,
  IdCard,
  Keyboard,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Sun,
  SquareTerminal,
  X,
} from '@lucide/svelte';
import type { IconName } from './icon-names';

export type { IconName } from './icon-names';

// Record<IconName, …> makes `pnpm check` fail if a name has no component or vice versa.
export const icons: Record<IconName, typeof House> = {
  'arrow-left-right': ArrowLeftRight,
  'book-open': BookOpen,
  braces: Braces,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  code: Code,
  copy: Copy,
  dices: Dices,
  fingerprint: Fingerprint,
  house: House,
  'id-card': IdCard,
  keyboard: Keyboard,
  menu: Menu,
  moon: Moon,
  'panel-left-close': PanelLeftClose,
  'panel-left-open': PanelLeftOpen,
  'refresh-cw': RefreshCw,
  search: Search,
  sparkles: Sparkles,
  star: Star,
  sun: Sun,
  terminal: SquareTerminal,
  x: X,
};
```

Si algún export no existe en `@lucide/svelte@1.48` (`pnpm check` lo dirá), busca el equivalente con `ls node_modules/@lucide/svelte/dist/icons | grep -i <nombre>` y cambia solo el import, manteniendo la clave.

- [ ] **Step 3: `src/tools/categories.ts`**

```ts
import type { Category } from './types';

export const categories: Category[] = [
  {
    id: 'gen',
    icon: 'sparkles',
    name: { es: 'Generadores', en: 'Generators' },
    description: {
      es: 'Identificadores, textos de relleno y datos de prueba.',
      en: 'Identifiers, placeholder text and test data.',
    },
  },
  {
    id: 'enc',
    icon: 'code',
    name: { es: 'Codificación', en: 'Encoding' },
    description: {
      es: 'Codificar, decodificar e inspeccionar tokens y hashes.',
      en: 'Encode, decode and inspect tokens and hashes.',
    },
  },
  {
    id: 'data',
    icon: 'braces',
    name: { es: 'Texto y datos', en: 'Text & data' },
    description: {
      es: 'Formatear, comparar y transformar texto y JSON.',
      en: 'Format, compare and transform text and JSON.',
    },
  },
  {
    id: 'ids',
    icon: 'id-card',
    name: { es: 'Identificadores', en: 'Identifiers' },
    description: {
      es: 'Documentos y códigos oficiales. De momento, formatos de España.',
      en: 'Official documents and codes. Spanish formats for now.',
    },
  },
  {
    id: 'conv',
    icon: 'arrow-left-right',
    name: { es: 'Conversores', en: 'Converters' },
    description: {
      es: 'Fechas, colores, bases numéricas y unidades.',
      en: 'Dates, colors, number bases and units.',
    },
  },
  {
    id: 'rand',
    icon: 'dices',
    name: { es: 'Azar', en: 'Random' },
    description: { es: 'Ruletas, sorteos y dados.', en: 'Wheels, draws and dice.' },
  },
  {
    id: 'ref',
    icon: 'book-open',
    name: { es: 'Referencia', en: 'Reference' },
    description: {
      es: 'Chuletas y explicaciones rápidas.',
      en: 'Cheat sheets and quick explanations.',
    },
  },
];
```

- [ ] **Step 4: Test de i18n (falla)**

`src/i18n/i18n.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { en } from './en';
import { es } from './es';
import { homeHref, isLocale, otherLocale, t, toolHref } from './index';
import type { ToolMeta } from '../tools/types';

describe('i18n', () => {
  it('has the same keys in both dictionaries', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
  });

  it('has no empty strings', () => {
    for (const dict of [es, en]) {
      for (const [k, v] of Object.entries(dict)) expect(v, k).not.toBe('');
    }
  });

  it('interpolates variables', () => {
    expect(t('es', 'home.count', { n: 2 })).toContain('2');
  });

  it('builds routes', () => {
    const meta = { slug: { es: 'formateador-json', en: 'json-formatter' } } as ToolMeta;
    expect(toolHref('es', meta)).toBe('/es/formateador-json');
    expect(toolHref('en', meta)).toBe('/en/json-formatter');
    expect(homeHref('en')).toBe('/en');
    expect(otherLocale('es')).toBe('en');
    expect(isLocale('es')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });
});
```

- [ ] **Step 5: Verificar que falla**

Run: `pnpm test src/i18n`
Expected: FAIL, imports sin resolver.

- [ ] **Step 6: Diccionarios**

`src/i18n/es.ts`:
```ts
export const es = {
  'site.name': 'devtools',
  'site.description':
    'Herramientas para desarrolladores que funcionan en tu navegador: JSON, UUID, JWT, Base64, hashes y más.',
  'nav.home': 'Inicio',
  'nav.tools': 'Herramientas',
  'nav.favorites': 'Favoritos',
  'nav.collapse': 'Plegar barra lateral',
  'nav.expand': 'Desplegar barra lateral',
  'nav.openMenu': 'Abrir menú',
  'nav.closeMenu': 'Cerrar menú',
  'nav.breadcrumb': 'Ruta',
  'nav.skip': 'Saltar al contenido',
  'theme.label': 'Tema',
  'theme.terminal': 'Terminal',
  'theme.dark': 'Oscuro',
  'theme.light': 'Claro',
  'lang.label': 'Idioma',
  'lang.switch': 'Read in English',
  'home.title': '¿Qué necesitas hoy?',
  'home.count': '{n} herramientas que se ejecutan en tu navegador. Lo que pegas aquí no sale de tu equipo.',
  'home.search': 'Buscar herramienta',
  'home.searchPlaceholder': 'Formatear JSON, generar UUIDs, decodificar un JWT…',
  'home.recent': 'Usadas hace poco',
  'home.starter': 'Empieza por aquí',
  'home.all': 'Todas las herramientas',
  'search.placeholder': 'Busca una herramienta',
  'search.empty': 'Ninguna herramienta coincide con «{q}». Prueba con otra palabra.',
  'search.hint': '↑ ↓ para moverte, Enter para abrir, Esc para cerrar',
  'search.favorites': 'Favoritos',
  'search.recent': 'Recientes',
  'search.results': 'Resultados',
  'tool.favoriteAdd': 'Añadir a favoritos',
  'tool.favoriteRemove': 'Quitar de favoritos',
  'tool.remember': 'Recordar lo que escribo',
  'tool.howItWorks': 'Cómo funciona',
  'tool.faq': 'Preguntas frecuentes',
  'ui.copy': 'Copiar',
  'ui.copied': 'Copiado',
  'ui.copiedValue': 'Copiado: {v}',
  'ui.clear': 'Borrar',
  'ui.generate': 'Generar',
  'ui.download': 'Descargar',
  'ui.dropFile': 'Suelta un archivo o haz clic para elegirlo',
  'led.ok': 'Válido',
  'led.bad': 'No válido',
  'led.idle': 'Esperando datos',
  'shortcuts.title': 'Atajos de teclado',
  'shortcuts.search': 'Buscar herramienta',
  'shortcuts.copy': 'Copiar el resultado principal',
  'shortcuts.tabs': 'Cambiar de pestaña',
  'shortcuts.help': 'Mostrar esta ayuda',
  'shortcuts.close': 'Cerrar',
  'boot.loaded': '{n} herramientas cargadas',
  'boot.skip': 'Pulsa cualquier tecla para entrar',
  'notFound.title': 'Esta página no existe',
  'notFound.body': 'Puede que la herramienta haya cambiado de dirección. Búscala desde el inicio.',
  'notFound.back': 'Ir al inicio',
};
```

`src/i18n/en.ts`:
```ts
import type { es } from './es';

export const en: Record<keyof typeof es, string> = {
  'site.name': 'devtools',
  'site.description':
    'Developer tools that run in your browser: JSON, UUID, JWT, Base64, hashes and more.',
  'nav.home': 'Home',
  'nav.tools': 'Tools',
  'nav.favorites': 'Favorites',
  'nav.collapse': 'Collapse sidebar',
  'nav.expand': 'Expand sidebar',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',
  'nav.breadcrumb': 'Breadcrumb',
  'nav.skip': 'Skip to content',
  'theme.label': 'Theme',
  'theme.terminal': 'Terminal',
  'theme.dark': 'Dark',
  'theme.light': 'Light',
  'lang.label': 'Language',
  'lang.switch': 'Leer en español',
  'home.title': 'What do you need today?',
  'home.count': '{n} tools that run in your browser. Nothing you paste here leaves your device.',
  'home.search': 'Search tools',
  'home.searchPlaceholder': 'Format JSON, generate UUIDs, decode a JWT…',
  'home.recent': 'Recently used',
  'home.starter': 'Start here',
  'home.all': 'All tools',
  'search.placeholder': 'Search for a tool',
  'search.empty': 'No tool matches “{q}”. Try another word.',
  'search.hint': '↑ ↓ to move, Enter to open, Esc to close',
  'search.favorites': 'Favorites',
  'search.recent': 'Recent',
  'search.results': 'Results',
  'tool.favoriteAdd': 'Add to favorites',
  'tool.favoriteRemove': 'Remove from favorites',
  'tool.remember': 'Remember what I type',
  'tool.howItWorks': 'How it works',
  'tool.faq': 'FAQ',
  'ui.copy': 'Copy',
  'ui.copied': 'Copied',
  'ui.copiedValue': 'Copied: {v}',
  'ui.clear': 'Clear',
  'ui.generate': 'Generate',
  'ui.download': 'Download',
  'ui.dropFile': 'Drop a file or click to choose one',
  'led.ok': 'Valid',
  'led.bad': 'Invalid',
  'led.idle': 'Waiting for input',
  'shortcuts.title': 'Keyboard shortcuts',
  'shortcuts.search': 'Search tools',
  'shortcuts.copy': 'Copy the main result',
  'shortcuts.tabs': 'Switch tab',
  'shortcuts.help': 'Show this help',
  'shortcuts.close': 'Close',
  'boot.loaded': '{n} tools loaded',
  'boot.skip': 'Press any key to enter',
  'notFound.title': 'This page does not exist',
  'notFound.body': 'The tool may have moved. Find it from the home page.',
  'notFound.back': 'Go home',
};
```

`src/i18n/index.ts`:
```ts
import { en } from './en';
import { es } from './es';
import { LOCALES, type Locale, type ToolMeta } from '../tools/types';

export type UiKey = keyof typeof es;

const dicts: Record<Locale, Record<UiKey, string>> = { es, en };

export function t(locale: Locale, key: UiKey, vars?: Record<string, string | number>): string {
  const s = dicts[locale][key];
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m));
}

export function isLocale(x: string): x is Locale {
  return (LOCALES as readonly string[]).includes(x);
}

export function otherLocale(l: Locale): Locale {
  return l === 'es' ? 'en' : 'es';
}

export function homeHref(l: Locale): string {
  return `/${l}`;
}

export function toolHref(l: Locale, meta: Pick<ToolMeta, 'slug'>): string {
  return `/${l}/${meta.slug[l]}`;
}
```

- [ ] **Step 7: Verificar**

Run: `pnpm test && pnpm check`
Expected: PASS y `0 errors`.

- [ ] **Step 8: Commit**

```bash
git add src/tools src/i18n
git commit -m "feat: tipos de herramienta, categorías, iconos e i18n ES/EN

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Registro de herramientas y test de validación

**Files:**
- Create: `src/tools/registry.ts`, `src/tools/registry.test.ts`

**Interfaces:**
- Consumes: `ToolMeta`, `categories`, `ICON_NAMES`, `LOCALES`.
- Produces:
  - `tools: ToolMeta[]` (orden de aparición en catálogo y sidebar)
  - `toolById(id: string): ToolMeta | undefined`
  - `toolBySlug(locale: Locale, slug: string): ToolMeta | undefined`
  - `toolsInCategory(id: CategoryId): ToolMeta[]`
  - `visibleCategories(): Category[]` (solo las que tienen herramientas)

- [ ] **Step 1: Test del registro (falla)**

`src/tools/registry.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { categories } from './categories';
import { ICON_NAMES } from './icon-names';
import { toolById, toolBySlug, tools, toolsInCategory, visibleCategories } from './registry';
import { LOCALES } from './types';

const contents = import.meta.glob('./*/content.*.md', { query: '?raw', eager: true });

describe('registry', () => {
  it('has unique ids', () => {
    const ids = tools.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(LOCALES)('has unique, url-safe slugs in %s', (l) => {
    const slugs = tools.map((t) => t.slug[l]);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('gives every tool complete metadata in both languages', () => {
    for (const tool of tools) {
      expect(categories.map((c) => c.id)).toContain(tool.category);
      expect(ICON_NAMES).toContain(tool.icon);
      for (const l of LOCALES) {
        expect(tool.name[l], `${tool.id}.name.${l}`).toBeTruthy();
        expect(tool.title[l].length, `${tool.id}.title.${l}`).toBeLessThanOrEqual(65);
        expect(tool.description[l].length, `${tool.id}.description.${l}`).toBeGreaterThan(50);
        expect(tool.description[l].length, `${tool.id}.description.${l}`).toBeLessThanOrEqual(160);
        expect(tool.keywords[l].length, `${tool.id}.keywords.${l}`).toBeGreaterThan(0);
        if (tool.tabs) expect(tool.tabs[l].length).toBe(tool.tabs.es.length);
      }
    }
  });

  it('has SEO content in both languages for every tool', () => {
    for (const tool of tools) {
      for (const l of LOCALES) {
        expect(Object.keys(contents), `${tool.id} content.${l}.md`).toContain(
          `./${tool.id}/content.${l}.md`,
        );
      }
    }
  });

  it('looks tools up by id and slug', () => {
    for (const tool of tools) {
      expect(toolById(tool.id)).toBe(tool);
      expect(toolBySlug('es', tool.slug.es)).toBe(tool);
      expect(toolBySlug('en', tool.slug.en)).toBe(tool);
    }
    expect(toolById('nope')).toBeUndefined();
  });

  it('only shows categories that have tools', () => {
    for (const c of visibleCategories()) expect(toolsInCategory(c.id).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `pnpm test src/tools/registry.test.ts`
Expected: FAIL, "Failed to resolve import ./registry".

- [ ] **Step 3: Implementar `src/tools/registry.ts`**

Empieza vacío: las Tasks 13 y 14 añaden `json` y `uuid`.

```ts
import { categories } from './categories';
import type { Category, CategoryId, Locale, ToolMeta } from './types';

export const tools: ToolMeta[] = [];

export function toolById(id: string): ToolMeta | undefined {
  return tools.find((t) => t.id === id);
}

export function toolBySlug(locale: Locale, slug: string): ToolMeta | undefined {
  return tools.find((t) => t.slug[locale] === slug);
}

export function toolsInCategory(id: CategoryId): ToolMeta[] {
  return tools.filter((t) => t.category === id);
}

export function visibleCategories(): Category[] {
  return categories.filter((c) => toolsInCategory(c.id).length > 0);
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `pnpm test`
Expected: PASS (con la lista vacía los `for` no iteran; los tests cobran sentido en las Tasks 13 y 14).

- [ ] **Step 5: Commit**

```bash
git add src/tools/registry.ts src/tools/registry.test.ts
git commit -m "feat: registro de herramientas con validación de metadatos y contenido

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Tokens de los 3 temas y CSS global

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`

**Interfaces:**
- Produces: variables CSS de la tabla de la §5 del spec y clases globales que usan los componentes: `.control` (inputs), `.control.mono`, `.display`, `.display-head`, `.display-value`, `.display-rows`, `.display-row`, `.display-code`, `.display-kv`, `.panel`, `.stack`, `.row`, `.visually-hidden`, `.prose`, `.skip-link`. Los estilos de sidebar, cabecera móvil y pantalla de arranque se añaden en las Tasks 9 y 10.

- [ ] **Step 1: `src/styles/tokens.css`**

```css
:root {
  --font-mono: 'IBM Plex Mono', ui-monospace, 'Cascadia Code', monospace;
  --font-display: 'Unbounded Variable', 'Unbounded', system-ui, sans-serif;
  --font-body: 'Instrument Sans Variable', 'Instrument Sans', system-ui, sans-serif;
  --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --sidebar-w: 264px;
  --focus-ring: 0 0 0 4px color-mix(in srgb, var(--accent) 15%, transparent);
  --inset: inset 0 1px 3px rgb(0 0 0 / 0.45);
  --disp-inset: inset 0 2px 8px rgb(0 0 0 / 0.5);
}

:root,
:root[data-theme='terminal'] {
  color-scheme: dark;
  --bg: #0a0a0a;
  --surface: #0f0f0f;
  --raised: #111811;
  --well: #070907;
  --border: #1a3a1a;
  --border-strong: #1f7a1f;
  --text: #33ff33;
  --text-dim: #1fae1f;
  --accent: #33ff33;
  --on-accent: #0a0a0a;
  --accent-text: #66ff66;
  --disp: #050805;
  --disp-line: #143014;
  --disp-text: #66ff66;
  --disp-dim: #1fae1f;
  --ok: #33ff33;
  --bad: #ffcc00;
  --idle: #1a5a1a;
  --font-display: var(--font-mono);
  --font-body: var(--font-mono);
  --radius: 0;
  --radius-lg: 0;
  --radius-pill: 0;
  --glow: 0 0 4px rgb(51 255 51 / 0.45);
  --disp-glow: 0 0 6px rgb(51 255 51 / 0.5);
  --inset: none;
}

:root[data-theme='dark'] {
  color-scheme: dark;
  --bg: #161719;
  --surface: #1e1f22;
  --raised: #28292d;
  --well: #131416;
  --border: #393a3f;
  --border-strong: #4a4b51;
  --text: #edece8;
  --text-dim: #a09f9b;
  --accent: #ff5a1f;
  --on-accent: #161719;
  --accent-text: #ff7b47;
  --disp: #0e0f10;
  --disp-line: #26272b;
  --disp-text: #ffc266;
  --disp-dim: #9a8d74;
  --ok: #2bd46b;
  --bad: #ff5a1f;
  --idle: #6b6a66;
  --font-display: 'Unbounded Variable', 'Unbounded', system-ui, sans-serif;
  --font-body: 'Instrument Sans Variable', 'Instrument Sans', system-ui, sans-serif;
  --radius: 10px;
  --radius-lg: 18px;
  --radius-pill: 999px;
  --glow: none;
  --disp-glow: 0 0 12px rgb(255 194 102 / 0.25);
}

:root[data-theme='light'] {
  color-scheme: light;
  --bg: #e3e1dc;
  --surface: #eeede9;
  --raised: #f8f7f4;
  --well: #d9d7d1;
  --border: #c6c3bc;
  --border-strong: #afaca4;
  --text: #1d1e20;
  --text-dim: #55565a;
  --accent: #ff5419;
  --on-accent: #1d1e20;
  --accent-text: #b83a0a;
  --disp: #1d1e20;
  --disp-line: #303134;
  --disp-text: #ffc266;
  --disp-dim: #a89b80;
  --ok: #2bd46b;
  --bad: #ff5419;
  --idle: #6b6a66;
  --font-display: 'Unbounded Variable', 'Unbounded', system-ui, sans-serif;
  --font-body: 'Instrument Sans Variable', 'Instrument Sans', system-ui, sans-serif;
  --radius: 10px;
  --radius-lg: 18px;
  --radius-pill: 999px;
  --glow: none;
  --disp-glow: 0 0 12px rgb(255 194 102 / 0.2);
  --inset: inset 0 1px 3px rgb(0 0 0 / 0.12);
}
```

- [ ] **Step 2: `src/styles/global.css`**

```css
@import './tokens.css';

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  margin: 0;
  min-height: 100dvh;
  background: var(--bg);
  color: var(--text);
  font: 400 15px/1.55 var(--font-body);
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
}

h1,
h2,
h3 {
  margin: 0;
  font-family: var(--font-display);
  line-height: 1.15;
  text-shadow: var(--glow);
}

h1 {
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 700;
  letter-spacing: -0.03em;
}

h2 {
  font-size: 17px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

[data-theme='terminal'] h1 {
  letter-spacing: 0;
}

[data-theme='terminal'] h1::before {
  content: '> ';
}

p {
  margin: 0;
}

a {
  color: inherit;
}

::selection {
  background: var(--accent);
  color: var(--on-accent);
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

button {
  font: inherit;
  color: inherit;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.skip-link {
  position: absolute;
  left: 8px;
  top: -60px;
  z-index: 100;
  padding: 10px 14px;
  background: var(--accent);
  color: var(--on-accent);
  border-radius: var(--radius);
  font-weight: 600;
}

.skip-link:focus {
  top: 8px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px 16px;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

@media (max-width: 599px) {
  .panel {
    padding: 16px;
  }
}

/* Controls */

.control {
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  background: var(--raised);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius);
  color: var(--text);
  font: 400 16px/1.4 var(--font-body);
  transition:
    border-color 160ms,
    box-shadow 160ms;
}

.control.mono {
  font-family: var(--font-mono);
  font-size: 15px;
}

.control::placeholder {
  color: var(--text-dim);
  opacity: 0.8;
}

.control:focus-visible {
  outline: none;
  border-color: var(--accent);
  box-shadow: var(--focus-ring);
}

.control[aria-invalid='true'] {
  border-color: var(--bad);
}

/* Display: the recessed screen where results live */

.display {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px;
  background: var(--disp);
  border: 1px solid var(--disp-line);
  border-radius: var(--radius);
  box-shadow: var(--disp-inset);
  color: var(--disp-text);
  min-width: 0;
}

.display-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--disp-dim);
}

.display-value {
  font: 500 clamp(22px, 3.2vw, 34px) / 1.2 var(--font-mono);
  letter-spacing: 0.06em;
  text-shadow: var(--disp-glow);
  overflow-wrap: anywhere;
}

.display-note {
  font-size: 13.5px;
  color: var(--disp-dim);
}

.display-rows {
  display: flex;
  flex-direction: column;
  margin: -6px -8px;
}

.display-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  padding: 4px 4px 4px 8px;
  border-bottom: 1px solid var(--disp-line);
  font: 500 15px/1.4 var(--font-mono);
  letter-spacing: 0.04em;
  overflow-wrap: anywhere;
}

.display-row:last-child {
  border-bottom: 0;
}

.display-code {
  margin: 0;
  max-height: 60vh;
  overflow: auto;
  font: 400 14px/1.55 var(--font-mono);
  white-space: pre;
  tab-size: 2;
}

.display-kv {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 6px 20px;
  margin: 0;
  font-size: 14px;
}

.display-kv dt {
  color: var(--disp-dim);
}

.display-kv dd {
  margin: 0;
  font-family: var(--font-mono);
  overflow-wrap: anywhere;
}

/* Rendered markdown (SEO content under each tool) */

.prose {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 68ch;
  color: var(--text-dim);
  font-size: 15px;
  line-height: 1.65;
}

.prose h2,
.prose h3 {
  color: var(--text);
  margin-top: 12px;
}

.prose code {
  font-family: var(--font-mono);
  font-size: 0.92em;
  color: var(--text);
}

.prose ul,
.prose ol {
  margin: 0;
  padding-left: 1.2em;
}

@keyframes dt-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@keyframes dt-out {
  to {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 3: Verificar**

Run: `pnpm exec prettier --check src/styles && pnpm build`
Expected: sin errores (los CSS aún no se importan, así que el build no cambia).

- [ ] **Step 4: Commit**

```bash
git add src/styles
git commit -m "feat: tokens de los temas terminal, grafito y aluminio y CSS global

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Búsqueda difusa (`lib/search.ts`)

**Files:**
- Create: `src/lib/search.ts`, `src/lib/search.test.ts`

**Interfaces:**
- Consumes: `ToolMeta`, `LOCALES`.
- Produces:
  - `normalize(s: string): string` (minúsculas, sin tildes, sin espacios en los extremos)
  - `interface SearchDoc { id: string; primary: string[]; secondary: string[] }`
  - `buildDoc(meta: ToolMeta): SearchDoc` (primary = nombres y keywords de ambos idiomas; secondary = descripciones)
  - `scoreField(q: string, text: string): number` (0 = sin coincidencia)
  - `search(docs: SearchDoc[], query: string, limit?: number): string[]` (ids ordenados por relevancia)

- [ ] **Step 1: Test (falla)**

`src/lib/search.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { normalize, scoreField, search, type SearchDoc } from './search';

const docs: SearchDoc[] = [
  { id: 'json', primary: ['json', 'formateador json', 'json formatter', 'prettify'], secondary: ['formatea y valida json'] },
  { id: 'jwt', primary: ['jwt', 'decodificador jwt', 'jwt decoder', 'token'], secondary: ['lee cabecera y payload de un json web token'] },
  { id: 'dni', primary: ['dni y nie', 'dni nie validator', 'letra dni'], secondary: ['comprueba documentos de identidad'] },
  { id: 'enc', primary: ['codificacion', 'encoding'], secondary: [] },
];

describe('normalize', () => {
  it('lowercases and strips accents', () => {
    expect(normalize('  Codificación ÚNICA ')).toBe('codificacion unica');
  });
});

describe('scoreField', () => {
  it('prefers prefix over inner substring', () => {
    expect(scoreField('json', 'json formatter')).toBeGreaterThan(scoreField('json', 'formateador json'));
  });

  it('matches a single adjacent transposition', () => {
    expect(scoreField('jsno', 'json')).toBeGreaterThan(0);
  });

  it('matches compact subsequences but not scattered letters', () => {
    expect(scoreField('jfmt', 'json formatter')).toBe(0);
    expect(scoreField('frmt', 'formatter')).toBeGreaterThan(0);
  });

  it('returns 0 for no match or empty query', () => {
    expect(scoreField('xyz', 'json')).toBe(0);
    expect(scoreField('', 'json')).toBe(0);
  });
});

describe('search', () => {
  it('ranks the exact name first', () => {
    expect(search(docs, 'json')[0]).toBe('json');
  });

  it('finds a tool with a typo', () => {
    expect(search(docs, 'jsno')).toContain('json');
  });

  it('requires every word to match somewhere', () => {
    expect(search(docs, 'letra dni')).toEqual(['dni']);
  });

  it('is accent-insensitive in both directions', () => {
    expect(search(docs, 'codificación')).toEqual(['enc']);
  });

  it('ranks name matches above description-only matches', () => {
    const ids = search(docs, 'json');
    expect(ids.indexOf('json')).toBeLessThan(ids.indexOf('jwt'));
  });

  it('returns nothing for an empty query', () => {
    expect(search(docs, '   ')).toEqual([]);
  });

  it('respects the limit', () => {
    expect(search(docs, 'j', 1)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `pnpm test src/lib/search.test.ts`
Expected: FAIL, import sin resolver.

- [ ] **Step 3: Implementar `src/lib/search.ts`**

```ts
import { LOCALES, type ToolMeta } from '../tools/types';

export interface SearchDoc {
  id: string;
  primary: string[];
  secondary: string[];
}

export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function buildDoc(meta: ToolMeta): SearchDoc {
  return {
    id: meta.id,
    primary: LOCALES.flatMap((l) => [meta.name[l], ...meta.keywords[l]]).map(normalize),
    secondary: LOCALES.map((l) => normalize(meta.description[l])),
  };
}

const WORD_BOUNDARY = /[\s\-_/.()]/;

function subsequenceScore(q: string, text: string): number {
  let from = 0;
  let first = -1;
  let score = 0;
  let streak = 0;
  for (const ch of q) {
    const found = text.indexOf(ch, from);
    if (found === -1) return 0;
    if (first === -1) first = found;
    streak = found === from ? streak + 1 : 0;
    score += 1 + streak;
    from = found + 1;
  }
  // Letters spread across the whole string are noise, not a match.
  if (from - first > q.length * 2) return 0;
  return Math.min(score * 4, 60);
}

export function scoreField(q: string, text: string): number {
  if (!q || !text) return 0;
  const idx = text.indexOf(q);
  if (idx !== -1) {
    const wordStart = idx === 0 || WORD_BOUNDARY.test(text[idx - 1]);
    return 100 + (idx === 0 ? 50 : 0) + (wordStart ? 25 : 0) - Math.min(idx, 20);
  }
  if (q.length >= 3) {
    for (let i = 0; i < q.length - 1; i++) {
      const swapped = q.slice(0, i) + q[i + 1] + q[i] + q.slice(i + 2);
      if (text.includes(swapped)) return 70;
    }
  }
  return q.length >= 2 ? subsequenceScore(q, text) : 0;
}

function tokenScore(token: string, doc: SearchDoc): number {
  let best = 0;
  for (const f of doc.primary) best = Math.max(best, scoreField(token, f) * 2);
  for (const f of doc.secondary) if (f.includes(token)) best = Math.max(best, 50);
  return best;
}

export function search(docs: SearchDoc[], query: string, limit = 20): string[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const scored: { id: string; score: number; order: number }[] = [];
  docs.forEach((doc, order) => {
    let total = 0;
    for (const token of tokens) {
      const s = tokenScore(token, doc);
      if (s === 0) return;
      total += s;
    }
    scored.push({ id: doc.id, score: total, order });
  });
  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  return scored.slice(0, limit).map((s) => s.id);
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `pnpm test src/lib/search.test.ts`
Expected: PASS (12 tests). Si `jfmt`/`frmt` falla por el umbral de dispersión, ajusta solo el factor `q.length * 2` y deja los tests como están.

- [ ] **Step 5: Commit**

```bash
git add src/lib/search.ts src/lib/search.test.ts
git commit -m "feat: búsqueda difusa bilingüe, sin tildes y tolerante a erratas

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Kit de UI, parte 1: controles

**Files:**
- Create: `src/ui/Icon.svelte`, `src/ui/Button.svelte`, `src/ui/Segmented.svelte`, `src/ui/Field.svelte`, `src/ui/TextArea.svelte`, `src/ui/NumberInput.svelte`, `src/ui/Select.svelte`, `src/ui/Toggle.svelte`, `src/ui/persisted.svelte.ts`

**Interfaces:**
- Consumes: `icons`, `IconName` (Task 3). `getRemember`, `setRemember`, `loadInput`, `saveInput` (Task 2). Clases `.control` y `.mono` (Task 5).
- Produces (props exactas):
  - `Icon { name: IconName; size?: number = 18; class?: string }`
  - `Button { variant?: 'primary'|'secondary'|'ghost'|'icon' = 'secondary'; icon?: IconName; label?: string (obligatorio si variant='icon'); ...HTMLButtonAttributes; children?: Snippet }`
  - `Segmented<T extends string> { options: { value: T; label: string }[]; value: T ($bindable); label: string; main?: boolean (añade data-tabs-main); onchange?: (v: T) => void }`
  - `Field { id: string; label: string; help?: string; error?: string; children: Snippet<[{ describedby: string | undefined }]> }`
  - `TextArea { id: string; value: string ($bindable); rows?: number = 8; mono?: boolean = true; placeholder?: string; describedby?: string; invalid?: boolean; spellcheck?: boolean = false; element?: HTMLTextAreaElement ($bindable) }`
  - `NumberInput { id: string; value: number ($bindable); min: number; max: number; step?: number = 1; describedby?: string }`
  - `Select<T extends string> { id: string; value: T ($bindable); options: { value: T; label: string }[]; describedby?: string }`
  - `Toggle { checked: boolean ($bindable); label: string; onchange?: (v: boolean) => void }`
  - `persistedInput(toolId: string, initial: string, rememberDefault?: boolean): { value: string; remember: boolean }` (objeto con getters/setters reactivos; se llama durante la inicialización del componente)

- [ ] **Step 1: `src/ui/Icon.svelte`**

```svelte
<script lang="ts">
  import type { IconName } from '../tools/icon-names';
  import { icons } from '../tools/icons';

  let { name, size = 18, class: cls = '' }: { name: IconName; size?: number; class?: string } =
    $props();
  const Cmp = $derived(icons[name]);
</script>

<Cmp {size} strokeWidth={1.8} class={cls} aria-hidden="true" />
```

- [ ] **Step 2: `src/ui/Button.svelte`**

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { IconName } from '../tools/icon-names';
  import Icon from './Icon.svelte';

  type Props = HTMLButtonAttributes & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
    icon?: IconName;
    label?: string;
    children?: Snippet;
  };

  let { variant = 'secondary', icon, label, children, type = 'button', ...rest }: Props = $props();
</script>

<button
  {type}
  class="btn {variant}"
  aria-label={variant === 'icon' ? label : undefined}
  title={variant === 'icon' ? label : undefined}
  {...rest}
>
  {#if icon}<Icon name={icon} size={16} />{/if}
  {#if children}{@render children()}{/if}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 18px;
    border: 1px solid transparent;
    border-radius: var(--radius-pill);
    font: 600 14px/1 var(--font-body);
    cursor: pointer;
    white-space: nowrap;
    transition:
      transform 120ms ease-out,
      background-color 200ms,
      color 200ms,
      border-color 200ms;
  }
  .btn:active:not(:disabled) {
    transform: scale(0.97);
  }
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .primary {
    background: var(--accent);
    color: var(--on-accent);
    box-shadow: inset 0 -2px 0 rgb(0 0 0 / 0.18);
  }
  .secondary {
    background: var(--raised);
    color: var(--text);
    border-color: var(--border-strong);
  }
  .ghost {
    background: transparent;
    color: var(--text-dim);
  }
  .ghost:hover,
  .icon:hover {
    color: var(--text);
  }
  .icon {
    width: 44px;
    padding: 0;
    border-radius: var(--radius);
    background: var(--raised);
    color: var(--text-dim);
    border-color: var(--border);
  }
</style>
```

- [ ] **Step 3: `src/ui/Segmented.svelte`**

```svelte
<script lang="ts" generics="T extends string">
  let {
    options,
    value = $bindable(),
    label,
    main = false,
    onchange,
  }: {
    options: { value: T; label: string }[];
    value: T;
    label: string;
    main?: boolean;
    onchange?: (v: T) => void;
  } = $props();

  let buttons: HTMLButtonElement[] = $state([]);

  function select(v: T) {
    if (v === value) return;
    value = v;
    onchange?.(v);
  }

  function onkeydown(e: KeyboardEvent, i: number) {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + options.length) % options.length;
    select(options[n].value);
    buttons[n]?.focus();
  }
</script>

<div class="seg" role="radiogroup" aria-label={label} data-tabs-main={main ? '' : undefined}>
  {#each options as o, i (o.value)}
    <button
      bind:this={buttons[i]}
      type="button"
      role="radio"
      aria-checked={o.value === value}
      tabindex={o.value === value ? 0 : -1}
      onclick={() => select(o.value)}
      onkeydown={(e) => onkeydown(e, i)}>{o.label}</button
    >
  {/each}
</div>

<style>
  .seg {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px;
    align-self: flex-start;
    background: var(--well);
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    box-shadow: var(--inset);
  }
  button {
    min-height: 36px;
    padding: 0 16px;
    border: 0;
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--text-dim);
    font: 600 14px/1 var(--font-body);
    cursor: pointer;
    transition:
      background-color 200ms,
      color 200ms;
  }
  button[aria-checked='true'] {
    background: var(--raised);
    color: var(--text);
    box-shadow:
      0 1px 2px rgb(0 0 0 / 0.25),
      inset 0 0 0 1px var(--border);
  }
  [data-theme='terminal'] button[aria-checked='true'] {
    background: var(--accent);
    color: var(--on-accent);
  }
</style>
```

- [ ] **Step 4: `src/ui/Field.svelte`**

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    id,
    label,
    help,
    error,
    children,
  }: {
    id: string;
    label: string;
    help?: string;
    error?: string;
    children: Snippet<[{ describedby: string | undefined }]>;
  } = $props();

  const describedby = $derived(
    [help ? `${id}-help` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined,
  );
</script>

<div class="field">
  <label for={id}>{label}</label>
  {@render children({ describedby })}
  {#if help}<p class="help" id="{id}-help">{help}</p>{/if}
  {#if error}<p class="error" id="{id}-error">{error}</p>{/if}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  label {
    font-size: 13px;
    font-weight: 600;
  }
  .help {
    font-size: 13px;
    color: var(--text-dim);
  }
  .error {
    font-size: 13px;
    font-weight: 600;
    color: var(--bad);
  }
</style>
```

- [ ] **Step 5: `src/ui/TextArea.svelte`, `NumberInput.svelte`, `Select.svelte`, `Toggle.svelte`**

`src/ui/TextArea.svelte`:
```svelte
<script lang="ts">
  let {
    id,
    value = $bindable(),
    rows = 8,
    mono = true,
    placeholder,
    describedby,
    invalid = false,
    spellcheck = false,
    element = $bindable(),
  }: {
    id: string;
    value: string;
    rows?: number;
    mono?: boolean;
    placeholder?: string;
    describedby?: string;
    invalid?: boolean;
    spellcheck?: boolean;
    element?: HTMLTextAreaElement;
  } = $props();
</script>

<textarea
  bind:this={element}
  {id}
  bind:value
  {rows}
  {placeholder}
  {spellcheck}
  autocomplete="off"
  autocapitalize="off"
  class="control"
  class:mono
  aria-describedby={describedby}
  aria-invalid={invalid}
></textarea>

<style>
  textarea {
    resize: vertical;
    min-height: 120px;
    max-height: 70vh;
    field-sizing: content;
  }
</style>
```

`src/ui/NumberInput.svelte`:
```svelte
<script lang="ts">
  let {
    id,
    value = $bindable(),
    min,
    max,
    step = 1,
    describedby,
  }: { id: string; value: number; min: number; max: number; step?: number; describedby?: string } =
    $props();

  function clamp() {
    const n = Number.isFinite(value) ? Math.round(value / step) * step : min;
    value = Math.min(max, Math.max(min, n));
  }
</script>

<input
  {id}
  type="number"
  inputmode="numeric"
  bind:value
  {min}
  {max}
  {step}
  onblur={clamp}
  class="control mono"
  aria-describedby={describedby}
/>

<style>
  input {
    width: 112px;
  }
</style>
```

`src/ui/Select.svelte`:
```svelte
<script lang="ts" generics="T extends string">
  let {
    id,
    value = $bindable(),
    options,
    describedby,
  }: { id: string; value: T; options: { value: T; label: string }[]; describedby?: string } =
    $props();
</script>

<select {id} bind:value class="control" aria-describedby={describedby}>
  {#each options as o (o.value)}
    <option value={o.value}>{o.label}</option>
  {/each}
</select>

<style>
  select {
    width: auto;
    min-width: 160px;
    cursor: pointer;
  }
</style>
```

`src/ui/Toggle.svelte`:
```svelte
<script lang="ts">
  let {
    checked = $bindable(),
    label,
    onchange,
  }: { checked: boolean; label: string; onchange?: (v: boolean) => void } = $props();
</script>

<label class="toggle">
  <input type="checkbox" role="switch" bind:checked onchange={() => onchange?.(checked)} />
  <span class="track" aria-hidden="true"><span class="knob"></span></span>
  <span>{label}</span>
</label>

<style>
  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    font-size: 14px;
    cursor: pointer;
  }
  input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }
  .track {
    position: relative;
    width: 40px;
    height: 24px;
    flex-shrink: 0;
    background: var(--well);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-pill);
    box-shadow: var(--inset);
    transition: background-color 200ms;
  }
  .knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    background: var(--text-dim);
    border-radius: var(--radius-pill);
    transition:
      transform 200ms var(--ease),
      background-color 200ms;
  }
  input:checked + .track {
    background: var(--accent);
    border-color: var(--accent);
  }
  input:checked + .track .knob {
    transform: translateX(16px);
    background: var(--on-accent);
  }
  input:focus-visible + .track {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
</style>
```

- [ ] **Step 6: `src/ui/persisted.svelte.ts`**

El valor guardado se carga en `onMount`, no al crear el estado, para que el HTML del servidor y la primera pintura del cliente coincidan.

```ts
import { onMount } from 'svelte';
import { getRemember, loadInput, saveInput, setRemember } from '../lib/prefs';

export function persistedInput(toolId: string, initial: string, rememberDefault = true) {
  let value = $state(initial);
  let remember = $state(rememberDefault);
  let ready = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  onMount(() => {
    remember = getRemember(toolId, rememberDefault);
    if (remember) {
      const saved = loadInput(toolId);
      if (saved !== null) value = saved;
    }
    ready = true;
    return () => clearTimeout(timer);
  });

  $effect(() => {
    const v = value;
    if (!ready || !remember) return;
    clearTimeout(timer);
    timer = setTimeout(() => saveInput(toolId, v), 300);
  });

  return {
    get value() {
      return value;
    },
    set value(v: string) {
      value = v;
    },
    get remember() {
      return remember;
    },
    set remember(r: boolean) {
      remember = r;
      setRemember(toolId, r);
      if (r) saveInput(toolId, value);
    },
  };
}
```

- [ ] **Step 7: Verificar**

Run: `pnpm check && pnpm lint`
Expected: `0 errors` y lint limpio. Estos componentes se prueban visualmente con las herramientas (Tasks 14 y 15) y en e2e (Task 17).

- [ ] **Step 8: Commit**

```bash
git add src/ui
git commit -m "feat: kit de UI (botón, selector segmentado, campos, toggle, input recordado)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Kit de UI, parte 2: pantalla, LED, copiar y avisos

**Files:**
- Create: `src/lib/clipboard.ts`, `src/lib/toast.ts`, `src/lib/toast.test.ts`, `src/ui/Display.svelte`, `src/ui/Led.svelte`, `src/ui/CopyButton.svelte`, `src/ui/FileDrop.svelte`, `src/islands/Toaster.svelte`

**Interfaces:**
- Consumes: `t`, `Locale`, `Icon`, `Button`.
- Produces:
  - `copyText(text: string): Promise<boolean>`
  - `TOAST_EVENT = 'devtools:toast'`, `toast(message: string, kind?: 'ok' | 'bad'): void`, `truncate(s: string, max?: number = 40): string`
  - `Display { label?: string; live?: boolean = false; head?: Snippet; children: Snippet }` (`live` añade `role="status" aria-live="polite"`)
  - `Led { state: 'ok' | 'bad' | 'idle'; label: string }`
  - `CopyButton { value: string | (() => string); locale: Locale; main?: boolean (añade data-copy-main); compact?: boolean; label?: string }`
  - `FileDrop { locale: Locale; accept?: string; onfile: (file: File) => void }`
  - `Toaster {}` (isla global, sin props)

- [ ] **Step 1: Test de `truncate` (falla)**

`src/lib/toast.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { truncate } from './toast';

describe('truncate', () => {
  it('keeps short strings', () => {
    expect(truncate('abc', 5)).toBe('abc');
  });

  it('cuts long strings with an ellipsis within the limit', () => {
    const out = truncate('a'.repeat(50), 10);
    expect(out).toHaveLength(10);
    expect(out.endsWith('…')).toBe(true);
  });

  it('collapses newlines so multi-line values fit in one toast line', () => {
    expect(truncate('a\nb', 40)).toBe('a b');
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `pnpm test src/lib/toast.test.ts`
Expected: FAIL.

- [ ] **Step 3: `src/lib/toast.ts` y `src/lib/clipboard.ts`**

```ts
export const TOAST_EVENT = 'devtools:toast';

export interface ToastDetail {
  message: string;
  kind: 'ok' | 'bad';
}

export function truncate(s: string, max = 40): string {
  const flat = s.replace(/\s*\n\s*/g, ' ');
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

export function toast(message: string, kind: 'ok' | 'bad' = 'ok'): void {
  window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail: { message, kind } }));
}
```

```ts
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.append(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `pnpm test src/lib/toast.test.ts`
Expected: PASS.

- [ ] **Step 5: `Display`, `Led`, `CopyButton`, `FileDrop`**

`src/ui/Display.svelte`:
```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    label,
    live = false,
    head,
    children,
  }: { label?: string; live?: boolean; head?: Snippet; children: Snippet } = $props();
</script>

<section
  class="display"
  aria-label={label}
  role={live ? 'status' : undefined}
  aria-live={live ? 'polite' : undefined}
>
  {#if head}<div class="display-head">{@render head()}</div>{/if}
  {@render children()}
</section>
```

`src/ui/Led.svelte`:
```svelte
<script lang="ts">
  let { state, label }: { state: 'ok' | 'bad' | 'idle'; label: string } = $props();
</script>

<span class="led-wrap">
  {#key state}<span class="led {state}" aria-hidden="true"></span>{/key}
  <span>{label}</span>
</span>

<style>
  .led-wrap {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .led {
    width: 10px;
    height: 10px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--idle);
    transition: background-color 160ms;
  }
  .ok {
    background: var(--ok);
    animation: pulse 400ms ease-out;
    box-shadow: 0 0 10px var(--ok);
  }
  .bad {
    background: var(--bad);
    animation: pulse 400ms ease-out;
    box-shadow: 0 0 10px var(--bad);
  }
  @keyframes pulse {
    from {
      transform: scale(1.6);
      opacity: 0.4;
    }
  }
</style>
```

`src/ui/CopyButton.svelte`:
```svelte
<script lang="ts">
  import { t } from '../i18n';
  import { copyText } from '../lib/clipboard';
  import { toast, truncate } from '../lib/toast';
  import type { Locale } from '../tools/types';
  import Icon from './Icon.svelte';

  let {
    value,
    locale,
    main = false,
    compact = false,
    label,
  }: {
    value: string | (() => string);
    locale: Locale;
    main?: boolean;
    compact?: boolean;
    label?: string;
  } = $props();

  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const resolved = $derived(typeof value === 'function' ? '' : value);
  const disabled = $derived(typeof value === 'string' && value === '');

  async function copy() {
    const text = typeof value === 'function' ? value() : value;
    if (!text) return;
    const ok = await copyText(text);
    if (!ok) {
      toast(t(locale, 'ui.copy') + ' ✕', 'bad');
      return;
    }
    copied = true;
    toast(t(locale, 'ui.copiedValue', { v: truncate(text) }));
    clearTimeout(timer);
    timer = setTimeout(() => (copied = false), 1600);
  }
</script>

<button
  type="button"
  class="copy"
  class:compact
  class:copied
  {disabled}
  onclick={copy}
  data-copy-main={main ? '' : undefined}
  aria-label={compact ? `${label ?? t(locale, 'ui.copy')} ${resolved}`.trim() : undefined}
>
  <Icon name={copied ? 'check' : 'copy'} size={16} />
  <span>{copied ? t(locale, 'ui.copied') : (label ?? t(locale, 'ui.copy'))}</span>
</button>

<style>
  .copy {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 16px;
    background: var(--raised);
    color: var(--text);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-pill);
    font: 600 14px/1 var(--font-body);
    cursor: pointer;
    transition:
      transform 120ms ease-out,
      color 200ms,
      border-color 200ms;
  }
  .copy:active:not(:disabled) {
    transform: scale(0.97);
  }
  .copy:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .compact {
    min-height: 36px;
    min-width: 96px;
    padding: 0 12px;
    background: transparent;
    color: var(--disp-dim);
    border-color: var(--disp-line);
    font-size: 13px;
  }
  .copied {
    color: var(--ok);
    border-color: var(--ok);
  }
</style>
```

`src/ui/FileDrop.svelte`:
```svelte
<script lang="ts">
  import { t } from '../i18n';
  import type { Locale } from '../tools/types';

  let {
    locale,
    accept,
    onfile,
  }: { locale: Locale; accept?: string; onfile: (file: File) => void } = $props();

  let over = $state(false);

  function pick(files: FileList | null | undefined) {
    const f = files?.[0];
    if (f) onfile(f);
  }
</script>

<label
  class="drop"
  class:over
  ondragover={(e) => {
    e.preventDefault();
    over = true;
  }}
  ondragleave={() => (over = false)}
  ondrop={(e) => {
    e.preventDefault();
    over = false;
    pick(e.dataTransfer?.files);
  }}
>
  <input type="file" {accept} onchange={(e) => pick(e.currentTarget.files)} />
  <span>{t(locale, 'ui.dropFile')}</span>
</label>

<style>
  .drop {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    padding: 24px;
    text-align: center;
    color: var(--text-dim);
    background: var(--well);
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius);
    cursor: pointer;
    transition: border-color 160ms, color 160ms;
  }
  .drop.over,
  .drop:focus-within {
    color: var(--text);
    border-color: var(--accent);
  }
  input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }
</style>
```

- [ ] **Step 6: `src/islands/Toaster.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { TOAST_EVENT, type ToastDetail } from '../lib/toast';
  import Icon from '../ui/Icon.svelte';

  let current: (ToastDetail & { id: number }) | null = $state(null);
  let reduce = $state(false);
  let seq = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  onMount(() => {
    reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      current = { ...detail, id: ++seq };
      clearTimeout(timer);
      timer = setTimeout(() => (current = null), 1600);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  });
</script>

<div class="toaster" role="status" aria-live="polite">
  {#if current}
    {#key current.id}
      <div class="toast {current.kind}" transition:fly={{ y: reduce ? 0 : 8, duration: reduce ? 0 : 180 }}>
        <Icon name={current.kind === 'ok' ? 'check' : 'x'} size={16} />
        {current.message}
      </div>
    {/key}
  {/if}
</div>

<style>
  .toaster {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 80;
    pointer-events: none;
  }
  .toast {
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: min(420px, calc(100vw - 32px));
    padding: 12px 16px;
    background: var(--text);
    color: var(--bg);
    border-radius: var(--radius);
    font: 600 14px/1.3 var(--font-body);
    box-shadow: 0 10px 30px rgb(0 0 0 / 0.25);
  }
  .toast.bad {
    background: var(--bad);
    color: var(--on-accent);
  }
  @media (max-width: 599px) {
    .toaster {
      right: 16px;
      left: 16px;
      bottom: 16px;
      display: flex;
      justify-content: center;
    }
  }
</style>
```

- [ ] **Step 7: Verificar**

Run: `pnpm test && pnpm check && pnpm lint`
Expected: todo en verde.

- [ ] **Step 8: Commit**

```bash
git add src/lib src/ui src/islands
git commit -m "feat: pantalla de resultados, LED, copiar con aviso y zona de archivos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Layout base: `<head>`, tema sin parpadeo, pantalla de arranque

**Files:**
- Create: `src/components/SeoHead.astro`, `src/components/BootScreen.astro`, `src/layouts/AppLayout.astro`
- Modify: `src/styles/global.css` (añadir bloque de layout y boot), `src/pages/[locale]/index.astro` (usar el layout provisionalmente)

**Interfaces:**
- Consumes: `t`, `LOCALES`, `Locale`, `tools`, `writeString`, `Toaster`.
- Produces:
  - `AppLayout` props: `{ locale: Locale; title: string; description: string; alternates: Record<Locale, string>; jsonLd?: Record<string, unknown>[]; noindex?: boolean; toolId?: string }`. `alternates` son rutas (`/es/formateador-json`), no URLs absolutas.
  - En el DOM: `<html data-theme data-sidebar [data-boot] [data-menu]>`, `<main id="main" data-tool-page={toolId}>`, `<link rel="alternate" hreflang="es|en|x-default">` en el `<head>`.
  - Slots para la Task 10: el layout importa `Sidebar` y `MobileHeader`. En esta task se crean como componentes vacíos para que compile.

- [ ] **Step 1: Stubs de Sidebar y MobileHeader (se rellenan en la Task 10)**

`src/components/Sidebar.astro`:
```astro
---
import type { Locale } from '../tools/types';
interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
---

<aside id="sidebar" class="sidebar" data-locale={locale}></aside>
```

`src/components/MobileHeader.astro`:
```astro
---
import type { Locale } from '../tools/types';
interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
---

<header class="mobile-header" data-locale={locale}></header>
```

- [ ] **Step 2: `src/components/SeoHead.astro`**

```astro
---
import { LOCALES, type Locale } from '../tools/types';

interface Props {
  locale: Locale;
  title: string;
  description: string;
  alternates: Record<Locale, string>;
  jsonLd?: Record<string, unknown>[];
  noindex?: boolean;
}

const { locale, title, description, alternates, jsonLd = [], noindex = false } = Astro.props;
const site = Astro.site!;
const canonical = new URL(alternates[locale], site).href;
const ogImage = new URL('/og.png', site).href;
---

<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
{LOCALES.map((l) => <link rel="alternate" hreflang={l} href={new URL(alternates[l], site).href} />)}
<link rel="alternate" hreflang="x-default" href={new URL('/', site).href} />
{noindex && <meta name="robots" content="noindex" />}
<meta property="og:type" content="website" />
<meta property="og:site_name" content="devtools" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogImage} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content={locale === 'es' ? 'es_ES' : 'en_US'} />
<meta name="twitter:card" content="summary_large_image" />
{jsonLd.map((d) => <script type="application/ld+json" set:html={JSON.stringify(d)} />)}
```

- [ ] **Step 3: `src/components/BootScreen.astro`**

```astro
---
import { t } from '../i18n';
import { tools } from '../tools/registry';
import type { Locale } from '../tools/types';

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const steps = ['Loading modules.............', 'Checking environment.......', 'Mounting tools..............'];
---

<div id="boot" class="boot" aria-hidden="true">
  <div class="boot-screen">
    <div class="boot-line boot-title" style="animation-delay: 0s">DEVTOOLS v0.2.0</div>
    <div class="boot-line" style="animation-delay: 0.3s">&gt; Booting system...</div>
    {
      steps.map((s, i) => (
        <div class="boot-line" style={`animation-delay: ${0.7 + i * 0.3}s`}>
          &gt; {s} <span class="boot-ok">OK</span>
        </div>
      ))
    }
    <div class="boot-line" style="animation-delay: 1.6s">&gt; {t(locale, 'boot.loaded', { n: tools.length })}</div>
    <div class="boot-line" style="animation-delay: 2s">
      &gt; System ready.<span class="boot-cursor">_</span>
    </div>
    <p class="boot-skip">{t(locale, 'boot.skip')}</p>
  </div>
</div>

<script>
  import { writeString } from '../lib/storage';

  const root = document.documentElement;
  if (root.dataset.boot === 'on') {
    const boot = document.getElementById('boot');
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      writeString('booted', '1', 'session');
      boot?.classList.add('fade-out');
      window.removeEventListener('keydown', finish, true);
      window.removeEventListener('pointerdown', finish, true);
      setTimeout(() => delete root.dataset.boot, 400);
    };
    window.addEventListener('keydown', finish, true);
    window.addEventListener('pointerdown', finish, true);
    setTimeout(finish, 2800);
  }
</script>
```

- [ ] **Step 4: `src/layouts/AppLayout.astro`**

El script en línea del `<head>` es crítico: fija tema y estado de la sidebar **antes de pintar** y se engancha a `astro:before-swap` para aplicarlo al documento nuevo en cada navegación (sin esto, el tema vuelve a terminal al navegar; comprobado en la prueba).

```astro
---
import type { TransitionDirectionalAnimations } from 'astro';
import { ClientRouter } from 'astro:transitions';
import '@fontsource-variable/unbounded';
import '@fontsource-variable/instrument-sans';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import '../styles/global.css';
import BootScreen from '../components/BootScreen.astro';
import MobileHeader from '../components/MobileHeader.astro';
import SeoHead from '../components/SeoHead.astro';
import Sidebar from '../components/Sidebar.astro';
import Toaster from '../islands/Toaster.svelte';
import { t } from '../i18n';
import type { Locale } from '../tools/types';

interface Props {
  locale: Locale;
  title: string;
  description: string;
  alternates: Record<Locale, string>;
  jsonLd?: Record<string, unknown>[];
  noindex?: boolean;
  toolId?: string;
}

const { locale, toolId, ...seo } = Astro.props;

const pageAnim: TransitionDirectionalAnimations = {
  forwards: {
    old: { name: 'dt-out', duration: '120ms', easing: 'ease-in', fillMode: 'both' },
    new: { name: 'dt-in', duration: '200ms', easing: 'cubic-bezier(.2,.8,.2,1)', fillMode: 'both' },
  },
  backwards: {
    old: { name: 'dt-out', duration: '120ms', easing: 'ease-in', fillMode: 'both' },
    new: { name: 'dt-in', duration: '200ms', easing: 'cubic-bezier(.2,.8,.2,1)', fillMode: 'both' },
  },
};
---

<!doctype html>
<html lang={locale} data-theme="terminal" data-sidebar="expanded">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#0a0a0a" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <script is:inline>
      (() => {
        const THEMES = ['terminal', 'dark', 'light'];
        const COLORS = { terminal: '#0a0a0a', dark: '#161719', light: '#e3e1dc' };
        const read = (area, key) => {
          try {
            return window[area].getItem('devtools:' + key);
          } catch {
            return null;
          }
        };
        const apply = (doc) => {
          const root = doc.documentElement;
          const theme = read('localStorage', 'theme');
          root.dataset.theme = THEMES.includes(theme) ? theme : 'terminal';
          root.dataset.sidebar = read('localStorage', 'sidebar.collapsed') === '1' ? 'collapsed' : 'expanded';
          const meta = doc.querySelector('meta[name="theme-color"]');
          if (meta) meta.setAttribute('content', COLORS[root.dataset.theme]);
        };
        apply(document);
        const root = document.documentElement;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (root.dataset.theme === 'terminal' && !read('sessionStorage', 'booted') && !reduce) {
          root.dataset.boot = 'on';
        }
        if (!window.__devtoolsHooked) {
          window.__devtoolsHooked = true;
          document.addEventListener('astro:before-swap', (e) => apply(e.newDocument));
        }
      })();
    </script>
    <SeoHead locale={locale} {...seo} />
    <ClientRouter />
    <script
      is:inline
      defer
      src="https://analytics.alvarotc.com/script.js"
      data-website-id="e22cc3f5-18df-4c52-8bb4-14d481ea64da"></script>
  </head>
  <body>
    <a class="skip-link" href="#main">{t(locale, 'nav.skip')}</a>
    <BootScreen locale={locale} />
    <div class="app">
      <Sidebar locale={locale} />
      <div class="menu-backdrop" data-menu-close aria-hidden="true"></div>
      <div class="main-col">
        <MobileHeader locale={locale} />
        <main id="main" class="main" data-tool-page={toolId} transition:animate={pageAnim}>
          <slot />
        </main>
      </div>
    </div>
    <Toaster client:idle transition:persist="toaster" />
  </body>
</html>
```

- [ ] **Step 5: CSS de layout y arranque (añadir al final de `src/styles/global.css`)**

```css
/* Layout */

.app {
  display: flex;
  min-height: 100dvh;
}

.main-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.main {
  width: 100%;
  max-width: 1064px;
  padding: 48px 64px 72px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

@media (max-width: 899px) {
  .main {
    padding: 24px 16px 56px;
    gap: 20px;
  }
}

/* Boot screen (terminal theme, once per session) */

.boot {
  display: none;
}

:root[data-boot='on'] .boot {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: #0a0a0a;
  color: #33ff33;
  font: 14px/1.8 var(--font-mono);
  transition: opacity 0.4s ease-out;
}

:root[data-boot='on'] body {
  overflow: hidden;
}

.boot.fade-out {
  opacity: 0;
}

.boot-line {
  opacity: 0;
  white-space: pre-wrap;
  animation: boot-reveal 0.05s forwards;
}

.boot-title {
  margin-bottom: 8px;
  font-weight: 700;
  color: #66ff66;
  text-shadow: 0 0 8px rgb(51 255 51 / 0.6);
}

.boot-ok {
  color: #66ff66;
  text-shadow: 0 0 4px rgb(51 255 51 / 0.45);
}

.boot-cursor {
  animation: blink 0.6s step-end infinite;
}

.boot-skip {
  margin-top: 24px;
  color: #1fae1f;
  font-size: 12px;
  opacity: 0;
  animation: boot-reveal 0.3s 2.2s forwards;
}

@keyframes boot-reveal {
  to {
    opacity: 1;
  }
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}
```

- [ ] **Step 6: Usar el layout en la Home provisional**

`src/pages/[locale]/index.astro`:
```astro
---
import AppLayout from '../../layouts/AppLayout.astro';
import { t } from '../../i18n';
import type { Locale } from '../../tools/types';

export function getStaticPaths() {
  return [{ params: { locale: 'es' } }, { params: { locale: 'en' } }];
}
const locale = Astro.params.locale as Locale;
---

<AppLayout
  locale={locale}
  title={`devtools · ${t(locale, 'home.title')}`}
  description={t(locale, 'site.description')}
  alternates={{ es: '/es', en: '/en' }}
>
  <h1>{t(locale, 'home.title')}</h1>
</AppLayout>
```

- [ ] **Step 7: Verificar a mano**

Run: `pnpm build && pnpm preview`
Abre `http://localhost:4321/es` y comprueba:
1. Sale la pantalla de arranque verde. Una tecla la cierra. Al recargar, no vuelve a salir (misma sesión).
2. En DevTools del navegador: `localStorage.setItem('devtools:theme','light')` y recarga → fondo aluminio `#E3E1DC` desde el primer frame, sin destello verde.
3. `localStorage.setItem('devtools:theme','nope')` → vuelve a terminal.
4. En una ventana privada con cookies bloqueadas la página carga sin errores en consola.

Luego `pnpm check && pnpm lint`. Expected: `0 errors`, lint limpio.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "feat: layout base con SEO en <head>, tema sin parpadeo y pantalla de arranque

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Sidebar, cabecera móvil, selector de tema e idioma

**Files:**
- Modify: `src/components/Sidebar.astro`, `src/components/MobileHeader.astro`, `src/styles/global.css`

**Interfaces:**
- Consumes: `visibleCategories`, `toolsInCategory`, `toolHref`, `homeHref`, `otherLocale`, `t`, `Icon`, `readJSON`, `writeJSON`, `writeString`, `getFavorites`, `PREFS_EVENT`.
- Produces (DOM, lo usan los e2e y las Tasks 11 y 12):
  - `#sidebar` con `transition:persist={'sidebar-' + locale}`
  - `[data-collapse]` botón de plegar (`aria-expanded`)
  - `[data-theme-choice="terminal|dark|light"]` (`role="radio"`, `aria-checked`)
  - `[data-lang-link]` enlace al otro idioma de la página actual
  - `.sb-cat[data-cat]` > `.sb-cat-toggle` (`aria-expanded`) + `.sb-tools` (`hidden`)
  - `.sb-tool[data-tool-id]` enlaces; el de la página actual con `aria-current="page"`
  - `[data-favorites]` grupo de favoritos (`hidden` si no hay)
  - `[data-menu-open]`, `[data-menu-close]` y `<html data-menu="open">` en móvil
  - `[data-open-search]` botones que abren la paleta (la Task 12 los escucha)

- [ ] **Step 1: `src/components/Sidebar.astro`**

```astro
---
import Icon from '../ui/Icon.svelte';
import { homeHref, otherLocale, t, toolHref } from '../i18n';
import { toolsInCategory, visibleCategories } from '../tools/registry';
import type { Locale } from '../tools/types';

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const other = otherLocale(locale);
const themes = [
  { id: 'terminal', icon: 'terminal', label: t(locale, 'theme.terminal') },
  { id: 'dark', icon: 'moon', label: t(locale, 'theme.dark') },
  { id: 'light', icon: 'sun', label: t(locale, 'theme.light') },
] as const;
---

<aside
  id="sidebar"
  class="sidebar"
  aria-label={t(locale, 'nav.tools')}
  transition:persist={`sidebar-${locale}`}
>
  <div class="sb-head">
    <a class="logo" href={homeHref(locale)}>
      <span class="logo-full">devtools</span><span class="logo-short" aria-hidden="true">d/</span>
    </a>
    <button
      type="button"
      class="sb-icon-btn sb-collapse"
      data-collapse
      aria-expanded="true"
      aria-label={t(locale, 'nav.collapse')}
      data-label-collapse={t(locale, 'nav.collapse')}
      data-label-expand={t(locale, 'nav.expand')}
    >
      <Icon name="panel-left-close" class="when-expanded" />
      <Icon name="panel-left-open" class="when-collapsed" />
    </button>
    <button type="button" class="sb-icon-btn sb-close" data-menu-close aria-label={t(locale, 'nav.closeMenu')}>
      <Icon name="x" />
    </button>
  </div>

  <button type="button" class="sb-search" data-open-search>
    <Icon name="search" size={16} />
    <span class="sb-label">{t(locale, 'home.search')}</span>
    <kbd class="sb-label">Ctrl K</kbd>
  </button>

  <nav class="sb-nav">
    <a class="sb-item" href={homeHref(locale)} title={t(locale, 'nav.home')}>
      <Icon name="house" />
      <span class="sb-label">{t(locale, 'nav.home')}</span>
    </a>

    <div class="sb-cat sb-favs" data-favorites hidden>
      <p class="sb-item sb-group-title" title={t(locale, 'nav.favorites')}>
        <Icon name="star" />
        <span class="sb-label">{t(locale, 'nav.favorites')}</span>
      </p>
      <div class="sb-tools" data-favorites-list></div>
    </div>

    {
      visibleCategories().map((c) => {
        const list = toolsInCategory(c.id);
        return (
          <div class="sb-cat" data-cat={c.id}>
            <button
              type="button"
              class="sb-item sb-cat-toggle"
              aria-expanded="false"
              aria-controls={`cat-${c.id}`}
              title={c.name[locale]}
            >
              <Icon name={c.icon} />
              <span class="sb-label">{c.name[locale]}</span>
              <span class="sb-count sb-label">{list.length}</span>
              <Icon name="chevron-right" size={14} class="sb-chev sb-label" />
            </button>
            <div class="sb-tools" id={`cat-${c.id}`} hidden>
              <p class="sb-flyout-title">{c.name[locale]}</p>
              {list.map((tool) => (
                <a class="sb-tool" href={toolHref(locale, tool)} data-tool-id={tool.id}>
                  {tool.name[locale]}
                </a>
              ))}
            </div>
          </div>
        );
      })
    }
  </nav>

  <div class="sb-foot">
    <div class="sb-theme" role="radiogroup" aria-label={t(locale, 'theme.label')}>
      {
        themes.map((th) => (
          <button
            type="button"
            role="radio"
            aria-checked="false"
            tabindex="-1"
            data-theme-choice={th.id}
            aria-label={th.label}
            title={th.label}
          >
            <Icon name={th.icon} size={16} />
          </button>
        ))
      }
    </div>
    <a class="sb-lang" data-lang-link href={homeHref(other)} hreflang={other} lang={other} title={t(locale, 'lang.switch')}>
      {other.toUpperCase()}
    </a>
  </div>
</aside>

<script>
  import { getFavorites, PREFS_EVENT } from '../lib/prefs';
  import { readJSON, writeJSON, writeString } from '../lib/storage';

  const root = document.documentElement;
  const COLORS: Record<string, string> = { terminal: '#0a0a0a', dark: '#161719', light: '#e3e1dc' };
  const sidebar = () => document.getElementById('sidebar');

  function syncThemeButtons() {
    document.querySelectorAll<HTMLElement>('[data-theme-choice]').forEach((b) => {
      const on = b.dataset.themeChoice === root.dataset.theme;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
  }

  function setTheme(theme: string) {
    root.dataset.theme = theme;
    writeString('theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLORS[theme]);
    syncThemeButtons();
  }

  function syncCollapseButton() {
    const btn = document.querySelector<HTMLElement>('[data-collapse]');
    if (!btn) return;
    const collapsed = root.dataset.sidebar === 'collapsed';
    btn.setAttribute('aria-expanded', String(!collapsed));
    btn.setAttribute('aria-label', (collapsed ? btn.dataset.labelExpand : btn.dataset.labelCollapse) ?? '');
  }

  function setCollapsed(collapsed: boolean) {
    root.dataset.sidebar = collapsed ? 'collapsed' : 'expanded';
    writeString('sidebar.collapsed', collapsed ? '1' : '0');
    syncCollapseButton();
  }

  function setCatOpen(id: string, open: boolean, persist: boolean) {
    const cat = sidebar()?.querySelector<HTMLElement>(`[data-cat="${id}"]`);
    if (!cat) return;
    cat.querySelector('.sb-cat-toggle')?.setAttribute('aria-expanded', String(open));
    const list = cat.querySelector<HTMLElement>('.sb-tools');
    if (list) list.hidden = !open;
    if (!persist) return;
    const set = new Set(readJSON<string[]>('sidebar.open', []));
    if (open) set.add(id);
    else set.delete(id);
    writeJSON('sidebar.open', [...set]);
  }

  function renderFavorites() {
    const el = sidebar();
    const group = el?.querySelector<HTMLElement>('[data-favorites]');
    const list = el?.querySelector<HTMLElement>('[data-favorites-list]');
    if (!group || !list) return;
    const links = getFavorites()
      .map((id) => el!.querySelector<HTMLElement>(`[data-cat] [data-tool-id="${id}"]`))
      .filter((a): a is HTMLElement => a !== null)
      .map((a) => a.cloneNode(true) as HTMLElement);
    list.replaceChildren(...links);
    group.hidden = links.length === 0;
    syncCurrent();
  }

  function syncCurrent() {
    const el = sidebar();
    if (!el) return;
    const path = location.pathname.replace(/\/$/, '') || '/';
    el.querySelectorAll('a[href]').forEach((a) => {
      if (a.getAttribute('href') === path) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    const current = el.querySelector('[data-cat] [aria-current="page"]');
    const catId = current?.closest<HTMLElement>('[data-cat]')?.dataset.cat;
    if (catId) setCatOpen(catId, true, false);
    const lang = el.querySelector<HTMLAnchorElement>('[data-lang-link]');
    const alt = document.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${lang?.getAttribute('hreflang')}"]`,
    );
    if (lang && alt) lang.href = new URL(alt.href).pathname;
  }

  function closeMenu() {
    if (root.dataset.menu !== 'open') return;
    delete root.dataset.menu;
    document.querySelector<HTMLElement>('[data-menu-open]')?.focus();
  }

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const theme = target.closest<HTMLElement>('[data-theme-choice]');
    if (theme?.dataset.themeChoice) return setTheme(theme.dataset.themeChoice);
    if (target.closest('[data-collapse]')) return setCollapsed(root.dataset.sidebar !== 'collapsed');
    const toggle = target.closest<HTMLElement>('.sb-cat-toggle');
    if (toggle) {
      const id = toggle.closest<HTMLElement>('[data-cat]')?.dataset.cat;
      if (id) setCatOpen(id, toggle.getAttribute('aria-expanded') !== 'true', true);
      return;
    }
    if (target.closest('[data-menu-open]')) {
      root.dataset.menu = 'open';
      sidebar()?.querySelector<HTMLElement>('a, button')?.focus();
      return;
    }
    if (target.closest('[data-menu-close]')) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
    const theme = (e.target as HTMLElement).closest?.('[data-theme-choice]');
    if (!theme || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const all = [...document.querySelectorAll<HTMLElement>('[data-theme-choice]')];
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
    const next = all[(all.indexOf(theme as HTMLElement) + d + all.length) % all.length];
    setTheme(next.dataset.themeChoice!);
    next.focus();
  });

  window.addEventListener(PREFS_EVENT, (e) => {
    if ((e as CustomEvent<{ key: string }>).detail.key === 'favorites') renderFavorites();
  });

  document.addEventListener('astro:page-load', () => {
    for (const id of readJSON<string[]>('sidebar.open', [])) setCatOpen(id, true, false);
    syncThemeButtons();
    syncCollapseButton();
    renderFavorites();
    closeMenu();
  });
</script>
```

- [ ] **Step 2: `src/components/MobileHeader.astro`**

```astro
---
import Icon from '../ui/Icon.svelte';
import { homeHref, t } from '../i18n';
import type { Locale } from '../tools/types';

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
---

<header class="mobile-header">
  <button type="button" class="sb-icon-btn" data-menu-open aria-label={t(locale, 'nav.openMenu')}>
    <Icon name="menu" size={22} />
  </button>
  <a class="logo" href={homeHref(locale)}>devtools</a>
  <button type="button" class="sb-icon-btn" data-open-search aria-label={t(locale, 'home.search')}>
    <Icon name="search" size={20} />
  </button>
</header>
```

- [ ] **Step 3: CSS de sidebar y cabecera móvil (añadir al final de `src/styles/global.css`)**

```css
/* Sidebar */

.sidebar {
  position: sticky;
  top: 0;
  z-index: 40;
  width: var(--sidebar-w);
  height: 100dvh;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px 14px 16px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  transition: width 280ms var(--ease);
}

.sb-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 44px;
  padding-left: 6px;
}

.logo {
  font: 700 19px/1 var(--font-display);
  letter-spacing: -0.02em;
  color: var(--text);
  text-decoration: none;
  text-shadow: var(--glow);
}

[data-theme='terminal'] .logo {
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

[data-theme='terminal'] .logo-full::after {
  content: '_';
}

.logo-short {
  display: none;
}

.sb-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-dim);
  cursor: pointer;
}

.sb-icon-btn:hover {
  color: var(--text);
}

.sb-close,
.when-collapsed {
  display: none;
}

.sb-search {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 0 12px;
  background: var(--well);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-dim);
  font-size: 14px;
  cursor: pointer;
}

.sb-search kbd {
  margin-left: auto;
  font: 12px var(--font-mono);
}

.sb-nav {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.sb-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 40px;
  margin: 0;
  padding: 0 12px;
  background: transparent;
  border: 0;
  border-radius: var(--radius);
  color: var(--text-dim);
  font: 500 14px/1.2 var(--font-body);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.sb-item:hover,
.sb-cat-toggle[aria-expanded='true'] {
  color: var(--text);
}

.sb-cat-toggle[aria-expanded='true'] {
  background: var(--raised);
}

.sb-item[aria-current='page'],
.sb-tool[aria-current='page'] {
  background: var(--accent);
  color: var(--on-accent);
  font-weight: 600;
}

.sb-group-title {
  cursor: default;
  margin-top: 8px;
}

.sb-label {
  white-space: nowrap;
}

.sb-cat-toggle .sb-label:first-of-type {
  flex: 1;
}

.sb-count {
  font-size: 12px;
  color: var(--text-dim);
}

.sb-chev {
  transition: transform 200ms var(--ease);
}

.sb-cat-toggle[aria-expanded='true'] .sb-chev {
  transform: rotate(90deg);
}

.sb-tools {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 2px 0 8px 40px;
}

.sb-tools[hidden] {
  display: none;
}

.sb-tools:not([hidden]) {
  animation: dt-in 200ms var(--ease);
}

.sb-flyout-title {
  display: none;
}

.sb-tool {
  padding: 6px 10px;
  border-radius: var(--radius);
  color: var(--text-dim);
  font-size: 13.5px;
  text-decoration: none;
}

.sb-tool:hover {
  color: var(--text);
}

.sb-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.sb-theme {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--well);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  box-shadow: var(--inset);
}

.sb-theme button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 36px;
  border: 0;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  transition:
    background-color 200ms,
    color 200ms;
}

.sb-theme button[aria-checked='true'] {
  background: var(--accent);
  color: var(--on-accent);
}

.sb-lang {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-dim);
  font: 600 13px var(--font-mono);
  text-decoration: none;
}

.sb-lang:hover {
  color: var(--text);
}

.mobile-header,
.menu-backdrop {
  display: none;
}

/* Desktop: collapsed sidebar shows icons and flyout menus */

@media (min-width: 900px) {
  :root[data-sidebar='collapsed'] {
    --sidebar-w: 76px;
  }

  [data-sidebar='collapsed'] .sidebar {
    padding-inline: 16px;
  }

  [data-sidebar='collapsed'] .sb-head {
    flex-direction: column;
    padding-left: 0;
  }

  [data-sidebar='collapsed'] .logo-full,
  [data-sidebar='collapsed'] .sb-label,
  [data-sidebar='collapsed'] .when-expanded {
    display: none;
  }

  [data-sidebar='collapsed'] .logo-short,
  [data-sidebar='collapsed'] .when-collapsed {
    display: inline;
  }

  [data-sidebar='collapsed'] .sb-search,
  [data-sidebar='collapsed'] .sb-item {
    justify-content: center;
    padding: 0;
  }

  [data-sidebar='collapsed'] .sb-nav {
    overflow: visible;
  }

  [data-sidebar='collapsed'] .sb-cat {
    position: relative;
  }

  [data-sidebar='collapsed'] .sb-cat .sb-tools,
  [data-sidebar='collapsed'] .sb-cat .sb-tools[hidden] {
    display: none;
    position: absolute;
    top: 0;
    left: calc(100% + 8px);
    min-width: 220px;
    padding: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: 0 12px 32px rgb(0 0 0 / 0.3);
  }

  [data-sidebar='collapsed'] .sb-cat:hover .sb-tools,
  [data-sidebar='collapsed'] .sb-cat:focus-within .sb-tools {
    display: flex;
  }

  [data-sidebar='collapsed'] .sb-flyout-title {
    display: block;
    padding: 4px 10px 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-dim);
  }

  [data-sidebar='collapsed'] .sb-foot {
    flex-direction: column;
  }

  [data-sidebar='collapsed'] .sb-theme {
    flex-direction: column;
  }
}

/* Mobile: sidebar becomes an off-canvas panel */

@media (max-width: 899px) {
  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: min(300px, 85vw);
    transform: translateX(-100%);
    visibility: hidden;
    transition:
      transform 280ms var(--ease),
      visibility 0s 280ms;
  }

  :root[data-menu='open'] .sidebar {
    transform: none;
    visibility: visible;
    transition: transform 280ms var(--ease);
  }

  .sb-collapse {
    display: none;
  }

  .sb-close {
    display: inline-flex;
  }

  :root[data-menu='open'] .menu-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 30;
    background: rgb(0 0 0 / 0.5);
  }

  :root[data-menu='open'] body {
    overflow: hidden;
  }

  .mobile-header {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    padding: 0 8px;
    padding-top: env(safe-area-inset-top);
    background: var(--surface);
    border-bottom: 1px solid var(--border);
  }

  .mobile-header .sb-icon-btn {
    border: 0;
    color: var(--text);
  }

  .mobile-header .logo {
    font-size: 17px;
  }
}
```

- [ ] **Step 4: Verificar a mano**

Run: `pnpm build && pnpm preview`
En `/es` (con la paleta aún sin montar, los botones de búsqueda no hacen nada todavía):
1. Los 3 botones de tema cambian el tema al instante. Al recargar se mantiene. Con el foco en el grupo, ← → cambian de tema.
2. Plegar deja solo iconos (76 px) y se mantiene al recargar.
3. `ES`/`EN` lleva a `/en` y la sidebar sale en inglés.
4. A 390 px de ancho: aparece la cabecera móvil y el menú abre la sidebar como panel. Esc, tocar fuera o la X lo cierran.
5. Todavía no hay categorías visibles: el registro está vacío (lo esperado hasta la Task 14).

Luego `pnpm check && pnpm lint`.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat: sidebar agrupada y plegable, selector de tema e idioma, menú móvil

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Home, redirección de `/`, enlaces antiguos y 404

**Files:**
- Create: `src/lib/legacy.ts`, `src/lib/legacy.test.ts`, `src/components/Catalog.astro`, `src/pages/index.astro`, `src/pages/404.astro`
- Modify: `src/pages/[locale]/index.astro`

**Interfaces:**
- Consumes: `toolById`, `tools`, `toolsInCategory`, `visibleCategories`, `toolHref`, `homeHref`, `isLocale`, `t`, `getRecent`, `Icon`.
- Produces:
  - `pickLocale(stored: string | null, languages: readonly string[]): Locale`
  - `resolveLegacyHash(hash: string, locale: Locale): string`
  - `STARTER_IDS = ['json', 'uuid', 'jwt', 'base64']`
  - DOM de la Home: `#home-search` (input que abre la paleta), `[data-recent-grid]`, `<template data-tile="<id>">` por herramienta, `.catalog`

- [ ] **Step 1: Test de `legacy.ts` (falla)**

`src/lib/legacy.test.ts`:
```ts
import { describe, expect, it, vi } from 'vitest';

vi.mock('../tools/registry', () => ({
  toolById: (id: string) =>
    id === 'json' ? { id: 'json', slug: { es: 'formateador-json', en: 'json-formatter' } } : undefined,
}));

const { pickLocale, resolveLegacyHash } = await import('./legacy');

describe('pickLocale', () => {
  it('prefers a stored valid locale', () => {
    expect(pickLocale('en', ['es-ES'])).toBe('en');
  });

  it('ignores an invalid stored value and uses the browser languages', () => {
    expect(pickLocale('fr', ['fr-FR', 'en-GB', 'es'])).toBe('en');
  });

  it('falls back to Spanish', () => {
    expect(pickLocale(null, ['de-DE'])).toBe('es');
    expect(pickLocale(null, [])).toBe('es');
  });
});

describe('resolveLegacyHash', () => {
  it('maps an old #id to the new tool page', () => {
    expect(resolveLegacyHash('#json', 'es')).toBe('/es/formateador-json');
    expect(resolveLegacyHash('#json', 'en')).toBe('/en/json-formatter');
  });

  it('sends unknown or not-yet-migrated tools to the home page, never to a 404', () => {
    expect(resolveLegacyHash('#number-base', 'es')).toBe('/es');
    expect(resolveLegacyHash('#url', 'en')).toBe('/en');
    expect(resolveLegacyHash('', 'en')).toBe('/en');
    expect(resolveLegacyHash('#', 'es')).toBe('/es');
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `pnpm test src/lib/legacy.test.ts`
Expected: FAIL.

- [ ] **Step 3: `src/lib/legacy.ts`**

```ts
import { homeHref, isLocale, toolHref } from '../i18n';
import { toolById } from '../tools/registry';
import type { Locale } from '../tools/types';

export function pickLocale(stored: string | null, languages: readonly string[]): Locale {
  if (stored && isLocale(stored)) return stored;
  for (const lang of languages) {
    const base = lang.toLowerCase().split('-')[0];
    if (isLocale(base)) return base;
  }
  return 'es';
}

export function resolveLegacyHash(hash: string, locale: Locale): string {
  const id = hash.replace(/^#/, '').trim();
  const tool = id ? toolById(id) : undefined;
  return tool ? toolHref(locale, tool) : homeHref(locale);
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `pnpm test src/lib/legacy.test.ts`
Expected: PASS.

- [ ] **Step 5: `src/pages/index.astro` (elige idioma y redirige)**

```astro
---
import '../styles/global.css';
---

<!doctype html>
<html lang="es" data-theme="terminal">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>devtools</title>
    <meta name="description" content="Developer tools that run in your browser · Herramientas para desarrolladores que funcionan en tu navegador." />
    <link rel="canonical" href={new URL('/', Astro.site).href} />
    <link rel="alternate" hreflang="es" href={new URL('/es', Astro.site).href} />
    <link rel="alternate" hreflang="en" href={new URL('/en', Astro.site).href} />
    <link rel="alternate" hreflang="x-default" href={new URL('/', Astro.site).href} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <main class="main">
      <h1>devtools</h1>
      <p><a href="/es" hreflang="es" lang="es">Español</a>{' · '}<a href="/en" hreflang="en" lang="en">English</a></p>
    </main>
    <script>
      import { pickLocale, resolveLegacyHash } from '../lib/legacy';
      import { readString } from '../lib/storage';

      const locale = pickLocale(readString('locale', ''), navigator.languages ?? [navigator.language]);
      location.replace(resolveLegacyHash(location.hash, locale));
    </script>
  </body>
</html>
```

- [ ] **Step 6: Guardar el idioma al usar el selector**

En el `<script>` de `src/components/Sidebar.astro`, dentro del listener de `click`, justo después de la línea `const target = e.target as HTMLElement;`, añade:

```ts
    const lang = target.closest<HTMLElement>('[data-lang-link]');
    if (lang) writeString('locale', lang.getAttribute('hreflang') ?? 'es');
```

(No hace `return`: la navegación del enlace sigue su curso.)

- [ ] **Step 7: `src/components/Catalog.astro`**

```astro
---
import Icon from '../ui/Icon.svelte';
import { toolHref } from '../i18n';
import { toolsInCategory, visibleCategories } from '../tools/registry';
import type { Locale } from '../tools/types';

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
---

<div class="catalog">
  {
    visibleCategories().map((c) => (
      <section class="cat-col" aria-labelledby={`catalog-${c.id}`}>
        <h3 id={`catalog-${c.id}`} class="cat-head">
          <Icon name={c.icon} size={16} />
          <span>{c.name[locale]}</span>
        </h3>
        <p class="cat-desc">{c.description[locale]}</p>
        <ul>
          {toolsInCategory(c.id).map((tool) => (
            <li>
              <a href={toolHref(locale, tool)}>{tool.name[locale]}</a>
            </li>
          ))}
        </ul>
      </section>
    ))
  }
</div>

<style>
  .catalog {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 28px 32px;
  }
  .cat-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border);
    color: var(--accent-text);
    font-size: 14px;
    font-weight: 700;
  }
  .cat-head span {
    color: var(--text);
  }
  .cat-desc {
    margin-top: 6px;
    font-size: 12.5px;
    color: var(--text-dim);
  }
  ul {
    list-style: none;
    margin: 8px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  a {
    color: var(--text-dim);
    font-size: 14px;
    text-decoration: none;
  }
  a:hover {
    color: var(--text);
    text-decoration: underline;
  }
</style>
```

- [ ] **Step 8: Home real — `src/pages/[locale]/index.astro`**

```astro
---
import Catalog from '../../components/Catalog.astro';
import AppLayout from '../../layouts/AppLayout.astro';
import Icon from '../../ui/Icon.svelte';
import { t, toolHref } from '../../i18n';
import { categories } from '../../tools/categories';
import { toolById, tools } from '../../tools/registry';
import type { Locale, ToolMeta } from '../../tools/types';

export function getStaticPaths() {
  return [{ params: { locale: 'es' } }, { params: { locale: 'en' } }];
}

const locale = Astro.params.locale as Locale;
const STARTER_IDS = ['json', 'uuid', 'jwt', 'base64'];
const starters = STARTER_IDS.map(toolById).filter((x): x is ToolMeta => Boolean(x));
const catName = (tool: ToolMeta) => categories.find((c) => c.id === tool.category)!.name[locale];
const quick = tools.slice(0, 5);
const site = Astro.site!;
const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'devtools',
    url: new URL(`/${locale}`, site).href,
    inLanguage: locale,
    description: t(locale, 'site.description'),
  },
];
---

<AppLayout
  locale={locale}
  title={`devtools · ${t(locale, 'home.title')}`}
  description={t(locale, 'site.description')}
  alternates={{ es: '/es', en: '/en' }}
  jsonLd={jsonLd}
>
  <section class="hero">
    <h1>{t(locale, 'home.title')}</h1>
    <p class="lead">{t(locale, 'home.count', { n: tools.length })}</p>
    <label class="hero-search">
      <Icon name="search" size={20} />
      <span class="visually-hidden">{t(locale, 'home.search')}</span>
      <input
        id="home-search"
        type="search"
        autocomplete="off"
        placeholder={t(locale, 'home.searchPlaceholder')}
      />
      <kbd>Ctrl K</kbd>
    </label>
    <ul class="chips">
      {quick.map((tool) => <li><a href={toolHref(locale, tool)}>{tool.name[locale]}</a></li>)}
    </ul>
  </section>

  <section class="recent" aria-labelledby="recent-h">
    <h2 id="recent-h" data-recent-title data-recent-label={t(locale, 'home.recent')}>
      {t(locale, 'home.starter')}
    </h2>
    <div class="tiles" data-recent-grid>
      {
        starters.map((tool) => (
          <a class="tile" href={toolHref(locale, tool)}>
            <span class="tile-top">
              <span class="tile-icon"><Icon name={tool.icon} /></span>
              <span class="tile-cat">{catName(tool)}</span>
            </span>
            <span class="tile-name">{tool.name[locale]}</span>
            <span class="tile-desc">{tool.description[locale]}</span>
          </a>
        ))
      }
    </div>
    {
      tools.map((tool) => (
        <template data-tile={tool.id}>
          <a class="tile" href={toolHref(locale, tool)}>
            <span class="tile-top">
              <span class="tile-icon"><Icon name={tool.icon} /></span>
              <span class="tile-cat">{catName(tool)}</span>
            </span>
            <span class="tile-name">{tool.name[locale]}</span>
            <span class="tile-desc">{tool.description[locale]}</span>
          </a>
        </template>
      ))
    }
  </section>

  <section aria-labelledby="all-h" class="stack">
    <h2 id="all-h">{t(locale, 'home.all')}</h2>
    <Catalog locale={locale} />
  </section>
</AppLayout>

<script>
  import { getRecent } from '../../lib/prefs';

  function renderRecent() {
    const grid = document.querySelector<HTMLElement>('[data-recent-grid]');
    const title = document.querySelector<HTMLElement>('[data-recent-title]');
    if (!grid || !title) return;
    const tiles = getRecent()
      .map((id) => document.querySelector<HTMLTemplateElement>(`template[data-tile="${id}"]`))
      .filter((tpl): tpl is HTMLTemplateElement => tpl !== null)
      .slice(0, 4)
      .map((tpl) => tpl.content.cloneNode(true));
    if (tiles.length === 0) return;
    grid.replaceChildren(...tiles);
    title.textContent = title.dataset.recentLabel ?? title.textContent;
  }

  document.addEventListener('astro:page-load', renderRecent);
</script>

<style>
  .hero {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 760px;
  }
  h1 {
    font-size: clamp(30px, 5vw, 44px);
  }
  .lead {
    color: var(--text-dim);
    font-size: 15.5px;
  }
  .hero-search {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 56px;
    margin-top: 8px;
    padding: 0 16px;
    background: var(--raised);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-lg);
    color: var(--accent-text);
    box-shadow: var(--focus-ring);
  }
  .hero-search:focus-within {
    border-color: var(--accent);
  }
  .hero-search input {
    flex: 1;
    min-width: 0;
    height: 100%;
    background: transparent;
    border: 0;
    outline: none;
    color: var(--text);
    font: 16px var(--font-body);
  }
  .hero-search input::placeholder {
    color: var(--text-dim);
  }
  kbd {
    padding: 2px 8px;
    font: 12px var(--font-mono);
    color: var(--text-dim);
    border: 1px solid var(--border);
    border-radius: 6px;
  }
  .chips {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chips a {
    display: inline-flex;
    align-items: center;
    min-height: 36px;
    padding: 0 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    color: var(--text);
    font-size: 13.5px;
    text-decoration: none;
  }
  .recent {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
  .tiles :global(.tile) {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 124px;
    padding: 18px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    color: var(--text);
    text-decoration: none;
    transition: border-color 160ms;
  }
  .tiles :global(.tile:hover) {
    border-color: var(--border-strong);
  }
  .tiles :global(.tile-top) {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .tiles :global(.tile-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: var(--raised);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--accent-text);
  }
  .tiles :global(.tile-cat) {
    font-size: 12px;
    color: var(--text-dim);
  }
  .tiles :global(.tile-name) {
    font: 700 16px var(--font-display);
  }
  .tiles :global(.tile-desc) {
    font-size: 13px;
    color: var(--text-dim);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
```

- [ ] **Step 9: `src/pages/404.astro`**

```astro
---
import AppLayout from '../layouts/AppLayout.astro';
import { homeHref, t } from '../i18n';
---

<AppLayout
  locale="es"
  title={`404 · ${t('es', 'notFound.title')}`}
  description={t('es', 'notFound.body')}
  alternates={{ es: '/404', en: '/404' }}
  noindex
>
  <h1>{t('es', 'notFound.title')}</h1>
  <p>{t('es', 'notFound.body')}</p>
  <p lang="en">{t('en', 'notFound.title')}. {t('en', 'notFound.body')}</p>
  <p class="row">
    <a href={homeHref('es')}>{t('es', 'notFound.back')}</a>
    <a href={homeHref('en')} lang="en">{t('en', 'notFound.back')}</a>
  </p>
</AppLayout>
```

- [ ] **Step 10: Verificar**

Run: `pnpm test && pnpm build && pnpm check && pnpm lint`
Expected: todo en verde y en `dist/` existen `index.html`, `404.html`, `es/index.html` y `en/index.html`.
A mano con `pnpm preview`: `/` redirige a `/es` (o a `/en` si el navegador está en inglés) y `/#json` también redirige a la Home (JSON aún no está en el registro).

- [ ] **Step 11: Commit**

```bash
git add src
git commit -m "feat: Home con buscador y recientes, redirección por idioma, enlaces antiguos y 404

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Atajos de teclado, paleta de comandos y ayuda

**Files:**
- Create: `src/lib/shortcuts.ts`, `src/lib/shortcuts.test.ts`, `src/islands/CommandPalette.svelte`, `src/islands/ShortcutsDialog.svelte`
- Modify: `src/layouts/AppLayout.astro`, `src/tools/types.ts`

**Interfaces:**
- Consumes: `search`, `buildDoc`, `SearchDoc`, `getFavorites`, `getRecent`, `t`, `toolHref`, `tools`, `categories`, `Icon`.
- Produces:
  - `type ShortcutAction = { type: 'search'; query?: string } | { type: 'help' } | { type: 'copy' } | { type: 'tab'; index: number }`
  - `isTypingTarget(target: unknown): boolean`
  - `matchShortcut(e: KeyLike): ShortcutAction | null`
  - `SHORTCUT_EVENT = 'devtools:shortcut'`, `dispatchShortcut(a: ShortcutAction): void`
  - `PaletteEntry = { id: string; href: string; name: string; category: string; icon: IconName }`
  - Comportamiento global: `c` pulsa `[data-copy-main]` si existe; `1…9` pulsa el radio N de `[data-tabs-main]`.

- [ ] **Step 1: Test de atajos (falla)**

`src/lib/shortcuts.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { isTypingTarget, matchShortcut, type KeyLike } from './shortcuts';

const key = (k: string, extra: Partial<KeyLike> = {}): KeyLike => ({
  key: k,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  shiftKey: false,
  target: { tagName: 'BODY' },
  ...extra,
});
const input = { tagName: 'INPUT', type: 'text' };

describe('isTypingTarget', () => {
  it('detects text fields and editable content', () => {
    expect(isTypingTarget({ tagName: 'TEXTAREA' })).toBe(true);
    expect(isTypingTarget(input)).toBe(true);
    expect(isTypingTarget({ tagName: 'INPUT', type: 'search' })).toBe(true);
    expect(isTypingTarget({ tagName: 'DIV', isContentEditable: true })).toBe(true);
  });

  it('ignores buttons, checkboxes and the page itself', () => {
    expect(isTypingTarget({ tagName: 'INPUT', type: 'checkbox' })).toBe(false);
    expect(isTypingTarget({ tagName: 'BUTTON' })).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});

describe('matchShortcut', () => {
  it('opens search with Ctrl+K or Cmd+K even while typing', () => {
    expect(matchShortcut(key('k', { ctrlKey: true, target: input }))).toEqual({ type: 'search' });
    expect(matchShortcut(key('K', { metaKey: true }))).toEqual({ type: 'search' });
  });

  it('maps single keys outside text fields', () => {
    expect(matchShortcut(key('/'))).toEqual({ type: 'search' });
    expect(matchShortcut(key('?', { shiftKey: true }))).toEqual({ type: 'help' });
    expect(matchShortcut(key('c'))).toEqual({ type: 'copy' });
    expect(matchShortcut(key('1'))).toEqual({ type: 'tab', index: 0 });
    expect(matchShortcut(key('9'))).toEqual({ type: 'tab', index: 8 });
  });

  it('never steals single keys while typing', () => {
    for (const k of ['/', '?', 'c', '1']) expect(matchShortcut(key(k, { target: input }))).toBeNull();
  });

  it('leaves browser and system combos alone', () => {
    expect(matchShortcut(key('c', { ctrlKey: true }))).toBeNull();
    expect(matchShortcut(key('C', { ctrlKey: true, shiftKey: true }))).toBeNull();
    expect(matchShortcut(key('1', { altKey: true }))).toBeNull();
    expect(matchShortcut(key('0'))).toBeNull();
    expect(matchShortcut(key('C', { shiftKey: true }))).toBeNull();
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `pnpm test src/lib/shortcuts.test.ts`
Expected: FAIL.

- [ ] **Step 3: `src/lib/shortcuts.ts`**

```ts
export type ShortcutAction =
  | { type: 'search'; query?: string }
  | { type: 'help' }
  | { type: 'copy' }
  | { type: 'tab'; index: number };

export interface KeyLike {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  target: unknown;
}

export const SHORTCUT_EVENT = 'devtools:shortcut';

const NON_TEXT_INPUTS = ['button', 'checkbox', 'radio', 'submit', 'reset', 'range', 'color', 'file', 'image'];

export function isTypingTarget(target: unknown): boolean {
  if (!target || typeof target !== 'object') return false;
  const el = target as { tagName?: string; type?: string; isContentEditable?: boolean };
  if (el.isContentEditable) return true;
  const tag = el.tagName?.toUpperCase();
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag === 'INPUT') return !NON_TEXT_INPUTS.includes((el.type ?? 'text').toLowerCase());
  return false;
}

export function matchShortcut(e: KeyLike): ShortcutAction | null {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') return { type: 'search' };
  if (mod || e.altKey) return null;
  if (isTypingTarget(e.target)) return null;
  if (e.key === '/') return { type: 'search' };
  if (e.key === '?') return { type: 'help' };
  if (e.key === 'c' && !e.shiftKey) return { type: 'copy' };
  if (/^[1-9]$/.test(e.key)) return { type: 'tab', index: Number(e.key) - 1 };
  return null;
}

export function dispatchShortcut(action: ShortcutAction): void {
  window.dispatchEvent(new CustomEvent<ShortcutAction>(SHORTCUT_EVENT, { detail: action }));
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `pnpm test src/lib/shortcuts.test.ts`
Expected: PASS.

- [ ] **Step 5: Tipo `PaletteEntry` (añadir al final de `src/tools/types.ts`)**

```ts
export interface PaletteEntry {
  id: string;
  href: string;
  name: string;
  category: string;
  icon: IconName;
}
```

- [ ] **Step 5b: `src/islands/CommandPalette.svelte`**

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { navigate } from 'astro:transitions/client';
  import { t } from '../i18n';
  import { getFavorites, getRecent } from '../lib/prefs';
  import { search, type SearchDoc } from '../lib/search';
  import { SHORTCUT_EVENT, type ShortcutAction } from '../lib/shortcuts';
  import type { Locale, PaletteEntry } from '../tools/types';
  import Icon from '../ui/Icon.svelte';

  let { locale, entries, docs }: { locale: Locale; entries: PaletteEntry[]; docs: SearchDoc[] } =
    $props();

  let dialog: HTMLDialogElement;
  let input: HTMLInputElement;
  let query = $state('');
  let active = $state(0);
  let favorites: string[] = $state([]);
  let recent: string[] = $state([]);
  let returnFocus: HTMLElement | null = null;

  const byId = $derived(new Map(entries.map((e) => [e.id, e])));
  const pick = (ids: string[]) => ids.map((id) => byId.get(id)).filter((e): e is PaletteEntry => !!e);

  const groups = $derived.by(() => {
    if (query.trim()) return [{ title: t(locale, 'search.results'), items: pick(search(docs, query)) }];
    return [
      { title: t(locale, 'search.favorites'), items: pick(favorites) },
      { title: t(locale, 'search.recent'), items: pick(recent.filter((id) => !favorites.includes(id))) },
    ].filter((g) => g.items.length > 0);
  });
  const flat = $derived(groups.flatMap((g) => g.items));

  async function open(initial = '') {
    if (dialog.open) return;
    returnFocus = document.activeElement as HTMLElement | null;
    favorites = getFavorites();
    recent = getRecent();
    query = initial;
    active = 0;
    dialog.showModal();
    await tick();
    input.focus();
    input.setSelectionRange(query.length, query.length);
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  function go(entry: PaletteEntry | undefined) {
    if (!entry) return;
    close();
    navigate(entry.href);
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (flat.length === 0) return;
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + flat.length) % flat.length;
      document.getElementById(`pal-opt-${active}`)?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(flat[active]);
    }
  }

  onMount(() => {
    const onShortcut = (e: Event) => {
      const a = (e as CustomEvent<ShortcutAction>).detail;
      if (a.type === 'search') open(a.query ?? '');
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-open-search]')) open();
    };
    const onHomeInput = (e: Event) => {
      const el = e.target as HTMLInputElement;
      if (el.id !== 'home-search') return;
      const q = el.value;
      el.value = '';
      open(q);
    };
    window.addEventListener(SHORTCUT_EVENT, onShortcut);
    document.addEventListener('click', onClick);
    document.addEventListener('input', onHomeInput);
    return () => {
      window.removeEventListener(SHORTCUT_EVENT, onShortcut);
      document.removeEventListener('click', onClick);
      document.removeEventListener('input', onHomeInput);
    };
  });
</script>

<dialog
  bind:this={dialog}
  class="palette"
  aria-label={t(locale, 'search.placeholder')}
  onclose={() => returnFocus?.focus()}
  onclick={(e) => e.target === dialog && close()}
>
  <div class="box">
    <div class="search">
      <Icon name="search" size={20} />
      <input
        bind:this={input}
        bind:value={query}
        oninput={() => (active = 0)}
        {onkeydown}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls="pal-list"
        aria-activedescendant={flat.length ? `pal-opt-${active}` : undefined}
        autocomplete="off"
        spellcheck="false"
        placeholder={t(locale, 'search.placeholder')}
      />
      <kbd>Esc</kbd>
    </div>
    <div id="pal-list" role="listbox" class="list">
      {#if query.trim() && flat.length === 0}
        <p class="empty">{t(locale, 'search.empty', { q: query.trim() })}</p>
      {/if}
      {#each groups as g (g.title)}
        <p class="group">{g.title}</p>
        {#each g.items as item (item.id)}
          {@const i = flat.indexOf(item)}
          <a
            id="pal-opt-{i}"
            role="option"
            aria-selected={i === active}
            href={item.href}
            class="opt"
            onmousemove={() => (active = i)}
            onclick={(e) => {
              e.preventDefault();
              go(item);
            }}
          >
            <span class="opt-icon"><Icon name={item.icon} /></span>
            <span class="opt-name">{item.name}</span>
            <span class="opt-cat">{item.category}</span>
          </a>
        {/each}
      {/each}
    </div>
    <p class="hint">{t(locale, 'search.hint')}</p>
  </div>
</dialog>

<style>
  .palette {
    width: min(640px, calc(100vw - 32px));
    max-height: min(560px, calc(100dvh - 64px));
    margin: 12vh auto auto;
    padding: 0;
    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-lg);
    box-shadow: 0 24px 64px rgb(0 0 0 / 0.45);
  }
  .palette::backdrop {
    background: rgb(0 0 0 / 0.5);
  }
  .palette[open] {
    animation: dt-in 160ms var(--ease);
  }
  .box {
    display: flex;
    flex-direction: column;
    max-height: inherit;
  }
  .search {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    height: 60px;
    border-bottom: 1px solid var(--border);
    color: var(--accent-text);
  }
  .search input {
    flex: 1;
    min-width: 0;
    height: 100%;
    background: transparent;
    border: 0;
    outline: none;
    color: var(--text);
    font: 17px var(--font-body);
  }
  kbd {
    padding: 2px 8px;
    font: 12px var(--font-mono);
    color: var(--text-dim);
    border: 1px solid var(--border);
    border-radius: 6px;
  }
  .list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }
  .group {
    padding: 10px 10px 4px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-dim);
  }
  .opt {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 44px;
    padding: 0 10px;
    border-radius: var(--radius);
    color: var(--text);
    text-decoration: none;
  }
  .opt[aria-selected='true'] {
    background: var(--raised);
    box-shadow: inset 0 0 0 1px var(--border-strong);
  }
  .opt-icon {
    color: var(--accent-text);
    display: inline-flex;
  }
  .opt-name {
    flex: 1;
    font-weight: 600;
  }
  .opt-cat {
    font-size: 12.5px;
    color: var(--text-dim);
  }
  .empty,
  .hint {
    padding: 12px;
    font-size: 13px;
    color: var(--text-dim);
  }
  .hint {
    border-top: 1px solid var(--border);
  }
  @media (max-width: 599px) {
    .palette {
      margin-top: 16px;
    }
    .hint {
      display: none;
    }
  }
</style>
```

- [ ] **Step 6: `src/islands/ShortcutsDialog.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../i18n';
  import { SHORTCUT_EVENT, type ShortcutAction } from '../lib/shortcuts';
  import type { Locale } from '../tools/types';

  let { locale }: { locale: Locale } = $props();
  let dialog: HTMLDialogElement;

  const rows = $derived([
    { keys: ['Ctrl K', '/'], label: t(locale, 'shortcuts.search') },
    { keys: ['c'], label: t(locale, 'shortcuts.copy') },
    { keys: ['1 … 9'], label: t(locale, 'shortcuts.tabs') },
    { keys: ['?'], label: t(locale, 'shortcuts.help') },
  ]);

  onMount(() => {
    const on = (e: Event) => {
      if ((e as CustomEvent<ShortcutAction>).detail.type === 'help' && !dialog.open) dialog.showModal();
    };
    window.addEventListener(SHORTCUT_EVENT, on);
    return () => window.removeEventListener(SHORTCUT_EVENT, on);
  });
</script>

<dialog bind:this={dialog} class="help" aria-labelledby="help-title" onclick={(e) => e.target === dialog && dialog.close()}>
  <h2 id="help-title">{t(locale, 'shortcuts.title')}</h2>
  <dl>
    {#each rows as r (r.label)}
      <dt>{#each r.keys as k, i (k)}{#if i > 0}{' '}{/if}<kbd>{k}</kbd>{/each}</dt>
      <dd>{r.label}</dd>
    {/each}
  </dl>
  <form method="dialog"><button class="close">{t(locale, 'shortcuts.close')}</button></form>
</dialog>

<style>
  .help {
    width: min(440px, calc(100vw - 32px));
    padding: 24px;
    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-lg);
  }
  .help::backdrop {
    background: rgb(0 0 0 / 0.5);
  }
  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 12px 20px;
    margin: 20px 0;
    align-items: center;
  }
  dd {
    margin: 0;
    color: var(--text-dim);
  }
  kbd {
    padding: 2px 8px;
    font: 12px var(--font-mono);
    border: 1px solid var(--border-strong);
    border-radius: 6px;
  }
  .close {
    min-height: 44px;
    padding: 0 18px;
    background: var(--raised);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-pill);
    cursor: pointer;
    font-weight: 600;
  }
</style>
```

- [ ] **Step 7: Montar islas y teclado global en `src/layouts/AppLayout.astro`**

En el frontmatter añade:

```ts
import CommandPalette from '../islands/CommandPalette.svelte';
import ShortcutsDialog from '../islands/ShortcutsDialog.svelte';
import { buildDoc } from '../lib/search';
import { toolHref } from '../i18n';
import { categories } from '../tools/categories';
import { tools } from '../tools/registry';
import type { PaletteEntry } from '../tools/types';

const entries: PaletteEntry[] = tools.map((tool) => ({
  id: tool.id,
  href: toolHref(locale, tool),
  name: tool.name[locale],
  category: categories.find((c) => c.id === tool.category)!.name[locale],
  icon: tool.icon,
}));
const docs = tools.map(buildDoc);
```


Sustituye la línea `<Toaster client:idle transition:persist="toaster" />` por:

```astro
    <Toaster client:idle transition:persist="toaster" />
    <CommandPalette client:idle transition:persist={`palette-${locale}`} locale={locale} entries={entries} docs={docs} />
    <ShortcutsDialog client:idle transition:persist={`help-${locale}`} locale={locale} />
    <script>
      import { dispatchShortcut, matchShortcut } from '../lib/shortcuts';

      document.addEventListener('keydown', (e) => {
        if (e.defaultPrevented || document.querySelector('dialog[open]')) return;
        const action = matchShortcut(e);
        if (!action) return;
        if (action.type === 'copy') {
          const btn = document.querySelector<HTMLButtonElement>('[data-copy-main]:not(:disabled)');
          if (!btn) return;
          e.preventDefault();
          btn.click();
          return;
        }
        if (action.type === 'tab') {
          const radios = document.querySelectorAll<HTMLButtonElement>('[data-tabs-main] [role="radio"]');
          const target = radios[action.index];
          if (!target) return;
          e.preventDefault();
          target.click();
          target.focus();
          return;
        }
        e.preventDefault();
        dispatchShortcut(action);
      });
    </script>
```

- [ ] **Step 8: Verificar**

Run: `pnpm test && pnpm check && pnpm lint && pnpm build`
A mano con `pnpm preview` en `/es`: `Ctrl+K` abre la paleta (vacía hasta la Task 14, muestra el aviso «Ninguna herramienta coincide…» al escribir), Esc la cierra y el foco vuelve a donde estaba; `?` abre la ayuda; escribir en el buscador de la Home abre la paleta con esa letra; el botón de búsqueda de la sidebar y el de la cabecera móvil también la abren.

- [ ] **Step 9: Commit**

```bash
git add src
git commit -m "feat: paleta de comandos (Ctrl+K), atajos de teclado y diálogo de ayuda

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: JSON — lógica, metadatos y contenido

**Files:**
- Create: `src/tools/json/logic.ts`, `src/tools/json/logic.test.ts`, `src/tools/json/meta.ts`, `src/tools/json/strings.ts`, `src/tools/json/content.es.md`, `src/tools/json/content.en.md`
- Modify: `src/tools/registry.ts`

**Interfaces:**
- Consumes: `ToolMeta`, `Locale`.
- Produces:
  - `type Indent = '2' | '4' | 'tab'`
  - `interface JsonError { message: string; line: number | null; column: number | null }`
  - `type ParseResult = { ok: true; value: unknown } | { ok: false; error: JsonError }`
  - `parseJson(input: string): ParseResult`
  - `errorLocation(message: string, input: string): { line: number; column: number } | null`
  - `locate(input: string, position: number): { line: number; column: number }`
  - `formatJson(value: unknown, indent?: Indent = '2', sortKeys?: boolean = false): string`
  - `minifyJson(value: unknown, sortKeys?: boolean = false): string`
  - `sortKeysDeep(v: unknown): unknown`
  - `jsonPath(parent: string, key: string | number): string`
  - `jsonType(v: unknown): 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'`
  - `lineAt(input: string, line: number): string`, `lineOffset(input: string, line: number): number`
  - `byteSize(s: string): number`
  - `DEBOUNCE_THRESHOLD = 100_000`, `shouldDebounce(input: string): boolean`
  - `meta: ToolMeta` (id `json`), `strings: Record<Locale, JsonStrings>`

- [ ] **Step 1: Test (falla)**

`src/tools/json/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  DEBOUNCE_THRESHOLD,
  byteSize,
  errorLocation,
  formatJson,
  jsonPath,
  jsonType,
  lineAt,
  lineOffset,
  minifyJson,
  parseJson,
  shouldDebounce,
  sortKeysDeep,
} from './logic';

const parsed = (s: string) => {
  const r = parseJson(s);
  if (!r.ok) throw new Error('expected valid JSON');
  return r.value;
};

describe('formatJson', () => {
  it('formats with 2 spaces by default (same output as the old tool)', () => {
    expect(formatJson(parsed('{"a":1}'))).toBe('{\n  "a": 1\n}');
  });

  it('supports 4 spaces and tabs', () => {
    expect(formatJson(parsed('{"a":1}'), '4')).toBe('{\n    "a": 1\n}');
    expect(formatJson(parsed('{"a":1}'), 'tab')).toBe('{\n\t"a": 1\n}');
  });

  it('sorts keys deeply, including objects inside arrays', () => {
    const v = parsed('{"b":1,"a":{"d":1,"c":2},"list":[{"z":1,"y":2}]}');
    expect(minifyJson(v, true)).toBe('{"a":{"c":2,"d":1},"b":1,"list":[{"y":2,"z":1}]}');
    expect(sortKeysDeep([3, 1])).toEqual([3, 1]);
  });
});

describe('minifyJson', () => {
  it('removes whitespace', () => {
    expect(minifyJson(parsed('{\n  "a": 1\n}'))).toBe('{"a":1}');
  });
});

describe('parseJson', () => {
  it('accepts valid JSON, including primitives', () => {
    expect(parseJson('{"a":1}').ok).toBe(true);
    expect(parseJson('42').ok).toBe(true);
  });

  it('reports the line of a trailing comma on a later line', () => {
    const r = parseJson('{\n  "a": 1,\n}');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.line).toBe(3);
      expect(r.error.column).not.toBeNull();
      expect(r.error.message.length).toBeGreaterThan(0);
    }
  });

  it('locates an unexpected end of input', () => {
    const r = parseJson('{"a":');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.line).toBe(1);
  });
});

describe('errorLocation', () => {
  it('reads "line X column Y" messages', () => {
    expect(errorLocation('Bad thing (line 4 column 2)', '')).toEqual({ line: 4, column: 2 });
  });

  it('converts "position N" into line and column', () => {
    expect(errorLocation('Unexpected token } in JSON at position 5', 'ab\ncdef')).toEqual({
      line: 2,
      column: 3,
    });
  });

  it('returns null when the message has no location', () => {
    expect(errorLocation('Something odd', '{}')).toBeNull();
  });
});

describe('helpers', () => {
  it('builds JSONPath-like paths', () => {
    expect(jsonPath('$', 'a')).toBe('$.a');
    expect(jsonPath('$.a', 0)).toBe('$.a[0]');
    expect(jsonPath('$', 'a b')).toBe('$["a b"]');
  });

  it('names JSON types', () => {
    expect(jsonType(null)).toBe('null');
    expect(jsonType([])).toBe('array');
    expect(jsonType({})).toBe('object');
    expect(jsonType('x')).toBe('string');
    expect(jsonType(1)).toBe('number');
    expect(jsonType(true)).toBe('boolean');
  });

  it('finds lines and their offsets', () => {
    const text = 'one\ntwo\nthree';
    expect(lineAt(text, 2)).toBe('two');
    expect(lineOffset(text, 3)).toBe(8);
    expect(lineAt(text, 9)).toBe('');
  });

  it('counts UTF-8 bytes', () => {
    expect(byteSize('ñ')).toBe(2);
  });

  it('debounces only very large inputs', () => {
    expect(shouldDebounce('x'.repeat(DEBOUNCE_THRESHOLD))).toBe(false);
    expect(shouldDebounce('x'.repeat(DEBOUNCE_THRESHOLD + 1))).toBe(true);
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `pnpm test src/tools/json`
Expected: FAIL.

- [ ] **Step 3: `src/tools/json/logic.ts`**

```ts
export type Indent = '2' | '4' | 'tab';
export type JsonType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

export interface JsonError {
  message: string;
  line: number | null;
  column: number | null;
}

export type ParseResult = { ok: true; value: unknown } | { ok: false; error: JsonError };

export const DEBOUNCE_THRESHOLD = 100_000;

export function locate(input: string, position: number): { line: number; column: number } {
  const before = input.slice(0, Math.max(0, Math.min(position, input.length)));
  const lines = before.split('\n');
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

export function errorLocation(message: string, input: string): { line: number; column: number } | null {
  const lc = /line (\d+) column (\d+)/i.exec(message);
  if (lc) return { line: Number(lc[1]), column: Number(lc[2]) };
  const pos = /position (\d+)/i.exec(message);
  if (pos) return locate(input, Number(pos[1]));
  if (/unexpected end/i.test(message)) return locate(input, input.length);
  return null;
}

export function parseJson(input: string): ParseResult {
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (e) {
    const message = (e as Error).message;
    const loc = errorLocation(message, input);
    return { ok: false, error: { message, line: loc?.line ?? null, column: loc?.column ?? null } };
  }
}

export function sortKeysDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeysDeep);
  if (v !== null && typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(obj)
        .sort()
        .map((k) => [k, sortKeysDeep(obj[k])]),
    );
  }
  return v;
}

export function formatJson(value: unknown, indent: Indent = '2', sortKeys = false): string {
  const space = indent === 'tab' ? '\t' : Number(indent);
  return JSON.stringify(sortKeys ? sortKeysDeep(value) : value, null, space);
}

export function minifyJson(value: unknown, sortKeys = false): string {
  return JSON.stringify(sortKeys ? sortKeysDeep(value) : value);
}

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export function jsonPath(parent: string, key: string | number): string {
  if (typeof key === 'number') return `${parent}[${key}]`;
  return IDENTIFIER.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`;
}

export function jsonType(v: unknown): JsonType {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v as JsonType;
}

export function lineAt(input: string, line: number): string {
  return input.split('\n')[line - 1] ?? '';
}

export function lineOffset(input: string, line: number): number {
  return input
    .split('\n')
    .slice(0, Math.max(0, line - 1))
    .reduce((acc, l) => acc + l.length + 1, 0);
}

export function byteSize(s: string): number {
  return new TextEncoder().encode(s).length;
}

export function shouldDebounce(input: string): boolean {
  return input.length > DEBOUNCE_THRESHOLD;
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `pnpm test src/tools/json`
Expected: PASS. Si el test de la coma final devuelve una línea distinta de 3, imprime `r.error.message` y ajusta `errorLocation` (no el test): la coma está al final de la línea 2 y el error lo provoca el `}` de la línea 3.

- [ ] **Step 5: `src/tools/json/meta.ts` y `strings.ts`**

```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json',
  category: 'data',
  icon: 'braces',
  slug: { es: 'formateador-json', en: 'json-formatter' },
  name: { es: 'JSON', en: 'JSON' },
  title: { es: 'Formateador y validador de JSON online', en: 'JSON formatter and validator online' },
  description: {
    es: 'Formatea, valida y minifica JSON mientras escribes. Te dice la línea exacta del error y deja explorar el árbol. Todo en tu navegador.',
    en: 'Format, validate and minify JSON as you type. Shows the exact line of any error and lets you explore the tree. Runs in your browser.',
  },
  keywords: {
    es: ['formatear json', 'validar json', 'minificar json', 'json bonito', 'arbol json', 'beautify'],
    en: ['json formatter', 'json validator', 'prettify json', 'minify json', 'json viewer', 'beautify'],
  },
  tabs: { es: ['Formatear', 'Árbol'], en: ['Format', 'Tree'] },
  faq: {
    es: [
      {
        q: '¿Se envía mi JSON a algún servidor?',
        a: 'No. El formateo y la validación se hacen en tu navegador. Si activas «Recordar lo que escribo», el texto se guarda solo en este navegador.',
      },
      {
        q: '¿Por qué falla un JSON con comas al final?',
        a: 'El estándar JSON no admite comas finales ni comillas simples. La herramienta marca la línea exacta para que las quites.',
      },
    ],
    en: [
      {
        q: 'Is my JSON sent to a server?',
        a: 'No. Formatting and validation happen in your browser. If you turn on “Remember what I type”, the text is stored only in this browser.',
      },
      {
        q: 'Why does JSON with trailing commas fail?',
        a: 'The JSON standard does not allow trailing commas or single quotes. The tool points to the exact line so you can remove them.',
      },
    ],
  },
};
```

```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    mode: 'Modo',
    input: 'JSON de entrada',
    placeholder: '{"nombre": "devtools", "herramientas": 35}',
    output: 'Salida',
    pretty: 'Formateado',
    minified: 'Minificado',
    indent: 'Sangría',
    indent2: '2 espacios',
    indent4: '4 espacios',
    indentTab: 'Tabulador',
    sortKeys: 'Ordenar claves',
    result: 'Resultado',
    valid: 'JSON válido',
    errorAt: 'Error en la línea {line}, columna {column}',
    errorNoLine: 'JSON no válido',
    goToError: 'Ir a la línea del error',
    empty: 'Pega o escribe JSON y aparecerá formateado aquí.',
    treeEmpty: 'El árbol aparece cuando el JSON es válido.',
    copyPath: 'Copiar ruta',
    copyValue: 'Copiar valor',
    showMore: 'Mostrar {n} más',
    file: 'datos.json',
  },
  en: {
    mode: 'Mode',
    input: 'Input JSON',
    placeholder: '{"name": "devtools", "tools": 35}',
    output: 'Output',
    pretty: 'Pretty',
    minified: 'Minified',
    indent: 'Indentation',
    indent2: '2 spaces',
    indent4: '4 spaces',
    indentTab: 'Tab',
    sortKeys: 'Sort keys',
    result: 'Result',
    valid: 'Valid JSON',
    errorAt: 'Error on line {line}, column {column}',
    errorNoLine: 'Invalid JSON',
    goToError: 'Go to the error line',
    empty: 'Paste or type JSON and it will appear formatted here.',
    treeEmpty: 'The tree appears once the JSON is valid.',
    copyPath: 'Copy path',
    copyValue: 'Copy value',
    showMore: 'Show {n} more',
    file: 'data.json',
  },
} satisfies Record<Locale, Record<string, string>>;

export function fill(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
```

- [ ] **Step 6: Contenido SEO**

`src/tools/json/content.es.md`:
```md
## Cómo funciona

Pega o escribe JSON y la herramienta lo analiza mientras escribes. Si es válido, lo verás formateado con la sangría que elijas (2 espacios, 4 o tabulador), o minificado en una sola línea para enviarlo por una API o guardarlo en una variable de entorno.

Si hay un error, la pantalla indica la línea y la columna exactas y muestra esa línea con una marca debajo del carácter que falla. Los fallos más habituales son las comas al final de un objeto o una lista, las comillas simples y las claves sin comillas: el estándar JSON no admite ninguno de los tres.

## Ordenar claves y explorar el árbol

«Ordenar claves» ordena alfabéticamente las claves de todos los objetos, también los que están dentro de listas. Es útil para comparar dos respuestas de una API con la herramienta de diferencias.

La pestaña **Árbol** muestra el documento como una estructura plegable. Cada nodo permite copiar su ruta (por ejemplo `$.usuarios[0].email`) o su valor, lo que ahorra tiempo al escribir tests o consultas con `jq`.
```

`src/tools/json/content.en.md`:
```md
## How it works

Paste or type JSON and the tool parses it as you type. If it is valid, you get it formatted with the indentation you choose (2 spaces, 4 or tabs), or minified into a single line to send through an API or store in an environment variable.

If there is an error, the screen shows the exact line and column and prints that line with a marker under the failing character. The most common mistakes are trailing commas after the last item, single quotes and unquoted keys: standard JSON allows none of them.

## Sorting keys and exploring the tree

“Sort keys” orders the keys of every object alphabetically, including objects inside arrays. It helps when comparing two API responses with the diff tool.

The **Tree** tab shows the document as a collapsible structure. Each node lets you copy its path (for example `$.users[0].email`) or its value, which saves time when writing tests or `jq` queries.
```

- [ ] **Step 7: Registrar la herramienta**

`src/tools/registry.ts` — añade el import y rellena la lista:

```ts
import { meta as json } from './json/meta';
```

```ts
export const tools: ToolMeta[] = [json];
```

- [ ] **Step 8: Verificar**

Run: `pnpm test`
Expected: PASS, incluido `registry.test.ts`, que ahora valida la meta de JSON y sus dos `content.*.md`. `pnpm build` sigue funcionando (la página de la herramienta llega en la Task 14; mientras tanto la sidebar enlaza a una ruta que aún no existe).

- [ ] **Step 9: Commit**

```bash
git add src/tools
git commit -m "feat(json): lógica con errores localizados, metadatos y contenido SEO

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Página de herramienta (`ToolShell`) y la interfaz de JSON

**Files:**
- Create: `src/components/ToolShell.astro`, `src/components/ToolIsland.astro`, `src/pages/[locale]/[slug].astro`, `src/tools/json/Json.svelte`, `src/tools/json/JsonTree.svelte`

**Interfaces:**
- Consumes: todo el kit de UI (Tasks 7 y 8), `persistedInput`, `strings`/`fill` y la lógica de JSON (Task 13), `toggleFavorite`, `isFavorite`, `pushRecent`, `PREFS_EVENT`, `categories`, `toolHref`, `homeHref`, `t`.
- Produces:
  - `ToolShell` props `{ locale: Locale; tool: ToolMeta }`, slot por defecto = isla, slot `content` = markdown SEO.
  - `ToolIsland` props `{ id: string; locale: Locale }`: monta la isla de cada herramienta con `client:load`. **Cada herramienta nueva añade aquí una línea.**
  - DOM: `[data-favorite]` botón (`aria-pressed`), `[data-copy-main]` en el copiar principal, `[data-tabs-main]` en las pestañas de modo.

- [ ] **Step 1: `src/components/ToolShell.astro`**

```astro
---
import Icon from '../ui/Icon.svelte';
import { homeHref, t } from '../i18n';
import { categories } from '../tools/categories';
import type { Locale, ToolMeta } from '../tools/types';

interface Props {
  locale: Locale;
  tool: ToolMeta;
}
const { locale, tool } = Astro.props;
const category = categories.find((c) => c.id === tool.category)!;
const faq = tool.faq?.[locale] ?? [];
---

<header class="tool-head">
  <div class="tool-titles">
    <nav aria-label={t(locale, 'nav.breadcrumb')} class="crumbs">
      <a href={homeHref(locale)}>{t(locale, 'nav.home')}</a>
      <span aria-hidden="true">/</span>
      <span>{category.name[locale]}</span>
    </nav>
    <h1>{tool.name[locale]}</h1>
    <p class="tool-desc">{tool.description[locale]}</p>
  </div>
  <button
    type="button"
    class="fav"
    data-favorite={tool.id}
    aria-pressed="false"
    aria-label={t(locale, 'tool.favoriteAdd')}
    title={t(locale, 'tool.favoriteAdd')}
    data-label-add={t(locale, 'tool.favoriteAdd')}
    data-label-remove={t(locale, 'tool.favoriteRemove')}
  >
    <Icon name="star" />
  </button>
</header>

<slot />

<section class="prose" aria-labelledby="how-h">
  <h2 id="how-h" class="visually-hidden">{t(locale, 'tool.howItWorks')}</h2>
  <slot name="content" />
  {
    faq.length > 0 && (
      <>
        <h2>{t(locale, 'tool.faq')}</h2>
        {faq.map((f) => (
          <details>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </>
    )
  }
</section>

<script>
  import { isFavorite, PREFS_EVENT, pushRecent, toggleFavorite } from '../lib/prefs';

  function syncFavorite() {
    const btn = document.querySelector<HTMLElement>('[data-favorite]');
    if (!btn) return;
    const on = isFavorite(btn.dataset.favorite!);
    btn.setAttribute('aria-pressed', String(on));
    const label = (on ? btn.dataset.labelRemove : btn.dataset.labelAdd) ?? '';
    btn.setAttribute('aria-label', label);
    btn.title = label;
  }

  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-favorite]');
    if (btn?.dataset.favorite) toggleFavorite(btn.dataset.favorite);
  });

  window.addEventListener(PREFS_EVENT, syncFavorite);

  document.addEventListener('astro:page-load', () => {
    const id = document.querySelector<HTMLElement>('[data-tool-page]')?.dataset.toolPage;
    if (id) pushRecent(id);
    syncFavorite();
  });
</script>

<style>
  .tool-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }
  .tool-titles {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .crumbs {
    display: flex;
    gap: 8px;
    font-size: 13px;
    color: var(--text-dim);
  }
  .crumbs a {
    color: inherit;
  }
  .tool-desc {
    max-width: 62ch;
    color: var(--text-dim);
  }
  .fav {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    background: var(--raised);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text-dim);
    cursor: pointer;
    transition:
      transform 120ms ease-out,
      color 160ms;
  }
  .fav:active {
    transform: scale(0.94);
  }
  .fav[aria-pressed='true'] {
    color: var(--accent-text);
  }
  .fav[aria-pressed='true'] :global(svg) {
    fill: currentColor;
  }
  details {
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
  }
  summary {
    cursor: pointer;
    color: var(--text);
    font-weight: 600;
  }
  details p {
    margin-top: 8px;
  }
</style>
```

- [ ] **Step 2: `src/components/ToolIsland.astro`**

```astro
---
import Json from '../tools/json/Json.svelte';
import type { Locale } from '../tools/types';

interface Props {
  id: string;
  locale: Locale;
}
const { id, locale } = Astro.props;
---

{id === 'json' && <Json client:load locale={locale} />}
```

- [ ] **Step 3: `src/pages/[locale]/[slug].astro`**

```astro
---
import type { MarkdownInstance } from 'astro';
import ToolIsland from '../../components/ToolIsland.astro';
import ToolShell from '../../components/ToolShell.astro';
import AppLayout from '../../layouts/AppLayout.astro';
import { toolHref } from '../../i18n';
import { toolById, tools } from '../../tools/registry';
import { LOCALES, type Locale } from '../../tools/types';

export function getStaticPaths() {
  return LOCALES.flatMap((locale) =>
    tools.map((tool) => ({ params: { locale, slug: tool.slug[locale] }, props: { toolId: tool.id } })),
  );
}

const locale = Astro.params.locale as Locale;
const tool = toolById(Astro.props.toolId)!;
const contents = import.meta.glob<MarkdownInstance<Record<string, unknown>>>(
  '../../tools/*/content.*.md',
  { eager: true },
);
const { Content } = contents[`../../tools/${tool.id}/content.${locale}.md`];
const url = new URL(toolHref(locale, tool), Astro.site).href;

const jsonLd: Record<string, unknown>[] = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.title[locale],
    url,
    description: tool.description[locale],
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    inLanguage: locale,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  },
];
const faq = tool.faq?.[locale];
if (faq?.length) {
  jsonLd.push({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  });
}
---

<AppLayout
  locale={locale}
  title={`${tool.title[locale]} · devtools`}
  description={tool.description[locale]}
  alternates={{ es: toolHref('es', tool), en: toolHref('en', tool) }}
  jsonLd={jsonLd}
  toolId={tool.id}
>
  <ToolShell locale={locale} tool={tool}>
    <ToolIsland id={tool.id} locale={locale} />
    <Content slot="content" />
  </ToolShell>
</AppLayout>
```

(El test del registro limita `title` a 65 caracteres; con el sufijo ` · devtools` el `<title>` queda en ≤ 76, que Google aún muestra casi entero.)

- [ ] **Step 4: `src/tools/json/JsonTree.svelte`**

```svelte
<script lang="ts">
  import JsonTree from './JsonTree.svelte';
  import { copyText } from '../../lib/clipboard';
  import { toast, truncate } from '../../lib/toast';
  import type { Locale } from '../types';
  import Icon from '../../ui/Icon.svelte';
  import { jsonPath, jsonType } from './logic';
  import { fill, strings } from './strings';

  let {
    value,
    locale,
    path = '$',
    name,
    depth = 0,
  }: { value: unknown; locale: Locale; path?: string; name?: string; depth?: number } = $props();

  const PAGE = 200;
  const s = $derived(strings[locale]);
  const type = $derived(jsonType(value));
  const container = $derived(type === 'object' || type === 'array');
  const entries = $derived.by((): [string | number, unknown][] => {
    if (type === 'array') return (value as unknown[]).map((v, i) => [i, v]);
    if (type === 'object') return Object.entries(value as Record<string, unknown>);
    return [];
  });
  let open = $state(depth < 1);
  let limit = $state(PAGE);
  const shown = $derived(entries.slice(0, limit));
  const leaf = $derived(type === 'string' ? JSON.stringify(value) : String(value));

  async function copy(text: string) {
    if (await copyText(text)) toast(truncate(text));
  }
</script>

<div class="node">
  <div class="line">
    {#if container}
      <button type="button" class="toggle" aria-expanded={open} onclick={() => (open = !open)}>
        <Icon name={open ? 'chevron-down' : 'chevron-right'} size={14} />
        {#if name !== undefined}<span class="key">{name}</span>{/if}
        <span class="meta">{type === 'array' ? `[${entries.length}]` : `{${entries.length}}`}</span>
      </button>
    {:else}
      <span class="spacer"></span>
      {#if name !== undefined}<span class="key">{name}:</span>{/if}
      <span class="val {type}">{leaf}</span>
    {/if}
    <span class="actions">
      <button type="button" class="mini" aria-label="{s.copyPath} {path}" title={s.copyPath} onclick={() => copy(path)}>
        $
      </button>
      <button
        type="button"
        class="mini"
        aria-label="{s.copyValue} {path}"
        title={s.copyValue}
        onclick={() => copy(container ? JSON.stringify(value, null, 2) : type === 'string' ? String(value) : leaf)}
      >
        <Icon name="copy" size={13} />
      </button>
    </span>
  </div>
  {#if container && open}
    <div class="children">
      {#each shown as [k, v] (k)}
        <JsonTree value={v} {locale} path={jsonPath(path, k)} name={String(k)} depth={depth + 1} />
      {/each}
      {#if entries.length > limit}
        <button type="button" class="more" onclick={() => (limit += PAGE)}>
          {fill(s.showMore, { n: Math.min(PAGE, entries.length - limit) })}
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .node {
    font: 14px/1.6 var(--font-mono);
  }
  .line {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 30px;
    border-radius: 6px;
  }
  .line:hover .actions,
  .line:focus-within .actions {
    opacity: 1;
  }
  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0;
    background: none;
    border: 0;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  .spacer {
    width: 14px;
    flex-shrink: 0;
  }
  .key {
    color: var(--disp-text);
  }
  .meta {
    color: var(--disp-dim);
  }
  .val {
    color: var(--disp-text);
    overflow-wrap: anywhere;
  }
  .val.string {
    color: var(--ok);
  }
  .val.null,
  .val.boolean {
    color: var(--disp-dim);
  }
  .actions {
    display: inline-flex;
    gap: 4px;
    margin-left: auto;
    opacity: 0;
    transition: opacity 120ms;
  }
  @media (hover: none) {
    .actions {
      opacity: 1;
    }
  }
  .mini {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 6px;
    background: transparent;
    border: 1px solid var(--disp-line);
    border-radius: 6px;
    color: var(--disp-dim);
    font: 600 12px var(--font-mono);
    cursor: pointer;
  }
  .children {
    margin-left: 7px;
    padding-left: 12px;
    border-left: 1px solid var(--disp-line);
  }
  .more {
    margin: 4px 0;
    background: none;
    border: 0;
    color: var(--disp-dim);
    text-decoration: underline;
    cursor: pointer;
    font: inherit;
  }
</style>
```

- [ ] **Step 5: `src/tools/json/Json.svelte`**

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import JsonTree from './JsonTree.svelte';
  import {
    byteSize,
    formatJson,
    lineAt,
    lineOffset,
    minifyJson,
    parseJson,
    shouldDebounce,
    type Indent,
    type ParseResult,
  } from './logic';
  import { meta } from './meta';
  import { fill, strings } from './strings';

  let { locale }: { locale: Locale } = $props();

  const s = $derived(strings[locale]);
  const input = persistedInput('json', '', meta.rememberInput ?? true);

  let tab: 'format' | 'tree' = $state('format');
  let output: 'pretty' | 'minified' = $state('pretty');
  let indent: Indent = $state('2');
  let sortKeys = $state(false);
  let result: ParseResult | null = $state(null);
  let textarea: HTMLTextAreaElement | undefined = $state();

  $effect(() => {
    const text = input.value;
    if (!text.trim()) {
      result = null;
      return;
    }
    if (!shouldDebounce(text)) {
      result = parseJson(text);
      return;
    }
    const timer = setTimeout(() => (result = parseJson(text)), 300);
    return () => clearTimeout(timer);
  });

  const formatted = $derived(
    result?.ok
      ? output === 'pretty'
        ? formatJson(result.value, indent, sortKeys)
        : minifyJson(result.value, sortKeys)
      : '',
  );
  const ledState = $derived(!result ? 'idle' : result.ok ? 'ok' : 'bad');
  const ledLabel = $derived.by(() => {
    if (!result) return t(locale, 'led.idle');
    if (result.ok) return s.valid;
    const { line, column } = result.error;
    return line ? fill(s.errorAt, { line, column: column ?? 1 }) : s.errorNoLine;
  });
  const excerpt = $derived.by(() => {
    if (!result || result.ok || !result.error.line) return '';
    const text = lineAt(input.value, result.error.line);
    const caret = ' '.repeat(Math.max(0, (result.error.column ?? 1) - 1)) + '^';
    return `${result.error.line} | ${text}\n${' '.repeat(String(result.error.line).length + 3)}${caret}`;
  });

  function goToError() {
    if (!result || result.ok || !result.error.line || !textarea) return;
    const start = lineOffset(input.value, result.error.line);
    textarea.focus();
    textarea.setSelectionRange(start, start + lineAt(input.value, result.error.line).length);
  }

  function download() {
    const url = URL.createObjectURL(new Blob([formatted], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = s.file;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'format', label: meta.tabs![locale][0] },
      { value: 'tree', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    <Field id="json-input" label={s.input}>
      {#snippet children({ describedby })}
        <TextArea
          id="json-input"
          bind:value={input.value}
          bind:element={textarea}
          placeholder={s.placeholder}
          {describedby}
          invalid={ledState === 'bad'}
          rows={10}
        />
      {/snippet}
    </Field>

    {#if tab === 'format'}
      <div class="row">
        <Segmented
          label={s.output}
          options={[
            { value: 'pretty', label: s.pretty },
            { value: 'minified', label: s.minified },
          ]}
          bind:value={output}
        />
        {#if output === 'pretty'}
          <label class="inline-label" for="json-indent">{s.indent}</label>
          <Select
            id="json-indent"
            bind:value={indent}
            options={[
              { value: '2', label: s.indent2 },
              { value: '4', label: s.indent4 },
              { value: 'tab', label: s.indentTab },
            ]}
          />
        {/if}
        <Toggle bind:checked={sortKeys} label={s.sortKeys} />
      </div>

      <Display live label={s.result}>
        {#snippet head()}
          <Led state={ledState} label={ledLabel} />
          {#if formatted}<span>{byteSize(formatted).toLocaleString(locale)} B</span>{/if}
        {/snippet}
        {#if excerpt}
          <pre class="display-code">{excerpt}</pre>
          <p class="display-note">{result && !result.ok ? result.error.message : ''}</p>
        {:else if formatted}
          <pre class="display-code">{formatted}</pre>
        {:else}
          <p class="display-note">{s.empty}</p>
        {/if}
      </Display>

      <div class="row">
        <CopyButton main value={formatted} {locale} />
        <Button variant="ghost" disabled={!formatted} onclick={download}>{t(locale, 'ui.download')}</Button>
        {#if excerpt}<Button variant="ghost" onclick={goToError}>{s.goToError}</Button>{/if}
        <Button variant="ghost" onclick={() => (input.value = '')} disabled={!input.value}>{t(locale, 'ui.clear')}</Button>
      </div>
    {:else}
      <Display label={meta.tabs![locale][1]}>
        {#if result?.ok}
          <JsonTree value={result.value} {locale} />
        {:else}
          <p class="display-note">{s.treeEmpty}</p>
        {/if}
      </Display>
    {/if}

    <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
  </div>
</div>

<style>
  .inline-label {
    align-self: center;
    font-size: 13px;
    font-weight: 600;
  }
</style>
```

- [ ] **Step 6: Verificar**

Run: `pnpm test && pnpm check && pnpm lint && pnpm build`
Expected: todo en verde y existen `dist/es/formateador-json/index.html` y `dist/en/json-formatter/index.html`.

A mano con `pnpm preview`:
1. En `/es/formateador-json`, al escribir `{"b":1,"a":[1,2]}` aparece formateado al instante y el LED se pone verde.
2. `{\n "a": 1,\n}` → LED naranja, «Error en la línea 3…», extracto con `^` e «Ir a la línea del error» selecciona la línea 3.
3. Pulsar `c` fuera del textarea copia el resultado y sale el aviso; `2` cambia a la pestaña Árbol.
4. La estrella añade a favoritos: aparece el grupo «Favoritos» en la sidebar; al quitarla, desaparece.
5. Recarga: el JSON sigue ahí (recordar activado). Desactiva el toggle, recarga: vacío.
6. `ES → EN` lleva a `/en/json-formatter`.
7. Pega un JSON de ~5 MB (`JSON.stringify(Array.from({length: 60000}, (_, i) => ({i, name: 'item ' + i, tags: ['a','b']})))` en la consola y copia el resultado): la página responde mientras escribes y el árbol muestra «Mostrar 200 más».

- [ ] **Step 7: Commit**

```bash
git add src
git commit -m "feat(json): página de herramienta con formateo en vivo, errores localizados y árbol

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: UUID — v4, v7, ULID y NanoID

**Files:**
- Create: `src/tools/uuid/logic.ts`, `src/tools/uuid/logic.test.ts`, `src/tools/uuid/meta.ts`, `src/tools/uuid/strings.ts`, `src/tools/uuid/content.es.md`, `src/tools/uuid/content.en.md`, `src/tools/uuid/Uuid.svelte`
- Modify: `src/tools/registry.ts`, `src/components/ToolIsland.astro`

**Interfaces:**
- Consumes: kit de UI, `persistedInput`, `fill` (de `src/tools/json/strings.ts`; se mueve a un módulo común en el Step 1).
- Produces:
  - `type IdKind = 'v4' | 'v7' | 'ulid' | 'nanoid'`, `MAX_COUNT = 500`
  - `type RandomBytes = (n: number) => Uint8Array`, `randomBytes: RandomBytes`
  - `uuidV4(rand?): string`, `uuidV7(now?: number, rand?): string`, `ulid(now?: number, rand?): string`, `nanoid(size?: number = 21, alphabet?: string, rand?): string`
  - `NANOID_ALPHABETS: { urlsafe: string; alnum: string; hex: string; numbers: string }`
  - `formatId(id: string, kind: IdKind, opts: { uppercase: boolean; dashes: boolean }): string`
  - `generate(kind: IdKind, count: number, opts: { size: number; alphabet: string }): string[]`
  - `type Detection = { kind: 'uuid'; version: number; date: Date | null } | { kind: 'nil' } | { kind: 'max' } | { kind: 'ulid'; date: Date } | { kind: 'invalid' }`
  - `detectId(raw: string): Detection`
  - `validateUUID(uuid: string): boolean` y `formatUUID(uuid: string, withDashes: boolean): string` (de la versión antigua, con sus tests)
  - `fill(s, vars)` pasa a vivir en `src/i18n/fill.ts`

- [ ] **Step 1: Mover `fill` a un módulo común**

Crea `src/i18n/fill.ts`:
```ts
export function fill(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
```

En `src/tools/json/strings.ts` borra la función `fill` y añade al principio `export { fill } from '../../i18n/fill';`. Así `Json.svelte` y `JsonTree.svelte` siguen importando `fill` de `./strings` sin cambios.

Run: `pnpm test && pnpm check` → verde.

- [ ] **Step 2: Test (falla)**

`src/tools/uuid/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  MAX_COUNT,
  NANOID_ALPHABETS,
  detectId,
  formatId,
  formatUUID,
  generate,
  nanoid,
  ulid,
  uuidV4,
  uuidV7,
  validateUUID,
} from './logic';

const zeros = (n: number) => new Uint8Array(n);
const ones = (n: number) => new Uint8Array(n).fill(0xff);

describe('uuidV4', () => {
  it('sets version 4 and the RFC variant', () => {
    expect(uuidV4(zeros)).toBe('00000000-0000-4000-8000-000000000000');
    expect(uuidV4()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});

describe('uuidV7', () => {
  it('encodes the millisecond timestamp in the first 48 bits (RFC 9562 example)', () => {
    expect(uuidV7(0x017f22e279b0, zeros)).toBe('017f22e2-79b0-7000-8000-000000000000');
  });

  it('is detected as v7 with its date', () => {
    const d = detectId('017F22E2-79B0-7CC3-98C4-DC0C0C07398F');
    expect(d).toEqual({ kind: 'uuid', version: 7, date: new Date('2022-02-22T19:22:22.000Z') });
  });
});

describe('ulid', () => {
  it('encodes time in Crockford base32 (spec example timestamp)', () => {
    expect(ulid(1469918176385, zeros)).toBe('01ARYZ6S41' + '0'.repeat(16));
  });

  it('uses all 80 random bits', () => {
    expect(ulid(0, ones).slice(10)).toBe('Z'.repeat(16));
  });

  it('is detected with its date', () => {
    expect(detectId('01ARYZ6S41TSV4RRFFQ69G5FAV')).toEqual({ kind: 'ulid', date: new Date(1469918176385) });
  });
});

describe('nanoid', () => {
  it('defaults to 21 url-safe characters', () => {
    const id = nanoid();
    expect(id).toHaveLength(21);
    for (const ch of id) expect(NANOID_ALPHABETS.urlsafe).toContain(ch);
  });

  it('respects size and custom alphabet', () => {
    expect(nanoid(50, 'ab')).toMatch(/^[ab]{50}$/);
    expect(nanoid(4, NANOID_ALPHABETS.urlsafe, zeros)).toBe('AAAA');
  });
});

describe('formatId', () => {
  it('toggles dashes and case for UUIDs only', () => {
    const id = '017f22e2-79b0-7000-8000-000000000000';
    expect(formatId(id, 'v7', { uppercase: true, dashes: false })).toBe('017F22E279B070008000000000000000');
    expect(formatId('01ARYZ6S41TSV4RRFFQ69G5FAV', 'ulid', { uppercase: false, dashes: false })).toBe(
      '01ARYZ6S41TSV4RRFFQ69G5FAV',
    );
  });
});

describe('generate', () => {
  const opts = { size: 21, alphabet: NANOID_ALPHABETS.urlsafe };

  it('clamps the count between 1 and MAX_COUNT', () => {
    expect(generate('v4', 0, opts)).toHaveLength(1);
    expect(generate('v4', 99999, opts)).toHaveLength(MAX_COUNT);
  });

  it('returns unique ids', () => {
    const ids = generate('v7', 200, opts);
    expect(new Set(ids).size).toBe(200);
  });
});

describe('detectId', () => {
  it('recognises nil, max, compact and invalid values', () => {
    expect(detectId('00000000-0000-0000-0000-000000000000')).toEqual({ kind: 'nil' });
    expect(detectId('ffffffff-ffff-ffff-ffff-ffffffffffff')).toEqual({ kind: 'max' });
    expect(detectId('550e8400e29b41d4a716446655440000')).toEqual({ kind: 'uuid', version: 4, date: null });
    expect(detectId('550e8400-e29b-41d4-c716-446655440000')).toEqual({ kind: 'invalid' });
    expect(detectId('hello')).toEqual({ kind: 'invalid' });
    expect(detectId('  550e8400-e29b-41d4-a716-446655440000  ').kind).toBe('uuid');
  });
});

describe('legacy helpers', () => {
  it('validates UUIDs like before', () => {
    expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(validateUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    expect(validateUUID('not-a-uuid')).toBe(false);
    expect(validateUUID('')).toBe(false);
    expect(validateUUID('550e8400e29b41d4a716446655440000')).toBe(false);
  });

  it('formats UUIDs with and without dashes like before', () => {
    expect(formatUUID('550e8400-e29b-41d4-a716-446655440000', false)).toBe('550e8400e29b41d4a716446655440000');
    expect(formatUUID('550e8400e29b41d4a716446655440000', true)).toBe('550e8400-e29b-41d4-a716-446655440000');
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/uuid`
Expected: FAIL.

- [ ] **Step 4: `src/tools/uuid/logic.ts`**

```ts
export type IdKind = 'v4' | 'v7' | 'ulid' | 'nanoid';
export type RandomBytes = (n: number) => Uint8Array;
export type Detection =
  | { kind: 'uuid'; version: number; date: Date | null }
  | { kind: 'nil' }
  | { kind: 'max' }
  | { kind: 'ulid'; date: Date }
  | { kind: 'invalid' };

export const MAX_COUNT = 500;

export const NANOID_ALPHABETS = {
  urlsafe: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-',
  alnum: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  hex: '0123456789abcdef',
  numbers: '0123456789',
} as const;

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export const randomBytes: RandomBytes = (n) => crypto.getRandomValues(new Uint8Array(n));

const toHex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
const withDashes = (h: string) =>
  `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;

export function uuidV4(rand: RandomBytes = randomBytes): string {
  const b = rand(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  return withDashes(toHex(b));
}

export function uuidV7(now: number = Date.now(), rand: RandomBytes = randomBytes): string {
  const b = new Uint8Array(16);
  let t = now;
  for (let i = 5; i >= 0; i--) {
    b[i] = t % 256;
    t = Math.floor(t / 256);
  }
  const r = rand(10);
  b[6] = 0x70 | (r[0] & 0x0f);
  b[7] = r[1];
  b[8] = 0x80 | (r[2] & 0x3f);
  b.set(r.subarray(3, 10), 9);
  return withDashes(toHex(b));
}

export function ulid(now: number = Date.now(), rand: RandomBytes = randomBytes): string {
  let t = now;
  let time = '';
  for (let i = 0; i < 10; i++) {
    time = CROCKFORD[t % 32] + time;
    t = Math.floor(t / 32);
  }
  let bits = 0;
  let value = 0;
  let random = '';
  for (const byte of rand(10)) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      random += CROCKFORD[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
    value &= (1 << bits) - 1;
  }
  return time + random;
}

export function nanoid(
  size = 21,
  alphabet: string = NANOID_ALPHABETS.urlsafe,
  rand: RandomBytes = randomBytes,
): string {
  if (alphabet.length < 2 || alphabet.length > 256) throw new RangeError('Alphabet must have 2-256 symbols');
  const mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1;
  const step = Math.ceil((1.6 * mask * size) / alphabet.length);
  let id = '';
  for (;;) {
    const bytes = rand(step);
    for (let i = 0; i < step; i++) {
      const idx = bytes[i] & mask;
      if (idx < alphabet.length) {
        id += alphabet[idx];
        if (id.length === size) return id;
      }
    }
  }
}

export function formatId(id: string, kind: IdKind, opts: { uppercase: boolean; dashes: boolean }): string {
  if (kind !== 'v4' && kind !== 'v7') return id;
  const s = opts.dashes ? id : id.replace(/-/g, '');
  return opts.uppercase ? s.toUpperCase() : s.toLowerCase();
}

export function generate(kind: IdKind, count: number, opts: { size: number; alphabet: string }): string[] {
  const n = Math.min(MAX_COUNT, Math.max(1, Math.floor(count) || 1));
  const make = {
    v4: () => uuidV4(),
    v7: () => uuidV7(),
    ulid: () => ulid(),
    nanoid: () => nanoid(opts.size, opts.alphabet),
  }[kind];
  return Array.from({ length: n }, make);
}

function ulidTime(s: string): number {
  let t = 0;
  for (const ch of s.slice(0, 10).toUpperCase()) t = t * 32 + CROCKFORD.indexOf(ch);
  return t;
}

const DASHED = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function detectId(raw: string): Detection {
  const s = raw.trim();
  const compact = s.replace(/-/g, '');
  if (/^[0-9a-f]{32}$/i.test(compact) && (s.length === 32 || DASHED.test(s))) {
    if (/^0+$/.test(compact)) return { kind: 'nil' };
    if (/^f+$/i.test(compact)) return { kind: 'max' };
    const version = parseInt(compact[12], 16);
    if (version < 1 || version > 8 || !/^[89ab]$/i.test(compact[16])) return { kind: 'invalid' };
    const date = version === 7 ? new Date(parseInt(compact.slice(0, 12), 16)) : null;
    return { kind: 'uuid', version, date };
  }
  if (/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i.test(s)) return { kind: 'ulid', date: new Date(ulidTime(s)) };
  return { kind: 'invalid' };
}

export function validateUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export function formatUUID(uuid: string, withDashesFlag: boolean): string {
  const clean = uuid.replace(/-/g, '');
  if (!/^[0-9a-f]{32}$/i.test(clean)) return uuid;
  return withDashesFlag ? withDashes(clean) : clean;
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/uuid`
Expected: PASS.

- [ ] **Step 6: `meta.ts`, `strings.ts` y contenido**

`src/tools/uuid/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'uuid',
  category: 'gen',
  icon: 'fingerprint',
  slug: { es: 'generador-uuid', en: 'uuid-generator' },
  name: { es: 'UUID, ULID y NanoID', en: 'UUID, ULID & NanoID' },
  title: { es: 'Generador de UUID v4 y v7, ULID y NanoID', en: 'UUID v4 and v7, ULID and NanoID generator' },
  description: {
    es: 'Genera hasta 500 UUID v4 o v7, ULID o NanoID de golpe y comprueba cualquier identificador: versión, validez y fecha que lleva dentro.',
    en: 'Generate up to 500 UUID v4 or v7, ULID or NanoID at once and check any identifier: version, validity and the date it carries.',
  },
  keywords: {
    es: ['uuid', 'guid', 'uuid v7', 'ulid', 'nanoid', 'identificador unico', 'validar uuid'],
    en: ['uuid', 'guid', 'uuid v7', 'ulid', 'nanoid', 'unique id', 'validate uuid'],
  },
  tabs: { es: ['Generar', 'Validar'], en: ['Generate', 'Validate'] },
};
```

`src/tools/uuid/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    mode: 'Modo',
    kind: 'Tipo',
    count: 'Cantidad',
    uppercase: 'Mayúsculas',
    dashes: 'Con guiones',
    size: 'Longitud',
    alphabet: 'Alfabeto',
    urlsafe: 'URL seguro (A-Z a-z 0-9 _ -)',
    alnum: 'Alfanumérico',
    hex: 'Hexadecimal',
    numbers: 'Solo números',
    result: 'Identificadores generados',
    copyAll: 'Copiar todos',
    file: 'identificadores.txt',
    input: 'Identificador',
    placeholder: 'Pega un UUID o un ULID',
    waiting: 'Pega un identificador y se analiza al momento.',
    uuid: 'UUID versión {v}',
    nil: 'UUID nulo (todo ceros)',
    max: 'UUID máximo (todo F)',
    ulid: 'ULID',
    invalid: 'No es un UUID ni un ULID válido',
    invalidHint: 'Un UUID tiene 32 cifras hexadecimales (con o sin guiones) y un ULID, 26 caracteres en base32.',
    created: 'Creado el {date}',
    noDate: 'Esta versión no guarda la fecha de creación.',
    version: 'Versión',
    kindLabel: 'Tipo',
  },
  en: {
    mode: 'Mode',
    kind: 'Type',
    count: 'Count',
    uppercase: 'Uppercase',
    dashes: 'With dashes',
    size: 'Length',
    alphabet: 'Alphabet',
    urlsafe: 'URL-safe (A-Z a-z 0-9 _ -)',
    alnum: 'Alphanumeric',
    hex: 'Hexadecimal',
    numbers: 'Numbers only',
    result: 'Generated identifiers',
    copyAll: 'Copy all',
    file: 'identifiers.txt',
    input: 'Identifier',
    placeholder: 'Paste a UUID or a ULID',
    waiting: 'Paste an identifier and it is analysed right away.',
    uuid: 'UUID version {v}',
    nil: 'Nil UUID (all zeros)',
    max: 'Max UUID (all F)',
    ulid: 'ULID',
    invalid: 'Not a valid UUID or ULID',
    invalidHint: 'A UUID has 32 hex digits (with or without dashes) and a ULID has 26 base32 characters.',
    created: 'Created on {date}',
    noDate: 'This version does not store a creation date.',
    version: 'Version',
    kindLabel: 'Type',
  },
} satisfies Record<Locale, Record<string, string>>;
```

`src/tools/uuid/content.es.md`:
```md
## ¿Qué identificador elegir?

**UUID v4** es el clásico: 122 bits aleatorios, sin orden. Sirve para casi todo, pero como claves primarias en bases de datos fragmenta los índices porque cada valor cae en un sitio al azar.

**UUID v7** guarda la fecha en milisegundos en los primeros 48 bits, así que los identificadores nuevos quedan ordenados en el tiempo. Es la opción recomendada hoy para claves primarias: mantiene la unicidad de un UUID y los índices crecen al final, como con un autoincremental.

**ULID** tiene la misma idea que v7, pero en 26 caracteres en base32 (sin letras ambiguas como I, L, O o U). Es más corto y fácil de leer en URLs y logs.

**NanoID** es un identificador aleatorio corto y configurable: eliges longitud y alfabeto. Con 21 caracteres URL-safe tiene una probabilidad de colisión parecida a la de un UUID v4.

## Validar

La pestaña Validar reconoce UUID de cualquier versión (con o sin guiones, en mayúsculas o minúsculas), el UUID nulo y el máximo, y los ULID. En v7 y ULID muestra la fecha exacta en la que se creó el identificador.
```

`src/tools/uuid/content.en.md`:
```md
## Which identifier should you pick?

**UUID v4** is the classic: 122 random bits, no order. It works almost everywhere, but as a database primary key it fragments indexes because every value lands in a random place.

**UUID v7** stores the time in milliseconds in its first 48 bits, so new identifiers are ordered by time. It is today’s recommended choice for primary keys: it keeps UUID uniqueness while indexes grow at the end, like an auto-increment.

**ULID** follows the same idea as v7 in 26 base32 characters (without ambiguous letters such as I, L, O or U). It is shorter and easier to read in URLs and logs.

**NanoID** is a short, configurable random identifier: you choose the length and alphabet. With 21 URL-safe characters its collision probability is similar to a UUID v4.

## Validate

The Validate tab recognises UUIDs of any version (with or without dashes, upper or lower case), the nil and max UUIDs, and ULIDs. For v7 and ULID it shows the exact date the identifier was created.
```

- [ ] **Step 7: `src/tools/uuid/Uuid.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { fill } from '../../i18n/fill';
  import { t } from '../../i18n';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { detectId, formatId, generate, MAX_COUNT, NANOID_ALPHABETS, type IdKind } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  type AlphabetKey = keyof typeof NANOID_ALPHABETS;
  let tab: 'generate' | 'validate' = $state('generate');
  let kind: IdKind = $state('v4');
  let count = $state(5);
  let uppercase = $state(false);
  let dashes = $state(true);
  let size = $state(21);
  let alphabet: AlphabetKey = $state('urlsafe');
  let raw: string[] = $state([]);
  const check = persistedInput('uuid', '', true);

  const shown = $derived(raw.map((id) => formatId(id, kind, { uppercase, dashes })));
  const isUuid = $derived(kind === 'v4' || kind === 'v7');

  function regenerate() {
    raw = generate(kind, count, { size, alphabet: NANOID_ALPHABETS[alphabet] });
  }

  onMount(regenerate);

  const detection = $derived(check.value.trim() ? detectId(check.value) : null);
  const ledState = $derived(!detection ? 'idle' : detection.kind === 'invalid' ? 'bad' : 'ok');
  const summary = $derived.by(() => {
    if (!detection) return t(locale, 'led.idle');
    switch (detection.kind) {
      case 'uuid':
        return fill(s.uuid, { v: detection.version });
      case 'nil':
        return s.nil;
      case 'max':
        return s.max;
      case 'ulid':
        return s.ulid;
      default:
        return s.invalid;
    }
  });
  const dateText = $derived.by(() => {
    if (!detection || (detection.kind !== 'uuid' && detection.kind !== 'ulid')) return '';
    if (!detection.date) return s.noDate;
    const d = detection.date;
    return fill(s.created, {
      date: `${d.toLocaleString(locale, { dateStyle: 'long', timeStyle: 'medium' })} (${d.toISOString()})`,
    });
  });

  function download() {
    const url = URL.createObjectURL(new Blob([shown.join('\n')], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = s.file;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'generate', label: meta.tabs![locale][0] },
      { value: 'validate', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    {#if tab === 'generate'}
      <div class="row">
        <div class="stack tight">
          <span class="label">{s.kind}</span>
          <Segmented
            label={s.kind}
            options={[
              { value: 'v4', label: 'UUID v4' },
              { value: 'v7', label: 'UUID v7' },
              { value: 'ulid', label: 'ULID' },
              { value: 'nanoid', label: 'NanoID' },
            ]}
            bind:value={kind}
            onchange={regenerate}
          />
        </div>
        <Field id="uuid-count" label={s.count}>
          {#snippet children()}
            <NumberInput id="uuid-count" bind:value={count} min={1} max={MAX_COUNT} />
          {/snippet}
        </Field>
        <Button variant="primary" icon="refresh-cw" onclick={regenerate}>{t(locale, 'ui.generate')}</Button>
      </div>

      <div class="row">
        {#if isUuid}
          <Toggle bind:checked={uppercase} label={s.uppercase} />
          <Toggle bind:checked={dashes} label={s.dashes} />
        {:else if kind === 'nanoid'}
          <Field id="nanoid-size" label={s.size}>
            {#snippet children()}
              <NumberInput id="nanoid-size" bind:value={size} min={2} max={64} />
            {/snippet}
          </Field>
          <Field id="nanoid-alphabet" label={s.alphabet}>
            {#snippet children()}
              <Select
                id="nanoid-alphabet"
                bind:value={alphabet}
                options={[
                  { value: 'urlsafe', label: s.urlsafe },
                  { value: 'alnum', label: s.alnum },
                  { value: 'hex', label: s.hex },
                  { value: 'numbers', label: s.numbers },
                ]}
              />
            {/snippet}
          </Field>
          <Button variant="secondary" onclick={regenerate}>{t(locale, 'ui.generate')}</Button>
        {/if}
      </div>

      <Display label={s.result}>
        <div class="display-rows">
          {#each shown as id, i (i)}
            <div class="display-row">
              <span>{id}</span>
              <CopyButton value={id} {locale} compact />
            </div>
          {/each}
        </div>
      </Display>

      <div class="row">
        <CopyButton main value={shown.join('\n')} {locale} label={s.copyAll} />
        <Button variant="ghost" onclick={download} disabled={shown.length === 0}>{t(locale, 'ui.download')}</Button>
      </div>
    {:else}
      <Field id="uuid-check" label={s.input}>
        {#snippet children({ describedby })}
          <input
            id="uuid-check"
            class="control mono"
            type="text"
            autocomplete="off"
            spellcheck="false"
            placeholder={s.placeholder}
            aria-describedby={describedby}
            aria-invalid={ledState === 'bad'}
            bind:value={check.value}
          />
        {/snippet}
      </Field>
      <Display live label={s.input}>
        {#snippet head()}<Led state={ledState} label={summary} />{/snippet}
        {#if detection && detection.kind !== 'invalid'}
          <div class="display-value">{check.value.trim()}</div>
          {#if dateText}<p class="display-note">{dateText}</p>{/if}
        {:else if detection}
          <p class="display-note">{s.invalidHint}</p>
        {:else}
          <p class="display-note">{s.waiting}</p>
        {/if}
      </Display>
      <div class="row">
        <CopyButton main value={check.value.trim()} {locale} />
        <Button variant="ghost" onclick={() => (check.value = '')} disabled={!check.value}>{t(locale, 'ui.clear')}</Button>
      </div>
      <Toggle bind:checked={check.remember} label={t(locale, 'tool.remember')} />
    {/if}
  </div>
</div>

<style>
  .tight {
    gap: 8px;
  }
  .label {
    font-size: 13px;
    font-weight: 600;
  }
</style>
```

- [ ] **Step 8: Registrar y montar**

`src/tools/registry.ts`:
```ts
import { meta as json } from './json/meta';
import { meta as uuid } from './uuid/meta';
```
```ts
export const tools: ToolMeta[] = [json, uuid];
```

`src/components/ToolIsland.astro`: añade el import y la línea:
```astro
import Uuid from '../tools/uuid/Uuid.svelte';
```
```astro
{id === 'uuid' && <Uuid client:load locale={locale} />}
```

- [ ] **Step 9: Verificar**

Run: `pnpm test && pnpm check && pnpm lint && pnpm build`
A mano en `/es/generador-uuid`: se generan 5 UUID v4 al cargar; cambiar a v7 regenera; mayúsculas y guiones cambian la lista sin regenerar; NanoID muestra longitud y alfabeto; «Copiar todos» con `c`; Validar con `017F22E2-79B0-7CC3-98C4-DC0C0C07398F` muestra «UUID versión 7» y la fecha 22 de febrero de 2022.

- [ ] **Step 10: Commit**

```bash
git add src
git commit -m "feat(uuid): UUID v4 y v7, ULID y NanoID, validación con versión y fecha

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16: `robots.txt` e imagen Open Graph

**Files:**
- Create: `public/robots.txt`, `scripts/og.html`, `scripts/og.mjs`, `public/og.png` (generada)
- Modify: `package.json` (script `og`), `eslint.config.js` (nada: `scripts/` usa globals de node ya declarados)

**Interfaces:**
- Produces: `/robots.txt`, `/og.png` (1200×630) referenciada por `SeoHead`.

- [ ] **Step 1: `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://devtools.alvarotc.com/sitemap-index.xml
```

- [ ] **Step 2: `scripts/og.html`**

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="../node_modules/@fontsource-variable/unbounded/index.css" />
    <link rel="stylesheet" href="../node_modules/@fontsource-variable/instrument-sans/index.css" />
    <link rel="stylesheet" href="../node_modules/@fontsource/ibm-plex-mono/500.css" />
    <style>
      body {
        margin: 0;
        width: 1200px;
        height: 630px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-sizing: border-box;
        padding: 72px 80px;
        background: #161719;
        color: #edece8;
        font-family: 'Instrument Sans Variable', sans-serif;
      }
      h1 {
        margin: 0;
        font: 700 96px/1 'Unbounded Variable', sans-serif;
        letter-spacing: -0.04em;
      }
      p {
        margin: 20px 0 0;
        font-size: 32px;
        color: #a09f9b;
        max-width: 900px;
      }
      .screen {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 28px 32px;
        background: #0e0f10;
        border: 1px solid #26272b;
        border-radius: 14px;
        box-shadow: inset 0 2px 10px rgb(0 0 0 / 0.6);
        font: 500 34px 'IBM Plex Mono', monospace;
        letter-spacing: 0.06em;
        color: #ffc266;
      }
      .led {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #2bd46b;
        box-shadow: 0 0 14px #2bd46b;
      }
      .accent {
        width: 120px;
        height: 12px;
        background: #ff5a1f;
        border-radius: 999px;
      }
    </style>
  </head>
  <body>
    <div>
      <div class="accent"></div>
      <h1 style="margin-top: 36px">devtools</h1>
      <p>JSON, UUID, JWT, Base64, hashes… Todo en tu navegador · Everything in your browser.</p>
    </div>
    <div class="screen"><span class="led"></span>devtools.alvarotc.com</div>
  </body>
</html>
```

- [ ] **Step 3: `scripts/og.mjs`**

```js
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const html = fileURLToPath(new URL('./og.html', import.meta.url));
const out = fileURLToPath(new URL('../public/og.png', import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`file://${html}`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out });
await browser.close();
console.log(`OG image written to ${out}`);
```

`package.json`, dentro de `scripts`, añade:
```json
    "og": "node scripts/og.mjs"
```

- [ ] **Step 4: Generar y comprobar**

```bash
pnpm exec playwright install chromium
pnpm og
```
Expected: `public/og.png` de 1200×630 (compruébalo con `file public/og.png`). Ábrela y mira que las tres fuentes se han cargado (título en Unbounded, dominio en mono).

- [ ] **Step 5: Verificar build**

Run: `pnpm build && ls dist/robots.txt dist/og.png dist/sitemap-index.xml && grep -c "<loc>" dist/sitemap-0.xml`
Expected: los tres archivos existen y el sitemap tiene 7 URLs (`/`, `/es`, `/en` y 2 herramientas × 2 idiomas). `/404` **no** debe aparecer.

- [ ] **Step 6: Commit**

```bash
git add public scripts package.json
git commit -m "feat: robots.txt e imagen Open Graph generada con Playwright

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 17: Tests e2e con Playwright y CI

**Files:**
- Create: `playwright.config.ts`, `e2e/smoke.spec.ts`
- Modify: `.github/workflows/ci.yml`, `package.json`

**Interfaces:**
- Consumes: el DOM documentado en las Tasks 9–15.

- [ ] **Step 1: `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

const PORT = 4322;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'on-first-retry', locale: 'es-ES' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm exec astro preview --port ${PORT} --ignore-lock`,
    url: `http://localhost:${PORT}/es`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

- [ ] **Step 2: `e2e/smoke.spec.ts`**

```ts
import { expect, test, type Page } from '@playwright/test';

async function skipBoot(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
}

test.describe('routing', () => {
  test('root redirects to the browser language', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'en-US' });
    const page = await ctx.newPage();
    await skipBoot(page);
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
    await ctx.close();
  });

  test('old #hash links land on the new tool page', async ({ page }) => {
    await skipBoot(page);
    await page.goto('/#json');
    await expect(page).toHaveURL(/\/es\/formateador-json$/);
  });

  test('old links to tools not migrated yet land on the home page', async ({ page }) => {
    await skipBoot(page);
    await page.goto('/#number-base');
    await expect(page).toHaveURL(/\/es$/);
  });
});

test.describe('home and search', () => {
  test.beforeEach(async ({ page }) => skipBoot(page));

  test('lists every tool in the catalog', async ({ page }) => {
    await page.goto('/es');
    const catalog = page.locator('.catalog');
    await expect(catalog.getByRole('link', { name: 'JSON' })).toBeVisible();
    await expect(catalog.getByRole('link', { name: 'UUID, ULID y NanoID' })).toBeVisible();
  });

  test('Ctrl+K finds a tool with a typo and opens it', async ({ page }) => {
    await page.goto('/es');
    await page.keyboard.press('Control+k');
    await page.keyboard.type('jsno');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/es\/formateador-json$/);
    await expect(page.locator('h1')).toHaveText('JSON');
  });

  test('typing "/" inside a text field types it instead of opening search', async ({ page }) => {
    await page.goto('/es/formateador-json');
    const input = page.locator('#json-input');
    await input.click();
    await page.keyboard.type('/');
    await expect(input).toHaveValue('/');
    await expect(page.locator('dialog.palette')).not.toBeVisible();
  });
});

test.describe('preferences', () => {
  test.beforeEach(async ({ page }) => skipBoot(page));

  test('theme persists across reloads and client-side navigation without flashing', async ({ page }) => {
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        (window as unknown as { themeAtDcl: string }).themeAtDcl = document.documentElement.dataset.theme ?? '';
      });
    });
    await page.goto('/es');
    await page.locator('[data-theme-choice="light"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.reload();
    expect(await page.evaluate(() => (window as unknown as { themeAtDcl: string }).themeAtDcl)).toBe('light');
    await page.locator('.catalog').getByRole('link', { name: 'JSON' }).click();
    await expect(page).toHaveURL(/formateador-json$/);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('collapsed sidebar and current tool survive navigation', async ({ page }) => {
    await page.goto('/es/formateador-json');
    await page.locator('[data-collapse]').click();
    await expect(page.locator('html')).toHaveAttribute('data-sidebar', 'collapsed');
    await page.goto('/es');
    await page.locator('.catalog').getByRole('link', { name: 'UUID, ULID y NanoID' }).click();
    await expect(page).toHaveURL(/generador-uuid$/);
    await expect(page.locator('html')).toHaveAttribute('data-sidebar', 'collapsed');
    await expect(page.locator('#sidebar [data-tool-id="uuid"]').first()).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('#sidebar [data-tool-id="json"]').first()).not.toHaveAttribute('aria-current', 'page');
  });

  test('switching language keeps the same tool', async ({ page }) => {
    await page.goto('/es/formateador-json');
    await page.locator('[data-lang-link]').click();
    await expect(page).toHaveURL(/\/en\/json-formatter$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('works with storage blocked (private mode)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => {
      const blocked = {
        get() {
          throw new DOMException('blocked', 'SecurityError');
        },
      };
      Object.defineProperty(window, 'localStorage', blocked);
      Object.defineProperty(window, 'sessionStorage', blocked);
    });
    await page.goto('/es/formateador-json');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'terminal');
    await page.locator('#json-input').fill('{"a":1}');
    await expect(page.locator('.display-code')).toContainText('"a": 1');
    await page.locator('[data-favorite]').click();
    expect(errors).toEqual([]);
  });
});

test.describe('tools', () => {
  test.beforeEach(async ({ page }) => skipBoot(page));

  test('JSON is formatted while typing and errors show the line', async ({ page }) => {
    await page.goto('/es/formateador-json');
    await page.locator('#json-input').fill('{"b":1,"a":[1,2]}');
    await expect(page.locator('.display-code')).toContainText('"b": 1');
    await page.locator('#json-input').fill('{\n  "a": 1,\n}');
    await expect(page.getByText(/Error en la línea 3/)).toBeVisible();
  });

  test('UUID generates identifiers on load', async ({ page }) => {
    await page.goto('/es/generador-uuid');
    await expect(page.locator('.display-row')).toHaveCount(5);
  });
});

test.describe('boot screen', () => {
  test('shows once per session in the terminal theme and any key skips it', async ({ page }) => {
    await page.goto('/es');
    const boot = page.locator('#boot');
    await expect(boot).toBeVisible();
    await page.keyboard.press('Space');
    await expect(boot).toBeHidden();
    await page.reload();
    await expect(boot).toBeHidden();
  });
});
```

- [ ] **Step 3: Ejecutar**

```bash
pnpm exec playwright install chromium
pnpm build && pnpm test:e2e
```
Expected: todos los tests en verde. Si alguno falla, arregla el código de producción, no el test, salvo que el selector del test esté mal (por ejemplo, que el nombre accesible del enlace no coincida con `meta.name`).

- [ ] **Step 4: CI — `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm check
      - run: pnpm test
      - run: pnpm build
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report
          retention-days: 7
```

(`pnpm/action-setup@v4` sin `version` toma la del campo `packageManager` de `package.json`.)

- [ ] **Step 5: Incluir `e2e/` en Prettier**

En `package.json` cambia los scripts:
```json
    "lint": "eslint . && prettier --check src e2e",
    "format": "prettier --write src e2e",
```
Run: `pnpm format && pnpm lint` → limpio.

- [ ] **Step 6: Commit**

```bash
git add package.json playwright.config.ts e2e .github/workflows/ci.yml
git commit -m "test: e2e de rutas, búsqueda, preferencias, herramientas y arranque; CI con Node 22

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 18: README, Lighthouse y verificación final

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README**

Sustituye `README.md` por:

```md
# devtools

> Herramientas para desarrolladores que funcionan en tu navegador · Developer tools that run in your browser.

[![CI](https://github.com/alvarotorresc/devtools/actions/workflows/ci.yml/badge.svg)](https://github.com/alvarotorresc/devtools/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-live-success)](https://devtools.alvarotc.com)

Sitio estático bilingüe (ES/EN) hecho con Astro 7 y Svelte 5. Nada de lo que pegas sale de tu equipo.

## Desarrollo

Requiere Node 22.12+ y pnpm 10.

    pnpm install
    pnpm dev          # http://localhost:4321
    pnpm test         # tests de lógica (Vitest)
    pnpm build && pnpm test:e2e   # tests de navegador (Playwright)
    pnpm lint && pnpm check

## Añadir una herramienta

1. Crea `src/tools/<id>/` con `meta.ts`, `logic.ts`, `logic.test.ts`, `strings.ts`, `<Nombre>.svelte`, `content.es.md` y `content.en.md`.
2. Añade la meta a `src/tools/registry.ts`.
3. Añade una línea a `src/components/ToolIsland.astro`.

`pnpm test` falla si falta algún texto, slug o contenido en alguno de los dos idiomas.

## Temas

Terminal (por defecto), oscuro (grafito) y claro (aluminio). Los tokens están en `src/styles/tokens.css`.
```

- [ ] **Step 2: Lighthouse**

```bash
pnpm build
pnpm preview &
CHROME_PATH=$(node -e "console.log(require('@playwright/test').chromium.executablePath())") \
  pnpm dlx lighthouse http://localhost:4321/es/formateador-json --quiet --chrome-flags="--headless=new" \
  --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=./lh.json
node -e "const r=require('./lh.json').categories;for(const k in r)console.log(k,Math.round(r[k].score*100))"
pnpm exec astro preview stop; rm -f lh.json
```
Expected: las 4 categorías ≥ 95. Repite con `/es`. Lighthouse arranca sin almacenamiento, así que mide el tema terminal; para medir el claro, cambia temporalmente el tema por defecto del script del `<head>` a `light`, mide y deshaz el cambio.
Si alguna baja de 95, el informe (`--output=html`) dice qué corregir. Lo habitual: contraste de `--text-dim` o tamaño de objetivos táctiles.

- [ ] **Step 3: Verificación final completa**

Run:
```bash
pnpm lint && pnpm check && pnpm test && pnpm build && pnpm test:e2e
```
Expected: todo en verde. Recorre a mano, en los 3 temas y a 390 px y 1280 px de ancho, la Home, JSON y UUID.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: README de la plataforma nueva

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Después de este plan

- **Plan B:** migrar desde `legacy/src/tools/` las 12 herramientas restantes (Base64, URL, HTML entities, JWT, Hash, Diff, Regex, Texto, Lorem, Timestamp, Color, Bases numéricas) con las mejoras de la §7 del spec, siguiendo el patrón de JSON y UUID. Al terminar: borrar `legacy/`, revisar la rama completa y mergear a `main`.
- **Subproyecto 2:** herramientas nuevas (identificadores españoles y mock data, conversores y azar, referencia).
