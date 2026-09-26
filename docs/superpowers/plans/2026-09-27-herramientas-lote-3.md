# DevTools herramientas nuevas, lote 3 (generadores, texto y datos, y referencia) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir las 13 herramientas del lote 3 del subproyecto 2: 3 generadores (`password`, `qr`, `slug`), 5 de texto y datos (`data-convert`, `json-diff`, `markdown`, `curl`, `query-string`) y 5 de referencia (`http-status`, `cron`, `user-agent`, `semver`, `cidr`). Tras este lote el sitio tiene las 52 herramientas del subproyecto.

**Architecture:** Igual que el Plan B y los lotes 1 y 2. Cada herramienta es una carpeta autocontenida `src/tools/<id>/` con `logic.ts` puro y testeado, `meta.ts`, `strings.ts`, `content.es.md`, `content.en.md` y su isla `<Nombre>.svelte`, hecha solo con el kit de UI. La Task 0 instala las librerías del lote (§5 de la spec) con versión fijada, añade `parseCsv` a `src/lib/csv.ts`, 12 iconos y las líneas **pre-sembradas y comentadas** de las 13 herramientas en `src/tools/registry.ts` y `src/components/ToolIsland.astro`, **después** de las entradas que dejó compactadas el lote 2. Cada task de herramienta solo descomenta sus 4 líneas, así que las 13 ramas se fusionan sin conflictos y **ninguna toca `package.json` ni `pnpm-lock.yaml`**. Cada librería se importa solo desde la carpeta de su herramienta, así que Vite la deja en el chunk de esa página. La Task 14 compacta el registro, añade los e2e del lote, actualiza el README, comprueba el reparto de las librerías en los chunks y hace la verificación completa.

**Tech Stack:** Astro 7.3, @astrojs/svelte 9, Svelte 5.57 (runes), TypeScript 6, @lucide/svelte 1.48, Vitest 5, Playwright 1.63. **Dependencias nuevas** (versiones comprobadas con `npm view` el 2026-09-27): `qrcode-generator` 2.0.4 (MIT), `yaml` 2.9.1 (ISC), `marked` 18.0.14 (MIT), `dompurify` 3.4.16 (MPL-2.0 OR Apache-2.0, se usa bajo Apache-2.0), `semver` 7.8.5 (ISC), `ua-parser-js` **1.0.41** (MIT; la 2.x, hoy 2.0.10, es AGPL-3.0) y, en desarrollo, `@types/ua-parser-js` 0.7.39 y `@types/semver` 7.8.0.

**Spec:** `docs/superpowers/specs/2026-09-26-devtools-herramientas-nuevas-design.md` (§1–§5 convenciones, añadidos compartidos y librerías; **§8 fichas del lote 3, vinculantes**; §9 tests y e2e; §10 riesgos; §11 fuera de alcance; §12 decisiones). Plan de referencia para el formato y el patrón: `docs/superpowers/plans/2026-09-26-plataforma-b.md`. Plan anterior: `docs/superpowers/plans/2026-09-27-herramientas-lote-2.md`.

**Orden de ejecución:**

1. **Task 0**, sola, sobre `main` con los **lotes 1 y 2 ya fusionados** (rama `feat/herramientas-lote-3` creada desde ese `main`).
2. **Tasks 1–13 en paralelo**, cada una en su propio worktree y rama (`lote-3/<id>`) creada desde el commit de la Task 0.
3. Fusionar las 13 ramas en `feat/herramientas-lote-3` (ver «Cómo fusionar» más abajo).
4. **Task 14**, sola, sobre la rama con todo fusionado.

**Cómo se verificó este plan antes de escribirlo:** en una copia de `main` con lo que los lotes 1 y 2 dejan y este lote necesita reconstruido desde la spec (`src/lib/random.ts` según la §4.2 y `toCsv` según la §4.3), se instalaron las librerías con los comandos exactos de la Task 0 y se escribieron los archivos de este plan, que se copian aquí tal cual salieron de esa copia. Resultado: `pnpm format` sin cambios; `pnpm lint` y `pnpm check` sin errores ni avisos nuevos; `pnpm test` en verde (175 tests nuevos: 9 de `parseCsv` y 166 de las 13 herramientas); `pnpm build` con 27 páginas de herramienta por idioma (14 de `main` + 13 de este lote); `pnpm check:css` en verde; las 13 comprobaciones de navegador de los Steps 11 en verde contra `astro preview`; y el `e2e/tools.spec.ts` completo con los añadidos de la Task 14, **73 tests en verde**. Los vectores de cron (cambios de hora de Madrid en 2026, días de la semana, el 29 de febrero de 2028) y de CIDR (`/24`, `/31`, `/20`, `/0`, `/32`) se comprobaron además con Node por separado, sin usar el código del plan. Los tests que usan semilla comprueban **propiedades** (longitud, conjuntos presentes, misma semilla → mismo resultado), no secuencias concretas, para no depender de los detalles internos del `seededRng` real del lote 1. Si algo falla al ejecutar, lo más probable es que un lote anterior se haya desviado de la §4 de la spec: adapta la herramienta al código real y dilo en el mensaje del commit.

## Global Constraints

- Node `>=22.12.0`. `package.json` lleva `"packageManager": "pnpm@10.30.2"`. CI con Node 22.
- TypeScript **`^6`**: nunca `pnpm add typescript` sin versión, porque instala la 7 y rompe los peer deps de `@astrojs/check` y `@astrojs/svelte`.
- **`ua-parser-js` siempre `@^1.0.41`**: nunca `pnpm add ua-parser-js` sin versión, porque instala la 2.x (AGPL-3.0). Lo vigila el test `is the MIT-licensed 1.x line, never the AGPL 2.x` de la Task 11.
- **Solo la Task 0 instala dependencias.** Las tasks de herramienta no tocan `package.json` ni `pnpm-lock.yaml`, y cada worktree empieza con `pnpm install --frozen-lockfile`.
- Cada librería se importa **solo** desde la carpeta de su herramienta (`qrcode-generator` en `qr/`, `yaml` en `data-convert/`, `marked` y `dompurify` en `markdown/`, `ua-parser-js` en `user-agent/`, `semver` en `semver/`). Así Vite la deja en el chunk de esa página. `semver` se importa por funciones sueltas (`semver/functions/…`, `semver/ranges/…`), nunca el paquete entero.
- Astro 7 usa un compilador en Rust: **toda etiqueta no vacía se cierra** y no se anida HTML inválido (nada de `<div>` dentro de `<p>` ni de `<a>` dentro de `<a>`).
- Astro 7 usa `compressHTML: 'jsx'`: el espacio entre elementos en línea puede desaparecer. Los separadores se escriben con `{' / '}` o se separan con `gap` de CSS.
- **No** se activa la opción `i18n` de Astro. El i18n es manual: rutas `[locale]/…`.
- Tema en `<html data-theme>`. **El tema por defecto es el claro** (`:root` y `:root[data-theme='light']` en `tokens.css`); oscuro y terminal son alternativos. Las comprobaciones a mano se hacen primero en claro.
- `astro preview` en v7 es un demonio con archivo de bloqueo: usa siempre `--ignore-lock`. Para las comprobaciones de navegador se arranca con `./node_modules/.bin/astro preview --port <puerto> --ignore-lock &` y se para con `kill $PREVIEW` (el script de `.bin` hace `exec node`, así que el PID es el del servidor; **no** uses `pkill -f`, que puede matar tu propia shell).
- Hosting: **Netlify**, `build.format: 'file'` + `trailingSlash: 'never'`: `/es/x` → `es/x.html` con `200`. Este lote no añade cabeceras (§4.7 de la spec).
- Antes de cada `pnpm lint`, ejecuta `pnpm format`. El código de este plan ya sale formateado con el Prettier del repo.
- `logic.ts` de cada herramienta es puro: sin `document`, `window`, `localStorage`, `fetch` ni `crypto` global dentro de las funciones que se testean. El azar entra como `Rng` (de `src/lib/random.ts`) y la hora como parámetro. Se testea en el entorno `node` de Vitest. La única excepción es `markdown/sanitize.ts`, que es un módulo solo de cliente y falla cerrado sin DOM.
- Todo número aleatorio sale de `src/lib/random.ts` (lote 1). **Nunca `Math.random`.** Las contraseñas usan siempre `cryptoRng()`; `seededRng` solo aparece en los tests.
- Ningún componente usa colores hex: todo sale de las variables de `src/styles/tokens.css`. Única excepción deliberada: el QR se pinta con las palabras clave `white` y `black` (un lector de QR necesita oscuro sobre claro en cualquier tema, §8.2).
- Claves de almacenamiento con prefijo `devtools:`. Todo acceso pasa por `src/lib/storage.ts` (o por `persistedInput`, que lo usa).
- Textos de interfaz en sentence case. Los errores dicen qué pasa y cómo arreglarlo. Los estados vacíos dan una instrucción concreta.
- Commits con el formato del repo (`feat:`, `chore:`, `test:`, `docs:`). **Sin trailers ni atribución a IA**: ni `Co-Authored-By`, ni `Claude-Session`, ni «Generated with». El mensaje es solo el asunto y, si hace falta, un cuerpo explicativo.
- Atajos: cada vista tiene **como mucho un** `CopyButton main`; las herramientas con `meta.tabs` (`qr` y `markdown`) tienen **exactamente un** `Segmented main` con esas etiquetas, fuera del `.panel` (como en JSON). Los `Segmented` secundarios no llevan `main`.
- En componentes, **ninguna variable se llama `state`**. Los estados con tipo unión o nullable se declaran como `$state<T>(…)`.
- Un `$effect` **no lee** un `$state` que él mismo escribe: calcula en variables locales y asigna al final (si no, Svelte entra en un bucle `effect_update_depth_exceeded`; lo cazó la comprobación de navegador de `json-diff`).
- **`{@html}` solo en `markdown/Markdown.svelte`**, una vez, y solo con la salida de `sanitize()` (DOMPurify). La regla `svelte/no-at-html-tags` de ESLint lo marca como error: esa línea lleva un `eslint-disable-next-line` con su justificación. En el resto del sitio sigue prohibido.

Reglas del kit (vinculantes, comprobadas en `src/ui/` de `main`):

- **Selectores de tema** en el CSS de un componente: siempre `:global([data-theme='…']) .clase`, nunca `[data-theme='…']` a secas. Este lote no necesita ninguno.
- **CSS de subcomponentes que solo se montan en el cliente**: vive en el padre, bajo `:global(...)`; si no, el build lo descarta y `pnpm check:css` falla. Este lote no tiene subcomponentes. El HTML que inyecta Markdown tampoco tiene clase de ámbito: todas sus reglas van en `Markdown.svelte` bajo `.md-preview :global(...)` (`pnpm check:css` no lo detectaría; se revisa a mano en la Task 6).
- **Objetivos táctiles de 44 px** con `@media (pointer: coarse)` en todo control propio (los chips de ejemplos de cron). Los del kit ya lo cumplen.
- **Texto de error o de éxito**: sobre la superficie del panel, `var(--bad-text)` y `var(--ok-text)` (es lo que hace `Field`). **Dentro de `Display`**, que es oscuro en los tres temas, `var(--bad)` y `var(--ok)`, igual que `CopyButton` compacto; `--bad-text` no pasa el contraste ahí.
- **`CopyButton`**: props reales `value`, `locale`, `main`, `compact`, `label`, `ariaLabel` y `disabled`. Cuando varias filas comparten etiqueta, cada copiar lleva su `ariaLabel` («Copiar el código 404»). Un `value` vacío ya lo desactiva.
- `Segmented`, `Select`, `NumberInput`, `TextArea` y `Toggle` exponen `value`/`checked` con `$bindable`. `NumberInput` puede valer `NaN` o salirse del rango mientras se escribe (solo se ajusta al perder el foco): la lógica trabaja con una copia acotada.
- `persistedInput(id, initial, remember, shouldSave?)` guarda **solo texto**. Varios campos = varios `persistedInput`, con ids `<id>` y `<id>-<campo>`, y un único interruptor «Recordar lo que escribo» que cambia todos (patrón de Diff). `rememberInput: false` → `$state` normal, sin `persistedInput` ni interruptor.
- `Display` recibe `label`, `live` y los snippets `head` y `children`. El snippet `head` es hijo directo del componente (no va dentro de un `{#if}`).
- `Field` recibe `id`, `label`, `help` y `error`, y pasa `describedby` al snippet `children`. Los campos de una línea son `<input class="control">`.

Añadidas para las tasks paralelas:

- **Las tasks de herramienta (1–13) se ejecutan en paralelo, en worktrees separados.** Cada una toca solo su carpeta `src/tools/<id>/`, más **dos líneas descomentadas en `src/tools/registry.ts`** (import y entrada) y **dos en `src/components/ToolIsland.astro`** (import y montaje). Nada más: ni `src/i18n/*.ts`, ni `src/ui/`, ni `src/lib/`, ni `categories.ts`, `types.ts`, `icon-names.ts`, `icons.ts`, `package.json`, `pnpm-lock.yaml` o `e2e/`. No borres las líneas en blanco que separan las líneas pre-sembradas.
- Si una herramienta necesitara algo compartido que no está en la Task 0 ni en los lotes 1 y 2, **para y avisa**.
- Commits de herramienta con rutas explícitas: `git add src/tools/<id> src/tools/registry.ts src/components/ToolIsland.astro`. Nunca `git add src` ni `git add .`. Antes de confirmar, `git status --porcelain` solo puede listar esas rutas.
- Las tasks de herramienta verifican con `pnpm format`, `pnpm lint`, `pnpm check`, `pnpm test`, `pnpm build` y `pnpm check:css`, más una **comprobación de navegador desechable** con Playwright en **un puerto propio** (4671–4683, uno por task; nunca 4642, que es el de `pnpm test:e2e`, ni 4321, ni los 4651–4664 del lote 2). **No** ejecutan `pnpm test:e2e`: los e2e del lote los añade la Task 14.
- La comprobación de navegador es un archivo `.check-<id>.mjs` en la raíz del worktree (ahí resuelve `@playwright/test`) que se borra al terminar. No se confirma nunca.
- **e2e en el puerto 4642** (`playwright.config.ts`, `reuseExistingServer: false`): no dejes nada escuchando en ese puerto antes de `pnpm test:e2e`.
- Antes de escribir el `.svelte`, abre los componentes reales de `src/ui/` que uses. Este plan se escribió contra el kit de `main` del 2026-09-27; si alguna prop ha cambiado, adapta el componente y dilo en el commit.

## Review Focus

1. **El único `{@html}` del sitio no deja pasar nada ejecutable.** El HTML de `marked` nunca se pinta tal cual: pasa por DOMPurify con perfil HTML, sin `style`, `form`, `iframe`, `object` ni `embed`, y sin DOM (SSR, Vitest) `sanitize` devuelve `''` en vez de la entrada sucia. → Test `fails closed: returns nothing instead of the dirty HTML` en la Task 6; e2e `markdown renders GFM and strips every script vector` en la Task 14 (`<script>`, `onerror=`, `javascript:` e `<iframe>`: no se ejecuta nada y nada de eso queda en el DOM ni en el HTML copiado).
2. **Cron y los cambios de hora de Madrid.** `02:30` del 2026-03-29 no existe y se ejecuta a las `03:00` (`01:00Z`), marcada como ajustada; `02:30` del 2026-10-25 ocurre dos veces y se ejecuta solo la primera (`00:30Z`); varias horas del hueco que caen en el mismo instante salen una sola vez. → Tests `runs a time in the March gap at the first minute after the jump`, `runs a time in the repeated October hour once, at its first occurrence`, `shows the March gap once, marked as adjusted` y `runs once in the repeated October hour` en la Task 10.
3. **`ua-parser-js` se queda en la 1.x (MIT).** Una actualización a la 2.x (AGPL-3.0) tiene que romper el CI, no colarse. → Test `is the MIT-licensed 1.x line, never the AGPL 2.x` en la Task 11, que lee la versión y la licencia del `package.json` instalado.
4. **Query string sin contaminación de prototipos y sin guardar credenciales.** `__proto__[polluted]=1` es una clave más de un objeto sin prototipo, y una entrada con `token`, `api_key`, `session`… no se guarda aunque «Recordar» esté activo. → Tests `is safe against prototype pollution` y `refuses to save inputs whose keys look like credentials` en la Task 8; e2e `query-string builds nested JSON and never saves credentials` en la Task 14.
5. **Comparar JSON muy anidados sin desbordar la pila.** El diff usa una pila explícita y la vista previa de cada valor se corta a 120 caracteres mientras se construye, así que 10 000 niveles de anidamiento no rompen nada ni cuestan de más. → Tests `survives 10 000 levels of nesting without overflowing the stack` y `cuts long values at 120 characters, even when they are huge or deep` en la Task 5.

---

## File Structure

```
package.json  pnpm-lock.yaml           → 6 dependencias + 2 de tipos                               [Task 0]
src/lib/csv.ts  csv-parse.test.ts      → parseCsv, detectSeparator, CsvResult, CsvWarning          [Task 0]
src/tools/icon-names.ts  icons.ts      → +12 iconos                                                [Task 0]
src/tools/registry.ts                  → líneas pre-sembradas (Task 0), compactado (Task 14)
src/components/ToolIsland.astro        → líneas pre-sembradas (Task 0), compactado (Task 14)
src/tools/password/      {logic,logic.test,meta,strings}.ts Password.svelte content.{es,en}.md      [Task 1]
src/tools/qr/            {logic,logic.test,meta,strings}.ts Qr.svelte content.{es,en}.md            [Task 2]
src/tools/slug/          {logic,logic.test,meta,strings}.ts Slug.svelte content.{es,en}.md          [Task 3]
src/tools/data-convert/  {logic,logic.test,meta,strings}.ts DataConvert.svelte content.{es,en}.md   [Task 4]
src/tools/json-diff/     {logic,logic.test,meta,strings}.ts JsonDiff.svelte content.{es,en}.md      [Task 5]
src/tools/markdown/      {logic,logic.test,sanitize,meta,strings}.ts Markdown.svelte content.{es,en}.md [Task 6]
src/tools/curl/          {logic,logic.test,meta,strings}.ts Curl.svelte content.{es,en}.md          [Task 7]
src/tools/query-string/  {logic,logic.test,meta,strings}.ts QueryString.svelte content.{es,en}.md   [Task 8]
src/tools/http-status/   {logic,logic.test,meta,strings}.ts HttpStatus.svelte content.{es,en}.md    [Task 9]
src/tools/cron/          {logic,logic.test,meta,strings}.ts Cron.svelte content.{es,en}.md          [Task 10]
src/tools/user-agent/    {logic,logic.test,meta,strings}.ts UserAgent.svelte content.{es,en}.md     [Task 11]
src/tools/semver/        {logic,logic.test,meta,strings}.ts Semver.svelte content.{es,en}.md        [Task 12]
src/tools/cidr/          {logic,logic.test,meta,strings}.ts Cidr.svelte content.{es,en}.md          [Task 13]
e2e/tools.spec.ts  e2e/smoke.spec.ts   → 13 páginas nuevas, 13 interacciones y un localizador exacto [Task 14]
README.md                              → 13 filas en la tabla de herramientas                      [Task 14]
```

| Task | id | Nombre (h1) | Slug ES | Slug EN | Icono | Rama | Puerto |
|---|---|---|---|---|---|---|---|
| 1 | `password` | Contraseñas | `generador-contrasenas` | `password-generator` | `lock-keyhole` | `lote-3/password` | 4671 |
| 2 | `qr` | Código QR | `generador-codigo-qr` | `qr-code-generator` | `qr-code` | `lote-3/qr` | 4672 |
| 3 | `slug` | Slug | `generador-slug` | `slug-generator` | `link-2` | `lote-3/slug` | 4673 |
| 4 | `data-convert` | JSON, YAML y CSV | `conversor-json-yaml-csv` | `json-yaml-csv-converter` | `sheet` | `lote-3/data-convert` | 4674 |
| 5 | `json-diff` | Comparar JSON | `comparar-json` | `json-diff` | `git-compare-arrows` | `lote-3/json-diff` | 4675 |
| 6 | `markdown` | Markdown | `vista-previa-markdown` | `markdown-preview` | `file-text` | `lote-3/markdown` | 4676 |
| 7 | `curl` | cURL a fetch | `convertir-curl-a-fetch` | `curl-to-fetch-converter` | `terminal` | `lote-3/curl` | 4677 |
| 8 | `query-string` | Query string | `conversor-query-string-json` | `query-string-to-json` | `file-braces` | `lote-3/query-string` | 4678 |
| 9 | `http-status` | Códigos HTTP | `codigos-estado-http` | `http-status-codes` | `server` | `lote-3/http-status` | 4679 |
| 10 | `cron` | Cron | `explicar-expresion-cron` | `cron-expression-explainer` | `calendar-clock` | `lote-3/cron` | 4680 |
| 11 | `user-agent` | User-Agent | `analizar-user-agent` | `user-agent-parser` | `monitor-smartphone` | `lote-3/user-agent` | 4681 |
| 12 | `semver` | Semver | `comprobar-rango-semver` | `semver-range-checker` | `tag` | `lote-3/semver` | 4682 |
| 13 | `cidr` | Subredes CIDR | `calculadora-subredes-cidr` | `cidr-subnet-calculator` | `network` | `lote-3/cidr` | 4683 |

Ningún slug choca con los 39 existentes tras el lote 2 (lo comprueba `registry.test.ts`). Categorías: 1–3 en `gen`, 4–8 en `data`, 9–13 en `ref`.

**Decisión sobre lo compartido.** La única pieza compartida nueva es `parseCsv`, que la spec asigna a este lote dentro de `src/lib/csv.ts` (§4.3). Sus tests van en un archivo propio, `src/lib/csv-parse.test.ts`, para no editar el de `toCsv` que dejó el lote 1. No hay claves nuevas en `src/i18n/*.ts` (la §4.5 no asigna ninguna al lote 3): cada herramienta usa las de `main` (`ui.clear`, `ui.generate`, `ui.download`, `led.*`, `tool.remember`) y su `strings.ts`. Varias herramientas reutilizan lógica de herramientas ya publicadas, sin tocarla: `parseJson` y `jsonPath` de `json/logic.ts` (`data-convert`, `json-diff`, `query-string`) y `zonedToUtc`, `wallClock`, `listTimeZones` e `isValidTimeZone` de `timestamp/logic.ts` (`cron`).

## Cómo fusionar las Tasks 1–13

Cada task trabaja en `git worktree add ../devtools-l3-<id> -b lote-3/<id>` desde el commit de la Task 0. Al terminar las 13:

```bash
git switch feat/herramientas-lote-3
for id in password qr slug data-convert json-diff markdown curl query-string http-status cron user-agent semver cidr; do
  git merge --no-ff --no-edit "lote-3/$id" || break
done
pnpm install --frozen-lockfile && pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build
```

No debería haber conflictos: cada rama cambia líneas distintas de `registry.ts` y `ToolIsland.astro`, separadas por una línea en blanco, y ninguna toca el lockfile. Si aun así aparece uno en esos dos archivos, la resolución es conservar las dos líneas descomentadas. Cualquier conflicto fuera de ellos significa que una task tocó algo que no debía: revísala antes de seguir.

---

### Task 0: Prerrequisitos compartidos (sola, antes de las herramientas)

**Files:**
- Create: `src/lib/csv-parse.test.ts`
- Modify: `package.json`, `pnpm-lock.yaml`, `src/lib/csv.ts`, `src/tools/icon-names.ts`, `src/tools/icons.ts`, `src/tools/registry.ts`, `src/components/ToolIsland.astro`

**Interfaces:**
- Consumes: `main` con los lotes 1 y 2 fusionados y compactados: `src/lib/random.ts` (§4.2: `type Rng`, `cryptoRng`, `seededRng`, `pick`, `shuffle`…), `src/lib/csv.ts` con `toCsv(rows: (string | number | boolean | null)[][], sep: ',' | ';' | '\t' = ','): string` (§4.3), la categoría `calc` y las 39 herramientas en `registry.ts` y `ToolIsland.astro` sin líneas comentadas.
- Produces:
  - Dependencias: `qrcode-generator`, `yaml`, `marked`, `dompurify`, `semver` y `ua-parser-js` 1.x; en desarrollo, `@types/ua-parser-js` y `@types/semver`. Con el `pnpm-lock.yaml` actualizado en el mismo commit.
  - `src/lib/csv.ts` gana `interface CsvWarning { row; columns; expected }`, `type CsvResult`, `detectSeparator(text): ',' | ';' | '\t'` y `parseCsv(input: string, sep?: ',' | ';' | '\t'): CsvResult`. Lo usa `data-convert`.
  - `IconName` gana: `calendar-clock`, `file-braces`, `file-text`, `git-compare-arrows`, `link-2`, `lock-keyhole`, `monitor-smartphone`, `network`, `qr-code`, `server`, `sheet`, `tag`. (`terminal`, para cURL, ya existe.)
  - `registry.ts` y `ToolIsland.astro` con las dos líneas de cada herramienta del lote 3 comentadas, separadas por líneas en blanco, **después** de lo que ya había.

**Desviación de la spec, a propósito:** la §4.3 escribe `CsvResult` con `warnings: string[]` y un `reason` de texto. Aquí los avisos son objetos (`{ row, columns, expected }`) y el motivo es un código (`'unclosed-quote'`): `src/lib/` no conoce el idioma, y es `data-convert` quien los traduce con su `strings.ts` («La fila 5 tiene 3 columnas y la cabecera, 4»).

- [ ] **Step 1: Comprobar que los lotes 1 y 2 están fusionados**

```bash
git switch main && git pull --ff-only
git switch -c feat/herramientas-lote-3
git status --short
test -f src/lib/random.ts || echo "FALTA src/lib/random.ts"
for f in cryptoRng seededRng pick shuffle; do
  grep -q "export function $f" src/lib/random.ts || echo "FALTA $f en random.ts"
done
grep -q "export type Rng" src/lib/random.ts || echo "FALTA el tipo Rng"
grep -q "export function toCsv" src/lib/csv.ts || echo "FALTA toCsv en csv.ts"
grep -q "parseCsv" src/lib/csv.ts && echo "parseCsv YA EXISTE"
grep -q "'calc'" src/tools/types.ts || echo "FALTA la categoría calc del lote 2"
grep -q "from './mock/meta'" src/tools/registry.ts || echo "FALTA el lote 1 en el registro"
grep -q "from './workdays/meta'" src/tools/registry.ts || echo "FALTA el lote 2 en el registro"
grep -nE "^// import|^  // |^\{/\*" src/tools/registry.ts src/components/ToolIsland.astro && echo "QUEDAN LÍNEAS COMENTADAS"
for p in qrcode-generator yaml marked dompurify semver ua-parser-js; do
  grep -q "\"$p\":" package.json && echo "$p YA ESTÁ EN package.json"
done
grep -cE "^  [A-Za-z0-9]+,$" src/tools/registry.ts
pnpm install --frozen-lockfile && pnpm test && pnpm check
```
Expected: `git status` vacío, ninguna línea `FALTA …`, `YA EXISTE`, `QUEDAN LÍNEAS COMENTADAS` ni `YA ESTÁ EN package.json`, el recuento de entradas del registro es `39`, y tests y `check` en verde. Si falta algo de los lotes anteriores, **para**: este plan depende de ellos.

Abre `src/lib/csv.ts` y comprueba que `toCsv` separa las filas con `\r\n` y acepta `(string | number | boolean | null)[][]`. Si su firma difiere de la §4.3, **para y avisa**: `parseCsv` y `data-convert` se escribieron contra esa firma.

- [ ] **Step 2: Instalar las librerías del lote**

Versiones fijadas con el rango de la §5 de la spec. **Nunca** `pnpm add ua-parser-js` sin versión: instala la 2.x, que es AGPL-3.0.
```bash
pnpm add qrcode-generator@^2.0.4 yaml@^2.9.1 marked@^18.0.14 dompurify@^3.4.16 semver@^7.8.5 ua-parser-js@^1.0.41
pnpm add -D @types/ua-parser-js@^0.7.39 @types/semver@^7.8.0
node -e "for (const p of ['qrcode-generator','yaml','marked','dompurify','semver','ua-parser-js','@types/ua-parser-js','@types/semver']) { const j = require('./node_modules/' + p + '/package.json'); console.log(p, j.version, j.license); }"
git diff --stat package.json pnpm-lock.yaml
```
Expected (el 2026-09-27; si sale una versión de parche posterior dentro del mismo rango, vale):
```
qrcode-generator 2.0.4 MIT
yaml 2.9.1 ISC
marked 18.0.14 MIT
dompurify 3.4.16 (MPL-2.0 OR Apache-2.0)
semver 7.8.5 ISC
ua-parser-js 1.0.41 MIT
@types/ua-parser-js 0.7.39 MIT
@types/semver 7.8.0 MIT
```
`ua-parser-js` **tiene que** empezar por `1.` y ser MIT. `package.json` gana en `dependencies` las 6 librerías (`dompurify`, `marked`, `qrcode-generator`, `semver`, `ua-parser-js` y `yaml`, en orden alfabético) y en `devDependencies` los dos paquetes de tipos. `yaml` ya estaba en el lockfile como dependencia de Astro; ahora es directa. `pnpm` puede avisar de «Ignored build scripts: esbuild»: es el aviso de siempre del repo, no hace falta aprobar nada.

- [ ] **Step 3: Tests de `parseCsv` (fallan)**

`src/lib/csv-parse.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { detectSeparator, parseCsv, toCsv } from './csv';

describe('parseCsv', () => {
  it('reads simple rows with any line ending and ignores the final break', () => {
    expect(parseCsv('a,b\r\n1,2\n3,4\r5,6\n')).toEqual({
      ok: true,
      rows: [
        ['a', 'b'],
        ['1', '2'],
        ['3', '4'],
        ['5', '6'],
      ],
      sep: ',',
      warnings: [],
    });
  });

  it('handles quoted fields with separators, line breaks and doubled quotes', () => {
    const r = parseCsv('nombre;nota\n"Pérez; Ana";"dijo ""hola""\nadiós"\n');
    expect(r).toMatchObject({
      ok: true,
      sep: ';',
      rows: [
        ['nombre', 'nota'],
        ['Pérez; Ana', 'dijo "hola"\nadiós'],
      ],
    });
  });

  it('drops the BOM and keeps empty fields', () => {
    expect(parseCsv('\uFEFFa,,c')).toMatchObject({ ok: true, rows: [['a', '', 'c']] });
  });

  it('detects the separator from the first row, outside quotes', () => {
    expect(detectSeparator('a;b;c\n1,2,3')).toBe(';');
    expect(detectSeparator('a\tb\n')).toBe('\t');
    expect(detectSeparator('"x;y;z",b\n')).toBe(',');
    expect(detectSeparator('a;b,c')).toBe(',');
    expect(detectSeparator('solo')).toBe(',');
  });

  it('uses the given separator instead of detecting one', () => {
    expect(parseCsv('a;b,c', ',')).toMatchObject({ rows: [['a;b', 'c']], sep: ',' });
  });

  it('reports an unclosed quote with the line where it starts', () => {
    expect(parseCsv('a,b\n1,"abierta\n2,3')).toEqual({
      ok: false,
      line: 2,
      reason: 'unclosed-quote',
    });
  });

  it('warns (without failing) about rows with a different column count', () => {
    const r = parseCsv('a,b,c,d\n1,2,3,4\n1,2,3,4\n1,2,3,4\n1,2,3');
    expect(r).toMatchObject({ ok: true, warnings: [{ row: 5, columns: 3, expected: 4 }] });
  });

  it('reads an empty text as no rows', () => {
    expect(parseCsv('')).toEqual({ ok: true, rows: [], sep: ',', warnings: [] });
  });

  it('round-trips what toCsv writes', () => {
    const rows = [
      ['id', 'texto'],
      ['1', 'con; punto y coma'],
      ['2', 'con "comillas"\ny salto'],
      ['3', ' espacios '],
    ];
    for (const sep of [',', ';', '\t'] as const) {
      expect(parseCsv(toCsv(rows, sep), sep)).toMatchObject({ ok: true, rows });
    }
  });
});
```

Run: `pnpm test src/lib/csv-parse.test.ts`
Expected: FAIL (`parseCsv` y `detectSeparator` no existen).

- [ ] **Step 4: `parseCsv` en `src/lib/csv.ts`**

Añade al **final** de `src/lib/csv.ts`, después de `toCsv` y sin tocar nada de lo que ya hay, este bloque (una máquina de estados escrita a mano, como pide la §4.3; no usa ningún tipo del lote 1 para no depender de sus nombres):
```ts
/** A row whose column count differs from the header's. `row` is 1-based (the header is row 1). */
export interface CsvWarning {
  row: number;
  columns: number;
  expected: number;
}

export type CsvResult =
  | { ok: true; rows: string[][]; sep: ',' | ';' | '\t'; warnings: CsvWarning[] }
  | { ok: false; line: number; reason: 'unclosed-quote' };

const SEPARATORS = [',', ';', '\t'] as const;

/** Counts `,`, `;` and tabs outside quotes in the first row. The most frequent wins; ties go to `,`. */
export function detectSeparator(text: string): ',' | ';' | '\t' {
  const counts = { ',': 0, ';': 0, '\t': 0 };
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') quoted = !quoted;
    else if (!quoted && (c === '\n' || c === '\r')) break;
    else if (!quoted && (c === ',' || c === ';' || c === '\t')) counts[c]++;
  }
  let best: ',' | ';' | '\t' = ',';
  for (const s of SEPARATORS) if (counts[s] > counts[best]) best = s;
  return best;
}

/**
 * RFC 4180 reader written by hand: quoted fields may hold the separator, line breaks and `""`.
 * Accepts `\r\n`, `\n` and `\r`, drops a leading BOM and ignores the final line break.
 */
export function parseCsv(input: string, sep?: ',' | ';' | '\t'): CsvResult {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const separator = sep ?? detectSeparator(text);
  const rows: string[][] = [];
  if (text === '') return { ok: true, rows, sep: separator, warnings: [] };

  let row: string[] = [];
  let field = '';
  let i = 0;
  let line = 1;
  let quoteLine = 0;
  let inQuotes = false;
  let atFieldStart = true;

  const endField = () => {
    row.push(field);
    field = '';
    atFieldStart = true;
  };
  const endRow = () => {
    endField();
    rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      if (c === '\r' || c === '\n') {
        line++;
        if (c === '\r' && text[i + 1] === '\n') {
          field += '\r\n';
          i += 2;
          continue;
        }
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"' && atFieldStart) {
      inQuotes = true;
      quoteLine = line;
      atFieldStart = false;
      i++;
      continue;
    }
    if (c === separator) {
      endField();
      i++;
      continue;
    }
    if (c === '\r' || c === '\n') {
      endRow();
      line++;
      i += c === '\r' && text[i + 1] === '\n' ? 2 : 1;
      continue;
    }
    field += c;
    atFieldStart = false;
    i++;
  }
  if (inQuotes) return { ok: false, line: quoteLine, reason: 'unclosed-quote' };
  // A final line break does not open an empty last row.
  const last = text[text.length - 1];
  if (last !== '\n' && last !== '\r') endRow();

  const warnings: CsvWarning[] = [];
  const expected = rows[0]?.length ?? 0;
  rows.forEach((r, k) => {
    if (k > 0 && r.length !== expected) warnings.push({ row: k + 1, columns: r.length, expected });
  });
  return { ok: true, rows, sep: separator, warnings };
}
```

Run: `pnpm format && pnpm test src/lib`
Expected: PASS, incluidos los tests de `toCsv` del lote 1 y el de ida y vuelta de `csv-parse.test.ts`.

- [ ] **Step 5: Iconos nuevos**

Añade estos 12 nombres a `ICON_NAMES` en `src/tools/icon-names.ts`, **cada uno en su posición alfabética** (la lista está ordenada), y en `src/tools/icons.ts` el componente al `import { … } from '@lucide/svelte'` (también en orden alfabético) y la entrada al objeto `icons` (en el orden del resto de entradas). Los 12 componentes existen en el `@lucide/svelte` instalado (comprobado en `dist/icons/index.d.ts`).

| Nombre en `ICON_NAMES` | Import de `@lucide/svelte` | Entrada en `icons` | Lo usa |
|---|---|---|---|
| `'calendar-clock'` | `CalendarClock` | `'calendar-clock': CalendarClock,` | `cron` |
| `'file-braces'` | `FileBraces` | `'file-braces': FileBraces,` | `query-string` |
| `'file-text'` | `FileText` | `'file-text': FileText,` | `markdown` |
| `'git-compare-arrows'` | `GitCompareArrows` | `'git-compare-arrows': GitCompareArrows,` | `json-diff` |
| `'link-2'` | `Link2` | `'link-2': Link2,` | `slug` |
| `'lock-keyhole'` | `LockKeyhole` | `'lock-keyhole': LockKeyhole,` | `password` |
| `'monitor-smartphone'` | `MonitorSmartphone` | `'monitor-smartphone': MonitorSmartphone,` | `user-agent` |
| `'network'` | `Network` | `network: Network,` | `cidr` |
| `'qr-code'` | `QrCode` | `'qr-code': QrCode,` | `qr` |
| `'server'` | `Server` | `server: Server,` | `http-status` |
| `'sheet'` | `Sheet` | `sheet: Sheet,` | `data-convert` |
| `'tag'` | `Tag` | `tag: Tag,` | `semver` |

Comprueba el orden y que no falta ninguno:
```bash
node -e "const s=require('fs').readFileSync('src/tools/icon-names.ts','utf8'); const n=[...s.matchAll(/^  '([a-z0-9-]+)',/gm)].map(m=>m[1]); const sorted=[...n].sort(); console.log(JSON.stringify(n)===JSON.stringify(sorted)?'ORDENADOS':'DESORDENADOS', n.length)"
pnpm check
```
Expected: `ORDENADOS` y el total de nombres de `main` más 12. `pnpm check` en verde: `icons` es un `Record<IconName, …>`, así que falla si falta un componente o sobra un nombre.

- [ ] **Step 6: Pre-sembrar `registry.ts`**

En `src/tools/registry.ts`, justo **después del último** `import { meta as … } from './…/meta';` (tras el lote 2 es `import { meta as workdays } from './workdays/meta';`) y **antes** de `import type { Category, CategoryId, Locale, ToolMeta } from './types';`, añade este bloque tal cual, con sus líneas en blanco:
```ts

// Lote 3: each tool task uncomments its import and its entry in `tools`.
// Keep the blank lines between them: they let the parallel branches merge without conflicts.

// import { meta as password } from './password/meta';

// import { meta as qr } from './qr/meta';

// import { meta as slug } from './slug/meta';

// import { meta as dataConvert } from './data-convert/meta';

// import { meta as jsonDiff } from './json-diff/meta';

// import { meta as markdown } from './markdown/meta';

// import { meta as curl } from './curl/meta';

// import { meta as queryString } from './query-string/meta';

// import { meta as httpStatus } from './http-status/meta';

// import { meta as cron } from './cron/meta';

// import { meta as userAgent } from './user-agent/meta';

// import { meta as semver } from './semver/meta';

// import { meta as cidr } from './cidr/meta';

```

Y dentro del array `tools`, justo **después de la última entrada** (tras el lote 2 es `  workdays,`) y antes de `];`, añade:
```ts

  // password,

  // qr,

  // slug,

  // dataConvert,

  // jsonDiff,

  // markdown,

  // curl,

  // queryString,

  // httpStatus,

  // cron,

  // userAgent,

  // semver,

  // cidr,
```

El array no empieza por comentarios, así que Prettier respeta las líneas en blanco (comprobado: `pnpm format` no cambia nada).

- [ ] **Step 7: Pre-sembrar `ToolIsland.astro`**

En `src/components/ToolIsland.astro`, justo **después del último** import de un `.svelte` (tras el lote 2 es `import Workdays from '../tools/workdays/Workdays.svelte';`) y antes de `import type { Locale } from '../tools/types';`, añade:
```astro

// Lote 3: each tool task uncomments its import below and its line in the template.
// Keep the blank lines between them: they let the parallel branches merge without conflicts.

// import Password from '../tools/password/Password.svelte';

// import Qr from '../tools/qr/Qr.svelte';

// import Slug from '../tools/slug/Slug.svelte';

// import DataConvert from '../tools/data-convert/DataConvert.svelte';

// import JsonDiff from '../tools/json-diff/JsonDiff.svelte';

// import Markdown from '../tools/markdown/Markdown.svelte';

// import Curl from '../tools/curl/Curl.svelte';

// import QueryString from '../tools/query-string/QueryString.svelte';

// import HttpStatus from '../tools/http-status/HttpStatus.svelte';

// import Cron from '../tools/cron/Cron.svelte';

// import UserAgent from '../tools/user-agent/UserAgent.svelte';

// import Semver from '../tools/semver/Semver.svelte';

// import Cidr from '../tools/cidr/Cidr.svelte';

```

Y al **final del archivo**, después de la última línea de montaje (tras el lote 2 es `{id === 'workdays' && <Workdays client:load locale={locale} />}`), añade:
```astro

{/* {id === 'password' && <Password client:load locale={locale} />} */}

{/* {id === 'qr' && <Qr client:load locale={locale} />} */}

{/* {id === 'slug' && <Slug client:load locale={locale} />} */}

{/* {id === 'data-convert' && <DataConvert client:load locale={locale} />} */}

{/* {id === 'json-diff' && <JsonDiff client:load locale={locale} />} */}

{/* {id === 'markdown' && <Markdown client:load locale={locale} />} */}

{/* {id === 'curl' && <Curl client:load locale={locale} />} */}

{/* {id === 'query-string' && <QueryString client:load locale={locale} />} */}

{/* {id === 'http-status' && <HttpStatus client:load locale={locale} />} */}

{/* {id === 'cron' && <Cron client:load locale={locale} />} */}

{/* {id === 'user-agent' && <UserAgent client:load locale={locale} />} */}

{/* {id === 'semver' && <Semver client:load locale={locale} />} */}

{/* {id === 'cidr' && <Cidr client:load locale={locale} />} */}
```

Las líneas `{/* … */}` son comentarios de expresión: el compilador de Astro 7 los ignora (comprobado con `pnpm check` y `pnpm build`).

- [ ] **Step 8: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css && pnpm test:e2e
git diff --stat
```
Expected: todo en verde y `pnpm format` sin cambios en los archivos de esta task. El build sigue generando las 39 páginas de herramienta por idioma: todavía no hay ninguna nueva. El e2e es el de los lotes anteriores y pasa igual que antes.

- [ ] **Step 9: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib/csv.ts src/lib/csv-parse.test.ts \
  src/tools/icon-names.ts src/tools/icons.ts src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain   # no debe quedar nada sin añadir
git commit -m "feat: prerrequisitos del lote 3 (librerías, parseCsv, iconos y registro pre-sembrado)"
```

---

### Task 1: Contraseñas: `crypto.getRandomValues`, entropía y solo las opciones recordadas

**Files:**
- Create: `src/tools/password/logic.ts`, `src/tools/password/logic.test.ts`, `src/tools/password/meta.ts`, `src/tools/password/strings.ts`, `src/tools/password/content.es.md`, `src/tools/password/content.en.md`, `src/tools/password/Password.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `type Rng`, `cryptoRng`, `pick` y `shuffle` de `src/lib/random.ts` (y `seededRng`, solo en los tests); `readJSON` y `writeJSON` de `src/lib/storage.ts`; `fill`; `t` (`ui.generate`, `led.bad`, `led.idle`); kit: `Field`, `NumberInput`, `Toggle`, `Display`, `Led`, `CopyButton` y `Button`.
- Produces:
  - `SETS` (minúsculas, mayúsculas, cifras y los 32 símbolos ASCII), `AMBIGUOUS = '0Oo1lI|'`, `MIN_LENGTH = 4`, `MAX_LENGTH = 128`, `MAX_COUNT = 50`, `DEFAULT_OPTIONS` (20 caracteres, 1 contraseña, los cuatro conjuntos)
  - `interface PasswordOptions`, `type PasswordError = { kind: 'no-sets' } | { kind: 'too-short'; sets }`, `type Strength = 'weak' | 'fair' | 'strong'`
  - `activeSets(opts)`, `validate(opts)`, `generatePassword(rng: Rng, opts): string`, `entropyBits(opts)`, `strength(bits)`, `sanitizeOptions(raw: unknown): PasswordOptions`
  - `meta: ToolMeta` (id `password`, slugs `generador-contrasenas` / `password-generator`), `strings: Record<Locale, …>` y el componente `Password` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 14: `#password-length`, `#password-count`, `.panel .pw` (una por contraseña), el LED de `.display-head` («Fuerte · 131,1 bits de entropía») y el botón «Generar».

**§8.1 (vinculante):** `password` · gen · sin pestañas · `rememberInput: false`. Longitud 4–128 (20) y cantidad 1–50 (1); minúsculas, mayúsculas, números y los 32 símbolos; «Excluir caracteres ambiguos» (`0 O o 1 l I |`). Un carácter de cada conjunto activo con `pick`, relleno con la unión y `shuffle`; siempre `cryptoRng()`, sin semilla. Se genera al cargar, al cambiar una opción y con «Generar». Entropía `L × log2(|conjunto|)` con LED: < 50 débil (`bad`), < 80 aceptable (`idle`), ≥ 80 fuerte (`ok`); 20 de 94 → 131,1 bits. Las contraseñas no se guardan nunca; las opciones sí, en `password.options` con `writeJSON`. Errores: sin conjuntos y longitud menor que el número de conjuntos.

Cómo se cubre cada punto:
- Un carácter de cada conjunto y ningún ambiguo: tests `always has the requested length and at least one character of each active set` (1 000 contraseñas con `seededRng('test')`) y `never uses an ambiguous character when they are excluded`.
- Entropía y umbrales: tests `is 131.1 bits for 20 characters out of 94` y `rates weak below 50 bits, fair below 80 and strong from 80`; el LED usa `bad`/`idle`/`ok`.
- Sin semilla en la página: el `.svelte` solo llama a `cryptoRng()`. `seededRng` aparece únicamente en `logic.test.ts`.
- Nada secreto en el navegador: la contraseña vive en un `$state` y el componente solo escribe `password.options` (validadas al leer con `sanitizeOptions`). La comprobación del Step 11 y el e2e revisan que ningún valor de `localStorage` contiene la contraseña.
- Errores: `validate` devuelve `no-sets` o `too-short` y la pantalla dice «Elige al menos un tipo de carácter» o «Con 4 tipos de carácter, la longitud mínima es 4».

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l3-password -b lote-3/password   # desde el commit de la Task 0
cd ../devtools-l3-password
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task (Field, NumberInput, Toggle, Display, Led, CopyButton, Button) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real y dilo en el commit.

- [ ] **Step 2: Test (falla)**

`src/tools/password/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import {
  AMBIGUOUS,
  DEFAULT_OPTIONS,
  SETS,
  activeSets,
  entropyBits,
  generatePassword,
  sanitizeOptions,
  strength,
  validate,
} from './logic';

describe('character sets', () => {
  it('has the 32 printable ASCII symbols and 94 characters in total', () => {
    expect(SETS.symbols).toHaveLength(32);
    expect(activeSets(DEFAULT_OPTIONS).join('')).toHaveLength(94);
  });

  it('removes 0 O o 1 l I | when ambiguous characters are excluded', () => {
    const all = activeSets({ ...DEFAULT_OPTIONS, excludeAmbiguous: true }).join('');
    expect(all).toHaveLength(94 - 7);
    for (const c of AMBIGUOUS) expect(all).not.toContain(c);
  });
});

describe('generatePassword', () => {
  it('always has the requested length and at least one character of each active set', () => {
    const rng = seededRng('test');
    for (let i = 0; i < 1000; i++) {
      const length = 4 + (i % 30);
      const p = generatePassword(rng, { ...DEFAULT_OPTIONS, length });
      expect(p).toHaveLength(length);
      for (const set of Object.values(SETS)) expect([...p].some((c) => set.includes(c))).toBe(true);
    }
  });

  it('never uses an ambiguous character when they are excluded', () => {
    const rng = seededRng('test');
    const opts = { ...DEFAULT_OPTIONS, length: 64, excludeAmbiguous: true };
    for (let i = 0; i < 200; i++) {
      const p = generatePassword(rng, opts);
      for (const c of AMBIGUOUS) expect(p).not.toContain(c);
    }
  });

  it('only uses the active sets', () => {
    const p = generatePassword(seededRng('x'), {
      ...DEFAULT_OPTIONS,
      length: 50,
      upper: false,
      symbols: false,
    });
    expect(p).toMatch(/^[a-z0-9]{50}$/);
  });

  it('is reproducible with a seed (tests only) and different across seeds', () => {
    const a = generatePassword(seededRng('demo'), DEFAULT_OPTIONS);
    expect(generatePassword(seededRng('demo'), DEFAULT_OPTIONS)).toBe(a);
    expect(generatePassword(seededRng('otra'), DEFAULT_OPTIONS)).not.toBe(a);
  });
});

describe('validate', () => {
  it('needs at least one set', () => {
    expect(
      validate({ ...DEFAULT_OPTIONS, lower: false, upper: false, digits: false, symbols: false }),
    ).toEqual({ kind: 'no-sets' });
  });

  it('needs room for one character of each set', () => {
    expect(validate({ ...DEFAULT_OPTIONS, length: 3 })).toEqual({ kind: 'too-short', sets: 4 });
    expect(validate({ ...DEFAULT_OPTIONS, length: 4 })).toBeNull();
  });
});

describe('entropy', () => {
  it('is 131.1 bits for 20 characters out of 94', () => {
    expect(entropyBits(DEFAULT_OPTIONS)).toBeCloseTo(131.09, 2);
  });

  it('rates weak below 50 bits, fair below 80 and strong from 80', () => {
    expect(strength(49.9)).toBe('weak');
    expect(strength(50)).toBe('fair');
    expect(strength(79.9)).toBe('fair');
    expect(strength(80)).toBe('strong');
    // 8 lowercase letters: 8 × log2(26) ≈ 37.6 bits.
    expect(
      strength(
        entropyBits({ ...DEFAULT_OPTIONS, length: 8, upper: false, digits: false, symbols: false }),
      ),
    ).toBe('weak');
  });
});

describe('sanitizeOptions', () => {
  it('keeps valid stored options and replaces anything odd with the defaults', () => {
    expect(sanitizeOptions({ ...DEFAULT_OPTIONS, length: 32, symbols: false })).toEqual({
      ...DEFAULT_OPTIONS,
      length: 32,
      symbols: false,
    });
    expect(sanitizeOptions({ length: 9999, count: 'x', lower: 'yes' })).toEqual(DEFAULT_OPTIONS);
    expect(sanitizeOptions(null)).toEqual(DEFAULT_OPTIONS);
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/password`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/password/logic.ts`**

Todo el azar entra como `Rng`, así que los tests usan `seededRng` y la página `cryptoRng()`. `pick` y `shuffle` de `lib/random.ts` ya eligen sin sesgo (rechazo en `randInt`). `sanitizeOptions` protege del contenido que haya en `localStorage`: cualquier campo raro vuelve al valor por defecto.

```ts
import { pick, shuffle, type Rng } from '../../lib/random';

export const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  // The 32 printable ASCII symbols.
  symbols: '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
} as const;

export type SetName = keyof typeof SETS;

/** Characters that are easy to confuse when reading a password aloud or on paper. */
export const AMBIGUOUS = '0Oo1lI|';

export const MIN_LENGTH = 4;
export const MAX_LENGTH = 128;
export const MAX_COUNT = 50;

export interface PasswordOptions {
  length: number;
  count: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export const DEFAULT_OPTIONS: PasswordOptions = {
  length: 20,
  count: 1,
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
};

export type PasswordError = { kind: 'no-sets' } | { kind: 'too-short'; sets: number };

export type Strength = 'weak' | 'fair' | 'strong';

const NAMES: SetName[] = ['lower', 'upper', 'digits', 'symbols'];

/** The active character sets, without the ambiguous characters when they are excluded. */
export function activeSets(opts: PasswordOptions): string[] {
  return NAMES.filter((n) => opts[n]).map((n) =>
    opts.excludeAmbiguous ? [...SETS[n]].filter((c) => !AMBIGUOUS.includes(c)).join('') : SETS[n],
  );
}

export function validate(opts: PasswordOptions): PasswordError | null {
  const sets = activeSets(opts);
  if (sets.length === 0) return { kind: 'no-sets' };
  if (opts.length < sets.length) return { kind: 'too-short', sets: sets.length };
  return null;
}

/**
 * One character from each active set, the rest from their union, then shuffled.
 * The page always passes cryptoRng(): a seeded, reproducible password would not be secret.
 */
export function generatePassword(rng: Rng, opts: PasswordOptions): string {
  const sets = activeSets(opts);
  if (validate(opts)) throw new RangeError('invalid password options');
  const all = [...sets.join('')];
  const chars = sets.map((set) => pick(rng, [...set]));
  while (chars.length < opts.length) chars.push(pick(rng, all));
  return shuffle(rng, chars).join('');
}

/** E = L × log2(|charset|). The "one of each kind" rule lowers it only very slightly. */
export function entropyBits(opts: PasswordOptions): number {
  const size = activeSets(opts).join('').length;
  return size === 0 ? 0 : opts.length * Math.log2(size);
}

export function strength(bits: number): Strength {
  if (bits < 50) return 'weak';
  if (bits < 80) return 'fair';
  return 'strong';
}

/** Options read back from storage: anything malformed falls back to the defaults. */
export function sanitizeOptions(raw: unknown): PasswordOptions {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const int = (v: unknown, min: number, max: number, fallback: number) =>
    typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max ? v : fallback;
  const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
  return {
    length: int(o.length, MIN_LENGTH, MAX_LENGTH, DEFAULT_OPTIONS.length),
    count: int(o.count, 1, MAX_COUNT, DEFAULT_OPTIONS.count),
    lower: bool(o.lower, DEFAULT_OPTIONS.lower),
    upper: bool(o.upper, DEFAULT_OPTIONS.upper),
    digits: bool(o.digits, DEFAULT_OPTIONS.digits),
    symbols: bool(o.symbols, DEFAULT_OPTIONS.symbols),
    excludeAmbiguous: bool(o.excludeAmbiguous, DEFAULT_OPTIONS.excludeAmbiguous),
  };
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/password`
Expected: PASS (11 tests).

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/password/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'password',
  category: 'gen',
  icon: 'lock-keyhole',
  slug: { es: 'generador-contrasenas', en: 'password-generator' },
  name: { es: 'Contraseñas', en: 'Passwords' },
  title: {
    es: 'Generador de contraseñas seguras con entropía',
    en: 'Strong password generator with entropy meter',
  },
  description: {
    es: 'Genera contraseñas aleatorias y seguras con crypto.getRandomValues, elige longitud y tipos de carácter y mira su entropía en bits. No se guardan nunca.',
    en: 'Generate strong random passwords with crypto.getRandomValues, choose length and character types and see their entropy in bits. They are never stored.',
  },
  keywords: {
    es: [
      'generador de contraseñas',
      'contraseña segura',
      'contraseña aleatoria',
      'crear contraseña',
      'entropia contraseña',
      'password',
    ],
    en: [
      'password generator',
      'strong password',
      'random password',
      'secure password',
      'password entropy',
      'generate password',
    ],
  },
  rememberInput: false,
  faq: {
    es: [
      {
        q: '¿Son seguras estas contraseñas?',
        a: 'Sí. Se generan en tu navegador con crypto.getRandomValues, el generador criptográfico del sistema, y no salen de tu equipo ni se guardan. Solo se recuerdan las opciones, como la longitud.',
      },
      {
        q: '¿Qué entropía necesito?',
        a: 'Por debajo de 50 bits es débil. Entre 50 y 80, aceptable para cuentas poco importantes. A partir de 80 bits es fuerte: 16 caracteres con los cuatro tipos ya pasan de 100.',
      },
    ],
    en: [
      {
        q: 'Are these passwords secure?',
        a: 'Yes. They are generated in your browser with crypto.getRandomValues, the system cryptographic generator, and they never leave your device or get stored. Only the options, such as the length, are remembered.',
      },
      {
        q: 'How much entropy do I need?',
        a: 'Below 50 bits is weak. Between 50 and 80 is acceptable for low-value accounts. From 80 bits it is strong: 16 characters with all four types already go past 100.',
      },
    ],
  },
};
```

`src/tools/password/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    length: 'Longitud',
    count: 'Cantidad',
    lower: 'Minúsculas (a–z)',
    upper: 'Mayúsculas (A–Z)',
    digits: 'Números (0–9)',
    symbols: 'Símbolos (!@#…)',
    excludeAmbiguous: 'Excluir caracteres ambiguos (0 O o 1 l I |)',
    result: 'Contraseñas',
    weak: 'Débil',
    fair: 'Aceptable',
    strong: 'Fuerte',
    bits: '{bits} bits de entropía',
    entropyNote:
      'Entropía = longitud × log2(caracteres posibles). Incluir uno de cada tipo la reduce muy poco.',
    noSets: 'Elige al menos un tipo de carácter',
    tooShort: 'Con {sets} tipos de carácter, la longitud mínima es {sets}',
    notSaved:
      'Las contraseñas no se guardan nunca, ni en este navegador. Solo se recuerdan las opciones.',
    copyAll: 'Copiar',
    copyOne: 'Copiar contraseña {n}',
  },
  en: {
    length: 'Length',
    count: 'Quantity',
    lower: 'Lowercase (a–z)',
    upper: 'Uppercase (A–Z)',
    digits: 'Numbers (0–9)',
    symbols: 'Symbols (!@#…)',
    excludeAmbiguous: 'Exclude look-alike characters (0 O o 1 l I |)',
    result: 'Passwords',
    weak: 'Weak',
    fair: 'Acceptable',
    strong: 'Strong',
    bits: '{bits} bits of entropy',
    entropyNote:
      'Entropy = length × log2(possible characters). Requiring one of each type lowers it only very slightly.',
    noSets: 'Pick at least one character type',
    tooShort: 'With {sets} character types, the minimum length is {sets}',
    notSaved:
      'Passwords are never stored, not even in this browser. Only the options are remembered.',
    copyAll: 'Copy',
    copyOne: 'Copy password {n}',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/password/content.es.md`:
```md
## Cómo funciona

Elige la longitud, cuántas contraseñas quieres y qué tipos de carácter usar: minúsculas, mayúsculas, números y los 32 símbolos ASCII. Cada contraseña lleva al menos un carácter de cada tipo activo; el resto se elige al azar entre todos y al final se mezclan. El azar sale de `crypto.getRandomValues`, el generador criptográfico del navegador, sin sesgo al elegir cada carácter.

«Excluir caracteres ambiguos» quita `0 O o 1 l I |`, que se confunden al leerlos en voz alta o copiarlos a mano. Se genera una contraseña nueva al cambiar cualquier opción y cada vez que pulsas «Generar».

## Entropía

La barra de fuerza usa la entropía: longitud × log2(número de caracteres posibles). Con 20 caracteres de los 94 posibles salen 131 bits. Por debajo de 50 bits es **débil**, hasta 80 es **aceptable** y a partir de ahí es **fuerte**. Alargar la contraseña suma más que añadir símbolos. Las contraseñas no se guardan nunca, ni siquiera en tu navegador; solo se recuerdan las opciones.
```

`src/tools/password/content.en.md`:
```md
## How it works

Choose the length, how many passwords you want and which character types to use: lowercase, uppercase, numbers and the 32 ASCII symbols. Every password includes at least one character of each active type; the rest are picked at random from all of them and then shuffled. The randomness comes from `crypto.getRandomValues`, the browser's cryptographic generator, with no bias when picking each character.

“Exclude look-alike characters” drops `0 O o 1 l I |`, which are easy to confuse when read aloud or copied by hand. A new password is generated whenever you change an option and every time you press “Generate”.

## Entropy

The strength meter uses entropy: length × log2(number of possible characters). 20 characters out of 94 give 131 bits. Below 50 bits is **weak**, up to 80 is **acceptable** and from there on it is **strong**. Making the password longer adds more than adding symbols. Passwords are never stored, not even in your browser; only the options are remembered.
```

- [ ] **Step 8: `src/tools/password/Password.svelte`**

Las opciones se leen de `password.options` en `onMount` (nunca en SSR) y se guardan en cada cambio con `$state.snapshot`. La generación va en un `$effect` que depende de las opciones y de un contador que sube con «Generar»; en SSR no se genera nada. `NumberInput` puede valer `NaN` mientras se escribe: se trabaja con una copia acotada (`effective`).

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { cryptoRng } from '../../lib/random';
  import { readJSON, writeJSON } from '../../lib/storage';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import type { Locale } from '../types';
  import {
    DEFAULT_OPTIONS,
    MAX_COUNT,
    MAX_LENGTH,
    MIN_LENGTH,
    entropyBits,
    generatePassword,
    sanitizeOptions,
    strength,
    validate,
    type PasswordOptions,
  } from './logic';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  const OPTIONS_KEY = 'password.options';

  // rememberInput: false. Only the options (not secret) are stored; passwords live in memory.
  let opts = $state<PasswordOptions>({ ...DEFAULT_OPTIONS });
  let ready = $state(false);
  let nonce = $state(0);
  let passwords = $state<string[]>([]);

  onMount(() => {
    opts = sanitizeOptions(readJSON<unknown>(OPTIONS_KEY, DEFAULT_OPTIONS));
    ready = true;
  });

  // While typing, the number fields can be empty or out of range: work with a clamped copy.
  const effective = $derived<PasswordOptions>({
    ...opts,
    length: Math.min(MAX_LENGTH, Math.max(1, Math.round(opts.length) || 0)),
    count: Math.min(MAX_COUNT, Math.max(1, Math.round(opts.count) || 1)),
  });
  const error = $derived(validate(effective));

  $effect(() => {
    if (!ready) return;
    writeJSON(OPTIONS_KEY, $state.snapshot(opts));
  });

  $effect(() => {
    void nonce;
    const o = effective;
    if (!ready || validate(o)) {
      passwords = [];
      return;
    }
    const rng = cryptoRng();
    passwords = Array.from({ length: o.count }, () => generatePassword(rng, o));
  });

  const bits = $derived(error ? 0 : entropyBits(effective));
  const level = $derived(strength(bits));
  const bitsText = $derived(
    new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(
      bits,
    ),
  );
  const errorText = $derived(
    !error ? '' : error.kind === 'no-sets' ? s.noSets : fill(s.tooShort, { sets: error.sets }),
  );
</script>

<div class="panel">
  <div class="row">
    <Field id="password-length" label={s.length}>
      {#snippet children({ describedby })}
        <NumberInput
          id="password-length"
          bind:value={opts.length}
          min={MIN_LENGTH}
          max={MAX_LENGTH}
          {describedby}
        />
      {/snippet}
    </Field>
    <Field id="password-count" label={s.count}>
      {#snippet children({ describedby })}
        <NumberInput
          id="password-count"
          bind:value={opts.count}
          min={1}
          max={MAX_COUNT}
          {describedby}
        />
      {/snippet}
    </Field>
  </div>

  <div class="sets">
    <Toggle bind:checked={opts.lower} label={s.lower} />
    <Toggle bind:checked={opts.upper} label={s.upper} />
    <Toggle bind:checked={opts.digits} label={s.digits} />
    <Toggle bind:checked={opts.symbols} label={s.symbols} />
    <Toggle bind:checked={opts.excludeAmbiguous} label={s.excludeAmbiguous} />
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={error ? 'bad' : level === 'strong' ? 'ok' : level === 'weak' ? 'bad' : 'idle'}
        label={error ? t(locale, 'led.bad') : `${s[level]} · ${fill(s.bits, { bits: bitsText })}`}
      />
    {/snippet}
    {#if error}
      <p class="display-note">{errorText}</p>
    {:else if passwords.length}
      <ol class="display-rows list">
        {#each passwords as p, i (i)}
          <li class="display-row">
            <span class="pw">{p}</span>
            <CopyButton value={p} {locale} compact ariaLabel={fill(s.copyOne, { n: i + 1 })} />
          </li>
        {/each}
      </ol>
      <p class="display-note">{s.entropyNote}</p>
    {:else}
      <p class="display-note">{t(locale, 'led.idle')}</p>
    {/if}
  </Display>

  <div class="row">
    <Button variant="primary" icon="refresh-cw" disabled={!!error} onclick={() => nonce++}
      >{t(locale, 'ui.generate')}</Button
    >
    <CopyButton main value={passwords.join('\n')} {locale} label={s.copyAll} />
  </div>
  <p class="note">{s.notSaved}</p>
</div>

<style>
  .sets {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0 16px;
  }
  .list {
    list-style: none;
    padding: 0;
  }
  .pw {
    min-width: 0;
    font-size: 16px;
    letter-spacing: 0.02em;
    word-break: break-all;
  }
  .note {
    font-size: 13.5px;
    color: var(--text-dim);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as password } from './password/meta';
```
→
```ts
import { meta as password } from './password/meta';
```
y
```ts
  // password,
```
→
```ts
  password,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Password from '../tools/password/Password.svelte';
```
→
```astro
import Password from '../tools/password/Password.svelte';
```
y
```astro
{/* {id === 'password' && <Password client:load locale={locale} />} */}
```
→
```astro
{id === 'password' && <Password client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/generador-contrasenas.html dist/en/password-generator.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `password` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador (desechable, puerto 4671)**

Crea `.check-password.mjs` en la raíz del worktree:
```js
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4671';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));

await page.goto(`${BASE}/es/generador-contrasenas`);
const first = page.locator('.pw').first();
await first.waitFor();
assert.equal((await first.innerText()).length, 20);
assert.match(await page.locator('.display-head').innerText(), /Fuerte · 131,1 bits/);

await page.locator('#password-length').fill('32');
await page.waitForTimeout(100);
const pw = await first.innerText();
assert.equal(pw.length, 32);
await page.getByRole('button', { name: 'Generar' }).click();
assert.notEqual(await first.innerText(), pw);

await page.waitForTimeout(500);
const stored = await page.evaluate(() => Object.values(localStorage));
assert.ok(!stored.some((v) => v.includes(pw)), 'the password must never be stored');
assert.ok(stored.some((v) => v.includes('"length":32')), 'the options are stored');

for (const name of ['Minúsculas (a–z)', 'Mayúsculas (A–Z)', 'Números (0–9)', 'Símbolos (!@#…)']) {
  await page.getByRole('switch', { name }).uncheck();
}
assert.match(await page.locator('.display').innerText(), /Elige al menos un tipo de carácter/);

await browser.close();
assert.deepEqual(errors, []);
console.log('OK password');
```

Run:
```bash
./node_modules/.bin/astro preview --port 4671 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
until curl -sf -o /dev/null http://localhost:4671/es; do sleep 0.5; done
node .check-password.mjs
kill $PREVIEW
rm .check-password.mjs
```
Expected: la última línea es `OK password` y no hay ningún error de página. Si falla un paso, arregla el componente, no la comprobación.

A mano, con `pnpm preview`, en `/es/generador-contrasenas` y `/en/password-generator`, primero en el tema claro y luego en oscuro y terminal, a 390 px y a 1280 px de ancho:
1. Al cargar hay una contraseña de 20 caracteres y el LED dice «Fuerte · 131,1 bits de entropía» («Strong · 131.1 bits of entropy» en inglés).
2. Longitud 8 con solo minúsculas → LED rojo «Débil». Recarga: la longitud 8 y los interruptores siguen igual, pero la contraseña es otra.
3. Cantidad 5 → cinco filas, cada una con su «Copiar»; `c` copia las cinco, una por línea.
4. Desactiva los cuatro tipos → «Elige al menos un tipo de carácter» y «Generar» desactivado.
5. En DevTools → Application → Local Storage solo aparece `devtools:password.options`.

- [ ] **Step 12: Commit**

```bash
git add src/tools/password src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (tampoco `.check-password.mjs`, que ya se borró). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(password): generador de contraseñas con entropía y opciones recordadas"
```

---

### Task 2: Código QR: texto, URL y WiFi en UTF-8, con PNG y SVG

**Files:**
- Create: `src/tools/qr/logic.ts`, `src/tools/qr/logic.test.ts`, `src/tools/qr/meta.ts`, `src/tools/qr/strings.ts`, `src/tools/qr/content.es.md`, `src/tools/qr/content.en.md`, `src/tools/qr/Qr.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `qrcode-generator` (Task 0); `utf8` de `src/lib/bytes.ts`; `downloadBlob` de `src/lib/download.ts`; `fill`; `t` (`led.idle`, `led.bad`, `tool.remember`); kit: `Segmented` (`main`), `Field`, `TextArea`, `Select`, `Toggle`, `Display`, `Led`, `Button` y `persistedInput`.
- Produces:
  - `type Ecl = 'L' | 'M' | 'Q' | 'H'`, `type WifiSecurity = 'WPA' | 'WEP' | 'nopass'`, `CAPACITY` (bytes de una versión 40: L 2953, M 2331, Q 1663, H 1273)
  - `toBinaryString(text)` (una letra por byte UTF-8), `qrMatrix(text, ecl): { ok: true; matrix } | { ok: false; error: 'too-long'; bytes; max }`, `toSvg(matrix, margin = 4)`, `svgDataUri(svg)`, `escapeWifi(s)`, `wifiPayload({ ssid, password, security, hidden })`, `normalizeUrl(input)`, `cellSize(modules, size)`
  - `meta: ToolMeta` (id `qr`, slugs `generador-codigo-qr` / `qr-code-generator`), `strings: Record<Locale, …>` y el componente `Qr` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 14: pestañas «Texto», «URL» y «WiFi» (`role="radio"`), `#qr-text`, `#qr-url`, `#qr-ssid`, `#qr-password`, `#qr-security`, `#qr-ecl`, `#qr-size`, `.display img` (la vista previa) y los botones «Descargar PNG» y «Descargar SVG».

**§8.2 (vinculante):** `qr` · gen · pestañas Texto · URL · WiFi. URL sin esquema → `https://` y aviso, validada con `new URL()`. WiFi `WIFI:T:<tipo>;S:<ssid>;P:<clave>;H:true;;` con `\ ; , : "` escapados, `P` omitida con `nopass` y `H` solo si está oculta. Corrección L/M/Q/H (M) y PNG de 256, 512 o 1024 px. `qrcode(0, ecl)` con el texto como cadena binaria UTF-8 (`addData(…, 'Byte')`); `qrMatrix`, `toSvg` con fondo `white` y un `<path>` `black`; vista previa como `<img>` de datos dentro de `Display`; PNG por canvas con `cellSize = floor(tamaño / (N + 8))`. Si no cabe: «El texto no cabe en un QR con corrección M (máximo 2331 bytes; tiene 2400). Acórtalo o baja la corrección a L.». Recordar ✓ para texto, URL y SSID; la contraseña WiFi nunca.

Cómo se cubre cada punto:
- UTF-8: tests `encodes text as UTF-8 bytes: ñ is the same QR as the bytes C3 B1` y `encodes emojis as their 4 UTF-8 bytes`.
- Capacidad: test `fills a version 40 code up to the byte capacity of each level` (cabe justo el máximo de L, M, Q y H y un byte más no) y `counts UTF-8 bytes, not characters, when it does not fit` (1 200 eñes = 2 400 bytes). El mensaje sale de `strings.ts`; con L ya elegida no propone bajarla.
- WiFi: tests `escapes \ ; , : and " in the SSID and password`, `builds the WIFI: payload` y `leaves out the password for open networks`.
- SVG sin hex: test `draws a white background and one black path, with the quiet zone`; el canvas del PNG usa `'white'` y `'black'`.
- URL: tests `adds https:// when the scheme is missing and says so` y `rejects what is not a URL`.
- Recordar: tres `persistedInput` (`qr`, `qr-url`, `qr-ssid`) con un único interruptor; la contraseña WiFi es un `$state`. La comprobación del Step 11 lo revisa en `localStorage`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l3-qr -b lote-3/qr   # desde el commit de la Task 0
cd ../devtools-l3-qr
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task (Segmented, Field, TextArea, Select, Toggle, Display, Led, Button) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real y dilo en el commit.

- [ ] **Step 2: Test (falla)**

`src/tools/qr/logic.test.ts`:
```ts
import qrcode from 'qrcode-generator';
import { describe, expect, it } from 'vitest';
import {
  CAPACITY,
  cellSize,
  escapeWifi,
  normalizeUrl,
  qrMatrix,
  toBinaryString,
  toSvg,
  wifiPayload,
} from './logic';

function rawMatrix(binary: string, ecl: 'L' | 'M' | 'Q' | 'H'): boolean[][] {
  const qr = qrcode(0, ecl);
  qr.addData(binary, 'Byte');
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}

describe('qrMatrix', () => {
  it('encodes text as UTF-8 bytes: ñ is the same QR as the bytes C3 B1', () => {
    expect(toBinaryString('ñ')).toBe('\xC3\xB1');
    const r = qrMatrix('ñ', 'M');
    expect(r.ok && r.matrix).toEqual(rawMatrix('\xC3\xB1', 'M'));
  });

  it('encodes emojis as their 4 UTF-8 bytes', () => {
    expect(toBinaryString('😀')).toBe('\xF0\x9F\x98\x80');
    expect(qrMatrix('😀', 'L').ok).toBe(true);
  });

  it('picks the smallest version: "hola" fits in 21×21', () => {
    const r = qrMatrix('hola', 'M');
    expect(r.ok && r.matrix.length).toBe(21);
  });

  it('fills a version 40 code up to the byte capacity of each level', () => {
    for (const ecl of ['L', 'M', 'Q', 'H'] as const) {
      const fits = qrMatrix('a'.repeat(CAPACITY[ecl]), ecl);
      expect(fits.ok && fits.matrix.length).toBe(177);
      expect(qrMatrix('a'.repeat(CAPACITY[ecl] + 1), ecl)).toEqual({
        ok: false,
        error: 'too-long',
        bytes: CAPACITY[ecl] + 1,
        max: CAPACITY[ecl],
      });
    }
  });

  it('counts UTF-8 bytes, not characters, when it does not fit', () => {
    expect(qrMatrix('ñ'.repeat(1200), 'M')).toMatchObject({ ok: false, bytes: 2400, max: 2331 });
  });
});

describe('toSvg', () => {
  it('draws a white background and one black path, with the quiet zone', () => {
    const svg = toSvg([
      [true, false],
      [false, true],
    ]);
    expect(svg).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" shape-rendering="crispEdges">' +
        '<rect width="10" height="10" fill="white"/><path d="M4 4h1v1h-1zM5 5h1v1h-1z" fill="black"/></svg>',
    );
  });
});

describe('WiFi', () => {
  it('escapes \\ ; , : and " in the SSID and password', () => {
    expect(escapeWifi('a;b,c:d"e\\f')).toBe('a\\;b\\,c\\:d\\"e\\\\f');
  });

  it('builds the WIFI: payload', () => {
    expect(
      wifiPayload({ ssid: 'Casa;2', password: 's3cret', security: 'WPA', hidden: false }),
    ).toBe('WIFI:T:WPA;S:Casa\\;2;P:s3cret;;');
    expect(wifiPayload({ ssid: 'Oculta', password: 'x', security: 'WEP', hidden: true })).toBe(
      'WIFI:T:WEP;S:Oculta;P:x;H:true;;',
    );
  });

  it('leaves out the password for open networks', () => {
    expect(
      wifiPayload({ ssid: 'Bar', password: 'ignorada', security: 'nopass', hidden: false }),
    ).toBe('WIFI:T:nopass;S:Bar;;');
  });
});

describe('normalizeUrl', () => {
  it('adds https:// when the scheme is missing and says so', () => {
    expect(normalizeUrl('example.com/a?b=1')).toEqual({
      url: 'https://example.com/a?b=1',
      added: true,
    });
    expect(normalizeUrl('http://example.com')).toEqual({ url: 'http://example.com', added: false });
    expect(normalizeUrl('mailto:ana@example.com')).toEqual({
      url: 'mailto:ana@example.com',
      added: false,
    });
  });

  it('rejects what is not a URL', () => {
    expect(normalizeUrl('hola mundo')).toBeNull();
    expect(normalizeUrl('   ')).toBeNull();
  });
});

describe('cellSize', () => {
  it('fits the matrix plus an 8-module margin in the chosen size', () => {
    expect(cellSize(21, 512)).toBe(17);
    expect(cellSize(177, 256)).toBe(1);
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/qr`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/qr/logic.ts`**

La conversión por defecto de `qrcode-generator` se queda con el byte bajo de cada unidad UTF-16 (comprobado en `dist/qrcode.mjs`): por eso `qrMatrix` le pasa una cadena con un carácter por byte UTF-8. Cuando el contenido no cabe, la librería lanza una cadena (no un `Error`), así que se captura cualquier cosa y se informa con los bytes UTF-8, no con los caracteres.

```ts
import qrcode from 'qrcode-generator';
import { utf8 } from '../../lib/bytes';

export type Ecl = 'L' | 'M' | 'Q' | 'H';
export type WifiSecurity = 'WPA' | 'WEP' | 'nopass';

/** Byte-mode capacity of a version 40 QR code for each error-correction level. */
export const CAPACITY: Record<Ecl, number> = { L: 2953, M: 2331, Q: 1663, H: 1273 };

export type QrResult =
  { ok: true; matrix: boolean[][] } | { ok: false; error: 'too-long'; bytes: number; max: number };

/**
 * The library's default conversion keeps only the low byte of each UTF-16 unit, which breaks
 * ñ and emojis. A "binary string" with one character per UTF-8 byte avoids it.
 */
export function toBinaryString(text: string): string {
  let out = '';
  for (const b of utf8(text)) out += String.fromCharCode(b);
  return out;
}

export function qrMatrix(text: string, ecl: Ecl): QrResult {
  const bytes = utf8(text).length;
  try {
    const qr = qrcode(0, ecl);
    qr.addData(toBinaryString(text), 'Byte');
    qr.make();
    const n = qr.getModuleCount();
    return {
      ok: true,
      matrix: Array.from({ length: n }, (_, r) =>
        Array.from({ length: n }, (_, c) => qr.isDark(r, c)),
      ),
    };
  } catch {
    // The library throws a plain string ("code length overflow") when the data does not fit.
    return { ok: false, error: 'too-long', bytes, max: CAPACITY[ecl] };
  }
}

/**
 * Black on white, always: QR readers need dark on light in every theme. The colours are
 * keywords, not hex, and the quiet zone (`margin` modules) is part of the image.
 */
export function toSvg(matrix: boolean[][], margin = 4): string {
  const n = matrix.length;
  const size = n + margin * 2;
  let d = '';
  matrix.forEach((row, r) =>
    row.forEach((dark, c) => {
      if (dark) d += `M${c + margin} ${r + margin}h1v1h-1z`;
    }),
  );
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">` +
    `<rect width="${size}" height="${size}" fill="white"/><path d="${d}" fill="black"/></svg>`
  );
}

export function svgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Backslash before \ ; , : and " inside the SSID and the password. */
export function escapeWifi(s: string): string {
  return s.replace(/([\\;,:"])/g, '\\$1');
}

export function wifiPayload(w: {
  ssid: string;
  password: string;
  security: WifiSecurity;
  hidden: boolean;
}): string {
  let out = `WIFI:T:${w.security};S:${escapeWifi(w.ssid)};`;
  if (w.security !== 'nopass') out += `P:${escapeWifi(w.password)};`;
  if (w.hidden) out += 'H:true;';
  return `${out};`;
}

/** Adds https:// when there is no scheme, and checks the result with new URL(). */
export function normalizeUrl(input: string): { url: string; added: boolean } | null {
  const s = input.trim();
  if (!s) return null;
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(s);
  const url = hasScheme ? s : `https://${s}`;
  try {
    const parsed = new URL(url);
    if (!hasScheme && !parsed.hostname.includes('.')) return null;
    return { url, added: !hasScheme };
  } catch {
    return null;
  }
}

/** Cell size for a PNG of `size` pixels: the matrix plus a 4-module margin on each side. */
export function cellSize(modules: number, size: number): number {
  return Math.max(1, Math.floor(size / (modules + 8)));
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/qr`
Expected: PASS (12 tests).

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/qr/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'qr',
  category: 'gen',
  icon: 'qr-code',
  slug: { es: 'generador-codigo-qr', en: 'qr-code-generator' },
  name: { es: 'Código QR', en: 'QR code' },
  title: {
    es: 'Generador de códigos QR: texto, URL y WiFi (PNG y SVG)',
    en: 'QR code generator: text, URL and WiFi (PNG, SVG)',
  },
  description: {
    es: 'Crea códigos QR de texto, enlaces o redes WiFi en tu navegador y descárgalos en PNG o SVG. Con tildes, emojis y el nivel de corrección que elijas.',
    en: 'Create QR codes for text, links or WiFi networks in your browser and download them as PNG or SVG. With accents, emojis and the error correction you choose.',
  },
  keywords: {
    es: ['generador qr', 'codigo qr', 'crear qr', 'qr wifi', 'qr de una url', 'qr svg'],
    en: [
      'qr code generator',
      'create qr code',
      'wifi qr code',
      'qr code for url',
      'qr svg',
      'qr png',
    ],
  },
  tabs: { es: ['Texto', 'URL', 'WiFi'], en: ['Text', 'URL', 'WiFi'] },
  faq: {
    es: [
      {
        q: '¿Qué nivel de corrección elijo?',
        a: 'M sirve para casi todo. Con H el código aguanta hasta un 30 % de daño o un logo encima, pero necesita más módulos y admite menos texto. L da el código más pequeño para textos largos.',
      },
      {
        q: '¿Se guarda la contraseña de mi WiFi?',
        a: 'No. El nombre de la red se puede recordar en este navegador, pero la contraseña nunca se guarda. Todo el código QR se genera en tu equipo.',
      },
    ],
    en: [
      {
        q: 'Which error correction level should I pick?',
        a: 'M works for almost everything. With H the code survives up to 30 % damage or a logo on top, but it needs more modules and holds less text. L gives the smallest code for long texts.',
      },
      {
        q: 'Is my WiFi password saved?',
        a: 'No. The network name can be remembered in this browser, but the password is never stored. The whole QR code is generated on your device.',
      },
    ],
  },
};
```

`src/tools/qr/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    kind: 'Contenido',
    text: 'Texto',
    textPlaceholder: 'Escribe el texto del código QR',
    url: 'URL',
    urlPlaceholder: 'example.com/pagina',
    urlAdded: 'No tenía esquema: se codifica como {url}',
    badUrl: 'No parece una URL. Escribe algo como example.com o https://example.com/ruta',
    ssid: 'Nombre de la red (SSID)',
    password: 'Contraseña',
    passwordHelp: 'La contraseña no se guarda nunca.',
    security: 'Seguridad',
    wpa: 'WPA/WPA2/WPA3',
    wep: 'WEP',
    nopass: 'Sin contraseña',
    hidden: 'Red oculta',
    ecl: 'Corrección de errores',
    eclL: 'L (7 %)',
    eclM: 'M (15 %)',
    eclQ: 'Q (25 %)',
    eclH: 'H (30 %)',
    size: 'Tamaño del PNG',
    result: 'Código QR',
    ready: '{n}×{n} módulos',
    empty: 'Escribe algo y aquí aparecerá el código QR.',
    alt: 'Código QR de: {text}',
    altWifi: 'Código QR de la red WiFi {ssid}',
    tooLong:
      'El texto no cabe en un QR con corrección {ecl} (máximo {max} bytes; tiene {bytes}). Acórtalo o baja la corrección a L.',
    tooLongL: 'El texto no cabe en un QR (máximo {max} bytes; tiene {bytes}). Acórtalo.',
    png: 'Descargar PNG',
    svg: 'Descargar SVG',
  },
  en: {
    kind: 'Content',
    text: 'Text',
    textPlaceholder: 'Type the text for the QR code',
    url: 'URL',
    urlPlaceholder: 'example.com/page',
    urlAdded: 'It had no scheme: it is encoded as {url}',
    badUrl:
      'That does not look like a URL. Type something like example.com or https://example.com/path',
    ssid: 'Network name (SSID)',
    password: 'Password',
    passwordHelp: 'The password is never saved.',
    security: 'Security',
    wpa: 'WPA/WPA2/WPA3',
    wep: 'WEP',
    nopass: 'No password',
    hidden: 'Hidden network',
    ecl: 'Error correction',
    eclL: 'L (7 %)',
    eclM: 'M (15 %)',
    eclQ: 'Q (25 %)',
    eclH: 'H (30 %)',
    size: 'PNG size',
    result: 'QR code',
    ready: '{n}×{n} modules',
    empty: 'Type something and the QR code will show up here.',
    alt: 'QR code for: {text}',
    altWifi: 'QR code for the WiFi network {ssid}',
    tooLong:
      'The text does not fit in a QR code with {ecl} correction (at most {max} bytes; it has {bytes}). Shorten it or lower the correction to L.',
    tooLongL:
      'The text does not fit in a QR code (at most {max} bytes; it has {bytes}). Shorten it.',
    png: 'Download PNG',
    svg: 'Download SVG',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/qr/content.es.md`:
```md
## Cómo funciona

Elige qué quieres codificar: un **texto** libre, una **URL** o los datos de una red **WiFi**. El código QR se genera en tu navegador mientras escribes y puedes descargarlo como PNG (256, 512 o 1024 píxeles) o como SVG, que se puede ampliar sin perder calidad para imprimirlo. Siempre es negro sobre blanco, con su margen, porque es lo que leen bien todas las cámaras.

El texto se codifica en UTF-8, así que las tildes, la ñ y los emojis se leen bien en cualquier móvil. Si una URL no lleva `https://`, se añade y se avisa. La corrección de errores (L, M, Q o H) decide cuánto daño aguanta el código: más corrección significa un código más denso y menos espacio para el texto.

## Códigos QR de WiFi

La pestaña WiFi crea el código que los móviles reconocen para conectarse sin escribir la contraseña: `WIFI:T:WPA;S:red;P:clave;;`. Los caracteres especiales del nombre y de la contraseña se escapan como pide el formato. El nombre de la red se puede recordar en este navegador, pero **la contraseña no se guarda nunca**.
```

`src/tools/qr/content.en.md`:
```md
## How it works

Choose what to encode: free **text**, a **URL** or the details of a **WiFi** network. The QR code is generated in your browser as you type, and you can download it as PNG (256, 512 or 1024 pixels) or as SVG, which scales without losing quality for print. It is always black on white, with its quiet zone, because that is what every camera reads well.

Text is encoded as UTF-8, so accents, ñ and emojis read correctly on any phone. If a URL has no `https://`, it is added and you are told. Error correction (L, M, Q or H) sets how much damage the code survives: more correction means a denser code and less room for text.

## WiFi QR codes

The WiFi tab builds the code phones recognise to join a network without typing the password: `WIFI:T:WPA;S:network;P:secret;;`. Special characters in the name and password are escaped as the format requires. The network name can be remembered in this browser, but **the password is never saved**.
```

- [ ] **Step 8: `src/tools/qr/Qr.svelte`**

El PNG se pinta en un `<canvas>` fuera del DOM del tamaño exacto elegido, con el código centrado y su margen blanco. La vista previa es el mismo SVG como `data:` dentro de `Display`. El `alt` de la pestaña WiFi nombra la red, nunca la contraseña.

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { downloadBlob } from '../../lib/download';
  import Button from '../../ui/Button.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    cellSize,
    normalizeUrl,
    qrMatrix,
    svgDataUri,
    toSvg,
    wifiPayload,
    type Ecl,
    type WifiSecurity,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const text = persistedInput('qr', '', remember);
  const urlInput = persistedInput('qr-url', '', remember);
  const ssid = persistedInput('qr-ssid', '', remember);

  let tab = $state<'text' | 'url' | 'wifi'>('text');
  // Never persisted: the WiFi password only lives in memory.
  let wifiPassword = $state('');
  let security = $state<WifiSecurity>('WPA');
  let hidden = $state(false);
  let ecl = $state<Ecl>('M');
  let size = $state<'256' | '512' | '1024'>('512');

  const url = $derived(urlInput.value.trim() ? normalizeUrl(urlInput.value) : null);
  const payload = $derived.by(() => {
    if (tab === 'text') return text.value;
    if (tab === 'url') return url?.url ?? '';
    if (!ssid.value) return '';
    return wifiPayload({ ssid: ssid.value, password: wifiPassword, security, hidden });
  });
  const result = $derived(payload ? qrMatrix(payload, ecl) : null);
  const svg = $derived(result?.ok ? toSvg(result.matrix) : '');
  const alt = $derived(
    tab === 'wifi'
      ? fill(s.altWifi, { ssid: ssid.value })
      : fill(s.alt, { text: payload.length > 80 ? `${payload.slice(0, 79)}…` : payload }),
  );
  const tooLong = $derived(
    result && !result.ok
      ? fill(ecl === 'L' ? s.tooLongL : s.tooLong, { ecl, max: result.max, bytes: result.bytes })
      : '',
  );

  function downloadSvg() {
    downloadBlob(svg, 'qr.svg', 'image/svg+xml');
  }

  function downloadPng() {
    if (!result?.ok) return;
    const px = Number(size);
    const n = result.matrix.length;
    const cell = cellSize(n, px);
    const offset = Math.floor((px - cell * n) / 2);
    const canvas = document.createElement('canvas');
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Keywords, not hex: a QR reader needs dark on light whatever the site theme.
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, px, px);
    ctx.fillStyle = 'black';
    result.matrix.forEach((row, r) =>
      row.forEach((dark, c) => {
        if (dark) ctx.fillRect(offset + c * cell, offset + r * cell, cell, cell);
      }),
    );
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, 'qr.png');
    }, 'image/png');
  }
</script>

<div class="stack">
  <Segmented
    main
    label={s.kind}
    options={[
      { value: 'text', label: meta.tabs![locale][0] },
      { value: 'url', label: meta.tabs![locale][1] },
      { value: 'wifi', label: meta.tabs![locale][2] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    {#if tab === 'text'}
      <Field id="qr-text" label={s.text}>
        {#snippet children({ describedby })}
          <TextArea
            id="qr-text"
            bind:value={text.value}
            placeholder={s.textPlaceholder}
            {describedby}
            mono={false}
            rows={4}
          />
        {/snippet}
      </Field>
    {:else if tab === 'url'}
      <Field
        id="qr-url"
        label={s.url}
        help={url?.added ? fill(s.urlAdded, { url: url.url }) : undefined}
        error={urlInput.value.trim() && !url ? s.badUrl : undefined}
      >
        {#snippet children({ describedby })}
          <input
            id="qr-url"
            class="control mono"
            type="url"
            inputmode="url"
            bind:value={urlInput.value}
            placeholder={s.urlPlaceholder}
            aria-describedby={describedby}
            aria-invalid={!!urlInput.value.trim() && !url}
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
          />
        {/snippet}
      </Field>
    {:else}
      <div class="wifi">
        <Field id="qr-ssid" label={s.ssid}>
          {#snippet children({ describedby })}
            <input
              id="qr-ssid"
              class="control"
              bind:value={ssid.value}
              aria-describedby={describedby}
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
            />
          {/snippet}
        </Field>
        {#if security !== 'nopass'}
          <Field id="qr-password" label={s.password} help={s.passwordHelp}>
            {#snippet children({ describedby })}
              <input
                id="qr-password"
                class="control"
                type="password"
                bind:value={wifiPassword}
                aria-describedby={describedby}
                autocomplete="off"
              />
            {/snippet}
          </Field>
        {/if}
        <Field id="qr-security" label={s.security}>
          {#snippet children({ describedby })}
            <Select
              id="qr-security"
              bind:value={security}
              {describedby}
              options={[
                { value: 'WPA', label: s.wpa },
                { value: 'WEP', label: s.wep },
                { value: 'nopass', label: s.nopass },
              ]}
            />
          {/snippet}
        </Field>
        <Toggle bind:checked={hidden} label={s.hidden} />
      </div>
    {/if}

    <div class="row">
      <Field id="qr-ecl" label={s.ecl}>
        {#snippet children({ describedby })}
          <Select
            id="qr-ecl"
            bind:value={ecl}
            {describedby}
            options={[
              { value: 'L', label: s.eclL },
              { value: 'M', label: s.eclM },
              { value: 'Q', label: s.eclQ },
              { value: 'H', label: s.eclH },
            ]}
          />
        {/snippet}
      </Field>
      <Field id="qr-size" label={s.size}>
        {#snippet children({ describedby })}
          <Select
            id="qr-size"
            bind:value={size}
            {describedby}
            options={[
              { value: '256', label: '256 px' },
              { value: '512', label: '512 px' },
              { value: '1024', label: '1024 px' },
            ]}
          />
        {/snippet}
      </Field>
    </div>

    <Display live label={s.result}>
      {#snippet head()}
        <Led
          state={!result ? 'idle' : result.ok ? 'ok' : 'bad'}
          label={!result
            ? t(locale, 'led.idle')
            : result.ok
              ? fill(s.ready, { n: result.matrix.length })
              : t(locale, 'led.bad')}
        />
      {/snippet}
      {#if svg}
        <img class="qr" src={svgDataUri(svg)} {alt} width="256" height="256" />
      {:else}
        <p class="display-note">{tooLong || s.empty}</p>
      {/if}
    </Display>

    <div class="row">
      <Button variant="secondary" disabled={!svg} onclick={downloadPng}>{s.png}</Button>
      <Button variant="secondary" disabled={!svg} onclick={downloadSvg}>{s.svg}</Button>
    </div>
    <Toggle
      bind:checked={
        () => text.remember,
        (v) => {
          text.remember = v;
          urlInput.remember = v;
          ssid.remember = v;
        }
      }
      label={t(locale, 'tool.remember')}
    />
  </div>
</div>

<style>
  .wifi {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    align-items: end;
  }
  .qr {
    display: block;
    width: min(256px, 100%);
    height: auto;
    align-self: center;
    /* The SVG brings its own white quiet zone; this only rounds the corners on the display. */
    border-radius: 4px;
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as qr } from './qr/meta';
```
→
```ts
import { meta as qr } from './qr/meta';
```
y
```ts
  // qr,
```
→
```ts
  qr,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Qr from '../tools/qr/Qr.svelte';
```
→
```astro
import Qr from '../tools/qr/Qr.svelte';
```
y
```astro
{/* {id === 'qr' && <Qr client:load locale={locale} />} */}
```
→
```astro
{id === 'qr' && <Qr client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/generador-codigo-qr.html dist/en/qr-code-generator.html
grep -l 'code length overflow' dist/_astro/*.js
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `qr` y sus dos `content.*.md`), y existen las dos páginas. Cada `grep -l` lista **un solo archivo**, `dist/_astro/Qr.<hash>.js`: la librería está en el chunk de esta herramienta y en ningún otro. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador (desechable, puerto 4672)**

Crea `.check-qr.mjs` en la raíz del worktree:
```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4672';
const browser = await chromium.launch();
const page = await browser.newPage({ acceptDownloads: true });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));

await page.goto(`${BASE}/es/generador-codigo-qr`);
await page.locator('#qr-text').fill('hola');
const img = page.locator('.display img');
assert.ok(await img.isVisible());
assert.equal(await img.getAttribute('alt'), 'Código QR de: hola');

let download = page.waitForEvent('download');
await page.getByRole('button', { name: 'Descargar PNG' }).click();
const png = await download;
assert.equal(png.suggestedFilename(), 'qr.png');
assert.equal(readFileSync(await png.path()).subarray(1, 4).toString(), 'PNG');
download = page.waitForEvent('download');
await page.getByRole('button', { name: 'Descargar SVG' }).click();
assert.equal((await download).suggestedFilename(), 'qr.svg');

await page.getByRole('radio', { name: 'WiFi', exact: true }).click();
await page.locator('#qr-ssid').fill('Casa');
await page.locator('#qr-password').fill('s3cret');
await page.waitForTimeout(600);
const stored = await page.evaluate(() => Object.values(localStorage));
assert.ok(stored.includes('Casa'), 'the SSID is remembered');
assert.ok(!stored.some((v) => v.includes('s3cret')), 'the WiFi password is never stored');

await page.getByRole('radio', { name: 'Texto', exact: true }).click();
await page.locator('#qr-text').fill('ñ'.repeat(1200));
assert.match(await page.locator('.display-note').innerText(), /máximo 2331 bytes; tiene 2400/);

await browser.close();
assert.deepEqual(errors, []);
console.log('OK qr');
```

Run:
```bash
./node_modules/.bin/astro preview --port 4672 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
until curl -sf -o /dev/null http://localhost:4672/es; do sleep 0.5; done
node .check-qr.mjs
kill $PREVIEW
rm .check-qr.mjs
```
Expected: la última línea es `OK qr` y no hay ningún error de página. Si falla un paso, arregla el componente, no la comprobación.

A mano, con `pnpm preview`, en `/es/generador-codigo-qr` y `/en/qr-code-generator`, primero en el tema claro y luego en oscuro y terminal, a 390 px y a 1280 px de ancho:
1. Texto `hola` → aparece el QR (21×21 módulos); léelo con el móvil.
2. Texto `¡Canción ñ 😀!` → el móvil lee exactamente eso, con tildes y emoji.
3. URL `example.com` → aviso «No tenía esquema: se codifica como https://example.com».
4. WiFi con SSID `Casa;2`, contraseña y WPA → el móvil ofrece conectarse a `Casa;2`. Recarga: el SSID sigue, la contraseña no.
5. «Descargar PNG» a 1024 px → imagen de 1024×1024 con el QR centrado; «Descargar SVG» → se amplía sin pixelarse. En los tres temas el QR es negro sobre blanco.

- [ ] **Step 12: Commit**

```bash
git add src/tools/qr src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (tampoco `.check-qr.mjs`, que ya se borró). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(qr): códigos QR de texto, URL y WiFi con descarga en PNG y SVG"
```

---

### Task 3: Slug: sin tildes ni símbolos, con separador y longitud máxima

**Files:**
- Create: `src/tools/slug/logic.ts`, `src/tools/slug/logic.test.ts`, `src/tools/slug/meta.ts`, `src/tools/slug/strings.ts`, `src/tools/slug/content.es.md`, `src/tools/slug/content.en.md`, `src/tools/slug/Slug.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `fill`; `t` (`led.idle`, `ui.clear`, `tool.remember`); kit: `Field`, `TextArea`, `Segmented`, `Toggle`, `NumberInput`, `Display`, `Led`, `CopyButton`, `Button` y `persistedInput`.
- Produces:
  - `type Separator = '-' | '_' | '.'`, `interface SlugOptions { separator; lowercase; ampersand; maxLength: number | null; locale }`, `interface SlugLine { input; slug }`
  - `slugify(text, opts): string` y `slugifyLines(text, opts): SlugLine[]` (una por línea no vacía)
  - `meta: ToolMeta` (id `slug`, slugs `generador-slug` / `slug-generator`), `strings: Record<Locale, …>` y el componente `Slug` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 14: `#slug-input`, `.panel .slug` (un slug por línea) y `#slug-max` (solo con «Limitar la longitud»).

**§8.3 (vinculante):** `slug` · gen · sin pestañas. Un `TextArea`, un slug por línea. Mapa previo `ß→ss`, `æ→ae`, `œ→oe`, `ø→o`, `ł→l`, `đ→d`, `ð→d`, `þ→th`; «& como y/and» (activado); `NFKD` y fuera `\p{M}`; minúsculas (activado); cada tramo fuera de `[A-Za-z0-9]` → separador; sin separadores en los extremos; longitud máxima cortando en el último separador (salvo que la primera palabra ya la supere). Separador `-` · `_` · `.` (Segmented secundario). Tests: «¡Hola, Mundo! Año 2026» → `hola-mundo-ano-2026`, «Straße & Co» → `strasse-y-co`, «Ærøskøbing» → `aeroskobing`, emojis fuera, «東京» → vacío con «No queda ningún carácter latino: el slug estaría vacío». Recordar ✓.

Cómo se cubre cada punto:
- Los ejemplos de la ficha: test `matches the spec examples`, más `drops emojis and symbols` y `gives an empty slug when no Latin character is left` (el mensaje lo pinta el componente en la fila de ese texto).
- `&`: test `uses "and" for & in English, or drops it when the toggle is off`.
- Letras sin descomposición: test `turns letters that NFKD does not split into plain letters` (Ł, Þ, Œ, Đ). Las mayúsculas se mapean a mayúsculas (`Æ→AE`), que con «Minúsculas» activado da lo mismo que la ficha.
- Separador y mayúsculas: test `keeps case and uses the chosen separator`.
- Longitud máxima: test `cuts at the last separator before the limit, without splitting words`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l3-slug -b lote-3/slug   # desde el commit de la Task 0
cd ../devtools-l3-slug
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task (Field, TextArea, Segmented, Toggle, NumberInput, Display, Led, CopyButton, Button) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real y dilo en el commit.

- [ ] **Step 2: Test (falla)**

`src/tools/slug/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { slugify, slugifyLines, type SlugOptions } from './logic';

const es: SlugOptions = {
  separator: '-',
  lowercase: true,
  ampersand: true,
  maxLength: null,
  locale: 'es',
};

describe('slugify', () => {
  it('matches the spec examples', () => {
    expect(slugify('¡Hola, Mundo! Año 2026', es)).toBe('hola-mundo-ano-2026');
    expect(slugify('Straße & Co', es)).toBe('strasse-y-co');
    expect(slugify('Ærøskøbing', es)).toBe('aeroskobing');
  });

  it('uses "and" for & in English, or drops it when the toggle is off', () => {
    expect(slugify('Straße & Co', { ...es, locale: 'en' })).toBe('strasse-and-co');
    expect(slugify('Straße & Co', { ...es, ampersand: false })).toBe('strasse-co');
  });

  it('turns letters that NFKD does not split into plain letters', () => {
    expect(slugify('Łódź, Þórr, Œuvre, Đakovo', es)).toBe('lodz-thorr-oeuvre-dakovo');
  });

  it('drops emojis and symbols', () => {
    expect(slugify('Café ☕ con 🎉 amigos!!', es)).toBe('cafe-con-amigos');
  });

  it('gives an empty slug when no Latin character is left', () => {
    expect(slugify('東京', es)).toBe('');
    expect(slugify('🎉🎉', es)).toBe('');
  });

  it('keeps case and uses the chosen separator', () => {
    expect(slugify('Mi Título Largo', { ...es, lowercase: false, separator: '_' })).toBe(
      'Mi_Titulo_Largo',
    );
    expect(slugify('  versión 1.2 final ', { ...es, separator: '.' })).toBe('version.1.2.final');
  });

  it('cuts at the last separator before the limit, without splitting words', () => {
    const opts = { ...es, maxLength: 12 };
    expect(slugify('hola mundo cruel', opts)).toBe('hola-mundo');
    expect(slugify('hola mundo', { ...es, maxLength: 10 })).toBe('hola-mundo');
    expect(slugify('hola mundo cruel', { ...es, maxLength: 10 })).toBe('hola-mundo');
    expect(slugify('supercalifragilistico es largo', { ...es, maxLength: 8 })).toBe('supercal');
  });
});

describe('slugifyLines', () => {
  it('gives one slug per non-empty line', () => {
    expect(slugifyLines('Primera línea\n\n  \nSegunda & última\r\n', es)).toEqual([
      { input: 'Primera línea', slug: 'primera-linea' },
      { input: 'Segunda & última', slug: 'segunda-y-ultima' },
    ]);
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/slug`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/slug/logic.ts`**

Sin librerías: el mapa previo cubre las letras que `NFKD` no descompone en letra base + marca. El corte por longitud mira primero si el límite cae justo antes de un separador (la palabra entera cabe).

```ts
import type { Locale } from '../types';

export type Separator = '-' | '_' | '.';

export interface SlugOptions {
  separator: Separator;
  lowercase: boolean;
  /** & → " y " (es) or " and " (en). */
  ampersand: boolean;
  /** Cut at a word boundary; null for no limit. */
  maxLength: number | null;
  locale: Locale;
}

export interface SlugLine {
  input: string;
  slug: string;
}

// Letters that NFKD does not split into a base letter plus accents.
const PRE_MAP: Record<string, string> = {
  ß: 'ss',
  æ: 'ae',
  Æ: 'AE',
  œ: 'oe',
  Œ: 'OE',
  ø: 'o',
  Ø: 'O',
  ł: 'l',
  Ł: 'L',
  đ: 'd',
  Đ: 'D',
  ð: 'd',
  Ð: 'D',
  þ: 'th',
  Þ: 'Th',
};

const AND: Record<Locale, string> = { es: ' y ', en: ' and ' };

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cut(slug: string, max: number, sep: Separator): string {
  if (slug.length <= max) return slug;
  // The limit falls right before a separator: the whole word fits.
  if (slug[max] === sep) return slug.slice(0, max);
  const head = slug.slice(0, max);
  const last = head.lastIndexOf(sep);
  // A first word longer than the limit is the only case where a word gets split.
  return last > 0 ? head.slice(0, last) : head;
}

export function slugify(text: string, opts: SlugOptions): string {
  let s = [...text].map((c) => PRE_MAP[c] ?? c).join('');
  if (opts.ampersand) s = s.replace(/&/g, AND[opts.locale]);
  s = s.normalize('NFKD').replace(/\p{M}/gu, '');
  if (opts.lowercase) s = s.toLowerCase();
  const sep = opts.separator;
  s = s.replace(/[^A-Za-z0-9]+/g, sep);
  const edges = new RegExp(`^${escapeRegExp(sep)}+|${escapeRegExp(sep)}+$`, 'g');
  s = s.replace(edges, '');
  if (opts.maxLength !== null && opts.maxLength > 0) s = cut(s, opts.maxLength, sep);
  return s;
}

/** One slug per non-empty line. */
export function slugifyLines(text: string, opts: SlugOptions): SlugLine[] {
  return text
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .map((input) => ({ input, slug: slugify(input, opts) }));
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/slug`
Expected: PASS (8 tests).

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/slug/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'slug',
  category: 'gen',
  icon: 'link-2',
  slug: { es: 'generador-slug', en: 'slug-generator' },
  name: { es: 'Slug', en: 'Slug' },
  title: {
    es: 'Generador de slugs para URL: quita tildes y espacios',
    en: 'URL slug generator: remove accents and spaces',
  },
  description: {
    es: 'Convierte títulos en slugs limpios para URL: sin tildes, eñes ni símbolos, con el separador que elijas y sin cortar palabras. Una línea, un slug.',
    en: 'Turn titles into clean URL slugs: no accents or symbols, with the separator you choose and without splitting words. One line, one slug.',
  },
  keywords: {
    es: [
      'generador de slug',
      'slug url',
      'quitar tildes',
      'url amigable',
      'convertir titulo a url',
      'slugify',
    ],
    en: [
      'slug generator',
      'url slug',
      'slugify',
      'remove accents',
      'seo friendly url',
      'title to url',
    ],
  },
};
```

`src/tools/slug/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    input: 'Textos (uno por línea)',
    placeholder: '¡Hola, Mundo! Año 2026\nStraße & Co',
    separator: 'Separador',
    lowercase: 'Minúsculas',
    ampersand: '& como «y»',
    limit: 'Limitar la longitud',
    maxLength: 'Longitud máxima',
    result: 'Slugs',
    count: '{n} slugs',
    one: '1 slug',
    empty: 'Escribe un título por línea y aquí verás su slug.',
    noLatin: 'No queda ningún carácter latino: el slug estaría vacío',
    copyAll: 'Copiar slugs',
    copyOne: 'Copiar {slug}',
  },
  en: {
    input: 'Texts (one per line)',
    placeholder: 'Hello, World! Year 2026\nStraße & Co',
    separator: 'Separator',
    lowercase: 'Lowercase',
    ampersand: '& as “and”',
    limit: 'Limit the length',
    maxLength: 'Maximum length',
    result: 'Slugs',
    count: '{n} slugs',
    one: '1 slug',
    empty: 'Type one title per line and you will see its slug here.',
    noLatin: 'No Latin character is left: the slug would be empty',
    copyAll: 'Copy slugs',
    copyOne: 'Copy {slug}',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/slug/content.es.md`:
```md
## Cómo funciona

Escribe o pega uno o varios títulos, uno por línea, y obtendrás su slug: la parte de la URL que identifica una página, como `mi-primer-articulo`. Se quitan las tildes y las diéresis (`á` → `a`, `ñ` → `n`), las letras especiales se escriben con letras normales (`ß` → `ss`, `æ` → `ae`, `ø` → `o`) y todo lo que no es una letra o una cifra, incluidos los emojis, se convierte en el separador.

Con «& como y», `Pérez & Hijos` da `perez-y-hijos` en lugar de `perez-hijos`. Puedes elegir el separador (`-`, `_` o `.`) y mantener las mayúsculas si tu sistema las distingue.

## Longitud máxima

Los slugs cortos se leen y se comparten mejor. Si fijas una longitud máxima, el slug se corta en el último separador antes del límite, sin partir palabras, salvo que la primera palabra ya sea más larga. Si un texto no tiene ninguna letra latina (por ejemplo, 東京), el slug quedaría vacío y se avisa.
```

`src/tools/slug/content.en.md`:
```md
## How it works

Type or paste one or more titles, one per line, and get their slug: the part of the URL that names a page, such as `my-first-post`. Accents and diaereses are removed (`á` → `a`, `ñ` → `n`), special letters are spelled with plain ones (`ß` → `ss`, `æ` → `ae`, `ø` → `o`) and everything that is not a letter or a digit, emojis included, becomes the separator.

With “& as and”, `Smith & Sons` gives `smith-and-sons` instead of `smith-sons`. You can pick the separator (`-`, `_` or `.`) and keep capital letters if your system tells them apart.

## Maximum length

Short slugs are easier to read and share. With a maximum length, the slug is cut at the last separator before the limit, without splitting words, unless the first word is already longer. If a text has no Latin letters at all (for example, 東京), the slug would be empty and you are told so.
```

- [ ] **Step 8: `src/tools/slug/Slug.svelte`**

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { slugifyLines, type Separator } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('slug', '', meta.rememberInput ?? true);

  let separator = $state<Separator>('-');
  let lowercase = $state(true);
  let ampersand = $state(true);
  let limit = $state(false);
  let maxLength = $state(60);

  const lines = $derived(
    slugifyLines(input.value, {
      separator,
      lowercase,
      ampersand,
      maxLength: limit ? Math.max(1, Math.round(maxLength) || 60) : null,
      locale,
    }),
  );
  const slugs = $derived(lines.map((l) => l.slug).filter(Boolean));
</script>

<div class="panel">
  <Field id="slug-input" label={s.input}>
    {#snippet children({ describedby })}
      <TextArea
        id="slug-input"
        bind:value={input.value}
        placeholder={s.placeholder}
        {describedby}
        mono={false}
        rows={5}
      />
    {/snippet}
  </Field>

  <div class="row">
    <Segmented
      label={s.separator}
      options={[
        { value: '-', label: '-' },
        { value: '_', label: '_' },
        { value: '.', label: '.' },
      ]}
      bind:value={separator}
    />
    <Toggle bind:checked={lowercase} label={s.lowercase} />
    <Toggle bind:checked={ampersand} label={s.ampersand} />
    <Toggle bind:checked={limit} label={s.limit} />
    {#if limit}
      <Field id="slug-max" label={s.maxLength}>
        {#snippet children({ describedby })}
          <NumberInput id="slug-max" bind:value={maxLength} min={1} max={200} {describedby} />
        {/snippet}
      </Field>
    {/if}
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={lines.length === 0 ? 'idle' : slugs.length === lines.length ? 'ok' : 'bad'}
        label={lines.length === 0
          ? t(locale, 'led.idle')
          : slugs.length === 1
            ? s.one
            : fill(s.count, { n: slugs.length })}
      />
    {/snippet}
    {#if lines.length}
      <ul class="display-rows slugs">
        {#each lines as line, i (i)}
          <li class="display-row">
            {#if line.slug}
              <span class="slug">{line.slug}</span>
              <CopyButton
                value={line.slug}
                {locale}
                compact
                ariaLabel={fill(s.copyOne, { slug: line.slug })}
              />
            {:else}
              <span class="empty-slug">{s.noLatin}</span>
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <p class="display-note">{s.empty}</p>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={slugs.join('\n')} {locale} label={s.copyAll} />
    <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}
      >{t(locale, 'ui.clear')}</Button
    >
  </div>
  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .slugs {
    list-style: none;
    padding: 0;
  }
  .slug {
    min-width: 0;
  }
  /* Inside the display, which is dark in every theme: --bad passes there, --bad-text does not. */
  .empty-slug {
    font: 600 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--bad);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as slug } from './slug/meta';
```
→
```ts
import { meta as slug } from './slug/meta';
```
y
```ts
  // slug,
```
→
```ts
  slug,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Slug from '../tools/slug/Slug.svelte';
```
→
```astro
import Slug from '../tools/slug/Slug.svelte';
```
y
```astro
{/* {id === 'slug' && <Slug client:load locale={locale} />} */}
```
→
```astro
{id === 'slug' && <Slug client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/generador-slug.html dist/en/slug-generator.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `slug` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador (desechable, puerto 4673)**

Crea `.check-slug.mjs` en la raíz del worktree:
```js
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4673';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));

await page.goto(`${BASE}/es/generador-slug`);
await page.locator('#slug-input').fill('¡Hola, Mundo! Año 2026\n東京');
assert.equal(await page.locator('.slug').first().innerText(), 'hola-mundo-ano-2026');
assert.match(await page.locator('.display').innerText(), /No queda ningún carácter latino/);
await page.getByRole('radio', { name: '_', exact: true }).click();
assert.equal(await page.locator('.slug').first().innerText(), 'hola_mundo_ano_2026');

await browser.close();
assert.deepEqual(errors, []);
console.log('OK slug');
```

Run:
```bash
./node_modules/.bin/astro preview --port 4673 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
until curl -sf -o /dev/null http://localhost:4673/es; do sleep 0.5; done
node .check-slug.mjs
kill $PREVIEW
rm .check-slug.mjs
```
Expected: la última línea es `OK slug` y no hay ningún error de página. Si falla un paso, arregla el componente, no la comprobación.

A mano, con `pnpm preview`, en `/es/generador-slug` y `/en/slug-generator`, primero en el tema claro y luego en oscuro y terminal, a 390 px y a 1280 px de ancho:
1. `¡Hola, Mundo! Año 2026` → `hola-mundo-ano-2026`; en `/en/slug-generator`, `Straße & Co` → `strasse-and-co`.
2. Separador `_` → `hola_mundo_ano_2026`; sin «Minúsculas» → `Hola_Mundo_Ano_2026`.
3. «Limitar la longitud» a 10 con `hola mundo cruel` → `hola-mundo`.
4. Varias líneas, una en japonés → esa fila dice «No queda ningún carácter latino…» y las demás tienen su «Copiar»; `c` copia solo los slugs no vacíos.

- [ ] **Step 12: Commit**

```bash
git add src/tools/slug src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (tampoco `.check-slug.mjs`, que ya se borró). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(slug): slugs para URL sin tildes, con separador y longitud máxima"
```

---

### Task 4: JSON ↔ YAML ↔ CSV: detección de formato y separador, anclas de YAML y CSV aplanado

**Files:**
- Create: `src/tools/data-convert/logic.ts`, `src/tools/data-convert/logic.test.ts`, `src/tools/data-convert/meta.ts`, `src/tools/data-convert/strings.ts`, `src/tools/data-convert/content.es.md`, `src/tools/data-convert/content.en.md`, `src/tools/data-convert/DataConvert.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `yaml` (Task 0); `parseCsv`, `toCsv` y `type CsvWarning` de `src/lib/csv.ts`; `parseJson` de `src/tools/json/logic.ts`; `downloadBlob`; `fill`; `t` (`led.idle`, `ui.download`, `ui.clear`, `tool.remember`); kit: `Field`, `TextArea`, `Select`, `Segmented`, `Toggle`, `Display`, `Led`, `CopyButton`, `Button` y `persistedInput`.
- Produces:
  - `type Format = 'json' | 'yaml' | 'csv'`, `type InputFormat = 'auto' | Format`, `type Sep`, `interface CsvReadOptions { header; detectTypes }`, `type ReadResult`, `type WriteResult`, `DEBOUNCE_THRESHOLD = 100_000`
  - `detectFormat(text)`, `readInput(text, format, csvOptions): ReadResult`, `toCsvText(value, sep): WriteResult`, `writeOutput(value, format, sep): WriteResult`, `shouldDebounce(text)`
  - `meta: ToolMeta` (id `data-convert`, slugs `conversor-json-yaml-csv` / `json-yaml-csv-converter`), `strings: Record<Locale, …>` y el componente `DataConvert` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 14: `#data-convert-input`, `#data-convert-from`, las opciones de salida «JSON», «YAML» y «CSV» (`role="radio"`), `#data-convert-sep`, `.display-code` y el botón «Descargar».

**§8.4 (vinculante):** `data-convert` · data · sin pestañas. Entrada Automático/JSON/YAML/CSV (`Select`) y salida JSON · YAML · CSV (Segmented secundario). Detección: `{`/`[` que parsea → JSON; primera línea con `,` `;` o tabulador y dos filas con el mismo número de campos → CSV; si no, YAML; se muestra «Detectado: CSV (separador ;)». JSON con `parseJson`; YAML con `parseAllDocuments` (varios documentos → array con nota; error «Error en la línea 3, columna 5: …»); CSV con `parseCsv`, «La primera fila es la cabecera» (activado) y «Detectar números y booleanos» (desactivado: `^-?(0|[1-9]\d*)(\.\d+)?$`, `true`/`false`, vacío → `null`). Escritura: JSON con sangría 2, YAML con `indent: 2, lineWidth: 0`, CSV con `toCsv` y separador elegible (unión de claves en orden, objetos aplanados con puntos, arrays como JSON, `null` vacío; si no es una tabla, «Para CSV hace falta una lista de objetos, por ejemplo [{"a": 1}]»; nota fija de tipos). `Display code`, `CopyButton main`, «Descargar» (`datos.json`/`.yaml`/`.csv`) y debounce de 150 ms desde 100 KB. Recordar ✓.

Cómo se cubre cada punto:
- Detección en el orden de la ficha: test `follows the spec order: JSON, then CSV, then YAML` (incluye un `{a: 1}` de YAML y una línea con una coma que no es CSV).
- CSV: tests `reads CSV with a header row into objects (e2e example)`, `reads CSV without header as arrays, detecting types when asked` (con `007` como texto) y `reports the CSV line of an unclosed quote`; los avisos de columnas se traducen en el componente.
- YAML: tests `reads YAML, resolving anchors, aliases and merge keys`, `reads several YAML documents as an array` y `gives YAML errors with line and column`. Las claves de fusión (`<<`) se activan con `merge: true`: es YAML 1.1, pero Docker Compose y GitHub Actions las usan a diario.
- Escritura: tests `writes JSON with 2 spaces and YAML without line wrapping`, `writes CSV with the union of keys, flattened objects and JSON for arrays`, `takes a single object as one row and arrays of arrays as they are`, `refuses what is not a table` y `flags keys that already contain dots`.
- Ida y vuelta con comillas, saltos de línea y `;`: test `round-trips CSV with quotes, line breaks and ; inside fields`.
- Descarga: `datos.json`, `datos.yaml` o `datos.csv` (en inglés, `data.*`).

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l3-data-convert -b lote-3/data-convert   # desde el commit de la Task 0
cd ../devtools-l3-data-convert
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task (Field, TextArea, Select, Segmented, Toggle, Display, Led, CopyButton, Button) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real y dilo en el commit.

- [ ] **Step 2: Test (falla)**

`src/tools/data-convert/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { parseCsv } from '../../lib/csv';
import { detectFormat, readInput, toCsvText, writeOutput } from './logic';

const csvOpts = { header: true, detectTypes: false };
// toCsv (lote 1) separates rows with CRLF; whether it ends with one does not matter here.
const lines = (r: ReturnType<typeof toCsvText>) =>
  r.ok ? r.text.replace(/\r\n$/, '').split('\r\n') : null;

describe('detectFormat', () => {
  it('follows the spec order: JSON, then CSV, then YAML', () => {
    expect(detectFormat('{"a": 1}')).toEqual({ format: 'json' });
    expect(detectFormat('[1, 2]')).toEqual({ format: 'json' });
    expect(detectFormat('nombre;edad\nAna;34')).toEqual({ format: 'csv', sep: ';' });
    expect(detectFormat('a\tb\n1\t2\n')).toEqual({ format: 'csv', sep: '\t' });
    expect(detectFormat('a: 1\nb: [1, 2]')).toEqual({ format: 'yaml' });
    // YAML flow mappings start like JSON but do not parse as JSON.
    expect(detectFormat('{a: 1}')).toEqual({ format: 'yaml' });
    // One comma but no second row with the same width: not CSV.
    expect(detectFormat('lista: a, b\notra: c')).toEqual({ format: 'yaml' });
  });
});

describe('readInput', () => {
  it('reads CSV with a header row into objects (e2e example)', () => {
    expect(readInput('nombre;edad\nAna;34', 'auto', csvOpts)).toEqual({
      ok: true,
      value: [{ nombre: 'Ana', edad: '34' }],
      format: 'csv',
      sep: ';',
      csvWarnings: [],
    });
  });

  it('reads CSV without header as arrays, detecting types when asked', () => {
    const r = readInput('id,activo,nota,cp\n1,true,,007', 'csv', {
      header: false,
      detectTypes: true,
    });
    expect(r).toMatchObject({
      ok: true,
      value: [
        ['id', 'activo', 'nota', 'cp'],
        [1, true, null, '007'],
      ],
    });
  });

  it('reports the CSV line of an unclosed quote', () => {
    expect(readInput('a,b\n1,"x\n2,3', 'csv', csvOpts)).toMatchObject({
      ok: false,
      format: 'csv',
      line: 2,
    });
  });

  it('reads YAML, resolving anchors, aliases and merge keys', () => {
    const r = readInput('base: &b\n  x: 1\nuno:\n  <<: *b\n  y: 2\ncopia: *b\n', 'auto', csvOpts);
    expect(r).toEqual({
      ok: true,
      format: 'yaml',
      value: { base: { x: 1 }, uno: { x: 1, y: 2 }, copia: { x: 1 } },
    });
  });

  it('reads several YAML documents as an array', () => {
    expect(readInput('a: 1\n---\nb: 2\n', 'yaml', csvOpts)).toEqual({
      ok: true,
      format: 'yaml',
      value: [{ a: 1 }, { b: 2 }],
      documents: 2,
    });
  });

  it('gives YAML errors with line and column', () => {
    expect(readInput('a: 1\nb: [1, 2\n', 'yaml', csvOpts)).toEqual({
      ok: false,
      format: 'yaml',
      line: 3,
      column: 1,
      message: 'Flow sequence in block collection must be sufficiently indented and end with a ]',
    });
  });

  it('gives JSON errors with line and column', () => {
    expect(readInput('{\n  "a": 1,\n}', 'json', csvOpts)).toMatchObject({
      ok: false,
      format: 'json',
      line: 3,
    });
  });
});

describe('writeOutput', () => {
  const data = [{ nombre: 'Ana', edad: 34 }];

  it('writes JSON with 2 spaces and YAML without line wrapping', () => {
    expect(writeOutput(data, 'json', ',')).toEqual({
      ok: true,
      text: '[\n  {\n    "nombre": "Ana",\n    "edad": 34\n  }\n]',
      dottedKeys: false,
    });
    expect(writeOutput(data, 'yaml', ',')).toMatchObject({ text: '- nombre: Ana\n  edad: 34\n' });
    const long = 'palabra '.repeat(30).trim();
    expect(writeOutput({ t: long }, 'yaml', ',')).toMatchObject({ text: `t: ${long}\n` });
  });

  it('writes CSV with the union of keys, flattened objects and JSON for arrays', () => {
    const r = toCsvText(
      [
        { id: 1, direccion: { ciudad: 'Madrid', cp: '28001' }, tags: ['a', 'b'] },
        { id: 2, extra: null, direccion: { ciudad: 'Vigo' } },
      ],
      ',',
    );
    expect(lines(r)).toEqual([
      'id,direccion.ciudad,direccion.cp,tags,extra',
      '1,Madrid,28001,"[""a"",""b""]",',
      '2,Vigo,,,',
    ]);
  });

  it('takes a single object as one row and arrays of arrays as they are', () => {
    expect(lines(toCsvText({ a: 1, b: 'x' }, ';'))).toEqual(['a;b', '1;x']);
    expect(
      lines(
        toCsvText(
          [
            ['a', 'b'],
            [1, null],
          ],
          '\t',
        ),
      ),
    ).toEqual(['a\tb', '1\t']);
  });

  it('refuses what is not a table', () => {
    expect(toCsvText([1, 2], ',')).toEqual({ ok: false, error: 'not-table' });
    expect(toCsvText('hola', ',')).toEqual({ ok: false, error: 'not-table' });
    expect(toCsvText([], ',')).toEqual({ ok: false, error: 'not-table' });
  });

  it('flags keys that already contain dots', () => {
    expect(toCsvText([{ 'a.b': 1 }], ',')).toMatchObject({ ok: true, dottedKeys: true });
  });

  it('round-trips CSV with quotes, line breaks and ; inside fields', () => {
    const rows = [{ texto: 'dijo "hola"; adiós\nfin', n: '1' }];
    const out = toCsvText(rows, ';');
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    const back = parseCsv(out.text, ';');
    expect(back.ok && back.rows).toEqual([
      ['texto', 'n'],
      ['dijo "hola"; adiós\nfin', '1'],
    ]);
    expect(readInput(out.text, 'csv', csvOpts)).toMatchObject({ ok: true, value: rows });
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/data-convert`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/data-convert/logic.ts`**

`yaml` se importa aquí y solo aquí. Los errores de YAML traen línea y columna en `linePos`; el mensaje se queda con su primera línea y sin el «at line N, column M» final, porque la interfaz ya lo dice en su idioma. Los tests de CSV no dependen de que `toCsv` (lote 1) termine o no con un salto de línea.

```ts
import { parseAllDocuments, stringify } from 'yaml';
import { parseCsv, toCsv, type CsvWarning } from '../../lib/csv';
import { parseJson } from '../json/logic';

export type Format = 'json' | 'yaml' | 'csv';
export type InputFormat = 'auto' | Format;
export type Sep = ',' | ';' | '\t';

export interface CsvReadOptions {
  /** First row as keys → array of objects; otherwise an array of arrays. */
  header: boolean;
  /** Numbers without leading zeros, true/false and empty cells (null). */
  detectTypes: boolean;
}

export type ReadResult =
  | {
      ok: true;
      value: unknown;
      format: Format;
      /** Detected CSV separator. */
      sep?: Sep;
      /** YAML with several `---` documents: read as an array. */
      documents?: number;
      csvWarnings?: CsvWarning[];
    }
  | { ok: false; format: Format; line: number | null; column: number | null; message: string };

export type WriteResult =
  { ok: true; text: string; dottedKeys: boolean } | { ok: false; error: 'not-table' };

export const DEBOUNCE_THRESHOLD = 100_000;
const NUMBER = /^-?(0|[1-9]\d*)(\.\d+)?$/;

/** Spec order: JSON if it parses, CSV if at least two rows share a field count, else YAML. */
export function detectFormat(text: string): { format: Format; sep?: Sep } {
  const t = text.trim();
  if (t.startsWith('{') || t.startsWith('[')) {
    try {
      JSON.parse(t);
      return { format: 'json' };
    } catch {
      // Not JSON: YAML flow collections also start like this.
    }
  }
  const firstLine = t.split(/\r?\n/, 1)[0] ?? '';
  if (/[,;\t]/.test(firstLine)) {
    const csv = parseCsv(t);
    if (csv.ok && csv.rows.length >= 2 && csv.rows[0].length >= 2) {
      const width = csv.rows[0].length;
      if (csv.rows.slice(1).some((r) => r.length === width)) {
        return { format: 'csv', sep: csv.sep };
      }
    }
  }
  return { format: 'yaml' };
}

function cell(v: string, detect: boolean): unknown {
  if (!detect) return v;
  if (v === '') return null;
  if (NUMBER.test(v)) return Number(v);
  if (v === 'true') return true;
  if (v === 'false') return false;
  return v;
}

export function readInput(text: string, format: InputFormat, csv: CsvReadOptions): ReadResult {
  const detected = format === 'auto' ? detectFormat(text) : { format };
  if (detected.format === 'json') {
    const r = parseJson(text);
    return r.ok
      ? { ok: true, value: r.value, format: 'json' }
      : { ok: false, format: 'json', ...r.error };
  }
  if (detected.format === 'yaml') {
    const docs = parseAllDocuments(text, { merge: true });
    const list = Array.isArray(docs) ? docs : [];
    for (const doc of list) {
      const err = doc.errors[0];
      if (err) {
        const pos = err.linePos?.[0];
        return {
          ok: false,
          format: 'yaml',
          line: pos?.line ?? null,
          column: pos?.col ?? null,
          message: err.message.split('\n')[0].replace(/ at line \d+, column \d+:?$/, ''),
        };
      }
    }
    const values = list.map((d) => d.toJS({ maxAliasCount: 1000 }) as unknown);
    if (values.length > 1)
      return { ok: true, value: values, format: 'yaml', documents: values.length };
    return { ok: true, value: values[0] ?? null, format: 'yaml' };
  }
  const r = parseCsv(text, 'sep' in detected ? detected.sep : undefined);
  if (!r.ok) {
    return { ok: false, format: 'csv', line: r.line, column: null, message: r.reason };
  }
  let value: unknown;
  if (csv.header && r.rows.length) {
    const [head, ...body] = r.rows;
    value = body.map((row) => {
      const obj: Record<string, unknown> = {};
      head.forEach((k, i) => (obj[k] = cell(row[i] ?? '', csv.detectTypes)));
      return obj;
    });
  } else {
    value = r.rows.map((row) => row.map((c) => cell(c, csv.detectTypes)));
  }
  return { ok: true, value, format: 'csv', sep: r.sep, csvWarnings: r.warnings };
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

type Cell = string | number | boolean | null;

function toCell(v: unknown): Cell {
  if (v === null || v === undefined) return null;
  if (typeof v === 'object') return JSON.stringify(v);
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
  return String(v);
}

/** Nested objects become dotted keys; arrays stay whole (they go into the cell as JSON). */
function flatten(obj: Record<string, unknown>, prefix = '', out: Record<string, unknown> = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (isObj(v) && Object.keys(v).length) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

export function toCsvText(value: unknown, sep: Sep): WriteResult {
  const rows = isObj(value) ? [value] : value;
  if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: 'not-table' };
  if (rows.every(Array.isArray)) {
    return {
      ok: true,
      text: toCsv(
        rows.map((r) => r.map(toCell)),
        sep,
      ),
      dottedKeys: false,
    };
  }
  if (!rows.every(isObj)) return { ok: false, error: 'not-table' };
  const flat = rows.map((r) => flatten(r));
  const columns: string[] = [];
  const seen = new Set<string>();
  for (const r of flat) {
    for (const k of Object.keys(r)) {
      if (!seen.has(k)) {
        seen.add(k);
        columns.push(k);
      }
    }
  }
  const dottedKeys = rows.some((r) => Object.keys(r).some((k) => k.includes('.')));
  const table: Cell[][] = [columns, ...flat.map((r) => columns.map((c) => toCell(r[c])))];
  return { ok: true, text: toCsv(table, sep), dottedKeys };
}

export function writeOutput(value: unknown, format: Format, sep: Sep): WriteResult {
  if (format === 'json') {
    return { ok: true, text: JSON.stringify(value, null, 2) ?? 'null', dottedKeys: false };
  }
  if (format === 'yaml') {
    return { ok: true, text: stringify(value, { indent: 2, lineWidth: 0 }), dottedKeys: false };
  }
  return toCsvText(value, sep);
}

export function shouldDebounce(text: string): boolean {
  return text.length > DEBOUNCE_THRESHOLD;
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/data-convert`
Expected: PASS (14 tests).

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/data-convert/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'data-convert',
  category: 'data',
  icon: 'sheet',
  slug: { es: 'conversor-json-yaml-csv', en: 'json-yaml-csv-converter' },
  name: { es: 'JSON, YAML y CSV', en: 'JSON, YAML & CSV' },
  title: {
    es: 'Conversor JSON ↔ YAML ↔ CSV online',
    en: 'JSON to YAML and CSV converter (and back)',
  },
  description: {
    es: 'Convierte entre JSON, YAML y CSV en tu navegador: detecta el formato y el separador, resuelve anclas de YAML y aplana objetos anidados para el CSV.',
    en: 'Convert between JSON, YAML and CSV in your browser: detects the format and separator, resolves YAML anchors and flattens nested objects for CSV.',
  },
  keywords: {
    es: [
      'json a yaml',
      'yaml a json',
      'csv a json',
      'json a csv',
      'convertir yaml',
      'conversor csv',
    ],
    en: [
      'json to yaml',
      'yaml to json',
      'csv to json',
      'json to csv',
      'yaml converter',
      'csv converter',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Por qué al pasar de CSV a JSON los números salen entre comillas?',
        a: 'CSV no guarda tipos: todo es texto. Activa «Detectar números y booleanos» para convertir 42 en número y true en booleano. Los números con ceros a la izquierda, como 007, se quedan como texto.',
      },
      {
        q: '¿Qué pasa con los objetos anidados al exportar a CSV?',
        a: 'Se aplanan con puntos: {"direccion": {"ciudad": "Vigo"}} da la columna direccion.ciudad. Las listas van en la celda como JSON. Al volver a leer el CSV, el anidamiento no se reconstruye.',
      },
    ],
    en: [
      {
        q: 'Why do numbers come out quoted when converting CSV to JSON?',
        a: 'CSV does not store types: everything is text. Turn on “Detect numbers and booleans” to turn 42 into a number and true into a boolean. Numbers with leading zeros, such as 007, stay as text.',
      },
      {
        q: 'What happens to nested objects when exporting to CSV?',
        a: 'They are flattened with dots: {"address": {"city": "Vigo"}} gives the column address.city. Lists go into the cell as JSON. Reading the CSV back does not rebuild the nesting.',
      },
    ],
  },
};
```

`src/tools/data-convert/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    input: 'Datos de entrada',
    placeholder: 'Pega JSON, YAML o CSV. Por ejemplo:\nnombre;edad\nAna;34',
    from: 'Formato de entrada',
    auto: 'Automático',
    to: 'Convertir a',
    sep: 'Separador',
    comma: 'Coma (,)',
    semicolon: 'Punto y coma (;)',
    tab: 'Tabulador',
    header: 'La primera fila es la cabecera',
    detectTypes: 'Detectar números y booleanos',
    result: 'Resultado',
    detected: 'Detectado: {format}',
    detectedCsv: 'Detectado: CSV (separador {sep})',
    read: 'Leído como {format}',
    errorAt: 'Error en la línea {line}, columna {column}: {message}',
    errorLine: 'Error en la línea {line}: {message}',
    unclosedQuote: 'Hay una comilla sin cerrar que empieza en la línea {line}',
    notTable: 'Para CSV hace falta una lista de objetos, por ejemplo [{"a": 1}]',
    columns: 'La fila {row} tiene {columns} columnas y la cabecera, {expected}',
    documents: 'Hay {n} documentos YAML separados por ---: se leen como una lista.',
    csvTypes:
      'CSV no guarda tipos: al volver a leerlo, todo será texto salvo que actives «Detectar números y booleanos».',
    dotted:
      'Hay claves con puntos: la cabecera las conserva, pero al volver a leer el CSV no se reconstruye el anidamiento.',
    empty: 'Pega datos en JSON, YAML o CSV y elige a qué formato convertirlos.',
    copyResult: 'Copiar resultado',
    file: 'datos',
    tabName: 'tabulador',
  },
  en: {
    input: 'Input data',
    placeholder: 'Paste JSON, YAML or CSV. For example:\nname;age\nAna;34',
    from: 'Input format',
    auto: 'Automatic',
    to: 'Convert to',
    sep: 'Separator',
    comma: 'Comma (,)',
    semicolon: 'Semicolon (;)',
    tab: 'Tab',
    header: 'First row is the header',
    detectTypes: 'Detect numbers and booleans',
    result: 'Result',
    detected: 'Detected: {format}',
    detectedCsv: 'Detected: CSV (separator {sep})',
    read: 'Read as {format}',
    errorAt: 'Error at line {line}, column {column}: {message}',
    errorLine: 'Error at line {line}: {message}',
    unclosedQuote: 'There is an unclosed quote starting at line {line}',
    notTable: 'CSV needs a list of objects, for example [{"a": 1}]',
    columns: 'Row {row} has {columns} columns and the header has {expected}',
    documents: 'There are {n} YAML documents separated by ---: they are read as a list.',
    csvTypes:
      'CSV does not store types: reading it back, everything will be text unless you turn on “Detect numbers and booleans”.',
    dotted:
      'Some keys contain dots: the header keeps them, but reading the CSV back does not rebuild the nesting.',
    empty: 'Paste JSON, YAML or CSV data and pick the format to convert it to.',
    copyResult: 'Copy result',
    file: 'data',
    tabName: 'tab',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/data-convert/content.es.md`:
```md
## Cómo funciona

Pega los datos y elige a qué formato quieres pasarlos. La herramienta detecta sola si la entrada es **JSON** (empieza por `{` o `[` y es válida), **CSV** (la primera línea tiene comas, puntos y coma o tabuladores, y hay filas con el mismo número de columnas) o **YAML**. También puedes indicar el formato a mano. El resultado se actualiza mientras escribes y puedes copiarlo o descargarlo.

El YAML se lee completo, versión 1.2: anclas y alias (`&base`, `*base`), claves de fusión (`<<`), bloques de texto y varios documentos separados por `---`, que se convierten en una lista. Si hay un error, verás la línea y la columna.

## CSV

Al leer un CSV se respetan los campos entre comillas con separadores, saltos de línea y comillas dobles dentro. Con «La primera fila es la cabecera» obtienes una lista de objetos; sin ella, una lista de filas. Para escribir un CSV hace falta una lista de objetos: las columnas son todas las claves que aparecen, los objetos anidados se aplanan como `direccion.ciudad` y las listas van en la celda como JSON. Recuerda que CSV no guarda tipos: al volver a leerlo, todo será texto salvo que actives «Detectar números y booleanos».
```

`src/tools/data-convert/content.en.md`:
```md
## How it works

Paste your data and pick the format to convert it to. The tool detects on its own whether the input is **JSON** (starts with `{` or `[` and is valid), **CSV** (the first line has commas, semicolons or tabs, and there are rows with the same number of columns) or **YAML**. You can also set the format by hand. The result updates as you type, ready to copy or download.

YAML is read in full, version 1.2: anchors and aliases (`&base`, `*base`), merge keys (`<<`), block text and several documents separated by `---`, which become a list. If there is an error you get its line and column.

## CSV

When reading CSV, quoted fields holding separators, line breaks and doubled quotes are respected. With “First row is the header” you get a list of objects; without it, a list of rows. Writing CSV needs a list of objects: the columns are every key that appears, nested objects are flattened as `address.city` and lists go into the cell as JSON. Keep in mind CSV does not store types: reading it back, everything is text unless you turn on “Detect numbers and booleans”.
```

- [ ] **Step 8: `src/tools/data-convert/DataConvert.svelte`**

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { downloadBlob } from '../../lib/download';
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
  import {
    readInput,
    shouldDebounce,
    writeOutput,
    type Format,
    type InputFormat,
    type ReadResult,
    type Sep,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('data-convert', '', meta.rememberInput ?? true);

  const NAMES: Record<Format, string> = { json: 'JSON', yaml: 'YAML', csv: 'CSV' };
  const MIME: Record<Format, string> = {
    json: 'application/json',
    yaml: 'application/yaml',
    csv: 'text/csv;charset=utf-8',
  };

  let from = $state<InputFormat>('auto');
  let to = $state<Format>('json');
  let sep = $state<Sep>(',');
  let header = $state(true);
  let detectTypes = $state(false);
  let read = $state<ReadResult | null>(null);

  $effect(() => {
    const text = input.value;
    const opts = { header, detectTypes };
    const format = from;
    if (!text.trim()) {
      read = null;
      return;
    }
    if (!shouldDebounce(text)) {
      read = readInput(text, format, opts);
      return;
    }
    const timer = setTimeout(() => (read = readInput(text, format, opts)), 150);
    return () => clearTimeout(timer);
  });

  const written = $derived(read?.ok ? writeOutput(read.value, to, sep) : null);
  const output = $derived(written?.ok ? written.text : '');
  const sepName = (v: Sep) => (v === '\t' ? s.tabName : v);

  const status = $derived.by(() => {
    if (!read) return '';
    if (!read.ok) {
      if (read.format === 'csv' && read.line !== null)
        return fill(s.unclosedQuote, { line: read.line });
      if (read.line !== null && read.column !== null)
        return fill(s.errorAt, { line: read.line, column: read.column, message: read.message });
      if (read.line !== null) return fill(s.errorLine, { line: read.line, message: read.message });
      return read.message;
    }
    if (from !== 'auto') return fill(s.read, { format: NAMES[read.format] });
    if (read.format === 'csv' && read.sep) return fill(s.detectedCsv, { sep: sepName(read.sep) });
    return fill(s.detected, { format: NAMES[read.format] });
  });

  const csvInput = $derived(
    from === 'csv' || (from === 'auto' && read?.ok && read.format === 'csv'),
  );

  function download() {
    downloadBlob(output, `${s.file}.${to}`, MIME[to]);
  }
</script>

<div class="panel">
  <Field id="data-convert-input" label={s.input}>
    {#snippet children({ describedby })}
      <TextArea
        id="data-convert-input"
        bind:value={input.value}
        placeholder={s.placeholder}
        {describedby}
        invalid={!!read && !read.ok}
        rows={10}
      />
    {/snippet}
  </Field>

  <div class="row">
    <Field id="data-convert-from" label={s.from}>
      {#snippet children({ describedby })}
        <Select
          id="data-convert-from"
          bind:value={from}
          {describedby}
          options={[
            { value: 'auto', label: s.auto },
            { value: 'json', label: 'JSON' },
            { value: 'yaml', label: 'YAML' },
            { value: 'csv', label: 'CSV' },
          ]}
        />
      {/snippet}
    </Field>
    <Segmented
      label={s.to}
      options={[
        { value: 'json', label: 'JSON' },
        { value: 'yaml', label: 'YAML' },
        { value: 'csv', label: 'CSV' },
      ]}
      bind:value={to}
    />
    {#if to === 'csv'}
      <Field id="data-convert-sep" label={s.sep}>
        {#snippet children({ describedby })}
          <Select
            id="data-convert-sep"
            bind:value={sep}
            {describedby}
            options={[
              { value: ',', label: s.comma },
              { value: ';', label: s.semicolon },
              { value: '\t', label: s.tab },
            ]}
          />
        {/snippet}
      </Field>
    {/if}
  </div>

  {#if csvInput}
    <div class="row">
      <Toggle bind:checked={header} label={s.header} />
      <Toggle bind:checked={detectTypes} label={s.detectTypes} />
    </div>
  {/if}

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={!read ? 'idle' : read.ok && written?.ok ? 'ok' : 'bad'}
        label={!read ? t(locale, 'led.idle') : status}
      />
    {/snippet}
    {#if !read}
      <p class="display-note">{s.empty}</p>
    {:else if !read.ok}
      <p class="display-note">{status}</p>
    {:else if written && !written.ok}
      <p class="display-note">{s.notTable}</p>
    {:else}
      <pre class="display-code">{output}</pre>
      {#if read.documents}
        <p class="display-note">{fill(s.documents, { n: read.documents })}</p>
      {/if}
      {#each read.csvWarnings ?? [] as w (w.row)}
        <p class="display-note">
          {fill(s.columns, { row: w.row, columns: w.columns, expected: w.expected })}
        </p>
      {/each}
      {#if to === 'csv'}
        <p class="display-note">{s.csvTypes}</p>
        {#if written?.dottedKeys}<p class="display-note">{s.dotted}</p>{/if}
      {/if}
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={output} {locale} label={s.copyResult} />
    <Button variant="ghost" disabled={!output} onclick={download}>{t(locale, 'ui.download')}</Button
    >
    <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}
      >{t(locale, 'ui.clear')}</Button
    >
  </div>
  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
</div>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as dataConvert } from './data-convert/meta';
```
→
```ts
import { meta as dataConvert } from './data-convert/meta';
```
y
```ts
  // dataConvert,
```
→
```ts
  dataConvert,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import DataConvert from '../tools/data-convert/DataConvert.svelte';
```
→
```astro
import DataConvert from '../tools/data-convert/DataConvert.svelte';
```
y
```astro
{/* {id === 'data-convert' && <DataConvert client:load locale={locale} />} */}
```
→
```astro
{id === 'data-convert' && <DataConvert client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/conversor-json-yaml-csv.html dist/en/json-yaml-csv-converter.html
grep -l 'BLOCK_AS_IMPLICIT_KEY' dist/_astro/*.js
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `data-convert` y sus dos `content.*.md`), y existen las dos páginas. Cada `grep -l` lista **un solo archivo**, `dist/_astro/DataConvert.<hash>.js`: la librería está en el chunk de esta herramienta y en ningún otro. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador (desechable, puerto 4674)**

Crea `.check-data-convert.mjs` en la raíz del worktree:
```js
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4674';
const browser = await chromium.launch();
const page = await browser.newPage({ acceptDownloads: true });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));

await page.goto(`${BASE}/es/conversor-json-yaml-csv`);
await page.locator('#data-convert-input').fill('nombre;edad\nAna;34');
assert.match(await page.locator('.display-head').innerText(), /Detectado: CSV \(separador ;\)/);
assert.deepEqual(JSON.parse(await page.locator('.display-code').innerText()), [
  { nombre: 'Ana', edad: '34' },
]);
await page.getByRole('radio', { name: 'YAML', exact: true }).click();
assert.equal(await page.locator('.display-code').innerText(), '- nombre: Ana\n  edad: "34"\n');

await page.locator('#data-convert-input').fill('base: &b\n  x: 1\ncopia: *b\n');
await page.getByRole('radio', { name: 'CSV', exact: true }).click();
assert.match(await page.locator('.display-code').innerText(), /^base\.x,copia\.x\r?\n1,1/);

await page.locator('#data-convert-input').fill('[{"a":{"b":1},"c.d":2}]');
assert.match(await page.locator('.display').innerText(), /no se reconstruye el anidamiento/);
const download = page.waitForEvent('download');
await page.getByRole('button', { name: 'Descargar' }).click();
assert.equal((await download).suggestedFilename(), 'datos.csv');

await browser.close();
assert.deepEqual(errors, []);
console.log('OK data-convert');
```

Run:
```bash
./node_modules/.bin/astro preview --port 4674 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
until curl -sf -o /dev/null http://localhost:4674/es; do sleep 0.5; done
node .check-data-convert.mjs
kill $PREVIEW
rm .check-data-convert.mjs
```
Expected: la última línea es `OK data-convert` y no hay ningún error de página. Si falla un paso, arregla el componente, no la comprobación.

A mano, con `pnpm preview`, en `/es/conversor-json-yaml-csv` y `/en/json-yaml-csv-converter`, primero en el tema claro y luego en oscuro y terminal, a 390 px y a 1280 px de ancho:
1. `nombre;edad` / `Ana;34` → «Detectado: CSV (separador ;)» y el JSON con `"nombre": "Ana"`; salida YAML → `- nombre: Ana`.
2. Un YAML con `&base`, `*base` y `<<: *base` → JSON con todo resuelto; con un error de sangría → «Error en la línea …, columna …: …».
3. Salida CSV con `[{"a": {"b": 1}, "c.d": 2}]` → cabecera `a.b,c.d`, la nota de tipos y el aviso de claves con puntos; separador «Punto y coma» → `a.b;c.d`.
4. «Descargar» → `datos.csv`. Pega un JSON de más de 100 KB: la página sigue respondiendo mientras escribes.

- [ ] **Step 12: Commit**

```bash
git add src/tools/data-convert src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (tampoco `.check-data-convert.mjs`, que ya se borró). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(data-convert): conversor entre JSON, YAML y CSV con detección de formato"
```

---

### Task 5: Comparar JSON: por estructura, sin orden de claves y sin recursión

**Files:**
- Create: `src/tools/json-diff/logic.ts`, `src/tools/json-diff/logic.test.ts`, `src/tools/json-diff/meta.ts`, `src/tools/json-diff/strings.ts`, `src/tools/json-diff/content.es.md`, `src/tools/json-diff/content.en.md`, `src/tools/json-diff/JsonDiff.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `parseJson` y `jsonPath` de `src/tools/json/logic.ts`; `fill`; `t` (`led.idle`, `ui.clear`, `tool.remember`); kit: `Field`, `TextArea`, `Segmented`, `Display`, `Led`, `CopyButton`, `Button`, `Toggle` y `persistedInput`.
- Produces:
  - `type ChangeKind = 'added' | 'removed' | 'changed'`, `interface Change { kind; path; before?; after? }`, `interface DiffResult { changes; counts; hidden }`, `MAX_CHANGES = 5000`, `PREVIEW_MAX = 120`, `DEBOUNCE_THRESHOLD = 100_000`
  - `preview(value, max = 120)`, `diffJson(a, b, limit = 5000): DiffResult`, `symbolOf(kind)`, `reportText(changes)`, `shouldDebounce(a, b)`
  - `meta: ToolMeta` (id `json-diff`, slugs `comparar-json` / `json-diff`), `strings: Record<Locale, …>` y el componente `JsonDiff` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 14: `#json-diff-a`, `#json-diff-b`, `#json-diff-b-error`, `.panel .changes .path` (una ruta por cambio), el LED de `.display-head` («1 añadida · 0 eliminadas · 1 cambiada») y el filtro «Todas · Añadidas · Eliminadas · Cambiadas» (`role="radio"`).

**§8.5 (vinculante):** `json-diff` · data · sin pestañas. Dos `TextArea` leídos con `parseJson`, cada uno con su error. Algoritmo iterativo con pila explícita: claves solo en A → eliminadas, solo en B → añadidas, en las dos → se sigue (el orden de las claves no cuenta); arrays por índice; tipos o primitivos distintos (`!==`) → cambiada. Rutas con `jsonPath` (`$.usuarios[0].email`). Resumen «3 añadidas · 1 eliminada · 2 cambiadas», filtro (Segmented secundario), una fila por cambio con `+`, `−` o `~` (el color nunca es la única señal) y valores en JSON compacto recortados a 120 caracteres. Iguales → LED `ok` «Los dos JSON son equivalentes (el orden de las claves no importa)». `CopyButton main` copia el informe, una línea por cambio. Tope de 5000 cambios con «… y 1234 más». Recordar ✓ con `json-diff` y `json-diff-b`. `1` frente a `1.0` iguales, `null` frente a `{}` cambiada, 10 000 niveles sin desbordar la pila.

Cómo se cubre cada punto:
- El ejemplo del e2e y el orden de claves: test `matches the e2e example: key order does not matter`.
- `1` y `1.0`, arrays por índice y tipos distintos: tests `reports nothing for equivalent documents, including 1 and 1.0`, `compares arrays by index` y `treats different types as a change, null against {} included`.
- Rutas legibles y orden del documento: test `lists nested changes in document order with readable paths` (`$.usuarios[0]["fecha alta"]`).
- Sin recursión: Review Focus 5. La vista previa también es iterativa y se para a los 120 caracteres, así que un subárbol enorme no se serializa entero.
- Tope: test `lists at most `limit` changes and counts the rest`; el componente pinta «… y N más» con `hidden`.
- Accesibilidad: cada fila lleva el símbolo (`aria-hidden`) y el tipo en texto para lectores de pantalla.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l3-json-diff -b lote-3/json-diff   # desde el commit de la Task 0
cd ../devtools-l3-json-diff
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task (Field, TextArea, Segmented, Display, Led, CopyButton, Button, Toggle) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real y dilo en el commit.

- [ ] **Step 2: Test (falla)**

`src/tools/json-diff/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { diffJson, preview, reportText } from './logic';

describe('diffJson', () => {
  it('matches the e2e example: key order does not matter', () => {
    const r = diffJson({ a: 1, b: 2 }, { b: 3, a: 1, c: 4 });
    expect(r.counts).toEqual({ added: 1, removed: 0, changed: 1 });
    expect(r.changes).toEqual([
      { kind: 'changed', path: '$.b', before: '2', after: '3' },
      { kind: 'added', path: '$.c', after: '4' },
    ]);
  });

  it('reports nothing for equivalent documents, including 1 and 1.0', () => {
    const a = JSON.parse('{"x": 1, "y": {"z": [1, 2]}}');
    const b = JSON.parse('{"y": {"z": [1.0, 2]}, "x": 1.0}');
    expect(diffJson(a, b)).toEqual({
      changes: [],
      counts: { added: 0, removed: 0, changed: 0 },
      hidden: 0,
    });
  });

  it('compares arrays by index', () => {
    expect(diffJson([1, 2, 3], [1, 3]).changes).toEqual([
      { kind: 'changed', path: '$[1]', before: '2', after: '3' },
      { kind: 'removed', path: '$[2]', before: '3' },
    ]);
    expect(diffJson({ l: [] }, { l: ['a'] }).changes).toEqual([
      { kind: 'added', path: '$.l[0]', after: '"a"' },
    ]);
  });

  it('treats different types as a change, null against {} included', () => {
    expect(diffJson({ v: null }, { v: {} }).changes).toEqual([
      { kind: 'changed', path: '$.v', before: 'null', after: '{}' },
    ]);
    expect(diffJson([1], { 0: 1 }).changes).toEqual([
      { kind: 'changed', path: '$', before: '[1]', after: '{"0":1}' },
    ]);
  });

  it('lists nested changes in document order with readable paths', () => {
    const a = { usuarios: [{ email: 'a@x.es', 'fecha alta': 1 }], fin: true };
    const b = { usuarios: [{ email: 'b@x.es' }], fin: true, nuevo: null };
    expect(diffJson(a, b).changes.map((c) => `${c.kind} ${c.path}`)).toEqual([
      'changed $.usuarios[0].email',
      'removed $.usuarios[0]["fecha alta"]',
      'added $.nuevo',
    ]);
  });

  it('survives 10 000 levels of nesting without overflowing the stack', () => {
    const deep = (leaf: number) => JSON.parse('['.repeat(10_000) + leaf + ']'.repeat(10_000));
    const r = diffJson(deep(1), deep(2));
    expect(r.counts.changed).toBe(1);
    expect(r.changes[0].path).toBe('$' + '[0]'.repeat(10_000));
  });

  it('lists at most `limit` changes and counts the rest', () => {
    const a = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`k${i}`, i]));
    const r = diffJson(a, {}, 10);
    expect(r.changes).toHaveLength(10);
    expect(r.counts.removed).toBe(30);
    expect(r.hidden).toBe(20);
  });
});

describe('preview', () => {
  it('writes compact JSON', () => {
    expect(preview({ a: [1, 'x', null], b: { c: true } })).toBe(
      '{"a":[1,"x",null],"b":{"c":true}}',
    );
  });

  it('cuts long values at 120 characters, even when they are huge or deep', () => {
    const long = preview('x'.repeat(500));
    expect(long).toHaveLength(120);
    expect(long.endsWith('…')).toBe(true);
    const deep = JSON.parse('['.repeat(10_000) + ']'.repeat(10_000));
    expect(preview(deep)).toBe('['.repeat(119) + '…');
  });
});

describe('reportText', () => {
  it('prints one line per change with its symbol', () => {
    const r = diffJson({ a: 1, b: 2, x: 0 }, { b: 3, a: 1, c: 4 });
    expect(reportText(r.changes)).toBe('~ $.b: 2 → 3\n− $.x: 0\n+ $.c: 4');
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/json-diff`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/json-diff/logic.ts`**

Cada nivel mete en la pila sus hijos **en orden inverso**, así los cambios salen en el orden del documento sin recursión. Las filas de «añadida» o «eliminada» guardan una función que construye la vista previa: solo se llama para los cambios que se van a listar.

```ts
import { jsonPath } from '../json/logic';

export type ChangeKind = 'added' | 'removed' | 'changed';

export interface Change {
  kind: ChangeKind;
  path: string;
  /** Compact JSON, cut at PREVIEW_MAX characters. */
  before?: string;
  after?: string;
}

export interface DiffResult {
  changes: Change[];
  counts: Record<ChangeKind, number>;
  /** Changes found beyond the listing limit. */
  hidden: number;
}

export const MAX_CHANGES = 5000;
export const PREVIEW_MAX = 120;
export const DEBOUNCE_THRESHOLD = 100_000;

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => v !== null && typeof v === 'object' && !Array.isArray(v);

/** A piece of punctuation already written as text, waiting on the stack. */
class Raw {
  constructor(readonly text: string) {}
}

/**
 * Compact JSON of `value`, built iteratively and stopped as soon as it passes `max` characters,
 * so a huge or very deep subtree costs no more than the preview itself.
 */
export function preview(value: unknown, max = PREVIEW_MAX): string {
  let out = '';
  const stack: unknown[] = [value];
  while (stack.length && out.length <= max) {
    const item = stack.pop();
    if (item instanceof Raw) {
      out += item.text;
    } else if (Array.isArray(item)) {
      stack.push(new Raw(']'));
      for (let i = item.length - 1; i >= 0; i--) {
        stack.push(item[i]);
        if (i > 0) stack.push(new Raw(','));
      }
      out += '[';
    } else if (isObj(item)) {
      const keys = Object.keys(item);
      stack.push(new Raw('}'));
      for (let i = keys.length - 1; i >= 0; i--) {
        stack.push(item[keys[i]]);
        stack.push(new Raw(`${JSON.stringify(keys[i])}:`));
        if (i > 0) stack.push(new Raw(','));
      }
      out += '{';
    } else {
      out += JSON.stringify(item) ?? 'null';
    }
  }
  return out.length > max || stack.length ? `${out.slice(0, max - 1)}…` : out;
}

type Frame =
  | { kind: 'compare'; path: string; a: unknown; b: unknown }
  | { kind: 'emit'; change: () => Change; type: ChangeKind };

/**
 * Structural diff. Object keys are compared regardless of order; arrays are compared by index.
 * Uses an explicit stack instead of recursion, so 10 000 levels of nesting do not overflow.
 */
export function diffJson(a: unknown, b: unknown, limit = MAX_CHANGES): DiffResult {
  const changes: Change[] = [];
  const counts: Record<ChangeKind, number> = { added: 0, removed: 0, changed: 0 };
  const stack: Frame[] = [{ kind: 'compare', path: '$', a, b }];

  while (stack.length) {
    const f = stack.pop()!;
    if (f.kind === 'emit') {
      counts[f.type]++;
      // Previews are only built for the changes that will be listed.
      if (changes.length < limit) changes.push(f.change());
      continue;
    }
    const { path, a: x, b: y } = f;
    const next: Frame[] = [];
    if (isObj(x) && isObj(y)) {
      for (const k of Object.keys(x)) {
        const p = jsonPath(path, k);
        if (Object.hasOwn(y, k)) next.push({ kind: 'compare', path: p, a: x[k], b: y[k] });
        else
          next.push({
            kind: 'emit',
            type: 'removed',
            change: () => ({ kind: 'removed', path: p, before: preview(x[k]) }),
          });
      }
      for (const k of Object.keys(y)) {
        if (Object.hasOwn(x, k)) continue;
        const p = jsonPath(path, k);
        next.push({
          kind: 'emit',
          type: 'added',
          change: () => ({ kind: 'added', path: p, after: preview(y[k]) }),
        });
      }
    } else if (Array.isArray(x) && Array.isArray(y)) {
      const n = Math.max(x.length, y.length);
      for (let i = 0; i < n; i++) {
        const p = jsonPath(path, i);
        if (i >= y.length)
          next.push({
            kind: 'emit',
            type: 'removed',
            change: () => ({ kind: 'removed', path: p, before: preview(x[i]) }),
          });
        else if (i >= x.length)
          next.push({
            kind: 'emit',
            type: 'added',
            change: () => ({ kind: 'added', path: p, after: preview(y[i]) }),
          });
        else next.push({ kind: 'compare', path: p, a: x[i], b: y[i] });
      }
    } else if (x !== y) {
      next.push({
        kind: 'emit',
        type: 'changed',
        change: () => ({ kind: 'changed', path, before: preview(x), after: preview(y) }),
      });
    }
    // Reversed onto the stack, so changes come out in document order.
    for (let i = next.length - 1; i >= 0; i--) stack.push(next[i]);
  }
  return {
    changes,
    counts,
    hidden: counts.added + counts.removed + counts.changed - changes.length,
  };
}

const SYMBOL: Record<ChangeKind, string> = { added: '+', removed: '−', changed: '~' };

export function symbolOf(kind: ChangeKind): string {
  return SYMBOL[kind];
}

/** One line per change, for copying: "+ $.c: 4", "~ $.b: 2 → 3". */
export function reportText(changes: Change[]): string {
  return changes
    .map((c) =>
      c.kind === 'changed'
        ? `~ ${c.path}: ${c.before} → ${c.after}`
        : `${SYMBOL[c.kind]} ${c.path}: ${c.kind === 'added' ? c.after : c.before}`,
    )
    .join('\n');
}

export function shouldDebounce(a: string, b: string): boolean {
  return a.length + b.length > DEBOUNCE_THRESHOLD;
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/json-diff`
Expected: PASS (10 tests).

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/json-diff/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'json-diff',
  category: 'data',
  icon: 'git-compare-arrows',
  slug: { es: 'comparar-json', en: 'json-diff' },
  name: { es: 'Comparar JSON', en: 'JSON diff' },
  title: {
    es: 'Comparar dos JSON: diferencias sin importar el orden',
    en: 'JSON diff: compare two JSON documents by structure',
  },
  description: {
    es: 'Compara dos JSON por estructura y lista las claves añadidas, eliminadas y cambiadas con su ruta, sin que importe el orden de las claves. En tu navegador.',
    en: 'Compare two JSON documents by structure and list added, removed and changed keys with their path, whatever the key order. Runs in your browser.',
  },
  keywords: {
    es: [
      'comparar json',
      'diferencias json',
      'json diff',
      'comparar dos json',
      'diff json online',
      'cambios json',
    ],
    en: [
      'json diff',
      'compare json',
      'json compare online',
      'json differences',
      'diff two json',
      'json changes',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Importa el orden de las claves?',
        a: 'No. {"a":1,"b":2} y {"b":2,"a":1} son equivalentes. En las listas sí importa: se comparan posición a posición, así que insertar un elemento al principio cambia todos los que van detrás.',
      },
      {
        q: '¿Por qué 1 y 1.0 salen iguales?',
        a: 'Porque en JSON son el mismo número. La comparación se hace sobre los valores ya leídos, no sobre el texto, así que tampoco cuentan los espacios ni los saltos de línea.',
      },
    ],
    en: [
      {
        q: 'Does key order matter?',
        a: 'No. {"a":1,"b":2} and {"b":2,"a":1} are equivalent. In lists order does matter: they are compared position by position, so inserting an item at the start changes every item after it.',
      },
      {
        q: 'Why are 1 and 1.0 equal?',
        a: 'Because in JSON they are the same number. The comparison works on the parsed values, not the text, so spaces and line breaks do not count either.',
      },
    ],
  },
};
```

`src/tools/json-diff/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    original: 'Original',
    modified: 'Modificado',
    originalPlaceholder: '{"nombre": "Ana", "edad": 34}',
    modifiedPlaceholder: '{"edad": 35, "nombre": "Ana", "ciudad": "Madrid"}',
    jsonError: 'JSON no válido en la línea {line}, columna {column}',
    jsonErrorNoLine: 'El JSON no es válido',
    filter: 'Mostrar',
    all: 'Todas',
    added: 'Añadidas',
    removed: 'Eliminadas',
    changed: 'Cambiadas',
    addedOne: '{n} añadida',
    addedMany: '{n} añadidas',
    removedOne: '{n} eliminada',
    removedMany: '{n} eliminadas',
    changedOne: '{n} cambiada',
    changedMany: '{n} cambiadas',
    kindAdded: 'añadida',
    kindRemoved: 'eliminada',
    kindChanged: 'cambiada',
    result: 'Diferencias',
    equal: 'Los dos JSON son equivalentes (el orden de las claves no importa)',
    empty: 'Pega los dos JSON y aquí verás qué cambia.',
    waiting: 'Falta el otro JSON.',
    arrays: 'En las listas, el orden importa: se comparan posición a posición.',
    more: '… y {n} más',
    noneOfKind: 'No hay diferencias de este tipo.',
    copyReport: 'Copiar informe',
    swap: 'Intercambiar',
  },
  en: {
    original: 'Original',
    modified: 'Modified',
    originalPlaceholder: '{"name": "Ana", "age": 34}',
    modifiedPlaceholder: '{"age": 35, "name": "Ana", "city": "Madrid"}',
    jsonError: 'Invalid JSON at line {line}, column {column}',
    jsonErrorNoLine: 'The JSON is not valid',
    filter: 'Show',
    all: 'All',
    added: 'Added',
    removed: 'Removed',
    changed: 'Changed',
    addedOne: '{n} added',
    addedMany: '{n} added',
    removedOne: '{n} removed',
    removedMany: '{n} removed',
    changedOne: '{n} changed',
    changedMany: '{n} changed',
    kindAdded: 'added',
    kindRemoved: 'removed',
    kindChanged: 'changed',
    result: 'Differences',
    equal: 'Both JSON documents are equivalent (key order does not matter)',
    empty: 'Paste both JSON documents and you will see what changes here.',
    waiting: 'The other JSON is missing.',
    arrays: 'In lists order matters: they are compared position by position.',
    more: '… and {n} more',
    noneOfKind: 'No differences of this kind.',
    copyReport: 'Copy report',
    swap: 'Swap',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/json-diff/content.es.md`:
```md
## Cómo funciona

Pega el JSON original a la izquierda y el modificado a la derecha. La herramienta los lee y compara su **estructura**, no el texto: da igual el orden de las claves, los espacios o que un número se escriba `1` o `1.0`. Cada diferencia sale con su ruta (`$.usuarios[0].email`) y un símbolo: `+` si la clave solo está en el modificado, `−` si solo está en el original y `~` si está en los dos con otro valor.

Arriba verás el resumen («2 añadidas · 1 eliminada · 3 cambiadas») y un filtro para ver solo un tipo de cambio. «Copiar informe» copia la lista en texto, una línea por cambio, para pegarla en una incidencia o en una revisión de código.

## Listas y documentos grandes

Las listas se comparan **posición a posición**: si insertas un elemento al principio, todos los que van detrás aparecerán como cambiados. La comparación recorre el documento sin recursión, así que aguanta JSON con miles de niveles de anidamiento, y se muestran como mucho 5000 cambios.
```

`src/tools/json-diff/content.en.md`:
```md
## How it works

Paste the original JSON on the left and the modified one on the right. The tool parses both and compares their **structure**, not their text: key order, whitespace and whether a number is written `1` or `1.0` make no difference. Each difference comes with its path (`$.users[0].email`) and a symbol: `+` when the key is only in the modified document, `−` when it is only in the original and `~` when both have it with a different value.

At the top you get a summary (“2 added · 1 removed · 3 changed”) and a filter to see one kind of change. “Copy report” copies the list as text, one line per change, ready to paste into an issue or a code review.

## Lists and large documents

Lists are compared **position by position**: if you insert an item at the start, every item after it shows up as changed. The comparison walks the document without recursion, so it copes with JSON nested thousands of levels deep, and it lists up to 5000 changes.
```

- [ ] **Step 8: `src/tools/json-diff/JsonDiff.svelte`**

El `$effect` calcula en variables locales y asigna al final. Si leyera `parsedA` después de escribirlo, Svelte entraría en un bucle (`effect_update_depth_exceeded`): lo detectó la comprobación de navegador al escribir este plan.

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
  import { parseJson, type ParseResult } from '../json/logic';
  import type { Locale } from '../types';
  import {
    diffJson,
    reportText,
    shouldDebounce,
    symbolOf,
    type ChangeKind,
    type DiffResult,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const left = persistedInput('json-diff', '', remember);
  const right = persistedInput('json-diff-b', '', remember);

  let filter = $state<'all' | ChangeKind>('all');
  let parsedA = $state<ParseResult | null>(null);
  let parsedB = $state<ParseResult | null>(null);
  let result = $state<DiffResult | null>(null);

  $effect(() => {
    const a = left.value;
    const b = right.value;
    const run = () => {
      // Local copies: reading the  just written would make this effect depend on it.
      const pa = a.trim() ? parseJson(a) : null;
      const pb = b.trim() ? parseJson(b) : null;
      parsedA = pa;
      parsedB = pb;
      result = pa?.ok && pb?.ok ? diffJson(pa.value, pb.value) : null;
    };
    if (!shouldDebounce(a, b)) {
      run();
      return;
    }
    const timer = setTimeout(run, 150);
    return () => clearTimeout(timer);
  });

  function errorOf(p: ParseResult | null): string | undefined {
    if (!p || p.ok) return undefined;
    const { line, column } = p.error;
    return line ? fill(s.jsonError, { line, column: column ?? 1 }) : s.jsonErrorNoLine;
  }

  const count = (n: number, one: string, many: string) => fill(n === 1 ? one : many, { n });
  const total = $derived(
    result ? result.counts.added + result.counts.removed + result.counts.changed : 0,
  );
  const summary = $derived(
    result
      ? [
          count(result.counts.added, s.addedOne, s.addedMany),
          count(result.counts.removed, s.removedOne, s.removedMany),
          count(result.counts.changed, s.changedOne, s.changedMany),
        ].join(' · ')
      : '',
  );
  const shown = $derived(
    result ? result.changes.filter((c) => filter === 'all' || c.kind === filter) : [],
  );
  const kindLabel = $derived({
    added: s.kindAdded,
    removed: s.kindRemoved,
    changed: s.kindChanged,
  });

  function swap() {
    const a = left.value;
    left.value = right.value;
    right.value = a;
  }
</script>

<div class="panel">
  <div class="inputs">
    <Field id="json-diff-a" label={s.original} error={errorOf(parsedA)}>
      {#snippet children({ describedby })}
        <TextArea
          id="json-diff-a"
          bind:value={left.value}
          placeholder={s.originalPlaceholder}
          {describedby}
          invalid={!!errorOf(parsedA)}
          rows={10}
        />
      {/snippet}
    </Field>
    <Field id="json-diff-b" label={s.modified} error={errorOf(parsedB)}>
      {#snippet children({ describedby })}
        <TextArea
          id="json-diff-b"
          bind:value={right.value}
          placeholder={s.modifiedPlaceholder}
          {describedby}
          invalid={!!errorOf(parsedB)}
          rows={10}
        />
      {/snippet}
    </Field>
  </div>

  <Segmented
    label={s.filter}
    options={[
      { value: 'all', label: s.all },
      { value: 'added', label: s.added },
      { value: 'removed', label: s.removed },
      { value: 'changed', label: s.changed },
    ]}
    bind:value={filter}
  />

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={!result ? 'idle' : total === 0 ? 'ok' : 'bad'}
        label={!result ? t(locale, 'led.idle') : total === 0 ? s.equal : summary}
      />
    {/snippet}
    {#if !result}
      <p class="display-note">{parsedA?.ok || parsedB?.ok ? s.waiting : s.empty}</p>
    {:else if total > 0}
      {#if shown.length}
        <ul class="display-rows changes">
          {#each shown as c, i (i)}
            <li class="display-row change {c.kind}">
              <span class="sym" aria-hidden="true">{symbolOf(c.kind)}</span>
              <span class="visually-hidden">{kindLabel[c.kind]}</span>
              <span class="body">
                <span class="path">{c.path}</span>
                <span class="vals">
                  {#if c.kind === 'changed'}{c.before} → {c.after}{:else if c.kind === 'added'}{c.after}{:else}{c.before}{/if}
                </span>
              </span>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="display-note">{s.noneOfKind}</p>
      {/if}
      {#if result.hidden > 0}<p class="display-note">{fill(s.more, { n: result.hidden })}</p>{/if}
      <p class="display-note">{s.arrays}</p>
    {/if}
  </Display>

  <div class="row">
    <CopyButton
      main
      value={result && total > 0 ? reportText(result.changes) : ''}
      {locale}
      label={s.copyReport}
    />
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
  .changes {
    max-height: 60vh;
    overflow: auto;
    list-style: none;
    padding: 0;
  }
  .change {
    justify-content: flex-start;
    align-items: flex-start;
  }
  .sym {
    flex-shrink: 0;
    width: 1.2em;
    font-weight: 700;
    text-align: center;
  }
  .added .sym {
    color: var(--ok);
  }
  .removed .sym {
    color: var(--bad);
  }
  .body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .vals {
    font-size: 13px;
    color: var(--disp-dim);
    letter-spacing: 0;
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as jsonDiff } from './json-diff/meta';
```
→
```ts
import { meta as jsonDiff } from './json-diff/meta';
```
y
```ts
  // jsonDiff,
```
→
```ts
  jsonDiff,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import JsonDiff from '../tools/json-diff/JsonDiff.svelte';
```
→
```astro
import JsonDiff from '../tools/json-diff/JsonDiff.svelte';
```
y
```astro
{/* {id === 'json-diff' && <JsonDiff client:load locale={locale} />} */}
```
→
```astro
{id === 'json-diff' && <JsonDiff client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/comparar-json.html dist/en/json-diff.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `json-diff` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador (desechable, puerto 4675)**

Crea `.check-json-diff.mjs` en la raíz del worktree:
```js
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4675';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));

await page.goto(`${BASE}/es/comparar-json`);
await page.locator('#json-diff-a').fill('{"a":1,"b":2}');
await page.locator('#json-diff-b').fill('{"b":3,"a":1,"c":4}');
assert.equal(await page.locator('.display-head').innerText(), '1 añadida · 0 eliminadas · 1 cambiada');
assert.deepEqual(await page.locator('.changes .path').allInnerTexts(), ['$.b', '$.c']);
await page.getByRole('radio', { name: 'Añadidas', exact: true }).click();
assert.equal(await page.locator('.changes li').count(), 1);

await page.locator('#json-diff-b').fill('{"b":2,"a":1.0}');
assert.match(await page.locator('.display-head').innerText(), /equivalentes/);
await page.locator('#json-diff-b').fill('{"b":');
assert.equal(await page.locator('#json-diff-b-error').innerText(), 'JSON no válido en la línea 1, columna 6');

await browser.close();
assert.deepEqual(errors, []);
console.log('OK json-diff');
```

Run:
```bash
./node_modules/.bin/astro preview --port 4675 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
until curl -sf -o /dev/null http://localhost:4675/es; do sleep 0.5; done
node .check-json-diff.mjs
kill $PREVIEW
rm .check-json-diff.mjs
```
Expected: la última línea es `OK json-diff` y no hay ningún error de página. Si falla un paso, arregla el componente, no la comprobación.

A mano, con `pnpm preview`, en `/es/comparar-json` y `/en/json-diff`, primero en el tema claro y luego en oscuro y terminal, a 390 px y a 1280 px de ancho:
1. `{"a":1,"b":2}` frente a `{"b":3,"a":1,"c":4}` → «1 añadida · 0 eliminadas · 1 cambiada», con `~ $.b 2 → 3` y `+ $.c 4`.
2. Filtro «Añadidas» → una fila; `c` copia el informe entero (`~ $.b: 2 → 3` y `+ $.c: 4`).
3. Cambia el modificado a `{"b":2,"a":1.0}` → LED verde «Los dos JSON son equivalentes…».
4. Un JSON roto en el modificado → el error sale bajo su campo, con línea y columna.
5. «Intercambiar» cambia los dos lados; recarga y los dos siguen (recordar activado).

- [ ] **Step 12: Commit**

```bash
git add src/tools/json-diff src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (tampoco `.check-json-diff.mjs`, que ya se borró). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(json-diff): comparar dos JSON por estructura, sin importar el orden"
```

---

### Task 6: Markdown: vista previa GFM saneada con DOMPurify (el único `{@html}` del sitio)

**Files:**
- Create: `src/tools/markdown/logic.ts`, `src/tools/markdown/logic.test.ts`, `src/tools/markdown/sanitize.ts`, `src/tools/markdown/meta.ts`, `src/tools/markdown/strings.ts`, `src/tools/markdown/content.es.md`, `src/tools/markdown/content.en.md`, `src/tools/markdown/Markdown.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `marked` y `dompurify` (Task 0); `fill`; `t` (`ui.clear`, `tool.remember`); kit: `Segmented` (`main`), `Field`, `TextArea`, `Toggle`, `Display`, `CopyButton`, `Button` y `persistedInput`.
- Produces:
  - `logic.ts`: `renderMarkdown(md): string` (HTML **sin sanear**), `DEBOUNCE_MS = 150`, `SAMPLE`
  - `sanitize.ts` (solo cliente): `sanitize(dirty, { externalImages }): { html; blocked }`, `PURIFY_CONFIG`, `BLOCKED_CLASS = 'md-blocked'`
  - `meta: ToolMeta` (id `markdown`, slugs `vista-previa-markdown` / `markdown-preview`), `strings: Record<Locale, …>` y el componente `Markdown` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 14: `#markdown-input`, `.md-preview` (el HTML saneado), las pestañas «Vista previa» y «HTML» (`role="radio"`), `.display-code` (el HTML saneado en texto) y el interruptor «Cargar imágenes externas» (`role="switch"`).

**§8.6 (vinculante):** `markdown` · data · pestañas Vista previa · HTML. `renderMarkdown` con `marked.parse(md, { gfm: true, breaks: false, async: false })`, sin sanear. `sanitize.ts`, solo de cliente: DOMPurify con `USE_PROFILES: { html: true }` y `FORBID_TAGS` `style`, `form`, `button`, `textarea`, `select`, `iframe`, `object`, `embed`, más un hook `afterSanitizeAttributes`: enlaces con `target="_blank"` y `rel="noopener noreferrer nofollow"`; `<input>` solo si es `checkbox`, siempre `disabled`; `<img>` con `src` `http(s)` pierde el `src` y se marca mientras «Cargar imágenes externas» esté desactivado; las `data:` se muestran. `{@html}` solo con esa salida. Sin DOM, `sanitize` devuelve `''`; el saneado va en un `$effect` con debounce de 150 ms. Se pinta dentro de `Display` (`.md-preview`) con `--disp-text`, `--disp-dim` y `--disp-line`, y todas las reglas bajo `.md-preview :global(…)`. La pestaña HTML usa `Display code` y copia el HTML saneado. Tests: `logic.test.ts` (encabezados, tablas GFM, listas de tareas, código) y e2e para el saneado. Recordar ✓.

Cómo se cubre cada punto:
- GFM: tests `renders headings and inline marks`, `renders GFM tables with alignment`, `renders task lists as checkboxes`, `escapes code blocks and keeps the language class`, `autolinks bare URLs and supports strikethrough` y `does not treat single line breaks as <br> (breaks: false)`.
- Nunca sin sanear: test `leaves raw HTML in place: that is why the output is never shown unsanitised` documenta el riesgo, y `fails closed: returns nothing instead of the dirty HTML` comprueba que sin DOM no pasa nada (Review Focus 1). Vitest corre en `node` y el repo no tiene `jsdom`: el saneado real se prueba en un navegador, en el Step 11 y en el e2e de la Task 14 (`<script>`, `onerror=`, `javascript:` e `<iframe>`).
- El hook registra una sola vez y solo cuando `DOMPurify.isSupported`, así que importar `sanitize.ts` en SSR no rompe nada.
- Imágenes externas: el hook cuenta las bloqueadas y la pantalla dice «Imágenes externas sin cargar: 1. Activa «Cargar imágenes externas» si te fías de su origen.». La comprobación del Step 11 intercepta `example.com` y verifica que no se pide nada hasta activar el interruptor.
- Estilos: todo el HTML inyectado se estiliza desde `Markdown.svelte` con `.md-preview :global(…)` y solo con tokens de la pantalla. `pnpm check:css` no lo puede comprobar: revísalo a mano (Step 11).
- ESLint: `svelte/no-at-html-tags` marca el `{@html}` como error; la línea lleva `eslint-disable-next-line` y un comentario que explica por qué es seguro. Es la única en todo el repo.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l3-markdown -b lote-3/markdown   # desde el commit de la Task 0
cd ../devtools-l3-markdown
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task (Segmented, Field, TextArea, Toggle, Display, CopyButton, Button) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real y dilo en el commit.

- [ ] **Step 2: Test (falla)**

`src/tools/markdown/logic.test.ts`:
````ts
import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './logic';
import { sanitize } from './sanitize';

describe('renderMarkdown (GFM)', () => {
  it('renders headings and inline marks', () => {
    expect(renderMarkdown('# Hola\n\nTexto **fuerte** y `code`')).toBe(
      '<h1>Hola</h1>\n<p>Texto <strong>fuerte</strong> y <code>code</code></p>\n',
    );
  });

  it('renders GFM tables with alignment', () => {
    const html = renderMarkdown('| a | b |\n|---|:-:|\n| 1 | 2 |');
    expect(html).toContain('<table>');
    expect(html).toContain('<th align="center">b</th>');
    expect(html).toContain('<td>1</td>');
  });

  it('renders task lists as checkboxes', () => {
    const html = renderMarkdown('- [x] hecho\n- [ ] pendiente');
    expect(html).toContain('<li><input checked="" disabled="" type="checkbox"> hecho</li>');
    expect(html).toContain('<li><input disabled="" type="checkbox"> pendiente</li>');
  });

  it('escapes code blocks and keeps the language class', () => {
    expect(renderMarkdown('```js\nconst a = 1 < 2;\n```')).toBe(
      '<pre><code class="language-js">const a = 1 &lt; 2;\n</code></pre>\n',
    );
  });

  it('autolinks bare URLs and supports strikethrough', () => {
    expect(renderMarkdown('Ver https://example.com y ~~no~~')).toBe(
      '<p>Ver <a href="https://example.com">https://example.com</a> y <del>no</del></p>\n',
    );
  });

  it('does not treat single line breaks as <br> (breaks: false)', () => {
    expect(renderMarkdown('uno\ndos')).toBe('<p>uno\ndos</p>\n');
  });

  it('leaves raw HTML in place: that is why the output is never shown unsanitised', () => {
    expect(renderMarkdown('<script>alert(1)</script>')).toContain('<script>');
  });
});

describe('sanitize without a DOM', () => {
  it('fails closed: returns nothing instead of the dirty HTML', () => {
    expect(
      sanitize('<img src=x onerror="alert(1)"><script>alert(1)</script>', {
        externalImages: false,
      }),
    ).toEqual({ html: '', blocked: 0 });
  });
});
````

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/markdown`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/markdown/logic.ts`**

`logic.ts` solo convierte: su salida **nunca** se pinta tal cual. `marked` se importa aquí y `dompurify` en `sanitize.ts`, los dos solo desde esta carpeta.

```ts
import { marked } from 'marked';

/** Above this size the preview waits for a pause in typing. */
export const DEBOUNCE_MS = 150;

export const SAMPLE = `# Título

Texto con **negrita**, *cursiva*, \`código\` y un [enlace](https://example.com).

- [x] Tarea hecha
- [ ] Tarea pendiente

| Columna | Valor |
|---|---:|
| a | 1 |
`;

/**
 * GitHub-flavoured Markdown to HTML. The result is NOT sanitised: it must go through
 * `sanitize()` (sanitize.ts) before it is ever put in the page.
 */
export function renderMarkdown(md: string): string {
  return marked.parse(md, { gfm: true, breaks: false, async: false }) as string;
}
```

`src/tools/markdown/sanitize.ts`, el único módulo del repo que solo funciona en el navegador. Falla cerrado: DOMPurify sin DOM devuelve la entrada sin tocar (`if (!DOMPurify.isSupported) return dirty`, comprobado en `dist/purify.es.mjs` 3.4.16), así que aquí se devuelve `''`. El hook se registra una sola vez y lee el interruptor de imágenes de una variable del módulo:
```ts
import DOMPurify from 'dompurify';

export const BLOCKED_CLASS = 'md-blocked';

export const PURIFY_CONFIG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['style', 'form', 'button', 'textarea', 'select', 'iframe', 'object', 'embed'],
};

export interface Sanitized {
  html: string;
  /** External images that lost their `src` because loading them is off. */
  blocked: number;
}

let loadExternal = false;
let blocked = 0;
let hooked = false;

const EXTERNAL = /^(?:https?:)?\/\//i;

function afterSanitizeAttributes(node: Element): void {
  const tag = node.nodeName;
  if (tag === 'A' && node.hasAttribute('href')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer nofollow');
  } else if (tag === 'INPUT') {
    // Only GFM task-list checkboxes survive, and never as working controls.
    if (node.getAttribute('type') !== 'checkbox') node.remove();
    else node.setAttribute('disabled', '');
  } else if (tag === 'IMG' && !loadExternal) {
    const src = node.getAttribute('src') ?? '';
    if (EXTERNAL.test(src.trim())) {
      node.removeAttribute('src');
      node.removeAttribute('srcset');
      node.classList.add(BLOCKED_CLASS);
      blocked++;
    }
  }
}

/**
 * Browser only. Without a DOM (SSR, Vitest's node environment) DOMPurify would hand the input
 * back untouched, so this fails closed and returns nothing.
 */
export function sanitize(dirty: string, opts: { externalImages: boolean }): Sanitized {
  if (!DOMPurify.isSupported) return { html: '', blocked: 0 };
  if (!hooked) {
    DOMPurify.addHook('afterSanitizeAttributes', afterSanitizeAttributes);
    hooked = true;
  }
  loadExternal = opts.externalImages;
  blocked = 0;
  const html = DOMPurify.sanitize(dirty, PURIFY_CONFIG);
  return { html, blocked };
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/markdown`
Expected: PASS (8 tests).

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/markdown/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'markdown',
  category: 'data',
  icon: 'file-text',
  slug: { es: 'vista-previa-markdown', en: 'markdown-preview' },
  name: { es: 'Markdown', en: 'Markdown' },
  title: {
    es: 'Vista previa de Markdown online (GFM) y a HTML',
    en: 'Markdown preview online (GFM) and Markdown to HTML',
  },
  description: {
    es: 'Escribe Markdown y ve el resultado al momento, con tablas, listas de tareas y código de GitHub. Copia el HTML ya saneado. Todo en tu navegador.',
    en: 'Write Markdown and see it rendered instantly, with GitHub tables, task lists and code blocks. Copy the sanitised HTML. Runs in your browser.',
  },
  keywords: {
    es: [
      'vista previa markdown',
      'markdown a html',
      'editor markdown online',
      'gfm',
      'markdown github',
      'convertir markdown',
    ],
    en: [
      'markdown preview',
      'markdown to html',
      'online markdown editor',
      'gfm',
      'github markdown',
      'convert markdown',
    ],
  },
  tabs: { es: ['Vista previa', 'HTML'], en: ['Preview', 'HTML'] },
  faq: {
    es: [
      {
        q: '¿Se ejecuta el HTML o el JavaScript que escribo?',
        a: 'No. Antes de mostrarlo, el HTML pasa por DOMPurify, que quita scripts, atributos como onerror y enlaces javascript:. Formularios, iframes y estilos también se eliminan.',
      },
      {
        q: '¿Por qué no se ven mis imágenes?',
        a: 'Las imágenes de otros servidores no se cargan hasta que activas «Cargar imágenes externas», para que la vista previa no avise a nadie de que la estás abriendo. Las imágenes data: sí se muestran.',
      },
    ],
    en: [
      {
        q: 'Does the HTML or JavaScript I write run?',
        a: 'No. Before it is shown, the HTML goes through DOMPurify, which strips scripts, attributes such as onerror and javascript: links. Forms, iframes and styles are removed too.',
      },
      {
        q: 'Why are my images not showing?',
        a: 'Images from other servers are not loaded until you turn on “Load external images”, so the preview does not tell anyone you are opening it. data: images are shown.',
      },
    ],
  },
};
```

`src/tools/markdown/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    view: 'Vista',
    input: 'Markdown',
    placeholder: 'Escribe o pega Markdown: # Título, **negrita**, - [ ] tarea, | tabla |',
    externalImages: 'Cargar imágenes externas',
    preview: 'Vista previa',
    html: 'HTML saneado',
    empty: 'Escribe Markdown a la izquierda y aquí verás cómo queda.',
    blocked:
      'Imágenes externas sin cargar: {n}. Activa «Cargar imágenes externas» si te fías de su origen.',
    sanitized: 'Saneado con DOMPurify',
    copyHtml: 'Copiar HTML',
    sample: 'Cargar un ejemplo',
  },
  en: {
    view: 'View',
    input: 'Markdown',
    placeholder: 'Type or paste Markdown: # Title, **bold**, - [ ] task, | table |',
    externalImages: 'Load external images',
    preview: 'Preview',
    html: 'Sanitised HTML',
    empty: 'Type Markdown on the left and you will see how it looks here.',
    blocked: 'External images not loaded: {n}. Turn on “Load external images” if you trust them.',
    sanitized: 'Sanitised with DOMPurify',
    copyHtml: 'Copy HTML',
    sample: 'Load an example',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/markdown/content.es.md`:
```md
## Cómo funciona

Escribe o pega Markdown y la vista previa se actualiza mientras escribes. Usa el dialecto de GitHub (GFM): tablas con alineación, listas de tareas con `- [ ]` y `- [x]`, bloques de código con su lenguaje, texto tachado con `~~` y enlaces automáticos para las URL sueltas. Un salto de línea simple no parte el párrafo, igual que en GitHub; deja una línea en blanco para empezar otro.

La pestaña **HTML** muestra el código que genera el Markdown, listo para copiar y pegar en una web, un correo o un CMS.

## Seguridad

Markdown admite HTML dentro del texto, así que un documento puede traer un `<script>` o un `onerror`. Antes de mostrar nada, el HTML pasa por DOMPurify, que elimina scripts, manejadores de eventos, enlaces `javascript:`, formularios e iframes. Lo que copias es ese HTML saneado. Los enlaces se abren en otra pestaña y las imágenes de otros servidores no se cargan hasta que lo permites.
```

`src/tools/markdown/content.en.md`:
```md
## How it works

Type or paste Markdown and the preview updates as you type. It uses GitHub's dialect (GFM): tables with alignment, task lists with `- [ ]` and `- [x]`, code blocks with their language, strikethrough with `~~` and automatic links for bare URLs. A single line break does not split the paragraph, just like on GitHub; leave a blank line to start a new one.

The **HTML** tab shows the code the Markdown produces, ready to copy into a web page, an email or a CMS.

## Security

Markdown allows HTML inside the text, so a document can carry a `<script>` or an `onerror`. Before anything is shown, the HTML goes through DOMPurify, which removes scripts, event handlers, `javascript:` links, forms and iframes. What you copy is that sanitised HTML. Links open in a new tab and images from other servers are not loaded until you allow it.
```

- [ ] **Step 8: `src/tools/markdown/Markdown.svelte`**

`safe` es `null` en SSR y se rellena en un `$effect` con debounce de 150 ms: en el servidor se pinta el estado vacío y el saneado ocurre en el navegador. El `{@html}` va dentro de `Display`, en `.md-preview`, y solo recibe `safe.html`.

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { DEBOUNCE_MS, SAMPLE, renderMarkdown } from './logic';
  import { meta } from './meta';
  import { sanitize, type Sanitized } from './sanitize';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('markdown', '', meta.rememberInput ?? true);

  let tab = $state<'preview' | 'html'>('preview');
  let externalImages = $state(false);
  // Stays null during SSR: DOMPurify only runs in the browser, inside this effect.
  let safe = $state<Sanitized | null>(null);

  $effect(() => {
    const md = input.value;
    const external = externalImages;
    if (!md.trim()) {
      safe = null;
      return;
    }
    const timer = setTimeout(
      () => (safe = sanitize(renderMarkdown(md), { externalImages: external })),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  });

  const html = $derived(safe?.html ?? '');
</script>

<div class="stack">
  <Segmented
    main
    label={s.view}
    options={[
      { value: 'preview', label: meta.tabs![locale][0] },
      { value: 'html', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    <Field id="markdown-input" label={s.input}>
      {#snippet children({ describedby })}
        <TextArea
          id="markdown-input"
          bind:value={input.value}
          placeholder={s.placeholder}
          {describedby}
          rows={12}
        />
      {/snippet}
    </Field>

    <Toggle bind:checked={externalImages} label={s.externalImages} />

    {#if tab === 'preview'}
      <Display live label={s.preview}>
        {#snippet head()}
          <span>{s.preview}</span>
          {#if html}<span>{s.sanitized}</span>{/if}
        {/snippet}
        {#if html}
          <div class="md-preview">
            <!-- The only {@html} on the site: `html` always comes out of sanitize() (DOMPurify). -->
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html html}
          </div>
          {#if safe && safe.blocked > 0}
            <p class="display-note">{fill(s.blocked, { n: safe.blocked })}</p>
          {/if}
        {:else}
          <p class="display-note">{s.empty}</p>
        {/if}
      </Display>
    {:else}
      <Display live label={s.html}>
        {#snippet head()}
          <span>{s.html}</span>
          {#if html}<span>{s.sanitized}</span>{/if}
        {/snippet}
        {#if html}
          <pre class="display-code">{html}</pre>
        {:else}
          <p class="display-note">{s.empty}</p>
        {/if}
      </Display>
    {/if}

    <div class="row">
      <CopyButton main value={html} {locale} label={s.copyHtml} />
      <Button variant="ghost" onclick={() => (input.value = SAMPLE)}>{s.sample}</Button>
      <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}
        >{t(locale, 'ui.clear')}</Button
      >
    </div>
    <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
  </div>
</div>

<style>
  /* The injected HTML has no Svelte scope class: every rule for it goes through :global. */
  .md-preview {
    max-height: 70vh;
    overflow: auto;
    font: 400 15px/1.6 var(--font-body);
    color: var(--disp-text);
    overflow-wrap: anywhere;
  }
  .md-preview :global(:first-child) {
    margin-top: 0;
  }
  .md-preview :global(h1),
  .md-preview :global(h2),
  .md-preview :global(h3),
  .md-preview :global(h4),
  .md-preview :global(h5),
  .md-preview :global(h6) {
    margin: 20px 0 8px;
    font-weight: 700;
    line-height: 1.25;
  }
  .md-preview :global(h1) {
    font-size: 1.7em;
  }
  .md-preview :global(h2) {
    font-size: 1.4em;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--disp-line);
  }
  .md-preview :global(h3) {
    font-size: 1.2em;
  }
  .md-preview :global(p),
  .md-preview :global(ul),
  .md-preview :global(ol),
  .md-preview :global(blockquote),
  .md-preview :global(pre),
  .md-preview :global(table) {
    margin: 0 0 12px;
  }
  .md-preview :global(ul),
  .md-preview :global(ol) {
    padding-left: 1.4em;
  }
  .md-preview :global(li:has(> input[type='checkbox'])) {
    list-style: none;
    margin-left: -1.4em;
  }
  .md-preview :global(input[type='checkbox']) {
    margin: 0 6px 0 0;
    accent-color: var(--disp-text);
  }
  .md-preview :global(a) {
    color: var(--disp-text);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .md-preview :global(code) {
    font: 400 0.9em var(--font-mono);
  }
  .md-preview :global(:not(pre) > code) {
    padding: 1px 5px;
    border: 1px solid var(--disp-line);
    border-radius: 4px;
  }
  .md-preview :global(pre) {
    padding: 12px;
    overflow: auto;
    border: 1px solid var(--disp-line);
    border-radius: 6px;
  }
  .md-preview :global(blockquote) {
    padding-left: 12px;
    border-left: 3px solid var(--disp-line);
    color: var(--disp-dim);
  }
  .md-preview :global(table) {
    display: block;
    max-width: 100%;
    overflow: auto;
    border-collapse: collapse;
  }
  .md-preview :global(th),
  .md-preview :global(td) {
    padding: 6px 12px;
    border: 1px solid var(--disp-line);
  }
  .md-preview :global(hr) {
    margin: 16px 0;
    border: 0;
    border-top: 1px solid var(--disp-line);
  }
  .md-preview :global(del) {
    color: var(--disp-dim);
  }
  .md-preview :global(img) {
    max-width: 100%;
  }
  .md-preview :global(img.md-blocked) {
    display: inline-block;
    min-width: 120px;
    min-height: 48px;
    border: 1px dashed var(--disp-line);
    color: var(--disp-dim);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as markdown } from './markdown/meta';
```
→
```ts
import { meta as markdown } from './markdown/meta';
```
y
```ts
  // markdown,
```
→
```ts
  markdown,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Markdown from '../tools/markdown/Markdown.svelte';
```
→
```astro
import Markdown from '../tools/markdown/Markdown.svelte';
```
y
```astro
{/* {id === 'markdown' && <Markdown client:load locale={locale} />} */}
```
→
```astro
{id === 'markdown' && <Markdown client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/vista-previa-markdown.html dist/en/markdown-preview.html
grep -l 'ALLOWED_URI_REGEXP' dist/_astro/*.js
grep -l 'walkTokens' dist/_astro/*.js
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `markdown` y sus dos `content.*.md`), y existen las dos páginas. Cada `grep -l` lista **un solo archivo**, `dist/_astro/Markdown.<hash>.js`: la librería está en el chunk de esta herramienta y en ningún otro. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints). Comprueba también que es el único `{@html}` del repo: `grep -rnF '{@html ' src` lista **una sola línea**, la de `{@html html}` en `src/tools/markdown/Markdown.svelte` (el comentario de encima escribe `{@html}` sin espacio y no cuenta).

- [ ] **Step 11: Comprobación de navegador (desechable, puerto 4676)**

Crea `.check-markdown.mjs` en la raíz del worktree:
```js
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4676';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
// The preview must never contact third parties: fail loudly if it tries.
const external = [];
await page.route('https://example.com/**', (r) => {
  external.push(r.request().url());
  return r.abort();
});

await page.goto(`${BASE}/es/vista-previa-markdown`);
await page
  .locator('#markdown-input')
  .fill(
    '# Hola\n\n<img src=x onerror="window.__xss=1">\n<script>window.__xss2=1</script>\n\n' +
      '[x](javascript:alert(1)) <iframe src="https://example.com"></iframe>\n\n' +
      '![logo](https://example.com/a.png)\n\n- [x] hecho\n\n<input type="text" value="no"> <form><button>b</button></form>',
  );
await page.locator('.md-preview h1').waitFor();
const dom = await page.evaluate(() => {
  const root = document.querySelector('.md-preview');
  return {
    xss: '__xss' in window || '__xss2' in window,
    h1: root.querySelector('h1')?.textContent,
    bad: root.querySelectorAll('script, [onerror], a[href^="javascript"], iframe, form, button, input[type="text"]').length,
    blocked: root.querySelectorAll('img.md-blocked:not([src])').length,
    checkbox: root.querySelectorAll('input[type="checkbox"][disabled]').length,
  };
});
assert.deepEqual(dom, { xss: false, h1: 'Hola', bad: 0, blocked: 1, checkbox: 1 });
assert.match(await page.locator('.display').innerText(), /Imágenes externas sin cargar: 1/);
assert.deepEqual(external, []);

await page.getByRole('radio', { name: 'HTML', exact: true }).click();
const html = await page.locator('.display-code').innerText();
assert.ok(html.startsWith('<h1>Hola</h1>'));
assert.ok(!/onerror|<script|javascript:|<iframe/.test(html));

await page.getByRole('radio', { name: 'Vista previa', exact: true }).click();
await page.getByRole('switch', { name: 'Cargar imágenes externas' }).check();
await page.waitForTimeout(400);
assert.equal(await page.locator('.md-preview img[alt="logo"]').getAttribute('src'), 'https://example.com/a.png');

await browser.close();
assert.deepEqual(errors, []);
console.log('OK markdown');
```

Run:
```bash
./node_modules/.bin/astro preview --port 4676 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
until curl -sf -o /dev/null http://localhost:4676/es; do sleep 0.5; done
node .check-markdown.mjs
kill $PREVIEW
rm .check-markdown.mjs
```
Expected: la última línea es `OK markdown` y no hay ningún error de página. Si falla un paso, arregla el componente, no la comprobación.

A mano, con `pnpm preview`, en `/es/vista-previa-markdown` y `/en/markdown-preview`, primero en el tema claro y luego en oscuro y terminal, a 390 px y a 1280 px de ancho:
1. Pulsa «Cargar un ejemplo»: título, negrita, código, un enlace que abre en otra pestaña, dos casillas desactivadas y una tabla con bordes.
2. Pega `<img src=x onerror="alert(1)">`, `<script>alert(1)</script>` y `[x](javascript:alert(1))`: no salta ninguna alerta, el enlace no lleva `href` y en la pestaña HTML no aparecen `onerror`, `<script>` ni `javascript:`.
3. `![logo](https://example.com/a.png)` → recuadro discontinuo y el aviso de imágenes sin cargar; en DevTools → Red no hay ninguna petición a `example.com` hasta activar «Cargar imágenes externas».
4. Revisa a mano, en los tres temas, que encabezados, tablas, citas, código y enlaces se leen bien sobre la pantalla y usan solo `--disp-text`, `--disp-dim` y `--disp-line` (no hay hash de ámbito que `pnpm check:css` pueda vigilar).
5. `c` copia el HTML saneado. Recarga: el Markdown sigue (recordar activado).

- [ ] **Step 12: Commit**

```bash
git add src/tools/markdown src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (tampoco `.check-markdown.mjs`, que ya se borró). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(markdown): vista previa de Markdown GFM saneada con DOMPurify"
```

---

### Task 7: cURL a fetch: tokenizador de bash, opciones de curl y avisos de lo que fetch no hace

**Files:**
- Create: `src/tools/curl/logic.ts`, `src/tools/curl/logic.test.ts`, `src/tools/curl/meta.ts`, `src/tools/curl/strings.ts`, `src/tools/curl/content.es.md`, `src/tools/curl/content.en.md`, `src/tools/curl/Curl.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `bytesToBase64` y `utf8` de `src/lib/bytes.ts`; `fill`; `t` (`led.idle`, `led.bad`, `ui.clear`); kit: `Field`, `TextArea`, `Display`, `Led`, `CopyButton` y `Button`. Sin `persistedInput` (`rememberInput: false`).
- Produces:
  - `tokenize(input): { ok: true; tokens } | { ok: false; error: 'unclosed-quote' | 'windows' }`
  - `parseCurl(input): { ok: true; request: CurlRequest; warnings: CurlWarning[] } | { ok: false; error: CurlError }` con `interface CurlRequest { url; method; headers; body; form; referrer; timeoutSeconds }`
  - `toFetch(request, locale): string`, `jsString(s)`
  - `meta: ToolMeta` (id `curl`, slugs `convertir-curl-a-fetch` / `curl-to-fetch-converter`), `strings: Record<Locale, …>` y el componente `Curl` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 14: `#curl-input`, `.display-code` (el código fetch) y `.warnings` (la lista de avisos).

**§8.7 (vinculante):** `curl` · data · sin pestañas · `rememberInput: false`. Tokenizador a mano: `\` + salto continúa; comillas simples literales; en dobles solo se escapan `\"`, `\\`, `\$`, la comilla invertida y el salto; `$'…'` con `\n \t \\ \' \" \xHH` y `\uHHHH`; fuera de comillas `\` escapa el siguiente carácter. El primer token es `curl` («El comando debe empezar por curl»); `^"` de Windows → «Copia el comando como "cURL (bash)"». Opciones de la tabla de la ficha (`-X`, `-H`, `-d` y variantes, `--data-urlencode`, `--json`, `-F`, `-u`, `-A`, `-e`, `-b`, `-G`, `-I`, `--url`, `-m`, las ignoradas y `-k`), cortas pegadas y agrupadas, y «Opción ignorada: --foo». Método: `-X`, si no HEAD con `-I`, POST con cuerpo o formulario sin `-G`, si no GET; `-d` sin `Content-Type` añade `application/x-www-form-urlencoded`. Salida `const response = await fetch(url, { … })` sin valores por defecto, comillas simples escapadas, claves entre comillas si no son identificadores, `JSON.stringify` con sangría 2 si el cuerpo es JSON y `FormData` sin `Content-Type` con `-F`. `-H` repetido → gana la última y se avisa.

Cómo se cubre cada punto:
- Tokenizador: tests de `tokenize` (comillas, partes pegadas, continuación de línea, `$'…'`, escapes fuera de comillas, comillas sin cerrar y `^"` de Windows).
- Opciones: un test por grupo de la tabla (método, cabeceras, `-d` y `@archivo`, `--data-urlencode`, `-G`, `--json`, `-u` con UTF-8, `-A`/`-b`/`-e`/`-k`, flags agrupados e ignorados, opciones desconocidas y `-F`).
- Salida: test `writes the spec example with JSON.stringify` (el mismo comando que el e2e, con el texto exacto), `leaves out every default`, `keeps a body that is not valid JSON as a string, escaped`, `writes FormData, the referrer and the timeout` y `quotes header names only when they are not identifiers`.
- Nada guardado: `meta.rememberInput = false`, el comando vive en un `$state` y no hay interruptor. La comprobación del Step 11 y el e2e revisan `localStorage`.
- Dos decisiones que la ficha no fija: una URL sin esquema recibe `http://`, como hace curl, con aviso; y las opciones desconocidas que llevan valor (`--proxy`, `--retry`, `-w`…) se saltan con su valor, para que el valor no se lea como la URL.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l3-curl -b lote-3/curl   # desde el commit de la Task 0
cd ../devtools-l3-curl
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task (Field, TextArea, Display, Led, CopyButton, Button) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real y dilo en el commit.

- [ ] **Step 2: Test (falla)**

`src/tools/curl/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { jsString, parseCurl, tokenize, toFetch, type CurlRequest } from './logic';

function request(cmd: string): CurlRequest {
  const r = parseCurl(cmd);
  if (!r.ok) throw new Error(`failed: ${JSON.stringify(r.error)}`);
  return r.request;
}

function warnings(cmd: string) {
  const r = parseCurl(cmd);
  if (!r.ok) throw new Error('failed');
  return r.warnings;
}

describe('tokenize', () => {
  it('handles single and double quotes', () => {
    expect(tokenize(`curl 'a b' "c \\"d\\" \\$e \\\\ \\x"`)).toEqual({
      ok: true,
      tokens: ['curl', 'a b', 'c "d" $e \\ \\x'],
    });
  });

  it('keeps single quotes literal and glues adjacent parts', () => {
    expect(tokenize(`curl -H'X-A: \\n'"b"c`)).toEqual({
      ok: true,
      tokens: ['curl', '-HX-A: \\nbc'],
    });
  });

  it('joins lines ending in a backslash', () => {
    expect(tokenize('curl \\\n  -X POST \\\r\n  https://a.test')).toEqual({
      ok: true,
      tokens: ['curl', '-X', 'POST', 'https://a.test'],
    });
  });

  it("understands ANSI-C quoting $'…'", () => {
    expect(tokenize(`curl $'a\\nb\\t\\x41\\u00e9\\'\\"\\\\'`)).toEqual({
      ok: true,
      tokens: ['curl', 'a\nb\tAé\'"\\'],
    });
  });

  it('escapes the next character outside quotes', () => {
    expect(tokenize('curl a\\ b\\"c')).toEqual({ ok: true, tokens: ['curl', 'a b"c'] });
  });

  it('reports unclosed quotes and Windows cmd quoting', () => {
    expect(tokenize(`curl 'abc`)).toEqual({ ok: false, error: 'unclosed-quote' });
    expect(tokenize('curl "abc')).toEqual({ ok: false, error: 'unclosed-quote' });
    expect(tokenize('curl ^"https://a.test^"')).toEqual({ ok: false, error: 'windows' });
  });
});

describe('parseCurl', () => {
  it('rejects what is not a curl command', () => {
    expect(parseCurl('')).toEqual({ ok: false, error: 'empty' });
    expect(parseCurl('wget https://a.test')).toEqual({ ok: false, error: 'not-curl' });
    expect(parseCurl('curl -X POST')).toEqual({ ok: false, error: 'no-url' });
    expect(parseCurl('curl https://a.test -H')).toEqual({
      ok: false,
      error: { kind: 'missing-value', option: '-H' },
    });
  });

  it('reads the URL with or without quotes, or from --url', () => {
    expect(request('curl https://a.test/x?y=1').url).toBe('https://a.test/x?y=1');
    expect(request("curl 'https://a.test/x?y=1&z=2'").url).toBe('https://a.test/x?y=1&z=2');
    expect(request('curl --url https://a.test -s').url).toBe('https://a.test');
  });

  it('adds http:// like curl when the scheme is missing', () => {
    expect(request('curl example.com').url).toBe('http://example.com');
    expect(warnings('curl example.com')).toEqual([{ kind: 'no-scheme' }]);
  });

  it('picks the method: -X, then -I, then POST with a body, else GET', () => {
    expect(request('curl -XPUT https://a.test -d x').method).toBe('PUT');
    expect(request('curl -I https://a.test').method).toBe('HEAD');
    expect(request('curl https://a.test -d x').method).toBe('POST');
    expect(request('curl https://a.test -F a=b').method).toBe('POST');
    expect(request('curl https://a.test').method).toBe('GET');
  });

  it('splits headers at the first colon; the last repeated one wins, with a warning', () => {
    const r = parseCurl('curl https://a.test -H "Accept: a" -H "X-Time: 10:30" -H "accept: b"');
    expect(r).toMatchObject({
      ok: true,
      request: {
        headers: [
          ['accept', 'b'],
          ['X-Time', '10:30'],
        ],
      },
      warnings: [{ kind: 'duplicate-header', name: 'accept' }],
    });
  });

  it('joins several -d with & and adds the form Content-Type like curl', () => {
    expect(request("curl https://a.test -d a=1 --data-raw '@b=2' --data-binary c=3")).toMatchObject(
      {
        body: 'a=1&@b=2&c=3',
        headers: [['Content-Type', 'application/x-www-form-urlencoded']],
      },
    );
  });

  it('warns that fetch cannot read @files', () => {
    expect(warnings('curl https://a.test -d @datos.json')).toEqual([
      { kind: 'data-file', file: 'datos.json' },
    ]);
  });

  it('encodes --data-urlencode values', () => {
    expect(
      request(
        "curl https://a.test --data-urlencode 'q=a b&c' --data-urlencode '=x y' --data-urlencode 'z/1'",
      ).body,
    ).toBe('q=a%20b%26c&x%20y&z%2F1');
  });

  it('moves data to the query string with -G', () => {
    expect(request('curl -G https://a.test/s?x=1 -d q=gato -d n=2')).toMatchObject({
      url: 'https://a.test/s?x=1&q=gato&n=2',
      method: 'GET',
      body: null,
      headers: [],
    });
  });

  it('adds JSON headers with --json unless they were given', () => {
    expect(request(`curl https://a.test --json '{"a":1}' -H 'Accept: text/plain'`).headers).toEqual(
      [
        ['Accept', 'text/plain'],
        ['Content-Type', 'application/json'],
      ],
    );
  });

  it('builds Basic auth from the UTF-8 of user:password', () => {
    expect(request('curl -u ana:contraseña https://a.test').headers).toEqual([
      ['Authorization', 'Basic YW5hOmNvbnRyYXNlw7Fh'],
    ]);
  });

  it('turns -A and -b into headers, with their notes', () => {
    const r = parseCurl('curl https://a.test -A mi-agente -b sesion=1 -e https://ref.test -k');
    expect(r).toMatchObject({
      ok: true,
      request: {
        headers: [
          ['User-Agent', 'mi-agente'],
          ['Cookie', 'sesion=1'],
        ],
        referrer: 'https://ref.test',
      },
      warnings: [{ kind: 'user-agent' }, { kind: 'cookie' }, { kind: 'insecure' }],
    });
  });

  it('accepts grouped flags and ignores the ones that do not apply to fetch', () => {
    const r = parseCurl('curl -sSLv --compressed -o out.txt https://a.test -m 2.5');
    expect(r).toMatchObject({ ok: true, request: { timeoutSeconds: 2.5 }, warnings: [] });
  });

  it('lists unknown options as ignored, skipping the value of known value options', () => {
    expect(warnings('curl --foo --proxy http://p:8080 https://a.test -Z')).toEqual([
      { kind: 'unknown-option', option: '--foo' },
      { kind: 'unknown-option', option: '--proxy' },
      { kind: 'unknown-option', option: '-Z' },
    ]);
  });

  it('reads -F fields and marks files', () => {
    const r = parseCurl('curl https://a.test -F nombre=Ana -F foto=@yo.jpg -H "Content-Type: x"');
    expect(r).toMatchObject({
      ok: true,
      request: {
        headers: [],
        form: [
          { name: 'nombre', value: 'Ana', file: false },
          { name: 'foto', value: 'yo.jpg', file: true },
        ],
      },
      warnings: [{ kind: 'form-file', name: 'foto', file: 'yo.jpg' }],
    });
  });
});

describe('toFetch', () => {
  it('writes the spec example with JSON.stringify', () => {
    const cmd = `curl -X POST https://api.example.com/u -H 'Content-Type: application/json' -d '{"a":1}'`;
    expect(toFetch(request(cmd), 'es')).toBe(
      [
        "const response = await fetch('https://api.example.com/u', {",
        "  method: 'POST',",
        '  headers: {',
        "    'Content-Type': 'application/json',",
        '  },',
        '  body: JSON.stringify({',
        '    "a": 1',
        '  }),',
        '});',
      ].join('\n'),
    );
  });

  it('leaves out every default', () => {
    expect(toFetch(request('curl https://a.test'), 'es')).toBe(
      "const response = await fetch('https://a.test');",
    );
  });

  it('keeps a body that is not valid JSON as a string, escaped', () => {
    const out = toFetch(
      request(`curl https://a.test -H 'Content-Type: application/json' -d "{'x'}"`),
      'es',
    );
    expect(out).toContain("  body: '{\\'x\\'}',");
  });

  it('writes FormData, the referrer and the timeout', () => {
    expect(
      toFetch(request('curl https://a.test -F a=1 -F f=@x.png -e https://r.test -m 3'), 'en'),
    ).toBe(
      [
        'const form = new FormData();',
        "form.append('a', '1');",
        '// x.png: fetch cannot read files from disk: use a File from an <input type="file">',
        "form.append('f', file);",
        '',
        "const response = await fetch('https://a.test', {",
        "  method: 'POST',",
        '  body: form,',
        "  referrer: 'https://r.test',",
        '  signal: AbortSignal.timeout(3000),',
        '});',
      ].join('\n'),
    );
  });

  it('quotes header names only when they are not identifiers', () => {
    const out = toFetch(request('curl https://a.test -H "Accept: */*" -H "X-Id: 1"'), 'es');
    expect(out).toContain("    Accept: '*/*',");
    expect(out).toContain("    'X-Id': '1',");
  });

  it('escapes JavaScript strings', () => {
    expect(jsString("a'b\\c\nd\u2028")).toBe("'a\\'b\\\\c\\nd\\u2028'");
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/curl`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/curl/logic.ts`**

El tokenizador sigue las reglas de bash que la ficha enumera. Las variables que se escriben dentro de `apply()` se declaran con `as` (`let url = null as string | null`) para que TypeScript no las estreche a su valor inicial. Los avisos y errores son códigos: el componente los traduce con `strings.ts`; solo el comentario de un campo de archivo dentro del código generado depende del idioma.

```ts
import { bytesToBase64, utf8 } from '../../lib/bytes';
import type { Locale } from '../types';

export type TokenizeResult =
  { ok: true; tokens: string[] } | { ok: false; error: 'unclosed-quote' | 'windows' };

export interface FormField {
  name: string;
  value: string;
  /** `name=@file` or `name=<file`: fetch cannot read files from disk. */
  file: boolean;
}

export interface CurlRequest {
  url: string;
  method: string;
  headers: [string, string][];
  body: string | null;
  form: FormField[] | null;
  referrer: string | null;
  timeoutSeconds: number | null;
}

export type CurlWarning =
  | { kind: 'unknown-option'; option: string }
  | { kind: 'data-file'; file: string }
  | { kind: 'form-file'; name: string; file: string }
  | { kind: 'user-agent' }
  | { kind: 'cookie' }
  | { kind: 'insecure' }
  | { kind: 'duplicate-header'; name: string }
  | { kind: 'bad-header'; text: string }
  | { kind: 'extra-argument'; text: string }
  | { kind: 'no-scheme' };

export type CurlError =
  | 'empty'
  | 'unclosed-quote'
  | 'windows'
  | 'not-curl'
  | 'no-url'
  | { kind: 'missing-value'; option: string }
  | { kind: 'bad-timeout'; value: string };

export type ParseResult =
  { ok: true; request: CurlRequest; warnings: CurlWarning[] } | { ok: false; error: CurlError };

const ANSI_ESCAPES: Record<string, string> = {
  n: '\n',
  t: '\t',
  r: '\r',
  '\\': '\\',
  "'": "'",
  '"': '"',
};

/**
 * Splits a bash command line the way the shell would: quotes, `$'…'`, backslashes and
 * `\` + line break continuations. Windows `cmd` quoting (`^"`) is rejected on purpose.
 */
export function tokenize(input: string): TokenizeResult {
  if (/\^"|\^\r?\n/.test(input)) return { ok: false, error: 'windows' };
  const tokens: string[] = [];
  let current = '';
  let inToken = false;
  let i = 0;
  const n = input.length;
  while (i < n) {
    const c = input[i];
    if (c === '\\' && (input[i + 1] === '\n' || (input[i + 1] === '\r' && input[i + 2] === '\n'))) {
      i += input[i + 1] === '\r' ? 3 : 2;
      continue;
    }
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      if (inToken) tokens.push(current);
      current = '';
      inToken = false;
      i++;
      continue;
    }
    inToken = true;
    if (c === "'") {
      const end = input.indexOf("'", i + 1);
      if (end === -1) return { ok: false, error: 'unclosed-quote' };
      current += input.slice(i + 1, end);
      i = end + 1;
    } else if (c === '$' && input[i + 1] === "'") {
      i += 2;
      let closed = false;
      while (i < n) {
        const d = input[i];
        if (d === "'") {
          closed = true;
          i++;
          break;
        }
        if (d === '\\' && i + 1 < n) {
          const e = input[i + 1];
          if (e in ANSI_ESCAPES) {
            current += ANSI_ESCAPES[e];
            i += 2;
          } else if (e === 'x' && /^[0-9a-fA-F]{1,2}/.test(input.slice(i + 2))) {
            const hex = /^[0-9a-fA-F]{1,2}/.exec(input.slice(i + 2))![0];
            current += String.fromCharCode(parseInt(hex, 16));
            i += 2 + hex.length;
          } else if (e === 'u' && /^[0-9a-fA-F]{4}/.test(input.slice(i + 2))) {
            current += String.fromCharCode(parseInt(input.slice(i + 2, i + 6), 16));
            i += 6;
          } else {
            current += d + e;
            i += 2;
          }
          continue;
        }
        current += d;
        i++;
      }
      if (!closed) return { ok: false, error: 'unclosed-quote' };
    } else if (c === '"') {
      i++;
      let closed = false;
      while (i < n) {
        const d = input[i];
        if (d === '"') {
          closed = true;
          i++;
          break;
        }
        if (d === '\\' && i + 1 < n) {
          const e = input[i + 1];
          if (e === '\n') {
            i += 2;
            continue;
          }
          if (e === '"' || e === '\\' || e === '$' || e === '`') {
            current += e;
            i += 2;
            continue;
          }
        }
        current += d;
        i++;
      }
      if (!closed) return { ok: false, error: 'unclosed-quote' };
    } else if (c === '\\' && i + 1 < n) {
      current += input[i + 1];
      i += 2;
    } else {
      current += c;
      i++;
    }
  }
  if (inToken) tokens.push(current);
  return { ok: true, tokens };
}

type Option =
  | 'request'
  | 'header'
  | 'data'
  | 'data-raw'
  | 'data-urlencode'
  | 'json'
  | 'form'
  | 'user'
  | 'user-agent'
  | 'referer'
  | 'cookie'
  | 'url'
  | 'max-time'
  | 'get'
  | 'head'
  | 'insecure'
  | 'silent-value'
  | 'silent-flag'
  | 'ignored-value';

const LONG: Record<string, Option> = {
  '--request': 'request',
  '--header': 'header',
  '--data': 'data',
  '--data-ascii': 'data',
  '--data-binary': 'data',
  '--data-raw': 'data-raw',
  '--data-urlencode': 'data-urlencode',
  '--json': 'json',
  '--form': 'form',
  '--user': 'user',
  '--user-agent': 'user-agent',
  '--referer': 'referer',
  '--cookie': 'cookie',
  '--url': 'url',
  '--max-time': 'max-time',
  '--get': 'get',
  '--head': 'head',
  '--insecure': 'insecure',
  '--output': 'silent-value',
  '--location': 'silent-flag',
  '--compressed': 'silent-flag',
  '--silent': 'silent-flag',
  '--show-error': 'silent-flag',
  '--verbose': 'silent-flag',
  '--include': 'silent-flag',
  // Not for fetch, but they take a value: skip it too so it is not read as the URL.
  '--connect-timeout': 'ignored-value',
  '--retry': 'ignored-value',
  '--write-out': 'ignored-value',
  '--proxy': 'ignored-value',
  '--cacert': 'ignored-value',
  '--cert': 'ignored-value',
  '--key': 'ignored-value',
  '--cookie-jar': 'ignored-value',
  '--upload-file': 'ignored-value',
};

const SHORT: Record<string, Option> = {
  X: 'request',
  H: 'header',
  d: 'data',
  F: 'form',
  u: 'user',
  A: 'user-agent',
  e: 'referer',
  b: 'cookie',
  m: 'max-time',
  G: 'get',
  I: 'head',
  k: 'insecure',
  o: 'silent-value',
  L: 'silent-flag',
  s: 'silent-flag',
  S: 'silent-flag',
  v: 'silent-flag',
  i: 'silent-flag',
  w: 'ignored-value',
  x: 'ignored-value',
  c: 'ignored-value',
  T: 'ignored-value',
};

const TAKES_VALUE = new Set<Option>([
  'request',
  'header',
  'data',
  'data-raw',
  'data-urlencode',
  'json',
  'form',
  'user',
  'user-agent',
  'referer',
  'cookie',
  'url',
  'max-time',
  'silent-value',
  'ignored-value',
]);

function encodeUrlencoded(value: string): string {
  const eq = value.indexOf('=');
  if (eq > 0) return `${value.slice(0, eq)}=${encodeURIComponent(value.slice(eq + 1))}`;
  return encodeURIComponent(eq === 0 ? value.slice(1) : value);
}

export function parseCurl(input: string): ParseResult {
  if (!input.trim()) return { ok: false, error: 'empty' };
  const tok = tokenize(input);
  if (!tok.ok) return { ok: false, error: tok.error };
  const [first, ...args] = tok.tokens;
  if (!/^(?:.*\/)?curl(?:\.exe)?$/.test(first ?? '')) return { ok: false, error: 'not-curl' };

  const warnings: CurlWarning[] = [];
  const headers = new Map<string, [string, string]>();
  const data: string[] = [];
  // Written from inside apply(): `as` stops TypeScript from narrowing them to their initial value.
  let form = null as FormField[] | null;
  let url = null as string | null;
  let method = null as string | null;
  let head = false as boolean;
  let get = false as boolean;
  let json = false as boolean;
  let referrer = null as string | null;
  let timeoutSeconds = null as number | null;

  const setHeader = (name: string, value: string, warnIfRepeated = true) => {
    const key = name.toLowerCase();
    if (headers.has(key) && warnIfRepeated) warnings.push({ kind: 'duplicate-header', name });
    headers.set(key, [name, value]);
  };

  const apply = (opt: Option, value: string, flag: string): CurlError | null => {
    switch (opt) {
      case 'request':
        method = value.toUpperCase();
        break;
      case 'header': {
        const colon = value.indexOf(':');
        if (colon > 0) setHeader(value.slice(0, colon).trim(), value.slice(colon + 1).trim());
        else if (value.endsWith(';')) setHeader(value.slice(0, -1).trim(), '');
        else warnings.push({ kind: 'bad-header', text: value });
        break;
      }
      case 'data':
        if (value.startsWith('@')) warnings.push({ kind: 'data-file', file: value.slice(1) });
        data.push(value);
        break;
      case 'data-raw':
        data.push(value);
        break;
      case 'data-urlencode':
        data.push(encodeUrlencoded(value));
        break;
      case 'json':
        json = true;
        data.push(value);
        break;
      case 'form': {
        const eq = value.indexOf('=');
        const name = eq === -1 ? value : value.slice(0, eq);
        const raw = eq === -1 ? '' : value.slice(eq + 1);
        const file = raw.startsWith('@') || raw.startsWith('<');
        if (file) warnings.push({ kind: 'form-file', name, file: raw.slice(1) });
        (form ??= []).push({ name, value: file ? raw.slice(1) : raw, file });
        break;
      }
      case 'user':
        setHeader('Authorization', `Basic ${bytesToBase64(utf8(value))}`);
        break;
      case 'user-agent':
        setHeader('User-Agent', value);
        warnings.push({ kind: 'user-agent' });
        break;
      case 'referer':
        referrer = value;
        break;
      case 'cookie':
        setHeader('Cookie', value);
        warnings.push({ kind: 'cookie' });
        break;
      case 'url':
        if (url === null) url = value;
        else warnings.push({ kind: 'extra-argument', text: value });
        break;
      case 'max-time': {
        const seconds = Number(value);
        if (!Number.isFinite(seconds) || seconds <= 0) return { kind: 'bad-timeout', value };
        timeoutSeconds = seconds;
        break;
      }
      case 'get':
        get = true;
        break;
      case 'head':
        head = true;
        break;
      case 'insecure':
        warnings.push({ kind: 'insecure' });
        break;
      case 'ignored-value':
        warnings.push({ kind: 'unknown-option', option: flag });
        break;
      case 'silent-value':
      case 'silent-flag':
        break;
    }
    return null;
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--') && arg.length > 2) {
      const opt = LONG[arg];
      if (!opt) {
        warnings.push({ kind: 'unknown-option', option: arg });
        continue;
      }
      let value = '';
      if (TAKES_VALUE.has(opt)) {
        if (i + 1 >= args.length)
          return { ok: false, error: { kind: 'missing-value', option: arg } };
        value = args[++i];
      }
      const err = apply(opt, value, arg);
      if (err) return { ok: false, error: err };
    } else if (arg.startsWith('-') && arg.length > 1) {
      // Short options: grouped flags (-sSL) and attached values (-XPOST, -H'…').
      for (let k = 1; k < arg.length; k++) {
        const letter = arg[k];
        const opt = SHORT[letter];
        if (!opt) {
          warnings.push({ kind: 'unknown-option', option: `-${letter}` });
          continue;
        }
        let value = '';
        if (TAKES_VALUE.has(opt)) {
          value = arg.slice(k + 1);
          if (!value) {
            if (i + 1 >= args.length) {
              return { ok: false, error: { kind: 'missing-value', option: `-${letter}` } };
            }
            value = args[++i];
          }
          k = arg.length;
        }
        const err = apply(opt, value, `-${letter}`);
        if (err) return { ok: false, error: err };
      }
    } else if (url === null) {
      url = arg;
    } else {
      warnings.push({ kind: 'extra-argument', text: arg });
    }
  }

  if (!url) return { ok: false, error: 'no-url' };
  let finalUrl = url;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(finalUrl)) {
    finalUrl = `http://${finalUrl}`;
    warnings.push({ kind: 'no-scheme' });
  }

  let body: string | null = data.length ? data.join('&') : null;
  if (get && body !== null) {
    finalUrl += (finalUrl.includes('?') ? '&' : '?') + body;
    body = null;
  }
  if (json) {
    if (!headers.has('content-type')) setHeader('Content-Type', 'application/json', false);
    if (!headers.has('accept')) setHeader('Accept', 'application/json', false);
  } else if (body !== null && !headers.has('content-type')) {
    // What curl itself sends with -d.
    setHeader('Content-Type', 'application/x-www-form-urlencoded', false);
  }
  // The browser writes multipart's Content-Type itself, with the boundary.
  if (form) headers.delete('content-type');

  const finalMethod = method ?? (head ? 'HEAD' : !get && (body !== null || form) ? 'POST' : 'GET');

  return {
    ok: true,
    warnings,
    request: {
      url: finalUrl,
      method: finalMethod,
      headers: [...headers.values()],
      body,
      form,
      referrer,
      timeoutSeconds,
    },
  };
}

/** A JavaScript single-quoted string literal. */
export function jsString(s: string): string {
  const escaped = s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return `'${escaped}'`;
}

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function jsKey(s: string): string {
  return IDENTIFIER.test(s) ? s : jsString(s);
}

const FILE_COMMENT: Record<Locale, string> = {
  es: 'fetch no puede leer archivos del disco: usa un File de un <input type="file">',
  en: 'fetch cannot read files from disk: use a File from an <input type="file">',
};

/** `const response = await fetch(url, { … })`, leaving out every default. */
export function toFetch(req: CurlRequest, locale: Locale): string {
  const lines: string[] = [];
  if (req.form) {
    lines.push('const form = new FormData();');
    for (const f of req.form) {
      if (f.file) {
        lines.push(`// ${f.value}: ${FILE_COMMENT[locale]}`);
        lines.push(`form.append(${jsString(f.name)}, file);`);
      } else {
        lines.push(`form.append(${jsString(f.name)}, ${jsString(f.value)});`);
      }
    }
    lines.push('');
  }

  const opts: string[] = [];
  if (req.method !== 'GET') opts.push(`  method: ${jsString(req.method)},`);
  if (req.headers.length) {
    opts.push('  headers: {');
    for (const [name, value] of req.headers) opts.push(`    ${jsKey(name)}: ${jsString(value)},`);
    opts.push('  },');
  }
  if (req.form) {
    opts.push('  body: form,');
  } else if (req.body !== null) {
    const type = req.headers.find(([n]) => n.toLowerCase() === 'content-type')?.[1] ?? '';
    let parsed: unknown;
    let isJson = false;
    if (/json/i.test(type)) {
      try {
        parsed = JSON.parse(req.body);
        isJson = true;
      } catch {
        isJson = false;
      }
    }
    if (isJson) {
      const pretty = JSON.stringify(parsed, null, 2).replace(/\n/g, '\n  ');
      opts.push(`  body: JSON.stringify(${pretty}),`);
    } else {
      opts.push(`  body: ${jsString(req.body)},`);
    }
  }
  if (req.referrer !== null) opts.push(`  referrer: ${jsString(req.referrer)},`);
  if (req.timeoutSeconds !== null) {
    opts.push(`  signal: AbortSignal.timeout(${Math.round(req.timeoutSeconds * 1000)}),`);
  }

  const call = opts.length
    ? `const response = await fetch(${jsString(req.url)}, {\n${opts.join('\n')}\n});`
    : `const response = await fetch(${jsString(req.url)});`;
  lines.push(call);
  return lines.join('\n');
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/curl`
Expected: PASS (27 tests).

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/curl/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'curl',
  category: 'data',
  icon: 'terminal',
  slug: { es: 'convertir-curl-a-fetch', en: 'curl-to-fetch-converter' },
  name: { es: 'cURL a fetch', en: 'cURL to fetch' },
  title: {
    es: 'Convertir comandos cURL a fetch de JavaScript',
    en: 'Convert cURL commands to JavaScript fetch',
  },
  description: {
    es: 'Pega un comando cURL y obtén el código fetch de JavaScript equivalente, con método, cabeceras, cuerpo JSON o formulario y avisos de lo que fetch no puede hacer.',
    en: 'Paste a cURL command and get the equivalent JavaScript fetch code, with method, headers, JSON or form body and notes on what fetch cannot do.',
  },
  keywords: {
    es: [
      'curl a fetch',
      'convertir curl',
      'curl a javascript',
      'fetch api',
      'copiar como curl',
      'curl online',
    ],
    en: [
      'curl to fetch',
      'convert curl',
      'curl to javascript',
      'fetch api',
      'copy as curl',
      'curl converter',
    ],
  },
  rememberInput: false,
  faq: {
    es: [
      {
        q: '¿Cómo copio una petición como cURL?',
        a: 'En las herramientas de desarrollo del navegador, pestaña Red, haz clic derecho en la petición y elige «Copiar» → «Copiar como cURL (bash)». La versión de cmd de Windows usa otro sistema de comillas y no se admite.',
      },
      {
        q: '¿Por qué no se guarda lo que pego?',
        a: 'Un cURL copiado del navegador suele llevar cookies y tokens de sesión. Por eso esta herramienta no guarda nada, ni siquiera en tu navegador.',
      },
    ],
    en: [
      {
        q: 'How do I copy a request as cURL?',
        a: 'In the browser developer tools, Network tab, right-click the request and choose “Copy” → “Copy as cURL (bash)”. The Windows cmd version uses different quoting and is not supported.',
      },
      {
        q: 'Why is what I paste not remembered?',
        a: 'A cURL copied from the browser usually carries cookies and session tokens. That is why this tool stores nothing, not even in your browser.',
      },
    ],
  },
};
```

`src/tools/curl/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    input: 'Comando cURL',
    placeholder:
      'curl -X POST https://api.example.com/users -H \'Content-Type: application/json\' -d \'{"name":"Ana"}\'',
    result: 'Código fetch',
    converted: 'Convertido',
    empty: 'Pega un comando que empiece por curl y aquí verás el código fetch.',
    warnings: 'Avisos',
    notSaved: 'Lo que pegas aquí no se guarda: un cURL copiado suele llevar cookies y tokens.',
    copyCode: 'Copiar código',
    unclosedQuote:
      'Hay una comilla sin cerrar: revisa que cada comilla simple y doble tenga su pareja',
    windows:
      'Parece un cURL de Windows (cmd), que no se admite. Copia el comando como "cURL (bash)"',
    notCurl: 'El comando debe empezar por curl',
    noUrl: 'Falta la URL: añádela después de curl',
    missingValue: 'A la opción {option} le falta su valor',
    badTimeout: 'El tiempo máximo debe ser un número de segundos mayor que 0, no «{value}»',
    unknownOption: 'Opción ignorada: {option}',
    dataFile: 'fetch no puede leer archivos: sustituye @{file} por su contenido',
    formFile:
      'El campo {name} sube el archivo {file}: fetch no puede leerlo del disco. Pásale un File de un <input type="file">',
    userAgent:
      'El navegador no deja cambiar User-Agent y fetch ignora esa cabecera. En Node sí funciona.',
    cookie:
      "En el navegador, fetch ignora la cabecera Cookie: usa credentials: 'include' para que mande las cookies del sitio.",
    insecure: 'fetch no puede ignorar errores de certificado (-k)',
    duplicateHeader: 'La cabecera {name} aparece varias veces: se usa la última',
    badHeader: 'Cabecera sin «:» ignorada: {text}',
    extraArgument: 'Argumento ignorado: {text}',
    noScheme: 'La URL no tiene esquema: se añade http://, como hace curl',
  },
  en: {
    input: 'cURL command',
    placeholder:
      'curl -X POST https://api.example.com/users -H \'Content-Type: application/json\' -d \'{"name":"Ana"}\'',
    result: 'fetch code',
    converted: 'Converted',
    empty: 'Paste a command that starts with curl and the fetch code will show up here.',
    warnings: 'Notes',
    notSaved: 'What you paste here is not saved: a copied cURL usually carries cookies and tokens.',
    copyCode: 'Copy code',
    unclosedQuote:
      'There is an unclosed quote: check that every single and double quote has its pair',
    windows:
      'This looks like a Windows (cmd) cURL, which is not supported. Copy the command as "cURL (bash)"',
    notCurl: 'The command must start with curl',
    noUrl: 'The URL is missing: add it after curl',
    missingValue: 'The option {option} needs a value',
    badTimeout: 'The maximum time must be a number of seconds above 0, not “{value}”',
    unknownOption: 'Option ignored: {option}',
    dataFile: 'fetch cannot read files: replace @{file} with its content',
    formFile:
      'The field {name} uploads the file {file}: fetch cannot read it from disk. Pass it a File from an <input type="file">',
    userAgent:
      'Browsers do not let you change User-Agent and fetch ignores that header. It works in Node.',
    cookie:
      "In the browser, fetch ignores the Cookie header: use credentials: 'include' so it sends the site's cookies.",
    insecure: 'fetch cannot ignore certificate errors (-k)',
    duplicateHeader: 'The header {name} appears more than once: the last one is used',
    badHeader: 'Header without “:” ignored: {text}',
    extraArgument: 'Argument ignored: {text}',
    noScheme: 'The URL has no scheme: http:// is added, like curl does',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/curl/content.es.md`:
```md
## Cómo funciona

Pega un comando `curl` y la herramienta lo convierte en una llamada a `fetch` de JavaScript mientras escribes. Entiende las comillas simples y dobles, `$'…'`, las barras invertidas y los comandos partidos en varias líneas con `\`, igual que bash. Lo más rápido es copiar la petición desde la pestaña Red del navegador con «Copiar como cURL (bash)».

Se traducen el método (`-X`, `-I`, `-G`), las cabeceras (`-H`), el cuerpo (`-d`, `--data-raw`, `--data-urlencode`, `--json`), los formularios (`-F`), la autenticación básica (`-u`), el referer, las cookies y el tiempo máximo (`-m`, con `AbortSignal.timeout`). Si el cuerpo es JSON, se escribe con `JSON.stringify` para que sea fácil de editar. Lo que es el valor por defecto de fetch, como el método GET, se omite.

## Lo que fetch no puede hacer

Hay opciones de curl que no tienen equivalente en el navegador: leer archivos del disco (`@archivo`), ignorar errores de certificado (`-k`) o cambiar el `User-Agent` y las cookies a mano. En esos casos verás un aviso que explica qué hacer. Por seguridad, el comando no se guarda: los cURL copiados del navegador suelen llevar cookies y tokens.
```

`src/tools/curl/content.en.md`:
```md
## How it works

Paste a `curl` command and the tool turns it into a JavaScript `fetch` call as you type. It understands single and double quotes, `$'…'`, backslashes and commands split over several lines with `\`, just like bash. The quickest way is to copy the request from the browser's Network tab with “Copy as cURL (bash)”.

It translates the method (`-X`, `-I`, `-G`), headers (`-H`), body (`-d`, `--data-raw`, `--data-urlencode`, `--json`), forms (`-F`), basic authentication (`-u`), referer, cookies and maximum time (`-m`, with `AbortSignal.timeout`). If the body is JSON it is written with `JSON.stringify` so it is easy to edit. Anything that is already fetch's default, such as the GET method, is left out.

## What fetch cannot do

Some curl options have no browser equivalent: reading files from disk (`@file`), ignoring certificate errors (`-k`) or setting `User-Agent` and cookies by hand. In those cases a note explains what to do instead. For safety the command is never saved: cURL commands copied from the browser usually carry cookies and tokens.
```

- [ ] **Step 8: `src/tools/curl/Curl.svelte`**

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import type { Locale } from '../types';
  import { parseCurl, toFetch, type CurlError, type CurlWarning } from './logic';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  // rememberInput: false. A copied cURL usually carries cookies and tokens: never persisted.
  let input = $state('');

  const result = $derived(parseCurl(input));
  const code = $derived(result.ok ? toFetch(result.request, locale) : '');

  function errorText(e: CurlError): string {
    if (e === 'empty') return '';
    if (e === 'unclosed-quote') return s.unclosedQuote;
    if (e === 'windows') return s.windows;
    if (e === 'not-curl') return s.notCurl;
    if (e === 'no-url') return s.noUrl;
    if (e.kind === 'missing-value') return fill(s.missingValue, { option: e.option });
    return fill(s.badTimeout, { value: e.value });
  }

  function warningText(w: CurlWarning): string {
    switch (w.kind) {
      case 'unknown-option':
        return fill(s.unknownOption, { option: w.option });
      case 'data-file':
        return fill(s.dataFile, { file: w.file });
      case 'form-file':
        return fill(s.formFile, { name: w.name, file: w.file });
      case 'user-agent':
        return s.userAgent;
      case 'cookie':
        return s.cookie;
      case 'insecure':
        return s.insecure;
      case 'duplicate-header':
        return fill(s.duplicateHeader, { name: w.name });
      case 'bad-header':
        return fill(s.badHeader, { text: w.text });
      case 'extra-argument':
        return fill(s.extraArgument, { text: w.text });
      case 'no-scheme':
        return s.noScheme;
    }
  }

  const error = $derived(result.ok ? '' : errorText(result.error));
</script>

<div class="panel">
  <Field id="curl-input" label={s.input} help={s.notSaved}>
    {#snippet children({ describedby })}
      <TextArea
        id="curl-input"
        bind:value={input}
        placeholder={s.placeholder}
        {describedby}
        invalid={!!error}
        rows={8}
      />
    {/snippet}
  </Field>

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={result.ok ? 'ok' : error ? 'bad' : 'idle'}
        label={result.ok ? s.converted : t(locale, error ? 'led.bad' : 'led.idle')}
      />
    {/snippet}
    {#if code}
      <pre class="display-code">{code}</pre>
    {:else}
      <p class="display-note">{error || s.empty}</p>
    {/if}
  </Display>

  {#if result.ok && result.warnings.length}
    <section class="warnings" aria-label={s.warnings}>
      <h2>{s.warnings}</h2>
      <ul>
        {#each result.warnings as w, i (i)}
          <li>{warningText(w)}</li>
        {/each}
      </ul>
    </section>
  {/if}

  <div class="row">
    <CopyButton main value={code} {locale} label={s.copyCode} />
    <Button variant="ghost" disabled={!input} onclick={() => (input = '')}
      >{t(locale, 'ui.clear')}</Button
    >
  </div>
</div>

<style>
  .warnings {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .warnings h2 {
    font-size: 14px;
    font-weight: 600;
  }
  .warnings ul {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0;
    padding-left: 1.2em;
    font-size: 14px;
    color: var(--text-dim);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as curl } from './curl/meta';
```
→
```ts
import { meta as curl } from './curl/meta';
```
y
```ts
  // curl,
```
→
```ts
  curl,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Curl from '../tools/curl/Curl.svelte';
```
→
```astro
import Curl from '../tools/curl/Curl.svelte';
```
y
```astro
{/* {id === 'curl' && <Curl client:load locale={locale} />} */}
```
→
```astro
{id === 'curl' && <Curl client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/convertir-curl-a-fetch.html dist/en/curl-to-fetch-converter.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `curl` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador (desechable, puerto 4677)**

Crea `.check-curl.mjs` en la raíz del worktree:
```js
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4677';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));

await page.goto(`${BASE}/es/convertir-curl-a-fetch`);
await page
  .locator('#curl-input')
  .fill(`curl -X POST https://api.example.com/u -H 'Content-Type: application/json' -d '{"a":1}' -k`);
const code = await page.locator('.display-code').innerText();
assert.match(code, /method: 'POST'/);
assert.match(code, /body: JSON\.stringify\(\{\n {4}"a": 1\n {2}\}\),/);
assert.match(await page.locator('.warnings').innerText(), /fetch no puede ignorar errores de certificado/);

await page.locator('#curl-input').fill('curl ^"https://a.test^"');
assert.match(await page.locator('.display').innerText(), /Copia el comando como "cURL \(bash\)"/);

await page.waitForTimeout(500);
const keys = await page.evaluate(() => Object.keys(localStorage));
assert.deepEqual(keys.filter((k) => k.includes('curl')), []);

await browser.close();
assert.deepEqual(errors, []);
console.log('OK curl');
```

Run:
```bash
./node_modules/.bin/astro preview --port 4677 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
until curl -sf -o /dev/null http://localhost:4677/es; do sleep 0.5; done
node .check-curl.mjs
kill $PREVIEW
rm .check-curl.mjs
```
Expected: la última línea es `OK curl` y no hay ningún error de página. Si falla un paso, arregla el componente, no la comprobación.

A mano, con `pnpm preview`, en `/es/convertir-curl-a-fetch` y `/en/curl-to-fetch-converter`, primero en el tema claro y luego en oscuro y terminal, a 390 px y a 1280 px de ancho:
1. El comando del e2e da exactamente el `fetch` del test `writes the spec example with JSON.stringify`.
2. Copia una petición desde la pestaña Red del navegador («Copiar como cURL (bash)») y pégala: salen método, cabeceras y cuerpo; las opciones que no aplican a fetch no generan ruido.
3. Añade `-k` y `-b "a=1"` → dos avisos en la lista, con lo que hay que hacer en su lugar.
4. `curl ^"https://a.test^"` → «Parece un cURL de Windows (cmd)… Copia el comando como "cURL (bash)"».
5. No hay interruptor «Recordar lo que escribo» y, tras recargar, el campo está vacío.

- [ ] **Step 12: Commit**

```bash
git add src/tools/curl src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (tampoco `.check-curl.mjs`, que ya se borró). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(curl): convertir comandos cURL a fetch de JavaScript"
```

---

### Task 8: Query string ↔ JSON: corchetes, claves repetidas, sin contaminar prototipos ni guardar credenciales

**Files:**
- Create: `src/tools/query-string/logic.ts`, `src/tools/query-string/logic.test.ts`, `src/tools/query-string/meta.ts`, `src/tools/query-string/strings.ts`, `src/tools/query-string/content.es.md`, `src/tools/query-string/content.en.md`, `src/tools/query-string/QueryString.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `parseJson` de `src/tools/json/logic.ts`; `fill`; `t` (`led.idle`, `ui.clear`, `tool.remember`); kit: `Segmented`, `Field`, `TextArea`, `Toggle`, `Display`, `Led`, `CopyButton`, `Button` y `persistedInput` con `shouldSave`.
- Produces:
  - `type Direction = 'auto' | 'toJson' | 'toQuery'`, `interface ParseOptions { brackets; detectTypes }`, `interface QueryResult { value; pairs; undecodable }`, `interface BuildOptions { brackets; plusForSpace }`
  - `detectDirection(input)`, `extractQuery(input)`, `queryToJson(input, opts): QueryResult`, `jsonToQuery(value, opts)`, `hasSensitiveKey(input)`
  - `meta: ToolMeta` (id `query-string`, slugs `conversor-query-string-json` / `query-string-to-json`), `strings: Record<Locale, …>` y el componente `QueryString` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 14: `#query-string-input`, `.display-code` (el resultado) y `.pairs` (la tabla de pares decodificados).

**§8.8 (vinculante):** `query-string` · data · sin pestañas. Dirección Automática · Query → JSON · JSON → query (Segmented secundario; `{` → JSON). Query → JSON: URL completa o texto tras el primer `?`, sin `#…`; pares por `&` y el primer `=`; `+` → espacio y `decodeURIComponent`, con los `%` rotos tal cual y «No se pudo decodificar %E0%A4»; «Notación con corchetes» (activada): `a[b]`, `a[]` y anidados; claves repetidas → array; «Detectar números y booleanos» (desactivado); objetos con `Object.create(null)`. JSON → query: objeto arriba; `String(v)`; `null` → `clave=`; arrays repetidos o `[]`; anidados `a[b]=1`; `encodeURIComponent` con los corchetes legibles; «Espacios como +» (desactivado). `Display code` y tabla de pares. Recordar ✓ con un `shouldSave` que no guarda si alguna clave coincide con `/token|secret|password|passwd|pwd|api[_-]?key|auth|signature|sig|session/i`. `?` solo → `{}`; `a=1&&b=2` ignora el par vacío.

Cómo se cubre cada punto:
- Lectura: tests `takes the search of a URL, the text after ? or the bare query, without the fragment`, `matches the e2e example: repeated keys and brackets`, `reads a[]=1&a[]=2 as an array and nests a[b][c]`, `keeps bracketed keys literally when bracket notation is off`, `decodes + as a space and percent sequences` y `leaves broken percent sequences as they are and reports them`.
- Casos límite: tests `handles "?" alone, empty pairs and keys without "="` y `detects numbers and booleans only when asked, keeping leading zeros as text`.
- Prototipos: Review Focus 4, test `is safe against prototype pollution`. Si una clave con corchetes choca con un valor anterior (`a=1&a[b]=2`), se guarda literal en vez de romper: test `falls back to the literal key when brackets clash with an earlier value`.
- Escritura: tests `writes primitives, null, arrays and nested objects`, `repeats keys for arrays without brackets and can use + for spaces`, `round-trips with queryToJson` y `needs an object at the top level`. Objetos o listas dentro de una lista no tienen forma estándar: viajan como JSON en el valor.
- Sin credenciales guardadas: Review Focus 4, test `refuses to save inputs whose keys look like credentials` (también con JSON a medio escribir). El campo avisa de que esa entrada no se guarda.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l3-query-string -b lote-3/query-string   # desde el commit de la Task 0
cd ../devtools-l3-query-string
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task (Segmented, Field, TextArea, Toggle, Display, Led, CopyButton, Button) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real y dilo en el commit.

- [ ] **Step 2: Test (falla)**

`src/tools/query-string/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { detectDirection, extractQuery, hasSensitiveKey, jsonToQuery, queryToJson } from './logic';

const on = { brackets: true, detectTypes: false };
const off = { brackets: false, detectTypes: false };
// Plain objects make the assertions easy to read; the real result has no prototype.
const plain = (v: unknown) => JSON.parse(JSON.stringify(v));

describe('extractQuery', () => {
  it('takes the search of a URL, the text after ? or the bare query, without the fragment', () => {
    expect(extractQuery('https://a.test/p?x=1&y=2#top')).toBe('x=1&y=2');
    expect(extractQuery('?a=1')).toBe('a=1');
    expect(extractQuery('a=1#b')).toBe('a=1');
    expect(extractQuery('https://a.test/p')).toBe('');
  });
});

describe('queryToJson', () => {
  it('matches the e2e example: repeated keys and brackets', () => {
    expect(plain(queryToJson('?a=1&b=2&b=3&c[d]=x', on).value)).toEqual({
      a: '1',
      b: ['2', '3'],
      c: { d: 'x' },
    });
  });

  it('reads a[]=1&a[]=2 as an array and nests a[b][c]', () => {
    expect(plain(queryToJson('a[]=1&a[]=2&u[n][e]=Ana', on).value)).toEqual({
      a: ['1', '2'],
      u: { n: { e: 'Ana' } },
    });
  });

  it('keeps bracketed keys literally when bracket notation is off', () => {
    expect(plain(queryToJson('c[d]=x', off).value)).toEqual({ 'c[d]': 'x' });
  });

  it('decodes + as a space and percent sequences', () => {
    const r = queryToJson('nombre=Ana+Mar%C3%ADa&mi%20clave=a%26b', on);
    expect(plain(r.value)).toEqual({ nombre: 'Ana María', 'mi clave': 'a&b' });
    expect(r.pairs).toEqual([
      ['nombre', 'Ana María'],
      ['mi clave', 'a&b'],
    ]);
  });

  it('leaves broken percent sequences as they are and reports them', () => {
    const r = queryToJson('a=%E0%A4&b=%C3%A9', on);
    expect(plain(r.value)).toEqual({ a: '%E0%A4', b: 'é' });
    expect(r.undecodable).toEqual(['%E0%A4']);
  });

  it('handles "?" alone, empty pairs and keys without "="', () => {
    expect(plain(queryToJson('?', on).value)).toEqual({});
    expect(plain(queryToJson('a=1&&b=2&flag', on).value)).toEqual({ a: '1', b: '2', flag: '' });
  });

  it('detects numbers and booleans only when asked, keeping leading zeros as text', () => {
    expect(
      plain(queryToJson('n=42&f=-1.5&z=007&t=true&e=', { ...on, detectTypes: true }).value),
    ).toEqual({
      n: 42,
      f: -1.5,
      z: '007',
      t: true,
      e: '',
    });
  });

  it('is safe against prototype pollution', () => {
    const r = queryToJson('__proto__[polluted]=1&constructor[prototype][x]=2', on);
    expect(Object.getPrototypeOf(r.value)).toBeNull();
    expect(Object.keys(r.value)).toEqual(['__proto__', 'constructor']);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(({} as Record<string, unknown>).x).toBeUndefined();
    expect(JSON.stringify(r.value)).toBe(
      '{"__proto__":{"polluted":"1"},"constructor":{"prototype":{"x":"2"}}}',
    );
  });

  it('falls back to the literal key when brackets clash with an earlier value', () => {
    expect(plain(queryToJson('a=1&a[b]=2', on).value)).toEqual({ a: '1', 'a[b]': '2' });
  });
});

describe('jsonToQuery', () => {
  it('writes primitives, null, arrays and nested objects', () => {
    expect(
      jsonToQuery(
        { q: 'café con leche', n: 3, ok: true, vacio: null, tags: ['a', 'b'], u: { id: 7 } },
        { brackets: true, plusForSpace: false },
      ),
    ).toEqual({
      ok: true,
      query: 'q=caf%C3%A9%20con%20leche&n=3&ok=true&vacio=&tags[]=a&tags[]=b&u[id]=7',
    });
  });

  it('repeats keys for arrays without brackets and can use + for spaces', () => {
    expect(jsonToQuery({ t: ['a b', 'c'] }, { brackets: false, plusForSpace: true })).toEqual({
      ok: true,
      query: 't=a+b&t=c',
    });
  });

  it('round-trips with queryToJson', () => {
    const value = { a: '1', b: ['2', '3'], c: { d: 'x & y' } };
    const r = jsonToQuery(value, { brackets: true, plusForSpace: false });
    expect(r.ok && plain(queryToJson(r.query, on).value)).toEqual(value);
  });

  it('needs an object at the top level', () => {
    expect(jsonToQuery([1, 2], { brackets: true, plusForSpace: false })).toEqual({
      ok: false,
      error: 'not-object',
    });
  });
});

describe('direction and saving', () => {
  it('reads JSON when the input starts with {', () => {
    expect(detectDirection('  {"a":1}')).toBe('toQuery');
    expect(detectDirection('a=1')).toBe('toJson');
  });

  it('refuses to save inputs whose keys look like credentials', () => {
    expect(hasSensitiveKey('?token=abc')).toBe(true);
    expect(hasSensitiveKey('https://a.test/?user=ana&api_key=1')).toBe(true);
    expect(hasSensitiveKey('{"auth": {"x": 1}}')).toBe(true);
    expect(hasSensitiveKey('{"session":')).toBe(true);
    expect(hasSensitiveKey('?page=2&sort=name')).toBe(false);
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/query-string`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/query-string/logic.ts`**

Todos los objetos del resultado se crean con `Object.create(null)` y se escriben con `Object.hasOwn`: `__proto__` y `constructor` son claves normales y nunca tocan `Object.prototype`. `hasSensitiveKey` mira las claves de la query o del JSON, no los valores.

```ts
export type Direction = 'auto' | 'toJson' | 'toQuery';

export interface ParseOptions {
  /** a[b]=1 → { a: { b: "1" } } and a[]=1 → { a: ["1"] }. */
  brackets: boolean;
  /** Numbers without leading zeros and true/false become JSON numbers and booleans. */
  detectTypes: boolean;
}

export interface QueryResult {
  /** Built with Object.create(null): "__proto__" is just another key. */
  value: Record<string, unknown>;
  /** Every pair, already decoded, in order. */
  pairs: [string, string][];
  /** Percent sequences that could not be decoded and were left as they are. */
  undecodable: string[];
}

export type ToQueryResult = { ok: true; query: string } | { ok: false; error: 'not-object' };

type Obj = Record<string, unknown>;

const NUMBER = /^-?(0|[1-9]\d*)(\.\d+)?$/;
const SENSITIVE = /token|secret|password|passwd|pwd|api[_-]?key|auth|signature|sig|session/i;

export function detectDirection(input: string): 'toJson' | 'toQuery' {
  return input.trimStart().startsWith('{') ? 'toQuery' : 'toJson';
}

/** The query part of a full URL, of "…?query" or of a bare query, without the #fragment. */
export function extractQuery(input: string): string {
  let s = input.trim();
  const hash = s.indexOf('#');
  if (hash !== -1) s = s.slice(0, hash);
  const q = s.indexOf('?');
  if (q !== -1) return s.slice(q + 1);
  // A URL without "?" has no query at all.
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(s) ? '' : s;
}

function decodePart(raw: string, undecodable: string[]): string {
  const s = raw.replace(/\+/g, ' ');
  try {
    return decodeURIComponent(s);
  } catch {
    // Decode each run of %XX on its own and leave the broken ones as they are.
    return s.replace(/(?:%[0-9A-Fa-f]{2})+/g, (run) => {
      try {
        return decodeURIComponent(run);
      } catch {
        undecodable.push(run);
        return run;
      }
    });
  }
}

function typed(v: string, detect: boolean): unknown {
  if (!detect) return v;
  if (NUMBER.test(v)) return Number(v);
  if (v === 'true') return true;
  if (v === 'false') return false;
  return v;
}

const isObj = (v: unknown): v is Obj => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Adds a value at a key: a repeated key turns into an array, in order. */
function addValue(target: Obj, key: string, value: unknown): void {
  if (!Object.hasOwn(target, key)) target[key] = value;
  else if (Array.isArray(target[key])) (target[key] as unknown[]).push(value);
  else target[key] = [target[key], value];
}

const BRACKETS = /^([^[\]]+)((?:\[[^[\]]*\])+)$/;

/** Places `a[b][]=v`; returns false when it clashes with what is already there. */
function setPath(root: Obj, key: string, value: unknown): boolean {
  const m = BRACKETS.exec(key);
  if (!m) return false;
  const path = [m[1], ...[...m[2].matchAll(/\[([^[\]]*)\]/g)].map((x) => x[1])];
  let node: Obj = root;
  for (let i = 0; i < path.length - 1; i++) {
    const seg = path[i];
    const next = path[i + 1];
    if (seg === '') return false;
    if (next === '') {
      // "a[]" must be the last segment.
      if (i + 1 !== path.length - 1) return false;
      const current = node[seg];
      if (current === undefined) node[seg] = [value];
      else if (Array.isArray(current)) current.push(value);
      else return false;
      return true;
    }
    if (!Object.hasOwn(node, seg)) node[seg] = Object.create(null) as Obj;
    const child = node[seg];
    if (!isObj(child)) return false;
    node = child;
  }
  const last = path[path.length - 1];
  if (Object.hasOwn(node, last) && isObj(node[last])) return false;
  addValue(node, last, value);
  return true;
}

export function queryToJson(input: string, opts: ParseOptions): QueryResult {
  const value = Object.create(null) as Obj;
  const pairs: [string, string][] = [];
  const undecodable: string[] = [];
  for (const part of extractQuery(input).split('&')) {
    if (!part) continue;
    const eq = part.indexOf('=');
    const key = decodePart(eq === -1 ? part : part.slice(0, eq), undecodable);
    const val = decodePart(eq === -1 ? '' : part.slice(eq + 1), undecodable);
    pairs.push([key, val]);
    const v = typed(val, opts.detectTypes);
    if (opts.brackets && key.includes('[') && setPath(value, key, v)) continue;
    // No brackets, brackets off, or a clash: the key is taken literally.
    if (Object.hasOwn(value, key) && isObj(value[key])) {
      value[key] = [value[key], v];
    } else {
      addValue(value, key, v);
    }
  }
  return { value, pairs, undecodable };
}

export interface BuildOptions {
  brackets: boolean;
  plusForSpace: boolean;
}

function encodeKey(k: string): string {
  return encodeURIComponent(k);
}

export function jsonToQuery(value: unknown, opts: BuildOptions): ToQueryResult {
  if (!isObj(value)) return { ok: false, error: 'not-object' };
  const out: string[] = [];
  const enc = (s: string) => {
    const e = encodeURIComponent(s);
    return opts.plusForSpace ? e.replace(/%20/g, '+') : e;
  };
  const emit = (key: string, v: unknown) => {
    if (v === null || v === undefined) out.push(`${key}=`);
    else if (Array.isArray(v)) {
      for (const item of v) {
        const k = opts.brackets ? `${key}[]` : key;
        // Objects and arrays inside arrays have no standard form: they travel as JSON.
        emit(k, typeof item === 'object' && item !== null ? JSON.stringify(item) : item);
      }
    } else if (isObj(v)) {
      for (const [k, sub] of Object.entries(v)) emit(`${key}[${encodeKey(k)}]`, sub);
    } else {
      out.push(`${key}=${enc(String(v))}`);
    }
  };
  for (const [k, v] of Object.entries(value)) emit(encodeKey(k), v);
  return { ok: true, query: out.join('&') };
}

function jsonKeys(v: unknown, keys: string[], depth = 0): void {
  if (depth > 50 || v === null || typeof v !== 'object') return;
  if (Array.isArray(v)) {
    for (const item of v) jsonKeys(item, keys, depth + 1);
    return;
  }
  for (const [k, sub] of Object.entries(v)) {
    keys.push(k);
    jsonKeys(sub, keys, depth + 1);
  }
}

/** True when some key looks like a credential: then the input is not saved. */
export function hasSensitiveKey(input: string): boolean {
  let keys: string[];
  if (detectDirection(input) === 'toQuery') {
    keys = [];
    try {
      jsonKeys(JSON.parse(input), keys);
    } catch {
      // Half-typed JSON: look at anything that could be a key.
      keys = [...input.matchAll(/"([^"]*)"\s*:/g)].map((m) => m[1]);
    }
  } else {
    keys = queryToJson(input, { brackets: false, detectTypes: false }).pairs.map(([k]) => k);
  }
  return keys.some((k) => SENSITIVE.test(k));
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/query-string`
Expected: PASS (16 tests).

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/query-string/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'query-string',
  category: 'data',
  icon: 'file-braces',
  slug: { es: 'conversor-query-string-json', en: 'query-string-to-json' },
  name: { es: 'Query string', en: 'Query string' },
  title: {
    es: 'Conversor de query string a JSON y de JSON a query',
    en: 'Query string to JSON converter (and JSON to query)',
  },
  description: {
    es: 'Convierte los parámetros de una URL en JSON y un JSON en query string, con notación de corchetes, claves repetidas y todo decodificado para leerlo.',
    en: 'Turn the parameters of a URL into JSON and JSON into a query string, with bracket notation, repeated keys and everything decoded so you can read it.',
  },
  keywords: {
    es: [
      'query string a json',
      'parametros url',
      'json a query string',
      'urlsearchparams',
      'decodificar url',
      'querystring',
    ],
    en: [
      'query string to json',
      'url parameters',
      'json to query string',
      'urlsearchparams',
      'parse query string',
      'querystring',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Qué es la notación con corchetes?',
        a: 'Es la forma en que PHP, Rails y la librería qs de Node envían objetos y listas por la URL: filtro[precio]=10 es un objeto y tags[]=a&tags[]=b, una lista. Si tu servidor no la usa, desactívala y las claves se leen tal cual.',
      },
      {
        q: '¿Se guarda lo que pego?',
        a: 'Solo en tu navegador y si tienes activado «Recordar lo que escribo». Aun así, si alguna clave parece una credencial (token, password, api_key, session…), no se guarda.',
      },
    ],
    en: [
      {
        q: 'What is bracket notation?',
        a: 'It is how PHP, Rails and the Node qs library send objects and lists in a URL: filter[price]=10 is an object and tags[]=a&tags[]=b is a list. If your server does not use it, turn it off and keys are read as they are.',
      },
      {
        q: 'Is what I paste saved?',
        a: 'Only in your browser, and only with “Remember what I type” on. Even then, if any key looks like a credential (token, password, api_key, session…), it is not saved.',
      },
    ],
  },
};
```

`src/tools/query-string/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    direction: 'Dirección',
    auto: 'Automática',
    toJson: 'Query → JSON',
    toQuery: 'JSON → query',
    input: 'Query string, URL o JSON',
    placeholder: 'https://example.com/buscar?q=gato&tags[]=a&tags[]=b',
    brackets: 'Notación con corchetes',
    detectTypes: 'Detectar números y booleanos',
    plus: 'Espacios como +',
    result: 'Resultado',
    detectedJson: 'Detectado: query → JSON',
    detectedQuery: 'Detectado: JSON → query',
    empty: 'Pega una URL, una query string (a=1&b=2) o un JSON con un objeto.',
    pairs: 'Pares decodificados',
    key: 'Clave',
    value: 'Valor',
    noPairs: 'No hay parámetros.',
    undecodable: 'No se pudo decodificar {seq}: se deja tal cual',
    notObject: 'El JSON debe ser un objeto, por ejemplo {"q": "gato", "page": 2}',
    jsonError: 'JSON no válido en la línea {line}, columna {column}',
    jsonErrorNoLine: 'El JSON no es válido',
    notSaved: 'Hay claves que parecen credenciales: esta entrada no se guarda.',
    copyResult: 'Copiar resultado',
  },
  en: {
    direction: 'Direction',
    auto: 'Automatic',
    toJson: 'Query → JSON',
    toQuery: 'JSON → query',
    input: 'Query string, URL or JSON',
    placeholder: 'https://example.com/search?q=cat&tags[]=a&tags[]=b',
    brackets: 'Bracket notation',
    detectTypes: 'Detect numbers and booleans',
    plus: 'Spaces as +',
    result: 'Result',
    detectedJson: 'Detected: query → JSON',
    detectedQuery: 'Detected: JSON → query',
    empty: 'Paste a URL, a query string (a=1&b=2) or a JSON object.',
    pairs: 'Decoded pairs',
    key: 'Key',
    value: 'Value',
    noPairs: 'There are no parameters.',
    undecodable: 'Could not decode {seq}: left as it is',
    notObject: 'The JSON must be an object, for example {"q": "cat", "page": 2}',
    jsonError: 'Invalid JSON at line {line}, column {column}',
    jsonErrorNoLine: 'The JSON is not valid',
    notSaved: 'Some keys look like credentials: this input is not saved.',
    copyResult: 'Copy result',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/query-string/content.es.md`:
```md
## Cómo funciona

Pega una URL completa, la parte que va después de `?` o un JSON. Si el texto empieza por `{`, se convierte de JSON a query string; si no, de query string a JSON. También puedes fijar la dirección. Cada parámetro se parte en el primer `=`, el `+` se lee como espacio y las secuencias `%XX` se decodifican. Si una secuencia está mal formada, se deja tal cual y se avisa.

Las claves repetidas (`b=2&b=3`) se convierten en una lista. Con la **notación con corchetes**, la que usan PHP, Rails o la librería `qs`, `filtro[precio]=10` se lee como un objeto y `tags[]=a&tags[]=b` como una lista. Debajo verás una tabla con todos los pares ya decodificados.

## De JSON a query string

El JSON tiene que ser un objeto. Los valores se codifican con `encodeURIComponent`, `null` queda como `clave=`, las listas salen como claves repetidas o con `[]`, y los objetos anidados como `a[b]=1`. Las claves con aspecto de credencial (`token`, `password`, `api_key`, `session`…) hacen que la entrada no se guarde en el navegador.
```

`src/tools/query-string/content.en.md`:
```md
## How it works

Paste a full URL, the part after `?` or a JSON object. If the text starts with `{`, it goes from JSON to query string; otherwise from query string to JSON. You can also fix the direction. Each parameter is split at the first `=`, `+` is read as a space and `%XX` sequences are decoded. If a sequence is malformed it is left as it is, with a note.

Repeated keys (`b=2&b=3`) become a list. With **bracket notation**, the one PHP, Rails and the `qs` library use, `filter[price]=10` is read as an object and `tags[]=a&tags[]=b` as a list. Below it you get a table with every pair already decoded.

## From JSON to query string

The JSON must be an object. Values are encoded with `encodeURIComponent`, `null` becomes `key=`, lists become repeated keys or `[]` keys, and nested objects become `a[b]=1`. Keys that look like credentials (`token`, `password`, `api_key`, `session`…) keep the input from being saved in the browser.
```

- [ ] **Step 8: `src/tools/query-string/QueryString.svelte`**

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
  import { parseJson } from '../json/logic';
  import type { Locale } from '../types';
  import {
    detectDirection,
    hasSensitiveKey,
    jsonToQuery,
    queryToJson,
    type Direction,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput(
    'query-string',
    '',
    meta.rememberInput ?? true,
    (v) => !hasSensitiveKey(v),
  );

  let direction = $state<Direction>('auto');
  let brackets = $state(true);
  let detectTypes = $state(false);
  let plus = $state(false);

  const text = $derived(input.value.trim());
  const dir = $derived(direction === 'auto' ? detectDirection(text) : direction);
  const sensitive = $derived(!!text && hasSensitiveKey(text));

  const out = $derived.by(() => {
    if (!text) return null;
    if (dir === 'toJson') {
      const r = queryToJson(text, { brackets, detectTypes });
      return {
        ok: true as const,
        output: JSON.stringify(r.value, null, 2),
        pairs: r.pairs,
        undecodable: r.undecodable,
      };
    }
    const parsed = parseJson(text);
    if (!parsed.ok) {
      const { line, column } = parsed.error;
      return {
        ok: false as const,
        error: line ? fill(s.jsonError, { line, column: column ?? 1 }) : s.jsonErrorNoLine,
      };
    }
    const r = jsonToQuery(parsed.value, { brackets, plusForSpace: plus });
    if (!r.ok) return { ok: false as const, error: s.notObject };
    return {
      ok: true as const,
      output: r.query,
      pairs: queryToJson(r.query, { brackets, detectTypes: false }).pairs,
      undecodable: [] as string[],
    };
  });
</script>

<div class="panel">
  <Segmented
    label={s.direction}
    options={[
      { value: 'auto', label: s.auto },
      { value: 'toJson', label: s.toJson },
      { value: 'toQuery', label: s.toQuery },
    ]}
    bind:value={direction}
  />

  <Field
    id="query-string-input"
    label={s.input}
    help={sensitive && input.remember ? s.notSaved : undefined}
  >
    {#snippet children({ describedby })}
      <TextArea
        id="query-string-input"
        bind:value={input.value}
        placeholder={s.placeholder}
        {describedby}
        invalid={!!out && !out.ok}
        rows={6}
      />
    {/snippet}
  </Field>

  <div class="row">
    <Toggle bind:checked={brackets} label={s.brackets} />
    {#if dir === 'toJson'}
      <Toggle bind:checked={detectTypes} label={s.detectTypes} />
    {:else}
      <Toggle bind:checked={plus} label={s.plus} />
    {/if}
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={!out ? 'idle' : out.ok ? 'ok' : 'bad'}
        label={!out
          ? t(locale, 'led.idle')
          : !out.ok
            ? out.error
            : dir === 'toJson'
              ? s.detectedJson
              : s.detectedQuery}
      />
    {/snippet}
    {#if out?.ok}
      <pre class="display-code">{out.output || ' '}</pre>
      {#each out.undecodable as seq (seq)}
        <p class="display-note">{fill(s.undecodable, { seq })}</p>
      {/each}
      <h2 class="pairs-title">{s.pairs}</h2>
      {#if out.pairs.length}
        <div class="pairs-wrap">
          <table class="pairs">
            <thead>
              <tr><th scope="col">{s.key}</th><th scope="col">{s.value}</th></tr>
            </thead>
            <tbody>
              {#each out.pairs as [k, v], i (i)}
                <tr><td>{k}</td><td>{v}</td></tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p class="display-note">{s.noPairs}</p>
      {/if}
    {:else}
      <p class="display-note">{out ? out.error : s.empty}</p>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={out?.ok ? out.output : ''} {locale} label={s.copyResult} />
    <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}
      >{t(locale, 'ui.clear')}</Button
    >
  </div>
  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .pairs-title {
    margin-top: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--disp-dim);
  }
  .pairs-wrap {
    max-height: 50vh;
    overflow: auto;
  }
  .pairs {
    width: 100%;
    border-collapse: collapse;
    font: 400 14px/1.45 var(--font-mono);
  }
  .pairs th {
    text-align: left;
    font: 600 12.5px var(--font-body);
    color: var(--disp-dim);
  }
  .pairs th,
  .pairs td {
    padding: 6px 12px 6px 0;
    border-bottom: 1px solid var(--disp-line);
    vertical-align: top;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as queryString } from './query-string/meta';
```
→
```ts
import { meta as queryString } from './query-string/meta';
```
y
```ts
  // queryString,
```
→
```ts
  queryString,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import QueryString from '../tools/query-string/QueryString.svelte';
```
→
```astro
import QueryString from '../tools/query-string/QueryString.svelte';
```
y
```astro
{/* {id === 'query-string' && <QueryString client:load locale={locale} />} */}
```
→
```astro
{id === 'query-string' && <QueryString client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/conversor-query-string-json.html dist/en/query-string-to-json.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `query-string` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador (desechable, puerto 4678)**

Crea `.check-query-string.mjs` en la raíz del worktree:
```js
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4678';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));

await page.goto(`${BASE}/es/conversor-query-string-json`);
await page.locator('#query-string-input').fill('?a=1&b=2&b=3&c[d]=x');
assert.deepEqual(JSON.parse(await page.locator('.display-code').innerText()), {
  a: '1',
  b: ['2', '3'],
  c: { d: 'x' },
});
await page.waitForTimeout(500);
const saved = () => page.evaluate(() => localStorage.getItem('devtools:input.query-string'));
assert.equal(await saved(), '?a=1&b=2&b=3&c[d]=x');

await page.locator('#query-string-input').fill('?token=abc');
await page.waitForTimeout(500);
assert.equal(await saved(), null);

await page.locator('#query-string-input').fill('{"q":"café con leche","tags":["a","b"]}');
assert.equal(await page.locator('.display-code').innerText(), 'q=caf%C3%A9%20con%20leche&tags[]=a&tags[]=b');
assert.match(await page.locator('.pairs').innerText(), /café con leche/);

await browser.close();
assert.deepEqual(errors, []);
console.log('OK query-string');
```

Run:
```bash
./node_modules/.bin/astro preview --port 4678 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
until curl -sf -o /dev/null http://localhost:4678/es; do sleep 0.5; done
node .check-query-string.mjs
kill $PREVIEW
rm .check-query-string.mjs
```
Expected: la última línea es `OK query-string` y no hay ningún error de página. Si falla un paso, arregla el componente, no la comprobación.

A mano, con `pnpm preview`, en `/es/conversor-query-string-json` y `/en/query-string-to-json`, primero en el tema claro y luego en oscuro y terminal, a 390 px y a 1280 px de ancho:
1. `?a=1&b=2&b=3&c[d]=x` → `{"a": "1", "b": ["2", "3"], "c": {"d": "x"}}` y cuatro filas en la tabla de pares.
2. Una URL real con `utm_source` y `%20` → todo decodificado en la tabla.
3. `?token=abc` → la ayuda del campo dice que no se guarda; recarga y el campo vuelve con lo último que sí se guardó (o vacío).
4. `{"q": "café con leche", "tags": ["a", "b"]}` → `q=caf%C3%A9%20con%20leche&tags[]=a&tags[]=b`; «Espacios como +» → `q=caf%C3%A9+con+leche…`.
5. `__proto__[x]=1` → aparece como clave normal en el JSON, y en la consola `({}).x` sigue siendo `undefined`.

- [ ] **Step 12: Commit**

```bash
git add src/tools/query-string src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (tampoco `.check-query-string.mjs`, que ya se borró). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(query-string): query string a JSON y JSON a query string"
```

---

### Task 9: Códigos HTTP: la tabla completa de IANA, búsqueda sin tildes y enlaces con `#404`

**Files:**
- Create: `src/tools/http-status/logic.ts`, `src/tools/http-status/logic.test.ts`, `src/tools/http-status/meta.ts`, `src/tools/http-status/strings.ts`, `src/tools/http-status/content.es.md`, `src/tools/http-status/content.en.md`, `src/tools/http-status/HttpStatus.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `fill`; `t` (`tool.remember`); kit: `Field`, `Segmented`, `Display`, `CopyButton`, `Toggle` y `persistedInput`.
- Produces:
  - `interface StatusCode { code; phrase; es; desc: { es; en }; when?; ref; note? }`, `type Group = 'all' | '1' | … | '5'`, `CODES` (63 códigos)
  - `normalize(s)`, `searchCodes(query, group = 'all')`, `codeFromHash(hash)`
  - `meta: ToolMeta` (id `http-status`, slugs `codigos-estado-http` / `http-status-codes`), `strings: Record<Locale, …>` y el componente `HttpStatus` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 14: `#http-status-search`, `.panel .code-row` (una fila por código, con `id="status-<código>"`), `.code-row .num`, `.highlight` (el código enlazado con `#`) y el filtro «Todos · 1xx … 5xx» (`role="radio"`).

**§8.9 (vinculante):** `http-status` · ref · sin pestañas. Buscador y filtro (Segmented secundario Todos · 1xx · 2xx · 3xx · 4xx · 5xx). Tabla en `logic.ts`: código, frase oficial de IANA, nombre en español, descripción de 1–2 frases en ES y EN, «cuándo usarlo» si aporta y referencia. Códigos 100–103; 200–208 y 226; 300–305, 307 y 308 (306 «sin uso»); 400–418 (418 broma, RFC 2324); 421–426, 428, 429, 431 y 451; 500–508, 510 y 511, con las RFC de la ficha. Búsqueda por prefijo de código (`40` → 400–409) o por texto en los dos idiomas, sin tildes ni mayúsculas; `#404` en la URL resalta ese código. Una fila por código con un botón para copiarlo. Recordar ✓ (la búsqueda).

Cómo se cubre cada punto:
- La tabla: test `has every code the spec lists, once and in order` (63 códigos) y `gives every code a phrase, a Spanish name, both descriptions and a reference`.
- Nombres y RFC actuales: test `uses the current RFC 9110 names and the right references` (413 «Content Too Large», 422 «Unprocessable Content», 418 broma de la RFC 2324, 306 sin uso, 451, 425 y 103). El 506 cita la RFC 2295, que es la que lo define en el registro de IANA aunque la ficha no la liste.
- Búsqueda: tests `finds by code prefix`, `finds by text in either language, ignoring accents and case` (`teapot`, `TETERA`) y `filters by group`.
- Enlace `#404`: test `reads a known code from the URL hash`; el componente resalta la fila, la centra y, si una búsqueda guardada la ocultaba, la limpia.
- Cada fila tiene su «Copiar» con `ariaLabel` propio («Copiar el código 404»). No hay `CopyButton main`: no hay un resultado principal que copiar.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l3-http-status -b lote-3/http-status   # desde el commit de la Task 0
cd ../devtools-l3-http-status
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task (Field, Segmented, Display, CopyButton, Toggle) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real y dilo en el commit.

- [ ] **Step 2: Test (falla)**

`src/tools/http-status/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { CODES, codeFromHash, normalize, searchCodes } from './logic';

const codes = (list: readonly { code: number }[]) => list.map((c) => c.code);

describe('the table', () => {
  it('has every code the spec lists, once and in order', () => {
    const expected = [
      100, 101, 102, 103, 200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304,
      305, 306, 307, 308, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414,
      415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451, 500, 501, 502, 503, 504,
      505, 506, 507, 508, 510, 511,
    ];
    expect(codes(CODES)).toEqual(expected);
  });

  it('gives every code a phrase, a Spanish name, both descriptions and a reference', () => {
    for (const c of CODES) {
      expect(c.phrase, String(c.code)).toBeTruthy();
      expect(c.es, String(c.code)).toBeTruthy();
      expect(c.desc.es, String(c.code)).toBeTruthy();
      expect(c.desc.en, String(c.code)).toBeTruthy();
      expect(c.ref, String(c.code)).toMatch(/^RFC \d{4}$/);
    }
  });

  it('uses the current RFC 9110 names and the right references', () => {
    const by = (n: number) => CODES.find((c) => c.code === n)!;
    expect(by(413).phrase).toBe('Content Too Large');
    expect(by(422)).toMatchObject({ phrase: 'Unprocessable Content', ref: 'RFC 9110' });
    expect(by(418)).toMatchObject({ ref: 'RFC 2324', note: 'joke' });
    expect(by(306).note).toBe('unused');
    expect(by(451).ref).toBe('RFC 7725');
    expect(by(425).ref).toBe('RFC 8470');
    expect(by(103).ref).toBe('RFC 8297');
  });
});

describe('searchCodes', () => {
  it('finds by code prefix', () => {
    expect(codes(searchCodes('404'))).toEqual([404]);
    expect(codes(searchCodes('40'))).toEqual([400, 401, 402, 403, 404, 405, 406, 407, 408, 409]);
    expect(codes(searchCodes('5')).length).toBe(11);
  });

  it('finds by text in either language, ignoring accents and case', () => {
    expect(codes(searchCodes('teapot'))).toEqual([418]);
    expect(codes(searchCodes('TETERA'))).toEqual([418]);
    expect(codes(searchCodes('demasiadas peticiones'))).toEqual([429]);
    expect(codes(searchCodes('autenticacion de red'))).toEqual([511]);
    expect(codes(searchCodes('not found'))).toEqual([404]);
  });

  it('filters by group', () => {
    expect(codes(searchCodes('', '1'))).toEqual([100, 101, 102, 103]);
    expect(codes(searchCodes('redirect', '3'))).toEqual([302, 303, 307, 308]);
    expect(searchCodes('404', '5')).toEqual([]);
  });
});

describe('helpers', () => {
  it('normalizes accents and case', () => {
    expect(normalize('Petición Única')).toBe('peticion unica');
  });

  it('reads a known code from the URL hash', () => {
    expect(codeFromHash('#404')).toBe(404);
    expect(codeFromHash('#999')).toBeNull();
    expect(codeFromHash('#abc')).toBeNull();
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/http-status`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/http-status/logic.ts`**

Los datos van a mano en `logic.ts`, con la fecha y la fuente en un comentario (§10 de la spec: tablas que cambian con el tiempo). `normalize` quita las marcas diacríticas con `NFD`, así «peticion» encuentra «petición».

```ts
export interface StatusCode {
  code: number;
  /** Reason phrase as registered by IANA (English). */
  phrase: string;
  /** Spanish name. */
  es: string;
  desc: { es: string; en: string };
  /** When to use it, when it helps. */
  when?: { es: string; en: string };
  ref: string;
  note?: 'joke' | 'unused' | 'historic';
}

export type Group = 'all' | '1' | '2' | '3' | '4' | '5';

// Source: IANA HTTP Status Code Registry and the RFCs cited, checked on 2026-09-26.
export const CODES: readonly StatusCode[] = [
  {
    code: 100,
    phrase: 'Continue',
    es: 'Continuar',
    desc: {
      es: 'El servidor ha recibido las cabeceras y el cliente puede enviar el cuerpo.',
      en: 'The server got the headers and the client may send the body.',
    },
    when: {
      es: 'Respuesta a Expect: 100-continue antes de subir un cuerpo grande.',
      en: 'Reply to Expect: 100-continue before uploading a large body.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 101,
    phrase: 'Switching Protocols',
    es: 'Cambiando de protocolo',
    desc: {
      es: 'El servidor acepta cambiar al protocolo que pide la cabecera Upgrade.',
      en: 'The server agrees to switch to the protocol named in the Upgrade header.',
    },
    when: { es: 'Al abrir un WebSocket.', en: 'When opening a WebSocket.' },
    ref: 'RFC 9110',
  },
  {
    code: 102,
    phrase: 'Processing',
    es: 'Procesando',
    desc: {
      es: 'WebDAV: la petición sigue en curso y aún no hay respuesta final. Hoy está en desuso.',
      en: 'WebDAV: the request is still being processed and there is no final answer yet. Deprecated today.',
    },
    ref: 'RFC 2518',
  },
  {
    code: 103,
    phrase: 'Early Hints',
    es: 'Pistas tempranas',
    desc: {
      es: 'Envía cabeceras Link por adelantado para que el navegador precargue recursos mientras se prepara la respuesta.',
      en: 'Sends Link headers early so the browser can preload resources while the response is being prepared.',
    },
    ref: 'RFC 8297',
  },
  {
    code: 200,
    phrase: 'OK',
    es: 'Correcto',
    desc: {
      es: 'La petición ha ido bien y la respuesta lleva el resultado.',
      en: 'The request succeeded and the response carries the result.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 201,
    phrase: 'Created',
    es: 'Creado',
    desc: {
      es: 'Se ha creado un recurso nuevo. La cabecera Location suele indicar su URL.',
      en: 'A new resource was created. The Location header usually gives its URL.',
    },
    when: { es: 'Tras un POST que crea algo.', en: 'After a POST that creates something.' },
    ref: 'RFC 9110',
  },
  {
    code: 202,
    phrase: 'Accepted',
    es: 'Aceptado',
    desc: {
      es: 'La petición se ha aceptado, pero se procesará más tarde.',
      en: 'The request was accepted but will be processed later.',
    },
    when: { es: 'Trabajos en cola o asíncronos.', en: 'Queued or asynchronous jobs.' },
    ref: 'RFC 9110',
  },
  {
    code: 203,
    phrase: 'Non-Authoritative Information',
    es: 'Información no autorizada',
    desc: {
      es: 'Correcto, pero un proxy ha modificado la respuesta del servidor original.',
      en: 'Success, but a proxy has changed the origin server response.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 204,
    phrase: 'No Content',
    es: 'Sin contenido',
    desc: {
      es: 'Correcto y sin cuerpo en la respuesta.',
      en: 'Success, with no body in the response.',
    },
    when: {
      es: 'Un DELETE o un PUT que no necesita devolver nada.',
      en: 'A DELETE or PUT that does not need to return anything.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 205,
    phrase: 'Reset Content',
    es: 'Restablecer contenido',
    desc: {
      es: 'Correcto; el cliente debe vaciar el formulario o la vista que envió la petición.',
      en: 'Success; the client should reset the form or view that sent the request.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 206,
    phrase: 'Partial Content',
    es: 'Contenido parcial',
    desc: {
      es: 'Devuelve solo el trozo pedido con la cabecera Range.',
      en: 'Returns only the part requested with the Range header.',
    },
    when: {
      es: 'Reanudar descargas y hacer streaming de vídeo.',
      en: 'Resuming downloads and video streaming.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 207,
    phrase: 'Multi-Status',
    es: 'Estado múltiple',
    desc: {
      es: 'WebDAV: el cuerpo XML lleva un estado distinto para cada recurso afectado.',
      en: 'WebDAV: the XML body carries a separate status for each resource involved.',
    },
    ref: 'RFC 4918',
  },
  {
    code: 208,
    phrase: 'Already Reported',
    es: 'Ya informado',
    desc: {
      es: 'WebDAV: este recurso ya apareció antes en la misma respuesta 207.',
      en: 'WebDAV: this resource was already listed earlier in the same 207 response.',
    },
    ref: 'RFC 5842',
  },
  {
    code: 226,
    phrase: 'IM Used',
    es: 'IM usada',
    desc: {
      es: 'La respuesta es el resultado de aplicar una transformación (delta encoding) al recurso.',
      en: 'The response is the result of applying an instance manipulation (delta encoding) to the resource.',
    },
    ref: 'RFC 3229',
  },
  {
    code: 300,
    phrase: 'Multiple Choices',
    es: 'Varias opciones',
    desc: {
      es: 'El recurso tiene varias representaciones y el cliente puede elegir una.',
      en: 'The resource has several representations and the client may choose one.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 301,
    phrase: 'Moved Permanently',
    es: 'Movido permanentemente',
    desc: {
      es: 'El recurso tiene una URL nueva para siempre, indicada en Location. Los buscadores trasladan el posicionamiento.',
      en: 'The resource has a new permanent URL, given in Location. Search engines carry the ranking over.',
    },
    when: {
      es: 'Cambios de dominio o de estructura de URL. Algunos clientes cambian POST por GET: si importa, usa 308.',
      en: 'Domain or URL structure changes. Some clients turn POST into GET: if that matters, use 308.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 302,
    phrase: 'Found',
    es: 'Encontrado',
    desc: {
      es: 'El recurso está temporalmente en otra URL, indicada en Location.',
      en: 'The resource is temporarily at another URL, given in Location.',
    },
    when: {
      es: 'Redirecciones temporales. Para conservar el método, usa 307.',
      en: 'Temporary redirects. To keep the method, use 307.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 303,
    phrase: 'See Other',
    es: 'Ver otro',
    desc: {
      es: 'El resultado está en otra URL que hay que pedir con GET.',
      en: 'The result is at another URL that must be fetched with GET.',
    },
    when: {
      es: 'Después de enviar un formulario (patrón POST/redirect/GET).',
      en: 'After a form submission (POST/redirect/GET pattern).',
    },
    ref: 'RFC 9110',
  },
  {
    code: 304,
    phrase: 'Not Modified',
    es: 'No modificado',
    desc: {
      es: 'El recurso no ha cambiado desde la copia en caché del cliente, así que no se reenvía.',
      en: 'The resource has not changed since the client cached copy, so it is not sent again.',
    },
    when: {
      es: 'Respuesta a If-None-Match o If-Modified-Since.',
      en: 'Reply to If-None-Match or If-Modified-Since.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 305,
    phrase: 'Use Proxy',
    es: 'Usar proxy',
    desc: {
      es: 'Obsoleto: pedía repetir la petición a través de un proxy. Los navegadores lo ignoran por seguridad.',
      en: 'Obsolete: asked to repeat the request through a proxy. Browsers ignore it for security reasons.',
    },
    ref: 'RFC 9110',
    note: 'historic',
  },
  {
    code: 306,
    phrase: '(Unused)',
    es: 'Sin uso',
    desc: {
      es: 'Se usó en un borrador antiguo («Switch Proxy») y hoy está reservado.',
      en: 'Used in an old draft (“Switch Proxy”) and reserved today.',
    },
    ref: 'RFC 9110',
    note: 'unused',
  },
  {
    code: 307,
    phrase: 'Temporary Redirect',
    es: 'Redirección temporal',
    desc: {
      es: 'Como 302, pero el cliente debe repetir la petición con el mismo método y cuerpo.',
      en: 'Like 302, but the client must repeat the request with the same method and body.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 308,
    phrase: 'Permanent Redirect',
    es: 'Redirección permanente',
    desc: {
      es: 'Como 301, pero conservando el método y el cuerpo.',
      en: 'Like 301, but keeping the method and the body.',
    },
    when: { es: 'Mover una API de forma permanente.', en: 'Moving an API for good.' },
    ref: 'RFC 9110',
  },
  {
    code: 400,
    phrase: 'Bad Request',
    es: 'Petición incorrecta',
    desc: {
      es: 'La petición está mal formada: sintaxis, parámetros o cuerpo no válidos.',
      en: 'The request is malformed: invalid syntax, parameters or body.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 401,
    phrase: 'Unauthorized',
    es: 'No autenticado',
    desc: {
      es: 'Falta autenticarse o las credenciales no valen. Debe ir con una cabecera WWW-Authenticate.',
      en: 'Authentication is missing or the credentials are wrong. It must come with a WWW-Authenticate header.',
    },
    when: {
      es: 'Sin sesión o con un token caducado. Si está autenticado pero no tiene permiso, es 403.',
      en: 'No session or an expired token. If the user is authenticated but not allowed, use 403.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 402,
    phrase: 'Payment Required',
    es: 'Pago requerido',
    desc: {
      es: 'Reservado para usos futuros de pago. Algunas API lo usan cuando se acaba el saldo o la suscripción.',
      en: 'Reserved for future payment use. Some APIs use it when credit or a subscription runs out.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 403,
    phrase: 'Forbidden',
    es: 'Prohibido',
    desc: {
      es: 'El servidor entiende la petición pero se niega a atenderla. Volver a autenticarse no cambia nada.',
      en: 'The server understands the request but refuses it. Authenticating again will not help.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 404,
    phrase: 'Not Found',
    es: 'No encontrado',
    desc: {
      es: 'No existe nada en esa URL, o el servidor prefiere no decir que existe.',
      en: 'There is nothing at that URL, or the server would rather not say it exists.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 405,
    phrase: 'Method Not Allowed',
    es: 'Método no permitido',
    desc: {
      es: 'El recurso existe pero no admite ese método. La cabecera Allow lista los que sí.',
      en: 'The resource exists but does not accept that method. The Allow header lists the ones it does.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 406,
    phrase: 'Not Acceptable',
    es: 'No aceptable',
    desc: {
      es: 'No hay ninguna representación que encaje con las cabeceras Accept del cliente.',
      en: 'No representation matches the client Accept headers.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 407,
    phrase: 'Proxy Authentication Required',
    es: 'Autenticación de proxy requerida',
    desc: {
      es: 'Como 401, pero es el proxy el que pide credenciales.',
      en: 'Like 401, but the proxy is the one asking for credentials.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 408,
    phrase: 'Request Timeout',
    es: 'Tiempo de espera agotado',
    desc: {
      es: 'El cliente tardó demasiado en enviar la petición completa y el servidor cerró la conexión.',
      en: 'The client took too long to send the full request and the server closed the connection.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 409,
    phrase: 'Conflict',
    es: 'Conflicto',
    desc: {
      es: 'La petición choca con el estado actual del recurso.',
      en: 'The request conflicts with the current state of the resource.',
    },
    when: {
      es: 'Ediciones simultáneas o un nombre de usuario ya ocupado.',
      en: 'Concurrent edits or a username that is already taken.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 410,
    phrase: 'Gone',
    es: 'Ya no existe',
    desc: {
      es: 'El recurso existía y se ha borrado para siempre, sin dirección nueva.',
      en: 'The resource existed and has been removed for good, with no new address.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 411,
    phrase: 'Length Required',
    es: 'Longitud requerida',
    desc: {
      es: 'El servidor exige la cabecera Content-Length.',
      en: 'The server requires a Content-Length header.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 412,
    phrase: 'Precondition Failed',
    es: 'Precondición fallida',
    desc: {
      es: 'No se cumple una condición de la petición, como If-Match con un ETag antiguo.',
      en: 'A condition in the request is not met, such as If-Match with an old ETag.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 413,
    phrase: 'Content Too Large',
    es: 'Contenido demasiado grande',
    desc: {
      es: 'El cuerpo supera el tamaño que acepta el servidor. Antes se llamaba Payload Too Large.',
      en: 'The body is larger than the server accepts. It used to be called Payload Too Large.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 414,
    phrase: 'URI Too Long',
    es: 'URI demasiado larga',
    desc: {
      es: 'La URL es más larga de lo que el servidor puede procesar.',
      en: 'The URL is longer than the server can process.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 415,
    phrase: 'Unsupported Media Type',
    es: 'Tipo de contenido no admitido',
    desc: {
      es: 'El servidor no acepta el formato del cuerpo (Content-Type o Content-Encoding).',
      en: 'The server does not accept the body format (Content-Type or Content-Encoding).',
    },
    ref: 'RFC 9110',
  },
  {
    code: 416,
    phrase: 'Range Not Satisfiable',
    es: 'Rango no satisfactorio',
    desc: {
      es: 'El rango pedido con Range queda fuera del tamaño del recurso.',
      en: 'The range asked for with Range falls outside the resource size.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 417,
    phrase: 'Expectation Failed',
    es: 'Expectativa fallida',
    desc: {
      es: 'El servidor no puede cumplir lo que pide la cabecera Expect.',
      en: 'The server cannot meet what the Expect header asks for.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 418,
    phrase: "I'm a teapot",
    es: 'Soy una tetera',
    desc: {
      es: 'Una broma del Día de los Inocentes de 1998: una tetera se niega a hacer café. RFC 9110 lo reserva para que nadie lo reutilice.',
      en: 'An April Fools joke from 1998: a teapot refuses to brew coffee. RFC 9110 reserves it so nobody reuses it.',
    },
    ref: 'RFC 2324',
    note: 'joke',
  },
  {
    code: 421,
    phrase: 'Misdirected Request',
    es: 'Petición mal dirigida',
    desc: {
      es: 'La petición llegó a un servidor que no puede responder por ese dominio, por ejemplo al reutilizar una conexión HTTP/2.',
      en: 'The request reached a server that cannot answer for that host, for example when reusing an HTTP/2 connection.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 422,
    phrase: 'Unprocessable Content',
    es: 'Contenido no procesable',
    desc: {
      es: 'La sintaxis es correcta, pero los datos no pasan la validación.',
      en: 'The syntax is fine, but the data fails validation.',
    },
    when: {
      es: 'Errores de validación en una API (un email vacío, una fecha imposible).',
      en: 'Validation errors in an API (an empty email, an impossible date).',
    },
    ref: 'RFC 9110',
  },
  {
    code: 423,
    phrase: 'Locked',
    es: 'Bloqueado',
    desc: {
      es: 'WebDAV: el recurso está bloqueado por otro cliente.',
      en: 'WebDAV: the resource is locked by another client.',
    },
    ref: 'RFC 4918',
  },
  {
    code: 424,
    phrase: 'Failed Dependency',
    es: 'Dependencia fallida',
    desc: {
      es: 'WebDAV: la acción falló porque falló otra de la que dependía.',
      en: 'WebDAV: the action failed because another one it depended on failed.',
    },
    ref: 'RFC 4918',
  },
  {
    code: 425,
    phrase: 'Too Early',
    es: 'Demasiado pronto',
    desc: {
      es: 'El servidor no quiere procesar una petición enviada en los datos tempranos de TLS 1.3, porque podría repetirse.',
      en: 'The server will not process a request sent in TLS 1.3 early data, because it could be replayed.',
    },
    ref: 'RFC 8470',
  },
  {
    code: 426,
    phrase: 'Upgrade Required',
    es: 'Actualización requerida',
    desc: {
      es: 'Hay que cambiar a otro protocolo, indicado en la cabecera Upgrade.',
      en: 'The client must switch to another protocol, given in the Upgrade header.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 428,
    phrase: 'Precondition Required',
    es: 'Precondición requerida',
    desc: {
      es: 'El servidor exige peticiones condicionales (If-Match) para evitar que se pisen cambios.',
      en: 'The server requires conditional requests (If-Match) so changes are not overwritten.',
    },
    ref: 'RFC 6585',
  },
  {
    code: 429,
    phrase: 'Too Many Requests',
    es: 'Demasiadas peticiones',
    desc: {
      es: 'El cliente ha superado el límite de peticiones. Retry-After indica cuánto esperar.',
      en: 'The client went over the rate limit. Retry-After says how long to wait.',
    },
    when: { es: 'Limitación de uso de una API.', en: 'API rate limiting.' },
    ref: 'RFC 6585',
  },
  {
    code: 431,
    phrase: 'Request Header Fields Too Large',
    es: 'Cabeceras demasiado grandes',
    desc: {
      es: 'Las cabeceras, o una de ellas, son demasiado grandes. Suele pasar con cookies enormes.',
      en: 'The headers, or one of them, are too large. It often happens with huge cookies.',
    },
    ref: 'RFC 6585',
  },
  {
    code: 451,
    phrase: 'Unavailable For Legal Reasons',
    es: 'No disponible por razones legales',
    desc: {
      es: 'El recurso no se sirve por una orden legal, como una censura o una demanda. El número homenajea a Fahrenheit 451.',
      en: 'The resource is withheld because of a legal demand, such as censorship or a lawsuit. The number nods to Fahrenheit 451.',
    },
    ref: 'RFC 7725',
  },
  {
    code: 500,
    phrase: 'Internal Server Error',
    es: 'Error interno del servidor',
    desc: {
      es: 'Algo ha fallado en el servidor y no hay un código más concreto.',
      en: 'Something failed on the server and there is no more specific code.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 501,
    phrase: 'Not Implemented',
    es: 'No implementado',
    desc: {
      es: 'El servidor no admite la funcionalidad necesaria, por ejemplo un método que no conoce.',
      en: 'The server does not support the functionality needed, for example a method it does not know.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 502,
    phrase: 'Bad Gateway',
    es: 'Puerta de enlace incorrecta',
    desc: {
      es: 'Un proxy o pasarela recibió una respuesta no válida del servidor de detrás.',
      en: 'A proxy or gateway got an invalid response from the server behind it.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 503,
    phrase: 'Service Unavailable',
    es: 'Servicio no disponible',
    desc: {
      es: 'El servidor no puede atender ahora, por sobrecarga o mantenimiento. Retry-After puede indicar cuándo volver.',
      en: 'The server cannot handle the request right now, because of overload or maintenance. Retry-After may say when to come back.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 504,
    phrase: 'Gateway Timeout',
    es: 'Tiempo de espera de la pasarela agotado',
    desc: {
      es: 'Un proxy o pasarela no recibió respuesta a tiempo del servidor de detrás.',
      en: 'A proxy or gateway did not get a timely response from the server behind it.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 505,
    phrase: 'HTTP Version Not Supported',
    es: 'Versión de HTTP no admitida',
    desc: {
      es: 'El servidor no admite la versión de HTTP de la petición.',
      en: 'The server does not support the HTTP version of the request.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 506,
    phrase: 'Variant Also Negotiates',
    es: 'La variante también negocia',
    desc: {
      es: 'Error de configuración en la negociación de contenido: la variante elegida vuelve a negociar.',
      en: 'Content negotiation misconfiguration: the chosen variant negotiates again.',
    },
    ref: 'RFC 2295',
  },
  {
    code: 507,
    phrase: 'Insufficient Storage',
    es: 'Almacenamiento insuficiente',
    desc: {
      es: 'WebDAV: el servidor no tiene espacio para guardar lo que se pide.',
      en: 'WebDAV: the server has no room to store what is asked.',
    },
    ref: 'RFC 4918',
  },
  {
    code: 508,
    phrase: 'Loop Detected',
    es: 'Bucle detectado',
    desc: {
      es: 'WebDAV: el servidor encontró un bucle infinito al procesar la petición.',
      en: 'WebDAV: the server found an infinite loop while processing the request.',
    },
    ref: 'RFC 5842',
  },
  {
    code: 510,
    phrase: 'Not Extended',
    es: 'No extendido',
    desc: {
      es: 'Histórico: la petición necesitaba extensiones que el servidor no admite.',
      en: 'Historic: the request needed extensions the server does not support.',
    },
    ref: 'RFC 2774',
    note: 'historic',
  },
  {
    code: 511,
    phrase: 'Network Authentication Required',
    es: 'Autenticación de red requerida',
    desc: {
      es: 'Hay que iniciar sesión en la red para salir a internet, como en el wifi de un hotel o un aeropuerto.',
      en: 'You must log in to the network to reach the internet, as on hotel or airport WiFi.',
    },
    ref: 'RFC 6585',
  },
];

/** Lowercase, without accents: "Categoría" and "categoria" match. */
export function normalize(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** By code prefix ("40" → 400–409) or by text in both languages. */
export function searchCodes(query: string, group: Group = 'all'): StatusCode[] {
  const q = normalize(query.trim());
  const inGroup = CODES.filter((c) => group === 'all' || String(c.code)[0] === group);
  if (!q) return inGroup;
  if (/^\d{1,3}$/.test(q)) return inGroup.filter((c) => String(c.code).startsWith(q));
  return inGroup.filter((c) =>
    [c.phrase, c.es, c.desc.es, c.desc.en, c.when?.es ?? '', c.when?.en ?? '', c.ref].some((t) =>
      normalize(t).includes(q),
    ),
  );
}

/** "#404" in the URL → 404, when that code is in the table. */
export function codeFromHash(hash: string): number | null {
  const m = /^#(\d{3})$/.exec(hash);
  if (!m) return null;
  const code = Number(m[1]);
  return CODES.some((c) => c.code === code) ? code : null;
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/http-status`
Expected: PASS (8 tests).

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/http-status/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'http-status',
  category: 'ref',
  icon: 'server',
  slug: { es: 'codigos-estado-http', en: 'http-status-codes' },
  name: { es: 'Códigos HTTP', en: 'HTTP status codes' },
  title: {
    es: 'Códigos de estado HTTP: lista completa explicada',
    en: 'HTTP status codes: complete list explained',
  },
  description: {
    es: 'Todos los códigos de estado HTTP, del 100 al 511, con su nombre oficial, qué significan, cuándo usarlos y el RFC que los define. Busca por número o palabra.',
    en: 'Every HTTP status code from 100 to 511, with its official name, what it means, when to use it and the RFC that defines it. Search by number or word.',
  },
  keywords: {
    es: [
      'codigos http',
      'codigos de estado http',
      'error 404',
      'error 500',
      'lista codigos http',
      'http status',
    ],
    en: [
      'http status codes',
      'http status code list',
      '404 not found',
      '500 internal server error',
      'http response codes',
      'rest api status codes',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Qué diferencia hay entre 401 y 403?',
        a: '401 significa que no te has identificado o que tus credenciales no valen: volver a iniciar sesión puede arreglarlo. 403 significa que el servidor sabe quién eres y aun así no te deja pasar.',
      },
      {
        q: '¿301 o 308? ¿302 o 307?',
        a: 'Los cuatro redirigen. 307 y 308 obligan a repetir la petición con el mismo método y cuerpo; con 301 y 302, muchos clientes convierten un POST en GET. Para cambios permanentes, 301 o 308; para temporales, 302 o 307.',
      },
    ],
    en: [
      {
        q: 'What is the difference between 401 and 403?',
        a: '401 means you are not identified or your credentials are wrong: logging in again may fix it. 403 means the server knows who you are and still will not let you in.',
      },
      {
        q: '301 or 308? 302 or 307?',
        a: 'All four redirect. 307 and 308 require repeating the request with the same method and body; with 301 and 302 many clients turn a POST into a GET. For permanent moves use 301 or 308; for temporary ones, 302 or 307.',
      },
    ],
  },
};
```

`src/tools/http-status/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    search: 'Buscar',
    placeholder: '404, teapot, demasiadas peticiones…',
    group: 'Familia',
    all: 'Todos',
    result: 'Códigos',
    count: '{n} códigos',
    one: '1 código',
    none: 'Ningún código coincide con «{q}». Prueba con un número (40) o con otra palabra.',
    when: 'Cuándo usarlo:',
    joke: 'Broma',
    unused: 'Sin uso',
    historic: 'Histórico',
    copyCode: 'Copiar',
    copyCodeOf: 'Copiar el código {code}',
  },
  en: {
    search: 'Search',
    placeholder: '404, teapot, too many requests…',
    group: 'Class',
    all: 'All',
    result: 'Codes',
    count: '{n} codes',
    one: '1 code',
    none: 'No code matches “{q}”. Try a number (40) or another word.',
    when: 'When to use it:',
    joke: 'Joke',
    unused: 'Unused',
    historic: 'Historic',
    copyCode: 'Copy',
    copyCodeOf: 'Copy code {code}',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/http-status/content.es.md`:
```md
## Cómo funciona

Cada respuesta HTTP empieza por un código de tres cifras que resume qué ha pasado. La primera cifra indica la familia: **1xx** informativos, **2xx** éxito, **3xx** redirecciones, **4xx** errores del cliente y **5xx** errores del servidor. Aquí tienes todos los códigos del registro de IANA con su nombre oficial en inglés, su nombre en español, una explicación corta, cuándo conviene usarlos y el RFC que los define.

Busca por número (escribe `40` para ver del 400 al 409) o por palabras en español o en inglés, sin preocuparte por las tildes. También puedes filtrar por familia y enlazar directamente a un código con `#404` al final de la dirección.

## Los que más se confunden

`401` es «no sé quién eres» y `403`, «sé quién eres y no puedes pasar». `400` es una petición mal formada y `422`, una petición bien formada con datos que no pasan la validación. En las redirecciones, `307` y `308` conservan el método y el cuerpo, mientras que con `301` y `302` muchos clientes cambian un POST por un GET. El `418` es una broma de 1998 que RFC 9110 reserva para que nadie lo reutilice.
```

`src/tools/http-status/content.en.md`:
```md
## How it works

Every HTTP response starts with a three-digit code that sums up what happened. The first digit gives the class: **1xx** informational, **2xx** success, **3xx** redirection, **4xx** client errors and **5xx** server errors. Here you have every code in the IANA registry with its official name, a short explanation, when it is worth using and the RFC that defines it.

Search by number (type `40` to see 400 to 409) or by words in English or Spanish, without worrying about accents. You can also filter by class and link straight to a code with `#404` at the end of the address.

## The ones people mix up

`401` is “I do not know who you are” and `403` is “I know who you are and you cannot come in”. `400` is a malformed request and `422` a well-formed request whose data fails validation. For redirects, `307` and `308` keep the method and body, while with `301` and `302` many clients turn a POST into a GET. `418` is a 1998 joke that RFC 9110 reserves so nobody reuses it.
```

- [ ] **Step 8: `src/tools/http-status/HttpStatus.svelte`**

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { fill } from '../../i18n/fill';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { t } from '../../i18n';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { codeFromHash, searchCodes, type Group } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const query = persistedInput('http-status', '', meta.rememberInput ?? true);

  let group = $state<Group>('all');
  let highlight = $state<number | null>(null);

  const results = $derived(searchCodes(query.value, group));

  onMount(() => {
    const code = codeFromHash(location.hash);
    if (code === null) return;
    // Make sure a saved search or filter does not hide the linked code.
    if (!searchCodes(query.value, group).some((c) => c.code === code)) {
      query.value = '';
      group = 'all';
    }
    highlight = code;
    void tick().then(() =>
      document.getElementById(`status-${code}`)?.scrollIntoView({ block: 'center' }),
    );
  });
</script>

<div class="panel">
  <Field id="http-status-search" label={s.search}>
    {#snippet children({ describedby })}
      <input
        id="http-status-search"
        class="control"
        type="search"
        bind:value={query.value}
        placeholder={s.placeholder}
        aria-describedby={describedby}
        autocomplete="off"
        spellcheck="false"
      />
    {/snippet}
  </Field>

  <Segmented
    label={s.group}
    options={[
      { value: 'all', label: s.all },
      { value: '1', label: '1xx' },
      { value: '2', label: '2xx' },
      { value: '3', label: '3xx' },
      { value: '4', label: '4xx' },
      { value: '5', label: '5xx' },
    ]}
    bind:value={group}
  />

  <Display live label={s.result}>
    {#snippet head()}
      <span>{results.length === 1 ? s.one : fill(s.count, { n: results.length })}</span>
    {/snippet}
    {#if results.length}
      <ul class="codes">
        {#each results as c (c.code)}
          <li id="status-{c.code}" class="code-row" class:highlight={highlight === c.code}>
            <span class="num">{c.code}</span>
            <div class="info">
              <p class="title">
                <span class="phrase">{c.phrase}</span>
                {#if locale === 'es'}<span class="es">· {c.es}</span>{/if}
                {#if c.note}<span class="badge">{s[c.note]}</span>{/if}
              </p>
              <p class="desc">{c.desc[locale]}</p>
              {#if c.when}<p class="desc"><strong>{s.when}</strong> {c.when[locale]}</p>{/if}
              <p class="ref">{c.ref}</p>
            </div>
            <CopyButton
              value={String(c.code)}
              {locale}
              compact
              label={s.copyCode}
              ariaLabel={fill(s.copyCodeOf, { code: c.code })}
            />
          </li>
        {/each}
      </ul>
    {:else}
      <p class="display-note">{fill(s.none, { q: query.value.trim() })}</p>
    {/if}
  </Display>

  <Toggle bind:checked={query.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .codes {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .code-row {
    display: grid;
    grid-template-columns: 3.2em minmax(0, 1fr) auto;
    align-items: start;
    gap: 12px;
    padding: 12px 4px;
    border-bottom: 1px solid var(--disp-line);
    scroll-margin: 96px;
  }
  .code-row:last-child {
    border-bottom: 0;
  }
  .highlight {
    background: color-mix(in srgb, var(--disp-text) 12%, transparent);
    border-radius: 6px;
  }
  .num {
    font: 600 20px/1.2 var(--font-mono);
    text-shadow: var(--disp-glow);
  }
  .info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .title {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px;
    font-weight: 600;
  }
  .es {
    font-weight: 500;
    color: var(--disp-dim);
  }
  .badge {
    padding: 1px 8px;
    border: 1px solid var(--disp-line);
    border-radius: var(--radius-pill);
    font-size: 12px;
    font-weight: 500;
    color: var(--disp-dim);
  }
  .desc {
    font-size: 14px;
    line-height: 1.5;
  }
  .ref {
    font: 12.5px var(--font-mono);
    color: var(--disp-dim);
  }
  @media (max-width: 599px) {
    .code-row {
      grid-template-columns: 2.8em minmax(0, 1fr);
    }
    .code-row :global(.copy) {
      grid-column: 2;
      justify-self: start;
    }
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as httpStatus } from './http-status/meta';
```
→
```ts
import { meta as httpStatus } from './http-status/meta';
```
y
```ts
  // httpStatus,
```
→
```ts
  httpStatus,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import HttpStatus from '../tools/http-status/HttpStatus.svelte';
```
→
```astro
import HttpStatus from '../tools/http-status/HttpStatus.svelte';
```
y
```astro
{/* {id === 'http-status' && <HttpStatus client:load locale={locale} />} */}
```
→
```astro
{id === 'http-status' && <HttpStatus client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/codigos-estado-http.html dist/en/http-status-codes.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `http-status` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador (desechable, puerto 4679)**

Crea `.check-http-status.mjs` en la raíz del worktree:
```js
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4679';
const browser = await chromium.launch();
const errors = [];
const open = async (path) => {
  const page = await browser.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
  await page.goto(`${BASE}${path}`);
  return page;
};

const page = await open('/es/codigos-estado-http');
assert.equal(await page.locator('.code-row').count(), 63);
await page.locator('#http-status-search').fill('404');
assert.match(await page.locator('.code-row').innerText(), /Not Found[\s\S]*No encontrado/);
await page.locator('#http-status-search').fill('teapot');
assert.deepEqual(await page.locator('.code-row .num').allInnerTexts(), ['418']);
await page.locator('#http-status-search').fill('');
await page.getByRole('radio', { name: '1xx', exact: true }).click();
assert.equal(await page.locator('.code-row').count(), 4);

const linked = await open('/es/codigos-estado-http#451');
await linked.locator('.highlight').waitFor();
assert.equal(await linked.locator('.highlight .num').innerText(), '451');

await browser.close();
assert.deepEqual(errors, []);
console.log('OK http-status');
```

Run:
```bash
./node_modules/.bin/astro preview --port 4679 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
until curl -sf -o /dev/null http://localhost:4679/es; do sleep 0.5; done
node .check-http-status.mjs
kill $PREVIEW
rm .check-http-status.mjs
```
Expected: la última línea es `OK http-status` y no hay ningún error de página. Si falla un paso, arregla el componente, no la comprobación.

A mano, con `pnpm preview`, en `/es/codigos-estado-http` y `/en/http-status-codes`, primero en el tema claro y luego en oscuro y terminal, a 390 px y a 1280 px de ancho:
1. `404` → «404 Not Found · No encontrado»; `40` → del 400 al 409; `teapot` o `tetera` → 418 con la etiqueta «Broma».
2. Filtro «5xx» → 11 códigos; con el filtro puesto, busca `404` → «Ningún código coincide…».
3. Abre `/es/codigos-estado-http#451` → la fila del 451 resaltada y centrada.
4. En `/en/http-status-codes` las filas muestran solo la frase oficial y la descripción en inglés.
5. «Copiar» de una fila copia solo el número. A 390 px el botón baja bajo el texto y no hay scroll horizontal.

- [ ] **Step 12: Commit**

```bash
git add src/tools/http-status src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (tampoco `.check-http-status.mjs`, que ya se borró). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(http-status): lista de códigos de estado HTTP con búsqueda"
```

---

### Task 10: Cron: parser de 5 campos, explicación en palabras y próximas ejecuciones con los cambios de hora de Vixie cron

**Files:**
- Create: `src/tools/cron/logic.ts`, `src/tools/cron/logic.test.ts`, `src/tools/cron/meta.ts`, `src/tools/cron/strings.ts`, `src/tools/cron/content.es.md`, `src/tools/cron/content.en.md`, `src/tools/cron/Cron.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `zonedToUtc` y `wallClock` (en `logic.ts`) e `isValidTimeZone` y `listTimeZones` (en el componente) de `src/tools/timestamp/logic.ts`; `formatRelative` de `src/lib/relative.ts`; `fill`; `t` (`ui.clear`, `tool.remember`); kit: `Field`, `Select`, `NumberInput`, `Display`, `CopyButton`, `Button`, `Toggle` y `persistedInput`.
- Produces:
  - `type FieldName`, `interface CronField { values; restricted }`, `type Cron`, `type CronError`, `type ParseResult`, `interface Run { ms; adjusted }`
  - `parseCron(input)`, `errorMessage(error, locale)`, `describeCron(parsed, locale)`, `resolveWallTime(y, mo, d, h, mi, timeZone): Run | null`, `nextRuns(cron, nowMs, timeZone, count): Run[]`
  - `meta: ToolMeta` (id `cron`, slugs `explicar-expresion-cron` / `cron-expression-explainer`), `strings: Record<Locale, …>` y el componente `Cron` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 14: `#cron-expr`, `#cron-expr-error`, `#cron-zone`, `#cron-count`, `.panel .explain` (la explicación) y `.panel .runs .iso` (el instante UTC de cada ejecución).

**§8.10 (vinculante):** `cron` · ref · sin pestañas. Expresión, zona horaria (`listTimeZones`/`isValidTimeZone`, por defecto la del navegador) y de 1 a 20 ejecuciones (5). Parser de 5 campos con listas, `*`, `*/n`, `a`, `a-b`, `a-b/n` y `a/n`, nombres `JAN–DEC` y `SUN–SAT` sin distinguir mayúsculas, 0 y 7 domingo, y las macros (`@reboot` sin ejecuciones). Errores: fuera de rango («El minuto 60 no existe: van de 0 a 59»), rango al revés («El rango 5-1 va hacia atrás: escribe 1-5»), paso 0, 6 o 7 campos (Quartz, Spring) y `?`, `L`, `W` o `#`. Regla de Vixie para día del mes y día de la semana (los dos restringidos → «o»). Explicación con plantillas propias y los cinco ejemplos exactos de la ficha en ES y EN. Próximas ejecuciones: desde el minuto siguiente, recorriendo días civiles hasta 5 años (día de la semana con `Date.UTC`) e instantes con `zonedToUtc`; hueco de marzo → primer minuto válido tras el salto con la marca «ajustada por el cambio de hora» y sin repetir instantes; hora repetida de octubre → una sola vez, la primera (probando `instante − 60` y `− 30` min); ninguna en 5 años → «Esta expresión no se ejecuta nunca (por ejemplo, el 30 de febrero)», y `0 0 29 2 *` encuentra 2028. Salida: explicación en `Display value` y lista con fecha y hora en la zona (`Intl`, estilo medio), relativa e ISO UTC copiable. Recordar ✓ expresión y zona.

Cómo se cubre cada punto:
- Parser: tests `parses lists, ranges, steps and names`, `treats 0 and 7 as Sunday`, `marks fields as restricted unless their text starts with *`, `expands macros and recognises @reboot` y `does not mistake month and day names for Quartz letters` (`JUL`, `WED`).
- Errores con el texto exacto: tests `out of range`, `ranges backwards`, `a step of 0`, `Quartz and Spring expressions` y `wrong number of fields, bad tokens and unknown macros`, en los dos idiomas.
- Explicación: test `matches the spec examples exactly, in both languages` (los cinco de la ficha), más `lists up to 6 times, and combines minute and hour phrases otherwise` y `describes months, weekend runs and the "and" day rule`. Las listas usan `Intl.ListFormat`; en inglés lleva coma de Oxford («09:00, 12:00, and 18:00»).
- Cambios de hora: Review Focus 2. Vectores comprobados con Node por separado: en Madrid, `2026-03-29T00:59Z` es `01:59 CET` y `01:00Z` es `03:00 CEST`; `00:30Z` y `01:30Z` del 2026-10-25 son las dos `02:30`.
- Próximas ejecuciones: tests `starts at the next minute in the chosen zone (e2e vector)` (el lunes 2026-09-28 a las 09:30 de Madrid es `07:30Z`), `never repeats the current minute`, `applies the day-of-month OR day-of-week rule`, `applies AND when one day field starts with *` y `finds 29 February in 2028 and nothing for 30 February`.
- Zona y reloj: `now` es `null` hasta el montaje (el reloj de la máquina de build nunca acaba en el HTML) y se refresca cada 30 s; la zona por defecto es la del navegador y se guarda con la expresión en `cron-zone`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l3-cron -b lote-3/cron   # desde el commit de la Task 0
cd ../devtools-l3-cron
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task (Field, Select, NumberInput, Display, CopyButton, Button, Toggle) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real y dilo en el commit.

- [ ] **Step 2: Test (falla)**

`src/tools/cron/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  describeCron,
  errorMessage,
  nextRuns,
  parseCron,
  resolveWallTime,
  type Cron,
} from './logic';

function cron(expr: string): Cron {
  const r = parseCron(expr);
  if (!r.ok || r.reboot) throw new Error(`not a schedule: ${expr}`);
  return r.cron;
}

function describe2(expr: string): [string, string] {
  const r = parseCron(expr);
  if (!r.ok) throw new Error(expr);
  return [describeCron(r, 'es'), describeCron(r, 'en')];
}

function error(expr: string, locale: 'es' | 'en' = 'es'): string {
  const r = parseCron(expr);
  if (r.ok) throw new Error(`should fail: ${expr}`);
  return errorMessage(r.error, locale);
}

const iso = (runs: { ms: number }[]) => runs.map((r) => new Date(r.ms).toISOString());

describe('parseCron', () => {
  it('parses lists, ranges, steps and names', () => {
    const c = cron('5/15 9-17/4 1,15 jan-MAR MON-FRI');
    expect(c.minute.values).toEqual([5, 20, 35, 50]);
    expect(c.hour.values).toEqual([9, 13, 17]);
    expect(c.dom.values).toEqual([1, 15]);
    expect(c.month.values).toEqual([1, 2, 3]);
    expect(c.dow.values).toEqual([1, 2, 3, 4, 5]);
  });

  it('treats 0 and 7 as Sunday', () => {
    expect(cron('0 0 * * 7').dow.values).toEqual([0]);
    expect(cron('0 0 * * 0-7').dow.values).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(cron('0 0 * * 5-7').dow.values).toEqual([0, 5, 6]);
  });

  it('marks fields as restricted unless their text starts with *', () => {
    const c = cron('0 0 */2 * 1');
    expect(c.dom.restricted).toBe(false);
    expect(c.dow.restricted).toBe(true);
  });

  it('expands macros and recognises @reboot', () => {
    expect(cron('@weekly')).toEqual(cron('0 0 * * 0'));
    expect(cron('@ANNUALLY')).toEqual(cron('0 0 1 1 *'));
    expect(cron('@midnight')).toEqual(cron('0 0 * * *'));
    expect(parseCron('@reboot')).toEqual({ ok: true, reboot: true });
  });

  it('does not mistake month and day names for Quartz letters', () => {
    expect(cron('0 0 * JUL WED').month.values).toEqual([7]);
  });
});

describe('errors say what is wrong and how to fix it', () => {
  it('out of range', () => {
    expect(error('60 * * * *')).toBe('El minuto 60 no existe: van de 0 a 59');
    expect(error('0 24 * * *')).toBe('La hora 24 no existe: van de 0 a 23');
    expect(error('0 0 32 * *', 'en')).toBe('Day 32 does not exist: they go from 1 to 31');
    expect(error('0 0 * 13 *')).toBe('El mes 13 no existe: van de 1 a 12');
    expect(error('0 0 * * 8')).toBe('El día de la semana 8 no existe: van de 0 a 7');
  });

  it('ranges backwards', () => {
    expect(error('0 0 * * 5-1')).toBe('El rango 5-1 va hacia atrás: escribe 1-5');
    expect(error('0 0 * * FRI-MON', 'en')).toBe('The range FRI-MON goes backwards: write MON-FRI');
  });

  it('a step of 0', () => {
    expect(error('*/0 * * * *')).toBe(
      'Un paso de 0 no avanza en el campo minuto: usa un número mayor que 0, como */5',
    );
  });

  it('Quartz and Spring expressions', () => {
    const fields =
      'Parece una expresión con segundos o años (Quartz, Spring). Aquí se usa el cron clásico de 5 campos';
    expect(error('0 0 12 * * ?')).toBe(fields);
    expect(error('0 0 12 * * ? 2026')).toBe(fields);
    const letters = 'L, W, # y ? son de Quartz y no los entiende el cron de Unix';
    expect(error('0 0 L * *')).toBe(letters);
    expect(error('0 0 15W * *')).toBe(letters);
    expect(error('0 0 * * MON#2')).toBe(letters);
    expect(error('0 0 ? * MON')).toBe(letters);
  });

  it('wrong number of fields, bad tokens and unknown macros', () => {
    expect(error('* * *')).toBe(
      'Tiene 3 campos y hacen falta 5: minuto, hora, día del mes, mes y día de la semana',
    );
    expect(error('0 0 * * lunes')).toBe(
      'No se entiende «lunes» en el campo día de la semana. Usa *, 5, 1-5, */15 o listas como 1,15',
    );
    expect(error('@often')).toBe(
      '@often no existe. Valen @yearly, @monthly, @weekly, @daily, @hourly y @reboot',
    );
    expect(parseCron('   ')).toEqual({ ok: false, error: { kind: 'empty' } });
  });
});

describe('describeCron', () => {
  it('matches the spec examples exactly, in both languages', () => {
    expect(describe2('* * * * *')).toEqual(['Cada minuto.', 'Every minute.']);
    expect(describe2('*/15 * * * *')).toEqual(['Cada 15 minutos.', 'Every 15 minutes.']);
    expect(describe2('30 9 * * 1-5')).toEqual([
      'A las 09:30, de lunes a viernes.',
      'At 09:30, Monday through Friday.',
    ]);
    expect(describe2('0 0 1 * *')).toEqual([
      'A las 00:00, el día 1 del mes.',
      'At 00:00, on day 1 of the month.',
    ]);
    expect(describe2('0 9 1 * 1')).toEqual([
      'A las 09:00, el día 1 del mes o los lunes.',
      'At 09:00, on day 1 of the month or on Mondays.',
    ]);
  });

  it('lists up to 6 times, and combines minute and hour phrases otherwise', () => {
    expect(describe2('0 9,12,18 * * *')).toEqual([
      'A las 09:00, 12:00 y 18:00.',
      'At 09:00, 12:00, and 18:00.',
    ]);
    expect(describe2('0 */2 * * *')[0]).toBe('En el minuto 0, cada 2 horas.');
    expect(describe2('*/10 9-17 * * 1-5')[0]).toBe(
      'Cada 10 minutos, entre las 09:00 y las 17:59, de lunes a viernes.',
    );
    expect(describe2('@hourly')).toEqual(['En el minuto 0.', 'At minute 0.']);
  });

  it('describes months, weekend runs and the "and" day rule', () => {
    expect(describe2('0 0 * 1,7 *')[0]).toBe('A las 00:00, en enero y julio.');
    expect(describe2('0 0 * 6-8 *')[1]).toBe('At 00:00, June through August.');
    expect(describe2('0 0 * * 5-7')[0]).toBe('A las 00:00, de viernes a domingo.');
    expect(describe2('0 0 * * 0,6')[1]).toBe('At 00:00, on Saturdays and Sundays.');
    expect(describe2('0 0 */2 * 1')[0]).toBe(
      'A las 00:00, cada 2 días del mes, pero solo los lunes.',
    );
    expect(describe2('@reboot')).toEqual(['Al arrancar el sistema.', 'At system startup.']);
  });
});

describe('resolveWallTime and DST (Europe/Madrid)', () => {
  it('maps a normal time to its instant', () => {
    expect(resolveWallTime(2026, 9, 28, 9, 30, 'Europe/Madrid')).toEqual({
      ms: Date.UTC(2026, 8, 28, 7, 30),
      adjusted: false,
    });
  });

  it('runs a time in the March gap at the first minute after the jump', () => {
    // 02:30 does not exist on 2026-03-29: clocks go from 02:00 to 03:00 (01:00Z).
    expect(resolveWallTime(2026, 3, 29, 2, 30, 'Europe/Madrid')).toEqual({
      ms: Date.UTC(2026, 2, 29, 1, 0),
      adjusted: true,
    });
  });

  it('runs a time in the repeated October hour once, at its first occurrence', () => {
    // 02:30 happens twice on 2026-10-25: 00:30Z (CEST) and 01:30Z (CET).
    expect(resolveWallTime(2026, 10, 25, 2, 30, 'Europe/Madrid')).toEqual({
      ms: Date.UTC(2026, 9, 25, 0, 30),
      adjusted: false,
    });
  });
});

describe('nextRuns', () => {
  it('starts at the next minute in the chosen zone (e2e vector)', () => {
    const runs = nextRuns(
      cron('30 9 * * 1-5'),
      Date.parse('2026-09-28T06:00:00Z'),
      'Europe/Madrid',
      5,
    );
    expect(iso(runs)).toEqual([
      '2026-09-28T07:30:00.000Z',
      '2026-09-29T07:30:00.000Z',
      '2026-09-30T07:30:00.000Z',
      '2026-10-01T07:30:00.000Z',
      '2026-10-02T07:30:00.000Z',
    ]);
  });

  it('never repeats the current minute', () => {
    const runs = nextRuns(cron('* * * * *'), Date.parse('2026-09-28T06:00:30Z'), 'UTC', 2);
    expect(iso(runs)).toEqual(['2026-09-28T06:01:00.000Z', '2026-09-28T06:02:00.000Z']);
  });

  it('shows the March gap once, marked as adjusted', () => {
    const runs = nextRuns(
      cron('0,30 2 * * *'),
      Date.parse('2026-03-28T12:00:00Z'),
      'Europe/Madrid',
      3,
    );
    expect(runs).toEqual([
      { ms: Date.UTC(2026, 2, 29, 1, 0), adjusted: true },
      { ms: Date.UTC(2026, 2, 30, 0, 0), adjusted: false },
      { ms: Date.UTC(2026, 2, 30, 0, 30), adjusted: false },
    ]);
  });

  it('runs once in the repeated October hour', () => {
    const runs = nextRuns(
      cron('30 2 * * *'),
      Date.parse('2026-10-24T12:00:00Z'),
      'Europe/Madrid',
      2,
    );
    expect(iso(runs)).toEqual(['2026-10-25T00:30:00.000Z', '2026-10-26T01:30:00.000Z']);
  });

  it('applies the day-of-month OR day-of-week rule', () => {
    const runs = nextRuns(cron('0 9 1 * 1'), Date.parse('2026-09-28T10:00:00Z'), 'UTC', 2);
    // 2026-10-01 is a Thursday (day 1), 2026-10-05 a Monday.
    expect(iso(runs)).toEqual(['2026-10-01T09:00:00.000Z', '2026-10-05T09:00:00.000Z']);
  });

  it('applies AND when one day field starts with *', () => {
    const runs = nextRuns(cron('0 0 */2 * 1'), Date.parse('2026-09-28T10:00:00Z'), 'UTC', 2);
    // Odd days that are Mondays: 2026-10-05 and 2026-10-19.
    expect(iso(runs)).toEqual(['2026-10-05T00:00:00.000Z', '2026-10-19T00:00:00.000Z']);
  });

  it('finds 29 February in 2028 and nothing for 30 February', () => {
    const now = Date.parse('2026-09-28T06:00:00Z');
    expect(iso(nextRuns(cron('0 0 29 2 *'), now, 'UTC', 1))).toEqual(['2028-02-29T00:00:00.000Z']);
    expect(nextRuns(cron('0 0 30 2 *'), now, 'UTC', 5)).toEqual([]);
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/cron`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/cron/logic.ts`**

`timestamp/logic.ts` no se toca: `zonedToUtc` devuelve la segunda aparición de una hora repetida, y es `resolveWallTime` quien busca la primera. Para el hueco de marzo, una búsqueda binaria por minutos encuentra el primer instante cuyo reloj local ya pasó la hora pedida (el salto). Los mensajes de error y las plantillas de la explicación viven aquí, con el idioma como parámetro, para poder testear el texto exacto.

```ts
import { wallClock, zonedToUtc } from '../timestamp/logic';
import type { Locale } from '../types';

export type FieldName = 'minute' | 'hour' | 'dom' | 'month' | 'dow';

export interface CronField {
  /** Sorted, without duplicates. Day of week uses 0–6 (7 is folded into 0, Sunday). */
  values: number[];
  /** Vixie cron: the field is "restricted" when its text does not start with `*`. */
  restricted: boolean;
}

export type Cron = Record<FieldName, CronField>;

export type CronError =
  | { kind: 'empty' }
  | { kind: 'fields'; count: number }
  | { kind: 'quartz-fields'; count: number }
  | { kind: 'quartz' }
  | { kind: 'syntax'; field: FieldName; text: string }
  | { kind: 'macro'; text: string }
  | { kind: 'range'; field: FieldName; value: number; min: number; max: number }
  | { kind: 'reversed'; field: FieldName; text: string; fixed: string }
  | { kind: 'step'; field: FieldName };

export type ParseResult =
  | { ok: true; reboot: false; cron: Cron }
  | { ok: true; reboot: true }
  | { ok: false; error: CronError };

export interface Run {
  ms: number;
  /** The wall-clock time did not exist (spring-forward gap) and it ran at the first minute after. */
  adjusted: boolean;
}

const FIELDS: FieldName[] = ['minute', 'hour', 'dom', 'month', 'dow'];
const LIMITS: Record<FieldName, [number, number]> = {
  minute: [0, 59],
  hour: [0, 23],
  dom: [1, 31],
  month: [1, 12],
  dow: [0, 7],
};
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const MACROS: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
};

class FieldError extends Error {
  constructor(readonly detail: CronError) {
    super(detail.kind);
  }
}

function toNumber(field: FieldName, token: string): number {
  const up = token.toUpperCase();
  if (field === 'month' && MONTHS.includes(up)) return MONTHS.indexOf(up) + 1;
  if (field === 'dow' && DAYS.includes(up)) return DAYS.indexOf(up);
  if (!/^\d+$/.test(token)) {
    // L, W, # and ? only exist in Quartz (and Spring) cron.
    if (/[?#]/.test(token) || /^(\d*L|L\d*|\d+W|LW)$/i.test(token)) {
      throw new FieldError({ kind: 'quartz' });
    }
    throw new FieldError({ kind: 'syntax', field, text: token });
  }
  const n = Number(token);
  const [min, max] = LIMITS[field];
  if (n < min || n > max) throw new FieldError({ kind: 'range', field, value: n, min, max });
  return n;
}

function parseField(field: FieldName, text: string): CronField {
  const [min, max] = LIMITS[field];
  const set = new Set<number>();
  for (const part of text.split(',')) {
    const [base, stepText, extra] = part.split('/');
    if (base === '' || extra !== undefined || stepText === '') {
      throw new FieldError({ kind: 'syntax', field, text: part });
    }
    let step = 1;
    if (stepText !== undefined) {
      if (!/^\d+$/.test(stepText)) throw new FieldError({ kind: 'syntax', field, text: part });
      step = Number(stepText);
      if (step === 0) throw new FieldError({ kind: 'step', field });
    }
    let from: number;
    let to: number;
    if (base === '*') {
      [from, to] = [min, max];
    } else if (base.includes('-')) {
      const [a, b, more] = base.split('-');
      if (more !== undefined || !a || !b)
        throw new FieldError({ kind: 'syntax', field, text: part });
      from = toNumber(field, a);
      to = toNumber(field, b);
      if (from > to) {
        throw new FieldError({ kind: 'reversed', field, text: base, fixed: `${b}-${a}` });
      }
    } else {
      from = toNumber(field, base);
      // "a/n" means "a-max/n"; a plain "a" is just that value.
      to = stepText === undefined ? from : max;
    }
    for (let v = from; v <= to; v += step) set.add(field === 'dow' && v === 7 ? 0 : v);
  }
  return { values: [...set].sort((a, b) => a - b), restricted: !text.startsWith('*') };
}

export function parseCron(input: string): ParseResult {
  let text = input.trim();
  if (!text) return { ok: false, error: { kind: 'empty' } };
  if (text.startsWith('@')) {
    const macro = text.toLowerCase();
    if (macro === '@reboot') return { ok: true, reboot: true };
    if (!(macro in MACROS)) return { ok: false, error: { kind: 'macro', text } };
    text = MACROS[macro];
  }
  const parts = text.split(/\s+/);
  if (parts.length === 6 || parts.length === 7) {
    return { ok: false, error: { kind: 'quartz-fields', count: parts.length } };
  }
  if (parts.length !== 5) return { ok: false, error: { kind: 'fields', count: parts.length } };
  try {
    const cron = Object.fromEntries(FIELDS.map((f, i) => [f, parseField(f, parts[i])])) as Cron;
    return { ok: true, reboot: false, cron };
  } catch (e) {
    if (e instanceof FieldError) return { ok: false, error: e.detail };
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Messages and description

const FIELD_NAMES: Record<Locale, Record<FieldName, string>> = {
  es: {
    minute: 'El minuto',
    hour: 'La hora',
    dom: 'El día',
    month: 'El mes',
    dow: 'El día de la semana',
  },
  en: {
    minute: 'Minute',
    hour: 'Hour',
    dom: 'Day',
    month: 'Month',
    dow: 'Day of week',
  },
};

const FIELD_LABELS: Record<Locale, Record<FieldName, string>> = {
  es: {
    minute: 'minuto',
    hour: 'hora',
    dom: 'día del mes',
    month: 'mes',
    dow: 'día de la semana',
  },
  en: {
    minute: 'minute',
    hour: 'hour',
    dom: 'day of month',
    month: 'month',
    dow: 'day of week',
  },
};

export function errorMessage(error: CronError, locale: Locale): string {
  const es = locale === 'es';
  switch (error.kind) {
    case 'empty':
      return es
        ? 'Escribe una expresión cron, por ejemplo */5 * * * *'
        : 'Type a cron expression, for example */5 * * * *';
    case 'fields':
      return es
        ? `Tiene ${error.count} campos y hacen falta 5: minuto, hora, día del mes, mes y día de la semana`
        : `It has ${error.count} fields and needs 5: minute, hour, day of month, month and day of week`;
    case 'quartz-fields':
      return es
        ? 'Parece una expresión con segundos o años (Quartz, Spring). Aquí se usa el cron clásico de 5 campos'
        : 'This looks like an expression with seconds or years (Quartz, Spring). This tool uses classic 5-field cron';
    case 'quartz':
      return es
        ? 'L, W, # y ? son de Quartz y no los entiende el cron de Unix'
        : 'L, W, # and ? belong to Quartz and Unix cron does not understand them';
    case 'macro':
      return es
        ? `${error.text} no existe. Valen @yearly, @monthly, @weekly, @daily, @hourly y @reboot`
        : `${error.text} does not exist. Use @yearly, @monthly, @weekly, @daily, @hourly or @reboot`;
    case 'syntax':
      return es
        ? `No se entiende «${error.text}» en el campo ${FIELD_LABELS.es[error.field]}. Usa *, 5, 1-5, */15 o listas como 1,15`
        : `“${error.text}” is not valid in the ${FIELD_LABELS.en[error.field]} field. Use *, 5, 1-5, */15 or lists such as 1,15`;
    case 'range':
      return es
        ? `${FIELD_NAMES.es[error.field]} ${error.value} no existe: van de ${error.min} a ${error.max}`
        : `${FIELD_NAMES.en[error.field]} ${error.value} does not exist: they go from ${error.min} to ${error.max}`;
    case 'reversed':
      return es
        ? `El rango ${error.text} va hacia atrás: escribe ${error.fixed}`
        : `The range ${error.text} goes backwards: write ${error.fixed}`;
    case 'step':
      return es
        ? `Un paso de 0 no avanza en el campo ${FIELD_LABELS.es[error.field]}: usa un número mayor que 0, como */5`
        : `A step of 0 never moves in the ${FIELD_LABELS.en[error.field]} field: use a number above 0, such as */5`;
  }
}

type Shape =
  | { kind: 'all' }
  | { kind: 'single'; value: number }
  | { kind: 'step'; step: number }
  | { kind: 'range'; from: number; to: number }
  | { kind: 'list'; values: number[] };

/** "Every", "every n" (a progression from the minimum to the end), a run of consecutive values or a list. */
function shape(values: number[], min: number, max: number): Shape {
  if (values.length === max - min + 1) return { kind: 'all' };
  if (values.length === 1) return { kind: 'single', value: values[0] };
  const step = values[1] - values[0];
  const progression = values.every((v, i) => v === values[0] + i * step);
  if (progression && values[0] === min && values[values.length - 1] + step > max && step > 1) {
    return { kind: 'step', step };
  }
  if (progression && step === 1 && values.length >= 3) {
    return { kind: 'range', from: values[0], to: values[values.length - 1] };
  }
  return { kind: 'list', values };
}

const pad = (n: number) => String(n).padStart(2, '0');

const MONTH_NAMES: Record<Locale, string[]> = {
  es: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
};
// Monday first, as people read a week.
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_ONE: Record<Locale, string[]> = {
  es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};
const DAY_MANY: Record<Locale, string[]> = {
  es: ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados'],
  en: ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'],
};

function list(items: (string | number)[], locale: Locale): string {
  return new Intl.ListFormat(locale, { type: 'conjunction' }).format(items.map(String));
}

function timePhrase(minute: CronField, hour: CronField, locale: Locale): string {
  const es = locale === 'es';
  const m = shape(minute.values, 0, 59);
  const h = shape(hour.values, 0, 23);
  if (m.kind === 'single' && h.kind !== 'all' && hour.values.length <= 6) {
    const times = hour.values.map((x) => `${pad(x)}:${pad(m.value)}`);
    return `${es ? 'a las' : 'at'} ${list(times, locale)}`;
  }
  let mp: string;
  if (m.kind === 'all') mp = es ? 'cada minuto' : 'every minute';
  else if (m.kind === 'step') mp = es ? `cada ${m.step} minutos` : `every ${m.step} minutes`;
  else if (m.kind === 'single') mp = es ? `en el minuto ${m.value}` : `at minute ${m.value}`;
  else if (m.kind === 'range')
    mp = es
      ? `cada minuto del ${m.from} al ${m.to}`
      : `every minute from ${m.from} through ${m.to}`;
  else
    mp = es ? `en los minutos ${list(m.values, locale)}` : `at minutes ${list(m.values, locale)}`;

  let hp = '';
  if (h.kind === 'step') hp = es ? `cada ${h.step} horas` : `every ${h.step} hours`;
  else if (h.kind === 'single')
    hp = es
      ? `entre las ${pad(h.value)}:00 y las ${pad(h.value)}:59`
      : `between ${pad(h.value)}:00 and ${pad(h.value)}:59`;
  else if (h.kind === 'range')
    hp = es
      ? `entre las ${pad(h.from)}:00 y las ${pad(h.to)}:59`
      : `between ${pad(h.from)}:00 and ${pad(h.to)}:59`;
  else if (h.kind === 'list')
    hp = es ? `en las horas ${list(h.values, locale)}` : `during hours ${list(h.values, locale)}`;
  return hp ? `${mp}, ${hp}` : mp;
}

function domPhrase(dom: CronField, locale: Locale): string {
  const es = locale === 'es';
  const d = shape(dom.values, 1, 31);
  if (d.kind === 'all') return '';
  if (d.kind === 'single')
    return es ? `el día ${d.value} del mes` : `on day ${d.value} of the month`;
  if (d.kind === 'step')
    return es ? `cada ${d.step} días del mes` : `every ${d.step} days of the month`;
  if (d.kind === 'range')
    return es
      ? `del día ${d.from} al ${d.to} del mes`
      : `on days ${d.from} through ${d.to} of the month`;
  return es
    ? `los días ${list(d.values, locale)} del mes`
    : `on days ${list(d.values, locale)} of the month`;
}

function dowPhrase(dow: CronField, locale: Locale): string {
  const es = locale === 'es';
  if (dow.values.length === 7) return '';
  const ordered = DAY_ORDER.filter((d) => dow.values.includes(d));
  const idx = ordered.map((d) => DAY_ORDER.indexOf(d));
  const consecutive = idx.every((v, i) => v === idx[0] + i);
  if (ordered.length >= 3 && consecutive) {
    const [a, b] = [DAY_ONE[locale][ordered[0]], DAY_ONE[locale][ordered[ordered.length - 1]]];
    return es ? `de ${a} a ${b}` : `${a} through ${b}`;
  }
  const names = list(
    ordered.map((d) => DAY_MANY[locale][d]),
    locale,
  );
  return es ? `los ${names}` : `on ${names}`;
}

function monthPhrase(month: CronField, locale: Locale): string {
  const es = locale === 'es';
  const m = shape(month.values, 1, 12);
  if (m.kind === 'all') return '';
  const name = (n: number) => MONTH_NAMES[locale][n - 1];
  if (m.kind === 'range')
    return es ? `de ${name(m.from)} a ${name(m.to)}` : `${name(m.from)} through ${name(m.to)}`;
  return `${es ? 'en' : 'in'} ${list(month.values.map(name), locale)}`;
}

/** "A las 09:30, de lunes a viernes." / "At 09:30, Monday through Friday." */
export function describeCron(parsed: ParseResult & { ok: true }, locale: Locale): string {
  if (parsed.reboot) return locale === 'es' ? 'Al arrancar el sistema.' : 'At system startup.';
  const { cron } = parsed;
  const dom = domPhrase(cron.dom, locale);
  const dow = dowPhrase(cron.dow, locale);
  let day = dom || dow;
  if (dom && dow) {
    // Vixie cron: two restricted day fields mean "either"; otherwise both must match.
    day =
      cron.dom.restricted && cron.dow.restricted
        ? `${dom} ${locale === 'es' ? 'o' : 'or'} ${dow}`
        : `${dom}, ${locale === 'es' ? 'pero solo' : 'but only'} ${dow}`;
  }
  const text = [timePhrase(cron.minute, cron.hour, locale), day, monthPhrase(cron.month, locale)]
    .filter(Boolean)
    .join(', ');
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

// ---------------------------------------------------------------------------
// Next runs

const MINUTE = 60_000;
const HORIZON_DAYS = 5 * 366;

function wallKey(y: number, mo: number, d: number, h: number, mi: number): string {
  return `${y}-${pad(mo)}-${pad(d)} ${pad(h)}:${pad(mi)}:00`;
}

/**
 * The instant for a wall-clock time in `timeZone`, with Vixie cron's rules for DST:
 * a time in the spring-forward gap runs at the first minute that exists after the jump,
 * and a time in the repeated autumn hour runs once, at its first occurrence.
 */
export function resolveWallTime(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  timeZone: string,
): Run | null {
  const inst = zonedToUtc(y, mo, d, h, mi, 0, 0, timeZone);
  if (inst === null) return null;
  const key = wallKey(y, mo, d, h, mi);
  if (wallClock(inst, timeZone) === key) {
    // zonedToUtc gives the second occurrence of a repeated time: look for an earlier one.
    for (const back of [60, 30]) {
      const earlier = inst - back * MINUTE;
      if (wallClock(earlier, timeZone) === key) return { ms: earlier, adjusted: false };
    }
    return { ms: inst, adjusted: false };
  }
  // The time does not exist: find the first minute whose wall clock is past it (the jump).
  let lo = inst - 4 * 60 * MINUTE;
  let hi = inst;
  while (hi - lo > MINUTE) {
    const mid = lo + Math.floor((hi - lo) / MINUTE / 2) * MINUTE;
    if (wallClock(mid, timeZone) > key) hi = mid;
    else lo = mid;
  }
  return { ms: hi, adjusted: true };
}

function dayMatches(cron: Cron, mo: number, d: number, weekday: number): boolean {
  if (!cron.month.values.includes(mo)) return false;
  const domOk = cron.dom.values.includes(d);
  const dowOk = cron.dow.values.includes(weekday);
  return cron.dom.restricted && cron.dow.restricted ? domOk || dowOk : domOk && dowOk;
}

/** The next `count` runs strictly after the minute of `nowMs`, looking up to 5 years ahead. */
export function nextRuns(cron: Cron, nowMs: number, timeZone: string, count: number): Run[] {
  const start = Math.floor(nowMs / MINUTE) * MINUTE + MINUTE;
  const [date, time] = wallClock(nowMs, timeZone).split(' ');
  const [y0, mo0, d0] = date.split('-').map(Number);
  const [h0, mi0] = time.split(':').map(Number);
  const runs: Run[] = [];
  const seen = new Set<number>();
  for (let k = 0; k <= HORIZON_DAYS && runs.length < count; k++) {
    // Civil dates and weekdays come from Date.UTC, so they never depend on the zone.
    const day = new Date(Date.UTC(y0, mo0 - 1, d0 + k));
    const y = day.getUTCFullYear();
    const mo = day.getUTCMonth() + 1;
    const d = day.getUTCDate();
    if (!dayMatches(cron, mo, d, day.getUTCDay())) continue;
    for (const h of cron.hour.values) {
      // Today, skip hours well before now (an hour of margin covers DST shifts).
      if (k === 0 && h < h0 - 1) continue;
      for (const mi of cron.minute.values) {
        if (k === 0 && h * 60 + mi < h0 * 60 + mi0 - 60) continue;
        const run = resolveWallTime(y, mo, d, h, mi, timeZone);
        if (!run || run.ms < start || seen.has(run.ms)) continue;
        seen.add(run.ms);
        runs.push(run);
      }
    }
  }
  return runs.sort((a, b) => a.ms - b.ms).slice(0, count);
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/cron`
Expected: PASS (23 tests).

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/cron/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'cron',
  category: 'ref',
  icon: 'calendar-clock',
  slug: { es: 'explicar-expresion-cron', en: 'cron-expression-explainer' },
  name: { es: 'Cron', en: 'Cron' },
  title: {
    es: 'Explicar expresiones cron y ver próximas ejecuciones',
    en: 'Cron expression explainer with next run times',
  },
  description: {
    es: 'Traduce una expresión cron a palabras y calcula sus próximas ejecuciones en tu zona horaria, con los cambios de hora resueltos como en cron de Unix.',
    en: 'Turn a cron expression into plain words and list its next run times in your time zone, with daylight saving changes handled like Unix cron.',
  },
  keywords: {
    es: [
      'cron',
      'expresion cron',
      'crontab',
      'explicar cron',
      'proxima ejecucion cron',
      'cron cada 5 minutos',
    ],
    en: [
      'cron expression',
      'crontab',
      'cron explainer',
      'cron next run',
      'cron schedule',
      'cron every 5 minutes',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Qué pasa si pongo día del mes y día de la semana a la vez?',
        a: 'En el cron de Unix, si los dos campos tienen un valor (no empiezan por *), basta con que se cumpla uno: «0 9 1 * 1» se ejecuta el día 1 de cada mes y además todos los lunes.',
      },
      {
        q: '¿Qué hace cron con el cambio de hora?',
        a: 'Si la hora no existe (la noche de marzo en que se adelanta el reloj), se ejecuta en el primer minuto que sí existe. Si se repite (en octubre), se ejecuta una sola vez, la primera.',
      },
      {
        q: '¿Sirve para Quartz, Spring o AWS?',
        a: 'No. Esos formatos añaden segundos o años y símbolos como L, W o #. Aquí se usa el cron clásico de 5 campos de Linux y de la mayoría de servicios.',
      },
    ],
    en: [
      {
        q: 'What if I set both day of month and day of week?',
        a: 'In Unix cron, when both fields have a value (neither starts with *), either one is enough: “0 9 1 * 1” runs on day 1 of every month and also every Monday.',
      },
      {
        q: 'What does cron do when the clocks change?',
        a: 'If the time does not exist (the spring night the clock jumps forward), it runs at the first minute that does. If it happens twice (in autumn), it runs once, the first time.',
      },
      {
        q: 'Does it work for Quartz, Spring or AWS?',
        a: 'No. Those formats add seconds or years and symbols such as L, W or #. This tool uses the classic 5-field cron of Linux and most services.',
      },
    ],
  },
};
```

`src/tools/cron/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    expression: 'Expresión cron',
    placeholder: '*/15 9-18 * * 1-5',
    help: 'minuto · hora · día del mes · mes · día de la semana',
    zone: 'Zona horaria',
    count: 'Ejecuciones',
    explanation: 'Qué significa',
    empty: 'Escribe una expresión de 5 campos, por ejemplo 30 9 * * 1-5.',
    next: 'Próximas ejecuciones',
    never: 'Esta expresión no se ejecuta nunca (por ejemplo, el 30 de febrero).',
    reboot: 'Se ejecuta una vez al arrancar el sistema, así que no tiene próximas ejecuciones.',
    adjusted: 'ajustada por el cambio de hora',
    copyIso: 'Copiar',
    copyIsoOf: 'Copiar {iso}',
    copyText: 'Copiar explicación',
    examples: 'Ejemplos',
  },
  en: {
    expression: 'Cron expression',
    placeholder: '*/15 9-18 * * 1-5',
    help: 'minute · hour · day of month · month · day of week',
    zone: 'Time zone',
    count: 'Runs',
    explanation: 'What it means',
    empty: 'Type a 5-field expression, for example 30 9 * * 1-5.',
    next: 'Next runs',
    never: 'This expression never runs (for example, on 30 February).',
    reboot: 'It runs once when the system starts, so it has no next runs.',
    adjusted: 'moved by the clock change',
    copyIso: 'Copy',
    copyIsoOf: 'Copy {iso}',
    copyText: 'Copy explanation',
    examples: 'Examples',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/cron/content.es.md`:
```md
## Cómo funciona

Una expresión cron tiene cinco campos separados por espacios: **minuto** (0–59), **hora** (0–23), **día del mes** (1–31), **mes** (1–12 o `JAN`–`DEC`) y **día de la semana** (0–7, donde 0 y 7 son domingo, o `SUN`–`SAT`). Cada campo admite `*` (todos), un valor (`5`), un rango (`1-5`), una lista (`1,15`) y pasos (`*/15`, `0-30/10`). También valen los atajos `@hourly`, `@daily`, `@weekly`, `@monthly`, `@yearly` y `@reboot`.

La herramienta explica la expresión en palabras y calcula las próximas ejecuciones en la zona horaria que elijas, con la fecha local, cuánto falta y la hora exacta en UTC para copiarla.

## Día del mes, día de la semana y cambios de hora

Si los campos de día del mes y de día de la semana tienen los dos un valor, cron ejecuta la tarea cuando se cumple **cualquiera** de ellos: `0 9 1 * 1` corre el día 1 y además cada lunes. En los cambios de hora se sigue la regla de Vixie cron, el de casi todas las distribuciones de Linux: una hora que no existe se ejecuta en el primer minuto válido tras el salto, y una hora que se repite, solo la primera vez.
```

`src/tools/cron/content.en.md`:
```md
## How it works

A cron expression has five space-separated fields: **minute** (0–59), **hour** (0–23), **day of month** (1–31), **month** (1–12 or `JAN`–`DEC`) and **day of week** (0–7, where 0 and 7 are Sunday, or `SUN`–`SAT`). Each field accepts `*` (every value), a value (`5`), a range (`1-5`), a list (`1,15`) and steps (`*/15`, `0-30/10`). The shortcuts `@hourly`, `@daily`, `@weekly`, `@monthly`, `@yearly` and `@reboot` work too.

The tool explains the expression in words and works out the next run times in the time zone you pick, with the local date, how long until each run and the exact UTC time to copy.

## Day of month, day of week and clock changes

When both the day-of-month and day-of-week fields have a value, cron runs the job when **either** matches: `0 9 1 * 1` runs on day 1 and also every Monday. Clock changes follow Vixie cron, the one in almost every Linux distribution: a time that does not exist runs at the first valid minute after the jump, and a time that happens twice runs only the first time.
```

- [ ] **Step 8: `src/tools/cron/Cron.svelte`**

Los ejemplos son chips propios: 36 px de alto y 44 px con `pointer: coarse`. La lista de ejecuciones usa `.display-rows`; cada ISO lleva su «Copiar» compacto con `ariaLabel` propio.

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
  import NumberInput from '../../ui/NumberInput.svelte';
  import Select from '../../ui/Select.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import { isValidTimeZone, listTimeZones } from '../timestamp/logic';
  import type { Locale } from '../types';
  import { describeCron, errorMessage, nextRuns, parseCron } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const expr = persistedInput('cron', '', remember);
  const zone = persistedInput('cron-zone', '', remember);

  const EXAMPLES = ['*/5 * * * *', '0 9 * * 1-5', '30 2 * * *', '0 0 1 * *', '@weekly'];

  let zones = $state<string[]>(['UTC']);
  let count = $state(5);
  // null until mounted: the build machine's clock must never end up in the HTML.
  let now = $state<number | null>(null);

  onMount(() => {
    // persistedInput restores the saved zone in its own onMount, which runs before this one.
    const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    if (!zone.value || !isValidTimeZone(zone.value)) zone.value = browserZone;
    zones = listTimeZones(zone.value);
    now = Date.now();
    const id = setInterval(() => (now = Date.now()), 30_000);
    return () => clearInterval(id);
  });

  const parsed = $derived(expr.value.trim() ? parseCron(expr.value) : null);
  const explanation = $derived(parsed?.ok ? describeCron(parsed, locale) : '');
  const limit = $derived(Math.min(20, Math.max(1, Math.round(count) || 5)));
  const runs = $derived(
    parsed?.ok && !parsed.reboot && now !== null && isValidTimeZone(zone.value)
      ? nextRuns(parsed.cron, now, zone.value, limit)
      : [],
  );
  const dateFormat = $derived(
    isValidTimeZone(zone.value)
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: zone.value,
        })
      : null,
  );
</script>

<div class="panel">
  <Field
    id="cron-expr"
    label={s.expression}
    help={s.help}
    error={parsed && !parsed.ok ? errorMessage(parsed.error, locale) : undefined}
  >
    {#snippet children({ describedby })}
      <input
        id="cron-expr"
        class="control mono"
        bind:value={expr.value}
        placeholder={s.placeholder}
        aria-describedby={describedby}
        aria-invalid={!!parsed && !parsed.ok}
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
      />
    {/snippet}
  </Field>

  <div class="examples" role="group" aria-label={s.examples}>
    {#each EXAMPLES as ex (ex)}
      <button type="button" class="chip" onclick={() => (expr.value = ex)}>{ex}</button>
    {/each}
  </div>

  <div class="row">
    <Field id="cron-zone" label={s.zone}>
      {#snippet children({ describedby })}
        <Select
          id="cron-zone"
          bind:value={zone.value}
          {describedby}
          options={zones.map((z) => ({ value: z, label: z }))}
        />
      {/snippet}
    </Field>
    <Field id="cron-count" label={s.count}>
      {#snippet children({ describedby })}
        <NumberInput id="cron-count" bind:value={count} min={1} max={20} {describedby} />
      {/snippet}
    </Field>
  </div>

  <Display live label={s.explanation}>
    {#snippet head()}
      <span>{s.explanation}</span>
    {/snippet}
    {#if explanation}
      <p class="display-value explain">{explanation}</p>
    {:else}
      <p class="display-note">{s.empty}</p>
    {/if}
  </Display>

  {#if parsed?.ok}
    <Display label={s.next}>
      {#snippet head()}
        <span>{s.next}</span>
        <span>{zone.value}</span>
      {/snippet}
      {#if parsed.reboot}
        <p class="display-note">{s.reboot}</p>
      {:else if now !== null && runs.length === 0}
        <p class="display-note">{s.never}</p>
      {:else}
        <ol class="display-rows runs">
          {#each runs as run (run.ms)}
            {@const isoText = new Date(run.ms).toISOString()}
            <li class="display-row">
              <span class="when">
                <span>{dateFormat?.format(run.ms)}</span>
                <span class="meta">
                  {now === null ? '' : formatRelative(run.ms, now, locale)}
                  {#if run.adjusted}· {s.adjusted}{/if}
                </span>
                <span class="meta iso">{isoText}</span>
              </span>
              <CopyButton
                value={isoText}
                {locale}
                compact
                label={s.copyIso}
                ariaLabel={fill(s.copyIsoOf, { iso: isoText })}
              />
            </li>
          {/each}
        </ol>
      {/if}
    </Display>
  {/if}

  <div class="row">
    <CopyButton main value={explanation} {locale} label={s.copyText} />
    <Button variant="ghost" disabled={!expr.value} onclick={() => (expr.value = '')}
      >{t(locale, 'ui.clear')}</Button
    >
  </div>
  <Toggle
    bind:checked={
      () => expr.remember,
      (v) => {
        expr.remember = v;
        zone.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .explain {
    font-family: var(--font-body);
    font-size: clamp(18px, 2.4vw, 24px);
    letter-spacing: 0;
  }
  .examples {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    min-height: 36px;
    padding: 0 12px;
    background: var(--raised);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    font: 500 13px/1 var(--font-mono);
    cursor: pointer;
  }
  .chip:hover {
    border-color: var(--border-strong);
  }
  @media (pointer: coarse) {
    .chip {
      min-height: 44px;
    }
  }
  .runs {
    list-style: none;
    padding: 0;
  }
  .when {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .meta {
    font-size: 12.5px;
    letter-spacing: 0;
    color: var(--disp-dim);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as cron } from './cron/meta';
```
→
```ts
import { meta as cron } from './cron/meta';
```
y
```ts
  // cron,
```
→
```ts
  cron,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Cron from '../tools/cron/Cron.svelte';
```
→
```astro
import Cron from '../tools/cron/Cron.svelte';
```
y
```astro
{/* {id === 'cron' && <Cron client:load locale={locale} />} */}
```
→
```astro
{id === 'cron' && <Cron client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/explicar-expresion-cron.html dist/en/cron-expression-explainer.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `cron` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador (desechable, puerto 4680)**

Crea `.check-cron.mjs` en la raíz del worktree:
```js
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4680';
const browser = await chromium.launch();
// A zone other than Madrid, to prove the select (not the browser zone) drives the runs.
const page = await browser.newPage({ locale: 'es-ES', timezoneId: 'America/New_York' });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.clock.setFixedTime(new Date('2026-09-28T06:00:00Z'));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));

await page.goto(`${BASE}/es/explicar-expresion-cron`);
assert.equal(await page.locator('#cron-zone').inputValue(), 'America/New_York');
await page.locator('#cron-zone').selectOption('Europe/Madrid');
await page.locator('#cron-expr').fill('30 9 * * 1-5');
assert.equal(await page.locator('.explain').innerText(), 'A las 09:30, de lunes a viernes.');
assert.deepEqual((await page.locator('.runs .iso').allInnerTexts()).slice(0, 2), [
  '2026-09-28T07:30:00.000Z',
  '2026-09-29T07:30:00.000Z',
]);

await page.locator('#cron-expr').fill('60 * * * *');
assert.equal(await page.locator('#cron-expr-error').innerText(), 'El minuto 60 no existe: van de 0 a 59');
await page.getByRole('button', { name: '@weekly' }).click();
assert.equal(await page.locator('.explain').innerText(), 'A las 00:00, los domingos.');

await browser.close();
assert.deepEqual(errors, []);
console.log('OK cron');
```

Run:
```bash
./node_modules/.bin/astro preview --port 4680 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
until curl -sf -o /dev/null http://localhost:4680/es; do sleep 0.5; done
node .check-cron.mjs
kill $PREVIEW
rm .check-cron.mjs
```
Expected: la última línea es `OK cron` y no hay ningún error de página. Si falla un paso, arregla el componente, no la comprobación.

A mano, con `pnpm preview`, en `/es/explicar-expresion-cron` y `/en/cron-expression-explainer`, primero en el tema claro y luego en oscuro y terminal, a 390 px y a 1280 px de ancho:
1. `30 9 * * 1-5` con Europe/Madrid → «A las 09:30, de lunes a viernes.» y cinco ejecuciones entre semana, cada una con su hora local, «dentro de …» y su ISO.
2. `30 2 * * *` en marzo (o con el reloj del sistema cerca del 29) → la del domingo del cambio sale a las 03:00 con «ajustada por el cambio de hora».
3. `60 * * * *`, `0 0 * * 5-1`, `0 0 12 * * ?` y `0 0 L * *` → los cuatro mensajes de error de la ficha bajo el campo.
4. `0 0 30 2 *` → «Esta expresión no se ejecuta nunca…»; `@reboot` → explicación y «no tiene próximas ejecuciones».
5. Cambia la zona a UTC y recarga: expresión y zona siguen. Los chips de ejemplo rellenan el campo.

- [ ] **Step 12: Commit**

```bash
git add src/tools/cron src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (tampoco `.check-cron.mjs`, que ya se borró). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(cron): explicar expresiones cron y calcular las próximas ejecuciones"
```

---

### Task 11: User-Agent: `ua-parser-js` 1.x, bots y Client Hints de este navegador

**Files:**
- Create: `src/tools/user-agent/logic.ts`, `src/tools/user-agent/logic.test.ts`, `src/tools/user-agent/meta.ts`, `src/tools/user-agent/strings.ts`, `src/tools/user-agent/content.es.md`, `src/tools/user-agent/content.en.md`, `src/tools/user-agent/UserAgent.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `ua-parser-js` 1.x (Task 0); `t` (`led.idle`, `ui.clear`, `tool.remember`); kit: `Field`, `TextArea`, `Display`, `Led`, `CopyButton`, `Button`, `Toggle` y `persistedInput`.
- Produces:
  - `type DeviceType`, `interface UaInfo { browser; engine; os; vendor; model; deviceType; deviceKnown; cpu; bot; recognised }`, `interface Brand { brand; version }`
  - `parseUserAgent(ua): UaInfo | null` (envuelve `new UAParser(ua).getResult()`), `formatBrands(brands)`
  - `meta: ToolMeta` (id `user-agent`, slugs `analizar-user-agent` / `user-agent-parser`), `strings: Record<Locale, …>` y el componente `UserAgent` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 14: `#user-agent-input`, la primera `.panel .display-kv` (navegador, motor, sistema, dispositivo y CPU) y el botón «Usar el de este navegador».

**§8.11 (vinculante):** `user-agent` · ref · sin pestañas. Un `TextArea`; vacío al montar → `navigator.userAgent`, y «Usar el de este navegador» lo repone. `parseUserAgent` envuelve `new UAParser(ua).getResult()` de `ua-parser-js` **1.x**. `Display kv`: navegador y versión, motor, sistema y versión, dispositivo (fabricante, modelo y tipo; sin tipo → «Escritorio (probable)») y CPU; «Parece un bot» con `/bot|crawler|spider|crawling|slurp|mediapartners/i`; con el UA de este navegador y `navigator.userAgentData`, sus Client Hints de baja entropía (marcas, plataforma y móvil). Nota fija sobre el User-Agent congelado desde 2021. Recordar ✓. Texto que no es un UA → «—» y «No se ha reconocido ningún navegador»; 2 KB sin problema. El test de `logic.test.ts` lee la versión instalada y falla si no empieza por `1.`.

Cómo se cubre cada punto:
- Licencia: Review Focus 3, test `is the MIT-licensed 1.x line, never the AGPL 2.x`. Importa `ua-parser-js/package.json` (la 1.x no tiene campo `exports`, así que se puede; `resolveJsonModule` ya está activo en la config de Astro) y comprueba versión y licencia del paquete **instalado**.
- Análisis: tests `reads Firefox on Windows` (el UA del e2e, con todos los campos), `reads phones with vendor, model and type`, `flags bots`, `says when nothing was recognised` y `copes with a 2 KB User-Agent`.
- Entrada vacía: test `returns null for empty input`. Importa porque, en el navegador, `new UAParser('')` analiza el UA del propio navegador en vez de devolver nada.
- Client Hints: `formatBrands` quita las marcas señuelo («Not;A=Brand»); test `drops the GREASE "Not A Brand" entries`. El componente solo las muestra si el texto es exactamente `navigator.userAgent`.
- Nota fija del UA congelado siempre visible bajo la pantalla.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l3-user-agent -b lote-3/user-agent   # desde el commit de la Task 0
cd ../devtools-l3-user-agent
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task (Field, TextArea, Display, Led, CopyButton, Button, Toggle) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real y dilo en el commit.

- [ ] **Step 2: Test (falla)**

`src/tools/user-agent/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
// Read from the installed package itself, not from our package.json range.
import pkg from 'ua-parser-js/package.json';
import { formatBrands, parseUserAgent } from './logic';

const FIREFOX_WIN =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0';
const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const PIXEL =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36';
const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

describe('ua-parser-js licence guard', () => {
  it('is the MIT-licensed 1.x line, never the AGPL 2.x', () => {
    expect(pkg.version).toMatch(/^1\./);
    expect(pkg.license).toBe('MIT');
  });
});

describe('parseUserAgent', () => {
  it('reads Firefox on Windows', () => {
    expect(parseUserAgent(FIREFOX_WIN)).toEqual({
      browser: 'Firefox 128.0',
      engine: 'Gecko 128.0',
      os: 'Windows 10',
      vendor: null,
      model: null,
      deviceType: 'desktop',
      deviceKnown: false,
      cpu: 'amd64',
      bot: false,
      recognised: true,
    });
  });

  it('reads phones with vendor, model and type', () => {
    expect(parseUserAgent(IPHONE)).toMatchObject({
      browser: 'Mobile Safari 17.5',
      engine: 'WebKit 605.1.15',
      os: 'iOS 17.5',
      vendor: 'Apple',
      model: 'iPhone',
      deviceType: 'mobile',
      deviceKnown: true,
    });
    expect(parseUserAgent(PIXEL)).toMatchObject({
      browser: 'Chrome 128.0.0.0',
      engine: 'Blink 128.0.0.0',
      os: 'Android 14',
      vendor: 'Google',
      model: 'Pixel 8',
    });
  });

  it('flags bots', () => {
    expect(parseUserAgent(GOOGLEBOT)).toMatchObject({ bot: true, recognised: false });
  });

  it('says when nothing was recognised', () => {
    expect(parseUserAgent('hola que tal')).toMatchObject({
      browser: null,
      engine: null,
      os: null,
      recognised: false,
    });
  });

  it('returns null for empty input', () => {
    expect(parseUserAgent('   ')).toBeNull();
  });

  it('copes with a 2 KB User-Agent', () => {
    expect(parseUserAgent(FIREFOX_WIN + ' x'.repeat(1000))).toMatchObject({
      browser: 'Firefox 128.0',
    });
  });
});

describe('formatBrands', () => {
  it('drops the GREASE "Not A Brand" entries', () => {
    expect(
      formatBrands([
        { brand: 'Chromium', version: '128' },
        { brand: 'Not;A=Brand', version: '24' },
        { brand: 'Google Chrome', version: '128' },
      ]),
    ).toBe('Chromium 128, Google Chrome 128');
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/user-agent`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/user-agent/logic.ts`**

`ua-parser-js` se importa aquí y solo aquí, como paquete por defecto (su 1.x es UMD y los tipos de `@types/ua-parser-js` lo declaran con `export =`). No se llama con texto vacío.

```ts
import UAParser from 'ua-parser-js';

export type DeviceType =
  'console' | 'mobile' | 'smarttv' | 'tablet' | 'wearable' | 'embedded' | 'desktop';

export interface UaInfo {
  browser: string | null;
  engine: string | null;
  os: string | null;
  vendor: string | null;
  model: string | null;
  /** 'desktop' when the parser found no device type: most desktop browsers do not say it. */
  deviceType: DeviceType;
  /** False when the device type is only a guess (no type in the User-Agent). */
  deviceKnown: boolean;
  cpu: string | null;
  bot: boolean;
  /** False when not even a browser, engine or OS was recognised. */
  recognised: boolean;
}

export interface Brand {
  brand: string;
  version: string;
}

const BOT = /bot|crawler|spider|crawling|slurp|mediapartners/i;
const DEVICE_TYPES = ['console', 'mobile', 'smarttv', 'tablet', 'wearable', 'embedded'];

function join(...parts: (string | undefined)[]): string | null {
  const s = parts.filter(Boolean).join(' ');
  return s || null;
}

/** Returns null for an empty input: in a browser, ua-parser-js would parse the browser's own UA. */
export function parseUserAgent(ua: string): UaInfo | null {
  const text = ua.trim();
  if (!text) return null;
  const r = new UAParser(text).getResult();
  const type = r.device.type;
  const known = !!type && DEVICE_TYPES.includes(type);
  const info: UaInfo = {
    browser: join(r.browser.name, r.browser.version),
    engine: join(r.engine.name, r.engine.version),
    os: join(r.os.name, r.os.version),
    vendor: r.device.vendor ?? null,
    model: r.device.model ?? null,
    deviceType: known ? (type as DeviceType) : 'desktop',
    deviceKnown: known,
    cpu: r.cpu.architecture ?? null,
    bot: BOT.test(text),
    recognised: false,
  };
  info.recognised = !!(info.browser || info.engine || info.os);
  return info;
}

/** Client Hints brands without the random "Not A Brand" entries browsers add on purpose. */
export function formatBrands(brands: readonly Brand[]): string {
  return brands
    .filter((b) => !/not.?a.?brand/i.test(b.brand))
    .map((b) => `${b.brand} ${b.version}`)
    .join(', ');
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/user-agent`
Expected: PASS (8 tests).

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/user-agent/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'user-agent',
  category: 'ref',
  icon: 'monitor-smartphone',
  slug: { es: 'analizar-user-agent', en: 'user-agent-parser' },
  name: { es: 'User-Agent', en: 'User-Agent' },
  title: {
    es: 'Analizar User-Agent: navegador, sistema y dispositivo',
    en: 'User-Agent parser: browser, OS and device',
  },
  description: {
    es: 'Pega un User-Agent y mira qué navegador, motor, sistema operativo, dispositivo y CPU indica, si parece un bot y las Client Hints de tu navegador.',
    en: 'Paste a User-Agent and see the browser, engine, operating system, device and CPU it reports, whether it looks like a bot, and your Client Hints.',
  },
  keywords: {
    es: [
      'user agent',
      'analizar user agent',
      'mi user agent',
      'detectar navegador',
      'client hints',
      'que navegador tengo',
    ],
    en: [
      'user agent parser',
      'what is my user agent',
      'user agent string',
      'detect browser',
      'client hints',
      'ua parser',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Por qué mi versión de Windows o de Android sale mal?',
        a: 'Desde 2021, Chrome y otros navegadores congelan parte del User-Agent: Windows 11 aparece como Windows 10 y Android como 10 en un modelo genérico. Para datos exactos hacen falta las Client Hints de alta entropía, que la web tiene que pedir.',
      },
      {
        q: '¿Se puede fiar uno del User-Agent?',
        a: 'Sirve para estadísticas y soporte, no para seguridad: cualquiera puede cambiarlo. Para decidir qué funciones usar, es mejor comprobar si el navegador las soporta.',
      },
    ],
    en: [
      {
        q: 'Why is my Windows or Android version wrong?',
        a: 'Since 2021 Chrome and other browsers freeze part of the User-Agent: Windows 11 shows up as Windows 10 and Android as 10 on a generic model. Exact data needs the high-entropy Client Hints, which the site has to request.',
      },
      {
        q: 'Can you trust the User-Agent?',
        a: 'It is fine for statistics and support, not for security: anyone can change it. To decide which features to use, check whether the browser supports them.',
      },
    ],
  },
};
```

`src/tools/user-agent/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    input: 'User-Agent',
    placeholder: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
    useMine: 'Usar el de este navegador',
    result: 'Análisis',
    browser: 'Navegador',
    engine: 'Motor',
    os: 'Sistema',
    device: 'Dispositivo',
    cpu: 'CPU',
    desktop: 'Escritorio (probable)',
    console: 'Consola',
    mobile: 'Móvil',
    smarttv: 'Smart TV',
    tablet: 'Tableta',
    wearable: 'Dispositivo ponible',
    embedded: 'Dispositivo integrado',
    bot: 'Parece un bot o un rastreador',
    notRecognised: 'No se ha reconocido ningún navegador',
    recognised: 'Reconocido',
    empty: 'Pega un User-Agent o usa el de este navegador.',
    hints: 'Client Hints de este navegador',
    brands: 'Marcas',
    platform: 'Plataforma',
    isMobile: 'Móvil',
    yes: 'Sí',
    no: 'No',
    frozen:
      'Desde 2021, Chrome y otros navegadores congelan parte del User-Agent (la versión menor y la del sistema). Para datos precisos hacen falta las Client Hints.',
    copyReport: 'Copiar análisis',
  },
  en: {
    input: 'User-Agent',
    placeholder: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
    useMine: 'Use this browser’s',
    result: 'Analysis',
    browser: 'Browser',
    engine: 'Engine',
    os: 'OS',
    device: 'Device',
    cpu: 'CPU',
    desktop: 'Desktop (likely)',
    console: 'Console',
    mobile: 'Mobile',
    smarttv: 'Smart TV',
    tablet: 'Tablet',
    wearable: 'Wearable',
    embedded: 'Embedded device',
    bot: 'Looks like a bot or crawler',
    notRecognised: 'No browser was recognised',
    recognised: 'Recognised',
    empty: 'Paste a User-Agent or use this browser’s.',
    hints: 'This browser’s Client Hints',
    brands: 'Brands',
    platform: 'Platform',
    isMobile: 'Mobile',
    yes: 'Yes',
    no: 'No',
    frozen:
      'Since 2021 Chrome and other browsers freeze part of the User-Agent (the minor version and the OS version). Precise data needs Client Hints.',
    copyReport: 'Copy analysis',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/user-agent/content.es.md`:
```md
## Cómo funciona

El User-Agent es el texto con el que el navegador se presenta en cada petición: `Mozilla/5.0 (Windows NT 10.0; …) Firefox/128.0`. Al abrir la herramienta se rellena con el de tu navegador; también puedes pegar uno de un registro del servidor o de una incidencia. Se analiza con `ua-parser-js`, una base de patrones que se actualiza a menudo, y verás el navegador y su versión, el motor, el sistema operativo, el dispositivo (fabricante, modelo y tipo) y la arquitectura de la CPU.

Si el texto contiene palabras como `bot`, `crawler` o `spider`, se avisa de que parece un rastreador. Los navegadores de escritorio no suelen indicar el tipo de dispositivo, así que en ese caso se muestra «Escritorio (probable)».

## User-Agent congelado y Client Hints

Desde 2021, Chrome, Edge y otros navegadores basados en Chromium congelan parte del User-Agent para reducir el rastreo: la versión menor sale siempre a cero y Windows 11 aparece como Windows 10. La información precisa se pide aparte con las **Client Hints**. Cuando analizas el User-Agent de tu propio navegador, la herramienta añade las de baja entropía: las marcas, la plataforma y si es un móvil.
```

`src/tools/user-agent/content.en.md`:
```md
## How it works

The User-Agent is the text a browser introduces itself with on every request: `Mozilla/5.0 (Windows NT 10.0; …) Firefox/128.0`. When the tool opens it is filled with your browser's own; you can also paste one from a server log or a bug report. It is parsed with `ua-parser-js`, a pattern database that is updated often, and you get the browser and its version, the engine, the operating system, the device (vendor, model and type) and the CPU architecture.

If the text contains words such as `bot`, `crawler` or `spider`, you are told it looks like a crawler. Desktop browsers rarely state a device type, so in that case it shows “Desktop (likely)”.

## Frozen User-Agent and Client Hints

Since 2021 Chrome, Edge and other Chromium-based browsers freeze part of the User-Agent to reduce tracking: the minor version is always zero and Windows 11 shows up as Windows 10. Precise data is requested separately through **Client Hints**. When you analyse your own browser's User-Agent, the tool adds the low-entropy ones: brands, platform and whether it is a mobile device.
```

- [ ] **Step 8: `src/tools/user-agent/UserAgent.svelte`**

`navigator` solo existe en el cliente: `ownUa` y `uaData` se leen en `onMount`. `persistedInput` restaura lo guardado en su propio `onMount`, que se registra antes y por tanto corre antes: si después sigue vacío, se rellena con el UA del navegador.

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { formatBrands, parseUserAgent, type Brand } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  interface UaData {
    brands: Brand[];
    mobile: boolean;
    platform: string;
  }

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('user-agent', '', meta.rememberInput ?? true);

  // Browser-only values: empty during SSR.
  let ownUa = $state('');
  let uaData = $state<UaData | null>(null);

  onMount(() => {
    ownUa = navigator.userAgent;
    uaData = (navigator as Navigator & { userAgentData?: UaData }).userAgentData ?? null;
    // persistedInput restores a saved value in its own onMount, which runs before this one.
    if (!input.value.trim()) input.value = ownUa;
  });

  const info = $derived(parseUserAgent(input.value));
  const isOwn = $derived(!!ownUa && input.value.trim() === ownUa);

  const rows = $derived.by(() => {
    if (!info) return [];
    const device = [info.vendor, info.model].filter(Boolean).join(' ');
    const kind = s[info.deviceType];
    return [
      { label: s.browser, value: info.browser ?? '—' },
      { label: s.engine, value: info.engine ?? '—' },
      { label: s.os, value: info.os ?? '—' },
      { label: s.device, value: device ? `${device} · ${kind}` : kind },
      { label: s.cpu, value: info.cpu ?? '—' },
    ];
  });

  const hints = $derived(
    isOwn && uaData
      ? [
          { label: s.brands, value: formatBrands(uaData.brands) || '—' },
          { label: s.platform, value: uaData.platform || '—' },
          { label: s.isMobile, value: uaData.mobile ? s.yes : s.no },
        ]
      : [],
  );

  const report = $derived(
    [...rows, ...hints].map((r) => `${r.label}: ${r.value}`).join('\n') +
      (info?.bot ? `\n${s.bot}` : ''),
  );
</script>

<div class="panel">
  <Field id="user-agent-input" label={s.input}>
    {#snippet children({ describedby })}
      <TextArea
        id="user-agent-input"
        bind:value={input.value}
        placeholder={s.placeholder}
        {describedby}
        rows={4}
      />
    {/snippet}
  </Field>

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={!info ? 'idle' : info.recognised ? 'ok' : 'bad'}
        label={!info ? t(locale, 'led.idle') : info.recognised ? s.recognised : s.notRecognised}
      />
    {/snippet}
    {#if info}
      <dl class="display-kv">
        {#each rows as r (r.label)}
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        {/each}
      </dl>
      {#if info.bot}<p class="display-note bot">{s.bot}</p>{/if}
      {#if hints.length}
        <h2 class="hints-title">{s.hints}</h2>
        <dl class="display-kv">
          {#each hints as r (r.label)}
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          {/each}
        </dl>
      {/if}
    {:else}
      <p class="display-note">{s.empty}</p>
    {/if}
  </Display>

  <p class="note">{s.frozen}</p>

  <div class="row">
    <CopyButton main value={info ? report : ''} {locale} label={s.copyReport} />
    <Button variant="secondary" disabled={!ownUa || isOwn} onclick={() => (input.value = ownUa)}
      >{s.useMine}</Button
    >
    <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}
      >{t(locale, 'ui.clear')}</Button
    >
  </div>
  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .bot {
    font-weight: 600;
    color: var(--disp-text);
  }
  .hints-title {
    margin-top: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--disp-dim);
  }
  .note {
    font-size: 13.5px;
    color: var(--text-dim);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as userAgent } from './user-agent/meta';
```
→
```ts
import { meta as userAgent } from './user-agent/meta';
```
y
```ts
  // userAgent,
```
→
```ts
  userAgent,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import UserAgent from '../tools/user-agent/UserAgent.svelte';
```
→
```astro
import UserAgent from '../tools/user-agent/UserAgent.svelte';
```
y
```astro
{/* {id === 'user-agent' && <UserAgent client:load locale={locale} />} */}
```
→
```astro
{id === 'user-agent' && <UserAgent client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/analizar-user-agent.html dist/en/user-agent-parser.html
grep -l 'Konqueror' dist/_astro/*.js
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `user-agent` y sus dos `content.*.md`), y existen las dos páginas. Cada `grep -l` lista **un solo archivo**, `dist/_astro/UserAgent.<hash>.js`: la librería está en el chunk de esta herramienta y en ningún otro. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador (desechable, puerto 4681)**

Crea `.check-user-agent.mjs` en la raíz del worktree:
```js
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4681';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));

await page.goto(`${BASE}/es/analizar-user-agent`);
const own = await page.evaluate(() => navigator.userAgent);
await page.waitForTimeout(300);
assert.equal(await page.locator('#user-agent-input').inputValue(), own);
// Chromium exposes Client Hints: they show up for the browser's own User-Agent.
assert.match(await page.locator('.display').innerText(), /Client Hints de este navegador/);

await page
  .locator('#user-agent-input')
  .fill('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0');
const kv = await page.locator('.display-kv').first().innerText();
for (const s of ['Firefox 128.0', 'Gecko 128.0', 'Windows 10', 'Escritorio (probable)', 'amd64']) {
  assert.ok(kv.includes(s), s);
}
await page.getByRole('button', { name: 'Usar el de este navegador' }).click();
assert.equal(await page.locator('#user-agent-input').inputValue(), own);

await browser.close();
assert.deepEqual(errors, []);
console.log('OK user-agent');
```

Run:
```bash
./node_modules/.bin/astro preview --port 4681 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
until curl -sf -o /dev/null http://localhost:4681/es; do sleep 0.5; done
node .check-user-agent.mjs
kill $PREVIEW
rm .check-user-agent.mjs
```
Expected: la última línea es `OK user-agent` y no hay ningún error de página. Si falla un paso, arregla el componente, no la comprobación.

A mano, con `pnpm preview`, en `/es/analizar-user-agent` y `/en/user-agent-parser`, primero en el tema claro y luego en oscuro y terminal, a 390 px y a 1280 px de ancho:
1. Al abrir, el campo trae el UA de tu navegador, el análisis y, en Chrome o Edge, «Client Hints de este navegador» con las marcas sin «Not A Brand».
2. El UA de Firefox 128 en Windows → «Firefox 128.0», «Gecko 128.0», «Windows 10», «Escritorio (probable)» y «amd64».
3. El de Googlebot → «Parece un bot o un rastreador»; `hola que tal` → LED rojo «No se ha reconocido ningún navegador» y todo en «—».
4. «Usar el de este navegador» vuelve a tu UA; `c` copia el análisis en texto.

- [ ] **Step 12: Commit**

```bash
git add src/tools/user-agent src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (tampoco `.check-user-agent.mjs`, que ya se borró). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(user-agent): analizar User-Agent con ua-parser-js 1.x y Client Hints"
```

---

### Task 12: Semver: rangos de npm con `semver`, explicados en palabras

**Files:**
- Create: `src/tools/semver/logic.ts`, `src/tools/semver/logic.test.ts`, `src/tools/semver/meta.ts`, `src/tools/semver/strings.ts`, `src/tools/semver/content.es.md`, `src/tools/semver/content.en.md`, `src/tools/semver/Semver.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `semver` (Task 0), solo con importaciones sueltas; `fill`; `t` (`led.idle`, `led.bad`, `ui.clear`, `tool.remember`); kit: `Field`, `TextArea`, `Toggle`, `Display`, `Led`, `CopyButton`, `Button` y `persistedInput`.
- Produces:
  - `interface RangeOptions { includePrerelease }`, `type RangeCheck`, `type VersionCheck`
  - `checkRange(range, opts)`, `checkVersions(range, text, opts)`, `highest(checks, range, opts)`, `describeRange(normalized, locale)`
  - `meta: ToolMeta` (id `semver`, slugs `comprobar-rango-semver` / `semver-range-checker`), `strings: Record<Locale, …>` y el componente `Semver` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 14: `#semver-range`, `#semver-range-error`, `#semver-versions`, `.panel .display-kv` (rango normalizado, lectura, mínima y máxima) y el LED de `.display-head` («2 de 3 cumplen»).

**§8.12 (vinculante):** `semver` · ref · sin pestañas. El rango y un `TextArea` de versiones, una por línea. `semver` con importaciones sueltas (`functions/satisfies`, `functions/valid`, `ranges/valid`, `ranges/max-satisfying` y `ranges/min-version`). Por versión, LED «cumple» o «no cumple» o el error «No es una versión semver: se escribe MAYOR.MENOR.PARCHE, por ejemplo 1.4.0»; el rango normalizado (`^1.2.3` → `>=1.2.3 <2.0.0-0`) y su lectura en palabras escrita a mano («desde 1.2.3, incluida, hasta antes de 2.0.0»); la versión más alta que cumple y la mínima del rango. «Incluir prereleases» → `{ includePrerelease: true }`. Chuleta plegable de `^`, `~`, `x`, `-` y `||`. Rango inválido → «El rango no es válido. Ejemplos: ^1.2.3, ~1.2, >=1.0.0 <2.0.0, 1.x || 2.x». Recordar ✓.

Cómo se cubre cada punto:
- Normalización como npm: test `normalises ranges like npm does` (caret, tilde, `^0.0.1`, guion, `||` y `*`) y `rejects invalid ranges`. `||` se muestra con espacios para leerlo mejor.
- Versiones: tests `checks each line against the range` (el ejemplo del e2e), `flags lines that are not semver versions` (`v1.4.0` se acepta, como en npm), `follows npm rules for prereleases, unless they are included` y `has no highest match when nothing satisfies`.
- Lectura en palabras: tests `reads caret, tilde and hyphen ranges in both languages` y `reads unions, exact versions and "any"`. El `-0` de los límites superiores se oculta en la lectura, no en el rango normalizado.
- Importaciones sueltas: los cinco módulos son CommonJS con tipos `export =`; se importan por defecto y funcionan en `pnpm check`, en Vitest y en el build de cliente (comprobado). `minVersion` no recibe `includePrerelease`: sus tipos no lo admiten y el mínimo no cambia.
- La cuenta del LED («2 de 3 cumplen») solo cuenta las líneas que son versiones válidas.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l3-semver -b lote-3/semver   # desde el commit de la Task 0
cd ../devtools-l3-semver
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task (Field, TextArea, Toggle, Display, Led, CopyButton, Button) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real y dilo en el commit.

- [ ] **Step 2: Test (falla)**

`src/tools/semver/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { checkRange, checkVersions, describeRange, highest } from './logic';

const plain = { includePrerelease: false };
const pre = { includePrerelease: true };

describe('checkRange', () => {
  it('normalises ranges like npm does', () => {
    expect(checkRange('^1.2.3', plain)).toEqual({
      ok: true,
      normalized: '>=1.2.3 <2.0.0-0',
      min: '1.2.3',
    });
    expect(checkRange('~1.2', plain)).toMatchObject({ normalized: '>=1.2.0 <1.3.0-0' });
    expect(checkRange('^0.0.1', plain)).toMatchObject({ normalized: '>=0.0.1 <0.0.2-0' });
    expect(checkRange('1.2.3 - 2.3.4', plain)).toMatchObject({ normalized: '>=1.2.3 <=2.3.4' });
    expect(checkRange('1.x || 2.x', plain)).toMatchObject({
      normalized: '>=1.0.0 <2.0.0-0 || >=2.0.0 <3.0.0-0',
      min: '1.0.0',
    });
    expect(checkRange('*', plain)).toMatchObject({ normalized: '*', min: '0.0.0' });
  });

  it('rejects invalid ranges', () => {
    expect(checkRange('foo', plain)).toEqual({ ok: false });
    expect(checkRange('^^1', plain)).toEqual({ ok: false });
  });
});

describe('checkVersions', () => {
  it('checks each line against the range', () => {
    const r = checkVersions('^1.2.3', '1.2.3\n1.9.0\n\n2.0.0\n', plain);
    expect(r).toEqual([
      { input: '1.2.3', ok: true, version: '1.2.3', satisfies: true },
      { input: '1.9.0', ok: true, version: '1.9.0', satisfies: true },
      { input: '2.0.0', ok: true, version: '2.0.0', satisfies: false },
    ]);
    expect(highest(r, '^1.2.3', plain)).toBe('1.9.0');
  });

  it('flags lines that are not semver versions', () => {
    expect(checkVersions('^1.0.0', '1.2\nhola\nv1.4.0', plain)).toEqual([
      { input: '1.2', ok: false },
      { input: 'hola', ok: false },
      { input: 'v1.4.0', ok: true, version: '1.4.0', satisfies: true },
    ]);
  });

  it('follows npm rules for prereleases, unless they are included', () => {
    expect(checkVersions('^1.2.3', '1.3.0-beta.1', plain)[0]).toMatchObject({ satisfies: false });
    expect(checkVersions('^1.2.3', '1.3.0-beta.1', pre)[0]).toMatchObject({ satisfies: true });
    // A prerelease in the range lets through prereleases of that same version only.
    expect(checkVersions('^1.2.3-beta.2', '1.2.3-beta.5\n1.2.4-beta', plain)).toMatchObject([
      { satisfies: true },
      { satisfies: false },
    ]);
  });

  it('has no highest match when nothing satisfies', () => {
    expect(highest(checkVersions('^3.0.0', '1.0.0\n2.0.0', plain), '^3.0.0', plain)).toBeNull();
  });
});

describe('describeRange', () => {
  it('reads caret, tilde and hyphen ranges in both languages', () => {
    expect(describeRange('>=1.2.3 <2.0.0-0', 'es')).toBe(
      'desde 1.2.3, incluida, hasta antes de 2.0.0',
    );
    expect(describeRange('>=1.2.3 <2.0.0-0', 'en')).toBe(
      'from 1.2.3, inclusive, up to but not including 2.0.0',
    );
    expect(describeRange('>=1.2.3 <=2.3.4', 'es')).toBe(
      'desde 1.2.3, incluida, hasta 2.3.4, incluida',
    );
  });

  it('reads unions, exact versions and "any"', () => {
    expect(describeRange('>=1.0.0 <2.0.0-0 || >=3.0.0', 'es')).toBe(
      'desde 1.0.0, incluida, hasta antes de 2.0.0 o desde 3.0.0, incluida',
    );
    expect(describeRange('1.2.3', 'es')).toBe('exactamente 1.2.3');
    expect(describeRange('*', 'en')).toBe('any version');
    expect(describeRange('>1.2.3', 'en')).toBe('after 1.2.3');
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/semver`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/semver/logic.ts`**

La lectura en palabras se construye a mano desde los comparadores de `validRange`, como pide la ficha; `semver` solo decide qué cumple y qué no.

```ts
import satisfies from 'semver/functions/satisfies';
import valid from 'semver/functions/valid';
import maxSatisfying from 'semver/ranges/max-satisfying';
import minVersion from 'semver/ranges/min-version';
import validRange from 'semver/ranges/valid';
import type { Locale } from '../types';

export interface RangeOptions {
  includePrerelease: boolean;
}

export type RangeCheck = { ok: true; normalized: string; min: string | null } | { ok: false };

export type VersionCheck =
  { input: string; ok: true; version: string; satisfies: boolean } | { input: string; ok: false };

/** `validRange` with ` || ` spaced out for reading. Invalid ranges → `{ ok: false }`. */
export function checkRange(range: string, opts: RangeOptions): RangeCheck {
  const normalized = validRange(range.trim(), opts);
  if (normalized === null) return { ok: false };
  return {
    ok: true,
    normalized: normalized.split('||').join(' || '),
    min: minVersion(range.trim())?.version ?? null,
  };
}

/** One entry per non-empty line. */
export function checkVersions(range: string, text: string, opts: RangeOptions): VersionCheck[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((input) => {
      const version = valid(input);
      if (version === null) return { input, ok: false as const };
      return {
        input,
        ok: true as const,
        version,
        satisfies: satisfies(version, range.trim(), opts),
      };
    });
}

export function highest(checks: VersionCheck[], range: string, opts: RangeOptions): string | null {
  const versions = checks.flatMap((c) => (c.ok ? [c.version] : []));
  return maxSatisfying(versions, range.trim(), opts);
}

const WORDS = {
  es: {
    any: 'cualquier versión',
    exact: 'exactamente {v}',
    '>=': 'desde {v}, incluida',
    '>': 'después de {v}',
    '<': 'hasta antes de {v}',
    '<=': 'hasta {v}, incluida',
    or: ' o ',
  },
  en: {
    any: 'any version',
    exact: 'exactly {v}',
    '>=': 'from {v}, inclusive',
    '>': 'after {v}',
    '<': 'up to but not including {v}',
    '<=': 'up to {v}, inclusive',
    or: ' or ',
  },
} as const;

const COMPARATOR = /^(>=|<=|>|<|=)?v?(.+)$/;

/**
 * Reads a normalised range in words: "desde 1.2.3, incluida, hasta antes de 2.0.0".
 * The `-0` that semver adds to upper bounds (so they exclude prereleases of that version) is hidden.
 */
export function describeRange(normalized: string, locale: Locale): string {
  const w = WORDS[locale];
  return normalized
    .split('||')
    .map((set) => {
      const parts = set.trim().split(/\s+/).filter(Boolean);
      if (parts.length === 0 || parts.every((p) => p === '*')) return w.any;
      return parts
        .map((p) => {
          const [, op = '=', v] = COMPARATOR.exec(p)!;
          const version = v.replace(/-0$/, '');
          const template = op === '=' ? w.exact : w[op as '>=' | '>' | '<' | '<='];
          return template.replace('{v}', version);
        })
        .join(', ');
    })
    .join(w.or);
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/semver`
Expected: PASS (8 tests).

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/semver/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'semver',
  category: 'ref',
  icon: 'tag',
  slug: { es: 'comprobar-rango-semver', en: 'semver-range-checker' },
  name: { es: 'Semver', en: 'Semver' },
  title: {
    es: 'Comprobar versiones semver contra un rango (^, ~)',
    en: 'Semver range checker: does a version satisfy ^ or ~',
  },
  description: {
    es: 'Comprueba qué versiones cumplen un rango semver de npm (^, ~, x, guiones y ||), con el rango explicado en palabras y la versión más alta que encaja.',
    en: 'Check which versions satisfy an npm semver range (^, ~, x, hyphens and ||), with the range explained in words and the highest matching version.',
  },
  keywords: {
    es: ['semver', 'rango semver', 'caret', 'tilde', 'versiones npm', 'package.json'],
    en: ['semver', 'semver range', 'semver checker', 'caret range', 'tilde range', 'npm version'],
  },
  faq: {
    es: [
      {
        q: '¿Qué diferencia hay entre ^ y ~?',
        a: '^1.2.3 acepta cualquier versión 1.x.y desde la 1.2.3, porque no cambia la mayor. ~1.2.3 solo acepta parches: de 1.2.3 hasta antes de 1.3.0. Con versiones 0.x, ^ es más estricto: ^0.2.3 no pasa de 0.3.0.',
      },
      {
        q: '¿Por qué 2.0.0-beta no cumple ^1.2.3?',
        a: 'npm no deja entrar prereleases en un rango salvo que el propio rango tenga una prerelease de esa misma versión. Activa «Incluir prereleases» para comprobarlas igualmente.',
      },
    ],
    en: [
      {
        q: 'What is the difference between ^ and ~?',
        a: '^1.2.3 accepts any 1.x.y version from 1.2.3, because the major does not change. ~1.2.3 only accepts patches: from 1.2.3 up to but not including 1.3.0. With 0.x versions ^ is stricter: ^0.2.3 stops before 0.3.0.',
      },
      {
        q: 'Why does 2.0.0-beta not satisfy ^1.2.3?',
        a: 'npm keeps prereleases out of a range unless the range itself names a prerelease of that same version. Turn on “Include prereleases” to check them anyway.',
      },
    ],
  },
};
```

`src/tools/semver/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    range: 'Rango',
    rangePlaceholder: '^1.2.3',
    versions: 'Versiones (una por línea)',
    versionsPlaceholder: '1.2.3\n1.9.0\n2.0.0',
    includePrerelease: 'Incluir prereleases',
    result: 'Resultado',
    badRange: 'El rango no es válido. Ejemplos: ^1.2.3, ~1.2, >=1.0.0 <2.0.0, 1.x || 2.x',
    badVersion: 'No es una versión semver: se escribe MAYOR.MENOR.PARCHE, por ejemplo 1.4.0',
    empty: 'Escribe un rango como ^1.2.3 y las versiones que quieras comprobar.',
    normalized: 'Rango normalizado',
    reading: 'En palabras',
    min: 'Versión mínima del rango',
    max: 'La más alta que cumple',
    none: 'Ninguna',
    matches: '{n} de {total} cumplen',
    yes: 'Cumple',
    no: 'No cumple',
    copyRange: 'Copiar rango',
    cheatsheet: 'Chuleta de rangos',
    cheatCaret: 'Mismo número mayor: >=1.2.3 <2.0.0 (con 0.x, mismo menor)',
    cheatTilde: 'Solo parches: >=1.2.3 <1.3.0',
    cheatX: 'Comodín: 1.x = >=1.0.0 <2.0.0',
    cheatHyphen: 'Intervalo cerrado: >=1.2.3 <=2.3.4',
    cheatOr: 'Cualquiera de los dos rangos',
  },
  en: {
    range: 'Range',
    rangePlaceholder: '^1.2.3',
    versions: 'Versions (one per line)',
    versionsPlaceholder: '1.2.3\n1.9.0\n2.0.0',
    includePrerelease: 'Include prereleases',
    result: 'Result',
    badRange: 'The range is not valid. Examples: ^1.2.3, ~1.2, >=1.0.0 <2.0.0, 1.x || 2.x',
    badVersion: 'Not a semver version: write MAJOR.MINOR.PATCH, for example 1.4.0',
    empty: 'Type a range such as ^1.2.3 and the versions you want to check.',
    normalized: 'Normalised range',
    reading: 'In words',
    min: 'Lowest version in range',
    max: 'Highest that satisfies',
    none: 'None',
    matches: '{n} of {total} satisfy',
    yes: 'Satisfies',
    no: 'Does not satisfy',
    copyRange: 'Copy range',
    cheatsheet: 'Range cheat sheet',
    cheatCaret: 'Same major: >=1.2.3 <2.0.0 (with 0.x, same minor)',
    cheatTilde: 'Patches only: >=1.2.3 <1.3.0',
    cheatX: 'Wildcard: 1.x = >=1.0.0 <2.0.0',
    cheatHyphen: 'Closed interval: >=1.2.3 <=2.3.4',
    cheatOr: 'Either range',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/semver/content.es.md`:
```md
## Cómo funciona

Escribe un rango de versiones como los de `package.json` y, debajo, las versiones que quieras comprobar, una por línea. La herramienta usa `semver`, la misma librería que npm, así que el resultado coincide con lo que instalaría `npm install`. Cada versión se marca como «cumple» o «no cumple», y verás cuál es la más alta que encaja y cuál es la mínima que admite el rango.

El rango se muestra también **normalizado** (`^1.2.3` → `>=1.2.3 <2.0.0-0`) y explicado en palabras. El `-0` final significa que el límite superior deja fuera también las prereleases de esa versión, como `2.0.0-beta`.

## Prereleases

Por defecto, npm no deja entrar una prerelease (`1.3.0-rc.1`) en un rango salvo que el rango mencione una prerelease de la misma versión. Es una protección para no instalar betas sin querer. Si activas «Incluir prereleases», se comprueban como cualquier otra versión.
```

`src/tools/semver/content.en.md`:
```md
## How it works

Type a version range like the ones in `package.json` and, below it, the versions you want to check, one per line. The tool uses `semver`, the same library as npm, so the result matches what `npm install` would pick. Each version is marked as satisfying the range or not, and you will see the highest one that fits and the lowest version the range allows.

The range is also shown **normalised** (`^1.2.3` → `>=1.2.3 <2.0.0-0`) and explained in words. The trailing `-0` means the upper bound also leaves out prereleases of that version, such as `2.0.0-beta`.

## Prereleases

By default npm keeps a prerelease (`1.3.0-rc.1`) out of a range unless the range names a prerelease of that same version. It protects you from installing betas by accident. With “Include prereleases” on, they are checked like any other version.
```

- [ ] **Step 8: `src/tools/semver/Semver.svelte`**

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { checkRange, checkVersions, describeRange, highest } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const range = persistedInput('semver', '', remember);
  const versions = persistedInput('semver-versions', '', remember);

  let includePrerelease = $state(false);

  const opts = $derived({ includePrerelease });
  const check = $derived(range.value.trim() ? checkRange(range.value, opts) : null);
  const rows = $derived(check?.ok ? checkVersions(range.value, versions.value, opts) : []);
  const matching = $derived(rows.filter((r) => r.ok && r.satisfies).length);
  const best = $derived(check?.ok ? highest(rows, range.value, opts) : null);

  const cheats = $derived([
    { code: '^1.2.3', text: s.cheatCaret },
    { code: '~1.2.3', text: s.cheatTilde },
    { code: '1.x', text: s.cheatX },
    { code: '1.2.3 - 2.3.4', text: s.cheatHyphen },
    { code: '^1.0.0 || ^2.0.0', text: s.cheatOr },
  ]);
</script>

<div class="panel">
  <Field id="semver-range" label={s.range} error={check && !check.ok ? s.badRange : undefined}>
    {#snippet children({ describedby })}
      <input
        id="semver-range"
        class="control mono"
        bind:value={range.value}
        placeholder={s.rangePlaceholder}
        aria-describedby={describedby}
        aria-invalid={!!check && !check.ok}
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
      />
    {/snippet}
  </Field>

  <Field id="semver-versions" label={s.versions}>
    {#snippet children({ describedby })}
      <TextArea
        id="semver-versions"
        bind:value={versions.value}
        placeholder={s.versionsPlaceholder}
        {describedby}
        rows={6}
      />
    {/snippet}
  </Field>

  <Toggle bind:checked={includePrerelease} label={s.includePrerelease} />

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={!check
          ? 'idle'
          : !check.ok
            ? 'bad'
            : rows.length === 0
              ? 'idle'
              : matching > 0
                ? 'ok'
                : 'bad'}
        label={!check
          ? t(locale, 'led.idle')
          : !check.ok
            ? t(locale, 'led.bad')
            : fill(s.matches, { n: matching, total: rows.filter((r) => r.ok).length })}
      />
    {/snippet}
    {#if check?.ok}
      <dl class="display-kv">
        <dt>{s.normalized}</dt>
        <dd>{check.normalized}</dd>
        <dt>{s.reading}</dt>
        <dd class="words">{describeRange(check.normalized, locale)}</dd>
        <dt>{s.min}</dt>
        <dd>{check.min ?? s.none}</dd>
        {#if rows.length}
          <dt>{s.max}</dt>
          <dd>{best ?? s.none}</dd>
        {/if}
      </dl>
      {#if rows.length}
        <ul class="display-rows versions">
          {#each rows as row, i (i)}
            <li class="display-row">
              <span class="version">{row.input}</span>
              {#if row.ok}
                <Led state={row.satisfies ? 'ok' : 'bad'} label={row.satisfies ? s.yes : s.no} />
              {:else}
                <span class="error">{s.badVersion}</span>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    {:else}
      <p class="display-note">{check ? s.badRange : s.empty}</p>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={check?.ok ? check.normalized : ''} {locale} label={s.copyRange} />
    <Button
      variant="ghost"
      disabled={!range.value && !versions.value}
      onclick={() => {
        range.value = '';
        versions.value = '';
      }}>{t(locale, 'ui.clear')}</Button
    >
  </div>

  <details class="cheats">
    <summary>{s.cheatsheet}</summary>
    <dl>
      {#each cheats as c (c.code)}
        <dt><code>{c.code}</code></dt>
        <dd>{c.text}</dd>
      {/each}
    </dl>
  </details>

  <Toggle
    bind:checked={
      () => range.remember,
      (v) => {
        range.remember = v;
        versions.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .versions {
    list-style: none;
    padding: 0;
  }
  .version {
    font-family: var(--font-mono);
  }
  .words {
    font-family: var(--font-body);
  }
  /* Inside the display, which is dark in every theme: --bad passes there, --bad-text does not. */
  .error {
    font: 600 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--bad);
    text-align: right;
  }
  .cheats summary {
    display: flex;
    align-items: center;
    min-height: 44px;
    font-weight: 600;
    cursor: pointer;
  }
  .cheats dl {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    gap: 8px 16px;
    margin: 8px 0 0;
  }
  .cheats dd {
    margin: 0;
    color: var(--text-dim);
  }
  .cheats code {
    font-family: var(--font-mono);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as semver } from './semver/meta';
```
→
```ts
import { meta as semver } from './semver/meta';
```
y
```ts
  // semver,
```
→
```ts
  semver,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Semver from '../tools/semver/Semver.svelte';
```
→
```astro
import Semver from '../tools/semver/Semver.svelte';
```
y
```astro
{/* {id === 'semver' && <Semver client:load locale={locale} />} */}
```
→
```astro
{id === 'semver' && <Semver client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/comprobar-rango-semver.html dist/en/semver-range-checker.html
grep -l 'SEMVER_SPEC_VERSION' dist/_astro/*.js
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `semver` y sus dos `content.*.md`), y existen las dos páginas. Cada `grep -l` lista **un solo archivo**, `dist/_astro/Semver.<hash>.js`: la librería está en el chunk de esta herramienta y en ningún otro. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador (desechable, puerto 4682)**

Crea `.check-semver.mjs` en la raíz del worktree:
```js
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4682';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));

await page.goto(`${BASE}/es/comprobar-rango-semver`);
await page.locator('#semver-range').fill('^1.2.3');
await page.locator('#semver-versions').fill('1.2.3\n1.9.0\n2.0.0\nhola');
const text = await page.locator('.display').innerText();
assert.match(text, /2 de 3 cumplen/);
assert.match(text, />=1\.2\.3 <2\.0\.0-0/);
assert.match(text, /desde 1\.2\.3, incluida, hasta antes de 2\.0\.0/);
assert.match(text, /No es una versión semver/);

await page.locator('#semver-range').fill('^^1');
assert.match(await page.locator('#semver-range-error').innerText(), /El rango no es válido/);

await browser.close();
assert.deepEqual(errors, []);
console.log('OK semver');
```

Run:
```bash
./node_modules/.bin/astro preview --port 4682 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
until curl -sf -o /dev/null http://localhost:4682/es; do sleep 0.5; done
node .check-semver.mjs
kill $PREVIEW
rm .check-semver.mjs
```
Expected: la última línea es `OK semver` y no hay ningún error de página. Si falla un paso, arregla el componente, no la comprobación.

A mano, con `pnpm preview`, en `/es/comprobar-rango-semver` y `/en/semver-range-checker`, primero en el tema claro y luego en oscuro y terminal, a 390 px y a 1280 px de ancho:
1. `^1.2.3` con `1.2.3`, `1.9.0` y `2.0.0` → «2 de 3 cumplen», `>=1.2.3 <2.0.0-0`, «desde 1.2.3, incluida, hasta antes de 2.0.0», mínima `1.2.3` y más alta `1.9.0`.
2. Añade `1.3.0-beta.1` → «No cumple»; activa «Incluir prereleases» → «Cumple».
3. `^^1` → el error de rango bajo el campo, con ejemplos.
4. Abre la chuleta: cinco filas con su código. `c` copia el rango normalizado.

- [ ] **Step 12: Commit**

```bash
git add src/tools/semver src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (tampoco `.check-semver.mjs`, que ya se borró). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(semver): comprobar versiones contra rangos semver de npm"
```

---

### Task 13: Subredes CIDR: red, broadcast y hosts en 32 bits sin signo, con /31 y /32

**Files:**
- Create: `src/tools/cidr/logic.ts`, `src/tools/cidr/logic.test.ts`, `src/tools/cidr/meta.ts`, `src/tools/cidr/strings.ts`, `src/tools/cidr/content.es.md`, `src/tools/cidr/content.en.md`, `src/tools/cidr/Cidr.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `fill`; `t` (`led.idle`, `led.bad`, `ui.clear`, `tool.remember`); kit: `Field`, `Display`, `Led`, `CopyButton`, `Button`, `Toggle` y `persistedInput`.
- Produces:
  - `type AddressType`, `type CidrError`, `interface Subnet { ip; prefix; mask; wildcard; network; broadcast; firstHost; lastHost; usable; total; type; ipClass }`, `type ParseResult`
  - `toDotted(n)`, `toBinary(n)`, `parseIp(text)`, `maskFromPrefix(p)`, `prefixFromMask(mask)`, `addressType(ip)`, `ipClass(ip)`, `subnet(ip, prefix)`, `parseCidr(input): ParseResult`
  - `meta: ToolMeta` (id `cidr`, slugs `calculadora-subredes-cidr` / `cidr-subnet-calculator`), `strings: Record<Locale, …>` y el componente `Cidr` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 14: `#cidr-input`, `#cidr-input-error` y `.panel .display-kv` (una pareja `dt`/`dd` por dato: «Broadcast», «Hosts útiles», «Tipo»…).

**§8.13 (vinculante):** `cidr` · ref · sin pestañas. Un campo: `a.b.c.d/p` o IP + máscara; una IP sola es `/32` con aviso. Octetos 0–255 sin ceros a la izquierda («Los ceros a la izquierda son ambiguos (hay sistemas que los leen en octal): escribe 10»), prefijo 0–32, máscara con unos seguidos («La máscara no es válida: los unos deben ir seguidos») e IPv6 → «IPv6 todavía no está incluido». Cálculo en 32 bits sin signo (`>>> 0`) con las fórmulas de la ficha; `/31` (RFC 3021) sin broadcast y con 2 útiles; `/32` un solo host. Vectores: `192.168.1.10/24` → 192.168.1.0, 192.168.1.255, 1–254, 254; `10.0.0.7/31` → 10.0.0.6–10.0.0.7, 2; `172.16.5.4/20` → 172.16.0.0, 172.16.15.255, 4094. `Display kv` con IP, red/p, máscara, comodín, broadcast, primer y último host, útiles, total, máscara en binario, tipo (privada, CGNAT, loopback, enlace local, «esta red», documentación, multicast, reservada o pública) y clase histórica. Recordar ✓.

Cómo se cubre cada punto:
- Los tres vectores de la ficha, con todos sus campos: tests `192.168.1.10/24`, `10.0.0.7/31 is a point-to-point link (RFC 3021)` y `172.16.5.4/20`. Comprobados también con `BigInt` en Node, sin el código del plan.
- Extremos: tests `/32 is a single host and /0 is the whole space` (4 294 967 294 útiles) y `stays unsigned at the top of the range` (`255.255.255.255/30`).
- Entrada: tests `accepts a mask after a space or a slash`, `takes a bare IP as /32 and says so`, `rejects leading zeros, suggesting the plain number` y `rejects bad octets, prefixes, masks and IPv6`.
- Máscaras: test `converts between prefixes and masks` (los 33 prefijos van y vuelven, y `255.0.255.0` y `0.255.255.255` se rechazan) y `prints the mask in binary with dots between octets`.
- Tipos y clases: tests `recognises the special ranges` (con los bordes de 172.16/12 y 100.64/10) y `gives the historic class`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l3-cidr -b lote-3/cidr   # desde el commit de la Task 0
cd ../devtools-l3-cidr
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task (Field, Display, Led, CopyButton, Button, Toggle) y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real y dilo en el commit.

- [ ] **Step 2: Test (falla)**

`src/tools/cidr/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  addressType,
  ipClass,
  maskFromPrefix,
  parseCidr,
  parseIp,
  prefixFromMask,
  toBinary,
  toDotted,
  type Subnet,
} from './logic';

function net(input: string): Subnet {
  const r = parseCidr(input);
  if (!r.ok) throw new Error(`failed: ${input}`);
  return r.subnet;
}

function dotted(s: Subnet) {
  return {
    network: toDotted(s.network),
    mask: toDotted(s.mask),
    wildcard: toDotted(s.wildcard),
    broadcast: s.broadcast === null ? null : toDotted(s.broadcast),
    first: toDotted(s.firstHost),
    last: toDotted(s.lastHost),
    usable: s.usable,
    total: s.total,
  };
}

describe('subnet math (spec vectors)', () => {
  it('192.168.1.10/24', () => {
    expect(dotted(net('192.168.1.10/24'))).toEqual({
      network: '192.168.1.0',
      mask: '255.255.255.0',
      wildcard: '0.0.0.255',
      broadcast: '192.168.1.255',
      first: '192.168.1.1',
      last: '192.168.1.254',
      usable: 254,
      total: 256,
    });
  });

  it('10.0.0.7/31 is a point-to-point link (RFC 3021)', () => {
    expect(dotted(net('10.0.0.7/31'))).toEqual({
      network: '10.0.0.6',
      mask: '255.255.255.254',
      wildcard: '0.0.0.1',
      broadcast: null,
      first: '10.0.0.6',
      last: '10.0.0.7',
      usable: 2,
      total: 2,
    });
  });

  it('172.16.5.4/20', () => {
    expect(dotted(net('172.16.5.4/20'))).toMatchObject({
      network: '172.16.0.0',
      broadcast: '172.16.15.255',
      first: '172.16.0.1',
      last: '172.16.15.254',
      usable: 4094,
    });
  });

  it('/32 is a single host and /0 is the whole space', () => {
    expect(dotted(net('8.8.8.8/32'))).toEqual({
      network: '8.8.8.8',
      mask: '255.255.255.255',
      wildcard: '0.0.0.0',
      broadcast: null,
      first: '8.8.8.8',
      last: '8.8.8.8',
      usable: 1,
      total: 1,
    });
    expect(dotted(net('200.1.2.3/0'))).toEqual({
      network: '0.0.0.0',
      mask: '0.0.0.0',
      wildcard: '255.255.255.255',
      broadcast: '255.255.255.255',
      first: '0.0.0.1',
      last: '255.255.255.254',
      usable: 4294967294,
      total: 4294967296,
    });
  });

  it('stays unsigned at the top of the range', () => {
    expect(dotted(net('255.255.255.255/30'))).toMatchObject({
      network: '255.255.255.252',
      broadcast: '255.255.255.255',
      usable: 2,
    });
  });
});

describe('parseCidr', () => {
  it('accepts a mask after a space or a slash', () => {
    expect(net('192.168.1.10 255.255.255.0').prefix).toBe(24);
    expect(net('192.168.1.10/255.255.240.0').prefix).toBe(20);
  });

  it('takes a bare IP as /32 and says so', () => {
    expect(parseCidr('10.1.2.3')).toMatchObject({
      ok: true,
      assumed32: true,
      subnet: { prefix: 32 },
    });
  });

  it('rejects leading zeros, suggesting the plain number', () => {
    expect(parseCidr('192.168.010.1/24')).toEqual({
      ok: false,
      error: { kind: 'leading-zero', octet: '010', fixed: '10' },
    });
  });

  it('rejects bad octets, prefixes, masks and IPv6', () => {
    expect(parseCidr('256.1.1.1')).toEqual({
      ok: false,
      error: { kind: 'octet-range', octet: '256' },
    });
    expect(parseCidr('1.2.3/24')).toEqual({ ok: false, error: { kind: 'format' } });
    expect(parseCidr('1.2.3.4/33')).toEqual({ ok: false, error: { kind: 'prefix', prefix: '33' } });
    expect(parseCidr('1.2.3.4 255.0.255.0')).toEqual({ ok: false, error: { kind: 'mask' } });
    expect(parseCidr('2001:db8::/32')).toEqual({ ok: false, error: { kind: 'ipv6' } });
    expect(parseCidr(' ')).toEqual({ ok: false, error: { kind: 'empty' } });
  });
});

describe('masks', () => {
  it('converts between prefixes and masks', () => {
    expect(toDotted(maskFromPrefix(0))).toBe('0.0.0.0');
    expect(toDotted(maskFromPrefix(1))).toBe('128.0.0.0');
    expect(toDotted(maskFromPrefix(32))).toBe('255.255.255.255');
    for (let p = 0; p <= 32; p++) expect(prefixFromMask(maskFromPrefix(p))).toBe(p);
    expect(prefixFromMask(parseIp('255.0.255.0'))).toBeNull();
    expect(prefixFromMask(parseIp('0.255.255.255'))).toBeNull();
  });

  it('prints the mask in binary with dots between octets', () => {
    expect(toBinary(maskFromPrefix(20))).toBe('11111111.11111111.11110000.00000000');
  });
});

describe('address types and classes', () => {
  const type = (ip: string) => addressType(parseIp(ip));

  it('recognises the special ranges', () => {
    expect(type('10.20.30.40')).toBe('private');
    expect(type('172.31.255.255')).toBe('private');
    expect(type('172.32.0.1')).toBe('public');
    expect(type('192.168.0.1')).toBe('private');
    expect(type('100.64.0.1')).toBe('cgnat');
    expect(type('100.128.0.1')).toBe('public');
    expect(type('127.0.0.1')).toBe('loopback');
    expect(type('169.254.10.1')).toBe('link-local');
    expect(type('0.1.2.3')).toBe('this-network');
    expect(type('192.0.2.5')).toBe('documentation');
    expect(type('198.51.100.5')).toBe('documentation');
    expect(type('203.0.113.5')).toBe('documentation');
    expect(type('224.0.0.251')).toBe('multicast');
    expect(type('240.0.0.1')).toBe('reserved');
    expect(type('8.8.8.8')).toBe('public');
  });

  it('gives the historic class', () => {
    expect(ipClass(parseIp('10.0.0.1'))).toBe('A');
    expect(ipClass(parseIp('172.16.0.1'))).toBe('B');
    expect(ipClass(parseIp('192.168.0.1'))).toBe('C');
    expect(ipClass(parseIp('224.0.0.1'))).toBe('D');
    expect(ipClass(parseIp('250.0.0.1'))).toBe('E');
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/cidr`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/cidr/logic.ts`**

Todo en enteros de 32 bits sin signo: cada operación de bits termina en `>>> 0`. Una máscara válida invertida es `2^k − 1`, así que `inverted & (inverted + 1)` vale 0 solo si los unos van seguidos.

```ts
export type AddressType =
  | 'private'
  | 'cgnat'
  | 'loopback'
  | 'link-local'
  | 'this-network'
  | 'documentation'
  | 'multicast'
  | 'reserved'
  | 'public';

export type CidrError =
  | { kind: 'empty' }
  | { kind: 'ipv6' }
  | { kind: 'format' }
  | { kind: 'leading-zero'; octet: string; fixed: string }
  | { kind: 'octet-range'; octet: string }
  | { kind: 'prefix'; prefix: string }
  | { kind: 'mask' };

export interface Subnet {
  ip: number;
  prefix: number;
  mask: number;
  wildcard: number;
  network: number;
  /** null for /31 and /32: they have no broadcast address. */
  broadcast: number | null;
  firstHost: number;
  lastHost: number;
  usable: number;
  total: number;
  type: AddressType;
  ipClass: 'A' | 'B' | 'C' | 'D' | 'E';
}

export type ParseResult =
  { ok: true; subnet: Subnet; assumed32: boolean } | { ok: false; error: CidrError };

class InputError extends Error {
  constructor(readonly detail: CidrError) {
    super(detail.kind);
  }
}

export function toDotted(n: number): string {
  return [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.');
}

export function toBinary(n: number): string {
  return [24, 16, 8, 0].map((s) => ((n >>> s) & 255).toString(2).padStart(8, '0')).join('.');
}

export function parseIp(text: string): number {
  const parts = text.split('.');
  if (parts.length !== 4) throw new InputError({ kind: 'format' });
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) throw new InputError({ kind: 'format' });
    if (p.length > 1 && p.startsWith('0')) {
      throw new InputError({ kind: 'leading-zero', octet: p, fixed: String(Number(p)) });
    }
    const v = Number(p);
    if (v > 255) throw new InputError({ kind: 'octet-range', octet: p });
    n = n * 256 + v;
  }
  return n >>> 0;
}

export function maskFromPrefix(p: number): number {
  return p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0;
}

/** Prefix length of a mask, or null when its ones are not contiguous (255.0.255.0). */
export function prefixFromMask(mask: number): number | null {
  const inverted = ~mask >>> 0;
  // A valid mask inverted is 2^k − 1: adding one leaves no bit in common.
  if ((inverted & (inverted + 1)) !== 0) return null;
  let p = 0;
  for (let m = mask; m & 0x80000000; m = (m << 1) >>> 0) p++;
  return p;
}

const inRange = (ip: number, base: string, bits: number) =>
  (ip & maskFromPrefix(bits)) >>> 0 === parseIp(base);

export function addressType(ip: number): AddressType {
  if (inRange(ip, '10.0.0.0', 8) || inRange(ip, '172.16.0.0', 12) || inRange(ip, '192.168.0.0', 16))
    return 'private';
  if (inRange(ip, '100.64.0.0', 10)) return 'cgnat';
  if (inRange(ip, '127.0.0.0', 8)) return 'loopback';
  if (inRange(ip, '169.254.0.0', 16)) return 'link-local';
  if (inRange(ip, '0.0.0.0', 8)) return 'this-network';
  if (
    inRange(ip, '192.0.2.0', 24) ||
    inRange(ip, '198.51.100.0', 24) ||
    inRange(ip, '203.0.113.0', 24)
  )
    return 'documentation';
  if (inRange(ip, '224.0.0.0', 4)) return 'multicast';
  if (inRange(ip, '240.0.0.0', 4)) return 'reserved';
  return 'public';
}

/** The historic class, from the first octet (only informative since CIDR, 1993). */
export function ipClass(ip: number): Subnet['ipClass'] {
  const first = ip >>> 24;
  if (first < 128) return 'A';
  if (first < 192) return 'B';
  if (first < 224) return 'C';
  if (first < 240) return 'D';
  return 'E';
}

export function subnet(ip: number, prefix: number): Subnet {
  const mask = maskFromPrefix(prefix);
  const network = (ip & mask) >>> 0;
  const wildcard = ~mask >>> 0;
  const last = (network | wildcard) >>> 0;
  const total = 2 ** (32 - prefix);
  const base = {
    ip,
    prefix,
    mask,
    wildcard,
    network,
    total,
    type: addressType(ip),
    ipClass: ipClass(ip),
  };
  if (prefix === 32) return { ...base, broadcast: null, firstHost: ip, lastHost: ip, usable: 1 };
  // RFC 3021: a /31 is a point-to-point link, both addresses are usable and there is no broadcast.
  if (prefix === 31)
    return { ...base, broadcast: null, firstHost: network, lastHost: last, usable: 2 };
  return {
    ...base,
    broadcast: last,
    firstHost: network + 1,
    lastHost: last - 1,
    usable: total - 2,
  };
}

/** "a.b.c.d/p", "a.b.c.d 255.255.255.0", "a.b.c.d/255.255.255.0" or a bare IP (taken as /32). */
export function parseCidr(input: string): ParseResult {
  const text = input.trim();
  if (!text) return { ok: false, error: { kind: 'empty' } };
  if (text.includes(':')) return { ok: false, error: { kind: 'ipv6' } };
  try {
    const m = /^([\d.]+)(?:\s*\/\s*([\d.]+)|\s+([\d.]+))?$/.exec(text);
    if (!m) throw new InputError({ kind: 'format' });
    const ip = parseIp(m[1]);
    const rest = m[2] ?? m[3];
    if (rest === undefined) return { ok: true, subnet: subnet(ip, 32), assumed32: true };
    let prefix: number;
    if (rest.includes('.')) {
      const p = prefixFromMask(parseIp(rest));
      if (p === null) throw new InputError({ kind: 'mask' });
      prefix = p;
    } else {
      if (!/^\d{1,2}$/.test(rest) || Number(rest) > 32) {
        throw new InputError({ kind: 'prefix', prefix: rest });
      }
      prefix = Number(rest);
    }
    return { ok: true, subnet: subnet(ip, prefix), assumed32: false };
  } catch (e) {
    if (e instanceof InputError) return { ok: false, error: e.detail };
    throw e;
  }
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/cidr`
Expected: PASS (13 tests).

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/cidr/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'cidr',
  category: 'ref',
  icon: 'network',
  slug: { es: 'calculadora-subredes-cidr', en: 'cidr-subnet-calculator' },
  name: { es: 'Subredes CIDR', en: 'CIDR subnets' },
  title: {
    es: 'Calculadora de subredes IPv4 y CIDR online',
    en: 'IPv4 CIDR subnet calculator',
  },
  description: {
    es: 'Calcula red, máscara, broadcast, rango de hosts y direcciones útiles de una subred IPv4 en notación CIDR o con máscara, y di si la IP es privada o pública.',
    en: 'Work out the network, mask, broadcast, host range and usable addresses of an IPv4 subnet in CIDR or mask notation, and whether the IP is private or public.',
  },
  keywords: {
    es: [
      'calculadora de subredes',
      'cidr',
      'mascara de red',
      'calcular broadcast',
      'subred ipv4',
      'rango de ip',
    ],
    en: [
      'subnet calculator',
      'cidr calculator',
      'netmask',
      'broadcast address',
      'ipv4 subnet',
      'ip range',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Por qué una /24 tiene 254 hosts y no 256?',
        a: 'La primera dirección identifica la red y la última es el broadcast, así que no se asignan a equipos. Quedan 2^(32−24) − 2 = 254. En una /31 (enlaces punto a punto, RFC 3021) se usan las dos.',
      },
      {
        q: '¿Qué es la máscara comodín?',
        a: 'Es la máscara invertida (0.0.0.255 para una /24). La usan las listas de acceso de Cisco y algunos cortafuegos para indicar qué bits pueden variar.',
      },
    ],
    en: [
      {
        q: 'Why does a /24 have 254 hosts and not 256?',
        a: 'The first address names the network and the last one is the broadcast, so neither is given to a device. That leaves 2^(32−24) − 2 = 254. In a /31 (point-to-point links, RFC 3021) both are used.',
      },
      {
        q: 'What is the wildcard mask?',
        a: 'It is the inverted mask (0.0.0.255 for a /24). Cisco access lists and some firewalls use it to say which bits may vary.',
      },
    ],
  },
};
```

`src/tools/cidr/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    input: 'IP y prefijo o máscara',
    placeholder: '192.168.1.10/24',
    help: 'Admite 10.0.0.1/8, 10.0.0.1 255.0.0.0 o una IP sola.',
    assumed32: 'Sin prefijo, se toma como /32 (un solo equipo).',
    result: 'Subred',
    empty: 'Escribe una dirección IPv4 con su prefijo, por ejemplo 192.168.1.10/24.',
    ip: 'IP',
    network: 'Red',
    mask: 'Máscara',
    wildcard: 'Comodín',
    broadcast: 'Broadcast',
    first: 'Primer host',
    last: 'Último host',
    usable: 'Hosts útiles',
    total: 'Direcciones en total',
    binary: 'Máscara en binario',
    type: 'Tipo',
    class: 'Clase histórica',
    none: '—',
    private: 'Privada (RFC 1918)',
    cgnat: 'CGNAT (RFC 6598)',
    loopback: 'Loopback',
    'link-local': 'Enlace local',
    'this-network': '«Esta red» (0.0.0.0/8)',
    documentation: 'Documentación (RFC 5737)',
    multicast: 'Multicast',
    reserved: 'Reservada',
    public: 'Pública',
    format: 'Escribe cuatro números separados por puntos, como 192.168.1.10/24',
    leadingZero:
      'Los ceros a la izquierda son ambiguos (hay sistemas que los leen en octal): escribe {fixed}',
    octetRange: 'El número {octet} no vale en una IP: cada parte va de 0 a 255',
    prefix: 'El prefijo /{prefix} no existe: va de 0 a 32',
    badMask: 'La máscara no es válida: los unos deben ir seguidos',
    ipv6: 'IPv6 todavía no está incluido',
    copyNetwork: 'Copiar red',
  },
  en: {
    input: 'IP and prefix or mask',
    placeholder: '192.168.1.10/24',
    help: 'Accepts 10.0.0.1/8, 10.0.0.1 255.0.0.0 or a bare IP.',
    assumed32: 'Without a prefix it is taken as /32 (a single host).',
    result: 'Subnet',
    empty: 'Type an IPv4 address with its prefix, for example 192.168.1.10/24.',
    ip: 'IP',
    network: 'Network',
    mask: 'Mask',
    wildcard: 'Wildcard',
    broadcast: 'Broadcast',
    first: 'First host',
    last: 'Last host',
    usable: 'Usable hosts',
    total: 'Total addresses',
    binary: 'Mask in binary',
    type: 'Type',
    class: 'Historic class',
    none: '—',
    private: 'Private (RFC 1918)',
    cgnat: 'CGNAT (RFC 6598)',
    loopback: 'Loopback',
    'link-local': 'Link-local',
    'this-network': '“This network” (0.0.0.0/8)',
    documentation: 'Documentation (RFC 5737)',
    multicast: 'Multicast',
    reserved: 'Reserved',
    public: 'Public',
    format: 'Type four numbers separated by dots, such as 192.168.1.10/24',
    leadingZero: 'Leading zeros are ambiguous (some systems read them as octal): write {fixed}',
    octetRange: '{octet} is not valid in an IP: each part goes from 0 to 255',
    prefix: 'The prefix /{prefix} does not exist: it goes from 0 to 32',
    badMask: 'The mask is not valid: its ones must be contiguous',
    ipv6: 'IPv6 is not included yet',
    copyNetwork: 'Copy network',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/cidr/content.es.md`:
```md
## Cómo funciona

Escribe una dirección IPv4 con su prefijo (`192.168.1.10/24`) o con su máscara (`192.168.1.10 255.255.255.0`). La herramienta calcula la **red**, la **máscara** y la máscara comodín, la dirección de **broadcast**, el primer y el último host, cuántos hosts se pueden usar y cuántas direcciones hay en total. También muestra la máscara en binario, para ver dónde acaba la parte de red.

La red se obtiene con un AND entre la IP y la máscara, y el broadcast poniendo a uno los bits de host. En una red normal se reservan la primera y la última dirección, así que una `/24` tiene 254 hosts útiles. Las `/31` son la excepción (RFC 3021): se usan en enlaces punto a punto, no tienen broadcast y las dos direcciones sirven. Una `/32` es un único equipo.

## Tipo de dirección

Además verás si la IP es **privada** (10/8, 172.16/12 y 192.168/16), de CGNAT, loopback, enlace local, de documentación, multicast, reservada o pública, y su clase histórica (A a E), que hoy solo es informativa. Los ceros a la izquierda (`010`) se rechazan porque algunos sistemas los leen en octal.
```

`src/tools/cidr/content.en.md`:
```md
## How it works

Type an IPv4 address with its prefix (`192.168.1.10/24`) or its mask (`192.168.1.10 255.255.255.0`). The tool works out the **network**, the **mask** and wildcard mask, the **broadcast** address, the first and last host, how many hosts are usable and how many addresses there are in total. It also shows the mask in binary, so you can see where the network part ends.

The network is the IP ANDed with the mask, and the broadcast sets every host bit to one. A normal network reserves its first and last addresses, so a `/24` has 254 usable hosts. `/31` networks are the exception (RFC 3021): they are used for point-to-point links, have no broadcast and both addresses are usable. A `/32` is a single host.

## Address type

You also see whether the IP is **private** (10/8, 172.16/12 and 192.168/16), CGNAT, loopback, link-local, documentation, multicast, reserved or public, and its historic class (A to E), which today is only informative. Leading zeros (`010`) are rejected because some systems read them as octal.
```

- [ ] **Step 8: `src/tools/cidr/Cidr.svelte`**

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { parseCidr, toBinary, toDotted, type CidrError } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('cidr', '', meta.rememberInput ?? true);

  const result = $derived(parseCidr(input.value));
  const nf = $derived(new Intl.NumberFormat(locale));

  function errorText(e: CidrError): string {
    switch (e.kind) {
      case 'empty':
        return '';
      case 'ipv6':
        return s.ipv6;
      case 'format':
        return s.format;
      case 'leading-zero':
        return fill(s.leadingZero, { fixed: e.fixed });
      case 'octet-range':
        return fill(s.octetRange, { octet: e.octet });
      case 'prefix':
        return fill(s.prefix, { prefix: e.prefix });
      case 'mask':
        return s.badMask;
    }
  }

  const error = $derived(result.ok ? '' : errorText(result.error));
  const rows = $derived.by(() => {
    if (!result.ok) return [];
    const n = result.subnet;
    return [
      { label: s.ip, value: toDotted(n.ip) },
      { label: s.network, value: `${toDotted(n.network)}/${n.prefix}` },
      { label: s.mask, value: toDotted(n.mask) },
      { label: s.wildcard, value: toDotted(n.wildcard) },
      { label: s.broadcast, value: n.broadcast === null ? s.none : toDotted(n.broadcast) },
      { label: s.first, value: toDotted(n.firstHost) },
      { label: s.last, value: toDotted(n.lastHost) },
      { label: s.usable, value: nf.format(n.usable) },
      { label: s.total, value: nf.format(n.total) },
      { label: s.binary, value: toBinary(n.mask) },
      { label: s.type, value: s[n.type] },
      { label: s.class, value: n.ipClass },
    ];
  });
  const networkText = $derived(
    result.ok ? `${toDotted(result.subnet.network)}/${result.subnet.prefix}` : '',
  );
</script>

<div class="panel">
  <Field
    id="cidr-input"
    label={s.input}
    help={result.ok && result.assumed32 ? s.assumed32 : s.help}
    error={error || undefined}
  >
    {#snippet children({ describedby })}
      <input
        id="cidr-input"
        class="control mono"
        bind:value={input.value}
        placeholder={s.placeholder}
        inputmode="decimal"
        aria-describedby={describedby}
        aria-invalid={!!error}
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
      />
    {/snippet}
  </Field>

  <Display live label={s.result}>
    {#snippet head()}
      <Led
        state={result.ok ? 'ok' : error ? 'bad' : 'idle'}
        label={result.ok ? networkText : t(locale, error ? 'led.bad' : 'led.idle')}
      />
    {/snippet}
    {#if rows.length}
      <dl class="display-kv">
        {#each rows as r (r.label)}
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        {/each}
      </dl>
    {:else}
      <p class="display-note">{error || s.empty}</p>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={networkText} {locale} label={s.copyNetwork} />
    <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}
      >{t(locale, 'ui.clear')}</Button
    >
  </div>
  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
</div>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as cidr } from './cidr/meta';
```
→
```ts
import { meta as cidr } from './cidr/meta';
```
y
```ts
  // cidr,
```
→
```ts
  cidr,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Cidr from '../tools/cidr/Cidr.svelte';
```
→
```astro
import Cidr from '../tools/cidr/Cidr.svelte';
```
y
```astro
{/* {id === 'cidr' && <Cidr client:load locale={locale} />} */}
```
→
```astro
{id === 'cidr' && <Cidr client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/calculadora-subredes-cidr.html dist/en/cidr-subnet-calculator.html
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `cidr` y sus dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador (desechable, puerto 4683)**

Crea `.check-cidr.mjs` en la raíz del worktree:
```js
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4683';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));

await page.goto(`${BASE}/es/calculadora-subredes-cidr`);
const value = (label) => page.locator(`.display-kv dt:text-is("${label}") + dd`).innerText();
await page.locator('#cidr-input').fill('192.168.1.10/24');
assert.equal(await value('Broadcast'), '192.168.1.255');
assert.equal(await value('Hosts útiles'), '254');
assert.equal(await value('Tipo'), 'Privada (RFC 1918)');

await page.locator('#cidr-input').fill('10.0.0.7/31');
assert.equal(await value('Broadcast'), '—');
assert.equal(await value('Hosts útiles'), '2');

await page.locator('#cidr-input').fill('192.168.010.1/24');
assert.match(await page.locator('#cidr-input-error').innerText(), /escribe 10$/);

await browser.close();
assert.deepEqual(errors, []);
console.log('OK cidr');
```

Run:
```bash
./node_modules/.bin/astro preview --port 4683 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
until curl -sf -o /dev/null http://localhost:4683/es; do sleep 0.5; done
node .check-cidr.mjs
kill $PREVIEW
rm .check-cidr.mjs
```
Expected: la última línea es `OK cidr` y no hay ningún error de página. Si falla un paso, arregla el componente, no la comprobación.

A mano, con `pnpm preview`, en `/es/calculadora-subredes-cidr` y `/en/cidr-subnet-calculator`, primero en el tema claro y luego en oscuro y terminal, a 390 px y a 1280 px de ancho:
1. `192.168.1.10/24` → red `192.168.1.0/24`, broadcast `192.168.1.255`, hosts `.1`–`.254`, 254 útiles, «Privada (RFC 1918)» y clase C.
2. `10.0.0.7/31` → broadcast «—» y 2 útiles; `8.8.8.8` → aviso de `/32` y «Pública».
3. `192.168.1.10 255.255.240.0` → `/20`; `1.2.3.4 255.0.255.0` → el error de máscara.
4. `192.168.010.1/24` → «… escribe 10»; `2001:db8::/32` → «IPv6 todavía no está incluido».
5. En inglés, «Usable hosts» sale como `4,094` para `/20`; `c` copia `172.16.0.0/20`.

- [ ] **Step 12: Commit**

```bash
git add src/tools/cidr src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (tampoco `.check-cidr.mjs`, que ya se borró). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(cidr): calculadora de subredes IPv4 en CIDR"
```

---

### Task 14: Cierre: registro compacto, e2e del lote 3, librerías en su chunk, README y verificación completa

**Files:**
- Create: `scripts/compact-registry.mjs` y `.bundle-check.mjs` (temporales: se borran en la misma task)
- Modify: `src/tools/registry.ts`, `src/components/ToolIsland.astro`, `e2e/tools.spec.ts`, `e2e/smoke.spec.ts`, `README.md`

**Interfaces:**
- Consumes: las 13 herramientas fusionadas y el DOM que declara cada task en su bloque «Interfaces».
- Produces: nada nuevo para otras tareas. El sitio queda con las 52 herramientas en 8 categorías.

- [ ] **Step 1: Comprobar que las 13 ramas están fusionadas**

```bash
git switch feat/herramientas-lote-3
git log --oneline -20
grep -cE "^// import|^  // " src/tools/registry.ts
grep -cE "^// import|^\{/\*" src/components/ToolIsland.astro
pnpm install --frozen-lockfile && pnpm test
```
Expected: los 13 commits `feat(<id>): …` en el log, los dos `grep -c` dan `0` (no queda ninguna línea comentada) y los tests en verde. Si alguna herramienta falta, termina antes su task: esta no la sustituye.

- [ ] **Step 2: Compactar `registry.ts` y `ToolIsland.astro`**

Las dos líneas de comentario «Lote 3…» y las líneas en blanco solo servían para fusionar en paralelo. Como el contenido exacto de las entradas de los lotes anteriores depende de sus planes, se quitan con un script que no toca nada más y que falla si queda alguna línea comentada. Crea `scripts/compact-registry.mjs`:
```js
import { readFileSync, writeFileSync } from 'node:fs';

// Removes the lote 3 scaffolding: its two comment lines and the blank lines that kept the
// parallel branches apart. Everything else stays byte for byte.
const SCAFFOLD = /^\/\/ (Lote 3: each tool task|Keep the blank lines between them)/;

function compact(path, isAstro) {
  const lines = readFileSync(path, 'utf8').split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (SCAFFOLD.test(line)) continue;
    if (/^\/\/ import /.test(line) || /^ {2}\/\/ \w+,$/.test(line) || line.startsWith('{/*')) {
      throw new Error(`${path}:${i + 1} is still commented out: ${line}`);
    }
    const prev = out[out.length - 1] ?? '';
    const next = lines.slice(i + 1).find((l) => l.trim() !== '' && !SCAFFOLD.test(l)) ?? '';
    const isImport = (l) => l.startsWith('import ');
    const isEntry = (l) => /^ {2}\w+,$/.test(l);
    const isMount = (l) => isAstro && l.startsWith('{id === ');
    if (line.trim() === '') {
      if (isImport(prev) && isImport(next)) continue;
      if (isEntry(prev) && (isEntry(next) || next === '];')) continue;
      if (isMount(prev) && (isMount(next) || next === '')) continue;
    }
    out.push(line);
  }
  writeFileSync(path, out.join('\n').replace(/\n*$/, '\n'));
}

compact('src/tools/registry.ts', false);
compact('src/components/ToolIsland.astro', true);
```

```bash
node scripts/compact-registry.mjs
rm scripts/compact-registry.mjs
pnpm format
git diff src/tools/registry.ts src/components/ToolIsland.astro
```
Expected: el diff solo quita las 2 líneas de comentario y las líneas en blanco del lote 3 en cada archivo, y `pnpm format` no cambia nada más (comprobado). El final del bloque de imports de `registry.ts` queda así:
```ts
import { meta as password } from './password/meta';
import { meta as qr } from './qr/meta';
import { meta as slug } from './slug/meta';
import { meta as dataConvert } from './data-convert/meta';
import { meta as jsonDiff } from './json-diff/meta';
import { meta as markdown } from './markdown/meta';
import { meta as curl } from './curl/meta';
import { meta as queryString } from './query-string/meta';
import { meta as httpStatus } from './http-status/meta';
import { meta as cron } from './cron/meta';
import { meta as userAgent } from './user-agent/meta';
import { meta as semver } from './semver/meta';
import { meta as cidr } from './cidr/meta';
import type { Category, CategoryId, Locale, ToolMeta } from './types';
```
el final del array `tools`:
```ts
  password,
  qr,
  slug,
  dataConvert,
  jsonDiff,
  markdown,
  curl,
  queryString,
  httpStatus,
  cron,
  userAgent,
  semver,
  cidr,
];
```
el final de los imports de `ToolIsland.astro`:
```astro
import Password from '../tools/password/Password.svelte';
import Qr from '../tools/qr/Qr.svelte';
import Slug from '../tools/slug/Slug.svelte';
import DataConvert from '../tools/data-convert/DataConvert.svelte';
import JsonDiff from '../tools/json-diff/JsonDiff.svelte';
import Markdown from '../tools/markdown/Markdown.svelte';
import Curl from '../tools/curl/Curl.svelte';
import QueryString from '../tools/query-string/QueryString.svelte';
import HttpStatus from '../tools/http-status/HttpStatus.svelte';
import Cron from '../tools/cron/Cron.svelte';
import UserAgent from '../tools/user-agent/UserAgent.svelte';
import Semver from '../tools/semver/Semver.svelte';
import Cidr from '../tools/cidr/Cidr.svelte';
import type { Locale } from '../tools/types';
```
y el final de su plantilla:
```astro
{id === 'password' && <Password client:load locale={locale} />}
{id === 'qr' && <Qr client:load locale={locale} />}
{id === 'slug' && <Slug client:load locale={locale} />}
{id === 'data-convert' && <DataConvert client:load locale={locale} />}
{id === 'json-diff' && <JsonDiff client:load locale={locale} />}
{id === 'markdown' && <Markdown client:load locale={locale} />}
{id === 'curl' && <Curl client:load locale={locale} />}
{id === 'query-string' && <QueryString client:load locale={locale} />}
{id === 'http-status' && <HttpStatus client:load locale={locale} />}
{id === 'cron' && <Cron client:load locale={locale} />}
{id === 'user-agent' && <UserAgent client:load locale={locale} />}
{id === 'semver' && <Semver client:load locale={locale} />}
{id === 'cidr' && <Cidr client:load locale={locale} />}
```

Run: `pnpm test && pnpm check`
Expected: verde. `registry.test.ts` valida las 52 metas, sus slugs únicos y sus 104 archivos de contenido.

- [ ] **Step 3: e2e del lote 3**

**Primero, `e2e/smoke.spec.ts`.** Su test del catálogo busca el enlace «JSON» por nombre, y Playwright compara nombres por subcadena: con «JSON, YAML y CSV» y «Comparar JSON» en la Home encuentra tres enlaces y falla en modo estricto (pasó al escribir este plan: `lists every tool in the catalog` y `theme persists across reloads…`). Haz la búsqueda exacta:
```bash
sed -i "s/getByRole('link', { name: 'JSON' })/getByRole('link', { name: 'JSON', exact: true })/g" e2e/smoke.spec.ts
grep -n "name: 'JSON'" e2e/smoke.spec.ts
```
Expected: las dos líneas del `grep` terminan en `{ name: 'JSON', exact: true })`. Si un lote anterior ya las cambió, el `sed` no hace nada.

**Después, `e2e/tools.spec.ts`.** Al final del array `PAGES` (después de la última entrada, antes de `];`), añade:
```ts
  ['/es/generador-contrasenas', 'Contraseñas'],
  ['/es/generador-codigo-qr', 'Código QR'],
  ['/es/generador-slug', 'Slug'],
  ['/es/conversor-json-yaml-csv', 'JSON, YAML y CSV'],
  ['/es/comparar-json', 'Comparar JSON'],
  ['/es/vista-previa-markdown', 'Markdown'],
  ['/es/convertir-curl-a-fetch', 'cURL a fetch'],
  ['/es/conversor-query-string-json', 'Query string'],
  ['/es/codigos-estado-http', 'Códigos HTTP'],
  ['/es/explicar-expresion-cron', 'Cron'],
  ['/es/analizar-user-agent', 'User-Agent'],
  ['/es/comprobar-rango-semver', 'Semver'],
  ['/es/calculadora-subredes-cidr', 'Subredes CIDR'],
```

Y al final del archivo añade este bloque. Usa el `test` extendido (que ya falla ante cualquier error de página) y el helper `radio` que están arriba en el archivo; sus dos helpers propios van dentro del `describe` para no chocar con nombres de otros lotes.
```ts
// Lote 3: generadores, texto y datos, y referencia.
test.describe('lote 3: one real interaction per tool', () => {
  const storedValues = (page: Page) => page.evaluate(() => Object.values(localStorage));
  const storedKeys = (page: Page) => page.evaluate(() => Object.keys(localStorage));

  test('password generates the requested length and never stores it', async ({ page }) => {
    await page.goto('/es/generador-contrasenas');
    await page.locator('#password-length').fill('32');
    const pw = page.locator('.panel .pw').first();
    await expect(pw).toHaveText(/^.{32}$/);
    await expect(page.locator('.display-head')).toContainText('Fuerte');
    const value = await pw.textContent();
    await page.waitForTimeout(500);
    expect((await storedValues(page)).some((v) => v.includes(value!))).toBe(false);
  });

  test('qr draws the code, downloads PNG and SVG and never stores the WiFi password', async ({
    page,
  }) => {
    await page.goto('/es/generador-codigo-qr');
    await page.locator('#qr-text').fill('hola');
    await expect(page.locator('.display img')).toBeVisible();
    let download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar PNG' }).click();
    expect((await download).suggestedFilename()).toBe('qr.png');
    download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar SVG' }).click();
    expect((await download).suggestedFilename()).toBe('qr.svg');
    await radio(page, 'WiFi').click();
    await page.locator('#qr-ssid').fill('Casa');
    await page.locator('#qr-password').fill('s3cret');
    await expect(page.locator('.display img')).toBeVisible();
    await page.waitForTimeout(500);
    expect((await storedValues(page)).some((v) => v.includes('s3cret'))).toBe(false);
  });

  test('slug removes accents and punctuation', async ({ page }) => {
    await page.goto('/es/generador-slug');
    await page.locator('#slug-input').fill('¡Hola, Mundo! Año 2026');
    await expect(page.locator('.panel .slug')).toHaveText('hola-mundo-ano-2026');
  });

  test('data-convert detects CSV with ; and writes JSON and YAML', async ({ page }) => {
    await page.goto('/es/conversor-json-yaml-csv');
    await page.locator('#data-convert-input').fill('nombre;edad\nAna;34');
    await expect(page.getByText('Detectado: CSV (separador ;)')).toBeVisible();
    await expect(page.locator('.display-code')).toContainText('"nombre": "Ana"');
    await radio(page, 'YAML').click();
    await expect(page.locator('.display-code')).toContainText('nombre: Ana');
  });

  test('json-diff ignores key order and lists what changed', async ({ page }) => {
    await page.goto('/es/comparar-json');
    await page.locator('#json-diff-a').fill('{"a":1,"b":2}');
    await page.locator('#json-diff-b').fill('{"b":3,"a":1,"c":4}');
    await expect(page.getByText('1 añadida · 0 eliminadas · 1 cambiada')).toBeVisible();
    await expect(page.locator('.panel .changes .path')).toHaveText(['$.b', '$.c']);
  });

  test('markdown renders GFM and strips every script vector', async ({ page }) => {
    await page.goto('/es/vista-previa-markdown');
    await page
      .locator('#markdown-input')
      .fill(
        '# Hola\n\n<img src=x onerror="window.__xss=1">\n\n<script>window.__xss2=1</script>\n\n[x](javascript:alert(1)) <iframe src="https://example.com"></iframe>',
      );
    await expect(page.locator('.md-preview h1')).toHaveText('Hola');
    expect(await page.evaluate(() => '__xss' in window || '__xss2' in window)).toBe(false);
    await expect(page.locator('.md-preview script')).toHaveCount(0);
    await expect(page.locator('.md-preview [onerror]')).toHaveCount(0);
    await expect(page.locator('.md-preview a[href^="javascript"]')).toHaveCount(0);
    await expect(page.locator('.md-preview iframe')).toHaveCount(0);
    await radio(page, 'HTML').click();
    await expect(page.locator('.display-code')).toContainText('<h1');
    await expect(page.locator('.display-code')).not.toContainText('onerror');
    await expect(page.locator('.display-code')).not.toContainText('<script');
  });

  test('curl turns a POST with JSON into fetch and stores nothing', async ({ page }) => {
    await page.goto('/es/convertir-curl-a-fetch');
    await page
      .locator('#curl-input')
      .fill(
        `curl -X POST https://api.example.com/u -H 'Content-Type: application/json' -d '{"a":1}'`,
      );
    await expect(page.locator('.display-code')).toContainText("method: 'POST'");
    await expect(page.locator('.display-code')).toContainText('body: JSON.stringify(');
    await page.waitForTimeout(500);
    expect((await storedKeys(page)).filter((k) => k.includes('curl'))).toEqual([]);
  });

  test('query-string builds nested JSON and never saves credentials', async ({ page }) => {
    await page.goto('/es/conversor-query-string-json');
    await page.locator('#query-string-input').fill('?a=1&b=2&b=3&c[d]=x');
    await expect(page.locator('.display-code')).toContainText('"d": "x"');
    expect(JSON.parse(await page.locator('.display-code').innerText())).toEqual({
      a: '1',
      b: ['2', '3'],
      c: { d: 'x' },
    });
    await page.locator('#query-string-input').fill('?token=abc');
    await page.waitForTimeout(500);
    expect((await storedValues(page)).some((v) => v.includes('token=abc'))).toBe(false);
  });

  test('http-status finds codes by number and by word', async ({ page }) => {
    await page.goto('/es/codigos-estado-http');
    await page.locator('#http-status-search').fill('404');
    await expect(page.locator('.panel .code-row')).toHaveCount(1);
    await expect(page.locator('.panel .code-row')).toContainText('Not Found');
    await page.locator('#http-status-search').fill('teapot');
    await expect(page.locator('.panel .code-row .num')).toHaveText(['418']);
  });

  test('cron explains the expression and lists the next run in Madrid', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-09-28T06:00:00Z'));
    await page.goto('/es/explicar-expresion-cron');
    await page.locator('#cron-zone').selectOption('Europe/Madrid');
    await page.locator('#cron-expr').fill('30 9 * * 1-5');
    await expect(page.locator('.panel .explain')).toHaveText('A las 09:30, de lunes a viernes.');
    await expect(page.locator('.panel .runs .iso').first()).toHaveText('2026-09-28T07:30:00.000Z');
  });

  test('user-agent reads Firefox on Windows', async ({ page }) => {
    await page.goto('/es/analizar-user-agent');
    await page
      .locator('#user-agent-input')
      .fill('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0');
    const kv = page.locator('.panel .display-kv').first();
    await expect(kv).toContainText('Firefox 128.0');
    await expect(kv).toContainText('Windows 10');
    await expect(kv).toContainText('Gecko 128.0');
  });

  test('semver checks versions against a caret range', async ({ page }) => {
    await page.goto('/es/comprobar-rango-semver');
    await page.locator('#semver-range').fill('^1.2.3');
    await page.locator('#semver-versions').fill('1.2.3\n1.9.0\n2.0.0');
    await expect(page.getByText('2 de 3 cumplen')).toBeVisible();
    await expect(page.locator('.panel .display-kv')).toContainText('>=1.2.3 <2.0.0-0');
  });

  test('cidr works out /24 and point-to-point /31 networks', async ({ page }) => {
    await page.goto('/es/calculadora-subredes-cidr');
    await page.locator('#cidr-input').fill('192.168.1.10/24');
    const kv = page.locator('.panel .display-kv');
    await expect(kv).toContainText('192.168.1.255');
    await expect(kv).toContainText('254');
    await page.locator('#cidr-input').fill('10.0.0.7/31');
    await expect(kv.locator('dt:has-text("Hosts útiles") + dd')).toHaveText('2');
  });
});
```

Reglas de determinismo de la §9: cron fija el reloj con `page.clock.setFixedTime` y elige `Europe/Madrid` en el selector (la config de Playwright fija el idioma, no la zona); las contraseñas se comprueban por propiedades (longitud y LED), nunca por su valor; ninguna prueba sale a Internet (Markdown no carga la imagen externa porque el interruptor está desactivado, y el `iframe` se elimina antes de pintarse).

Run:
```bash
pnpm build && pnpm test:e2e
```
Expected: todos en verde (en la copia de verificación, sin los e2e de los lotes 1 y 2: 73 tests, de ellos 26 de este lote). Si falla un selector, compáralo con el bloque «Interfaces» de la task de esa herramienta; si falla el comportamiento, arregla el componente, no el test.

- [ ] **Step 4: Lista de herramientas en el README**

En `README.md`, en la tabla de `## Herramientas`, pon cada fila **después de la última fila de su categoría**, respetando el orden de `categories.ts` (Generadores, Codificación, Texto y datos, Identificadores, Conversores, Calculadoras, Azar, Referencia). Referencia no tiene filas todavía: sus cinco van al final de la tabla.

Generadores:
```md
| Generadores | Contraseñas seguras | [/es/generador-contrasenas](https://devtools.alvarotc.com/es/generador-contrasenas) |
| Generadores | Código QR (texto, URL y WiFi) | [/es/generador-codigo-qr](https://devtools.alvarotc.com/es/generador-codigo-qr) |
| Generadores | Slugs para URL | [/es/generador-slug](https://devtools.alvarotc.com/es/generador-slug) |
```
Texto y datos:
```md
| Texto y datos | JSON, YAML y CSV | [/es/conversor-json-yaml-csv](https://devtools.alvarotc.com/es/conversor-json-yaml-csv) |
| Texto y datos | Comparar JSON | [/es/comparar-json](https://devtools.alvarotc.com/es/comparar-json) |
| Texto y datos | Vista previa de Markdown | [/es/vista-previa-markdown](https://devtools.alvarotc.com/es/vista-previa-markdown) |
| Texto y datos | cURL a fetch | [/es/convertir-curl-a-fetch](https://devtools.alvarotc.com/es/convertir-curl-a-fetch) |
| Texto y datos | Query string y JSON | [/es/conversor-query-string-json](https://devtools.alvarotc.com/es/conversor-query-string-json) |
```
Referencia:
```md
| Referencia | Códigos de estado HTTP | [/es/codigos-estado-http](https://devtools.alvarotc.com/es/codigos-estado-http) |
| Referencia | Expresiones cron | [/es/explicar-expresion-cron](https://devtools.alvarotc.com/es/explicar-expresion-cron) |
| Referencia | User-Agent | [/es/analizar-user-agent](https://devtools.alvarotc.com/es/analizar-user-agent) |
| Referencia | Rangos semver | [/es/comprobar-rango-semver](https://devtools.alvarotc.com/es/comprobar-rango-semver) |
| Referencia | Subredes CIDR (IPv4) | [/es/calculadora-subredes-cidr](https://devtools.alvarotc.com/es/calculadora-subredes-cidr) |
```
Si la descripción de `package.json` o el párrafo de introducción del README enumeran herramientas, no los cambies: no es parte de este lote.

- [ ] **Step 5: Cada librería en su chunk (§10 de la spec)**

La §10 pide comprobar en `dist/_astro` que ninguna librería del lote aparece en los chunks de la Home ni de otras herramientas, y medir el JS inicial de la Home. Crea `.bundle-check.mjs` en la raíz (no se confirma):
```js
import { readFileSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

// Run from the repo root after `pnpm build`. With HOME_ONLY=1 it only measures the Home.
const read = (f) => readFileSync(`dist/_astro/${f}`, 'utf8');
const files = readdirSync('dist/_astro').filter((f) => f.endsWith('.js'));

// A string that only each library's own code contains, and the chunk it must live in.
const LIBS = {
  dompurify: ['ALLOWED_URI_REGEXP', 'Markdown.'],
  marked: ['walkTokens', 'Markdown.'],
  yaml: ['BLOCK_AS_IMPLICIT_KEY', 'DataConvert.'],
  'qrcode-generator': ['code length overflow', 'Qr.'],
  'ua-parser-js': ['Konqueror', 'UserAgent.'],
  semver: ['SEMVER_SPEC_VERSION', 'Semver.'],
};

let ok = true;
if (!process.env.HOME_ONLY) {
  for (const [lib, [sig, owner]] of Object.entries(LIBS)) {
    const hits = files.filter((f) => read(f).includes(sig));
    const wrong = hits.length !== 1 || !hits[0].startsWith(owner);
    if (wrong) ok = false;
    console.log(`${wrong ? 'MAL' : 'ok '} ${lib}: ${hits.join(', ') || '(no aparece)'}`);
  }
}

// JS the Home loads before any interaction: its scripts, its islands and their static imports.
const html = readFileSync('dist/es.html', 'utf8');
const queue = [
  ...html.matchAll(/(?:src|href|component-url|renderer-url)="\/_astro\/([^"]+\.js)"/g),
].map((m) => m[1]);
const home = new Set();
while (queue.length) {
  const f = queue.pop();
  if (home.has(f)) continue;
  home.add(f);
  for (const m of read(f).matchAll(/(?:import|from)\s*["']\.\/([^"']+\.js)["']/g)) queue.push(m[1]);
}
const gzip = [...home].reduce((n, f) => n + gzipSync(readFileSync(`dist/_astro/${f}`)).length, 0);
const libsInHome = [...home].filter((f) =>
  Object.values(LIBS).some(([sig]) => read(f).includes(sig)),
);
if (libsInHome.length) ok = false;
console.log(`Home: ${home.size} archivos JS, ${(gzip / 1024).toFixed(1)} KB gzip`);
console.log(`Librerías del lote en la Home: ${libsInHome.join(', ') || 'ninguna'}`);
if (!process.env.HOME_ONLY) console.log(ok ? 'BUNDLES OK' : 'BUNDLES MAL');
process.exit(ok ? 0 : 1);
```

Cada librería se busca por una cadena que solo está en su propio código (una clave de configuración, un código de error o un nombre de su base de datos), no por su nombre: la palabra «DOMPurify», por ejemplo, también sale en el texto de la FAQ de Markdown, que viaja con las metas.

```bash
pnpm build
node .bundle-check.mjs
```
Expected: seis líneas `ok`, cada librería en **un solo** archivo (`Markdown.<hash>.js` para `dompurify` y `marked`, `DataConvert.…` para `yaml`, `Qr.…`, `UserAgent.…` y `Semver.…`), «Librerías del lote en la Home: ninguna» y `BUNDLES OK`.

Para comparar el tamaño de la Home con el de antes del lote, mide `main` en un worktree temporal:
```bash
git worktree add ../devtools-medida-main main
cp .bundle-check.mjs ../devtools-medida-main/
(cd ../devtools-medida-main && pnpm install --frozen-lockfile && pnpm build && HOME_ONLY=1 node .bundle-check.mjs)
git worktree remove --force ../devtools-medida-main
rm .bundle-check.mjs
```
Expected: la Home de esta rama pesa como mucho **2 KB gzip más** que la de `main`: solo crecen las metas de las 13 herramientas, que usan la paleta y la búsqueda. Al escribir este plan, sobre el `main` sin los lotes 1 y 2, la medida daba 40,7 KB en `main` y 42,0 KB con este lote. **Ojo:** con esta forma de medir (scripts, islas hidratadas al cargar y sus imports estáticos, runtime de Svelte incluido) `main` ya supera los 30 KB de la §9 del spec de plataforma. Las tres islas de la Home (paleta de búsqueda, diálogo de atajos y avisos) usan `client:load`, así que cuentan de verdad como JS inicial (`grep -o 'client="[a-z]*"' dist/es.html | sort | uniq -c` da `3 client="load"`). No es cosa de este lote y no se arregla aquí: anótalo en el PR para que el autor decida si la medida del spec contaba otra cosa. Lo que este lote no puede hacer es meter una librería en la Home o subir más de 2 KB.

- [ ] **Step 6: Verificación completa**

```bash
pnpm install --frozen-lockfile
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css && pnpm test:e2e
ls dist/es/*.html | wc -l
grep -cE "^  [A-Za-z0-9]+,$" src/tools/registry.ts
grep -rnF '{@html ' src
git status --porcelain
```
Expected: todo en verde; los dos números valen `52` (una página por herramienta y por idioma); el `grep -rnF` lista una sola línea, `{@html html}` en `src/tools/markdown/Markdown.svelte`; y `git status` solo lista los archivos de esta task (ni `.bundle-check.mjs` ni `scripts/compact-registry.mjs`).

Las páginas nuevas responden `200` sin redirección:
```bash
./node_modules/.bin/astro preview --port 4684 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
until curl -sf -o /dev/null http://localhost:4684/es; do sleep 0.5; done
for u in /es/generador-contrasenas /en/password-generator /es/generador-codigo-qr /en/qr-code-generator \
         /es/vista-previa-markdown /en/markdown-preview /es/explicar-expresion-cron /en/cron-expression-explainer \
         /es/analizar-user-agent /en/user-agent-parser /es/calculadora-subredes-cidr /en/cidr-subnet-calculator; do
  printf '%s ' "$u"; curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:4684$u"
done
kill $PREVIEW
```
Expected: todas `200`.

Lighthouse, como en la Task 18 del Plan A, en `/es/vista-previa-markdown` y `/es/generador-codigo-qr`: las 4 categorías ≥ 95.

A mano, primero en el tema claro y luego en oscuro y terminal, a 390 px y a 1280 px de ancho, abre las 13 herramientas nuevas: sin scroll horizontal, resultados en la pantalla hundida, `c` copia el resultado principal donde lo hay y `1`/`2`/`3` cambian de pestaña en QR y Markdown. En la sidebar, Generadores tiene 6 herramientas, Texto y datos 9 y Referencia 5.

- [ ] **Step 7: Commits**

```bash
git add src/tools/registry.ts src/components/ToolIsland.astro
git commit -m "chore: compactar el registro de herramientas del lote 3"

git add e2e/tools.spec.ts e2e/smoke.spec.ts
git commit -m "test: e2e de las 13 herramientas del lote 3"

git add README.md
git commit -m "docs: herramientas del lote 3 en el README"
```

---

## Después de este plan

La rama `feat/herramientas-lote-3` tiene las 52 herramientas del subproyecto 2. El siguiente paso es revisarla entera, fusionarla en `main` y desplegar (superpowers:finishing-a-development-branch); eso lo decide el autor y no forma parte de este plan. Quedan anotados para él: la medida del JS inicial de la Home frente a los 30 KB (Task 14, Step 5) y que DOMPurify y `ua-parser-js` merecen atención de dependabot (§10 de la spec).

## Revisión contra la §8 del spec

Cada punto de las fichas del lote 3, con la task que lo cumple y lo que lo comprueba. «e2e» es el test de la Task 14; «Step 11» es la comprobación de navegador de la task.

| id | Punto de la ficha | Task | Comprobación |
|---|---|---|---|
| todas | Meta completa (título ≤ 65, descripción 51–160, slugs, icono, dos `content.*.md`) | 1–13 | `registry.test.ts` en el Step 10 de cada task y con las 52 en la Task 14 |
| todas | Resultado en `Display`, `Segmented main` solo con `meta.tabs`, un `CopyButton main` como mucho | 1–13 | Revisión del `.svelte` de cada task; QR y Markdown tienen `Segmented main`, el resto no |
| todas | Librería solo en su chunk (§5, §10) | 0, 2, 4, 6, 11, 12, 14 | `grep -l` del Step 10 de cada task con librería y `.bundle-check.mjs` en la Task 14 |
| `password` | Longitud 4–128 (20), cantidad 1–50 (1), cuatro conjuntos y ambiguos | 1 | `DEFAULT_OPTIONS`, `MIN/MAX_*`; tests `character sets` |
| `password` | Uno de cada conjunto + unión + `shuffle`, siempre `cryptoRng()` | 1 | Test de 1 000 contraseñas; el `.svelte` solo usa `cryptoRng` |
| `password` | Entropía y LED débil/aceptable/fuerte; 131,1 bits | 1 | Tests `entropy`; e2e «Fuerte» con 32 caracteres |
| `password` | Nunca se guardan las contraseñas; sí las opciones en `password.options` | 1 | Step 11 y e2e revisan `localStorage` |
| `password` | Errores sin conjuntos y longitud corta | 1 | Tests `validate`; Step 11 |
| `qr` | Pestañas Texto · URL · WiFi | 2 | `Segmented main` con `meta.tabs`; Step 11 y e2e cambian a WiFi |
| `qr` | URL con `https://` añadido y aviso, validada con `new URL()` | 2 | Tests `normalizeUrl` |
| `qr` | WiFi con escapes, `P` omitida en `nopass`, `H` si oculta | 2 | Tests `WiFi` |
| `qr` | UTF-8 como cadena binaria; `ñ` = `C3 B1` | 2 | Tests `encodes text as UTF-8 bytes…` y de emojis |
| `qr` | SVG con `white`/`black`, vista previa en `Display`, PNG por canvas con `cellSize`, SVG descargable | 2 | Test `toSvg`; Step 11 y e2e descargan `qr.png` y `qr.svg` |
| `qr` | Mensaje de capacidad con L/M/Q/H | 2 | Tests de capacidad; Step 11 con 1 200 eñes |
| `qr` | Recordar texto, URL y SSID; nunca la contraseña WiFi | 2 | Step 11 y e2e (`s3cret` no aparece) |
| `slug` | Mapa previo, `&`, NFKD, minúsculas, separador, extremos, longitud máxima | 3 | Tests `slugify` con los cinco ejemplos de la ficha; e2e |
| `slug` | «東京» → vacío con su mensaje | 3 | Test y Step 11 |
| `data-convert` | Entrada Automático/JSON/YAML/CSV y salida JSON · YAML · CSV | 4 | `Select` + `Segmented`; e2e cambia a YAML |
| `data-convert` | Detección en orden y «Detectado: CSV (separador ;)» | 4 | Test `detectFormat`; e2e |
| `data-convert` | YAML con varios documentos, anclas y error con línea y columna | 4 | Tests `readInput` de YAML |
| `data-convert` | CSV con cabecera y detección de tipos (`007` texto, vacío `null`) | 4 | Tests `readInput` de CSV |
| `data-convert` | Escritura JSON/YAML/CSV (unión de claves, aplanado, arrays como JSON, error de tabla, nota de tipos, aviso de claves con puntos) | 4 | Tests `writeOutput`; Step 11 |
| `data-convert` | Ida y vuelta con comillas, saltos y `;` | 4 | Test de ida y vuelta |
| `data-convert` | Descarga `datos.*` y debounce desde 100 KB | 4 | Step 11 descarga `datos.csv`; `shouldDebounce` |
| `json-diff` | Dos entradas con su error | 5 | Step 11 (`#json-diff-b-error`) |
| `json-diff` | Añadidas, eliminadas, cambiadas; orden de claves no cuenta; arrays por índice | 5 | Tests `diffJson`; e2e |
| `json-diff` | Rutas con `jsonPath`, símbolos `+ − ~`, JSON compacto a 120 caracteres | 5 | Tests de rutas y `preview` |
| `json-diff` | Resumen, filtro, LED de equivalentes, informe copiable | 5 | Test `reportText`; Step 11 |
| `json-diff` | Tope de 5000 con «… y N más» | 5 | Test del límite |
| `json-diff` | `1` = `1.0`, `null` ≠ `{}`, 10 000 niveles | 5 | Tests; Review Focus 5 |
| `markdown` | Pestañas Vista previa · HTML | 6 | `Segmented main`; e2e cambia a HTML |
| `markdown` | `marked` con `gfm`, sin `breaks`, síncrono | 6 | Tests `renderMarkdown` |
| `markdown` | DOMPurify con perfil HTML, `FORBID_TAGS` y hook (enlaces, checkbox, imágenes externas) | 6 | `sanitize.ts`; Step 11 (enlaces, checkbox, imagen bloqueada, sin petición externa) |
| `markdown` | Único `{@html}`, falla cerrado sin DOM, saneado en `$effect` con 150 ms | 6 | Test `fails closed…`; `grep -rnF '{@html ' src`; Review Focus 1 |
| `markdown` | Pintado en `Display` con `--disp-*` y reglas `:global` revisadas a mano | 6 | Step 11 a mano en los tres temas |
| `markdown` | e2e de saneado (`onerror`, `<script>`, `javascript:`, `<iframe>`) | 14 | e2e `markdown renders GFM and strips every script vector` |
| `curl` | Tokenizador de bash y error de Windows | 7 | Tests `tokenize` |
| `curl` | Todas las opciones de la tabla, cortas pegadas y agrupadas, desconocidas avisadas | 7 | Tests `parseCurl` |
| `curl` | Método, `Content-Type` por defecto, `-H` repetido con aviso | 7 | Tests `parseCurl` |
| `curl` | Salida sin valores por defecto, comillas escapadas, claves entre comillas, `JSON.stringify`, `FormData` | 7 | Tests `toFetch`; e2e |
| `curl` | `rememberInput: false` | 7 | `meta`; Step 11 y e2e revisan `localStorage` |
| `query-string` | Dirección automática o fijada | 8 | `Segmented` secundario; test `detectDirection` |
| `query-string` | URL o texto tras `?`, `#` fuera, `+`, `%` rotos avisados, corchetes, repetidas, tipos opcionales, `Object.create(null)` | 8 | Tests `queryToJson`; Review Focus 4 |
| `query-string` | JSON → query con objeto arriba, `null`, arrays, anidados, `encodeURIComponent`, `+` opcional | 8 | Tests `jsonToQuery` |
| `query-string` | Tabla de pares decodificados | 8 | Step 11 (`.pairs`) |
| `query-string` | `shouldSave` que no guarda credenciales | 8 | Test `hasSensitiveKey`; Step 11 y e2e |
| `http-status` | Tabla completa con frase, nombre ES, descripción ES/EN, cuándo y RFC | 9 | Tests de la tabla |
| `http-status` | Búsqueda por prefijo o texto sin tildes; filtro por familia | 9 | Tests `searchCodes`; e2e |
| `http-status` | `#404` resalta el código | 9 | Test `codeFromHash`; Step 11 con `#451` |
| `http-status` | Copiar el código de cada fila; recordar la búsqueda | 9 | `CopyButton compact` por fila; `persistedInput('http-status')` |
| `cron` | Expresión, zona (por defecto la del navegador) y 1–20 ejecuciones | 10 | Step 11 (zona por defecto y cambio a Madrid) |
| `cron` | Parser completo con nombres, macros y `@reboot` | 10 | Tests `parseCron` |
| `cron` | Los cinco errores de la ficha | 10 | Tests `errors say what is wrong…` |
| `cron` | Regla de Vixie para los dos campos de día | 10 | Tests OR y AND |
| `cron` | Explicación con los cinco textos exactos ES/EN | 10 | Test `matches the spec examples exactly…`; e2e |
| `cron` | Próximas ejecuciones, hueco de marzo, hora repetida de octubre, «nunca», 29 de febrero | 10 | Tests `nextRuns` y `resolveWallTime`; Review Focus 2; e2e con reloj fijo |
| `cron` | Lista con fecha local, relativa e ISO copiable; recordar expresión y zona | 10 | Step 11; `persistedInput('cron')` y `('cron-zone')` |
| `user-agent` | Relleno con `navigator.userAgent` y «Usar el de este navegador» | 11 | Step 11 |
| `user-agent` | `ua-parser-js` 1.x y test de versión | 0, 11 | Instalación con `@^1.0.41`; Review Focus 3 |
| `user-agent` | Navegador, motor, sistema, dispositivo («Escritorio (probable)»), CPU, bots | 11 | Tests `parseUserAgent`; e2e |
| `user-agent` | Client Hints de baja entropía con el UA propio | 11 | Test `formatBrands`; Step 11 en Chromium |
| `user-agent` | Nota del UA congelado; «No se ha reconocido ningún navegador»; 2 KB | 11 | `.note` fija; tests |
| `semver` | Importaciones sueltas de `semver` | 12 | `logic.ts`; `grep -l` del Step 10 |
| `semver` | LED por versión o error de versión | 12 | Tests `checkVersions`; Step 11 |
| `semver` | Rango normalizado y lectura en palabras | 12 | Tests `checkRange` y `describeRange`; e2e |
| `semver` | Más alta que cumple y mínima del rango; «Incluir prereleases»; chuleta; error de rango | 12 | Tests `highest` y de prereleases; Step 11 |
| `cidr` | Formatos de entrada, IP sola como `/32` con aviso | 13 | Tests `parseCidr` |
| `cidr` | Validación (ceros a la izquierda, prefijo, máscara, IPv6) | 13 | Tests; Step 11 |
| `cidr` | Cálculo en 32 bits sin signo, `/31` y `/32`, los tres vectores | 13 | Tests `subnet math`; e2e |
| `cidr` | `Display kv` completo, tipo y clase | 13 | Tests de tipos y clases; Step 11 |

Sin puntos recortados. Desviaciones y decisiones que conviene conocer:

- **`parseCsv` devuelve códigos, no textos** (Task 0): `CsvWarning` es `{ row, columns, expected }` y el error es `'unclosed-quote'`, en vez de los `string` de la §4.3, para que `src/lib/` no dependa del idioma. `data-convert` los traduce.
- **El saneado de Markdown no tiene test unitario con DOM**: Vitest corre en `node` y añadir `jsdom` sería una dependencia fuera de la §5. El test unitario comprueba que `sanitize` falla cerrado y el saneado real (script, `onerror`, `javascript:`, `iframe`, `form`, `input`) se prueba en Chromium en el Step 11 de la Task 6 y en el e2e de la Task 14, que es lo que pide la §8.6.
- **YAML con claves de fusión** (`merge: true`): la ficha pide resolver anclas; `<<` es YAML 1.1, pero es lo que usan Docker Compose y GitHub Actions.
- **`http-status` cita la RFC 2295 para el 506**, que la lista de referencias de la ficha no nombra; es la que figura en el registro de IANA.
- **cURL sin esquema**: se añade `http://` como hace curl, con aviso. Las opciones desconocidas que llevan valor conocidas (`--proxy`, `--retry`, `-w`…) se saltan con su valor.
- **`slug`** mapea las mayúsculas especiales a mayúsculas (`Æ→AE`); con «Minúsculas» activado da lo mismo que la ficha.
- **`semver`**: `minVersion` no recibe `includePrerelease` (sus tipos no lo admiten y el resultado no cambia). El LED cuenta solo las líneas que son versiones válidas.
- **`cron`** añade chips de ejemplo (no están en la ficha; no cambian nada de lo pedido) y da la explicación en inglés con coma de Oxford, que es lo que produce `Intl.ListFormat('en')`.
- **`e2e/smoke.spec.ts`** cambia dos localizadores a `exact: true`: con este lote hay tres enlaces cuyo nombre contiene «JSON».
- **Color del texto de error dentro de `Display`**: la regla del kit pide `--bad-text`/`--ok-text` para el texto de error y de éxito. Se cumple sobre la superficie del panel (lo hace `Field`); dentro de la pantalla, que es oscura en los tres temas, se usan `--bad`/`--ok`, como ya hace el `CopyButton` compacto, porque `--bad-text` no pasa el contraste ahí (errores de fila en `semver` y `slug`, símbolos `+`/`−` de `json-diff`).
- **JS inicial de la Home**: con la medida de la Task 14 (scripts, islas hidratadas al cargar y sus imports) `main` ya pasa de los 30 KB del spec de plataforma. Este lote solo comprueba que no mete librerías en la Home y que no sube más de 2 KB, y lo deja anotado para el autor.
