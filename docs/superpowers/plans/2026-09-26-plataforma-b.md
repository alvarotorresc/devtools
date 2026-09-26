# DevTools plataforma (Plan B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar las 12 herramientas que quedan en `legacy/src/tools/` (Base64, URL, entidades HTML, JWT, hash, diff, regex, texto, Lorem ipsum, timestamp, color y bases numéricas) a la plataforma Astro 7 + Svelte 5 del Plan A, con todas las mejoras de la §7 del spec, y retirar `legacy/`.

**Architecture:** Cada herramienta es una carpeta autocontenida `src/tools/<id>/` con `logic.ts` puro y testeado, `meta.ts`, `strings.ts`, `content.es.md`, `content.en.md` y su isla `<Nombre>.svelte`, construida solo con el kit de UI del Plan A. La Task 0 añade lo compartido (13 iconos, 5 claves de interfaz y los helpers `lib/bytes.ts`, `lib/relative.ts` y `lib/download.ts`) y deja **pre-sembradas y comentadas** las dos líneas de cada herramienta en `src/tools/registry.ts` y en `src/components/ToolIsland.astro`, separadas por líneas en blanco. Cada tarea de herramienta solo descomenta sus líneas, así que las 12 ramas paralelas se fusionan sin conflictos (comprobado con git y Prettier). La Task 13 compacta esos dos archivos, borra `legacy/`, añade los e2e de las 12 herramientas y hace la verificación completa.

**Tech Stack:** Astro 7.3, @astrojs/svelte 9, Svelte 5.57 (runes), TypeScript 6, @lucide/svelte 1.48, Vitest 5, Playwright 1.63, ESLint 9 + typescript-eslint + eslint-plugin-svelte + eslint-plugin-astro, Prettier 3. Sin dependencias nuevas: MD5 propio, SHA con WebCrypto, `BigInt`, `Intl`.

**Spec:** `docs/superpowers/specs/2026-09-26-devtools-plataforma-design.md` (§6 patrón de página, kit, input recordado y atajos; **§7 tabla de mejoras por herramienta, vinculante**). Plan anterior: `docs/superpowers/plans/2026-09-26-plataforma-a.md`.

**Orden de ejecución:**

1. **Task 0**, sola, sobre `feat/plataforma-astro` con el Plan A terminado.
2. **Tasks 1–12 en paralelo**, cada una en su propio worktree y rama (`plan-b/<id>`) creada desde el commit de la Task 0.
3. Fusionar las 12 ramas en `feat/plataforma-astro` (ver «Cómo fusionar» más abajo).
4. **Task 13**, sola, sobre la rama con todo fusionado.

**Cómo se verificó este plan antes de escribirlo:** todo el código de `logic.ts`, sus tests y los helpers de la Task 0 se ejecutó con Vitest (193 tests en verde) y pasó `tsc` estricto, ESLint y Prettier con la configuración del repo. Los 12 componentes pasaron `svelte-check` sin errores contra una copia del kit reconstruida desde los briefs de las Tasks 7 y 8 del Plan A, se renderizaron en SSR en los dos idiomas y superaron en Chromium las mismas interacciones que añade la Task 13. Los archivos pre-sembrados se compilaron con el compilador de Astro 7 y se simuló la fusión de varias ramas sin conflictos. Si algo falla al ejecutar, lo más probable es que el kit real se haya desviado de los briefs: adapta el componente al kit real, no al revés.

## Global Constraints

- Node `>=22.12.0`. `package.json` lleva `"packageManager": "pnpm@10.30.2"`. CI con Node 22.
- TypeScript **`^6`**: nunca `pnpm add typescript` sin versión, porque instala la 7 y rompe los peer deps de `@astrojs/check` y `@astrojs/svelte`.
- Astro 7 usa un compilador en Rust: **toda etiqueta no vacía se cierra** y no se anida HTML inválido (nada de `<div>` dentro de `<p>` ni de `<a>` dentro de `<a>`).
- Astro 7 usa `compressHTML: 'jsx'`: el espacio entre elementos en línea puede desaparecer. Los separadores ("Inicio / Categoría", "ES / EN") se escriben con `{' / '}` o se separan con `gap` de CSS.
- **No** se activa la opción `i18n` de Astro (genera su propia redirección de `/`). El i18n es manual: rutas `[locale]/…`.
- `@astrojs/sitemap` **sin** opción `i18n` (con slugs traducidos no empareja las URLs). El hreflang va en `<head>`.
- Tema en `<html data-theme>`: el script en línea del `<head>` lo aplica en la carga y en `astro:before-swap` sobre `event.newDocument`. Si no, cada navegación lo reinicia (comprobado en la prueba).
- `astro preview` en v7 es un demonio con archivo de bloqueo: usar siempre `astro preview --ignore-lock`.
- Hosting: **Netlify** (comprobado por cabeceras). Con `build.format: 'directory'`, Netlify responde `301` de `/es/x` a `/es/x/` y todas las canónicas quedarían redirigidas. Por eso `build.format: 'file'` + `trailingSlash: 'never'`: `/es/x` → `es/x.html` con `200`. Node 22 en Netlify vía `netlify.toml` (Task 16).
- Antes de cada `pnpm lint`, ejecuta `pnpm format`: el código del plan no está garantizado byte a byte con el formato de Prettier.
- `logic.ts` de cada herramienta es puro: sin `document`, `window` ni `localStorage`. Se testea en el entorno `node` de Vitest.
- Ningún componente usa colores hex: todo sale de las variables de `src/styles/tokens.css`.
- Claves de almacenamiento con prefijo `devtools:`. Todo acceso pasa por `src/lib/storage.ts`.
- Botones y objetivos táctiles ≥ 44 px. El foco siempre es visible. Con `prefers-reduced-motion: reduce` no hay desplazamientos.
- Textos de interfaz en sentence case, sin mayúsculas sostenidas en etiquetas. Los errores dicen qué pasa y cómo arreglarlo.
- Commits con el formato del repo (`feat:`, `chore:`, `test:`, `docs:`). El mensaje termina con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` y, en la línea siguiente, `Claude-Session: https://claude.ai/code/session_01RuBvKMoRNcq5quxr9i1JjP` (los ejemplos de commit de cada task muestran solo la primera por brevedad; añade las dos).
- **Atajos (decidido por el autor el 2026-09-26):** `Ctrl/⌘+K` en todas partes. Fuera de campos de texto: `/` busca, `?` muestra la ayuda, `c` copia el resultado principal y `1…9` cambian de pestaña. Sustituyen a `Ctrl+Shift+C` (abre el inspector del navegador) y `Alt+1…9` (cambia de pestaña en Firefox en Linux) del spec. Las teclas sueltas se pueden desactivar con un interruptor en el diálogo de ayuda (WCAG 2.1.4), guardado en `devtools:shortcuts.single` (`'1'` por defecto, `'0'` desactivadas). `Ctrl/⌘+K` funciona siempre.

Añadidas para el Plan B:

- **Las tareas de herramienta (1–12) se ejecutan en paralelo, en worktrees separados.** Cada una toca solo su carpeta `src/tools/<id>/`, más **una línea descomentada en `src/tools/registry.ts` para el import y otra para la entrada del array**, y **una línea descomentada en `src/components/ToolIsland.astro` para el import y otra para el montaje**. Nada más: ni `src/i18n/*.ts`, ni `src/ui/`, ni `src/lib/`, ni `package.json`. No borres las líneas en blanco que separan las líneas pre-sembradas: son las que evitan los conflictos al fusionar.
- Si una herramienta necesitara algo compartido que no está en la Task 0, **para y avisa**: no lo añadas dentro de tu tarea.
- Cada worktree empieza con `pnpm install --frozen-lockfile` (los worktrees no comparten `node_modules`).
- Commits de herramienta con rutas explícitas: `git add src/tools/<id> src/tools/registry.ts src/components/ToolIsland.astro`. Nunca `git add src` ni `git add .`: `pnpm format` reescribe todo `src` y podría colar cambios ajenos. Antes de confirmar, `git status --porcelain` solo puede listar esas rutas.
- Las tareas de herramienta verifican con `pnpm test`, `pnpm check`, `pnpm lint` y `pnpm build`, **no** con `pnpm test:e2e`: el e2e del Plan A que espera que `/#number-base` lleve a la Home deja de ser cierto al fusionar la Task 12. Lo corrige la Task 13.
- Textos de cada herramienta en su `strings.ts` (mismas claves en `es` y `en`). Las únicas claves nuevas de `src/i18n/*.ts` las añade la Task 0.
- Antes de escribir el `.svelte`, abre los componentes reales de `src/ui/` que uses. Si sus props difieren de las de este plan (que salen de los briefs de las Tasks 7 y 8 del Plan A), adapta el componente a las reales y dilo en el mensaje del commit.
- En componentes, **ninguna variable se llama `state`** (Svelte la confunde con la runa `$state`). Los estados con tipo unión o nullable se declaran como `$state<T>(…)`, no como `let x: T = $state(…)`: con la segunda forma TypeScript estrecha el tipo al valor inicial y `pnpm check` falla en las comparaciones.
- **Nunca `{@html}`** con contenido del usuario: resaltados de regex, palabras del diff y salida de entidades se pintan con `{#each}` y `<mark>`/`<span>`.
- Atajos: cada vista tiene **como mucho un** `CopyButton main`; las herramientas con `meta.tabs` tienen **exactamente un** `Segmented main` con esas etiquetas. Los `Segmented` secundarios (dirección, formato, vista) no llevan `main`.
- JWT y Hash tienen `rememberInput: false`: su input vive en un `$state` normal, sin `persistedInput` y sin el interruptor «Recordar lo que escribo».

## Review Focus

1. **Detección de dirección en Base64 con falsos positivos:** palabras normales que solo usan letras válidas en Base64 (`hola`, `test`, `Word`) deben codificarse, no «decodificarse» en basura. → Test `keeps plain words on encode even if they only use Base64 letters` en la Task 1.
2. **Regex que congela la pestaña:** una coincidencia vacía (`x*`, `^` con `gm`) no puede dejar el bucle sin avanzar, y un texto con miles de coincidencias se corta en `MAX_MATCHES` y lo avisa. → Tests `does not hang on empty matches` y `stops at the limit and says there were more` en la Task 7.
3. **Diff de textos grandes:** 50 000 líneas casi iguales se comparan en menos de 1 s (se recortan cabeza y cola comunes), y un bloque cambiado enorme no reserva una tabla gigante: devuelve `tooLarge` y lista igualmente todas las líneas. → Tests `stays fast on big, mostly equal texts` y `gives up line matching … when the changed block is huge` en la Task 6.
4. **Cambio de hora (DST) al convertir fecha → timestamp:** en Madrid, el 31 de marzo y el 27 de octubre de 2024, las horas que no existen o se repiten dan un instante definido y correcto. → Test `converts wall-clock times to UTC across the DST switch` en la Task 10.
5. **Precisión por encima de 2^53 y validación estricta de dígitos en bases numéricas:** `9007199254740993` y `2^64` se convierten sin redondeo, y `12abc` en base 10 o `102` en base 2 se rechazan (el antiguo `parseInt` los aceptaba a medias). → Tests `keeps full precision far beyond Number.MAX_SAFE_INTEGER` y `is strict: every digit must belong to the base` en la Task 12.

---

## File Structure

```
src/lib/bytes.ts  bytes.test.ts        → UTF-8, hex y Base64 (estándar y URL-safe)   [Task 0]
src/lib/relative.ts  relative.test.ts  → "hace 2 horas" / "in 3 days" con Intl        [Task 0]
src/lib/download.ts                    → descarga de un Blob o texto                  [Task 0]
src/tools/icon-names.ts  icons.ts      → +13 iconos                                   [Task 0]
src/i18n/es.ts  en.ts                  → +5 claves (ui.useOutput, dir.*)              [Task 0]
src/tools/registry.ts                  → líneas pre-sembradas (Task 0), compactado (Task 13)
src/components/ToolIsland.astro        → líneas pre-sembradas (Task 0), compactado (Task 13)
src/tools/base64/        {logic,logic.test,meta,strings}.ts Base64.svelte       content.{es,en}.md   [Task 1]
src/tools/url/           {…}                                Url.svelte          …                    [Task 2]
src/tools/html-entities/ {…}                                HtmlEntities.svelte …                    [Task 3]
src/tools/jwt/           {…}                                Jwt.svelte          …                    [Task 4]
src/tools/hash/          {…}                                Hash.svelte         …                    [Task 5]
src/tools/diff/          {…}                                Diff.svelte         …                    [Task 6]
src/tools/regex/         {…}                                Regex.svelte        …                    [Task 7]
src/tools/text/          {…}                                Text.svelte         …                    [Task 8]
src/tools/lorem/         {…}                                Lorem.svelte        …                    [Task 9]
src/tools/timestamp/     {…}                                Timestamp.svelte    …                    [Task 10]
src/tools/color/         {…}                                Color.svelte        …                    [Task 11]
src/tools/number-base/   {…}                                NumberBase.svelte   …                    [Task 12]
e2e/tools.spec.ts  e2e/fixtures/hola.txt   → e2e de las 12 herramientas               [Task 13]
e2e/smoke.spec.ts                          → enlace antiguo /#number-base             [Task 13]
legacy/                                    → se borra                                 [Task 13]
```

Slugs (únicos; no chocan con `formateador-json`, `json-formatter`, `generador-uuid` ni `uuid-generator`):

| id | ES | EN |
|---|---|---|
| `base64` | `codificar-decodificar-base64` | `base64-encode-decode` |
| `url` | `codificar-decodificar-url` | `url-encode-decode` |
| `html-entities` | `codificar-entidades-html` | `html-entities-encoder` |
| `jwt` | `decodificador-jwt` | `jwt-decoder` |
| `hash` | `generador-hash-md5-sha256` | `md5-sha256-hash-generator` |
| `diff` | `comparar-textos` | `text-diff-checker` |
| `regex` | `probador-regex` | `regex-tester` |
| `text` | `convertir-mayusculas-minusculas` | `text-case-converter` |
| `lorem` | `generador-lorem-ipsum` | `lorem-ipsum-generator` |
| `timestamp` | `conversor-timestamp-unix` | `unix-timestamp-converter` |
| `color` | `conversor-colores` | `color-converter` |
| `number-base` | `conversor-bases-numericas` | `number-base-converter` |

Los `id` coinciden con los de la app antigua, así que `resolveLegacyHash` (Task 11 del Plan A) lleva `/#base64`, `/#url`, `/#number-base`… a la página nueva sin tocar nada.

## Cómo fusionar las Tasks 1–12

Cada tarea trabaja en `git worktree add ../devtools-<id> -b plan-b/<id>` desde el commit de la Task 0. Al terminar las 12:

```bash
git switch feat/plataforma-astro
for id in base64 url html-entities jwt hash diff regex text lorem timestamp color number-base; do
  git merge --no-ff --no-edit "plan-b/$id" || break
done
pnpm install --frozen-lockfile && pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build
```

No debería haber conflictos: cada rama cambia líneas distintas de `registry.ts` y `ToolIsland.astro`, separadas por una línea en blanco. Si aun así aparece uno en esos dos archivos, la resolución es conservar las dos líneas descomentadas. Cualquier conflicto fuera de ellos significa que una tarea tocó algo que no debía: revísala antes de seguir.

---

### Task 0: Prerrequisitos compartidos (sola, antes de las herramientas)

**Files:**
- Create: `src/lib/bytes.ts`, `src/lib/bytes.test.ts`, `src/lib/relative.ts`, `src/lib/relative.test.ts`, `src/lib/download.ts`
- Modify: `src/tools/icon-names.ts`, `src/tools/icons.ts`, `src/i18n/es.ts`, `src/i18n/en.ts`, `src/tools/registry.ts`, `src/components/ToolIsland.astro`, `src/tools/json/Json.svelte`, `src/tools/uuid/Uuid.svelte`

**Interfaces:**
- Consumes: el Plan A terminado (kit de UI, `ToolIsland.astro`, `registry.ts` con `[json, uuid]`, `src/i18n/fill.ts`, `e2e/smoke.spec.ts`).
- Produces:
  - `src/lib/bytes.ts`: `utf8(s: string): Uint8Array`, `fromUtf8(bytes: Uint8Array, fatal?: boolean = false): string` (con `fatal` lanza `TypeError` si no es UTF-8), `toHex(bytes: Uint8Array): string`, `bytesToBase64(bytes: Uint8Array, urlSafe?: boolean = false): string`, `normalizeBase64(input: string): string | null`, `base64ToBytes(input: string): Uint8Array | null` (acepta estándar y URL-safe, con o sin relleno y con saltos de línea). Lo usan Base64, JWT y Hash.
  - `src/lib/relative.ts`: `formatRelative(targetMs: number, nowMs: number, locale: Locale): string` («hace 2 horas», «in 3 days»). Lo usan JWT y Timestamp.
  - `src/lib/download.ts`: `downloadBlob(data: Blob | string, filename: string, type?: string = 'text/plain;charset=utf-8'): void`. Lo usan JSON, UUID, Base64 y Lorem.
  - `IconName` gana: `binary`, `case-sensitive`, `clock`, `code-xml`, `diff`, `file-code`, `hash`, `key-round`, `link`, `palette`, `pilcrow`, `regex`, `triangle-alert`.
  - `UiKey` gana: `ui.useOutput`, `dir.label`, `dir.auto`, `dir.encode`, `dir.decode` (Base64, URL, entidades y Texto).
  - `registry.ts` y `ToolIsland.astro` con las dos líneas de cada herramienta del Plan B comentadas y separadas por una línea en blanco.

- [ ] **Step 1: Comprobar que el Plan A está terminado**

```bash
git status --short
for f in src/ui/Display.svelte src/ui/CopyButton.svelte src/ui/FileDrop.svelte src/ui/persisted.svelte.ts \
         src/i18n/fill.ts src/components/ToolIsland.astro src/components/ToolShell.astro \
         src/tools/json/Json.svelte src/tools/uuid/Uuid.svelte e2e/smoke.spec.ts; do
  test -e "$f" || echo "FALTA $f"
done
grep -n "export const tools: ToolMeta\[\] = \[json, uuid\];" src/tools/registry.ts || echo "REGISTRO DISTINTO"
pnpm install --frozen-lockfile && pnpm test && pnpm check
```
Expected: `git status` vacío, ninguna línea `FALTA …` ni `REGISTRO DISTINTO`, y tests y `check` en verde. Si falta algo, **para**: este plan depende del Plan A completo.

- [ ] **Step 2: Tests de los helpers (fallan)**

`src/lib/bytes.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { base64ToBytes, bytesToBase64, fromUtf8, normalizeBase64, toHex, utf8 } from './bytes';

describe('utf8 helpers', () => {
  it('round-trips non-ASCII text', () => {
    expect(fromUtf8(utf8('Canción ✓ 😀'))).toBe('Canción ✓ 😀');
    expect(utf8('ñ')).toEqual(new Uint8Array([0xc3, 0xb1]));
  });

  it('throws on invalid UTF-8 only when fatal', () => {
    const bad = new Uint8Array([0xff, 0xfe]);
    expect(() => fromUtf8(bad, true)).toThrow();
    expect(fromUtf8(bad)).toBe('��');
  });

  it('prints bytes as lowercase hex', () => {
    expect(toHex(new Uint8Array([0, 15, 255]))).toBe('000fff');
  });
});

describe('base64', () => {
  it('encodes standard and URL-safe variants', () => {
    const bytes = new Uint8Array([0xfb, 0xff, 0xbf]);
    expect(bytesToBase64(bytes)).toBe('+/+/');
    expect(bytesToBase64(bytes, true)).toBe('-_-_');
    expect(bytesToBase64(utf8('ab'), true)).toBe('YWI');
    expect(bytesToBase64(utf8('ab'))).toBe('YWI=');
  });

  it('encodes large inputs without overflowing the call stack', () => {
    const big = new Uint8Array(300_000).fill(65);
    expect(bytesToBase64(big)).toHaveLength(400_000);
  });

  it('normalizes URL-safe, unpadded and wrapped input', () => {
    expect(normalizeBase64('YWI')).toBe('YWI=');
    expect(normalizeBase64('-_-_')).toBe('+/+/');
    expect(normalizeBase64('SGVs\nbG8=')).toBe('SGVsbG8=');
  });

  it('rejects impossible Base64', () => {
    expect(normalizeBase64('abc!')).toBeNull();
    expect(normalizeBase64('abcde')).toBeNull();
    expect(normalizeBase64('YWI==')).toBeNull();
    expect(base64ToBytes('@@@@')).toBeNull();
  });

  it('decodes to bytes', () => {
    expect(base64ToBytes('+/+/')).toEqual(new Uint8Array([0xfb, 0xff, 0xbf]));
    expect(base64ToBytes('')).toEqual(new Uint8Array(0));
  });
});
```

`src/lib/relative.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { formatRelative } from './relative';

const NOW = Date.UTC(2026, 8, 26, 12, 0, 0);

describe('formatRelative', () => {
  it('uses the largest unit that fits, in both languages', () => {
    expect(formatRelative(NOW - 2 * 3_600_000, NOW, 'es')).toBe('hace 2 horas');
    expect(formatRelative(NOW - 2 * 3_600_000, NOW, 'en')).toBe('2 hours ago');
    expect(formatRelative(NOW + 3 * 86_400_000, NOW, 'es')).toBe('dentro de 3 días');
    expect(formatRelative(NOW + 3 * 86_400_000, NOW, 'en')).toBe('in 3 days');
  });

  it('truncates instead of rounding up', () => {
    expect(formatRelative(NOW - 90 * 60_000, NOW, 'en')).toBe('1 hour ago');
  });

  it('says "now" for less than a second', () => {
    expect(formatRelative(NOW - 400, NOW, 'en')).toBe('now');
    expect(formatRelative(NOW, NOW, 'es')).toBe('ahora');
  });

  it('counts seconds under a minute', () => {
    expect(formatRelative(NOW - 45_000, NOW, 'en')).toBe('45 seconds ago');
  });
});
```

Run: `pnpm test src/lib/bytes.test.ts src/lib/relative.test.ts`
Expected: FAIL (no existen los módulos).

- [ ] **Step 3: `src/lib/bytes.ts`, `src/lib/relative.ts` y `src/lib/download.ts`**

`src/lib/bytes.ts`:
```ts
const CHUNK = 0x8000;

export function utf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

/** With `fatal`, throws a TypeError when the bytes are not valid UTF-8. */
export function fromUtf8(bytes: Uint8Array, fatal = false): string {
  return new TextDecoder('utf-8', { fatal }).decode(bytes);
}

export function toHex(bytes: Uint8Array): string {
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

export function bytesToBase64(bytes: Uint8Array, urlSafe = false): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  const b64 = btoa(bin);
  return urlSafe ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b64;
}

/**
 * Accepts standard and URL-safe Base64, with or without padding, spaces or line breaks.
 * Returns standard padded Base64, or null when it cannot be valid Base64.
 */
export function normalizeBase64(input: string): string | null {
  const s = input.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(s)) return null;
  const body = s.replace(/=+$/, '');
  if (body.length % 4 === 1) return null;
  if (s.length !== body.length && s.length % 4 !== 0) return null;
  return body + '='.repeat((4 - (body.length % 4)) % 4);
}

export function base64ToBytes(input: string): Uint8Array | null {
  const s = normalizeBase64(input);
  if (s === null) return null;
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
```

`src/lib/relative.ts`:
```ts
import type { Locale } from '../tools/types';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 86_400_000],
  ['month', 30 * 86_400_000],
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
  ['second', 1000],
];

/** "hace 2 horas" / "in 3 days": the largest unit that fits, truncated towards zero. */
export function formatRelative(targetMs: number, nowMs: number, locale: Locale): string {
  const diff = targetMs - nowMs;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (const [unit, size] of UNITS) {
    if (Math.abs(diff) >= size || unit === 'second') {
      return rtf.format(Math.trunc(diff / size) || 0, unit);
    }
  }
  return '';
}
```

`src/lib/download.ts` (solo navegador; no tiene test unitario, lo cubren los e2e de Base64 en la Task 13):
```ts
/** Saves `data` as a file through a temporary link. Browser only: call it from event handlers. */
export function downloadBlob(
  data: Blob | string,
  filename: string,
  type = 'text/plain;charset=utf-8',
): void {
  const blob = typeof data === 'string' ? new Blob([data], { type }) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
```

Run: `pnpm test src/lib`
Expected: PASS.

- [ ] **Step 4: Iconos nuevos**

Sustituye `src/tools/icon-names.ts` por:
```ts
export const ICON_NAMES = [
  'arrow-left-right',
  'binary',
  'book-open',
  'braces',
  'case-sensitive',
  'check',
  'chevron-down',
  'chevron-right',
  'clock',
  'code',
  'code-xml',
  'copy',
  'dices',
  'diff',
  'file-code',
  'fingerprint',
  'hash',
  'house',
  'id-card',
  'key-round',
  'keyboard',
  'link',
  'menu',
  'moon',
  'palette',
  'panel-left-close',
  'panel-left-open',
  'pilcrow',
  'refresh-cw',
  'regex',
  'search',
  'sparkles',
  'star',
  'sun',
  'terminal',
  'triangle-alert',
  'x',
] as const;

export type IconName = (typeof ICON_NAMES)[number];
```

Sustituye `src/tools/icons.ts` por:
```ts
import {
  ArrowLeftRight,
  Binary,
  BookOpen,
  Braces,
  CaseSensitive,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  CodeXml,
  Copy,
  Dices,
  Diff,
  FileCode,
  Fingerprint,
  Hash,
  House,
  IdCard,
  KeyRound,
  Keyboard,
  Link,
  Menu,
  Moon,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Pilcrow,
  RefreshCw,
  Regex,
  Search,
  Sparkles,
  Star,
  Sun,
  SquareTerminal,
  TriangleAlert,
  X,
} from '@lucide/svelte';
import type { IconName } from './icon-names';

export type { IconName } from './icon-names';

// Record<IconName, …> makes `pnpm check` fail if a name has no component or vice versa.
export const icons: Record<IconName, typeof House> = {
  'arrow-left-right': ArrowLeftRight,
  binary: Binary,
  'book-open': BookOpen,
  braces: Braces,
  'case-sensitive': CaseSensitive,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  clock: Clock,
  code: Code,
  'code-xml': CodeXml,
  copy: Copy,
  dices: Dices,
  diff: Diff,
  'file-code': FileCode,
  fingerprint: Fingerprint,
  hash: Hash,
  house: House,
  'id-card': IdCard,
  'key-round': KeyRound,
  keyboard: Keyboard,
  link: Link,
  menu: Menu,
  moon: Moon,
  palette: Palette,
  'panel-left-close': PanelLeftClose,
  'panel-left-open': PanelLeftOpen,
  pilcrow: Pilcrow,
  'refresh-cw': RefreshCw,
  regex: Regex,
  search: Search,
  sparkles: Sparkles,
  star: Star,
  sun: Sun,
  terminal: SquareTerminal,
  'triangle-alert': TriangleAlert,
  x: X,
};
```

(`Record<IconName, …>` hace que `pnpm check` falle si falta un componente.)

- [ ] **Step 5: Claves de interfaz compartidas**

En `src/i18n/es.ts`, justo después de la línea `'ui.dropFile': …,`, añade:
```ts
  'ui.useOutput': 'Usar el resultado como entrada',
  'dir.label': 'Dirección',
  'dir.auto': 'Automática',
  'dir.encode': 'Codificar',
  'dir.decode': 'Decodificar',
```

En `src/i18n/en.ts`, en el mismo sitio:
```ts
  'ui.useOutput': 'Use the result as input',
  'dir.label': 'Direction',
  'dir.auto': 'Automatic',
  'dir.encode': 'Encode',
  'dir.decode': 'Decode',
```

(El test de i18n del Plan A comprueba que los dos diccionarios tienen las mismas claves.)

- [ ] **Step 6: Pre-sembrar `registry.ts`**

Sustituye `src/tools/registry.ts` por el contenido siguiente. Es el del Plan A con las líneas de las 12 herramientas añadidas, comentadas. `json` y `uuid` siguen delante del bloque comentado: si el array empezara por comentarios, Prettier juntaría las líneas y se perdería el separador.
```ts
import { categories } from './categories';
import { meta as json } from './json/meta';
import { meta as uuid } from './uuid/meta';
import type { Category, CategoryId, Locale, ToolMeta } from './types';

// Plan B: each tool task uncomments its import and its entry in `tools`.
// Keep the blank lines between them: they let the parallel branches merge without conflicts.

// import { meta as base64 } from './base64/meta';

// import { meta as url } from './url/meta';

// import { meta as htmlEntities } from './html-entities/meta';

// import { meta as jwt } from './jwt/meta';

// import { meta as hash } from './hash/meta';

// import { meta as diff } from './diff/meta';

// import { meta as regex } from './regex/meta';

// import { meta as text } from './text/meta';

// import { meta as lorem } from './lorem/meta';

// import { meta as timestamp } from './timestamp/meta';

// import { meta as color } from './color/meta';

// import { meta as numberBase } from './number-base/meta';

export const tools: ToolMeta[] = [
  json,
  uuid,

  // base64,

  // url,

  // htmlEntities,

  // jwt,

  // hash,

  // diff,

  // regex,

  // text,

  // lorem,

  // timestamp,

  // color,

  // numberBase,
];

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

- [ ] **Step 7: Pre-sembrar `ToolIsland.astro`**

Sustituye `src/components/ToolIsland.astro` por el contenido siguiente. Si el archivo actual tiene algo más que las líneas de `json` y `uuid` del Plan A, consérvalo y añade solo los bloques comentados.
```astro
---
import Json from '../tools/json/Json.svelte';
import Uuid from '../tools/uuid/Uuid.svelte';
import type { Locale } from '../tools/types';

// Plan B: each tool task uncomments its import below and its line in the template.
// Keep the blank lines between them: they let the parallel branches merge without conflicts.

// import Base64 from '../tools/base64/Base64.svelte';

// import Url from '../tools/url/Url.svelte';

// import HtmlEntities from '../tools/html-entities/HtmlEntities.svelte';

// import Jwt from '../tools/jwt/Jwt.svelte';

// import Hash from '../tools/hash/Hash.svelte';

// import Diff from '../tools/diff/Diff.svelte';

// import Regex from '../tools/regex/Regex.svelte';

// import Text from '../tools/text/Text.svelte';

// import Lorem from '../tools/lorem/Lorem.svelte';

// import Timestamp from '../tools/timestamp/Timestamp.svelte';

// import Color from '../tools/color/Color.svelte';

// import NumberBase from '../tools/number-base/NumberBase.svelte';

interface Props {
  id: string;
  locale: Locale;
}
const { id, locale } = Astro.props;
---

{id === 'json' && <Json client:load locale={locale} />}
{id === 'uuid' && <Uuid client:load locale={locale} />}

{/* {id === 'base64' && <Base64 client:load locale={locale} />} */}

{/* {id === 'url' && <Url client:load locale={locale} />} */}

{/* {id === 'html-entities' && <HtmlEntities client:load locale={locale} />} */}

{/* {id === 'jwt' && <Jwt client:load locale={locale} />} */}

{/* {id === 'hash' && <Hash client:load locale={locale} />} */}

{/* {id === 'diff' && <Diff client:load locale={locale} />} */}

{/* {id === 'regex' && <Regex client:load locale={locale} />} */}

{/* {id === 'text' && <Text client:load locale={locale} />} */}

{/* {id === 'lorem' && <Lorem client:load locale={locale} />} */}

{/* {id === 'timestamp' && <Timestamp client:load locale={locale} />} */}

{/* {id === 'color' && <Color client:load locale={locale} />} */}

{/* {id === 'number-base' && <NumberBase client:load locale={locale} />} */}
```

Las líneas `{/* … */}` son comentarios de expresión: el compilador de Astro 7 los ignora (comprobado, sin diagnósticos).

- [ ] **Step 8: JSON y UUID usan `downloadBlob`**

En `src/tools/json/Json.svelte`, añade el import junto a los demás de `../../lib`:
```ts
  import { downloadBlob } from '../../lib/download';
```
y sustituye la función `download`:
```ts
  function download() {
    const url = URL.createObjectURL(new Blob([formatted], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = s.file;
    a.click();
    URL.revokeObjectURL(url);
  }
```
por:
```ts
  function download() {
    downloadBlob(formatted, s.file, 'application/json');
  }
```

En `src/tools/uuid/Uuid.svelte`, el mismo import y la función:
```ts
  function download() {
    downloadBlob(shown.join('\n'), s.file);
  }
```

(Además de quitar código repetido, `downloadBlob` revoca la URL un segundo después: revocarla en el mismo tick puede cancelar la descarga en Safari.)

- [ ] **Step 9: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm test:e2e
```
Expected: todo en verde. El build sigue generando solo las páginas de JSON y UUID, y el e2e del Plan A pasa igual que antes (aún no hay herramientas nuevas).

A mano con `pnpm preview`: en `/es/formateador-json` y `/es/generador-uuid`, «Descargar» sigue bajando `datos.json` e `identificadores.txt`.

- [ ] **Step 10: Commit**

```bash
git add src/lib src/tools/icon-names.ts src/tools/icons.ts src/i18n/es.ts src/i18n/en.ts \
  src/tools/registry.ts src/components/ToolIsland.astro src/tools/json/Json.svelte src/tools/uuid/Uuid.svelte
git status --porcelain   # no debe quedar nada sin añadir
git commit -m "feat: prerrequisitos del Plan B (bytes, tiempo relativo, descargas, iconos y registro pre-sembrado)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 1: Base64: texto y archivos, con detección de dirección y URL-safe

**Files:**
- Create: `src/tools/base64/logic.ts`, `src/tools/base64/logic.test.ts`, `src/tools/base64/meta.ts`, `src/tools/base64/strings.ts`, `src/tools/base64/content.es.md`, `src/tools/base64/content.en.md`, `src/tools/base64/Base64.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `utf8`, `fromUtf8`, `bytesToBase64`, `base64ToBytes` y `downloadBlob` (Task 0); `fill`; `t` (`dir.*`, `ui.useOutput`, `ui.clear`, `led.idle`, `tool.remember`); kit: `Segmented`, `Field`, `TextArea`, `Toggle`, `Display`, `Led`, `CopyButton`, `Button`, `FileDrop`, `persistedInput`.
- Produces:
  - `type Direction = 'encode' | 'decode'`, `type DirectionMode = 'auto' | Direction`, `type DecodeError = 'invalid' | 'binary'`, `type ConvertResult = { ok: true; direction; output } | { ok: false; direction: 'decode'; error }`, `MAX_FILE_BYTES = 20 MiB`
  - `encodeBase64(text: string, urlSafe?: boolean = false): string` y `decodeBase64(encoded: string): string` (lanza si no es Base64 o no es UTF-8; API antigua)
  - `detectDirection(input: string): Direction`, `convert(input: string, mode: DirectionMode, urlSafe?: boolean): ConvertResult`
  - `toDataUri(bytes, mime): string`, `parseBase64Payload(input): { bytes: Uint8Array; mime: string | null } | null`, `sniffMime(bytes): string | null`, `extensionFor(mime): string`, `formatBytes(n, locale): string`
  - `meta: ToolMeta` (id `base64`, slugs `codificar-decodificar-base64` / `base64-encode-decode`), `strings: Record<Locale, …>`, componente `Base64` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 13: `#base64-input` (texto), `.display-code` (resultado), pestaña «Archivo», `input[type=file]`, `#base64-payload`, botón «Descargar archivo».

**§7 (vinculante):** `base64` · enc · Texto · Archivo · «Detección automática de la dirección (con opción de fijarla manualmente). Variante URL-safe. Archivo → data URI y Base64 → descarga de archivo».

Cómo se cubre cada punto:
- Detección automática: `detectDirection` solo decodifica si el texto es Base64 válido **y** da UTF-8 legible (Review Focus 1). Tests `detectDirection`.
- Fijarla a mano: `Segmented` Automática / Codificar / Decodificar con las claves `dir.*`. Test `lets the user force a direction`.
- URL-safe: `Toggle` + `encodeBase64(text, true)`; al decodificar se aceptan las dos variantes. Tests `URL-safe variant`.
- Archivo → data URI: `FileDrop` + `toDataUri`, con «Copiar data URI» (principal) y «Copiar Base64». Test `builds a data URI`.
- Base64 → descarga: `parseBase64Payload` + `sniffMime` + `downloadBlob`, con vista previa si es una imagen. Tests `reads a data URI…` y `recognises common file signatures`.
- Comunes: en vivo, resultado en `Display`, copiar, input recordado (`persistedInput('base64')`) y errores con causa y arreglo (`errorInvalidHint`, `errorBinaryHint`).

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-base64 -b plan-b/base64   # desde el commit de la Task 0
cd ../devtools-base64
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta tarea (Segmented, Field, TextArea, Toggle, Display, Led, CopyButton, Button, FileDrop) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente de la Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/base64/logic.test.ts` (incluye los 4 tests de Base64 de `legacy/src/__tests__/tools.test.ts`):
```ts
import { describe, expect, it } from 'vitest';
import {
  convert,
  decodeBase64,
  detectDirection,
  encodeBase64,
  extensionFor,
  formatBytes,
  parseBase64Payload,
  sniffMime,
  toDataUri,
} from './logic';

describe('encode and decode (legacy behaviour)', () => {
  it('encodes text to Base64', () => {
    expect(encodeBase64('Hello, World!')).toBe('SGVsbG8sIFdvcmxkIQ==');
  });

  it('decodes Base64 to text', () => {
    expect(decodeBase64('SGVsbG8sIFdvcmxkIQ==')).toBe('Hello, World!');
  });

  it('handles UTF-8 characters', () => {
    const text = 'Hola mundo!';
    expect(decodeBase64(encodeBase64(text))).toBe(text);
    expect(decodeBase64(encodeBase64('Canción ñ 😀'))).toBe('Canción ñ 😀');
  });

  it('handles empty string', () => {
    expect(encodeBase64('')).toBe('');
    expect(decodeBase64('')).toBe('');
  });
});

describe('URL-safe variant', () => {
  it('uses - and _ and drops the padding', () => {
    expect(encodeBase64('¿?>', false)).toBe('wr8/Pg==');
    expect(encodeBase64('¿?>', true)).toBe('wr8_Pg');
  });

  it('decodes URL-safe input without padding', () => {
    expect(decodeBase64('wr8_Pg')).toBe('¿?>');
  });
});

describe('detectDirection', () => {
  it('decodes real Base64 text, even when wrapped over several lines', () => {
    expect(detectDirection('SGVsbG8sIFdvcmxkIQ==')).toBe('decode');
    expect(detectDirection('SGVsbG8s\nIFdvcmxkIQ==')).toBe('decode');
  });

  it('keeps plain words on encode even if they only use Base64 letters', () => {
    expect(detectDirection('hola')).toBe('encode');
    expect(detectDirection('test')).toBe('encode');
    expect(detectDirection('Word')).toBe('encode');
    expect(detectDirection('hello')).toBe('encode');
    expect(detectDirection('Hello, World!')).toBe('encode');
    expect(detectDirection('')).toBe('encode');
  });

  it('keeps Base64 of binary data on encode (it is not readable text)', () => {
    expect(detectDirection('iVBORw0KGgo=')).toBe('encode');
  });
});

describe('convert', () => {
  it('follows the detected direction in auto mode', () => {
    expect(convert('Hola', 'auto')).toEqual({ ok: true, direction: 'encode', output: 'SG9sYQ==' });
    expect(convert('SG9sYQ==', 'auto')).toEqual({ ok: true, direction: 'decode', output: 'Hola' });
  });

  it('lets the user force a direction', () => {
    expect(convert('SG9sYQ==', 'encode')).toEqual({
      ok: true,
      direction: 'encode',
      output: 'U0c5c1lRPT0=',
    });
  });

  it('explains why decoding failed', () => {
    expect(convert('no es base64!', 'decode')).toEqual({
      ok: false,
      direction: 'decode',
      error: 'invalid',
    });
    expect(convert('iVBORw0KGgo=', 'decode')).toEqual({
      ok: false,
      direction: 'decode',
      error: 'binary',
    });
  });
});

describe('files', () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  it('builds a data URI', () => {
    expect(toDataUri(png, 'image/png')).toBe('data:image/png;base64,iVBORw0KGgo=');
    expect(toDataUri(new Uint8Array([1]), '')).toBe('data:application/octet-stream;base64,AQ==');
  });

  it('reads a data URI or bare Base64 back into bytes and a type', () => {
    expect(parseBase64Payload('data:image/png;base64,iVBORw0KGgo=')).toEqual({
      bytes: png,
      mime: 'image/png',
    });
    expect(parseBase64Payload('iVBORw0KGgo=')).toEqual({ bytes: png, mime: 'image/png' });
    expect(parseBase64Payload('SG9sYQ==')).toEqual({
      bytes: new Uint8Array([72, 111, 108, 97]),
      mime: null,
    });
    expect(parseBase64Payload('%%%')).toBeNull();
    expect(parseBase64Payload('')).toBeNull();
  });

  it('recognises common file signatures', () => {
    expect(sniffMime(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
    expect(sniffMime(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]))).toBe('application/pdf');
    expect(
      sniffMime(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>')),
    ).toBe('image/svg+xml');
    expect(sniffMime(new Uint8Array([1, 2, 3]))).toBeNull();
  });

  it('picks a file extension', () => {
    expect(extensionFor('image/jpeg')).toBe('jpg');
    expect(extensionFor(null)).toBe('bin');
  });

  it('formats sizes', () => {
    expect(formatBytes(512, 'en')).toBe('512 B');
    expect(formatBytes(1536, 'en')).toBe('1.5 KB');
    expect(formatBytes(1536, 'es')).toBe('1,5 KB');
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/base64`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/base64/logic.ts`**
```ts
import { base64ToBytes, bytesToBase64, fromUtf8, utf8 } from '../../lib/bytes';

export type Direction = 'encode' | 'decode';
export type DirectionMode = 'auto' | Direction;
export type DecodeError = 'invalid' | 'binary';
export type ConvertResult =
  | { ok: true; direction: Direction; output: string }
  | { ok: false; direction: 'decode'; error: DecodeError };

export const MAX_FILE_BYTES = 20 * 1024 * 1024;

export function encodeBase64(text: string, urlSafe = false): string {
  return bytesToBase64(utf8(text), urlSafe);
}

/** Throws when the input is not Base64 or does not decode to UTF-8 text. */
export function decodeBase64(encoded: string): string {
  const bytes = base64ToBytes(encoded);
  if (!bytes) throw new Error('Invalid Base64');
  return fromUtf8(bytes, true);
}

/** Control characters other than tab, line feed and carriage return: a sign of binary data. */
function hasControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if ((c < 32 && c !== 9 && c !== 10 && c !== 13) || c === 127) return true;
  }
  return false;
}

/**
 * "decode" only when the input is Base64 AND decodes to readable UTF-8 text.
 * Plain words such as "hola" or "test" use Base64 letters but decode to garbage,
 * so they stay on "encode".
 */
export function detectDirection(input: string): Direction {
  const compact = input.replace(/\s+/g, '');
  if (compact.length < 4) return 'encode';
  const bytes = base64ToBytes(compact);
  if (!bytes || bytes.length === 0) return 'encode';
  try {
    const text = fromUtf8(bytes, true);
    return hasControlChars(text) ? 'encode' : 'decode';
  } catch {
    return 'encode';
  }
}

export function convert(input: string, mode: DirectionMode, urlSafe = false): ConvertResult {
  const direction = mode === 'auto' ? detectDirection(input) : mode;
  if (direction === 'encode') return { ok: true, direction, output: encodeBase64(input, urlSafe) };
  const bytes = base64ToBytes(input);
  if (!bytes) return { ok: false, direction, error: 'invalid' };
  try {
    return { ok: true, direction, output: fromUtf8(bytes, true) };
  } catch {
    return { ok: false, direction, error: 'binary' };
  }
}

export function toDataUri(bytes: Uint8Array, mime: string): string {
  return `data:${mime || 'application/octet-stream'};base64,${bytesToBase64(bytes)}`;
}

/** Accepts a data URI (`data:image/png;base64,...`) or bare Base64. */
export function parseBase64Payload(
  input: string,
): { bytes: Uint8Array; mime: string | null } | null {
  const m = /^\s*data:([^;,]*)(?:;[^,]*)?;base64,(.*)$/is.exec(input);
  const bytes = base64ToBytes(m ? m[2] : input);
  if (!bytes || bytes.length === 0) return null;
  return { bytes, mime: m?.[1] || sniffMime(bytes) };
}

const SIGNATURES: [number[], string][] = [
  [[0x89, 0x50, 0x4e, 0x47], 'image/png'],
  [[0xff, 0xd8, 0xff], 'image/jpeg'],
  [[0x47, 0x49, 0x46, 0x38], 'image/gif'],
  [[0x25, 0x50, 0x44, 0x46], 'application/pdf'],
  [[0x50, 0x4b, 0x03, 0x04], 'application/zip'],
  [[0x1f, 0x8b], 'application/gzip'],
];

export function sniffMime(bytes: Uint8Array): string | null {
  for (const [sig, mime] of SIGNATURES) {
    if (sig.every((b, i) => bytes[i] === b)) return mime;
  }
  const riff = String.fromCharCode(...bytes.subarray(0, 4));
  const webp = String.fromCharCode(...bytes.subarray(8, 12));
  if (riff === 'RIFF' && webp === 'WEBP') return 'image/webp';
  const head = String.fromCharCode(...bytes.subarray(0, 64)).trimStart();
  if (head.startsWith('<svg') || (head.startsWith('<?xml') && head.includes('<svg')))
    return 'image/svg+xml';
  return null;
}

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'application/gzip': 'gz',
  'application/json': 'json',
  'text/plain': 'txt',
};

export function extensionFor(mime: string | null): string {
  return (mime && EXTENSIONS[mime]) || 'bin';
}

export function formatBytes(n: number, locale: string): string {
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB'];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toLocaleString(locale, { maximumFractionDigits: 1 })} ${units[i]}`;
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/base64`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/base64/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'base64',
  category: 'enc',
  icon: 'file-code',
  slug: { es: 'codificar-decodificar-base64', en: 'base64-encode-decode' },
  name: { es: 'Base64', en: 'Base64' },
  title: {
    es: 'Codificar y decodificar Base64 online (texto y archivos)',
    en: 'Base64 encode and decode online (text and files)',
  },
  description: {
    es: 'Codifica y decodifica Base64 al escribir, con detección automática y variante URL-safe. Convierte archivos en data URI y Base64 en archivos.',
    en: 'Encode and decode Base64 as you type, with automatic detection and a URL-safe variant. Turn files into data URIs and Base64 back into files.',
  },
  keywords: {
    es: [
      'base64',
      'codificar base64',
      'decodificar base64',
      'data uri',
      'base64 url',
      'imagen a base64',
    ],
    en: ['base64', 'base64 encode', 'base64 decode', 'data uri', 'base64url', 'image to base64'],
  },
  tabs: { es: ['Texto', 'Archivo'], en: ['Text', 'File'] },
  faq: {
    es: [
      {
        q: '¿Base64 sirve para cifrar?',
        a: 'No. Base64 solo cambia la representación de los datos: cualquiera puede decodificarlo. Para proteger información usa cifrado de verdad.',
      },
      {
        q: '¿Qué es la variante URL-safe?',
        a: 'Sustituye + por - y / por _, y quita el relleno =. Así el resultado se puede poner en una URL o en un JWT sin escaparlo.',
      },
    ],
    en: [
      {
        q: 'Is Base64 encryption?',
        a: 'No. Base64 only changes how the data is written: anyone can decode it. Use real encryption to protect information.',
      },
      {
        q: 'What is the URL-safe variant?',
        a: 'It replaces + with - and / with _, and drops the = padding, so the result fits in a URL or a JWT without escaping.',
      },
    ],
  },
};
```

`src/tools/base64/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    mode: 'Modo',
    input: 'Texto o Base64',
    placeholder: 'Escribe texto para codificarlo o pega Base64 para decodificarlo',
    urlSafe: 'URL-safe (- y _, sin =)',
    result: 'Resultado',
    encoded: 'Codificado: texto → Base64',
    decoded: 'Decodificado: Base64 → texto',
    errorInvalid: 'No es Base64 válido',
    errorInvalidHint:
      'Base64 solo usa letras, números, + y / (o - y _), con = al final. Revisa que no falte ni sobre ningún carácter.',
    errorBinary: 'Es Base64, pero no contiene texto',
    errorBinaryHint:
      'Parece un archivo (una imagen, un PDF…). Pégalo en la pestaña Archivo para descargarlo.',
    empty: 'Escribe o pega algo y el resultado aparecerá aquí.',
    fileToBase64: 'Archivo → Base64',
    fileName: 'Nombre',
    fileType: 'Tipo',
    fileSize: 'Tamaño',
    copyDataUri: 'Copiar data URI',
    copyBase64: 'Copiar Base64',
    tooBig: 'El archivo supera {max}. Para archivos tan grandes usa la línea de comandos (base64).',
    base64ToFile: 'Base64 → archivo',
    payload: 'Base64 o data URI',
    payloadPlaceholder: 'data:image/png;base64,iVBORw0KGgo…',
    payloadInvalid: 'No es Base64 válido. Si es un data URI, comprueba que incluye «;base64,».',
    payloadEmpty: 'Pega Base64 o un data URI para descargarlo como archivo.',
    detectedType: 'Tipo detectado',
    unknownType: 'desconocido',
    downloadFile: 'Descargar archivo',
    preview: 'Vista previa',
    filePrefix: 'archivo',
  },
  en: {
    mode: 'Mode',
    input: 'Text or Base64',
    placeholder: 'Type text to encode it or paste Base64 to decode it',
    urlSafe: 'URL-safe (- and _, no =)',
    result: 'Result',
    encoded: 'Encoded: text → Base64',
    decoded: 'Decoded: Base64 → text',
    errorInvalid: 'Not valid Base64',
    errorInvalidHint:
      'Base64 only uses letters, digits, + and / (or - and _), with = at the end. Check that no character is missing or extra.',
    errorBinary: 'It is Base64, but not text',
    errorBinaryHint:
      'It looks like a file (an image, a PDF…). Paste it in the File tab to download it.',
    empty: 'Type or paste something and the result will appear here.',
    fileToBase64: 'File → Base64',
    fileName: 'Name',
    fileType: 'Type',
    fileSize: 'Size',
    copyDataUri: 'Copy data URI',
    copyBase64: 'Copy Base64',
    tooBig: 'The file is larger than {max}. For files that big, use the command line (base64).',
    base64ToFile: 'Base64 → file',
    payload: 'Base64 or data URI',
    payloadPlaceholder: 'data:image/png;base64,iVBORw0KGgo…',
    payloadInvalid: 'Not valid Base64. If it is a data URI, check that it includes “;base64,”.',
    payloadEmpty: 'Paste Base64 or a data URI to download it as a file.',
    detectedType: 'Detected type',
    unknownType: 'unknown',
    downloadFile: 'Download file',
    preview: 'Preview',
    filePrefix: 'file',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/base64/content.es.md`:
```md
## Cómo funciona

Base64 representa datos binarios con 64 caracteres seguros (letras, números, `+` y `/`), de modo que se pueden meter en JSON, en un correo o en una URL sin que se rompan. Cada 3 bytes se convierten en 4 caracteres, así que el resultado ocupa un tercio más que el original.

Escribe texto y se codifica al momento; pega Base64 y se decodifica. La herramienta detecta la dirección: solo decodifica si el texto es Base64 válido y el resultado es texto legible, así que una palabra como «hola» se codifica aunque use letras permitidas. Si se equivoca, fija la dirección a mano. El texto se trata como UTF-8, por lo que tildes, eñes y emojis funcionan.

## URL-safe y archivos

La variante URL-safe (RFC 4648) cambia `+` por `-` y `/` por `_` y quita el relleno `=`. Es la que usan los JWT y la que conviene para meter Base64 en una URL. Al decodificar se aceptan las dos variantes.

En la pestaña **Archivo** puedes convertir una imagen o un PDF en un data URI (`data:image/png;base64,…`) listo para pegar en CSS o HTML, o hacer el camino inverso: pegar Base64 o un data URI y descargar el archivo. El tipo se detecta por la cabecera del archivo cuando el data URI no lo indica.
```

`src/tools/base64/content.en.md`:
```md
## How it works

Base64 writes binary data with 64 safe characters (letters, digits, `+` and `/`), so it can travel inside JSON, an email or a URL without breaking. Every 3 bytes become 4 characters, so the result is a third larger than the original.

Type text and it is encoded right away; paste Base64 and it is decoded. The tool detects the direction: it only decodes when the input is valid Base64 and the result is readable text, so a word like “hello” is encoded even though it only uses allowed letters. If it guesses wrong, set the direction by hand. Text is treated as UTF-8, so accents and emoji work.

## URL-safe and files

The URL-safe variant (RFC 4648) swaps `+` for `-` and `/` for `_` and drops the `=` padding. JWTs use it, and it is the one to use when Base64 goes inside a URL. Both variants are accepted when decoding.

In the **File** tab you can turn an image or a PDF into a data URI (`data:image/png;base64,…`) ready to paste into CSS or HTML, or go the other way: paste Base64 or a data URI and download the file. When the data URI does not say, the type is detected from the file header.
```

- [ ] **Step 8: `src/tools/base64/Base64.svelte`**
```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { bytesToBase64 } from '../../lib/bytes';
  import { downloadBlob } from '../../lib/download';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import FileDrop from '../../ui/FileDrop.svelte';
  import Led from '../../ui/Led.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    MAX_FILE_BYTES,
    convert,
    extensionFor,
    formatBytes,
    parseBase64Payload,
    sniffMime,
    toDataUri,
    type DirectionMode,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('base64', '', meta.rememberInput ?? true);

  let tab = $state<'text' | 'file'>('text');
  let mode = $state<DirectionMode>('auto');
  let urlSafe = $state(false);

  const result = $derived(input.value ? convert(input.value, mode, urlSafe) : null);
  const output = $derived(result?.ok ? result.output : '');
  const ledState = $derived(!result ? 'idle' : result.ok ? 'ok' : 'bad');
  const ledLabel = $derived.by(() => {
    if (!result) return t(locale, 'led.idle');
    if (!result.ok) return result.error === 'binary' ? s.errorBinary : s.errorInvalid;
    return result.direction === 'encode' ? s.encoded : s.decoded;
  });

  function useOutput() {
    if (!result?.ok) return;
    input.value = result.output;
    if (mode !== 'auto') mode = mode === 'encode' ? 'decode' : 'encode';
  }

  interface LoadedFile {
    name: string;
    size: number;
    mime: string;
    dataUri: string;
    base64: string;
  }
  let file = $state<LoadedFile | null>(null);
  let fileError = $state('');

  async function onfile(f: File) {
    fileError = '';
    file = null;
    if (f.size > MAX_FILE_BYTES) {
      fileError = fill(s.tooBig, { max: formatBytes(MAX_FILE_BYTES, locale) });
      return;
    }
    const bytes = new Uint8Array(await f.arrayBuffer());
    const mime = f.type || sniffMime(bytes) || 'application/octet-stream';
    file = {
      name: f.name,
      size: f.size,
      mime,
      dataUri: toDataUri(bytes, mime),
      base64: bytesToBase64(bytes),
    };
  }

  let payload = $state('');
  const decoded = $derived(payload.trim() ? parseBase64Payload(payload) : null);
  const previewUri = $derived(
    decoded?.mime?.startsWith('image/') ? toDataUri(decoded.bytes, decoded.mime) : '',
  );

  function downloadDecoded() {
    if (!decoded) return;
    const mime = decoded.mime ?? 'application/octet-stream';
    downloadBlob(
      new Blob([decoded.bytes.slice()], { type: mime }),
      `${s.filePrefix}.${extensionFor(decoded.mime)}`,
    );
  }

  const clip = (v: string, n = 400) => (v.length > n ? `${v.slice(0, n)}…` : v);
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'text', label: meta.tabs![locale][0] },
      { value: 'file', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    {#if tab === 'text'}
      <Field id="base64-input" label={s.input}>
        {#snippet children({ describedby })}
          <TextArea
            id="base64-input"
            bind:value={input.value}
            placeholder={s.placeholder}
            {describedby}
            invalid={ledState === 'bad'}
            rows={8}
          />
        {/snippet}
      </Field>

      <div class="row">
        <Segmented
          label={t(locale, 'dir.label')}
          options={[
            { value: 'auto', label: t(locale, 'dir.auto') },
            { value: 'encode', label: t(locale, 'dir.encode') },
            { value: 'decode', label: t(locale, 'dir.decode') },
          ]}
          bind:value={mode}
        />
        <Toggle bind:checked={urlSafe} label={s.urlSafe} />
      </div>

      <Display live label={s.result}>
        {#snippet head()}
          <Led state={ledState} label={ledLabel} />
        {/snippet}
        {#if result && !result.ok}
          <p class="display-note">
            {result.error === 'binary' ? s.errorBinaryHint : s.errorInvalidHint}
          </p>
        {:else if output}
          <pre class="display-code wrap">{output}</pre>
        {:else}
          <p class="display-note">{s.empty}</p>
        {/if}
      </Display>

      <div class="row">
        <CopyButton main value={output} {locale} />
        <Button variant="ghost" icon="arrow-left-right" disabled={!output} onclick={useOutput}>
          {t(locale, 'ui.useOutput')}
        </Button>
        <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}>
          {t(locale, 'ui.clear')}
        </Button>
      </div>
      <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
    {:else}
      <h2 class="sub">{s.fileToBase64}</h2>
      <FileDrop {locale} onfile={(f) => void onfile(f)} />
      {#if fileError}
        <p class="error" role="alert">{fileError}</p>
      {/if}
      {#if file}
        <Display label={s.fileToBase64}>
          <dl class="display-kv">
            <dt>{s.fileName}</dt>
            <dd>{file.name}</dd>
            <dt>{s.fileType}</dt>
            <dd>{file.mime}</dd>
            <dt>{s.fileSize}</dt>
            <dd>{formatBytes(file.size, locale)}</dd>
          </dl>
          <pre class="display-code wrap">{clip(file.dataUri)}</pre>
        </Display>
        <div class="row">
          <CopyButton main value={file.dataUri} {locale} label={s.copyDataUri} />
          <CopyButton value={file.base64} {locale} label={s.copyBase64} />
        </div>
      {/if}

      <h2 class="sub">{s.base64ToFile}</h2>
      <Field id="base64-payload" label={s.payload}>
        {#snippet children({ describedby })}
          <TextArea
            id="base64-payload"
            bind:value={payload}
            placeholder={s.payloadPlaceholder}
            {describedby}
            invalid={!!payload.trim() && !decoded}
            rows={5}
          />
        {/snippet}
      </Field>
      <Display live label={s.base64ToFile}>
        {#snippet head()}
          <Led
            state={!payload.trim() ? 'idle' : decoded ? 'ok' : 'bad'}
            label={!payload.trim()
              ? t(locale, 'led.idle')
              : decoded
                ? `${s.detectedType}: ${decoded.mime ?? s.unknownType} · ${formatBytes(decoded.bytes.length, locale)}`
                : s.errorInvalid}
          />
        {/snippet}
        {#if payload.trim() && !decoded}
          <p class="display-note">{s.payloadInvalid}</p>
        {:else if previewUri}
          <img class="preview" src={previewUri} alt={s.preview} />
        {:else if !decoded}
          <p class="display-note">{s.payloadEmpty}</p>
        {/if}
      </Display>
      <div class="row">
        <Button variant="secondary" disabled={!decoded} onclick={downloadDecoded}
          >{s.downloadFile}</Button
        >
      </div>
    {/if}
  </div>
</div>

<style>
  .wrap {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .sub {
    font-size: 15px;
  }
  .error {
    color: var(--bad);
    font-size: 14px;
    font-weight: 600;
  }
  .preview {
    max-width: 100%;
    max-height: 240px;
    align-self: flex-start;
    border-radius: var(--radius);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as base64 } from './base64/meta';
```
→
```ts
import { meta as base64 } from './base64/meta';
```
y
```ts
  // base64,
```
→
```ts
  base64,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Base64 from '../tools/base64/Base64.svelte';
```
→
```astro
import Base64 from '../tools/base64/Base64.svelte';
```
y
```astro
{/* {id === 'base64' && <Base64 client:load locale={locale} />} */}
```
→
```astro
{id === 'base64' && <Base64 client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build
ls dist/es/codificar-decodificar-base64.html dist/en/base64-encode-decode.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `base64` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

A mano con `pnpm preview`, en `/es/codificar-decodificar-base64`:
1. Escribir `Hola` → `SG9sYQ==` al instante y LED «Codificado». Pegar `SG9sYQ==` → `Hola` y LED «Decodificado».
2. Escribir `hola` → se codifica (`aG9sYQ==`); no se intenta decodificar.
3. «URL-safe» con `¿?>` → `wr8_Pg`. Forzar «Decodificar» con `no es base64!` → LED «No es Base64 válido» y la pista de qué revisar.
4. «Usar el resultado como entrada» invierte la operación. `c` fuera del textarea copia el resultado; `2` cambia a Archivo.
5. En Archivo, soltar un PNG → tipo `image/png`, data URI truncado y «Copiar data URI». Pegar ese data URI abajo → vista previa y «Descargar archivo» baja `archivo.png`.
6. Recarga: el texto sigue (recordar activado). Desactívalo y recarga: vacío.

- [ ] **Step 11: Commit**

```bash
git add src/tools/base64 src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más. Si `pnpm format` retocó archivos que no son de esta tarea, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(base64): detección de dirección, URL-safe y conversión de archivos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: URL: codificar y analizar URLs

**Files:**
- Create: `src/tools/url/logic.ts`, `src/tools/url/logic.test.ts`, `src/tools/url/meta.ts`, `src/tools/url/strings.ts`, `src/tools/url/content.es.md`, `src/tools/url/content.en.md`, `src/tools/url/Url.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `fill`; `t` (`dir.*`, `ui.useOutput`, `ui.clear`, `led.idle`, `tool.remember`); kit: `Segmented`, `Field`, `TextArea`, `Toggle`, `Display`, `Led`, `CopyButton`, `Button`, `persistedInput`.
- Produces:
  - `type UrlMode = 'component' | 'uri'`, `type Direction`, `type DirectionMode`, `type ConvertResult = { ok: true; direction; output } | { ok: false; direction: 'decode'; error: 'malformed' }`
  - `encodeUrl(text, mode?: UrlMode = 'component'): string`, `decodeUrl(text, mode?, plusAsSpace?: boolean = false): string` (lanza `URIError`), `detectDirection(input): Direction`, `convert(input, mode, urlMode, plusAsSpace?): ConvertResult`
  - `interface ParsedUrl { href; protocol; username; password (enmascarada); hostname; port; defaultPort; pathname; search; hash; params: [string, string][]; assumedScheme: boolean }`, `parseUrl(input: string): ParsedUrl | null`
  - `meta: ToolMeta` (id `url`, slugs `codificar-decodificar-url` / `url-encode-decode`), `strings: Record<Locale, …>`, componente `Url` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 13: `#url-input`, `.display-code` (resultado), pestaña «Analizar URL», `.display-kv` (partes), `.display-row` (un parámetro por fila).

**§7 (vinculante):** `url` · enc · Codificar · Analizar URL · «Detección de dirección. Modos `encodeURIComponent` y `encodeURI`. Analizar URL desglosa protocolo, host, puerto, ruta, hash y una tabla de query params ya decodificados».

Cómo se cubre cada punto:
- Detección: `detectDirection` (si hay alguna secuencia `%XX`, decodifica) y dirección fijable con `dir.*`. Tests `detectDirection` y `convert`.
- Dos modos: `Segmented` Componente (`encodeURIComponent`) / URL completa (`encodeURI`). Test `keeps URL structure intact in encodeURI mode`.
- Analizar URL: `parseUrl` con protocolo, usuario, host, puerto (o «443 (por defecto)»), ruta, fragmento y parámetros ya decodificados, repetidos incluidos, cada uno con su copiar. Tests `parseUrl`.
- Extra: «Leer + como espacio» para datos de formulario; sin esquema se supone `https://` (también con `localhost:3000`).
- Un solo input para las dos pestañas: pegas la URL una vez y la codificas o la desglosas.
- La herramienta antigua no tenía tests; `encodes a component like encodeURIComponent` fija su comportamiento.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-url -b plan-b/url   # desde el commit de la Task 0
cd ../devtools-url
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta tarea (Segmented, Field, TextArea, Toggle, Display, Led, CopyButton, Button) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente de la Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/url/logic.test.ts` (la herramienta antigua no tenía tests; estos fijan su comportamiento y el nuevo):
```ts
import { describe, expect, it } from 'vitest';
import { convert, decodeUrl, detectDirection, encodeUrl, parseUrl } from './logic';

describe('encodeUrl / decodeUrl', () => {
  it('encodes a component like encodeURIComponent (legacy behaviour)', () => {
    expect(encodeUrl('a b&c=d/é')).toBe('a%20b%26c%3Dd%2F%C3%A9');
    expect(decodeUrl('a%20b%26c%3Dd%2F%C3%A9')).toBe('a b&c=d/é');
  });

  it('keeps URL structure intact in encodeURI mode', () => {
    expect(encodeUrl('https://x.com/a b?q=1&r=é', 'uri')).toBe('https://x.com/a%20b?q=1&r=%C3%A9');
    expect(decodeUrl('a%2Fb%20c', 'uri')).toBe('a%2Fb c');
    expect(decodeUrl('a%2Fb%20c', 'component')).toBe('a/b c');
  });

  it('optionally reads + as a space (form data)', () => {
    expect(decodeUrl('a+b%2B', 'component', true)).toBe('a b+');
    expect(decodeUrl('a+b', 'component', false)).toBe('a+b');
  });

  it('throws on malformed escapes', () => {
    expect(() => decodeUrl('%E0%A4%A')).toThrow(URIError);
  });
});

describe('detectDirection', () => {
  it('decodes when there are %XX escapes', () => {
    expect(detectDirection('hello%20world')).toBe('decode');
    expect(detectDirection('https://x.com/?q=caf%C3%A9')).toBe('decode');
  });

  it('encodes plain text, including a lone percent sign', () => {
    expect(detectDirection('a b&c')).toBe('encode');
    expect(detectDirection('100% real')).toBe('encode');
    expect(detectDirection('')).toBe('encode');
  });
});

describe('convert', () => {
  it('uses the detected direction in auto mode', () => {
    expect(convert('a b', 'auto', 'component')).toEqual({
      ok: true,
      direction: 'encode',
      output: 'a%20b',
    });
    expect(convert('a%20b', 'auto', 'component')).toEqual({
      ok: true,
      direction: 'decode',
      output: 'a b',
    });
  });

  it('lets the user force encoding of already-encoded text', () => {
    expect(convert('a%20b', 'encode', 'component')).toEqual({
      ok: true,
      direction: 'encode',
      output: 'a%2520b',
    });
  });

  it('reports malformed input instead of throwing', () => {
    expect(convert('%E0%A4%A', 'auto', 'component')).toEqual({
      ok: false,
      direction: 'decode',
      error: 'malformed',
    });
  });
});

describe('parseUrl', () => {
  it('splits every part and decodes the query parameters', () => {
    const p = parseUrl(
      'https://ana:secreto@api.example.com:8443/v1/buscar%20algo?q=caf%C3%A9&tag=a&tag=b&x=1+2#sección',
    );
    expect(p).toMatchObject({
      protocol: 'https:',
      username: 'ana',
      password: '•••••••',
      hostname: 'api.example.com',
      port: '8443',
      defaultPort: '443',
      pathname: '/v1/buscar algo',
      hash: '#sección',
      assumedScheme: false,
    });
    expect(p!.params).toEqual([
      ['q', 'café'],
      ['tag', 'a'],
      ['tag', 'b'],
      ['x', '1 2'],
    ]);
  });

  it('shows the default port when none is written', () => {
    const p = parseUrl('http://example.com/');
    expect(p!.port).toBe('');
    expect(p!.defaultPort).toBe('80');
  });

  it('assumes https when the scheme is missing', () => {
    const p = parseUrl('example.com/a?b=1');
    expect(p!.assumedScheme).toBe(true);
    expect(p!.hostname).toBe('example.com');
    expect(p!.params).toEqual([['b', '1']]);
    const local = parseUrl('localhost:3000/api');
    expect(local).toMatchObject({
      hostname: 'localhost',
      port: '3000',
      pathname: '/api',
      assumedScheme: true,
    });
  });

  it('keeps malformed escapes in the path as they are', () => {
    expect(parseUrl('https://x.com/a%ZZb')!.pathname).toBe('/a%ZZb');
  });

  it('returns null for text that is not a URL', () => {
    expect(parseUrl('')).toBeNull();
    expect(parseUrl('http://')).toBeNull();
    expect(parseUrl('not a url')).toBeNull();
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/url`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/url/logic.ts`**
```ts
export type UrlMode = 'component' | 'uri';
export type Direction = 'encode' | 'decode';
export type DirectionMode = 'auto' | Direction;
export type ConvertResult =
  | { ok: true; direction: Direction; output: string }
  | { ok: false; direction: 'decode'; error: 'malformed' };

export function encodeUrl(text: string, mode: UrlMode = 'component'): string {
  return mode === 'component' ? encodeURIComponent(text) : encodeURI(text);
}

/** Throws URIError on malformed sequences such as "%E0%A4%A". */
export function decodeUrl(text: string, mode: UrlMode = 'component', plusAsSpace = false): string {
  const s = plusAsSpace ? text.replace(/\+/g, ' ') : text;
  return mode === 'component' ? decodeURIComponent(s) : decodeURI(s);
}

const ESCAPE = /%[0-9A-Fa-f]{2}/;

/** "decode" when the text contains at least one %XX escape; otherwise "encode". */
export function detectDirection(input: string): Direction {
  return ESCAPE.test(input) ? 'decode' : 'encode';
}

export function convert(
  input: string,
  mode: DirectionMode,
  urlMode: UrlMode,
  plusAsSpace = false,
): ConvertResult {
  const direction = mode === 'auto' ? detectDirection(input) : mode;
  if (direction === 'encode') return { ok: true, direction, output: encodeUrl(input, urlMode) };
  try {
    return { ok: true, direction, output: decodeUrl(input, urlMode, plusAsSpace) };
  } catch {
    return { ok: false, direction, error: 'malformed' };
  }
}

export interface ParsedUrl {
  href: string;
  protocol: string;
  username: string;
  password: string;
  hostname: string;
  port: string;
  defaultPort: string;
  pathname: string;
  search: string;
  hash: string;
  params: [string, string][];
  assumedScheme: boolean;
}

const DEFAULT_PORTS: Record<string, string> = {
  'http:': '80',
  'https:': '443',
  'ws:': '80',
  'wss:': '443',
  'ftp:': '21',
};

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

// "localhost:3000" is a host and port, not a scheme.
const SCHEME = /^[a-z][a-z0-9+.-]*:(?!\d)/i;

/** Parses a URL. Without a scheme ("example.com/a?b=1") it assumes https://. */
export function parseUrl(input: string): ParsedUrl | null {
  const raw = input.trim();
  if (!raw) return null;
  const assumedScheme = !SCHEME.test(raw);
  let url: URL;
  try {
    url = new URL(assumedScheme ? `https://${raw}` : raw);
  } catch {
    return null;
  }
  return {
    href: url.href,
    protocol: url.protocol,
    username: safeDecode(url.username),
    password: url.password ? '•'.repeat(url.password.length) : '',
    hostname: url.hostname,
    port: url.port,
    defaultPort: DEFAULT_PORTS[url.protocol] ?? '',
    pathname: safeDecode(url.pathname),
    search: url.search,
    hash: safeDecode(url.hash),
    params: [...url.searchParams.entries()],
    assumedScheme,
  };
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/url`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/url/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'url',
  category: 'enc',
  icon: 'link',
  slug: { es: 'codificar-decodificar-url', en: 'url-encode-decode' },
  name: { es: 'URL', en: 'URL' },
  title: {
    es: 'Codificar y decodificar URL online y analizar URLs',
    en: 'URL encode and decode online, plus a URL parser',
  },
  description: {
    es: 'Codifica y decodifica URLs al escribir (encodeURIComponent o encodeURI) y desglosa cualquier URL: host, puerto, ruta, hash y parámetros.',
    en: 'Encode and decode URLs as you type (encodeURIComponent or encodeURI) and break any URL down: host, port, path, hash and query params.',
  },
  keywords: {
    es: [
      'codificar url',
      'decodificar url',
      'urlencode',
      'percent encoding',
      'parametros url',
      'analizar url',
    ],
    en: ['url encode', 'url decode', 'urlencode', 'percent encoding', 'query string', 'url parser'],
  },
  tabs: { es: ['Codificar', 'Analizar URL'], en: ['Encode', 'Parse URL'] },
  faq: {
    es: [
      {
        q: '¿Qué diferencia hay entre encodeURIComponent y encodeURI?',
        a: 'encodeURIComponent escapa también / ? & = y #, así que sirve para un valor suelto (un parámetro). encodeURI respeta esos caracteres y sirve para una URL completa.',
      },
    ],
    en: [
      {
        q: 'What is the difference between encodeURIComponent and encodeURI?',
        a: 'encodeURIComponent also escapes / ? & = and #, so it suits a single value (a parameter). encodeURI keeps those characters and suits a whole URL.',
      },
    ],
  },
};
```

`src/tools/url/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    mode: 'Modo',
    input: 'Texto o URL',
    placeholder: 'https://ejemplo.com/buscar?q=café con leche&orden=desc',
    variant: 'Variante',
    component: 'Componente (encodeURIComponent)',
    uri: 'URL completa (encodeURI)',
    plusAsSpace: 'Leer + como espacio',
    result: 'Resultado',
    encoded: 'Codificado',
    decoded: 'Decodificado',
    malformed: 'Secuencia % mal formada',
    malformedHint:
      'Cada % debe ir seguido de dos cifras hexadecimales (%20, %C3%A9). Si el % es literal, codifícalo como %25 o fuerza «Codificar».',
    empty: 'Escribe texto o pega una URL y el resultado aparecerá aquí.',
    parsed: 'Partes de la URL',
    invalidUrl: 'No es una URL válida',
    invalidUrlHint: 'Pega una URL completa, por ejemplo https://ejemplo.com/ruta?a=1.',
    parseEmpty: 'Pega una URL para ver sus partes.',
    assumed: 'No tenía esquema: se ha supuesto https://',
    protocol: 'Protocolo',
    host: 'Host',
    port: 'Puerto',
    defaultPort: '{port} (por defecto)',
    path: 'Ruta',
    hash: 'Fragmento',
    user: 'Usuario',
    password: 'Contraseña',
    params: 'Parámetros ({n})',
    noParams: 'Sin parámetros de consulta.',
    key: 'Clave',
    value: 'Valor',
    none: '—',
  },
  en: {
    mode: 'Mode',
    input: 'Text or URL',
    placeholder: 'https://example.com/search?q=café au lait&sort=desc',
    variant: 'Variant',
    component: 'Component (encodeURIComponent)',
    uri: 'Whole URL (encodeURI)',
    plusAsSpace: 'Read + as a space',
    result: 'Result',
    encoded: 'Encoded',
    decoded: 'Decoded',
    malformed: 'Malformed % sequence',
    malformedHint:
      'Every % must be followed by two hex digits (%20, %C3%A9). If the % is literal, write it as %25 or force “Encode”.',
    empty: 'Type text or paste a URL and the result will appear here.',
    parsed: 'URL parts',
    invalidUrl: 'Not a valid URL',
    invalidUrlHint: 'Paste a full URL, for example https://example.com/path?a=1.',
    parseEmpty: 'Paste a URL to see its parts.',
    assumed: 'It had no scheme: https:// was assumed',
    protocol: 'Protocol',
    host: 'Host',
    port: 'Port',
    defaultPort: '{port} (default)',
    path: 'Path',
    hash: 'Fragment',
    user: 'User',
    password: 'Password',
    params: 'Parameters ({n})',
    noParams: 'No query parameters.',
    key: 'Key',
    value: 'Value',
    none: '—',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/url/content.es.md`:
```md
## Cómo funciona

Las URL solo admiten un conjunto limitado de caracteres. El resto (espacios, tildes, `&` dentro de un valor…) se escribe como `%` seguido de dos cifras hexadecimales por cada byte UTF-8: un espacio es `%20` y una «é» es `%C3%A9`. Esta herramienta codifica y decodifica mientras escribes y detecta la dirección sola: si el texto ya tiene secuencias `%XX`, lo decodifica.

Hay dos modos. **Componente** (`encodeURIComponent`) escapa también `/ ? & = #`, y es el que necesitas para el valor de un parámetro. **URL completa** (`encodeURI`) respeta esos caracteres para no romper la estructura de la dirección. En formularios HTML el espacio se envía como `+`; activa «Leer + como espacio» para decodificarlos.

## Analizar una URL

La pestaña **Analizar URL** separa protocolo, usuario, host, puerto (o el de por defecto, 443 en HTTPS), ruta y fragmento, y lista los parámetros de consulta ya decodificados, cada uno con su botón de copiar. Si pegas una dirección sin `https://`, se supone ese esquema. Es útil para revisar enlaces de campañas con muchos `utm_`, redirecciones o callbacks de OAuth.
```

`src/tools/url/content.en.md`:
```md
## How it works

URLs only allow a limited set of characters. Everything else (spaces, accents, an `&` inside a value…) is written as `%` followed by two hex digits for each UTF-8 byte: a space is `%20` and an “é” is `%C3%A9`. This tool encodes and decodes as you type and detects the direction on its own: if the text already has `%XX` sequences, it decodes it.

There are two modes. **Component** (`encodeURIComponent`) also escapes `/ ? & = #`, and it is what you need for a parameter value. **Whole URL** (`encodeURI`) keeps those characters so the address structure stays intact. HTML forms send spaces as `+`; turn on “Read + as a space” to decode them.

## Parsing a URL

The **Parse URL** tab splits out the protocol, user, host, port (or the default one, 443 for HTTPS), path and fragment, and lists the query parameters already decoded, each with its own copy button. If you paste an address without `https://`, that scheme is assumed. It helps when checking campaign links full of `utm_` parameters, redirects or OAuth callbacks.
```

- [ ] **Step 8: `src/tools/url/Url.svelte`**
```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { convert, parseUrl, type DirectionMode, type UrlMode } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  // One input for both tabs: paste a URL once, then encode it or look at its parts.
  const input = persistedInput('url', '', meta.rememberInput ?? true);

  let tab = $state<'encode' | 'parse'>('encode');
  let mode = $state<DirectionMode>('auto');
  let urlMode = $state<UrlMode>('component');
  let plusAsSpace = $state(false);

  const result = $derived(input.value ? convert(input.value, mode, urlMode, plusAsSpace) : null);
  const output = $derived(result?.ok ? result.output : '');
  const ledState = $derived(!result ? 'idle' : result.ok ? 'ok' : 'bad');
  const ledLabel = $derived(
    !result
      ? t(locale, 'led.idle')
      : !result.ok
        ? s.malformed
        : result.direction === 'encode'
          ? s.encoded
          : s.decoded,
  );

  const parsed = $derived(input.value.trim() ? parseUrl(input.value) : null);
  const queryText = $derived(parsed ? parsed.params.map(([k, v]) => `${k}=${v}`).join('\n') : '');

  function useOutput() {
    if (!result?.ok) return;
    input.value = result.output;
    if (mode !== 'auto') mode = mode === 'encode' ? 'decode' : 'encode';
  }
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'encode', label: meta.tabs![locale][0] },
      { value: 'parse', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    <Field id="url-input" label={s.input}>
      {#snippet children({ describedby })}
        <TextArea
          id="url-input"
          bind:value={input.value}
          placeholder={s.placeholder}
          {describedby}
          invalid={tab === 'encode' ? ledState === 'bad' : !!input.value.trim() && !parsed}
          rows={4}
        />
      {/snippet}
    </Field>

    {#if tab === 'encode'}
      <div class="row">
        <Segmented
          label={t(locale, 'dir.label')}
          options={[
            { value: 'auto', label: t(locale, 'dir.auto') },
            { value: 'encode', label: t(locale, 'dir.encode') },
            { value: 'decode', label: t(locale, 'dir.decode') },
          ]}
          bind:value={mode}
        />
        <Segmented
          label={s.variant}
          options={[
            { value: 'component', label: s.component },
            { value: 'uri', label: s.uri },
          ]}
          bind:value={urlMode}
        />
        <Toggle bind:checked={plusAsSpace} label={s.plusAsSpace} />
      </div>

      <Display live label={s.result}>
        {#snippet head()}
          <Led state={ledState} label={ledLabel} />
        {/snippet}
        {#if result && !result.ok}
          <p class="display-note">{s.malformedHint}</p>
        {:else if output}
          <pre class="display-code wrap">{output}</pre>
        {:else}
          <p class="display-note">{s.empty}</p>
        {/if}
      </Display>

      <div class="row">
        <CopyButton main value={output} {locale} />
        <Button variant="ghost" icon="arrow-left-right" disabled={!output} onclick={useOutput}>
          {t(locale, 'ui.useOutput')}
        </Button>
        <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}>
          {t(locale, 'ui.clear')}
        </Button>
      </div>
    {:else}
      <Display live label={s.parsed}>
        {#snippet head()}
          <Led
            state={!input.value.trim() ? 'idle' : parsed ? 'ok' : 'bad'}
            label={!input.value.trim()
              ? t(locale, 'led.idle')
              : parsed
                ? parsed.hostname
                : s.invalidUrl}
          />
        {/snippet}
        {#if parsed}
          {#if parsed.assumedScheme}<p class="display-note">{s.assumed}</p>{/if}
          <dl class="display-kv">
            <dt>{s.protocol}</dt>
            <dd>{parsed.protocol}</dd>
            {#if parsed.username}
              <dt>{s.user}</dt>
              <dd>{parsed.username}</dd>
            {/if}
            {#if parsed.password}
              <dt>{s.password}</dt>
              <dd>{parsed.password}</dd>
            {/if}
            <dt>{s.host}</dt>
            <dd>{parsed.hostname}</dd>
            <dt>{s.port}</dt>
            <dd>
              {parsed.port ||
                (parsed.defaultPort ? fill(s.defaultPort, { port: parsed.defaultPort }) : s.none)}
            </dd>
            <dt>{s.path}</dt>
            <dd>{parsed.pathname}</dd>
            <dt>{s.hash}</dt>
            <dd>{parsed.hash || s.none}</dd>
          </dl>
        {:else if input.value.trim()}
          <p class="display-note">{s.invalidUrlHint}</p>
        {:else}
          <p class="display-note">{s.parseEmpty}</p>
        {/if}
      </Display>

      {#if parsed}
        <Display label={fill(s.params, { n: parsed.params.length })}>
          {#snippet head()}
            <span>{fill(s.params, { n: parsed.params.length })}</span>
          {/snippet}
          {#if parsed.params.length}
            <div class="display-rows">
              {#each parsed.params as [key, value], i (i)}
                <div class="display-row">
                  <span class="param"><span class="key">{key}</span> = {value}</span>
                  <CopyButton {value} {locale} compact />
                </div>
              {/each}
            </div>
          {:else}
            <p class="display-note">{s.noParams}</p>
          {/if}
        </Display>
      {/if}

      <div class="row">
        <CopyButton main value={queryText} {locale} />
        <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}>
          {t(locale, 'ui.clear')}
        </Button>
      </div>
    {/if}

    <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
  </div>
</div>

<style>
  .wrap {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .key {
    color: var(--disp-dim);
  }
  .param {
    min-width: 0;
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as url } from './url/meta';
```
→
```ts
import { meta as url } from './url/meta';
```
y
```ts
  // url,
```
→
```ts
  url,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Url from '../tools/url/Url.svelte';
```
→
```astro
import Url from '../tools/url/Url.svelte';
```
y
```astro
{/* {id === 'url' && <Url client:load locale={locale} />} */}
```
→
```astro
{id === 'url' && <Url client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build
ls dist/es/codificar-decodificar-url.html dist/en/url-encode-decode.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `url` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

A mano con `pnpm preview`, en `/es/codificar-decodificar-url`:
1. `a b&c` → `a%20b%26c` al instante; `hello%20world` → `hello world`.
2. Modo URL completa con `https://x.com/a b?q=é` → `https://x.com/a%20b?q=%C3%A9`.
3. `%E0%A4%A` → LED «Secuencia % mal formada» y la pista para arreglarlo.
4. Pestaña Analizar URL (o tecla `2`) con `https://ejemplo.com:8080/ruta?q=caf%C3%A9&q=2#fin` → puerto 8080, fragmento `#fin` y dos filas `q` con `café` y `2`.
5. `ejemplo.com/a` → aviso de esquema supuesto y puerto «443 (por defecto)».

- [ ] **Step 11: Commit**

```bash
git add src/tools/url src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más. Si `pnpm format` retocó archivos que no son de esta tarea, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(url): detección de dirección, encodeURI/encodeURIComponent y análisis de URL

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Entidades HTML: decodificador puro y modo no-ASCII

**Files:**
- Create: `src/tools/html-entities/logic.ts`, `src/tools/html-entities/logic.test.ts`, `src/tools/html-entities/meta.ts`, `src/tools/html-entities/strings.ts`, `src/tools/html-entities/content.es.md`, `src/tools/html-entities/content.en.md`, `src/tools/html-entities/HtmlEntities.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `t` (`dir.*`, `ui.useOutput`, `ui.clear`, `led.idle`, `tool.remember`); kit: `Segmented`, `Field`, `TextArea`, `Toggle`, `Display`, `Led`, `CopyButton`, `Button`, `persistedInput`.
- Produces:
  - `type EntityMode = 'minimal' | 'nonascii'`, `type Direction`, `type DirectionMode`
  - `NAMED_ENTITIES: Readonly<Record<string, string>>`: todo Latin-1 (U+00A0–U+00FF) más `amp`, `lt`, `gt`, `quot`, `apos`, comillas tipográficas, rayas, `hellip`, `euro`, `trade`, flechas y otros
  - `encodeHtmlEntities(text, mode?: EntityMode = 'minimal'): string` (API antigua), `decodeHtmlEntities(text): string` (**puro, sin DOM**, una sola pasada), `detectDirection(text): Direction`, `convert(text, mode, entityMode): { direction; output }`
  - `meta: ToolMeta` (id `html-entities`, slugs `codificar-entidades-html` / `html-entities-encoder`), `strings: Record<Locale, …>`, componente `HtmlEntities` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 13: `#html-entities-input`, `.display-code`.

**§7 (vinculante):** `html-entities` · enc · sin pestañas · «Detección de dirección. Modo "mínimo" (`& < > " '`) o "todo lo no-ASCII"».

Cómo se cubre cada punto:
- Detección: `detectDirection` (hay una entidad conocida y ningún `<` ni `>` sueltos → decodifica), fijable con `dir.*`. Tests `detectDirection`.
- Mínimo / todo lo no-ASCII: `Segmented` + `encodeHtmlEntities(text, mode)`; en no-ASCII usa el nombre si existe y si no `&#N;`. Tests `encodeHtmlEntities in "everything non-ASCII" mode`.
- Decodificador puro con la tabla pedida (amp, lt, gt, quot, apos, nbsp, copy, reg, trade, hellip, mdash, ndash, lsquo, rsquo, ldquo, rdquo, euro y las letras Latin-1): tests `decodeHtmlEntities (pure, no DOM)` y `covers the whole Latin-1 supplement`.
- Seguridad: la salida se pinta como texto dentro de `<pre>`, nunca con `{@html}`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-html-entities -b plan-b/html-entities   # desde el commit de la Task 0
cd ../devtools-html-entities
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta tarea (Segmented, Field, TextArea, Toggle, Display, Led, CopyButton, Button) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente de la Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/html-entities/logic.test.ts` (incluye los 2 tests de entidades de `legacy/src/__tests__/tools.test.ts`):
```ts
import { describe, expect, it } from 'vitest';
import {
  NAMED_ENTITIES,
  convert,
  decodeHtmlEntities,
  detectDirection,
  encodeHtmlEntities,
} from './logic';

describe('encodeHtmlEntities (legacy behaviour)', () => {
  it('encodes HTML entities', () => {
    expect(encodeHtmlEntities('<div>')).toBe('&lt;div&gt;');
    expect(encodeHtmlEntities('a & b')).toBe('a &amp; b');
    expect(encodeHtmlEntities('"hello"')).toBe('&quot;hello&quot;');
    expect(encodeHtmlEntities("it's")).toBe('it&#39;s');
  });

  it('handles text without special characters', () => {
    expect(encodeHtmlEntities('hello world')).toBe('hello world');
  });
});

describe('encodeHtmlEntities in "everything non-ASCII" mode', () => {
  it('uses names when they exist and numbers otherwise', () => {
    expect(encodeHtmlEntities('Café € 😀 <b>', 'nonascii')).toBe(
      'Caf&eacute; &euro; &#128512; &lt;b&gt;',
    );
    expect(encodeHtmlEntities('año — “hola”', 'nonascii')).toBe(
      'a&ntilde;o &mdash; &ldquo;hola&rdquo;',
    );
  });

  it('leaves non-ASCII alone in minimal mode', () => {
    expect(encodeHtmlEntities('Café', 'minimal')).toBe('Café');
  });
});

describe('decodeHtmlEntities (pure, no DOM)', () => {
  it('decodes the common named entities', () => {
    expect(decodeHtmlEntities('&lt;div class=&quot;x&quot;&gt;')).toBe('<div class="x">');
    expect(decodeHtmlEntities('&copy; &reg; &trade; &hellip; &nbsp;')).toBe('© ® ™ …  ');
    expect(decodeHtmlEntities('&mdash;&ndash;&lsquo;&rsquo;&ldquo;&rdquo;&euro;&apos;')).toBe(
      "—–‘’“”€'",
    );
    expect(decodeHtmlEntities('&Aacute;&eacute;&ntilde;&Ntilde;&uuml;&ccedil;&szlig;&yuml;')).toBe(
      'ÁéñÑüçßÿ',
    );
  });

  it('covers the whole Latin-1 supplement', () => {
    expect(NAMED_ENTITIES.nbsp).toBe(' ');
    expect(NAMED_ENTITIES.iquest).toBe('¿');
    expect(NAMED_ENTITIES.Agrave).toBe('À');
    expect(NAMED_ENTITIES.times).toBe('×');
    expect(NAMED_ENTITIES.divide).toBe('÷');
    expect(NAMED_ENTITIES.yuml).toBe('ÿ');
  });

  it('decodes decimal and hexadecimal references, including astral characters', () => {
    expect(decodeHtmlEntities('&#39;&#x27;&#X27;&#128512;&#x1F600;')).toBe("'''😀😀");
  });

  it('replaces invalid code points with U+FFFD like browsers do', () => {
    expect(decodeHtmlEntities('&#0;&#xD800;&#x110000;')).toBe('���');
  });

  it('decodes in a single pass', () => {
    expect(decodeHtmlEntities('&amp;lt;')).toBe('&lt;');
  });

  it('leaves unknown names and bare ampersands untouched', () => {
    expect(decodeHtmlEntities('&unknown; & &amp')).toBe('&unknown; & &amp');
  });

  it('round-trips with the encoder', () => {
    const s = `<a href="x">Canción ñ € 😀 & 'co'</a>`;
    expect(decodeHtmlEntities(encodeHtmlEntities(s, 'nonascii'))).toBe(s);
    expect(decodeHtmlEntities(encodeHtmlEntities(s))).toBe(s);
  });
});

describe('detectDirection', () => {
  it('decodes text with entities and no raw tags', () => {
    expect(detectDirection('&lt;p&gt;Hola&lt;/p&gt;')).toBe('decode');
    expect(detectDirection('caf&#233;')).toBe('decode');
  });

  it('encodes raw HTML, plain text and unknown entities', () => {
    expect(detectDirection('<p>a &amp; b</p>')).toBe('encode');
    expect(detectDirection('Tom & Jerry')).toBe('encode');
    expect(detectDirection('&madeup;')).toBe('encode');
  });

  it('drives convert in auto mode', () => {
    expect(convert('<b>', 'auto', 'minimal')).toEqual({ direction: 'encode', output: '&lt;b&gt;' });
    expect(convert('&lt;b&gt;', 'auto', 'minimal')).toEqual({ direction: 'decode', output: '<b>' });
    expect(convert('&lt;b&gt;', 'encode', 'minimal')).toEqual({
      direction: 'encode',
      output: '&amp;lt;b&amp;gt;',
    });
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/html-entities`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/html-entities/logic.ts`**

La versión antigua de `decodeHtmlEntities` usaba `document.createElement('textarea')`: no funciona en Vitest (`node`) ni en SSR. Esta es pura: referencias decimales y hexadecimales (con U+FFFD para NUL, sustitutos y valores fuera de rango, como hacen los navegadores) más una tabla de nombres.

```ts
export type EntityMode = 'minimal' | 'nonascii';
export type Direction = 'encode' | 'decode';
export type DirectionMode = 'auto' | Direction;

// U+00A0..U+00BF and U+00C0..U+00FF, in code point order (the full Latin-1 supplement).
const LATIN1_SYMBOLS =
  'nbsp iexcl cent pound curren yen brvbar sect uml copy ordf laquo not shy reg macr ' +
  'deg plusmn sup2 sup3 acute micro para middot cedil sup1 ordm raquo frac14 frac12 frac34 iquest';
const LATIN1_LETTERS =
  'Agrave Aacute Acirc Atilde Auml Aring AElig Ccedil Egrave Eacute Ecirc Euml Igrave Iacute Icirc Iuml ' +
  'ETH Ntilde Ograve Oacute Ocirc Otilde Ouml times Oslash Ugrave Uacute Ucirc Uuml Yacute THORN szlig ' +
  'agrave aacute acirc atilde auml aring aelig ccedil egrave eacute ecirc euml igrave iacute icirc iuml ' +
  'eth ntilde ograve oacute ocirc otilde ouml divide oslash ugrave uacute ucirc uuml yacute thorn yuml';

const OTHERS: Record<string, number> = {
  amp: 0x26,
  lt: 0x3c,
  gt: 0x3e,
  quot: 0x22,
  apos: 0x27,
  OElig: 0x152,
  oelig: 0x153,
  Scaron: 0x160,
  scaron: 0x161,
  Yuml: 0x178,
  fnof: 0x192,
  circ: 0x2c6,
  tilde: 0x2dc,
  ensp: 0x2002,
  emsp: 0x2003,
  thinsp: 0x2009,
  zwnj: 0x200c,
  zwj: 0x200d,
  ndash: 0x2013,
  mdash: 0x2014,
  lsquo: 0x2018,
  rsquo: 0x2019,
  sbquo: 0x201a,
  ldquo: 0x201c,
  rdquo: 0x201d,
  bdquo: 0x201e,
  dagger: 0x2020,
  Dagger: 0x2021,
  bull: 0x2022,
  hellip: 0x2026,
  permil: 0x2030,
  prime: 0x2032,
  lsaquo: 0x2039,
  rsaquo: 0x203a,
  euro: 0x20ac,
  trade: 0x2122,
  larr: 0x2190,
  uarr: 0x2191,
  rarr: 0x2192,
  darr: 0x2193,
  harr: 0x2194,
  infin: 0x221e,
  ne: 0x2260,
  le: 0x2264,
  ge: 0x2265,
  hearts: 0x2665,
};

function buildTable(): Record<string, string> {
  const table: Record<string, string> = {};
  LATIN1_SYMBOLS.split(' ').forEach((name, i) => (table[name] = String.fromCodePoint(0xa0 + i)));
  LATIN1_LETTERS.split(' ').forEach((name, i) => (table[name] = String.fromCodePoint(0xc0 + i)));
  for (const [name, cp] of Object.entries(OTHERS)) table[name] = String.fromCodePoint(cp);
  return table;
}

/** Entity name → character. */
export const NAMED_ENTITIES: Readonly<Record<string, string>> = buildTable();

const MINIMAL: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

// Character → name, for "everything non-ASCII". The five minimal characters keep their own form.
const BY_CHAR: Record<string, string> = Object.fromEntries(
  Object.entries(NAMED_ENTITIES)
    .filter(([, ch]) => !(ch in MINIMAL))
    .map(([name, ch]) => [ch, name]),
);

export function encodeHtmlEntities(text: string, mode: EntityMode = 'minimal'): string {
  if (mode === 'minimal') return text.replace(/[&<>"']/g, (c) => MINIMAL[c]);
  let out = '';
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (ch in MINIMAL) out += MINIMAL[ch];
    else if (cp < 0x7f) out += ch;
    else out += BY_CHAR[ch] ? `&${BY_CHAR[ch]};` : `&#${cp};`;
  }
  return out;
}

const ENTITY = /&(#[0-9]+|#[xX][0-9a-fA-F]+|[A-Za-z][A-Za-z0-9]*);/g;

function decodeOne(body: string): string | null {
  if (body[0] !== '#') return NAMED_ENTITIES[body] ?? null;
  const hex = body[1] === 'x' || body[1] === 'X';
  const cp = parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10);
  // Same rule as browsers: NUL, surrogates and out-of-range values become U+FFFD.
  if (!Number.isFinite(cp) || cp === 0 || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff))
    return '�';
  return String.fromCodePoint(cp);
}

/** Pure decoder (no DOM). Single pass: "&amp;lt;" becomes "&lt;", not "<". Unknown names stay as they are. */
export function decodeHtmlEntities(text: string): string {
  return text.replace(ENTITY, (m, body: string) => decodeOne(body) ?? m);
}

/** "decode" when the text has at least one entity we can decode and no raw "<" or ">". */
export function detectDirection(text: string): Direction {
  if (/[<>]/.test(text)) return 'encode';
  for (const m of text.matchAll(ENTITY)) {
    if (decodeOne(m[1]) !== null) return 'decode';
  }
  return 'encode';
}

export function convert(
  text: string,
  mode: DirectionMode,
  entityMode: EntityMode,
): { direction: Direction; output: string } {
  const direction = mode === 'auto' ? detectDirection(text) : mode;
  return {
    direction,
    output:
      direction === 'encode' ? encodeHtmlEntities(text, entityMode) : decodeHtmlEntities(text),
  };
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/html-entities`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/html-entities/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'html-entities',
  category: 'enc',
  icon: 'code-xml',
  slug: { es: 'codificar-entidades-html', en: 'html-entities-encoder' },
  name: { es: 'Entidades HTML', en: 'HTML entities' },
  title: {
    es: 'Codificar y decodificar entidades HTML online',
    en: 'HTML entities encoder and decoder online',
  },
  description: {
    es: 'Convierte < > & " y \' en entidades HTML, o todo lo que no sea ASCII, y decodifica &amp;, &aacute; o &#128512; al escribir.',
    en: 'Turn < > & " and \' into HTML entities, or everything non-ASCII, and decode &amp;, &eacute; or &#128512; as you type.',
  },
  keywords: {
    es: [
      'entidades html',
      'escapar html',
      'html encode',
      'html decode',
      'caracteres especiales html',
      'amp lt gt',
    ],
    en: [
      'html entities',
      'escape html',
      'html encode',
      'html decode',
      'html special characters',
      'amp lt gt',
    ],
  },
};
```

`src/tools/html-entities/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    input: 'Texto o HTML',
    placeholder: '<p class="saludo">Hola & adiós</p>',
    scope: 'Qué codificar',
    minimal: 'Mínimo (& < > " \')',
    nonascii: 'Además todo lo no-ASCII',
    result: 'Resultado',
    encoded: 'Codificado',
    decoded: 'Decodificado',
    empty: 'Escribe texto o pega HTML con entidades y el resultado aparecerá aquí.',
    unknown: 'Las entidades que no reconoce (por ejemplo &inventada;) se dejan tal cual.',
  },
  en: {
    input: 'Text or HTML',
    placeholder: '<p class="greeting">Hello & goodbye</p>',
    scope: 'What to encode',
    minimal: 'Minimal (& < > " \')',
    nonascii: 'Plus everything non-ASCII',
    result: 'Result',
    encoded: 'Encoded',
    decoded: 'Decoded',
    empty: 'Type text or paste HTML with entities and the result will appear here.',
    unknown: 'Entities it does not know (for example &madeup;) are left as they are.',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/html-entities/content.es.md`:
```md
## Cómo funciona

En HTML, los caracteres `<`, `>`, `&`, `"` y `'` tienen significado propio. Para mostrarlos como texto hay que escribirlos como entidades: `&lt;`, `&gt;`, `&amp;`, `&quot;` y `&#39;`. Es lo mínimo para pegar un fragmento de código en una página o para evitar que un texto de usuario se interprete como HTML.

El modo **Además todo lo no-ASCII** convierte también tildes, símbolos y emojis: usa el nombre de la entidad cuando existe (`&aacute;`, `&euro;`, `&mdash;`) y el número en los demás casos (`&#128512;`). Sirve para plantillas de correo o sistemas antiguos que no garantizan UTF-8.

## Decodificar

Al pegar texto con entidades, la herramienta lo detecta y lo decodifica: entidades con nombre, decimales (`&#233;`) y hexadecimales (`&#xE9;`). Lo hace en una sola pasada, así que `&amp;lt;` queda como `&lt;` y no como `<`. Las entidades que no conoce se dejan tal cual. El resultado siempre se muestra como texto, nunca se inserta como HTML en la página.
```

`src/tools/html-entities/content.en.md`:
```md
## How it works

In HTML, the characters `<`, `>`, `&`, `"` and `'` have a meaning of their own. To show them as text you write them as entities: `&lt;`, `&gt;`, `&amp;`, `&quot;` and `&#39;`. That is the minimum for pasting a code snippet into a page or for keeping user text from being read as HTML.

The **Plus everything non-ASCII** mode also converts accents, symbols and emoji: it uses the entity name when there is one (`&eacute;`, `&euro;`, `&mdash;`) and the number otherwise (`&#128512;`). It helps with email templates or legacy systems that do not guarantee UTF-8.

## Decoding

When you paste text with entities, the tool detects it and decodes it: named entities, decimal (`&#233;`) and hexadecimal (`&#xE9;`) ones. It does it in a single pass, so `&amp;lt;` becomes `&lt;` and not `<`. Entities it does not know are left as they are. The result is always shown as text and never inserted into the page as HTML.
```

- [ ] **Step 8: `src/tools/html-entities/HtmlEntities.svelte`**
```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { convert, type DirectionMode, type EntityMode } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('html-entities', '', meta.rememberInput ?? true);

  let mode = $state<DirectionMode>('auto');
  let entityMode = $state<EntityMode>('minimal');

  const result = $derived(input.value ? convert(input.value, mode, entityMode) : null);
  const output = $derived(result?.output ?? '');

  function useOutput() {
    if (!result) return;
    input.value = result.output;
    if (mode !== 'auto') mode = mode === 'encode' ? 'decode' : 'encode';
  }
</script>

<div class="panel">
  <Field id="html-entities-input" label={s.input}>
    {#snippet children({ describedby })}
      <TextArea
        id="html-entities-input"
        bind:value={input.value}
        placeholder={s.placeholder}
        {describedby}
        rows={8}
      />
    {/snippet}
  </Field>

  <div class="row">
    <Segmented
      label={t(locale, 'dir.label')}
      options={[
        { value: 'auto', label: t(locale, 'dir.auto') },
        { value: 'encode', label: t(locale, 'dir.encode') },
        { value: 'decode', label: t(locale, 'dir.decode') },
      ]}
      bind:value={mode}
    />
    <Segmented
      label={s.scope}
      options={[
        { value: 'minimal', label: s.minimal },
        { value: 'nonascii', label: s.nonascii },
      ]}
      bind:value={entityMode}
    />
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={result ? 'ok' : 'idle'}
        label={!result
          ? t(locale, 'led.idle')
          : result.direction === 'encode'
            ? s.encoded
            : s.decoded}
      />
    {/snippet}
    {#if output}
      <!-- Always rendered as text: decoded HTML must never be injected into the page. -->
      <pre class="display-code wrap">{output}</pre>
      {#if result?.direction === 'decode'}<p class="display-note">{s.unknown}</p>{/if}
    {:else}
      <p class="display-note">{s.empty}</p>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={output} {locale} />
    <Button variant="ghost" icon="arrow-left-right" disabled={!output} onclick={useOutput}>
      {t(locale, 'ui.useOutput')}
    </Button>
    <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}>
      {t(locale, 'ui.clear')}
    </Button>
  </div>
  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .wrap {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as htmlEntities } from './html-entities/meta';
```
→
```ts
import { meta as htmlEntities } from './html-entities/meta';
```
y
```ts
  // htmlEntities,
```
→
```ts
  htmlEntities,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import HtmlEntities from '../tools/html-entities/HtmlEntities.svelte';
```
→
```astro
import HtmlEntities from '../tools/html-entities/HtmlEntities.svelte';
```
y
```astro
{/* {id === 'html-entities' && <HtmlEntities client:load locale={locale} />} */}
```
→
```astro
{id === 'html-entities' && <HtmlEntities client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build
ls dist/es/codificar-entidades-html.html dist/en/html-entities-encoder.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `html-entities` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

A mano con `pnpm preview`, en `/es/codificar-entidades-html`:
1. `<p class="a">Hola & adiós</p>` → `&lt;p class=&quot;a&quot;&gt;Hola &amp; adiós&lt;/p&gt;`.
2. Modo «Además todo lo no-ASCII» → aparece `adi&oacute;s`.
3. Pegar `&lt;b&gt;caf&eacute; &#128512;` → `<b>café 😀` como texto (sin negrita) y la nota sobre entidades desconocidas.
4. Forzar «Codificar» sobre `&lt;` → `&amp;lt;`.

- [ ] **Step 11: Commit**

```bash
git add src/tools/html-entities src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más. Si `pnpm format` retocó archivos que no son de esta tarea, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(html-entities): decodificador puro, detección de dirección y modo no-ASCII

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: JWT: cabecera, payload, fechas y vigencia

**Files:**
- Create: `src/tools/jwt/logic.ts`, `src/tools/jwt/logic.test.ts`, `src/tools/jwt/meta.ts`, `src/tools/jwt/strings.ts`, `src/tools/jwt/content.es.md`, `src/tools/jwt/content.en.md`, `src/tools/jwt/Jwt.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `base64ToBytes`, `fromUtf8` y `formatRelative` (Task 0); `fill`; `t` (`ui.clear`, `led.idle`); kit: `Field`, `TextArea`, `Display`, `Led`, `CopyButton`, `Button`, `Icon` (`triangle-alert`).
- Produces:
  - `interface DecodedJwt { header; payload; signature }`, `type JwtError = 'parts' | 'header' | 'payload'`, `type InspectResult`, `type TimeClaim = 'exp' | 'nbf' | 'iat'`, `type Validity = 'valid' | 'expired' | 'notYet' | 'none'`, `TIME_CLAIMS`
  - `cleanToken(raw): string` (quita `Bearer `), `inspectJwt(raw): InspectResult`, `decodeJWT(token): DecodedJwt | null` (API antigua), `claimDate(payload, claim): Date | null`, `validity(payload, nowMs): Validity`, `getExpirationInfo(payload, nowMs?): string` (API antigua, en inglés, conservada por sus tests)
  - `meta: ToolMeta` (id `jwt`, slugs `decodificador-jwt` / `jwt-decoder`), `strings: Record<Locale, …>`, componente `Jwt` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 13: `#jwt-input`, `.display-code` (0 cabecera, 1 payload, 2 firma).

**§7 (vinculante):** `jwt` · enc · sin pestañas · «Cabecera y payload en `Display code`. `exp`, `iat` y `nbf` como fecha local + relativa, con LED vigente/caducado/aún no válido. Aviso fijo de que la firma no se verifica. `rememberInput: false`».

Cómo se cubre cada punto:
- Cabecera y payload en `Display` con `<pre class="display-code">`, cada uno con su copiar; la firma aparte.
- `exp`, `nbf` e `iat` como fecha local (`toLocaleString(locale)`) + relativa (`formatRelative`), refrescada cada 10 s. Tests `time claims`.
- LED: vigente (ok), caducado o aún no válido (bad), sin fechas (ok, «Sin fecha de caducidad»). Test `classifies the token…`.
- Aviso fijo encima del campo (`role="note"`), siempre visible.
- `rememberInput: false` en `meta` y el token en un `$state` normal, sin `persistedInput` ni interruptor. La Task 13 comprueba en e2e que no llega a `localStorage`.
- Mejoras: decodifica UTF-8 (la versión antigua rompía las tildes con `atob`), acepta `Bearer …` y dice qué parte falla.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-jwt -b plan-b/jwt   # desde el commit de la Task 0
cd ../devtools-jwt
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta tarea (Field, TextArea, Display, Led, CopyButton, Button, Icon) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente de la Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/jwt/logic.test.ts` (incluye los 3 tests de JWT de `legacy/src/__tests__/tools.test.ts`):
```ts
import { describe, expect, it } from 'vitest';
import { bytesToBase64, utf8 } from '../../lib/bytes';
import { claimDate, cleanToken, decodeJWT, getExpirationInfo, inspectJwt, validity } from './logic';

const b64url = (o: unknown) => bytesToBase64(utf8(JSON.stringify(o)), true);
const token = (payload: unknown, header: unknown = { alg: 'HS256', typ: 'JWT' }) =>
  `${b64url(header)}.${b64url(payload)}.firma`;

describe('decodeJWT (legacy behaviour)', () => {
  const validJWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  it('decodes a valid JWT', () => {
    const result = decodeJWT(validJWT);
    expect(result).not.toBeNull();
    expect(result!.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(result!.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
    expect(result!.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  });

  it('returns null for invalid JWT', () => {
    expect(decodeJWT('not.a.jwt.token')).toBeNull();
    expect(decodeJWT('invalid')).toBeNull();
  });

  it('shows expiration info', () => {
    expect(getExpirationInfo({ exp: Math.floor(Date.now() / 1000) - 3600 })).toContain('Expired');
    expect(getExpirationInfo({ exp: Math.floor(Date.now() / 1000) + 3600 })).toContain('Expires');
    expect(getExpirationInfo({})).toBe('No expiration');
  });
});

describe('inspectJwt', () => {
  it('decodes UTF-8 payloads correctly (the old atob version broke accents)', () => {
    const r = inspectJwt(token({ name: 'José Núñez', emoji: '✓' }));
    expect(r.ok && r.jwt.payload).toEqual({ name: 'José Núñez', emoji: '✓' });
  });

  it('accepts a pasted Authorization header', () => {
    expect(cleanToken('  Bearer abc.def.ghi \n')).toBe('abc.def.ghi');
    expect(inspectJwt(`Bearer ${token({ a: 1 })}`).ok).toBe(true);
  });

  it('says which part is wrong', () => {
    expect(inspectJwt('a.b')).toEqual({ ok: false, error: 'parts' });
    expect(inspectJwt(`xx.${b64url({ a: 1 })}.s`)).toEqual({ ok: false, error: 'header' });
    expect(inspectJwt(`${b64url({ alg: 'none' })}.bm90IGpzb24.s`)).toEqual({
      ok: false,
      error: 'payload',
    });
    expect(inspectJwt(`${b64url({ alg: 'none' })}.${b64url([1, 2])}.s`)).toEqual({
      ok: false,
      error: 'payload',
    });
  });
});

describe('time claims', () => {
  const NOW = Date.UTC(2026, 8, 26, 12, 0, 0);
  const at = (ms: number) => Math.floor(ms / 1000);

  it('reads exp, nbf and iat as dates', () => {
    expect(claimDate({ iat: 1516239022 }, 'iat')).toEqual(new Date('2018-01-18T01:30:22.000Z'));
    expect(claimDate({ exp: '1516239022' }, 'exp')).toBeNull();
    expect(claimDate({}, 'nbf')).toBeNull();
  });

  it('classifies the token as valid, expired, not yet valid or without dates', () => {
    expect(validity({ exp: at(NOW + 3_600_000) }, NOW)).toBe('valid');
    expect(validity({ exp: at(NOW - 1000) }, NOW)).toBe('expired');
    expect(validity({ exp: at(NOW) }, NOW)).toBe('expired');
    expect(validity({ nbf: at(NOW + 60_000), exp: at(NOW + 3_600_000) }, NOW)).toBe('notYet');
    expect(validity({ nbf: at(NOW - 60_000) }, NOW)).toBe('valid');
    expect(validity({ iat: at(NOW) }, NOW)).toBe('none');
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/jwt`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/jwt/logic.ts`**
```ts
import { base64ToBytes, fromUtf8 } from '../../lib/bytes';

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

export type JwtError = 'parts' | 'header' | 'payload';
export type InspectResult = { ok: true; jwt: DecodedJwt } | { ok: false; error: JwtError };
export type TimeClaim = 'exp' | 'nbf' | 'iat';
export type Validity = 'valid' | 'expired' | 'notYet' | 'none';

export const TIME_CLAIMS: TimeClaim[] = ['exp', 'nbf', 'iat'];

/** Removes a leading "Bearer " and surrounding whitespace, so a pasted Authorization header works. */
export function cleanToken(raw: string): string {
  return raw
    .trim()
    .replace(/^bearer\s+/i, '')
    .trim();
}

function decodeSegment(segment: string): Record<string, unknown> | null {
  const bytes = base64ToBytes(segment);
  if (!bytes) return null;
  try {
    const value: unknown = JSON.parse(fromUtf8(bytes, true));
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function inspectJwt(raw: string): InspectResult {
  const parts = cleanToken(raw).split('.');
  if (parts.length !== 3) return { ok: false, error: 'parts' };
  const header = decodeSegment(parts[0]);
  if (!header) return { ok: false, error: 'header' };
  const payload = decodeSegment(parts[1]);
  if (!payload) return { ok: false, error: 'payload' };
  return { ok: true, jwt: { header, payload, signature: parts[2] } };
}

/** Legacy API: null when the token cannot be decoded. */
export function decodeJWT(token: string): DecodedJwt | null {
  const r = inspectJwt(token);
  return r.ok ? r.jwt : null;
}

export function claimDate(payload: Record<string, unknown>, claim: TimeClaim): Date | null {
  const v = payload[claim];
  return typeof v === 'number' && Number.isFinite(v) ? new Date(v * 1000) : null;
}

export function validity(payload: Record<string, unknown>, nowMs: number): Validity {
  const exp = claimDate(payload, 'exp');
  const nbf = claimDate(payload, 'nbf');
  if (exp && exp.getTime() <= nowMs) return 'expired';
  if (nbf && nbf.getTime() > nowMs) return 'notYet';
  return exp || nbf ? 'valid' : 'none';
}

function formatTimeDiff(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

/** Legacy one-line English summary. The page uses `validity` + `formatRelative` instead. */
export function getExpirationInfo(payload: Record<string, unknown>, nowMs = Date.now()): string {
  const exp = claimDate(payload, 'exp');
  if (!exp) return 'No expiration';
  if (exp.getTime() < nowMs) {
    return `Expired: ${exp.toISOString()} (${formatTimeDiff(nowMs - exp.getTime())} ago)`;
  }
  return `Expires: ${exp.toISOString()} (in ${formatTimeDiff(exp.getTime() - nowMs)})`;
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/jwt`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/jwt/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'jwt',
  category: 'enc',
  icon: 'key-round',
  slug: { es: 'decodificador-jwt', en: 'jwt-decoder' },
  name: { es: 'JWT', en: 'JWT' },
  title: {
    es: 'Decodificador de JWT online: cabecera, payload y caducidad',
    en: 'JWT decoder online: header, payload and expiry',
  },
  description: {
    es: 'Pega un JWT y ve su cabecera, su payload y si está vigente, caducado o aún no es válido, con las fechas en tu hora local. No sale de tu navegador.',
    en: 'Paste a JWT to see its header, its payload and whether it is valid, expired or not yet valid, with dates in your local time. It never leaves your browser.',
  },
  keywords: {
    es: ['jwt', 'decodificar jwt', 'json web token', 'token jwt', 'exp jwt', 'bearer token'],
    en: ['jwt', 'jwt decoder', 'decode jwt', 'json web token', 'jwt expiration', 'bearer token'],
  },
  rememberInput: false,
  faq: {
    es: [
      {
        q: '¿Se guarda el token?',
        a: 'No. Esta herramienta nunca guarda lo que pegas, ni siquiera en tu navegador, porque un JWT suele dar acceso a una cuenta.',
      },
      {
        q: '¿Comprueba la firma?',
        a: 'No. Para verificar la firma hace falta la clave secreta o la clave pública del emisor. Decodificar solo muestra lo que el token dice, no si es auténtico.',
      },
    ],
    en: [
      {
        q: 'Is the token stored?',
        a: 'No. This tool never stores what you paste, not even in your browser, because a JWT usually grants access to an account.',
      },
      {
        q: 'Does it check the signature?',
        a: 'No. Verifying the signature needs the issuer’s secret or public key. Decoding only shows what the token says, not whether it is genuine.',
      },
    ],
  },
};
```

`src/tools/jwt/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    input: 'Token',
    placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.firma',
    warning:
      'La firma no se verifica. Cualquiera puede crear un JWT con este contenido: no confíes en él sin validarlo en tu servidor.',
    notStored: 'El token no se guarda en ningún sitio.',
    status: 'Estado',
    valid: 'Vigente',
    expired: 'Caducado',
    notYet: 'Aún no es válido',
    none: 'Sin fecha de caducidad',
    invalid: 'No es un JWT válido',
    errorParts:
      'Un JWT tiene tres partes separadas por puntos (cabecera.payload.firma). Este tiene {n}.',
    errorHeader: 'La cabecera (primera parte) no es Base64url con un objeto JSON.',
    errorPayload: 'El payload (segunda parte) no es Base64url con un objeto JSON.',
    empty: 'Pega un JWT (también vale con «Bearer » delante) y se decodifica al momento.',
    header: 'Cabecera',
    payload: 'Payload',
    dates: 'Fechas',
    exp: 'Caduca (exp)',
    nbf: 'Válido desde (nbf)',
    iat: 'Emitido (iat)',
    signature: 'Firma',
    algorithm: 'Algoritmo',
    copyHeader: 'Copiar cabecera',
    copyPayload: 'Copiar payload',
  },
  en: {
    input: 'Token',
    placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature',
    warning:
      'The signature is not verified. Anyone can create a JWT with this content: do not trust it without validating it on your server.',
    notStored: 'The token is not stored anywhere.',
    status: 'Status',
    valid: 'Valid',
    expired: 'Expired',
    notYet: 'Not valid yet',
    none: 'No expiry date',
    invalid: 'Not a valid JWT',
    errorParts:
      'A JWT has three parts separated by dots (header.payload.signature). This one has {n}.',
    errorHeader: 'The header (first part) is not Base64url with a JSON object.',
    errorPayload: 'The payload (second part) is not Base64url with a JSON object.',
    empty: 'Paste a JWT (a leading “Bearer ” is fine) and it is decoded right away.',
    header: 'Header',
    payload: 'Payload',
    dates: 'Dates',
    exp: 'Expires (exp)',
    nbf: 'Valid from (nbf)',
    iat: 'Issued (iat)',
    signature: 'Signature',
    algorithm: 'Algorithm',
    copyHeader: 'Copy header',
    copyPayload: 'Copy payload',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/jwt/content.es.md`:
```md
## Qué es un JWT

Un JSON Web Token son tres partes en Base64url separadas por puntos: la **cabecera** (algoritmo y tipo), el **payload** (los datos o _claims_) y la **firma**. Las dos primeras no están cifradas, solo codificadas: cualquiera que tenga el token puede leerlas. Por eso no conviene meter en un JWT nada que no deba ver el usuario.

Esta herramienta decodifica la cabecera y el payload al pegar el token (también si lleva delante `Bearer `) y los muestra formateados. Las fechas estándar se traducen a tu hora local y a tiempo relativo: `exp` (caduca), `nbf` (no válido antes de) e `iat` (emitido). El indicador dice si el token está vigente, caducado o aún no es válido.

## Lo que no hace

No verifica la firma: para eso hace falta la clave del emisor, y ese paso debe hacerse en tu servidor. Un token que se decodifica bien puede estar falsificado. Tampoco guarda nada: el token no se escribe en el almacenamiento del navegador y desaparece al cerrar la página.
```

`src/tools/jwt/content.en.md`:
```md
## What a JWT is

A JSON Web Token is three Base64url parts separated by dots: the **header** (algorithm and type), the **payload** (the data, or _claims_) and the **signature**. The first two are not encrypted, only encoded: anyone holding the token can read them. So a JWT should not carry anything the user must not see.

This tool decodes the header and payload as soon as you paste the token (a leading `Bearer ` is fine) and shows them formatted. Standard dates are converted to your local time and to relative time: `exp` (expires), `nbf` (not before) and `iat` (issued at). The indicator says whether the token is valid, expired or not valid yet.

## What it does not do

It does not verify the signature: that needs the issuer’s key, and it must happen on your server. A token that decodes fine can still be forged. It does not store anything either: the token is never written to browser storage and is gone when you close the page.
```

- [ ] **Step 8: `src/tools/jwt/Jwt.svelte`**
```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatRelative } from '../../lib/relative';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Icon from '../../ui/Icon.svelte';
  import Led from '../../ui/Led.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import type { Locale } from '../types';
  import { TIME_CLAIMS, claimDate, cleanToken, inspectJwt, validity } from './logic';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  // meta.rememberInput is false: a JWT is a credential, so it lives only in memory.
  let token = $state('');
  let now = $state(Date.now());

  $effect(() => {
    const id = setInterval(() => (now = Date.now()), 10_000);
    return () => clearInterval(id);
  });

  const result = $derived(token.trim() ? inspectJwt(token) : null);
  const jwt = $derived(result?.ok ? result.jwt : null);
  const headerJson = $derived(jwt ? JSON.stringify(jwt.header, null, 2) : '');
  const payloadJson = $derived(jwt ? JSON.stringify(jwt.payload, null, 2) : '');
  const status = $derived(jwt ? validity(jwt.payload, now) : null);

  const ledState = $derived(
    !result ? 'idle' : !jwt ? 'bad' : status === 'expired' || status === 'notYet' ? 'bad' : 'ok',
  );
  const ledLabel = $derived.by(() => {
    if (!result) return t(locale, 'led.idle');
    if (!jwt) return s.invalid;
    const exp = claimDate(jwt.payload, 'exp');
    const nbf = claimDate(jwt.payload, 'nbf');
    if (status === 'expired' && exp)
      return `${s.expired} · ${formatRelative(exp.getTime(), now, locale)}`;
    if (status === 'notYet' && nbf)
      return `${s.notYet} · ${formatRelative(nbf.getTime(), now, locale)}`;
    if (status === 'valid' && exp)
      return `${s.valid} · ${formatRelative(exp.getTime(), now, locale)}`;
    return status === 'valid' ? s.valid : s.none;
  });
  const errorText = $derived.by(() => {
    if (!result || result.ok) return '';
    if (result.error === 'parts')
      return fill(s.errorParts, { n: cleanToken(token).split('.').length });
    return result.error === 'header' ? s.errorHeader : s.errorPayload;
  });
  const dates = $derived(
    jwt
      ? TIME_CLAIMS.map((claim) => ({ claim, date: claimDate(jwt.payload, claim) })).filter(
          (d): d is { claim: (typeof TIME_CLAIMS)[number]; date: Date } => d.date !== null,
        )
      : [],
  );
</script>

<div class="panel">
  <p class="warning" role="note">
    <Icon name="triangle-alert" size={18} />
    <span>{s.warning}</span>
  </p>

  <Field id="jwt-input" label={s.input} help={s.notStored}>
    {#snippet children({ describedby })}
      <TextArea
        id="jwt-input"
        bind:value={token}
        placeholder={s.placeholder}
        {describedby}
        invalid={ledState === 'bad' && !jwt}
        rows={5}
      />
    {/snippet}
  </Field>

  <Display live label={s.status}>
    {#snippet head()}
      <Led state={ledState} label={ledLabel} />
      {#if jwt && typeof jwt.header.alg === 'string'}<span>{s.algorithm}: {jwt.header.alg}</span
        >{/if}
    {/snippet}
    {#if errorText}
      <p class="display-note">{errorText}</p>
    {:else if dates.length}
      <dl class="display-kv">
        {#each dates as d (d.claim)}
          <dt>{s[d.claim]}</dt>
          <dd>
            {d.date.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'medium' })} · {formatRelative(
              d.date.getTime(),
              now,
              locale,
            )}
          </dd>
        {/each}
      </dl>
    {:else if !jwt}
      <p class="display-note">{s.empty}</p>
    {/if}
  </Display>

  {#if jwt}
    <div class="grid">
      <Display label={s.header}>
        {#snippet head()}
          <span>{s.header}</span>
          <CopyButton value={headerJson} {locale} compact label={s.copyHeader} />
        {/snippet}
        <pre class="display-code">{headerJson}</pre>
      </Display>
      <Display label={s.payload}>
        {#snippet head()}
          <span>{s.payload}</span>
          <CopyButton value={payloadJson} {locale} compact label={s.copyPayload} />
        {/snippet}
        <pre class="display-code">{payloadJson}</pre>
      </Display>
    </div>
    <Display label={s.signature}>
      {#snippet head()}<span>{s.signature}</span>{/snippet}
      <pre class="display-code wrap">{jwt.signature}</pre>
    </Display>
  {/if}

  <div class="row">
    <CopyButton main value={payloadJson} {locale} label={s.copyPayload} />
    <Button variant="ghost" disabled={!token} onclick={() => (token = '')}
      >{t(locale, 'ui.clear')}</Button
    >
  </div>
</div>

<style>
  .warning {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 12px 14px;
    border: 1px solid var(--bad);
    border-radius: var(--radius);
    color: var(--text);
    font-size: 14px;
  }
  .warning :global(svg) {
    flex-shrink: 0;
    color: var(--bad);
    margin-top: 1px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }
  .wrap {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as jwt } from './jwt/meta';
```
→
```ts
import { meta as jwt } from './jwt/meta';
```
y
```ts
  // jwt,
```
→
```ts
  jwt,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Jwt from '../tools/jwt/Jwt.svelte';
```
→
```astro
import Jwt from '../tools/jwt/Jwt.svelte';
```
y
```astro
{/* {id === 'jwt' && <Jwt client:load locale={locale} />} */}
```
→
```astro
{id === 'jwt' && <Jwt client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build
ls dist/es/decodificador-jwt.html dist/en/jwt-decoder.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `jwt` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

A mano con `pnpm preview`, en `/es/decodificador-jwt`:
1. Pegar el token de ejemplo de jwt.io → cabecera `HS256`, payload con `"name": "John Doe"` y fila «Emitido (iat)» con fecha y «hace 8 años».
2. Un token con `exp` pasado → LED naranja «Caducado · hace …»; con `nbf` futuro → «Aún no es válido · dentro de …».
3. `a.b` → «No es un JWT válido» y «Este tiene 2».
4. Recarga: el campo está vacío y no hay interruptor de recordar. En Application → Local Storage no hay `devtools:input.jwt`.

- [ ] **Step 11: Commit**

```bash
git add src/tools/jwt src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más. Si `pnpm format` retocó archivos que no son de esta tarea, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(jwt): fechas locales y relativas, vigencia y aviso de firma sin verificar

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Hash: MD5 propio, SHA con WebCrypto, archivos y comparación

**Files:**
- Create: `src/tools/hash/logic.ts`, `src/tools/hash/logic.test.ts`, `src/tools/hash/meta.ts`, `src/tools/hash/strings.ts`, `src/tools/hash/content.es.md`, `src/tools/hash/content.en.md`, `src/tools/hash/Hash.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `utf8` y `toHex` (Task 0); `fill`; `t` (`ui.clear`, `led.idle`); kit: `Segmented`, `Field`, `TextArea`, `FileDrop`, `Toggle`, `Display`, `Led`, `CopyButton`, `Button`.
- Produces:
  - `type Algorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'`, `type Hashes = Record<Algorithm, string>`, `ALGORITHMS`, `MAX_FILE_BYTES = 200 MiB`, `DEBOUNCE_THRESHOLD = 20_000`
  - `md5(input: Uint8Array | string): string` (RFC 1321, implementación propia), `computeHash(algorithm, data): Promise<string>` (misma firma que la antigua), `hashAll(data): Promise<Hashes>`, `normalizeHex(s): string`, `findMatch(expected, hashes): Algorithm | null`, `shouldDebounce(size: number): boolean`
  - `meta: ToolMeta` (id `hash`, slugs `generador-hash-md5-sha256` / `md5-sha256-hash-generator`), `strings: Record<Locale, …>`, componente `Hash` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 13: `#hash-input`, `#hash-compare`, `.display-rows` (una fila por algoritmo), pestaña «Archivo», `input[type=file]`.

**§7 (vinculante):** `hash` · enc · Texto · Archivo · «MD5 (implementación propia en `logic.ts`, con tests contra vectores conocidos), SHA-1, SHA-256, SHA-384 y SHA-512 (WebCrypto). Campo "comparar con" y LED de coincidencia. `rememberInput: false`».

Cómo se cubre cada punto:
- MD5 propio con los vectores del RFC 1321: tests `md5 (RFC 1321 test suite)`.
- SHA-1, SHA-256, SHA-384 y SHA-512 con WebCrypto: test `matches the FIPS 180 "abc" vectors`.
- Texto y Archivo con `Segmented main`; el archivo se lee con `arrayBuffer()`, con un límite de 200 MB y un mensaje que propone `sha256sum`.
- «Comparar con» + LED: `findMatch` acepta mayúsculas, espacios, `:` y `0x`, y la fila que coincide se marca. Tests `compare`.
- `rememberInput: false`: el texto va en un `$state`, sin `persistedInput`, con la ayuda «Lo que escribes aquí no se guarda».
- Debounce de 150 ms a partir de 20 000 caracteres; los resultados asíncronos se numeran para que uno viejo no pise a uno nuevo.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-hash -b plan-b/hash   # desde el commit de la Task 0
cd ../devtools-hash
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta tarea (Segmented, Field, TextArea, FileDrop, Toggle, Display, Led, CopyButton, Button) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente de la Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/hash/logic.test.ts` (la herramienta antigua no tenía tests de hash):
```ts
import { describe, expect, it } from 'vitest';
import {
  ALGORITHMS,
  computeHash,
  findMatch,
  hashAll,
  md5,
  normalizeHex,
  shouldDebounce,
} from './logic';

describe('md5 (RFC 1321 test suite)', () => {
  it.each([
    ['', 'd41d8cd98f00b204e9800998ecf8427e'],
    ['a', '0cc175b9c0f1b6a831c399e269772661'],
    ['abc', '900150983cd24fb0d6963f7d28e17f72'],
    ['message digest', 'f96b697d7cb7938d525a2f31aaf161d0'],
    ['abcdefghijklmnopqrstuvwxyz', 'c3fcd3d76192e4007dfb496cca67e13b'],
    [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      'd174ab98d277d9f5a5611c2c9f419d9f',
    ],
    [
      '12345678901234567890123456789012345678901234567890123456789012345678901234567890',
      '57edf4a22be3c955ac49da2e2107b67a',
    ],
  ])('md5(%j)', (input, expected) => {
    expect(md5(input)).toBe(expected);
  });

  it('handles the padding edge cases around one block', () => {
    expect(md5('a'.repeat(55))).toBe('ef1772b6dff9a122358552954ad0df65');
    expect(md5('a'.repeat(56))).toBe('3b0c8ac703f828b04c6c197006d17218');
    expect(md5('a'.repeat(64))).toBe('014842d480b571495a4a0363793f7367');
  });

  it('hashes UTF-8 bytes and long inputs', () => {
    expect(md5('ñandú')).toBe('97e5094e8302a2129151f075165779e2');
    expect(md5('a'.repeat(1_000_000))).toBe('7707d6ae4e027c70eea2a935c2296f21');
    expect(md5(new TextEncoder().encode('abc'))).toBe(md5('abc'));
  });
});

describe('SHA family (WebCrypto)', () => {
  it('matches the FIPS 180 "abc" vectors', async () => {
    expect(await computeHash('SHA-1', 'abc')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
    expect(await computeHash('SHA-256', 'abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    expect(await computeHash('SHA-384', 'abc')).toBe(
      'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7',
    );
    expect(await computeHash('SHA-512', 'abc')).toBe(
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
    );
  });

  it('hashes the empty string', async () => {
    expect(await computeHash('SHA-256', '')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });
});

describe('hashAll', () => {
  it('returns every algorithm in order', async () => {
    const h = await hashAll('abc');
    expect(Object.keys(h)).toEqual(ALGORITHMS);
    expect(h.MD5).toBe('900150983cd24fb0d6963f7d28e17f72');
  });
});

describe('compare', () => {
  it('normalizes pasted hashes', () => {
    expect(normalizeHex('  0x90:01:50 98 ')).toBe('90015098');
    expect(normalizeHex('BA78-16BF')).toBe('ba7816bf');
  });

  it('finds which algorithm matches', async () => {
    const h = await hashAll('abc');
    expect(findMatch('900150983CD24FB0D6963F7D28E17F72', h)).toBe('MD5');
    expect(findMatch(h['SHA-512'], h)).toBe('SHA-512');
    expect(findMatch('deadbeef', h)).toBeNull();
    expect(findMatch('   ', h)).toBeNull();
  });
});

describe('shouldDebounce', () => {
  it('debounces only large inputs', () => {
    expect(shouldDebounce(100)).toBe(false);
    expect(shouldDebounce(20_001)).toBe(true);
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/hash`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/hash/logic.ts`**

SHA usa `crypto.subtle.digest` (en Node 22 está en `globalThis.crypto`, así que los tests corren en el entorno `node`). MD5 no existe en WebCrypto: se implementa aquí y se prueba con la batería completa del RFC 1321 y con los casos de relleno de 55, 56 y 64 bytes. Los valores SHA esperados están comprobados con `node:crypto`.

```ts
import { toHex, utf8 } from '../../lib/bytes';

export type Algorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
export type Hashes = Record<Algorithm, string>;

export const ALGORITHMS: Algorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
export const MAX_FILE_BYTES = 200 * 1024 * 1024;
export const DEBOUNCE_THRESHOLD = 20_000;

// MD5 (RFC 1321). Per-round shift amounts and the sine-derived constants.
const SHIFTS = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
const K = Array.from(
  { length: 64 },
  (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0,
);

export function md5(input: Uint8Array | string): string {
  const bytes = typeof input === 'string' ? utf8(input) : input;
  const len = bytes.length;
  const total = Math.ceil((len + 9) / 64) * 64;
  const buf = new Uint8Array(total);
  buf.set(bytes);
  buf[len] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(total - 8, (len * 8) >>> 0, true);
  view.setUint32(total - 4, Math.floor(len / 0x20000000), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;
  const M = new Uint32Array(16);

  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) M[i] = view.getUint32(off + i * 4, true);
    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;
    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      const s = SHIFTS[(i >> 4) * 4 + (i % 4)];
      const sum = (A + F + K[i] + M[g]) | 0;
      A = D;
      D = C;
      C = B;
      B = (B + ((sum << s) | (sum >>> (32 - s)))) | 0;
    }
    a0 = (a0 + A) | 0;
    b0 = (b0 + B) | 0;
    c0 = (c0 + C) | 0;
    d0 = (d0 + D) | 0;
  }

  const out = new DataView(new ArrayBuffer(16));
  [a0, b0, c0, d0].forEach((v, i) => out.setUint32(i * 4, v, true));
  return toHex(new Uint8Array(out.buffer));
}

export async function computeHash(
  algorithm: Algorithm,
  data: Uint8Array | string,
): Promise<string> {
  const bytes = typeof data === 'string' ? utf8(data) : data;
  if (algorithm === 'MD5') return md5(bytes);
  return toHex(
    new Uint8Array(await crypto.subtle.digest(algorithm, bytes as Uint8Array<ArrayBuffer>)),
  );
}

export async function hashAll(data: Uint8Array | string): Promise<Hashes> {
  const bytes = typeof data === 'string' ? utf8(data) : data;
  const values = await Promise.all(ALGORITHMS.map((a) => computeHash(a, bytes)));
  return Object.fromEntries(ALGORITHMS.map((a, i) => [a, values[i]])) as Hashes;
}

/** Lowercase hex without spaces, colons or a "0x" prefix. */
export function normalizeHex(s: string): string {
  return s
    .trim()
    .replace(/^0x/i, '')
    .replace(/[\s:-]/g, '')
    .toLowerCase();
}

/** The algorithm whose hash equals `expected`, or null. */
export function findMatch(expected: string, hashes: Hashes): Algorithm | null {
  const want = normalizeHex(expected);
  if (!want) return null;
  return ALGORITHMS.find((a) => hashes[a] === want) ?? null;
}

export function shouldDebounce(size: number): boolean {
  return size > DEBOUNCE_THRESHOLD;
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/hash`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/hash/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'hash',
  category: 'enc',
  icon: 'hash',
  slug: { es: 'generador-hash-md5-sha256', en: 'md5-sha256-hash-generator' },
  name: { es: 'Hash (MD5, SHA)', en: 'Hash (MD5, SHA)' },
  title: {
    es: 'Generador de hash MD5, SHA-1, SHA-256 y SHA-512 online',
    en: 'MD5, SHA-1, SHA-256 and SHA-512 hash generator online',
  },
  description: {
    es: 'Calcula MD5, SHA-1, SHA-256, SHA-384 y SHA-512 de un texto o un archivo mientras escribes, y compara con un hash esperado para ver si coincide.',
    en: 'Compute MD5, SHA-1, SHA-256, SHA-384 and SHA-512 of text or a file as you type, and compare against an expected hash to see if it matches.',
  },
  keywords: {
    es: [
      'hash',
      'md5',
      'sha256',
      'sha1',
      'sha512',
      'checksum',
      'suma de verificacion',
      'comprobar hash',
    ],
    en: ['hash', 'md5', 'sha256', 'sha1', 'sha512', 'checksum', 'file hash', 'verify hash'],
  },
  tabs: { es: ['Texto', 'Archivo'], en: ['Text', 'File'] },
  rememberInput: false,
  faq: {
    es: [
      {
        q: '¿Puedo usar MD5 o SHA-1 para guardar contraseñas?',
        a: 'No. Son rápidos a propósito y hoy se rompen con fuerza bruta. Para contraseñas usa Argon2, scrypt o bcrypt. MD5 y SHA-1 siguen valiendo para detectar cambios accidentales en un archivo.',
      },
      {
        q: '¿Mi archivo se sube a algún sitio?',
        a: 'No. El archivo se lee y se calcula en tu navegador; ni el contenido ni los hashes salen de tu equipo.',
      },
    ],
    en: [
      {
        q: 'Can I use MD5 or SHA-1 to store passwords?',
        a: 'No. They are fast on purpose and fall to brute force today. Use Argon2, scrypt or bcrypt for passwords. MD5 and SHA-1 are still fine for spotting accidental changes in a file.',
      },
      {
        q: 'Is my file uploaded anywhere?',
        a: 'No. The file is read and hashed in your browser; neither its content nor the hashes leave your device.',
      },
    ],
  },
};
```

`src/tools/hash/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    mode: 'Modo',
    input: 'Texto',
    placeholder: 'Escribe o pega el texto que quieres resumir',
    notStored: 'Lo que escribes aquí no se guarda.',
    uppercase: 'Mayúsculas',
    compare: 'Comparar con',
    comparePlaceholder: 'Pega el hash esperado (de cualquiera de los cinco algoritmos)',
    matches: 'Coincide con {algo}',
    noMatch: 'No coincide con ninguno',
    noMatchHint: 'Comprueba que es el mismo texto, sin espacios ni saltos de línea de más.',
    result: 'Hashes',
    empty: 'Escribe algo y verás sus cinco hashes al momento.',
    fileEmpty: 'Elige un archivo y verás sus cinco hashes.',
    reading: 'Calculando…',
    file: 'Archivo',
    tooBig: 'El archivo supera {max}. Para archivos tan grandes usa sha256sum o certutil.',
    copyMain: 'Copiar SHA-256',
  },
  en: {
    mode: 'Mode',
    input: 'Text',
    placeholder: 'Type or paste the text you want to hash',
    notStored: 'What you type here is not stored.',
    uppercase: 'Uppercase',
    compare: 'Compare with',
    comparePlaceholder: 'Paste the expected hash (from any of the five algorithms)',
    matches: 'Matches {algo}',
    noMatch: 'Does not match any',
    noMatchHint: 'Check that it is the same text, with no extra spaces or line breaks.',
    result: 'Hashes',
    empty: 'Type something to see its five hashes right away.',
    fileEmpty: 'Choose a file to see its five hashes.',
    reading: 'Computing…',
    file: 'File',
    tooBig: 'The file is larger than {max}. For files that big, use sha256sum or certutil.',
    copyMain: 'Copy SHA-256',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/hash/content.es.md`:
```md
## Cómo funciona

Una función hash convierte cualquier entrada en una huella de longitud fija. El mismo texto da siempre el mismo hash y cualquier cambio, por pequeño que sea, da uno totalmente distinto. Por eso se usan para comprobar que un archivo descargado no se ha corrompido o para detectar cambios.

La herramienta calcula a la vez **MD5**, **SHA-1**, **SHA-256**, **SHA-384** y **SHA-512** mientras escribes. SHA usa la Web Crypto API del navegador; MD5 no está en esa API y se calcula con una implementación propia comprobada contra los vectores de prueba del RFC 1321. El texto se codifica como UTF-8 antes de resumirlo, igual que hacen `sha256sum` o la mayoría de lenguajes.

## Comparar y archivos

Pega en «Comparar con» el hash que te han dado (en mayúsculas, con espacios o con dos puntos, da igual) y el indicador dirá con qué algoritmo coincide. En la pestaña **Archivo** puedes calcular los hashes de un archivo sin subirlo a ningún sitio.

MD5 y SHA-1 ya no son seguros frente a ataques: sirven para detectar errores, no para firmar ni para guardar contraseñas. Para contraseñas usa un algoritmo lento como Argon2 o bcrypt.
```

`src/tools/hash/content.en.md`:
```md
## How it works

A hash function turns any input into a fixed-length fingerprint. The same text always gives the same hash, and any change, however small, gives a completely different one. That is why hashes are used to check that a download is not corrupted or to detect changes.

The tool computes **MD5**, **SHA-1**, **SHA-256**, **SHA-384** and **SHA-512** at once as you type. SHA uses the browser’s Web Crypto API; MD5 is not in that API, so it runs on a built-in implementation tested against the RFC 1321 test vectors. Text is encoded as UTF-8 before hashing, as `sha256sum` and most languages do.

## Comparing and files

Paste the hash you were given into “Compare with” (upper case, with spaces or colons, it does not matter) and the indicator tells you which algorithm it matches. In the **File** tab you can hash a file without uploading it anywhere.

MD5 and SHA-1 are no longer safe against attacks: use them to catch errors, not to sign anything or store passwords. For passwords, use a slow algorithm such as Argon2 or bcrypt.
```

- [ ] **Step 8: `src/tools/hash/Hash.svelte`**
```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Button from '../../ui/Button.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import FileDrop from '../../ui/FileDrop.svelte';
  import Led from '../../ui/Led.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import type { Locale } from '../types';
  import {
    ALGORITHMS,
    MAX_FILE_BYTES,
    findMatch,
    hashAll,
    shouldDebounce,
    type Hashes,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  // meta.rememberInput is false: hashed text is often a secret, so it lives only in memory.
  let tab = $state<'text' | 'file'>('text');
  let text = $state('');
  let expected = $state('');
  let uppercase = $state(false);
  let textHashes = $state<Hashes | null>(null);
  let fileHashes = $state<Hashes | null>(null);
  let fileInfo = $state('');
  let fileError = $state('');
  let busy = $state(false);
  // Each run gets a number; an older, slower run must not overwrite a newer result.
  let run = 0;

  $effect(() => {
    const value = text;
    const id = ++run;
    if (!value) {
      textHashes = null;
      return;
    }
    const compute = () =>
      void hashAll(value).then((h) => {
        if (id === run) textHashes = h;
      });
    if (!shouldDebounce(value.length)) {
      compute();
      return;
    }
    const timer = setTimeout(compute, 150);
    return () => clearTimeout(timer);
  });

  async function onfile(f: File) {
    fileError = '';
    fileHashes = null;
    fileInfo = `${f.name} · ${f.size.toLocaleString(locale)} B`;
    if (f.size > MAX_FILE_BYTES) {
      fileError = fill(s.tooBig, { max: `${MAX_FILE_BYTES / 1024 / 1024} MB` });
      return;
    }
    busy = true;
    try {
      fileHashes = await hashAll(new Uint8Array(await f.arrayBuffer()));
    } finally {
      busy = false;
    }
  }

  const hashes = $derived(tab === 'text' ? textHashes : fileHashes);
  const shown = (h: string) => (uppercase ? h.toUpperCase() : h);
  const match = $derived(hashes && expected.trim() ? findMatch(expected, hashes) : null);
  const compareState = $derived(!expected.trim() || !hashes ? 'idle' : match ? 'ok' : 'bad');
  const compareLabel = $derived(
    compareState === 'idle'
      ? t(locale, 'led.idle')
      : match
        ? fill(s.matches, { algo: match })
        : s.noMatch,
  );
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'text', label: meta.tabs![locale][0] },
      { value: 'file', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    {#if tab === 'text'}
      <Field id="hash-input" label={s.input} help={s.notStored}>
        {#snippet children({ describedby })}
          <TextArea
            id="hash-input"
            bind:value={text}
            placeholder={s.placeholder}
            {describedby}
            rows={6}
          />
        {/snippet}
      </Field>
    {:else}
      <FileDrop {locale} onfile={(f) => void onfile(f)} />
      {#if fileError}<p class="error" role="alert">{fileError}</p>{/if}
    {/if}

    <Field id="hash-compare" label={s.compare}>
      {#snippet children({ describedby })}
        <input
          id="hash-compare"
          class="control mono"
          type="text"
          autocomplete="off"
          spellcheck="false"
          placeholder={s.comparePlaceholder}
          aria-describedby={describedby}
          bind:value={expected}
        />
      {/snippet}
    </Field>

    <Display live label={s.result}>
      {#snippet head()}
        <Led state={compareState} label={compareLabel} />
        {#if tab === 'file' && fileInfo}<span>{fileInfo}</span>{/if}
      {/snippet}
      {#if hashes}
        <div class="display-rows">
          {#each ALGORITHMS as algo (algo)}
            <div class="display-row" class:hit={match === algo}>
              <span class="hash"><span class="algo">{algo}</span>{shown(hashes[algo])}</span>
              <CopyButton value={shown(hashes[algo])} {locale} compact />
            </div>
          {/each}
        </div>
        {#if compareState === 'bad'}<p class="display-note">{s.noMatchHint}</p>{/if}
      {:else if busy}
        <p class="display-note">{s.reading}</p>
      {:else}
        <p class="display-note">{tab === 'text' ? s.empty : s.fileEmpty}</p>
      {/if}
    </Display>

    <div class="row">
      <CopyButton main value={hashes ? shown(hashes['SHA-256']) : ''} {locale} label={s.copyMain} />
      <Toggle bind:checked={uppercase} label={s.uppercase} />
      {#if tab === 'text'}
        <Button variant="ghost" disabled={!text} onclick={() => (text = '')}
          >{t(locale, 'ui.clear')}</Button
        >
      {/if}
    </div>
  </div>
</div>

<style>
  .hash {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    font-size: 14px;
  }
  .algo {
    color: var(--disp-dim);
    font-size: 12px;
    letter-spacing: 0;
  }
  .hit {
    color: var(--ok);
  }
  .error {
    color: var(--bad);
    font-size: 14px;
    font-weight: 600;
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as hash } from './hash/meta';
```
→
```ts
import { meta as hash } from './hash/meta';
```
y
```ts
  // hash,
```
→
```ts
  hash,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Hash from '../tools/hash/Hash.svelte';
```
→
```astro
import Hash from '../tools/hash/Hash.svelte';
```
y
```astro
{/* {id === 'hash' && <Hash client:load locale={locale} />} */}
```
→
```astro
{id === 'hash' && <Hash client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build
ls dist/es/generador-hash-md5-sha256.html dist/en/md5-sha256-hash-generator.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `hash` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

A mano con `pnpm preview`, en `/es/generador-hash-md5-sha256`:
1. `abc` → SHA-256 `ba7816bf…15ad` y MD5 `900150983cd24fb0d6963f7d28e17f72` al instante.
2. Pegar `900150983CD24FB0D6963F7D28E17F72` en «Comparar con» → LED verde «Coincide con MD5» y la fila de MD5 resaltada; cambiar una letra → «No coincide con ninguno».
3. «Mayúsculas» cambia lo que se ve y lo que se copia. `c` copia el SHA-256.
4. Pestaña Archivo (`2`): soltar un archivo de unos MB → los cinco hashes; compáralos con `sha256sum` y `md5sum`.
5. Recarga: el texto no se conserva y no hay interruptor de recordar.

- [ ] **Step 11: Commit**

```bash
git add src/tools/hash src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más. Si `pnpm format` retocó archivos que no son de esta tarea, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(hash): MD5 propio, SHA con WebCrypto, archivos y comparación con LED

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Diff: vista unificada y en paralelo, diferencias por palabra y opciones

**Files:**
- Create: `src/tools/diff/logic.ts`, `src/tools/diff/logic.test.ts`, `src/tools/diff/meta.ts`, `src/tools/diff/strings.ts`, `src/tools/diff/content.es.md`, `src/tools/diff/content.en.md`, `src/tools/diff/Diff.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `fill`; `t` (`ui.clear`, `led.idle`, `tool.remember`); kit: `Field`, `TextArea`, `Segmented`, `Toggle`, `Display`, `Led`, `CopyButton`, `Button`, `persistedInput`.
- Produces:
  - `interface DiffOptions { ignoreWhitespace?; ignoreCase? }`, `interface DiffLine { type; text }` (forma antigua), `type Op` (equal / remove / add con números de línea), `Segment`, `Side`, `Row`, `Item`, `DiffResult { ops; tooLarge }`, `MAX_CELLS = 10_000_000`, `DEBOUNCE_THRESHOLD = 20_000`
  - `diffLines(a, b, opts?): DiffResult`, `computeDiff(a, b): DiffLine[]` (API antigua), `normalizeLine(s, opts)`, `splitLines(text)`, `tokenize(s)`, `diffWords(oldText, newText, opts?)`, `toRows(ops, opts?)`, `collapse(rows, context?: number = 3)`, `countChanges(ops)`, `unifiedText(ops)`, `shouldDebounce(a, b)`
  - `meta: ToolMeta` (id `diff`, slugs `comparar-textos` / `text-diff-checker`), `strings: Record<Locale, …>`, componente `Diff` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 13: `#diff-original`, `#diff-modified`, `.diff` (salida), `.diff mark` (palabras cambiadas), `.diff .pair` (filas en paralelo).

**§7 (vinculante):** `diff` · data · sin pestañas · «Vista unificada o en paralelo. Diferencias por palabra dentro de las líneas cambiadas. Ignorar espacios y mayúsculas. Contador de líneas añadidas y quitadas». Y de la §6: debounce en cálculos pesados.

Cómo se cubre cada punto:
- Unificada o en paralelo: un `Segmented` (sin `main`, porque la herramienta no tiene pestañas) sobre las mismas `Row`. Tests `rows, collapse and output`.
- Por palabra: `diffWords` con tokens Unicode (tildes incluidas), resaltados con `<mark>`. Tests `diffWords`.
- Ignorar espacios y mayúsculas: `normalizeLine` y claves de token; las líneas iguales conservan el texto original de cada lado. Test `can ignore case and whitespace changes`.
- Contador: `countChanges` en el LED («+2 añadidas · −1 quitadas»).
- Debounce de 150 ms desde 20 000 caracteres (el patrón de JSON) y coste acotado: Review Focus 3.
- Extras: «Solo cambios» con 3 líneas de contexto, intercambiar lados, copiar el diff como texto y un tope de 2 000 filas pintadas.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-diff -b plan-b/diff   # desde el commit de la Task 0
cd ../devtools-diff
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta tarea (Field, TextArea, Segmented, Toggle, Display, Led, CopyButton, Button) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente de la Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/diff/logic.test.ts` (incluye los 4 tests de diff de `legacy/src/__tests__/tools.test.ts`):
```ts
import { describe, expect, it } from 'vitest';
import {
  MAX_CELLS,
  collapse,
  computeDiff,
  countChanges,
  diffLines,
  diffWords,
  shouldDebounce,
  splitLines,
  toRows,
  unifiedText,
} from './logic';

describe('computeDiff (legacy behaviour)', () => {
  it('detects no differences', () => {
    const result = computeDiff(['a', 'b', 'c'], ['a', 'b', 'c']);
    expect(result.every((d) => d.type === 'equal')).toBe(true);
  });

  it('detects additions', () => {
    const result = computeDiff(['a', 'c'], ['a', 'b', 'c']);
    expect(result).toContainEqual({ type: 'add', text: 'b' });
  });

  it('detects removals', () => {
    const result = computeDiff(['a', 'b', 'c'], ['a', 'c']);
    expect(result).toContainEqual({ type: 'remove', text: 'b' });
  });

  it('handles empty arrays', () => {
    expect(computeDiff([], [])).toEqual([]);
    expect(computeDiff(['a'], [])).toEqual([{ type: 'remove', text: 'a' }]);
    expect(computeDiff([], ['a'])).toEqual([{ type: 'add', text: 'a' }]);
  });

  it('lists removals before additions for a changed line', () => {
    expect(computeDiff(['x'], ['y'])).toEqual([
      { type: 'remove', text: 'x' },
      { type: 'add', text: 'y' },
    ]);
  });
});

describe('diffLines', () => {
  it('numbers lines on both sides', () => {
    const { ops } = diffLines(['a', 'b', 'c'], ['a', 'B', 'c', 'd']);
    expect(ops).toEqual([
      { type: 'equal', oldText: 'a', newText: 'a', oldNo: 1, newNo: 1 },
      { type: 'remove', oldText: 'b', oldNo: 2 },
      { type: 'add', newText: 'B', newNo: 2 },
      { type: 'equal', oldText: 'c', newText: 'c', oldNo: 3, newNo: 3 },
      { type: 'add', newText: 'd', newNo: 4 },
    ]);
  });

  it('can ignore case and whitespace changes', () => {
    const a = ['Hola  mundo', 'fin'];
    const b = ['hola mundo ', 'fin'];
    expect(countChanges(diffLines(a, b).ops)).toEqual({ added: 1, removed: 1 });
    expect(countChanges(diffLines(a, b, { ignoreCase: true, ignoreWhitespace: true }).ops)).toEqual(
      {
        added: 0,
        removed: 0,
      },
    );
    // Equal lines keep each side's original text.
    const eq = diffLines(a, b, { ignoreCase: true, ignoreWhitespace: true }).ops[0];
    expect(eq).toMatchObject({ oldText: 'Hola  mundo', newText: 'hola mundo ' });
  });

  it('stays fast on big, mostly equal texts (common head and tail are skipped)', () => {
    const a = Array.from({ length: 50_000 }, (_, i) => `line ${i}`);
    const b = [...a];
    b[25_000] = 'changed';
    const t = performance.now();
    const { ops, tooLarge } = diffLines(a, b);
    expect(performance.now() - t).toBeLessThan(1000);
    expect(tooLarge).toBe(false);
    expect(countChanges(ops)).toEqual({ added: 1, removed: 1 });
  });

  it('gives up line matching (but still lists everything) when the changed block is huge', () => {
    const n = Math.ceil(Math.sqrt(MAX_CELLS)) + 10;
    const a = Array.from({ length: n }, (_, i) => `a${i}`);
    const b = Array.from({ length: n }, (_, i) => `b${i}`);
    const { ops, tooLarge } = diffLines(a, b);
    expect(tooLarge).toBe(true);
    expect(countChanges(ops)).toEqual({ added: n, removed: n });
  });
});

describe('diffWords', () => {
  it('marks only the words that changed', () => {
    const w = diffWords('const total = 10;', 'const suma = 10;');
    expect(w.old).toEqual([
      { text: 'const ', changed: false },
      { text: 'total', changed: true },
      { text: ' = 10;', changed: false },
    ]);
    expect(w.new).toEqual([
      { text: 'const ', changed: false },
      { text: 'suma', changed: true },
      { text: ' = 10;', changed: false },
    ]);
  });

  it('handles accents as part of words', () => {
    const w = diffWords('canción vieja', 'canción nueva');
    expect(w.new).toEqual([
      { text: 'canción ', changed: false },
      { text: 'nueva', changed: true },
    ]);
  });

  it('respects ignore case', () => {
    expect(diffWords('Hola', 'hola', { ignoreCase: true }).new).toEqual([
      { text: 'hola', changed: false },
    ]);
  });
});

describe('rows, collapse and output', () => {
  const { ops } = diffLines(
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'],
    ['a', 'b', 'c', 'd', 'E', 'f', 'g', 'h', 'i', 'j'],
  );

  it('pairs removed and added lines into "change" rows', () => {
    const rows = toRows(ops);
    const change = rows.find((r) => r.type === 'change')!;
    expect(change.left).toEqual({ no: 5, segments: [{ text: 'e', changed: true }] });
    expect(change.right).toEqual({ no: 5, segments: [{ text: 'E', changed: true }] });
    expect(rows.at(-1)).toEqual({
      type: 'add',
      left: null,
      right: { no: 10, segments: [{ text: 'j', changed: true }] },
    });
  });

  it('collapses long equal runs, keeping context', () => {
    const items = collapse(toRows(ops), 1);
    expect(items.map((i) => (i.kind === 'skip' ? `skip ${i.count}` : i.row.type))).toEqual([
      'skip 3',
      'equal',
      'change',
      'equal',
      'skip 2',
      'equal',
      'add',
    ]);
  });

  it('counts and prints the unified diff', () => {
    expect(countChanges(ops)).toEqual({ added: 2, removed: 1 });
    expect(unifiedText(diffLines(['a', 'b'], ['a', 'c']).ops)).toBe('  a\n- b\n+ c');
  });

  it('splits text into lines, treating empty text as no lines', () => {
    expect(splitLines('')).toEqual([]);
    expect(splitLines('a\r\nb\rc')).toEqual(['a', 'b', 'c']);
  });

  it('debounces only large inputs', () => {
    expect(shouldDebounce('a', 'b')).toBe(false);
    expect(shouldDebounce('x'.repeat(15_000), 'y'.repeat(6_000))).toBe(true);
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/diff`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/diff/logic.ts`**

El LCS de la versión antigua reservaba una matriz `number[][]` de (m+1)·(n+1): con 5 000 líneas por lado, 25 millones de números. Esta versión recorta antes la cabeza y la cola comunes, usa un `Uint16Array` plano y, si aun así el bloque cambiado supera `MAX_CELLS`, no empareja líneas: devuelve `tooLarge` con todo el bloque como quitado y añadido.

```ts
export interface DiffOptions {
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
}

/** Legacy shape, kept for `computeDiff`. */
export interface DiffLine {
  type: 'add' | 'remove' | 'equal';
  text: string;
}

export type Op =
  | { type: 'equal'; oldText: string; newText: string; oldNo: number; newNo: number }
  | { type: 'remove'; oldText: string; oldNo: number }
  | { type: 'add'; newText: string; newNo: number };

export interface Segment {
  text: string;
  changed: boolean;
}

export interface Side {
  no: number;
  segments: Segment[];
}

export interface Row {
  type: 'equal' | 'change' | 'remove' | 'add';
  left: Side | null;
  right: Side | null;
}

export type Item = { kind: 'row'; row: Row } | { kind: 'skip'; count: number };

export interface DiffResult {
  ops: Op[];
  tooLarge: boolean;
}

/** Above this many cells, the LCS table would use too much memory and time. */
export const MAX_CELLS = 10_000_000;
export const DEBOUNCE_THRESHOLD = 20_000;
const MAX_WORD_TOKENS = 2_000;

export function normalizeLine(s: string, opts: DiffOptions): string {
  let out = s;
  if (opts.ignoreWhitespace) out = out.replace(/\s+/g, ' ').trim();
  if (opts.ignoreCase) out = out.toLowerCase();
  return out;
}

/**
 * Longest-common-subsequence over two key arrays. Returns pairs [i, j] of matching indexes,
 * or null when the table would exceed MAX_CELLS.
 */
function lcsPairs(a: string[], b: string[]): [number, number][] | null {
  const m = a.length;
  const n = b.length;
  if ((m + 1) * (n + 1) > MAX_CELLS) return null;
  const w = n + 1;
  // LCS lengths never exceed min(m, n) ≤ sqrt(MAX_CELLS) < 65536, so 16 bits are enough.
  const dp = new Uint16Array((m + 1) * w);
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i * w + j] =
        a[i - 1] === b[j - 1]
          ? dp[(i - 1) * w + j - 1] + 1
          : Math.max(dp[(i - 1) * w + j], dp[i * w + j - 1]);
    }
  }
  const pairs: [number, number][] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      pairs.push([i - 1, j - 1]);
      i--;
      j--;
    } else if (dp[i * w + j - 1] >= dp[(i - 1) * w + j]) {
      j--;
    } else {
      i--;
    }
  }
  return pairs.reverse();
}

export function diffLines(a: string[], b: string[], opts: DiffOptions = {}): DiffResult {
  const ka = a.map((l) => normalizeLine(l, opts));
  const kb = b.map((l) => normalizeLine(l, opts));

  // Equal head and tail never need the LCS table: this keeps big, mostly-equal texts cheap.
  let start = 0;
  while (start < ka.length && start < kb.length && ka[start] === kb[start]) start++;
  let endA = ka.length;
  let endB = kb.length;
  while (endA > start && endB > start && ka[endA - 1] === kb[endB - 1]) {
    endA--;
    endB--;
  }

  const mid = lcsPairs(ka.slice(start, endA), kb.slice(start, endB));
  const tooLarge = mid === null;
  const pairs: [number, number][] = [];
  for (let k = 0; k < start; k++) pairs.push([k, k]);
  for (const [i, j] of mid ?? []) pairs.push([i + start, j + start]);
  for (let k = 0; k < ka.length - endA; k++) pairs.push([endA + k, endB + k]);

  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  for (const [pi, pj] of [...pairs, [a.length, b.length] as [number, number]]) {
    while (i < pi) {
      ops.push({ type: 'remove', oldText: a[i], oldNo: i + 1 });
      i++;
    }
    while (j < pj) {
      ops.push({ type: 'add', newText: b[j], newNo: j + 1 });
      j++;
    }
    if (pi < a.length && pj < b.length) {
      ops.push({ type: 'equal', oldText: a[pi], newText: b[pj], oldNo: pi + 1, newNo: pj + 1 });
      i++;
      j++;
    }
  }
  return { ops, tooLarge };
}

/** Legacy API: line diff without options. */
export function computeDiff(a: string[], b: string[]): DiffLine[] {
  return diffLines(a, b).ops.map((op) => ({
    type: op.type,
    text: op.type === 'add' ? op.newText : op.oldText,
  }));
}

export function splitLines(text: string): string[] {
  return text === '' ? [] : text.replace(/\r\n?/g, '\n').split('\n');
}

const TOKEN = /\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu;

export function tokenize(s: string): string[] {
  return s.match(TOKEN) ?? [];
}

/** Word-level diff inside a changed line: marks the tokens that differ on each side. */
export function diffWords(
  oldText: string,
  newText: string,
  opts: DiffOptions = {},
): { old: Segment[]; new: Segment[] } {
  const ta = tokenize(oldText);
  const tb = tokenize(newText);
  if (ta.length > MAX_WORD_TOKENS || tb.length > MAX_WORD_TOKENS) {
    return { old: [{ text: oldText, changed: true }], new: [{ text: newText, changed: true }] };
  }
  const key = (t: string) => {
    if (opts.ignoreWhitespace && /^\s+$/.test(t)) return ' ';
    return opts.ignoreCase ? t.toLowerCase() : t;
  };
  const pairs = lcsPairs(ta.map(key), tb.map(key)) ?? [];
  const oldSet = new Set(pairs.map(([i]) => i));
  const newSet = new Set(pairs.map(([, j]) => j));
  return { old: mergeSegments(ta, oldSet), new: mergeSegments(tb, newSet) };
}

function mergeSegments(tokens: string[], kept: Set<number>): Segment[] {
  const out: Segment[] = [];
  tokens.forEach((text, i) => {
    const changed = !kept.has(i);
    const last = out[out.length - 1];
    if (last && last.changed === changed) last.text += text;
    else out.push({ text, changed });
  });
  return out;
}

const plain = (text: string): Segment[] => [{ text, changed: false }];
const whole = (text: string): Segment[] => [{ text, changed: true }];

/** Pairs each block of removed lines with the added lines that follow it, for word diffs and the split view. */
export function toRows(ops: Op[], opts: DiffOptions = {}): Row[] {
  const rows: Row[] = [];
  let k = 0;
  while (k < ops.length) {
    const op = ops[k];
    if (op.type === 'equal') {
      rows.push({
        type: 'equal',
        left: { no: op.oldNo, segments: plain(op.oldText) },
        right: { no: op.newNo, segments: plain(op.newText) },
      });
      k++;
      continue;
    }
    const removed: Extract<Op, { type: 'remove' }>[] = [];
    const added: Extract<Op, { type: 'add' }>[] = [];
    while (k < ops.length && ops[k].type === 'remove')
      removed.push(ops[k++] as Extract<Op, { type: 'remove' }>);
    while (k < ops.length && ops[k].type === 'add')
      added.push(ops[k++] as Extract<Op, { type: 'add' }>);
    const n = Math.max(removed.length, added.length);
    for (let x = 0; x < n; x++) {
      const r = removed[x];
      const a = added[x];
      if (r && a) {
        const w = diffWords(r.oldText, a.newText, opts);
        rows.push({
          type: 'change',
          left: { no: r.oldNo, segments: w.old },
          right: { no: a.newNo, segments: w.new },
        });
      } else if (r) {
        rows.push({
          type: 'remove',
          left: { no: r.oldNo, segments: whole(r.oldText) },
          right: null,
        });
      } else {
        rows.push({ type: 'add', left: null, right: { no: a.newNo, segments: whole(a.newText) } });
      }
    }
  }
  return rows;
}

/** Keeps `context` equal rows around each change and replaces longer equal runs with a "skip" marker. */
export function collapse(rows: Row[], context = 3): Item[] {
  const keep = rows.map((r) => r.type !== 'equal');
  const near = keep.map((_, i) => {
    for (let d = -context; d <= context; d++) if (keep[i + d]) return true;
    return false;
  });
  const items: Item[] = [];
  let skipped = 0;
  rows.forEach((row, i) => {
    if (near[i]) {
      if (skipped) items.push({ kind: 'skip', count: skipped });
      skipped = 0;
      items.push({ kind: 'row', row });
    } else {
      skipped++;
    }
  });
  if (skipped) items.push({ kind: 'skip', count: skipped });
  return items;
}

export function countChanges(ops: Op[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const op of ops) {
    if (op.type === 'add') added++;
    else if (op.type === 'remove') removed++;
  }
  return { added, removed };
}

/** Plain-text unified view ("-", "+" and two spaces), for copying. */
export function unifiedText(ops: Op[]): string {
  return ops
    .map((op) =>
      op.type === 'equal'
        ? `  ${op.newText}`
        : op.type === 'add'
          ? `+ ${op.newText}`
          : `- ${op.oldText}`,
    )
    .join('\n');
}

export function shouldDebounce(a: string, b: string): boolean {
  return a.length + b.length > DEBOUNCE_THRESHOLD;
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/diff`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/diff/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'diff',
  category: 'data',
  icon: 'diff',
  slug: { es: 'comparar-textos', en: 'text-diff-checker' },
  name: { es: 'Comparar textos', en: 'Text diff' },
  title: {
    es: 'Comparar dos textos online: diferencias línea a línea',
    en: 'Compare two texts online: line-by-line diff',
  },
  description: {
    es: 'Compara dos textos y marca las líneas añadidas y quitadas y las palabras que cambian. Vista unificada o en paralelo, ignorando espacios o mayúsculas.',
    en: 'Compare two texts and highlight added and removed lines and the words that changed. Unified or side-by-side view, ignoring spaces or case.',
  },
  keywords: {
    es: [
      'comparar textos',
      'diff',
      'diferencias entre textos',
      'comparar archivos',
      'diff online',
      'comparar codigo',
    ],
    en: [
      'text diff',
      'diff checker',
      'compare text',
      'compare files',
      'diff online',
      'compare code',
    ],
  },
};
```

`src/tools/diff/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    original: 'Original',
    modified: 'Modificado',
    originalPlaceholder: 'Pega aquí el texto original',
    modifiedPlaceholder: 'Pega aquí el texto modificado',
    view: 'Vista',
    unified: 'Unificada',
    split: 'En paralelo',
    ignoreWhitespace: 'Ignorar espacios',
    ignoreCase: 'Ignorar mayúsculas',
    onlyChanges: 'Solo cambios (con contexto)',
    result: 'Diferencias',
    counts: '+{added} añadidas · −{removed} quitadas',
    identical: 'Los textos son iguales',
    empty: 'Pega los dos textos y las diferencias aparecerán aquí.',
    skipped: '{n} líneas iguales',
    tooLarge:
      'Hay demasiadas líneas distintas seguidas para emparejarlas una a una: se muestran como bloque quitado y bloque añadido. Compara fragmentos más pequeños para más detalle.',
    truncated: 'Se muestran las primeras {n} filas. Copia el resultado para verlo entero.',
    added: 'añadida',
    removed: 'quitada',
    swap: 'Intercambiar',
    copyDiff: 'Copiar diff',
  },
  en: {
    original: 'Original',
    modified: 'Modified',
    originalPlaceholder: 'Paste the original text here',
    modifiedPlaceholder: 'Paste the modified text here',
    view: 'View',
    unified: 'Unified',
    split: 'Side by side',
    ignoreWhitespace: 'Ignore spaces',
    ignoreCase: 'Ignore case',
    onlyChanges: 'Changes only (with context)',
    result: 'Differences',
    counts: '+{added} added · −{removed} removed',
    identical: 'The texts are identical',
    empty: 'Paste both texts and the differences will appear here.',
    skipped: '{n} unchanged lines',
    tooLarge:
      'Too many different lines in a row to pair them one by one: they are shown as a removed block and an added block. Compare smaller pieces for more detail.',
    truncated: 'Showing the first {n} rows. Copy the result to see all of it.',
    added: 'added',
    removed: 'removed',
    swap: 'Swap',
    copyDiff: 'Copy diff',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/diff/content.es.md`:
```md
## Cómo funciona

Pega el texto original a la izquierda y el modificado a la derecha. La herramienta busca la subsecuencia común más larga de líneas y marca como quitadas (−) las que solo están en el original y como añadidas (+) las que solo están en el modificado. Cuando una línea cambia, además resalta las palabras concretas que son distintas, para que no tengas que buscarlas a ojo.

La **vista unificada** muestra los cambios uno debajo de otro, como `git diff`. La **vista en paralelo** pone cada versión en una columna. Con «Solo cambios» se ocultan los tramos largos sin cambios y se dejan tres líneas de contexto alrededor de cada diferencia.

## Opciones

«Ignorar espacios» trata como iguales las líneas que solo cambian en espacios, tabuladores o espacios al final; «Ignorar mayúsculas» hace lo mismo con las mayúsculas. Son útiles para comparar código reformateado o listas copiadas de sitios distintos. El contador de la cabecera resume cuántas líneas se añadieron y cuántas se quitaron, y «Copiar diff» copia el resultado en texto plano.
```

`src/tools/diff/content.en.md`:
```md
## How it works

Paste the original text on the left and the modified one on the right. The tool finds the longest common subsequence of lines and marks as removed (−) the lines only in the original and as added (+) the lines only in the modified text. When a line changes, it also highlights the exact words that differ, so you do not have to hunt for them.

The **unified view** lists changes one under another, like `git diff`. The **side-by-side view** puts each version in its own column. With “Changes only”, long unchanged stretches are hidden and three lines of context are kept around each difference.

## Options

“Ignore spaces” treats lines that only differ in spaces, tabs or trailing spaces as equal; “Ignore case” does the same with capital letters. They help when comparing reformatted code or lists copied from different places. The counter in the header sums up how many lines were added and removed, and “Copy diff” copies the result as plain text.
```

- [ ] **Step 8: `src/tools/diff/Diff.svelte`**
```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    collapse,
    countChanges,
    diffLines,
    shouldDebounce,
    splitLines,
    toRows,
    unifiedText,
    type DiffResult,
    type Item,
    type Segment,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const left = persistedInput('diff', '', remember);
  const right = persistedInput('diff-modified', '', remember);

  const MAX_ROWS = 2000;
  let view = $state<'unified' | 'split'>('unified');
  let ignoreWhitespace = $state(false);
  let ignoreCase = $state(false);
  let onlyChanges = $state(true);
  let result = $state<DiffResult | null>(null);

  $effect(() => {
    const a = left.value;
    const b = right.value;
    const opts = { ignoreWhitespace, ignoreCase };
    if (!a && !b) {
      result = null;
      return;
    }
    const run = () => (result = diffLines(splitLines(a), splitLines(b), opts));
    if (!shouldDebounce(a, b)) {
      run();
      return;
    }
    const timer = setTimeout(run, 150);
    return () => clearTimeout(timer);
  });

  const rows = $derived(result ? toRows(result.ops, { ignoreWhitespace, ignoreCase }) : []);
  const items: Item[] = $derived(
    onlyChanges ? collapse(rows) : rows.map((row) => ({ kind: 'row' as const, row })),
  );
  const shown = $derived(items.slice(0, MAX_ROWS));
  const counts = $derived(result ? countChanges(result.ops) : { added: 0, removed: 0 });
  const identical = $derived(!!result && counts.added === 0 && counts.removed === 0);
  const copyValue = $derived(result && !identical ? unifiedText(result.ops) : '');

  function swap() {
    const a = left.value;
    left.value = right.value;
    right.value = a;
  }
</script>

{#snippet segments(segs: Segment[], words: boolean)}
  {#each segs as seg, i (i)}{#if words && seg.changed}<mark>{seg.text}</mark
      >{:else}{seg.text}{/if}{/each}
{/snippet}

{#snippet line(
  kind: 'equal' | 'remove' | 'add',
  no: number | null,
  segs: Segment[],
  words: boolean,
)}
  <div class="line {kind}">
    <span class="no">{no ?? ''}</span>
    <span class="sign" aria-hidden="true"
      >{kind === 'add' ? '+' : kind === 'remove' ? '−' : ''}</span
    >
    {#if kind !== 'equal'}<span class="visually-hidden">{kind === 'add' ? s.added : s.removed}</span
      >{/if}
    <span class="text">{@render segments(segs, words)}</span>
  </div>
{/snippet}

<div class="panel">
  <div class="inputs">
    <Field id="diff-original" label={s.original}>
      {#snippet children({ describedby })}
        <TextArea
          id="diff-original"
          bind:value={left.value}
          placeholder={s.originalPlaceholder}
          {describedby}
          rows={10}
        />
      {/snippet}
    </Field>
    <Field id="diff-modified" label={s.modified}>
      {#snippet children({ describedby })}
        <TextArea
          id="diff-modified"
          bind:value={right.value}
          placeholder={s.modifiedPlaceholder}
          {describedby}
          rows={10}
        />
      {/snippet}
    </Field>
  </div>

  <div class="row">
    <Segmented
      label={s.view}
      options={[
        { value: 'unified', label: s.unified },
        { value: 'split', label: s.split },
      ]}
      bind:value={view}
    />
    <Toggle bind:checked={ignoreWhitespace} label={s.ignoreWhitespace} />
    <Toggle bind:checked={ignoreCase} label={s.ignoreCase} />
    <Toggle bind:checked={onlyChanges} label={s.onlyChanges} />
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={!result ? 'idle' : identical ? 'ok' : 'bad'}
        label={!result ? t(locale, 'led.idle') : identical ? s.identical : fill(s.counts, counts)}
      />
    {/snippet}
    {#if !result}
      <p class="display-note">{s.empty}</p>
    {:else if !identical}
      {#if result.tooLarge}<p class="display-note">{s.tooLarge}</p>{/if}
      <div class="diff {view}">
        {#each shown as item, i (i)}
          {#if item.kind === 'skip'}
            <div class="skip">{fill(s.skipped, { n: item.count })}</div>
          {:else if view === 'unified'}
            {@const r = item.row}
            {#if r.type === 'equal'}
              {@render line('equal', r.right!.no, r.right!.segments, false)}
            {:else}
              {#if r.left}{@render line(
                  'remove',
                  r.left.no,
                  r.left.segments,
                  r.type === 'change',
                )}{/if}
              {#if r.right}{@render line(
                  'add',
                  r.right.no,
                  r.right.segments,
                  r.type === 'change',
                )}{/if}
            {/if}
          {:else}
            {@const r = item.row}
            <div class="pair">
              {#if r.left}
                {@render line(
                  r.type === 'equal' ? 'equal' : 'remove',
                  r.left.no,
                  r.left.segments,
                  r.type === 'change',
                )}
              {:else}
                <div class="line blank"></div>
              {/if}
              {#if r.right}
                {@render line(
                  r.type === 'equal' ? 'equal' : 'add',
                  r.right.no,
                  r.right.segments,
                  r.type === 'change',
                )}
              {:else}
                <div class="line blank"></div>
              {/if}
            </div>
          {/if}
        {/each}
      </div>
      {#if items.length > MAX_ROWS}<p class="display-note">
          {fill(s.truncated, { n: MAX_ROWS })}
        </p>{/if}
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={copyValue} {locale} label={s.copyDiff} />
    <Button
      variant="ghost"
      icon="arrow-left-right"
      disabled={!left.value && !right.value}
      onclick={swap}>{s.swap}</Button
    >
    <Button
      variant="ghost"
      disabled={!left.value && !right.value}
      onclick={() => {
        left.value = '';
        right.value = '';
      }}>{t(locale, 'ui.clear')}</Button
    >
  </div>
  <Toggle
    bind:checked={
      () => left.remember,
      (v) => {
        left.remember = v;
        right.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }
  .diff {
    max-height: 70vh;
    overflow: auto;
    font: 400 13.5px/1.5 var(--font-mono);
  }
  .pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
  }
  .line {
    display: grid;
    grid-template-columns: 3.5em 1.2em 1fr;
    min-height: 1.5em;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .no {
    padding-right: 8px;
    text-align: right;
    color: var(--disp-dim);
    user-select: none;
  }
  .sign {
    color: var(--disp-dim);
    user-select: none;
  }
  .remove {
    background: color-mix(in srgb, var(--bad) 16%, transparent);
  }
  .add {
    background: color-mix(in srgb, var(--ok) 14%, transparent);
  }
  .blank {
    background: color-mix(in srgb, var(--disp-line) 40%, transparent);
  }
  mark {
    background: color-mix(in srgb, var(--disp-text) 30%, transparent);
    color: inherit;
    border-radius: 2px;
  }
  .skip {
    padding: 4px 0 4px 4.7em;
    color: var(--disp-dim);
    font-style: italic;
    border-block: 1px dashed var(--disp-line);
  }
  @media (max-width: 599px) {
    .pair {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as diff } from './diff/meta';
```
→
```ts
import { meta as diff } from './diff/meta';
```
y
```ts
  // diff,
```
→
```ts
  diff,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Diff from '../tools/diff/Diff.svelte';
```
→
```astro
import Diff from '../tools/diff/Diff.svelte';
```
y
```astro
{/* {id === 'diff' && <Diff client:load locale={locale} />} */}
```
→
```astro
{id === 'diff' && <Diff client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build
ls dist/es/comparar-textos.html dist/en/text-diff-checker.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `diff` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

A mano con `pnpm preview`, en `/es/comparar-textos`:
1. Original `uno`, `dos`, `tres`; modificado `uno`, `DOS`, `tres`, `cuatro` (una línea cada uno) → «+2 añadidas · −1 quitadas» y `dos` / `DOS` resaltados.
2. «Ignorar mayúsculas» → «+1 añadidas · −0 quitadas».
3. «En paralelo» → dos columnas; a 390 px de ancho, una debajo de otra.
4. Pegar dos textos de unas 5 000 líneas que solo difieren en una → la página responde mientras escribes y «Solo cambios» muestra «N líneas iguales».
5. `c` copia el diff con `- ` y `+ `. Recarga: los dos textos siguen (recordar activado).

- [ ] **Step 11: Commit**

```bash
git add src/tools/diff src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más. Si `pnpm format` retocó archivos que no son de esta tarea, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(diff): vista unificada y en paralelo, diferencias por palabra y opciones de comparación

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Regex: coincidencias, grupos, reemplazo, chuleta y errores explicados

**Files:**
- Create: `src/tools/regex/logic.ts`, `src/tools/regex/logic.test.ts`, `src/tools/regex/meta.ts`, `src/tools/regex/strings.ts`, `src/tools/regex/content.es.md`, `src/tools/regex/content.en.md`, `src/tools/regex/Regex.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `fill`; `t` (`ui.clear`, `led.idle`, `tool.remember`); kit: `Segmented`, `Field`, `TextArea`, `Toggle`, `Display`, `Led`, `CopyButton`, `Button`, `persistedInput`.
- Produces:
  - `FLAGS = ['g', 'i', 'm', 's', 'u', 'y']`, `type Flag`, `type ErrorHint` (12 casos), `RegexError { message; hint }`, `Group { index; name; value }`, `MatchInfo { index; end; text; groups }`, `FindResult`, `ReplaceResult`, `Piece { text; match }`, `MAX_MATCHES = 1000`, `DEBOUNCE_THRESHOLD = 20_000`
  - `explainError(message)`, `buildRegex(pattern, flags)`, `parseLiteral(input)`, `captureNames(pattern)`, `findMatches(pattern, flags, text, limit?)`, `highlight(text, matches): Piece[]`, `replaceText(pattern, flags, text, replacement)`, `shouldDebounce(text)`
  - `meta: ToolMeta` (id `regex`, slugs `probador-regex` / `regex-tester`), `strings: Record<Locale, …>`, `flagNames: Record<Locale, Record<Flag, string>>`, `hints: Record<Locale, Record<ErrorHint, string>>`, `cheatsheet: Record<Locale, [string, string][]>`, componente `Regex` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 13: `#regex-pattern`, `#regex-text`, `#regex-replacement`, `.display-code mark` (coincidencias), `table` (grupos), pestaña «Reemplazar».

**§7 (vinculante):** `regex` · data · Buscar · Reemplazar · «Coincidencias resaltadas en el texto. Tabla de grupos (con nombre incluido). Flags como toggles. Chuleta plegable. Errores de sintaxis explicados». Y de la §6: debounce con textos largos.

Cómo se cubre cada punto:
- Resaltado: `highlight` → `<mark>` con color alterno, sin `{@html}`. Test `highlight`.
- Tabla de grupos con nombre: columnas `$1` y `$<nombre>`; los grupos sin captura salen como «(sin valor)». Tests `lists numbered and named groups` y `captureNames`.
- Flags como toggles: un `Toggle` por flag (g, i, m, s, u, y), con el literal `/…/flags` a la vista; pegar un literal lo separa. Tests `honours the sticky flag` y `parseLiteral`.
- Chuleta plegable: `<details>` con 15 filas por idioma.
- Errores explicados: `explainError` + `hints` en el `error` del `Field`. Tests `errors`.
- Reemplazar: `replaceText` con `$1`, `$<nombre>` y `$&`, más el recuento. Tests `replaceText`.
- Que no se congele: Review Focus 2 y debounce de 150 ms desde 20 000 caracteres.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-regex -b plan-b/regex   # desde el commit de la Task 0
cd ../devtools-regex
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta tarea (Segmented, Field, TextArea, Toggle, Display, Led, CopyButton, Button) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente de la Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/regex/logic.test.ts` (la herramienta antigua no tenía tests de regex):
```ts
import { describe, expect, it } from 'vitest';
import {
  buildRegex,
  captureNames,
  explainError,
  findMatches,
  highlight,
  parseLiteral,
  replaceText,
  shouldDebounce,
} from './logic';

const ok = <T extends { ok: boolean }>(r: T) => {
  if (!r.ok) throw new Error('expected ok');
  return r as Extract<T, { ok: true }>;
};

describe('findMatches', () => {
  it('finds every match with the g flag and only the first without it', () => {
    expect(ok(findMatches('\\d+', 'g', 'a1 b22 c333')).matches.map((m) => m.text)).toEqual([
      '1',
      '22',
      '333',
    ]);
    expect(ok(findMatches('\\d+', '', 'a1 b22 c333')).matches.map((m) => m.text)).toEqual(['1']);
  });

  it('reports positions', () => {
    expect(ok(findMatches('b+', 'g', 'abba')).matches[0]).toMatchObject({
      index: 1,
      end: 3,
      text: 'bb',
    });
  });

  it('lists numbered and named groups', () => {
    const m = ok(
      findMatches('(?<year>\\d{4})-(\\d{2})(?:-(?<day>\\d{2}))?', 'g', '2026-09-26 y 2025-01'),
    ).matches;
    expect(m[0].groups).toEqual([
      { index: 1, name: 'year', value: '2026' },
      { index: 2, name: null, value: '09' },
      { index: 3, name: 'day', value: '26' },
    ]);
    expect(m[1].groups[2]).toEqual({ index: 3, name: 'day', value: undefined });
  });

  it('does not hang on empty matches', () => {
    const r = ok(findMatches('x*', 'g', 'abc'));
    expect(r.matches).toHaveLength(4);
    expect(ok(findMatches('^', 'gm', 'a\nb\nc')).matches).toHaveLength(3);
  });

  it('stops at the limit and says there were more', () => {
    const r = ok(findMatches('a', 'g', 'a'.repeat(50), 10));
    expect(r.matches).toHaveLength(10);
    expect(r.truncated).toBe(true);
    expect(ok(findMatches('a', 'g', 'a'.repeat(10), 10)).truncated).toBe(false);
  });

  it('returns nothing for an empty pattern', () => {
    expect(findMatches('', 'g', 'abc')).toEqual({ ok: true, matches: [], truncated: false });
  });

  it('honours the sticky flag', () => {
    expect(ok(findMatches('a', 'y', 'ba')).matches).toHaveLength(0);
    expect(ok(findMatches('a', 'gy', 'aab')).matches).toHaveLength(2);
  });
});

describe('errors', () => {
  it.each([
    ['(', 'unterminatedGroup'],
    ['a)', 'unmatchedParen'],
    ['*', 'nothingToRepeat'],
    ['[a', 'unterminatedClass'],
    ['(?<1a>x)', 'groupName'],
    ['(?<a>x)(?<a>y)', 'duplicateName'],
    ['a{3,1}', 'quantifierOrder'],
    ['\\', 'trailingBackslash'],
    ['(?x)', 'invalidGroup'],
    ['[z-a]', 'rangeOrder'],
  ])('explains %j', (pattern, hint) => {
    const r = buildRegex(pattern, '');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.hint).toBe(hint);
  });

  it('explains bad flags and lone brackets in unicode mode', () => {
    const flags = buildRegex('a', 'gg');
    expect(!flags.ok && flags.error.hint).toBe('flags');
    const bracket = buildRegex(']', 'u');
    expect(!bracket.ok && bracket.error.hint).toBe('loneBracket');
  });

  it('recognises Firefox and Safari wording too', () => {
    expect(explainError('unterminated parenthetical')).toBe('unterminatedGroup');
    expect(explainError('missing ) after group')).toBe('unterminatedGroup');
    expect(explainError('missing terminating ] for character class')).toBe('unterminatedClass');
    expect(explainError('invalid regexp group')).toBe('invalidGroup');
    expect(explainError('something else')).toBeNull();
  });
});

describe('captureNames', () => {
  it('ignores escapes, classes, lookarounds and non-capturing groups', () => {
    expect(captureNames('\\((a)[(](?:b)(?=c)(?<=d)(?<!e)(?<n>f)')).toEqual([null, 'n']);
  });
});

describe('highlight', () => {
  it('splits the text into plain and matched pieces', () => {
    const r = ok(findMatches('\\d+', 'g', 'a1b22'));
    expect(highlight('a1b22', r.matches)).toEqual([
      { text: 'a', match: null },
      { text: '1', match: 0 },
      { text: 'b', match: null },
      { text: '22', match: 1 },
    ]);
  });
});

describe('replaceText', () => {
  it('expands numbered and named references', () => {
    expect(replaceText('(\\w+)@(\\w+)', 'g', 'ana@x luis@y', '$2:$1')).toEqual({
      ok: true,
      output: 'x:ana y:luis',
      count: 2,
    });
    expect(replaceText('(?<d>\\d+)', 'g', 'a1b2', '[$<d>]')).toEqual({
      ok: true,
      output: 'a[1]b[2]',
      count: 2,
    });
  });

  it('replaces only the first match without g', () => {
    expect(replaceText('a', '', 'aaa', 'b')).toEqual({ ok: true, output: 'baa', count: 1 });
    expect(replaceText('z', '', 'aaa', 'b')).toEqual({ ok: true, output: 'aaa', count: 0 });
  });

  it('keeps context-dependent patterns right (anchors and lookbehind)', () => {
    expect(replaceText('(?<=\\$)\\d+', 'g', 'cost $10 and 20', 'N')).toEqual({
      ok: true,
      output: 'cost $N and 20',
      count: 1,
    });
  });

  it('returns the error for invalid patterns', () => {
    expect(replaceText('(', 'g', 'x', 'y').ok).toBe(false);
  });
});

describe('parseLiteral', () => {
  it('splits a pasted /pattern/flags literal', () => {
    expect(parseLiteral('/\\d+/gi')).toEqual({ pattern: '\\d+', flags: 'gi' });
    expect(parseLiteral('/a/b/')).toEqual({ pattern: 'a/b', flags: '' });
    expect(parseLiteral('\\d+')).toBeNull();
    expect(parseLiteral('/a/zz')).toBeNull();
  });
});

describe('shouldDebounce', () => {
  it('debounces only long texts', () => {
    expect(shouldDebounce('x'.repeat(100))).toBe(false);
    expect(shouldDebounce('x'.repeat(20_001))).toBe(true);
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/regex`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/regex/logic.ts`**

Los mensajes de error de `RegExp` cambian de un motor a otro: `explainError` reconoce los de V8 (Chrome, Node), SpiderMonkey (Firefox) y JavaScriptCore (Safari). El nombre de cada grupo sale de recorrer el patrón (`captureNames`), no de comparar valores, porque dos grupos pueden capturar lo mismo.

```ts
export const FLAGS = ['g', 'i', 'm', 's', 'u', 'y'] as const;
export type Flag = (typeof FLAGS)[number];

export type ErrorHint =
  | 'unterminatedGroup'
  | 'unmatchedParen'
  | 'nothingToRepeat'
  | 'unterminatedClass'
  | 'groupName'
  | 'duplicateName'
  | 'quantifierOrder'
  | 'trailingBackslash'
  | 'invalidGroup'
  | 'rangeOrder'
  | 'loneBracket'
  | 'flags';

export interface RegexError {
  message: string;
  hint: ErrorHint | null;
}

export interface Group {
  index: number;
  name: string | null;
  value: string | undefined;
}

export interface MatchInfo {
  index: number;
  end: number;
  text: string;
  groups: Group[];
}

export type FindResult =
  { ok: true; matches: MatchInfo[]; truncated: boolean } | { ok: false; error: RegexError };
export type ReplaceResult =
  { ok: true; output: string; count: number } | { ok: false; error: RegexError };

export const MAX_MATCHES = 1000;
export const DEBOUNCE_THRESHOLD = 20_000;

// V8 (Chrome, Node), SpiderMonkey (Firefox) and JavaScriptCore (Safari) word these differently.
const HINTS: [RegExp, ErrorHint][] = [
  [/invalid (regular expression )?flags|invalid flags/i, 'flags'],
  [/unterminated group|missing \)|unterminated parenthetical/i, 'unterminatedGroup'],
  [/unmatched ('\)'|\))|unmatched parentheses/i, 'unmatchedParen'],
  [/nothing to repeat/i, 'nothingToRepeat'],
  [/unterminated character class|missing terminating \]/i, 'unterminatedClass'],
  [/duplicate (capture group|group specifier) name/i, 'duplicateName'],
  [/invalid (capture group|group specifier) name/i, 'groupName'],
  [/numbers out of order/i, 'quantifierOrder'],
  [/\\ at end of pattern/i, 'trailingBackslash'],
  [/range out of order/i, 'rangeOrder'],
  [/lone quantifier brackets|raw bracket/i, 'loneBracket'],
  [/invalid (regexp )?group/i, 'invalidGroup'],
];

export function explainError(message: string): ErrorHint | null {
  for (const [re, hint] of HINTS) if (re.test(message)) return hint;
  return null;
}

export function buildRegex(
  pattern: string,
  flags: string,
): { ok: true; re: RegExp } | { ok: false; error: RegexError } {
  try {
    return { ok: true, re: new RegExp(pattern, flags) };
  } catch (e) {
    const message = (e as Error).message;
    return { ok: false, error: { message, hint: explainError(message) } };
  }
}

/** Accepts a pasted literal such as `/\d+/gi` and splits it into pattern and flags. */
export function parseLiteral(input: string): { pattern: string; flags: string } | null {
  const m = /^\/(.+)\/([a-z]*)$/s.exec(input);
  if (!m || !/^[dgimsuvy]*$/.test(m[2])) return null;
  return { pattern: m[1], flags: m[2] };
}

/**
 * Name of each capturing group, in capture order (null for unnamed ones).
 * Skips escapes, character classes and non-capturing groups such as (?:…), (?=…) or (?<=…).
 */
export function captureNames(pattern: string): (string | null)[] {
  const names: (string | null)[] = [];
  let inClass = false;
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === '\\') {
      i++;
      continue;
    }
    if (inClass) {
      if (c === ']') inClass = false;
      continue;
    }
    if (c === '[') {
      inClass = true;
      continue;
    }
    if (c !== '(') continue;
    if (pattern[i + 1] !== '?') {
      names.push(null);
      continue;
    }
    const named = /^\(\?<([^>=!][^>]*)>/.exec(pattern.slice(i));
    if (named) names.push(named[1]);
  }
  return names;
}

export function findMatches(
  pattern: string,
  flags: string,
  text: string,
  limit = MAX_MATCHES,
): FindResult {
  if (!pattern) return { ok: true, matches: [], truncated: false };
  const built = buildRegex(pattern, flags);
  if (!built.ok) return built;
  const re = built.re;
  const names = captureNames(pattern);
  const matches: MatchInfo[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const groups: Group[] = [];
    for (let i = 1; i < m.length; i++)
      groups.push({ index: i, name: names[i - 1] ?? null, value: m[i] });
    matches.push({ index: m.index, end: m.index + m[0].length, text: m[0], groups });
    if (!re.global) break;
    if (m[0].length === 0) re.lastIndex++; // an empty match would loop forever
    if (matches.length >= limit) return { ok: true, matches, truncated: re.exec(text) !== null };
  }
  return { ok: true, matches, truncated: false };
}

export interface Piece {
  text: string;
  match: number | null;
}

/** Splits the text into plain pieces and match pieces (by match number) for highlighting. */
export function highlight(text: string, matches: MatchInfo[]): Piece[] {
  const out: Piece[] = [];
  let pos = 0;
  matches.forEach((m, i) => {
    if (m.index > pos) out.push({ text: text.slice(pos, m.index), match: null });
    if (m.end > m.index) out.push({ text: text.slice(m.index, m.end), match: i });
    pos = Math.max(pos, m.end);
  });
  if (pos < text.length) out.push({ text: text.slice(pos), match: null });
  return out;
}

export function replaceText(
  pattern: string,
  flags: string,
  text: string,
  replacement: string,
): ReplaceResult {
  if (!pattern) return { ok: true, output: text, count: 0 };
  const built = buildRegex(pattern, flags);
  if (!built.ok) return built;
  const re = built.re;
  const output = text.replace(re, replacement);
  re.lastIndex = 0;
  const count = re.global ? (text.match(re)?.length ?? 0) : re.exec(text) ? 1 : 0;
  return { ok: true, output, count };
}

export function shouldDebounce(text: string): boolean {
  return text.length > DEBOUNCE_THRESHOLD;
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/regex`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/regex/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'regex',
  category: 'data',
  icon: 'regex',
  slug: { es: 'probador-regex', en: 'regex-tester' },
  name: { es: 'Regex', en: 'Regex' },
  title: {
    es: 'Probador de expresiones regulares (regex) online en JavaScript',
    en: 'JavaScript regex tester online: matches, groups and replace',
  },
  description: {
    es: 'Prueba expresiones regulares de JavaScript: resalta coincidencias, muestra grupos con nombre, reemplaza con $1 y explica los errores de sintaxis.',
    en: 'Test JavaScript regular expressions: highlight matches, list named groups, replace with $1 and get syntax errors explained in plain words.',
  },
  keywords: {
    es: [
      'regex',
      'expresiones regulares',
      'probar regex',
      'regexp javascript',
      'grupos de captura',
      'reemplazar regex',
    ],
    en: [
      'regex',
      'regular expressions',
      'regex tester',
      'javascript regexp',
      'capture groups',
      'regex replace',
    ],
  },
  tabs: { es: ['Buscar', 'Reemplazar'], en: ['Find', 'Replace'] },
};
```

`src/tools/regex/strings.ts`:
```ts
import type { Locale } from '../types';
import type { ErrorHint, Flag } from './logic';

export const strings = {
  es: {
    mode: 'Modo',
    pattern: 'Expresión',
    patternHelp: 'También puedes pegar un literal como /\\d+/gi.',
    patternPlaceholder: '(?<usuario>[\\w.]+)@(?<dominio>[\\w.]+)',
    flags: 'Flags',
    text: 'Texto de prueba',
    textPlaceholder: 'Escribe o pega el texto donde buscar',
    replacement: 'Reemplazo',
    replacementHelp: 'Usa $1, $<nombre> o $& para insertar lo capturado.',
    replacementPlaceholder: '$<dominio>: $<usuario>',
    matches: '{n} coincidencias',
    oneMatch: '1 coincidencia',
    noMatches: 'Sin coincidencias',
    truncated: 'Se muestran las primeras {n}.',
    invalid: 'Expresión no válida',
    empty: 'Escribe una expresión y un texto: las coincidencias se resaltan aquí.',
    groups: 'Grupos',
    match: 'Coincidencia',
    position: 'Posición',
    undefinedGroup: '(sin valor)',
    replaced: '{n} reemplazos',
    output: 'Resultado',
    cheatsheet: 'Chuleta',
    copyMatches: 'Copiar coincidencias',
  },
  en: {
    mode: 'Mode',
    pattern: 'Pattern',
    patternHelp: 'You can also paste a literal such as /\\d+/gi.',
    patternPlaceholder: '(?<user>[\\w.]+)@(?<domain>[\\w.]+)',
    flags: 'Flags',
    text: 'Test text',
    textPlaceholder: 'Type or paste the text to search',
    replacement: 'Replacement',
    replacementHelp: 'Use $1, $<name> or $& to insert what was captured.',
    replacementPlaceholder: '$<domain>: $<user>',
    matches: '{n} matches',
    oneMatch: '1 match',
    noMatches: 'No matches',
    truncated: 'Showing the first {n}.',
    invalid: 'Invalid pattern',
    empty: 'Type a pattern and some text: matches are highlighted here.',
    groups: 'Groups',
    match: 'Match',
    position: 'Position',
    undefinedGroup: '(no value)',
    replaced: '{n} replacements',
    output: 'Result',
    cheatsheet: 'Cheat sheet',
    copyMatches: 'Copy matches',
  },
} satisfies Record<Locale, Record<string, string>>;

export const flagNames: Record<Locale, Record<Flag, string>> = {
  es: {
    g: 'g · todas',
    i: 'i · sin mayúsculas',
    m: 'm · multilínea',
    s: 's · . incluye saltos',
    u: 'u · unicode',
    y: 'y · fija (sticky)',
  },
  en: {
    g: 'g · global',
    i: 'i · ignore case',
    m: 'm · multiline',
    s: 's · dot matches newlines',
    u: 'u · unicode',
    y: 'y · sticky',
  },
};

export const hints: Record<Locale, Record<ErrorHint, string>> = {
  es: {
    unterminatedGroup: 'Hay un «(» sin cerrar. Añade el «)» que falta o escápalo como \\(.',
    unmatchedParen: 'Sobra un «)». Quítalo o escápalo como \\).',
    nothingToRepeat:
      'Un cuantificador (*, +, ? o {n}) no tiene nada delante. Escápalo (\\*) si lo buscas literal.',
    unterminatedClass: 'Hay un «[» sin cerrar. Añade el «]» o escápalo como \\[.',
    groupName:
      'El nombre del grupo no es válido: debe empezar por una letra y no llevar espacios, como (?<año>…).',
    duplicateName: 'Dos grupos tienen el mismo nombre. Cambia uno de ellos.',
    quantifierOrder: 'En {n,m}, el primer número debe ser menor o igual que el segundo.',
    trailingBackslash: 'La expresión termina en «\\». Escápala como \\\\ o completa la secuencia.',
    invalidGroup: 'Tras «(?» debe ir :, =, !, <= , <! o <nombre>. Revisa ese grupo.',
    rangeOrder:
      'Un rango de caracteres está al revés, como [z-a]. Escríbelo de menor a mayor: [a-z].',
    loneBracket:
      'Con el flag u, «]», «{» y «}» sueltos no valen. Escápalos (\\]) o quita el flag u.',
    flags: 'Hay un flag repetido o desconocido. Los válidos son g, i, m, s, u, v, y y d.',
  },
  en: {
    unterminatedGroup: 'There is an unclosed “(”. Add the missing “)” or escape it as \\(.',
    unmatchedParen: 'There is an extra “)”. Remove it or escape it as \\).',
    nothingToRepeat:
      'A quantifier (*, +, ? or {n}) has nothing before it. Escape it (\\*) to match it literally.',
    unterminatedClass: 'There is an unclosed “[”. Add the “]” or escape it as \\[.',
    groupName:
      'The group name is not valid: it must start with a letter and have no spaces, like (?<year>…).',
    duplicateName: 'Two groups share the same name. Rename one of them.',
    quantifierOrder: 'In {n,m}, the first number must be less than or equal to the second.',
    trailingBackslash: 'The pattern ends with “\\”. Escape it as \\\\ or finish the sequence.',
    invalidGroup: 'After “(?” you need :, =, !, <=, <! or <name>. Check that group.',
    rangeOrder: 'A character range is backwards, like [z-a]. Write it low to high: [a-z].',
    loneBracket:
      'With the u flag, a lone “]”, “{” or “}” is not allowed. Escape it (\\]) or drop the u flag.',
    flags: 'A flag is repeated or unknown. Valid ones are g, i, m, s, u, v, y and d.',
  },
};

export const cheatsheet: Record<Locale, [string, string][]> = {
  es: [
    ['.', 'Cualquier carácter salvo salto de línea'],
    ['\\d  \\w  \\s', 'Dígito, carácter de palabra, espacio'],
    ['\\D  \\W  \\S', 'Lo contrario de los anteriores'],
    ['[abc]  [^abc]  [a-z]', 'Uno de, ninguno de, rango'],
    ['^  $', 'Inicio y fin (de línea con el flag m)'],
    ['\\b', 'Límite de palabra'],
    ['*  +  ?', '0 o más, 1 o más, 0 o 1'],
    ['{3}  {2,5}  {2,}', 'Exactamente, entre, al menos'],
    ['*?  +?', 'Versión perezosa (lo mínimo posible)'],
    ['(…)  (?:…)', 'Grupo con captura y sin captura'],
    ['(?<nombre>…)', 'Grupo con nombre'],
    ['a|b', 'a o b'],
    ['(?=…)  (?!…)', 'Seguido de, no seguido de'],
    ['(?<=…)  (?<!…)', 'Precedido de, no precedido de'],
    ['\\1  \\k<nombre>', 'Repite lo capturado por un grupo'],
  ],
  en: [
    ['.', 'Any character except a line break'],
    ['\\d  \\w  \\s', 'Digit, word character, whitespace'],
    ['\\D  \\W  \\S', 'The opposite of the above'],
    ['[abc]  [^abc]  [a-z]', 'One of, none of, range'],
    ['^  $', 'Start and end (of line with the m flag)'],
    ['\\b', 'Word boundary'],
    ['*  +  ?', '0 or more, 1 or more, 0 or 1'],
    ['{3}  {2,5}  {2,}', 'Exactly, between, at least'],
    ['*?  +?', 'Lazy version (as few as possible)'],
    ['(…)  (?:…)', 'Capturing and non-capturing group'],
    ['(?<name>…)', 'Named group'],
    ['a|b', 'a or b'],
    ['(?=…)  (?!…)', 'Followed by, not followed by'],
    ['(?<=…)  (?<!…)', 'Preceded by, not preceded by'],
    ['\\1  \\k<name>', 'Repeats what a group captured'],
  ],
};
```

- [ ] **Step 7: Contenido SEO**

`src/tools/regex/content.es.md`:
```md
## Cómo funciona

Escribe una expresión regular y un texto de prueba: las coincidencias se resaltan al momento y la tabla muestra cada una con su posición y sus grupos de captura, incluidos los grupos con nombre (`(?<año>\d{4})`). Los flags se activan con interruptores; si pegas un literal como `/\d+/gi`, se separan solos la expresión y los flags.

Se usa el motor de JavaScript del navegador, así que el resultado es exactamente el que tendrás en tu código JS o TS. Otros lenguajes (PCRE, Python, Java) comparten casi toda la sintaxis, pero no toda: por ejemplo, JavaScript no tiene cuantificadores posesivos.

## Reemplazar y errores

En la pestaña **Reemplazar** puedes probar una sustitución con `$1`, `$<nombre>` o `$&` (toda la coincidencia) y ver el texto resultante y cuántos reemplazos se han hecho. Si la expresión tiene un error de sintaxis, en lugar del mensaje técnico verás qué falla y cómo arreglarlo, por ejemplo un paréntesis sin cerrar o un rango al revés. La chuleta plegable resume la sintaxis más usada.
```

`src/tools/regex/content.en.md`:
```md
## How it works

Type a regular expression and some test text: matches are highlighted right away and the table lists each one with its position and capture groups, named groups included (`(?<year>\d{4})`). Flags are switches; if you paste a literal such as `/\d+/gi`, the pattern and flags are split for you.

It runs on the browser’s JavaScript engine, so the result is exactly what you get in JS or TS code. Other languages (PCRE, Python, Java) share most of the syntax, but not all of it: JavaScript has no possessive quantifiers, for example.

## Replace and errors

The **Replace** tab lets you try a substitution with `$1`, `$<name>` or `$&` (the whole match) and see the resulting text and how many replacements were made. If the pattern has a syntax error, instead of the technical message you get what is wrong and how to fix it, such as an unclosed parenthesis or a backwards range. The collapsible cheat sheet sums up the most common syntax.
```

- [ ] **Step 8: `src/tools/regex/Regex.svelte`**
```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    FLAGS,
    MAX_MATCHES,
    findMatches,
    highlight,
    parseLiteral,
    replaceText,
    shouldDebounce,
    type FindResult,
    type Flag,
  } from './logic';
  import { meta } from './meta';
  import { cheatsheet, flagNames, hints, strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const pattern = persistedInput('regex-pattern', '', remember);
  const text = persistedInput('regex', '', remember);

  const MAX_TABLE = 100;
  let tab = $state<'find' | 'replace'>('find');
  let flags = $state<Record<Flag, boolean>>({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false,
  });
  let replacement = $state('');
  let result = $state<FindResult | null>(null);

  const flagString = $derived(FLAGS.filter((f) => flags[f]).join(''));

  $effect(() => {
    const p = pattern.value;
    const f = flagString;
    const body = text.value;
    if (!p) {
      result = null;
      return;
    }
    const run = () => (result = findMatches(p, f, body));
    if (!shouldDebounce(body)) {
      run();
      return;
    }
    const timer = setTimeout(run, 150);
    return () => clearTimeout(timer);
  });

  function onPatternInput(e: Event & { currentTarget: HTMLInputElement }) {
    const literal = parseLiteral(e.currentTarget.value);
    if (!literal) return;
    pattern.value = literal.pattern;
    for (const f of FLAGS) flags[f] = literal.flags.includes(f);
  }

  const matches = $derived(result?.ok ? result.matches : []);
  const pieces = $derived(result?.ok ? highlight(text.value, matches) : []);
  const replaced = $derived(
    tab === 'replace' && pattern.value && result?.ok
      ? replaceText(pattern.value, flagString, text.value, replacement)
      : null,
  );
  const ledState = $derived(!result ? 'idle' : !result.ok ? 'bad' : matches.length ? 'ok' : 'idle');
  const ledLabel = $derived.by(() => {
    if (!result) return t(locale, 'led.idle');
    if (!result.ok) return s.invalid;
    if (tab === 'replace' && replaced?.ok) return fill(s.replaced, { n: replaced.count });
    if (!matches.length) return s.noMatches;
    return matches.length === 1 ? s.oneMatch : fill(s.matches, { n: matches.length });
  });
  const copyValue = $derived(
    tab === 'replace'
      ? replaced?.ok
        ? replaced.output
        : ''
      : matches.map((m) => m.text).join('\n'),
  );
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'find', label: meta.tabs![locale][0] },
      { value: 'replace', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    <Field
      id="regex-pattern"
      label={s.pattern}
      help={s.patternHelp}
      error={result && !result.ok
        ? result.error.hint
          ? hints[locale][result.error.hint]
          : result.error.message
        : undefined}
    >
      {#snippet children({ describedby })}
        <div class="pattern">
          <span aria-hidden="true">/</span>
          <input
            id="regex-pattern"
            class="control mono"
            type="text"
            autocomplete="off"
            spellcheck="false"
            placeholder={s.patternPlaceholder}
            aria-describedby={describedby}
            aria-invalid={result ? !result.ok : false}
            bind:value={pattern.value}
            oninput={onPatternInput}
          />
          <span aria-hidden="true">/{flagString}</span>
        </div>
      {/snippet}
    </Field>

    <fieldset class="flags">
      <legend>{s.flags}</legend>
      {#each FLAGS as f (f)}
        <Toggle bind:checked={flags[f]} label={flagNames[locale][f]} />
      {/each}
    </fieldset>

    <Field id="regex-text" label={s.text}>
      {#snippet children({ describedby })}
        <TextArea
          id="regex-text"
          bind:value={text.value}
          placeholder={s.textPlaceholder}
          {describedby}
          rows={8}
        />
      {/snippet}
    </Field>

    {#if tab === 'replace'}
      <Field id="regex-replacement" label={s.replacement} help={s.replacementHelp}>
        {#snippet children({ describedby })}
          <input
            id="regex-replacement"
            class="control mono"
            type="text"
            autocomplete="off"
            spellcheck="false"
            placeholder={s.replacementPlaceholder}
            aria-describedby={describedby}
            bind:value={replacement}
          />
        {/snippet}
      </Field>
    {/if}

    <Display live label={tab === 'find' ? s.match : s.output}>
      {#snippet head()}
        <Led state={ledState} label={ledLabel} />
        {#if result?.ok && result.truncated}<span>{fill(s.truncated, { n: MAX_MATCHES })}</span
          >{/if}
      {/snippet}
      {#if !result}
        <p class="display-note">{s.empty}</p>
      {:else if !result.ok}
        <p class="display-note">{result.error.message}</p>
      {:else if tab === 'find'}
        <pre class="display-code wrap">{#each pieces as p, i (i)}{#if p.match !== null}<mark
                class:alt={p.match % 2 === 1}>{p.text}</mark
              >{:else}{p.text}{/if}{/each}</pre>
      {:else if replaced?.ok}
        <pre class="display-code wrap">{replaced.output}</pre>
      {/if}
    </Display>

    {#if tab === 'find' && matches.length}
      <Display label={s.groups}>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">{s.match}</th>
                <th scope="col">{s.position}</th>
                {#each matches[0].groups as g (g.index)}
                  <th scope="col">{g.name ? `$<${g.name}>` : `$${g.index}`}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each matches.slice(0, MAX_TABLE) as m, i (i)}
                <tr>
                  <td>{i + 1}</td>
                  <td>{m.text}</td>
                  <td>{m.index}–{m.end}</td>
                  {#each m.groups as g (g.index)}
                    <td class:muted={g.value === undefined}>{g.value ?? s.undefinedGroup}</td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </Display>
    {/if}

    <div class="row">
      <CopyButton
        main
        value={copyValue}
        {locale}
        label={tab === 'find' ? s.copyMatches : undefined}
      />
      <Button
        variant="ghost"
        disabled={!pattern.value && !text.value}
        onclick={() => {
          pattern.value = '';
          text.value = '';
          replacement = '';
        }}>{t(locale, 'ui.clear')}</Button
      >
    </div>

    <details class="cheat">
      <summary>{s.cheatsheet}</summary>
      <dl>
        {#each cheatsheet[locale] as [token, meaning] (token)}
          <dt><code>{token}</code></dt>
          <dd>{meaning}</dd>
        {/each}
      </dl>
    </details>

    <Toggle
      bind:checked={
        () => text.remember,
        (v) => {
          text.remember = v;
          pattern.remember = v;
        }
      }
      label={t(locale, 'tool.remember')}
    />
  </div>
</div>

<style>
  .pattern {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    color: var(--text-dim);
  }
  .flags {
    display: flex;
    flex-wrap: wrap;
    gap: 0 20px;
    margin: 0;
    padding: 0;
    border: 0;
  }
  .flags legend {
    margin-bottom: 4px;
    font-size: 13px;
    font-weight: 600;
  }
  .wrap {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  mark {
    background: color-mix(in srgb, var(--disp-text) 32%, transparent);
    color: inherit;
    border-radius: 2px;
  }
  mark.alt {
    background: color-mix(in srgb, var(--ok) 32%, transparent);
  }
  .table-wrap {
    max-height: 50vh;
    overflow: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font: 400 13.5px/1.45 var(--font-mono);
  }
  th,
  td {
    padding: 6px 10px;
    text-align: left;
    border-bottom: 1px solid var(--disp-line);
    vertical-align: top;
    overflow-wrap: anywhere;
  }
  th {
    color: var(--disp-dim);
    font-weight: 600;
  }
  .muted {
    color: var(--disp-dim);
  }
  .cheat summary {
    padding: 12px 0;
    cursor: pointer;
    font-weight: 600;
  }
  .cheat dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 6px 20px;
    margin: 8px 0 0;
    font-size: 14px;
  }
  .cheat dd {
    margin: 0;
    color: var(--text-dim);
  }
  .cheat code {
    font-family: var(--font-mono);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as regex } from './regex/meta';
```
→
```ts
import { meta as regex } from './regex/meta';
```
y
```ts
  // regex,
```
→
```ts
  regex,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Regex from '../tools/regex/Regex.svelte';
```
→
```astro
import Regex from '../tools/regex/Regex.svelte';
```
y
```astro
{/* {id === 'regex' && <Regex client:load locale={locale} />} */}
```
→
```astro
{id === 'regex' && <Regex client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build
ls dist/es/probador-regex.html dist/en/regex-tester.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `regex` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

A mano con `pnpm preview`, en `/es/probador-regex`:
1. Patrón `(?<n>\d+)` y texto `a1 b22 c333` → «3 coincidencias», tres resaltados y tabla con la columna `$<n>`.
2. Patrón `(` → bajo el campo, «Hay un «(» sin cerrar…», y LED «Expresión no válida».
3. Pegar `/a/gi` en el patrón → queda `a` y se activan g e i.
4. Pestaña Reemplazar (`2`) con reemplazo `[$&]` sobre `A a` → `[A] [a]` y «2 reemplazos».
5. Abrir la chuleta. Recarga: el patrón y el texto siguen.

- [ ] **Step 11: Commit**

```bash
git add src/tools/regex src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más. Si `pnpm format` retocó archivos que no son de esta tarea, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(regex): resaltado, tabla de grupos con nombre, reemplazo, chuleta y errores explicados

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Texto: diez conversiones de mayúsculas y utilidades de líneas

**Files:**
- Create: `src/tools/text/logic.ts`, `src/tools/text/logic.test.ts`, `src/tools/text/meta.ts`, `src/tools/text/strings.ts`, `src/tools/text/content.es.md`, `src/tools/text/content.en.md`, `src/tools/text/Text.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `fill`; `t` (`ui.useOutput`, `ui.clear`, `led.idle`, `tool.remember`); kit: `Segmented`, `Field`, `TextArea`, `Select`, `Toggle`, `Display`, `CopyButton`, `Button`, `persistedInput`.
- Produces:
  - `type CaseId` (10 valores), `TextStats { chars; words; lines; bytes }`, `type SortOrder = 'none' | 'az' | 'za' | 'natural'`, `LineOptions`, `DEFAULT_LINE_OPTIONS`, `CASES: { id; label; fn }[]`
  - `splitWords(line)`, `toTitleCase`, `toSentenceCase`, `toCamelCase`, `toPascalCase`, `toSnakeCase`, `toConstantCase`, `toKebabCase`, `toDotCase`, `convertAll(text): Record<CaseId, string>`, `countText(text): TextStats` (API antigua), `processLines(text, opts, locale?)`
  - `meta: ToolMeta` (id `text`, slugs `convertir-mayusculas-minusculas` / `text-case-converter`), `strings: Record<Locale, …>`, componente `Text` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 13: `#text-input`, `.display-rows` (conversiones), pestaña «Líneas», `#text-sort`, interruptores por su etiqueta, `.display-code` (resultado de Líneas).

**§7 (vinculante):** `text` · data · Mayúsculas · Líneas · «Mayúsculas: todas las conversiones a la vez (UPPER, lower, Title, Sentence, camel, Pascal, snake, CONSTANT, kebab, dot), cada una con su copiar. Líneas: ordenar (A-Z, Z-A, natural), invertir, quitar duplicados y vacías, recortar, numerar. Conteo de caracteres, palabras, líneas y bytes siempre visible».

Cómo se cubre cada punto:
- Las diez conversiones a la vez, cada una con su copiar: `CASES` + `convertAll`. Test `offers the ten conversions at once`.
- Ordenar A-Z, Z-A y natural con `Intl.Collator` (la ñ en su sitio): test `sorts A-Z, Z-A and naturally`.
- Invertir, quitar duplicadas y vacías, recortar y numerar: `processLines`, combinables. Tests `processLines`.
- Recuento siempre visible, encima de las dos pestañas: `countText` (bytes en UTF-8). Tests `countText`.
- Cambio respecto a la versión antigua: «Reverse» invertía los caracteres de todo el texto; la §7 lo pone en Líneas, así que ahora invierte el orden de las líneas.
- La pestaña Mayúsculas no tiene un resultado principal (son diez), así que no lleva `CopyButton main`; `c` copia en la pestaña Líneas.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-text -b plan-b/text   # desde el commit de la Task 0
cd ../devtools-text
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta tarea (Segmented, Field, TextArea, Select, Toggle, Display, CopyButton, Button) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente de la Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/text/logic.test.ts` (incluye los 6 tests de texto de `legacy/src/__tests__/tools.test.ts`):
```ts
import { describe, expect, it } from 'vitest';
import {
  CASES,
  DEFAULT_LINE_OPTIONS,
  convertAll,
  countText,
  processLines,
  splitWords,
  toCamelCase,
  toConstantCase,
  toDotCase,
  toKebabCase,
  toPascalCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
} from './logic';

describe('case conversion (legacy behaviour)', () => {
  it('converts to title case', () => {
    expect(toTitleCase('hello world')).toBe('Hello World');
  });

  it('converts to camelCase', () => {
    expect(toCamelCase('hello world')).toBe('helloWorld');
    expect(toCamelCase('hello-world')).toBe('helloWorld');
    expect(toCamelCase('hello_world')).toBe('helloWorld');
  });

  it('converts to snake_case', () => {
    expect(toSnakeCase('helloWorld')).toBe('hello_world');
    expect(toSnakeCase('hello world')).toBe('hello_world');
    expect(toSnakeCase('hello-world')).toBe('hello_world');
  });

  it('converts to kebab-case', () => {
    expect(toKebabCase('helloWorld')).toBe('hello-world');
    expect(toKebabCase('hello world')).toBe('hello-world');
    expect(toKebabCase('hello_world')).toBe('hello-world');
  });
});

describe('case conversion (new)', () => {
  it('splits words on separators and camelCase boundaries, acronyms included', () => {
    expect(splitWords('XMLHttpRequest')).toEqual(['XML', 'Http', 'Request']);
    expect(splitWords('user_id-v2 total')).toEqual(['user', 'id', 'v2', 'total']);
    expect(splitWords('getHTTP2Response')).toEqual(['get', 'HTTP2', 'Response']);
  });

  it('converts to every identifier style', () => {
    const s = 'Número de pedido';
    expect(toCamelCase(s)).toBe('númeroDePedido');
    expect(toPascalCase(s)).toBe('NúmeroDePedido');
    expect(toSnakeCase(s)).toBe('número_de_pedido');
    expect(toConstantCase(s)).toBe('NÚMERO_DE_PEDIDO');
    expect(toKebabCase(s)).toBe('número-de-pedido');
    expect(toDotCase(s)).toBe('número.de.pedido');
    expect(toSnakeCase('XMLHttpRequest')).toBe('xml_http_request');
  });

  it('converts each line on its own', () => {
    expect(toSnakeCase('fooBar\nbazQux')).toBe('foo_bar\nbaz_qux');
  });

  it('writes sentence case', () => {
    expect(toSentenceCase('HOLA MUNDO. ¿QUÉ TAL? bien')).toBe('Hola mundo. ¿Qué tal? Bien');
  });

  it('offers the ten conversions at once', () => {
    expect(CASES).toHaveLength(10);
    const all = convertAll('hola mundo');
    expect(all).toEqual({
      upper: 'HOLA MUNDO',
      lower: 'hola mundo',
      title: 'Hola Mundo',
      sentence: 'Hola mundo',
      camel: 'holaMundo',
      pascal: 'HolaMundo',
      snake: 'hola_mundo',
      constant: 'HOLA_MUNDO',
      kebab: 'hola-mundo',
      dot: 'hola.mundo',
    });
  });
});

describe('countText', () => {
  it('counts text stats (legacy behaviour)', () => {
    const result = countText('Hello world\nSecond line');
    expect(result.chars).toBe(23);
    expect(result.words).toBe(4);
    expect(result.lines).toBe(2);
  });

  it('handles empty text', () => {
    const result = countText('');
    expect(result.chars).toBe(0);
    expect(result.words).toBe(0);
    expect(result.lines).toBe(1);
  });

  it('counts characters, not UTF-16 units, and UTF-8 bytes', () => {
    expect(countText('ñ😀')).toEqual({ chars: 2, words: 1, lines: 1, bytes: 6 });
  });
});

describe('processLines', () => {
  const run = (text: string, o: Partial<typeof DEFAULT_LINE_OPTIONS>) =>
    processLines(text, { ...DEFAULT_LINE_OPTIONS, ...o }, 'es');

  it('sorts A-Z, Z-A and naturally', () => {
    expect(run('b\na\nC', { sort: 'az' })).toBe('a\nb\nC');
    expect(run('b\na\nC', { sort: 'za' })).toBe('C\nb\na');
    expect(run('file10\nfile2\nfile1', { sort: 'az' })).toBe('file1\nfile10\nfile2');
    expect(run('file10\nfile2\nfile1', { sort: 'natural' })).toBe('file1\nfile2\nfile10');
    expect(run('ñu\nnube\nzorro', { sort: 'az' })).toBe('nube\nñu\nzorro');
  });

  it('reverses line order', () => {
    expect(run('1\n2\n3', { reverse: true })).toBe('3\n2\n1');
  });

  it('removes duplicates and empty lines and trims', () => {
    expect(run('a\n\nb\na\n  ', { removeEmpty: true, dedupe: true })).toBe('a\nb');
    expect(run('  a \n b', { trim: true })).toBe('a\nb');
    expect(run(' a\na', { trim: true, dedupe: true })).toBe('a');
  });

  it('numbers lines with aligned numbers', () => {
    expect(run('a\nb', { number: true })).toBe('1. a\n2. b');
    expect(
      run(Array.from({ length: 10 }, () => 'x').join('\n'), { number: true }).split('\n')[0],
    ).toBe(' 1. x');
  });

  it('leaves the text alone with default options', () => {
    expect(run(' b\na ', {})).toBe(' b\na ');
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/text`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/text/logic.ts`**

Los estilos de código se construyen sobre `splitWords`, que entiende siglas (`XMLHttpRequest`) y letras con tilde, y convierten línea a línea. `countText` cuenta caracteres Unicode (un emoji es 1), no unidades UTF-16.

```ts
export type CaseId =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'constant'
  | 'kebab'
  | 'dot';

export interface TextStats {
  chars: number;
  words: number;
  lines: number;
  bytes: number;
}

export type SortOrder = 'none' | 'az' | 'za' | 'natural';

export interface LineOptions {
  trim: boolean;
  removeEmpty: boolean;
  dedupe: boolean;
  sort: SortOrder;
  reverse: boolean;
  number: boolean;
}

export const DEFAULT_LINE_OPTIONS: LineOptions = {
  trim: false,
  removeEmpty: false,
  dedupe: false,
  sort: 'none',
  reverse: false,
  number: false,
};

const perLine = (fn: (line: string) => string) => (text: string) =>
  text.split('\n').map(fn).join('\n');

/**
 * Words of an identifier or phrase: splits on anything that is not a letter or digit
 * and on camelCase boundaries ("XMLHttpRequest" → XML, Http, Request).
 */
export function splitWords(line: string): string[] {
  return (line.match(/[\p{L}\p{N}]+/gu) ?? []).flatMap((chunk) =>
    chunk
      .replace(/(\p{Ll}|\p{N})(\p{Lu})/gu, '$1 $2')
      .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2')
      .split(' '),
  );
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

export function toTitleCase(text: string): string {
  return text.replace(
    /[\p{L}\p{N}_][^\s]*/gu,
    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
  );
}

/** Lower case, with a capital at the start of each sentence (also after "¿", "¡" or quotes). */
export function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(
      /(^|[.!?]\s+|\n)(\s*[¡¿"'«(]*)(\p{L})/gu,
      (_, pre: string, lead: string, ch: string) => pre + lead + ch.toUpperCase(),
    );
}

export const toCamelCase = perLine((line) =>
  splitWords(line)
    .map((w, i) => (i === 0 ? w.toLowerCase() : cap(w)))
    .join(''),
);
export const toPascalCase = perLine((line) => splitWords(line).map(cap).join(''));
export const toSnakeCase = perLine((line) =>
  splitWords(line)
    .map((w) => w.toLowerCase())
    .join('_'),
);
export const toConstantCase = perLine((line) =>
  splitWords(line)
    .map((w) => w.toUpperCase())
    .join('_'),
);
export const toKebabCase = perLine((line) =>
  splitWords(line)
    .map((w) => w.toLowerCase())
    .join('-'),
);
export const toDotCase = perLine((line) =>
  splitWords(line)
    .map((w) => w.toLowerCase())
    .join('.'),
);

export const CASES: { id: CaseId; label: string; fn: (text: string) => string }[] = [
  { id: 'upper', label: 'UPPER CASE', fn: (t) => t.toUpperCase() },
  { id: 'lower', label: 'lower case', fn: (t) => t.toLowerCase() },
  { id: 'title', label: 'Title Case', fn: toTitleCase },
  { id: 'sentence', label: 'Sentence case', fn: toSentenceCase },
  { id: 'camel', label: 'camelCase', fn: toCamelCase },
  { id: 'pascal', label: 'PascalCase', fn: toPascalCase },
  { id: 'snake', label: 'snake_case', fn: toSnakeCase },
  { id: 'constant', label: 'CONSTANT_CASE', fn: toConstantCase },
  { id: 'kebab', label: 'kebab-case', fn: toKebabCase },
  { id: 'dot', label: 'dot.case', fn: toDotCase },
];

export function convertAll(text: string): Record<CaseId, string> {
  return Object.fromEntries(CASES.map((c) => [c.id, c.fn(text)])) as Record<CaseId, string>;
}

export function countText(text: string): TextStats {
  return {
    chars: [...text].length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text.split('\n').length,
    bytes: new TextEncoder().encode(text).length,
  };
}

export function processLines(text: string, opts: LineOptions, locale = 'es'): string {
  let lines = text.split('\n');
  if (opts.trim) lines = lines.map((l) => l.trim());
  if (opts.removeEmpty) lines = lines.filter((l) => l.trim() !== '');
  if (opts.dedupe) lines = [...new Set(lines)];
  if (opts.sort !== 'none') {
    const collator = new Intl.Collator(locale, {
      numeric: opts.sort === 'natural',
      sensitivity: 'variant',
    });
    lines = [...lines].sort(collator.compare);
    if (opts.sort === 'za') lines.reverse();
  }
  if (opts.reverse) lines = [...lines].reverse();
  if (opts.number) {
    const width = String(lines.length).length;
    lines = lines.map((l, i) => `${String(i + 1).padStart(width, ' ')}. ${l}`);
  }
  return lines.join('\n');
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/text`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/text/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'text',
  category: 'data',
  icon: 'case-sensitive',
  slug: { es: 'convertir-mayusculas-minusculas', en: 'text-case-converter' },
  name: { es: 'Mayúsculas y líneas', en: 'Case and lines' },
  title: {
    es: 'Convertir mayúsculas, camelCase y snake_case y ordenar líneas',
    en: 'Text case converter: camelCase, snake_case and line tools',
  },
  description: {
    es: 'Pasa un texto a las diez formas a la vez (MAYÚSCULAS, camelCase, snake_case, kebab-case…) y ordena, limpia o numera líneas. Con contador de caracteres.',
    en: 'Convert text into ten cases at once (UPPER, camelCase, snake_case, kebab-case…) and sort, clean up or number lines. With a character counter.',
  },
  keywords: {
    es: [
      'mayusculas a minusculas',
      'camelcase',
      'snake case',
      'kebab case',
      'ordenar lineas',
      'quitar duplicados',
      'contar caracteres',
    ],
    en: [
      'case converter',
      'camelcase',
      'snake case',
      'kebab case',
      'sort lines',
      'remove duplicate lines',
      'character count',
    ],
  },
  tabs: { es: ['Mayúsculas', 'Líneas'], en: ['Case', 'Lines'] },
};
```

`src/tools/text/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    mode: 'Modo',
    input: 'Texto',
    placeholder: 'Escribe o pega texto: una frase, identificadores o una lista de líneas',
    stats: 'Recuento',
    chars: 'Caracteres',
    words: 'Palabras',
    lines: 'Líneas',
    bytes: 'Bytes (UTF-8)',
    cases: 'Conversiones',
    emptyCases: 'Escribe algo y verás las diez conversiones a la vez.',
    perLine: 'Los estilos de código (camelCase, snake_case…) convierten cada línea por separado.',
    sort: 'Ordenar',
    sortNone: 'Sin ordenar',
    sortAz: 'A-Z',
    sortZa: 'Z-A',
    sortNatural: 'Natural (2 antes que 10)',
    reverse: 'Invertir el orden',
    dedupe: 'Quitar duplicadas',
    removeEmpty: 'Quitar vacías',
    trim: 'Recortar espacios',
    number: 'Numerar',
    result: 'Resultado',
    emptyLines: 'Escribe o pega varias líneas y elige qué hacer con ellas.',
    resultLines: '{n} líneas',
  },
  en: {
    mode: 'Mode',
    input: 'Text',
    placeholder: 'Type or paste text: a sentence, identifiers or a list of lines',
    stats: 'Count',
    chars: 'Characters',
    words: 'Words',
    lines: 'Lines',
    bytes: 'Bytes (UTF-8)',
    cases: 'Conversions',
    emptyCases: 'Type something to see all ten conversions at once.',
    perLine: 'Code styles (camelCase, snake_case…) convert each line on its own.',
    sort: 'Sort',
    sortNone: 'Unsorted',
    sortAz: 'A-Z',
    sortZa: 'Z-A',
    sortNatural: 'Natural (2 before 10)',
    reverse: 'Reverse order',
    dedupe: 'Remove duplicates',
    removeEmpty: 'Remove empty',
    trim: 'Trim spaces',
    number: 'Number',
    result: 'Result',
    emptyLines: 'Type or paste several lines and choose what to do with them.',
    resultLines: '{n} lines',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/text/content.es.md`:
```md
## Mayúsculas y estilos de nombre

Escribe o pega un texto y verás a la vez sus diez conversiones: MAYÚSCULAS, minúsculas, Tipo Título, Tipo oración y los estilos de nombres de código `camelCase`, `PascalCase`, `snake_case`, `CONSTANT_CASE`, `kebab-case` y `dot.case`. Cada una tiene su botón de copiar.

Para los estilos de código, el texto se parte en palabras por espacios, guiones, guiones bajos y cambios de minúscula a mayúscula, respetando las siglas: `XMLHttpRequest` pasa a `xml_http_request`. Si pegas varias líneas, cada una se convierte por separado, así puedes renombrar una lista de campos de golpe.

## Líneas y recuento

La pestaña **Líneas** ordena (A-Z, Z-A o natural, donde `archivo2` va antes que `archivo10`), invierte el orden, quita duplicadas y vacías, recorta espacios y numera. Las opciones se combinan y el resultado se actualiza al momento. Arriba siempre ves el recuento de caracteres, palabras, líneas y bytes en UTF-8, útil para límites de longitud en bases de datos o formularios.
```

`src/tools/text/content.en.md`:
```md
## Case and naming styles

Type or paste some text and you see all ten conversions at once: UPPER CASE, lower case, Title Case, Sentence case and the code naming styles `camelCase`, `PascalCase`, `snake_case`, `CONSTANT_CASE`, `kebab-case` and `dot.case`. Each one has its own copy button.

For code styles, text is split into words at spaces, hyphens, underscores and lower-to-upper case changes, keeping acronyms together: `XMLHttpRequest` becomes `xml_http_request`. If you paste several lines, each one is converted on its own, so you can rename a list of fields in one go.

## Lines and counts

The **Lines** tab sorts (A-Z, Z-A or natural, where `file2` comes before `file10`), reverses the order, removes duplicate and empty lines, trims spaces and adds numbers. Options combine and the result updates right away. At the top you always see the count of characters, words, lines and UTF-8 bytes, handy for length limits in databases or forms.
```

- [ ] **Step 8: `src/tools/text/Text.svelte`**
```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { CASES, DEFAULT_LINE_OPTIONS, countText, processLines, type LineOptions } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('text', '', meta.rememberInput ?? true);

  let tab = $state<'case' | 'lines'>('case');
  let opts = $state<LineOptions>({ ...DEFAULT_LINE_OPTIONS });

  const stats = $derived(countText(input.value));
  const converted = $derived(
    input.value ? CASES.map((c) => ({ ...c, value: c.fn(input.value) })) : [],
  );
  const processed = $derived(input.value ? processLines(input.value, opts, locale) : '');
  const processedLines = $derived(processed ? processed.split('\n').length : 0);
  const PREVIEW = 300;
  const preview = (v: string) => (v.length > PREVIEW ? `${v.slice(0, PREVIEW)}…` : v);
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'case', label: meta.tabs![locale][0] },
      { value: 'lines', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    <Field id="text-input" label={s.input}>
      {#snippet children({ describedby })}
        <TextArea
          id="text-input"
          bind:value={input.value}
          placeholder={s.placeholder}
          {describedby}
          mono={false}
          spellcheck={true}
          rows={8}
        />
      {/snippet}
    </Field>

    <dl class="stats" aria-label={s.stats}>
      <div>
        <dt>{s.chars}</dt>
        <dd>{stats.chars.toLocaleString(locale)}</dd>
      </div>
      <div>
        <dt>{s.words}</dt>
        <dd>{stats.words.toLocaleString(locale)}</dd>
      </div>
      <div>
        <dt>{s.lines}</dt>
        <dd>{stats.lines.toLocaleString(locale)}</dd>
      </div>
      <div>
        <dt>{s.bytes}</dt>
        <dd>{stats.bytes.toLocaleString(locale)}</dd>
      </div>
    </dl>

    {#if tab === 'case'}
      <Display label={s.cases}>
        {#if converted.length}
          <div class="display-rows">
            {#each converted as c (c.id)}
              <div class="display-row">
                <span class="case">
                  <span class="name">{c.label}</span>
                  <span class="value">{preview(c.value)}</span>
                </span>
                <CopyButton value={c.value} {locale} compact label={c.label} />
              </div>
            {/each}
          </div>
          <p class="display-note">{s.perLine}</p>
        {:else}
          <p class="display-note">{s.emptyCases}</p>
        {/if}
      </Display>
    {:else}
      <div class="row">
        <Field id="text-sort" label={s.sort}>
          {#snippet children({ describedby })}
            <Select
              id="text-sort"
              bind:value={opts.sort}
              {describedby}
              options={[
                { value: 'none', label: s.sortNone },
                { value: 'az', label: s.sortAz },
                { value: 'za', label: s.sortZa },
                { value: 'natural', label: s.sortNatural },
              ]}
            />
          {/snippet}
        </Field>
        <Toggle bind:checked={opts.reverse} label={s.reverse} />
        <Toggle bind:checked={opts.dedupe} label={s.dedupe} />
        <Toggle bind:checked={opts.removeEmpty} label={s.removeEmpty} />
        <Toggle bind:checked={opts.trim} label={s.trim} />
        <Toggle bind:checked={opts.number} label={s.number} />
      </div>

      <Display live label={s.result}>
        {#snippet head()}
          <span
            >{processed ? fill(s.resultLines, { n: processedLines }) : t(locale, 'led.idle')}</span
          >
        {/snippet}
        {#if processed}
          <pre class="display-code">{processed}</pre>
        {:else}
          <p class="display-note">{s.emptyLines}</p>
        {/if}
      </Display>

      <div class="row">
        <CopyButton main value={processed} {locale} />
        <Button
          variant="ghost"
          icon="arrow-left-right"
          disabled={!processed}
          onclick={() => (input.value = processed)}
        >
          {t(locale, 'ui.useOutput')}
        </Button>
      </div>
    {/if}

    <div class="row">
      <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}
        >{t(locale, 'ui.clear')}</Button
      >
      <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
    </div>
  </div>
</div>

<style>
  .stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
    margin: 0;
    font-size: 14px;
  }
  .stats div {
    display: flex;
    gap: 8px;
  }
  .stats dt {
    color: var(--text-dim);
  }
  .stats dd {
    margin: 0;
    font-family: var(--font-mono);
    font-weight: 600;
  }
  .case {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .name {
    color: var(--disp-dim);
    font-size: 12px;
    letter-spacing: 0;
  }
  .value {
    white-space: pre-wrap;
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as text } from './text/meta';
```
→
```ts
import { meta as text } from './text/meta';
```
y
```ts
  // text,
```
→
```ts
  text,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Text from '../tools/text/Text.svelte';
```
→
```astro
import Text from '../tools/text/Text.svelte';
```
y
```astro
{/* {id === 'text' && <Text client:load locale={locale} />} */}
```
→
```astro
{id === 'text' && <Text client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build
ls dist/es/convertir-mayusculas-minusculas.html dist/en/text-case-converter.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `text` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

A mano con `pnpm preview`, en `/es/convertir-mayusculas-minusculas`:
1. `hola mundo` → diez filas, de `HOLA MUNDO` a `hola.mundo`, cada una con copiar. Recuento: 10 caracteres, 2 palabras, 1 línea, 10 bytes.
2. `XMLHttpRequest` → `xml_http_request`, `XML_HTTP_REQUEST`, `xmlHttpRequest`.
3. Pestaña Líneas (`2`) con `file10`, `file2`, `file1`, `file2` (una por línea) + «Natural» + «Quitar duplicadas» → `file1`, `file2`, `file10`; «Numerar» añade `1. `, `2. `…
4. «Usar el resultado como entrada» sustituye el texto. `c` copia el resultado.

- [ ] **Step 11: Commit**

```bash
git add src/tools/text src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más. Si `pnpm format` retocó archivos que no son de esta tarea, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(text): diez conversiones de mayúsculas a la vez y utilidades de líneas

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Lorem ipsum: párrafos, frases o palabras, en texto o HTML

**Files:**
- Create: `src/tools/lorem/logic.ts`, `src/tools/lorem/logic.test.ts`, `src/tools/lorem/meta.ts`, `src/tools/lorem/strings.ts`, `src/tools/lorem/content.es.md`, `src/tools/lorem/content.en.md`, `src/tools/lorem/Lorem.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `downloadBlob` (Task 0); `fill`; `t` (`ui.generate`, `ui.download`); kit: `Segmented`, `Field`, `NumberInput`, `Toggle`, `Display`, `CopyButton`, `Button`.
- Produces:
  - `type LoremUnit = 'paragraphs' | 'sentences' | 'words'`, `type Random = () => number`, `LoremOptions { startClassic?; rand? }`, `MAX_COUNT`, `DEFAULT_COUNT`, `CLASSIC_SENTENCE`, `WORDS`
  - `mulberry32(seed): Random`, `generateSentence(wordCount?, rand?)` y `generateParagraph(sentenceCount?, rand?)` (API antigua), `clampCount(unit, count)`, `generateLorem(type, count, opts?)` (API antigua ampliada), `toHtml(text)`
  - `meta: ToolMeta` (id `lorem`, slugs `generador-lorem-ipsum` / `lorem-ipsum-generator`), `strings: Record<Locale, …>`, componente `Lorem` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 13: `.text` (salida), pestañas «Párrafos», «Frases» y «Palabras», `#lorem-count`, radio «HTML (<p>)».

**§7 (vinculante):** `lorem` · gen · Párrafos · Frases · Palabras · «Opción "empezar con Lorem ipsum…" y salida como texto o `<p>` HTML».

Cómo se cubre cada punto:
- Pestañas de unidad con `Segmented main` (atajos `1…3`); al cambiar de unidad se pone su cantidad por defecto (3, 5 o 50).
- «Empezar con Lorem ipsum…»: `startClassic`. Tests `start with "Lorem ipsum…"`.
- Texto o `<p>` HTML: `toHtml`. Test `wraps each paragraph in <p>`.
- Botón primario «Generar», porque crea algo (§6). Copiar (principal) y descargar `.txt` o `.html`.
- No hay input que recordar: `meta` no define `rememberInput` y no hay interruptor.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-lorem -b plan-b/lorem   # desde el commit de la Task 0
cd ../devtools-lorem
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta tarea (Segmented, Field, NumberInput, Toggle, Display, CopyButton, Button) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente de la Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/lorem/logic.test.ts` (incluye los 3 tests de Lorem de `legacy/src/__tests__/tools.test.ts`):
```ts
import { describe, expect, it } from 'vitest';
import {
  CLASSIC_SENTENCE,
  MAX_COUNT,
  WORDS,
  clampCount,
  generateLorem,
  generateParagraph,
  generateSentence,
  mulberry32,
  toHtml,
} from './logic';

describe('legacy behaviour', () => {
  it('generates a sentence ending with a period', () => {
    const sentence = generateSentence();
    expect(sentence).toMatch(/\.$/);
    expect(sentence[0]).toMatch(/[A-Z]/);
  });

  it('generates specified type and count', () => {
    const words = generateLorem('words', 5);
    expect(words.split(' ')).toHaveLength(5);
  });

  it('generates multiple paragraphs', () => {
    const paragraphs = generateLorem('paragraphs', 3);
    expect(paragraphs.split('\n\n')).toHaveLength(3);
  });
});

describe('seeded generation', () => {
  it('gives the same text for the same seed', () => {
    const a = generateLorem('paragraphs', 2, { rand: mulberry32(42) });
    const b = generateLorem('paragraphs', 2, { rand: mulberry32(42) });
    const c = generateLorem('paragraphs', 2, { rand: mulberry32(43) });
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it('produces numbers in [0, 1)', () => {
    const r = mulberry32(1);
    for (let i = 0; i < 1000; i++) {
      const x = r();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  it('only uses words from the list', () => {
    const text = generateLorem('words', 200, { rand: mulberry32(7) });
    for (const w of text.toLowerCase().split(' ')) expect(WORDS).toContain(w);
  });

  it('builds sentences and paragraphs of the requested size', () => {
    const r = mulberry32(3);
    expect(generateSentence(6, r).replace(/[,.]/g, '').split(' ')).toHaveLength(6);
    expect(generateParagraph(4, r).match(/\./g)).toHaveLength(4);
  });
});

describe('start with "Lorem ipsum…"', () => {
  const rand = () => mulberry32(9);

  it('starts paragraphs and sentences with the classic sentence', () => {
    expect(
      generateLorem('paragraphs', 2, { startClassic: true, rand: rand() }).startsWith(
        CLASSIC_SENTENCE,
      ),
    ).toBe(true);
    const sentences = generateLorem('sentences', 3, { startClassic: true, rand: rand() });
    expect(sentences.startsWith(`${CLASSIC_SENTENCE} `)).toBe(true);
  });

  it('starts words with "Lorem ipsum dolor sit amet"', () => {
    expect(generateLorem('words', 5, { startClassic: true, rand: rand() })).toBe(
      'Lorem ipsum dolor sit amet',
    );
    expect(
      generateLorem('words', 10, { startClassic: true, rand: rand() }).split(' '),
    ).toHaveLength(10);
  });
});

describe('limits and HTML', () => {
  it('clamps the count', () => {
    expect(clampCount('paragraphs', 0)).toBe(1);
    expect(clampCount('paragraphs', 1e6)).toBe(MAX_COUNT.paragraphs);
    expect(clampCount('words', Number.NaN)).toBe(1);
    expect(generateLorem('paragraphs', 1e6).split('\n\n')).toHaveLength(MAX_COUNT.paragraphs);
  });

  it('wraps each paragraph in <p>', () => {
    expect(toHtml('Uno.\n\nDos.')).toBe('<p>Uno.</p>\n<p>Dos.</p>');
    expect(toHtml('Solo una frase.')).toBe('<p>Solo una frase.</p>');
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/lorem`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/lorem/logic.ts`**

El generador recibe la función aleatoria. La isla usa `mulberry32(seed)`: cambiar entre texto y HTML o tocar el interruptor no vuelve a sortear las palabras; solo «Generar» cambia la semilla. Los tests usan semillas fijas.

```ts
export type LoremUnit = 'paragraphs' | 'sentences' | 'words';
export type Random = () => number;

export interface LoremOptions {
  startClassic?: boolean;
  rand?: Random;
}

export const MAX_COUNT: Record<LoremUnit, number> = {
  paragraphs: 100,
  sentences: 500,
  words: 5000,
};
export const DEFAULT_COUNT: Record<LoremUnit, number> = { paragraphs: 3, sentences: 5, words: 50 };

export const CLASSIC_SENTENCE = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
const CLASSIC_WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
];

// prettier-ignore
export const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
  'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip',
  'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat',
  'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
  'est', 'laborum', 'perspiciatis', 'unde', 'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium',
  'doloremque', 'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'explicabo', 'nemo', 'ipsam',
  'voluptas', 'aspernatur', 'aut', 'odit', 'fugit',
];

/** Small seeded PRNG, so the same seed always gives the same text (switching text/HTML does not re-roll). */
export function mulberry32(seed: number): Random {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const int = (rand: Random, min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
const word = (rand: Random) => WORDS[Math.floor(rand() * WORDS.length)];
const capitalize = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

export function generateSentence(wordCount?: number, rand: Random = Math.random): string {
  const count = wordCount || int(rand, 5, 14);
  const words = Array.from({ length: count }, () => word(rand));
  // A comma in longer sentences reads more like real text.
  if (count > 8) words[int(rand, 2, count - 4)] += ',';
  words[0] = capitalize(words[0]);
  return words.join(' ') + '.';
}

export function generateParagraph(sentenceCount?: number, rand: Random = Math.random): string {
  const count = sentenceCount || int(rand, 3, 6);
  return Array.from({ length: count }, () => generateSentence(undefined, rand)).join(' ');
}

export function clampCount(unit: LoremUnit, count: number): number {
  return Math.min(MAX_COUNT[unit], Math.max(1, Math.floor(count) || 1));
}

export function generateLorem(type: LoremUnit, count: number, opts: LoremOptions = {}): string {
  const rand = opts.rand ?? Math.random;
  const n = clampCount(type, count);
  switch (type) {
    case 'words': {
      const words = Array.from({ length: n }, (_, i) =>
        opts.startClassic && i < CLASSIC_WORDS.length ? CLASSIC_WORDS[i] : word(rand),
      );
      if (opts.startClassic) words[0] = capitalize(words[0]);
      return words.join(' ');
    }
    case 'sentences': {
      const s = Array.from({ length: n }, () => generateSentence(undefined, rand));
      if (opts.startClassic) s[0] = CLASSIC_SENTENCE;
      return s.join(' ');
    }
    case 'paragraphs': {
      const p = Array.from({ length: n }, () => generateParagraph(undefined, rand));
      if (opts.startClassic) p[0] = `${CLASSIC_SENTENCE} ${p[0]}`;
      return p.join('\n\n');
    }
  }
}

/** Wraps each paragraph (separated by a blank line) in <p>. */
export function toHtml(text: string): string {
  return text
    .split('\n\n')
    .map((p) => `<p>${p}</p>`)
    .join('\n');
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/lorem`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/lorem/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'lorem',
  category: 'gen',
  icon: 'pilcrow',
  slug: { es: 'generador-lorem-ipsum', en: 'lorem-ipsum-generator' },
  name: { es: 'Lorem ipsum', en: 'Lorem ipsum' },
  title: {
    es: 'Generador de Lorem ipsum: párrafos, frases y palabras',
    en: 'Lorem ipsum generator: paragraphs, sentences and words',
  },
  description: {
    es: 'Genera texto de relleno Lorem ipsum por párrafos, frases o palabras, empezando o no por «Lorem ipsum dolor sit amet», como texto o en <p> HTML.',
    en: 'Generate Lorem ipsum placeholder text by paragraphs, sentences or words, starting with “Lorem ipsum dolor sit amet” or not, as plain text or HTML <p>.',
  },
  keywords: {
    es: [
      'lorem ipsum',
      'texto de relleno',
      'texto de ejemplo',
      'generador de texto',
      'placeholder',
      'dummy text',
    ],
    en: [
      'lorem ipsum',
      'placeholder text',
      'dummy text',
      'filler text',
      'text generator',
      'sample text',
    ],
  },
  tabs: { es: ['Párrafos', 'Frases', 'Palabras'], en: ['Paragraphs', 'Sentences', 'Words'] },
};
```

`src/tools/lorem/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    unit: 'Unidad',
    count: 'Cantidad',
    startClassic: 'Empezar con «Lorem ipsum dolor sit amet…»',
    format: 'Formato',
    plain: 'Texto',
    html: 'HTML (<p>)',
    result: 'Texto generado',
    summary: '{words} palabras · {chars} caracteres',
    fileTxt: 'lorem-ipsum.txt',
    fileHtml: 'lorem-ipsum.html',
  },
  en: {
    unit: 'Unit',
    count: 'Count',
    startClassic: 'Start with “Lorem ipsum dolor sit amet…”',
    format: 'Format',
    plain: 'Text',
    html: 'HTML (<p>)',
    result: 'Generated text',
    summary: '{words} words · {chars} characters',
    fileTxt: 'lorem-ipsum.txt',
    fileHtml: 'lorem-ipsum.html',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/lorem/content.es.md`:
```md
## Qué es Lorem ipsum

Lorem ipsum es el texto de relleno más usado en diseño e imprenta desde hace siglos. Procede de un texto de Cicerón (_De finibus bonorum et malorum_) con las palabras cortadas y mezcladas, así que parece latín pero no se lee. Eso es justo lo que se busca: que quien mira una maqueta se fije en la composición y no en el contenido.

## Cómo usarlo

Elige si quieres párrafos, frases o palabras y cuántos. Por defecto el texto empieza con la frase clásica «Lorem ipsum dolor sit amet, consectetur adipiscing elit», que muchos reconocen como relleno; desactívalo si quieres que empiece al azar. El botón **Generar** crea otro texto distinto; cambiar entre texto y HTML no lo cambia.

La salida **HTML** envuelve cada párrafo en `<p>`, lista para pegar en una plantilla o un CMS. También puedes descargarla como archivo `.txt` o `.html`.
```

`src/tools/lorem/content.en.md`:
```md
## What Lorem ipsum is

Lorem ipsum has been the most common placeholder text in design and printing for centuries. It comes from a text by Cicero (_De finibus bonorum et malorum_) with its words cut and shuffled, so it looks like Latin but cannot be read. That is the point: people looking at a mock-up notice the layout, not the content.

## How to use it

Choose paragraphs, sentences or words and how many. By default the text starts with the classic sentence “Lorem ipsum dolor sit amet, consectetur adipiscing elit”, which many people recognise as filler; turn it off for a random start. The **Generate** button creates a different text; switching between plain text and HTML does not.

The **HTML** output wraps each paragraph in `<p>`, ready to paste into a template or a CMS. You can also download it as a `.txt` or `.html` file.
```

- [ ] **Step 8: `src/tools/lorem/Lorem.svelte`**
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { downloadBlob } from '../../lib/download';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import type { Locale } from '../types';
  import {
    DEFAULT_COUNT,
    MAX_COUNT,
    generateLorem,
    mulberry32,
    toHtml,
    type LoremUnit,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  let unit = $state<LoremUnit>('paragraphs');
  let count = $state(DEFAULT_COUNT.paragraphs);
  let startClassic = $state(true);
  let format = $state<'plain' | 'html'>('plain');
  // Same seed → same text: changing the format or the count does not re-roll the words.
  let seed = $state(1);

  onMount(() => {
    seed = crypto.getRandomValues(new Uint32Array(1))[0];
  });

  const text = $derived(generateLorem(unit, count, { startClassic, rand: mulberry32(seed) }));
  const output = $derived(format === 'html' ? toHtml(text) : text);
  const words = $derived(text.split(/\s+/).filter(Boolean).length);

  function onUnit(u: LoremUnit) {
    count = DEFAULT_COUNT[u];
  }

  function regenerate() {
    seed = crypto.getRandomValues(new Uint32Array(1))[0];
  }

  function download() {
    if (format === 'html') downloadBlob(output, s.fileHtml, 'text/html;charset=utf-8');
    else downloadBlob(output, s.fileTxt);
  }
</script>

<div class="stack">
  <Segmented
    main
    label={s.unit}
    options={[
      { value: 'paragraphs', label: meta.tabs![locale][0] },
      { value: 'sentences', label: meta.tabs![locale][1] },
      { value: 'words', label: meta.tabs![locale][2] },
    ]}
    bind:value={unit}
    onchange={onUnit}
  />

  <div class="panel">
    <div class="row">
      <Field id="lorem-count" label={s.count}>
        {#snippet children({ describedby })}
          <NumberInput
            id="lorem-count"
            bind:value={count}
            min={1}
            max={MAX_COUNT[unit]}
            {describedby}
          />
        {/snippet}
      </Field>
      <Segmented
        label={s.format}
        options={[
          { value: 'plain', label: s.plain },
          { value: 'html', label: s.html },
        ]}
        bind:value={format}
      />
      <Button variant="primary" icon="refresh-cw" onclick={regenerate}
        >{t(locale, 'ui.generate')}</Button
      >
    </div>
    <Toggle bind:checked={startClassic} label={s.startClassic} />

    <Display label={s.result}>
      {#snippet head()}
        <span
          >{fill(s.summary, {
            words: words.toLocaleString(locale),
            chars: output.length.toLocaleString(locale),
          })}</span
        >
      {/snippet}
      <div class="text" class:code={format === 'html'}>{output}</div>
    </Display>

    <div class="row">
      <CopyButton main value={output} {locale} />
      <Button variant="ghost" onclick={download}>{t(locale, 'ui.download')}</Button>
    </div>
  </div>
</div>

<style>
  .text {
    max-height: 60vh;
    overflow: auto;
    white-space: pre-wrap;
    font: 400 15px/1.65 var(--font-body);
  }
  .text.code {
    font: 400 14px/1.55 var(--font-mono);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as lorem } from './lorem/meta';
```
→
```ts
import { meta as lorem } from './lorem/meta';
```
y
```ts
  // lorem,
```
→
```ts
  lorem,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Lorem from '../tools/lorem/Lorem.svelte';
```
→
```astro
import Lorem from '../tools/lorem/Lorem.svelte';
```
y
```astro
{/* {id === 'lorem' && <Lorem client:load locale={locale} />} */}
```
→
```astro
{id === 'lorem' && <Lorem client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build
ls dist/es/generador-lorem-ipsum.html dist/en/lorem-ipsum-generator.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `lorem` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

A mano con `pnpm preview`, en `/es/generador-lorem-ipsum`:
1. Al cargar: 3 párrafos que empiezan por «Lorem ipsum dolor sit amet, consectetur adipiscing elit.».
2. «HTML (<p>)» → cada párrafo en `<p>…</p>` con las mismas palabras; volver a Texto no cambia el texto.
3. «Generar» → texto nuevo. Pestaña Palabras (`3`) → cantidad 50; con el interruptor desactivado, no empieza por «Lorem».
4. Cantidad 999 en Párrafos → al salir del campo queda en 100. «Descargar» baja `lorem-ipsum.txt` o `lorem-ipsum.html`.

- [ ] **Step 11: Commit**

```bash
git add src/tools/lorem src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más. Si `pnpm format` retocó archivos que no son de esta tarea, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(lorem): párrafos, frases o palabras, inicio clásico opcional y salida HTML

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Timestamp: reloj en vivo, segundos o milisegundos, zonas horarias y fecha → timestamp

**Files:**
- Create: `src/tools/timestamp/logic.ts`, `src/tools/timestamp/logic.test.ts`, `src/tools/timestamp/meta.ts`, `src/tools/timestamp/strings.ts`, `src/tools/timestamp/content.es.md`, `src/tools/timestamp/content.en.md`, `src/tools/timestamp/Timestamp.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `formatRelative` (Task 0); `fill`; `t` (`ui.clear`, `led.idle`, `tool.remember`); kit: `Display`, `Field`, `Select`, `Segmented`, `Led`, `CopyButton`, `Button`, `Toggle`, `persistedInput`.
- Produces:
  - `type Unit = 's' | 'ms'`, `type UnitMode = 'auto' | Unit`, `MAX_MS = 8.64e15`
  - `detectUnit(value)`, `parseTimestamp(input, mode?): { ms; unit } | null`, `isValidTimeZone(tz)`, `tzOffsetMinutes(ms, tz)`, `formatOffset(minutes)`, `zonedToUtc(y, mo, d, h, mi, s, ms, tz)`, `parseDate(input, tz): number | null`, `wallClock(ms, tz)`, `listTimeZones(current): string[]`
  - `meta: ToolMeta` (id `timestamp`, slugs `conversor-timestamp-unix` / `unix-timestamp-converter`), `strings: Record<Locale, …>`, componente `Timestamp` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 13: `.display-value` (reloj; el primero son los segundos), `#timestamp-input`, `.display-rows` (formatos), `#timestamp-zone`, `#timestamp-date`.

**§7 (vinculante):** `timestamp` · conv · sin pestañas · «Reloj Unix en vivo (s y ms, cada uno con su copiar). Detección de s o ms. Salida a la vez en ISO 8601, local, UTC y relativo. Selector de zona horaria (`Intl`). Fecha → timestamp».

Cómo se cubre cada punto:
- Reloj en vivo: `$effect` con `setInterval` de 1 s y `clearInterval` en la limpieza. `now` empieza en `null` para que la hora del build no acabe en el HTML. Dos `CopyButton` compactos (segundos y milisegundos) que copian el valor del momento del clic.
- Detección s / ms: `detectUnit` (desde 1e11 son milisegundos), fijable con un `Segmented`. Tests `detectUnit and parseTimestamp`.
- A la vez: ISO 8601, UTC, hora en la zona (con su desfase), relativo, segundos y milisegundos, cada uno con copiar.
- Zona horaria con `Intl`: `Select` con `listTimeZones`; por defecto, la del navegador, leída en `onMount`. Tests `time zones`.
- Fecha → timestamp: `parseDate` en la zona elegida, con horario de verano (Review Focus 4). Tests `parseDate`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-timestamp -b plan-b/timestamp   # desde el commit de la Task 0
cd ../devtools-timestamp
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta tarea (Display, Field, Select, Segmented, Led, CopyButton, Button, Toggle) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente de la Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/timestamp/logic.test.ts` (la herramienta antigua no tenía tests de timestamp):
```ts
import { describe, expect, it } from 'vitest';
import {
  MAX_MS,
  detectUnit,
  formatOffset,
  isValidTimeZone,
  listTimeZones,
  parseDate,
  parseTimestamp,
  tzOffsetMinutes,
  wallClock,
  zonedToUtc,
} from './logic';

describe('detectUnit and parseTimestamp', () => {
  it('tells seconds from milliseconds', () => {
    expect(detectUnit(1_700_000_000)).toBe('s');
    expect(detectUnit(1_700_000_000_000)).toBe('ms');
    expect(detectUnit(0)).toBe('s');
    expect(detectUnit(-1_700_000_000_000)).toBe('ms');
  });

  it('parses seconds and milliseconds to the same instant', () => {
    expect(parseTimestamp('1700000000')).toEqual({ ms: 1_700_000_000_000, unit: 's' });
    expect(parseTimestamp(' 1700000000000 ')).toEqual({ ms: 1_700_000_000_000, unit: 'ms' });
    expect(parseTimestamp('1_700_000_000')).toEqual({ ms: 1_700_000_000_000, unit: 's' });
  });

  it('accepts decimals and negative values', () => {
    expect(parseTimestamp('1700000000.5')).toEqual({ ms: 1_700_000_000_500, unit: 's' });
    expect(parseTimestamp('-86400')).toEqual({ ms: -86_400_000, unit: 's' });
  });

  it('lets the user force the unit', () => {
    expect(parseTimestamp('1700000000', 'ms')).toEqual({ ms: 1_700_000_000, unit: 'ms' });
  });

  it('rejects text and out-of-range values', () => {
    expect(parseTimestamp('abc')).toBeNull();
    expect(parseTimestamp('')).toBeNull();
    expect(parseTimestamp('12e5')).toBeNull();
    expect(parseTimestamp(String(MAX_MS + 1), 'ms')).toBeNull();
  });
});

describe('time zones', () => {
  it('computes offsets, including daylight saving time', () => {
    expect(tzOffsetMinutes(Date.UTC(2024, 0, 15, 12), 'Europe/Madrid')).toBe(60);
    expect(tzOffsetMinutes(Date.UTC(2024, 6, 1, 12), 'Europe/Madrid')).toBe(120);
    expect(tzOffsetMinutes(Date.UTC(2024, 0, 15, 12), 'America/New_York')).toBe(-300);
    expect(tzOffsetMinutes(0, 'Asia/Kolkata')).toBe(330);
    expect(tzOffsetMinutes(0, 'UTC')).toBe(0);
  });

  it('formats offsets', () => {
    expect(formatOffset(120)).toBe('+02:00');
    expect(formatOffset(-300)).toBe('-05:00');
    expect(formatOffset(330)).toBe('+05:30');
    expect(formatOffset(0)).toBe('+00:00');
  });

  it('converts wall-clock times to UTC across the DST switch', () => {
    // Madrid, 31 March 2024: 02:00 CET jumps to 03:00 CEST.
    expect(zonedToUtc(2024, 3, 31, 1, 30, 0, 0, 'Europe/Madrid')).toBe(
      Date.UTC(2024, 2, 31, 0, 30),
    );
    expect(zonedToUtc(2024, 3, 31, 3, 30, 0, 0, 'Europe/Madrid')).toBe(
      Date.UTC(2024, 2, 31, 1, 30),
    );
    // 02:30 does not exist that night: it is moved forward to 03:30 CEST.
    expect(zonedToUtc(2024, 3, 31, 2, 30, 0, 0, 'Europe/Madrid')).toBe(
      Date.UTC(2024, 2, 31, 1, 30),
    );
    // 27 October 2024: 02:30 happens twice; the second one (CET) is used.
    expect(zonedToUtc(2024, 10, 27, 2, 30, 0, 0, 'Europe/Madrid')).toBe(
      Date.UTC(2024, 9, 27, 1, 30),
    );
  });

  it('validates zone names and always offers UTC and the current zone', () => {
    expect(isValidTimeZone('Europe/Madrid')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus')).toBe(false);
    const zones = listTimeZones('Europe/Kiev');
    expect(zones).toContain('UTC');
    expect(zones).toContain('Europe/Kiev');
    expect(zones).toContain('America/New_York');
  });
});

describe('parseDate', () => {
  it('reads dates without an offset in the chosen zone', () => {
    expect(parseDate('2024-07-01 12:00', 'Europe/Madrid')).toBe(Date.UTC(2024, 6, 1, 10));
    expect(parseDate('2024-07-01T12:00:30.5', 'UTC')).toBe(Date.UTC(2024, 6, 1, 12, 0, 30, 500));
    expect(parseDate('2024-01-15', 'America/New_York')).toBe(Date.UTC(2024, 0, 15, 5));
  });

  it('respects an explicit offset or Z', () => {
    expect(parseDate('2024-07-01T12:00:00Z', 'Europe/Madrid')).toBe(Date.UTC(2024, 6, 1, 12));
    expect(parseDate('2024-07-01T12:00:00+02:00', 'UTC')).toBe(Date.UTC(2024, 6, 1, 10));
  });

  it('rejects invalid dates', () => {
    expect(parseDate('', 'UTC')).toBeNull();
    expect(parseDate('mañana', 'UTC')).toBeNull();
    expect(parseDate('2024-13-01', 'UTC')).toBeNull();
  });

  it('handles years before 100', () => {
    expect(new Date(parseDate('0050-01-01', 'UTC')!).getUTCFullYear()).toBe(50);
  });
});

describe('wallClock', () => {
  it('prints the time in a zone', () => {
    expect(wallClock(Date.UTC(2024, 6, 1, 10, 5, 9), 'Europe/Madrid')).toBe('2024-07-01 12:05:09');
    expect(wallClock(0, 'UTC')).toBe('1970-01-01 00:00:00');
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/timestamp`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/timestamp/logic.ts`**

Las zonas horarias se manejan solo con `Intl.DateTimeFormat(…).formatToParts` y `timeZone`, sin librerías. `zonedToUtc` corrige el desfase dos veces para acertar en los cambios de hora. `listTimeZones` añade `UTC` y la zona actual cuando `Intl.supportedValuesOf` no las trae (pasa con alias como `Europe/Kiev`), para que el `Select` nunca quede en blanco. Los tests comparan instantes y desfases numéricos, nunca cadenas completas de `Intl`, que cambian entre versiones de ICU.

```ts
export type Unit = 's' | 'ms';
export type UnitMode = 'auto' | Unit;

/** Largest date JavaScript can represent: ±8.64e15 ms from the epoch. */
export const MAX_MS = 8.64e15;

/**
 * Seconds or milliseconds? Anything at or above 1e11 is read as milliseconds:
 * 1e11 seconds would be the year 5138, while 1e11 ms is March 1973.
 */
export function detectUnit(value: number): Unit {
  return Math.abs(value) >= 1e11 ? 'ms' : 's';
}

export function parseTimestamp(
  input: string,
  mode: UnitMode = 'auto',
): { ms: number; unit: Unit } | null {
  const s = input.trim().replace(/[_\s]/g, '');
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  const unit = mode === 'auto' ? detectUnit(n) : mode;
  const ms = Math.round(unit === 's' ? n * 1000 : n);
  return Math.abs(ms) > MAX_MS ? null : { ms, unit };
}

/** Like Date.UTC, but years 0-99 stay as they are (Date.UTC maps them to 1900-1999). */
function utc(y: number, mo: number, d: number, h: number, mi: number, s: number, ms = 0): number {
  const date = new Date(Date.UTC(2000, 0, 1, h, mi, s, ms));
  date.setUTCFullYear(y, mo - 1, d);
  return date.getTime();
}

const partsFormatter = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = partsFormatter.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    partsFormatter.set(timeZone, f);
  }
  return f;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    formatterFor(timeZone);
    return true;
  } catch {
    return false;
  }
}

/** Offset of `timeZone` from UTC at instant `ms`, in minutes (Madrid in summer → 120). */
export function tzOffsetMinutes(ms: number, timeZone: string): number {
  const parts = Object.fromEntries(
    formatterFor(timeZone)
      .formatToParts(new Date(ms))
      .map((p) => [p.type, p.value]),
  );
  const asUtc = utc(
    Number(parts.year),
    Number(parts.month),
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60_000);
}

export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

/** Converts a wall-clock time in `timeZone` to a UTC instant (ms). */
export function zonedToUtc(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  s: number,
  msPart: number,
  timeZone: string,
): number {
  const guess = utc(y, mo, d, h, mi, s, msPart);
  const first = guess - tzOffsetMinutes(guess, timeZone) * 60_000;
  const second = guess - tzOffsetMinutes(first, timeZone) * 60_000;
  return second;
}

const WALL_CLOCK = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/;

/**
 * Parses a date. "2024-01-15 12:00" (no offset) is read in `timeZone`;
 * anything with an offset or "Z", or another format Date understands, is taken as is.
 */
export function parseDate(input: string, timeZone: string): number | null {
  const s = input.trim();
  if (!s) return null;
  const m = WALL_CLOCK.exec(s);
  if (m) {
    const [y, mo, d, h = 0, mi = 0, sec = 0] = m
      .slice(1, 7)
      .map((v) => (v === undefined ? 0 : Number(v)));
    const msPart = m[7] ? Number(m[7].padEnd(3, '0')) : 0;
    if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || sec > 59) return null;
    return zonedToUtc(y, mo, d, h, mi, sec, msPart, timeZone);
  }
  const ms = Date.parse(s);
  return Number.isNaN(ms) ? null : ms;
}

/** "2026-09-26 14:05:09" in the given zone (for the date field and the "Local" row). */
export function wallClock(ms: number, timeZone: string): string {
  const p = Object.fromEntries(
    formatterFor(timeZone)
      .formatToParts(new Date(ms))
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
}

export function listTimeZones(current: string): string[] {
  let zones: string[] = [];
  try {
    zones = Intl.supportedValuesOf('timeZone');
  } catch {
    zones = [];
  }
  // The list can miss "UTC" and the browser's own zone when it is an alias (e.g. "Europe/Kiev").
  const set = new Set(zones);
  set.add('UTC');
  if (current) set.add(current);
  return [...set].sort();
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/timestamp`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/timestamp/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'timestamp',
  category: 'conv',
  icon: 'clock',
  slug: { es: 'conversor-timestamp-unix', en: 'unix-timestamp-converter' },
  name: { es: 'Timestamp Unix', en: 'Unix timestamp' },
  title: {
    es: 'Conversor de timestamp Unix a fecha (segundos y milisegundos)',
    en: 'Unix timestamp to date converter (seconds and milliseconds)',
  },
  description: {
    es: 'Reloj Unix en vivo y conversión de timestamps en segundos o milisegundos a ISO 8601, UTC, hora local y relativa en cualquier zona horaria, y al revés.',
    en: 'Live Unix clock and conversion of timestamps in seconds or milliseconds to ISO 8601, UTC, local and relative time in any time zone, and back.',
  },
  keywords: {
    es: [
      'timestamp',
      'unix time',
      'epoch',
      'convertir timestamp',
      'fecha a timestamp',
      'zona horaria',
      'milisegundos',
    ],
    en: [
      'timestamp',
      'unix time',
      'epoch converter',
      'timestamp to date',
      'date to timestamp',
      'time zone',
      'milliseconds',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Cómo sé si un timestamp está en segundos o en milisegundos?',
        a: 'Por el tamaño: hoy un timestamp en segundos tiene 10 cifras y en milisegundos 13. La herramienta lo detecta sola, y puedes fijar la unidad si hace falta.',
      },
    ],
    en: [
      {
        q: 'How do I know if a timestamp is in seconds or milliseconds?',
        a: 'By its size: today a timestamp in seconds has 10 digits and in milliseconds 13. The tool detects it on its own, and you can force the unit if needed.',
      },
    ],
  },
};
```

`src/tools/timestamp/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    now: 'Ahora',
    seconds: 'Segundos',
    millis: 'Milisegundos',
    copySeconds: 'Copiar segundos',
    copyMillis: 'Copiar milisegundos',
    zone: 'Zona horaria',
    toDate: 'Timestamp → fecha',
    timestamp: 'Timestamp',
    timestampPlaceholder: '1700000000 o 1700000000000',
    unit: 'Unidad',
    auto: 'Detectar',
    detected: 'Detectado: {unit}',
    unitS: 'segundos',
    unitMs: 'milisegundos',
    invalidTs: 'No es un timestamp válido',
    invalidTsHint:
      'Escribe solo cifras (con «-» para fechas anteriores a 1970), en segundos o milisegundos.',
    emptyTs: 'Escribe un timestamp y verás la fecha en todos los formatos.',
    iso: 'ISO 8601 (UTC)',
    utc: 'UTC',
    local: 'Hora en la zona',
    relative: 'Relativo',
    toTimestamp: 'Fecha → timestamp',
    date: 'Fecha',
    datePlaceholder: '2026-09-26 14:30 o 2026-09-26T12:30:00Z',
    dateHelp: 'Sin «Z» ni desfase (+02:00), la fecha se lee en la zona horaria elegida.',
    invalidDate: 'No se reconoce la fecha. Prueba con el formato AAAA-MM-DD HH:MM.',
    useNow: 'Usar ahora',
  },
  en: {
    now: 'Now',
    seconds: 'Seconds',
    millis: 'Milliseconds',
    copySeconds: 'Copy seconds',
    copyMillis: 'Copy milliseconds',
    zone: 'Time zone',
    toDate: 'Timestamp → date',
    timestamp: 'Timestamp',
    timestampPlaceholder: '1700000000 or 1700000000000',
    unit: 'Unit',
    auto: 'Detect',
    detected: 'Detected: {unit}',
    unitS: 'seconds',
    unitMs: 'milliseconds',
    invalidTs: 'Not a valid timestamp',
    invalidTsHint: 'Type digits only (with “-” for dates before 1970), in seconds or milliseconds.',
    emptyTs: 'Type a timestamp to see the date in every format.',
    iso: 'ISO 8601 (UTC)',
    utc: 'UTC',
    local: 'Time in zone',
    relative: 'Relative',
    toTimestamp: 'Date → timestamp',
    date: 'Date',
    datePlaceholder: '2026-09-26 14:30 or 2026-09-26T12:30:00Z',
    dateHelp: 'Without “Z” or an offset (+02:00), the date is read in the chosen time zone.',
    invalidDate: 'The date is not recognised. Try the YYYY-MM-DD HH:MM format.',
    useNow: 'Use now',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/timestamp/content.es.md`:
```md
## Qué es un timestamp Unix

Un timestamp Unix (o _epoch time_) es el número de segundos transcurridos desde el 1 de enero de 1970 a las 00:00 UTC. Es la forma habitual de guardar fechas en bases de datos, logs y APIs porque no depende de la zona horaria. JavaScript, Java y muchas APIs usan milisegundos en lugar de segundos, así que el mismo instante puede aparecer con 10 o con 13 cifras.

## Cómo funciona

Arriba tienes el reloj Unix en vivo, en segundos y en milisegundos, con un botón de copiar para cada uno. Al escribir un timestamp, la herramienta detecta si está en segundos o en milisegundos y muestra la fecha a la vez en ISO 8601, en UTC, en la zona horaria que elijas (con su desfase respecto a UTC) y en tiempo relativo («hace 3 días»).

Para el camino inverso, escribe una fecha como `2026-09-26 14:30`. Si no lleva zona (`Z` o `+02:00`), se interpreta en la zona horaria elegida, teniendo en cuenta el horario de verano. La zona por defecto es la de tu navegador.
```

`src/tools/timestamp/content.en.md`:
```md
## What a Unix timestamp is

A Unix timestamp (or _epoch time_) is the number of seconds since 1 January 1970 at 00:00 UTC. It is the usual way to store dates in databases, logs and APIs because it does not depend on the time zone. JavaScript, Java and many APIs use milliseconds instead of seconds, so the same instant can show up with 10 or with 13 digits.

## How it works

At the top you have the live Unix clock, in seconds and in milliseconds, each with its own copy button. When you type a timestamp, the tool detects whether it is in seconds or milliseconds and shows the date at once in ISO 8601, in UTC, in the time zone you choose (with its offset from UTC) and as relative time (“3 days ago”).

For the other direction, type a date such as `2026-09-26 14:30`. Without a zone (`Z` or `+02:00`) it is read in the chosen time zone, daylight saving time included. The default zone is your browser’s.
```

- [ ] **Step 8: `src/tools/timestamp/Timestamp.svelte`**
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatRelative } from '../../lib/relative';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    formatOffset,
    listTimeZones,
    parseDate,
    parseTimestamp,
    tzOffsetMinutes,
    wallClock,
    type UnitMode,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('timestamp', '', meta.rememberInput ?? true);

  // null until mounted: the build machine's clock and zone must never end up in the HTML.
  let now = $state<number | null>(null);
  let zone = $state('UTC');
  let zones = $state<string[]>(['UTC']);
  let unit = $state<UnitMode>('auto');
  let dateText = $state('');

  onMount(() => {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    zones = listTimeZones(zone);
  });

  $effect(() => {
    now = Date.now();
    const id = setInterval(() => (now = Date.now()), 1000);
    return () => clearInterval(id);
  });

  const nowSeconds = $derived(now === null ? '' : String(Math.floor(now / 1000)));
  const nowMillis = $derived(now === null ? '' : String(now));

  const parsed = $derived(input.value.trim() ? parseTimestamp(input.value, unit) : null);
  const invalid = $derived(!!input.value.trim() && !parsed);

  function zoned(ms: number): string {
    return `${wallClock(ms, zone)} (${formatOffset(tzOffsetMinutes(ms, zone))})`;
  }

  const formats = $derived.by(() => {
    if (!parsed) return [];
    const d = new Date(parsed.ms);
    return [
      { label: s.iso, value: d.toISOString() },
      { label: s.utc, value: d.toUTCString() },
      { label: `${s.local} · ${zone}`, value: zoned(parsed.ms) },
      { label: s.relative, value: now === null ? '' : formatRelative(parsed.ms, now, locale) },
      { label: s.seconds, value: String(Math.floor(parsed.ms / 1000)) },
      { label: s.millis, value: String(parsed.ms) },
    ];
  });

  const fromDate = $derived(dateText.trim() ? parseDate(dateText, zone) : null);

  function useNow() {
    if (now !== null) dateText = wallClock(now, zone);
  }
</script>

<div class="panel">
  <Display label={s.now}>
    {#snippet head()}
      <span>{s.now}</span>
      {#if now !== null}<span>{zoned(now)}</span>{/if}
    {/snippet}
    <div class="clock">
      <div class="tick">
        <span class="unit">{s.seconds}</span>
        <span class="display-value">{nowSeconds || '—'}</span>
        <CopyButton
          value={() => String(Math.floor(Date.now() / 1000))}
          {locale}
          compact
          label={s.copySeconds}
        />
      </div>
      <div class="tick">
        <span class="unit">{s.millis}</span>
        <span class="display-value small">{nowMillis || '—'}</span>
        <CopyButton value={() => String(Date.now())} {locale} compact label={s.copyMillis} />
      </div>
    </div>
  </Display>

  <Field id="timestamp-zone" label={s.zone}>
    {#snippet children({ describedby })}
      <Select
        id="timestamp-zone"
        bind:value={zone}
        {describedby}
        options={zones.map((z) => ({ value: z, label: z }))}
      />
    {/snippet}
  </Field>

  <h2 class="sub">{s.toDate}</h2>
  <div class="row">
    <Field id="timestamp-input" label={s.timestamp}>
      {#snippet children({ describedby })}
        <input
          id="timestamp-input"
          class="control mono"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          spellcheck="false"
          placeholder={s.timestampPlaceholder}
          aria-describedby={describedby}
          aria-invalid={invalid}
          bind:value={input.value}
        />
      {/snippet}
    </Field>
    <Segmented
      label={s.unit}
      options={[
        { value: 'auto', label: s.auto },
        { value: 's', label: s.seconds },
        { value: 'ms', label: s.millis },
      ]}
      bind:value={unit}
    />
  </div>

  <Display live label={s.toDate}>
    {#snippet head()}
      <Led
        state={parsed ? 'ok' : invalid ? 'bad' : 'idle'}
        label={parsed
          ? fill(s.detected, { unit: parsed.unit === 's' ? s.unitS : s.unitMs })
          : invalid
            ? s.invalidTs
            : t(locale, 'led.idle')}
      />
    {/snippet}
    {#if parsed}
      <div class="display-rows">
        {#each formats as f (f.label)}
          <div class="display-row">
            <span class="fmt"><span class="unit">{f.label}</span>{f.value}</span>
            <CopyButton value={f.value} {locale} compact />
          </div>
        {/each}
      </div>
    {:else}
      <p class="display-note">{invalid ? s.invalidTsHint : s.emptyTs}</p>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={parsed ? new Date(parsed.ms).toISOString() : nowSeconds} {locale} />
    <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}
      >{t(locale, 'ui.clear')}</Button
    >
    <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
  </div>

  <h2 class="sub">{s.toTimestamp}</h2>
  <div class="row">
    <Field id="timestamp-date" label={s.date} help={s.dateHelp}>
      {#snippet children({ describedby })}
        <input
          id="timestamp-date"
          class="control mono"
          type="text"
          autocomplete="off"
          spellcheck="false"
          placeholder={s.datePlaceholder}
          aria-describedby={describedby}
          aria-invalid={!!dateText.trim() && fromDate === null}
          bind:value={dateText}
        />
      {/snippet}
    </Field>
    <Button variant="secondary" onclick={useNow}>{s.useNow}</Button>
  </div>

  <Display live label={s.toTimestamp}>
    {#snippet head()}
      <Led
        state={fromDate !== null ? 'ok' : dateText.trim() ? 'bad' : 'idle'}
        label={fromDate !== null
          ? new Date(fromDate).toISOString()
          : dateText.trim()
            ? s.invalidDate
            : t(locale, 'led.idle')}
      />
    {/snippet}
    {#if fromDate !== null}
      <div class="display-rows">
        <div class="display-row">
          <span class="fmt"><span class="unit">{s.seconds}</span>{Math.floor(fromDate / 1000)}</span
          >
          <CopyButton value={String(Math.floor(fromDate / 1000))} {locale} compact />
        </div>
        <div class="display-row">
          <span class="fmt"><span class="unit">{s.millis}</span>{fromDate}</span>
          <CopyButton value={String(fromDate)} {locale} compact />
        </div>
      </div>
    {/if}
  </Display>
</div>

<style>
  .clock {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }
  .tick {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .small {
    font-size: clamp(18px, 2.6vw, 26px);
  }
  .unit {
    color: var(--disp-dim);
    font-size: 12px;
    letter-spacing: 0;
  }
  .fmt {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .sub {
    font-size: 15px;
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as timestamp } from './timestamp/meta';
```
→
```ts
import { meta as timestamp } from './timestamp/meta';
```
y
```ts
  // timestamp,
```
→
```ts
  timestamp,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Timestamp from '../tools/timestamp/Timestamp.svelte';
```
→
```astro
import Timestamp from '../tools/timestamp/Timestamp.svelte';
```
y
```astro
{/* {id === 'timestamp' && <Timestamp client:load locale={locale} />} */}
```
→
```astro
{id === 'timestamp' && <Timestamp client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build
ls dist/es/conversor-timestamp-unix.html dist/en/unix-timestamp-converter.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `timestamp` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

A mano con `pnpm preview`, en `/es/conversor-timestamp-unix`:
1. El reloj avanza cada segundo; «Copiar segundos» copia el valor del momento (10 cifras).
2. `1700000000` → «Detectado: segundos» e ISO `2023-11-14T22:13:20.000Z`; `1700000000000` → «milisegundos» y la misma fecha.
3. Zona `America/New_York` → la fila «Hora en la zona» muestra `-05:00`.
4. Fecha `2024-07-01 12:00` con zona `Europe/Madrid` → `2024-07-01T10:00:00.000Z` y `1719828000`. «Usar ahora» rellena la fecha actual.
5. Ir a otra herramienta y volver: ni errores en consola ni intervalos duplicados.

- [ ] **Step 11: Commit**

```bash
git add src/tools/timestamp src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más. Si `pnpm format` retocó archivos que no son de esta tarea, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(timestamp): reloj en vivo, detección de unidad, zonas horarias y fecha a timestamp

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Color: HEX, RGB, HSL y OKLCH sincronizados, con contraste WCAG

**Files:**
- Create: `src/tools/color/logic.ts`, `src/tools/color/logic.test.ts`, `src/tools/color/meta.ts`, `src/tools/color/strings.ts`, `src/tools/color/content.es.md`, `src/tools/color/content.en.md`, `src/tools/color/Color.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `fill`; `t` (`tool.remember`); kit: `Field`, `Display`, `Led`, `CopyButton`, `Toggle`, `persistedInput`.
- Produces:
  - `type Rgb = [number, number, number]`, `type Hsl`, `Oklch { l; c; h }`, `type Level = 'AAA' | 'AA' | 'fail'`
  - `hexToRgb` (ahora también `#rgb` y sin `#`), `rgbToHex`, `rgbToHsl`, `hslToRgb` (API antigua con sus tests), `srgbToLinear`, `rgbToOklch`, `oklchToRgb(l, c, h): { rgb; inGamut }`, `relativeLuminance`, `contrastRatio(a, b)`, `wcagLevels(ratio)`, `formatRgb`, `formatHsl`, `formatOklch`, `parseRgb`, `parseHsl`, `parseOklch`
  - `meta: ToolMeta` (id `color`, slugs `conversor-colores` / `color-converter`), `strings: Record<Locale, …>`, componente `Color` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 13: `#color-hex`, `#color-rgb`, `#color-hsl`, `#color-oklch`, `input[type=color]`, texto «Contraste N:1».

**§7 (vinculante):** `color` · conv · sin pestañas · «Selector visual nativo. HEX, RGB, HSL y OKLCH editables y sincronizados. Contraste WCAG contra blanco y negro con resultado AA/AAA».

Cómo se cubre cada punto:
- Selector nativo `<input type="color">` sincronizado con los cuatro campos.
- Los cuatro formatos editables y sincronizados, con la sintaxis moderna y la clásica. Tests `CSS strings`.
- OKLCH con valores conocidos y aviso cuando queda fuera de sRGB. Tests `OKLCH`.
- Contraste WCAG contra blanco y negro, AA/AAA para texto normal y grande, con LED y texto (el color nunca es la única señal). Tests `WCAG contrast`.
- Copiar por formato (`c` copia el HEX). Input recordado: el HEX.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-color -b plan-b/color   # desde el commit de la Task 0
cd ../devtools-color
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta tarea (Field, Display, Led, CopyButton, Toggle) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente de la Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/color/logic.test.ts` (incluye los 5 tests de color de `legacy/src/__tests__/tools.test.ts`):
```ts
import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  formatHsl,
  formatOklch,
  formatRgb,
  hexToRgb,
  hslToRgb,
  oklchToRgb,
  parseHsl,
  parseOklch,
  parseRgb,
  relativeLuminance,
  rgbToHex,
  rgbToHsl,
  rgbToOklch,
  wcagLevels,
} from './logic';

describe('HEX, RGB and HSL (legacy behaviour)', () => {
  it('converts HEX to RGB', () => {
    expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]);
    expect(hexToRgb('#00ff00')).toEqual([0, 255, 0]);
    expect(hexToRgb('#0000ff')).toEqual([0, 0, 255]);
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]);
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
  });

  it('returns null for invalid HEX', () => {
    expect(hexToRgb('invalid')).toBeNull();
    expect(hexToRgb('#gg0000')).toBeNull();
  });

  it('converts RGB to HEX', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
    expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
  });

  it('converts RGB to HSL', () => {
    expect(rgbToHsl(255, 0, 0)).toEqual([0, 100, 50]);
    expect(rgbToHsl(0, 0, 0)).toEqual([0, 0, 0]);
    expect(rgbToHsl(255, 255, 255)).toEqual([0, 0, 100]);
  });

  it('converts HSL to RGB', () => {
    expect(hslToRgb(0, 100, 50)).toEqual([255, 0, 0]);
    expect(hslToRgb(0, 0, 0)).toEqual([0, 0, 0]);
    expect(hslToRgb(0, 0, 100)).toEqual([255, 255, 255]);
  });

  it('accepts short HEX and missing #', () => {
    expect(hexToRgb('#f00')).toEqual([255, 0, 0]);
    expect(hexToRgb('58A6FF')).toEqual([88, 166, 255]);
  });
});

describe('OKLCH', () => {
  it('matches the CSS Color 4 reference for pure red', () => {
    const red = rgbToOklch(255, 0, 0);
    expect(red.l).toBeCloseTo(0.628, 3);
    expect(red.c).toBeCloseTo(0.2577, 4);
    expect(red.h).toBeCloseTo(29.23, 2);
    expect(formatOklch(red)).toBe('oklch(62.8% 0.258 29.2)');
  });

  it('gives white and black lightness 1 and 0 with no chroma', () => {
    const white = rgbToOklch(255, 255, 255);
    expect(white.l).toBeCloseTo(1, 4);
    expect(white).toMatchObject({ c: 0, h: 0 });
    expect(rgbToOklch(0, 0, 0)).toEqual({ l: 0, c: 0, h: 0 });
  });

  it('round-trips sRGB colours', () => {
    for (const rgb of [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [88, 166, 255],
      [128, 128, 128],
      [255, 84, 25],
    ] as [number, number, number][]) {
      const o = rgbToOklch(...rgb);
      expect(oklchToRgb(o.l, o.c, o.h)).toEqual({ rgb, inGamut: true });
    }
  });

  it('clips colours outside sRGB and says so', () => {
    const r = oklchToRgb(0.7, 0.4, 150);
    expect(r.inGamut).toBe(false);
    for (const v of r.rgb) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(255);
    }
  });
});

describe('WCAG contrast', () => {
  it('computes known ratios', () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5);
    expect(contrastRatio([0x76, 0x76, 0x76], [255, 255, 255])).toBeCloseTo(4.54, 2);
    expect(contrastRatio([0x77, 0x77, 0x77], [255, 255, 255])).toBeCloseTo(4.48, 2);
    expect(contrastRatio([255, 255, 255], [0x76, 0x76, 0x76])).toBeCloseTo(4.54, 2);
    expect(relativeLuminance([255, 255, 255])).toBe(1);
  });

  it('assigns AA and AAA for normal and large text', () => {
    expect(wcagLevels(21)).toEqual({ normal: 'AAA', large: 'AAA' });
    expect(wcagLevels(4.54)).toEqual({ normal: 'AA', large: 'AAA' });
    expect(wcagLevels(4.48)).toEqual({ normal: 'fail', large: 'AA' });
    expect(wcagLevels(2.53)).toEqual({ normal: 'fail', large: 'fail' });
  });
});

describe('CSS strings', () => {
  it('formats each notation', () => {
    expect(formatRgb([88, 166, 255])).toBe('rgb(88, 166, 255)');
    expect(formatHsl([213, 100, 67])).toBe('hsl(213, 100%, 67%)');
  });

  it('parses modern and legacy syntax', () => {
    expect(parseRgb('rgb(88, 166, 255)')).toEqual([88, 166, 255]);
    expect(parseRgb('rgb(88 166 255 / 50%)')).toEqual([88, 166, 255]);
    expect(parseRgb('88 166 255')).toEqual([88, 166, 255]);
    expect(parseRgb('rgb(100%, 0%, 0%)')).toEqual([255, 0, 0]);
    expect(parseHsl('hsl(213deg 100% 67%)')).toEqual([213, 100, 67]);
    expect(parseHsl('hsl(-30, 50%, 50%)')).toEqual([330, 50, 50]);
    expect(parseOklch('oklch(62.8% 0.2577 29.23)')).toEqual({ l: 0.628, c: 0.2577, h: 29.23 });
    expect(parseOklch('oklch(0.628 0.2577 29.23)')).toEqual({ l: 0.628, c: 0.2577, h: 29.23 });
  });

  it('rejects malformed or out-of-range values', () => {
    expect(parseRgb('rgb(300, 0, 0)')).toBeNull();
    expect(parseRgb('rgb(1, 2)')).toBeNull();
    expect(parseRgb('rojo')).toBeNull();
    expect(parseHsl('hsl(0, 120%, 50%)')).toBeNull();
    expect(parseOklch('oklch(150% 0.1 20)')).toBeNull();
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/color`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/color/logic.ts`**

OKLCH usa las matrices de Björn Ottosson (OKLab) sobre sRGB D65; el test fija el rojo puro contra la referencia de CSS Color 4 (`oklch(62.8% 0.2577 29.23)`). El contraste sigue WCAG 2.x; los valores esperados (`#767676` sobre blanco = 4,54) están calculados con Node.

```ts
export type Rgb = [number, number, number];
export type Hsl = [number, number, number];
export interface Oklch {
  l: number; // 0–1
  c: number; // 0–~0.4
  h: number; // 0–360
}
export type Level = 'AAA' | 'AA' | 'fail';

// ---- HEX, RGB and HSL (kept from the old tool) -------------------------------------------

/** "#58a6ff", "58a6ff" or "#5af". Returns null for anything else. */
export function hexToRgb(hex: string): Rgb | null {
  let clean = hex.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(clean)) clean = [...clean].map((c) => c + c).join('');
  const match = clean.match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!match) return null;
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

export function rgbToHsl(r: number, g: number, b: number): Hsl {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToRgb(h: number, s: number, l: number): Rgb {
  h /= 360;
  s /= 100;
  l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

// ---- OKLCH (Björn Ottosson's OKLab, sRGB D65) ----------------------------------------------

export function srgbToLinear(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(v: number): number {
  const c = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  return c * 255;
}

export function rgbToOklch(r: number, g: number, b: number): Oklch {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const c = Math.sqrt(A * A + B * B);
  // Greys have no meaningful hue.
  const h = c < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { l: L, c: c < 1e-4 ? 0 : c, h };
}

/** OKLCH → sRGB 0–255. Colours outside sRGB are clipped and reported with `inGamut: false`. */
export function oklchToRgb(l: number, c: number, h: number): { rgb: Rgb; inGamut: boolean } {
  const hr = (h * Math.PI) / 180;
  const A = c * Math.cos(hr);
  const B = c * Math.sin(hr);
  const l_ = l + 0.3963377774 * A + 0.2158037573 * B;
  const m_ = l - 0.1055613458 * A - 0.0638541728 * B;
  const s_ = l - 0.0894841775 * A - 1.291485548 * B;
  const L = l_ ** 3;
  const M = m_ ** 3;
  const S = s_ ** 3;
  const lin = [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
  const EPS = 1e-4;
  const inGamut = lin.every((v) => v >= -EPS && v <= 1 + EPS);
  const rgb = lin.map((v) =>
    Math.round(Math.max(0, Math.min(255, linearToSrgb(Math.max(0, Math.min(1, v)))))),
  ) as Rgb;
  return { rgb, inGamut };
}

// ---- WCAG 2.x contrast -----------------------------------------------------------------------

export function relativeLuminance([r, g, b]: Rgb): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Normal text needs 4.5 (AA) / 7 (AAA); large text (≥ 24px, or ≥ 18.66px bold) needs 3 / 4.5. */
export function wcagLevels(ratio: number): { normal: Level; large: Level } {
  return {
    normal: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'fail',
    large: ratio >= 4.5 ? 'AAA' : ratio >= 3 ? 'AA' : 'fail',
  };
}

// ---- CSS strings -----------------------------------------------------------------------------

const round = (v: number, d: number) => Number(v.toFixed(d));

export function formatRgb([r, g, b]: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`;
}

export function formatHsl([h, s, l]: Hsl): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function formatOklch({ l, c, h }: Oklch): string {
  return `oklch(${round(l * 100, 1)}% ${round(c, 3)} ${round(h, 1)})`;
}

/** Numbers inside "fn(…)" or bare, separated by commas, spaces or "/". Keeps "%" markers. */
function numbers(input: string, fn: string): { v: number; pct: boolean }[] | null {
  const s = input
    .trim()
    .replace(new RegExp(`^${fn}a?\\(`, 'i'), '')
    .replace(/\)$/, '');
  const parts = s.split(/[\s,/]+/).filter(Boolean);
  const out: { v: number; pct: boolean }[] = [];
  for (const p of parts) {
    const m = /^(-?\d*\.?\d+)(%|deg)?$/i.exec(p);
    if (!m) return null;
    out.push({ v: Number(m[1]), pct: m[2] === '%' });
  }
  return out;
}

export function parseRgb(input: string): Rgb | null {
  const n = numbers(input, 'rgb');
  if (!n || n.length < 3 || n.length > 4) return null;
  const rgb = n.slice(0, 3).map(({ v, pct }) => (pct ? (v / 100) * 255 : v));
  if (rgb.some((v) => v < 0 || v > 255)) return null;
  return rgb.map(Math.round) as Rgb;
}

export function parseHsl(input: string): Hsl | null {
  const n = numbers(input, 'hsl');
  if (!n || n.length < 3 || n.length > 4) return null;
  const [h, s, l] = n.map((x) => x.v);
  if (s < 0 || s > 100 || l < 0 || l > 100) return null;
  return [round(((h % 360) + 360) % 360, 6), s, l];
}

export function parseOklch(input: string): Oklch | null {
  const n = numbers(input, 'oklch');
  if (!n || n.length < 3 || n.length > 4) return null;
  const [L, C, H] = n;
  const l = round(L.pct || L.v > 1 ? L.v / 100 : L.v, 6);
  const c = C.pct ? (C.v / 100) * 0.4 : C.v;
  if (l < 0 || l > 1 || c < 0) return null;
  return { l, c, h: round(((H.v % 360) + 360) % 360, 6) };
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/color`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/color/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'color',
  category: 'conv',
  icon: 'palette',
  slug: { es: 'conversor-colores', en: 'color-converter' },
  name: { es: 'Colores', en: 'Colors' },
  title: {
    es: 'Conversor de colores HEX, RGB, HSL y OKLCH con contraste WCAG',
    en: 'HEX, RGB, HSL and OKLCH color converter with WCAG contrast',
  },
  description: {
    es: 'Convierte colores entre HEX, RGB, HSL y OKLCH con todos los campos editables y sincronizados, y comprueba su contraste WCAG con blanco y negro.',
    en: 'Convert colors between HEX, RGB, HSL and OKLCH with every field editable and in sync, and check their WCAG contrast against white and black.',
  },
  keywords: {
    es: [
      'conversor de colores',
      'hex a rgb',
      'rgb a hex',
      'hsl',
      'oklch',
      'contraste wcag',
      'selector de color',
    ],
    en: [
      'color converter',
      'hex to rgb',
      'rgb to hex',
      'hsl',
      'oklch',
      'wcag contrast',
      'color picker',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Qué ventaja tiene OKLCH?',
        a: 'Su luminosidad (L) corresponde a cómo percibimos el brillo: dos colores con la misma L se ven igual de claros aunque cambie el tono. Eso facilita crear paletas y variantes accesibles.',
      },
    ],
    en: [
      {
        q: 'Why use OKLCH?',
        a: 'Its lightness (L) matches how we perceive brightness: two colors with the same L look equally light even if the hue changes. That makes palettes and accessible variants easier.',
      },
    ],
  },
};
```

`src/tools/color/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    picker: 'Selector de color',
    preview: 'Muestra',
    hex: 'HEX',
    rgb: 'RGB',
    hsl: 'HSL',
    oklch: 'OKLCH',
    invalidHex: 'Escribe 3 o 6 cifras hexadecimales, como #58a6ff o #5af.',
    invalidRgb: 'Escribe tres valores de 0 a 255, como rgb(88, 166, 255).',
    invalidHsl:
      'Escribe tono (0–360), saturación y luminosidad (0–100 %), como hsl(213, 100%, 67%).',
    invalidOklch: 'Escribe L (0–100 %), C (0–0,4) y H (0–360), como oklch(70% 0.15 250).',
    outOfGamut: 'Ese color OKLCH queda fuera de sRGB: se ha ajustado al más cercano.',
    contrast: 'Contraste WCAG',
    onWhite: 'Sobre blanco',
    onBlack: 'Sobre negro',
    ratio: 'Contraste {r}:1',
    normal: 'Texto normal',
    large: 'Texto grande',
    fail: 'No pasa',
    sample: 'Texto de ejemplo',
  },
  en: {
    picker: 'Color picker',
    preview: 'Swatch',
    hex: 'HEX',
    rgb: 'RGB',
    hsl: 'HSL',
    oklch: 'OKLCH',
    invalidHex: 'Type 3 or 6 hex digits, like #58a6ff or #5af.',
    invalidRgb: 'Type three values from 0 to 255, like rgb(88, 166, 255).',
    invalidHsl: 'Type hue (0–360), saturation and lightness (0–100%), like hsl(213, 100%, 67%).',
    invalidOklch: 'Type L (0–100%), C (0–0.4) and H (0–360), like oklch(70% 0.15 250).',
    outOfGamut: 'That OKLCH color is outside sRGB: it was adjusted to the closest one.',
    contrast: 'WCAG contrast',
    onWhite: 'On white',
    onBlack: 'On black',
    ratio: 'Contrast {r}:1',
    normal: 'Normal text',
    large: 'Large text',
    fail: 'Fails',
    sample: 'Sample text',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/color/content.es.md`:
```md
## Cómo funciona

Elige un color con el selector o escribe su valor en cualquiera de los cuatro formatos: **HEX** (`#58a6ff`), **RGB**, **HSL** u **OKLCH**. Todos los campos están sincronizados: al cambiar uno, los demás se actualizan. Se aceptan la sintaxis moderna de CSS (`rgb(88 166 255)`) y la clásica con comas.

**OKLCH** describe el color por luminosidad percibida (L), croma (C) y tono (H). A diferencia de HSL, dos colores con la misma L se ven igual de claros, lo que facilita crear paletas coherentes y variantes accesibles. Algunos valores OKLCH quedan fuera de lo que puede mostrar una pantalla sRGB; en ese caso se ajustan al color más cercano y se avisa.

## Contraste WCAG

La herramienta calcula el contraste del color con blanco y con negro según WCAG 2.x. Para texto normal hace falta 4,5:1 (AA) o 7:1 (AAA); para texto grande (24 px, o 18,66 px en negrita), 3:1 y 4,5:1. Así sabes al momento si un color sirve para texto sobre fondo claro u oscuro.
```

`src/tools/color/content.en.md`:
```md
## How it works

Pick a color with the picker or type its value in any of the four formats: **HEX** (`#58a6ff`), **RGB**, **HSL** or **OKLCH**. All fields stay in sync: change one and the others update. Both modern CSS syntax (`rgb(88 166 255)`) and the classic comma syntax are accepted.

**OKLCH** describes a color by perceived lightness (L), chroma (C) and hue (H). Unlike HSL, two colors with the same L look equally light, which makes consistent palettes and accessible variants easier. Some OKLCH values fall outside what an sRGB screen can show; they are adjusted to the closest color and you are told.

## WCAG contrast

The tool computes the contrast of the color against white and black following WCAG 2.x. Normal text needs 4.5:1 (AA) or 7:1 (AAA); large text (24px, or 18.66px bold) needs 3:1 and 4.5:1. So you know right away whether a color works for text on a light or dark background.
```

- [ ] **Step 8: `src/tools/color/Color.svelte`**

El color canónico es un HEX en `persistedInput('color', '#58a6ff')`. Cada campo tiene su propio texto: al escribir en uno se actualizan los demás, pero no el que se está editando (así no salta el cursor); al salir del campo se normaliza. Las muestras de contraste usan el color del usuario y los fondos `white` y `black` en `style:`: son el dato que se mide, no colores del tema.

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    contrastRatio,
    formatHsl,
    formatOklch,
    formatRgb,
    hexToRgb,
    hslToRgb,
    oklchToRgb,
    parseHsl,
    parseOklch,
    parseRgb,
    rgbToHex,
    rgbToHsl,
    rgbToOklch,
    wcagLevels,
    type Level,
    type Rgb,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  type FieldId = 'hex' | 'rgb' | 'hsl' | 'oklch';
  const FIELDS: FieldId[] = ['hex', 'rgb', 'hsl', 'oklch'];

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  // The canonical colour is a HEX string, which is also what gets remembered.
  const color = persistedInput('color', '#58a6ff', meta.rememberInput ?? true);

  const DEFAULT: Rgb = [88, 166, 255];
  const rgb: Rgb = $derived(hexToRgb(color.value) ?? DEFAULT);
  const hex = $derived(rgbToHex(...rgb));

  function textsFor(c: Rgb): Record<FieldId, string> {
    return {
      hex: rgbToHex(...c),
      rgb: formatRgb(c),
      hsl: formatHsl(rgbToHsl(...c)),
      oklch: formatOklch(rgbToOklch(...c)),
    };
  }

  // Filled from the default colour so the server-rendered page already shows values.
  let texts = $state<Record<FieldId, string>>(textsFor(DEFAULT));
  let invalid = $state<Record<FieldId, boolean>>({
    hex: false,
    rgb: false,
    hsl: false,
    oklch: false,
  });
  let clipped = $state(false);

  const current = $derived(textsFor(rgb));
  const formatted = (field: FieldId) => current[field];

  /** Rewrites every field from the canonical colour, except the one being typed in. */
  function sync(except: FieldId | null) {
    for (const f of FIELDS) {
      if (f !== except) {
        texts[f] = formatted(f);
        invalid[f] = false;
      }
    }
  }

  // Runs after persistedInput's own onMount, so a remembered colour is already loaded.
  onMount(() => sync(null));

  function setRgb(next: Rgb, source: FieldId | null) {
    color.value = rgbToHex(...next);
    sync(source);
  }

  function onField(field: FieldId, value: string) {
    texts[field] = value;
    let next: Rgb | null = null;
    clipped = false;
    if (field === 'hex') next = hexToRgb(value);
    else if (field === 'rgb') next = parseRgb(value);
    else if (field === 'hsl') {
      const h = parseHsl(value);
      next = h ? hslToRgb(...h) : null;
    } else {
      const o = parseOklch(value);
      if (o) {
        const r = oklchToRgb(o.l, o.c, o.h);
        next = r.rgb;
        clipped = !r.inGamut;
      }
    }
    invalid[field] = next === null;
    if (next) setRgb(next, field);
  }

  const errors: Record<FieldId, 'invalidHex' | 'invalidRgb' | 'invalidHsl' | 'invalidOklch'> = {
    hex: 'invalidHex',
    rgb: 'invalidRgb',
    hsl: 'invalidHsl',
    oklch: 'invalidOklch',
  };

  const contrast = $derived([
    { id: 'white', label: s.onWhite, bg: 'white', ratio: contrastRatio(rgb, [255, 255, 255]) },
    { id: 'black', label: s.onBlack, bg: 'black', ratio: contrastRatio(rgb, [0, 0, 0]) },
  ]);
  const levelText = (l: Level) => (l === 'fail' ? s.fail : l);
</script>

<div class="panel">
  <div class="top">
    <label class="picker">
      <span class="visually-hidden">{s.picker}</span>
      <input
        type="color"
        value={hex}
        oninput={(e) => {
          clipped = false;
          const next = hexToRgb(e.currentTarget.value);
          if (next) setRgb(next, null);
        }}
      />
    </label>
    <div
      class="swatch"
      style:background-color={hex}
      role="img"
      aria-label="{s.preview}: {hex}"
    ></div>
  </div>

  <div class="fields">
    {#each FIELDS as f (f)}
      <Field id="color-{f}" label={s[f]} error={invalid[f] ? s[errors[f]] : undefined}>
        {#snippet children({ describedby })}
          <div class="with-copy">
            <input
              id="color-{f}"
              class="control mono"
              type="text"
              autocomplete="off"
              spellcheck="false"
              aria-describedby={describedby}
              aria-invalid={invalid[f]}
              value={texts[f]}
              oninput={(e) => onField(f, e.currentTarget.value)}
              onblur={() => {
                if (!invalid[f]) texts[f] = formatted(f);
              }}
            />
            <CopyButton value={formatted(f)} {locale} compact main={f === 'hex'} />
          </div>
        {/snippet}
      </Field>
    {/each}
  </div>
  {#if clipped}<p class="note" role="status">{s.outOfGamut}</p>{/if}

  <Display live label={s.contrast}>
    {#snippet head()}
      <span>{s.contrast}</span>
    {/snippet}
    <div class="contrast">
      {#each contrast as c (c.id)}
        {@const levels = wcagLevels(c.ratio)}
        <div class="pair">
          <div class="sample" style:background-color={c.bg} style:color={hex}>{s.sample}</div>
          <div class="verdict">
            <strong>{c.label}</strong>
            <span>{fill(s.ratio, { r: c.ratio.toFixed(2) })}</span>
            <Led
              state={levels.normal === 'fail' ? 'bad' : 'ok'}
              label="{s.normal}: {levelText(levels.normal)}"
            />
            <Led
              state={levels.large === 'fail' ? 'bad' : 'ok'}
              label="{s.large}: {levelText(levels.large)}"
            />
          </div>
        </div>
      {/each}
    </div>
  </Display>

  <Toggle bind:checked={color.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .top {
    display: flex;
    gap: 16px;
    align-items: stretch;
  }
  .picker input {
    width: 88px;
    height: 88px;
    padding: 0;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius);
    background: var(--raised);
    cursor: pointer;
  }
  .swatch {
    flex: 1;
    min-height: 88px;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius);
  }
  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr));
    gap: 16px;
  }
  .with-copy {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .note {
    font-size: 13.5px;
    color: var(--text-dim);
  }
  .contrast {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }
  .pair {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .sample {
    padding: 16px;
    border-radius: var(--radius);
    font: 600 20px/1.2 var(--font-body);
  }
  .verdict {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as color } from './color/meta';
```
→
```ts
import { meta as color } from './color/meta';
```
y
```ts
  // color,
```
→
```ts
  color,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Color from '../tools/color/Color.svelte';
```
→
```astro
import Color from '../tools/color/Color.svelte';
```
y
```astro
{/* {id === 'color' && <Color client:load locale={locale} />} */}
```
→
```astro
{id === 'color' && <Color client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build
ls dist/es/conversor-colores.html dist/en/color-converter.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `color` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

A mano con `pnpm preview`, en `/es/conversor-colores`:
1. Al cargar: `#58a6ff`, `rgb(88, 166, 255)`, `hsl(212, 100%, 67%)` y `oklch(71.5% 0.152 …)`; contraste sobre blanco 2,53 (no pasa) y sobre negro 8,31 (AAA).
2. Escribir `#ff0000` en HEX → `rgb(255, 0, 0)` y `oklch(62.8% 0.258 29.2)` mientras escribes, sin que se mueva el cursor del campo HEX.
3. `hsl(0, 120%, 50%)` → error bajo el campo con el formato esperado; los demás no cambian.
4. `oklch(70% 0.4 150)` → aviso de color fuera de sRGB.
5. El selector nativo lo cambia todo. Recarga: el color sigue.

- [ ] **Step 11: Commit**

```bash
git add src/tools/color src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más. Si `pnpm format` retocó archivos que no son de esta tarea, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(color): HEX, RGB, HSL y OKLCH sincronizados y contraste WCAG

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Bases numéricas: BigInt, base personalizada y agrupación

**Files:**
- Create: `src/tools/number-base/logic.ts`, `src/tools/number-base/logic.test.ts`, `src/tools/number-base/meta.ts`, `src/tools/number-base/strings.ts`, `src/tools/number-base/content.es.md`, `src/tools/number-base/content.en.md`, `src/tools/number-base/NumberBase.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `fill`; `t` (`led.idle`, `tool.remember`); kit: `Field`, `NumberInput`, `Toggle`, `Display`, `Led`, `CopyButton`, `persistedInput`.
- Produces:
  - `DIGITS`, `MIN_BASE = 2`, `MAX_BASE = 36`
  - `parseBigInt(value, base): bigint | null` (estricto; acepta `0b`, `0o`, `0x`, signo, `_` y espacios), `formatBigInt(n, base, uppercase?)`, `groupDigits(s, size, sep?)`, `groupSizeFor(base)`, `bitLength(n)`, `convertBase(value, fromBase)` (API antigua con sus tests)
  - `meta: ToolMeta` (id `number-base`, slugs `conversor-bases-numericas` / `number-base-converter`), `strings: Record<Locale, …>`, componente `NumberBase` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 13: `#number-base-bin`, `#number-base-oct`, `#number-base-dec`, `#number-base-hex`, `#number-base-custom`, `#number-base-radix`.

**§7 (vinculante):** `number-base` · conv · sin pestañas · «Binario, octal, decimal y hexadecimal editables y sincronizados, más una base personalizada 2–36. BigInt para números de cualquier tamaño. Agrupación opcional de dígitos».

Cómo se cubre cada punto:
- Cuatro campos editables y sincronizados, más la base personalizada (`NumberInput` de 2 a 36; 36 por defecto). Test `works in any base from 2 to 36`.
- BigInt de principio a fin, sin `parseInt`: Review Focus 5.
- Agrupación opcional: 4 dígitos en binario y hexadecimal, 3 en decimal y octal. Los campos agrupados se pueden seguir editando porque el parser ignora los espacios. Tests `grouping`.
- Errores que dicen qué dígitos valen en esa base. Copiar por campo, sin agrupar (`c` copia el hexadecimal). Input recordado: el valor en decimal.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-number-base -b plan-b/number-base   # desde el commit de la Task 0
cd ../devtools-number-base
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta tarea (Field, NumberInput, Toggle, Display, Led, CopyButton) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente de la Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/number-base/logic.test.ts` (incluye los 4 tests de bases de `legacy/src/__tests__/tools.test.ts`):
```ts
import { describe, expect, it } from 'vitest';
import {
  bitLength,
  convertBase,
  formatBigInt,
  groupDigits,
  groupSizeFor,
  parseBigInt,
} from './logic';

describe('convertBase (legacy behaviour)', () => {
  it('converts decimal to other bases', () => {
    const result = convertBase('255', 10);
    expect(result).not.toBeNull();
    expect(result!.Binary).toBe('11111111');
    expect(result!.Octal).toBe('377');
    expect(result!.Decimal).toBe('255');
    expect(result!.Hex).toBe('FF');
  });

  it('converts binary to other bases', () => {
    const result = convertBase('1010', 2);
    expect(result).not.toBeNull();
    expect(result!.Decimal).toBe('10');
  });

  it('converts hex to other bases', () => {
    const result = convertBase('FF', 16);
    expect(result).not.toBeNull();
    expect(result!.Decimal).toBe('255');
  });

  it('returns null for invalid input', () => {
    expect(convertBase('xyz', 10)).toBeNull();
  });
});

describe('parseBigInt', () => {
  it('keeps full precision far beyond Number.MAX_SAFE_INTEGER', () => {
    expect(parseBigInt('18446744073709551616', 10)).toBe(2n ** 64n);
    expect(formatBigInt(2n ** 64n, 16)).toBe('10000000000000000');
    expect(convertBase('9007199254740993', 10)!.Hex).toBe('20000000000001');
    const huge = '1' + '0'.repeat(100);
    expect(formatBigInt(parseBigInt(huge, 10)!, 10)).toBe(huge);
  });

  it('is strict: every digit must belong to the base (parseInt was not)', () => {
    expect(parseBigInt('12abc', 10)).toBeNull();
    expect(parseBigInt('102', 2)).toBeNull();
    expect(parseBigInt('8', 8)).toBeNull();
    expect(parseBigInt('', 10)).toBeNull();
    expect(parseBigInt('-', 10)).toBeNull();
  });

  it('accepts prefixes, grouping, case and sign', () => {
    expect(parseBigInt('0xFF', 16)).toBe(255n);
    expect(parseBigInt('0b1010', 2)).toBe(10n);
    expect(parseBigInt('0o17', 8)).toBe(15n);
    expect(parseBigInt('1111 0000', 2)).toBe(240n);
    expect(parseBigInt('1_000_000', 10)).toBe(1_000_000n);
    expect(parseBigInt('-ff', 16)).toBe(-255n);
  });

  it('works in any base from 2 to 36', () => {
    expect(parseBigInt('zz', 36)).toBe(1295n);
    expect(formatBigInt(1295n, 36)).toBe('zz');
    expect(formatBigInt(1295n, 36, true)).toBe('ZZ');
    expect(parseBigInt('10', 1)).toBeNull();
    expect(parseBigInt('10', 37)).toBeNull();
  });
});

describe('grouping', () => {
  it('groups from the right', () => {
    expect(groupDigits('11111111', 4)).toBe('1111 1111');
    expect(groupDigits('1234567', 3)).toBe('1 234 567');
    expect(groupDigits('-1234567', 3)).toBe('-1 234 567');
    expect(groupDigits('12', 4)).toBe('12');
  });

  it('picks a group size per base', () => {
    expect(groupSizeFor(2)).toBe(4);
    expect(groupSizeFor(16)).toBe(4);
    expect(groupSizeFor(10)).toBe(3);
    expect(groupSizeFor(8)).toBe(3);
  });

  it('round-trips grouped text', () => {
    const grouped = groupDigits(formatBigInt(2n ** 64n, 2), 4);
    expect(parseBigInt(grouped, 2)).toBe(2n ** 64n);
  });
});

describe('bitLength', () => {
  it('counts the bits of the absolute value', () => {
    expect(bitLength(0n)).toBe(1);
    expect(bitLength(255n)).toBe(8);
    expect(bitLength(256n)).toBe(9);
    expect(bitLength(-255n)).toBe(8);
    expect(bitLength(2n ** 64n)).toBe(65);
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/number-base`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/number-base/logic.ts`**
```ts
export const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';
export const MIN_BASE = 2;
export const MAX_BASE = 36;

const PREFIXES: Record<number, RegExp> = { 2: /^0b/i, 8: /^0o/i, 16: /^0x/i };

/**
 * Parses an integer of any size in `base` (2–36). Ignores spaces and "_" (digit grouping),
 * accepts a leading "-" and the prefixes 0b, 0o and 0x in their own base.
 * Returns null when a digit does not belong to the base.
 */
export function parseBigInt(value: string, base: number): bigint | null {
  if (!Number.isInteger(base) || base < MIN_BASE || base > MAX_BASE) return null;
  let s = value.trim().replace(/[\s_]/g, '').toLowerCase();
  let negative = false;
  if (s.startsWith('-')) {
    negative = true;
    s = s.slice(1);
  }
  if (PREFIXES[base]) s = s.replace(PREFIXES[base], '');
  if (!s) return null;
  const b = BigInt(base);
  let n = 0n;
  for (const ch of s) {
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= base) return null;
    n = n * b + BigInt(d);
  }
  return negative ? -n : n;
}

export function formatBigInt(n: bigint, base: number, uppercase = false): string {
  const s = n.toString(base);
  return uppercase ? s.toUpperCase() : s;
}

/** Groups digits from the right: 11111111 → "1111 1111". Keeps a leading "-". */
export function groupDigits(s: string, size: number, sep = ' '): string {
  if (size <= 0) return s;
  const negative = s.startsWith('-');
  const digits = negative ? s.slice(1) : s;
  const groups: string[] = [];
  for (let end = digits.length; end > 0; end -= size)
    groups.unshift(digits.slice(Math.max(0, end - size), end));
  return (negative ? '-' : '') + groups.join(sep);
}

/** Nibbles for binary and hex, thousands for decimal, triplets for octal. */
export function groupSizeFor(base: number): number {
  return base === 10 || base === 8 ? 3 : 4;
}

export function bitLength(n: bigint): number {
  const abs = n < 0n ? -n : n;
  return abs === 0n ? 1 : abs.toString(2).length;
}

/** Legacy API (kept with its tests): four common bases, hexadecimal in upper case. */
export function convertBase(
  value: string,
  fromBase: number,
): { Binary: string; Octal: string; Decimal: string; Hex: string } | null {
  const n = parseBigInt(value, fromBase);
  if (n === null) return null;
  return {
    Binary: formatBigInt(n, 2),
    Octal: formatBigInt(n, 8),
    Decimal: formatBigInt(n, 10),
    Hex: formatBigInt(n, 16, true),
  };
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/number-base`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/number-base/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'number-base',
  category: 'conv',
  icon: 'binary',
  slug: { es: 'conversor-bases-numericas', en: 'number-base-converter' },
  name: { es: 'Bases numéricas', en: 'Number bases' },
  title: {
    es: 'Conversor de binario, octal, decimal y hexadecimal online',
    en: 'Binary, octal, decimal and hexadecimal converter online',
  },
  description: {
    es: 'Convierte números entre binario, octal, decimal, hexadecimal y cualquier base de 2 a 36, sin límite de tamaño y con agrupación de dígitos opcional.',
    en: 'Convert numbers between binary, octal, decimal, hexadecimal and any base from 2 to 36, with no size limit and optional digit grouping.',
  },
  keywords: {
    es: [
      'binario a decimal',
      'decimal a hexadecimal',
      'hexadecimal',
      'octal',
      'bases numericas',
      'convertir base',
    ],
    en: [
      'binary to decimal',
      'decimal to hex',
      'hexadecimal',
      'octal',
      'number base converter',
      'radix',
    ],
  },
};
```

`src/tools/number-base/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    bin: 'Binario (base 2)',
    oct: 'Octal (base 8)',
    dec: 'Decimal (base 10)',
    hex: 'Hexadecimal (base 16)',
    custom: 'Base {b}',
    customBase: 'Base personalizada',
    grouping: 'Agrupar dígitos',
    invalid: 'Hay dígitos que no existen en base {b}. Usa solo {digits}.',
    bits: '{n} bits',
    empty: 'Escribe un número en cualquiera de los campos.',
    summary: 'Tamaño',
    digitsLetters: '0-9 y a-{last}',
  },
  en: {
    bin: 'Binary (base 2)',
    oct: 'Octal (base 8)',
    dec: 'Decimal (base 10)',
    hex: 'Hexadecimal (base 16)',
    custom: 'Base {b}',
    customBase: 'Custom base',
    grouping: 'Group digits',
    invalid: 'Some digits do not exist in base {b}. Use only {digits}.',
    bits: '{n} bits',
    empty: 'Type a number in any of the fields.',
    summary: 'Size',
    digitsLetters: '0-9 and a-{last}',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/number-base/content.es.md`:
```md
## Cómo funciona

Escribe un número en cualquiera de los campos (binario, octal, decimal, hexadecimal o una base personalizada de 2 a 36) y los demás se actualizan al momento. Se aceptan los prefijos habituales `0b`, `0o` y `0x`, el signo negativo y los separadores `_` o espacio, así que puedes pegar valores directamente desde el código.

Los cálculos usan `BigInt`, de modo que no hay límite de tamaño: un número de 64 bits como `18446744073709551616` o una clave de cientos de cifras se convierten sin perder precisión, algo que falla con los números normales de JavaScript por encima de 2^53.

## Agrupación y bases

«Agrupar dígitos» separa en grupos de 4 el binario y el hexadecimal (un nibble cada uno) y de 3 el decimal y el octal, para leer valores largos sin equivocarte. La base personalizada sirve, por ejemplo, para base 36, que usan algunos acortadores de URL e identificadores. Si escribes una cifra que no existe en la base, el campo te dice qué cifras valen.
```

`src/tools/number-base/content.en.md`:
```md
## How it works

Type a number in any field (binary, octal, decimal, hexadecimal or a custom base from 2 to 36) and the others update right away. The usual `0b`, `0o` and `0x` prefixes, a minus sign and `_` or space separators are accepted, so you can paste values straight from code.

Calculations use `BigInt`, so there is no size limit: a 64-bit number such as `18446744073709551616` or a key hundreds of digits long converts without losing precision, which fails with plain JavaScript numbers above 2^53.

## Grouping and bases

“Group digits” splits binary and hexadecimal into groups of 4 (one nibble each) and decimal and octal into groups of 3, so long values are easy to read. The custom base is handy for base 36, for example, which some URL shorteners and identifiers use. If you type a digit that does not exist in the base, the field tells you which digits are valid.
```

- [ ] **Step 8: `src/tools/number-base/NumberBase.svelte`**

El valor canónico es el decimal en `persistedInput('number-base', '255')`. El `$effect` que vuelve a pintar los campos solo depende de `grouping` y `customBase`; `sync` va dentro de `untrack` para que escribir en un campo no lo reescriba mientras tecleas.

```svelte
<script lang="ts">
  import { untrack } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    DIGITS,
    MAX_BASE,
    MIN_BASE,
    bitLength,
    formatBigInt,
    groupDigits,
    groupSizeFor,
    parseBigInt,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  type FieldId = 'bin' | 'oct' | 'dec' | 'hex' | 'custom';
  const FIELDS: FieldId[] = ['bin', 'oct', 'dec', 'hex', 'custom'];

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  // The canonical value is the decimal string, which is also what gets remembered.
  const input = persistedInput('number-base', '255', meta.rememberInput ?? true);

  let customBase = $state(36);
  let grouping = $state(false);

  const baseOf = (f: FieldId) => ({ bin: 2, oct: 8, dec: 10, hex: 16, custom: customBase })[f];
  const value = $derived(input.value.trim() ? parseBigInt(input.value, 10) : null);

  function render(n: bigint | null, f: FieldId): string {
    if (n === null) return '';
    const base = baseOf(f);
    const digits = formatBigInt(n, base, true);
    return grouping ? groupDigits(digits, groupSizeFor(base)) : digits;
  }

  let texts = $state<Record<FieldId, string>>({
    bin: '11111111',
    oct: '377',
    dec: '255',
    hex: 'FF',
    custom: '73',
  });
  let invalid = $state<Record<FieldId, boolean>>({
    bin: false,
    oct: false,
    dec: false,
    hex: false,
    custom: false,
  });

  function sync(except: FieldId | null) {
    for (const f of FIELDS) {
      if (f !== except) {
        texts[f] = render(value, f);
        invalid[f] = false;
      }
    }
  }

  // Re-render every field on mount (after the remembered value loads) and when grouping or the
  // custom base change. `untrack` keeps typing in a field from re-running this and moving the cursor.
  $effect(() => {
    void grouping;
    void customBase;
    untrack(() => sync(null));
  });

  function onField(f: FieldId, raw: string) {
    texts[f] = raw;
    if (!raw.trim()) {
      invalid[f] = false;
      input.value = '';
      sync(f);
      return;
    }
    const n = parseBigInt(raw, baseOf(f));
    invalid[f] = n === null;
    if (n === null) return;
    input.value = n.toString(10);
    sync(f);
  }

  const labelOf = (f: FieldId) => (f === 'custom' ? fill(s.custom, { b: customBase }) : s[f]);
  const digitsOf = (f: FieldId) => {
    const base = baseOf(f);
    return base <= 10 ? `0-${base - 1}` : fill(s.digitsLetters, { last: DIGITS[base - 1] });
  };
</script>

<div class="panel">
  <div class="fields">
    {#each FIELDS as f (f)}
      <Field
        id="number-base-{f}"
        label={labelOf(f)}
        error={invalid[f] ? fill(s.invalid, { b: baseOf(f), digits: digitsOf(f) }) : undefined}
      >
        {#snippet children({ describedby })}
          <div class="with-copy">
            <input
              id="number-base-{f}"
              class="control mono"
              type="text"
              autocomplete="off"
              spellcheck="false"
              aria-describedby={describedby}
              aria-invalid={invalid[f]}
              value={texts[f]}
              oninput={(e) => onField(f, e.currentTarget.value)}
            />
            <CopyButton
              value={value === null ? '' : formatBigInt(value, baseOf(f), true)}
              {locale}
              compact
              main={f === 'hex'}
            />
          </div>
        {/snippet}
      </Field>
    {/each}
  </div>

  <div class="row">
    <Field id="number-base-radix" label={s.customBase}>
      {#snippet children({ describedby })}
        <NumberInput
          id="number-base-radix"
          bind:value={customBase}
          min={MIN_BASE}
          max={MAX_BASE}
          {describedby}
        />
      {/snippet}
    </Field>
    <Toggle bind:checked={grouping} label={s.grouping} />
    <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
  </div>

  <Display live label={s.summary}>
    {#snippet head()}
      <Led
        state={value === null ? 'idle' : 'ok'}
        label={value === null ? t(locale, 'led.idle') : fill(s.bits, { n: bitLength(value) })}
      />
    {/snippet}
    {#if value === null}
      <p class="display-note">{s.empty}</p>
    {:else}
      <div class="display-value">{render(value, 'dec')}</div>
    {/if}
  </Display>
</div>

<style>
  .fields {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .with-copy {
    display: flex;
    gap: 8px;
    align-items: center;
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as numberBase } from './number-base/meta';
```
→
```ts
import { meta as numberBase } from './number-base/meta';
```
y
```ts
  // numberBase,
```
→
```ts
  numberBase,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import NumberBase from '../tools/number-base/NumberBase.svelte';
```
→
```astro
import NumberBase from '../tools/number-base/NumberBase.svelte';
```
y
```astro
{/* {id === 'number-base' && <NumberBase client:load locale={locale} />} */}
```
→
```astro
{id === 'number-base' && <NumberBase client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build
ls dist/es/conversor-bases-numericas.html dist/en/number-base-converter.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `number-base` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

A mano con `pnpm preview`, en `/es/conversor-bases-numericas`:
1. Al cargar: 255 → `11111111`, `377`, `255`, `FF` y `73` (base 36).
2. Decimal `18446744073709551616` → hexadecimal `10000000000000000` y «65 bits».
3. Binario `102` → «Hay dígitos que no existen en base 2. Usa solo 0-1.»; los demás campos no cambian.
4. «Agrupar dígitos» → `1111 1111`, `255`, `FF`; editar un campo agrupado sigue funcionando.
5. Base personalizada 2 → el quinto campo muestra lo mismo que binario. `0xff` en hexadecimal → 255.

- [ ] **Step 11: Commit**

```bash
git add src/tools/number-base src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más. Si `pnpm format` retocó archivos que no son de esta tarea, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(number-base): BigInt, base personalizada 2-36 y agrupación de dígitos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Cierre: registro compacto, adiós a `legacy/`, e2e de las 12 herramientas y verificación completa

**Files:**
- Create: `e2e/tools.spec.ts`, `e2e/fixtures/hola.txt`
- Modify: `src/tools/registry.ts`, `src/components/ToolIsland.astro`, `tsconfig.json`, `eslint.config.js`, `e2e/smoke.spec.ts`, `README.md`
- Delete: `legacy/` entera. **No** se borran `src/lib/legacy.ts` ni `src/lib/legacy.test.ts`: se llaman igual, pero son las redirecciones de los enlaces antiguos `/#id` y siguen en uso.

**Interfaces:**
- Consumes: las 12 herramientas fusionadas y el DOM que declara cada tarea en su bloque «Interfaces».
- Produces: nada nuevo para otras tareas. El sitio queda con 14 herramientas y sin código antiguo.

- [ ] **Step 1: Comprobar que las 12 ramas están fusionadas**

```bash
git log --oneline -20
grep -c "^// import" src/tools/registry.ts src/components/ToolIsland.astro
grep -c "^{/\*" src/components/ToolIsland.astro
pnpm install --frozen-lockfile && pnpm test
```
Expected: los 12 commits `feat(<id>): …` en el log, los tres `grep -c` dan `0` (no queda ninguna línea comentada) y los tests en verde. Si alguna herramienta falta, termina antes su tarea: esta no la sustituye.

- [ ] **Step 2: Compactar `registry.ts` y `ToolIsland.astro`**

Las líneas en blanco y los comentarios solo servían para fusionar en paralelo. Sustituye `src/tools/registry.ts` por:
```ts
import { categories } from './categories';
import { meta as json } from './json/meta';
import { meta as uuid } from './uuid/meta';
import { meta as base64 } from './base64/meta';
import { meta as url } from './url/meta';
import { meta as htmlEntities } from './html-entities/meta';
import { meta as jwt } from './jwt/meta';
import { meta as hash } from './hash/meta';
import { meta as diff } from './diff/meta';
import { meta as regex } from './regex/meta';
import { meta as text } from './text/meta';
import { meta as lorem } from './lorem/meta';
import { meta as timestamp } from './timestamp/meta';
import { meta as color } from './color/meta';
import { meta as numberBase } from './number-base/meta';
import type { Category, CategoryId, Locale, ToolMeta } from './types';

export const tools: ToolMeta[] = [
  json,
  uuid,
  base64,
  url,
  htmlEntities,
  jwt,
  hash,
  diff,
  regex,
  text,
  lorem,
  timestamp,
  color,
  numberBase,
];

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

Y `src/components/ToolIsland.astro` por:
```astro
---
import Json from '../tools/json/Json.svelte';
import Uuid from '../tools/uuid/Uuid.svelte';
import Base64 from '../tools/base64/Base64.svelte';
import Url from '../tools/url/Url.svelte';
import HtmlEntities from '../tools/html-entities/HtmlEntities.svelte';
import Jwt from '../tools/jwt/Jwt.svelte';
import Hash from '../tools/hash/Hash.svelte';
import Diff from '../tools/diff/Diff.svelte';
import Regex from '../tools/regex/Regex.svelte';
import Text from '../tools/text/Text.svelte';
import Lorem from '../tools/lorem/Lorem.svelte';
import Timestamp from '../tools/timestamp/Timestamp.svelte';
import Color from '../tools/color/Color.svelte';
import NumberBase from '../tools/number-base/NumberBase.svelte';
import type { Locale } from '../tools/types';

interface Props {
  id: string;
  locale: Locale;
}
const { id, locale } = Astro.props;
---

{id === 'json' && <Json client:load locale={locale} />}
{id === 'uuid' && <Uuid client:load locale={locale} />}
{id === 'base64' && <Base64 client:load locale={locale} />}
{id === 'url' && <Url client:load locale={locale} />}
{id === 'html-entities' && <HtmlEntities client:load locale={locale} />}
{id === 'jwt' && <Jwt client:load locale={locale} />}
{id === 'hash' && <Hash client:load locale={locale} />}
{id === 'diff' && <Diff client:load locale={locale} />}
{id === 'regex' && <Regex client:load locale={locale} />}
{id === 'text' && <Text client:load locale={locale} />}
{id === 'lorem' && <Lorem client:load locale={locale} />}
{id === 'timestamp' && <Timestamp client:load locale={locale} />}
{id === 'color' && <Color client:load locale={locale} />}
{id === 'number-base' && <NumberBase client:load locale={locale} />}
```

Run: `pnpm test && pnpm check`
Expected: verde. `registry.test.ts` valida las 14 metas, sus slugs únicos y sus 28 archivos de contenido.

- [ ] **Step 3: Borrar `legacy/`**

```bash
git rm -r -q legacy
```

En `tsconfig.json`:
```json
  "exclude": ["dist", "legacy"]
```
→
```json
  "exclude": ["dist"]
```

En `eslint.config.js`:
```js
  { ignores: ['dist/**', '.astro/**', 'legacy/**', 'playwright-report/**', 'test-results/**'] },
```
→
```js
  { ignores: ['dist/**', '.astro/**', 'playwright-report/**', 'test-results/**'] },
```

Comprueba que no queda ninguna referencia:
```bash
grep -rn "legacy/" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist \
  --exclude-dir=docs --exclude-dir=.superpowers . || echo "sin referencias"
```
Expected: `sin referencias`. (`src/lib/legacy.ts` no aparece porque se importa como `'../lib/legacy'`, sin barra final.)

- [ ] **Step 4: Enlaces antiguos en `e2e/smoke.spec.ts`**

El test del Plan A usaba `/#number-base` como ejemplo de herramienta sin migrar. Ya está migrada. Sustituye:
```ts
  test('old links to tools not migrated yet land on the home page', async ({ page }) => {
    await skipBoot(page);
    await page.goto('/#number-base');
    await expect(page).toHaveURL(/\/es$/);
  });
```
por:
```ts
  test('old links to migrated tools land on the new page', async ({ page }) => {
    await skipBoot(page);
    await page.goto('/#number-base');
    await expect(page).toHaveURL(/\/es\/conversor-bases-numericas$/);
  });

  test('old links to unknown tools land on the home page', async ({ page }) => {
    await skipBoot(page);
    await page.goto('/#no-existe');
    await expect(page).toHaveURL(/\/es$/);
  });
```

- [ ] **Step 5: e2e de las 12 herramientas**

Crea el fichero de prueba que usan Base64 y Hash (exactamente 4 bytes, sin salto de línea):
```bash
mkdir -p e2e/fixtures
printf 'Hola' > e2e/fixtures/hola.txt
```

`e2e/tools.spec.ts` (abre cada página en español y hace una interacción real por herramienta; las interacciones se probaron en Chromium contra los mismos componentes):
```ts
import { expect, test as base, type Page } from '@playwright/test';

// Like smoke.spec.ts: never hit the real analytics and skip the boot screen.
// `errors` is automatic, so every test fails on an uncaught page error.
const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await use(errors);
      expect(errors).toEqual([]);
    },
    { auto: true },
  ],
  page: async ({ page }, use) => {
    await page.route('**/analytics.alvarotc.com/**', (r) => r.abort());
    await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
    await use(page);
  },
});

const PAGES: [string, string][] = [
  ['/es/codificar-decodificar-base64', 'Base64'],
  ['/es/codificar-decodificar-url', 'URL'],
  ['/es/codificar-entidades-html', 'Entidades HTML'],
  ['/es/decodificador-jwt', 'JWT'],
  ['/es/generador-hash-md5-sha256', 'Hash (MD5, SHA)'],
  ['/es/comparar-textos', 'Comparar textos'],
  ['/es/probador-regex', 'Regex'],
  ['/es/convertir-mayusculas-minusculas', 'Mayúsculas y líneas'],
  ['/es/generador-lorem-ipsum', 'Lorem ipsum'],
  ['/es/conversor-timestamp-unix', 'Timestamp Unix'],
  ['/es/conversor-colores', 'Colores'],
  ['/es/conversor-bases-numericas', 'Bases numéricas'],
];

test.describe('every migrated tool page loads', () => {
  for (const [path, name] of PAGES) {
    test(path, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveText(name);
      await expect(page.locator('.panel').first()).toBeVisible();
    });
  }
});

const radio = (page: Page, name: string) => page.getByRole('radio', { name, exact: true });

test.describe('one real interaction per tool', () => {
  test('base64 encodes while typing and detects Base64 to decode', async ({ page }) => {
    await page.goto('/es/codificar-decodificar-base64');
    await page.locator('#base64-input').fill('Hola');
    await expect(page.locator('.display-code')).toHaveText('SG9sYQ==');
    await page.locator('#base64-input').fill('SG9sYQ==');
    await expect(page.locator('.display-code')).toHaveText('Hola');
  });

  test('base64 turns a file into a data URI and Base64 back into a file', async ({ page }) => {
    await page.goto('/es/codificar-decodificar-base64');
    await radio(page, 'Archivo').click();
    // e2e/fixtures/hola.txt contains exactly "Hola" (4 bytes, no line break).
    await page.locator('input[type="file"]').setInputFiles('e2e/fixtures/hola.txt');
    await expect(page.locator('.display-code')).toHaveText('data:text/plain;base64,SG9sYQ==');
    await page.locator('#base64-payload').fill('data:text/plain;base64,SG9sYQ==');
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar archivo' }).click();
    expect((await download).suggestedFilename()).toBe('archivo.txt');
  });

  test('url encodes and breaks a URL into parts', async ({ page }) => {
    await page.goto('/es/codificar-decodificar-url');
    await page.locator('#url-input').fill('a b&c');
    await expect(page.locator('.display-code')).toHaveText('a%20b%26c');
    await page.locator('#url-input').fill('https://ejemplo.com:8080/ruta?q=caf%C3%A9#fin');
    await radio(page, 'Analizar URL').click();
    await expect(page.locator('.display-kv')).toContainText('8080');
    await expect(page.locator('.display-row').first()).toContainText('café');
  });

  test('html entities encodes and decodes', async ({ page }) => {
    await page.goto('/es/codificar-entidades-html');
    await page.locator('#html-entities-input').fill('<p>');
    await expect(page.locator('.display-code')).toHaveText('&lt;p&gt;');
    await page.locator('#html-entities-input').fill('&lt;p&gt; &aacute;');
    await expect(page.locator('.display-code')).toHaveText('<p> á');
  });

  test('jwt decodes the payload and never stores the token', async ({ page }) => {
    await page.goto('/es/decodificador-jwt');
    await page
      .locator('#jwt-input')
      .fill(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      );
    await expect(page.locator('.display-code').nth(1)).toContainText('"name": "John Doe"');
    await expect(page.getByText('Sin fecha de caducidad')).toBeVisible();
    await page.waitForTimeout(500);
    const stored = await page.evaluate(() =>
      Object.keys(localStorage).filter((k) => k.includes('jwt')),
    );
    expect(stored).toEqual([]);
  });

  test('hash computes SHA-256 and compares against an expected hash', async ({ page }) => {
    await page.goto('/es/generador-hash-md5-sha256');
    await page.locator('#hash-input').fill('abc');
    await expect(page.locator('.display-rows')).toContainText(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    await page.locator('#hash-compare').fill('900150983CD24FB0D6963F7D28E17F72');
    await expect(page.getByText('Coincide con MD5')).toBeVisible();
  });

  test('hash reads a file', async ({ page }) => {
    await page.goto('/es/generador-hash-md5-sha256');
    await radio(page, 'Archivo').click();
    await page.locator('input[type="file"]').setInputFiles('e2e/fixtures/hola.txt');
    await expect(page.locator('.display-rows')).toContainText('f688ae26e9cfa3ba6235477831d5122e');
  });

  test('diff counts changes and marks the changed words', async ({ page }) => {
    await page.goto('/es/comparar-textos');
    await page.locator('#diff-original').fill('uno\ndos\ntres');
    await page.locator('#diff-modified').fill('uno\nDOS\ntres\ncuatro');
    await expect(page.getByText('+2 añadidas · −1 quitadas')).toBeVisible();
    await expect(page.locator('.panel .diff mark')).toHaveCount(2);
    await radio(page, 'En paralelo').click();
    await expect(page.locator('.panel .diff .pair')).toHaveCount(4);
  });

  test('regex highlights matches, lists named groups and explains errors', async ({ page }) => {
    await page.goto('/es/probador-regex');
    await page.locator('#regex-pattern').fill('(?<n>\\d+)');
    await page.locator('#regex-text').fill('a1 b22 c333');
    await expect(page.getByText('3 coincidencias')).toBeVisible();
    await expect(page.locator('.display-code mark')).toHaveCount(3);
    await expect(page.locator('.panel table')).toContainText('$<n>');
    await page.locator('#regex-pattern').fill('(');
    await expect(page.getByText('Hay un «(» sin cerrar')).toBeVisible();
  });

  test('regex splits a pasted literal and replaces with $&', async ({ page }) => {
    await page.goto('/es/probador-regex');
    await page.locator('#regex-pattern').fill('/a/gi');
    await expect(page.locator('#regex-pattern')).toHaveValue('a');
    await page.locator('#regex-text').fill('A a');
    await expect(page.getByText('2 coincidencias')).toBeVisible();
    await radio(page, 'Reemplazar').click();
    await page.locator('#regex-replacement').fill('[$&]');
    await expect(page.locator('.display-code')).toHaveText('[A] [a]');
  });

  test('text shows every case and processes lines', async ({ page }) => {
    await page.goto('/es/convertir-mayusculas-minusculas');
    await page.locator('#text-input').fill('hola mundo');
    await expect(page.locator('.display-rows')).toContainText('holaMundo');
    await expect(page.locator('.display-rows')).toContainText('HOLA_MUNDO');
    await page.locator('#text-input').fill('b\na\nb');
    await radio(page, 'Líneas').click();
    await page.locator('#text-sort').selectOption('az');
    await page.getByText('Quitar duplicadas').click();
    await expect(page.locator('.display-code')).toHaveText('a\nb');
  });

  test('lorem starts with the classic sentence and switches to HTML', async ({ page }) => {
    await page.goto('/es/generador-lorem-ipsum');
    await expect(page.locator('.panel .text')).toContainText('Lorem ipsum dolor sit amet');
    await radio(page, 'HTML (<p>)').click();
    await expect(page.locator('.panel .text')).toContainText('<p>Lorem ipsum dolor sit amet');
    await radio(page, 'Palabras').click();
    await expect(page.locator('#lorem-count')).toHaveValue('50');
  });

  test('timestamp runs the live clock and converts both ways', async ({ page }) => {
    await page.goto('/es/conversor-timestamp-unix');
    await expect(page.locator('.display-value').first()).toHaveText(/^\d{10}$/);
    await page.locator('#timestamp-input').fill('0');
    await expect(page.locator('.display-rows').first()).toContainText('1970-01-01T00:00:00.000Z');
    await page.locator('#timestamp-zone').selectOption('Europe/Madrid');
    await page.locator('#timestamp-date').fill('2024-07-01 12:00');
    await expect(page.getByText('2024-07-01T10:00:00.000Z')).toBeVisible();
  });

  test('color keeps every field in sync and shows the contrast', async ({ page }) => {
    await page.goto('/es/conversor-colores');
    await page.locator('#color-hex').fill('#ff0000');
    await expect(page.locator('#color-rgb')).toHaveValue('rgb(255, 0, 0)');
    await expect(page.locator('#color-oklch')).toHaveValue('oklch(62.8% 0.258 29.2)');
    await page.locator('#color-rgb').fill('rgb(0, 0, 0)');
    await expect(page.locator('#color-hex')).toHaveValue('#000000');
    await expect(page.getByText('Contraste 21.00:1')).toBeVisible();
  });

  test('number-base converts numbers beyond 2^53', async ({ page }) => {
    await page.goto('/es/conversor-bases-numericas');
    await page.locator('#number-base-dec').fill('18446744073709551616');
    await expect(page.locator('#number-base-hex')).toHaveValue('10000000000000000');
    await page.locator('#number-base-bin').fill('102');
    await expect(page.getByText('no existen en base 2')).toBeVisible();
  });
});
```

Run:
```bash
pnpm build && pnpm test:e2e
```
Expected: todos en verde, los del Plan A incluidos. Si falla un selector, compáralo con el bloque «DOM» de la tarea de esa herramienta; si falla el comportamiento, arregla el componente, no el test.

- [ ] **Step 6: Lista de herramientas en el README**

En `README.md`, entre el párrafo «Sitio estático bilingüe…» y `## Desarrollo`, añade:

```md
## Herramientas

Todas tienen versión en español (`/es/…`) y en inglés (`/en/…`).

| Categoría | Herramienta | Página |
|---|---|---|
| Generadores | UUID v4 y v7, ULID y NanoID | [/es/generador-uuid](https://devtools.alvarotc.com/es/generador-uuid) |
| Generadores | Lorem ipsum | [/es/generador-lorem-ipsum](https://devtools.alvarotc.com/es/generador-lorem-ipsum) |
| Codificación | Base64 (texto y archivos) | [/es/codificar-decodificar-base64](https://devtools.alvarotc.com/es/codificar-decodificar-base64) |
| Codificación | URL (codificar y analizar) | [/es/codificar-decodificar-url](https://devtools.alvarotc.com/es/codificar-decodificar-url) |
| Codificación | Entidades HTML | [/es/codificar-entidades-html](https://devtools.alvarotc.com/es/codificar-entidades-html) |
| Codificación | JWT | [/es/decodificador-jwt](https://devtools.alvarotc.com/es/decodificador-jwt) |
| Codificación | Hash (MD5, SHA-1, SHA-256, SHA-384, SHA-512) | [/es/generador-hash-md5-sha256](https://devtools.alvarotc.com/es/generador-hash-md5-sha256) |
| Texto y datos | JSON | [/es/formateador-json](https://devtools.alvarotc.com/es/formateador-json) |
| Texto y datos | Comparar textos | [/es/comparar-textos](https://devtools.alvarotc.com/es/comparar-textos) |
| Texto y datos | Regex | [/es/probador-regex](https://devtools.alvarotc.com/es/probador-regex) |
| Texto y datos | Mayúsculas y líneas | [/es/convertir-mayusculas-minusculas](https://devtools.alvarotc.com/es/convertir-mayusculas-minusculas) |
| Conversores | Timestamp Unix | [/es/conversor-timestamp-unix](https://devtools.alvarotc.com/es/conversor-timestamp-unix) |
| Conversores | Colores (HEX, RGB, HSL, OKLCH) | [/es/conversor-colores](https://devtools.alvarotc.com/es/conversor-colores) |
| Conversores | Bases numéricas | [/es/conversor-bases-numericas](https://devtools.alvarotc.com/es/conversor-bases-numericas) |
```

Si el README no tiene ese párrafo (lo escribe la Task 18 del Plan A), pon la sección justo antes de `## Desarrollo`.

- [ ] **Step 7: Verificación completa**

```bash
pnpm install --frozen-lockfile
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm test:e2e
ls dist/es/*.html | wc -l
ls dist/en/*.html | wc -l
```
Expected: todo en verde y `14` páginas de herramienta por idioma.

Las páginas nuevas responden `200` sin redirección:
```bash
pnpm preview &
sleep 3
for u in /es/codificar-decodificar-base64 /en/base64-encode-decode /es/comparar-textos /en/text-diff-checker \
         /es/conversor-colores /en/color-converter /es/conversor-bases-numericas /en/number-base-converter; do
  printf '%s ' "$u"; curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:4321$u"
done
pnpm exec astro preview stop
```
Expected: todas `200`.

Lighthouse, como en la Task 18 del Plan A, en `/es/comparar-textos` y `/es/conversor-colores`: las 4 categorías ≥ 95.

A mano, en los 3 temas y a 390 px y 1280 px de ancho, abre las 12 herramientas nuevas: sin scroll horizontal, resultados en la pantalla hundida, `c` copia el resultado principal y `1…9` cambian de pestaña donde las hay. En la sidebar aparecen las categorías Generadores, Codificación, Texto y datos y Conversores con sus contadores (2, 5, 4 y 3).

- [ ] **Step 8: Commits**

```bash
git add src/tools/registry.ts src/components/ToolIsland.astro tsconfig.json eslint.config.js
git commit -m "chore: retirar legacy/ y compactar el registro de herramientas

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"

git add e2e
git commit -m "test: e2e de las 12 herramientas migradas y de los enlaces antiguos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"

git add README.md
git commit -m "docs: lista de herramientas en el README

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
(`git rm` ya dejó el borrado de `legacy/` preparado; entra en el primer commit.)

---

## Después de este plan

La rama `feat/plataforma-astro` tiene las 14 herramientas en la plataforma nueva y ya no depende de `legacy/`. El siguiente paso es revisarla entera y mergearla a `main` (superpowers:finishing-a-development-branch); eso lo decide el autor y no forma parte de este plan. Las herramientas nuevas son el subproyecto 2, con su propio spec.

## Revisión contra la §7 del spec

Cada fila de la tabla de la §7, punto por punto, con la tarea que lo cumple y lo que lo comprueba. Las filas de `uuid` y `json` son del Plan A.

| id | Punto de la §7 | Dónde | Comprobación |
|---|---|---|---|
| todas | Cálculo en vivo, resultado en `Display`, copiar por resultado, input recordado, lógica antigua conservada y ampliada | Tasks 1–12 | Tests antiguos migrados en cada `logic.test.ts`; `persistedInput` salvo en JWT, Hash (`rememberInput: false`) y Lorem (sin input) |
| `lorem` | Pestañas Párrafos · Frases · Palabras | Task 9 | `Segmented main` con `meta.tabs`; e2e cambia a Palabras |
| `lorem` | Opción «empezar con Lorem ipsum…» | Task 9 | Tests `start with "Lorem ipsum…"`; e2e |
| `lorem` | Salida como texto o `<p>` HTML | Task 9 | Test `wraps each paragraph in <p>`; e2e |
| `base64` | Pestañas Texto · Archivo | Task 1 | e2e cambia a Archivo |
| `base64` | Detección automática de la dirección, con opción de fijarla | Task 1 | Tests `detectDirection` y `lets the user force a direction`; Review Focus 1 |
| `base64` | Variante URL-safe | Task 1 | Tests `URL-safe variant` |
| `base64` | Archivo → data URI | Task 1 | Test `builds a data URI`; e2e con `e2e/fixtures/hola.txt` |
| `base64` | Base64 → descarga de archivo | Task 1 | Tests `reads a data URI…`, `recognises common file signatures`; e2e comprueba la descarga `archivo.txt` |
| `url` | Pestañas Codificar · Analizar URL | Task 2 | e2e cambia a Analizar URL |
| `url` | Detección de dirección | Task 2 | Tests `detectDirection` y `convert` |
| `url` | Modos `encodeURIComponent` y `encodeURI` | Task 2 | Tests `encodeUrl / decodeUrl` |
| `url` | Protocolo, host, puerto, ruta, hash y query params decodificados | Task 2 | Tests `parseUrl`; e2e (puerto 8080 y `café`) |
| `html-entities` | Detección de dirección | Task 3 | Tests `detectDirection` |
| `html-entities` | Modo mínimo o todo lo no-ASCII | Task 3 | Tests de los dos modos |
| `html-entities` | Decodificador puro (restricción del Plan B) | Task 3 | Tests `decodeHtmlEntities (pure, no DOM)`, tabla Latin-1 completa |
| `jwt` | Cabecera y payload en `Display code` | Task 4 | e2e lee el payload en `.display-code` |
| `jwt` | `exp`, `iat` y `nbf` como fecha local + relativa | Task 4 | Tests `time claims`; `formatRelative` (Task 0) |
| `jwt` | LED vigente / caducado / aún no válido | Task 4 | Test `classifies the token…` |
| `jwt` | Aviso fijo de firma no verificada | Task 4 | Siempre en el panel (`role="note"`) |
| `jwt` | `rememberInput: false` | Task 4 | `meta` + `$state` sin `persistedInput`; e2e comprueba `localStorage` |
| `hash` | Pestañas Texto · Archivo | Task 5 | e2e calcula el MD5 de `e2e/fixtures/hola.txt` |
| `hash` | MD5 propio con tests contra vectores conocidos | Task 5 | Batería completa del RFC 1321 y casos de relleno |
| `hash` | SHA-1, SHA-256, SHA-384 y SHA-512 con WebCrypto | Task 5 | Vectores FIPS 180 «abc»; e2e SHA-256 |
| `hash` | «Comparar con» y LED de coincidencia | Task 5 | Tests `compare`; e2e «Coincide con MD5» |
| `hash` | `rememberInput: false` | Task 5 | `meta` + `$state` sin `persistedInput` |
| `diff` | Vista unificada o en paralelo | Task 6 | e2e cuenta las filas `.pair` |
| `diff` | Diferencias por palabra | Task 6 | Tests `diffWords`; e2e cuenta `mark` |
| `diff` | Ignorar espacios y mayúsculas | Task 6 | Test `can ignore case and whitespace changes` |
| `diff` | Contador de añadidas y quitadas | Task 6 | e2e «+2 añadidas · −1 quitadas» |
| `diff` | Debounce en textos grandes (§6) | Task 6 | `shouldDebounce` + Review Focus 3 |
| `regex` | Pestañas Buscar · Reemplazar | Task 7 | e2e reemplaza con `[$&]` |
| `regex` | Coincidencias resaltadas | Task 7 | Test `highlight`; e2e cuenta `mark` |
| `regex` | Tabla de grupos, con nombre | Task 7 | Tests de grupos y `captureNames`; e2e ve `$<n>` |
| `regex` | Flags como toggles | Task 7 | Un `Toggle` por flag; tests del flag `y` y `parseLiteral` |
| `regex` | Chuleta plegable | Task 7 | `<details>` con `cheatsheet` en los dos idiomas |
| `regex` | Errores de sintaxis explicados | Task 7 | Tests `errors` (V8, Firefox y Safari); e2e ve la pista |
| `text` | Pestañas Mayúsculas · Líneas | Task 8 | e2e cambia a Líneas |
| `text` | Las 10 conversiones a la vez, cada una con copiar | Task 8 | Test `offers the ten conversions at once`; e2e |
| `text` | Ordenar A-Z, Z-A, natural; invertir; quitar duplicados y vacías; recortar; numerar | Task 8 | Tests `processLines`; e2e ordena y quita duplicadas |
| `text` | Conteo de caracteres, palabras, líneas y bytes siempre visible | Task 8 | Tests `countText`; recuento fuera de las pestañas |
| `timestamp` | Reloj Unix en vivo, s y ms con su copiar | Task 10 | `$effect` + `setInterval` con limpieza; e2e comprueba los 10 dígitos |
| `timestamp` | Detección de s o ms | Task 10 | Tests `detectUnit and parseTimestamp` |
| `timestamp` | ISO 8601, local, UTC y relativo a la vez | Task 10 | e2e lee el ISO; `formatRelative` testeado en la Task 0 |
| `timestamp` | Selector de zona horaria con `Intl` | Task 10 | Tests `time zones`; e2e elige `Europe/Madrid` |
| `timestamp` | Fecha → timestamp | Task 10 | Tests `parseDate`, DST en Review Focus 4; e2e |
| `color` | Selector visual nativo | Task 11 | `<input type="color">` sincronizado |
| `color` | HEX, RGB, HSL y OKLCH editables y sincronizados | Task 11 | Tests `CSS strings` y `OKLCH`; e2e |
| `color` | Contraste WCAG contra blanco y negro, AA/AAA | Task 11 | Tests `WCAG contrast`; e2e «Contraste 21.00:1» |
| `number-base` | Binario, octal, decimal y hexadecimal editables y sincronizados | Task 12 | e2e decimal → hexadecimal |
| `number-base` | Base personalizada 2–36 | Task 12 | Test `works in any base from 2 to 36` |
| `number-base` | BigInt | Task 12 | Review Focus 5 |
| `number-base` | Agrupación opcional de dígitos | Task 12 | Tests `grouping` |

Sin puntos recortados. Decisiones que conviene conocer:

- **Regex sin worker.** Una expresión con retroceso catastrófico (por ejemplo `(a+)+$` sobre un texto largo sin coincidencia) aún puede bloquear la pestaña, porque `RegExp` corre en el hilo principal. El debounce y el tope de coincidencias cubren los textos grandes, no este caso. Moverlo a un Web Worker con tiempo límite es una mejora futura.
- **«Invertir» cambia de significado.** La versión antigua invertía los caracteres del texto; la §7 lo coloca en Líneas, así que ahora invierte el orden de las líneas.
- **Límites de archivo:** 20 MB en Base64 (el data URI vive en memoria y en el DOM) y 200 MB en Hash (MD5 en JavaScript recorre el archivo entero en el hilo principal). Los dos avisos proponen la herramienta de línea de comandos.
- **Pestaña Mayúsculas sin copiar principal:** tiene diez resultados del mismo rango, así que `c` no hace nada ahí; en Líneas copia el resultado.
