# DevTools: 38 herramientas nuevas (identificadores, conversores, azar, calculadoras y más)

- **Fecha:** 2026-09-26
- **Estado:** decisiones de alcance aprobadas en conversación, pendiente de revisión escrita
- **Subproyecto:** 2 de 2. Se construye sobre la plataforma del subproyecto 1: `docs/superpowers/specs/2026-09-26-devtools-plataforma-design.md` (en adelante, *spec de plataforma*). Todo lo que este documento no cambia sigue como allí.
- **Entrega:** 3 lotes, cada uno con su plan, su fusión y su despliegue (§2).

## 1. Objetivo

La plataforma ya está en producción con 14 herramientas en 4 categorías. Este subproyecto añade **38 herramientas**, abre las categorías vacías (Identificadores, Azar y Referencia) y crea una nueva, **Calculadoras** (`calc`).

**Éxito** = las 38 herramientas publicadas con su URL ES/EN, cada una con lógica pura testeada, textos ES/EN, contenido SEO y una interacción e2e real. Todas usan el kit de UI y las convenciones de la plataforma. Ninguna envía datos del usuario a ningún sitio, y los algoritmos de control están comprobados contra ejemplos conocidos.

### Supuestos

- Sigue siendo 100 % cliente. La única petición de red nueva es la descarga de los tipos de cambio públicos del BCE (§7.2), sin datos del usuario.
- Las librerías se admiten solo si son pequeñas, conocidas y mantenidas, con licencia MIT, ISC, Apache-2.0 o BSD. Se importan únicamente desde la herramienta que las usa, así que Vite las separa en el chunk de esa página (§5).
- Los datos de España (provincias, festivos, formatos) se escriben a mano en el código y se testean. No hay ficheros de datos que haya que mantener cada año.

## 2. Alcance y entregas

### Resumen de las 38 herramientas

Leyenda de **Rec.** (`rememberInput`): ✓ = `true` (valor por defecto), ✗ = `false`. La justificación va en la ficha de cada herramienta.

| Lote | id | Cat. | Slug ES | Slug EN | Icono | Pestañas (ES) | Rec. | Librería |
|---|---|---|---|---|---|---|---|---|
| 1 | `dni` | ids | `validador-dni-nie` | `spanish-dni-nie-validator` | `id-card-lanyard` | Validar · Generar · Calcular letra | ✗ | — |
| 1 | `cif` | ids | `validador-cif` | `spanish-cif-validator` | `building` | Validar · Generar | ✓ | — |
| 1 | `iban` | ids | `validador-iban` | `iban-validator` | `landmark` | Validar · Generar | ✗ | — |
| 1 | `plate` | ids | `validador-matriculas` | `spanish-license-plate-validator` | `car` | Validar · Generar | ✓ | — |
| 1 | `nss` | ids | `validador-numero-seguridad-social` | `spanish-social-security-number-validator` | `heart-pulse` | Validar · Generar | ✗ | — |
| 1 | `card` | ids | `tarjetas-de-credito-de-prueba` | `test-credit-card-numbers` | `credit-card` | Validar · Generar | ✗ | — |
| 1 | `phone` | ids | `validador-telefonos-espana` | `spanish-phone-number-validator` | `phone` | — | ✗ | — |
| 1 | `bic` | ids | `validador-swift-bic` | `swift-bic-validator` | `globe` | — | ✓ | — |
| 1 | `ean-isbn` | ids | `validador-ean-isbn` | `ean-isbn-validator` | `barcode` | — | ✓ | — |
| 1 | `postal-code` | ids | `codigo-postal-provincia` | `spanish-postal-code-province` | `map-pin` | — | ✓ | — |
| 1 | `mock` | gen | `generador-datos-de-prueba` | `mock-data-generator` | `database` | — | ✓ | — |
| 2 | `units` | conv | `conversor-unidades` | `unit-converter` | `ruler` | Longitud · Masa · Temperatura · Volumen · Área · Velocidad · Datos | ✓ | — |
| 2 | `currency` | conv | `conversor-divisas` | `currency-converter` | `coins` | — | ✓ | — |
| 2 | `px-rem` | conv | `conversor-px-rem` | `px-to-rem-converter` | `scaling` | — | ✓ | — |
| 2 | `chmod` | conv | `calculadora-chmod` | `chmod-calculator` | `lock` | — | ✓ | — |
| 2 | `file-size` | conv | `conversor-tamano-archivos` | `file-size-converter` | `hard-drive` | — | ✓ | — |
| 2 | `wheel` | rand | `ruleta-aleatoria` | `spin-the-wheel` | `ferris-wheel` | — | ✓ | — |
| 2 | `shuffle` | rand | `mezclar-lista-aleatoria` | `random-list-shuffler` | `shuffle` | — | ✓ | — |
| 2 | `teams` | rand | `generador-equipos-aleatorios` | `random-team-generator` | `users` | — | ✓ | — |
| 2 | `dice` | rand | `lanzar-dados-moneda` | `dice-roller-coin-flip` | `dice-5` | Dados · Moneda | ✓ | — |
| 2 | `iva` | calc | `calculadora-iva` | `spanish-vat-calculator` | `receipt` | — | ✓ | — |
| 2 | `irpf` | calc | `calculadora-retencion-irpf` | `spanish-irpf-withholding-calculator` | `receipt-text` | — | ✓ | — |
| 2 | `percent` | calc | `calculadora-porcentajes` | `percentage-calculator` | `percent` | X % de Y · Qué % es · Variación | ✓ | — |
| 2 | `rule-of-three` | calc | `regla-de-tres` | `rule-of-three-calculator` | `divide` | Directa · Inversa | ✓ | — |
| 2 | `workdays` | calc | `calculadora-dias-habiles` | `spanish-business-days-calculator` | `calendar-days` | — | ✓ | — |
| 3 | `password` | gen | `generador-contrasenas` | `password-generator` | `lock-keyhole` | — | ✗ | — |
| 3 | `qr` | gen | `generador-codigo-qr` | `qr-code-generator` | `qr-code` | Texto · URL · WiFi | ✓ | `qrcode-generator` |
| 3 | `slug` | gen | `generador-slug` | `slug-generator` | `link-2` | — | ✓ | — |
| 3 | `data-convert` | data | `conversor-json-yaml-csv` | `json-yaml-csv-converter` | `sheet` | — | ✓ | `yaml` |
| 3 | `json-diff` | data | `comparar-json` | `json-diff` | `git-compare-arrows` | — | ✓ | — |
| 3 | `markdown` | data | `vista-previa-markdown` | `markdown-preview` | `file-text` | Vista previa · HTML | ✓ | `marked`, `dompurify` |
| 3 | `curl` | data | `convertir-curl-a-fetch` | `curl-to-fetch-converter` | `terminal` | — | ✗ | — |
| 3 | `query-string` | data | `conversor-query-string-json` | `query-string-to-json` | `file-braces` | — | ✓ | — |
| 3 | `http-status` | ref | `codigos-estado-http` | `http-status-codes` | `server` | — | ✓ | — |
| 3 | `cron` | ref | `explicar-expresion-cron` | `cron-expression-explainer` | `calendar-clock` | — | ✓ | — |
| 3 | `user-agent` | ref | `analizar-user-agent` | `user-agent-parser` | `monitor-smartphone` | — | ✓ | `ua-parser-js` 1.x |
| 3 | `semver` | ref | `comprobar-rango-semver` | `semver-range-checker` | `tag` | — | ✓ | `semver` |
| 3 | `cidr` | ref | `calculadora-subredes-cidr` | `cidr-subnet-calculator` | `network` | — | ✓ | — |

Recuento: lote 1 = 10 de `ids` + `mock` (11). Lote 2 = 5 de `conv`, 4 de `rand` y 5 de `calc` (14). Lote 3 = 3 de `gen`, 5 de `data` y 5 de `ref` (13). Total: **38**. Tras el lote 3, el sitio tiene 52 herramientas.

Ningún slug choca con los 14 existentes ni entre sí; todos cumplen `^[a-z0-9]+(-[a-z0-9]+)*$` (comprobado con un script al escribir este spec). Los nombres cortos (sidebar y catálogo) y los títulos SEO van en cada ficha.

### Los 3 lotes

Cada lote tiene su plan (`docs/superpowers/plans/2026-…-herramientas-lote-N.md`), su rama, su fusión en `main` y su despliegue. El orden interno sigue el patrón del Plan B de la plataforma:

1. **Task 0**, sola: los prerrequisitos compartidos del lote (§4), con dependencias, iconos, claves de i18n, helpers de `lib/` y las líneas **pre-sembradas y comentadas** de cada herramienta en `src/tools/registry.ts` y `src/components/ToolIsland.astro`, separadas por líneas en blanco.
2. **Una task por herramienta, en paralelo**, cada una en su worktree y rama (`lote-N/<id>`) desde el commit de la Task 0. Cada task toca solo `src/tools/<id>/` y descomenta sus 4 líneas (import y entrada en `registry.ts`, import y montaje en `ToolIsland.astro`).
3. Fusión de las ramas del lote (como en «Cómo fusionar» del Plan B).
4. **Task de cierre**, sola: compactar `registry.ts` y `ToolIsland.astro`, añadir los e2e del lote (§9), actualizar la lista de herramientas del README y hacer la verificación completa (`pnpm format && pnpm lint && pnpm check && pnpm test && pnpm build && pnpm check:css && pnpm test:e2e`).

| Lote | Contenido | Particularidad |
|---|---|---|
| 1 | `ids` (10) + `mock` | `mock` importa los generadores de las 10 herramientas de `ids`. Se hace **después** de fusionar las 10, como última task antes del cierre. Los contratos de los generadores se fijan en la Task 0 (§4.2) para que las 10 tasks paralelas los respeten |
| 2 | `conv` (5) + `rand` (4) + `calc` (5) | La Task 0 añade la categoría `calc` |
| 3 | `gen` sin mock (3) + `data` (5) + `ref` (5) | La Task 0 instala las 6 librerías (§5) |

## 3. Convenciones

### Heredadas de la plataforma (vinculantes, sin cambios)

- **Contrato `ToolMeta`** (`src/tools/types.ts`), con carpeta autocontenida `src/tools/<id>/`: `meta.ts`, `logic.ts`, `logic.test.ts`, `strings.ts`, `content.es.md`, `content.en.md` y `<Nombre>.svelte`. La herramienta `json` es el patrón de referencia.
- `logic.ts` es **puro**: sin `document`, `window`, `localStorage`, `fetch` ni `crypto` global dentro de las funciones que se testean. El azar y la hora entran como parámetros (`rng`, `now`). Se testea en el entorno `node` de Vitest.
- Textos de la herramienta en su `strings.ts`, con las mismas claves en `es` y `en`. Solo la Task 0 de cada lote añade claves a `src/i18n/*.ts`.
- **Kit de UI** (`src/ui/`): `Button`, `Segmented`, `Field`, `TextArea`, `NumberInput`, `Select`, `Toggle`, `Display`, `Led`, `CopyButton`, `FileDrop` y `persistedInput`. Los campos de una línea son `<input class="control">`, como en Regex, Hash o Timestamp. Antes de escribir el `.svelte`, se abren los componentes reales que se vayan a usar.
- **Los resultados van en `Display`**, la pantalla hundida. Se calculan mientras escribes. El botón primario queda para las acciones que crean algo (Generar, Girar, Lanzar).
- Las herramientas con `meta.tabs` tienen **exactamente un** `Segmented main` con esas etiquetas. Los `Segmented` secundarios no llevan `main`. Cada vista tiene **como mucho un** `CopyButton main`.
- **Sin colores hex** en componentes: todo sale de `src/styles/tokens.css`. Los selectores que dependen del tema usan `:global([data-theme='…'])`. El CSS de un subcomponente que solo se monta en el cliente vive en el padre, bajo `:global` (la nota de `JsonTree.svelte` explica por qué, y `pnpm check:css` lo vigila).
- Objetivos táctiles de 44 px con `@media (pointer: coarse)`. Foco siempre visible. Con `prefers-reduced-motion: reduce` no hay desplazamientos.
- Sentence case en toda la interfaz. **Los errores dicen qué pasa y cómo arreglarlo** ("Letra incorrecta: para 12345678 es Z").
- Estados vacíos con una instrucción concreta, nunca en blanco.
- **Nunca `{@html}`**, con una única excepción: la vista previa de Markdown, y solo con la salida de DOMPurify (§8.4).
- En componentes, ninguna variable se llama `state`. Los estados de tipo unión o nullable se declaran como `$state<T>(…)`.
- `rememberInput: false` → el input vive en un `$state` normal, sin `persistedInput` ni el interruptor «Recordar lo que escribo» (como JWT y Hash). Las herramientas con varios campos siguen el patrón de Diff: un `persistedInput` por campo, con ids `<id>` y `<id>-<campo>`.
- **SEO:** `meta.title` ≤ 65 caracteres; `meta.description` de 51 a 160 caracteres (lo exige `registry.test.ts`); slugs únicos y con palabras clave; `content.<locale>.md` con 2–4 párrafos útiles; `faq` donde aporte (las fichas lo indican).
- Commits, worktrees y `git add` con rutas explícitas, como en las Global Constraints del Plan B.

### Nuevas en este subproyecto

- **Azar:** todo número aleatorio sale de `crypto.getRandomValues` a través de `src/lib/random.ts` (§4.2). Nunca `Math.random`. Con una semilla opcional, el mismo `Rng` se crea de forma determinista.
- **Datos de prueba:** todo lo que genera un documento (DNI, CIF, IBAN, NSS, tarjeta, matrícula) lleva la nota `ui.testOnly` junto al resultado: «Datos ficticios, solo para pruebas.».
- **Números con formato local:** los campos numéricos de los lotes 2 y 3 aceptan coma o punto decimal y separadores de miles, con `parseDecimal` de `src/lib/numbers.ts` (§4.3). Los resultados se formatean con `Intl.NumberFormat(locale)`.
- **Identificadores:** la entrada se normaliza antes de validar: mayúsculas, sin espacios, guiones ni puntos (salvo donde el formato los usa, como la matrícula antigua). El resultado muestra la forma normalizada.
- **Validación con explicación:** cada validador de `ids` devuelve un resultado con tipo (`{ ok: true, … } | { ok: false, reason, expected? }`), no un booleano. La interfaz traduce `reason` a un mensaje que dice qué falla y, si aplica, cuál sería el carácter de control correcto.

## 4. Añadidos compartidos

Todo lo de esta sección lo añade la **Task 0** del lote indicado. Las tasks de herramienta no tocan `src/lib/`, `src/ui/`, `src/i18n/`, `categories.ts`, `types.ts`, `icon-names.ts`, `icons.ts` ni `package.json`. Si una necesita algo compartido que no está aquí, **para y avisa**.

### 4.1 Categoría `calc` (lote 2)

- `CategoryId` gana `'calc'`: `'gen' | 'enc' | 'data' | 'ids' | 'conv' | 'calc' | 'rand' | 'ref'`.
- En `categories.ts` se inserta **entre `conv` y `rand`**, con este contenido:

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

- La sidebar y el catálogo de la Home pasan de 7 a 8 categorías. No hay que tocarlos: se generan desde `categories.ts` y ocultan las vacías.
- Las descripciones del resto de categorías no cambian. La de `ids` ya dice «De momento, formatos de España».

### 4.2 `src/lib/random.ts` (lote 1)

Una sola fuente de azar para todas las herramientas que lo usan. Los generadores reciben un `Rng` como parámetro: así son puros, se testean con semilla y `mock` los reutiliza.

```ts
/** Devuelve un entero uniforme de 32 bits sin signo, en [0, 2^32). */
export type Rng = () => number;

export function cryptoRng(): Rng;                 // crypto.getRandomValues con un búfer de 256 Uint32
export function seededRng(seed: string): Rng;     // FNV-1a de 32 bits sobre el UTF-8 de la semilla → mulberry32
export function rngFromSeed(seed: string | undefined): Rng; // semilla vacía o undefined → cryptoRng()
export function randInt(rng: Rng, min: number, max: number): number; // [min, max], ambos incluidos, sin sesgo
export function pick<T>(rng: Rng, items: readonly T[]): T;
export function shuffle<T>(rng: Rng, items: readonly T[]): T[];      // Fisher–Yates sobre una copia
export function digits(rng: Rng, n: number): string;                 // n cifras 0–9, admite ceros a la izquierda
export function randomBytesFrom(rng: Rng): (n: number) => Uint8Array; // adaptador al RandomBytes de uuid/logic.ts
```

- **Sin sesgo:** `randInt` usa rechazo. Con `range = max − min + 1` (hasta 2^32), `limit = 2^32 − (2^32 mod range)`; se repite `x = rng()` mientras `x ≥ limit` y se devuelve `min + (x mod range)`. Lanza `RangeError` si `max < min` o si `range > 2^32`.
- **FNV-1a:** `h = 0x811c9dc5`; por cada byte, `h ^= b; h = Math.imul(h, 0x01000193) >>> 0`.
- **mulberry32** (estado `a` = hash): `a = (a + 0x6D2B79F5) | 0; t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return (t ^ (t >>> 14)) >>> 0`.
- La semilla es texto libre ("demo", "42"). Se recorta; si queda vacía, no hay semilla.
- **Tests:** la misma semilla produce la misma secuencia y dos semillas distintas no. `randInt` nunca sale del rango y, en 60 000 tiradas de `randInt(0, 5)`, cada valor cae entre 9 000 y 11 000. `shuffle` no muta la entrada.
- `lorem/logic.ts` conserva su `mulberry32`. No se toca una herramienta ya publicada.

**Contrato de los generadores de `ids`, que `mock` importa.** Queda fijado en la Task 0 del lote 1 y cada task de `ids` exporta exactamente estos nombres desde su `logic.ts`:

| Herramienta | Export |
|---|---|
| `dni` | `generateDni(rng: Rng): string` → `12345678Z` · `generateNie(rng: Rng): string` → `X1234567L` |
| `cif` | `generateCif(rng: Rng, type?: CifType): string` → `B12345674` |
| `iban` | `generateSpanishIban(rng: Rng): string` → sin espacios · `formatIban(iban: string): string` → grupos de 4 |
| `plate` | `generatePlate(rng: Rng): string` → `1234 BCD` |
| `nss` | `generateNss(rng: Rng, province?: string): string` → 12 cifras |
| `card` | `generateTestCard(rng: Rng, brand: 'visa' \| 'mastercard' \| 'amex'): string` → sin espacios |
| `phone` | `generatePhone(rng: Rng, kind: 'mobile' \| 'landline'): string` → 9 cifras |
| `postal-code` | `generatePostalCode(rng: Rng, provinceCode: string): string` → 5 cifras |

Cada generador produce siempre un valor que su propio validador acepta. Es un test obligatorio en cada `logic.test.ts`: 1 000 valores con `seededRng('test')`, todos válidos.

### 4.3 Otros helpers de `src/lib/`

**`src/lib/provinces.ts` (lote 1).** Lo usan `postal-code`, `nss`, `plate` (formato antiguo) y `mock`.

```ts
export interface Province {
  code: string;         // '01'…'52', igual en código postal, INE y Seguridad Social
  name: string;         // nombre oficial
  capital: string;      // capital, para mock
  community: string;    // comunidad o ciudad autónoma
  plates: string[];     // siglas de la matrícula provincial (1971–2000)
}
export const PROVINCES: readonly Province[];
export function provinceByCode(code: string): Province | undefined;
export function provinceByPlate(prefix: string): Province | undefined;
```

| Código | Provincia | Capital | Comunidad | Matrícula |
|---|---|---|---|---|
| 01 | Araba/Álava | Vitoria-Gasteiz | País Vasco | VI |
| 02 | Albacete | Albacete | Castilla-La Mancha | AB |
| 03 | Alicante/Alacant | Alicante | Comunitat Valenciana | A |
| 04 | Almería | Almería | Andalucía | AL |
| 05 | Ávila | Ávila | Castilla y León | AV |
| 06 | Badajoz | Badajoz | Extremadura | BA |
| 07 | Illes Balears | Palma | Illes Balears | PM, IB |
| 08 | Barcelona | Barcelona | Cataluña | B |
| 09 | Burgos | Burgos | Castilla y León | BU |
| 10 | Cáceres | Cáceres | Extremadura | CC |
| 11 | Cádiz | Cádiz | Andalucía | CA |
| 12 | Castellón/Castelló | Castellón de la Plana | Comunitat Valenciana | CS |
| 13 | Ciudad Real | Ciudad Real | Castilla-La Mancha | CR |
| 14 | Córdoba | Córdoba | Andalucía | CO |
| 15 | A Coruña | A Coruña | Galicia | C |
| 16 | Cuenca | Cuenca | Castilla-La Mancha | CU |
| 17 | Girona | Girona | Cataluña | GE, GI |
| 18 | Granada | Granada | Andalucía | GR |
| 19 | Guadalajara | Guadalajara | Castilla-La Mancha | GU |
| 20 | Gipuzkoa | Donostia-San Sebastián | País Vasco | SS |
| 21 | Huelva | Huelva | Andalucía | H |
| 22 | Huesca | Huesca | Aragón | HU |
| 23 | Jaén | Jaén | Andalucía | J |
| 24 | León | León | Castilla y León | LE |
| 25 | Lleida | Lleida | Cataluña | L |
| 26 | La Rioja | Logroño | La Rioja | LO |
| 27 | Lugo | Lugo | Galicia | LU |
| 28 | Madrid | Madrid | Comunidad de Madrid | M |
| 29 | Málaga | Málaga | Andalucía | MA |
| 30 | Murcia | Murcia | Región de Murcia | MU |
| 31 | Navarra | Pamplona | Comunidad Foral de Navarra | NA |
| 32 | Ourense | Ourense | Galicia | OR, OU |
| 33 | Asturias | Oviedo | Principado de Asturias | O |
| 34 | Palencia | Palencia | Castilla y León | P |
| 35 | Las Palmas | Las Palmas de Gran Canaria | Canarias | GC |
| 36 | Pontevedra | Pontevedra | Galicia | PO |
| 37 | Salamanca | Salamanca | Castilla y León | SA |
| 38 | Santa Cruz de Tenerife | Santa Cruz de Tenerife | Canarias | TF |
| 39 | Cantabria | Santander | Cantabria | S |
| 40 | Segovia | Segovia | Castilla y León | SG |
| 41 | Sevilla | Sevilla | Andalucía | SE |
| 42 | Soria | Soria | Castilla y León | SO |
| 43 | Tarragona | Tarragona | Cataluña | T |
| 44 | Teruel | Teruel | Aragón | TE |
| 45 | Toledo | Toledo | Castilla-La Mancha | TO |
| 46 | Valencia/València | Valencia | Comunitat Valenciana | V |
| 47 | Valladolid | Valladolid | Castilla y León | VA |
| 48 | Bizkaia | Bilbao | País Vasco | BI |
| 49 | Zamora | Zamora | Castilla y León | ZA |
| 50 | Zaragoza | Zaragoza | Aragón | Z |
| 51 | Ceuta | Ceuta | Ciudad Autónoma de Ceuta | CE |
| 52 | Melilla | Melilla | Ciudad Autónoma de Melilla | ML |

Tests: 52 entradas, códigos únicos y consecutivos, siglas de matrícula únicas.

**`src/lib/csv.ts`.** Lo usan `mock` (lote 1) y `data-convert` (lote 3).

- Lote 1: `toCsv(rows: (string | number | boolean | null)[][], sep: ',' | ';' | '\t' = ','): string`. Sigue RFC 4180: líneas con `\r\n`; se entrecomilla todo campo que contenga el separador, `"`, `\r`, `\n` o espacios al principio o al final; `"` se duplica; `null` es un campo vacío.
- Lote 3 añade `parseCsv(text: string, sep?: ',' | ';' | '\t'): CsvResult`, una máquina de estados escrita a mano:
  - campos entrecomillados que contienen el separador, saltos de línea y `""`;
  - saltos `\r\n`, `\n` o `\r`;
  - quita el BOM inicial e ignora el salto de línea final;
  - sin `sep`, lo detecta contando `,`, `;` y `\t` fuera de comillas en la primera fila (gana el más frecuente, y `,` en caso de empate);
  - una comilla sin cerrar es un error con la línea donde empieza;
  - una fila con distinto número de columnas que la cabecera es un aviso, no un error: «La fila 5 tiene 3 columnas y la cabecera, 4».
  - `CsvResult = { ok: true; rows: string[][]; sep; warnings: string[] } | { ok: false; line: number; reason }`.

**`src/lib/numbers.ts` (lote 2).** Lo usan `units`, `currency`, `px-rem`, `file-size`, `iva`, `irpf`, `percent` y `rule-of-three`.

- `parseDecimal(input: string, locale: Locale): number | null`:
  - quita espacios, incluidos los no separables y los finos;
  - admite `-` inicial y notación `1e3`;
  - si aparecen `.` y `,`, el último que aparece es el decimal y el otro separa miles;
  - si aparece solo un tipo varias veces, separa miles (`1.000.000`);
  - si aparece una sola vez seguido de exactamente 3 cifras y es el separador de miles del locale (`.` en `es`, `,` en `en`), separa miles (`1.234` en `es` = 1234);
  - en cualquier otro caso es decimal (`1,5` y `1.5` = 1,5 en ambos idiomas);
  - devuelve `null` si el resultado no es finito.
- `formatNumber(n: number, locale: Locale, maxFractionDigits = 10): string` usa `Intl.NumberFormat` con agrupación. Si `|n| ≥ 1e15` o `0 < |n| < 1e-6`, usa `notation: 'scientific'`.
- `formatMoney(n: number, locale: Locale, currency = 'EUR'): string` usa `Intl.NumberFormat` con `style: 'currency'`.
- `roundCents(n: number): number` redondea al céntimo, con las mitades hacia fuera del cero: `Math.sign(n) * Math.round(Math.abs(n) * 100 + 1e-7) / 100`. Tests: `1.005 → 1.01`, `2.675 → 2.68`, `0.125 → 0.13`, `-1.005 → -1.01`.

### 4.4 Iconos nuevos

Cada Task 0 añade sus nombres a `ICON_NAMES` (`icon-names.ts`, en orden alfabético) y el import correspondiente de `@lucide/svelte` a `icons.ts`. Se ha comprobado que todos existen en el `@lucide/svelte` instalado.

| Lote | Iconos (`nombre` → componente) |
|---|---|
| 1 | `barcode` Barcode · `building` Building · `car` Car · `credit-card` CreditCard · `database` Database · `globe` Globe · `heart-pulse` HeartPulse · `id-card-lanyard` IdCardLanyard · `landmark` Landmark · `map-pin` MapPin · `phone` Phone |
| 2 | `arrow-down-up` ArrowDownUp (botón Intercambiar) · `calculator` Calculator (categoría) · `calendar-days` CalendarDays · `coins` Coins · `dice-5` Dice5 · `divide` Divide · `ferris-wheel` FerrisWheel · `hard-drive` HardDrive · `lock` Lock · `percent` Percent · `receipt` Receipt · `receipt-text` ReceiptText · `ruler` Ruler · `scaling` Scaling · `shuffle` Shuffle · `users` Users |
| 3 | `calendar-clock` CalendarClock · `file-braces` FileBraces · `file-text` FileText · `git-compare-arrows` GitCompareArrows · `link-2` Link2 · `lock-keyhole` LockKeyhole · `monitor-smartphone` MonitorSmartphone · `network` Network · `qr-code` QrCode · `server` Server · `sheet` Sheet · `tag` Tag |

`terminal` (cURL) ya existe. `dni` usa `id-card-lanyard` para no repetir el `id-card` de su categoría, y `dice` usa `dice-5` para no repetir `dices`.

### 4.5 Claves de interfaz nuevas (`src/i18n/es.ts` y `en.ts`)

Solo las que usan varias herramientas. Todo lo demás va en el `strings.ts` de cada una.

| Lote | Clave | ES | EN |
|---|---|---|---|
| 1 | `ui.seed` | Semilla (opcional) | Seed (optional) |
| 1 | `ui.seedHelp` | Con la misma semilla obtienes siempre el mismo resultado. | The same seed always gives the same result. |
| 1 | `ui.quantity` | Cantidad | Quantity |
| 1 | `ui.testOnly` | Datos ficticios, solo para pruebas. | Fictitious data, for testing only. |
| 2 | `ui.swap` | Intercambiar | Swap |

### 4.6 Kit de UI

**No hay componentes nuevos en el kit.** Lo específico se queda en su herramienta:
- el lienzo de la ruleta vive en `wheel/Wheel.svelte` (§7.6);
- la rejilla de casillas de chmod, en `chmod/Chmod.svelte`;
- las tablas (códigos HTTP, próximas ejecuciones de cron, rutas de JSON) usan `.display-kv` y `.display-rows` o un `<table>` con estilos de la propia herramienta, como hace Regex.

Si dos herramientas del mismo lote acaban necesitando el mismo componente, se anota como deuda para un lote posterior. No se añade a mitad de lote.

### 4.7 Dependencias (lote 3) y Netlify

- La Task 0 del lote 3 instala las dependencias de la §5 con versión fijada. Las tasks de herramienta no tocan `package.json` ni `pnpm-lock.yaml`.
- **Restricción global para el plan del lote 3**, del mismo tipo que la de TypeScript `^6`: `pnpm add ua-parser-js@^1.0.41`, **nunca** `pnpm add ua-parser-js` sin versión, porque instala la 2.x (AGPL-3.0).
- **Netlify:** no hace falta ninguna cabecera nueva. No hay CSP. Si algún día se añade una, necesitará `connect-src https://api.frankfurter.dev` (divisas) e `img-src data: blob:` (QR). Queda anotado en la §10.

## 5. Librerías

Criterio: se usa una librería cuando el problema tiene muchos casos que otros ya han resuelto y mantienen (codificación QR, YAML 1.2, Markdown GFM, saneado de HTML, la base de datos de User-Agents y la semántica de rangos de npm). Lo simple se escribe a mano, con tests. Cada librería se importa **solo** desde la herramienta que la usa. Las que son pesadas se importan en el `.svelte` o en funciones de `logic.ts` que solo llama esa herramienta, para que Vite las deje en el chunk de su página.

| Librería | Versión | Licencia | Herramienta | Por qué |
|---|---|---|---|---|
| `qrcode-generator` | ^2.0.4 | MIT | `qr` | Codificar QR (versiones 1–40, Reed-Solomon, máscaras) a mano no compensa. No tiene dependencias y trae tipos. Solo se usa su matriz (`getModuleCount`, `isDark`): el SVG y el PNG los pintamos nosotros |
| `yaml` | ^2.9.1 | ISC | `data-convert` | YAML 1.2 completo (anclas, bloques, multilínea), con errores que dan línea y columna. Trae tipos |
| `marked` | ^18.0.14 | MIT | `markdown` | Markdown GFM (tablas, listas de tareas, código). Rápido y con tipos |
| `dompurify` | ^3.4.16 | MPL-2.0 OR Apache-2.0: **se usa bajo Apache-2.0** | `markdown` | Sanea el HTML antes del único `{@html}` del sitio. Es la referencia para esto: no se escribe a mano |
| `ua-parser-js` | ^1.0.41 (**nunca 2.x**) | MIT (la 2.x es AGPL-3.0) | `user-agent` | Base de expresiones de navegadores, motores, sistemas y dispositivos que se actualiza a menudo |
| `@types/ua-parser-js` | ^0.7.39 (dev) | MIT | `user-agent` | La 1.x no trae tipos |
| `semver` | ^7.8.5 | ISC | `semver` | Es la implementación de npm: `^`, `~`, rangos con guion, `x`, `||` y las reglas de prerelease. Reescribirla daría resultados distintos de los de npm. Se importan solo las funciones usadas (`semver/functions/…`, `semver/ranges/…`) |
| `@types/semver` | ^7 (dev) | MIT | `semver` | Tipos |

**Escritos a mano, con tests:** todos los dígitos de control, festivos y Pascua, el parser de CSV, el parser de cron y el cálculo de ejecuciones, el parser de cURL, la query string, el diff de JSON, el slug, las contraseñas, las unidades, CIDR, chmod, los datos de mock y la tabla de códigos HTTP.

**Descartadas:**
- `@faker-js/faker`: pesa mucho y no genera documentos españoles coherentes.
- `cron-parser`: depende de `luxon`, y ya tenemos la conversión hora local → UTC segura ante cambios de hora (`timestamp/logic.ts`).
- `cronstrue`: su texto no encaja con nuestros mensajes de error y habría que cargar sus locales.
- `qrcode`: trae dependencias pensadas para Node (`pngjs`, `yargs`).
- `ibantools`: solo necesitamos mod 97 y la tabla de longitudes. Su tabla sí se usó para comprobar la nuestra (§6.3).

## 6. Lote 1: Identificadores y datos de prueba

Todas las herramientas de `ids` comparten estas reglas:
- aceptan la entrada con espacios, guiones o puntos y en minúsculas, y la normalizan;
- en la pestaña Validar muestran un `Led` (válido o no válido) con la razón, y un `Display kv` con el desglose;
- en la pestaña Generar tienen `ui.quantity` (1–500, 10 por defecto), `ui.seed`, un botón primario «Generar», un `Display` de lista con copiar por fila, un `CopyButton main` que copia todo (una línea por valor) y la nota `ui.testOnly`;
- donde tiene sentido, Validar admite **varios valores, uno por línea** (hasta 1 000), y entonces muestra una fila por valor con su LED y un recuento («48 válidos · 2 no válidos»).

### 6.1 `dni`: DNI y NIE

- **Nombre:** DNI y NIE / DNI & NIE.
- **Título SEO:** «Validador y generador de DNI y NIE online» / «Spanish DNI and NIE validator and generator».
- **Pestañas:** Validar · Generar · Calcular letra.
- **Algoritmo:**
  - **DNI:** 8 cifras + letra de control. La letra es `TRWAGMYFPDXBNJZSQVHLCKE[n mod 23]`, donde `n` es el número de 8 cifras. Con menos de 8 cifras se rellena con ceros a la izquierda (`1234567L` → `01234567L`), y el resultado lo dice.
  - **NIE:** `X`, `Y` o `Z` + 7 cifras + letra. La letra inicial se sustituye por `X→0`, `Y→1`, `Z→2`, y se aplica la misma fórmula al número de 8 cifras resultante.
  - Ejemplos comprobados: `12345678Z` (12345678 mod 23 = 14 → Z), `00000000T`, `X1234567L`, `Y1234567X`, `Z1234567R`.
- **Validar:** detecta si es DNI o NIE. Errores:
  - «Letra incorrecta: para 12345678 es Z.»
  - «La letra Ñ no se usa en el DNI. Las posibles son T, R, W, A, G, M, Y, F, P, D, X, B, N, J, Z, S, Q, V, H, L, C, K y E.» Sale con I, Ñ, O y U.
  - «Faltan cifras: un DNI tiene 8 cifras y una letra.»
  - «Un NIE empieza por X, Y o Z.»
- **Generar:** tipo DNI, NIE o ambos (Segmented secundario) y el toggle «Con guion» (`12345678-Z`). El NIE reparte X, Y y Z por igual.
- **Calcular letra:** 8 cifras, o X/Y/Z + 7, y da la letra en grande en `Display` (variante `value`).
- **Recordar:** ✗. Un DNI es un dato personal: no se guarda en el navegador.
- **Casos límite:**
  - `00000000T` es válido matemáticamente y se acepta;
  - un NIE con 8 cifras (`X12345678L`) → «Un NIE tiene 7 cifras tras la letra inicial»;
  - los NIF que empiezan por K, L o M se remiten al validador de CIF (§6.2).
- **FAQ:** «¿Estos DNI existen?», «¿Por qué el DNI no lleva Ñ, I, O ni U?».

### 6.2 `cif`: CIF / NIF de entidades

- **Nombre:** CIF / CIF (Spanish company tax ID).
- **Título SEO:** «Validador y generador de CIF (NIF de empresa) online» / «Spanish CIF validator and generator (company tax ID)».
- **Pestañas:** Validar · Generar.
- **Formato:** letra de tipo de entidad + 7 cifras + control (una cifra o una letra). Tipos:

| Letra | Entidad (ES) | Control |
|---|---|---|
| A | Sociedad anónima | cifra |
| B | Sociedad de responsabilidad limitada | cifra |
| C | Sociedad colectiva | cifra o letra |
| D | Sociedad comanditaria | cifra o letra |
| E | Comunidad de bienes | cifra |
| F | Sociedad cooperativa | cifra o letra |
| G | Asociación o fundación | cifra o letra |
| H | Comunidad de propietarios | cifra |
| J | Sociedad civil | cifra o letra |
| N | Entidad extranjera | letra |
| P | Corporación local | letra |
| Q | Organismo público | letra |
| R | Congregación o institución religiosa | cifra o letra |
| S | Órgano de la Administración del Estado o autonómica | letra |
| U | Unión temporal de empresas | cifra o letra |
| V | Otros tipos | cifra o letra |
| W | Establecimiento permanente de entidad no residente | letra |

  Solo se es estricto donde las fuentes coinciden: A, B, E y H llevan cifra; N, P, Q, S y W llevan letra. El resto acepta las dos formas. El generador siempre emite la forma canónica: letra para N, P, Q, R, S y W, y cifra para el resto.

- **Algoritmo** (cifras `d1…d7`):
  1. `A = d2 + d4 + d6`.
  2. `B` = para `d1`, `d3`, `d5` y `d7`: se multiplica por 2 y se suman las cifras del resultado (`7×2 = 14 → 1+4 = 5`); luego se suman los cuatro valores.
  3. `e = (10 − (A + B) mod 10) mod 10`.
  4. El control numérico es `e`. El control con letra es `JABCDEFGHI[e]`.
  - Ejemplos comprobados: `A58818501`, `B65410011`, `Q2826000H` (e = 8 → H), `P0800000B`, `S2800568D`, `B84948736`.
- **K, L y M (decisión de este spec):** son NIF de personas físicas sin DNI (K: menores de 14 años; L: españoles residentes en el extranjero; M: extranjeros sin NIE). Se validan con la tabla del DNI sobre las 7 cifras (`TRWAGMYFPDXBNJZSQVHLCKE[n mod 23]`) y se etiquetan «NIF especial de persona física». No se generan.
- **Validar:** muestra el tipo de entidad, el control esperado en sus dos formas y la forma aceptada. Errores:
  - «El control no cuadra: para B6541001 debería ser 1.»
  - «Una entidad de tipo P lleva letra de control: sería A.»
  - «La letra I no corresponde a ningún tipo de entidad.»
- **Generar:** `Select` con el tipo de entidad («Cualquiera» por defecto, que reparte A y B al 50 % porque son los más habituales), cantidad y semilla.
- **Recordar:** ✓. El CIF de una empresa es público (aparece en todas sus facturas). Un `shouldSave` no guarda la entrada si alguna línea es un NIF K, L o M, que son de personas físicas (el mismo patrón que la URL con contraseña en `url`).
- **Casos límite:** las 7 cifras a cero dan e = 0, así que `B00000000` es válido matemáticamente y `B0000000J` no (B lleva cifra). Un CIF de 8 caracteres → «Falta el carácter de control».

### 6.3 `iban`: IBAN y CCC

- **Nombre:** IBAN / IBAN.
- **Título SEO:** «Validador de IBAN y generador de IBAN español» / «IBAN validator and Spanish IBAN generator».
- **Pestañas:** Validar · Generar.
- **Validar IBAN (cualquier país), en orden, parando en el primer fallo:**
  1. Se normaliza: quita espacios y el prefijo `IBAN` y pasa a mayúsculas.
  2. Las 2 primeras letras deben ser un país de la tabla → si no, «XX no usa IBAN o no está en el registro de IBAN».
  3. La longitud debe ser la del país → «Un IBAN de España tiene 24 caracteres y este tiene 23».
  4. Solo se admiten `A–Z0-9`.
  5. Los dígitos de control (posiciones 3–4) van de 02 a 98.
  6. **mod 97:** se mueven los 4 primeros caracteres al final y cada letra se sustituye por dos cifras (`A=10, B=11 … Z=35`). El número resultante mod 97 debe ser 1. Se calcula cifra a cifra, `r = (r × 10 + d) mod 97`, para no desbordar.
- **España, además:** el BBAN (20 cifras) es un CCC: entidad (4), oficina (4), DC (2) y cuenta (10). Se validan sus dígitos de control con pesos `1, 2, 4, 8, 5, 10, 9, 7, 3, 6`:
  - `DC1` se calcula sobre `"00" + entidad + oficina` (10 cifras);
  - `DC2` se calcula sobre la cuenta (10 cifras);
  - para cada uno, `s = Σ cifra_i × peso_i` y `d = 11 − (s mod 11)`; si `d = 11`, es 0; si `d = 10`, es 1.
  - Si el IBAN cuadra pero el CCC no: «El IBAN es coherente, pero los dígitos de control de la cuenta no: deberían ser 45».
- **CCC suelto:** si la entrada son 20 cifras, se valida como CCC y se muestra su IBAN.
- **Generar un IBAN de un BBAN:** `control = 98 − mod97(BBAN + país en cifras + "00")`, con 2 cifras.
  - Comprobado: `ES91 2100 0418 4502 0005 1332` (CCC `2100 0418 45 0200051332`, DC 45), `GB82 WEST 1234 5698 7654 32`, `DE89 3704 0044 0532 0130 00`, `NL91 ABNA 0417 1643 00`, `FR14 2004 1010 0505 0001 3M02 606`, `NO93 8601 1117 947` y `BE68 5390 0754 7034`.
- **Salida de Validar:**
  - IBAN en grupos de 4 (`formatIban`) y el nombre del país (`Intl.DisplayNames(locale, { type: 'region' })`);
  - para España: entidad, oficina, DC y cuenta;
  - para el resto: el BBAN.
  - No se busca el nombre del banco (fuera de alcance).
- **Generar (solo España):** la entidad sale de una lista de códigos reales frecuentes (`2100`, `0049`, `0182`, `0081`, `2085`, `0128`, `1465`, `0073`), y la oficina y la cuenta son aleatorias. Se calculan los DC y el IBAN. Cada fila muestra el IBAN y, al lado, su CCC (`2100 0418 45 0200051332`), cada uno con su botón de copiar. El toggle «Agrupar de 4 en 4» controla el formato.
- **Tabla de longitudes** (102 países):
  - los 89 del registro IBAN de SWIFT;
  - los 12 territorios franceses que usan IBAN propio con el formato de FR (BL, GF, GP, MF, MQ, NC, PF, PM, RE, TF, WF, YT);
  - AX (Åland, formato de FI).
  - Se cotejó con `ibantools` 4.5.4: 0 diferencias. Los países con IBAN «experimental» fuera del registro SWIFT (AO, BF, BJ, CF, CG, CI, CM, CV, DZ, GA, GQ, GW, IR, KM, MA, MG, ML, MZ, NE, SN, TD, TG) no se incluyen.

  AD 24 · AE 23 · AL 28 · AT 20 · AX 18 · AZ 28 · BA 20 · BE 16 · BG 22 · BH 22 · BI 27 · BL 27 · BR 29 · BY 28 · CH 21 · CR 22 · CY 28 · CZ 24 · DE 22 · DJ 27 · DK 18 · DO 28 · EE 20 · EG 29 · ES 24 · FI 18 · FK 18 · FO 18 · FR 27 · GB 22 · GE 22 · GF 27 · GI 23 · GL 18 · GP 27 · GR 27 · GT 28 · HN 28 · HR 21 · HU 28 · IE 22 · IL 23 · IQ 23 · IS 26 · IT 27 · JO 30 · KW 30 · KZ 20 · LB 28 · LC 32 · LI 21 · LT 20 · LU 20 · LV 21 · LY 25 · MC 27 · MD 24 · ME 22 · MF 27 · MK 19 · MN 20 · MQ 27 · MR 27 · MT 31 · MU 30 · NC 27 · NI 28 · NL 18 · NO 15 · OM 23 · PF 27 · PK 24 · PL 28 · PM 27 · PS 29 · PT 25 · QA 29 · RE 27 · RO 24 · RS 22 · RU 33 · SA 24 · SC 31 · SD 18 · SE 24 · SI 19 · SK 24 · SM 27 · SO 23 · ST 25 · SV 28 · TF 27 · TL 23 · TN 24 · TR 26 · UA 29 · VA 22 · VG 24 · WF 27 · XK 20 · YE 30 · YT 27

- **Recordar:** ✗. Un número de cuenta es un dato personal y financiero.
- **Casos límite:**
  - control `00`, `01` o `99` → error aunque el mod 97 cuadre;
  - minúsculas y espacios en cualquier posición se aceptan;
  - un IBAN de otro país con letras en el BBAN (GB, NL) se valida sin problema;
  - 34 caracteres (el máximo) → sin desbordamiento, gracias al cálculo cifra a cifra.
- **FAQ:** «¿Qué diferencia hay entre IBAN y CCC?», «¿Un IBAN válido significa que la cuenta existe?».

### 6.4 `plate`: Matrículas

- **Nombre:** Matrículas / License plates.
- **Título SEO:** «Validador y generador de matrículas españolas» / «Spanish license plate validator and generator».
- **Pestañas:** Validar · Generar.
- **Formato actual (desde el 2000):** 4 cifras + 3 letras del alfabeto `BCDFGHJKLMNPRSTVWXYZ`. Son 20 consonantes: ni vocales, ni Ñ, ni Q. La entrada admite espacio o guion (`1234 BCD`, `1234-BCD`, `1234BCD`) y la salida normalizada es `1234 BCD`.
  - La **posición en la serie** es `((i1 × 20 + i2) × 20 + i3) × 10 000 + número`, donde `i` es el índice de cada letra en el alfabeto. Así se ve qué matrícula es posterior: «posición 12 345 678 de 80 000 000». No se estima el año (fuera de alcance).
  - «La letra A no se usa en las matrículas actuales: solo consonantes, sin Ñ ni Q.»
- **Formato provincial antiguo (1971–2000):** `SIGLAS-NNNN-L` o `SIGLAS-NNNN-LL`:
  - las siglas son las de la tabla de provincias (§4.3), de 1 o 2 letras;
  - luego vienen 4 cifras y 1 o 2 letras de la A a la Z, sin Ñ ni Q;
  - la salida normalizada es `M-1234-AB` y muestra la provincia;
  - «XX no es la sigla de ninguna provincia.»
  - No se comprueba si esa serie llegó a emitirse.
- **Detección:** si empieza por cifra, es actual; si empieza por letra, antigua.
- **Generar:** Segmented secundario Actual · Antigua, cantidad y semilla. La antigua elige una provincia al azar (y una de sus siglas si tiene dos), 4 cifras y 1 o 2 letras al 50 %.
- **Recordar:** ✓. Una matrícula está a la vista en la vía pública y no es un secreto.
- **Casos límite:** `0000 BBB` es válida (la primera de la serie). Quedan fuera de alcance, y un mensaje lo dice, las matrículas de ciclomotor (`C 1234 BCD`), históricas, temporales, diplomáticas y del formato anterior a 1971 (`M-123456`).

### 6.5 `nss`: Número de la Seguridad Social

- **Nombre:** Nº Seguridad Social / Social Security number.
- **Título SEO:** «Validador y generador de número de la Seguridad Social» / «Spanish Social Security number (NSS) validator».
- **Pestañas:** Validar · Generar.
- **Formato:** 12 cifras = provincia `a` (2) + número `b` (8) + control `c` (2). Se aceptan separadores (`28/12345678/40`, `28 12345678 40`).
- **Algoritmo:** la fórmula tiene **dos ramas**. La del brief (`a × 10^8 + b`) es solo la segunda. Coinciden en ella la documentación de Intervia, el foro de Forosdelweb y Box4Dev:
  - si `b < 10 000 000`: `d = b + a × 10 000 000`;
  - si no: `d = a × 100 000 000 + b` (equivale a concatenar `a` y `b`);
  - `c = d mod 97`, con 2 cifras.
  - Todo cabe en un `Number` (`d < 10^10`).
  - Ejemplo publicado: `28 12345678 40`. Ejemplo de la primera rama, calculado con la fórmula (no hay uno publicado): `08 01234567 74`. Si se aplicara `a × 10^8 + b`, daría 17: el test lo deja fijado.
- **Validar:** muestra la provincia (de `provinces.ts`). Un código fuera de 01–52 da un aviso, no un error: «Provincia no reconocida (66). El número puede ser válido igualmente.». Si falla el control: «El control no cuadra: debería ser 40.».
- **Generar:** `Select` de provincia («Cualquiera» por defecto), cantidad y semilla. `b` es aleatorio en 0–99 999 999 (con relleno a 8 cifras), así que salen las dos ramas.
- **Recordar:** ✗. Es un identificador personal.
- **Casos límite:**
  - `b = 9 999 999` y `b = 10 000 000` (el borde entre ramas), con un test para cada uno;
  - 11 cifras → «Faltan cifras: son 12 (2 de provincia, 8 de número y 2 de control)»;
  - el código de cuenta de cotización de empresas (11 cifras) queda fuera de alcance.

### 6.6 `card`: Tarjetas de prueba

- **Nombre:** Tarjetas de prueba / Test cards.
- **Título SEO:** «Números de tarjeta de prueba y validador Luhn» / «Test credit card numbers and Luhn validator».
- **Pestañas:** Validar · Generar.
- **Luhn:** se recorre de derecha a izquierda y se duplica una cifra de cada dos, empezando por la segunda desde la derecha; si el doble pasa de 9, se le resta 9. Todo se suma y es válido si la suma mod 10 = 0. Para generar, se calcula sobre el cuerpo + `0` y el control es `(10 − suma mod 10) mod 10`.
  - Comprobados: `4111111111111111`, `4242424242424242`, `5555555555554444`, `2223003122003222`, `378282246310005` y `371449635398431`. `4111111111111112` falla.
- **Detección de marca** (la primera regla que coincide; entre paréntesis, las longitudes habituales):

| Marca | Prefijos | Longitud |
|---|---|---|
| American Express | 34, 37 | 15 |
| Visa | 4 | 13, 16, 19 |
| Mastercard | 51–55, 2221–2720 | 16 |
| Discover | 6011, 622126–622925, 644–649, 65 | 16–19 |
| UnionPay | 62 (resto) | 16–19 |
| JCB | 3528–3589 | 16–19 |
| Diners Club | 300–305, 36, 38, 39 | 14–19 |
| Maestro | 5018, 5020, 5038, 5893, 6304, 6759, 6761, 6762, 6763 | 12–19 |

  Con una longitud poco habitual para su marca, sale un aviso: «Visa con 17 cifras: longitud poco habitual».
- **Validar:** entre 12 y 19 cifras, con espacios o guiones. Muestra el LED de Luhn, la marca y el número agrupado (4-4-4-4, o 4-6-5 en Amex).
- **Generar:**
  - marca Visa (16), Mastercard (16; la mitad con 51–55 y la otra mitad con 2221–2720) o American Express (15);
  - el cuerpo es aleatorio y el último dígito es el de Luhn;
  - el toggle «Añadir caducidad y CVV» añade una fecha `MM/AA` entre 1 y 5 años desde `now` y un CVV de 3 cifras (4 en Amex).
  - Debajo va una lista fija de los números de prueba documentados por Stripe para su modo de pruebas (Visa `4242…4242`, Mastercard `5555…4444`, Amex `3782…0005`).
- **Aviso fijo y visible** (además de `ui.testOnly`): «No son tarjetas reales ni sirven para pagar. Úsalas solo en entornos de prueba.».
- **Recordar:** ✗. Parece un dato de pago, aunque sea de prueba: no se guarda nunca.
- **Casos límite:** 11 o 20 cifras → error de longitud; letras → «Solo cifras, espacios o guiones».

### 6.7 `phone`: Teléfonos de España

- **Nombre:** Teléfonos ES / Spanish phone numbers.
- **Título SEO:** «Validador de teléfonos de España y formato E.164» / «Spanish phone number validator and E.164 formatter».
- **Sin pestañas.** Un campo que acepta varias líneas (una por número).
- **Normalización:**
  - quita espacios, puntos, guiones y paréntesis;
  - quita el prefijo `+34` o `0034`, o `34` si quedan 11 cifras;
  - con otro prefijo internacional: «Solo números de España (+34)».
- **Clasificación** del número nacional de 9 cifras. Se evalúa en este orden:

| Patrón | Tipo |
|---|---|
| `6\d{8}` o `7[1-4]\d{7}` | Móvil |
| `70\d{7}` | Número personal |
| `800\d{6}`, `900\d{6}` | Gratuito |
| `901\d{6}`, `902\d{6}` | Tarifa especial |
| `803\d{6}`, `806\d{6}`, `807\d{6}`, `905\d{6}` | Tarificación adicional |
| `8[1-8]\d{7}`, `9[1-8]\d{7}` | Fijo |
| `51\d{7}` | Red corporativa |

  - Lo que no encaja da: «No es un número de España válido: tiene 9 cifras y empieza por 6, 7, 8 o 9».
  - Los números cortos de 3 a 6 cifras (`112`, `016`, `010`…) → «Es un número corto: no tiene formato E.164».
- **Salida:** tipo, E.164 (`+34612345678`), nacional (`612 34 56 78`), internacional (`+34 612 34 56 78`) y un enlace `tel:`.
- **`generatePhone(rng, kind)`** (para mock; no tiene pestaña):
  - móvil: 80 % `6` + 8 cifras y 20 % `7[1-4]` + 7 cifras;
  - fijo: `9[1-8]` + 7 cifras.
- **Recordar:** ✗. Los teléfonos son datos personales.
- **Casos límite:** `+34 912 345 678`, `0034912345678` y `(91) 234-56-78` dan el mismo resultado. `34612345678` → móvil. `612 34 56 7` → faltan cifras.

### 6.8 `bic`: SWIFT / BIC

- **Nombre:** SWIFT / BIC / SWIFT / BIC.
- **Título SEO:** «Validador de códigos SWIFT / BIC online» / «SWIFT / BIC code validator».
- **Sin pestañas.**
- **Formato:** `^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$` = banco (4 letras) + país (2) + localidad (2) + sucursal opcional (3). Tiene 8 u 11 caracteres.
- **País:** debe estar en ISO 3166-1 alfa-2 más XK (Kosovo). Es una lista fija en `logic.ts`, de 250 códigos. No se usa `Intl.DisplayNames` para validar, porque acepta códigos retirados (`AN`, `YU`…). Solo se usa para mostrar el nombre:

  AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW

- **Salida:** banco, país (código y nombre), localidad, sucursal («Oficina principal» si falta o es `XXX`), y las formas de 8 y de 11 caracteres. Si el segundo carácter de la localidad es `0`: «BIC de pruebas (no operativo)».
- **Recordar:** ✓. Los BIC son códigos públicos de bancos.
- **Casos límite:**
  - 9 o 10 caracteres → «Un BIC tiene 8 u 11 caracteres»;
  - `CAIXESBBXXX` y `CAIXESBB` → válidos y equivalentes;
  - país `XX` → «XX no es un código de país ISO 3166».
  - No se busca el nombre del banco.

### 6.9 `ean-isbn`: EAN-13 e ISBN

- **Nombre:** EAN e ISBN / EAN & ISBN.
- **Título SEO:** «Validador de EAN-13 e ISBN y conversor ISBN-10 ↔ 13» / «EAN-13 and ISBN validator, ISBN-10 to ISBN-13».
- **Sin pestañas.** Detecta el formato por la longitud, tras quitar espacios y guiones:
  - 13 cifras → EAN-13 (y además ISBN-13 si empieza por 978 o 979);
  - 12 cifras → EAN-13 sin control: lo calcula («Falta el dígito de control: sería 1»);
  - 10 caracteres `\d{9}[\dX]` → ISBN-10;
  - 9 cifras → ISBN-10 sin control: lo calcula;
  - 8 cifras → «EAN-8 no está incluido»;
  - cualquier otra longitud → error con las longitudes admitidas.
- **EAN-13 / ISBN-13:** `s = Σ_{i=1..12} d_i × w_i`, con `w_i = 1` si `i` es impar y 3 si es par (contando desde la izquierda). El control es `(10 − s mod 10) mod 10`.
- **ISBN-10:** `s = Σ_{i=1..9} d_i × (11 − i)` (pesos de 10 a 2). El control es `(11 − s mod 11) mod 11`, y 10 se escribe `X`. La `X` solo vale en la última posición.
- **Conversión:**
  - 10 → 13: `978` + las 9 primeras cifras + control EAN;
  - 13 → 10: solo con el prefijo 978; se toman las cifras 4–12 y se calcula el control ISBN-10;
  - con 979: «Los ISBN que empiezan por 979 no tienen equivalente de 10 cifras».
  - Comprobados: `4006381333931`, `9780306406157 ↔ 0306406152`, `080442957X`.
- **Prefijo GS1** (informativo; solo estos): `84` España · `978`/`979` libros (ISBN; `9790`, música, ISMN) · `977` publicaciones periódicas (ISSN) · `20`–`29` uso interno de tienda.
- **Recordar:** ✓. Son códigos de producto públicos.
- **Casos límite:** `X` en medio → error; `x` minúscula → se acepta. El guionado de ISBN por grupos queda fuera de alcance (necesita la tabla de rangos de la Agencia ISBN).

### 6.10 `postal-code`: Código postal → provincia

- **Nombre:** Código postal / Postal codes.
- **Título SEO:** «Código postal a provincia: busca la provincia de un CP» / «Spanish postal code to province lookup».
- **Sin pestañas.** Un campo multilínea (un CP por línea) y un `Select` de provincia para la búsqueda inversa.
- **Lógica:**
  - 5 cifras; las 2 primeras (01–52) son el código de provincia de `provinces.ts`. Muestra la provincia, la comunidad y la capital.
  - Con 4 cifras, añade el 0 inicial y lo dice («Añadido el 0 inicial: 08001»), porque es el error típico de las hojas de cálculo.
  - Con los prefijos `00` o `53`–`99`: «Ningún código postal empieza por 53: los prefijos van de 01 a 52».
- **Inversa:** provincia → «Los códigos postales de Madrid van de 28000 a 28999».
- **`generatePostalCode(rng, provinceCode)`** (para mock): `provinceCode + '0' + dos cifras 01–09`, el patrón de los códigos de las capitales. Solo se garantiza la coherencia con la provincia, no que ese código exacto exista.
- **Recordar:** ✓. Un código postal suelto no es un dato sensible.
- **Casos límite:** el municipio exacto necesitaría los datos de Correos y queda fuera de alcance. El contenido SEO lo explica.

### 6.11 `mock`: Generador de datos de prueba

- **Nombre:** Datos de prueba / Mock data.
- **Título SEO:** «Generador de datos de prueba: JSON, CSV y SQL» / «Mock data generator: JSON, CSV and SQL».
- **Sin pestañas.** Tiene tres bloques: campos, opciones y salida.
- **Campos.** Cada fila lleva una casilla para incluirla, el nombre de columna editable (con un valor por defecto), sus parámetros y los botones subir y bajar (sin arrastrar):

| Campo | Columna ES / EN | Genera (modo España) | Import |
|---|---|---|---|
| Nombre | `nombre` / `first_name` | Nombre de una lista de 50 femeninos y 50 masculinos frecuentes | — |
| Apellidos | `apellidos` / `last_names` | Dos apellidos de una lista de 100 frecuentes | — |
| Email | `email` / `email` | Derivado del nombre (§ coherencia) | — |
| Teléfono | `telefono` / `phone` | Móvil de 9 cifras | `phone/logic` `generatePhone` |
| Fecha de nacimiento | `fecha_nacimiento` / `birth_date` | `YYYY-MM-DD`, con 18–80 años en `now` | — |
| DNI | `dni` / `dni` | | `dni/logic` `generateDni` |
| NIE | `nie` / `nie` | | `dni/logic` `generateNie` |
| Dirección | `direccion` / `street` | «Calle Mayor, 12»: tipo de vía + nombre de una lista de 40 + número 1–150 | — |
| Código postal | `codigo_postal` / `postal_code` | Coherente con la provincia | `postal-code/logic` `generatePostalCode` |
| Provincia | `provincia` / `province` | `provinces.ts` | — |
| Ciudad | `ciudad` / `city` | La capital de la provincia de la fila | — |
| Empresa | `empresa` / `company` | Raíz (apellido o una de 20 palabras) + `S.L.` o `S.A.` | — |
| CIF | `cif` / `cif` | Tipo B si la empresa es S.L. y A si es S.A. | `cif/logic` `generateCif` |
| IBAN | `iban` / `iban` | IBAN español sin espacios | `iban/logic` `generateSpanishIban` |
| Tarjeta de prueba | `tarjeta` / `card` | Visa, Mastercard o Amex al azar | `card/logic` `generateTestCard` |
| Matrícula | `matricula` / `plate` | Formato actual | `plate/logic` `generatePlate` |
| UUID | `id` / `id` | UUID v4 | `uuid/logic` `uuidV4` + `randomBytesFrom(rng)` |
| Número | `numero` / `number` | Entre mín. y máx., con 0–4 decimales | — |
| Booleano | `activo` / `active` | `true` con probabilidad p (50 % por defecto) | — |
| Fecha | `fecha` / `date` | Entre dos fechas, `YYYY-MM-DD` | — |
| Lista propia | `valor` / `value` | Uno de los valores escritos (uno por línea o separados por comas) | — |

  Selección por defecto: nombre, apellidos, email, teléfono, DNI y ciudad. Se puede añadir más de un campo Número, Fecha o Lista propia.

- **Coherencia dentro de cada fila:**
  - email = `nombre.apellido1` (o variantes: inicial + apellido, o nombre + apellido + 2 cifras), sin tildes (NFD y fuera `\p{M}`), en minúsculas y solo `[a-z0-9.]`, `@` uno de `example.com`, `example.org` o `example.net`. Son dominios reservados (RFC 2606): nunca apuntan a un buzón real. Si un email se repite en el conjunto, se le añade un número;
  - provincia, código postal y ciudad salen de la misma entrada de `PROVINCES`;
  - la letra del DNI o el NIE es correcta por construcción;
  - el CIF concuerda con la forma jurídica de la empresa.
- **Reproducibilidad:**
  - cada fila genera **siempre el registro completo** en un orden fijo de campos y después se queda con las columnas elegidas, así que quitar o reordenar columnas no cambia los valores de las demás;
  - con semilla, el resultado es idéntico entre sesiones y navegadores;
  - sin semilla, se usa una semilla aleatoria de sesión que solo cambia al pulsar «Generar» (el patrón de Lorem): la salida se recalcula al cambiar la configuración sin cambiar de datos.
- **Opciones:** filas 1–1000 (100 por defecto), `ui.seed`, formato (Segmented secundario JSON · CSV · SQL), el nombre de la tabla (solo en SQL, `usuarios` por defecto) y el toggle «Datos internacionales».
- **Modo internacional:**
  - nombres, apellidos (uno solo), calles («123 Oak Street») y ciudades salen de listas genéricas en inglés (50 + 50 nombres, 100 apellidos, 30 calles y 30 ciudades);
  - el código postal son 5 cifras aleatorias;
  - el teléfono es `+1 202 555 01XX` (el rango 555-0100–0199 está reservado para ficción);
  - la empresa lleva `Ltd`, `Inc` o `LLC`;
  - **DNI, NIE, CIF, IBAN, matrícula y provincia se desactivan**: siguen en la lista atenuados, con la nota «Solo con datos de España», y no salen en la salida. Al volver al modo España recuperan su estado.
- **Salida:**
  - **JSON:** array de objetos con sangría de 2. Número y Booleano son de tipo número y booleano; todo lo demás es texto (el código postal y el teléfono también, para conservar los ceros).
  - **CSV:** `toCsv` con una fila de cabecera.
  - **SQL:** una sentencia por fila: `INSERT INTO "usuarios" ("nombre", "edad") VALUES ('Ana', 34);`.
    - La tabla debe cumplir `^[A-Za-z_][A-Za-z0-9_]{0,62}$`. Si no: «El nombre de la tabla solo admite letras sin tilde, números y _, y no puede empezar por un número».
    - Las columnas van entre comillas dobles, con `"` duplicada.
    - Los textos van entre comillas simples, con `'` duplicada.
    - Los números van sin comillas; los booleanos, como `TRUE` o `FALSE`; las fechas, como texto `'YYYY-MM-DD'`; un valor vacío, como `NULL`.
  - El `Display` muestra las 20 primeras filas y «… y 980 filas más». `CopyButton main` y «Descargar» (`datos.json`, `datos.csv`, `datos.sql`) llevan **todo**.
- **Errores:**
  - dos columnas con el mismo nombre → «Hay dos columnas llamadas "email": cambia una»;
  - nombre de columna vacío;
  - Número con mín. > máx.;
  - Lista propia vacía.
- **Recordar:** ✓. Se guarda la configuración (campos, nombres, parámetros, filas, formato, tabla, semilla y modo) como JSON en `input.mock`. No contiene datos personales: los datos generados son ficticios y se recalculan.
- **Rendimiento:** 1000 filas con todos los campos en menos de 100 ms. Lo cubre un test de `logic.test.ts` con un umbral holgado de 500 ms.
- **Casos límite:**
  - 1 fila y 1000 filas;
  - todas las columnas desactivadas → «Elige al menos un campo»;
  - un apellido con Ñ o tilde → email en ASCII (`ibanez`, `munoz`);
  - un valor con `'` en SQL (`O'Brien` en internacional) → `'O''Brien'`.

## 7. Lote 2: conversores, azar y calculadoras

Los importes y cantidades se leen con `parseDecimal` y se muestran con `formatNumber` o `formatMoney` (§4.3). Un campo con texto que no es un número se marca con `invalid` y el mensaje «Escribe un número, por ejemplo 1234,5».

### 7.1 `units`: Unidades

- **Nombre:** Unidades / Units.
- **Título SEO:** «Conversor de unidades: longitud, peso, temperatura y más» / «Unit converter: length, weight, temperature and more».
- **Pestañas:** Longitud · Masa · Temperatura · Volumen · Área · Velocidad · Datos.
- **Interfaz:** un valor y un `Select` con la unidad de origen. El `Display` es una lista con el valor en **todas** las unidades de la pestaña, cada una con su botón de copiar. No hace falta intercambiar.
- **Factores** (a la unidad base de cada pestaña; todos son exactos por definición):

| Pestaña (base) | Unidades y factor |
|---|---|
| Longitud (m) | µm 1e-6 · mm 0,001 · cm 0,01 · m 1 · km 1000 · in 0,0254 · ft 0,3048 · yd 0,9144 · mi 1609,344 · milla náutica 1852 |
| Masa (kg) | mg 1e-6 · g 0,001 · kg 1 · t 1000 · oz 0,028349523125 · lb 0,45359237 · st 6,35029318 |
| Volumen (l) | ml 0,001 · cm³ 0,001 · cl 0,01 · dl 0,1 · l 1 · m³ 1000 · cucharadita US 0,00492892159375 · cucharada US 0,01478676478125 · fl oz US 0,0295735295625 · taza US 0,2365882365 · pinta US 0,473176473 · cuarto US 0,946352946 · galón US 3,785411784 · fl oz UK 0,0284130625 · pinta UK 0,56826125 · galón UK 4,54609 |
| Área (m²) | mm² 1e-6 · cm² 1e-4 · m² 1 · ha 1e4 · km² 1e6 · in² 0,00064516 · ft² 0,09290304 · yd² 0,83612736 · acre 4046,8564224 · mi² 2589988,110336 |
| Velocidad (m/s) | m/s 1 · km/h 1/3,6 · mph 0,44704 · nudo 1852/3600 · ft/s 0,3048 |
| Datos (bit) | bit 1 · kbit 1e3 · Mbit 1e6 · Gbit 1e9 · B 8 · kB 8e3 · MB 8e6 · GB 8e9 · TB 8e12 · KiB 8×2^10 · MiB 8×2^20 · GiB 8×2^30 · TiB 8×2^40 |

- **Temperatura** (afín, no por factor): °C, °F y K. `K = C + 273,15`; `F = C × 9/5 + 32`; `C = (F − 32) × 5/9`. Por debajo del cero absoluto: «Está por debajo del cero absoluto (−273,15 °C)».
- **Precisión:** `valor × factor_origen / factor_destino`, y después `Number(x.toPrecision(12))` para quitar el ruido de coma flotante (`0,1 + 0,2`). Se formatea con `formatNumber`.
- **Recordar:** ✓. Se guardan el valor y la unidad de cada pestaña.
- **Casos límite:** 0 y negativos (negativos solo en temperatura; en el resto, «Una longitud no puede ser negativa»); valores enormes → notación científica.

### 7.2 `currency`: Divisas

- **Nombre:** Divisas / Currency.
- **Título SEO:** «Conversor de divisas con tipos de cambio del BCE» / «Currency converter with ECB exchange rates».
- **Sin pestañas.** Importe, divisa de origen, botón `ui.swap` e icono `arrow-down-up`, y divisa de destino. Nombres de divisa con `Intl.DisplayNames(locale, { type: 'currency' })`.
- **Fuente:** `GET https://api.frankfurter.dev/v1/latest`, **sin parámetros**. Devuelve la tabla completa con base EUR (unas 30 divisas del BCE) y la conversión se hace en el navegador. Así ni el importe ni el par elegido salen del equipo.
  - **Cambio sobre el brief:** el brief decía `https://api.frankfurter.app/latest`. Esa URL responde `301` hacia `api.frankfurter.dev/v1/latest` **sin** `Access-Control-Allow-Origin`, así que un `fetch` desde el navegador fallaría en la redirección (comprobado con `curl -I` el 2026-09-26). El destino sí envía `access-control-allow-origin: *` y `cache-control: public, max-age=86400`.
  - Opciones de `fetch`: `{ credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(8000) }`.
- **Validación de la respuesta** (`parseRatesResponse(json): Rates | null` en `logic.ts`): `base === 'EUR'`, `date` con formato `YYYY-MM-DD` y `rates` como objeto de números finitos y positivos. Se añade `EUR: 1`. Cualquier otra cosa se trata como error.
- **Caché** (a través de `lib/storage`): `writeJSON('currency.rates', { date, rates, fetchedAt })`.
  - Al montar, se leen y se muestran los tipos guardados al instante.
  - Se descarga de nuevo si no hay caché o si `now − fetchedAt > 6 h`. El BCE publica una vez por día hábil, hacia las 16:00 (hora de Madrid).
  - `isStale(fetchedAt, now)` es pura y se testea.
- **Estados** (LED + texto):
  - al día (`ok`): «Tipos del BCE del 25/09/2026»;
  - sin conexión con caché (`idle`): «Sin conexión: se usan los tipos guardados del 25/09/2026»;
  - sin conexión y sin caché (`bad`): «No se han podido descargar los tipos de cambio y no hay ninguno guardado. Comprueba la conexión y pulsa Reintentar.», con un botón «Reintentar».
- **Conversión** (`convert(amount, from, to, rates)`): `amount / rates[from] × rates[to]`. Se muestra con `formatMoney` en la divisa de destino (JPY sin decimales, según `Intl`). Debajo va el tipo unitario en los dos sentidos, con 6 cifras significativas («1 USD = 0,853 EUR»), y un `Display` de lista con el importe en todas las divisas.
- **Nota visible y fija:** «Los tipos son de referencia, públicos, del Banco Central Europeo, y se descargan de api.frankfurter.dev. La herramienta no envía ningún dato tuyo: el importe y las divisas se calculan en tu navegador.». Los tipos de referencia no son los de un banco o una tarjeta: el contenido SEO lo explica.
- **«0 B enviados» sigue siendo cierto.** La petición no lleva datos del usuario: ni en la URL (no hay parámetros), ni en el cuerpo (es un GET), ni en cabeceras propias, ni en cookies (`credentials: 'omit'`), ni en el Referer (`no-referrer`). Es una descarga de datos públicos, igual que la de una fuente o un script. El LCD de la Home no cambia.
- **Recordar:** ✓. Se guardan el importe y el par de divisas.
- **Casos límite:**
  - misma divisa en origen y destino → el mismo importe;
  - importe vacío → 1;
  - una divisa guardada que ya no viene en la respuesta → se cambia a EUR con un aviso;
  - respuesta con un formato inesperado → se trata como sin conexión.

### 7.3 `px-rem`: px ↔ rem/em

- **Nombre:** px a rem / px to rem.
- **Título SEO:** «Conversor de px a rem y em con base configurable» / «PX to REM and EM converter with custom base size».
- **Sin pestañas.** Hay cuatro campos sincronizados, como en Colores: tamaño base (16 px por defecto), px, rem y em, con el tamaño del padre para em (por defecto, igual que la base). Editar cualquiera recalcula los demás.
- **Fórmulas:** `rem = px / base`; `em = px / padre`; `px = rem × base = em × padre`. Se redondea a 4 decimales, sin ceros finales.
- **Formato: siempre con punto decimal, en los dos idiomas.** Son valores de CSS, así que los campos y la tabla muestran `1.5` y no `1,5`, y el fragmento copiado es CSS válido. Excepción a la regla de `formatNumber` del lote: aquí se usa `String(Number(x.toFixed(4)))`. Los campos aceptan coma al escribir (`parseDecimal`).
- **Extras:**
  - el fragmento CSS `font-size: 1.5rem; /* 24px */` con su copiar;
  - una tabla de tamaños comunes (10, 12, 14, 16, 18, 20, 24, 32, 40, 48 y 64 px) con su valor en rem para la base actual.
- **Recordar:** ✓. Se guardan la base y el padre.
- **Casos límite:** base o padre ≤ 0 → «El tamaño base debe ser mayor que 0»; valores decimales (`0.875rem`) sin problema.

### 7.4 `chmod`: Permisos Unix

- **Nombre:** chmod / chmod.
- **Título SEO:** «Calculadora chmod: permisos octales y simbólicos» / «Chmod calculator: octal and symbolic permissions».
- **Sin pestañas.** Hay tres representaciones sincronizadas:
  - **octal:** 3 o 4 cifras 0–7 (`755`, `0755`, `4755`);
  - **simbólico:** 9 caracteres `rwxr-xr-x`, o 10 con el tipo delante al estilo `ls -l` (`-rwxr-xr-x`, `drwxr-xr-x`);
  - **casillas:** una rejilla de 3×3 (propietario, grupo y otros × lectura, escritura y ejecución) más setuid, setgid y sticky. Son `<input type="checkbox">` nativos con 44 px en táctil. La rejilla y su CSS viven en la herramienta.
- **Reglas:**
  - cifra = `r·4 + w·2 + x·1`; cifra especial = `setuid·4 + setgid·2 + sticky·1`;
  - en simbólico, la posición x del propietario es `s` (x y setuid), `S` (setuid sin x) o `x`/`-`. Lo mismo para el grupo con setgid, y para otros con sticky (`t`/`T`).
- **Salida:**
  - `chmod 755 archivo`;
  - `chmod u=rwx,g=rx,o=rx archivo` (un grupo sin permisos queda `o=`);
  - la forma `ls` y una frase («El propietario puede leer, escribir y ejecutar; el grupo y los demás, leer y ejecutar»).
  - Hay botones rápidos para 644, 755, 600, 700 y 777. Con 777, o con escritura para otros, sale un aviso: «Cualquier usuario podrá modificar el archivo».
- **Recordar:** ✓. Se guarda el valor octal.
- **Casos límite:**
  - `8` o `9` → «8 no es una cifra octal: cada cifra va de 0 a 7»;
  - 5 cifras → error;
  - un simbólico con un carácter en una posición imposible (`rwxrwxrwz`) → error que señala la posición.

### 7.5 `file-size`: Tamaños de archivo

- **Nombre:** Tamaños de archivo / File sizes.
- **Título SEO:** «Conversor de tamaños: KB, MB, GB y KiB, MiB, GiB» / «File size converter: KB, MB, GB vs KiB, MiB, GiB».
- **Sin pestañas.** Un campo de texto libre: `1.5 GB`, `1,5 GiB`, `750 MB`, `1024` (sin unidad, son bytes) o `100 Mb`.
- **Unidades:** `B`, `kB`/`KB`, `MB`, `GB`, `TB`, `PB` (SI, ×1000); `KiB`, `MiB`, `GiB`, `TiB`, `PiB` (IEC, ×1024); `b`, `kb`/`Kb`, `Mb`, `Gb` (bits).
  - `B` mayúscula es byte y `b` minúscula es bit.
  - `KB` se lee como kB (SI), con una nota: «Windows escribe KB, MB y GB, pero calcula en KiB, MiB y GiB».
- **Salida:** dos columnas en `Display`, SI e IEC, con todas las unidades; los bytes exactos y los bits; y la «forma legible» en cada sistema (`1,5 GB` → `1,4 GiB`). Debajo, la explicación: un disco de 1 TB muestra unos 931 GiB (931 «GB» en Windows).
- **Recordar:** ✓. Se guarda el texto introducido.
- **Casos límite:**
  - negativos → error;
  - fracciones de byte (`0,5 B`) → «Menos de un byte: son 4 bits»;
  - por encima de 2^53 bytes (unos 9 PB), un aviso de precisión aproximada.

### 7.6 `wheel`: Ruleta

- **Nombre:** Ruleta / Spin the wheel.
- **Título SEO:** «Ruleta aleatoria online para sorteos y decisiones» / «Spin the wheel: random name picker».
- **Sin pestañas.** Opciones en un `TextArea` (una por línea, de 2 a 100; las vacías se ignoran; se admiten repetidas), la ruleta y el botón primario «Girar».
- **Lienzo** (en `Wheel.svelte`, sin componente del kit):
  - `<canvas>` cuadrado de `min(400px, 100%)`, escalado por `devicePixelRatio`, con `aria-hidden="true"`: el resultado accesible va en `Display` con `role="status"` («Ha salido: Ana»);
  - los colores se leen de las variables CSS con `getComputedStyle(document.documentElement)` **cada vez que se pinta**: sectores alternos con `--raised`, `--well` y `--surface`, texto con `--text`, borde con `--border` y el puntero (un triángulo arriba) y el sector ganador con `--accent`. No hay ningún hex;
  - se repinta al cambiar `data-theme` (un `MutationObserver` sobre `<html>`) y al cambiar de tamaño (un `ResizeObserver`); los dos se desconectan en el retorno del `$effect`;
  - las etiquetas se recortan con puntos suspensivos para que quepan en su sector.
- **Geometría** (en `logic.ts`, pura):
  - `s = 2π / n`. El sector `i` ocupa los ángulos locales `[i·s, (i+1)·s)`. El puntero está en `−π/2` (arriba);
  - `segmentAt(θ, n) = floor(((−π/2 − θ) mod 2π) / s)`, con el módulo normalizado a `[0, 2π)`.
- **Giro:**
  1. Se elige el ganador **antes** de animar: `i = randInt(cryptoRng(), 0, n − 1)`.
  2. Se elige un desfase `u` uniforme en `[−0,35·s, 0,35·s]` y de 5 a 7 vueltas.
  3. `θ* = θ + vueltas·2π + ((−π/2 − (i + 0,5)·s − u − θ) mod 2π)`.
  - Test: `segmentAt(θ*, n) === i` para 10 000 giros con semilla.
- **Física de muelle:** `θ'' = −k(θ − θ*) − c·θ'`, con `k = 3 s⁻²` y `c = 3,2 s⁻¹` (amortiguamiento ζ ≈ 0,92: sobrepasa menos del 0,1 %, así que nunca cambia de sector).
  - Euler semi-implícito con pasos fijos de 1/120 s, acumulados desde `requestAnimationFrame`.
  - Termina cuando `|θ − θ*| < 0,001` y `|θ'| < 0,01`, o a los 8 s, y entonces se ajusta a `θ*`.
  - `stepSpring(state, target, dt)` es pura. Tests: converge, sobrepasa menos del 1 % de la distancia y termina antes de 8 s simulados.
  - Es la **única animación larga** del sitio.
- **Movimiento reducido** (`matchMedia('(prefers-reduced-motion: reduce)')`): no hay giro. La ruleta aparece directamente en `θ*` y el resultado se anuncia al momento.
- **Durante el giro:** «Girar» y el `TextArea` quedan desactivados.
- **Opciones:** el toggle «Quitar la opción ganadora» (la borra del `TextArea` al terminar) y un historial de los 10 últimos resultados.
- **Semilla:** no tiene (decisión de este spec). La gracia de la ruleta es que sea imprevisible. Para sorteos reproducibles están Mezclar y Equipos.
- **Recordar:** ✓. Se guarda la lista de opciones.
- **Casos límite:**
  - 1 opción → «Añade al menos dos opciones»;
  - 100 opciones → las etiquetas se ocultan si el sector mide menos de 10 px de alto, y la lista sigue siendo la fuente accesible;
  - cambiar de página a mitad de giro cancela el `requestAnimationFrame` en el `onDestroy`.

### 7.7 `shuffle`: Mezclar lista

- **Nombre:** Mezclar lista / Shuffle list.
- **Título SEO:** «Mezclar una lista al azar: ordenar aleatoriamente» / «Random list shuffler: randomize any list».
- **Sin pestañas.** Tiene un `TextArea` (un elemento por línea), el toggle «Ignorar líneas vacías» (activado), «Quedarse con los primeros» (opcional, de 1 a N), `ui.seed` y el botón primario «Mezclar».
- **Lógica:** `shuffle(rng, items)` de `lib/random.ts` (Fisher–Yates uniforme).
  - Con semilla, el resultado se calcula en vivo y es determinista.
  - Sin semilla, cada «Mezclar» usa `cryptoRng()`.
- **Salida:** lista numerada en `Display` y `CopyButton main` (una línea por elemento, sin números).
- **Recordar:** ✓. Se guardan la lista y la semilla.
- **Casos límite:** 0 o 1 elementos → «Añade al menos dos elementos»; elementos repetidos → se conservan.

### 7.8 `teams`: Equipos

- **Nombre:** Equipos / Teams.
- **Título SEO:** «Generador de equipos aleatorios y sorteo de grupos» / «Random team generator: split a list into groups».
- **Sin pestañas.** Tiene los participantes (uno por línea), un Segmented secundario «Número de equipos · Personas por equipo», N, `ui.seed` y el botón primario «Hacer equipos».
- **Algoritmo:**
  1. Se mezcla con `shuffle(rng, …)`.
  2. `k` = N (número de equipos) o `ceil(total / N)` (personas por equipo).
  3. Se reparten por turnos en `k` equipos.
  - Los tamaños difieren como mucho en 1. Con 10 personas y 3 por equipo salen 4 equipos de 3, 3, 2 y 2, no 3, 3, 3 y 1. La interfaz lo explica.
- **Salida:** un bloque por equipo («Equipo 1», editable como prefijo) y un `CopyButton main` que copia «Equipo 1: Ana, Luis, …» por línea.
- **Recordar:** ✓. Se guardan los participantes, el modo y N.
- **Casos límite:** más equipos que personas → «Hay 5 personas y 6 equipos: baja el número de equipos»; N = 1 → un solo equipo mezclado.

### 7.9 `dice`: Dados y moneda

- **Nombre:** Dados y moneda / Dice & coin.
- **Título SEO:** «Lanzar dados online (3d6, d20) y cara o cruz» / «Online dice roller (3d6, d20) and coin flip».
- **Pestañas:** Dados · Moneda.
- **Dados:**
  - notación `NdM`, `NdM+K` o `NdM-K`, y `dM` como `1dM`; sin distinguir mayúsculas y con espacios permitidos;
  - rangos: N de 1 a 100, M de 2 a 1000, K de −1000 a 1000;
  - botones rápidos d4, d6, d8, d10, d12, d20 y d100 (ponen `1dM`), y el botón primario «Lanzar».
  - La salida muestra cada dado, la suma, el modificador y el total en grande (`Display value`), además del mínimo y el máximo posibles.
- **Moneda:** de 1 a 100 monedas. Muestra cada resultado (Cara/Cruz, Heads/Tails) y el recuento.
- **Semilla:** opcional. Con semilla, el `Rng` se crea una vez y cada lanzamiento sigue la misma secuencia, así que la serie de tiradas es reproducible. Sin semilla, `cryptoRng()`.
- **Historial:** las 10 últimas tiradas.
- **Recordar:** ✓. Se guardan la notación y el número de monedas.
- **Casos límite:**
  - `0d6`, `1d1`, `101d6` o `1d1001` → error con el rango;
  - un texto que no se entiende → «Escribe los dados como 3d6, 2d20+1 o d100»;
  - no hay animación más allá de la del LED del kit.

### 7.10 `iva`: IVA

- **Nombre:** IVA / Spanish VAT.
- **Título SEO:** «Calculadora de IVA: sumar y quitar el IVA (21, 10, 4 %)» / «Spanish VAT (IVA) calculator: add or remove VAT».
- **Sin pestañas.** Tiene el importe, un Segmented secundario «El importe es: Base imponible · Total con IVA» y el tipo (Segmented 21 % · 10 % · 4 % · Otro; «Otro» abre un campo de 0 a 100 con decimales, útil para el IGIC canario).
- **Fórmulas** (en céntimos con `roundCents`):
  - base → total: `cuota = roundCents(base × t / 100)`; `total = base + cuota`;
  - total → base: `base = roundCents(total / (1 + t / 100))`; `cuota = roundCents(total − base)`. Así base + cuota = total exacto.
- **Salida:** `Display kv` con base imponible, IVA (21 %) y total, en `formatMoney`. Debajo, la misma base con los tres tipos para comparar, y la línea lista para copiar «Base 100,00 € + IVA 21 % 21,00 € = 121,00 €».
- **Recordar:** ✓. Se guardan el importe, el sentido y el tipo.
- **Casos límite:**
  - `0` → todo a cero;
  - negativos (abonos) → se admiten, con redondeo simétrico;
  - `121` total al 21 % → base 100,00 y cuota 21,00; `100` total al 21 % → base 82,64 y cuota 17,36.
  - El recargo de equivalencia y el IPSI quedan fuera de alcance.

### 7.11 `irpf`: Retención de IRPF en facturas

- **Nombre:** Retención IRPF / IRPF withholding.
- **Título SEO:** «Calculadora de retención de IRPF para facturas» / «Spanish IRPF withholding calculator for invoices».
- **Sin pestañas.** Tiene el importe, un Segmented secundario «El importe es: Base imponible · Líquido a cobrar», el IRPF (Select 15 % general · 7 % inicio de actividad · 19 % alquileres y capital · Otro) y el IVA (21 %, 10 %, 4 % o 0 % exento).
- **Fórmulas:**
  - desde la base: `iva = roundCents(base × i)`; `irpf = roundCents(base × r)`; `líquido = base + iva − irpf`;
  - desde el líquido: `B0 = roundCents(líquido / (1 + i − r))`. Como IVA e IRPF se redondean por separado, cada céntimo de base mueve el líquido 0, 1 o 2 céntimos, y hay líquidos que **ninguna** base alcanza (con 21 % y 15 %, alrededor del 16 %; por ejemplo, 1,03 €). Por eso se prueban las bases de `B0 − 0,02` a `B0 + 0,02`: si alguna da el líquido exacto, se usa; si no, se usa la más cercana (en empate, la menor: con 1,03 €, las bases 0,96 y 0,98 dan 1,02 y 1,04, y gana 0,96) y se avisa: «Ninguna base da exactamente 1,03 €; la más cercana da 1,02 €». La búsqueda es finita (5 candidatas). Hay un test con 1,03 € al 21 % / 15 %.
  - Ejemplo: base 1000 €, IVA 21 %, IRPF 15 % → 1000 + 210 − 150 = **1060 €**.
- **Salida:** el desglose de la factura (base, + IVA, − retención IRPF y total a cobrar) y una nota: «La retención la ingresa tu cliente en Hacienda a cuenta de tu IRPF».
- **Aviso fijo:** «Cálculo orientativo; no es asesoramiento fiscal. Comprueba el tipo que te corresponde.».
- **Recordar:** ✓. Se guardan el importe, el sentido y los tipos.
- **Casos límite:** IRPF de 0 % (sin retención) y IVA de 0 % (exento), por separado y juntos; un líquido de 0.

### 7.12 `percent`: Porcentajes

- **Nombre:** Porcentajes / Percentages.
- **Título SEO:** «Calculadora de porcentajes: % de un número y variación» / «Percentage calculator: percent of, ratio and change».
- **Pestañas:** X % de Y · Qué % es · Variación.
  - **X % de Y:** `X / 100 × Y`. También muestra `Y + X %` y `Y − X %` (descuentos y recargos).
  - **Qué % es X de Y:** `X / Y × 100`. Si `Y = 0`: «No se puede dividir entre 0: Y debe ser distinto de 0».
  - **Variación de A a B:** `(B − A) / |A| × 100`, con la palabra «aumento» o «disminución». Si `A = 0`: «No hay variación porcentual desde 0».
- **Salida:** `Display value` con hasta 4 decimales y la frase completa («21 % de 200 es 42»).
- **Recordar:** ✓. Se guardan los valores de cada pestaña.

### 7.13 `rule-of-three`: Regla de tres

- **Nombre:** Regla de tres / Rule of three.
- **Título SEO:** «Calculadora de regla de tres directa e inversa» / «Rule of three calculator: direct and inverse».
- **Pestañas:** Directa · Inversa.
  - Se presenta como «Si A → B, entonces C → X».
  - Directa: `X = B × C / A`. Inversa: `X = A × B / C`.
  - La salida muestra la fórmula con los valores sustituidos.
- **Errores:** A = 0 (directa) o C = 0 (inversa) → «A no puede ser 0: no se puede dividir entre 0».
- **Recordar:** ✓. Se guardan A, B y C.
- **Ejemplos para los tests:** directa 2 → 10, 5 → 25; inversa: 4 personas tardan 6 días, 8 personas → 3.

### 7.14 `workdays`: Días entre fechas y días hábiles

- **Nombre:** Días hábiles / Business days.
- **Título SEO:** «Calculadora de días hábiles y días entre fechas» / «Spanish business days calculator between two dates».
- **Sin pestañas.** Tiene fecha de inicio, fecha de fin (`<input type="date">`) y el toggle «Incluir el día final» (activado por defecto).
- **Intervalo:** con el toggle activado es `[inicio, fin]`; desactivado, `[inicio, fin)`. **El mismo conjunto de días sirve para todos los recuentos.** Si fin < inicio, se intercambian y se avisa.
- **Aritmética:** todo con días UTC (`Date.UTC(y, m − 1, d) / 86 400 000`) para que los cambios de hora no quiten ni añadan un día. El día de la semana es `((díaUTC + 4) % 7 + 7) % 7` (o `getUTCDay()`), con 0 = domingo: el 1970-01-01 fue jueves, y la doble operación evita los restos negativos de JS antes de 1970. Test: el 1900-01-01 fue lunes.
- **Salida:**
  - días naturales, y en semanas y días;
  - días laborables (de lunes a viernes);
  - **días hábiles** (de lunes a viernes, sin festivos nacionales);
  - días de fin de semana;
  - la lista de festivos nacionales del rango con su nombre, marcando los que caen en fin de semana («cae en domingo: no resta»).
- **Festivos nacionales, calculados (sin fichero de datos):**
  - fijos: 1 ene (Año Nuevo), 6 ene (Epifanía), 1 may (Fiesta del Trabajo), 15 ago (Asunción), 12 oct (Fiesta Nacional), 1 nov (Todos los Santos), 6 dic (Constitución), 8 dic (Inmaculada Concepción) y 25 dic (Navidad);
  - móvil: **Viernes Santo** = domingo de Pascua − 2 días.
  - Pascua con el algoritmo gregoriano anónimo (Meeus/Jones/Butcher), con división entera:
    ```
    a = y mod 19;  b = y div 100;  c = y mod 100;  d = b div 4;  e = b mod 4
    f = (b + 8) div 25;  g = (b − f + 1) div 3;  h = (19a + b − d − g + 15) mod 30
    i = c div 4;  k = c mod 4;  l = (32 + 2e + 2i − h − k) mod 7;  m = (a + 11h + 22l) div 451
    mes = (h + l − 7m + 114) div 31;  día = ((h + l − 7m + 114) mod 31) + 1
    ```
  - Comprobado: Pascua 2024-03-31, 2025-04-20, 2026-04-05, 2027-03-28, 2038-04-25 y 2285-03-22; Viernes Santo 2026 = 2026-04-03. Del 2026-01-01 al 2026-01-31 (incluido) hay **20** días hábiles; en abril de 2026, **21**; en todo 2026, **254**.
- **Nota visible y fija:** «Solo festivos nacionales comunes a toda España. No incluye festivos autonómicos ni locales (como Jueves Santo o San José), ni los traslados que hacen las comunidades cuando un festivo cae en domingo.».
- **Recordar:** ✓. Se guardan las dos fechas y el toggle.
- **Casos límite:**
  - el mismo día al inicio y al fin → 1 día (incluido) o 0 (sin incluir);
  - un rango que cruza el cambio de hora de marzo u octubre → ni un día de más ni de menos (test);
  - años fuera de 1900–2100 → «Elige fechas entre 1900 y 2100»;
  - un rango de más de 100 años → error.
- **FAQ:** «¿Cuenta los festivos de mi comunidad?», «¿El sábado es día hábil?» (explica que aquí no, y que en plazos administrativos, desde la Ley 39/2015, tampoco).

## 8. Lote 3: generadores, texto y datos, y referencia

### 8.1 `password`: Contraseñas

- **Nombre:** Contraseñas / Passwords.
- **Título SEO:** «Generador de contraseñas seguras con entropía» / «Strong password generator with entropy meter».
- **Sin pestañas.**
- **Opciones:**
  - longitud de 4 a 128 (20 por defecto) y cantidad de 1 a 50 (1 por defecto);
  - toggles de minúsculas `a–z`, mayúsculas `A–Z`, números `0–9` y símbolos (los 32 ASCII imprimibles ``!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~``);
  - toggle «Excluir caracteres ambiguos», que quita `0 O o 1 l I |`.
- **Algoritmo:**
  `generatePassword(rng, opciones)` en `logic.ts`:
  1. Se toma un carácter de cada conjunto activo con `pick(rng, …)`.
  2. Se rellena hasta la longitud con el conjunto unión.
  3. Se mezcla con `shuffle(rng, …)`.
  - La interfaz siempre pasa `cryptoRng()`: aquí **no hay semilla**, porque una contraseña reproducible no es segura. `seededRng` solo se usa en los tests.
  - Se genera al cargar y al cambiar una opción, y el botón primario «Generar» da otra.
- **Entropía:** `E = L × log2(|conjunto|)` bits, con una línea que explica que la regla de «uno de cada tipo» la reduce muy poco. LED + texto:
  - `E < 50`: `bad`, «Débil»;
  - `50 ≤ E < 80`: `idle`, «Aceptable»;
  - `E ≥ 80`: `ok`, «Fuerte».
  - Ejemplo: 20 caracteres de los 94 → 131,1 bits.
- **Recordar:** ✗. Las contraseñas no se guardan nunca, ni en el navegador. Las **opciones**, que no son secretas, se guardan en `password.options` con `writeJSON` (decisión de este spec).
- **Casos límite:**
  - ningún conjunto activo → «Elige al menos un tipo de carácter»;
  - longitud menor que el número de conjuntos → «Con 4 tipos de carácter, la longitud mínima es 4».
  - Tests con `seededRng`: siempre hay al menos un carácter de cada conjunto y ningún ambiguo si están excluidos.

### 8.2 `qr`: Código QR

- **Nombre:** Código QR / QR code.
- **Título SEO:** «Generador de códigos QR: texto, URL y WiFi (PNG y SVG)» / «QR code generator: text, URL and WiFi (PNG, SVG)».
- **Pestañas:** Texto · URL · WiFi.
  - **Texto:** un `TextArea`.
  - **URL:** un campo. Sin esquema, se antepone `https://` y se avisa. Se valida con `new URL()`.
  - **WiFi:** SSID, contraseña, cifrado (WPA/WPA2/WPA3 → `WPA`, `WEP` o «Sin contraseña» → `nopass`) y el toggle «Red oculta». El contenido es `WIFI:T:<tipo>;S:<ssid>;P:<contraseña>;H:true;;`: `H` solo si está oculta y `P` se omite con `nopass`. En `S` y `P` se escapan con `\` los caracteres `\ ; , : "`.
- **Opciones:** corrección de errores (`Select`: L, M, Q o H; M por defecto) y tamaño del PNG (256, 512 o 1024 px).
- **Librería:** `qrcode-generator`, con `qrcode(0, ecl)` (versión automática). **Codificación:** la conversión por defecto de la librería se queda con el byte bajo de cada unidad UTF-16 (comprobado en `dist/qrcode.mjs`), lo que rompería la ñ y los emojis. Por eso se pasa una cadena binaria con el UTF-8: `addData(String.fromCharCode(...utf8(texto)), 'Byte')`, con `utf8` de `lib/bytes.ts`. Test: la matriz de `ñ` es la misma que la de `'\xC3\xB1'`.
- **Pintado** (`logic.ts`):
  - `qrMatrix(text, ecl): boolean[][]`;
  - `toSvg(matrix, margin = 4)`: un `<svg>` con `viewBox`, `shape-rendering="crispEdges"`, un `<rect>` de fondo con `fill="white"` y un único `<path>` con `fill="black"`. En el canvas del PNG, `fillStyle = 'white'` y `'black'`. Son palabras clave de color, no hex: un lector de QR necesita oscuro sobre claro en cualquier tema.
  - Vista previa: ese SVG como `<img src="data:image/svg+xml,…" alt="Código QR de: …">` **dentro de `Display`**, con su margen blanco propio.
  - PNG: un `<canvas>` fuera del DOM, `cellSize = floor(tamaño / (N + 8))`, `toBlob` y `downloadBlob(blob, 'qr.png')`. SVG: `downloadBlob(svg, 'qr.svg', 'image/svg+xml')`.
- **Capacidad:** cuando el contenido no cabe, la librería lanza un error. Se captura y se dice: «El texto no cabe en un QR con corrección M (máximo 2331 bytes; tiene 2400). Acórtalo o baja la corrección a L.». Máximos en bytes: L 2953, M 2331, Q 1663, H 1273.
- **Recordar:** ✓ para Texto, URL y SSID. **La contraseña WiFi no se guarda nunca**: vive en un `$state` normal.
- **Casos límite:** vacío → estado vacío sin QR; SSID con `;` → escapado (test); emojis → UTF-8 correcto.

### 8.3 `slug`: Slugs

- **Nombre:** Slug / Slug.
- **Título SEO:** «Generador de slugs para URL: quita tildes y espacios» / «URL slug generator: remove accents and spaces».
- **Sin pestañas.** Un `TextArea`: cada línea da un slug.
- **Algoritmo:**
  1. Mapa previo: `ß→ss`, `æ/Æ→ae`, `œ/Œ→oe`, `ø/Ø→o`, `ł/Ł→l`, `đ/Đ→d`, `ð→d`, `þ→th`. El toggle «& como y/and» (activado) convierte `&` en ` y ` (es) o ` and ` (en).
  2. `normalize('NFKD')` y se quitan las marcas `\p{M}`, así que ñ → n y á → a.
  3. Minúsculas si está activo el toggle «Minúsculas» (activado por defecto).
  4. Cada tramo de caracteres fuera de `[A-Za-z0-9]` se sustituye por el separador.
  5. Se quitan los separadores de los extremos.
  6. Si se fija una longitud máxima, se corta en el último separador antes del límite, sin partir palabras (salvo que la primera palabra ya lo supere).
- **Separador:** Segmented secundario `-` · `_` · `.`.
- **Tests:**
  - «¡Hola, Mundo! Año 2026» → `hola-mundo-ano-2026`;
  - «Straße & Co» → `strasse-y-co`;
  - «Ærøskøbing» → `aeroskobing`;
  - los emojis desaparecen;
  - «東京» → vacío, con el mensaje «No queda ningún carácter latino: el slug estaría vacío».
- **Recordar:** ✓.

### 8.4 `data-convert`: JSON ↔ YAML ↔ CSV

- **Nombre:** JSON, YAML y CSV / JSON, YAML & CSV.
- **Título SEO:** «Conversor JSON ↔ YAML ↔ CSV online» / «JSON to YAML and CSV converter (and back)».
- **Sin pestañas.** Formato de entrada (`Select`: Automático, JSON, YAML o CSV) y de salida (Segmented secundario JSON · YAML · CSV).
- **Detección automática**, en orden:
  1. empieza por `{` o `[` y `JSON.parse` funciona → JSON;
  2. la primera línea tiene `,`, `;` o tabulador y al menos dos filas tienen el mismo número de campos → CSV;
  3. si no, YAML.
  - Se muestra lo detectado: «Detectado: CSV (separador ;)».
- **Lectura:**
  - **JSON:** `parseJson` de `json/logic.ts` (errores con línea y columna).
  - **YAML:** `parseAllDocuments` de `yaml`. Con un documento, su valor; con varios (`---`), un array y una nota. Los errores salen de `doc.errors[0]` con `linePos` → «Error en la línea 3, columna 5: …».
  - **CSV:** `parseCsv` (§4.3). El toggle «La primera fila es la cabecera» (activado) da un array de objetos; desactivado, un array de arrays. El toggle «Detectar números y booleanos» (desactivado) convierte `^-?(0|[1-9]\d*)(\.\d+)?$` en número (sin ceros a la izquierda, así `007` sigue siendo texto), `true`/`false` en booleano y la celda vacía en `null`.
- **Escritura:**
  - **JSON:** sangría de 2.
  - **YAML:** `stringify(value, { indent: 2, lineWidth: 0 })`.
  - **CSV:** `toCsv` con separador elegible (`,`, `;` o tabulador).
    - Necesita un array de objetos (o de arrays); un objeto suelto es una fila.
    - Las columnas son la unión de claves en el orden en que aparecen.
    - Los objetos anidados se aplanan con puntos (`direccion.ciudad`); los arrays y los objetos dentro de arrays van como JSON en la celda; `null` va vacío.
    - Con otra cosa: «Para CSV hace falta una lista de objetos, por ejemplo [{"a": 1}]».
    - Nota fija al elegir CSV: «CSV no guarda tipos: al volver a leerlo, todo será texto salvo que actives "Detectar números y booleanos"».
- **Salida:** `Display code`, `CopyButton main` y «Descargar» (`datos.json`, `datos.yaml` o `datos.csv`). Debounce de 150 ms con entradas de más de 100 KB.
- **Librería:** `yaml`, importada desde `logic.ts`, que solo usa esta herramienta.
- **Recordar:** ✓.
- **Casos límite:**
  - CSV con comillas, saltos de línea y `;` dentro de un campo (test de ida y vuelta);
  - un YAML con anclas → se resuelven;
  - un JSON con claves que tienen puntos, al pasar a CSV → la cabecera las conserva tal cual (se avisa de que al volver no se reconstruye el anidamiento).

### 8.5 `json-diff`: Comparar JSON

- **Nombre:** Comparar JSON / JSON diff.
- **Título SEO:** «Comparar dos JSON: diferencias sin importar el orden» / «JSON diff: compare two JSON documents by structure».
- **Sin pestañas.** Dos `TextArea` (original y modificado), cada uno leído con `parseJson` y con su propio error.
- **Algoritmo** (iterativo con una pila explícita, sin recursión, para aguantar JSON muy anidados):
  - dos objetos: una clave solo en A → **eliminada**; solo en B → **añadida**; en los dos → se sigue comparando. El orden de las claves no cuenta;
  - dos arrays: se comparan **por índice**; lo que sobra de B se añade y lo que falta se elimina. El orden importa en los arrays, y la interfaz lo dice;
  - tipos distintos, o primitivos distintos (`!==`) → **cambiada**, con el valor viejo y el nuevo.
  - Las rutas usan `jsonPath` de `json/logic.ts` (`$.usuarios[0].email`).
- **Salida:** resumen («3 añadidas · 1 eliminada · 2 cambiadas»), un filtro (Segmented secundario Todas · Añadidas · Eliminadas · Cambiadas) y una fila por cambio con su símbolo (`+`, `−`, `~`: el color nunca es la única señal) y los valores en JSON compacto, recortados a 120 caracteres. Si son iguales: LED `ok`, «Los dos JSON son equivalentes (el orden de las claves no importa)». `CopyButton main` copia el informe como texto, una línea por cambio.
- **Límite:** 5000 cambios listados, con «… y 1234 más».
- **Recordar:** ✓. Dos `persistedInput`: `json-diff` y `json-diff-b`.
- **Casos límite:** `1` frente a `1.0` → iguales (mismo número en JSON); `null` frente a `{}` → cambiada; 10 000 niveles de anidamiento → sin desbordar la pila (test).
- **Fuera de alcance:** la salida como JSON Patch (RFC 6902) y comparar arrays sin tener en cuenta el orden.

### 8.6 `markdown`: Vista previa de Markdown

- **Nombre:** Markdown / Markdown.
- **Título SEO:** «Vista previa de Markdown online (GFM) y a HTML» / «Markdown preview online (GFM) and Markdown to HTML».
- **Pestañas:** Vista previa · HTML.
- **Proceso:**
  1. `renderMarkdown(md)` en `logic.ts`: `marked.parse(md, { gfm: true, breaks: false, async: false })`. Devuelve HTML **sin sanear**, y nunca se pinta tal cual.
  2. `sanitize(html)` en `sanitize.ts`, un módulo solo de cliente: DOMPurify con `USE_PROFILES: { html: true }` (sin SVG ni MathML) y `FORBID_TAGS: ['style', 'form', 'button', 'textarea', 'select', 'iframe', 'object', 'embed']`, más un hook `afterSanitizeAttributes`:
     - los `<a>` reciben `target="_blank"` y `rel="noopener noreferrer nofollow"`;
     - un `<input>` solo sobrevive si es `type="checkbox"` (listas de tareas de GFM), y siempre con `disabled`;
     - un `<img>` con `src` `http(s)` pierde el `src` y se marca con una clase mientras el toggle «Cargar imágenes externas» esté desactivado (que es lo predeterminado). Así la vista previa no contacta con servidores de terceros sin que lo decidas. Las imágenes `data:` se muestran.
  3. `{@html safeHtml}`: **el único `{@html}` del sitio**, y solo con la salida de `sanitize`.
  - DOMPurify no funciona en SSR, y sin DOM **devuelve la entrada sin tocar** (`if (!DOMPurify.isSupported) return dirty`, comprobado en `dist/purify.es.mjs` 3.4.16). Por eso `sanitize.ts` falla cerrado: si `!DOMPurify.isSupported`, devuelve `''`. En el servidor se pinta el estado vacío, y el saneado ocurre en el navegador (en un `$effect`), con debounce de 150 ms.
- **Dónde se pinta:** como todo resultado, **dentro de `Display`**: un `<div class="md-preview">` en la pantalla, con los tokens `--disp-text`, `--disp-dim` y `--disp-line`, también en el tema claro. La pestaña HTML usa `Display code` y copia el **HTML saneado**.
- **Estilos:** el HTML inyectado no tiene las clases de ámbito de Svelte. Todas sus reglas van en `Markdown.svelte` bajo `.md-preview :global(h1)`, `:global(table)`, `:global(pre)`, etc.: `--disp-line` para bordes de tablas, código y citas, `--disp-dim` para el texto secundario y `--disp-text` subrayado para los enlaces. `pnpm check:css` no lo detectaría, porque no hay hash de ámbito: se revisa a mano en la task.
- **Tests:**
  - `logic.test.ts` (node): encabezados, tablas GFM, listas de tareas y bloques de código;
  - e2e (navegador real) para el saneado: `<img src=x onerror=…>`, `<script>`, `javascript:` en un enlace y `<iframe>` → nada se ejecuta y nada de eso queda en el DOM.
- **Recordar:** ✓.

### 8.7 `curl`: cURL → fetch

- **Nombre:** cURL a fetch / cURL to fetch.
- **Título SEO:** «Convertir comandos cURL a fetch de JavaScript» / «Convert cURL commands to JavaScript fetch».
- **Sin pestañas.** Un `TextArea` (mono) y la salida en `Display code`.
- **Tokenizador** (puro, a mano):
  - `\` + salto de línea continúa la línea;
  - las comillas simples son literales hasta la siguiente `'`;
  - en las comillas dobles solo se escapan `\" \\ \$ \`` y el salto de línea;
  - `$'…'` (ANSI-C) admite `\n \t \\ \' \" \xHH \uHHHH`;
  - fuera de comillas, `\` escapa el siguiente carácter;
  - los tokens se separan con espacios sin comillas.
  - El primer token debe ser `curl`: «El comando debe empezar por curl». El formato de `cmd` de Windows (`^"`) no se admite, y el error lo dice: «Copia el comando como "cURL (bash)"».
- **Opciones:**

| Opción | Efecto |
|---|---|
| `-X`, `--request` | Método |
| `-H`, `--header` | Cabecera (se parte en el primer `:`) |
| `-d`, `--data`, `--data-ascii`, `--data-binary`, `--data-raw` | Cuerpo. Varias se unen con `&`. Con `@archivo` (salvo en `--data-raw`) sale el aviso «fetch no puede leer archivos: sustituye @archivo por su contenido» |
| `--data-urlencode` | `nombre=valor` → `nombre=` + `encodeURIComponent(valor)`; `=valor` o `valor` → valor codificado |
| `--json` | Cuerpo, más `Content-Type` y `Accept: application/json` si no estaban |
| `-F`, `--form` | `FormData` (`nombre=@archivo` → aviso y un comentario en el código) |
| `-u`, `--user` | `Authorization: Basic ` + Base64 del UTF-8 de `usuario:clave` (`lib/bytes.ts`) |
| `-A`, `--user-agent` | Cabecera `User-Agent`, con la nota de que el navegador no deja cambiarla (Node sí) |
| `-e`, `--referer` | Opción `referrer` |
| `-b`, `--cookie` | Cabecera `Cookie`, con la nota de que en el navegador `fetch` la ignora (hay que usar `credentials: 'include'`) |
| `-G`, `--get` | Los datos pasan a la query y el método es GET |
| `-I`, `--head` | Método HEAD |
| `--url` | URL (si no, es el primer token que no es una opción) |
| `-m`, `--max-time` | `signal: AbortSignal.timeout(s × 1000)` |
| `-L`, `--compressed`, `-s`, `-S`, `-v`, `-i`, `-o` | Se ignoran sin aviso (no aplican a fetch) |
| `-k`, `--insecure` | Aviso: «fetch no puede ignorar errores de certificado» |

  - Las opciones cortas pegadas (`-XPOST`, `-H'…'`) y agrupadas (`-sSL`, solo con opciones sin valor) se admiten.
  - Una opción desconocida da «Opción ignorada: --foo» en una lista de avisos.
- **Método:** `-X` manda; si no, HEAD con `-I`; POST si hay cuerpo o formulario y no hay `-G`; si no, GET.
- **Cuerpo:** con `-d` y sin `Content-Type`, se añade `application/x-www-form-urlencoded`, como hace curl.
- **Salida:** `const response = await fetch(url, { method, headers, body })`.
  - Se omite lo que es el valor por defecto (sin `method` si es GET).
  - Textos entre comillas simples bien escapados; las claves de cabecera van entre comillas si no son identificadores.
  - Si el `Content-Type` es JSON y el cuerpo es JSON válido: `body: JSON.stringify({ … })`, con sangría de 2.
  - Con `-F`: `const form = new FormData(); form.append(…)` antes del fetch, y sin cabecera `Content-Type`, porque la pone el navegador con el `boundary`.
- **Recordar:** ✗. Un cURL copiado de las herramientas del navegador suele llevar cookies y tokens.
- **Casos límite:** URL entre comillas o sin ellas; `-H` repetido con la misma cabecera → gana la última (como en curl) y se avisa; comando vacío → estado vacío.

### 8.8 `query-string`: Query string ↔ JSON

- **Nombre:** Query string / Query string.
- **Título SEO:** «Conversor de query string a JSON y de JSON a query» / «Query string to JSON converter (and JSON to query)».
- **Sin pestañas.** Dirección con un Segmented secundario (Automática · Query → JSON · JSON → query). En automático, si la entrada empieza por `{` es JSON → query; si no, query → JSON.
- **Query → JSON:**
  - admite una URL completa (se toma su `search`) o el texto tras el primer `?`, y quita el `#…`;
  - se parte por `&` y cada par en el primer `=` (sin `=`, el valor es `""`);
  - `+` → espacio y luego `decodeURIComponent`; un `%` mal formado se deja tal cual, con el aviso «No se pudo decodificar %E0%A4»;
  - con el toggle «Notación con corchetes» (activado): `a[b]=1` → `{ "a": { "b": "1" } }`, `a[]=1&a[]=2` → `{ "a": ["1", "2"] }`, anidado `a[b][c]`;
  - claves repetidas sin corchetes → array en el orden en que aparecen;
  - el toggle «Detectar números y booleanos» está desactivado por defecto;
  - los objetos se crean con `Object.create(null)`, así que `__proto__` es una clave más y no hay contaminación de prototipos (test).
- **JSON → query:**
  - el nivel superior debe ser un objeto;
  - primitivos con `String(v)`; `null` → `clave=`;
  - arrays → claves repetidas o `clave[]=` (según el toggle de corchetes);
  - objetos anidados → `a[b]=1`;
  - los valores van con `encodeURIComponent` (los `[` `]` de las claves se dejan legibles); el toggle «Espacios como +» está desactivado.
- **Salida:** `Display code` con el resultado, más una tabla de pares clave–valor ya decodificados.
- **Recordar:** ✓, con un `shouldSave` que **no guarda** la entrada si alguna clave coincide con `/token|secret|password|passwd|pwd|api[_-]?key|auth|signature|sig|session/i`. Es el mismo criterio que la URL con contraseña en la herramienta `url`.
- **Casos límite:** `?` solo → objeto vacío; `a=1&&b=2` → se ignora el par vacío; claves con espacios codificados.

### 8.9 `http-status`: Códigos de estado HTTP

- **Nombre:** Códigos HTTP / HTTP status codes.
- **Título SEO:** «Códigos de estado HTTP: lista completa explicada» / «HTTP status codes: complete list explained».
- **Sin pestañas.** Un buscador y un filtro (Segmented secundario Todos · 1xx · 2xx · 3xx · 4xx · 5xx).
- **Datos** (tabla en `logic.ts`): código, frase oficial en inglés (registro de IANA), nombre en español, una descripción de 1–2 frases en ES y EN, «cuándo usarlo» si aporta, y la referencia.
  - Códigos: 100–103; 200–208 y 226; 300–305, 307 y 308 (306 figura como «sin uso»); 400–418 (418 marcado como broma, RFC 2324); 421–426, 428, 429, 431 y 451; 500–508, 510 y 511.
  - Referencias: RFC 9110 para el núcleo; RFC 6585 (428, 429, 431, 511); RFC 7725 (451); RFC 2518 (102); RFC 4918 (207, 423, 424, 507); RFC 9110 también para 421 y 422; RFC 8297 (103); RFC 3229 (226); RFC 5842 (208, 508); RFC 2774 (510, histórico); RFC 8470 (425).
- **Búsqueda:** por prefijo de código (`40` → 400–409) o por texto en los dos idiomas, sin tildes ni mayúsculas. Una URL con `#404` resalta ese código al cargar.
- **Salida:** una fila por código (código, frase, nombre, descripción) con un botón para copiar el código.
- **Recordar:** ✓. Se guarda la búsqueda.

### 8.10 `cron`: Expresiones cron

- **Nombre:** Cron / Cron.
- **Título SEO:** «Explicar expresiones cron y ver próximas ejecuciones» / «Cron expression explainer with next run times».
- **Sin pestañas.** Tiene la expresión, la zona horaria (`listTimeZones` e `isValidTimeZone` de `timestamp/logic.ts`; por defecto, la del navegador) y cuántas ejecuciones mostrar (de 1 a 20; 5 por defecto).
- **Parser** (a mano):
  - 5 campos separados por espacios: minuto 0–59, hora 0–23, día del mes 1–31, mes 1–12 o `JAN–DEC`, y día de la semana 0–7 (0 y 7 son domingo) o `SUN–SAT`;
  - cada campo es una lista separada por comas de elementos `*`, `*/n`, `a`, `a-b`, `a-b/n` o `a/n` (= `a-máx/n`). Los nombres no distinguen mayúsculas y valen en rangos (`MON-FRI`);
  - macros: `@yearly`/`@annually` = `0 0 1 1 *`, `@monthly` = `0 0 1 * *`, `@weekly` = `0 0 * * 0`, `@daily`/`@midnight` = `0 0 * * *`, `@hourly` = `0 * * * *`; `@reboot` → «Al arrancar el sistema», sin próximas ejecuciones.
- **Errores:**
  - fuera de rango → «El minuto 60 no existe: van de 0 a 59»;
  - rango al revés → «El rango 5-1 va hacia atrás: escribe 1-5»;
  - paso 0;
  - 6 o 7 campos → «Parece una expresión con segundos o años (Quartz, Spring). Aquí se usa el cron clásico de 5 campos»;
  - `?`, `L`, `W` o `#` → «L, W, # y ? son de Quartz y no los entiende el cron de Unix».
- **Día del mes y día de la semana (regla de Vixie cron):** si **los dos** campos están restringidos (su texto no empieza por `*`), un día vale si cumple **uno u otro**. Si uno empieza por `*` (incluido `*/2`), se combinan con **y**. La explicación lo dice («el día 1 del mes o los lunes»).
- **Explicación en palabras** (ES/EN, plantillas propias):
  - `describeField` devuelve «cada minuto» si están todos los valores; «cada n minutos» si es una progresión desde el mínimo hasta el final; «de a a b» si son consecutivos; y si no, una lista con `Intl.ListFormat(locale, { type: 'conjunction' })`;
  - minuto y hora únicos → «a las 09:30». Minuto único y hasta 6 horas sueltas → «a las 09:00, 12:00 y 18:00». En otro caso, la frase del minuto + la de la hora;
  - después va el día (del mes o de la semana, con la regla anterior) y el mes si no son todos;
  - se une con comas, empieza en mayúscula y termina en punto.
  - Tests con el texto exacto:
    - `* * * * *` → «Cada minuto.» / «Every minute.»;
    - `*/15 * * * *` → «Cada 15 minutos.» / «Every 15 minutes.»;
    - `30 9 * * 1-5` → «A las 09:30, de lunes a viernes.» / «At 09:30, Monday through Friday.»;
    - `0 0 1 * *` → «A las 00:00, el día 1 del mes.» / «At 00:00, on day 1 of the month.»;
    - `0 9 1 * 1` → «A las 09:00, el día 1 del mes o los lunes.» / «At 09:00, on day 1 of the month or on Mondays.».
- **Próximas ejecuciones:**
  1. La hora actual se pasa a la zona elegida con `Intl.DateTimeFormat(…, { timeZone, hourCycle: 'h23' })` y se empieza en el minuto siguiente.
  2. Se recorren los días civiles hacia delante, hasta 5 años. El día de la semana de una fecha civil se calcula con `Date.UTC` y no depende de la zona.
  3. En cada día válido, por cada hora y minuto permitidos en orden, el instante es `zonedToUtc(y, mes, d, h, min, 0, 0, zona)` de `timestamp/logic.ts`.
  - **Hueco de marzo (hora que no existe):** se detecta cuando `wallClock(instante)` no coincide con la hora pedida. Como Vixie cron, se ejecuta en el primer minuto que sí existe tras el salto (en Madrid, `02:30` del 2026-03-29 → `03:00`, es decir, `01:00Z`), con la marca «ajustada por el cambio de hora». Si varias horas caen en el mismo instante, se muestra una sola vez.
  - **Hora repetida de octubre:** se ejecuta **una sola vez, en la primera aparición**. `zonedToUtc` devuelve la segunda (comprobado: `02:30` del 2026-10-25 en Madrid → `01:30Z`). Por eso se prueba `instante − 60 min` y `instante − 30 min`: si su `wallClock` es la misma hora pedida, se usa ese instante más temprano (→ `00:30Z`). Hay un test para cada hueco.
  - Si en 5 años no hay ninguna: «Esta expresión no se ejecuta nunca (por ejemplo, el 30 de febrero)». `0 0 29 2 *` sí encuentra el 29 de febrero de 2028.
- **Salida:** la explicación en `Display value`, y las ejecuciones en una lista: fecha y hora en la zona (`Intl`, estilo medio), relativa (`formatRelative` de `lib/relative.ts`) y un ISO UTC copiable.
- **Recordar:** ✓. Se guardan la expresión y la zona.

### 8.11 `user-agent`: User-Agent

- **Nombre:** User-Agent / User-Agent.
- **Título SEO:** «Analizar User-Agent: navegador, sistema y dispositivo» / «User-Agent parser: browser, OS and device».
- **Sin pestañas.** Un `TextArea`. Si está vacío al montar, se rellena con `navigator.userAgent`, y el botón «Usar el de este navegador» lo repone.
- **Librería:** `ua-parser-js` 1.x. `parseUserAgent(ua)` en `logic.ts` envuelve `new UAParser(ua).getResult()`.
- **Salida (`Display kv`):**
  - navegador y versión, motor, sistema y versión, dispositivo (fabricante, modelo y tipo; sin tipo → «Escritorio (probable)») y arquitectura de CPU;
  - «Parece un bot» si coincide `/bot|crawler|spider|crawling|slurp|mediapartners/i`;
  - si la entrada es el User-Agent de este navegador y existe `navigator.userAgentData`, se añaden sus Client Hints de baja entropía (marcas, plataforma y móvil).
- **Nota fija:** desde 2021, Chrome y otros congelan parte del User-Agent (versión menor y del sistema), así que para datos precisos hacen falta las Client Hints.
- **Recordar:** ✓. Un User-Agent no es secreto: el navegador lo envía a todas las webs.
- **Casos límite:** texto que no es un User-Agent → todos los campos en «—» y la nota «No se ha reconocido ningún navegador»; un User-Agent de 2 KB sin problema.

### 8.12 `semver`: Rangos semver

- **Nombre:** Semver / Semver.
- **Título SEO:** «Comprobar versiones semver contra un rango (^, ~)» / «Semver range checker: does a version satisfy ^ or ~».
- **Sin pestañas.** El rango (por ejemplo `^1.2.3`) y un `TextArea` de versiones, una por línea.
- **Librería:** `semver`, con importaciones sueltas (`semver/functions/satisfies`, `semver/functions/valid`, `semver/ranges/valid`, `semver/ranges/max-satisfying` y `semver/ranges/min-version`).
- **Salida:**
  - por versión, un LED «cumple» o «no cumple», o el error «No es una versión semver: se escribe MAYOR.MENOR.PARCHE, por ejemplo 1.4.0»;
  - el rango normalizado (`validRange`: `^1.2.3` → `>=1.2.3 <2.0.0-0`) y su lectura en palabras, escrita a mano desde los comparadores («desde 1.2.3, incluida, hasta antes de 2.0.0»);
  - la versión más alta que cumple (`maxSatisfying`) y la mínima del rango (`minVersion`).
  - Toggle «Incluir prereleases» → `{ includePrerelease: true }`.
  - Chuleta plegable de `^`, `~`, `x`, `-` y `||`.
- **Errores:** rango inválido → «El rango no es válido. Ejemplos: ^1.2.3, ~1.2, >=1.0.0 <2.0.0, 1.x || 2.x».
- **Recordar:** ✓.

### 8.13 `cidr`: Subredes IPv4

- **Nombre:** Subredes CIDR / CIDR subnets.
- **Título SEO:** «Calculadora de subredes IPv4 y CIDR online» / «IPv4 CIDR subnet calculator».
- **Sin pestañas.** Un campo: `a.b.c.d/p`, o una IP más una máscara (`192.168.1.10 255.255.255.0`). Una IP sola se toma como `/32` y se avisa.
- **Validación:**
  - 4 octetos decimales 0–255, sin ceros a la izquierda: «Los ceros a la izquierda son ambiguos (hay sistemas que los leen en octal): escribe 10»;
  - prefijo 0–32;
  - una máscara con los unos no contiguos (`255.0.255.0`) → «La máscara no es válida: los unos deben ir seguidos».
  - IPv6 → «IPv6 todavía no está incluido».
- **Cálculo** (32 bits sin signo, `>>> 0`):
  - `máscara = p === 0 ? 0 : (0xFFFFFFFF << (32 − p)) >>> 0`;
  - `red = ip & máscara`; `broadcast = red | ~máscara`; `comodín = ~máscara >>> 0`;
  - `p ≤ 30`: primer host = red + 1, último = broadcast − 1, útiles = 2^(32−p) − 2;
  - **`/31` (RFC 3021, punto a punto):** sin broadcast (se muestra «—»); las dos direcciones son útiles;
  - **`/32`:** un solo host (la propia IP), sin broadcast.
  - Comprobado:
    - `192.168.1.10/24` → red 192.168.1.0, broadcast 192.168.1.255, hosts 192.168.1.1–254, 254 útiles;
    - `10.0.0.7/31` → 10.0.0.6–10.0.0.7, 2 útiles;
    - `172.16.5.4/20` → red 172.16.0.0, broadcast 172.16.15.255, 4094 útiles.
- **Salida (`Display kv`):** IP, red/p, máscara, comodín, broadcast, primer y último host, hosts útiles, total de direcciones, máscara en binario (octetos con puntos) y tipo:
  - privada (RFC 1918: 10/8, 172.16/12, 192.168/16);
  - CGNAT (100.64/10), loopback (127/8), enlace local (169.254/16) o «esta red» (0/8);
  - documentación (192.0.2/24, 198.51.100/24, 203.0.113/24);
  - multicast (224/4), reservada (240/4) o pública;
  - además, la clase histórica (A–E), como dato informativo.
- **Recordar:** ✓.
- **Fuera de alcance:** dividir en subredes, IPv6.

## 9. Tests

### Unitarios (Vitest, entorno `node`)

- Cada `logic.test.ts` incluye **todos los ejemplos comprobados** de su ficha, con su resultado exacto, y los casos límite que la ficha lista.
- Todo generador de `ids` pasa la prueba de ida y vuelta: 1 000 valores con `seededRng('test')` y todos aceptados por su validador (§4.2).
- `lib/random.ts`, `lib/provinces.ts`, `lib/csv.ts` y `lib/numbers.ts` llevan sus propios tests (§4).
- `user-agent/logic.test.ts` comprueba que la versión instalada de `ua-parser-js` empieza por `1.` (lee su `package.json`). Así, una actualización accidental a la 2.x (AGPL) rompe el CI.
- El test de registro existente cubre las 38 sin cambios: metadatos completos, título ≤ 65, descripción 51–160, slugs únicos y con formato válido, icono existente y los dos `content.*.md`.

### e2e (Playwright, en la task de cierre de cada lote)

- Cada página nueva se añade a `PAGES` de `e2e/tools.spec.ts` (carga, `h1` y panel visible).
- Además, cada herramienta tiene **una interacción real**.
- Reglas de determinismo:
  - las herramientas de azar usan semilla cuando la tienen;
  - la ruleta se prueba con `page.emulateMedia({ reducedMotion: 'reduce' })`;
  - cron fija el reloj con `page.clock.setFixedTime`;
  - divisas **nunca** llama a la API real (`page.route`);
  - los formatos de número de `Intl` se comprueban con expresiones regulares tolerantes (`/1\.?060,00/`).

| id | Interacción e2e |
|---|---|
| `dni` | `12345678A` → «Letra incorrecta: para 12345678 es Z»; `12345678Z` → válido; tras 500 ms no hay ninguna clave de `localStorage` con `dni` |
| `cif` | `B65410011` → válido y «Sociedad de responsabilidad limitada»; Generar con semilla `demo` → 10 filas que cumplen `^[A-HJNP-SUVW]\d{7}[0-9A-J]$` |
| `iban` | `ES91 2100 0418 4502 0005 1332` → válido y entidad 2100; cambiar la última cifra a 3 → no válido; nada guardado |
| `plate` | `1234 BCA` → mensaje de que la A no se usa; `M-1234-AB` → válida, Madrid |
| `nss` | `28/12345678/40` → válido, Madrid; `281234567841` → «debería ser 40» |
| `card` | `4242 4242 4242 4242` → Visa y Luhn correcto; Generar American Express con semilla → 15 cifras que empiezan por 34 o 37; nada guardado |
| `phone` | `+34 612 34 56 78` → Móvil y `+34612345678` |
| `bic` | `caixesbbxxx` → válido, España, «Oficina principal» |
| `ean-isbn` | `0306406152` → ISBN-10 válido y `9780306406157` |
| `postal-code` | `8001` → «Añadido el 0 inicial», `08001` y Barcelona |
| `mock` | Semilla `demo`, 5 filas, CSV → cabecera `nombre,apellidos,email,telefono,dni,ciudad` y 6 líneas; «Datos internacionales» → sin columna `dni`; SQL → la descarga se llama `datos.sql` |
| `units` | 1 mi → la fila de km contiene `1,609344` |
| `currency` | (a) API simulada `{ base: 'EUR', date: '2026-09-25', rates: { USD: 1.1, GBP: 0.85 } }`: 10 EUR → USD contiene `11,00`. (b) Caché antigua + petición abortada → «Sin conexión: se usan los tipos guardados del 25/09/2026». (c) Sin caché + petición abortada → mensaje de error y botón «Reintentar» |
| `px-rem` | 24 px → el campo rem vale `1.5` (con punto también en `/es/`) y el fragmento es `font-size: 1.5rem; /* 24px */`; base 10 → `2.4` |
| `chmod` | `755` → `rwxr-xr-x`; marcar escritura del grupo → `775` |
| `file-size` | `1 TB` → contiene `931,3` y `GiB` |
| `wheel` | Con movimiento reducido: «Ana, Luis, Eva» → Girar → `Ha salido: (Ana|Luis|Eva)`; con «Quitar la opción ganadora», quedan 2 líneas |
| `shuffle` | `a…e` con semilla `demo` → 5 líneas con los mismos elementos; tras recargar, el mismo orden |
| `teams` | 10 nombres, «Personas por equipo» 3 → 4 equipos de 3, 3, 2 y 2 |
| `dice` | `3d6+2` con semilla → 3 dados y total entre 5 y 20; `0d6` → error con el rango |
| `iva` | 100 de base al 21 % → `121,00`; 121 como total → base `100,00` |
| `irpf` | Base 1000, IVA 21 %, IRPF 15 % → total a cobrar `/1\.?060,00/` |
| `percent` | 21 % de 200 → 42; variación desde 0 → error |
| `rule-of-three` | Directa 2 → 10, 5 → 25; Inversa 4, 6, 8 → 3 |
| `workdays` | 2026-01-01 → 2026-01-31 → 31 naturales y 20 hábiles; la lista incluye Epifanía |
| `password` | Longitud 32 → contraseña de 32 caracteres y LED «Fuerte»; ningún valor de `localStorage` la contiene |
| `qr` | Texto `hola` → imagen visible; «Descargar PNG» → `qr.png`; «Descargar SVG» → `qr.svg`; en WiFi, la contraseña `s3cret` no aparece en `localStorage` |
| `slug` | `¡Hola, Mundo! Año 2026` → `hola-mundo-ano-2026` |
| `data-convert` | `nombre;edad\nAna;34` → JSON con `"nombre": "Ana"`; salida YAML → `nombre: Ana` |
| `json-diff` | `{"a":1,"b":2}` frente a `{"b":3,"a":1,"c":4}` → 1 añadida y 1 cambiada, con filas `$.c` y `$.b` |
| `markdown` | `# Hola` + `<img src=x onerror="window.__xss=1">` + `[x](javascript:alert(1))` → `.md-preview h1` es «Hola»; `window.__xss` no existe; no hay `img[onerror]` ni `a[href^="javascript"]`; la pestaña HTML muestra `<h1` |
| `curl` | `curl -X POST https://api.example.com/u -H 'Content-Type: application/json' -d '{"a":1}'` → salida con `method: 'POST'` y `body: JSON.stringify(`; nada guardado |
| `query-string` | `?a=1&b=2&b=3&c[d]=x` → JSON con `"b": ["2", "3"]` y `"c": { "d": "x" }`; `?token=abc` no se guarda |
| `http-status` | `404` → «Not Found»; `teapot` → 418 |
| `cron` | Reloj fijo en `2026-09-28T06:00:00Z`, `30 9 * * 1-5`, Europe/Madrid → «A las 09:30, de lunes a viernes.» y la primera ejecución `2026-09-28T07:30:00.000Z` |
| `user-agent` | UA de Firefox 128 en Windows → Firefox, 128.0, Windows y Gecko |
| `semver` | `^1.2.3` con `1.2.3`, `1.9.0` y `2.0.0` → 2 cumplen; `>=1.2.3 <2.0.0-0` |
| `cidr` | `192.168.1.10/24` → `192.168.1.255` y 254 útiles; `10.0.0.7/31` → 2 útiles |

## 10. Riesgos

- **La API de divisas cambia o desaparece.** Frankfurter ya cambió de dominio (la 301 sin CORS) y anuncia una v2 en la cabecera `Link`. Mitigación:
  - la URL está en una sola constante y la respuesta se valida;
  - la caché y los tres estados hacen que la herramienta degrade con un mensaje claro;
  - el e2e no depende de la API real.
  - Si la v1 desaparece, se cambia la constante y `parseRatesResponse`.
- **NSS con número < 10 000 000:** la fórmula está documentada por varias fuentes, pero no hay un ejemplo real publicado con el que comprobarla. Queda fijada en un test; si alguien informa de un NSS real que falla, se revisa.
- **Control del CIF:** las fuentes no coinciden en si algunos tipos llevan letra o cifra. Por eso solo se es estricto donde coinciden (§6.2).
- **Tarjetas generadas:** son números al azar que pasan Luhn con prefijos de marca, así que en teoría uno podría coincidir con una tarjeta real. Sin caducidad, CVV ni 3-D Secure reales no sirven para pagar. La herramienta lo dice de forma visible y no usa listas de BIN reales.
- **Tablas que cambian con el tiempo:** las longitudes de IBAN (el registro SWIFT se actualiza unas pocas veces al año), la lista ISO 3166 y los tipos de IVA e IRPF (los fija la ley). Cada una es una constante con un comentario que indica su fecha y su fuente.
- **El único `{@html}`:** es la superficie de XSS del sitio. Mitigación:
  - DOMPurify con la configuración y los hooks de §8.6;
  - nada se pinta en SSR;
  - e2e con cargas típicas;
  - dependabot atento a `dompurify`.
- **Peso de las librerías:** van separadas en el chunk de su herramienta. La task de cierre de cada lote comprueba en `dist/_astro` que ninguna aparece en los chunks de la Home ni de otras herramientas, y que el JS inicial de la Home sigue por debajo de 30 KB gzip (§9 del spec de plataforma).
- **Una actualización accidental de `ua-parser-js` a la 2.x (AGPL):** la protegen el rango `^1.0.41`, la restricción global del plan del lote 3 y el test de versión (§9).
- **Cambios de hora en cron:** las dos reglas de §8.10 tienen sus tests. `zonedToUtc` devuelve la segunda aparición en la hora repetida; se corrige en cron sin tocar `timestamp`.
- **Diferencias de `Intl` entre navegadores** (nombres de país y de divisa, formato de números): la lógica no depende de ellos para validar (la lista ISO es propia), y los e2e usan expresiones tolerantes.
- **Rendimiento de la ruleta en móviles modestos:** la ruleta se pinta una vez en un canvas fuera de pantalla, y en cada fotograma solo se rota y se copia (`drawImage`). Se repinta entera solo al cambiar las opciones, el tema o el tamaño.
- **Las tasks paralelas del lote 1 se desvían del contrato de generadores:** los nombres y firmas están fijados en §4.2. La task de `mock` se hace después de fusionar y `pnpm check` falla si algo no cuadra. En ese caso se corrige en la herramienta afectada, no con un adaptador en `mock`.

## 11. Fuera de alcance

- **Festivos autonómicos y locales**, y los traslados de festivos que caen en domingo.
- **CSP** y cualquier cabecera nueva en Netlify (§4.7 anota lo que haría falta).
- **Mover la herramienta de regex a un Worker.**
- Identificadores de otros países: generar IBAN que no sean españoles, el nombre del banco a partir de un IBAN o un BIC, el guionado del ISBN, EAN-8 y UPC, el municipio exacto de un código postal, el año de una matrícula, las matrículas especiales y el código de cuenta de cotización de empresas.
- Dividir en subredes e IPv6; JSON Patch y comparar arrays sin orden; la sintaxis de Quartz en cron; el cURL de `cmd` de Windows; tipos de cambio históricos; el recargo de equivalencia y el IPSI; frases de contraseña.
- Componentes nuevos en el kit, imágenes OG por herramienta y cambios en los chips de la Home.

## 12. Decisiones tomadas en este spec (no venían en el brief)

- **Divisas:** se usa `https://api.frankfurter.dev/v1/latest` en vez de `api.frankfurter.app/latest`, porque la segunda redirige sin CORS (§7.2). La caché se renueva a las 6 h.
- **NSS:** se especifican las dos ramas de la fórmula; la del brief es solo la segunda (§6.5).
- **CIF:** se es estricto solo con A, B, E y H (cifra) y con N, P, Q, S y W (letra). También se validan los NIF K, L y M con la tabla del DNI.
- **IBAN:** además de los 89 del registro SWIFT, se incluyen los 12 territorios franceses y Åland; los «experimentales» quedan fuera. Las entidades del generador español son códigos reales frecuentes.
- **Contratos compartidos:** `lib/random.ts` (FNV-1a + mulberry32, `randInt` sin sesgo), `lib/provinces.ts`, `lib/csv.ts` y `lib/numbers.ts`, con los nombres de los generadores de `ids` fijados de antemano.
- **Sin semilla:** la ruleta (tiene que ser imprevisible) y las contraseñas (una contraseña reproducible no es segura).
- **Recordar:** ✓ en CIF, matrícula, BIC, EAN/ISBN y código postal; ✗ en DNI, IBAN, NSS, tarjetas, teléfono, contraseñas y cURL. En QR no se guarda nunca la contraseña WiFi; la query string no se guarda si parece llevar credenciales; de las contraseñas se guardan solo las opciones.
- **Mock:**
  - los emails usan los dominios reservados `example.com`, `.org` y `.net`;
  - el teléfono internacional usa el rango ficticio 555-01XX;
  - el CIF concuerda con S.L./S.A.;
  - quitar columnas no cambia los valores de las demás;
  - el modo internacional desactiva DNI, NIE, CIF, IBAN, matrícula y provincia.
- **Días hábiles:** el día final se incluye por defecto, y el mismo intervalo sirve para todos los recuentos.
- **Markdown:** las imágenes externas no se cargan salvo que se active el toggle, y los enlaces se abren en una pestaña nueva con `noopener`.
- **QR:** se pasa el texto como UTF-8 en una cadena binaria para esquivar la conversión por defecto de la librería. El archivo exportado usa `black`/`white` como palabras clave (sin hex).
- **Cron:** en el hueco de marzo se ejecuta en el primer minuto válido; en la hora repetida de octubre, solo una vez y en la primera aparición.
- **Categoría `calc`:** va entre `conv` y `rand`, y la añade el lote 2.
- **Iconos:** `id-card-lanyard` para DNI y `dice-5` para dados, para no repetir el icono de su categoría.
