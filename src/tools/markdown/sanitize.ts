import DOMPurify from 'dompurify';

export const BLOCKED_CLASS = 'md-blocked';

export const PURIFY_CONFIG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['style', 'form', 'button', 'textarea', 'select', 'iframe', 'object', 'embed'],
};

export interface Sanitized {
  html: string;
  /** External images that lost their `src` because loading them is off. */
  blocked: number;
}

let loadExternal = false;
let blocked = 0;
let hooked = false;

const EXTERNAL = /^(?:https?:)?\/\//i;

function afterSanitizeAttributes(node: Element): void {
  const tag = node.nodeName;
  if (tag === 'A' && node.hasAttribute('href')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer nofollow');
  } else if (tag === 'INPUT') {
    // Only GFM task-list checkboxes survive, and never as working controls.
    if (node.getAttribute('type') !== 'checkbox') node.remove();
    else node.setAttribute('disabled', '');
  } else if (tag === 'IMG' && !loadExternal) {
    const src = node.getAttribute('src') ?? '';
    if (EXTERNAL.test(src.trim())) {
      node.removeAttribute('src');
      node.removeAttribute('srcset');
      node.classList.add(BLOCKED_CLASS);
      blocked++;
    }
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
