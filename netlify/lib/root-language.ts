// Which home page "/" sends a visitor to. Kept apart from the edge function so
// vitest can test it (every file in netlify/edge-functions is deployed).

export type RootLocale = 'es' | 'en';

const isRootLocale = (x: string): x is RootLocale => x === 'es' || x === 'en';

function cookieLocale(cookie: string | null): RootLocale | null {
  const value =
    cookie
      ?.match(/(?:^|;\s*)nf_lang=([^;]*)/)?.[1]
      ?.trim()
      .toLowerCase() ?? '';
  return isRootLocale(value) ? value : null;
}

// Accept-Language by preference: highest q first, header order on ties, q=0
// means "not this one". The first es or en wins.
function headerLocale(header: string | null): RootLocale | null {
  const langs = (header ?? '')
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      const weight = q ? Number(q.slice(2)) : 1;
      return {
        base: tag.trim().toLowerCase().split('-')[0],
        q: Number.isFinite(weight) ? weight : 0,
        index,
      };
    })
    .filter((l) => l.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  return langs.map((l) => l.base).find(isRootLocale) ?? null;
}

/** The nf_lang cookie first, then Accept-Language, then English (Googlebot too). */
export function rootLocale(cookie: string | null, acceptLanguage: string | null): RootLocale {
  return cookieLocale(cookie) ?? headerLocale(acceptLanguage) ?? 'en';
}

/**
 * The 302 for "/". It depends on headers of the request, so no cache may keep
 * it: Netlify's _redirects Language rules were cached at the edge and served
 * one visitor's language to the next.
 */
export function rootRedirect(request: Request): Response {
  const url = new URL(request.url);
  const locale = rootLocale(request.headers.get('cookie'), request.headers.get('accept-language'));
  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(`/${locale}${url.search}`, url).href,
      'Cache-Control': 'private, no-store',
      'Netlify-CDN-Cache-Control': 'no-store',
      Vary: 'Accept-Language, Cookie',
    },
  });
}
