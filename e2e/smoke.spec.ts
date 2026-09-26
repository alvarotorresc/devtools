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

test.describe('routing', () => {
  test('root redirects to the browser language', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'en-US' });
    const page = await ctx.newPage();
    await page.route('**/analytics.alvarotc.com/**', (r) => r.abort());
    await skipBoot(page);
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
    await ctx.close();
  });

  test('old #hash links land on the new tool page', async ({ page }) => {
    await skipBoot(page);
    await page.goto('/#json');
    await expect(page).toHaveURL(/\/es\/formateador-json$/);
  });

  test('old links to migrated tools land on the new page', async ({ page }) => {
    await skipBoot(page);
    await page.goto('/#number-base');
    await expect(page).toHaveURL(/\/es\/conversor-bases-numericas$/);
  });

  test('old links to unknown tools land on the home page', async ({ page }) => {
    await skipBoot(page);
    await page.goto('/#no-existe');
    await expect(page).toHaveURL(/\/es$/);
  });
});

test.describe('home and search', () => {
  test.beforeEach(async ({ page }) => skipBoot(page));

  test('lists every tool in the catalog', async ({ page }) => {
    await page.goto('/es');
    const catalog = page.locator('.catalog');
    await expect(catalog.getByRole('link', { name: 'JSON' })).toBeVisible();
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
    await expect(page.locator('h1')).toHaveText('JSON');
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
    await page.locator('.catalog').getByRole('link', { name: 'JSON' }).click();
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
