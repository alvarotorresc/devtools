import { expect, test as base, type Page } from '@playwright/test';

// Never hit the real analytics from tests: it would count CI runs and add an external dependency.
const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('**/analytics.alvarotc.com/**', (r) => r.abort());
    await use(page);
  },
});

async function skipBoot(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('devtools:booted', '1'));
}

// Astro islands (CommandPalette, ShortcutsDialog, tool islands) hydrate via a dynamic
// import() the browser "load" event does not wait for, so a keyboard shortcut fired right
// after goto() can be dropped before the island's listener is attached. Astro removes the
// `ssr` attribute from an `<astro-island>` once it finishes hydrating, so waiting for no
// island to carry that attribute any more is a reliable, implementation-level hydration gate.
async function waitForIslands(page: Page) {
  await page.locator('astro-island[ssr]').first().waitFor({ state: 'detached' });
}

// On Netlify "/" is a 302 decided by _redirects. astro preview ignores that
// file, so these cover the fallback root page, which makes the same choice in
// the browser, and the #hash forwarding on the home pages.
test.describe('routing (es-ES browser)', () => {
  test.beforeEach(async ({ page }) => skipBoot(page));

  test('root sends a Spanish browser to /es', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/es$/);
  });

  test('root keeps the #hash and old /#tool links land on the tool page', async ({ page }) => {
    await page.goto('/#json');
    await expect(page).toHaveURL(/\/es\/formateador-json$/);
  });

  test('old links to migrated tools land on the new page', async ({ page }) => {
    await page.goto('/#number-base');
    await expect(page).toHaveURL(/\/es\/conversor-bases-numericas$/);
  });

  test('the home page forwards a #tool to the tool page', async ({ page }) => {
    await page.goto('/es#json');
    await expect(page).toHaveURL(/\/es\/formateador-json$/);
    await page.goto('/en#json');
    await expect(page).toHaveURL(/\/en\/json-formatter$/);
  });

  test('an unknown #hash is dropped and the home page stays', async ({ page }) => {
    await page.goto('/es#no-existe');
    await expect(page).toHaveURL(/\/es$/);
    await expect(page.locator('#home-search')).toBeVisible();
    await page.goto('/#no-existe');
    await expect(page).toHaveURL(/\/es$/);
  });

  test('visiting a page stores its language for the root, cookie included', async ({
    page,
    context,
  }) => {
    await page.goto('/en/jwt-decoder');
    await expect(page.locator('h1')).toHaveText('JWT decoder');
    const cookie = (await context.cookies()).find((c) => c.name === 'nf_lang');
    expect(cookie?.value).toBe('en');
    expect(cookie?.sameSite).toBe('Lax');
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
  });

  test('the 404 page does not overwrite the stored language', async ({ page }) => {
    await page.goto('/en');
    await page.goto('/en/no-existe');
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
  });

  test('root without JS has plain links to both languages and noindex', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'devtools en español' })).toHaveAttribute(
      'href',
      '/es',
    );
    await expect(page.getByRole('link', { name: 'devtools in English' })).toHaveAttribute(
      'href',
      '/en',
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await context.close();
  });
});

test.describe('routing (en-US browser)', () => {
  test.use({ locale: 'en-US' });
  test.beforeEach(async ({ page }) => skipBoot(page));

  test('root sends an English browser to /en', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
  });

  test('a stored language wins over the browser one', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('devtools:locale', 'es'));
    await page.goto('/');
    await expect(page).toHaveURL(/\/es$/);
  });

  test('the nf_lang cookie also counts as a stored language', async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([{ name: 'nf_lang', value: 'es', url: baseURL! }]);
    await page.goto('/');
    await expect(page).toHaveURL(/\/es$/);
  });
});

test.describe('tool page', () => {
  test('shows the heading as h1 and links to the author in the footer', async ({ page }) => {
    await skipBoot(page);
    await page.goto('/es/decodificador-jwt');
    await expect(page.locator('h1')).toHaveText('Decodificador de JWT');
    await expect(
      page.locator('.site-foot').getByRole('link', { name: 'Hecho por Álvaro Torres' }),
    ).toHaveAttribute('href', 'https://alvarotc.com');
  });
});

test.describe('category pages', () => {
  test.beforeEach(async ({ page }) => skipBoot(page));

  test('a category page has its h1, its own copy and links to every tool', async ({ page }) => {
    await page.goto('/es/calculadoras');
    await expect(page.locator('h1')).toHaveText('Calculadoras para facturas y cuentas rápidas');
    await expect(page.locator('.cat-intro p')).toHaveCount(2);
    const list = page.locator('.cat-tools');
    await expect(list.getByRole('heading', { name: 'Las 5 herramientas' })).toBeVisible();
    await expect(list.getByRole('link')).toHaveCount(5);
    const group = page.locator('#sidebar [data-cat="calc"]');
    await expect(group.locator('.sb-cat-toggle')).toHaveAttribute('aria-current', 'page');
    await expect(group.locator('.sb-tools')).toBeVisible();
    await list.getByRole('link', { name: 'Calcular IVA' }).click();
    await expect(page).toHaveURL(/\/es\/calculadora-iva$/);
  });

  test('works in English with the alternate pointing to the Spanish page', async ({ page }) => {
    await page.goto('/en/random');
    await expect(page.locator('h1')).toHaveText('Random picker and draw tools');
    await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute(
      'href',
      /\/es\/azar$/,
    );
  });

  test('the home catalog headings open the category pages', async ({ page }) => {
    await page.goto('/en');
    await page.locator('.catalog').getByRole('link', { name: 'Reference', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/reference$/);
    await expect(page.locator('h1')).toHaveText('Developer cheat sheets');
  });

  test('a tool breadcrumb links to its category', async ({ page }) => {
    await page.goto('/es/validador-iban');
    await page.locator('.crumbs').getByRole('link', { name: 'Identificadores' }).click();
    await expect(page).toHaveURL(/\/es\/identificadores$/);
    await expect(page.locator('h1')).toHaveText('Validar DNI, NIE, CIF, IBAN y otros códigos');
  });

  test('a tool page ends with links to related tools', async ({ page }) => {
    await page.goto('/es/calculadora-iva');
    const related = page.getByRole('list', { name: 'Herramientas relacionadas' });
    await expect(related.getByRole('link')).toHaveCount(3);
    await related.getByRole('link', { name: 'Calculadora de retención de IRPF' }).click();
    await expect(page).toHaveURL(/\/es\/calculadora-retencion-irpf$/);
  });
});

test.describe('home and search', () => {
  test.beforeEach(async ({ page }) => skipBoot(page));

  test('home h1 states the search intent and keeps the question as the headline', async ({
    page,
  }) => {
    await page.goto('/en');
    await expect(page.locator('h1')).toHaveText('Developer tools online');
    await expect(page.locator('.front-q')).toHaveText('What do you need today?');
    await page.goto('/es');
    await expect(page.locator('h1')).toHaveText('Herramientas para programadores online');
  });

  test('lists every tool in the catalog', async ({ page }) => {
    await page.goto('/es');
    const catalog = page.locator('.catalog');
    await expect(catalog.getByRole('link', { name: 'JSON', exact: true })).toBeVisible();
    await expect(catalog.getByRole('link', { name: 'UUID, ULID y NanoID' })).toBeVisible();
  });

  test('Ctrl+K finds a tool with a typo and opens it', async ({ page }) => {
    await page.goto('/es');
    // Wait for the CommandPalette island to hydrate: otherwise the shortcut can fire before
    // its listener is attached and the keypress is silently lost.
    await waitForIslands(page);
    await page.keyboard.press('Control+k');
    await page.keyboard.type('jsno');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/es\/formateador-json$/);
    await expect(page.locator('h1')).toHaveText('Formatear y validar JSON');
  });

  test('typing "/" inside a text field types it instead of opening search', async ({ page }) => {
    await page.goto('/es/formateador-json');
    const input = page.locator('#json-input');
    await input.click();
    await page.keyboard.type('/');
    await expect(input).toHaveValue('/');
    await expect(page.locator('dialog.palette')).not.toBeVisible();
  });
});

test.describe('preferences', () => {
  test.beforeEach(async ({ page }) => skipBoot(page));

  test('theme persists across reloads and client-side navigation without flashing', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        (window as unknown as { themeAtDcl: string }).themeAtDcl =
          document.documentElement.dataset.theme ?? '';
      });
    });
    await page.goto('/es');
    await page.locator('[data-theme-choice="dark"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    expect(
      await page.evaluate(() => (window as unknown as { themeAtDcl: string }).themeAtDcl),
    ).toBe('dark');
    await page.locator('.catalog').getByRole('link', { name: 'JSON', exact: true }).click();
    await expect(page).toHaveURL(/formateador-json$/);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('collapsed sidebar and current tool survive navigation', async ({ page }) => {
    await page.goto('/es/formateador-json');
    await page.locator('[data-collapse]').click();
    await expect(page.locator('html')).toHaveAttribute('data-sidebar', 'collapsed');
    await page.goto('/es');
    await page.locator('.catalog').getByRole('link', { name: 'UUID, ULID y NanoID' }).click();
    await expect(page).toHaveURL(/generador-uuid$/);
    await expect(page.locator('html')).toHaveAttribute('data-sidebar', 'collapsed');
    await expect(page.locator('#sidebar [data-tool-id="uuid"]').first()).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(page.locator('#sidebar [data-tool-id="json"]').first()).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('switching language keeps the same tool', async ({ page }) => {
    await page.goto('/es/formateador-json');
    await page.locator('[data-lang-link]').click();
    await expect(page).toHaveURL(/\/en\/json-formatter$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('works with storage blocked (private mode)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => {
      const blocked = {
        get() {
          throw new DOMException('blocked', 'SecurityError');
        },
      };
      Object.defineProperty(window, 'localStorage', blocked);
      Object.defineProperty(window, 'sessionStorage', blocked);
    });
    await page.goto('/es/formateador-json');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.locator('#json-input').fill('{"a":1}');
    await expect(page.locator('.display-code')).toContainText('"a": 1');
    await page.locator('[data-favorite]').click();
    expect(errors).toEqual([]);
  });
});

test.describe('tools', () => {
  test.beforeEach(async ({ page }) => skipBoot(page));

  test('JSON is formatted while typing and errors show the line', async ({ page }) => {
    await page.goto('/es/formateador-json');
    await page.locator('#json-input').fill('{"b":1,"a":[1,2]}');
    await expect(page.locator('.display-code')).toContainText('"b": 1');
    await page.locator('#json-input').fill('{\n  "a": 1,\n}');
    await expect(page.getByText(/Error en la línea 3/)).toBeVisible();
  });

  test('UUID generates identifiers on load', async ({ page }) => {
    await page.goto('/es/generador-uuid');
    await expect(page.locator('.display-row')).toHaveCount(5);
  });
});

test.describe('shortcuts', () => {
  test.beforeEach(async ({ page }) => skipBoot(page));

  test('single-key shortcuts can be turned off from the help dialog', async ({ page }) => {
    await page.goto('/es');
    // Wait for the ShortcutsDialog island to hydrate, for the same reason as the Ctrl+K test.
    await waitForIslands(page);
    await page.keyboard.press('?');
    const help = page.locator('dialog.help');
    await expect(help).toBeVisible();
    await help.getByRole('switch').uncheck();
    await page.keyboard.press('Escape');
    await page.keyboard.press('/');
    await expect(page.locator('dialog.palette')).not.toBeVisible();
    await page.keyboard.press('Control+k');
    await expect(page.locator('dialog.palette')).toBeVisible();
  });

  test('shortcut hints read ⌘ K on a Mac', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' });
      Object.defineProperty(navigator, 'userAgentData', { get: () => ({ platform: 'macOS' }) });
    });
    await page.goto('/es/probador-regex');
    await waitForIslands(page);
    await expect(page.locator('.sb-search kbd')).toHaveText('⌘ K');
    await page.keyboard.press('?');
    await expect(page.locator('dialog.help kbd').first()).toHaveText('⌘ K');
  });

  test('pressing "c" outside a field copies the main result', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/es/formateador-json');
    await page.locator('#json-input').fill('{"a":1}');
    // Wait for the formatted output before pressing the shortcut: it proves the JSON island
    // has hydrated, so the copy button's click handler is actually wired up by then.
    await expect(page.locator('.display-code')).toContainText('"a": 1');
    // Move focus out of the textarea so "c" is not typed into the field.
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press('c');
    // Check the toast before the clipboard: copyText() is async, so reading the clipboard
    // right after the keypress could run before the write settles.
    await expect(page.locator('.toast')).toContainText('Copiado');
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('"a": 1');
  });

  test('pressing "2" switches to the tree tab', async ({ page }) => {
    await page.goto('/es/formateador-json');
    await page.locator('#json-input').fill('{"a":1}');
    // Same hydration guarantee as above: the tab buttons only respond once mounted.
    await expect(page.locator('.display-code')).toContainText('"a": 1');
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press('2');
    await expect(page.getByRole('radio', { name: 'Árbol' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(page.locator('.tree')).toBeVisible();
  });
});

test.describe('boot screen', () => {
  test('shows once per session in the terminal theme and any key skips it', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('devtools:theme', 'terminal'));
    await page.goto('/es');
    const boot = page.locator('#boot');
    await expect(boot).toBeVisible();
    await page.keyboard.press('Space');
    await expect(boot).toBeHidden();
    await page.reload();
    await expect(boot).toBeHidden();
  });
});
