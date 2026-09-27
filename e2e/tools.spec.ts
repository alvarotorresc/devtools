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
    // No test ever downloads the real ECB rates (lote 2, currency).
    await page.route('**/api.frankfurter.dev/**', (r) => r.abort());
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
      localStorage.setItem('devtools:regex.running', '1');
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

  // CIF remembers input by default (it is public), so it cannot use nothingStored: a key
  // containing "cif" legitimately exists. A positive control shows persistence works at all,
  // which makes the negative check on the DNI-shaped line mean something.
  test('cif remembers a plain CIF but never a DNI pasted alongside one', async ({ page }) => {
    await page.goto('/es/validador-cif');
    await page.locator('#cif-input').fill('B65410011');
    await expect
      .poll(async () =>
        page.evaluate(() => Object.values(localStorage).some((v) => v.includes('B65410011'))),
      )
      .toBe(true);

    await page.locator('#cif-input').fill('B65410011\n12345678Z');
    await page.waitForTimeout(500);
    const leaked = await page.evaluate(() =>
      Object.values(localStorage).some((v) => v.includes('12345678Z')),
    );
    expect(leaked).toBe(false);
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

  test('nss shows the province and the right control, and stores nothing', async ({ page }) => {
    await page.goto('/es/validador-numero-seguridad-social');
    await page.locator('#nss-input').fill('28/12345678/40');
    await expect(page.locator('.display-head')).toContainText('Número válido');
    await expect(page.locator('.display-kv')).toContainText('Madrid');
    await page.locator('#nss-input').fill('281234567841');
    await expect(page.getByText('debería ser 40')).toBeVisible();
    await nothingStored(page, 'nss', '281234567841');
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

  test('phone classifies a mobile, prints E.164 and stores nothing', async ({ page }) => {
    await page.goto('/es/validador-telefonos-espana');
    await page.locator('#phone-input').fill('+34 612 34 56 78');
    await expect(page.locator('.display-head')).toContainText('Móvil');
    await expect(page.locator('.display-value')).toHaveText('+34612345678');
    await nothingStored(page, 'phone', '612 34 56 78');
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
    // C1 regression: the headline used to ship raw `{p}`/`{k}` placeholders instead of the count.
    await expect(page.locator('.display-head')).toHaveText('10 personas en 4 equipos');
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

  test('iva points a bad custom rate at the rate field, not the amount', async ({ page }) => {
    await page.goto('/es/calculadora-iva');
    await page.locator('#iva-amount').fill('100');
    await radio(page, 'Otro').click();
    await page.locator('#iva-rate-other').fill('abc');
    // I1: the rate error shows under the rate field, and the amount (which is fine) shows none.
    await expect(page.locator('#iva-rate-other-error')).toHaveText(
      'Escribe un porcentaje de 0 a 100, por ejemplo 7.',
    );
    await expect(page.locator('#iva-amount-error')).toHaveCount(0);
    await expect(page.locator('.display-head')).toHaveText('Corrige el campo marcado.');
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
    // I1: the error shows once, under the field. The headline goes neutral instead of repeating
    // it (it used to show the same sentence twice).
    await expect(page.getByText('No hay variación porcentual desde 0')).toHaveCount(1);
    await expect(page.locator('.display-head')).toHaveText('Corrige el campo marcado.');
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

  test('rule-of-three flags a 0 divisor as an error in the headline (Minor 8)', async ({
    page,
  }) => {
    await page.goto('/es/regla-de-tres');
    await page.locator('#rot-a').fill('0');
    await page.locator('#rot-b').fill('10');
    await page.locator('#rot-c').fill('5');
    const head = page.locator('.display-head');
    await expect(head).toContainText('A no puede ser 0: no se puede dividir entre 0.');
    await expect(head.locator('.zero-error')).toBeVisible();
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

  // The brief's version of this test assumed every external image is blocked by default; Task 6's
  // review round only blocks images that resolve (against document.baseURI) to a different
  // origin, so a same-origin `src=x` still loads (and 404s, harmlessly: this fixture only fails on
  // an uncaught page error, not on a failed request). It also assumed `http:example.com` would be
  // external, but on this http e2e server that string parses as same-origin (see sanitize.ts's
  // isExternalSrc doc comment): `https:example.com/x` is the form that actually crosses origins
  // here, so that is what exercises the block. This also covers the review round's later
  // additions: popover/popovertarget/name in FORBID_ATTR and data-*/id/dialog stripped.
  test('markdown renders GFM, strips every script vector and blocks a cross-origin image', async ({
    page,
  }) => {
    const toExampleCom: string[] = [];
    await page.route('**/example.com/**', (r) => r.abort());
    page.on('request', (r) => {
      if (r.url().includes('example.com')) toExampleCom.push(r.url());
    });
    await page.goto('/es/vista-previa-markdown');
    await page
      .locator('#markdown-input')
      .fill(
        [
          '# Hola',
          '',
          '<img src=x onerror="window.__xss=1">',
          '',
          '<script>window.__xss2=1</script>',
          '',
          '[x](javascript:alert(1)) <iframe src="https://example.com"></iframe>',
          '',
          '<img src="https:example.com/x">',
          '',
          '<div data-copy-main id="fake">redress</div>',
          '',
          '<a href="#" name="shadow">named</a>',
          '',
          '<dialog open>hi</dialog>',
        ].join('\n'),
      );
    await expect(page.locator('.md-preview h1')).toHaveText('Hola');
    await expect(page.locator('.md-preview img.md-blocked')).toHaveCount(1);
    expect(await page.evaluate(() => '__xss' in window || '__xss2' in window)).toBe(false);
    await expect(page.locator('.md-preview script')).toHaveCount(0);
    await expect(page.locator('.md-preview [onerror]')).toHaveCount(0);
    await expect(page.locator('.md-preview a[href^="javascript"]')).toHaveCount(0);
    await expect(page.locator('.md-preview iframe')).toHaveCount(0);
    await expect(page.locator('.md-preview [data-copy-main]')).toHaveCount(0);
    await expect(page.locator('.md-preview [id]')).toHaveCount(0);
    await expect(page.locator('.md-preview [name]')).toHaveCount(0);
    await expect(page.locator('.md-preview [popover]')).toHaveCount(0);
    await expect(page.locator('.md-preview dialog')).toHaveCount(0);
    await expect(page.locator('.md-preview img.md-blocked')).not.toHaveAttribute('src');
    await expect(page.getByText('Imagen externa sin cargar: 1.')).toBeVisible();
    expect(toExampleCom).toEqual([]);
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

  // The review round hides "La más alta que cumple" when no entered version is valid (it used to
  // key that off whether the versions list was non-empty, so two invalid entries still showed it
  // next to "Ninguna", which reads as if there were a candidate).
  test('semver checks versions against a caret range and hides the best match once all are invalid', async ({
    page,
  }) => {
    await page.goto('/es/comprobar-rango-semver');
    await page.locator('#semver-range').fill('^1.2.3');
    await page.locator('#semver-versions').fill('1.2.3\n1.9.0\n2.0.0');
    await expect(page.getByText('2 de 3 cumplen')).toBeVisible();
    await expect(page.locator('.panel .display-kv')).toContainText('>=1.2.3 <2.0.0-0');
    await page.locator('#semver-versions').fill('foo\nbar');
    await expect(page.getByText('La más alta que cumple')).toHaveCount(0);
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
