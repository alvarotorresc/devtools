# DevTools herramientas nuevas, lote 2 (conversores, azar y calculadoras) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir las 14 herramientas del lote 2 del subproyecto 2: 5 conversores (`units`, `currency`, `px-rem`, `chmod`, `file-size`), 4 de azar (`wheel`, `shuffle`, `teams`, `dice`) y 5 calculadoras (`iva`, `irpf`, `percent`, `rule-of-three`, `workdays`), y abrir la categoría nueva **Calculadoras** (`calc`). Tras este lote el sitio tiene 39 herramientas.

**Architecture:** Igual que el Plan B y el lote 1. Cada herramienta es una carpeta autocontenida `src/tools/<id>/` con `logic.ts` puro y testeado, `meta.ts`, `strings.ts`, `content.es.md`, `content.en.md` y su isla `<Nombre>.svelte`, hecha solo con el kit de UI. La Task 0 añade lo compartido: la categoría `calc`, `src/lib/numbers.ts` (lectura de números con coma o punto, formato con `Intl` y redondeo al céntimo), 16 iconos, la clave `ui.swap` y las líneas **pre-sembradas y comentadas** de las 14 herramientas en `src/tools/registry.ts` y `src/components/ToolIsland.astro`, **después** de las entradas que dejó compactadas el lote 1. Cada task de herramienta solo descomenta sus 4 líneas, así que las 14 ramas se fusionan sin conflictos. La Task 15 compacta esos dos archivos, añade los e2e del lote, actualiza el README y hace la verificación completa.

**Tech Stack:** Astro 7.3, @astrojs/svelte 9, Svelte 5.57 (runes), TypeScript 6, @lucide/svelte 1.48, Vitest 5, Playwright 1.63. **Sin dependencias nuevas**: `Intl.NumberFormat`, `Intl.DisplayNames`, `Intl.ListFormat`, `Intl.DateTimeFormat`, `<canvas>` 2D, `fetch` y `crypto.getRandomValues` (a través de `src/lib/random.ts` del lote 1).

**Spec:** `docs/superpowers/specs/2026-09-26-devtools-herramientas-nuevas-design.md` (§1–§5 convenciones y añadidos compartidos; **§7 fichas del lote 2, vinculantes**; §9 tests y e2e; §10 riesgos; §11 fuera de alcance; §12 decisiones). Plan de referencia para el formato y el patrón: `docs/superpowers/plans/2026-09-26-plataforma-b.md`.

**Orden de ejecución:**

1. **Task 0**, sola, sobre `main` con el **lote 1 ya fusionado** (rama `feat/herramientas-lote-2` creada desde ese `main`).
2. **Tasks 1–14 en paralelo**, cada una en su propio worktree y rama (`lote-2/<id>`) creada desde el commit de la Task 0.
3. Fusionar las 14 ramas en `feat/herramientas-lote-2` (ver «Cómo fusionar» más abajo).
4. **Task 15**, sola, sobre la rama con todo fusionado.

**Cómo se verificó este plan antes de escribirlo:** en una copia del repositorio con el estado que deja el lote 1 reconstruido desde la spec (`src/lib/random.ts` según la §4.2, las claves `ui.seed`, `ui.seedHelp`, `ui.quantity` y `ui.testOnly` y los 11 iconos del lote 1) se aplicó la Task 0 y se escribieron los 14 conjuntos de archivos de este plan, byte a byte. Resultado: `pnpm format` sin cambios, `pnpm lint` y `pnpm check` sin errores ni avisos nuevos, `pnpm test` en verde (439 tests: 124 de las 14 herramientas y 11 de `numbers`), `pnpm build` con 28 páginas por idioma (14 antiguas + 14 nuevas; sin el lote 1), `pnpm check:css` en verde y `pnpm test:e2e` con **79 tests en verde**, incluidos los 32 que añade la Task 15 (14 cargas de página y 18 interacciones). Las 14 comprobaciones de navegador de los Steps 11 pasaron contra `astro preview`, la ruleta con el giro real (≈ 7,3 s). Todos los vectores numéricos de los tests se comprobaron antes con Node. Los tests que usan semilla comprueban **propiedades** (misma semilla → mismo resultado, permutación, rango), no secuencias concretas, para no depender de los detalles internos del `seededRng` real del lote 1. Si algo falla al ejecutar, lo más probable es que el lote 1 se haya desviado de la §4.2 de la spec: adapta la herramienta al código real y dilo en el mensaje del commit.

## Global Constraints

- Node `>=22.12.0`. `package.json` lleva `"packageManager": "pnpm@10.30.2"`. CI con Node 22.
- TypeScript **`^6`**: nunca `pnpm add typescript` sin versión, porque instala la 7 y rompe los peer deps de `@astrojs/check` y `@astrojs/svelte`. Este lote no instala nada.
- Astro 7 usa un compilador en Rust: **toda etiqueta no vacía se cierra** y no se anida HTML inválido (nada de `<div>` dentro de `<p>` ni de `<a>` dentro de `<a>`).
- Astro 7 usa `compressHTML: 'jsx'`: el espacio entre elementos en línea puede desaparecer. Los separadores se escriben con `{' / '}` o se separan con `gap` de CSS.
- **No** se activa la opción `i18n` de Astro. El i18n es manual: rutas `[locale]/…`.
- Tema en `<html data-theme>`. **El tema por defecto es el claro** (`:root` y `:root[data-theme='light']` en `tokens.css`); oscuro y terminal son alternativos. Las capturas y comprobaciones a mano se hacen primero en claro.
- `astro preview` en v7 es un demonio con archivo de bloqueo: usa siempre `--ignore-lock`. Para las comprobaciones de navegador de cada task se arranca con `./node_modules/.bin/astro preview --port <puerto> --ignore-lock &` y se para con `kill $PREVIEW` (el script de `.bin` hace `exec node`, así que el PID es el del servidor; **no** uses `pkill -f`, que puede matar tu propia shell).
- Hosting: **Netlify**, `build.format: 'file'` + `trailingSlash: 'never'`: `/es/x` → `es/x.html` con `200`.
- Antes de cada `pnpm lint`, ejecuta `pnpm format`. El código de este plan ya sale formateado con el Prettier del repo.
- `logic.ts` de cada herramienta es puro: sin `document`, `window`, `localStorage`, `fetch` ni `crypto` global dentro de las funciones que se testean. El azar entra como `Rng` y la hora como parámetro. Se testea en el entorno `node` de Vitest.
- Todo número aleatorio sale de `src/lib/random.ts` (lote 1): `cryptoRng`, `rngFromSeed`, `randInt`, `shuffle`. **Nunca `Math.random`.**
- Números con formato local: los campos numéricos se leen con `parseDecimal` y se muestran con `formatNumber` o `formatMoney` de `src/lib/numbers.ts` (Task 0). Excepción: `px-rem`, que siempre muestra punto decimal (§7.3).
- Ningún componente usa colores hex: todo sale de las variables de `src/styles/tokens.css`. Los canvas leen los tokens con `getComputedStyle`.
- Claves de almacenamiento con prefijo `devtools:`. Todo acceso pasa por `src/lib/storage.ts` (o por `persistedInput`, que lo usa).
- Textos de interfaz en sentence case. Los errores dicen qué pasa y cómo arreglarlo. Los estados vacíos dan una instrucción concreta.
- Commits con el formato del repo (`feat:`, `chore:`, `test:`, `docs:`). **Sin trailers ni atribución a IA**: ni `Co-Authored-By`, ni `Claude-Session`, ni «Generated with». El mensaje es solo el asunto y, si hace falta, un cuerpo explicativo.
- Atajos: cada vista tiene **como mucho un** `CopyButton main`; las herramientas con `meta.tabs` (`units`, `dice`, `percent`, `rule-of-three`) tienen **exactamente un** `Segmented main` con esas etiquetas, fuera del `.panel` (como en UUID). Los `Segmented` secundarios no llevan `main`.
- En componentes, **ninguna variable se llama `state`**. Los estados con tipo unión o nullable se declaran como `$state<T>(…)`.
- **Nunca `{@html}`** en este lote.

Reglas del kit (vinculantes, comprobadas en `src/ui/` de `main`):

- **Selectores de tema** en el CSS de un componente: siempre `:global([data-theme='…']) .clase`, nunca `[data-theme='…']` a secas (Svelte lo marcaría como no usado y lo quitaría).
- **CSS de subcomponentes que solo se montan en el cliente**: vive en el padre, bajo `:global(...)`. Si no, el build de producción lo descarta y `pnpm check:css` falla. En este lote ninguna herramienta tiene subcomponentes: la rejilla de chmod y el lienzo de la ruleta están dentro de `Chmod.svelte` y `Wheel.svelte`, que se pintan en SSR.
- **Objetivos táctiles de 44 px** con `@media (pointer: coarse)` en todo control propio (casillas de chmod, etiquetas clicables). Los del kit ya lo cumplen.
- **Texto de error o de éxito** sobre la superficie clara: `var(--bad-text)` y `var(--ok-text)`, nunca `--bad`/`--ok` (no pasan contraste como texto; son para LEDs y bordes).
- **`CopyButton`**: props reales `value`, `locale`, `main`, `compact`, `label`, `ariaLabel` y `disabled`. Cuando varias filas comparten etiqueta, cada copiar lleva su `ariaLabel` («Copiar en km»). Un `value` vacío ya lo desactiva; `disabled` es para desactivarlo con valor.
- `Segmented`, `Select`, `NumberInput`, `TextArea` y `Toggle` exponen `value`/`checked` con `$bindable`. Para guardar en un `persistedInput` que almacena texto se usan *function bindings*: `bind:value={() => n, (v) => (store.value = String(v))}`.
- `TextArea` **no** tiene prop `disabled`: para desactivarlo se envuelve en `<fieldset disabled>`.
- `persistedInput(id, initial, remember, shouldSave?)` guarda **solo texto**. Varios campos = varios `persistedInput`, con ids `<id>` y `<id>-<campo>`, y un único interruptor «Recordar lo que escribo» que cambia todos (patrón de Diff).
- `Display` recibe `label`, `live` y los snippets `head` y `children`. El snippet `head` tiene que ser hijo directo del componente (no dentro de un `{#if}`).

Añadidas para las tasks paralelas:

- **Las tasks de herramienta (1–14) se ejecutan en paralelo, en worktrees separados.** Cada una toca solo su carpeta `src/tools/<id>/`, más **dos líneas descomentadas en `src/tools/registry.ts`** (import y entrada) y **dos en `src/components/ToolIsland.astro`** (import y montaje). Nada más: ni `src/i18n/*.ts`, ni `src/ui/`, ni `src/lib/`, ni `categories.ts`, `types.ts`, `icon-names.ts`, `icons.ts`, `package.json` o `e2e/`. No borres las líneas en blanco que separan las líneas pre-sembradas.
- Si una herramienta necesitara algo compartido que no está en la Task 0 ni en el lote 1, **para y avisa**.
- Cada worktree empieza con `pnpm install --frozen-lockfile`.
- Commits de herramienta con rutas explícitas: `git add src/tools/<id> src/tools/registry.ts src/components/ToolIsland.astro`. Nunca `git add src` ni `git add .`. Antes de confirmar, `git status --porcelain` solo puede listar esas rutas.
- Las tasks de herramienta verifican con `pnpm format`, `pnpm lint`, `pnpm check`, `pnpm test`, `pnpm build` y `pnpm check:css`, más una **comprobación de navegador desechable** con Playwright en **un puerto propio** (4651–4664, uno por task; nunca 4642, que es el de `pnpm test:e2e`, ni 4321). **No** ejecutan `pnpm test:e2e`: los e2e del lote los añade la Task 15.
- La comprobación de navegador es un archivo `.check-<id>.mjs` en la raíz del worktree que se borra al terminar. No se confirma nunca.
- **e2e en el puerto 4642** (`playwright.config.ts`, `reuseExistingServer: false`): no dejes nada escuchando en ese puerto antes de `pnpm test:e2e`.
- Antes de escribir el `.svelte`, abre los componentes reales de `src/ui/` que uses. Este plan se escribió contra el kit de `main` del 2026-09-27; si alguna prop ha cambiado, adapta el componente y dilo en el commit.

## Review Focus

1. **Leer números con coma o punto sin confundir decimales y miles.** `1.234` es 1234 en español y 1,234 en inglés; `1.234,56` es 1234,56 en los dos; y en px-rem `0.875` tiene que ser 0,875 aunque la página esté en español (con las reglas de `es` sería 875). → Tests `groups thousands with the locale separator followed by exactly 3 digits` y `uses the last mark as decimal when both appear` en la Task 0, y `reads a dot or a comma as the decimal mark, never as thousands` en la Task 3.
2. **IRPF al revés: líquidos que ninguna base alcanza.** Con IVA e IRPF redondeados por separado, 1,03 € al 21 % / 15 % no sale con ninguna base; la herramienta usa la más cercana y, en empate, la menor (0,96 €), y todas las bases de 0,01 a 50 € van y vuelven exactas. → Tests `picks the closest base, the smallest on a tie, when no base is exact` y `round-trips every base from 0.01 € to 50 €` en la Task 11.
3. **La ruleta cae siempre en el ganador elegido y el muelle termina a tiempo.** El ganador se decide antes de animar; en 10 000 giros con semilla el sector bajo el puntero es el ganador, y el muelle (`k = 3`, `c = 3,2`) converge antes de 8 s simulados incluso con la distancia máxima, sobrepasando menos del 1 %. → Tests `always lands on the winner in 10 000 seeded spins`, `converges before 8 simulated seconds, even for the longest spin` y `overshoots by less than 1 % of the distance` en la Task 6.
4. **Días hábiles: Pascua, Viernes Santo y cambios de hora.** Enero de 2026 = 20 hábiles, abril (con Viernes Santo el día 3) = 21 y el año entero = 254; un rango que cruza el cambio de hora no gana ni pierde días. → Tests `counts January 2026: 31 days, 20 business days`, `counts April 2026 (Good Friday) and the whole of 2026` y `never gains or loses a day across a DST change` en la Task 14.
5. **Divisas: solo datos públicos, respuesta validada y sin conexión controlada.** La URL es la de la spec sin parámetros, cualquier respuesta con otra forma se trata como error, la caché se renueva a las 6 h y, sin red, se usan los tipos guardados con aviso. → Tests `points at the v1 URL with no query string`, `rejects anything with an unexpected shape` y `goes stale after 6 hours` en la Task 2, y e2e `currency falls back to the saved rates when the download fails` en la Task 15 (que además aborta toda petición a `api.frankfurter.dev`).

---

## File Structure

```
src/lib/numbers.ts  numbers.test.ts    → parseDecimal, formatNumber, formatMoney, roundCents        [Task 0]
src/tools/types.ts  categories.ts      → categoría calc entre conv y rand                          [Task 0]
src/tools/icon-names.ts  icons.ts      → +16 iconos                                                [Task 0]
src/i18n/es.ts  en.ts                  → +1 clave (ui.swap)                                         [Task 0]
src/tools/registry.ts                  → líneas pre-sembradas (Task 0), compactado (Task 15)
src/components/ToolIsland.astro        → líneas pre-sembradas (Task 0), compactado (Task 15)
src/tools/units/         {logic,logic.test,meta,strings}.ts Units.svelte content.{es,en}.md   [Task 1]
src/tools/currency/      {logic,logic.test,meta,strings}.ts Currency.svelte content.{es,en}.md   [Task 2]
src/tools/px-rem/        {logic,logic.test,meta,strings}.ts PxRem.svelte content.{es,en}.md   [Task 3]
src/tools/chmod/         {logic,logic.test,meta,strings}.ts Chmod.svelte content.{es,en}.md   [Task 4]
src/tools/file-size/     {logic,logic.test,meta,strings}.ts FileSize.svelte content.{es,en}.md   [Task 5]
src/tools/wheel/         {logic,logic.test,meta,strings}.ts Wheel.svelte content.{es,en}.md   [Task 6]
src/tools/shuffle/       {logic,logic.test,meta,strings}.ts Shuffle.svelte content.{es,en}.md   [Task 7]
src/tools/teams/         {logic,logic.test,meta,strings}.ts Teams.svelte content.{es,en}.md   [Task 8]
src/tools/dice/          {logic,logic.test,meta,strings}.ts Dice.svelte content.{es,en}.md   [Task 9]
src/tools/iva/           {logic,logic.test,meta,strings}.ts Iva.svelte content.{es,en}.md   [Task 10]
src/tools/irpf/          {logic,logic.test,meta,strings}.ts Irpf.svelte content.{es,en}.md   [Task 11]
src/tools/percent/       {logic,logic.test,meta,strings}.ts Percent.svelte content.{es,en}.md   [Task 12]
src/tools/rule-of-three/ {logic,logic.test,meta,strings}.ts RuleOfThree.svelte content.{es,en}.md   [Task 13]
src/tools/workdays/      {logic,logic.test,meta,strings}.ts Workdays.svelte content.{es,en}.md   [Task 14]
e2e/tools.spec.ts                      → 14 páginas nuevas y 18 interacciones                       [Task 15]
README.md                              → 14 filas en la tabla de herramientas                      [Task 15]
```

| Task | id | Nombre (h1) | Slug ES | Slug EN | Rama | Puerto de la comprobación |
|---|---|---|---|---|---|---|
| 1 | `units` | Unidades | `conversor-unidades` | `unit-converter` | `lote-2/units` | 4651 |
| 2 | `currency` | Divisas | `conversor-divisas` | `currency-converter` | `lote-2/currency` | 4652 |
| 3 | `px-rem` | px a rem | `conversor-px-rem` | `px-to-rem-converter` | `lote-2/px-rem` | 4653 |
| 4 | `chmod` | chmod | `calculadora-chmod` | `chmod-calculator` | `lote-2/chmod` | 4654 |
| 5 | `file-size` | Tamaños de archivo | `conversor-tamano-archivos` | `file-size-converter` | `lote-2/file-size` | 4655 |
| 6 | `wheel` | Ruleta | `ruleta-aleatoria` | `spin-the-wheel` | `lote-2/wheel` | 4656 |
| 7 | `shuffle` | Mezclar lista | `mezclar-lista-aleatoria` | `random-list-shuffler` | `lote-2/shuffle` | 4657 |
| 8 | `teams` | Equipos | `generador-equipos-aleatorios` | `random-team-generator` | `lote-2/teams` | 4658 |
| 9 | `dice` | Dados y moneda | `lanzar-dados-moneda` | `dice-roller-coin-flip` | `lote-2/dice` | 4659 |
| 10 | `iva` | IVA | `calculadora-iva` | `spanish-vat-calculator` | `lote-2/iva` | 4660 |
| 11 | `irpf` | Retención IRPF | `calculadora-retencion-irpf` | `spanish-irpf-withholding-calculator` | `lote-2/irpf` | 4661 |
| 12 | `percent` | Porcentajes | `calculadora-porcentajes` | `percentage-calculator` | `lote-2/percent` | 4662 |
| 13 | `rule-of-three` | Regla de tres | `regla-de-tres` | `rule-of-three-calculator` | `lote-2/rule-of-three` | 4663 |
| 14 | `workdays` | Días hábiles | `calculadora-dias-habiles` | `spanish-business-days-calculator` | `lote-2/workdays` | 4664 |

Ningún slug choca con los 25 existentes tras el lote 1 (lo comprueba `registry.test.ts`).

**Decisión sobre helpers compartidos.** La única pieza compartida nueva es `src/lib/numbers.ts`, que la spec asigna a este lote (§4.3) y usan 8 herramientas. **No** se añade un helper de caché de divisas en `src/lib/`: solo lo usa `currency`, la spec pone `parseRatesResponse` e `isStale` en `currency/logic.ts` (§7.2) y la escritura en `localStorage` ya la resuelven `readJSON`/`writeJSON` de `src/lib/storage.ts`.

## Cómo fusionar las Tasks 1–14

Cada task trabaja en `git worktree add ../devtools-l2-<id> -b lote-2/<id>` desde el commit de la Task 0. Al terminar las 14:

```bash
git switch feat/herramientas-lote-2
for id in units currency px-rem chmod file-size wheel shuffle teams dice iva irpf percent rule-of-three workdays; do
  git merge --no-ff --no-edit "lote-2/$id" || break
done
pnpm install --frozen-lockfile && pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build
```

No debería haber conflictos: cada rama cambia líneas distintas de `registry.ts` y `ToolIsland.astro`, separadas por una línea en blanco. Si aun así aparece uno en esos dos archivos, la resolución es conservar las dos líneas descomentadas. Cualquier conflicto fuera de ellos significa que una task tocó algo que no debía: revísala antes de seguir.

---

### Task 0: Prerrequisitos compartidos (sola, antes de las herramientas)

**Files:**
- Create: `src/lib/numbers.ts`, `src/lib/numbers.test.ts`
- Modify: `src/tools/types.ts`, `src/tools/categories.ts`, `src/tools/icon-names.ts`, `src/tools/icons.ts`, `src/i18n/es.ts`, `src/i18n/en.ts`, `src/tools/registry.ts`, `src/components/ToolIsland.astro`

**Interfaces:**
- Consumes: `main` con el lote 1 fusionado y compactado: `src/lib/random.ts` (§4.2: `type Rng`, `cryptoRng`, `seededRng`, `rngFromSeed`, `randInt`, `pick`, `shuffle`, `digits`, `randomBytesFrom`), las claves `ui.seed`, `ui.seedHelp`, `ui.quantity` y `ui.testOnly`, los 11 iconos del lote 1 y las 25 herramientas en `registry.ts` y `ToolIsland.astro` sin líneas comentadas.
- Produces:
  - `src/lib/numbers.ts`: `parseDecimal(input: string, locale: Locale): number | null`, `formatNumber(n: number, locale: Locale, maxFractionDigits = 10): string`, `formatMoney(n: number, locale: Locale, currency = 'EUR'): string`, `roundCents(n: number): number`. Lo usan `units`, `currency`, `px-rem`, `file-size`, `iva`, `irpf`, `percent` y `rule-of-three`.
  - `CategoryId` gana `'calc'`; `categories.ts` gana la categoría **Calculadoras** entre `conv` y `rand`.
  - `IconName` gana: `arrow-down-up`, `calculator`, `calendar-days`, `coins`, `dice-5`, `divide`, `ferris-wheel`, `hard-drive`, `lock`, `percent`, `receipt`, `receipt-text`, `ruler`, `scaling`, `shuffle`, `users`.
  - `UiKey` gana `ui.swap` («Intercambiar» / «Swap»), para el botón de divisas.
  - `registry.ts` y `ToolIsland.astro` con las dos líneas de cada herramienta del lote 2 comentadas, separadas por líneas en blanco, **después** de lo que ya había.

- [ ] **Step 1: Comprobar que el lote 1 está fusionado**

```bash
git switch main && git pull --ff-only
git switch -c feat/herramientas-lote-2
git status --short
test -f src/lib/random.ts || echo "FALTA src/lib/random.ts"
for f in cryptoRng seededRng rngFromSeed randInt shuffle; do
  grep -q "export function $f" src/lib/random.ts || echo "FALTA $f en random.ts"
done
grep -q "export type Rng" src/lib/random.ts || echo "FALTA el tipo Rng"
for k in ui.seed ui.seedHelp ui.quantity ui.testOnly; do
  grep -q "'$k'" src/i18n/es.ts || echo "FALTA la clave $k"
done
grep -q "from './mock/meta'" src/tools/registry.ts || echo "FALTA mock en el registro"
grep -nE "^// import|^\{/\*" src/tools/registry.ts src/components/ToolIsland.astro && echo "QUEDAN LÍNEAS COMENTADAS"
test -e src/lib/numbers.ts && echo "numbers.ts YA EXISTE"
grep -o "^  '[a-z0-9-]*'," src/tools/icon-names.ts | tr -d " '," > /tmp/iconos-ahora.txt
printf '%s\n' arrow-left-right barcode binary book-open braces building car case-sensitive check chevron-down chevron-right clock code code-xml copy credit-card database dices diff file-code fingerprint globe hash heart-pulse house id-card id-card-lanyard key-round keyboard landmark link map-pin menu moon palette panel-left-close panel-left-open phone pilcrow refresh-cw regex search sparkles star sun terminal triangle-alert x > /tmp/iconos-lote1.txt
diff /tmp/iconos-lote1.txt /tmp/iconos-ahora.txt && echo "ICONOS COMO ESPERA EL PLAN"
pnpm install --frozen-lockfile && pnpm test && pnpm check
```
Expected: `git status` vacío, ninguna línea `FALTA …`, `QUEDAN LÍNEAS COMENTADAS` ni `YA EXISTE`, la línea `ICONOS COMO ESPERA EL PLAN`, y tests y `check` en verde. Si falta algo del lote 1, **para**: este plan depende de él. Si solo difieren los iconos, no sustituyas los archivos del Step 6: añade a mano los 16 nombres nuevos en orden alfabético (y sus componentes en `icons.ts`); `pnpm check` falla si algo no cuadra.

- [ ] **Step 2: Tests de `numbers` (fallan)**

`src/lib/numbers.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { formatMoney, formatNumber, parseDecimal, roundCents } from './numbers';

const NBSP = String.fromCharCode(0xa0);
const NNBSP = String.fromCharCode(0x202f);

// Intl uses U+00A0 or U+202F before "€" depending on the ICU version: compare with plain spaces.
const plain = (s: string) => s.replace(/\s/g, ' ');

describe('parseDecimal', () => {
  it('reads a single comma or dot as the decimal mark', () => {
    expect(parseDecimal('1,5', 'es')).toBe(1.5);
    expect(parseDecimal('1.5', 'es')).toBe(1.5);
    expect(parseDecimal('1,5', 'en')).toBe(1.5);
    expect(parseDecimal('1.5', 'en')).toBe(1.5);
    expect(parseDecimal('0,875', 'es')).toBe(0.875);
  });

  it('groups thousands with the locale separator followed by exactly 3 digits', () => {
    expect(parseDecimal('1.234', 'es')).toBe(1234);
    expect(parseDecimal('1.234', 'en')).toBe(1.234);
    expect(parseDecimal('1,234', 'en')).toBe(1234);
    expect(parseDecimal('1,234', 'es')).toBe(1.234);
    expect(parseDecimal('1.2345', 'es')).toBe(1.2345);
  });

  it('uses the last mark as decimal when both appear', () => {
    expect(parseDecimal('1.234,56', 'es')).toBe(1234.56);
    expect(parseDecimal('1.234,56', 'en')).toBe(1234.56);
    expect(parseDecimal('1,234.56', 'es')).toBe(1234.56);
    expect(parseDecimal('1,234,567.8', 'en')).toBe(1234567.8);
  });

  it('treats a repeated mark as a thousands separator', () => {
    expect(parseDecimal('1.000.000', 'es')).toBe(1_000_000);
    expect(parseDecimal('1,000,000', 'es')).toBe(1_000_000);
  });

  it('accepts signs, exponents and every kind of space', () => {
    expect(parseDecimal('-2,5', 'es')).toBe(-2.5);
    expect(parseDecimal('1e3', 'es')).toBe(1000);
    expect(parseDecimal('1.5e-3', 'en')).toBe(0.0015);
    expect(parseDecimal(` 1${NBSP}234,5 `, 'es')).toBe(1234.5);
    expect(parseDecimal(`1${NNBSP}234`, 'en')).toBe(1234);
  });

  it('returns null for text that is not a finite number', () => {
    expect(parseDecimal('', 'es')).toBeNull();
    expect(parseDecimal('   ', 'es')).toBeNull();
    expect(parseDecimal('abc', 'es')).toBeNull();
    expect(parseDecimal('12abc', 'en')).toBeNull();
    expect(parseDecimal('-', 'es')).toBeNull();
    expect(parseDecimal('1e999', 'en')).toBeNull();
  });
});

describe('formatNumber', () => {
  it('groups and localizes', () => {
    expect(formatNumber(1234.5, 'en')).toBe('1,234.5');
    expect(formatNumber(12345.5, 'es')).toBe('12.345,5');
    expect(formatNumber(0.1 + 0.2, 'en', 4)).toBe('0.3');
  });

  it('switches to scientific notation for huge and tiny values', () => {
    expect(formatNumber(1e15, 'en')).toBe('1E15');
    expect(formatNumber(2.5e-7, 'es')).toBe('2,5E-7');
    expect(formatNumber(0, 'en')).toBe('0');
  });
});

describe('formatMoney', () => {
  it('formats euros in both languages', () => {
    expect(plain(formatMoney(1234.5, 'es'))).toBe('1234,50 €');
    expect(plain(formatMoney(12345.5, 'es'))).toBe('12.345,50 €');
    expect(formatMoney(1234.5, 'en')).toBe('€1,234.50');
  });

  it('uses the decimals of each currency', () => {
    expect(formatMoney(1234.5, 'en', 'JPY')).toBe('¥1,235');
  });
});

describe('roundCents', () => {
  it('rounds halves away from zero despite floating point', () => {
    expect(roundCents(1.005)).toBe(1.01);
    expect(roundCents(2.675)).toBe(2.68);
    expect(roundCents(0.125)).toBe(0.13);
    expect(roundCents(-1.005)).toBe(-1.01);
    expect(roundCents(17.355)).toBe(17.36);
    expect(roundCents(0)).toBe(0);
  });
});
```

Run: `pnpm test src/lib/numbers.test.ts`
Expected: FAIL (no existe `./numbers`).

Los valores están comprobados con Node 22 (ICU completo). `es-ES` no agrupa los números de 4 cifras (`1234,50 €`, pero `12.345,50 €`), y el espacio antes de `€` es U+00A0 o U+202F según la versión de ICU: por eso el test compara con `\s` normalizado. En los e2e se usan expresiones tolerantes (`/1\.?060,00/`).

- [ ] **Step 3: `src/lib/numbers.ts`**

Reglas de la §4.3: el último de `.` y `,` es el decimal si aparecen los dos; una marca repetida agrupa miles; una sola marca seguida de exactamente 3 cifras agrupa miles **solo** si es el separador de miles del idioma. `\s` ya cubre los espacios no separables y finos (U+00A0, U+202F, U+2009), así que no hace falta escribirlos en la expresión.

```ts
import type { Locale } from '../tools/types';

// `\s` also covers the no-break (U+00A0), narrow no-break (U+202F) and thin (U+2009) spaces
// that Intl and word processors put inside numbers.
const SPACES = /\s/g;
const PLAIN = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;

/**
 * Reads a number typed the Spanish or the English way: "1.234,5", "1,234.5", "1,5", "1e3".
 * The last of "." and "," is the decimal mark when both appear; a mark repeated several times
 * groups thousands; a single mark followed by exactly 3 digits groups thousands only when it is
 * the locale's thousands separator. Returns null when the text is not a finite number.
 */
export function parseDecimal(input: string, locale: Locale): number | null {
  let s = input.replace(SPACES, '');
  if (!s) return null;
  const dots = s.split('.').length - 1;
  const commas = s.split(',').length - 1;
  if (dots && commas) {
    const decimal = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ',';
    const group = decimal === '.' ? ',' : '.';
    s = s.split(group).join('');
    if (decimal === ',') s = s.replace(',', '.');
  } else if (dots > 1 || commas > 1) {
    s = s.replace(/[.,]/g, '');
  } else if (dots || commas) {
    const mark = dots ? '.' : ',';
    const thousands = locale === 'es' ? '.' : ',';
    const groupsThousands = mark === thousands && /^[-+]?\d+[.,]\d{3}$/.test(s);
    s = groupsThousands ? s.replace(mark, '') : s.replace(',', '.');
  }
  if (!PLAIN.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Grouped, localized number. Very large or very small values switch to scientific notation. */
export function formatNumber(n: number, locale: Locale, maxFractionDigits = 10): string {
  const abs = Math.abs(n);
  const scientific = abs >= 1e15 || (abs > 0 && abs < 1e-6);
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: maxFractionDigits,
    notation: scientific ? 'scientific' : 'standard',
    useGrouping: true,
  }).format(n);
}

export function formatMoney(n: number, locale: Locale, currency = 'EUR'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n);
}

/** Rounds to the cent with halves away from zero (1.005 → 1.01, −1.005 → −1.01). */
export function roundCents(n: number): number {
  return (Math.sign(n) * Math.round(Math.abs(n) * 100 + 1e-7)) / 100;
}
```

Run: `pnpm test src/lib`
Expected: PASS.

- [ ] **Step 4: Categoría `calc`**

En `src/tools/types.ts`, sustituye la línea de `CategoryId` por:
```ts
export type CategoryId = 'gen' | 'enc' | 'data' | 'ids' | 'conv' | 'calc' | 'rand' | 'ref';
```

En `src/tools/categories.ts`, inserta este objeto **entre** el de `conv` y el de `rand` (justo antes de la línea `  {` que precede a `    id: 'rand',`):
```ts
  {
    id: 'calc',
    icon: 'calculator',
    name: { es: 'Calculadoras', en: 'Calculators' },
    description: {
      es: 'IVA, IRPF, porcentajes, reglas de tres y días hábiles.',
      en: 'VAT, withholding, percentages, rule of three and business days.',
    },
  },
```
La sidebar y el catálogo de la Home pasan a 8 categorías sin tocarlos: se generan desde `categories.ts` y ocultan las vacías. No cambies la descripción de ninguna otra categoría.

- [ ] **Step 5: Clave `ui.swap`**

En `src/i18n/es.ts`, justo antes de la línea `'dir.label': …,`, añade:
```ts
  'ui.swap': 'Intercambiar',
```
En `src/i18n/en.ts`, en el mismo sitio:
```ts
  'ui.swap': 'Swap',
```
(`src/i18n/i18n.test.ts` comprueba que los dos diccionarios tienen las mismas claves.)

- [ ] **Step 6: Iconos nuevos**

Sustituye `src/tools/icon-names.ts` por (los 48 del lote 1 más los 16 de este lote, en orden alfabético):
```ts
export const ICON_NAMES = [
  'arrow-down-up',
  'arrow-left-right',
  'barcode',
  'binary',
  'book-open',
  'braces',
  'building',
  'calculator',
  'calendar-days',
  'car',
  'case-sensitive',
  'check',
  'chevron-down',
  'chevron-right',
  'clock',
  'code',
  'code-xml',
  'coins',
  'copy',
  'credit-card',
  'database',
  'dice-5',
  'dices',
  'diff',
  'divide',
  'ferris-wheel',
  'file-code',
  'fingerprint',
  'globe',
  'hard-drive',
  'hash',
  'heart-pulse',
  'house',
  'id-card',
  'id-card-lanyard',
  'key-round',
  'keyboard',
  'landmark',
  'link',
  'lock',
  'map-pin',
  'menu',
  'moon',
  'palette',
  'panel-left-close',
  'panel-left-open',
  'percent',
  'phone',
  'pilcrow',
  'receipt',
  'receipt-text',
  'refresh-cw',
  'regex',
  'ruler',
  'scaling',
  'search',
  'shuffle',
  'sparkles',
  'star',
  'sun',
  'terminal',
  'triangle-alert',
  'users',
  'x',
] as const;

export type IconName = (typeof ICON_NAMES)[number];
```

Sustituye `src/tools/icons.ts` por:
```ts
import {
  ArrowDownUp,
  ArrowLeftRight,
  Barcode,
  Binary,
  BookOpen,
  Braces,
  Building,
  Calculator,
  CalendarDays,
  Car,
  CaseSensitive,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  CodeXml,
  Coins,
  Copy,
  CreditCard,
  Database,
  Dice5,
  Dices,
  Diff,
  Divide,
  FerrisWheel,
  FileCode,
  Fingerprint,
  Globe,
  HardDrive,
  Hash,
  HeartPulse,
  House,
  IdCard,
  IdCardLanyard,
  KeyRound,
  Keyboard,
  Landmark,
  Link,
  Lock,
  MapPin,
  Menu,
  Moon,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Percent,
  Phone,
  Pilcrow,
  Receipt,
  ReceiptText,
  RefreshCw,
  Regex,
  Ruler,
  Scaling,
  Search,
  Shuffle,
  Sparkles,
  SquareTerminal,
  Star,
  Sun,
  TriangleAlert,
  Users,
  X,
} from '@lucide/svelte';
import type { IconName } from './icon-names';

export type { IconName } from './icon-names';

// Record<IconName, …> makes `pnpm check` fail if a name has no component or vice versa.
export const icons: Record<IconName, typeof House> = {
  'arrow-down-up': ArrowDownUp,
  'arrow-left-right': ArrowLeftRight,
  barcode: Barcode,
  binary: Binary,
  'book-open': BookOpen,
  braces: Braces,
  building: Building,
  calculator: Calculator,
  'calendar-days': CalendarDays,
  car: Car,
  'case-sensitive': CaseSensitive,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  clock: Clock,
  code: Code,
  'code-xml': CodeXml,
  coins: Coins,
  copy: Copy,
  'credit-card': CreditCard,
  database: Database,
  'dice-5': Dice5,
  dices: Dices,
  diff: Diff,
  divide: Divide,
  'ferris-wheel': FerrisWheel,
  'file-code': FileCode,
  fingerprint: Fingerprint,
  globe: Globe,
  'hard-drive': HardDrive,
  hash: Hash,
  'heart-pulse': HeartPulse,
  house: House,
  'id-card': IdCard,
  'id-card-lanyard': IdCardLanyard,
  'key-round': KeyRound,
  keyboard: Keyboard,
  landmark: Landmark,
  link: Link,
  lock: Lock,
  'map-pin': MapPin,
  menu: Menu,
  moon: Moon,
  palette: Palette,
  'panel-left-close': PanelLeftClose,
  'panel-left-open': PanelLeftOpen,
  percent: Percent,
  phone: Phone,
  pilcrow: Pilcrow,
  receipt: Receipt,
  'receipt-text': ReceiptText,
  'refresh-cw': RefreshCw,
  regex: Regex,
  ruler: Ruler,
  scaling: Scaling,
  search: Search,
  shuffle: Shuffle,
  sparkles: Sparkles,
  star: Star,
  sun: Sun,
  terminal: SquareTerminal,
  'triangle-alert': TriangleAlert,
  users: Users,
  x: X,
};
```

(`terminal` sigue siendo `SquareTerminal`, como en `main`. `Record<IconName, …>` hace que `pnpm check` falle si falta un componente o sobra un nombre.)

- [ ] **Step 7: Pre-sembrar `registry.ts`**

En `src/tools/registry.ts`, **justo antes** de la línea `import type { Category, CategoryId, Locale, ToolMeta } from './types';`, inserta este bloque (empieza con una línea en blanco):
```ts

// Lote 2: each tool task uncomments its import and its entry in `tools`.
// Keep the blank lines between them: they let the parallel branches merge without conflicts.

// import { meta as units } from './units/meta';

// import { meta as currency } from './currency/meta';

// import { meta as pxRem } from './px-rem/meta';

// import { meta as chmod } from './chmod/meta';

// import { meta as fileSize } from './file-size/meta';

// import { meta as wheel } from './wheel/meta';

// import { meta as shuffle } from './shuffle/meta';

// import { meta as teams } from './teams/meta';

// import { meta as dice } from './dice/meta';

// import { meta as iva } from './iva/meta';

// import { meta as irpf } from './irpf/meta';

// import { meta as percent } from './percent/meta';

// import { meta as ruleOfThree } from './rule-of-three/meta';

// import { meta as workdays } from './workdays/meta';

```

Y en el array `tools`, **después de la última entrada que ya existe** (la de `mock` o la última que dejó el lote 1) y antes de `];`, inserta:
```ts

  // units,

  // currency,

  // pxRem,

  // chmod,

  // fileSize,

  // wheel,

  // shuffle,

  // teams,

  // dice,

  // iva,

  // irpf,

  // percent,

  // ruleOfThree,

  // workdays,
```
La última entrada real va **antes** del bloque comentado: si el array empezara o terminara solo con comentarios mezclados, Prettier juntaría las líneas y se perdería el separador (comprobado con el Prettier del repo).

- [ ] **Step 8: Pre-sembrar `ToolIsland.astro`**

En `src/components/ToolIsland.astro`, **justo antes** de la línea `import type { Locale } from '../tools/types';`, inserta:
```astro

// Lote 2: each tool task uncomments its import below and its line in the template.
// Keep the blank lines between them: they let the parallel branches merge without conflicts.

// import Units from '../tools/units/Units.svelte';

// import Currency from '../tools/currency/Currency.svelte';

// import PxRem from '../tools/px-rem/PxRem.svelte';

// import Chmod from '../tools/chmod/Chmod.svelte';

// import FileSize from '../tools/file-size/FileSize.svelte';

// import Wheel from '../tools/wheel/Wheel.svelte';

// import Shuffle from '../tools/shuffle/Shuffle.svelte';

// import Teams from '../tools/teams/Teams.svelte';

// import Dice from '../tools/dice/Dice.svelte';

// import Iva from '../tools/iva/Iva.svelte';

// import Irpf from '../tools/irpf/Irpf.svelte';

// import Percent from '../tools/percent/Percent.svelte';

// import RuleOfThree from '../tools/rule-of-three/RuleOfThree.svelte';

// import Workdays from '../tools/workdays/Workdays.svelte';

```

Y **al final del archivo**, tras la última línea `{id === … }`, añade una línea en blanco y:
```astro
{/* {id === 'units' && <Units client:load locale={locale} />} */}

{/* {id === 'currency' && <Currency client:load locale={locale} />} */}

{/* {id === 'px-rem' && <PxRem client:load locale={locale} />} */}

{/* {id === 'chmod' && <Chmod client:load locale={locale} />} */}

{/* {id === 'file-size' && <FileSize client:load locale={locale} />} */}

{/* {id === 'wheel' && <Wheel client:load locale={locale} />} */}

{/* {id === 'shuffle' && <Shuffle client:load locale={locale} />} */}

{/* {id === 'teams' && <Teams client:load locale={locale} />} */}

{/* {id === 'dice' && <Dice client:load locale={locale} />} */}

{/* {id === 'iva' && <Iva client:load locale={locale} />} */}

{/* {id === 'irpf' && <Irpf client:load locale={locale} />} */}

{/* {id === 'percent' && <Percent client:load locale={locale} />} */}

{/* {id === 'rule-of-three' && <RuleOfThree client:load locale={locale} />} */}

{/* {id === 'workdays' && <Workdays client:load locale={locale} />} */}
```
Las líneas `{/* … */}` son comentarios de expresión que el compilador de Astro 7 ignora (el mismo patrón del Plan B).

- [ ] **Step 9: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css && pnpm test:e2e
git diff --stat
```
Expected: todo en verde. `pnpm format` no cambia `registry.ts` ni `ToolIsland.astro` (si los cambia, revisa que las entradas reales van antes de los comentarios). El build genera las mismas páginas que antes: todavía no hay herramientas nuevas, y la categoría `calc` no aparece en la sidebar porque está vacía.

- [ ] **Step 10: Commit**

```bash
git add src/lib/numbers.ts src/lib/numbers.test.ts src/tools/types.ts src/tools/categories.ts \
  src/tools/icon-names.ts src/tools/icons.ts src/i18n/es.ts src/i18n/en.ts \
  src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain   # no debe quedar nada sin añadir
git commit -m "feat: prerrequisitos del lote 2 (números, categoría calc, iconos y registro pre-sembrado)"
```

---

### Task 1: Unidades: siete magnitudes y el valor en todas las unidades a la vez

**Files:**
- Create: `src/tools/units/logic.ts`, `src/tools/units/logic.test.ts`, `src/tools/units/meta.ts`, `src/tools/units/strings.ts`, `src/tools/units/content.es.md`, `src/tools/units/content.en.md`, `src/tools/units/Units.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `parseDecimal`, `formatNumber` (Task 0); `fill`; `t` (`tool.remember`); kit: `Segmented`, `Field`, `Select`, `Display`, `CopyButton`, `Toggle`, `persistedInput`.
- Produces:
  - `type Quantity`, `QUANTITIES`, `UNITS`, `TEMPERATURE_UNITS`, `DEFAULT_UNIT`, `unitsOf`, `clean`, `convertFactor`, `convertTemperature`, `convertAll(q, value, fromId): ConvertResult`, `ABSOLUTE_ZERO_C`.
  - Inputs recordados: `units-<magnitud>` (valor) y `units-<magnitud>-unit` (unidad), uno por pestaña. El interruptor «Recordar» los cambia todos.
  - `meta: ToolMeta` (id `units`, slugs `conversor-unidades` / `unit-converter`), `strings: Record<Locale, …>`, componente `Units` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 15: `#units-value`, `#units-from` (select con los ids de unidad: `mi`, `km`, `C`…), una fila `[data-unit="<id>"]` por unidad, `Segmented main` con las 7 pestañas.

**§7 (vinculante):** `units` · conv · pestañas Longitud · Masa · Temperatura · Volumen · Área · Velocidad · Datos · «un valor y un `Select` con la unidad de origen; el `Display` es una lista con el valor en todas las unidades de la pestaña, cada una con su botón de copiar». Factores exactos de la tabla de la §7.1; temperatura afín; `toPrecision(12)`; negativos solo en temperatura.

Cómo se cubre cada punto:
- Las 7 pestañas en un `Segmented main` con las etiquetas de `meta.tabs`. Test `uses unique unit ids across all tabs` y `has a default unit that exists in every tab`.
- Todos los factores de la tabla de la §7.1, copiados tal cual. Tests `converts length`, `converts mass`, `converts volume, area and speed` y `tells SI and binary data units apart`.
- Temperatura por °C, con el cero absoluto exacto (`−459,67 °F → 0 K`, sin `−2,8e-14`). Tests del bloque `temperature`.
- `Number(x.toPrecision(12))` contra el ruido de coma flotante (`1 ft = 12 in` exacto). Test `removes floating-point noise`.
- Negativos: error por magnitud («Una longitud no puede ser negativa.»); en temperatura, «Está por debajo del cero absoluto (−273,15 °C).».
- Valores enormes: `formatNumber` pasa a notación científica a partir de 1e15 (Task 0).
- Recordar: valor y unidad de cada pestaña.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l2-units -b lote-2/units   # desde el commit de la Task 0
cd ../devtools-l2-units
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/units/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  clean,
  convertAll,
  convertFactor,
  convertTemperature,
  DEFAULT_UNIT,
  QUANTITIES,
  UNITS,
  unitsOf,
  type Quantity,
} from './logic';

const unit = (q: Exclude<Quantity, 'temperature'>, id: string) =>
  UNITS[q].find((u) => u.id === id)!;
const value = (q: Quantity, v: number, from: string, to: string) => {
  const r = convertAll(q, v, from);
  if (!r.ok) throw new Error(r.reason);
  return r.rows.find((row) => row.unit.id === to)!.value;
};

describe('tables', () => {
  it('has a default unit that exists in every tab', () => {
    for (const q of QUANTITIES) {
      expect(unitsOf(q).map((u) => u.id)).toContain(DEFAULT_UNIT[q]);
    }
  });

  it('uses unique unit ids across all tabs', () => {
    const ids = QUANTITIES.flatMap((q) => unitsOf(q).map((u) => u.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('factor conversions', () => {
  it('removes floating-point noise', () => {
    expect(clean(0.1 + 0.2)).toBe(0.3);
    expect(convertFactor(1, unit('length', 'ft'), unit('length', 'in'))).toBe(12);
  });

  it('converts length', () => {
    expect(value('length', 1, 'mi', 'km')).toBe(1.609344);
    expect(value('length', 1, 'mi', 'm')).toBe(1609.344);
    expect(value('length', 1, 'nmi', 'm')).toBe(1852);
    expect(value('length', 1, 'um', 'km')).toBe(1e-9);
  });

  it('converts mass', () => {
    expect(value('mass', 1, 'lb', 'kg')).toBe(0.45359237);
    expect(value('mass', 1, 'kg', 'lb')).toBe(2.20462262185);
    expect(value('mass', 1, 'st', 'lb')).toBe(14);
  });

  it('converts volume, area and speed', () => {
    expect(value('volume', 1, 'gal', 'ml')).toBe(3785.411784);
    expect(value('volume', 1, 'galuk', 'ptuk')).toBe(8);
    expect(value('area', 1, 'ac', 'ha')).toBe(0.40468564224);
    expect(value('area', 1, 'ha', 'ac')).toBe(2.47105381467);
    expect(value('speed', 100, 'kmh', 'mps')).toBe(27.7777777778);
    expect(value('speed', 100, 'kmh', 'mph')).toBe(62.1371192237);
    expect(value('speed', 1, 'kn', 'kmh')).toBe(1.852);
  });

  it('tells SI and binary data units apart', () => {
    expect(value('data', 1, 'GiB', 'MB')).toBe(1073.741824);
    expect(value('data', 1, 'GB', 'bit')).toBe(8e9);
    expect(value('data', 1, 'MiB', 'KiB')).toBe(1024);
    expect(value('data', 1, 'B', 'bit')).toBe(8);
  });

  it('keeps huge values (the view switches to scientific notation)', () => {
    expect(value('length', 1e20, 'm', 'km')).toBe(1e17);
  });

  it('turns 0 into 0 everywhere and rejects negatives outside temperature', () => {
    const r = convertAll('mass', 0, 'kg');
    expect(r.ok && r.rows.every((row) => row.value === 0)).toBe(true);
    expect(convertAll('length', -1, 'm')).toEqual({ ok: false, reason: 'negative' });
  });

  it('rejects a unit from another tab', () => {
    expect(convertAll('length', 1, 'kg')).toEqual({ ok: false, reason: 'unknownUnit' });
  });
});

describe('temperature', () => {
  it('converts between °C, °F and K', () => {
    expect(convertTemperature(100, 'C', 'F')).toBe(212);
    expect(convertTemperature(100, 'C', 'K')).toBe(373.15);
    expect(convertTemperature(32, 'F', 'C')).toBe(0);
    expect(convertTemperature(0, 'K', 'C')).toBe(-273.15);
    expect(convertTemperature(-40, 'C', 'F')).toBe(-40);
    expect(convertTemperature(98.6, 'F', 'C')).toBe(37);
  });

  it('lands exactly on absolute zero', () => {
    expect(convertTemperature(-459.67, 'F', 'K')).toBe(0);
    expect(value('temperature', -273.15, 'C', 'K')).toBe(0);
  });

  it('accepts negatives but not below absolute zero', () => {
    expect(value('temperature', -10, 'C', 'F')).toBe(14);
    expect(convertAll('temperature', -300, 'C')).toEqual({
      ok: false,
      reason: 'belowAbsoluteZero',
    });
    expect(convertAll('temperature', -1, 'K')).toEqual({ ok: false, reason: 'belowAbsoluteZero' });
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/units`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/units/logic.ts`**

```ts
export type Quantity = 'length' | 'mass' | 'temperature' | 'volume' | 'area' | 'speed' | 'data';

/** Same order as `meta.tabs`. */
export const QUANTITIES: Quantity[] = [
  'length',
  'mass',
  'temperature',
  'volume',
  'area',
  'speed',
  'data',
];

export interface Unit {
  id: string;
  symbol: string;
  /** How many base units (m, kg, l, m², m/s or bit) one of this unit is. Exact by definition. */
  factor: number;
}

type Scaled = Exclude<Quantity, 'temperature'>;

export const UNITS: Record<Scaled, Unit[]> = {
  length: [
    { id: 'um', symbol: 'µm', factor: 1e-6 },
    { id: 'mm', symbol: 'mm', factor: 0.001 },
    { id: 'cm', symbol: 'cm', factor: 0.01 },
    { id: 'm', symbol: 'm', factor: 1 },
    { id: 'km', symbol: 'km', factor: 1000 },
    { id: 'in', symbol: 'in', factor: 0.0254 },
    { id: 'ft', symbol: 'ft', factor: 0.3048 },
    { id: 'yd', symbol: 'yd', factor: 0.9144 },
    { id: 'mi', symbol: 'mi', factor: 1609.344 },
    { id: 'nmi', symbol: 'nmi', factor: 1852 },
  ],
  mass: [
    { id: 'mg', symbol: 'mg', factor: 1e-6 },
    { id: 'g', symbol: 'g', factor: 0.001 },
    { id: 'kg', symbol: 'kg', factor: 1 },
    { id: 't', symbol: 't', factor: 1000 },
    { id: 'oz', symbol: 'oz', factor: 0.028349523125 },
    { id: 'lb', symbol: 'lb', factor: 0.45359237 },
    { id: 'st', symbol: 'st', factor: 6.35029318 },
  ],
  volume: [
    { id: 'ml', symbol: 'ml', factor: 0.001 },
    { id: 'cm3', symbol: 'cm³', factor: 0.001 },
    { id: 'cl', symbol: 'cl', factor: 0.01 },
    { id: 'dl', symbol: 'dl', factor: 0.1 },
    { id: 'l', symbol: 'l', factor: 1 },
    { id: 'm3', symbol: 'm³', factor: 1000 },
    { id: 'tsp', symbol: 'tsp', factor: 0.00492892159375 },
    { id: 'tbsp', symbol: 'tbsp', factor: 0.01478676478125 },
    { id: 'floz', symbol: 'fl oz', factor: 0.0295735295625 },
    { id: 'cup', symbol: 'cup', factor: 0.2365882365 },
    { id: 'pt', symbol: 'pt', factor: 0.473176473 },
    { id: 'qt', symbol: 'qt', factor: 0.946352946 },
    { id: 'gal', symbol: 'gal', factor: 3.785411784 },
    { id: 'flozuk', symbol: 'fl oz UK', factor: 0.0284130625 },
    { id: 'ptuk', symbol: 'pt UK', factor: 0.56826125 },
    { id: 'galuk', symbol: 'gal UK', factor: 4.54609 },
  ],
  area: [
    { id: 'mm2', symbol: 'mm²', factor: 1e-6 },
    { id: 'cm2', symbol: 'cm²', factor: 1e-4 },
    { id: 'm2', symbol: 'm²', factor: 1 },
    { id: 'ha', symbol: 'ha', factor: 1e4 },
    { id: 'km2', symbol: 'km²', factor: 1e6 },
    { id: 'in2', symbol: 'in²', factor: 0.00064516 },
    { id: 'ft2', symbol: 'ft²', factor: 0.09290304 },
    { id: 'yd2', symbol: 'yd²', factor: 0.83612736 },
    { id: 'ac', symbol: 'ac', factor: 4046.8564224 },
    { id: 'mi2', symbol: 'mi²', factor: 2589988.110336 },
  ],
  speed: [
    { id: 'mps', symbol: 'm/s', factor: 1 },
    { id: 'kmh', symbol: 'km/h', factor: 1 / 3.6 },
    { id: 'mph', symbol: 'mph', factor: 0.44704 },
    { id: 'kn', symbol: 'kn', factor: 1852 / 3600 },
    { id: 'fps', symbol: 'ft/s', factor: 0.3048 },
  ],
  data: [
    { id: 'bit', symbol: 'bit', factor: 1 },
    { id: 'kbit', symbol: 'kbit', factor: 1e3 },
    { id: 'Mbit', symbol: 'Mbit', factor: 1e6 },
    { id: 'Gbit', symbol: 'Gbit', factor: 1e9 },
    { id: 'B', symbol: 'B', factor: 8 },
    { id: 'kB', symbol: 'kB', factor: 8e3 },
    { id: 'MB', symbol: 'MB', factor: 8e6 },
    { id: 'GB', symbol: 'GB', factor: 8e9 },
    { id: 'TB', symbol: 'TB', factor: 8e12 },
    { id: 'KiB', symbol: 'KiB', factor: 8 * 2 ** 10 },
    { id: 'MiB', symbol: 'MiB', factor: 8 * 2 ** 20 },
    { id: 'GiB', symbol: 'GiB', factor: 8 * 2 ** 30 },
    { id: 'TiB', symbol: 'TiB', factor: 8 * 2 ** 40 },
  ],
};

export type TemperatureId = 'C' | 'F' | 'K';

export const TEMPERATURE_UNITS: Unit[] = [
  { id: 'C', symbol: '°C', factor: 1 },
  { id: 'F', symbol: '°F', factor: 1 },
  { id: 'K', symbol: 'K', factor: 1 },
];

export const DEFAULT_UNIT: Record<Quantity, string> = {
  length: 'm',
  mass: 'kg',
  temperature: 'C',
  volume: 'l',
  area: 'm2',
  speed: 'kmh',
  data: 'MB',
};

export function unitsOf(q: Quantity): Unit[] {
  return q === 'temperature' ? TEMPERATURE_UNITS : UNITS[q];
}

/** Removes floating-point noise: 0.3048 / 0.0254 = 12.000000000000002 → 12. */
export function clean(x: number): number {
  return Number(x.toPrecision(12));
}

export function convertFactor(value: number, from: Unit, to: Unit): number {
  return clean((value * from.factor) / to.factor);
}

const TO_C: Record<TemperatureId, (v: number) => number> = {
  C: (v) => v,
  F: (v) => ((v - 32) * 5) / 9,
  K: (v) => v - 273.15,
};

const FROM_C: Record<TemperatureId, (v: number) => number> = {
  C: (v) => v,
  F: (v) => (v * 9) / 5 + 32,
  K: (v) => v + 273.15,
};

export const ABSOLUTE_ZERO_C = -273.15;

/** Temperatures are affine, not proportional: they go through °C. */
export function convertTemperature(value: number, from: TemperatureId, to: TemperatureId): number {
  // toFixed(10) first: −459.67 °F would otherwise give −2.8e-14 K instead of 0.
  return clean(Number(FROM_C[to](TO_C[from](value)).toFixed(10)));
}

export type ConvertResult =
  | { ok: true; rows: { unit: Unit; value: number }[] }
  | { ok: false; reason: 'negative' | 'belowAbsoluteZero' | 'unknownUnit' };

/** The value in every unit of the tab, in the table's order. */
export function convertAll(q: Quantity, value: number, fromId: string): ConvertResult {
  const units = unitsOf(q);
  const from = units.find((u) => u.id === fromId);
  if (!from) return { ok: false, reason: 'unknownUnit' };
  if (q === 'temperature') {
    const id = from.id as TemperatureId;
    if (convertTemperature(value, id, 'C') < ABSOLUTE_ZERO_C) {
      return { ok: false, reason: 'belowAbsoluteZero' };
    }
    return {
      ok: true,
      rows: units.map((u) => ({
        unit: u,
        value: convertTemperature(value, id, u.id as TemperatureId),
      })),
    };
  }
  if (value < 0) return { ok: false, reason: 'negative' };
  return { ok: true, rows: units.map((u) => ({ unit: u, value: convertFactor(value, from, u) })) };
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/units`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/units/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'units',
  category: 'conv',
  icon: 'ruler',
  slug: { es: 'conversor-unidades', en: 'unit-converter' },
  name: { es: 'Unidades', en: 'Units' },
  title: {
    es: 'Conversor de unidades: longitud, peso, temperatura y más',
    en: 'Unit converter: length, weight, temperature and more',
  },
  description: {
    es: 'Convierte longitud, masa, temperatura, volumen, área, velocidad y datos, y ve el valor en todas las unidades a la vez, cada una con su botón de copiar.',
    en: 'Convert length, mass, temperature, volume, area, speed and data, and see the value in every unit at once, each one with its own copy button.',
  },
  keywords: {
    es: [
      'conversor de unidades',
      'millas a km',
      'libras a kilos',
      'fahrenheit a celsius',
      'galones a litros',
      'mb a gb',
    ],
    en: [
      'unit converter',
      'miles to km',
      'pounds to kg',
      'fahrenheit to celsius',
      'gallons to liters',
      'mb to gb',
    ],
  },
  tabs: {
    es: ['Longitud', 'Masa', 'Temperatura', 'Volumen', 'Área', 'Velocidad', 'Datos'],
    en: ['Length', 'Mass', 'Temperature', 'Volume', 'Area', 'Speed', 'Data'],
  },
  rememberInput: true,
};
```

`src/tools/units/strings.ts`:
```ts
import type { Locale } from '../types';
import type { Quantity } from './logic';

export const strings = {
  es: {
    tabs: 'Magnitud',
    value: 'Valor',
    from: 'Unidad',
    result: 'Equivalencias',
    empty: 'Escribe un valor para verlo en todas las unidades.',
    invalid: 'Escribe un número, por ejemplo 1234,5.',
    belowAbsoluteZero: 'Está por debajo del cero absoluto (−273,15 °C).',
    copyUnit: 'Copiar en {u}',
  },
  en: {
    tabs: 'Quantity',
    value: 'Value',
    from: 'Unit',
    result: 'Equivalents',
    empty: 'Type a value to see it in every unit.',
    invalid: 'Type a number, for example 1234.5.',
    belowAbsoluteZero: 'That is below absolute zero (−273.15 °C).',
    copyUnit: 'Copy in {u}',
  },
} satisfies Record<Locale, Record<string, string>>;

export const negativeMessages: Record<Locale, Record<Exclude<Quantity, 'temperature'>, string>> = {
  es: {
    length: 'Una longitud no puede ser negativa.',
    mass: 'Una masa no puede ser negativa.',
    volume: 'Un volumen no puede ser negativo.',
    area: 'Un área no puede ser negativa.',
    speed: 'Aquí la velocidad no puede ser negativa.',
    data: 'Una cantidad de datos no puede ser negativa.',
  },
  en: {
    length: 'A length cannot be negative.',
    mass: 'A mass cannot be negative.',
    volume: 'A volume cannot be negative.',
    area: 'An area cannot be negative.',
    speed: 'Speed cannot be negative here.',
    data: 'An amount of data cannot be negative.',
  },
};

export const unitNames: Record<Locale, Record<string, string>> = {
  es: {
    um: 'Micrómetro',
    mm: 'Milímetro',
    cm: 'Centímetro',
    m: 'Metro',
    km: 'Kilómetro',
    in: 'Pulgada',
    ft: 'Pie',
    yd: 'Yarda',
    mi: 'Milla',
    nmi: 'Milla náutica',
    mg: 'Miligramo',
    g: 'Gramo',
    kg: 'Kilogramo',
    t: 'Tonelada',
    oz: 'Onza',
    lb: 'Libra',
    st: 'Stone',
    C: 'Grado Celsius',
    F: 'Grado Fahrenheit',
    K: 'Kelvin',
    ml: 'Mililitro',
    cm3: 'Centímetro cúbico',
    cl: 'Centilitro',
    dl: 'Decilitro',
    l: 'Litro',
    m3: 'Metro cúbico',
    tsp: 'Cucharadita (EE. UU.)',
    tbsp: 'Cucharada (EE. UU.)',
    floz: 'Onza líquida (EE. UU.)',
    cup: 'Taza (EE. UU.)',
    pt: 'Pinta (EE. UU.)',
    qt: 'Cuarto de galón (EE. UU.)',
    gal: 'Galón (EE. UU.)',
    flozuk: 'Onza líquida (R. U.)',
    ptuk: 'Pinta (R. U.)',
    galuk: 'Galón (R. U.)',
    mm2: 'Milímetro cuadrado',
    cm2: 'Centímetro cuadrado',
    m2: 'Metro cuadrado',
    ha: 'Hectárea',
    km2: 'Kilómetro cuadrado',
    in2: 'Pulgada cuadrada',
    ft2: 'Pie cuadrado',
    yd2: 'Yarda cuadrada',
    ac: 'Acre',
    mi2: 'Milla cuadrada',
    mps: 'Metro por segundo',
    kmh: 'Kilómetro por hora',
    mph: 'Milla por hora',
    kn: 'Nudo',
    fps: 'Pie por segundo',
    bit: 'Bit',
    kbit: 'Kilobit',
    Mbit: 'Megabit',
    Gbit: 'Gigabit',
    B: 'Byte',
    kB: 'Kilobyte',
    MB: 'Megabyte',
    GB: 'Gigabyte',
    TB: 'Terabyte',
    KiB: 'Kibibyte',
    MiB: 'Mebibyte',
    GiB: 'Gibibyte',
    TiB: 'Tebibyte',
  },
  en: {
    um: 'Micrometer',
    mm: 'Millimeter',
    cm: 'Centimeter',
    m: 'Meter',
    km: 'Kilometer',
    in: 'Inch',
    ft: 'Foot',
    yd: 'Yard',
    mi: 'Mile',
    nmi: 'Nautical mile',
    mg: 'Milligram',
    g: 'Gram',
    kg: 'Kilogram',
    t: 'Metric ton',
    oz: 'Ounce',
    lb: 'Pound',
    st: 'Stone',
    C: 'Degree Celsius',
    F: 'Degree Fahrenheit',
    K: 'Kelvin',
    ml: 'Milliliter',
    cm3: 'Cubic centimeter',
    cl: 'Centiliter',
    dl: 'Deciliter',
    l: 'Liter',
    m3: 'Cubic meter',
    tsp: 'Teaspoon (US)',
    tbsp: 'Tablespoon (US)',
    floz: 'Fluid ounce (US)',
    cup: 'Cup (US)',
    pt: 'Pint (US)',
    qt: 'Quart (US)',
    gal: 'Gallon (US)',
    flozuk: 'Fluid ounce (UK)',
    ptuk: 'Pint (UK)',
    galuk: 'Gallon (UK)',
    mm2: 'Square millimeter',
    cm2: 'Square centimeter',
    m2: 'Square meter',
    ha: 'Hectare',
    km2: 'Square kilometer',
    in2: 'Square inch',
    ft2: 'Square foot',
    yd2: 'Square yard',
    ac: 'Acre',
    mi2: 'Square mile',
    mps: 'Meter per second',
    kmh: 'Kilometer per hour',
    mph: 'Mile per hour',
    kn: 'Knot',
    fps: 'Foot per second',
    bit: 'Bit',
    kbit: 'Kilobit',
    Mbit: 'Megabit',
    Gbit: 'Gigabit',
    B: 'Byte',
    kB: 'Kilobyte',
    MB: 'Megabyte',
    GB: 'Gigabyte',
    TB: 'Terabyte',
    KiB: 'Kibibyte',
    MiB: 'Mebibyte',
    GiB: 'Gibibyte',
    TiB: 'Tebibyte',
  },
};
```

- [ ] **Step 7: Contenido SEO**

`src/tools/units/content.es.md`:
```md
## Cómo funciona

Elige la magnitud en las pestañas (longitud, masa, temperatura, volumen, área, velocidad o datos), escribe un valor y la unidad en la que está. Debajo aparece ese valor en **todas** las unidades de la pestaña, cada una con su botón de copiar. Puedes escribir con coma o con punto decimal (`1,5` o `1.5`) y con separador de miles (`1.000`).

Los factores son exactos por definición: una pulgada son 0,0254 m, una libra 0,45359237 kg y un galón estadounidense 3,785411784 l. El resultado se redondea a 12 cifras significativas para quitar el ruido de la coma flotante (`0,1 + 0,2`), y los valores muy grandes o muy pequeños pasan a notación científica.

## Temperatura y datos

La temperatura no se convierte con un factor, sino con una fórmula: °F = °C × 9/5 + 32 y K = °C + 273,15. Por eso es la única pestaña que admite negativos, hasta el cero absoluto (−273,15 °C).

En la pestaña de datos conviven las unidades del Sistema Internacional (kB, MB, GB: potencias de 1000) y las binarias (KiB, MiB, GiB: potencias de 1024). Un GiB son 1073,741824 MB.
```

`src/tools/units/content.en.md`:
```md
## How it works

Pick the quantity in the tabs (length, mass, temperature, volume, area, speed or data), type a value and choose its unit. Below you get that value in **every** unit of the tab, each one with its own copy button. You can use a decimal point or a comma (`1.5` or `1,5`) and a thousands separator (`1,000`).

The factors are exact by definition: an inch is 0.0254 m, a pound 0.45359237 kg and a US gallon 3.785411784 l. The result is rounded to 12 significant digits to remove floating-point noise (`0.1 + 0.2`), and very large or very small values switch to scientific notation.

## Temperature and data

Temperature is not converted with a factor but with a formula: °F = °C × 9/5 + 32 and K = °C + 273.15. That is why it is the only tab that accepts negative values, down to absolute zero (−273.15 °C).

The data tab mixes International System units (kB, MB, GB: powers of 1000) and binary units (KiB, MiB, GiB: powers of 1024). One GiB is 1073.741824 MB.
```

- [ ] **Step 8: `src/tools/units/Units.svelte`**

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatNumber, parseDecimal } from '../../lib/numbers';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { convertAll, DEFAULT_UNIT, QUANTITIES, unitsOf, type Quantity } from './logic';
  import { meta } from './meta';
  import { negativeMessages, strings, unitNames } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;

  type Stored = ReturnType<typeof persistedInput>;
  // One remembered value and one remembered unit per tab.
  const values = Object.fromEntries(
    QUANTITIES.map((q) => [q, persistedInput(`units-${q}`, '1', remember)]),
  ) as Record<Quantity, Stored>;
  const froms = Object.fromEntries(
    QUANTITIES.map((q) => [q, persistedInput(`units-${q}-unit`, DEFAULT_UNIT[q], remember)]),
  ) as Record<Quantity, Stored>;
  const all = [...Object.values(values), ...Object.values(froms)];

  let tab = $state<Quantity>('length');
  const units = $derived(unitsOf(tab));
  const text = $derived(values[tab].value);
  // A remembered unit that no longer exists falls back to the tab's default.
  const fromId = $derived(
    units.some((u) => u.id === froms[tab].value) ? froms[tab].value : DEFAULT_UNIT[tab],
  );
  const parsed = $derived(text.trim() ? parseDecimal(text, locale) : null);
  const result = $derived(parsed === null ? null : convertAll(tab, parsed, fromId));
  const error = $derived.by(() => {
    if (text.trim() && parsed === null) return s.invalid;
    if (result && !result.ok) {
      if (result.reason === 'belowAbsoluteZero') return s.belowAbsoluteZero;
      if (result.reason === 'negative' && tab !== 'temperature') {
        return negativeMessages[locale][tab];
      }
    }
    return undefined;
  });
  const rows = $derived(result?.ok ? result.rows : []);
</script>

<div class="stack">
  <Segmented
    main
    label={s.tabs}
    options={QUANTITIES.map((q, i) => ({ value: q, label: meta.tabs![locale][i] }))}
    bind:value={tab}
  />

  <div class="panel">
    <div class="row">
      <div class="value">
        <Field id="units-value" label={s.value} {error}>
          {#snippet children({ describedby })}
            <input
              id="units-value"
              class="control mono"
              type="text"
              inputmode="decimal"
              autocomplete="off"
              spellcheck="false"
              aria-describedby={describedby}
              aria-invalid={!!error}
              bind:value={values[tab].value}
            />
          {/snippet}
        </Field>
      </div>
      <Field id="units-from" label={s.from}>
        {#snippet children({ describedby })}
          <Select
            id="units-from"
            {describedby}
            bind:value={froms[tab].value}
            options={units.map((u) => ({
              value: u.id,
              label: `${unitNames[locale][u.id]} (${u.symbol})`,
            }))}
          />
        {/snippet}
      </Field>
    </div>

    <Display label={s.result}>
      {#if rows.length}
        <div class="display-rows">
          {#each rows as row (row.unit.id)}
            {@const shown = formatNumber(row.value, locale)}
            <div class="display-row" class:source={row.unit.id === fromId} data-unit={row.unit.id}>
              <span class="cell">
                <span class="name">{unitNames[locale][row.unit.id]}</span>
                <span>{shown} {row.unit.symbol}</span>
              </span>
              <CopyButton
                value={shown}
                {locale}
                compact
                ariaLabel={fill(s.copyUnit, { u: row.unit.symbol })}
              />
            </div>
          {/each}
        </div>
      {:else}
        <p class="display-note">{error ?? s.empty}</p>
      {/if}
    </Display>

    <Toggle
      bind:checked={
        () => all[0].remember,
        (v) => {
          for (const p of all) p.remember = v;
        }
      }
      label={t(locale, 'tool.remember')}
    />
  </div>
</div>

<style>
  .value {
    flex: 1 1 200px;
    max-width: 320px;
  }
  .cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .name {
    font: 400 12.5px/1.3 var(--font-body);
    letter-spacing: 0;
    color: var(--disp-dim);
  }
  .source {
    text-shadow: var(--disp-glow);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as units } from './units/meta';
```
→
```ts
import { meta as units } from './units/meta';
```
y
```ts
  // units,
```
→
```ts
  units,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Units from '../tools/units/Units.svelte';
```
→
```astro
import Units from '../tools/units/Units.svelte';
```
y
```astro
{/* {id === 'units' && <Units client:load locale={locale} />} */}
```
→
```astro
{id === 'units' && <Units client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/conversor-unidades.html dist/en/unit-converter.html
git status --porcelain
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `units`: título ≤ 65, descripción de 51 a 160 caracteres, slugs e icono, y sus dos `content.*.md`); existen las dos páginas; `git status` solo lista `src/tools/units/`, `src/tools/registry.ts` y `src/components/ToolIsland.astro`. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador desechable (puerto 4651)**

Crea `.check-units.mjs` en la raíz del worktree (no se confirma):
```js
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4651';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.route('**/analytics.alvarotc.com/**', (r) => r.abort());
await p.route('**/api.frankfurter.dev/**', (r) => r.abort());
await p.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => p.getByText(text).first().waitFor({ timeout: 5000 });
const expectText = (sel, text) =>
  p.locator(sel).filter({ hasText: text }).first().waitFor({ timeout: 5000 });
const expectValue = (sel, v) =>
  p.waitForFunction(([s, want]) => document.querySelector(s)?.value === want, [sel, v], {
    timeout: 5000,
  });
try {
  await p.goto(`${BASE}/es/conversor-unidades`);
  await p.locator('#units-value').fill('1');
  await p.locator('#units-from').selectOption('mi');
  await expectText('[data-unit="km"]', '1,609344');
  await p.locator('#units-value').fill('-3');
  await see('Una longitud no puede ser negativa.');
  await p.getByRole('radio', { name: 'Temperatura' }).click();
  await p.locator('#units-value').fill('100');
  await p.locator('#units-from').selectOption('C');
  await expectText('[data-unit="F"]', '212');
  await p.locator('#units-value').fill('-300');
  await see('Está por debajo del cero absoluto');
  await p.goto(`${BASE}/en/unit-converter`);
  await p.locator('.panel').first().waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK units');
} finally {
  await b.close();
}
```

```bash
./node_modules/.bin/astro preview --port 4651 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
sleep 4
node .check-units.mjs
kill $PREVIEW
rm .check-units.mjs
```
Expected: `OK units` y ningún error. El script falla si una espera no se cumple en 5 s o si la página lanza un error. Aborta cualquier petición a `api.frankfurter.dev`: ninguna comprobación depende de la red.

A mano con `pnpm preview`, en `/es/conversor-unidades`, en tema claro y luego en oscuro y terminal, a 1280 px y a 390 px (sin scroll horizontal):
1. Al cargar, Longitud con `1` metro: la lista enseña las 10 unidades.
2. `1` milla → la fila de km dice `1,609344 km` y su botón de copiar se llama «Copiar en km».
3. Temperatura, `100` °C → `212 °F` y `373,15 K`; `-300` → error bajo el campo.
4. Datos, `1` GiB → `1073,741824 MB`. Recarga: cada pestaña conserva su valor y su unidad.

- [ ] **Step 12: Commit**

```bash
git add src/tools/units src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni `.check-units.mjs`). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(units): conversor de unidades con siete magnitudes"
```

---

### Task 2: Divisas: tipos del BCE, caché de 6 horas y modo sin conexión

**Files:**
- Create: `src/tools/currency/logic.ts`, `src/tools/currency/logic.test.ts`, `src/tools/currency/meta.ts`, `src/tools/currency/strings.ts`, `src/tools/currency/content.es.md`, `src/tools/currency/content.en.md`, `src/tools/currency/Currency.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `parseDecimal`, `formatNumber`, `formatMoney` (Task 0); `readJSON`/`writeJSON` de `src/lib/storage.ts`; `fill`; `t` (`tool.remember`, `ui.swap`); kit: `Field`, `Select`, `Button`, `Display`, `Led`, `CopyButton`, `Toggle`, `persistedInput`.
- Produces:
  - `RATES_URL`, `CACHE_KEY`, `STALE_MS`, `KNOWN_CODES`, `type Rates`, `type CachedRates`, `parseRatesResponse`, `parseCache`, `isStale`, `convert`, `significant`, `codesOf`, `formatRatesDate`.
  - Caché en `devtools:currency.rates` = `{ date, rates, fetchedAt }` (a través de `writeJSON`).
  - Inputs recordados: `currency` (importe), `currency-from` y `currency-to`.
  - `meta: ToolMeta` (id `currency`, slugs `conversor-divisas` / `currency-converter`), `strings: Record<Locale, …>`, componente `Currency` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 15: `#currency-amount`, `#currency-from`, `#currency-to`, botón «Intercambiar», `#currency-result` (importe convertido), LED con «Tipos del BCE del dd/mm/aaaa», «Sin conexión: se usan los tipos guardados del …» o el error, botón «Reintentar», filas `[data-currency="<código>"]`.

**§7 (vinculante):** `currency` · conv · sin pestañas · `GET https://api.frankfurter.dev/v1/latest` sin parámetros, con `credentials: 'omit'`, `referrerPolicy: 'no-referrer'` y `AbortSignal.timeout(8000)`; `parseRatesResponse`; caché con `writeJSON('currency.rates', …)` renovada a las 6 h; tres estados con LED; `convert`; unitario con 6 cifras; lista con todas las divisas; nota fija; divisa guardada que desaparece → EUR con aviso.

Cómo se cubre cada punto:
- URL de la spec en una sola constante, sin parámetros. Test `points at the v1 URL with no query string`.
- Validación de la respuesta (`base`, `date`, `rates` finitos y positivos, `EUR: 1` añadido). Tests `accepts the Frankfurter table and adds EUR` y `rejects anything with an unexpected shape`.
- Caché: al montar se pinta lo guardado al instante; se descarga si no hay caché o si `isStale`. Tests `reads back what was stored`, `ignores damaged entries` y `goes stale after 6 hours`.
- Estados: `ok` (LED verde, «Tipos del BCE del 25/09/2026»), `offline` (LED gris, tipos guardados), `error` (LED rojo, mensaje y «Reintentar»). Cubiertos por los tres e2e de la Task 15 y por la comprobación del Step 11.
- Conversión, misma divisa, divisa que falta e importe vacío = 1. Tests del bloque `convert`.
- Unitario en los dos sentidos con 6 cifras significativas. Test `rounds unit rates to 6 significant digits`.
- Nota visible y fija con el texto de la spec; la privacidad se explica también en el contenido y en una FAQ.
- Decisión de este plan: no hay helper de caché en `src/lib/`. `parseRatesResponse` e `isStale` viven en `currency/logic.ts` (§7.2) y la escritura usa `readJSON`/`writeJSON`, que ya existen.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l2-currency -b lote-2/currency   # desde el commit de la Task 0
cd ../devtools-l2-currency
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/currency/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  codesOf,
  convert,
  formatRatesDate,
  isStale,
  KNOWN_CODES,
  parseCache,
  parseRatesResponse,
  RATES_URL,
  significant,
  STALE_MS,
} from './logic';

const SAMPLE = { amount: 1, base: 'EUR', date: '2026-09-25', rates: { USD: 1.1, GBP: 0.85 } };

describe('parseRatesResponse', () => {
  it('accepts the Frankfurter table and adds EUR', () => {
    expect(parseRatesResponse(SAMPLE)).toEqual({
      date: '2026-09-25',
      rates: { EUR: 1, USD: 1.1, GBP: 0.85 },
    });
  });

  it('rejects anything with an unexpected shape', () => {
    expect(parseRatesResponse(null)).toBeNull();
    expect(parseRatesResponse('EUR')).toBeNull();
    expect(parseRatesResponse({ ...SAMPLE, base: 'USD' })).toBeNull();
    expect(parseRatesResponse({ ...SAMPLE, date: '25/09/2026' })).toBeNull();
    expect(parseRatesResponse({ ...SAMPLE, rates: [1, 2] })).toBeNull();
    expect(parseRatesResponse({ ...SAMPLE, rates: { USD: '1.1' } })).toBeNull();
    expect(parseRatesResponse({ ...SAMPLE, rates: { USD: -1 } })).toBeNull();
    expect(parseRatesResponse({ ...SAMPLE, rates: { USD: 0 } })).toBeNull();
    expect(parseRatesResponse({ ...SAMPLE, rates: { usd: 1.1 } })).toBeNull();
  });

  it('points at the v1 URL with no query string', () => {
    expect(RATES_URL).toBe('https://api.frankfurter.dev/v1/latest');
  });
});

describe('cache', () => {
  it('reads back what was stored', () => {
    const stored = { date: '2026-09-25', rates: { EUR: 1, USD: 1.1 }, fetchedAt: 1000 };
    expect(parseCache(stored)).toEqual(stored);
  });

  it('ignores damaged entries', () => {
    expect(parseCache(null)).toBeNull();
    expect(parseCache({ date: '2026-09-25', rates: { USD: 1.1 } })).toBeNull();
    expect(parseCache({ date: 'x', rates: { USD: 1.1 }, fetchedAt: 1 })).toBeNull();
  });

  it('goes stale after 6 hours', () => {
    expect(STALE_MS).toBe(21_600_000);
    expect(isStale(0, STALE_MS)).toBe(false);
    expect(isStale(0, STALE_MS + 1)).toBe(true);
    expect(isStale(1000, 1000)).toBe(false);
  });
});

describe('convert', () => {
  const rates = { EUR: 1, USD: 1.1, GBP: 0.85, JPY: 160 };

  it('goes through EUR', () => {
    expect(convert(10, 'EUR', 'USD', rates)).toBeCloseTo(11, 10);
    expect(convert(11, 'USD', 'EUR', rates)).toBeCloseTo(10, 10);
    expect(convert(1, 'GBP', 'USD', rates)).toBeCloseTo(1.294117647, 8);
    expect(convert(1, 'USD', 'JPY', rates)).toBeCloseTo(145.4545454545, 8);
  });

  it('returns the same amount for the same currency', () => {
    expect(convert(123.45, 'USD', 'USD', rates)).toBe(123.45);
  });

  it('returns null for a currency that is not in the table', () => {
    expect(convert(1, 'EUR', 'XAU', rates)).toBeNull();
  });

  it('rounds unit rates to 6 significant digits', () => {
    expect(significant(1 / 1.1)).toBe(0.909091);
    expect(significant(0.85 / 1.1)).toBe(0.772727);
    expect(significant(160 / 1.1)).toBe(145.455);
  });
});

describe('helpers', () => {
  it('sorts codes', () => {
    expect(codesOf({ USD: 1.1, EUR: 1, GBP: 0.85 })).toEqual(['EUR', 'GBP', 'USD']);
    expect(KNOWN_CODES).toContain('EUR');
    expect([...KNOWN_CODES].sort()).toEqual(KNOWN_CODES);
  });

  it('formats the ECB date for each language', () => {
    expect(formatRatesDate('2026-09-25', 'es')).toBe('25/09/2026');
    expect(formatRatesDate('2026-09-25', 'en')).toBe('09/25/2026');
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/currency`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/currency/logic.ts`**

```ts
/**
 * Public ECB reference rates. No query string: the whole EUR-based table comes down and the
 * conversion happens in the browser, so neither the amount nor the pair leaves the device.
 * Not api.frankfurter.app: it answers 301 without CORS headers and the browser fetch fails.
 */
export const RATES_URL = 'https://api.frankfurter.dev/v1/latest';
export const CACHE_KEY = 'currency.rates';
/** The ECB publishes once per working day (around 16:00 in Madrid). */
export const STALE_MS = 6 * 3_600_000;

/** Currencies the ECB publishes, used as options until the first table arrives. */
export const KNOWN_CODES = [
  'AUD',
  'BGN',
  'BRL',
  'CAD',
  'CHF',
  'CNY',
  'CZK',
  'DKK',
  'EUR',
  'GBP',
  'HKD',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'ISK',
  'JPY',
  'KRW',
  'MXN',
  'MYR',
  'NOK',
  'NZD',
  'PHP',
  'PLN',
  'RON',
  'SEK',
  'SGD',
  'THB',
  'TRY',
  'USD',
  'ZAR',
];

export interface Rates {
  /** YYYY-MM-DD of the ECB publication. */
  date: string;
  /** Units of each currency per 1 EUR. Always includes EUR: 1. */
  rates: Record<string, number>;
}

export interface CachedRates extends Rates {
  fetchedAt: number;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const CODE = /^[A-Z]{3}$/;

/** Validates the API response. Anything unexpected is null and is treated as offline. */
export function parseRatesResponse(json: unknown): Rates | null {
  if (typeof json !== 'object' || json === null) return null;
  const { base, date, rates } = json as Record<string, unknown>;
  if (base !== 'EUR' || typeof date !== 'string' || !DATE.test(date)) return null;
  if (typeof rates !== 'object' || rates === null || Array.isArray(rates)) return null;
  const out: Record<string, number> = { EUR: 1 };
  for (const [code, v] of Object.entries(rates)) {
    if (!CODE.test(code) || typeof v !== 'number' || !Number.isFinite(v) || v <= 0) return null;
    out[code] = v;
  }
  return { date, rates: out };
}

/** Reads what `writeJSON(CACHE_KEY, …)` stored, or null if it is missing or damaged. */
export function parseCache(value: unknown): CachedRates | null {
  if (typeof value !== 'object' || value === null) return null;
  const { date, rates, fetchedAt } = value as Record<string, unknown>;
  if (typeof fetchedAt !== 'number' || !Number.isFinite(fetchedAt)) return null;
  const parsed = parseRatesResponse({ base: 'EUR', date, rates });
  return parsed ? { ...parsed, fetchedAt } : null;
}

export function isStale(fetchedAt: number, now: number): boolean {
  return now - fetchedAt > STALE_MS;
}

/** `amount / rates[from] × rates[to]`; null when a currency is not in the table. */
export function convert(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number | null {
  const a = rates[from];
  const b = rates[to];
  if (a === undefined || b === undefined) return null;
  if (from === to) return amount;
  return (amount / a) * b;
}

/** 6 significant digits, for "1 USD = 0.853 EUR". */
export function significant(n: number, digits = 6): number {
  return Number(n.toPrecision(digits));
}

/** Codes sorted alphabetically, EUR included. */
export function codesOf(rates: Record<string, number>): string[] {
  return Object.keys(rates).sort();
}

/** "2026-09-25" → "25/09/2026" (es) or "09/25/2026" (en). */
export function formatRatesDate(date: string, locale: 'es' | 'en'): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/currency`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/currency/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'currency',
  category: 'conv',
  icon: 'coins',
  slug: { es: 'conversor-divisas', en: 'currency-converter' },
  name: { es: 'Divisas', en: 'Currency' },
  title: {
    es: 'Conversor de divisas con tipos de cambio del BCE',
    en: 'Currency converter with ECB exchange rates',
  },
  description: {
    es: 'Convierte entre euros, dólares, libras y otras 27 divisas con los tipos de referencia del BCE. El importe se calcula en tu navegador y funciona sin conexión.',
    en: 'Convert between euros, dollars, pounds and 27 other currencies with ECB reference rates. The amount is computed in your browser and it works offline.',
  },
  keywords: {
    es: [
      'conversor de divisas',
      'euro a dólar',
      'tipo de cambio',
      'cambio de moneda',
      'bce',
      'libras a euros',
    ],
    en: [
      'currency converter',
      'euro to dollar',
      'exchange rate',
      'ecb rates',
      'convert currency',
      'pounds to euros',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Por qué mi banco me da otro cambio?',
        a: 'Estos son los tipos de referencia que publica el Banco Central Europeo una vez por día hábil. Bancos, tarjetas y casas de cambio aplican su propio tipo, normalmente con un margen, y a veces una comisión aparte.',
      },
      {
        q: '¿Se envía mi importe a algún sitio?',
        a: 'No. La herramienta descarga la tabla completa de tipos, sin parámetros, y hace la conversión en tu navegador. El importe y las divisas que eliges no salen de tu equipo.',
      },
    ],
    en: [
      {
        q: 'Why does my bank give me a different rate?',
        a: 'These are the reference rates the European Central Bank publishes once per working day. Banks, cards and exchange offices apply their own rate, usually with a margin, and sometimes a separate fee.',
      },
      {
        q: 'Is my amount sent anywhere?',
        a: 'No. The tool downloads the whole rate table, with no parameters, and converts in your browser. The amount and the currencies you pick never leave your device.',
      },
    ],
  },
  rememberInput: true,
};
```

`src/tools/currency/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    amount: 'Importe',
    from: 'De',
    to: 'A',
    result: 'Conversión',
    all: 'En todas las divisas',
    loading: 'Descargando los tipos del BCE…',
    ok: 'Tipos del BCE del {date}',
    offline: 'Sin conexión: se usan los tipos guardados del {date}',
    error:
      'No se han podido descargar los tipos de cambio y no hay ninguno guardado. Comprueba la conexión y pulsa Reintentar.',
    retry: 'Reintentar',
    invalid: 'Escribe un número, por ejemplo 1234,5.',
    missing: 'La divisa {c} ya no viene en la tabla del BCE: se ha cambiado a EUR.',
    unit: '1 {a} = {r} {b}',
    privacy:
      'Los tipos son de referencia, públicos, del Banco Central Europeo, y se descargan de api.frankfurter.dev. La herramienta no envía ningún dato tuyo: el importe y las divisas se calculan en tu navegador.',
    copyIn: 'Copiar en {c}',
  },
  en: {
    amount: 'Amount',
    from: 'From',
    to: 'To',
    result: 'Conversion',
    all: 'In every currency',
    loading: 'Downloading ECB rates…',
    ok: 'ECB rates of {date}',
    offline: 'Offline: using the rates saved on {date}',
    error:
      'The exchange rates could not be downloaded and none are saved. Check your connection and press Retry.',
    retry: 'Retry',
    invalid: 'Type a number, for example 1234.5.',
    missing: 'The ECB table no longer includes {c}: it was changed to EUR.',
    unit: '1 {a} = {r} {b}',
    privacy:
      'These are public reference rates from the European Central Bank, downloaded from api.frankfurter.dev. The tool sends none of your data: the amount and the currencies are computed in your browser.',
    copyIn: 'Copy in {c}',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/currency/content.es.md`:
```md
## Cómo funciona

Escribe un importe, elige la divisa de origen y la de destino, y el resultado aparece al momento, junto al tipo unitario en los dos sentidos («1 USD = 0,909091 EUR») y el mismo importe en todas las divisas disponibles. El botón de intercambiar da la vuelta al par.

Los tipos son los de **referencia del Banco Central Europeo**, que se publican una vez por día hábil hacia las 16:00 (hora de Madrid) para unas 30 divisas. La herramienta descarga la tabla completa de `api.frankfurter.dev`, sin parámetros, y hace la conversión en tu navegador: ni el importe ni las divisas que eliges salen de tu equipo.

## Sin conexión

La última tabla descargada se guarda en tu navegador con su fecha. Si no hay conexión, se usa esa tabla y se avisa de qué día es. Se vuelve a descargar cuando han pasado más de 6 horas.

Los tipos de referencia no son los que te aplicará un banco, una tarjeta o una casa de cambio: esos llevan su propio margen y, a veces, una comisión. Úsalos para hacerte una idea o para cálculos internos.
```

`src/tools/currency/content.en.md`:
```md
## How it works

Type an amount, pick the source and target currencies, and the result appears right away, with the unit rate both ways ("1 USD = 0.909091 EUR") and the same amount in every available currency. The swap button flips the pair.

The rates are the **European Central Bank reference rates**, published once per working day around 16:00 (Madrid time) for about 30 currencies. The tool downloads the whole table from `api.frankfurter.dev`, with no parameters, and converts in your browser: neither the amount nor the currencies you pick leave your device.

## Offline

The last downloaded table is kept in your browser with its date. With no connection, that table is used and the tool tells you which day it is from. It is downloaded again after 6 hours.

Reference rates are not what a bank, a card or an exchange office will charge you: they add their own margin and sometimes a fee. Use them as a guide or for internal calculations.
```

- [ ] **Step 8: `src/tools/currency/Currency.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatMoney, formatNumber, parseDecimal } from '../../lib/numbers';
  import { readJSON, writeJSON } from '../../lib/storage';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Select from '../../ui/Select.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    CACHE_KEY,
    codesOf,
    convert,
    formatRatesDate,
    isStale,
    KNOWN_CODES,
    parseCache,
    parseRatesResponse,
    RATES_URL,
    significant,
    type CachedRates,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const amount = persistedInput('currency', '100', remember);
  const from = persistedInput('currency-from', 'EUR', remember);
  const to = persistedInput('currency-to', 'USD', remember);

  type Status = 'loading' | 'ok' | 'offline' | 'error';
  let rates = $state<CachedRates | null>(null);
  let status = $state<Status>('loading');
  let missing = $state<string | null>(null);

  async function download() {
    if (!rates) status = 'loading';
    try {
      // A public GET with no parameters, no cookies and no Referer: nothing of the user leaves.
      const res = await fetch(RATES_URL, {
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: AbortSignal.timeout(8000),
      });
      const parsed = res.ok ? parseRatesResponse(await res.json()) : null;
      if (!parsed) throw new Error('Unexpected response');
      rates = { ...parsed, fetchedAt: Date.now() };
      writeJSON(CACHE_KEY, rates);
      status = 'ok';
    } catch {
      status = rates ? 'offline' : 'error';
    }
  }

  onMount(() => {
    const cached = parseCache(readJSON<unknown>(CACHE_KEY, null));
    if (cached) {
      rates = cached;
      status = 'ok';
    }
    if (!cached || isStale(cached.fetchedAt, Date.now())) void download();
  });

  // A remembered currency that the ECB no longer publishes falls back to EUR, with a notice.
  $effect(() => {
    if (!rates) return;
    for (const pick of [from, to]) {
      if (!(pick.value in rates.rates)) {
        missing = pick.value;
        pick.value = 'EUR';
      }
    }
  });

  const names = $derived(new Intl.DisplayNames(locale, { type: 'currency' }));
  const codes = $derived(
    [...new Set([...(rates ? codesOf(rates.rates) : KNOWN_CODES), from.value, to.value])].sort(),
  );
  const options = $derived(codes.map((c) => ({ value: c, label: `${c} · ${names.of(c) ?? c}` })));

  const parsed = $derived(amount.value.trim() ? parseDecimal(amount.value, locale) : 1);
  const result = $derived(
    rates && parsed !== null ? convert(parsed, from.value, to.value, rates.rates) : null,
  );
  const shown = $derived(result === null ? '' : formatMoney(result, locale, to.value));
  const unitLine = $derived.by(() => {
    if (!rates) return '';
    const r = (a: string, b: string) => {
      const v = convert(1, a, b, rates!.rates);
      return v === null ? '' : fill(s.unit, { a, b, r: formatNumber(significant(v), locale) });
    };
    return `${r(from.value, to.value)} · ${r(to.value, from.value)}`;
  });
  const others = $derived(
    rates && parsed !== null
      ? codesOf(rates.rates).map((c) => ({
          code: c,
          text: formatMoney(convert(parsed, from.value, c, rates!.rates) ?? 0, locale, c),
        }))
      : [],
  );

  const led = $derived(status === 'ok' ? 'ok' : status === 'error' ? 'bad' : 'idle');
  const statusText = $derived.by(() => {
    const date = rates ? formatRatesDate(rates.date, locale) : '';
    if (status === 'ok') return fill(s.ok, { date });
    if (status === 'offline') return fill(s.offline, { date });
    if (status === 'error') return s.error;
    return s.loading;
  });

  function swap() {
    const a = from.value;
    from.value = to.value;
    to.value = a;
  }
</script>

<div class="panel">
  <div class="row">
    <div class="amount">
      <Field id="currency-amount" label={s.amount} error={parsed === null ? s.invalid : undefined}>
        {#snippet children({ describedby })}
          <input
            id="currency-amount"
            class="control mono"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            spellcheck="false"
            placeholder="1"
            aria-describedby={describedby}
            aria-invalid={parsed === null}
            bind:value={amount.value}
          />
        {/snippet}
      </Field>
    </div>
    <Field id="currency-from" label={s.from}>
      {#snippet children({ describedby })}
        <Select id="currency-from" {describedby} bind:value={from.value} {options} />
      {/snippet}
    </Field>
    <Button variant="icon" icon="arrow-down-up" label={t(locale, 'ui.swap')} onclick={swap} />
    <Field id="currency-to" label={s.to}>
      {#snippet children({ describedby })}
        <Select id="currency-to" {describedby} bind:value={to.value} {options} />
      {/snippet}
    </Field>
  </div>

  {#if missing}<p class="note" role="status">{fill(s.missing, { c: missing })}</p>{/if}

  <Display live label={s.result}>
    {#snippet head()}
      <Led state={led} label={statusText} />
    {/snippet}
    {#if result !== null}
      <div class="display-value" id="currency-result">{shown}</div>
      <p class="display-note">{unitLine}</p>
    {:else if parsed === null}
      <p class="display-note">{s.invalid}</p>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={shown} {locale} />
    {#if status === 'error' || status === 'offline'}
      <Button variant="secondary" icon="refresh-cw" onclick={download}>{s.retry}</Button>
    {/if}
  </div>

  {#if others.length}
    <Display label={s.all}>
      {#snippet head()}<span>{s.all}</span>{/snippet}
      <div class="display-rows">
        {#each others as o (o.code)}
          <div class="display-row" data-currency={o.code}>
            <span class="cell">
              <span class="name">{o.code} · {names.of(o.code) ?? o.code}</span>
              <span>{o.text}</span>
            </span>
            <CopyButton value={o.text} {locale} compact ariaLabel={fill(s.copyIn, { c: o.code })} />
          </div>
        {/each}
      </div>
    </Display>
  {/if}

  <p class="note">{s.privacy}</p>

  <Toggle
    bind:checked={
      () => amount.remember,
      (v) => {
        amount.remember = v;
        from.remember = v;
        to.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .amount {
    flex: 1 1 160px;
    max-width: 240px;
  }
  .note {
    font-size: 13.5px;
    color: var(--text-dim);
  }
  .cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .name {
    font: 400 12.5px/1.3 var(--font-body);
    letter-spacing: 0;
    color: var(--disp-dim);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as currency } from './currency/meta';
```
→
```ts
import { meta as currency } from './currency/meta';
```
y
```ts
  // currency,
```
→
```ts
  currency,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Currency from '../tools/currency/Currency.svelte';
```
→
```astro
import Currency from '../tools/currency/Currency.svelte';
```
y
```astro
{/* {id === 'currency' && <Currency client:load locale={locale} />} */}
```
→
```astro
{id === 'currency' && <Currency client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/conversor-divisas.html dist/en/currency-converter.html
git status --porcelain
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `currency`: título ≤ 65, descripción de 51 a 160 caracteres, slugs e icono, y sus dos `content.*.md`); existen las dos páginas; `git status` solo lista `src/tools/currency/`, `src/tools/registry.ts` y `src/components/ToolIsland.astro`. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador desechable (puerto 4652)**

Crea `.check-currency.mjs` en la raíz del worktree (no se confirma):
```js
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4652';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.route('**/analytics.alvarotc.com/**', (r) => r.abort());
await p.route('**/api.frankfurter.dev/**', (r) => r.abort());
await p.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => p.getByText(text).first().waitFor({ timeout: 5000 });
const expectText = (sel, text) =>
  p.locator(sel).filter({ hasText: text }).first().waitFor({ timeout: 5000 });
const expectValue = (sel, v) =>
  p.waitForFunction(([s, want]) => document.querySelector(s)?.value === want, [sel, v], {
    timeout: 5000,
  });
try {
  await p.goto(`${BASE}/es/conversor-divisas`);
  // Registered after the abort route, so this one answers first. Never the real API.
  await p.route('**/api.frankfurter.dev/**', (r) =>
    r.fulfill({ json: { amount: 1, base: 'EUR', date: '2026-09-25', rates: { USD: 1.1, GBP: 0.85 } } }),
  );
  await p.reload();
  await see('Tipos del BCE del 25/09/2026');
  await p.locator('#currency-amount').fill('10');
  await p.locator('#currency-from').selectOption('EUR');
  await p.locator('#currency-to').selectOption('USD');
  await expectText('#currency-result', '11,00');
  await p.getByRole('button', { name: 'Intercambiar' }).click();
  await expectText('#currency-result', '9,09');
  await see('1 USD = 0,909091 EUR');
  await p.goto(`${BASE}/en/currency-converter`);
  await p.locator('.panel').first().waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK currency');
} finally {
  await b.close();
}
```

```bash
./node_modules/.bin/astro preview --port 4652 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
sleep 4
node .check-currency.mjs
kill $PREVIEW
rm .check-currency.mjs
```
Expected: `OK currency` y ningún error. El script falla si una espera no se cumple en 5 s o si la página lanza un error. Aborta cualquier petición a `api.frankfurter.dev`: ninguna comprobación depende de la red.

A mano con `pnpm preview`, en `/es/conversor-divisas`, en tema claro y luego en oscuro y terminal, a 1280 px y a 390 px (sin scroll horizontal):
1. Con red: «Tipos del BCE del …» con el LED verde; 100 EUR → USD y la lista de ~30 divisas con nombre de `Intl.DisplayNames`.
2. DevTools → Network → Offline y recarga: «Sin conexión: se usan los tipos guardados del …» y el botón «Reintentar».
3. Borra `devtools:currency.rates` en Application → Local Storage, sigue sin red y recarga: mensaje de error y «Reintentar».
4. En la petición a `api.frankfurter.dev` (pestaña Network) no hay query string, ni cookies, ni cabecera `Referer`.

- [ ] **Step 12: Commit**

```bash
git add src/tools/currency src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni `.check-currency.mjs`). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(currency): conversor de divisas con tipos del BCE y caché sin conexión"
```

---

### Task 3: px ↔ rem/em: campos sincronizados, CSS con punto y tabla de tamaños

**Files:**
- Create: `src/tools/px-rem/logic.ts`, `src/tools/px-rem/logic.test.ts`, `src/tools/px-rem/meta.ts`, `src/tools/px-rem/strings.ts`, `src/tools/px-rem/content.es.md`, `src/tools/px-rem/content.en.md`, `src/tools/px-rem/PxRem.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `parseDecimal` (Task 0, a través de `parseCssNumber`); `fill`; `t` (`tool.remember`); kit: `Field`, `Display`, `CopyButton`, `Toggle`, `persistedInput`.
- Produces:
  - `DEFAULT_BASE`, `COMMON_SIZES`, `parseCssNumber`, `fmt`, `pxToRem`, `remToPx`, `cssSnippet`, `sizeTable`.
  - Inputs recordados: `px-rem` (base) y `px-rem-parent` (padre; vacío = igual que la base).
  - `meta: ToolMeta` (id `px-rem`, slugs `conversor-px-rem` / `px-to-rem-converter`), `strings: Record<Locale, …>`, componente `PxRem` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 15: `#px-rem-base`, `#px-rem-parent`, `#px-rem-px`, `#px-rem-rem`, `#px-rem-em`, `.display-code` con el fragmento CSS.

**§7 (vinculante):** `px-rem` · conv · sin pestañas · base (16), px, rem y em sincronizados como en Colores, padre para em (por defecto, la base); 4 decimales sin ceros finales; **siempre punto decimal** (`String(Number(x.toFixed(4)))`); los campos aceptan coma; fragmento `font-size: 1.5rem; /* 24px */`; tabla 10–64 px; base o padre ≤ 0 → error.

Cómo se cubre cada punto:
- Fórmulas y redondeo a 4 decimales sin ceros. Tests `divides by the base size` y `keeps 4 decimals at most, with a dot and no trailing zeros`.
- Punto decimal en los dos idiomas y coma aceptada al escribir. **Trampa de `parseDecimal`:** con las reglas de `es`, `0.875` se lee como 875 (punto seguido de 3 cifras = miles). Por eso `parseCssNumber` cambia la coma por punto y parsea como `en`. Test `reads a dot or a comma as the decimal mark, never as thousands` (Review Focus 1).
- Fragmento CSS y tabla de tamaños habituales. Tests `builds the CSS snippet` y `lists the common sizes for the current base`.
- Campos sincronizados con el patrón de Colores: el que se edita no se reescribe (no salta el cursor) y se normaliza al salir.
- Errores «El tamaño base debe ser mayor que 0.» y el equivalente para el padre.
- Recordar: base y padre.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l2-px-rem -b lote-2/px-rem   # desde el commit de la Task 0
cd ../devtools-l2-px-rem
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/px-rem/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { cssSnippet, fmt, parseCssNumber, pxToRem, remToPx, sizeTable } from './logic';

describe('px ↔ rem', () => {
  it('divides by the base size', () => {
    expect(fmt(pxToRem(24, 16))).toBe('1.5');
    expect(fmt(pxToRem(24, 10))).toBe('2.4');
    expect(fmt(pxToRem(14, 16))).toBe('0.875');
    expect(remToPx(0.875, 16)).toBe(14);
    expect(remToPx(1.5, 16)).toBe(24);
  });

  it('keeps 4 decimals at most, with a dot and no trailing zeros', () => {
    expect(fmt(1 / 3)).toBe('0.3333');
    expect(fmt(1.5)).toBe('1.5');
    expect(fmt(2)).toBe('2');
    expect(fmt(0.0625)).toBe('0.0625');
  });

  it('builds the CSS snippet', () => {
    expect(cssSnippet(24, 16)).toBe('font-size: 1.5rem; /* 24px */');
    expect(cssSnippet(14, 16)).toBe('font-size: 0.875rem; /* 14px */');
  });

  it('lists the common sizes for the current base', () => {
    const table = sizeTable(16);
    expect(table).toHaveLength(11);
    expect(table[0]).toEqual({ px: 10, rem: '0.625' });
    expect(table.find((r) => r.px === 64)).toEqual({ px: 64, rem: '4' });
    expect(sizeTable(10)[0]).toEqual({ px: 10, rem: '1' });
  });
});

describe('parseCssNumber', () => {
  it('reads a dot or a comma as the decimal mark, never as thousands', () => {
    expect(parseCssNumber('0.875')).toBe(0.875);
    expect(parseCssNumber('0,875')).toBe(0.875);
    expect(parseCssNumber('1,125')).toBe(1.125);
    expect(parseCssNumber('1.125')).toBe(1.125);
    expect(parseCssNumber(' 24 ')).toBe(24);
  });

  it('rejects text that is not a number', () => {
    expect(parseCssNumber('')).toBeNull();
    expect(parseCssNumber('16px')).toBeNull();
    expect(parseCssNumber('abc')).toBeNull();
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/px-rem`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/px-rem/logic.ts`**

```ts
import { parseDecimal } from '../../lib/numbers';

export const DEFAULT_BASE = 16;
export const COMMON_SIZES = [10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 64];

/**
 * CSS values have no thousands separators, so a comma is always the decimal mark here.
 * Parsing with the `es` rules would read "0.875" as 875.
 */
export function parseCssNumber(input: string): number | null {
  return parseDecimal(input.replace(',', '.'), 'en');
}

/** Always a dot, 4 decimals at most and no trailing zeros: valid CSS in both languages. */
export function fmt(n: number): string {
  return String(Number(n.toFixed(4)));
}

export function pxToRem(px: number, base: number): number {
  return px / base;
}

export function remToPx(rem: number, base: number): number {
  return rem * base;
}

export function cssSnippet(px: number, base: number): string {
  return `font-size: ${fmt(pxToRem(px, base))}rem; /* ${fmt(px)}px */`;
}

export function sizeTable(base: number): { px: number; rem: string }[] {
  return COMMON_SIZES.map((px) => ({ px, rem: fmt(pxToRem(px, base)) }));
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/px-rem`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/px-rem/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'px-rem',
  category: 'conv',
  icon: 'scaling',
  slug: { es: 'conversor-px-rem', en: 'px-to-rem-converter' },
  name: { es: 'px a rem', en: 'px to rem' },
  title: {
    es: 'Conversor de px a rem y em con base configurable',
    en: 'PX to REM and EM converter with custom base size',
  },
  description: {
    es: 'Convierte píxeles a rem y em, y al revés, con el tamaño base que uses. Incluye el CSS listo para copiar y una tabla de tamaños habituales.',
    en: 'Convert pixels to rem and em and back, with your own base font size. Includes ready-to-copy CSS and a table of common sizes.',
  },
  keywords: {
    es: ['px a rem', 'rem a px', 'px a em', 'conversor rem', 'tamaño de fuente css', 'rem css'],
    en: ['px to rem', 'rem to px', 'px to em', 'rem converter', 'css font size', 'rem css'],
  },
  faq: {
    es: [
      {
        q: '¿Qué diferencia hay entre rem y em?',
        a: 'rem se mide respecto al tamaño de letra del elemento raíz (html), que suele ser 16 px. em se mide respecto al tamaño de letra del elemento padre, así que cambia si lo anidas.',
      },
    ],
    en: [
      {
        q: 'What is the difference between rem and em?',
        a: 'rem is relative to the font size of the root element (html), usually 16px. em is relative to the font size of the parent element, so it changes when you nest it.',
      },
    ],
  },
  rememberInput: true,
};
```

`src/tools/px-rem/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    base: 'Tamaño base (px)',
    baseHelp: 'El font-size de html. Casi siempre 16.',
    parent: 'Tamaño del padre (px)',
    parentHelp: 'Para em. Vacío = igual que la base.',
    px: 'px',
    rem: 'rem',
    em: 'em',
    invalid: 'Escribe un número, por ejemplo 1.5.',
    baseZero: 'El tamaño base debe ser mayor que 0.',
    parentZero: 'El tamaño del padre debe ser mayor que 0.',
    css: 'CSS',
    table: 'Tamaños habituales',
    copyRem: 'Copiar {v}rem',
  },
  en: {
    base: 'Base size (px)',
    baseHelp: 'The html font-size. Almost always 16.',
    parent: 'Parent size (px)',
    parentHelp: 'For em. Empty = same as the base.',
    px: 'px',
    rem: 'rem',
    em: 'em',
    invalid: 'Type a number, for example 1.5.',
    baseZero: 'The base size must be greater than 0.',
    parentZero: 'The parent size must be greater than 0.',
    css: 'CSS',
    table: 'Common sizes',
    copyRem: 'Copy {v}rem',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/px-rem/content.es.md`:
```md
## Cómo funciona

Los tres campos (px, rem y em) están sincronizados: escribe en cualquiera y los otros dos se recalculan. `rem = px / base` y `em = px / padre`. El tamaño base es el `font-size` del elemento `html`, que en casi todos los navegadores es 16 px; el del padre solo afecta a em y, si lo dejas vacío, es igual que la base.

Los valores se muestran siempre con punto decimal, también en español, porque son valores de CSS: así lo que copias funciona tal cual en tu hoja de estilos. Al escribir puedes usar coma o punto.

## Por qué usar rem

Un tamaño en rem respeta el tamaño de letra que el usuario ha elegido en su navegador; uno en px, no. Por eso rem es la opción recomendada para textos, márgenes y espacios. La tabla de tamaños habituales te da el valor en rem de 10 a 64 px con la base actual, y el fragmento CSS incluye el valor en px como comentario.
```

`src/tools/px-rem/content.en.md`:
```md
## How it works

The three fields (px, rem and em) stay in sync: type in any of them and the other two update. `rem = px / base` and `em = px / parent`. The base size is the `font-size` of the `html` element, which is 16px in almost every browser; the parent size only affects em and, when left empty, equals the base.

Values always use a decimal point, because they are CSS values: what you copy works as is in your stylesheet. You can type a comma or a point.

## Why rem

A size in rem respects the font size the user picked in their browser; a size in px does not. That is why rem is the recommended unit for text, margins and spacing. The common sizes table gives the rem value from 10 to 64px for the current base, and the CSS snippet keeps the px value as a comment.
```

- [ ] **Step 8: `src/tools/px-rem/PxRem.svelte`**

```svelte
<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { cssSnippet, DEFAULT_BASE, fmt, parseCssNumber, sizeTable } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  type FieldId = 'px' | 'rem' | 'em';
  const FIELDS: FieldId[] = ['px', 'rem', 'em'];

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  // Only the base and the parent are remembered; px is the canonical value on screen.
  const base = persistedInput('px-rem', String(DEFAULT_BASE), remember);
  const parent = persistedInput('px-rem-parent', '', remember);

  const baseN = $derived(parseCssNumber(base.value));
  const parentN = $derived(parent.value.trim() ? parseCssNumber(parent.value) : baseN);
  const baseOk = $derived(baseN !== null && baseN > 0);
  const parentOk = $derived(parentN !== null && parentN > 0);
  const baseError = $derived(baseN === null ? s.invalid : baseN <= 0 ? s.baseZero : undefined);
  const parentError = $derived(
    !parent.value.trim()
      ? undefined
      : parentN === null
        ? s.invalid
        : parentN <= 0
          ? s.parentZero
          : undefined,
  );

  let px = $state(24);
  let texts = $state<Record<FieldId, string>>({ px: '24', rem: '1.5', em: '1.5' });
  let invalid = $state<Record<FieldId, boolean>>({ px: false, rem: false, em: false });

  function computed(f: FieldId): string {
    if (f === 'px') return fmt(px);
    if (f === 'rem') return baseOk ? fmt(px / baseN!) : '';
    return parentOk ? fmt(px / parentN!) : '';
  }

  /** Rewrites every field from px, except the one being typed in (so the cursor stays put). */
  function sync(except: FieldId | null) {
    for (const f of FIELDS) {
      if (f !== except) {
        texts[f] = computed(f);
        invalid[f] = false;
      }
    }
  }

  onMount(() => sync(null));

  // A new base or parent recomputes rem and em from the current px.
  $effect(() => {
    void baseN;
    void parentN;
    untrack(() => sync(null));
  });

  function onField(f: FieldId, value: string) {
    texts[f] = value;
    const n = parseCssNumber(value);
    const ready = f === 'px' || (f === 'rem' ? baseOk : parentOk);
    invalid[f] = n === null;
    if (n === null || !ready) return;
    px = f === 'px' ? n : f === 'rem' ? n * baseN! : n * parentN!;
    sync(f);
  }

  const snippet = $derived(baseOk ? cssSnippet(px, baseN!) : '');
  const table = $derived(baseOk ? sizeTable(baseN!) : []);
</script>

<div class="panel">
  <div class="grid">
    <Field id="px-rem-base" label={s.base} help={s.baseHelp} error={baseError}>
      {#snippet children({ describedby })}
        <input
          id="px-rem-base"
          class="control mono"
          type="text"
          inputmode="decimal"
          autocomplete="off"
          spellcheck="false"
          aria-describedby={describedby}
          aria-invalid={!!baseError}
          bind:value={base.value}
        />
      {/snippet}
    </Field>
    <Field id="px-rem-parent" label={s.parent} help={s.parentHelp} error={parentError}>
      {#snippet children({ describedby })}
        <input
          id="px-rem-parent"
          class="control mono"
          type="text"
          inputmode="decimal"
          autocomplete="off"
          spellcheck="false"
          placeholder={baseOk ? fmt(baseN!) : ''}
          aria-describedby={describedby}
          aria-invalid={!!parentError}
          bind:value={parent.value}
        />
      {/snippet}
    </Field>
  </div>

  <div class="grid">
    {#each FIELDS as f (f)}
      <Field id="px-rem-{f}" label={s[f]} error={invalid[f] ? s.invalid : undefined}>
        {#snippet children({ describedby })}
          <input
            id="px-rem-{f}"
            class="control mono"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            spellcheck="false"
            aria-describedby={describedby}
            aria-invalid={invalid[f]}
            value={texts[f]}
            oninput={(e) => onField(f, e.currentTarget.value)}
            onblur={() => {
              if (!invalid[f]) texts[f] = computed(f);
            }}
          />
        {/snippet}
      </Field>
    {/each}
  </div>

  <Display label={s.css}>
    {#snippet head()}<span>{s.css}</span>{/snippet}
    <pre class="display-code">{snippet}</pre>
  </Display>
  <div class="row">
    <CopyButton main value={snippet} {locale} />
  </div>

  {#if table.length}
    <Display label={s.table}>
      {#snippet head()}<span>{s.table}</span>{/snippet}
      <div class="display-rows">
        {#each table as r (r.px)}
          <div class="display-row">
            <span>{r.px}px = {r.rem}rem</span>
            <CopyButton
              value={`${r.rem}rem`}
              {locale}
              compact
              ariaLabel={fill(s.copyRem, { v: r.rem })}
            />
          </div>
        {/each}
      </div>
    </Display>
  {/if}

  <Toggle
    bind:checked={
      () => base.remember,
      (v) => {
        base.remember = v;
        parent.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
    gap: 16px;
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as pxRem } from './px-rem/meta';
```
→
```ts
import { meta as pxRem } from './px-rem/meta';
```
y
```ts
  // pxRem,
```
→
```ts
  pxRem,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import PxRem from '../tools/px-rem/PxRem.svelte';
```
→
```astro
import PxRem from '../tools/px-rem/PxRem.svelte';
```
y
```astro
{/* {id === 'px-rem' && <PxRem client:load locale={locale} />} */}
```
→
```astro
{id === 'px-rem' && <PxRem client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/conversor-px-rem.html dist/en/px-to-rem-converter.html
git status --porcelain
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `px-rem`: título ≤ 65, descripción de 51 a 160 caracteres, slugs e icono, y sus dos `content.*.md`); existen las dos páginas; `git status` solo lista `src/tools/px-rem/`, `src/tools/registry.ts` y `src/components/ToolIsland.astro`. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador desechable (puerto 4653)**

Crea `.check-px-rem.mjs` en la raíz del worktree (no se confirma):
```js
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4653';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.route('**/analytics.alvarotc.com/**', (r) => r.abort());
await p.route('**/api.frankfurter.dev/**', (r) => r.abort());
await p.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => p.getByText(text).first().waitFor({ timeout: 5000 });
const expectText = (sel, text) =>
  p.locator(sel).filter({ hasText: text }).first().waitFor({ timeout: 5000 });
const expectValue = (sel, v) =>
  p.waitForFunction(([s, want]) => document.querySelector(s)?.value === want, [sel, v], {
    timeout: 5000,
  });
try {
  await p.goto(`${BASE}/es/conversor-px-rem`);
  await p.locator('#px-rem-px').fill('24');
  await expectValue('#px-rem-rem', '1.5');
  await expectText('.display-code', 'font-size: 1.5rem; /* 24px */');
  await p.locator('#px-rem-base').fill('10');
  await expectValue('#px-rem-rem', '2.4');
  await p.locator('#px-rem-rem').fill('0,875');
  await expectValue('#px-rem-px', '8.75');
  await p.locator('#px-rem-base').fill('0');
  await see('El tamaño base debe ser mayor que 0.');
  await p.goto(`${BASE}/en/px-to-rem-converter`);
  await p.locator('.panel').first().waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK px-rem');
} finally {
  await b.close();
}
```

```bash
./node_modules/.bin/astro preview --port 4653 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
sleep 4
node .check-px-rem.mjs
kill $PREVIEW
rm .check-px-rem.mjs
```
Expected: `OK px-rem` y ningún error. El script falla si una espera no se cumple en 5 s o si la página lanza un error. Aborta cualquier petición a `api.frankfurter.dev`: ninguna comprobación depende de la red.

A mano con `pnpm preview`, en `/es/conversor-px-rem`, en tema claro y luego en oscuro y terminal, a 1280 px y a 390 px (sin scroll horizontal):
1. `24` en px → rem `1.5`, em `1.5`; el CSS es `font-size: 1.5rem; /* 24px */`, también en `/es/`.
2. Base `10` → rem `2.4` y la tabla cambia (10 px = `1rem`).
3. Escribe `0,875` en rem con base 16 → px `14`. Padre `20` → em `0.7`.
4. Base `0` → error bajo el campo; rem se vacía.

- [ ] **Step 12: Commit**

```bash
git add src/tools/px-rem src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni `.check-px-rem.mjs`). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(px-rem): conversor de px a rem y em con base configurable"
```

---

### Task 4: chmod: octal, simbólico y casillas sincronizados

**Files:**
- Create: `src/tools/chmod/logic.ts`, `src/tools/chmod/logic.test.ts`, `src/tools/chmod/meta.ts`, `src/tools/chmod/strings.ts`, `src/tools/chmod/content.es.md`, `src/tools/chmod/content.en.md`, `src/tools/chmod/Chmod.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `fill`; `t` (`tool.remember`); kit: `Field`, `Button`, `Display`, `CopyButton`, `Icon`, `Toggle`, `persistedInput`. Las casillas son `<input type="checkbox">` nativos (no `Toggle`, que es `role="switch"`).
- Produces:
  - `type Mode`, `WHO`, `PERMS`, `SETUID`, `SETGID`, `STICKY`, `PRESETS`, `bit`, `has`, `toggle`, `parseOctal`, `toOctal`, `parseSymbolic`, `toSymbolic`, `toLs`, `toChmodSymbolic`, `isWorldWritable`, `describeMode(mode, words, locale)`.
  - `strings.ts` exporta además `sentenceWords` (las palabras de la frase, por idioma), que usa el test.
  - Input recordado: `chmod` (siempre un octal válido).
  - `meta: ToolMeta` (id `chmod`, slugs `calculadora-chmod` / `chmod-calculator`), `strings: Record<Locale, …>`, componente `Chmod` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 15: `#chmod-octal`, `#chmod-symbolic`, casillas con nombre accesible «Propietario: lectura» … «Otros: ejecución» (ids `#chmod-<quién>-<r|w|x>`), `#chmod-setuid`, `#chmod-setgid`, `#chmod-sticky`, `#chmod-command`, `#chmod-ls`.

**§7 (vinculante):** `chmod` · conv · sin pestañas · octal (3 o 4 cifras), simbólico (9 o 10 caracteres) y rejilla 3×3 + setuid/setgid/sticky con casillas nativas de 44 px en táctil; s/S y t/T; `chmod 755 archivo`, `chmod u=rwx,g=rx,o=rx archivo`, forma `ls` y frase; botones 644, 755, 600, 700 y 777; aviso con escritura para otros; errores de cifra, longitud y posición.

Cómo se cubre cada punto:
- Octal ↔ simbólico con bits especiales. Tests de los bloques `octal` y `symbolic`.
- Errores: «8 no es una cifra octal: cada cifra va de 0 a 7.», 5 cifras y la posición del carácter imposible. Tests `names the digit that is not octal`, `rejects the wrong number of digits` y `points at the character that cannot go there`.
- Orden simbólica con `o=` vacío y `s`/`t`. Test `builds the symbolic chmod argument`.
- Frase con las clases fusionadas, idéntica a la de la spec. Test `writes one sentence, merging classes with the same permissions`.
- Aviso «Cualquier usuario podrá modificar el archivo.» con `--bad-text` e icono. Test `warns when others can write`.
- Rejilla y su CSS dentro de `Chmod.svelte` (se pinta en SSR, así que su CSS se conserva); 44 px en `pointer: coarse`.
- Recordar: el octal.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l2-chmod -b lote-2/chmod   # desde el commit de la Task 0
cd ../devtools-l2-chmod
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/chmod/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  bit,
  describeMode,
  isWorldWritable,
  parseOctal,
  parseSymbolic,
  toChmodSymbolic,
  toggle,
  toLs,
  toOctal,
  toSymbolic,
} from './logic';
import { sentenceWords } from './strings';

describe('octal', () => {
  it('reads 3 or 4 digits', () => {
    expect(parseOctal('755')).toEqual({ ok: true, mode: 0o755 });
    expect(parseOctal('0755')).toEqual({ ok: true, mode: 0o755 });
    expect(parseOctal('4755')).toEqual({ ok: true, mode: 0o4755 });
    expect(parseOctal(' 644 ')).toEqual({ ok: true, mode: 0o644 });
  });

  it('names the digit that is not octal', () => {
    expect(parseOctal('758')).toEqual({ ok: false, reason: 'digit', digit: '8' });
    expect(parseOctal('9')).toEqual({ ok: false, reason: 'digit', digit: '9' });
  });

  it('rejects the wrong number of digits', () => {
    expect(parseOctal('75')).toEqual({ ok: false, reason: 'length' });
    expect(parseOctal('12345')).toEqual({ ok: false, reason: 'length' });
    expect(parseOctal('rwx')).toEqual({ ok: false, reason: 'length' });
  });

  it('prints 4 digits only when a special bit is on', () => {
    expect(toOctal(0o755)).toBe('755');
    expect(toOctal(0o4755)).toBe('4755');
    expect(toOctal(0o1777)).toBe('1777');
    expect(toOctal(0)).toBe('000');
  });
});

describe('symbolic', () => {
  it('matches the classic examples', () => {
    expect(toSymbolic(0o755)).toBe('rwxr-xr-x');
    expect(toSymbolic(0o644)).toBe('rw-r--r--');
    expect(toSymbolic(0o600)).toBe('rw-------');
    expect(toLs(0o755)).toBe('-rwxr-xr-x');
    expect(toLs(0o755, 'd')).toBe('drwxr-xr-x');
  });

  it('shows setuid, setgid and sticky as s/S and t/T', () => {
    expect(toSymbolic(0o4755)).toBe('rwsr-xr-x');
    expect(toSymbolic(0o4644)).toBe('rwSr--r--');
    expect(toSymbolic(0o2755)).toBe('rwxr-sr-x');
    expect(toSymbolic(0o1777)).toBe('rwxrwxrwt');
    expect(toSymbolic(0o1776)).toBe('rwxrwxrwT');
  });

  it('parses 9 or 10 characters and round-trips', () => {
    expect(parseSymbolic('rwxr-xr-x')).toEqual({ ok: true, mode: 0o755, type: '-' });
    expect(parseSymbolic('drwxr-xr-x')).toEqual({ ok: true, mode: 0o755, type: 'd' });
    for (const mode of [0o644, 0o4755, 0o4644, 0o2755, 0o1777, 0o1776, 0o7777, 0]) {
      const r = parseSymbolic(toSymbolic(mode));
      expect(r.ok && r.mode).toBe(mode);
    }
  });

  it('points at the character that cannot go there', () => {
    expect(parseSymbolic('rwxrwxrwz')).toEqual({
      ok: false,
      reason: 'char',
      position: 9,
      char: 'z',
      expected: ['x', '-', 't', 'T'],
    });
    expect(parseSymbolic('rwxwwxrwx')).toMatchObject({ reason: 'char', position: 4, char: 'w' });
    expect(parseSymbolic('xrwxr-xr-x')).toMatchObject({ reason: 'char', position: 1 });
    expect(parseSymbolic('rwx')).toEqual({ ok: false, reason: 'length' });
  });
});

describe('chmod command and warnings', () => {
  it('builds the symbolic chmod argument', () => {
    expect(toChmodSymbolic(0o755)).toBe('u=rwx,g=rx,o=rx');
    expect(toChmodSymbolic(0o750)).toBe('u=rwx,g=rx,o=');
    expect(toChmodSymbolic(0o4755)).toBe('u=rwxs,g=rx,o=rx');
    expect(toChmodSymbolic(0o1777)).toBe('u=rwx,g=rwx,o=rwxt');
  });

  it('toggles single bits', () => {
    expect(toggle(0o755, bit('group', 'w'), true)).toBe(0o775);
    expect(toggle(0o775, bit('group', 'w'), false)).toBe(0o755);
  });

  it('warns when others can write', () => {
    expect(isWorldWritable(0o777)).toBe(true);
    expect(isWorldWritable(0o666)).toBe(true);
    expect(isWorldWritable(0o775)).toBe(false);
  });
});

describe('describeMode', () => {
  it('writes one sentence, merging classes with the same permissions', () => {
    expect(describeMode(0o755, sentenceWords.es, 'es')).toBe(
      'El propietario puede leer, escribir y ejecutar; el grupo y los demás, leer y ejecutar.',
    );
    expect(describeMode(0o640, sentenceWords.es, 'es')).toBe(
      'El propietario puede leer y escribir; el grupo, leer; los demás, nada.',
    );
    expect(describeMode(0o755, sentenceWords.en, 'en')).toBe(
      'The owner can read, write, and execute; the group and others, read and execute.',
    );
  });

  it('handles a mode with no permissions at all', () => {
    expect(describeMode(0, sentenceWords.es, 'es')).toBe(
      'El propietario, el grupo y los demás no tienen ningún permiso.',
    );
  });
});
```

El test importa `sentenceWords` de `./strings`: las palabras de la frase son textos y viven en `strings.ts`, pero la función que las combina es pura y se testea.

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/chmod`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/chmod/logic.ts`**

```ts
/** A Unix mode: 12 bits, 0 to 0o7777 (setuid, setgid, sticky, then rwx for u, g and o). */
export type Mode = number;
export type Who = 'owner' | 'group' | 'others';
export type Perm = 'r' | 'w' | 'x';

export const WHO: Who[] = ['owner', 'group', 'others'];
export const PERMS: Perm[] = ['r', 'w', 'x'];
export const SETUID = 0o4000;
export const SETGID = 0o2000;
export const STICKY = 0o1000;
export const PRESETS = ['644', '755', '600', '700', '777'];

const SHIFT: Record<Who, number> = { owner: 6, group: 3, others: 0 };
const VALUE: Record<Perm, number> = { r: 4, w: 2, x: 1 };
const SPECIAL: Record<Who, number> = { owner: SETUID, group: SETGID, others: STICKY };
const SPECIAL_CHAR: Record<Who, [string, string]> = {
  owner: ['s', 'S'],
  group: ['s', 'S'],
  others: ['t', 'T'],
};
const FILE_TYPES = '-dlcbps';

export function bit(who: Who, perm: Perm): number {
  return VALUE[perm] << SHIFT[who];
}

export function has(mode: Mode, mask: number): boolean {
  return (mode & mask) !== 0;
}

export function toggle(mode: Mode, mask: number, on: boolean): Mode {
  return on ? mode | mask : mode & ~mask;
}

export type OctalResult =
  | { ok: true; mode: Mode }
  | { ok: false; reason: 'digit'; digit: string }
  | { ok: false; reason: 'length' };

/** "755", "0755" or "4755". */
export function parseOctal(input: string): OctalResult {
  const s = input.trim();
  const bad = /[89]/.exec(s);
  if (bad && /^\d+$/.test(s)) return { ok: false, reason: 'digit', digit: bad[0] };
  if (!/^[0-7]{3,4}$/.test(s)) return { ok: false, reason: 'length' };
  return { ok: true, mode: parseInt(s, 8) };
}

/** 3 digits, or 4 when setuid, setgid or sticky is on. */
export function toOctal(mode: Mode): string {
  return mode > 0o777 ? mode.toString(8).padStart(4, '0') : mode.toString(8).padStart(3, '0');
}

export type SymbolicResult =
  | { ok: true; mode: Mode; type: string }
  | { ok: false; reason: 'length' }
  | { ok: false; reason: 'char'; position: number; char: string; expected: string[] };

/** "rwxr-xr-x" or, like `ls -l`, "-rwxr-xr-x" / "drwxr-xr-x". Positions in errors are 1-based. */
export function parseSymbolic(input: string): SymbolicResult {
  const s = input.trim();
  if (s.length !== 9 && s.length !== 10) return { ok: false, reason: 'length' };
  let type = '-';
  let offset = 0;
  if (s.length === 10) {
    if (!FILE_TYPES.includes(s[0])) {
      return { ok: false, reason: 'char', position: 1, char: s[0], expected: [...FILE_TYPES] };
    }
    type = s[0];
    offset = 1;
  }
  let mode = 0;
  for (let w = 0; w < 3; w++) {
    const who = WHO[w];
    for (let p = 0; p < 3; p++) {
      const perm = PERMS[p];
      const i = offset + w * 3 + p;
      const c = s[i];
      const [special, specialNoX] = SPECIAL_CHAR[who];
      const expected = perm === 'x' ? ['x', '-', special, specialNoX] : [perm, '-'];
      if (!expected.includes(c)) {
        return { ok: false, reason: 'char', position: i + 1, char: c, expected };
      }
      if (c === perm || c === special) mode |= bit(who, perm);
      if (perm === 'x' && (c === special || c === specialNoX)) mode |= SPECIAL[who];
    }
  }
  return { ok: true, mode, type };
}

/** "rwxr-xr-x", with s/S and t/T in the x positions for the special bits. */
export function toSymbolic(mode: Mode): string {
  let out = '';
  for (const who of WHO) {
    for (const perm of PERMS) {
      const on = has(mode, bit(who, perm));
      if (perm === 'x' && has(mode, SPECIAL[who])) {
        const [special, specialNoX] = SPECIAL_CHAR[who];
        out += on ? special : specialNoX;
      } else {
        out += on ? perm : '-';
      }
    }
  }
  return out;
}

export function toLs(mode: Mode, type = '-'): string {
  return type + toSymbolic(mode);
}

/** "u=rwx,g=rx,o=rx"; a class with no permissions stays as "o=". */
export function toChmodSymbolic(mode: Mode): string {
  const letter: Record<Who, string> = { owner: 'u', group: 'g', others: 'o' };
  return WHO.map((who) => {
    let perms = PERMS.filter((p) => has(mode, bit(who, p))).join('');
    if (has(mode, SPECIAL[who])) perms += who === 'others' ? 't' : 's';
    return `${letter[who]}=${perms}`;
  }).join(',');
}

/** Anyone on the machine can modify the file. */
export function isWorldWritable(mode: Mode): boolean {
  return has(mode, bit('others', 'w'));
}

export interface SentenceWords {
  owner: string;
  group: string;
  others: string;
  r: string;
  w: string;
  x: string;
  can: string;
  canPlural: string;
  nothing: string;
  nothingPlural: string;
  none: string;
}

/**
 * "El propietario puede leer, escribir y ejecutar; el grupo y los demás, leer y ejecutar."
 * Classes with the same permissions are merged; `locale` only drives Intl.ListFormat.
 */
export function describeMode(mode: Mode, words: SentenceWords, locale: string): string {
  const list = new Intl.ListFormat(locale, { type: 'conjunction' });
  const groups: { who: Who[]; perms: Perm[] }[] = [];
  for (const who of WHO) {
    const perms = PERMS.filter((p) => has(mode, bit(who, p)));
    const same = groups.find((g) => g.perms.join('') === perms.join(''));
    if (same) same.who.push(who);
    else groups.push({ who: [who], perms });
  }
  const clauses = groups.map((g, i) => {
    const subject = list.format(g.who.map((w) => words[w]));
    const plural = g.who.length > 1 || g.who[0] === 'others';
    const perms = list.format(g.perms.map((p) => words[p]));
    if (i > 0) return `${subject}, ${g.perms.length ? perms : words.none}`;
    const first = subject.charAt(0).toUpperCase() + subject.slice(1);
    if (!g.perms.length) return `${first} ${plural ? words.nothingPlural : words.nothing}`;
    return `${first} ${plural ? words.canPlural : words.can} ${perms}`;
  });
  return clauses.join('; ') + '.';
}
```

Y `src/tools/chmod/strings.ts`, que el test necesita para las palabras de la frase:
```ts
import type { Locale } from '../types';
import type { SentenceWords } from './logic';

export const strings = {
  es: {
    octal: 'Octal',
    symbolic: 'Simbólico',
    symbolicHelp: 'Como en ls -l: rwxr-xr-x o -rwxr-xr-x.',
    grid: 'Permisos',
    who: 'Quién',
    owner: 'Propietario',
    group: 'Grupo',
    others: 'Otros',
    r: 'Lectura',
    w: 'Escritura',
    x: 'Ejecución',
    special: 'Bits especiales',
    setuid: 'setuid',
    setgid: 'setgid',
    sticky: 'sticky',
    presets: 'Valores habituales',
    result: 'Resultado',
    command: 'Orden',
    commandSymbolic: 'Orden simbólica',
    ls: 'Como en ls -l',
    file: 'archivo',
    worldWritable: 'Cualquier usuario podrá modificar el archivo.',
    digit: '{d} no es una cifra octal: cada cifra va de 0 a 7.',
    length: 'Escribe 3 o 4 cifras octales, como 755 o 4755.',
    symLength: 'Escribe 9 caracteres (rwxr-xr-x) o 10 con el tipo delante (-rwxr-xr-x).',
    symChar: 'El carácter {p} («{c}») no vale ahí: se espera {e}.',
    setuidNote: 'setuid: al ejecutarlo, corre con los permisos del propietario.',
    setgidNote:
      'setgid: corre con los permisos del grupo; en un directorio, lo nuevo hereda su grupo.',
    stickyNote: 'sticky: en un directorio, solo el dueño de cada archivo puede borrarlo.',
  },
  en: {
    octal: 'Octal',
    symbolic: 'Symbolic',
    symbolicHelp: 'Like ls -l: rwxr-xr-x or -rwxr-xr-x.',
    grid: 'Permissions',
    who: 'Who',
    owner: 'Owner',
    group: 'Group',
    others: 'Others',
    r: 'Read',
    w: 'Write',
    x: 'Execute',
    special: 'Special bits',
    setuid: 'setuid',
    setgid: 'setgid',
    sticky: 'sticky',
    presets: 'Common values',
    result: 'Result',
    command: 'Command',
    commandSymbolic: 'Symbolic command',
    ls: 'Like ls -l',
    file: 'file',
    worldWritable: 'Any user will be able to modify the file.',
    digit: '{d} is not an octal digit: each digit goes from 0 to 7.',
    length: 'Type 3 or 4 octal digits, like 755 or 4755.',
    symLength: 'Type 9 characters (rwxr-xr-x) or 10 with the type first (-rwxr-xr-x).',
    symChar: 'Character {p} ("{c}") is not valid there: expected {e}.',
    setuidNote: 'setuid: when run, it gets the owner’s permissions.',
    setgidNote:
      'setgid: it runs with the group’s permissions; in a directory, new files inherit its group.',
    stickyNote: 'sticky: in a directory, only the owner of each file can delete it.',
  },
} satisfies Record<Locale, Record<string, string>>;

export const sentenceWords: Record<Locale, SentenceWords> = {
  es: {
    owner: 'el propietario',
    group: 'el grupo',
    others: 'los demás',
    r: 'leer',
    w: 'escribir',
    x: 'ejecutar',
    can: 'puede',
    canPlural: 'pueden',
    nothing: 'no tiene ningún permiso',
    nothingPlural: 'no tienen ningún permiso',
    none: 'nada',
  },
  en: {
    owner: 'the owner',
    group: 'the group',
    others: 'others',
    r: 'read',
    w: 'write',
    x: 'execute',
    can: 'can',
    canPlural: 'can',
    nothing: 'has no permissions',
    nothingPlural: 'have no permissions',
    none: 'nothing',
  },
};
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/chmod`
Expected: PASS.

- [ ] **Step 6: `meta.ts`**

`src/tools/chmod/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'chmod',
  category: 'conv',
  icon: 'lock',
  slug: { es: 'calculadora-chmod', en: 'chmod-calculator' },
  name: { es: 'chmod', en: 'chmod' },
  title: {
    es: 'Calculadora chmod: permisos octales y simbólicos',
    en: 'Chmod calculator: octal and symbolic permissions',
  },
  description: {
    es: 'Pasa permisos Unix de octal (755) a simbólico (rwxr-xr-x) y al revés, marca casillas y copia la orden chmod lista para la terminal.',
    en: 'Convert Unix permissions from octal (755) to symbolic (rwxr-xr-x) and back, tick boxes and copy the chmod command ready for the terminal.',
  },
  keywords: {
    es: ['chmod', 'permisos linux', 'chmod 755', 'chmod 644', 'rwxr-xr-x', 'permisos unix'],
    en: ['chmod', 'linux permissions', 'chmod 755', 'chmod 644', 'rwxr-xr-x', 'unix permissions'],
  },
  faq: {
    es: [
      {
        q: '¿Qué significa chmod 755?',
        a: 'Cada cifra es la suma de lectura (4), escritura (2) y ejecución (1) para el propietario, el grupo y los demás. 755 = rwx para el propietario y r-x para el grupo y los demás: es lo habitual en scripts y directorios.',
      },
      {
        q: '¿Por qué no debería usar 777?',
        a: 'Con 777 cualquier usuario del sistema puede modificar o borrar el archivo. Casi nunca hace falta: para archivos web suele bastar 644 y para directorios 755.',
      },
    ],
    en: [
      {
        q: 'What does chmod 755 mean?',
        a: 'Each digit is the sum of read (4), write (2) and execute (1) for the owner, the group and others. 755 = rwx for the owner and r-x for the group and others: the usual choice for scripts and directories.',
      },
      {
        q: 'Why should I avoid 777?',
        a: 'With 777 any user on the system can modify or delete the file. It is almost never needed: 644 is usually enough for web files and 755 for directories.',
      },
    ],
  },
  rememberInput: true,
};
```

- [ ] **Step 7: Contenido SEO**

`src/tools/chmod/content.es.md`:
```md
## Cómo funciona

Los permisos Unix tienen tres representaciones y aquí están sincronizadas: el **octal** (`755`), el **simbólico** (`rwxr-xr-x`, el que ves con `ls -l`) y las **casillas** de propietario, grupo y otros. Cambia cualquiera y las demás se actualizan. Debajo tienes la orden `chmod` en las dos formas, lista para copiar, y una frase que explica quién puede hacer qué.

Cada cifra octal es la suma de lectura (4), escritura (2) y ejecución (1). La primera cifra es la del propietario, la segunda la del grupo y la tercera la de los demás. Con cuatro cifras, la primera son los bits especiales: setuid (4), setgid (2) y sticky (1).

## Bits especiales y avisos

En el simbólico, setuid y setgid aparecen como `s` en la posición de ejecución (o `S` si no hay ejecución), y sticky como `t` (o `T`). Si otros usuarios pueden escribir, la herramienta avisa: cualquier usuario del sistema podría modificar el archivo. Los botones rápidos ponen los valores más habituales: 644 para archivos, 755 para scripts y directorios, y 600 o 700 para lo privado.
```

`src/tools/chmod/content.en.md`:
```md
## How it works

Unix permissions have three representations and here they stay in sync: **octal** (`755`), **symbolic** (`rwxr-xr-x`, what `ls -l` shows) and the **checkboxes** for owner, group and others. Change any of them and the rest update. Below you get the `chmod` command in both forms, ready to copy, and a sentence that explains who can do what.

Each octal digit is the sum of read (4), write (2) and execute (1). The first digit is the owner's, the second the group's and the third everybody else's. With four digits, the first one holds the special bits: setuid (4), setgid (2) and sticky (1).

## Special bits and warnings

In symbolic form, setuid and setgid show up as `s` in the execute position (or `S` without execute), and sticky as `t` (or `T`). If other users can write, the tool warns you: any user on the system could modify the file. The quick buttons set the usual values: 644 for files, 755 for scripts and directories, and 600 or 700 for private files.
```

- [ ] **Step 8: `src/tools/chmod/Chmod.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Icon from '../../ui/Icon.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    bit,
    describeMode,
    has,
    isWorldWritable,
    parseOctal,
    parseSymbolic,
    PERMS,
    PRESETS,
    SETGID,
    SETUID,
    STICKY,
    toChmodSymbolic,
    toggle,
    toLs,
    toOctal,
    toSymbolic,
    WHO,
    type Mode,
  } from './logic';
  import { meta } from './meta';
  import { sentenceWords, strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  // The remembered value is always a valid octal string.
  const stored = persistedInput('chmod', '755', meta.rememberInput ?? true);

  let mode = $state<Mode>(0o755);
  let fileType = $state('-');
  let octText = $state('755');
  let symText = $state('rwxr-xr-x');
  let octError = $state<string | undefined>(undefined);
  let symError = $state<string | undefined>(undefined);

  function sync(except: 'octal' | 'symbolic' | null) {
    if (except !== 'octal') {
      octText = toOctal(mode);
      octError = undefined;
    }
    if (except !== 'symbolic') {
      symText = toSymbolic(mode);
      symError = undefined;
    }
  }

  // Runs after persistedInput's own onMount, so a remembered value is already loaded.
  onMount(() => {
    const r = parseOctal(stored.value);
    if (r.ok) mode = r.mode;
    sync(null);
  });

  function setMode(next: Mode, source: 'octal' | 'symbolic' | null) {
    mode = next;
    stored.value = toOctal(next);
    sync(source);
  }

  function onOctal(value: string) {
    octText = value;
    const r = parseOctal(value);
    if (r.ok) {
      octError = undefined;
      setMode(r.mode, 'octal');
    } else {
      octError = r.reason === 'digit' ? fill(s.digit, { d: r.digit }) : s.length;
    }
  }

  function onSymbolic(value: string) {
    symText = value;
    const r = parseSymbolic(value);
    if (r.ok) {
      symError = undefined;
      fileType = r.type;
      setMode(r.mode, 'symbolic');
    } else if (r.reason === 'length') {
      symError = s.symLength;
    } else {
      const expected = new Intl.ListFormat(locale, { type: 'disjunction' }).format(r.expected);
      symError = fill(s.symChar, { p: r.position, c: r.char, e: expected });
    }
  }

  const specials = [
    { mask: SETUID, key: 'setuid', note: 'setuidNote' },
    { mask: SETGID, key: 'setgid', note: 'setgidNote' },
    { mask: STICKY, key: 'sticky', note: 'stickyNote' },
  ] as const;

  const command = $derived(`chmod ${toOctal(mode)} ${s.file}`);
  const symbolicCommand = $derived(`chmod ${toChmodSymbolic(mode)} ${s.file}`);
  const sentence = $derived(describeMode(mode, sentenceWords[locale], locale));
</script>

<div class="panel">
  <div class="fields">
    <Field id="chmod-octal" label={s.octal} error={octError}>
      {#snippet children({ describedby })}
        <input
          id="chmod-octal"
          class="control mono"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          spellcheck="false"
          aria-describedby={describedby}
          aria-invalid={!!octError}
          value={octText}
          oninput={(e) => onOctal(e.currentTarget.value)}
          onblur={() => {
            if (!octError) octText = toOctal(mode);
          }}
        />
      {/snippet}
    </Field>
    <Field id="chmod-symbolic" label={s.symbolic} help={s.symbolicHelp} error={symError}>
      {#snippet children({ describedby })}
        <input
          id="chmod-symbolic"
          class="control mono"
          type="text"
          autocomplete="off"
          spellcheck="false"
          aria-describedby={describedby}
          aria-invalid={!!symError}
          value={symText}
          oninput={(e) => onSymbolic(e.currentTarget.value)}
          onblur={() => {
            if (!symError) symText = toSymbolic(mode);
          }}
        />
      {/snippet}
    </Field>
  </div>

  <div class="presets" role="group" aria-label={s.presets}>
    {#each PRESETS as p (p)}
      <Button onclick={() => setMode(parseInt(p, 8), null)}>{p}</Button>
    {/each}
  </div>

  <table class="grid">
    <caption class="visually-hidden">{s.grid}</caption>
    <thead>
      <tr>
        <th scope="col">{s.who}</th>
        {#each PERMS as perm (perm)}<th scope="col">{s[perm]}</th>{/each}
      </tr>
    </thead>
    <tbody>
      {#each WHO as who (who)}
        <tr>
          <th scope="row">{s[who]}</th>
          {#each PERMS as perm (perm)}
            <td>
              <label class="box">
                <input
                  id="chmod-{who}-{perm}"
                  type="checkbox"
                  aria-label="{s[who]}: {s[perm].toLowerCase()}"
                  checked={has(mode, bit(who, perm))}
                  onchange={(e) =>
                    setMode(toggle(mode, bit(who, perm), e.currentTarget.checked), null)}
                />
              </label>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>

  <fieldset class="specials">
    <legend>{s.special}</legend>
    {#each specials as sp (sp.key)}
      <label class="special">
        <input
          id="chmod-{sp.key}"
          type="checkbox"
          checked={has(mode, sp.mask)}
          onchange={(e) => setMode(toggle(mode, sp.mask, e.currentTarget.checked), null)}
        />
        <span class="mono">{s[sp.key]}</span>
      </label>
    {/each}
  </fieldset>

  <Display live label={s.result}>
    {#snippet head()}<span>{sentence}</span>{/snippet}
    <dl class="display-kv">
      <dt>{s.command}</dt>
      <dd id="chmod-command">{command}</dd>
      <dt>{s.commandSymbolic}</dt>
      <dd>{symbolicCommand}</dd>
      <dt>{s.ls}</dt>
      <dd id="chmod-ls">{toLs(mode, fileType)}</dd>
    </dl>
    {#each specials as sp (sp.key)}
      {#if has(mode, sp.mask)}<p class="display-note">{s[sp.note]}</p>{/if}
    {/each}
  </Display>

  {#if isWorldWritable(mode)}
    <p class="warn" role="status"><Icon name="triangle-alert" size={16} />{s.worldWritable}</p>
  {/if}

  <div class="row">
    <CopyButton main value={command} {locale} label={s.command} />
    <CopyButton value={symbolicCommand} {locale} label={s.commandSymbolic} />
  </div>

  <Toggle bind:checked={stored.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    gap: 16px;
  }
  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .grid {
    border-collapse: collapse;
    width: 100%;
    max-width: 480px;
  }
  .grid th,
  .grid td {
    padding: 4px 8px;
    text-align: center;
    font-size: 14px;
  }
  .grid th[scope='row'] {
    text-align: left;
    font-weight: 600;
  }
  .grid thead th {
    font-size: 13px;
    color: var(--text-dim);
  }
  .grid tbody tr {
    border-top: 1px solid var(--border);
  }
  .box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    cursor: pointer;
  }
  input[type='checkbox'] {
    width: 20px;
    height: 20px;
    margin: 0;
    accent-color: var(--accent);
    cursor: pointer;
  }
  .specials {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
    margin: 0;
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  legend {
    padding: 0 6px;
    font-size: 13px;
    font-weight: 600;
  }
  .special {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 36px;
    cursor: pointer;
  }
  .mono {
    font-family: var(--font-mono);
  }
  .warn {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--bad-text);
  }
  @media (pointer: coarse) {
    .box {
      width: 44px;
      height: 44px;
    }
    .special {
      min-height: 44px;
    }
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as chmod } from './chmod/meta';
```
→
```ts
import { meta as chmod } from './chmod/meta';
```
y
```ts
  // chmod,
```
→
```ts
  chmod,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Chmod from '../tools/chmod/Chmod.svelte';
```
→
```astro
import Chmod from '../tools/chmod/Chmod.svelte';
```
y
```astro
{/* {id === 'chmod' && <Chmod client:load locale={locale} />} */}
```
→
```astro
{id === 'chmod' && <Chmod client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/calculadora-chmod.html dist/en/chmod-calculator.html
git status --porcelain
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `chmod`: título ≤ 65, descripción de 51 a 160 caracteres, slugs e icono, y sus dos `content.*.md`); existen las dos páginas; `git status` solo lista `src/tools/chmod/`, `src/tools/registry.ts` y `src/components/ToolIsland.astro`. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador desechable (puerto 4654)**

Crea `.check-chmod.mjs` en la raíz del worktree (no se confirma):
```js
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4654';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.route('**/analytics.alvarotc.com/**', (r) => r.abort());
await p.route('**/api.frankfurter.dev/**', (r) => r.abort());
await p.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => p.getByText(text).first().waitFor({ timeout: 5000 });
const expectText = (sel, text) =>
  p.locator(sel).filter({ hasText: text }).first().waitFor({ timeout: 5000 });
const expectValue = (sel, v) =>
  p.waitForFunction(([s, want]) => document.querySelector(s)?.value === want, [sel, v], {
    timeout: 5000,
  });
try {
  await p.goto(`${BASE}/es/calculadora-chmod`);
  await p.locator('#chmod-octal').fill('755');
  await expectValue('#chmod-symbolic', 'rwxr-xr-x');
  await p.getByRole('checkbox', { name: 'Grupo: escritura' }).check();
  await expectValue('#chmod-octal', '775');
  await p.locator('#chmod-octal').fill('758');
  await see('8 no es una cifra octal');
  await p.locator('#chmod-symbolic').fill('rwxrwxrwz');
  await see('El carácter 9');
  await p.locator('#chmod-octal').fill('777');
  await see('Cualquier usuario podrá modificar el archivo.');
  await p.goto(`${BASE}/en/chmod-calculator`);
  await p.locator('.panel').first().waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK chmod');
} finally {
  await b.close();
}
```

```bash
./node_modules/.bin/astro preview --port 4654 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
sleep 4
node .check-chmod.mjs
kill $PREVIEW
rm .check-chmod.mjs
```
Expected: `OK chmod` y ningún error. El script falla si una espera no se cumple en 5 s o si la página lanza un error. Aborta cualquier petición a `api.frankfurter.dev`: ninguna comprobación depende de la red.

A mano con `pnpm preview`, en `/es/calculadora-chmod`, en tema claro y luego en oscuro y terminal, a 1280 px y a 390 px (sin scroll horizontal):
1. `755` → `rwxr-xr-x`, `chmod 755 archivo`, `chmod u=rwx,g=rx,o=rx archivo` y la frase de la spec.
2. Marca «Grupo: escritura» → `775`. Pulsa 777 → aviso en rojo.
3. Escribe `drwxr-xr-x` en simbólico → la forma ls empieza por `d`.
4. Marca setuid → `4755` y `rwsr-xr-x`. En el móvil (DevTools, `pointer: coarse`) cada casilla ocupa 44 × 44 px.

- [ ] **Step 12: Commit**

```bash
git add src/tools/chmod src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni `.check-chmod.mjs`). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(chmod): calculadora de permisos octales y simbólicos"
```

---

### Task 5: Tamaños de archivo: SI y binario, bytes exactos y bits

**Files:**
- Create: `src/tools/file-size/logic.ts`, `src/tools/file-size/logic.test.ts`, `src/tools/file-size/meta.ts`, `src/tools/file-size/strings.ts`, `src/tools/file-size/content.es.md`, `src/tools/file-size/content.en.md`, `src/tools/file-size/FileSize.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `parseDecimal`, `formatNumber` (Task 0); `fill`; `t` (`tool.remember`); kit: `Field`, `Display`, `CopyButton`, `Toggle`, `persistedInput`.
- Produces:
  - `UNIT_BYTES`, `SI_UNITS`, `IEC_UNITS`, `type SizeResult`, `parseSize(input, locale)`, `inUnits`, `humanSize`.
  - Input recordado: `file-size` (el texto tal cual).
  - `meta: ToolMeta` (id `file-size`, slugs `conversor-tamano-archivos` / `file-size-converter`), `strings: Record<Locale, …>`, componente `FileSize` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 15: `#file-size-input`; la cabecera del `Display` dice «1 TB = 931,3 GiB»; filas `[data-unit="<unidad>"]` en dos columnas.

**§7 (vinculante):** `file-size` · conv · sin pestañas · texto libre (`1.5 GB`, `1,5 GiB`, `750 MB`, `1024`, `100 Mb`); B/b distintos; `KB` como kB con la nota de Windows; columnas SI e IEC, bytes exactos, bits y forma legible; explicación de los 931 GiB; negativos, fracciones de byte y aviso por encima de 2^53.

Cómo se cubre cada punto:
- Unidades SI, IEC y bits, y número sin unidad = bytes. Tests `reads SI, IEC and bit units` y `reads a bare number as bytes`.
- `KB` = kB con la nota. Test `reads KB as SI and flags the Windows meaning`.
- Fracciones de byte («Menos de un byte: son 4 bits.») y aviso por encima de 2^53. Tests `keeps fractions of a byte` y `warns above 2^53 bytes`.
- Errores con motivo (vacío, número, negativo, unidad desconocida). Test `explains what is wrong`.
- Dos columnas y forma legible (`1,5 GB` → `1,4 GiB`; `1 TB` → `931,3 GiB`). Tests del bloque `conversions`.
- Recordar: el texto introducido.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l2-file-size -b lote-2/file-size   # desde el commit de la Task 0
cd ../devtools-l2-file-size
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/file-size/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { humanSize, IEC_UNITS, inUnits, parseSize, SI_UNITS } from './logic';

const bytes = (input: string, locale: 'es' | 'en' = 'es') => {
  const r = parseSize(input, locale);
  if (!r.ok) throw new Error(r.reason);
  return r.bytes;
};

describe('parseSize', () => {
  it('reads SI, IEC and bit units', () => {
    expect(bytes('1.5 GB', 'en')).toBe(1.5e9);
    expect(bytes('1,5 GiB')).toBe(1_610_612_736);
    expect(bytes('750 MB')).toBe(7.5e8);
    expect(bytes('100 Mb')).toBe(12_500_000);
    expect(bytes('8 b')).toBe(1);
    expect(bytes('1TB')).toBe(1e12);
  });

  it('reads a bare number as bytes', () => {
    expect(parseSize('1024', 'es')).toMatchObject({ ok: true, bytes: 1024, unit: 'B' });
  });

  it('reads KB as SI and flags the Windows meaning', () => {
    expect(parseSize('1 KB', 'es')).toMatchObject({ ok: true, bytes: 1000, windowsKb: true });
    expect(parseSize('1 kB', 'es')).toMatchObject({ ok: true, bytes: 1000, windowsKb: false });
  });

  it('keeps fractions of a byte', () => {
    expect(bytes('0,5 B')).toBe(0.5);
  });

  it('warns above 2^53 bytes', () => {
    expect(parseSize('10 PB', 'es')).toMatchObject({ ok: true, approximate: true });
    expect(parseSize('1 PB', 'es')).toMatchObject({ ok: true, approximate: false });
  });

  it('explains what is wrong', () => {
    expect(parseSize('', 'es')).toEqual({ ok: false, reason: 'empty' });
    expect(parseSize('-1 MB', 'es')).toEqual({ ok: false, reason: 'negative' });
    expect(parseSize('abc', 'es')).toEqual({ ok: false, reason: 'unit', unit: 'abc' });
    expect(parseSize('5 XB', 'es')).toEqual({ ok: false, reason: 'unit', unit: 'XB' });
    expect(parseSize('mb', 'es')).toEqual({ ok: false, reason: 'unit', unit: 'mb' });
    expect(parseSize('1-2 MB', 'es')).toEqual({ ok: false, reason: 'number' });
  });
});

describe('conversions', () => {
  it('lists every SI and IEC unit', () => {
    expect(inUnits(1e12, SI_UNITS).map((r) => r.value)).toEqual([1e12, 1e9, 1e6, 1000, 1, 0.001]);
    const iec = inUnits(1e12, IEC_UNITS);
    expect(iec.find((r) => r.unit === 'GiB')!.value).toBe(931.322574615);
    expect(iec.find((r) => r.unit === 'B')!.value).toBe(1e12);
  });

  it('picks the readable form in each system', () => {
    expect(humanSize(1.5e9, 'si')).toEqual({ value: 1.5, unit: 'GB' });
    expect(humanSize(1.5e9, 'iec')).toEqual({ value: 1.4, unit: 'GiB' });
    expect(humanSize(1e12, 'iec')).toEqual({ value: 931.3, unit: 'GiB' });
    expect(humanSize(1023, 'iec')).toEqual({ value: 1023, unit: 'B' });
    expect(humanSize(1024, 'iec')).toEqual({ value: 1, unit: 'KiB' });
    expect(humanSize(0.5, 'si')).toEqual({ value: 0.5, unit: 'B' });
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/file-size`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/file-size/logic.ts`**

```ts
import { parseDecimal } from '../../lib/numbers';
import type { Locale } from '../types';

/** Bytes per unit. Case matters: B is a byte and b is a bit. */
export const UNIT_BYTES: Record<string, number> = {
  B: 1,
  kB: 1e3,
  KB: 1e3,
  MB: 1e6,
  GB: 1e9,
  TB: 1e12,
  PB: 1e15,
  KiB: 2 ** 10,
  MiB: 2 ** 20,
  GiB: 2 ** 30,
  TiB: 2 ** 40,
  PiB: 2 ** 50,
  b: 1 / 8,
  kb: 1e3 / 8,
  Kb: 1e3 / 8,
  Mb: 1e6 / 8,
  Gb: 1e9 / 8,
};

export const SI_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'];
export const IEC_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
const MAX_SAFE_BYTES = 2 ** 53;

export type SizeResult =
  | {
      ok: true;
      bytes: number;
      unit: string;
      /** "KB" was typed: it is read as kB (SI), but Windows means KiB. */
      windowsKb: boolean;
      /** Above 2^53 bytes the byte count is no longer exact. */
      approximate: boolean;
    }
  | { ok: false; reason: 'empty' | 'number' | 'negative' }
  | { ok: false; reason: 'unit'; unit: string };

/** "1.5 GB", "1,5 GiB", "750 MB", "1024" (bytes) or "100 Mb" (bits). */
export function parseSize(input: string, locale: Locale): SizeResult {
  const s = input.trim();
  if (!s) return { ok: false, reason: 'empty' };
  const m = /^(.*?)\s*([A-Za-z]*)$/.exec(s)!;
  const unit = m[2] || 'B';
  const factor = UNIT_BYTES[unit];
  if (factor === undefined) return { ok: false, reason: 'unit', unit };
  const n = parseDecimal(m[1], locale);
  if (n === null) return { ok: false, reason: 'number' };
  if (n < 0) return { ok: false, reason: 'negative' };
  const bytes = n * factor;
  return {
    ok: true,
    bytes,
    unit,
    windowsKb: unit === 'KB',
    approximate: bytes > MAX_SAFE_BYTES,
  };
}

/** Removes floating-point noise without losing exact byte counts. */
function clean(x: number): number {
  return Number(x.toPrecision(12));
}

export function inUnits(bytes: number, units: string[]): { unit: string; value: number }[] {
  return units.map((unit) => ({ unit, value: clean(bytes / UNIT_BYTES[unit]) }));
}

/** The largest unit that gives at least 1, rounded to one decimal: 1.5 GB → 1.4 GiB. */
export function humanSize(bytes: number, system: 'si' | 'iec'): { value: number; unit: string } {
  const units = system === 'si' ? SI_UNITS : IEC_UNITS;
  let unit = units[0];
  for (const u of units) if (bytes >= UNIT_BYTES[u]) unit = u;
  const value = bytes / UNIT_BYTES[unit];
  return { value: unit === 'B' ? clean(value) : Math.round(value * 10) / 10, unit };
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/file-size`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/file-size/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'file-size',
  category: 'conv',
  icon: 'hard-drive',
  slug: { es: 'conversor-tamano-archivos', en: 'file-size-converter' },
  name: { es: 'Tamaños de archivo', en: 'File sizes' },
  title: {
    es: 'Conversor de tamaños: KB, MB, GB y KiB, MiB, GiB',
    en: 'File size converter: KB, MB, GB vs KiB, MiB, GiB',
  },
  description: {
    es: 'Escribe un tamaño como 1,5 GB o 750 MiB y velo en unidades SI y binarias, en bytes y en bits. Descubre por qué un disco de 1 TB muestra 931 GB.',
    en: 'Type a size like 1.5 GB or 750 MiB and see it in SI and binary units, in bytes and in bits. Find out why a 1 TB drive shows 931 GB.',
  },
  keywords: {
    es: ['mb a gb', 'kb a mb', 'gib a gb', 'mib', 'tamaño de archivo', 'bytes a mb'],
    en: ['mb to gb', 'kb to mb', 'gib to gb', 'mib', 'file size', 'bytes to mb'],
  },
  faq: {
    es: [
      {
        q: '¿Por qué mi disco de 1 TB tiene menos espacio?',
        a: 'El fabricante cuenta 1 TB como 1 000 000 000 000 bytes (SI). Windows divide entre 1024 y lo muestra como unos 931 «GB», que en realidad son GiB. No falta espacio: son dos formas de contar.',
      },
    ],
    en: [
      {
        q: 'Why does my 1 TB drive show less space?',
        a: 'The maker counts 1 TB as 1,000,000,000,000 bytes (SI). Windows divides by 1024 and shows about 931 "GB", which are really GiB. No space is missing: they are two ways of counting.',
      },
    ],
  },
  rememberInput: true,
};
```

`src/tools/file-size/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    input: 'Tamaño',
    placeholder: '1,5 GB, 750 MiB, 1024 o 100 Mb',
    help: 'B es byte y b es bit. Sin unidad, son bytes.',
    result: 'Tamaño convertido',
    si: 'SI (potencias de 1000)',
    iec: 'Binario (potencias de 1024)',
    exact: 'Bytes exactos',
    bits: 'Bits',
    readable: 'Forma legible',
    readableLine: '{si} = {iec}',
    empty: 'Escribe un tamaño, por ejemplo 1,5 GB.',
    number: 'Escribe un número, por ejemplo 1234,5.',
    negative: 'Un tamaño no puede ser negativo.',
    unit: 'No conozco la unidad «{u}». Usa B, kB, MB, GB, TB, PB, KiB, MiB, GiB, TiB, PiB o bits (b, kb, Mb, Gb).',
    subByte: 'Menos de un byte: son {bits} bits.',
    windowsKb: 'Windows escribe KB, MB y GB, pero calcula en KiB, MiB y GiB.',
    approximate: 'Por encima de unos 9 PB (2^53 bytes) el número de bytes es aproximado.',
    explain:
      'Un disco de 1 TB tiene 1 000 000 000 000 bytes, que son unos 931 GiB: por eso Windows muestra 931 «GB».',
    copyUnit: 'Copiar en {u}',
  },
  en: {
    input: 'Size',
    placeholder: '1.5 GB, 750 MiB, 1024 or 100 Mb',
    help: 'B is a byte and b is a bit. With no unit, it is bytes.',
    result: 'Converted size',
    si: 'SI (powers of 1000)',
    iec: 'Binary (powers of 1024)',
    exact: 'Exact bytes',
    bits: 'Bits',
    readable: 'Readable form',
    readableLine: '{si} = {iec}',
    empty: 'Type a size, for example 1.5 GB.',
    number: 'Type a number, for example 1234.5.',
    negative: 'A size cannot be negative.',
    unit: 'Unknown unit "{u}". Use B, kB, MB, GB, TB, PB, KiB, MiB, GiB, TiB, PiB or bits (b, kb, Mb, Gb).',
    subByte: 'Less than a byte: that is {bits} bits.',
    windowsKb: 'Windows writes KB, MB and GB but computes in KiB, MiB and GiB.',
    approximate: 'Above about 9 PB (2^53 bytes) the byte count is approximate.',
    explain:
      'A 1 TB drive holds 1,000,000,000,000 bytes, about 931 GiB: that is why Windows shows 931 "GB".',
    copyUnit: 'Copy in {u}',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/file-size/content.es.md`:
```md
## Cómo funciona

Escribe un tamaño con su unidad, como `1,5 GB`, `750 MiB` o `100 Mb`. Un número sin unidad son bytes. Al momento verás el tamaño en todas las unidades del **Sistema Internacional** (kB, MB, GB…, potencias de 1000) y en todas las **binarias** (KiB, MiB, GiB…, potencias de 1024), además de los bytes exactos, los bits y la forma legible en cada sistema.

Las mayúsculas importan: `B` es byte y `b` es bit, así que `100 Mb` (megabits, como la velocidad de tu fibra) son 12,5 MB. `KB` con K mayúscula se lee como kB del SI, pero ten en cuenta que Windows escribe KB, MB y GB cuando en realidad calcula en KiB, MiB y GiB.

## El misterio de los 931 GB

Los fabricantes de discos usan el SI: 1 TB son 1 000 000 000 000 bytes. Windows divide entre 1024 tres veces y muestra unos 931 «GB», que son 931 GiB. macOS y Linux, en cambio, suelen usar el SI y muestran 1 TB. No te falta espacio: son dos formas de contar el mismo número de bytes.
```

`src/tools/file-size/content.en.md`:
```md
## How it works

Type a size with its unit, like `1.5 GB`, `750 MiB` or `100 Mb`. A number with no unit is bytes. You immediately get the size in every **International System** unit (kB, MB, GB…, powers of 1000) and every **binary** unit (KiB, MiB, GiB…, powers of 1024), plus the exact bytes, the bits and the readable form in each system.

Case matters: `B` is a byte and `b` is a bit, so `100 Mb` (megabits, like your broadband speed) is 12.5 MB. `KB` with a capital K is read as the SI kB, but keep in mind that Windows writes KB, MB and GB while actually computing KiB, MiB and GiB.

## The 931 GB mystery

Drive makers use SI: 1 TB is 1,000,000,000,000 bytes. Windows divides by 1024 three times and shows about 931 "GB", which are 931 GiB. macOS and Linux usually use SI and show 1 TB. No space is missing: they are two ways of counting the same number of bytes.
```

- [ ] **Step 8: `src/tools/file-size/FileSize.svelte`**

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatNumber } from '../../lib/numbers';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { humanSize, IEC_UNITS, inUnits, parseSize, SI_UNITS } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const input = persistedInput('file-size', '1 TB', meta.rememberInput ?? true);

  const parsed = $derived(parseSize(input.value, locale));
  const error = $derived.by(() => {
    if (parsed.ok || parsed.reason === 'empty') return undefined;
    if (parsed.reason === 'unit') return fill(s.unit, { u: parsed.unit });
    return parsed.reason === 'negative' ? s.negative : s.number;
  });
  const bytes = $derived(parsed.ok ? parsed.bytes : null);
  const columns = $derived(
    bytes === null
      ? []
      : [
          { id: 'si', title: s.si, rows: inUnits(bytes, SI_UNITS) },
          { id: 'iec', title: s.iec, rows: inUnits(bytes, IEC_UNITS) },
        ],
  );
  const human = (system: 'si' | 'iec') => {
    const h = humanSize(bytes!, system);
    return `${formatNumber(h.value, locale)} ${h.unit}`;
  };
  const exactBytes = $derived(bytes === null ? '' : formatNumber(bytes, locale, 3));
</script>

<div class="panel">
  <Field id="file-size-input" label={s.input} help={s.help} {error}>
    {#snippet children({ describedby })}
      <input
        id="file-size-input"
        class="control mono"
        type="text"
        autocomplete="off"
        spellcheck="false"
        placeholder={s.placeholder}
        aria-describedby={describedby}
        aria-invalid={!!error}
        bind:value={input.value}
      />
    {/snippet}
  </Field>

  <Display live label={s.result}>
    {#snippet head()}
      <span
        >{bytes === null
          ? (error ?? s.empty)
          : fill(s.readableLine, { si: human('si'), iec: human('iec') })}</span
      >
    {/snippet}
    {#if bytes !== null}
      <div class="columns">
        {#each columns as col (col.id)}
          <section aria-label={col.title}>
            <h3 class="col-title">{col.title}</h3>
            <div class="display-rows">
              {#each col.rows as r (r.unit)}
                {@const shown = formatNumber(r.value, locale)}
                <div class="display-row" data-unit={r.unit}>
                  <span>{shown} {r.unit}</span>
                  <CopyButton
                    value={shown}
                    {locale}
                    compact
                    ariaLabel={fill(s.copyUnit, { u: r.unit })}
                  />
                </div>
              {/each}
            </div>
          </section>
        {/each}
      </div>
      <dl class="display-kv">
        <dt>{s.exact}</dt>
        <dd>{exactBytes} B</dd>
        <dt>{s.bits}</dt>
        <dd>{formatNumber(bytes * 8, locale, 3)} b</dd>
      </dl>
      {#if bytes > 0 && bytes < 1}
        <p class="display-note">{fill(s.subByte, { bits: formatNumber(bytes * 8, locale) })}</p>
      {/if}
      {#if parsed.ok && parsed.windowsKb}<p class="display-note">{s.windowsKb}</p>{/if}
      {#if parsed.ok && parsed.approximate}<p class="display-note">{s.approximate}</p>{/if}
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={exactBytes} {locale} label={s.exact} />
  </div>

  <p class="note">{s.explain}</p>

  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
    gap: 8px 24px;
  }
  .col-title {
    margin-bottom: 8px;
    font: 600 13px/1.3 var(--font-body);
    color: var(--disp-dim);
    text-shadow: none;
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
// import { meta as fileSize } from './file-size/meta';
```
→
```ts
import { meta as fileSize } from './file-size/meta';
```
y
```ts
  // fileSize,
```
→
```ts
  fileSize,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import FileSize from '../tools/file-size/FileSize.svelte';
```
→
```astro
import FileSize from '../tools/file-size/FileSize.svelte';
```
y
```astro
{/* {id === 'file-size' && <FileSize client:load locale={locale} />} */}
```
→
```astro
{id === 'file-size' && <FileSize client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/conversor-tamano-archivos.html dist/en/file-size-converter.html
git status --porcelain
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `file-size`: título ≤ 65, descripción de 51 a 160 caracteres, slugs e icono, y sus dos `content.*.md`); existen las dos páginas; `git status` solo lista `src/tools/file-size/`, `src/tools/registry.ts` y `src/components/ToolIsland.astro`. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador desechable (puerto 4655)**

Crea `.check-file-size.mjs` en la raíz del worktree (no se confirma):
```js
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4655';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.route('**/analytics.alvarotc.com/**', (r) => r.abort());
await p.route('**/api.frankfurter.dev/**', (r) => r.abort());
await p.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => p.getByText(text).first().waitFor({ timeout: 5000 });
const expectText = (sel, text) =>
  p.locator(sel).filter({ hasText: text }).first().waitFor({ timeout: 5000 });
const expectValue = (sel, v) =>
  p.waitForFunction(([s, want]) => document.querySelector(s)?.value === want, [sel, v], {
    timeout: 5000,
  });
try {
  await p.goto(`${BASE}/es/conversor-tamano-archivos`);
  await p.locator('#file-size-input').fill('1 TB');
  await expectText('.display-head', '931,3 GiB');
  await p.locator('#file-size-input').fill('1 KB');
  await see('Windows escribe KB');
  await p.locator('#file-size-input').fill('0,5 B');
  await see('Menos de un byte: son 4 bits.');
  await p.locator('#file-size-input').fill('5 XB');
  await see('No conozco la unidad «XB»');
  await p.goto(`${BASE}/en/file-size-converter`);
  await p.locator('.panel').first().waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK file-size');
} finally {
  await b.close();
}
```

```bash
./node_modules/.bin/astro preview --port 4655 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
sleep 4
node .check-file-size.mjs
kill $PREVIEW
rm .check-file-size.mjs
```
Expected: `OK file-size` y ningún error. El script falla si una espera no se cumple en 5 s o si la página lanza un error. Aborta cualquier petición a `api.frankfurter.dev`: ninguna comprobación depende de la red.

A mano con `pnpm preview`, en `/es/conversor-tamano-archivos`, en tema claro y luego en oscuro y terminal, a 1280 px y a 390 px (sin scroll horizontal):
1. `1 TB` → cabecera «1 TB = 931,3 GiB»; la columna binaria dice `931,322574615 GiB`.
2. `100 Mb` → 12,5 MB. `1 KB` → nota de Windows.
3. `0,5 B` → «Menos de un byte: son 4 bits.». `-1 MB` → error.

- [ ] **Step 12: Commit**

```bash
git add src/tools/file-size src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni `.check-file-size.mjs`). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(file-size): conversor de tamaños SI y binarios"
```

---

### Task 6: Ruleta: lienzo propio, ganador elegido antes de girar y física de muelle

**Files:**
- Create: `src/tools/wheel/logic.ts`, `src/tools/wheel/logic.test.ts`, `src/tools/wheel/meta.ts`, `src/tools/wheel/strings.ts`, `src/tools/wheel/content.es.md`, `src/tools/wheel/content.en.md`, `src/tools/wheel/Wheel.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `cryptoRng`, `randInt`, `type Rng` de `src/lib/random.ts` (lote 1); `fill`; `t` (`tool.remember`); kit: `Field`, `TextArea`, `Toggle`, `Button`, `Display`, `persistedInput`.
- Produces:
  - `MIN_OPTIONS`, `MAX_OPTIONS`, `MAX_HISTORY`, `TAU`, `POINTER`, `parseOptions`, `checkOptions`, `mod`, `segmentAt`, `spinTarget`, `planSpin(rng, theta, n)`, `type Spring`, `SPRING_K`, `SPRING_C`, `STEP`, `MAX_SECONDS`, `stepSpring`, `settled`, `removeOption`, `pushHistory`, `fitLabel`.
  - Input recordado: `wheel` (la lista de opciones). Sin semilla (decisión de la spec).
  - `meta: ToolMeta` (id `wheel`, slugs `ruleta-aleatoria` / `spin-the-wheel`), `strings: Record<Locale, …>`, componente `Wheel` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 15: `#wheel-options`, botón «Girar», interruptor «Quitar la opción ganadora», `<canvas aria-hidden="true">`, cabecera del `Display` con `role="status"`: «Ha salido: Ana».

**§7 (vinculante):** `wheel` · rand · sin pestañas · 2–100 opciones; lienzo en `Wheel.svelte` escalado por `devicePixelRatio`, colores leídos de los tokens en cada repintado, `MutationObserver` de `data-theme` y `ResizeObserver`; geometría `segmentAt`/`θ*`; ganador con `randInt(cryptoRng(), …)` antes de animar; muelle `k = 3`, `c = 3,2`, Euler semi-implícito a 1/120 s, fin por umbrales o a los 8 s; `prefers-reduced-motion` → resultado instantáneo; «Girar» y el `TextArea` desactivados durante el giro; quitar ganadora; historial de 10; `cancelAnimationFrame` en `onDestroy`.

Cómo se cubre cada punto:
- Geometría pura y aterrizaje exacto: 10 000 giros con semilla caen en el ganador. Tests `finds the sector under the pointer`, `lands on the chosen sector for any start angle and offset` y `always lands on the winner in 10 000 seeded spins` (Review Focus 3).
- Muelle: converge antes de 8 s simulados incluso con la distancia máxima (8 vueltas: ~7,26 s) y sobrepasa menos del 1 % (en la práctica, 0,035 %). Tests del bloque `spring` (Review Focus 3).
- La animación vive dentro de la herramienta: `requestAnimationFrame` con pasos fijos de 1/120 s acumulados; la rueda se pinta una vez en un canvas fuera de pantalla y cada fotograma solo la rota y la copia (`drawImage`).
- Movimiento reducido: sin giro, la ruleta aparece en `θ*` y el resultado se anuncia al momento. Lo prueba el e2e de la Task 15 con `emulateMedia({ reducedMotion: 'reduce' })`.
- Durante el giro, un `<fieldset disabled>` desactiva el `TextArea` y el interruptor (el `TextArea` del kit no tiene prop `disabled`), y «Girar» queda `disabled`.
- Colores de los tokens (`--raised`, `--well`, `--surface`, `--text`, `--border-strong`, `--accent`, `--on-accent`): ningún hex. El puntero usa `--text` para verse sobre el sector ganador, que va en `--accent`.
- Etiquetas recortadas con «…» (`fitLabel`, test propio) y ocultas si el sector mide menos de 10 px.
- Quitar la ganadora, historial de 10 y aviso con 1 opción. Tests del bloque `options`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l2-wheel -b lote-2/wheel   # desde el commit de la Task 0
cd ../devtools-l2-wheel
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/wheel/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import {
  checkOptions,
  fitLabel,
  MAX_SECONDS,
  mod,
  parseOptions,
  planSpin,
  pushHistory,
  removeOption,
  segmentAt,
  settled,
  spinTarget,
  STEP,
  stepSpring,
  TAU,
} from './logic';

describe('options', () => {
  it('ignores empty lines and keeps repeated options', () => {
    expect(parseOptions('Ana\n\n  Luis \nAna\r\n')).toEqual(['Ana', 'Luis', 'Ana']);
  });

  it('needs between 2 and 100 options', () => {
    expect(checkOptions(['Ana'])).toBe('few');
    expect(checkOptions(['Ana', 'Luis'])).toBeNull();
    expect(checkOptions(Array.from({ length: 101 }, (_, i) => String(i)))).toBe('many');
  });

  it('removes the winner from the text and nothing else', () => {
    expect(removeOption('Ana\nLuis\n\nEva', 'Luis')).toBe('Ana\n\nEva');
    expect(removeOption('Ana\nAna\nEva', 'Ana')).toBe('Ana\nEva');
    expect(removeOption('Ana', 'Eva')).toBe('Ana');
  });

  it('keeps the last 10 results, newest first', () => {
    let h: string[] = [];
    for (let i = 1; i <= 12; i++) h = pushHistory(h, String(i));
    expect(h).toEqual(['12', '11', '10', '9', '8', '7', '6', '5', '4', '3']);
  });
});

describe('geometry', () => {
  it('normalizes angles to [0, 2π)', () => {
    expect(mod(-1, 5)).toBe(4);
    expect(mod(7, 5)).toBe(2);
  });

  it('finds the sector under the pointer', () => {
    // Not rotated: sector 0 starts at the right (angle 0) and goes clockwise, so the top
    // (−π/2) is inside the last sector.
    expect(segmentAt(0, 4)).toBe(3);
    expect(segmentAt(-Math.PI / 2 - 0.01, 4)).toBe(0);
    expect(segmentAt(Math.PI, 2)).toBe(0);
  });

  it('lands on the chosen sector for any start angle and offset', () => {
    for (const n of [2, 3, 7, 100]) {
      const s = TAU / n;
      for (let i = 0; i < n; i++) {
        for (const theta of [0, 1, -5, 123.4]) {
          expect(segmentAt(spinTarget(theta, i, n, 5, 0.35 * s), n)).toBe(i);
          expect(segmentAt(spinTarget(theta, i, n, 7, -0.35 * s), n)).toBe(i);
        }
      }
    }
  });

  it('always lands on the winner in 10 000 seeded spins', () => {
    const rng = seededRng('wheel');
    let theta = 0;
    for (let k = 0; k < 10_000; k++) {
      const n = 2 + (k % 99);
      const { winner, target } = planSpin(rng, theta, n);
      expect(segmentAt(target, n)).toBe(winner);
      const distance = target - theta;
      expect(distance).toBeGreaterThanOrEqual(5 * TAU);
      expect(distance).toBeLessThan(8 * TAU);
      theta = mod(target, TAU);
    }
  });
});

describe('spring', () => {
  function simulate(distance: number) {
    let st = { theta: 0, omega: 0 };
    let t = 0;
    let overshoot = 0;
    while (t < MAX_SECONDS && !settled(st, distance)) {
      st = stepSpring(st, distance, STEP);
      t += STEP;
      overshoot = Math.max(overshoot, st.theta - distance);
    }
    return { t, overshoot, st };
  }

  it('converges before 8 simulated seconds, even for the longest spin', () => {
    for (const distance of [5 * TAU, 6.5 * TAU, 8 * TAU]) {
      const { t, st } = simulate(distance);
      expect(t).toBeLessThan(MAX_SECONDS);
      expect(settled(st, distance)).toBe(true);
    }
  });

  it('overshoots by less than 1 % of the distance', () => {
    for (const distance of [5 * TAU, 8 * TAU]) {
      expect(simulate(distance).overshoot).toBeLessThan(0.01 * distance);
    }
  });
});

describe('fitLabel', () => {
  const measure = (t: string) => t.length * 10;

  it('keeps labels that fit and shortens the rest with an ellipsis', () => {
    expect(fitLabel('Ana', 100, measure)).toBe('Ana');
    expect(fitLabel('Maximiliano', 60, measure)).toBe('Maxim…');
    expect(fitLabel('Maximiliano', 5, measure)).toBe('');
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/wheel`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/wheel/logic.ts`**

```ts
import { randInt, type Rng } from '../../lib/random';

export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 100;
export const MAX_HISTORY = 10;
export const TAU = 2 * Math.PI;
/** The pointer sits at the top of the wheel. */
export const POINTER = -Math.PI / 2;

/** One option per line; empty lines are ignored and repeated options are kept. */
export function parseOptions(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function checkOptions(options: string[]): 'few' | 'many' | null {
  if (options.length < MIN_OPTIONS) return 'few';
  if (options.length > MAX_OPTIONS) return 'many';
  return null;
}

/** Modulo that is never negative. */
export function mod(a: number, m: number): number {
  return ((a % m) + m) % m;
}

/**
 * Sector under the pointer when the wheel is rotated by `theta`. Sector i covers the local
 * angles [i·s, (i+1)·s), with s = 2π / n.
 */
export function segmentAt(theta: number, n: number): number {
  const s = TAU / n;
  return Math.min(n - 1, Math.floor(mod(POINTER - theta, TAU) / s));
}

/** Final angle that leaves the middle of sector `winner` (shifted by `offset`) under the pointer. */
export function spinTarget(
  theta: number,
  winner: number,
  n: number,
  turns: number,
  offset: number,
) {
  const s = TAU / n;
  return theta + turns * TAU + mod(POINTER - (winner + 0.5) * s - offset - theta, TAU);
}

/** The winner is chosen before animating; the animation only has to land on it. */
export function planSpin(rng: Rng, theta: number, n: number): { winner: number; target: number } {
  const s = TAU / n;
  const winner = randInt(rng, 0, n - 1);
  const offset = (rng() / 2 ** 32 - 0.5) * 0.7 * s; // uniform in [−0.35·s, 0.35·s)
  const turns = randInt(rng, 5, 7);
  return { winner, target: spinTarget(theta, winner, n, turns, offset) };
}

export interface Spring {
  theta: number;
  omega: number;
}

/** θ'' = −k(θ − θ*) − c·θ'. ζ ≈ 0.92: it overshoots by less than 0.1 % of the distance. */
export const SPRING_K = 3;
export const SPRING_C = 3.2;
export const STEP = 1 / 120;
export const MAX_SECONDS = 8;

/** One semi-implicit Euler step. */
export function stepSpring(st: Spring, target: number, dt: number = STEP): Spring {
  const omega = st.omega + (-SPRING_K * (st.theta - target) - SPRING_C * st.omega) * dt;
  return { theta: st.theta + omega * dt, omega };
}

export function settled(st: Spring, target: number): boolean {
  return Math.abs(st.theta - target) < 0.001 && Math.abs(st.omega) < 0.01;
}

/** Removes the first line that holds `option`, keeping every other line as it was. */
export function removeOption(text: string, option: string): string {
  const lines = text.split(/\r?\n/);
  const i = lines.findIndex((l) => l.trim() === option);
  if (i === -1) return text;
  lines.splice(i, 1);
  return lines.join('\n');
}

export function pushHistory(history: string[], item: string): string[] {
  return [item, ...history].slice(0, MAX_HISTORY);
}

/** Shortens `text` with "…" until `measure(text)` fits in `max` pixels. */
export function fitLabel(text: string, max: number, measure: (t: string) => number): string {
  if (measure(text) <= max) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (measure(text.slice(0, mid) + '…') <= max) lo = mid;
    else hi = mid - 1;
  }
  return lo === 0 ? '' : text.slice(0, lo) + '…';
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/wheel`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/wheel/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'wheel',
  category: 'rand',
  icon: 'ferris-wheel',
  slug: { es: 'ruleta-aleatoria', en: 'spin-the-wheel' },
  name: { es: 'Ruleta', en: 'Spin the wheel' },
  title: {
    es: 'Ruleta aleatoria online para sorteos y decisiones',
    en: 'Spin the wheel: random name picker',
  },
  description: {
    es: 'Escribe las opciones, gira la ruleta y deja que el azar decida. Hasta 100 opciones, historial de resultados y opción de quitar la ganadora.',
    en: 'Type your options, spin the wheel and let chance decide. Up to 100 options, a history of results and the option to remove the winner.',
  },
  keywords: {
    es: [
      'ruleta aleatoria',
      'ruleta de nombres',
      'sorteo online',
      'ruleta para decidir',
      'girar ruleta',
    ],
    en: [
      'spin the wheel',
      'random name picker',
      'wheel of names',
      'random picker',
      'decision wheel',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Es realmente aleatoria?',
        a: 'Sí. La opción ganadora se elige antes de girar con el generador criptográfico del navegador (crypto.getRandomValues), y todas tienen la misma probabilidad. La animación solo lleva la ruleta hasta ella.',
      },
    ],
    en: [
      {
        q: 'Is it really random?',
        a: 'Yes. The winner is picked before the spin with the browser’s cryptographic generator (crypto.getRandomValues), and every option has the same chance. The animation only takes the wheel there.',
      },
    ],
  },
  rememberInput: true,
};
```

`src/tools/wheel/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    options: 'Opciones',
    optionsHelp: 'Una por línea, de 2 a 100. Las líneas vacías no cuentan.',
    spin: 'Girar',
    removeWinner: 'Quitar la opción ganadora',
    result: 'Resultado',
    idle: 'Pulsa Girar para elegir una opción.',
    spinning: 'Girando…',
    winner: 'Ha salido: {v}',
    history: 'Últimos resultados',
    few: 'Añade al menos dos opciones.',
    many: 'Como mucho 100 opciones: hay {n}.',
    count: '{n} opciones',
  },
  en: {
    options: 'Options',
    optionsHelp: 'One per line, from 2 to 100. Empty lines do not count.',
    spin: 'Spin',
    removeWinner: 'Remove the winning option',
    result: 'Result',
    idle: 'Press Spin to pick an option.',
    spinning: 'Spinning…',
    winner: 'The winner is: {v}',
    history: 'Latest results',
    few: 'Add at least two options.',
    many: 'At most 100 options: there are {n}.',
    count: '{n} options',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/wheel/content.es.md`:
```md
## Cómo funciona

Escribe las opciones, una por línea (de 2 a 100; puedes repetir una para darle más peso), y pulsa **Girar**. La ganadora se elige **antes** de que la ruleta empiece a moverse, con el generador criptográfico del navegador, así que todas las opciones tienen exactamente la misma probabilidad. La animación solo lleva la ruleta hasta ella y se frena como un muelle.

Si tienes activado «Reducir movimiento» en tu sistema, la ruleta no gira: aparece directamente en la opción ganadora y el resultado se anuncia al momento.

## Para sorteos

Activa «Quitar la opción ganadora» para ir sacando nombres sin repetir, como en un sorteo de varios premios. Debajo verás los 10 últimos resultados. La ruleta no admite semilla a propósito: tiene que ser imprevisible. Si necesitas un sorteo que se pueda repetir y comprobar, usa la herramienta de mezclar una lista o la de hacer equipos, que sí la tienen.
```

`src/tools/wheel/content.en.md`:
```md
## How it works

Type the options, one per line (2 to 100; repeat one to give it more weight), and press **Spin**. The winner is picked **before** the wheel starts moving, with the browser's cryptographic generator, so every option has exactly the same chance. The animation only takes the wheel there and slows down like a spring.

If "Reduce motion" is on in your system settings, the wheel does not spin: it jumps straight to the winner and the result is announced right away.

## For draws

Turn on "Remove the winning option" to draw names without repeats, as in a raffle with several prizes. Below you see the last 10 results. The wheel has no seed on purpose: it has to be unpredictable. If you need a draw that can be repeated and checked, use the list shuffler or the team generator, which do have one.
```

- [ ] **Step 8: `src/tools/wheel/Wheel.svelte`**

```svelte
<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { cryptoRng } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    checkOptions,
    fitLabel,
    MAX_OPTIONS,
    MAX_SECONDS,
    mod,
    parseOptions,
    planSpin,
    pushHistory,
    removeOption,
    settled,
    STEP,
    stepSpring,
    TAU,
    type Spring,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const list = persistedInput('wheel', 'Ana\nLuis\nEva\nMarta', meta.rememberInput ?? true);

  const options = $derived(parseOptions(list.value));
  const problem = $derived(checkOptions(options));
  const error = $derived(
    problem === 'few'
      ? s.few
      : problem === 'many'
        ? fill(s.many, { n: options.length })
        : undefined,
  );

  let spinning = $state(false);
  let removeWinner = $state(false);
  let result = $state<string | null>(null);
  let winnerIndex = $state<number | null>(null);
  let history = $state<string[]>([]);
  let size = $state(0);
  let wrap = $state<HTMLDivElement>();
  let canvas = $state<HTMLCanvasElement>();

  // Not reactive on purpose: the animation writes it 60+ times per second and only paint() reads it.
  let theta = 0;
  let raf = 0;
  // The wheel is drawn once at rotation 0; each frame only rotates and copies it (drawImage).
  let wheelImage: HTMLCanvasElement | null = null;
  let pointerColor = '';
  let borderColor = '';

  /** Colours come from the theme tokens, read again on every full repaint. */
  function palette() {
    const cs = getComputedStyle(document.documentElement);
    const v = (name: string) => cs.getPropertyValue(name).trim();
    return {
      fills: [v('--raised'), v('--well'), v('--surface')],
      text: v('--text'),
      border: v('--border-strong'),
      accent: v('--accent'),
      onAccent: v('--on-accent'),
      font: v('--font-body'),
    };
  }

  function renderWheel(opts: string[], highlight: number | null) {
    const dpr = window.devicePixelRatio || 1;
    const px = Math.round(size * dpr);
    const off = document.createElement('canvas');
    off.width = px;
    off.height = px;
    const ctx = off.getContext('2d');
    if (!ctx) return;
    const c = palette();
    pointerColor = c.text;
    borderColor = c.border;
    const center = px / 2;
    const r = center - 2 * dpr;
    const n = Math.max(1, opts.length);
    const step = TAU / n;
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, r, i * step, (i + 1) * step);
      ctx.closePath();
      // Three alternating fills; the last sector never matches the first one.
      const k = n % 3 === 1 && i === n - 1 && n > 1 ? 1 : i % 3;
      ctx.fillStyle = i === highlight ? c.accent : c.fills[k];
      ctx.fill();
      ctx.strokeStyle = c.border;
      ctx.lineWidth = dpr;
      ctx.stroke();
    }
    // Labels are hidden when a sector is less than 10px tall; the text list stays the source.
    if (opts.length && step * r * 0.75 >= 10 * dpr) {
      const fontPx = Math.max(11, Math.min(16, (step * r * 0.45) / dpr)) * dpr;
      ctx.font = `600 ${fontPx}px ${c.font}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < opts.length; i++) {
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate((i + 0.5) * step);
        ctx.fillStyle = i === highlight ? c.onAccent : c.text;
        const label = fitLabel(opts[i], r * 0.62, (txt) => ctx.measureText(txt).width);
        ctx.fillText(label, r - 14 * dpr, 0);
        ctx.restore();
      }
    }
    ctx.beginPath();
    ctx.arc(center, center, r * 0.07, 0, TAU);
    ctx.fillStyle = c.accent;
    ctx.fill();
    wheelImage = off;
  }

  function paint() {
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !wheelImage) return;
    const px = canvas.width;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, px, px);
    ctx.save();
    ctx.translate(px / 2, px / 2);
    ctx.rotate(theta);
    ctx.drawImage(wheelImage, -px / 2, -px / 2);
    ctx.restore();
    // The pointer: a triangle at the top, pointing down into the wheel. It uses --text, not
    // --accent, so it stays visible over the highlighted (accent) winner.
    ctx.beginPath();
    ctx.moveTo(px / 2 - 12 * dpr, 1 * dpr);
    ctx.lineTo(px / 2 + 12 * dpr, 1 * dpr);
    ctx.lineTo(px / 2, 24 * dpr);
    ctx.closePath();
    ctx.fillStyle = pointerColor;
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = dpr;
    ctx.stroke();
  }

  function redraw() {
    if (!canvas || size === 0) return;
    const px = Math.round(size * (window.devicePixelRatio || 1));
    canvas.width = px;
    canvas.height = px;
    renderWheel(options.slice(0, MAX_OPTIONS), winnerIndex);
    paint();
  }

  // Repaint on resize and on theme change; both observers go away with the component.
  $effect(() => {
    if (!wrap) return;
    const el = wrap;
    const ro = new ResizeObserver(() => (size = Math.min(400, el.clientWidth)));
    ro.observe(el);
    const mo = new MutationObserver(() => redraw());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  });

  // Full repaint when the options, the size or the highlighted winner change.
  $effect(() => {
    void options;
    void size;
    void winnerIndex;
    untrack(redraw);
  });

  function spin() {
    if (spinning || problem) return;
    const frozen = [...options];
    const plan = planSpin(cryptoRng(), theta, frozen.length);
    winnerIndex = null;
    result = null;

    const finish = () => {
      theta = mod(plan.target, TAU);
      spinning = false;
      const winner = frozen[plan.winner];
      result = winner;
      history = pushHistory(history, winner);
      if (removeWinner) {
        list.value = removeOption(list.value, winner);
        winnerIndex = null;
      } else {
        winnerIndex = plan.winner;
      }
      redraw();
    };

    // With reduced motion there is no spin: the wheel jumps to the result.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }

    spinning = true;
    let st: Spring = { theta, omega: 0 };
    let acc = 0;
    let elapsed = 0;
    let last = performance.now();
    const frame = (now: number) => {
      // Fixed 1/120 s steps, whatever the display's refresh rate.
      acc += Math.min(0.1, (now - last) / 1000);
      last = now;
      while (acc >= STEP) {
        st = stepSpring(st, plan.target, STEP);
        acc -= STEP;
        elapsed += STEP;
      }
      theta = st.theta;
      if (settled(st, plan.target) || elapsed >= MAX_SECONDS) {
        raf = 0;
        finish();
        return;
      }
      paint();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }

  // Leaving the page mid-spin stops the animation. `raf` is 0 during SSR, where onDestroy also runs.
  onDestroy(() => {
    if (raf) cancelAnimationFrame(raf);
  });
</script>

<div class="panel">
  <div class="layout">
    <div class="wheel" bind:this={wrap}>
      <canvas bind:this={canvas} aria-hidden="true" style:width="{size}px" style:height="{size}px"
      ></canvas>
    </div>

    <div class="stack side">
      <!-- A disabled fieldset disables every control inside it while the wheel spins. -->
      <fieldset class="plain" disabled={spinning}>
        <Field id="wheel-options" label={s.options} help={s.optionsHelp} {error}>
          {#snippet children({ describedby })}
            <TextArea
              id="wheel-options"
              bind:value={list.value}
              rows={8}
              mono={false}
              {describedby}
              invalid={!!error}
            />
          {/snippet}
        </Field>
        <Toggle bind:checked={removeWinner} label={s.removeWinner} />
      </fieldset>
      <div class="row">
        <Button variant="primary" icon="refresh-cw" onclick={spin} disabled={spinning || !!problem}
          >{s.spin}</Button
        >
        <span class="count">{fill(s.count, { n: options.length })}</span>
      </div>
    </div>
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <span>{result ? fill(s.winner, { v: result }) : spinning ? s.spinning : s.idle}</span>
    {/snippet}
    {#if result}<div class="display-value">{result}</div>{/if}
    {#if history.length}
      <p class="display-note">{s.history}</p>
      <ol class="history">
        {#each history as h, i (i)}<li>{h}</li>{/each}
      </ol>
    {/if}
  </Display>

  <Toggle bind:checked={list.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 400px) minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }
  @media (max-width: 720px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .wheel {
    width: 100%;
    max-width: 400px;
    aspect-ratio: 1;
  }
  canvas {
    display: block;
  }
  .side {
    min-width: 0;
  }
  .plain {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }
  .count {
    font-size: 13px;
    color: var(--text-dim);
  }
  .history {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    margin: 0;
    padding-left: 1.2em;
    font: 500 14px/1.4 var(--font-mono);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as wheel } from './wheel/meta';
```
→
```ts
import { meta as wheel } from './wheel/meta';
```
y
```ts
  // wheel,
```
→
```ts
  wheel,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Wheel from '../tools/wheel/Wheel.svelte';
```
→
```astro
import Wheel from '../tools/wheel/Wheel.svelte';
```
y
```astro
{/* {id === 'wheel' && <Wheel client:load locale={locale} />} */}
```
→
```astro
{id === 'wheel' && <Wheel client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/ruleta-aleatoria.html dist/en/spin-the-wheel.html
git status --porcelain
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `wheel`: título ≤ 65, descripción de 51 a 160 caracteres, slugs e icono, y sus dos `content.*.md`); existen las dos páginas; `git status` solo lista `src/tools/wheel/`, `src/tools/registry.ts` y `src/components/ToolIsland.astro`. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador desechable (puerto 4656)**

Crea `.check-wheel.mjs` en la raíz del worktree (no se confirma):
```js
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4656';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.route('**/analytics.alvarotc.com/**', (r) => r.abort());
await p.route('**/api.frankfurter.dev/**', (r) => r.abort());
await p.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => p.getByText(text).first().waitFor({ timeout: 5000 });
const expectText = (sel, text) =>
  p.locator(sel).filter({ hasText: text }).first().waitFor({ timeout: 5000 });
const expectValue = (sel, v) =>
  p.waitForFunction(([s, want]) => document.querySelector(s)?.value === want, [sel, v], {
    timeout: 5000,
  });
try {
  await p.goto(`${BASE}/es/ruleta-aleatoria`);
  // Real spin, without reduced motion: it lasts about 7 seconds.
  await p.locator('#wheel-options').fill('Ana\nLuis\nEva');
  await p.getByRole('button', { name: 'Girar' }).click();
  await p.waitForTimeout(500);
  if (!(await p.locator('#wheel-options').isDisabled())) throw new Error('textarea not disabled');
  await p.getByText(/Ha salido: (Ana|Luis|Eva)/).waitFor({ timeout: 10_000 });
  await p.locator('#wheel-options').fill('Ana');
  await see('Añade al menos dos opciones.');
  await p.goto(`${BASE}/en/spin-the-wheel`);
  await p.locator('.panel').first().waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK wheel');
} finally {
  await b.close();
}
```

```bash
./node_modules/.bin/astro preview --port 4656 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
sleep 4
node .check-wheel.mjs
kill $PREVIEW
rm .check-wheel.mjs
```
Expected: `OK wheel` y ningún error. El script falla si una espera no se cumple en 5 s o si la página lanza un error. Aborta cualquier petición a `api.frankfurter.dev`: ninguna comprobación depende de la red.

A mano con `pnpm preview`, en `/es/ruleta-aleatoria`, en tema claro y luego en oscuro y terminal, a 1280 px y a 390 px (sin scroll horizontal):
1. Gira: dura unos 7 s, se frena sin rebotar y el sector ganador se ilumina bajo el puntero; el `TextArea` está gris mientras gira.
2. Cambia de tema durante o después del giro: la ruleta se repinta con los colores nuevos.
3. Con «Emular prefers-reduced-motion: reduce» (DevTools → Rendering), el resultado sale al instante.
4. Pega 100 opciones: se ocultan las etiquetas y el resultado sigue anunciándose. Navega a otra página a mitad de giro: sin errores en la consola.

- [ ] **Step 12: Commit**

```bash
git add src/tools/wheel src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni `.check-wheel.mjs`). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(wheel): ruleta con física de muelle y movimiento reducido"
```

---

### Task 7: Mezclar lista: Fisher–Yates con semilla opcional

**Files:**
- Create: `src/tools/shuffle/logic.ts`, `src/tools/shuffle/logic.test.ts`, `src/tools/shuffle/meta.ts`, `src/tools/shuffle/strings.ts`, `src/tools/shuffle/content.es.md`, `src/tools/shuffle/content.en.md`, `src/tools/shuffle/Shuffle.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `shuffle`, `rngFromSeed`, `type Rng` de `src/lib/random.ts` (lote 1); `ui.seed` y `ui.seedHelp` (lote 1); `fill`; `t`; kit: `Field`, `TextArea`, `Toggle`, `NumberInput`, `Button`, `Display`, `CopyButton`, `persistedInput`.
- Produces:
  - `MIN_ITEMS`, `parseItems(text, ignoreEmpty)`, `shuffleList(rng, items, keep?)`.
  - Inputs recordados: `shuffle` (lista) y `shuffle-seed` (semilla).
  - `meta: ToolMeta` (id `shuffle`, slugs `mezclar-lista-aleatoria` / `random-list-shuffler`), `strings: Record<Locale, …>`, componente `Shuffle` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 15: `#shuffle-list`, `#shuffle-seed`, `#shuffle-keep`, botón «Mezclar», filas `.display-row .item`, aviso «Con semilla: el orden es siempre el mismo.».

**§7 (vinculante):** `shuffle` · rand · sin pestañas · `TextArea`, «Ignorar líneas vacías» (activado), «Quedarse con los primeros» (1 a N), `ui.seed` y «Mezclar»; con semilla, en vivo y determinista; sin semilla, `cryptoRng()` en cada pulsación; lista numerada y `CopyButton main` sin números; menos de 2 → error; repetidos se conservan.

Cómo se cubre cada punto:
- Fisher–Yates de `lib/random.ts`, uniforme. Test `puts every item first about as often (uniform)`.
- Semilla: mismo resultado con la misma semilla; otro con otra. Tests `is deterministic with a seed` y `gives other orders with other seeds` (propiedades, no secuencias fijas: no dependen de los detalles internos de `seededRng`).
- Repetidos y líneas vacías según el interruptor. Tests `splits lines and drops empty ones only when asked` y `returns a permutation of the same items, repeated ones included`.
- «Quedarse con los primeros». Test `keeps only the first N items`.
- El orden aleatorio solo se calcula en el navegador (`mounted`), nunca en el HTML generado.
- Recordar: lista y semilla.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l2-shuffle -b lote-2/shuffle   # desde el commit de la Task 0
cd ../devtools-l2-shuffle
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/shuffle/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import { parseItems, shuffleList } from './logic';

const ITEMS = ['a', 'b', 'c', 'd', 'e'];

describe('parseItems', () => {
  it('splits lines and drops empty ones only when asked', () => {
    expect(parseItems('a\n\nb\r\nb', true)).toEqual(['a', 'b', 'b']);
    expect(parseItems('a\n\nb', false)).toEqual(['a', '', 'b']);
    expect(parseItems('', true)).toEqual([]);
    expect(parseItems('', false)).toEqual([]);
  });
});

describe('shuffleList', () => {
  it('returns a permutation of the same items, repeated ones included', () => {
    const items = [...ITEMS, 'a'];
    const out = shuffleList(seededRng('demo'), items);
    expect([...out].sort()).toEqual([...items].sort());
    expect(items).toEqual([...ITEMS, 'a']);
  });

  it('is deterministic with a seed', () => {
    expect(shuffleList(seededRng('demo'), ITEMS)).toEqual(shuffleList(seededRng('demo'), ITEMS));
  });

  it('gives other orders with other seeds', () => {
    const orders = new Set(
      ['1', '2', '3', '4', '5', '6', '7', '8'].map((s) =>
        shuffleList(seededRng(s), ITEMS).join(''),
      ),
    );
    expect(orders.size).toBeGreaterThan(1);
  });

  it('keeps only the first N items', () => {
    const all = shuffleList(seededRng('demo'), ITEMS);
    expect(shuffleList(seededRng('demo'), ITEMS, 2)).toEqual(all.slice(0, 2));
    expect(shuffleList(seededRng('demo'), ITEMS, 99)).toHaveLength(5);
    expect(shuffleList(seededRng('demo'), ITEMS, 0)).toHaveLength(1);
  });

  it('puts every item first about as often (uniform)', () => {
    const rng = seededRng('uniform');
    const firsts: Record<string, number> = {};
    for (let i = 0; i < 50_000; i++) {
      const f = shuffleList(rng, ITEMS)[0];
      firsts[f] = (firsts[f] ?? 0) + 1;
    }
    for (const item of ITEMS) {
      expect(firsts[item]).toBeGreaterThan(9_000);
      expect(firsts[item]).toBeLessThan(11_000);
    }
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/shuffle`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/shuffle/logic.ts`**

```ts
import { shuffle, type Rng } from '../../lib/random';

export const MIN_ITEMS = 2;

/** One item per line. Repeated items are kept; empty lines only when asked to. */
export function parseItems(text: string, ignoreEmpty: boolean): string[] {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  return ignoreEmpty ? lines.filter((l) => l.trim() !== '') : lines;
}

/** Uniform Fisher–Yates shuffle; with `keep`, only the first `keep` items are returned. */
export function shuffleList(rng: Rng, items: readonly string[], keep?: number): string[] {
  const out = shuffle(rng, items);
  return keep === undefined ? out : out.slice(0, Math.max(1, Math.min(keep, out.length)));
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/shuffle`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/shuffle/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'shuffle',
  category: 'rand',
  icon: 'shuffle',
  slug: { es: 'mezclar-lista-aleatoria', en: 'random-list-shuffler' },
  name: { es: 'Mezclar lista', en: 'Shuffle list' },
  title: {
    es: 'Mezclar una lista al azar: ordenar aleatoriamente',
    en: 'Random list shuffler: randomize any list',
  },
  description: {
    es: 'Pega una lista, un elemento por línea, y ordénala al azar con un algoritmo uniforme. Con semilla, el orden se puede repetir y comprobar.',
    en: 'Paste a list, one item per line, and put it in random order with a uniform algorithm. With a seed, the order can be repeated and checked.',
  },
  keywords: {
    es: ['mezclar lista', 'ordenar al azar', 'lista aleatoria', 'sorteo de orden', 'barajar lista'],
    en: ['shuffle list', 'randomize list', 'random order', 'list randomizer', 'shuffle names'],
  },
  rememberInput: true,
};
```

`src/tools/shuffle/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    list: 'Lista',
    listHelp: 'Un elemento por línea. Los repetidos se conservan.',
    ignoreEmpty: 'Ignorar líneas vacías',
    limit: 'Quedarse con los primeros',
    keep: 'Cuántos',
    shuffle: 'Mezclar',
    result: 'Lista mezclada',
    few: 'Añade al menos dos elementos.',
    count: '{n} elementos',
    seeded: 'Con semilla: el orden es siempre el mismo.',
    emptyLine: '(línea vacía)',
    copyAll: 'Copiar la lista',
  },
  en: {
    list: 'List',
    listHelp: 'One item per line. Repeated items are kept.',
    ignoreEmpty: 'Ignore empty lines',
    limit: 'Keep only the first',
    keep: 'How many',
    shuffle: 'Shuffle',
    result: 'Shuffled list',
    few: 'Add at least two items.',
    count: '{n} items',
    seeded: 'With a seed: the order is always the same.',
    emptyLine: '(empty line)',
    copyAll: 'Copy the list',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/shuffle/content.es.md`:
```md
## Cómo funciona

Pega la lista con un elemento por línea y pulsa **Mezclar**. La herramienta usa el algoritmo de Fisher–Yates con números del generador criptográfico del navegador: todas las ordenaciones posibles tienen la misma probabilidad. Los elementos repetidos se conservan y, si quieres, puedes quedarte solo con los primeros N (por ejemplo, para elegir 3 ganadores de una lista).

## Con semilla

Si escribes una semilla (cualquier texto, como `sorteo-2026`), el orden deja de depender del azar del momento: la misma lista con la misma semilla da siempre el mismo resultado, en tu equipo y en el de cualquiera. Sirve para sorteos que otros tienen que poder comprobar: publica la lista y la semilla, y cualquiera puede repetir la mezcla. Sin semilla, cada pulsación de Mezclar da un orden nuevo.
```

`src/tools/shuffle/content.en.md`:
```md
## How it works

Paste the list with one item per line and press **Shuffle**. The tool uses the Fisher–Yates algorithm with numbers from the browser's cryptographic generator: every possible order has the same probability. Repeated items are kept and, if you like, you can keep only the first N (for example, to pick 3 winners from a list).

## With a seed

If you type a seed (any text, like `raffle-2026`), the order no longer depends on the chance of the moment: the same list with the same seed always gives the same result, on your device and on anyone else's. It is useful for draws others need to verify: publish the list and the seed, and anyone can repeat the shuffle. Without a seed, each press of Shuffle gives a new order.
```

- [ ] **Step 8: `src/tools/shuffle/Shuffle.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { rngFromSeed } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { MIN_ITEMS, parseItems, shuffleList } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const list = persistedInput('shuffle', 'Ana\nLuis\nEva\nMarta\nPablo', remember);
  const seed = persistedInput('shuffle-seed', '', remember);

  let ignoreEmpty = $state(true);
  let limit = $state(false);
  let keep = $state(3);
  // Bumped by the button: without a seed, each press draws a new order.
  let nonce = $state(0);
  // Random output is only computed in the browser, never baked into the HTML.
  let mounted = $state(false);
  onMount(() => (mounted = true));

  const items = $derived(parseItems(list.value, ignoreEmpty));
  const few = $derived(items.length < MIN_ITEMS);
  const seeded = $derived(seed.value.trim() !== '');
  const result = $derived.by(() => {
    void nonce;
    if (!mounted || few) return [];
    return shuffleList(rngFromSeed(seed.value), items, limit ? keep : undefined);
  });
</script>

<div class="panel">
  <Field id="shuffle-list" label={s.list} help={s.listHelp} error={few ? s.few : undefined}>
    {#snippet children({ describedby })}
      <TextArea
        id="shuffle-list"
        bind:value={list.value}
        rows={8}
        mono={false}
        {describedby}
        invalid={few}
      />
    {/snippet}
  </Field>

  <div class="row">
    <Toggle bind:checked={ignoreEmpty} label={s.ignoreEmpty} />
    <Toggle bind:checked={limit} label={s.limit} />
    {#if limit}
      <Field id="shuffle-keep" label={s.keep}>
        {#snippet children({ describedby })}
          <NumberInput
            id="shuffle-keep"
            bind:value={keep}
            min={1}
            max={Math.max(1, items.length)}
            {describedby}
          />
        {/snippet}
      </Field>
    {/if}
  </div>

  <div class="row">
    <div class="seed">
      <Field id="shuffle-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
        {#snippet children({ describedby })}
          <input
            id="shuffle-seed"
            class="control mono"
            type="text"
            autocomplete="off"
            spellcheck="false"
            aria-describedby={describedby}
            bind:value={seed.value}
          />
        {/snippet}
      </Field>
    </div>
    <Button variant="primary" icon="refresh-cw" disabled={few} onclick={() => nonce++}
      >{s.shuffle}</Button
    >
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <span>{few ? s.few : fill(s.count, { n: result.length })}</span>
      {#if seeded}<span>{s.seeded}</span>{/if}
    {/snippet}
    {#if result.length}
      <ol class="display-rows list">
        {#each result as item, i (i)}
          <li class="display-row">
            <span class="n">{i + 1}</span>
            <span class="item">{item || s.emptyLine}</span>
          </li>
        {/each}
      </ol>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={result.join('\n')} {locale} label={s.copyAll} />
  </div>

  <Toggle
    bind:checked={
      () => list.remember,
      (v) => {
        list.remember = v;
        seed.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .seed {
    flex: 1 1 220px;
    max-width: 360px;
  }
  .list {
    padding: 0;
    list-style: none;
  }
  .list .display-row {
    justify-content: flex-start;
  }
  .n {
    min-width: 2.5ch;
    text-align: right;
    color: var(--disp-dim);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as shuffle } from './shuffle/meta';
```
→
```ts
import { meta as shuffle } from './shuffle/meta';
```
y
```ts
  // shuffle,
```
→
```ts
  shuffle,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Shuffle from '../tools/shuffle/Shuffle.svelte';
```
→
```astro
import Shuffle from '../tools/shuffle/Shuffle.svelte';
```
y
```astro
{/* {id === 'shuffle' && <Shuffle client:load locale={locale} />} */}
```
→
```astro
{id === 'shuffle' && <Shuffle client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/mezclar-lista-aleatoria.html dist/en/random-list-shuffler.html
git status --porcelain
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `shuffle`: título ≤ 65, descripción de 51 a 160 caracteres, slugs e icono, y sus dos `content.*.md`); existen las dos páginas; `git status` solo lista `src/tools/shuffle/`, `src/tools/registry.ts` y `src/components/ToolIsland.astro`. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador desechable (puerto 4657)**

Crea `.check-shuffle.mjs` en la raíz del worktree (no se confirma):
```js
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4657';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.route('**/analytics.alvarotc.com/**', (r) => r.abort());
await p.route('**/api.frankfurter.dev/**', (r) => r.abort());
await p.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => p.getByText(text).first().waitFor({ timeout: 5000 });
const expectText = (sel, text) =>
  p.locator(sel).filter({ hasText: text }).first().waitFor({ timeout: 5000 });
const expectValue = (sel, v) =>
  p.waitForFunction(([s, want]) => document.querySelector(s)?.value === want, [sel, v], {
    timeout: 5000,
  });
try {
  await p.goto(`${BASE}/es/mezclar-lista-aleatoria`);
  await p.locator('#shuffle-list').fill('a\nb\nc\nd\ne');
  await p.locator('#shuffle-seed').fill('demo');
  await see('Con semilla: el orden es siempre el mismo.');
  const items = p.locator('.display-row .item');
  const order = await items.allTextContents();
  if ([...order].sort().join('') !== 'abcde') throw new Error(`bad shuffle ${order}`);
  await p.waitForTimeout(500);
  await p.reload();
  await see('Con semilla: el orden es siempre el mismo.');
  if ((await items.allTextContents()).join('') !== order.join('')) throw new Error('order changed');
  await p.locator('#shuffle-list').fill('a');
  await see('Añade al menos dos elementos.');
  await p.goto(`${BASE}/en/random-list-shuffler`);
  await p.locator('.panel').first().waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK shuffle');
} finally {
  await b.close();
}
```

```bash
./node_modules/.bin/astro preview --port 4657 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
sleep 4
node .check-shuffle.mjs
kill $PREVIEW
rm .check-shuffle.mjs
```
Expected: `OK shuffle` y ningún error. El script falla si una espera no se cumple en 5 s o si la página lanza un error. Aborta cualquier petición a `api.frankfurter.dev`: ninguna comprobación depende de la red.

A mano con `pnpm preview`, en `/es/mezclar-lista-aleatoria`, en tema claro y luego en oscuro y terminal, a 1280 px y a 390 px (sin scroll horizontal):
1. Semilla `demo` → el orden no cambia al pulsar Mezclar ni al recargar.
2. Sin semilla, cada «Mezclar» da un orden nuevo. Copiar pega una línea por elemento, sin números.
3. Con una sola línea → «Añade al menos dos elementos.».

- [ ] **Step 12: Commit**

```bash
git add src/tools/shuffle src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni `.check-shuffle.mjs`). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(shuffle): mezclar listas con Fisher–Yates y semilla opcional"
```

---

### Task 8: Equipos: reparto equilibrado por número o por tamaño

**Files:**
- Create: `src/tools/teams/logic.ts`, `src/tools/teams/logic.test.ts`, `src/tools/teams/meta.ts`, `src/tools/teams/strings.ts`, `src/tools/teams/content.es.md`, `src/tools/teams/content.en.md`, `src/tools/teams/Teams.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `shuffle`, `rngFromSeed`, `type Rng` (lote 1); `ui.seed`, `ui.seedHelp`; `fill`; `t`; kit: `Field`, `TextArea`, `Segmented`, `NumberInput`, `Button`, `Display`, `CopyButton`, `Toggle`, `persistedInput`.
- Produces:
  - `type TeamMode`, `parsePeople`, `teamCount`, `type TeamsResult`, `makeTeams(rng, people, mode, n)`, `teamsToText`.
  - Inputs recordados: `teams` (participantes), `teams-mode` y `teams-n`. La semilla y el prefijo no se guardan (la spec solo pide participantes, modo y N).
  - `meta: ToolMeta` (id `teams`, slugs `generador-equipos-aleatorios` / `random-team-generator`), `strings: Record<Locale, …>`, componente `Teams` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 15: `#teams-people`, radios «Número de equipos» / «Personas por equipo», `#teams-n`, `#teams-seed`, `#teams-prefix`, botón «Hacer equipos», un `section.team` por equipo con sus `li`.

**§7 (vinculante):** `teams` · rand · sin pestañas · participantes, Segmented secundario «Número de equipos · Personas por equipo», N, `ui.seed`, «Hacer equipos»; mezcla, `k = N` o `ceil(total / N)`, reparto por turnos (10 de 3 en 3 → 3, 3, 2 y 2) y explicación; bloque por equipo con prefijo editable; copiar «Equipo 1: Ana, Luis, …».

Cómo se cubre cada punto:
- Tamaños que difieren como mucho en 1, con el ejemplo de la spec. Tests `splits by team size with sizes that differ by one at most` y `splits into a number of teams`.
- Todos una sola vez y determinismo con semilla. Tests `puts everybody in exactly one team` e `is deterministic with a seed`.
- N = 1 y errores («Hay 5 personas y 6 equipos: baja el número de equipos»). Tests `makes one shuffled team with N = 1` y `explains impossible splits`.
- Explicación del reparto cuando no es exacto («salen 4 equipos de 3, 3, 2 y 2») con `Intl.ListFormat`.
- Prefijo editable y copia por líneas. Test `copies one team per line`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l2-teams -b lote-2/teams   # desde el commit de la Task 0
cd ../devtools-l2-teams
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/teams/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import { makeTeams, parsePeople, teamCount, teamsToText } from './logic';

const TEN = ['Ana', 'Luis', 'Eva', 'Marta', 'Pablo', 'Sara', 'Hugo', 'Lucía', 'Iván', 'Noa'];

const sizes = (r: ReturnType<typeof makeTeams>) => (r.ok ? r.teams.map((t) => t.length) : []);

describe('makeTeams', () => {
  it('splits by team size with sizes that differ by one at most', () => {
    expect(teamCount(10, 'size', 3)).toBe(4);
    expect(sizes(makeTeams(seededRng('demo'), TEN, 'size', 3))).toEqual([3, 3, 2, 2]);
    expect(sizes(makeTeams(seededRng('demo'), TEN, 'size', 5))).toEqual([5, 5]);
  });

  it('splits into a number of teams', () => {
    expect(sizes(makeTeams(seededRng('demo'), TEN, 'count', 3))).toEqual([4, 3, 3]);
    expect(sizes(makeTeams(seededRng('demo'), TEN, 'count', 10))).toEqual(Array(10).fill(1));
  });

  it('puts everybody in exactly one team', () => {
    const r = makeTeams(seededRng('demo'), TEN, 'count', 4);
    expect(r.ok && r.teams.flat().sort()).toEqual([...TEN].sort());
  });

  it('is deterministic with a seed', () => {
    expect(makeTeams(seededRng('x'), TEN, 'count', 3)).toEqual(
      makeTeams(seededRng('x'), TEN, 'count', 3),
    );
  });

  it('makes one shuffled team with N = 1', () => {
    expect(sizes(makeTeams(seededRng('demo'), TEN, 'count', 1))).toEqual([10]);
    expect(sizes(makeTeams(seededRng('demo'), TEN, 'size', 20))).toEqual([10]);
  });

  it('explains impossible splits', () => {
    const five = TEN.slice(0, 5);
    expect(makeTeams(seededRng('demo'), five, 'count', 6)).toEqual({
      ok: false,
      reason: 'tooManyTeams',
      people: 5,
      teams: 6,
    });
    expect(makeTeams(seededRng('demo'), ['Ana'], 'count', 1)).toEqual({ ok: false, reason: 'few' });
    expect(makeTeams(seededRng('demo'), TEN, 'count', 0)).toEqual({ ok: false, reason: 'n' });
  });
});

describe('text', () => {
  it('reads one person per line', () => {
    expect(parsePeople(' Ana \n\nLuis\r\n')).toEqual(['Ana', 'Luis']);
  });

  it('copies one team per line', () => {
    expect(
      teamsToText(
        [
          ['Ana', 'Luis'],
          ['Eva', 'Marta'],
        ],
        'Equipo',
      ),
    ).toBe('Equipo 1: Ana, Luis\nEquipo 2: Eva, Marta');
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/teams`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/teams/logic.ts`**

```ts
import { shuffle, type Rng } from '../../lib/random';

export type TeamMode = 'count' | 'size';

/** One person per line, trimmed; empty lines are ignored. */
export function parsePeople(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Number of teams: N itself, or ceil(total / N) when N is the size of each team. */
export function teamCount(total: number, mode: TeamMode, n: number): number {
  return mode === 'count' ? n : Math.ceil(total / n);
}

export type TeamsResult =
  | { ok: true; teams: string[][] }
  | { ok: false; reason: 'few' }
  | { ok: false; reason: 'n' }
  | { ok: false; reason: 'tooManyTeams'; people: number; teams: number };

/**
 * Shuffles and deals the people in turns, so team sizes differ by one at most:
 * 10 people, 3 per team → 4 teams of 3, 3, 2 and 2 (not 3, 3, 3 and 1).
 */
export function makeTeams(rng: Rng, people: string[], mode: TeamMode, n: number): TeamsResult {
  if (people.length < 2) return { ok: false, reason: 'few' };
  if (!Number.isInteger(n) || n < 1) return { ok: false, reason: 'n' };
  const k = teamCount(people.length, mode, n);
  if (k > people.length) {
    return { ok: false, reason: 'tooManyTeams', people: people.length, teams: k };
  }
  const teams: string[][] = Array.from({ length: k }, () => []);
  shuffle(rng, people).forEach((p, i) => teams[i % k].push(p));
  return { ok: true, teams };
}

/** "Equipo 1: Ana, Luis" per line. */
export function teamsToText(teams: string[][], prefix: string): string {
  return teams.map((t, i) => `${prefix} ${i + 1}: ${t.join(', ')}`).join('\n');
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/teams`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/teams/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'teams',
  category: 'rand',
  icon: 'users',
  slug: { es: 'generador-equipos-aleatorios', en: 'random-team-generator' },
  name: { es: 'Equipos', en: 'Teams' },
  title: {
    es: 'Generador de equipos aleatorios y sorteo de grupos',
    en: 'Random team generator: split a list into groups',
  },
  description: {
    es: 'Reparte una lista de personas en equipos al azar, por número de equipos o por personas por equipo, con tamaños equilibrados y semilla opcional.',
    en: 'Split a list of people into random teams, by number of teams or by people per team, with balanced sizes and an optional seed.',
  },
  keywords: {
    es: [
      'generador de equipos',
      'hacer equipos',
      'sorteo de grupos',
      'equipos aleatorios',
      'dividir en grupos',
    ],
    en: ['team generator', 'random teams', 'group generator', 'split into groups', 'random groups'],
  },
  rememberInput: true,
};
```

`src/tools/teams/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    people: 'Participantes',
    peopleHelp: 'Una persona por línea.',
    mode: 'Repartir por',
    count: 'Número de equipos',
    size: 'Personas por equipo',
    n: 'N',
    prefix: 'Nombre de los equipos',
    prefixDefault: 'Equipo',
    make: 'Hacer equipos',
    result: 'Equipos',
    summary: '{n} personas en {k} equipos',
    few: 'Añade al menos dos personas.',
    nInvalid: 'N debe ser un número entero mayor que 0.',
    tooMany: 'Hay {p} personas y {k} equipos: baja el número de equipos.',
    balanced:
      'Con {p} personas y {n} por equipo salen {k} equipos de {sizes}: se reparten para que nadie se quede solo.',
    copyAll: 'Copiar los equipos',
  },
  en: {
    people: 'Participants',
    peopleHelp: 'One person per line.',
    mode: 'Split by',
    count: 'Number of teams',
    size: 'People per team',
    n: 'N',
    prefix: 'Team name',
    prefixDefault: 'Team',
    make: 'Make teams',
    result: 'Teams',
    summary: '{n} people in {k} teams',
    few: 'Add at least two people.',
    nInvalid: 'N must be a whole number greater than 0.',
    tooMany: 'There are {p} people and {k} teams: lower the number of teams.',
    balanced:
      'With {p} people and {n} per team you get {k} teams of {sizes}: they are balanced so nobody is left alone.',
    copyAll: 'Copy the teams',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/teams/content.es.md`:
```md
## Cómo funciona

Escribe los participantes, uno por línea, y elige cómo repartirlos: por **número de equipos** (por ejemplo, 3 equipos) o por **personas por equipo** (por ejemplo, equipos de 4). La herramienta mezcla la lista con un algoritmo uniforme y reparte a las personas por turnos, así que los tamaños de los equipos nunca se diferencian en más de una persona.

Por eso, con 10 personas y 3 por equipo no salen tres equipos de 3 y uno de 1, sino cuatro equipos de 3, 3, 2 y 2: nadie se queda solo. Puedes cambiar el nombre de los equipos («Grupo», «Mesa»…) y copiarlos todos, uno por línea.

## Con semilla

Con una semilla, el reparto es siempre el mismo para la misma lista: útil si otros tienen que poder comprobar que el sorteo fue limpio. Sin semilla, cada vez que pulsas «Hacer equipos» sale un reparto nuevo.
```

`src/tools/teams/content.en.md`:
```md
## How it works

Type the participants, one per line, and choose how to split them: by **number of teams** (for example, 3 teams) or by **people per team** (for example, teams of 4). The tool shuffles the list with a uniform algorithm and deals people out in turns, so team sizes never differ by more than one person.

That is why 10 people in teams of 3 do not give three teams of 3 and one of 1, but four teams of 3, 3, 2 and 2: nobody is left alone. You can rename the teams ("Group", "Table"…) and copy them all, one per line.

## With a seed

With a seed, the split is always the same for the same list: useful when others need to verify the draw was fair. Without a seed, each press of "Make teams" gives a new split.
```

- [ ] **Step 8: `src/tools/teams/Teams.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { rngFromSeed } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { makeTeams, parsePeople, teamsToText, type TeamMode } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const people = persistedInput(
    'teams',
    'Ana\nLuis\nEva\nMarta\nPablo\nSara\nHugo\nLucía',
    remember,
  );
  const modeStore = persistedInput('teams-mode', 'count', remember);
  const nStore = persistedInput('teams-n', '2', remember);

  let seed = $state('');
  let prefix = $state('');
  let nonce = $state(0);
  let mounted = $state(false);
  onMount(() => (mounted = true));

  const mode = $derived<TeamMode>(modeStore.value === 'size' ? 'size' : 'count');
  const n = $derived(Number(nStore.value));
  const list = $derived(parsePeople(people.value));
  const result = $derived.by(() => {
    void nonce;
    return makeTeams(rngFromSeed(seed), list, mode, n);
  });
  // Without a seed the order is random, so it is only drawn in the browser.
  const teams = $derived(mounted && result.ok ? result.teams : []);
  const name = $derived(prefix.trim() || s.prefixDefault);
  const error = $derived.by(() => {
    if (result.ok) return undefined;
    if (result.reason === 'few') return s.few;
    if (result.reason === 'n') return s.nInvalid;
    return fill(s.tooMany, { p: result.people, k: result.teams });
  });
  const balanced = $derived.by(() => {
    if (!result.ok || mode !== 'size' || list.length % n === 0) return '';
    const sizes = new Intl.ListFormat(locale, { type: 'conjunction' }).format(
      result.teams.map((team) => String(team.length)),
    );
    return fill(s.balanced, { p: list.length, n, k: result.teams.length, sizes });
  });
</script>

<div class="panel">
  <Field id="teams-people" label={s.people} help={s.peopleHelp}>
    {#snippet children({ describedby })}
      <TextArea
        id="teams-people"
        bind:value={people.value}
        rows={8}
        mono={false}
        {describedby}
        invalid={!result.ok && result.reason === 'few'}
      />
    {/snippet}
  </Field>

  <div class="row">
    <div class="stack tight">
      <span class="label">{s.mode}</span>
      <Segmented
        label={s.mode}
        options={[
          { value: 'count', label: s.count },
          { value: 'size', label: s.size },
        ]}
        bind:value={() => mode, (v) => (modeStore.value = v)}
      />
    </div>
    <Field id="teams-n" label={mode === 'count' ? s.count : s.size}>
      {#snippet children({ describedby })}
        <NumberInput
          id="teams-n"
          bind:value={() => n, (v) => (nStore.value = String(v))}
          min={1}
          max={1000}
          {describedby}
        />
      {/snippet}
    </Field>
  </div>

  <div class="row">
    <div class="grow">
      <Field id="teams-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
        {#snippet children({ describedby })}
          <input
            id="teams-seed"
            class="control mono"
            type="text"
            autocomplete="off"
            spellcheck="false"
            aria-describedby={describedby}
            bind:value={seed}
          />
        {/snippet}
      </Field>
    </div>
    <div class="grow">
      <Field id="teams-prefix" label={s.prefix}>
        {#snippet children({ describedby })}
          <input
            id="teams-prefix"
            class="control"
            type="text"
            autocomplete="off"
            placeholder={s.prefixDefault}
            aria-describedby={describedby}
            bind:value={prefix}
          />
        {/snippet}
      </Field>
    </div>
    <Button variant="primary" icon="refresh-cw" disabled={!result.ok} onclick={() => nonce++}
      >{s.make}</Button
    >
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <span>{error ?? fill(s.summary, { n: list.length, k: teams.length })}</span>
    {/snippet}
    {#if teams.length}
      <div class="teams">
        {#each teams as team, i (i)}
          <section class="team" aria-label="{name} {i + 1}">
            <h3>{name} {i + 1} <span class="size">({team.length})</span></h3>
            <ul>
              {#each team as person, j (j)}<li>{person}</li>{/each}
            </ul>
          </section>
        {/each}
      </div>
    {/if}
    {#if balanced}<p class="display-note">{balanced}</p>{/if}
  </Display>

  <div class="row">
    <CopyButton main value={teamsToText(teams, name)} {locale} label={s.copyAll} />
  </div>

  <Toggle
    bind:checked={
      () => people.remember,
      (v) => {
        people.remember = v;
        modeStore.remember = v;
        nStore.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .tight {
    gap: 8px;
  }
  .label {
    font-size: 13px;
    font-weight: 600;
  }
  .grow {
    flex: 1 1 200px;
    max-width: 320px;
  }
  .teams {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 180px), 1fr));
    gap: 16px;
  }
  .team h3 {
    margin-bottom: 6px;
    font: 600 14px/1.3 var(--font-body);
    text-shadow: none;
  }
  .size {
    font-weight: 400;
    color: var(--disp-dim);
  }
  .team ul {
    margin: 0;
    padding-left: 1.1em;
    font: 500 14px/1.6 var(--font-mono);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as teams } from './teams/meta';
```
→
```ts
import { meta as teams } from './teams/meta';
```
y
```ts
  // teams,
```
→
```ts
  teams,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Teams from '../tools/teams/Teams.svelte';
```
→
```astro
import Teams from '../tools/teams/Teams.svelte';
```
y
```astro
{/* {id === 'teams' && <Teams client:load locale={locale} />} */}
```
→
```astro
{id === 'teams' && <Teams client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/generador-equipos-aleatorios.html dist/en/random-team-generator.html
git status --porcelain
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `teams`: título ≤ 65, descripción de 51 a 160 caracteres, slugs e icono, y sus dos `content.*.md`); existen las dos páginas; `git status` solo lista `src/tools/teams/`, `src/tools/registry.ts` y `src/components/ToolIsland.astro`. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador desechable (puerto 4658)**

Crea `.check-teams.mjs` en la raíz del worktree (no se confirma):
```js
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4658';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.route('**/analytics.alvarotc.com/**', (r) => r.abort());
await p.route('**/api.frankfurter.dev/**', (r) => r.abort());
await p.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => p.getByText(text).first().waitFor({ timeout: 5000 });
const expectText = (sel, text) =>
  p.locator(sel).filter({ hasText: text }).first().waitFor({ timeout: 5000 });
const expectValue = (sel, v) =>
  p.waitForFunction(([s, want]) => document.querySelector(s)?.value === want, [sel, v], {
    timeout: 5000,
  });
try {
  await p.goto(`${BASE}/es/generador-equipos-aleatorios`);
  const people = ['Ana', 'Luis', 'Eva', 'Marta', 'Pablo', 'Sara', 'Hugo', 'Lucía', 'Iván', 'Noa'];
  await p.locator('#teams-people').fill(people.join('\n'));
  await p.getByRole('radio', { name: 'Personas por equipo' }).click();
  await p.locator('#teams-n').fill('3');
  await p.waitForFunction(() => document.querySelectorAll('.team').length === 4);
  const sizes = await p
    .locator('.team')
    .evaluateAll((els) => els.map((el) => el.querySelectorAll('li').length));
  if (sizes.join() !== '3,3,2,2') throw new Error(`sizes ${sizes}`);
  await see('salen 4 equipos de 3, 3, 2 y 2');
  await p.getByRole('radio', { name: 'Número de equipos' }).click();
  await p.locator('#teams-n').fill('11');
  await see('Hay 10 personas y 11 equipos');
  await p.goto(`${BASE}/en/random-team-generator`);
  await p.locator('.panel').first().waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK teams');
} finally {
  await b.close();
}
```

```bash
./node_modules/.bin/astro preview --port 4658 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
sleep 4
node .check-teams.mjs
kill $PREVIEW
rm .check-teams.mjs
```
Expected: `OK teams` y ningún error. El script falla si una espera no se cumple en 5 s o si la página lanza un error. Aborta cualquier petición a `api.frankfurter.dev`: ninguna comprobación depende de la red.

A mano con `pnpm preview`, en `/es/generador-equipos-aleatorios`, en tema claro y luego en oscuro y terminal, a 1280 px y a 390 px (sin scroll horizontal):
1. 10 nombres, «Personas por equipo» y 3 → cuatro bloques de 3, 3, 2 y 2 con la explicación.
2. Cambia el nombre a «Mesa» → «Mesa 1», «Mesa 2»… también en lo copiado.
3. «Número de equipos» 11 con 10 personas → error. Con semilla, «Hacer equipos» no cambia el reparto.

- [ ] **Step 12: Commit**

```bash
git add src/tools/teams src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni `.check-teams.mjs`). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(teams): generador de equipos equilibrados con semilla"
```

---

### Task 9: Dados y moneda: notación NdM±K, semilla e historial

**Files:**
- Create: `src/tools/dice/logic.ts`, `src/tools/dice/logic.test.ts`, `src/tools/dice/meta.ts`, `src/tools/dice/strings.ts`, `src/tools/dice/content.es.md`, `src/tools/dice/content.en.md`, `src/tools/dice/Dice.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `randInt`, `rngFromSeed`, `type Rng` (lote 1); `ui.seed`, `ui.seedHelp`; `fill`; `t`; kit: `Segmented`, `Field`, `NumberInput`, `Button`, `Display`, `CopyButton`, `Toggle`, `persistedInput`.
- Produces:
  - `QUICK_SIDES`, `LIMITS`, `MAX_HISTORY`, `type DiceSpec`, `parseDice`, `formatSpec`, `type Roll`, `rollDice`, `diceRange`, `type Coin`, `flipCoins`, `countCoins`, `pushHistory`.
  - Inputs recordados: `dice` (notación) y `dice-coins` (número de monedas).
  - `meta: ToolMeta` (id `dice`, slugs `lanzar-dados-moneda` / `dice-roller-coin-flip`), `strings: Record<Locale, …>`, componente `Dice` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 15: `Segmented main` Dados · Moneda, `#dice-notation`, botones d4…d100, botón «Lanzar», `#dice-seed`, `.die` por dado o moneda, `#dice-total`, `#dice-coins`, `#dice-coin-count`.

**§7 (vinculante):** `dice` · rand · pestañas Dados · Moneda · `NdM`, `NdM+K`, `NdM-K`, `dM`; rangos N 1–100, M 2–1000, K ±1000; botones rápidos; cada dado, suma, modificador, total en `Display value`, mínimo y máximo; 1–100 monedas con recuento; semilla: el `Rng` se crea una vez y la serie se repite; historial de 10.

Cómo se cubre cada punto:
- Notación, mayúsculas y espacios. Test `reads NdM, NdM+K, NdM-K and dM`.
- Errores con el rango («Entre 1 y 100 dados: has puesto 0.») y el de formato. Tests `names the value that is out of range` y `rejects text it does not understand`.
- Tiradas dentro de rango, total = suma + K, mínimo y máximo. Tests `rolls each die within its faces and adds the modifier` y `gives the minimum and maximum totals`.
- Serie reproducible con semilla: el `Rng` es un `$derived` de la semilla, así que se crea una vez por semilla y avanza con cada tirada. Test `repeats the same series with the same seed`; en el navegador, el Step 11 y el e2e `dice with a seed repeats the whole series of rolls, not just the first` tiran 5 veces, comprueban que los totales cambian y que la misma semilla repite los 5.
- Moneda y recuento; historial de 10. Tests del bloque `coins`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l2-dice -b lote-2/dice   # desde el commit de la Task 0
cd ../devtools-l2-dice
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/dice/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import {
  countCoins,
  diceRange,
  flipCoins,
  formatSpec,
  parseDice,
  pushHistory,
  rollDice,
} from './logic';

describe('parseDice', () => {
  it('reads NdM, NdM+K, NdM-K and dM', () => {
    expect(parseDice('3d6')).toEqual({ ok: true, spec: { count: 3, sides: 6, modifier: 0 } });
    expect(parseDice('2d20+1')).toEqual({ ok: true, spec: { count: 2, sides: 20, modifier: 1 } });
    expect(parseDice(' 4D6 - 2 ')).toEqual({
      ok: true,
      spec: { count: 4, sides: 6, modifier: -2 },
    });
    expect(parseDice('d100')).toEqual({ ok: true, spec: { count: 1, sides: 100, modifier: 0 } });
  });

  it('names the value that is out of range', () => {
    expect(parseDice('0d6')).toEqual({ ok: false, reason: 'count', value: 0 });
    expect(parseDice('101d6')).toEqual({ ok: false, reason: 'count', value: 101 });
    expect(parseDice('1d1')).toEqual({ ok: false, reason: 'sides', value: 1 });
    expect(parseDice('1d1001')).toEqual({ ok: false, reason: 'sides', value: 1001 });
    expect(parseDice('1d6+1001')).toEqual({ ok: false, reason: 'modifier', value: 1001 });
  });

  it('rejects text it does not understand', () => {
    expect(parseDice('')).toEqual({ ok: false, reason: 'format' });
    expect(parseDice('tres dados')).toEqual({ ok: false, reason: 'format' });
    expect(parseDice('3d')).toEqual({ ok: false, reason: 'format' });
    expect(parseDice('3d6*2')).toEqual({ ok: false, reason: 'format' });
  });

  it('writes the notation back', () => {
    expect(formatSpec({ count: 3, sides: 6, modifier: 2 })).toBe('3d6+2');
    expect(formatSpec({ count: 1, sides: 20, modifier: -1 })).toBe('1d20-1');
    expect(formatSpec({ count: 2, sides: 8, modifier: 0 })).toBe('2d8');
  });
});

describe('rollDice', () => {
  const spec = { count: 3, sides: 6, modifier: 2 };

  it('rolls each die within its faces and adds the modifier', () => {
    const rng = seededRng('demo');
    for (let i = 0; i < 1000; i++) {
      const r = rollDice(rng, spec);
      expect(r.dice).toHaveLength(3);
      for (const d of r.dice) expect(d >= 1 && d <= 6).toBe(true);
      expect(r.total).toBe(r.sum + 2);
      expect(r.total >= 5 && r.total <= 20).toBe(true);
    }
  });

  it('repeats the same series with the same seed', () => {
    const a = seededRng('demo');
    const b = seededRng('demo');
    const seriesA = [rollDice(a, spec), rollDice(a, spec)];
    const seriesB = [rollDice(b, spec), rollDice(b, spec)];
    expect(seriesA).toEqual(seriesB);
  });

  it('gives the minimum and maximum totals', () => {
    expect(diceRange(spec)).toEqual({ min: 5, max: 20 });
    expect(diceRange({ count: 1, sides: 20, modifier: -1 })).toEqual({ min: 0, max: 19 });
  });
});

describe('coins', () => {
  it('flips heads or tails and counts them', () => {
    const coins = flipCoins(seededRng('coin'), 100);
    expect(coins).toHaveLength(100);
    const { heads, tails } = countCoins(coins);
    expect(heads + tails).toBe(100);
    expect(heads).toBeGreaterThan(25);
    expect(tails).toBeGreaterThan(25);
  });

  it('keeps the last 10 entries in the history', () => {
    let h: number[] = [];
    for (let i = 0; i < 15; i++) h = pushHistory(h, i);
    expect(h).toEqual([14, 13, 12, 11, 10, 9, 8, 7, 6, 5]);
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/dice`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/dice/logic.ts`**

```ts
import { randInt, type Rng } from '../../lib/random';

export const QUICK_SIDES = [4, 6, 8, 10, 12, 20, 100];
export const LIMITS = {
  count: [1, 100],
  sides: [2, 1000],
  modifier: [-1000, 1000],
  coins: [1, 100],
} as const;
export const MAX_HISTORY = 10;

export interface DiceSpec {
  count: number;
  sides: number;
  modifier: number;
}

export type DiceParse =
  | { ok: true; spec: DiceSpec }
  | { ok: false; reason: 'format' }
  | { ok: false; reason: 'count' | 'sides' | 'modifier'; value: number };

/** "3d6", "2d20+1", "4D6 - 2" or "d100" (= 1d100). */
export function parseDice(input: string): DiceParse {
  const m = /^(\d*)d(\d+)([+-]\d+)?$/.exec(input.replace(/\s+/g, '').toLowerCase());
  if (!m) return { ok: false, reason: 'format' };
  const spec = {
    count: m[1] === '' ? 1 : Number(m[1]),
    sides: Number(m[2]),
    modifier: m[3] ? Number(m[3]) : 0,
  };
  for (const key of ['count', 'sides', 'modifier'] as const) {
    const [min, max] = LIMITS[key];
    if (spec[key] < min || spec[key] > max) return { ok: false, reason: key, value: spec[key] };
  }
  return { ok: true, spec };
}

export function formatSpec({ count, sides, modifier }: DiceSpec): string {
  const mod = modifier > 0 ? `+${modifier}` : modifier < 0 ? String(modifier) : '';
  return `${count}d${sides}${mod}`;
}

export interface Roll {
  spec: DiceSpec;
  dice: number[];
  sum: number;
  total: number;
}

export function rollDice(rng: Rng, spec: DiceSpec): Roll {
  const dice = Array.from({ length: spec.count }, () => randInt(rng, 1, spec.sides));
  const sum = dice.reduce((a, b) => a + b, 0);
  return { spec, dice, sum, total: sum + spec.modifier };
}

export function diceRange({ count, sides, modifier }: DiceSpec): { min: number; max: number } {
  return { min: count + modifier, max: count * sides + modifier };
}

export type Coin = 'heads' | 'tails';

export function flipCoins(rng: Rng, n: number): Coin[] {
  return Array.from({ length: n }, () => (randInt(rng, 0, 1) === 0 ? 'heads' : 'tails'));
}

export function countCoins(coins: Coin[]): { heads: number; tails: number } {
  const heads = coins.filter((c) => c === 'heads').length;
  return { heads, tails: coins.length - heads };
}

export function pushHistory<T>(history: T[], item: T): T[] {
  return [item, ...history].slice(0, MAX_HISTORY);
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/dice`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/dice/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'dice',
  category: 'rand',
  icon: 'dice-5',
  slug: { es: 'lanzar-dados-moneda', en: 'dice-roller-coin-flip' },
  name: { es: 'Dados y moneda', en: 'Dice & coin' },
  title: {
    es: 'Lanzar dados online (3d6, d20) y cara o cruz',
    en: 'Online dice roller (3d6, d20) and coin flip',
  },
  description: {
    es: 'Lanza dados con notación de rol (3d6, 2d20+1, d100) o echa una moneda al aire. Ves cada dado, el total y el historial, con semilla opcional.',
    en: 'Roll dice with tabletop notation (3d6, 2d20+1, d100) or flip a coin. See every die, the total and the history, with an optional seed.',
  },
  keywords: {
    es: ['lanzar dados', 'dados online', 'cara o cruz', 'tirar moneda', 'dado d20', 'dados de rol'],
    en: [
      'dice roller',
      'roll dice online',
      'coin flip',
      'heads or tails',
      'd20 roller',
      'rpg dice',
    ],
  },
  tabs: { es: ['Dados', 'Moneda'], en: ['Dice', 'Coin'] },
  rememberInput: true,
};
```

`src/tools/dice/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    tabs: 'Modo',
    notation: 'Dados',
    notationHelp: 'Como 3d6, 2d20+1 o d100.',
    quick: 'Dados rápidos',
    roll: 'Lanzar',
    coins: 'Monedas',
    flip: 'Lanzar',
    result: 'Tirada',
    idle: 'Pulsa Lanzar.',
    total: 'Total',
    sum: 'Suma',
    modifier: 'Modificador',
    range: 'Mínimo {min} · máximo {max}',
    format: 'Escribe los dados como 3d6, 2d20+1 o d100.',
    count: 'Entre 1 y 100 dados: has puesto {v}.',
    sides: 'Las caras van de 2 a 1000: has puesto {v}.',
    modifierRange: 'El modificador va de −1000 a 1000: has puesto {v}.',
    heads: 'Cara',
    tails: 'Cruz',
    coinCount: '{h} caras · {t} cruces',
    history: 'Últimas tiradas',
  },
  en: {
    tabs: 'Mode',
    notation: 'Dice',
    notationHelp: 'Like 3d6, 2d20+1 or d100.',
    quick: 'Quick dice',
    roll: 'Roll',
    coins: 'Coins',
    flip: 'Flip',
    result: 'Roll',
    idle: 'Press Roll.',
    total: 'Total',
    sum: 'Sum',
    modifier: 'Modifier',
    range: 'Minimum {min} · maximum {max}',
    format: 'Write the dice as 3d6, 2d20+1 or d100.',
    count: 'From 1 to 100 dice: you typed {v}.',
    sides: 'Faces go from 2 to 1000: you typed {v}.',
    modifierRange: 'The modifier goes from −1000 to 1000: you typed {v}.',
    heads: 'Heads',
    tails: 'Tails',
    coinCount: '{h} heads · {t} tails',
    history: 'Latest rolls',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/dice/content.es.md`:
```md
## Cómo funciona

Escribe los dados con la notación de los juegos de rol: `3d6` son tres dados de seis caras, `2d20+1` son dos de veinte más un modificador de 1, y `d100` es un dado de cien caras. Los botones rápidos ponen un solo dado de 4, 6, 8, 10, 12, 20 o 100 caras. Al lanzar verás cada dado, la suma, el modificador y el total en grande, junto al mínimo y el máximo posibles.

En la pestaña Moneda puedes lanzar de 1 a 100 monedas a la vez y ver cuántas han salido cara y cuántas cruz.

## Azar y semilla

Cada tirada usa el generador criptográfico del navegador, así que todos los resultados son igual de probables. Si escribes una semilla, la serie de tiradas se puede repetir: con la misma semilla, la primera tirada, la segunda y las siguientes salen siempre iguales. Útil para partidas por turnos o para comprobar una tirada después. Debajo verás las 10 últimas.
```

`src/tools/dice/content.en.md`:
```md
## How it works

Write the dice in tabletop notation: `3d6` is three six-sided dice, `2d20+1` is two twenty-sided dice plus a modifier of 1, and `d100` is one hundred-sided die. The quick buttons set a single die with 4, 6, 8, 10, 12, 20 or 100 faces. When you roll you see every die, the sum, the modifier and the total in large type, along with the lowest and highest possible totals.

In the Coin tab you can flip from 1 to 100 coins at once and see how many came up heads and how many tails.

## Chance and seed

Every roll uses the browser's cryptographic generator, so all results are equally likely. If you type a seed, the series of rolls can be repeated: with the same seed, the first roll, the second and the rest always come out the same. Handy for turn-based games or to check a roll later. Below you see the last 10.
```

- [ ] **Step 8: `src/tools/dice/Dice.svelte`**

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { rngFromSeed } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    countCoins,
    diceRange,
    flipCoins,
    formatSpec,
    LIMITS,
    parseDice,
    pushHistory,
    QUICK_SIDES,
    rollDice,
    type Coin,
    type Roll,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const notation = persistedInput('dice', '3d6', remember);
  const coinsStore = persistedInput('dice-coins', '1', remember);

  let tab = $state<'dice' | 'coin'>('dice');
  let seed = $state('');
  // One generator per seed: with a seed, the whole series of rolls can be repeated.
  const rng = $derived(rngFromSeed(seed));
  let roll = $state<Roll | null>(null);
  let coins = $state<Coin[] | null>(null);
  let history = $state<string[]>([]);

  const parsed = $derived(parseDice(notation.value));
  const error = $derived.by(() => {
    if (parsed.ok) return undefined;
    if (parsed.reason === 'format') return s.format;
    const key = parsed.reason === 'modifier' ? 'modifierRange' : parsed.reason;
    return fill(s[key], { v: parsed.value });
  });
  const nCoins = $derived(
    Math.min(LIMITS.coins[1], Math.max(LIMITS.coins[0], Number(coinsStore.value) || 1)),
  );
  const coinCount = $derived(coins ? countCoins(coins) : null);
  const coinText = $derived(
    coinCount ? fill(s.coinCount, { h: coinCount.heads, t: coinCount.tails }) : '',
  );

  function doRoll() {
    if (!parsed.ok) return;
    roll = rollDice(rng, parsed.spec);
    history = pushHistory(history, `${formatSpec(roll.spec)} → ${roll.total}`);
  }

  function doFlip() {
    coins = flipCoins(rng, nCoins);
    const c = countCoins(coins);
    history = pushHistory(history, fill(s.coinCount, { h: c.heads, t: c.tails }));
  }

  const headline = $derived.by(() => {
    if (tab === 'dice') return roll ? `${formatSpec(roll.spec)} → ${roll.total}` : s.idle;
    return coins ? coinText : s.idle;
  });

  const modText = (m: number) => (m > 0 ? `+${m}` : m < 0 ? `−${-m}` : '0');
</script>

<div class="stack">
  <Segmented
    main
    label={s.tabs}
    options={[
      { value: 'dice', label: meta.tabs![locale][0] },
      { value: 'coin', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    {#if tab === 'dice'}
      <div class="row">
        <div class="grow">
          <Field id="dice-notation" label={s.notation} help={s.notationHelp} {error}>
            {#snippet children({ describedby })}
              <input
                id="dice-notation"
                class="control mono"
                type="text"
                autocomplete="off"
                spellcheck="false"
                aria-describedby={describedby}
                aria-invalid={!!error}
                bind:value={notation.value}
                onkeydown={(e) => {
                  if (e.key === 'Enter') doRoll();
                }}
              />
            {/snippet}
          </Field>
        </div>
        <Button variant="primary" icon="dice-5" disabled={!parsed.ok} onclick={doRoll}
          >{s.roll}</Button
        >
      </div>
      <div class="quick" role="group" aria-label={s.quick}>
        {#each QUICK_SIDES as m (m)}
          <Button onclick={() => (notation.value = `1d${m}`)}>d{m}</Button>
        {/each}
      </div>
    {:else}
      <div class="row">
        <Field id="dice-coins" label={s.coins}>
          {#snippet children({ describedby })}
            <NumberInput
              id="dice-coins"
              bind:value={() => nCoins, (v) => (coinsStore.value = String(v))}
              min={LIMITS.coins[0]}
              max={LIMITS.coins[1]}
              {describedby}
            />
          {/snippet}
        </Field>
        <Button variant="primary" icon="refresh-cw" onclick={doFlip}>{s.flip}</Button>
      </div>
    {/if}

    <div class="seed">
      <Field id="dice-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
        {#snippet children({ describedby })}
          <input
            id="dice-seed"
            class="control mono"
            type="text"
            autocomplete="off"
            spellcheck="false"
            aria-describedby={describedby}
            bind:value={seed}
          />
        {/snippet}
      </Field>
    </div>

    <Display live label={s.result}>
      {#snippet head()}
        <span>{headline}</span>
      {/snippet}
      {#if tab === 'dice' && roll}
        {@const range = diceRange(roll.spec)}
        <div class="dice">
          {#each roll.dice as d, i (i)}<span class="die">{d}</span>{/each}
        </div>
        <div class="display-value" id="dice-total">{roll.total}</div>
        <dl class="display-kv">
          <dt>{s.sum}</dt>
          <dd>{roll.sum}</dd>
          <dt>{s.modifier}</dt>
          <dd>{modText(roll.spec.modifier)}</dd>
        </dl>
        <p class="display-note">{fill(s.range, range)}</p>
      {:else if tab === 'coin' && coins}
        <div class="dice">
          {#each coins as c, i (i)}<span class="die coin">{c === 'heads' ? s.heads : s.tails}</span
            >{/each}
        </div>
        <div class="display-value" id="dice-coin-count">{coinText}</div>
      {/if}
      {#if history.length}
        <p class="display-note">{s.history}</p>
        <ol class="history">
          {#each history as h, i (i)}<li>{h}</li>{/each}
        </ol>
      {/if}
    </Display>

    <div class="row">
      <CopyButton
        main
        value={tab === 'dice' ? (roll ? String(roll.total) : '') : coinText}
        {locale}
      />
    </div>

    <Toggle
      bind:checked={
        () => notation.remember,
        (v) => {
          notation.remember = v;
          coinsStore.remember = v;
        }
      }
      label={t(locale, 'tool.remember')}
    />
  </div>
</div>

<style>
  .grow {
    flex: 1 1 200px;
    max-width: 320px;
  }
  .seed {
    max-width: 320px;
  }
  .quick {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .dice {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .die {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
    padding: 0 8px;
    border: 1px solid var(--disp-line);
    border-radius: var(--radius);
    font: 600 17px/1 var(--font-mono);
  }
  .coin {
    font-size: 14px;
  }
  .history {
    margin: 0;
    padding-left: 1.4em;
    font: 400 13.5px/1.6 var(--font-mono);
    color: var(--disp-dim);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as dice } from './dice/meta';
```
→
```ts
import { meta as dice } from './dice/meta';
```
y
```ts
  // dice,
```
→
```ts
  dice,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Dice from '../tools/dice/Dice.svelte';
```
→
```astro
import Dice from '../tools/dice/Dice.svelte';
```
y
```astro
{/* {id === 'dice' && <Dice client:load locale={locale} />} */}
```
→
```astro
{id === 'dice' && <Dice client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/lanzar-dados-moneda.html dist/en/dice-roller-coin-flip.html
git status --porcelain
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `dice`: título ≤ 65, descripción de 51 a 160 caracteres, slugs e icono, y sus dos `content.*.md`); existen las dos páginas; `git status` solo lista `src/tools/dice/`, `src/tools/registry.ts` y `src/components/ToolIsland.astro`. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador desechable (puerto 4659)**

Crea `.check-dice.mjs` en la raíz del worktree (no se confirma):
```js
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4659';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.route('**/analytics.alvarotc.com/**', (r) => r.abort());
await p.route('**/api.frankfurter.dev/**', (r) => r.abort());
await p.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => p.getByText(text).first().waitFor({ timeout: 5000 });
const expectText = (sel, text) =>
  p.locator(sel).filter({ hasText: text }).first().waitFor({ timeout: 5000 });
const expectValue = (sel, v) =>
  p.waitForFunction(([s, want]) => document.querySelector(s)?.value === want, [sel, v], {
    timeout: 5000,
  });
try {
  await p.goto(`${BASE}/es/lanzar-dados-moneda`);
  await p.locator('#dice-notation').fill('3d6+2');
  await p.locator('#dice-seed').fill('demo');
  await p.getByRole('button', { name: 'Lanzar' }).click();
  await p.waitForFunction(() => document.querySelectorAll('.die').length === 3);
  const first = Number(await p.locator('#dice-total').textContent());
  if (first < 5 || first > 20) throw new Error(`total ${first}`);
  // A new generator with the same seed repeats the series.
  await p.locator('#dice-seed').fill('otra');
  await p.locator('#dice-seed').fill('demo');
  await p.getByRole('button', { name: 'Lanzar' }).click();
  await expectText('#dice-total', String(first));
  // The seeded generator is created once per seed and advances with each roll.
  await p.locator('#dice-notation').fill('1d1000');
  const series = async () => {
    const out = [];
    for (let i = 0; i < 5; i++) {
      await p.getByRole('button', { name: 'Lanzar' }).click();
      out.push(await p.locator('#dice-total').textContent());
    }
    return out.join(',');
  };
  await p.locator('#dice-seed').fill('x');
  await p.locator('#dice-seed').fill('demo');
  const a = await series();
  if (new Set(a.split(',')).size === 1) throw new Error(`the seeded series does not advance: ${a}`);
  await p.locator('#dice-seed').fill('x');
  await p.locator('#dice-seed').fill('demo');
  const again = await series();
  if (again !== a) throw new Error(`series differ: ${a} / ${again}`);
  await p.locator('#dice-notation').fill('0d6');
  await see('Entre 1 y 100 dados: has puesto 0.');
  await p.getByRole('radio', { name: 'Moneda' }).click();
  await p.locator('#dice-coins').fill('10');
  await p.getByRole('button', { name: 'Lanzar' }).click();
  await expectText('#dice-coin-count', /\d+ caras · \d+ cruces/);
  await p.goto(`${BASE}/en/dice-roller-coin-flip`);
  await p.locator('.panel').first().waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK dice');
} finally {
  await b.close();
}
```

```bash
./node_modules/.bin/astro preview --port 4659 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
sleep 4
node .check-dice.mjs
kill $PREVIEW
rm .check-dice.mjs
```
Expected: `OK dice` y ningún error. El script falla si una espera no se cumple en 5 s o si la página lanza un error. Aborta cualquier petición a `api.frankfurter.dev`: ninguna comprobación depende de la red.

A mano con `pnpm preview`, en `/es/lanzar-dados-moneda`, en tema claro y luego en oscuro y terminal, a 1280 px y a 390 px (sin scroll horizontal):
1. `3d6+2` con semilla `demo`: anota el total; cambia la semilla y vuelve a `demo`: la primera tirada repite ese total.
2. `d20` desde el botón rápido pone `1d20`. `0d6` → error con el rango.
3. Pestaña Moneda con 10 monedas → diez chips y «N caras · M cruces». Las teclas `1` y `2` cambian de pestaña.

- [ ] **Step 12: Commit**

```bash
git add src/tools/dice src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni `.check-dice.mjs`). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(dice): dados con notación de rol, moneda y semilla"
```

---

### Task 10: IVA: sumar y quitar el IVA con redondeo que cuadra

**Files:**
- Create: `src/tools/iva/logic.ts`, `src/tools/iva/logic.test.ts`, `src/tools/iva/meta.ts`, `src/tools/iva/strings.ts`, `src/tools/iva/content.es.md`, `src/tools/iva/content.en.md`, `src/tools/iva/Iva.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `parseDecimal`, `formatNumber`, `formatMoney`, `roundCents` (Task 0); `fill`; `t`; kit: `Field`, `Segmented`, `Display`, `CopyButton`, `Toggle`, `persistedInput`.
- Produces:
  - `VAT_RATES`, `type VatDirection`, `type VatBreakdown`, `vatFromBase`, `vatFromTotal`, `breakdown`, `isValidRate`.
  - Inputs recordados: `iva` (importe), `iva-direction`, `iva-rate` (`21`, `10`, `4` u `other`) e `iva-rate-other`.
  - `meta: ToolMeta` (id `iva`, slugs `calculadora-iva` / `spanish-vat-calculator`), `strings: Record<Locale, …>`, componente `Iva` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 15: `#iva-amount`, radios «Base imponible» / «Total con IVA», radios 21 % · 10 % · 4 % · Otro, `#iva-rate-other`, `#iva-base`, `#iva-vat`, `#iva-total`.

**§7 (vinculante):** `iva` · calc · sin pestañas · importe, Segmented «El importe es: Base imponible · Total con IVA», tipo 21 · 10 · 4 · Otro (0–100 con decimales); `cuota = roundCents(base × t / 100)`; al quitar, base redondeada y cuota = total − base; `Display kv` con `formatMoney`, comparación de los tres tipos y línea «Base 100,00 € + IVA 21 % 21,00 € = 121,00 €»; 0, negativos, 121 → 100 y 100 → 82,64 + 17,36.

Cómo se cubre cada punto:
- Fórmulas en céntimos con `roundCents` (Task 0). Tests del bloque `vatFromBase`.
- Base + IVA = total exacto al quitar el IVA, comprobado para miles de importes. Test `splits a total so base + VAT adds up exactly`.
- Casos de la spec: 0, negativos con redondeo simétrico, 121 y 100 al 21 %. Tests del bloque `edge cases`.
- Tipo «Otro» de 0 a 100 con decimales (IGIC). Tests `accepts decimal rates such as IGIC` y `checks custom rates`.
- Comparación con los tres tipos y línea para copiar (`CopyButton main`).

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l2-iva -b lote-2/iva   # desde el commit de la Task 0
cd ../devtools-l2-iva
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/iva/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { breakdown, isValidRate, VAT_RATES, vatFromBase, vatFromTotal } from './logic';

describe('vatFromBase', () => {
  it('adds the rounded VAT to the base', () => {
    expect(vatFromBase(100, 21)).toEqual({ base: 100, vat: 21, total: 121 });
    expect(vatFromBase(100, 10)).toEqual({ base: 100, vat: 10, total: 110 });
    expect(vatFromBase(100, 4)).toEqual({ base: 100, vat: 4, total: 104 });
    expect(vatFromBase(10.05, 21)).toEqual({ base: 10.05, vat: 2.11, total: 12.16 });
  });

  it('accepts decimal rates such as IGIC', () => {
    expect(vatFromBase(100, 7)).toEqual({ base: 100, vat: 7, total: 107 });
    expect(vatFromBase(100, 9.5)).toEqual({ base: 100, vat: 9.5, total: 109.5 });
  });
});

describe('vatFromTotal', () => {
  it('splits a total so base + VAT adds up exactly', () => {
    expect(vatFromTotal(121, 21)).toEqual({ base: 100, vat: 21, total: 121 });
    expect(vatFromTotal(100, 21)).toEqual({ base: 82.64, vat: 17.36, total: 100 });
    for (let cents = 1; cents <= 5000; cents += 7) {
      const r = vatFromTotal(cents / 100, 21);
      expect(Math.round((r.base + r.vat) * 100)).toBe(cents);
    }
  });
});

describe('edge cases', () => {
  it('turns 0 into all zeros', () => {
    expect(breakdown(0, 'base', 21)).toEqual({ base: 0, vat: 0, total: 0 });
    expect(breakdown(0, 'total', 21)).toEqual({ base: 0, vat: 0, total: 0 });
  });

  it('handles credit notes with symmetric rounding', () => {
    expect(breakdown(-100, 'base', 21)).toEqual({ base: -100, vat: -21, total: -121 });
    expect(breakdown(-100, 'total', 21)).toEqual({ base: -82.64, vat: -17.36, total: -100 });
  });

  it('checks custom rates', () => {
    expect(VAT_RATES).toEqual([21, 10, 4]);
    expect(isValidRate(7.5)).toBe(true);
    expect(isValidRate(0)).toBe(true);
    expect(isValidRate(101)).toBe(false);
    expect(isValidRate(-1)).toBe(false);
    expect(isValidRate(null)).toBe(false);
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/iva`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/iva/logic.ts`**

```ts
import { roundCents } from '../../lib/numbers';

/** Spanish VAT rates (Ley 37/1992, art. 90 and 91), as of 2026-09. */
export const VAT_RATES = [21, 10, 4] as const;

export type VatDirection = 'base' | 'total';

export interface VatBreakdown {
  base: number;
  vat: number;
  total: number;
}

/** base → total: the VAT is rounded to the cent and added to the base. */
export function vatFromBase(base: number, rate: number): VatBreakdown {
  const b = roundCents(base);
  const vat = roundCents((b * rate) / 100);
  return { base: b, vat, total: roundCents(b + vat) };
}

/** total → base: the base is rounded first and the VAT is what is left, so base + VAT = total. */
export function vatFromTotal(total: number, rate: number): VatBreakdown {
  const t = roundCents(total);
  const base = roundCents(t / (1 + rate / 100));
  return { base, vat: roundCents(t - base), total: t };
}

export function breakdown(amount: number, direction: VatDirection, rate: number): VatBreakdown {
  return direction === 'base' ? vatFromBase(amount, rate) : vatFromTotal(amount, rate);
}

/** A custom rate, such as the Canary Islands IGIC: 0 to 100, decimals allowed. */
export function isValidRate(rate: number | null): rate is number {
  return rate !== null && rate >= 0 && rate <= 100;
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/iva`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/iva/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'iva',
  category: 'calc',
  icon: 'receipt',
  slug: { es: 'calculadora-iva', en: 'spanish-vat-calculator' },
  name: { es: 'IVA', en: 'Spanish VAT' },
  title: {
    es: 'Calculadora de IVA: sumar y quitar el IVA (21, 10, 4 %)',
    en: 'Spanish VAT (IVA) calculator: add or remove VAT',
  },
  description: {
    es: 'Suma el IVA a una base imponible o quítalo de un total, al 21, 10 o 4 % o con el tipo que quieras. Redondeo al céntimo que siempre cuadra.',
    en: 'Add Spanish VAT to a net amount or take it out of a total, at 21, 10 or 4% or any rate you need. Cent rounding that always adds up.',
  },
  keywords: {
    es: [
      'calculadora iva',
      'quitar iva',
      'sumar iva',
      'iva 21',
      'base imponible',
      'precio sin iva',
    ],
    en: [
      'spanish vat calculator',
      'iva calculator',
      'remove vat',
      'add vat',
      'vat 21',
      'net price',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Cómo se quita el IVA de un precio?',
        a: 'Se divide el total entre 1 más el tipo: con el 21 %, entre 1,21. Así, 121 € con IVA son 100 € de base. Restar el 21 % al total da un resultado incorrecto.',
      },
    ],
    en: [
      {
        q: 'How do I take VAT out of a price?',
        a: 'Divide the total by 1 plus the rate: at 21%, by 1.21. So 121 € with VAT is a 100 € base. Subtracting 21% from the total gives the wrong result.',
      },
    ],
  },
  rememberInput: true,
};
```

`src/tools/iva/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    amount: 'Importe',
    direction: 'El importe es',
    base: 'Base imponible',
    total: 'Total con IVA',
    rate: 'Tipo de IVA',
    other: 'Otro',
    otherRate: 'Tipo (%)',
    otherHelp: 'De 0 a 100. Por ejemplo, 7 para el IGIC canario.',
    vat: 'IVA ({r} %)',
    result: 'Desglose',
    compare: 'La misma base con cada tipo',
    line: 'Base {base} + IVA {r} % {vat} = {total}',
    invalid: 'Escribe un número, por ejemplo 1234,5.',
    rateInvalid: 'Escribe un porcentaje de 0 a 100, por ejemplo 7.',
    copyLine: 'Copiar la línea',
  },
  en: {
    amount: 'Amount',
    direction: 'The amount is',
    base: 'Net amount (base)',
    total: 'Total with VAT',
    rate: 'VAT rate',
    other: 'Other',
    otherRate: 'Rate (%)',
    otherHelp: 'From 0 to 100. For example, 7 for the Canary Islands IGIC.',
    vat: 'VAT ({r}%)',
    result: 'Breakdown',
    compare: 'The same base at each rate',
    line: 'Base {base} + VAT {r}% {vat} = {total}',
    invalid: 'Type a number, for example 1234.5.',
    rateInvalid: 'Type a percentage from 0 to 100, for example 7.',
    copyLine: 'Copy the line',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/iva/content.es.md`:
```md
## Cómo funciona

Escribe un importe y di si es la **base imponible** (el precio sin IVA) o el **total con IVA**. Elige el tipo: 21 % (general), 10 % (reducido) o 4 % (superreducido), u «Otro» para cualquier porcentaje, como el 7 % del IGIC canario. Verás la base, la cuota de IVA y el total, la misma base con los tres tipos para comparar y una línea lista para copiar en un presupuesto.

Para **sumar** el IVA se calcula la cuota (base × tipo) y se suma a la base. Para **quitarlo** no basta con restar el porcentaje: hay que dividir el total entre 1 más el tipo. Con el 21 %, 121 € son 100 € de base y 21 € de IVA; restar el 21 % a 121 daría 95,59 €, que es incorrecto.

## Redondeo al céntimo

La cuota se redondea al céntimo con las mitades hacia arriba, como en una factura. Al quitar el IVA, primero se redondea la base y la cuota es lo que falta hasta el total, así que base + IVA siempre coincide con el importe que escribiste. Los importes negativos (abonos) se admiten y se redondean igual. El recargo de equivalencia y el IPSI de Ceuta y Melilla no están incluidos.
```

`src/tools/iva/content.en.md`:
```md
## How it works

Type an amount and say whether it is the **net amount** (the price before VAT, "base imponible") or the **total with VAT**. Pick the rate: 21% (standard), 10% (reduced) or 4% (super-reduced) in Spain, or "Other" for any percentage, such as the 7% IGIC of the Canary Islands. You get the base, the VAT and the total, the same base at the three rates to compare, and a line ready to paste into a quote.

To **add** VAT, the tax (base × rate) is added to the base. To **remove** it, subtracting the percentage is not enough: divide the total by 1 plus the rate. At 21%, 121 € is a 100 € base and 21 € of VAT; subtracting 21% from 121 would give 95.59 €, which is wrong.

## Rounding to the cent

The VAT is rounded to the cent with halves going up, as on an invoice. When removing VAT, the base is rounded first and the VAT is whatever is left up to the total, so base + VAT always matches the amount you typed. Negative amounts (credit notes) are accepted and rounded the same way. The equivalence surcharge and the IPSI of Ceuta and Melilla are not included.
```

- [ ] **Step 8: `src/tools/iva/Iva.svelte`**

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatMoney, formatNumber, parseDecimal } from '../../lib/numbers';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { breakdown, isValidRate, VAT_RATES, vatFromBase, type VatDirection } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  type RateChoice = '21' | '10' | '4' | 'other';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const amount = persistedInput('iva', '100', remember);
  const directionStore = persistedInput('iva-direction', 'base', remember);
  const rateStore = persistedInput('iva-rate', '21', remember);
  const otherStore = persistedInput('iva-rate-other', '7', remember);
  const all = [amount, directionStore, rateStore, otherStore];

  const direction = $derived<VatDirection>(directionStore.value === 'total' ? 'total' : 'base');
  const choice = $derived<RateChoice>(
    (['21', '10', '4', 'other'] as const).find((c) => c === rateStore.value) ?? '21',
  );
  const otherRate = $derived(parseDecimal(otherStore.value, locale));
  const rate = $derived(choice === 'other' ? otherRate : Number(choice));
  const rateOk = $derived(isValidRate(rate));
  const value = $derived(amount.value.trim() ? parseDecimal(amount.value, locale) : 0);
  const r = $derived(value !== null && rateOk ? breakdown(value, direction, rate!) : null);

  const money = (n: number) => formatMoney(n, locale);
  const pct = $derived(rateOk ? formatNumber(rate!, locale) : '');
  const line = $derived(
    r
      ? fill(s.line, { base: money(r.base), r: pct, vat: money(r.vat), total: money(r.total) })
      : '',
  );
  const compare = $derived(
    r ? VAT_RATES.map((rt) => ({ rate: rt, ...vatFromBase(r.base, rt) })) : [],
  );
</script>

<div class="panel">
  <div class="row">
    <div class="grow">
      <Field id="iva-amount" label={s.amount} error={value === null ? s.invalid : undefined}>
        {#snippet children({ describedby })}
          <input
            id="iva-amount"
            class="control mono"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            spellcheck="false"
            aria-describedby={describedby}
            aria-invalid={value === null}
            bind:value={amount.value}
          />
        {/snippet}
      </Field>
    </div>
    <div class="stack tight">
      <span class="label">{s.direction}</span>
      <Segmented
        label={s.direction}
        options={[
          { value: 'base', label: s.base },
          { value: 'total', label: s.total },
        ]}
        bind:value={() => direction, (v) => (directionStore.value = v)}
      />
    </div>
  </div>

  <div class="row">
    <div class="stack tight">
      <span class="label">{s.rate}</span>
      <Segmented
        label={s.rate}
        options={[
          { value: '21', label: '21 %' },
          { value: '10', label: '10 %' },
          { value: '4', label: '4 %' },
          { value: 'other', label: s.other },
        ]}
        bind:value={() => choice, (v) => (rateStore.value = v)}
      />
    </div>
    {#if choice === 'other'}
      <Field
        id="iva-rate-other"
        label={s.otherRate}
        help={s.otherHelp}
        error={rateOk ? undefined : s.rateInvalid}
      >
        {#snippet children({ describedby })}
          <input
            id="iva-rate-other"
            class="control mono short"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            aria-describedby={describedby}
            aria-invalid={!rateOk}
            bind:value={otherStore.value}
          />
        {/snippet}
      </Field>
    {/if}
  </div>

  <Display live label={s.result}>
    {#snippet head()}<span>{line || s.invalid}</span>{/snippet}
    {#if r}
      <dl class="display-kv">
        <dt>{s.base}</dt>
        <dd id="iva-base">{money(r.base)}</dd>
        <dt>{fill(s.vat, { r: pct })}</dt>
        <dd id="iva-vat">{money(r.vat)}</dd>
        <dt>{s.total}</dt>
        <dd id="iva-total" class="total">{money(r.total)}</dd>
      </dl>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={line} {locale} label={s.copyLine} />
  </div>

  {#if compare.length}
    <Display label={s.compare}>
      {#snippet head()}<span>{s.compare}</span>{/snippet}
      <div class="display-rows">
        {#each compare as c (c.rate)}
          <div class="display-row">
            <span>{c.rate} % · {money(c.vat)}</span>
            <span>{money(c.total)}</span>
          </div>
        {/each}
      </div>
    </Display>
  {/if}

  <Toggle
    bind:checked={
      () => amount.remember,
      (v) => {
        for (const p of all) p.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .grow {
    flex: 1 1 200px;
    max-width: 320px;
  }
  .tight {
    gap: 8px;
  }
  .label {
    font-size: 13px;
    font-weight: 600;
  }
  .short {
    width: 120px;
  }
  .total {
    font-weight: 700;
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as iva } from './iva/meta';
```
→
```ts
import { meta as iva } from './iva/meta';
```
y
```ts
  // iva,
```
→
```ts
  iva,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Iva from '../tools/iva/Iva.svelte';
```
→
```astro
import Iva from '../tools/iva/Iva.svelte';
```
y
```astro
{/* {id === 'iva' && <Iva client:load locale={locale} />} */}
```
→
```astro
{id === 'iva' && <Iva client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/calculadora-iva.html dist/en/spanish-vat-calculator.html
git status --porcelain
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `iva`: título ≤ 65, descripción de 51 a 160 caracteres, slugs e icono, y sus dos `content.*.md`); existen las dos páginas; `git status` solo lista `src/tools/iva/`, `src/tools/registry.ts` y `src/components/ToolIsland.astro`. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador desechable (puerto 4660)**

Crea `.check-iva.mjs` en la raíz del worktree (no se confirma):
```js
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4660';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.route('**/analytics.alvarotc.com/**', (r) => r.abort());
await p.route('**/api.frankfurter.dev/**', (r) => r.abort());
await p.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => p.getByText(text).first().waitFor({ timeout: 5000 });
const expectText = (sel, text) =>
  p.locator(sel).filter({ hasText: text }).first().waitFor({ timeout: 5000 });
const expectValue = (sel, v) =>
  p.waitForFunction(([s, want]) => document.querySelector(s)?.value === want, [sel, v], {
    timeout: 5000,
  });
try {
  await p.goto(`${BASE}/es/calculadora-iva`);
  await p.locator('#iva-amount').fill('100');
  await expectText('#iva-total', '121,00');
  await p.getByRole('radio', { name: 'Total con IVA' }).click();
  await expectText('#iva-base', '82,64');
  await expectText('#iva-vat', '17,36');
  await p.getByRole('radio', { name: 'Otro' }).click();
  await p.locator('#iva-rate-other').fill('101');
  await see('Escribe un porcentaje de 0 a 100');
  await p.goto(`${BASE}/en/spanish-vat-calculator`);
  await p.locator('.panel').first().waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK iva');
} finally {
  await b.close();
}
```

```bash
./node_modules/.bin/astro preview --port 4660 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
sleep 4
node .check-iva.mjs
kill $PREVIEW
rm .check-iva.mjs
```
Expected: `OK iva` y ningún error. El script falla si una espera no se cumple en 5 s o si la página lanza un error. Aborta cualquier petición a `api.frankfurter.dev`: ninguna comprobación depende de la red.

A mano con `pnpm preview`, en `/es/calculadora-iva`, en tema claro y luego en oscuro y terminal, a 1280 px y a 390 px (sin scroll horizontal):
1. 100 como base al 21 % → `121,00 €`; la línea copiada es «Base 100,00 € + IVA 21 % 21,00 € = 121,00 €».
2. «Total con IVA» y 100 → base `82,64 €` e IVA `17,36 €`.
3. «Otro» con `7` → 107,00 €; con `101` → error bajo el campo.

- [ ] **Step 12: Commit**

```bash
git add src/tools/iva src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni `.check-iva.mjs`). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(iva): calculadora de IVA con redondeo al céntimo"
```

---

### Task 11: Retención de IRPF: factura desde la base o desde el líquido

**Files:**
- Create: `src/tools/irpf/logic.ts`, `src/tools/irpf/logic.test.ts`, `src/tools/irpf/meta.ts`, `src/tools/irpf/strings.ts`, `src/tools/irpf/content.es.md`, `src/tools/irpf/content.en.md`, `src/tools/irpf/Irpf.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `parseDecimal`, `formatNumber`, `formatMoney`, `roundCents` (Task 0); `fill`; `t`; kit: `Field`, `Segmented`, `Select`, `Display`, `CopyButton`, `Toggle`, `persistedInput`.
- Produces:
  - `IRPF_RATES`, `VAT_RATES`, `type IrpfDirection`, `type Invoice`, `invoiceFromBase`, `type FromNet`, `invoiceFromNet`.
  - Inputs recordados: `irpf` (importe), `irpf-direction`, `irpf-rate`, `irpf-rate-other` e `irpf-vat`.
  - `meta: ToolMeta` (id `irpf`, slugs `calculadora-retencion-irpf` / `spanish-irpf-withholding-calculator`), `strings: Record<Locale, …>`, componente `Irpf` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 15: `#irpf-amount`, radios «Base imponible» / «Líquido a cobrar», `#irpf-rate` (select `15`, `7`, `19`, `other`), `#irpf-rate-other`, `#irpf-vat` (select `21`, `10`, `4`, `0`), `#irpf-base`, `#irpf-net`.

**§7 (vinculante):** `irpf` · calc · sin pestañas · importe, Segmented «Base imponible · Líquido a cobrar», IRPF (Select 15/7/19/Otro), IVA (21/10/4/0); desde la base, IVA e IRPF redondeados por separado; desde el líquido, candidatas `B0 ± 0,02`, exacta o la más cercana (en empate, la menor) con aviso; 1000 → 1060; nota de la retención y aviso fijo.

Cómo se cubre cada punto:
- Factura desde la base, con y sin IVA o retención. Tests del bloque `invoiceFromBase`.
- Búsqueda finita de 5 candidatas: exacta cuando existe (ida y vuelta de todas las bases de 0,01 a 50 €) y la más cercana y menor cuando no. Tests `round-trips every base from 0.01 € to 50 €` y `picks the closest base, the smallest on a tie, when no base is exact` con 1,03 € al 21 % / 15 % → 0,96 (Review Focus 2).
- Líquido de 0 y tipos imposibles (`1 + i − r ≤ 0`). Tests `handles a net of 0` y `refuses rates that make the base impossible`.
- Aviso «Ninguna base da exactamente 1,03 €; la más cercana da 1,02 €», nota de la retención y aviso fijo con `role="note"`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l2-irpf -b lote-2/irpf   # desde el commit de la Task 0
cd ../devtools-l2-irpf
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/irpf/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { invoiceFromBase, invoiceFromNet } from './logic';

describe('invoiceFromBase', () => {
  it('adds VAT and subtracts the withholding', () => {
    expect(invoiceFromBase(1000, 21, 15)).toEqual({ base: 1000, vat: 210, irpf: 150, net: 1060 });
    expect(invoiceFromBase(1000, 21, 7)).toEqual({ base: 1000, vat: 210, irpf: 70, net: 1140 });
  });

  it('works without withholding, without VAT, and without both', () => {
    expect(invoiceFromBase(1000, 21, 0)).toEqual({ base: 1000, vat: 210, irpf: 0, net: 1210 });
    expect(invoiceFromBase(1000, 0, 15)).toEqual({ base: 1000, vat: 0, irpf: 150, net: 850 });
    expect(invoiceFromBase(1000, 0, 0)).toEqual({ base: 1000, vat: 0, irpf: 0, net: 1000 });
  });

  it('rounds VAT and IRPF separately', () => {
    expect(invoiceFromBase(0.97, 21, 15)).toEqual({ base: 0.97, vat: 0.2, irpf: 0.15, net: 1.02 });
  });
});

describe('invoiceFromNet', () => {
  it('finds the exact base when there is one', () => {
    expect(invoiceFromNet(1060, 21, 15)).toEqual({
      ok: true,
      exact: true,
      invoice: { base: 1000, vat: 210, irpf: 150, net: 1060 },
    });
    expect(invoiceFromNet(850, 0, 15)).toMatchObject({ exact: true, invoice: { base: 1000 } });
  });

  it('round-trips every base from 0.01 € to 50 €', () => {
    for (let c = 1; c <= 5000; c++) {
      const inv = invoiceFromBase(c / 100, 21, 15);
      const back = invoiceFromNet(inv.net, 21, 15);
      expect(back.ok && back.exact && back.invoice.net).toBe(inv.net);
    }
  });

  it('picks the closest base, the smallest on a tie, when no base is exact', () => {
    // 0.96 and 0.97 give 1.02; 0.98 gives 1.04. All are 1 cent away: 0.96 wins.
    expect(invoiceFromNet(1.03, 21, 15)).toEqual({
      ok: true,
      exact: false,
      invoice: { base: 0.96, vat: 0.2, irpf: 0.14, net: 1.02 },
    });
  });

  it('handles a net of 0', () => {
    expect(invoiceFromNet(0, 21, 15)).toEqual({
      ok: true,
      exact: true,
      invoice: { base: 0, vat: 0, irpf: 0, net: 0 },
    });
  });

  it('refuses rates that make the base impossible', () => {
    expect(invoiceFromNet(100, 0, 100)).toEqual({ ok: false, reason: 'rates' });
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/irpf`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/irpf/logic.ts`**

```ts
import { roundCents } from '../../lib/numbers';

/** Withholding for self-employed invoices (Ley 35/2006 and RD 439/2007), as of 2026-09. */
export const IRPF_RATES = [15, 7, 19] as const;
export const VAT_RATES = [21, 10, 4, 0] as const;

export type IrpfDirection = 'base' | 'net';

export interface Invoice {
  base: number;
  vat: number;
  irpf: number;
  /** What the client pays: base + VAT − withholding. */
  net: number;
}

const cents = (n: number) => Math.round(n * 100);

/** Rates are percentages: 21 and 15, not 0.21 and 0.15. VAT and IRPF are rounded separately. */
export function invoiceFromBase(base: number, vatRate: number, irpfRate: number): Invoice {
  const b = roundCents(base);
  const vat = roundCents((b * vatRate) / 100);
  const irpf = roundCents((b * irpfRate) / 100);
  return { base: b, vat, irpf, net: roundCents(b + vat - irpf) };
}

export type FromNet =
  { ok: true; invoice: Invoice; exact: boolean } | { ok: false; reason: 'rates' };

/**
 * Finds the base for a net amount. Each cent of base moves the net by 0, 1 or 2 cents, so some
 * nets cannot be reached (1.03 € at 21 % / 15 %). The 5 bases around the estimate are tried: an
 * exact one wins; otherwise the closest, and on a tie the smallest base.
 */
export function invoiceFromNet(net: number, vatRate: number, irpfRate: number): FromNet {
  const factor = 1 + vatRate / 100 - irpfRate / 100;
  if (factor <= 0) return { ok: false, reason: 'rates' };
  const target = cents(net);
  const b0 = cents(roundCents(net / factor));
  let best: Invoice | null = null;
  for (let c = b0 - 2; c <= b0 + 2; c++) {
    const inv = invoiceFromBase(c / 100, vatRate, irpfRate);
    if (!best || Math.abs(cents(inv.net) - target) < Math.abs(cents(best.net) - target)) {
      best = inv;
    }
  }
  return { ok: true, invoice: best!, exact: cents(best!.net) === target };
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/irpf`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/irpf/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'irpf',
  category: 'calc',
  icon: 'receipt-text',
  slug: { es: 'calculadora-retencion-irpf', en: 'spanish-irpf-withholding-calculator' },
  name: { es: 'Retención IRPF', en: 'IRPF withholding' },
  title: {
    es: 'Calculadora de retención de IRPF para facturas',
    en: 'Spanish IRPF withholding calculator for invoices',
  },
  description: {
    es: 'Calcula una factura de autónomo con IVA y retención de IRPF (15, 7 o 19 %) desde la base o desde lo que quieres cobrar, con el desglose completo.',
    en: 'Work out a Spanish freelance invoice with VAT and IRPF withholding (15, 7 or 19%) from the base or from what you want to be paid, fully broken down.',
  },
  keywords: {
    es: [
      'retención irpf',
      'factura autónomo',
      'irpf 15',
      'irpf 7',
      'calcular factura',
      'líquido a cobrar',
    ],
    en: [
      'irpf withholding',
      'spanish freelance invoice',
      'irpf 15',
      'autonomo invoice',
      'invoice calculator',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Cuándo se aplica el 7 %?',
        a: 'Los profesionales que empiezan su actividad pueden aplicar el 7 % el año de alta y los dos siguientes, siempre que no hayan ejercido una actividad profesional en el año anterior al inicio.',
      },
      {
        q: '¿Quién paga la retención?',
        a: 'Tu cliente te paga el total menos la retención y la ingresa él en Hacienda, a cuenta de tu IRPF. En tu declaración de la renta se descuenta lo que ya te han retenido.',
      },
    ],
    en: [
      {
        q: 'When does the 7% rate apply?',
        a: 'Professionals starting their activity can apply 7% in the year they register and the next two, as long as they did not work as a professional in the year before starting.',
      },
      {
        q: 'Who pays the withholding?',
        a: 'Your client pays you the total minus the withholding and pays that part to the Spanish Tax Agency on account of your income tax. It is deducted in your annual return.',
      },
    ],
  },
  rememberInput: true,
};
```

`src/tools/irpf/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    amount: 'Importe',
    direction: 'El importe es',
    base: 'Base imponible',
    net: 'Líquido a cobrar',
    irpf: 'Retención de IRPF',
    irpf15: '15 % (general)',
    irpf7: '7 % (inicio de actividad)',
    irpf19: '19 % (alquileres y capital)',
    other: 'Otro',
    otherRate: 'Retención (%)',
    vat: 'IVA',
    vat0: '0 % (exento)',
    result: 'Factura',
    plusVat: '+ IVA ({r} %)',
    minusIrpf: '− Retención IRPF ({r} %)',
    total: 'Total a cobrar',
    note: 'La retención la ingresa tu cliente en Hacienda a cuenta de tu IRPF.',
    disclaimer:
      'Cálculo orientativo; no es asesoramiento fiscal. Comprueba el tipo que te corresponde.',
    inexact: 'Ninguna base da exactamente {target}; la más cercana da {got}.',
    invalid: 'Escribe un número, por ejemplo 1234,5.',
    rateInvalid: 'Escribe un porcentaje de 0 a 100, por ejemplo 15.',
    impossible: 'Con estos tipos no hay ninguna base posible: baja la retención.',
    copy: 'Copiar el desglose',
  },
  en: {
    amount: 'Amount',
    direction: 'The amount is',
    base: 'Net amount (base)',
    net: 'Amount to be paid',
    irpf: 'IRPF withholding',
    irpf15: '15% (standard)',
    irpf7: '7% (new activity)',
    irpf19: '19% (rentals and capital)',
    other: 'Other',
    otherRate: 'Withholding (%)',
    vat: 'VAT',
    vat0: '0% (exempt)',
    result: 'Invoice',
    plusVat: '+ VAT ({r}%)',
    minusIrpf: '− IRPF withholding ({r}%)',
    total: 'Total to be paid',
    note: 'Your client pays the withholding to the Tax Agency on account of your income tax.',
    disclaimer: 'An estimate, not tax advice. Check which rate applies to you.',
    inexact: 'No base gives exactly {target}; the closest gives {got}.',
    invalid: 'Type a number, for example 1234.5.',
    rateInvalid: 'Type a percentage from 0 to 100, for example 15.',
    impossible: 'No base is possible with these rates: lower the withholding.',
    copy: 'Copy the breakdown',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/irpf/content.es.md`:
```md
## Cómo funciona

Una factura de autónomo o profesional suma el IVA a la base imponible y resta la **retención de IRPF**: base + IVA − retención = lo que te paga el cliente. Con una base de 1000 €, IVA al 21 % y retención del 15 %, la factura es 1000 + 210 − 150 = **1060 €**. Elige el tipo de retención (15 % general, 7 % si empiezas la actividad, 19 % en alquileres y rendimientos del capital, u otro) y el IVA (21, 10, 4 o 0 % si la operación está exenta).

También puedes ir al revés: escribe lo que quieres cobrar y la herramienta busca la base. Como el IVA y la retención se redondean por separado al céntimo, hay importes que ninguna base consigue exactamente (con 21 % y 15 %, 1,03 € es uno de ellos); en ese caso se usa la base más cercana y se avisa.

## La retención

La retención no es un gasto tuyo ni del cliente: el cliente la ingresa en Hacienda en tu nombre, a cuenta de tu IRPF, y en tu declaración de la renta se descuenta lo que ya te han retenido. Es un cálculo orientativo: comprueba con tu asesoría el tipo que te corresponde.
```

`src/tools/irpf/content.en.md`:
```md
## How it works

A Spanish freelance or professional invoice adds VAT to the base and subtracts the **IRPF withholding**: base + VAT − withholding = what the client pays you. With a 1000 € base, 21% VAT and 15% withholding, the invoice comes to 1000 + 210 − 150 = **1060 €**. Pick the withholding rate (15% standard, 7% when starting out, 19% for rentals and capital income, or another) and the VAT (21, 10, 4 or 0% when the service is exempt).

You can also work backwards: type what you want to be paid and the tool finds the base. Because VAT and withholding are rounded to the cent separately, some amounts cannot be reached by any base (at 21% and 15%, 1.03 € is one of them); in that case the closest base is used and you are told.

## The withholding

The withholding is not a cost for you or the client: the client pays it to the Tax Agency on your behalf, on account of your income tax, and it is deducted in your annual return. This is an estimate: check the rate that applies to you with your accountant.
```

- [ ] **Step 8: `src/tools/irpf/Irpf.svelte`**

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatMoney, formatNumber, parseDecimal } from '../../lib/numbers';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { invoiceFromBase, invoiceFromNet, type Invoice, type IrpfDirection } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  type IrpfChoice = '15' | '7' | '19' | 'other';
  type VatChoice = '21' | '10' | '4' | '0';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const amount = persistedInput('irpf', '1000', remember);
  const directionStore = persistedInput('irpf-direction', 'base', remember);
  const irpfStore = persistedInput('irpf-rate', '15', remember);
  const otherStore = persistedInput('irpf-rate-other', '', remember);
  const vatStore = persistedInput('irpf-vat', '21', remember);
  const all = [amount, directionStore, irpfStore, otherStore, vatStore];

  const direction = $derived<IrpfDirection>(directionStore.value === 'net' ? 'net' : 'base');
  const irpfChoice = $derived<IrpfChoice>(
    (['15', '7', '19', 'other'] as const).find((c) => c === irpfStore.value) ?? '15',
  );
  const vatChoice = $derived<VatChoice>(
    (['21', '10', '4', '0'] as const).find((c) => c === vatStore.value) ?? '21',
  );
  const otherRate = $derived(parseDecimal(otherStore.value, locale));
  const irpfRate = $derived(irpfChoice === 'other' ? otherRate : Number(irpfChoice));
  const irpfOk = $derived(irpfRate !== null && irpfRate >= 0 && irpfRate <= 100);
  const vatRate = $derived(Number(vatChoice));
  const value = $derived(amount.value.trim() ? parseDecimal(amount.value, locale) : 0);

  const calc = $derived.by((): { invoice: Invoice; exact: boolean } | { error: string } | null => {
    if (value === null || !irpfOk) return null;
    if (direction === 'base') {
      return { invoice: invoiceFromBase(value, vatRate, irpfRate!), exact: true };
    }
    const r = invoiceFromNet(value, vatRate, irpfRate!);
    return r.ok ? { invoice: r.invoice, exact: r.exact } : { error: s.impossible };
  });
  const invoice = $derived(calc && 'invoice' in calc ? calc.invoice : null);

  const money = (n: number) => formatMoney(n, locale);
  const pct = (n: number) => formatNumber(n, locale);
  const text = $derived(
    invoice
      ? [
          `${s.base}: ${money(invoice.base)}`,
          `${fill(s.plusVat, { r: pct(vatRate) })}: ${money(invoice.vat)}`,
          `${fill(s.minusIrpf, { r: pct(irpfRate ?? 0) })}: ${money(invoice.irpf)}`,
          `${s.total}: ${money(invoice.net)}`,
        ].join('\n')
      : '',
  );
  const headline = $derived.by(() => {
    if (value === null) return s.invalid;
    if (!irpfOk) return s.rateInvalid;
    if (calc && 'error' in calc) return calc.error;
    return invoice ? `${s.total}: ${money(invoice.net)}` : '';
  });
</script>

<div class="panel">
  <div class="row">
    <div class="grow">
      <Field id="irpf-amount" label={s.amount} error={value === null ? s.invalid : undefined}>
        {#snippet children({ describedby })}
          <input
            id="irpf-amount"
            class="control mono"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            spellcheck="false"
            aria-describedby={describedby}
            aria-invalid={value === null}
            bind:value={amount.value}
          />
        {/snippet}
      </Field>
    </div>
    <div class="stack tight">
      <span class="label">{s.direction}</span>
      <Segmented
        label={s.direction}
        options={[
          { value: 'base', label: s.base },
          { value: 'net', label: s.net },
        ]}
        bind:value={() => direction, (v) => (directionStore.value = v)}
      />
    </div>
  </div>

  <div class="row">
    <Field id="irpf-rate" label={s.irpf}>
      {#snippet children({ describedby })}
        <Select
          id="irpf-rate"
          {describedby}
          bind:value={() => irpfChoice, (v) => (irpfStore.value = v)}
          options={[
            { value: '15', label: s.irpf15 },
            { value: '7', label: s.irpf7 },
            { value: '19', label: s.irpf19 },
            { value: 'other', label: s.other },
          ]}
        />
      {/snippet}
    </Field>
    {#if irpfChoice === 'other'}
      <Field id="irpf-rate-other" label={s.otherRate} error={irpfOk ? undefined : s.rateInvalid}>
        {#snippet children({ describedby })}
          <input
            id="irpf-rate-other"
            class="control mono short"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            aria-describedby={describedby}
            aria-invalid={!irpfOk}
            bind:value={otherStore.value}
          />
        {/snippet}
      </Field>
    {/if}
    <Field id="irpf-vat" label={s.vat}>
      {#snippet children({ describedby })}
        <Select
          id="irpf-vat"
          {describedby}
          bind:value={() => vatChoice, (v) => (vatStore.value = v)}
          options={[
            { value: '21', label: '21 %' },
            { value: '10', label: '10 %' },
            { value: '4', label: '4 %' },
            { value: '0', label: s.vat0 },
          ]}
        />
      {/snippet}
    </Field>
  </div>

  <Display live label={s.result}>
    {#snippet head()}<span>{headline}</span>{/snippet}
    {#if invoice}
      <dl class="display-kv">
        <dt>{s.base}</dt>
        <dd id="irpf-base">{money(invoice.base)}</dd>
        <dt>{fill(s.plusVat, { r: pct(vatRate) })}</dt>
        <dd>{money(invoice.vat)}</dd>
        <dt>{fill(s.minusIrpf, { r: pct(irpfRate ?? 0) })}</dt>
        <dd>{money(-invoice.irpf)}</dd>
        <dt>{s.total}</dt>
        <dd id="irpf-net" class="total">{money(invoice.net)}</dd>
      </dl>
      {#if calc && 'exact' in calc && !calc.exact}
        <p class="display-note">
          {fill(s.inexact, { target: money(value ?? 0), got: money(invoice.net) })}
        </p>
      {/if}
      <p class="display-note">{s.note}</p>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={text} {locale} label={s.copy} />
  </div>

  <p class="disclaimer" role="note">{s.disclaimer}</p>

  <Toggle
    bind:checked={
      () => amount.remember,
      (v) => {
        for (const p of all) p.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .grow {
    flex: 1 1 200px;
    max-width: 320px;
  }
  .tight {
    gap: 8px;
  }
  .label {
    font-size: 13px;
    font-weight: 600;
  }
  .short {
    width: 120px;
  }
  .total {
    font-weight: 700;
  }
  .disclaimer {
    font-size: 13.5px;
    color: var(--text-dim);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as irpf } from './irpf/meta';
```
→
```ts
import { meta as irpf } from './irpf/meta';
```
y
```ts
  // irpf,
```
→
```ts
  irpf,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Irpf from '../tools/irpf/Irpf.svelte';
```
→
```astro
import Irpf from '../tools/irpf/Irpf.svelte';
```
y
```astro
{/* {id === 'irpf' && <Irpf client:load locale={locale} />} */}
```
→
```astro
{id === 'irpf' && <Irpf client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/calculadora-retencion-irpf.html dist/en/spanish-irpf-withholding-calculator.html
git status --porcelain
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `irpf`: título ≤ 65, descripción de 51 a 160 caracteres, slugs e icono, y sus dos `content.*.md`); existen las dos páginas; `git status` solo lista `src/tools/irpf/`, `src/tools/registry.ts` y `src/components/ToolIsland.astro`. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador desechable (puerto 4661)**

Crea `.check-irpf.mjs` en la raíz del worktree (no se confirma):
```js
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4661';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.route('**/analytics.alvarotc.com/**', (r) => r.abort());
await p.route('**/api.frankfurter.dev/**', (r) => r.abort());
await p.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => p.getByText(text).first().waitFor({ timeout: 5000 });
const expectText = (sel, text) =>
  p.locator(sel).filter({ hasText: text }).first().waitFor({ timeout: 5000 });
const expectValue = (sel, v) =>
  p.waitForFunction(([s, want]) => document.querySelector(s)?.value === want, [sel, v], {
    timeout: 5000,
  });
try {
  await p.goto(`${BASE}/es/calculadora-retencion-irpf`);
  await p.locator('#irpf-amount').fill('1000');
  await expectText('#irpf-net', /1\.?060,00/);
  await p.getByRole('radio', { name: 'Líquido a cobrar' }).click();
  await p.locator('#irpf-amount').fill('1,03');
  await see('Ninguna base da exactamente 1,03');
  await expectText('#irpf-base', '0,96');
  await see('Cálculo orientativo; no es asesoramiento fiscal.');
  await p.goto(`${BASE}/en/spanish-irpf-withholding-calculator`);
  await p.locator('.panel').first().waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK irpf');
} finally {
  await b.close();
}
```

```bash
./node_modules/.bin/astro preview --port 4661 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
sleep 4
node .check-irpf.mjs
kill $PREVIEW
rm .check-irpf.mjs
```
Expected: `OK irpf` y ningún error. El script falla si una espera no se cumple en 5 s o si la página lanza un error. Aborta cualquier petición a `api.frankfurter.dev`: ninguna comprobación depende de la red.

A mano con `pnpm preview`, en `/es/calculadora-retencion-irpf`, en tema claro y luego en oscuro y terminal, a 1280 px y a 390 px (sin scroll horizontal):
1. Base 1000, IVA 21 %, IRPF 15 % → total a cobrar `1060,00 €` (con `1.060,00 €` según el navegador).
2. «Líquido a cobrar» y `1,03` → base `0,96 €` y el aviso de la base más cercana.
3. IRPF «Otro» vacío → error; IVA 0 % (exento) → base − retención.

- [ ] **Step 12: Commit**

```bash
git add src/tools/irpf src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni `.check-irpf.mjs`). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(irpf): calculadora de retención de IRPF para facturas"
```

---

### Task 12: Porcentajes: X % de Y, qué % es y variación

**Files:**
- Create: `src/tools/percent/logic.ts`, `src/tools/percent/logic.test.ts`, `src/tools/percent/meta.ts`, `src/tools/percent/strings.ts`, `src/tools/percent/content.es.md`, `src/tools/percent/content.en.md`, `src/tools/percent/Percent.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `parseDecimal`, `formatNumber` (Task 0); `fill`; `t`; kit: `Segmented`, `Field`, `Display`, `CopyButton`, `Toggle`, `persistedInput`.
- Produces:
  - `clean`, `percentOf`, `whatPercent`, `type Change`, `percentChange`.
  - Inputs recordados: `percent` (X de la primera pestaña), `percent-y`, `percent-what-x`, `percent-what-y`, `percent-a` y `percent-b`.
  - `meta: ToolMeta` (id `percent`, slugs `calculadora-porcentajes` / `percentage-calculator`), `strings: Record<Locale, …>`, componente `Percent` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 15: `Segmented main` «X % de Y · Qué % es · Variación», `#percent-x`, `#percent-y`, `#percent-what-x`, `#percent-what-y`, `#percent-a`, `#percent-b`, `#percent-result`.

**§7 (vinculante):** `percent` · calc · pestañas X % de Y · Qué % es · Variación · `X / 100 × Y` con `Y + X %` e `Y − X %`; `X / Y × 100` con error si Y = 0; `(B − A) / |A| × 100` con «aumento» o «disminución» y error si A = 0; `Display value` con hasta 4 decimales y la frase.

Cómo se cubre cada punto:
- Las tres fórmulas con los ejemplos. Tests `computes X % of Y and the discount and surcharge`, `computes X / Y × 100` y `says whether it is an increase or a decrease`.
- Errores «No se puede dividir entre 0: Y debe ser distinto de 0.» y «No hay variación porcentual desde 0.». Tests `refuses to divide by 0` y `has no percentage change from 0`.
- `|A|` para que un inicio negativo se lea bien y limpieza del ruido de coma flotante. Tests `uses |A| so a negative start still reads the right way` y `removes floating-point noise`.
- Hasta 4 decimales con `formatNumber(n, locale, 4)` y la frase completa en la cabecera del `Display`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l2-percent -b lote-2/percent   # desde el commit de la Task 0
cd ../devtools-l2-percent
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/percent/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { clean, percentChange, percentOf, whatPercent } from './logic';

describe('percentOf', () => {
  it('computes X % of Y and the discount and surcharge', () => {
    expect(percentOf(21, 200)).toEqual({ value: 42, plus: 242, minus: 158 });
    expect(percentOf(15, 80)).toEqual({ value: 12, plus: 92, minus: 68 });
    expect(percentOf(7, 100).value).toBe(7);
    expect(percentOf(12.5, 64).value).toBe(8);
  });

  it('handles 0 and negatives', () => {
    expect(percentOf(0, 200)).toEqual({ value: 0, plus: 200, minus: 200 });
    expect(percentOf(-10, 50).value).toBe(-5);
  });
});

describe('whatPercent', () => {
  it('computes X / Y × 100', () => {
    expect(whatPercent(42, 200)).toBe(21);
    expect(whatPercent(1, 3)).toBe(33.3333333333);
    expect(whatPercent(300, 200)).toBe(150);
  });

  it('refuses to divide by 0', () => {
    expect(whatPercent(5, 0)).toBeNull();
  });
});

describe('percentChange', () => {
  it('says whether it is an increase or a decrease', () => {
    expect(percentChange(50, 75)).toEqual({ value: 50, kind: 'increase' });
    expect(percentChange(80, 60)).toEqual({ value: -25, kind: 'decrease' });
    expect(percentChange(10, 10)).toEqual({ value: 0, kind: 'none' });
  });

  it('uses |A| so a negative start still reads the right way', () => {
    expect(percentChange(-50, -25)).toEqual({ value: 50, kind: 'increase' });
  });

  it('has no percentage change from 0', () => {
    expect(percentChange(0, 10)).toBeNull();
  });

  it('removes floating-point noise', () => {
    expect(clean(0.1 + 0.2)).toBe(0.3);
    expect(percentChange(0.1, 0.3)!.value).toBe(200);
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/percent`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/percent/logic.ts`**

```ts
/** Removes floating-point noise: 0.07 × 100 = 7.000000000000001 → 7. */
export function clean(x: number): number {
  return Number(x.toPrecision(12));
}

/** X % of Y, plus Y with that percentage added (surcharge) and taken off (discount). */
export function percentOf(x: number, y: number): { value: number; plus: number; minus: number } {
  const value = clean((x / 100) * y);
  return { value, plus: clean(y + value), minus: clean(y - value) };
}

/** What percentage X is of Y; null when Y is 0. */
export function whatPercent(x: number, y: number): number | null {
  return y === 0 ? null : clean((x / y) * 100);
}

export type Change = { value: number; kind: 'increase' | 'decrease' | 'none' };

/** Change from A to B, relative to |A|; null when A is 0. */
export function percentChange(a: number, b: number): Change | null {
  if (a === 0) return null;
  const value = clean(((b - a) / Math.abs(a)) * 100);
  return { value, kind: value > 0 ? 'increase' : value < 0 ? 'decrease' : 'none' };
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/percent`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/percent/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'percent',
  category: 'calc',
  icon: 'percent',
  slug: { es: 'calculadora-porcentajes', en: 'percentage-calculator' },
  name: { es: 'Porcentajes', en: 'Percentages' },
  title: {
    es: 'Calculadora de porcentajes: % de un número y variación',
    en: 'Percentage calculator: percent of, ratio and change',
  },
  description: {
    es: 'Calcula el X % de un número, qué porcentaje es una cantidad de otra y la variación porcentual entre dos valores, con descuentos y recargos.',
    en: 'Work out X% of a number, what percentage one amount is of another and the percentage change between two values, with discounts and markups.',
  },
  keywords: {
    es: [
      'calculadora de porcentajes',
      'calcular porcentaje',
      'porcentaje de un número',
      'variación porcentual',
      'descuento',
    ],
    en: [
      'percentage calculator',
      'percent of a number',
      'percentage change',
      'what percent',
      'discount calculator',
    ],
  },
  tabs: {
    es: ['X % de Y', 'Qué % es', 'Variación'],
    en: ['X% of Y', 'What %', 'Change'],
  },
  rememberInput: true,
};
```

`src/tools/percent/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    tabs: 'Cálculo',
    x: 'Porcentaje (X)',
    y: 'Número (Y)',
    whatX: 'Cantidad (X)',
    whatY: 'Total (Y)',
    a: 'Valor inicial (A)',
    b: 'Valor final (B)',
    result: 'Resultado',
    of: '{x} % de {y} es {v}',
    plus: '{y} + {x} % = {v}',
    minus: '{y} − {x} % = {v}',
    what: '{x} es el {v} % de {y}',
    increase: 'De {a} a {b} es un aumento del {v} %',
    decrease: 'De {a} a {b} es una disminución del {v} %',
    none: 'De {a} a {b} no hay variación (0 %)',
    invalid: 'Escribe un número, por ejemplo 1234,5.',
    zeroY: 'No se puede dividir entre 0: Y debe ser distinto de 0.',
    zeroA: 'No hay variación porcentual desde 0.',
  },
  en: {
    tabs: 'Calculation',
    x: 'Percentage (X)',
    y: 'Number (Y)',
    whatX: 'Amount (X)',
    whatY: 'Total (Y)',
    a: 'Start value (A)',
    b: 'End value (B)',
    result: 'Result',
    of: '{x}% of {y} is {v}',
    plus: '{y} + {x}% = {v}',
    minus: '{y} − {x}% = {v}',
    what: '{x} is {v}% of {y}',
    increase: 'From {a} to {b} is a {v}% increase',
    decrease: 'From {a} to {b} is a {v}% decrease',
    none: 'From {a} to {b} there is no change (0%)',
    invalid: 'Type a number, for example 1234.5.',
    zeroY: 'Cannot divide by 0: Y must not be 0.',
    zeroA: 'There is no percentage change from 0.',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/percent/content.es.md`:
```md
## Cómo funciona

La calculadora tiene tres pestañas para las tres preguntas más habituales con porcentajes:

- **X % de Y**: cuánto es un porcentaje de un número (`X / 100 × Y`). El 21 % de 200 es 42. También verás Y con ese porcentaje sumado y restado, útil para recargos y descuentos: 200 + 21 % = 242 y 200 − 21 % = 158.
- **Qué % es**: qué porcentaje representa una cantidad de un total (`X / Y × 100`). 42 es el 21 % de 200.
- **Variación**: cuánto ha subido o bajado un valor, en porcentaje (`(B − A) / |A| × 100`). De 50 a 75 es un aumento del 50 %; de 80 a 60, una disminución del 25 %.

## Detalles

Puedes escribir con coma o con punto decimal y con separador de miles. Los resultados se muestran con hasta 4 decimales. No existe variación porcentual desde 0 (cualquier cambio sería infinito), así que en ese caso la herramienta lo explica en lugar de dar un número.
```

`src/tools/percent/content.en.md`:
```md
## How it works

The calculator has three tabs for the three most common percentage questions:

- **X% of Y**: how much a percentage of a number is (`X / 100 × Y`). 21% of 200 is 42. You also get Y with that percentage added and taken off, handy for markups and discounts: 200 + 21% = 242 and 200 − 21% = 158.
- **What %**: what percentage an amount is of a total (`X / Y × 100`). 42 is 21% of 200.
- **Change**: how much a value went up or down, as a percentage (`(B − A) / |A| × 100`). From 50 to 75 is a 50% increase; from 80 to 60, a 25% decrease.

## Details

You can type a decimal point or a comma and a thousands separator. Results show up to 4 decimals. There is no percentage change from 0 (any change would be infinite), so in that case the tool explains it instead of giving a number.
```

- [ ] **Step 8: `src/tools/percent/Percent.svelte`**

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatNumber, parseDecimal } from '../../lib/numbers';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { percentChange, percentOf, whatPercent } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  type Tab = 'of' | 'what' | 'change';
  type Stored = ReturnType<typeof persistedInput>;

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const ofX = persistedInput('percent', '21', remember);
  const ofY = persistedInput('percent-y', '200', remember);
  const whatX = persistedInput('percent-what-x', '42', remember);
  const whatY = persistedInput('percent-what-y', '200', remember);
  const chA = persistedInput('percent-a', '50', remember);
  const chB = persistedInput('percent-b', '75', remember);
  const all = [ofX, ofY, whatX, whatY, chA, chB];

  let tab = $state<Tab>('of');
  const num = (p: Stored) => parseDecimal(p.value, locale);
  const fmt = (n: number) => formatNumber(n, locale, 4);

  const out = $derived.by((): { value: string; lines: string[] } | { error: string } | null => {
    if (tab === 'of') {
      const x = num(ofX);
      const y = num(ofY);
      if (x === null || y === null) return null;
      const r = percentOf(x, y);
      const v = { x: fmt(x), y: fmt(y) };
      return {
        value: fmt(r.value),
        lines: [
          fill(s.of, { ...v, v: fmt(r.value) }),
          fill(s.plus, { ...v, v: fmt(r.plus) }),
          fill(s.minus, { ...v, v: fmt(r.minus) }),
        ],
      };
    }
    if (tab === 'what') {
      const x = num(whatX);
      const y = num(whatY);
      if (x === null || y === null) return null;
      const r = whatPercent(x, y);
      if (r === null) return { error: s.zeroY };
      return { value: `${fmt(r)} %`, lines: [fill(s.what, { x: fmt(x), y: fmt(y), v: fmt(r) })] };
    }
    const a = num(chA);
    const b = num(chB);
    if (a === null || b === null) return null;
    const r = percentChange(a, b);
    if (r === null) return { error: s.zeroA };
    const v = { a: fmt(a), b: fmt(b), v: fmt(Math.abs(r.value)) };
    return {
      value: `${r.value > 0 ? '+' : ''}${fmt(r.value)} %`,
      lines: [fill(s[r.kind], v)],
    };
  });

  const fields = $derived(
    tab === 'of'
      ? [
          { id: 'percent-x', label: s.x, store: ofX },
          { id: 'percent-y', label: s.y, store: ofY },
        ]
      : tab === 'what'
        ? [
            { id: 'percent-what-x', label: s.whatX, store: whatX },
            { id: 'percent-what-y', label: s.whatY, store: whatY },
          ]
        : [
            { id: 'percent-a', label: s.a, store: chA },
            { id: 'percent-b', label: s.b, store: chB },
          ],
  );
</script>

<div class="stack">
  <Segmented
    main
    label={s.tabs}
    options={[
      { value: 'of', label: meta.tabs![locale][0] },
      { value: 'what', label: meta.tabs![locale][1] },
      { value: 'change', label: meta.tabs![locale][2] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    <div class="fields">
      {#each fields as f (f.id)}
        {@const bad = num(f.store) === null}
        <Field id={f.id} label={f.label} error={bad ? s.invalid : undefined}>
          {#snippet children({ describedby })}
            <input
              id={f.id}
              class="control mono"
              type="text"
              inputmode="decimal"
              autocomplete="off"
              spellcheck="false"
              aria-describedby={describedby}
              aria-invalid={bad}
              value={f.store.value}
              oninput={(e) => (f.store.value = e.currentTarget.value)}
            />
          {/snippet}
        </Field>
      {/each}
    </div>

    <Display live label={s.result}>
      {#snippet head()}
        <span>{out && 'lines' in out ? out.lines[0] : out ? out.error : s.invalid}</span>
      {/snippet}
      {#if out && 'value' in out}
        <div class="display-value" id="percent-result">{out.value}</div>
        {#each out.lines.slice(1) as line (line)}<p class="display-note">{line}</p>{/each}
      {/if}
    </Display>

    <div class="row">
      <CopyButton main value={out && 'value' in out ? out.value : ''} {locale} />
    </div>

    <Toggle
      bind:checked={
        () => ofX.remember,
        (v) => {
          for (const p of all) p.remember = v;
        }
      }
      label={t(locale, 'tool.remember')}
    />
  </div>
</div>

<style>
  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    gap: 16px;
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as percent } from './percent/meta';
```
→
```ts
import { meta as percent } from './percent/meta';
```
y
```ts
  // percent,
```
→
```ts
  percent,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Percent from '../tools/percent/Percent.svelte';
```
→
```astro
import Percent from '../tools/percent/Percent.svelte';
```
y
```astro
{/* {id === 'percent' && <Percent client:load locale={locale} />} */}
```
→
```astro
{id === 'percent' && <Percent client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/calculadora-porcentajes.html dist/en/percentage-calculator.html
git status --porcelain
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `percent`: título ≤ 65, descripción de 51 a 160 caracteres, slugs e icono, y sus dos `content.*.md`); existen las dos páginas; `git status` solo lista `src/tools/percent/`, `src/tools/registry.ts` y `src/components/ToolIsland.astro`. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador desechable (puerto 4662)**

Crea `.check-percent.mjs` en la raíz del worktree (no se confirma):
```js
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4662';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.route('**/analytics.alvarotc.com/**', (r) => r.abort());
await p.route('**/api.frankfurter.dev/**', (r) => r.abort());
await p.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => p.getByText(text).first().waitFor({ timeout: 5000 });
const expectText = (sel, text) =>
  p.locator(sel).filter({ hasText: text }).first().waitFor({ timeout: 5000 });
const expectValue = (sel, v) =>
  p.waitForFunction(([s, want]) => document.querySelector(s)?.value === want, [sel, v], {
    timeout: 5000,
  });
try {
  await p.goto(`${BASE}/es/calculadora-porcentajes`);
  await p.locator('#percent-x').fill('21');
  await p.locator('#percent-y').fill('200');
  await expectText('#percent-result', '42');
  await p.getByRole('radio', { name: 'Qué % es' }).click();
  await p.locator('#percent-what-x').fill('42');
  await p.locator('#percent-what-y').fill('200');
  await expectText('#percent-result', '21 %');
  await p.getByRole('radio', { name: 'Variación' }).click();
  await p.locator('#percent-a').fill('50');
  await p.locator('#percent-b').fill('75');
  await see('es un aumento del 50 %');
  await p.locator('#percent-a').fill('0');
  await see('No hay variación porcentual desde 0.');
  await p.goto(`${BASE}/en/percentage-calculator`);
  await p.locator('.panel').first().waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK percent');
} finally {
  await b.close();
}
```

```bash
./node_modules/.bin/astro preview --port 4662 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
sleep 4
node .check-percent.mjs
kill $PREVIEW
rm .check-percent.mjs
```
Expected: `OK percent` y ningún error. El script falla si una espera no se cumple en 5 s o si la página lanza un error. Aborta cualquier petición a `api.frankfurter.dev`: ninguna comprobación depende de la red.

A mano con `pnpm preview`, en `/es/calculadora-porcentajes`, en tema claro y luego en oscuro y terminal, a 1280 px y a 390 px (sin scroll horizontal):
1. 21 % de 200 → `42`, «21 % de 200 es 42», `200 + 21 % = 242` y `200 − 21 % = 158`.
2. Qué % es 1 de 3 → `33,3333 %`.
3. Variación de 80 a 60 → «una disminución del 25 %»; desde 0 → error.

- [ ] **Step 12: Commit**

```bash
git add src/tools/percent src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni `.check-percent.mjs`). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(percent): calculadora de porcentajes con tres modos"
```

---

### Task 13: Regla de tres: directa e inversa con la fórmula a la vista

**Files:**
- Create: `src/tools/rule-of-three/logic.ts`, `src/tools/rule-of-three/logic.test.ts`, `src/tools/rule-of-three/meta.ts`, `src/tools/rule-of-three/strings.ts`, `src/tools/rule-of-three/content.es.md`, `src/tools/rule-of-three/content.en.md`, `src/tools/rule-of-three/RuleOfThree.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `parseDecimal`, `formatNumber` (Task 0); `fill`; `t`; kit: `Segmented`, `Field`, `Display`, `CopyButton`, `Toggle`, `persistedInput`.
- Produces:
  - `type Kind`, `ruleOfThree(kind, a, b, c)`, `divisorOf(kind)`.
  - Inputs recordados: `rule-of-three` (A), `rule-of-three-b` y `rule-of-three-c`, compartidos por las dos pestañas.
  - `meta: ToolMeta` (id `rule-of-three`, slugs `regla-de-tres` / `rule-of-three-calculator`), `strings: Record<Locale, …>`, componente `RuleOfThree` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 15: `Segmented main` Directa · Inversa, `#rot-a`, `#rot-b`, `#rot-c`, `#rot-x` (resultado en el `Display`), `<output>` con X junto a los campos.

**§7 (vinculante):** `rule-of-three` · calc · pestañas Directa · Inversa · «Si A → B, entonces C → X»; directa `X = B × C / A`, inversa `X = A × B / C`; fórmula con los valores sustituidos; A = 0 (directa) o C = 0 (inversa) → error; ejemplos 2 → 10, 5 → 25 y 4, 6, 8 → 3.

Cómo se cubre cada punto:
- Los dos ejemplos de la spec. Tests `solves the direct rule: 2 → 10, 5 → 25` y `solves the inverse rule: 4 people take 6 days, 8 people take 3`.
- Error por división entre 0 según el tipo. Test `refuses to divide by 0`.
- Fórmula sustituida («X = B × C / A = 10 × 5 / 2 = 25») en la cabecera del `Display`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l2-rule-of-three -b lote-2/rule-of-three   # desde el commit de la Task 0
cd ../devtools-l2-rule-of-three
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/rule-of-three/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { divisorOf, ruleOfThree } from './logic';

describe('ruleOfThree', () => {
  it('solves the direct rule: 2 → 10, 5 → 25', () => {
    expect(ruleOfThree('direct', 2, 10, 5)).toBe(25);
    expect(ruleOfThree('direct', 3, 4.5, 10)).toBe(15);
  });

  it('solves the inverse rule: 4 people take 6 days, 8 people take 3', () => {
    expect(ruleOfThree('inverse', 4, 6, 8)).toBe(3);
    expect(ruleOfThree('inverse', 3, 10, 4)).toBe(7.5);
  });

  it('removes floating-point noise', () => {
    expect(ruleOfThree('direct', 1, 0.1, 3)).toBe(0.3);
  });

  it('refuses to divide by 0', () => {
    expect(ruleOfThree('direct', 0, 10, 5)).toBeNull();
    expect(ruleOfThree('inverse', 4, 6, 0)).toBeNull();
    expect(ruleOfThree('direct', 2, 10, 0)).toBe(0);
    expect(divisorOf('direct')).toBe('A');
    expect(divisorOf('inverse')).toBe('C');
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/rule-of-three`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/rule-of-three/logic.ts`**

```ts
export type Kind = 'direct' | 'inverse';

/** Removes floating-point noise: 0.1 × 3 / 1 = 0.30000000000000004 → 0.3. */
function clean(x: number): number {
  return Number(x.toPrecision(12));
}

/**
 * "If A → B, then C → X".
 * Direct (more A, more B): X = B × C / A. Inverse (more A, less B): X = A × B / C.
 * Null when the divisor is 0.
 */
export function ruleOfThree(kind: Kind, a: number, b: number, c: number): number | null {
  if (kind === 'direct') return a === 0 ? null : clean((b * c) / a);
  return c === 0 ? null : clean((a * b) / c);
}

/** The value that cannot be 0 for each kind. */
export function divisorOf(kind: Kind): 'A' | 'C' {
  return kind === 'direct' ? 'A' : 'C';
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/rule-of-three`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/rule-of-three/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'rule-of-three',
  category: 'calc',
  icon: 'divide',
  slug: { es: 'regla-de-tres', en: 'rule-of-three-calculator' },
  name: { es: 'Regla de tres', en: 'Rule of three' },
  title: {
    es: 'Calculadora de regla de tres directa e inversa',
    en: 'Rule of three calculator: direct and inverse',
  },
  description: {
    es: 'Resuelve reglas de tres directas e inversas: si A es a B, cuánto es C. Muestra la fórmula con tus valores para que veas de dónde sale el resultado.',
    en: 'Solve direct and inverse rules of three: if A goes with B, what goes with C. Shows the formula with your values so you can see where the result comes from.',
  },
  keywords: {
    es: [
      'regla de tres',
      'regla de tres inversa',
      'regla de tres simple',
      'proporciones',
      'calcular proporción',
    ],
    en: [
      'rule of three',
      'inverse proportion',
      'direct proportion',
      'proportion calculator',
      'cross multiplication',
    ],
  },
  tabs: { es: ['Directa', 'Inversa'], en: ['Direct', 'Inverse'] },
  faq: {
    es: [
      {
        q: '¿Cuándo es directa y cuándo inversa?',
        a: 'Es directa si al aumentar una magnitud aumenta la otra (más kilos, más precio). Es inversa si al aumentar una disminuye la otra (más trabajadores, menos días).',
      },
    ],
    en: [
      {
        q: 'When is it direct and when inverse?',
        a: 'It is direct when one quantity grows as the other grows (more kilos, higher price). It is inverse when one grows as the other shrinks (more workers, fewer days).',
      },
    ],
  },
  rememberInput: true,
};
```

`src/tools/rule-of-three/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    tabs: 'Tipo',
    if: 'Si',
    then: 'entonces',
    a: 'A',
    b: 'B',
    c: 'C',
    x: 'X',
    result: 'Resultado',
    directHelp: 'Directa: si A aumenta, B aumenta en la misma proporción.',
    inverseHelp: 'Inversa: si A aumenta, B disminuye en la misma proporción.',
    formulaDirect: 'X = B × C / A = {b} × {c} / {a} = {x}',
    formulaInverse: 'X = A × B / C = {a} × {b} / {c} = {x}',
    zero: '{v} no puede ser 0: no se puede dividir entre 0.',
    invalid: 'Escribe un número, por ejemplo 1234,5.',
  },
  en: {
    tabs: 'Kind',
    if: 'If',
    then: 'then',
    a: 'A',
    b: 'B',
    c: 'C',
    x: 'X',
    result: 'Result',
    directHelp: 'Direct: when A grows, B grows in the same proportion.',
    inverseHelp: 'Inverse: when A grows, B shrinks in the same proportion.',
    formulaDirect: 'X = B × C / A = {b} × {c} / {a} = {x}',
    formulaInverse: 'X = A × B / C = {a} × {b} / {c} = {x}',
    zero: '{v} cannot be 0: you cannot divide by 0.',
    invalid: 'Type a number, for example 1234.5.',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/rule-of-three/content.es.md`:
```md
## Cómo funciona

La regla de tres resuelve proporciones del tipo «si A corresponde a B, ¿qué corresponde a C?». Escribe los tres valores y la herramienta calcula X y te enseña la fórmula con tus números.

- **Directa**: las dos magnitudes crecen juntas. Si 2 kg cuestan 10 €, 5 kg cuestan `X = B × C / A = 10 × 5 / 2 = 25 €`.
- **Inversa**: cuando una crece, la otra baja. Si 4 personas tardan 6 días, 8 personas tardan `X = A × B / C = 4 × 6 / 8 = 3 días`.

## Cuál elegir

Pregúntate qué pasa con la segunda magnitud si duplicas la primera. Si también se duplica (el doble de kilos, el doble de precio), es directa. Si se reduce a la mitad (el doble de personas, la mitad de días), es inversa. En la directa A no puede ser 0 y en la inversa C no puede ser 0, porque habría que dividir entre 0.
```

`src/tools/rule-of-three/content.en.md`:
```md
## How it works

The rule of three solves proportions like "if A goes with B, what goes with C?". Type the three values and the tool works out X and shows the formula with your numbers.

- **Direct**: both quantities grow together. If 2 kg cost 10 €, 5 kg cost `X = B × C / A = 10 × 5 / 2 = 25 €`.
- **Inverse**: when one grows, the other shrinks. If 4 people take 6 days, 8 people take `X = A × B / C = 4 × 6 / 8 = 3 days`.

## Which one to pick

Ask yourself what happens to the second quantity if you double the first. If it doubles too (twice the kilos, twice the price), it is direct. If it halves (twice the people, half the days), it is inverse. In the direct rule A cannot be 0, and in the inverse rule C cannot be 0, because you would have to divide by 0.
```

- [ ] **Step 8: `src/tools/rule-of-three/RuleOfThree.svelte`**

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { formatNumber, parseDecimal } from '../../lib/numbers';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { divisorOf, ruleOfThree, type Kind } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  type Stored = ReturnType<typeof persistedInput>;

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const A = persistedInput('rule-of-three', '2', remember);
  const B = persistedInput('rule-of-three-b', '10', remember);
  const C = persistedInput('rule-of-three-c', '5', remember);

  let kind = $state<Kind>('direct');
  const num = (p: Stored) => parseDecimal(p.value, locale);
  const fmt = (n: number) => formatNumber(n, locale);

  const a = $derived(num(A));
  const b = $derived(num(B));
  const c = $derived(num(C));
  const x = $derived(a !== null && b !== null && c !== null ? ruleOfThree(kind, a, b, c) : null);
  const error = $derived.by(() => {
    if (a === null || b === null || c === null) return s.invalid;
    if (x === null) return fill(s.zero, { v: divisorOf(kind) });
    return undefined;
  });
  const formula = $derived(
    x === null
      ? ''
      : fill(kind === 'direct' ? s.formulaDirect : s.formulaInverse, {
          a: fmt(a!),
          b: fmt(b!),
          c: fmt(c!),
          x: fmt(x),
        }),
  );
</script>

{#snippet numberField(id: string, label: string, store: Stored)}
  {@const bad = num(store) === null}
  <Field {id} {label} error={bad ? s.invalid : undefined}>
    {#snippet children({ describedby })}
      <input
        {id}
        class="control mono"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        spellcheck="false"
        aria-describedby={describedby}
        aria-invalid={bad}
        value={store.value}
        oninput={(e) => (store.value = e.currentTarget.value)}
      />
    {/snippet}
  </Field>
{/snippet}

<div class="stack">
  <Segmented
    main
    label={s.tabs}
    options={[
      { value: 'direct', label: meta.tabs![locale][0] },
      { value: 'inverse', label: meta.tabs![locale][1] },
    ]}
    bind:value={kind}
  />

  <div class="panel">
    <p class="help">{kind === 'direct' ? s.directHelp : s.inverseHelp}</p>
    <div class="grid">
      <span class="word">{s.if}</span>
      {@render numberField('rot-a', s.a, A)}
      <span class="arrow" aria-hidden="true">→</span>
      {@render numberField('rot-b', s.b, B)}
      <span class="word">{s.then}</span>
      {@render numberField('rot-c', s.c, C)}
      <span class="arrow" aria-hidden="true">→</span>
      <div class="x">
        <span class="x-label">{s.x}</span>
        <output class="control mono" for="rot-a rot-b rot-c">{x === null ? '' : fmt(x)}</output>
      </div>
    </div>

    <Display live label={s.result}>
      {#snippet head()}<span>{error ?? formula}</span>{/snippet}
      {#if x !== null}<div class="display-value" id="rot-x">{fmt(x)}</div>{/if}
    </Display>

    <div class="row">
      <CopyButton main value={x === null ? '' : fmt(x)} {locale} />
    </div>

    <Toggle
      bind:checked={
        () => A.remember,
        (v) => {
          A.remember = v;
          B.remember = v;
          C.remember = v;
        }
      }
      label={t(locale, 'tool.remember')}
    />
  </div>
</div>

<style>
  .help {
    font-size: 14px;
    color: var(--text-dim);
  }
  .grid {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: end;
    gap: 12px 12px;
  }
  .word,
  .arrow {
    padding-bottom: 12px;
    font-weight: 600;
  }
  .arrow {
    color: var(--text-dim);
  }
  .x {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .x-label {
    font-size: 13px;
    font-weight: 600;
  }
  output {
    display: flex;
    align-items: center;
    background: var(--well);
  }
  @media (max-width: 480px) {
    .grid {
      grid-template-columns: auto minmax(0, 1fr);
    }
    .arrow {
      display: none;
    }
    .word {
      grid-column: 1 / -1;
      padding-bottom: 0;
    }
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as ruleOfThree } from './rule-of-three/meta';
```
→
```ts
import { meta as ruleOfThree } from './rule-of-three/meta';
```
y
```ts
  // ruleOfThree,
```
→
```ts
  ruleOfThree,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import RuleOfThree from '../tools/rule-of-three/RuleOfThree.svelte';
```
→
```astro
import RuleOfThree from '../tools/rule-of-three/RuleOfThree.svelte';
```
y
```astro
{/* {id === 'rule-of-three' && <RuleOfThree client:load locale={locale} />} */}
```
→
```astro
{id === 'rule-of-three' && <RuleOfThree client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/regla-de-tres.html dist/en/rule-of-three-calculator.html
git status --porcelain
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `rule-of-three`: título ≤ 65, descripción de 51 a 160 caracteres, slugs e icono, y sus dos `content.*.md`); existen las dos páginas; `git status` solo lista `src/tools/rule-of-three/`, `src/tools/registry.ts` y `src/components/ToolIsland.astro`. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador desechable (puerto 4663)**

Crea `.check-rule-of-three.mjs` en la raíz del worktree (no se confirma):
```js
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4663';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.route('**/analytics.alvarotc.com/**', (r) => r.abort());
await p.route('**/api.frankfurter.dev/**', (r) => r.abort());
await p.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => p.getByText(text).first().waitFor({ timeout: 5000 });
const expectText = (sel, text) =>
  p.locator(sel).filter({ hasText: text }).first().waitFor({ timeout: 5000 });
const expectValue = (sel, v) =>
  p.waitForFunction(([s, want]) => document.querySelector(s)?.value === want, [sel, v], {
    timeout: 5000,
  });
try {
  await p.goto(`${BASE}/es/regla-de-tres`);
  await p.locator('#rot-a').fill('2');
  await p.locator('#rot-b').fill('10');
  await p.locator('#rot-c').fill('5');
  await expectText('#rot-x', '25');
  await see('X = B × C / A = 10 × 5 / 2 = 25');
  await p.getByRole('radio', { name: 'Inversa' }).click();
  await p.locator('#rot-a').fill('4');
  await p.locator('#rot-b').fill('6');
  await p.locator('#rot-c').fill('8');
  await expectText('#rot-x', '3');
  await p.locator('#rot-c').fill('0');
  await see('C no puede ser 0');
  await p.goto(`${BASE}/en/rule-of-three-calculator`);
  await p.locator('.panel').first().waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK rule-of-three');
} finally {
  await b.close();
}
```

```bash
./node_modules/.bin/astro preview --port 4663 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
sleep 4
node .check-rule-of-three.mjs
kill $PREVIEW
rm .check-rule-of-three.mjs
```
Expected: `OK rule-of-three` y ningún error. El script falla si una espera no se cumple en 5 s o si la página lanza un error. Aborta cualquier petición a `api.frankfurter.dev`: ninguna comprobación depende de la red.

A mano con `pnpm preview`, en `/es/regla-de-tres`, en tema claro y luego en oscuro y terminal, a 1280 px y a 390 px (sin scroll horizontal):
1. Directa 2 → 10, 5 → `25` y la fórmula sustituida.
2. Inversa 4, 6, 8 → `3`. C = 0 → «C no puede ser 0: no se puede dividir entre 0.».
3. A 390 px, la rejilla pasa a dos columnas sin scroll horizontal.

- [ ] **Step 12: Commit**

```bash
git add src/tools/rule-of-three src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni `.check-rule-of-three.mjs`). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(rule-of-three): regla de tres directa e inversa"
```

---

### Task 14: Días hábiles: festivos nacionales calculados y Viernes Santo desde la Pascua

**Files:**
- Create: `src/tools/workdays/logic.ts`, `src/tools/workdays/logic.test.ts`, `src/tools/workdays/meta.ts`, `src/tools/workdays/strings.ts`, `src/tools/workdays/content.es.md`, `src/tools/workdays/content.en.md`, `src/tools/workdays/Workdays.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `fill`; `t`; kit: `Field`, `Toggle`, `Display`, `CopyButton`, `persistedInput`. Las fechas son `<input type="date" class="control">`.
- Produces:
  - `MIN_YEAR`, `MAX_YEAR`, `MAX_SPAN_DAYS`, `type YMD`, `dayNumber`, `fromDayNumber`, `toIso`, `parseIsoDate`, `weekday`, `easterSunday`, `type HolidayKey`, `nationalHolidays`, `type CountResult`, `countDays(start, end, includeEnd)`.
  - `strings.ts` exporta además `holidayNames` (nombre de cada festivo por idioma).
  - Inputs recordados: `workdays` (inicio), `workdays-end` y `workdays-include` (`1`/`0`).
  - `meta: ToolMeta` (id `workdays`, slugs `calculadora-dias-habiles` / `spanish-business-days-calculator`), `strings: Record<Locale, …>`, componente `Workdays` con props `{ locale: Locale }`.
  - DOM para los e2e de la Task 15: `#workdays-start`, `#workdays-end`, interruptor «Incluir el día final», `#workdays-natural`, `#workdays-business`, lista de festivos con su nombre («Epifanía del Señor»).

**§7 (vinculante):** `workdays` · calc · sin pestañas · dos fechas y «Incluir el día final» (activado); intervalo cerrado o semiabierto, el mismo para todos los recuentos; intercambio con aviso; días UTC y `((día + 4) % 7 + 7) % 7`; naturales (y en semanas), laborables, hábiles, fin de semana y festivos con «cae en domingo: no resta»; 9 fijos + Viernes Santo con Meeus/Jones/Butcher; 20, 21 y 254; nota fija; 1900–2100 y máximo 100 años.

Cómo se cubre cada punto:
- Pascua con los seis años de la spec y Viernes Santo 2026-04-03. Tests del bloque `Easter and Good Friday`.
- Día de la semana antes y después de 1970 (1900-01-01 fue lunes). Test `knows the day of the week before and after 1970`.
- Enero de 2026 = 20 hábiles, abril = 21 y 2026 entero = 254. Tests `counts January 2026: 31 days, 20 business days` y `counts April 2026 (Good Friday) and the whole of 2026` (Review Focus 4).
- Mismo conjunto de días para todos los recuentos, con y sin el día final (el 2026-01-31 es sábado: quitarlo resta un natural y ningún hábil). Test `includes or excludes the last day, with the same set for every count`.
- Sin días de más ni de menos en los cambios de hora. Test `never gains or loses a day across a DST change` (Review Focus 4).
- Festivos en fin de semana marcados y sin restar dos veces; intercambio; límites de años y de 100 años. Tests `marks holidays that fall on a weekend…`, `swaps reversed dates and says so` y `refuses dates outside 1900–2100…`.
- Nota fija de la spec y dos FAQ.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-l2-workdays -b lote-2/workdays   # desde el commit de la Task 0
cd ../devtools-l2-workdays
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre y lee los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`. Si alguna prop difiere de lo que usa este plan, adapta el componente del Step 8 a la real.

- [ ] **Step 2: Test (falla)**

`src/tools/workdays/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  countDays,
  dayNumber,
  easterSunday,
  nationalHolidays,
  parseIsoDate,
  toIso,
  weekday,
  fromDayNumber,
} from './logic';

const count = (start: string, end: string, includeEnd = true) => {
  const r = countDays(start, end, includeEnd);
  if (!r.ok) throw new Error(r.reason);
  return r;
};

describe('calendar arithmetic', () => {
  it('knows the day of the week before and after 1970', () => {
    expect(weekday(dayNumber({ y: 1970, m: 1, d: 1 }))).toBe(4); // Thursday
    expect(weekday(dayNumber({ y: 1900, m: 1, d: 1 }))).toBe(1); // Monday
    expect(weekday(dayNumber({ y: 2026, m: 9, d: 27 }))).toBe(0); // Sunday
    expect(weekday(dayNumber({ y: 2100, m: 12, d: 31 }))).toBe(5); // Friday
  });

  it('parses only real dates', () => {
    expect(parseIsoDate('2026-01-31')).toEqual({ y: 2026, m: 1, d: 31 });
    expect(parseIsoDate('2024-02-29')).toEqual({ y: 2024, m: 2, d: 29 });
    expect(parseIsoDate('2026-02-29')).toBeNull();
    expect(parseIsoDate('31/01/2026')).toBeNull();
    expect(toIso(fromDayNumber(dayNumber({ y: 1905, m: 3, d: 7 })))).toBe('1905-03-07');
  });
});

describe('Easter and Good Friday', () => {
  it('matches known Easter Sundays', () => {
    const iso = (y: number) => toIso(easterSunday(y));
    expect(iso(2024)).toBe('2024-03-31');
    expect(iso(2025)).toBe('2025-04-20');
    expect(iso(2026)).toBe('2026-04-05');
    expect(iso(2027)).toBe('2027-03-28');
    expect(iso(2038)).toBe('2038-04-25');
    expect(iso(2285)).toBe('2285-03-22');
  });

  it('puts Good Friday two days before Easter', () => {
    const gf = nationalHolidays(2026).find((h) => h.key === 'goodFriday')!;
    expect(toIso(fromDayNumber(gf.day))).toBe('2026-04-03');
    expect(weekday(gf.day)).toBe(5);
  });

  it('has the 10 national holidays in date order', () => {
    const list = nationalHolidays(2026).map((h) => toIso(fromDayNumber(h.day)));
    expect(list).toEqual([
      '2026-01-01',
      '2026-01-06',
      '2026-04-03',
      '2026-05-01',
      '2026-08-15',
      '2026-10-12',
      '2026-11-01',
      '2026-12-06',
      '2026-12-08',
      '2026-12-25',
    ]);
  });
});

describe('countDays', () => {
  it('counts January 2026: 31 days, 20 business days', () => {
    const r = count('2026-01-01', '2026-01-31');
    expect(r).toMatchObject({ natural: 31, weeks: 4, extraDays: 3, weekdays: 22, business: 20 });
    expect(r.weekend).toBe(9);
    expect(r.holidays.map((h) => h.key)).toEqual(['newYear', 'epiphany']);
  });

  it('counts April 2026 (Good Friday) and the whole of 2026', () => {
    expect(count('2026-04-01', '2026-04-30').business).toBe(21);
    const year = count('2026-01-01', '2026-12-31');
    expect(year.natural).toBe(365);
    expect(year.business).toBe(254);
  });

  it('marks holidays that fall on a weekend and does not subtract them twice', () => {
    const r = count('2026-11-01', '2026-11-01');
    expect(r.holidays).toEqual([
      { day: dayNumber({ y: 2026, m: 11, d: 1 }), key: 'allSaints', weekday: 0, onWeekend: true },
    ]);
    expect(r).toMatchObject({ natural: 1, weekdays: 0, business: 0, weekend: 1 });
  });

  it('includes or excludes the last day, with the same set for every count', () => {
    expect(count('2026-01-05', '2026-01-05')).toMatchObject({ natural: 1, business: 1 });
    expect(count('2026-01-05', '2026-01-05', false)).toMatchObject({
      natural: 0,
      business: 0,
      weekend: 0,
    });
    // 2026-01-31 is a Saturday: leaving it out removes a natural day but no business day.
    expect(count('2026-01-01', '2026-01-31', false)).toMatchObject({ natural: 30, business: 20 });
    expect(count('2026-01-01', '2026-01-30', false)).toMatchObject({ natural: 29, business: 19 });
  });

  it('never gains or loses a day across a DST change', () => {
    expect(count('2026-03-28', '2026-03-30').natural).toBe(3);
    expect(count('2026-10-24', '2026-10-26').natural).toBe(3);
  });

  it('swaps reversed dates and says so', () => {
    expect(count('2026-01-31', '2026-01-01')).toMatchObject({ swapped: true, business: 20 });
  });

  it('refuses dates outside 1900–2100, spans over 100 years and invalid dates', () => {
    expect(countDays('1899-12-31', '1900-01-10', true)).toEqual({ ok: false, reason: 'years' });
    expect(countDays('2026-01-01', '2101-01-01', true)).toEqual({ ok: false, reason: 'years' });
    expect(countDays('1900-01-01', '2001-01-01', true)).toEqual({ ok: false, reason: 'tooLong' });
    expect(countDays('', '2026-01-01', true)).toEqual({ ok: false, reason: 'invalid' });
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/workdays`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/workdays/logic.ts`**

```ts
const DAY_MS = 86_400_000;
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;
/** 100 years, leap days included. */
export const MAX_SPAN_DAYS = 36_525;

export interface YMD {
  y: number;
  m: number;
  d: number;
}

/** Days since 1970-01-01 in UTC, so DST changes never add or remove a day. */
export function dayNumber({ y, m, d }: YMD): number {
  return Date.UTC(y, m - 1, d) / DAY_MS;
}

export function fromDayNumber(n: number): YMD {
  const date = new Date(n * DAY_MS);
  return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() };
}

export function toIso({ y, m, d }: YMD): string {
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** "2026-01-31" → { y, m, d }; null if it is not a real date. */
export function parseIsoDate(s: string): YMD | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const ymd = { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
  const back = fromDayNumber(dayNumber(ymd));
  return back.y === ymd.y && back.m === ymd.m && back.d === ymd.d ? ymd : null;
}

/** 0 = Sunday … 6 = Saturday. 1970-01-01 was a Thursday; the double modulo handles days before 1970. */
export function weekday(day: number): number {
  return (((day + 4) % 7) + 7) % 7;
}

/** Easter Sunday, anonymous Gregorian algorithm (Meeus/Jones/Butcher). */
export function easterSunday(year: number): YMD {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = h + l - 7 * m + 114;
  return { y: year, m: Math.floor(n / 31), d: (n % 31) + 1 };
}

export type HolidayKey =
  | 'newYear'
  | 'epiphany'
  | 'goodFriday'
  | 'labour'
  | 'assumption'
  | 'nationalDay'
  | 'allSaints'
  | 'constitution'
  | 'immaculate'
  | 'christmas';

const FIXED: [number, number, HolidayKey][] = [
  [1, 1, 'newYear'],
  [1, 6, 'epiphany'],
  [5, 1, 'labour'],
  [8, 15, 'assumption'],
  [10, 12, 'nationalDay'],
  [11, 1, 'allSaints'],
  [12, 6, 'constitution'],
  [12, 8, 'immaculate'],
  [12, 25, 'christmas'],
];

export interface Holiday {
  day: number;
  key: HolidayKey;
}

/** National holidays common to all of Spain, sorted by date. Good Friday = Easter − 2 days. */
export function nationalHolidays(year: number): Holiday[] {
  const list = FIXED.map(([m, d, key]) => ({ day: dayNumber({ y: year, m, d }), key }));
  list.push({ day: dayNumber(easterSunday(year)) - 2, key: 'goodFriday' });
  return list.sort((a, b) => a.day - b.day);
}

export interface Counts {
  /** The dates were given in reverse order and have been swapped. */
  swapped: boolean;
  natural: number;
  weeks: number;
  extraDays: number;
  /** Monday to Friday. */
  weekdays: number;
  /** Monday to Friday, minus national holidays. */
  business: number;
  weekend: number;
  holidays: { day: number; key: HolidayKey; weekday: number; onWeekend: boolean }[];
}

export type CountResult =
  ({ ok: true } & Counts) | { ok: false; reason: 'invalid' | 'years' | 'tooLong' };

/**
 * Counts the days in [start, end] (or [start, end) without the last day). The same set of
 * days is used for every count.
 */
export function countDays(start: string, end: string, includeEnd: boolean): CountResult {
  let a = parseIsoDate(start);
  let b = parseIsoDate(end);
  if (!a || !b) return { ok: false, reason: 'invalid' };
  if ([a.y, b.y].some((y) => y < MIN_YEAR || y > MAX_YEAR)) return { ok: false, reason: 'years' };
  let first = dayNumber(a);
  let last = dayNumber(b);
  const swapped = last < first;
  if (swapped) {
    [first, last] = [last, first];
    [a, b] = [b, a];
  }
  if (last - first > MAX_SPAN_DAYS) return { ok: false, reason: 'tooLong' };
  const stop = includeEnd ? last : last - 1;

  const holidayKeys = new Map<number, HolidayKey>();
  for (let y = a.y; y <= b.y; y++) {
    for (const h of nationalHolidays(y)) holidayKeys.set(h.day, h.key);
  }

  let weekdays = 0;
  let business = 0;
  const holidays: Counts['holidays'] = [];
  for (let day = first; day <= stop; day++) {
    const wd = weekday(day);
    const onWeekend = wd === 0 || wd === 6;
    const key = holidayKeys.get(day);
    if (key) holidays.push({ day, key, weekday: wd, onWeekend });
    if (!onWeekend) {
      weekdays++;
      if (!key) business++;
    }
  }
  const natural = Math.max(0, stop - first + 1);
  return {
    ok: true,
    swapped,
    natural,
    weeks: Math.floor(natural / 7),
    extraDays: natural % 7,
    weekdays,
    business,
    weekend: natural - weekdays,
    holidays,
  };
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/workdays`
Expected: PASS.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/workdays/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'workdays',
  category: 'calc',
  icon: 'calendar-days',
  slug: { es: 'calculadora-dias-habiles', en: 'spanish-business-days-calculator' },
  name: { es: 'Días hábiles', en: 'Business days' },
  title: {
    es: 'Calculadora de días hábiles y días entre fechas',
    en: 'Spanish business days calculator between two dates',
  },
  description: {
    es: 'Cuenta los días naturales, laborables y hábiles entre dos fechas, con los festivos nacionales de España calculados para cualquier año, Viernes Santo incluido.',
    en: 'Count calendar days, weekdays and business days between two dates, with Spain’s national holidays worked out for any year, Good Friday included.',
  },
  keywords: {
    es: [
      'días hábiles',
      'días entre fechas',
      'calcular plazo',
      'días laborables',
      'festivos nacionales',
      'contar días',
    ],
    en: [
      'business days calculator',
      'days between dates',
      'working days spain',
      'spanish holidays',
      'count days',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Cuenta los festivos de mi comunidad?',
        a: 'No. Solo los festivos nacionales comunes a toda España. Los autonómicos y locales (como Jueves Santo o San José) y los traslados de festivos que caen en domingo cambian según la comunidad y el año.',
      },
      {
        q: '¿El sábado es día hábil?',
        a: 'Aquí no: se cuentan de lunes a viernes. En los plazos administrativos tampoco lo es desde la Ley 39/2015, que declara inhábiles los sábados, los domingos y los festivos.',
      },
    ],
    en: [
      {
        q: 'Does it include my region’s holidays?',
        a: 'No. Only the national holidays shared by all of Spain. Regional and local holidays (such as Maundy Thursday or Saint Joseph’s Day) and holidays moved from a Sunday change by region and year.',
      },
      {
        q: 'Is Saturday a business day?',
        a: 'Not here: Monday to Friday are counted. It is not one for Spanish administrative deadlines either since Law 39/2015, which excludes Saturdays, Sundays and holidays.',
      },
    ],
  },
  rememberInput: true,
};
```

`src/tools/workdays/strings.ts`:
```ts
import type { Locale } from '../types';
import type { HolidayKey } from './logic';

export const strings = {
  es: {
    start: 'Fecha de inicio',
    end: 'Fecha de fin',
    includeEnd: 'Incluir el día final',
    result: 'Recuento',
    natural: 'Días naturales',
    weeks: '{w} semanas y {d} días',
    weekdays: 'Días laborables (L–V)',
    business: 'Días hábiles',
    weekend: 'Días de fin de semana',
    holidays: 'Festivos nacionales en el rango',
    noHolidays: 'No hay festivos nacionales en el rango.',
    onWeekend: 'cae en {d}: no resta',
    summary: '{n} días hábiles',
    empty: 'Elige las dos fechas.',
    invalid: 'Escribe fechas válidas, como 2026-01-31.',
    years: 'Elige fechas entre 1900 y 2100.',
    tooLong: 'El rango no puede superar los 100 años.',
    swapped: 'La fecha de fin era anterior a la de inicio: se han intercambiado.',
    note: 'Solo festivos nacionales comunes a toda España. No incluye festivos autonómicos ni locales (como Jueves Santo o San José), ni los traslados que hacen las comunidades cuando un festivo cae en domingo.',
  },
  en: {
    start: 'Start date',
    end: 'End date',
    includeEnd: 'Include the end date',
    result: 'Count',
    natural: 'Calendar days',
    weeks: '{w} weeks and {d} days',
    weekdays: 'Weekdays (Mon–Fri)',
    business: 'Business days',
    weekend: 'Weekend days',
    holidays: 'National holidays in the range',
    noHolidays: 'No national holidays in the range.',
    onWeekend: 'falls on a {d}: not subtracted',
    summary: '{n} business days',
    empty: 'Pick both dates.',
    invalid: 'Type valid dates, like 2026-01-31.',
    years: 'Pick dates between 1900 and 2100.',
    tooLong: 'The range cannot be longer than 100 years.',
    swapped: 'The end date was before the start date: they have been swapped.',
    note: 'Only national holidays shared by all of Spain. Regional and local holidays (such as Maundy Thursday or Saint Joseph’s Day) are not included, nor the holidays regions move when one falls on a Sunday.',
  },
} satisfies Record<Locale, Record<string, string>>;

export const holidayNames: Record<Locale, Record<HolidayKey, string>> = {
  es: {
    newYear: 'Año Nuevo',
    epiphany: 'Epifanía del Señor',
    goodFriday: 'Viernes Santo',
    labour: 'Fiesta del Trabajo',
    assumption: 'Asunción de la Virgen',
    nationalDay: 'Fiesta Nacional de España',
    allSaints: 'Todos los Santos',
    constitution: 'Día de la Constitución',
    immaculate: 'Inmaculada Concepción',
    christmas: 'Navidad',
  },
  en: {
    newYear: 'New Year’s Day',
    epiphany: 'Epiphany',
    goodFriday: 'Good Friday',
    labour: 'Labour Day',
    assumption: 'Assumption of Mary',
    nationalDay: 'National Day of Spain',
    allSaints: 'All Saints’ Day',
    constitution: 'Constitution Day',
    immaculate: 'Immaculate Conception',
    christmas: 'Christmas Day',
  },
};
```

- [ ] **Step 7: Contenido SEO**

`src/tools/workdays/content.es.md`:
```md
## Cómo funciona

Elige una fecha de inicio y una de fin y verás, para ese intervalo, los **días naturales** (también en semanas y días), los **laborables** (de lunes a viernes), los **hábiles** (de lunes a viernes sin festivos nacionales) y los de fin de semana. Con «Incluir el día final» activado se cuentan los dos extremos; desactivado, el día final queda fuera. Todos los recuentos usan el mismo conjunto de días.

Los festivos nacionales se calculan para cualquier año entre 1900 y 2100, sin tablas que haya que actualizar: los nueve fijos (Año Nuevo, Epifanía, 1 de mayo, 15 de agosto, 12 de octubre, 1 de noviembre, 6 y 8 de diciembre y Navidad) y el **Viernes Santo**, que es el viernes anterior al domingo de Pascua. La Pascua se calcula con el algoritmo gregoriano de Meeus/Jones/Butcher. La lista del resultado marca los festivos que caen en fin de semana, porque esos no restan días hábiles.

## Lo que no incluye

Solo cuenta los festivos comunes a toda España. No incluye los autonómicos ni los locales (como Jueves Santo, San José o las fiestas patronales), ni los traslados que hacen las comunidades cuando un festivo cae en domingo. Si tu plazo depende de ellos, réstalos a mano. Las cuentas se hacen en días UTC, así que los cambios de hora de marzo y octubre no añaden ni quitan un día.
```

`src/tools/workdays/content.en.md`:
```md
## How it works

Pick a start date and an end date and you get, for that range, the **calendar days** (also in weeks and days), the **weekdays** (Monday to Friday), the **business days** (Monday to Friday minus Spain's national holidays) and the weekend days. With "Include the end date" on, both ends count; off, the end date is left out. Every count uses the same set of days.

National holidays are worked out for any year between 1900 and 2100, with no tables to update: the nine fixed ones (New Year's Day, Epiphany, 1 May, 15 August, 12 October, 1 November, 6 and 8 December and Christmas) and **Good Friday**, the Friday before Easter Sunday. Easter is computed with the Meeus/Jones/Butcher Gregorian algorithm. The result lists the holidays that fall on a weekend, because those do not reduce the business days.

## What it leaves out

Only holidays shared by all of Spain are counted. Regional and local holidays (such as Maundy Thursday, Saint Joseph's Day or town festivities) are not included, nor the holidays regions move when one falls on a Sunday. If your deadline depends on them, subtract them by hand. Counting is done in UTC days, so the March and October clock changes never add or remove a day.
```

- [ ] **Step 8: `src/tools/workdays/Workdays.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { countDays, toIso } from './logic';
  import { meta } from './meta';
  import { holidayNames, strings } from './strings';

  const DAY_MS = 86_400_000;

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const remember = meta.rememberInput ?? true;
  const start = persistedInput('workdays', '', remember);
  const end = persistedInput('workdays-end', '', remember);
  const include = persistedInput('workdays-include', '1', remember);

  // Runs after persistedInput's onMount: only fills the dates when nothing was remembered.
  // Today comes from the browser, never from the build machine.
  onMount(() => {
    if (start.value || end.value) return;
    const now = new Date();
    start.value = toIso({ y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() });
    end.value = `${now.getFullYear()}-12-31`;
  });

  const includeEnd = $derived(include.value !== '0');
  const result = $derived(
    start.value && end.value ? countDays(start.value, end.value, includeEnd) : null,
  );
  const error = $derived.by(() => {
    if (!result || result.ok) return undefined;
    return result.reason === 'years'
      ? s.years
      : result.reason === 'tooLong'
        ? s.tooLong
        : s.invalid;
  });

  const dateFmt = $derived(
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }),
  );
  const weekdayFmt = $derived(
    new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }),
  );
  const fmt = (n: number) => new Intl.NumberFormat(locale).format(n);
</script>

<div class="panel">
  <div class="row">
    <Field id="workdays-start" label={s.start}>
      {#snippet children({ describedby })}
        <input
          id="workdays-start"
          class="control"
          type="date"
          min="1900-01-01"
          max="2100-12-31"
          aria-describedby={describedby}
          bind:value={start.value}
        />
      {/snippet}
    </Field>
    <Field id="workdays-end" label={s.end}>
      {#snippet children({ describedby })}
        <input
          id="workdays-end"
          class="control"
          type="date"
          min="1900-01-01"
          max="2100-12-31"
          aria-describedby={describedby}
          bind:value={end.value}
        />
      {/snippet}
    </Field>
    <Toggle
      bind:checked={() => includeEnd, (v) => (include.value = v ? '1' : '0')}
      label={s.includeEnd}
    />
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      <span>{result?.ok ? fill(s.summary, { n: fmt(result.business) }) : (error ?? s.empty)}</span>
    {/snippet}
    {#if result?.ok}
      {#if result.swapped}<p class="display-note">{s.swapped}</p>{/if}
      <dl class="display-kv">
        <dt>{s.natural}</dt>
        <dd>
          <span id="workdays-natural">{fmt(result.natural)}</span>
          <span class="dim">({fill(s.weeks, { w: fmt(result.weeks), d: result.extraDays })})</span>
        </dd>
        <dt>{s.weekdays}</dt>
        <dd>{fmt(result.weekdays)}</dd>
        <dt>{s.business}</dt>
        <dd id="workdays-business" class="strong">{fmt(result.business)}</dd>
        <dt>{s.weekend}</dt>
        <dd>{fmt(result.weekend)}</dd>
      </dl>
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={result?.ok ? String(result.business) : ''} {locale} />
  </div>

  {#if result?.ok}
    <Display label={s.holidays}>
      {#snippet head()}<span>{s.holidays}</span>{/snippet}
      {#if result.holidays.length}
        <ul class="display-rows holidays">
          {#each result.holidays as h (h.day)}
            {@const date = new Date(h.day * DAY_MS)}
            <li class="display-row" class:weekend={h.onWeekend}>
              <span>{dateFmt.format(date)} · {holidayNames[locale][h.key]}</span>
              {#if h.onWeekend}
                <span class="dim">{fill(s.onWeekend, { d: weekdayFmt.format(date) })}</span>
              {/if}
            </li>
          {/each}
        </ul>
      {:else}
        <p class="display-note">{s.noHolidays}</p>
      {/if}
    </Display>
  {/if}

  <p class="note">{s.note}</p>

  <Toggle
    bind:checked={
      () => start.remember,
      (v) => {
        start.remember = v;
        end.remember = v;
        include.remember = v;
      }
    }
    label={t(locale, 'tool.remember')}
  />
</div>

<style>
  .holidays {
    padding: 0;
    list-style: none;
  }
  .weekend {
    color: var(--disp-dim);
  }
  .dim {
    color: var(--disp-dim);
  }
  .strong {
    font-weight: 700;
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
// import { meta as workdays } from './workdays/meta';
```
→
```ts
import { meta as workdays } from './workdays/meta';
```
y
```ts
  // workdays,
```
→
```ts
  workdays,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Workdays from '../tools/workdays/Workdays.svelte';
```
→
```astro
import Workdays from '../tools/workdays/Workdays.svelte';
```
y
```astro
{/* {id === 'workdays' && <Workdays client:load locale={locale} />} */}
```
→
```astro
{id === 'workdays' && <Workdays client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/calculadora-dias-habiles.html dist/en/spanish-business-days-calculator.html
git status --porcelain
```
Expected: todo en verde, incluido `registry.test.ts` (que ahora valida la meta de `workdays`: título ≤ 65, descripción de 51 a 160 caracteres, slugs e icono, y sus dos `content.*.md`); existen las dos páginas; `git status` solo lista `src/tools/workdays/`, `src/tools/registry.ts` y `src/components/ToolIsland.astro`. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobación de navegador desechable (puerto 4664)**

Crea `.check-workdays.mjs` en la raíz del worktree (no se confirma):
```js
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4664';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.route('**/analytics.alvarotc.com/**', (r) => r.abort());
await p.route('**/api.frankfurter.dev/**', (r) => r.abort());
await p.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => p.getByText(text).first().waitFor({ timeout: 5000 });
const expectText = (sel, text) =>
  p.locator(sel).filter({ hasText: text }).first().waitFor({ timeout: 5000 });
const expectValue = (sel, v) =>
  p.waitForFunction(([s, want]) => document.querySelector(s)?.value === want, [sel, v], {
    timeout: 5000,
  });
try {
  await p.goto(`${BASE}/es/calculadora-dias-habiles`);
  await p.locator('#workdays-start').fill('2026-01-01');
  await p.locator('#workdays-end').fill('2026-01-31');
  await expectText('#workdays-natural', '31');
  await expectText('#workdays-business', '20');
  await see('Epifanía del Señor');
  await p.getByRole('switch', { name: 'Incluir el día final' }).click();
  await expectText('#workdays-natural', '30');
  await p.getByRole('switch', { name: 'Incluir el día final' }).click();
  await p.locator('#workdays-start').fill('2026-04-30');
  await p.locator('#workdays-end').fill('2026-04-01');
  await see('se han intercambiado');
  await expectText('#workdays-business', '21');
  await see('Viernes Santo');
  await p.goto(`${BASE}/en/spanish-business-days-calculator`);
  await p.locator('.panel').first().waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK workdays');
} finally {
  await b.close();
}
```

```bash
./node_modules/.bin/astro preview --port 4664 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
sleep 4
node .check-workdays.mjs
kill $PREVIEW
rm .check-workdays.mjs
```
Expected: `OK workdays` y ningún error. El script falla si una espera no se cumple en 5 s o si la página lanza un error. Aborta cualquier petición a `api.frankfurter.dev`: ninguna comprobación depende de la red.

A mano con `pnpm preview`, en `/es/calculadora-dias-habiles`, en tema claro y luego en oscuro y terminal, a 1280 px y a 390 px (sin scroll horizontal):
1. Al cargar sin nada guardado: de hoy al 31 de diciembre.
2. 2026-01-01 → 2026-01-31: 31 naturales («4 semanas y 3 días»), 22 laborables, 20 hábiles; la lista incluye Año Nuevo y Epifanía del Señor.
3. Del 2026-11-01 al 2026-11-01: Todos los Santos «cae en domingo: no resta».
4. Fin anterior al inicio → aviso de intercambio. Año 1899 → «Elige fechas entre 1900 y 2100.».

- [ ] **Step 12: Commit**

```bash
git add src/tools/workdays src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni `.check-workdays.mjs`). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(workdays): días hábiles con festivos nacionales calculados"
```

---

### Task 15: Cierre: registro compacto, e2e del lote 2, README y verificación completa

**Files:**
- Create: `scripts/compact-registry.mjs` (temporal: se borra en el Step 2)
- Modify: `src/tools/registry.ts`, `src/components/ToolIsland.astro`, `e2e/tools.spec.ts`, `README.md`

**Interfaces:**
- Consumes: las 14 herramientas fusionadas y el DOM que declara cada task en su bloque «Interfaces».
- Produces: nada nuevo para otras tareas. El sitio queda con 39 herramientas en 8 categorías.

- [ ] **Step 1: Comprobar que las 14 ramas están fusionadas**

```bash
git switch feat/herramientas-lote-2
git log --oneline -20
grep -cE "^// import" src/tools/registry.ts src/components/ToolIsland.astro
grep -c "^{/\*" src/components/ToolIsland.astro
pnpm install --frozen-lockfile && pnpm test
```
Expected: los 14 commits `feat(<id>): …` en el log, los tres `grep -c` dan `0` y los tests en verde. Si alguna herramienta falta, termina antes su task: esta no la sustituye.

- [ ] **Step 2: Compactar `registry.ts` y `ToolIsland.astro`**

Las dos líneas de comentario «Lote 2…» y las líneas en blanco solo servían para fusionar en paralelo. Como el contenido exacto de las entradas del lote 1 depende de su plan, se quitan con un script que no toca nada más (y que falla si queda alguna línea comentada). Crea `scripts/compact-registry.mjs`:
```js
import { readFileSync, writeFileSync } from 'node:fs';

// Removes the Lote 2 scaffolding: the two comment lines and the blank lines that kept the
// parallel branches apart. Everything else stays byte for byte.
function compact(path, isAstro) {
  const lines = readFileSync(path, 'utf8').split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\/\/ (Lote 2: each tool task|Keep the blank lines between them)/.test(line)) continue;
    if (line.startsWith('//') && /^\/\/ (import|Lote)/.test(line)) {
      throw new Error(`${path}:${i + 1} is still commented out: ${line}`);
    }
    const prev = out[out.length - 1] ?? '';
    const next = lines.slice(i + 1).find((l) => l.trim() !== '' && !/^\/\/ (Lote 2|Keep)/.test(l)) ?? '';
    const isImport = (l) => l.startsWith('import ');
    const isEntry = (l) => /^ {2}\w+,$/.test(l);
    const isMount = (l) => isAstro && l.startsWith('{id === ');
    if (line.trim() === '') {
      if (isImport(prev) && isImport(next)) continue;
      if (isEntry(prev) && (isEntry(next) || next === '];')) continue;
      if (isMount(prev) && isMount(next)) continue;
      if (isMount(prev) && next === '') continue;
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
Expected: el diff solo quita las 2 líneas de comentario y las líneas en blanco del lote 2 en cada archivo. El final del bloque de imports de `registry.ts` queda así:
```ts
import { meta as units } from './units/meta';
import { meta as currency } from './currency/meta';
import { meta as pxRem } from './px-rem/meta';
import { meta as chmod } from './chmod/meta';
import { meta as fileSize } from './file-size/meta';
import { meta as wheel } from './wheel/meta';
import { meta as shuffle } from './shuffle/meta';
import { meta as teams } from './teams/meta';
import { meta as dice } from './dice/meta';
import { meta as iva } from './iva/meta';
import { meta as irpf } from './irpf/meta';
import { meta as percent } from './percent/meta';
import { meta as ruleOfThree } from './rule-of-three/meta';
import { meta as workdays } from './workdays/meta';
import type { Category, CategoryId, Locale, ToolMeta } from './types';
```
el final del array `tools`:
```ts
  units,
  currency,
  pxRem,
  chmod,
  fileSize,
  wheel,
  shuffle,
  teams,
  dice,
  iva,
  irpf,
  percent,
  ruleOfThree,
  workdays,
];
```
el final de los imports de `ToolIsland.astro`:
```astro
import Units from '../tools/units/Units.svelte';
import Currency from '../tools/currency/Currency.svelte';
import PxRem from '../tools/px-rem/PxRem.svelte';
import Chmod from '../tools/chmod/Chmod.svelte';
import FileSize from '../tools/file-size/FileSize.svelte';
import Wheel from '../tools/wheel/Wheel.svelte';
import Shuffle from '../tools/shuffle/Shuffle.svelte';
import Teams from '../tools/teams/Teams.svelte';
import Dice from '../tools/dice/Dice.svelte';
import Iva from '../tools/iva/Iva.svelte';
import Irpf from '../tools/irpf/Irpf.svelte';
import Percent from '../tools/percent/Percent.svelte';
import RuleOfThree from '../tools/rule-of-three/RuleOfThree.svelte';
import Workdays from '../tools/workdays/Workdays.svelte';
import type { Locale } from '../tools/types';
```
y el final de su plantilla:
```astro
{id === 'units' && <Units client:load locale={locale} />}
{id === 'currency' && <Currency client:load locale={locale} />}
{id === 'px-rem' && <PxRem client:load locale={locale} />}
{id === 'chmod' && <Chmod client:load locale={locale} />}
{id === 'file-size' && <FileSize client:load locale={locale} />}
{id === 'wheel' && <Wheel client:load locale={locale} />}
{id === 'shuffle' && <Shuffle client:load locale={locale} />}
{id === 'teams' && <Teams client:load locale={locale} />}
{id === 'dice' && <Dice client:load locale={locale} />}
{id === 'iva' && <Iva client:load locale={locale} />}
{id === 'irpf' && <Irpf client:load locale={locale} />}
{id === 'percent' && <Percent client:load locale={locale} />}
{id === 'rule-of-three' && <RuleOfThree client:load locale={locale} />}
{id === 'workdays' && <Workdays client:load locale={locale} />}
```

Run: `pnpm test && pnpm check`
Expected: verde. `registry.test.ts` valida las 39 metas, sus slugs únicos y sus 78 archivos de contenido.

- [ ] **Step 3: e2e del lote 2**

En `e2e/tools.spec.ts`, dentro del fixture `page`, justo después de la línea `await page.route('**/analytics.alvarotc.com/**', (r) => r.abort());`, añade:
```ts
    // No test ever downloads the real ECB rates (lote 2, currency).
    await page.route('**/api.frankfurter.dev/**', (r) => r.abort());
```
Así ningún test, tampoco el que solo carga la página de divisas, sale a la red. Los tests de divisas que necesitan tipos registran su propia ruta encima: Playwright prueba primero la última registrada.

Al final del array `PAGES` (después de la última entrada, antes de `];`), añade:
```ts
  ['/es/conversor-unidades', 'Unidades'],
  ['/es/conversor-divisas', 'Divisas'],
  ['/es/conversor-px-rem', 'px a rem'],
  ['/es/calculadora-chmod', 'chmod'],
  ['/es/conversor-tamano-archivos', 'Tamaños de archivo'],
  ['/es/ruleta-aleatoria', 'Ruleta'],
  ['/es/mezclar-lista-aleatoria', 'Mezclar lista'],
  ['/es/generador-equipos-aleatorios', 'Equipos'],
  ['/es/lanzar-dados-moneda', 'Dados y moneda'],
  ['/es/calculadora-iva', 'IVA'],
  ['/es/calculadora-retencion-irpf', 'Retención IRPF'],
  ['/es/calculadora-porcentajes', 'Porcentajes'],
  ['/es/regla-de-tres', 'Regla de tres'],
  ['/es/calculadora-dias-habiles', 'Días hábiles'],
```

Y al final del archivo, añade este bloque (usa el `test` extendido y el helper `radio` que ya están en el archivo):
```ts
// Lote 2: conversores, azar y calculadoras. The `page` fixture already aborts every request to
// api.frankfurter.dev; the currency tests that need rates register their own route on top.
const ECB_RATES = { amount: 1, base: 'EUR', date: '2026-09-25', rates: { USD: 1.1, GBP: 0.85 } };

test.describe('lote 2: one real interaction per tool', () => {
  test('the home page lists the new Calculators category', async ({ page }) => {
    await page.goto('/es');
    await expect(page.locator('.sidebar').getByText('Calculadoras').first()).toBeVisible();
  });

  test('units shows a value in every unit of the tab', async ({ page }) => {
    await page.goto('/es/conversor-unidades');
    await page.locator('#units-value').fill('1');
    await page.locator('#units-from').selectOption('mi');
    await expect(page.locator('[data-unit="km"]')).toContainText('1,609344');
  });

  test('currency converts with the ECB table and never calls the real API', async ({ page }) => {
    await page.route('**/api.frankfurter.dev/**', (r) => r.fulfill({ json: ECB_RATES }));
    await page.goto('/es/conversor-divisas');
    await expect(page.getByText('Tipos del BCE del 25/09/2026')).toBeVisible();
    await page.locator('#currency-amount').fill('10');
    await page.locator('#currency-from').selectOption('EUR');
    await page.locator('#currency-to').selectOption('USD');
    await expect(page.locator('#currency-result')).toContainText('11,00');
  });

  test('currency falls back to the saved rates when the download fails', async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem(
        'devtools:currency.rates',
        JSON.stringify({ date: '2026-09-25', rates: { EUR: 1, USD: 1.1 }, fetchedAt: 0 }),
      ),
    );
    await page.goto('/es/conversor-divisas');
    await expect(
      page.getByText('Sin conexión: se usan los tipos guardados del 25/09/2026'),
    ).toBeVisible();
  });

  test('currency explains the error and offers a retry with no saved rates', async ({ page }) => {
    await page.goto('/es/conversor-divisas');
    await expect(page.getByText('No se han podido descargar los tipos de cambio')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
  });

  test('px-rem keeps CSS decimals with a dot, also in Spanish', async ({ page }) => {
    await page.goto('/es/conversor-px-rem');
    await page.locator('#px-rem-px').fill('24');
    await expect(page.locator('#px-rem-rem')).toHaveValue('1.5');
    await expect(page.locator('.display-code')).toHaveText('font-size: 1.5rem; /* 24px */');
    await page.locator('#px-rem-base').fill('10');
    await expect(page.locator('#px-rem-rem')).toHaveValue('2.4');
  });

  test('chmod keeps octal, symbolic and checkboxes in sync', async ({ page }) => {
    await page.goto('/es/calculadora-chmod');
    await page.locator('#chmod-octal').fill('755');
    await expect(page.locator('#chmod-symbolic')).toHaveValue('rwxr-xr-x');
    await page.getByRole('checkbox', { name: 'Grupo: escritura' }).check();
    await expect(page.locator('#chmod-octal')).toHaveValue('775');
  });

  test('file-size shows a 1 TB drive in GiB', async ({ page }) => {
    await page.goto('/es/conversor-tamano-archivos');
    await page.locator('#file-size-input').fill('1 TB');
    await expect(page.locator('.display-head').first()).toContainText('931,3');
    await expect(page.locator('.display-head').first()).toContainText('GiB');
  });

  test('wheel picks a winner at once with reduced motion and can remove it', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/es/ruleta-aleatoria');
    await page.locator('#wheel-options').fill('Ana\nLuis\nEva');
    await page.getByRole('button', { name: 'Girar' }).click();
    await expect(page.getByText(/Ha salido: (Ana|Luis|Eva)/)).toBeVisible();
    await page.getByRole('switch', { name: 'Quitar la opción ganadora' }).click();
    await page.getByRole('button', { name: 'Girar' }).click();
    await expect(page.locator('#wheel-options')).toHaveValue(/^[^\n]+\n[^\n]+$/);
  });

  test('shuffle with a seed gives the same order after a reload', async ({ page }) => {
    await page.goto('/es/mezclar-lista-aleatoria');
    await page.locator('#shuffle-list').fill('a\nb\nc\nd\ne');
    await page.locator('#shuffle-seed').fill('demo');
    await expect(page.getByText('Con semilla: el orden es siempre el mismo.')).toBeVisible();
    const items = page.locator('.display-row .item');
    await expect(items).toHaveCount(5);
    const order = await items.allTextContents();
    expect([...order].sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
    // The list and the seed are remembered after a 300 ms debounce.
    await page.waitForTimeout(500);
    await page.reload();
    await expect(page.getByText('Con semilla: el orden es siempre el mismo.')).toBeVisible();
    await expect(items).toHaveCount(5);
    expect(await items.allTextContents()).toEqual(order);
  });

  test('teams splits 10 people, 3 per team, into 3, 3, 2 and 2', async ({ page }) => {
    await page.goto('/es/generador-equipos-aleatorios');
    const people = ['Ana', 'Luis', 'Eva', 'Marta', 'Pablo', 'Sara', 'Hugo', 'Lucía', 'Iván', 'Noa'];
    await page.locator('#teams-people').fill(people.join('\n'));
    await page.getByRole('radio', { name: 'Personas por equipo' }).click();
    await page.locator('#teams-n').fill('3');
    await expect(page.locator('.team')).toHaveCount(4);
    const sizes = await page
      .locator('.team')
      .evaluateAll((els) => els.map((el) => el.querySelectorAll('li').length));
    expect(sizes).toEqual([3, 3, 2, 2]);
  });

  test('dice rolls 3d6+2 with a seed and explains a bad range', async ({ page }) => {
    await page.goto('/es/lanzar-dados-moneda');
    await page.locator('#dice-notation').fill('3d6+2');
    await page.locator('#dice-seed').fill('demo');
    await page.getByRole('button', { name: 'Lanzar' }).click();
    await expect(page.locator('.die')).toHaveCount(3);
    const total = Number(await page.locator('#dice-total').textContent());
    expect(total).toBeGreaterThanOrEqual(5);
    expect(total).toBeLessThanOrEqual(20);
    await page.locator('#dice-notation').fill('0d6');
    await expect(page.getByText('Entre 1 y 100 dados: has puesto 0.')).toBeVisible();
  });

  test('dice with a seed repeats the whole series of rolls, not just the first', async ({
    page,
  }) => {
    await page.goto('/es/lanzar-dados-moneda');
    await page.locator('#dice-notation').fill('1d1000');
    const series = async () => {
      const totals: string[] = [];
      for (let i = 0; i < 5; i++) {
        await page.getByRole('button', { name: 'Lanzar' }).click();
        totals.push((await page.locator('#dice-total').textContent()) ?? '');
      }
      return totals;
    };
    await page.locator('#dice-seed').fill('demo');
    const first = await series();
    expect(new Set(first).size).toBeGreaterThan(1);
    await page.locator('#dice-seed').fill('otra');
    await page.locator('#dice-seed').fill('demo');
    expect(await series()).toEqual(first);
  });

  test('iva adds VAT to a base and takes it out of a total', async ({ page }) => {
    await page.goto('/es/calculadora-iva');
    await page.locator('#iva-amount').fill('100');
    await expect(page.locator('#iva-total')).toContainText('121,00');
    await page.getByRole('radio', { name: 'Total con IVA' }).click();
    await page.locator('#iva-amount').fill('121');
    await expect(page.locator('#iva-base')).toContainText('100,00');
  });

  test('irpf builds a 1000 € invoice with 21 % VAT and 15 % withholding', async ({ page }) => {
    await page.goto('/es/calculadora-retencion-irpf');
    await page.locator('#irpf-amount').fill('1000');
    await page.locator('#irpf-vat').selectOption('21');
    await page.locator('#irpf-rate').selectOption('15');
    await expect(page.locator('#irpf-net')).toHaveText(/1\.?060,00/);
  });

  test('percent computes X % of Y and refuses a change from 0', async ({ page }) => {
    await page.goto('/es/calculadora-porcentajes');
    await page.locator('#percent-x').fill('21');
    await page.locator('#percent-y').fill('200');
    await expect(page.locator('#percent-result')).toHaveText('42');
    await radio(page, 'Variación').click();
    await page.locator('#percent-a').fill('0');
    await expect(page.getByText('No hay variación porcentual desde 0.')).toBeVisible();
  });

  test('rule-of-three solves the direct and the inverse rule', async ({ page }) => {
    await page.goto('/es/regla-de-tres');
    await page.locator('#rot-a').fill('2');
    await page.locator('#rot-b').fill('10');
    await page.locator('#rot-c').fill('5');
    await expect(page.locator('#rot-x')).toHaveText('25');
    await radio(page, 'Inversa').click();
    await page.locator('#rot-a').fill('4');
    await page.locator('#rot-b').fill('6');
    await page.locator('#rot-c').fill('8');
    await expect(page.locator('#rot-x')).toHaveText('3');
  });

  test('workdays counts January 2026 and lists Epiphany', async ({ page }) => {
    await page.goto('/es/calculadora-dias-habiles');
    await page.locator('#workdays-start').fill('2026-01-01');
    await page.locator('#workdays-end').fill('2026-01-31');
    await expect(page.locator('#workdays-natural')).toHaveText('31');
    await expect(page.locator('#workdays-business')).toHaveText('20');
    await expect(page.getByText('Epifanía del Señor')).toBeVisible();
  });
});
```

Reglas de determinismo de la §9: dados y mezclar usan semilla; la ruleta se prueba con `reducedMotion: 'reduce'`; divisas nunca llama a la API real (fixture + `page.route`); los importes con `Intl` se comprueban con expresiones tolerantes (`/1\.?060,00/`) o con subcadenas que no dependen del agrupamiento.

Run:
```bash
pnpm build && pnpm test:e2e
```
Expected: todos en verde (en la copia de verificación: 79 tests sin el lote 1). Si falla un selector, compáralo con el bloque «DOM» de la task de esa herramienta; si falla el comportamiento, arregla el componente, no el test.

- [ ] **Step 4: Lista de herramientas en el README**

En `README.md`, en la tabla de `## Herramientas`, añade estas filas **al final de la tabla** (después de la última fila que dejó el lote 1):
```md
| Conversores | Unidades (longitud, masa, temperatura, volumen, área, velocidad y datos) | [/es/conversor-unidades](https://devtools.alvarotc.com/es/conversor-unidades) |
| Conversores | Divisas (tipos del BCE) | [/es/conversor-divisas](https://devtools.alvarotc.com/es/conversor-divisas) |
| Conversores | px a rem y em | [/es/conversor-px-rem](https://devtools.alvarotc.com/es/conversor-px-rem) |
| Conversores | chmod (permisos Unix) | [/es/calculadora-chmod](https://devtools.alvarotc.com/es/calculadora-chmod) |
| Conversores | Tamaños de archivo (SI y binario) | [/es/conversor-tamano-archivos](https://devtools.alvarotc.com/es/conversor-tamano-archivos) |
| Calculadoras | IVA | [/es/calculadora-iva](https://devtools.alvarotc.com/es/calculadora-iva) |
| Calculadoras | Retención de IRPF | [/es/calculadora-retencion-irpf](https://devtools.alvarotc.com/es/calculadora-retencion-irpf) |
| Calculadoras | Porcentajes | [/es/calculadora-porcentajes](https://devtools.alvarotc.com/es/calculadora-porcentajes) |
| Calculadoras | Regla de tres | [/es/regla-de-tres](https://devtools.alvarotc.com/es/regla-de-tres) |
| Calculadoras | Días hábiles | [/es/calculadora-dias-habiles](https://devtools.alvarotc.com/es/calculadora-dias-habiles) |
| Azar | Ruleta | [/es/ruleta-aleatoria](https://devtools.alvarotc.com/es/ruleta-aleatoria) |
| Azar | Mezclar lista | [/es/mezclar-lista-aleatoria](https://devtools.alvarotc.com/es/mezclar-lista-aleatoria) |
| Azar | Equipos aleatorios | [/es/generador-equipos-aleatorios](https://devtools.alvarotc.com/es/generador-equipos-aleatorios) |
| Azar | Dados y moneda | [/es/lanzar-dados-moneda](https://devtools.alvarotc.com/es/lanzar-dados-moneda) |
```
Si el lote 1 ordenó la tabla por categorías, pon las filas de Conversores tras las de Conversores y las de Azar tras las de Identificadores, respetando el orden de `categories.ts` (Calculadoras va entre Conversores y Azar).

- [ ] **Step 5: Verificación completa**

```bash
pnpm install --frozen-lockfile
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css && pnpm test:e2e
ls dist/es/*.html | wc -l
grep -cE "^  [A-Za-z0-9]+,$" src/tools/registry.ts
```
Expected: todo en verde, y los dos números iguales (una página por herramienta y por idioma: 39 tras este lote).

Las páginas nuevas responden `200` sin redirección:
```bash
./node_modules/.bin/astro preview --port 4665 --ignore-lock > /dev/null 2>&1 &
PREVIEW=$!
sleep 4
for u in /es/conversor-unidades /en/unit-converter /es/conversor-divisas /en/currency-converter /es/conversor-px-rem /en/px-to-rem-converter /es/ruleta-aleatoria /en/spin-the-wheel /es/calculadora-dias-habiles /en/spanish-business-days-calculator; do
  printf '%s ' "$u"; curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:4665$u"
done
kill $PREVIEW
```
Expected: todas `200`.

Sin librerías nuevas en este lote, el JS inicial de la Home no debería cambiar: compara el tamaño gzip de los chunks que carga `/es` con el de `main` (§9 del spec de plataforma: < 30 KB).

A mano, en los 3 temas (primero claro, el de por defecto) y a 390 px y 1280 px de ancho, abre las 14 herramientas nuevas: sin scroll horizontal, resultados en la pantalla hundida, `c` copia el resultado principal y `1…9` cambian de pestaña en Unidades, Dados, Porcentajes y Regla de tres. En la sidebar aparece **Calculadoras** entre Conversores y Azar, con 5 herramientas; Conversores pasa a 8 y Azar a 4.

- [ ] **Step 6: Commits**

```bash
git add src/tools/registry.ts src/components/ToolIsland.astro
git commit -m "chore: compactar el registro de herramientas del lote 2"

git add e2e/tools.spec.ts
git commit -m "test: e2e de las 14 herramientas del lote 2"

git add README.md
git commit -m "docs: herramientas del lote 2 en el README"
```

---

## Después de este plan

La rama `feat/herramientas-lote-2` tiene las 39 herramientas. El siguiente paso es revisarla entera y fusionarla en `main` (superpowers:finishing-a-development-branch) y desplegar; eso lo decide el autor. El lote 3 (generadores, texto y datos, y referencia) tiene su propio plan.

## Revisión contra la §7 del spec

Cada ficha de la §7, punto por punto, con la task que lo cumple y lo que lo comprueba.

| id | Punto de la §7 | Dónde | Comprobación |
|---|---|---|---|
| todas | Números con coma o punto (`parseDecimal`), resultados con `formatNumber`/`formatMoney`, error «Escribe un número, por ejemplo 1234,5» | Task 0 y Tasks 1, 2, 5, 10–13 | Tests de `numbers`; Review Focus 1 |
| `calc` | Categoría nueva entre `conv` y `rand`, icono `calculator`, textos de la §4.1 | Task 0 | `registry.test.ts` (categoría existente); e2e `the home page lists the new Calculators category` |
| todas | 16 iconos de la §4.4 y `ui.swap` de la §4.5 | Task 0 | `pnpm check` (`Record<IconName, …>`) y `i18n.test.ts` |
| `units` | 7 pestañas, valor en todas las unidades con copiar, factores exactos, temperatura afín, `toPrecision(12)`, negativos, científica | Task 1 | Tests de `units`; e2e 1 mi → 1,609344 km |
| `currency` | URL v1 sin parámetros, opciones de `fetch`, validación, caché 6 h, tres estados, conversión y unitario, lista, nota fija, divisa desaparecida → EUR | Task 2 | Tests de `currency`; 3 e2e con `page.route`; Review Focus 5 |
| `px-rem` | Base, px, rem y em sincronizados; padre = base por defecto; punto decimal siempre; fragmento CSS; tabla; base ≤ 0 | Task 3 | Tests de `px-rem`; e2e 24 px → `1.5` y base 10 → `2.4` |
| `chmod` | Octal, simbólico y casillas nativas de 44 px; s/S y t/T; dos órdenes, ls y frase; atajos 644…777; aviso; errores con posición | Task 4 | Tests de `chmod`; e2e 755 → rwxr-xr-x y escritura del grupo → 775 |
| `file-size` | SI, IEC y bits; B/b; KB con nota; columnas, bytes, bits y forma legible; 931 GiB; negativos, fracciones y 2^53 | Task 5 | Tests de `file-size`; e2e 1 TB → 931,3 GiB |
| `wheel` | Lienzo propio con tokens y observadores; geometría; ganador antes de animar; muelle k = 3, c = 3,2 a 1/120 s; movimiento reducido; desactivado durante el giro; quitar ganadora; historial; sin semilla; `onDestroy` | Task 6 | Tests de `wheel`; Review Focus 3; e2e con `reducedMotion`; giro real en el Step 11 |
| `shuffle` | Fisher–Yates, ignorar vacías, quedarse con N, semilla en vivo, `cryptoRng` sin semilla, lista numerada y copia sin números | Task 7 | Tests de `shuffle`; e2e con semilla y recarga |
| `teams` | Número de equipos o personas por equipo, reparto por turnos equilibrado con explicación, prefijo editable, copia por líneas, errores | Task 8 | Tests de `teams`; e2e 10 de 3 → 3, 3, 2 y 2 |
| `dice` | NdM±K y dM, rangos, botones rápidos, dados, suma, modificador, total, mínimo y máximo; monedas; semilla con serie reproducible; historial | Task 9 | Tests de `dice`; e2e 3d6+2 con semilla y 0d6 |
| `iva` | Base o total, 21/10/4/Otro, `roundCents`, base + cuota = total, comparación, línea para copiar, 0 y negativos | Task 10 | Tests de `iva`; e2e 100 → 121,00 y 121 → 100,00 |
| `irpf` | Base o líquido, IRPF 15/7/19/Otro, IVA 21/10/4/0, búsqueda de 5 candidatas con empate a la menor, aviso, nota y aviso fijo | Task 11 | Tests de `irpf`; Review Focus 2; e2e 1000 → 1060,00 |
| `percent` | Tres pestañas, `Y ± X %`, errores con Y = 0 y A = 0, 4 decimales y frase | Task 12 | Tests de `percent`; e2e 21 % de 200 → 42 y variación desde 0 |
| `rule-of-three` | Directa e inversa, «Si A → B, entonces C → X», fórmula sustituida, errores de división, ejemplos de la spec | Task 13 | Tests de `rule-of-three`; e2e 25 y 3 |
| `workdays` | Intervalo cerrado o semiabierto, intercambio, días UTC, naturales/laborables/hábiles/fin de semana, festivos con «no resta», 9 fijos + Viernes Santo, 20/21/254, nota fija, 1900–2100 y 100 años, FAQ | Task 14 | Tests de `workdays`; Review Focus 4; e2e enero de 2026 y Epifanía |

También se cumplen las reglas transversales: `rememberInput: true` en las 14 (§2), un `persistedInput` por campo con ids `<id>` y `<id>-<campo>` y un solo interruptor «Recordar», `Segmented main` solo en las 4 herramientas con `meta.tabs`, un `CopyButton main` como mucho por vista, ningún hex, ningún `{@html}` y ninguna librería (§5: todo escrito a mano y testeado).

Desviaciones y decisiones que conviene conocer:

- **Sin helper de caché en `src/lib/`** para divisas (ver «Decisión sobre helpers compartidos»). La spec no lo pide y solo lo usaría una herramienta.
- **`px-rem` parsea sus campos con las reglas de `en` tras cambiar la coma por punto** (`parseCssNumber`). Con las de `es`, `0.875` sería 875; la spec pide aceptar coma y mostrar siempre punto, y esto cumple las dos cosas.
- **El puntero de la ruleta usa `--text`**, no `--accent`: el sector ganador se ilumina en `--accent` y el puntero desaparecería encima. La spec pedía `--accent` para los dos.
- **La ruleta y los cambios de sector.** El muelle sobrepasa el objetivo en ≈ 0,035 % de la distancia (≈ 0,018 rad con 8 vueltas). Con 100 opciones el margen hasta el borde del sector puede ser de solo 0,15 · s ≈ 0,009 rad, así que el puntero puede asomarse un instante al sector vecino antes de volver. El resultado no cambia (se fija en `θ*`), pero la frase «nunca cambia de sector» de la §7.6 solo es cierta con pocas opciones.
- **Semilla de `teams` y `dice` no recordada**: la spec solo pide guardar participantes, modo y N (equipos) y notación y monedas (dados). La de `shuffle` sí se guarda, como dice su ficha.
- **Workdays rellena las fechas al montar** (hoy → 31 de diciembre) si no hay nada guardado, en el navegador y nunca en el HTML generado.
- **Tests con semilla por propiedades**, no por secuencias fijas, para no depender del `seededRng` real del lote 1.
