// ===== Runner de capturas de media/shots =====
//
// Orden de uso: shots -> labels -> promo (o todo junto: `node media/shots/all.mjs`).
//
// Construye el sitio, lo sirve en :4790, descubre las herramientas desde el sidebar y hace una
// captura por escena e idioma. Una escena que falla no para a las demás: se registra y el
// proceso sale con código 1 al final. Servidor y navegador se paran siempre.
//
// Flags:
//   --only <prefijo>   solo las escenas cuyo fichero empiece por ese prefijo (cover, tool-json…)
//   --lang es|en       solo ese idioma (por defecto, los dos)
//   --no-build         reutiliza el dist/ que ya haya
import { join } from 'node:path';
import {
  OUT,
  SIZES,
  buildSite,
  capture,
  chromium,
  discoverTools,
  hydrated,
  openPage,
  settle,
  startServer,
} from './lib.mjs';
import { buildScenes } from './scenes.mjs';

const BROWSER_LANG = { es: 'es-ES', en: 'en-US' };

function parseArgs(argv) {
  const args = { only: null, lang: null, build: true };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--only') args.only = argv[++i];
    else if (argv[i] === '--lang') args.lang = argv[++i];
    else if (argv[i] === '--no-build') args.build = false;
  }
  return args;
}

async function main() {
  const { only, lang, build } = parseArgs(process.argv.slice(2));
  const langs = lang ? [lang] : ['es', 'en'];
  if (build) buildSite();

  const server = await startServer();
  const fallos = [];
  let browser;

  try {
    browser = await chromium.launch();
    const tools = await discoverTools(browser, server.url);
    await browser.close();
    const all = buildScenes(tools);
    const scenes = only ? all.filter((s) => s.file.startsWith(only)) : all;
    if (scenes.length === 0) throw new Error(`Ninguna escena empieza por "${only}"`);

    for (const idioma of langs) {
      // Un navegador por idioma: los <input type="date"> y los formatos nativos siguen el idioma
      // del navegador, no el `locale` del contexto.
      const loc = BROWSER_LANG[idioma];
      browser = await chromium.launch({
        args: [`--lang=${loc}`],
        env: {
          ...process.env,
          LANGUAGE: loc.replace('-', '_'),
          LANG: `${loc.replace('-', '_')}.UTF-8`,
        },
      });
      for (const escena of scenes) {
        const nombre = `${escena.file}-${idioma}`;
        let page;
        try {
          page = await openPage(browser, {
            lang: idioma,
            theme: escena.theme,
            mobile: escena.mobile === true,
            storage: escena.storage,
          });
          await page.goto(server.url + escena.path[idioma]);
          await hydrated(page);
          if (escena.prep) await escena.prep(page, idioma);
          // Varias herramientas recalculan con un debounce de 300 ms.
          await page.waitForTimeout(400);
          await settle(page, { keepScroll: escena.keepScroll === true });
          if (escena.after) await escena.after(page, idioma);
          const size = escena.mobile ? SIZES.mobile : SIZES.desktop;
          await capture(page, join(OUT, `${nombre}.png`), {
            ...size,
            lang: idioma,
            theme: escena.theme,
          });
          console.log(`OK    ${nombre}  (${escena.theme})`);
        } catch (err) {
          fallos.push(nombre);
          console.error(`FALLO ${nombre}: ${err.message.split('\n')[0]}`);
        } finally {
          await page?.context().close();
        }
      }
      await browser.close();
    }
  } finally {
    await browser?.close();
    await server.stop();
  }

  if (fallos.length > 0) {
    console.error(`\n${fallos.length} escena(s) con fallo: ${fallos.join(', ')}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
