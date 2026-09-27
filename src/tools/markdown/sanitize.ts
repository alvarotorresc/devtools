import DOMPurify from 'dompurify';

export const BLOCKED_CLASS = 'md-blocked';

export const PURIFY_CONFIG = {
  USE_PROFILES: { html: true },
  // video/audio/source/picture/track and the style/srcset/sizes/poster/background attributes all
  // fetch a URL on their own, bypassing the src-only check in afterSanitizeAttributes below: an
  // <img srcset>, a <picture><source srcset>, a <video poster>, an inline `style="background:
  // url(...)"` or a legacy `background=` on <table> would otherwise leak a request to whatever
  // origin is embedded before "Load external images" is ever turned on. img itself stays allowed
  // so the existing hook can still gate it behind that toggle.
  FORBID_TAGS: [
    'style',
    'form',
    'button',
    'textarea',
    'select',
    'iframe',
    'object',
    'embed',
    'video',
    'audio',
    'source',
    'picture',
    'track',
    // AppLayout.astro's global keydown handler bails out of every single-key shortcut (c, 1-9,
    // /, ?) whenever `document.querySelector('dialog[open]')` matches anywhere in the page — a
    // pasted `<dialog open>` would otherwise silently disable them for the rest of the session.
    'dialog',
  ],
  // `id` goes entirely: a duplicate `id="markdown-input"` could redress the preview. `class`
  // survives on <code>/<pre> only, filtered down to `language-*` tokens by the
  // uponSanitizeAttribute hook below, so GFM's fenced-code-block class keeps working; every other
  // tag/token loses `class` so pasted Markdown can't borrow the site's own CSS (`panel`,
  // `display`, …) to redress the preview. `popover`/`popovertarget` let a pasted element pop over
  // the rest of the page without needing the already-forbidden `dialog`; `name` lets a pasted `<a>`
  // or `<img>` shadow a global by name (the classic `name="location"` or `name="getElementById"`).
  FORBID_ATTR: [
    'style',
    'srcset',
    'sizes',
    'poster',
    'background',
    'id',
    'popover',
    'popovertarget',
    'name',
  ],
  // Pasted Markdown could otherwise carry a `data-copy-main`, `data-favorite` or `data-tabs-main`
  // attribute and hijack the site's global shortcuts/click handlers, which match on those
  // attributes anywhere in the document (see AppLayout.astro / ToolShell.astro). GFM output never
  // needs a data-* attribute.
  ALLOW_DATA_ATTR: false,
};

export interface Sanitized {
  html: string;
  /** External images that lost their `src` because loading them is off. */
  blocked: number;
}

let loadExternal = false;
let blocked = 0;
let hooked = false;

/**
 * True when `src`, resolved against `baseURI`, is neither a `data:` URI nor same-origin. A plain
 * scheme/host string check (the previous `EXTERNAL` regex) misses forms the URL parser still
 * resolves as absolute and cross-origin: backslashes act as slashes for special schemes
 * (`https:\\example.com`, `\\example.com`, `/\example.com`) and a scheme-relative `http:host`
 * differs from the page's own scheme. Pure (no DOM) so every bypass form can be unit-tested.
 * Anything the URL parser rejects fails closed as external: a string a browser could not resolve
 * either could never load, so treating it as safe would be the wrong default.
 */
export function isExternalSrc(src: string, baseURI: string): boolean {
  try {
    const base = new URL(baseURI);
    const resolved = new URL(src, base);
    return resolved.protocol !== 'data:' && resolved.origin !== base.origin;
  } catch {
    return true;
  }
}

const LANGUAGE_CLASS = /^language-[\w-]+$/;

/**
 * What a `class` attribute on `tag` becomes after sanitising. Only `<code>`/`<pre>` keep it, and
 * only the `language-*` token GFM fenced code blocks produce (see `renderMarkdown`'s output):
 * every other tag, and every other token, is dropped so pasted Markdown can't borrow the site's
 * own CSS classes (`panel`, `display`, …) to redress the preview. `null` means "drop the
 * attribute entirely". Pure so both cases (kept and dropped) can be unit-tested without a DOM.
 */
export function keptClassValue(tag: string, value: string): string | null {
  if (tag !== 'CODE' && tag !== 'PRE') return null;
  const kept = value.split(/\s+/).filter((token) => LANGUAGE_CLASS.test(token));
  return kept.length > 0 ? kept.join(' ') : null;
}

function uponSanitizeAttribute(
  node: Element,
  data: { attrName: string; attrValue: string; keepAttr: boolean },
): void {
  if (data.attrName !== 'class') return;
  const kept = keptClassValue(node.nodeName, data.attrValue);
  if (kept === null) data.keepAttr = false;
  else data.attrValue = kept;
}

function afterSanitizeAttributes(node: Element): void {
  const tag = node.nodeName;
  if ((tag === 'A' || tag === 'AREA') && node.hasAttribute('href')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer nofollow');
  } else if (tag === 'INPUT') {
    // Only GFM task-list checkboxes survive, and never as working controls.
    if (node.getAttribute('type') !== 'checkbox') node.remove();
    else node.setAttribute('disabled', '');
  } else if (tag === 'IMG') {
    const src = node.getAttribute('src') ?? '';
    if (!src || !isExternalSrc(src, document.baseURI)) return;
    if (loadExternal) {
      // Loading is allowed, but the remote origin still should not learn this page requested it.
      node.setAttribute('referrerpolicy', 'no-referrer');
      return;
    }
    node.removeAttribute('src');
    node.removeAttribute('srcset');
    node.classList.add(BLOCKED_CLASS);
    blocked++;
  }
}

/**
 * Browser only. Without a DOM (SSR, Vitest's node environment) DOMPurify would hand the input
 * back untouched, so this fails closed and returns nothing.
 */
export function sanitize(dirty: string, opts: { externalImages: boolean }): Sanitized {
  if (!DOMPurify.isSupported) return { html: '', blocked: 0 };
  if (!hooked) {
    DOMPurify.addHook('afterSanitizeAttributes', afterSanitizeAttributes);
    DOMPurify.addHook('uponSanitizeAttribute', uponSanitizeAttribute);
    hooked = true;
  }
  loadExternal = opts.externalImages;
  blocked = 0;
  const html = DOMPurify.sanitize(dirty, PURIFY_CONFIG);
  return { html, blocked };
}
