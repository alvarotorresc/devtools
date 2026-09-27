// ===== Librería común de media/shots =====
//
// Capturas deterministas de devtools para la ficha de portfolio en alvarotc.com y para el
// README. No es un paquete aparte: usa el @playwright/test que ya trae el repo (el mismo
// Chromium de los e2e) y el `dist/` que genera `pnpm build`.
//
// Piezas, en el orden en que las usa un script:
//   buildSite()      -- `astro build` (se salta con --no-build).
//   startServer()    -- `astro preview` en :4790, lanzado por nosotros y matado por PID.
//   discoverTools()  -- lee del sidebar ya construido la lista real de herramientas.
//   openPage()       -- contexto con viewport, tema, reloj fijo, red cortada y sin animaciones.
//   settle()         -- espera a hidratación, fuentes e imágenes; quita foco y ratón.
//   capture()        -- pasa las guardas y escribe el PNG.

import { chromium } from '@playwright/test';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
// media/shots/lib.mjs -> la raíz del repo está dos niveles arriba.
export const REPO_ROOT = join(AQUI, '..', '..');
export const OUT = join(REPO_ROOT, 'media', 'out');
export const SITE = 'https://devtools.alvarotc.com';

export { chromium };

const PUERTO = 4790;
export const URL_BASE = `http://localhost:${PUERTO}`;

// Hora fija para todo lo que depende del reloj (timestamp en vivo, cron, días hábiles,
// fecha de los tipos de cambio): lunes 28 de septiembre de 2026, 10:30 en Madrid.
export const FIXED_NOW = new Date('2026-09-28T08:30:00Z');

// Tipos del BCE ficticios pero verosímiles. La app nunca llama a la API real durante las
// capturas: la ruta se intercepta en openPage().
const ECB_RATES = {
  amount: 1,
  base: 'EUR',
  date: '2026-09-25',
  rates: {
    USD: 1.1732,
    GBP: 0.8741,
    JPY: 173.62,
    CHF: 0.9368,
    MXN: 21.584,
    CAD: 1.6254,
    AUD: 1.7813,
    SEK: 11.002,
    NOK: 11.695,
    PLN: 4.2651,
  },
};

export function buildSite() {
  const res = spawnSync('pnpm', ['build'], { cwd: REPO_ROOT, stdio: 'inherit' });
  if (res.status !== 0) throw new Error('pnpm build ha fallado');
}

async function responde(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1000) });
    return res.status < 600;
  } catch {
    return false;
  }
}

// Siempre arranca su propio servidor. Si el puerto ya responde, falla: podría ser el preview
// de otro checkout y fotografiaríamos otra versión del sitio sin darnos cuenta.
export async function startServer() {
  if (await responde(URL_BASE)) {
    throw new Error(`Ya hay algo escuchando en ${URL_BASE}; ciérralo antes de capturar.`);
  }
  // node directo sobre astro.js (no `pnpm exec`): así el PID que matamos es el del servidor y no
  // el de un envoltorio que dejaría al hijo huérfano. `detached` crea su propio grupo para poder
  // matar también cualquier subproceso con process.kill(-pid).
  const proc = spawn(
    process.execPath,
    [
      join(REPO_ROOT, 'node_modules', 'astro', 'bin', 'astro.mjs'),
      'preview',
      '--port',
      String(PUERTO),
      '--ignore-lock',
    ],
    { cwd: REPO_ROOT, stdio: 'ignore', detached: true },
  );
  const stop = async () => {
    if (proc.exitCode !== null) return;
    try {
      process.kill(-proc.pid, 'SIGTERM');
    } catch {
      proc.kill('SIGTERM');
    }
    await new Promise((resolve) => {
      if (proc.exitCode !== null) return resolve();
      proc.once('exit', resolve);
      setTimeout(resolve, 3000);
    });
  };
  const inicio = Date.now();
  while (Date.now() - inicio < 30000) {
    if (await responde(`${URL_BASE}/es`)) return { url: URL_BASE, stop };
    await new Promise((r) => setTimeout(r, 200));
  }
  await stop();
  throw new Error(`astro preview no respondió en ${URL_BASE}`);
}

// Lista real de herramientas, sacada del sitio construido (el sidebar las pinta todas, en el
// orden del registro). registry.ts no se puede importar desde Node sin compilar, y así nunca
// se desincroniza: una herramienta nueva sin escena hace fallar el runner.
export async function discoverTools(browser, baseUrl) {
  const page = await browser.newPage();
  await page.route('**/analytics.alvarotc.com/**', (r) => r.abort());
  const porIdioma = {};
  for (const lang of ['es', 'en']) {
    await page.goto(`${baseUrl}/${lang}`);
    porIdioma[lang] = await page.evaluate(() => {
      const vistos = new Map();
      for (const cat of document.querySelectorAll('#sidebar [data-cat]')) {
        const catName = cat.querySelector('.sb-cat-toggle .sb-label')?.textContent?.trim() ?? '';
        for (const a of cat.querySelectorAll('a[data-tool-id]')) {
          const id = a.dataset.toolId;
          if (vistos.has(id)) continue;
          vistos.set(id, {
            id,
            category: cat.dataset.cat,
            categoryName: catName,
            href: a.getAttribute('href'),
            name: a.textContent.trim(),
          });
        }
      }
      return [...vistos.values()];
    });
  }
  await page.close();
  return porIdioma.es.map((t) => {
    const en = porIdioma.en.find((x) => x.id === t.id);
    if (!en) throw new Error(`${t.id}: no aparece en el sidebar en inglés`);
    return {
      id: t.id,
      category: t.category,
      categoryName: { es: t.categoryName, en: en.categoryName },
      name: { es: t.name, en: en.name },
      path: { es: t.href, en: en.href },
    };
  });
}

const VIEWPORTS = {
  desktop: { width: 1600, height: 1000, deviceScaleFactor: 1 },
  mobile: { width: 360, height: 780, deviceScaleFactor: 3 },
};

export const SIZES = {
  desktop: { width: 1600, height: 1000 },
  mobile: { width: 1080, height: 2340 },
};

// Congela animaciones y transiciones: cada animación salta a su fotograma final (con su
// fill-mode) en vez de apagarse a medias. Sin barras de scroll ni cursor de texto: son ruido en
// una captura y cambian entre ejecuciones.
const FREEZE_CSS = `
*, *::before, *::after {
  animation-delay: -1ms !important;
  animation-duration: 1ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
  scroll-behavior: auto !important;
  caret-color: transparent !important;
}
html { scrollbar-width: none !important; }
::-webkit-scrollbar { display: none !important; }
#boot { display: none !important; }
.toast, .toaster { display: none !important; }
`;

// PRNG fijo para crypto.getRandomValues y randomUUID: los generadores sin semilla (UUID,
// contraseñas, ruleta) dan el mismo resultado en cada ejecución. Solo existe en el navegador
// de las capturas; la app sigue usando el crypto real.
function seededCrypto() {
  let s = 0x9e3779b9;
  const next = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (t ^ (t >>> 14)) >>> 0;
  };
  const fill = (arr) => {
    const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
    for (let i = 0; i < bytes.length; i++) bytes[i] = next() & 0xff;
    return arr;
  };
  Object.defineProperty(crypto, 'getRandomValues', { value: fill, configurable: true });
  Object.defineProperty(crypto, 'randomUUID', {
    configurable: true,
    value: () => {
      const b = fill(new Uint8Array(16));
      b[6] = (b[6] & 0x0f) | 0x40;
      b[8] = (b[8] & 0x3f) | 0x80;
      const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
      return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    },
  });
}

// Crea el contexto y una página en blanco; quien llama hace el goto().
export async function openPage(
  browser,
  { lang = 'es', theme = 'light', mobile = false, storage = {} } = {},
) {
  const vp = mobile ? VIEWPORTS.mobile : VIEWPORTS.desktop;
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.deviceScaleFactor,
    isMobile: mobile,
    hasTouch: mobile,
    reducedMotion: 'reduce',
    locale: lang === 'es' ? 'es-ES' : 'en-US',
    timezoneId: 'Europe/Madrid',
  });

  await context.route('**/analytics.alvarotc.com/**', (r) => r.abort());
  await context.route('**/api.frankfurter.dev/**', (r) => r.fulfill({ json: ECB_RATES }));

  // El tema se lee de localStorage en un script inline del <head>, antes de la primera pintura;
  // el idioma va en la ruta (/es, /en). `booted` evita la pantalla de arranque del tema terminal.
  await context.addInitScript(
    ({ theme, storage }) => {
      try {
        localStorage.setItem('devtools:theme', theme);
        for (const [k, v] of Object.entries(storage)) localStorage.setItem(`devtools:${k}`, v);
        sessionStorage.setItem('devtools:booted', '1');
      } catch {
        // Sin almacenamiento la app cae a sus valores por defecto; lo detecta la guarda de tema.
      }
    },
    { theme, storage },
  );
  await context.addInitScript(seededCrypto);
  await context.addInitScript((css) => {
    const inserta = () => {
      const estilo = document.createElement('style');
      estilo.dataset.media = 'freeze';
      estilo.textContent = css;
      document.head.appendChild(estilo);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inserta, { once: true });
    } else {
      inserta();
    }
  }, FREEZE_CSS);

  const page = await context.newPage();
  await page.clock.setFixedTime(FIXED_NOW);
  return page;
}

// Hidratación: Astro quita el atributo `ssr` de cada isla al montarla. Un fill antes de eso se
// pierde en silencio (ver e2e/smoke.spec.ts).
export async function hydrated(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => document.querySelectorAll('astro-island[ssr]').length === 0);
}

// Con la página ya navegada (y preparada): espera a que nada pueda mover un píxel y deja el
// punto de partida limpio: sin foco, sin ratón encima de nada y, salvo keepScroll, arriba.
export async function settle(page, { keepScroll = false } = {}) {
  await hydrated(page);
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('img'))
      .filter((img) => {
        const r = img.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && !img.classList.contains('md-blocked');
      })
      .every((img) => img.complete && img.naturalWidth > 0),
  );
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  if (!keepScroll) await page.evaluate(() => window.scrollTo(0, 0));
  await page.mouse.move(0, 0);
  // Dos frames: que se apliquen los estilos tras el blur y el scroll.
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(true)))),
  );
}

function falla(outPath, guarda) {
  throw new Error(`${basename(outPath)}: guarda "${guarda}" no ha pasado`);
}

// Guardas: idioma y tema pedidos, texto sin undefined/NaN/[object, dos capturas seguidas
// idénticas y dimensiones exactas. Si alguna falla, lanza y no escribe nada.
export async function capture(page, outPath, { width, height, lang, theme }) {
  const estado = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    theme: document.documentElement.dataset.theme,
    boot: document.documentElement.dataset.boot ?? null,
    text: document.body.innerText,
  }));
  if (estado.lang !== lang) falla(outPath, `idioma (${estado.lang})`);
  if (estado.theme !== theme) falla(outPath, `tema (${estado.theme})`);
  // Una plantilla sin rellenar ({n}, {p}…) también es texto roto.
  if (/\bundefined\b|\bNaN\b|\[object |\{[a-z]\}/.test(estado.text)) falla(outPath, 'texto-roto');

  const captura1 = await page.screenshot({ animations: 'disabled', caret: 'hide' });
  const captura2 = await page.screenshot({ animations: 'disabled', caret: 'hide' });
  const hash1 = createHash('sha256').update(captura1).digest('hex');
  const hash2 = createHash('sha256').update(captura2).digest('hex');
  if (hash1 !== hash2) falla(outPath, 'hash-estable');

  checkSize(captura1, outPath, width, height);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, captura1);
}

// Cabecera PNG: firma de 8 bytes, chunk IHDR y ahí ancho y alto (bytes 16-19 y 20-23).
export function checkSize(buffer, outPath, width, height) {
  const w = buffer.readUInt32BE(16);
  const h = buffer.readUInt32BE(20);
  if (w !== width || h !== height)
    falla(outPath, `dimensiones (${w}x${h}, esperado ${width}x${height})`);
}
