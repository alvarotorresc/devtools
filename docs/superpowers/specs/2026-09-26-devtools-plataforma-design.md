# DevTools: plataforma nueva (Astro + Svelte) y migración de las 14 herramientas

- **Fecha:** 2026-09-26
- **Estado:** aprobado en conversación, pendiente de revisión escrita
- **Subproyecto:** 1 de 2. El subproyecto 2 (herramientas nuevas) tendrá su propio spec.
- **Diseño visual de referencia:** canvas "DevTools — Direcciones visuales", página *Instrumento*: https://claude.ai/artifact/H5MdJhWRGZMzTP4SjoMy93

## 1. Objetivo

DevTools (devtools.alvarotc.com) es hoy una SPA vanilla TS con 14 herramientas, un único tema verde de terminal, navegación por `#hash` y el generador de UUID como portada. Se usa a diario y funciona, pero:

- no hay portada: se abre directamente en UUID;
- no hay forma de elegir tema;
- la lista de herramientas es plana y no escala a las ~35 previstas;
- cada herramienta repite a mano la misma estructura DOM y casi todas requieren pulsar botones para ver el resultado;
- las rutas con `#` no se indexan, y el autor quiere que la web posicione en Google (ES y EN).

**Éxito** = una web estática bilingüe, con una URL indexable por herramienta, portada con buscador, 3 temas persistentes, sidebar agrupada y plegable, un sistema de UI común sobre el que las 14 herramientas actuales funcionan mejor que hoy, y una base que haga trivial añadir las herramientas del subproyecto 2.

### Qué dijo el autor (literal o casi)

- Página Home para que UUID no sea la principal.
- 3 temas guardados en el navegador: claro, oscuro y terminal. Terminal es el de por defecto y conserva la pantalla de arranque.
- Claro y oscuro originales, "no lo típico", pero legibles → eligió la dirección **B · Instrumento**.
- Sidebar organizada, plegable, con iconos y animaciones.
- Mejorar la UI/UX de las herramientas → aprobó el patrón de página de herramienta del canvas ("me encanta").
- Astro + Svelte porque quiere posicionar. Bilingüe ES + EN.

### Supuestos

- Sigue siendo 100 % cliente, sin backend ni cuentas.
- Despliegue como sitio estático en el hosting actual; nada depende de reglas del proveedor.
- Umami se mantiene.

## 2. Alcance

**Dentro:** migración a Astro + Svelte 5, i18n ES/EN, Home, buscador (Ctrl+K), sidebar, 3 temas, pantalla de arranque, kit de UI, las 14 herramientas migradas con las mejoras de la §7, SEO técnico, tests y CI.

**Fuera:**

- herramientas nuevas (subproyecto 2: identificadores + mock data, conversores + azar, resto);
- imágenes OG por herramienta (una genérica basta);
- PWA/offline (mejora futura, encaja sin rediseño);
- cuentas o sincronización entre dispositivos.

## 3. Arquitectura

### Stack

- Astro 5 con `output: 'static'` y `@astrojs/svelte` con Svelte 5 (runes).
- TypeScript, pnpm, Vitest, ESLint, Prettier (los actuales) + `astro check`.
- `@astrojs/sitemap`.
- Iconos: `@lucide/svelte` (solo se incluyen los usados). En componentes `.astro` se usan los mismos iconos a través de un componente `Icon.astro` que importa los SVG de Lucide.
- Fuentes self-hosted con Fontsource: `@fontsource-variable/unbounded`, `@fontsource-variable/instrument-sans`, `@fontsource/ibm-plex-mono` (400, 500, 600).

### Estructura de carpetas

```
src/
  pages/
    index.astro                 → redirección por idioma (§4)
    [locale]/index.astro        → Home
    [locale]/[slug].astro       → página de herramienta (getStaticPaths desde el registro)
    404.astro
  layouts/
    AppLayout.astro             → <head>, sidebar, cabecera móvil, slot, boot screen
  components/                   → piezas .astro de layout (Sidebar, MobileHeader, Catalog, SeoHead…)
  islands/                      → islas Svelte globales (CommandPalette, ThemeSwitch, SidebarControls, Toaster)
  ui/                           → kit Svelte (§6)
  tools/
    registry.ts                 → array de todos los meta + helpers (byId, bySlug, byCategory)
    categories.ts               → 7 categorías con id, icono y nombre por idioma
    <id>/
      meta.ts
      logic.ts
      logic.test.ts
      <Name>.svelte
      content.es.md
      content.en.md
  i18n/
    es.ts, en.ts                → cadenas de la interfaz
    index.ts                    → t(locale, key), rutas alternativas, detección de idioma
  lib/
    storage.ts                  → acceso a localStorage/sessionStorage con try/catch
    search.ts                   → búsqueda difusa
    shortcuts.ts
  styles/
    tokens.css                  → variables por tema (§5)
    global.css
```

### Contrato de una herramienta

```ts
// src/tools/types.ts
export type Locale = 'es' | 'en';
export type CategoryId = 'gen' | 'enc' | 'data' | 'ids' | 'conv' | 'rand' | 'ref';

export interface ToolMeta {
  id: string;                          // estable, p. ej. 'uuid'
  category: CategoryId;
  icon: string;                        // nombre de icono Lucide
  slug: Record<Locale, string>;        // 'generador-uuid' / 'uuid-generator'
  name: Record<Locale, string>;        // nombre corto para sidebar y catálogo
  title: Record<Locale, string>;       // <title> SEO
  description: Record<Locale, string>; // una línea visible + meta description
  keywords: Record<Locale, string[]>;  // para el buscador
  tabs?: Record<Locale, string[]>;     // etiquetas de modos, si las hay
  faq?: Record<Locale, { q: string; a: string }[]>;
  rememberInput?: boolean;             // por defecto true; false en JWT y Hash
}
```

- `logic.ts` no toca el DOM ni `window`: solo funciones puras, fácilmente testeables.
- El `.svelte` recibe `locale` como prop y usa `t()` para sus textos.
- `[slug].astro` importa dinámicamente el componente de la herramienta y lo monta con `client:load` dentro de `ToolShell`.
- El contenido SEO (`content.<locale>.md`) se renderiza como HTML estático debajo del panel.

### Navegación

- `<ClientRouter />` de Astro (View Transitions).
- La sidebar lleva `transition:persist`: no se vuelve a renderizar al cambiar de herramienta, y conserva el scroll, el plegado y las categorías abiertas.
- Las islas globales (paleta, tema, toaster) también persisten.
- Las islas de herramienta se montan y desmontan con la página. Cualquier listener global que registren se limpia en el `onDestroy`/`$effect` de retorno.

## 4. Rutas e idiomas

- Locales: `es`, `en`. Todas las rutas llevan prefijo: `/es/…`, `/en/…`.
- Slugs traducidos por herramienta (`/es/validador-dni-nie`, `/en/dni-nie-validator`).
- `/` (`pages/index.astro`): HTML mínimo con un script en línea que elige `es` o `en` según `localStorage.locale` → `navigator.languages` → `es`, y hace `location.replace`. Incluye enlaces visibles a ambas versiones (sin JS o para bots) y `<link rel="alternate" hreflang="x-default" href="/">`.
- El selector ES/EN enlaza a la misma herramienta en el otro idioma (con `slug[otherLocale]`) y guarda `localStorage.locale`.
- `<html lang>` según el locale.
- Cadenas de interfaz en `i18n/es.ts` y `i18n/en.ts`. Un test garantiza que ambos diccionarios tienen las mismas claves.

## 5. Temas

Tres temas en `<html data-theme="terminal|dark|light">`. Por defecto `terminal`.

- Un script en línea, en el `<head>` y antes del CSS, lee `localStorage.theme` y fija el atributo. Así no hay parpadeo. Si el almacenamiento falla, se queda en `terminal`.
- `ThemeSwitch` (radiogroup de 3 posiciones, en el pie de la sidebar) cambia el atributo y lo persiste. `<meta name="theme-color">` se actualiza con el fondo del tema.
- Todo el color, las fuentes y los radios salen de variables CSS. Ningún componente usa hex directos.

### Tokens

| Token | terminal | dark (grafito) | light (aluminio) |
|---|---|---|---|
| `--bg` | #0a0a0a | #161719 | #E3E1DC |
| `--surface` | #0f0f0f | #1E1F22 | #EEEDE9 |
| `--raised` | #111811 | #28292D | #F8F7F4 |
| `--well` | #070907 | #131416 | #D9D7D1 |
| `--border` | #1a3a1a | #393A3F | #C6C3BC |
| `--border-strong` | #1f7a1f | #4A4B51 | #AFACA4 |
| `--text` | #33ff33 | #EDECE8 | #1D1E20 |
| `--text-dim` | #1fae1f | #A09F9B | #55565A |
| `--accent` | #33ff33 | #FF5A1F | #FF5419 |
| `--on-accent` | #0a0a0a | #161719 | #1D1E20 |
| `--accent-text` | #66ff66 | #FF7B47 | #B83A0A |
| `--disp` (pantalla) | #050805 | #0E0F10 | #1D1E20 |
| `--disp-line` | #143014 | #26272B | #303134 |
| `--disp-text` | #66ff66 | #FFC266 | #FFC266 |
| `--disp-dim` | #1fae1f | #9A8D74 | #A89B80 |
| `--ok` | #33ff33 | #2BD46B | #2BD46B |
| `--bad` | #ffcc00 | #FF5A1F | #FF5419 |
| `--idle` | #1a5a1a | #6B6A66 | #6B6A66 |
| `--font-display` | IBM Plex Mono | Unbounded | Unbounded |
| `--font-body` | IBM Plex Mono | Instrument Sans | Instrument Sans |
| `--font-mono` | IBM Plex Mono | IBM Plex Mono | IBM Plex Mono |
| `--radius` / `--radius-lg` / `--radius-pill` | 0 / 0 / 0 | 10px / 18px / 999px | 10px / 18px / 999px |
| `--glow` (text-shadow) | 0 0 4px rgba(51,255,51,.45) | none | none |
| `--disp-glow` | 0 0 6px rgba(51,255,51,.5) | 0 0 12px rgba(255,194,102,.25) | 0 0 12px rgba(255,194,102,.2) |

- El tema terminal antepone `> ` a los `h1` (con `::before`) y usa el logo `DEVTOOLS_`. Los otros usan `devtools`.
- Contraste: todo el texto sobre `--bg`, `--surface` y `--disp` cumple AA. Se verifica con Lighthouse y axe en los 3 temas.

### Pantalla de arranque

- Solo con `data-theme="terminal"`, y solo una vez por sesión (`sessionStorage.booted`).
- Se salta con cualquier tecla, clic o toque. Con `prefers-reduced-motion`, no se muestra.
- La cuenta de herramientas ("N tools loaded") se genera desde el registro.
- Se decide en el mismo script en línea del `<head>`, para que no aparezca y luego desaparezca.

## 6. Interfaz

### Layout

- **Escritorio (≥ 900px):** sidebar a la izquierda, 264 px desplegada y 76 px plegada, y el contenido con un máximo de 1000 px.
- **Móvil (< 900px):** cabecera de 60 px (menú, logo, buscar). El menú abre la sidebar como panel lateral con fondo oscurecido, que se cierra con Esc, al tocar fuera o al navegar. Margen lateral de 16 px y sin scroll horizontal.

### Sidebar

- De arriba abajo: logo + botón de plegar, Inicio, grupo **Favoritos** (solo si hay alguno), las 7 categorías (Generadores, Codificación, Texto y datos, Identificadores, Conversores, Azar, Referencia) con icono y contador, y en el pie el selector de tema y ES/EN.
- Las categorías son acordeones. Por defecto se abre la de la herramienta actual. Las abiertas se guardan en `localStorage`.
- La herramienta actual lleva `aria-current="page"` y el estilo con relleno de acento.
- **Plegada:** solo iconos, con tooltip. Al pasar el ratón por una categoría, o al darle foco y Enter, aparece un menú flotante con sus herramientas. El estado se guarda en `localStorage`.
- Las categorías vacías (Identificadores, Azar y Referencia, hasta el subproyecto 2) **no se muestran**.
- **Identificadores** (EN: *Identifiers*, id `ids`) agrupa documentos y códigos oficiales: DNI/NIE, CIF, IBAN, matrículas, NSS… De momento solo cubre formatos de España. Lo indican la descripción de la categoría (visible en el catálogo de la Home y en el menú flotante) y la de cada herramienta ("formato español"). El nombre no se ata a un país, así que en el futuro se pueden añadir otros sin renombrar nada. Las URLs de estas herramientas incluyen el país solo cuando aporta búsquedas (`/es/validador-dni-nie`, `/en/spanish-dni-nie-validator`).

### Home

1. `h1` "¿Qué necesitas hoy?" / "What do you need today?", una línea con el número de herramientas y la nota de privacidad, y un campo de búsqueda grande que abre la paleta de comandos con el texto ya escrito. Debajo, chips de tareas rápidas que enlazan a herramientas.
2. **Usadas hace poco:** las 4 últimas herramientas abiertas (de `localStorage`). La primera visita muestra "Empieza por aquí" con JSON, UUID, JWT y Base64.
3. **Todas las herramientas:** catálogo por categoría, en HTML estático con enlaces normales.

### Paleta de comandos (Ctrl+K, `/`)

- Diálogo modal (`<dialog>`) con input y lista de resultados.
- Busca en `name`, `description` y `keywords` de **los dos idiomas**, y muestra los resultados en el idioma actual.
- Búsqueda difusa propia (`lib/search.ts`) por subsecuencia, con puntuación por prefijo, límite de palabra y tolerancia a una transposición. Sin dependencias.
- Con el input vacío, muestra Favoritos y Recientes.
- ↑/↓ para moverse, Enter para abrir, Esc para cerrar. El foco queda atrapado dentro y vuelve al disparador al cerrar.

### Página de herramienta (`ToolShell`)

De arriba abajo:
1. Ruta (Inicio / Categoría).
2. `h1` con el nombre.
3. Descripción de una línea.
4. Botón de favorito (estrella, `aria-pressed`).
5. `Segmented` con las pestañas de modo, si las hay.
6. Panel de trabajo (`--surface`, `--radius-lg`).
7. Debajo, el contenido SEO (h2 + párrafos + FAQ si existe).

Reglas del patrón:
- **Los resultados siempre van en `Display`**, la pantalla hundida con texto `--disp-text`, también en el tema claro.
- **El resultado se calcula mientras escribes** (con debounce de 150 ms solo si el cálculo es pesado: diff, hash de archivos, regex con textos largos). El botón primario naranja queda para acciones que *crean* algo (Generar).
- Estados vacíos con una instrucción concreta ("Escribe o pega un DNI o NIE…"), nunca en blanco.
- Los errores dicen qué pasa y cómo arreglarlo ("Letra incorrecta: para este número es Z").

### Kit de UI (`src/ui/`)

| Componente | Descripción |
|---|---|
| `Button` | Variantes `primary`, `secondary`, `ghost` e `icon`. 44 px de alto. `:active` → `scale(.97)` en 120 ms. Icono opcional |
| `Segmented` | Radiogroup o tablist en píldora hundida (`--well`, sombra interior). Flechas para moverse |
| `Field` | Etiqueta, control, ayuda y error, conectados con `aria-describedby` |
| `TextArea`, `NumberInput`, `Select`, `Toggle` | Controles con los tokens. `TextArea` con opción de fuente mono y autoajuste de altura |
| `Display` | Variantes `value` (lectura grande), `list` (filas con copiar), `kv` (tabla clave-valor) y `code` (bloque con resaltado mínimo). Lleva `role="status"` y `aria-live="polite"` en la variante `value` |
| `Led` | `ok`, `bad`, `idle`, siempre con texto al lado. Destello de 400 ms al cambiar |
| `CopyButton` | Copia, cambia a "Copiado" durante 1,6 s y lanza el aviso |
| `Toaster` | Isla global, un aviso a la vez, abajo a la derecha (abajo centrado en móvil). `role="status"` |
| `FileDrop` | Zona para soltar archivos o hacer clic (Base64 y Hash) |

### Movimiento

| Qué | Cómo | Especificación |
|---|---|---|
| Plegar sidebar | Anima el ancho; las etiquetas se desvanecen antes de que se cierre el hueco | width 280 ms cubic-bezier(.2,.8,.2,1) |
| Cambiar de herramienta | View transition en el área principal; la sidebar queda quieta | 200 ms, fundido + 8 px |
| Pulsar un botón | Se hunde como una tecla | scale(.97) 120 ms ease-out |
| Copiar | Cambio de etiqueta + aviso | aviso 180 ms entrada, 1,6 s visible |
| LED | Cambio de color + pulso de brillo | color 160 ms, brillo 400 ms |
| Acordeón de categoría | Altura con `slide` de Svelte | 200 ms |

Con `prefers-reduced-motion: reduce`, todo pasa a transiciones de 0 ms o fundidos cortos, sin desplazamientos.

### Atajos

- `Ctrl/⌘+K` o `/`: abrir la paleta.
- `Ctrl/⌘+Shift+C`: copiar el resultado principal de la herramienta. Cada herramienta lo declara registrando un proveedor en `shortcuts.ts`.
- `Alt+1…9`: cambiar de pestaña de modo.
- `?`: diálogo con la lista de atajos.
- No se activan mientras se escribe en un campo, salvo Ctrl/⌘+K y Ctrl/⌘+Shift+C.

### Estado persistente (`lib/storage.ts`)

Claves bajo el prefijo `devtools:`:
- `theme`, `locale`, `sidebar.collapsed`, `sidebar.open` (categorías abiertas), `favorites` (ids), `recent` (ids, máximo 8).
- `input.<toolId>`: último input, si `rememberInput` no es `false` y el usuario no lo ha desactivado con el toggle "Recordar lo que escribo" del panel.

Todas las lecturas y escrituras van envueltas en try/catch, con valores por defecto. La web funciona igual con el almacenamiento bloqueado.

### Accesibilidad

- Toda la web se puede usar con teclado y el foco es visible (anillo `0 0 0 4px` de acento al 15 %, más el borde de acento).
- Botones de al menos 44×44 px. El color nunca es la única señal: el LED siempre va con texto.
- `aria-live` en los resultados principales.
- Estructura de encabezados correcta: un `h1` por página.
- `lang` en `<html>`.

## 7. Las 14 herramientas

Mejoras comunes a todas: cálculo en vivo, resultados en `Display`, copiar por resultado, input recordado (§6) y la lógica actual conservada y ampliada.

| id | Categoría | Pestañas | Cambios |
|---|---|---|---|
| `uuid` | gen | Generar · Validar | v4, **v7**, **ULID** y **NanoID** (longitud y alfabeto configurables). Cantidad 1–500. Mayúsculas y guiones como `Toggle`. Validar detecta tipo y versión y, en v7 y ULID, muestra la fecha que llevan codificada |
| `lorem` | gen | Párrafos · Frases · Palabras | Opción "empezar con Lorem ipsum…" y salida como texto o `<p>` HTML |
| `base64` | enc | Texto · Archivo | Detección automática de la dirección (con opción de fijarla manualmente). Variante URL-safe. Archivo → data URI y Base64 → descarga de archivo |
| `url` | enc | Codificar · Analizar URL | Detección de dirección. Modos `encodeURIComponent` y `encodeURI`. Analizar URL desglosa protocolo, host, puerto, ruta, hash y una tabla de query params ya decodificados |
| `html-entities` | enc | — | Detección de dirección. Modo "mínimo" (`& < > " '`) o "todo lo no-ASCII" |
| `jwt` | enc | — | Cabecera y payload en `Display code`. `exp`, `iat` y `nbf` como fecha local + relativa, con LED vigente/caducado/aún no válido. Aviso fijo de que la firma no se verifica. `rememberInput: false` |
| `hash` | enc | Texto · Archivo | MD5 (implementación propia en `logic.ts`, con tests contra vectores conocidos), SHA-1, SHA-256, SHA-384 y SHA-512 (WebCrypto). Campo "comparar con" y LED de coincidencia. `rememberInput: false` |
| `json` | data | Formatear · Árbol | Indentación 2, 4 o tab. Minificar. Ordenar claves. Los errores muestran línea y columna y marcan la línea en el editor. El árbol es plegable, con copiar ruta y valor |
| `diff` | data | — | Vista unificada o en paralelo. Diferencias por palabra dentro de las líneas cambiadas. Ignorar espacios y mayúsculas. Contador de líneas añadidas y quitadas |
| `regex` | data | Buscar · Reemplazar | Coincidencias resaltadas en el texto. Tabla de grupos (con nombre incluido). Flags como toggles. Chuleta plegable. Errores de sintaxis explicados |
| `text` | data | Mayúsculas · Líneas | *Mayúsculas:* todas las conversiones a la vez (UPPER, lower, Title, Sentence, camel, Pascal, snake, CONSTANT, kebab, dot), cada una con su copiar. *Líneas:* ordenar (A-Z, Z-A, natural), invertir, quitar duplicados y vacías, recortar, numerar. Conteo de caracteres, palabras, líneas y bytes siempre visible |
| `timestamp` | conv | — | Reloj Unix en vivo (s y ms, cada uno con su copiar). Detección de s o ms. Salida a la vez en ISO 8601, local, UTC y relativo. Selector de zona horaria (`Intl`). Fecha → timestamp |
| `color` | conv | — | Selector visual nativo. HEX, RGB, HSL y **OKLCH** editables y sincronizados. Contraste WCAG contra blanco y negro con resultado AA/AAA |
| `number-base` | conv | — | Binario, octal, decimal y hexadecimal editables y sincronizados, más una base personalizada 2–36. BigInt para números de cualquier tamaño. Agrupación opcional de dígitos |

Categorías con herramientas en este subproyecto: Generadores, Codificación, Texto y datos y Conversores. El resto aparece en el subproyecto 2.

## 8. SEO

- Por página: `<title>` (`meta.title`), meta description, `canonical`, `hreflang` es/en/x-default, Open Graph y Twitter card con la imagen genérica `/og.png`.
- JSON-LD `WebApplication` (con `applicationCategory: DeveloperApplication`, `offers` gratis e `inLanguage`) en cada herramienta, más `FAQPage` si `meta.faq` existe. En la Home, `WebSite` con `SearchAction`.
- `@astrojs/sitemap` con las alternativas i18n. `robots.txt` que apunta al sitemap.
- Contenido por herramienta: `content.<locale>.md` con 2–4 párrafos útiles (qué es, cómo funciona, casos de uso). Sin relleno ni frases de marketing.
- Las URLs antiguas (`/#uuid`, etc.): el script de `/` detecta un hash conocido y redirige a la herramienta equivalente en el idioma elegido.

## 9. Rendimiento

- Home: JS inicial < 30 KB gzip (paleta, tema y controles de la sidebar).
- La isla de cada herramienta solo se descarga en su página.
- Fuentes con `font-display: swap` y precarga solo de las del tema activo. Los subsets latinos alcanzan.
- Objetivo: Lighthouse ≥ 95 en las 4 categorías, en Home y en `/es/…json`, con los temas terminal y light.

## 10. Tests y CI

- **Vitest:** `logic.test.ts` por herramienta, con los tests actuales migrados y los nuevos (v7, ULID, NanoID, MD5 con vectores RFC 1321, OKLCH, BigInt, diff por palabra, detección de dirección en Base64/URL/entities, análisis de URL, conversiones de mayúsculas). Tests de `lib/search.ts`, `lib/storage.ts` (con el almacenamiento bloqueado) e i18n.
- **Test de registro:** cada `meta` tiene todos los campos en ambos idiomas; los slugs son únicos por idioma; el icono existe; hay `content.es.md` y `content.en.md`; los diccionarios de interfaz tienen las mismas claves.
- **Playwright** (Chromium, contra `astro preview`):
  1. `/` redirige a `/es` o `/en`.
  2. La Home muestra el catálogo.
  3. Ctrl+K → escribir "json" → Enter abre la herramienta.
  4. El tema elegido persiste tras recargar y no hay parpadeo.
  5. ES → EN mantiene la herramienta.
  6. Plegar la sidebar persiste al navegar.
  7. La pantalla de arranque sale una vez por sesión y se salta con una tecla.
  8. El JSON se formatea al escribir.
- **CI:** `pnpm lint`, `astro check`, `pnpm test`, `pnpm build` y `pnpm test:e2e`.

## 11. Riesgos y decisiones abiertas

- **Estado en View Transitions:** las islas persistentes y el script de tema deben volver a aplicarse tras cada navegación (`astro:after-swap`). Es un riesgo conocido; lo cubre el test e2e 4.
- **Tamaño de MD5 propio:** unas 100 líneas; se prefiere a meter una dependencia.
- **Contenido SEO en EN y ES:** lo redacta Claude en la implementación y lo revisa el autor. No bloquea el lanzamiento.
- **Redirección de `/` en el cliente:** Google indexa `/es` y `/en` por los enlaces y `hreflang`. `/` queda como x-default.
