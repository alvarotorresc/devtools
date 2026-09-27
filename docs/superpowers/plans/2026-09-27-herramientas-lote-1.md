# DevTools herramientas nuevas, lote 1 (Identificadores y datos de prueba) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar las 11 herramientas del lote 1 del subproyecto 2: los 10 validadores y generadores de la categoría `ids` (DNI/NIE, CIF, IBAN, matrículas, NSS, tarjetas de prueba, teléfonos, SWIFT/BIC, EAN/ISBN y código postal) y el generador de datos de prueba `mock` (categoría `gen`). Cada una lleva su URL ES/EN, lógica pura testeada, textos ES/EN, contenido SEO y una interacción e2e real.

**Architecture:** Cada herramienta es una carpeta autocontenida `src/tools/<id>/` (`logic.ts` puro, `logic.test.ts`, `meta.ts`, `strings.ts`, `content.es.md`, `content.en.md` y su isla `<Nombre>.svelte`) construida solo con el kit de `src/ui/`. La Task 0 añade lo compartido: `src/lib/random.ts` (FNV-1a + mulberry32, `randInt` sin sesgo), `src/lib/provinces.ts` (52 provincias), `src/lib/csv.ts` (`toCsv`), `src/lib/ids.ts` (normalización, letras del DNI y cantidades), 11 iconos, 4 claves de interfaz y las líneas **pre-sembradas y comentadas** de las 11 herramientas en `src/tools/registry.ts` y `src/components/ToolIsland.astro`. Las Tasks 1–10 van en paralelo, cada una en su worktree; solo tocan su carpeta y descomentan sus 4 líneas. La Task 11 (`mock`) se hace tras fusionar las 10, porque importa sus generadores. La Task 12 compacta el registro, añade los e2e y hace la verificación completa.

**Tech Stack:** Astro 7.3, @astrojs/svelte 9, Svelte 5.57 (runes), TypeScript 6, @lucide/svelte 1.48, Vitest 5, Playwright 1.63, ESLint 9, Prettier 3. Sin dependencias nuevas: el azar sale de `crypto.getRandomValues` y todo lo demás (dígitos de control, tablas, CSV, SQL) se escribe a mano.

**Spec:** `docs/superpowers/specs/2026-09-26-devtools-herramientas-nuevas-design.md` (§1–§5 convenciones y añadidos compartidos, **§6 fichas del lote 1, vinculante**, §9 tests, §10 riesgos, §11 fuera de alcance, §12 decisiones). Plan anterior, cuyo formato sigue este: `docs/superpowers/plans/2026-09-26-plataforma-b.md`.

**Orden de ejecución:**

1. **Task 0**, sola, sobre `feat/herramientas-nuevas` (la rama que ya tiene el spec, creada desde `main`).
2. **Tasks 1–10 en paralelo**, cada una en su worktree y rama `lote-1/<id>` creada desde el commit de la Task 0.
3. Fusionar las 10 ramas en `feat/herramientas-nuevas` («Cómo fusionar», más abajo).
4. **Task 11** (`mock`), sola, sobre la rama fusionada.
5. **Task 12**, sola: cierre.

**Cómo se verificó este plan antes de escribirlo:** todo el código se escribió en un clon desechable de `main` y pasó, en este orden, `pnpm format`, `pnpm lint`, `pnpm check` (0 errores, 0 avisos), `pnpm test` (40 archivos, 487 tests), `pnpm build` (54 páginas), `pnpm check:css` y `pnpm test:e2e` completo (69 tests, con los 11 nuevos de la Task 12). Los bloques de código de este documento se copiaron de esos archivos ya formateados por Prettier. Cada vector de prueba del spec se comprobó antes con una implementación independiente en Node (DNI, CIF, los 7 IBAN, el CCC con DC 45, NSS 40/74/17, las 7 tarjetas Luhn y los EAN/ISBN), la tabla de IBAN se comparó con la del spec (102 países, 0 diferencias) y la lista ISO del BIC tiene 250 códigos. Los 11 scripts de comprobación en navegador de las tasks se ejecutaron contra `astro preview` y dieron `OK`. La fusión de las 11 ramas sobre las líneas pre-sembradas se simuló con `git merge-file` (11 fusiones, 0 conflictos, y el resultado coincide con el archivo final). Si algo falla al ejecutar, lo más probable es que `main` haya cambiado desde el 2026-09-27: adapta el código al kit real, no al revés, y dilo en el commit.

## Global Constraints

- Node `>=22.12.0`. `package.json` lleva `"packageManager": "pnpm@10.30.2"`. CI con Node 22.
- TypeScript **`^6`**: nunca `pnpm add typescript` sin versión. Este lote no añade dependencias.
- Astro 7 usa un compilador en Rust: **toda etiqueta no vacía se cierra** y no se anida HTML inválido.
- Astro 7 usa `compressHTML: 'jsx'`: los separadores en línea se escriben con `{' / '}` o con `gap` de CSS.
- `astro preview` en v7 es un demonio con archivo de bloqueo: usar siempre `--ignore-lock`. **El e2e usa el puerto 4642** (`playwright.config.ts`); los scripts de comprobación de las tasks usan puertos propios (4701–4711) para no chocar entre worktrees.
- Antes de cada `pnpm lint`, ejecuta `pnpm format`.
- `logic.ts` es puro: sin `document`, `window`, `localStorage`, `fetch` ni `crypto` global dentro de las funciones que se testean. El azar entra como parámetro `rng: Rng` y la hora como `now: Date`. Se testea en el entorno `node` de Vitest.
- **Azar:** todo número aleatorio sale de `crypto.getRandomValues` a través de `src/lib/random.ts`. Nunca `Math.random`.
- Ningún componente usa colores hex: todo sale de `src/styles/tokens.css`. **El tema por defecto es el claro** (`:root` y `:root[data-theme='light']` comparten tokens); las comprobaciones visuales empiezan por él.
- **Reglas del kit** (comprobadas en `src/ui/` y `scripts/check-css.mjs`):
  - los selectores que dependen del tema usan `:global([data-theme='…'])`;
  - el CSS de un subcomponente que solo se monta en el cliente vive en el padre, bajo `:global` (`pnpm check:css` falla si no). Por eso **cada herramienta es un solo `.svelte`**, sin subcomponentes con `<style>`;
  - objetivos táctiles de 44 px con `@media (pointer: coarse)`; el foco siempre visible; con `prefers-reduced-motion: reduce` no hay desplazamientos;
  - los errores sobre la superficie del panel usan `--bad-text` (y los aciertos `--ok-text`): `Field` con `error` ya lo hace. Dentro del `Display` (fondo oscuro en los tres temas) el texto de error va en `.display-note`, como en JWT;
  - `CopyButton` acepta `value`, `locale`, `main`, `compact`, `label`, **`ariaLabel`** y **`disabled`**; con `value` vacío se desactiva solo;
  - `Led` solo tiene `ok`, `bad` e `idle`: un aviso que no es error (provincia desconocida en NSS, longitud rara en tarjetas) es un LED `ok` más una `.display-note`.
- Claves de almacenamiento con prefijo `devtools:`; todo acceso pasa por `src/lib/storage.ts` (vía `persistedInput`).
- Sentence case en la interfaz. **Los errores dicen qué pasa y cómo arreglarlo.** Estados vacíos con una instrucción concreta.
- En componentes, **ninguna variable se llama `state`**. Los estados de tipo unión o nullable se declaran como `$state<T>(…)`.
- **Nunca `{@html}`** en este lote.
- **Commits** con el formato del repo (`feat(<id>): …`, `chore: …`, `test: …`, `docs: …`), **sin trailers ni atribución de IA**: nada de `Co-Authored-By`, `Claude-Session` ni «Generated with». Sustituye a la regla del Plan B que pedía esas líneas.
- Commits con rutas explícitas. Nunca `git add src` ni `git add .`: `pnpm format` reescribe todo `src` y podría colar cambios ajenos. Antes de confirmar, `git status --porcelain` solo puede listar las rutas de la task.

Añadidas para el lote 1:

- **Las Tasks 1–10 se ejecutan en paralelo, en worktrees separados** (`git worktree add ../devtools-<id> -b lote-1/<id>`). Cada una toca solo `src/tools/<id>/` y descomenta **4 líneas**: el import y la entrada de `tools` en `src/tools/registry.ts`, y el import y el montaje en `src/components/ToolIsland.astro`. No borres las líneas en blanco que separan las líneas pre-sembradas: son las que evitan los conflictos al fusionar.
- Nada fuera de eso: ni `src/lib/`, ni `src/ui/`, ni `src/i18n/`, ni `categories.ts`, `types.ts`, `icon-names.ts`, `icons.ts` o `package.json`. Si una herramienta necesita algo compartido que no está en la Task 0, **para y avisa**.
- **Ninguna task de herramienta importa de otra carpeta de herramienta** (las 10 ramas no se ven entre sí). La única excepción es `mock` (Task 11), que se hace después de fusionar.
- **Contrato de generadores** (§4.2 del spec): cada task de `ids` exporta desde su `logic.ts` exactamente los nombres y firmas de la tabla «Contrato para la Task 11». Un nombre distinto rompe la Task 11 en `pnpm check`; se corrige en la herramienta, no con un adaptador en `mock`.
- Todo generador pasa la prueba de ida y vuelta: 1 000 valores con `seededRng('test')`, todos aceptados por su validador (test obligatorio en cada `logic.test.ts`).
- Cada worktree empieza con `pnpm install --frozen-lockfile`.
- Las tasks de herramienta verifican con `pnpm format`, `pnpm lint`, `pnpm check`, `pnpm test`, `pnpm build` y `pnpm check:css`, más **un script desechable de Playwright** (`check-<id>.mjs` en la raíz del worktree, puerto propio). **No** ejecutan `pnpm test:e2e`: usa siempre el puerto 4642 y chocaría entre worktrees, y los casos del lote los añade la Task 12. El script y sus capturas se borran antes del `git add`; `pnpm lint` se ejecuta antes de crearlo.
- Antes de escribir el `.svelte`, abre los componentes reales de `src/ui/` que uses. Si una prop difiere de este plan, adapta el componente a la real y dilo en el commit.
- **`rememberInput` (§2 y §12 del spec):** ✗ en `dni`, `iban`, `nss`, `card` y `phone`: el input vive en un `$state` normal, sin `persistedInput` ni el interruptor «Recordar lo que escribo». ✓ en `cif` (con `shouldSave` que rechaza K, L y M), `plate`, `bic`, `ean-isbn`, `postal-code` y `mock` (guarda la configuración como JSON).
- **Patrón común de las herramientas de `ids`** (§6):
  - la entrada es un `TextArea` con un valor por línea (hasta 1 000, con `splitLines`); con una línea se ve el detalle (`Led` + `display-value` + `display-kv`), con varias, una fila por valor con su LED y el recuento «48 válidos · 2 no válidos»;
  - la pestaña Generar tiene `ui.quantity` (1–500, 10 por defecto), `ui.seed` con `ui.seedHelp`, el botón primario «Generar», un `Display` de filas con copiar por fila, un `CopyButton main` que copia todo y la nota `ui.testOnly`;
  - sin semilla se usa una semilla de sesión (`randomSeed()` en `onMount`) que solo cambia al pulsar «Generar», como en Lorem: cambiar las opciones no cambia los datos, y el SSR no pinta valores al azar que luego no cuadren al hidratar;
  - las herramientas con `meta.tabs` tienen **exactamente un** `Segmented main`; los secundarios (tipo, marca, formato) no llevan `main`. Cada vista tiene **como mucho un** `CopyButton main`.

## Review Focus

1. **Las dos ramas del NSS:** con `b < 10 000 000` el control es `(b + a × 10^7) mod 97`, no el `a × 10^8 + b` del brief; el borde entre ramas está fijado. → Tests `uses b + a × 10^7 when b < 10 000 000 (08 01234567 74, not 17)` y `switches branch exactly between 9 999 999 and 10 000 000` en la Task 5.
2. **Azar sin sesgo y reproducible:** `randInt` rechaza los valores del último bloque incompleto y reparte 60 000 tiradas de 0–5 entre 9 000 y 11 000 cada una; la secuencia de `seededRng('demo')` está fijada, porque cambiarla cambiaría los datos de toda semilla guardada. → Tests `is unbiased: 60 000 rolls of 0–5 land 9 000–11 000 times each`, `rejects the values above the last full block (no modulo bias)` y `is pinned: FNV-1a + mulberry32 must never change, or saved seeds would change output` en la Task 0.
3. **IBAN cifra a cifra y rango de control:** mod 97 sobre 34 caracteres coincide con `BigInt`, los controles `00`, `01` y `99` se rechazan aunque el mod 97 cuadre, y un IBAN coherente con el CCC mal se detecta con el DC correcto. → Tests `works digit by digit on 34 characters without overflowing`, `check digits 00, 01 and 99 are refused even if mod 97 fits` y `a coherent IBAN whose Spanish account digits are wrong` en la Task 3.
4. **CIF recordado sin datos personales:** el `shouldSave` rechaza la entrada entera en cuanto una línea es un NIF K, L o M (y borra lo guardado). → Test `is never remembered: shouldSave refuses any line with a K, L or M NIF` en la Task 2, más el script de navegador de esa task.
5. **Columnas independientes en `mock`:** quitar, reordenar o añadir columnas, o cambiar el rango de un campo propio, no cambia los valores de las demás (cada fila tiene su flujo y cada campo propio el suyo). → Tests `removing or reordering columns never changes the other values` y `adding a second custom field or changing its range leaves the first one alone` en la Task 11.

---

## File Structure

```
src/lib/random.ts      random.test.ts     → Rng, cryptoRng, seededRng, rngFromSeed, randomSeed, randInt, pick, shuffle, digits, randomBytesFrom  [Task 0]
src/lib/provinces.ts   provinces.test.ts  → PROVINCES (52), provinceByCode, provinceByPlate                                                   [Task 0]
src/lib/csv.ts         csv.test.ts        → toCsv (RFC 4180)                                                                                  [Task 0]
src/lib/ids.ts         ids.test.ts        → MAX_LINES, MAX_QUANTITY, DEFAULT_QUANTITY, DNI_LETTERS, dniLetter, compactId, splitLines, clampQuantity, repeat [Task 0]
src/tools/icon-names.ts  icons.ts         → +11 iconos                                                                                        [Task 0]
src/i18n/es.ts  en.ts                     → +4 claves (ui.seed, ui.seedHelp, ui.quantity, ui.testOnly)                                        [Task 0]
src/tools/registry.ts                     → líneas pre-sembradas (Task 0), compactado (Task 12)
src/components/ToolIsland.astro           → líneas pre-sembradas (Task 0), compactado (Task 12)
src/tools/dni/          {logic,logic.test,meta,strings}.ts  Dni.svelte         content.{es,en}.md   [Task 1]
src/tools/cif/          {…}                                 Cif.svelte         …                    [Task 2]
src/tools/iban/         {…}                                 Iban.svelte        …                    [Task 3]
src/tools/plate/        {…}                                 Plate.svelte       …                    [Task 4]
src/tools/nss/          {…}                                 Nss.svelte         …                    [Task 5]
src/tools/card/         {…}                                 Card.svelte        …                    [Task 6]
src/tools/phone/        {…}                                 Phone.svelte       …                    [Task 7]
src/tools/bic/          {…}                                 Bic.svelte         …                    [Task 8]
src/tools/ean-isbn/     {…}                                 EanIsbn.svelte     …                    [Task 9]
src/tools/postal-code/  {…}                                 PostalCode.svelte  …                    [Task 10]
src/tools/mock/         {…} + data.ts                       Mock.svelte        …                    [Task 11]
e2e/tools.spec.ts                         → 11 páginas y 11 interacciones                             [Task 12]
README.md                                 → 11 filas en la lista de herramientas                      [Task 12]
```

| Task | id | Cat. | Slug ES | Slug EN | Icono | Pestañas | Rec. |
|---|---|---|---|---|---|---|---|
| 1 | `dni` | ids | `validador-dni-nie` | `spanish-dni-nie-validator` | `id-card-lanyard` | Validar · Generar · Calcular letra | ✗ |
| 2 | `cif` | ids | `validador-cif` | `spanish-cif-validator` | `building` | Validar · Generar | ✓ |
| 3 | `iban` | ids | `validador-iban` | `iban-validator` | `landmark` | Validar · Generar | ✗ |
| 4 | `plate` | ids | `validador-matriculas` | `spanish-license-plate-validator` | `car` | Validar · Generar | ✓ |
| 5 | `nss` | ids | `validador-numero-seguridad-social` | `spanish-social-security-number-validator` | `heart-pulse` | Validar · Generar | ✗ |
| 6 | `card` | ids | `tarjetas-de-credito-de-prueba` | `test-credit-card-numbers` | `credit-card` | Validar · Generar | ✗ |
| 7 | `phone` | ids | `validador-telefonos-espana` | `spanish-phone-number-validator` | `phone` | — | ✗ |
| 8 | `bic` | ids | `validador-swift-bic` | `swift-bic-validator` | `globe` | — | ✓ |
| 9 | `ean-isbn` | ids | `validador-ean-isbn` | `ean-isbn-validator` | `barcode` | — | ✓ |
| 10 | `postal-code` | ids | `codigo-postal-provincia` | `spanish-postal-code-province` | `map-pin` | — | ✓ |
| 11 | `mock` | gen | `generador-datos-de-prueba` | `mock-data-generator` | `database` | — | ✓ |

### Contrato para la Task 11

Cada task exporta estos nombres desde su `logic.ts`, con estas firmas exactas (§4.2 del spec). `mock/logic.ts` importa todos menos `formatIban` y `generateNss`, que están en el contrato del spec para otros usos.

| Task | Archivo | Export |
|---|---|---|
| 1 | `src/tools/dni/logic.ts` | `generateDni(rng: Rng): string` → `12345678Z` · `generateNie(rng: Rng): string` → `X1234567L` |
| 2 | `src/tools/cif/logic.ts` | `generateCif(rng: Rng, type?: CifType): string` → `B12345674` |
| 3 | `src/tools/iban/logic.ts` | `generateSpanishIban(rng: Rng): string` (sin espacios) · `formatIban(iban: string): string` (grupos de 4) |
| 4 | `src/tools/plate/logic.ts` | `generatePlate(rng: Rng): string` → `1234 BCD` |
| 5 | `src/tools/nss/logic.ts` | `generateNss(rng: Rng, province?: string): string` → 12 cifras |
| 6 | `src/tools/card/logic.ts` | `generateTestCard(rng: Rng, brand: 'visa' \| 'mastercard' \| 'amex'): string` (sin espacios; el tipo se llama `TestBrand`) |
| 7 | `src/tools/phone/logic.ts` | `generatePhone(rng: Rng, kind: 'mobile' \| 'landline'): string` → 9 cifras |
| 10 | `src/tools/postal-code/logic.ts` | `generatePostalCode(rng: Rng, provinceCode: string): string` → 5 cifras |

`bic` y `ean-isbn` no tienen generador. `mock` también usa `uuidV4` de `src/tools/uuid/logic.ts`, que ya existe.

## Cómo fusionar las Tasks 1–10

Cada task trabaja en `git worktree add ../devtools-<id> -b lote-1/<id>` desde el commit de la Task 0. Al terminar las 10:

```bash
git switch feat/herramientas-nuevas
for id in dni cif iban plate nss card phone bic ean-isbn postal-code; do
  git merge --no-ff --no-edit "lote-1/$id" || break
done
pnpm install --frozen-lockfile && pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
for id in dni cif iban plate nss card phone bic ean-isbn postal-code; do git worktree remove "../devtools-$id"; done
```

No debería haber conflictos: cada rama cambia líneas distintas de `registry.ts` y `ToolIsland.astro`, separadas por una línea en blanco (simulado con `git merge-file`: 0 conflictos; además, cada variante con una sola herramienta descomentada sale intacta de Prettier). Si aun así aparece uno en esos dos archivos, la resolución es conservar las dos líneas descomentadas. Cualquier conflicto fuera de ellos significa que una task tocó algo que no debía: revísala antes de seguir.

---

### Task 0: Prerrequisitos compartidos (sola, antes de las herramientas)

**Files:**
- Create: `src/lib/random.ts`, `src/lib/random.test.ts`, `src/lib/provinces.ts`, `src/lib/provinces.test.ts`, `src/lib/csv.ts`, `src/lib/csv.test.ts`, `src/lib/ids.ts`, `src/lib/ids.test.ts`
- Modify: `src/tools/icon-names.ts`, `src/tools/icons.ts`, `src/i18n/es.ts`, `src/i18n/en.ts`, `src/tools/registry.ts`, `src/components/ToolIsland.astro`

**Interfaces:**
- Consumes: `main` tal como está (14 herramientas, kit de UI, `persistedInput` con `shouldSave`, `registry.ts` y `ToolIsland.astro` compactados por la Task 13 del Plan B).
- Produces:
  - `src/lib/random.ts` (§4.2): `type Rng = () => number`, `cryptoRng(): Rng`, `seededRng(seed: string): Rng`, `rngFromSeed(seed: string | undefined): Rng`, `randomSeed(): string`, `randInt(rng, min, max): number`, `pick<T>(rng, items: readonly T[]): T`, `shuffle<T>(rng, items: readonly T[]): T[]`, `digits(rng, n): string`, `randomBytesFrom(rng): (n: number) => Uint8Array`. `randomSeed` no está en la firma del spec: es la semilla de sesión de las pestañas Generar y de `mock`, y así ningún componente llama a `crypto` directamente.
  - `src/lib/provinces.ts` (§4.3): `interface Province { code; name; capital; community; plates }`, `PROVINCES` (52), `provinceByCode(code)`, `provinceByPlate(prefix)` (sin distinguir mayúsculas).
  - `src/lib/csv.ts` (§4.3, parte del lote 1): `type CsvSep`, `type CsvCell`, `toCsv(rows: CsvCell[][], sep: CsvSep = ','): string`.
  - `src/lib/ids.ts` (helper compartido de las 10 herramientas de `ids`; no está en §4 del spec): `MAX_LINES = 1000`, `MAX_QUANTITY = 500`, `DEFAULT_QUANTITY = 10`, `DNI_LETTERS`, `dniLetter(n)`, `compactId(raw)`, `splitLines(text, max?)`, `clampQuantity(n)`, `repeat(n, make)`. `dniLetter` vive aquí porque lo usan `dni` y `cif` (K, L y M), que se construyen en paralelo y no pueden importarse entre sí.
  - `IconName` gana: `barcode`, `building`, `car`, `credit-card`, `database`, `globe`, `heart-pulse`, `id-card-lanyard`, `landmark`, `map-pin`, `phone` (§4.4; comprobados en `node_modules/@lucide/svelte/dist/icons/`).
  - `UiKey` gana: `ui.seed`, `ui.seedHelp`, `ui.quantity`, `ui.testOnly` (§4.5).
  - `registry.ts` y `ToolIsland.astro` con las líneas de las 11 herramientas comentadas y separadas por una línea en blanco.

- [ ] **Step 1: Comprobar el punto de partida**

```bash
git switch feat/herramientas-nuevas
git status --short
grep -c "import { meta as" src/tools/registry.ts
test -e src/lib/random.ts && echo "YA EXISTE random.ts"
grep -n "shouldSave" src/ui/persisted.svelte.ts | head -1
pnpm install --frozen-lockfile && pnpm test && pnpm check
```
Expected: `git status` vacío, `14` imports de metas, ninguna línea `YA EXISTE`, `shouldSave` presente y tests y `check` en verde. Si algo no cuadra, **para**: este plan parte de `main` con el subproyecto 1 terminado.

- [ ] **Step 2: Tests de los helpers (fallan)**

`src/lib/random.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  cryptoRng,
  digits,
  pick,
  randInt,
  randomBytesFrom,
  randomSeed,
  rngFromSeed,
  seededRng,
  shuffle,
  type Rng,
} from './random';

const take = (rng: Rng, n: number) => Array.from({ length: n }, () => rng());

describe('seededRng', () => {
  it('gives the same sequence for the same seed', () => {
    expect(take(seededRng('demo'), 20)).toEqual(take(seededRng('demo'), 20));
  });

  it('gives different sequences for different seeds', () => {
    expect(take(seededRng('demo'), 5)).not.toEqual(take(seededRng('demo2'), 5));
    expect(take(seededRng('42'), 5)).not.toEqual(take(seededRng('43'), 5));
  });

  it('is pinned: FNV-1a + mulberry32 must never change, or saved seeds would change output', () => {
    expect(take(seededRng('demo'), 3)).toEqual(DEMO_FIRST_THREE);
    expect(take(seededRng('ñ'), 1)).toEqual(ENYE_FIRST);
  });

  it('returns unsigned 32-bit integers', () => {
    for (const x of take(seededRng('range'), 1000)) {
      expect(Number.isInteger(x)).toBe(true);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(2 ** 32);
    }
  });
});

describe('rngFromSeed', () => {
  it('uses the seed after trimming it', () => {
    expect(take(rngFromSeed('  demo '), 3)).toEqual(take(seededRng('demo'), 3));
  });

  it('falls back to crypto randomness without a seed', () => {
    const a = take(rngFromSeed(''), 4);
    const b = take(rngFromSeed(undefined), 4);
    const c = take(rngFromSeed('   '), 4);
    expect(a).not.toEqual(b);
    expect(b).not.toEqual(c);
  });
});

describe('cryptoRng and randomSeed', () => {
  it('keeps producing values past its 256-value buffer', () => {
    const values = take(cryptoRng(), 600);
    expect(new Set(values).size).toBeGreaterThan(590);
  });

  it('makes a non-empty seed that changes every time', () => {
    const a = randomSeed();
    expect(a).toMatch(/^[0-9a-z]+$/);
    expect(randomSeed()).not.toBe(a);
  });
});

describe('randInt', () => {
  it('never leaves the range and includes both ends', () => {
    const rng = seededRng('bounds');
    const seen = new Set<number>();
    for (let i = 0; i < 5000; i++) {
      const x = randInt(rng, -3, 3);
      expect(x).toBeGreaterThanOrEqual(-3);
      expect(x).toBeLessThanOrEqual(3);
      seen.add(x);
    }
    expect([...seen].sort((a, b) => a - b)).toEqual([-3, -2, -1, 0, 1, 2, 3]);
  });

  it('is unbiased: 60 000 rolls of 0–5 land 9 000–11 000 times each', () => {
    const rng = seededRng('fair');
    const counts = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 60_000; i++) counts[randInt(rng, 0, 5)]++;
    for (const c of counts) {
      expect(c).toBeGreaterThanOrEqual(9000);
      expect(c).toBeLessThanOrEqual(11_000);
    }
  });

  it('rejects the values above the last full block (no modulo bias)', () => {
    // range 3: limit = 2^32 − (2^32 mod 3) = 4294967295, so 4294967295 must be redrawn.
    const values = [4294967295, 7];
    const rng: Rng = () => values.shift()!;
    expect(randInt(rng, 0, 2)).toBe(1);
    expect(values).toEqual([]);
  });

  it('accepts a range of exactly 2^32 values and rejects bigger or inverted ones', () => {
    expect(randInt(() => 123, 0, 2 ** 32 - 1)).toBe(123);
    expect(() => randInt(() => 0, 0, 2 ** 32)).toThrow(RangeError);
    expect(() => randInt(() => 0, 5, 4)).toThrow(RangeError);
    expect(() => randInt(() => 0, 0.5, 4)).toThrow(RangeError);
  });
});

describe('pick, shuffle and digits', () => {
  it('picks an element of the list', () => {
    const rng = seededRng('pick');
    for (let i = 0; i < 100; i++) expect(['a', 'b', 'c']).toContain(pick(rng, ['a', 'b', 'c']));
    expect(() => pick(rng, [])).toThrow(RangeError);
  });

  it('shuffles a copy and keeps every element', () => {
    const input = ['a', 'b', 'c', 'd', 'e', 'f'];
    const frozen = Object.freeze(input.slice());
    const out = shuffle(seededRng('shuffle'), frozen);
    expect(out).not.toBe(frozen);
    expect([...out].sort()).toEqual(input);
    expect(frozen).toEqual(input);
  });

  it('shuffles the same way with the same seed', () => {
    const list = Array.from({ length: 20 }, (_, i) => i);
    expect(shuffle(seededRng('s'), list)).toEqual(shuffle(seededRng('s'), list));
  });

  it('makes digit strings of the requested length, leading zeros included', () => {
    const rng = seededRng('digits');
    const all = Array.from({ length: 200 }, () => digits(rng, 8));
    for (const d of all) expect(d).toMatch(/^\d{8}$/);
    expect(all.some((d) => d.startsWith('0'))).toBe(true);
    expect(digits(rng, 0)).toBe('');
  });
});

describe('randomBytesFrom', () => {
  it('returns exactly n bytes, deterministic with a seed', () => {
    const a = randomBytesFrom(seededRng('bytes'))(10);
    const b = randomBytesFrom(seededRng('bytes'))(10);
    expect(a).toHaveLength(10);
    expect(a).toEqual(b);
    expect(randomBytesFrom(seededRng('bytes'))(0)).toHaveLength(0);
  });

  it('uses the four bytes of each value, low byte first', () => {
    const bytes = randomBytesFrom(() => 0x04030201)(6);
    expect([...bytes]).toEqual([1, 2, 3, 4, 1, 2]);
  });
});

// Pinned outputs, computed once with the reference implementation of §4.2.
const DEMO_FIRST_THREE = [3603001048, 581339189, 238296426];
const ENYE_FIRST = [2805759514];
```

`src/lib/provinces.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { PROVINCES, provinceByCode, provinceByPlate } from './provinces';

describe('PROVINCES', () => {
  it('has the 52 provinces with unique, consecutive codes 01–52', () => {
    expect(PROVINCES).toHaveLength(52);
    PROVINCES.forEach((p, i) => expect(p.code).toBe(String(i + 1).padStart(2, '0')));
  });

  it('has unique licence plate prefixes of one or two letters', () => {
    const all = PROVINCES.flatMap((p) => p.plates);
    expect(new Set(all).size).toBe(all.length);
    for (const s of all) expect(s).toMatch(/^[A-Z]{1,2}$/);
  });

  it('fills every field', () => {
    for (const p of PROVINCES) {
      expect(p.name && p.capital && p.community).toBeTruthy();
      expect(p.plates.length).toBeGreaterThan(0);
    }
  });
});

describe('lookups', () => {
  it('finds a province by its two-digit code', () => {
    expect(provinceByCode('08')?.name).toBe('Barcelona');
    expect(provinceByCode('28')?.capital).toBe('Madrid');
    expect(provinceByCode('52')?.community).toBe('Ciudad Autónoma de Melilla');
    expect(provinceByCode('8')).toBeUndefined();
    expect(provinceByCode('53')).toBeUndefined();
  });

  it('finds a province by any of its plate prefixes, in any case', () => {
    expect(provinceByPlate('M')?.code).toBe('28');
    expect(provinceByPlate('GI')?.name).toBe('Girona');
    expect(provinceByPlate('ge')?.name).toBe('Girona');
    expect(provinceByPlate('IB')?.code).toBe('07');
    expect(provinceByPlate('PM')?.code).toBe('07');
    expect(provinceByPlate('XX')).toBeUndefined();
  });
});
```

`src/lib/csv.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { toCsv } from './csv';

describe('toCsv', () => {
  it('joins fields with the separator and lines with CRLF', () => {
    expect(
      toCsv([
        ['a', 'b'],
        [1, true],
      ]),
    ).toBe('a,b\r\n1,true');
  });

  it('quotes only the fields that need it and doubles quotes', () => {
    expect(toCsv([['x,y', 'say "hi"', 'plain']])).toBe('"x,y","say ""hi""",plain');
    expect(toCsv([['line\nbreak', 'cr\rhere']])).toBe('"line\nbreak","cr\rhere"');
    expect(toCsv([[' lead', 'trail ', 'in side']])).toBe('" lead","trail ",in side');
  });

  it('writes null as an empty field', () => {
    expect(toCsv([[null, 'a', null]])).toBe(',a,');
  });

  it('quotes by the chosen separator only', () => {
    expect(toCsv([['a;b', 'c,d']], ';')).toBe('"a;b";c,d');
    expect(toCsv([['a\tb', 'c;d']], '\t')).toBe('"a\tb"\tc;d');
  });

  it('returns an empty string for no rows', () => {
    expect(toCsv([])).toBe('');
  });
});
```

`src/lib/ids.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_QUANTITY,
  DNI_LETTERS,
  MAX_QUANTITY,
  clampQuantity,
  compactId,
  dniLetter,
  repeat,
  splitLines,
} from './ids';

describe('dniLetter', () => {
  it('uses the official table of 23 letters, without I, Ñ, O or U', () => {
    expect(DNI_LETTERS).toHaveLength(23);
    expect(DNI_LETTERS).not.toMatch(/[IÑOU]/);
    expect(dniLetter(12345678)).toBe('Z');
    expect(dniLetter(0)).toBe('T');
    expect(dniLetter(22)).toBe('E');
    expect(dniLetter(23)).toBe('T');
  });
});

describe('compactId', () => {
  it('upper-cases and drops spaces, dashes, dots and slashes', () => {
    expect(compactId(' 12.345.678-z ')).toBe('12345678Z');
    expect(compactId('28/12345678/40')).toBe('281234567840');
    expect(compactId('es91 2100\t0418')).toBe('ES9121000418');
  });
});

describe('splitLines', () => {
  it('keeps non-empty trimmed lines, whatever the line break', () => {
    expect(splitLines(' a \r\n\nb\rc\n  \n')).toEqual({ lines: ['a', 'b', 'c'], truncated: false });
    expect(splitLines('')).toEqual({ lines: [], truncated: false });
  });

  it('stops at the limit and says so', () => {
    const text = Array.from({ length: 1005 }, (_, i) => String(i)).join('\n');
    const r = splitLines(text);
    expect(r.lines).toHaveLength(1000);
    expect(r.truncated).toBe(true);
    expect(splitLines('a\nb\nc', 2)).toEqual({ lines: ['a', 'b'], truncated: true });
  });
});

describe('quantities', () => {
  it('clamps to 1–500 and falls back to the default', () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(9.7)).toBe(9);
    expect(clampQuantity(10_000)).toBe(MAX_QUANTITY);
    expect(clampQuantity(Number.NaN)).toBe(DEFAULT_QUANTITY);
  });

  it('repeats a maker the clamped number of times', () => {
    let i = 0;
    expect(repeat(3, () => i++)).toEqual([0, 1, 2]);
    expect(repeat(0, () => 'x')).toEqual(['x']);
  });
});
```

Los valores fijados en `random.test.ts` (`DEMO_FIRST_THREE` y `ENYE_FIRST`) se calcularon con una implementación independiente de la §4.2 en Node, fuera del repo.

Run: `pnpm test src/lib/random.test.ts src/lib/provinces.test.ts src/lib/csv.test.ts src/lib/ids.test.ts`
Expected: FAIL (no existen los módulos).

- [ ] **Step 3: `random.ts`, `provinces.ts`, `csv.ts` e `ids.ts`**

`src/lib/random.ts`:
```ts
/** Returns a uniform unsigned 32-bit integer, in [0, 2^32). */
export type Rng = () => number;

const TWO_32 = 2 ** 32;
const BUFFER = 256;

/** Browser or Node randomness through crypto.getRandomValues, 256 values per call. */
export function cryptoRng(): Rng {
  const buf = new Uint32Array(BUFFER);
  let i = BUFFER;
  return () => {
    if (i === BUFFER) {
      crypto.getRandomValues(buf);
      i = 0;
    }
    return buf[i++];
  };
}

function fnv1a(text: string): number {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(text)) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/** Deterministic: FNV-1a (32 bits) over the UTF-8 of the seed, then mulberry32. */
export function seededRng(seed: string): Rng {
  let a = fnv1a(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (t ^ (t >>> 14)) >>> 0;
  };
}

/** The seed is trimmed; an empty or missing seed means real randomness. */
export function rngFromSeed(seed: string | undefined): Rng {
  const s = seed?.trim() ?? '';
  return s ? seededRng(s) : cryptoRng();
}

/** A fresh random seed, for tools that keep one per session and re-roll it on "Generate". */
export function randomSeed(): string {
  return cryptoRng()().toString(36);
}

/** Uniform integer in [min, max], both included, without modulo bias (rejection sampling). */
export function randInt(rng: Rng, min: number, max: number): number {
  if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
    throw new RangeError(`Invalid range [${min}, ${max}]`);
  }
  const range = max - min + 1;
  if (range > TWO_32) throw new RangeError('The range cannot exceed 2^32 values');
  const limit = TWO_32 - (TWO_32 % range);
  let x = rng();
  while (x >= limit) x = rng();
  return min + (x % range);
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  if (items.length === 0) throw new RangeError('Cannot pick from an empty list');
  return items[randInt(rng, 0, items.length - 1)];
}

/** Fisher–Yates over a copy: the input is never mutated. */
export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** `n` random digits 0–9; leading zeros are allowed. */
export function digits(rng: Rng, n: number): string {
  let out = '';
  for (let i = 0; i < n; i++) out += String(randInt(rng, 0, 9));
  return out;
}

/** Adapter to the `RandomBytes` signature of `uuid/logic.ts`: 4 bytes per rng() call. */
export function randomBytesFrom(rng: Rng): (n: number) => Uint8Array {
  return (n) => {
    const out = new Uint8Array(n);
    for (let i = 0; i < n; i += 4) {
      const x = rng();
      for (let k = 0; k < 4 && i + k < n; k++) out[i + k] = (x >>> (8 * k)) & 0xff;
    }
    return out;
  };
}
```

`src/lib/provinces.ts`:
```ts
export interface Province {
  /** '01'…'52': the same code in postal codes, INE and Social Security. */
  code: string;
  /** Official name. */
  name: string;
  /** Capital city (mock data uses it as the city of the row). */
  capital: string;
  /** Autonomous community or city. */
  community: string;
  /** Provincial licence plate prefixes (1971–2000). */
  plates: string[];
}

// Written by hand: INE province codes, which postal codes and Social Security numbers reuse.
export const PROVINCES: readonly Province[] = [
  {
    code: '01',
    name: 'Araba/Álava',
    capital: 'Vitoria-Gasteiz',
    community: 'País Vasco',
    plates: ['VI'],
  },
  {
    code: '02',
    name: 'Albacete',
    capital: 'Albacete',
    community: 'Castilla-La Mancha',
    plates: ['AB'],
  },
  {
    code: '03',
    name: 'Alicante/Alacant',
    capital: 'Alicante',
    community: 'Comunitat Valenciana',
    plates: ['A'],
  },
  { code: '04', name: 'Almería', capital: 'Almería', community: 'Andalucía', plates: ['AL'] },
  { code: '05', name: 'Ávila', capital: 'Ávila', community: 'Castilla y León', plates: ['AV'] },
  { code: '06', name: 'Badajoz', capital: 'Badajoz', community: 'Extremadura', plates: ['BA'] },
  {
    code: '07',
    name: 'Illes Balears',
    capital: 'Palma',
    community: 'Illes Balears',
    plates: ['PM', 'IB'],
  },
  { code: '08', name: 'Barcelona', capital: 'Barcelona', community: 'Cataluña', plates: ['B'] },
  { code: '09', name: 'Burgos', capital: 'Burgos', community: 'Castilla y León', plates: ['BU'] },
  { code: '10', name: 'Cáceres', capital: 'Cáceres', community: 'Extremadura', plates: ['CC'] },
  { code: '11', name: 'Cádiz', capital: 'Cádiz', community: 'Andalucía', plates: ['CA'] },
  {
    code: '12',
    name: 'Castellón/Castelló',
    capital: 'Castellón de la Plana',
    community: 'Comunitat Valenciana',
    plates: ['CS'],
  },
  {
    code: '13',
    name: 'Ciudad Real',
    capital: 'Ciudad Real',
    community: 'Castilla-La Mancha',
    plates: ['CR'],
  },
  { code: '14', name: 'Córdoba', capital: 'Córdoba', community: 'Andalucía', plates: ['CO'] },
  { code: '15', name: 'A Coruña', capital: 'A Coruña', community: 'Galicia', plates: ['C'] },
  {
    code: '16',
    name: 'Cuenca',
    capital: 'Cuenca',
    community: 'Castilla-La Mancha',
    plates: ['CU'],
  },
  { code: '17', name: 'Girona', capital: 'Girona', community: 'Cataluña', plates: ['GE', 'GI'] },
  { code: '18', name: 'Granada', capital: 'Granada', community: 'Andalucía', plates: ['GR'] },
  {
    code: '19',
    name: 'Guadalajara',
    capital: 'Guadalajara',
    community: 'Castilla-La Mancha',
    plates: ['GU'],
  },
  {
    code: '20',
    name: 'Gipuzkoa',
    capital: 'Donostia-San Sebastián',
    community: 'País Vasco',
    plates: ['SS'],
  },
  { code: '21', name: 'Huelva', capital: 'Huelva', community: 'Andalucía', plates: ['H'] },
  { code: '22', name: 'Huesca', capital: 'Huesca', community: 'Aragón', plates: ['HU'] },
  { code: '23', name: 'Jaén', capital: 'Jaén', community: 'Andalucía', plates: ['J'] },
  { code: '24', name: 'León', capital: 'León', community: 'Castilla y León', plates: ['LE'] },
  { code: '25', name: 'Lleida', capital: 'Lleida', community: 'Cataluña', plates: ['L'] },
  { code: '26', name: 'La Rioja', capital: 'Logroño', community: 'La Rioja', plates: ['LO'] },
  { code: '27', name: 'Lugo', capital: 'Lugo', community: 'Galicia', plates: ['LU'] },
  {
    code: '28',
    name: 'Madrid',
    capital: 'Madrid',
    community: 'Comunidad de Madrid',
    plates: ['M'],
  },
  { code: '29', name: 'Málaga', capital: 'Málaga', community: 'Andalucía', plates: ['MA'] },
  { code: '30', name: 'Murcia', capital: 'Murcia', community: 'Región de Murcia', plates: ['MU'] },
  {
    code: '31',
    name: 'Navarra',
    capital: 'Pamplona',
    community: 'Comunidad Foral de Navarra',
    plates: ['NA'],
  },
  { code: '32', name: 'Ourense', capital: 'Ourense', community: 'Galicia', plates: ['OR', 'OU'] },
  {
    code: '33',
    name: 'Asturias',
    capital: 'Oviedo',
    community: 'Principado de Asturias',
    plates: ['O'],
  },
  {
    code: '34',
    name: 'Palencia',
    capital: 'Palencia',
    community: 'Castilla y León',
    plates: ['P'],
  },
  {
    code: '35',
    name: 'Las Palmas',
    capital: 'Las Palmas de Gran Canaria',
    community: 'Canarias',
    plates: ['GC'],
  },
  { code: '36', name: 'Pontevedra', capital: 'Pontevedra', community: 'Galicia', plates: ['PO'] },
  {
    code: '37',
    name: 'Salamanca',
    capital: 'Salamanca',
    community: 'Castilla y León',
    plates: ['SA'],
  },
  {
    code: '38',
    name: 'Santa Cruz de Tenerife',
    capital: 'Santa Cruz de Tenerife',
    community: 'Canarias',
    plates: ['TF'],
  },
  { code: '39', name: 'Cantabria', capital: 'Santander', community: 'Cantabria', plates: ['S'] },
  { code: '40', name: 'Segovia', capital: 'Segovia', community: 'Castilla y León', plates: ['SG'] },
  { code: '41', name: 'Sevilla', capital: 'Sevilla', community: 'Andalucía', plates: ['SE'] },
  { code: '42', name: 'Soria', capital: 'Soria', community: 'Castilla y León', plates: ['SO'] },
  { code: '43', name: 'Tarragona', capital: 'Tarragona', community: 'Cataluña', plates: ['T'] },
  { code: '44', name: 'Teruel', capital: 'Teruel', community: 'Aragón', plates: ['TE'] },
  {
    code: '45',
    name: 'Toledo',
    capital: 'Toledo',
    community: 'Castilla-La Mancha',
    plates: ['TO'],
  },
  {
    code: '46',
    name: 'Valencia/València',
    capital: 'Valencia',
    community: 'Comunitat Valenciana',
    plates: ['V'],
  },
  {
    code: '47',
    name: 'Valladolid',
    capital: 'Valladolid',
    community: 'Castilla y León',
    plates: ['VA'],
  },
  { code: '48', name: 'Bizkaia', capital: 'Bilbao', community: 'País Vasco', plates: ['BI'] },
  { code: '49', name: 'Zamora', capital: 'Zamora', community: 'Castilla y León', plates: ['ZA'] },
  { code: '50', name: 'Zaragoza', capital: 'Zaragoza', community: 'Aragón', plates: ['Z'] },
  {
    code: '51',
    name: 'Ceuta',
    capital: 'Ceuta',
    community: 'Ciudad Autónoma de Ceuta',
    plates: ['CE'],
  },
  {
    code: '52',
    name: 'Melilla',
    capital: 'Melilla',
    community: 'Ciudad Autónoma de Melilla',
    plates: ['ML'],
  },
];

export function provinceByCode(code: string): Province | undefined {
  return PROVINCES.find((p) => p.code === code);
}

/** Case-insensitive: 'gi' and 'GI' both find Girona. */
export function provinceByPlate(prefix: string): Province | undefined {
  const p = prefix.toUpperCase();
  return PROVINCES.find((x) => x.plates.includes(p));
}
```

`src/lib/csv.ts`:
```ts
export type CsvSep = ',' | ';' | '\t';
export type CsvCell = string | number | boolean | null;

function field(value: CsvCell, sep: CsvSep): string {
  if (value === null) return '';
  const s = String(value);
  const quote =
    s.includes(sep) || s.includes('"') || s.includes('\r') || s.includes('\n') || /^\s|\s$/.test(s);
  return quote ? `"${s.replace(/"/g, '""')}"` : s;
}

/** RFC 4180: CRLF line breaks, quotes only where needed, `"` doubled and `null` as an empty field. */
export function toCsv(rows: CsvCell[][], sep: CsvSep = ','): string {
  return rows.map((row) => row.map((v) => field(v, sep)).join(sep)).join('\r\n');
}
```

`src/lib/ids.ts`:
```ts
// Helpers shared by the Identifiers tools (lote 1). Pure: no DOM, no storage.

/** Validators accept up to this many values, one per line. */
export const MAX_LINES = 1000;
/** Generators make 1–500 values, 10 by default. */
export const MAX_QUANTITY = 500;
export const DEFAULT_QUANTITY = 10;

/** The control letters of the DNI, NIE and the K, L and M NIF: `DNI_LETTERS[n mod 23]`. */
export const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

export function dniLetter(n: number): string {
  return DNI_LETTERS[n % 23];
}

/** Upper case, without spaces, dashes, dots or slashes: `12.345.678-z` → `12345678Z`. */
export function compactId(raw: string): string {
  return raw.toUpperCase().replace(/[\s.\-/]/g, '');
}

/** Non-empty trimmed lines, at most `max`; `truncated` says whether some were dropped. */
export function splitLines(text: string, max = MAX_LINES): { lines: string[]; truncated: boolean } {
  const all = text
    .split(/\r\n|\r|\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return { lines: all.slice(0, max), truncated: all.length > max };
}

/** 1–500; anything that is not a number becomes the default. */
export function clampQuantity(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_QUANTITY;
  return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(n)));
}

/** Calls `make` `clampQuantity(n)` times. */
export function repeat<T>(n: number, make: () => T): T[] {
  return Array.from({ length: clampQuantity(n) }, make);
}
```

Run: `pnpm test src/lib`
Expected: PASS (los cuatro archivos nuevos y los que ya había).

- [ ] **Step 4: Iconos nuevos**

Sustituye `src/tools/icon-names.ts` por (solo se añaden 11 nombres en orden alfabético; los existentes no se mueven):
```ts
export const ICON_NAMES = [
  'arrow-left-right',
  'barcode',
  'binary',
  'book-open',
  'braces',
  'building',
  'car',
  'case-sensitive',
  'check',
  'chevron-down',
  'chevron-right',
  'clock',
  'code',
  'code-xml',
  'copy',
  'credit-card',
  'database',
  'dices',
  'diff',
  'file-code',
  'fingerprint',
  'globe',
  'hash',
  'heart-pulse',
  'house',
  'id-card',
  'id-card-lanyard',
  'key-round',
  'keyboard',
  'landmark',
  'link',
  'map-pin',
  'menu',
  'moon',
  'palette',
  'panel-left-close',
  'panel-left-open',
  'phone',
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
  Barcode,
  Binary,
  BookOpen,
  Braces,
  Building,
  Car,
  CaseSensitive,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  CodeXml,
  Copy,
  CreditCard,
  Database,
  Dices,
  Diff,
  FileCode,
  Fingerprint,
  Globe,
  Hash,
  HeartPulse,
  House,
  IdCard,
  IdCardLanyard,
  KeyRound,
  Keyboard,
  Landmark,
  Link,
  MapPin,
  Menu,
  Moon,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
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
  barcode: Barcode,
  binary: Binary,
  'book-open': BookOpen,
  braces: Braces,
  building: Building,
  car: Car,
  'case-sensitive': CaseSensitive,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  clock: Clock,
  code: Code,
  'code-xml': CodeXml,
  copy: Copy,
  'credit-card': CreditCard,
  database: Database,
  dices: Dices,
  diff: Diff,
  'file-code': FileCode,
  fingerprint: Fingerprint,
  globe: Globe,
  hash: Hash,
  'heart-pulse': HeartPulse,
  house: House,
  'id-card': IdCard,
  'id-card-lanyard': IdCardLanyard,
  'key-round': KeyRound,
  keyboard: Keyboard,
  landmark: Landmark,
  link: Link,
  'map-pin': MapPin,
  menu: Menu,
  moon: Moon,
  palette: Palette,
  'panel-left-close': PanelLeftClose,
  'panel-left-open': PanelLeftOpen,
  phone: Phone,
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

En `src/i18n/es.ts`, justo después de la línea `'ui.useOutput': 'Usar el resultado como entrada',`, añade:
```ts
  'ui.seed': 'Semilla (opcional)',
  'ui.seedHelp': 'Con la misma semilla obtienes siempre el mismo resultado.',
  'ui.quantity': 'Cantidad',
  'ui.testOnly': 'Datos ficticios, solo para pruebas.',
```

En `src/i18n/en.ts`, después de `'ui.useOutput': 'Use the result as input',`:
```ts
  'ui.seed': 'Seed (optional)',
  'ui.seedHelp': 'The same seed always gives the same result.',
  'ui.quantity': 'Quantity',
  'ui.testOnly': 'Fictitious data, for testing only.',
```

(`src/i18n/i18n.test.ts` comprueba que los dos diccionarios tienen las mismas claves.)

- [ ] **Step 6: Pre-sembrar `registry.ts`**

Sustituye `src/tools/registry.ts` por el contenido siguiente: el actual con las 11 herramientas del lote añadidas y comentadas. Los comentarios van **después** de las entradas existentes (`numberBase` sigue delante del bloque): si el array empezara por comentarios, Prettier juntaría las líneas y se perdería el separador.
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

// Lote 1: each tool task uncomments its import and its entry in `tools`.
// Keep the blank lines between them: they let the parallel branches merge without conflicts.

// import { meta as dni } from './dni/meta';

// import { meta as cif } from './cif/meta';

// import { meta as iban } from './iban/meta';

// import { meta as plate } from './plate/meta';

// import { meta as nss } from './nss/meta';

// import { meta as card } from './card/meta';

// import { meta as phone } from './phone/meta';

// import { meta as bic } from './bic/meta';

// import { meta as eanIsbn } from './ean-isbn/meta';

// import { meta as postalCode } from './postal-code/meta';

// import { meta as mock } from './mock/meta';

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

  // dni,

  // cif,

  // iban,

  // plate,

  // nss,

  // card,

  // phone,

  // bic,

  // eanIsbn,

  // postalCode,

  // mock,
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

Sustituye `src/components/ToolIsland.astro` por:
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

// Lote 1: each tool task uncomments its import below and its line in the template.
// Keep the blank lines between them: they let the parallel branches merge without conflicts.

// import Dni from '../tools/dni/Dni.svelte';

// import Cif from '../tools/cif/Cif.svelte';

// import Iban from '../tools/iban/Iban.svelte';

// import Plate from '../tools/plate/Plate.svelte';

// import Nss from '../tools/nss/Nss.svelte';

// import Card from '../tools/card/Card.svelte';

// import Phone from '../tools/phone/Phone.svelte';

// import Bic from '../tools/bic/Bic.svelte';

// import EanIsbn from '../tools/ean-isbn/EanIsbn.svelte';

// import PostalCode from '../tools/postal-code/PostalCode.svelte';

// import Mock from '../tools/mock/Mock.svelte';

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

{/* {id === 'dni' && <Dni client:load locale={locale} />} */}

{/* {id === 'cif' && <Cif client:load locale={locale} />} */}

{/* {id === 'iban' && <Iban client:load locale={locale} />} */}

{/* {id === 'plate' && <Plate client:load locale={locale} />} */}

{/* {id === 'nss' && <Nss client:load locale={locale} />} */}

{/* {id === 'card' && <Card client:load locale={locale} />} */}

{/* {id === 'phone' && <Phone client:load locale={locale} />} */}

{/* {id === 'bic' && <Bic client:load locale={locale} />} */}

{/* {id === 'ean-isbn' && <EanIsbn client:load locale={locale} />} */}

{/* {id === 'postal-code' && <PostalCode client:load locale={locale} />} */}

{/* {id === 'mock' && <Mock client:load locale={locale} />} */}
```

Las líneas `{/* … */}` son comentarios de expresión: el compilador de Astro 7 los ignora.

- [ ] **Step 8: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css && pnpm test:e2e
git diff --stat
```
Expected: todo en verde; el build sigue generando las 14 páginas por idioma (aún no hay herramientas nuevas) y el e2e pasa igual que antes. `git diff --stat` solo lista los archivos de esta task.

- [ ] **Step 9: Commit**

```bash
git add src/lib/random.ts src/lib/random.test.ts src/lib/provinces.ts src/lib/provinces.test.ts \
  src/lib/csv.ts src/lib/csv.test.ts src/lib/ids.ts src/lib/ids.test.ts \
  src/tools/icon-names.ts src/tools/icons.ts src/i18n/es.ts src/i18n/en.ts \
  src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain   # no debe quedar nada sin añadir
git commit -m "feat: prerrequisitos del lote 1 (azar, provincias, CSV, iconos y registro pre-sembrado)"
```

---

### Task 1: DNI y NIE: validar, generar y calcular la letra

**Files:**
- Create: `src/tools/dni/logic.ts`, `src/tools/dni/logic.test.ts`, `src/tools/dni/meta.ts`, `src/tools/dni/strings.ts`, `src/tools/dni/content.es.md`, `src/tools/dni/content.en.md`, `src/tools/dni/Dni.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `compactId`, `dniLetter`, `splitLines`, `repeat`, `MAX_LINES`, `MAX_QUANTITY`, `DEFAULT_QUANTITY` (`lib/ids`); `digits`, `pick`, `randInt`, `randomSeed`, `seededRng`, `Rng` (`lib/random`); `fill`; `t` (`led.idle`, `led.bad`, `ui.clear`, `ui.generate`, `ui.quantity`, `ui.seed`, `ui.seedHelp`, `ui.testOnly`); kit: `Field`, `TextArea`, `Display`, `Led`, `CopyButton`, `Button`, `Segmented`, `NumberInput`, `Toggle`.
- Produces: `type DniKind`, `type DniReason`, `type DniResult`, `type LetterResult`; `validateDni(raw): DniResult`, `calcLetter(raw): LetterResult`, `withDash(id): string`, **`generateDni(rng: Rng): string`**, **`generateNie(rng: Rng): string`** (contrato de la Task 11). Además `meta: ToolMeta` (id `dni`, slugs de la tabla de arriba), `strings: Record<Locale, …>` y el componente `Dni` con props `{ locale: Locale }`.
- DOM para la Task 12: `#dni-input`, `#dni-seed`, `#dni-quantity`, `#dni-letter`; resultado en `.display-head`, `.display-value`, `.display-kv`, `.display-row`.

**§6.1 (vinculante).** Cómo se cubre cada punto:
- DNI de 8 cifras y NIE `X/Y/Z` + 7 cifras con `TRWAGMYFPDXBNJZSQVHLCKE[n mod 23]`; X→0, Y→1, Z→2. Tests `checked examples` con los 5 del spec.
- Errores del spec, con su texto exacto en `strings.ts`: letra incorrecta con la correcta, I/Ñ/O/U, faltan cifras, NIE sin X/Y/Z y NIE con 8 cifras. Añadidos: «Sobran cifras», «Falta la letra: para N es L» y formato no reconocido.
- 7 cifras + letra se rellena con un 0 y lo dice (`padded`); `00000000T` es válido; K, L y M remiten al validador de CIF con un enlace.
- Generar: Segmented secundario DNI · NIE · Ambos, toggle «Con guion», X/Y/Z por igual (test `spreads X, Y and Z evenly`).
- Calcular letra: la letra en grande en `display-value`.
- `rememberInput: false`: `$state` sin `persistedInput`; el script de navegador y el e2e de la Task 12 comprueban `localStorage`. FAQ del spec en `meta`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-dni -b lote-1/dni   # desde el commit de la Task 0
cd ../devtools-dni
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`.

- [ ] **Step 2: Test (falla)**

`src/tools/dni/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import { calcLetter, generateDni, generateNie, validateDni, withDash } from './logic';

describe('validateDni: checked examples', () => {
  it('accepts the documented DNI and NIE', () => {
    for (const id of ['12345678Z', '00000000T', 'X1234567L', 'Y1234567X', 'Z1234567R']) {
      expect(validateDni(id).ok, id).toBe(true);
    }
  });

  it('computes the letter from n mod 23 (12345678 mod 23 = 14 → Z)', () => {
    expect(validateDni('12345678Z')).toEqual({
      ok: true,
      kind: 'dni',
      normalized: '12345678Z',
      number: '12345678',
      letter: 'Z',
      padded: false,
    });
  });

  it('replaces X, Y and Z by 0, 1 and 2 in a NIE', () => {
    expect(validateDni('Y1234567X')).toMatchObject({ ok: true, kind: 'nie', number: '11234567' });
  });

  it('normalizes case, spaces, dots and dashes', () => {
    expect(validateDni(' 12.345.678-z ')).toMatchObject({ ok: true, normalized: '12345678Z' });
    expect(validateDni('x-1234567-l')).toMatchObject({ ok: true, normalized: 'X1234567L' });
  });
});

describe('validateDni: errors', () => {
  it('says which letter is right', () => {
    expect(validateDni('12345678A')).toEqual({
      ok: false,
      reason: 'wrongLetter',
      kind: 'dni',
      number: '12345678',
      expected: 'Z',
    });
    expect(validateDni('X1234567A')).toMatchObject({ reason: 'wrongLetter', expected: 'L' });
  });

  it('rejects I, Ñ, O and U, which the DNI never uses', () => {
    for (const l of ['I', 'Ñ', 'O', 'U']) {
      expect(validateDni(`12345678${l}`)).toMatchObject({ reason: 'forbiddenLetter', letter: l });
    }
    expect(validateDni('12345678ñ')).toMatchObject({ reason: 'forbiddenLetter', letter: 'Ñ' });
  });

  it('pads a 7-digit DNI with a leading zero and says so', () => {
    expect(validateDni('1234567L')).toMatchObject({
      ok: true,
      normalized: '01234567L',
      padded: true,
    });
  });

  it('reports missing and extra digits', () => {
    expect(validateDni('123456Z')).toMatchObject({ reason: 'fewDigits' });
    expect(validateDni('123456789Z')).toMatchObject({ reason: 'manyDigits' });
  });

  it('offers the letter when it is missing', () => {
    expect(validateDni('12345678')).toMatchObject({ reason: 'missingLetter', expected: 'Z' });
  });

  it('checks the NIE shape', () => {
    expect(validateDni('X12345678L')).toMatchObject({ reason: 'nieDigits' });
    expect(validateDni('A1234567L')).toMatchObject({ reason: 'niePrefix' });
    expect(validateDni('X12A4567L')).toMatchObject({ reason: 'format' });
  });

  it('sends K, L and M NIF to the CIF validator', () => {
    expect(validateDni('K1234567L')).toEqual({ ok: false, reason: 'cif' });
    expect(validateDni('M1234567L')).toEqual({ ok: false, reason: 'cif' });
  });

  it('accepts 00000000T, which is valid on paper', () => {
    expect(validateDni('00000000T').ok).toBe(true);
    expect(validateDni('')).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('calcLetter', () => {
  it('works for 8 digits and for X/Y/Z + 7 digits', () => {
    expect(calcLetter('12345678')).toEqual({
      ok: true,
      kind: 'dni',
      letter: 'Z',
      full: '12345678Z',
    });
    expect(calcLetter('z 1234567')).toEqual({
      ok: true,
      kind: 'nie',
      letter: 'R',
      full: 'Z1234567R',
    });
    expect(calcLetter('1234567')).toEqual({ ok: false, reason: 'format' });
    expect(calcLetter(' ')).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('generators', () => {
  it('round-trip: 1 000 DNI and 1 000 NIE with seed "test" are all valid', () => {
    const rng = seededRng('test');
    for (let i = 0; i < 1000; i++) {
      const dni = generateDni(rng);
      expect(dni).toMatch(/^\d{8}[A-Z]$/);
      expect(validateDni(dni).ok, dni).toBe(true);
      const nie = generateNie(rng);
      expect(nie).toMatch(/^[XYZ]\d{7}[A-Z]$/);
      expect(validateDni(nie).ok, nie).toBe(true);
    }
  });

  it('spreads X, Y and Z evenly', () => {
    const rng = seededRng('spread');
    const counts: Record<string, number> = { X: 0, Y: 0, Z: 0 };
    for (let i = 0; i < 3000; i++) counts[generateNie(rng)[0]]++;
    for (const c of Object.values(counts)) expect(c).toBeGreaterThan(850);
  });

  it('is deterministic with a seed', () => {
    expect(generateDni(seededRng('demo'))).toBe(generateDni(seededRng('demo')));
  });

  it('adds the dash before the letter', () => {
    expect(withDash('12345678Z')).toBe('12345678-Z');
    expect(withDash('X1234567L')).toBe('X1234567-L');
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/dni`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/dni/logic.ts`**

```ts
import { compactId, dniLetter } from '../../lib/ids';
import { digits, pick, randInt, type Rng } from '../../lib/random';

export type DniKind = 'dni' | 'nie';

export type DniReason =
  | 'empty'
  | 'format'
  | 'fewDigits'
  | 'manyDigits'
  | 'missingLetter'
  | 'forbiddenLetter'
  | 'wrongLetter'
  | 'nieDigits'
  | 'niePrefix'
  | 'cif';

export type DniResult =
  | {
      ok: true;
      kind: DniKind;
      /** `12345678Z` or `X1234567L`. */
      normalized: string;
      /** The 8 digits the letter is computed from (X/Y/Z already replaced by 0/1/2). */
      number: string;
      letter: string;
      /** True when a 7-digit DNI was padded with a leading zero. */
      padded: boolean;
    }
  | {
      ok: false;
      reason: DniReason;
      kind?: DniKind;
      /** The digits as typed (for `wrongLetter` and `missingLetter`). */
      number?: string;
      /** The letter that would be correct. */
      expected?: string;
      /** The letter that was typed (for `forbiddenLetter`). */
      letter?: string;
    };

export type LetterResult =
  | { ok: true; kind: DniKind; letter: string; full: string }
  | { ok: false; reason: 'empty' | 'format' };

const NIE_PREFIX: Record<string, string> = { X: '0', Y: '1', Z: '2' };
const FORBIDDEN = /^[IÑOU]$/;

function letterFor(prefix: string, body: string): string {
  return dniLetter(Number((NIE_PREFIX[prefix] ?? '') + body));
}

export function validateDni(raw: string): DniResult {
  const s = compactId(raw);
  if (!s) return { ok: false, reason: 'empty' };
  if (/^[KLM]/.test(s)) return { ok: false, reason: 'cif' };

  if (/^[XYZ]/.test(s)) {
    const m = /^([XYZ])(\d+)([A-ZÑ])$/.exec(s);
    if (!m) return { ok: false, reason: 'format', kind: 'nie' };
    const [, prefix, body, letter] = m;
    if (body.length !== 7) return { ok: false, reason: 'nieDigits', kind: 'nie' };
    const expected = letterFor(prefix, body);
    if (FORBIDDEN.test(letter))
      return { ok: false, reason: 'forbiddenLetter', kind: 'nie', letter };
    if (letter !== expected) {
      return { ok: false, reason: 'wrongLetter', kind: 'nie', number: prefix + body, expected };
    }
    return {
      ok: true,
      kind: 'nie',
      normalized: prefix + body + letter,
      number: NIE_PREFIX[prefix] + body,
      letter,
      padded: false,
    };
  }

  if (/^[A-ZÑ]/.test(s)) return { ok: false, reason: 'niePrefix', kind: 'nie' };

  if (/^\d+$/.test(s)) {
    if (s.length > 8) return { ok: false, reason: 'manyDigits', kind: 'dni' };
    if (s.length < 7) return { ok: false, reason: 'fewDigits', kind: 'dni' };
    const number = s.padStart(8, '0');
    return {
      ok: false,
      reason: 'missingLetter',
      kind: 'dni',
      number,
      expected: letterFor('', number),
    };
  }

  const m = /^(\d+)([A-ZÑ])$/.exec(s);
  if (!m) return { ok: false, reason: 'format', kind: 'dni' };
  const [, body, letter] = m;
  if (body.length > 8) return { ok: false, reason: 'manyDigits', kind: 'dni' };
  if (body.length < 7) return { ok: false, reason: 'fewDigits', kind: 'dni' };
  const number = body.padStart(8, '0');
  const expected = letterFor('', number);
  if (FORBIDDEN.test(letter)) return { ok: false, reason: 'forbiddenLetter', kind: 'dni', letter };
  if (letter !== expected)
    return { ok: false, reason: 'wrongLetter', kind: 'dni', number, expected };
  return {
    ok: true,
    kind: 'dni',
    normalized: number + letter,
    number,
    letter,
    padded: body.length < 8,
  };
}

/** "Calcular letra": 8 digits, or X/Y/Z + 7 digits. */
export function calcLetter(raw: string): LetterResult {
  const s = compactId(raw);
  if (!s) return { ok: false, reason: 'empty' };
  const nie = /^([XYZ])(\d{7})$/.exec(s);
  if (nie) {
    const letter = letterFor(nie[1], nie[2]);
    return { ok: true, kind: 'nie', letter, full: s + letter };
  }
  if (/^\d{8}$/.test(s)) {
    const letter = letterFor('', s);
    return { ok: true, kind: 'dni', letter, full: s + letter };
  }
  return { ok: false, reason: 'format' };
}

/** `12345678Z` → `12345678-Z`, `X1234567L` → `X1234567-L`. */
export function withDash(id: string): string {
  return `${id.slice(0, -1)}-${id.slice(-1)}`;
}

export function generateDni(rng: Rng): string {
  const number = String(randInt(rng, 0, 99_999_999)).padStart(8, '0');
  return number + letterFor('', number);
}

/** X, Y and Z come out equally often. */
export function generateNie(rng: Rng): string {
  const prefix = pick(rng, ['X', 'Y', 'Z']);
  const body = digits(rng, 7);
  return prefix + body + letterFor(prefix, body);
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/dni`
Expected: PASS, incluido el test de ida y vuelta de 1 000 valores si la herramienta genera.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/dni/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'dni',
  category: 'ids',
  icon: 'id-card-lanyard',
  slug: { es: 'validador-dni-nie', en: 'spanish-dni-nie-validator' },
  name: { es: 'DNI y NIE', en: 'DNI & NIE' },
  title: {
    es: 'Validador y generador de DNI y NIE online',
    en: 'Spanish DNI and NIE validator and generator',
  },
  description: {
    es: 'Comprueba la letra de un DNI o NIE, calcula la que falta y genera documentos ficticios para pruebas. Valida cientos de golpe, uno por línea.',
    en: 'Check the letter of a Spanish DNI or NIE, work out a missing one and generate fictitious IDs for testing. Validates hundreds at once, one per line.',
  },
  keywords: {
    es: ['validar dni', 'letra dni', 'calcular letra dni', 'validar nie', 'generador dni', 'nif'],
    en: [
      'dni validator',
      'nie validator',
      'spanish id number',
      'dni letter',
      'dni generator',
      'nif',
    ],
  },
  tabs: {
    es: ['Validar', 'Generar', 'Calcular letra'],
    en: ['Validate', 'Generate', 'Find the letter'],
  },
  rememberInput: false,
  faq: {
    es: [
      {
        q: '¿Estos DNI existen?',
        a: 'Los generados tienen la letra correcta, así que pasan cualquier validación de formato, pero son números al azar: pueden coincidir con un documento real por casualidad. Úsalos solo en entornos de prueba y nunca como si fueran de alguien.',
      },
      {
        q: '¿Por qué el DNI no lleva Ñ, I, O ni U?',
        a: 'La tabla de 23 letras se eligió para evitar confusiones al leer y escribir: la I y la O se parecen al 1 y al 0, la U a la V, y la Ñ no existe fuera del teclado español.',
      },
    ],
    en: [
      {
        q: 'Do these DNI exist?',
        a: 'Generated numbers carry the right letter, so they pass any format check, but they are random: one could match a real document by chance. Use them only in test environments and never as if they belonged to someone.',
      },
      {
        q: 'Why does the DNI never use Ñ, I, O or U?',
        a: 'The 23-letter table was chosen to avoid reading and typing mistakes: I and O look like 1 and 0, U looks like V, and Ñ only exists on Spanish keyboards.',
      },
    ],
  },
};
```

`src/tools/dni/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    mode: 'Modo',
    input: 'DNI o NIE',
    placeholder: '12345678Z\nX1234567L',
    notStored: 'Uno por línea, hasta 1000. Lo que escribes no se guarda en ningún sitio.',
    result: 'Resultado',
    empty: 'Escribe un DNI (12345678Z) o un NIE (X1234567L) y se comprueba al momento.',
    validDni: 'DNI válido',
    validNie: 'NIE válido',
    count: '{ok} válidos · {bad} no válidos',
    truncated: 'Solo se comprueban las primeras {n} líneas.',
    kind: 'Tipo',
    dni: 'DNI',
    nie: 'NIE',
    number: 'Número',
    letter: 'Letra',
    padded: 'Tenía 7 cifras: se ha añadido un 0 a la izquierda.',
    wrongLetter: 'Letra incorrecta: para {n} es {l}.',
    forbiddenLetter:
      'La letra {l} no se usa en el DNI. Las posibles son T, R, W, A, G, M, Y, F, P, D, X, B, N, J, Z, S, Q, V, H, L, C, K y E.',
    fewDigits: 'Faltan cifras: un DNI tiene 8 cifras y una letra.',
    manyDigits: 'Sobran cifras: un DNI tiene 8 cifras y una letra.',
    missingLetter: 'Falta la letra: para {n} es {l}.',
    nieDigits: 'Un NIE tiene 7 cifras tras la letra inicial.',
    niePrefix: 'Un NIE empieza por X, Y o Z.',
    cif: 'Los NIF que empiezan por K, L o M se comprueban en el validador de CIF.',
    cifLink: 'Abrir el validador de CIF',
    cifHref: '/es/validador-cif',
    format:
      'Formato no reconocido: un DNI son 8 cifras y una letra (12345678Z) y un NIE, X, Y o Z, 7 cifras y una letra (X1234567L).',
    type: 'Tipo',
    both: 'Ambos',
    dash: 'Con guion (12345678-Z)',
    generated: 'Documentos generados',
    copyAll: 'Copiar todos',
    letterInput: '8 cifras, o X, Y o Z y 7 cifras',
    letterPlaceholder: '12345678',
    letterResult: 'Letra',
    letterEmpty: 'Escribe el número sin la letra y aquí aparece.',
    letterError: 'Escribe 8 cifras (12345678) o X, Y o Z seguida de 7 cifras (X1234567).',
    full: 'Documento completo: {v}',
  },
  en: {
    mode: 'Mode',
    input: 'DNI or NIE',
    placeholder: '12345678Z\nX1234567L',
    notStored: 'One per line, up to 1000. What you type is not stored anywhere.',
    result: 'Result',
    empty: 'Type a DNI (12345678Z) or an NIE (X1234567L) and it is checked right away.',
    validDni: 'Valid DNI',
    validNie: 'Valid NIE',
    count: '{ok} valid · {bad} not valid',
    truncated: 'Only the first {n} lines are checked.',
    kind: 'Type',
    dni: 'DNI',
    nie: 'NIE',
    number: 'Number',
    letter: 'Letter',
    padded: 'It had 7 digits: a leading 0 was added.',
    wrongLetter: 'Wrong letter: for {n} it is {l}.',
    forbiddenLetter:
      'The letter {l} is never used in a DNI. The possible ones are T, R, W, A, G, M, Y, F, P, D, X, B, N, J, Z, S, Q, V, H, L, C, K and E.',
    fewDigits: 'Digits missing: a DNI has 8 digits and a letter.',
    manyDigits: 'Too many digits: a DNI has 8 digits and a letter.',
    missingLetter: 'The letter is missing: for {n} it is {l}.',
    nieDigits: 'An NIE has 7 digits after the first letter.',
    niePrefix: 'An NIE starts with X, Y or Z.',
    cif: 'Tax IDs starting with K, L or M are checked in the CIF validator.',
    cifLink: 'Open the CIF validator',
    cifHref: '/en/spanish-cif-validator',
    format:
      'Unrecognised format: a DNI is 8 digits and a letter (12345678Z) and an NIE is X, Y or Z, 7 digits and a letter (X1234567L).',
    type: 'Type',
    both: 'Both',
    dash: 'With a dash (12345678-Z)',
    generated: 'Generated IDs',
    copyAll: 'Copy all',
    letterInput: '8 digits, or X, Y or Z and 7 digits',
    letterPlaceholder: '12345678',
    letterResult: 'Letter',
    letterEmpty: 'Type the number without its letter and the letter shows up here.',
    letterError: 'Type 8 digits (12345678) or X, Y or Z followed by 7 digits (X1234567).',
    full: 'Full ID: {v}',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/dni/content.es.md`:
```md
## Cómo se calcula la letra

La letra del DNI es un dígito de control: se divide el número de 8 cifras entre 23 y el resto indica la posición en la tabla `TRWAGMYFPDXBNJZSQVHLCKE`. Para 12345678 el resto es 14, así que la letra es la Z. Si una cifra está mal copiada, la letra casi nunca cuadra, y por eso el validador detecta al momento un DNI con una errata.

El NIE de los extranjeros usa la misma fórmula: la letra inicial se cambia por un número (X por 0, Y por 1 y Z por 2) y se calcula sobre las 8 cifras resultantes. Los NIF que empiezan por K, L o M son de personas sin DNI y se comprueban en el validador de CIF.

## Validar muchos a la vez y generar para pruebas

Puedes pegar una columna entera de una hoja de cálculo, uno por línea. Cada fila dice si es válida y, si no, qué falla: la letra correcta, las cifras que faltan o el prefijo del NIE. Si un DNI de 7 cifras perdió el cero inicial, se añade y se avisa.

La pestaña Generar crea DNI y NIE con la letra correcta para rellenar formularios de prueba o bases de datos de desarrollo. Con una semilla obtienes siempre la misma lista, útil para tests reproducibles. Nada de lo que escribes se guarda: un DNI es un dato personal.
```

`src/tools/dni/content.en.md`:
```md
## How the letter is computed

The DNI letter is a check character: the 8-digit number is divided by 23 and the remainder is a position in the table `TRWAGMYFPDXBNJZSQVHLCKE`. For 12345678 the remainder is 14, so the letter is Z. A mistyped digit almost never keeps the same letter, which is why the validator catches a typo right away.

The NIE for foreign residents uses the same formula: its first letter becomes a digit (X is 0, Y is 1 and Z is 2) and the letter is computed over the resulting 8 digits. Tax IDs starting with K, L or M belong to people without a DNI and are checked in the CIF validator.

## Validate many at once and generate for testing

Paste a whole spreadsheet column, one per line. Each row says whether it is valid and, if not, what is wrong: the right letter, the missing digits or the NIE prefix. If a 7-digit DNI lost its leading zero, it is added back and the result says so.

The Generate tab creates DNI and NIE with the right letter to fill test forms or development databases. With a seed you always get the same list, which helps with reproducible tests. Nothing you type is stored: a DNI is personal data.
```

- [ ] **Step 8: `src/tools/dni/Dni.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { DEFAULT_QUANTITY, MAX_LINES, MAX_QUANTITY, repeat, splitLines } from '../../lib/ids';
  import { pick, randomSeed, seededRng } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import type { Locale } from '../types';
  import {
    calcLetter,
    generateDni,
    generateNie,
    validateDni,
    withDash,
    type DniResult,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  let tab = $state<'validate' | 'generate' | 'letter'>('validate');
  // meta.rememberInput is false: a DNI is personal data, so it lives only in memory.
  let input = $state('');
  let letterInput = $state('');
  let kind = $state<'dni' | 'nie' | 'both'>('dni');
  let dash = $state(false);
  let quantity = $state(DEFAULT_QUANTITY);
  let seed = $state('');
  // Random per session and re-rolled by "Generar"; a typed seed takes over.
  let session = $state('');

  onMount(() => {
    session = randomSeed();
  });

  const split = $derived(splitLines(input));
  const results = $derived(split.lines.map((line) => ({ line, r: validateDni(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);

  function reason(r: DniResult): string {
    if (r.ok) return r.kind === 'dni' ? s.validDni : s.validNie;
    switch (r.reason) {
      case 'wrongLetter':
        return fill(s.wrongLetter, { n: r.number ?? '', l: r.expected ?? '' });
      case 'missingLetter':
        return fill(s.missingLetter, { n: r.number ?? '', l: r.expected ?? '' });
      case 'forbiddenLetter':
        return fill(s.forbiddenLetter, { l: r.letter ?? '' });
      case 'fewDigits':
        return s.fewDigits;
      case 'manyDigits':
        return s.manyDigits;
      case 'nieDigits':
        return s.nieDigits;
      case 'niePrefix':
        return s.niePrefix;
      case 'cif':
        return s.cif;
      default:
        return s.format;
    }
  }

  const copyValidated = $derived(results.map((x) => (x.r.ok ? x.r.normalized : x.line)).join('\n'));

  const generated = $derived.by(() => {
    const key = seed.trim() || session;
    if (!key) return [];
    const rng = seededRng(key);
    return repeat(quantity, () => {
      const make =
        kind === 'dni'
          ? generateDni
          : kind === 'nie'
            ? generateNie
            : pick(rng, [generateDni, generateNie]);
      const id = make(rng);
      return dash ? withDash(id) : id;
    });
  });

  const letter = $derived(letterInput.trim() ? calcLetter(letterInput) : null);
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'validate', label: meta.tabs![locale][0] },
      { value: 'generate', label: meta.tabs![locale][1] },
      { value: 'letter', label: meta.tabs![locale][2] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    {#if tab === 'validate'}
      <Field id="dni-input" label={s.input} help={s.notStored}>
        {#snippet children({ describedby })}
          <TextArea
            id="dni-input"
            bind:value={input}
            rows={3}
            placeholder={s.placeholder}
            {describedby}
            invalid={single !== null && !single.ok}
          />
        {/snippet}
      </Field>

      <Display live label={s.result}>
        {#snippet head()}
          {#if results.length === 0}
            <Led state="idle" label={t(locale, 'led.idle')} />
          {:else if single}
            <Led
              state={single.ok ? 'ok' : 'bad'}
              label={single.ok ? reason(single) : t(locale, 'led.bad')}
            />
          {:else}
            <span>{fill(s.count, { ok: okCount, bad: results.length - okCount })}</span>
          {/if}
        {/snippet}
        {#if results.length === 0}
          <p class="display-note">{s.empty}</p>
        {:else if single}
          {#if single.ok}
            <div class="display-value">{single.normalized}</div>
            <dl class="display-kv">
              <dt>{s.kind}</dt>
              <dd>{single.kind === 'dni' ? s.dni : s.nie}</dd>
              <dt>{s.number}</dt>
              <dd>{single.number}</dd>
              <dt>{s.letter}</dt>
              <dd>{single.letter}</dd>
            </dl>
            {#if single.padded}<p class="display-note">{s.padded}</p>{/if}
          {:else}
            <p class="display-note">{reason(single)}</p>
            {#if single.reason === 'cif'}
              <p class="display-note"><a href={s.cifHref}>{s.cifLink}</a></p>
            {/if}
          {/if}
        {:else}
          <div class="display-rows">
            {#each results as x, i (i)}
              <div class="display-row">
                <Led state={x.r.ok ? 'ok' : 'bad'} label={x.r.ok ? x.r.normalized : x.line} />
                <span class="why">{reason(x.r)}</span>
              </div>
            {/each}
          </div>
          {#if split.truncated}<p class="display-note">
              {fill(s.truncated, { n: MAX_LINES })}
            </p>{/if}
        {/if}
      </Display>

      <div class="row">
        <CopyButton main value={copyValidated} {locale} />
        <Button variant="ghost" disabled={!input} onclick={() => (input = '')}>
          {t(locale, 'ui.clear')}
        </Button>
      </div>
    {:else if tab === 'generate'}
      <div class="row">
        <div class="stack tight">
          <span class="label">{s.type}</span>
          <Segmented
            label={s.type}
            options={[
              { value: 'dni', label: s.dni },
              { value: 'nie', label: s.nie },
              { value: 'both', label: s.both },
            ]}
            bind:value={kind}
          />
        </div>
        <Toggle bind:checked={dash} label={s.dash} />
      </div>

      <div class="row top">
        <Field id="dni-quantity" label={t(locale, 'ui.quantity')}>
          <NumberInput id="dni-quantity" bind:value={quantity} min={1} max={MAX_QUANTITY} />
        </Field>
        <Field id="dni-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
          {#snippet children({ describedby })}
            <input
              id="dni-seed"
              class="control mono seed"
              type="text"
              autocomplete="off"
              spellcheck="false"
              aria-describedby={describedby}
              bind:value={seed}
            />
          {/snippet}
        </Field>
      </div>

      <div class="row">
        <Button variant="primary" icon="refresh-cw" onclick={() => (session = randomSeed())}>
          {t(locale, 'ui.generate')}
        </Button>
      </div>

      <Display label={s.generated}>
        <div class="display-rows">
          {#each generated as v, i (i)}
            <div class="display-row">
              <span>{v}</span>
              <CopyButton value={v} {locale} compact />
            </div>
          {/each}
        </div>
      </Display>
      <p class="test-only">{t(locale, 'ui.testOnly')}</p>

      <div class="row">
        <CopyButton main value={generated.join('\n')} {locale} label={s.copyAll} />
      </div>
    {:else}
      <Field
        id="dni-letter"
        label={s.letterInput}
        error={letter && !letter.ok ? s.letterError : undefined}
      >
        {#snippet children({ describedby })}
          <input
            id="dni-letter"
            class="control mono"
            type="text"
            autocomplete="off"
            spellcheck="false"
            placeholder={s.letterPlaceholder}
            aria-describedby={describedby}
            aria-invalid={letter !== null && !letter.ok}
            bind:value={letterInput}
          />
        {/snippet}
      </Field>

      <Display live label={s.letterResult}>
        {#if letter?.ok}
          <div class="display-value">{letter.letter}</div>
          <p class="display-note">{fill(s.full, { v: letter.full })}</p>
        {:else}
          <p class="display-note">{s.letterEmpty}</p>
        {/if}
      </Display>

      <div class="row">
        <CopyButton main value={letter?.ok ? letter.full : ''} {locale} />
      </div>
    {/if}
  </div>
</div>

<style>
  .tight {
    gap: 8px;
  }
  .top {
    align-items: flex-start;
  }
  .label {
    font-size: 13px;
    font-weight: 600;
  }
  .seed {
    width: 220px;
  }
  .why {
    flex: 1;
    text-align: right;
    font: 400 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--disp-dim);
  }
  .test-only {
    font-size: 13px;
    color: var(--text-dim);
  }
  .display-note a {
    color: var(--disp-text);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as dni } from './dni/meta';
```
→
```ts
import { meta as dni } from './dni/meta';
```
y
```ts
  // dni,
```
→
```ts
  dni,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Dni from '../tools/dni/Dni.svelte';
```
→
```astro
import Dni from '../tools/dni/Dni.svelte';
```
y
```astro
{/* {id === 'dni' && <Dni client:load locale={locale} />} */}
```
→
```astro
{id === 'dni' && <Dni client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/validador-dni-nie.html dist/en/spanish-dni-nie-validator.html
```
Expected: todo en verde, incluido `registry.test.ts` (título ≤ 65, descripción 51–160, slugs, icono y los dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobar en el navegador (script desechable)**

Crea `check-dni.mjs` en la raíz del worktree (no se confirma nunca):
```js
// Throwaway browser check for the dni task. Never committed: delete it after running.
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const PORT = 4701;
const server = spawn('node_modules/.bin/astro', ['preview', '--port', String(PORT), '--ignore-lock'], {
  stdio: 'ignore',
});
const base = `http://localhost:${PORT}`;
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`${base}/es`)).ok) break;
  } catch {
    // Not listening yet.
  }
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch();
const page = await browser.newPage({ locale: 'es-ES', viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(5000);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => page.locator('.panel').getByText(text).first().waitFor();
const rows = async (n, display) => {
  const scope = display ? page.getByRole('region', { name: display }) : page.locator('.panel');
  const count = await scope.locator('.display-row').count();
  if (count !== n) throw new Error(`expected ${n} rows, got ${count}`);
};
const nothingStored = async (id, typed) => {
  await page.waitForTimeout(500);
  const hits = await page.evaluate(
    ([k, t]) => Object.entries(localStorage).filter(([key, v]) => key.includes(k) || v.includes(t)),
    [id, typed],
  );
  if (hits.length) throw new Error(`stored: ${JSON.stringify(hits)}`);
};
try {
  await page.goto(`${base}/es/validador-dni-nie`);
  await page.locator('astro-island[ssr]').first().waitFor({ state: 'detached' });
  await page.locator('#dni-input').fill('12345678A');
  await see('Letra incorrecta: para 12345678 es Z.');
  await page.locator('#dni-input').fill('12345678Z\n1234567L\nX1234567A');
  await see('2 válidos · 1 no válidos');
  await page.getByRole('radio', { name: 'Generar', exact: true }).click();
  await page.locator('#dni-seed').fill('demo');
  await rows(10);
  await see('Datos ficticios, solo para pruebas.');
  await page.getByRole('radio', { name: 'Calcular letra', exact: true }).click();
  await page.locator('#dni-letter').fill('X1234567');
  await page.locator('.display-value').filter({ hasText: /^L$/ }).waitFor();
  await nothingStored('dni', '12345678Z');
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`horizontal scroll at ${width} px`);
  }
  for (const theme of ['light', 'dark', 'terminal']) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await page.screenshot({ path: `check-dni-${theme}.png`, fullPage: true });
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK dni');
} finally {
  await browser.close();
  server.kill();
}
```

Run:
```bash
pnpm build && node check-dni.mjs
```
Expected: `OK dni`. El script comprueba que `12345678A` da «Letra incorrecta: para 12345678 es Z.», tres líneas dan «2 válidos · 1 no válidos», Generar con semilla da 10 filas, Calcular letra de `X1234567` da `L`, y nada se guarda. También comprueba que no hay scroll horizontal a 390 px ni a 1280 px y guarda una captura por tema (`check-dni-light.png`, `-dark.png`, `-terminal.png`): ábrelas y confirma que los resultados se leen en la pantalla hundida y que nada se sale del panel en ningún tema.

Después, bórralo todo:
```bash
rm check-dni.mjs check-dni-*.png
```

- [ ] **Step 12: Commit**

```bash
git add src/tools/dni src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni el script ni las capturas). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(dni): validador, generador y cálculo de letra de DNI y NIE"
```

---

### Task 2: CIF: tipo de entidad, control en sus dos formas y NIF K, L y M

**Files:**
- Create: `src/tools/cif/logic.ts`, `src/tools/cif/logic.test.ts`, `src/tools/cif/meta.ts`, `src/tools/cif/strings.ts`, `src/tools/cif/content.es.md`, `src/tools/cif/content.en.md`, `src/tools/cif/Cif.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `compactId`, `dniLetter`, `splitLines`, `repeat`, `MAX_LINES`, `MAX_QUANTITY`, `DEFAULT_QUANTITY` (`lib/ids`); `digits`, `pick`, `randomSeed`, `seededRng`, `Rng` (`lib/random`); `persistedInput` con `shouldSave`; `fill`; `t` (`led.idle`, `led.bad`, `ui.clear`, `ui.generate`, `ui.quantity`, `ui.seed`, `ui.seedHelp`, `ui.testOnly`, `tool.remember`); kit: `Field`, `TextArea`, `Display`, `Led`, `CopyButton`, `Button`, `Segmented`, `NumberInput`, `Select`, `Toggle`.
- Produces: `type CifType`, `type ControlKind`, `CONTROL`, `CIF_TYPES`, `CIF_LETTERS`, `type CifReason`, `type CifResult`; `cifControl(seven)`, `validateCif(raw)`, `isPersonalNif(raw)`, `shouldRememberCif(text)`, **`generateCif(rng: Rng, type?: CifType): string`** (contrato). `strings.ts` exporta además `entityNames`. Además `meta: ToolMeta` (id `cif`, slugs de la tabla de arriba), `strings: Record<Locale, …>` y el componente `Cif` con props `{ locale: Locale }`.
- DOM para la Task 12: `#cif-input`, `#cif-type`, `#cif-quantity`, `#cif-seed`; región «CIF generados» con `.display-row`.

**§6.2 (vinculante).** Cómo se cubre cada punto:
- Algoritmo A + B y `e = (10 − (A + B) mod 10) mod 10`, control `JABCDEFGHI[e]`. Los 6 ejemplos del spec en `checked examples`.
- Estricto solo en A, B, E y H (cifra) y N, P, Q, S y W (letra); el resto acepta las dos (test `accepts either form…`). `B00000000` válido y `B0000000J` no.
- Errores del spec: «El control no cuadra: para B6541001 debería ser 1», «Una entidad de tipo P lleva letra…», «La letra I no corresponde…», «Falta el carácter de control». Añadido `digitFirst` para quien pega un DNI.
- K, L y M con la tabla del DNI sobre las 7 cifras, etiquetados «NIF especial de persona física»; no se generan.
- Generar: `Select` con «Cualquiera (A o B)» y los 17 tipos; forma canónica (letra en N, P, Q, R, S y W). Tests `emits the canonical control for every type` y A/B al 50 %.
- `rememberInput: true` con `shouldSave = shouldRememberCif` (Review Focus 4). FAQ en `meta`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-cif -b lote-1/cif   # desde el commit de la Task 0
cd ../devtools-cif
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`.

- [ ] **Step 2: Test (falla)**

`src/tools/cif/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import {
  CIF_TYPES,
  CONTROL,
  cifControl,
  generateCif,
  isPersonalNif,
  shouldRememberCif,
  validateCif,
} from './logic';

describe('cifControl', () => {
  it('computes e = (10 − (A + B) mod 10) mod 10 and its letter JABCDEFGHI[e]', () => {
    expect(cifControl('6541001')).toEqual({ e: 1, digit: '1', letter: 'A' });
    expect(cifControl('2826000')).toEqual({ e: 8, digit: '8', letter: 'H' });
    expect(cifControl('0000000')).toEqual({ e: 0, digit: '0', letter: 'J' });
  });
});

describe('validateCif: checked examples', () => {
  it('accepts the documented CIF', () => {
    for (const cif of [
      'A58818501',
      'B65410011',
      'Q2826000H',
      'P0800000B',
      'S2800568D',
      'B84948736',
    ]) {
      expect(validateCif(cif).ok, cif).toBe(true);
    }
  });

  it('returns the type and both forms of the control', () => {
    expect(validateCif('b-65410011')).toEqual({
      ok: true,
      kind: 'entity',
      type: 'B',
      normalized: 'B65410011',
      digit: '1',
      letter: 'A',
      accepts: 'digit',
    });
  });

  it('accepts either form where the sources disagree (C, D, F, G, J, R, U, V)', () => {
    const f = generateCif(seededRng('either'), 'F');
    const c = cifControl(f.slice(1, 8));
    expect(validateCif(`F${f.slice(1, 8)}${c.digit}`).ok).toBe(true);
    expect(validateCif(`F${f.slice(1, 8)}${c.letter}`).ok).toBe(true);
  });

  it('has 17 entity types and the strict ones the spec lists', () => {
    expect(CIF_TYPES).toHaveLength(17);
    for (const t of ['A', 'B', 'E', 'H'] as const) expect(CONTROL[t]).toBe('digit');
    for (const t of ['N', 'P', 'Q', 'S', 'W'] as const) expect(CONTROL[t]).toBe('letter');
  });
});

describe('validateCif: errors', () => {
  it('says which control is right', () => {
    expect(validateCif('B65410012')).toEqual({
      ok: false,
      reason: 'control',
      type: 'B',
      body: 'B6541001',
      expected: '1',
      accepts: 'digit',
    });
  });

  it('demands a letter from N, P, Q, S and W', () => {
    expect(validateCif('P08000002')).toMatchObject({ reason: 'needsLetter', expected: 'B' });
  });

  it('demands a digit from A, B, E and H: B00000000 is valid, B0000000J is not', () => {
    expect(validateCif('B00000000').ok).toBe(true);
    expect(validateCif('B0000000J')).toMatchObject({ reason: 'needsDigit', expected: '0' });
  });

  it('rejects letters that are not an entity type', () => {
    expect(validateCif('I12345678')).toEqual({ ok: false, reason: 'type', type: 'I' });
    expect(validateCif('12345678Z')).toEqual({ ok: false, reason: 'digitFirst' });
  });

  it('says the control is missing on 8 characters', () => {
    expect(validateCif('B6541001')).toMatchObject({ reason: 'missingControl', expected: '1' });
    expect(validateCif('Q2826000')).toMatchObject({ reason: 'missingControl', expected: 'H' });
  });

  it('rejects other shapes', () => {
    expect(validateCif('B654100')).toMatchObject({ reason: 'format' });
    expect(validateCif('B6541001K')).toMatchObject({ reason: 'format' });
    expect(validateCif('')).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('K, L and M: tax IDs of people', () => {
  it('validates them with the DNI table over the 7 digits', () => {
    // 1234567 mod 23 = 19 → L
    expect(validateCif('K1234567L')).toEqual({
      ok: true,
      kind: 'person',
      prefix: 'K',
      normalized: 'K1234567L',
      letter: 'L',
    });
    expect(validateCif('M1234567A')).toMatchObject({ reason: 'control', expected: 'L' });
  });

  it('is never remembered: shouldSave refuses any line with a K, L or M NIF', () => {
    expect(isPersonalNif('l1234567l')).toBe(true);
    expect(isPersonalNif('B65410011')).toBe(false);
    expect(shouldRememberCif('B65410011\nA58818501')).toBe(true);
    expect(shouldRememberCif('B65410011\n k-1234567-l')).toBe(false);
    expect(shouldRememberCif('M12')).toBe(false);
  });
});

describe('generateCif', () => {
  it('round-trip: 1 000 values with seed "test" are all valid', () => {
    const rng = seededRng('test');
    for (let i = 0; i < 1000; i++) {
      const cif = generateCif(rng);
      expect(validateCif(cif).ok, cif).toBe(true);
    }
  });

  it('only makes A and B without a type, about half each', () => {
    const rng = seededRng('ab');
    const all = Array.from({ length: 2000 }, () => generateCif(rng)[0]);
    expect(new Set(all)).toEqual(new Set(['A', 'B']));
    expect(all.filter((t) => t === 'A').length).toBeGreaterThan(900);
  });

  it('emits the canonical control for every type', () => {
    const rng = seededRng('types');
    for (const t of CIF_TYPES) {
      for (let i = 0; i < 50; i++) {
        const cif = generateCif(rng, t);
        expect(cif[0]).toBe(t);
        expect(validateCif(cif).ok, cif).toBe(true);
        const letterForm = ['N', 'P', 'Q', 'R', 'S', 'W'].includes(t);
        expect(/[A-J]$/.test(cif), cif).toBe(letterForm);
      }
    }
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/cif`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/cif/logic.ts`**

```ts
import { compactId, dniLetter, splitLines } from '../../lib/ids';
import { digits, pick, type Rng } from '../../lib/random';

export type CifType =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'J'
  | 'N'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'U'
  | 'V'
  | 'W';

/** What the last character may be: only strict where the sources agree (§6.2 of the spec). */
export type ControlKind = 'digit' | 'letter' | 'either';

export const CONTROL: Record<CifType, ControlKind> = {
  A: 'digit',
  B: 'digit',
  C: 'either',
  D: 'either',
  E: 'digit',
  F: 'either',
  G: 'either',
  H: 'digit',
  J: 'either',
  N: 'letter',
  P: 'letter',
  Q: 'letter',
  R: 'either',
  S: 'letter',
  U: 'either',
  V: 'either',
  W: 'letter',
};

export const CIF_TYPES = Object.keys(CONTROL) as CifType[];

/** The generator always emits the canonical form: a letter for these, a digit for the rest. */
const CANONICAL_LETTER = new Set<CifType>(['N', 'P', 'Q', 'R', 'S', 'W']);

export const CIF_LETTERS = 'JABCDEFGHI';

export type CifReason =
  | 'empty'
  | 'digitFirst'
  | 'type'
  | 'format'
  | 'missingControl'
  | 'control'
  | 'needsLetter'
  | 'needsDigit';

export type CifResult =
  | {
      ok: true;
      kind: 'entity';
      type: CifType;
      normalized: string;
      /** Both forms of the expected control. */
      digit: string;
      letter: string;
      accepts: ControlKind;
    }
  | { ok: true; kind: 'person'; prefix: 'K' | 'L' | 'M'; normalized: string; letter: string }
  | {
      ok: false;
      reason: CifReason;
      /** The entity letter as typed. */
      type?: string;
      /** Type letter + 7 digits, for "para B6541001 debería ser 1". */
      body?: string;
      /** The correct control, in the form the type accepts ("1", "A" or "1 o A"). */
      expected?: string;
      accepts?: ControlKind;
    };

/** Control of the 7 digits: A = even positions, B = doubled odd positions digit-summed. */
export function cifControl(seven: string): { e: number; digit: string; letter: string } {
  const d = [...seven].map(Number);
  const a = d[1] + d[3] + d[5];
  let b = 0;
  for (const i of [0, 2, 4, 6]) {
    const x = d[i] * 2;
    b += Math.floor(x / 10) + (x % 10);
  }
  const e = (10 - ((a + b) % 10)) % 10;
  return { e, digit: String(e), letter: CIF_LETTERS[e] };
}

function isCifType(c: string): c is CifType {
  return c in CONTROL;
}

export function validateCif(raw: string): CifResult {
  const s = compactId(raw);
  if (!s) return { ok: false, reason: 'empty' };

  const person = /^([KLM])(\d{7})([A-Z])$/.exec(s);
  if (person) {
    const [, prefix, seven, letter] = person;
    const expected = dniLetter(Number(seven));
    if (letter !== expected) {
      return { ok: false, reason: 'control', type: prefix, body: prefix + seven, expected };
    }
    return { ok: true, kind: 'person', prefix: prefix as 'K' | 'L' | 'M', normalized: s, letter };
  }

  const type = s[0];
  if (/^\d/.test(s)) return { ok: false, reason: 'digitFirst' };
  if (!isCifType(type)) {
    // K, L or M with the wrong shape (a K, L or M NIF is letter + 7 digits + letter).
    if (/^[KLM]$/.test(type)) return { ok: false, reason: 'format', type };
    return { ok: false, reason: 'type', type };
  }
  const accepts = CONTROL[type];

  if (/^[A-Z]\d{7}$/.test(s)) {
    const c = cifControl(s.slice(1));
    return {
      ok: false,
      reason: 'missingControl',
      type,
      body: s,
      expected: accepts === 'letter' ? c.letter : c.digit,
      accepts,
    };
  }

  const m = /^[A-Z](\d{7})([0-9A-J])$/.exec(s);
  if (!m) return { ok: false, reason: 'format', type };
  const [, seven, control] = m;
  const c = cifControl(seven);
  const isDigit = /\d/.test(control);

  if (accepts === 'letter' && isDigit) {
    return {
      ok: false,
      reason: 'needsLetter',
      type,
      body: s.slice(0, 8),
      expected: c.letter,
      accepts,
    };
  }
  if (accepts === 'digit' && !isDigit) {
    return {
      ok: false,
      reason: 'needsDigit',
      type,
      body: s.slice(0, 8),
      expected: c.digit,
      accepts,
    };
  }
  if (control !== c.digit && control !== c.letter) {
    const expected =
      accepts === 'letter' ? c.letter : accepts === 'digit' ? c.digit : `${c.digit}/${c.letter}`;
    return { ok: false, reason: 'control', type, body: s.slice(0, 8), expected, accepts };
  }
  return {
    ok: true,
    kind: 'entity',
    type,
    normalized: s,
    digit: c.digit,
    letter: c.letter,
    accepts,
  };
}

/** K, L and M are tax IDs of people without a DNI: personal data. */
export function isPersonalNif(raw: string): boolean {
  return /^[KLM]\d/.test(compactId(raw));
}

/** `shouldSave` for persistedInput: never store the input if any line is a K, L or M NIF. */
export function shouldRememberCif(text: string): boolean {
  return !splitLines(text).lines.some(isPersonalNif);
}

/** Without a type, A and B at 50 %: they are by far the most common. */
export function generateCif(rng: Rng, type?: CifType): string {
  const t = type ?? pick(rng, ['A', 'B'] as const);
  const seven = digits(rng, 7);
  const c = cifControl(seven);
  return t + seven + (CANONICAL_LETTER.has(t) ? c.letter : c.digit);
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/cif`
Expected: PASS, incluido el test de ida y vuelta de 1 000 valores si la herramienta genera.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/cif/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'cif',
  category: 'ids',
  icon: 'building',
  slug: { es: 'validador-cif', en: 'spanish-cif-validator' },
  name: { es: 'CIF', en: 'CIF (Spanish company tax ID)' },
  title: {
    es: 'Validador y generador de CIF (NIF de empresa) online',
    en: 'Spanish CIF validator and generator (company tax ID)',
  },
  description: {
    es: 'Valida el CIF o NIF de una empresa, te dice el tipo de entidad y el carácter de control correcto, y genera CIF ficticios para pruebas.',
    en: 'Validate the CIF of a Spanish company, see its entity type and the right check character, and generate fictitious CIF numbers for testing.',
  },
  keywords: {
    es: [
      'validar cif',
      'cif empresa',
      'nif empresa',
      'comprobar cif',
      'generador cif',
      'digito control cif',
    ],
    en: ['cif validator', 'spanish cif', 'spanish company tax id', 'nif empresa', 'cif generator'],
  },
  tabs: { es: ['Validar', 'Generar'], en: ['Validate', 'Generate'] },
  rememberInput: true,
  faq: {
    es: [
      {
        q: '¿Qué diferencia hay entre CIF y NIF?',
        a: 'Desde 2008 el nombre oficial es NIF para todos, personas y empresas. «CIF» sigue usándose para el NIF de las entidades, que empieza por una letra que indica la forma jurídica.',
      },
      {
        q: '¿Un CIF válido significa que la empresa existe?',
        a: 'No. Solo significa que el carácter de control cuadra con las cifras. Para saber si una empresa está dada de alta hay que consultar el censo de la Agencia Tributaria.',
      },
    ],
    en: [
      {
        q: 'What is the difference between CIF and NIF?',
        a: 'Since 2008 the official name is NIF for everyone, people and companies. “CIF” is still used for the tax ID of entities, which starts with a letter that tells the legal form.',
      },
      {
        q: 'Does a valid CIF mean the company exists?',
        a: 'No. It only means the check character matches the digits. To know whether a company is registered you have to look it up in the Spanish Tax Agency census.',
      },
    ],
  },
};
```

`src/tools/cif/strings.ts`:
```ts
import type { Locale } from '../types';
import type { CifType } from './logic';

export const strings = {
  es: {
    mode: 'Modo',
    input: 'CIF',
    placeholder: 'B65410011\nQ2826000H',
    help: 'Uno por línea, hasta 1000. Los NIF de personas (K, L y M) nunca se guardan.',
    result: 'Resultado',
    empty: 'Escribe un CIF (B65410011) y se comprueba al momento.',
    valid: 'CIF válido',
    validPerson: 'NIF especial de persona física',
    count: '{ok} válidos · {bad} no válidos',
    truncated: 'Solo se comprueban las primeras {n} líneas.',
    entity: 'Entidad',
    expected: 'Control esperado',
    accepted: 'Forma aceptada',
    digitAndLetter: '{d} (cifra) · {l} (letra)',
    digit: 'Cifra',
    letter: 'Letra',
    either: 'Cifra o letra',
    or: ' o ',
    control: 'El control no cuadra: para {body} debería ser {e}.',
    needsLetter: 'Una entidad de tipo {t} lleva letra de control: sería {e}.',
    needsDigit: 'Una entidad de tipo {t} lleva cifra de control: sería {e}.',
    missingControl: 'Falta el carácter de control: para {body} sería {e}.',
    type: 'La letra {t} no corresponde a ningún tipo de entidad.',
    digitFirst:
      'Un CIF empieza por la letra del tipo de entidad. Si es un DNI, compruébalo en el validador de DNI.',
    format:
      'Formato no reconocido: un CIF es una letra, 7 cifras y un carácter de control (B65410011).',
    typeLabel: 'Tipo de entidad',
    any: 'Cualquiera (A o B)',
    generated: 'CIF generados',
    copyAll: 'Copiar todos',
  },
  en: {
    mode: 'Mode',
    input: 'CIF',
    placeholder: 'B65410011\nQ2826000H',
    help: 'One per line, up to 1000. Tax IDs of people (K, L and M) are never stored.',
    result: 'Result',
    empty: 'Type a CIF (B65410011) and it is checked right away.',
    valid: 'Valid CIF',
    validPerson: 'Special tax ID of a person',
    count: '{ok} valid · {bad} not valid',
    truncated: 'Only the first {n} lines are checked.',
    entity: 'Entity',
    expected: 'Expected check',
    accepted: 'Accepted form',
    digitAndLetter: '{d} (digit) · {l} (letter)',
    digit: 'Digit',
    letter: 'Letter',
    either: 'Digit or letter',
    or: ' or ',
    control: 'The check does not match: for {body} it should be {e}.',
    needsLetter: 'An entity of type {t} takes a check letter: it would be {e}.',
    needsDigit: 'An entity of type {t} takes a check digit: it would be {e}.',
    missingControl: 'The check character is missing: for {body} it would be {e}.',
    type: 'The letter {t} is not an entity type.',
    digitFirst:
      'A CIF starts with the letter of its entity type. If this is a DNI, check it in the DNI validator.',
    format: 'Unrecognised format: a CIF is a letter, 7 digits and a check character (B65410011).',
    typeLabel: 'Entity type',
    any: 'Any (A or B)',
    generated: 'Generated CIF',
    copyAll: 'Copy all',
  },
} satisfies Record<Locale, Record<string, string>>;

export const entityNames: Record<Locale, Record<CifType | 'K' | 'L' | 'M', string>> = {
  es: {
    A: 'Sociedad anónima',
    B: 'Sociedad de responsabilidad limitada',
    C: 'Sociedad colectiva',
    D: 'Sociedad comanditaria',
    E: 'Comunidad de bienes',
    F: 'Sociedad cooperativa',
    G: 'Asociación o fundación',
    H: 'Comunidad de propietarios',
    J: 'Sociedad civil',
    N: 'Entidad extranjera',
    P: 'Corporación local',
    Q: 'Organismo público',
    R: 'Congregación o institución religiosa',
    S: 'Órgano de la Administración del Estado o autonómica',
    U: 'Unión temporal de empresas',
    V: 'Otros tipos',
    W: 'Establecimiento permanente de entidad no residente',
    K: 'Menor de 14 años sin DNI',
    L: 'Español residente en el extranjero sin DNI',
    M: 'Extranjero sin NIE',
  },
  en: {
    A: 'Public limited company (S.A.)',
    B: 'Limited liability company (S.L.)',
    C: 'General partnership',
    D: 'Limited partnership',
    E: 'Joint ownership',
    F: 'Cooperative',
    G: 'Association or foundation',
    H: 'Owners’ association',
    J: 'Civil partnership',
    N: 'Foreign entity',
    P: 'Local authority',
    Q: 'Public body',
    R: 'Religious congregation or institution',
    S: 'State or regional government body',
    U: 'Temporary business association (UTE)',
    V: 'Other types',
    W: 'Permanent establishment of a non-resident entity',
    K: 'Under-14 without a DNI',
    L: 'Spaniard living abroad without a DNI',
    M: 'Foreigner without an NIE',
  },
};
```

- [ ] **Step 7: Contenido SEO**

`src/tools/cif/content.es.md`:
```md
## Qué comprueba

Un CIF (el NIF de una empresa o entidad) tiene tres partes: una letra que indica la forma jurídica (B para una sociedad limitada, A para una anónima, G para una asociación…), siete cifras y un carácter de control. El control se calcula con las siete cifras: se suman las de posición par, se duplican las de posición impar sumando las cifras del resultado, y el complemento a 10 de la suma es el control. Si la entidad lleva letra, esa cifra se traduce con la tabla `JABCDEFGHI`.

Unas entidades llevan siempre cifra (A, B, E y H), otras siempre letra (N, P, Q, S y W) y el resto admite las dos. El validador solo es estricto donde las fuentes oficiales coinciden, y cuando falla te dice qué control esperaba y en qué forma.

## NIF de personas y datos de prueba

Los NIF que empiezan por K, L o M no son de empresas: son de personas sin DNI (menores de 14 años, españoles que viven fuera y extranjeros sin NIE). Se validan con la tabla de letras del DNI y, al ser datos personales, nunca se guardan en el navegador aunque tengas activado «Recordar lo que escribo».

La pestaña Generar crea CIF con el control correcto del tipo que elijas, útiles para facturas y formularios de prueba. Son números al azar: que un CIF sea válido no significa que la empresa exista.
```

`src/tools/cif/content.en.md`:
```md
## What it checks

A CIF (the tax ID of a Spanish company or entity) has three parts: a letter for the legal form (B for a limited company, A for a public limited company, G for an association…), seven digits and a check character. The check comes from the seven digits: the even positions are added, the odd ones are doubled and their digits added, and the complement to 10 of the total is the check. When the entity takes a letter, that digit is mapped through the table `JABCDEFGHI`.

Some entities always take a digit (A, B, E and H), others always a letter (N, P, Q, S and W) and the rest accept both. The validator is strict only where the official sources agree, and when it fails it tells you which check it expected and in which form.

## Tax IDs of people and test data

Tax IDs starting with K, L or M do not belong to companies but to people without a DNI (children under 14, Spaniards living abroad and foreigners without an NIE). They are checked with the DNI letter table and, being personal data, they are never stored in the browser even with “Remember what I type” on.

The Generate tab creates CIF numbers with the right check for the type you choose, handy for test invoices and forms. They are random: a valid CIF does not mean the company exists.
```

- [ ] **Step 8: `src/tools/cif/Cif.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { DEFAULT_QUANTITY, MAX_LINES, MAX_QUANTITY, repeat, splitLines } from '../../lib/ids';
  import { randomSeed, seededRng } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    CIF_TYPES,
    generateCif,
    shouldRememberCif,
    validateCif,
    type CifResult,
    type CifType,
  } from './logic';
  import { meta } from './meta';
  import { entityNames, strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const names = $derived(entityNames[locale]);

  // A company CIF is public (it is on every invoice), but K, L and M belong to people:
  // shouldRememberCif refuses to store the input while any line is one of those.
  const input = persistedInput('cif', '', meta.rememberInput ?? true, shouldRememberCif);

  let tab = $state<'validate' | 'generate'>('validate');
  let type = $state<'any' | CifType>('any');
  let quantity = $state(DEFAULT_QUANTITY);
  let seed = $state('');
  let session = $state('');

  onMount(() => {
    session = randomSeed();
  });

  const split = $derived(splitLines(input.value));
  const results = $derived(split.lines.map((line) => ({ line, r: validateCif(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);

  function reason(r: CifResult): string {
    if (r.ok) return r.kind === 'person' ? s.validPerson : names[r.type];
    const e = (r.expected ?? '').replace('/', s.or);
    switch (r.reason) {
      case 'control':
        return fill(s.control, { body: r.body ?? '', e });
      case 'needsLetter':
        return fill(s.needsLetter, { t: r.type ?? '', e });
      case 'needsDigit':
        return fill(s.needsDigit, { t: r.type ?? '', e });
      case 'missingControl':
        return fill(s.missingControl, { body: r.body ?? '', e });
      case 'type':
        return fill(s.type, { t: r.type ?? '' });
      case 'digitFirst':
        return s.digitFirst;
      default:
        return s.format;
    }
  }

  const copyValidated = $derived(results.map((x) => (x.r.ok ? x.r.normalized : x.line)).join('\n'));

  const typeOptions = $derived([
    { value: 'any' as const, label: s.any },
    ...CIF_TYPES.map((c) => ({ value: c, label: `${c} · ${names[c]}` })),
  ]);

  const generated = $derived.by(() => {
    const key = seed.trim() || session;
    if (!key) return [];
    const rng = seededRng(key);
    return repeat(quantity, () => generateCif(rng, type === 'any' ? undefined : type));
  });
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'validate', label: meta.tabs![locale][0] },
      { value: 'generate', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    {#if tab === 'validate'}
      <Field id="cif-input" label={s.input} help={s.help}>
        {#snippet children({ describedby })}
          <TextArea
            id="cif-input"
            bind:value={input.value}
            rows={3}
            placeholder={s.placeholder}
            {describedby}
            invalid={single !== null && !single.ok}
          />
        {/snippet}
      </Field>

      <Display live label={s.result}>
        {#snippet head()}
          {#if results.length === 0}
            <Led state="idle" label={t(locale, 'led.idle')} />
          {:else if single}
            <Led
              state={single.ok ? 'ok' : 'bad'}
              label={single.ok
                ? single.kind === 'person'
                  ? s.validPerson
                  : s.valid
                : t(locale, 'led.bad')}
            />
          {:else}
            <span>{fill(s.count, { ok: okCount, bad: results.length - okCount })}</span>
          {/if}
        {/snippet}
        {#if results.length === 0}
          <p class="display-note">{s.empty}</p>
        {:else if single}
          {#if single.ok}
            <div class="display-value">{single.normalized}</div>
            <dl class="display-kv">
              {#if single.kind === 'entity'}
                <dt>{s.entity}</dt>
                <dd>{single.type} · {names[single.type]}</dd>
                <dt>{s.expected}</dt>
                <dd>{fill(s.digitAndLetter, { d: single.digit, l: single.letter })}</dd>
                <dt>{s.accepted}</dt>
                <dd>{s[single.accepts]}</dd>
              {:else}
                <dt>{s.entity}</dt>
                <dd>{single.prefix} · {names[single.prefix]}</dd>
                <dt>{s.letter}</dt>
                <dd>{single.letter}</dd>
              {/if}
            </dl>
          {:else}
            <p class="display-note">{reason(single)}</p>
          {/if}
        {:else}
          <div class="display-rows">
            {#each results as x, i (i)}
              <div class="display-row">
                <Led state={x.r.ok ? 'ok' : 'bad'} label={x.r.ok ? x.r.normalized : x.line} />
                <span class="why">{reason(x.r)}</span>
              </div>
            {/each}
          </div>
          {#if split.truncated}<p class="display-note">
              {fill(s.truncated, { n: MAX_LINES })}
            </p>{/if}
        {/if}
      </Display>

      <div class="row">
        <CopyButton main value={copyValidated} {locale} />
        <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}>
          {t(locale, 'ui.clear')}
        </Button>
      </div>
      <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
    {:else}
      <div class="row top">
        <Field id="cif-type" label={s.typeLabel}>
          <Select id="cif-type" bind:value={type} options={typeOptions} />
        </Field>
        <Field id="cif-quantity" label={t(locale, 'ui.quantity')}>
          <NumberInput id="cif-quantity" bind:value={quantity} min={1} max={MAX_QUANTITY} />
        </Field>
        <Field id="cif-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
          {#snippet children({ describedby })}
            <input
              id="cif-seed"
              class="control mono seed"
              type="text"
              autocomplete="off"
              spellcheck="false"
              aria-describedby={describedby}
              bind:value={seed}
            />
          {/snippet}
        </Field>
      </div>

      <div class="row">
        <Button variant="primary" icon="refresh-cw" onclick={() => (session = randomSeed())}>
          {t(locale, 'ui.generate')}
        </Button>
      </div>

      <Display label={s.generated}>
        <div class="display-rows">
          {#each generated as v, i (i)}
            <div class="display-row">
              <span>{v}</span>
              <CopyButton value={v} {locale} compact />
            </div>
          {/each}
        </div>
      </Display>
      <p class="test-only">{t(locale, 'ui.testOnly')}</p>

      <div class="row">
        <CopyButton main value={generated.join('\n')} {locale} label={s.copyAll} />
      </div>
    {/if}
  </div>
</div>

<style>
  .top {
    align-items: flex-start;
  }
  .seed {
    width: 220px;
  }
  .why {
    flex: 1;
    text-align: right;
    font: 400 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--disp-dim);
  }
  .test-only {
    font-size: 13px;
    color: var(--text-dim);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as cif } from './cif/meta';
```
→
```ts
import { meta as cif } from './cif/meta';
```
y
```ts
  // cif,
```
→
```ts
  cif,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Cif from '../tools/cif/Cif.svelte';
```
→
```astro
import Cif from '../tools/cif/Cif.svelte';
```
y
```astro
{/* {id === 'cif' && <Cif client:load locale={locale} />} */}
```
→
```astro
{id === 'cif' && <Cif client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/validador-cif.html dist/en/spanish-cif-validator.html
```
Expected: todo en verde, incluido `registry.test.ts` (título ≤ 65, descripción 51–160, slugs, icono y los dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobar en el navegador (script desechable)**

Crea `check-cif.mjs` en la raíz del worktree (no se confirma nunca):
```js
// Throwaway browser check for the cif task. Never committed: delete it after running.
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const PORT = 4702;
const server = spawn('node_modules/.bin/astro', ['preview', '--port', String(PORT), '--ignore-lock'], {
  stdio: 'ignore',
});
const base = `http://localhost:${PORT}`;
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`${base}/es`)).ok) break;
  } catch {
    // Not listening yet.
  }
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch();
const page = await browser.newPage({ locale: 'es-ES', viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(5000);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => page.locator('.panel').getByText(text).first().waitFor();
const rows = async (n, display) => {
  const scope = display ? page.getByRole('region', { name: display }) : page.locator('.panel');
  const count = await scope.locator('.display-row').count();
  if (count !== n) throw new Error(`expected ${n} rows, got ${count}`);
};
const nothingStored = async (id, typed) => {
  await page.waitForTimeout(500);
  const hits = await page.evaluate(
    ([k, t]) => Object.entries(localStorage).filter(([key, v]) => key.includes(k) || v.includes(t)),
    [id, typed],
  );
  if (hits.length) throw new Error(`stored: ${JSON.stringify(hits)}`);
};
try {
  await page.goto(`${base}/es/validador-cif`);
  await page.locator('astro-island[ssr]').first().waitFor({ state: 'detached' });
  await page.locator('#cif-input').fill('B65410011');
  await see('Sociedad de responsabilidad limitada');
  await page.locator('#cif-input').fill('P08000002');
  await see('Una entidad de tipo P lleva letra de control: sería B.');
  await page.locator('#cif-input').fill('K1234567L');
  await see('NIF especial de persona física');
  await page.waitForTimeout(500);
  // A K, L or M NIF is personal data: shouldSave must keep it out of storage.
  await nothingStored('cif', 'K1234567L');
  await page.getByRole('radio', { name: 'Generar', exact: true }).click();
  await page.locator('#cif-seed').fill('demo');
  await rows(10);
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`horizontal scroll at ${width} px`);
  }
  for (const theme of ['light', 'dark', 'terminal']) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await page.screenshot({ path: `check-cif-${theme}.png`, fullPage: true });
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK cif');
} finally {
  await browser.close();
  server.kill();
}
```

Run:
```bash
pnpm build && node check-cif.mjs
```
Expected: `OK cif`. El script comprueba que `B65410011` muestra «Sociedad de responsabilidad limitada», `P08000002` pide letra, `K1234567L` es «NIF especial de persona física» y no se guarda, y Generar con semilla da 10 filas. También comprueba que no hay scroll horizontal a 390 px ni a 1280 px y guarda una captura por tema (`check-cif-light.png`, `-dark.png`, `-terminal.png`): ábrelas y confirma que los resultados se leen en la pantalla hundida y que nada se sale del panel en ningún tema.

Después, bórralo todo:
```bash
rm check-cif.mjs check-cif-*.png
```

- [ ] **Step 12: Commit**

```bash
git add src/tools/cif src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni el script ni las capturas). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(cif): validador y generador de CIF con NIF de personas K, L y M"
```

---

### Task 3: IBAN: 102 países, mod 97 cifra a cifra, CCC español y generador

**Files:**
- Create: `src/tools/iban/logic.ts`, `src/tools/iban/logic.test.ts`, `src/tools/iban/meta.ts`, `src/tools/iban/strings.ts`, `src/tools/iban/content.es.md`, `src/tools/iban/content.en.md`, `src/tools/iban/Iban.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `splitLines`, `repeat`, `MAX_LINES`, `MAX_QUANTITY`, `DEFAULT_QUANTITY` (`lib/ids`); `digits`, `pick`, `randomSeed`, `seededRng`, `Rng` (`lib/random`); `Intl.DisplayNames`; `fill`; `t`; kit: `Field`, `TextArea`, `Display`, `Led`, `CopyButton`, `Button`, `NumberInput`, `Segmented`, `Toggle`.
- Produces: `IBAN_LENGTHS` (102), `SPANISH_BANKS`, `interface SpanishParts`, `type IbanReason`, `type IbanResult`; `normalizeIban`, `mod97`, `ibanCheckDigits`, `cccDigit`, `cccControl`, `validateIban`, **`formatIban(iban: string): string`**, `formatCcc`, **`generateSpanishIban(rng: Rng): string`** (contrato). Además `meta: ToolMeta` (id `iban`, slugs de la tabla de arriba), `strings: Record<Locale, …>` y el componente `Iban` con props `{ locale: Locale }`.
- DOM para la Task 12: `#iban-input`, `#iban-quantity`, `#iban-seed`; `.display-kv` con entidad, oficina, DC y cuenta; región «IBAN generados».

**§6.3 (vinculante).** Cómo se cubre cada punto:
- Validación en el orden del spec, parando en el primer fallo: país de la tabla, longitud del país, `A–Z0-9`, control 02–98 y mod 97 cifra a cifra (Review Focus 3).
- España: DC1 sobre `"00" + entidad + oficina` y DC2 sobre la cuenta, pesos `1, 2, 4, 8, 5, 10, 9, 7, 3, 6`; «El IBAN es coherente, pero los dígitos de control de la cuenta no: deberían ser 45».
- CCC suelto de 20 cifras → su IBAN (`fromCcc`); si su DC falla, `cccOnly` con un mensaje propio (el del spec habla de «IBAN coherente», que no aplica a un CCC suelto).
- Los 7 IBAN comprobados del spec, `ES91 … 1332` desglosado y `ibanCheckDigits` (98 − mod97). Tabla de 102 países con los 12 territorios franceses y AX; `MA` fuera.
- Salida: grupos de 4 y nombre del país con `Intl.DisplayNames`; BBAN para el resto. Generar solo España con las 8 entidades del spec, cada fila con IBAN y CCC y su copiar; toggle «Agrupar de 4 en 4».
- `rememberInput: false`. FAQ en `meta`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-iban -b lote-1/iban   # desde el commit de la Task 0
cd ../devtools-iban
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`.

- [ ] **Step 2: Test (falla)**

`src/tools/iban/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import {
  IBAN_LENGTHS,
  SPANISH_BANKS,
  cccControl,
  formatCcc,
  formatIban,
  generateSpanishIban,
  ibanCheckDigits,
  mod97,
  normalizeIban,
  validateIban,
} from './logic';

const CHECKED = [
  'ES91 2100 0418 4502 0005 1332',
  'GB82 WEST 1234 5698 7654 32',
  'DE89 3704 0044 0532 0130 00',
  'NL91 ABNA 0417 1643 00',
  'FR14 2004 1010 0505 0001 3M02 606',
  'NO93 8601 1117 947',
  'BE68 5390 0754 7034',
];

describe('length table', () => {
  it('has 102 countries: 89 from SWIFT, 12 French territories and Åland', () => {
    expect(Object.keys(IBAN_LENGTHS)).toHaveLength(102);
    for (const c of ['BL', 'GF', 'GP', 'MF', 'MQ', 'NC', 'PF', 'PM', 'RE', 'TF', 'WF', 'YT']) {
      expect(IBAN_LENGTHS[c], c).toBe(27);
    }
    expect(IBAN_LENGTHS.AX).toBe(18);
    expect(IBAN_LENGTHS.ES).toBe(24);
    expect(IBAN_LENGTHS.MA).toBeUndefined();
  });
});

describe('mod97', () => {
  it('works digit by digit on 34 characters without overflowing', () => {
    const long = 'LC55HEMM000100010012001200023015'.padEnd(34, '9');
    const numeric = [...(long.slice(4) + long.slice(0, 4))]
      .map((ch) => (/[A-Z]/.test(ch) ? String(ch.charCodeAt(0) - 55) : ch))
      .join('');
    expect(mod97(long.slice(4) + long.slice(0, 4))).toBe(Number(BigInt(numeric) % 97n));
  });
});

describe('validateIban: checked examples', () => {
  it.each(CHECKED)('accepts %s', (iban) => {
    expect(validateIban(iban).ok).toBe(true);
  });

  it('breaks a Spanish IBAN into bank, branch, DC and account', () => {
    expect(validateIban('ES91 2100 0418 4502 0005 1332')).toEqual({
      ok: true,
      iban: 'ES9121000418450200051332',
      country: 'ES',
      bban: '21000418450200051332',
      spain: { bank: '2100', branch: '0418', dc: '45', account: '0200051332' },
      fromCcc: false,
    });
  });

  it('keeps the BBAN of other countries, letters included', () => {
    expect(validateIban('gb82west12345698765432')).toMatchObject({
      ok: true,
      country: 'GB',
      bban: 'WEST12345698765432',
      spain: null,
    });
  });

  it('accepts lower case, spaces anywhere and an "IBAN" prefix', () => {
    expect(validateIban('iban es9121 00041845020 0051332').ok).toBe(true);
  });
});

describe('validateIban: errors, in order', () => {
  it('unknown country', () => {
    expect(validateIban('XX12 3456')).toEqual({ ok: false, reason: 'country', country: 'XX' });
    expect(validateIban('MA64 0115 1900 0001 2050 0053 4921')).toMatchObject({
      reason: 'country',
    });
  });

  it('wrong length for the country', () => {
    expect(validateIban('ES91 2100 0418 4502 0005 133')).toEqual({
      ok: false,
      reason: 'length',
      country: 'ES',
      length: 23,
      expectedLength: 24,
    });
  });

  it('characters outside A–Z and 0–9', () => {
    expect(validateIban('ES91 2100 0418 4502 0005 133*')).toMatchObject({ reason: 'chars' });
  });

  it('check digits 00, 01 and 99 are refused even if mod 97 fits', () => {
    for (const cd of ['00', '01', '99']) {
      expect(validateIban(`ES${cd}21000418450200051332`)).toMatchObject({ reason: 'checkRange' });
    }
  });

  it('mod 97 mismatch', () => {
    expect(validateIban('ES91 2100 0418 4502 0005 1333')).toMatchObject({ reason: 'checksum' });
  });

  it('a coherent IBAN whose Spanish account digits are wrong', () => {
    // Same CCC with DC 46 instead of 45, and IBAN check digits recomputed so mod 97 fits.
    const bban = '21000418460200051332';
    const iban = `ES${ibanCheckDigits('ES', bban)}${bban}`;
    expect(validateIban(iban)).toEqual({ ok: false, reason: 'ccc', country: 'ES', expected: '45' });
  });
});

describe('CCC', () => {
  it('computes DC 45 for 2100 0418 … 0200051332', () => {
    expect(cccControl('2100', '0418', '0200051332')).toBe('45');
  });

  it('validates a bare 20-digit CCC and gives its IBAN', () => {
    expect(validateIban('2100 0418 45 0200051332')).toMatchObject({
      ok: true,
      iban: 'ES9121000418450200051332',
      fromCcc: true,
    });
    expect(validateIban('21000418460200051332')).toEqual({
      ok: false,
      reason: 'cccOnly',
      country: 'ES',
      expected: '45',
    });
  });

  it('builds the IBAN check digits from a BBAN', () => {
    expect(ibanCheckDigits('ES', '21000418450200051332')).toBe('91');
    expect(ibanCheckDigits('DE', '370400440532013000')).toBe('89');
  });
});

describe('formatting', () => {
  it('groups by 4 and prints the CCC', () => {
    expect(formatIban('ES9121000418450200051332')).toBe('ES91 2100 0418 4502 0005 1332');
    expect(formatIban('NO9386011117947')).toBe('NO93 8601 1117 947');
    expect(formatCcc('ES9121000418450200051332')).toBe('2100 0418 45 0200051332');
    expect(normalizeIban(' iban es91-2100 ')).toBe('ES912100');
  });
});

describe('generateSpanishIban', () => {
  it('round-trip: 1 000 values with seed "test" are all valid', () => {
    const rng = seededRng('test');
    for (let i = 0; i < 1000; i++) {
      const iban = generateSpanishIban(rng);
      expect(iban).toMatch(/^ES\d{22}$/);
      const r = validateIban(iban);
      expect(r.ok, iban).toBe(true);
      if (r.ok) expect(SPANISH_BANKS).toContain(r.spain?.bank);
    }
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/iban`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/iban/logic.ts`**

```ts
import { digits, pick, type Rng } from '../../lib/random';

/**
 * IBAN length per country: the 89 countries of the SWIFT IBAN registry, the 12 French
 * territories with their own IBAN in the FR format and Åland (FI format). 102 in total.
 * Checked against ibantools 4.5.4 (0 differences) when the spec was written, 2026-09-26.
 */
// prettier-ignore
export const IBAN_LENGTHS: Readonly<Record<string, number>> = {
  AD: 24, AE: 23, AL: 28, AT: 20, AX: 18, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22,
  BI: 27, BL: 27, BR: 29, BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DJ: 27,
  DK: 18, DO: 28, EE: 20, EG: 29, ES: 24, FI: 18, FK: 18, FO: 18, FR: 27, GB: 22,
  GE: 22, GF: 27, GI: 23, GL: 18, GP: 27, GR: 27, GT: 28, HN: 28, HR: 21, HU: 28,
  IE: 22, IL: 23, IQ: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28, LC: 32,
  LI: 21, LT: 20, LU: 20, LV: 21, LY: 25, MC: 27, MD: 24, ME: 22, MF: 27, MK: 19,
  MN: 20, MQ: 27, MR: 27, MT: 31, MU: 30, NC: 27, NI: 28, NL: 18, NO: 15, OM: 23,
  PF: 27, PK: 24, PL: 28, PM: 27, PS: 29, PT: 25, QA: 29, RE: 27, RO: 24, RS: 22,
  RU: 33, SA: 24, SC: 31, SD: 18, SE: 24, SI: 19, SK: 24, SM: 27, SO: 23, ST: 25,
  SV: 28, TF: 27, TL: 23, TN: 24, TR: 26, UA: 29, VA: 22, VG: 24, WF: 27, XK: 20,
  YE: 30, YT: 27,
};

/** Frequent real Spanish bank codes, for the generator. */
export const SPANISH_BANKS = ['2100', '0049', '0182', '0081', '2085', '0128', '1465', '0073'];

const CCC_WEIGHTS = [1, 2, 4, 8, 5, 10, 9, 7, 3, 6];

export interface SpanishParts {
  bank: string;
  branch: string;
  dc: string;
  account: string;
}

export type IbanReason =
  'empty' | 'country' | 'length' | 'chars' | 'checkRange' | 'checksum' | 'ccc' | 'cccOnly';

export type IbanResult =
  | {
      ok: true;
      /** Without spaces. */
      iban: string;
      country: string;
      bban: string;
      /** Only for ES. */
      spain: SpanishParts | null;
      /** True when the input was a bare 20-digit CCC. */
      fromCcc: boolean;
    }
  | {
      ok: false;
      reason: IbanReason;
      country?: string;
      length?: number;
      expectedLength?: number;
      /** For `ccc`: the two control digits the account should have. */
      expected?: string;
    };

/** Removes spaces, dashes and a leading "IBAN", and upper-cases. */
export function normalizeIban(raw: string): string {
  return raw.toUpperCase().replace(/[\s-]/g, '').replace(/^IBAN/, '');
}

/** mod 97 of an alphanumeric string (A=10 … Z=35), digit by digit so it never overflows. */
export function mod97(text: string): number {
  let r = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    const value = code >= 65 && code <= 90 ? String(code - 55) : ch;
    for (const d of value) r = (r * 10 + (d.charCodeAt(0) - 48)) % 97;
  }
  return r;
}

/** The two check digits of an IBAN: 98 − mod97(BBAN + country + "00"). */
export function ibanCheckDigits(country: string, bban: string): string {
  return String(98 - mod97(bban + country + '00')).padStart(2, '0');
}

/** One CCC control digit over 10 digits, with weights 1, 2, 4, 8, 5, 10, 9, 7, 3, 6. */
export function cccDigit(ten: string): number {
  let s = 0;
  for (let i = 0; i < 10; i++) s += Number(ten[i]) * CCC_WEIGHTS[i];
  const d = 11 - (s % 11);
  return d === 11 ? 0 : d === 10 ? 1 : d;
}

/** DC1 over "00" + bank + branch, DC2 over the account. */
export function cccControl(bank: string, branch: string, account: string): string {
  return `${cccDigit('00' + bank + branch)}${cccDigit(account)}`;
}

function spanishParts(bban: string): SpanishParts {
  return {
    bank: bban.slice(0, 4),
    branch: bban.slice(4, 8),
    dc: bban.slice(8, 10),
    account: bban.slice(10),
  };
}

function checkCcc(bban: string): string | null {
  const p = spanishParts(bban);
  const expected = cccControl(p.bank, p.branch, p.account);
  return expected === p.dc ? null : expected;
}

export function validateIban(raw: string): IbanResult {
  const s = normalizeIban(raw);
  if (!s) return { ok: false, reason: 'empty' };

  // A bare Spanish CCC: 20 digits.
  if (/^\d{20}$/.test(s)) {
    const expected = checkCcc(s);
    if (expected) return { ok: false, reason: 'cccOnly', country: 'ES', expected };
    const iban = 'ES' + ibanCheckDigits('ES', s) + s;
    return { ok: true, iban, country: 'ES', bban: s, spain: spanishParts(s), fromCcc: true };
  }

  const country = s.slice(0, 2);
  const expectedLength = IBAN_LENGTHS[country];
  if (!expectedLength) return { ok: false, reason: 'country', country };
  if (s.length !== expectedLength) {
    return { ok: false, reason: 'length', country, length: s.length, expectedLength };
  }
  if (!/^[A-Z0-9]+$/.test(s)) return { ok: false, reason: 'chars', country };
  const check = s.slice(2, 4);
  if (!/^\d\d$/.test(check) || Number(check) < 2 || Number(check) > 98) {
    return { ok: false, reason: 'checkRange', country };
  }
  if (mod97(s.slice(4) + s.slice(0, 4)) !== 1) return { ok: false, reason: 'checksum', country };

  const bban = s.slice(4);
  if (country === 'ES') {
    if (!/^\d{20}$/.test(bban)) return { ok: false, reason: 'chars', country };
    const expected = checkCcc(bban);
    if (expected) return { ok: false, reason: 'ccc', country, expected };
    return { ok: true, iban: s, country, bban, spain: spanishParts(bban), fromCcc: false };
  }
  return { ok: true, iban: s, country, bban, spain: null, fromCcc: false };
}

/** Groups of 4: `ES9121000418450200051332` → `ES91 2100 0418 4502 0005 1332`. */
export function formatIban(iban: string): string {
  return normalizeIban(iban).replace(/(.{4})(?=.)/g, '$1 ');
}

/** `2100 0418 45 0200051332` from a Spanish IBAN or CCC. */
export function formatCcc(ibanOrCcc: string): string {
  const s = normalizeIban(ibanOrCcc);
  const ccc = s.length === 24 ? s.slice(4) : s;
  return `${ccc.slice(0, 4)} ${ccc.slice(4, 8)} ${ccc.slice(8, 10)} ${ccc.slice(10)}`;
}

/** A random Spanish IBAN without spaces: real bank code, random branch and account. */
export function generateSpanishIban(rng: Rng): string {
  const bank = pick(rng, SPANISH_BANKS);
  const branch = digits(rng, 4);
  const account = digits(rng, 10);
  const bban = bank + branch + cccControl(bank, branch, account) + account;
  return 'ES' + ibanCheckDigits('ES', bban) + bban;
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/iban`
Expected: PASS, incluido el test de ida y vuelta de 1 000 valores si la herramienta genera.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/iban/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'iban',
  category: 'ids',
  icon: 'landmark',
  slug: { es: 'validador-iban', en: 'iban-validator' },
  name: { es: 'IBAN', en: 'IBAN' },
  title: {
    es: 'Validador de IBAN y generador de IBAN español',
    en: 'IBAN validator and Spanish IBAN generator',
  },
  description: {
    es: 'Valida un IBAN de cualquier país, desglosa la cuenta española (entidad, oficina y DC), convierte un CCC en IBAN y genera IBAN ficticios para pruebas.',
    en: 'Validate an IBAN from any country, break down a Spanish account (bank, branch and check digits), turn a CCC into an IBAN and generate test IBANs.',
  },
  keywords: {
    es: [
      'validar iban',
      'comprobar iban',
      'iban españa',
      'ccc a iban',
      'generador iban',
      'cuenta bancaria',
    ],
    en: [
      'iban validator',
      'check iban',
      'spanish iban',
      'iban generator',
      'iban checksum',
      'bank account',
    ],
  },
  tabs: { es: ['Validar', 'Generar'], en: ['Validate', 'Generate'] },
  rememberInput: false,
  faq: {
    es: [
      {
        q: '¿Qué diferencia hay entre IBAN y CCC?',
        a: 'El CCC es el código de cuenta español de 20 cifras: entidad, oficina, dos dígitos de control y número de cuenta. El IBAN añade delante el país (ES) y dos dígitos de control internacionales, y es el formato que se usa desde la llegada de SEPA.',
      },
      {
        q: '¿Un IBAN válido significa que la cuenta existe?',
        a: 'No. Los dígitos de control solo detectan erratas al copiarlo. Saber si la cuenta existe o a nombre de quién está requiere que el banco lo compruebe.',
      },
    ],
    en: [
      {
        q: 'What is the difference between IBAN and CCC?',
        a: 'The CCC is the 20-digit Spanish account code: bank, branch, two check digits and account number. The IBAN puts the country (ES) and two international check digits in front, and it is the format used since SEPA.',
      },
      {
        q: 'Does a valid IBAN mean the account exists?',
        a: 'No. The check digits only catch typing mistakes. Whether the account exists, and whose it is, can only be confirmed by the bank.',
      },
    ],
  },
};
```

`src/tools/iban/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    mode: 'Modo',
    input: 'IBAN o CCC',
    placeholder: 'ES91 2100 0418 4502 0005 1332',
    help: 'Uno por línea, hasta 1000. Un número de cuenta no se guarda en ningún sitio.',
    result: 'Resultado',
    empty: 'Escribe un IBAN de cualquier país o un CCC español de 20 cifras.',
    valid: 'IBAN válido',
    count: '{ok} válidos · {bad} no válidos',
    truncated: 'Solo se comprueban las primeras {n} líneas.',
    country: 'País',
    bank: 'Entidad',
    branch: 'Oficina',
    dc: 'DC',
    account: 'Cuenta',
    bban: 'BBAN',
    fromCcc: 'Era un CCC válido: este es su IBAN.',
    errCountry: '{c} no usa IBAN o no está en el registro de IBAN.',
    errLength: 'Un IBAN de {country} tiene {n} caracteres y este tiene {m}.',
    errChars: 'Solo se admiten letras de la A a la Z y cifras.',
    errCheckRange: 'Los dígitos de control (posiciones 3 y 4) van de 02 a 98.',
    errChecksum: 'Los dígitos de control no cuadran: hay alguna errata en el número.',
    errCcc: 'El IBAN es coherente, pero los dígitos de control de la cuenta no: deberían ser {e}.',
    errCccOnly: 'Los dígitos de control de la cuenta no cuadran: deberían ser {e}.',
    group: 'Agrupar de 4 en 4',
    generated: 'IBAN generados',
    copyIban: 'IBAN',
    copyCcc: 'CCC',
    copyAll: 'Copiar todos',
  },
  en: {
    mode: 'Mode',
    input: 'IBAN or CCC',
    placeholder: 'ES91 2100 0418 4502 0005 1332',
    help: 'One per line, up to 1000. Account numbers are not stored anywhere.',
    result: 'Result',
    empty: 'Type an IBAN from any country or a 20-digit Spanish CCC.',
    valid: 'Valid IBAN',
    count: '{ok} valid · {bad} not valid',
    truncated: 'Only the first {n} lines are checked.',
    country: 'Country',
    bank: 'Bank',
    branch: 'Branch',
    dc: 'Check digits',
    account: 'Account',
    bban: 'BBAN',
    fromCcc: 'It was a valid CCC: this is its IBAN.',
    errCountry: '{c} does not use IBAN or is not in the IBAN registry.',
    errLength: 'An IBAN from {country} has {n} characters and this one has {m}.',
    errChars: 'Only letters A to Z and digits are allowed.',
    errCheckRange: 'The check digits (positions 3 and 4) go from 02 to 98.',
    errChecksum: 'The check digits do not match: there is a typo somewhere in the number.',
    errCcc: 'The IBAN is consistent, but the account check digits are not: they should be {e}.',
    errCccOnly: 'The account check digits do not match: they should be {e}.',
    group: 'Group in fours',
    generated: 'Generated IBANs',
    copyIban: 'IBAN',
    copyCcc: 'CCC',
    copyAll: 'Copy all',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/iban/content.es.md`:
```md
## Cómo se valida un IBAN

Un IBAN empieza por el código del país y dos dígitos de control, seguidos de la cuenta nacional (el BBAN). Para comprobarlo se mueven los cuatro primeros caracteres al final, cada letra se convierte en dos cifras (A = 10, B = 11… Z = 35) y el número resultante dividido entre 97 debe dar resto 1. El validador hace ese cálculo cifra a cifra, así que funciona con IBAN de hasta 34 caracteres sin perder precisión, y antes comprueba que el país use IBAN y que la longitud sea la suya: 24 en España, 27 en Francia, 22 en Alemania.

## Cuentas españolas: el CCC

En España el BBAN es el antiguo CCC: entidad (4 cifras), oficina (4), dos dígitos de control y número de cuenta (10). Esos dos dígitos tienen su propia fórmula, con pesos 1, 2, 4, 8, 5, 10, 9, 7, 3 y 6, y el validador también la comprueba: un IBAN puede cuadrar por fuera y tener mal la cuenta. Si pegas un CCC de 20 cifras, te da su IBAN.

La pestaña Generar crea IBAN españoles con códigos de entidades reales y cuentas al azar, con todos los dígitos de control correctos, para rellenar formularios de prueba. Ni lo que escribes ni lo que generas se guarda en el navegador: un número de cuenta es un dato financiero.
```

`src/tools/iban/content.en.md`:
```md
## How an IBAN is validated

An IBAN starts with a country code and two check digits, followed by the national account number (the BBAN). To check it, the first four characters are moved to the end, each letter becomes two digits (A = 10, B = 11… Z = 35) and the resulting number divided by 97 must leave a remainder of 1. The validator does that digit by digit, so it handles IBANs of up to 34 characters without losing precision, and before that it checks that the country uses IBAN and that the length is right for it: 24 in Spain, 27 in France, 22 in Germany.

## Spanish accounts: the CCC

In Spain the BBAN is the old CCC: bank (4 digits), branch (4), two check digits and account number (10). Those two digits have their own formula, with weights 1, 2, 4, 8, 5, 10, 9, 7, 3 and 6, and the validator checks it too: an IBAN can be consistent on the outside and still carry a wrong account. Paste a 20-digit CCC and you get its IBAN.

The Generate tab creates Spanish IBANs with real bank codes and random accounts, with every check digit right, to fill test forms. Neither what you type nor what you generate is stored in the browser: an account number is financial data.
```

- [ ] **Step 8: `src/tools/iban/Iban.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { DEFAULT_QUANTITY, MAX_LINES, MAX_QUANTITY, repeat, splitLines } from '../../lib/ids';
  import { randomSeed, seededRng } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import type { Locale } from '../types';
  import {
    formatCcc,
    formatIban,
    generateSpanishIban,
    validateIban,
    type IbanResult,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  let tab = $state<'validate' | 'generate'>('validate');
  // meta.rememberInput is false: an account number is personal and financial data.
  let input = $state('');
  let group = $state(true);
  let quantity = $state(DEFAULT_QUANTITY);
  let seed = $state('');
  let session = $state('');

  onMount(() => {
    session = randomSeed();
  });

  function countryName(code: string): string {
    try {
      return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
    } catch {
      return code;
    }
  }

  const split = $derived(splitLines(input));
  const results = $derived(split.lines.map((line) => ({ line, r: validateIban(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);

  function reason(r: IbanResult): string {
    if (r.ok) return countryName(r.country);
    switch (r.reason) {
      case 'country':
        return fill(s.errCountry, { c: r.country ?? '' });
      case 'length':
        return fill(s.errLength, {
          country: countryName(r.country ?? ''),
          n: r.expectedLength ?? 0,
          m: r.length ?? 0,
        });
      case 'checkRange':
        return s.errCheckRange;
      case 'checksum':
        return s.errChecksum;
      case 'ccc':
        return fill(s.errCcc, { e: r.expected ?? '' });
      case 'cccOnly':
        return fill(s.errCccOnly, { e: r.expected ?? '' });
      default:
        return s.errChars;
    }
  }

  const copyValidated = $derived(
    results.map((x) => (x.r.ok ? formatIban(x.r.iban) : x.line)).join('\n'),
  );

  const generated = $derived.by(() => {
    const key = seed.trim() || session;
    if (!key) return [];
    const rng = seededRng(key);
    return repeat(quantity, () => generateSpanishIban(rng));
  });
  const shown = $derived(generated.map((iban) => (group ? formatIban(iban) : iban)));
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'validate', label: meta.tabs![locale][0] },
      { value: 'generate', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    {#if tab === 'validate'}
      <Field id="iban-input" label={s.input} help={s.help}>
        {#snippet children({ describedby })}
          <TextArea
            id="iban-input"
            bind:value={input}
            rows={3}
            placeholder={s.placeholder}
            {describedby}
            invalid={single !== null && !single.ok}
          />
        {/snippet}
      </Field>

      <Display live label={s.result}>
        {#snippet head()}
          {#if results.length === 0}
            <Led state="idle" label={t(locale, 'led.idle')} />
          {:else if single}
            <Led
              state={single.ok ? 'ok' : 'bad'}
              label={single.ok ? s.valid : t(locale, 'led.bad')}
            />
          {:else}
            <span>{fill(s.count, { ok: okCount, bad: results.length - okCount })}</span>
          {/if}
        {/snippet}
        {#if results.length === 0}
          <p class="display-note">{s.empty}</p>
        {:else if single}
          {#if single.ok}
            <div class="display-value">{formatIban(single.iban)}</div>
            <dl class="display-kv">
              <dt>{s.country}</dt>
              <dd>{single.country} · {countryName(single.country)}</dd>
              {#if single.spain}
                <dt>{s.bank}</dt>
                <dd>{single.spain.bank}</dd>
                <dt>{s.branch}</dt>
                <dd>{single.spain.branch}</dd>
                <dt>{s.dc}</dt>
                <dd>{single.spain.dc}</dd>
                <dt>{s.account}</dt>
                <dd>{single.spain.account}</dd>
              {:else}
                <dt>{s.bban}</dt>
                <dd>{single.bban}</dd>
              {/if}
            </dl>
            {#if single.fromCcc}<p class="display-note">{s.fromCcc}</p>{/if}
          {:else}
            <p class="display-note">{reason(single)}</p>
          {/if}
        {:else}
          <div class="display-rows">
            {#each results as x, i (i)}
              <div class="display-row">
                <Led state={x.r.ok ? 'ok' : 'bad'} label={x.r.ok ? formatIban(x.r.iban) : x.line} />
                <span class="why">{reason(x.r)}</span>
              </div>
            {/each}
          </div>
          {#if split.truncated}<p class="display-note">
              {fill(s.truncated, { n: MAX_LINES })}
            </p>{/if}
        {/if}
      </Display>

      <div class="row">
        <CopyButton main value={copyValidated} {locale} />
        <Button variant="ghost" disabled={!input} onclick={() => (input = '')}>
          {t(locale, 'ui.clear')}
        </Button>
      </div>
    {:else}
      <Toggle bind:checked={group} label={s.group} />
      <div class="row top">
        <Field id="iban-quantity" label={t(locale, 'ui.quantity')}>
          <NumberInput id="iban-quantity" bind:value={quantity} min={1} max={MAX_QUANTITY} />
        </Field>
        <Field id="iban-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
          {#snippet children({ describedby })}
            <input
              id="iban-seed"
              class="control mono seed"
              type="text"
              autocomplete="off"
              spellcheck="false"
              aria-describedby={describedby}
              bind:value={seed}
            />
          {/snippet}
        </Field>
      </div>

      <div class="row">
        <Button variant="primary" icon="refresh-cw" onclick={() => (session = randomSeed())}>
          {t(locale, 'ui.generate')}
        </Button>
      </div>

      <Display label={s.generated}>
        <div class="display-rows">
          {#each generated as iban, i (i)}
            <div class="display-row">
              <span class="pair">
                <span>{shown[i]}</span>
                <span class="ccc">{formatCcc(iban)}</span>
              </span>
              <span class="copies">
                <CopyButton value={shown[i]} {locale} compact label={s.copyIban} />
                <CopyButton value={formatCcc(iban)} {locale} compact label={s.copyCcc} />
              </span>
            </div>
          {/each}
        </div>
      </Display>
      <p class="test-only">{t(locale, 'ui.testOnly')}</p>

      <div class="row">
        <CopyButton main value={shown.join('\n')} {locale} label={s.copyAll} />
      </div>
    {/if}
  </div>
</div>

<style>
  .top {
    align-items: flex-start;
  }
  .seed {
    width: 220px;
  }
  .why {
    flex: 1;
    text-align: right;
    font: 400 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--disp-dim);
  }
  .pair {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .ccc {
    font-size: 13px;
    color: var(--disp-dim);
  }
  .copies {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
  }
  .test-only {
    font-size: 13px;
    color: var(--text-dim);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as iban } from './iban/meta';
```
→
```ts
import { meta as iban } from './iban/meta';
```
y
```ts
  // iban,
```
→
```ts
  iban,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Iban from '../tools/iban/Iban.svelte';
```
→
```astro
import Iban from '../tools/iban/Iban.svelte';
```
y
```astro
{/* {id === 'iban' && <Iban client:load locale={locale} />} */}
```
→
```astro
{id === 'iban' && <Iban client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/validador-iban.html dist/en/iban-validator.html
```
Expected: todo en verde, incluido `registry.test.ts` (título ≤ 65, descripción 51–160, slugs, icono y los dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobar en el navegador (script desechable)**

Crea `check-iban.mjs` en la raíz del worktree (no se confirma nunca):
```js
// Throwaway browser check for the iban task. Never committed: delete it after running.
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const PORT = 4703;
const server = spawn('node_modules/.bin/astro', ['preview', '--port', String(PORT), '--ignore-lock'], {
  stdio: 'ignore',
});
const base = `http://localhost:${PORT}`;
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`${base}/es`)).ok) break;
  } catch {
    // Not listening yet.
  }
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch();
const page = await browser.newPage({ locale: 'es-ES', viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(5000);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => page.locator('.panel').getByText(text).first().waitFor();
const rows = async (n, display) => {
  const scope = display ? page.getByRole('region', { name: display }) : page.locator('.panel');
  const count = await scope.locator('.display-row').count();
  if (count !== n) throw new Error(`expected ${n} rows, got ${count}`);
};
const nothingStored = async (id, typed) => {
  await page.waitForTimeout(500);
  const hits = await page.evaluate(
    ([k, t]) => Object.entries(localStorage).filter(([key, v]) => key.includes(k) || v.includes(t)),
    [id, typed],
  );
  if (hits.length) throw new Error(`stored: ${JSON.stringify(hits)}`);
};
try {
  await page.goto(`${base}/es/validador-iban`);
  await page.locator('astro-island[ssr]').first().waitFor({ state: 'detached' });
  await page.locator('#iban-input').fill('ES91 2100 0418 4502 0005 1332');
  await see('IBAN válido');
  await see('0200051332');
  await page.locator('#iban-input').fill('2100 0418 45 0200051332');
  await see('Era un CCC válido: este es su IBAN.');
  await page.getByRole('radio', { name: 'Generar', exact: true }).click();
  await page.locator('#iban-seed').fill('demo');
  await rows(10);
  await nothingStored('iban', '0200051332');
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`horizontal scroll at ${width} px`);
  }
  for (const theme of ['light', 'dark', 'terminal']) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await page.screenshot({ path: `check-iban-${theme}.png`, fullPage: true });
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK iban');
} finally {
  await browser.close();
  server.kill();
}
```

Run:
```bash
pnpm build && node check-iban.mjs
```
Expected: `OK iban`. El script comprueba que el IBAN de ejemplo muestra la cuenta, un CCC suelto da su IBAN, Generar da 10 filas y nada se guarda. También comprueba que no hay scroll horizontal a 390 px ni a 1280 px y guarda una captura por tema (`check-iban-light.png`, `-dark.png`, `-terminal.png`): ábrelas y confirma que los resultados se leen en la pantalla hundida y que nada se sale del panel en ningún tema.

Después, bórralo todo:
```bash
rm check-iban.mjs check-iban-*.png
```

- [ ] **Step 12: Commit**

```bash
git add src/tools/iban src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni el script ni las capturas). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(iban): validador de IBAN de 102 países, CCC y generador español"
```

---

### Task 4: Matrículas: actuales y provinciales, con posición en la serie

**Files:**
- Create: `src/tools/plate/logic.ts`, `src/tools/plate/logic.test.ts`, `src/tools/plate/meta.ts`, `src/tools/plate/strings.ts`, `src/tools/plate/content.es.md`, `src/tools/plate/content.en.md`, `src/tools/plate/Plate.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `splitLines`, `repeat`, `MAX_LINES`, `MAX_QUANTITY`, `DEFAULT_QUANTITY` (`lib/ids`); `PROVINCES`, `provinceByPlate`, `Province` (`lib/provinces`); `digits`, `pick`, `randInt`, `randomSeed`, `seededRng`, `Rng` (`lib/random`); `persistedInput`; `fill`; `t`; kit: `Field`, `TextArea`, `Display`, `Led`, `CopyButton`, `Button`, `Segmented`, `NumberInput`, `Toggle`.
- Produces: `PLATE_LETTERS`, `OLD_LETTERS`, `CURRENT_TOTAL`, `type PlateReason`, `type PlateResult`; `platePosition(num, letters)`, `validatePlate(raw)`, **`generatePlate(rng: Rng): string`** (contrato), `generateOldPlate(rng)`. Además `meta: ToolMeta` (id `plate`, slugs de la tabla de arriba), `strings: Record<Locale, …>` y el componente `Plate` con props `{ locale: Locale }`.
- DOM para la Task 12: `#plate-input`, `#plate-quantity`, `#plate-seed`; `.display-kv` con formato y posición o provincia.

**§6.4 (vinculante).** Cómo se cubre cada punto:
- Actual: 4 cifras + 3 de las 20 consonantes; admite espacio, guion o nada y normaliza a `1234 BCD`. «La letra A no se usa en las matrículas actuales: solo consonantes, sin Ñ ni Q.»
- Posición en la serie con la fórmula del spec **más 1**, para que `0000 BBB` sea la 1 y `9999 ZZZ` la 80 000 000 («1 de 80.000.000»). Es la única lectura razonable de «posición» para una persona; queda anotado en la revisión final.
- Provincial: siglas de `provinces.ts`, 4 cifras y 1 o 2 letras A–Z sin Ñ ni Q, normalizada a `M-1234-AB` con la provincia; «XX no es la sigla de ninguna provincia.»
- Ciclomotor, históricas, temporales, diplomáticas y anteriores a 1971 → mensaje de fuera de alcance (`special`).
- Generar: Segmented secundario Actual · Provincial; la provincial elige provincia, una de sus siglas y 1 o 2 letras al 50 %.
- `rememberInput: true` sin `shouldSave`: una matrícula está a la vista.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-plate -b lote-1/plate   # desde el commit de la Task 0
cd ../devtools-plate
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`.

- [ ] **Step 2: Test (falla)**

`src/tools/plate/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import {
  CURRENT_TOTAL,
  PLATE_LETTERS,
  generateOldPlate,
  generatePlate,
  platePosition,
  validatePlate,
} from './logic';

describe('current plates (since 2000)', () => {
  it('uses 20 consonants: no vowels, no Ñ, no Q', () => {
    expect(PLATE_LETTERS).toHaveLength(20);
    expect(PLATE_LETTERS).not.toMatch(/[AEIOUÑQ]/);
  });

  it('accepts a space, a dash or nothing, and normalizes to "1234 BCD"', () => {
    for (const p of ['1234 BCD', '1234-BCD', '1234bcd', ' 1234 - bcd ']) {
      expect(validatePlate(p)).toMatchObject({
        ok: true,
        format: 'current',
        normalized: '1234 BCD',
      });
    }
  });

  it('gives the position in the series', () => {
    expect(validatePlate('0000 BBB')).toMatchObject({ ok: true, position: 1 });
    expect(validatePlate('9999 ZZZ')).toMatchObject({ ok: true, position: CURRENT_TOTAL });
    // ((0 × 20 + 1) × 20 + 2) × 10 000 + 1234 + 1
    expect(platePosition('1234', 'BCD')).toBe(221_235);
  });

  it('says which letter is not allowed', () => {
    expect(validatePlate('1234 BCA')).toEqual({ ok: false, reason: 'letter', char: 'A' });
    expect(validatePlate('1234 BQD')).toEqual({ ok: false, reason: 'letter', char: 'Q' });
    expect(validatePlate('1234 ÑBC')).toEqual({ ok: false, reason: 'letter', char: 'Ñ' });
  });

  it('rejects other shapes', () => {
    expect(validatePlate('123 BCD')).toEqual({ ok: false, reason: 'format' });
    expect(validatePlate('1234 BC')).toEqual({ ok: false, reason: 'format' });
    expect(validatePlate('')).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('old provincial plates (1971–2000)', () => {
  it('accepts one or two letters at the end and shows the province', () => {
    const r = validatePlate('M-1234-AB');
    expect(r).toMatchObject({ ok: true, format: 'old', normalized: 'M-1234-AB', prefix: 'M' });
    expect(r.ok && r.format === 'old' && r.province.name).toBe('Madrid');
    expect(validatePlate('gi 5678 z')).toMatchObject({ ok: true, normalized: 'GI-5678-Z' });
    expect(validatePlate('PM-0001-A')).toMatchObject({ ok: true, prefix: 'PM' });
  });

  it('rejects unknown prefixes', () => {
    expect(validatePlate('XX-1234-AB')).toEqual({ ok: false, reason: 'province', prefix: 'XX' });
  });

  it('rejects Ñ and Q in the old letters', () => {
    expect(validatePlate('M-1234-QA')).toEqual({ ok: false, reason: 'oldLetter', char: 'Q' });
  });

  it('leaves special and pre-1971 plates out of scope', () => {
    expect(validatePlate('C 1234 BCD')).toEqual({ ok: false, reason: 'special' });
    expect(validatePlate('M-123456')).toEqual({ ok: false, reason: 'special' });
  });
});

describe('generators', () => {
  it('round-trip: 1 000 current plates with seed "test" are all valid', () => {
    const rng = seededRng('test');
    for (let i = 0; i < 1000; i++) {
      const plate = generatePlate(rng);
      expect(plate).toMatch(/^\d{4} [BCDFGHJKLMNPRSTVWXYZ]{3}$/);
      expect(validatePlate(plate).ok, plate).toBe(true);
    }
  });

  it('round-trip: 1 000 old plates with seed "test" are all valid, with 1 or 2 letters', () => {
    const rng = seededRng('test');
    const ends = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      const plate = generateOldPlate(rng);
      const r = validatePlate(plate);
      expect(r.ok, plate).toBe(true);
      expect(r.ok && r.normalized).toBe(plate);
      ends.add(plate.split('-')[2].length);
    }
    expect([...ends].sort()).toEqual([1, 2]);
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/plate`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/plate/logic.ts`**

```ts
import { PROVINCES, provinceByPlate, type Province } from '../../lib/provinces';
import { digits, pick, randInt, type Rng } from '../../lib/random';

/** Current plates (since 2000): 20 consonants, no vowels, no Ñ and no Q. */
export const PLATE_LETTERS = 'BCDFGHJKLMNPRSTVWXYZ';
/** Old provincial plates (1971–2000): A–Z without Ñ and Q. */
export const OLD_LETTERS = 'ABCDEFGHIJKLMNOPRSTUVWXYZ';
/** 20³ letter combinations × 10 000 numbers. */
export const CURRENT_TOTAL = 80_000_000;

export type PlateReason = 'empty' | 'format' | 'letter' | 'oldLetter' | 'province' | 'special';

export type PlateResult =
  | {
      ok: true;
      format: 'current';
      normalized: string;
      /** 1-based place in the series: 0000 BBB is 1 and 9999 ZZZ is 80 000 000. */
      position: number;
    }
  | { ok: true; format: 'old'; normalized: string; prefix: string; province: Province }
  | {
      ok: false;
      reason: PlateReason;
      /** The letter that is not allowed. */
      char?: string;
      /** The provincial prefix that does not exist. */
      prefix?: string;
    };

function compactPlate(raw: string): string {
  return raw.toUpperCase().replace(/[\s.-]/g, '');
}

/** ((i1 × 20 + i2) × 20 + i3) × 10 000 + number, plus 1 so the first plate is number 1. */
export function platePosition(num: string, letters: string): number {
  const [a, b, c] = [...letters].map((l) => PLATE_LETTERS.indexOf(l));
  return ((a * 20 + b) * 20 + c) * 10_000 + Number(num) + 1;
}

export function validatePlate(raw: string): PlateResult {
  const s = compactPlate(raw);
  if (!s) return { ok: false, reason: 'empty' };

  if (/^\d/.test(s)) {
    const m = /^(\d{4})([A-ZÑ]{3})$/.exec(s);
    if (!m) return { ok: false, reason: 'format' };
    const [, num, letters] = m;
    const bad = [...letters].find((l) => !PLATE_LETTERS.includes(l));
    if (bad) return { ok: false, reason: 'letter', char: bad };
    return {
      ok: true,
      format: 'current',
      normalized: `${num} ${letters}`,
      position: platePosition(num, letters),
    };
  }

  // Mopeds (C 1234 BCD), historic, temporary and diplomatic plates, and pre-1971 ones (M-123456).
  if (/^[A-Z]{1,2}\d{4}[A-Z]{3}$/.test(s) || /^[A-Z]{1,2}\d{5,6}$/.test(s)) {
    return { ok: false, reason: 'special' };
  }

  const m = /^([A-Z]{1,2})(\d{4})([A-ZÑ]{1,2})$/.exec(s);
  if (!m) return { ok: false, reason: 'format' };
  const [, prefix, num, letters] = m;
  const province = provinceByPlate(prefix);
  if (!province) return { ok: false, reason: 'province', prefix };
  const bad = [...letters].find((l) => !OLD_LETTERS.includes(l));
  if (bad) return { ok: false, reason: 'oldLetter', char: bad };
  return { ok: true, format: 'old', normalized: `${prefix}-${num}-${letters}`, prefix, province };
}

function letters(rng: Rng, alphabet: string, n: number): string {
  let out = '';
  for (let i = 0; i < n; i++) out += alphabet[randInt(rng, 0, alphabet.length - 1)];
  return out;
}

/** Current format: `1234 BCD`. */
export function generatePlate(rng: Rng): string {
  return `${digits(rng, 4)} ${letters(rng, PLATE_LETTERS, 3)}`;
}

/** Old provincial format: `M-1234-AB`, with one or two letters at 50 %. */
export function generateOldPlate(rng: Rng): string {
  const province = pick(rng, PROVINCES);
  const prefix = pick(rng, province.plates);
  const num = digits(rng, 4);
  return `${prefix}-${num}-${letters(rng, OLD_LETTERS, randInt(rng, 1, 2))}`;
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/plate`
Expected: PASS, incluido el test de ida y vuelta de 1 000 valores si la herramienta genera.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/plate/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'plate',
  category: 'ids',
  icon: 'car',
  slug: { es: 'validador-matriculas', en: 'spanish-license-plate-validator' },
  name: { es: 'Matrículas', en: 'License plates' },
  title: {
    es: 'Validador y generador de matrículas españolas',
    en: 'Spanish license plate validator and generator',
  },
  description: {
    es: 'Comprueba matrículas españolas actuales (1234 BCD) y provinciales (M-1234-AB), dice su provincia o su posición en la serie y genera matrículas de prueba.',
    en: 'Check current (1234 BCD) and old provincial (M-1234-AB) Spanish license plates, see their province or place in the series and generate test plates.',
  },
  keywords: {
    es: [
      'validar matricula',
      'matricula española',
      'formato matricula',
      'generador matriculas',
      'matricula provincial',
    ],
    en: [
      'spanish license plate',
      'license plate validator',
      'plate format spain',
      'license plate generator',
    ],
  },
  tabs: { es: ['Validar', 'Generar'], en: ['Validate', 'Generate'] },
  rememberInput: true,
};
```

`src/tools/plate/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    mode: 'Modo',
    input: 'Matrícula',
    placeholder: '1234 BCD\nM-1234-AB',
    help: 'Una por línea, hasta 1000.',
    result: 'Resultado',
    empty: 'Escribe una matrícula actual (1234 BCD) o provincial (M-1234-AB).',
    valid: 'Matrícula válida',
    count: '{ok} válidas · {bad} no válidas',
    truncated: 'Solo se comprueban las primeras {n} líneas.',
    format: 'Formato',
    current: 'Actual (desde 2000)',
    old: 'Provincial (1971–2000)',
    position: 'Posición en la serie',
    positionValue: '{n} de {total}',
    province: 'Provincia',
    errLetter: 'La letra {c} no se usa en las matrículas actuales: solo consonantes, sin Ñ ni Q.',
    errOldLetter:
      'La letra {c} no se usa en las matrículas provinciales: van de la A a la Z, sin Ñ ni Q.',
    errProvince: '{p} no es la sigla de ninguna provincia.',
    errSpecial:
      'Las matrículas de ciclomotor, históricas, temporales, diplomáticas y anteriores a 1971 no están incluidas.',
    errFormat:
      'Formato no reconocido: una matrícula actual son 4 cifras y 3 letras (1234 BCD) y una provincial, sigla, 4 cifras y 1 o 2 letras (M-1234-AB).',
    kind: 'Formato',
    generated: 'Matrículas generadas',
    copyAll: 'Copiar todas',
  },
  en: {
    mode: 'Mode',
    input: 'License plate',
    placeholder: '1234 BCD\nM-1234-AB',
    help: 'One per line, up to 1000.',
    result: 'Result',
    empty: 'Type a current plate (1234 BCD) or an old provincial one (M-1234-AB).',
    valid: 'Valid plate',
    count: '{ok} valid · {bad} not valid',
    truncated: 'Only the first {n} lines are checked.',
    format: 'Format',
    current: 'Current (since 2000)',
    old: 'Provincial (1971–2000)',
    position: 'Place in the series',
    positionValue: '{n} of {total}',
    province: 'Province',
    errLetter: 'The letter {c} is not used on current plates: consonants only, no Ñ or Q.',
    errOldLetter: 'The letter {c} is not used on provincial plates: A to Z, without Ñ or Q.',
    errProvince: '{p} is not the prefix of any province.',
    errSpecial: 'Moped, historic, temporary, diplomatic and pre-1971 plates are not included.',
    errFormat:
      'Unrecognised format: a current plate is 4 digits and 3 letters (1234 BCD) and a provincial one is a prefix, 4 digits and 1 or 2 letters (M-1234-AB).',
    kind: 'Format',
    generated: 'Generated plates',
    copyAll: 'Copy all',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/plate/content.es.md`:
```md
## Los dos formatos

Desde septiembre del 2000 las matrículas españolas son nacionales: 4 cifras y 3 letras (`1234 BCD`), sin referencia a la provincia. Las letras son solo consonantes y sin Ñ ni Q, para que no se formen palabras ni se confundan la Q con la O o el 0. Eso deja 20 letras posibles, y la serie avanza de forma ordenada: primero las cifras y luego las letras de derecha a izquierda. Por eso el validador puede decirte la posición de una matrícula en la serie, de 1 a 80 millones, y saber cuál de dos coches se matriculó después.

Entre 1971 y 2000 se usó el formato provincial: la sigla de la provincia (`M` para Madrid, `GI` o `GE` para Girona), 4 cifras y 1 o 2 letras (`M-1234-AB`). El validador reconoce todas las siglas y te dice la provincia.

## Qué queda fuera

No se comprueba si una combinación concreta llegó a emitirse, ni se calcula el año. Las matrículas de ciclomotor (`C 1234 BCD`), históricas, temporales y diplomáticas, y las anteriores a 1971, tienen formatos propios que esta herramienta no valida. La pestaña Generar crea matrículas actuales o provinciales con un formato correcto para datos de prueba.
```

`src/tools/plate/content.en.md`:
```md
## The two formats

Since September 2000 Spanish plates are national: 4 digits and 3 letters (`1234 BCD`), with no reference to a province. The letters are consonants only, without Ñ or Q, so that no words are formed and Q is not mistaken for O or 0. That leaves 20 letters, and the series moves forward in order: first the digits, then the letters from right to left. That is why the validator can tell you a plate’s place in the series, from 1 to 80 million, and which of two cars was registered later.

Between 1971 and 2000 the provincial format was used: the province prefix (`M` for Madrid, `GI` or `GE` for Girona), 4 digits and 1 or 2 letters (`M-1234-AB`). The validator knows every prefix and tells you the province.

## What is left out

It does not check whether a given combination was actually issued, and it does not work out the year. Moped plates (`C 1234 BCD`), historic, temporary and diplomatic plates, and those from before 1971 have their own formats that this tool does not validate. The Generate tab creates current or provincial plates with a correct format for test data.
```

- [ ] **Step 8: `src/tools/plate/Plate.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { DEFAULT_QUANTITY, MAX_LINES, MAX_QUANTITY, repeat, splitLines } from '../../lib/ids';
  import { randomSeed, seededRng } from '../../lib/random';
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
  import {
    CURRENT_TOTAL,
    generateOldPlate,
    generatePlate,
    validatePlate,
    type PlateResult,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  // A plate is on public view on the road: it is not a secret.
  const input = persistedInput('plate', '', meta.rememberInput ?? true);

  let tab = $state<'validate' | 'generate'>('validate');
  let kind = $state<'current' | 'old'>('current');
  let quantity = $state(DEFAULT_QUANTITY);
  let seed = $state('');
  let session = $state('');

  onMount(() => {
    session = randomSeed();
  });

  const nf = $derived(new Intl.NumberFormat(locale));
  const split = $derived(splitLines(input.value));
  const results = $derived(split.lines.map((line) => ({ line, r: validatePlate(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);

  function reason(r: PlateResult): string {
    if (r.ok) return r.format === 'current' ? s.current : r.province.name;
    switch (r.reason) {
      case 'letter':
        return fill(s.errLetter, { c: r.char ?? '' });
      case 'oldLetter':
        return fill(s.errOldLetter, { c: r.char ?? '' });
      case 'province':
        return fill(s.errProvince, { p: r.prefix ?? '' });
      case 'special':
        return s.errSpecial;
      default:
        return s.errFormat;
    }
  }

  const copyValidated = $derived(results.map((x) => (x.r.ok ? x.r.normalized : x.line)).join('\n'));

  const generated = $derived.by(() => {
    const key = seed.trim() || session;
    if (!key) return [];
    const rng = seededRng(key);
    return repeat(quantity, () =>
      kind === 'current' ? generatePlate(rng) : generateOldPlate(rng),
    );
  });
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'validate', label: meta.tabs![locale][0] },
      { value: 'generate', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    {#if tab === 'validate'}
      <Field id="plate-input" label={s.input} help={s.help}>
        {#snippet children({ describedby })}
          <TextArea
            id="plate-input"
            bind:value={input.value}
            rows={3}
            placeholder={s.placeholder}
            {describedby}
            invalid={single !== null && !single.ok}
          />
        {/snippet}
      </Field>

      <Display live label={s.result}>
        {#snippet head()}
          {#if results.length === 0}
            <Led state="idle" label={t(locale, 'led.idle')} />
          {:else if single}
            <Led
              state={single.ok ? 'ok' : 'bad'}
              label={single.ok ? s.valid : t(locale, 'led.bad')}
            />
          {:else}
            <span>{fill(s.count, { ok: okCount, bad: results.length - okCount })}</span>
          {/if}
        {/snippet}
        {#if results.length === 0}
          <p class="display-note">{s.empty}</p>
        {:else if single}
          {#if single.ok}
            <div class="display-value">{single.normalized}</div>
            <dl class="display-kv">
              <dt>{s.format}</dt>
              <dd>{single.format === 'current' ? s.current : s.old}</dd>
              {#if single.format === 'current'}
                <dt>{s.position}</dt>
                <dd>
                  {fill(s.positionValue, {
                    n: nf.format(single.position),
                    total: nf.format(CURRENT_TOTAL),
                  })}
                </dd>
              {:else}
                <dt>{s.province}</dt>
                <dd>{single.province.name}</dd>
              {/if}
            </dl>
          {:else}
            <p class="display-note">{reason(single)}</p>
          {/if}
        {:else}
          <div class="display-rows">
            {#each results as x, i (i)}
              <div class="display-row">
                <Led state={x.r.ok ? 'ok' : 'bad'} label={x.r.ok ? x.r.normalized : x.line} />
                <span class="why">{reason(x.r)}</span>
              </div>
            {/each}
          </div>
          {#if split.truncated}<p class="display-note">
              {fill(s.truncated, { n: MAX_LINES })}
            </p>{/if}
        {/if}
      </Display>

      <div class="row">
        <CopyButton main value={copyValidated} {locale} />
        <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}>
          {t(locale, 'ui.clear')}
        </Button>
      </div>
      <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
    {:else}
      <div class="stack tight">
        <span class="label">{s.kind}</span>
        <Segmented
          label={s.kind}
          options={[
            { value: 'current', label: s.current },
            { value: 'old', label: s.old },
          ]}
          bind:value={kind}
        />
      </div>
      <div class="row top">
        <Field id="plate-quantity" label={t(locale, 'ui.quantity')}>
          <NumberInput id="plate-quantity" bind:value={quantity} min={1} max={MAX_QUANTITY} />
        </Field>
        <Field id="plate-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
          {#snippet children({ describedby })}
            <input
              id="plate-seed"
              class="control mono seed"
              type="text"
              autocomplete="off"
              spellcheck="false"
              aria-describedby={describedby}
              bind:value={seed}
            />
          {/snippet}
        </Field>
      </div>

      <div class="row">
        <Button variant="primary" icon="refresh-cw" onclick={() => (session = randomSeed())}>
          {t(locale, 'ui.generate')}
        </Button>
      </div>

      <Display label={s.generated}>
        <div class="display-rows">
          {#each generated as v, i (i)}
            <div class="display-row">
              <span>{v}</span>
              <CopyButton value={v} {locale} compact />
            </div>
          {/each}
        </div>
      </Display>
      <p class="test-only">{t(locale, 'ui.testOnly')}</p>

      <div class="row">
        <CopyButton main value={generated.join('\n')} {locale} label={s.copyAll} />
      </div>
    {/if}
  </div>
</div>

<style>
  .tight {
    gap: 8px;
  }
  .top {
    align-items: flex-start;
  }
  .label {
    font-size: 13px;
    font-weight: 600;
  }
  .seed {
    width: 220px;
  }
  .why {
    flex: 1;
    text-align: right;
    font: 400 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--disp-dim);
  }
  .test-only {
    font-size: 13px;
    color: var(--text-dim);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as plate } from './plate/meta';
```
→
```ts
import { meta as plate } from './plate/meta';
```
y
```ts
  // plate,
```
→
```ts
  plate,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Plate from '../tools/plate/Plate.svelte';
```
→
```astro
import Plate from '../tools/plate/Plate.svelte';
```
y
```astro
{/* {id === 'plate' && <Plate client:load locale={locale} />} */}
```
→
```astro
{id === 'plate' && <Plate client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/validador-matriculas.html dist/en/spanish-license-plate-validator.html
```
Expected: todo en verde, incluido `registry.test.ts` (título ≤ 65, descripción 51–160, slugs, icono y los dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobar en el navegador (script desechable)**

Crea `check-plate.mjs` en la raíz del worktree (no se confirma nunca):
```js
// Throwaway browser check for the plate task. Never committed: delete it after running.
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const PORT = 4704;
const server = spawn('node_modules/.bin/astro', ['preview', '--port', String(PORT), '--ignore-lock'], {
  stdio: 'ignore',
});
const base = `http://localhost:${PORT}`;
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`${base}/es`)).ok) break;
  } catch {
    // Not listening yet.
  }
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch();
const page = await browser.newPage({ locale: 'es-ES', viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(5000);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => page.locator('.panel').getByText(text).first().waitFor();
const rows = async (n, display) => {
  const scope = display ? page.getByRole('region', { name: display }) : page.locator('.panel');
  const count = await scope.locator('.display-row').count();
  if (count !== n) throw new Error(`expected ${n} rows, got ${count}`);
};
const nothingStored = async (id, typed) => {
  await page.waitForTimeout(500);
  const hits = await page.evaluate(
    ([k, t]) => Object.entries(localStorage).filter(([key, v]) => key.includes(k) || v.includes(t)),
    [id, typed],
  );
  if (hits.length) throw new Error(`stored: ${JSON.stringify(hits)}`);
};
try {
  await page.goto(`${base}/es/validador-matriculas`);
  await page.locator('astro-island[ssr]').first().waitFor({ state: 'detached' });
  await page.locator('#plate-input').fill('1234 BCA');
  await see('La letra A no se usa en las matrículas actuales');
  await page.locator('#plate-input').fill('M-1234-AB');
  await see('Madrid');
  await page.locator('#plate-input').fill('0000 BBB');
  await see('1 de 80.000.000');
  await page.getByRole('radio', { name: 'Generar', exact: true }).click();
  await page.getByRole('radio', { name: 'Provincial (1971–2000)', exact: true }).click();
  await page.locator('#plate-seed').fill('demo');
  await rows(10);
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`horizontal scroll at ${width} px`);
  }
  for (const theme of ['light', 'dark', 'terminal']) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await page.screenshot({ path: `check-plate-${theme}.png`, fullPage: true });
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK plate');
} finally {
  await browser.close();
  server.kill();
}
```

Run:
```bash
pnpm build && node check-plate.mjs
```
Expected: `OK plate`. El script comprueba que `1234 BCA` explica la A, `M-1234-AB` es Madrid, `0000 BBB` es «1 de 80.000.000» y Generar provincial da 10 filas. También comprueba que no hay scroll horizontal a 390 px ni a 1280 px y guarda una captura por tema (`check-plate-light.png`, `-dark.png`, `-terminal.png`): ábrelas y confirma que los resultados se leen en la pantalla hundida y que nada se sale del panel en ningún tema.

Después, bórralo todo:
```bash
rm check-plate.mjs check-plate-*.png
```

- [ ] **Step 12: Commit**

```bash
git add src/tools/plate src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni el script ni las capturas). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(plate): matrículas actuales y provinciales, con generador"
```

---

### Task 5: Número de la Seguridad Social: las dos ramas del control

**Files:**
- Create: `src/tools/nss/logic.ts`, `src/tools/nss/logic.test.ts`, `src/tools/nss/meta.ts`, `src/tools/nss/strings.ts`, `src/tools/nss/content.es.md`, `src/tools/nss/content.en.md`, `src/tools/nss/Nss.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `splitLines`, `repeat`, `MAX_LINES`, `MAX_QUANTITY`, `DEFAULT_QUANTITY` (`lib/ids`); `PROVINCES`, `provinceByCode`, `Province` (`lib/provinces`); `pick`, `randInt`, `randomSeed`, `seededRng`, `Rng` (`lib/random`); `fill`; `t`; kit: `Field`, `TextArea`, `Display`, `Led`, `CopyButton`, `Button`, `Segmented`, `NumberInput`, `Select`.
- Produces: `type NssReason`, `type NssResult`; `nssControl(a, b)`, `validateNss(raw)`, **`generateNss(rng: Rng, province?: string): string`** (contrato). Además `meta: ToolMeta` (id `nss`, slugs de la tabla de arriba), `strings: Record<Locale, …>` y el componente `Nss` con props `{ locale: Locale }`.
- DOM para la Task 12: `#nss-input`, `#nss-province`, `#nss-quantity`, `#nss-seed`.

**§6.5 (vinculante).** Cómo se cubre cada punto:
- Las dos ramas del spec y sus bordes (Review Focus 1); ejemplos `28 12345678 40` y `08 01234567 74` (no 17).
- Acepta `/`, espacios, puntos y guiones; muestra `28/12345678/40` y la provincia.
- Provincia fuera de 01–52: aviso (LED `ok` + nota «Provincia no reconocida (66). El número puede ser válido igualmente.»), no error.
- «El control no cuadra: debería ser 40.» y «Faltan cifras: son 12 (2 de provincia, 8 de número y 2 de control)».
- Generar: `Select` de provincia («Cualquiera» por defecto) y `b` en 0–99 999 999, así que salen las dos ramas (el test de ida y vuelta lo comprueba).
- `rememberInput: false`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-nss -b lote-1/nss   # desde el commit de la Task 0
cd ../devtools-nss
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`.

- [ ] **Step 2: Test (falla)**

`src/tools/nss/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import { generateNss, nssControl, validateNss } from './logic';

describe('nssControl: the two branches', () => {
  it('matches the published example 28 12345678 40 (second branch)', () => {
    expect(nssControl(28, 12_345_678)).toBe('40');
  });

  it('uses b + a × 10^7 when b < 10 000 000 (08 01234567 74, not 17)', () => {
    expect(nssControl(8, 1_234_567)).toBe('74');
    // The brief's single formula a × 10^8 + b would give 17: this pins the first branch.
    expect(String((8 * 100_000_000 + 1_234_567) % 97)).toBe('17');
  });

  it('switches branch exactly between 9 999 999 and 10 000 000', () => {
    // 9 999 999 + 28 × 10^7 = 289 999 999 → mod 97 = 69
    expect(nssControl(28, 9_999_999)).toBe('69');
    // 28 × 10^8 + 10 000 000 = 2 810 000 000 → mod 97 = 16
    expect(nssControl(28, 10_000_000)).toBe('16');
  });
});

describe('validateNss', () => {
  it('accepts separators and shows the province', () => {
    for (const n of ['28/12345678/40', '28 12345678 40', '281234567840', '28-12345678-40']) {
      const r = validateNss(n);
      expect(r).toMatchObject({
        ok: true,
        normalized: '281234567840',
        formatted: '28/12345678/40',
      });
      expect(r.ok && r.province?.name).toBe('Madrid');
    }
    expect(validateNss('08 01234567 74')).toMatchObject({ ok: true, provinceCode: '08' });
  });

  it('says what the control should be', () => {
    expect(validateNss('281234567841')).toEqual({ ok: false, reason: 'control', expected: '40' });
    expect(validateNss('080123456717')).toEqual({ ok: false, reason: 'control', expected: '74' });
  });

  it('accepts unknown province codes, which the page shows as a warning', () => {
    const b = 12_345_678;
    const r = validateNss(`66${b}${nssControl(66, b)}`);
    expect(r).toMatchObject({ ok: true, provinceCode: '66', province: undefined });
  });

  it('reports missing, extra and non-digit characters', () => {
    expect(validateNss('28123456784')).toEqual({ ok: false, reason: 'fewDigits', length: 11 });
    expect(validateNss('2812345678400')).toEqual({ ok: false, reason: 'manyDigits', length: 13 });
    expect(validateNss('28A234567840')).toEqual({ ok: false, reason: 'chars' });
    expect(validateNss('  ')).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('generateNss', () => {
  it('round-trip: 1 000 values with seed "test" are all valid and hit both branches', () => {
    const rng = seededRng('test');
    let low = 0;
    for (let i = 0; i < 1000; i++) {
      const nss = generateNss(rng);
      expect(nss).toMatch(/^\d{12}$/);
      const r = validateNss(nss);
      expect(r.ok, nss).toBe(true);
      expect(r.ok && r.province).toBeTruthy();
      if (Number(nss.slice(2, 10)) < 10_000_000) low++;
    }
    expect(low).toBeGreaterThan(50);
  });

  it('uses the chosen province', () => {
    const rng = seededRng('prov');
    for (let i = 0; i < 20; i++) expect(generateNss(rng, '46').slice(0, 2)).toBe('46');
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/nss`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/nss/logic.ts`**

```ts
import { PROVINCES, provinceByCode, type Province } from '../../lib/provinces';
import { pick, randInt, type Rng } from '../../lib/random';

export type NssReason = 'empty' | 'chars' | 'fewDigits' | 'manyDigits' | 'control';

export type NssResult =
  | {
      ok: true;
      /** 12 digits. */
      normalized: string;
      /** `28/12345678/40`. */
      formatted: string;
      provinceCode: string;
      /** Undefined for codes outside 01–52: a warning, not an error. */
      province: Province | undefined;
    }
  | { ok: false; reason: NssReason; length?: number; expected?: string };

/**
 * Two branches (Intervia, Forosdelweb and Box4Dev agree):
 * b < 10 000 000 → d = b + a × 10 000 000; otherwise d = a × 100 000 000 + b. Control = d mod 97.
 */
export function nssControl(a: number, b: number): string {
  const d = b < 10_000_000 ? b + a * 10_000_000 : a * 100_000_000 + b;
  return String(d % 97).padStart(2, '0');
}

export function validateNss(raw: string): NssResult {
  const s = raw.replace(/[\s./-]/g, '');
  if (!s) return { ok: false, reason: 'empty' };
  if (!/^\d+$/.test(s)) return { ok: false, reason: 'chars' };
  if (s.length < 12) return { ok: false, reason: 'fewDigits', length: s.length };
  if (s.length > 12) return { ok: false, reason: 'manyDigits', length: s.length };
  const provinceCode = s.slice(0, 2);
  const expected = nssControl(Number(provinceCode), Number(s.slice(2, 10)));
  if (s.slice(10) !== expected) return { ok: false, reason: 'control', expected };
  return {
    ok: true,
    normalized: s,
    formatted: `${provinceCode}/${s.slice(2, 10)}/${s.slice(10)}`,
    provinceCode,
    province: provinceByCode(provinceCode),
  };
}

/** 12 digits. `b` covers 0–99 999 999, so both branches of the formula come out. */
export function generateNss(rng: Rng, province?: string): string {
  const code = province ?? pick(rng, PROVINCES).code;
  const b = randInt(rng, 0, 99_999_999);
  return code + String(b).padStart(8, '0') + nssControl(Number(code), b);
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/nss`
Expected: PASS, incluido el test de ida y vuelta de 1 000 valores si la herramienta genera.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/nss/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'nss',
  category: 'ids',
  icon: 'heart-pulse',
  slug: {
    es: 'validador-numero-seguridad-social',
    en: 'spanish-social-security-number-validator',
  },
  name: { es: 'Nº Seguridad Social', en: 'Social Security number' },
  title: {
    es: 'Validador y generador de número de la Seguridad Social',
    en: 'Spanish Social Security number (NSS) validator',
  },
  description: {
    es: 'Comprueba los dígitos de control del número de afiliación a la Seguridad Social (NSS), muestra su provincia y genera números ficticios para pruebas.',
    en: 'Check the control digits of a Spanish Social Security number (NSS), see its province and generate fictitious numbers for testing.',
  },
  keywords: {
    es: ['numero seguridad social', 'validar nss', 'numero afiliacion', 'naf', 'generador nss'],
    en: ['spanish social security number', 'nss validator', 'naf spain', 'nss generator'],
  },
  tabs: { es: ['Validar', 'Generar'], en: ['Validate', 'Generate'] },
  rememberInput: false,
};
```

`src/tools/nss/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    mode: 'Modo',
    input: 'Número de la Seguridad Social',
    placeholder: '28/12345678/40',
    help: 'Uno por línea, hasta 1000. Lo que escribes no se guarda en ningún sitio.',
    result: 'Resultado',
    empty: 'Escribe las 12 cifras, con o sin separadores (28/12345678/40).',
    valid: 'Número válido',
    count: '{ok} válidos · {bad} no válidos',
    truncated: 'Solo se comprueban las primeras {n} líneas.',
    province: 'Provincia',
    number: 'Número',
    control: 'Control',
    unknownProvince: 'Provincia no reconocida ({c}). El número puede ser válido igualmente.',
    errControl: 'El control no cuadra: debería ser {e}.',
    errFew: 'Faltan cifras: son 12 (2 de provincia, 8 de número y 2 de control).',
    errMany: 'Sobran cifras: son 12 (2 de provincia, 8 de número y 2 de control).',
    errChars: 'Solo cifras, con espacios, barras o guiones como separadores.',
    provinceLabel: 'Provincia',
    any: 'Cualquiera',
    generated: 'Números generados',
    copyAll: 'Copiar todos',
  },
  en: {
    mode: 'Mode',
    input: 'Social Security number',
    placeholder: '28/12345678/40',
    help: 'One per line, up to 1000. What you type is not stored anywhere.',
    result: 'Result',
    empty: 'Type the 12 digits, with or without separators (28/12345678/40).',
    valid: 'Valid number',
    count: '{ok} valid · {bad} not valid',
    truncated: 'Only the first {n} lines are checked.',
    province: 'Province',
    number: 'Number',
    control: 'Control',
    unknownProvince: 'Unknown province ({c}). The number may still be valid.',
    errControl: 'The control digits do not match: they should be {e}.',
    errFew:
      'Digits missing: there are 12 (2 for the province, 8 for the number and 2 for control).',
    errMany:
      'Too many digits: there are 12 (2 for the province, 8 for the number and 2 for control).',
    errChars: 'Digits only, with spaces, slashes or dashes as separators.',
    provinceLabel: 'Province',
    any: 'Any',
    generated: 'Generated numbers',
    copyAll: 'Copy all',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/nss/content.es.md`:
```md
## Cómo está formado

El número de afiliación a la Seguridad Social (NSS o NAF) tiene 12 cifras: 2 de la provincia donde se dio de alta, 8 de número y 2 de control. El código de provincia es el mismo que el del código postal y el del INE: 28 es Madrid y 08 es Barcelona. Lo verás escrito con barras (`28/12345678/40`), con espacios o todo seguido, y el validador acepta cualquiera de esas formas.

## La fórmula de control

El control es el resto de dividir entre 97 un número formado por la provincia y el número, pero la forma de juntarlos depende del tamaño del número. Si es menor de 10 000 000, se calcula `número + provincia × 10 000 000`; si no, se ponen la provincia y el número uno detrás de otro. Muchas calculadoras solo aplican la segunda regla y dan por malos números correctos de la primera: esta herramienta aplica las dos.

Un código de provincia fuera de 01–52 no se da por error, porque hay números antiguos o especiales que lo tienen: solo sale un aviso. La pestaña Generar crea números válidos de la provincia que elijas para rellenar formularios de prueba. Nada de lo que escribes se guarda: es un identificador personal.
```

`src/tools/nss/content.en.md`:
```md
## How it is built

The Spanish Social Security number (NSS or NAF) has 12 digits: 2 for the province where it was issued, 8 for the number and 2 for control. The province code is the same as in postal codes and the INE: 28 is Madrid and 08 is Barcelona. You will see it written with slashes (`28/12345678/40`), with spaces or all together, and the validator accepts any of them.

## The control formula

The control is the remainder of dividing by 97 a number made from the province and the number, but how they are joined depends on the size of the number. Below 10,000,000 it is `number + province × 10,000,000`; otherwise the province and the number are simply written one after the other. Many calculators only apply the second rule and reject correct numbers of the first kind: this tool applies both.

A province code outside 01–52 is not treated as an error, because some old or special numbers have one: it only shows a warning. The Generate tab creates valid numbers for the province you choose, to fill test forms. Nothing you type is stored: it is a personal identifier.
```

- [ ] **Step 8: `src/tools/nss/Nss.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { DEFAULT_QUANTITY, MAX_LINES, MAX_QUANTITY, repeat, splitLines } from '../../lib/ids';
  import { PROVINCES } from '../../lib/provinces';
  import { randomSeed, seededRng } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import type { Locale } from '../types';
  import { generateNss, validateNss, type NssResult } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  let tab = $state<'validate' | 'generate'>('validate');
  // meta.rememberInput is false: the NSS is a personal identifier.
  let input = $state('');
  let province = $state('any');
  let quantity = $state(DEFAULT_QUANTITY);
  let seed = $state('');
  let session = $state('');

  onMount(() => {
    session = randomSeed();
  });

  const split = $derived(splitLines(input));
  const results = $derived(split.lines.map((line) => ({ line, r: validateNss(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);

  function reason(r: NssResult): string {
    if (r.ok) {
      return r.province ? r.province.name : fill(s.unknownProvince, { c: r.provinceCode });
    }
    switch (r.reason) {
      case 'control':
        return fill(s.errControl, { e: r.expected ?? '' });
      case 'fewDigits':
        return s.errFew;
      case 'manyDigits':
        return s.errMany;
      default:
        return s.errChars;
    }
  }

  const copyValidated = $derived(results.map((x) => (x.r.ok ? x.r.formatted : x.line)).join('\n'));

  const options = $derived([
    { value: 'any', label: s.any },
    ...PROVINCES.map((p) => ({ value: p.code, label: `${p.code} · ${p.name}` })),
  ]);

  const generated = $derived.by(() => {
    const key = seed.trim() || session;
    if (!key) return [];
    const rng = seededRng(key);
    return repeat(quantity, () => generateNss(rng, province === 'any' ? undefined : province));
  });
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'validate', label: meta.tabs![locale][0] },
      { value: 'generate', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    {#if tab === 'validate'}
      <Field id="nss-input" label={s.input} help={s.help}>
        {#snippet children({ describedby })}
          <TextArea
            id="nss-input"
            bind:value={input}
            rows={3}
            placeholder={s.placeholder}
            {describedby}
            invalid={single !== null && !single.ok}
          />
        {/snippet}
      </Field>

      <Display live label={s.result}>
        {#snippet head()}
          {#if results.length === 0}
            <Led state="idle" label={t(locale, 'led.idle')} />
          {:else if single}
            <Led
              state={single.ok ? 'ok' : 'bad'}
              label={single.ok ? s.valid : t(locale, 'led.bad')}
            />
          {:else}
            <span>{fill(s.count, { ok: okCount, bad: results.length - okCount })}</span>
          {/if}
        {/snippet}
        {#if results.length === 0}
          <p class="display-note">{s.empty}</p>
        {:else if single}
          {#if single.ok}
            <div class="display-value">{single.formatted}</div>
            <dl class="display-kv">
              <dt>{s.province}</dt>
              <dd>{single.provinceCode}{single.province ? ` · ${single.province.name}` : ''}</dd>
              <dt>{s.number}</dt>
              <dd>{single.normalized.slice(2, 10)}</dd>
              <dt>{s.control}</dt>
              <dd>{single.normalized.slice(10)}</dd>
            </dl>
            {#if !single.province}
              <p class="display-note">{reason(single)}</p>
            {/if}
          {:else}
            <p class="display-note">{reason(single)}</p>
          {/if}
        {:else}
          <div class="display-rows">
            {#each results as x, i (i)}
              <div class="display-row">
                <Led state={x.r.ok ? 'ok' : 'bad'} label={x.r.ok ? x.r.formatted : x.line} />
                <span class="why">{reason(x.r)}</span>
              </div>
            {/each}
          </div>
          {#if split.truncated}<p class="display-note">
              {fill(s.truncated, { n: MAX_LINES })}
            </p>{/if}
        {/if}
      </Display>

      <div class="row">
        <CopyButton main value={copyValidated} {locale} />
        <Button variant="ghost" disabled={!input} onclick={() => (input = '')}>
          {t(locale, 'ui.clear')}
        </Button>
      </div>
    {:else}
      <div class="row top">
        <Field id="nss-province" label={s.provinceLabel}>
          <Select id="nss-province" bind:value={province} {options} />
        </Field>
        <Field id="nss-quantity" label={t(locale, 'ui.quantity')}>
          <NumberInput id="nss-quantity" bind:value={quantity} min={1} max={MAX_QUANTITY} />
        </Field>
        <Field id="nss-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
          {#snippet children({ describedby })}
            <input
              id="nss-seed"
              class="control mono seed"
              type="text"
              autocomplete="off"
              spellcheck="false"
              aria-describedby={describedby}
              bind:value={seed}
            />
          {/snippet}
        </Field>
      </div>

      <div class="row">
        <Button variant="primary" icon="refresh-cw" onclick={() => (session = randomSeed())}>
          {t(locale, 'ui.generate')}
        </Button>
      </div>

      <Display label={s.generated}>
        <div class="display-rows">
          {#each generated as v, i (i)}
            <div class="display-row">
              <span>{v}</span>
              <CopyButton value={v} {locale} compact />
            </div>
          {/each}
        </div>
      </Display>
      <p class="test-only">{t(locale, 'ui.testOnly')}</p>

      <div class="row">
        <CopyButton main value={generated.join('\n')} {locale} label={s.copyAll} />
      </div>
    {/if}
  </div>
</div>

<style>
  .top {
    align-items: flex-start;
  }
  .seed {
    width: 220px;
  }
  .why {
    flex: 1;
    text-align: right;
    font: 400 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--disp-dim);
  }
  .test-only {
    font-size: 13px;
    color: var(--text-dim);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as nss } from './nss/meta';
```
→
```ts
import { meta as nss } from './nss/meta';
```
y
```ts
  // nss,
```
→
```ts
  nss,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Nss from '../tools/nss/Nss.svelte';
```
→
```astro
import Nss from '../tools/nss/Nss.svelte';
```
y
```astro
{/* {id === 'nss' && <Nss client:load locale={locale} />} */}
```
→
```astro
{id === 'nss' && <Nss client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/validador-numero-seguridad-social.html dist/en/spanish-social-security-number-validator.html
```
Expected: todo en verde, incluido `registry.test.ts` (título ≤ 65, descripción 51–160, slugs, icono y los dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobar en el navegador (script desechable)**

Crea `check-nss.mjs` en la raíz del worktree (no se confirma nunca):
```js
// Throwaway browser check for the nss task. Never committed: delete it after running.
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const PORT = 4705;
const server = spawn('node_modules/.bin/astro', ['preview', '--port', String(PORT), '--ignore-lock'], {
  stdio: 'ignore',
});
const base = `http://localhost:${PORT}`;
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`${base}/es`)).ok) break;
  } catch {
    // Not listening yet.
  }
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch();
const page = await browser.newPage({ locale: 'es-ES', viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(5000);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => page.locator('.panel').getByText(text).first().waitFor();
const rows = async (n, display) => {
  const scope = display ? page.getByRole('region', { name: display }) : page.locator('.panel');
  const count = await scope.locator('.display-row').count();
  if (count !== n) throw new Error(`expected ${n} rows, got ${count}`);
};
const nothingStored = async (id, typed) => {
  await page.waitForTimeout(500);
  const hits = await page.evaluate(
    ([k, t]) => Object.entries(localStorage).filter(([key, v]) => key.includes(k) || v.includes(t)),
    [id, typed],
  );
  if (hits.length) throw new Error(`stored: ${JSON.stringify(hits)}`);
};
try {
  await page.goto(`${base}/es/validador-numero-seguridad-social`);
  await page.locator('astro-island[ssr]').first().waitFor({ state: 'detached' });
  await page.locator('#nss-input').fill('28/12345678/40');
  await see('Madrid');
  await page.locator('#nss-input').fill('281234567841');
  await see('debería ser 40');
  await page.locator('#nss-input').fill('661234567814');
  await see('Provincia no reconocida (66)');
  await page.getByRole('radio', { name: 'Generar', exact: true }).click();
  await page.locator('#nss-seed').fill('demo');
  await rows(10);
  await nothingStored('nss', '1234567840');
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`horizontal scroll at ${width} px`);
  }
  for (const theme of ['light', 'dark', 'terminal']) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await page.screenshot({ path: `check-nss-${theme}.png`, fullPage: true });
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK nss');
} finally {
  await browser.close();
  server.kill();
}
```

Run:
```bash
pnpm build && node check-nss.mjs
```
Expected: `OK nss`. El script comprueba que `28/12345678/40` es Madrid, `281234567841` pide 40, la provincia 66 es un aviso y nada se guarda. También comprueba que no hay scroll horizontal a 390 px ni a 1280 px y guarda una captura por tema (`check-nss-light.png`, `-dark.png`, `-terminal.png`): ábrelas y confirma que los resultados se leen en la pantalla hundida y que nada se sale del panel en ningún tema.

Después, bórralo todo:
```bash
rm check-nss.mjs check-nss-*.png
```

- [ ] **Step 12: Commit**

```bash
git add src/tools/nss src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni el script ni las capturas). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(nss): número de la Seguridad Social con las dos ramas del control"
```

---

### Task 6: Tarjetas de prueba: Luhn, marca y generador

**Files:**
- Create: `src/tools/card/logic.ts`, `src/tools/card/logic.test.ts`, `src/tools/card/meta.ts`, `src/tools/card/strings.ts`, `src/tools/card/content.es.md`, `src/tools/card/content.en.md`, `src/tools/card/Card.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `splitLines`, `repeat`, `MAX_LINES`, `MAX_QUANTITY`, `DEFAULT_QUANTITY` (`lib/ids`); `digits`, `pick`, `randInt`, `randomSeed`, `seededRng`, `Rng` (`lib/random`); `fill`; `t`; kit: `Field`, `TextArea`, `Display`, `Led`, `CopyButton`, `Button`, `Segmented`, `NumberInput`, `Toggle`, `Icon` (`triangle-alert`).
- Produces: `type Brand`, `type TestBrand`, `BRAND_NAMES`, `BRAND_LENGTHS`, `STRIPE_TEST_CARDS`, `type CardReason`, `type CardResult`; `luhnValid`, `luhnCheckDigit`, `detectBrand`, `formatCard`, `validateCard`, **`generateTestCard(rng: Rng, brand: TestBrand): string`** (contrato), `generateExpiry(rng, now)`, `generateCvv(rng, brand)`. Además `meta: ToolMeta` (id `card`, slugs de la tabla de arriba), `strings: Record<Locale, …>` y el componente `Card` con props `{ locale: Locale }`.
- DOM para la Task 12: `#card-input`, `#card-quantity`, `#card-seed`; regiones «Tarjetas generadas» y «Números de prueba de Stripe».

**§6.6 (vinculante).** Cómo se cubre cada punto:
- Luhn del spec; los 6 números comprobados pasan y `4111111111111112` falla, con el último dígito correcto en el mensaje.
- Detección de marca en el orden de la tabla (8 marcas) y aviso «Visa con 17 cifras: longitud poco habitual» (LED `ok` + nota).
- 12–19 cifras con espacios o guiones; 11 o 20 → error de longitud; letras → «Solo cifras, espacios o guiones». Agrupa 4-4-4-4 o 4-6-5 en Amex.
- Generar Visa (16), Mastercard (16; mitad 51–55 y mitad 2221–2720) y Amex (15); toggle «Añadir caducidad y CVV» (1–5 años desde `now`, CVV de 3 o 4). Lista fija de Stripe debajo.
- Aviso fijo y visible (`role="note"`) en las dos pestañas, además de `ui.testOnly`.
- `rememberInput: false`. FAQ en `meta`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-card -b lote-1/card   # desde el commit de la Task 0
cd ../devtools-card
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`.

- [ ] **Step 2: Test (falla)**

`src/tools/card/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import {
  STRIPE_TEST_CARDS,
  detectBrand,
  formatCard,
  generateCvv,
  generateExpiry,
  generateTestCard,
  luhnCheckDigit,
  luhnValid,
  validateCard,
} from './logic';

describe('Luhn: checked examples', () => {
  it.each([
    '4111111111111111',
    '4242424242424242',
    '5555555555554444',
    '2223003122003222',
    '378282246310005',
    '371449635398431',
  ])('%s passes', (n) => {
    expect(luhnValid(n)).toBe(true);
  });

  it('4111111111111112 fails, and the right last digit is 1', () => {
    expect(luhnValid('4111111111111112')).toBe(false);
    expect(luhnCheckDigit('411111111111111')).toBe('1');
    expect(luhnCheckDigit('37828224631000')).toBe('5');
  });
});

describe('detectBrand', () => {
  it('follows the table order', () => {
    expect(detectBrand('378282246310005')).toBe('amex');
    expect(detectBrand('4111111111111111')).toBe('visa');
    expect(detectBrand('5555555555554444')).toBe('mastercard');
    expect(detectBrand('2223003122003222')).toBe('mastercard');
    expect(detectBrand('2720990000000000')).toBe('mastercard');
    expect(detectBrand('2721000000000000')).toBeNull();
    expect(detectBrand('6011000990139424')).toBe('discover');
    expect(detectBrand('6221260000000000')).toBe('discover');
    expect(detectBrand('6450000000000000')).toBe('discover');
    expect(detectBrand('6200000000000000')).toBe('unionpay');
    expect(detectBrand('3530111333300000')).toBe('jcb');
    expect(detectBrand('30569309025904')).toBe('diners');
    expect(detectBrand('36000000000000')).toBe('diners');
    expect(detectBrand('6759649826438453')).toBe('maestro');
    expect(detectBrand('9999999999999995')).toBeNull();
  });
});

describe('validateCard', () => {
  it('accepts spaces and dashes and groups the number', () => {
    expect(validateCard('4242 4242-4242 4242')).toEqual({
      ok: true,
      digits: '4242424242424242',
      brand: 'visa',
      formatted: '4242 4242 4242 4242',
      unusualLength: false,
    });
    expect(validateCard('378282246310005')).toMatchObject({ formatted: '3782 822463 10005' });
  });

  it('warns about unusual lengths for the brand', () => {
    const body = '4' + '1'.repeat(15);
    const seventeen = body + luhnCheckDigit(body);
    expect(validateCard(seventeen)).toMatchObject({ ok: true, brand: 'visa', unusualLength: true });
  });

  it('rejects 11 and 20 digits, letters and a bad check digit', () => {
    expect(validateCard('41111111111')).toEqual({ ok: false, reason: 'length', length: 11 });
    expect(validateCard('41111111111111111111')).toEqual({
      ok: false,
      reason: 'length',
      length: 20,
    });
    expect(validateCard('4111 1111 1111 111a')).toEqual({ ok: false, reason: 'chars' });
    expect(validateCard('4111111111111112')).toMatchObject({
      ok: false,
      reason: 'luhn',
      brand: 'visa',
      expected: '1',
    });
    expect(validateCard(' ')).toEqual({ ok: false, reason: 'empty' });
  });

  it('keeps the Stripe list valid', () => {
    for (const c of STRIPE_TEST_CARDS) {
      expect(validateCard(c.number)).toMatchObject({ ok: true, brand: c.brand });
    }
  });

  it('groups 4-6-5 only for 15-digit Amex', () => {
    expect(formatCard('4242424242424242', 'visa')).toBe('4242 4242 4242 4242');
    expect(formatCard('4242424242424', 'visa')).toBe('4242 4242 4242 4');
  });
});

describe('generators', () => {
  it('round-trip: 1 000 cards per brand with seed "test" are all valid', () => {
    const rng = seededRng('test');
    for (const brand of ['visa', 'mastercard', 'amex'] as const) {
      for (let i = 0; i < 1000; i++) {
        const n = generateTestCard(rng, brand);
        const r = validateCard(n);
        expect(r.ok, n).toBe(true);
        expect(r.ok && r.brand).toBe(brand);
        expect(n).toHaveLength(brand === 'amex' ? 15 : 16);
      }
    }
  });

  it('uses both Mastercard ranges', () => {
    const rng = seededRng('mc');
    const firsts = new Set(
      Array.from({ length: 200 }, () => generateTestCard(rng, 'mastercard')[0]),
    );
    expect(firsts).toEqual(new Set(['2', '5']));
  });

  it('makes an expiry 1 to 5 years ahead and a CVV of 3 or 4 digits', () => {
    const rng = seededRng('exp');
    const now = new Date(Date.UTC(2026, 8, 27));
    for (let i = 0; i < 300; i++) {
      const [mm, yy] = generateExpiry(rng, now).split('/').map(Number);
      const months = (2000 + yy) * 12 + (mm - 1) - (2026 * 12 + 8);
      expect(months).toBeGreaterThanOrEqual(12);
      expect(months).toBeLessThanOrEqual(60);
    }
    expect(generateCvv(rng, 'visa')).toMatch(/^\d{3}$/);
    expect(generateCvv(rng, 'amex')).toMatch(/^\d{4}$/);
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/card`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/card/logic.ts`**

```ts
import { digits, pick, randInt, type Rng } from '../../lib/random';

export type Brand =
  'amex' | 'visa' | 'mastercard' | 'discover' | 'unionpay' | 'jcb' | 'diners' | 'maestro';

export type TestBrand = 'visa' | 'mastercard' | 'amex';

export const BRAND_NAMES: Record<Brand, string> = {
  amex: 'American Express',
  visa: 'Visa',
  mastercard: 'Mastercard',
  discover: 'Discover',
  unionpay: 'UnionPay',
  jcb: 'JCB',
  diners: 'Diners Club',
  maestro: 'Maestro',
};

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

/** Usual lengths per brand. */
export const BRAND_LENGTHS: Record<Brand, number[]> = {
  amex: [15],
  visa: [13, 16, 19],
  mastercard: [16],
  discover: range(16, 19),
  unionpay: range(16, 19),
  jcb: range(16, 19),
  diners: range(14, 19),
  maestro: range(12, 19),
};

/** Numbers Stripe documents for its test mode. */
export const STRIPE_TEST_CARDS: { brand: TestBrand; number: string }[] = [
  { brand: 'visa', number: '4242424242424242' },
  { brand: 'mastercard', number: '5555555555554444' },
  { brand: 'amex', number: '378282246310005' },
];

export type CardReason = 'empty' | 'chars' | 'length' | 'luhn';

export type CardResult =
  | {
      ok: true;
      digits: string;
      brand: Brand | null;
      /** 4-4-4-4, or 4-6-5 for American Express. */
      formatted: string;
      /** A length that is valid for Luhn but unusual for the brand. */
      unusualLength: boolean;
    }
  | {
      ok: false;
      reason: CardReason;
      length?: number;
      brand?: Brand | null;
      formatted?: string;
      /** For `luhn`: the last digit that would pass. */
      expected?: string;
    };

/** Doubles every second digit from the right; subtracts 9 above 9; valid when the sum ends in 0. */
export function luhnValid(num: string): boolean {
  let sum = 0;
  for (let i = 0; i < num.length; i++) {
    let d = Number(num[num.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

/** The check digit for a body: Luhn over body + "0", then (10 − sum mod 10) mod 10. */
export function luhnCheckDigit(body: string): string {
  let sum = 0;
  const full = body + '0';
  for (let i = 0; i < full.length; i++) {
    let d = Number(full[full.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return String((10 - (sum % 10)) % 10);
}

const inRange = (num: string, len: number, from: number, to: number) => {
  const p = Number(num.slice(0, len));
  return num.length >= len && p >= from && p <= to;
};

/** The first rule that matches, in the order of the table in §6.6 of the spec. */
export function detectBrand(num: string): Brand | null {
  if (/^3[47]/.test(num)) return 'amex';
  if (num.startsWith('4')) return 'visa';
  if (inRange(num, 2, 51, 55) || inRange(num, 4, 2221, 2720)) return 'mastercard';
  if (
    num.startsWith('6011') ||
    inRange(num, 6, 622126, 622925) ||
    inRange(num, 3, 644, 649) ||
    num.startsWith('65')
  ) {
    return 'discover';
  }
  if (num.startsWith('62')) return 'unionpay';
  if (inRange(num, 4, 3528, 3589)) return 'jcb';
  if (inRange(num, 3, 300, 305) || /^3[689]/.test(num)) return 'diners';
  if (/^(5018|5020|5038|5893|6304|6759|6761|6762|6763)/.test(num)) return 'maestro';
  return null;
}

export function formatCard(num: string, brand: Brand | null): string {
  if (brand === 'amex' && num.length === 15) {
    return `${num.slice(0, 4)} ${num.slice(4, 10)} ${num.slice(10)}`;
  }
  return num.replace(/(.{4})(?=.)/g, '$1 ');
}

export function validateCard(raw: string): CardResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, reason: 'empty' };
  if (!/^[\d\s-]+$/.test(trimmed)) return { ok: false, reason: 'chars' };
  const num = trimmed.replace(/[\s-]/g, '');
  if (num.length < 12 || num.length > 19)
    return { ok: false, reason: 'length', length: num.length };
  const brand = detectBrand(num);
  const formatted = formatCard(num, brand);
  if (!luhnValid(num)) {
    return {
      ok: false,
      reason: 'luhn',
      brand,
      formatted,
      expected: luhnCheckDigit(num.slice(0, -1)),
    };
  }
  const unusualLength = brand !== null && !BRAND_LENGTHS[brand].includes(num.length);
  return { ok: true, digits: num, brand, formatted, unusualLength };
}

/** Random body with the brand's prefix and the Luhn digit at the end. Without spaces. */
export function generateTestCard(rng: Rng, brand: TestBrand): string {
  let prefix: string;
  let length = 16;
  if (brand === 'visa') prefix = '4';
  else if (brand === 'amex') {
    prefix = pick(rng, ['34', '37']);
    length = 15;
  } else {
    // Half with the classic 51–55 range and half with the 2221–2720 range.
    prefix =
      randInt(rng, 0, 1) === 0 ? String(randInt(rng, 51, 55)) : String(randInt(rng, 2221, 2720));
  }
  const body = prefix + digits(rng, length - 1 - prefix.length);
  return body + luhnCheckDigit(body);
}

/** `MM/AA` between 1 and 5 years after `now`. */
export function generateExpiry(rng: Rng, now: Date): string {
  const months = randInt(rng, 12, 60);
  const total = now.getUTCFullYear() * 12 + now.getUTCMonth() + months;
  const year = Math.floor(total / 12) % 100;
  const month = (total % 12) + 1;
  return `${String(month).padStart(2, '0')}/${String(year).padStart(2, '0')}`;
}

/** 3 digits, or 4 for American Express. */
export function generateCvv(rng: Rng, brand: TestBrand): string {
  return digits(rng, brand === 'amex' ? 4 : 3);
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/card`
Expected: PASS, incluido el test de ida y vuelta de 1 000 valores si la herramienta genera.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/card/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'card',
  category: 'ids',
  icon: 'credit-card',
  slug: { es: 'tarjetas-de-credito-de-prueba', en: 'test-credit-card-numbers' },
  name: { es: 'Tarjetas de prueba', en: 'Test cards' },
  title: {
    es: 'Números de tarjeta de prueba y validador Luhn',
    en: 'Test credit card numbers and Luhn validator',
  },
  description: {
    es: 'Genera números de tarjeta Visa, Mastercard y American Express que pasan Luhn para entornos de prueba, y valida cualquier número: marca y dígito de control.',
    en: 'Generate Visa, Mastercard and American Express numbers that pass Luhn for test environments, and validate any card number: brand and check digit.',
  },
  keywords: {
    es: [
      'tarjeta de prueba',
      'numero tarjeta credito prueba',
      'algoritmo luhn',
      'validar tarjeta',
      'tarjeta visa prueba',
    ],
    en: [
      'test credit card numbers',
      'luhn validator',
      'fake credit card for testing',
      'validate card number',
      'stripe test card',
    ],
  },
  tabs: { es: ['Validar', 'Generar'], en: ['Validate', 'Generate'] },
  rememberInput: false,
  faq: {
    es: [
      {
        q: '¿Sirven para pagar?',
        a: 'No. Son números al azar que cumplen el formato de la marca y el algoritmo de Luhn, sin cuenta, titular ni CVV reales detrás. Una pasarela de pago real los rechaza.',
      },
      {
        q: '¿Qué es el algoritmo de Luhn?',
        a: 'Una suma de control que detecta casi cualquier errata al teclear un número de tarjeta. No dice nada de si la tarjeta existe o tiene saldo.',
      },
    ],
    en: [
      {
        q: 'Can they be used to pay?',
        a: 'No. They are random numbers that follow the brand format and the Luhn algorithm, with no real account, holder or CVV behind them. A real payment gateway rejects them.',
      },
      {
        q: 'What is the Luhn algorithm?',
        a: 'A checksum that catches almost any typo in a card number. It says nothing about whether the card exists or has funds.',
      },
    ],
  },
};
```

`src/tools/card/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    mode: 'Modo',
    warning: 'No son tarjetas reales ni sirven para pagar. Úsalas solo en entornos de prueba.',
    input: 'Número de tarjeta',
    placeholder: '4242 4242 4242 4242',
    help: 'Uno por línea, hasta 1000. Lo que escribes no se guarda en ningún sitio.',
    result: 'Resultado',
    empty: 'Escribe un número de 12 a 19 cifras, con espacios o guiones si quieres.',
    luhnOk: 'Luhn correcto',
    count: '{ok} válidos · {bad} no válidos',
    truncated: 'Solo se comprueban las primeras {n} líneas.',
    brand: 'Marca',
    unknownBrand: 'Marca no reconocida',
    number: 'Número',
    length: 'Longitud',
    digits: '{n} cifras',
    unusual: '{brand} con {n} cifras: longitud poco habitual.',
    errLuhn: 'El dígito de control no cuadra: el último debería ser {e}.',
    errLength: 'Una tarjeta tiene entre 12 y 19 cifras y esta tiene {n}.',
    errChars: 'Solo cifras, espacios o guiones.',
    brandLabel: 'Marca',
    expiry: 'Añadir caducidad y CVV',
    generated: 'Tarjetas generadas',
    copyAll: 'Copiar todas',
    stripe: 'Números de prueba de Stripe',
  },
  en: {
    mode: 'Mode',
    warning:
      'These are not real cards and cannot be used to pay. Use them in test environments only.',
    input: 'Card number',
    placeholder: '4242 4242 4242 4242',
    help: 'One per line, up to 1000. What you type is not stored anywhere.',
    result: 'Result',
    empty: 'Type a 12 to 19 digit number, with spaces or dashes if you like.',
    luhnOk: 'Luhn check passed',
    count: '{ok} valid · {bad} not valid',
    truncated: 'Only the first {n} lines are checked.',
    brand: 'Brand',
    unknownBrand: 'Unknown brand',
    number: 'Number',
    length: 'Length',
    digits: '{n} digits',
    unusual: '{brand} with {n} digits: unusual length.',
    errLuhn: 'The check digit does not match: the last one should be {e}.',
    errLength: 'A card has 12 to 19 digits and this one has {n}.',
    errChars: 'Digits, spaces or dashes only.',
    brandLabel: 'Brand',
    expiry: 'Add expiry date and CVV',
    generated: 'Generated cards',
    copyAll: 'Copy all',
    stripe: 'Stripe test numbers',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/card/content.es.md`:
```md
## Para qué sirven

Al programar un formulario de pago necesitas números que tengan el aspecto de una tarjeta real: la longitud de su marca, el prefijo correcto (4 para Visa, 51–55 o 2221–2720 para Mastercard, 34 o 37 para American Express) y un último dígito que cuadre con el algoritmo de Luhn. Esta herramienta los genera al azar, con caducidad y CVV si los necesitas, y los valida: te dice la marca, agrupa el número como aparece en la tarjeta y avisa si la longitud es rara para esa marca.

Las pasarelas como Stripe publican sus propios números para el modo de pruebas, como `4242 4242 4242 4242`; los tienes debajo del generador. Úsalos cuando pruebes contra su entorno de test, porque solo ellos simulan pagos aceptados o rechazados.

## Cómo funciona Luhn

Se recorre el número de derecha a izquierda y se duplica una cifra de cada dos, empezando por la segunda; si el doble pasa de 9, se le resta 9. El número es válido si la suma total acaba en 0. Detecta cualquier cifra mal tecleada y casi cualquier par de cifras intercambiadas, pero no dice nada de si la tarjeta existe. Ni lo que escribes ni lo que generas se guarda en el navegador.
```

`src/tools/card/content.en.md`:
```md
## What they are for

When you build a payment form you need numbers that look like a real card: the right length for the brand, the right prefix (4 for Visa, 51–55 or 2221–2720 for Mastercard, 34 or 37 for American Express) and a last digit that satisfies the Luhn algorithm. This tool generates them at random, with an expiry date and CVV if you need them, and validates them: it tells you the brand, groups the number as printed on the card and warns when the length is unusual for that brand.

Gateways such as Stripe publish their own numbers for test mode, like `4242 4242 4242 4242`; they are listed under the generator. Use those when testing against their sandbox, because only they simulate accepted or declined payments.

## How Luhn works

Walk the number from right to left and double every second digit, starting with the second one; if the double is above 9, subtract 9. The number is valid when the total ends in 0. It catches any single mistyped digit and almost any swap of two neighbours, but it says nothing about whether the card exists. Neither what you type nor what you generate is stored in the browser.
```

- [ ] **Step 8: `src/tools/card/Card.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { DEFAULT_QUANTITY, MAX_LINES, MAX_QUANTITY, repeat, splitLines } from '../../lib/ids';
  import { randomSeed, seededRng } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Icon from '../../ui/Icon.svelte';
  import Led from '../../ui/Led.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import type { Locale } from '../types';
  import {
    BRAND_NAMES,
    STRIPE_TEST_CARDS,
    formatCard,
    generateCvv,
    generateExpiry,
    generateTestCard,
    validateCard,
    type CardResult,
    type TestBrand,
  } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);

  let tab = $state<'validate' | 'generate'>('validate');
  // meta.rememberInput is false: it looks like payment data, even when it is a test number.
  let input = $state('');
  let brand = $state<TestBrand>('visa');
  let withExpiry = $state(false);
  let quantity = $state(DEFAULT_QUANTITY);
  let seed = $state('');
  let session = $state('');

  onMount(() => {
    session = randomSeed();
  });

  const split = $derived(splitLines(input));
  const results = $derived(split.lines.map((line) => ({ line, r: validateCard(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);

  function brandName(b: CardResult['brand']): string {
    return b ? BRAND_NAMES[b] : s.unknownBrand;
  }

  function reason(r: CardResult): string {
    if (r.ok) {
      return r.unusualLength
        ? fill(s.unusual, { brand: brandName(r.brand), n: r.digits.length })
        : brandName(r.brand);
    }
    switch (r.reason) {
      case 'luhn':
        return fill(s.errLuhn, { e: r.expected ?? '' });
      case 'length':
        return fill(s.errLength, { n: r.length ?? 0 });
      default:
        return s.errChars;
    }
  }

  const copyValidated = $derived(results.map((x) => (x.r.ok ? x.r.digits : x.line)).join('\n'));

  const generated = $derived.by(() => {
    const key = seed.trim() || session;
    if (!key) return [];
    const rng = seededRng(key);
    const now = new Date();
    return repeat(quantity, () => {
      const n = generateTestCard(rng, brand);
      return withExpiry ? `${n} ${generateExpiry(rng, now)} ${generateCvv(rng, brand)}` : n;
    });
  });
</script>

<div class="stack">
  <Segmented
    main
    label={s.mode}
    options={[
      { value: 'validate', label: meta.tabs![locale][0] },
      { value: 'generate', label: meta.tabs![locale][1] },
    ]}
    bind:value={tab}
  />

  <div class="panel">
    <p class="warning" role="note">
      <Icon name="triangle-alert" size={18} />
      <span>{s.warning}</span>
    </p>

    {#if tab === 'validate'}
      <Field id="card-input" label={s.input} help={s.help}>
        {#snippet children({ describedby })}
          <TextArea
            id="card-input"
            bind:value={input}
            rows={3}
            placeholder={s.placeholder}
            {describedby}
            invalid={single !== null && !single.ok}
          />
        {/snippet}
      </Field>

      <Display live label={s.result}>
        {#snippet head()}
          {#if results.length === 0}
            <Led state="idle" label={t(locale, 'led.idle')} />
          {:else if single}
            <Led
              state={single.ok ? 'ok' : 'bad'}
              label={single.ok ? s.luhnOk : t(locale, 'led.bad')}
            />
          {:else}
            <span>{fill(s.count, { ok: okCount, bad: results.length - okCount })}</span>
          {/if}
        {/snippet}
        {#if results.length === 0}
          <p class="display-note">{s.empty}</p>
        {:else if single}
          {#if single.ok}
            <div class="display-value">{single.formatted}</div>
            <dl class="display-kv">
              <dt>{s.brand}</dt>
              <dd>{brandName(single.brand)}</dd>
              <dt>{s.length}</dt>
              <dd>{fill(s.digits, { n: single.digits.length })}</dd>
            </dl>
            {#if single.unusualLength}<p class="display-note">{reason(single)}</p>{/if}
          {:else}
            {#if single.formatted}<div class="display-value">{single.formatted}</div>{/if}
            <p class="display-note">{reason(single)}</p>
          {/if}
        {:else}
          <div class="display-rows">
            {#each results as x, i (i)}
              <div class="display-row">
                <Led state={x.r.ok ? 'ok' : 'bad'} label={x.r.ok ? x.r.formatted : x.line} />
                <span class="why">{reason(x.r)}</span>
              </div>
            {/each}
          </div>
          {#if split.truncated}<p class="display-note">
              {fill(s.truncated, { n: MAX_LINES })}
            </p>{/if}
        {/if}
      </Display>

      <div class="row">
        <CopyButton main value={copyValidated} {locale} />
        <Button variant="ghost" disabled={!input} onclick={() => (input = '')}>
          {t(locale, 'ui.clear')}
        </Button>
      </div>
    {:else}
      <div class="row">
        <div class="stack tight">
          <span class="label">{s.brandLabel}</span>
          <Segmented
            label={s.brandLabel}
            options={[
              { value: 'visa', label: 'Visa' },
              { value: 'mastercard', label: 'Mastercard' },
              { value: 'amex', label: 'American Express' },
            ]}
            bind:value={brand}
          />
        </div>
        <Toggle bind:checked={withExpiry} label={s.expiry} />
      </div>
      <div class="row top">
        <Field id="card-quantity" label={t(locale, 'ui.quantity')}>
          <NumberInput id="card-quantity" bind:value={quantity} min={1} max={MAX_QUANTITY} />
        </Field>
        <Field id="card-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
          {#snippet children({ describedby })}
            <input
              id="card-seed"
              class="control mono seed"
              type="text"
              autocomplete="off"
              spellcheck="false"
              aria-describedby={describedby}
              bind:value={seed}
            />
          {/snippet}
        </Field>
      </div>

      <div class="row">
        <Button variant="primary" icon="refresh-cw" onclick={() => (session = randomSeed())}>
          {t(locale, 'ui.generate')}
        </Button>
      </div>

      <Display label={s.generated}>
        <div class="display-rows">
          {#each generated as v, i (i)}
            <div class="display-row">
              <span>{v}</span>
              <CopyButton value={v} {locale} compact />
            </div>
          {/each}
        </div>
      </Display>
      <p class="test-only">{t(locale, 'ui.testOnly')}</p>

      <div class="row">
        <CopyButton main value={generated.join('\n')} {locale} label={s.copyAll} />
      </div>

      <Display label={s.stripe}>
        {#snippet head()}<span>{s.stripe}</span>{/snippet}
        <div class="display-rows">
          {#each STRIPE_TEST_CARDS as c (c.number)}
            <div class="display-row">
              <span>{BRAND_NAMES[c.brand]} · {formatCard(c.number, c.brand)}</span>
              <CopyButton value={c.number} {locale} compact />
            </div>
          {/each}
        </div>
      </Display>
    {/if}
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
    color: var(--bad-text);
    margin-top: 1px;
  }
  .tight {
    gap: 8px;
  }
  .top {
    align-items: flex-start;
  }
  .label {
    font-size: 13px;
    font-weight: 600;
  }
  .seed {
    width: 220px;
  }
  .why {
    flex: 1;
    text-align: right;
    font: 400 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--disp-dim);
  }
  .test-only {
    font-size: 13px;
    color: var(--text-dim);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as card } from './card/meta';
```
→
```ts
import { meta as card } from './card/meta';
```
y
```ts
  // card,
```
→
```ts
  card,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Card from '../tools/card/Card.svelte';
```
→
```astro
import Card from '../tools/card/Card.svelte';
```
y
```astro
{/* {id === 'card' && <Card client:load locale={locale} />} */}
```
→
```astro
{id === 'card' && <Card client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/tarjetas-de-credito-de-prueba.html dist/en/test-credit-card-numbers.html
```
Expected: todo en verde, incluido `registry.test.ts` (título ≤ 65, descripción 51–160, slugs, icono y los dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobar en el navegador (script desechable)**

Crea `check-card.mjs` en la raíz del worktree (no se confirma nunca):
```js
// Throwaway browser check for the card task. Never committed: delete it after running.
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const PORT = 4706;
const server = spawn('node_modules/.bin/astro', ['preview', '--port', String(PORT), '--ignore-lock'], {
  stdio: 'ignore',
});
const base = `http://localhost:${PORT}`;
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`${base}/es`)).ok) break;
  } catch {
    // Not listening yet.
  }
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch();
const page = await browser.newPage({ locale: 'es-ES', viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(5000);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => page.locator('.panel').getByText(text).first().waitFor();
const rows = async (n, display) => {
  const scope = display ? page.getByRole('region', { name: display }) : page.locator('.panel');
  const count = await scope.locator('.display-row').count();
  if (count !== n) throw new Error(`expected ${n} rows, got ${count}`);
};
const nothingStored = async (id, typed) => {
  await page.waitForTimeout(500);
  const hits = await page.evaluate(
    ([k, t]) => Object.entries(localStorage).filter(([key, v]) => key.includes(k) || v.includes(t)),
    [id, typed],
  );
  if (hits.length) throw new Error(`stored: ${JSON.stringify(hits)}`);
};
try {
  await page.goto(`${base}/es/tarjetas-de-credito-de-prueba`);
  await page.locator('astro-island[ssr]').first().waitFor({ state: 'detached' });
  await see('No son tarjetas reales ni sirven para pagar.');
  await page.locator('#card-input').fill('4242 4242 4242 4242');
  await see('Luhn correcto');
  await page.locator('#card-input').fill('4111111111111112');
  await see('el último debería ser 1');
  await page.getByRole('radio', { name: 'Generar', exact: true }).click();
  await page.getByRole('radio', { name: 'American Express', exact: true }).click();
  await page.locator('#card-seed').fill('demo');
  await rows(10, 'Tarjetas generadas');
  await see('Números de prueba de Stripe');
  await nothingStored('card', '4111111111111112');
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`horizontal scroll at ${width} px`);
  }
  for (const theme of ['light', 'dark', 'terminal']) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await page.screenshot({ path: `check-card-${theme}.png`, fullPage: true });
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK card');
} finally {
  await browser.close();
  server.kill();
}
```

Run:
```bash
pnpm build && node check-card.mjs
```
Expected: `OK card`. El script comprueba que el aviso es visible, `4242 …` pasa Luhn, `…1112` pide un 1, Generar Amex da 10 filas, la lista de Stripe está y nada se guarda. También comprueba que no hay scroll horizontal a 390 px ni a 1280 px y guarda una captura por tema (`check-card-light.png`, `-dark.png`, `-terminal.png`): ábrelas y confirma que los resultados se leen en la pantalla hundida y que nada se sale del panel en ningún tema.

Después, bórralo todo:
```bash
rm check-card.mjs check-card-*.png
```

- [ ] **Step 12: Commit**

```bash
git add src/tools/card src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni el script ni las capturas). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(card): tarjetas de prueba con Luhn, marca y generador"
```

---

### Task 7: Teléfonos de España: tipo y formato E.164

**Files:**
- Create: `src/tools/phone/logic.ts`, `src/tools/phone/logic.test.ts`, `src/tools/phone/meta.ts`, `src/tools/phone/strings.ts`, `src/tools/phone/content.es.md`, `src/tools/phone/content.en.md`, `src/tools/phone/Phone.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `splitLines`, `MAX_LINES` (`lib/ids`); `digits`, `randInt`, `Rng` (`lib/random`); `fill`; `t`; kit: `Field`, `TextArea`, `Display`, `Led`, `CopyButton`, `Button`.
- Produces: `type PhoneKind`, `type PhoneReason`, `type PhoneResult`; `normalizePhone`, `formatNational`, `validatePhone`, **`generatePhone(rng: Rng, kind: 'mobile' | 'landline'): string`** (contrato; sin pestaña). `strings.ts` exporta `kindNames`. Además `meta: ToolMeta` (id `phone`, slugs de la tabla de arriba), `strings: Record<Locale, …>` y el componente `Phone` con props `{ locale: Locale }`.
- DOM para la Task 12: `#phone-input`; `.display-head` con el tipo y `.display-value` con el E.164.

**§6.7 (vinculante).** Cómo se cubre cada punto:
- Normalización: quita espacios, puntos, guiones y paréntesis y el prefijo `+34`, `0034` o `34` delante de 9 cifras; otro prefijo → «Solo números de España (+34)».
- Clasificación en el orden de la tabla (móvil, personal, gratuito, tarifa especial, tarificación adicional, fijo, red corporativa), con test por patrón.
- Números cortos de 3 a 6 cifras → «Es un número corto: no tiene formato E.164»; lo que no encaja → el mensaje del spec.
- Salida: tipo, E.164, nacional `612 34 56 78`, internacional y enlace `tel:`. Casos límite del spec en tests.
- `generatePhone`: móvil 80 % `6` y 20 % `7[1-4]`; fijo `9[1-8]` (test del 80 %).
- Sin pestañas y `rememberInput: false`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-phone -b lote-1/phone   # desde el commit de la Task 0
cd ../devtools-phone
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`.

- [ ] **Step 2: Test (falla)**

`src/tools/phone/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import { formatNational, generatePhone, normalizePhone, validatePhone } from './logic';

describe('normalizePhone', () => {
  it('drops separators and the Spanish prefix in its three forms', () => {
    expect(normalizePhone('+34 912 345 678')).toBe('912345678');
    expect(normalizePhone('0034912345678')).toBe('912345678');
    expect(normalizePhone('(91) 234-56-78')).toBe('912345678');
    expect(normalizePhone('34612345678')).toBe('612345678');
    expect(normalizePhone('612.34.56.78')).toBe('612345678');
  });

  it('returns null for other country codes', () => {
    expect(normalizePhone('+33 1 23 45 67 89')).toBeNull();
    expect(normalizePhone('0044 20 7946 0000')).toBeNull();
  });
});

describe('validatePhone', () => {
  it('gives the same result for the same number written three ways', () => {
    const a = validatePhone('+34 912 345 678');
    expect(validatePhone('0034912345678')).toEqual(a);
    expect(validatePhone('(91) 234-56-78')).toEqual(a);
    expect(a).toMatchObject({ ok: true, kind: 'landline' });
  });

  it('returns every format', () => {
    expect(validatePhone('+34 612 34 56 78')).toEqual({
      ok: true,
      kind: 'mobile',
      national: '612345678',
      e164: '+34612345678',
      nationalFormatted: '612 34 56 78',
      international: '+34 612 34 56 78',
      tel: 'tel:+34612345678',
    });
    expect(validatePhone('34612345678')).toMatchObject({ kind: 'mobile' });
  });

  it('classifies in the order of the table', () => {
    const kinds: [string, string][] = [
      ['612345678', 'mobile'],
      ['712345678', 'mobile'],
      ['741234567', 'mobile'],
      ['701234567', 'personal'],
      ['800123456', 'freephone'],
      ['900123456', 'freephone'],
      ['901123456', 'specialRate'],
      ['902123456', 'specialRate'],
      ['803123456', 'premium'],
      ['806123456', 'premium'],
      ['807123456', 'premium'],
      ['905123456', 'premium'],
      ['812345678', 'landline'],
      ['912345678', 'landline'],
      ['981234567', 'landline'],
      ['512345678', 'corporate'],
    ];
    for (const [n, kind] of kinds) expect(validatePhone(n), n).toMatchObject({ ok: true, kind });
  });

  it('rejects what does not fit', () => {
    expect(validatePhone('751234567')).toEqual({ ok: false, reason: 'pattern' });
    expect(validatePhone('991234567')).toEqual({ ok: false, reason: 'pattern' });
    expect(validatePhone('412345678')).toEqual({ ok: false, reason: 'pattern' });
    expect(validatePhone('612 34 56 7')).toEqual({ ok: false, reason: 'fewDigits', length: 8 });
    expect(validatePhone('6123456789')).toEqual({ ok: false, reason: 'manyDigits', length: 10 });
    expect(validatePhone('+33 123456789')).toEqual({ ok: false, reason: 'foreign' });
    expect(validatePhone('612a45678')).toEqual({ ok: false, reason: 'chars' });
    expect(validatePhone('')).toEqual({ ok: false, reason: 'empty' });
  });

  it('recognises short numbers, which have no E.164 form', () => {
    expect(validatePhone('112')).toEqual({ ok: false, reason: 'short', length: 3 });
    expect(validatePhone('016')).toEqual({ ok: false, reason: 'short', length: 3 });
  });

  it('formats as 3-2-2-2', () => {
    expect(formatNational('912345678')).toBe('912 34 56 78');
  });
});

describe('generatePhone', () => {
  it('round-trip: 1 000 mobiles and 1 000 landlines with seed "test" are valid and of that kind', () => {
    const rng = seededRng('test');
    for (let i = 0; i < 1000; i++) {
      const m = generatePhone(rng, 'mobile');
      expect(validatePhone(m), m).toMatchObject({ ok: true, kind: 'mobile' });
      const l = generatePhone(rng, 'landline');
      expect(l).toMatch(/^9[1-8]\d{7}$/);
      expect(validatePhone(l), l).toMatchObject({ ok: true, kind: 'landline' });
    }
  });

  it('makes about 80 % of mobiles start with 6', () => {
    const rng = seededRng('six');
    const six = Array.from({ length: 2000 }, () => generatePhone(rng, 'mobile')).filter((n) =>
      n.startsWith('6'),
    ).length;
    expect(six).toBeGreaterThan(1500);
    expect(six).toBeLessThan(1700);
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/phone`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/phone/logic.ts`**

```ts
import { digits, randInt, type Rng } from '../../lib/random';

export type PhoneKind =
  'mobile' | 'personal' | 'freephone' | 'specialRate' | 'premium' | 'landline' | 'corporate';

export type PhoneReason =
  'empty' | 'chars' | 'foreign' | 'short' | 'fewDigits' | 'manyDigits' | 'pattern';

export type PhoneResult =
  | {
      ok: true;
      kind: PhoneKind;
      /** 9 digits. */
      national: string;
      /** `+34612345678`. */
      e164: string;
      /** `612 34 56 78`. */
      nationalFormatted: string;
      /** `+34 612 34 56 78`. */
      international: string;
      /** `tel:+34612345678`. */
      tel: string;
    }
  | { ok: false; reason: PhoneReason; length?: number };

/** Evaluated in this order (§6.7 of the spec). */
const PATTERNS: [RegExp, PhoneKind][] = [
  [/^(6\d{8}|7[1-4]\d{7})$/, 'mobile'],
  [/^70\d{7}$/, 'personal'],
  [/^(800|900)\d{6}$/, 'freephone'],
  [/^(901|902)\d{6}$/, 'specialRate'],
  [/^(803|806|807|905)\d{6}$/, 'premium'],
  [/^[89][1-8]\d{7}$/, 'landline'],
  [/^51\d{7}$/, 'corporate'],
];

/** Removes separators and the +34 / 0034 / 34 prefix. Null for other country codes. */
export function normalizePhone(raw: string): string | null {
  let s = raw.replace(/[\s.()-]/g, '');
  if (s.startsWith('+')) {
    if (!s.startsWith('+34')) return null;
    s = s.slice(3);
  } else if (s.startsWith('00')) {
    if (!s.startsWith('0034')) return null;
    s = s.slice(4);
  } else if (/^34\d{9}$/.test(s)) {
    s = s.slice(2);
  }
  return s;
}

export function formatNational(n: string): string {
  return `${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 7)} ${n.slice(7)}`;
}

export function validatePhone(raw: string): PhoneResult {
  if (!raw.trim()) return { ok: false, reason: 'empty' };
  const n = normalizePhone(raw);
  if (n === null) return { ok: false, reason: 'foreign' };
  if (!/^\d+$/.test(n)) return { ok: false, reason: 'chars' };
  if (n.length >= 3 && n.length <= 6) return { ok: false, reason: 'short', length: n.length };
  if (n.length < 9) return { ok: false, reason: 'fewDigits', length: n.length };
  if (n.length > 9) return { ok: false, reason: 'manyDigits', length: n.length };
  const kind = PATTERNS.find(([re]) => re.test(n))?.[1];
  if (!kind) return { ok: false, reason: 'pattern' };
  const nationalFormatted = formatNational(n);
  return {
    ok: true,
    kind,
    national: n,
    e164: `+34${n}`,
    nationalFormatted,
    international: `+34 ${nationalFormatted}`,
    tel: `tel:+34${n}`,
  };
}

/**
 * For mock data (no tab of its own). Mobile: 80 % 6 + 8 digits, 20 % 7[1-4] + 7 digits.
 * Landline: 9[1-8] + 7 digits.
 */
export function generatePhone(rng: Rng, kind: 'mobile' | 'landline'): string {
  if (kind === 'landline') return `9${randInt(rng, 1, 8)}${digits(rng, 7)}`;
  if (randInt(rng, 1, 100) <= 80) return `6${digits(rng, 8)}`;
  return `7${randInt(rng, 1, 4)}${digits(rng, 7)}`;
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/phone`
Expected: PASS, incluido el test de ida y vuelta de 1 000 valores si la herramienta genera.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/phone/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'phone',
  category: 'ids',
  icon: 'phone',
  slug: { es: 'validador-telefonos-espana', en: 'spanish-phone-number-validator' },
  name: { es: 'Teléfonos ES', en: 'Spanish phone numbers' },
  title: {
    es: 'Validador de teléfonos de España y formato E.164',
    en: 'Spanish phone number validator and E.164 formatter',
  },
  description: {
    es: 'Comprueba teléfonos españoles, dice si son móviles, fijos o de tarificación especial y los pasa a E.164 (+34612345678) y a formato nacional.',
    en: 'Check Spanish phone numbers, see whether they are mobile, landline or premium rate, and convert them to E.164 (+34612345678) and national format.',
  },
  keywords: {
    es: [
      'validar telefono',
      'telefono españa',
      'formato e164',
      'prefijo 34',
      'telefono movil',
      'numero fijo',
    ],
    en: [
      'spanish phone number',
      'phone validator spain',
      'e164 format',
      'plus 34',
      'spanish mobile number',
    ],
  },
  rememberInput: false,
};
```

`src/tools/phone/strings.ts`:
```ts
import type { Locale } from '../types';
import type { PhoneKind } from './logic';

export const strings = {
  es: {
    input: 'Teléfonos',
    placeholder: '+34 612 34 56 78\n(91) 234-56-78',
    help: 'Uno por línea, hasta 1000. Lo que escribes no se guarda en ningún sitio.',
    result: 'Resultado',
    empty: 'Escribe un teléfono de España, con o sin +34, espacios o guiones.',
    count: '{ok} válidos · {bad} no válidos',
    truncated: 'Solo se comprueban las primeras {n} líneas.',
    kind: 'Tipo',
    e164: 'E.164',
    national: 'Nacional',
    international: 'Internacional',
    link: 'Enlace',
    call: 'Llamar',
    errForeign: 'Solo números de España (+34).',
    errShort: 'Es un número corto: no tiene formato E.164.',
    errFew: 'Faltan cifras: un teléfono de España tiene 9.',
    errMany: 'Sobran cifras: un teléfono de España tiene 9.',
    errChars: 'Solo cifras, espacios, puntos, guiones, paréntesis y el prefijo +34.',
    errPattern: 'No es un número de España válido: tiene 9 cifras y empieza por 6, 7, 8 o 9.',
    copy: 'Copiar en E.164',
  },
  en: {
    input: 'Phone numbers',
    placeholder: '+34 612 34 56 78\n(91) 234-56-78',
    help: 'One per line, up to 1000. What you type is not stored anywhere.',
    result: 'Result',
    empty: 'Type a Spanish phone number, with or without +34, spaces or dashes.',
    count: '{ok} valid · {bad} not valid',
    truncated: 'Only the first {n} lines are checked.',
    kind: 'Type',
    e164: 'E.164',
    national: 'National',
    international: 'International',
    link: 'Link',
    call: 'Call',
    errForeign: 'Spanish numbers only (+34).',
    errShort: 'It is a short number: it has no E.164 form.',
    errFew: 'Digits missing: a Spanish number has 9.',
    errMany: 'Too many digits: a Spanish number has 9.',
    errChars: 'Digits, spaces, dots, dashes, brackets and the +34 prefix only.',
    errPattern: 'Not a valid Spanish number: it has 9 digits and starts with 6, 7, 8 or 9.',
    copy: 'Copy as E.164',
  },
} satisfies Record<Locale, Record<string, string>>;

export const kindNames: Record<Locale, Record<PhoneKind, string>> = {
  es: {
    mobile: 'Móvil',
    personal: 'Número personal',
    freephone: 'Gratuito',
    specialRate: 'Tarifa especial',
    premium: 'Tarificación adicional',
    landline: 'Fijo',
    corporate: 'Red corporativa',
  },
  en: {
    mobile: 'Mobile',
    personal: 'Personal number',
    freephone: 'Freephone',
    specialRate: 'Special rate',
    premium: 'Premium rate',
    landline: 'Landline',
    corporate: 'Corporate network',
  },
};
```

- [ ] **Step 7: Contenido SEO**

`src/tools/phone/content.es.md`:
```md
## Qué comprueba

Los teléfonos de España tienen 9 cifras, y la primera o las primeras indican el tipo: los móviles empiezan por 6 o por 71–74, los fijos por 8 o 9 seguidos de 1–8, los gratuitos por 800 o 900, los de tarifa especial por 901 o 902 y los de tarificación adicional por 803, 806, 807 o 905. La herramienta quita espacios, puntos, guiones y paréntesis, reconoce el prefijo en sus tres formas (`+34`, `0034` o `34` delante de 9 cifras) y te dice de qué tipo es cada número.

## E.164 y formatos de salida

E.164 es el formato internacional sin espacios que piden las APIs de SMS, WhatsApp o los campos `tel:`: `+34612345678`. Además tienes el formato nacional (`612 34 56 78`), el internacional con espacios y un enlace para llamar. Puedes pegar una columna entera de números, uno por línea, y copiar todos normalizados de una vez.

Los números cortos como el 112 o el 016 no tienen formato E.164 y se indican aparte. Solo se validan números de España; lo que escribes no se guarda, porque un teléfono es un dato personal.
```

`src/tools/phone/content.en.md`:
```md
## What it checks

Spanish phone numbers have 9 digits, and the first ones tell the type: mobiles start with 6 or 71–74, landlines with 8 or 9 followed by 1–8, freephone numbers with 800 or 900, special-rate numbers with 901 or 902 and premium-rate numbers with 803, 806, 807 or 905. The tool strips spaces, dots, dashes and brackets, recognises the country code in its three forms (`+34`, `0034` or `34` before 9 digits) and tells you the type of each number.

## E.164 and output formats

E.164 is the international format without spaces that SMS and WhatsApp APIs and `tel:` links expect: `+34612345678`. You also get the national format (`612 34 56 78`), the international one with spaces and a link to call. Paste a whole column of numbers, one per line, and copy them all normalized at once.

Short numbers such as 112 or 016 have no E.164 form and are flagged separately. Only Spanish numbers are validated; what you type is not stored, because a phone number is personal data.
```

- [ ] **Step 8: `src/tools/phone/Phone.svelte`**

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { MAX_LINES, splitLines } from '../../lib/ids';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import type { Locale } from '../types';
  import { validatePhone, type PhoneResult } from './logic';
  import { kindNames, strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const kinds = $derived(kindNames[locale]);

  // meta.rememberInput is false: phone numbers are personal data.
  let input = $state('');

  const split = $derived(splitLines(input));
  const results = $derived(split.lines.map((line) => ({ line, r: validatePhone(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);

  function reason(r: PhoneResult): string {
    if (r.ok) return kinds[r.kind];
    switch (r.reason) {
      case 'foreign':
        return s.errForeign;
      case 'short':
        return s.errShort;
      case 'fewDigits':
        return s.errFew;
      case 'manyDigits':
        return s.errMany;
      case 'pattern':
        return s.errPattern;
      default:
        return s.errChars;
    }
  }

  const copyValue = $derived(results.map((x) => (x.r.ok ? x.r.e164 : x.line)).join('\n'));
</script>

<div class="panel">
  <Field id="phone-input" label={s.input} help={s.help}>
    {#snippet children({ describedby })}
      <TextArea
        id="phone-input"
        bind:value={input}
        rows={3}
        placeholder={s.placeholder}
        {describedby}
        invalid={single !== null && !single.ok}
      />
    {/snippet}
  </Field>

  <Display live label={s.result}>
    {#snippet head()}
      {#if results.length === 0}
        <Led state="idle" label={t(locale, 'led.idle')} />
      {:else if single}
        <Led
          state={single.ok ? 'ok' : 'bad'}
          label={single.ok ? reason(single) : t(locale, 'led.bad')}
        />
      {:else}
        <span>{fill(s.count, { ok: okCount, bad: results.length - okCount })}</span>
      {/if}
    {/snippet}
    {#if results.length === 0}
      <p class="display-note">{s.empty}</p>
    {:else if single}
      {#if single.ok}
        <div class="display-value">{single.e164}</div>
        <dl class="display-kv">
          <dt>{s.kind}</dt>
          <dd>{kinds[single.kind]}</dd>
          <dt>{s.national}</dt>
          <dd>{single.nationalFormatted}</dd>
          <dt>{s.international}</dt>
          <dd>{single.international}</dd>
          <dt>{s.link}</dt>
          <dd><a href={single.tel}>{s.call}</a></dd>
        </dl>
      {:else}
        <p class="display-note">{reason(single)}</p>
      {/if}
    {:else}
      <div class="display-rows">
        {#each results as x, i (i)}
          <div class="display-row">
            <Led state={x.r.ok ? 'ok' : 'bad'} label={x.r.ok ? x.r.e164 : x.line} />
            <span class="why">{reason(x.r)}</span>
          </div>
        {/each}
      </div>
      {#if split.truncated}<p class="display-note">{fill(s.truncated, { n: MAX_LINES })}</p>{/if}
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={copyValue} {locale} label={s.copy} />
    <Button variant="ghost" disabled={!input} onclick={() => (input = '')}>
      {t(locale, 'ui.clear')}
    </Button>
  </div>
</div>

<style>
  .why {
    flex: 1;
    text-align: right;
    font: 400 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--disp-dim);
  }
  dd a {
    color: var(--disp-text);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as phone } from './phone/meta';
```
→
```ts
import { meta as phone } from './phone/meta';
```
y
```ts
  // phone,
```
→
```ts
  phone,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Phone from '../tools/phone/Phone.svelte';
```
→
```astro
import Phone from '../tools/phone/Phone.svelte';
```
y
```astro
{/* {id === 'phone' && <Phone client:load locale={locale} />} */}
```
→
```astro
{id === 'phone' && <Phone client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/validador-telefonos-espana.html dist/en/spanish-phone-number-validator.html
```
Expected: todo en verde, incluido `registry.test.ts` (título ≤ 65, descripción 51–160, slugs, icono y los dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobar en el navegador (script desechable)**

Crea `check-phone.mjs` en la raíz del worktree (no se confirma nunca):
```js
// Throwaway browser check for the phone task. Never committed: delete it after running.
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const PORT = 4707;
const server = spawn('node_modules/.bin/astro', ['preview', '--port', String(PORT), '--ignore-lock'], {
  stdio: 'ignore',
});
const base = `http://localhost:${PORT}`;
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`${base}/es`)).ok) break;
  } catch {
    // Not listening yet.
  }
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch();
const page = await browser.newPage({ locale: 'es-ES', viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(5000);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => page.locator('.panel').getByText(text).first().waitFor();
const rows = async (n, display) => {
  const scope = display ? page.getByRole('region', { name: display }) : page.locator('.panel');
  const count = await scope.locator('.display-row').count();
  if (count !== n) throw new Error(`expected ${n} rows, got ${count}`);
};
const nothingStored = async (id, typed) => {
  await page.waitForTimeout(500);
  const hits = await page.evaluate(
    ([k, t]) => Object.entries(localStorage).filter(([key, v]) => key.includes(k) || v.includes(t)),
    [id, typed],
  );
  if (hits.length) throw new Error(`stored: ${JSON.stringify(hits)}`);
};
try {
  await page.goto(`${base}/es/validador-telefonos-espana`);
  await page.locator('astro-island[ssr]').first().waitFor({ state: 'detached' });
  await page.locator('#phone-input').fill('+34 612 34 56 78');
  await see('Móvil');
  await page.locator('.display-value').filter({ hasText: '+34612345678' }).waitFor();
  await page.locator('#phone-input').fill('(91) 234-56-78\n112');
  await see('1 válidos · 1 no válidos');
  await see('Es un número corto');
  await nothingStored('phone', '234-56-78');
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`horizontal scroll at ${width} px`);
  }
  for (const theme of ['light', 'dark', 'terminal']) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await page.screenshot({ path: `check-phone-${theme}.png`, fullPage: true });
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK phone');
} finally {
  await browser.close();
  server.kill();
}
```

Run:
```bash
pnpm build && node check-phone.mjs
```
Expected: `OK phone`. El script comprueba que `+34 612 34 56 78` es Móvil con `+34612345678`, dos líneas dan «1 válidos · 1 no válidos» con el 112 como número corto, y nada se guarda. También comprueba que no hay scroll horizontal a 390 px ni a 1280 px y guarda una captura por tema (`check-phone-light.png`, `-dark.png`, `-terminal.png`): ábrelas y confirma que los resultados se leen en la pantalla hundida y que nada se sale del panel en ningún tema.

Después, bórralo todo:
```bash
rm check-phone.mjs check-phone-*.png
```

- [ ] **Step 12: Commit**

```bash
git add src/tools/phone src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni el script ni las capturas). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(phone): teléfonos de España con tipo y formato E.164"
```

---

### Task 8: SWIFT / BIC: forma, país ISO y oficina principal

**Files:**
- Create: `src/tools/bic/logic.ts`, `src/tools/bic/logic.test.ts`, `src/tools/bic/meta.ts`, `src/tools/bic/strings.ts`, `src/tools/bic/content.es.md`, `src/tools/bic/content.en.md`, `src/tools/bic/Bic.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `splitLines`, `MAX_LINES` (`lib/ids`); `persistedInput`; `Intl.DisplayNames`; `fill`; `t`; kit: `Field`, `TextArea`, `Display`, `Led`, `CopyButton`, `Button`, `Toggle`.
- Produces: `COUNTRIES` (250), `type BicReason`, `type BicResult`; `validateBic(raw)`. Además `meta: ToolMeta` (id `bic`, slugs de la tabla de arriba), `strings: Record<Locale, …>` y el componente `Bic` con props `{ locale: Locale }`.
- DOM para la Task 12: `#bic-input`; `.display-kv` con banco, país, localidad, sucursal y formas de 8 y 11.

**§6.8 (vinculante).** Cómo se cubre cada punto:
- Formato `^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$`; 9 o 10 caracteres → «Un BIC tiene 8 u 11 caracteres».
- País contra la lista fija de 250 códigos (ISO 3166-1 + XK); `Intl.DisplayNames` solo para el nombre. «XX no es un código de país ISO 3166».
- Sucursal «Oficina principal» si falta o es `XXX`; `CAIXESBBXXX` y `CAIXESBB` dan el mismo resultado (test). Segundo carácter de localidad `0` → «BIC de pruebas (no operativo)».
- Sin pestañas; `rememberInput: true`.

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-bic -b lote-1/bic   # desde el commit de la Task 0
cd ../devtools-bic
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`.

- [ ] **Step 2: Test (falla)**

`src/tools/bic/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { COUNTRIES, validateBic } from './logic';

describe('COUNTRIES', () => {
  it('has the 249 ISO 3166-1 codes plus XK', () => {
    expect(COUNTRIES.size).toBe(250);
    expect(COUNTRIES.has('XK')).toBe(true);
    expect(COUNTRIES.has('ES')).toBe(true);
    expect(COUNTRIES.has('AN')).toBe(false);
    expect(COUNTRIES.has('YU')).toBe(false);
  });
});

describe('validateBic', () => {
  it('treats CAIXESBBXXX and CAIXESBB as the same head office', () => {
    const long = validateBic('caixesbbxxx');
    expect(long).toEqual({
      ok: true,
      bank: 'CAIX',
      country: 'ES',
      location: 'BB',
      branch: null,
      bic8: 'CAIXESBB',
      bic11: 'CAIXESBBXXX',
      test: false,
    });
    expect(validateBic('CAIXESBB')).toEqual(long);
  });

  it('keeps a real branch code', () => {
    expect(validateBic('DEUT DE FF 500')).toMatchObject({
      ok: true,
      branch: '500',
      bic8: 'DEUTDEFF',
      bic11: 'DEUTDEFF500',
    });
  });

  it('flags test BICs (0 as the second location character)', () => {
    expect(validateBic('NEDSZAJ0')).toMatchObject({ ok: true, test: true });
  });

  it('explains what is wrong', () => {
    expect(validateBic('CAIXESBBX')).toEqual({ ok: false, reason: 'length', length: 9 });
    expect(validateBic('CAIXESBBXX')).toEqual({ ok: false, reason: 'length', length: 10 });
    expect(validateBic('CAIXXXBB')).toEqual({ ok: false, reason: 'country', country: 'XX' });
    expect(validateBic('CA1XESBB')).toEqual({ ok: false, reason: 'bank' });
    expect(validateBic('CAIXESB_')).toEqual({ ok: false, reason: 'format' });
    expect(validateBic('')).toEqual({ ok: false, reason: 'empty' });
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/bic`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/bic/logic.ts`**

```ts
/**
 * ISO 3166-1 alpha-2 plus XK (Kosovo): 250 codes. A fixed list, because Intl.DisplayNames
 * also accepts withdrawn codes (AN, YU…). Intl is only used to show the name.
 * Source: ISO 3166 Maintenance Agency, checked 2026-09-26.
 */
// prettier-ignore
export const COUNTRIES: ReadonlySet<string> = new Set(
  ('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ ' +
   'BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM ' +
   'DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS ' +
   'GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN ' +
   'KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ ' +
   'MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM ' +
   'PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV ' +
   'SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI ' +
   'VN VU WF WS XK YE YT ZA ZM ZW').split(' '),
);

export type BicReason = 'empty' | 'length' | 'bank' | 'country' | 'format';

export type BicResult =
  | {
      ok: true;
      bank: string;
      country: string;
      location: string;
      /** Null for the head office: no branch code, or XXX. */
      branch: string | null;
      bic8: string;
      bic11: string;
      /** A 0 as the second character of the location marks a test BIC. */
      test: boolean;
    }
  | { ok: false; reason: BicReason; length?: number; country?: string };

export function validateBic(raw: string): BicResult {
  const s = raw.toUpperCase().replace(/[\s-]/g, '');
  if (!s) return { ok: false, reason: 'empty' };
  if (s.length !== 8 && s.length !== 11) return { ok: false, reason: 'length', length: s.length };
  if (!/^[A-Z]{4}/.test(s)) return { ok: false, reason: 'bank' };
  const country = s.slice(4, 6);
  if (!/^[A-Z]{2}$/.test(country) || !COUNTRIES.has(country)) {
    return { ok: false, reason: 'country', country };
  }
  if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(s))
    return { ok: false, reason: 'format' };
  const location = s.slice(6, 8);
  const code = s.slice(8);
  const branch = code === '' || code === 'XXX' ? null : code;
  return {
    ok: true,
    bank: s.slice(0, 4),
    country,
    location,
    branch,
    bic8: s.slice(0, 8),
    bic11: s.slice(0, 8) + (code || 'XXX'),
    test: location[1] === '0',
  };
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/bic`
Expected: PASS, incluido el test de ida y vuelta de 1 000 valores si la herramienta genera.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/bic/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'bic',
  category: 'ids',
  icon: 'globe',
  slug: { es: 'validador-swift-bic', en: 'swift-bic-validator' },
  name: { es: 'SWIFT / BIC', en: 'SWIFT / BIC' },
  title: {
    es: 'Validador de códigos SWIFT / BIC online',
    en: 'SWIFT / BIC code validator',
  },
  description: {
    es: 'Comprueba un código SWIFT o BIC de 8 u 11 caracteres y lo desglosa: banco, país, localidad y sucursal, con sus formas corta y larga.',
    en: 'Check an 8 or 11 character SWIFT or BIC code and break it down: bank, country, location and branch, with its short and long forms.',
  },
  keywords: {
    es: ['validar swift', 'codigo bic', 'swift banco', 'bic españa', 'comprobar bic'],
    en: ['swift code validator', 'bic code', 'check swift code', 'bic format', 'swift bic lookup'],
  },
  rememberInput: true,
};
```

`src/tools/bic/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    input: 'Código SWIFT / BIC',
    placeholder: 'CAIXESBBXXX',
    help: 'Uno por línea, hasta 1000.',
    result: 'Resultado',
    empty: 'Escribe un BIC de 8 u 11 caracteres (CAIXESBBXXX).',
    valid: 'BIC válido',
    count: '{ok} válidos · {bad} no válidos',
    truncated: 'Solo se comprueban las primeras {n} líneas.',
    bank: 'Banco',
    country: 'País',
    location: 'Localidad',
    branch: 'Sucursal',
    headOffice: 'Oficina principal',
    short: 'Forma de 8',
    long: 'Forma de 11',
    test: 'BIC de pruebas (no operativo).',
    errLength: 'Un BIC tiene 8 u 11 caracteres y este tiene {n}.',
    errBank: 'Los 4 primeros caracteres (el banco) son letras.',
    errCountry: '{c} no es un código de país ISO 3166.',
    errFormat: 'La localidad y la sucursal solo admiten letras y cifras.',
  },
  en: {
    input: 'SWIFT / BIC code',
    placeholder: 'CAIXESBBXXX',
    help: 'One per line, up to 1000.',
    result: 'Result',
    empty: 'Type an 8 or 11 character BIC (CAIXESBBXXX).',
    valid: 'Valid BIC',
    count: '{ok} valid · {bad} not valid',
    truncated: 'Only the first {n} lines are checked.',
    bank: 'Bank',
    country: 'Country',
    location: 'Location',
    branch: 'Branch',
    headOffice: 'Head office',
    short: '8-character form',
    long: '11-character form',
    test: 'Test BIC (not live).',
    errLength: 'A BIC has 8 or 11 characters and this one has {n}.',
    errBank: 'The first 4 characters (the bank) are letters.',
    errCountry: '{c} is not an ISO 3166 country code.',
    errFormat: 'Location and branch only take letters and digits.',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/bic/content.es.md`:
```md
## Cómo se lee un BIC

El BIC (o código SWIFT) identifica a un banco en las transferencias internacionales. Tiene 8 u 11 caracteres: 4 letras para el banco (`CAIX` es CaixaBank), 2 para el país (`ES`), 2 letras o cifras para la localidad (`BB`) y, opcionalmente, 3 para la sucursal. Si no hay sucursal, o es `XXX`, se refiere a la oficina principal, así que `CAIXESBB` y `CAIXESBBXXX` son el mismo código.

El validador comprueba la forma y que el país sea un código ISO 3166 vigente (más Kosovo, `XK`, que SWIFT usa). Cuando la localidad lleva un 0 como segundo carácter, avisa de que es un BIC de pruebas, que no sirve para operaciones reales.

## Lo que no hace

No tiene la base de datos de SWIFT, así que no dice a qué banco pertenece un código ni si está dado de alta: solo si su formato es correcto. Para una transferencia SEPA dentro de la zona euro normalmente basta con el IBAN; el BIC se sigue pidiendo en pagos internacionales fuera de ella.
```

`src/tools/bic/content.en.md`:
```md
## How to read a BIC

The BIC (or SWIFT code) identifies a bank in international transfers. It has 8 or 11 characters: 4 letters for the bank (`CAIX` is CaixaBank), 2 for the country (`ES`), 2 letters or digits for the location (`BB`) and, optionally, 3 for the branch. Without a branch, or with `XXX`, it means the head office, so `CAIXESBB` and `CAIXESBBXXX` are the same code.

The validator checks the shape and that the country is a current ISO 3166 code (plus Kosovo, `XK`, which SWIFT uses). When the location has a 0 as its second character, it warns that this is a test BIC, which cannot be used for real payments.

## What it does not do

It does not have the SWIFT directory, so it cannot tell which bank a code belongs to or whether it is registered: only whether its format is right. For a SEPA transfer inside the euro area the IBAN is usually enough; the BIC is still asked for in international payments outside it.
```

- [ ] **Step 8: `src/tools/bic/Bic.svelte`**

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { MAX_LINES, splitLines } from '../../lib/ids';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { validateBic, type BicResult } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  // BIC codes are public bank identifiers.
  const input = persistedInput('bic', '', meta.rememberInput ?? true);

  function countryName(code: string): string {
    try {
      return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
    } catch {
      return code;
    }
  }

  const split = $derived(splitLines(input.value));
  const results = $derived(split.lines.map((line) => ({ line, r: validateBic(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);

  function reason(r: BicResult): string {
    if (r.ok) return countryName(r.country);
    switch (r.reason) {
      case 'length':
        return fill(s.errLength, { n: r.length ?? 0 });
      case 'bank':
        return s.errBank;
      case 'country':
        return fill(s.errCountry, { c: r.country ?? '' });
      default:
        return s.errFormat;
    }
  }

  const copyValue = $derived(results.map((x) => (x.r.ok ? x.r.bic11 : x.line)).join('\n'));
</script>

<div class="panel">
  <Field id="bic-input" label={s.input} help={s.help}>
    {#snippet children({ describedby })}
      <TextArea
        id="bic-input"
        bind:value={input.value}
        rows={3}
        placeholder={s.placeholder}
        {describedby}
        invalid={single !== null && !single.ok}
      />
    {/snippet}
  </Field>

  <Display live label={s.result}>
    {#snippet head()}
      {#if results.length === 0}
        <Led state="idle" label={t(locale, 'led.idle')} />
      {:else if single}
        <Led state={single.ok ? 'ok' : 'bad'} label={single.ok ? s.valid : t(locale, 'led.bad')} />
      {:else}
        <span>{fill(s.count, { ok: okCount, bad: results.length - okCount })}</span>
      {/if}
    {/snippet}
    {#if results.length === 0}
      <p class="display-note">{s.empty}</p>
    {:else if single}
      {#if single.ok}
        <div class="display-value">{single.bic11}</div>
        <dl class="display-kv">
          <dt>{s.bank}</dt>
          <dd>{single.bank}</dd>
          <dt>{s.country}</dt>
          <dd>{single.country} · {countryName(single.country)}</dd>
          <dt>{s.location}</dt>
          <dd>{single.location}</dd>
          <dt>{s.branch}</dt>
          <dd>{single.branch ?? s.headOffice}</dd>
          <dt>{s.short}</dt>
          <dd>{single.bic8}</dd>
          <dt>{s.long}</dt>
          <dd>{single.bic11}</dd>
        </dl>
        {#if single.test}<p class="display-note">{s.test}</p>{/if}
      {:else}
        <p class="display-note">{reason(single)}</p>
      {/if}
    {:else}
      <div class="display-rows">
        {#each results as x, i (i)}
          <div class="display-row">
            <Led state={x.r.ok ? 'ok' : 'bad'} label={x.r.ok ? x.r.bic11 : x.line} />
            <span class="why">{reason(x.r)}</span>
          </div>
        {/each}
      </div>
      {#if split.truncated}<p class="display-note">{fill(s.truncated, { n: MAX_LINES })}</p>{/if}
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={copyValue} {locale} />
    <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}>
      {t(locale, 'ui.clear')}
    </Button>
  </div>
  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .why {
    flex: 1;
    text-align: right;
    font: 400 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--disp-dim);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as bic } from './bic/meta';
```
→
```ts
import { meta as bic } from './bic/meta';
```
y
```ts
  // bic,
```
→
```ts
  bic,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Bic from '../tools/bic/Bic.svelte';
```
→
```astro
import Bic from '../tools/bic/Bic.svelte';
```
y
```astro
{/* {id === 'bic' && <Bic client:load locale={locale} />} */}
```
→
```astro
{id === 'bic' && <Bic client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/validador-swift-bic.html dist/en/swift-bic-validator.html
```
Expected: todo en verde, incluido `registry.test.ts` (título ≤ 65, descripción 51–160, slugs, icono y los dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobar en el navegador (script desechable)**

Crea `check-bic.mjs` en la raíz del worktree (no se confirma nunca):
```js
// Throwaway browser check for the bic task. Never committed: delete it after running.
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const PORT = 4708;
const server = spawn('node_modules/.bin/astro', ['preview', '--port', String(PORT), '--ignore-lock'], {
  stdio: 'ignore',
});
const base = `http://localhost:${PORT}`;
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`${base}/es`)).ok) break;
  } catch {
    // Not listening yet.
  }
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch();
const page = await browser.newPage({ locale: 'es-ES', viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(5000);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => page.locator('.panel').getByText(text).first().waitFor();
const rows = async (n, display) => {
  const scope = display ? page.getByRole('region', { name: display }) : page.locator('.panel');
  const count = await scope.locator('.display-row').count();
  if (count !== n) throw new Error(`expected ${n} rows, got ${count}`);
};
const nothingStored = async (id, typed) => {
  await page.waitForTimeout(500);
  const hits = await page.evaluate(
    ([k, t]) => Object.entries(localStorage).filter(([key, v]) => key.includes(k) || v.includes(t)),
    [id, typed],
  );
  if (hits.length) throw new Error(`stored: ${JSON.stringify(hits)}`);
};
try {
  await page.goto(`${base}/es/validador-swift-bic`);
  await page.locator('astro-island[ssr]').first().waitFor({ state: 'detached' });
  await page.locator('#bic-input').fill('caixesbbxxx');
  await see('BIC válido');
  await see('Oficina principal');
  await page.locator('#bic-input').fill('CAIXXXBB');
  await see('XX no es un código de país ISO 3166.');
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`horizontal scroll at ${width} px`);
  }
  for (const theme of ['light', 'dark', 'terminal']) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await page.screenshot({ path: `check-bic-${theme}.png`, fullPage: true });
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK bic');
} finally {
  await browser.close();
  server.kill();
}
```

Run:
```bash
pnpm build && node check-bic.mjs
```
Expected: `OK bic`. El script comprueba que `caixesbbxxx` es válido con «Oficina principal» y `CAIXXXBB` explica el país. También comprueba que no hay scroll horizontal a 390 px ni a 1280 px y guarda una captura por tema (`check-bic-light.png`, `-dark.png`, `-terminal.png`): ábrelas y confirma que los resultados se leen en la pantalla hundida y que nada se sale del panel en ningún tema.

Después, bórralo todo:
```bash
rm check-bic.mjs check-bic-*.png
```

- [ ] **Step 12: Commit**

```bash
git add src/tools/bic src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni el script ni las capturas). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(bic): validador de SWIFT / BIC"
```

---

### Task 9: EAN-13 e ISBN: control, dígito que falta y conversión 10 ↔ 13

**Files:**
- Create: `src/tools/ean-isbn/logic.ts`, `src/tools/ean-isbn/logic.test.ts`, `src/tools/ean-isbn/meta.ts`, `src/tools/ean-isbn/strings.ts`, `src/tools/ean-isbn/content.es.md`, `src/tools/ean-isbn/content.en.md`, `src/tools/ean-isbn/EanIsbn.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `splitLines`, `MAX_LINES` (`lib/ids`); `persistedInput`; `fill`; `t`; kit: `Field`, `TextArea`, `Display`, `Led`, `CopyButton`, `Button`, `Toggle`.
- Produces: `type Gs1Prefix`, `type CodeReason`, `type CodeResult`; `eanCheckDigit`, `isbn10CheckChar`, `isbn10to13`, `isbn13to10`, `gs1Prefix`, `validateCode`. `strings.ts` exporta `prefixNames`. Además `meta: ToolMeta` (id `ean-isbn`, slugs de la tabla de arriba), `strings: Record<Locale, …>` y el componente `EanIsbn` con props `{ locale: Locale }`.
- DOM para la Task 12: `#ean-isbn-input`; `.display-kv` con el ISBN equivalente y el prefijo GS1.

**§6.9 (vinculante).** Cómo se cubre cada punto:
- Detección por longitud tras quitar espacios y guiones: 13, 12 (calcula el control), 10, 9 (calcula), 8 («EAN-8 no está incluido») y el resto con las longitudes admitidas.
- Fórmulas EAN (pesos 1 y 3) e ISBN-10 (pesos 10–2, X = 10 solo al final; `x` minúscula aceptada). Ejemplos `4006381333931`, `9780306406157 ↔ 0306406152`, `080442957X`.
- Conversión 10 → 13 y 13 → 10 solo con 978; 979 → «Los ISBN que empiezan por 979 no tienen equivalente de 10 cifras».
- Prefijos GS1 informativos: 84, 978/979, 9790 (ISMN), 977 (ISSN) y 20–29.
- Sin pestañas; `rememberInput: true`. El guionado del ISBN queda fuera (lo dice el contenido SEO).

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-ean-isbn -b lote-1/ean-isbn   # desde el commit de la Task 0
cd ../devtools-ean-isbn
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`.

- [ ] **Step 2: Test (falla)**

`src/tools/ean-isbn/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  eanCheckDigit,
  gs1Prefix,
  isbn10CheckChar,
  isbn10to13,
  isbn13to10,
  validateCode,
} from './logic';

describe('check digits: checked examples', () => {
  it('EAN-13', () => {
    expect(eanCheckDigit('400638133393')).toBe('1');
    expect(eanCheckDigit('978030640615')).toBe('7');
  });

  it('ISBN-10, with X for 10', () => {
    expect(isbn10CheckChar('030640615')).toBe('2');
    expect(isbn10CheckChar('080442957')).toBe('X');
  });

  it('converts 9780306406157 ↔ 0306406152', () => {
    expect(isbn10to13('0306406152')).toBe('9780306406157');
    expect(isbn13to10('9780306406157')).toBe('0306406152');
    expect(isbn13to10('9791234567896')).toBeNull();
  });
});

describe('validateCode', () => {
  it('reads 13 digits as EAN-13 and, with 978, as ISBN-13 too', () => {
    expect(validateCode('4006381333931')).toEqual({
      ok: true,
      format: 'ean13',
      code: '4006381333931',
      isbn: false,
      isbn10: null,
      prefix: null,
    });
    expect(validateCode('978-0-306-40615-7')).toEqual({
      ok: true,
      format: 'ean13',
      code: '9780306406157',
      isbn: true,
      isbn10: '0306406152',
      prefix: 'isbn',
    });
  });

  it('has no 10-digit form for 979', () => {
    const code = '979123456789' + eanCheckDigit('979123456789');
    expect(validateCode(code)).toMatchObject({ ok: true, isbn: true, isbn10: null });
  });

  it('reads 10 characters as ISBN-10 and accepts a lower-case x', () => {
    expect(validateCode('0306406152')).toEqual({
      ok: true,
      format: 'isbn10',
      code: '0306406152',
      isbn13: '9780306406157',
    });
    expect(validateCode('080442957x')).toMatchObject({ ok: true, code: '080442957X' });
  });

  it('completes 12 and 9 digits with their check digit', () => {
    expect(validateCode('400638133393')).toEqual({
      ok: false,
      reason: 'eanMissing',
      expected: '1',
      completed: '4006381333931',
    });
    expect(validateCode('030640615')).toMatchObject({
      reason: 'isbnMissing',
      expected: '2',
      completed: '0306406152',
    });
  });

  it('says which check digit is right', () => {
    expect(validateCode('4006381333932')).toMatchObject({ reason: 'eanCheck', expected: '1' });
    expect(validateCode('0306406153')).toMatchObject({ reason: 'isbnCheck', expected: '2' });
  });

  it('rejects X in the middle, EAN-8 and other lengths', () => {
    expect(validateCode('03064X6152')).toEqual({ ok: false, reason: 'xPosition' });
    expect(validateCode('96385074')).toEqual({ ok: false, reason: 'ean8' });
    expect(validateCode('12345')).toEqual({ ok: false, reason: 'length', length: 5 });
    expect(validateCode('97803A6406157')).toEqual({ ok: false, reason: 'chars' });
    expect(validateCode('')).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('gs1Prefix', () => {
  it('names the few prefixes the page explains', () => {
    expect(gs1Prefix('8412345678905')).toBe('spain');
    expect(gs1Prefix('9780306406157')).toBe('isbn');
    expect(gs1Prefix('9790123456785')).toBe('ismn');
    expect(gs1Prefix('9771234567003')).toBe('issn');
    expect(gs1Prefix('2012345678903')).toBe('store');
    expect(gs1Prefix('4006381333931')).toBeNull();
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/ean-isbn`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/ean-isbn/logic.ts`**

```ts
export type Gs1Prefix = 'spain' | 'isbn' | 'ismn' | 'issn' | 'store' | null;

export type CodeReason =
  | 'empty'
  | 'chars'
  | 'xPosition'
  | 'ean8'
  | 'length'
  | 'eanCheck'
  | 'isbnCheck'
  | 'eanMissing'
  | 'isbnMissing';

export type CodeResult =
  | {
      ok: true;
      format: 'ean13';
      code: string;
      /** 978 or 979: it is also an ISBN-13. */
      isbn: boolean;
      /** Only for 978; 979 has no 10-digit equivalent. */
      isbn10: string | null;
      prefix: Gs1Prefix;
    }
  | { ok: true; format: 'isbn10'; code: string; isbn13: string }
  | {
      ok: false;
      reason: CodeReason;
      length?: number;
      /** The check digit (or X) that is right. */
      expected?: string;
      /** The full code with the right check digit. */
      completed?: string;
    };

/** EAN-13 / ISBN-13: weights 1, 3, 1, 3… from the left over the first 12 digits. */
export function eanCheckDigit(twelve: string): string {
  let s = 0;
  for (let i = 0; i < 12; i++) s += Number(twelve[i]) * (i % 2 === 0 ? 1 : 3);
  return String((10 - (s % 10)) % 10);
}

/** ISBN-10: weights 10 to 2 over the first 9 digits; 10 is written X. */
export function isbn10CheckChar(nine: string): string {
  let s = 0;
  for (let i = 0; i < 9; i++) s += Number(nine[i]) * (10 - i);
  const c = (11 - (s % 11)) % 11;
  return c === 10 ? 'X' : String(c);
}

export function isbn10to13(isbn10: string): string {
  const twelve = '978' + isbn10.slice(0, 9);
  return twelve + eanCheckDigit(twelve);
}

/** Only for the 978 prefix. */
export function isbn13to10(isbn13: string): string | null {
  if (!isbn13.startsWith('978')) return null;
  const nine = isbn13.slice(3, 12);
  return nine + isbn10CheckChar(nine);
}

/** Informative only: the few GS1 prefixes the page names. */
export function gs1Prefix(ean: string): Gs1Prefix {
  if (ean.startsWith('9790')) return 'ismn';
  if (/^97[89]/.test(ean)) return 'isbn';
  if (ean.startsWith('977')) return 'issn';
  if (ean.startsWith('84')) return 'spain';
  if (/^2\d/.test(ean)) return 'store';
  return null;
}

export function validateCode(raw: string): CodeResult {
  const s = raw.toUpperCase().replace(/[\s-]/g, '');
  if (!s) return { ok: false, reason: 'empty' };
  if (!/^[\dX]+$/.test(s)) return { ok: false, reason: 'chars' };
  if (s.includes('X') && !/^\d{9}X$/.test(s)) return { ok: false, reason: 'xPosition' };

  switch (s.length) {
    case 13: {
      const expected = eanCheckDigit(s);
      if (s[12] !== expected) {
        return { ok: false, reason: 'eanCheck', expected, completed: s.slice(0, 12) + expected };
      }
      const isbn = /^97[89]/.test(s);
      return {
        ok: true,
        format: 'ean13',
        code: s,
        isbn,
        isbn10: isbn ? isbn13to10(s) : null,
        prefix: gs1Prefix(s),
      };
    }
    case 12: {
      const expected = eanCheckDigit(s);
      return { ok: false, reason: 'eanMissing', expected, completed: s + expected };
    }
    case 10: {
      const expected = isbn10CheckChar(s);
      if (s[9] !== expected) {
        return { ok: false, reason: 'isbnCheck', expected, completed: s.slice(0, 9) + expected };
      }
      return { ok: true, format: 'isbn10', code: s, isbn13: isbn10to13(s) };
    }
    case 9: {
      const expected = isbn10CheckChar(s);
      return { ok: false, reason: 'isbnMissing', expected, completed: s + expected };
    }
    case 8:
      return { ok: false, reason: 'ean8' };
    default:
      return { ok: false, reason: 'length', length: s.length };
  }
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/ean-isbn`
Expected: PASS, incluido el test de ida y vuelta de 1 000 valores si la herramienta genera.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/ean-isbn/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'ean-isbn',
  category: 'ids',
  icon: 'barcode',
  slug: { es: 'validador-ean-isbn', en: 'ean-isbn-validator' },
  name: { es: 'EAN e ISBN', en: 'EAN & ISBN' },
  title: {
    es: 'Validador de EAN-13 e ISBN y conversor ISBN-10 ↔ 13',
    en: 'EAN-13 and ISBN validator, ISBN-10 to ISBN-13',
  },
  description: {
    es: 'Comprueba el dígito de control de códigos de barras EAN-13 e ISBN, calcula el que falta y convierte ISBN-10 en ISBN-13 y al revés.',
    en: 'Check the check digit of EAN-13 barcodes and ISBNs, work out a missing one and convert ISBN-10 to ISBN-13 and back.',
  },
  keywords: {
    es: [
      'validar ean',
      'ean 13',
      'validar isbn',
      'isbn 10 a 13',
      'digito control ean',
      'codigo de barras',
    ],
    en: [
      'ean validator',
      'ean 13 check digit',
      'isbn validator',
      'isbn 10 to 13',
      'barcode check digit',
    ],
  },
  rememberInput: true,
};
```

`src/tools/ean-isbn/strings.ts`:
```ts
import type { Locale } from '../types';
import type { Gs1Prefix } from './logic';

export const strings = {
  es: {
    input: 'EAN-13 o ISBN',
    placeholder: '9780306406157\n0306406152',
    help: 'Uno por línea, hasta 1000. Con 12 o 9 cifras se calcula el dígito que falta.',
    result: 'Resultado',
    empty: 'Escribe un EAN-13 (13 cifras) o un ISBN-10 (10 caracteres).',
    validEan: 'EAN-13 válido',
    validIsbn13: 'ISBN-13 válido',
    validIsbn10: 'ISBN-10 válido',
    count: '{ok} válidos · {bad} no válidos',
    truncated: 'Solo se comprueban las primeras {n} líneas.',
    format: 'Formato',
    isbn10: 'ISBN-10',
    isbn13: 'ISBN-13',
    prefix: 'Prefijo GS1',
    no979: 'Los ISBN que empiezan por 979 no tienen equivalente de 10 cifras.',
    errEanCheck: 'El dígito de control no cuadra: debería ser {e} ({c}).',
    errIsbnCheck: 'El dígito de control no cuadra: debería ser {e} ({c}).',
    errEanMissing: 'Falta el dígito de control: sería {e} ({c}).',
    errIsbnMissing: 'Falta el dígito de control: sería {e} ({c}).',
    errEan8: 'EAN-8 no está incluido.',
    errLength: 'Longitud no admitida ({n}): usa 13 o 12 cifras (EAN-13) o 10 o 9 (ISBN-10).',
    errX: 'La X solo puede ir al final de un ISBN-10.',
    errChars: 'Solo cifras, espacios, guiones y la X final de un ISBN-10.',
  },
  en: {
    input: 'EAN-13 or ISBN',
    placeholder: '9780306406157\n0306406152',
    help: 'One per line, up to 1000. With 12 or 9 digits the missing check digit is worked out.',
    result: 'Result',
    empty: 'Type an EAN-13 (13 digits) or an ISBN-10 (10 characters).',
    validEan: 'Valid EAN-13',
    validIsbn13: 'Valid ISBN-13',
    validIsbn10: 'Valid ISBN-10',
    count: '{ok} valid · {bad} not valid',
    truncated: 'Only the first {n} lines are checked.',
    format: 'Format',
    isbn10: 'ISBN-10',
    isbn13: 'ISBN-13',
    prefix: 'GS1 prefix',
    no979: 'ISBNs starting with 979 have no 10-digit equivalent.',
    errEanCheck: 'The check digit does not match: it should be {e} ({c}).',
    errIsbnCheck: 'The check digit does not match: it should be {e} ({c}).',
    errEanMissing: 'The check digit is missing: it would be {e} ({c}).',
    errIsbnMissing: 'The check digit is missing: it would be {e} ({c}).',
    errEan8: 'EAN-8 is not included.',
    errLength: 'Unsupported length ({n}): use 13 or 12 digits (EAN-13) or 10 or 9 (ISBN-10).',
    errX: 'X can only be the last character of an ISBN-10.',
    errChars: 'Digits, spaces, dashes and the final X of an ISBN-10 only.',
  },
} satisfies Record<Locale, Record<string, string>>;

export const prefixNames: Record<Locale, Record<Exclude<Gs1Prefix, null>, string>> = {
  es: {
    spain: '84 · España',
    isbn: '978/979 · Libros (ISBN)',
    ismn: '9790 · Partituras (ISMN)',
    issn: '977 · Publicaciones periódicas (ISSN)',
    store: '20–29 · Uso interno de tienda',
  },
  en: {
    spain: '84 · Spain',
    isbn: '978/979 · Books (ISBN)',
    ismn: '9790 · Sheet music (ISMN)',
    issn: '977 · Periodicals (ISSN)',
    store: '20–29 · In-store use',
  },
};
```

- [ ] **Step 7: Contenido SEO**

`src/tools/ean-isbn/content.es.md`:
```md
## EAN-13 e ISBN-13

El EAN-13 es el código de barras de casi cualquier producto: 12 cifras y un dígito de control. El control se calcula multiplicando las cifras por 1 y por 3 de forma alterna, de izquierda a derecha, y buscando lo que falta hasta la siguiente decena. Desde 2007 los libros usan el mismo formato con el prefijo 978 o 979: un ISBN-13 es un EAN-13. Las primeras cifras dan una pista del origen: 84 se asigna en España, 977 a revistas y periódicos, y del 20 al 29 quedan para uso interno de las tiendas.

## ISBN-10 y conversión

Antes de 2007 el ISBN tenía 10 caracteres y otra fórmula: pesos de 10 a 2 y resto entre 11, por lo que el control puede valer 10 y se escribe X (`080442957X`). Para pasar un ISBN-10 a 13 se pone 978 delante, se quitan el control antiguo y se calcula el nuevo; al revés solo se puede con el prefijo 978, porque los 979 nacieron ya con 13 cifras.

Si te falta el último dígito, escribe 12 o 9 cifras y la herramienta lo calcula. No añade los guiones por grupos del ISBN: eso requiere la tabla de rangos de la Agencia Internacional del ISBN.
```

`src/tools/ean-isbn/content.en.md`:
```md
## EAN-13 and ISBN-13

EAN-13 is the barcode on almost every product: 12 digits and a check digit. The check comes from multiplying the digits by 1 and 3 alternately, from left to right, and taking what is missing to reach the next multiple of ten. Since 2007 books use the same format with the prefix 978 or 979: an ISBN-13 is an EAN-13. The first digits hint at the origin: 84 is assigned in Spain, 977 to magazines and newspapers, and 20 to 29 are kept for in-store use.

## ISBN-10 and conversion

Before 2007 the ISBN had 10 characters and a different formula: weights from 10 to 2 and a remainder modulo 11, so the check can be 10 and is written X (`080442957X`). To turn an ISBN-10 into 13 digits, put 978 in front, drop the old check and compute the new one; the reverse only works with the 978 prefix, because 979 numbers were born with 13 digits.

If the last digit is missing, type 12 or 9 digits and the tool works it out. It does not add the hyphens between ISBN groups: that needs the range table of the International ISBN Agency.
```

- [ ] **Step 8: `src/tools/ean-isbn/EanIsbn.svelte`**

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { MAX_LINES, splitLines } from '../../lib/ids';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { validateCode, type CodeResult } from './logic';
  import { meta } from './meta';
  import { prefixNames, strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  // Product codes are public.
  const input = persistedInput('ean-isbn', '', meta.rememberInput ?? true);

  const split = $derived(splitLines(input.value));
  const results = $derived(split.lines.map((line) => ({ line, r: validateCode(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);

  function title(r: CodeResult): string {
    if (!r.ok) return t(locale, 'led.bad');
    if (r.format === 'isbn10') return s.validIsbn10;
    return r.isbn ? s.validIsbn13 : s.validEan;
  }

  function reason(r: CodeResult): string {
    if (r.ok) return title(r);
    const vars = { e: r.expected ?? '', c: r.completed ?? '' };
    switch (r.reason) {
      case 'eanCheck':
        return fill(s.errEanCheck, vars);
      case 'isbnCheck':
        return fill(s.errIsbnCheck, vars);
      case 'eanMissing':
        return fill(s.errEanMissing, vars);
      case 'isbnMissing':
        return fill(s.errIsbnMissing, vars);
      case 'ean8':
        return s.errEan8;
      case 'length':
        return fill(s.errLength, { n: r.length ?? 0 });
      case 'xPosition':
        return s.errX;
      default:
        return s.errChars;
    }
  }

  const copyValue = $derived(
    results.map((x) => (x.r.ok ? x.r.code : (x.r.completed ?? x.line))).join('\n'),
  );
</script>

<div class="panel">
  <Field id="ean-isbn-input" label={s.input} help={s.help}>
    {#snippet children({ describedby })}
      <TextArea
        id="ean-isbn-input"
        bind:value={input.value}
        rows={3}
        placeholder={s.placeholder}
        {describedby}
        invalid={single !== null && !single.ok}
      />
    {/snippet}
  </Field>

  <Display live label={s.result}>
    {#snippet head()}
      {#if results.length === 0}
        <Led state="idle" label={t(locale, 'led.idle')} />
      {:else if single}
        <Led state={single.ok ? 'ok' : 'bad'} label={title(single)} />
      {:else}
        <span>{fill(s.count, { ok: okCount, bad: results.length - okCount })}</span>
      {/if}
    {/snippet}
    {#if results.length === 0}
      <p class="display-note">{s.empty}</p>
    {:else if single}
      {#if single.ok}
        <div class="display-value">{single.code}</div>
        <dl class="display-kv">
          {#if single.format === 'ean13'}
            {#if single.isbn10}
              <dt>{s.isbn10}</dt>
              <dd>{single.isbn10}</dd>
            {/if}
            {#if single.prefix}
              <dt>{s.prefix}</dt>
              <dd>{prefixNames[locale][single.prefix]}</dd>
            {/if}
          {:else}
            <dt>{s.isbn13}</dt>
            <dd>{single.isbn13}</dd>
          {/if}
        </dl>
        {#if single.format === 'ean13' && single.isbn && !single.isbn10}
          <p class="display-note">{s.no979}</p>
        {/if}
      {:else}
        <p class="display-note">{reason(single)}</p>
      {/if}
    {:else}
      <div class="display-rows">
        {#each results as x, i (i)}
          <div class="display-row">
            <Led state={x.r.ok ? 'ok' : 'bad'} label={x.r.ok ? x.r.code : x.line} />
            <span class="why">{reason(x.r)}</span>
          </div>
        {/each}
      </div>
      {#if split.truncated}<p class="display-note">{fill(s.truncated, { n: MAX_LINES })}</p>{/if}
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={copyValue} {locale} />
    <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}>
      {t(locale, 'ui.clear')}
    </Button>
  </div>
  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .why {
    flex: 1;
    text-align: right;
    font: 400 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--disp-dim);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as eanIsbn } from './ean-isbn/meta';
```
→
```ts
import { meta as eanIsbn } from './ean-isbn/meta';
```
y
```ts
  // eanIsbn,
```
→
```ts
  eanIsbn,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import EanIsbn from '../tools/ean-isbn/EanIsbn.svelte';
```
→
```astro
import EanIsbn from '../tools/ean-isbn/EanIsbn.svelte';
```
y
```astro
{/* {id === 'ean-isbn' && <EanIsbn client:load locale={locale} />} */}
```
→
```astro
{id === 'ean-isbn' && <EanIsbn client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/validador-ean-isbn.html dist/en/ean-isbn-validator.html
```
Expected: todo en verde, incluido `registry.test.ts` (título ≤ 65, descripción 51–160, slugs, icono y los dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobar en el navegador (script desechable)**

Crea `check-ean-isbn.mjs` en la raíz del worktree (no se confirma nunca):
```js
// Throwaway browser check for the ean-isbn task. Never committed: delete it after running.
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const PORT = 4709;
const server = spawn('node_modules/.bin/astro', ['preview', '--port', String(PORT), '--ignore-lock'], {
  stdio: 'ignore',
});
const base = `http://localhost:${PORT}`;
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`${base}/es`)).ok) break;
  } catch {
    // Not listening yet.
  }
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch();
const page = await browser.newPage({ locale: 'es-ES', viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(5000);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => page.locator('.panel').getByText(text).first().waitFor();
const rows = async (n, display) => {
  const scope = display ? page.getByRole('region', { name: display }) : page.locator('.panel');
  const count = await scope.locator('.display-row').count();
  if (count !== n) throw new Error(`expected ${n} rows, got ${count}`);
};
const nothingStored = async (id, typed) => {
  await page.waitForTimeout(500);
  const hits = await page.evaluate(
    ([k, t]) => Object.entries(localStorage).filter(([key, v]) => key.includes(k) || v.includes(t)),
    [id, typed],
  );
  if (hits.length) throw new Error(`stored: ${JSON.stringify(hits)}`);
};
try {
  await page.goto(`${base}/es/validador-ean-isbn`);
  await page.locator('astro-island[ssr]').first().waitFor({ state: 'detached' });
  await page.locator('#ean-isbn-input').fill('0306406152');
  await see('ISBN-10 válido');
  await see('9780306406157');
  await page.locator('#ean-isbn-input').fill('400638133393');
  await see('Falta el dígito de control: sería 1 (4006381333931).');
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`horizontal scroll at ${width} px`);
  }
  for (const theme of ['light', 'dark', 'terminal']) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await page.screenshot({ path: `check-ean-isbn-${theme}.png`, fullPage: true });
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK ean-isbn');
} finally {
  await browser.close();
  server.kill();
}
```

Run:
```bash
pnpm build && node check-ean-isbn.mjs
```
Expected: `OK ean-isbn`. El script comprueba que `0306406152` da su ISBN-13 y `400638133393` completa el control. También comprueba que no hay scroll horizontal a 390 px ni a 1280 px y guarda una captura por tema (`check-ean-isbn-light.png`, `-dark.png`, `-terminal.png`): ábrelas y confirma que los resultados se leen en la pantalla hundida y que nada se sale del panel en ningún tema.

Después, bórralo todo:
```bash
rm check-ean-isbn.mjs check-ean-isbn-*.png
```

- [ ] **Step 12: Commit**

```bash
git add src/tools/ean-isbn src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni el script ni las capturas). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(ean-isbn): EAN-13 e ISBN con conversión 10 ↔ 13"
```

---

### Task 10: Código postal → provincia, con el 0 perdido y búsqueda inversa

**Files:**
- Create: `src/tools/postal-code/logic.ts`, `src/tools/postal-code/logic.test.ts`, `src/tools/postal-code/meta.ts`, `src/tools/postal-code/strings.ts`, `src/tools/postal-code/content.es.md`, `src/tools/postal-code/content.en.md`, `src/tools/postal-code/PostalCode.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: `splitLines`, `MAX_LINES` (`lib/ids`); `PROVINCES`, `provinceByCode`, `Province` (`lib/provinces`); `randInt`, `Rng` (`lib/random`); `persistedInput`; `fill`; `t`; kit: `Field`, `TextArea`, `Display`, `Led`, `CopyButton`, `Button`, `Select`, `Toggle`.
- Produces: `type PostalReason`, `type PostalResult`; `lookupPostalCode(raw)`, `postalRange(provinceCode)`, **`generatePostalCode(rng: Rng, provinceCode: string): string`** (contrato). Además `meta: ToolMeta` (id `postal-code`, slugs de la tabla de arriba), `strings: Record<Locale, …>` y el componente `PostalCode` con props `{ locale: Locale }`.
- DOM para la Task 12: `#postal-code-input`, `#postal-code-province`; `.display-value` con el código y `.display-kv` con provincia, comunidad y capital.

**§6.10 (vinculante).** Cómo se cubre cada punto:
- 5 cifras con prefijo 01–52 → provincia, comunidad y capital de `provinces.ts`.
- 4 cifras → «Añadido el 0 inicial: 08001»; prefijos `00` y `53`–`99` → «Ningún código postal empieza por 53: los prefijos van de 01 a 52».
- Búsqueda inversa con un `Select`: «Los códigos postales de Madrid van de 28000 a 28999».
- `generatePostalCode`: `provinceCode + '0' + 01–09` (test de ida y vuelta por provincia).
- Sin pestañas; `rememberInput: true`. El municipio exacto queda fuera (lo dice el contenido SEO).

- [ ] **Step 1: Preparar el worktree**

```bash
git worktree add ../devtools-postal-code -b lote-1/postal-code   # desde el commit de la Task 0
cd ../devtools-postal-code
pnpm install --frozen-lockfile
```
Si el orquestador ya te ha dado un worktree en esa rama, omite las dos primeras órdenes. Abre los componentes de `src/ui/` que usa el `.svelte` de esta task y `src/ui/persisted.svelte.ts`.

- [ ] **Step 2: Test (falla)**

`src/tools/postal-code/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { PROVINCES } from '../../lib/provinces';
import { seededRng } from '../../lib/random';
import { generatePostalCode, lookupPostalCode, postalRange } from './logic';

describe('lookupPostalCode', () => {
  it('finds the province from the first two digits', () => {
    const r = lookupPostalCode('28013');
    expect(r).toMatchObject({ ok: true, code: '28013', padded: false });
    expect(r.ok && r.province.name).toBe('Madrid');
    expect(r.ok && r.province.community).toBe('Comunidad de Madrid');
  });

  it('adds the leading 0 a spreadsheet dropped, and says so', () => {
    const r = lookupPostalCode('8001');
    expect(r).toMatchObject({ ok: true, code: '08001', padded: true });
    expect(r.ok && r.province.capital).toBe('Barcelona');
  });

  it('rejects prefixes 00 and 53–99', () => {
    expect(lookupPostalCode('53001')).toEqual({ ok: false, reason: 'prefix', prefix: '53' });
    expect(lookupPostalCode('00123')).toEqual({ ok: false, reason: 'prefix', prefix: '00' });
    expect(lookupPostalCode('99999')).toEqual({ ok: false, reason: 'prefix', prefix: '99' });
  });

  it('rejects other lengths and characters', () => {
    expect(lookupPostalCode('123')).toEqual({ ok: false, reason: 'length', length: 3 });
    expect(lookupPostalCode('280130')).toEqual({ ok: false, reason: 'length', length: 6 });
    expect(lookupPostalCode('28-013')).toEqual({ ok: false, reason: 'chars' });
    expect(lookupPostalCode(' ')).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('postalRange', () => {
  it('gives the range of a province', () => {
    expect(postalRange('28')).toEqual({ from: '28000', to: '28999' });
    expect(postalRange('08')).toEqual({ from: '08000', to: '08999' });
  });
});

describe('generatePostalCode', () => {
  it('round-trip: 1 000 codes with seed "test" match their province', () => {
    const rng = seededRng('test');
    for (let i = 0; i < 1000; i++) {
      const p = PROVINCES[i % PROVINCES.length];
      const code = generatePostalCode(rng, p.code);
      expect(code).toMatch(new RegExp(`^${p.code}00[1-9]$`));
      const r = lookupPostalCode(code);
      expect(r.ok && r.province.code, code).toBe(p.code);
    }
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/postal-code`
Expected: FAIL (no existe `./logic`).

- [ ] **Step 4: `src/tools/postal-code/logic.ts`**

```ts
import { provinceByCode, type Province } from '../../lib/provinces';
import { randInt, type Rng } from '../../lib/random';

export type PostalReason = 'empty' | 'chars' | 'length' | 'prefix';

export type PostalResult =
  | {
      ok: true;
      /** 5 digits. */
      code: string;
      /** True when a leading 0 was added to a 4-digit code (the usual spreadsheet mistake). */
      padded: boolean;
      province: Province;
    }
  | { ok: false; reason: PostalReason; length?: number; prefix?: string };

export function lookupPostalCode(raw: string): PostalResult {
  const s = raw.replace(/\s/g, '');
  if (!s) return { ok: false, reason: 'empty' };
  if (!/^\d+$/.test(s)) return { ok: false, reason: 'chars' };
  if (s.length !== 4 && s.length !== 5) return { ok: false, reason: 'length', length: s.length };
  const code = s.padStart(5, '0');
  const prefix = code.slice(0, 2);
  const province = provinceByCode(prefix);
  if (!province) return { ok: false, reason: 'prefix', prefix };
  return { ok: true, code, padded: s.length === 4, province };
}

/** "Los códigos postales de Madrid van de 28000 a 28999". */
export function postalRange(provinceCode: string): { from: string; to: string } {
  return { from: `${provinceCode}000`, to: `${provinceCode}999` };
}

/**
 * For mock data: provinceCode + '0' + 01–09, the pattern of the capitals' codes.
 * Only coherence with the province is guaranteed, not that this exact code exists.
 */
export function generatePostalCode(rng: Rng, provinceCode: string): string {
  return `${provinceCode}0${String(randInt(rng, 1, 9)).padStart(2, '0')}`;
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/postal-code`
Expected: PASS, incluido el test de ida y vuelta de 1 000 valores si la herramienta genera.

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/postal-code/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'postal-code',
  category: 'ids',
  icon: 'map-pin',
  slug: { es: 'codigo-postal-provincia', en: 'spanish-postal-code-province' },
  name: { es: 'Código postal', en: 'Postal codes' },
  title: {
    es: 'Código postal a provincia: busca la provincia de un CP',
    en: 'Spanish postal code to province lookup',
  },
  description: {
    es: 'Escribe uno o muchos códigos postales y ve su provincia, comunidad y capital. Recupera el 0 que pierden las hojas de cálculo y busca el rango de cada provincia.',
    en: 'Type one or many Spanish postal codes to see their province, region and capital. Restores the leading 0 spreadsheets drop and shows each province’s range.',
  },
  keywords: {
    es: [
      'codigo postal provincia',
      'provincia de un codigo postal',
      'cp españa',
      'codigos postales madrid',
    ],
    en: [
      'spanish postal code',
      'postal code to province',
      'spain zip code',
      'codigo postal lookup',
    ],
  },
  rememberInput: true,
};
```

`src/tools/postal-code/strings.ts`:
```ts
import type { Locale } from '../types';

export const strings = {
  es: {
    input: 'Códigos postales',
    placeholder: '28013\n8001',
    help: 'Uno por línea, hasta 1000.',
    result: 'Resultado',
    empty: 'Escribe un código postal de 5 cifras (o de 4, si se perdió el 0 inicial).',
    valid: 'Código válido',
    count: '{ok} válidos · {bad} no válidos',
    truncated: 'Solo se comprueban las primeras {n} líneas.',
    province: 'Provincia',
    community: 'Comunidad',
    capital: 'Capital',
    padded: 'Añadido el 0 inicial: {code}.',
    errPrefix: 'Ningún código postal empieza por {p}: los prefijos van de 01 a 52.',
    errLength: 'Un código postal tiene 5 cifras (o 4 si se perdió el 0 inicial).',
    errChars: 'Solo cifras.',
    reverse: 'Buscar por provincia',
    range: 'Rango',
    rangeText: 'Los códigos postales de {name} van de {from} a {to}.',
  },
  en: {
    input: 'Postal codes',
    placeholder: '28013\n8001',
    help: 'One per line, up to 1000.',
    result: 'Result',
    empty: 'Type a 5-digit postal code (or 4 digits, if the leading 0 was lost).',
    valid: 'Valid code',
    count: '{ok} valid · {bad} not valid',
    truncated: 'Only the first {n} lines are checked.',
    province: 'Province',
    community: 'Region',
    capital: 'Capital',
    padded: 'Leading 0 added: {code}.',
    errPrefix: 'No postal code starts with {p}: prefixes go from 01 to 52.',
    errLength: 'A postal code has 5 digits (or 4 if the leading 0 was lost).',
    errChars: 'Digits only.',
    reverse: 'Look up by province',
    range: 'Range',
    rangeText: 'Postal codes in {name} go from {from} to {to}.',
  },
} satisfies Record<Locale, Record<string, string>>;
```

- [ ] **Step 7: Contenido SEO**

`src/tools/postal-code/content.es.md`:
```md
## Las dos primeras cifras

En España las dos primeras cifras del código postal son el código de la provincia, el mismo que usa el INE: 28 es Madrid, 08 Barcelona, 46 Valencia y 52 Melilla. Por eso basta con el código postal para saber la provincia, la comunidad autónoma y la capital, aunque no el municipio. Si pegas una columna de códigos, cada línea muestra su provincia y puedes copiar todos normalizados.

## El 0 que se pierde

Las hojas de cálculo tratan `08001` como un número y lo guardan como `8001`. La herramienta reconoce los códigos de 4 cifras, les añade el 0 inicial y te lo dice, para que puedas corregir la columna de origen. Los prefijos 00 y del 53 al 99 no existen y se marcan como error.

Con «Buscar por provincia» ves el rango de códigos de cada una (de 28000 a 28999 en Madrid). Saber el municipio exacto de un código necesitaría la base de datos de Correos, que no se incluye.
```

`src/tools/postal-code/content.en.md`:
```md
## The first two digits

In Spain the first two digits of a postal code are the province code, the same one the INE uses: 28 is Madrid, 08 Barcelona, 46 Valencia and 52 Melilla. So the postal code alone tells you the province, the autonomous region and the capital, though not the town. Paste a column of codes and each line shows its province; you can copy them all normalized.

## The lost zero

Spreadsheets treat `08001` as a number and store it as `8001`. The tool recognises 4-digit codes, adds the leading 0 back and tells you, so you can fix the source column. Prefixes 00 and 53 to 99 do not exist and are flagged as errors.

With “Look up by province” you see the range of codes for each one (28000 to 28999 in Madrid). Finding the exact town for a code would need the Correos database, which is not included.
```

- [ ] **Step 8: `src/tools/postal-code/PostalCode.svelte`**

```svelte
<script lang="ts">
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { MAX_LINES, splitLines } from '../../lib/ids';
  import { PROVINCES, provinceByCode } from '../../lib/provinces';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import Led from '../../ui/Led.svelte';
  import Select from '../../ui/Select.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import { lookupPostalCode, postalRange, type PostalResult } from './logic';
  import { meta } from './meta';
  import { strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  // A bare postal code is not sensitive.
  const input = persistedInput('postal-code', '', meta.rememberInput ?? true);
  let reverse = $state('28');

  const split = $derived(splitLines(input.value));
  const results = $derived(split.lines.map((line) => ({ line, r: lookupPostalCode(line) })));
  const single = $derived(results.length === 1 ? results[0].r : null);
  const okCount = $derived(results.filter((x) => x.r.ok).length);

  function reason(r: PostalResult): string {
    if (r.ok)
      return r.padded
        ? `${r.province.name} · ${fill(s.padded, { code: r.code })}`
        : r.province.name;
    switch (r.reason) {
      case 'prefix':
        return fill(s.errPrefix, { p: r.prefix ?? '' });
      case 'length':
        return s.errLength;
      default:
        return s.errChars;
    }
  }

  const copyValue = $derived(results.map((x) => (x.r.ok ? x.r.code : x.line)).join('\n'));

  const options = PROVINCES.map((p) => ({ value: p.code, label: `${p.code} · ${p.name}` }));
  const range = $derived(postalRange(reverse));
  const reverseName = $derived(provinceByCode(reverse)?.name ?? '');
</script>

<div class="panel">
  <Field id="postal-code-input" label={s.input} help={s.help}>
    {#snippet children({ describedby })}
      <TextArea
        id="postal-code-input"
        bind:value={input.value}
        rows={3}
        placeholder={s.placeholder}
        {describedby}
        invalid={single !== null && !single.ok}
      />
    {/snippet}
  </Field>

  <Display live label={s.result}>
    {#snippet head()}
      {#if results.length === 0}
        <Led state="idle" label={t(locale, 'led.idle')} />
      {:else if single}
        <Led state={single.ok ? 'ok' : 'bad'} label={single.ok ? s.valid : t(locale, 'led.bad')} />
      {:else}
        <span>{fill(s.count, { ok: okCount, bad: results.length - okCount })}</span>
      {/if}
    {/snippet}
    {#if results.length === 0}
      <p class="display-note">{s.empty}</p>
    {:else if single}
      {#if single.ok}
        <div class="display-value">{single.code}</div>
        <dl class="display-kv">
          <dt>{s.province}</dt>
          <dd>{single.province.name}</dd>
          <dt>{s.community}</dt>
          <dd>{single.province.community}</dd>
          <dt>{s.capital}</dt>
          <dd>{single.province.capital}</dd>
        </dl>
        {#if single.padded}<p class="display-note">{fill(s.padded, { code: single.code })}</p>{/if}
      {:else}
        <p class="display-note">{reason(single)}</p>
      {/if}
    {:else}
      <div class="display-rows">
        {#each results as x, i (i)}
          <div class="display-row">
            <Led state={x.r.ok ? 'ok' : 'bad'} label={x.r.ok ? x.r.code : x.line} />
            <span class="why">{reason(x.r)}</span>
          </div>
        {/each}
      </div>
      {#if split.truncated}<p class="display-note">{fill(s.truncated, { n: MAX_LINES })}</p>{/if}
    {/if}
  </Display>

  <div class="row">
    <CopyButton main value={copyValue} {locale} />
    <Button variant="ghost" disabled={!input.value} onclick={() => (input.value = '')}>
      {t(locale, 'ui.clear')}
    </Button>
  </div>
  <Toggle bind:checked={input.remember} label={t(locale, 'tool.remember')} />

  <Field id="postal-code-province" label={s.reverse}>
    <Select id="postal-code-province" bind:value={reverse} {options} />
  </Field>
  <Display live label={s.range}>
    <p class="range">
      {fill(s.rangeText, { name: reverseName, from: range.from, to: range.to })}
    </p>
  </Display>
</div>

<style>
  .why {
    flex: 1;
    text-align: right;
    font: 400 13px/1.4 var(--font-body);
    letter-spacing: 0;
    color: var(--disp-dim);
  }
  .range {
    font: 500 15px/1.5 var(--font-mono);
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as postalCode } from './postal-code/meta';
```
→
```ts
import { meta as postalCode } from './postal-code/meta';
```
y
```ts
  // postalCode,
```
→
```ts
  postalCode,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import PostalCode from '../tools/postal-code/PostalCode.svelte';
```
→
```astro
import PostalCode from '../tools/postal-code/PostalCode.svelte';
```
y
```astro
{/* {id === 'postal-code' && <PostalCode client:load locale={locale} />} */}
```
→
```astro
{id === 'postal-code' && <PostalCode client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/codigo-postal-provincia.html dist/en/spanish-postal-code-province.html
```
Expected: todo en verde, incluido `registry.test.ts` (título ≤ 65, descripción 51–160, slugs, icono y los dos `content.*.md`), y existen las dos páginas. No ejecutes `pnpm test:e2e` aquí (ver Global Constraints).

- [ ] **Step 11: Comprobar en el navegador (script desechable)**

Crea `check-postal-code.mjs` en la raíz del worktree (no se confirma nunca):
```js
// Throwaway browser check for the postal-code task. Never committed: delete it after running.
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const PORT = 4710;
const server = spawn('node_modules/.bin/astro', ['preview', '--port', String(PORT), '--ignore-lock'], {
  stdio: 'ignore',
});
const base = `http://localhost:${PORT}`;
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`${base}/es`)).ok) break;
  } catch {
    // Not listening yet.
  }
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch();
const page = await browser.newPage({ locale: 'es-ES', viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(5000);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => page.locator('.panel').getByText(text).first().waitFor();
const rows = async (n, display) => {
  const scope = display ? page.getByRole('region', { name: display }) : page.locator('.panel');
  const count = await scope.locator('.display-row').count();
  if (count !== n) throw new Error(`expected ${n} rows, got ${count}`);
};
const nothingStored = async (id, typed) => {
  await page.waitForTimeout(500);
  const hits = await page.evaluate(
    ([k, t]) => Object.entries(localStorage).filter(([key, v]) => key.includes(k) || v.includes(t)),
    [id, typed],
  );
  if (hits.length) throw new Error(`stored: ${JSON.stringify(hits)}`);
};
try {
  await page.goto(`${base}/es/codigo-postal-provincia`);
  await page.locator('astro-island[ssr]').first().waitFor({ state: 'detached' });
  await page.locator('#postal-code-input').fill('8001');
  await see('Añadido el 0 inicial');
  await see('Barcelona');
  await page.locator('#postal-code-province').selectOption('46');
  await see('Los códigos postales de Valencia/València van de 46000 a 46999.');
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`horizontal scroll at ${width} px`);
  }
  for (const theme of ['light', 'dark', 'terminal']) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await page.screenshot({ path: `check-postal-code-${theme}.png`, fullPage: true });
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK postal-code');
} finally {
  await browser.close();
  server.kill();
}
```

Run:
```bash
pnpm build && node check-postal-code.mjs
```
Expected: `OK postal-code`. El script comprueba que `8001` añade el 0 y es Barcelona, y la búsqueda inversa de Valencia da el rango. También comprueba que no hay scroll horizontal a 390 px ni a 1280 px y guarda una captura por tema (`check-postal-code-light.png`, `-dark.png`, `-terminal.png`): ábrelas y confirma que los resultados se leen en la pantalla hundida y que nada se sale del panel en ningún tema.

Después, bórralo todo:
```bash
rm check-postal-code.mjs check-postal-code-*.png
```

- [ ] **Step 12: Commit**

```bash
git add src/tools/postal-code src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain
```
`git status --porcelain` no debe listar nada más (ni el script ni las capturas). Si `pnpm format` retocó archivos que no son de esta task, descártalos con `git restore <archivo>`.

```bash
git commit -m "feat(postal-code): código postal a provincia y rango por provincia"
```

---

### Task 11: Datos de prueba (`mock`): filas coherentes en JSON, CSV y SQL

Se hace **después** de fusionar las Tasks 1–10, sobre `feat/herramientas-nuevas`, sin worktree.

**Files:**
- Create: `src/tools/mock/data.ts`, `src/tools/mock/logic.ts`, `src/tools/mock/logic.test.ts`, `src/tools/mock/meta.ts`, `src/tools/mock/strings.ts`, `src/tools/mock/content.es.md`, `src/tools/mock/content.en.md`, `src/tools/mock/Mock.svelte`
- Modify: `src/tools/registry.ts` (descomentar 2 líneas), `src/components/ToolIsland.astro` (descomentar 2 líneas)

**Interfaces:**
- Consumes: el contrato de las Tasks 1–10 (`generateDni`, `generateNie`, `generateCif`, `generateSpanishIban`, `generatePlate`, `generateTestCard`, `generatePhone`, `generatePostalCode`) más `validateDni`, `validateCif`, `validateIban` y `lookupPostalCode` en los tests; `uuidV4` (`uuid/logic`); `toCsv`, `CsvCell` (`lib/csv`); `PROVINCES` (`lib/provinces`); `digits`, `pick`, `randInt`, `randomBytesFrom`, `randomSeed`, `seededRng`, `Rng` (`lib/random`); `downloadBlob` (`lib/download`); `persistedInput`; `fill`; `t` (`ui.seed`, `ui.seedHelp`, `ui.generate`, `ui.download`, `ui.testOnly`, `tool.remember`); kit: `Field`, `NumberInput`, `Segmented`, `Select`, `Toggle`, `Display`, `CopyButton`, `Button` (variante `icon` con `chevron-down` y `x`).
- Produces: `BUILTIN_KINDS`, `CUSTOM_KINDS`, `type BuiltinKind`, `type CustomKind`, `type FieldKind`, `type MockFormat`, `interface MockField`, `interface MockConfig`, `type MockError`, `type MockOutput`, `MAX_ROWS`, `DEFAULT_ROWS`, `PREVIEW_ROWS`, `SPAIN_ONLY`, `COLUMN_NAMES`; `defaultField`, `defaultConfig`, `addField`, `moveField`, `isAvailable`, `asciiSlug`, `birthDate`, `personRecord`, `dedupeEmails`, `listValues`, `activeFields`, `validateConfig`, `generateRows`, `formatRows`, `renderMock`, `parseConfig`. `meta` (id `mock`, categoría `gen`), `strings`, `fieldNames` y el componente `Mock`.
- DOM para la Task 12: `#mock-seed`, `#mock-rows`, `#mock-table`, `#mock-add-kind`; radios `JSON`, `CSV`, `SQL`; interruptor «Datos internacionales»; botón «Descargar»; salida en `.display-code`.

**§6.11 (vinculante).** Cómo se cubre cada punto:
- Los 21 campos de la tabla del spec, con sus columnas ES/EN (`COLUMN_NAMES`) y sus imports; selección por defecto nombre, apellidos, email, teléfono, DNI y ciudad (test `selects name, surnames, email, phone, DNI and city`). Número, Fecha y Lista propia se pueden añadir más veces (`addField`), y los añadidos se pueden quitar.
- Cada fila: casilla, nombre de columna editable, parámetros y botones subir y bajar (el de subir es `chevron-down` girado 180° con CSS, para no añadir iconos fuera de la §4.4).
- Coherencia: email `nombre.apellido1` o sus dos variantes, ASCII y en `example.com/.org/.net`, con número si se repite; provincia, código postal y ciudad de la misma entrada; letra del DNI/NIE correcta; CIF A con S.A. y B con S.L. Tests `coherence inside a row`.
- Reproducibilidad (Review Focus 5): cada fila tiene su flujo `seededRng(seed#fila)` y siempre genera el registro completo en el mismo orden. **Los campos con parámetros (Número, Booleano, Fecha y Lista) tienen además su propio flujo `seed#fila#uid`.** El spec solo pide el registro completo en orden fijo, pero con un flujo único añadir un segundo campo Número o cambiar su rango movería los valores de las columnas que van detrás; así se cumple lo que el spec promete («quitar o reordenar columnas no cambia los valores de las demás»). Sin semilla, semilla de sesión que solo cambia con «Generar».
- Opciones: filas 1–1000 (100), semilla, formato JSON · CSV · SQL (Segmented secundario), tabla solo en SQL (`usuarios`/`users`) y «Datos internacionales» (nombres, calles y ciudades en inglés, `+1 202 555 01XX`, `Ltd/Inc/LLC`, 5 cifras de código postal; DNI, NIE, CIF, IBAN, matrícula y provincia atenuados con «Solo con datos de España» y fuera de la salida, y recuperan su estado al volver).
- Salida: JSON con números y booleanos tipados, CSV con `toCsv` y cabecera, SQL con una sentencia por fila, identificadores con `"` duplicada, textos con `'` duplicada (`'O''Brien'`), `TRUE/FALSE` y `NULL`. Vista previa de 20 filas y «… y 980 filas más»; copiar y descargar (`datos.json|csv|sql`) llevan todo.
- Errores del spec: columnas repetidas, nombre vacío, mín. > máx., lista vacía, tabla inválida y «Elige al menos un campo». Añadido: fechas inválidas o invertidas en un campo Fecha.
- `rememberInput: true`: la configuración se guarda como JSON en `input.mock` y `parseConfig` tolera JSON roto o antiguo. Rendimiento: 1000 filas con todos los campos por debajo de 500 ms (test).

- [ ] **Step 1: Comprobar que las 10 herramientas están fusionadas y cumplen el contrato**

```bash
git switch feat/herramientas-nuevas
git log --oneline -15
grep -nE "export function (generateDni|generateNie|generateCif|generateSpanishIban|formatIban|generatePlate|generateNss|generateTestCard|generatePhone|generatePostalCode)\(" src/tools/*/logic.ts | wc -l
pnpm install --frozen-lockfile && pnpm test
```
Expected: los 10 commits `feat(<id>): …` fusionados, `10` exports del contrato y tests en verde. Si falta un export o su firma no es la de la tabla «Contrato para la Task 11», corrígelo en esa herramienta antes de seguir.

- [ ] **Step 2: Test (falla)**

`src/tools/mock/logic.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { seededRng } from '../../lib/random';
import { validateCif } from '../cif/logic';
import { validateDni } from '../dni/logic';
import { validateIban } from '../iban/logic';
import { lookupPostalCode } from '../postal-code/logic';
import {
  FEMALE_NAMES,
  INTL_CITIES,
  INTL_FEMALE_NAMES,
  INTL_MALE_NAMES,
  INTL_STREETS,
  INTL_SURNAMES,
  MALE_NAMES,
  STREETS,
  SURNAMES,
} from './data';
import {
  COLUMN_NAMES,
  MAX_ROWS,
  addField,
  asciiSlug,
  birthDate,
  dedupeEmails,
  defaultConfig,
  formatRows,
  generateRows,
  listValues,
  moveField,
  parseConfig,
  personRecord,
  renderMock,
  validateConfig,
  type MockConfig,
} from './logic';

const NOW = new Date(Date.UTC(2026, 8, 27, 12));
const withSeed = (c: MockConfig, seed = 'demo'): MockConfig => ({ ...c, seed });
const enable = (c: MockConfig, kinds: string[]): MockConfig => ({
  ...c,
  fields: c.fields.map((f) => ({ ...f, enabled: kinds.includes(f.kind) })),
});

describe('word lists', () => {
  it('have the sizes the spec asks for', () => {
    expect(FEMALE_NAMES).toHaveLength(50);
    expect(MALE_NAMES).toHaveLength(50);
    expect(SURNAMES).toHaveLength(100);
    expect(STREETS).toHaveLength(40);
    expect(INTL_FEMALE_NAMES).toHaveLength(50);
    expect(INTL_MALE_NAMES).toHaveLength(50);
    expect(INTL_SURNAMES).toHaveLength(100);
    expect(INTL_STREETS).toHaveLength(30);
    expect(INTL_CITIES).toHaveLength(30);
  });
});

describe('defaults', () => {
  it('selects name, surnames, email, phone, DNI and city', () => {
    const r = renderMock(withSeed({ ...defaultConfig('es'), format: 'csv', rows: 5 }), NOW, '');
    expect(r.ok && r.output.split('\r\n')[0]).toBe('nombre,apellidos,email,telefono,dni,ciudad');
    expect(r.ok && r.output.split('\r\n')).toHaveLength(6);
  });

  it('uses English column names in English', () => {
    const r = renderMock(withSeed({ ...defaultConfig('en'), format: 'csv', rows: 1 }), NOW, '');
    expect(r.ok && r.columns).toEqual([
      'first_name',
      'last_names',
      'email',
      'phone',
      'dni',
      'city',
    ]);
    expect(Object.keys(COLUMN_NAMES.en)).toEqual(Object.keys(COLUMN_NAMES.es));
  });
});

describe('coherence inside a row', () => {
  it('keeps province, postal code and city from the same province', () => {
    for (let i = 0; i < 200; i++) {
      const r = personRecord('coherence', i, NOW, false);
      const pc = lookupPostalCode(r.postalCode);
      expect(pc.ok && pc.province.name).toBe(r.province);
      expect(pc.ok && pc.province.capital).toBe(r.city);
    }
  });

  it('makes valid documents and a CIF that matches S.L. or S.A.', () => {
    for (let i = 0; i < 200; i++) {
      const r = personRecord('docs', i, NOW, false);
      expect(validateDni(r.dni).ok).toBe(true);
      expect(validateDni(r.nie).ok).toBe(true);
      expect(validateIban(r.iban).ok).toBe(true);
      const cif = validateCif(r.cif);
      expect(cif.ok).toBe(true);
      expect(r.cif[0]).toBe(r.company.endsWith('S.A.') ? 'A' : 'B');
      expect(r.uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
      expect(r.plate).toMatch(/^\d{4} [BCDFGHJKLMNPRSTVWXYZ]{3}$/);
    }
  });

  it('derives an ASCII email from the name on a reserved domain', () => {
    for (let i = 0; i < 300; i++) {
      const r = personRecord('email', i, NOW, false);
      expect(r.email).toMatch(/^[a-z0-9.]+@example\.(com|org|net)$/);
      const last = asciiSlug(r.lastNames.split(' ')[0]);
      expect(r.email).toContain(last);
    }
    expect(asciiSlug('Ibáñez')).toBe('ibanez');
    expect(asciiSlug('Muñoz')).toBe('munoz');
    expect(asciiSlug("O'Brien")).toBe('obrien');
  });

  it('gives ages between 18 and 80', () => {
    const rng = seededRng('age');
    for (let i = 0; i < 2000; i++) {
      const [y, m, d] = birthDate(rng, NOW).split('-').map(Number);
      let age = 2026 - y;
      if (m > 9 || (m === 9 && d > 27)) age--;
      expect(age).toBeGreaterThanOrEqual(18);
      expect(age).toBeLessThanOrEqual(80);
    }
  });

  it('numbers repeated emails', () => {
    expect(dedupeEmails(['a@example.com', 'a@example.com', 'b@x', 'a@example.com'])).toEqual([
      'a@example.com',
      'a2@example.com',
      'b@x',
      'a3@example.com',
    ]);
  });
});

describe('reproducibility', () => {
  it('gives the same output for the same seed', () => {
    const c = withSeed(defaultConfig('es'));
    expect(renderMock(c, NOW, 'x')).toEqual(renderMock(c, NOW, 'y'));
  });

  it('uses the session seed when there is no seed', () => {
    const c = defaultConfig('es');
    expect(renderMock(c, NOW, 's1')).toEqual(renderMock(c, NOW, 's1'));
    expect(renderMock(c, NOW, 's1')).not.toEqual(renderMock(c, NOW, 's2'));
  });

  it('removing or reordering columns never changes the other values', () => {
    const all = withSeed(
      enable(defaultConfig('es'), ['firstName', 'email', 'dni', 'city', 'number']),
    );
    const fewer = withSeed(enable(defaultConfig('es'), ['dni', 'number']));
    const a = generateRows(all, NOW, '');
    const b = generateRows(fewer, NOW, '');
    expect(b.map((r) => r[0])).toEqual(a.map((r) => r[2]));
    expect(b.map((r) => r[1])).toEqual(a.map((r) => r[4]));
    const moved = { ...all, fields: all.fields.slice().reverse() };
    const c = generateRows(moved, NOW, '');
    expect(c.map((r) => r.slice().sort())).toEqual(a.map((r) => r.slice().sort()));
  });

  it('adding a second custom field or changing its range leaves the first one alone', () => {
    const one = withSeed(enable(defaultConfig('es'), ['number']));
    const two = addField(one, 'number', 'es');
    const changed = {
      ...two,
      fields: two.fields.map((f) => (f.uid === 'number-2' ? { ...f, min: 5, max: 9 } : f)),
    };
    const a = generateRows(one, NOW, '').map((r) => r[0]);
    expect(generateRows(two, NOW, '').map((r) => r[0])).toEqual(a);
    expect(generateRows(changed, NOW, '').map((r) => r[0])).toEqual(a);
  });
});

describe('custom fields', () => {
  it('draws numbers in range with the requested decimals', () => {
    const c = withSeed({
      ...enable(defaultConfig('es'), ['number']),
      fields: defaultConfig('es').fields.map((f) =>
        f.kind === 'number'
          ? { ...f, enabled: true, min: 1.5, max: 2.5, decimals: 2 }
          : { ...f, enabled: false },
      ),
      rows: 500,
    });
    for (const [v] of generateRows(c, NOW, '')) {
      expect(typeof v).toBe('number');
      expect(v as number).toBeGreaterThanOrEqual(1.5);
      expect(v as number).toBeLessThanOrEqual(2.5);
      expect(Math.round((v as number) * 100)).toBeCloseTo((v as number) * 100, 6);
    }
  });

  it('draws booleans with the given probability, dates in range and list values', () => {
    const base = defaultConfig('es');
    const c = withSeed({
      ...base,
      rows: 1000,
      fields: base.fields.map((f) => {
        if (f.kind === 'boolean') return { ...f, enabled: true, probability: 20 };
        if (f.kind === 'date') return { ...f, enabled: true, from: '2026-01-01', to: '2026-01-31' };
        if (f.kind === 'list') return { ...f, enabled: true, values: 'rojo, verde\nazul' };
        return { ...f, enabled: false };
      }),
    });
    const rows = generateRows(c, NOW, '');
    const trues = rows.filter((r) => r[0] === true).length;
    expect(trues).toBeGreaterThan(150);
    expect(trues).toBeLessThan(250);
    for (const [, date, value] of rows) {
      expect((date as string) >= '2026-01-01' && (date as string) <= '2026-01-31').toBe(true);
      expect(['rojo', 'verde', 'azul']).toContain(value);
    }
    expect(listValues(' a,\n\nb ,')).toEqual(['a', 'b']);
  });
});

describe('international mode', () => {
  it('drops Spain-only fields and uses generic data and the fictional 555-01XX range', () => {
    const c = withSeed({
      ...enable(defaultConfig('es'), ['firstName', 'phone', 'dni', 'city', 'company', 'street']),
      international: true,
      format: 'csv',
      rows: 50,
    });
    const r = renderMock(c, NOW, '');
    expect(r.ok && r.columns).toEqual(['nombre', 'telefono', 'direccion', 'ciudad', 'empresa']);
    const rec = personRecord('demo', 0, NOW, true);
    expect(rec.phone).toMatch(/^\+1 202 555 01\d\d$/);
    expect(rec.company).toMatch(/ (Ltd|Inc|LLC)$/);
    expect(rec.street).toMatch(/^\d{1,4} /);
    expect(rec.postalCode).toMatch(/^\d{5}$/);
    expect(INTL_CITIES).toContain(rec.city);
  });
});

describe('output formats', () => {
  it('types numbers and booleans in JSON and keeps codes as text', () => {
    const out = formatRows('json', ['n', 'b', 'cp'], [[3, true, '08001']], 't');
    expect(JSON.parse(out)).toEqual([{ n: 3, b: true, cp: '08001' }]);
  });

  it('writes one SQL statement per row with quoted identifiers and escaped quotes', () => {
    expect(
      formatRows('sql', ['nombre', 'edad', 'ok', 'x'], [["O'Brien", 34, false, null]], 'usuarios'),
    ).toBe(
      `INSERT INTO "usuarios" ("nombre", "edad", "ok", "x") VALUES ('O''Brien', 34, FALSE, NULL);`,
    );
    expect(formatRows('sql', ['a"b'], [['v']], 't')).toBe(`INSERT INTO "t" ("a""b") VALUES ('v');`);
  });

  it('previews 20 rows and keeps everything in the full output', () => {
    const r = renderMock(
      withSeed({ ...defaultConfig('es'), rows: MAX_ROWS, format: 'sql' }),
      NOW,
      '',
    );
    expect(r.ok && r.rows).toBe(1000);
    expect(r.ok && r.output.split('\n')).toHaveLength(1000);
    expect(r.ok && r.preview.split('\n')).toHaveLength(20);
  });

  it('handles 1 row and clamps the row count', () => {
    const one = renderMock(withSeed({ ...defaultConfig('es'), rows: 1 }), NOW, '');
    expect(one.ok && JSON.parse(one.output)).toHaveLength(1);
    const many = renderMock(
      withSeed({ ...defaultConfig('es'), rows: 5000, format: 'csv' }),
      NOW,
      '',
    );
    expect(many.ok && many.rows).toBe(MAX_ROWS);
  });
});

describe('errors', () => {
  it('needs at least one field', () => {
    expect(validateConfig(enable(defaultConfig('es'), []))).toEqual({ reason: 'noFields' });
    expect(
      validateConfig({ ...enable(defaultConfig('es'), ['dni']), international: true }),
    ).toEqual({
      reason: 'noFields',
    });
  });

  it('refuses duplicate and empty column names', () => {
    const c = defaultConfig('es');
    const dup = {
      ...c,
      fields: c.fields.map((f) => (f.kind === 'phone' ? { ...f, name: 'email' } : f)),
    };
    expect(validateConfig(dup)).toEqual({ reason: 'duplicate', name: 'email' });
    const empty = {
      ...c,
      fields: c.fields.map((f) => (f.kind === 'dni' ? { ...f, name: '  ' } : f)),
    };
    expect(validateConfig(empty)).toEqual({ reason: 'emptyName' });
  });

  it('checks number, date and list parameters', () => {
    const c = defaultConfig('es');
    const set = (kind: string, patch: object) => ({
      ...c,
      fields: c.fields.map((f) => (f.kind === kind ? { ...f, enabled: true, ...patch } : f)),
    });
    expect(validateConfig(set('number', { min: 5, max: 1 }))).toEqual({
      reason: 'minMax',
      name: 'numero',
    });
    expect(validateConfig(set('date', { from: '2026-02-01', to: '2026-01-01' }))).toEqual({
      reason: 'dateRange',
      name: 'fecha',
    });
    expect(validateConfig(set('date', { from: '2026-02-30' }))).toMatchObject({
      reason: 'dateRange',
    });
    expect(validateConfig(set('list', { values: ' , ' }))).toEqual({
      reason: 'emptyList',
      name: 'valor',
    });
  });

  it('checks the SQL table name only in SQL', () => {
    const c = { ...defaultConfig('es'), table: '1usuarios' };
    expect(validateConfig(c)).toBeNull();
    expect(validateConfig({ ...c, format: 'sql' })).toEqual({ reason: 'table' });
    expect(validateConfig({ ...c, format: 'sql', table: 'tabla_ñ' })).toEqual({ reason: 'table' });
    expect(validateConfig({ ...c, format: 'sql', table: '_ok_1' })).toBeNull();
  });
});

describe('field list and saved configuration', () => {
  it('adds numbered custom fields and moves fields', () => {
    const c = addField(addField(defaultConfig('es'), 'list', 'es'), 'list', 'es');
    const added = c.fields.slice(-2);
    expect(added.map((f) => [f.uid, f.name, f.enabled])).toEqual([
      ['list-2', 'valor_2', true],
      ['list-3', 'valor_3', true],
    ]);
    const f = defaultConfig('es').fields;
    expect(
      moveField(f, 1, -1)
        .slice(0, 2)
        .map((x) => x.kind),
    ).toEqual(['lastNames', 'firstName']);
    expect(moveField(f, 0, -1)).toBe(f);
  });

  it('round-trips through JSON and survives garbage', () => {
    const c = addField({ ...defaultConfig('es'), seed: 'demo', format: 'sql' }, 'date', 'es');
    expect(parseConfig(JSON.stringify(c), 'es')).toEqual(c);
    expect(parseConfig('not json', 'es')).toEqual(defaultConfig('es'));
    expect(parseConfig('{"fields":[{"kind":"nope","uid":"x"}],"rows":"x"}', 'en')).toEqual(
      defaultConfig('en'),
    );
  });
});

describe('performance', () => {
  it('builds 1000 rows with every field in well under 500 ms', () => {
    const c = withSeed({
      ...defaultConfig('es'),
      rows: 1000,
      fields: defaultConfig('es').fields.map((f) => ({ ...f, enabled: true, values: 'a,b' })),
    });
    const t0 = performance.now();
    const r = renderMock(c, NOW, '');
    expect(r.ok).toBe(true);
    expect(performance.now() - t0).toBeLessThan(500);
  });
});
```

- [ ] **Step 3: Verificar que falla**

Run: `pnpm test src/tools/mock`
Expected: FAIL (no existen `./logic` ni `./data`).

- [ ] **Step 4: `data.ts` y `logic.ts`**

Las listas de palabras (50 + 50 nombres, 100 apellidos, 40 calles, 20 raíces de empresa y sus equivalentes internacionales) van en su propio archivo. Contienen `O'Brien`, `Muñoz` e `Ibáñez` a propósito: son los casos límite del SQL y de los emails.

`src/tools/mock/data.ts`:
```ts
// Word lists for mock data. Common names and places only: nothing here identifies anyone.

// prettier-ignore
export const FEMALE_NAMES = [
  'María', 'Carmen', 'Ana', 'Isabel', 'Laura', 'Lucía', 'Marta', 'Cristina', 'Paula', 'Sara',
  'Elena', 'Raquel', 'Pilar', 'Rosa', 'Andrea', 'Silvia', 'Beatriz', 'Nuria', 'Patricia', 'Irene',
  'Julia', 'Alba', 'Sofía', 'Claudia', 'Eva', 'Noelia', 'Rocío', 'Mónica', 'Inés', 'Teresa',
  'Marina', 'Alicia', 'Lorena', 'Natalia', 'Sonia', 'Verónica', 'Carla', 'Olga', 'Aitana', 'Nerea',
  'Blanca', 'Clara', 'Lidia', 'Miriam', 'Ainhoa', 'Daniela', 'Vega', 'Martina', 'Begoña', 'Ángela',
];

// prettier-ignore
export const MALE_NAMES = [
  'Antonio', 'José', 'Manuel', 'Francisco', 'David', 'Juan', 'Javier', 'Daniel', 'Carlos', 'Jesús',
  'Alejandro', 'Miguel', 'Rafael', 'Pablo', 'Pedro', 'Sergio', 'Fernando', 'Jorge', 'Luis', 'Alberto',
  'Álvaro', 'Adrián', 'Diego', 'Raúl', 'Iván', 'Rubén', 'Óscar', 'Enrique', 'Ramón', 'Andrés',
  'Vicente', 'Joaquín', 'Santiago', 'Víctor', 'Mario', 'Marcos', 'Hugo', 'Ignacio', 'Jaime', 'Gonzalo',
  'Iker', 'Unai', 'Martín', 'Lucas', 'Mateo', 'Nicolás', 'Emilio', 'Tomás', 'Guillermo', 'Julián',
];

// prettier-ignore
export const SURNAMES = [
  'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín',
  'Jiménez', 'Hernández', 'Ruiz', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Gutiérrez', 'Alonso',
  'Navarro', 'Torres', 'Domínguez', 'Ramos', 'Vázquez', 'Ramírez', 'Gil', 'Serrano', 'Morales', 'Molina',
  'Blanco', 'Suárez', 'Castro', 'Ortega', 'Delgado', 'Ortiz', 'Marín', 'Rubio', 'Núñez', 'Medina',
  'Sanz', 'Castillo', 'Iglesias', 'Cortés', 'Garrido', 'Santos', 'Guerrero', 'Lozano', 'Cano', 'Cruz',
  'Méndez', 'Flores', 'Prieto', 'Herrera', 'Peña', 'León', 'Márquez', 'Cabrera', 'Gallego', 'Calvo',
  'Vidal', 'Campos', 'Reyes', 'Vega', 'Fuentes', 'Carrasco', 'Diez', 'Aguilar', 'Caballero', 'Nieto',
  'Santana', 'Vargas', 'Pascual', 'Giménez', 'Herrero', 'Hidalgo', 'Montero', 'Lorenzo', 'Santiago', 'Benítez',
  'Durán', 'Ibáñez', 'Arias', 'Mora', 'Ferrer', 'Carmona', 'Vicente', 'Rojas', 'Soto', 'Crespo',
  'Román', 'Pastor', 'Velasco', 'Parra', 'Sáez', 'Moya', 'Bravo', 'Rivera', 'Gallardo', 'Soler',
];

export const STREET_TYPES = ['Calle', 'Avenida', 'Plaza', 'Paseo', 'Camino', 'Ronda'];

// prettier-ignore
export const STREETS = [
  'Mayor', 'Real', 'Nueva', 'de la Iglesia', 'de la Constitución', 'del Sol', 'de la Luna', 'del Olivo',
  'de los Rosales', 'de los Pinos', 'del Mar', 'del Río', 'de la Libertad', 'de la Paz', 'de Castilla',
  'de Andalucía', 'de Cervantes', 'de Goya', 'de Velázquez', 'de Colón', 'de Alcalá', 'de Toledo',
  'de Sevilla', 'de Valencia', 'de la Estación', 'del Molino', 'de la Fuente', 'de la Huerta',
  'de los Jardines', 'del Prado', 'de la Ermita', 'del Rosario', 'del Carmen', 'de San Juan',
  'de San Pedro', 'de Santiago', 'del Príncipe', 'de la Reina', 'del Castillo', 'de la Industria',
];

// prettier-ignore
export const COMPANY_WORDS = [
  'Nexo', 'Altamar', 'Brisa', 'Cumbre', 'Faro', 'Horizonte', 'Lumen', 'Marea', 'Norte', 'Olivo',
  'Prisma', 'Quasar', 'Roble', 'Sendero', 'Tierra', 'Umbral', 'Vértice', 'Zenit', 'Atlas', 'Delta',
];

// prettier-ignore
export const INTL_FEMALE_NAMES = [
  'Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn',
  'Abigail', 'Emily', 'Elizabeth', 'Sofia', 'Avery', 'Ella', 'Scarlett', 'Grace', 'Chloe', 'Victoria',
  'Riley', 'Aria', 'Lily', 'Aubrey', 'Zoey', 'Penelope', 'Lillian', 'Addison', 'Layla', 'Natalie',
  'Camila', 'Hannah', 'Brooklyn', 'Zoe', 'Nora', 'Leah', 'Savannah', 'Audrey', 'Claire', 'Eleanor',
  'Skylar', 'Ellie', 'Samantha', 'Stella', 'Paisley', 'Violet', 'Mila', 'Allison', 'Alexa', 'Anna',
];

// prettier-ignore
export const INTL_MALE_NAMES = [
  'Liam', 'Noah', 'William', 'James', 'Oliver', 'Benjamin', 'Elijah', 'Lucas', 'Mason', 'Logan',
  'Alexander', 'Ethan', 'Jacob', 'Michael', 'Daniel', 'Henry', 'Jackson', 'Sebastian', 'Aiden', 'Matthew',
  'Samuel', 'David', 'Joseph', 'Carter', 'Owen', 'Wyatt', 'John', 'Jack', 'Luke', 'Jayden',
  'Dylan', 'Grayson', 'Levi', 'Isaac', 'Gabriel', 'Julian', 'Mateo', 'Anthony', 'Jaxon', 'Lincoln',
  'Joshua', 'Christopher', 'Andrew', 'Theodore', 'Caleb', 'Ryan', 'Asher', 'Nathan', 'Thomas', 'Leo',
];

// prettier-ignore
export const INTL_SURNAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor',
  'Thomas', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Hill', 'Green', 'Adams', 'Baker',
  'Nelson', 'Carter', 'Mitchell', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards',
  'Collins', 'Stewart', 'Morris', 'Murphy', 'Cook', 'Rogers', 'Morgan', 'Cooper', 'Peterson', 'Reed',
  'Bailey', 'Bell', 'Kelly', 'Howard', 'Ward', 'Cox', 'Richardson', 'Wood', 'Watson', 'Brooks',
  'Bennett', 'Gray', 'James', 'Hughes', 'Price', 'Sanders', 'Myers', 'Long', 'Ross', 'Foster',
  'Powell', 'Jenkins', 'Perry', 'Russell', 'Sullivan', 'Fisher', 'Henderson', 'Coleman', 'Simmons', 'Patterson',
  'Jordan', 'Reynolds', 'Hamilton', 'Graham', 'Wallace', 'West', 'Cole', 'Hayes', 'Gibson', 'Ellis',
  'Stevens', 'Murray', 'Ford', 'Marshall', 'Owens', 'McDonald', 'Harrison', 'Kennedy', "O'Brien", 'Fletcher',
];

// prettier-ignore
export const INTL_STREETS = [
  'Oak Street', 'Maple Avenue', 'Pine Street', 'Cedar Lane', 'Elm Street', 'Washington Avenue',
  'Lake Drive', 'Hill Road', 'Park Avenue', 'Main Street', 'Church Street', 'High Street', 'Mill Lane',
  'River Road', 'Sunset Boulevard', 'Forest Drive', 'Meadow Lane', 'Spring Street', 'Highland Avenue',
  'Willow Way', 'Chestnut Street', 'Birch Road', 'Valley Road', 'King Street', 'Queen Street',
  'Station Road', 'Victoria Road', 'Green Lane', 'Bridge Street', 'Harbor View',
];

// prettier-ignore
export const INTL_CITIES = [
  'Springfield', 'Riverside', 'Franklin', 'Greenville', 'Bristol', 'Clinton', 'Fairview', 'Salem',
  'Madison', 'Georgetown', 'Arlington', 'Ashland', 'Dover', 'Oxford', 'Jackson', 'Burlington',
  'Manchester', 'Milton', 'Newport', 'Auburn', 'Dayton', 'Lexington', 'Milford', 'Winchester',
  'Hudson', 'Kingston', 'Mount Vernon', 'Clayton', 'Lancaster', 'Chester',
];

/** Reserved by RFC 2606: they never reach a real mailbox. */
export const EMAIL_DOMAINS = ['example.com', 'example.org', 'example.net'];
```

`src/tools/mock/logic.ts`:
```ts
import { toCsv, type CsvCell } from '../../lib/csv';
import { PROVINCES } from '../../lib/provinces';
import { digits, pick, randInt, randomBytesFrom, seededRng, type Rng } from '../../lib/random';
import { generateTestCard } from '../card/logic';
import { generateCif } from '../cif/logic';
import { generateDni, generateNie } from '../dni/logic';
import { generateSpanishIban } from '../iban/logic';
import { generatePhone } from '../phone/logic';
import { generatePlate } from '../plate/logic';
import { generatePostalCode } from '../postal-code/logic';
import type { Locale } from '../types';
import { uuidV4 } from '../uuid/logic';
import {
  COMPANY_WORDS,
  EMAIL_DOMAINS,
  FEMALE_NAMES,
  INTL_CITIES,
  INTL_FEMALE_NAMES,
  INTL_MALE_NAMES,
  INTL_STREETS,
  INTL_SURNAMES,
  MALE_NAMES,
  STREETS,
  STREET_TYPES,
  SURNAMES,
} from './data';

export const BUILTIN_KINDS = [
  'firstName',
  'lastNames',
  'email',
  'phone',
  'birthDate',
  'dni',
  'nie',
  'street',
  'postalCode',
  'province',
  'city',
  'company',
  'cif',
  'iban',
  'card',
  'plate',
  'uuid',
] as const;
export const CUSTOM_KINDS = ['number', 'boolean', 'date', 'list'] as const;

export type BuiltinKind = (typeof BUILTIN_KINDS)[number];
export type CustomKind = (typeof CUSTOM_KINDS)[number];
export type FieldKind = BuiltinKind | CustomKind;
export type MockFormat = 'json' | 'csv' | 'sql';

/** Every field carries every parameter, so the saved JSON has one stable shape. */
export interface MockField {
  /** Stable id: the kind for the default fields, `number-2`… for the added ones. */
  uid: string;
  kind: FieldKind;
  enabled: boolean;
  name: string;
  min: number;
  max: number;
  decimals: number;
  /** Chance of `true`, 0–100. */
  probability: number;
  from: string;
  to: string;
  values: string;
}

export interface MockConfig {
  fields: MockField[];
  rows: number;
  seed: string;
  format: MockFormat;
  table: string;
  international: boolean;
}

export type MockError =
  | { reason: 'noFields' }
  | { reason: 'emptyName' }
  | { reason: 'duplicate'; name: string }
  | { reason: 'minMax'; name: string }
  | { reason: 'dateRange'; name: string }
  | { reason: 'emptyList'; name: string }
  | { reason: 'table' };

export type MockOutput =
  | { ok: true; output: string; preview: string; rows: number; columns: string[] }
  | { ok: false; error: MockError };

export const MAX_ROWS = 1000;
export const DEFAULT_ROWS = 100;
export const PREVIEW_ROWS = 20;
/** DNI, NIE, CIF, IBAN, plate and province only make sense with Spanish data. */
export const SPAIN_ONLY: readonly FieldKind[] = ['dni', 'nie', 'cif', 'iban', 'plate', 'province'];
const DEFAULT_ON: readonly FieldKind[] = [
  'firstName',
  'lastNames',
  'email',
  'phone',
  'dni',
  'city',
];
const TABLE_NAME = /^[A-Za-z_][A-Za-z0-9_]{0,62}$/;
const DAY = 86_400_000;

export const COLUMN_NAMES: Record<Locale, Record<FieldKind, string>> = {
  es: {
    firstName: 'nombre',
    lastNames: 'apellidos',
    email: 'email',
    phone: 'telefono',
    birthDate: 'fecha_nacimiento',
    dni: 'dni',
    nie: 'nie',
    street: 'direccion',
    postalCode: 'codigo_postal',
    province: 'provincia',
    city: 'ciudad',
    company: 'empresa',
    cif: 'cif',
    iban: 'iban',
    card: 'tarjeta',
    plate: 'matricula',
    uuid: 'id',
    number: 'numero',
    boolean: 'activo',
    date: 'fecha',
    list: 'valor',
  },
  en: {
    firstName: 'first_name',
    lastNames: 'last_names',
    email: 'email',
    phone: 'phone',
    birthDate: 'birth_date',
    dni: 'dni',
    nie: 'nie',
    street: 'street',
    postalCode: 'postal_code',
    province: 'province',
    city: 'city',
    company: 'company',
    cif: 'cif',
    iban: 'iban',
    card: 'card',
    plate: 'plate',
    uuid: 'id',
    number: 'number',
    boolean: 'active',
    date: 'date',
    list: 'value',
  },
};

export function defaultField(kind: FieldKind, locale: Locale, uid: string = kind): MockField {
  return {
    uid,
    kind,
    enabled: DEFAULT_ON.includes(kind),
    name: COLUMN_NAMES[locale][kind],
    min: 0,
    max: 100,
    decimals: 0,
    probability: 50,
    from: '2024-01-01',
    to: '2026-12-31',
    values: '',
  };
}

export function defaultConfig(locale: Locale): MockConfig {
  return {
    fields: [...BUILTIN_KINDS, ...CUSTOM_KINDS].map((k) => defaultField(k, locale)),
    rows: DEFAULT_ROWS,
    seed: '',
    format: 'json',
    table: locale === 'es' ? 'usuarios' : 'users',
    international: false,
  };
}

/** Adds another Number, Date or custom list field, enabled, with a unique uid and name. */
export function addField(config: MockConfig, kind: CustomKind, locale: Locale): MockConfig {
  const same = config.fields.filter((f) => f.kind === kind).length;
  let n = same + 1;
  const taken = (uid: string, name: string) =>
    config.fields.some((f) => f.uid === uid || f.name === name);
  const base = COLUMN_NAMES[locale][kind];
  while (taken(`${kind}-${n}`, `${base}_${n}`)) n++;
  const field = {
    ...defaultField(kind, locale, `${kind}-${n}`),
    enabled: true,
    name: `${base}_${n}`,
  };
  return { ...config, fields: [...config.fields, field] };
}

/** Moves a field one place up (-1) or down (+1); out-of-range moves change nothing. */
export function moveField(fields: MockField[], index: number, dir: -1 | 1): MockField[] {
  const j = index + dir;
  if (index < 0 || index >= fields.length || j < 0 || j >= fields.length) return fields;
  const out = fields.slice();
  [out[index], out[j]] = [out[j], out[index]];
  return out;
}

export function isAvailable(field: MockField, international: boolean): boolean {
  return !(international && SPAIN_ONLY.includes(field.kind));
}

/** Lower-case ASCII for emails: no accents (NFD without \p{M}), only a–z and 0–9. */
export function asciiSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function isoDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function parseDay(s: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const ms = Date.parse(`${s}T00:00:00Z`);
  return Number.isNaN(ms) || isoDay(ms) !== s ? null : ms;
}

/** A birth date that gives an age of 18 to 80 on `now` (UTC days). */
export function birthDate(rng: Rng, now: Date): string {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  const latest = Date.UTC(y - 18, m, d);
  const earliest = Date.UTC(y - 81, m, d) + DAY;
  return isoDay(earliest + randInt(rng, 0, Math.round((latest - earliest) / DAY)) * DAY);
}

export type PersonRecord = Record<BuiltinKind, string>;

/**
 * The full record of row `index`, always built in the same order from its own stream,
 * so that choosing, renaming or reordering columns never changes the values of the others.
 */
export function personRecord(
  seed: string,
  index: number,
  now: Date,
  international: boolean,
): PersonRecord {
  const rng = seededRng(`${seed}#${index}`);
  const female = randInt(rng, 0, 1) === 0;
  const esFirst = pick(rng, female ? FEMALE_NAMES : MALE_NAMES);
  const enFirst = pick(rng, female ? INTL_FEMALE_NAMES : INTL_MALE_NAMES);
  const last1 = pick(rng, SURNAMES);
  const last2 = pick(rng, SURNAMES);
  const enLast = pick(rng, INTL_SURNAMES);
  const emailVariant = randInt(rng, 0, 2);
  const emailDigits = String(randInt(rng, 10, 99));
  const domain = pick(rng, EMAIL_DOMAINS);
  const esPhone = generatePhone(rng, 'mobile');
  const enPhone = `+1 202 555 01${String(randInt(rng, 0, 99)).padStart(2, '0')}`;
  const birth = birthDate(rng, now);
  const dni = generateDni(rng);
  const nie = generateNie(rng);
  const esStreet = `${pick(rng, STREET_TYPES)} ${pick(rng, STREETS)}, ${randInt(rng, 1, 150)}`;
  const enStreet = `${randInt(rng, 1, 9999)} ${pick(rng, INTL_STREETS)}`;
  const province = pick(rng, PROVINCES);
  const esPostal = generatePostalCode(rng, province.code);
  const enPostal = digits(rng, 5);
  const enCity = pick(rng, INTL_CITIES);
  const rootIsSurname = randInt(rng, 0, 1) === 0;
  const esRoot = rootIsSurname ? pick(rng, SURNAMES) : pick(rng, COMPANY_WORDS);
  const enRoot = rootIsSurname ? pick(rng, INTL_SURNAMES) : pick(rng, COMPANY_WORDS);
  const sa = randInt(rng, 0, 1) === 0;
  const enSuffix = pick(rng, ['Ltd', 'Inc', 'LLC']);
  const cif = generateCif(rng, sa ? 'A' : 'B');
  const iban = generateSpanishIban(rng);
  const card = generateTestCard(rng, pick(rng, ['visa', 'mastercard', 'amex'] as const));
  const plate = generatePlate(rng);
  const uuid = uuidV4(randomBytesFrom(rng));

  const first = international ? enFirst : esFirst;
  const last = international ? enLast : last1;
  const f = asciiSlug(first);
  const l = asciiSlug(last);
  const local =
    emailVariant === 0
      ? `${f}.${l}`
      : emailVariant === 1
        ? `${f[0]}${l}`
        : `${f}${l}${emailDigits}`;

  return {
    firstName: first,
    lastNames: international ? enLast : `${last1} ${last2}`,
    email: `${local}@${domain}`,
    phone: international ? enPhone : esPhone,
    birthDate: birth,
    dni,
    nie,
    street: international ? enStreet : esStreet,
    postalCode: international ? enPostal : esPostal,
    province: province.name,
    city: international ? enCity : province.capital,
    company: international ? `${enRoot} ${enSuffix}` : `${esRoot} ${sa ? 'S.A.' : 'S.L.'}`,
    cif,
    iban,
    card,
    plate,
    uuid,
  };
}

/** Appends 2, 3… before the @ of repeated emails, in row order. */
export function dedupeEmails(emails: string[]): string[] {
  const seen = new Set<string>();
  return emails.map((e) => {
    let candidate = e;
    const at = e.indexOf('@');
    for (let n = 2; seen.has(candidate); n++) candidate = `${e.slice(0, at)}${n}${e.slice(at)}`;
    seen.add(candidate);
    return candidate;
  });
}

function customValue(field: MockField, rng: Rng): CsvCell {
  switch (field.kind) {
    case 'number': {
      const f = 10 ** Math.min(4, Math.max(0, Math.floor(field.decimals)));
      const lo = Math.ceil(field.min * f);
      const hi = Math.floor(field.max * f);
      if (hi - lo + 1 <= 2 ** 32 && hi >= lo) return randInt(rng, lo, hi) / f;
      return Math.round((field.min + (rng() / 2 ** 32) * (field.max - field.min)) * f) / f;
    }
    case 'boolean':
      return rng() < (Math.min(100, Math.max(0, field.probability)) / 100) * 2 ** 32;
    case 'date': {
      const from = parseDay(field.from) ?? 0;
      const to = parseDay(field.to) ?? 0;
      return isoDay(from + randInt(rng, 0, Math.round((to - from) / DAY)) * DAY);
    }
    default:
      return pick(rng, listValues(field.values));
  }
}

/** One per line or separated by commas. */
export function listValues(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

export function activeFields(config: MockConfig): MockField[] {
  return config.fields.filter((f) => f.enabled && isAvailable(f, config.international));
}

export function validateConfig(config: MockConfig): MockError | null {
  const fields = activeFields(config);
  if (fields.length === 0) return { reason: 'noFields' };
  const names = new Set<string>();
  for (const f of fields) {
    const name = f.name.trim();
    if (!name) return { reason: 'emptyName' };
    if (names.has(name)) return { reason: 'duplicate', name };
    names.add(name);
    if (f.kind === 'number' && !(f.min <= f.max)) return { reason: 'minMax', name };
    if (f.kind === 'date') {
      const from = parseDay(f.from);
      const to = parseDay(f.to);
      if (from === null || to === null || from > to) return { reason: 'dateRange', name };
    }
    if (f.kind === 'list' && listValues(f.values).length === 0)
      return { reason: 'emptyList', name };
  }
  if (config.format === 'sql' && !TABLE_NAME.test(config.table)) return { reason: 'table' };
  return null;
}

/** Rows of cells, in the order of the active fields. */
export function generateRows(config: MockConfig, now: Date, sessionSeed: string): CsvCell[][] {
  const seed = config.seed.trim() || sessionSeed;
  const fields = activeFields(config);
  const count = Math.min(MAX_ROWS, Math.max(1, Math.floor(config.rows) || 1));
  const records = Array.from({ length: count }, (_, i) =>
    personRecord(seed, i, now, config.international),
  );
  const emails = dedupeEmails(records.map((r) => r.email));
  return records.map((r, i) =>
    fields.map((f) => {
      if (f.kind === 'email') return emails[i];
      if ((BUILTIN_KINDS as readonly string[]).includes(f.kind)) return r[f.kind as BuiltinKind];
      return customValue(f, seededRng(`${seed}#${i}#${f.uid}`));
    }),
  );
}

const sqlIdent = (s: string) => `"${s.replace(/"/g, '""')}"`;

function sqlValue(v: CsvCell): string {
  if (v === null) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  return `'${v.replace(/'/g, "''")}'`;
}

export function formatRows(
  format: MockFormat,
  columns: string[],
  rows: CsvCell[][],
  table: string,
): string {
  if (format === 'csv') return toCsv([columns, ...rows]);
  if (format === 'sql') {
    const cols = columns.map(sqlIdent).join(', ');
    return rows
      .map(
        (r) => `INSERT INTO ${sqlIdent(table)} (${cols}) VALUES (${r.map(sqlValue).join(', ')});`,
      )
      .join('\n');
  }
  const objects = rows.map((r) => Object.fromEntries(columns.map((c, i) => [c, r[i]])));
  return JSON.stringify(objects, null, 2);
}

export function renderMock(config: MockConfig, now: Date, sessionSeed: string): MockOutput {
  const error = validateConfig(config);
  if (error) return { ok: false, error };
  const columns = activeFields(config).map((f) => f.name.trim());
  const rows = generateRows(config, now, sessionSeed);
  return {
    ok: true,
    output: formatRows(config.format, columns, rows, config.table),
    preview: formatRows(config.format, columns, rows.slice(0, PREVIEW_ROWS), config.table),
    rows: rows.length,
    columns,
  };
}

const isKind = (k: unknown): k is FieldKind =>
  typeof k === 'string' && ([...BUILTIN_KINDS, ...CUSTOM_KINDS] as string[]).includes(k);

/** Reads the saved configuration; anything missing or malformed falls back to the default. */
export function parseConfig(json: string, locale: Locale): MockConfig {
  const base = defaultConfig(locale);
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return base;
  }
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  const fields = Array.isArray(r.fields)
    ? r.fields.flatMap((x): MockField[] => {
        if (!x || typeof x !== 'object') return [];
        const o = x as Record<string, unknown>;
        if (!isKind(o.kind) || typeof o.uid !== 'string') return [];
        const d = defaultField(o.kind, locale, o.uid);
        const num = (v: unknown, fb: number) =>
          typeof v === 'number' && Number.isFinite(v) ? v : fb;
        const str = (v: unknown, fb: string) => (typeof v === 'string' ? v : fb);
        return [
          {
            ...d,
            enabled: typeof o.enabled === 'boolean' ? o.enabled : d.enabled,
            name: str(o.name, d.name),
            min: num(o.min, d.min),
            max: num(o.max, d.max),
            decimals: num(o.decimals, d.decimals),
            probability: num(o.probability, d.probability),
            from: str(o.from, d.from),
            to: str(o.to, d.to),
            values: str(o.values, d.values),
          },
        ];
      })
    : [];
  return {
    fields: fields.length ? fields : base.fields,
    rows: typeof r.rows === 'number' && Number.isFinite(r.rows) ? r.rows : base.rows,
    seed: typeof r.seed === 'string' ? r.seed : base.seed,
    format:
      r.format === 'csv' || r.format === 'sql' || r.format === 'json' ? r.format : base.format,
    table: typeof r.table === 'string' ? r.table : base.table,
    international: typeof r.international === 'boolean' ? r.international : base.international,
  };
}
```

- [ ] **Step 5: Verificar que pasa**

Run: `pnpm test src/tools/mock`
Expected: PASS (26 tests).

- [ ] **Step 6: `meta.ts` y `strings.ts`**

`src/tools/mock/meta.ts`:
```ts
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'mock',
  category: 'gen',
  icon: 'database',
  slug: { es: 'generador-datos-de-prueba', en: 'mock-data-generator' },
  name: { es: 'Datos de prueba', en: 'Mock data' },
  title: {
    es: 'Generador de datos de prueba: JSON, CSV y SQL',
    en: 'Mock data generator: JSON, CSV and SQL',
  },
  description: {
    es: 'Genera hasta 1000 filas de datos ficticios coherentes (nombre, email, DNI, IBAN, dirección…) en JSON, CSV o SQL. Con semilla, siempre los mismos.',
    en: 'Generate up to 1000 rows of consistent fake data (name, email, Spanish IDs, IBAN, address…) as JSON, CSV or SQL. With a seed, always the same.',
  },
  keywords: {
    es: [
      'datos de prueba',
      'generador datos falsos',
      'mock data',
      'datos ficticios',
      'generar csv',
      'insert sql',
    ],
    en: [
      'mock data generator',
      'fake data',
      'test data generator',
      'random json',
      'sql insert generator',
    ],
  },
  rememberInput: true,
  faq: {
    es: [
      {
        q: '¿Los datos pertenecen a alguien?',
        a: 'No. Nombres y apellidos salen de listas de los más comunes y se combinan al azar; los emails usan dominios reservados (example.com) que no llegan a ningún buzón, y los documentos son números al azar con el control correcto.',
      },
      {
        q: '¿Qué hace la semilla?',
        a: 'Con la misma semilla y la misma configuración obtienes exactamente las mismas filas en cualquier navegador. Sirve para tests reproducibles o para compartir un conjunto de datos sin enviar el archivo.',
      },
    ],
    en: [
      {
        q: 'Does the data belong to anyone?',
        a: 'No. Names come from lists of the most common ones and are combined at random; emails use reserved domains (example.com) that reach no mailbox, and IDs are random numbers with the right check characters.',
      },
      {
        q: 'What does the seed do?',
        a: 'With the same seed and settings you get exactly the same rows in any browser. It is handy for reproducible tests or to share a data set without sending the file.',
      },
    ],
  },
};
```

`src/tools/mock/strings.ts`:
```ts
import type { Locale } from '../types';
import type { FieldKind } from './logic';

export const strings = {
  es: {
    fields: 'Campos',
    include: 'Incluir {field}',
    column: 'Nombre de la columna de {field}',
    spainOnly: 'Solo con datos de España',
    up: 'Subir {field}',
    down: 'Bajar {field}',
    remove: 'Quitar {field}',
    min: 'Mínimo',
    max: 'Máximo',
    decimals: 'Decimales',
    probability: '% de true',
    from: 'Desde',
    to: 'Hasta',
    values: 'Valores, uno por línea o separados por comas',
    addKind: 'Tipo de campo',
    add: 'Añadir campo',
    options: 'Opciones',
    rows: 'Filas',
    format: 'Formato',
    table: 'Tabla',
    international: 'Datos internacionales',
    result: 'Datos generados',
    summary: '{rows} filas · {cols} columnas',
    more: '… y {n} filas más. Copiar y Descargar llevan todas.',
    file: 'datos',
    noFields: 'Elige al menos un campo.',
    emptyName: 'Hay una columna sin nombre: escribe uno.',
    duplicate: 'Hay dos columnas llamadas "{name}": cambia una.',
    minMax: 'En "{name}", el mínimo es mayor que el máximo.',
    dateRange:
      'En "{name}", escribe dos fechas válidas y que la inicial no sea posterior a la final.',
    emptyList: 'La lista de "{name}" está vacía: escribe al menos un valor.',
    tableError:
      'El nombre de la tabla solo admite letras sin tilde, números y _, y no puede empezar por un número.',
  },
  en: {
    fields: 'Fields',
    include: 'Include {field}',
    column: 'Column name for {field}',
    spainOnly: 'Spanish data only',
    up: 'Move {field} up',
    down: 'Move {field} down',
    remove: 'Remove {field}',
    min: 'Minimum',
    max: 'Maximum',
    decimals: 'Decimals',
    probability: '% true',
    from: 'From',
    to: 'To',
    values: 'Values, one per line or comma-separated',
    addKind: 'Field type',
    add: 'Add field',
    options: 'Options',
    rows: 'Rows',
    format: 'Format',
    table: 'Table',
    international: 'International data',
    result: 'Generated data',
    summary: '{rows} rows · {cols} columns',
    more: '… and {n} more rows. Copy and Download include all of them.',
    file: 'data',
    noFields: 'Choose at least one field.',
    emptyName: 'A column has no name: type one.',
    duplicate: 'Two columns are called "{name}": rename one.',
    minMax: 'In "{name}", the minimum is greater than the maximum.',
    dateRange: 'In "{name}", type two valid dates and make sure the first is not after the second.',
    emptyList: 'The list for "{name}" is empty: type at least one value.',
    tableError:
      'The table name only takes unaccented letters, digits and _, and cannot start with a digit.',
  },
} satisfies Record<Locale, Record<string, string>>;

export const fieldNames: Record<Locale, Record<FieldKind, string>> = {
  es: {
    firstName: 'Nombre',
    lastNames: 'Apellidos',
    email: 'Email',
    phone: 'Teléfono',
    birthDate: 'Fecha de nacimiento',
    dni: 'DNI',
    nie: 'NIE',
    street: 'Dirección',
    postalCode: 'Código postal',
    province: 'Provincia',
    city: 'Ciudad',
    company: 'Empresa',
    cif: 'CIF',
    iban: 'IBAN',
    card: 'Tarjeta de prueba',
    plate: 'Matrícula',
    uuid: 'UUID',
    number: 'Número',
    boolean: 'Booleano',
    date: 'Fecha',
    list: 'Lista propia',
  },
  en: {
    firstName: 'First name',
    lastNames: 'Last names',
    email: 'Email',
    phone: 'Phone',
    birthDate: 'Birth date',
    dni: 'DNI',
    nie: 'NIE',
    street: 'Street',
    postalCode: 'Postal code',
    province: 'Province',
    city: 'City',
    company: 'Company',
    cif: 'CIF',
    iban: 'IBAN',
    card: 'Test card',
    plate: 'License plate',
    uuid: 'UUID',
    number: 'Number',
    boolean: 'Boolean',
    date: 'Date',
    list: 'Custom list',
  },
};
```

- [ ] **Step 7: Contenido SEO**

`src/tools/mock/content.es.md`:
```md
## Datos que encajan entre sí

Cada fila es una persona ficticia completa y coherente: el email sale de su nombre y apellido (sin tildes, `maria.ibanez@example.com`), el código postal y la ciudad son de la misma provincia, la letra del DNI o del NIE es correcta y el CIF de su empresa es de tipo A si es una S.A. y de tipo B si es una S.L. Los emails usan los dominios reservados `example.com`, `example.org` y `example.net`, que nunca llegan a un buzón real, así que puedes cargar los datos en un entorno de pruebas sin miedo a escribir a nadie.

Elige las columnas, cámbiales el nombre y ordénalas; añade campos de número, fecha o una lista de valores propios. Quitar o mover columnas no cambia los valores de las demás, porque cada fila se genera siempre entera y en el mismo orden.

## JSON, CSV o SQL, siempre iguales con semilla

La salida puede ser un array JSON (con números y booleanos de su tipo), un CSV con cabecera o una sentencia `INSERT` por fila con los textos bien escapados. La vista previa muestra 20 filas; copiar y descargar llevan todas. Con una semilla, la misma configuración da los mismos datos en cualquier navegador. Sin ella, los datos cambian al pulsar Generar.

El modo «Datos internacionales» usa nombres, calles y ciudades genéricas en inglés y el rango de teléfonos 555-01XX, reservado para la ficción. En ese modo se desactivan los campos que solo tienen sentido en España, como el DNI o el IBAN.
```

`src/tools/mock/content.en.md`:
```md
## Data that fits together

Each row is a complete, consistent fictional person: the email comes from the name and surname (without accents, `maria.ibanez@example.com`), the postal code and city belong to the same province, the DNI or NIE letter is right and the company’s CIF is type A for an S.A. and type B for an S.L. Emails use the reserved domains `example.com`, `example.org` and `example.net`, which never reach a real mailbox, so you can load the data into a test environment without writing to anyone.

Pick the columns, rename and reorder them, and add number, date or custom list fields. Removing or moving columns does not change the values of the others, because every row is always generated in full and in the same order.

## JSON, CSV or SQL, always the same with a seed

The output can be a JSON array (numbers and booleans keep their type), a CSV with a header row, or one `INSERT` statement per row with every text properly escaped. The preview shows 20 rows; copy and download include all of them. With a seed, the same settings give the same data in any browser. Without one, the data changes when you press Generate.

“International data” mode uses generic English names, streets and cities and the 555-01XX phone range, reserved for fiction. In that mode the fields that only make sense in Spain, such as the DNI or the IBAN, are turned off.
```

- [ ] **Step 8: `src/tools/mock/Mock.svelte`**

Todo en un solo componente, incluidas las filas de campos: un subcomponente con `<style>` que solo se monta en el cliente perdería su CSS en producción (`pnpm check:css`). El `svelte-ignore` es necesario: `svelte-check` avisa de que `locale` solo se lee al crear el estado, y eso es justo lo que se quiere (nombra las columnas por defecto hasta que llega la configuración guardada).

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../../i18n';
  import { fill } from '../../i18n/fill';
  import { downloadBlob } from '../../lib/download';
  import { randomSeed } from '../../lib/random';
  import Button from '../../ui/Button.svelte';
  import CopyButton from '../../ui/CopyButton.svelte';
  import Display from '../../ui/Display.svelte';
  import Field from '../../ui/Field.svelte';
  import NumberInput from '../../ui/NumberInput.svelte';
  import Segmented from '../../ui/Segmented.svelte';
  import Select from '../../ui/Select.svelte';
  import Toggle from '../../ui/Toggle.svelte';
  import { persistedInput } from '../../ui/persisted.svelte';
  import type { Locale } from '../types';
  import {
    MAX_ROWS,
    PREVIEW_ROWS,
    addField,
    defaultConfig,
    isAvailable,
    moveField,
    parseConfig,
    renderMock,
    type CustomKind,
    type MockError,
  } from './logic';
  import { meta } from './meta';
  import { fieldNames, strings } from './strings';

  let { locale }: { locale: Locale } = $props();
  const s = $derived(strings[locale]);
  const names = $derived(fieldNames[locale]);

  // The configuration (fields, names, parameters, rows, format, table, seed and mode) is saved
  // as JSON. It holds no personal data: every generated value is fictitious and recomputed.
  const stored = persistedInput('mock', '', meta.rememberInput ?? true);
  // Only the first locale matters: it names the default columns before a saved config loads.
  // svelte-ignore state_referenced_locally
  let config = $state(defaultConfig(locale));
  let loaded = $state(false);
  // Random per session and re-rolled by "Generar": changing the settings keeps the same data.
  let session = $state('');
  let now = $state(new Date());
  let addKind = $state<CustomKind>('number');

  onMount(() => {
    if (stored.value) config = parseConfig(stored.value, locale);
    session = randomSeed();
    now = new Date();
    loaded = true;
  });

  $effect(() => {
    const json = JSON.stringify(config);
    if (loaded) stored.value = json;
  });

  const result = $derived(session ? renderMock(config, now, session) : null);

  function errorText(e: MockError): string {
    switch (e.reason) {
      case 'noFields':
        return s.noFields;
      case 'emptyName':
        return s.emptyName;
      case 'table':
        return s.tableError;
      default:
        return fill(s[e.reason], { name: e.name });
    }
  }

  const tableError = $derived(
    result && !result.ok && result.error.reason === 'table' ? s.tableError : undefined,
  );

  function download() {
    if (!result?.ok) return;
    const types = { json: 'application/json', csv: 'text/csv', sql: 'application/sql' };
    downloadBlob(
      result.output,
      `${s.file}.${config.format}`,
      `${types[config.format]};charset=utf-8`,
    );
  }
</script>

<div class="panel">
  <div class="stack tight">
    <span class="label">{s.fields}</span>
    <ul class="fields">
      {#each config.fields as f, i (f.uid)}
        {@const available = isAvailable(f, config.international)}
        <li class="field" class:off={!available}>
          <label class="check">
            <input
              type="checkbox"
              bind:checked={f.enabled}
              disabled={!available}
              aria-label={fill(s.include, { field: names[f.kind] })}
            />
            <span>{names[f.kind]}</span>
          </label>
          <input
            class="control mono name"
            type="text"
            autocomplete="off"
            spellcheck="false"
            aria-label={fill(s.column, { field: names[f.kind] })}
            disabled={!available}
            bind:value={f.name}
          />
          {#if f.kind === 'number'}
            <input
              class="control mono num"
              type="number"
              step="any"
              aria-label={s.min}
              placeholder={s.min}
              bind:value={f.min}
            />
            <input
              class="control mono num"
              type="number"
              step="any"
              aria-label={s.max}
              placeholder={s.max}
              bind:value={f.max}
            />
            <label class="param">
              <span>{s.decimals}</span>
              <NumberInput id="mock-{f.uid}-decimals" bind:value={f.decimals} min={0} max={4} />
            </label>
          {:else if f.kind === 'boolean'}
            <label class="param">
              <span>{s.probability}</span>
              <NumberInput
                id="mock-{f.uid}-probability"
                bind:value={f.probability}
                min={0}
                max={100}
              />
            </label>
          {:else if f.kind === 'date'}
            <input class="control mono date" type="date" aria-label={s.from} bind:value={f.from} />
            <input class="control mono date" type="date" aria-label={s.to} bind:value={f.to} />
          {:else if f.kind === 'list'}
            <textarea
              class="control mono values"
              rows="2"
              aria-label={s.values}
              placeholder={s.values}
              bind:value={f.values}></textarea>
          {/if}
          {#if !available}<span class="spain-only">{s.spainOnly}</span>{/if}
          <span class="moves">
            <span class="up">
              <Button
                variant="icon"
                icon="chevron-down"
                label={fill(s.up, { field: f.name || names[f.kind] })}
                disabled={i === 0}
                onclick={() => (config.fields = moveField(config.fields, i, -1))}
              />
            </span>
            <Button
              variant="icon"
              icon="chevron-down"
              label={fill(s.down, { field: f.name || names[f.kind] })}
              disabled={i === config.fields.length - 1}
              onclick={() => (config.fields = moveField(config.fields, i, 1))}
            />
            {#if f.uid !== f.kind}
              <Button
                variant="icon"
                icon="x"
                label={fill(s.remove, { field: f.name || names[f.kind] })}
                onclick={() => (config.fields = config.fields.filter((x) => x.uid !== f.uid))}
              />
            {/if}
          </span>
        </li>
      {/each}
    </ul>
    <div class="row">
      <Field id="mock-add-kind" label={s.addKind}>
        <Select
          id="mock-add-kind"
          bind:value={addKind}
          options={[
            { value: 'number', label: names.number },
            { value: 'date', label: names.date },
            { value: 'list', label: names.list },
          ]}
        />
      </Field>
      <Button variant="secondary" onclick={() => (config = addField(config, addKind, locale))}>
        {s.add}
      </Button>
    </div>
  </div>

  <div class="stack tight">
    <span class="label">{s.options}</span>
    <div class="row top">
      <Field id="mock-rows" label={s.rows}>
        <NumberInput id="mock-rows" bind:value={config.rows} min={1} max={MAX_ROWS} />
      </Field>
      <Field id="mock-seed" label={t(locale, 'ui.seed')} help={t(locale, 'ui.seedHelp')}>
        {#snippet children({ describedby })}
          <input
            id="mock-seed"
            class="control mono seed"
            type="text"
            autocomplete="off"
            spellcheck="false"
            aria-describedby={describedby}
            bind:value={config.seed}
          />
        {/snippet}
      </Field>
      <div class="stack tight">
        <span class="label">{s.format}</span>
        <Segmented
          label={s.format}
          options={[
            { value: 'json', label: 'JSON' },
            { value: 'csv', label: 'CSV' },
            { value: 'sql', label: 'SQL' },
          ]}
          bind:value={config.format}
        />
      </div>
      {#if config.format === 'sql'}
        <Field id="mock-table" label={s.table} error={tableError}>
          {#snippet children({ describedby })}
            <input
              id="mock-table"
              class="control mono seed"
              type="text"
              autocomplete="off"
              spellcheck="false"
              aria-describedby={describedby}
              aria-invalid={!!tableError}
              bind:value={config.table}
            />
          {/snippet}
        </Field>
      {/if}
    </div>
    <Toggle bind:checked={config.international} label={s.international} />
  </div>

  <div class="row">
    <Button variant="primary" icon="refresh-cw" onclick={() => (session = randomSeed())}>
      {t(locale, 'ui.generate')}
    </Button>
  </div>

  <Display live label={s.result}>
    {#snippet head()}
      {#if result?.ok}
        <span>{fill(s.summary, { rows: result.rows, cols: result.columns.length })}</span>
      {/if}
    {/snippet}
    {#if result && !result.ok}
      <p class="display-note">{errorText(result.error)}</p>
    {:else if result?.ok}
      <pre class="display-code">{result.preview}</pre>
      {#if result.rows > PREVIEW_ROWS}
        <p class="display-note">{fill(s.more, { n: result.rows - PREVIEW_ROWS })}</p>
      {/if}
    {/if}
  </Display>
  <p class="test-only">{t(locale, 'ui.testOnly')}</p>

  <div class="row">
    <CopyButton main value={result?.ok ? result.output : ''} {locale} />
    <Button variant="ghost" disabled={!result?.ok} onclick={download}>
      {t(locale, 'ui.download')}
    </Button>
  </div>
  <Toggle bind:checked={stored.remember} label={t(locale, 'tool.remember')} />
</div>

<style>
  .tight {
    gap: 8px;
  }
  .top {
    align-items: flex-start;
  }
  .label {
    font-size: 13px;
    font-weight: 600;
  }
  .fields {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .field {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
  }
  .field:last-child {
    border-bottom: 0;
  }
  .field.off {
    opacity: 0.55;
  }
  .check {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-width: 180px;
    min-height: 36px;
    font-size: 14px;
    cursor: pointer;
  }
  .check input {
    width: 18px;
    height: 18px;
    accent-color: var(--accent);
  }
  .check input:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .name {
    width: 190px;
  }
  .num {
    width: 110px;
  }
  .date {
    width: 170px;
  }
  .values {
    flex: 1 1 220px;
    min-height: 44px;
    resize: vertical;
  }
  .seed {
    width: 200px;
  }
  .param {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-dim);
  }
  .spain-only {
    font-size: 13px;
    color: var(--text-dim);
  }
  .moves {
    display: inline-flex;
    gap: 6px;
    margin-left: auto;
  }
  .up :global(svg) {
    rotate: 180deg;
  }
  .test-only {
    font-size: 13px;
    color: var(--text-dim);
  }
  @media (pointer: coarse) {
    .check {
      min-height: 44px;
    }
  }
</style>
```

- [ ] **Step 9: Registrar y montar (solo descomentar)**

`src/tools/registry.ts`: quita el `// ` de estas dos líneas y deja intactas las líneas en blanco de alrededor.
```ts
// import { meta as mock } from './mock/meta';
```
→
```ts
import { meta as mock } from './mock/meta';
```
y
```ts
  // mock,
```
→
```ts
  mock,
```

`src/components/ToolIsland.astro`: lo mismo con sus dos líneas.
```astro
// import Mock from '../tools/mock/Mock.svelte';
```
→
```astro
import Mock from '../tools/mock/Mock.svelte';
```
y
```astro
{/* {id === 'mock' && <Mock client:load locale={locale} />} */}
```
→
```astro
{id === 'mock' && <Mock client:load locale={locale} />}
```

- [ ] **Step 10: Verificar**

```bash
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css
ls dist/es/generador-datos-de-prueba.html dist/en/mock-data-generator.html
```
Expected: todo en verde (`pnpm check` con 0 avisos) y existen las dos páginas.

- [ ] **Step 11: Comprobar en el navegador (script desechable)**

Crea `check-mock.mjs` en la raíz del worktree (no se confirma nunca):
```js
// Throwaway browser check for the mock task. Never committed: delete it after running.
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const PORT = 4711;
const server = spawn('node_modules/.bin/astro', ['preview', '--port', String(PORT), '--ignore-lock'], {
  stdio: 'ignore',
});
const base = `http://localhost:${PORT}`;
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`${base}/es`)).ok) break;
  } catch {
    // Not listening yet.
  }
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch();
const page = await browser.newPage({ locale: 'es-ES', viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(5000);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
const see = (text) => page.locator('.panel').getByText(text).first().waitFor();
const rows = async (n, display) => {
  const scope = display ? page.getByRole('region', { name: display }) : page.locator('.panel');
  const count = await scope.locator('.display-row').count();
  if (count !== n) throw new Error(`expected ${n} rows, got ${count}`);
};
const nothingStored = async (id, typed) => {
  await page.waitForTimeout(500);
  const hits = await page.evaluate(
    ([k, t]) => Object.entries(localStorage).filter(([key, v]) => key.includes(k) || v.includes(t)),
    [id, typed],
  );
  if (hits.length) throw new Error(`stored: ${JSON.stringify(hits)}`);
};
try {
  await page.goto(`${base}/es/generador-datos-de-prueba`);
  await page.locator('astro-island[ssr]').first().waitFor({ state: 'detached' });
  await page.locator('#mock-seed').fill('demo');
  await page.locator('#mock-rows').fill('5');
  await page.getByRole('radio', { name: 'CSV', exact: true }).click();
  await see('nombre,apellidos,email,telefono,dni,ciudad');
  await page.getByRole('button', { name: 'Añadir campo' }).click();
  await see('numero_2');
  await page.getByRole('radio', { name: 'SQL', exact: true }).click();
  await see('INSERT INTO "usuarios"');
  await page.waitForTimeout(500);
  await page.reload();
  await page.locator('astro-island[ssr]').first().waitFor({ state: 'detached' });
  // rememberInput: the configuration comes back after a reload.
  if ((await page.locator('#mock-seed').inputValue()) !== 'demo') throw new Error('not restored');
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`horizontal scroll at ${width} px`);
  }
  for (const theme of ['light', 'dark', 'terminal']) {
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await page.screenshot({ path: `check-mock-${theme}.png`, fullPage: true });
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('OK mock');
} finally {
  await browser.close();
  server.kill();
}
```

Run:
```bash
pnpm build && node check-mock.mjs
```
Expected: `OK mock`. El script comprueba que con la semilla `demo`, 5 filas y CSV la cabecera es `nombre,apellidos,email,telefono,dni,ciudad`, que «Añadir campo» crea `numero_2`, que SQL escribe `INSERT INTO "usuarios"` y que la configuración vuelve tras recargar. También comprueba que no hay scroll horizontal a 390 px ni a 1280 px y guarda una captura por tema (`check-mock-light.png`, `-dark.png`, `-terminal.png`): ábrelas y confirma que los resultados se leen en la pantalla hundida y que nada se sale del panel en ningún tema.

Después, bórralo todo:
```bash
rm check-mock.mjs check-mock-*.png
```

- [ ] **Step 12: Commit**

```bash
git add src/tools/mock src/tools/registry.ts src/components/ToolIsland.astro
git status --porcelain   # solo esas rutas
git commit -m "feat(mock): generador de datos de prueba en JSON, CSV y SQL"
```

---

### Task 12: Cierre: registro compacto, e2e de las 11 herramientas, README y verificación completa

**Files:**
- Modify: `src/tools/registry.ts`, `src/components/ToolIsland.astro`, `e2e/tools.spec.ts`, `README.md`

**Interfaces:**
- Consumes: las 11 herramientas fusionadas y el DOM que declara cada task en su bloque «Interfaces».
- Produces: nada nuevo. El sitio queda con 25 herramientas y la categoría Identificadores visible.

- [ ] **Step 1: Comprobar que todo está fusionado**

```bash
git log --oneline -20
grep -c "^// import" src/tools/registry.ts src/components/ToolIsland.astro
grep -c "^{/\*" src/components/ToolIsland.astro
pnpm install --frozen-lockfile && pnpm test
```
Expected: los 11 commits `feat(<id>): …` en el log, los `grep -c` dan `0` y los tests en verde. Si falta una herramienta, termina antes su task: esta no la sustituye.

- [ ] **Step 2: Compactar `registry.ts` y `ToolIsland.astro`**

Los comentarios y las líneas en blanco solo servían para fusionar en paralelo. Sustituye `src/tools/registry.ts` por (comprobado: Prettier lo deja igual):
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
import { meta as dni } from './dni/meta';
import { meta as cif } from './cif/meta';
import { meta as iban } from './iban/meta';
import { meta as plate } from './plate/meta';
import { meta as nss } from './nss/meta';
import { meta as card } from './card/meta';
import { meta as phone } from './phone/meta';
import { meta as bic } from './bic/meta';
import { meta as eanIsbn } from './ean-isbn/meta';
import { meta as postalCode } from './postal-code/meta';
import { meta as mock } from './mock/meta';
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
  dni,
  cif,
  iban,
  plate,
  nss,
  card,
  phone,
  bic,
  eanIsbn,
  postalCode,
  mock,
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
import Dni from '../tools/dni/Dni.svelte';
import Cif from '../tools/cif/Cif.svelte';
import Iban from '../tools/iban/Iban.svelte';
import Plate from '../tools/plate/Plate.svelte';
import Nss from '../tools/nss/Nss.svelte';
import Card from '../tools/card/Card.svelte';
import Phone from '../tools/phone/Phone.svelte';
import Bic from '../tools/bic/Bic.svelte';
import EanIsbn from '../tools/ean-isbn/EanIsbn.svelte';
import PostalCode from '../tools/postal-code/PostalCode.svelte';
import Mock from '../tools/mock/Mock.svelte';
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
{id === 'dni' && <Dni client:load locale={locale} />}
{id === 'cif' && <Cif client:load locale={locale} />}
{id === 'iban' && <Iban client:load locale={locale} />}
{id === 'plate' && <Plate client:load locale={locale} />}
{id === 'nss' && <Nss client:load locale={locale} />}
{id === 'card' && <Card client:load locale={locale} />}
{id === 'phone' && <Phone client:load locale={locale} />}
{id === 'bic' && <Bic client:load locale={locale} />}
{id === 'ean-isbn' && <EanIsbn client:load locale={locale} />}
{id === 'postal-code' && <PostalCode client:load locale={locale} />}
{id === 'mock' && <Mock client:load locale={locale} />}
```

Run: `pnpm test && pnpm check`
Expected: verde. `registry.test.ts` valida las 25 metas, sus slugs únicos y sus 50 archivos de contenido.

- [ ] **Step 3: e2e de las 11 herramientas**

En `e2e/tools.spec.ts`, al final del array `PAGES`, después de `['/es/conversor-bases-numericas', 'Bases numéricas'],`, añade:
```ts
  ['/es/validador-dni-nie', 'DNI y NIE'],
  ['/es/validador-cif', 'CIF'],
  ['/es/validador-iban', 'IBAN'],
  ['/es/validador-matriculas', 'Matrículas'],
  ['/es/validador-numero-seguridad-social', 'Nº Seguridad Social'],
  ['/es/tarjetas-de-credito-de-prueba', 'Tarjetas de prueba'],
  ['/es/validador-telefonos-espana', 'Teléfonos ES'],
  ['/es/validador-swift-bic', 'SWIFT / BIC'],
  ['/es/validador-ean-isbn', 'EAN e ISBN'],
  ['/es/codigo-postal-provincia', 'Código postal'],
  ['/es/generador-datos-de-prueba', 'Datos de prueba'],
```

Y al final del archivo, después del último `});`, añade el bloque siguiente. Usa `test`, `expect`, `Page` y `radio`, que ya están definidos arriba. Cada caso es la interacción de la tabla de la §9 del spec. Los LED se leen en `.display-head` y no con `getByText` global, porque las FAQ repiten frases como «IBAN válido». La comprobación de «nada guardado» busca claves con el id y valores con lo escrito, nunca valores con el id: `devtools:recent` guarda los ids de las herramientas visitadas.
```ts
// Lote 1: `recent` and `favorites` hold tool ids as values, so "nothing stored" means no key
// with the tool id and no value with what was typed, never "no value with the id".
async function nothingStored(page: Page, toolId: string, typed: string) {
  await page.waitForTimeout(500);
  const hits = await page.evaluate(
    ([id, text]) =>
      Object.entries(localStorage)
        .filter(([k, v]) => k.includes(id) || v.includes(text))
        .map(([k]) => k),
    [toolId, typed],
  );
  expect(hits).toEqual([]);
}

const rowsOf = (page: Page, display: string) =>
  page.getByRole('region', { name: display }).locator('.display-row > span:first-child');

test.describe('lote 1: identifiers and mock data', () => {
  test('dni explains a wrong letter and never stores the input', async ({ page }) => {
    await page.goto('/es/validador-dni-nie');
    await page.locator('#dni-input').fill('12345678A');
    await expect(page.getByText('Letra incorrecta: para 12345678 es Z.')).toBeVisible();
    await page.locator('#dni-input').fill('12345678Z');
    await expect(page.locator('.display-head')).toContainText('DNI válido');
    await nothingStored(page, 'dni', '12345678Z');
  });

  test('cif validates a company and generates with a seed', async ({ page }) => {
    await page.goto('/es/validador-cif');
    await page.locator('#cif-input').fill('B65410011');
    await expect(page.locator('.display-head')).toContainText('CIF válido');
    await expect(page.locator('.display-kv')).toContainText('Sociedad de responsabilidad limitada');
    await radio(page, 'Generar').click();
    await page.locator('#cif-seed').fill('demo');
    const rows = rowsOf(page, 'CIF generados');
    await expect(rows).toHaveCount(10);
    for (const v of await rows.allTextContents()) expect(v).toMatch(/^[A-HJNP-SUVW]\d{7}[0-9A-J]$/);
  });

  test('iban breaks down a Spanish IBAN, catches a typo and stores nothing', async ({ page }) => {
    await page.goto('/es/validador-iban');
    await page.locator('#iban-input').fill('ES91 2100 0418 4502 0005 1332');
    await expect(page.locator('.display-head')).toContainText('IBAN válido');
    await expect(page.locator('.display-kv')).toContainText('2100');
    await page.locator('#iban-input').fill('ES91 2100 0418 4502 0005 1333');
    await expect(page.locator('.display-head')).toContainText('No válido');
    await nothingStored(page, 'iban', 'ES91');
  });

  test('plate rejects vowels and reads old provincial plates', async ({ page }) => {
    await page.goto('/es/validador-matriculas');
    await page.locator('#plate-input').fill('1234 BCA');
    await expect(page.getByText('La letra A no se usa en las matrículas actuales')).toBeVisible();
    await page.locator('#plate-input').fill('M-1234-AB');
    await expect(page.locator('.display-head')).toContainText('Matrícula válida');
    await expect(page.locator('.display-kv')).toContainText('Madrid');
  });

  test('nss shows the province and the right control', async ({ page }) => {
    await page.goto('/es/validador-numero-seguridad-social');
    await page.locator('#nss-input').fill('28/12345678/40');
    await expect(page.locator('.display-head')).toContainText('Número válido');
    await expect(page.locator('.display-kv')).toContainText('Madrid');
    await page.locator('#nss-input').fill('281234567841');
    await expect(page.getByText('debería ser 40')).toBeVisible();
  });

  test('card validates with Luhn, generates Amex and stores nothing', async ({ page }) => {
    await page.goto('/es/tarjetas-de-credito-de-prueba');
    await page.locator('#card-input').fill('4242 4242 4242 4242');
    await expect(page.locator('.display-head')).toContainText('Luhn correcto');
    await expect(page.locator('.display-kv')).toContainText('Visa');
    await radio(page, 'Generar').click();
    await radio(page, 'American Express').click();
    await page.locator('#card-seed').fill('demo');
    const rows = rowsOf(page, 'Tarjetas generadas');
    await expect(rows).toHaveCount(10);
    for (const v of await rows.allTextContents()) expect(v).toMatch(/^3[47]\d{13}$/);
    await nothingStored(page, 'card', '4242 4242');
  });

  test('phone classifies a mobile and prints E.164', async ({ page }) => {
    await page.goto('/es/validador-telefonos-espana');
    await page.locator('#phone-input').fill('+34 612 34 56 78');
    await expect(page.locator('.display-head')).toContainText('Móvil');
    await expect(page.locator('.display-value')).toHaveText('+34612345678');
  });

  test('bic reads the head office of a lower-case code', async ({ page }) => {
    await page.goto('/es/validador-swift-bic');
    await page.locator('#bic-input').fill('caixesbbxxx');
    await expect(page.locator('.display-head')).toContainText('BIC válido');
    await expect(page.locator('.display-kv')).toContainText('España');
    await expect(page.locator('.display-kv')).toContainText('Oficina principal');
  });

  test('ean-isbn turns an ISBN-10 into its ISBN-13', async ({ page }) => {
    await page.goto('/es/validador-ean-isbn');
    await page.locator('#ean-isbn-input').fill('0306406152');
    await expect(page.locator('.display-head')).toContainText('ISBN-10 válido');
    await expect(page.locator('.display-kv')).toContainText('9780306406157');
  });

  test('postal-code restores the leading zero', async ({ page }) => {
    await page.goto('/es/codigo-postal-provincia');
    await page.locator('#postal-code-input').fill('8001');
    await expect(page.getByText('Añadido el 0 inicial')).toBeVisible();
    await expect(page.locator('.display-value')).toHaveText('08001');
    await expect(page.locator('.display-kv')).toContainText('Barcelona');
  });

  test('mock builds CSV with a seed, drops Spanish fields and downloads SQL', async ({ page }) => {
    await page.goto('/es/generador-datos-de-prueba');
    await page.locator('#mock-seed').fill('demo');
    await page.locator('#mock-rows').fill('5');
    await radio(page, 'CSV').click();
    const lines = async () =>
      ((await page.locator('.display-code').textContent()) ?? '').split(/\r?\n/);
    await expect
      .poll(async () => (await lines())[0])
      .toBe('nombre,apellidos,email,telefono,dni,ciudad');
    expect(await lines()).toHaveLength(6);
    await page.getByRole('switch', { name: 'Datos internacionales' }).check();
    await expect
      .poll(async () => (await lines())[0])
      .toBe('nombre,apellidos,email,telefono,ciudad');
    await radio(page, 'SQL').click();
    await expect(page.locator('.display-code')).toContainText('INSERT INTO "usuarios"');
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar' }).click();
    expect((await download).suggestedFilename()).toBe('datos.sql');
  });
});
```

Run:
```bash
pnpm build && pnpm test:e2e
```
Expected: todo en verde en el puerto 4642 (69 tests en la comprobación previa: los 47 de antes, 11 páginas y 11 interacciones). Si falla un selector, compáralo con el bloque «DOM» de la task de esa herramienta; si falla el comportamiento, arregla el componente, no el test.

- [ ] **Step 4: Herramientas nuevas en el README**

En `README.md`, en la tabla de `## Herramientas`, añade esta fila justo después de la de Lorem ipsum:
```md
| Generadores | Datos de prueba (JSON, CSV y SQL) | [/es/generador-datos-de-prueba](https://devtools.alvarotc.com/es/generador-datos-de-prueba) |
```
y estas diez justo después de la de «Mayúsculas y líneas» (antes de la primera de Conversores), en el orden de las categorías:
```md
| Identificadores | DNI y NIE | [/es/validador-dni-nie](https://devtools.alvarotc.com/es/validador-dni-nie) |
| Identificadores | CIF | [/es/validador-cif](https://devtools.alvarotc.com/es/validador-cif) |
| Identificadores | IBAN y CCC | [/es/validador-iban](https://devtools.alvarotc.com/es/validador-iban) |
| Identificadores | Matrículas | [/es/validador-matriculas](https://devtools.alvarotc.com/es/validador-matriculas) |
| Identificadores | Número de la Seguridad Social | [/es/validador-numero-seguridad-social](https://devtools.alvarotc.com/es/validador-numero-seguridad-social) |
| Identificadores | Tarjetas de prueba (Luhn) | [/es/tarjetas-de-credito-de-prueba](https://devtools.alvarotc.com/es/tarjetas-de-credito-de-prueba) |
| Identificadores | Teléfonos de España (E.164) | [/es/validador-telefonos-espana](https://devtools.alvarotc.com/es/validador-telefonos-espana) |
| Identificadores | SWIFT / BIC | [/es/validador-swift-bic](https://devtools.alvarotc.com/es/validador-swift-bic) |
| Identificadores | EAN-13 e ISBN | [/es/validador-ean-isbn](https://devtools.alvarotc.com/es/validador-ean-isbn) |
| Identificadores | Código postal → provincia | [/es/codigo-postal-provincia](https://devtools.alvarotc.com/es/codigo-postal-provincia) |
```

- [ ] **Step 5: Verificación completa**

```bash
pnpm install --frozen-lockfile
pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css && pnpm test:e2e
ls dist/es/*.html | wc -l
ls dist/en/*.html | wc -l
```
Expected: todo en verde y `25` páginas de herramienta por idioma (la Home es `dist/es.html` y `dist/en.html`).

Las páginas nuevas responden `200` sin redirección:
```bash
pnpm exec astro preview --port 4642 --ignore-lock &
PREVIEW=$!
sleep 3
for u in /es/validador-dni-nie /en/spanish-dni-nie-validator /es/validador-iban /en/iban-validator \
         /es/codigo-postal-provincia /en/spanish-postal-code-province /es/generador-datos-de-prueba /en/mock-data-generator; do
  printf '%s ' "$u"; curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:4642$u"
done
kill $PREVIEW
```
Expected: todas `200`.

A mano con `pnpm preview`, en los tres temas (empezando por el claro, que es el de por defecto) y a 390 px y 1280 px: abre las 11 herramientas; no hay scroll horizontal, los resultados están en la pantalla hundida, `c` copia el resultado principal y `1…9` cambian de pestaña donde las hay. En la sidebar aparece Identificadores con 10 herramientas y Generadores con 3.

- [ ] **Step 6: Commits**

```bash
git add src/tools/registry.ts src/components/ToolIsland.astro
git commit -m "chore: compactar el registro de herramientas tras el lote 1"

git add e2e/tools.spec.ts
git commit -m "test: e2e de las 11 herramientas del lote 1"

git add README.md
git commit -m "docs: herramientas del lote 1 en el README"
```

---

## Después de este plan

La rama `feat/herramientas-nuevas` tiene las 25 herramientas. El siguiente paso es revisarla entera, fusionarla en `main` y desplegar (superpowers:finishing-a-development-branch); eso lo decide el autor. Los lotes 2 y 3 tienen su propio plan.

## Revisión contra el spec

Cada punto del lote 1, con la task que lo cumple y lo que lo comprueba.

| Spec | Punto | Task | Comprobación |
|---|---|---|---|
| §2 | 11 herramientas, ids, categorías, slugs, iconos y `rememberInput` de la tabla | 1–11 | `meta.ts` de cada task, idénticos a la tabla; `registry.test.ts` (slugs únicos y válidos, título ≤ 65, descripción 51–160, icono, contenido) |
| §2 | Task 0 sola, tasks en paralelo con 4 líneas, `mock` al final, cierre con verificación completa | 0–12 | Orden de ejecución y «Cómo fusionar»; fusión simulada sin conflictos |
| §3 | Contrato `ToolMeta`, carpeta autocontenida, `logic.ts` puro, textos en `strings.ts` | 1–11 | Estructura de archivos; tests en entorno `node` |
| §3 | Resultados en `Display`, primario solo para Generar, un `Segmented main` y un `CopyButton main` por vista | 1–11 | Componentes; atajos `c` y `1…9` en la verificación manual de la Task 12 |
| §3 | Sin hex, `:global` para temas, CSS en el padre, 44 px táctiles | 1–11 | Componentes; `pnpm check:css`; capturas en los tres temas de cada script |
| §3 | Azar solo por `lib/random.ts`; `ui.testOnly` junto a todo documento generado | 0–6, 11 | `randomSeed`/`seededRng` en los componentes; nota en cada pestaña Generar y en `mock` |
| §3 | Normalización de identificadores y validación con explicación (`{ ok, reason, expected? }`) | 1–10 | Tipos `…Result` de cada `logic.ts`; tests de errores |
| §4.2 | `random.ts` con FNV-1a + mulberry32, `randInt` sin sesgo y sus tests | 0 | Review Focus 2 |
| §4.2 | Contrato de generadores y prueba de ida y vuelta de 1 000 valores | 1–7, 10 | Tabla «Contrato para la Task 11»; tests `round-trip` |
| §4.3 | `provinces.ts` (52, códigos consecutivos, siglas únicas) y `toCsv` (RFC 4180) | 0 | `provinces.test.ts`, `csv.test.ts` |
| §4.4 | 11 iconos | 0 | `Record<IconName, …>` en `pnpm check` |
| §4.5 | `ui.seed`, `ui.seedHelp`, `ui.quantity`, `ui.testOnly` | 0 | `i18n.test.ts` |
| §4.6 | Sin componentes nuevos en el kit | 1–11 | Solo `src/ui/` existente |
| §6 | Validar: LED con razón y `Display kv`; varias líneas con recuento; Generar con cantidad 1–500, semilla, primario, filas con copiar, copiar todo y `ui.testOnly` | 1–10 | Componentes; scripts de navegador |
| §6.1 | `dni` completo (algoritmo, 5 ejemplos, errores, relleno, K/L/M, Generar, Calcular letra, ✗, FAQ) | 1 | `dni/logic.test.ts`; e2e |
| §6.2 | `cif` completo (tipos, estrictos, algoritmo, 6 ejemplos, K/L/M, errores, Generar, ✓ con `shouldSave`, casos límite) | 2 | `cif/logic.test.ts`; Review Focus 4; e2e |
| §6.3 | `iban` completo (orden de validación, CCC, CCC suelto, generación, 7 ejemplos, salida, tabla de 102, ✗, casos límite, FAQ) | 3 | `iban/logic.test.ts`; Review Focus 3; e2e |
| §6.4 | `plate` completo (actual, posición, provincial, detección, Generar, ✓, fuera de alcance) | 4 | `plate/logic.test.ts`; e2e |
| §6.5 | `nss` completo (dos ramas, ejemplos, provincia como aviso, Generar, ✗, bordes) | 5 | Review Focus 1; e2e |
| §6.6 | `card` completo (Luhn, 6 ejemplos, marcas, longitudes, Generar, caducidad y CVV, Stripe, aviso fijo, ✗) | 6 | `card/logic.test.ts`; e2e |
| §6.7 | `phone` completo (normalización, tabla, cortos, salida, `generatePhone`, ✗, casos límite) | 7 | `phone/logic.test.ts`; e2e |
| §6.8 | `bic` completo (formato, 250 países, salida, pruebas, ✓, casos límite) | 8 | `bic/logic.test.ts`; e2e |
| §6.9 | `ean-isbn` completo (longitudes, fórmulas, conversión, 979, GS1, ✓, X) | 9 | `ean-isbn/logic.test.ts`; e2e |
| §6.10 | `postal-code` completo (provincia, 0 inicial, prefijos, inversa, `generatePostalCode`, ✓) | 10 | `postal-code/logic.test.ts`; e2e |
| §6.11 | `mock` completo (21 campos, coherencia, reproducibilidad, opciones, internacional, 3 formatos, errores, ✓, rendimiento, casos límite) | 11 | `mock/logic.test.ts`; Review Focus 5; e2e |
| §9 | Ejemplos comprobados y casos límite en cada `logic.test.ts`; una interacción e2e por herramienta con las de la tabla | 1–12 | Tests; bloque e2e de la Task 12 |
| §10 | Contrato respetado por las tasks paralelas; tablas con fecha y fuente | 0–11 | Step 1 de la Task 11; comentarios de `IBAN_LENGTHS` y `COUNTRIES` |
| §11 | Fuera de alcance dicho en la interfaz o en el contenido | 3, 4, 8, 9, 10 | Mensajes `special`, textos SEO |

### Desviaciones y decisiones de este plan

- **`src/lib/ids.ts`** es un helper compartido que el spec no lista en §4: normalización, líneas, cantidades y la tabla de letras del DNI. Hace falta porque `dni` y `cif` usan la misma tabla y se construyen en paralelo.
- **`randomSeed()`** se añade a `random.ts` para la semilla de sesión (pestañas Generar y `mock`), en lugar de llamar a `crypto` desde los componentes.
- **Posición de la matrícula:** es la fórmula del spec **más 1**, de modo que `0000 BBB` es la primera (1) y `9999 ZZZ` la 80 000 000.
- **`mock`:** los campos con parámetros tienen su propio flujo de azar por fila (`seed#fila#uid`). Cumple la promesa de §6.11 también al añadir un segundo campo o cambiar su rango, cosa que un solo flujo por fila no cumpliría.
- **Motivos de error añadidos**, cada uno con su mensaje: en `dni`, `missingLetter` («Falta la letra: para N es L»), `manyDigits` y `format`; en `cif`, `digitFirst`; en `iban`, `cccOnly`, porque el mensaje «El IBAN es coherente…» no aplica a un CCC suelto; en `mock`, `dateRange`.
- **Las 10 herramientas de `ids` aceptan varias líneas**, `bic` y `ean-isbn` incluidas: el patrón es el mismo en todas y cuesta lo mismo.
- **El botón de subir de `mock`** reutiliza `chevron-down` girado con CSS, para no añadir iconos fuera de la §4.4.

### Autorrevisión

- **Cobertura:** cada ficha del lote 1 tiene su task y cada interacción e2e de la §9 está en la Task 12.
- **Tipos:** los tipos entre tasks son coherentes. `Rng` sale siempre de `lib/random`, `Province` de `lib/provinces` y `TestBrand`/`CifType` de su herramienta. `mock` solo usa las firmas del contrato, y `pnpm check` pasó con todo junto.
- **ids, slugs e iconos:** son idénticos a la tabla de la §2 del spec, y `registry.test.ts` los valida.
- **`rememberInput`:** ✗ en `dni`, `iban`, `nss`, `card` y `phone`, con `$state` y sin interruptor. ✓ en `cif` (con `shouldSave`), `plate`, `bic`, `ean-isbn`, `postal-code` y `mock` (configuración en JSON). Coincide con la §2 y la §12 del spec.
