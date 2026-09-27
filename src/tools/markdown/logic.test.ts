import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './logic';
import { sanitize } from './sanitize';

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
