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
  ],
  // id/class also go: a duplicate `id="markdown-input"` or a class borrowed from the site's own
  // stylesheet (`panel`, `display`, …) could redress the preview to look like part of the chrome
  // around it. GFM output never needs either.
  FORBID_ATTR: ['style', 'srcset', 'sizes', 'poster', 'background', 'id', 'class'],
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
    hooked = true;
  }
  loadExternal = opts.externalImages;
  blocked = 0;
  const html = DOMPurify.sanitize(dirty, PURIFY_CONFIG);
  return { html, blocked };
}
