import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './logic';
import { isExternalSrc, PURIFY_CONFIG, sanitize } from './sanitize';

const BASE = 'https://devtools.test/es/vista-previa-markdown';

describe('renderMarkdown (GFM)', () => {
  it('renders headings and inline marks', () => {
    expect(renderMarkdown('# Hola\n\nTexto **fuerte** y `code`')).toBe(
      '<h1>Hola</h1>\n<p>Texto <strong>fuerte</strong> y <code>code</code></p>\n',
    );
  });

  it('renders GFM tables with alignment', () => {
    const html = renderMarkdown('| a | b |\n|---|:-:|\n| 1 | 2 |');
    expect(html).toContain('<table>');
    expect(html).toContain('<th align="center">b</th>');
    expect(html).toContain('<td>1</td>');
  });

  it('renders task lists as checkboxes', () => {
    const html = renderMarkdown('- [x] hecho\n- [ ] pendiente');
    expect(html).toContain('<li><input checked="" disabled="" type="checkbox"> hecho</li>');
    expect(html).toContain('<li><input disabled="" type="checkbox"> pendiente</li>');
  });

  it('escapes code blocks and keeps the language class', () => {
    expect(renderMarkdown('```js\nconst a = 1 < 2;\n```')).toBe(
      '<pre><code class="language-js">const a = 1 &lt; 2;\n</code></pre>\n',
    );
  });

  it('autolinks bare URLs and supports strikethrough', () => {
    expect(renderMarkdown('Ver https://example.com y ~~no~~')).toBe(
      '<p>Ver <a href="https://example.com">https://example.com</a> y <del>no</del></p>\n',
    );
  });

  it('does not treat single line breaks as <br> (breaks: false)', () => {
    expect(renderMarkdown('uno\ndos')).toBe('<p>uno\ndos</p>\n');
  });

  it('leaves raw HTML in place: that is why the output is never shown unsanitised', () => {
    expect(renderMarkdown('<script>alert(1)</script>')).toContain('<script>');
  });
});

describe('sanitize without a DOM', () => {
  it('fails closed: returns nothing instead of the dirty HTML', () => {
    expect(
      sanitize('<img src=x onerror="alert(1)"><script>alert(1)</script>', {
        externalImages: false,
      }),
    ).toEqual({ html: '', blocked: 0 });
  });
});

describe('PURIFY_CONFIG closes resource-loading vectors beyond plain <img src>', () => {
  // Vitest runs in `node` with no DOM (see above), so DOMPurify itself cannot be exercised here:
  // the actual sanitised output for these vectors is verified live in the Step 11 browser check
  // and Task 14's e2e. Each vector below was confirmed, with "Load external images" off, to still
  // fire a request to an external origin before FORBID_TAGS/FORBID_ATTR were extended to cover it;
  // these tests pin the config that keeps that request from ever happening again.

  it('blocks `<img srcset="...">` (no plain src, so the src-only hook never sees it)', () => {
    expect(PURIFY_CONFIG.FORBID_ATTR).toContain('srcset');
  });

  it('blocks `<picture><source srcset="..."></picture>`', () => {
    expect(PURIFY_CONFIG.FORBID_TAGS).toContain('picture');
    expect(PURIFY_CONFIG.FORBID_TAGS).toContain('source');
    expect(PURIFY_CONFIG.FORBID_ATTR).toContain('srcset');
  });

  it('blocks `<video poster="...">`', () => {
    expect(PURIFY_CONFIG.FORBID_TAGS).toContain('video');
    expect(PURIFY_CONFIG.FORBID_ATTR).toContain('poster');
  });

  it('blocks inline `style="background:url(...)"`', () => {
    expect(PURIFY_CONFIG.FORBID_ATTR).toContain('style');
  });

  it('blocks the legacy `<table background="...">`', () => {
    expect(PURIFY_CONFIG.FORBID_ATTR).toContain('background');
  });

  it('also forbids audio and track, the remaining media tags with the same attributes', () => {
    expect(PURIFY_CONFIG.FORBID_TAGS).toContain('audio');
    expect(PURIFY_CONFIG.FORBID_TAGS).toContain('track');
  });

  it("strips id and class (UI redress with the site's own classes)", () => {
    expect(PURIFY_CONFIG.FORBID_ATTR).toContain('id');
    expect(PURIFY_CONFIG.FORBID_ATTR).toContain('class');
  });

  it('disables data-* attributes (they can carry data-copy-main, data-favorite, data-tabs-main)', () => {
    expect(PURIFY_CONFIG.ALLOW_DATA_ATTR).toBe(false);
  });
});

describe('isExternalSrc (external-image gate, resolved against a base URL)', () => {
  // Second review round: a plain scheme/host regex (`/^(?:https?:)?\/\//i`) missed every form
  // below. Each one was confirmed live, with "Load external images" off, to still fetch
  // example.com before the gate was rewritten to resolve the URL instead of pattern-matching it.

  it('blocks `https:\\\\example.com/…` (backslashes act as slashes for special schemes)', () => {
    expect(isExternalSrc('https:\\\\example.com/1.png', BASE)).toBe(true);
  });

  it('blocks `\\\\example.com/…` (protocol-relative, backslash form)', () => {
    expect(isExternalSrc('\\\\example.com/2.png', BASE)).toBe(true);
  });

  it('blocks `/\\example.com/…` (leading slash + backslash)', () => {
    expect(isExternalSrc('/\\example.com/3.png', BASE)).toBe(true);
  });

  it('blocks `http:\\\\example.com/…`', () => {
    expect(isExternalSrc('http:\\\\example.com/4.png', BASE)).toBe(true);
  });

  it('blocks `http:example.com/x` (scheme-relative, resolves absolute on an https page)', () => {
    expect(isExternalSrc('http:example.com/x', BASE)).toBe(true);
  });

  it('blocks a plain `https://example.com/...` URL', () => {
    expect(isExternalSrc('https://example.com/a.png', BASE)).toBe(true);
  });

  it('blocks a protocol-relative `//example.com/...` URL', () => {
    expect(isExternalSrc('//example.com/a.png', BASE)).toBe(true);
  });

  it('allows a same-origin absolute URL', () => {
    expect(isExternalSrc('https://devtools.test/self.png', BASE)).toBe(false);
  });

  it('allows a root-relative path (resolves same-origin)', () => {
    expect(isExternalSrc('/images/logo.png', BASE)).toBe(false);
  });

  it('allows a bare relative path (resolves same-origin)', () => {
    expect(isExternalSrc('logo.png', BASE)).toBe(false);
  });

  it('allows a data: URI regardless of origin', () => {
    expect(isExternalSrc('data:image/png;base64,AAAA', BASE)).toBe(false);
  });

  it('fails closed (treated as external) when the URL cannot be resolved', () => {
    expect(isExternalSrc('http://', BASE)).toBe(true);
    expect(isExternalSrc('http://a b.com/x', BASE)).toBe(true);
  });
});
