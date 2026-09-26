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

  test('url never remembers a URL with a password', async ({ page }) => {
    await page.goto('/es/codificar-decodificar-url');
    const stored = () => page.evaluate(() => localStorage.getItem('devtools:input.url'));
    await page.locator('#url-input').fill('https://ejemplo.com');
    await expect.poll(stored).toBe('https://ejemplo.com');
    await page.locator('#url-input').fill('https://ana:s3cret@ejemplo.com');
    await expect.poll(stored).toBeNull();
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

  test('regex pauses a remembered pattern whose last run never finished', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('devtools:input.regex-pattern', '(a+)+$');
      localStorage.setItem('devtools:input.regex', 'a'.repeat(34) + '!');
      sessionStorage.setItem('devtools:regex.running', '1');
    });
    await page.goto('/es/probador-regex');
    await expect(page.locator('#regex-pattern')).toHaveValue('(a+)+$');
    await expect(
      page.getByText('La última expresión tardó demasiado y se ha pausado.'),
    ).toBeVisible();
    await page.locator('#regex-pattern').fill('a+');
    await expect(page.getByText('1 coincidencia', { exact: true })).toBeVisible();
    await expect(page.getByText('La última expresión tardó demasiado')).toHaveCount(0);
  });

  test('text shows every case and processes lines', async ({ page }) => {
    await page.goto('/es/convertir-mayusculas-minusculas');
    await page.locator('#text-input').fill('hola mundo');
    await expect(page.locator('.display-rows')).toContainText('holaMundo');
    await expect(page.locator('.display-rows')).toContainText('HOLA_MUNDO');
    // Each row's copy button is named after its case, not just "Copiar".
    await expect(page.getByRole('button', { name: 'Copiar MAYÚSCULAS' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Copiar Tipo Título' })).toBeVisible();
    await page.locator('#text-input').fill('b\na\nb');
    await radio(page, 'Líneas').click();
    await page.locator('#text-sort').selectOption('az');
    await page.getByRole('switch', { name: 'Quitar duplicadas' }).click();
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
    const warnings: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'warning') warnings.push(m.text());
    });
    await page.goto('/es/conversor-colores');
    await expect(page.locator('input[type="color"]')).toHaveValue('#58a6ff');
    await page.locator('#color-hex').fill('#ff0000');
    await expect(page.locator('#color-rgb')).toHaveValue('rgb(255, 0, 0)');
    await expect(page.locator('#color-oklch')).toHaveValue('oklch(62.8% 0.258 29.2)');
    await page.locator('#color-rgb').fill('rgb(0, 0, 0)');
    await expect(page.locator('#color-hex')).toHaveValue('#000000');
    await expect(page.locator('input[type="color"]')).toHaveValue('#000000');
    // Hydration used to strip the picker's value attribute and Chrome warned about "".
    expect(warnings.filter((w) => w.includes('valid CSS color'))).toEqual([]);
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
