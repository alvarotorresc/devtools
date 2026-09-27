// ===== Capturas del README =====
//
// Copia una selección de media/out/ a .github/readme/ reducida a 1280×800, en los dos idiomas
// (README.md usa -es, README.en.md usa -en). Estas sí van al repo. Se reescala en Chromium (factor de escala 0,8)
// para no depender de ImageMagick. Va después de shots.mjs.

import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { OUT, REPO_ROOT, checkSize, chromium } from './lib.mjs';

const DEST = join(REPO_ROOT, '.github', 'readme');
const W = 1280;
const H = 800;

// nombre en .github/readme  <-  prefijo de la escena en media/out
const PICKS = [
  ['home', 'cover'],
  ['json', 'tool-12-json'],
  ['jwt', 'tool-10-jwt'],
  ['iban', 'tool-23-iban'],
  ['irpf', 'tool-40-irpf'],
  ['cron', 'tool-49-cron'],
];

async function main() {
  const files = await readdir(OUT);
  await mkdir(DEST, { recursive: true });
  const browser = await chromium.launch();
  try {
    // La captura es de 1600×1000: abrirla tal cual con un factor de escala de 0,8 da 1280×800.
    const page = await browser.newPage({
      viewport: { width: 1600, height: 1000 },
      deviceScaleFactor: W / 1600,
    });
    for (const lang of ['es', 'en']) {
      for (const [name, prefix] of PICKS) {
        const src = `${prefix}-${lang}.png`;
        if (!files.includes(src))
          throw new Error(`${src}: no existe en ${OUT}; ejecuta antes shots.mjs`);
        await page.goto(pathToFileURL(join(OUT, src)).href);
        await page.addStyleTag({ content: 'body{margin:0} img{display:block}' });
        const buf = await page.screenshot();
        const out = join(DEST, `${name}-${lang}.png`);
        checkSize(buf, out, W, H);
        await writeFile(out, buf);
        console.log(`OK    .github/readme/${name}-${lang}.png`);
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
